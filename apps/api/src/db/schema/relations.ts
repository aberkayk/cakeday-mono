import { relations } from 'drizzle-orm';
import {
  profiles,
  companies,
  companyMemberships,
  companySettings,
  bakeries,
  bakeryDistricts,
  employees,
  orderingRules,
  orders,
  orderStatusHistory,
  cakeTypes,
  cakePrices,
  priceChangeRequests,
  hrIntegrations,
  hrSyncLogs,
  invoices,
  invoiceLineItems,
  payments,
  notificationLog,
  notificationPreferences,
  notificationTemplates,
  subscriptionPlans,
  auditLog,
} from './tables';

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  bakery: one(bakeries, {
    fields: [profiles.bakery_id],
    references: [bakeries.id],
  }),
  membership: one(companyMemberships, {
    fields: [profiles.id],
    references: [companyMemberships.user_id],
  }),
  notificationPreferences: many(notificationPreferences),
}));

// ─── Companies ────────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ one, many }) => ({
  subscriptionPlan: one(subscriptionPlans, {
    fields: [companies.subscription_plan_id],
    references: [subscriptionPlans.id],
  }),
  settings: one(companySettings, {
    fields: [companies.id],
    references: [companySettings.company_id],
  }),
  memberships: many(companyMemberships),
  employees: many(employees),
  orderingRules: many(orderingRules),
  orders: many(orders),
  hrIntegrations: many(hrIntegrations),
  invoices: many(invoices),
  payments: many(payments),
}));

export const companyMembershipsRelations = relations(companyMemberships, ({ one }) => ({
  user: one(profiles, {
    fields: [companyMemberships.user_id],
    references: [profiles.id],
  }),
  company: one(companies, {
    fields: [companyMemberships.company_id],
    references: [companies.id],
  }),
  invitedBy: one(profiles, {
    fields: [companyMemberships.invited_by],
    references: [profiles.id],
    relationName: 'invitedByProfile',
  }),
}));

export const companySettingsRelations = relations(companySettings, ({ one }) => ({
  company: one(companies, {
    fields: [companySettings.company_id],
    references: [companies.id],
  }),
}));

// ─── Bakeries ─────────────────────────────────────────────────────────────────

export const bakeriesRelations = relations(bakeries, ({ one, many }) => ({
  invitedBy: one(profiles, {
    fields: [bakeries.invited_by],
    references: [profiles.id],
  }),
  districts: many(bakeryDistricts),
  orders: many(orders),
  priceChangeRequests: many(priceChangeRequests),
  staff: many(profiles),
}));

export const bakeryDistrictsRelations = relations(bakeryDistricts, ({ one }) => ({
  bakery: one(bakeries, {
    fields: [bakeryDistricts.bakery_id],
    references: [bakeries.id],
  }),
}));

// ─── Cake Catalogue ───────────────────────────────────────────────────────────

export const cakeTypesRelations = relations(cakeTypes, ({ many }) => ({
  prices: many(cakePrices),
  priceChangeRequests: many(priceChangeRequests),
}));

export const cakePricesRelations = relations(cakePrices, ({ one }) => ({
  cakeType: one(cakeTypes, {
    fields: [cakePrices.cake_type_id],
    references: [cakeTypes.id],
  }),
}));

export const priceChangeRequestsRelations = relations(priceChangeRequests, ({ one }) => ({
  bakery: one(bakeries, {
    fields: [priceChangeRequests.bakery_id],
    references: [bakeries.id],
  }),
  cakeType: one(cakeTypes, {
    fields: [priceChangeRequests.cake_type_id],
    references: [cakeTypes.id],
  }),
  reviewedBy: one(profiles, {
    fields: [priceChangeRequests.reviewed_by],
    references: [profiles.id],
  }),
}));

// ─── Employees ────────────────────────────────────────────────────────────────

export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, {
    fields: [employees.company_id],
    references: [companies.id],
  }),
  hrIntegration: one(hrIntegrations, {
    fields: [employees.hr_integration_id],
    references: [hrIntegrations.id],
  }),
  preferredCakeType: one(cakeTypes, {
    fields: [employees.preferred_cake_type_id],
    references: [cakeTypes.id],
  }),
  deactivatedBy: one(profiles, {
    fields: [employees.deactivated_by],
    references: [profiles.id],
  }),
  orders: many(orders),
}));

