import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  smallint,
  integer,
  numeric,
  jsonb,
  inet,
  primaryKey,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import {
  userRoleEnum,
  companyStatusEnum,
  employeeStatusEnum,
  employeeSourceEnum,
  districtEnum,
  ruleTypeEnum,
  cakeSizeEnum,
  orderStatusEnum,
  orderTypeEnum,
  bakeryStatusEnum,
  paymentMethodEnum,
  billingCycleEnum,
  paymentStatusEnum,
  priceRequestStatusEnum,
  integrationTypeEnum,
  notificationChannelEnum,
  notificationStatusEnum,
  notificationEventEnum,
  deliveryWindowEnum,
} from './enums';

// ─── Auth / Identity ──────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // mirrors auth.users(id)
  full_name: text('full_name').notNull(),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').notNull(),
  whatsapp_number: varchar('whatsapp_number', { length: 20 }),
  whatsapp_opt_in: boolean('whatsapp_opt_in').notNull().default(false),
  email_notifications_enabled: boolean('email_notifications_enabled').notNull().default(true),
  whatsapp_notifications_enabled: boolean('whatsapp_notifications_enabled').notNull().default(false),
  bakery_id: uuid('bakery_id'), // FK to bakeries added below (forward reference)
  onboarding_completed: boolean('onboarding_completed').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Core Platform ────────────────────────────────────────────────────────────

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  price_monthly_try: numeric('price_monthly_try', { precision: 10, scale: 2 }).notNull(),
  price_annual_try: numeric('price_annual_try', { precision: 10, scale: 2 }).notNull(),
  employee_limit: integer('employee_limit'),
  commission_rate: numeric('commission_rate', { precision: 5, scale: 4 }).notNull().default('0.1000'),
  monthly_invoice_allowed: boolean('monthly_invoice_allowed').notNull().default(false),
  features: jsonb('features').notNull().default('{}'),
  display_order: smallint('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 255 }).notNull(),
    vkn: varchar('vkn', { length: 10 }).unique(),
    sector: varchar('sector', { length: 100 }),
    company_size_range: varchar('company_size_range', { length: 50 }),
    primary_contact_name: varchar('primary_contact_name', { length: 255 }).notNull(),
    primary_contact_title: varchar('primary_contact_title', { length: 100 }),
    primary_contact_email: varchar('primary_contact_email', { length: 255 }).notNull(),
    primary_contact_phone: varchar('primary_contact_phone', { length: 20 }).notNull(),
    billing_address: text('billing_address'),
    billing_district: districtEnum('billing_district'),
    einvoice_alias: varchar('einvoice_alias', { length: 255 }),
    einvoice_type: varchar('einvoice_type', { length: 20 }),
    billing_email: varchar('billing_email', { length: 255 }),
    logo_url: text('logo_url'),
    subscription_plan_id: uuid('subscription_plan_id').references(() => subscriptionPlans.id),
    billing_cycle: billingCycleEnum('billing_cycle').notNull().default('monthly'),
    subscription_started_at: timestamp('subscription_started_at', { withTimezone: true }),
    subscription_renews_at: timestamp('subscription_renews_at', { withTimezone: true }),
    subscription_overridden_by: uuid('subscription_overridden_by'),
    active_payment_method: paymentMethodEnum('active_payment_method'),
    iyzico_customer_token: text('iyzico_customer_token'),
    status: companyStatusEnum('status').notNull().default('pending_verification'),
    is_live: boolean('is_live').notNull().default(false),
    require_order_approval: boolean('require_order_approval').notNull().default(false),
    order_lead_time_days: smallint('order_lead_time_days').notNull().default(60),
    default_delivery_window: deliveryWindowEnum('default_delivery_window').notNull().default('no_preference'),
    default_delivery_address: text('default_delivery_address'),
    default_cake_text: text('default_cake_text'),
    onboarding_step: smallint('onboarding_step').notNull().default(1),
    admin_note: text('admin_note'),
    kvkk_accepted_at: timestamp('kvkk_accepted_at', { withTimezone: true }),
    kvkk_accepted_ip: inet('kvkk_accepted_ip'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    vknCheck: check('chk_vkn_format', sql`${t.vkn} ~ '^\d{10}$'`),
  }),
);

