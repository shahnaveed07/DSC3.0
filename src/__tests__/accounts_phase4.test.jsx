import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  getSafeRedirectPath,
  updateStoredSession,
  validateRegistrationInput,
} from '../utils/auth'
import { normalizeUserOrdersPayload } from '../utils/format'
import { buildProjectSeoConfig } from '../content/projectsData'
import { SEO_ROUTES } from '../content/seoConfig'
import { UserRegisterPage } from '../pages/UserRegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { UserLoginPage } from '../pages/UserLoginPage'
import { UserDashboardPage } from '../pages/UserDashboardPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'

describe('Phase 4 & Stabilization — DSC Accounts, Legacy Licenses vs Project Orders & 401/403 Handling', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Account Registration Validation & Redirect Hardening', () => {
    it('validates registration fields (fullName, email, username, password, confirmPassword)', () => {
      const emptyCheck = validateRegistrationInput({})
      expect(emptyCheck.isValid).toBe(false)
      expect(emptyCheck.errors.fullName).toBe('Full name is required.')
      expect(emptyCheck.errors.email).toBe('Email address is required.')
      expect(emptyCheck.errors.username).toBe('Username is required.')
      expect(emptyCheck.errors.password).toBe('Password is required.')
      expect(emptyCheck.errors.confirmPassword).toBe('Please confirm your password.')

      const mismatchCheck = validateRegistrationInput({
        fullName: 'Naveed Test',
        email: 'naveed@example.com',
        username: 'naveed_user',
        password: 'password123',
        confirmPassword: 'differentPassword',
      })
      expect(mismatchCheck.isValid).toBe(false)
      expect(mismatchCheck.errors.confirmPassword).toBe('Passwords do not match.')

      const validCheck = validateRegistrationInput({
        fullName: 'Naveed Test',
        email: 'Naveed@Example.com',
        username: 'Naveed_User',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(validCheck.isValid).toBe(true)
      expect(validCheck.cleaned.email).toBe('naveed@example.com')
      expect(validCheck.cleaned.username).toBe('naveed_user')
    })

    it('enforces safe internal redirect paths and blocks external or auth-loop redirects', () => {
      expect(getSafeRedirectPath('/services/websites')).toBe('/services/websites')
      expect(getSafeRedirectPath('/contact?service=game-development')).toBe(
        '/contact?service=game-development',
      )
      expect(getSafeRedirectPath('https://malicious.example.com')).toBe('/pages/udash')
      expect(getSafeRedirectPath('//malicious.example.com')).toBe('/pages/udash')
      expect(getSafeRedirectPath('/pages/ulogin')).toBe('/pages/udash')
      expect(getSafeRedirectPath('/register')).toBe('/pages/udash')
    })

    it('prevents client-side session updates from escalating role or owner flags', () => {
      const payloadBase64 = window
        .btoa(JSON.stringify({ role: 'User', unique_name: 'client1' }))
        .replace(/=+$/, '')
      const validJwt = `eyJhbGciOiJIUzI1NiJ9.${payloadBase64}.sig`

      localStorage.setItem(
        'dscweb.current-session',
        JSON.stringify({
          token: validJwt,
          role: 'User',
          username: 'client1',
          isOwner: false,
          lastActivityAt: Date.now(),
        }),
      )

      const updated = updateStoredSession({
        fullName: 'Client One',
        email: 'client1@example.com',
        role: 'Admin',
        isOwner: true,
      })

      expect(updated.role).toBe('User')
      expect(updated.isOwner).toBe(false)
      expect(updated.fullName).toBe('Client One')
      expect(updated.email).toBe('client1@example.com')
    })
  })

  describe('2. Legacy Software Licenses vs DSC Service Project Orders Separation', () => {
    it('returns zero counts and empty lists when user has no active orders', () => {
      const normalized = normalizeUserOrdersPayload(null, { username: 'client1' }, true)
      expect(normalized.totalOrders).toBe(0)
      expect(normalized.activeOrders).toBe(0)
      expect(normalized.completedOrders).toBe(0)
      expect(normalized.legacyOrders).toEqual([])
      expect(normalized.projectOrders).toEqual([])
    })

    it('does NOT generate synthetic ORD-1 or infer quotation status for legacy /api/auth/my-order payloads', () => {
      const legacyPayload = {
        plan: 'streamer',
        status: 'Approved',
        key: 'DSC-STREAMER-999',
        expiry: '2027-01-01T00:00:00Z',
      }

      const normalized = normalizeUserOrdersPayload(
        legacyPayload,
        { username: 'client1' },
        false,
      )

      expect(normalized.legacyOrders).toHaveLength(1)
      expect(normalized.legacyOrders[0].reference).toBeNull()
      expect(normalized.legacyOrders[0].quotationStatus).toBeNull()
      expect(normalized.legacyOrders[0].quotation).toBeNull()
      // Legacy license payload must NOT be counted as a DSC Service Project Order
      expect(normalized.projectOrders).toEqual([])
      expect(normalized.totalOrders).toBe(0)
    })

    it('normalizes explicit project orders with real IDs and filters out other users', () => {
      const payload = {
        orders: [
          {
            id: 101,
            username: 'client1',
            serviceType: 'Website Development',
            status: 'In Progress',
            quotationStatus: 'Quotation Approved',
            createdAt: '2026-03-01T10:00:00Z',
          },
          {
            id: 999,
            username: 'other_user',
            serviceType: 'Game Development',
            status: 'Pending',
          },
        ],
      }

      const normalized = normalizeUserOrdersPayload(
        payload,
        { username: 'client1' },
        false,
      )
      expect(normalized.totalOrders).toBe(1)
      expect(normalized.activeOrders).toBe(1)
      expect(normalized.projectOrders).toHaveLength(1)
      expect(normalized.projectOrders[0].reference).toBe('ORD-101')
      expect(normalized.projectOrders[0].quotationStatus).toBe('Quotation Approved')
    })
  })

  describe('3. UserRegisterPage & ForgotPasswordPage Flows', () => {
    it('surfaces duplicate account errors from backend (409 Conflict) clearly', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'An account with this email or username already exists.' }),
          {
            status: 409,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )

      render(
        <MemoryRouter initialEntries={['/register']}>
          <UserRegisterPage session={null} onSessionChange={vi.fn()} />
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'Alex Mercer' },
      })
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'alex@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/^Username$/i), {
        target: { value: 'alex_mercer' },
      })
      fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), {
        target: { value: 'secret123' },
      })
      fireEvent.change(screen.getByPlaceholderText('Re-enter password'), {
        target: { value: 'secret123' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Create DSC Account/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain(
          'An account with this email or username already exists.',
        )
      })
    })

    it('never fakes password recovery success when backend returns an error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'Account recovery service unavailable for this username.' }),
          {
            status: 400,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )

      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <ForgotPasswordPage session={null} />
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByPlaceholderText(/Enter your registered email or username/i), {
        target: { value: 'unknown_user' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Send Recovery Request/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain(
          'Account recovery service unavailable for this username.',
        )
      })
      expect(screen.queryByText(/RECOVERY COMPLETE/i)).toBeNull()
    })
  })

  describe('4. UserDashboardPage Separation & HTTP 401 vs 403 Handling', () => {
    it('redirects authenticated user to safe redirect target on login page', () => {
      const activeSession = {
        token: 'valid.jwt.token',
        role: 'User',
        username: 'client_user',
      }

      render(
        <MemoryRouter initialEntries={['/pages/ulogin?redirect=%2Fservices%2Fwebsites']}>
          <Routes>
            <Route
              path="/pages/ulogin"
              element={<UserLoginPage session={activeSession} onSessionChange={vi.fn()} />}
            />
            <Route path="/services/websites" element={<div>Websites Service Target</div>} />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Websites Service Target')).toBeTruthy()
    })

    it('displays legacy software license on Overview tab and honest empty state on My Orders tab', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            plan: 'streamer',
            status: 'Approved',
            key: 'DSC-STREAMER-777',
            expiry: '2027-05-01T00:00:00Z',
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )

      const session = {
        token: 'valid.jwt.token',
        role: 'User',
        username: 'client_user',
        fullName: 'Client User',
        email: 'client@example.com',
      }

      const { container } = render(
        <MemoryRouter initialEntries={['/pages/udash']}>
          <UserDashboardPage
            session={session}
            onSessionInvalid={vi.fn()}
            onSessionUpdate={vi.fn()}
            onLogout={vi.fn()}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(container.querySelector('#dashUsername')?.textContent).toBe('CLIENT_USER')
      })

      expect(container.querySelector('#dashPlan')?.textContent).toBe('STREAMER')
      expect(container.querySelector('#dashOrderKey')?.textContent).toBe('DSC-STREAMER-777')
      // Legacy license does not inflate project order count
      expect(container.querySelector('#dashTotalOrders')?.textContent).toBe('0')

      // Switch to My Orders tab -> shows honest empty state
      fireEvent.click(screen.getByRole('tab', { name: /My Orders/i }))
      expect(screen.getByTestId('service-orders-honest-message').textContent).toContain(
        "Project order tracking will become available when DSC's Service Order system is connected.",
      )
    })

    it('logs out on User 401 Unauthorized, but preserves session and shows Access Denied on User 403 Forbidden', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const onSessionInvalid401 = vi.fn()
      const onSessionInvalid403 = vi.fn()

      const session = {
        token: 'valid.jwt.token',
        role: 'User',
        username: 'client_user',
      }

      // Case A: User 401 -> calls onSessionInvalid
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Expired token' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )

      const { unmount } = render(
        <MemoryRouter initialEntries={['/pages/udash']}>
          <UserDashboardPage
            session={session}
            onSessionInvalid={onSessionInvalid401}
            onSessionUpdate={vi.fn()}
            onLogout={vi.fn()}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(onSessionInvalid401).toHaveBeenCalledTimes(1)
      })
      unmount()

      // Case B: User 403 -> does NOT call onSessionInvalid; renders Access Denied alert
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Forbidden resource' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      )

      render(
        <MemoryRouter initialEntries={['/pages/udash']}>
          <UserDashboardPage
            session={session}
            onSessionInvalid={onSessionInvalid403}
            onSessionUpdate={vi.fn()}
            onLogout={vi.fn()}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain('Access Denied (HTTP 403)')
      })
      expect(onSessionInvalid403).not.toHaveBeenCalled()
    })

    it('logs out on Admin 401 Unauthorized, but preserves session on Admin 403 Forbidden', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const onAdminInvalid401 = vi.fn()
      const onAdminInvalid403 = vi.fn()
      const adminSession = {
        token: 'admin.jwt.token',
        role: 'Admin',
        username: 'admin1',
      }

      // Case A: Admin 401 -> calls onSessionInvalid
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Invalid admin token' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )

      const { unmount } = render(
        <MemoryRouter initialEntries={['/pages/adash']}>
          <AdminDashboardPage
            session={adminSession}
            systemStatus={{ isMaintenanceMode: false }}
            onSessionInvalid={onAdminInvalid401}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(onAdminInvalid401).toHaveBeenCalledTimes(1)
      })
      unmount()

      // Case B: Admin 403 -> does NOT call onSessionInvalid
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Access denied to admin resource' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      )

      render(
        <MemoryRouter initialEntries={['/pages/adash']}>
          <AdminDashboardPage
            session={adminSession}
            systemStatus={{ isMaintenanceMode: false }}
            onSessionInvalid={onAdminInvalid403}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain('Access denied to admin resource')
      })
      expect(onAdminInvalid403).not.toHaveBeenCalled()
    })
  })

  describe('5. Dynamic Project Detail SEO Fallback', () => {
    it('derives indexable SEO metadata dynamically for newly added projects instead of falling back to 404 notFound', () => {
      const futureProject = {
        id: 'dsc-client-portal',
        slug: 'client-web-platform',
        name: 'Client Web Platform',
        projectType: 'Website',
        shortDescription: 'Custom enterprise web platform built by Dark Skull Corporation.',
        publisher: 'Client Organization',
      }

      const seo = buildProjectSeoConfig(futureProject, SEO_ROUTES)
      expect(seo.indexable).toBe(true)
      expect(seo.robots).toBe('index, follow')
      expect(seo.canonical).toBe('https://dscweb.me/projects/client-web-platform')
      expect(seo.title).toBe('Client Web Platform — Website | Dark Skull Corporation')
      expect(seo).not.toBe(SEO_ROUTES.notFound)
    })
  })
})
