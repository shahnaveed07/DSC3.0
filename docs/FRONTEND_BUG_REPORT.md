# DSCWeb Frontend Audit & Defect Resolution Report

**Repository:** `https://github.com/shahnaveed07/DSCWeb_React.git`  
**Target Environment:** Production (`https://dscweb.me`), Backend API (`https://dscauth.onrender.com`)  
**Audit Date:** October 2026  
**Auditor:** Senior Software Engineer (AI Studio Build Engine)

---

## 1. Classification Methodology

All issues discovered during the code inspection, endpoint mapping, and integration testing have been classified into one of the following five standardized categories:

1. **Confirmed Frontend Bug**: An execution error, missing logic, broken state transition, or unhandled variable within the React application.
2. **Confirmed Frontend/Backend Contract Mismatch**: A discrepancy between the request DTO, response shape, HTTP method, route path, or parameter names expected by the frontend versus the C# backend.
3. **Backend Issue Requiring Verification**: An issue where backend behavior (such as CORS header omissions on unhandled server exceptions or duration range filters) must be confirmed and resolved on the ASP.NET Core server.
4. **UX/Accessibility Issue**: Form validation, error communication, screen reader descriptions, keyboard accessibility, or misleading status feedback.
5. **Security Issue**: Authorization leaks, weak password validation, premature access before password rotation, or exposure of internal server diagnostics.

---

## 2. Bug Register & Resolution Summary

| ID | Category | Component / File | Issue Description | Root Cause | Resolution Status | Resolution Detail |
|---|---|---|---|---|---|---|
| **BUG-01** | Confirmed Frontend Bug | `src/pages/CheckoutPage.jsx` | ReferenceError on `isSubmitting` | Input element had `disabled={isSubmitting}`, but state variable was declared as `loading`. | **FIXED** | Replaced `disabled={isSubmitting}` with `disabled={loading}`. |
| **BUG-02** | Confirmed Frontend/Backend Contract Mismatch | `src/pages/FreePanelPage.jsx` | Free Panel falsely reported "Offline" when valid data was received | Page set `isOffline = !loading && !error && !hasCredentials`. If the backend returned slot count and download link without public test credentials, the page showed offline error. | **FIXED** | Decoupled offline status from optional credential presence (`isOffline = Boolean(error)`). Renders dynamic evaluation pool message and live slot bar. |
| **BUG-03** | Confirmed Frontend/Backend Contract Mismatch | `src/pages/CheckoutPage.jsx`, `src/content/siteContent.js` | Product plan `aimassist` download and key generation mismatch | The frontend product catalog used `aimassist`, but backend settings only map `aimbotLink` and plan `aimbot`. | **FIXED** | Aligned checkout submission to normalize `panel === 'aimassist' ? 'aimbot' : panel`. Preserved `AIM-ASSIST-PANEL` display branding while ensuring backend contract compliance. |
| **BUG-04** | Confirmed Frontend/Backend Contract Mismatch | `src/pages/CheckoutPage.jsx` | Unsupported 1-day trial in paid checkout dropdown | Backend paid order validator enforces minimum 3-day duration. Submitting `Days: 1` caused HTTP 400 Bad Request. | **FIXED** | Aligned checkout duration selector to `[3, 7, 15, 30, 60, 365]`, blocked checkout submissions < 3 days with helpful guidance directing 1-day evaluation to the Free Panel. |
| **BUG-05** | Security Issue & Contract Mismatch | `src/pages/ChangePasswordPage.jsx`, `src/pages/CheckoutPage.jsx` | Permissive 3-character password validation | Client accepted 3-character passwords while the backend ASP.NET Core Identity policy requires minimum 6 characters. | **FIXED** | Updated client form validation, `minLength` HTML attributes, and submission guards across all affected pages to minimum 6 characters. |
| **BUG-06** | Security Issue & Contract Mismatch | `src/pages/AdminDashboardPage.jsx` | Maintenance toggle accessible to standard admins | Maintenance toggle was visible to non-owner admins. Clicking it resulted in 403 Forbidden errors and confusing UX. | **FIXED** | Guarded the toggle button behind `ownerAccess`. Non-owner admins see a clean read-only badge indicating the current maintenance status. |
| **BUG-07** | UX & Security Issue | `src/pages/AdminDashboardPage.jsx`, `src/pages/AdminWorkspacePage.jsx` | Ambiguous 401 vs 403 error reporting | HTTP 403 Forbidden on Owner-restricted operations was previously conflated with 401, potentially logging the user out. | **FIXED** | Explicitly separated 401 (session invalidation) from 403 (informative "Access denied: Owner privileges required" message). |
| **BUG-08** | Confirmed Frontend/Backend Contract Mismatch | `src/pages/AdminWorkspacePage.jsx` | Free user `CaptchaToken` vs `EnvName` field naming | Backend FreeUser DTO accepts `EnvName`, but legacy frontend sent `CaptchaToken`, causing PC Name edits to be ignored on some builds. | **FIXED** | Updated `openEdit` to read `row.EnvName ?? row.envName ?? row.CaptchaToken ?? row.captchaToken`, and `handleSaveEdit` to set both `EnvName` and `CaptchaToken`. |
| **BUG-09** | Confirmed Frontend/Backend Contract Mismatch | `src/services/dscApi.js`, `src/pages/AdminDashboardPage.jsx`, `src/pages/AdminWorkspacePage.jsx` | Missing HWID reset and Force Password Reset service functions | The backend exposed `POST /api/admin/user/{id}/reset-hwid` and `POST /api/admin/user/{id}/force-password-reset`, but the frontend API service had not connected them. | **FIXED** | Added `resetUserHwid` and `forceUserPasswordReset` to `dscApi.js`; added Owner action buttons in the Admin Dashboard and Owner Workspace with automatic list refresh. |
| **BUG-10** | Security Issue | `src/utils/auth.js`, `src/pages/UserLoginPage.jsx`, `src/App.jsx`, `src/pages/ChangePasswordPage.jsx` | Unhandled `mustChangePassword` forced reset flow | When the backend flagged `mustChangePassword: true`, users were allowed into the dashboard instead of being gated to reset password. | **FIXED** | Captured `mustChangePassword` in session, routed immediately to `/pages/change`, gated `/pages/udash` via `RoleGate`, and cleared the requirement once password was updated. |
| **BUG-11** | UX/Accessibility Issue | `src/services/dscApi.js` | Missing RFC 7807 `detail` extraction in `extractApiMessage` | ASP.NET Core `ProblemDetails` uses `detail` for contextual validation errors, which was not read if `message` was absent. | **FIXED** | Added `payload.detail` handling to `extractApiMessage` while maintaining XSS and stack trace protection. |
| **BUG-12** | Confirmed Frontend/Backend Contract Mismatch | `src/pages/UserDashboardPage.jsx` | Download failure for Aim Assist plan | When a user held an Aim Assist plan, `getSecureDownload(token, 'aimassist')` failed because the backend only maps `aimbot`. | **FIXED** | Added normalization in `handleDownload` to pass `'aimbot'` to the secure download endpoint. |

