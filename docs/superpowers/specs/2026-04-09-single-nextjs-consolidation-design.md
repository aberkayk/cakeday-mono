# Single Next.js Consolidation — Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Summary

Consolidate the current monorepo (apps/web + apps/admin + apps/api + packages/shared) into a single Next.js project. Goal: minimum effort MVP with no monorepo overhead.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Extend `apps/web` as base | Largest, most mature app — least migration effort |
| Backend strategy | Hybrid: Server Actions + API Routes | Server Actions for UI mutations; API Routes for webhooks, cron, health |
| Admin routing | `/admin/*` path-based | Single domain, no subdomain complexity |
| Monorepo | Remove entirely | MVP simplicity, no Turborepo overhead |
| DB & Auth | Keep as-is | Drizzle ORM + Supabase Auth unchanged |
| Hosting | TBD | Cron trigger mechanism left as `// TODO` |

## Project Structure

```
cakeday/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, register, forgot-password, verify-email
│   │   ├── (dashboard)/          # Company portal: orders, employees, rules, billing, settings
│   │   ├── (bakery)/             # Bakery portal: orders, pricing, settings
│   │   ├── (admin)/              # Platform admin: companies, bakeries, orders, catalogue, settings
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── webhooks/     # iyzico payment callback
│   │   │       ├── cron/         # Birthday orders, reminders (TODO: trigger)
│   │   │       └── health/       # Health check
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts
│   │   ├── companies.ts
│   │   ├── employees.ts
│   │   ├── orders.ts
│   │   ├── ordering-rules.ts
│   │   ├── bakery.ts
│   │   └── admin.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema/           # Drizzle schemas (from apps/api)
│   │   │   ├── index.ts          # DB connection + drizzle instance
│   │   │   └── migrations/
│   │   ├── services/             # Business logic (from apps/api/src/services)
│   │   │   ├── auth.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── employee.service.ts
│   │   │   ├── bakery.service.ts
│   │   │   ├── company.service.ts
│   │   │   └── email.service.ts
│   │   ├── shared/               # Types, Zod schemas, constants (from packages/shared)
│   │   │   ├── types/
│   │   │   ├── schemas/
│   │   │   └── constants/
│   │   ├── supabase/             # Supabase client (server + browser)
│   │   └── utils/
│   ├── components/               # UI components (shadcn/ui + custom)
│   ├── hooks/
│   ├── stores/                   # Zustand stores
│   └── middleware.ts             # Auth + role-based route guard
├── public/
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

## Auth & Middleware

### Route Protection (middleware.ts)

```
Request → Supabase session refresh (@supabase/ssr)
  → /admin/*     → role !== 'platform_admin' → redirect /login
  → /dashboard/* → no company_id            → redirect /login
  → /bakery/*    → role !== 'bakery_admin'   → redirect /login
  → /login, /register → has session          → redirect to portal by role
```

### Post-Login Redirect by Role

```
platform_admin → /admin
bakery_admin   → /bakery
company user   → /dashboard
```

### Auth in Server Actions

```typescript
const user = await getCurrentUser() // reads session from cookies
if (!user) throw new UnauthorizedError()
```

Guard helpers (pure functions, not Express middleware):
- `requireRole(...roles)` — throws if user role not in list
- `requireCompanyUser()` — throws if no company_id
- `requireBakeryUser()` — throws if not bakery_admin

### Auth in API Routes

- iyzico webhook → secret key verification
- Cron endpoints → `CRON_SECRET` header verification
- Health → no auth

## Registration Flow

No role selection at registration. Registration always creates a company + company_owner.

- **Company users** → register at `/register`
- **Bakery admins** → created by platform admin via `/admin/bakeries`
- **Platform admins** → seeded / manual
- **Other company roles** → invited by company_owner via `/dashboard/settings`

## Server Actions vs API Routes

### Server Actions (`src/actions/`)

| File | Operations |
|------|-----------|
| `auth.ts` | register, login, logout, forgotPassword, resetPassword |
| `companies.ts` | updateProfile, updateSettings, inviteUser, removeUser |
| `employees.ts` | create, update, delete, importCSV |
| `orders.ts` | create, cancel, list |
| `ordering-rules.ts` | create, update, delete |
| `bakery.ts` | acceptOrder, rejectOrder, markPreparing, markDelivered, requestPriceChange |
| `admin.ts` | approveCompany, suspendCompany, manageBakery, manageCatalogue, reviewPricing |

Pattern: `input → Zod validation → auth check → service call → revalidatePath`

### API Routes (`src/app/api/v1/`)

| Route | Purpose |
|-------|---------|
| `/api/v1/webhooks/iyzico` | Payment callback |
| `/api/v1/cron/create-birthday-orders` | Daily order creation — `// TODO: cron trigger` |
| `/api/v1/cron/send-reminders` | Notifications — `// TODO: cron trigger` |
| `/api/v1/health` | Health check |

### Data Reading

Server Components call services directly — no fetch, no client-side state:

```typescript
export default async function OrdersPage() {
  const user = await getCurrentUser()
  const orders = await orderService.listByCompany(user.companyId)
  return <OrderList orders={orders} />
}
```

## Migration Strategy

### Step 1: Move `apps/web` to repo root
- `apps/web/` contents → repo root
- Remove monorepo files: `turbo.json`, `pnpm-workspace.yaml`, root `package.json`
- `apps/web/package.json` → root `package.json`

### Step 2: Move shared package
- `packages/shared/src/` → `src/lib/shared/`
- Update imports: `@cakeday/shared` → `@/lib/shared`

### Step 3: Move backend layer
- `apps/api/src/db/schema/` → `src/lib/db/schema/`
- `apps/api/src/services/` → `src/lib/services/`
- `apps/api/drizzle.config.ts` → root
- Remove Express dependency from services (req/res → pure functions)
- Add backend deps to package.json: `drizzle-orm`, `pg`, `resend`

### Step 4: Add admin pages
- `apps/admin/src/app/(dashboard)/` → `src/app/(admin)/`
- Admin-specific components → `src/components/admin/`
- Remove duplicate shadcn/ui components

### Step 5: Create Server Actions
- Convert Express controllers → `src/actions/`
- Pattern: req parse + validate + service + res → Zod validate + auth + service + revalidate

### Step 6: Create API Routes
- Webhook, cron, health → `src/app/api/v1/`

### Step 7: Cleanup
- Delete `apps/`, `packages/` directories
- Remove unused deps: express, cors, helmet, morgan, multer, express-rate-limit
- Consolidate env vars into `.env.local`
- `docs/` stays as-is
