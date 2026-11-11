import {
  DEPLOYMENT_OPTIONS,
  getDeploymentOptionById,
  getScopeTemplateById,
  getServiceBlueprint,
} from '../content/servicesData'

export const SERVICE_ORDERS_STORAGE_KEY = 'dscweb.user-service-orders.v1'
export const SERVICE_ORDER_DRAFT_STORAGE_KEY = 'dscweb.service-order-draft.v1'

/**
 * Official DSC Service Order Lifecycle Statuses (Phase 5 Section 6).
 */
export const ORDER_LIFECYCLE_STATUSES = [
  'Submitted',
  'Under Review',
  'Quotation Sent',
  'Awaiting Customer Approval',
  'Approved',
  'In Progress',
  'Testing / Review',
  'Completed',
  'Cancelled / Rejected',
]

export const SERVICE_PLATFORM_TARGETS = {
  websites: [
    'Responsive Web (Desktop, Tablet & Mobile)',
    'Single-Page Web Application (SPA / Portal)',
    'E-Commerce / Product Catalog Website',
    'Website Redesign & Modernization',
    'Custom Web Platform Target',
  ],
  'android-applications': [
    'Android Smartphones (Android 8.0+)',
    'Android Phones & Tablets',
    'Offline-First Android Utility Application',
    'Backend-Connected Android Application',
    'Custom Android Device Target',
  ],
  'game-development': [
    'Android Mobile Game (2D / 3D)',
    'Web / Browser Interactive Game',
    'Cross-Platform Release (Android & Web)',
    'Gameplay Systems / UI & HUD Module',
    'Custom Game Platform Target',
  ],
}

/**
 * Builds a structured URL to the dedicated Phase 5 Service Order Request page
 * carrying the selected service slug, scope template ID, and deployment option.
 */
export function buildServiceOrderUrl({
  serviceSlug = 'websites',
  scopeId = '',
  deploymentOption = 'with-deployment',
} = {}) {
  const params = new URLSearchParams()
  if (serviceSlug) params.set('service', serviceSlug)
  if (scopeId) params.set('scope', scopeId)
  if (deploymentOption) params.set('deployment', deploymentOption)
  const qs = params.toString()
  return qs ? `/services/request?${qs}` : '/services/request'
}

/**
 * Normalizes a quotation object attached to a service order.
 * Never fabricates or assumes a price if no quotation has been issued.
 */
export function normalizeQuotationObject(
  rawQuotation,
  fallbackDeployment = 'With Deployment',
  fallbackScope = 'Custom Project Scope',
) {
  if (!rawQuotation || typeof rawQuotation !== 'object') {
    return {
      hasIssuedQuotation: false,
      summary: '',
      proposedScope: fallbackScope,
      quotedAmount: null,
      currency: 'USD',
      estimatedTimeline: '',
      deploymentPreference: fallbackDeployment,
      adminNotes: '',
      customerResponseStatus: 'Awaiting DSC Scope Evaluation',
      customerNotes: '',
      respondedAt: null,
    }
  }

  const summary = String(
    rawQuotation.summary ?? rawQuotation.quotationSummary ?? rawQuotation.Summary ?? '',
  ).trim()
  const proposedScope = String(
    rawQuotation.proposedScope ??
      rawQuotation.ProposedScope ??
      rawQuotation.scope ??
      fallbackScope,
  ).trim()
  const rawAmount =
    rawQuotation.quotedAmount ??
    rawQuotation.QuotedAmount ??
    rawQuotation.amount ??
    rawQuotation.Amount ??
    null
  const quotedAmount =
    rawAmount !== null && rawAmount !== undefined && String(rawAmount).trim() !== ''
      ? String(rawAmount).trim()
      : null
  const currency = String(
    rawQuotation.currency ?? rawQuotation.Currency ?? 'USD',
  ).trim()
  const estimatedTimeline = String(
    rawQuotation.estimatedTimeline ??
      rawQuotation.EstimatedTimeline ??
      rawQuotation.timeline ??
      '',
  ).trim()
  const deploymentPreference = String(
    rawQuotation.deploymentPreference ??
      rawQuotation.DeploymentPreference ??
      rawQuotation.deploymentOption ??
      fallbackDeployment,
  ).trim()
  const adminNotes = String(
    rawQuotation.adminNotes ?? rawQuotation.AdminNotes ?? rawQuotation.notes ?? '',
  ).trim()
  const customerResponseStatus = String(
    rawQuotation.customerResponseStatus ??
      rawQuotation.CustomerResponseStatus ??
      (quotedAmount || summary ? 'Awaiting Customer Approval' : 'Awaiting DSC Scope Evaluation'),
  ).trim()
  const customerNotes = String(
    rawQuotation.customerNotes ?? rawQuotation.CustomerNotes ?? '',
  ).trim()
  const respondedAt = rawQuotation.respondedAt ?? rawQuotation.RespondedAt ?? null

  const hasIssuedQuotation = Boolean(quotedAmount || summary || adminNotes || estimatedTimeline)

  return {
    hasIssuedQuotation,
    summary,
    proposedScope,
    quotedAmount,
    currency,
    estimatedTimeline,
    deploymentPreference,
    adminNotes,
    customerResponseStatus,
    customerNotes,
    respondedAt,
  }
}