export const companyMemberships = pgTable(
  'company_memberships',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    user_id: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    company_id: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull(),
    invited_by: uuid('invited_by').references(() => profiles.id, { onDelete: 'set null' }),
    invitation_token: varchar('invitation_token', { length: 128 }).unique(),
    invitation_expires_at: timestamp('invitation_expires_at', { withTimezone: true }),
    invitation_accepted_at: timestamp('invitation_accepted_at', { withTimezone: true }),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqUser: uniqueIndex('uq_company_memberships_user').on(t.user_id),
  }),
);

export const companySettings = pgTable('company_settings', {
  company_id: uuid('company_id')
    .primaryKey()
    .references(() => companies.id, { onDelete: 'cascade' }),
  notify_order_events_email: boolean('notify_order_events_email').notNull().default(true),
  notify_order_events_wa: boolean('notify_order_events_wa').notNull().default(false),
  notify_birthday_reminder: boolean('notify_birthday_reminder').notNull().default(true),
  birthday_reminder_days: smallint('birthday_reminder_days').notNull().default(7),
  cancellation_cutoff_hours: smallint('cancellation_cutoff_hours').notNull().default(24),
  cancellation_fee_pct: numeric('cancellation_fee_pct', { precision: 4, scale: 2 }).notNull().default('0.00'),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Bakeries (declared before employees for FK) ──────────────────────────────

export const districts = pgTable('districts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: districtEnum('slug').notNull().unique(),
  city: varchar('city', { length: 100 }).notNull().default('Istanbul'),
  is_active: boolean('is_active').notNull().default(true),
  sort_order: smallint('sort_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bakeries = pgTable('bakeries', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  logo_url: text('logo_url'),
  contact_name: varchar('contact_name', { length: 255 }).notNull(),
  contact_email: varchar('contact_email', { length: 255 }).notNull().unique(),
  contact_phone: varchar('contact_phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  iban: varchar('iban', { length: 34 }),
  bank_name: varchar('bank_name', { length: 100 }),
  business_hours: jsonb('business_hours').notNull().default('{}'),
  acceptance_window_hours: smallint('acceptance_window_hours'),
  status: bakeryStatusEnum('status').notNull().default('pending_setup'),
  invitation_token: varchar('invitation_token', { length: 128 }).unique(),
  invitation_expires_at: timestamp('invitation_expires_at', { withTimezone: true }),
  invitation_accepted_at: timestamp('invitation_accepted_at', { withTimezone: true }),
  invited_by: uuid('invited_by').references(() => profiles.id, { onDelete: 'set null' }),
  admin_note: text('admin_note'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bakeryDistricts = pgTable(
  'bakery_districts',
  {
    bakery_id: uuid('bakery_id')
      .notNull()
      .references(() => bakeries.id, { onDelete: 'cascade' }),
    district: districtEnum('district').notNull(),
    max_orders_per_day: smallint('max_orders_per_day'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bakery_id, t.district] }),
  }),
);

// ─── Cake Catalogue ───────────────────────────────────────────────────────────

export const cakeTypes = pgTable('cake_types', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  image_url: text('image_url'),
  is_gluten_free: boolean('is_gluten_free').notNull().default(false),
  is_vegan: boolean('is_vegan').notNull().default(false),
  allergens: text('allergens').array().notNull().default(sql`'{}'::text[]`),
  is_seasonal: boolean('is_seasonal').notNull().default(false),
  available_from: date('available_from'),
  available_until: date('available_until'),
  is_active: boolean('is_active').notNull().default(true),
  display_order: smallint('display_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cakePrices = pgTable(
  'cake_prices',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    cake_type_id: uuid('cake_type_id')
      .notNull()
      .references(() => cakeTypes.id, { onDelete: 'cascade' }),
    size: cakeSizeEnum('size').notNull(),
    price_try: numeric('price_try', { precision: 10, scale: 2 }).notNull(),
    weight_grams: integer('weight_grams'),
    valid_from: date('valid_from').notNull().default(sql`CURRENT_DATE`),
    valid_until: date('valid_until'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqActive: uniqueIndex('uq_cake_prices_active').on(t.cake_type_id, t.size, t.valid_from),
    priceCheck: check('chk_cake_price_positive', sql`${t.price_try} > 0`),
  }),
);

export const priceChangeRequests = pgTable('price_change_requests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  bakery_id: uuid('bakery_id')
    .notNull()
    .references(() => bakeries.id, { onDelete: 'cascade' }),
  cake_type_id: uuid('cake_type_id')
    .notNull()
    .references(() => cakeTypes.id, { onDelete: 'cascade' }),
  size: cakeSizeEnum('size').notNull(),
  current_price_try: numeric('current_price_try', { precision: 10, scale: 2 }).notNull(),
  requested_price_try: numeric('requested_price_try', { precision: 10, scale: 2 }).notNull(),
  effective_date: date('effective_date').notNull(),
  justification: text('justification'),
  status: priceRequestStatusEnum('status').notNull().default('pending'),
  reviewed_by: uuid('reviewed_by').references(() => profiles.id, { onDelete: 'set null' }),
  reviewed_at: timestamp('reviewed_at', { withTimezone: true }),
  admin_note: text('admin_note'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── HR Integrations (before employees for FK) ────────────────────────────────

export const hrIntegrations = pgTable(
  'hr_integrations',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    company_id: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    integration_type: integrationTypeEnum('integration_type').notNull(),
    encrypted_api_key: text('encrypted_api_key').notNull(),
    subdomain: varchar('subdomain', { length: 255 }),
    is_active: boolean('is_active').notNull().default(true),
    last_sync_at: timestamp('last_sync_at', { withTimezone: true }),
    last_sync_employee_count: integer('last_sync_employee_count'),
    last_sync_status: varchar('last_sync_status', { length: 20 }),
    manual_sync_allowed_after: timestamp('manual_sync_allowed_after', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqCompanyType: uniqueIndex('uq_hr_integrations_company_type').on(
      t.company_id,
      t.integration_type,
    ),
  }),
);

export const hrSyncLogs = pgTable('hr_sync_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  integration_id: uuid('integration_id')
    .notNull()
    .references(() => hrIntegrations.id, { onDelete: 'cascade' }),
  triggered_by: uuid('triggered_by').references(() => profiles.id, { onDelete: 'set null' }),
  trigger_type: varchar('trigger_type', { length: 20 }).notNull().default('manual'),
  started_at: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  status: varchar('status', { length: 20 }),
  records_fetched: integer('records_fetched').notNull().default(0),
  records_created: integer('records_created').notNull().default(0),
  records_updated: integer('records_updated').notNull().default(0),
  records_deactivated: integer('records_deactivated').notNull().default(0),
  records_skipped: integer('records_skipped').notNull().default(0),
  error_message: text('error_message'),
  error_details: jsonb('error_details'),
});

// ─── Employees ────────────────────────────────────────────────────────────────

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    company_id: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    first_name: varchar('first_name', { length: 100 }).notNull(),
    last_name: varchar('last_name', { length: 100 }).notNull(),
    date_of_birth: date('date_of_birth').notNull(),
    start_date: date('start_date'),
    department: varchar('department', { length: 100 }),
    office_location: varchar('office_location', { length: 255 }),
    delivery_address: text('delivery_address'),
    delivery_district: districtEnum('delivery_district'),
    personal_email: varchar('personal_email', { length: 255 }),
    work_email: varchar('work_email', { length: 255 }),
    source: employeeSourceEnum('source').notNull().default('manual'),
    external_id: varchar('external_id', { length: 255 }),
    hr_integration_id: uuid('hr_integration_id').references(() => hrIntegrations.id, {
      onDelete: 'set null',
    }),
    last_synced_at: timestamp('last_synced_at', { withTimezone: true }),
    preferred_cake_type_id: uuid('preferred_cake_type_id').references(() => cakeTypes.id, {
      onDelete: 'set null',
    }),
    preferred_cake_size: cakeSizeEnum('preferred_cake_size'),
    custom_message_override: text('custom_message_override'),
    skip_cake: boolean('skip_cake').notNull().default(false),
    status: employeeStatusEnum('status').notNull().default('active'),
    deactivated_at: timestamp('deactivated_at', { withTimezone: true }),
    deactivated_by: uuid('deactivated_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dobCheck: check('chk_dob_in_past', sql`${t.date_of_birth} < CURRENT_DATE`),
    companyIdIdx: index('idx_employees_company_id').on(t.company_id),
    dobIdx: index('idx_employees_dob').on(t.date_of_birth),
    statusIdx: index('idx_employees_status').on(t.status),
  }),
);

// ─── Ordering Rules ───────────────────────────────────────────────────────────

export const orderingRules = pgTable('ordering_rules', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  company_id: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  rule_type: ruleTypeEnum('rule_type').notNull(),
  milestone_ages: integer('milestone_ages').array(),
  anniversary_years: integer('anniversary_years').array(),
  default_cake_type_id: uuid('default_cake_type_id').references(() => cakeTypes.id, {
    onDelete: 'restrict',
  }),
  default_cake_size: cakeSizeEnum('default_cake_size').notNull().default('medium'),
  custom_text_template: varchar('custom_text_template', { length: 60 }),
  is_active: boolean('is_active').notNull().default(true),
  created_by: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Payments / Invoices (declared before orders for FK) ─────────────────────

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  company_id: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'restrict' }),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull().unique(),
  period_start: date('period_start').notNull(),
  period_end: date('period_end').notNull(),
  subtotal_try: numeric('subtotal_try', { precision: 10, scale: 2 }).notNull(),
  vat_amount_try: numeric('vat_amount_try', { precision: 10, scale: 2 }).notNull(),
  total_try: numeric('total_try', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  due_date: date('due_date'),
  paid_at: timestamp('paid_at', { withTimezone: true }),
  pdf_url: text('pdf_url'),
  einvoice_type: varchar('einvoice_type', { length: 20 }),
  einvoice_uuid: uuid('einvoice_uuid'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  company_id: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'restrict' }),
  iyzico_payment_id: text('iyzico_payment_id').unique(),
  iyzico_conversation_id: text('iyzico_conversation_id'),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  amount_try: numeric('amount_try', { precision: 10, scale: 2 }).notNull(),
  vat_amount_try: numeric('vat_amount_try', { precision: 10, scale: 2 }).notNull().default('0.00'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  failed_at: timestamp('failed_at', { withTimezone: true }),
  failure_reason: text('failure_reason'),
  retry_count: smallint('retry_count').notNull().default(0),
  next_retry_at: timestamp('next_retry_at', { withTimezone: true }),
  card_last_four: varchar('card_last_four', { length: 4 }),
  card_brand: varchar('card_brand', { length: 20 }),
  invoice_id: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    company_id: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    employee_id: uuid('employee_id').references(() => employees.id, { onDelete: 'set null' }),
    rule_id: uuid('rule_id').references(() => orderingRules.id, { onDelete: 'set null' }),
    order_type: orderTypeEnum('order_type').notNull(),
    recipient_name: varchar('recipient_name', { length: 255 }).notNull(),
    recipient_phone: varchar('recipient_phone', { length: 20 }),
    delivery_date: date('delivery_date').notNull(),
    delivery_address: text('delivery_address').notNull(),
    delivery_district: districtEnum('delivery_district').notNull(),
    delivery_window: deliveryWindowEnum('delivery_window').notNull().default('no_preference'),
    cake_type_id: uuid('cake_type_id').references(() => cakeTypes.id, { onDelete: 'restrict' }),
    cake_size: cakeSizeEnum('cake_size').notNull(),
    custom_text: varchar('custom_text', { length: 60 }),
    bakery_id: uuid('bakery_id').references(() => bakeries.id, { onDelete: 'set null' }),
    assigned_at: timestamp('assigned_at', { withTimezone: true }),
    acceptance_deadline: timestamp('acceptance_deadline', { withTimezone: true }),
    accepted_at: timestamp('accepted_at', { withTimezone: true }),
    rejected_at: timestamp('rejected_at', { withTimezone: true }),
    rejection_reason: text('rejection_reason'),
    reassignment_count: smallint('reassignment_count').notNull().default(0),
    status: orderStatusEnum('status').notNull().default('draft'),
    approved_by: uuid('approved_by').references(() => profiles.id, { onDelete: 'set null' }),
    approved_at: timestamp('approved_at', { withTimezone: true }),
    cancelled_by: uuid('cancelled_by').references(() => profiles.id, { onDelete: 'set null' }),
    cancelled_at: timestamp('cancelled_at', { withTimezone: true }),
    cancellation_reason: text('cancellation_reason'),
    delivered_at: timestamp('delivered_at', { withTimezone: true }),
    failed_at: timestamp('failed_at', { withTimezone: true }),
    failure_reason: text('failure_reason'),
    base_price_try: numeric('base_price_try', { precision: 10, scale: 2 }).notNull(),
    platform_fee_try: numeric('platform_fee_try', { precision: 10, scale: 2 }).notNull(),
    vat_rate: numeric('vat_rate', { precision: 4, scale: 2 }).notNull().default('0.20'),
    order_total_try: numeric('order_total_try', { precision: 10, scale: 2 }).notNull(),
    cancellation_fee_try: numeric('cancellation_fee_try', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),
    payment_id: uuid('payment_id').references(() => payments.id, { onDelete: 'set null' }),
    last_status_override_by: uuid('last_status_override_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    last_status_override_note: text('last_status_override_note'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    totalCheck: check('chk_order_total_positive', sql`${t.order_total_try} >= 0`),
    companyIdx: index('idx_orders_company_id').on(t.company_id),
    statusIdx: index('idx_orders_status').on(t.status),
    deliveryDateIdx: index('idx_orders_delivery_date').on(t.delivery_date),
    bakeryIdx: index('idx_orders_bakery_id').on(t.bakery_id),
    employeeIdx: index('idx_orders_employee_id').on(t.employee_id),
  }),
);

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  order_id: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  from_status: orderStatusEnum('from_status'),
  to_status: orderStatusEnum('to_status').notNull(),
  changed_by: uuid('changed_by').references(() => profiles.id, { onDelete: 'set null' }),
  changed_by_role: userRoleEnum('changed_by_role'),
  note: text('note'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Invoice Line Items ───────────────────────────────────────────────────────

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  invoice_id: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  quantity: smallint('quantity').notNull().default(1),
  unit_price_try: numeric('unit_price_try', { precision: 10, scale: 2 }).notNull(),
  total_try: numeric('total_try', { precision: 10, scale: 2 }).notNull(),
  vat_rate: numeric('vat_rate', { precision: 4, scale: 2 }).notNull().default('0.20'),
  line_type: varchar('line_type', { length: 30 }).notNull().default('order'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationTemplates = pgTable(
  'notification_templates',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    event: notificationEventEnum('event').notNull(),
    channel: notificationChannelEnum('channel').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    subject: text('subject'),
    body: text('body').notNull(),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqEventChannel: uniqueIndex('uq_notification_templates_event_channel').on(t.event, t.channel),
  }),
);

