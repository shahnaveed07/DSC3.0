import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  API_BASE_URL,
  ApiError,
  checkOwnerAccess,
  confirmPasswordReset,
  extractApiMessage,
  getAdminSnapshot,
  isAuthError,
  isForbiddenError,
  registerUser,
  requestPasswordRecovery,
  updateUserProfile,
} from '../services/dscApi'

describe('API Service Contracts & HTTP 401 / 403 Semantics', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('preserves https://dscauth.onrender.com as the default backend base URL', () => {
    expect(API_BASE_URL).toBe('https://dscauth.onrender.com')
  })

  it('extracts API error messages from multiple payload shapes', () => {
    expect(extractApiMessage('Direct error string', 'fallback')).toBe('Direct error string')
    expect(extractApiMessage({ error: 'Database locked' }, 'fallback')).toBe('Database locked')
    expect(extractApiMessage({ message: 'Invalid token' }, 'fallback')).toBe('Invalid token')
    expect(extractApiMessage({ title: 'Unauthorized access' }, 'fallback')).toBe('Unauthorized access')
    expect(extractApiMessage({}, 'Default fallback')).toBe('Default fallback')
    expect(extractApiMessage(null, 'Default fallback')).toBe('Default fallback')
  })

  it('strictly distinguishes HTTP 401 Unauthorized (isAuthError) from HTTP 403 Forbidden (isForbiddenError)', () => {
    const err401 = new ApiError('Unauthorized', { status: 401 })
    const err403 = new ApiError('Forbidden', { status: 403 })
    const err500 = new ApiError('Server Error', { status: 500 })
    const genericErr = new Error('Generic')

    expect(isAuthError(err401)).toBe(true)
    expect(isAuthError(err403)).toBe(false)
    expect(isAuthError(err500)).toBe(false)
    expect(isAuthError(genericErr)).toBe(false)

    expect(isForbiddenError(err403)).toBe(true)
    expect(isForbiddenError(err401)).toBe(false)
    expect(isForbiddenError(err500)).toBe(false)
    expect(isForbiddenError(genericErr)).toBe(false)
  })

  it('sends clean single-contract camelCase payloads for registerUser, requestPasswordRecovery, confirmPasswordReset, and updateUserProfile', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ message: 'OK' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await registerUser({
      fullName: '  Naveed Mushtaq ',
      email: '  Naveed@Example.com ',
      username: '  ShahNaveed07 ',
      password: 'secretPassword',
    })

    const [regUrl, regInit] = fetchSpy.mock.calls[0]
    expect(regUrl).toBe('https://dscauth.onrender.com/api/auth/register')
    expect(regInit.method).toBe('POST')
    expect(JSON.parse(regInit.body)).toEqual({
      fullName: 'Naveed Mushtaq',
      email: 'naveed@example.com',
      username: 'shahnaveed07',
      password: 'secretPassword',
      HWID: 'WEB-CLIENT',
    })

    await requestPasswordRecovery({ email: 'Naveed@Example.com' })
    const [forgotUrl, forgotInit] = fetchSpy.mock.calls[1]
    expect(forgotUrl).toBe('https://dscauth.onrender.com/api/auth/forgot-password')
    expect(forgotInit.method).toBe('POST')
    expect(JSON.parse(forgotInit.body)).toEqual({
      email: 'Naveed@Example.com',
      username: 'naveed@example.com',
    })

    await confirmPasswordReset({
      email: 'naveed@example.com',
      token: 'RESET-123',
      newPassword: 'newSecretPassword',
    })
    const [resetUrl, resetInit] = fetchSpy.mock.calls[2]
    expect(resetUrl).toBe('https://dscauth.onrender.com/api/auth/reset-password')
    expect(resetInit.method).toBe('POST')
    expect(JSON.parse(resetInit.body)).toEqual({
      email: 'naveed@example.com',
      token: 'RESET-123',
      newPassword: 'newSecretPassword',
    })

    await updateUserProfile('jwt-token-1', {
      fullName: 'Naveed M',
      email: 'Naveed@Example.com',
      discordId: 'naveed#0001',
    })
    const [profUrl, profInit] = fetchSpy.mock.calls[3]
    expect(profUrl).toBe('https://dscauth.onrender.com/api/auth/profile')
    expect(profInit.method).toBe('PUT')
    expect(profInit.headers.Authorization).toBe('Bearer jwt-token-1')
    expect(JSON.parse(profInit.body)).toEqual({
      fullName: 'Naveed M',
      email: 'naveed@example.com',
      discordId: 'naveed#0001',
    })
  })

  it('handles checkOwnerAccess for Owner (200 -> true), standard Admin (403 -> false), and expired session (401 -> throws ApiError)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    // 1. Owner 200 OK
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    await expect(checkOwnerAccess('owner-token')).resolves.toBe(true)

    // 2. Non-owner Admin 403 Forbidden -> resolves false without throwing
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Owner role required' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      }),
    )
    await expect(checkOwnerAccess('admin-token')).resolves.toBe(false)

    // 3. Expired token 401 Unauthorized -> throws 401 ApiError
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Token expired' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    )
    await expect(checkOwnerAccess('expired-token')).rejects.toMatchObject({
      status: 401,
    })
  })

  it('propagates 401 Unauthorized in getAdminSnapshot while preserving partial snapshot on owner probe 403', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    // Standard admin: users, orders, settings succeed (200), owner probe returns 403
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ isMaintenanceMode: false }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Forbidden' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      )

    const snapshot = await getAdminSnapshot('standard-admin-token')
    expect(snapshot.users.status).toBe('fulfilled')
    expect(snapshot.ownerAccess.status).toBe('rejected')

    // Expired admin token: 401 on admin endpoints throws 401 ApiError
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    )
    await expect(getAdminSnapshot('expired-admin-token')).rejects.toMatchObject({
      status: 401,
    })
  })

  it('parses application/problem+json responses, handles empty 204/empty bodies, and sanitizes HTML gateway errors', async () => {
    const { getSystemStatus, loginUser } = await import('../services/dscApi')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    // 1. application/problem+json with ProblemDetails detail & errors
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
          title: 'Bad Request',
          status: 400,
          detail: 'Username contains unsupported characters.',
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/problem+json; charset=utf-8' },
        },
      ),
    )

    await expect(loginUser({ username: 'bad!user', password: 'password123' })).rejects.toMatchObject({
      status: 400,
      message: 'Username contains unsupported characters.',
    })

    // 2. HTML 502 Bad Gateway response on a 400/502 error is sanitized
    fetchSpy.mockResolvedValueOnce(
      new Response('<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1></body></html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      }),
    )

    await expect(getSystemStatus()).rejects.toMatchObject({
      status: 502,
      message: 'The server encountered an internal error. Please try again shortly.',
    })

    // 3. Empty 204 No Content response resolves cleanly to null without throwing JSON SyntaxError
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 204,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(getSystemStatus()).resolves.toBeNull()
  })

  it('marks aborted requests with isAborted=true and isAbortError=true, distinct from network failures', async () => {
    const { getSystemStatus, isAbortError } = await import('../services/dscApi')
    const abortErr = new DOMException('The operation was aborted.', 'AbortError')
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(abortErr)

    const controller = new AbortController()
    controller.abort()

    let caughtError = null
    try {
      await getSystemStatus(controller.signal)
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).toBeInstanceOf(ApiError)
    expect(isAbortError(caughtError)).toBe(true)
    expect(caughtError.isAborted).toBe(true)
    expect(caughtError.isNetworkError).toBe(false)
    expect(caughtError.name).toBe('AbortError')
  })

  it('normalizes checkout DTO fields and aimassist -> aimbot via buildCheckoutPayload', async () => {
    const { buildCheckoutPayload } = await import('../services/dscApi')

    const payload = buildCheckoutPayload({
      username: '  ProGamer99 ',
      password: 'MySecretPassword',
      discordId: '  progamer#1234 ',
      plan: 'aimassist',
      days: 30,
      amount: 'USD 4 (360 INR)',
      txnId: '412398765432',
      paymentProofBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
    })

    expect(payload).toEqual({
      Username: 'progamer99',
      Password: 'MySecretPassword',
      PasswordHash: 'MySecretPassword',
      DiscordId: 'progamer#1234',
      Plan: 'aimbot',
      Days: 30,
      Amount: 'USD 4 (360 INR)',
      TxnId: '412398765432',
      utr: '412398765432',
      PaymentProofBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
      screenshotBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
    })
  })
})
