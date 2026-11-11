import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACTIVITY_THROTTLE_MS,
  AUTH_STORAGE_KEY,
  SESSION_TIMEOUT_MS,
  clearStoredSession,
  decodeJwtPayload,
  isSessionExpired,
  loadStoredSession,
  persistCurrentUser,
  persistSessionFromResponse,
  touchStoredSession,
} from '../utils/auth'
import { pingBackend } from '../services/dscApi'

function createMockJwt(payload) {
  const base64Url = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `mockHeader.${base64Url}.mockSignature`
}

describe('Auth & Session Management Utilities', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('correctly decodes standard JWT payload', () => {
    const samplePayload = { sub: '123', name: 'testuser', role: 'User', exp: 1999999999 }
    const token = createMockJwt(samplePayload)

    const decoded = decodeJwtPayload(token)
    expect(decoded).toBeTruthy()
    expect(decoded.role).toBe('User')
    expect(decoded.name).toBe('testuser')
  })

  it('returns null for malformed or empty tokens', () => {
    expect(decodeJwtPayload('')).toBeNull()
    expect(decodeJwtPayload('invalid-token')).toBeNull()
    expect(decodeJwtPayload(null)).toBeNull()
  })

  it('persists and retrieves user session', () => {
    const validToken = createMockJwt({ sub: '1', role: 'User', exp: 1999999999 })
    const userSession = {
      token: validToken,
      role: 'User',
      username: 'testuser',
      plan: 'streamer',
    }

    const saved = persistCurrentUser(userSession)
    expect(saved).toBeTruthy()
    expect(saved.username).toBe('testuser')

    const loaded = loadStoredSession()
    expect(loaded).toBeTruthy()
    expect(loaded.username).toBe('testuser')
    expect(loaded.role).toBe('User')
  })

  it('clears stored session on logout', () => {
    const validToken = createMockJwt({ sub: '2', role: 'Admin', exp: 1999999999 })
    persistCurrentUser({
      token: validToken,
      role: 'Admin',
      username: 'admin1',
    })
    expect(loadStoredSession()).toBeTruthy()

    clearStoredSession()
    expect(loadStoredSession()).toBeNull()
  })

  it('keeps an active user logged in beyond initial login time when activity refreshes lastActivityAt before JWT exp', () => {
    const t0 = 1_700_000_000_000
    // JWT valid for 24 hours from t0
    const jwtExp = Math.floor((t0 + 24 * 60 * 60 * 1000) / 1000)
    const token = createMockJwt({ sub: '10', role: 'User', unique_name: 'active_user', exp: jwtExp })

    persistCurrentUser({
      token,
      role: 'User',
      username: 'active_user',
      loginTime: t0,
      lastActivityAt: t0,
    })

    // User interacts after 6 hours -> lastActivityAt is refreshed to t0 + 6h
    const t6h = t0 + 6 * 60 * 60 * 1000
    const refreshed = touchStoredSession(null, { now: t6h })
    expect(refreshed).toBeTruthy()
    expect(refreshed.lastActivityAt).toBe(t6h)

    // At t0 + 12h (only 6h since last activity, and before 24h JWT exp), user remains logged in
    const t12h = t0 + 12 * 60 * 60 * 1000
    const stillValid = loadStoredSession(t12h)
    expect(stillValid).toBeTruthy()
    expect(stillValid.username).toBe('active_user')
  })

  it('expires an idle user session after 10 hours of inactivity and clears storage', () => {
    const t0 = 1_700_000_000_000
    const jwtExp = Math.floor((t0 + 48 * 60 * 60 * 1000) / 1000)
    const token = createMockJwt({ sub: '11', role: 'User', unique_name: 'idle_user', exp: jwtExp })

    persistCurrentUser({
      token,
      role: 'User',
      username: 'idle_user',
      loginTime: t0,
      lastActivityAt: t0,
    })

    // 10 hours + 1 ms of inactivity
    const afterIdleTimeout = t0 + SESSION_TIMEOUT_MS + 1
    expect(isSessionExpired({ exp: jwtExp }, t0, afterIdleTimeout)).toBe(true)
    expect(loadStoredSession(afterIdleTimeout)).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('always respects JWT expiration (exp) and never extends an expired JWT via user activity', () => {
    const t0 = 1_700_000_000_000
    // JWT expires in 2 hours
    const jwtExp = Math.floor((t0 + 2 * 60 * 60 * 1000) / 1000)
    const token = createMockJwt({ sub: '12', role: 'User', unique_name: 'jwt_exp_user', exp: jwtExp })

    persistCurrentUser({
      token,
      role: 'User',
      username: 'jwt_exp_user',
      loginTime: t0,
      lastActivityAt: t0 + 90 * 60 * 1000, // active 30 mins before JWT exp
    })

    // 1 second after JWT exp (even though idle timeout has NOT elapsed)
    const afterJwtExp = jwtExp * 1000 + 1000
    expect(touchStoredSession(null, { now: afterJwtExp, force: true })).toBeNull()
    expect(loadStoredSession(afterJwtExp)).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('throttles activity updates so continuous events do not write to localStorage on every event', () => {
    const t0 = 1_700_000_000_000
    const jwtExp = Math.floor((t0 + 24 * 60 * 60 * 1000) / 1000)
    const token = createMockJwt({ sub: '13', role: 'User', unique_name: 'throttled_user', exp: jwtExp })

    persistCurrentUser({
      token,
      role: 'User',
      username: 'throttled_user',
      loginTime: t0,
      lastActivityAt: t0,
    })

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Activity 10 seconds later (within 60s ACTIVITY_THROTTLE_MS window) -> should NOT write
    const withinWindow = t0 + 10 * 1000
    const res1 = touchStoredSession(null, { now: withinWindow })
    expect(res1.lastActivityAt).toBe(t0)
    expect(setItemSpy).not.toHaveBeenCalled()

    // Activity after ACTIVITY_THROTTLE_MS -> writes updated timestamp once
    const afterWindow = t0 + ACTIVITY_THROTTLE_MS + 500
    const res2 = touchStoredSession(null, { now: afterWindow })
    expect(res2.lastActivityAt).toBe(afterWindow)
    expect(setItemSpy).toHaveBeenCalledTimes(1)
  })

  it('clears corrupted or incomplete localStorage values safely', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{not-valid-json')
    expect(loadStoredSession()).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username: 'missing_token' }))
    expect(loadStoredSession()).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('ensures background API polling (pingBackend) does not count as user activity or update lastActivityAt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    const t0 = 1_700_000_000_000
    const jwtExp = Math.floor((t0 + 24 * 60 * 60 * 1000) / 1000)
    const token = createMockJwt({ sub: '14', role: 'User', unique_name: 'poll_user', exp: jwtExp })

    persistCurrentUser({
      token,
      role: 'User',
      username: 'poll_user',
      loginTime: t0,
      lastActivityAt: t0,
    })

    await pingBackend()

    const storedAfterPing = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    expect(storedAfterPing.lastActivityAt).toBe(t0)
  })

  it('persists session from API login response with explicit role and metadata', () => {
    const validToken = createMockJwt({ sub: '3', role: 'User', exp: 1999999999 })
    const payload = {
      token: validToken,
      username: 'agent007',
      plan: 'special',
    }

    const session = persistSessionFromResponse(payload, { username: 'agent007', plan: 'special' })
    expect(session).toBeTruthy()
    expect(session.username).toBe('agent007')
    expect(session.plan).toBe('special')
    expect(session.role).toBe('User')
  })
})
