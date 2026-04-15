# Single Next.js Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the monorepo (apps/web + apps/admin + apps/api + packages/shared) into a single Next.js project.

**Architecture:** `apps/web` becomes the base. Backend services move to `src/lib/`, shared types to `src/lib/shared/`, admin pages to `src/app/(admin)/`. Express controllers become Server Actions. API Routes only for webhooks/cron/health.

**Tech Stack:** Next.js 15, TypeScript, Drizzle ORM, Supabase Auth, Tailwind, shadcn/ui, pnpm

**Design Spec:** `docs/superpowers/specs/2026-04-09-single-nextjs-consolidation-design.md`

---

## File Structure (Target State)

```
cakeday/                        # repo root = Next.js project
├── src/
│   ├── app/
│   │   ├── (auth)/             # existing from web
│   │   ├── (dashboard)/        # renamed from dashboard/
│   │   ├── (bakery)/           # renamed from bakery/
│   │   ├── (admin)/            # new, from apps/admin
│   │   ├── api/v1/             # new API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── actions/                # new Server Actions
│   ├── lib/
│   │   ├── db/                 # from apps/api/src/db + config
│   │   │   ├── schema/
│   │   │   └── index.ts
│   │   ├── services/           # from apps/api/src/services
│   │   ├── shared/             # from packages/shared/src
│   │   ├── supabase/           # consolidated from utils/supabase
│   │   ├── utils.ts            # existing
│   │   └── errors.ts           # from apps/api/src/utils/errors
│   ├── components/             # existing + admin additions
│   ├── hooks/                  # existing, refactored
│   ├── stores/                 # existing
│   └── middleware.ts           # enhanced with role guards
├── drizzle.config.ts           # from apps/api
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.local
```

---

### Task 1: Move Web App to Repo Root & Remove Monorepo

