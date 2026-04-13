import type {
  UserRole,
  CompanyStatus,
  EmployeeStatus,
  EmployeeSource,
  District,
  RuleType,
  CakeSize,
  OrderStatus,
  OrderType,
  BakeryStatus,
  PaymentMethod,
  BillingCycle,
  PaymentStatus,
  PriceRequestStatus,
  IntegrationType,
  NotificationChannel,
  NotificationStatusEnum,
  NotificationEvent,
  DeliveryWindow,
} from '../constants/enums';

// Re-export all enum types for convenience
export type {
  UserRole,
  CompanyStatus,
  EmployeeStatus,
  EmployeeSource,
  District,
  RuleType,
  CakeSize,
  OrderStatus,
  OrderType,
  BakeryStatus,
  PaymentMethod,
  BillingCycle,
  PaymentStatus,
  PriceRequestStatus,
  IntegrationType,
  NotificationChannel,
  NotificationStatusEnum,
  NotificationEvent,
  DeliveryWindow,
};

// ─── Auth / Identity ─────────────────────────────────────────────────────────

export interface JwtClaims {
  sub: string;
  email: string;
  user_type: 'company_user' | 'bakery_user' | 'platform_admin';
  company_id: string | null;
  bakery_id: string | null;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Core Platform ────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly_try: number;
  price_annual_try: number;
  employee_limit: number | null;
  commission_rate: number;
  monthly_invoice_allowed: boolean;
  features: Record<string, boolean>;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  vkn: string | null;
  sector: string | null;
  email: string | null;
  logo_url: string | null;
  subscription_plan_id: string | null;
  subscription_started_at: string | null;
  subscription_renews_at: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  company_id: string;
  address: string;
  district: District | null;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  company_id: string;
  notify_order_events_email: boolean;
  notify_order_events_wa: boolean;
  notify_birthday_reminder: boolean;
  birthday_reminder_days: number;
  cancellation_cutoff_hours: number;
  cancellation_fee_pct: number;
  updated_at: string;
}

// ─── Employees ────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  start_date: string | null;
  department: string | null;
  office_location: string | null;
  delivery_address: string | null;
  delivery_district: District | null;
  personal_email: string | null;
  work_email: string | null;
  source: EmployeeSource;
  external_id: string | null;
  hr_integration_id: string | null;
  last_synced_at: string | null;
  preferred_cake_type_id: string | null;
  preferred_cake_size: CakeSize | null;
  custom_message_override: string | null;
  skip_cake: boolean;
  status: EmployeeStatus;
  deactivated_at: string | null;
  deactivated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Ordering Rules ───────────────────────────────────────────────────────────

export interface OrderingRule {
  id: string;
  company_id: string;
  name: string;
  rule_type: RuleType;
  milestone_ages: number[] | null;
  anniversary_years: number[] | null;
  default_cake_type_id: string | null;
  default_cake_size: CakeSize;
  custom_text_template: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  company_id: string;
  employee_id: string | null;
  rule_id: string | null;
  order_type: OrderType;
  recipient_name: string;
  recipient_phone: string | null;
  delivery_date: string;
  delivery_address: string;
  delivery_district: District;
  delivery_window: DeliveryWindow;
  cake_type_id: string | null;
  cake_size: CakeSize;
  custom_text: string | null;
  bakery_id: string | null;
  assigned_at: string | null;
  acceptance_deadline: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  reassignment_count: number;
  status: OrderStatus;
  approved_by: string | null;
  approved_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  base_price_try: number;
  platform_fee_try: number;
  vat_rate: number;
  order_total_try: number;
  cancellation_fee_try: number;
  payment_id: string | null;
  last_status_override_by: string | null;
  last_status_override_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  changed_by_role: UserRole | null;
  note: string | null;
  created_at: string;
}

// ─── Bakeries ─────────────────────────────────────────────────────────────────

export interface Bakery {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  iban: string | null;
  bank_name: string | null;
  business_hours: Record<string, { open: string; close: string } | null>;
  acceptance_window_hours: number | null;
  status: BakeryStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BakeryDistrict {
  bakery_id: string;
  district: District;
  max_orders_per_day: number | null;
  created_at: string;
}

// ─── Cake Catalogue ───────────────────────────────────────────────────────────

export interface CakeType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_gluten_free: boolean;
  is_vegan: boolean;
  allergens: string[];
  is_seasonal: boolean;
  available_from: string | null;
  available_until: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CakePrice {
  id: string;
  cake_type_id: string;
  size: CakeSize;
  price_try: number;
  weight_grams: number | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface PriceChangeRequest {
  id: string;
  bakery_id: string;
  cake_type_id: string;
  size: CakeSize;
  current_price_try: number;
  requested_price_try: number;
  effective_date: string;
  justification: string | null;
  status: PriceRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Payments & Billing ───────────────────────────────────────────────────────

export interface Payment {
  id: string;
  company_id: string;
  iyzico_payment_id: string | null;
  iyzico_conversation_id: string | null;
  payment_method: PaymentMethod;
  amount_try: number;
  vat_amount_try: number;
  status: PaymentStatus;
  failed_at: string | null;
  failure_reason: string | null;
  retry_count: number;
  next_retry_at: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  subtotal_try: number;
  vat_amount_try: number;
  total_try: number;
  status: PaymentStatus;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  einvoice_type: string | null;
  einvoice_uuid: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  order_id: string | null;
  description: string;
  quantity: number;
  unit_price_try: number;
  total_try: number;
  vat_rate: number;
  line_type: string;
  created_at: string;
}

// ─── HR Integrations ──────────────────────────────────────────────────────────

export interface HrIntegration {
  id: string;
  company_id: string;
  integration_type: IntegrationType;
  subdomain: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  last_sync_employee_count: number | null;
  last_sync_status: string | null;
  manual_sync_allowed_after: string | null;
  created_at: string;
  updated_at: string;
}

export interface HrSyncLog {
  id: string;
  integration_id: string;
  triggered_by: string | null;
  trigger_type: string;
  started_at: string;
  completed_at: string | null;
  status: string | null;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_deactivated: number;
  records_skipped: number;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationLog {
  id: string;
  company_id: string | null;
  order_id: string | null;
  recipient_user_id: string | null;
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient_address: string;
  template_id: string | null;
  subject: string | null;
  body_preview: string | null;
  status: NotificationStatusEnum;
  provider_message_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  is_enabled: boolean;
  updated_at: string;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// Keep backward compat alias
export type ApiResponse<T> = ApiSuccessResponse<T>;

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

// Backward compat alias
export type ApiError = ApiErrorResponse;

// ─── Auth Tokens ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}
