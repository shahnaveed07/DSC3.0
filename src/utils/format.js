export function formatDateTime(value) {
  if (!value) return 'Not available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function sentenceCase(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function normalizeCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.Data)) return payload.Data
  return []
}

export function toBase64DataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function toDatetimeLocal(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  const local = new Date(date.getTime() - offsetMs)
  return local.toISOString().slice(0, 16)
}

export function toIsoOrNullFromDatetimeLocal(localStr) {
  if (!localStr) return null
  const date = new Date(localStr)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function evaluateSubscriptionExpiry({ data, session, liveExpiry, isPending, isNoOrder }) {
  if (typeof data?.isExpired === 'boolean') {
    return data.isExpired
  }
  if (typeof data?.IsExpired === 'boolean') {
    return data.IsExpired
  }
  if (typeof session?.isExpired === 'boolean') {
    return session.isExpired
  }

  if (!liveExpiry || isPending || isNoOrder) {
    return false
  }

  const parsedTime = new Date(liveExpiry).getTime()
  if (Number.isNaN(parsedTime)) {
    return false
  }

  return parsedTime <= Date.now()
}

/**
 * Resolves the first meaningful (non-null, non-undefined, non-empty-string) value
 * from a record given an ordered list of known property aliases.
 * Falls back to a case-insensitive key lookup for the specified aliases.
 */
export function resolveRecordField(record, aliases = []) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return undefined
  }

  const aliasList = Array.isArray(aliases) ? aliases : [aliases]

  const isMeaningful = (val) => {
    if (val === null || val === undefined) return false
    if (typeof val === 'string') return val.trim().length > 0
    if (typeof val === 'object') return false
    return true
  }

  for (const key of aliasList) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const val = record[key]
      if (isMeaningful(val)) {
        return typeof val === 'string' ? val.trim() : val
      }
    }
  }

  const recordKeys = Object.keys(record)
  for (const alias of aliasList) {
    const lowerAlias = String(alias).toLowerCase()
    const matchedKey = recordKeys.find((k) => k.toLowerCase() === lowerAlias)
    if (matchedKey !== undefined) {
      const val = record[matchedKey]
      if (isMeaningful(val)) {
        return typeof val === 'string' ? val.trim() : val
      }
    }
  }

  // If a boolean false or numeric 0 was stored, it is already returned above.
  // If all present aliases were empty strings, return '' rather than undefined if any alias existed.
  for (const key of aliasList) {
    if (Object.prototype.hasOwnProperty.call(record, key) && typeof record[key] === 'string') {
      return ''
    }
  }

  return undefined
}

/**
 * Resolves a verified database record identifier for destructive/update operations.
 * Never falls back to array indices or usernames.
 */
export function getDatabaseRecordId(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return null
  }

  const rawId = resolveRecordField(row, [
    'id',
    'Id',
    'ID',
    'userId',
    'UserId',
    'keyId',
    'KeyId',
    'orderId',
    'OrderId',
    'adminId',
    'AdminId',
  ])

  if (rawId === undefined || rawId === null || rawId === '') {
    return null
  }

  if (typeof rawId === 'number') {
    return Number.isFinite(rawId) && rawId >= 0 ? rawId : null
  }

  if (typeof rawId === 'string') {
    const trimmed = rawId.trim()
    if (!trimmed) return null
    return trimmed
  }

  return null
}

/**
 * Explicit allowlisted column definitions for every Owner DB collection.
 * Prevents arbitrary or sensitive backend properties from leaking into table columns.
 */
