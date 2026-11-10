import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StatusPage } from '../pages/StatusPage'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteLayout } from '../components/layout/SiteLayout'
import { PasswordInput } from '../components/ui/PasswordInput'

describe('Component Render Tests', () => {
  it('renders NotFoundPage with error 404 and return home action', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Error 404/i)).toBeTruthy()
    expect(screen.getByText(/Page Not Found/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Return Home/i })).toBeTruthy()
  })

  it('renders StatusPage default notice when no query param is present', () => {
    render(
      <MemoryRouter initialEntries={['/pages/status']}>
        <StatusPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/We are Working on New Updates/i)).toBeTruthy()
    expect(screen.getByText(/Notice/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeTruthy()
  })

  it('renders StatusPage maintenance state when ?type=maintenance is supplied', () => {
    render(
      <MemoryRouter initialEntries={['/pages/status?type=maintenance']}>
        <StatusPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/System Maintenance/i)).toBeTruthy()
    expect(screen.getByText(/We'll be back shortly/i)).toBeTruthy()
  })

  it('renders SiteFooter with copyright and developer credit', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    )

    const brandMatches = screen.getAllByText(/Dark Skull Corporation/i)
    expect(brandMatches.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Naveed Mushtaq/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Naveed Mushtaq/i })).toBeTruthy()
  })

  it('renders SiteLayout with header, main content, and footer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<SiteLayout session={null} systemStatus={null} onLogout={() => {}} />}>
            <Route path="/" element={<div>Home Page Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Home Page Content')).toBeTruthy()
    expect(screen.getByText(/Naveed Mushtaq/i)).toBeTruthy()
  })
})

describe('PasswordInput Component Tests', () => {
  it('renders with initial password type and Show password accessible label', () => {
    render(
      <PasswordInput
        id="test-pwd"
        placeholder="Enter your secret"
        value="supersecret123"
        onChange={() => {}}
      />
    )

    const input = screen.getByPlaceholderText('Enter your secret')
    expect(input.getAttribute('type')).toBe('password')
    expect(input.value).toBe('supersecret123')

    const toggleBtn = screen.getByRole('button', { name: /Show password/i })
    expect(toggleBtn).toBeTruthy()
    expect(toggleBtn.getAttribute('type')).toBe('button')
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false')
  })

  it('switches between password and text type on click without modifying value', () => {
    function ControlledTest() {
      const [val, setVal] = useState('MyP@ssw0rd!')
      return (
        <PasswordInput
          id="toggle-test"
          placeholder="Password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      )
    }

    render(<ControlledTest />)
    const input = screen.getByPlaceholderText('Password')
    const button = screen.getByRole('button')

    // Initial: concealed
    expect(input.getAttribute('type')).toBe('password')
    expect(input.value).toBe('MyP@ssw0rd!')
    expect(button.getAttribute('aria-label')).toBe('Show password')

    // Click to reveal
    fireEvent.click(button)
    expect(input.getAttribute('type')).toBe('text')
    expect(input.value).toBe('MyP@ssw0rd!')
    expect(button.getAttribute('aria-label')).toBe('Hide password')
    expect(button.getAttribute('aria-pressed')).toBe('true')

    // Click to conceal again
    fireEvent.click(button)
    expect(input.getAttribute('type')).toBe('password')
    expect(input.value).toBe('MyP@ssw0rd!')
    expect(button.getAttribute('aria-label')).toBe('Show password')
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('maintains independent visibility state across multiple password fields', () => {
    render(
      <form>
        <PasswordInput
          placeholder="Current password"
          value="current123"
          onChange={() => {}}
        />
        <PasswordInput
          placeholder="New password"
          value="new456"
          onChange={() => {}}
        />
      </form>
    )

    const currentInput = screen.getByPlaceholderText('Current password')
    const newInput = screen.getByPlaceholderText('New password')
    const buttons = screen.getAllByRole('button', { name: /Show password/i })
    expect(buttons.length).toBe(2)

    // Toggle only the first field
    fireEvent.click(buttons[0])

    // First field should now be text, second must remain password
    expect(currentInput.getAttribute('type')).toBe('text')
    expect(newInput.getAttribute('type')).toBe('password')

    // Toggle the second field
    fireEvent.click(buttons[1])
    expect(currentInput.getAttribute('type')).toBe('text')
    expect(newInput.getAttribute('type')).toBe('text')
  })

  it('prevents toggling when disabled or readOnly', () => {
    render(
      <div>
        <PasswordInput
          placeholder="Disabled field"
          value="locked"
          disabled
          onChange={() => {}}
        />
        <PasswordInput
          placeholder="ReadOnly field"
          value="frozen"
          readOnly
          onChange={() => {}}
        />
      </div>
    )

    const disabledInput = screen.getByPlaceholderText('Disabled field')
    const disabledBtn = screen.getAllByRole('button')[0]
    expect(disabledBtn.hasAttribute('disabled')).toBe(true)
    fireEvent.click(disabledBtn)
    expect(disabledInput.getAttribute('type')).toBe('password')

    const readOnlyInput = screen.getByPlaceholderText('ReadOnly field')
    const readOnlyBtn = screen.getAllByRole('button')[1]
    expect(readOnlyBtn.hasAttribute('disabled')).toBe(true)
    fireEvent.click(readOnlyBtn)
    expect(readOnlyInput.getAttribute('type')).toBe('password')
  })

  it('does not submit parent form when toggle button is clicked', () => {
    let formSubmitted = false
    render(
      <form onSubmit={(e) => { e.preventDefault(); formSubmitted = true }}>
        <PasswordInput
          placeholder="Form test password"
          value="secret"
          onChange={() => {}}
        />
      </form>
    )

    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(formSubmitted).toBe(false)
  })
})

describe('Page Content & AdSense Remediation Tests', () => {
  it('renders SiteFooter with copyright and developer credit', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    )

    expect(screen.getByText(/Dark Skull Corporation\. All rights reserved\./i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Naveed Mushtaq/i })).toBeTruthy()
  })

  it('defaults to light theme for new visitors and persists explicit toggle to dscThemePreferenceV2', () => {
    localStorage.clear()
    localStorage.setItem('siteTheme', 'dark')
    document.documentElement.removeAttribute('data-theme')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<SiteLayout session={null} systemStatus={null} onLogout={() => {}} />}>
            <Route path="/" element={<div>Theme Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')

    const toggleBtn = screen.getByRole('button', { name: /Switch to dark mode/i })
    fireEvent.click(toggleBtn)

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('dscThemePreferenceV2')).toBe('dark')

    fireEvent.click(toggleBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('dscThemePreferenceV2')).toBe('light')
  })
})



