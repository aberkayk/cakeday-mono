# API Design -- CakeDay

> **B2B Birthday Cake Delivery Platform for the Turkish Market**
> Last Updated: 2026-03-31

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Auth Endpoints](#3-auth-endpoints)
4. [Company Endpoints](#4-company-endpoints)
5. [Employee Endpoints](#5-employee-endpoints)
6. [HR Integration Endpoints](#6-hr-integration-endpoints)
7. [Ordering Rule Endpoints](#7-ordering-rule-endpoints)
8. [Order Endpoints](#8-order-endpoints)
9. [Cake Catalogue Endpoints](#9-cake-catalogue-endpoints)
10. [Payment Endpoints](#10-payment-endpoints)
11. [Notification Endpoints](#11-notification-endpoints)
12. [Bakery Portal Endpoints](#12-bakery-portal-endpoints)
13. [Admin Endpoints](#13-admin-endpoints)
14. [Webhook Endpoints](#14-webhook-endpoints)
15. [File Upload Endpoints](#15-file-upload-endpoints)

---

## 1. Conventions

### 1.1 Base URL

```
Production: https://api.cakeday.com.tr/api/v1
Staging:    https://api-staging.cakeday.com.tr/api/v1
Local:      http://localhost:3001/api/v1
```

### 1.2 Request / Response Format

- All request and response bodies use JSON (`Content-Type: application/json`)
- Dates are ISO 8601 (`2026-04-15`) for date-only fields and ISO 8601 with timezone (`2026-04-15T14:30:00+03:00`) for timestamps
- Currency amounts are `number` with 2 decimal places, always in TRY
- UUIDs are used for all entity IDs

### 1.3 Response Envelope

**Success (single entity):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Success (list):**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 142,
    "totalPages": 6
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Gecersiz veri.",
    "details": [
      { "field": "email", "message": "Gecerli bir e-posta adresi giriniz." }
    ]
  }
}
```

### 1.4 Pagination

All list endpoints support:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `25` | Items per page (max 100) |
| `sort` | string | `created_at` | Field to sort by |
| `order` | string | `desc` | Sort direction: `asc` or `desc` |
| `search` | string | -- | Full-text search across relevant fields |

### 1.5 Filtering

List endpoints accept field-specific query parameters:

```
GET /api/v1/orders?status=confirmed&district=besiktas&delivery_date_from=2026-04-01&delivery_date_to=2026-04-30
```

Date range filters use `_from` and `_to` suffixes. Multi-value filters use comma separation: `?status=confirmed,assigned`.

### 1.6 Authentication Header

```
Authorization: Bearer <supabase_access_token>
```

### 1.7 Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or query parameter validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | User lacks permission for the requested action |
| `NOT_FOUND` | 404 | Resource does not exist or is not accessible |
| `CONFLICT` | 409 | Duplicate resource (e.g., VKN already registered) |
| `RATE_LIMITED` | 429 | Too many requests; check `Retry-After` header |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `EXTERNAL_SERVICE_ERROR` | 502 | Third-party service (iyzico, Resend, WhatsApp) failure |

---

## 2. Authentication

All endpoints require a valid JWT in the `Authorization` header unless marked as **Public**. The JWT is issued by Supabase Auth and contains custom claims:

```json
{
  "sub": "uuid",
  "email": "user@company.com",
  "user_type": "company_user",
  "company_id": "uuid-or-null",
  "bakery_id": "uuid-or-null",
  "role": "company_owner"
}
```

**Role abbreviations used below:**

| Abbreviation | Roles |
|---|---|
| `CO` | `company_owner` |
| `HR` | `hr_manager` |
| `FIN` | `finance` |
| `VW` | `viewer` |
| `BA` | `bakery_admin` |
| `PA` | `platform_admin` |

---

## 3. Auth Endpoints

### POST /api/v1/auth/register

Register a new company and primary user account.

**Auth:** Public

**Request Body:**

```json
{
  "company_name": "Acme Teknoloji A.S.",
  "vkn": "1234567890",
  "sector": "Teknoloji",
  "company_size_range": "51-200",
  "primary_contact_name": "Ahmet Yilmaz",
  "primary_contact_title": "IK Muduru",
  "email": "ahmet@acme.com.tr",
  "phone": "+905321234567",
  "password": "SecureP@ss1",
  "billing_address": "Levent Mah. No:15, Besiktas",
  "billing_district": "besiktas",
  "kvkk_accepted": true
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "company_id": "uuid",
    "email": "ahmet@acme.com.tr",
    "status": "pending_verification",
    "message": "Dogrulama e-postasi gonderildi."
  }
}
```

**Status Codes:** 201 Created, 400 Validation Error, 409 VKN Already Exists

---

### POST /api/v1/auth/login

Authenticate with email and password.

**Auth:** Public

**Request Body:**

```json
{
  "email": "ahmet@acme.com.tr",
  "password": "SecureP@ss1"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "xxx",
    "expires_at": "2026-04-01T15:00:00+03:00",
    "user": {
      "id": "uuid",
      "email": "ahmet@acme.com.tr",
      "full_name": "Ahmet Yilmaz",
      "role": "company_owner",
      "company_id": "uuid",
      "bakery_id": null,
      "onboarding_completed": false
    }
  }
}
```

**Status Codes:** 200 OK, 400 Validation Error, 401 Invalid Credentials, 423 Account Locked

---

### POST /api/v1/auth/logout

Invalidate the current session and revoke the refresh token.

**Auth:** Any authenticated user

**Request Body:**

```json
{
  "refresh_token": "xxx"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Oturum kapatildi." }
}
```

**Status Codes:** 200 OK, 401 Unauthorized

---

### POST /api/v1/auth/refresh

Refresh an expired access token using a valid refresh token.

**Auth:** Public (refresh token required)

**Request Body:**

```json
{
  "refresh_token": "xxx"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "new-xxx",
    "expires_at": "2026-04-01T16:00:00+03:00"
  }
}
```

**Status Codes:** 200 OK, 401 Invalid/Expired Refresh Token

---

### POST /api/v1/auth/verify-email

Verify email address using the token from the verification email.

**Auth:** Public

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "E-posta dogrulandi.",
    "company_status": "active"
  }
}
```

**Status Codes:** 200 OK, 400 Invalid/Expired Token

---

### POST /api/v1/auth/resend-verification

Resend the verification email.

**Auth:** Public

**Request Body:**

```json
{
  "email": "ahmet@acme.com.tr"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Dogrulama e-postasi tekrar gonderildi." }
}
```

**Status Codes:** 200 OK, 404 Email Not Found, 409 Already Verified, 429 Rate Limited

---

### POST /api/v1/auth/forgot-password

Initiate a password reset flow.

**Auth:** Public

**Request Body:**

```json
{
  "email": "ahmet@acme.com.tr"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Sifre sifirlama baglantisi gonderildi." }
}
```

**Status Codes:** 200 OK (always, to prevent email enumeration)

---

### POST /api/v1/auth/reset-password

Reset password using the token from the reset email.

**Auth:** Public

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecureP@ss2"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Sifreniz basariyla guncellendi." }
}
```

**Status Codes:** 200 OK, 400 Invalid/Expired Token or Weak Password

---

### POST /api/v1/auth/accept-invitation

Accept a user or bakery invitation.

**Auth:** Public

**Request Body:**

```json
{
  "token": "invitation-token",
  "full_name": "Zeynep Kaya",
  "password": "SecureP@ss1",
  "phone": "+905329876543"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "role": "hr_manager",
    "company_id": "uuid",
    "message": "Hesabiniz olusturuldu."
  }
}
```

**Status Codes:** 200 OK, 400 Invalid/Expired Token

---

## 4. Company Endpoints

All company endpoints operate on the authenticated user's company (extracted from JWT `company_id`). Platform admins use the admin endpoints instead.

### GET /api/v1/companies/profile

Retrieve the current company's profile.

**Auth:** CO, HR, FIN, VW

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Teknoloji A.S.",
    "vkn": "1234567890",
    "sector": "Teknoloji",
    "company_size_range": "51-200",
    "primary_contact_name": "Ahmet Yilmaz",
    "primary_contact_title": "IK Muduru",
    "primary_contact_email": "ahmet@acme.com.tr",
    "primary_contact_phone": "+905321234567",
    "billing_address": "Levent Mah. No:15, Besiktas",
    "billing_district": "besiktas",
    "billing_email": "finans@acme.com.tr",
    "einvoice_alias": null,
    "einvoice_type": "e_arsiv",
    "logo_url": "https://storage.supabase.co/company-logos/acme.png",
    "status": "active",
    "is_live": true,
    "subscription_plan": {
      "id": "uuid",
      "name": "Growth",
      "billing_cycle": "monthly",
      "renews_at": "2026-05-01"
    },
    "active_payment_method": "credit_card",
    "created_at": "2026-03-15T10:00:00+03:00"
  }
}
```

---

### PATCH /api/v1/companies/profile

Update the current company's profile.

**Auth:** CO

**Request Body (partial update):**

```json
{
  "name": "Acme Teknoloji A.S.",
  "billing_address": "Yeni adres, Besiktas",
  "billing_email": "yeni-finans@acme.com.tr",
  "logo_url": "https://storage.supabase.co/company-logos/acme-new.png",
  "default_delivery_address": "Ofis adresi, Besiktas",
  "default_delivery_window": "morning",
  "default_cake_text": "Dogum Gunun Kutlu Olsun, {ad}!"
}
```

**Response (200 OK):** Updated company object.

**Status Codes:** 200 OK, 400 Validation Error, 403 Forbidden

**Note:** Changes to `vkn` require admin approval and trigger a `tax_change_request` record.

---

### GET /api/v1/companies/onboarding

Get the current onboarding wizard state.

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "current_step": 3,
    "steps": [
      { "step": 1, "name": "company_profile", "completed": true },
      { "step": 2, "name": "subscription_plan", "completed": true },
      { "step": 3, "name": "add_employees", "completed": false },
      { "step": 4, "name": "ordering_rules", "completed": false },
      { "step": 5, "name": "payment_setup", "completed": false },
      { "step": 6, "name": "review_go_live", "completed": false }
    ],
    "is_completed": false
  }
}
```

---

### PATCH /api/v1/companies/onboarding

Advance or update the onboarding wizard state.

**Auth:** CO, HR

**Request Body:**

```json
{
  "completed_step": 3
}
```

**Response (200 OK):** Updated onboarding state.

**Status Codes:** 200 OK, 400 Step Not Valid (steps must be completed in order)

---

### GET /api/v1/companies/settings

Get the current company's operational settings.

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "require_order_approval": false,
    "order_lead_time_days": 60,
    "default_delivery_window": "no_preference",
    "default_delivery_address": "Ofis adresi, Besiktas",
    "default_cake_text": "Dogum Gunun Kutlu Olsun, {ad}!",
    "cancellation_cutoff_hours": 24,
    "cancellation_fee_pct": 0.00,
    "notify_order_events_email": true,
    "notify_order_events_wa": false,
    "notify_birthday_reminder": true,
    "birthday_reminder_days": 7
  }
}
```

---

### PATCH /api/v1/companies/settings

Update operational settings.

**Auth:** CO

**Request Body (partial update):**

```json
{
  "require_order_approval": true,
  "default_delivery_window": "morning"
}
```

**Response (200 OK):** Updated settings object.

---

### GET /api/v1/companies/users

List all users in the current company.

**Auth:** CO

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "full_name": "Ahmet Yilmaz",
      "email": "ahmet@acme.com.tr",
      "role": "company_owner",
      "is_active": true,
      "invitation_accepted_at": "2026-03-15T10:00:00+03:00"
    },
    {
      "id": "uuid",
      "user_id": null,
      "full_name": null,
      "email": "zeynep@acme.com.tr",
      "role": "hr_manager",
      "is_active": true,
      "invitation_accepted_at": null
    }
  ]
}
```

---

### POST /api/v1/companies/users

Invite a new user to the company.

**Auth:** CO

**Request Body:**

```json
{
  "email": "zeynep@acme.com.tr",
  "role": "hr_manager"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "zeynep@acme.com.tr",
    "role": "hr_manager",
    "invitation_expires_at": "2026-04-03T10:00:00+03:00",
    "message": "Davet e-postasi gonderildi."
  }
}
```

**Status Codes:** 201 Created, 400 Validation Error, 409 User Already Exists

---

### PATCH /api/v1/companies/users/:userId

Update a user's role or deactivate.

**Auth:** CO

**Request Body:**

```json
{
  "role": "finance",
  "is_active": true
}
```

**Response (200 OK):** Updated user object.

**Status Codes:** 200 OK, 400 Cannot Change Own Role, 403 Forbidden

---

### DELETE /api/v1/companies/users/:userId

Remove a user from the company.

**Auth:** CO

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Kullanici basariyla kaldirildi." }
}
```