/**
 * Pure validation helper for Phase 5 Service Order Requirement Submissions.
 */
export function validateServiceOrderInput(input = {}) {
  const errors = {
    projectTitle: '',
    serviceSlug: '',
    scopeId: '',
    targetPlatform: '',
    deploymentOption: '',
    projectDescription: '',
    keyFeatures: '',
    contactName: '',
    contactEmail: '',
  }

  const projectTitle = String(input.projectTitle || '').trim()
  const serviceSlug = String(input.serviceSlug || '').trim()
  const scopeId = String(input.scopeId || '').trim()
  const targetPlatform = String(input.targetPlatform || '').trim()
  const deploymentOption = String(input.deploymentOption || '').trim()
  const projectDescription = String(input.projectDescription || '').trim()
  const keyFeatures = String(input.keyFeatures || '').trim()
  const referenceLinks = String(input.referenceLinks || '').trim()
  const preferredTimeline = String(input.preferredTimeline || '').trim()
  const budgetExpectations = String(input.budgetExpectations || '').trim()
  const contactName = String(input.contactName || '').trim()
  const contactEmail = String(input.contactEmail || '').trim().toLowerCase()
  const contactHandle = String(input.contactHandle || '').trim()

  const blueprint = getServiceBlueprint(serviceSlug)
  if (!blueprint) {
    errors.serviceSlug = 'Please select a valid DSC development service.'
  }

  if (!projectTitle) {
    errors.projectTitle = 'Project title is required.'
  } else if (projectTitle.length < 3) {
    errors.projectTitle = 'Project title must be at least 3 characters.'
  }

  if (!scopeId) {
    errors.scopeId = 'Please select a scope template or Custom Project Scope.'
  }

  if (!targetPlatform) {
    errors.targetPlatform = 'Please specify the target platform.'
  }

  const validDeployment = DEPLOYMENT_OPTIONS.some((opt) => opt.id === deploymentOption)
  if (!validDeployment) {
    errors.deploymentOption = 'Please choose With Deployment or Without Deployment.'
  }

  if (!projectDescription) {
    errors.projectDescription = 'Project description is required.'
  } else if (projectDescription.length < 15) {
    errors.projectDescription =
      'Please provide a clear project description (at least 15 characters).'
  }

  if (!keyFeatures) {
    errors.keyFeatures = 'Please list the key features needed for your project.'
  } else if (keyFeatures.length < 5) {
    errors.keyFeatures = 'Please describe at least one key feature (minimum 5 characters).'
  }

  if (!contactName) {
    errors.contactName = 'Contact name is required.'
  } else if (contactName.length < 2) {
    errors.contactName = 'Contact name must be at least 2 characters.'
  }

  if (!contactEmail) {
    errors.contactEmail = 'Contact email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    errors.contactEmail = 'Please enter a valid contact email address.'
  }

  const isValid = !Object.values(errors).some(Boolean)

  const resolvedScope = blueprint
    ? getScopeTemplateById(blueprint.slug, scopeId)
    : null
  const resolvedDeployment = getDeploymentOptionById(deploymentOption)

  return {
    isValid,
    errors,
    cleaned: {
      projectTitle,
      serviceSlug: blueprint ? blueprint.slug : serviceSlug,
      serviceType: blueprint ? blueprint.title : 'DSC Development Service',
      scopeId: resolvedScope ? resolvedScope.id : scopeId || 'custom-scope',
      scopeTemplate: resolvedScope ? resolvedScope.name : 'Custom Project Scope',
      targetPlatform,
      deploymentOption: resolvedDeployment.id,
      deploymentPreference: resolvedDeployment.label,
      projectDescription,
      keyFeatures,
      referenceLinks,
      preferredTimeline,
      budgetExpectations,
      contactName,
      contactEmail,
      contactHandle,
    },
  }
}

