import { describe, expect, it, beforeEach } from 'vitest'
import {
  clearStoredSession,
  decodeJwtPayload,
  isSessionExpired,
  loadStoredSession,
  persistCurrentUser,
  persistSessionFromResponse,
} from '../utils/auth'

function createMockJwt(payload) {
  const base64Url = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `mockHeader.${base64Url}.mockSignature`
}

describe('Auth Utilities', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
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

  it('detects expired sessions correctly', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour ahead

    expect(isSessionExpired({ exp: pastExp })).toBe(true)
    expect(isSessionExpired({ exp: futureExp })).toBe(false)
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
