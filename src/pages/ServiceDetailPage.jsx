import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  buildServiceInquiryUrl,
  getServiceBlueprint,
} from '../content/siteContent'
import { SEO_ROUTES } from '../content/seoConfig'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { StudioPageHeader } from '../components/ui/StudioComponents'

export function ServiceDetailPage({ serviceSlug }) {
  const blueprint = getServiceBlueprint(serviceSlug) || getServiceBlueprint('websites')
  const seoKey = blueprint.seoKey || 'services'
  usePageMetadata(SEO_ROUTES[seoKey])

  const [selectedScopeId, setSelectedScopeId] = useState(
    blueprint.scopeTemplates[0]?.id || '',
  )
  const [selectedDeployment, setSelectedDeployment] = useState('with-deployment')

  const activeScope =
    blueprint.scopeTemplates.find((tpl) => tpl.id === selectedScopeId) ||
    blueprint.scopeTemplates[0]

  const activeDeploymentOption =
    DEPLOYMENT_OPTIONS.find((opt) => opt.id === selectedDeployment) ||
    DEPLOYMENT_OPTIONS[0]

  const inquiryUrl = buildServiceInquiryUrl({
    serviceSlug: blueprint.slug,
    scopeId: activeScope?.id,
    deploymentOption: activeDeploymentOption.id,
  })

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow={blueprint.eyebrow}
        title={blueprint.title}
        subtitle={blueprint.subtitle}
        actions={[
          {
            label: 'Request Custom Quotation',
            to: inquiryUrl,
            variant: 'primary',
          },
          {
            label: 'All Services',
            to: '/services',
            variant: 'secondary',
          },
          {
            label: blueprint.relatedPortfolioLabel || 'Explore Portfolio',
            to: blueprint.relatedPortfolioLink || '/products',
            variant: 'ghost',
          },
        ]}
      />

      {/* Section 1: Capabilities & Core Engineering */}
      <section className="studio-section" aria-label="What We Provide and Engineering Focus">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CAPABILITIES &amp; DELIVERABLES</div>
            <h2>Core Engineering &amp; Focus Areas</h2>
          </div>
        </div>

        <div className="studio-grid-3">
          {blueprint.whatWeProvide.map((item, idx) => (
            <article key={item.title || idx} className="info-card studio-category-card">
              <div className="studio-card-top">
                <span className="card-label">CAPABILITY 0{idx + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p className="studio-card-desc">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="studio-grid-2 mt-18">
          <div className="info-card">
            <div className="card-label">ENGINEERING SCOPE</div>
            <h3>Key Scope Areas</h3>
            <ul className="feature-list mt-12">
              {blueprint.scopeAreas.map((area) => (
                <li key={area.title}>
                  <strong>{area.title}:</strong> {area.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="info-card">
            <div className="card-label">DELIVERABLES &amp; STACK</div>
            <h3>Deliverables &amp; Technologies</h3>
            <ul className="feature-list mt-12">
              {blueprint.deliverablesFramework.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="project-tech-stack mt-16">
              {blueprint.technologies.map((tech) => {
                const techName = typeof tech === 'string' ? tech : tech.name
                return (
                  <span key={techName} className="tech-chip">
                    {techName}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Project Scope Templates */}
      <section className="studio-section" aria-label="Project Scope Selection">
        <div className="section-heading">
          <div>
            <div className="eyebrow">STEP 1 · SELECT PROJECT SCOPE</div>
            <h2>Project Scope Options</h2>
          </div>
          <p className="section-subcopy">
            Choose the scope template closest to your requirements to pre-fill your quotation
            request.
          </p>
        </div>

        <div className="service-scope-grid">
          {blueprint.scopeTemplates.map((template) => {
            const isSelected = activeScope?.id === template.id
            const templateItems = template.inclusions || template.deliverables || []
            return (
              <article
                key={template.id}
                className={`info-card service-scope-card${isSelected ? ' is-selected' : ''}`}
                data-testid={`scope-template-${template.id}`}
              >
                <div className="studio-card-top">
                  <span className="card-label">SCOPE TEMPLATE</span>
                  <span className="status-pill">{template.badge}</span>
                </div>
                <h3>{template.name}</h3>
                <p className="studio-card-desc">{template.summary}</p>
                <p className="service-ideal-for">
                  <strong>Ideal For:</strong> {template.idealFor}
                </p>
                <ul className="feature-list studio-feature-list">
                  {templateItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="card-actions studio-card-actions">
                  <button
                    type="button"
                    className={`button ${isSelected ? 'primary' : 'secondary'} full-width`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedScopeId(template.id)}
                  >
                    {isSelected ? 'Selected Scope Template ✓' : 'Select This Scope'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Section 3: Interactive Deployment Options */}
      <section className="studio-section" aria-label="Deployment Options">
        <div className="section-heading">
          <div>
            <div className="eyebrow">STEP 2 · SELECT DEPLOYMENT MODEL</div>
            <h2>Deployment Options</h2>
          </div>
          <p className="section-subcopy">
            Choose whether DSC handles deployment and release setup or delivers source packages for
            self-hosting.
          </p>
        </div>

        <div className="studio-grid-2">
          {DEPLOYMENT_OPTIONS.map((option) => {
            const isSelected = activeDeploymentOption.id === option.id
            const details = blueprint.deploymentOptions?.[option.id]
            const detailItems = details?.inclusions || details?.included || option.inclusions || []
            return (
              <article
                key={option.id}
                className={`info-card service-deployment-card${isSelected ? ' is-selected' : ''}`}
                data-testid={`deployment-option-${option.id}`}
              >
                <div className="studio-card-top">
                  <span className="card-label">DEPLOYMENT OPTION</span>
                  <span className="status-pill">{option.badge}</span>
                </div>
                <h3>{details?.headline || option.label}</h3>
                <p className="studio-card-desc">
                  {details?.description || option.shortSummary}
                </p>
                {detailItems.length > 0 ? (
                  <ul className="feature-list studio-feature-list">
                    {detailItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="card-actions studio-card-actions">
                  <button
                    type="button"
                    className={`button ${isSelected ? 'primary' : 'secondary'} full-width`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDeployment(option.id)}
                  >
                    {isSelected ? `Selected: ${option.label} ✓` : `Choose ${option.label}`}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Section 4: Quotation Summary & Request CTA */}
      <section className="studio-section" aria-label="Quotation Summary and Request">
        <div className="service-quotation-summary-box" data-testid="service-quotation-summary">
          <div className="service-quotation-summary-main">
            <div className="eyebrow">STEP 3 · CUSTOM QUOTATION MODEL</div>
            <h2>Request a Custom Quotation for {blueprint.title}</h2>
            <p className="service-quotation-statement" data-testid="service-quotation-statement">
              {QUOTATION_MODEL_STATEMENT}
            </p>

            <div className="service-selection-summary">
              <div className="service-selection-pill">
                <span className="selection-pill-label">Service Category</span>
                <strong data-testid="selected-service-title">{blueprint.title}</strong>
              </div>
              <div className="service-selection-pill">
                <span className="selection-pill-label">Selected Scope</span>
                <strong data-testid="selected-scope-name">{activeScope?.name}</strong>
              </div>
              <div className="service-selection-pill">
                <span className="selection-pill-label">Deployment Option</span>
                <strong data-testid="selected-deployment-label">
                  {activeDeploymentOption.label}
                </strong>
              </div>
            </div>
          </div>

          <div className="service-quotation-summary-cta">
            <Link
              className="button primary full-width"
              to={inquiryUrl}
              data-testid="proceed-quotation-cta"
            >
              Proceed to Quotation Inquiry →
            </Link>
            <Link className="button ghost full-width" to="/pages/ulogin">
              Have a DSC Account? Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
