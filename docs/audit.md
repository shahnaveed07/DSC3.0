# DSCWeb Audit

Date: September 3, 2026

## Live public structure

- Homepage at `https://dscweb.me/`
- Primary navigation: Home, Apps, Products, Downloads, About, Contact, Privacy Policy, Login
- Hidden but linked or scripted routes: `Alogin`, `Udash`, `Adash`, `OwnerDB`, `generateKey`, `change`, `freepanel`, `checkout`
- `robots.txt` is open and `sitemap.xml` currently lists `/`, `Ulogin.html`, `Alogin.html`, `freepanel.html`, and `checkout.html`

## Preserved public content

- Company identity remains `DarkSkullCorporation` with the site brand `DSCWeb`
- Public portfolio content includes Calculator, QR Scanner | Generator, and Mind Matrix
- Contact channels include Gmail and Discord
- Privacy policy and About content are largely static
- Product catalog includes free, streamer, special, sniper, aim-assist, premium, and customised panel tiers

## Preserved dynamic and API-dependent behavior

- `GET /api/admin/system-status`
  - Publicly callable in practice
  - Controls maintenance state, latest version, update URL, free download link, and visibility of the homepage download button
- `GET /api/public/free-panel`
  - Public endpoint
  - Live response confirmed on September 3, 2026:
    - `usedSlots`
    - `maxSlots`
    - `freeUser`
    - `freePass`
    - `freeLink`
- `POST /api/auth/login`
  - Request body from live frontend: `{ username, password, HWID: "WEB-CLIENT" }`
  - JWT token response is expected and role-checked on the client
- `POST /api/admin/login`
  - Request body from live frontend: `{ username, password }`
- `GET /api/auth/my-order`
  - Used as both user route guard and dashboard data source
- `POST /api/auth/change-password`
  - Authenticated user password change
- `GET /api/auth/download?plan=...`
  - Authenticated secure download URL fetch
- `POST /api/auth/checkout`
  - Checkout payload includes username, password, plan, duration, amount text, transaction marker, and base64 payment proof

## Additional admin endpoints referenced by the live client script

- `/api/admin/probe`
- `/api/admin/owner/probe`
- `/api/admin/users`
- `/api/admin/orders/pending`
- `/api/admin/orders/all`
- `/api/admin/orders/update`
- `/api/admin/orders/delete/{id}`
- `/api/admin/create-admin`
- `/api/admin/change-password`
- `/api/admin/settings/all`
- `/api/admin/settings/update`
- `/api/admin/maintenance/toggle`
- `/api/admin/generate`
- `/api/admin/keys`
- `/api/admin/free-users`
- `/api/admin/manage/*`

## Issues discovered during audit

- The workspace `dscweb-new` started as the stock Vite React template and did not yet implement any DSCWeb functionality.
- The live product page and checkout logic disagree on some prices.
  - Example: `STREAMER-PANEL` is presented as starting at `$10` in HTML, while live checkout logic prices it from a `$2` base rate.
- The live product page links `AIM-ASSIST-PANEL` to `panel=aimassist`, but the legacy checkout script only priced `aimbot`.
  - This is a real flow bug in the old frontend.
- The legacy frontend is a single monolithic script with route guards, API calls, storage logic, UI rendering, and admin tooling mixed together.
- Default Swagger or OpenAPI routes were not exposed at `/swagger/index.html`, `/swagger/v1/swagger.json`, or `/openapi.json` during the audit.

## Phase 1 rebuild decisions

- Preserve the current C# API and TiDB usage.
- Rebuild the public DSCWeb surface in React with centralized API handling.
- Preserve user login, user dashboard, free-panel status, and checkout flow against the existing backend.
- Keep admin access conservative in Phase 1.
  - Authentication is preserved.
  - Read-only admin overview can be rebuilt safely.
  - Deep owner and admin CRUD should follow once authenticated response contracts are verified with credentials.

## September 23, 2026 repair audit

- Stable reference project located at `C:\Users\snave\NaveedMushtaq\DSC(personal)\_DSC_ALL\DSCWeb`.
- React build foundation verified with `npm run build`; sandboxed execution hits a Windows `spawn EPERM`, but the approved normal build completes successfully.
- Shared header diverged from stable DSCWeb:
  - React used a full inline nav and lacked the current-page label, menu dropdown, and visible theme control.
  - Stable header uses logo/brand, current page, theme, login/session action, and menu.
- React routes were missing stable `status.html` and `terms.html` equivalents.
- Footer missed the stable copyright and developer credit line.
- Stable logo asset was not present in the React public assets.
- Existing API architecture remains centralized in `src/services/dscApi.js`; no backend contract changes were required in this pass.
- Existing lint command completes with warnings, primarily in legacy `audit-live-main.js` and existing hook patterns.

## September 23, 2026 source-to-React parity checklist

