import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, extractApiMessage, loginAdmin } from '../services/dscApi'
import { clearStoredSession, persistSessionFromResponse } from '../utils/auth'
import { FullScreenLoader } from '../components/ui/FullScreenLoader'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function AdminLoginPage({ session, onSessionChange }) {
  usePageMeta(SEO_ROUTES.alogin)

  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState('Checking admin credentials...')

  if (session) {
    return <Navigate replace to={session.role === 'Admin' ? '/pages/adash' : '/pages/udash'} />
  }

  function handleUsernameChange(event) {
    const val = event.target.value
    setForm((current) => ({ ...current, username: val }))
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: '' }))
    }
    if (error) setError('')
  }

  function handlePasswordChange(event) {
    const val = event.target.value
    setForm((current) => ({ ...current, password: val }))
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
    }
    if (error) setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    const trimmedUsername = form.username.trim()
    const rawPassword = form.password

    const errors = { username: '', password: '' }
    if (!trimmedUsername) {
      errors.username = 'Admin username is required.'
    }
    if (!rawPassword) {
      errors.password = 'Admin password is required.'
    }

    if (errors.username || errors.password) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setLoaderMessage('Checking admin credentials...')

    const wakeTimeout = setTimeout(() => {
      setLoaderMessage('Waking up server (this can take a few seconds)...')
    }, 4000)

    try {
      const payload = await loginAdmin({
        username: trimmedUsername,
        password: rawPassword,
      })

      clearTimeout(wakeTimeout)

      const nextSession = persistSessionFromResponse(payload, {
        isOwner:
          payload?.isOwner === true ||
          String(payload?.role || '').trim().toLowerCase() === 'owner',
        username: trimmedUsername,
      })

      if (!nextSession || nextSession.role !== 'Admin') {
        clearStoredSession()
        throw new Error('This account is not authorized for admin access.')
      }

      setLoaderMessage('Admin authentication verified. Redirecting...')
      onSessionChange(nextSession)
      navigate('/pages/adash')
    } catch (submitError) {
      clearTimeout(wakeTimeout)
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : extractApiMessage(submitError?.payload, submitError?.message || 'Login failed.')

      setError(message)
      // Security: Never persist or reuse failed passwords
      setForm((prev) => ({ ...prev, password: '' }))
    } finally {
      clearTimeout(wakeTimeout)
      setLoading(false)
    }
  }

  return (
    <section className="auth-shell">
      <FullScreenLoader active={loading} message={loaderMessage} />
      <div className="auth-card">
        <span className="hero-eyebrow">Admin Login</span>
        <h1>WELCOME BACK ADMIN</h1>

        <form className={`form-stack ${loading ? 'is-processing' : ''}`} onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="admin-username">
            <span>Admin Username</span>
            <input
              id="admin-username"
              autoComplete="username"
              onChange={handleUsernameChange}
              placeholder="Enter username"
              disabled={loading}
              required
              type="text"
              value={form.username}
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={fieldErrors.username ? 'admin-username-error' : undefined}
            />
            {fieldErrors.username ? (
              <span id="admin-username-error" className="field-error-text" role="alert">
                {fieldErrors.username}
              </span>
            ) : null}
          </label>

          <label className="field" htmlFor="admin-password">
            <span>Admin Password</span>
            <PasswordInput
              id="admin-password"
              autoComplete="current-password"
              onChange={handlePasswordChange}
              placeholder="Enter password"
              disabled={loading}
              required
              value={form.password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
            />
            {fieldErrors.password ? (
              <span id="admin-password-error" className="field-error-text" role="alert">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className={`button button-primary button-full ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="button-loading-content">
                <span className="spinner-inline" aria-hidden="true" />
                <span>Checking credentials...</span>
              </span>
            ) : (
              <span>Authenticate</span>
            )}
          </button>
        </form>

        <div className="link-row">
          <Link to="/pages/ulogin">User Login</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </section>
  )
}
