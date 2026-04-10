# CakeDay — Project Status

**Date:** 2026-04-10
**Branch:** `feature/single-nextjs-migration`
**Build:** Passing (31 pages compiled)

---

## What Is CakeDay?

B2B birthday cake delivery platform for the Turkish market. Companies register, add employees, and the platform automates birthday cake orders to partner bakeries in Istanbul.

**Three user portals:**
- **Company Portal** (`/dashboard`) — HR managers manage employees, create orders, set ordering rules
- **Bakery Portal** (`/bakery`) — Bakeries accept/reject orders, manage pricing
- **Admin Portal** (`/admin`) — Platform admins manage companies, bakeries, catalogue, pricing requests

---

## What Changed: Monorepo → Single Next.js

The project was a Turborepo monorepo with 4 packages:
```
BEFORE:                          AFTER:
apps/web/      (Next.js)         src/           (single Next.js app)
apps/admin/    (Next.js)         ├── app/       (all 3 portals + API routes)
apps/api/      (Express.js)      ├── actions/   (server actions)
packages/shared/ (types)         ├── lib/       (DB, services, auth, shared types)
                                 └── components/
```

**13 commits, 238 files changed, -12,910 / +4,670 lines.**

### Migration Summary

| Step | What | Commit |
|------|------|--------|
| 1 | Web app moved to repo root, monorepo config removed | `45cbe52` |
| 2 | Shared types/schemas moved to `src/lib/shared/` | `fd6e0f0` |
| 3 | Drizzle DB schema + connection added to `src/lib/db/` | `fadb424` |
| 4 | Express services refactored to pure functions in `src/lib/services/` | `ed3fec7` |
| 5 | Auth helpers created (`getCurrentUser`, role guards) | `928ca56` |
| 6 | Server Actions created for all portals | `6561486` |
| 7 | Admin pages added under `/admin` | `d1df6da` |
| 8 | Role-based middleware (route protection) | `3d82763` |
| 9 | API routes (health, webhooks, cron) | `35ff8d0` |
| 10 | File location fixes | `657c6fe` |
| 11 | Pages migrated from fetch-to-Express → server components + actions | `bd1a550` |
| 12 | Old `apps/`, `packages/` deleted, build fixed | `0828303` |

---

## Current Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle |
| Auth | Supabase Auth (JWT, cookies) |
| State | Zustand (client-side only) |
| Package Manager | pnpm |

### How Data Flows

```
Browser
  │
  ├─ Server Component (page.tsx)
  │    └─ calls service directly (e.g., employeeService.list())
  │         └─ queries DB via Drizzle ORM
  │              └─ returns data → renders HTML
  │
  ├─ Client Component (form/button)
  │    └─ calls Server Action (e.g., createEmployee())
  │         └─ validates with Zod → checks auth → calls service
  │              └─ revalidatePath() → page re-renders
  │
  └─ External (webhooks, cron)
       └─ hits API Route (e.g., /api/v1/webhooks/iyzico)
            └─ verifies secret → calls service
```

### Backend Strategy (Hybrid)

- **Server Actions** (`src/actions/`) — All UI mutations (forms, buttons). Auth-checked, Zod-validated.
- **Server Components** — All data reading. Call services directly, no fetch.
- **API Routes** (`src/app/api/v1/`) — Only for external access: webhooks, cron, health check.

No Express. No separate backend deployment. No REST API for frontend.

### Auth & Authorization

| Concern | Implementation |
|---------|---------------|
| Session management | Supabase Auth via `@supabase/ssr`, cookies |
| Session refresh | `src/middleware.ts` → `updateSession()` on every request |
| Route protection | Middleware checks role for `/admin/*`, `/bakery/*`, `/dashboard/*` |
| Action authorization | `requireAuth()` + `requireRole()` + `requireCompanyUser()` in every server action |
| Admin Supabase client | `src/lib/supabase/admin.ts` (service role key, bypasses RLS) |

**Roles:** `company_owner`, `hr_manager`, `finance`, `viewer`, `bakery_admin`, `platform_admin`

### Database

PostgreSQL with ~20 tables via Drizzle ORM.

**Core entities:** profiles, companies, company_memberships, employees, ordering_rules, orders, order_status_history, bakeries, bakery_districts, cake_types, cake_prices, price_change_requests, payments, invoices, notification_log, system_settings, audit_log

Schema: `src/lib/db/schema/` (enums.ts, tables.ts, relations.ts)
Connection: `src/lib/db/index.ts`
Config: `drizzle.config.ts` (reads from `.env.local`)

---

## Project Structure

