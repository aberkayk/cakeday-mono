# System Architecture

> **CakeDay** -- B2B Birthday Cake Delivery Platform for the Turkish Market
> Last Updated: 2026-03-31

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Component Diagram](#2-component-diagram)
3. [Authentication and Authorization](#3-authentication-and-authorization)
4. [API Architecture](#4-api-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Notification System](#6-notification-system)
7. [Order Scheduling System](#7-order-scheduling-system)
8. [Payment Flow](#8-payment-flow)
9. [HR Integration Strategy](#9-hr-integration-strategy)
10. [File Upload Strategy](#10-file-upload-strategy)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Security Considerations](#12-security-considerations)
13. [Caching Strategy](#13-caching-strategy)
14. [Environment Configuration](#14-environment-configuration)

---

## 1. High-Level System Overview

CakeDay is a three-portal B2B platform that automates birthday cake delivery for companies. The system is deployed as a monorepo with two Next.js frontend applications and one Express.js backend API.

**Key architectural principles:**

- Stateless API servers for horizontal scalability
- Event-driven notification pipeline using a queue-based system
- Cron-based scheduling for automated order creation
- Tenant isolation at the database and API layers (company-scoped, bakery-scoped)
- All payment card handling delegated to iyzico (PCI-DSS SAQ-A)
- KVKK-compliant personal data handling

**Request lifecycle:**

```
Browser --> Vercel CDN (Next.js SSR/RSC) --> Express API (Railway) --> PostgreSQL (Supabase)
                                                 |
                                                 +--> Supabase Auth (JWT verification)
                                                 +--> Supabase Storage (file uploads)
                                                 +--> iyzico API (payments)
                                                 +--> Resend API (email)
                                                 +--> WhatsApp Business API (messaging)
                                                 +--> BambooHR / KolayIK APIs (HR sync)
```

---

## 2. Component Diagram

```
+------------------------------------------------------------------+
|                          CLIENTS                                  |
|                                                                   |
|   +------------------+  +------------------+  +--------------+    |
|   | Customer Portal  |  | Bakery Portal    |  | Admin        |    |
|   | (apps/web)       |  | (apps/web)       |  | Dashboard    |    |
|   | Next.js 16       |  | Next.js 16       |  | (apps/admin) |    |
|   | Vercel           |  | Vercel           |  | Next.js 16   |    |
|   +--------+---------+  +--------+---------+  | Vercel       |    |
|            |                      |            +------+-------+    |
+------------|----------------------|-------------------|------------+
             |                      |                   |
             +----------+-----------+-------------------+
                        |
                        | HTTPS / REST
                        v
+------------------------------------------------------------------+
|                     API LAYER (apps/api)                          |
|                     Express.js + TypeScript                       |
|                     Railway                                       |
|                                                                   |
|   +-----------------------------------------------------------+  |
|   |                  Middleware Pipeline                        |  |
|   |  CORS -> Rate Limit -> Auth (JWT) -> RBAC -> Validate(Zod)|  |
|   +-----------------------------------------------------------+  |
|                                                                   |
|   +-------------+ +-------------+ +-------------+ +----------+   |
|   | Auth        | | Company     | | Order       | | Admin    |   |
|   | Module      | | Module      | | Module      | | Module   |   |
|   +-------------+ +-------------+ +-------------+ +----------+   |
|   +-------------+ +-------------+ +-------------+ +----------+   |
|   | Employee    | | Bakery      | | Payment     | | Notif.   |   |
|   | Module      | | Module      | | Module      | | Module   |   |
|   +-------------+ +-------------+ +-------------+ +----------+   |
|                                                                   |
|   +-----------------------------------------------------------+  |
|   |               Background Jobs (node-cron)                  |  |
|   |  - Birthday detection & order creation (daily 00:01 IST)   |  |
|   |  - HR sync (nightly 02:00 UTC)                             |  |
|   |  - Invoice generation (monthly, 1st of month)              |  |
|   |  - Acceptance deadline checker (hourly)                     |  |
|   |  - Payment retry (daily)                                   |  |
|   |  - Daily bakery order digest (08:00 IST)                   |  |
|   +-----------------------------------------------------------+  |
+------------------------------------------------------------------+
             |              |              |             |
             v              v              v             v
+----------+  +----------+  +----------+  +-------------------+
| Supabase |  | Supabase |  | iyzico   |  | External APIs     |
| Postgres |  | Storage  |  | Payment  |  | - Resend (email)  |
| (DB+Auth)|  | (files)  |  | Gateway  |  | - WhatsApp Biz    |
+----------+  +----------+  +----------+  | - BambooHR        |
                                           | - KolayIK         |
                                           +-------------------+
```

---

## 3. Authentication and Authorization

### 3.1 Authentication Provider

Authentication is handled by **Supabase Auth**. All three portals use the same Supabase project, and user type is determined by metadata stored in the user profile.

**Flow:**

1. User submits email + password to the Next.js frontend
2. Frontend calls Supabase Auth `signInWithPassword()`
3. Supabase returns an access token (JWT) and refresh token
4. Frontend stores the access token in an HttpOnly, SameSite=Strict cookie
5. All API requests include the JWT in the `Authorization: Bearer <token>` header
6. The Express API verifies the JWT against the Supabase JWKS endpoint
7. On successful verification, the user's role and tenant context are extracted from JWT claims

**JWT Custom Claims (set via Supabase Auth hooks or database triggers):**

```json
{
  "sub": "uuid-of-user",
  "email": "user@company.com",
  "user_type": "company_user",       // company_user | bakery_user | platform_admin
  "company_id": "uuid-or-null",
  "bakery_id": "uuid-or-null",
  "role": "company_owner",           // see RBAC roles below
  "iat": 1711843200,
  "exp": 1711872000
}
```

**Session management:**

- Access tokens expire after 1 hour; refresh tokens expire after 8 hours of inactivity
- On logout, the refresh token is revoked server-side via Supabase Auth
- After 5 failed login attempts within 15 minutes, the account is locked for 15 minutes (enforced via a `login_attempts` table and middleware)

### 3.2 RBAC Roles

| Role | Portal | Permissions |
|---|---|---|
| `company_owner` | Customer | Full access: company settings, billing, users, employees, orders, rules |
| `hr_manager` | Customer | Employees, orders, rules. No billing, no user management |
| `finance` | Customer | Billing and invoices (read/write), orders (read-only) |
| `viewer` | Customer | Read-only access to all Customer Portal sections |
| `bakery_admin` | Bakery | Full access to bakery portal: orders, prices, profile, settings |
| `platform_admin` | Admin | Full access to admin dashboard |

### 3.3 Authorization Middleware

Authorization is enforced at **two layers**:

1. **API middleware** (`rbacMiddleware`): Checks the user's role from the JWT against a per-route permission map. Returns 403 if unauthorized.
2. **Tenant isolation middleware** (`tenantMiddleware`): Ensures `company_id` or `bakery_id` from the JWT matches the resource being accessed. Prevents cross-tenant data access.

**Permission map structure:**

```typescript
// packages/shared/src/permissions.ts
export const PERMISSIONS = {
  'companies:read':       ['company_owner', 'hr_manager', 'finance', 'viewer', 'platform_admin'],
  'companies:write':      ['company_owner', 'platform_admin'],
  'employees:read':       ['company_owner', 'hr_manager', 'viewer', 'platform_admin'],
  'employees:write':      ['company_owner', 'hr_manager', 'platform_admin'],
  'orders:read':          ['company_owner', 'hr_manager', 'finance', 'viewer', 'platform_admin'],
  'orders:write':         ['company_owner', 'hr_manager', 'platform_admin'],
  'billing:read':         ['company_owner', 'finance', 'platform_admin'],
  'billing:write':        ['company_owner', 'finance', 'platform_admin'],
  'users:manage':         ['company_owner', 'platform_admin'],
  'bakery:orders:read':   ['bakery_admin', 'platform_admin'],
  'bakery:orders:write':  ['bakery_admin', 'platform_admin'],
  'bakery:prices:read':   ['bakery_admin', 'platform_admin'],
  'bakery:prices:write':  ['bakery_admin', 'platform_admin'],
  'admin:*':              ['platform_admin'],
} as const;
```

### 3.4 Invitation Flow

- **Company user invitations:** Company owner invites via email. Supabase Auth `inviteUserByEmail()` sends a magic link. On acceptance, the user sets a password and the `company_users` record is activated.
- **Bakery invitations:** Admin creates bakery, triggers an invitation email with a time-limited setup link (72-hour TTL).

---

## 4. API Architecture

### 4.1 Overview

The API is a RESTful Express.js application following resource-oriented design. All endpoints are versioned under `/api/v1/`.

**Base URL:** `https://api.cakeday.com.tr/api/v1`

### 4.2 Route Structure

```
/api/v1/
├── auth/                         # Authentication endpoints
│   ├── register                  # POST - Company self-registration
│   ├── login                     # POST - Email/password login
│   ├── logout                    # POST - Session invalidation
│   ├── refresh                   # POST - Token refresh
│   ├── verify-email              # POST - Email verification
│   ├── forgot-password           # POST - Password reset request
│   └── reset-password            # POST - Password reset
│
├── companies/                    # Company management (Customer Portal)
│   ├── :companyId/
│   │   ├── profile               # GET, PATCH
│   │   ├── users/                # GET, POST, PATCH, DELETE
│   │   ├── onboarding            # GET, PATCH (wizard state)
│   │   └── settings/             # GET, PATCH
│
├── employees/                    # Employee management (Customer Portal)
│   ├── /                         # GET (list), POST (create)
│   ├── import/csv                # POST (CSV upload)
│   ├── import/preview            # POST (preview CSV)
│   ├── :employeeId/              # GET, PATCH, DELETE
│   └── :employeeId/overrides     # GET, PUT (ordering rule overrides)
│
├── integrations/                 # HR integrations (Customer Portal)
│   ├── bamboohr/
│   │   ├── connect               # POST
│   │   ├── test                  # POST
│   │   ├── sync                  # POST (manual trigger)
│   │   ├── status                # GET
│   │   └── logs                  # GET
│   └── kolayik/                  # Same structure as bamboohr
│
├── ordering-rules/               # Ordering rule configuration
│   ├── /                         # GET (list), POST (create)
│   └── :ruleId/                  # GET, PATCH, DELETE
│
├── orders/                       # Order management
│   ├── /                         # GET (list with filters)
│   ├── ad-hoc                    # POST (one-time order)
│   ├── :orderId/                 # GET, PATCH
│   ├── :orderId/cancel           # POST
│   ├── :orderId/approve          # POST
│   └── :orderId/reject           # POST
│
├── cakes/                        # Cake catalogue (read)
│   ├── /                         # GET (list with filters)
│   └── :cakeId/                  # GET
│
├── payments/                     # Payment management
│   ├── methods/                  # GET, POST, DELETE
│   ├── methods/:methodId/default # POST (set default)
│   ├── invoices/                 # GET (list)
│   ├── invoices/:invoiceId/pdf   # GET (download)
│   └── charge                    # POST (one-time charge)
│
├── bakery/                       # Bakery Portal endpoints
│   ├── profile                   # GET, PATCH
│   ├── setup                     # POST (initial profile setup)
│   ├── orders/                   # GET (list)
│   ├── orders/:orderId/          # GET
│   ├── orders/:orderId/accept    # POST
│   ├── orders/:orderId/reject    # POST
│   ├── orders/:orderId/out-for-delivery  # POST
│   ├── orders/:orderId/delivered # POST
│   ├── prices/                   # GET (current price list)
│   ├── price-requests/           # GET, POST
│   ├── price-requests/:id        # GET
│   ├── payouts/                  # GET (payout history)
│   ├── settings/                 # GET, PATCH
│   └── notifications/preferences # GET, PATCH
│
├── admin/                        # Admin Dashboard endpoints
│   ├── companies/                # GET (list), GET :id, PATCH :id
│   ├── companies/:id/suspend     # POST
│   ├── companies/:id/activate    # POST
│   ├── companies/:id/impersonate # POST
│   ├── bakeries/                 # GET (list), POST, GET :id, PATCH :id
│   ├── bakeries/:id/suspend      # POST
│   ├── bakeries/:id/activate     # POST
│   ├── bakeries/:id/performance  # GET
│   ├── bakeries/:id/districts    # PATCH
│   ├── orders/                   # GET (list), GET :id, PATCH :id
│   ├── orders/:id/assign         # POST
│   ├── orders/:id/status         # PATCH
│   ├── orders/:id/re-deliver     # POST
│   ├── cakes/                    # GET, POST, PATCH :id
│   ├── cakes/import              # POST (CSV import)
│   ├── subscription-plans/       # GET, POST, PATCH :id
│   ├── price-requests/           # GET (list)
│   ├── price-requests/:id/approve  # POST
│   ├── price-requests/:id/reject   # POST
│   ├── payouts/                  # GET (list)
│   ├── payouts/:id/process       # POST
│   ├── holidays/                 # GET, POST, PATCH :id, DELETE :id
│   ├── districts/                # GET, POST, PATCH :id
│   ├── notification-templates/   # GET, PATCH :id
│   ├── settings/                 # GET, PATCH
│   ├── reports/orders            # GET
│   ├── reports/revenue           # GET
│   ├── reports/bakery-payouts    # GET
│   ├── reports/birthday-coverage # GET
│   ├── reports/export            # POST (CSV/PDF export)
│   ├── audit-logs/               # GET
│   ├── tax-change-requests/      # GET, POST :id/approve, POST :id/reject
│   └── dashboard/                # GET (key metrics)
│
└── webhooks/                     # External webhooks
    ├── iyzico                    # POST (payment events)
    ├── bamboohr                  # POST (if push-based sync supported)
    └── kolayik                   # POST (if push-based sync supported)
```

### 4.3 Middleware Pipeline

Every request passes through the following middleware chain:

```
Request
  │
  ├─ 1. helmet()               # Security headers
  ├─ 2. cors()                 # CORS with allowed origins whitelist
  ├─ 3. express.json()         # Body parsing (limit: 10mb)
  ├─ 4. requestId()            # Attach UUID to each request for tracing
  ├─ 5. requestLogger()        # Log method, path, duration, status
  ├─ 6. rateLimiter()          # Rate limiting (see below)
  ├─ 7. authMiddleware()       # JWT verification via Supabase JWKS (skip for public routes)
  ├─ 8. tenantMiddleware()     # Extract and validate tenant context
  ├─ 9. rbacMiddleware()       # Role-based permission check
  ├─ 10. zodValidate()         # Request body/query/params validation via Zod schemas
  ├─ 11. [route handler]       # Business logic
  ├─ 12. errorHandler()        # Global error handler (catches all thrown errors)
  └─ Response
```

**Rate limiting tiers:**

| Tier | Limit | Applied To |
|---|---|---|
| General | 100 req/min per IP | All endpoints |
| Auth | 10 req/min per IP | `/auth/*` |
| Webhooks | 50 req/min per IP | `/webhooks/*` |
| CSV Import | 5 req/min per user | `/employees/import/*` |

### 4.4 API Response Envelope

All responses follow a consistent envelope:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 142,
    "totalPages": 6
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri.",
    "details": [
      { "field": "email", "message": "Geçerli bir e-posta adresi giriniz." }
    ]
  }
}
```

### 4.5 Pagination, Filtering, and Sorting

All list endpoints support:

| Parameter | Type | Default | Example |
|---|---|---|---|
| `page` | number | 1 | `?page=2` |
| `pageSize` | number | 25 | `?pageSize=50` (max 100) |
| `sort` | string | `created_at` | `?sort=delivery_date` |
| `order` | `asc` or `desc` | `desc` | `?order=asc` |
| `search` | string | - | `?search=Ahmet` |
| `[field]` | varies | - | `?status=confirmed&district=besiktas` |

---

## 5. Frontend Architecture

### 5.1 apps/web (Customer Portal + Bakery Portal)

Both the Customer Portal and the Bakery Portal are served from the same Next.js application. The portal type is determined by the authenticated user's `user_type` claim, and routing is prefixed accordingly.

**App Router structure:**

```
apps/web/src/app/
├── (auth)/                          # Public auth pages (no layout chrome)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── verify-email/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── invitation/[token]/page.tsx  # Accept invitation (company user or bakery)
│
├── (customer)/                      # Customer Portal (requires company_user auth)
│   ├── layout.tsx                   # Customer Portal shell (sidebar, header)
│   ├── dashboard/page.tsx           # Overview: upcoming birthdays, orders, stats
│   ├── onboarding/page.tsx          # Multi-step onboarding wizard
│   ├── employees/
│   │   ├── page.tsx                 # Employee list with search/filter
│   │   ├── import/page.tsx          # CSV import flow
│   │   └── [id]/page.tsx            # Employee detail (drawer or full page)
│   ├── orders/
│   │   ├── page.tsx                 # Upcoming + pending orders
│   │   ├── new/page.tsx             # Ad-hoc order creation
│   │   ├── history/page.tsx         # Past orders
│   │   └── [id]/page.tsx            # Order detail
│   ├── rules/
│   │   ├── page.tsx                 # Ordering rules list
│   │   └── [id]/page.tsx            # Rule configuration
│   ├── catalogue/page.tsx           # Browse cakes
│   ├── billing/
│   │   ├── page.tsx                 # Billing overview + invoices
│   │   └── payment-methods/page.tsx # Manage cards
│   ├── integrations/page.tsx        # BambooHR, KolayIK connections
│   ├── settings/
│   │   ├── page.tsx                 # Company profile
│   │   ├── team/page.tsx            # User/role management
│   │   ├── delivery/page.tsx        # Default delivery settings
│   │   └── notifications/page.tsx   # Notification preferences
│   └── not-authorized/page.tsx      # 403 page
│
├── (bakery)/                        # Bakery Portal (requires bakery_user auth)
│   ├── layout.tsx                   # Bakery Portal shell
│   ├── dashboard/page.tsx           # Today's orders, stats
│   ├── orders/
│   │   ├── page.tsx                 # Incoming + active orders
│   │   ├── calendar/page.tsx        # Calendar view of upcoming orders
│   │   ├── history/page.tsx         # Past orders
│   │   └── [id]/page.tsx            # Order detail (accept/reject/status)
│   ├── prices/
│   │   ├── page.tsx                 # Current price list
│   │   └── requests/page.tsx        # Price change requests
│   ├── payouts/page.tsx             # Payout history
│   ├── settings/
│   │   ├── page.tsx                 # Bakery profile
│   │   └── notifications/page.tsx   # Notification preferences
│   └── setup/page.tsx               # Initial bakery profile setup
│
└── api/                             # Next.js route handlers (BFF proxy if needed)
    └── auth/
        └── callback/route.ts        # Supabase Auth callback
```

### 5.2 apps/admin (Admin Dashboard)

```
apps/admin/src/app/
├── (auth)/
│   └── login/page.tsx
│
├── (dashboard)/
│   ├── layout.tsx                   # Admin shell (sidebar, header)
│   ├── page.tsx                     # Key metrics dashboard (REQ-AD-040)
│   ├── companies/
│   │   ├── page.tsx                 # Company list
│   │   └── [id]/page.tsx            # Company detail
│   ├── bakeries/
│   │   ├── page.tsx                 # Bakery list
│   │   ├── new/page.tsx             # Onboard new bakery
│   │   └── [id]/page.tsx            # Bakery detail + performance
│   ├── orders/
│   │   ├── page.tsx                 # All orders (filterable)
│   │   ├── today/page.tsx           # Today's deliveries
│   │   └── [id]/page.tsx            # Order detail (assign, override status)
│   ├── catalogue/
│   │   ├── page.tsx                 # Cake catalogue management
│   │   └── [id]/page.tsx            # Edit cake item
│   ├── pricing/
│   │   ├── page.tsx                 # Master price list
│   │   └── requests/page.tsx        # Bakery price change requests
│   ├── subscriptions/page.tsx       # Subscription plan management
│   ├── finance/
│   │   ├── page.tsx                 # Financial overview
│   │   ├── invoices/page.tsx        # All invoices
│   │   └── payouts/page.tsx         # Bakery payouts
│   ├── reports/
│   │   ├── orders/page.tsx          # Order analytics
│   │   ├── revenue/page.tsx         # Revenue reports
│   │   └── birthday-coverage/page.tsx
│   ├── settings/
│   │   ├── page.tsx                 # System settings (scheduling params, policies)
│   │   ├── districts/page.tsx       # Delivery zone management
│   │   ├── holidays/page.tsx        # Public holiday calendar
│   │   └── notifications/page.tsx   # Notification template editor
│   ├── tax-requests/page.tsx        # Tax number change requests
│   └── audit-log/page.tsx           # Audit trail
```

### 5.3 Shared Frontend Concerns

**State management (Zustand):**
- `useAuthStore` -- current user, token, login/logout actions
- `useOnboardingStore` -- onboarding wizard step state
- `useNotificationStore` -- toast/snackbar queue

**Data fetching:**
- Server Components for initial page loads (RSC in Next.js 16)
- `fetch()` with revalidation for server-side data
- Client-side mutations via custom hooks wrapping `fetch` with optimistic updates where appropriate

**Forms:** React Hook Form + Zod for all forms. Zod schemas are imported from `packages/shared` so validation logic is shared between frontend and backend.

**i18n:** Turkish-only at launch. All UI strings externalized into a `tr.json` locale file loaded at build time. The infrastructure supports adding new locales without routing changes.

---

## 6. Notification System

### 6.1 Architecture

Notifications are processed through a queue-based system to decouple the triggering event from the delivery mechanism, ensuring reliability and retry capability.

```
Event Source (API handler / cron job)
         │
         v
  notification_queue table (PostgreSQL)
         │
         v
  Notification Worker (runs every 30 seconds via setInterval)
         │
         ├─> Email channel (Resend API)
         ├─> WhatsApp channel (WhatsApp Business API)
         └─> In-app notification (notification_log table)
```

### 6.2 Queue Table Schema

```sql
CREATE TABLE notification_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL,          -- e.g., 'order_confirmed', 'payment_failed'
  recipient_id  UUID NOT NULL,          -- user ID
  channels      TEXT[] NOT NULL,        -- ['email', 'whatsapp']
  payload       JSONB NOT NULL,         -- template variables
  status        TEXT DEFAULT 'pending', -- pending, processing, sent, failed, skipped
  attempts      INT DEFAULT 0,
  max_attempts  INT DEFAULT 3,
  scheduled_at  TIMESTAMPTZ DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_queue_status ON notification_queue(status, scheduled_at);
```

### 6.3 Event Types

| Event Type | Recipients | Channels | Trigger |
|---|---|---|---|
| `order_created` | HR manager | email | Automatic order generated |
| `order_pending_approval` | HR manager | email, whatsapp | Draft order needs approval |
| `order_confirmed` | HR manager | email | Order confirmed |
| `order_sent_to_bakery` | HR manager | email | Order released to bakery |
| `order_accepted` | HR manager | email, whatsapp | Bakery accepted |
| `order_rejected` | HR manager | email, whatsapp | Bakery rejected |
| `order_out_for_delivery` | HR manager | email, whatsapp | Bakery marked out for delivery |
| `order_delivered` | HR manager | email | Delivery confirmed |
| `order_cancelled` | HR manager, bakery | email | Order cancelled |
| `payment_failed` | Company owner | email, whatsapp | Card charge failed |
| `bakery_new_order` | Bakery admin | email, whatsapp | New order assigned to bakery |
| `bakery_acceptance_reminder` | Bakery admin | email, whatsapp | 12h before acceptance deadline |
| `bakery_daily_digest` | Bakery admin | email | Daily order summary |
| `bakery_order_reassigned` | Bakery admin | email | Order reassigned away |
| `bakery_price_request_resolved` | Bakery admin | email | Price request approved/rejected |
| `birthday_weekly_reminder` | HR manager | email | 7-day advance birthday list |
| `invoice_generated` | Company owner, finance | email | Monthly invoice ready |
| `approval_reminder` | HR manager | email, whatsapp | Unapproved order nearing deadline |
| `hr_sync_failed` | HR manager | email | BambooHR/KolayIK sync error |
| `account_suspended` | Company owner | email | Account suspended by admin |

### 6.4 Template Resolution

1. Worker reads the `event_type` from the queue entry
2. Looks up the template for that event type from the `notification_templates` table
3. If no active template exists, falls back to a hard-coded default
4. Substitutes variables from the `payload` JSON (e.g., `{{employee_name}}`, `{{delivery_date}}`)
5. Dispatches via the appropriate channel

### 6.5 WhatsApp Specifics

- All WhatsApp messages use pre-approved HSM (Highly Structured Message) templates registered with Meta
- User opt-in is recorded in the `notification_preferences` table
- If WhatsApp delivery fails (user not on WhatsApp), the system falls back to SMS, then logs the failure
- Rate limit: max 1 WhatsApp message per user per event (no duplicates)

### 6.6 Retry Strategy

- Failed notifications are retried up to 3 times with exponential backoff: 1 min, 5 min, 30 min
- After 3 failures, the notification is marked `failed` and an admin alert is created

---

## 7. Order Scheduling System

### 7.1 Daily Birthday Detection Cron

A cron job runs at **00:01 Istanbul time (UTC+3)** daily. It is implemented using `node-cron` within the Express API process.

**Algorithm:**

```
FOR EACH company WHERE status = 'active' AND has_active_subscription = true:
  lead_time = company.lead_time_days OR system_default (60)

  FOR EACH employee WHERE is_active = true AND do_not_send = false:
    target_date = TODAY + lead_time
    employee_birthday_this_year = make_date(YEAR(target_date), MONTH(dob), DAY(dob))

    IF employee_birthday_this_year == target_date:
      FOR EACH active ordering_rule of the company:
        IF rule matches employee (all_birthdays, or round_birthday with matching age):
          -- Check if order already exists for this employee + date
          IF NOT EXISTS order for (employee_id, delivery_date):
            -- Check if birthday falls on holiday/weekend
            actual_delivery_date = next_working_day(employee_birthday_this_year)

            CREATE order:
              status = 'draft' (if approval_required) OR 'scheduled'
              cake_type = employee_override OR rule_default
              cake_size = employee_override OR rule_default
              custom_text = render_template(rule.template, employee)
              delivery_address = employee.office_address OR company.address
              delivery_date = actual_delivery_date

            QUEUE notification: order_created (or order_pending_approval)
```

### 7.2 Order Lifecycle State Machine

```
                                  ┌──────────────┐
                                  │    DRAFT      │  (auto-created by scheduler)
                                  └──────┬───────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │ (approval    │ (auto-confirm │
                          │  required)   │  at T-30)     │
                          v              v               │
                   ┌──────────────┐                      │
                   │   PENDING    │                      │
                   │   APPROVAL   │                      │
                   └──────┬───────┘                      │
                          │ (approved)                   │
                          v                              │
                   ┌──────────────┐ <───────────────────┘
                   │  SCHEDULED   │
                   └──────┬───────┘
                          │ (released to bakery at T-7)
                          v
                   ┌──────────────┐
                   │  ASSIGNED    │  (bakery notified)
                   └──────┬───────┘
                          │
               ┌──────────┼──────────┐
               │ (accept)            │ (reject / timeout)
               v                     v
        ┌──────────────┐     ┌──────────────┐
        │  CONFIRMED   │     │  REASSIGNING │──> ASSIGNED (new bakery)
        └──────┬───────┘     └──────────────┘    or ESCALATED (no bakery)
               │
               v
        ┌──────────────┐
        │ OUT FOR      │
        │ DELIVERY     │
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │  DELIVERED   │
        └──────────────┘

  Side transitions (from most states):
  ────> CANCELLED (by customer, admin, or auto-cancel)
  ────> FAILED (delivery failure, marked by admin)
```

### 7.3 Supporting Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| Birthday order creation | Daily 00:01 IST | Creates draft/scheduled orders per company rules |
| Auto-confirm drafts | Daily 00:15 IST | Confirms draft orders that reach T-30 (no approval required) |
| Release to bakery | Daily 00:30 IST | Moves scheduled orders to "assigned" at T-7, assigns bakery |
| Acceptance deadline check | Hourly | Reassigns orders where bakery has not responded within the deadline |
| Approval auto-cancel | Daily 01:00 IST | Cancels unapproved orders within 3 days of delivery |
| Approval reminder | Daily 06:00 IST | Sends reminders for unapproved orders within 7 days of delivery |
| Overdue delivery alert | Hourly | Alerts admin for orders past delivery date + 2h not marked delivered |
| HR sync (BambooHR) | Daily 02:00 UTC | Syncs employee data from BambooHR |
| HR sync (KolayIK) | Daily 02:30 UTC | Syncs employee data from KolayIK |
| Monthly invoice generation | 1st of month 03:00 IST | Generates invoices for all invoice-based companies |
| Payment retry | Daily 04:00 IST | Retries failed payments (up to 3 attempts) |
| Bakery daily digest | Daily 08:00 IST | Sends next-day order summary to bakeries |
| Weekly birthday reminder | Monday 09:00 IST | Sends upcoming birthday list to HR managers |

---

## 8. Payment Flow

### 8.1 iyzico Integration Architecture

CakeDay integrates with iyzico's REST API. No raw card data ever touches CakeDay servers.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser     │     │  CakeDay    │     │  iyzico     │
│  (Next.js)   │     │  API        │     │  API        │
└──────┬───────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │  1. Init payment   │                    │
       │ ─────────────────> │                    │
       │                    │  2. Create checkout│
       │                    │ ─────────────────> │
       │                    │                    │
       │  3. Checkout form  │ <───────────────── │
       │ <───────────────── │                    │
       │                    │                    │
       │  4. User enters    │                    │
       │     card details   │                    │
       │ ──────────────────────────────────────> │
       │                    │                    │
       │  5. 3D Secure      │                    │
       │ <──────────────────────────────────────>│
       │                    │                    │
       │                    │  6. Webhook:       │
       │                    │     payment_success│
       │                    │ <───────────────── │
       │                    │                    │
       │  7. Redirect to    │                    │
       │     success page   │                    │
       │ <───────────────── │                    │
```

### 8.2 Card Tokenization

1. User navigates to Payment Methods
2. CakeDay API calls iyzico to create a card registration form
3. iyzico.js renders a hosted form in an iframe on the client
4. User submits card details directly to iyzico
5. 3D Secure challenge completes
6. iyzico returns a `cardUserKey` and `cardToken` to CakeDay API via callback
7. CakeDay stores `cardUserKey` and `cardToken` (no raw PAN) in `payment_methods` table
8. For future charges, CakeDay sends the token to iyzico

### 8.3 Payment Modes

**Per-order payment:**
- Triggered when an ad-hoc order is confirmed or when a scheduled order reaches "confirmed" status
- Charges the default payment method via iyzico using the stored card token
- If charge fails, the order is held and the user is notified

**Monthly invoicing (enterprise):**
- All orders within a calendar month are accumulated
- On the 1st of the following month, the system generates an invoice
- If the company has auto-charge enabled, the stored card is charged
- If the company uses manual invoice payment, a PDF invoice is emailed
- Payment due within 14 days; overdue triggers automated order suspension after 30 days

### 8.4 Refunds

- Refunds are initiated by platform admins through the Admin Dashboard
- CakeDay API calls iyzico's refund endpoint
- Supports full and partial refunds
- Refund status is tracked via iyzico webhooks (`refund_completed`, `refund_failed`)

### 8.5 iyzico Webhook Handler

Endpoint: `POST /api/v1/webhooks/iyzico`

- Verifies the webhook signature using the iyzico secret key
- Processes events: `payment_success`, `payment_failed`, `refund_completed`
- Idempotent: uses `iyzicoPaymentId` as a deduplication key
- On `payment_failed`: queues a notification and schedules a retry

---

## 9. HR Integration Strategy

### 9.1 Architecture

HR integrations follow an adapter pattern. Each provider implements a common interface:

```typescript
// packages/shared/src/types/hr-integration.ts
interface HRIntegrationAdapter {
  testConnection(credentials: HRCredentials): Promise<{ success: boolean; employeeCount: number }>;
  fetchEmployees(credentials: HRCredentials): Promise<HREmployee[]>;
  mapToEmployee(hrEmployee: HREmployee): Partial<Employee>;
}
```

### 9.2 Sync Algorithm

1. Fetch all employees from the HR provider
2. Map external fields to CakeDay employee fields using the provider-specific field mapping
3. For each mapped employee:
   - Match by `external_id` + `source` (primary) or by `email` (fallback)
   - If match found: update existing record, set `source` field, set `updated_at`
   - If no match: create new employee record
4. For each existing employee with this `source` that was NOT in the fetched list:
   - Mark as `is_active = false` (do not delete)
5. Log the sync result: added, updated, deactivated, errors
6. If both BambooHR and KolayIK are active: last-write-wins per employee, with a `conflict_flag` set for admin review

### 9.3 Rate Limiting

- Manual sync: limited to 1 per hour per company per provider
- Automatic (nightly) sync: no rate limit
- API calls to BambooHR/KolayIK are rate-limited according to their respective API documentation

### 9.4 Credentials Storage

- API keys for BambooHR and KolayIK are stored encrypted (AES-256) in the `integrations` table
- Decryption happens only at sync time, in memory
- Credentials are never exposed in API responses (masked with `****`)

---

## 10. File Upload Strategy

### 10.1 Provider

All file uploads use **Supabase Storage** (S3-compatible).

### 10.2 Buckets

| Bucket | Access | Purpose | Max Size |
|---|---|---|---|
| `company-logos` | Public (read) | Company logo images | 2 MB |
| `bakery-photos` | Public (read) | Bakery profile photos | 5 MB |
| `cake-images` | Public (read) | Cake catalogue photos | 5 MB |
| `delivery-photos` | Authenticated | Delivery confirmation photos | 5 MB |
| `csv-imports` | Authenticated | Temporary CSV files for import | 5 MB |
| `invoices` | Authenticated | Generated invoice PDFs | 10 MB |
| `payout-receipts` | Authenticated | Bank transfer receipt uploads | 5 MB |

### 10.3 Upload Flow

1. Frontend requests a signed upload URL from the API: `POST /api/v1/uploads/signed-url`
2. API generates a signed URL via Supabase Storage SDK (valid for 5 minutes)
3. Frontend uploads the file directly to Supabase Storage using the signed URL
4. Frontend sends the resulting file path back to the API to associate with the entity
5. API validates the file path exists and updates the entity record

### 10.4 Image Processing

- Images are served via Supabase Storage's built-in image transformation (resize, format conversion)
- Cake catalogue images are served in WebP format with lazy loading
- Thumbnails: 200x200 for lists, original for detail views

---

## 11. Error Handling Strategy

### 11.1 Error Classification

| Category | HTTP Code | Error Code | Handling |
|---|---|---|---|
| Validation errors | 400 | `VALIDATION_ERROR` | Return field-level errors from Zod |
| Authentication | 401 | `UNAUTHORIZED` | Redirect to login |
| Authorization | 403 | `FORBIDDEN` | Show "no permission" page |
| Not found | 404 | `NOT_FOUND` | Show 404 page |
| Conflict | 409 | `CONFLICT` | E.g., duplicate VKN |
| Rate limit | 429 | `RATE_LIMITED` | Show retry-after header |
| Server error | 500 | `INTERNAL_ERROR` | Log to Sentry, show generic error |
| External service | 502 | `EXTERNAL_SERVICE_ERROR` | iyzico/Resend/WhatsApp down |

### 11.2 Custom Error Classes

```typescript
// apps/api/src/errors/
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export class ValidationError extends AppError { /* 400 */ }
export class UnauthorizedError extends AppError { /* 401 */ }
export class ForbiddenError extends AppError { /* 403 */ }
export class NotFoundError extends AppError { /* 404 */ }
export class ConflictError extends AppError { /* 409 */ }
```

### 11.3 Global Error Handler

The Express global error handler catches all errors, logs them (Sentry for 5xx, structured JSON for all), and returns the standard error envelope. Stack traces are never exposed in production.

### 11.4 Frontend Error Handling

- API errors are caught by a shared `apiClient` wrapper that maps status codes to user-facing Turkish error messages
- Network errors show a "connection lost" toast with retry
- React Error Boundaries catch render errors and show a fallback UI
- Sentry browser SDK captures unhandled exceptions

---

## 12. Security Considerations

### 12.1 KVKK Compliance

Turkey's Personal Data Protection Law (KVKK - Kisisel Verilerin Korunmasi Kanunu) requires:

1. **Consent at registration:** A KVKK-compliant privacy notice and explicit consent checkbox during company registration. Consent timestamp and version are stored.
2. **Data processing agreement:** Companies importing employee data are responsible for their own KVKK obligations toward employees. The platform acts as a "data processor" and the company as "data controller."
3. **Right to access and deletion:** Admin dashboard provides tools to export all personal data for a user (JSON/CSV) and to anonymize/delete personal data upon request.
4. **Data minimization:** Only collect necessary personal data (name, DOB, department, optional email).
5. **Data retention:** Per Section 8.2 of the requirements document -- 7-year retention for financial records, 2-year post-termination for employee records, then anonymization.
6. **Cross-border transfer:** Supabase project is configured in the EU (Frankfurt) region. No personal data is transferred outside the EU/Turkey without appropriate safeguards.

### 12.2 Data Encryption

| Layer | Method |
|---|---|
| Transit | TLS 1.2+ enforced on all connections |
| At rest (database) | Supabase-managed encryption (AES-256) |
| Sensitive fields (API keys, tokens) | Application-level AES-256-GCM encryption before storage |
| Payment data | Never stored; tokenized via iyzico |

### 12.3 Additional Security Measures

- **CORS:** Strict origin whitelist (only the Vercel frontend domains)
- **CSP:** Content Security Policy headers via Next.js and Helmet
- **Cookie security:** `HttpOnly`, `SameSite=Strict`, `Secure`
- **Input sanitization:** All user input is validated via Zod schemas; HTML is escaped
- **SQL injection prevention:** Drizzle ORM uses parameterized queries exclusively
- **Rate limiting:** Per-IP and per-user rate limits on all endpoints
- **Dependency scanning:** GitHub Dependabot + `pnpm audit` in CI
- **Audit logging:** All admin actions logged with actor, timestamp, and before/after values
- **Account lockout:** 5 failed login attempts = 15-minute lockout
- **Password policy:** Minimum 8 characters, 1 uppercase, 1 number, 1 special character

---

## 13. Caching Strategy

### 13.1 Server-Side Caching

For MVP, caching uses Supabase's built-in HTTP caching and in-memory caching on the Express server. Redis is deferred to post-MVP.

| Data | Strategy | TTL | Invalidation |
|---|---|---|---|
| Cake catalogue | In-memory (LRU) | 5 minutes | On catalogue update via admin |
| Subscription plans | In-memory (LRU) | 10 minutes | On plan update via admin |
| Public holiday calendar | In-memory (LRU) | 24 hours | On holiday update via admin |
| District list | In-memory (LRU) | 24 hours | On district update |
| Company profile (own) | No cache (always fresh) | -- | -- |
| Employee list | No cache | -- | -- |
| Orders | No cache | -- | -- |

**Implementation:** A simple `Map`-based cache with TTL, wrapped in a `CacheService` class. Ready to swap for Redis when needed.

### 13.2 Client-Side Caching

- Next.js 16 built-in fetch caching and revalidation
- `Cache-Control` headers set per endpoint:
  - Static content (cake images): `public, max-age=86400, s-maxage=86400`
  - API data: `private, no-cache` (always revalidate)
  - Invoices/PDFs: `private, max-age=3600`

---

## 14. Environment Configuration

### 14.1 Environment Variables

All environment variables are managed per-app and per-environment. Secrets are stored in the hosting platform's secret manager (Vercel Environment Variables, Railway Variables).

**apps/api (.env):**

```
# Server
NODE_ENV=production
PORT=3001
API_BASE_URL=https://api.cakeday.com.tr

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# iyzico
IYZICO_API_KEY=sandbox-...
IYZICO_SECRET_KEY=sandbox-...
IYZICO_BASE_URL=https://api.iyzipay.com
IYZICO_WEBHOOK_SECRET=...

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=bildirim@cakeday.com.tr
RESEND_FROM_NAME=CakeDay

# WhatsApp
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# HR Integrations
ENCRYPTION_KEY=...  # AES-256 key for encrypting stored API credentials

# Sentry
SENTRY_DSN=https://...

# CORS
CORS_ORIGINS=https://cakeday.com.tr,https://admin.cakeday.com.tr

# Feature Flags
FEATURE_KOLAYIK_INTEGRATION=true
FEATURE_WHATSAPP_NOTIFICATIONS=true
```

**apps/web (.env):**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.cakeday.com.tr/api/v1
NEXT_PUBLIC_IYZICO_JS_URL=https://static.iyzipay.com/...
SENTRY_DSN=https://...
```

**apps/admin (.env):**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.cakeday.com.tr/api/v1
SENTRY_DSN=https://...
```

### 14.2 Environments

| Environment | Frontend URL | API URL | Database | Purpose |
|---|---|---|---|---|
| Local | `localhost:3000` / `localhost:3002` | `localhost:3001` | Local Supabase (Docker) | Development |
| Staging | `staging.cakeday.com.tr` | `api-staging.cakeday.com.tr` | Supabase staging project | QA and testing |
| Production | `cakeday.com.tr` | `api.cakeday.com.tr` | Supabase production project | Live |

### 14.3 CI/CD Pipeline (GitHub Actions)

```
Push to main
  │
  ├─ Lint (ESLint + Prettier)
  ├─ Type check (tsc --noEmit)
  ├─ Unit tests (Vitest)
  ├─ Build (Turborepo)
  │
  ├─ Deploy API to Railway (staging)
  ├─ Deploy web to Vercel (staging)
  ├─ Deploy admin to Vercel (staging)
  │
  ├─ E2E tests (Playwright against staging)
  │
  └─ Promote to production (manual approval)
```