export const notificationLog = pgTable('notification_log', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  company_id: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  recipient_user_id: uuid('recipient_user_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  event: notificationEventEnum('event').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  recipient_address: text('recipient_address').notNull(),
  template_id: uuid('template_id').references(() => notificationTemplates.id, {
    onDelete: 'set null',
  }),
  subject: text('subject'),
  body_preview: text('body_preview'),
  status: notificationStatusEnum('status').notNull().default('pending'),
  provider_message_id: text('provider_message_id'),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  delivered_at: timestamp('delivered_at', { withTimezone: true }),
  failed_at: timestamp('failed_at', { withTimezone: true }),
  failure_reason: text('failure_reason'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    user_id: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    event: notificationEventEnum('event').notNull(),
    channel: notificationChannelEnum('channel').notNull(),
    is_enabled: boolean('is_enabled').notNull().default(true),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqUserEventChannel: uniqueIndex('uq_notif_prefs_user_event_channel').on(
      t.user_id,
      t.event,
      t.channel,
    ),
  }),
);

// ─── System & Config ──────────────────────────────────────────────────────────

export const systemSettings = pgTable('system_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  value_type: varchar('value_type', { length: 20 }).notNull().default('string'),
  updated_by: uuid('updated_by').references(() => profiles.id, { onDelete: 'set null' }),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const publicHolidays = pgTable('public_holidays', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  date: date('date').notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  year: smallint('year').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  actor_id: uuid('actor_id').references(() => profiles.id, { onDelete: 'set null' }),
  actor_role: userRoleEnum('actor_role'),
  actor_ip: inet('actor_ip'),
  table_name: varchar('table_name', { length: 100 }).notNull(),
  record_id: uuid('record_id').notNull(),
  action: varchar('action', { length: 10 }).notNull(),
  before_data: jsonb('before_data'),
  after_data: jsonb('after_data'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
