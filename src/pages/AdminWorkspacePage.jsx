import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  deleteOwnerRecord,
  extractApiMessage,
  forceUserPasswordReset,
  getFreePanelStatus,
  getOwnerTable,
  isAuthError,
  mapSettingsRecord,
  resetUserHwid,
  setUserPassword,
  syncFreePanelUser,
  toggleMaintenance,
  updateAdminUser,
  updateOwnerRecord,
} from '../services/dscApi'
import {
  TABLE_COLUMN_DEFINITIONS,
  getDatabaseRecordId,
  normalizeCollection,
  resolveRecordField,
  toDatetimeLocal,
  toIsoOrNullFromDatetimeLocal,
} from '../utils/format'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

const TABLES = [
  ['users', 'Users'],
  ['settings', 'System Settings'],
  ['freeSettings', 'Free Panel Settings'],
  ['freeusers', 'Free Users'],
  ['panelUpdates', 'Updates'],
  ['keys', 'Register Keys'],
  ['orders', 'Orders'],
  ['admins', 'Admin Accounts'],
]

function listFor(table, payload) {
  if (table === 'settings' || table === 'freeSettings' || table === 'panelUpdates') {
    if (table === 'settings' || table === 'freeSettings') return [mapSettingsRecord(payload)]
    const record = payload?.data && !Array.isArray(payload.data) ? payload.data : payload
    return Array.isArray(record) ? record : record && typeof record === 'object' ? [record] : []
  }
  return normalizeCollection(payload, [
    table,
    table[0].toUpperCase() + table.slice(1),
    'data',
    'Data',
    'records',
    'Records',
  ])
}

function renderCellValue(col, row) {
  const val = resolveRecordField(row, col.aliases)

  if (val === true || (col.format === 'boolean' && String(val).toLowerCase() === 'true')) {
    return <span className="badge good">True</span>
  }
  if (val === false || (col.format === 'boolean' && String(val).toLowerCase() === 'false')) {
    return <span className="badge bad">False</span>
  }

  if (val === null || val === undefined || val === '') {
    return '—'
  }

  if (col.format === 'status') {
    const status = String(val).toLowerCase()
    if (status === 'approved') return <span className="badge good">Approved</span>
    if (status === 'pending') return <span className="badge warning">Pending</span>
    if (status === 'rejected') return <span className="badge bad">Rejected</span>
    return <span className="badge">{String(val)}</span>
  }

  if (col.format === 'datetime') {
    const parsed = new Date(val)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString()
    }
    return String(val)
  }

  if (col.format === 'code') {
    return <code className="db-code-cell">{String(val)}</code>
  }

  if (col.format === 'plan') {
    return <span className="db-plan-cell">{String(val).toUpperCase()}</span>
  }

  if (col.format === 'duration') {
    const text = String(val).trim()
    return /day/i.test(text) ? text : `${text} Days`
  }

  return String(val)
}

function buildSettingsPayload(current, overrides = {}) {
  const resolveSetting = (key, aliases, fallback) => {
    if (overrides[key] !== undefined) return overrides[key]
    const existing = resolveRecordField(current, aliases)
    return existing !== undefined && existing !== '' ? existing : fallback
  }

  return {
    id: resolveRecordField(current, ['id', 'Id']) ?? 0,
    isMaintenanceMode: Boolean(
      overrides.isMaintenanceMode ??
        resolveRecordField(current, ['isMaintenanceMode', 'IsMaintenanceMode']) ??
        false,
    ),
    maintenanceReason: String(
      resolveSetting('maintenanceReason', ['maintenanceReason', 'MaintenanceReason'], ''),
    ),
    maxFreeSlots: Number(
      resolveSetting(
        'maxFreeSlots',
        ['maxFreeSlots', 'MaxFreeSlots', 'freeMaxSlots', 'FreeMaxSlots', 'maxSlots', 'MaxSlots'],
        20,
      ),
    ),
    latestVersion: String(
      resolveSetting('latestVersion', ['latestVersion', 'LatestVersion'], '1.0'),
    ),
    updateUrl: String(resolveSetting('updateUrl', ['updateUrl', 'UpdateUrl'], '')),
    showHomeDownloadBtn: Boolean(
      overrides.showHomeDownloadBtn ??
        resolveRecordField(current, ['showHomeDownloadBtn', 'ShowHomeDownloadBtn']) ??
        false,
    ),
    freeValidDays: Number(
      resolveSetting('freeValidDays', ['freeValidDays', 'FreeValidDays'], 30),
    ),
    freeUsername: String(
      resolveSetting(
        'freeUsername',
        ['freeUsername', 'FreeUsername', 'freeUser', 'FreeUser'],
        '',
      ),
    ),
    freePassword: String(
      resolveSetting(
        'freePassword',
        ['freePassword', 'FreePassword', 'freePass', 'FreePass'],
        '',
      ),
    ),
    freeLink: String(
      resolveSetting(
        'freeLink',
        ['freeLink', 'FreeLink', 'freeDownloadLink', 'FreeDownloadLink'],
        '',
      ),
    ),
    streamerLink: String(
      resolveSetting('streamerLink', ['streamerLink', 'StreamerLink'], ''),
    ),
    sniperLink: String(resolveSetting('sniperLink', ['sniperLink', 'SniperLink'], '')),
    specialLink: String(
      resolveSetting('specialLink', ['specialLink', 'SpecialLink'], ''),
    ),
    aimbotLink: String(resolveSetting('aimbotLink', ['aimbotLink', 'AimbotLink'], '')),
    premiumLink: String(
      resolveSetting('premiumLink', ['premiumLink', 'PremiumLink'], ''),
    ),
    customisedLink: String(
      resolveSetting('customisedLink', ['customisedLink', 'CustomisedLink'], ''),
    ),
  }
}

