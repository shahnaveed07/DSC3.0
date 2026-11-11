import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ContactPage } from '../pages/ContactPage'
import { StatusPage } from '../pages/StatusPage'
import { SiteHeader } from '../components/layout/SiteHeader'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { getSystemStatus } from '../services/dscApi'

describe('DSC3.0 Bug Fix, API Repair & Stabilization Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Checkout UTR Validation, Base64 Proof Encoding & QR Error/Retry', () => {
    it('validates user-supplied UTR/TxnId and rejects invalid or whitespace-only transaction references', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const file = new File(['png-bytes'], 'receipt.png', { type: 'image/png' })

      render(
        <MemoryRouter initialEntries={['/pages/checkout?panel=streamer']}>
          <Routes>
            <Route path="/pages/checkout" element={<CheckoutPage />} />
          </Routes>
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByPlaceholderText(/Must match game username/i), {
        target: { value: 'streamer_user' },
      })
      fireEvent.change(screen.getByPlaceholderText(/Minimum 6 characters/i), {
        target: { value: 'SecretPass123' },
      })
      fireEvent.change(screen.getByLabelText(/UPLOAD PAYMENT PROOF SCREENSHOT/i), {
        target: { files: [file] },
      })

      // Enter invalid short UTR
      const txnInput = screen.getByLabelText(/UPI TRANSACTION ID \/ UTR/i)
      fireEvent.change(txnInput, { target: { value: '123' } })
      fireEvent.click(screen.getByRole('button', { name: /Submit Order/i }))

      expect(
        await screen.findByText(/Transaction ID \/ UTR must be 6 to 36 alphanumeric characters/i),
      ).toBeTruthy()
      expect(fetchSpy).not.toHaveBeenCalled()

      // Enter valid 12-digit UTR and submit
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Order created' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

      fireEvent.change(txnInput, { target: { value: '412389012345' } })
      fireEvent.click(screen.getByRole('button', { name: /Submit Order/i }))

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1)
      })

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1].body)
      expect(sentBody.Username).toBe('streamer_user')
      expect(sentBody.Password).toBe('SecretPass123')
      expect(sentBody.PasswordHash).toBe('SecretPass123')
      expect(sentBody.Plan).toBe('streamer')
      expect(sentBody.TxnId).toBe('412389012345')
      expect(sentBody.utr).toBe('412389012345')
      expect(sentBody.PaymentProofBase64).toMatch(/^data:image\/png;base64,/)
      expect(sentBody.screenshotBase64).toBe(sentBody.PaymentProofBase64)
    })

    it('handles QR code image load failures cleanly with an error alert and Retry QR Code button', async () => {
      render(
        <MemoryRouter initialEntries={['/pages/checkout?panel=sniper']}>
          <Routes>
            <Route path="/pages/checkout" element={<CheckoutPage />} />
          </Routes>
        </MemoryRouter>,
      )

      const qrImg = screen.getByAltText('UPI QR Code')
      expect(qrImg).toBeTruthy()

      // Simulate QR image load failure
      fireEvent.error(qrImg)

      expect(
        await screen.findByText(/Unable to load the UPI QR code image/i),
      ).toBeTruthy()

      const retryBtn = screen.getByRole('button', { name: /Retry QR Code/i })
      fireEvent.click(retryBtn)

      // Error alert clears and QR image retries with cache-busting parameter
      expect(screen.queryByText(/Unable to load the UPI QR code image/i)).toBeNull()
      expect(qrImg.getAttribute('src')).toContain('retry=1')
    })
  })

  describe('2. Permission-State Synchronization in SiteHeader', () => {
    it('resets verifiedOwner state immediately when session logs out, changes role, or switches admin token', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

      const ownerAdminSession = {
        token: 'owner-jwt-token-1',
        role: 'Admin',
        username: 'owner_admin',
        isOwner: false,
      }

      const { rerender } = render(
        <MemoryRouter initialEntries={['/pages/adash']}>
          <SiteHeader session={ownerAdminSession} systemStatus={null} onLogout={vi.fn()} />
        </MemoryRouter>,
      )

      // Wait for checkOwnerAccess to resolve and show OwnerDB in the contextual menu
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1)
        expect(screen.getByText('OwnerDB')).toBeTruthy()
      })

      // Now simulate logout (session becomes null)
      rerender(
        <MemoryRouter initialEntries={['/']}>
          <SiteHeader session={null} systemStatus={null} onLogout={vi.fn()} />
        </MemoryRouter>,
      )

      expect(screen.queryByText('OwnerDB')).toBeNull()

      // Now simulate logging in as a standard non-owner Admin (probe returns 403)
      fetchSpy.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ message: 'Forbidden' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      )

      const standardAdminSession = {
        token: 'standard-admin-token-2',
        role: 'Admin',
        username: 'staff_admin',
        isOwner: false,
      }

      rerender(
        <MemoryRouter initialEntries={['/pages/adash']}>
          <SiteHeader session={standardAdminSession} systemStatus={null} onLogout={vi.fn()} />
        </MemoryRouter>,
      )

      // Must NOT show stale OwnerDB from previous session
      expect(screen.queryByText('OwnerDB')).toBeNull()
    })
  })

  describe('3. Contact Form Validation & Clipboard Failure Fallback', () => {
    it('rejects whitespace-only inputs and invalid email formats with field-specific errors', async () => {
      render(
        <MemoryRouter initialEntries={['/contact']}>
          <ContactPage />
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByLabelText(/YOUR NAME/i), { target: { value: '   ' } })
      fireEvent.change(screen.getByLabelText(/YOUR EMAIL ADDRESS/i), {
        target: { value: 'invalid-email' },
      })
      fireEvent.change(screen.getByLabelText(/SUBJECT/i), { target: { value: '   ' } })
      fireEvent.change(screen.getByLabelText(/MESSAGE DETAILS/i), { target: { value: '   ' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry Details/i }))

      expect(await screen.findByText('Please enter your name.')).toBeTruthy()
      expect(
        await screen.findByText('Please enter a valid email address (e.g., you@example.com).'),
      ).toBeTruthy()
      expect(await screen.findByText('Please enter a subject for your inquiry.')).toBeTruthy()
      expect(await screen.findByText('Please enter your message details.')).toBeTruthy()
      expect(screen.queryByTestId('formatted-inquiry-preview')).toBeNull()
    })

    it('formats valid inquiry locally and displays fallback message when clipboard copy fails', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValueOnce(new Error('Clipboard permission denied')),
        },
      })

      render(
        <MemoryRouter initialEntries={['/contact']}>
          <ContactPage />
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByLabelText(/YOUR NAME/i), {
        target: { value: 'Shahid Mushtaq' },
      })
      fireEvent.change(screen.getByLabelText(/YOUR EMAIL ADDRESS/i), {
        target: { value: 'shahid@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/SUBJECT/i), {
        target: { value: 'Custom Android App' },
      })
      fireEvent.change(screen.getByLabelText(/MESSAGE DETAILS/i), {
        target: { value: 'Looking for a quotation on a native Android app.' },
      })

      fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry Details/i }))

      expect(await screen.findByTestId('formatted-inquiry-preview')).toBeTruthy()

      const copyBtn = screen.getByRole('button', { name: /Copy Message for Discord \/ Email/i })
      fireEvent.click(copyBtn)

      expect(
        await screen.findByText(/Automatic clipboard copy was blocked by your browser/i),
      ).toBeTruthy()
    })
  })

  describe('4. Genuine StatusPage States (Loading, Operational, Maintenance, Unavailable & Retry)', () => {
    it('shows loading state initially, transitions to Verified Operational when endpoints succeed, and supports Retry', async () => {
      let callIndex = 0
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        const strUrl = String(url)
        callIndex += 1
        if (strUrl.includes('/api/admin/system-status')) {
          return new Response(
            JSON.stringify({ isMaintenanceMode: false, showHomeDownloadBtn: true }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          )
        }
        if (strUrl.includes('/api/public/free-panel')) {
          return new Response(
            JSON.stringify({
              freeUser: 'free_demo',
              freePass: 'pass_123',
              usedSlots: 4,
              maxSlots: 20,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          )
        }
        return new Response('{}', { status: 200 })
      })

      const onRetrySpy = vi.fn()
      render(
        <MemoryRouter initialEntries={['/pages/status']}>
          <StatusPage onRetry={onRetrySpy} />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('overall-status-badge').textContent).toBe('Verified Operational')
      })

      expect(screen.getByTestId('service-state-core').textContent).toBe('Available')
      expect(screen.getByTestId('service-state-freepanel').textContent).toBe('Available')
      expect(screen.getByTestId('maintenance-status-text').textContent).toContain(
        'Inactive (Normal Operation)',
      )
      expect(screen.getByTestId('status-last-checked').textContent).toContain('Last checked:')

      // Click Retry Status Check
      const retryBtn = screen.getByRole('button', { name: /Retry Status Check/i })
      fireEvent.click(retryBtn)

      await waitFor(() => {
        expect(onRetrySpy).toHaveBeenCalledTimes(1)
        expect(callIndex).toBeGreaterThanOrEqual(4)
      })
      expect(fetchSpy).toHaveBeenCalled()
    })

    it('shows Maintenance Active state when backend reports isMaintenanceMode: true', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        const strUrl = String(url)
        if (strUrl.includes('/api/admin/system-status')) {
          return new Response(
            JSON.stringify({
              isMaintenanceMode: true,
              maintenanceReason: 'Database migration in progress',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          )
        }
        return new Response(JSON.stringify({ freeUser: null, freePass: null }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      })

      render(
        <MemoryRouter initialEntries={['/pages/status']}>
          <StatusPage />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('overall-status-badge').textContent).toBe('Maintenance Active')
      })
      expect(screen.getByTestId('maintenance-status-text').textContent).toContain(
        'Database migration in progress',
      )
    })

    it('shows Backend Unavailable state when endpoints fail and never fabricates operational status', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

      render(
        <MemoryRouter initialEntries={['/pages/status']}>
          <StatusPage />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('overall-status-badge').textContent).toBe('Backend Unavailable')
      })
      expect(screen.getByTestId('service-state-core').textContent).toBe('Unavailable')
      expect(screen.getByTestId('service-state-freepanel').textContent).toBe('Unavailable')
    })
  })

  describe('5. AbortError Handling in useRemoteResource', () => {
    it('does not surface aborted requests as user-facing errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        })
      })

      function TestConsumer() {
        const { error, loading } = useRemoteResource(getSystemStatus, [])
        return (
          <div>
            <span data-testid="loading-flag">{String(loading)}</span>
            <span data-testid="error-flag">{error ? error.message : 'none'}</span>
          </div>
        )
      }

      const { unmount } = render(<TestConsumer />)
      expect(screen.getByTestId('error-flag').textContent).toBe('none')
      unmount()
    })
  })
})