**Files:**
- Move: all files from `apps/web/` → repo root
- Delete: `turbo.json`, `pnpm-workspace.yaml`, root `package.json` (replaced by web's)
- Modify: `package.json` (rename, remove workspace dep)
- Modify: `tsconfig.json` (remove workspace path alias)
- Modify: `next.config.ts` (remove transpilePackages)

- [ ] **Step 1: Create a backup branch**

```bash
git checkout -b feature/single-nextjs-migration
```

- [ ] **Step 2: Copy web app files to repo root**

Copy `apps/web/` contents to repo root. Key files:
- `apps/web/package.json` → `./package.json`
- `apps/web/tsconfig.json` → `./tsconfig.json`
- `apps/web/next.config.ts` → `./next.config.ts`
- `apps/web/tailwind.config.ts` → `./tailwind.config.ts`
- `apps/web/postcss.config.mjs` → `./postcss.config.mjs`
- `apps/web/components.json` → `./components.json`
- `apps/web/.env.local` → `./.env.local`
- `apps/web/.env.local.example` → `./.env.local.example`
- `apps/web/src/` → `./src/`
- `apps/web/public/` → `./public/` (if exists)

```bash
cp apps/web/package.json ./package.json
cp apps/web/tsconfig.json ./tsconfig.json
cp apps/web/next.config.ts ./next.config.ts
cp apps/web/tailwind.config.ts ./tailwind.config.ts
cp apps/web/postcss.config.mjs ./postcss.config.mjs
cp apps/web/components.json ./components.json
cp -f apps/web/.env.local ./.env.local 2>/dev/null || true
cp -f apps/web/.env.local.example ./.env.local.example 2>/dev/null || true
cp -r apps/web/src/ ./src/
cp -r apps/web/public/ ./public/ 2>/dev/null || true
```

- [ ] **Step 3: Delete monorepo config files**

```bash
rm -f turbo.json pnpm-workspace.yaml
```

- [ ] **Step 4: Update package.json**

Change the name and remove workspace dependency:

```json
{
  "name": "cakeday",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    // ... keep all existing deps from web's package.json
    // REMOVE this line: "@cakeday/shared": "workspace:*",
    // ADD these backend deps (from apps/api):
    "drizzle-orm": "^0.30.10",
    "pg": "^8.11.5",
    "resend": "^3.3.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    // ... keep all existing devDeps
    // ADD:
    "drizzle-kit": "^0.21.4",
    "@types/pg": "^8.11.6"
  }
}
```

Specifically: remove `"@cakeday/shared": "workspace:*"` from dependencies. Add `drizzle-orm`, `pg`, `resend`, `dotenv` to dependencies. Add `drizzle-kit`, `@types/pg` to devDependencies.

- [ ] **Step 5: Update tsconfig.json — remove workspace path**

Replace the paths section:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Remove the `"@cakeday/shared"` path alias entirely. Only `@/*` remains.

- [ ] **Step 6: Update next.config.ts — remove transpilePackages**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

Remove `transpilePackages: ["@cakeday/shared"]`.

- [ ] **Step 7: Install dependencies**

```bash
rm -f pnpm-lock.yaml
pnpm install
```

- [ ] **Step 8: Verify the app starts (will have import errors — that's expected)**

```bash
pnpm dev
# Expect: errors about @cakeday/shared imports — fixed in Task 2
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: move web app to repo root, remove monorepo config"
```

---

### Task 2: Move Shared Package Into src/lib/shared

**Files:**
- Create: `src/lib/shared/types/index.ts` (from `packages/shared/src/types/index.ts`)
- Create: `src/lib/shared/schemas/index.ts` (from `packages/shared/src/schemas/index.ts`)
- Create: `src/lib/shared/constants/index.ts` (from `packages/shared/src/constants/index.ts`)
- Create: `src/lib/shared/constants/enums.ts` (from `packages/shared/src/constants/enums.ts`)
- Create: `src/lib/shared/constants/permissions.ts` (from `packages/shared/src/constants/permissions.ts`)
- Create: `src/lib/shared/utils/index.ts` (from `packages/shared/src/utils/index.ts`)
- Create: `src/lib/shared/index.ts` (from `packages/shared/src/index.ts`)
- Modify: all files that import from `@cakeday/shared`

- [ ] **Step 1: Copy shared package source files**

```bash
mkdir -p src/lib/shared
cp -r packages/shared/src/* src/lib/shared/
```

- [ ] **Step 2: Find and replace all `@cakeday/shared` imports**

Search all `.ts` and `.tsx` files under `src/` for `@cakeday/shared` and replace with `@/lib/shared`.

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "@cakeday/shared" {} \;
```

For each file found, replace:
```
import { ... } from "@cakeday/shared"  →  import { ... } from "@/lib/shared"
import type { ... } from "@cakeday/shared"  →  import type { ... } from "@/lib/shared"
```

The main files that import from `@cakeday/shared` in the web app are:
- `src/lib/api.ts` (lines 91-102)
- Any hooks or components that re-export shared types

Use a global find-and-replace:
```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@cakeday/shared|@/lib/shared|g' {} +
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: build succeeds with no `@cakeday/shared` import errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move shared package to src/lib/shared"
```

---

### Task 3: Add Backend Database Layer

**Files:**
- Create: `src/lib/db/schema/index.ts` (from `apps/api/src/db/schema/index.ts`)
- Create: `src/lib/db/schema/tables.ts` (from `apps/api/src/db/schema/tables.ts`)
- Create: `src/lib/db/schema/enums.ts` (from `apps/api/src/db/schema/enums.ts`)
- Create: `src/lib/db/schema/relations.ts` (from `apps/api/src/db/schema/relations.ts`)
- Create: `src/lib/db/index.ts` (new — DB connection for Next.js)
- Create: `src/lib/supabase/admin.ts` (new — admin Supabase client)
- Create: `src/lib/errors.ts` (from `apps/api/src/utils/errors.ts`)
- Create: `src/lib/env.ts` (new — server-side env validation)
- Create: `drizzle.config.ts` (from `apps/api/drizzle.config.ts`)

- [ ] **Step 1: Copy Drizzle schema files**

```bash
mkdir -p src/lib/db/schema
cp apps/api/src/db/schema/index.ts src/lib/db/schema/index.ts
cp apps/api/src/db/schema/tables.ts src/lib/db/schema/tables.ts
cp apps/api/src/db/schema/enums.ts src/lib/db/schema/enums.ts
cp apps/api/src/db/schema/relations.ts src/lib/db/schema/relations.ts
```

- [ ] **Step 2: Create DB connection for Next.js**

Create `src/lib/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
});

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
```

- [ ] **Step 3: Create admin Supabase client**

Create `src/lib/supabase/admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client (uses service role key, bypasses RLS).
 * Use only in Server Actions and API Routes — never expose to client.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

- [ ] **Step 4: Create error classes**

