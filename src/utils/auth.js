const AUTH_STORAGE_KEY = 'dscweb.current-session'
const SESSION_TIMEOUT_MS = 10 * 60 * 60 * 1000
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

function isExpired(claims, lastActivityAt) {
  if (claims?.exp && Number(claims.exp) * 1000 <= Date.now()) return true
  if (lastActivityAt && Date.now() - Number(lastActivityAt) > SESSION_TIMEOUT_MS) {
    return true
  }
  return false
}

export function isSessionExpired(claims, lastActivityAt) {
  return isExpired(claims, lastActivityAt)
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

export function loadStoredSession() {
  try {
    const raw = readStorage()
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (!stored?.token) return null

    const claims = decodeJwtPayload(stored.token)
    const role = getRoleFromClaims(claims)

    if (!claims || !role || isExpired(claims, stored.lastActivityAt)) {
      clearStoredSession()
      return null
    }

    return {
      ...stored,
      role,
      username: String(
        stored.username || getUsernameFromClaims(claims) || '',
      ).trim(),
    }
  } catch {
    clearStoredSession()
    return null
  }
}

export function touchStoredSession(session = null) {
  const activeSession = session || loadStoredSession()
  if (!activeSession?.token) return null

  const next = {
    ...activeSession,
    lastActivityAt: Date.now(),
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

  if (!token || !claims || !role) {
    clearStoredSession()
    return null
  }

  const now = Date.now()
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
  const updated = {
    ...current,
    ...partial,
    lastActivityAt: Date.now(),
  }
  writeStorage(updated)
  return updated
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}