export const TABLE_COLUMN_DEFINITIONS = {
  users: [
    { id: 'id', label: 'ID', aliases: ['id', 'Id', 'userId', 'UserId'], format: 'id' },
    { id: 'username', label: 'Username', aliases: ['username', 'Username'], format: 'text' },
    { id: 'plan', label: 'Plan', aliases: ['plan', 'Plan'], format: 'plan' },
    {
      id: 'keyValue',
      label: 'License Key',
      aliases: ['keyValue', 'KeyValue', 'key', 'Key', 'licenseKey', 'LicenseKey'],
      format: 'code',
    },
    { id: 'hwid', label: 'HWID', aliases: ['hwid', 'HWID', 'Hwid'], format: 'code' },
    { id: 'isBanned', label: 'Ban Status', aliases: ['isBanned', 'IsBanned'], format: 'boolean' },
    {
      id: 'failedLoginAttempts',
      label: 'Failed Login Attempts',
      aliases: ['failedLoginAttempts', 'FailedLoginAttempts'],
      format: 'number',
    },
    {
      id: 'lockoutEnd',
      label: 'Lockout End',
      aliases: ['lockoutEnd', 'LockoutEnd'],
      format: 'datetime',
    },
    {
      id: 'expiryTime',
      label: 'Expiry Date',
      aliases: ['expiryTime', 'ExpiryTime', 'expiry', 'Expiry'],
      format: 'datetime',
    },
    {
      id: 'registrationTime',
      label: 'Registration Date',
      aliases: ['registrationTime', 'RegistrationTime', 'createdAt', 'CreatedAt'],
      format: 'datetime',
    },
    {
      id: 'lastLoginTime',
      label: 'Last Login',
      aliases: ['lastLoginTime', 'LastLoginTime'],
      format: 'datetime',
    },
  ],
  settings: [
    { id: 'id', label: 'ID', aliases: ['id', 'Id'], format: 'id' },
    {
      id: 'isMaintenanceMode',
      label: 'Maintenance Status',
      aliases: ['isMaintenanceMode', 'IsMaintenanceMode'],
      format: 'boolean',
    },
    {
      id: 'maintenanceReason',
      label: 'Maintenance Reason',
      aliases: ['maintenanceReason', 'MaintenanceReason'],
      format: 'text',
    },
    {
      id: 'maxFreeSlots',
      label: 'Maximum Free Slots',
      aliases: ['maxFreeSlots', 'MaxFreeSlots', 'freeMaxSlots', 'FreeMaxSlots', 'maxSlots', 'MaxSlots'],
      format: 'number',
    },
    {
      id: 'latestVersion',
      label: 'Latest Version',
      aliases: ['latestVersion', 'LatestVersion'],
      format: 'text',
    },
    { id: 'updateUrl', label: 'Update URL', aliases: ['updateUrl', 'UpdateUrl'], format: 'url' },
    {
      id: 'showHomeDownloadBtn',
      label: 'Homepage Download Visibility',
      aliases: ['showHomeDownloadBtn', 'ShowHomeDownloadBtn'],
      format: 'boolean',
    },
    {
      id: 'freeValidDays',
      label: 'Free Valid Days',
      aliases: ['freeValidDays', 'FreeValidDays'],
      format: 'number',
    },
    {
      id: 'freeLink',
      label: 'Free Download Link',
      aliases: ['freeLink', 'FreeLink', 'freeDownloadLink', 'FreeDownloadLink'],
      format: 'url',
    },
    {
      id: 'streamerLink',
      label: 'Streamer Download Link',
      aliases: ['streamerLink', 'StreamerLink'],
      format: 'url',
    },
    {
      id: 'sniperLink',
      label: 'Sniper Download Link',
      aliases: ['sniperLink', 'SniperLink'],
      format: 'url',
    },
    {
      id: 'specialLink',
      label: 'Special Download Link',
      aliases: ['specialLink', 'SpecialLink'],
      format: 'url',
    },
    {
      id: 'aimbotLink',
      label: 'Aimbot Download Link',
      aliases: ['aimbotLink', 'AimbotLink'],
      format: 'url',
    },
    {
      id: 'premiumLink',
      label: 'Premium Download Link',
      aliases: ['premiumLink', 'PremiumLink'],
      format: 'url',
    },
    {
      id: 'customisedLink',
      label: 'Customised Download Link',
      aliases: ['customisedLink', 'CustomisedLink'],
      format: 'url',
    },
  ],
  freeSettings: [
    { id: 'id', label: 'ID', aliases: ['id', 'Id'], format: 'id' },
    {
      id: 'freeUsername',
      label: 'Free Username',
      aliases: ['freeUsername', 'FreeUsername', 'freeUser', 'FreeUser'],
      format: 'code',
    },
    {
      id: 'freePassword',
      label: 'Free Password',
      aliases: ['freePassword', 'FreePassword', 'freePass', 'FreePass'],
      format: 'code',
    },
    {
      id: 'freeValidDays',
      label: 'Free Valid Days',
      aliases: ['freeValidDays', 'FreeValidDays'],
      format: 'number',
    },
    {
      id: 'maxFreeSlots',
      label: 'Maximum Free Slots',
      aliases: ['maxFreeSlots', 'MaxFreeSlots', 'freeMaxSlots', 'FreeMaxSlots', 'maxSlots', 'MaxSlots'],
      format: 'number',
    },
    {
      id: 'freeLink',
      label: 'Free Download Link',
      aliases: ['freeLink', 'FreeLink', 'freeDownloadLink', 'FreeDownloadLink'],
      format: 'url',
    },
  ],
  freeusers: [
    { id: 'id', label: 'ID', aliases: ['id', 'Id', 'userId', 'UserId'], format: 'id' },
    { id: 'username', label: 'Username', aliases: ['username', 'Username'], format: 'text' },
    { id: 'hwid', label: 'HWID', aliases: ['hwid', 'HWID', 'Hwid'], format: 'code' },
    {
      id: 'envName',
      label: 'Environment / PC Name',
      aliases: ['EnvName', 'envName'],
      format: 'text',
    },
    { id: 'isBanned', label: 'Ban Status', aliases: ['isBanned', 'IsBanned'], format: 'boolean' },
    {
      id: 'failedLoginAttempts',
      label: 'Failed Login Attempts',
      aliases: ['failedLoginAttempts', 'FailedLoginAttempts'],
      format: 'number',
    },
    {
      id: 'lockoutEnd',
      label: 'Lockout End',
      aliases: ['lockoutEnd', 'LockoutEnd'],
      format: 'datetime',
    },
    {
      id: 'firstLoginTime',
      label: 'First Login',
      aliases: ['firstLoginTime', 'FirstLoginTime'],
      format: 'datetime',
    },
    {
      id: 'lastLoginTime',
      label: 'Last Login',
      aliases: ['lastLoginTime', 'LastLoginTime'],
      format: 'datetime',
    },
  ],
  keys: [
    { id: 'id', label: 'ID', aliases: ['id', 'Id', 'keyId', 'KeyId'], format: 'id' },
    {
      id: 'keyValue',
      label: 'Key Value',
      aliases: ['keyValue', 'KeyValue', 'key', 'Key'],
      format: 'code',
    },
    { id: 'plan', label: 'Plan', aliases: ['plan', 'Plan'], format: 'plan' },
    { id: 'validDays', label: 'Valid Days', aliases: ['validDays', 'ValidDays'], format: 'number' },
    { id: 'isUsed', label: 'Used Status', aliases: ['isUsed', 'IsUsed'], format: 'boolean' },
    {
      id: 'createdAt',
      label: 'Creation Date',
      aliases: [
        'createdAt',
        'CreatedAt',
        'creationDate',
        'CreationDate',
        'createdTime',
        'CreatedTime',
      ],
      format: 'datetime',
    },
  ],
  orders: [
    { id: 'id', label: 'Order ID', aliases: ['id', 'Id', 'orderId', 'OrderId'], format: 'id' },
    { id: 'username', label: 'Username', aliases: ['username', 'Username'], format: 'text' },
    { id: 'plan', label: 'Plan', aliases: ['plan', 'Plan'], format: 'plan' },
    {
      id: 'days',
      label: 'Duration',
      aliases: ['days', 'Days', 'duration', 'Duration', 'validDays', 'ValidDays'],
      format: 'duration',
    },
    { id: 'amount', label: 'Amount', aliases: ['amount', 'Amount'], format: 'text' },
    {
      id: 'txnId',
      label: 'Transaction ID',
      aliases: ['txnId', 'TxnId', 'transactionId', 'TransactionId'],
      format: 'code',
    },
    { id: 'status', label: 'Order Status', aliases: ['status', 'Status'], format: 'status' },
    {
      id: 'createdAt',
      label: 'Creation Date',
      aliases: [
        'createdAt',
        'CreatedAt',
        'orderDate',
        'OrderDate',
        'creationDate',
        'CreationDate',
        'createdTime',
        'CreatedTime',
      ],
      format: 'datetime',
    },
  ],
  admins: [
    {
      id: 'id',
      label: 'ID',
      aliases: ['id', 'Id', 'adminId', 'AdminId', 'userId', 'UserId'],
      format: 'id',
    },
    { id: 'username', label: 'Username', aliases: ['username', 'Username'], format: 'text' },
    { id: 'role', label: 'Role', aliases: ['role', 'Role'], format: 'text' },
    { id: 'isActive', label: 'Active Status', aliases: ['isActive', 'IsActive'], format: 'boolean' },
  ],
  panelUpdates: [
    { id: 'update1', label: 'Update 1', aliases: ['update1', 'Update1'], format: 'text' },
    { id: 'update2', label: 'Update 2', aliases: ['update2', 'Update2'], format: 'text' },
    { id: 'update3', label: 'Update 3', aliases: ['update3', 'Update3'], format: 'text' },
    { id: 'update4', label: 'Update 4', aliases: ['update4', 'Update4'], format: 'text' },
  ],
}