Create `src/lib/errors.ts` by copying from `apps/api/src/utils/errors.ts`:

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field?: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Array<{ field?: string; message: string }>,
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found.` : `${resource} not found.`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed.',
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists.') {
    super(message, 409, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request.') {
    super(message, 400, 'BAD_REQUEST');
  }
}
```

- [ ] **Step 5: Create drizzle.config.ts at repo root**

```typescript
import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

- [ ] **Step 6: Update .env.local with backend env vars**

Add these to `.env.local` (from `apps/api/.env`):

```
# Existing (keep):
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...

# Add from API:
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...

# Optional integrations:
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@cakeday.com.tr
ENABLE_EMAIL=false

# Remove (no longer needed):
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Copy the actual values from `apps/api/.env`.

- [ ] **Step 7: Fix schema imports**

The schema files (`tables.ts`, `enums.ts`, `relations.ts`) may import from each other with relative paths — these should work as-is since the directory structure is preserved. But check if any file imports from `@cakeday/shared` and fix to `@/lib/shared`.

```bash
grep -r "@cakeday/shared" src/lib/db/
```

Replace any found with `@/lib/shared`.

- [ ] **Step 8: Verify DB layer compiles**

```bash
pnpm build
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add backend database layer and Drizzle schema"
```

---

### Task 4: Move Services (Refactored to Pure Functions)

**Files:**
- Create: `src/lib/services/auth.service.ts`
- Create: `src/lib/services/company.service.ts`
- Create: `src/lib/services/employee.service.ts`
- Create: `src/lib/services/order.service.ts`
- Create: `src/lib/services/ordering-rule.service.ts`
- Create: `src/lib/services/bakery.service.ts`
- Create: `src/lib/services/cake.service.ts`
- Create: `src/lib/services/email.service.ts`

- [ ] **Step 1: Copy service files**

```bash
mkdir -p src/lib/services
cp apps/api/src/services/*.ts src/lib/services/
```

- [ ] **Step 2: Fix imports in all service files**

For each file in `src/lib/services/`, update imports:

Replace these patterns:
```typescript
// OLD:
import { db } from "../config/database";
import { supabase, supabaseAdmin } from "../config/supabase";
import { ... } from "../db/schema";
import { ... } from "../utils/errors";
import { env } from "../config/env";
import type { ... } from "@cakeday/shared";

// NEW:
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ... } from "@/lib/db/schema";
import { ... } from "@/lib/errors";
import type { ... } from "@/lib/shared";
```

Apply to all service files:
```bash
find src/lib/services -name "*.ts" -exec sed -i '' \
  -e 's|from "../config/database"|from "@/lib/db"|g' \
  -e 's|from "../config/supabase"|from "@/lib/supabase/admin"|g' \
  -e 's|from "../db/schema"|from "@/lib/db/schema"|g' \
  -e 's|from "../utils/errors"|from "@/lib/errors"|g' \
  -e 's|from "@cakeday/shared"|from "@/lib/shared"|g' \
  {} +
```

Manual attention needed:
- `supabase` (anon client) imports: some services use both `supabase` and `supabaseAdmin`. The anon client is only used in `auth.service.ts` for `signInWithPassword`. Create a server-side anon client or use the admin client instead.
- `env` references: replace `env.FRONTEND_URL` with `process.env.NEXT_PUBLIC_SUPABASE_URL` or equivalent. Replace `env.NODE_ENV` with `process.env.NODE_ENV`. Replace `env.ENABLE_EMAIL` with `process.env.ENABLE_EMAIL === 'true'`.

- [ ] **Step 3: Fix auth.service.ts specifically**

The auth service uses both `supabase` (anon) and `supabaseAdmin`. For the anon client used in `login()`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from "@/lib/supabase/admin";

// Anon client for operations that need RLS (login)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);
```

Also fix `env.FRONTEND_URL` → `process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'` and `env.NODE_ENV` → `process.env.NODE_ENV`.

- [ ] **Step 4: Fix email.service.ts**

Replace env config references:
```typescript
// OLD:
import { env } from "../config/env";
const resend = new Resend(env.RESEND_API_KEY);
const isEmailEnabled = env.ENABLE_EMAIL;

// NEW:
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const isEmailEnabled = process.env.ENABLE_EMAIL === 'true';
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@cakeday.com.tr';
```

- [ ] **Step 5: Verify services compile**

