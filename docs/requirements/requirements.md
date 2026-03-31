# B2B Birthday Cake Delivery Platform — Requirements Document

**Platform:** Doğum Günü Pastası Teslimat Platformu (B2B)
**Target Market:** Turkey (Istanbul — Beşiktaş and Sarıyer districts, MVP)
**Document Version:** 1.0
**Date:** 2026-03-31
**Status:** Draft

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stakeholders and User Roles](#2-stakeholders-and-user-roles)
3. [Functional Requirements — Customer Portal](#3-functional-requirements--customer-portal)
4. [Functional Requirements — Bakery Portal](#4-functional-requirements--bakery-portal)
5. [Functional Requirements — Admin Dashboard](#5-functional-requirements--admin-dashboard)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Process Flows](#7-process-flows)
8. [Data Requirements](#8-data-requirements)
9. [Integration Requirements](#9-integration-requirements)
10. [Constraints and Dependencies](#10-constraints-and-dependencies)
11. [Success Criteria](#11-success-criteria)
12. [Glossary](#12-glossary)

---

## 1. Project Overview

### 1.1 Purpose

The platform automates employee birthday cake delivery for companies operating in Turkey. HR teams or company administrators register their employee roster; the platform then automatically triggers cake orders from partner bakeries on each employee's birthday, routes delivery to the correct district, and handles payment — removing all manual coordination effort from the customer.

### 1.2 MVP Scope

| Dimension | MVP |
|---|---|
| Occasion types | Birthday cakes only |
| Geographic coverage | Istanbul — Beşiktaş and Sarıyer |
| Delivery model | Partner bakeries handle delivery |
| Customer segments | SMBs and enterprises |
| Languages | Turkish only (i18n infrastructure in place for future expansion) |
| Client surface | Responsive web application |

Post-MVP scope (out of scope for this document): bayram (religious holiday) gifts, work anniversaries, other cities, mobile native apps, multi-language.

### 1.3 Business Model

- **SaaS subscription**: Monthly or annual flat fee per company, tiered by employee count.
- **Per-order commission**: A percentage or fixed fee charged on each cake order processed through the platform.

---

## 2. Stakeholders and User Roles

| Role | Portal | Description |
|---|---|---|
| Company Admin | Customer Portal | Sets up the company account, manages billing, configures ordering rules |
| HR User | Customer Portal | Manages employee roster, places ad-hoc orders, reviews upcoming deliveries |
| Bakery Manager | Bakery Portal | Views and accepts/rejects incoming orders, manages past and future order history, submits price change requests |
| Platform Admin | Admin Dashboard | Manages all companies, bakeries, prices, deliveries, reports, and system settings |

---

## 3. Functional Requirements — Customer Portal

### 3.1 Registration and Onboarding

**REQ-CP-001** — Company Registration
The system shall allow a new company to self-register by providing:
- Company name
- Tax identification number (Vergi Numarası / VKN)
- Company address (must be in a supported delivery district for MVP, or headquarters address)
- Primary contact name and surname
- Business email address
- Phone number
- Password (with confirmation)

**REQ-CP-002** — Email Verification
After registration, the system shall send a verification email to the provided address. The company account shall remain inactive until the email is verified.

**REQ-CP-003** — Account Activation Review (optional admin step)
The Admin may optionally place newly registered accounts in a "Pending Approval" state before activation. This is configurable per platform settings.

**REQ-CP-004** — Onboarding Wizard
After first login, the system shall present a step-by-step onboarding wizard covering:
1. Company profile completion
2. Employee import or manual entry
3. Ordering rule configuration
4. Payment method setup
5. Summary and confirmation

**REQ-CP-005** — Multi-User Access
A Company Admin shall be able to invite additional users (HR Users) by email. Invitees shall receive an invitation link valid for 72 hours.

**REQ-CP-006** — Role Management
The Company Admin shall be able to assign and revoke HR User roles within their company account.

---

### 3.2 Employee Management

**REQ-CP-010** — Manual Employee Entry
Users shall be able to add individual employees by entering:
- First name
- Last name
- Date of birth (gün/ay/yıl — day/month/year)
- Employment start date
- Department (free text or selectable from a company-defined department list)
- Work location / office (free text, for future district routing)
- Email address (optional, for direct notification to employee)

**REQ-CP-011** — CSV Import
Users shall be able to upload a CSV file to bulk-import employees. The system shall:
- Provide a downloadable CSV template with required columns
- Validate each row and report errors with row numbers before committing the import
- Allow the user to download a validation error report
- On confirmation, create or update employee records

Required CSV columns: `ad`, `soyad`, `dogum_tarihi` (DD.MM.YYYY), `ise_baslama_tarihi` (DD.MM.YYYY), `departman`
Optional CSV columns: `eposta`, `ofis`

**REQ-CP-012** — BambooHR Integration
Users shall be able to connect their BambooHR account via API key. Once connected:
- The system shall perform an initial full sync of employee records
- The system shall support manual re-sync triggered by the user
- The system shall map BambooHR fields to platform employee fields (see Section 9.1)

**REQ-CP-013** — KolayIK Integration
Users shall be able to connect their KolayIK account. Once connected:
- The system shall perform an initial full sync
- The system shall support manual re-sync
- The system shall map KolayIK fields to platform employee fields (see Section 9.2)

**REQ-CP-014** — Employee Sync Conflict Resolution
When an employee imported from an HR system already exists (matched by email or employee ID), the system shall update the existing record. Deleted employees in the source system shall be flagged as inactive rather than deleted.

**REQ-CP-015** — Employee List View
Users shall be able to view all employees in a paginated, searchable, and filterable table. Filters: department, active/inactive status, upcoming birthday (within next 30/60/90 days).

**REQ-CP-016** — Employee Edit and Deactivation
Users shall be able to edit any employee record or mark an employee as inactive. Inactive employees shall not trigger automatic orders.

---

### 3.3 Ordering Rules

**REQ-CP-020** — Rule Configuration
Users shall be able to define one or more ordering rules that govern when cakes are automatically ordered. Rule types for MVP:
- **All birthdays**: Order a cake for every employee's birthday.
- **Round birthdays only**: Order only for milestone ages (30, 40, 50, 60, ...). Milestones are configurable.

**REQ-CP-021** — Default Cake Configuration per Rule
Each rule shall specify a default cake type and size to be used for all triggered orders. Available sizes and types are defined by platform admins and reflect what partner bakeries offer.

**REQ-CP-022** — Custom Cake Text per Rule
Each rule may include a default personalised message to be printed on the cake (e.g., "Doğum Günün Kutlu Olsun, {ad}!"). The `{ad}` token shall be substituted with the employee's first name at order time.

**REQ-CP-023** — Rule Activation/Deactivation
Users shall be able to activate or deactivate individual rules without deleting them.

**REQ-CP-024** — Lead Time Setting
The platform shall enforce a minimum order lead time of 48 hours before the delivery date. Users shall be informed if an upcoming birthday falls within this window and manual action is required.

---

### 3.4 Ad-Hoc (One-Time) Orders

**REQ-CP-030** — Ad-Hoc Order Creation
Users shall be able to place a one-time cake order for any employee or for a person not in the employee roster. Required fields:
- Recipient name
- Delivery date
- Delivery address (street, district — must be Beşiktaş or Sarıyer for MVP)
- Cake type
- Cake size
- Custom text (optional)
- Contact phone for delivery

**REQ-CP-031** — Ad-Hoc Order Confirmation
The system shall display a summary with price estimate before the user confirms the order. On confirmation, the system shall attempt to assign the order to an available partner bakery in the corresponding district.

---

### 3.5 Order Visibility

**REQ-CP-040** — Upcoming Orders
Users shall be able to view a list of all automatically scheduled and ad-hoc orders for the next 90 days, with status (Scheduled, Confirmed, Out for Delivery, Delivered, Cancelled).

**REQ-CP-041** — Order History
Users shall be able to view all past orders with full details and final status.

**REQ-CP-042** — Order Cancellation
Users shall be able to cancel a scheduled or confirmed order up to 24 hours before the delivery date. Cancellations within 24 hours may incur a cancellation fee as defined in platform settings.

---

### 3.6 Payment

**REQ-CP-050** — Payment Methods
The system shall support:
- **Credit/debit card** (Visa, Mastercard, Amex via iyzico)
- **Monthly invoicing**: Orders are accumulated and invoiced at month end (available to approved enterprise customers only)
- **Per-order payment**: User is charged at the time the order is confirmed

**REQ-CP-051** — Subscription Management
Users shall be able to view their current subscription plan, billing cycle, next renewal date, and upgrade/downgrade options.

**REQ-CP-052** — Invoice Download
Users shall be able to download PDF invoices for all past billing periods.

**REQ-CP-053** — Payment Failure Handling
If a recurring payment fails, the system shall:
1. Send a notification to the Company Admin (email + WhatsApp)
2. Retry payment after 24 hours
3. After 3 failed retries, suspend automated ordering and notify the admin

---

### 3.7 Notifications (Customer-Facing)

**REQ-CP-060** — Order Confirmation Notification
Upon order confirmation, the system shall send an email and optionally a WhatsApp message to the Company Admin or HR User who placed/scheduled the order.

**REQ-CP-061** — Delivery Status Notifications
The system shall send notifications at these milestones: order accepted by bakery, out for delivery, delivered.

**REQ-CP-062** — Birthday Reminder
The system shall send a 7-day advance notification to the HR User listing all employee birthdays in the upcoming week and the orders scheduled for them.

**REQ-CP-063** — Notification Preferences
Users shall be able to configure per-event notification preferences (email only, WhatsApp only, both, or none) for each notification type.

---

## 4. Functional Requirements — Bakery Portal

### 4.1 Bakery Registration and Profile

**REQ-BP-001** — Bakery Onboarding
Bakery partners shall be onboarded by Platform Admins, not through self-registration in MVP. The admin creates the bakery account and provides login credentials to the bakery.

**REQ-BP-002** — Bakery Profile
The bakery shall be able to view and update their profile:
- Business name
- Address
- Contact phone
- Service districts (read-only in MVP; managed by admin)
- Business hours

---

### 4.2 Order Management

**REQ-BP-010** — Incoming Order View
The bakery shall see a dashboard of all orders assigned to them, sorted by delivery date ascending. Each order card shall display:
- Order ID
- Delivery date and time window
- Recipient name
- Delivery address (street + district)
- Cake type, size, and custom text
- Ordering company name
- Contact phone for delivery

**REQ-BP-011** — Order Acceptance
The bakery shall be able to accept an assigned order. On acceptance:
- Order status changes to "Confirmed"
- The customer (HR User) and Platform Admin receive a notification

**REQ-BP-012** — Order Rejection
The bakery shall be able to reject an assigned order with a mandatory reason. On rejection:
- The platform admin is notified
- The platform attempts automatic reassignment to another bakery in the same district
- If no other bakery is available, the admin is alerted for manual intervention

**REQ-BP-013** — Acceptance Deadline
Bakeries shall have a configurable window (default 4 hours) to accept or reject an assigned order. If no action is taken within this window, the platform automatically reassigns the order.

**REQ-BP-014** — Order History
The bakery shall be able to view all past orders (delivered, cancelled, rejected) with full details, filterable by date range.

**REQ-BP-015** — Upcoming Orders View
The bakery shall be able to view all confirmed upcoming orders in a calendar or list view.

---

### 4.3 Price Management

**REQ-BP-020** — Price List View
The bakery shall be able to view the current prices set for their products on the platform (as configured by the admin).

**REQ-BP-021** — Price Change Request
The bakery shall be able to submit a price change request for any product they offer. The request shall include:
- Product name
- Current price
- Requested new price
- Effective date
- Optional justification note

**REQ-BP-022** — Price Request Status
The bakery shall be able to track the status of submitted price requests (Pending, Approved, Rejected) and receive a notification when the admin acts on the request.

---

### 4.4 Notifications (Bakery-Facing)

**REQ-BP-030** — New Order Notification
The bakery shall receive an email and WhatsApp notification whenever a new order is assigned to them.

**REQ-BP-031** — Daily Order Summary
The bakery shall receive a daily digest (configurable time, default 08:00) listing all orders for the following day.

**REQ-BP-032** — Reassignment Notification
The bakery shall be notified when an order previously assigned to them is reassigned away due to non-response or rejection.

---

## 5. Functional Requirements — Admin Dashboard

### 5.1 Company Management

**REQ-AD-001** — Company List
Admins shall be able to view all registered companies in a searchable, filterable table with columns: company name, VKN, subscription plan, status, registration date, total orders.

**REQ-AD-002** — Company Detail
Admins shall be able to view full company details: profile, users, subscription, billing history, employee count, order history.

**REQ-AD-003** — Company Activation / Suspension
Admins shall be able to manually activate, suspend, or deactivate any company account with an optional internal note.

**REQ-AD-004** — Subscription Override
Admins shall be able to manually override a company's subscription plan (e.g., for pilot customers or special contracts).

---

### 5.2 Bakery and Partner Management

**REQ-AD-010** — Bakery List
Admins shall be able to view all partner bakeries with status (Active, Inactive, Suspended) and service districts.

**REQ-AD-011** — Bakery Creation
Admins shall be able to create a new bakery account, configure their service districts, and generate login credentials.

**REQ-AD-012** — Bakery Editing
Admins shall be able to edit bakery profiles, toggle their active status, and modify their service districts.

**REQ-AD-013** — Bakery Performance View
Admins shall be able to view per-bakery metrics: total orders, acceptance rate, rejection rate, average delivery rating (post-MVP), and active districts.

---

### 5.3 Price Management

**REQ-AD-020** — Master Price List
Admins shall maintain a master price list covering all cake types, sizes, and base prices. This list is used as the reference for customer-facing pricing and bakery payouts.

**REQ-AD-021** — Price Change Request Review
Admins shall be able to view all pending price change requests submitted by bakeries. For each request, the admin may approve or reject with an optional response note.

**REQ-AD-022** — Price Effective Date
Approved price changes shall take effect on the bakery-specified effective date, not retroactively.

---

### 5.4 Order and Delivery Management

**REQ-AD-030** — Order List
Admins shall be able to view all orders across all companies with advanced filtering: status, company, bakery, district, delivery date range.

**REQ-AD-031** — Manual Order Assignment
Admins shall be able to manually assign or reassign any order to a specific bakery.

**REQ-AD-032** — Order Status Override
Admins shall be able to manually update the status of any order with an internal audit note.

**REQ-AD-033** — Delivery Tracking
Admins shall be able to view the real-time status of all orders scheduled for today: pending assignment, assigned, confirmed, out for delivery, delivered, failed.

**REQ-AD-034** — Failed Delivery Handling
If a delivery is marked as failed, the admin dashboard shall highlight the order and enable the admin to contact the bakery, reschedule, or issue a refund.

---

### 5.5 Reports and Analytics

**REQ-AD-040** — Key Metrics Dashboard
The admin home screen shall display: total active companies, total active bakeries, orders this month, orders today, revenue this month (platform fees), and average order fulfilment time.

**REQ-AD-041** — Order Reports
Admins shall be able to generate reports filterable by: date range, company, bakery, district, status. Reports shall be exportable as CSV and PDF.

**REQ-AD-042** — Revenue Reports
Admins shall be able to view a breakdown of revenue by subscription fees and per-order commissions, filterable by month and company.

**REQ-AD-043** — Bakery Payout Report
Admins shall be able to generate a payout summary per bakery per billing period showing: number of orders, gross order value, platform commission, net payout due.

---

### 5.6 System Settings

**REQ-AD-050** — Notification Templates
Admins shall be able to edit email and WhatsApp notification templates for all system events. Templates shall support variable substitution (e.g., `{musteri_adi}`, `{teslimat_tarihi}`).

**REQ-AD-051** — Subscription Plan Management
Admins shall be able to define and modify subscription tiers (name, price, employee limit, features included).

**REQ-AD-052** — Lead Time and Cancellation Policy
Admins shall be able to configure global values for minimum order lead time, cancellation cutoff, and cancellation fee percentage.

**REQ-AD-053** — District and Zone Management
Admins shall be able to view and manage delivery districts. For MVP: Beşiktaş and Sarıyer are hardcoded. Post-MVP: adding new districts is available via this interface.

**REQ-AD-054** — Acceptance Window
Admins shall be able to configure the default bakery acceptance window (time allowed for a bakery to accept an order before auto-reassignment).

---

## 6. Non-Functional Requirements

### 6.1 Performance

**REQ-NFR-001** — Page Load Time
All primary pages (dashboard, order list, employee list) shall load within 2 seconds under normal load on a 10 Mbps connection.

**REQ-NFR-002** — API Response Time
95th-percentile API response time shall not exceed 500ms for read operations and 1000ms for write operations under load.

**REQ-NFR-003** — CSV Import Performance
A CSV file with up to 5,000 employee rows shall be processed (validated and imported) within 60 seconds.

**REQ-NFR-004** — Concurrent Users
The system shall support at least 200 concurrent authenticated users without degradation in MVP.

### 6.2 Security

**REQ-NFR-010** — Authentication
All portals shall require email + password authentication. Password requirements: minimum 8 characters, at least one uppercase letter, one number, one special character.

**REQ-NFR-011** — Session Management
Authenticated sessions shall expire after 8 hours of inactivity. Session tokens shall be invalidated server-side on logout.

**REQ-NFR-012** — Data Encryption
All data in transit shall use TLS 1.2 or higher. Sensitive data at rest (payment tokens, personal data) shall be encrypted using AES-256.

**REQ-NFR-013** — Payment Security
No raw card data shall be stored on the platform servers. All payment card data shall be tokenised via iyzico. The platform shall target PCI-DSS SAQ-A compliance.

**REQ-NFR-014** — KVKK Compliance
The platform shall comply with Turkish Personal Data Protection Law (KVKK — Kişisel Verilerin Korunması Kanunu) requirements:
- A KVKK-compliant privacy notice shall be presented and accepted at registration
- Employees whose data is imported shall be covered under the company's KVKK obligations
- Platform admins shall have tools to export or delete personal data upon request

**REQ-NFR-015** — Role-Based Access Control (RBAC)
Each portal shall enforce strict RBAC. Users shall only access data belonging to their own company (Customer Portal) or their own bakery account (Bakery Portal). Cross-tenant data access shall be prevented at the API layer.

**REQ-NFR-016** — Audit Logging
All create, update, and delete operations by admin users shall be logged with timestamp, actor, and before/after values. Logs shall be retained for at least 12 months.

### 6.3 Scalability

**REQ-NFR-020** — Horizontal Scaling
The backend services shall be stateless and capable of horizontal scaling to handle growth beyond MVP load without architectural changes.

**REQ-NFR-021** — Database Scalability
The database schema shall be designed to support at least 100,000 employee records and 1,000,000 orders without performance degradation requiring schema changes.

### 6.4 Availability and Reliability

**REQ-NFR-030** — Uptime Target
The platform shall target 99.5% monthly uptime (excluding scheduled maintenance windows).

**REQ-NFR-031** — Scheduled Maintenance
Planned maintenance windows shall be communicated to active companies at least 48 hours in advance and shall preferably occur between 02:00–05:00 Istanbul time.

**REQ-NFR-032** — Automated Order Triggering Reliability
The scheduled job that triggers automatic cake orders shall have at least 99.9% execution reliability. Missed executions shall generate an alert to the platform admin.

### 6.5 Accessibility

**REQ-NFR-040** — WCAG 2.1 AA Compliance
All web portals shall conform to WCAG 2.1 Level AA guidelines, including keyboard navigability and screen reader compatibility.

**REQ-NFR-041** — Responsive Design
All portals shall be fully usable on desktop (1280px+), tablet (768px–1279px), and mobile (320px–767px) viewport widths.

### 6.6 Usability

**REQ-NFR-050** — Language
All UI text, error messages, notifications, and support content shall be in Turkish. The codebase shall use an i18n framework (e.g., i18next) to support future language additions without UI rewrites.

**REQ-NFR-051** — Date and Number Formatting
Dates shall be displayed in DD.MM.YYYY format. Currency shall be displayed in TRY (₺) with comma as the decimal separator, following Turkish locale (tr-TR).

---

## 7. Process Flows

### 7.1 Company Registration and First Order Flow

```
1. Company Admin visits platform and clicks "Kayıt Ol" (Register)
2. Fills in registration form (REQ-CP-001)
3. System sends verification email (REQ-CP-002)
4. Admin verifies email → account activated
5. Admin logs in → onboarding wizard starts (REQ-CP-004)
   a. Completes company profile
   b. Imports employees (CSV, BambooHR, KolayIK, or manual)
   c. Configures ordering rule (e.g., "All birthdays", default cake: çikolatalı, medium)
   d. Adds payment method via iyzico
   e. Reviews summary and confirms setup
6. System begins monitoring employee birthdays
7. T-2 days before a birthday: system creates a pending order
8. System assigns order to an available bakery in the delivery district
9. Bakery receives new order notification (email + WhatsApp)
10. Bakery accepts order within the acceptance window
11. HR User is notified of order confirmation
12. On delivery day: bakery marks order "Out for Delivery"
13. Bakery marks order "Delivered"
14. HR User receives delivery confirmation notification
15. Platform records order for billing
```

### 7.2 Ad-Hoc Order Flow

```
1. HR User logs into Customer Portal
2. Navigates to "Sipariş Oluştur" (Create Order)
3. Fills in recipient details, delivery address, cake details, and delivery date
4. System validates delivery address is in a supported district
5. System displays order summary with price
6. HR User confirms order
7. If payment method is per-order: iyzico payment charged immediately
8. System assigns order to bakery in matching district
9. Bakery accepts/rejects (see REQ-BP-011, REQ-BP-012)
10. Order progresses to delivery
```

### 7.3 Bakery Order Rejection and Reassignment Flow

```
1. Bakery rejects order (REQ-BP-012) OR acceptance window expires
2. Platform marks order as "Unassigned"
3. Platform queries active bakeries in the same district (excluding the rejecting bakery)
4. If available bakery found:
   a. Order assigned to next bakery
   b. New bakery notified
   c. HR User notified of reassignment
5. If no bakery available:
   a. Admin alerted via dashboard alert and email
   b. Admin manually assigns or contacts bakeries directly
   c. If resolution not found within 4 hours of delivery date, order is escalated and HR User notified
```

### 7.4 Payment and Billing Flow — Monthly Invoice

```
1. All orders for company X in calendar month M are recorded
2. On the 1st of month M+1, system generates an invoice
3. Invoice includes: per-order cost breakdown, subscription fee (if applicable), total
4. Invoice PDF is emailed to Company Admin
5. For direct-charge companies: iyzico charges the stored payment method
6. For invoice customers: payment due within 14 days per contract terms
7. If payment fails: retry logic (REQ-CP-053)
```

### 7.5 Automatic Order Scheduling Logic

```
Daily cron job (runs at 00:01 Istanbul time):
FOR EACH active company:
  FOR EACH active employee:
    IF employee birthday falls on (today + lead_time_days):
      IF employee matches active ordering rules:
        Create order with:
          - Delivery date = employee birthday
          - Cake type/size = rule default
          - Custom text = rule template with employee name substituted
          - Delivery address = employee office address (or company HQ if not set)
          - District = derived from delivery address
        Attempt bakery assignment in matching district
        IF no bakery available: alert admin
```

---

## 8. Data Requirements

### 8.1 Core Entities

#### Company
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Company legal name |
| vkn | String(10) | Turkish tax ID, unique |
| address | Text | Headquarters address |
| subscription_plan_id | FK | Current subscription |
| status | Enum | active, suspended, deactivated |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### Company User
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | FK | |
| email | String | Unique |
| name | String | |
| role | Enum | admin, hr_user |
| status | Enum | active, inactive |
| last_login_at | Timestamp | |

#### Employee
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | FK | |
| first_name | String | |
| last_name | String | |
| date_of_birth | Date | |
| start_date | Date | Employment start |
| department | String | |
| office_address | Text | Optional |
| district | Enum | besiktas, sariyer, null |
| email | String | Optional, for direct notification |
| external_id | String | ID from HR system |
| source | Enum | manual, csv, bamboohr, kolayik |
| is_active | Boolean | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### Ordering Rule
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | FK | |
| name | String | User-defined label |
| rule_type | Enum | all_birthdays, round_birthdays |
| milestone_ages | Array[Int] | e.g. [30,40,50] for round birthdays |
| default_cake_type_id | FK | |
| default_cake_size | Enum | small, medium, large |
| custom_text_template | String | May include {ad} token |
| is_active | Boolean | |

#### Order
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | FK | |
| employee_id | FK | Null for guest ad-hoc orders |
| bakery_id | FK | Assigned bakery |
| rule_id | FK | Null for ad-hoc orders |
| order_type | Enum | automatic, ad_hoc |
| delivery_date | Date | |
| delivery_address | Text | |
| district | Enum | besiktas, sariyer |
| recipient_name | String | |
| recipient_phone | String | |
| cake_type_id | FK | |
| cake_size | Enum | |
| custom_text | String | Final rendered text |
| status | Enum | scheduled, assigned, confirmed, out_for_delivery, delivered, cancelled, failed |
| cancellation_reason | Text | Optional |
| platform_fee | Decimal | |
| order_total | Decimal | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### Bakery
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | |
| address | Text | |
| phone | String | |
| districts | Array[Enum] | besiktas, sariyer |
| business_hours | JSONB | e.g. {"mon": "09:00-18:00"} |
| status | Enum | active, inactive, suspended |
| created_at | Timestamp | |

#### Cake Type
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | e.g. "Çikolatalı", "Meyveli" |
| description | Text | |
| price_small | Decimal | Platform price in TRY |
| price_medium | Decimal | |
| price_large | Decimal | |
| is_active | Boolean | |

#### Price Change Request
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| bakery_id | FK | |
| cake_type_id | FK | |
| size | Enum | |
| current_price | Decimal | |
| requested_price | Decimal | |
| effective_date | Date | |
| justification | Text | Optional |
| status | Enum | pending, approved, rejected |
| admin_note | Text | Optional |
| resolved_at | Timestamp | |

#### Subscription Plan
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String | e.g. "Starter", "Growth", "Enterprise" |
| price_monthly | Decimal | |
| price_annual | Decimal | |
| employee_limit | Int | |
| features | JSONB | |
| is_active | Boolean | |

### 8.2 Data Retention

- Order records: retained for 7 years (for financial/legal compliance in Turkey)
- Employee records: retained for the duration of the company's active subscription plus 2 years after termination, then anonymised
- Audit logs: retained for 12 months minimum
- Payment transaction records: retained for 7 years

---

## 9. Integration Requirements

### 9.1 BambooHR Integration

**REQ-INT-001** — Authentication
Integration shall use BambooHR's REST API with an API key provisioned from the customer's BambooHR account.

**REQ-INT-002** — Field Mapping

| Platform Field | BambooHR Field |
|---|---|
| first_name | firstName |
| last_name | lastName |
| date_of_birth | dateOfBirth |
| start_date | hireDate |
| department | department |
| email | workEmail |
| external_id | id |

**REQ-INT-003** — Sync Trigger
Sync is triggered manually by the HR User from the Customer Portal. Automatic periodic sync is a post-MVP feature.

**REQ-INT-004** — Error Handling
If the BambooHR API returns an error, the platform shall display a descriptive error message in the UI and log the raw error for admin visibility.

---

### 9.2 KolayIK Integration

**REQ-INT-010** — Authentication
Integration shall use KolayIK's API with an API key provided by the customer.

**REQ-INT-011** — Field Mapping

| Platform Field | KolayIK Field |
|---|---|
| first_name | isim |
| last_name | soyisim |
| date_of_birth | dogum_tarihi |
| start_date | ise_baslama_tarihi |
| department | departman |
| email | is_eposta |
| external_id | calisan_id |

**REQ-INT-012** — Sync Trigger
Same as BambooHR: manual trigger in MVP.

---

### 9.3 iyzico Payment Integration

**REQ-INT-020** — Integration Type
The platform shall integrate with iyzico's REST API for payment processing. The iyzico.js (or equivalent) front-end library shall be used to securely collect card data client-side, returning a token — card data shall never touch the platform's servers.

**REQ-INT-021** — Supported Operations
- **Card tokenisation**: Store a customer's card as an iyzico card token for recurring charges
- **One-time charge**: Charge for an ad-hoc order at confirmation time
- **Recurring charge**: Monthly invoice charge using stored token
- **Refund**: Initiate a full or partial refund through the admin dashboard

**REQ-INT-022** — 3D Secure
3D Secure authentication shall be supported and enforced for all card-present flows as required by Turkish banking regulations.

**REQ-INT-023** — Currency
All transactions shall be processed in Turkish Lira (TRY).

**REQ-INT-024** — Webhook Handling
The platform shall implement iyzico webhook endpoints to receive and process payment events (payment_success, payment_failed, refund_completed).

---

### 9.4 Email Notifications

**REQ-INT-030** — Provider
A transactional email provider (e.g., SendGrid, Amazon SES, or Postmark) shall be used for all outbound emails.

**REQ-INT-031** — Sender Domain
Emails shall be sent from a verified domain with SPF and DKIM records configured to maximise deliverability.

**REQ-INT-032** — Template Management
Email templates shall be managed in the Admin Dashboard (REQ-AD-050) and rendered server-side before dispatch.

**REQ-INT-033** — Delivery Tracking
The integration shall support tracking of email delivery status (delivered, bounced, opened) visible to the platform admin.

---

### 9.5 WhatsApp Notifications

**REQ-INT-040** — Provider
WhatsApp Business API shall be used via an approved Meta Business Solution Provider (BSP) operating in Turkey (e.g., Iletimerkezi, Netgsm, or directly via Meta Cloud API).

**REQ-INT-041** — Message Types
WhatsApp notifications shall use pre-approved message templates (HSM — Highly Structured Messages) as required by WhatsApp Business Policy.

**REQ-INT-042** — Opt-In
Users and bakery contacts shall provide explicit opt-in for WhatsApp notifications (at registration or profile setup) in accordance with WhatsApp's terms and Turkish KVKK requirements.

**REQ-INT-043** — Fallback
If a WhatsApp message fails to deliver (e.g., recipient not on WhatsApp), the system shall fall back to email for the same notification.

---

## 10. Constraints and Dependencies

### 10.1 Geographic Constraints

- MVP delivery coverage is strictly limited to Beşiktaş and Sarıyer districts of Istanbul.
- Orders with delivery addresses outside these districts shall be rejected at order creation time with a clear user-facing message.
- Bakery assignment logic depends on a bakery actively serving the order's district.

### 10.2 Regulatory Constraints

- **KVKK**: Employee personal data (date of birth, name) is sensitive personal data under Turkish law. The platform must maintain a data processing inventory (VERBİS registration may be required) and have KVKK-compliant agreements with partner companies and bakeries.
- **Payment regulation**: iyzico is a Turkish PSP licensed by the Central Bank of Turkey (TCMB). All payment flows must comply with TCMB regulations, including 3D Secure mandates.
- **Invoice and e-invoice**: Depending on volume and company registration, Turkish tax law (GIB) may require e-invoice (e-fatura) or e-archive invoice. This requirement shall be evaluated post-MVP.
- **Food safety**: Partner bakeries are responsible for food safety certifications. The platform shall not take on food producer liability.

### 10.3 Technical Dependencies

| Dependency | Purpose | Risk Level |
|---|---|---|
| iyzico API | Payment processing | High — no alternative PSP in MVP |
| BambooHR API | Employee import | Medium — manual CSV as fallback |
| KolayIK API | Employee import | Medium — manual CSV as fallback |
| WhatsApp Business API / BSP | WhatsApp notifications | Medium — email fallback available |
| Email delivery provider | Transactional email | Low — multiple providers available |
| SMS provider (post-MVP consideration) | Optional backup notification | Low |

### 10.4 Operational Constraints

- Partner bakeries handle all last-mile delivery; the platform has no direct control over delivery quality or timing.
- Minimum cake order lead time of 48 hours must be respected; the scheduling engine shall not create orders with less than 48 hours to delivery.
- The MVP does not include a mobile native app; the responsive web app must function well on mobile browsers.

---

## 11. Success Criteria

### 11.1 Launch Readiness Criteria (MVP Go-Live)

| Criterion | Measure |
|---|---|
| All three portals accessible and functional | 100% of P1 functional requirements implemented and tested |
| iyzico payment integration live | At least one successful end-to-end test transaction completed |
| At least one bakery onboarded per district | Beşiktaş: ≥1, Sarıyer: ≥1 |
| At least one pilot company onboarded | ≥1 company with ≥10 employees imported |
| Automated order scheduling functional | Test cron job executed and created correct orders for test employees |
| Notifications delivered | Email and WhatsApp notifications confirmed delivered in test scenarios |
| KVKK notice in place | Privacy policy and data processing notice reviewed and published |

### 11.2 Business KPIs (3-Month Post-Launch Targets)

| KPI | Target |
|---|---|
| Active paying companies | ≥ 10 |
| Total orders fulfilled | ≥ 50 |
| Bakery acceptance rate | ≥ 85% |
| Successful delivery rate | ≥ 90% |
| Order scheduling accuracy | 99% of birthday orders created on correct date |
| Customer churn rate | ≤ 10% in first 3 months |

### 11.3 Technical Quality Gates

| Gate | Target |
|---|---|
| 95th-percentile page load time | ≤ 2 seconds |
| 95th-percentile API response time | ≤ 500ms (reads) |
| Uptime | ≥ 99.5% monthly |
| Critical security vulnerabilities | 0 open at launch |
| Automated order job reliability | ≥ 99.9% execution success rate |

---

## 12. Glossary

| Term | Definition |
|---|---|
| Ad-hoc order | A one-time manually placed cake order, outside of automated rules |
| Acceptance window | The time given to a bakery to accept or reject an assigned order before auto-reassignment |
| KVKK | Kişisel Verilerin Korunması Kanunu — Turkish Personal Data Protection Law (similar to GDPR) |
| VKN | Vergi Kimlik Numarası — Turkish tax identification number for legal entities |
| BSP | Business Solution Provider — a Meta-approved partner for WhatsApp Business API access |
| 3D Secure | An authentication protocol required by Turkish banks for online card payments |
| Lead time | Minimum number of hours/days required between order creation and delivery date |
| District | A defined delivery zone (Beşiktaş, Sarıyer) used for bakery-to-order routing |
| Round birthday | A milestone birthday age (30, 40, 50, 60, etc.) |
| Cron job | A scheduled automated task that runs at a defined time interval |
| iyzico | A Turkish licensed payment service provider used for card processing |
| BambooHR | A cloud-based HR software platform; integrated for employee data import |
| KolayIK | A Turkish HR software platform; integrated for employee data import |
| SaaS | Software as a Service — a subscription-based software delivery model |
| SMB | Small and Medium-sized Business |
| RBAC | Role-Based Access Control |
| TRY | Turkish Lira — currency used for all transactions |
| HSM | Highly Structured Message — pre-approved WhatsApp Business API template message |
| e-fatura | Turkish electronic invoice standard mandated by the Revenue Administration (GIB) |
| VERBİS | Veri Sorumluları Sicil Bilgi Sistemi — Turkish data controller registry under KVKK |
