import { useState } from 'react'
import { Link } from 'react-router-dom'
import { extractApiMessage, generateAdminKey, isAuthError } from '../services/dscApi'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

const plans = ['free', 'streamer', 'sniper', 'special', 'aimbot', 'premium', 'customised']

export function GenerateKeyPage({ session, onSessionInvalid }) {
  usePageMeta(SEO_ROUTES.generatekey)
  const [plan, setPlan] = useState('')
  const [validDays, setValidDays] = useState('')
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setKey('')

    const normalizedPlan = String(plan || '').trim().toLowerCase()
    if (!plans.includes(normalizedPlan)) {
      setError('Please select a valid software plan.')
      return
    }

    const parsedDays = Number(validDays)
    if (!validDays || !Number.isInteger(parsedDays) || parsedDays < 1) {
      setError('Valid days must be a positive whole number (at least 1 day).')
      return
    }

    setLoading(true)

    try {
      const result = await generateAdminKey(session.token, normalizedPlan, parsedDays)
      const issued = String(
        result?.key ?? result?.Key ?? result?.licenseKey ?? result?.LicenseKey ?? '',
      ).trim()
      if (!issued) throw new Error('Server returned an invalid key.')
      setKey(issued)
    } catch (issue) {
      if (isAuthError(issue)) {
        onSessionInvalid()
      } else {
        setError(extractApiMessage(issue.payload, issue.message || 'Failed to generate key.'))
      }
    } finally {
      setLoading(false)
    }
  }

  async function copyKey() {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="hero-eyebrow">Licensing Authority</span>
        <h1>Generate Access Key</h1>

        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Select Plan</span>
            <select
              required
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
            >
              <option value="">-- Choose a Plan --</option>
              {plans.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/^./, (c) => c.toUpperCase())} Panel
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Valid Days</span>
            <input
              required
              min="1"
              step="1"
              type="number"
              placeholder="e.g. 30"
              value={validDays}
              onChange={(event) => setValidDays(event.target.value)}
            />
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <button
            className={`button button-primary ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <span className="button-loading-content">
                <span className="spinner-inline" aria-hidden="true" />
                <span>Generating...</span>
              </span>
            ) : (
              <span>Generate License Key</span>
            )}
          </button>
        </form>

        {key ? (
          <article className="generated-key-card">
            <span className="micro-label">GENERATED KEY</span>
            <div className="generated-key-value">
              {key}
            </div>
            <button className="button button-secondary button-sm" onClick={copyKey} type="button">
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </article>
        ) : null}

        <div className="link-row">
          <Link to="/pages/adash">Back to Dashboard</Link>
        </div>
      </div>
    </section>
  )
}