```bash
pnpm build
```

Fix any remaining import errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: move backend services to src/lib/services"
```

---

### Task 5: Create Auth Helpers for Server Components & Actions

**Files:**
- Create: `src/lib/auth.ts` (getCurrentUser + guard helpers)
- Modify: `src/utils/supabase/server.ts` → `src/lib/supabase/server.ts` (move)
- Modify: `src/utils/supabase/client.ts` → `src/lib/supabase/client.ts` (move)
- Modify: `src/utils/supabase/middleware.ts` → `src/lib/supabase/middleware.ts` (move)

- [ ] **Step 1: Move Supabase utils to src/lib/supabase/**

```bash
# admin.ts is already there from Task 3
cp src/utils/supabase/server.ts src/lib/supabase/server.ts
cp src/utils/supabase/client.ts src/lib/supabase/client.ts
cp src/utils/supabase/middleware.ts src/lib/supabase/middleware.ts
```

- [ ] **Step 2: Create auth helper**

Create `src/lib/auth.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles, companyMemberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { UserRole } from "@/lib/shared";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  bakeryId: string | null;
}

/**
 * Get the current authenticated user from Supabase session cookies.
 * Use in Server Components and Server Actions.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, supabaseUser.id))
    .limit(1);

  if (!profile) return null;

  let companyId: string | null = null;
  if (profile.role !== 'bakery_admin' && profile.role !== 'platform_admin') {
    const [membership] = await db
      .select({ company_id: companyMemberships.company_id })
      .from(companyMemberships)
      .where(eq(companyMemberships.user_id, profile.id))
      .limit(1);
    companyId = membership?.company_id ?? null;
  }

  return {
    id: profile.id,
    email: supabaseUser.email ?? '',
    role: profile.role as UserRole,
    companyId,
    bakeryId: profile.bakery_id,
  };
}

/**
 * Require authentication. Throws if not logged in.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/**
 * Require specific role(s). Throws if user doesn't have one of the roles.
 */
export function requireRole(user: AuthUser, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }
}

/**
 * Require user to belong to a company.
 */
export function requireCompanyUser(user: AuthUser): string {
  if (!user.companyId) {
    throw new ForbiddenError('Bu işlem için şirket hesabı gereklidir.');
  }
  return user.companyId;
}

/**
 * Require user to be a bakery admin with a bakery_id.
 */
export function requireBakeryUser(user: AuthUser): string {
  if (user.role !== 'bakery_admin' || !user.bakeryId) {
    throw new ForbiddenError('Bu işlem için pastane hesabı gereklidir.');
  }
  return user.bakeryId;
}
```

- [ ] **Step 3: Update middleware.ts import**

Update `src/middleware.ts`:

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 4: Update all existing imports from `@/utils/supabase/` to `@/lib/supabase/`**

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/utils/supabase/|@/lib/supabase/|g' {} +
```

- [ ] **Step 5: Delete old utils/supabase directory**

```bash
rm -rf src/utils/supabase
# Remove src/utils if empty
rmdir src/utils 2>/dev/null || true
```

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: create auth helpers and consolidate supabase utils"
```

---

### Task 6: Create Server Actions

**Files:**
- Create: `src/actions/auth.ts`
- Create: `src/actions/companies.ts`
- Create: `src/actions/employees.ts`
- Create: `src/actions/orders.ts`
- Create: `src/actions/ordering-rules.ts`
- Create: `src/actions/bakery.ts`
- Create: `src/actions/admin.ts`

Each action follows: `'use server'` → Zod validate → auth check → service call → revalidatePath.

- [ ] **Step 1: Create `src/actions/auth.ts`**

```typescript
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { authService } from '@/lib/services/auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema } from '@/lib/shared';
import { revalidatePath } from 'next/cache';

