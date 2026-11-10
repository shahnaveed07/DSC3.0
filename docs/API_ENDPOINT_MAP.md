# DSCWeb API Endpoint Mapping & Contract Verification

**Authoritative Backend Reference:** ASP.NET Core 8 Web API (`https://dscauth.onrender.com`)  
**Production Frontend Host:** `https://dscweb.me`  
**Database Architecture:** Entity Framework Core with MySQL / TiDB  
**Authentication Standard:** JSON Web Token (JWT) Bearer Authentication (RFC 6750)  
**Last Updated:** October 2026

---

## 1. Executive Summary & Verification Index

This document establishes the verified communication contracts between the **DSCWeb React frontend** and the **ASP.NET Core 8 backend API**. Every endpoint listed here has been audited against the authoritative backend controllers, request DTOs, response models, role attributes, and legacy runtime behaviors.

### Feature-to-Endpoint Quick Index

| Group | Endpoints | Primary Callers |
|---|---|---|
| **Public & Telemetry** | `GET /api/public/free-panel`<br>`GET /api/admin/system-status` | `FreePanelPage.jsx`<br>`HomePage.jsx`, `DownloadsPage.jsx`, `App.jsx` |
| **Authentication** | `POST /api/auth/login`<br>`POST /api/admin/login`<br>`POST /api/auth/change-password` | `UserLoginPage.jsx`<br>`AdminLoginPage.jsx`<br>`ChangePasswordPage.jsx` |
| **Orders & Client Portal** | `POST /api/auth/checkout`<br>`GET /api/auth/my-order`<br>`GET /api/auth/download?plan={plan}` | `CheckoutPage.jsx`<br>`UserDashboardPage.jsx`<br>`UserDashboardPage.jsx` |
| **Panel Live Updates** | `GET /api/auth/panel-updates`<br>`PUT /api/auth/panel-updates/save` | `AdminWorkspacePage.jsx` (Table: `panelUpdates`) |
| **Admin Dashboard & Licensing** | `GET /api/admin/probe`<br>`GET /api/admin/owner/probe`<br>`GET /api/admin/users`<br>`PUT /api/admin/user/update`<br>`DELETE /api/admin/user/delete/{id}`<br>`POST /api/admin/user/{id}/reset-hwid`<br>`POST /api/admin/user/{id}/force-password-reset`<br>`POST /api/admin/user/{id}/set-password`<br>`POST /api/admin/create-admin`<br>`POST /api/admin/change-password`<br>`POST /api/admin/generate`<br>`POST /api/admin/orders/approve/{id}`<br>`POST /api/admin/orders/reject/{id}` | `SiteHeader.jsx`, `App.jsx`, `AdminDashboardPage.jsx`<br>`AdminDashboardPage.jsx`<br>`AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx`<br>`GenerateKeyPage.jsx` |
| **Owner Database Management** | `GET /api/admin/orders/pending`<br>`GET /api/admin/orders/all`<br>`PUT /api/admin/orders/update`<br>`DELETE /api/admin/orders/delete/{id}`<br>`GET /api/admin/keys`<br>`PUT /api/admin/manage/key`<br>`DELETE /api/admin/manage/key/delete/{id}`<br>`GET /api/admin/manage/admins`<br>`PUT /api/admin/manage/admin`<br>`DELETE /api/admin/manage/admin/delete/{id}`<br>`GET /api/admin/settings/all`<br>`PUT /api/admin/settings/update`<br>`POST /api/admin/maintenance/toggle`<br>`GET /api/admin/free-users`<br>`PUT /api/admin/manage/free-user/update`<br>`DELETE /api/admin/manage/free-user/delete/{id}` | `AdminDashboardPage.jsx`<br>`AdminWorkspacePage.jsx` (All tables)<br>`AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` |

---

## 2. Complete API Endpoint Specification Table

