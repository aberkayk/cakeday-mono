# Database Schema — CakeDay

> **This file is the single source of truth for the PostgreSQL database schema.**
> All agents reference this file before writing Drizzle ORM schema code or database migrations.

**Database:** PostgreSQL via Supabase
**ORM:** Drizzle ORM
**Auth:** Supabase Auth (`auth.users` → `public.profiles`)
**Last Updated:** 2026-03-31

---

## Table of Contents

1. [ER Diagram](#1-er-diagram)
2. [Enum Types](#2-enum-types)
3. [Table Definitions](#3-table-definitions)
   - [Auth / Identity](#31-auth--identity)
   - [Core Platform](#32-core-platform)
   - [Employees](#33-employees)
   - [Ordering Rules](#34-ordering-rules)
   - [Orders](#35-orders)
   - [Bakeries](#36-bakeries)
   - [Cake Catalogue & Pricing](#37-cake-catalogue--pricing)
   - [Payments & Billing](#38-payments--billing)
   - [HR Integrations](#39-hr-integrations)
   - [Notifications](#310-notifications)
   - [System & Config](#311-system--config)
   - [Audit](#312-audit)
4. [Indexes](#4-indexes)
5. [Foreign Keys Summary](#5-foreign-keys-summary)
6. [Row-Level Security (RLS) Notes](#6-row-level-security-rls-notes)
7. [Migration Strategy](#7-migration-strategy)
8. [Seed Data Recommendations](#8-seed-data-recommendations)
9. [Supabase Auth Integration Notes](#9-supabase-auth-integration-notes)

---

## 1. ER Diagram

```
auth.users (Supabase managed)
    │
    └── profiles (1:1)
            │
            ├── company_memberships (N) ──── companies (1)
            │                                    │
            │                          ┌─────────┼──────────────────┐
            │                          │         │                  │
            │                     employees    ordering_rules    company_settings
            │                          │         │
            │                          │         └── cake_types (M:1)
            │                          │
            │                    orders (generated from rules or ad-hoc)
            │                          │
            │                    ┌─────┼──────────────┐
            │                    │     │              │
            │              bakeries  cake_types   payments
            │                    │
            │             bakery_districts ──── districts
            │
            └── profiles (bakery_admin role) ─── bakeries (1:1 via bakery_profiles)

subscription_plans ──── companies (M:1)
cake_types ──── cake_prices (1:N, per size)
cake_types ──── price_change_requests (bakery → admin)
bakeries   ──── price_change_requests

invoices ──── companies
invoices ──── invoice_line_items ──── orders

notification_log ──── companies / orders / employees
hr_integrations ──── companies
hr_sync_logs ──── hr_integrations

audit_log (global)
system_settings (global key-value)
public_holidays (calendar)
```

---

## 2. Enum Types

All enums are created as PostgreSQL `TYPE` definitions to enforce data integrity at the database level.

```sql
-- User role within the platform (across all portal types)
CREATE TYPE user_role AS ENUM (
  'company_owner',    -- Full access to company account including billing and user management
  'hr_manager',       -- Employee management and ordering; no billing or user admin
  'finance',          -- Billing and invoices only; read-only orders
  'viewer',           -- Read-only access to all company data
  'bakery_admin',     -- Bakery portal access
  'platform_admin'    -- Admin dashboard; full platform access
);

-- Company account lifecycle status
CREATE TYPE company_status AS ENUM (
  'pending_verification',  -- Email not yet verified
  'pending_approval',      -- Verified but awaiting admin approval (optional flow)
  'active',                -- Fully operational
  'suspended',             -- Temporarily disabled (e.g., payment failure)
  'deactivated'            -- Permanently closed
);

-- Employee record status
CREATE TYPE employee_status AS ENUM (
  'active',    -- Eligible for automated orders
  'inactive'   -- Excluded from all automated ordering
);

-- Source of employee data
CREATE TYPE employee_source AS ENUM (
  'manual',     -- Entered directly by HR manager
  'csv',        -- Imported via CSV upload
  'bamboohr',   -- Synced from BambooHR integration
  'kolayik'     -- Synced from KolayIK integration
);

-- Supported delivery districts (MVP: Istanbul only)
CREATE TYPE district AS ENUM (
  'besiktas',
  'sariyer'
);

-- Rule type determines which employees generate automatic orders
CREATE TYPE rule_type AS ENUM (
  'all_birthdays',     -- Every employee birthday triggers an order
  'round_birthdays',   -- Only milestone ages (configurable) trigger orders
  'work_anniversary'   -- Employee tenure milestones trigger orders
);

-- Cake sizes available on the platform
CREATE TYPE cake_size AS ENUM (
  'small',   -- ~500g
  'medium',  -- ~1000g
  'large'    -- ~1500g
);

-- Full lifecycle of an order
CREATE TYPE order_status AS ENUM (
  'draft',                 -- Created by scheduling job, not yet confirmed
  'pending_approval',      -- Awaiting HR manager approval (if approval workflow enabled)
  'confirmed',             -- Approved and queued; not yet sent to bakery
  'assigned',              -- Sent to a specific bakery; awaiting acceptance
  'accepted',              -- Bakery has accepted the order
  'preparing',             -- Bakery is preparing the cake
  'out_for_delivery',      -- Cake is in transit
  'delivered',             -- Confirmed delivered
  'cancellation_requested',-- Customer requested cancel after bakery accepted
  'cancelled',             -- Order cancelled (any stage before delivery)
  'failed',                -- Delivery attempted but failed
  'rejected'               -- Bakery rejected the order (triggers reassignment)
);

-- How an order was created
CREATE TYPE order_type AS ENUM (
  'automatic',  -- Generated by the scheduling job from an ordering rule
  'ad_hoc'      -- Placed manually by an HR manager
);

-- Bakery operational status
CREATE TYPE bakery_status AS ENUM (
  'pending_setup',  -- Invitation sent, bakery hasn't completed profile
  'active',         -- Accepting orders
  'inactive',       -- Temporarily not accepting orders
  'suspended'       -- Disabled by platform admin
);

-- Payment methods supported
CREATE TYPE payment_method AS ENUM (
  'credit_card',      -- iyzico tokenised card charge
  'monthly_invoice'   -- End-of-month invoice (enterprise only)
);

-- Billing cycle for subscriptions
CREATE TYPE billing_cycle AS ENUM (
  'monthly',
  'annual'
);

-- Payment / invoice record status
CREATE TYPE payment_status AS ENUM (
  'pending',    -- Charge initiated but not yet settled
  'succeeded',  -- Payment confirmed
  'failed',     -- Payment attempt failed
  'refunded',   -- Full refund issued
  'partially_refunded',
  'void'        -- Invoice voided before payment
);

-- Price change request lifecycle
CREATE TYPE price_request_status AS ENUM (
  'pending',   -- Submitted by bakery, awaiting admin action
  'approved',  -- Admin approved; price effective on effective_date
  'rejected'   -- Admin rejected
);

-- HR integration types
CREATE TYPE integration_type AS ENUM (
  'bamboohr',
  'kolayik'
);

-- Notification channel
CREATE TYPE notification_channel AS ENUM (
  'email',
  'whatsapp',
  'sms'
);

-- Notification delivery status
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed'
);

-- Event types that trigger notifications
CREATE TYPE notification_event AS ENUM (
  'order_draft_created',
  'order_pending_approval',
  'order_confirmed',
  'order_assigned_to_bakery',
  'order_accepted_by_bakery',
  'order_rejected_by_bakery',
  'order_out_for_delivery',
  'order_delivered',
  'order_cancelled',
  'order_failed',
  'cancellation_requested',
  'payment_failed',
  'payment_succeeded',
  'invoice_generated',
  'invoice_overdue',
  'subscription_renewal_reminder',
  'subscription_plan_changed',
  'employee_birthday_reminder',   -- 7-day advance digest
  'hr_sync_failed',
  'hr_sync_completed',
  'bakery_invitation',
  'user_invitation',
  'password_reset'
);

-- Delivery time window preference
CREATE TYPE delivery_window AS ENUM (
  'morning',    -- 09:00–12:00
  'afternoon',  -- 12:00–17:00
  'no_preference'
);
```

---

## 3. Table Definitions

### 3.1 Auth / Identity

#### `public.profiles`

Extends `auth.users` (Supabase Auth). Created automatically via a trigger when a new user signs up. Contains platform-specific user metadata that Supabase Auth does not manage.

```sql
CREATE TABLE public.profiles (
  -- Primary key mirrors auth.users.id
  id                  UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Display info
  full_name           TEXT          NOT NULL,
  phone               VARCHAR(20),  -- Turkish mobile: +90XXXXXXXXXX

  -- Platform role determines which portal(s) the user can access
  -- A user has exactly one role; multi-company membership is in company_memberships
  role                user_role     NOT NULL,

  -- WhatsApp opt-in (separate from phone; may be the same number)
  whatsapp_number     VARCHAR(20),
  whatsapp_opt_in     BOOLEAN       NOT NULL DEFAULT FALSE,

  -- Notification preferences (per-event overrides stored in notification_preferences)
  email_notifications_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_notifications_enabled  BOOLEAN NOT NULL DEFAULT FALSE,

  -- For bakery_admin users: link to their bakery record
  -- NULL for company users and platform_admin
  bakery_id           UUID          REFERENCES bakeries(id) ON DELETE SET NULL,

  -- Onboarding state (used to show/resume wizard for new company users)
  onboarding_completed  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Soft timestamps
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.company_memberships`

Maps company users to companies with a specific role. A user can only belong to one company (B2B model), but this table makes the relationship explicit and supports future edge cases.

```sql
CREATE TABLE public.company_memberships (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id      UUID          NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Role within this company (subset of user_role: company_owner, hr_manager, finance, viewer)
  role            user_role     NOT NULL,

  -- Invitation tracking
  invited_by      UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  invitation_token        VARCHAR(128) UNIQUE,  -- NULL once accepted
  invitation_expires_at   TIMESTAMPTZ,          -- 72h TTL
  invitation_accepted_at  TIMESTAMPTZ,

  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Each user belongs to at most one company
  CONSTRAINT uq_company_memberships_user UNIQUE (user_id)
);
```

---

### 3.2 Core Platform

#### `public.subscription_plans`

Platform-managed catalogue of available subscription tiers. Managed exclusively by platform admins.

```sql
CREATE TABLE public.subscription_plans (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(100)  NOT NULL,          -- e.g. "Starter", "Growth", "Enterprise"
  slug                  VARCHAR(50)   NOT NULL UNIQUE,   -- e.g. "starter", "growth"

  price_monthly_try     NUMERIC(10,2) NOT NULL,          -- Monthly fee in TRY (VAT-excluded)
  price_annual_try      NUMERIC(10,2) NOT NULL,          -- Annual fee in TRY (VAT-excluded)

  -- Employee count cap; NULL = unlimited (enterprise)
  employee_limit        INTEGER,

  -- Commission rate charged per order (0.00–1.00 representing 0%–100%)
  commission_rate       NUMERIC(5,4)  NOT NULL DEFAULT 0.1000,

  -- Whether monthly invoice payment method is available on this plan
  monthly_invoice_allowed  BOOLEAN    NOT NULL DEFAULT FALSE,

  -- Feature flags stored as JSONB for flexibility
  -- e.g. {"hr_integrations": true, "custom_branding": false, "api_access": false}
  features              JSONB         NOT NULL DEFAULT '{}',

  display_order         SMALLINT      NOT NULL DEFAULT 0,  -- Sort order in UI
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.companies`

The core tenant entity. Each company has its own isolated data via RLS policies.

```sql
CREATE TABLE public.companies (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Legal identity
  name                    VARCHAR(255)  NOT NULL,
  vkn                     VARCHAR(10)   NOT NULL UNIQUE,  -- Turkish Tax ID (Vergi Kimlik No), exactly 10 digits
  sector                  VARCHAR(100),
  company_size_range      VARCHAR(50),   -- e.g. "1-10", "11-50", "51-200", "201-500", "500+"

  -- Contact
  primary_contact_name    VARCHAR(255)  NOT NULL,
  primary_contact_title   VARCHAR(100),
  primary_contact_email   VARCHAR(255)  NOT NULL,
  primary_contact_phone   VARCHAR(20)   NOT NULL,

  -- Address
  billing_address         TEXT          NOT NULL,
  billing_district        district,     -- Headquarters delivery district (MVP: must be besiktas or sariyer)

  -- Billing / e-invoice details (Turkish e-fatura / e-arşiv)
  einvoice_alias          VARCHAR(255), -- e-fatura recipient alias (if applicable)
  einvoice_type           VARCHAR(20),  -- 'e_fatura' | 'e_arsiv'
  billing_email           VARCHAR(255), -- Where invoices are sent (may differ from primary contact)

  -- Logo (stored in Supabase Storage; this is the path/URL)
  logo_url                TEXT,

  -- Subscription
  subscription_plan_id    UUID          REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  billing_cycle           billing_cycle NOT NULL DEFAULT 'monthly',
  subscription_started_at TIMESTAMPTZ,
  subscription_renews_at  TIMESTAMPTZ,
  subscription_overridden_by UUID       REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Admin who applied override

  -- Payment
  active_payment_method   payment_method,
  iyzico_customer_token   TEXT,         -- iyzico customer reference (never store raw card data)

  -- Operational config
  status                  company_status NOT NULL DEFAULT 'pending_verification',
  is_live                 BOOLEAN       NOT NULL DEFAULT FALSE,  -- Set to TRUE after onboarding wizard completion
  require_order_approval  BOOLEAN       NOT NULL DEFAULT FALSE,  -- If TRUE, draft orders need HR approval before confirming
  order_lead_time_days    SMALLINT      NOT NULL DEFAULT 60,     -- Days before birthday to generate draft order
  default_delivery_window delivery_window NOT NULL DEFAULT 'no_preference',
  default_delivery_address TEXT,        -- Pre-fill on orders; overridable per order
  default_cake_text       TEXT,         -- Fallback custom text if no template and no employee override

  -- Onboarding
  onboarding_step         SMALLINT      NOT NULL DEFAULT 1,      -- Last completed step (1–6)

  -- Admin notes (internal, not visible to company)
  admin_note              TEXT,

  -- KVKK consent
  kvkk_accepted_at        TIMESTAMPTZ,
  kvkk_accepted_ip        INET,

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_vkn_format CHECK (vkn ~ '^\d{10}$')
);
```

#### `public.company_settings`

Per-company configurable settings that may grow over time. Stored separately to avoid bloating the `companies` table.

```sql
CREATE TABLE public.company_settings (
  company_id               UUID          PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Notification preferences (per notification_event; full granularity in notification_preferences table)
  -- These are company-level defaults; individual user prefs override these
  notify_order_events_email   BOOLEAN   NOT NULL DEFAULT TRUE,
  notify_order_events_wa      BOOLEAN   NOT NULL DEFAULT FALSE,
  notify_birthday_reminder    BOOLEAN   NOT NULL DEFAULT TRUE,
  birthday_reminder_days      SMALLINT  NOT NULL DEFAULT 7,      -- Days before to send reminder

  -- Ordering behaviour
  cancellation_cutoff_hours   SMALLINT  NOT NULL DEFAULT 24,     -- Hours before delivery; after this, cancellation fee applies
  -- Cancellation fee as a percentage of order_total (0.00 = no fee, 1.00 = full charge)
  cancellation_fee_pct        NUMERIC(4,2) NOT NULL DEFAULT 0.00,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.3 Employees

#### `public.employees`

The people receiving cakes. Scoped to a company. Can originate from manual entry, CSV, or HR system sync.

```sql
CREATE TABLE public.employees (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID          NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Identity
  first_name        VARCHAR(100)  NOT NULL,
  last_name         VARCHAR(100)  NOT NULL,

  -- Key dates
  date_of_birth     DATE          NOT NULL,
  start_date        DATE,                    -- Employment start; required for work anniversary rule

  -- Organisational
  department        VARCHAR(100),
  office_location   VARCHAR(255), -- Free text work location label

  -- Delivery
  delivery_address  TEXT,         -- Overrides company default if set
  delivery_district district,     -- Derived from delivery_address; NULL means use company default

  -- Contact
  personal_email    VARCHAR(255), -- For direct birthday wish notifications to the employee
  work_email        VARCHAR(255),

  -- HR system integration
  source            employee_source NOT NULL DEFAULT 'manual',
  external_id       VARCHAR(255),  -- ID in the originating HR system (bamboohr id, kolayik id)
  hr_integration_id UUID          REFERENCES public.hr_integrations(id) ON DELETE SET NULL,
  last_synced_at    TIMESTAMPTZ,   -- Last time this record was touched by a sync job

  -- Order overrides (employee-level preferences)
  preferred_cake_type_id  UUID    REFERENCES public.cake_types(id) ON DELETE SET NULL,
  preferred_cake_size     cake_size,
  custom_message_override TEXT,   -- NULL = use rule template; '' = empty text; value = use this text
  skip_cake               BOOLEAN NOT NULL DEFAULT FALSE,  -- "Do not send cake" flag

  -- Status
  status            employee_status NOT NULL DEFAULT 'active',
  deactivated_at    TIMESTAMPTZ,
  deactivated_by    UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Prevent exact duplicates within the same company (name + DOB); warn but don't block in app logic
  CONSTRAINT chk_dob_in_past CHECK (date_of_birth < CURRENT_DATE)
);
```

---

### 3.4 Ordering Rules

#### `public.ordering_rules`

Defines automation rules that drive automatic order generation. A company can have multiple rules, but only one of `all_birthdays` / `round_birthdays` can be active simultaneously (enforced at application layer, documented here for clarity).

```sql
CREATE TABLE public.ordering_rules (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID          NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- User-defined label
  name                  VARCHAR(150)  NOT NULL,

  -- Rule classification
  rule_type             rule_type     NOT NULL,

  -- For rule_type = 'round_birthdays': which ages to celebrate
  -- e.g. [25, 30, 35, 40, 45, 50, 55, 60]
  -- NULL for other rule types
  milestone_ages        INTEGER[],

  -- For rule_type = 'work_anniversary': which year milestones to celebrate
  -- e.g. [1, 3, 5, 10]; NULL = celebrate all anniversaries
  anniversary_years     INTEGER[],

  -- Default cake for orders generated by this rule
  default_cake_type_id  UUID          REFERENCES public.cake_types(id) ON DELETE RESTRICT,
  default_cake_size     cake_size     NOT NULL DEFAULT 'medium',

  -- Text template; {ad} is substituted with employee's first name at order creation time
  custom_text_template  VARCHAR(60),

  -- Whether the rule is currently generating orders
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,

  created_by            UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 3.5 Orders

#### `public.orders`

The central transactional table. Represents every cake order — automated or ad-hoc.

```sql
CREATE TABLE public.orders (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant & source
  company_id          UUID          NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  employee_id         UUID          REFERENCES public.employees(id) ON DELETE SET NULL,  -- NULL for guest ad-hoc
  rule_id             UUID          REFERENCES public.ordering_rules(id) ON DELETE SET NULL, -- NULL for ad-hoc
  order_type          order_type    NOT NULL,

  -- Recipient (denormalised at order creation time so changes to employee don't affect history)
  recipient_name      VARCHAR(255)  NOT NULL,
  recipient_phone     VARCHAR(20),

  -- Delivery details (denormalised snapshot)
  delivery_date       DATE          NOT NULL,
  delivery_address    TEXT          NOT NULL,
  delivery_district   district      NOT NULL,
  delivery_window     delivery_window NOT NULL DEFAULT 'no_preference',

  -- Cake details (denormalised snapshot at order time)
  cake_type_id        UUID          REFERENCES public.cake_types(id) ON DELETE RESTRICT,
  cake_size           cake_size     NOT NULL,
  custom_text         VARCHAR(60),  -- Final rendered text (tokens already substituted)

  -- Bakery assignment
  bakery_id           UUID          REFERENCES public.bakeries(id) ON DELETE SET NULL,
  assigned_at         TIMESTAMPTZ,  -- When the order was sent to current bakery
  acceptance_deadline TIMESTAMPTZ,  -- bakery must accept/reject by this time
  accepted_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  reassignment_count  SMALLINT      NOT NULL DEFAULT 0,  -- Number of times this order has been reassigned

  -- Lifecycle status
  status              order_status  NOT NULL DEFAULT 'draft',
  approved_by         UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at         TIMESTAMPTZ,
  cancelled_by        UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  delivered_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,

  -- Financials (in TRY, VAT-excluded unless noted)
  base_price_try      NUMERIC(10,2) NOT NULL,    -- Cake base price at time of order
  platform_fee_try    NUMERIC(10,2) NOT NULL,    -- Platform commission amount
  vat_rate            NUMERIC(4,2)  NOT NULL DEFAULT 0.20,  -- Turkish VAT rate (20% standard)
  order_total_try     NUMERIC(10,2) NOT NULL,    -- Total charged to company (incl. VAT)
  cancellation_fee_try NUMERIC(10,2) NOT NULL DEFAULT 0.00,

  -- Payment reference
  payment_id          UUID          REFERENCES public.payments(id) ON DELETE SET NULL,

  -- Admin override tracking
  last_status_override_by   UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_status_override_note TEXT,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Delivery date must be in the future at order creation (enforced at app layer)
  CONSTRAINT chk_order_total_positive CHECK (order_total_try >= 0)
);
```

#### `public.order_status_history`

Append-only log of every status transition for an order. Enables full audit trail and timeline display in the UI.

```sql
CREATE TABLE public.order_status_history (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  from_status     order_status,           -- NULL for the initial status entry
  to_status       order_status  NOT NULL,
  changed_by      UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by_role user_role,              -- Denormalised for display without join
  note            TEXT,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 3.6 Bakeries

#### `public.districts`

Reference table for supported delivery districts. Enables admin to add districts post-MVP without schema changes.

```sql
CREATE TABLE public.districts (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100)  NOT NULL UNIQUE,  -- e.g. "Beşiktaş"
  slug        district      NOT NULL UNIQUE,  -- enum value e.g. 'besiktas'
  city        VARCHAR(100)  NOT NULL DEFAULT 'Istanbul',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.bakeries`

Partner bakeries that fulfil cake orders.

```sql
CREATE TABLE public.bakeries (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name              VARCHAR(255)  NOT NULL,
  slug              VARCHAR(100)  NOT NULL UNIQUE,  -- URL-safe identifier
  description       TEXT,                           -- Max 200 chars in UI, not enforced at DB level
  logo_url          TEXT,                           -- Supabase Storage path

  -- Contact
  contact_name      VARCHAR(255)  NOT NULL,
  contact_email     VARCHAR(255)  NOT NULL UNIQUE,
  contact_phone     VARCHAR(20)   NOT NULL,
  address           TEXT          NOT NULL,

  -- Financials
  iban              VARCHAR(34),   -- For payout transfers; IBAN format
  bank_name         VARCHAR(100),

  -- Operational config
  business_hours    JSONB         NOT NULL DEFAULT '{}',
  -- e.g. {"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {...}, ..., "sunday": null}

  -- How many hours a bakery has to accept an order before auto-reassignment
  -- NULL = use platform global default from system_settings
  acceptance_window_hours SMALLINT,

  status            bakery_status NOT NULL DEFAULT 'pending_setup',

  -- Invitation for bakery portal setup
  invitation_token        VARCHAR(128) UNIQUE,
  invitation_expires_at   TIMESTAMPTZ,
  invitation_accepted_at  TIMESTAMPTZ,
  invited_by              UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,

  admin_note        TEXT,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.bakery_districts`

Many-to-many: which districts a bakery serves. Kept as a separate table so coverage can be updated without touching the bakeries row.

```sql
CREATE TABLE public.bakery_districts (
  bakery_id     UUID      NOT NULL REFERENCES public.bakeries(id) ON DELETE CASCADE,
  district      district  NOT NULL,

  -- Optionally store district-specific capacity or notes
  max_orders_per_day  SMALLINT,  -- NULL = unlimited

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (bakery_id, district)
);
```

---

### 3.7 Cake Catalogue & Pricing

#### `public.cake_types`

Platform-managed cake catalogue. Admins define what's available; bakeries fulfil it.

```sql
CREATE TABLE public.cake_types (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  name              VARCHAR(150)  NOT NULL,
  slug              VARCHAR(100)  NOT NULL UNIQUE,
  description       TEXT,
  image_url         TEXT,           -- Supabase Storage path

  -- Dietary / allergen flags (used for catalogue filtering)
  is_gluten_free    BOOLEAN       NOT NULL DEFAULT FALSE,
  is_vegan          BOOLEAN       NOT NULL DEFAULT FALSE,
  allergens         TEXT[],         -- e.g. ['nuts', 'dairy', 'eggs']

  -- Seasonal availability
  is_seasonal       BOOLEAN       NOT NULL DEFAULT FALSE,
  available_from    DATE,           -- Nullable; only relevant if is_seasonal = TRUE
  available_until   DATE,

  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order     SMALLINT      NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.cake_prices`

Price per cake type per size. Managed by platform admins. Bakeries can request changes via `price_change_requests`.

```sql
CREATE TABLE public.cake_prices (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  cake_type_id    UUID          NOT NULL REFERENCES public.cake_types(id) ON DELETE CASCADE,
  size            cake_size     NOT NULL,

  -- VAT-excluded price in TRY
  price_try       NUMERIC(10,2) NOT NULL CHECK (price_try > 0),

  -- Weight descriptor for UI display only
  weight_grams    INTEGER,

  -- Price history: when a price change takes effect, a new row is inserted
  -- and the old row's valid_until is set. The current price has valid_until = NULL.
  valid_from      DATE          NOT NULL DEFAULT CURRENT_DATE,
  valid_until     DATE,                 -- NULL = currently active price

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Only one active price per cake_type + size at any point in time
  CONSTRAINT uq_cake_prices_active UNIQUE (cake_type_id, size, valid_from)
);
```

#### `public.price_change_requests`

Bakery-initiated requests to adjust platform prices for a given cake type/size. Reviewed by platform admin.

```sql
CREATE TABLE public.price_change_requests (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bakery_id         UUID          NOT NULL REFERENCES public.bakeries(id) ON DELETE CASCADE,
  cake_type_id      UUID          NOT NULL REFERENCES public.cake_types(id) ON DELETE CASCADE,
  size              cake_size     NOT NULL,

  current_price_try NUMERIC(10,2) NOT NULL,
  requested_price_try NUMERIC(10,2) NOT NULL CHECK (requested_price_try > 0),
  effective_date    DATE          NOT NULL,
  justification     TEXT,

  status            price_request_status NOT NULL DEFAULT 'pending',
  reviewed_by       UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  admin_note        TEXT,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 3.8 Payments & Billing

#### `public.payments`

Individual payment transaction records. One per charge attempt against iyzico.

```sql
CREATE TABLE public.payments (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID          NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,

  -- iyzico transaction references
  iyzico_payment_id     TEXT          UNIQUE,       -- iyzico's paymentId
  iyzico_conversation_id TEXT,                      -- For correlating with iyzico webhooks

  payment_method        payment_method NOT NULL,
  amount_try            NUMERIC(10,2) NOT NULL CHECK (amount_try > 0),
  vat_amount_try        NUMERIC(10,2) NOT NULL DEFAULT 0.00,

  status                payment_status NOT NULL DEFAULT 'pending',
  failed_at             TIMESTAMPTZ,
  failure_reason        TEXT,
  retry_count           SMALLINT      NOT NULL DEFAULT 0,
  next_retry_at         TIMESTAMPTZ,

  -- For card payments: last 4 digits + card brand for display (NO raw card data)
  card_last_four        VARCHAR(4),
  card_brand            VARCHAR(20),   -- e.g. "VISA", "MASTERCARD"

  -- What this payment covers
  invoice_id            UUID          REFERENCES public.invoices(id) ON DELETE SET NULL,

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.invoices`

Monthly or per-order billing summaries. Each invoice can cover multiple orders.

```sql
CREATE TABLE public.invoices (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID          NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,

  -- Invoice reference number (human-readable, e.g. INV-2026-001234)
  invoice_number      VARCHAR(50)   NOT NULL UNIQUE,

  -- Billing period
  period_start        DATE          NOT NULL,
  period_end          DATE          NOT NULL,

  -- Amounts (TRY)
  subtotal_try        NUMERIC(10,2) NOT NULL,   -- Sum of line items VAT-excluded
  vat_amount_try      NUMERIC(10,2) NOT NULL,
  total_try           NUMERIC(10,2) NOT NULL,

  status              payment_status NOT NULL DEFAULT 'pending',
  due_date            DATE,
  paid_at             TIMESTAMPTZ,

  -- PDF stored in Supabase Storage
  pdf_url             TEXT,

  -- Turkish e-invoice details
  einvoice_type       VARCHAR(20),   -- 'e_fatura' | 'e_arsiv'
  einvoice_uuid       UUID,          -- GIB (Turkish Revenue Administration) UUID for e-fatura

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.invoice_line_items`

Individual line items on an invoice. Each order generates one line item; subscription fees are a separate line item type.

```sql
CREATE TABLE public.invoice_line_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID          NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

  -- If this line is for an order
  order_id        UUID          REFERENCES public.orders(id) ON DELETE SET NULL,

  description     TEXT          NOT NULL,   -- Human-readable line description
  quantity        SMALLINT      NOT NULL DEFAULT 1,
  unit_price_try  NUMERIC(10,2) NOT NULL,
  total_try       NUMERIC(10,2) NOT NULL,   -- quantity * unit_price
  vat_rate        NUMERIC(4,2)  NOT NULL DEFAULT 0.20,

  -- "order" | "subscription" | "cancellation_fee" | "adjustment"
  line_type       VARCHAR(30)   NOT NULL DEFAULT 'order',

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 3.9 HR Integrations

#### `public.hr_integrations`

Configuration for a company's connected HR system. One record per integration per company.

```sql
CREATE TABLE public.hr_integrations (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID          NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_type      integration_type NOT NULL,

  -- Credentials (store encrypted at rest; these are API keys, never plaintext passwords)
  -- In practice: encrypt before INSERT, decrypt in application layer
  encrypted_api_key     TEXT          NOT NULL,
  subdomain             VARCHAR(255), -- Required for BambooHR; NULL for KolayIK

  -- Sync state
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
  last_sync_at          TIMESTAMPTZ,
  last_sync_employee_count INTEGER,
  last_sync_status      VARCHAR(20),  -- 'success' | 'partial' | 'failed'

  -- Rate limiting: max 1 manual sync per hour
  manual_sync_allowed_after TIMESTAMPTZ,

  -- Conflict resolution: if two integrations active, last-write-wins
  -- and conflict flag is set on the employee record
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- One active integration of each type per company
  CONSTRAINT uq_hr_integrations_company_type UNIQUE (company_id, integration_type)
);
```

#### `public.hr_sync_logs`

Per-sync execution log. Retained for 30 days (application-level cleanup job).

```sql
CREATE TABLE public.hr_sync_logs (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id      UUID          NOT NULL REFERENCES public.hr_integrations(id) ON DELETE CASCADE,

  triggered_by        UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = automated
  trigger_type        VARCHAR(20)   NOT NULL DEFAULT 'manual',  -- 'manual' | 'scheduled'

  started_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  status              VARCHAR(20),   -- 'success' | 'partial' | 'failed' | 'running'

  -- Counts
  records_fetched     INTEGER       NOT NULL DEFAULT 0,
  records_created     INTEGER       NOT NULL DEFAULT 0,
  records_updated     INTEGER       NOT NULL DEFAULT 0,
  records_deactivated INTEGER       NOT NULL DEFAULT 0,
  records_skipped     INTEGER       NOT NULL DEFAULT 0,

  -- Error details (if status = 'failed' or 'partial')
  error_message       TEXT,
  error_details       JSONB          -- Raw API error response for admin visibility
);
```

---

### 3.10 Notifications

#### `public.notification_log`

Immutable append-only record of every notification sent (or attempted) by the platform.

```sql
CREATE TABLE public.notification_log (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  company_id        UUID          REFERENCES public.companies(id) ON DELETE SET NULL,
  order_id          UUID          REFERENCES public.orders(id) ON DELETE SET NULL,
  recipient_user_id UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- What was sent
  event             notification_event NOT NULL,
  channel           notification_channel NOT NULL,
  recipient_address TEXT          NOT NULL,  -- Email address or phone number

  -- Template
  template_id       UUID          REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  subject           TEXT,          -- For email only
  body_preview      TEXT,          -- First 500 chars of rendered body (for admin visibility)

  -- Delivery
  status            notification_status NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,        -- Resend message ID or Twilio SID
  sent_at           TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

#### `public.notification_templates`

Admin-managed templates for all notification events and channels.

```sql
CREATE TABLE public.notification_templates (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event       notification_event NOT NULL,
  channel     notification_channel NOT NULL,

  name        VARCHAR(200)  NOT NULL,    -- Internal admin label
  subject     TEXT,                      -- Email subject; NULL for WhatsApp/SMS
  body        TEXT          NOT NULL,    -- Template body with {variable} substitutions

  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_notification_templates_event_channel UNIQUE (event, channel)
);
```

#### `public.notification_preferences`

Per-user, per-event notification opt-in/out overrides. Supplements the global profile-level flags.

```sql
CREATE TABLE public.notification_preferences (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event       notification_event NOT NULL,
  channel     notification_channel NOT NULL,
  is_enabled  BOOLEAN       NOT NULL DEFAULT TRUE,

  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_notif_prefs_user_event_channel UNIQUE (user_id, event, channel)
);
```

---

### 3.11 System & Config

#### `public.system_settings`

Global platform configuration as key-value pairs. Managed by platform admins.

```sql
CREATE TABLE public.system_settings (
  key         VARCHAR(100)  PRIMARY KEY,
  value       TEXT          NOT NULL,
  description TEXT,

  -- Expected value type for validation in UI
  value_type  VARCHAR(20)   NOT NULL DEFAULT 'string',  -- 'string' | 'integer' | 'decimal' | 'boolean' | 'json'

  updated_by  UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

Key settings to seed (see Section 8):
- `order_lead_time_days` (default: `60`)
- `bakery_acceptance_window_hours` (default: `4`)
- `bakery_order_release_days` (default: `7`) — how many days before delivery to release to bakery
- `cancellation_cutoff_hours` (default: `24`)
- `max_order_reassignments` (default: `3`)
- `vat_rate` (default: `0.20`)
- `subscription_require_admin_approval` (default: `false`)
- `min_order_lead_time_hours` (default: `48`)

#### `public.public_holidays`

Turkish public holiday calendar. Used to shift work anniversary deliveries to the next business day.

```sql
CREATE TABLE public.public_holidays (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE        NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL,   -- e.g. "Cumhuriyet Bayramı"
  year        SMALLINT    NOT NULL GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)::SMALLINT) STORED,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.12 Audit

#### `public.audit_log`

Immutable append-only record of all significant create/update/delete operations. Retained for minimum 12 months.

```sql
CREATE TABLE public.audit_log (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  actor_id        UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role      user_role,
  actor_ip        INET,

  -- What was changed
  table_name      VARCHAR(100)  NOT NULL,
  record_id       UUID          NOT NULL,
  action          VARCHAR(10)   NOT NULL,  -- 'INSERT' | 'UPDATE' | 'DELETE'

  -- State snapshots (JSONB for flexibility across all tables)
  before_data     JSONB,   -- NULL for INSERT
  after_data      JSONB,   -- NULL for DELETE
  changed_fields  TEXT[],  -- List of column names that changed (UPDATE only)

  -- Context
  company_id      UUID     REFERENCES public.companies(id) ON DELETE SET NULL,  -- For tenant scoping
  request_id      TEXT,    -- Correlation ID from HTTP request headers

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Indexes

Indexes are designed for the specific query patterns identified from user stories and process flows.

```sql
-- ─── profiles ───────────────────────────────────────────────────────────────
-- Supabase Auth: auth.users.id is already indexed; profiles.id is FK + PK
CREATE INDEX idx_profiles_bakery_id ON public.profiles(bakery_id) WHERE bakery_id IS NOT NULL;

-- ─── company_memberships ─────────────────────────────────────────────────────
-- Look up all members of a company (e.g. for access control checks)
CREATE INDEX idx_company_memberships_company_id ON public.company_memberships(company_id);
-- Find invitation by token (login flow)
CREATE INDEX idx_company_memberships_invitation_token ON public.company_memberships(invitation_token)
  WHERE invitation_token IS NOT NULL;

-- ─── companies ───────────────────────────────────────────────────────────────
-- VKN lookup during registration uniqueness check (already UNIQUE but explicit for clarity)
CREATE INDEX idx_companies_vkn ON public.companies(vkn);
-- Admin dashboard: filter by status
CREATE INDEX idx_companies_status ON public.companies(status);
-- Subscription queries
CREATE INDEX idx_companies_subscription_plan_id ON public.companies(subscription_plan_id);
-- Find companies whose subscription renews soon (billing jobs)
CREATE INDEX idx_companies_subscription_renews_at ON public.companies(subscription_renews_at)
  WHERE subscription_renews_at IS NOT NULL;

-- ─── employees ───────────────────────────────────────────────────────────────
-- Core scheduling query: find all active employees per company
CREATE INDEX idx_employees_company_id_status ON public.employees(company_id, status);
-- Birthday scheduling: find employees whose birthday is on a target date
-- Uses EXTRACT to match month+day regardless of year
CREATE INDEX idx_employees_birthday_mmdd ON public.employees(
  company_id,
  (EXTRACT(MONTH FROM date_of_birth)::SMALLINT),
  (EXTRACT(DAY FROM date_of_birth)::SMALLINT)
) WHERE status = 'active';
-- Work anniversary scheduling
CREATE INDEX idx_employees_start_date ON public.employees(company_id, start_date)
  WHERE start_date IS NOT NULL AND status = 'active';
-- HR sync lookups: find employee by external_id for upsert
CREATE INDEX idx_employees_external_id ON public.employees(hr_integration_id, external_id)
  WHERE external_id IS NOT NULL;
-- Department filter on employee list
CREATE INDEX idx_employees_department ON public.employees(company_id, department)
  WHERE department IS NOT NULL;
-- Full-text search on employee names (Turkish locale)
CREATE INDEX idx_employees_fulltext ON public.employees
  USING gin(to_tsvector('turkish', first_name || ' ' || last_name));

-- ─── ordering_rules ──────────────────────────────────────────────────────────
-- Load active rules per company (scheduling job)
CREATE INDEX idx_ordering_rules_company_id ON public.ordering_rules(company_id, is_active);

-- ─── orders ──────────────────────────────────────────────────────────────────
-- Most common query: orders for a company sorted by delivery date
CREATE INDEX idx_orders_company_id_delivery_date ON public.orders(company_id, delivery_date DESC);
-- Upcoming orders in a date range (dashboard widget)
CREATE INDEX idx_orders_delivery_date_status ON public.orders(delivery_date, status);
-- Bakery portal: orders assigned to a bakery
CREATE INDEX idx_orders_bakery_id_delivery_date ON public.orders(bakery_id, delivery_date)
  WHERE bakery_id IS NOT NULL;
-- Admin: filter by status (pending assignment, escalation monitoring)
CREATE INDEX idx_orders_status ON public.orders(status);
-- Find orders for an employee (history view)
CREATE INDEX idx_orders_employee_id ON public.orders(employee_id) WHERE employee_id IS NOT NULL;
-- Scheduling job: find accepted orders approaching acceptance deadline
CREATE INDEX idx_orders_acceptance_deadline ON public.orders(acceptance_deadline)
  WHERE status = 'assigned' AND acceptance_deadline IS NOT NULL;
-- Payment linkage
CREATE INDEX idx_orders_payment_id ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

-- ─── order_status_history ────────────────────────────────────────────────────
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id, created_at DESC);

-- ─── bakeries ────────────────────────────────────────────────────────────────
CREATE INDEX idx_bakeries_status ON public.bakeries(status);
CREATE INDEX idx_bakeries_invitation_token ON public.bakeries(invitation_token)
  WHERE invitation_token IS NOT NULL;

-- ─── bakery_districts ────────────────────────────────────────────────────────
-- Order assignment: find active bakeries in a district
CREATE INDEX idx_bakery_districts_district ON public.bakery_districts(district);

-- ─── cake_types ──────────────────────────────────────────────────────────────
CREATE INDEX idx_cake_types_is_active ON public.cake_types(is_active);
-- Seasonal filtering
CREATE INDEX idx_cake_types_seasonal ON public.cake_types(available_from, available_until)
  WHERE is_seasonal = TRUE;

-- ─── cake_prices ─────────────────────────────────────────────────────────────
-- Pricing lookup at order time: get current price for a cake type + size
CREATE INDEX idx_cake_prices_current ON public.cake_prices(cake_type_id, size, valid_from)
  WHERE valid_until IS NULL;

-- ─── price_change_requests ───────────────────────────────────────────────────
CREATE INDEX idx_price_change_requests_bakery_id ON public.price_change_requests(bakery_id);
CREATE INDEX idx_price_change_requests_status ON public.price_change_requests(status)
  WHERE status = 'pending';

-- ─── payments ────────────────────────────────────────────────────────────────
CREATE INDEX idx_payments_company_id ON public.payments(company_id, created_at DESC);
CREATE INDEX idx_payments_status ON public.payments(status);
-- Find payments due for retry
CREATE INDEX idx_payments_next_retry_at ON public.payments(next_retry_at)
  WHERE status = 'failed' AND next_retry_at IS NOT NULL;
CREATE INDEX idx_payments_iyzico_payment_id ON public.payments(iyzico_payment_id)
  WHERE iyzico_payment_id IS NOT NULL;

-- ─── invoices ────────────────────────────────────────────────────────────────
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id, period_start DESC);
CREATE INDEX idx_invoices_status ON public.invoices(status, due_date)
  WHERE status IN ('pending', 'failed');

-- ─── hr_integrations ─────────────────────────────────────────────────────────
CREATE INDEX idx_hr_integrations_company_id ON public.hr_integrations(company_id);

-- ─── hr_sync_logs ────────────────────────────────────────────────────────────
CREATE INDEX idx_hr_sync_logs_integration_id ON public.hr_sync_logs(integration_id, started_at DESC);

-- ─── notification_log ────────────────────────────────────────────────────────
CREATE INDEX idx_notification_log_order_id ON public.notification_log(order_id)
  WHERE order_id IS NOT NULL;
CREATE INDEX idx_notification_log_company_id ON public.notification_log(company_id, created_at DESC)
  WHERE company_id IS NOT NULL;
CREATE INDEX idx_notification_log_status ON public.notification_log(status)
  WHERE status IN ('pending', 'failed');

-- ─── notification_preferences ────────────────────────────────────────────────
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ─── audit_log ───────────────────────────────────────────────────────────────
-- Table + record lookup (most common audit query)
CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id, created_at DESC);
-- Actor-based audit trail
CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;
-- Company scoped audit queries
CREATE INDEX idx_audit_log_company_id ON public.audit_log(company_id, created_at DESC)
  WHERE company_id IS NOT NULL;

-- ─── public_holidays ─────────────────────────────────────────────────────────
CREATE INDEX idx_public_holidays_year ON public.public_holidays(year);
```

---

## 5. Foreign Keys Summary

| From Table | Column | References | On Delete |
|---|---|---|---|
| `profiles` | `id` | `auth.users(id)` | CASCADE |
| `profiles` | `bakery_id` | `bakeries(id)` | SET NULL |
| `company_memberships` | `user_id` | `profiles(id)` | CASCADE |
| `company_memberships` | `company_id` | `companies(id)` | CASCADE |
| `company_memberships` | `invited_by` | `profiles(id)` | SET NULL |
| `company_settings` | `company_id` | `companies(id)` | CASCADE |
| `companies` | `subscription_plan_id` | `subscription_plans(id)` | RESTRICT |
| `companies` | `subscription_overridden_by` | `profiles(id)` | SET NULL |
| `employees` | `company_id` | `companies(id)` | CASCADE |
| `employees` | `preferred_cake_type_id` | `cake_types(id)` | SET NULL |
| `employees` | `hr_integration_id` | `hr_integrations(id)` | SET NULL |
| `employees` | `deactivated_by` | `profiles(id)` | SET NULL |
| `ordering_rules` | `company_id` | `companies(id)` | CASCADE |
| `ordering_rules` | `default_cake_type_id` | `cake_types(id)` | RESTRICT |
| `ordering_rules` | `created_by` | `profiles(id)` | SET NULL |
| `orders` | `company_id` | `companies(id)` | RESTRICT |
| `orders` | `employee_id` | `employees(id)` | SET NULL |
| `orders` | `rule_id` | `ordering_rules(id)` | SET NULL |
| `orders` | `bakery_id` | `bakeries(id)` | SET NULL |
| `orders` | `cake_type_id` | `cake_types(id)` | RESTRICT |
| `orders` | `payment_id` | `payments(id)` | SET NULL |
| `orders` | `approved_by` | `profiles(id)` | SET NULL |
| `orders` | `cancelled_by` | `profiles(id)` | SET NULL |
| `orders` | `last_status_override_by` | `profiles(id)` | SET NULL |
| `order_status_history` | `order_id` | `orders(id)` | CASCADE |
| `order_status_history` | `changed_by` | `profiles(id)` | SET NULL |
| `bakery_districts` | `bakery_id` | `bakeries(id)` | CASCADE |
| `cake_prices` | `cake_type_id` | `cake_types(id)` | CASCADE |
| `price_change_requests` | `bakery_id` | `bakeries(id)` | CASCADE |
| `price_change_requests` | `cake_type_id` | `cake_types(id)` | CASCADE |
| `price_change_requests` | `reviewed_by` | `profiles(id)` | SET NULL |
| `payments` | `company_id` | `companies(id)` | RESTRICT |
| `payments` | `invoice_id` | `invoices(id)` | SET NULL |
| `invoices` | `company_id` | `companies(id)` | RESTRICT |
| `invoice_line_items` | `invoice_id` | `invoices(id)` | CASCADE |
| `invoice_line_items` | `order_id` | `orders(id)` | SET NULL |
| `hr_integrations` | `company_id` | `companies(id)` | CASCADE |
| `hr_sync_logs` | `integration_id` | `hr_integrations(id)` | CASCADE |
| `hr_sync_logs` | `triggered_by` | `profiles(id)` | SET NULL |
| `notification_log` | `company_id` | `companies(id)` | SET NULL |
| `notification_log` | `order_id` | `orders(id)` | SET NULL |
| `notification_log` | `recipient_user_id` | `profiles(id)` | SET NULL |
| `notification_log` | `template_id` | `notification_templates(id)` | SET NULL |
| `notification_preferences` | `user_id` | `profiles(id)` | CASCADE |
| `system_settings` | `updated_by` | `profiles(id)` | SET NULL |
| `audit_log` | `actor_id` | `profiles(id)` | SET NULL |
| `audit_log` | `company_id` | `companies(id)` | SET NULL |

**Cascade strategy rationale:**
- `CASCADE` is used where child records have no meaning without the parent (e.g., membership without a company, status history without an order).
- `SET NULL` is used where the child record retains independent value but the link becomes optional (e.g., order history after an employee is deleted — the order still needs to exist for billing).
- `RESTRICT` is used on financial tables (`orders`, `payments`, `invoices` → `companies`) to prevent accidental data loss on high-value records. These must be explicitly archived.

---

## 6. Row-Level Security (RLS) Notes

Supabase enforces RLS at the PostgreSQL level. Every table in `public` schema must have RLS enabled. Policies are created per table per operation.

### Core RLS pattern

```sql
-- Enable RLS on all public tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- Helper function: get the current user's company_id
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT company_id FROM public.company_memberships
  WHERE user_id = auth.uid() AND is_active = TRUE
  LIMIT 1;
$$;

-- Helper function: get the current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role LANGUAGE sql STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function: get the current user's bakery_id
CREATE OR REPLACE FUNCTION public.current_bakery_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT bakery_id FROM public.profiles WHERE id = auth.uid();
$$;
```

### Policy examples

```sql
-- Companies: company members can only see their own company
CREATE POLICY "company_members_see_own_company"
ON public.companies FOR SELECT
USING (id = public.current_company_id());

-- Platform admins see all companies
CREATE POLICY "platform_admins_see_all_companies"
ON public.companies FOR ALL
USING (public.current_user_role() = 'platform_admin');

-- Employees: visible only to members of the owning company
CREATE POLICY "company_members_manage_employees"
ON public.employees FOR ALL
USING (company_id = public.current_company_id());

-- Orders: company members see their company's orders; bakery admins see their orders
CREATE POLICY "company_sees_own_orders"
ON public.orders FOR SELECT
USING (company_id = public.current_company_id());

CREATE POLICY "bakery_sees_assigned_orders"
ON public.orders FOR SELECT
USING (bakery_id = public.current_bakery_id());

-- Audit log: platform admins only
CREATE POLICY "platform_admins_read_audit_log"
ON public.audit_log FOR SELECT
USING (public.current_user_role() = 'platform_admin');
```

### Role permission matrix

| Table | company_owner | hr_manager | finance | viewer | bakery_admin | platform_admin |
|---|---|---|---|---|---|---|
| companies | RW (own) | R (own) | R (own) | R (own) | — | RW (all) |
| employees | RW | RW | R | R | — | RW (all) |
| ordering_rules | RW | RW | R | R | — | RW (all) |
| orders | RW | RW | R | R | R (own) | RW (all) |
| bakeries | — | — | — | — | RW (own) | RW (all) |
| cake_types | R | R | R | R | R | RW |
| cake_prices | R | R | R | R | R | RW |
| price_change_requests | — | — | — | — | RW (own) | RW (all) |
| invoices | R | — | R | R | — | RW (all) |
| payments | — | — | R | — | — | RW (all) |
| notification_log | R (own) | R (own) | — | — | R (own) | R (all) |
| subscription_plans | R | R | R | R | — | RW |
| system_settings | — | — | — | — | — | RW |
| audit_log | — | — | — | — | — | R |

---

## 7. Migration Strategy

### 7.1 Tooling

Drizzle ORM is used for all schema migrations. Migration files live at `apps/api/src/db/migrations/`.

```
apps/api/src/db/
├── schema/
│   ├── enums.ts
│   ├── auth.ts           (profiles, company_memberships)
│   ├── companies.ts      (companies, company_settings, subscription_plans)
│   ├── employees.ts      (employees)
│   ├── ordering.ts       (ordering_rules)
│   ├── orders.ts         (orders, order_status_history)
│   ├── bakeries.ts       (bakeries, bakery_districts, districts)
│   ├── catalogue.ts      (cake_types, cake_prices)
│   ├── pricing.ts        (price_change_requests)
│   ├── billing.ts        (payments, invoices, invoice_line_items)
│   ├── integrations.ts   (hr_integrations, hr_sync_logs)
│   ├── notifications.ts  (notification_log, notification_templates, notification_preferences)
│   ├── system.ts         (system_settings, public_holidays)
│   └── audit.ts          (audit_log)
├── migrations/
│   └── 0001_initial_schema.sql
│   └── 0002_seed_reference_data.sql
└── index.ts              (Drizzle client export)
```

### 7.2 Migration order

Enum types and reference tables must be created before tables that reference them:

1. Enums (all `CREATE TYPE` statements)
2. `public_holidays`, `system_settings` (no foreign keys)
3. `subscription_plans`, `districts`, `notification_templates`
4. `bakeries`
5. `auth.users` (Supabase managed) → `profiles`
6. `companies`
7. `company_memberships`, `company_settings`
8. `hr_integrations`
9. `employees`
10. `cake_types` → `cake_prices`
11. `ordering_rules`
12. `orders` → `order_status_history`
13. `payments` → `invoices` → `invoice_line_items`
14. `bakery_districts`
15. `price_change_requests`
16. `hr_sync_logs`
17. `notification_log`, `notification_preferences`
18. `audit_log`

**Note:** There are two circular FK situations to handle:
- `orders.payment_id → payments.id` AND `payments.invoice_id → invoices.id`: Create tables first without the circular FK, then `ALTER TABLE` to add it after both tables exist.
- `profiles.bakery_id → bakeries.id`: Create `profiles` without the FK, add via `ALTER TABLE` after `bakeries` is created.

### 7.3 Zero-downtime migration principles

- Always add columns as nullable first; backfill with a separate job; then add `NOT NULL` constraint if needed.
- Never rename a column in a single migration; use add-new + backfill + drop-old pattern.
- Index creation uses `CREATE INDEX CONCURRENTLY` to avoid table locks.
- Large data migrations run in batches (e.g., 1,000 rows per transaction) with a small sleep between batches.

### 7.4 Post-MVP schema considerations

- **Delivery zones**: The `district` enum type will need a new migration to add new values. Alternatively, refactor to use the `districts` reference table exclusively and drop the enum. The `districts` table is already present for this future migration path.
- **Work anniversaries**: `rule_type` enum already includes `work_anniversary`; the `anniversary_years` column on `ordering_rules` is ready.
- **Multi-currency**: `price_try` columns assume TRY; if currency support is added, a `currency_code` column and conversion logic will need migration.
- **Delivery rating**: A `delivery_ratings` table can be added post-MVP referencing `orders`.

---

## 8. Seed Data Recommendations

The following seed data should be present in all environments (dev, staging, prod).

### 8.1 Enum reference data (automatically available as PG types)

No seed needed — enum values are part of the schema DDL.

### 8.2 `districts`

```sql
INSERT INTO public.districts (id, name, slug, city, is_active, sort_order) VALUES
  (gen_random_uuid(), 'Beşiktaş', 'besiktas', 'Istanbul', TRUE, 1),
  (gen_random_uuid(), 'Sarıyer',  'sariyer',  'Istanbul', TRUE, 2);
```

### 8.3 `subscription_plans`

```sql
INSERT INTO public.subscription_plans (name, slug, price_monthly_try, price_annual_try, employee_limit, commission_rate, monthly_invoice_allowed, features, display_order) VALUES
  ('Starter',    'starter',    499.00,  4990.00,  25,   0.1500, FALSE, '{"hr_integrations": false, "api_access": false}', 1),
  ('Growth',     'growth',     999.00,  9990.00,  100,  0.1200, FALSE, '{"hr_integrations": true,  "api_access": false}', 2),
  ('Enterprise', 'enterprise', 2499.00, 24990.00, NULL, 0.0800, TRUE,  '{"hr_integrations": true,  "api_access": true}',  3);
```

### 8.4 `system_settings`

```sql
INSERT INTO public.system_settings (key, value, description, value_type) VALUES
  ('order_lead_time_days',              '60',    'Default days before birthday to generate draft order',       'integer'),
  ('bakery_acceptance_window_hours',    '4',     'Hours a bakery has to accept an order before reassignment',  'integer'),
  ('bakery_order_release_days',         '7',     'Days before delivery date when order is sent to bakery',     'integer'),
  ('cancellation_cutoff_hours',         '24',    'Hours before delivery; cancellations after this may be charged', 'integer'),
  ('min_order_lead_time_hours',         '48',    'Minimum hours in advance an order must be placed',           'integer'),
  ('max_order_reassignments',           '3',     'Maximum times an order can be reassigned before admin alert','integer'),
  ('vat_rate',                          '0.20',  'Turkish VAT rate applied to orders and subscriptions',       'decimal'),
  ('require_admin_approval_new_company','false', 'If true, new company registrations need admin approval',     'boolean'),
  ('cancellation_fee_pct_within_cutoff','0.50',  'Cancellation fee as fraction of order total if within cutoff','decimal'),
  ('invoice_payment_due_days',          '14',    'Days after invoice generation that payment is due',          'integer');
```

### 8.5 `cake_types` and `cake_prices`

```sql
-- Starter catalogue
INSERT INTO public.cake_types (id, name, slug, description, is_active, display_order) VALUES
  ('uuid-choc', 'Çikolatalı',  'cikolatali',  'Zengin çikolatalı pasta',                TRUE, 1),
  ('uuid-frut', 'Meyveli',     'meyveli',     'Taze meyveli yaş pasta',                 TRUE, 2),
  ('uuid-vanil','Vanilyalı',   'vanilyali',   'Klasik vanilyalı krem pasta',            TRUE, 3),
  ('uuid-lemon','Limonlu',     'limonlu',     'Hafif limon kremalı pasta',              TRUE, 4),
  ('uuid-vegan','Vegan Pasta', 'vegan-pasta', 'Bitkisel malzeme ile hazırlanmış pasta', TRUE, 5);

INSERT INTO public.cake_prices (cake_type_id, size, price_try, weight_grams) VALUES
  ('uuid-choc', 'small',  350.00, 500),
  ('uuid-choc', 'medium', 550.00, 1000),
  ('uuid-choc', 'large',  750.00, 1500),
  ('uuid-frut', 'small',  400.00, 500),
  ('uuid-frut', 'medium', 600.00, 1000),
  ('uuid-frut', 'large',  850.00, 1500),
  ('uuid-vanil','small',  300.00, 500),
  ('uuid-vanil','medium', 500.00, 1000),
  ('uuid-vanil','large',  700.00, 1500),
  ('uuid-lemon','small',  320.00, 500),
  ('uuid-lemon','medium', 520.00, 1000),
  ('uuid-lemon','large',  720.00, 1500),
  ('uuid-vegan','small',  450.00, 500),
  ('uuid-vegan','medium', 700.00, 1000),
  ('uuid-vegan','large',  950.00, 1500);
```

### 8.6 `notification_templates`

Seed one template per `(event, channel)` combination that the platform uses. Email and WhatsApp templates for all events listed in the `notification_event` enum. These contain Turkish-language copy with `{variable}` placeholders. *(Full template copy is managed in a separate content document.)*

### 8.7 `public_holidays`

Seed Turkish public holidays for the current and next calendar year. Update annually via admin dashboard or a seeding script. Key holidays: New Year (1 Jan), National Sovereignty Day (23 Apr), Labour Day (1 May), Youth Day (19 May), Victory Day (30 Aug), Republic Day (29 Oct), Atatürk Commemoration (10 Nov). Eid al-Fitr and Eid al-Adha dates vary annually.

### 8.8 Dev/staging only: test fixtures

- One platform admin profile
- Two test companies (Starter plan, Growth plan)
- One test bakery covering both districts
- 20 test employees per company with varied birthdays
- Sample orders in each status

---

## 9. Supabase Auth Integration Notes

### 9.1 Auth flow

Supabase Auth manages `auth.users` entirely. The platform extends it with `public.profiles` in a 1:1 relationship.

```
User signs up (email + password)
  → Supabase creates auth.users row
  → DB trigger fires: create_profile_on_signup()
  → public.profiles row created with id = auth.users.id
  → Email verification sent by Supabase Auth
  → On verification: company registration flow starts
```

### 9.2 Trigger to create profile

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    -- Role is passed as user metadata during signup; defaults to company_owner for self-registration
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'company_owner')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 9.3 User invitation flow

When an HR manager invites a teammate or an admin invites a bakery:

1. The inviting party creates a `company_memberships` (or `bakeries`) record with an `invitation_token` (UUID-based, 72h TTL).
2. An email is sent with a link containing the token.
3. The invitee clicks the link → frontend calls the API with the token.
4. API looks up `company_memberships.invitation_token` → validates expiry.
5. API calls `supabase.auth.admin.inviteUserByEmail()` to create the `auth.users` record.
6. Once the invitee sets their password, the `handle_new_user` trigger creates `profiles` with the pre-determined role.
7. `company_memberships.invitation_token` is set to NULL and `invitation_accepted_at` is set.

### 9.4 Session and access token usage

- Supabase issues a JWT on login. The JWT contains `sub` (= `auth.users.id` = `profiles.id`) and `role` (the Supabase role, e.g. `authenticated`).
- The API reads the platform role from `public.profiles` via a Drizzle query; it is **not** stored in the JWT.
- RLS policies use `auth.uid()` (Supabase built-in) to identify the current user.
- Sessions expire after 8 hours of inactivity (configured in Supabase Auth settings).

### 9.5 Key Supabase Auth settings

| Setting | Value | Reason |
|---|---|---|
| Email confirmations | Enabled | Account activation requires verification |
| Email OTP expiry | 86400s (24h) | Per requirements |
| Minimum password length | 8 | Per REQ-NFR-010 |
| Session timeout | 28800s (8h) | Per REQ-NFR-011 |
| Invite expiry | 259200s (72h) | Per REQ-CP-005 |

### 9.6 Service role usage

The API uses the Supabase `service_role` key (bypasses RLS) only for:
- Scheduled jobs (birthday scheduling, sync jobs, payment retry) — these run server-side with no authenticated user
- Admin-initiated actions that cross tenant boundaries (order reassignment, company suspension)
- Audit log writes (must always succeed regardless of the acting user's RLS policy)

All other API operations use the user's JWT (`anon` key + auth header) and rely on RLS for data isolation.