export function AdminWorkspacePage({ session, onSessionInvalid }) {
  usePageMeta(SEO_ROUTES.ownerdb)
  const [table, setTable] = useState('users')
  const [records, setRecords] = useState([])
  const [cachedSettings, setCachedSettings] = useState({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [editRecord, setEditRecord] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [userPasswordForm, setUserPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [userPasswordError, setUserPasswordError] = useState('')
  const [userPasswordSuccess, setUserPasswordSuccess] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const busy = Boolean(busyAction)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const skipNextFetchRef = useRef(false)
  const token = session?.token

  const columns = useMemo(() => TABLE_COLUMN_DEFINITIONS[table] || [], [table])
  const activeTableLabel = useMemo(
    () => TABLES.find(([k]) => k === table)?.[1] || table,
    [table],
  )

  const load = useCallback(() => {
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return
    }
    let ignore = false
    async function fetchData() {
      if (!token) return
      setLoading(true)
      setError('')
      setSelectedIds(new Set())
      try {
        const payload = await getOwnerTable(token, table)
        if (!ignore) {
          const rows = listFor(table, payload)
          setRecords(rows)
          if (table === 'settings' || table === 'freeSettings') {
            setCachedSettings(rows[0] || {})
          }
          setPage(1)
        }
      } catch (issue) {
        if (!ignore) {
          if (isAuthError(issue)) {
            onSessionInvalid()
          } else if (issue?.status === 403) {
            setError(
              extractApiMessage(
                issue?.payload,
                'Access denied: Owner privileges required for this workspace.',
              ),
            )
          } else {
            setError(
              extractApiMessage(issue?.payload, issue?.message || 'Could not load owner records.'),
            )
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      ignore = true
    }
  }, [token, table, reloadKey, onSessionInvalid])

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.trim().toLowerCase()
    return records.filter((row) =>
      columns.some((col) => {
        const val = resolveRecordField(row, col.aliases)
        return String(val ?? '').toLowerCase().includes(q)
      }),
    )
  }, [records, search, columns])

  const pageSize = 15
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  const isDeletableTable = ['users', 'keys', 'admins', 'orders', 'freeusers'].includes(table)

  const selectableVisibleIds = useMemo(() => {
    if (!isDeletableTable) return []
    return visible
      .map((row) => getDatabaseRecordId(row))
      .filter((id) => id !== null)
  }, [visible, isDeletableTable])

  async function run(operation, successMsg, actionId = 'action') {
    setBusyAction(actionId)
    setError('')
    setMessage('')
    try {
      await operation()
      if (successMsg) setMessage(successMsg)
      load()
    } catch (issue) {
      if (issue?.status === 401) {
        onSessionInvalid()
      } else if (issue?.status === 403) {
        setError(extractApiMessage(issue?.payload, 'Access denied: Owner privileges required for this action.'))
      } else {
        setError(extractApiMessage(issue?.payload, issue?.message || 'The request failed.'))
      }
    } finally {
      setBusyAction('')
    }
  }

  function handleTableChange(nextTable) {
    setTable(nextTable)
    setSearch('')
    setPage(1)
    setSelectedIds(new Set())
    setEditRecord(null)
    setError('')
    setMessage('')
  }

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(new Set(selectableVisibleIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  function toggleSelectOne(id) {
    if (id === null || id === undefined || id === '') return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function handleBulkDelete() {
    const ids = Array.from(selectedIds).filter((id) => id !== null && id !== undefined && id !== '')
    if (ids.length === 0) return
    setDeleteModal({
      label: `${ids.length} selected record(s) from ${activeTableLabel}`,
      action: async () => {
        const results = await Promise.allSettled(
          ids.map((id) => deleteOwnerRecord(token, table, id)),
        )
        const failed = results.filter((r) => r.status === 'rejected').length
        setSelectedIds(new Set())
        if (failed > 0) {
          throw new Error(`${failed} record(s) failed to delete.`)
        }
      },
    })
  }

  function confirmDelete(id) {
    if (id === null || id === undefined || id === '') {
      setError('Cannot delete record: valid database identifier is missing.')
      return
    }
    setDeleteModal({
      label: `record #${id} from ${activeTableLabel}`,
      action: () => deleteOwnerRecord(token, table, id),
    })
  }

  function closeEdit() {
    setEditRecord(null)
    setUserPasswordForm({ newPassword: '', confirmPassword: '' })
    setUserPasswordError('')
    setUserPasswordSuccess('')
  }

  function openEdit(row) {
    setEditRecord(row)
    setUserPasswordForm({ newPassword: '', confirmPassword: '' })
    setUserPasswordError('')
    setUserPasswordSuccess('')
    if (table === 'users') {
      setEditForm({
        plan: resolveRecordField(row, ['plan', 'Plan']) ?? '',
        expiryTime: toDatetimeLocal(
          resolveRecordField(row, ['expiryTime', 'ExpiryTime', 'expiry', 'Expiry']) ?? '',
        ),
        isBanned: Boolean(resolveRecordField(row, ['isBanned', 'IsBanned']) ?? false),
      })
    } else if (table === 'keys') {
      setEditForm({
        plan: resolveRecordField(row, ['plan', 'Plan']) ?? '',
        validDays: resolveRecordField(row, ['validDays', 'ValidDays']) ?? 0,
        isUsed: Boolean(resolveRecordField(row, ['isUsed', 'IsUsed']) ?? false),
      })
    } else if (table === 'admins') {
      setEditForm({
        role: resolveRecordField(row, ['role', 'Role']) ?? '',
        isActive: Boolean(resolveRecordField(row, ['isActive', 'IsActive']) ?? true),
      })
    } else if (table === 'orders') {
      setEditForm({
        status: resolveRecordField(row, ['status', 'Status']) ?? 'Pending',
      })
    } else if (table === 'settings') {
      setEditForm({
        latestVersion: resolveRecordField(row, ['latestVersion', 'LatestVersion']) ?? '1.0',
        updateUrl: resolveRecordField(row, ['updateUrl', 'UpdateUrl']) ?? '',
        maintenanceReason:
          resolveRecordField(row, ['maintenanceReason', 'MaintenanceReason']) ?? '',
        freeLink: resolveRecordField(row, ['freeLink', 'FreeLink']) ?? '',
        streamerLink: resolveRecordField(row, ['streamerLink', 'StreamerLink']) ?? '',
        sniperLink: resolveRecordField(row, ['sniperLink', 'SniperLink']) ?? '',
        specialLink: resolveRecordField(row, ['specialLink', 'SpecialLink']) ?? '',
        aimbotLink: resolveRecordField(row, ['aimbotLink', 'AimbotLink']) ?? '',
        premiumLink: resolveRecordField(row, ['premiumLink', 'PremiumLink']) ?? '',
        customisedLink: resolveRecordField(row, ['customisedLink', 'CustomisedLink']) ?? '',
      })
    } else if (table === 'freeSettings') {
      setEditForm({
        freeUsername:
          resolveRecordField(row, ['freeUsername', 'FreeUsername', 'freeUser', 'FreeUser']) ?? '',
        freePassword:
          resolveRecordField(row, ['freePassword', 'FreePassword', 'freePass', 'FreePass']) ?? '',
        freeValidDays: resolveRecordField(row, ['freeValidDays', 'FreeValidDays']) ?? 30,
        maxFreeSlots:
          resolveRecordField(row, [
            'maxFreeSlots',
            'MaxFreeSlots',
            'freeMaxSlots',
            'FreeMaxSlots',
            'maxSlots',
            'MaxSlots',
          ]) ?? 20,
        freeLink:
          resolveRecordField(row, [
            'freeLink',
            'FreeLink',
            'freeDownloadLink',
            'FreeDownloadLink',
          ]) ?? '',
        showHomeDownloadBtn: Boolean(
          resolveRecordField(row, ['showHomeDownloadBtn', 'ShowHomeDownloadBtn']) ?? false,
        ),
      })
    } else if (table === 'freeusers') {
      setEditForm({
        username: resolveRecordField(row, ['username', 'Username']) ?? '',
        hwid: resolveRecordField(row, ['hwid', 'HWID', 'Hwid']) ?? '',
        envName: resolveRecordField(row, ['EnvName', 'envName']) ?? '',
        captchaToken: resolveRecordField(row, ['CaptchaToken', 'captchaToken']) ?? '',
        isBanned: Boolean(resolveRecordField(row, ['isBanned', 'IsBanned']) ?? false),
        failedLoginAttempts:
          resolveRecordField(row, ['failedLoginAttempts', 'FailedLoginAttempts']) ?? 0,
      })
    } else if (table === 'panelUpdates') {
      setEditForm({
        update1: resolveRecordField(row, ['update1', 'Update1']) ?? '',
        update2: resolveRecordField(row, ['update2', 'Update2']) ?? '',
        update3: resolveRecordField(row, ['update3', 'Update3']) ?? '',
        update4: resolveRecordField(row, ['update4', 'Update4']) ?? '',
      })
    }
  }

  async function handleSetUserPassword() {
    setUserPasswordError('')
    setUserPasswordSuccess('')

    if (!editRecord) {
      setUserPasswordError('Please select a valid user account.')
      return
    }

    const id = getDatabaseRecordId(editRecord)
    if (id === null) {
      setUserPasswordError('Invalid user ID. Cannot update password.')
      return
    }

    const { newPassword, confirmPassword } = userPasswordForm
    if (!newPassword || !confirmPassword) {
      setUserPasswordError('Both new password and confirm password fields are required.')
      return
    }

    if (newPassword.length < 6) {
      setUserPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setUserPasswordError('New password and confirmation do not match.')
      return
    }

    setBusyAction('setUserPassword')
    try {
      const res = await setUserPassword(token, id, newPassword)
      const successText = res?.message || `Password successfully updated for user #${id}.`
      setUserPasswordForm({ newPassword: '', confirmPassword: '' })
      setUserPasswordSuccess(successText)
      setUserPasswordError('')
      load()
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
      setUserPasswordError(friendlyError)
      setUserPasswordSuccess('')
    } finally {
      setBusyAction('')
    }
  }

  async function handleSaveFreeSettings() {
    const trimmedUsername = String(editForm.freeUsername ?? '').trim()
    const rawPassword = String(editForm.freePassword ?? '').trim()
    const validDaysNum = Number(editForm.freeValidDays)
    const maxSlotsNum = Number(editForm.maxFreeSlots)
    const previousUsername = String(
      resolveRecordField({ ...cachedSettings, ...editRecord }, [
        'freeUsername',
        'FreeUsername',
        'freeUser',
        'FreeUser',
      ]) ?? '',
    ).trim()

    if (!trimmedUsername && rawPassword) {
      setError(
        'Global Free Username is required when a Free Password is provided. Leave both blank to turn Free Panel off.',
      )
      return
    }

    if (trimmedUsername && !rawPassword) {
      setError('Global Free Password is required when configuring a Free Panel username.')
      return
    }

    if (trimmedUsername && rawPassword.length < 6) {
      setError('Global Free Password must be at least 6 characters long.')
      return
    }

    if (!Number.isInteger(validDaysNum) || validDaysNum < 1) {
      setError('Free User Valid Days must be a positive integer (at least 1 day).')
      return
    }

    if (!Number.isInteger(maxSlotsNum) || maxSlotsNum < 1) {
      setError('Max Free Panel Slots must be a positive integer (at least 1 slot).')
      return
    }

    const payload = buildSettingsPayload(
      { ...cachedSettings, ...editRecord },
      {
        ...editForm,
        freeUsername: trimmedUsername,
        freePassword: trimmedUsername ? rawPassword : '',
        freeValidDays: validDaysNum,
        maxFreeSlots: maxSlotsNum,
      },
    )

    setBusyAction('save')
    setError('')
    setMessage('')

    try {
      // Inspect existing Users table to prevent paid-account conflicts and detect existing free accounts
      const usersPayload = await getOwnerTable(token, 'users')
      const currentUsers = listFor('users', usersPayload)

      const existingUser = trimmedUsername
        ? currentUsers.find(
            (u) =>
              String(resolveRecordField(u, ['username', 'Username']) ?? '')
                .trim()
                .toLowerCase() === trimmedUsername.toLowerCase(),
          )
        : null

      if (existingUser) {
        const existingPlan = String(resolveRecordField(existingUser, ['plan', 'Plan']) ?? '')
          .trim()
          .toLowerCase()
        if (existingPlan && existingPlan !== 'free') {
          throw new Error(
            `Cannot use username "${trimmedUsername}" for Free Panel: it belongs to an existing paid (${existingPlan.toUpperCase()}) user account.`,
          )
        }
      }

      // Step A — Persist global Free Panel settings
      await updateOwnerRecord(token, 'freeSettings', payload)
      setCachedSettings((prev) => ({ ...prev, ...payload }))

      // Step B — Create, update, or disable the corresponding Free Plan user in the Users table
      const expiryTimeIso = trimmedUsername
        ? new Date(Date.now() + validDaysNum * 86400000).toISOString()
        : new Date(0).toISOString()

      const syncMode = !trimmedUsername ? 'disable' : existingUser ? 'update' : 'create'
      let accountOutcome =
        syncMode === 'create' ? 'created' : syncMode === 'update' ? 'updated' : 'disabled'

      try {
        const syncRes = await syncFreePanelUser(token, {
          username: trimmedUsername,
          previousUsername,
          password: trimmedUsername ? rawPassword : '',
          plan: 'free',
          validDays: validDaysNum,
          expiryTime: expiryTimeIso,
          isBanned: !trimmedUsername,
        })
        const reportedStatus = String(syncRes?.status || syncRes?.action || '').toLowerCase()
        if (['created', 'updated', 'disabled', 'existed', 'unchanged'].includes(reportedStatus)) {
          accountOutcome = reportedStatus
        }
      } catch (syncError) {
        if (syncError?.status === 401) {
          onSessionInvalid()
          return
        }
        if (syncError?.status === 403) {
          throw new Error(
            extractApiMessage(
              syncError?.payload,
              'Access denied: Owner privileges required to provision Free Plan users.',
            ),
          )
        }

        const canFallbackToExistingUserEndpoints =
          (syncError?.status === 404 || syncError?.status === 405) &&
          (syncMode === 'update' || syncMode === 'disable')

        if (canFallbackToExistingUserEndpoints) {
          if (syncMode === 'update' && existingUser) {
            const existingId = getDatabaseRecordId(existingUser)
            if (existingId === null) {
              throw new Error(
                `Settings were saved, but could not update existing free user "${trimmedUsername}" because its database ID is missing.`,
              )
            }
            await updateAdminUser(token, {
              id: existingId,
              userId: existingId,
              plan: 'free',
              expiryTime: expiryTimeIso,
              isBanned: false,
            })
            await setUserPassword(token, existingId, rawPassword)
            accountOutcome = 'updated'
          } else if (syncMode === 'disable') {
            const prevFreeUser = previousUsername
              ? currentUsers.find(
                  (u) =>
                    String(resolveRecordField(u, ['username', 'Username']) ?? '')
                      .trim()
                      .toLowerCase() === previousUsername.toLowerCase() &&
                    String(resolveRecordField(u, ['plan', 'Plan']) ?? '')
                      .trim()
                      .toLowerCase() === 'free',
                )
              : null
            const prevId = prevFreeUser ? getDatabaseRecordId(prevFreeUser) : null
            if (prevId !== null) {
              await updateAdminUser(token, {
                id: prevId,
                userId: prevId,
                plan: 'free',
                expiryTime: new Date(0).toISOString(),
                isBanned: true,
              })
            }
            accountOutcome = 'disabled'
          }
        } else {
          const detail = extractApiMessage(
            syncError?.payload,
            syncError?.message || 'Could not synchronize the Free Plan user account.',
          )
          throw new Error(
            `Settings were saved, but Free Plan user provisioning failed: ${detail}`,
          )
        }
      }

      // Close modal and refresh public FreePanel status + Users table
      setEditRecord(null)
      getFreePanelStatus().catch(() => {})

      let refreshFailed = false
      try {
        const refreshedUsersPayload = await getOwnerTable(token, 'users')
        const refreshedUsers = listFor('users', refreshedUsersPayload)
        skipNextFetchRef.current = true
        setRecords(refreshedUsers)
        setTable('users')
        setPage(1)
      } catch (refreshError) {
        if (refreshError?.status === 401) {
          onSessionInvalid()
          return
        }
        refreshFailed = true
      }

      if (refreshFailed) {
        setError(
          `Free Panel settings were saved and Free Plan user "${trimmedUsername || previousUsername || 'free'}" was ${accountOutcome}, but refreshing the Users table failed. Click Reload Table to view the updated records.`,
        )
      } else if (!trimmedUsername || accountOutcome === 'disabled') {
        setMessage(
          'Free Panel settings saved (Free Panel OFF) and previous Free Plan user account was disabled.',
        )
      } else if (accountOutcome === 'updated') {
        setMessage(
          `Free Panel settings saved and existing Free Plan user "${trimmedUsername}" (Plan: FREE) was updated in Users.`,
        )
      } else if (accountOutcome === 'existed' || accountOutcome === 'unchanged') {
        setMessage(
          `Free Panel settings saved. Free Plan user "${trimmedUsername}" (Plan: FREE) already existed in Users.`,
        )
      } else {
        setMessage(
          `Free Panel settings saved and Free Plan user "${trimmedUsername}" (Plan: FREE) was created in Users.`,
        )
      }
    } catch (issue) {
      if (issue?.status === 401) {
        onSessionInvalid()
      } else if (issue?.status === 403) {
        setError(
          extractApiMessage(
            issue?.payload,
            'Access denied: Owner privileges required for this action.',
          ),
        )
      } else {
        setError(extractApiMessage(issue?.payload, issue?.message || 'The request failed.'))
      }
    } finally {
      setBusyAction('')
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editRecord) return

    if (table === 'freeSettings') {
      await handleSaveFreeSettings()
      return
    }

    const editId = getDatabaseRecordId(editRecord) ?? 0
    let payload = {}

    if (table === 'users') {
      payload = {
        id: editId,
        userId: editId,
        plan: editForm.plan,
        expiryTime: toIsoOrNullFromDatetimeLocal(editForm.expiryTime),
        isBanned: Boolean(editForm.isBanned),
      }
    } else if (table === 'keys') {
      payload = {
        id: editId,
        userId: editId,
        plan: editForm.plan,
        validDays: Number(editForm.validDays) || 0,
        isUsed: Boolean(editForm.isUsed),
      }
    } else if (table === 'admins') {
      payload = {
        id: editId,
        userId: editId,
        role: editForm.role,
        isActive: Boolean(editForm.isActive),
      }
    } else if (table === 'orders') {
      payload = {
        id: editId,
        userId: editId,
        status: editForm.status || 'Pending',
      }
    } else if (table === 'settings') {
      payload = buildSettingsPayload({ ...cachedSettings, ...editRecord }, editForm)
    } else if (table === 'freeusers') {
      payload = {
        id: editId,
        userId: editId,
        Username: editForm.username,
        HWID: editForm.hwid,
        EnvName: editForm.envName ?? '',
        CaptchaToken: editForm.captchaToken ?? '',
        IsBanned: Boolean(editForm.isBanned),
        FailedLoginAttempts: Number(editForm.failedLoginAttempts) || 0,
      }
    } else if (table === 'panelUpdates') {
      payload = {
        update1: editForm.update1 || '',
        update2: editForm.update2 || '',
        update3: editForm.update3 || '',
        update4: editForm.update4 || '',
      }
    }

    await run(async () => {
      await updateOwnerRecord(token, table, payload)
      if (table === 'settings') {
        setCachedSettings((prev) => ({ ...prev, ...payload }))
      }
      setEditRecord(null)
    }, 'Record updated successfully.', 'save')
  }

  async function toggleMaint() {
    const isM = Boolean(
      resolveRecordField(cachedSettings, ['isMaintenanceMode', 'IsMaintenanceMode']),
    )
    await run(async () => {
      const res = await toggleMaintenance(token, !isM)
      setCachedSettings((cur) => ({
        ...cur,
        isMaintenanceMode: Boolean(
          resolveRecordField(res, ['isMaintenanceMode', 'IsMaintenanceMode']) ?? !isM,
        ),
      }))
    }, `Maintenance mode turned ${!isM ? 'ON' : 'OFF'}.`, 'maintenance')
  }

  const editId = editRecord ? getDatabaseRecordId(editRecord) : null
  const isMaintenanceOn = Boolean(
    resolveRecordField(cachedSettings, ['isMaintenanceMode', 'IsMaintenanceMode']),
  )

  return (
    <div className="workspace-wrap">
      <section className="panel">
        <div className="ownerdb-header">
          <div>
            <span className="hero-eyebrow">Database Console</span>
            <h1 className="auth-title mt-6">Owner Database Manager</h1>
            <p className="auth-subtitle mb-0">
              Direct record management for DSC database collections.
            </p>
          </div>

          <div className="ownerdb-header-actions">
            <button
              type="button"
              className={`button button-sm ${isMaintenanceOn ? 'button-danger' : 'button-secondary'} ${busyAction === 'maintenance' ? 'is-loading' : ''}`}
              disabled={busy}
              onClick={toggleMaint}
            >
              {busyAction === 'maintenance' ? (
                <span className="button-loading-content">
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Updating...</span>
                </span>
              ) : (
                <span>Maintenance: {isMaintenanceOn ? 'ACTIVE' : 'OFF'}</span>
              )}
            </button>
            <button
              type="button"
              className={`button button-secondary button-sm ${loading ? 'is-loading' : ''}`}
              disabled={loading || busy}
              onClick={load}
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Reloading...</span>
                </span>
              ) : (
                <span>Reload Table</span>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ownerdb-toolbar">
          <div className="ownerdb-filters">
            <label className="field ownerdb-filter-field">
              <span className="micro-label">SELECT TABLE</span>
              <select
                value={table}
                onChange={(e) => handleTableChange(e.target.value)}
                className="ownerdb-control"
              >
                {TABLES.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field ownerdb-filter-field ownerdb-search-field">
              <span className="micro-label">SEARCH RECORDS</span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={`Filter ${activeTableLabel.toLowerCase()}...`}
                className="ownerdb-control db-search-input"
              />
            </label>
          </div>

          <div className="ownerdb-pagination">
            {isDeletableTable && selectedIds.size > 0 ? (
              <button
                type="button"
                className="button button-danger button-sm"
                onClick={handleBulkDelete}
                disabled={busy}
              >
                Delete Selected ({selectedIds.size})
              </button>
            ) : null}

            <button
              type="button"
              className="button button-secondary button-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="ownerdb-page-indicator">
              Page {page} of {pageCount} ({filtered.length} Total)
            </span>
            <button
              type="button"
              className="button button-secondary button-sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {message ? (
          <div className="form-success mb-16">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="form-error mb-16" role="alert">
            {error}
          </div>
        ) : null}

        {/* Data Table */}
        <div className="table-wrap">
          <table className="ownerdb-table">
            <thead>
              <tr>
                {isDeletableTable ? (
                  <th className="ownerdb-checkbox-col">
                    <input
                      type="checkbox"
                      aria-label="Select all records on this page"
                      disabled={selectableVisibleIds.length === 0}
                      checked={
                        selectableVisibleIds.length > 0 &&
                        selectableVisibleIds.every((id) => selectedIds.has(id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                ) : null}
                {columns.map((col) => (
                  <th key={col.id}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (isDeletableTable ? 2 : 1)} className="ownerdb-empty-cell">
                    Loading database records...
                  </td>
                </tr>
              ) : (
                visible.map((row, index) => {
                  const dbId = getDatabaseRecordId(row)
                  const hasValidId = dbId !== null
                  const rowKey = hasValidId ? `${table}-${dbId}` : `${table}-row-${index}`
                  const isSelected = hasValidId && selectedIds.has(dbId)

                  return (
                    <tr key={rowKey}>
                      {isDeletableTable ? (
                        <td className="ownerdb-checkbox-col">
                          <input
                            type="checkbox"
                            aria-label={hasValidId ? `Select record ${dbId}` : 'Record ID missing'}
                            disabled={!hasValidId}
                            checked={isSelected}
                            onChange={() => toggleSelectOne(dbId)}
                          />
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td key={col.id} className="ownerdb-data-cell">
                          {renderCellValue(col, row)}
                        </td>
                      ))}
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="button button-secondary button-sm"
                            onClick={() => openEdit(row)}
                          >
                            Edit / Manage
                          </button>
                          {isDeletableTable ? (
                            hasValidId ? (
                              <button
                                type="button"
                                className="button button-danger button-sm"
                                disabled={busy}
                                onClick={() => confirmDelete(dbId)}
                              >
                                Delete
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="button button-danger button-sm"
                                  disabled
                                  title="Cannot delete record without a valid database ID"
                                >
                                  Delete
                                </button>
                                <span
                                  className="badge warning"
                                  title="Record lacks a valid database identifier"
                                >
                                  ID Missing
                                </span>
                              </>
                            )
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              {!loading && !visible.length ? (
                <tr>
                  <td colSpan={columns.length + (isDeletableTable ? 2 : 1)} className="ownerdb-empty-cell">
                    No matching records found in "{activeTableLabel}".
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Record Modal (Table-Specific Form Controls) */}
      {editRecord ? (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <form
            className="modal-card form-stack ownerdb-modal-card"
            onSubmit={handleSaveEdit}
            noValidate
          >
            <div>
              <span className="micro-label">TABLE: {activeTableLabel.toUpperCase()}</span>
              <h2 className="mt-4 mb-0">
                Edit {activeTableLabel} {editId !== null ? `(ID: ${editId})` : ''}
              </h2>
            </div>

            {/* USERS FORM */}
            {table === 'users' ? (
              <>
                <div className="ownerdb-record-summary">
                  <strong>Username:</strong>{' '}
                  {resolveRecordField(editRecord, ['username', 'Username']) ?? '—'} &nbsp;|&nbsp;{' '}
                  <strong>HWID:</strong>{' '}
                  <code>{resolveRecordField(editRecord, ['hwid', 'HWID', 'Hwid']) ?? '—'}</code>
                </div>

                <label className="field">
                  <span>Plan</span>
                  <input
                    required
                    value={editForm.plan || ''}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Expiry Date &amp; Time</span>
                  <input
                    type="datetime-local"
                    value={editForm.expiryTime || ''}
                    onChange={(e) => setEditForm({ ...editForm, expiryTime: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Ban Status</span>
                  <select
                    value={String(Boolean(editForm.isBanned))}
                    onChange={(e) => setEditForm({ ...editForm, isBanned: e.target.value === 'true' })}
                  >
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                  </select>
                </label>
              </>
            ) : null}

            {/* KEYS FORM */}
            {table === 'keys' ? (
              <>
                <div className="ownerdb-record-summary">
                  <strong>Key:</strong>{' '}
                  <code>
                    {resolveRecordField(editRecord, ['keyValue', 'KeyValue', 'key', 'Key']) ?? '—'}
                  </code>
                </div>

                <label className="field">
                  <span>Plan</span>
                  <input
                    required
                    value={editForm.plan || ''}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Valid Days</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editForm.validDays ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, validDays: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Key Used</span>
                  <select
                    value={String(Boolean(editForm.isUsed))}
                    onChange={(e) => setEditForm({ ...editForm, isUsed: e.target.value === 'true' })}
                  >
                    <option value="false">False (Unused)</option>
                    <option value="true">True (Used)</option>
                  </select>
                </label>
              </>
            ) : null}

            {/* ADMINS FORM */}
            {table === 'admins' ? (
              <>
                <div className="ownerdb-record-summary">
                  <strong>Admin Username:</strong>{' '}
                  {resolveRecordField(editRecord, ['username', 'Username']) ?? '—'}
                </div>

                <label className="field">
                  <span>Role</span>
                  <input
                    required
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Is Active</span>
                  <select
                    value={String(Boolean(editForm.isActive))}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">True (Active)</option>
                    <option value="false">False (Inactive)</option>
                  </select>
                </label>
              </>
            ) : null}

            {/* ORDERS FORM */}
            {table === 'orders' ? (
              <>
                <div className="ownerdb-record-summary">
                  <strong>User:</strong>{' '}
                  {resolveRecordField(editRecord, ['username', 'Username']) ?? '—'} &nbsp;|&nbsp;{' '}
                  <strong>Plan:</strong> {resolveRecordField(editRecord, ['plan', 'Plan']) ?? '—'}{' '}
                  &nbsp;|&nbsp; <strong>Amount:</strong>{' '}
                  {resolveRecordField(editRecord, ['amount', 'Amount']) ?? '—'} &nbsp;|&nbsp;{' '}
                  <strong>Txn ID:</strong>{' '}
                  <code>
                    {resolveRecordField(editRecord, ['txnId', 'TxnId', 'transactionId']) ?? '—'}
                  </code>
                </div>

                <label className="field">
                  <span>Order Status</span>
                  <select
                    value={editForm.status || 'Pending'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>
              </>
            ) : null}

            {/* SYSTEM SETTINGS FORM */}
            {table === 'settings' ? (
              <>
                <h4 className="ownerdb-section-heading">System &amp; Maintenance</h4>

                <label className="field">
                  <span>Latest Panel Version</span>
                  <input
                    value={editForm.latestVersion || ''}
                    onChange={(e) => setEditForm({ ...editForm, latestVersion: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>App Update URL</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.updateUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, updateUrl: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Custom Maintenance Reason</span>
                  <textarea
                    rows={2}
                    value={editForm.maintenanceReason || ''}
                    onChange={(e) => setEditForm({ ...editForm, maintenanceReason: e.target.value })}
                  />
                </label>

                <h4 className="ownerdb-section-heading mt-16">Panel Download Links</h4>

                <label className="field">
                  <span>Free Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.freeLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, freeLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Streamer Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.streamerLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, streamerLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Sniper Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.sniperLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, sniperLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Special Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.specialLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, specialLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Aimbot Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.aimbotLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, aimbotLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Premium Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.premiumLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, premiumLink: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Customised Panel Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.customisedLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, customisedLink: e.target.value })}
                  />
                </label>
              </>
            ) : null}

            {/* FREE SETTINGS FORM */}
            {table === 'freeSettings' ? (
              <>
                <h4 className="ownerdb-section-heading ownerdb-section-heading-success">
                  Free Panel Configurations
                </h4>

                <label className="field">
                  <span>Global Free Username (Blank = Delete/OFF)</span>
                  <input
                    value={editForm.freeUsername || ''}
                    onChange={(e) => setEditForm({ ...editForm, freeUsername: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Global Free Password</span>
                  <input
                    value={editForm.freePassword || ''}
                    onChange={(e) => setEditForm({ ...editForm, freePassword: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Free User Valid Days</span>
                  <input
                    type="number"
                    min="1"
                    value={editForm.freeValidDays ?? 30}
                    onChange={(e) => setEditForm({ ...editForm, freeValidDays: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Max Free Panel Slots</span>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxFreeSlots ?? 20}
                    onChange={(e) => setEditForm({ ...editForm, maxFreeSlots: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Free Panel Download Link</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.freeLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, freeLink: e.target.value })}
                  />
                </label>

                <label className="checkbox-label ownerdb-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.showHomeDownloadBtn)}
                    onChange={(e) =>
                      setEditForm({ ...editForm, showHomeDownloadBtn: e.target.checked })
                    }
                  />
                  <span>Show Download Button on Home Page</span>
                </label>
              </>
            ) : null}

            {/* FREE USERS FORM */}
            {table === 'freeusers' ? (
              <>
                <label className="field">
                  <span>Username</span>
                  <input
                    required
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>HWID Lock</span>
                  <input
                    value={editForm.hwid || ''}
                    onChange={(e) => setEditForm({ ...editForm, hwid: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>PC Name / Environment (EnvName)</span>
                  <input
                    value={editForm.envName || ''}
                    onChange={(e) => setEditForm({ ...editForm, envName: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Ban Status</span>
                  <select
                    value={String(Boolean(editForm.isBanned))}
                    onChange={(e) => setEditForm({ ...editForm, isBanned: e.target.value === 'true' })}
                  >
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                  </select>
                </label>

                <label className="field">
                  <span>Failed Attempts</span>
                  <input
                    type="number"
                    min="0"
                    value={editForm.failedLoginAttempts ?? 0}
                    onChange={(e) =>
                      setEditForm({ ...editForm, failedLoginAttempts: e.target.value })
                    }
                  />
                </label>
              </>
            ) : null}

            {/* PANEL UPDATES FORM */}
            {table === 'panelUpdates' ? (
              <>
                <h4 className="ownerdb-section-heading">Update Panel Status</h4>

                <label className="field">
                  <span>Aimbot Status</span>
                  <input
                    value={editForm.update1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, update1: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Sniper Status</span>
                  <input
                    value={editForm.update2 || ''}
                    onChange={(e) => setEditForm({ ...editForm, update2: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Bypass Status</span>
                  <input
                    value={editForm.update3 || ''}
                    onChange={(e) => setEditForm({ ...editForm, update3: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>General Status</span>
                  <input
                    value={editForm.update4 || ''}
                    onChange={(e) => setEditForm({ ...editForm, update4: e.target.value })}
                  />
                </label>
              </>
            ) : null}

            {table === 'users' && editRecord ? (
              <div className="ownerdb-security-section">
                <span className="micro-label ownerdb-security-label">OWNER SECURITY ACTIONS</span>
                <div className="ownerdb-security-buttons">
                  <button
                    type="button"
                    className={`button button-secondary button-sm ${busyAction === 'resetHwid' ? 'is-loading' : ''}`}
                    disabled={busy || editId === null}
                    onClick={() => {
                      if (editId === null) return
                      run(
                        () => resetUserHwid(token, editId),
                        `HWID successfully reset for user #${editId}.`,
                        'resetHwid',
                      )
                    }}
                  >
                    Reset HWID
                  </button>
                  <button
                    type="button"
                    className={`button button-danger button-sm ${busyAction === 'forceReset' ? 'is-loading' : ''}`}
                    disabled={busy || editId === null}
                    onClick={() => {
                      if (editId === null) return
                      run(
                        () => forceUserPasswordReset(token, editId),
                        `Password reset successfully enforced for user #${editId}.`,
                        'forceReset',
                      )
                    }}
                  >
                    Force Password Reset
                  </button>
                </div>

                {/* Direct Set User Password Section */}
                <div className="ownerdb-password-box">
                  <span className="micro-label ownerdb-security-label">SET NEW USER PASSWORD</span>
                  <p className="ownerdb-password-help">
                    Directly assign a new password for account #{editId ?? '—'} (
                    {resolveRecordField(editRecord, ['username', 'Username']) ?? 'user'}). This takes
                    effect immediately without requiring user action.
                  </p>

                  {userPasswordSuccess ? (
                    <div className="form-success mb-12 text-sm">
                      {userPasswordSuccess}
                    </div>
                  ) : null}

                  {userPasswordError ? (
                    <div className="form-error mb-12 text-sm">
                      {userPasswordError}
                    </div>
                  ) : null}

                  <div className="ownerdb-password-grid">
                    <label className="field m-0">
                      <span>New Password (min 6 characters)</span>
                      <PasswordInput
                        value={userPasswordForm.newPassword}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        minLength={6}
                        disabled={busy}
                        onChange={(e) => {
                          setUserPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                          setUserPasswordError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSetUserPassword()
                          }
                        }}
                      />
                    </label>

                    <label className="field m-0">
                      <span>Confirm New Password</span>
                      <PasswordInput
                        value={userPasswordForm.confirmPassword}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        minLength={6}
                        disabled={busy}
                        onChange={(e) => {
                          setUserPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                          setUserPasswordError('')
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

                  <div className="ownerdb-password-actions">
                    <button
                      type="button"
                      className={`button button-secondary button-sm ${busyAction === 'setUserPassword' ? 'is-loading' : ''}`}
                      disabled={busy || editId === null}
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
                    {userPasswordForm.newPassword || userPasswordForm.confirmPassword ? (
                      <button
                        type="button"
                        className="button button-text button-sm"
                        disabled={busy}
                        onClick={() => {
                          setUserPasswordForm({ newPassword: '', confirmPassword: '' })
                          setUserPasswordError('')
                        }}
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Buttons */}
            <div className="ownerdb-modal-actions">
              <button
                className={`button button-primary ${busyAction === 'save' ? 'is-loading' : ''}`}
                disabled={busy}
                type="submit"
              >
                {busyAction === 'save' ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button className="button button-secondary" type="button" onClick={closeEdit}>
                Cancel
              </button>
            </div>

            {/* Optional Delete Button inside edit modal for deletable tables */}
            {isDeletableTable ? (
              <div className="ownerdb-modal-delete-zone">
                <button
                  type="button"
                  className="button button-danger button-full"
                  disabled={busy || editId === null}
                  onClick={() => {
                    const id = editId
                    closeEdit()
                    confirmDelete(id)
                  }}
                >
                  Permanently Delete Record
                </button>
              </div>
            ) : null}
          </form>
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
            <p className="ownerdb-delete-confirm-text">
              Permanently delete {deleteModal.label}? This database operation cannot be reversed.
            </p>
            <div className="ownerdb-delete-confirm-actions">
              <button
                type="button"
                className={`button button-danger ${busyAction === 'delete' ? 'is-loading' : ''}`}
                disabled={busy}
                onClick={async () => {
                  const action = deleteModal.action
                  await run(async () => {
                    await action()
                    setDeleteModal(null)
                  }, 'Deleted successfully.', 'delete')
                }}
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
                disabled={busy}
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