| Feature | HTTP Method | API Path | Backend Location | Authentication | Required Role | Request Contract | Success Response | Error Responses | Frontend Service Function | Frontend Caller Component | Current Status | Required Action / Fix Applied |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Public Free Panel Status** | `GET` | `/api/public/free-panel` | `PublicController.GetFreePanel` | Anonymous / Public | None | **Headers:** `Accept: application/json` | `200 OK`<br>`FreePanelDto` (JSON) | `500 Server Error`<br>`ProblemDetails` | `getFreePanelStatus(signal)` | `FreePanelPage.jsx`, `DownloadsPage.jsx` | **Matched & Remediated** | Removed false offline trigger when optional credentials are omitted by backend. |
| **System Status & Telemetry** | `GET` | `/api/admin/system-status` | `AdminController.GetSystemStatus` | Anonymous / Public (read-only) | None | **Headers:** `Accept: application/json` | `200 OK`<br>`SystemStatusDto` (JSON) | `500 Server Error` | `getSystemStatus(signal)` | `App.jsx` (Maintenance Gate), `HomePage.jsx`, `DownloadsPage.jsx` | **Matched** | Preserved periodic 2-minute background keep-alive ping for Render free instances. |
| **Client Portal User Login** | `POST` | `/api/auth/login` | `AuthController.Login` | Anonymous | None | **Headers:** `Content-Type: application/json`<br>**Body:** `{ username, password, HWID }` | `200 OK`<br>`{ token, username, plan, expiry, mustChangePassword }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden`<br>`429 Too Many Requests` | `loginUser(credentials)` | `UserLoginPage.jsx` | **Matched & Remediated** | Hardened payload (`HWID: 'WEB-CLIENT'`), sanitized errors, added `mustChangePassword` redirection. |
| **Administrative Login** | `POST` | `/api/admin/login` | `AdminController.Login` | Anonymous | None | **Headers:** `Content-Type: application/json`<br>**Body:** `{ username, password }` | `200 OK`<br>`{ token, username, role, isOwner }` | `400 Bad Request`<br>`401 Unauthorized` | `loginAdmin(credentials)` | `AdminLoginPage.jsx` | **Matched** | Enforces minimum username/password checks, prevents submitting blank credentials. |
| **User Change Password** | `POST` | `/api/auth/change-password` | `AuthController.ChangePassword` | JWT Bearer | `User` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ currentPassword, newPassword }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized` | `changePassword(token, cur, next)` | `ChangePasswordPage.jsx` | **Matched & Remediated** | Enforced 6-character minimum; updated session to clear `mustChangePassword` on success. |
| **Checkout Order Submission** | `POST` | `/api/auth/checkout` | `AuthController.Checkout` | Anonymous | None | **Headers:** `Content-Type: application/json`<br>**Body:** `CheckoutOrderDto` | `200 OK`<br>`{ message: string, orderId: number }` | `400 Bad Request`<br>`500 Server Error` | `submitCheckout(order)` | `CheckoutPage.jsx` | **Matched & Remediated** | Enforced min 6-char password; aligned durations to [3, 7, 15, 30, 60, 365]; mapped `aimassist` to `aimbot`. |
| **User Current Order & License** | `GET` | `/api/auth/my-order` | `AuthController.GetMyOrder` | JWT Bearer | `User` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`UserOrderDto` | `401 Unauthorized`<br>`404 Not Found` | `getCurrentOrder(token, signal)` | `UserDashboardPage.jsx` | **Matched** | Used as dashboard telemetry and route guard; handles Pending, Approved, and Rejected states. |
| **Secure Package Download** | `GET` | `/api/auth/download?plan={plan}` | `AuthController.Download` | JWT Bearer | `User` | **Query Param:** `plan` (string)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ url: string }` | `401 Unauthorized`<br>`404 Not Found`<br>`403 Forbidden` | `getSecureDownload(token, plan)` | `UserDashboardPage.jsx` | **Matched & Remediated** | Normalizes plan alias (`aimassist` to `aimbot`) before invoking download route. |
| **Admin General Probe** | `GET` | `/api/admin/probe` | `AdminController.Probe` | JWT Bearer | `Admin` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ status: "ok" }` | `401 Unauthorized`<br>`403 Forbidden` | (Internal fetch / diagnostic) | Diagnostic / Unused directly | **Matched (Optional)** | Available in backend for basic admin authorization verification. |
| **Admin Owner Access Probe** | `GET` | `/api/admin/owner/probe` | `AdminController.OwnerProbe` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ status: "owner" }` | `401 Unauthorized`<br>`403 Forbidden` | `checkOwnerAccess(token)` | `SiteHeader.jsx`, `App.jsx` (OwnerGate), `AdminDashboardPage.jsx` | **Matched** | Distinguishes 403 (standard admin) from 401 (invalid session); guards Owner DB and controls. |
| **Admin Users List** | `GET` | `/api/admin/users` | `AdminController.GetUsers` | JWT Bearer | `Admin` / `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`AdminUserDto[]` | `401 Unauthorized`<br>`403 Forbidden` | `getAdminSnapshot(token)`, `getOwnerTable(token, 'users')` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched** | Normalizes collection whether returned as root array or wrapped under `{ users: [] }`. |
| **Admin Update User Record** | `PUT` | `/api/admin/user/update` | `AdminController.UpdateUser` | JWT Bearer | `Admin` / `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ userId, plan, expiryTime, isBanned }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateAdminUser(token, user)`, `updateOwnerRecord(token, 'users', record)` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched** | Preserves both `id` and `userId` field bindings across C# DTO variations. |
| **Admin Delete User Record** | `DELETE` | `/api/admin/user/delete/{id}` | `AdminController.DeleteUser` | JWT Bearer | `Owner` | **Path Param:** `id` (numeric/string)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ message: string }` | `401 Unauthorized`<br>`403 Forbidden` | `deleteAdminUser(token, id)`, `deleteOwnerRecord(token, 'users', id)` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched** | Guarded by Owner verification; requires explicit user modal confirmation before dispatch. |
| **Admin Reset User HWID** | `POST` | `/api/admin/user/{id}/reset-hwid` | `AdminController.ResetUserHwid` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>`<br>**Body:** `{}` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `resetUserHwid(token, id)` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched & Implemented** | Connected service function and Owner-gated UI actions; refreshes user table on completion. |
| **Admin Force Password Reset** | `POST` | `/api/admin/user/{id}/force-password-reset` | `AdminController.ForcePasswordReset` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>`<br>**Body:** `{}` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `forceUserPasswordReset(token, id)` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched & Implemented** | Connected service function and Owner-gated UI actions; refreshes user table on completion. |
| **Admin Direct Set User Password** | `POST` | `/api/admin/user/{id}/set-password` | `AdminController.SetUserPassword` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ newPassword }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found`<br>`500 Server Error` | `setUserPassword(token, id, newPassword)` | `AdminWorkspacePage.jsx`, `AdminDashboardPage.jsx` | **Matched & Implemented** | Integrated Owner direct password update UI with password match validation, min 6 chars, loading state, error handling, and cleared password fields on success. |
| **Admin Create Admin Account** | `POST` | `/api/admin/create-admin` | `AdminController.CreateAdmin` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ username, password }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `createAdminAccount(token, username, pass)` | `AdminDashboardPage.jsx` | **Matched** | Enforces minimum 6-character password constraint; Owner-only button in header. |
| **Admin Self Change Password** | `POST` | `/api/admin/change-password` | `AdminController.ChangeAdminPassword` | JWT Bearer | `Admin` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ currentPassword, newPassword }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized` | `changeAdminPassword(token, cur, next)` | `AdminDashboardPage.jsx` | **Matched** | Enforces minimum 6-character password constraint; modal in Admin Dashboard. |
| **Admin Key Generation** | `POST` | `/api/admin/generate` | `AdminController.GenerateKey` | JWT Bearer | `Admin` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ plan, validDays }` | `200 OK`<br>`{ key: string }` | `400 Bad Request`<br>`401 Unauthorized` | `generateAdminKey(token, plan, days)` | `GenerateKeyPage.jsx` | **Matched** | Supports official plans `['free', 'streamer', 'sniper', 'special', 'aimbot', 'premium', 'customised']`. |
| **Pending Orders List** | `GET` | `/api/admin/orders/pending` | `AdminController.GetPendingOrders` | JWT Bearer | `Admin` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`OrderDto[]` | `401 Unauthorized` | `getAdminSnapshot(token)` | `AdminDashboardPage.jsx` | **Matched** | Renders pending order review table with proof verification and one-click actions. |
| **All Orders List (Archive)** | `GET` | `/api/admin/orders/all` | `AdminController.GetAllOrders` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`OrderDto[]` | `401 Unauthorized`<br>`403 Forbidden` | `getOwnerTable(token, 'orders')` | `AdminWorkspacePage.jsx` (Table: `orders`) | **Matched** | Searchable and paginated table covering historical approvals, rejections, and amounts. |
| **Order Action (Approve)** | `POST` | `/api/admin/orders/approve/{id}` | `AdminController.ApproveOrder` | JWT Bearer | `Admin` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>`<br>**Body:** `{}` | `200 OK`<br>`{ message: string, key: string }` | `400 Bad Request`<br>`401 Unauthorized` | `processAdminOrder(token, id, 'approve')` | `AdminDashboardPage.jsx` | **Matched** | Issues license key, triggers user account activation, refreshes pending queue. |
| **Order Action (Reject)** | `POST` | `/api/admin/orders/reject/{id}` | `AdminController.RejectOrder` | JWT Bearer | `Admin` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>`<br>**Body:** `{}` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized` | `processAdminOrder(token, id, 'reject')` | `AdminDashboardPage.jsx` | **Matched** | Rejects order, updates status in database, refreshes queue. |
| **Update Order Record** | `PUT` | `/api/admin/orders/update` | `AdminController.UpdateOrder` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ id, status }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'orders', record)` | `AdminWorkspacePage.jsx` (Table: `orders`) | **Matched** | Owner modal editing of order status (`Pending`, `Approved`, `Rejected`). |
| **Delete Order Record** | `DELETE` | `/api/admin/orders/delete/{id}` | `AdminController.DeleteOrder` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ message: string }` | `401 Unauthorized`<br>`403 Forbidden` | `deleteOwnerRecord(token, 'orders', id)` | `AdminWorkspacePage.jsx` (Table: `orders`) | **Matched** | Permanent removal with modal confirmation; supports bulk deletion. |
| **System Settings Query** | `GET` | `/api/admin/settings/all` | `AdminController.GetSettings` | JWT Bearer | `Admin` / `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`SettingsDto` or `SettingsDto[]` | `401 Unauthorized` | `getAdminSnapshot(token)`, `getOwnerTable(token, 'settings')` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched** | Normalizes single object or collection responses via `mapSettingsRecord`. |
| **System Settings Update** | `PUT` | `/api/admin/settings/update` | `AdminController.UpdateSettings` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `SettingsUpdateDto` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'settings', record)` | `AdminWorkspacePage.jsx` (Tables: `settings`, `freeSettings`) | **Matched** | Updates version, download URLs, free panel limits, and homepage download button visibility. |
| **Free Panel User Sync** | `POST` | `/api/admin/free-panel/sync-user` | `AdminController.SyncFreePanelUser` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `SyncFreePanelUserDto` | `200 OK`<br>`{ status: "created" \| "updated" \| "disabled", message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden`<br>`409 Conflict`<br>`500 Server Error` | `syncFreePanelUser(token, syncPayload)` | `AdminWorkspacePage.jsx` (Table: `freeSettings`) | **Matched & Implemented** | Creates, updates, or disables the `Plan = "free"` user in `Users` table with BCrypt-hashed password and calculated expiry after saving Free Panel Settings. |
| **Maintenance Mode Toggle** | `POST` | `/api/admin/maintenance/toggle` | `AdminController.ToggleMaintenance` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ isMaintenanceMode }` | `200 OK`<br>`{ isMaintenanceMode: boolean }` | `401 Unauthorized`<br>`403 Forbidden` | `toggleMaintenance(token, isMaintenance)` | `AdminDashboardPage.jsx`, `AdminWorkspacePage.jsx` | **Matched & Remediated** | Guarded behind `ownerAccess` check; standard admins see read-only badge. |
| **License Keys List** | `GET` | `/api/admin/keys` | `AdminController.GetKeys` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`KeyDto[]` | `401 Unauthorized`<br>`403 Forbidden` | `getOwnerTable(token, 'keys')` | `AdminWorkspacePage.jsx` (Table: `keys`) | **Matched** | Renders key value, plan, valid days, used status, and creation date. |
| **Update License Key** | `PUT` | `/api/admin/manage/key` | `AdminController.UpdateKey` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ id, plan, validDays, isUsed }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'keys', record)` | `AdminWorkspacePage.jsx` (Table: `keys`) | **Matched** | Updates key entitlement parameters; refreshes workspace table. |
| **Delete License Key** | `DELETE` | `/api/admin/manage/key/delete/{id}` | `AdminController.DeleteKey` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ message: string }` | `401 Unauthorized`<br>`403 Forbidden` | `deleteOwnerRecord(token, 'keys', id)` | `AdminWorkspacePage.jsx` (Table: `keys`) | **Matched** | Permanent removal with modal confirmation; supports bulk deletion. |
| **Manage Admins List** | `GET` | `/api/admin/manage/admins` | `AdminController.GetAdmins` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`AdminAccountDto[]` | `401 Unauthorized`<br>`403 Forbidden` | `getOwnerTable(token, 'admins')` | `AdminWorkspacePage.jsx` (Table: `admins`) | **Matched** | Displays username, role (`Admin`, `Owner`), and active status. |
| **Update Admin Account** | `PUT` | `/api/admin/manage/admin` | `AdminController.UpdateAdminAccount` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ id, role, isActive }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'admins', record)` | `AdminWorkspacePage.jsx` (Table: `admins`) | **Matched** | Modifies administrative roles and suspension flags. |
| **Delete Admin Account** | `DELETE` | `/api/admin/manage/admin/delete/{id}` | `AdminController.DeleteAdminAccount` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ message: string }` | `401 Unauthorized`<br>`403 Forbidden` | `deleteOwnerRecord(token, 'admins', id)` | `AdminWorkspacePage.jsx` (Table: `admins`) | **Matched** | Deletes administrator credentials with confirmation safeguard. |
| **Free Users List** | `GET` | `/api/admin/free-users` | `AdminController.GetFreeUsers` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`FreeUserDto[]` | `401 Unauthorized`<br>`403 Forbidden` | `getOwnerTable(token, 'freeusers')` | `AdminWorkspacePage.jsx` (Table: `freeusers`) | **Matched & Remediated** | Displays username, HWID, PC Name / EnvName, ban status, and failed attempts. |
| **Update Free User** | `PUT` | `/api/admin/manage/free-user/update` | `AdminController.UpdateFreeUser` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ id, Username, HWID, EnvName, CaptchaToken, IsBanned, FailedLoginAttempts }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'freeusers', record)` | `AdminWorkspacePage.jsx` (Table: `freeusers`) | **Matched & Remediated** | Payload now sets `EnvName: editForm.captchaToken` as well as `CaptchaToken` for full DTO parity. |
| **Delete Free User** | `DELETE` | `/api/admin/manage/free-user/delete/{id}` | `AdminController.DeleteFreeUser` | JWT Bearer | `Owner` | **Path Param:** `id` (int)<br>**Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`{ message: string }` | `401 Unauthorized`<br>`403 Forbidden` | `deleteOwnerRecord(token, 'freeusers', id)` | `AdminWorkspacePage.jsx` (Table: `freeusers`) | **Matched** | Purges evaluation user record and resets slot count. |
| **Panel Updates Query** | `GET` | `/api/auth/panel-updates` | `AuthController.GetPanelUpdates` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>` | `200 OK`<br>`PanelUpdatesDto` | `401 Unauthorized`<br>`403 Forbidden` | `getOwnerTable(token, 'panelUpdates')` | `AdminWorkspacePage.jsx` (Table: `panelUpdates`) | **Matched** | Loads live software component status strings (Aimbot, Sniper, Bypass, General). |
| **Panel Updates Save** | `PUT` | `/api/auth/panel-updates/save` | `AuthController.SavePanelUpdates` | JWT Bearer | `Owner` | **Headers:** `Authorization: Bearer <token>`<br>**Body:** `{ update1, update2, update3, update4 }` | `200 OK`<br>`{ message: string }` | `400 Bad Request`<br>`401 Unauthorized`<br>`403 Forbidden` | `updateOwnerRecord(token, 'panelUpdates', record)` | `AdminWorkspacePage.jsx` (Table: `panelUpdates`) | **Matched** | Updates status broadcast messages displayed to software panel client binaries. |

---

## 3. Representative JSON Payloads (Real DTO Contracts)

### A. Client Login (`POST /api/auth/login`)
```json
{
  "username": "clientuser",
  "password": "SecretPassword123!",
  "HWID": "WEB-CLIENT"
}
```

**Success Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJjbGllbnR1c2VyIiwicm9sZSI6IlVzZXIiLCJleHAiOjE3Mjk5OTk5OTl9.signature",
  "username": "clientuser",
  "plan": "streamer",
  "expiry": "2026-11-14T12:00:00Z",
  "mustChangePassword": false
}
```

