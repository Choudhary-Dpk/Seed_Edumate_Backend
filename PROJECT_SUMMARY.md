# Edumate Backend — Project Summary

> **Last Updated:** March 2026
> **Tech Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL
> **Project Name:** `hubspot-integration-app` v1.0.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints (150+)](#5-api-endpoints)
6. [External Integrations](#6-external-integrations)
7. [Services & Business Logic](#7-services--business-logic)
8. [Workers & Background Jobs](#8-workers--background-jobs)
9. [Middleware Stack](#9-middleware-stack)
10. [Authentication & Security](#10-authentication--security)
11. [Email System](#11-email-system)
12. [Cron Jobs](#12-cron-jobs)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)

---

## 1. Project Overview

Edumate Backend is a **B2B education loan and partnership management platform** that serves as the core API for the Edumate Global ecosystem. It manages:

- **Student Loan Applications** — Eligibility checks, applications, repayment schedules, PDF generation
- **B2B Partner Management** — Partner onboarding, performance tracking, lead attribution
- **Commission Settlements** — Multi-level approval workflow, invoice generation, dispute management
- **Contact/Lead Management** — CRM operations, CSV import, lead stats, HubSpot sync
- **Lender & Loan Product Catalog** — Lender management, product comparisons, financial terms
- **Admin Dashboard** — MIS reports, key metrics, email reports, data exports
- **Email Templates** — Dynamic template editor with variable injection, preview, test send
- **Short URL Service** — URL shortening with analytics, bulk creation
- **Accommodation** — University Living API integration for student housing

---

## 2. Tech Stack & Dependencies

### Core
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18.2 | HTTP framework |
| TypeScript | 5.1.6 | Type safety |
| Prisma | 6.19.0 | ORM |
| PostgreSQL | — | Primary database |

### External Integrations
| Package | Purpose |
|---------|---------|
| `@hubspot/api-client` 9.0.0 | HubSpot CRM sync |
| `@aws-sdk/client-s3` 3.1006.0 | AWS S3 file storage |
| `nodemailer` 7.0.5 | SMTP email (Gmail) |
| `puppeteer` 23.1.0 | PDF generation |
| `axios` 1.12.2 | External HTTP calls |

### Auth & Security
| Package | Purpose |
|---------|---------|
| `jsonwebtoken` 9.0.2 | JWT authentication |
| `bcrypt` 6.0.0 | Password hashing |
| `helmet` 7.0.0 | Security headers |
| `express-validator` 7.2.1 | Input validation |
| `zod` 4.0.5 | Schema validation |

### Data Processing
| Package | Purpose |
|---------|---------|
| `exceljs` 4.4.0 | Excel generation/parsing |
| `csv-parse` 6.1.0 | CSV parsing |
| `papaparse` 5.5.3 | CSV utilities |
| `multer` 2.0.2 | File upload handling |

### Utilities
| Package | Purpose |
|---------|---------|
| `winston` 3.10.0 | Logging with daily rotation |
| `node-cron` 4.2.1 | Scheduled tasks |
| `moment-timezone` | Date/time handling |
| `nanoid` 5.1.6 | Short ID generation |
| `uuid` 13.0.0 | UUID generation |
| `p-queue` 8.0.1 | Concurrency control |
| `swagger-ui-express` 5.0.1 | API documentation |
| `pm2` 6.0.8 | Process management |

---

## 3. Folder Structure

```
src/
├── app.ts                          # Main app — mounts 20+ route groups
├── config/                         # Configuration
│   ├── config.ts                   # Server, HubSpot, logging settings
│   ├── email-config.ts             # Gmail SMTP configuration
│   ├── prisma.ts                   # Prisma client with audit extension
│   ├── pg-notify-client.ts         # PostgreSQL LISTEN/NOTIFY singleton
│   ├── universityLiving.config.ts  # University Living API config
│   └── hubspotMapper.ts            # HubSpot field mapping
├── setup/
│   ├── express.ts                  # Express middleware (cors, helmet, compression)
│   ├── secrets.ts                  # Environment variable exports
│   ├── cron.ts                     # Cron job scheduling (10KB+)
│   ├── multer.ts                   # File upload config (memory storage)
│   └── s3bucket.ts                 # AWS S3 client initialization
├── controllers/                    # Request handlers
│   ├── admin/                      # Admin panel controllers
│   │   ├── common/auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── email-template.controller.ts
│   ├── student/auth.controller.ts
│   ├── common/auth.controller.ts
│   ├── contact.controller.ts
│   ├── commission.controller.ts
│   ├── dashboard.controller.ts
│   ├── loan.controller.ts
│   ├── loanApplication.controller.ts
│   ├── loanProduct.controller.ts
│   ├── partner.controller.ts
│   ├── lender.controller.ts
│   ├── shortUrl.controller.ts
│   ├── mis-report.controller.ts
│   ├── gupshup.controller.ts
│   ├── email.controller.ts
│   ├── accommodation.controller.ts
│   ├── testimonials.controller.ts
│   ├── programOfInterest.controller.ts
│   ├── user.controller.ts
│   └── dashboard-email.controller.ts
├── routes/                         # API route definitions
│   ├── admin/
│   │   ├── index.routes.ts         # Admin sub-router mount
│   │   ├── adminAuth.routes.ts
│   │   ├── user-management.routes.ts
│   │   └── email-template.routes.ts
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── student.routes.ts
│   ├── contact.routes.ts
│   ├── partner.routes.ts
│   ├── lender.routes.ts
│   ├── loan.routes.ts
│   ├── loanProudct.routes.ts
│   ├── loanApplication.routes.ts
│   ├── commission.routes.ts
│   ├── email.routes.ts
│   ├── accommodation.routes.ts
│   ├── testimonials.route.ts
│   ├── programOfInterest.ts
│   ├── gupshup.routes.ts
│   ├── misReport.routes.ts
│   ├── dashboard.routes.ts
│   ├── shorturl.routes.ts
│   ├── redirect.routes.ts
│   └── docs.routes.ts
├── services/                       # Business logic layer
│   ├── DBServices/                 # Database-specific services
│   ├── EmailNotifications/         # Email notification services
│   ├── hubspot.service.ts          # HubSpot high-level operations
│   ├── hubspotClient.service.ts    # HubSpot low-level API client
│   ├── hubspot-loan.service.ts     # HubSpot loan sync
│   ├── hubspot-commission-settlements.service.ts
│   ├── unified-email.service.ts    # Unified email sender
│   ├── email-queue.service.ts      # Email queue management
│   ├── email-log.service.ts        # Email logging & analytics
│   ├── pdf.service.ts              # Puppeteer PDF generation
│   ├── schedule.service.ts         # EMI/repayment calculation
│   ├── loan.service.ts             # Loan eligibility & currency
│   ├── mis-report.service.ts       # MIS report generation
│   ├── dashboard.service.ts        # Dashboard metrics
│   ├── dashboard-email.service.ts  # Dashboard email reports
│   ├── commission.service.ts       # Commission settlement creation
│   ├── gupshup.service.ts          # WhatsApp OTP via Gupshup
│   ├── shortUrl.service.ts         # URL shortening
│   ├── universityLiving.service.ts # Accommodation API
│   └── user.service.ts             # User management
├── models/helpers/                 # Database query helpers (Prisma)
│   ├── auth.ts
│   ├── contact.helper.ts
│   ├── commission.helper.ts
│   ├── loanApplication.helper.ts
│   ├── loanProduct.helper.ts
│   ├── partners.helper.ts
│   ├── lenders.helper.ts
│   ├── student.helper.ts
│   ├── testimonials.helper.ts
│   ├── user.helper.ts
│   ├── user-management.helper.ts
│   ├── email-template.helper.ts
│   └── index.ts
├── middlewares/                    # Express middlewares
│   ├── index.ts                   # Auth (JWT, API Key, Both)
│   ├── error.ts                   # Global error handler
│   ├── audit.middleware.ts        # Prisma audit trail extension
│   ├── validators/                # Input validation rules
│   ├── hubspot-sync.middleware.ts
│   ├── hubspot-loan-sync.middleware.ts
│   ├── hubspot-commission-settlements-sync.middleware.ts
│   ├── contacts.ts
│   ├── partner.middleware.ts
│   ├── lender.middleware.ts
│   ├── loanProduct.middleware.ts
│   ├── loanApplication.middleware.ts
│   ├── commission.middleware.ts
│   ├── programOfInterest.middleware.ts
│   └── accommodation.middleware.ts
├── workers/                       # Background workers
│   ├── index.ts                   # Worker initialization
│   ├── email-queue-worker.ts      # Email queue processor
│   ├── hubspot-sync.worker.ts     # Contact sync to HubSpot
│   ├── hubspot-loan-sync.worker.ts
│   ├── hubspot-commission-settlement-sync.worker.ts
│   ├── partner-pg-notify-worker.ts
│   ├── loanApplication-pg-notify-worker.ts
│   ├── edumate-pg-notify.worker.ts
│   └── commission-pg-notify.worker.ts
├── mappers/                       # Data transformation
├── types/                         # TypeScript interfaces (16+ files)
├── utils/                         # Utility functions
│   ├── logger.ts                  # Winston logger setup
│   ├── api.ts                     # sendResponse utility
│   ├── auth.ts                    # JWT & password utilities
│   ├── s3.ts                      # S3 upload/delete
│   ├── helper.ts                  # General helpers (41KB+)
│   ├── email templates/           # HTML email templates
│   └── csvTemplates/              # CSV export templates
├── seeders/                       # Data seeding scripts
├── scripts/                       # Database utility scripts
└── constants/                     # Enum mappings
```

---

## 4. Database Schema

**Total:** 118 Models + 68 Enums + 1 View | 3,253 lines in `schema.prisma`

### Models by Domain

#### Auth & User Management (15 models)
| Model | Table | Purpose |
|-------|-------|---------|
| `AdminUsers` | admin_users | Admin user accounts |
| `AdminRoles` | admin_roles | Role definitions |
| `AdminUserRoles` | admin_user_roles | User ↔ Role mapping |
| `AdminPermissions` | admin_permissions | Permission definitions |
| `AdminRolePermissions` | admin_role_permissions | Role ↔ Permission mapping |
| `AdminSessions` | admin_sessions | JWT session tracking |
| `AdminTokens` | admin_tokens | Password reset tokens |
| `ContactUsers` | — | Student/contact portal users |
| `ContactSessions` | — | Contact user sessions |
| `ContactTokens` | — | Contact user tokens |
| `LoginHistory` | — | Login audit trail |
| `B2BPartnersUsers` | — | Partner portal users |
| `B2BPartnersSessions` | — | Partner sessions |
| `B2BPartnersTokens` | — | Partner tokens |
| `B2BPartnersUserOtps` | — | Partner OTP storage |
| `adminRoleChangeAuditLog` | — | Role change history |

#### B2B Partners (14 models)
| Model | Purpose |
|-------|---------|
| `HSB2BPartners` | Core partner record |
| `HSB2BPartnersBusinessCapabilities` | Business capabilities |
| `HSB2BPartnersCommissionStructure` | Commission configuration |
| `HSB2BPartnersComplianceAndDocumentation` | Compliance docs |
| `HSB2BPartnersContactInfo` | Contact details |
| `HSB2BPartnersFinancialTracking` | Revenue tracking |
| `HSB2BPartnersLeadAttribution` | Lead source tracking |
| `HSB2BPartnersMarketingAndPromotion` | Marketing info |
| `HSB2BPartnersPartnershipDetails` | Partnership terms |
| `HSB2BPartnersPerformanceMetrics` | KPIs |
| `HSB2BPartnersRelationshipManagement` | Relationship data |
| `HSB2BPartnersSystemTracking` | Sync metadata |
| `B2BPartnersRoles` | Partner roles |
| `B2BPartnersUserRoles` | Partner user-role mapping |

#### Contacts / Leads (8 models)
| Model | Purpose |
|-------|---------|
| `HSEdumateContacts` | Core contact/lead record |
| `HSEdumateContactsAcademicProfiles` | Academic info |
| `HSEdumateContactsApplicationJourney` | Application status |
| `HSEdumateContactsFinancialInfo` | Financial details |
| `HSEdumateContactsLeadAttribution` | Lead source tracking |
| `HSEdumateContactsLoanPreferences` | Loan preferences |
| `HSEdumateContactsPersonalInformation` | Personal details |
| `HSEdumateContactsSystemTracking` | Sync metadata |

#### Loan Applications (11 models)
| Model | Purpose |
|-------|---------|
| `HSLoanApplications` | Core loan application |
| `HSLoanApplicationsAcademicDetails` | Academic info |
| `HSLoanApplicationsAdditionalServices` | Extra services |
| `HSLoanApplicationsStatus` | Application status |
| `HSLoanApplicationsCommissionRecords` | Commission records |
| `HSLoanApplicationsCommunicationPreferences` | Communication prefs |
| `HSLoanApplicationsDocumentManagement` | Document tracking |
| `HSLoanApplicationsFinancialRequirements` | Financial requirements |
| `HSLoanApplicationsLenderInformation` | Lender info |
| `HSLoanApplicationsProcessingTimeline` | Processing dates |
| `HSLoanApplicationsRejectionDetails` | Rejection reasons |
| `HSLoanApplicationsSystemTracking` | Sync metadata |

#### Lenders (7 models)
| Model | Purpose |
|-------|---------|
| `HSLenders` | Core lender record |
| `HSLendersBusinessMetrics` | Business KPIs |
| `HSLendersContactInfo` | Contact details |
| `HSLendersLoanOfferings` | Loan offerings |
| `HSLendersOperationalDetails` | Operations |
| `HSLendersPartnershipsDetails` | Partnerships |
| `HSLendersSystemTracking` | Sync metadata |

#### Loan Products (12 models)
| Model | Purpose |
|-------|---------|
| `HSLoanProducts` | Core loan product |
| `HSLoanProductsApplicationAndProcessing` | Application workflow |
| `HSLoanProductsCollateralAndSecurity` | Collateral details |
| `HSLoanProductsCompetitiveAnalytics` | Market comparison |
| `HSLoanProductsEligibilityCriteria` | Eligibility rules |
| `HSLoanProductsFinancialTerms` | Financial terms |
| `HSLoanProductsGeographicCoverage` | Covered countries |
| `HSLoanProductsPerformanceMetrics` | Product KPIs |
| `HSLoanProductsRepaymentTerms` | Repayment details |
| `HSLoanProductsSpecialFeatures` | Special features |
| `HSLoanProductsSystemIntegration` | Integration config |
| `HSLoanProductsSystemTracking` | Sync metadata |

#### Loan Documents (10 models)
`HSLoanDocuments` + 9 sub-tables (SystemTracking, ProcessingWorkflow, Specification, Applicability, Compliance, DigitalConfigs, AlternativeDocuments, PerformanceMetrics, CustomerExperience)

#### Commission Settlements (13 models)
| Model | Purpose |
|-------|---------|
| `HSCommissionSettlements` | Core settlement record |
| `HSCommissionSettlementsCommissionCalculation` | Calculation details |
| `HSCommissionSettlementsCommunication` | Communication log |
| `HSCommissionSettlementsTaxAndDeductions` | Tax/deductions |
| `HSCommissionSettlementsDocumentation` | Documents |
| `HSCommissionSettlementsHoldAndDisputes` | Dispute management |
| `CommissionDisputeLog` | Dispute history |
| `HSCommissionSettlementsLoanDetails` | Linked loan details |
| `HSCommissionSettlementsPaymentProcessing` | Payment info |
| `HSCommissionSettlementsPerformanceAnalytics` | Analytics |
| `HSCommissionSettlementsReconciliations` | Reconciliation |
| `HSCommissionSettlementsSettlementStatus` | Status tracking |
| `HSCommissionSettlementsSystemTracking` | Sync metadata |
| `HSCommissionSettlementsTransactionDetails` | Transaction log |
| `Invoice` | Generated invoices |

#### Other Models
| Model | Purpose |
|-------|---------|
| `LoanEligibilityMatrix` | Eligibility rules matrix |
| `currency_conversion` | Exchange rates |
| `CurrencyConfigs` | Currency settings |
| `ShortUrl` | URL shortening |
| `Testimonials` | Student testimonials |
| `FProgramOfInterest` | Study programs |
| `HSMonthlyMISReports` | MIS reports |
| `EmailTemplate` | Email template editor |
| `EmailQueue` | Email queue (pending → sent) |
| `EmailLog` | Email delivery tracking |
| `email_history` | Legacy email history |
| `dashboard_email_templates` | Dashboard email templates |
| `AuditLog` | Data change audit trail |
| `SyncOutbox` | HubSpot sync outbox |
| `EnumMapping` + `EnumValue` | Dynamic enum management |
| `FieldMapping` | Field mapping config |
| `FileUploads` + `FileEntities` | File management |
| `MktEligibilityCheckerLeads` | Marketing leads (eligibility) |
| `MktEmiCalculatorLeads` | Marketing leads (EMI calculator) |

#### Views
| View | Purpose |
|------|---------|
| `leads_view` | Consolidated lead data for list/filter queries |

---

## 5. API Endpoints

**Total: 150+ endpoints across 20+ route groups**

### Route Groups Mounted in `app.ts`

| Base Path | Route File | Auth | Description |
|-----------|-----------|------|-------------|
| `/loans` | loan.routes.ts | API Key | Loan eligibility, currency, EMI |
| `/contacts` | contact.routes.ts | JWT + API Key | Contact CRUD, CSV import, lead stats |
| `/gupshup` | gupshup.routes.ts | None | WhatsApp webhook & OTP |
| `/user` | user.routes.ts | Mixed | User management, auth, profile |
| `/user/auth` | auth.routes.ts | Mixed | Login, signup, password, tokens |
| `/email` | email.routes.ts | API Key | Send emails |
| `/loanApplications` | loanApplication.routes.ts | JWT | Loan app CRUD & list |
| `/partners` | partner.routes.ts | API Key | Partner CRUD & list |
| `/lenders` | lender.routes.ts | API Key | Lender CRUD & list |
| `/loanProduct` | loanProudct.routes.ts | API Key | Loan product CRUD |
| `/commission` | commission.routes.ts | Mixed | Commission settlements, approvals, invoices |
| `/testimonials` | testimonials.route.ts | None | Testimonial CRUD |
| `/accom` | accommodation.routes.ts | API Key | University Living integration |
| `/programs-of-interest` | programOfInterest.ts | JWT | Study programs |
| `/mis-report` | misReport.routes.ts | None | MIS report generation & retrieval |
| `/admin/dashboard` | dashboard.routes.ts | None | Dashboard metrics, exports, emails |
| `/admin/auth` | adminAuth.routes.ts | Mixed | Admin auth (login, password, profile) |
| `/admin/users` | user-management.routes.ts | Super Admin | User management, roles, audit |
| `/admin/email-templates` | email-template.routes.ts | Super Admin | Template CRUD, preview, test email |
| `/admin/shorturl` | shorturl.routes.ts | JWT | Short URL create, list |
| `/student` | student.routes.ts | None | Student signup, login, profile |
| `/:code` | redirect.routes.ts | None (public) | Short URL redirect |
| `/api-docs` | docs.routes.ts | None | API documentation |

### Key Endpoints Detail

#### Authentication
```
POST /user/auth/create          — Register new user
POST /user/auth/login           — Login (returns JWT + refresh token)
POST /user/auth/otp             — Send OTP
POST /user/auth/forgot-password — Forgot password email
POST /user/auth/reset-password  — Reset with token
POST /user/auth/set-password    — Set password with token
PUT  /user/auth/change-password — Change password (authenticated)
POST /user/auth/logout          — Invalidate session
POST /user/auth/token           — Refresh access token
```

#### Admin Auth
```
POST /admin/auth/create         — Create admin user
POST /admin/auth/login          — Admin login
GET  /admin/auth/profile        — Get admin profile
POST /admin/auth/logout         — Admin logout
POST /admin/auth/token          — Refresh admin token
```

#### Contacts / Leads
```
POST /contacts                  — Create contact lead
POST /contacts/upsert           — Upsert contact
GET  /contacts/list             — Paginated list with search/filter
GET  /contacts/details/:id      — Contact details
PUT  /contacts/:id              — Update contact
DELETE /contacts/:id            — Delete contact
GET  /contacts/lead-stats       — Lead statistics & metrics
POST /contacts/upload-csv       — Bulk CSV import
POST /contacts/bulk-import      — Bulk JSON import
GET  /contacts/template         — Download CSV template
```

#### Loan Operations
```
POST /loans/check-eligibility                — Check loan eligibility
GET  /loans/currency-convert                 — Currency conversion
POST /loans/repaymentSchedule-and-email      — Generate EMI schedule + email PDF
POST /loans/extract-costs                    — Extract institution costs
POST /loans/extract-program                  — Extract program details
```

#### Loan Applications
```
POST /loanApplications                — Create application
PUT  /loanApplications/:id            — Update application
DELETE /loanApplications/:id          — Delete application
GET  /loanApplications/details/:id    — Application details
GET  /loanApplications/pagination     — Paginated list
GET  /loanApplications/list           — Full list
```

#### Commission Settlements
```
POST   /commission                     — Create settlement
PUT    /commission/:id                 — Update settlement
DELETE /commission/:id                 — Delete settlement
GET    /commission/details/:id         — Settlement details
GET    /commission/pagination          — Paginated list
GET    /commission/lead                — Settlements by lead
POST   /commission/upload-invoice      — Upload invoice PDF
POST   /commission/generate-invoice    — Auto-generate invoice
PATCH  /commission/:id/accept          — Partner accepts settlement
PATCH  /commission/:id/raise-objection — Partner raises objection
PATCH  /commission/:id/resolve-dispute — Admin resolves dispute
PATCH  /commission/l1-approve          — Level 1 approval
PATCH  /commission/l1-reject           — Level 1 rejection
PATCH  /commission/l2-approve          — Level 2 approval
PATCH  /commission/l2-reject           — Level 2 rejection
GET    /commission/:id/timeline        — Approval timeline
GET    /commission/:id/invoice-file    — Download invoice
```

#### Dashboard
```
GET  /admin/dashboard/key-metrics       — Key business metrics
GET  /admin/dashboard/top-partners      — Top performing partners
GET  /admin/dashboard/partner-activity  — Partner activity feed
GET  /admin/dashboard/overview          — Dashboard overview
GET  /admin/dashboard/trends            — Monthly trends
GET  /admin/dashboard/pipeline-status   — Loan pipeline status
GET  /admin/dashboard/filter-options    — Filter dropdown options
GET  /admin/dashboard/export/*          — CSV exports (4 endpoints)
POST /admin/dashboard/email-report      — Send report email
POST /admin/dashboard/email-bulk        — Send bulk report emails
GET  /admin/dashboard/email-history     — Email send history
```

#### MIS Reports
```
POST /mis-report/generate                          — Generate all partner reports
POST /mis-report/generate/:partnerId/:year/:month  — Generate single partner report
GET  /mis-report/stats                             — Report statistics
GET  /mis-report/partner/:partnerId                — All reports for a partner
GET  /mis-report/:partnerId/:year/:month           — Specific month report
GET  /mis-report/:year/:month                      — All reports for month
DELETE /mis-report/:partnerId/:year/:month          — Delete report
```

#### Email Templates (Admin)
```
GET    /admin/email-templates              — List templates (paginated, searchable)
GET    /admin/email-templates/:id          — Get template (with extracted_variables)
POST   /admin/email-templates              — Create template
PUT    /admin/email-templates/:id          — Update template
DELETE /admin/email-templates/:id          — Soft delete template
POST   /admin/email-templates/:id/preview  — Preview with variable replacement
POST   /admin/email-templates/:id/send-test — Send test email
```

#### Short URLs
```
POST /admin/shorturl            — Create short URL
POST /admin/shorturl/bulk       — Bulk create short URLs
GET  /admin/shorturl/list       — List with pagination & search
GET  /:code                     — Public redirect (tracks clicks)
```

#### Partners, Lenders, Loan Products
```
# Partners
GET/POST/PUT/DELETE /partners/*        — Full CRUD + pagination + filter

# Lenders
GET/POST/PUT/DELETE /lenders/*         — Full CRUD + pagination + filter

# Loan Products
GET/POST/PUT/DELETE /loanProduct/*     — Full CRUD + pagination
```

#### Other
```
GET  /master/currency-configs       — Currency configurations
GET  /api-docs                      — API documentation
GET  /api-docs/health               — Health check
POST /gupshup/assignment-webhook    — WhatsApp agent assignment
POST /gupshup/send-otp             — Send WhatsApp OTP
POST /student/signup                — Student registration
POST /student/login                 — Student login
```

---

## 6. External Integrations

### HubSpot CRM
- **SDK:** `@hubspot/api-client` v9.0.0
- **Custom Objects:**
  - Edumate Contacts (ID: `2-46187688`)
  - B2B Partners (ID: `2-46227624`)
  - Loan Applications (ID: `2-46227735`)
  - Loan Products (ID: `2-52086541`)
  - Commission Settlements (custom)
- **Operations:** CRUD, batch ops, search, associations, owner assignment
- **Sync:** Real-time via PostgreSQL LISTEN/NOTIFY workers + middleware triggers
- **Files:** `hubspot.service.ts`, `hubspotClient.service.ts`, `hubspot-loan.service.ts`, `hubspot-commission-settlements.service.ts`

### AWS S3
- **Bucket:** `application-invoices`
- **Purpose:** Invoice PDFs, uploaded documents
- **Operations:** Upload with content-type detection, delete
- **Files:** `setup/s3bucket.ts`, `utils/s3.ts`

### Gupshup (WhatsApp)
- **Purpose:** OTP delivery via WhatsApp template messages
- **Features:** Template messaging, agent assignment sync
- **File:** `gupshup.service.ts`

### University Living API
- **Purpose:** Student accommodation search
- **Endpoints:** Providers, cities, universities, properties, leads, bookings
- **Rate Limit:** 300 requests/min via `p-queue`
- **File:** `universityLiving.service.ts`

### Gmail SMTP
- **Sender:** `info@edumateglobal.com`
- **Host:** `smtp.gmail.com:587`
- **Features:** Queue-based sending, logging, retry logic
- **Files:** `unified-email.service.ts`, `email-queue.service.ts`

### External APIs
- **IP Geolocation API** — Resolve IP to country/currency
- **Exchange Rate API** — Currency conversion rates
- **Cost Extraction AI API** — Institution tuition cost extraction
- **Program Extraction AI API** — Program details extraction

---

## 7. Services & Business Logic

### Loan Services
| Service | Key Functions |
|---------|--------------|
| `loan.service.ts` | `checkEligibility()` — Matrix lookup for loan eligibility |
| | `getConvertedCurrency()` — Currency conversion |
| | `getInstitutionCosts()` — AI-powered cost extraction |
| `schedule.service.ts` | `generateRepaymentSchedule()` — EMI calculation with monthly/yearly breakdown |
| `pdf.service.ts` | `generateRepaymentSchedulePDF()` — Puppeteer HTML→PDF with browser pooling |

### Commission Services
| Service | Key Functions |
|---------|--------------|
| `commission.service.ts` | Creates settlement + 12 related tracking records in one transaction |
| Commission Controller | Multi-level approval workflow (L1 → L2), dispute management, invoice generation |

### HubSpot Services
| Service | Purpose |
|---------|---------|
| `hubspot.service.ts` | High-level: contact CRUD, partner management, lead operations |
| `hubspotClient.service.ts` | Low-level: SDK wrapper with typed operations for all custom objects |
| `hubspot-loan.service.ts` | Loan application sync with multi-object associations |
| `hubspot-commission-settlements.service.ts` | Commission settlement sync |

### Email Services
| Service | Purpose |
|---------|---------|
| `unified-email.service.ts` | Single entry point — validation, sanitization, sending |
| `email-queue.service.ts` | Queue management — PENDING → PROCESSING → SENT/DEAD_LETTER |
| `email-log.service.ts` | Logging — categorization, analytics, delivery tracking |
| `EmailNotifications/` | Domain-specific email builders (commission notifications) |

### Dashboard & Reporting
| Service | Purpose |
|---------|---------|
| `dashboard.service.ts` | Partner metrics, financial aggregations, period filtering |
| `mis-report.service.ts` | MIS report generation — parallel batch processing with DB-level aggregation |
| `dashboard-email.service.ts` | Dashboard report email composition |

---

## 8. Workers & Background Jobs

All workers use PostgreSQL's **LISTEN/NOTIFY** pattern for real-time event-driven processing.

| Worker | Trigger | Purpose |
|--------|---------|---------|
| `email-queue-worker.ts` | Polling | Process email queue (retry with backoff) |
| `hubspot-sync.worker.ts` | DB NOTIFY | Sync contacts to HubSpot on create/update |
| `hubspot-loan-sync.worker.ts` | DB NOTIFY | Sync loan applications to HubSpot |
| `hubspot-commission-settlement-sync.worker.ts` | DB NOTIFY | Sync commission data to HubSpot |
| `partner-pg-notify-worker.ts` | DB NOTIFY | React to partner data changes |
| `loanApplication-pg-notify-worker.ts` | DB NOTIFY | React to loan app changes |
| `edumate-pg-notify.worker.ts` | DB NOTIFY | React to contact/lead changes |
| `commission-pg-notify.worker.ts` | DB NOTIFY | React to commission changes |

---

## 9. Middleware Stack

### Express Setup (`setup/express.ts`)
```
cors → helmet → compression → json(50mb) → urlencoded → static(public)
```

### Authentication Middlewares (`middlewares/index.ts`)
| Middleware | Purpose |
|-----------|---------|
| `authenticateJWT` | Verify JWT Bearer token, extract user + role |
| `authenticateAPIKey` | Verify API key in header |
| `authenticateBoth` | Accept either JWT or API key |
| `getUserIpDetails` | Extract IP + user agent info |

### Role-Based Access
Roles: `super_admin`, `Admin`, `Manager`, `User`, `Partner`, `commission_reviewer`, `commission_approver`, `commission_viewer`

### Validation Middlewares
- Input validation via `express-validator`
- Duplicate checking (partners, lenders, products, commissions)
- File validation (CSV format, size)
- Domain-specific business rule validation

### HubSpot Sync Middlewares
Post-response middlewares that trigger HubSpot sync after successful CRUD operations.

### Audit Middleware
Prisma client extension that automatically logs all CREATE, UPDATE, DELETE operations with old/new values, user context, and timestamps.

### Error Handler
Centralized error handling with:
- Custom error types (validation, not found, unauthorized, forbidden)
- Development vs production error responses
- Graceful shutdown on SIGTERM/SIGINT

---

## 10. Authentication & Security

### JWT Authentication
- **Access Token:** 30 minute expiry
- **Refresh Token:** 15 day expiry
- **Password Hashing:** bcrypt with 10 salt rounds
- **Session Tracking:** DB-stored sessions with device info + IP

### Security Headers
- Helmet with CSP configured
- CORS enabled
- Input sanitization (email injection prevention)
- Request size limits (50MB JSON body)

### Role-Based Access Control (RBAC)
```
super_admin → Full access (user management, email templates, all operations)
Admin       → Most operations except user management
Manager     → Standard operations
User        → Basic operations
Partner     → Limited partner-specific access
commission_reviewer  → View + review commissions
commission_approver  → Approve/reject commissions
commission_viewer    → View-only commission access
```

---

## 11. Email System

### Architecture
```
Controller → unified-email.service.ts → email-queue.service.ts → email-queue-worker.ts → SMTP
                                              ↓
                                      email-log.service.ts → EmailLog table
```

### Email Types
| Type | Trigger |
|------|---------|
| OTP | User login / verification |
| Set Password | New user creation |
| Forgot Password | Password reset request |
| Loan Eligibility | Eligibility check result |
| Repayment Schedule | EMI calculation with PDF attachment |
| Commission Notification | Settlement status changes |
| Dashboard Report | Admin-triggered partner reports |
| Test Email | Template preview testing |

### Email Template System
- Dynamic variables with `{%variableName%}` syntax
- Auto-extraction of variables from HTML
- Preview with variable replacement
- Test email sending
- Categories: TRANSACTIONAL, NOTIFICATION, MARKETING, COMMISSION, DASHBOARD, LOAN

### Queue Features
- Status tracking: PENDING → PROCESSING → SENT / FAILED / DEAD_LETTER
- Retry with configurable max attempts
- Priority support
- Dead letter processing
- Queue statistics & monitoring

---

## 12. Cron Jobs

Configured in `setup/cron.ts`:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Loan Product Options Sync | Daily | Sync loan product data |
| Currency Rate Update | Daily | Refresh exchange rates |
| Email Template Seeding | On deploy | Seed default email templates |
| MIS Report Generation | Monthly | Generate partner MIS reports |
| Email Queue Cleanup | Periodic | Process dead letters |

---

## 13. Deployment & Infrastructure

### PM2 Configuration (`ecosystem.config.js`)
```
Instances: 1 (fork mode)
Max Memory: 1GB
Max Restarts: 10
Min Uptime: 10 seconds
Node Args: --max_old_space_size=1024
Log Rotation: Daily in /logs
```

### NPM Scripts
```bash
npm run dev              # Development (ts-node-dev, auto-reload)
npm run build            # TypeScript compilation
npm start                # Production start
npm run pm2:start        # PM2 start
npm run pm2:stop         # PM2 stop
npm run pm2:restart      # PM2 restart
npm run test             # Jest tests
npm run lint             # ESLint
npm run prisma           # Prisma CLI
npm run db:triggers      # Initialize DB triggers
npm run seed:emailTemplates  # Seed email templates
npm run generateDoc      # Generate Swagger docs
```

### Environment Variables
```
DATABASE_URL             # PostgreSQL connection string
JWT_SECRET               # JWT signing secret
HUBSPOT_ACCESS_TOKEN     # HubSpot PAT
AWS_ACCESS_KEY_ID        # AWS S3 credentials
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME           # application-invoices
SMTP_HOST                # smtp.gmail.com
SMTP_PORT                # 587
SMTP_USER                # info@edumateglobal.com
SMTP_PASS                # Gmail app password
API_KEY                  # Internal API key
UL_API_KEY               # University Living API key
IP_API_KEY               # IP geolocation key
EXCHANGE_RATE_API_KEY    # Currency API key
```

---

## Summary Stats

| Metric | Count |
|--------|-------|
| API Endpoints | 150+ |
| Database Models | 118 |
| Database Enums | 68 |
| Database Views | 1 |
| Schema Lines | 3,253 |
| Services | 20+ |
| Controllers | 20+ |
| Workers | 8 |
| Middlewares | 15+ |
| External Integrations | 6 (HubSpot, AWS S3, Gupshup, Gmail, University Living, IP/Currency APIs) |
| Dependencies | 50+ |

---

*Generated from codebase analysis — March 2026*
