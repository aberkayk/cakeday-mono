export const USER_ROLES = [
  'company_owner',
  'hr_manager',
  'finance',
  'viewer',
  'bakery_admin',
  'platform_admin',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COMPANY_STATUSES = [
  'pending_verification',
  'pending_approval',
  'active',
  'suspended',
  'deactivated',
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const EMPLOYEE_STATUSES = ['active', 'inactive'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_SOURCES = ['manual', 'csv', 'bamboohr', 'kolayik'] as const;
export type EmployeeSource = (typeof EMPLOYEE_SOURCES)[number];

export const DISTRICTS = ['besiktas', 'sariyer'] as const;
export type District = (typeof DISTRICTS)[number];

export const RULE_TYPES = ['all_birthdays', 'round_birthdays', 'work_anniversary'] as const;
export type RuleType = (typeof RULE_TYPES)[number];

export const CAKE_SIZES = ['small', 'medium', 'large'] as const;
export type CakeSize = (typeof CAKE_SIZES)[number];

export const ORDER_STATUSES = [
  'draft',
  'pending_approval',
  'confirmed',
  'assigned',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancellation_requested',
  'cancelled',
  'failed',
  'rejected',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TYPES = ['automatic', 'ad_hoc'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const BAKERY_STATUSES = [
  'pending_setup',
  'active',
  'inactive',
  'suspended',
] as const;
export type BakeryStatus = (typeof BAKERY_STATUSES)[number];

export const PAYMENT_METHODS = ['credit_card', 'monthly_invoice'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const BILLING_CYCLES = ['monthly', 'annual'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
  'void',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PRICE_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type PriceRequestStatus = (typeof PRICE_REQUEST_STATUSES)[number];

export const INTEGRATION_TYPES = ['bamboohr', 'kolayik'] as const;
export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ['email', 'whatsapp', 'sms'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = ['pending', 'sent', 'delivered', 'failed'] as const;
export type NotificationStatusEnum = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_EVENTS = [
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
  'employee_birthday_reminder',
  'hr_sync_failed',
  'hr_sync_completed',
  'bakery_invitation',
  'user_invitation',
  'password_reset',
] as const;
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export const DELIVERY_WINDOWS = ['morning', 'afternoon', 'no_preference'] as const;
export type DeliveryWindow = (typeof DELIVERY_WINDOWS)[number];