**Status Codes:** 200 OK, 400 Cannot Remove Self, 403 Forbidden

---

## 5. Employee Endpoints

All employee endpoints are scoped to the authenticated user's company.

### GET /api/v1/employees

List employees with pagination, search, and filters.

**Auth:** CO, HR, VW

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page`, `pageSize` | integer | Pagination |
| `search` | string | Search by name (partial, case-insensitive, Turkish normalized) |
| `department` | string | Filter by department (comma-separated for multi-select) |
| `status` | string | `active` or `inactive` |
| `source` | string | `manual`, `csv`, `bamboohr`, `kolayik` |
| `upcoming_birthdays` | integer | Filter employees with birthdays in next N days (7, 30, 90) |
| `sort` | string | `name`, `next_birthday`, `department`, `start_date`, `created_at` |
| `order` | string | `asc` or `desc` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "first_name": "Zeynep",
      "last_name": "Kaya",
      "date_of_birth": "1992-06-15",
      "start_date": "2020-01-10",
      "department": "Muhendislik",
      "office_location": "Besiktas Ofis",
      "delivery_address": null,
      "delivery_district": null,
      "personal_email": "zeynep@gmail.com",
      "work_email": "zeynep@acme.com.tr",
      "source": "bamboohr",
      "external_id": "bhr-123",
      "status": "active",
      "skip_cake": false,
      "preferred_cake_type_id": null,
      "preferred_cake_size": null,
      "next_birthday": "2026-06-15",
      "next_birthday_age": 34,
      "created_at": "2026-03-15T10:00:00+03:00"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 87,
    "totalPages": 4
  }
}
```

---

### POST /api/v1/employees

Create a new employee manually.

**Auth:** CO, HR

**Request Body:**

```json
{
  "first_name": "Ali",
  "last_name": "Demir",
  "date_of_birth": "1990-03-20",
  "start_date": "2022-06-01",
  "department": "Pazarlama",
  "office_location": "Sariyer Ofis",
  "delivery_address": "Istinye Mah. No:5, Sariyer",
  "delivery_district": "sariyer",
  "personal_email": "ali@gmail.com",
  "work_email": "ali@acme.com.tr"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Ali",
    "last_name": "Demir",
    "date_of_birth": "1990-03-20",
    "status": "active",
    "source": "manual",
    "created_at": "2026-03-31T14:30:00+03:00"
  }
}
```

**Status Codes:** 201 Created, 400 Validation Error (e.g., future DOB), 409 Duplicate Warning (same name + DOB)

**Note:** 409 returns a warning, not a block. The client should confirm with `force: true` to proceed.

---

### POST /api/v1/employees?force=true

Force-create an employee when a duplicate warning was returned.

Same as above, with `?force=true` query parameter.

---

### GET /api/v1/employees/:employeeId

Get a single employee's full details.

**Auth:** CO, HR, VW

**Response (200 OK):** Full employee object including ordering rule overrides.

---

### PATCH /api/v1/employees/:employeeId

Update an employee record.

**Auth:** CO, HR

**Request Body (partial update):**

```json
{
  "department": "Satis",
  "delivery_address": "Yeni adres, Besiktas",
  "delivery_district": "besiktas"
}
```

**Response (200 OK):** Updated employee object.

---

### DELETE /api/v1/employees/:employeeId

Permanently delete an employee.

**Auth:** CO, HR

**Precondition:** Cannot delete if the employee has active confirmed orders. Returns 409 with the list of active orders.

**Request Body:**

```json
{
  "confirm_name": "Ali Demir"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Calisan basariyla silindi." }
}
```

**Status Codes:** 200 OK, 400 Name Confirmation Mismatch, 409 Active Orders Exist

---

### PATCH /api/v1/employees/:employeeId/status

Activate or deactivate an employee.

**Auth:** CO, HR

**Request Body:**

```json
{
  "status": "inactive",
  "cancel_pending_orders": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "inactive",
    "deactivated_at": "2026-03-31T14:30:00+03:00",
    "pending_orders": [
      {
        "id": "uuid",
        "delivery_date": "2026-04-15",
        "status": "confirmed"
      }
    ]
  }
}
```

**Note:** If `cancel_pending_orders` is `true`, all draft/pending/confirmed orders for this employee are cancelled.

---

### PUT /api/v1/employees/:employeeId/overrides

Set or update employee-level ordering rule overrides.

**Auth:** CO, HR

**Request Body:**

```json
{
  "preferred_cake_type_id": "uuid",
  "preferred_cake_size": "large",
  "custom_message_override": "Iyiki dogdun Ali!",
  "skip_cake": false
}
```

**Response (200 OK):** Updated employee object with overrides.

---

### GET /api/v1/employees/:employeeId/overrides

Get the current overrides for an employee.

