# CakeDay

B2B birthday cake delivery platform for the Turkish market. Automates employee birthday celebrations with cake delivery for companies.

## Project Structure

Single Next.js application (no monorepo).

```
src/
├── app/
│   ├── (auth)/             # Login, register, forgot-password, verify-email
│   ├── (dashboard)/        # Company portal: orders, employees, rules, billing, settings
│   ├── (bakery)/           # Bakery portal: orders, pricing, settings
│   ├── (admin)/            # Platform admin: companies, bakeries, orders, catalogue, settings
│   └── api/v1/             # REST endpoints (webhooks, cron, health)
├── actions/                # Server Actions (UI mutations)
├── lib/
│   ├── db/                 # Drizzle schema, connection, migrations
│   ├── services/           # Business logic layer
│   ├── shared/             # Types, Zod schemas, constants
│   ├── supabase/           # Supabase client (server + browser)
│   └── utils/              # Utility functions
├── components/             # UI components (shadcn/ui + custom)
├── hooks/                  # React hooks
├── stores/                 # Zustand stores
└── middleware.ts           # Auth + role-based route guard
docs/
├── architecture/           # ADRs, tech stack, DB schema
├── requirements/           # User stories, requirements
├── design/                 # UI/UX design documents
├── api/                    # API documentation (OpenAPI)
└── testing/                # Test plans and reports
```

## Tech Stack

See `docs/architecture/tech-stack.md` for full details.

- **Framework:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js Server Actions + API Routes (hybrid)
- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle
- **Auth:** Supabase Auth
- **Payments:** iyzico
- **Notifications:** Email (Resend) + WhatsApp
- **Package Manager:** pnpm

## Architecture

- **Server Actions** for all UI-triggered mutations (forms, buttons)
- **API Routes** only for external access: webhooks (iyzico), cron jobs, health check
- **Server Components** read data directly via service layer — no fetch calls
- **Service layer** (`src/lib/services/`) contains all business logic as pure functions
- **Auth** via Supabase Auth with role-based middleware route protection

## Portals

| Path | Portal | Access |
|------|--------|--------|
| `/dashboard/*` | Company portal | company_owner, hr_manager, finance, viewer |
| `/bakery/*` | Bakery portal | bakery_admin |
| `/admin/*` | Platform admin | platform_admin |

## Conventions

- All documentation in English
- Code and comments in English
- Commit messages: Conventional Commits format
- Branch names: `feature/`, `bugfix/`, `hotfix/` prefixes
- Turkish language in UI strings only (externalized for future i18n)

## Migration

Migration from monorepo to single Next.js is tracked in `docs/MIGRATION-PROGRESS.md`.
Design spec: `docs/superpowers/specs/2026-04-09-single-nextjs-consolidation-design.md`.

## Agent Usage

Agents are defined in `.claude/agents/`. To run:
```
Run PM agent: [task description]
```
