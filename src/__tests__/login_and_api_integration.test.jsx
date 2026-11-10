import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserLoginPage } from '../pages/UserLoginPage'
import { AdminLoginPage } from '../pages/AdminLoginPage'
import {
  buildUrl,
  extractApiMessage,
  getApiBaseUrl,
} from '../services/dscApi'
import { loadStoredSession } from '../utils/auth'

function createMockJwt(payload) {
  const base64Url = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `mockHeader.${base64Url}.mockSignature`
}

describe('API URL Normalization & Configuration', () => {
  it('normalizes base URL by stripping trailing slashes', () => {
    const base = getApiBaseUrl()
    expect(base.endsWith('/')).toBe(false)
    expect(buildUrl('api/auth/login')).toBe(`${base}/api/auth/login`)
    expect(buildUrl('/api/auth/login')).toBe(`${base}/api/auth/login`)
  })

  it('safely extracts ASP.NET Core 8 ValidationProblemDetails errors dictionary', () => {
    const aspNetValidationPayload = {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        Username: ['The Username field is required.'],
        Password: ['The Password field is required.'],
      },
    }

    const message = extractApiMessage(aspNetValidationPayload)
    expect(message).toContain('The Username field is required.')
    expect(message).toContain('The Password field is required.')
  })

  it('sanitizes server error responses and hides internal stack traces or HTML pages', () => {
    const stackTracePayload = 'System.Exception: Database connection timed out at Microsoft.AspNetCore.Mvc...'
    expect(extractApiMessage(stackTracePayload, 'Fallback error')).toBe('Fallback error')

    const htmlGatewayError = '<html><body>502 Bad Gateway</body></html>'
    expect(extractApiMessage(htmlGatewayError, 'Server error')).toBe('Server error')
  })
})

