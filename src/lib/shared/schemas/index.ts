import { z } from 'zod';

// ─── Common ───────────────────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

const turkishPhoneRegex = /^\+90[5][0-9]{9}$/;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  company_name: z.string().min(2, 'Sirket adi en az 2 karakter olmalidir.'),
  vkn: z
    .string()
    .length(10, 'Vergi kimlik numarasi 10 haneli olmalidir.')
    .regex(/^\d{10}$/, 'VKN yalnizca rakam icermelidir.')
    .optional(),
  sector: z.string().optional(),
  primary_contact_name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalidir.'),
  primary_contact_title: z.string().optional(),
  email: z.string().email('Gecerli bir e-posta adresi giriniz.'),
  phone: z
    .string()
    .regex(turkishPhoneRegex, 'Gecerli bir Turk cep telefonu giriniz. (+905XXXXXXXXX)'),
  password: z
    .string()
    .min(8, 'Sifre en az 8 karakter olmalidir.'),
  billing_address: z.string().optional(),
  billing_district: z.string().optional(),
  kvkk_accepted: z.literal(true, {
    errorMap: () => ({ message: 'KVKK metnini kabul etmelisiniz.' }),
  }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Gecerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Sifre giriniz.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const logoutSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token gereklidir.'),
});
export type LogoutInput = z.infer<typeof logoutSchema>;

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token gereklidir.'),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Dogrulama tokeni gereklidir.'),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().email('Gecerli bir e-posta adresi giriniz.'),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Gecerli bir e-posta adresi giriniz.'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Sifre sifirlama tokeni gereklidir.'),
  new_password: z
    .string()
    .min(8, 'Sifre en az 8 karakter olmalidir.'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Company Schemas ──────────────────────────────────────────────────────────

export const updateCompanyProfileSchema = z.object({
  name: z.string().min(2).optional(),
  sector: z.string().optional(),
  email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
});
export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;

export const updateCompanySettingsSchema = z.object({
  cancellation_cutoff_hours: z.number().int().min(0).max(168).optional(),
  cancellation_fee_pct: z.number().min(0).max(1).optional(),
  notify_order_events_email: z.boolean().optional(),
  notify_order_events_wa: z.boolean().optional(),
  notify_birthday_reminder: z.boolean().optional(),
  birthday_reminder_days: z.number().int().min(1).max(30).optional(),
});
export type UpdateCompanySettingsInput = z.infer<typeof updateCompanySettingsSchema>;

// ─── Contact / Address Schemas ────────────────────────────────────────────────

export const upsertContactSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalidir.'),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(turkishPhoneRegex).optional(),
});
export type UpsertContactInput = z.infer<typeof upsertContactSchema>;

export const upsertAddressSchema = z.object({
  address: z.string().min(10, 'Adres en az 10 karakter olmalidir.'),
  district: z.enum(['besiktas', 'sariyer']).optional(),
  city: z.string().default('Istanbul'),
  country: z.string().default('Turkey'),
});
export type UpsertAddressInput = z.infer<typeof upsertAddressSchema>;

// ─── Employee Schemas ─────────────────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1, 'Ad giriniz.'),
  last_name: z.string().min(1, 'Soyad giriniz.'),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formati YYYY-MM-DD olmalidir.')
    .refine((d) => new Date(d) < new Date(), 'Dogum tarihi gecmiste olmalidir.'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formati YYYY-MM-DD olmalidir.')
    .optional(),
  department: z.string().optional(),
  office_location: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_district: z.enum(['besiktas', 'sariyer']).optional(),
  personal_email: z.string().email().optional(),
  work_email: z.string().email().optional(),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const updateEmployeeStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
  cancel_pending_orders: z.boolean().default(false),
});
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>;

export const updateEmployeeOverridesSchema = z.object({
  preferred_product_type_id: z.string().uuid().nullable().optional(),
  preferred_product_size: z.enum(['small', 'medium', 'large']).nullable().optional(),
  custom_message_override: z.string().max(60).nullable().optional(),
  skip_product: z.boolean().optional(),
});
export type UpdateEmployeeOverridesInput = z.infer<typeof updateEmployeeOverridesSchema>;