/**
 * Normalizes the response from GET /api/public/free-panel into a predictable contract.
 * Handles direct properties as well as documented data/Data response wrappers,
 * and skips empty strings when resolving property aliases.
 */
export function normalizeFreePanelResponse(payload) {
  const emptyResult = {
    freeUser: '',
    freePass: '',
    freeLink: '',
    usedSlots: 0,
    maxSlots: 10,
    hasValidCredentials: false,
    hasValidDownloadUrl: false,
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return emptyResult
  }

  // Unwrap documented { data: { ... } } or { Data: { ... } } wrapper if present
  let source = payload
  const hasDirectKeys = [
    'freeUser',
    'FreeUser',
    'freeUsername',
    'FreeUsername',
    'freePass',
    'FreePass',
    'freePassword',
    'FreePassword',
    'usedSlots',
    'UsedSlots',
    'maxSlots',
    'MaxSlots',
    'maxFreeSlots',
    'MaxFreeSlots',
    'freeMaxSlots',
    'FreeMaxSlots',
    'freeLink',
    'FreeLink',
    'freeDownloadLink',
    'FreeDownloadLink',
  ].some((k) => Object.prototype.hasOwnProperty.call(payload, k))

  if (!hasDirectKeys) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      source = payload.data
    } else if (payload.Data && typeof payload.Data === 'object' && !Array.isArray(payload.Data)) {
      source = payload.Data
    } else {
      return emptyResult
    }
  }

  const resolveStringAlias = (obj, keys) => {
    const val = resolveRecordField(obj, keys)
    if (typeof val !== 'string') return ''
    return val.trim()
  }

  const resolveNumberAlias = (obj, keys, fallback, allowZero = true) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const raw = obj[key]
        if (raw !== null && raw !== undefined && raw !== '' && typeof raw !== 'boolean') {
          const num = Number(raw)
          if (Number.isFinite(num) && (allowZero ? num >= 0 : num > 0)) {
            return num
          }
        }
      }
    }
    const objKeys = Object.keys(obj)
    for (const alias of keys) {
      const matched = objKeys.find((k) => k.toLowerCase() === alias.toLowerCase())
      if (matched !== undefined) {
        const raw = obj[matched]
        if (raw !== null && raw !== undefined && raw !== '' && typeof raw !== 'boolean') {
          const num = Number(raw)
          if (Number.isFinite(num) && (allowZero ? num >= 0 : num > 0)) {
            return num
          }
        }
      }
    }
    return fallback
  }

  const freeUser = resolveStringAlias(source, [
    'freeUser',
    'FreeUser',
    'freeUsername',
    'FreeUsername',
  ])
  const freePass = resolveStringAlias(source, [
    'freePass',
    'FreePass',
    'freePassword',
    'FreePassword',
  ])
  const freeLink = resolveStringAlias(source, [
    'freeLink',
    'FreeLink',
    'freeDownloadLink',
    'FreeDownloadLink',
  ])
  const usedSlots = resolveNumberAlias(source, ['usedSlots', 'UsedSlots'], 0, true)
  const maxSlots = resolveNumberAlias(
    source,
    ['maxSlots', 'MaxSlots', 'maxFreeSlots', 'MaxFreeSlots', 'freeMaxSlots', 'FreeMaxSlots'],
    10,
    false,
  )

  const hasValidCredentials = Boolean(freeUser && freePass)
  const hasValidDownloadUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(freeLink)

  return {
    freeUser,
    freePass,
    freeLink: hasValidDownloadUrl ? freeLink : '',
    usedSlots,
    maxSlots,
    hasValidCredentials,
    hasValidDownloadUrl,
  }
}

