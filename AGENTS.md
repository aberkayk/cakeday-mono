# CakeDay

B2B birthday cake delivery platform for the Turkish market. Automates employee birthday celebrations with cake delivery for companies.

## Project Structure

```
apps/
├── web/              # Next.js 16 — Customer portal + Bakery portal
├── admin/            # Next.js 16 — Admin dashboard
└── api/              # Express.js — Backend API
packages/
└── shared/           # Shared types, utils, Zod schemas
docs/
├── architecture/     # ADRs, tech stack, DB schema
├── requirements/     # User stories, requirements
├── design/           # UI/UX design documents
├── api/              # API documentation (OpenAPI)
└── testing/          # Test plans and reports
```

## Tech Stack

See `docs/architecture/tech-stack.md` for full details.

- **Frontend:** Next.js 16 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle
- **Auth:** Supabase Auth
- **Payments:** iyzico
- **Notifications:** Email (Resend) + WhatsApp
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Monorepo:** Turborepo + pnpm

## Conventions

- All documentation in English
- Code and comments in English
- Commit messages: Conventional Commits format
- Branch names: `feature/`, `bugfix/`, `hotfix/` prefixes
- Turkish language in UI strings only (externalized for future i18n)

## Agent Usage

Agents are defined in `.Codex/agents/`. To run:
```
Run PM agent: [task description]
```