// ─── Ordering Rules ───────────────────────────────────────────────────────────

export const orderingRulesRelations = relations(orderingRules, ({ one, many }) => ({
  company: one(companies, {
    fields: [orderingRules.company_id],
    references: [companies.id],
  }),
  defaultCakeType: one(cakeTypes, {
    fields: [orderingRules.default_cake_type_id],
    references: [cakeTypes.id],
  }),
  createdBy: one(profiles, {
    fields: [orderingRules.created_by],
    references: [profiles.id],
  }),
  orders: many(orders),
}));

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ one, many }) => ({
  company: one(companies, {
    fields: [orders.company_id],
    references: [companies.id],
  }),
  employee: one(employees, {
    fields: [orders.employee_id],
    references: [employees.id],
  }),
  rule: one(orderingRules, {
    fields: [orders.rule_id],
    references: [orderingRules.id],
  }),
  cakeType: one(cakeTypes, {
    fields: [orders.cake_type_id],
    references: [cakeTypes.id],
  }),
  bakery: one(bakeries, {
    fields: [orders.bakery_id],
    references: [bakeries.id],
  }),
  approvedBy: one(profiles, {
    fields: [orders.approved_by],
    references: [profiles.id],
    relationName: 'approvedByProfile',
  }),
  cancelledBy: one(profiles, {
    fields: [orders.cancelled_by],
    references: [profiles.id],
    relationName: 'cancelledByProfile',
  }),
  payment: one(payments, {
    fields: [orders.payment_id],
    references: [payments.id],
  }),
  statusHistory: many(orderStatusHistory),
  notificationLogs: many(notificationLog),
  invoiceLineItems: many(invoiceLineItems),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.order_id],
    references: [orders.id],
  }),
  changedBy: one(profiles, {
    fields: [orderStatusHistory.changed_by],
    references: [profiles.id],
  }),
}));

// ─── HR Integrations ──────────────────────────────────────────────────────────

export const hrIntegrationsRelations = relations(hrIntegrations, ({ one, many }) => ({
  company: one(companies, {
    fields: [hrIntegrations.company_id],
    references: [companies.id],
  }),
  syncLogs: many(hrSyncLogs),
  employees: many(employees),
}));

export const hrSyncLogsRelations = relations(hrSyncLogs, ({ one }) => ({
  integration: one(hrIntegrations, {
    fields: [hrSyncLogs.integration_id],
    references: [hrIntegrations.id],
  }),
  triggeredBy: one(profiles, {
    fields: [hrSyncLogs.triggered_by],
    references: [profiles.id],
  }),
}));

// ─── Invoices & Payments ──────────────────────────────────────────────────────

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [invoices.company_id],
    references: [companies.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoice_id],
    references: [invoices.id],
  }),
  order: one(orders, {
    fields: [invoiceLineItems.order_id],
    references: [orders.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  company: one(companies, {
    fields: [payments.company_id],
    references: [companies.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoice_id],
    references: [invoices.id],
  }),
  orders: many(orders),
}));

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationLogRelations = relations(notificationLog, ({ one }) => ({
  company: one(companies, {
    fields: [notificationLog.company_id],
    references: [companies.id],
  }),
  order: one(orders, {
    fields: [notificationLog.order_id],
    references: [orders.id],
  }),
  recipientUser: one(profiles, {
    fields: [notificationLog.recipient_user_id],
    references: [profiles.id],
  }),
  template: one(notificationTemplates, {
    fields: [notificationLog.template_id],
    references: [notificationTemplates.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(profiles, {
    fields: [notificationPreferences.user_id],
    references: [profiles.id],
  }),
}));

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(profiles, {
    fields: [auditLog.actor_id],
    references: [profiles.id],
  }),
}));

// ─── Subscription Plans ───────────────────────────────────────────────────────

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  companies: many(companies),
}));
