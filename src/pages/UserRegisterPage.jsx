import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, extractApiMessage, registerUser } from '../services/dscApi'
import {
  clearStoredSession,
  getSafeRedirectPath,
  persistSessionFromResponse,
  validateRegistrationInput,
} from '../utils/auth'
import { FullScreenLoader } from '../components/ui/FullScreenLoader'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function UserRegisterPage({ session, onSessionChange }) {
  usePageMeta(SEO_ROUTES.register)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const safeRedirectTarget = getSafeRedirectPath(redirectParam, '/pages/udash')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState('Creating your DSC account...')
  const [registrationComplete, setRegistrationComplete] = useState(false)

  if (session) {
    return (
      <Navigate
        replace
        to={session.role === 'Admin' ? '/pages/adash' : safeRedirectTarget}
      />
    )
  }

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (error) setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    const validation = validateRegistrationInput(form)
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    setLoading(true)
    setLoaderMessage('Creating your DSC account...')

    const wakeTimeout = setTimeout(() => {
      setLoaderMessage('Connecting to authentication server (this can take a few seconds)...')
    }, 4000)

    try {
      const payload = await registerUser({
        fullName: validation.cleaned.fullName,
        email: validation.cleaned.email,
        username: validation.cleaned.username,
        password: validation.cleaned.password,
      })

      clearTimeout(wakeTimeout)

      // If the registration endpoint returns a session JWT directly, sign the user in
      const nextSession = persistSessionFromResponse(payload, {
        username: validation.cleaned.username,
        email: validation.cleaned.email,
        fullName: validation.cleaned.fullName,
        plan: payload?.plan || 'Free',
        expiry: payload?.expiry || null,
      })

      if (nextSession && nextSession.role === 'User') {
        setLoaderMessage('Account created. Redirecting to your dashboard...')
        onSessionChange(nextSession)
        navigate(safeRedirectTarget)
        return
      }

      if (nextSession && nextSession.role !== 'User') {
        clearStoredSession()
      }

      // Account created without immediate token issuance — display verified confirmation state
      setRegistrationComplete(true)
    } catch (submitError) {
      clearTimeout(wakeTimeout)
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : extractApiMessage(
              submitError?.payload,
              submitError?.message || 'Unable to complete account registration.',
            )

      setError(message)
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } finally {
      clearTimeout(wakeTimeout)
      setLoading(false)
    }
  }

  const loginLinkTarget = redirectParam
    ? `/pages/ulogin?redirect=${encodeURIComponent(safeRedirectTarget)}`
    : '/pages/ulogin'

  if (registrationComplete) {
    return (
      <section className="auth-shell">
        <div className="auth-card">
          <span className="hero-eyebrow">Registration Complete</span>
          <h1>ACCOUNT CREATED</h1>
          <p className="auth-subtitle">
            Your Dark Skull Corporation account for{' '}
            <strong>{form.username.trim().toLowerCase()}</strong> has been registered. You can now
            sign in to access your Client Dashboard and manage project orders.
          </p>
          <div className="hero-actions mt-20">
            <Link className="button button-primary button-full" to={loginLinkTarget}>
              Proceed to Login
            </Link>
          </div>
          <div className="link-row">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-shell">
      <FullScreenLoader active={loading} message={loaderMessage} />
      <div className="auth-card auth-card-wide">
        <span className="hero-eyebrow">DSC Client Account</span>
        <h1>CREATE ACCOUNT</h1>
        <p className="auth-subtitle">
          Register a Dark Skull Corporation account to request development services, track project
          orders, and manage your software licenses in one dashboard.
        </p>

        <form
          className={`form-stack ${loading ? 'is-processing' : ''}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-grid-2">
            <label className="field" htmlFor="register-fullname">
              <span>Full Name</span>
              <input
                id="register-fullname"
                autoComplete="name"
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                required
                type="text"
                value={form.fullName}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? 'register-fullname-error' : undefined}
              />
              {fieldErrors.fullName ? (
                <span id="register-fullname-error" className="field-error-text" role="alert">
                  {fieldErrors.fullName}
                </span>
              ) : null}
            </label>

            <label className="field" htmlFor="register-email">
              <span>Email Address</span>
              <input
                id="register-email"
                autoComplete="email"
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                required
                type="email"
                value={form.email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
              />
              {fieldErrors.email ? (
                <span id="register-email-error" className="field-error-text" role="alert">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
          </div>

          <label className="field" htmlFor="register-username">
            <span>Username</span>
            <input
              id="register-username"
              autoComplete="username"
              onChange={(e) => handleFieldChange('username', e.target.value)}
              placeholder="Choose a unique username (3–32 characters)"
              disabled={loading}
              required
              type="text"
              value={form.username}
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={fieldErrors.username ? 'register-username-error' : undefined}
            />
            {fieldErrors.username ? (
              <span id="register-username-error" className="field-error-text" role="alert">
                {fieldErrors.username}
              </span>
            ) : null}
          </label>

          <div className="form-grid-2">
            <label className="field" htmlFor="register-password">
              <span>Password</span>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
                required
                value={form.password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
              />
              {fieldErrors.password ? (
                <span id="register-password-error" className="field-error-text" role="alert">
                  {fieldErrors.password}
                </span>
              ) : null}
            </label>

            <label className="field" htmlFor="register-confirm-password">
              <span>Confirm Password</span>
              <PasswordInput
                id="register-confirm-password"
                autoComplete="new-password"
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                disabled={loading}
                required
                value={form.confirmPassword}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined
                }
              />
              {fieldErrors.confirmPassword ? (
                <span
                  id="register-confirm-password-error"
                  className="field-error-text"
                  role="alert"
                >
                  {fieldErrors.confirmPassword}
                </span>
              ) : null}
            </label>
          </div>

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
                <span>Creating Account...</span>
              </span>
            ) : (
              <span>Create DSC Account</span>
            )}
          </button>
        </form>

        <div className="link-row">
          <Link to={loginLinkTarget}>Already have an account? Sign In</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </section>
  )
}
