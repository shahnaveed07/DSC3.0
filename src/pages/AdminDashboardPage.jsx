import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  changeAdminPassword,
  createAdminAccount,
  deleteAdminUser,
  extractApiMessage,
  forceUserPasswordReset,
  getAdminSnapshot,
  isAuthError,
  mapAdminUsers,
  mapPendingOrders,
  mapSettingsRecord,
  processAdminOrder,
  resetUserHwid,
  setUserPassword,
  toggleMaintenance,
  updateAdminUser,
} from '../services/dscApi'
import { formatDateTime } from '../utils/format'
import { PasswordInput } from '../components/ui/PasswordInput'


function getValue(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }
  return '—'
}

export function AdminDashboardPage({ session, systemStatus, onSessionInvalid }) {
  usePageMeta(SEO_ROUTES.adash)
  const [revision, setRevision] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [busyAction, setBusyAction] = useState('')
  const busy = Boolean(busyAction)

  // Modals state
  const [orderModal, setOrderModal] = useState(null) // { mode: 'approve' | 'reject', orderId: number, username: string }
  const [deleteModal, setDeleteModal] = useState(null) // { label: string, action: () => Promise<void> }
  const [editUser, setEditUser] = useState(null)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)

  // Form states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' })
  const [userPassForm, setUserPassForm] = useState({ newPassword: '', confirmPassword: '' })
  const [userPassError, setUserPassError] = useState('')
  const [userPassSuccess, setUserPassSuccess] = useState('')

  function closeEditUser() {
    setEditUser(null)
    setUserPassForm({ newPassword: '', confirmPassword: '' })
    setUserPassError('')
    setUserPassSuccess('')
  }

  const { data, error, loading } = useRemoteResource(
    () => getAdminSnapshot(session.token),
    [session?.token, revision],
    { enabled: Boolean(session?.token) },
  )

  useEffect(() => {
    if (isAuthError(error)) onSessionInvalid()
  }, [error, onSessionInvalid])

  const users = data?.users?.status === 'fulfilled' ? mapAdminUsers(data.users.value) : []
  const orders = data?.orders?.status === 'fulfilled' ? mapPendingOrders(data.orders.value) : []
  const settings =
    data?.settings?.status === 'fulfilled' ? mapSettingsRecord(data.settings.value) : {}
  const ownerAccess = data?.ownerAccess?.status === 'fulfilled'

  const isMaintenance = Boolean(
    systemStatus?.isMaintenanceMode ||
    systemStatus?.IsMaintenanceMode ||
    settings?.isMaintenanceMode ||
    settings?.IsMaintenanceMode
  )

  function flashMessage(msg, type = 'success') {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  async function runAction(action, successMsg, actionId = 'action') {
    setBusyAction(actionId)
    try {
      await action()
      if (successMsg) flashMessage(successMsg, 'success')
      setRevision((v) => v + 1)
    } catch (issue) {
      if (issue?.status === 401) {
        onSessionInvalid()
      } else if (issue?.status === 403) {
        flashMessage(extractApiMessage(issue.payload, 'Access denied: Owner privileges required for this action.'), 'error')
      } else {
        flashMessage(extractApiMessage(issue.payload, issue.message || 'Action failed.'), 'error')
      }
    } finally {
      setBusyAction('')
    }
  }

  async function handleOrderConfirm() {
    if (!orderModal) return
    const { mode, orderId } = orderModal
    await runAction(
      async () => {
        await processAdminOrder(session.token, orderId, mode)
        setOrderModal(null)
      },
      `Order #${orderId} ${mode === 'approve' ? 'approved & key issued' : 'rejected'}.`,
      `order-${mode}`,
    )
  }

  async function handleDeleteConfirm() {
    if (!deleteModal) return
    const action = deleteModal.action
    await runAction(
      async () => {
        await action()
        setDeleteModal(null)
      },
      'Deleted successfully.',
      'delete',
    )
  }

  async function handleSaveUser(e) {
    e.preventDefault()
    if (!editUser) return
    const id = editUser?.id ?? editUser?.Id ?? editUser?.userId ?? editUser?.UserId
    await runAction(async () => {
      await updateAdminUser(session.token, {
        userId: Number(id),
        plan: editUser.plan ?? editUser.Plan,
        expiryTime: editUser.expiryTime ?? editUser.ExpiryTime ?? null,
        isBanned: Boolean(editUser.isBanned ?? editUser.IsBanned),
      })
      closeEditUser()
    }, 'User updated successfully.', 'saveUser')
  }

  async function handleResetHwid() {
    if (!editUser) return
    const id = editUser?.id ?? editUser?.Id ?? editUser?.userId ?? editUser?.UserId
    const username = getValue(editUser, ['username', 'Username'])
    await runAction(async () => {
      await resetUserHwid(session.token, id)
      closeEditUser()
    }, `HWID successfully reset for user ${username}.`, 'resetHwid')
  }

  async function handleForcePasswordReset() {
    if (!editUser) return
    const id = editUser?.id ?? editUser?.Id ?? editUser?.userId ?? editUser?.UserId
    const username = getValue(editUser, ['username', 'Username'])
    await runAction(async () => {
      await forceUserPasswordReset(session.token, id)
      closeEditUser()
    }, `Password reset successfully enforced for user ${username}.`, 'forceReset')
  }

  async function handleSetUserPassword() {
    setUserPassError('')
    setUserPassSuccess('')

    if (!editUser) {
      setUserPassError('Please select a valid user account.')
      return
    }

    const id = editUser?.id ?? editUser?.Id ?? editUser?.userId ?? editUser?.UserId
    if (id === undefined || id === null || id === '') {
      setUserPassError('Invalid user ID. Cannot update password.')
      return
    }

    const { newPassword, confirmPassword } = userPassForm
    if (!newPassword || !confirmPassword) {
      setUserPassError('Both new password and confirm password fields are required.')
      return
    }

    if (newPassword.length < 6) {
      setUserPassError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setUserPassError('New password and confirmation do not match.')
      return
    }

    setBusyAction('setUserPassword')
    try {
      const res = await setUserPassword(session.token, id, newPassword)
      const successText = res?.message || `Password successfully updated for user #${id}.`
      setUserPassForm({ newPassword: '', confirmPassword: '' })
      setUserPassSuccess(successText)
      flashMessage(successText, 'success')
      setRevision((v) => v + 1)
    } catch (issue) {
      let friendlyError = ''
      if (issue?.isNetworkError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        friendlyError = 'Network error: Unable to reach the server. Please check your internet connection.'
      } else if (issue?.status === 400) {
        friendlyError = extractApiMessage(
          issue?.payload,
          'Invalid password request. Please ensure the password meets backend requirements.',
        )
      } else if (issue?.status === 401) {
        onSessionInvalid()
        return
      } else if (issue?.status === 403) {
        friendlyError = 'Access denied: Owner privileges required to update user passwords.'
      } else if (issue?.status === 404) {
        friendlyError = `User #${id} not found on the server.`
      } else if (issue?.status >= 500) {
        friendlyError = 'Server error encountered while setting password. Please try again later.'
      } else {
        friendlyError = extractApiMessage(
          issue?.payload,
          issue?.message || 'Failed to update user password.',
        )
      }
      setUserPassError(friendlyError)
      flashMessage(friendlyError, 'error')
    } finally {
      setBusyAction('')
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    await runAction(async () => {
      await changeAdminPassword(session.token, passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setShowPassModal(false)
    }, 'Admin password updated successfully.', 'changePass')
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    await runAction(async () => {
      await createAdminAccount(session.token, newAdmin.username.trim().toLowerCase(), newAdmin.password)
      setNewAdmin({ username: '', password: '' })
      setShowCreateAdmin(false)
    }, 'New admin created successfully.', 'createAdmin')
  }

  return (
    <div className="workspace-wrap">
      <section className="panel">
        {/* Header Bar */}
        <div className="admin-header-bar">
          <div>
            <span className="hero-eyebrow">Control Center</span>
            <h1 className="auth-title mt-6">Admin Dashboard</h1>
            <p className="auth-subtitle mb-0">
              Active admin: <strong className="text-primary">{String(session.username || 'admin').toUpperCase()}</strong>
              {ownerAccess ? ' • (Owner Access Verified)' : ''}
            </p>
          </div>

          <div className="admin-header-actions">
            <NavLink to="/pages/generatekey" className="button button-primary button-sm">
              Generate Key
            </NavLink>
            {ownerAccess ? (
              <NavLink to="/pages/ownerdb" className="button button-secondary button-sm">
                Owner DB
              </NavLink>
            ) : null}
            {ownerAccess ? (
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => setShowCreateAdmin(true)}
              >
                + Create Admin
              </button>
            ) : null}
            <button
              type="button"
              className="button button-ghost button-sm"
              onClick={() => setShowPassModal(true)}
            >
              Password
            </button>
            {ownerAccess ? (
              <button
                type="button"
                className={`button button-sm ${isMaintenance ? 'button-danger' : 'button-secondary'} ${busyAction === 'maintenance' ? 'is-loading' : ''}`}
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => toggleMaintenance(session.token, !isMaintenance),
                    `Maintenance mode ${!isMaintenance ? 'activated' : 'deactivated'}.`,
                    'maintenance',
                  )
                }
              >
                {busyAction === 'maintenance' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Updating...</span>
                  </span>
                ) : (
                  <span>Maintenance: {isMaintenance ? 'ON' : 'OFF'}</span>
                )}
              </button>
            ) : (
              <span className={`maint-status-pill ${isMaintenance ? 'is-active' : ''}`}>
                Maint: {isMaintenance ? 'ON' : 'OFF'}
              </span>
            )}
            <button
              type="button"
              className={`button button-secondary button-sm ${loading ? 'is-loading' : ''}`}
              disabled={busy || loading}
              onClick={() => setRevision((v) => v + 1)}
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Refreshing...</span>
                </span>
              ) : (
                <span>Refresh</span>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {message ? (
          <div className={`alert-box mb-20 ${messageType === 'error' ? 'alert-danger' : 'alert-success'}`}>
            <p className={`mb-0 ${messageType === 'error' ? 'text-danger' : 'text-success'}`}>{message}</p>
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="stats-grid mb-24">
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <div className="stat-value text-xl">{users.length}</div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Orders</p>
            <div className={`stat-value text-xl ${orders.length > 0 ? 'text-warning' : 'text-secondary'}`}>
              {orders.length}
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Maintenance</p>
            <div className={`stat-value text-xl ${isMaintenance ? 'text-danger' : 'text-success'}`}>
              {isMaintenance ? 'ACTIVE' : 'NORMAL'}
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Permissions</p>
            <div className="stat-value text-md text-secondary mt-6">
              {ownerAccess ? 'Full Owner' : 'Standard Admin'}
            </div>
          </div>
        </div>

        {/* Pending Orders Table */}
        <div className="card mb-24">
          <div className="flex items-center justify-between mb-14 flex-wrap gap-10">
            <div>
              <span className="micro-label">APPROVAL QUEUE</span>
              <h3 className="mt-4 mb-0">Pending Orders ({orders.length})</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Discord</th>
                  <th>Plan</th>
                  <th>Days</th>
                  <th>Amount</th>
                  <th>Txn / UTR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const id = order.id ?? order.Id ?? idx + 1
                  const username = getValue(order, ['username', 'Username'])
                  return (
                    <tr key={`order-${id}`}>
                      <td>{id}</td>
                      <td><strong>{username}</strong></td>
                      <td>{getValue(order, ['discordId', 'DiscordId'])}</td>
                      <td><span className="badge warning">{getValue(order, ['plan', 'Plan']).toUpperCase()}</span></td>
                      <td>{getValue(order, ['days', 'Days'])}</td>
                      <td>{getValue(order, ['amount', 'Amount'])}</td>
                      <td><code>{getValue(order, ['txnId', 'TxnId', 'utr', 'UTR'])}</code></td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="button button-primary button-sm"
                            disabled={busy}
                            onClick={() =>
                              setOrderModal({
                                mode: 'approve',
                                orderId: id,
                                username,
                              })
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="button button-danger button-sm"
                            disabled={busy}
                            onClick={() =>
                              setOrderModal({
                                mode: 'reject',
                                orderId: id,
                                username,
                              })
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-cell">
                      No pending orders to review.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-14 flex-wrap gap-10">
            <div>
              <span className="micro-label">DATABASE SNAPSHOT</span>
              <h3 className="mt-4 mb-0">Registered Users ({users.length})</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 15).map((user, idx) => {
                  const username = getValue(user, ['username', 'Username'])
                  const id = user.id ?? user.Id ?? user.userId ?? user.UserId ?? idx
                  const isBanned = Boolean(user.isBanned ?? user.IsBanned)
                  const expiry = getValue(user, ['expiry', 'Expiry', 'expiryTime', 'ExpiryTime'])
                  return (
                    <tr key={`user-${id}`}>
                      <td><strong>{username}</strong></td>
                      <td><span className="badge good">{getValue(user, ['plan', 'Plan']).toUpperCase()}</span></td>
                      <td>
                        <span className={`badge ${isBanned ? 'bad' : 'good'}`}>
                          {isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="text-sm">
                        {expiry && expiry !== '—' ? formatDateTime(expiry) : '—'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="button button-secondary button-sm"
                            onClick={() => {
                              setUserPassForm({ newPassword: '', confirmPassword: '' })
                              setUserPassError('')
                              setUserPassSuccess('')
                              setEditUser({ ...user })
                            }}
                          >
                            Edit
                          </button>
                          {ownerAccess ? (
                            <button
                              type="button"
                              className="button button-danger button-sm"
                              disabled={busy}
                              onClick={() =>
                                setDeleteModal({
                                  label: `user "${username}"`,
                                  action: () => deleteAdminUser(session.token, id),
                                })
                              }
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-empty-cell">
                      {loading ? 'Loading user data...' : 'No users found.'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Order Confirmation Modal */}
      {orderModal ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className={`modal-card modal-card-center ${orderModal.mode === 'approve' ? 'modal-approve-state' : 'modal-reject-state'}`}>
            <div className={`modal-icon-box ${orderModal.mode === 'approve' ? 'icon-approve-state' : 'icon-reject-state'}`}>
              {orderModal.mode === 'approve' ? (
                <svg width="28" height="28" fill="none" stroke="var(--success)" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="var(--danger)" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <h2 className={`modal-title modal-title-large ${orderModal.mode === 'approve' ? 'text-approve-state' : 'text-reject-state'}`}>
              {orderModal.mode === 'approve' ? 'Approve Order?' : 'Reject Order?'}
            </h2>

            <p className="text-muted my-14">
              Are you sure you want to{' '}
              <strong className={orderModal.mode === 'approve' ? 'text-approve-state' : 'text-reject-state'}>
                {orderModal.mode.toUpperCase()}
              </strong>{' '}
              order #{orderModal.orderId} for user <strong>{orderModal.username}</strong>?
            </p>

            <div className="modal-actions-center">
              <button
                type="button"
                className={`${orderModal.mode === 'approve' ? 'button button-success' : 'button button-danger'} ${busyAction === `order-${orderModal.mode}` ? 'is-loading' : ''}`}
                onClick={handleOrderConfirm}
                disabled={busy}
              >
                {busyAction === `order-${orderModal.mode}` ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>{orderModal.mode === 'approve' ? 'Approving...' : 'Rejecting...'}</span>
                  </span>
                ) : (
                  <span>{orderModal.mode === 'approve' ? 'Yes, Approve!' : 'Yes, Reject!'}</span>
                )}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setOrderModal(null)}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteModal ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-card modal-card-center modal-reject-state">
            <div className="modal-icon-box icon-reject-state">
              <svg width="28" height="28" fill="none" stroke="var(--danger)" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="modal-title modal-title-large text-reject-state">Confirm Deletion</h2>
            <p className="text-muted my-14">
              Permanently delete {deleteModal.label}? This action cannot be reversed.
            </p>
            <div className="modal-actions-center">
              <button
                type="button"
                className={`button button-danger ${busyAction === 'delete' ? 'is-loading' : ''}`}
                onClick={handleDeleteConfirm}
                disabled={busy}
              >
                {busyAction === 'delete' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Deleting...</span>
                  </span>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setDeleteModal(null)}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit User Modal */}
      {editUser ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <form className="modal-card form-stack" onSubmit={handleSaveUser}>
            <h2>Edit User Account</h2>
            <p className="text-muted text-sm">
              Update access parameters for {getValue(editUser, ['username', 'Username'])}.
            </p>

            <label className="field">
              <span>Plan</span>
              <input
                required
                value={editUser.plan ?? editUser.Plan ?? ''}
                onChange={(e) => setEditUser({ ...editUser, plan: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Expiry Date / Time</span>
              <input
                type="datetime-local"
                value={String(editUser.expiryTime ?? editUser.ExpiryTime ?? '').slice(0, 16)}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    expiryTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </label>

            <label className="field">
              <span>Account Status</span>
              <select
                value={String(Boolean(editUser.isBanned ?? editUser.IsBanned))}
                onChange={(e) =>
                  setEditUser({ ...editUser, isBanned: e.target.value === 'true' })
                }
              >
                <option value="false">Active</option>
                <option value="true">Banned</option>
              </select>
            </label>

            <div className="modal-actions-row">
              <button
                className={`button button-primary ${busyAction === 'saveUser' ? 'is-loading' : ''}`}
                disabled={busy}
                type="submit"
              >
                {busyAction === 'saveUser' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={closeEditUser}
              >
                Cancel
              </button>
            </div>

            {ownerAccess ? (
              <div className="ownerdb-password-section">
                <span className="micro-label block mb-8">OWNER SECURITY ACTIONS</span>
                <div className="flex gap-10 flex-wrap">
                  <button
                    type="button"
                    className={`button button-secondary button-sm ${busyAction === 'resetHwid' ? 'is-loading' : ''}`}
                    disabled={busy}
                    onClick={handleResetHwid}
                  >
                    {busyAction === 'resetHwid' ? (
                      <span className="button-loading-content">
                        <span className="spinner-inline" aria-hidden="true" />
                        <span>Resetting HWID...</span>
                      </span>
                    ) : (
                      <span>Reset HWID</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`button button-danger button-sm ${busyAction === 'forceReset' ? 'is-loading' : ''}`}
                    disabled={busy}
                    onClick={handleForcePasswordReset}
                  >
                    {busyAction === 'forceReset' ? (
                      <span className="button-loading-content">
                        <span className="spinner-inline" aria-hidden="true" />
                        <span>Enforcing Reset...</span>
                      </span>
                    ) : (
                      <span>Force Password Reset</span>
                    )}
                  </button>
                </div>

                {/* Direct Set User Password Section */}
                <div className="ownerdb-password-section">
                  <span className="micro-label block mb-6">SET NEW USER PASSWORD</span>
                  <p className="text-muted text-sm mb-12">
                    Directly assign a new password for account #{editUser?.id ?? editUser?.Id ?? editUser?.userId ?? editUser?.UserId} ({getValue(editUser, ['username', 'Username'])}). This takes effect immediately without requiring user action.
                  </p>

                  {userPassSuccess ? (
                    <div className="form-success mb-12 text-sm">
                      {userPassSuccess}
                    </div>
                  ) : null}

                  {userPassError ? (
                    <div className="form-error mb-12 text-sm">
                      {userPassError}
                    </div>
                  ) : null}

                  <div className="ownerdb-password-grid">
                    <label className="field">
                      <span>New Password (min 6 characters)</span>
                      <PasswordInput
                        value={userPassForm.newPassword}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        minLength={6}
                        disabled={busy}
                        onChange={(e) => {
                          setUserPassForm((prev) => ({ ...prev, newPassword: e.target.value }))
                          setUserPassError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSetUserPassword()
                          }
                        }}
                      />
                    </label>

                    <label className="field">
                      <span>Confirm New Password</span>
                      <PasswordInput
                        value={userPassForm.confirmPassword}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        minLength={6}
                        disabled={busy}
                        onChange={(e) => {
                          setUserPassForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          setUserPassError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSetUserPassword()
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-10">
                    <button
                      type="button"
                      className={`button button-secondary button-sm ${busyAction === 'setUserPassword' ? 'is-loading' : ''}`}
                      disabled={busy}
                      onClick={handleSetUserPassword}
                    >
                      {busyAction === 'setUserPassword' ? (
                        <span className="button-loading-content">
                          <span className="spinner-inline" aria-hidden="true" />
                          <span>Updating Password...</span>
                        </span>
                      ) : (
                        <span>Set New Password</span>
                      )}
                    </button>
                    {userPassForm.newPassword || userPassForm.confirmPassword ? (
                      <button
                        type="button"
                        className="button button-text button-sm"
                        disabled={busy}
                        onClick={() => {
                          setUserPassForm({ newPassword: '', confirmPassword: '' })
                          setUserPassError('')
                        }}
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      ) : null}

      {/* Create Admin Modal */}
      {showCreateAdmin ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <form className="modal-card form-stack" onSubmit={handleCreateAdmin}>
            <h2>Create New Admin Account</h2>
            <p className="text-muted text-sm">
              Authorize a new administrator with control panel privileges.
            </p>

            <label className="field">
              <span>Username</span>
              <input
                required
                autoComplete="username"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Password (minimum 6 characters)</span>
              <PasswordInput
                required
                minLength={6}
                autoComplete="new-password"
                value={newAdmin.password}
                disabled={busyAction === 'createAdmin'}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </label>

            <div className="modal-actions-row">
              <button
                className={`button button-primary ${busyAction === 'createAdmin' ? 'is-loading' : ''}`}
                disabled={busy}
                type="submit"
              >
                {busyAction === 'createAdmin' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Creating...</span>
                  </span>
                ) : (
                  <span>Create Admin</span>
                )}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setShowCreateAdmin(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Change Password Modal */}
      {showPassModal ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <form className="modal-card form-stack" onSubmit={handleChangePassword}>
            <h2>Change Admin Password</h2>
            <p className="text-muted text-sm">
              Update your administrative account credentials.
            </p>

            <label className="field">
              <span>Current Password</span>
              <PasswordInput
                required
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                disabled={busyAction === 'changePass'}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </label>

            <label className="field">
              <span>New Password (minimum 6 characters)</span>
              <PasswordInput
                required
                minLength={6}
                autoComplete="new-password"
                value={passwordForm.newPassword}
                disabled={busyAction === 'changePass'}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </label>

            <div className="modal-actions-row">
              <button
                className={`button button-primary ${busyAction === 'changePass' ? 'is-loading' : ''}`}
                disabled={busy}
                type="submit"
              >
                {busyAction === 'changePass' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Updating...</span>
                  </span>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setShowPassModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