describe('User and Admin Login Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates empty username and password without triggering API requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /Login/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Username is required.')).toBeTruthy()
    expect(await screen.findByText('Password is required.')).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('handles successful user login with exact payload contract and session persistence', async () => {
    const userJwt = createMockJwt({
      sub: '42',
      name: 'testplayer',
      role: 'User',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        token: userJwt,
        username: 'testplayer',
        plan: 'streamer',
        expiry: '2027-01-01',
      }),
    })

    const onSessionChange = vi.fn()

    render(
      <MemoryRouter initialEntries={['/pages/ulogin']}>
        <Routes>
          <Route
            path="/pages/ulogin"
            element={<UserLoginPage session={null} onSessionChange={onSessionChange} />}
          />
          <Route path="/pages/udash" element={<div>User Dashboard Destination</div>} />
        </Routes>
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText('Enter username')
    const passInput = screen.getByPlaceholderText('Enter password')
    const submitBtn = screen.getByRole('button', { name: /Login/i })

    fireEvent.change(userInput, { target: { value: 'TestPlayer' } })
    fireEvent.change(passInput, { target: { value: 'Secret123!' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    // Verify request payload matches backend DTO
    const callArgs = fetchSpy.mock.calls[0]
    expect(callArgs[0]).toContain('/api/auth/login')
    const requestBody = JSON.parse(callArgs[1].body)
    expect(requestBody.username).toBe('testplayer') // trimmed & lowercased
    expect(requestBody.password).toBe('Secret123!')
    expect(requestBody.HWID).toBe('WEB-CLIENT')

    // Verify session was persisted
    await waitFor(() => {
      const stored = loadStoredSession()
      expect(stored).toBeTruthy()
      expect(stored.role).toBe('User')
      expect(onSessionChange).toHaveBeenCalledWith(expect.objectContaining({ role: 'User' }))
    })

    // Verify navigation occurred
    expect(await screen.findByText('User Dashboard Destination')).toBeTruthy()
  })

  it('handles invalid credentials (HTTP 401) with clean error and clears password', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        message: 'Invalid credentials provided.',
      }),
    })

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText('Enter username')
    const passInput = screen.getByPlaceholderText('Enter password')
    const submitBtn = screen.getByRole('button', { name: /Login/i })

    fireEvent.change(userInput, { target: { value: 'wronguser' } })
    fireEvent.change(passInput, { target: { value: 'badpass' } })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Invalid credentials provided.')).toBeTruthy()

    // Password must be reset for security, username must be preserved
    expect(userInput.value).toBe('wronguser')
    expect(passInput.value).toBe('')
    expect(submitBtn.hasAttribute('disabled')).toBe(false)
  })

  it('handles backend network unavailability and CORS blocks gracefully', async () => {
    // When browser blocks CORS or network fails, fetch rejects with TypeError
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'))

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Enter username'), {
      target: { value: 'validuser' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    expect(
      await screen.findByText(
        /Unable to connect to the authentication server\. Please verify your connection or try again shortly\./i
      )
    ).toBeTruthy()
  })

  it('handles backend HTTP 500 without leaking server stack traces', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        error: 'System.NullReferenceException: Object reference not set to an instance...',
      }),
    })

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Enter username'), {
      target: { value: 'validuser' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    // Must show sanitized error, NOT the raw stack trace
    expect(
      await screen.findByText(/The server encountered an internal error\. Please try again shortly\./i)
    ).toBeTruthy()
    expect(screen.queryByText(/NullReferenceException/)).toBeNull()
  })

  it('prevents duplicate simultaneous login submissions', async () => {
    let resolveFetch
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => pendingPromise)

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Enter username'), {
      target: { value: 'rapiduser' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'rapidpass' },
    })

    const submitBtn = screen.getByRole('button', { name: /Login/i })

    // Click submit multiple times in quick succession
    fireEvent.click(submitBtn)
    fireEvent.click(submitBtn)
    fireEvent.click(submitBtn)

    // Should only have initiated 1 request
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(submitBtn.hasAttribute('disabled')).toBe(true)

    // Complete the pending request
    resolveFetch({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Failed' }),
    })

    await waitFor(() => {
      expect(submitBtn.hasAttribute('disabled')).toBe(false)
    })
  })

  it('handles successful admin login to /api/admin/login and redirects to /pages/adash', async () => {
    const adminJwt = createMockJwt({
      sub: '99',
      name: 'head_admin',
      role: 'Admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        token: adminJwt,
        username: 'head_admin',
        role: 'Admin',
        isOwner: true,
      }),
    })

    const onSessionChange = vi.fn()

    render(
      <MemoryRouter initialEntries={['/pages/alogin']}>
        <Routes>
          <Route
            path="/pages/alogin"
            element={<AdminLoginPage session={null} onSessionChange={onSessionChange} />}
          />
          <Route path="/pages/adash" element={<div>Admin Dashboard Destination</div>} />
        </Routes>
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText('Enter username')
    const passInput = screen.getByPlaceholderText('Enter password')
    const submitBtn = screen.getByRole('button', { name: /Authenticate/i })

    fireEvent.change(userInput, { target: { value: 'Head_Admin' } })
    fireEvent.change(passInput, { target: { value: 'AdminSecret!' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    const callArgs = fetchSpy.mock.calls[0]
    expect(callArgs[0]).toContain('/api/admin/login')
    const body = JSON.parse(callArgs[1].body)
    expect(body.username).toBe('head_admin')
    expect(body.password).toBe('AdminSecret!')
    expect(body.HWID).toBeUndefined() // Admin does not require HWID field

    expect(await screen.findByText('Admin Dashboard Destination')).toBeTruthy()
  })

  it('rejects an admin role trying to login via the user login page', async () => {
    const adminJwt = createMockJwt({
      sub: '101',
      name: 'admin_only',
      role: 'Admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        token: adminJwt,
        username: 'admin_only',
      }),
    })

    render(
      <MemoryRouter>
        <UserLoginPage session={null} onSessionChange={() => {}} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Enter username'), {
      target: { value: 'admin_only' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    expect(
      await screen.findByText('This account is not allowed on the user login page.')
    ).toBeTruthy()
    expect(loadStoredSession()).toBeNull()
  })
})
