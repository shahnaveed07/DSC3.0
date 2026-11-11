import { useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, extractApiMessage, isAuthError } from '../services/dscApi'
import { PasswordInput } from '../components/ui/PasswordInput'
import { updateStoredSession } from '../utils/auth'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function ChangePasswordPage({ session, onSessionInvalid, onSessionUpdate }) {
  usePageMeta(SEO_ROUTES.change)
  const isFree = String(session?.plan || '').trim().toLowerCase() === 'free'
  const mustChange = Boolean(session?.mustChangePassword)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [error, setError] = useState(isFree ? 'Free users cannot change password.' : '')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (String(session?.plan || '').trim().toLowerCase() === 'free') {
      setError('Free users cannot change password.')
      return
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from the current password.')
      return
    }

    setLoading(true)

    try {
      await changePassword(session.token, form.currentPassword, form.newPassword)
      setSuccess('Password updated successfully. You may now access your dashboard.')
      setForm({ currentPassword: '', newPassword: '' })
      if (mustChange) {
        const updated = updateStoredSession({ mustChangePassword: false })
        if (onSessionUpdate && updated) {
          onSessionUpdate(updated)
        }
      }
    } catch (submitError) {
      if (isAuthError(submitError)) {
        onSessionInvalid()
        return
      }
      if (submitError?.status === 403) {
        setError(
          extractApiMessage(
            submitError.payload,
            'Access denied: You do not have permission to change this password.',
          ),
        )
        return
      }
      setError(extractApiMessage(submitError.payload, submitError.message || 'Password update failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="hero-eyebrow">Security Settings</span>
        <h1>Change Password</h1>

        {mustChange ? (
          <div className="form-error mb-16 alert-warning-box">
            <strong>Password Reset Required</strong>
            <p className="mt-4 text-sm text-main mb-0">
              Your account requires a new password before you can access the user dashboard and software downloads.
            </p>
          </div>
        ) : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Current Password</span>
            <PasswordInput
              autoComplete="current-password"
              disabled={loading || isFree}
              onChange={(event) =>
                setForm((current) => ({ ...current, currentPassword: event.target.value }))
              }
              placeholder="Enter current password"
              required
              value={form.currentPassword}
            />
          </label>

          <label className="field">
            <span>New Password (minimum 6 characters)</span>
            <PasswordInput
              autoComplete="new-password"
              disabled={loading || isFree}
              minLength={6}
              onChange={(event) =>
                setForm((current) => ({ ...current, newPassword: event.target.value }))
              }
              placeholder="Enter new password (min. 6 characters)"
              required
              value={form.newPassword}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button
            className={`button button-primary ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="button-loading-content">
                <span className="spinner-inline" aria-hidden="true" />
                <span>Updating...</span>
              </span>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        <div className="link-row">
          <Link to="/pages/udash">Back to Dashboard</Link>
        </div>
      </div>
    </section>
  )
}
