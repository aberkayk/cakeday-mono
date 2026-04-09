# Migration Progress: Monorepo → Single Next.js

Tracking the consolidation of `apps/web` + `apps/admin` + `apps/api` + `packages/shared` into a single Next.js project.

**Design Spec:** `docs/superpowers/specs/2026-04-09-single-nextjs-consolidation-design.md`

## Migration Steps

### Step 1: Move `apps/web` to repo root
- [ ] Copy `apps/web/` contents to repo root
- [ ] Replace root `package.json` with web's `package.json`
- [ ] Remove `turbo.json`
- [ ] Remove `pnpm-workspace.yaml`
- [ ] Update `tsconfig.json` paths
- [ ] Update `next.config.ts` if needed
- [ ] Verify `pnpm install` works
- [ ] Verify `pnpm dev` starts successfully

### Step 2: Move shared package
- [ ] Copy `packages/shared/src/` → `src/lib/shared/`
- [ ] Update all imports from `@cakeday/shared` → `@/lib/shared`
- [ ] Remove `packages/` directory
- [ ] Verify build succeeds

### Step 3: Move backend layer
- [ ] Copy `apps/api/src/db/schema/` → `src/lib/db/schema/`
- [ ] Copy `apps/api/src/services/` → `src/lib/services/`
- [ ] Copy `apps/api/drizzle.config.ts` → repo root
- [ ] Copy `apps/api/src/db/migrations/` → `src/lib/db/migrations/`
- [ ] Refactor services: remove Express req/res dependency → pure functions
- [ ] Add backend dependencies to `package.json` (drizzle-orm, pg, resend, etc.)
- [ ] Create `src/lib/db/index.ts` (DB connection + drizzle instance)
- [ ] Verify DB connection works

### Step 4: Add admin pages
- [ ] Copy `apps/admin/src/app/(dashboard)/` → `src/app/(admin)/`
- [ ] Copy admin-specific components → `src/components/admin/`
- [ ] Remove duplicate shadcn/ui components (keep web's versions)
- [ ] Update admin page imports
- [ ] Verify admin pages render

### Step 5: Create Server Actions
- [ ] Create `src/actions/auth.ts`
- [ ] Create `src/actions/companies.ts`
- [ ] Create `src/actions/employees.ts`
- [ ] Create `src/actions/orders.ts`
- [ ] Create `src/actions/ordering-rules.ts`
- [ ] Create `src/actions/bakery.ts`
- [ ] Create `src/actions/admin.ts`
- [ ] Create auth helper: `getCurrentUser()` in `src/lib/supabase/server.ts`
- [ ] Create guard helpers: `requireRole()`, `requireCompanyUser()`, `requireBakeryUser()`
- [ ] Wire up Server Actions to pages/forms

### Step 6: Create API Routes
- [ ] Create `src/app/api/v1/webhooks/iyzico/route.ts`
- [ ] Create `src/app/api/v1/cron/create-birthday-orders/route.ts` (+ TODO: trigger)
- [ ] Create `src/app/api/v1/cron/send-reminders/route.ts` (+ TODO: trigger)
- [ ] Create `src/app/api/v1/health/route.ts`

### Step 7: Update middleware
- [ ] Update `src/middleware.ts` with role-based route protection
- [ ] Add `/admin/*` guard (platform_admin only)
- [ ] Add `/bakery/*` guard (bakery_admin only)
- [ ] Add `/dashboard/*` guard (company user only)
- [ ] Add post-login redirect by role

### Step 8: Cleanup
- [ ] Delete `apps/` directory
- [ ] Delete `packages/` directory
- [ ] Remove unused dependencies (express, cors, helmet, morgan, multer, express-rate-limit)
- [ ] Consolidate environment variables into `.env.local`
- [ ] Update `.gitignore` if needed
- [ ] Final build verification: `pnpm build`
- [ ] Smoke test all portals: auth, dashboard, bakery, admin

## Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Design spec | Done | Approved 2026-04-09 |
| Step 1: Move web to root | Not started | |
| Step 2: Move shared | Not started | |
| Step 3: Move backend | Not started | |
| Step 4: Add admin pages | Not started | |
| Step 5: Server Actions | Not started | |
| Step 6: API Routes | Not started | |
| Step 7: Middleware | Not started | |
| Step 8: Cleanup | Not started | |
