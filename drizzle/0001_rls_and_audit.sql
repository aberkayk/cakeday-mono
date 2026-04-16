-- ============================================================================
-- 0001_rls_and_audit.sql
-- Row-Level Security policies + Audit log trigger
-- ============================================================================

-- ─── Helper: get current user role from users table ─────────────────────────

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;

-- ─── Helper: get current user's company_id ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM companies WHERE user_id = auth.uid();
$$;

-- ─── Helper: get current user's supplier_id ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_current_supplier_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM suppliers WHERE user_id = auth.uid();
$$;

-- ============================================================================
-- AUDIT LOG TRIGGER
-- Automatically records INSERT/UPDATE/DELETE into audit_log.
-- Uses auth.uid() for actor_id (Supabase session context).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid;
  _actor_role user_role;
  _record_id uuid;
  _before jsonb;
  _after jsonb;
BEGIN
  -- Get current Supabase user (NULL for service-role / cron)
  _actor_id := auth.uid();

  -- Get actor's role if available
  IF _actor_id IS NOT NULL THEN
    SELECT role INTO _actor_role FROM users WHERE id = _actor_id;
  END IF;

  -- Determine record_id and before/after payloads
  IF TG_OP = 'DELETE' THEN
    _record_id := OLD.id;
    _before := to_jsonb(OLD);
    _after := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    _record_id := NEW.id;
    _before := NULL;
    _after := to_jsonb(NEW);
  ELSE -- UPDATE
    _record_id := NEW.id;
    _before := to_jsonb(OLD);
    _after := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_log (actor_id, actor_role, table_name, record_id, action, before_data, after_data)
  VALUES (_actor_id, _actor_role, TG_TABLE_NAME, _record_id, TG_OP, _before, _after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach audit trigger to business tables (skip high-volume append-only tables)
--> statement-breakpoint
CREATE TRIGGER trg_audit_companies
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_suppliers
  AFTER INSERT OR UPDATE OR DELETE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_ordering_rules
  AFTER INSERT OR UPDATE OR DELETE ON ordering_rules
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_product_prices
  AFTER INSERT OR UPDATE OR DELETE ON product_prices
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_subscription_plans
  AFTER INSERT OR UPDATE OR DELETE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_system_settings
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_hr_integrations
  AFTER INSERT OR UPDATE OR DELETE ON hr_integrations
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();
--> statement-breakpoint
CREATE TRIGGER trg_audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION fn_audit_event();

-- ============================================================================
-- ORDER STATUS HISTORY AUTO-WRITER
-- When orders.status changes, auto-insert into order_status_history.
-- This is the schema invariant #9 from follow-ups — bypass-proof.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_order_status_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id uuid;
  _actor_role user_role;
BEGIN
  -- Only fire on actual status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  _actor_id := auth.uid();
  IF _actor_id IS NOT NULL THEN
    SELECT role INTO _actor_role FROM users WHERE id = _actor_id;
  END IF;

  INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_by_role)
  VALUES (NEW.id, OLD.status, NEW.status, _actor_id, _actor_role);

  RETURN NEW;
END;
$$;

--> statement-breakpoint
CREATE TRIGGER trg_order_status_changed
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_order_status_changed();

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- Multi-tenant isolation: company users see their company's data,
-- supplier users see their supplier's data, platform_admin sees everything.
-- ============================================================================

-- ─── users ──────────────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_own ON users
  FOR ALL USING (id = auth.uid());

CREATE POLICY users_admin ON users
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── companies ──────────────────────────────────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_own ON companies
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY companies_admin ON companies
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── company_settings ───────────────────────────────────────────────────────

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_settings_own ON company_settings
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY company_settings_admin ON company_settings
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── contacts (shared ref — accessible by owner entities) ───────────────────

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Company users can see their company's contact
CREATE POLICY contacts_company ON contacts
  FOR ALL USING (
    id IN (SELECT contact_id FROM companies WHERE user_id = auth.uid())
  );

-- Supplier users can see their supplier's contact
CREATE POLICY contacts_supplier ON contacts
  FOR ALL USING (
    id IN (SELECT contact_id FROM suppliers WHERE user_id = auth.uid())
  );

CREATE POLICY contacts_admin ON contacts
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── addresses (shared ref — accessible by owner entities) ──────────────────

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can see their own address
CREATE POLICY addresses_own_user ON addresses
  FOR ALL USING (
    id IN (SELECT address_id FROM users WHERE id = auth.uid())
  );

-- Company users can see their company's address
CREATE POLICY addresses_company ON addresses
  FOR ALL USING (
    id IN (SELECT address_id FROM companies WHERE user_id = auth.uid())
  );