**Auth:** CO, HR, VW

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "preferred_cake_type_id": "uuid",
    "preferred_cake_type_name": "Cikolatali Pasta",
    "preferred_cake_size": "large",
    "custom_message_override": "Iyiki dogdun Ali!",
    "skip_cake": false
  }
}
```

---

### POST /api/v1/employees/import/preview

Preview a CSV import before committing.

**Auth:** CO, HR

**Request:** `multipart/form-data` with a `file` field (CSV, max 5 MB)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_rows": 150,
    "valid_rows": 145,
    "invalid_rows": 5,
    "duplicate_rows": 3,
    "preview": [
      {
        "row_number": 1,
        "status": "valid",
        "data": {
          "first_name": "Ali",
          "last_name": "Demir",
          "date_of_birth": "1990-03-20",
          "start_date": "2022-06-01",
          "department": "Pazarlama"
        },
        "errors": []
      },
      {
        "row_number": 5,
        "status": "invalid",
        "data": {
          "first_name": "Mehmet",
          "last_name": "",
          "date_of_birth": "invalid-date",
          "start_date": "2021-01-15",
          "department": "IT"
        },
        "errors": [
          { "field": "last_name", "message": "Soyad alani zorunludur." },
          { "field": "date_of_birth", "message": "Gecersiz tarih formati. DD/MM/YYYY veya DD.MM.YYYY kullanin." }
        ]
      },
      {
        "row_number": 12,
        "status": "duplicate",
        "data": {
          "first_name": "Zeynep",
          "last_name": "Kaya",
          "date_of_birth": "1992-06-15",
          "start_date": "2020-01-10",
          "department": "Muhendislik"
        },
        "existing_employee_id": "uuid",
        "errors": []
      }
    ],
    "import_token": "temp-token-for-confirm"
  }
}
```

---

### POST /api/v1/employees/import/confirm

Commit a previously previewed CSV import.

**Auth:** CO, HR

**Request Body:**

```json
{
  "import_token": "temp-token-for-confirm",
  "import_mode": "valid_only",
  "duplicate_action": "skip"
}
```

`import_mode`: `valid_only` (skip invalid rows) or `all` (fail if any invalid).
`duplicate_action`: `skip`, `update`, or `create` (create duplicates).

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "created": 142,
    "updated": 3,
    "skipped": 5,
    "message": "142 calisan basariyla eklendi.",
    "skipped_report_url": "https://storage.supabase.co/csv-imports/report-uuid.csv"
  }
}
```

---

### GET /api/v1/employees/import/template

Download the CSV import template.

**Auth:** CO, HR

**Response:** `text/csv` file download with headers: `ad_soyad`, `dogum_tarihi`, `ise_baslama_tarihi`, `departman`, `kisisel_email`, `is_email`, `teslimat_adresi`

---

## 6. HR Integration Endpoints

### GET /api/v1/integrations

List all configured HR integrations for the current company.

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "integration_type": "bamboohr",
      "subdomain": "acme",
      "is_active": true,
      "last_sync_at": "2026-03-31T02:00:00+03:00",
      "last_sync_status": "success",
      "last_sync_employee_count": 87,
      "manual_sync_allowed_after": "2026-03-31T15:00:00+03:00",
      "created_at": "2026-03-15T10:00:00+03:00"
    }
  ]
}
```

---

### POST /api/v1/integrations/bamboohr/connect

Connect a BambooHR integration.

**Auth:** CO, HR

**Request Body:**

```json
{
  "subdomain": "acme",
  "api_key": "bhr-api-key-xxxx"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "integration_type": "bamboohr",
    "subdomain": "acme",
    "is_active": true,
    "message": "BambooHR baglantisi basariyla kuruldu."
  }
}
```

**Status Codes:** 201 Created, 400 Invalid Credentials, 409 Already Connected

---

### POST /api/v1/integrations/bamboohr/test

Test the BambooHR connection without saving.

**Auth:** CO, HR

**Request Body:**

```json
{
  "subdomain": "acme",
  "api_key": "bhr-api-key-xxxx"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "employee_count": 87,
    "message": "Baglanti basarili. 87 calisan bulundu."
  }
}
```

---

### POST /api/v1/integrations/bamboohr/sync

Trigger a manual sync from BambooHR.

**Auth:** CO, HR

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "sync_id": "uuid",
    "status": "running",
    "message": "Senkronizasyon baslatildi."
  }
}
```

**Status Codes:** 202 Accepted, 429 Rate Limited (1 sync per hour)

---

### GET /api/v1/integrations/bamboohr/status

Get the current status of the BambooHR integration.

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "is_active": true,
    "last_sync_at": "2026-03-31T02:00:00+03:00",
    "last_sync_status": "success",
    "last_sync_employee_count": 87,
    "next_scheduled_sync": "2026-04-01T02:00:00+03:00"
  }
}
```

---

### GET /api/v1/integrations/bamboohr/logs

Get sync logs for the last 30 days.

**Auth:** CO, HR

**Query Parameters:** `page`, `pageSize`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "trigger_type": "scheduled",
      "triggered_by": null,
      "started_at": "2026-03-31T02:00:00+03:00",
      "completed_at": "2026-03-31T02:00:45+03:00",
      "status": "success",
      "records_fetched": 87,
      "records_created": 2,
      "records_updated": 5,
      "records_deactivated": 0,
      "records_skipped": 0,
      "error_message": null
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 30, "totalPages": 2 }
}
```

---

### DELETE /api/v1/integrations/bamboohr

Disconnect the BambooHR integration.

**Auth:** CO

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "BambooHR baglantisi kaldirildi." }
}
```

---

### POST /api/v1/integrations/kolayik/connect

Connect a KolayIK integration. Same pattern as BambooHR.

**Auth:** CO, HR

**Request Body:**

```json
{
  "api_key": "kolayik-api-key-xxxx"
}
```

**Response:** Same structure as BambooHR connect.

---

### POST /api/v1/integrations/kolayik/test

**Auth:** CO, HR -- Same pattern as BambooHR test.

### POST /api/v1/integrations/kolayik/sync

**Auth:** CO, HR -- Same pattern as BambooHR sync.

### GET /api/v1/integrations/kolayik/status

**Auth:** CO, HR -- Same pattern as BambooHR status.

### GET /api/v1/integrations/kolayik/logs

**Auth:** CO, HR -- Same pattern as BambooHR logs.

### DELETE /api/v1/integrations/kolayik

**Auth:** CO -- Same pattern as BambooHR disconnect.

---

## 7. Ordering Rule Endpoints

### GET /api/v1/ordering-rules

List all ordering rules for the current company.

**Auth:** CO, HR, VW

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Tum Dogum Gunleri",
      "rule_type": "all_birthdays",
      "milestone_ages": null,
      "anniversary_years": null,
      "default_cake_type": {
        "id": "uuid",
        "name": "Cikolatali Pasta"
      },
      "default_cake_size": "medium",
      "custom_text_template": "Dogum Gunun Kutlu Olsun, {ad}!",
      "is_active": true,
      "created_by": "uuid",
      "created_at": "2026-03-15T10:00:00+03:00"
    }
  ]
}
```

---

### POST /api/v1/ordering-rules

Create a new ordering rule.

**Auth:** CO, HR

**Request Body:**

```json
{
  "name": "Yuvarlak Dogum Gunleri",
  "rule_type": "round_birthdays",
  "milestone_ages": [25, 30, 35, 40, 45, 50, 55, 60],
  "default_cake_type_id": "uuid",
  "default_cake_size": "medium",
  "custom_text_template": "Nice yillara, {ad}!",
  "is_active": true
}
```

**Response (201 Created):** Created rule object.

**Status Codes:** 201 Created, 400 Validation Error, 409 Conflicting Rule (e.g., both `all_birthdays` and `round_birthdays` active)

---

### GET /api/v1/ordering-rules/:ruleId

Get a single ordering rule.

**Auth:** CO, HR, VW

**Response (200 OK):** Full rule object.

---

### PATCH /api/v1/ordering-rules/:ruleId

Update an ordering rule.

**Auth:** CO, HR

**Request Body (partial update):**

```json
{
  "milestone_ages": [30, 40, 50, 60],
  "is_active": false
}
```

**Response (200 OK):** Updated rule object.

**Note:** When deactivating a rule, only future unconfirmed draft orders generated by this rule are cancelled.

---

### DELETE /api/v1/ordering-rules/:ruleId

Delete an ordering rule.

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Siparis kurali silindi.",
    "cancelled_draft_orders": 5
  }
}
```

---

## 8. Order Endpoints

### GET /api/v1/orders

List orders for the current company with filters.

**Auth:** CO, HR, FIN (read-only), VW

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page`, `pageSize` | integer | Pagination |
| `status` | string | Comma-separated: `draft,pending_approval,confirmed,assigned,accepted,preparing,out_for_delivery,delivered,cancelled,failed` |
| `order_type` | string | `automatic` or `ad_hoc` |
| `delivery_date_from` | date | Start of delivery date range |
| `delivery_date_to` | date | End of delivery date range |
| `district` | string | `besiktas` or `sariyer` |
| `employee_id` | uuid | Filter by specific employee |
| `search` | string | Search by recipient name or order ID |
| `sort` | string | `delivery_date`, `created_at`, `status`, `order_total_try` |
| `order` | string | `asc` or `desc` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_type": "automatic",
      "status": "confirmed",
      "recipient_name": "Zeynep Kaya",
      "delivery_date": "2026-06-15",
      "delivery_address": "Besiktas Ofis, No:15",
      "delivery_district": "besiktas",
      "delivery_window": "morning",
      "cake_type": {
        "id": "uuid",
        "name": "Cikolatali Pasta"
      },
      "cake_size": "medium",
      "custom_text": "Dogum Gunun Kutlu Olsun, Zeynep!",
      "bakery": {
        "id": "uuid",
        "name": "Leziz Pastanesi"
      },
      "base_price_try": 250.00,
      "platform_fee_try": 25.00,
      "vat_rate": 0.20,
      "order_total_try": 330.00,
      "employee_id": "uuid",
      "rule_id": "uuid",
      "created_at": "2026-04-16T00:01:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 42, "totalPages": 2 }
}
```