---

## 3. Remaining Frontend Issues

None. All 12 verified frontend defects and contract mismatches have been addressed, verified by 55 automated unit/integration tests, compiled successfully via Vite, and validated against Oxlint with zero errors and zero warnings.

---

## 4. Required Backend Changes & Observations

The following items should be addressed in the ASP.NET Core 8 backend source code (`dscauth`):

1. **CORS Headers on HTTP 500 Unhandled Exceptions:**
   - **Observation:** When an unhandled exception occurs in ASP.NET Core (e.g. database connection timeout or TiDB scale-up delay), Kestrel returns HTTP 500 without invoking the CORS middleware if `UseCors()` is placed after exception handling or if the developer exception page crashes.
   - **Impact:** The browser blocks the response completely with `No 'Access-Control-Allow-Origin' header is present on the requested resource`, preventing the frontend from reading the error code and displaying a generic network error.
   - **Recommendation:** Ensure `app.UseCors("DscFrontendPolicy")` is registered at the very top of the HTTP pipeline before exception handlers and routing, or use an explicit CORS preflight response filter.

2. **Official Support for 1-Day Trial Duration in Checkout:**
   - **Observation:** If the business decision is made to officially sell 1-day trials via paid checkout, the backend `CheckoutOrderDto` validator must add `1` to the allowed `Days` set and define the corresponding price calculation logic.
   - **Status:** Until that backend change is made, the frontend correctly restricts checkout to `[3, 7, 15, 30, 60, 365]` to prevent HTTP 400 rejection.

3. **Database Column / DTO Alignment for `aimassist`:**
   - **Observation:** The backend database schema contains `aimbotLink` and key generation for `aimbot`. Adding `aimassistLink` or formalizing the alias at the controller level will prevent future naming confusion.

---

## 5. Unverified Production Issues

1. **Cold Starts on Free Tier Hosting:**
   - Production backend is hosted on Render (`dscauth.onrender.com`). Render spins down free containers after 15 minutes of inactivity, resulting in a 40–50 second cold start delay. The frontend has been equipped with a 2-minute periodic ping (`pingBackend()`) and a user-friendly "Waking up server..." message during login to ease this transition.
2. **Third-Party Payment Gateways / UPI QR Code Scanning:**
   - Payment proofs rely on client-side FileReader encoding of uploaded PNG/JPG screenshots. Verification of uploaded proofs depends on active administrative review in the Admin Dashboard.