/**
 * Normalizes the authenticated user's order payload from GET /api/auth/my-order
 * (supporting single order objects, { orders: [] } collections, or 404 empty states)
 * into a structured list of user orders and real summary statistics.
 * Never returns dummy orders or fabricated counts.
 */
export function normalizeUserOrdersPayload(data, session = null, isNoOrder = false) {
  const emptySummary = {
    orders: [],
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    recentActivity: [],
  }

  if (isNoOrder || !data || typeof data !== 'object') {
    return emptySummary
  }

  const sessionUsername = String(session?.username || '').trim().toLowerCase()

  let rawList = []
  if (Array.isArray(data)) {
    rawList = data
  } else if (Array.isArray(data.orders)) {
    rawList = data.orders
  } else if (Array.isArray(data.Orders)) {
    rawList = data.Orders
  } else {
    const hasMeaningfulOrderField = Boolean(
      data.status ||
        data.Status ||
        data.plan ||
        data.Plan ||
        data.serviceType ||
        data.ServiceType ||
        data.key ||
        data.Key ||
        data.orderId ||
        data.OrderId ||
        data.id ||
        data.Id,
    )
    if (hasMeaningfulOrderField) {
      rawList = [data]
    }
  }

  const normalizedOrders = rawList
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .filter((item) => {
      // Defense-in-depth ownership check: if an order record explicitly includes a username,
      // ensure it matches the signed-in user's session username.
      const recordUser = String(item.username ?? item.Username ?? '').trim().toLowerCase()
      if (recordUser && sessionUsername && recordUser !== sessionUsername) {
        return false
      }
      return true
    })
    .map((item, idx) => {
      const rawId = resolveRecordField(item, [
        'orderReference',
        'OrderReference',
        'orderId',
        'OrderId',
        'id',
        'Id',
      ])
      const reference = rawId
        ? String(rawId).startsWith('ORD-')
          ? String(rawId)
          : `ORD-${rawId}`
        : `ORD-${idx + 1}`

      const rawPlan = String(resolveRecordField(item, ['plan', 'Plan']) || '').trim()
      const rawService = String(
        resolveRecordField(item, ['serviceType', 'ServiceType', 'service', 'Service']) || '',
      ).trim()
      const serviceType =
        rawService || (rawPlan ? `${rawPlan.toUpperCase()} Software Plan` : 'DSC Software Order')

      const status = String(resolveRecordField(item, ['status', 'Status']) || 'Pending').trim()
      const submittedAt =
        resolveRecordField(item, [
          'submittedAt',
          'SubmittedAt',
          'createdAt',
          'CreatedAt',
          'orderDate',
          'OrderDate',
        ]) || null

      const expiry =
        resolveRecordField(item, ['expiry', 'Expiry', 'expiryTime', 'ExpiryTime']) || null

      const lastUpdate =
        resolveRecordField(item, [
          'updatedAt',
          'UpdatedAt',
          'lastUpdate',
          'LastUpdate',
          'createdAt',
          'CreatedAt',
          'expiry',
          'Expiry',
          'expiryTime',
          'ExpiryTime',
        ]) || null

      const key = String(
        resolveRecordField(item, ['key', 'Key', 'licenseKey', 'LicenseKey']) || '',
      ).trim()
      const isKeyUsed = Boolean(item.isKeyUsed ?? item.IsKeyUsed)

      const rawQuotationStatus = String(
        resolveRecordField(item, ['quotationStatus', 'QuotationStatus']) || '',
      ).trim()
      const quotationStatus =
        rawQuotationStatus ||
        (rawService
          ? status.toLowerCase() === 'approved' || status.toLowerCase() === 'completed'
            ? 'Approved'
            : 'Under Scope Review'
          : key
            ? 'Direct License Issued'
            : 'Pending Verification')

      const scopeTemplate = String(
        resolveRecordField(item, ['scopeTemplate', 'ScopeTemplate', 'package', 'Package']) ||
          (rawPlan ? `${rawPlan.toUpperCase()} Plan` : 'Custom Scope'),
      ).trim()

      const deploymentPreference = String(
        resolveRecordField(item, ['deploymentPreference', 'DeploymentPreference']) || '',
      ).trim()

      const lowerStatus = status.toLowerCase()
      const isCompleted = lowerStatus === 'completed' || lowerStatus === 'approved'
      const isRejected =
        lowerStatus === 'rejected' ||
        lowerStatus === 'cancelled' ||
        lowerStatus === 'canceled' ||
        lowerStatus === 'quotation declined'

      const notes = String(
        resolveRecordField(item, ['notes', 'Notes', 'description', 'Description']) || '',
      ).trim()

      return {
        id: String(rawId ?? reference),
        reference,
        serviceType,
        plan: rawPlan || 'Standard',
        scopeTemplate,
        deploymentPreference,
        submittedAt,
        submissionDate: submittedAt,
        status,
        currentStatus: status,
        quotationStatus,
        lastUpdate,
        expiry,
        key,
        isKeyUsed,
        isCompleted,
        isRejected,
        notes,
      }
    })

  let activeOrders = 0
  let completedOrders = 0

  for (const order of normalizedOrders) {
    if (order.isCompleted) {
      completedOrders += 1
    } else if (!order.isRejected && order.status.toLowerCase() !== 'expired') {
      activeOrders += 1
    }
  }

  const recentActivity = normalizedOrders.slice(0, 5)

  return {
    orders: normalizedOrders,
    totalOrders: normalizedOrders.length,
    activeOrders,
    completedOrders,
    recentActivity,
  }
}