---

### GET /api/v1/orders/:orderId

Get full order details.

**Auth:** CO, HR, FIN, VW

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_type": "automatic",
    "status": "accepted",
    "recipient_name": "Zeynep Kaya",
    "recipient_phone": "+905329876543",
    "delivery_date": "2026-06-15",
    "delivery_address": "Besiktas Ofis, No:15",
    "delivery_district": "besiktas",
    "delivery_window": "morning",
    "cake_type": {
      "id": "uuid",
      "name": "Cikolatali Pasta",
      "image_url": "https://storage.supabase.co/cake-images/cikolatali.webp"
    },
    "cake_size": "medium",
    "custom_text": "Dogum Gunun Kutlu Olsun, Zeynep!",
    "bakery": {
      "id": "uuid",
      "name": "Leziz Pastanesi",
      "phone": "+902121234567"
    },
    "employee_id": "uuid",
    "rule_id": "uuid",
    "base_price_try": 250.00,
    "platform_fee_try": 25.00,
    "vat_rate": 0.20,
    "order_total_try": 330.00,
    "cancellation_fee_try": 0.00,
    "payment_id": "uuid",
    "assigned_at": "2026-06-08T00:30:00+03:00",
    "accepted_at": "2026-06-08T09:15:00+03:00",
    "delivered_at": null,
    "status_history": [
      { "from_status": null, "to_status": "draft", "changed_at": "2026-04-16T00:01:00+03:00", "changed_by": null, "note": "Auto-generated by scheduler" },
      { "from_status": "draft", "to_status": "confirmed", "changed_at": "2026-05-16T00:15:00+03:00", "changed_by": null, "note": "Auto-confirmed at T-30" },
      { "from_status": "confirmed", "to_status": "assigned", "changed_at": "2026-06-08T00:30:00+03:00", "changed_by": null, "note": "Assigned to Leziz Pastanesi" },
      { "from_status": "assigned", "to_status": "accepted", "changed_at": "2026-06-08T09:15:00+03:00", "changed_by": "bakery-user-uuid", "note": null }
    ],
    "created_at": "2026-04-16T00:01:00+03:00",
    "updated_at": "2026-06-08T09:15:00+03:00"
  }
}
```

---

### POST /api/v1/orders/ad-hoc

Place a one-time ad-hoc order.

**Auth:** CO, HR

**Request Body:**

```json
{
  "employee_id": "uuid",
  "recipient_name": "Mehmet Oz",
  "recipient_phone": "+905331112233",
  "delivery_date": "2026-04-20",
  "delivery_address": "Sariyer Ofis, No:8",
  "delivery_district": "sariyer",
  "delivery_window": "afternoon",
  "cake_type_id": "uuid",
  "cake_size": "large",
  "custom_text": "Iyiki dogdun Mehmet!"
}
```

**Note:** `employee_id` is optional. If omitted, `recipient_name` is required (guest order).

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "order_type": "ad_hoc",
    "delivery_date": "2026-04-20",
    "base_price_try": 350.00,
    "platform_fee_try": 35.00,
    "vat_rate": 0.20,
    "order_total_try": 462.00,
    "message": "Siparisiniz olusturuldu."
  }
}
```

**Status Codes:** 201 Created, 400 Validation Error, 400 Delivery District Not Supported, 400 Delivery Date Too Soon (lead time), 402 Payment Method Required

---

### PATCH /api/v1/orders/:orderId

Edit an existing order (limited by status).

**Auth:** CO, HR

**Request Body (partial update):**

```json
{
  "custom_text": "Nice yillara, Mehmet!",
  "delivery_address": "Yeni adres, Sariyer"
}
```

**Editable fields by status:**
- `draft`, `pending_approval`: All fields editable
- `confirmed` (more than 3 days before delivery): Only `custom_text` and `delivery_address`
- `assigned` and beyond: Not editable (returns 400)

**Response (200 OK):** Updated order object.

---

### POST /api/v1/orders/:orderId/approve

Approve a pending order (when order approval workflow is enabled).

**Auth:** CO, HR

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "approved_at": "2026-03-31T14:00:00+03:00",
    "message": "Siparis onaylandi."
  }
}
```

**Status Codes:** 200 OK, 400 Order Not In Pending Approval Status

---

### POST /api/v1/orders/:orderId/reject

Reject a pending order (when order approval workflow is enabled).

**Auth:** CO, HR

**Request Body:**

```json
{
  "reason": "Calisan ayrildi."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "message": "Siparis reddedildi ve iptal edildi."
  }
}
```

---

### POST /api/v1/orders/:orderId/cancel

Cancel an order.

**Auth:** CO, HR

**Request Body:**

```json
{
  "reason": "Calisan istifa etti."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancellation_fee_try": 0.00,
    "refund_amount_try": 330.00,
    "message": "Siparis iptal edildi."
  }
}
```

**Status Codes:** 200 OK, 400 Order Cannot Be Cancelled (already delivered, already cancelled)

**Note:** If the bakery has already accepted, the status moves to `cancellation_requested` and the bakery must confirm. If within cancellation cutoff, a fee may apply.

---

### GET /api/v1/orders/upcoming

Get a summary of upcoming orders for the next 90 days.

**Auth:** CO, HR, VW

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_upcoming": 15,
    "by_status": {
      "draft": 5,
      "pending_approval": 2,
      "confirmed": 6,
      "assigned": 1,
      "accepted": 1
    },
    "next_7_days": [
      {
        "id": "uuid",
        "recipient_name": "Ali Demir",
        "delivery_date": "2026-04-03",
        "status": "accepted",
        "cake_type_name": "Cikolatali Pasta"
      }
    ]
  }
}
```

---

## 9. Cake Catalogue Endpoints

### GET /api/v1/cakes

List all available cake types with pricing.

**Auth:** Any authenticated user

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page`, `pageSize` | integer | Pagination |
| `search` | string | Search by cake name |
| `is_gluten_free` | boolean | Filter gluten-free |
| `is_vegan` | boolean | Filter vegan |
| `is_active` | boolean | Default: `true` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cikolatali Pasta",
      "slug": "cikolatali-pasta",
      "description": "Zengin cikolata kremali ozel pasta.",
      "image_url": "https://storage.supabase.co/cake-images/cikolatali.webp",
      "is_gluten_free": false,
      "is_vegan": false,
      "allergens": ["dairy", "eggs", "gluten"],
      "is_seasonal": false,
      "is_active": true,
      "prices": [
        { "size": "small", "price_try": 200.00, "weight_grams": 500 },
        { "size": "medium", "price_try": 300.00, "weight_grams": 1000 },
        { "size": "large", "price_try": 400.00, "weight_grams": 1500 }
      ]
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 12, "totalPages": 1 }
}
```

---

### GET /api/v1/cakes/:cakeId

Get full details of a single cake type.

**Auth:** Any authenticated user

**Response (200 OK):** Full cake object with all size/price options.

---

## 10. Payment Endpoints

### GET /api/v1/payments/methods

List saved payment methods for the current company.

**Auth:** CO, FIN

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "credit_card",
      "card_last_four": "4242",
      "card_brand": "VISA",
      "is_default": true,
      "created_at": "2026-03-15T10:00:00+03:00"
    }
  ]
}
```

---

### POST /api/v1/payments/methods/initialize

Initialize the iyzico card registration flow.

**Auth:** CO, FIN

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "checkout_form_content": "<html>iyzico hosted form content</html>",
    "token": "iyzico-checkout-token",
    "callback_url": "https://cakeday.com.tr/billing/payment-methods/callback"
  }
}
```

---

### POST /api/v1/payments/methods/callback

Process the iyzico card registration callback.

**Auth:** CO, FIN

**Request Body:**

```json
{
  "token": "iyzico-checkout-token"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "card_last_four": "4242",
    "card_brand": "VISA",
    "is_default": true,
    "message": "Kart basariyla eklendi."
  }
}
```

---

### POST /api/v1/payments/methods/:methodId/default

Set a payment method as the default.

**Auth:** CO, FIN

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Varsayilan odeme yontemi guncellendi." }
}
```

---

### DELETE /api/v1/payments/methods/:methodId

Remove a saved payment method.

**Auth:** CO, FIN

**Precondition:** Cannot delete the default method if there are upcoming confirmed orders.

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Odeme yontemi kaldirildi." }
}
```

**Status Codes:** 200 OK, 400 Cannot Delete Default With Active Orders

---

### POST /api/v1/payments/charge

Charge the default payment method for a specific order (per-order payment flow).

**Auth:** Internal (called by order confirmation flow, not directly by users)

**Request Body:**

```json
{
  "order_id": "uuid",
  "amount_try": 330.00
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "iyzico_payment_id": "iyz-12345",
    "status": "succeeded",
    "amount_try": 330.00
  }
}
```

---

### GET /api/v1/payments/invoices

List invoices for the current company.

