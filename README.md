# DSCWeb_React

Production-grade React application for **Dark Skull Corporation** (`https://dscweb.me/`).

This modern React single-page application replaces the legacy monolithic website. It preserves the existing authentication, role verification, order processing, and administrative system contracts while providing a resilient, responsive, accessible, and maintainable user experience.

---

## 1. Project Purpose & Scope

- **Official Brand:** Dark Skull Corporation (DSC) — Independent Software Development Studio
- **Founder & Lead Developer:** Naveed Mushtaq (`https://naveedmushtaq.tech/`)
- **Primary Focus:** Android Application Development & Game Development (with Custom Website Development available on request)
- **Primary Domain:** `https://dscweb.me/`
- **Application Capabilities:**
  - Public studio portal: Home, Android Apps & Games (`QR Scanner | Generator`, `Mind Matrix`), Products Catalog, Download Center, About Studio, Contact & Website Project Inquiries, Status, Privacy Policy, Terms of Service.
  - Client Portal: Secure login, HWID validation, subscription status, license key display, authenticated software package downloads, and password management.
  - Public Free Panel: Live telemetry, used vs. available slot monitoring, dynamic test credentials, and public package download.
  - Product Catalog & Checkout: Tier selection, multi-duration pricing calculations, UPI QR payment flow, and image proof verification.
  - Administration: Admin authentication, user management, pending order processing (approval/rejection), account creation, administrative password rotation, and real-time maintenance mode control.
  - OwnerDB Workspace: Table-level record management for `users`, `settings`, `freeSettings`, `freeusers`, `panelUpdates`, `keys`, `orders`, and `admins` with search, pagination, bulk deletion, and controlled modal editors.

---

## 2. Production & Development Commands

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Run code linter
npm run lint

# Build production bundle (outputs to /dist)
npm run build

# Preview production build locally
npm run preview
```

---

## 3. Deployment Configuration

### Cloudflare Workers & Pages (Primary Production Host)

This repository is configured for deployment on **Cloudflare Workers** (with Static Assets) and **Cloudflare Pages**:

- **Configuration:** `wrangler.jsonc` (assets directory `./dist`, `not_found_handling: "single-page-application"`).
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** *(leave blank / repository root)*
- **Package Manager:** Automatically detected via `bun.lock` (`bun install --frozen-lockfile`)
- **Single Page Application Routing & Redirects:**
  - Configured via `public/_redirects` (copied to `dist/_redirects`).
  - Contains HTTP 301 rules redirecting legacy `.html` URLs to canonical clean routes.
  - SPA not-found handling is governed natively by `assets.not_found_handling = "single-page-application"` in `wrangler.jsonc` (avoiding recursive redirect loops in Cloudflare asset handling).

### Netlify & Vercel Compatibility

This project also maintains full compatibility with Netlify and Vercel:

- **Netlify:** Configured via `netlify.toml` (`publish = "dist"`, `command = "npm run build"`, and `/* /index.html 200`).
- **Vercel:** Configured via `vercel.json` (`rewrites` and static asset exemptions).

---

## 4. Environment Variables

Define the following environment variables in `.env` (or via the Netlify dashboard under **Site configuration > Environment variables**):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the DSC backend API | `https://dscauth.onrender.com` |

---

## 5. Route Architecture & Role-Based Access Control

All legacy `.html` URLs are redirected to their modern canonical SPA routes:

| Canonical Route | Legacy Alias | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `/index.html` | Public | Home showcase, services, principles, and direct links |
| `/pages/apps` | `/pages/apps.html` | Public | Desktop and mobile application catalog |
| `/pages/products` | `/pages/products.html` | Public | Software panel tiers, pricing, and purchase actions |
| `/pages/downloads` | `/pages/downloads.html` | Public | Verified binaries, public packages, and free tools |
| `/pages/about` | `/pages/about.html` | Public | Company identity, principles, and engineering focus |
| `/pages/contact` | `/pages/contact.html` | Public | Support channels (Discord, Email, GitHub, Portfolio) |
| `/pages/status` | `/pages/status.html` | Public | System status, maintenance alerts, and service notices |
| `/pages/privacy-policy` | `/pages/privacy-policy.html`, `/pages/policy.html` | Public | Privacy policy and data handling information |
| `/pages/terms` | `/pages/terms.html` | Public | Terms of service and platform agreements |
| `/pages/freepanel` | `/pages/freepanel.html` | Public | Live slot tracker, test credentials, and download |
| `/pages/checkout` | `/pages/checkout.html` | Public | Tier checkout, UPI QR code, payment proof upload |
| `/pages/ulogin` | `/pages/Ulogin.html` | Public (Guest) | Client portal login with loading barrier |
| `/pages/alogin` | `/pages/Alogin.html` | Public (Guest) | Admin login with loading barrier |
| `/pages/udash` | `/pages/Udash.html` | User Only | Client dashboard: license key, copy, secure download |
| `/pages/change` | `/pages/change.html` | User Only | Client password change |
| `/pages/adash` | `/pages/Adash.html` | Admin Only | Management overview: users, pending orders, maintenance toggle |
| `/pages/generatekey` | `/pages/generateKey.html` | Admin Only | License key generation authority |
| `/pages/ownerdb` | `/pages/OwnerDB.html` | Owner Only | Controlled database management workspace |

---

## 6. External API Dependencies & Production Requirements

The frontend integrates directly with the backend API:
- `GET /api/admin/system-status` — Maintenance flag and announcement data.
- `GET /api/public/free-panel` — Free slot counts and dynamic credentials.
- `POST /api/auth/login` — Client authentication (`HWID: WEB-CLIENT`).
- `POST /api/admin/login` — Administrator authentication.
- `GET /api/auth/my-order` — User order and subscription details.
- `GET /api/auth/download?plan={plan}` — Authenticated secure download link retrieval.
- `POST /api/auth/checkout` — Order submission with base64 proof.
- `POST /api/auth/change-password` — User password update.
- `GET /api/admin/users`, `GET /api/admin/orders/pending`, `GET /api/admin/settings/all` — Admin snapshot.
- `POST /api/admin/orders/{action}/{id}` — Order approval / rejection.
- `POST /api/admin/generate` — License key generation.
- `POST /api/admin/maintenance/toggle` — Global maintenance toggle.
- `GET /api/admin/owner/probe` — Owner privilege validation.
- Database endpoints: `/api/admin/keys`, `/api/admin/manage/admins`, `/api/admin/orders/all`, `/api/admin/free-users`, `/api/auth/panel-updates`.

---

## 7. Security & Release Verification

1. **No Embedded Secrets:** All credentials, tokens, and customer data are stored exclusively in client memory / session storage with automatic expiration and logout on 401/403.
2. **Error Boundary:** Top-level React `ErrorBoundary` prevents white-screen crashes and provides safe recovery routes.
3. **Double Submission Protection:** All authentication and payment forms lock input fields and disable submit buttons during in-flight network requests.
4. **Maintenance Exemption:** Admin authentication routes remain reachable during maintenance mode to ensure administrators can authenticate and toggle maintenance off.
5. **Theme Consistency:** Native Light and Dark themes conform to WCAG 2.1 AA/AAA contrast guidelines without color flash on initial load.
