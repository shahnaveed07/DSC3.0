import { authHeader } from '../utils/auth'
import { normalizeCollection } from '../utils/format'

export const DEFAULT_API_BASE_URL = 'https://dscauth.onrender.com'

export function getApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim()
  const base = configured || DEFAULT_API_BASE_URL
  return base.replace(/\/+$/, '')
}

export function buildUrl(path) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${cleanPath}`
}

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = details.status ?? 0
    this.payload = details.payload ?? null
    this.isNetworkError = Boolean(details.isNetworkError)
    this.isCorsError = Boolean(details.isCorsError)
  }
}

async function readPayload(response) {
  const contentType = String(response.headers?.get('content-type') || '').toLowerCase()
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return {}
    }
  }

  try {
    return await response.text()
  } catch {
    return ''
  }
}

export function extractApiMessage(payload, fallbackMessage = 'An unexpected error occurred.') {
  if (!payload) return fallbackMessage

  // ASP.NET Core 8 ValidationProblemDetails / ProblemDetails dictionary
  // e.g. { errors: { Username: ["Username is required"], Password: ["Password is required"] } }
  if (payload && typeof payload === 'object' && payload.errors && typeof payload.errors === 'object') {
    const errorStrings = Object.values(payload.errors)
      .flat()
      .filter((msg) => typeof msg === 'string' && msg.trim())
    if (errorStrings.length > 0) {
      return errorStrings.join(' ')
    }
  }

  let candidate = ''
  if (typeof payload === 'string') {
    candidate = payload
  } else if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string') {
      candidate = payload.message
    } else if (typeof payload.detail === 'string') {
      candidate = payload.detail
    } else if (typeof payload.error === 'string') {
      candidate = payload.error
    } else if (typeof payload.title === 'string') {
      candidate = payload.title
    }
  }

  candidate = candidate.trim()

  // Guard: Never expose raw HTML error pages (e.g. cloud gateway 502s) or backend stack traces
  if (
    !candidate ||
    candidate.startsWith('<!DOCTYPE') ||
    candidate.startsWith('<html') ||
    /Exception:|Stack Trace:|SqlException|at System\.|Microsoft\.AspNetCore/i.test(candidate)
  ) {
    return fallbackMessage
  }

  return candidate
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    signal,
  } = options

  const mergedHeaders = {
    Accept: 'application/json',
    ...authHeader(token),
    ...headers,
  }

  const requestInit = {
    method,
    headers: mergedHeaders,
    cache: 'no-store',
    signal,
  }

  if (body !== undefined) {
    mergedHeaders['Content-Type'] = 'application/json'
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(buildUrl(path), requestInit)
  } catch (networkOrCorsError) {
    if (networkOrCorsError?.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', {
        status: 408,
        payload: null,
      })
    }

    // Safe diagnostic logging for developers without exposing passwords or sensitive tokens
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        `[DSC API] Connection failed for ${method} ${path}. This can occur due to network unavailability, backend cold starts, or backend CORS misconfiguration (e.g., HTTP 500 without CORS headers).`
      )
    }

    throw new ApiError(
      'Unable to connect to the authentication server. Please verify your connection or try again shortly.',
      {
        status: 0,
        isNetworkError: true,
        payload: null,
      }
    )
  }

  const payload = await readPayload(response)

  if (!response.ok) {
    let fallback = 'Request failed.'
    if (response.status === 400) {
      fallback = 'Invalid request. Please check your input.'
    } else if (response.status === 401) {
      fallback = 'Invalid credentials. Please verify your username and password.'
    } else if (response.status === 403) {
      fallback = 'Access denied. You do not have permission to access this resource.'
    } else if (response.status === 404) {
      fallback = 'The requested resource was not found.'
    } else if (response.status === 409) {
      fallback = 'An account with this email or username already exists.'
    } else if (response.status === 429) {
      fallback = 'Too many requests. Please wait a moment before trying again.'
    } else if (response.status >= 500) {
      fallback = 'The server encountered an internal error. Please try again shortly.'
    }

    // For 500+ errors, never expose backend stack traces or internal implementation details
    const finalMessage = response.status >= 500 ? fallback : extractApiMessage(payload, fallback)

    throw new ApiError(finalMessage, {
      status: response.status,
      payload,
    })
  }

  return payload
}

export function isAuthError(error) {
  return error instanceof ApiError && error.status === 401
}

export function isForbiddenError(error) {
  return error instanceof ApiError && error.status === 403
}

export function getSystemStatus(signal) {
  return request('/api/admin/system-status', { signal })
}

export function getFreePanelStatus(signal) {
  return request('/api/public/free-panel', { signal })
}

export function pingBackend() {
  return request('/api/public/free-panel').catch(() => {})
}

export function loginUser(credentials) {
  const username = String(credentials?.username || '').trim().toLowerCase()
  const password = String(credentials?.password || '')

  return request('/api/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
      HWID: 'WEB-CLIENT',
    },
  })
}

/**
 * Registers a DSC client account.
 * Contract status: Unverified / Pending Backend Confirmation on dscauth.onrender.com.
 */
export function registerUser(accountData) {
  const fullName = String(accountData?.fullName || '').trim()
  const email = String(accountData?.email || '').trim().toLowerCase()
  const username = String(accountData?.username || '').trim().toLowerCase()
  const password = String(accountData?.password || '')

  return request('/api/auth/register', {
    method: 'POST',
    body: {
      fullName,
      email,
      username,
      password,
      HWID: 'WEB-CLIENT',
    },
  })
}

/**
 * Requests password recovery instructions/token for a DSC account.
 * Contract status: Unverified / Pending Backend Confirmation on dscauth.onrender.com.
 */
export function requestPasswordRecovery(recoveryData) {
  const identifier = String(recoveryData?.email || recoveryData?.identifier || '').trim()

  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: {
      email: identifier,
      username: identifier.toLowerCase(),
    },
  })
}

/**
 * Completes a password reset with a recovery token and new password.
 * Contract status: Unverified / Pending Backend Confirmation on dscauth.onrender.com.
 */
export function confirmPasswordReset(resetData) {
  const identifier = String(resetData?.email || resetData?.identifier || '').trim()
  const token = String(resetData?.token || '').trim()
  const newPassword = String(resetData?.newPassword || '')

  return request('/api/auth/reset-password', {
    method: 'POST',
    body: {
      email: identifier,
      token,
      newPassword,
    },
  })
}

/**
 * Updates basic client account profile details.
 * Contract status: Unverified / Pending Backend Confirmation on dscauth.onrender.com.
 */
export function updateUserProfile(token, profile) {
  const fullName = String(profile?.fullName || '').trim()
  const email = String(profile?.email || '').trim().toLowerCase()
  const discordId = String(profile?.discordId || '').trim()

  return request('/api/auth/profile', {
    method: 'PUT',
    token,
    body: {
      fullName,
      email,
      discordId,
    },
  })
}

export function loginAdmin(credentials) {
  const username = String(credentials?.username || '').trim().toLowerCase()
  const password = String(credentials?.password || '')

  return request('/api/admin/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  })
}

export function getCurrentOrder(token, signal) {
  return request('/api/auth/my-order', { token, signal })
}

export function changePassword(token, currentPassword, newPassword) {
  return request('/api/auth/change-password', {
    method: 'POST',
    token,
    body: { currentPassword, newPassword },
  })
}

export function submitCheckout(order) {
  return request('/api/auth/checkout', {
    method: 'POST',
    body: order,
  })
}

export function getSecureDownload(token, plan) {
  return request(`/api/auth/download?plan=${encodeURIComponent(plan)}`, {
    token,
  })
}

export async function getAdminSnapshot(token) {
  const [users, orders, settings, ownerAccess] = await Promise.allSettled([
    request('/api/admin/users', { token }),
    request('/api/admin/orders/pending', { token }),
    request('/api/admin/settings/all', { token }),
    request('/api/admin/owner/probe', { token }),
  ])

  const authFailure = [users, orders, settings].find(
    (entry) => entry.status === 'rejected' && isAuthError(entry.reason),
  )
  if (authFailure) {
    throw authFailure.reason
  }

  const criticalFailures = [users, orders, settings].filter(
    (entry) => entry.status === 'rejected',
  )
  if (criticalFailures.length === 3) {
    throw criticalFailures[0].reason
  }

  return {
    users,
    orders,
    settings,
    ownerAccess,
  }
}

export function generateAdminKey(token, plan, validDays) {
  return request('/api/admin/generate', {
    method: 'POST',
    token,
    body: { plan, validDays },
  })
}

export function updateAdminUser(token, user) {
  return request('/api/admin/user/update', { method: 'PUT', token, body: user })
}

export function deleteAdminUser(token, id) {
  return request(`/api/admin/user/delete/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