**Auth:** CO, FIN

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page`, `pageSize` | integer | Pagination |
| `status` | string | `pending`, `succeeded`, `failed`, `void` |
| `date_from` | date | Start of period |
| `date_to` | date | End of period |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-2026-001234",
      "period_start": "2026-03-01",
      "period_end": "2026-03-31",
      "subtotal_try": 2500.00,
      "vat_amount_try": 500.00,
      "total_try": 3000.00,
      "status": "succeeded",
      "due_date": "2026-04-15",
      "paid_at": "2026-04-02T10:00:00+03:00",
      "pdf_url": "https://storage.supabase.co/invoices/INV-2026-001234.pdf",
      "created_at": "2026-04-01T03:00:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 6, "totalPages": 1 }
}
```

---

### GET /api/v1/payments/invoices/:invoiceId

Get full invoice details with line items.

**Auth:** CO, FIN

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2026-001234",
    "period_start": "2026-03-01",
    "period_end": "2026-03-31",
    "subtotal_try": 2500.00,
    "vat_amount_try": 500.00,
    "total_try": 3000.00,
    "status": "succeeded",
    "due_date": "2026-04-15",
    "paid_at": "2026-04-02T10:00:00+03:00",
    "einvoice_type": "e_arsiv",
    "pdf_url": "https://storage.supabase.co/invoices/INV-2026-001234.pdf",
    "line_items": [
      {
        "id": "uuid",
        "line_type": "subscription",
        "description": "Growth Plan - Mart 2026",
        "quantity": 1,
        "unit_price_try": 500.00,
        "total_try": 500.00,
        "vat_rate": 0.20
      },
      {
        "id": "uuid",
        "line_type": "order",
        "description": "Siparis #ORD-2026-0045 - Cikolatali Pasta (M)",
        "quantity": 1,
        "unit_price_try": 275.00,
        "total_try": 275.00,
        "vat_rate": 0.20,
        "order_id": "uuid"
      }
    ]
  }
}
```

---

### GET /api/v1/payments/invoices/:invoiceId/pdf

Download the invoice PDF.

**Auth:** CO, FIN

**Response:** Redirect (302) to a signed Supabase Storage URL, or stream the PDF directly with `Content-Type: application/pdf`.

---

### GET /api/v1/payments/subscription

Get the current company's subscription details.

**Auth:** CO, FIN

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "name": "Growth",
      "slug": "growth",
      "price_monthly_try": 500.00,
      "price_annual_try": 5000.00,
      "employee_limit": 200,
      "commission_rate": 0.10,
      "monthly_invoice_allowed": true,
      "features": {
        "hr_integrations": true,
        "custom_branding": false,
        "api_access": false
      }
    },
    "billing_cycle": "monthly",
    "started_at": "2026-03-15T10:00:00+03:00",
    "renews_at": "2026-04-15T00:00:00+03:00",
    "current_employee_count": 87,
    "is_overridden": false
  }
}
```

---

### PATCH /api/v1/payments/subscription

Change the subscription plan or billing cycle.

**Auth:** CO

**Request Body:**

```json
{
  "plan_id": "uuid",
  "billing_cycle": "annual"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Abonelik plani guncellendi. Degisiklik bir sonraki faturalama doneminde gecerli olacaktir.",
    "effective_date": "2026-04-15"
  }
}
```

---

### GET /api/v1/payments/plans

List all available subscription plans.

**Auth:** Any authenticated company user

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Starter",
      "slug": "starter",
      "price_monthly_try": 250.00,
      "price_annual_try": 2500.00,
      "employee_limit": 50,
      "commission_rate": 0.15,
      "monthly_invoice_allowed": false,
      "features": {
        "hr_integrations": false,
        "custom_branding": false,
        "api_access": false
      },
      "display_order": 1
    }
  ]
}
```

---

## 11. Notification Endpoints

### GET /api/v1/notifications/preferences

Get the current user's notification preferences.

**Auth:** Any authenticated user

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "email_notifications_enabled": true,
    "whatsapp_notifications_enabled": true,
    "whatsapp_number": "+905321234567",
    "preferences": [
      {
        "event": "order_confirmed",
        "email": true,
        "whatsapp": false
      },
      {
        "event": "order_out_for_delivery",
        "email": true,
        "whatsapp": true
      },
      {
        "event": "payment_failed",
        "email": true,
        "whatsapp": true
      }
    ]
  }
}
```

---

### PATCH /api/v1/notifications/preferences

Update notification preferences.

**Auth:** Any authenticated user

**Request Body:**

```json
{
  "whatsapp_notifications_enabled": true,
  "whatsapp_number": "+905321234567",
  "preferences": [
    { "event": "order_confirmed", "email": true, "whatsapp": true },
    { "event": "order_out_for_delivery", "email": true, "whatsapp": true }
  ]
}
```

**Response (200 OK):** Updated preferences object.

---

## 12. Bakery Portal Endpoints

All bakery endpoints are scoped to the authenticated bakery user's bakery (extracted from JWT `bakery_id`).

### POST /api/v1/bakery/setup

Complete the initial bakery profile setup (from invitation link).

**Auth:** BA

**Request Body:**

```json
{
  "name": "Leziz Pastanesi",
  "description": "Besiktas'in en taze pastalari.",
  "logo_url": "https://storage.supabase.co/bakery-photos/leziz.png",
  "business_hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "15:00" },
    "sunday": null
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "message": "Profil basariyla tamamlandi. Siparis almaya hazirsiniz."
  }
}
```

---

### GET /api/v1/bakery/profile

Get the bakery's profile.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Leziz Pastanesi",
    "slug": "leziz-pastanesi",
    "description": "Besiktas'in en taze pastalari.",
    "logo_url": "https://storage.supabase.co/bakery-photos/leziz.png",
    "contact_name": "Fatma Yildirim",
    "contact_email": "fatma@leziz.com.tr",
    "contact_phone": "+902121234567",
    "address": "Besiktas Cad. No:20, Istanbul",
    "iban": "TR33 0006 1005 1978 6457 8413 26",
    "bank_name": "Garanti BBVA",
    "business_hours": { ... },
    "districts": ["besiktas"],
    "status": "active",
    "acceptance_window_hours": 4,
    "created_at": "2026-03-01T10:00:00+03:00"
  }
}
```

---

### PATCH /api/v1/bakery/profile

Update the bakery profile.

**Auth:** BA

**Request Body (partial update):**

```json
{
  "description": "Besiktas ve Sariyer'e taze pasta.",
  "business_hours": { ... }
}
```

**Response (200 OK):** Updated bakery profile.

**Note:** Districts are read-only in MVP (managed by admin).

---

### GET /api/v1/bakery/orders

List orders assigned to the bakery.

**Auth:** BA

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page`, `pageSize` | integer | Pagination |
| `status` | string | `assigned`, `accepted`, `preparing`, `out_for_delivery`, `delivered`, `rejected`, `cancelled` |
| `delivery_date_from` | date | Start of delivery date range |
| `delivery_date_to` | date | End of delivery date range |
| `sort` | string | `delivery_date`, `created_at`, `status` |
| `order` | string | `asc` or `desc` (default: `delivery_date asc`) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "assigned",
      "delivery_date": "2026-04-05",
      "delivery_window": "morning",
      "recipient_name": "Zeynep Kaya",
      "delivery_address": "Besiktas Ofis, No:15",
      "delivery_district": "besiktas",
      "company_name": "Acme Teknoloji A.S.",
      "cake_type": {
        "id": "uuid",
        "name": "Cikolatali Pasta"
      },
      "cake_size": "medium",
      "custom_text": "Dogum Gunun Kutlu Olsun, Zeynep!",
      "recipient_phone": "+905329876543",
      "assigned_at": "2026-03-29T00:30:00+03:00",
      "acceptance_deadline": "2026-03-29T04:30:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 8, "totalPages": 1 }
}
```

---

### GET /api/v1/bakery/orders/:orderId

Get full order details (bakery view).

**Auth:** BA

**Response (200 OK):** Full order object scoped to bakery-relevant fields.

---

### POST /api/v1/bakery/orders/:orderId/accept

Accept an assigned order.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "accepted",
    "accepted_at": "2026-03-29T09:15:00+03:00",
    "message": "Siparis kabul edildi."
  }
}
```

**Status Codes:** 200 OK, 400 Order Not In Assigned Status, 400 Acceptance Deadline Passed

---

### POST /api/v1/bakery/orders/:orderId/reject

Reject an assigned order.

**Auth:** BA

**Request Body:**

```json
{
  "reason": "Kapasite yetersizligi"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejected_at": "2026-03-29T09:15:00+03:00",
    "message": "Siparis reddedildi. Baska bir firina atanacaktir."
  }
}
```

**Status Codes:** 200 OK, 400 Order Not In Assigned Status, 400 Reason Required

---

### POST /api/v1/bakery/orders/:orderId/preparing

Mark an accepted order as being prepared.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "preparing",
    "message": "Siparis hazirlaniyor olarak isaretlendi."
  }
}
```

---

### POST /api/v1/bakery/orders/:orderId/out-for-delivery

Mark an order as out for delivery.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "out_for_delivery",
    "message": "Siparis yola cikti."
  }
}
```

---

### POST /api/v1/bakery/orders/:orderId/delivered

