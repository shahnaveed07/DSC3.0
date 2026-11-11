import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { PasswordInput } from '../components/ui/PasswordInput'
import {
  ApiError,
  changePassword,
  extractApiMessage,
  getCurrentOrder,
  getSecureDownload,
  isAuthError,
  updateUserProfile,
} from '../services/dscApi'
import { updateStoredSession } from '../utils/auth'
import {
  evaluateSubscriptionExpiry,
  formatDateTime,
  normalizeUserOrdersPayload,
} from '../utils/format'

const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'My Orders' },
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Account Security' },
]

export function UserDashboardPage({
  session,
  onSessionInvalid,
  onSessionUpdate,
  onLogout,
}) {
  usePageMeta(SEO_ROUTES.udash)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  // Profile tab state
  const [profileForm, setProfileForm] = useState({
    fullName: session?.fullName || '',
    email: session?.email || '',
    discordId: session?.discordId || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Account Security (Password Change) tab state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securityError, setSecurityError] = useState('')
  const [securitySuccess, setSecuritySuccess] = useState('')

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
  const hasSingleOrderFields = Boolean(
    data &&
      typeof data === 'object' &&
      (rawStatus ||
        data.plan ||
        data.Plan ||
        data.key ||
        data.Key ||
        data.orderId ||
        data.id ||
        Array.isArray(data.orders) ||
        Array.isArray(data.Orders)),
  )
  const isNoOrder = is404NoOrder || (!fatalError && !hasSingleOrderFields)

  const orderSummary = normalizeUserOrdersPayload(data, session, isNoOrder || Boolean(fatalError))
  const { orders, totalOrders, activeOrders, completedOrders, recentActivity } = orderSummary
  const primaryOrder = orders[0] || null

  const liveStatus = isNoOrder
    ? 'NO ACTIVE ORDERS'
    : rawStatus || primaryOrder?.currentStatus || 'Pending'
  const normalizedStatus = liveStatus.toLowerCase()
  const isApproved = !isNoOrder && (normalizedStatus === 'approved' || normalizedStatus === 'completed')
  const isRejected = !isNoOrder && normalizedStatus === 'rejected'
  const isPending = !isNoOrder && !fatalError && !isApproved && !isRejected

  const livePlan =
    String(
      data?.plan ??
        data?.Plan ??
        primaryOrder?.plan ??
        session?.plan ??
        'Temp',
    ).trim() || 'Temp'
  const isFreePlan = livePlan.toLowerCase() === 'free'
  const liveExpiry =
    data?.expiry ??
    data?.Expiry ??
    data?.expiryTime ??
    data?.ExpiryTime ??
    primaryOrder?.expiry ??
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
    : String(
        data?.key ??
          data?.Key ??
          data?.licenseKey ??
          data?.LicenseKey ??
          primaryOrder?.key ??
          '',
      ).trim()
  const keyUsed = Boolean(
    data?.isKeyUsed ?? data?.IsKeyUsed ?? primaryOrder?.isKeyUsed,
  )

  const selectedOrder =
    orders.find((item) => item.id === selectedOrderId || item.reference === selectedOrderId) ||
    orders[0] ||
    null

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

  async function handleProfileSubmit(event) {
    event.preventDefault()
    if (profileSaving) return

    setProfileError('')
    setProfileSuccess('')

    const cleanedName = profileForm.fullName.trim()
    const cleanedEmail = profileForm.email.trim().toLowerCase()
    const cleanedDiscord = profileForm.discordId.trim()

    if (cleanedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      setProfileError('Please enter a valid email address.')
      return
    }

    setProfileSaving(true)
    try {
      const payload = await updateUserProfile(session.token, {
        fullName: cleanedName,
        email: cleanedEmail,
        discordId: cleanedDiscord,
      })

      const updatedSession = updateStoredSession({
        fullName: payload?.fullName ?? payload?.FullName ?? cleanedName,
        email: payload?.email ?? payload?.Email ?? cleanedEmail,
        discordId: payload?.discordId ?? payload?.DiscordId ?? cleanedDiscord,
      })

      if (updatedSession && onSessionUpdate) {
        onSessionUpdate(updatedSession)
      }

      setProfileSuccess(
        extractApiMessage(payload, 'Profile details updated.'),
      )
    } catch (err) {
      if (isAuthError(err)) {
        onSessionInvalid()
        return
      }
      const message =
        err instanceof ApiError
          ? err.message
          : extractApiMessage(err?.payload, err?.message || 'Unable to update profile.')
      setProfileError(message)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleSecuritySubmit(event) {
    event.preventDefault()
    if (securitySaving) return

    setSecurityError('')
    setSecuritySuccess('')

    const { currentPassword, newPassword, confirmPassword } = securityForm

    if (!currentPassword) {
      setSecurityError('Current password is required.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirmation do not match.')
      return
    }
    if (currentPassword === newPassword) {
      setSecurityError('New password must be different from your current password.')
      return
    }

    setSecuritySaving(true)
    try {
      const response = await changePassword(session.token, currentPassword, newPassword)
      const updated = updateStoredSession({ mustChangePassword: false })
      if (updated && onSessionUpdate) {
        onSessionUpdate(updated)
      }
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSecuritySuccess(
        extractApiMessage(response, 'Your account password has been updated.'),
      )
    } catch (err) {
      if (isAuthError(err)) {
        onSessionInvalid()
        return
      }
      const message =
        err instanceof ApiError
          ? err.message
          : extractApiMessage(err?.payload, err?.message || 'Password update failed.')
      setSecurityError(message)
    } finally {
      setSecuritySaving(false)
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
            <span className="hero-eyebrow">DSC Client Dashboard</span>
            <h1 className="auth-title mt-6">
              Welcome, {String(session?.username || 'User').toUpperCase()}
            </h1>
            <p className="text-muted text-sm m-0 mt-4">
              Track your project orders, review quotation statuses, and manage your DSC software licenses.
            </p>
          </div>
          <div className="flex gap-10 flex-wrap">
            <NavLink to="/services" className="button button-primary button-sm">
              Explore Services
            </NavLink>
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

        {/* Structured Dashboard Navigation Tabs */}
        <nav className="dashboard-tabs" aria-label="User dashboard sections">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`dashboard-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'orders' && totalOrders > 0 ? (
                <span className="dashboard-tab-count">{totalOrders}</span>
              ) : null}
            </button>
          ))}
          {onLogout ? (
            <button
              type="button"
              className="dashboard-tab-btn dashboard-tab-logout"
              onClick={onLogout}
            >
              Logout
            </button>
          ) : null}
        </nav>

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

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW                                                   */}
        {/* ================================================================= */}
        {activeTab === 'overview' ? (
          <div className="dashboard-tab-panel" data-testid="dashboard-overview-panel">
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

            {/* Primary Account & Subscription Stats Grid */}
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

            {/* Order Metrics Summary Row */}
            <div className="dashboard-summary-grid mb-24">
              <div className="stat-card">
                <p className="stat-label">Total Orders</p>
                <div id="dashTotalOrders" className="stat-value">
                  {totalOrders}
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-label">Active Orders</p>
                <div id="dashActiveOrders" className="stat-value text-primary">
                  {activeOrders}
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-label">Completed Orders</p>
                <div id="dashCompletedOrders" className="stat-value text-success">
                  {completedOrders}
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
              <div className="card mb-24">
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

            {/* Recent Order Activity */}
            <div className="card" id="dashRecentActivity">
              <div className="flex items-center justify-between flex-wrap gap-10 mb-14">
                <div>
                  <span className="micro-label">RECENT ORDER ACTIVITY</span>
                  <h3 className="my-4 text-lg font-bold">Your Latest Orders & Updates</h3>
                </div>
                {orders.length > 0 ? (
                  <button
                    type="button"
                    className="button button-ghost button-sm"
                    onClick={() => setActiveTab('orders')}
                  >
                    View All Orders →
                  </button>
                ) : null}
              </div>

              {recentActivity.length === 0 ? (
                <div className="dashboard-empty-box">
                  <p className="text-muted m-0">
                    You do not have any recorded orders yet. Explore DSC software development services or the software panel catalog to get started.
                  </p>
                  <div className="flex gap-10 flex-wrap mt-14">
                    <NavLink to="/services" className="button button-primary button-sm">
                      Request a Project Quote
                    </NavLink>
                    <NavLink to="/pages/catalog" className="button button-secondary button-sm">
                      Browse Software Catalog
                    </NavLink>
                  </div>
                </div>
              ) : (
                <div className="dashboard-orders-list">
                  {recentActivity.map((order) => (
                    <div key={order.id} className="dashboard-order-row">
                      <div>
                        <div className="flex items-center gap-10 flex-wrap">
                          <strong className="text-main">{order.serviceType}</strong>
                          <span className="badge">{order.reference}</span>
                        </div>
                        <p className="text-xs text-muted m-0 mt-4">
                          Submitted:{' '}
                          {order.submissionDate
                            ? formatDateTime(order.submissionDate)
                            : 'Recorded in DSC Portal'}{' '}
                          • Quotation: {order.quotationStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-10">
                        <span
                          className={`badge ${
                            order.isCompleted
                              ? 'good'
                              : order.isRejected
                                ? 'danger'
                                : 'warning'
                          }`}
                        >
                          {order.currentStatus}
                        </span>
                        <button
                          type="button"
                          className="button button-secondary button-sm"
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setActiveTab('orders')
                          }}
                        >
                          Order Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ================================================================= */}
        {/* TAB 2: MY ORDERS                                                  */}
        {/* ================================================================= */}
        {activeTab === 'orders' ? (
          <div className="dashboard-tab-panel" data-testid="dashboard-orders-panel">
            <div className="flex items-center justify-between flex-wrap gap-12 mb-18">
              <div>
                <span className="micro-label">MY ORDERS</span>
                <h2 className="my-4 text-xl font-bold">Order History & Status Tracking</h2>
                <p className="text-muted text-sm m-0">
                  Displaying orders exclusively associated with account{' '}
                  <strong>{String(session?.username || '').toUpperCase()}</strong>.
                </p>
              </div>
              <div className="flex gap-10 flex-wrap">
                <NavLink to="/contact?service=websites" className="button button-primary button-sm">
                  New Service Inquiry
                </NavLink>
                <NavLink to="/pages/checkout" className="button button-secondary button-sm">
                  Panel Checkout
                </NavLink>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="card dashboard-empty-box">
                <h3 className="m-0 mb-8 text-lg">No Orders Recorded for Your Account</h3>
                <p className="text-muted m-0">
                  When you submit a service requirement or software panel order, its reference ID, quotation status, and real-time updates will appear here.
                </p>
                <div className="flex gap-10 flex-wrap mt-16">
                  <NavLink to="/services" className="button button-primary button-sm">
                    Browse Development Services
                  </NavLink>
                  <NavLink to="/pages/catalog" className="button button-secondary button-sm">
                    Open Software Catalog
                  </NavLink>
                </div>
              </div>
            ) : (
              <div className="dashboard-orders-split">
                <div className="dashboard-orders-list">
                  {orders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id
                    return (
                      <button
                        key={order.id}
                        type="button"
                        className={`dashboard-order-item-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <div className="flex items-center justify-between gap-10 w-full">
                          <span className="font-bold text-main">{order.serviceType}</span>
                          <span
                            className={`badge ${
                              order.isCompleted
                                ? 'good'
                                : order.isRejected
                                  ? 'danger'
                                  : 'warning'
                            }`}
                          >
                            {order.currentStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-10 w-full mt-6 text-xs text-muted">
                          <span>Ref: {order.reference}</span>
                          <span>{order.quotationStatus}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedOrder ? (
                  <div className="card dashboard-order-detail" data-testid="order-detail-card">
                    <div className="flex items-center justify-between flex-wrap gap-10 mb-16">
                      <div>
                        <span className="micro-label">ORDER DETAILS</span>
                        <h3 className="my-4 text-lg font-bold">{selectedOrder.serviceType}</h3>
                      </div>
                      <span
                        className={`badge ${
                          selectedOrder.isCompleted
                            ? 'good'
                            : selectedOrder.isRejected
                              ? 'danger'
                              : 'warning'
                        }`}
                      >
                        {selectedOrder.currentStatus}
                      </span>
                    </div>

                    <dl className="order-detail-dl">
                      <div className="order-detail-pair">
                        <dt>Order Reference</dt>
                        <dd data-testid="detail-order-reference">{selectedOrder.reference}</dd>
                      </div>
                      <div className="order-detail-pair">
                        <dt>Service Type</dt>
                        <dd data-testid="detail-service-type">{selectedOrder.serviceType}</dd>
                      </div>
                      <div className="order-detail-pair">
                        <dt>Submission Date</dt>
                        <dd data-testid="detail-submission-date">
                          {selectedOrder.submissionDate
                            ? formatDateTime(selectedOrder.submissionDate)
                            : 'Recorded in DSC Portal'}
                        </dd>
                      </div>
                      <div className="order-detail-pair">
                        <dt>Current Status</dt>
                        <dd data-testid="detail-current-status">{selectedOrder.currentStatus}</dd>
                      </div>
                      <div className="order-detail-pair">
                        <dt>Quotation Status</dt>
                        <dd data-testid="detail-quotation-status">
                          {selectedOrder.quotationStatus}
                        </dd>
                      </div>
                      <div className="order-detail-pair">
                        <dt>Last Update</dt>
                        <dd data-testid="detail-last-update">
                          {selectedOrder.lastUpdate
                            ? formatDateTime(selectedOrder.lastUpdate)
                            : 'Up to date'}
                        </dd>
                      </div>
                    </dl>

                    {selectedOrder.notes ? (
                      <div className="mt-16 pt-16 border-t">
                        <span className="micro-label">PROJECT / ORDER NOTES</span>
                        <p className="text-sm text-muted mt-6 m-0">{selectedOrder.notes}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {/* ================================================================= */}
        {/* TAB 3: PROFILE                                                    */}
        {/* ================================================================= */}
        {activeTab === 'profile' ? (
          <div className="dashboard-tab-panel" data-testid="dashboard-profile-panel">
            <div className="card">
              <span className="micro-label">ACCOUNT PROFILE</span>
              <h2 className="my-4 text-xl font-bold">Client Account Details</h2>
              <p className="text-muted text-sm mb-20">
                View and maintain your Dark Skull Corporation contact profile used for project quotations and order notifications.
              </p>

              <form
                className={`form-stack ${profileSaving ? 'is-processing' : ''}`}
                onSubmit={handleProfileSubmit}
                noValidate
              >
                <div className="form-grid-2">
                  <label className="field" htmlFor="profile-username">
                    <span>Username (Read-Only)</span>
                    <input
                      id="profile-username"
                      type="text"
                      value={session?.username || ''}
                      disabled
                      readOnly
                    />
                  </label>

                  <label className="field" htmlFor="profile-account-tier">
                    <span>Active Plan / Tier</span>
                    <input
                      id="profile-account-tier"
                      type="text"
                      value={livePlan.toUpperCase()}
                      disabled
                      readOnly
                    />
                  </label>
                </div>

                <div className="form-grid-2">
                  <label className="field" htmlFor="profile-fullname">
                    <span>Full Name</span>
                    <input
                      id="profile-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={profileForm.fullName}
                      disabled={profileSaving}
                      onChange={(e) => {
                        setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                        if (profileError) setProfileError('')
                        if (profileSuccess) setProfileSuccess('')
                      }}
                    />
                  </label>

                  <label className="field" htmlFor="profile-email">
                    <span>Email Address</span>
                    <input
                      id="profile-email"
                      type="email"
                      placeholder="you@example.com"
                      value={profileForm.email}
                      disabled={profileSaving}
                      onChange={(e) => {
                        setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                        if (profileError) setProfileError('')
                        if (profileSuccess) setProfileSuccess('')
                      }}
                    />
                  </label>
                </div>

                <label className="field" htmlFor="profile-discord">
                  <span>Discord Handle / Secondary Contact (Optional)</span>
                  <input
                    id="profile-discord"
                    type="text"
                    placeholder="e.g. username#0000 or phone/WhatsApp"
                    value={profileForm.discordId}
                    disabled={profileSaving}
                    onChange={(e) => {
                      setProfileForm((prev) => ({ ...prev, discordId: e.target.value }))
                      if (profileError) setProfileError('')
                      if (profileSuccess) setProfileSuccess('')
                    }}
                  />
                </label>

                {profileError ? (
                  <p className="form-error" role="alert">
                    {profileError}
                  </p>
                ) : null}

                {profileSuccess ? (
                  <div className="status-banner" role="status">
                    {profileSuccess}
                  </div>
                ) : null}

                <div>
                  <button
                    type="submit"
                    className={`button button-primary ${profileSaving ? 'is-loading' : ''}`}
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* ================================================================= */}
        {/* TAB 4: ACCOUNT SECURITY                                           */}
        {/* ================================================================= */}
        {activeTab === 'security' ? (
          <div className="dashboard-tab-panel" data-testid="dashboard-security-panel">
            <div className="card mb-24">
              <span className="micro-label">PASSWORD & CREDENTIALS</span>
              <h2 className="my-4 text-xl font-bold">Update Account Password</h2>
              <p className="text-muted text-sm mb-20">
                Change your DSC Client Portal password. Choose a strong password of at least 6 characters.
              </p>

              <form
                className={`form-stack ${securitySaving ? 'is-processing' : ''}`}
                onSubmit={handleSecuritySubmit}
                noValidate
              >
                <label className="field" htmlFor="security-current-password">
                  <span>Current Password</span>
                  <PasswordInput
                    id="security-current-password"
                    autoComplete="current-password"
                    disabled={securitySaving}
                    placeholder="Enter current password"
                    required
                    value={securityForm.currentPassword}
                    onChange={(e) => {
                      setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                      if (securityError) setSecurityError('')
                      if (securitySuccess) setSecuritySuccess('')
                    }}
                  />
                </label>

                <div className="form-grid-2">
                  <label className="field" htmlFor="security-new-password">
                    <span>New Password</span>
                    <PasswordInput
                      id="security-new-password"
                      autoComplete="new-password"
                      disabled={securitySaving}
                      placeholder="At least 6 characters"
                      required
                      value={securityForm.newPassword}
                      onChange={(e) => {
                        setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        if (securityError) setSecurityError('')
                        if (securitySuccess) setSecuritySuccess('')
                      }}
                    />
                  </label>

                  <label className="field" htmlFor="security-confirm-password">
                    <span>Confirm New Password</span>
                    <PasswordInput
                      id="security-confirm-password"
                      autoComplete="new-password"
                      disabled={securitySaving}
                      placeholder="Confirm new password"
                      required
                      value={securityForm.confirmPassword}
                      onChange={(e) => {
                        setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        if (securityError) setSecurityError('')
                        if (securitySuccess) setSecuritySuccess('')
                      }}
                    />
                  </label>
                </div>

                {securityError ? (
                  <p className="form-error" role="alert">
                    {securityError}
                  </p>
                ) : null}

                {securitySuccess ? (
                  <div className="status-banner" role="status">
                    {securitySuccess}
                  </div>
                ) : null}

                <div>
                  <button
                    type="submit"
                    className={`button button-primary ${securitySaving ? 'is-loading' : ''}`}
                    disabled={securitySaving}
                  >
                    {securitySaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <span className="micro-label">SESSION SECURITY</span>
              <h3 className="my-4 text-lg font-bold">Active Session & Device Isolation</h3>
              <p className="text-muted text-sm m-0">
                Your session token is isolated to your account and verified on every API request. Sign out when using a shared device.
              </p>
              {onLogout ? (
                <div className="mt-16">
                  <button
                    type="button"
                    className="button button-secondary button-sm"
                    onClick={onLogout}
                  >
                    Sign Out of This Device
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
