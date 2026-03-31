# Tech Stack

> **This file is the single source of truth for technology choices.**
> All agents reference this file before writing code or making technical decisions.

## Frontend

- Framework: Next.js 16 (LTS)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Component Library: shadcn/ui
- State Management: Zustand
- Forms: React Hook Form + Zod
- i18n: Custom solution (not next-intl, not locale-based routing). Turkish only at launch, infrastructure ready for multi-language.

## Backend

- Runtime: Node.js 22
- Framework: Express.js
- Language: TypeScript
- Validation: Zod

## Database

- Primary: PostgreSQL (via Supabase)
- ORM: Drizzle ORM
- Cache: Supabase (built-in), Redis if needed later
- Auth: Supabase Auth

## Payments

- Provider: iyzico
- Methods: Credit card, monthly invoice, per-order payment

## Notifications

- Email: Resend
- WhatsApp: WhatsApp Business API (via Twilio or direct)

## Infrastructure

- Frontend Hosting: Vercel
- Backend Hosting: Railway
- CI/CD: GitHub Actions
- Monitoring: Sentry
- File Storage: Supabase Storage

## Testing

- Unit Test Framework: Vitest
- E2E Test Framework: Playwright
- API Testing: Supertest

## Other

- Package Manager: pnpm
- Monorepo: Turborepo (apps/web, apps/api, packages/shared)
- API Style: REST
- API Documentation: Swagger/OpenAPI via swagger-jsdoc