export async function register(formData: FormData) {
  const input = registerSchema.parse(Object.fromEntries(formData));
  const result = await authService.register(input);
  return result;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  // Redirect based on role is handled by middleware
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPassword(formData: FormData) {
  const input = forgotPasswordSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);
  if (error) {
    return { error: error.message };
  }
  return { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
}
```

- [ ] **Step 2: Create `src/actions/employees.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { employeeService } from '@/lib/services/employee.service';
import { createEmployeeSchema, updateEmployeeSchema } from '@/lib/shared';

export async function createEmployee(formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input = createEmployeeSchema.parse(Object.fromEntries(formData));
  const result = await employeeService.create(companyId, input);
  revalidatePath('/dashboard/employees');
  return result;
}

export async function updateEmployee(id: string, formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input = updateEmployeeSchema.parse(Object.fromEntries(formData));
  const result = await employeeService.update(companyId, id, input);
  revalidatePath('/dashboard/employees');
  return result;
}

export async function deleteEmployee(id: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  await employeeService.delete(companyId, id);
  revalidatePath('/dashboard/employees');
}
```

- [ ] **Step 3: Create `src/actions/orders.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { orderService } from '@/lib/services/order.service';
import { createAdHocOrderSchema } from '@/lib/shared';

export async function createOrder(formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input = createAdHocOrderSchema.parse(Object.fromEntries(formData));
  const result = await orderService.create(companyId, user.id, input);
  revalidatePath('/dashboard/orders');
  return result;
}

export async function cancelOrder(orderId: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderService.cancel(companyId, orderId, user.id);
  revalidatePath('/dashboard/orders');
  return result;
}
```

- [ ] **Step 4: Create `src/actions/ordering-rules.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { orderingRuleService } from '@/lib/services/ordering-rule.service';

export async function createRule(data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderingRuleService.create(companyId, user.id, data);
  revalidatePath('/dashboard/ordering-rules');
  return result;
}

export async function updateRule(id: string, data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderingRuleService.update(companyId, id, data);
  revalidatePath('/dashboard/ordering-rules');
  return result;
}

export async function deleteRule(id: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  await orderingRuleService.delete(companyId, id);
  revalidatePath('/dashboard/ordering-rules');
}
```

- [ ] **Step 5: Create `src/actions/companies.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { companyService } from '@/lib/services/company.service';

export async function updateCompanyProfile(data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await companyService.updateProfile(companyId, data);
  revalidatePath('/dashboard/settings');
  return result;
}

export async function updateCompanySettings(data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await companyService.updateSettings(companyId, data);
  revalidatePath('/dashboard/settings');
  return result;
}

export async function inviteUser(data: { email: string; role: string }) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await companyService.inviteUser(companyId, user.id, data);
  revalidatePath('/dashboard/settings');
  return result;
}
```

- [ ] **Step 6: Create `src/actions/bakery.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireBakeryUser } from '@/lib/auth';
import { bakeryService } from '@/lib/services/bakery.service';

export async function acceptOrder(orderId: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.acceptOrder(bakeryId, orderId);
  revalidatePath('/bakery/orders');
  return result;
}

export async function rejectOrder(orderId: string, reason: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.rejectOrder(bakeryId, orderId, reason);
  revalidatePath('/bakery/orders');
  return result;
}

export async function markDelivered(orderId: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.markDelivered(bakeryId, orderId);
  revalidatePath('/bakery/orders');
  return result;
}

export async function requestPriceChange(data: Record<string, unknown>) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.requestPriceChange(bakeryId, data);
  revalidatePath('/bakery/pricing');
  return result;
}
```

- [ ] **Step 7: Create `src/actions/admin.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth';

// Admin actions will call services directly
// Import specific services as needed
import { companyService } from '@/lib/services/company.service';
import { bakeryService } from '@/lib/services/bakery.service';
import { cakeService } from '@/lib/services/cake.service';

export async function approveCompany(companyId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await companyService.approve(companyId);
  revalidatePath('/admin/companies');
  return result;
}

export async function suspendCompany(companyId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await companyService.suspend(companyId);
  revalidatePath('/admin/companies');
  return result;
}

export async function createCakeType(data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await cakeService.create(data);
  revalidatePath('/admin/catalogue');
  return result;
}

export async function updateCakeType(id: string, data: Record<string, unknown>) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await cakeService.update(id, data);
  revalidatePath('/admin/catalogue');
  return result;
}

export async function approvePricingRequest(requestId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await bakeryService.approvePricingRequest(requestId);
  revalidatePath('/admin/pricing-requests');
  return result;
}

export async function rejectPricingRequest(requestId: string, note: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await bakeryService.rejectPricingRequest(requestId, note);
  revalidatePath('/admin/pricing-requests');
  return result;
}
```

- [ ] **Step 8: Verify build**

```bash
pnpm build
```

Note: some service methods may not exactly match these signatures. The implementer must check each service's actual method signatures and adjust the action code accordingly. The pattern is what matters.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: create server actions for all portals"
```

