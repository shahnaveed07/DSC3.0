# DSC3.0 — Dark Skull Corporation Software Studio

Official web platform and client/admin portal for **Dark Skull Corporation (DSC)** (`https://dscweb.me`).

- **Repository:** `https://github.com/shahnaveed07/DSC3.0`
- **Production Domain:** `https://dscweb.me`
- **Production Backend API:** `https://dscauth.onrender.com`
- **Founder & Lead Developer:** Naveed Mushtaq (`https://naveedmushtaq.tech/`)

---

## 1. Architecture & Technology Stack

- **Frontend Framework:** React 19 (JavaScript / JSX) + Vite 8 + React Router 7
- **Styling & Theme System:** Single unified dark editorial Software Studio theme (`src/styles/app.css`, `#070a10` deep slate canvas, `#10b981` emerald primary accent, `Plus Jakarta Sans` + `Inter` + `JetBrains Mono`)
- **Package Manager:** Standardized on `npm` (`package-lock.json` tracked)
- **Testing & Linting:** Vitest + React Testing Library (`jsdom`) + Oxlint

---

## 2. Software Studio Structure vs. Legacy Software Licensing

`DSC3.0` preserves all legacy desktop software panel and administrative workflows while organizing public pages around Dark Skull Corporation's Software Studio architecture:

1. **Software Studio Portfolio (`/products` & `/projects/:slug`)**:
   - **In Production (`/products/in-production`)**: Live applications, websites, and games deployed in production.
   - **Own Products (`/products/own-products`)**: Proprietary software owned and developed by Dark Skull Corporation (`QR Scanner | Generator` and `Mind Matrix`).
   - **Built by DSC (`/products/built-by-dsc`)**: Client and partner projects developed by DSC.
   - Canonical project data lives in `src/content/projectsData.js` and is shared across `HomePage`, `StudioProductsPage`, `InProductionPage`, `OwnProductsPage`, `BuiltByDscPage`, `ProjectDetailPage`, `AppsPage`, and `DownloadsPage`.
2. **Quotation-Based Development Services (`/services`)**:
   - **Website Development (`/services/websites`)**
   - **Android Application Development (`/services/android-applications`)**
   - **Game Development (`/services/game-development`)**
   - Each service page provides scope templates and deployment preferences (**With Deployment** or **Without Deployment**) that prefill project inquiries on `/contact`.
3. **Preserved Legacy Software Panel & Licensing Workflows**:
   - **Software Panel Catalog (`/pages/products`, `/pages/catalog`)**, **Free Panel (`/pages/freepanel`)**, **Checkout (`/pages/checkout`)**, **Client Dashboard (`/pages/udash`, `/dashboard`)**, **Admin Dashboard (`/pages/adash`)**, **OwnerDB (`/pages/ownerdb`)**, and **Key Generator (`/pages/generatekey`)** remain intact.
   - On the **Client Dashboard (`UserDashboardPage`)**, **Existing Software Orders & Panel Subscriptions** (populated from `GET /api/auth/my-order`) are kept strictly separate from **DSC Service Project Orders** (`My Orders` tab), which displays an honest status notice until DSC's Service Order backend is connected.

---

## 3. Complete Application Route Table

### Public Software Studio Routes
| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Software Studio hero, disciplines, canonical featured releases, and studio highlights |
| `/products` | `StudioProductsPage` | Products & Portfolio overview across the 3 classifications |
| `/products/in-production` | `InProductionPage` | Live releases filterable by All, Android Applications, Websites, and Games |
| `/products/own-products` | `OwnProductsPage` | Proprietary DSC products (`QR Scanner | Generator`, `Mind Matrix`) |
| `/products/built-by-dsc` | `BuiltByDscPage` | Client & commissioned projects directory |
| `/projects/:slug` | `ProjectDetailPage` | Canonical project detail view with dynamic SEO metadata |
| `/services` | `ServicesOverviewPage` | Quotation-based development services overview |
| `/services/websites` | `ServiceDetailPage` | Website Development scope templates & deployment options |
| `/services/android-applications` | `ServiceDetailPage` | Android Application Development scope templates & deployment options |
| `/services/game-development` | `ServiceDetailPage` | Game Development scope templates & deployment options |
| `/team` | `TeamPage` | Founder & Lead Developer profile (`Naveed Mushtaq`) and studio structure |
| `/about`, `/pages/about` | `AboutPage` | Company overview, mission, and engineering standards |
| `/contact`, `/pages/contact` | `ContactPage` | Direct contact channels and prefilled service/quotation inquiry builder |

