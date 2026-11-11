import { useState } from 'react'
import { Navigate, NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  buildServiceInquiryUrl,
  buildServiceOrderUrl,
  getScopeTemplateById,
  serviceBlueprints,
  studioServiceCategories,
} from '../content/siteContent'
import {
  StudioCtaBanner,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function ServiceDetailPage({ serviceSlug }) {
  const blueprint = serviceBlueprints[serviceSlug]
  const seoRoute = blueprint ? SEO_ROUTES[blueprint.seoKey] : SEO_ROUTES.services

  usePageMeta(seoRoute)

  const [selectedScopeId, setSelectedScopeId] = useState(
    () => blueprint?.scopeTemplates?.[0]?.id || 'custom-scope',
  )
  const [selectedDeployment, setSelectedDeployment] = useState('with-deployment')

  if (!blueprint) {
    return <Navigate replace to="/services" />
  }

  const activeScopeTemplate =
    getScopeTemplateById(serviceSlug, selectedScopeId) || blueprint.scopeTemplates[0]
  const activeDeploymentOption =
    DEPLOYMENT_OPTIONS.find((opt) => opt.id === selectedDeployment) || DEPLOYMENT_OPTIONS[0]
  const inquiryUrl = buildServiceInquiryUrl({
    serviceSlug,
    scopeId: activeScopeTemplate?.id,
    deploymentOption: activeDeploymentOption.id,
  })
  const serviceOrderUrl = buildServiceOrderUrl({
    serviceSlug,
    scopeId: activeScopeTemplate?.id,
    deploymentOption: activeDeploymentOption.id,
  })

  const siblingServices = studioServiceCategories.filter((s) => s.slug !== serviceSlug)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow={blueprint.eyebrow}
        title={blueprint.title}
        description={blueprint.subtitle}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: blueprint.title },
        ]}
        actions={[
          { label: 'Start Service Order Request', to: serviceOrderUrl, variant: 'primary' },
          { label: 'Request a Custom Quotation', to: inquiryUrl, variant: 'secondary' },
        ]}
      />

      {/* 1. Service Overview & Introduction */}
      <section className="seo-section mt-36" aria-labelledby="service-overview-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="01 · Service Overview"
            title={`${blueprint.title} Overview`}
            description={blueprint.overview}
            badge="Quotation-Based Service"
          />
        </div>
      </section>

      {/* 2. What DSC Provides */}
      <section className="seo-section" aria-labelledby="what-dsc-provides-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="02 · What DSC Provides"
            title={`Capabilities Covered Under ${blueprint.title}`}
            description="Dark Skull Corporation provides the following specialized development capabilities within this discipline:"
            badge={`${blueprint.whatWeProvide.length} Capabilities`}
          />

          <div className="card-grid columns-3 mt-24">
            {blueprint.whatWeProvide.map((item, idx) => (
              <article key={item.title} className="info-card">
                <span className="card-badge">{`CAPABILITY 0${idx + 1}`}</span>
                <h3>{item.title}</h3>
                <p className="text-muted text-sm m-0">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Scope of Work & Potential Deliverables */}
      <section className="seo-section" aria-labelledby="service-scope-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="03 · Engineering Focus & Deliverables"
            title="Core Engineering & Focus Areas"
            description="Projects within this discipline are structured around three primary engineering pillars and a clear deliverables framework:"
          />

          <div className="card-grid columns-3 mt-24">
            {blueprint.scopeAreas.map((area, idx) => (
              <article key={area.title} className="info-card">
                <span className="card-badge">{`AREA 0${idx + 1}`}</span>
                <h3>{area.title}</h3>
                <p className="text-muted text-sm m-0">{area.description}</p>
              </article>
            ))}
          </div>

          <div className="studio-two-col-grid mt-24">
            <div className="studio-architecture-box">
              <span className="badge primary mb-8">Potential Scope &amp; Deliverables</span>
              <h3>Standard Project Deliverables</h3>
              <p className="text-muted text-sm mb-16">
                Specific deliverables are aligned with your chosen scope template and project requirements:
              </p>
              <ul className="product-features mb-0">
                {blueprint.deliverablesFramework.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="studio-architecture-box">
              <span className="badge primary mb-8">Verified Technology Stack</span>
              <h3>Relevant Technologies &amp; Standards</h3>
              <p className="text-muted text-sm mb-16">
                We build using proven, maintainable technologies suited to the target platform:
              </p>
              <div className="studio-tech-list">
                {blueprint.technologies.map((tech) => (
                  <div key={tech.name} className="studio-tech-item">
                    <span className="studio-tech-name">{tech.name}</span>
                    <span className="studio-card-meta-pill">{tech.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Development Process */}
      <section className="seo-section" aria-labelledby="development-process-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="04 · Development Process"
            title={`How We Execute ${blueprint.title} Projects`}
            description="Every engagement follows a structured four-stage studio workflow from initial requirement scoping to final release or handover:"
          />

          <div className="studio-process-grid mt-24">
            {blueprint.developmentProcess.map((stage) => (
              <article key={stage.step} className="info-card studio-process-card">
                <span className="card-badge">{`STAGE ${stage.step}`}</span>
                <h3>{stage.title}</h3>
                <p className="text-muted text-sm m-0">{stage.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Flexible Package / Scope Templates (No Fixed Public Prices) */}
      <section className="seo-section" aria-labelledby="scope-templates-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="05 · Package & Scope Templates"
            title="Select a Project Scope Template"
            description="Choose a baseline scope template below or select Custom Project Scope. Templates outline typical inclusions without fixed public prices — every project receives a custom quotation."
            badge="No Fixed Public Prices"
          />

          <div className="studio-scope-grid mt-24">
            {blueprint.scopeTemplates.map((template) => {
              const isSelected = activeScopeTemplate?.id === template.id
              return (
                <article
                  key={template.id}
                  className={`studio-scope-card ${isSelected ? 'is-selected' : ''}`}
                  data-testid={`scope-template-${template.id}`}
                >
                  <div>
                    <div className="studio-scope-card-top">
                      <span className="badge primary">{template.badge}</span>
                      <span className="studio-scope-pricing-tag">Custom Quotation</span>
                    </div>

                    <h3 className="studio-scope-title">{template.name}</h3>
                    <p className="studio-scope-ideal">
                      <strong>Ideal for:</strong> {template.idealFor}
                    </p>
                    <p className="text-muted text-sm mb-16">{template.summary}</p>

                    <div className="studio-scope-inclusions">
                      <span className="micro-label">TYPICAL INCLUSIONS</span>
                      <ul className="product-features mt-8 mb-16">
                        {template.inclusions.map((inc) => (
                          <li key={inc}>{inc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`button w-100 ${isSelected ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => setSelectedScopeId(template.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? 'Selected Scope Template ✓' : 'Select This Scope Template'}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. Deployment Options Selection (With Deployment vs Without Deployment) */}
      <section className="seo-section" aria-labelledby="deployment-selection-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="06 · Deployment Options"
            title="Choose Your Deployment Preference"
            description={blueprint.deploymentNote}
            badge="With or Without Deployment"
          />

          <div className="studio-two-col-grid mt-24">
            {DEPLOYMENT_OPTIONS.map((option) => {
              const isSelected = activeDeploymentOption.id === option.id
              const serviceSpecific = blueprint.deploymentOptions?.[option.id]
              return (
                <article
                  key={option.id}
                  className={`studio-deployment-card ${isSelected ? 'is-selected' : ''}`}
                  data-testid={`deployment-option-${option.id}`}
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

                    <span className="micro-label">WHAT THIS OPTION INCLUDES</span>
                    <ul className="product-features mt-8 mb-20">
                      {(serviceSpecific ? serviceSpecific.deliverables : option.inclusions).map(
                        (item) => (
                          <li key={item}>{item}</li>
                        ),
                      )}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`button w-100 ${isSelected ? 'button-primary' : 'button-secondary'}`}
                    onClick={() => setSelectedDeployment(option.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected
                      ? `Selected: ${option.label} ✓`
                      : `Choose ${option.label}`}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. Quotation Model Statement & Interactive Requirements Summary CTA */}
      <section className="seo-section" aria-labelledby="quotation-cta-heading">
        <div className="seo-container">
          <div className="studio-quotation-summary-box" data-testid="service-quotation-summary">
            <div className="studio-quotation-summary-main">
              <div className="studio-section-eyebrow-row">
                <span className="section-eyebrow">07 · Quotation Model &amp; Project Inquiry</span>
                <span className="badge primary">Quotation-Based Pricing</span>
              </div>
              <h2 id="quotation-cta-heading" className="studio-quotation-heading">
                Request a Custom Quotation for {blueprint.title}
              </h2>
              <p className="studio-quotation-statement" data-testid="service-quotation-statement">
                {QUOTATION_MODEL_STATEMENT}
              </p>

              <div className="studio-selected-config-strip">
                <div className="studio-selected-config-item">
                  <span className="micro-label">SELECTED SERVICE</span>
                  <strong>{blueprint.title}</strong>
                </div>
                <div className="studio-selected-config-item">
                  <span className="micro-label">SELECTED SCOPE TEMPLATE</span>
                  <strong data-testid="selected-scope-name">{activeScopeTemplate?.name}</strong>
                </div>
                <div className="studio-selected-config-item">
                  <span className="micro-label">DEPLOYMENT OPTION</span>
                  <strong data-testid="selected-deployment-label">
                    {activeDeploymentOption.label}
                  </strong>
                </div>
              </div>
            </div>

            <div className="studio-quotation-summary-actions">
              <NavLink
                to={serviceOrderUrl}
                className="button button-primary button-lg"
                data-testid="start-service-order-cta"
              >
                Start Service Order Request
              </NavLink>
              <NavLink
                to={inquiryUrl}
                className="button button-secondary button-lg"
                data-testid="proceed-quotation-cta"
              >
                Submit Project Requirements for Quotation
              </NavLink>
              <NavLink to="/services" className="button button-ghost">
                Compare All Services
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-links to other DSC services */}
      <section className="seo-section" aria-labelledby="other-services-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Related Capabilities"
            title="Other DSC Development Services"
            description="Explore additional development services provided by Dark Skull Corporation:"
          />
          <div className="card-grid columns-2 mt-20">
            {siblingServices.map((service) => (
              <article key={service.id} className="info-card studio-sibling-card">
                <div>
                  <span className="card-badge">{service.badge}</span>
                  <h3>{service.title}</h3>
                  <p className="text-muted text-sm mb-16">{service.description}</p>
                </div>
                <NavLink to={service.action.to} className="button button-secondary button-sm">
                  {service.action.label}
                </NavLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Connect with DSC"
        title={`Inquire About ${blueprint.title}`}
        description={QUOTATION_MODEL_STATEMENT}
        actions={[
          { label: 'Submit Project Requirements', to: inquiryUrl, variant: 'primary' },
          { label: 'All Services', to: '/services', variant: 'secondary' },
          { label: 'Explore Products', to: '/products', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