export function resetUserHwid(token, id) {
  return request(`/api/admin/user/${encodeURIComponent(id)}/reset-hwid`, {
    method: 'POST',
    token,
    body: {},
  })
}

export function forceUserPasswordReset(token, id) {
  return request(`/api/admin/user/${encodeURIComponent(id)}/force-password-reset`, {
    method: 'POST',
    token,
    body: {},
  })
}

export function setUserPassword(token, id, newPassword) {
  return request(`/api/admin/user/${encodeURIComponent(id)}/set-password`, {
    method: 'POST',
    token,
    body: { newPassword },
  })
}

export function processAdminOrder(token, id, action) {
  return request(`/api/admin/orders/${action}/${encodeURIComponent(id)}`, {
    method: 'POST',
    token,
    body: {},
  })
}

export function createAdminAccount(token, username, password) {
  return request('/api/admin/create-admin', {
    method: 'POST',
    token,
    body: { username, password },
  })
}

export function changeAdminPassword(token, currentPassword, newPassword) {
  return request('/api/admin/change-password', {
    method: 'POST',
    token,
    body: { currentPassword, newPassword },
  })
}

export function toggleMaintenance(token, isMaintenanceMode) {
  return request('/api/admin/maintenance/toggle', {
    method: 'POST',
    token,
    body: { isMaintenanceMode, IsMaintenanceMode: isMaintenanceMode },
  })
}