### Preserved Legacy Public & Store Routes
| Route | Component | Description |
| :--- | :--- | :--- |
| `/pages/apps` | `AppsPage` | Android Applications & Games showcase |
| `/pages/websites` | `WebsitesPage` | Custom Websites category page |
| `/pages/products`, `/pages/catalog` | `ProductsPage` / `LegacyProductsCatalogPage` | Desktop software panel catalog & licensing tiers |
| `/pages/downloads` | `DownloadsPage` | Official Android app and software download center |
| `/pages/freepanel` | `FreePanelPage` | Live Free Panel slot availability and evaluation credentials |
| `/pages/checkout` | `CheckoutPage` | Software panel checkout and payment proof submission |
| `/pages/status` | `StatusPage` | Real-time backend health and maintenance telemetry |
| `/pages/privacy-policy` | `PrivacyPolicyPage` | Privacy Policy, Android permissions, and cookie disclosures |
| `/pages/terms` | `TermsPage` | Terms of Service and licensing rules |

### Authentication, User & Admin Routes
| Route | Access | Component | Description |
| :--- | :--- | :--- | :--- |
| `/login`, `/pages/ulogin` | Public | `UserLoginPage` | Client portal sign-in (`POST /api/auth/login`) |
| `/register`, `/pages/register` | Public | `UserRegisterPage` | Client account registration (`POST /api/auth/register` — *Pending Backend Confirmation*) |
| `/forgot-password`, `/pages/forgot-password` | Public | `ForgotPasswordPage` | Password recovery & reset (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password` — *Pending Backend Confirmation*) |
| `/dashboard`, `/pages/udash` | `User` | `UserDashboardPage` | Client dashboard (Overview / Existing Software Licenses, My Orders, Profile, Account Security) |
| `/pages/change` | `User` | `ChangePasswordPage` | User password update (`POST /api/auth/change-password`) |
| `/pages/alogin` | Public | `AdminLoginPage` | Administrator sign-in (`POST /api/admin/login`) |
| `/pages/adash` | `Admin` | `AdminDashboardPage` | Admin control center, order approval queue, and user management |
| `/pages/generatekey` | `Admin` | `GenerateKeyPage` | License key generator (`POST /api/admin/generate`) |
| `/pages/ownerdb` | `Admin` + `Owner` | `AdminWorkspacePage` | Owner database manager verified via `GET /api/admin/owner/probe` |

---

## 4. Session Management & HTTP 401 / 403 Semantics

- **Storage Key:** `dscweb.current-session` (`src/utils/auth.js`)
- **Activity-Based Idle Timeout:** `10 hours` (`SESSION_TIMEOUT_MS`). Meaningful user interaction (`pointerdown`, `keydown`, `touchstart`) refreshes `lastActivityAt` with a 60-second write throttle (`ACTIVITY_THROTTLE_MS`). Background keep-alive polling (`pingBackend()`) never counts as user activity.
- **Strict JWT Expiration:** The JWT `exp` claim is checked on every session load and activity refresh and is never extended by client-side activity.
- **HTTP 401 vs. HTTP 403:**
  - `HTTP 401 Unauthorized` (`isAuthError(err) === true`): Session is invalid or expired; the client clears `localStorage` and redirects to login.
  - `HTTP 403 Forbidden` (`isForbiddenError(err) === true`): Authenticated user/admin lacks permission for a specific resource (e.g., a standard Admin probing `/api/admin/owner/probe`); the active session is preserved and an access-denied message is displayed.

---

## 5. Local Development & Verification

```bash
# 1. Install dependencies (uses tracked package-lock.json)
npm ci

# 2. Start Vite development server (port 3000)
npm run dev

# 3. Run static analysis linter (Oxlint)
npm run lint

# 4. Run unit & integration test suite (Vitest)
npm run test -- --run

# 5. Build production bundle (also verifiesprerendered route heads)
npm run build
```

See [`docs/API_ENDPOINT_MAP.md`](./docs/API_ENDPOINT_MAP.md) for the complete list of verified production backend routes and unverified account endpoints pending backend confirmation.