export const deleteEmployeeSchema = z.object({
  confirm_name: z.string().min(1, 'Onay icin calisan adini giriniz.'),
});
export type DeleteEmployeeInput = z.infer<typeof deleteEmployeeSchema>;

export const csvImportConfirmSchema = z.object({
  import_token: z.string().min(1, 'Import tokeni gereklidir.'),
  import_mode: z.enum(['valid_only', 'all']).default('valid_only'),
  duplicate_action: z.enum(['skip', 'update', 'create']).default('skip'),
});
export type CsvImportConfirmInput = z.infer<typeof csvImportConfirmSchema>;

// ─── Ordering Rule Schemas ────────────────────────────────────────────────────

export const createOrderingRuleSchema = z.object({
  name: z.string().min(2, 'Kural adi en az 2 karakter olmalidir.').max(150),
  rule_type: z.enum(['all_birthdays', 'round_birthdays', 'work_anniversary']),
  milestone_ages: z.array(z.number().int().positive()).optional(),
  anniversary_years: z.array(z.number().int().positive()).optional(),
  default_product_type_id: z.string().uuid().optional(),
  default_product_size: z.enum(['small', 'medium', 'large']).default('medium'),
  custom_text_template: z.string().max(60).optional(),
  is_active: z.boolean().default(true),
});
export type CreateOrderingRuleInput = z.infer<typeof createOrderingRuleSchema>;

export const updateOrderingRuleSchema = createOrderingRuleSchema.partial();
export type UpdateOrderingRuleInput = z.infer<typeof updateOrderingRuleSchema>;