### B. Order Checkout (`POST /api/auth/checkout`)
```json
{
  "Username": "tacticalpilot",
  "PasswordHash": "StrongPass#2026",
  "DiscordId": "tactical#4567",
  "Plan": "aimbot",
  "Days": 30,
  "Amount": "USD 4 (360 INR)",
  "TxnId": "SS_PROOF_ONLY",
  "PaymentProofBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "Order placed successfully. Track it from the login dashboard.",
  "orderId": 542
}
```

### C. Free User Update (`PUT /api/admin/manage/free-user/update`)
```json
{
  "id": 12,
  "userId": 12,
  "Username": "testevaluator",
  "HWID": "BFEBFBFF000906EA",
  "EnvName": "DESKTOP-RIG-01",
  "CaptchaToken": "DESKTOP-RIG-01",
  "IsBanned": false,
  "FailedLoginAttempts": 0
}
```

### D. Owner HWID Reset (`POST /api/admin/user/{id}/reset-hwid`)
- **Headers:** `Authorization: Bearer <jwt_owner_token>`
- **Body:** `{}`

**Success Response (`200 OK`):**
```json
{
  "message": "Hardware ID successfully reset. The user may now bind a new machine on next login."
}
```

### E. Owner Forced Password Reset (`POST /api/admin/user/{id}/force-password-reset`)
- **Headers:** `Authorization: Bearer <jwt_owner_token>`
- **Body:** `{}`

