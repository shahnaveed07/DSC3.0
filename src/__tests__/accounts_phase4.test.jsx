import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  getSafeRedirectPath,
  updateStoredSession,
  validateRegistrationInput,
} from '../utils/auth'
import { normalizeUserOrdersPayload } from '../utils/format'
import { UserRegisterPage } from '../pages/UserRegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { UserLoginPage } from '../pages/UserLoginPage'
import { UserDashboardPage } from '../pages/UserDashboardPage'

describe('Phase 4 — DSC Accounts & User Dashboard Suite', () => {
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

  describe('2. User Orders Normalization & Ownership Isolation', () => {
    it('returns zero counts and empty lists when user has no active orders (no dummy statistics)', () => {
      const normalized = normalizeUserOrdersPayload(null, { username: 'client1' }, true)
      expect(normalized.totalOrders).toBe(0)
      expect(normalized.activeOrders).toBe(0)
      expect(normalized.completedOrders).toBe(0)
      expect(normalized.orders).toEqual([])
      expect(normalized.recentActivity).toEqual([])
    })

    it('normalizes user orders and filters out records belonging to any other username', () => {
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
            id: 102,
            username: 'client1',
            plan: 'streamer',
            status: 'Approved',
            createdAt: '2026-02-15T10:00:00Z',
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
      expect(normalized.totalOrders).toBe(2)
      expect(normalized.activeOrders).toBe(1)
      expect(normalized.completedOrders).toBe(1)
      expect(normalized.orders.map((o) => o.id)).toEqual(['101', '102'])
      expect(normalized.orders[0].reference).toBe('ORD-101')
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
      // Must stay on request step and not show fake completion
      expect(screen.queryByText(/RECOVERY COMPLETE/i)).toBeNull()
    })
  })

  describe('4. UserLoginPage Redirect & UserDashboardPage 4-Tab Architecture', () => {
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

    it('renders Overview, My Orders, Profile, and Account Security tabs with real user data', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 501,
            username: 'client_user',
            serviceType: 'Website Development',
            plan: 'Website Development',
            status: 'Approved',
            quotationStatus: 'Quotation Approved',
            key: 'DSC-WEB-501',
            createdAt: '2026-03-10T12:00:00Z',
            updatedAt: '2026-03-12T15:30:00Z',
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

      // Overview tab metrics
      expect(container.querySelector('#dashTotalOrders')?.textContent).toBe('1')
      expect(container.querySelector('#dashCompletedOrders')?.textContent).toBe('1')

      // Switch to My Orders tab
      fireEvent.click(screen.getByRole('tab', { name: /My Orders/i }))
      expect(screen.getByTestId('dashboard-orders-panel')).toBeTruthy()
      expect(screen.getByTestId('detail-order-reference').textContent).toBe('ORD-501')
      expect(screen.getByTestId('detail-service-type').textContent).toBe('Website Development')
      expect(screen.getByTestId('detail-current-status').textContent).toBe('Approved')
      expect(screen.getByTestId('detail-quotation-status').textContent).toBe('Quotation Approved')

      // Switch to Profile tab
      fireEvent.click(screen.getByRole('tab', { name: /Profile/i }))
      expect(screen.getByTestId('dashboard-profile-panel')).toBeTruthy()
      expect(screen.getByLabelText(/Full Name/i).value).toBe('Client User')
      expect(screen.getByLabelText(/Email Address/i).value).toBe('client@example.com')

      // Switch to Account Security tab
      fireEvent.click(screen.getByRole('tab', { name: /Account Security/i }))
      expect(screen.getByTestId('dashboard-security-panel')).toBeTruthy()
      expect(screen.getByRole('button', { name: /Update Password/i })).toBeTruthy()
    })
  })
})
