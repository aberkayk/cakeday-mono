DO $$ BEGIN
 CREATE TYPE "public"."bakery_status" AS ENUM('pending_setup', 'active', 'inactive', 'suspended');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'annual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cake_size" AS ENUM('small', 'medium', 'large');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."company_status" AS ENUM('pending_verification', 'pending_approval', 'active', 'suspended', 'deactivated');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."delivery_window" AS ENUM('morning', 'afternoon', 'no_preference');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."district" AS ENUM('besiktas', 'sariyer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employee_source" AS ENUM('manual', 'csv', 'bamboohr', 'kolayik');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."integration_type" AS ENUM('bamboohr', 'kolayik');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_channel" AS ENUM('email', 'whatsapp', 'sms');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_event" AS ENUM('order_draft_created', 'order_pending_approval', 'order_confirmed', 'order_assigned_to_bakery', 'order_accepted_by_bakery', 'order_rejected_by_bakery', 'order_out_for_delivery', 'order_delivered', 'order_cancelled', 'order_failed', 'cancellation_requested', 'payment_failed', 'payment_succeeded', 'invoice_generated', 'invoice_overdue', 'subscription_renewal_reminder', 'subscription_plan_changed', 'employee_birthday_reminder', 'hr_sync_failed', 'hr_sync_completed', 'bakery_invitation', 'user_invitation', 'password_reset');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'delivered', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('draft', 'pending_approval', 'confirmed', 'assigned', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancellation_requested', 'cancelled', 'failed', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_type" AS ENUM('automatic', 'ad_hoc');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_method" AS ENUM('credit_card', 'monthly_invoice');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'void');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."price_request_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."rule_type" AS ENUM('all_birthdays', 'round_birthdays', 'work_anniversary');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('company_owner', 'hr_manager', 'finance', 'viewer', 'bakery_admin', 'platform_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_role" "user_role",
	"actor_ip" "inet",
	"table_name" varchar(100) NOT NULL,
	"record_id" uuid NOT NULL,
	"action" varchar(10) NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bakeries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"logo_url" text,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"iban" varchar(34),
	"bank_name" varchar(100),
	"business_hours" jsonb DEFAULT '{}' NOT NULL,
	"acceptance_window_hours" smallint,
	"status" "bakery_status" DEFAULT 'pending_setup' NOT NULL,
	"invitation_token" varchar(128),
	"invitation_expires_at" timestamp with time zone,
	"invitation_accepted_at" timestamp with time zone,
	"invited_by" uuid,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bakeries_slug_unique" UNIQUE("slug"),
	CONSTRAINT "bakeries_contact_email_unique" UNIQUE("contact_email"),
	CONSTRAINT "bakeries_invitation_token_unique" UNIQUE("invitation_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bakery_districts" (
	"bakery_id" uuid NOT NULL,
	"district" "district" NOT NULL,
	"max_orders_per_day" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bakery_districts_bakery_id_district_pk" PRIMARY KEY("bakery_id","district")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cake_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cake_type_id" uuid NOT NULL,
	"size" "cake_size" NOT NULL,
	"price_try" numeric(10, 2) NOT NULL,
	"weight_grams" integer,
	"valid_from" date DEFAULT CURRENT_DATE NOT NULL,
	"valid_until" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cake_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"image_url" text,
	"is_gluten_free" boolean DEFAULT false NOT NULL,
	"is_vegan" boolean DEFAULT false NOT NULL,
	"allergens" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_seasonal" boolean DEFAULT false NOT NULL,
	"available_from" date,
	"available_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cake_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"vkn" varchar(10) NOT NULL,
	"sector" varchar(100),
	"company_size_range" varchar(50),
	"primary_contact_name" varchar(255) NOT NULL,
	"primary_contact_title" varchar(100),
	"primary_contact_email" varchar(255) NOT NULL,
	"primary_contact_phone" varchar(20) NOT NULL,
	"billing_address" text NOT NULL,
	"billing_district" "district",
	"einvoice_alias" varchar(255),
	"einvoice_type" varchar(20),
	"billing_email" varchar(255),
	"logo_url" text,
	"subscription_plan_id" uuid,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"subscription_started_at" timestamp with time zone,
	"subscription_renews_at" timestamp with time zone,
	"subscription_overridden_by" uuid,
	"active_payment_method" "payment_method",
	"iyzico_customer_token" text,
	"status" "company_status" DEFAULT 'pending_verification' NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"require_order_approval" boolean DEFAULT false NOT NULL,
	"order_lead_time_days" smallint DEFAULT 60 NOT NULL,
	"default_delivery_window" "delivery_window" DEFAULT 'no_preference' NOT NULL,
	"default_delivery_address" text,
	"default_cake_text" text,
	"onboarding_step" smallint DEFAULT 1 NOT NULL,
	"admin_note" text,
	"kvkk_accepted_at" timestamp with time zone,
	"kvkk_accepted_ip" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_vkn_unique" UNIQUE("vkn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"invited_by" uuid,
	"invitation_token" varchar(128),
	"invitation_expires_at" timestamp with time zone,
	"invitation_accepted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_memberships_invitation_token_unique" UNIQUE("invitation_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_settings" (
	"company_id" uuid PRIMARY KEY NOT NULL,
	"notify_order_events_email" boolean DEFAULT true NOT NULL,
	"notify_order_events_wa" boolean DEFAULT false NOT NULL,
	"notify_birthday_reminder" boolean DEFAULT true NOT NULL,
	"birthday_reminder_days" smallint DEFAULT 7 NOT NULL,
	"cancellation_cutoff_hours" smallint DEFAULT 24 NOT NULL,
	"cancellation_fee_pct" numeric(4, 2) DEFAULT '0.00' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" "district" NOT NULL,
	"city" varchar(100) DEFAULT 'Istanbul' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "districts_name_unique" UNIQUE("name"),
	CONSTRAINT "districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date NOT NULL,
	"start_date" date,
	"department" varchar(100),
	"office_location" varchar(255),
	"delivery_address" text,
	"delivery_district" "district",
	"personal_email" varchar(255),
	"work_email" varchar(255),
	"source" "employee_source" DEFAULT 'manual' NOT NULL,
	"external_id" varchar(255),
	"hr_integration_id" uuid,
	"last_synced_at" timestamp with time zone,
	"preferred_cake_type_id" uuid,
	"preferred_cake_size" "cake_size",
	"custom_message_override" text,
	"skip_cake" boolean DEFAULT false NOT NULL,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"deactivated_at" timestamp with time zone,
	"deactivated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hr_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"integration_type" "integration_type" NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"subdomain" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_sync_employee_count" integer,
	"last_sync_status" varchar(20),
	"manual_sync_allowed_after" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hr_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"triggered_by" uuid,
	"trigger_type" varchar(20) DEFAULT 'manual' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"status" varchar(20),
	"records_fetched" integer DEFAULT 0 NOT NULL,
	"records_created" integer DEFAULT 0 NOT NULL,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"records_deactivated" integer DEFAULT 0 NOT NULL,
	"records_skipped" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"error_details" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"order_id" uuid,
	"description" text NOT NULL,
	"quantity" smallint DEFAULT 1 NOT NULL,
	"unit_price_try" numeric(10, 2) NOT NULL,
	"total_try" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(4, 2) DEFAULT '0.20' NOT NULL,
	"line_type" varchar(30) DEFAULT 'order' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"subtotal_try" numeric(10, 2) NOT NULL,
	"vat_amount_try" numeric(10, 2) NOT NULL,
	"total_try" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"paid_at" timestamp with time zone,
	"pdf_url" text,
	"einvoice_type" varchar(20),
	"einvoice_uuid" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"order_id" uuid,
	"recipient_user_id" uuid,
	"event" "notification_event" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"recipient_address" text NOT NULL,
	"template_id" uuid,
	"subject" text,
	"body_preview" text,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"provider_message_id" text,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event" "notification_event" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" "notification_event" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"name" varchar(200) NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"changed_by" uuid,
	"changed_by_role" "user_role",
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ordering_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"rule_type" "rule_type" NOT NULL,
	"milestone_ages" integer[],
	"anniversary_years" integer[],
	"default_cake_type_id" uuid,
	"default_cake_size" "cake_size" DEFAULT 'medium' NOT NULL,
	"custom_text_template" varchar(60),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid,
	"rule_id" uuid,
	"order_type" "order_type" NOT NULL,
	"recipient_name" varchar(255) NOT NULL,
	"recipient_phone" varchar(20),
	"delivery_date" date NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_district" "district" NOT NULL,
	"delivery_window" "delivery_window" DEFAULT 'no_preference' NOT NULL,
	"cake_type_id" uuid,
	"cake_size" "cake_size" NOT NULL,
	"custom_text" varchar(60),
	"bakery_id" uuid,
	"assigned_at" timestamp with time zone,
	"acceptance_deadline" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"reassignment_count" smallint DEFAULT 0 NOT NULL,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"base_price_try" numeric(10, 2) NOT NULL,
	"platform_fee_try" numeric(10, 2) NOT NULL,
	"vat_rate" numeric(4, 2) DEFAULT '0.20' NOT NULL,
	"order_total_try" numeric(10, 2) NOT NULL,
	"cancellation_fee_try" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_id" uuid,
	"last_status_override_by" uuid,
	"last_status_override_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"iyzico_payment_id" text,
	"iyzico_conversation_id" text,
	"payment_method" "payment_method" NOT NULL,
	"amount_try" numeric(10, 2) NOT NULL,
	"vat_amount_try" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"retry_count" smallint DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"card_last_four" varchar(4),
	"card_brand" varchar(20),
	"invoice_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_iyzico_payment_id_unique" UNIQUE("iyzico_payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bakery_id" uuid NOT NULL,
	"cake_type_id" uuid NOT NULL,
	"size" "cake_size" NOT NULL,
	"current_price_try" numeric(10, 2) NOT NULL,
	"requested_price_try" numeric(10, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"justification" text,
	"status" "price_request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" varchar(20),
	"role" "user_role" NOT NULL,
	"whatsapp_number" varchar(20),
	"whatsapp_opt_in" boolean DEFAULT false NOT NULL,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"whatsapp_notifications_enabled" boolean DEFAULT false NOT NULL,
	"bakery_id" uuid,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public_holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"name" varchar(150) NOT NULL,
	"year" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_holidays_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"price_monthly_try" numeric(10, 2) NOT NULL,
	"price_annual_try" numeric(10, 2) NOT NULL,
	"employee_limit" integer,
	"commission_rate" numeric(5, 4) DEFAULT '0.1000' NOT NULL,
	"monthly_invoice_allowed" boolean DEFAULT false NOT NULL,
	"features" jsonb DEFAULT '{}' NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"value_type" varchar(20) DEFAULT 'string' NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bakeries" ADD CONSTRAINT "bakeries_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bakery_districts" ADD CONSTRAINT "bakery_districts_bakery_id_bakeries_id_fk" FOREIGN KEY ("bakery_id") REFERENCES "public"."bakeries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cake_prices" ADD CONSTRAINT "cake_prices_cake_type_id_cake_types_id_fk" FOREIGN KEY ("cake_type_id") REFERENCES "public"."cake_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_subscription_plan_id_subscription_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_memberships" ADD CONSTRAINT "company_memberships_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_memberships" ADD CONSTRAINT "company_memberships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_memberships" ADD CONSTRAINT "company_memberships_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_hr_integration_id_hr_integrations_id_fk" FOREIGN KEY ("hr_integration_id") REFERENCES "public"."hr_integrations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_preferred_cake_type_id_cake_types_id_fk" FOREIGN KEY ("preferred_cake_type_id") REFERENCES "public"."cake_types"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_deactivated_by_profiles_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hr_integrations" ADD CONSTRAINT "hr_integrations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hr_sync_logs" ADD CONSTRAINT "hr_sync_logs_integration_id_hr_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."hr_integrations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hr_sync_logs" ADD CONSTRAINT "hr_sync_logs_triggered_by_profiles_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_recipient_user_id_profiles_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_default_cake_type_id_cake_types_id_fk" FOREIGN KEY ("default_cake_type_id") REFERENCES "public"."cake_types"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_rule_id_ordering_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."ordering_rules"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_cake_type_id_cake_types_id_fk" FOREIGN KEY ("cake_type_id") REFERENCES "public"."cake_types"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_bakery_id_bakeries_id_fk" FOREIGN KEY ("bakery_id") REFERENCES "public"."bakeries"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_cancelled_by_profiles_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_last_status_override_by_profiles_id_fk" FOREIGN KEY ("last_status_override_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_change_requests" ADD CONSTRAINT "price_change_requests_bakery_id_bakeries_id_fk" FOREIGN KEY ("bakery_id") REFERENCES "public"."bakeries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_change_requests" ADD CONSTRAINT "price_change_requests_cake_type_id_cake_types_id_fk" FOREIGN KEY ("cake_type_id") REFERENCES "public"."cake_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_change_requests" ADD CONSTRAINT "price_change_requests_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cake_prices_active" ON "cake_prices" ("cake_type_id","size","valid_from");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_company_memberships_user" ON "company_memberships" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employees_company_id" ON "employees" ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employees_dob" ON "employees" ("date_of_birth");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employees_status" ON "employees" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_hr_integrations_company_type" ON "hr_integrations" ("company_id","integration_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_notif_prefs_user_event_channel" ON "notification_preferences" ("user_id","event","channel");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_notification_templates_event_channel" ON "notification_templates" ("event","channel");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_company_id" ON "orders" ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_delivery_date" ON "orders" ("delivery_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_bakery_id" ON "orders" ("bakery_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_employee_id" ON "orders" ("employee_id");