**Success Response (`200 OK`):**
```json
{
  "message": "Password reset enforced. The user will be required to change password upon next login."
}
```

### F. Owner Free Panel User Provisioning (`POST /api/admin/free-panel/sync-user`)
- **Headers:** `Authorization: Bearer <jwt_owner_token>`, `Content-Type: application/json`
- **Body:**
```json
{
  "username": "dsc_free_2026",
  "Username": "dsc_free_2026",
  "previousUsername": "dsc_free_old",
  "PreviousUsername": "dsc_free_old",
  "password": "FreePanelPassword123",
  "Password": "FreePanelPassword123",
  "plan": "free",
  "Plan": "free",
  "validDays": 7,
  "ValidDays": 7,
  "expiryTime": "2026-11-13T12:00:00.000Z",
  "ExpiryTime": "2026-11-13T12:00:00.000Z",
  "isBanned": false,
  "IsBanned": false
}
```

**Success Response (`200 OK`):**
```json
{
  "status": "created",
  "message": "Free Plan user 'dsc_free_2026' created in Users table.",
  "userId": 501
}
```

**ASP.NET Core 8 Controller & DTO Specification (`AdminController.cs`):**
```csharp
public class SyncFreePanelUserDto
{
    public string? Username { get; set; }
    public string? PreviousUsername { get; set; }
    public string? Password { get; set; }
    public string Plan { get; set; } = "free";
    public int ValidDays { get; set; } = 7;
    public DateTime? ExpiryTime { get; set; }
    public bool IsBanned { get; set; } = false;
}

[Authorize(Roles = "Owner")]
[HttpPost("free-panel/sync-user")]
public async Task<IActionResult> SyncFreePanelUser([FromBody] SyncFreePanelUserDto dto)
{
    var targetUsername = (dto.Username ?? string.Empty).Trim();
    var previousUsername = (dto.PreviousUsername ?? string.Empty).Trim();

    // Case 1: Blank username -> Turn Free Panel OFF and disable/expire previous free account
    if (string.IsNullOrEmpty(targetUsername))
    {
        if (!string.IsNullOrEmpty(previousUsername))
        {
            var prevUser = await _db.Users.FirstOrDefaultAsync(
                u => u.Username.ToLower() == previousUsername.ToLower() && u.Plan.ToLower() == "free");
            if (prevUser != null)
            {
                prevUser.IsBanned = true;
                prevUser.ExpiryDate = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
        return Ok(new { status = "disabled", message = "Free Panel user disabled." });
    }

    if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Trim().Length < 6)
        return BadRequest(new { message = "Password must be at least 6 characters long." });

    if (dto.ValidDays < 1)
        return BadRequest(new { message = "ValidDays must be at least 1." });

    var expiryUtc = dto.ExpiryTime?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(dto.ValidDays);
    var existing = await _db.Users.FirstOrDefaultAsync(
        u => u.Username.ToLower() == targetUsername.ToLower());

    // Prevent overwriting paid accounts
    if (existing != null && !string.Equals(existing.Plan, "free", StringComparison.OrdinalIgnoreCase))
    {
        return Conflict(new
        {
            message = $"Cannot use username '{targetUsername}' for Free Panel: it belongs to an existing paid ({existing.Plan}) account."
        });
    }

    // Update existing Plan = "free" user idempotently
    if (existing != null)
    {
        existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password.Trim());
        existing.Plan = "free";
        existing.ExpiryDate = expiryUtc;
        existing.IsBanned = false;
        existing.MustChangePassword = false;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            status = "updated",
            message = $"Existing Free Plan user '{targetUsername}' updated.",
            userId = existing.Id
        });
    }

    // Optionally disable previous free user if username was rotated
    if (!string.IsNullOrEmpty(previousUsername) &&
        !string.Equals(previousUsername, targetUsername, StringComparison.OrdinalIgnoreCase))
    {
        var oldFreeUser = await _db.Users.FirstOrDefaultAsync(
            u => u.Username.ToLower() == previousUsername.ToLower() && u.Plan.ToLower() == "free");
        if (oldFreeUser != null)
        {
            oldFreeUser.IsBanned = true;
            oldFreeUser.ExpiryDate = DateTime.UtcNow;
        }
    }

    // Create new Plan = "free" user in Users table (never store password in KeyValue)
    var newUser = new User
    {
        Username = targetUsername,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password.Trim()),
        Plan = "free",
        ExpiryDate = expiryUtc,
        HWID = string.Empty,
        IsBanned = false,
        MustChangePassword = false
    };

    _db.Users.Add(newUser);
    await _db.SaveChangesAsync();

    return Ok(new
    {
        status = "created",
        message = $"Free Plan user '{targetUsername}' created in Users table.",
        userId = newUser.Id
    });
}
```