Mark an order as delivered.

**Auth:** BA

**Request Body (optional):**

```json
{
  "delivery_photo_url": "https://storage.supabase.co/delivery-photos/order-uuid.jpg"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "delivered",
    "delivered_at": "2026-04-05T10:30:00+03:00",
    "message": "Teslimat onaylandi."
  }
}
```

---

### GET /api/v1/bakery/prices

Get the current price list for the bakery.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "cake_type_id": "uuid",
      "cake_type_name": "Cikolatali Pasta",
      "size": "medium",
      "customer_price_try": 300.00,
      "bakery_net_price_try": 270.00,
      "commission_rate": 0.10,
      "valid_from": "2026-01-01"
    }
  ]
}
```

---

### GET /api/v1/bakery/price-requests

List the bakery's price change requests.

**Auth:** BA

**Query Parameters:** `page`, `pageSize`, `status` (`pending`, `approved`, `rejected`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cake_type_name": "Cikolatali Pasta",
      "size": "medium",
      "current_price_try": 300.00,
      "requested_price_try": 350.00,
      "effective_date": "2026-05-01",
      "justification": "Hammadde maliyetleri artti.",
      "status": "pending",
      "admin_note": null,
      "created_at": "2026-03-25T10:00:00+03:00"
    }
  ]
}
```

---

### POST /api/v1/bakery/price-requests

Submit a new price change request.

**Auth:** BA

**Request Body:**

```json
{
  "cake_type_id": "uuid",
  "size": "medium",
  "requested_price_try": 350.00,
  "effective_date": "2026-05-01",
  "justification": "Hammadde maliyetleri artti."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "message": "Fiyat degisikligi talebiniz iletildi."
  }
}
```

**Status Codes:** 201 Created, 400 Validation Error, 409 Pending Request Already Exists

---

### GET /api/v1/bakery/price-requests/:requestId

Get details of a specific price change request.

**Auth:** BA

**Response (200 OK):** Full price change request object.

---

### GET /api/v1/bakery/payouts

List payout history for the bakery.

**Auth:** BA

**Query Parameters:** `page`, `pageSize`, `date_from`, `date_to`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "period_start": "2026-03-01",
      "period_end": "2026-03-31",
      "total_orders": 45,
      "gross_amount_try": 13500.00,
      "commission_try": 1350.00,
      "net_payout_try": 12150.00,
      "status": "processed",
      "processed_at": "2026-04-05T10:00:00+03:00"
    }
  ]
}
```

---

### GET /api/v1/bakery/settings

Get bakery notification and operational settings.

**Auth:** BA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "daily_digest_time": "08:00",
    "email_notifications_enabled": true,
    "whatsapp_notifications_enabled": true,
    "whatsapp_number": "+905321234567"
  }
}
```

---

### PATCH /api/v1/bakery/settings

Update bakery settings.

**Auth:** BA

**Request Body:**

```json
{
  "daily_digest_time": "07:00",
  "whatsapp_notifications_enabled": false
}
```

**Response (200 OK):** Updated settings object.

---

## 13. Admin Endpoints

All admin endpoints require the `platform_admin` role.

### 13.1 Dashboard

#### GET /api/v1/admin/dashboard

Get key metrics for the admin home screen.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "active_companies": 42,
    "active_bakeries": 8,
    "orders_this_month": 312,
    "orders_today": 15,
    "revenue_this_month_try": 45000.00,
    "pending_price_requests": 3,
    "pending_approvals": 7,
    "failed_deliveries_today": 0,
    "orders_by_status": {
      "draft": 120,
      "confirmed": 85,
      "assigned": 30,
      "accepted": 25,
      "out_for_delivery": 5,
      "delivered": 280,
      "cancelled": 12,
      "failed": 2
    }
  }
}
```

---

### 13.2 Company Management

#### GET /api/v1/admin/companies

List all companies with filters.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `search`, `status`, `plan_id`, `sort`, `order`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Teknoloji A.S.",
      "vkn": "1234567890",
      "status": "active",
      "subscription_plan_name": "Growth",
      "employee_count": 87,
      "total_orders": 142,
      "created_at": "2026-03-15T10:00:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 42, "totalPages": 2 }
}
```

---

#### GET /api/v1/admin/companies/:companyId

Get full company details including users, subscription, billing history, and order stats.

**Auth:** PA

**Response (200 OK):** Complete company object with nested relations.

---

#### PATCH /api/v1/admin/companies/:companyId

Update any company field (admin override).

**Auth:** PA

**Request Body (partial update):**

```json
{
  "admin_note": "Pilot musteri, ozel sozlesme.",
  "order_lead_time_days": 45
}
```

**Response (200 OK):** Updated company object.

---

#### POST /api/v1/admin/companies/:companyId/activate

Activate a company (from pending_approval or suspended state).

**Auth:** PA

**Request Body:**

```json
{
  "note": "Onaylandi."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "active", "message": "Sirket aktive edildi." }
}
```

---

#### POST /api/v1/admin/companies/:companyId/suspend

Suspend a company.

**Auth:** PA

**Request Body:**

```json
{
  "reason": "Odeme gecikmeleri.",
  "note": "3 fatura odenmedi."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "suspended", "message": "Sirket askiya alindi." }
}
```

---

#### POST /api/v1/admin/companies/:companyId/deactivate

Permanently deactivate a company.

**Auth:** PA

**Request Body:**

```json
{
  "reason": "Musteri talep etti.",
  "note": "Tum siparisler iptal edildi."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "deactivated", "message": "Sirket deaktive edildi." }
}
```

---

#### PATCH /api/v1/admin/companies/:companyId/subscription

Override a company's subscription plan.

**Auth:** PA

**Request Body:**

```json
{
  "plan_id": "uuid",
  "billing_cycle": "annual",
  "note": "Ozel pilot sozlesmesi."
}
```

**Response (200 OK):** Updated subscription details.

---

### 13.3 Bakery Management

#### GET /api/v1/admin/bakeries

List all bakeries.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `search`, `status`, `district`, `sort`, `order`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Leziz Pastanesi",
      "status": "active",
      "districts": ["besiktas"],
      "contact_name": "Fatma Yildirim",
      "contact_phone": "+902121234567",
      "total_orders": 245,
      "acceptance_rate": 0.96,
      "created_at": "2026-03-01T10:00:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 8, "totalPages": 1 }
}
```

---

#### POST /api/v1/admin/bakeries

Create a new bakery and send an invitation.

**Auth:** PA

**Request Body:**

```json
{
  "name": "Taze Pastanesi",
  "contact_name": "Mehmet Bakici",
  "contact_email": "mehmet@taze.com.tr",
  "contact_phone": "+902129876543",
  "address": "Sariyer Cad. No:10, Istanbul",
  "districts": ["sariyer"],
  "iban": "TR33 0006 1005 1978 6457 8413 26",
  "bank_name": "Is Bankasi"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Taze Pastanesi",
    "status": "pending_setup",
    "invitation_sent": true,
    "message": "Firin olusturuldu ve davet gonderildi."
  }
}
```

---

#### GET /api/v1/admin/bakeries/:bakeryId

Get full bakery details.

**Auth:** PA

**Response (200 OK):** Complete bakery object.

---

#### PATCH /api/v1/admin/bakeries/:bakeryId

Update bakery details.

**Auth:** PA

**Request Body (partial update):**

```json
{
  "acceptance_window_hours": 6,
  "admin_note": "Ozel anlasma, dusuk komisyon."
}
```

**Response (200 OK):** Updated bakery object.

---

#### PATCH /api/v1/admin/bakeries/:bakeryId/districts

Update the districts a bakery serves.

**Auth:** PA

**Request Body:**

```json
{
  "districts": [
    { "district": "besiktas", "max_orders_per_day": 10 },
    { "district": "sariyer", "max_orders_per_day": 5 }
  ]
}
```

**Response (200 OK):** Updated bakery with districts.

---

#### POST /api/v1/admin/bakeries/:bakeryId/activate

Activate a bakery.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "active" }
}
```

---

#### POST /api/v1/admin/bakeries/:bakeryId/suspend

Suspend a bakery.

**Auth:** PA

**Request Body:**

```json
{
  "reason": "Kalite sorunlari."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "suspended" }
}
```

---

#### GET /api/v1/admin/bakeries/:bakeryId/performance

Get bakery performance metrics.

**Auth:** PA