// ─── Order Schemas ────────────────────────────────────────────────────────────

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  status: z.string().optional(), // comma-separated
  order_type: z.enum(['automatic', 'ad_hoc']).optional(),
  delivery_date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  delivery_date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  district: z.enum(['besiktas', 'sariyer']).optional(),
  employee_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(['delivery_date', 'created_at', 'status', 'order_total_try']).default('delivery_date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type ListOrdersInput = z.infer<typeof listOrdersSchema>;

export const createAdHocOrderSchema = z.object({
  employee_id: z.string().uuid().optional(),
  recipient_name: z.string().min(1, 'Alici adi giriniz.'),
  recipient_phone: z
    .string()
    .regex(turkishPhoneRegex)
    .optional(),
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formati YYYY-MM-DD olmalidir.')
    .refine((d) => new Date(d) > new Date(), 'Teslimat tarihi gelecekte olmalidir.'),
  delivery_address: z.string().min(5, 'Teslimat adresi giriniz.'),
  delivery_district: z.enum(['besiktas', 'sariyer']),
  delivery_window: z.enum(['morning', 'afternoon', 'no_preference']).default('no_preference'),
  product_type_id: z.string().uuid('Gecerli bir urun turu secin.'),
  product_size: z.enum(['small', 'medium', 'large']),
  custom_text: z.string().max(60).optional(),
});
export type CreateAdHocOrderInput = z.infer<typeof createAdHocOrderSchema>;

export const updateOrderSchema = z.object({
  custom_text: z.string().max(60).optional(),
  delivery_address: z.string().min(5).optional(),
  delivery_window: z.enum(['morning', 'afternoon', 'no_preference']).optional(),
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  product_type_id: z.string().uuid().optional(),
  product_size: z.enum(['small', 'medium', 'large']).optional(),
  recipient_name: z.string().min(1).optional(),
  recipient_phone: z.string().regex(turkishPhoneRegex).optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export const rejectOrderSchema = z.object({
  reason: z.string().min(1, 'Red nedeni giriniz.'),
});
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Iptal nedeni giriniz.').optional(),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

// ─── Supplier Schemas ─────────────────────────────────────────────────────────

export const businessHoursSchema = z.object({
  monday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  tuesday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  wednesday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  thursday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  friday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  saturday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
  sunday: z
    .object({ open: z.string(), close: z.string() })
    .nullable()
    .optional(),
});
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;

export const supplierSetupSchema = z.object({
  name: z.string().min(2, 'Tedarikci adi en az 2 karakter olmalidir.').max(255),
  description: z.string().max(200).optional(),
  logo_url: z.string().url().optional(),
  business_hours: businessHoursSchema.optional(),
  contact: upsertContactSchema.optional(),
  address: upsertAddressSchema.optional(),
  iban: z.string().max(34).optional(),
  bank_name: z.string().max(100).optional(),
});
export type SupplierSetupInput = z.infer<typeof supplierSetupSchema>;

export const updateSupplierProfileSchema = supplierSetupSchema.partial();
export type UpdateSupplierProfileInput = z.infer<typeof updateSupplierProfileSchema>;

export const supplierRejectOrderSchema = z.object({
  reason: z.string().min(1, 'Red nedeni giriniz.'),
});
export type SupplierRejectOrderInput = z.infer<typeof supplierRejectOrderSchema>;

export const supplierDeliveredSchema = z.object({
  delivery_photo_url: z.string().url().optional(),
});
export type SupplierDeliveredInput = z.infer<typeof supplierDeliveredSchema>;

export const submitPriceRequestSchema = z.object({
  product_type_id: z.string().uuid('Gecerli bir urun turu secin.'),
  size: z.enum(['small', 'medium', 'large']),
  requested_price_try: z.number().positive('Fiyat sifirdan buyuk olmalidir.'),
  effective_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formati YYYY-MM-DD olmalidir.')
    .refine((d) => new Date(d) > new Date(), 'Gecerlilik tarihi gelecekte olmalidir.'),
  justification: z.string().max(1000).optional(),
});
export type SubmitPriceRequestInput = z.infer<typeof submitPriceRequestSchema>;

// ─── Payment Schemas ──────────────────────────────────────────────────────────

export const paymentCallbackSchema = z.object({
  token: z.string().min(1, 'Token gereklidir.'),
});
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;

export const updateSubscriptionSchema = z.object({
  plan_id: z.string().uuid('Gecerli bir plan secin.'),
  billing_cycle: z.enum(['monthly', 'annual']),
});
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

// ─── Notification Schemas ─────────────────────────────────────────────────────

export const updateNotificationPrefsSchema = z.object({
  preferences: z
    .array(
      z.object({
        event: z.string(),
        email: z.boolean().optional(),
        whatsapp: z.boolean().optional(),
      }),
    )
    .optional(),
});
export type UpdateNotificationPrefsInput = z.infer<typeof updateNotificationPrefsSchema>;

// ─── HR Integration Schemas ───────────────────────────────────────────────────

export const connectBambooHrSchema = z.object({
  subdomain: z.string().min(1, 'Subdomain giriniz.'),
  api_key: z.string().min(1, 'API anahtari giriniz.'),
});
export type ConnectBambooHrInput = z.infer<typeof connectBambooHrSchema>;

export const connectKolayIkSchema = z.object({
  api_key: z.string().min(1, 'API anahtari giriniz.'),
});
export type ConnectKolayIkInput = z.infer<typeof connectKolayIkSchema>;

// ─── Admin Schemas ────────────────────────────────────────────────────────────

export const adminUpdateCompanySchema = z.object({
  status: z.enum(['pending_verification', 'pending_approval', 'active', 'suspended', 'deactivated']).optional(),
  subscription_plan_id: z.string().uuid().optional(),
});
export type AdminUpdateCompanyInput = z.infer<typeof adminUpdateCompanySchema>;

export const createSupplierSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug yalnizca kucuk harf, rakam ve tire icermelidir.'),
  description: z.string().max(200).optional(),
  admin_note: z.string().optional(),
  contact: upsertContactSchema,
  address: upsertAddressSchema,
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const adminUpdateSupplierSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  status: z.enum(['pending_setup', 'active', 'inactive', 'suspended']).optional(),
  admin_note: z.string().optional(),
  acceptance_window_hours: z.number().int().min(1).max(48).optional(),
});
export type AdminUpdateSupplierInput = z.infer<typeof adminUpdateSupplierSchema>;

export const reviewPriceRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  admin_note: z.string().optional(),
});
export type ReviewPriceRequestInput = z.infer<typeof reviewPriceRequestSchema>;

export const adminOverrideOrderStatusSchema = z.object({
  status: z.enum([
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
  ]),
  note: z.string().min(1, 'Not giriniz.'),
});
export type AdminOverrideOrderStatusInput = z.infer<typeof adminOverrideOrderStatusSchema>;
