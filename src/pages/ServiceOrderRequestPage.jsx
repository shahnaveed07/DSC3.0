import { useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  getDeploymentOptionById,
  getScopeTemplateById,
  getServiceBlueprint,
  studioServiceCategories,
} from '../content/siteContent'
import {
  SERVICE_PLATFORM_TARGETS,
  buildServiceOrderUrl,
  clearServiceOrderDraft,
  createServiceOrderRecord,
  loadServiceOrderDraft,
  saveServiceOrderDraft,
  saveUserServiceOrder,
  validateServiceOrderInput,
} from '../utils/serviceOrders'
import { ApiError, isAuthError, submitServiceOrder } from '../services/dscApi'
import {
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function ServiceOrderRequestPage({ session }) {
  usePageMeta(SEO_ROUTES.serviceOrderRequest)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryService = searchParams.get('service') || ''
  const queryScope = searchParams.get('scope') || ''
  const queryDeployment = searchParams.get('deployment') || ''

  const savedDraft = loadServiceOrderDraft()
  const initialServiceSlug =
    getServiceBlueprint(queryService)?.slug ||
    getServiceBlueprint(savedDraft?.serviceSlug)?.slug ||
    'websites'
  const initialBlueprint = getServiceBlueprint(initialServiceSlug)
  const initialScope =
    getScopeTemplateById(initialServiceSlug, queryScope || savedDraft?.scopeId) ||
    initialBlueprint.scopeTemplates[0]
  const initialDeployment = getDeploymentOptionById(
    queryDeployment || savedDraft?.deploymentOption || 'with-deployment',
  )
  const initialPlatforms = SERVICE_PLATFORM_TARGETS[initialServiceSlug] || []

  const [form, setForm] = useState(() => ({
    serviceSlug: initialServiceSlug,
    scopeId: initialScope ? initialScope.id : 'custom-scope',
    deploymentOption: initialDeployment.id,
    targetPlatform: savedDraft?.targetPlatform || initialPlatforms[0] || '',
    projectTitle: savedDraft?.projectTitle || '',
    projectDescription: savedDraft?.projectDescription || '',
    keyFeatures: savedDraft?.keyFeatures || '',
    referenceLinks: savedDraft?.referenceLinks || '',
    preferredTimeline: savedDraft?.preferredTimeline || '',
    budgetExpectations: savedDraft?.budgetExpectations || '',
    contactName:
      savedDraft?.contactName || session?.fullName || session?.username || '',
    contactEmail: savedDraft?.contactEmail || session?.email || '',
    contactHandle: savedDraft?.contactHandle || session?.discordId || '',
  }))

  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [authPromptVisible, setAuthPromptVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)

  const activeBlueprint =
    getServiceBlueprint(form.serviceSlug) || getServiceBlueprint('websites')
  const activeScope =
    getScopeTemplateById(activeBlueprint.slug, form.scopeId) ||
    activeBlueprint.scopeTemplates[0]
  const activeDeployment = getDeploymentOptionById(form.deploymentOption)
  const availablePlatforms =
    SERVICE_PLATFORM_TARGETS[activeBlueprint.slug] || SERVICE_PLATFORM_TARGETS.websites

  const isAuthenticatedUser = Boolean(session && session.role === 'User')

  const returnRedirectPath = buildServiceOrderUrl({
    serviceSlug: activeBlueprint.slug,
    scopeId: activeScope?.id,
    deploymentOption: activeDeployment.id,
  })
  const loginRedirectUrl = `/pages/ulogin?redirect=${encodeURIComponent(returnRedirectPath)}`
  const registerRedirectUrl = `/register?redirect=${encodeURIComponent(returnRedirectPath)}`

  function updateForm(partial) {
    setForm((current) => {
      const next = { ...current, ...partial }
      saveServiceOrderDraft(next)
      return next
    })
    setSubmitError('')
  }

  function handleServiceSelect(nextSlug) {
    const bp = getServiceBlueprint(nextSlug)
    if (!bp) return
    const defaultScope = bp.scopeTemplates[0]?.id || 'custom-scope'
    const defaultPlatform = (SERVICE_PLATFORM_TARGETS[bp.slug] || [])[0] || ''
    updateForm({
      serviceSlug: bp.slug,
      scopeId: defaultScope,
      targetPlatform: defaultPlatform,
    })
  }

  function handleFieldChange(field, value) {
    updateForm({ [field]: value })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handlePersistDraftAndRedirect(targetUrl) {
    saveServiceOrderDraft(form)
    navigate(targetUrl)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    setSubmitError('')

    if (!isAuthenticatedUser) {
      saveServiceOrderDraft(form)
      setAuthPromptVisible(true)
      setSubmitError(
        'A DSC client account is required to submit a service order and track your quotation. Your project brief has been saved — log in or create an account below to complete submission.',
      )
      return
    }

    const validation = validateServiceOrderInput(form)
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      setSubmitError('Please review and complete the highlighted requirement fields.')
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    try {
      let remotePayload = null
      try {
        remotePayload = await submitServiceOrder(session.token, {
          ...validation.cleaned,
          username: session.username,
        })
      } catch (apiIssue) {
        if (isAuthError(apiIssue)) {
          throw apiIssue
        }
        // If the backend returns a 400 validation error, surface it directly
        if (apiIssue instanceof ApiError && apiIssue.status === 400) {
          throw apiIssue
        }
        // Otherwise proceed to record the authenticated user's service order in their isolated account store
        remotePayload = null
      }

      const orderRecord = createServiceOrderRecord(
        validation.cleaned,
        session,
        remotePayload,
      )
      saveUserServiceOrder(session.username, orderRecord)
      clearServiceOrderDraft()
      setCreatedOrder(orderRecord)
    } catch (err) {
      setSubmitError(
        err?.message || 'Unable to submit your service order request. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (createdOrder) {
    return (
      <StudioPageContainer>
        <section className="seo-section mt-36">
          <div className="seo-container">
            <div className="studio-quotation-summary-box" data-testid="service-order-confirmation">
              <div>
                <div className="studio-section-eyebrow-row">
                  <span className="badge good">Order Submitted</span>
                  <span className="badge primary" data-testid="confirmed-order-reference">
                    {createdOrder.reference}
                  </span>
                </div>
                <h1 className="studio-quotation-heading mt-12">
                  Project Requirements Submitted for Quotation
                </h1>
                <p className="text-muted text-base mb-16">
                  Thank you, <strong>{createdOrder.contactName}</strong>. Your requirement brief for{' '}
                  <strong>{createdOrder.projectTitle}</strong> has been linked to your DSC account (
                  <strong>{String(session?.username || '').toUpperCase()}</strong>).
                </p>

                <div className="studio-selected-config-strip">
                  <div className="studio-selected-config-item">
                    <span className="micro-label">ORDER REFERENCE</span>
                    <strong>{createdOrder.reference}</strong>
                  </div>
                  <div className="studio-selected-config-item">
                    <span className="micro-label">SERVICE &amp; SCOPE</span>
                    <strong>
                      {createdOrder.serviceType} · {createdOrder.scopeTemplate}
                    </strong>
                  </div>
                  <div className="studio-selected-config-item">
                    <span className="micro-label">CURRENT STATUS</span>
                    <strong data-testid="confirmed-order-status">
                      {createdOrder.status} ({createdOrder.quotationStatus})
                    </strong>
                  </div>
                </div>

                <p className="text-muted text-sm mt-16 mb-0">
                  {QUOTATION_MODEL_STATEMENT}
                </p>
              </div>

              <div className="studio-quotation-summary-actions">
                <Link
                  to={`/pages/udash?tab=orders&order=${encodeURIComponent(createdOrder.id)}`}
                  className="button button-primary button-lg"
                  data-testid="view-order-in-dashboard-btn"
                >
                  Track Order &amp; Quotation in Dashboard
                </Link>
                <NavLink to="/services" className="button button-secondary">
                  Back to Services
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </StudioPageContainer>
    )
  }

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Dark Skull Corporation · Service Order & Quotation Workflow"
        title="Submit Project Requirements for Quotation"
        description={QUOTATION_MODEL_STATEMENT}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: 'Submit Project Requirements' },
        ]}
        actions={[
          { label: 'Compare All Services', to: '/services', variant: 'secondary' },
          ...(isAuthenticatedUser
            ? [{ label: 'My Orders Dashboard', to: '/pages/udash?tab=orders', variant: 'ghost' }]
            : [{ label: 'Sign In to DSC Account', to: loginRedirectUrl, variant: 'primary' }]),
        ]}
      />

      {/* Authentication Notice Banner for Guests */}
      {!isAuthenticatedUser ? (
        <section className="seo-section mt-24" aria-labelledby="auth-gate-heading">
          <div className="seo-container">
            <div
              className="studio-prefill-notice"
              data-testid="service-order-auth-banner"
            >
              <div className="studio-prefill-notice-top">
                <div>
                  <span className="badge warning mb-8">DSC Account Required for Submission</span>
                  <h2 id="auth-gate-heading" className="m-0 text-lg">
                    Sign In or Create a DSC Account to Submit &amp; Track Your Quotation
                  </h2>
                  <p className="text-muted text-sm mt-8 mb-0">
                    You can configure your service category, scope template, deployment option, and project brief below. Your selections are automatically saved while you sign in or register.
                  </p>
                </div>
                <div className="flex gap-10 flex-wrap">
                  <button
                    type="button"
                    className="button button-primary button-sm"
                    data-testid="auth-banner-login-btn"
                    onClick={() => handlePersistDraftAndRedirect(loginRedirectUrl)}
                  >
                    Log In to Continue
                  </button>
                  <button
                    type="button"
                    className="button button-secondary button-sm"
                    data-testid="auth-banner-register-btn"
                    onClick={() => handlePersistDraftAndRedirect(registerRedirectUrl)}
                  >
                    Create DSC Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Step 1: Select Service Category */}
      <section className="seo-section mt-24" aria-labelledby="step-service-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Step 01 · Service Discipline"
            title="1. Select Your DSC Service Category"
            description="Choose whether you are requesting Website Development, Android Application Development, or Game Development:"
          />

          <div className="studio-three-col-grid mt-20">
            {studioServiceCategories.map((service) => {
              const isSelected = activeBlueprint.slug === service.slug
              return (
                <article
                  key={service.slug}
                  className={`studio-scope-card ${isSelected ? 'is-selected' : ''}`}
                  data-testid={`order-service-card-${service.slug}`}
                >
                  <div>
                    <div className="studio-scope-card-top">
                      <span className="badge primary">{service.badge}</span>
                      <span className="studio-scope-pricing-tag">Quotation-Based</span>
                    </div>
                    <h3 className="studio-scope-title">{service.title}</h3>
                    <p className="text-muted text-sm mb-16">{service.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`button w-100 ${isSelected ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => handleServiceSelect(service.slug)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? `Selected: ${service.title} ✓` : `Select ${service.title}`}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Step 2: Select Scope Template or Custom Scope */}
      <section className="seo-section" aria-labelledby="step-scope-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Step 02 · Scope Template"
            title={`2. Choose a ${activeBlueprint.title} Scope Template`}
            description="Select a baseline scope template or Custom Project Scope. No fixed public prices are assumed — DSC evaluates your requirements to issue a custom quotation."
            badge="No Fixed Public Prices"
          />

          <div className="studio-scope-grid mt-20">
            {activeBlueprint.scopeTemplates.map((template) => {
              const isSelected = activeScope?.id === template.id
              return (
                <article
                  key={template.id}
                  className={`studio-scope-card ${isSelected ? 'is-selected' : ''}`}
                  data-testid={`order-scope-card-${template.id}`}
                >
                  <div>
                    <div className="studio-scope-card-top">
                      <span className="badge primary">{template.badge}</span>
                      <span className="studio-scope-pricing-tag">Custom Quotation</span>
                    </div>
                    <h3 className="studio-scope-title">{template.name}</h3>
                    <p className="text-muted text-sm mb-12">{template.summary}</p>
                    <ul className="product-features mb-16">
                      {template.inclusions.map((inc) => (
                        <li key={inc}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className={`button w-100 ${isSelected ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => handleFieldChange('scopeId', template.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? 'Selected Scope ✓' : 'Use This Scope Template'}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Step 3: Select Deployment Option */}
      <section className="seo-section" aria-labelledby="step-deployment-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Step 03 · Deployment Preference"
            title="3. Select With Deployment or Without Deployment"
            description={activeBlueprint.deploymentNote}
          />

          <div className="studio-two-col-grid mt-20">
            {DEPLOYMENT_OPTIONS.map((option) => {
              const isSelected = activeDeployment.id === option.id
              const serviceSpecific = activeBlueprint.deploymentOptions?.[option.id]
              return (
                <article
                  key={option.id}
                  className={`studio-deployment-card ${isSelected ? 'is-selected' : ''}`}
                  data-testid={`order-deployment-card-${option.id}`}
                >
                  <div>
                    <div className="studio-scope-card-top">
                      <span className="badge primary">{option.badge}</span>
                      <span className="studio-scope-pricing-tag">{option.label}</span>
                    </div>
                    <h3 className="studio-scope-title">
                      {serviceSpecific ? serviceSpecific.title : option.label}
                    </h3>
                    <p className="text-muted text-sm mb-16">
                      {serviceSpecific ? serviceSpecific.description : option.shortSummary}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`button w-100 ${isSelected ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => handleFieldChange('deploymentOption', option.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? `Selected: ${option.label} ✓` : `Choose ${option.label}`}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Step 4: Project Requirements & Contact Form */}
      <section className="seo-section" aria-labelledby="step-requirements-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Step 04 · Project Specification"
            title="4. Complete Your Project Requirements"
            description="Provide your project title, target platform, functional description, key features, and optional timeline or budget notes so DSC can prepare an accurate quotation."
          />

          <div className="studio-selected-config-strip mt-20 mb-24">
            <div className="studio-selected-config-item">
              <span className="micro-label">SELECTED SERVICE</span>
              <strong data-testid="summary-service-title">{activeBlueprint.title}</strong>
            </div>
            <div className="studio-selected-config-item">
              <span className="micro-label">SELECTED SCOPE</span>
              <strong data-testid="summary-scope-name">{activeScope?.name}</strong>
            </div>
            <div className="studio-selected-config-item">
              <span className="micro-label">DEPLOYMENT OPTION</span>
              <strong data-testid="summary-deployment-label">{activeDeployment.label}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <div className="form-grid-2">
              <label className="field" htmlFor="order-project-title">
                <span className="micro-label">PROJECT TITLE *</span>
                <input
                  id="order-project-title"
                  type="text"
                  required
                  placeholder="e.g. Corporate Web Portal, Inventory Android App, 2D Puzzle Game"
                  value={form.projectTitle}
                  onChange={(e) => handleFieldChange('projectTitle', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.projectTitle)}
                />
                {fieldErrors.projectTitle ? (
                  <span className="field-error-text" role="alert">
                    {fieldErrors.projectTitle}
                  </span>
                ) : null}
              </label>

              <label className="field" htmlFor="order-target-platform">
                <span className="micro-label">PLATFORM / TARGET *</span>
                <select
                  id="order-target-platform"
                  className="input-field"
                  value={form.targetPlatform}
                  onChange={(e) => handleFieldChange('targetPlatform', e.target.value)}
                >
                  {availablePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                {fieldErrors.targetPlatform ? (
                  <span className="field-error-text" role="alert">
                    {fieldErrors.targetPlatform}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="field mt-16" htmlFor="order-project-description">
              <span className="micro-label">PROJECT DESCRIPTION *</span>
              <textarea
                id="order-project-description"
                rows={4}
                required
                placeholder="Describe what you want to build, your target users, and the primary goal of this project..."
                value={form.projectDescription}
                onChange={(e) => handleFieldChange('projectDescription', e.target.value)}
                aria-invalid={Boolean(fieldErrors.projectDescription)}
              />
              {fieldErrors.projectDescription ? (
                <span className="field-error-text" role="alert">
                  {fieldErrors.projectDescription}
                </span>
              ) : null}
            </label>

            <label className="field mt-16" htmlFor="order-key-features">
              <span className="micro-label">KEY FEATURES NEEDED *</span>
              <textarea
                id="order-key-features"
                rows={4}
                required
                placeholder="List the essential screens, modules, gameplay mechanics, integrations, or workflows needed..."
                value={form.keyFeatures}
                onChange={(e) => handleFieldChange('keyFeatures', e.target.value)}
                aria-invalid={Boolean(fieldErrors.keyFeatures)}
              />
              {fieldErrors.keyFeatures ? (
                <span className="field-error-text" role="alert">
                  {fieldErrors.keyFeatures}
                </span>
              ) : null}
            </label>

            <div className="form-grid-2 mt-16">
              <label className="field" htmlFor="order-reference-links">
                <span className="micro-label">
                  REFERENCE WEBSITES / APPS / GAMES (OPTIONAL)
                </span>
                <input
                  id="order-reference-links"
                  type="text"
                  placeholder="URLs or names of reference apps, websites, or games"
                  value={form.referenceLinks}
                  onChange={(e) => handleFieldChange('referenceLinks', e.target.value)}
                />
              </label>

              <label className="field" htmlFor="order-preferred-timeline">
                <span className="micro-label">PREFERRED TIMELINE (OPTIONAL)</span>
                <input
                  id="order-preferred-timeline"
                  type="text"
                  placeholder="e.g. Flexible, 2–4 weeks, Target launch month"
                  value={form.preferredTimeline}
                  onChange={(e) => handleFieldChange('preferredTimeline', e.target.value)}
                />
              </label>
            </div>

            <label className="field mt-16" htmlFor="order-budget-expectations">
              <span className="micro-label">BUDGET NOTE OR EXPECTATIONS (OPTIONAL)</span>
              <input
                id="order-budget-expectations"
                type="text"
                placeholder="Optional budget range, currency preference, or milestone notes"
                value={form.budgetExpectations}
                onChange={(e) => handleFieldChange('budgetExpectations', e.target.value)}
              />
            </label>

            <div className="form-grid-2 mt-16">
              <label className="field" htmlFor="order-contact-name">
                <span className="micro-label">CONTACT NAME *</span>
                <input
                  id="order-contact-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={form.contactName}
                  onChange={(e) => handleFieldChange('contactName', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.contactName)}
                />
                {fieldErrors.contactName ? (
                  <span className="field-error-text" role="alert">
                    {fieldErrors.contactName}
                  </span>
                ) : null}
              </label>

              <label className="field" htmlFor="order-contact-email">
                <span className="micro-label">CONTACT EMAIL ADDRESS *</span>
                <input
                  id="order-contact-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.contactEmail}
                  onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.contactEmail)}
                />
                {fieldErrors.contactEmail ? (
                  <span className="field-error-text" role="alert">
                    {fieldErrors.contactEmail}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="field mt-16 mb-24" htmlFor="order-contact-handle">
              <span className="micro-label">
                DISCORD HANDLE / SECONDARY CONTACT (OPTIONAL)
              </span>
              <input
                id="order-contact-handle"
                type="text"
                placeholder="e.g. Discord username or phone/WhatsApp number"
                value={form.contactHandle}
                onChange={(e) => handleFieldChange('contactHandle', e.target.value)}
              />
            </label>

            {submitError ? (
              <div className="form-error mb-16" role="alert">
                <p className="m-0">{submitError}</p>
                {authPromptVisible && !isAuthenticatedUser ? (
                  <div className="flex gap-10 flex-wrap mt-12">
                    <button
                      type="button"
                      className="button button-primary button-sm"
                      onClick={() => handlePersistDraftAndRedirect(loginRedirectUrl)}
                    >
                      Log In to Submit Order
                    </button>
                    <button
                      type="button"
                      className="button button-secondary button-sm"
                      onClick={() => handlePersistDraftAndRedirect(registerRedirectUrl)}
                    >
                      Create DSC Account
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-12 flex-wrap">
              <button
                type="submit"
                className="button button-primary button-lg"
                disabled={submitting}
                data-testid="submit-service-order-btn"
              >
                {submitting
                  ? 'Submitting Service Order...'
                  : 'Submit Project Requirements for Quotation'}
              </button>

              {!isAuthenticatedUser ? (
                <button
                  type="button"
                  className="button button-secondary button-lg"
                  onClick={() => handlePersistDraftAndRedirect(loginRedirectUrl)}
                >
                  Sign In First (Saves Draft)
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </StudioPageContainer>
  )
}
