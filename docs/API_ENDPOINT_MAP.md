# Complete API Endpoint Map — Dark Skull Corporation (`DSC3.0`)

**Production Backend Base URL:** `https://dscauth.onrender.com`  
**Configuration Override:** `VITE_API_BASE_URL` (falls back to `https://dscauth.onrender.com` in `src/services/dscApi.js`)

---

## 1. Verified Production Endpoints (`dscauth.onrender.com`)

The endpoints below are verified against the existing `dscauth` production backend and power public status telemetry, Free Panel evaluation, legacy software panel licensing, user authentication, and administrative/owner management.

### 1.1 Public & System Telemetry Endpoints

| Method | Path | Auth | Request Body / Query | Expected Response / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/system-status` | None | None | `{ isMaintenanceMode: boolean, maintenanceReason?: string, showHomeDownloadBtn?: boolean }` |
| `GET` | `/api/public/free-panel` | None | None | `{ freeUser/freeUsername, freePass/freePassword, freeLink, usedSlots, maxSlots }` |

---

### 1.2 Verified User Authentication & Legacy Software Order Endpoints

| Method | Path | Auth | Request Body / Query | Expected Response / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | `{ username, password, HWID: "WEB-CLIENT" }` | `{ token, plan, expiry, mustChangePassword }` |
| `GET` | `/api/auth/my-order` | `Bearer <userJwt>` | None | `{ status, plan, key, expiry, isKeyUsed }` or `404` when no software order exists |
| `POST` | `/api/auth/change-password` | `Bearer <userJwt>` | `{ currentPassword, newPassword }` | `{ message }` |
| `POST` | `/api/auth/checkout` | None | `{ username, discordId, plan, days, amount, utr, screenshotBase64 }` | `{ message, orderId? }` |
| `GET` | `/api/auth/download` | `Bearer <userJwt>` | `?plan=<free\|streamer\|sniper\|special\|aimbot\|premium\|customised>` | `{ url }` (Note: frontend maps `aimassist` → `aimbot`) |

---

### 1.3 Verified Admin Endpoints (`Role: Admin` or `Owner`)

| Method | Path | Auth | Request Body / Query | Expected Response / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | None | `{ username, password }` | `{ token }` |
| `GET` | `/api/admin/users` | `Bearer <adminJwt>` | None | Array of user records or `{ users: [...] }` |
| `GET` | `/api/admin/orders/pending` | `Bearer <adminJwt>` | None | Array of pending checkout orders |
| `POST` | `/api/admin/orders/:orderId/approve` | `Bearer <adminJwt>` | None | Approves order and issues license key |
| `POST` | `/api/admin/orders/:orderId/reject` | `Bearer <adminJwt>` | None | Rejects pending order |
| `POST` | `/api/admin/generate` | `Bearer <adminJwt>` | `{ plan, validDays }` | `{ key }` |
| `PUT` | `/api/admin/users/update` | `Bearer <adminJwt>` | `{ id, userId, plan, expiryTime, isBanned }` | Updates user plan, expiry, and ban status |
| `GET` | `/api/admin/settings/all` | `Bearer <adminJwt>` | None | Global settings object |
| `POST` | `/api/admin/change-password` | `Bearer <adminJwt>` | `{ currentPassword, newPassword }` | Updates administrator password |

---

### 1.4 Verified Owner-Only Endpoints (`Role: Owner`)

Standard administrators receive `HTTP 403 Forbidden` on these endpoints. In `DSC3.0`, `HTTP 403` preserves the active session and surfaces an access-denied notice, whereas `HTTP 401` clears the expired/invalid session and redirects to login.

| Method | Path | Auth | Request Body / Query | Expected Response / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/owner/probe` | `Bearer <ownerJwt>` | None | `200 OK` for Owner; `403 Forbidden` for standard Admin |
| `POST` | `/api/admin/create-admin` | `Bearer <ownerJwt>` | `{ username, password }` | Creates a new standard Admin account |
| `POST` | `/api/admin/maintenance/toggle` | `Bearer <ownerJwt>` | `{ enable: boolean }` | Toggles global maintenance mode |
| `DELETE` | `/api/admin/users/:userId` | `Bearer <ownerJwt>` | None | Deletes user record |
| `POST` | `/api/admin/users/:userId/reset-hwid` | `Bearer <ownerJwt>` | None | Clears bound HWID for user |
| `POST` | `/api/admin/users/:userId/force-reset` | `Bearer <ownerJwt>` | None | Sets `mustChangePassword = true` on user |
| `PUT` | `/api/admin/users/:userId/password` | `Bearer <ownerJwt>` | `{ userId, newPassword }` | Directly assigns a new user password |
| `POST` | `/api/admin/free-panel/sync-user` | `Bearer <ownerJwt>` | `{ username, previousUsername, password, plan: "free", validDays, expiryTime, isBanned }` | Synchronizes the Free Panel user account (falls back to `PUT /api/admin/users/update` + `PUT /api/admin/users/:id/password` on `404/405` for updates/disables) |
| `GET` | `/api/admin/owner/users` | `Bearer <ownerJwt>` | None | OwnerDB `users` table |
| `PUT` | `/api/admin/owner/users/update` | `Bearer <ownerJwt>` | `{ id, userId, plan, expiryTime, isBanned }` | Updates user record in OwnerDB |
| `DELETE` | `/api/admin/owner/users/:id` | `Bearer <ownerJwt>` | None | Deletes user record in OwnerDB |
| `GET` | `/api/admin/owner/keys` | `Bearer <ownerJwt>` | None | OwnerDB `keys` table |
| `PUT` | `/api/admin/owner/keys/update` | `Bearer <ownerJwt>` | `{ id, userId, plan, validDays, isUsed }` | Updates key record |
| `DELETE` | `/api/admin/owner/keys/:id` | `Bearer <ownerJwt>` | None | Deletes key record |
| `GET` | `/api/admin/owner/admins` | `Bearer <ownerJwt>` | None | OwnerDB `admins` table |
| `PUT` | `/api/admin/owner/admins/update` | `Bearer <ownerJwt>` | `{ id, userId, role, isActive }` | Updates admin record |
| `DELETE` | `/api/admin/owner/admins/:id` | `Bearer <ownerJwt>` | None | Deletes admin record |
| `GET` | `/api/admin/owner/orders` | `Bearer <ownerJwt>` | None | OwnerDB `orders` table |
| `PUT` | `/api/admin/owner/orders/update` | `Bearer <ownerJwt>` | `{ id, userId, status }` | Updates order status |
| `DELETE` | `/api/admin/owner/orders/:id` | `Bearer <ownerJwt>` | None | Deletes order record |
| `GET` | `/api/admin/owner/freeusers` | `Bearer <ownerJwt>` | None | OwnerDB `freeusers` table |
| `PUT` | `/api/admin/owner/freeusers/update` | `Bearer <ownerJwt>` | `{ id, userId, Username, HWID, EnvName, CaptchaToken, IsBanned, FailedLoginAttempts }` | Updates Free Panel user telemetry record |
| `DELETE` | `/api/admin/owner/freeusers/:id` | `Bearer <ownerJwt>` | None | Deletes Free Panel user record |
| `GET` | `/api/admin/settings/all` | `Bearer <ownerJwt>` | None | Used by OwnerDB `settings` and `freeSettings` views |
| `PUT` | `/api/admin/settings/update` | `Bearer <ownerJwt>` | Full settings payload (`buildSettingsPayload`) | Persists global system and Free Panel settings |
| `GET` | `/api/admin/updates` | `Bearer <ownerJwt>` | None | OwnerDB `panelUpdates` table |
| `POST` | `/api/admin/updates` | `Bearer <ownerJwt>` | `{ update1, update2, update3, update4 }` | Updates panel changelog slots |

