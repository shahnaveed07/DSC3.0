export const AUTH_STORAGE_KEY = 'dscweb.current-session'
export const SESSION_TIMEOUT_MS = 10 * 60 * 60 * 1000
export const ACTIVITY_THROTTLE_MS = 60 * 1000
const ROLE_KEYS = [
  'role',
  'roles',
  'Role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
]
const USERNAME_KEYS = [
  'unique_name',
  'preferred_username',
  'name',
  'sub',
  'username',
  'Username',
]
const EMAIL_KEYS = [
  'email',
  'Email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
]
const FULL_NAME_KEYS = [
  'fullName',
  'FullName',
  'given_name',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
]

function readStorage() {
  try {
    return window.localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStorage(value) {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage failures; the app should still function for the session.
  }
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
    return JSON.parse(window.atob(padded))
  } catch {
    return null
  }
}

function readClaimValue(claims, keys) {
  if (!claims) return null

  for (const key of keys) {
    const value = claims[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (Array.isArray(value) && value.length > 0) return value[0]
  }

  return null
}

export function normalizeRole(rawRole) {
  const value = String(rawRole || '').trim().toLowerCase()
  if (!value) return null
  if (['admin', 'owner', 'superadmin', 'super-admin'].includes(value)) {
    return 'Admin'
  }
  if (['user', 'member', 'customer'].includes(value)) {
    return 'User'
  }
  return null
}

export function getRoleFromClaims(claims) {
  return normalizeRole(readClaimValue(claims, ROLE_KEYS))
}

export function getUsernameFromClaims(claims) {
  return String(readClaimValue(claims, USERNAME_KEYS) || '').trim()
}

export function getEmailFromClaims(claims) {
  return String(readClaimValue(claims, EMAIL_KEYS) || '').trim()
}

export function getFullNameFromClaims(claims) {
  return String(readClaimValue(claims, FULL_NAME_KEYS) || '').trim()
}

function isExpired(claims, lastActivityAt, now = Date.now()) {
  if (claims?.exp && Number(claims.exp) * 1000 <= now) return true
  if (lastActivityAt && now - Number(lastActivityAt) > SESSION_TIMEOUT_MS) {
    return true
  }
  return false
}

export function isSessionExpired(claims, lastActivityAt, now = Date.now()) {
  return isExpired(claims, lastActivityAt, now)
}

export function persistCurrentUser(session) {
  if (!session) return null
  const now = Date.now()
  const completeSession = {
    ...session,
    loginTime: session.loginTime || now,
    lastActivityAt: session.lastActivityAt || now,
  }
  writeStorage(completeSession)
  return completeSession
}

export function loadStoredSession(now = Date.now()) {
  try {
    const raw = readStorage()
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (!stored || typeof stored !== 'object' || !stored.token) {
      clearStoredSession()
      return null
    }

    const claims = decodeJwtPayload(stored.token)
    const role = getRoleFromClaims(claims)

    if (!claims || !role || isExpired(claims, stored.lastActivityAt, now)) {
      clearStoredSession()
      return null
    }

    return {
      ...stored,
      role,
      username: String(
        stored.username || getUsernameFromClaims(claims) || '',
      ).trim(),
      email: String(
        stored.email || getEmailFromClaims(claims) || '',
      ).trim(),
      fullName: String(
        stored.fullName || getFullNameFromClaims(claims) || '',
      ).trim(),
    }
  } catch {
    clearStoredSession()
    return null
  }
}

/**
 * Refreshes `lastActivityAt` on meaningful user interaction.
 * - Always respects JWT `exp` (never extends token expiration).
 * - Clears stored session and returns `null` if JWT `exp` or idle timeout (`SESSION_TIMEOUT_MS`) has already elapsed.
 * - Throttles writes to `localStorage` (`ACTIVITY_THROTTLE_MS`) unless `{ force: true }` is specified.
 */
export function touchStoredSession(session = null, options = {}) {
  const now = typeof options.now === 'number' ? options.now : Date.now()
  const throttleMs =
    typeof options.throttleMs === 'number' ? options.throttleMs : ACTIVITY_THROTTLE_MS
  const force = Boolean(options.force)

  const stored = loadStoredSession(now)
  const activeSession = stored || session
  if (!activeSession?.token) {
    clearStoredSession()
    return null
  }

  const claims = decodeJwtPayload(activeSession.token)
  const role = getRoleFromClaims(claims)
  if (!claims || !role || isExpired(claims, activeSession.lastActivityAt, now)) {
    clearStoredSession()
    return null
  }

  const prevActivity = Number(activeSession.lastActivityAt || 0)
  if (!force && prevActivity > 0 && now - prevActivity < throttleMs) {
    return activeSession
  }

  const next = {
    ...activeSession,
    role,
    lastActivityAt: now,
  }
  writeStorage(next)
  return next
}

export function persistSessionFromResponse(payload, extra = {}) {
  const token = String(
    payload?.token || payload?.Token || payload?.jwt || payload?.accessToken || '',
  ).trim()
  const claims = decodeJwtPayload(token)
  const role = getRoleFromClaims(claims)
  const now = Date.now()

  if (!token || !claims || !role || isExpired(claims, now, now)) {
    clearStoredSession()
    return null
  }
  const session = {
    token,
    role,
    username: String(
      payload?.username ||
        payload?.Username ||
        extra.username ||
        getUsernameFromClaims(claims) ||
        '',
    ).trim(),
    email: String(
      payload?.email ||
        payload?.Email ||
        extra.email ||
        getEmailFromClaims(claims) ||
        '',
    ).trim(),
    fullName: String(
      payload?.fullName ||
        payload?.FullName ||
        extra.fullName ||
        getFullNameFromClaims(claims) ||
        '',
    ).trim(),
    discordId: String(
      payload?.discordId ||
        payload?.DiscordId ||
        extra.discordId ||
        '',
    ).trim(),
    plan: String(payload?.plan || payload?.Plan || extra.plan || '').trim(),
    expiry:
      payload?.expiry ||
      payload?.Expiry ||
      payload?.expiryTime ||
      payload?.ExpiryTime ||
      extra.expiry ||
      null,
    mustChangePassword: Boolean(
      payload?.mustChangePassword ||
      payload?.MustChangePassword ||
      payload?.must_change_password ||
      claims?.mustChangePassword ||
      claims?.must_change_password ||
      extra.mustChangePassword
    ),
    isOwner: Boolean(extra.isOwner || payload?.isOwner),
    loginTime: Number(extra.loginTime) || now,
    lastActivityAt: now,
  }

  writeStorage(session)
  return session
}

export function updateStoredSession(partial) {
  const current = loadStoredSession()
  if (!current) return null
  // Never allow client-side partial updates to overwrite role, token, or isOwner
  const safePartial = { ...partial }
  delete safePartial.role
  delete safePartial.token
  delete safePartial.isOwner

  const updated = {
    ...current,
    ...safePartial,
    lastActivityAt: Date.now(),
  }
  writeStorage(updated)
  return updated
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Validates and sanitizes an post-login / post-registration redirect path.
 * Blocks external URLs, protocol-relative URLs, and administrative routes for user flows.
 */
export function getSafeRedirectPath(rawPath, defaultPath = '/pages/udash') {
  if (!rawPath || typeof rawPath !== 'string') return defaultPath
  const trimmed = rawPath.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultPath
  }
  if (/^\/pages\/(alogin|adash|ownerdb|generatekey)/i.test(trimmed)) {
    return defaultPath
  }
  if (/^\/(login|register|forgot-password|pages\/ulogin|pages\/register|pages\/forgot-password)/i.test(trimmed)) {
    return defaultPath
  }
  return trimmed
}

/**
 * Pure validation helper for DSC Account Registration.
 */
export function validateRegistrationInput({
  fullName = '',
  email = '',
  username = '',
  password = '',
  confirmPassword = '',
} = {}) {
  const errors = {
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  }

  const cleanName = String(fullName || '').trim()
  const cleanEmail = String(email || '').trim()
  const cleanUsername = String(username || '').trim()
  const rawPassword = String(password || '')
  const rawConfirm = String(confirmPassword || '')

  if (!cleanName) {
    errors.fullName = 'Full name is required.'
  } else if (cleanName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }

  if (!cleanEmail) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!cleanUsername) {
    errors.username = 'Username is required.'
  } else if (cleanUsername.length < 3 || cleanUsername.length > 32) {
    errors.username = 'Username must be between 3 and 32 characters.'
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    errors.username = 'Username may only contain letters, numbers, dots, hyphens, and underscores.'
  }

  if (!rawPassword) {
    errors.password = 'Password is required.'
  } else if (rawPassword.length < 6) {
    errors.password = 'Password must be at least 6 characters long.'
  }

  if (!rawConfirm) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (rawPassword && rawConfirm !== rawPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  const isValid = !Object.values(errors).some(Boolean)
  const cleaned = {
    fullName: cleanName,
    email: cleanEmail.toLowerCase(),
    username: cleanUsername.toLowerCase(),
    password: rawPassword,
  }
  return {
    isValid,
    errors,
    cleaned,
    sanitized: cleaned,
  }
}