**Query Parameters:** `date_from`, `date_to`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bakery_id": "uuid",
    "bakery_name": "Leziz Pastanesi",
    "period": { "from": "2026-03-01", "to": "2026-03-31" },
    "total_orders_assigned": 50,
    "total_orders_accepted": 48,
    "total_orders_rejected": 2,
    "total_orders_delivered": 46,
    "total_orders_failed": 0,
    "acceptance_rate": 0.96,
    "on_time_delivery_rate": 0.98,
    "average_acceptance_time_hours": 1.5,
    "revenue_gross_try": 15000.00,
    "commission_try": 1500.00,
    "revenue_net_try": 13500.00,
    "districts_served": ["besiktas"]
  }
}
```

---

### 13.4 Order Management

#### GET /api/v1/admin/orders

List all orders across all companies.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `search`, `status`, `company_id`, `bakery_id`, `district`, `order_type`, `delivery_date_from`, `delivery_date_to`, `sort`, `order`

**Response (200 OK):** Order list with company and bakery names included.

---

#### GET /api/v1/admin/orders/:orderId

Get full order details including status history and internal notes.

**Auth:** PA

**Response (200 OK):** Complete order object with all fields.

---

#### POST /api/v1/admin/orders/:orderId/assign

Manually assign or reassign an order to a bakery.

**Auth:** PA

**Request Body:**

```json
{
  "bakery_id": "uuid",
  "note": "Manuel atama - orijinal firin reddetti."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "assigned",
    "bakery_id": "uuid",
    "bakery_name": "Taze Pastanesi",
    "assigned_at": "2026-03-31T14:00:00+03:00",
    "message": "Siparis basariyla atandi."
  }
}
```

---

#### PATCH /api/v1/admin/orders/:orderId/status

Override an order's status.

**Auth:** PA

**Request Body:**

```json
{
  "status": "delivered",
  "note": "Teslimat firin tarafindan onaylanmadi, ancak musteri teslimati dogruladi."
}
```

**Response (200 OK):** Updated order object.

---

#### POST /api/v1/admin/orders/:orderId/refund

Initiate a refund for an order.

**Auth:** PA

**Request Body:**

```json
{
  "amount_try": 330.00,
  "reason": "Hatali teslimat.",
  "type": "full"
}
```

`type`: `full` or `partial`.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "refund_id": "uuid",
    "amount_try": 330.00,
    "status": "pending",
    "message": "Iade islemi baslatildi."
  }
}
```

---

### 13.5 Cake Catalogue Management

#### GET /api/v1/admin/cakes

List all cake types (including inactive).

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `search`, `is_active`, `sort`, `order`

**Response (200 OK):** Full cake list with prices.

---

#### POST /api/v1/admin/cakes

Create a new cake type.

**Auth:** PA

**Request Body:**

```json
{
  "name": "Vegan Cikolatali Pasta",
  "slug": "vegan-cikolatali-pasta",
  "description": "Vegan malzemelerle hazirlanan cikolatali pasta.",
  "image_url": "https://storage.supabase.co/cake-images/vegan-ciko.webp",
  "is_gluten_free": false,
  "is_vegan": true,
  "allergens": ["soy"],
  "is_seasonal": false,
  "prices": [
    { "size": "small", "price_try": 220.00, "weight_grams": 500 },
    { "size": "medium", "price_try": 320.00, "weight_grams": 1000 },
    { "size": "large", "price_try": 420.00, "weight_grams": 1500 }
  ]
}
```

**Response (201 Created):** Created cake object with prices.

---

#### PATCH /api/v1/admin/cakes/:cakeId

Update a cake type.

**Auth:** PA

**Request Body (partial update):**

```json
{
  "description": "Guncellenmis aciklama.",
  "is_active": false
}
```

**Response (200 OK):** Updated cake object.

---

#### PATCH /api/v1/admin/cakes/:cakeId/prices

Update prices for a cake type. Creates new price entries with `valid_from` and closes old ones.

**Auth:** PA

**Request Body:**

```json
{
  "prices": [
    { "size": "small", "price_try": 230.00 },
    { "size": "medium", "price_try": 330.00 },
    { "size": "large", "price_try": 430.00 }
  ],
  "valid_from": "2026-05-01"
}
```

**Response (200 OK):** Updated price list.

---

### 13.6 Price Change Requests

#### GET /api/v1/admin/price-requests

List all price change requests.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `status`, `bakery_id`, `sort`, `order`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bakery_name": "Leziz Pastanesi",
      "cake_type_name": "Cikolatali Pasta",
      "size": "medium",
      "current_price_try": 300.00,
      "requested_price_try": 350.00,
      "effective_date": "2026-05-01",
      "justification": "Hammadde maliyetleri artti.",
      "status": "pending",
      "created_at": "2026-03-25T10:00:00+03:00"
    }
  ]
}
```

---

#### POST /api/v1/admin/price-requests/:requestId/approve

Approve a price change request.

**Auth:** PA

**Request Body:**

```json
{
  "note": "Onaylandi, 1 Mayis'tan itibaren gecerli."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "effective_date": "2026-05-01",
    "message": "Fiyat talebi onaylandi."
  }
}
```

---

#### POST /api/v1/admin/price-requests/:requestId/reject

Reject a price change request.

**Auth:** PA

**Request Body:**

```json
{
  "note": "Artis orani cok yuksek. Maksimum %10 artis kabul edilebilir."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "message": "Fiyat talebi reddedildi."
  }
}
```

---

### 13.7 Subscription Plan Management

#### GET /api/v1/admin/subscription-plans

List all subscription plans (including inactive).

**Auth:** PA

**Response (200 OK):** Full list of plans.

---

#### POST /api/v1/admin/subscription-plans

Create a new subscription plan.

**Auth:** PA

**Request Body:**

```json
{
  "name": "Enterprise",
  "slug": "enterprise",
  "price_monthly_try": 2000.00,
  "price_annual_try": 20000.00,
  "employee_limit": null,
  "commission_rate": 0.05,
  "monthly_invoice_allowed": true,
  "features": {
    "hr_integrations": true,
    "custom_branding": true,
    "api_access": true
  },
  "display_order": 3
}
```

**Response (201 Created):** Created plan object.

---

#### PATCH /api/v1/admin/subscription-plans/:planId

Update a subscription plan.

**Auth:** PA

**Request Body (partial update):**

```json
{
  "price_monthly_try": 2200.00,
  "is_active": true
}
```

**Response (200 OK):** Updated plan object.

---

### 13.8 System Settings

#### GET /api/v1/admin/settings

Get all system-level settings.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "default_order_lead_time_days": 60,
    "default_acceptance_window_hours": 4,
    "min_order_lead_time_hours": 48,
    "cancellation_cutoff_hours": 24,
    "default_cancellation_fee_pct": 0.50,
    "order_release_days_before": 7,
    "auto_confirm_days_before": 30,
    "max_csv_import_rows": 2000,
    "max_csv_file_size_mb": 5,
    "approval_auto_cancel_days": 3,
    "approval_reminder_days": 7,
    "payment_retry_max_attempts": 3,
    "invoice_payment_due_days": 14,
    "invoice_overdue_suspend_days": 30
  }
}
```

---

#### PATCH /api/v1/admin/settings

Update system settings.

**Auth:** PA

**Request Body (partial update):**

```json
{
  "default_acceptance_window_hours": 6,
  "default_cancellation_fee_pct": 0.25
}
```

**Response (200 OK):** Updated settings.

---

### 13.9 District Management

#### GET /api/v1/admin/districts

List all delivery districts.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Besiktas",
      "slug": "besiktas",
      "city": "Istanbul",
      "is_active": true,
      "sort_order": 1,
      "bakery_count": 5
    },
    {
      "id": "uuid",
      "name": "Sariyer",
      "slug": "sariyer",
      "city": "Istanbul",
      "is_active": true,
      "sort_order": 2,
      "bakery_count": 3
    }
  ]
}
```

---

#### POST /api/v1/admin/districts

Create a new delivery district (post-MVP).

**Auth:** PA

**Request Body:**

```json
{
  "name": "Kadikoy",
  "slug": "kadikoy",
  "city": "Istanbul"
}
```

**Response (201 Created):** Created district.

---

#### PATCH /api/v1/admin/districts/:districtId

Update a district.

**Auth:** PA

**Request Body:**

```json
{
  "is_active": false
}
```

**Response (200 OK):** Updated district.

---

### 13.10 Public Holiday Management

#### GET /api/v1/admin/holidays

List public holidays.

**Auth:** PA

**Query Parameters:** `year` (default: current year)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ramazan Bayrami",
      "date": "2026-03-20",
      "is_recurring": false
    },
    {
      "id": "uuid",
      "name": "Cumhuriyet Bayrami",
      "date": "2026-10-29",
      "is_recurring": true
    }
  ]
}
```

---

#### POST /api/v1/admin/holidays

Create a public holiday.

**Auth:** PA

**Request Body:**

```json
{
  "name": "Kurban Bayrami",
  "date": "2026-06-07",
  "is_recurring": false
}
```

**Response (201 Created):** Created holiday.

---

#### PATCH /api/v1/admin/holidays/:holidayId

Update a holiday.

**Auth:** PA

---

#### DELETE /api/v1/admin/holidays/:holidayId

Delete a holiday.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Tatil gunu silindi." }
}
```

---

### 13.11 Notification Template Management

#### GET /api/v1/admin/notification-templates

List all notification templates.

**Auth:** PA

**Query Parameters:** `event`, `channel`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": "order_confirmed",
      "channel": "email",
      "name": "Siparis Onay E-postasi",
      "subject": "Siparisiniz onaylandi - {{recipient_name}}",
      "body": "Merhaba {{hr_name}},\n\n{{recipient_name}} icin {{delivery_date}} tarihli siparisiniz onaylandi.\n\nSiparis Detaylari:\n- Pasta: {{cake_type}}\n- Boyut: {{cake_size}}",
      "is_active": true,
      "available_variables": ["hr_name", "recipient_name", "delivery_date", "cake_type", "cake_size", "order_id", "company_name"]
    }
  ]
}
```

