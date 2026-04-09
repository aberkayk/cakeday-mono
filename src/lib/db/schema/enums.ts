import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'company_owner',
  'hr_manager',
  'finance',
  'viewer',
  'bakery_admin',
  'platform_admin',
]);

export const companyStatusEnum = pgEnum('company_status', [
  'pending_verification',
  'pending_approval',
  'active',
  'suspended',
  'deactivated',
]);

export const employeeStatusEnum = pgEnum('employee_status', ['active', 'inactive']);

export const employeeSourceEnum = pgEnum('employee_source', [
  'manual',
  'csv',
  'bamboohr',
  'kolayik',
]);

export const districtEnum = pgEnum('district', ['besiktas', 'sariyer']);

export const ruleTypeEnum = pgEnum('rule_type', [
  'all_birthdays',
  'round_birthdays',
  'work_anniversary',
]);

export const cakeSizeEnum = pgEnum('cake_size', ['small', 'medium', 'large']);

export const orderStatusEnum = pgEnum('order_status', [
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
]);

export const orderTypeEnum = pgEnum('order_type', ['automatic', 'ad_hoc']);

export const bakeryStatusEnum = pgEnum('bakery_status', [
  'pending_setup',
  'active',
  'inactive',
  'suspended',
]);

export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'monthly_invoice']);

export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'annual']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
  'void',
]);

export const priceRequestStatusEnum = pgEnum('price_request_status', [
  'pending',
  'approved',
  'rejected',
]);

export const integrationTypeEnum = pgEnum('integration_type', ['bamboohr', 'kolayik']);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'email',
  'whatsapp',
  'sms',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'sent',
  'delivered',
  'failed',
]);

export const notificationEventEnum = pgEnum('notification_event', [
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
]);

export const deliveryWindowEnum = pgEnum('delivery_window', [
  'morning',
  'afternoon',
  'no_preference',
]);
