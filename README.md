# CakeDay

B2B birthday cake delivery platform for the Turkish market. Automates employee birthday celebrations with partner bakeries.

## Overview

CakeDay helps companies automate birthday cake deliveries for their employees. HR teams set up rules once, and the platform handles everything — scheduling, bakery matching, delivery, and payment.

**Currently serving:** Istanbul — Beşiktaş & Sarıyer districts

## Architecture

Turborepo monorepo with three apps:

```
apps/
├── web/       → Customer Portal + Bakery Portal (Next.js 15)
├── admin/     → Admin Dashboard (Next.js 15)
└── api/       → Backend API (Express.js)
packages/
└── shared/    → Shared types, schemas, utilities
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Payments | iyzico |
| Notifications | Resend (email) + WhatsApp Business API |
| Hosting | Vercel + Railway |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- Supabase account
- iyzico merchant account

### Installation

```bash
git clone https://github.com/aberkayk/cakeday-mono.git
cd cakeday-mono
pnpm install
cp .env.example .env
pnpm dev
```

## Portals

### Customer Portal (`apps/web`)
- Company registration & onboarding
- Employee management (HR integrations, CSV, manual)
- Automated cake ordering rules
- One-time celebration orders
- Payment & billing

### Bakery Portal (`apps/web`)
- Order management (accept/reject)
- Delivery tracking
- Price change requests
- Order history

### Admin Dashboard (`apps/admin`)
- Company & bakery management
- Delivery operations
- Pricing control
- Financial reports
- System settings

## License

Private — All rights reserved.