---

## 4. Cross-Origin Resource Sharing (CORS) & Network Verification Guide

### Backend Policy Requirements
The backend ASP.NET Core 8 pipeline (`Program.cs`) must define a CORS policy that explicitly permits:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("DscFrontendPolicy", policy =>
    {
        policy.WithOrigins(
            "https://dscweb.me",
            "https://www.dscweb.me",
            "http://localhost:3000",
            "http://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithExposedHeaders("Content-Disposition");
    });
});
```

### Diagnostic Command for OPTIONS Preflight Verification
To verify whether the backend is returning CORS headers before diagnosing frontend code:
```bash
curl -i -X OPTIONS "https://dscauth.onrender.com/api/auth/login" \
  -H "Origin: https://dscweb.me" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Accept"
```
**Expected Response:**
- HTTP `204 No Content` or `200 OK`
- Header: `Access-Control-Allow-Origin: https://dscweb.me`
- Header: `Access-Control-Allow-Methods: POST, OPTIONS`
- Header: `Access-Control-Allow-Headers: Content-Type, Accept`

If the preflight returns HTTP 500 without `Access-Control-Allow-Origin`, the browser reports `Failed to fetch / Response to preflight request doesn't pass access control check`. The frontend API client in `src/services/dscApi.js` catches this safely and informs the user of temporary connection unavailability without crashing or displaying invalid credentials.