---

### Task 7: Add Admin Pages

Admin pages go directly under `src/app/admin/` (not a route group) so URLs are `/admin/*`.

**Files:**
- Create: `src/app/admin/layout.tsx` (adapted from `apps/admin/src/app/(dashboard)/layout.tsx`)
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/companies/page.tsx`
- Create: `src/app/admin/companies/[id]/page.tsx`
- Create: `src/app/admin/bakeries/page.tsx`
- Create: `src/app/admin/bakeries/[id]/page.tsx`
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/catalogue/page.tsx`
- Create: `src/app/admin/pricing-requests/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/components/layout/admin-header.tsx` (from admin app)
- Create: `src/components/layout/admin-sidebar.tsx` (from admin app)

- [ ] **Step 1: Copy admin layout components**

```bash
cp apps/admin/src/components/layout/admin-header.tsx src/components/layout/admin-header.tsx
cp apps/admin/src/components/layout/admin-sidebar.tsx src/components/layout/admin-sidebar.tsx
```

- [ ] **Step 2: Fix admin component imports**

In both `admin-header.tsx` and `admin-sidebar.tsx`, update imports:
- `@/components/ui/*` → already exists in web's components, no change needed
- `@/lib/utils` → already exists, no change needed
- Any `@cakeday/shared` → `@/lib/shared`

- [ ] **Step 3: Copy admin pages**

```bash
mkdir -p src/app/admin
cp -r apps/admin/src/app/\(dashboard\)/* src/app/admin/
```

- [ ] **Step 4: Fix admin layout — update nav paths from `/dashboard/` to `/admin/`**

In `src/app/admin/layout.tsx`, the nav items currently use `/dashboard/companies`, `/dashboard/bakeries` etc. Update ALL paths:

```typescript
const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Şirketler", icon: Building2 },
  { href: "/admin/bakeries", label: "Pastaneler", icon: Store },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/catalogue", label: "Pasta Kataloğu", icon: Cake },
  { href: "/admin/pricing-requests", label: "Fiyat Talepleri", icon: Tag },
  { href: "/admin/settings", label: "Sistem Ayarları", icon: Settings },
];
```

Also fix isActive check:
```typescript
const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
```

- [ ] **Step 5: Fix admin page imports**

Each admin page imports from `@/lib/api` (the admin API client). Convert to direct service calls:

- `@/lib/api` → use service layer directly in server components
- `@cakeday/shared` → `@/lib/shared`
- `@/lib/utils` → no change needed
- `@/components/ui/*` → no change needed (shared shadcn components)

Example for companies page:

```typescript
// src/app/admin/companies/page.tsx
import { requireAuth, requireRole } from '@/lib/auth';
import { companyService } from '@/lib/services/company.service';

export default async function CompaniesPage() {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');
  
  const companies = await companyService.listAll();
  return <CompaniesView companies={companies} />;
}
```

The implementer should check each admin page's actual data needs and wire them up to the appropriate service methods.

- [ ] **Step 6: Add missing shadcn/ui components**

Check if admin app uses any UI components not in web app:

```bash
diff <(ls apps/admin/src/components/ui/) <(ls src/components/ui/)
```

Copy any missing ones.

- [ ] **Step 7: Verify admin pages render**

```bash
pnpm build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin portal pages under /admin"
```

---

### Task 8: Update Middleware with Role-Based Routing

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Update middleware.ts with role-based protection**

Replace `src/middleware.ts`:

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // First refresh the session
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/verify-email'];
  if (publicPaths.includes(pathname)) {
    return response;
  }

  // API routes — handle their own auth
  if (pathname.startsWith('/api/')) {
    return response;
  }

  // For protected routes, check the user's session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // cookies are already set by updateSession
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role from user metadata (set during profile creation)
  const role = user.user_metadata?.role as string | undefined;

  // Route protection by role
  if (pathname.startsWith('/admin') && role !== 'platform_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/bakery') && role !== 'bakery_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Note: This relies on `user_metadata.role` being set in Supabase. If it's not already stored there, the middleware should fetch from the DB — but for performance, it's better to set user_metadata on registration. Check the current auth.service.ts `register()` method and ensure it sets `user_metadata.role`. If not, the implementer should add `role` to the user_metadata in the Supabase `createUser` call.

- [ ] **Step 2: Verify middleware works**

```bash
pnpm dev
```