Reference: `C:\Users\snave\NaveedMushtaq\DSC(personal)\_DSC_ALL\DSCWeb` (read-only). React target: this repository.

### Structure and shared behavior

- [x] Enumerated all source HTML pages, CSS, JS modules, images, and route/auth guards; enumerated React routes, pages, shared layout, API service, assets, and deployment files.
- [x] Stable source pages: home (`index.html`), apps, products, downloads, about, contact, status, privacy policy, terms, 404, user login/dashboard/change password, free panel, checkout, admin login/dashboard, Owner DB, and key generation.
- [x] React has page components and routes for each functional page plus aliases, role gates, shared header/footer, centralized theme tokens, API helper, and Netlify SPA fallback (`public/_redirects`). React does not need a rendered 404 page route equivalent beyond its catch-all.
- [x] Theme preference is initialized before React renders and persisted as `siteTheme`; menu supports outside click and Escape; session storage and role checks are centralized.
- [x] Stable API contracts inventoried: system status, public free panel, user/admin login, user order/password/download/checkout, admin users/orders/settings/owner probe, admin user update/delete, order approve/reject, admin create/change password, settings/maintenance, owner management tables, and key generation.
- [x] Confirmed stable-source owner-only UI is guarded by `/api/admin/owner/probe`; the React Owner DB route now performs the same probe before showing it.

### Route checklist

| Source page / flow | React route | Audit result |
| --- | --- | --- |
| Home | `/` | Present; previous React version omitted stable sections. Reconstructed the stable six-section page and its copy/actions in this pass. |
| Apps | `/pages/apps` | Present; content and roadmap differ from stable page; needs copy/layout reconciliation. |
| Products / checkout entry | `/pages/products`, `/pages/checkout` | Present; product text/pricing intentionally diverged from source and source itself has pricing/slug inconsistencies. Must resolve against current stable values; no backend contract change. |
| Downloads | `/pages/downloads` | Present; React substitutes release-center language and calculator request CTA for source content. Needs reconciliation. |
| About / Contact | `/pages/about`, `/pages/contact` | Present; verify copy/actions against source during page repair. |
| Status / Privacy / Terms / 404 | corresponding `/pages/*` routes | Present, with `.html` aliases for status/privacy/terms. Exact content and standalone visual parity not established. |
| User login / dashboard / change | `/pages/ulogin`, `/pages/udash`, `/pages/change` | Present; API calls and role gating exist. Manual auth flow still requires valid backend credentials. |
| Free panel / checkout | `/pages/freepanel`, `/pages/checkout` | Present; public status and multipart proof submission implemented. Visual/error/edge-case parity requires runtime comparison. |
| Admin login / dashboard | `/pages/alogin`, `/pages/adash` | Present; source dashboard actions restored for user update, order approval/rejection, admin password change, maintenance toggle, refresh, and key generation entry. Owner-gated buttons follow probe. |
| Owner DB | `/pages/ownerdb` | Owner-probed; React loads all eight source tables, searches/paginates, edits using source update endpoints, deletes supported record types after confirmation, and toggles maintenance. Bulk delete and source-specific field forms still differ. |
| Key generation | `/pages/generatekey` | React now calls source `POST /api/admin/generate`, validates response, handles auth expiry/errors, and copies generated keys. |

### Remaining audit findings

- The public UI still differs on Apps, Products, Downloads, About, Contact, Status, legal, and auth/checkout pages; presence of a React route is not visual or functional parity.
- Owner DB covers all source tables and update endpoints, but bulk deletion and source-specific field forms differ. Live owner-account verification is still needed before production use.
- Admin Create Admin and owner-only user deletion now call their source endpoints. Source confirmation modals and notification styling are replaced by browser confirmation and inline status feedback; no authorized live admin session was available for verification.
- Home download CTA now points to Downloads as stable header does. Downloads page still needs content reconciliation.
- Stable favicon.ico and `site.webmanifest` are restored in `public/` and linked from React's document head; final icon rendering still needs browser verification.
- Existing React CSS is centralized in `src/index.css`, but contains React-specific compatibility rules and a home design system that may no longer be needed after parity work; do not remove until selector usage is checked.
- Responsive comparison has not been performed in a browser at desktop/tablet/mobile sizes. Theme state is implemented, but all-page visual parity under both themes is unverified.
- Build/lint are code-level checks only; real auth/admin/API behavior cannot be fully validated without test credentials and successful backend responses. No credentials or fake API results were introduced.

### Current changes in this repair pass

- Reconstructed the home page from stable source content and section order.
- Implemented the existing key generation API workflow.
- Restored standard admin user editing, order approval/rejection, password change, maintenance toggle, and refresh actions using existing endpoints.
- Added a live owner-probe gate and table workflows to Owner DB. Owner CRUD and key generation are represented but still need live API verification.
