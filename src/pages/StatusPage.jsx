import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { getFreePanelStatus, getSystemStatus, isAbortError } from '../services/dscApi'
import { formatDateTime, normalizeFreePanelResponse } from '../utils/format'

const contextNotices = {
  update: {
    label: 'Software Update',
    title: 'Update temporarily unavailable',
    description: "We couldn't reach the current update server. Please try again shortly.",
  },
  maintenance: {
    label: 'System Maintenance',
    title: "We'll be back shortly",
    description: 'DSCWeb is temporarily unavailable while maintenance is being performed.',
  },
  unavailable: {
    label: 'Service Unavailable',
    title: 'This service is temporarily unavailable',
    description: 'Please try again shortly.',
  },
  deployment: {
    label: 'Deployment',
    title: 'Changes are being deployed',
    description: 'New changes are currently being deployed. Please try again shortly.',
  },
}

const STATE_LABELS = {
  loading: 'Loading',
  available: 'Available',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
}

export function StatusPage({
  systemStatus: propSystemStatus = null,
  systemStatusState: propStatusState = 'unknown',
  lastCheckedAt: propLastCheckedAt = null,
  onRetry,
}) {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const contextNotice = typeParam ? contextNotices[typeParam] || null : null

  const [coreState, setCoreState] = useState(() =>
    propSystemStatus ? 'available' : propStatusState || 'unknown',
  )
  const [corePayload, setCorePayload] = useState(propSystemStatus)
  const [freePanelState, setFreePanelState] = useState('unknown')
  const [freePanelDetail, setFreePanelDetail] = useState('')
  const [lastChecked, setLastChecked] = useState(propLastCheckedAt)
  const [checkCount, setCheckCount] = useState(0)

  const runLiveStatusCheck = useCallback((signal) => {
    setCoreState('loading')
    setFreePanelState('loading')

    const sysPromise = Promise.resolve(getSystemStatus(signal))
      .then((res) => {
        if (signal?.aborted) return
        if (res && typeof res === 'object') {
          setCorePayload(res)
          setCoreState('available')
        } else {
          setCoreState('unavailable')
        }
      })
      .catch((err) => {
        if (signal?.aborted || isAbortError(err)) return
        setCoreState('unavailable')
      })

    const freePromise = Promise.resolve(getFreePanelStatus(signal))
      .then((res) => {
        if (signal?.aborted) return
        if (res && typeof res === 'object') {
          const normalized = normalizeFreePanelResponse(res)
          setFreePanelState('available')
          setFreePanelDetail(
            normalized.hasValidCredentials
              ? `Endpoint online · Free Panel active (${normalized.usedSlots}/${normalized.maxSlots} slots)`
              : 'Endpoint online · Free Panel credentials currently disabled by administrator',
          )
        } else {
          setFreePanelState('unavailable')
          setFreePanelDetail('Unexpected response from public Free Panel endpoint.')
        }
      })
      .catch((err) => {
        if (signal?.aborted || isAbortError(err)) return
        setFreePanelState('unavailable')
        setFreePanelDetail('Unable to reach /api/public/free-panel.')
      })

    return Promise.allSettled([sysPromise, freePromise]).then(() => {
      if (signal?.aborted) return
      setLastChecked(new Date().toISOString())
    })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    runLiveStatusCheck(controller.signal)
    return () => {
      controller.abort()
    }
  }, [runLiveStatusCheck, checkCount])

  useEffect(() => {
    if (propSystemStatus && typeof propSystemStatus === 'object') {
      setCorePayload(propSystemStatus)
      if (coreState === 'unknown') {
        setCoreState('available')
      }
    }
  }, [propSystemStatus, coreState])

  function handleRetry() {
    setCheckCount((c) => c + 1)
    onRetry?.()
  }

  const isChecking = coreState === 'loading' || freePanelState === 'loading'
  const effectivePayload = corePayload || propSystemStatus
  const isMaintenanceMode =
    effectivePayload?.isMaintenanceMode === true ||
    effectivePayload?.IsMaintenanceMode === true
  const maintenanceReason = String(
    effectivePayload?.maintenanceReason ?? effectivePayload?.MaintenanceReason ?? '',
  ).trim()

  let overallBadge = 'Status Unknown'
  let overallBadgeClass = 'status-badge-unknown'
  let overallTitle = 'System Status Not Yet Verified'
  let overallDescription =
    'Run a status check to verify current Dark Skull Corporation backend service reachability.'

  if (coreState === 'available' && isMaintenanceMode) {
    overallBadge = 'Maintenance Active'
    overallBadgeClass = 'status-badge-maintenance'
    overallTitle = 'Scheduled System Maintenance'
    overallDescription =
      maintenanceReason ||
      'DSC authentication and licensing services are temporarily in maintenance mode.'
  } else if (coreState === 'available' && freePanelState === 'available') {
    overallBadge = 'Verified Operational'
    overallBadgeClass = 'status-badge-available'
    overallTitle = 'Verified Services Operational'
    overallDescription =
      'Core system status and public Free Panel endpoints responded normally.'
  } else if (coreState === 'available' && freePanelState === 'unavailable') {
    overallBadge = 'Partial Degradation'
    overallBadgeClass = 'status-badge-maintenance'
    overallTitle = 'Core API Online · Free Panel Unavailable'
    overallDescription =
      'The core system status endpoint is reachable, but the public Free Panel service did not respond.'
  } else if (coreState === 'unavailable') {
    overallBadge = 'Backend Unavailable'
    overallBadgeClass = 'status-badge-unavailable'
    overallTitle = 'Backend API Currently Unreachable'
    overallDescription =
      'The DSC studio website is online, but the authentication and licensing backend could not be verified. Please retry shortly.'
  } else if (isChecking) {
    overallBadge = 'Checking Status'
    overallBadgeClass = 'status-badge-loading'
    overallTitle = 'Verifying Backend Services...'
    overallDescription =
      'Querying live Dark Skull Corporation endpoints to verify maintenance state and service availability.'
  }

  usePageMeta({
    ...SEO_ROUTES.status,
    title: contextNotice
      ? `System Status — ${contextNotice.label} | DSC`
      : SEO_ROUTES.status.title,
    description: contextNotice ? contextNotice.description : SEO_ROUTES.status.description,
  })

  const maintenanceDisplay =
    coreState === 'available' || (coreState === 'loading' && effectivePayload)
      ? isMaintenanceMode
        ? `Active${maintenanceReason ? ` — ${maintenanceReason}` : ''}`
        : 'Inactive (Normal Operation)'
      : coreState === 'loading'
        ? 'Checking maintenance status...'
        : 'Unknown (Backend Unverified)'

  return (
    <section className="status-layout">
      <div className="panel status-panel">
        <div className="status-header-row">
          <Link className="status-brand" to="/" aria-label="Dark Skull Corporation Home">
            <picture>
              <source srcSet="/images/dsclogo.webp" type="image/webp" />
              <img
                src="/images/dsclogo.png"
                alt="Dark Skull Corporation logo"
                className="status-logo"
                width="48"
                height="48"
              />
            </picture>
            <span className="status-brand-name">Dark Skull Corporation</span>
          </Link>
          <span
            className={`card-badge status-badge ${overallBadgeClass}`}
            data-testid="overall-status-badge"
          >
            {overallBadge}
          </span>
        </div>

        <div className="status-content">
          <h1>{overallTitle}</h1>
          <p>{overallDescription}</p>
        </div>

        {contextNotice ? (
          <div className="status-context-banner" role="note">
            <strong>{contextNotice.label}:</strong> {contextNotice.title} — {contextNotice.description}
          </div>
        ) : null}

        <div className="status-telemetry-grid" aria-label="Verified Service Status">
          <div className="status-telemetry-item">
            <div className="status-telemetry-info">
              <span className="status-service-name">Maintenance Mode Status</span>
              <span className="status-service-endpoint" data-testid="maintenance-status-text">
                {maintenanceDisplay}
              </span>
            </div>
            <span
              className={`status-pill status-pill-${
                coreState === 'available'
                  ? isMaintenanceMode
                    ? 'maintenance'
                    : 'available'
                  : coreState
              }`}
              data-testid="service-state-maintenance"
            >
              {coreState === 'available'
                ? isMaintenanceMode
                  ? 'Maintenance'
                  : 'Normal'
                : STATE_LABELS[coreState] || 'Unknown'}
            </span>
          </div>

          <div className="status-telemetry-item">
            <div className="status-telemetry-info">
              <span className="status-service-name">Core System &amp; Authentication API</span>
              <span className="status-service-endpoint">
                Endpoint: /api/admin/system-status
              </span>
            </div>
            <span
              className={`status-pill status-pill-${coreState}`}
              data-testid="service-state-core"
            >
              {STATE_LABELS[coreState] || 'Unknown'}
            </span>
          </div>

          <div className="status-telemetry-item">
            <div className="status-telemetry-info">
              <span className="status-service-name">Public Free Panel Service</span>
              <span className="status-service-endpoint">
                {freePanelDetail || 'Endpoint: /api/public/free-panel'}
              </span>
            </div>
            <span
              className={`status-pill status-pill-${freePanelState}`}
              data-testid="service-state-freepanel"
            >
              {STATE_LABELS[freePanelState] || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="status-meta-row" aria-live="polite">
          {lastChecked ? (
            <span className="status-last-checked" data-testid="status-last-checked">
              Last checked: {formatDateTime(lastChecked)}
            </span>
          ) : (
            <span className="status-last-checked" data-testid="status-last-checked">
              {isChecking ? 'Checking live endpoints...' : 'Not checked yet'}
            </span>
          )}
        </div>

        <div className="status-actions" aria-label="Status page actions">
          <button
            className="button button-primary"
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
          >
            {isChecking ? 'Checking Status...' : 'Retry Status Check'}
          </button>
          <Link className="button button-ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