Test:
- Visit `/admin` without login → redirects to `/login`
- Visit `/dashboard` without login → redirects to `/login`
- Login as company user → can access `/dashboard`, redirected away from `/admin`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add role-based route protection in middleware"
```

---

### Task 9: Create API Routes

**Files:**
- Create: `src/app/api/v1/health/route.ts`
- Create: `src/app/api/v1/webhooks/iyzico/route.ts`
- Create: `src/app/api/v1/cron/create-birthday-orders/route.ts`
- Create: `src/app/api/v1/cron/send-reminders/route.ts`

- [ ] **Step 1: Create health check**

Create `src/app/api/v1/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Create iyzico webhook**

Create `src/app/api/v1/webhooks/iyzico/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: implement iyzico webhook handling
  // 1. Verify webhook signature
  // 2. Parse payment result
  // 3. Update order/payment status via service
  const body = await request.json();
  console.log('iyzico webhook received:', body);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create birthday orders cron endpoint**

Create `src/app/api/v1/cron/create-birthday-orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services/order.service';

// TODO: cron trigger belirlenecek — bu endpoint dışarıdan çağrılacak
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await orderService.createBirthdayOrders();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Birthday orders cron failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create send-reminders cron endpoint**

Create `src/app/api/v1/cron/send-reminders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// TODO: cron trigger belirlenecek — bu endpoint dışarıdan çağrılacak
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement reminder sending via email service
    return NextResponse.json({ success: true, message: 'Reminders sent' });
  } catch (error) {
    console.error('Send reminders cron failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add API routes for health, webhooks, and cron"
```

---

### Task 10: Verify Route Structure

No directory changes needed. The current structure is correct:
- `src/app/dashboard/*` → `/dashboard/*` URLs (company portal)
- `src/app/bakery/*` → `/bakery/*` URLs (bakery portal)
- `src/app/(auth)/*` → auth pages (route group, no URL prefix)
- `src/app/admin/*` → `/admin/*` URLs (admin portal, added in Task 7)

- [ ] **Step 1: Verify all routes load**

```bash
pnpm dev
```

Check:
- `/` → landing page
- `/login` → login page
- `/dashboard` → company dashboard (requires auth)
- `/bakery` → bakery portal (requires bakery_admin)
- `/admin` → admin panel (requires platform_admin)
- `/api/v1/health` → returns `{ status: "ok" }`

- [ ] **Step 2: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: verify and fix route structure"
```

---

### Task 11: Migrate Pages from API Client to Direct Service Calls

**Files:**
- Modify: `src/app/dashboard/page.tsx` (and all dashboard pages)
- Modify: `src/app/bakery/page.tsx` (and all bakery pages)
- Modify: hooks that call `api.ts` → refactor to use server actions
- Delete: `src/lib/api.ts` (the fetch client to Express)

This is the biggest refactoring task. Each page currently uses client-side hooks that call `api.ts` → Express API. Convert to:
- **Data reading:** Server Component calls service directly
- **Data mutation:** Form/button calls Server Action

- [ ] **Step 1: Identify all files that import from `@/lib/api`**

```bash
grep -r "from \"@/lib/api\"" src/ --include="*.ts" --include="*.tsx" -l
```

This will show every file that calls the Express API.

- [ ] **Step 2: For each page — convert to server component with direct service calls**

Pattern for each page:

**Before (client component + hook + fetch):**
```typescript
'use client';
import { useEmployees } from '@/hooks/use-employees';

export default function EmployeesPage() {
  const { employees, isLoading } = useEmployees();
  if (isLoading) return <Skeleton />;
  return <EmployeesView employees={employees} />;
}
```

**After (server component + direct service call):**
```typescript
import { requireAuth, requireCompanyUser } from '@/lib/auth';
import { employeeService } from '@/lib/services/employee.service';
import { EmployeesView } from '@/components/employees/employees-view';