export async function checkOwnerAccess(token) {
  try {
    await request('/api/admin/owner/probe', { token })
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return false
    throw error
  }
}

const ownerTables = {
  users: '/api/admin/users',
  keys: '/api/admin/keys',
  admins: '/api/admin/manage/admins',
  orders: '/api/admin/orders/all',
  settings: '/api/admin/settings/all',
  freeSettings: '/api/admin/settings/all',
  freeusers: '/api/admin/free-users',
  panelUpdates: '/api/auth/panel-updates',
}

export function getOwnerTable(token, table) {
  return request(ownerTables[table], { token })
}

export function updateOwnerRecord(token, table, record) {
  const configs = {
    users: ['/api/admin/user/update', 'PUT'],
    keys: ['/api/admin/manage/key', 'PUT'],
    admins: ['/api/admin/manage/admin', 'PUT'],
    orders: ['/api/admin/orders/update', 'PUT'],
    settings: ['/api/admin/settings/update', 'PUT'],
    freeSettings: ['/api/admin/settings/update', 'PUT'],
    freeusers: ['/api/admin/manage/free-user/update', 'PUT'],
    panelUpdates: ['/api/auth/panel-updates/save', 'PUT'],
  }
  const [path, method] = configs[table]
  return request(path, { method, token, body: record })
}

export function syncFreePanelUser(token, syncPayload) {
  const username = String(syncPayload?.username ?? '').trim()
  const previousUsername = String(syncPayload?.previousUsername ?? '').trim()
  const password = String(syncPayload?.password ?? '')
  const validDays = Number(syncPayload?.validDays) || 30
  const expiryTime =
    syncPayload?.expiryTime ?? new Date(Date.now() + validDays * 86400000).toISOString()
  const isBanned = Boolean(syncPayload?.isBanned)

  return request('/api/admin/free-panel/sync-user', {
    method: 'POST',
    token,
    body: {
      username,
      Username: username,
      previousUsername,
      PreviousUsername: previousUsername,
      password,
      Password: password,
      plan: 'free',
      Plan: 'free',
      validDays,
      ValidDays: validDays,
      expiryTime,
      ExpiryTime: expiryTime,
      isBanned,
      IsBanned: isBanned,
    },
  })
}

export function deleteOwnerRecord(token, table, id) {
  const paths = {
    users: `/api/admin/user/delete/${encodeURIComponent(id)}`,
    keys: `/api/admin/manage/key/delete/${encodeURIComponent(id)}`,
    admins: `/api/admin/manage/admin/delete/${encodeURIComponent(id)}`,
    orders: `/api/admin/orders/delete/${encodeURIComponent(id)}`,
    freeusers: `/api/admin/manage/free-user/delete/${encodeURIComponent(id)}`,
  }
  if (!paths[table]) throw new Error('Delete is unavailable for this table.')
  return request(paths[table], { method: 'DELETE', token })
}

export function mapAdminUsers(payload) {
  return normalizeCollection(payload, ['users', 'Users'])
}

export function mapPendingOrders(payload) {
  return normalizeCollection(payload, ['orders', 'Orders', 'pendingOrders'])
}

export function mapSettingsRecord(payload) {
  if (Array.isArray(payload)) return payload[0] || {}
  if (Array.isArray(payload?.settings)) return payload.settings[0] || {}
  if (Array.isArray(payload?.Settings)) return payload.Settings[0] || {}
  if (payload?.data && typeof payload.data === 'object') return payload.data
  return payload || {}
}

const API_BASE_URL = getApiBaseUrl()
export { API_BASE_URL }