-- Supplier users can see their supplier's address
CREATE POLICY addresses_supplier ON addresses
  FOR ALL USING (
    id IN (SELECT address_id FROM suppliers WHERE user_id = auth.uid())
  );

CREATE POLICY addresses_admin ON addresses
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── suppliers ──────────────────────────────────────────────────────────────

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY suppliers_own ON suppliers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY suppliers_admin ON suppliers
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── employees ──────────────────────────────────────────────────────────────

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY employees_company ON employees
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY employees_admin ON employees
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── ordering_rules ─────────────────────────────────────────────────────────

ALTER TABLE ordering_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY ordering_rules_company ON ordering_rules
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY ordering_rules_admin ON ordering_rules
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── orders ─────────────────────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Company users see their orders
CREATE POLICY orders_company ON orders
  FOR ALL USING (company_id = get_current_company_id());

-- Supplier users see orders assigned to them
CREATE POLICY orders_supplier ON orders
  FOR ALL USING (supplier_id = get_current_supplier_id());

CREATE POLICY orders_admin ON orders
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── order_status_history ───────────────────────────────────────────────────

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY osh_company ON order_status_history
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE company_id = get_current_company_id())
  );

CREATE POLICY osh_supplier ON order_status_history
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE supplier_id = get_current_supplier_id())
  );

CREATE POLICY osh_admin ON order_status_history
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── invoices ───────────────────────────────────────────────────────────────

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoices_company ON invoices
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY invoices_admin ON invoices
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── invoice_line_items ─────────────────────────────────────────────────────

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY ili_company ON invoice_line_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE company_id = get_current_company_id())
  );

CREATE POLICY ili_admin ON invoice_line_items
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── payments ───────────────────────────────────────────────────────────────

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_company ON payments
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY payments_admin ON payments
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── hr_integrations ────────────────────────────────────────────────────────

ALTER TABLE hr_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY hr_integrations_company ON hr_integrations
  FOR ALL USING (company_id = get_current_company_id());

CREATE POLICY hr_integrations_admin ON hr_integrations
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── hr_sync_logs ───────────────────────────────────────────────────────────

ALTER TABLE hr_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY hr_sync_logs_company ON hr_sync_logs
  FOR ALL USING (
    integration_id IN (SELECT id FROM hr_integrations WHERE company_id = get_current_company_id())
  );

CREATE POLICY hr_sync_logs_admin ON hr_sync_logs
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── notification_log ───────────────────────────────────────────────────────

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users see notifications addressed to them
CREATE POLICY notif_log_recipient ON notification_log
  FOR SELECT USING (recipient_user_id = auth.uid());

-- Company users see company notifications
CREATE POLICY notif_log_company ON notification_log
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY notif_log_admin ON notification_log
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── notification_preferences ───────────────────────────────────────────────

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notif_prefs_own ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY notif_prefs_admin ON notification_preferences
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── product_types (read-only for non-admin) ────────────────────────────────

ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_types_read ON product_types
  FOR SELECT USING (true);

CREATE POLICY product_types_write ON product_types
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── product_prices (read-only for non-admin) ──────────────────────────────

ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_prices_read ON product_prices
  FOR SELECT USING (true);

CREATE POLICY product_prices_write ON product_prices
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── price_change_requests ──────────────────────────────────────────────────

ALTER TABLE price_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY pcr_supplier ON price_change_requests
  FOR ALL USING (supplier_id = get_current_supplier_id());

CREATE POLICY pcr_admin ON price_change_requests
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── subscription_plans (read-only for all, write for admin) ────────────────

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_plans_read ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY subscription_plans_write ON subscription_plans
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── districts (read-only for all) ─────────────────────────────────────────

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY districts_read ON districts
  FOR SELECT USING (true);

CREATE POLICY districts_write ON districts
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── notification_templates (read-only for all, write for admin) ────────────

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_templates_read ON notification_templates
  FOR SELECT USING (true);

CREATE POLICY notification_templates_write ON notification_templates
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── public_holidays (read-only for all) ────────────────────────────────────

ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_holidays_read ON public_holidays
  FOR SELECT USING (true);

CREATE POLICY public_holidays_write ON public_holidays
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── system_settings (admin-only) ──────────────────────────────────────────

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_settings_admin ON system_settings
  FOR ALL USING (get_current_user_role() = 'platform_admin');

-- ─── audit_log (admin read-only, no user writes) ───────────────────────────

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Triggers write via SECURITY DEFINER; users can only read their own trail
CREATE POLICY audit_log_own ON audit_log
  FOR SELECT USING (actor_id = auth.uid());

CREATE POLICY audit_log_admin ON audit_log
  FOR SELECT USING (get_current_user_role() = 'platform_admin');