export default async function EmployeesPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);
  const employees = await employeeService.listByCompany(companyId);
  return <EmployeesView employees={employees} />;
}
```

Apply this pattern to all pages. The implementer must check each page's data needs and map them to the correct service method.

Key pages to convert:
- `src/app/dashboard/page.tsx` — dashboard stats
- `src/app/dashboard/employees/page.tsx` — employee list
- `src/app/dashboard/employees/import/page.tsx` — CSV import
- `src/app/dashboard/orders/page.tsx` — order list
- `src/app/dashboard/orders/new/page.tsx` — create order form
- `src/app/dashboard/ordering-rules/page.tsx` — rules list
- `src/app/dashboard/billing/page.tsx` — invoices
- `src/app/dashboard/settings/page.tsx` — company settings
- `src/app/bakery/page.tsx` — bakery dashboard
- `src/app/bakery/orders/page.tsx` — bakery orders
- `src/app/bakery/pricing/page.tsx` — pricing management
- `src/app/bakery/settings/page.tsx` — bakery settings

- [ ] **Step 3: Update form components to use Server Actions**

Components that submit forms (e.g., `employee-form.tsx`, `order-form.tsx`, `rule-form.tsx`) need to use `action` prop or call server actions directly.

**Before:**
```typescript
const onSubmit = async (data) => {
  await employeesApi.create(data);
  // ...
};
```

**After:**
```typescript
import { createEmployee } from '@/actions/employees';

// In form:
<form action={createEmployee}>
  {/* fields */}
</form>
```

Or for more control:
```typescript
const onSubmit = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  await createEmployee(formData);
};
```

- [ ] **Step 4: Delete old API client and hooks that fetch from Express**

```bash
rm src/lib/api.ts
```

Update or remove hooks that are now unnecessary:
- `src/hooks/use-employees.ts` — remove if page is now server component
- `src/hooks/use-orders.ts` — remove if page is now server component
- `src/hooks/use-ordering-rules.ts` — remove if page is now server component

Keep `src/hooks/use-auth.ts` and `src/hooks/use-toast.ts` — these are client-side hooks that are still needed.

Refactor `src/hooks/use-auth.ts` to remove `authApi` dependency — login/register should use Server Actions instead.

- [ ] **Step 5: Verify all pages work**

```bash
pnpm build
pnpm dev
```

Navigate through all pages and verify they load data correctly.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate pages from API client to server components and actions"
```

---

### Task 12: Cleanup — Delete Old Apps and Packages

**Files:**
- Delete: `apps/` directory
- Delete: `packages/` directory
- Delete: `src/utils/` (if still exists)
- Modify: `.gitignore` (remove monorepo-specific entries)
- Modify: `docs/MIGRATION-PROGRESS.md` (mark steps complete)

- [ ] **Step 1: Delete old directories**

```bash
rm -rf apps/
rm -rf packages/
rm -rf src/utils/ 2>/dev/null || true
```

- [ ] **Step 2: Clean up unused files**

```bash
# Remove web's build artifacts
rm -f next-env.d.ts tsconfig.tsbuildinfo
```

- [ ] **Step 3: Update .env.local — remove NEXT_PUBLIC_API_URL**

Remove this line from `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Add `CRON_SECRET` for API route protection:
```
CRON_SECRET=<generate-a-random-secret>
```

- [ ] **Step 4: Remove unused dependencies**

These Express-specific packages are no longer needed in package.json (they weren't added, but double-check):

```bash
pnpm remove express cors helmet morgan multer express-rate-limit node-cron uuid 2>/dev/null || true
pnpm remove @types/express @types/cors @types/morgan @types/multer @types/node-cron @types/uuid 2>/dev/null || true
```

- [ ] **Step 5: Run final build**

```bash
pnpm build
```

Must succeed with zero errors.

- [ ] **Step 6: Update migration progress**

Update `docs/MIGRATION-PROGRESS.md` — mark all steps as complete.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove old monorepo apps and packages, cleanup"
```

---

## Post-Migration Verification Checklist

After all tasks are complete, verify:

- [ ] `pnpm dev` starts without errors
- [ ] `/` — landing page loads
- [ ] `/login` — login page loads
- [ ] `/register` — register page loads
- [ ] `/dashboard` — redirects to login if not authenticated
- [ ] `/dashboard` — shows company dashboard when logged in
- [ ] `/dashboard/employees` — shows employee list
- [ ] `/dashboard/orders` — shows orders
- [ ] `/bakery` — redirects to login if not bakery_admin
- [ ] `/admin` — redirects away if not platform_admin
- [ ] `/api/v1/health` — returns `{ status: "ok" }`
- [ ] `pnpm build` succeeds
- [ ] No `@cakeday/shared` imports remain
- [ ] No `apps/` or `packages/` directories exist
- [ ] `drizzle.config.ts` points to correct schema path
