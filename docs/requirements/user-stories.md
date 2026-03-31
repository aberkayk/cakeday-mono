# User Stories — B2B Birthday Cake Delivery Platform (Turkey)

**Product:** Automated employee birthday cake delivery for companies
**MVP Scope:** Istanbul, Beşiktaş and Sarıyer districts; birthday cakes only
**Last Updated:** 2026-03-31

---

## Table of Contents

1. [Customer Portal](#1-customer-portal)
   - [1.1 Company Registration & Onboarding](#11-company-registration--onboarding)
   - [1.2 Employee Management](#12-employee-management)
   - [1.3 Ordering Rules & Automation](#13-ordering-rules--automation)
   - [1.4 One-Time Celebration Orders](#14-one-time-celebration-orders)
   - [1.5 Cake Catalogue & Customisation](#15-cake-catalogue--customisation)
   - [1.6 Payment & Billing](#16-payment--billing)
   - [1.7 Notifications & Communication](#17-notifications--communication)
   - [1.8 Account & Settings](#18-account--settings)
2. [Bakery Portal](#2-bakery-portal)
   - [2.1 Bakery Registration & Profile](#21-bakery-registration--profile)
   - [2.2 Order Management](#22-order-management)
   - [2.3 Pricing & Price Change Requests](#23-pricing--price-change-requests)
   - [2.4 Order History & Schedule](#24-order-history--schedule)
   - [2.5 Notifications](#25-notifications)
3. [Admin Dashboard](#3-admin-dashboard)
   - [3.1 Customer Management](#31-customer-management)
   - [3.2 Bakery & Partner Management](#32-bakery--partner-management)
   - [3.3 Delivery Management](#33-delivery-management)
   - [3.4 Pricing & Catalogue Management](#34-pricing--catalogue-management)
   - [3.5 Financial & Subscription Management](#35-financial--subscription-management)
   - [3.6 System Settings & Configuration](#36-system-settings--configuration)
   - [3.7 Reporting & Analytics](#37-reporting--analytics)
4. [Cross-Cutting Concerns](#4-cross-cutting-concerns)
   - [4.1 Authentication & Security](#41-authentication--security)
   - [4.2 Localisation & Accessibility](#42-localisation--accessibility)

---

## Story Format

Each story follows the pattern:

> **As a** [role], **I want to** [goal] **so that** [benefit].

Acceptance criteria use the **Given / When / Then** (GWT) format where appropriate, supplemented by bullet-point constraints.

---

## 1. Customer Portal

### 1.1 Company Registration & Onboarding

---

#### CP-001 — Company self-registration

**As an** HR manager or company administrator, **I want to** register my company on the platform **so that** I can start automating birthday cake deliveries for my employees.

**Acceptance Criteria:**

- **Given** I visit the platform homepage, **when** I click "Register Your Company", **then** I am presented with a multi-step registration form.
- The form collects: company legal name, tax number (Vergi No), sector, company size range, primary contact name, job title, business email, phone number (Turkish mobile format), company billing address, and district (limited to Beşiktaş or Sarıyer at MVP).
- **Given** I submit a tax number that already exists in the system, **when** I attempt to proceed, **then** I receive an error: "Bu vergi numarası ile kayıtlı bir şirket zaten mevcut."
- **Given** I enter an invalid Turkish tax number format (not 10 digits), **when** I attempt to proceed, **then** inline validation shows an error before submission.
- **Given** I submit a valid form, **when** registration succeeds, **then** I receive a verification email to the provided business email address within 2 minutes.
- **Given** I click the verification link, **when** the link is valid and not expired (24-hour TTL), **then** my account is activated and I am directed to the onboarding wizard.
- **Given** my verification link has expired, **when** I click it, **then** I see a message offering to resend the verification email.
- The registration flow is completable on mobile-width screens (responsive).
- No credit card is required at registration; payment setup happens during onboarding or before the first order.

---

#### CP-002 — Onboarding wizard

**As a** newly registered HR manager, **I want to** be guided through an onboarding wizard **so that** I understand all the configuration steps required before my first order is placed automatically.

**Acceptance Criteria:**

- **Given** I complete email verification, **when** I log in for the first time, **then** the onboarding wizard is launched automatically.
- The wizard has the following named steps: (1) Company profile completion, (2) Choose subscription plan, (3) Add employees, (4) Set ordering rules, (5) Payment setup, (6) Review & go live.
- **Given** I skip an optional step, **when** I later return to the dashboard, **then** an onboarding progress bar shows the incomplete steps with "Complete" CTAs.
- **Given** I finish all steps, **when** I click "Go Live", **then** the system enables automated order creation and I see a confirmation screen summarising my configuration.
- I can exit the wizard at any step and resume later; progress is saved automatically.
- **Given** no employees have been added and I try to advance to step 4, **then** the system warns me that ordering rules require at least one employee.

---

#### CP-003 — Subscription plan selection

**As an** HR manager, **I want to** choose a subscription plan **so that** I understand what I am paying and what features I get.

**Acceptance Criteria:**

- Available plans are fetched dynamically from the admin-configured catalogue (not hard-coded in the frontend).
- Each plan card displays: plan name, monthly price (TRY, VAT-excluded with note), included employee count, per-order commission rate, and a feature comparison list.
- **Given** I select a plan and click "Continue", **then** the selected plan is saved against my company profile.
- **Given** my employee count later exceeds the plan limit, **when** the system detects this on the next billing cycle, **then** I receive an email notification prompting an upgrade.
- I can change my plan from Account Settings after onboarding; changes take effect at the start of the next billing period.

---

### 1.2 Employee Management

---

#### CP-010 — Manual employee entry

**As an** HR manager, **I want to** manually add an employee **so that** I can quickly onboard individuals who are not yet in my HR system.

**Acceptance Criteria:**

- Required fields: full name, date of birth, work start date, department.
- Optional fields: personal email (for direct birthday wish notifications), work email, delivery address (defaults to company address if blank).
- **Given** I enter a date of birth in the future, **when** I attempt to save, **then** I see a validation error: "Doğum tarihi bugünden önce olmalıdır."
- **Given** I enter a duplicate full name within the same company, **when** I save, **then** the system prompts me to confirm or merge, but does not block creation.
- **Given** I save a valid employee, **then** the employee appears immediately in the employee list with status "Active".
- Employee names support Turkish characters (ş, ç, ğ, ı, ö, ü, İ, Ğ, Ş).

---

#### CP-011 — CSV import

**As an** HR manager, **I want to** upload a CSV file of employees **so that** I can bulk-import my workforce quickly without re-entering data.

**Acceptance Criteria:**

- A downloadable CSV template is provided on the import screen.
- Required CSV columns: `ad_soyad`, `dogum_tarihi` (DD/MM/YYYY), `ise_baslama_tarihi` (DD/MM/YYYY), `departman`.
- Optional CSV columns: `kisisel_email`, `is_email`, `teslimat_adresi`.
- **Given** I upload a CSV with correct format, **when** processing completes, **then** I see a preview table showing all rows with a pass/fail status per row before I confirm import.
- **Given** a row has an invalid date format, **when** I preview, **then** that row is highlighted in red with a column-level error description; valid rows remain importable.
- **Given** I confirm import, **when** all rows are valid, **then** employees are created and I see a success summary: "X çalışan başarıyla eklendi."
- **Given** I confirm import with mixed valid/invalid rows, **when** I choose "Valid rows only", **then** only valid rows are imported and a report of skipped rows is available to download.
- Maximum file size: 5 MB. Maximum rows per import: 2,000.
- Duplicate detection: if an imported row matches an existing employee (same name + DOB), the system warns and asks whether to skip or update.

---

#### CP-012 — BambooHR integration

**As an** HR manager using BambooHR, **I want to** connect my BambooHR account **so that** employee data syncs automatically and I don't need to maintain it manually.

**Acceptance Criteria:**

- The settings screen has a "Integrations" section with a BambooHR connection card.
- **Given** I click "Connect BambooHR", **then** I am prompted for my BambooHR subdomain and API key.
- **Given** I provide valid credentials, **when** I click "Test Connection", **then** a success message confirms the connection and shows the number of employees found.
- **Given** I save the integration, **when** the nightly sync job runs (02:00 UTC), **then** new employees are added, updated employees are synced, and employees removed from BambooHR are marked "Inactive" (not deleted).
- **Given** the sync encounters an API error, **then** the HR manager receives an email notification: "BambooHR senkronizasyonu başarısız oldu. Lütfen entegrasyon ayarlarınızı kontrol edin."
- I can trigger a manual sync at any time from the integrations screen; manual syncs are rate-limited to 1 per hour.
- Sync logs (timestamp, record count, errors) are visible in the integrations screen for the last 30 days.

---

#### CP-013 — KolayIK integration

**As an** HR manager using KolayIK, **I want to** connect my KolayIK account **so that** employee data syncs automatically.

**Acceptance Criteria:**

- Same UX pattern as CP-012 (BambooHR integration).
- **Given** I enter valid KolayIK API credentials, **when** I test the connection, **then** I see a success message.
- Sync behaviour is identical to CP-012: nightly sync, inactive marking, manual trigger, sync logs.
- **Given** both BambooHR and KolayIK integrations are active simultaneously, **then** the system uses the most recently synced source per employee record (last-write-wins with a conflict flag shown in the UI for manual review).

---

#### CP-014 — Employee list and search

**As an** HR manager, **I want to** view, filter, and search my employee list **so that** I can quickly find and update individual records.

**Acceptance Criteria:**

- The employee list shows: name, department, date of birth, next birthday date, start date, integration source, status (Active/Inactive).
- Search is available by name (partial match, case-insensitive, Turkish character normalised).
- Filters: department (multi-select), status, upcoming birthdays (next 7 / 30 / 90 days), integration source.
- Sorting: by name (A–Z, Z–A), by next birthday (ascending, descending).
- Pagination: 25 / 50 / 100 rows per page.
- **Given** a filter combination returns no results, **then** an empty state message is shown: "Filtrelerinize uygun çalışan bulunamadı."
- I can click any employee row to open a detail/edit drawer without leaving the list.

---

#### CP-015 — Employee deactivation and deletion

**As an** HR manager, **I want to** deactivate or delete an employee record **so that** departed employees do not receive birthday cakes.

**Acceptance Criteria:**

- **Deactivate:** marks the employee inactive; no future automatic orders will be generated; existing confirmed orders are not cancelled automatically — a warning is shown listing any upcoming confirmed orders.
- **Delete:** permanently removes the employee after a confirmation dialog; requires typing the employee's name; cannot delete if active confirmed orders exist (must cancel orders first).
- **Given** I deactivate an employee who has an order confirmed for the next 7 days, **when** I deactivate, **then** I see a modal: "Bu çalışanın [tarih] tarihinde onaylanmış bir siparişi var. Devam etmek istiyor musunuz?" with options "Siparişi iptal et ve devam et" / "Sadece çalışanı deaktive et".
- Deleted employees are retained in audit logs and historical order records with a [Silindi] label.

---

### 1.3 Ordering Rules & Automation

---

#### CP-020 — Configure "All Birthdays" rule

**As an** HR manager, **I want to** configure a rule that automatically orders a cake for every employee's birthday **so that** I don't have to manually place orders.

**Acceptance Criteria:**

- The rule can be enabled/disabled with a single toggle.
- **Given** the rule is enabled, **when** a new employee is added, **then** the rule applies to them automatically without any additional action.
- Cake type and size can be set as the default for all employees; individual employee overrides are possible (see CP-021).
- **Given** the rule is enabled and today is 60 days before an employee's birthday, **when** the daily scheduling job runs, **then** a draft order is generated and I see it in the "Upcoming Orders" list.
- Orders are created 60 days in advance (configurable per company by admin; default 60 days).
- **Given** the rule is disabled mid-year, **then** only future draft orders that have not yet been confirmed are cancelled; already-confirmed orders remain active.

---

#### CP-021 — Configure "Round Birthdays" rule

**As an** HR manager, **I want to** configure a rule that only sends cakes on milestone birthdays (e.g., 30, 40, 50) **so that** I can reserve special celebrations for meaningful milestones.

**Acceptance Criteria:**

- The rule allows me to specify which milestone ages to celebrate: configurable as a comma-separated list (default: 25, 30, 35, 40, 45, 50, 55, 60).
- The rule is mutually exclusive from the "All Birthdays" rule — the UI prevents enabling both simultaneously.
- **Given** the rule is enabled, **when** the scheduling job runs, **then** only employees whose upcoming birthday matches a configured milestone age generate a draft order.
- **Given** I change the milestone list after the rule is already active, **then** the new list applies only to future scheduling runs; existing draft orders generated under the old list remain unchanged.
- If an employee's age cannot be determined (missing year in DOB), the system skips them and logs a warning visible on the HR dashboard.

---

#### CP-022 — Configure "Work Anniversary" rule

**As an** HR manager, **I want to** configure a rule that sends a cake on work anniversaries **so that** I can celebrate employee tenure milestones.

**Acceptance Criteria:**

- Anniversary rule configuration: celebrate all anniversaries, or only milestone years (1, 3, 5, 10, etc.).
- Required field: employee work start date (CP-010).
- **Given** an employee has no work start date, **then** the anniversary rule is skipped for that employee and a warning is shown in the employee record.
- **Given** the anniversary rule is enabled, **when** an employee's 5-year work anniversary falls on a non-working day (Saturday, Sunday, Turkish public holiday), **then** the order delivery date is automatically moved to the next working day; I am notified of the adjustment.
- Turkish public holiday calendar is maintained in the system (admin can update it annually).

---

#### CP-023 — Employee-level order rule override

**As an** HR manager, **I want to** override the default cake settings for a specific employee **so that** I can accommodate dietary restrictions, preferences, or special instructions.

**Acceptance Criteria:**

- From the employee detail drawer, I can set: preferred cake type, preferred cake size, custom message preference (auto-generate from template or manually specify), and a "Do not send cake" flag.
- **Given** "Do not send cake" is set for an employee, **when** the scheduling job runs, **then** no order is generated for that employee regardless of active rules.
- **Given** an employee-level cake type override is set, **when** a draft order is created, **then** the draft uses the override type, not the company default.

---

#### CP-024 — Order approval workflow

**As an** HR manager, **I want to** optionally require manual approval of draft orders before they are sent to bakeries **so that** I have control over which orders proceed.

**Acceptance Criteria:**

- In company settings, I can enable "Order approval required" (default: off — orders auto-confirm at T-30 days).
- **Given** approval is required, **when** a draft order is created, **then** I receive an email/WhatsApp notification to review it; the order status is "Pending Approval".
- **Given** I approve an order, **then** its status moves to "Confirmed" and it becomes visible to the assigned bakery at the appropriate release date (T-7 days before delivery).
- **Given** I reject an order, **then** I am prompted for a rejection reason; the order is cancelled and removed from the upcoming list.
- **Given** an order is in "Pending Approval" state and I have not acted within 7 days before the delivery date, **then** the system sends a reminder notification.
- **Given** I have not acted within 3 days of the delivery date, **then** the order is automatically cancelled and I receive a notification.

---

### 1.4 One-Time Celebration Orders

---

#### CP-030 — Place a one-time order

**As an** HR manager, **I want to** place a one-time cake order for a specific employee or event **so that** I can celebrate occasions outside of automated rules.

**Acceptance Criteria:**

- A "New Order" button is always accessible from the Customer Portal dashboard and the Orders section.
- Required fields: recipient (select from employee list or type a guest name), delivery date, delivery address (pre-filled from employee record, editable), cake type, cake size, custom text (optional, max 60 characters).
- **Given** the selected delivery date is today or tomorrow, **when** I attempt to place the order, **then** the system checks same-day / next-day availability with bakeries before confirming; if unavailable, I see: "Seçtiğiniz tarih için uygun fırın bulunmuyor. Lütfen farklı bir tarih deneyin."
- **Given** the delivery address is outside the MVP delivery zones (Beşiktaş / Sarıyer), **when** I enter it, **then** I see an inline error: "Şu anda yalnızca Beşiktaş ve Sarıyer ilçelerine teslimat yapılmaktadır."
- **Given** I submit a valid one-time order, **then** I receive an order confirmation with an order ID immediately.
- One-time orders are billed per-order (per the active payment method).

---

#### CP-031 — Edit or cancel a pending order

**As an** HR manager, **I want to** edit or cancel an order that has not yet been sent to the bakery **so that** I can correct mistakes or adjust plans.

**Acceptance Criteria:**

- Orders with status "Draft" or "Pending Approval" can be fully edited (all fields).
- Orders with status "Confirmed" can only edit the custom cake text and delivery address if the delivery date is more than 3 days away.
- Orders with status "Sent to Bakery" can only be cancelled, not edited; a cancellation request is sent to the bakery.
- **Given** I cancel an order with status "Confirmed" more than 3 days before delivery, **then** the order is cancelled and any payment hold is released.
- **Given** I cancel an order within 3 days of delivery, **then** the system warns: "Bu siparişi iptal ederseniz [X TL] iade alabilirsiniz. İptal etmek istiyor musunuz?" — cancellation policy is defined by admin.
- **Given** the bakery has already accepted an order, **when** I request cancellation, **then** the bakery is notified and must confirm the cancellation; I see status "Cancellation Requested" until the bakery confirms.

---

### 1.5 Cake Catalogue & Customisation

---

#### CP-040 — Browse cake catalogue

**As an** HR manager, **I want to** browse available cake types and sizes with photos and prices **so that** I can make informed selections for orders.

**Acceptance Criteria:**

- The catalogue displays: cake name, description, available sizes (with weight in grams), price per size (TRY, VAT-included), allergen information, photo.
- All items in the catalogue are fetched from the admin-managed catalogue; no hard-coded items in the frontend.
- **Given** I am on a desktop browser, **when** I open the catalogue, **then** I see a grid layout of at least 3 columns.
- **Given** I filter by dietary type (e.g., gluten-free, vegan), **then** only matching items are shown.
- **Given** a cake item is temporarily unavailable (marked as such by admin), **then** it is shown with a "Şu an mevcut değil" badge and cannot be selected.
- Cake photos are lazy-loaded; the layout does not shift on image load (skeleton loaders used).

---

#### CP-041 — Customise cake text

**As an** HR manager, **I want to** add a personalised message to a cake **so that** the birthday person feels individually celebrated.

**Acceptance Criteria:**

- Custom text field maximum length: 60 characters (enforced with live counter).
- A set of pre-built message templates is available (e.g., "İyi ki doğdun, [İsim]!", "Nice yıllara, [İsim]!") that auto-populate the field; the HR manager can edit after selection.
- `[İsim]` placeholder is replaced at order generation time with the employee's first name.
- **Given** I leave the custom text blank and select a template, **when** the order is generated, **then** the template text with the employee's name substituted is used.
- **Given** I leave the custom text blank and no template is selected, **then** the default company text configured in account settings is used; if no company default exists, the cake is delivered without writing.

---

### 1.6 Payment & Billing

---

#### CP-050 — Add credit/debit card via iyzico

**As an** HR manager, **I want to** add a credit or debit card to my account **so that** per-order payments are charged automatically.

**Acceptance Criteria:**

- Card entry is handled entirely via the iyzico hosted payment form; no raw card data touches our servers.
- **Given** I enter a valid card and submit, **when** iyzico authorises it, **then** the card is saved as a payment method with the last 4 digits and card type displayed.
- **Given** iyzico returns a declined response, **then** I see the specific iyzico error message translated to Turkish.
- I can save multiple cards; one is set as the default.
- I can remove a non-default card at any time; I cannot remove the default card if there are upcoming confirmed orders.

---

#### CP-051 — Monthly invoice payment

**As a** Finance director, **I want to** pay via monthly invoice **so that** company expenses go through standard B2B procurement without needing a card.

**Acceptance Criteria:**

- Monthly invoice payment is only available to companies on a qualifying subscription plan (admin-configurable).
- **Given** I select "Monthly Invoice" as my payment method, **then** I am prompted for billing address and e-invoice details (e-fatura / e-arşiv preference, Turkish e-invoice recipient alias if applicable).
- At the end of each calendar month, the system generates an invoice PDF covering all orders placed that month plus the monthly subscription fee.
- The invoice is emailed to the billing email address and available for download in the Billing section of the Customer Portal.
- **Given** an invoice is not paid within 30 days of issue, **then** automated orders are paused and the HR manager receives a reminder notification.

---

#### CP-052 — View billing history

**As an** HR manager or Finance director, **I want to** view my billing history and download invoices **so that** I can reconcile expenses.

**Acceptance Criteria:**

- The Billing section lists all invoices / charge receipts with: date, description, amount (TRY, VAT-excluded and VAT amount shown), status (Paid / Unpaid / Void).
- Each row has a "PDF İndir" button; invoice PDF conforms to Turkish e-fatura or e-arşiv format.
- I can filter by date range and status.
- **Given** a charge fails (e.g., card decline), **then** the failed charge appears in billing history with status "Başarısız" and a "Tekrar Dene" button.

---

### 1.7 Notifications & Communication

---

#### CP-060 — Email notifications for order events

**As an** HR manager, **I want to** receive email notifications for key order events **so that** I stay informed without logging in.

**Acceptance Criteria:**

- The following events trigger an email to the HR manager:
  - Order created (draft generated)
  - Order pending approval (if approval workflow enabled)
  - Order confirmed
  - Order sent to bakery
  - Order accepted by bakery
  - Order rejected by bakery (with rejection reason)
  - Order out for delivery
  - Order delivered
  - Order cancellation confirmed
  - Payment failed
- All emails are in Turkish.
- Email footer includes "Bu e-postayı almak istemiyorsanız bildirim ayarlarınızı güncelleyebilirsiniz." with a direct link to notification settings.
- HR managers can selectively disable individual notification types from Account Settings.

---

#### CP-061 — WhatsApp notifications

**As an** HR manager, **I want to** receive WhatsApp messages for urgent order events **so that** I am notified even when I'm away from my inbox.

**Acceptance Criteria:**

- WhatsApp notifications are opt-in; the HR manager provides a Turkish mobile number (+90) during onboarding or in settings.
- WhatsApp messages are sent via an approved WhatsApp Business API provider.
- Events that trigger WhatsApp (in addition to email): order rejected by bakery, order out for delivery, payment failed.
- **Given** a WhatsApp message fails to deliver (e.g., number not on WhatsApp), **then** the system falls back to SMS; the HR manager is notified to update their number.
- WhatsApp notifications can be disabled independently from email notifications.

---

### 1.8 Account & Settings

---

#### CP-070 — Manage company profile

**As an** HR manager, **I want to** update my company profile information **so that** billing and delivery details remain accurate.

**Acceptance Criteria:**

- Editable fields: company display name, billing address, tax number (requires admin approval to change), contact phone, logo upload (PNG/JPG, max 2 MB, used on e-invoices).
- Changes to tax number are flagged for admin review and not applied until approved.
- **Given** I upload a logo that exceeds 2 MB, **then** I see: "Logo dosyası 2 MB'ı geçemez."

---

#### CP-071 — Manage team access (user roles)

**As an** HR manager (company owner), **I want to** invite colleagues and assign roles **so that** multiple team members can manage the platform.

**Acceptance Criteria:**

- Roles: **Owner** (full access), **HR Manager** (full access except billing and user management), **Finance** (billing and invoices only, read-only orders), **Viewer** (read-only everything).
- **Given** I invite a colleague via email, **when** they accept the invitation, **then** they can log in with their own credentials and have access according to their assigned role.
- Only one Owner role is allowed per company; transferring ownership prompts a confirmation step.
- **Given** I attempt to perform an action my role does not allow, **then** I see a 403 page with a message: "Bu işlem için yetkiniz bulunmuyor."

---

#### CP-072 — Configure default delivery settings

**As an** HR manager, **I want to** set a default delivery address and time window preference for my company **so that** I don't have to specify these for every order.

**Acceptance Criteria:**

- Default delivery address is pre-filled on all new orders but remains editable per order.
- Delivery time window preference: morning (09:00–12:00), afternoon (12:00–17:00), or no preference. This is a preference only; actual delivery time is determined by the bakery.
- **Given** I set a default, **when** I create a new order, **then** the default values are pre-populated and I can override them.

---

## 2. Bakery Portal

### 2.1 Bakery Registration & Profile

---

#### BP-001 — Admin-initiated bakery onboarding

**As a** platform admin, **I want to** create a bakery account and send an invitation **so that** a partner bakery can join and start receiving orders.

*(This story is from the Admin perspective; placed here for context. See also AD-020.)*

**Acceptance Criteria:**

- Admin creates the bakery record with: business name, contact name, phone, email, address, covered districts, IBAN (for payment), and assigns an initial price list.
- Admin sends an invitation email to the bakery contact.

---

#### BP-002 — Bakery profile setup

**As a** bakery owner, **I want to** complete my profile after receiving an invitation **so that** customers and the admin can identify my bakery and I can receive orders.

**Acceptance Criteria:**

- **Given** I receive an invitation email, **when** I click the link, **then** I land on the bakery setup screen (invitation links expire after 72 hours).
- Setup collects: bakery display name, profile photo / logo, a short description (max 200 chars), operating hours, covered delivery districts (from the pre-configured list).
- **Given** I complete setup and click "Tamamla", **then** my bakery status is set to "Active" in the admin dashboard and I can start receiving orders.
- **Given** my invitation link has expired, **then** I see a message and a "Yeni davet linki iste" button that notifies the admin.

---

### 2.2 Order Management

---

#### BP-010 — View incoming orders

**As a** bakery operator, **I want to** see a list of incoming orders assigned to my bakery **so that** I can plan my production schedule.

**Acceptance Criteria:**

- The orders list displays: order ID, delivery date, delivery time window preference, customer company name, cake type, cake size, custom text, delivery address.
- Default sort: delivery date ascending (next delivery first).
- Filters: status (New, Accepted, In Progress, Delivered, Rejected, Cancelled), delivery date range.
- **Given** a new order is assigned to my bakery, **when** I log in, **then** the order appears in the "Yeni Siparişler" section highlighted.
- New orders are released to the bakery 7 days before the delivery date (admin-configurable).
- The list is paginated (20 per page).

---

#### BP-011 — Accept an order

**As a** bakery operator, **I want to** accept an incoming order **so that** I commit to fulfilling it and the customer is informed.

**Acceptance Criteria:**

- **Given** an order is in "New" status, **when** I click "Kabul Et", **then** I am asked to confirm; upon confirmation, the order status changes to "Accepted".
- **Given** I accept an order, **then** the customer's HR manager receives a notification (email + WhatsApp if configured) that the order has been accepted.
- **Given** I accept an order, **then** I can no longer reject it (only cancellation is possible, which triggers the cancellation workflow).
- The bakery must accept or reject an order within 24 hours of it being released; after 24 hours without action, the admin is notified.

---

#### BP-012 — Reject an order

**As a** bakery operator, **I want to** reject an incoming order with a reason **so that** the platform can reassign it to another bakery.

**Acceptance Criteria:**

- **Given** an order is in "New" status, **when** I click "Reddet", **then** I must select a rejection reason from a predefined list (e.g., "Kapasite yetersizliği", "İlgili ürün mevcut değil", "Teslimat bölgesi dışı") or enter a custom reason.
- **Given** I confirm rejection, **then** the order status changes to "Rejected" on my portal and the admin receives an alert to reassign the order to another bakery.
- **Given** the admin cannot find a replacement bakery within 48 hours, **then** the customer receives a notification.
- I cannot reject an order I have already accepted (only cancellation workflow applies).

---

#### BP-013 — Mark order as out for delivery

**As a** bakery operator, **I want to** mark an order as "Out for Delivery" **so that** the customer knows the cake is on its way.

**Acceptance Criteria:**

- Only orders in "Accepted" or "In Progress" status can be marked out for delivery.
- **Given** I click "Yola Çıktı", **then** the order status changes to "Out for Delivery" and the customer receives a notification.
- The timestamp of this action is recorded and visible in the admin delivery management screen.

---

#### BP-014 — Confirm order delivery

**As a** bakery operator, **I want to** mark an order as delivered **so that** the platform knows the fulfilment is complete and payment can be processed.

**Acceptance Criteria:**

- **Given** an order is "Out for Delivery", **when** I click "Teslim Edildi", **then** I am optionally prompted to upload a delivery photo (JPEG/PNG, max 5 MB).
- **Given** I confirm delivery, **then** the order status changes to "Delivered", the delivery timestamp is recorded, and the customer receives a delivery confirmation notification.
- The delivery photo (if uploaded) is visible to the admin and to the customer HR manager on the order detail page.
- **Given** the expected delivery date has passed and the order is still not marked delivered, **then** the admin receives an alert.

---

### 2.3 Pricing & Price Change Requests

---

#### BP-020 — View current price list

**As a** bakery operator, **I want to** view the prices currently in effect for my bakery **so that** I know what I will be paid per order.

**Acceptance Criteria:**

- The price list screen shows all cake types and sizes with the price the bakery receives per unit.
- The displayed price is net of platform commission; the gross customer-facing price is shown separately for reference.
- Effective date of the current price list is displayed.

---

#### BP-021 — Submit a price change request

**As a** bakery operator, **I want to** request a price change for one or more items **so that** my pricing stays aligned with my production costs.

**Acceptance Criteria:**

- **Given** I navigate to the price list screen, **when** I click "Fiyat Değişikliği Talep Et", **then** I see an editable copy of the price list.
- I can adjust prices for any items; items with proposed changes are highlighted.
- I must provide a reason (free text, max 300 chars) before submitting.
- **Given** I submit the request, **then** a price change request record is created with status "Pending" and the admin is notified.
- I can see all my submitted requests and their statuses (Pending / Approved / Rejected) in the "Taleplerim" tab.
- **Given** my request is approved, **then** I receive a notification with the effective date of the new prices.
- **Given** my request is rejected, **then** I receive a notification with the admin's rejection reason.
- I cannot submit a new price change request while a previous one is still "Pending".

---

### 2.4 Order History & Schedule

---

#### BP-030 — View past orders

**As a** bakery operator, **I want to** view my past orders **so that** I can track my fulfilment history and reconcile payments.

**Acceptance Criteria:**

- Past orders list shows: order ID, delivery date, cake type, size, customer company, status, amount earned (TRY).
- Date range filter available (default: last 30 days).
- Export to CSV is available for any date range.
- Monthly earnings summary is shown at the top of the screen.

---

#### BP-031 — View upcoming order schedule

**As a** bakery operator, **I want to** see upcoming confirmed orders in a calendar view **so that** I can manage production planning.

**Acceptance Criteria:**

- Calendar view (monthly and weekly) shows confirmed orders on their delivery dates.
- Clicking a date shows all orders for that day with full details.
- The calendar highlights days with 5+ orders to flag high-volume days.

---

### 2.5 Notifications

---

#### BP-040 — Receive order notifications

**As a** bakery operator, **I want to** receive notifications when new orders are assigned to me **so that** I can respond quickly.

**Acceptance Criteria:**

- New order assignment triggers email + WhatsApp notification to the bakery's registered contact number.
- Order cancellation (by customer or admin) triggers a notification.
- **Given** 12 hours remain until the acceptance deadline and I have not responded to an order, **then** a reminder notification is sent.
- Bakery operators can configure their notification preferences (email only, WhatsApp only, or both) from bakery settings.

---

## 3. Admin Dashboard

### 3.1 Customer Management

---

#### AD-001 — View and search customer companies

**As a** platform admin, **I want to** view a list of all registered companies and search/filter them **so that** I can monitor platform adoption and manage accounts.

**Acceptance Criteria:**

- Company list shows: company name, registration date, subscription plan, employee count, active orders count, billing status, account status (Active / Suspended / Churned).
- Search by company name and tax number (partial match).
- Filters: subscription plan, account status, billing status, registration date range, district.
- Sorting by all columns.
- Export to CSV.

---

#### AD-002 — View company detail

**As a** platform admin, **I want to** view the full detail of a customer company **so that** I can investigate issues, verify configuration, and provide support.

**Acceptance Criteria:**

- Detail page shows: company profile, active subscription, employee list summary, active ordering rules, payment method (masked), billing history, all-time order count, current open orders.
- I can navigate to any individual order from the company detail page.
- I can impersonate the company (view the Customer Portal as that company) for support purposes; impersonation sessions are logged in the audit trail.

---

#### AD-003 — Suspend or reactivate a company account

**As a** platform admin, **I want to** suspend a company account **so that** I can enforce policy violations or respond to billing issues.

**Acceptance Criteria:**

- **Given** I suspend a company, **then** all automated order creation is paused; existing confirmed orders are not automatically cancelled (admin decides case by case).
- **Given** I suspend, **then** the company's users cannot log in and see a message: "Hesabınız askıya alınmıştır. Lütfen destek ekibimizle iletişime geçin."
- **Given** I reactivate, **then** the company's users can log in immediately; automated ordering resumes at the next scheduled job.
- Suspension reason is mandatory (free text); it is stored in the audit log.

---

#### AD-004 — Approve tax number change request

**As a** platform admin, **I want to** review and approve or reject a company's tax number change request **so that** billing details remain accurate and fraud is prevented.

**Acceptance Criteria:**

- Tax number change requests appear in an "Action Required" widget on the admin dashboard.
- **Given** I approve, **then** the company's tax number is updated immediately and reflected on subsequent invoices.
- **Given** I reject, **then** the company HR manager receives a notification with my rejection reason.

---

### 3.2 Bakery & Partner Management

---

#### AD-020 — Onboard a new bakery

**As a** platform admin, **I want to** add a new partner bakery and send them an invitation **so that** they can start receiving orders.

**Acceptance Criteria:**

- Required fields: business name, legal name, tax number, contact name, contact email, contact phone, full address, covered districts (multi-select from MVP list), IBAN (for payment transfers), bank name.
- **Given** I submit the form, **then** a bakery record is created with status "Invited" and an invitation email is sent to the contact email.
- **Given** the bakery completes their profile (BP-002), **then** the status changes to "Active" automatically.
- Tax number uniqueness is enforced across bakery records.

---

#### AD-021 — View bakery performance

**As a** platform admin, **I want to** view a bakery's performance metrics **so that** I can monitor service quality and make partner management decisions.

**Acceptance Criteria:**

- Metrics shown: total orders received, acceptance rate (%), rejection rate (%), average delivery confirmation time (hours), late delivery count, customer complaint count.
- Date range filter available.
- A bakery with acceptance rate below 80% over the past 30 days is flagged with a warning badge.

---

#### AD-022 — Suspend or offboard a bakery

**As a** platform admin, **I want to** suspend or permanently remove a bakery **so that** underperforming or non-compliant partners no longer receive orders.

**Acceptance Criteria:**

- **Given** I suspend a bakery, **then** no new orders are assigned to them; existing accepted orders remain active (admin may choose to reassign manually).
- **Given** I suspend a bakery that has orders in "New" (unaccepted) status, **then** those orders are immediately reassigned to available bakeries in the same district, or flagged for manual admin reassignment if no alternatives exist.
- **Given** I permanently remove a bakery, **then** I must confirm and the bakery's historical order data is retained in the system with an [Arşivlendi] label.

---

#### AD-023 — Manage bakery coverage zones

**As a** platform admin, **I want to** update which districts a bakery can deliver to **so that** order routing is accurate.

**Acceptance Criteria:**

- I can add or remove districts from a bakery's coverage list.
- **Given** I remove a district from a bakery's coverage, **then** future orders from that district are not routed to that bakery.
- **Given** there are pending unaccepted orders from that district assigned to the bakery, **then** the system warns me and I choose to reassign them or leave them.

---

### 3.3 Delivery Management

---

#### AD-030 — View all active deliveries

**As a** platform admin, **I want to** see a unified view of all active orders across all companies and bakeries **so that** I can monitor delivery fulfilment in real time.

**Acceptance Criteria:**

- Dashboard shows: today's deliveries, upcoming deliveries (next 7 days), overdue orders (past expected delivery date, not yet marked delivered).
- Filterable by company, bakery, district, date, and status.
- Each order row shows: order ID, customer company, employee name (if applicable), delivery address, assigned bakery, status, expected delivery date/time.
- Clicking an order opens the full order detail.

---

#### AD-031 — Manually reassign an order to a different bakery

**As a** platform admin, **I want to** reassign an order from one bakery to another **so that** I can resolve rejection, suspension, or capacity issues.

**Acceptance Criteria:**

- **Given** I open an order and click "Fırını Değiştir", **then** I see a list of active bakeries covering the delivery district, sorted by current load (fewest orders first).
- **Given** I select a new bakery and confirm, **then** the previous bakery is notified of the reassignment and the new bakery receives a new order notification.
- Reassignment is logged in the order's audit trail.
- I cannot reassign an order that has already been marked "Delivered".

---

#### AD-032 — Handle delivery failure

**As a** platform admin, **I want to** record and manage failed deliveries **so that** the customer is informed and appropriate remediation is taken.

**Acceptance Criteria:**

- **Given** an order's expected delivery date has passed and it is not marked delivered after 2 hours, **then** an alert appears on the admin dashboard.
- I can mark an order as "Delivery Failed" with a reason; this notifies the customer.
- I can initiate a re-delivery: a new order is created linked to the original, with priority routing to an available bakery.
- Re-delivery cost policy (who bears the cost) is configured in system settings.

---

### 3.4 Pricing & Catalogue Management

---

#### AD-040 — Manage cake catalogue

**As a** platform admin, **I want to** create, edit, and deactivate cake catalogue items **so that** the product offering is up to date.

**Acceptance Criteria:**

- Each catalogue item has: name (TR), description (TR), category, available sizes (each with weight in grams), customer-facing price per size (TRY, VAT-included), allergen tags (multi-select), photo (upload PNG/JPG max 5 MB), status (Active / Inactive).
- **Given** I deactivate a catalogue item, **then** it is immediately hidden from the Customer Portal catalogue and cannot be selected for new orders; existing orders with that item are unaffected.
- **Given** I change a price for an existing item, **then** the new price applies to orders created from this point forward; orders already confirmed at the old price retain the old price.
- I can bulk-import catalogue items via CSV (template provided).
- Catalogue items support a "seasonal" flag with an auto-deactivation date.

---

#### AD-041 — Review and respond to bakery price change requests

**As a** platform admin, **I want to** review price change requests from bakeries and approve or reject them **so that** pricing remains fair and sustainable.

**Acceptance Criteria:**

- Price change requests appear in a dedicated "Fiyat Talepleri" section, sorted by submission date.
- Each request shows: bakery name, current prices, proposed prices, delta percentage, reason provided.
- **Given** I approve a request, **then** I set an effective date (default: first of next month); the bakery is notified with the effective date.
- **Given** I reject a request, **then** I must enter a rejection reason; the bakery is notified.
- I can partially approve a request (approve some items, reject others).

---

#### AD-042 — Manage public holiday calendar

**As a** platform admin, **I want to** maintain the Turkish public holiday calendar **so that** the system correctly reschedules deliveries falling on non-working days.

**Acceptance Criteria:**

- I can view, add, edit, and delete public holiday entries (date + holiday name).
- A default calendar pre-populated with recurring Turkish national holidays is provided (New Year's Day, National Sovereignty Day, Labour Day, Atatürk Commemoration Day, Victory Day, Republic Day, and religious holidays by year).
- **Given** a public holiday is added for a date that already has confirmed orders, **then** the admin sees a list of affected orders and can choose to reschedule them (to next working day) or leave unchanged.
- Calendar changes take effect for future scheduling runs only; already-generated draft orders are not automatically rescheduled unless the admin explicitly triggers rescheduling.

---

### 3.5 Financial & Subscription Management

---

#### AD-050 — Manage subscription plans

**As a** platform admin, **I want to** create and manage subscription plans **so that** I can offer the right pricing tiers to different company sizes.

**Acceptance Criteria:**

- Each plan has: name, monthly price (TRY), included employee count, per-order commission rate (%), features list (used for Customer Portal plan selection display), availability status (Public / Private / Archived).
- **Given** I archive a plan, **then** existing subscribers are unaffected; the plan is no longer available for new sign-ups.
- **Given** I change the price of an active plan, **then** existing subscribers are notified by email 30 days before the new price takes effect; they are given the option to change plan or cancel.

---

#### AD-051 — View platform financial overview

**As a** platform admin, **I want to** view a financial summary dashboard **so that** I can monitor revenue, commissions, and bakery payouts.

**Acceptance Criteria:**

- Dashboard shows: MRR (Monthly Recurring Revenue), total orders this month, total order value (TRY), total platform commission earned, total bakery payout owed, outstanding invoice amounts.
- Date range selector: this month, last month, last 3 months, custom range.
- Breakdown by company and by bakery is available via drill-down.
- Export to CSV and PDF.

---

#### AD-052 — Process bakery payout

**As a** platform admin, **I want to** mark bakery payouts as processed **so that** financial records stay accurate.

**Acceptance Criteria:**

- A payout is generated monthly per bakery, listing all delivered orders within the period and the net amount due.
- **Given** I click "Ödemeyi Onayla" for a bakery payout, **then** the payout status changes to "Processed" and the bakery receives an email with the payout breakdown.
- **Given** I upload a bank transfer receipt (PDF/PNG), **then** it is attached to the payout record.
- Bakeries can view their own payout history in the Bakery Portal.

---

### 3.6 System Settings & Configuration

---

#### AD-060 — Configure order scheduling parameters

**As a** platform admin, **I want to** configure system-wide scheduling parameters **so that** the automation behaves appropriately for our operational model.

**Acceptance Criteria:**

- Configurable parameters: advance order creation window (days), order release to bakery window (days before delivery), auto-confirm timeout (days), post-due delivery failure alert delay (hours).
- Changes take effect for future scheduling runs; existing pending orders are not retroactively affected.
- Each parameter has a documented min/max constraint enforced in the UI (e.g., order creation window: 7–90 days).

---

#### AD-061 — Manage notification templates

**As a** platform admin, **I want to** edit email and WhatsApp notification templates **so that** communications are accurate and on-brand.

**Acceptance Criteria:**

- Templates are editable via a WYSIWYG editor for email and a plain-text editor for WhatsApp.
- Available template variables are listed next to each editor (e.g., `{{employee_name}}`, `{{delivery_date}}`, `{{order_id}}`).
- **Given** I save a template, **then** it takes effect for all subsequent notifications of that type.
- A "Preview" button renders the template with sample data before saving.
- Templates cannot be deleted, only deactivated (system falls back to a hard-coded default if deactivated).

---

#### AD-062 — Configure delivery zones

**As a** platform admin, **I want to** manage the list of supported delivery districts **so that** the platform can expand to new areas.

**Acceptance Criteria:**

- Supported districts are listed with their status (Active / Inactive).
- **Given** I add a new district and mark it Active, **then** customer registration and delivery address validation immediately accept addresses in that district.
- **Given** I deactivate a district, **then** new orders cannot be placed for that district; existing confirmed orders in that district are unaffected and a warning lists them.

---

### 3.7 Reporting & Analytics

---

#### AD-070 — Order analytics report

**As a** platform admin, **I want to** view order analytics **so that** I can track platform growth and identify operational issues.

**Acceptance Criteria:**

- Metrics: total orders placed, orders by status, orders by company, orders by bakery, orders by district, orders by cake type/size, average lead time (order placed to delivery), cancellation rate, rejection rate.
- All charts have an export to PNG option; all tables have an export to CSV option.
- Date range selector with presets: today, this week, this month, last 30/60/90 days, custom.

---

#### AD-071 — Employee birthday coverage report

**As a** platform admin, **I want to** see which upcoming employee birthdays across all companies have a pending order vs. no order **so that** I can identify gaps in automation.

**Acceptance Criteria:**

- Report lists upcoming birthdays (configurable window: next 7 / 30 / 60 days) with columns: company, employee name, birthday, has order (Yes/No), order status.
- Filterable by company, order status, date window.
- **Given** a birthday has no order and the rule should have generated one, **then** the row is highlighted in orange.
- Admins can manually trigger order creation for a missing birthday directly from this report.

---

## 4. Cross-Cutting Concerns

### 4.1 Authentication & Security

---

#### SEC-001 — Login with email and password

**As any** portal user (HR manager, bakery operator, admin), **I want to** log in with my email and password **so that** I can access my portal securely.

**Acceptance Criteria:**

- Login form has email and password fields with "Şifremi Unuttum" link.
- **Given** I enter correct credentials, **then** I am redirected to my portal's dashboard.
- **Given** I enter incorrect credentials 5 times within 15 minutes, **then** my account is temporarily locked for 15 minutes and I receive an email notification.
- Passwords must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one digit.
- Session tokens expire after 8 hours of inactivity; the user is redirected to the login page with a message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın."
- All traffic is over HTTPS; cookies are `HttpOnly` and `SameSite=Strict`.

---

#### SEC-002 — Password reset

**As any** user, **I want to** reset my password via email **so that** I can regain access if I forget it.

**Acceptance Criteria:**

- **Given** I enter my email on the "Şifremi Unuttum" page, **when** I click submit, **then** if the email exists I receive a password reset link within 2 minutes; if it does not exist, I see the same success message (to prevent email enumeration).
- Reset links expire after 1 hour.
- **Given** I set a new password, **then** all existing sessions for my account are invalidated.

---

#### SEC-003 — Role-based access control

**As a** platform architect, **I want** all portal routes to enforce role-based access control **so that** users can only access features appropriate to their role.

**Acceptance Criteria:**

- Each portal (Customer, Bakery, Admin) is fully isolated; a bakery user cannot access customer routes and vice versa.
- Within the Customer Portal, role restrictions per CP-071 are enforced on both the UI and API layers.
- **Given** a user's JWT contains a role that is not authorised for a given API endpoint, **then** the API returns HTTP 403.
- Admin accounts use a separate login subdomain (`admin.platform.com`); admin credentials cannot be used to log in via the customer login page.

---

#### SEC-004 — Audit logging

**As a** platform admin, **I want** all sensitive actions to be recorded in an audit log **so that** I can investigate security incidents and policy violations.

**Acceptance Criteria:**

- Audited actions include (but are not limited to): login (success and failure), password reset, user role change, company suspend/reactivate, order manual reassignment, bakery payout approval, admin impersonation.
- Each audit log entry contains: timestamp (UTC), actor user ID and role, action type, affected resource ID, IP address, before/after values where relevant.
- Audit logs are immutable (no edit or delete); retention period: 2 years.
- Audit logs are searchable in the admin dashboard by actor, action type, resource, and date range.

---

### 4.2 Localisation & Accessibility

---

#### L10N-001 — Turkish language at launch

**As any** user, **I want** the platform to be fully in Turkish **so that** I can use it without a language barrier.

**Acceptance Criteria:**

- All UI text, error messages, email notifications, and WhatsApp messages are in Turkish.
- Date format: DD.MM.YYYY throughout the UI.
- Currency format: TRY, displayed as `₺1.234,56` (Turkish locale: period as thousands separator, comma as decimal separator).
- Phone number fields accept and validate Turkish format (+90 XXXXXXXXXX).

---

#### L10N-002 — i18n-ready architecture

**As a** developer, **I want** all user-facing strings to be externalised into translation files **so that** adding new language support in the future requires no code changes.

**Acceptance Criteria:**

- All UI strings are stored in locale files (e.g., `tr.json`); no hard-coded strings in component templates.
- The locale file structure supports namespacing by feature module.
- Switching to a new locale at a future date should be achievable by adding a new locale file and updating a single configuration value.

---

#### L10N-003 — Responsive web design

**As any** user, **I want** the platform to be usable on any screen size **so that** I can use it on desktop, tablet, or mobile browser.

**Acceptance Criteria:**

- All three portals are fully functional on viewport widths from 375 px (mobile) to 1920 px (wide desktop).
- No horizontal scrolling on any supported viewport width.
- Touch targets are at least 44 x 44 px on mobile layouts.
- Core workflows (viewing orders, accepting/rejecting orders) are fully operable on a mobile browser.

---

*End of User Stories*
