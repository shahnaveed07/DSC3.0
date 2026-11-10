import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  extractApiMessage,
  getCurrentOrder,
  getSecureDownload,
  isAuthError,
} from '../services/dscApi'
import { evaluateSubscriptionExpiry, formatDateTime } from '../utils/format'

export function UserDashboardPage({ session, onSessionInvalid }) {
  usePageMeta(SEO_ROUTES.udash)
  const [copiedKey, setCopiedKey] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const { data, error, loading } = useRemoteResource(
    (signal) => getCurrentOrder(session.token, signal),
    [session?.token, reloadCount],
    { enabled: Boolean(session?.token) },
  )

  useEffect(() => {
    if (isAuthError(error)) onSessionInvalid()
  }, [error, onSessionInvalid])

  if (loading) {
    return (
      <div className="center-wrap">
        <section className="panel text-center">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-bar" />
          <p className="text-muted">Retrieving your order and subscription status...</p>
        </section>
      </div>
    )
  }

  const is404NoOrder = error?.status === 404
  const fatalError = error && !is404NoOrder && !isAuthError(error) ? error : null

  const rawStatus = String(data?.status ?? data?.Status ?? '').trim()
  const hasOrderData = Boolean(
    !is404NoOrder &&
      !fatalError &&
      data &&
      typeof data === 'object' &&
      (rawStatus || data.plan || data.Plan || data.key || data.Key || data.orderId || data.id),
  )
  const isNoOrder = is404NoOrder || (!fatalError && !hasOrderData)

  const liveStatus = isNoOrder ? 'NO ACTIVE ORDERS' : rawStatus || 'Pending'
  const normalizedStatus = liveStatus.toLowerCase()
  const isApproved = !isNoOrder && normalizedStatus === 'approved'
  const isRejected = !isNoOrder && normalizedStatus === 'rejected'
  const isPending = !isNoOrder && !fatalError && !isApproved && !isRejected

  const livePlan = String(data?.plan ?? data?.Plan ?? session?.plan ?? 'Temp').trim() || 'Temp'
  const isFreePlan = livePlan.toLowerCase() === 'free'
  const liveExpiry =
    data?.expiry ??
    data?.Expiry ??
    data?.expiryTime ??
    data?.ExpiryTime ??
    session?.expiry ??
    null

  const isExpired = evaluateSubscriptionExpiry({
    data,
    session,
    liveExpiry,
    isPending,
    isNoOrder,
  })

  const orderKey = isNoOrder
    ? ''
    : String(data?.key ?? data?.Key ?? data?.licenseKey ?? data?.LicenseKey ?? '').trim()
  const keyUsed = Boolean(data?.isKeyUsed ?? data?.IsKeyUsed)

  async function handleCopyKey() {
    if (!orderKey) return
    await navigator.clipboard.writeText(orderKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 1500)
  }

  async function handleDownload() {
    if (!isApproved) return
    setDownloadLoading(true)
    setDownloadError('')

    try {
      const downloadPlan = livePlan.toLowerCase() === 'aimassist' ? 'aimbot' : livePlan.toLowerCase()
      const payload = await getSecureDownload(session.token, downloadPlan)
      const downloadUrl = payload?.url ?? payload?.Url

      if (!downloadUrl) {
        throw new Error('Download URL could not be retrieved.')
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (downloadIssue) {
      if (isAuthError(downloadIssue)) {
        onSessionInvalid()
        return
      }
      setDownloadError(
        extractApiMessage(
          downloadIssue.payload,
          downloadIssue.message || 'Download failed. Please try again.',
        ),
      )
    } finally {
      setDownloadLoading(false)
    }
  }

  const statusColorClass = isNoOrder
    ? 'text-muted'
    : isApproved
      ? 'text-success'
      : isRejected
        ? 'text-danger'
        : 'text-warning'

  const statusIconSymbol = isNoOrder
    ? '📋'
    : isApproved
      ? '✅'
      : isRejected
        ? '❌'
        : '⏳'

  return (
    <div className="center-wrap">
      <section className="panel">
        <div className="dashboard-header-flex">
          <div>
            <span className="hero-eyebrow">Client Portal</span>
            <h1 className="auth-title mt-6">
              Welcome, {String(session?.username || 'User').toUpperCase()}
            </h1>
          </div>
          <div className="flex gap-10 flex-wrap">
            {!isFreePlan ? (
              <NavLink to="/pages/change" className="button button-secondary button-sm">
                Change Password
              </NavLink>
            ) : null}
            <NavLink to="/pages/catalog" className="button button-ghost button-sm">
              Upgrade / Renew
            </NavLink>
          </div>
        </div>

        {/* Fatal API / Network Error Banner (Non-404) */}
        {fatalError ? (
          <div className="form-error mb-24 flex items-center justify-between flex-wrap gap-12" role="alert">
            <div>
              <strong>Unable to Load Order Status</strong>
              <p className="mt-4 text-sm text-main">
                {extractApiMessage(
                  fatalError.payload,
                  fatalError.message || 'Could not retrieve your order details at this time.',
                )}
              </p>
            </div>
            <button
              type="button"
              className="button button-secondary button-sm"
              onClick={() => setReloadCount((c) => c + 1)}
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Status Alerts */}
        {isPending ? (
          <div className="form-error mb-24 alert-warning-box">
            <div>
              <strong>⚠️ Order Pending Review</strong>
              <p className="mt-4 text-sm text-main">
                Your order is currently awaiting admin verification. Access keys and downloads will be enabled once approved.
              </p>
            </div>
          </div>
        ) : null}

        {isExpired ? (
          <div className="form-error mb-24 flex items-center justify-between flex-wrap gap-12">
            <div>
              <strong>⛔ Subscription Expired</strong>
              <p className="mt-4 text-sm text-main">
                Your access has expired. Please renew your plan from the products catalog to restore access.
              </p>
            </div>
            <NavLink to="/pages/catalog" className="button button-primary button-sm">
              Renew Access
            </NavLink>
          </div>
        ) : null}

        {isRejected ? (
          <div className="form-error mb-24">
            <strong>❌ Order Not Approved</strong>
            <p className="mt-4 text-sm text-main">
              Your order could not be verified. Please contact support on Discord or submit a valid payment proof.
            </p>
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Username</p>
            <div id="dashUsername" className="stat-value">
              {String(session?.username || 'User').toUpperCase()}
            </div>
          </div>

          <div className="stat-card">
            <p className="stat-label">Active Plan</p>
            <div id="dashPlan" className="stat-value text-primary">
              {livePlan.toUpperCase()}
            </div>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              <span id="expiryIcon">{isExpired ? '🔴' : '🟢'}</span> Expiry
            </p>
            <div
              id="dashExpiry"
              className={`stat-value text-base ${isExpired ? 'text-danger' : 'text-success'}`}
            >
              {liveExpiry ? formatDateTime(liveExpiry) : 'No active expiry'}
            </div>
          </div>

          <div className="stat-card" id="status-card">
            <p className="stat-label">
              <span id="statusIcon">{statusIconSymbol}</span> Order Status
            </p>
            <div
              id="dashOrderStatus"
              className={`stat-value ${statusColorClass}`}
            >
              {liveStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* License Key Card */}
        <div className="card mb-24" id="key-card">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-10">
            <span className="micro-label">LICENSE KEY</span>
            <span
              className={`badge ${
                isNoOrder
                  ? 'warning'
                  : isApproved
                    ? keyUsed
                      ? 'warning'
                      : 'good'
                    : 'warning'
              }`}
            >
              {isNoOrder ? 'No Order' : isApproved ? (keyUsed ? 'Used' : 'Active') : 'Pending'}
            </span>
          </div>

          <div
            id="dashOrderKey"
            className={`license-key-box ${orderKey ? '' : 'is-empty'}`}
          >
            {isNoOrder
              ? 'No Active Order'
              : orderKey || 'Key will be issued upon admin approval'}
          </div>

          {!isNoOrder && orderKey ? (
            <div className="mt-14">
              <button
                id="copyDashKeyBtn"
                className="button button-secondary button-sm"
                onClick={handleCopyKey}
                type="button"
              >
                {copiedKey ? 'Copied!' : 'Copy License Key'}
              </button>
            </div>
          ) : null}
        </div>

        {/* Download Section */}
        {!isNoOrder && isApproved ? (
          <div className="card">
            <span className="micro-label">SOFTWARE DOWNLOAD</span>
            <h3 className="my-8 text-lg font-bold">Verified Panel Package</h3>
            <p className="text-muted text-sm mb-18">
              Your account is approved. Fetch your secure binary build for {livePlan.toUpperCase()} directly.
            </p>

            {downloadError ? (
              <div className="form-error mb-14">
                {downloadError}
              </div>
            ) : null}

            <button
              id="downloadPanelBtn"
              className={`button button-primary button-lg btn-download ${downloadLoading ? 'is-loading' : ''}`}
              disabled={downloadLoading}
              onClick={handleDownload}
              type="button"
            >
              {downloadLoading ? (
                <span className="button-loading-content">
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Retrieving Package...</span>
                </span>
              ) : (
                <>
                  <span aria-hidden="true">📥 </span>
                  <span>Download {livePlan.toUpperCase()} Panel</span>
                </>
              )}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
