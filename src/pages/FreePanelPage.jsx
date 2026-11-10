import { useEffect, useRef, useState } from 'react'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { getFreePanelStatus } from '../services/dscApi'
import { normalizeFreePanelResponse } from '../utils/format'

function FreePanelUnavailableState() {
  return (
    <div id="freeOfflineMsg" className="form-error mt-16" role="status">
      <strong className="free-panel-status-title">Free Panel Not Available</strong>
      <span className="text-sm">
        The free panel is currently offline. Please check back later.
      </span>
    </div>
  )
}

function FreePanelAvailableSection({
  freeUser,
  freePass,
  freeLink,
  hasValidDownloadUrl,
  usedSlots,
  maxSlots,
  percentage,
  progressColor,
  isFull,
  copiedUser,
  copiedPass,
  onCopyUser,
  onCopyPass,
}) {
  return (
    <div id="freeAvailableBox">
      <div className="card free-panel-cred-card">
        <div className="free-panel-cred-row">
          <div className="free-panel-cred-info">
            <span className="micro-label">USERNAME</span>
            <h3 id="displayFreeUser" className="free-panel-cred-value">
              {freeUser}
            </h3>
          </div>
          <button
            id="copyUserBtn"
            className="button button-secondary button-sm shrink-0"
            onClick={onCopyUser}
            type="button"
          >
            {copiedUser ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="free-panel-cred-row free-panel-cred-row-divider">
          <div className="free-panel-cred-info">
            <span className="micro-label">PASSWORD</span>
            <h3 id="displayFreePass" className="free-panel-cred-value">
              {freePass}
            </h3>
          </div>
          <button
            id="copyPassBtn"
            className="button button-secondary button-sm shrink-0"
            onClick={onCopyPass}
            type="button"
          >
            {copiedPass ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-header free-panel-progress-header">
          <span>Slots Availability</span>
          <span id="displayRemainingText" className="free-panel-slots-count">
            {usedSlots} / {maxSlots} Slots Used
          </span>
        </div>
        <div className="progress-track">
          <div
            id="slotProgressBar"
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>

      {isFull ? (
        <div id="freeFullMsg" className="form-error alert-warning-box mt-16" role="status">
          <strong className="free-panel-status-title">Slots Full</strong>
          <span className="text-main text-sm">
            No Slot is Available. Existing users can still download.
          </span>
        </div>
      ) : null}

      <div className="free-panel-download-wrap">
        {hasValidDownloadUrl ? (
          <a
            id="freePanelDownloadBtn"
            className="button button-primary button-lg w-100"
            href={freeLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">📥 </span>Download Free Panel
          </a>
        ) : (
          <button
            id="freePanelDownloadBtn"
            type="button"
            className="button button-secondary button-lg w-100"
            disabled
            aria-disabled="true"
          >
            Download Link Unavailable
          </button>
        )}
      </div>
    </div>
  )
}

export function FreePanelPage() {
  usePageMeta(SEO_ROUTES.freepanel)

  const [copiedUserValue, setCopiedUserValue] = useState('')
  const [copiedPassValue, setCopiedPassValue] = useState('')
  const userTimerRef = useRef(null)
  const passTimerRef = useRef(null)

  const { data, error, loading } = useRemoteResource(getFreePanelStatus, [])

  const normalized = normalizeFreePanelResponse(data)
  const {
    freeUser,
    freePass,
    freeLink,
    usedSlots,
    maxSlots,
    hasValidCredentials,
    hasValidDownloadUrl,
  } = normalized

  const copiedUser = Boolean(freeUser && copiedUserValue === freeUser)
  const copiedPass = Boolean(freePass && copiedPassValue === freePass)

  const showAvailablePanel = Boolean(!error && hasValidCredentials)
  const remaining = maxSlots - usedSlots
  const percentage = maxSlots > 0 ? Math.min(Math.max((usedSlots / maxSlots) * 100, 0), 100) : 0
  const isFull = remaining <= 0

  let progressColor = 'var(--success)'
  if (percentage > 85) {
    progressColor = 'var(--danger)'
  } else if (percentage > 60) {
    progressColor = 'var(--warning)'
  }

  useEffect(() => {
    return () => {
      if (userTimerRef.current) clearTimeout(userTimerRef.current)
      if (passTimerRef.current) clearTimeout(passTimerRef.current)
    }
  }, [])

  async function handleCopyUser() {
    if (!freeUser) return
    try {
      await navigator.clipboard?.writeText(freeUser)
      setCopiedUserValue(freeUser)
      if (userTimerRef.current) clearTimeout(userTimerRef.current)
      userTimerRef.current = setTimeout(() => setCopiedUserValue(''), 1500)
    } catch {
      setCopiedUserValue('')
    }
  }

  async function handleCopyPass() {
    if (!freePass) return
    try {
      await navigator.clipboard?.writeText(freePass)
      setCopiedPassValue(freePass)
      if (passTimerRef.current) clearTimeout(passTimerRef.current)
      passTimerRef.current = setTimeout(() => setCopiedPassValue(''), 1500)
    } catch {
      setCopiedPassValue('')
    }
  }

  return (
    <div className="center-wrap auth-shell">
      <section className="panel auth-card free-panel-card">
        <div className="logo-mark free-panel-icon-60 mb-14">
          <picture>
            <source srcSet="/images/dsclogo.webp" type="image/webp" />
            <img
              src="/images/dsclogo.png"
              alt="Dark Skull Corporation"
              className="header-logo-img"
              width="60"
              height="60"
            />
          </picture>
        </div>
        <h1 className="auth-title">Free Panel Access</h1>
        <p className="auth-subtitle">Public test credentials and direct download access.</p>

        {loading ? (
          <div id="freePanelLoader" className="free-panel-loader">
            <div className="skeleton-line free-panel-skeleton-row" />
            <div className="skeleton-line free-panel-skeleton-row" />
            <div className="skeleton-line free-panel-skeleton-bar" />
          </div>
        ) : null}

        {!loading ? (
          <div id="freePanelContent">
            {showAvailablePanel ? (
              <FreePanelAvailableSection
                copiedPass={copiedPass}
                copiedUser={copiedUser}
                freeLink={freeLink}
                freePass={freePass}
                freeUser={freeUser}
                hasValidDownloadUrl={hasValidDownloadUrl}
                isFull={isFull}
                maxSlots={maxSlots}
                onCopyPass={handleCopyPass}
                onCopyUser={handleCopyUser}
                percentage={percentage}
                progressColor={progressColor}
                usedSlots={usedSlots}
              />
            ) : (
              <FreePanelUnavailableState />
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