---

## 2. Unverified / Pending Backend Confirmation Endpoints

The following four endpoints are wired in `src/services/dscApi.js` for Software Studio client self-registration, password recovery, and profile maintenance, but **have not yet been confirmed on the live `dscauth.onrender.com` deployment** (the backend source repository is external to `DSC3.0`).

- The frontend sends one clean camelCase JSON payload per endpoint (no duplicate PascalCase/camelCase keys).
- If the backend returns `404`, `405`, `500`, or a network failure, the UI surfaces a clear, honest error message and **never fabricates a fake success state**.

| Method | Path | Status | Auth | Standardized Frontend Request Body | Expected Response Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | **Unverified / Pending Backend Confirmation** | None | `{ fullName, email, username, password, HWID: "WEB-CLIENT" }` | `{ token?, message? }` |
| `POST` | `/api/auth/forgot-password` | **Unverified / Pending Backend Confirmation** | None | `{ email, username }` | `{ message? }` |
| `POST` | `/api/auth/reset-password` | **Unverified / Pending Backend Confirmation** | None | `{ email, token, newPassword }` | `{ message? }` |
| `PUT` | `/api/auth/profile` | **Unverified / Pending Backend Confirmation** | `Bearer <userJwt>` | `{ fullName, email, discordId }` | `{ fullName?, email?, discordId?, message? }` |
