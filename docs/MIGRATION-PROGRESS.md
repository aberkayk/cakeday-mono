# Migration Progress: Monorepo → Single Next.js

Tracking the consolidation of `apps/web` + `apps/admin` + `apps/api` + `packages/shared` into a single Next.js project.

**Design Spec:** `docs/superpowers/specs/2026-04-09-single-nextjs-consolidation-design.md`

## Migration Steps

### Step 1: Move `apps/web` to repo root
- [x] Copy `apps/web/` contents to repo root
- [x] Replace root `package.json` with web's `package.json`
- [x] Remove `turbo.json`
- [x] Remove `pnpm-workspace.yaml`
- [x] Update `tsconfig.json` paths
- [x] Update `next.config.ts` if needed
- [x] Verify `pnpm install` works
- [x] Verify `pnpm dev` starts successfully

### Step 2: Move shared package
- [x] Copy `packages/shared/src/` → `src/lib/shared/`
- [x] Update all imports from `@cakeday/shared` → `@/lib/shared`
- [x] Remove `packages/` directory
- [x] Verify build succeeds

### Step 3: Move backend layer
- [x] Copy `apps/api/src/db/schema/` → `src/lib/db/schema/`
- [x] Copy `apps/api/src/services/` → `src/lib/services/`
- [x] Copy `apps/api/drizzle.config.ts` → repo root
- [x] Copy `apps/api/src/db/migrations/` → `src/lib/db/migrations/`
- [x] Refactor services: remove Express req/res dependency → pure functions
- [x] Add backend dependencies to `package.json` (drizzle-orm, pg, resend, etc.)
- [x] Create `src/lib/db/index.ts` (DB connection + drizzle instance)
- [x] Verify DB connection works

### Step 4: Add admin pages
- [x] Copy `apps/admin/src/app/(dashboard)/` → `src/app/(admin)/`
- [x] Copy admin-specific components → `src/components/admin/`
- [x] Remove duplicate shadcn/ui components (keep web's versions)
- [x] Update admin page imports
- [x] Verify admin pages render

### Step 5: Create Server Actions
- [x] Create `src/actions/auth.ts`
- [x] Create `src/actions/companies.ts`
- [x] Create `src/actions/employees.ts`
- [x] Create `src/actions/orders.ts`
- [x] Create `src/actions/ordering-rules.ts`
- [x] Create `src/actions/bakery.ts`
- [x] Create `src/actions/admin.ts`
- [x] Create auth helper: `getCurrentUser()` in `src/lib/supabase/server.ts`
- [x] Create guard helpers: `requireRole()`, `requireCompanyUser()`, `requireBakeryUser()`
- [x] Wire up Server Actions to pages/forms

### Step 6: Create API Routes
- [x] Create `src/app/api/v1/webhooks/iyzico/route.ts`
- [x] Create `src/app/api/v1/cron/create-birthday-orders/route.ts` (+ TODO: trigger)
- [x] Create `src/app/api/v1/cron/send-reminders/route.ts` (+ TODO: trigger)
- [x] Create `src/app/api/v1/health/route.ts`

### Step 7: Update middleware
- [x] Update `src/middleware.ts` with role-based route protection
- [x] Add `/admin/*` guard (platform_admin only)
- [x] Add `/bakery/*` guard (bakery_admin only)
- [x] Add `/dashboard/*` guard (company user only)
- [x] Add post-login redirect by role

### Step 8: Cleanup
- [x] Delete `apps/` directory
- [x] Delete `packages/` directory
- [x] Remove unused dependencies (express, cors, helmet, morgan, multer, express-rate-limit)
- [x] Consolidate environment variables into `.env.local`
- [x] Update `.gitignore` if needed
- [x] Final build verification: `pnpm build`
- [x] Smoke test all portals: auth, dashboard, bakery, admin

## Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Design spec | Done | Approved 2026-04-09 |
| Step 1: Move web to root | Done | |
| Step 2: Move shared | Done | |
| Step 3: Move backend | Done | |
| Step 4: Add admin pages | Done | |
| Step 5: Server Actions | Done | |
| Step 6: API Routes | Done | |
| Step 7: Middleware | Done | |
| Step 8: Cleanup | Done | |