---

#### PATCH /api/v1/admin/notification-templates/:templateId

Update a notification template.

**Auth:** PA

**Request Body:**

```json
{
  "subject": "Siparisiniz onaylandi!",
  "body": "Merhaba {{hr_name}},\n\nGuncellemis sablon...",
  "is_active": true
}
```

**Response (200 OK):** Updated template.

---

### 13.12 Reports

#### GET /api/v1/admin/reports/orders

Get order analytics report.

**Auth:** PA

**Query Parameters:** `date_from`, `date_to`, `company_id`, `bakery_id`, `district`, `status`, `group_by` (`day`, `week`, `month`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_orders": 312,
      "total_delivered": 280,
      "total_cancelled": 12,
      "total_failed": 2,
      "fulfilment_rate": 0.955,
      "average_fulfilment_time_hours": 4.2
    },
    "by_period": [
      { "period": "2026-03-01", "orders": 45, "delivered": 42, "cancelled": 2, "failed": 0 },
      { "period": "2026-03-08", "orders": 52, "delivered": 50, "cancelled": 1, "failed": 0 }
    ],
    "by_district": [
      { "district": "besiktas", "orders": 200, "delivered": 185 },
      { "district": "sariyer", "orders": 112, "delivered": 95 }
    ]
  }
}
```

---

#### GET /api/v1/admin/reports/revenue

Get revenue report.

**Auth:** PA

**Query Parameters:** `date_from`, `date_to`, `company_id`, `group_by` (`month`, `quarter`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue_try": 45000.00,
      "subscription_revenue_try": 12500.00,
      "commission_revenue_try": 32500.00
    },
    "by_period": [
      {
        "period": "2026-03",
        "subscription_revenue_try": 12500.00,
        "commission_revenue_try": 32500.00,
        "total_try": 45000.00
      }
    ],
    "by_company": [
      {
        "company_id": "uuid",
        "company_name": "Acme Teknoloji A.S.",
        "subscription_try": 500.00,
        "commission_try": 2750.00,
        "total_try": 3250.00,
        "order_count": 25
      }
    ]
  }
}
```

---

#### GET /api/v1/admin/reports/bakery-payouts

Get bakery payout report.

**Auth:** PA

**Query Parameters:** `date_from`, `date_to`, `bakery_id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "bakery_id": "uuid",
      "bakery_name": "Leziz Pastanesi",
      "period": "2026-03",
      "total_orders": 45,
      "gross_order_value_try": 13500.00,
      "platform_commission_try": 1350.00,
      "net_payout_try": 12150.00,
      "payout_status": "pending"
    }
  ]
}
```

---

#### GET /api/v1/admin/reports/birthday-coverage

Get birthday coverage analytics.

**Auth:** PA

**Query Parameters:** `date_from`, `date_to`, `company_id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_birthdays_in_period": 320,
    "orders_generated": 295,
    "orders_delivered": 280,
    "coverage_rate": 0.922,
    "missed_birthdays": 25,
    "missed_reasons": {
      "no_active_rule": 10,
      "employee_skip_cake": 8,
      "employee_inactive": 5,
      "no_bakery_available": 2
    }
  }
}
```

---

#### POST /api/v1/admin/reports/export

Export a report as CSV or PDF.

**Auth:** PA

**Request Body:**

```json
{
  "report_type": "orders",
  "format": "csv",
  "filters": {
    "date_from": "2026-03-01",
    "date_to": "2026-03-31",
    "status": "delivered"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "download_url": "https://storage.supabase.co/reports/export-uuid.csv",
    "expires_at": "2026-04-01T14:00:00+03:00"
  }
}
```

---

### 13.13 Audit Log

#### GET /api/v1/admin/audit-logs

Get audit log entries.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `actor_id`, `entity_type` (`company`, `bakery`, `order`, `cake`, `plan`, `setting`), `action` (`create`, `update`, `delete`), `date_from`, `date_to`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "actor_id": "uuid",
      "actor_name": "Admin User",
      "entity_type": "company",
      "entity_id": "uuid",
      "action": "update",
      "changes": {
        "status": { "from": "active", "to": "suspended" }
      },
      "note": "Odeme gecikmeleri.",
      "ip_address": "192.168.1.1",
      "created_at": "2026-03-31T14:00:00+03:00"
    }
  ],
  "meta": { "page": 1, "pageSize": 25, "totalCount": 500, "totalPages": 20 }
}
```

---

### 13.14 Tax Change Requests

#### GET /api/v1/admin/tax-change-requests

List VKN change requests submitted by companies.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `status`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "company_name": "Acme Teknoloji A.S.",
      "current_vkn": "1234567890",
      "requested_vkn": "0987654321",
      "reason": "Sirket birlesmesi.",
      "status": "pending",
      "created_at": "2026-03-30T10:00:00+03:00"
    }
  ]
}
```

---

#### POST /api/v1/admin/tax-change-requests/:requestId/approve

Approve a VKN change request.

**Auth:** PA

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Vergi numarasi degisikligi onaylandi." }
}
```

---

#### POST /api/v1/admin/tax-change-requests/:requestId/reject

Reject a VKN change request.

**Auth:** PA

**Request Body:**

```json
{
  "note": "Gecersiz vergi numarasi."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { "message": "Vergi numarasi degisikligi reddedildi." }
}
```

---

### 13.15 Payout Management

#### GET /api/v1/admin/payouts

List all bakery payouts.

**Auth:** PA

**Query Parameters:** `page`, `pageSize`, `bakery_id`, `status` (`pending`, `processed`), `period_from`, `period_to`

**Response (200 OK):** Payout list.

---

#### POST /api/v1/admin/payouts/:payoutId/process

Mark a payout as processed (after bank transfer).

**Auth:** PA

**Request Body:**

```json
{
  "note": "EFT yapildi - dekont no: 123456",
  "receipt_url": "https://storage.supabase.co/payout-receipts/receipt-uuid.pdf"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "processed",
    "processed_at": "2026-04-05T10:00:00+03:00",
    "message": "Odeme islendi."
  }
}
```

---

## 14. Webhook Endpoints

Webhook endpoints are unauthenticated but verify signatures from the sending service.

### POST /api/v1/webhooks/iyzico

Receive payment events from iyzico.

**Auth:** Signature verification via `IYZICO_WEBHOOK_SECRET`

**Headers:**

```
X-IyzPayment-Signature: <hmac-sha256-signature>
```

**Request Body (example -- payment success):**

```json
{
  "event_type": "payment_success",
  "payment_id": "iyz-12345",
  "conversation_id": "cakeday-order-uuid",
  "status": "SUCCESS",
  "paid_price": 330.00,
  "currency": "TRY",
  "card_last_four": "4242",
  "card_brand": "VISA",
  "timestamp": "2026-03-31T14:00:00+03:00"
}
```

**Processing:**
1. Verify signature
2. Check idempotency (deduplicate by `payment_id`)
3. Update `payments` table status
4. If `payment_success`: update order payment status, queue confirmation notification
5. If `payment_failed`: mark payment as failed, queue failure notification, schedule retry
6. If `refund_completed`: update payment status, log refund

**Response (200 OK):**

```json
{ "received": true }
```

**Note:** Always returns 200 to prevent iyzico retries for already-processed events.

---

### POST /api/v1/webhooks/bamboohr

Receive push notifications from BambooHR (if supported).

**Auth:** Signature verification via shared secret

**Request Body:**

```json
{
  "event": "employee.updated",
  "employee_id": "bhr-123",
  "timestamp": "2026-03-31T14:00:00Z"
}
```

**Processing:**
1. Verify signature
2. Identify the company by matching the BambooHR subdomain
3. Queue a targeted sync for the affected employee

**Response (200 OK):**

```json
{ "received": true }
```

---

### POST /api/v1/webhooks/kolayik

Receive push notifications from KolayIK (if supported).

**Auth:** Signature verification via shared secret

Same pattern as BambooHR webhook.

---

## 15. File Upload Endpoints

### POST /api/v1/uploads/signed-url

Request a signed upload URL for Supabase Storage.

**Auth:** Any authenticated user

**Request Body:**

```json
{
  "bucket": "company-logos",
  "filename": "logo.png",
  "content_type": "image/png"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "signed_url": "https://xxxxx.supabase.co/storage/v1/upload/sign/...",
    "file_path": "company-logos/uuid/logo.png",
    "expires_at": "2026-03-31T14:05:00+03:00"
  }
}
```

**Allowed buckets and constraints:**

| Bucket | Allowed By | Max Size | Allowed Types |
|---|---|---|---|
| `company-logos` | CO | 2 MB | `image/png`, `image/jpeg` |
| `bakery-photos` | BA, PA | 5 MB | `image/png`, `image/jpeg` |
| `cake-images` | PA | 5 MB | `image/png`, `image/jpeg`, `image/webp` |
| `delivery-photos` | BA | 5 MB | `image/png`, `image/jpeg` |
| `csv-imports` | CO, HR | 5 MB | `text/csv` |

**Status Codes:** 200 OK, 400 Invalid Bucket/Content Type, 403 Not Allowed For This Bucket