/**
 * Constructs a canonical user-owned Service Order record from validated input.
 */
export function createServiceOrderRecord(cleanedInput, session, remoteResponse = null) {
  const nowIso = new Date().toISOString()
  const username = String(session?.username || '').trim().toLowerCase()
  const suffix = String(Date.now()).slice(-6)
  const rawRef =
    remoteResponse?.orderReference ||
    remoteResponse?.reference ||
    remoteResponse?.orderId ||
    remoteResponse?.id ||
    `ORD-SVC-${suffix}`
  const reference = String(rawRef).startsWith('ORD-') ? String(rawRef) : `ORD-${rawRef}`

  const status = String(remoteResponse?.status || 'Submitted').trim()
  const quotation = normalizeQuotationObject(
    remoteResponse?.quotation,
    cleanedInput.deploymentPreference,
    cleanedInput.scopeTemplate,
  )
  const quotationStatus = String(
    remoteResponse?.quotationStatus ||
      (quotation.hasIssuedQuotation
        ? quotation.customerResponseStatus
        : 'Pending Scope Review'),
  ).trim()

  return {
    id: String(remoteResponse?.id || reference),
    orderReference: reference,
    reference,
    isServiceOrder: true,
    username,
    projectTitle: cleanedInput.projectTitle,
    serviceSlug: cleanedInput.serviceSlug,
    serviceType: cleanedInput.serviceType,
    plan: cleanedInput.serviceType,
    scopeId: cleanedInput.scopeId,
    scopeTemplate: cleanedInput.scopeTemplate,
    targetPlatform: cleanedInput.targetPlatform,
    deploymentOption: cleanedInput.deploymentOption,
    deploymentPreference: cleanedInput.deploymentPreference,
    projectDescription: cleanedInput.projectDescription,
    keyFeatures: cleanedInput.keyFeatures,
    referenceLinks: cleanedInput.referenceLinks || '',
    preferredTimeline: cleanedInput.preferredTimeline || '',
    budgetExpectations: cleanedInput.budgetExpectations || '',
    contactName: cleanedInput.contactName,
    contactEmail: cleanedInput.contactEmail,
    contactHandle: cleanedInput.contactHandle || '',
    status,
    currentStatus: status,
    quotationStatus,
    quotation,
    submittedAt: remoteResponse?.submittedAt || remoteResponse?.createdAt || nowIso,
    updatedAt: remoteResponse?.updatedAt || nowIso,
  }
}

/**
 * Applies a customer quotation response action ('approve' | 'request_changes' | 'decline')
 * to a service order and returns the updated order record.
 */