```
cakeday/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login, register, forgot-password, verify-email
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/              # Company portal
│   │   │   ├── page.tsx            # Dashboard home (stats, upcoming birthdays)
│   │   │   ├── employees/          # Employee list + CSV import
│   │   │   ├── orders/             # Order list + new order form
│   │   │   ├── ordering-rules/     # Automation rules
│   │   │   ├── billing/            # Invoices
│   │   │   ├── settings/           # Company profile + notification settings
│   │   │   └── layout.tsx          # Sidebar + header layout
│   │   ├── bakery/                 # Bakery portal
│   │   │   ├── page.tsx            # Bakery dashboard
│   │   │   ├── orders/             # Accept/reject/deliver orders
│   │   │   ├── pricing/            # Price management + change requests
│   │   │   ├── settings/           # Bakery profile + banking
│   │   │   └── layout.tsx
│   │   ├── admin/                  # Platform admin portal
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── companies/          # List + detail ([id])
│   │   │   ├── bakeries/           # List + detail ([id])
│   │   │   ├── orders/             # Global order view
│   │   │   ├── catalogue/          # Cake types management
│   │   │   ├── pricing-requests/   # Review price change requests
│   │   │   ├── settings/           # System settings
│   │   │   └── layout.tsx
│   │   ├── api/v1/                 # API routes (external only)
│   │   │   ├── health/route.ts
│   │   │   ├── webhooks/iyzico/route.ts
│   │   │   └── cron/
│   │   │       ├── create-birthday-orders/route.ts
│   │   │       └── send-reminders/route.ts
│   │   ├── layout.tsx              # Root layout (fonts, metadata)
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css
│   ├── actions/                    # Server Actions
│   │   ├── auth.ts                 # register, login, logout, forgotPassword
│   │   ├── employees.ts            # CRUD employees
│   │   ├── orders.ts               # create, cancel orders
│   │   ├── ordering-rules.ts       # CRUD rules
│   │   ├── companies.ts            # update profile/settings, invite user
│   │   ├── bakery.ts               # accept/reject/deliver, price change
│   │   └── admin.ts                # approve/suspend company, manage catalogue
│   ├── lib/
│   │   ├── auth.ts                 # getCurrentUser, requireAuth, requireRole, guards
│   │   ├── errors.ts               # AppError, NotFoundError, UnauthorizedError, etc.
│   │   ├── db/
│   │   │   ├── index.ts            # pg Pool + drizzle instance
│   │   │   └── schema/             # enums.ts, tables.ts, relations.ts, index.ts
│   │   ├── services/               # Business logic (pure functions, no framework dep)
│   │   │   ├── auth.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── employee.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── ordering-rule.service.ts
│   │   │   ├── bakery.service.ts
│   │   │   ├── cake.service.ts
│   │   │   └── email.service.ts
│   │   ├── shared/                 # Types, Zod schemas, constants
│   │   │   ├── types/index.ts
│   │   │   ├── schemas/index.ts
│   │   │   ├── constants/          # enums.ts, permissions.ts, index.ts
│   │   │   ├── utils/index.ts
│   │   │   └── index.ts
│   │   ├── supabase/               # Supabase clients
│   │   │   ├── server.ts           # Server component client (cookies)
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── middleware.ts        # Session refresh for middleware
│   │   │   └── admin.ts            # Service role client (bypasses RLS)
│   │   └── utils/
│   │       └── pagination.ts
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (18 components)
│   │   ├── layout/                 # Sidebars, headers (dashboard, bakery, admin)
│   │   ├── auth/                   # Login/register forms
│   │   ├── landing/                # Hero, features, pricing, FAQ, etc.
│   │   ├── dashboard/              # Stats, upcoming birthdays, settings
│   │   ├── employees/              # Table, form, CSV import
│   │   ├── orders/                 # List, card, form, cake selector
│   │   ├── rules/                  # Rule list, card, form
│   │   └── bakery/                 # Dashboard, order card, orders view
│   ├── hooks/
│   │   ├── use-auth.ts             # Client-side auth hook (Supabase session)
│   │   └── use-toast.ts            # Toast notifications
│   ├── stores/
│   │   └── auth-store.ts           # Zustand auth state
│   └── middleware.ts               # Route protection + session refresh
├── docs/
│   ├── PROJECT-STATUS.md           # This file
│   ├── MIGRATION-PROGRESS.md       # Step-by-step migration checklist (all done)
│   ├── architecture/               # Tech stack, DB schema, system architecture
│   ├── requirements/               # User stories, requirements
│   ├── api/                        # API design docs
│   └── superpowers/                # Design spec + implementation plan
├── drizzle.config.ts               # Drizzle ORM config
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── package.json                    # Single package, all deps
├── tsconfig.json
├── CLAUDE.md                       # AI agent instructions
└── AGENTS.md                       # Agent role definitions
```

---

## Environment Variables

**`.env.local`:**
```
# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# Supabase (server-only)
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Email (optional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@cakeday.com.tr
ENABLE_EMAIL=false

# Cron (API route protection)
CRON_SECRET=
```

---

## Running the Project

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio
```

---

## Known Gaps & TODOs

| Item | Status | Notes |
|------|--------|-------|
| `user_metadata.role` not set at registration | Open | Middleware role redirects fall back to `/dashboard`. Fix: set `role` in Supabase `user_metadata` during `authService.register()` |
| iyzico webhook | Stub | `src/app/api/v1/webhooks/iyzico/route.ts` — logs body, returns ok |
| Cron trigger mechanism | TBD | Endpoints exist at `/api/v1/cron/*`, protected by `CRON_SECRET`. Trigger depends on hosting choice. |
| Birthday order auto-creation | Stub | `create-birthday-orders` cron endpoint exists but logic not implemented |
| Reminder sending | Stub | `send-reminders` cron endpoint exists but logic not implemented |
| Admin pages data fetching | Placeholder | Admin pages render with placeholder/empty data. Need to wire to service layer. |
| `bakeryService.requestPriceChange` | Missing | Server action has `// TODO`, service method doesn't exist yet |
| `companyService.approve` / `suspend` | Inline | Admin actions do direct DB updates instead of using service methods |
| Hosting / deployment | TBD | No CI/CD, Docker, or deployment config yet |
| Testing | None | No unit/integration/E2E tests |
| Email sending | Disabled | `ENABLE_EMAIL=false`, Resend API key is placeholder |
| Payment integration | Not started | iyzico integration not implemented beyond webhook stub |
