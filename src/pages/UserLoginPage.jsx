import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, extractApiMessage, loginUser } from '../services/dscApi'
import { clearStoredSession, persistSessionFromResponse } from '../utils/auth'
import { FullScreenLoader } from '../components/ui/FullScreenLoader'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function UserLoginPage({ session, onSessionChange }) {
  usePageMeta(SEO_ROUTES.ulogin)

  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState('Checking credentials...')

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
      errors.username = 'Username is required.'
    }
    if (!rawPassword) {
      errors.password = 'Password is required.'
    }

    if (errors.username || errors.password) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setLoaderMessage('Checking credentials...')

    const wakeTimeout = setTimeout(() => {
      setLoaderMessage('Waking up server (this can take a few seconds)...')
    }, 4000)

    try {
      const payload = await loginUser({
        username: trimmedUsername,
        password: rawPassword,
      })

      clearTimeout(wakeTimeout)

      const nextSession = persistSessionFromResponse(payload, {
        expiry: payload?.expiry,
        plan: payload?.plan,
        username: trimmedUsername,
      })

      if (!nextSession || nextSession.role !== 'User') {
        clearStoredSession()
        throw new Error('This account is not allowed on the user login page.')
      }

      if (nextSession.mustChangePassword) {
        setLoaderMessage('Password update required. Redirecting...')
        onSessionChange(nextSession)
        navigate('/pages/change')
        return
      }

      setLoaderMessage('Login successful. Redirecting...')
      onSessionChange(nextSession)
      navigate('/pages/udash')
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
        <span className="hero-eyebrow">User Login</span>
        <h1>WELCOME BACK</h1>

        <form className={`form-stack ${loading ? 'is-processing' : ''}`} onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="user-username">
            <span>Username</span>
            <input
              id="user-username"
              autoComplete="username"
              onChange={handleUsernameChange}
              placeholder="Enter username"
              disabled={loading}
              required
              type="text"
              value={form.username}
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username ? (
              <span id="username-error" className="field-error-text" role="alert">
                {fieldErrors.username}
              </span>
            ) : null}
          </label>

          <label className="field" htmlFor="user-password">
            <span>Password</span>
            <PasswordInput
              id="user-password"
              autoComplete="current-password"
              onChange={handlePasswordChange}
              placeholder="Enter password"
              disabled={loading}
              required
              value={form.password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password ? (
              <span id="password-error" className="field-error-text" role="alert">
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
                <span>Logging in...</span>
              </span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        <div className="link-row">
          <Link to="/pages/alogin">Admin Portal</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </section>
  )
}