export function applyCustomerQuotationAction(order, action, customerNotes = '') {
  if (!order || typeof order !== 'object') {
    throw new Error('Invalid order record.')
  }

  const normalizedAction = String(action || '').trim().toLowerCase()
  const cleanNotes = String(customerNotes || '').trim()
  const nowIso = new Date().toISOString()

  const baseQuotation = normalizeQuotationObject(
    order.quotation,
    order.deploymentPreference || 'With Deployment',
    order.scopeTemplate || 'Custom Project Scope',
  )

  if (normalizedAction === 'approve') {
    return {
      ...order,
      status: 'Approved',
      currentStatus: 'Approved',
      quotationStatus: 'Quotation Approved by Client',
      updatedAt: nowIso,
      lastUpdate: nowIso,
      quotation: {
        ...baseQuotation,
        customerResponseStatus: 'Approved by Client',
        customerNotes: cleanNotes || baseQuotation.customerNotes,
        respondedAt: nowIso,
      },
    }
  }

  if (normalizedAction === 'request_changes') {
    if (!cleanNotes) {
      throw new Error('Please provide notes describing the requested scope or quotation changes.')
    }
    return {
      ...order,
      status: 'Under Review',
      currentStatus: 'Under Review',
      quotationStatus: 'Changes / Clarification Requested',
      updatedAt: nowIso,
      lastUpdate: nowIso,
      quotation: {
        ...baseQuotation,
        customerResponseStatus: 'Changes Requested',
        customerNotes: cleanNotes,
        respondedAt: nowIso,
      },
    }
  }

  if (normalizedAction === 'decline' || normalizedAction === 'cancel') {
    return {
      ...order,
      status: 'Cancelled / Rejected',
      currentStatus: 'Cancelled / Rejected',
      quotationStatus: 'Cancelled / Declined by Client',
      updatedAt: nowIso,
      lastUpdate: nowIso,
      quotation: {
        ...baseQuotation,
        customerResponseStatus: 'Declined by Client',
        customerNotes: cleanNotes || baseQuotation.customerNotes,
        respondedAt: nowIso,
      },
    }
  }

  throw new Error(`Unsupported quotation action: ${action}`)
}

function readAllStoredServiceOrders() {
  try {
    const raw = window.localStorage.getItem(SERVICE_ORDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAllStoredServiceOrders(orders) {
  try {
    window.localStorage.setItem(SERVICE_ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Loads stored service orders strictly belonging to the specified username.
 */
export function loadUserServiceOrders(username) {
  const cleanUser = String(username || '').trim().toLowerCase()
  if (!cleanUser) return []
  return readAllStoredServiceOrders().filter(
    (item) =>
      item &&
      typeof item === 'object' &&
      String(item.username || '').trim().toLowerCase() === cleanUser,
  )
}

/**
 * Persists a newly created or updated service order for the authenticated user.
 */
export function saveUserServiceOrder(username, orderRecord) {
  const cleanUser = String(username || '').trim().toLowerCase()
  if (!cleanUser || !orderRecord) return null

  const existing = readAllStoredServiceOrders()
  const recordWithOwner = {
    ...orderRecord,
    username: cleanUser,
  }

  const filtered = existing.filter(
    (item) =>
      !(
        String(item?.username || '').trim().toLowerCase() === cleanUser &&
        (item?.id === recordWithOwner.id || item?.reference === recordWithOwner.reference)
      ),
  )

  const updated = [recordWithOwner, ...filtered]
  writeAllStoredServiceOrders(updated)
  return recordWithOwner
}

/**
 * Updates a stored user service order with a customer quotation response.
 */
export function updateUserServiceOrderQuotation(
  username,
  orderIdOrReference,
  action,
  customerNotes = '',
) {
  const cleanUser = String(username || '').trim().toLowerCase()
  if (!cleanUser || !orderIdOrReference) return null

  const allOrders = readAllStoredServiceOrders()
  let updatedRecord = null

  const nextOrders = allOrders.map((item) => {
    const isOwner = String(item?.username || '').trim().toLowerCase() === cleanUser
    const isTarget =
      String(item?.id) === String(orderIdOrReference) ||
      String(item?.reference) === String(orderIdOrReference) ||
      String(item?.orderReference) === String(orderIdOrReference)

    if (isOwner && isTarget) {
      updatedRecord = applyCustomerQuotationAction(item, action, customerNotes)
      return updatedRecord
    }
    return item
  })

  if (updatedRecord) {
    writeAllStoredServiceOrders(nextOrders)
  }
  return updatedRecord
}

/**
 * Draft persistence in sessionStorage so unauthenticated visitors who click
 * "Log In" or "Create Account" from the order form do not lose their typed brief.
 */
export function saveServiceOrderDraft(draft) {
  try {
    window.sessionStorage.setItem(SERVICE_ORDER_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore storage errors
  }
}

export function loadServiceOrderDraft() {
  try {
    const raw = window.sessionStorage.getItem(SERVICE_ORDER_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function clearServiceOrderDraft() {
  try {
    window.sessionStorage.removeItem(SERVICE_ORDER_DRAFT_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}
