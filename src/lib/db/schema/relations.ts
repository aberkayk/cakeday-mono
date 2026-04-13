import { relations } from 'drizzle-orm';
import {
  users,
  companies,
  contacts,
  addresses,
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

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.user_id],
  }),
  bakery: one(bakeries, {
    fields: [users.id],
    references: [bakeries.user_id],
  }),
  notificationPreferences: many(notificationPreferences),
}));

// ─── Companies ────────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.user_id],
    references: [users.id],
  }),
  subscriptionPlan: one(subscriptionPlans, {
    fields: [companies.subscription_plan_id],
    references: [subscriptionPlans.id],
  }),
  settings: one(companySettings, {
    fields: [companies.id],
    references: [companySettings.company_id],
  }),
  contacts: many(contacts),
  addresses: many(addresses),
  employees: many(employees),
  orderingRules: many(orderingRules),
  orders: many(orders),
  hrIntegrations: many(hrIntegrations),
  invoices: many(invoices),
  payments: many(payments),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.company_id],
    references: [companies.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  company: one(companies, {
    fields: [addresses.company_id],
    references: [companies.id],
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
  owner: one(users, {
    fields: [bakeries.user_id],
    references: [users.id],
  }),
  districts: many(bakeryDistricts),
  orders: many(orders),
  priceChangeRequests: many(priceChangeRequests),
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
  reviewedBy: one(users, {
    fields: [priceChangeRequests.reviewed_by],
    references: [users.id],
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
  deactivatedBy: one(users, {
    fields: [employees.deactivated_by],
    references: [users.id],
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
  createdBy: one(users, {
    fields: [orderingRules.created_by],
    references: [users.id],
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
  approvedBy: one(users, {
    fields: [orders.approved_by],
    references: [users.id],
    relationName: 'approvedByUser',
  }),
  cancelledBy: one(users, {
    fields: [orders.cancelled_by],
    references: [users.id],
    relationName: 'cancelledByUser',
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
  changedBy: one(users, {
    fields: [orderStatusHistory.changed_by],
    references: [users.id],
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
  triggeredBy: one(users, {
    fields: [hrSyncLogs.triggered_by],
    references: [users.id],
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
  recipientUser: one(users, {
    fields: [notificationLog.recipient_user_id],
    references: [users.id],
  }),
  template: one(notificationTemplates, {
    fields: [notificationLog.template_id],
    references: [notificationTemplates.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.user_id],
    references: [users.id],
  }),
}));

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actor_id],
    references: [users.id],
  }),
}));

// ─── Subscription Plans ───────────────────────────────────────────────────────

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  companies: many(companies),
}));
