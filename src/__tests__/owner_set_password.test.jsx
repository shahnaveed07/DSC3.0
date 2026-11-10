import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { setUserPassword } from '../services/dscApi'
import { AdminWorkspacePage } from '../pages/AdminWorkspacePage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'

describe('Owner Direct Password Update - Service and UI Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('setUserPassword Service Contract', () => {
    it('calls POST /api/admin/user/{id}/set-password with Authorization header and newPassword body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Password updated successfully.' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await setUserPassword('fake-owner-jwt-token', 42, 'SecretP@ss123')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, init] = mockFetch.mock.calls[0]
      expect(url).toContain('/api/admin/user/42/set-password')
      expect(init.method).toBe('POST')
      expect(init.headers['Authorization']).toBe('Bearer fake-owner-jwt-token')
      expect(init.headers['Content-Type']).toBe('application/json')
      expect(JSON.parse(init.body)).toEqual({ newPassword: 'SecretP@ss123' })
      expect(result).toEqual({ message: 'Password updated successfully.' })
    })

    it('rejects with ApiError and status 400 when validation fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Password does not meet complexity requirements.' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(setUserPassword('fake-owner-jwt-token', 42, '123')).rejects.toThrow()
    })

    it('rejects with ApiError and status 403 when caller is not an Owner', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Owner privileges required.' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(setUserPassword('fake-admin-jwt-token', 42, 'ValidSecret123')).rejects.toThrow()
    })

    it('rejects with ApiError and status 404 when user is not found', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'User not found.' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(setUserPassword('fake-owner-jwt-token', 99999, 'ValidSecret123')).rejects.toThrow()
    })
  })

  describe('AdminWorkspacePage OwnerDB User Password Management', () => {
    it('validates minimum length and matching passwords, then updates password successfully', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url) => {
        const strUrl = String(url)
        if (strUrl.includes('/api/admin/users')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => [{ id: 101, username: 'testuser1', plan: 'aimbot', isBanned: false }],
          }
        }
        if (strUrl.includes('/api/admin/user/101/set-password')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ message: 'Password successfully updated for user #101.' }),
          }
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({}),
        }
      })
      vi.stubGlobal('fetch', mockFetch)

      const onSessionInvalid = vi.fn()

      render(
        <MemoryRouter>
          <AdminWorkspacePage
            session={{ token: 'mock-owner-token', role: 'Owner', username: 'owner1' }}
            onSessionInvalid={onSessionInvalid}
          />
        </MemoryRouter>
      )

      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByText('testuser1')).toBeTruthy()
      })

      // Click Edit / Manage on user
      const editBtn = screen.getByRole('button', { name: /Edit \/ Manage/i })
      fireEvent.click(editBtn)

      // Check modal opened with SET NEW USER PASSWORD section
      expect(screen.getByText(/SET NEW USER PASSWORD/i)).toBeTruthy()
      const newPassInput = screen.getByPlaceholderText('Enter new password')
      const confirmPassInput = screen.getByPlaceholderText('Confirm new password')
      const setPassBtn = screen.getByRole('button', { name: /Set New Password/i })

      // Try with short password (< 6 chars)
      fireEvent.change(newPassInput, { target: { value: '123' } })
      fireEvent.change(confirmPassInput, { target: { value: '123' } })
      fireEvent.click(setPassBtn)

      expect(screen.getByText(/at least 6 characters long/i)).toBeTruthy()

      // Try with mismatching passwords
      fireEvent.change(newPassInput, { target: { value: 'Secret123' } })
      fireEvent.change(confirmPassInput, { target: { value: 'Different123' } })
      fireEvent.click(setPassBtn)

      expect(screen.getByText(/do not match/i)).toBeTruthy()

      // Enter matching valid password
      fireEvent.change(newPassInput, { target: { value: 'SuperSecret123' } })
      fireEvent.change(confirmPassInput, { target: { value: 'SuperSecret123' } })
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }))

      await waitFor(() => {
        const setPassCall = mockFetch.mock.calls.find(([url]) =>
          String(url).includes('/api/admin/user/101/set-password')
        )
        expect(setPassCall).toBeTruthy()
        expect(setPassCall[1].method).toBe('POST')
        expect(setPassCall[1].headers['Authorization']).toBe('Bearer mock-owner-token')
        expect(JSON.parse(setPassCall[1].body)).toEqual({ newPassword: 'SuperSecret123' })
      })

      // Check success message is displayed and fields cleared
      await waitFor(() => {
        expect(screen.getByText(/Password successfully updated for user #101/i)).toBeTruthy()
        expect(newPassInput.value).toBe('')
        expect(confirmPassInput.value).toBe('')
      })
    })

    it('handles backend error (403 forbidden) gracefully', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url) => {
        const strUrl = String(url)
        if (strUrl.includes('/api/admin/users')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => [{ id: 202, username: 'testuser2', plan: 'sniper', isBanned: false }],
          }
        }
        if (strUrl.includes('/api/admin/user/202/set-password')) {
          return {
            ok: false,
            status: 403,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ message: 'Forbidden' }),
          }
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({}),
        }
      })
      vi.stubGlobal('fetch', mockFetch)

      render(
        <MemoryRouter>
          <AdminWorkspacePage
            session={{ token: 'mock-owner-token', role: 'Owner', username: 'owner1' }}
            onSessionInvalid={vi.fn()}
          />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('testuser2')).toBeTruthy()
      })

      fireEvent.click(screen.getByRole('button', { name: /Edit \/ Manage/i }))

      const newPassInput = screen.getByPlaceholderText('Enter new password')
      const confirmPassInput = screen.getByPlaceholderText('Confirm new password')

      fireEvent.change(newPassInput, { target: { value: 'SuperSecret123' } })
      fireEvent.change(confirmPassInput, { target: { value: 'SuperSecret123' } })
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }))

      await waitFor(() => {
        expect(screen.getByText(/Owner privileges required/i)).toBeTruthy()
      })
    })
  })

  describe('AdminDashboardPage User Password Management', () => {
    it('allows Owner to directly update password from Edit User modal', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url) => {
        const strUrl = String(url)
        if (strUrl.includes('/api/admin/users')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => [{ id: 303, username: 'dashuser3', plan: 'aimbot', isBanned: false }],
          }
        }
        if (strUrl.includes('/api/admin/orders/pending')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => [],
          }
        }
        if (strUrl.includes('/api/admin/settings/all')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ isMaintenanceMode: false }),
          }
        }
        if (strUrl.includes('/api/admin/owner/probe')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ status: 'owner' }),
          }
        }
        if (strUrl.includes('/api/admin/user/303/set-password')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ message: 'Password updated successfully.' }),
          }
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({}),
        }
      })
      vi.stubGlobal('fetch', mockFetch)

      render(
        <MemoryRouter>
          <AdminDashboardPage
            session={{ token: 'mock-owner-token', username: 'owner1' }}
            systemStatus={{ isMaintenanceMode: false }}
            onSessionInvalid={vi.fn()}
          />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('dashuser3')).toBeTruthy()
      })

      // Click Edit button
      const editBtn = screen.getByRole('button', { name: 'Edit' })
      fireEvent.click(editBtn)

      // Verify SET NEW USER PASSWORD section is present
      expect(screen.getByText(/SET NEW USER PASSWORD/i)).toBeTruthy()

      const newPassInput = screen.getByPlaceholderText('Enter new password')
      const confirmPassInput = screen.getByPlaceholderText('Confirm new password')
      const setPassBtn = screen.getByRole('button', { name: /Set New Password/i })

      fireEvent.change(newPassInput, { target: { value: 'DashPass456' } })
      fireEvent.change(confirmPassInput, { target: { value: 'DashPass456' } })
      fireEvent.click(setPassBtn)

      await waitFor(() => {
        const setPassCall = mockFetch.mock.calls.find(([url]) =>
          String(url).includes('/api/admin/user/303/set-password')
        )
        expect(setPassCall).toBeTruthy()
        expect(setPassCall[1].method).toBe('POST')
        expect(setPassCall[1].headers['Authorization']).toBe('Bearer mock-owner-token')
        expect(JSON.parse(setPassCall[1].body)).toEqual({ newPassword: 'DashPass456' })
        expect(newPassInput.value).toBe('')
        expect(confirmPassInput.value).toBe('')
      })
    })
  })
})
