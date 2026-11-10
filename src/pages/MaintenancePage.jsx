import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function MaintenancePage({ systemStatus, onRetry }) {
  usePageMeta(SEO_ROUTES.maintenance)
  const [retrying, setRetrying] = useState(false)

  const reason =
    systemStatus?.maintenanceReason ||
    systemStatus?.MaintenanceReason ||
    'DSCWeb is temporarily offline while critical system updates or routine maintenance operations are performed. We will be back shortly.'

  async function handleRetry() {
    setRetrying(true)
    try {
      if (typeof onRetry === 'function') {
        await onRetry()
      } else {
        window.location.reload()
      }
    } finally {
      setTimeout(() => setRetrying(false), 600)
    }
  }

  return (
    <div className="maintenance-container">
      <div className="maintenance-icon">
        <svg
          width="42"
          height="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="maintenance-title">SYSTEM MAINTENANCE</h1>

      <p className="maintenance-text">{reason}</p>

      <div className="maintenance-buttons">
        <button
          type="button"
          className={`button button-primary ${retrying ? 'is-loading' : ''}`}
          disabled={retrying}
          onClick={handleRetry}
        >
          {retrying ? (
            <span className="button-loading-content">
              <span className="spinner-inline" aria-hidden="true" />
              <span>Checking Status...</span>
            </span>
          ) : (
            <span>Try Again</span>
          )}
        </button>

        <Link to="/pages/alogin" className="button button-secondary">
          Admin Login
        </Link>

        <a
          className="button button-ghost"
          href="https://discord.gg/XB2Zjmsb7K"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord Support ↗
        </a>
      </div>
    </div>
  )
}
