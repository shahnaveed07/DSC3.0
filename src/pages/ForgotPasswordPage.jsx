import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ApiError,
  confirmPasswordReset,
  extractApiMessage,
  requestPasswordRecovery,
} from '../services/dscApi'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function ForgotPasswordPage({ session }) {
  usePageMeta(SEO_ROUTES.forgotPassword)

  const [step, setStep] = useState('request') // 'request' | 'reset' | 'complete'
  const [identifier, setIdentifier] = useState('')
  const [identifierError, setIdentifierError] = useState('')

  const [resetForm, setResetForm] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [resetErrors, setResetErrors] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  if (session) {
    return <Navigate replace to={session.role === 'Admin' ? '/pages/adash' : '/pages/udash'} />
  }

  async function handleRequestSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    setStatusMessage('')
    const cleaned = identifier.trim()

    if (!cleaned) {
      setIdentifierError('Email address or username is required.')
      return
    }

    setIdentifierError('')
    setLoading(true)

    try {
      const response = await requestPasswordRecovery({ email: cleaned })
      const msg = extractApiMessage(
        response,
        'Recovery instructions have been initiated. Enter your recovery code below to set a new password.',
      )
      setStatusMessage(msg)
      setStep('reset')
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : extractApiMessage(
              requestError?.payload,
              requestError?.message || 'Unable to process password recovery request.',
            )
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    const cleanedIdentifier = identifier.trim()
    const cleanedToken = resetForm.token.trim()
    const rawNewPassword = resetForm.newPassword
    const rawConfirmPassword = resetForm.confirmPassword

    const nextErrors = { token: '', newPassword: '', confirmPassword: '' }
    if (!cleanedIdentifier) {
      setIdentifierError('Email address or username is required.')
    }
    if (!cleanedToken) {
      nextErrors.token = 'Recovery token or verification code is required.'
    }
    if (!rawNewPassword) {
      nextErrors.newPassword = 'New password is required.'
    } else if (rawNewPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters.'
    }
    if (!rawConfirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.'
    } else if (rawNewPassword && rawNewPassword !== rawConfirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (
      !cleanedIdentifier ||
      nextErrors.token ||
      nextErrors.newPassword ||
      nextErrors.confirmPassword
    ) {
      setResetErrors(nextErrors)
      return
    }

    setResetErrors({ token: '', newPassword: '', confirmPassword: '' })
    setLoading(true)

    try {
      const response = await confirmPasswordReset({
        email: cleanedIdentifier,
        token: cleanedToken,
        newPassword: rawNewPassword,
      })
      const msg = extractApiMessage(
        response,
        'Your password has been updated. You can now sign in with your new credentials.',
      )
      setStatusMessage(msg)
      setStep('complete')
    } catch (resetError) {
      const message =
        resetError instanceof ApiError
          ? resetError.message
          : extractApiMessage(
              resetError?.payload,
              resetError?.message || 'Unable to reset password with the provided token.',
            )
      setError(message)
      setResetForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'complete') {
    return (
      <section className="auth-shell">
        <div className="auth-card">
          <span className="hero-eyebrow">Password Updated</span>
          <h1>RECOVERY COMPLETE</h1>
          <p className="auth-subtitle">{statusMessage}</p>
          <div className="hero-actions mt-20">
            <Link className="button button-primary button-full" to="/pages/ulogin">
              Return to Login
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="hero-eyebrow">Account Recovery</span>
        <h1>{step === 'request' ? 'FORGOT PASSWORD' : 'RESET PASSWORD'}</h1>
        <p className="auth-subtitle">
          {step === 'request'
            ? 'Enter the email address or username associated with your DSC account to request a password reset.'
            : 'Enter the recovery verification code and choose a new password for your DSC account.'}
        </p>

        {statusMessage ? (
          <div className="status-banner mb-16" role="status">
            {statusMessage}
          </div>
        ) : null}

        {step === 'request' ? (
          <form
            className={`form-stack ${loading ? 'is-processing' : ''}`}
            onSubmit={handleRequestSubmit}
            noValidate
          >
            <label className="field" htmlFor="recovery-identifier">
              <span>Email Address or Username</span>
              <input
                id="recovery-identifier"
                autoComplete="username"
                disabled={loading}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  if (identifierError) setIdentifierError('')
                  if (error) setError('')
                }}
                placeholder="Enter your registered email or username"
                required
                type="text"
                value={identifier}
                aria-invalid={Boolean(identifierError)}
                aria-describedby={identifierError ? 'recovery-identifier-error' : undefined}
              />
              {identifierError ? (
                <span id="recovery-identifier-error" className="field-error-text" role="alert">
                  {identifierError}
                </span>
              ) : null}
            </label>

            {error ? (
              <div className="form-error" role="alert">
                <p className="m-0">{error}</p>
                <p className="mt-8 text-xs text-muted m-0">
                  Need administrator-assisted recovery? Contact DSC support via{' '}
                  <Link to="/contact" className="text-primary">
                    Contact Page
                  </Link>{' '}
                  or verified Discord to request a temporary password reset.
                </p>
              </div>
            ) : null}

            <button
              className={`button button-primary button-full ${loading ? 'is-loading' : ''}`}
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Requesting Recovery...</span>
                </span>
              ) : (
                <span>Send Recovery Request</span>
              )}
            </button>

            <div className="text-center mt-8">
              <button
                type="button"
                className="button button-ghost button-sm"
                onClick={() => {
                  setError('')
                  setStep('reset')
                }}
              >
                Already have a recovery code? Enter it here
              </button>
            </div>
          </form>
        ) : (
          <form
            className={`form-stack ${loading ? 'is-processing' : ''}`}
            onSubmit={handleResetSubmit}
            noValidate
          >
            <label className="field" htmlFor="recovery-account-id">
              <span>Email Address or Username</span>
              <input
                id="recovery-account-id"
                autoComplete="username"
                disabled={loading}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  if (identifierError) setIdentifierError('')
                  if (error) setError('')
                }}
                placeholder="Enter your registered email or username"
                required
                type="text"
                value={identifier}
              />
              {identifierError ? (
                <span className="field-error-text" role="alert">
                  {identifierError}
                </span>
              ) : null}
            </label>

            <label className="field" htmlFor="recovery-token">
              <span>Recovery Token / Code</span>
              <input
                id="recovery-token"
                autoComplete="one-time-code"
                disabled={loading}
                onChange={(e) => {
                  setResetForm((prev) => ({ ...prev, token: e.target.value }))
                  if (resetErrors.token) setResetErrors((prev) => ({ ...prev, token: '' }))
                  if (error) setError('')
                }}
                placeholder="Enter verification code"
                required
                type="text"
                value={resetForm.token}
              />
              {resetErrors.token ? (
                <span className="field-error-text" role="alert">
                  {resetErrors.token}
                </span>
              ) : null}
            </label>

            <label className="field" htmlFor="recovery-new-password">
              <span>New Password</span>
              <PasswordInput
                id="recovery-new-password"
                autoComplete="new-password"
                disabled={loading}
                onChange={(e) => {
                  setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  if (resetErrors.newPassword) {
                    setResetErrors((prev) => ({ ...prev, newPassword: '' }))
                  }
                  if (error) setError('')
                }}
                placeholder="At least 6 characters"
                required
                value={resetForm.newPassword}
              />
              {resetErrors.newPassword ? (
                <span className="field-error-text" role="alert">
                  {resetErrors.newPassword}
                </span>
              ) : null}
            </label>

            <label className="field" htmlFor="recovery-confirm-password">
              <span>Confirm New Password</span>
              <PasswordInput
                id="recovery-confirm-password"
                autoComplete="new-password"
                disabled={loading}
                onChange={(e) => {
                  setResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  if (resetErrors.confirmPassword) {
                    setResetErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }
                  if (error) setError('')
                }}
                placeholder="Re-enter new password"
                required
                value={resetForm.confirmPassword}
              />
              {resetErrors.confirmPassword ? (
                <span className="field-error-text" role="alert">
                  {resetErrors.confirmPassword}
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
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Confirm Password Reset</span>
              )}
            </button>

            <div className="text-center mt-8">
              <button
                type="button"
                className="button button-ghost button-sm"
                onClick={() => {
                  setError('')
                  setStep('request')
                }}
              >
                ← Back to Recovery Request
              </button>
            </div>
          </form>
        )}

        <div className="link-row">
          <Link to="/pages/ulogin">Back to Login</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </section>
  )
}
