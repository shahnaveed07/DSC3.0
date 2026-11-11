import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  buildServiceInquiryUrl,
  studioServiceCategories,
} from '../content/siteContent'
import {
  StudioCtaBanner,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function ServicesOverviewPage() {
  usePageMeta(SEO_ROUTES.services)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Dark Skull Corporation · Software Studio"
        title="Software Development Services"
        description="Dark Skull Corporation provides custom software design and engineering across three core disciplines: Website Development, Android Application Development, and Game Development."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services' },
        ]}
        actions={[
          { label: 'Request a Custom Quotation', to: '/contact', variant: 'primary' },
          { label: 'Explore Our Products', to: '/products', variant: 'secondary' },
        ]}
      />

      {/* Quotation Model Statement Banner */}
      <section className="studio-quotation-banner mt-36" aria-labelledby="quotation-model-heading">
        <div className="studio-quotation-banner-inner">
          <div className="studio-quotation-banner-copy">
            <div className="studio-section-eyebrow-row">
              <span className="section-eyebrow">Quotation-Based Studio Model</span>
              <span className="badge primary">Custom Project Evaluation</span>
            </div>
            <h2 id="quotation-model-heading" className="studio-quotation-heading">
              Tailored Scope &amp; Custom Project Quotations
            </h2>
            <p className="studio-quotation-statement" data-testid="quotation-model-statement">
              {QUOTATION_MODEL_STATEMENT}
            </p>
            <p className="text-muted text-sm m-0">
              Instead of rigid public price tiers that overcharge for simple builds or under-scope complex engineering, DSC evaluates your functional goals, scope template, and deployment preference (<strong>With Deployment</strong> or <strong>Without Deployment</strong>) before issuing a transparent custom quotation.
            </p>
          </div>
          <div className="studio-quotation-banner-actions">
            <NavLink to="/contact" className="button button-primary">
              Send Project Inquiry
            </NavLink>
            <NavLink to="/products/in-production" className="button button-secondary">
              View Production Portfolio
            </NavLink>
          </div>
        </div>
      </section>

      {/* Three Core Service Categories */}
      <section className="studio-section mt-36" aria-labelledby="service-categories-heading">
        <StudioSectionHeader
          eyebrow="Official Service Categories"
          title="What You Can Request from DSC"
          description="Select a development discipline below to explore what DSC provides, review flexible scope templates, choose With Deployment or Without Deployment, and request a quotation."
          badge="3 Core Disciplines"
        />

        <div className="studio-three-col-grid mt-24">
          {studioServiceCategories.map((service) => (
            <article key={service.id} className="product-category-card studio-service-overview-card">
              <div>
                <div className="product-category-top">
                  <div className="product-category-meta">
                    <span className="product-category-number">{service.categoryLabel}</span>
                    <span className="badge primary">{service.badge}</span>
                  </div>
                </div>

                <h2 className="product-category-title">{service.title}</h2>
                <p className="product-category-desc">{service.description}</p>

                {service.metaItems && service.metaItems.length > 0 ? (
                  <div className="studio-card-meta-strip">
                    {service.metaItems.map((meta) => (
                      <span key={meta} className="studio-card-meta-pill">
                        {meta}
                      </span>
                    ))}
                  </div>
                ) : null}

                {service.whatWeProvide && service.whatWeProvide.length > 0 ? (
                  <div className="studio-service-capabilities-box mb-16">
                    <span className="micro-label">WHAT DSC PROVIDES</span>
                    <ul className="product-features mt-8 mb-0">
                      {service.whatWeProvide.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="studio-card-actions">
                <NavLink to={service.action.to} className="button button-primary w-100">
                  {service.action.label}
                </NavLink>
                <NavLink
                  to={buildServiceInquiryUrl({
                    serviceSlug: service.slug,
                    deploymentOption: 'with-deployment',
                  })}
                  className="button button-secondary w-100"
                >
                  Request Custom Quotation
                </NavLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Deployment Options Overview (With Deployment vs Without Deployment) */}
      <section className="seo-section" aria-labelledby="deployment-options-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Release & Handover Flexibility"
            title="Available Deployment Options"
            description="Every DSC development service supports two delivery modes so you can choose whether our team manages your production deployment or hands over the complete build package to your internal team."
            badge="With or Without Deployment"
          />

          <div className="studio-two-col-grid mt-24">
            {DEPLOYMENT_OPTIONS.map((option) => (
              <article
                key={option.id}
                className="studio-architecture-box studio-deployment-overview-card"
                data-testid={`overview-deployment-${option.id}`}
              >
                <div className="studio-section-eyebrow-row">
                  <span className="badge primary">{option.badge}</span>
                </div>
                <h3>{option.label}</h3>
                <p className="text-muted text-sm mb-16">{option.shortSummary}</p>
                <ul className="product-features mb-0">
                  {option.inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Engineering Standards */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge primary mb-8">Engineering Standards</span>
          <h2>How Dark Skull Corporation Approaches Client Projects</h2>
          <p className="mb-24">
            Every custom website, Android application, and game project is structured around clear communication, maintainable code, and practical real-world performance:
          </p>

          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">01 · SCOPING &amp; QUOTATION</span>
              <h3>Clear Requirements</h3>
              <p className="text-muted text-sm m-0">
                We align on functional goals, target platforms, scope templates, and deployment options before providing a custom quotation.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">02 · ARCHITECTURE</span>
              <h3>Clean Engineering</h3>
              <p className="text-muted text-sm m-0">
                Interfaces and application logic are built for responsiveness, security, and maintainability across supported devices.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">03 · DELIVERY</span>
              <h3>Structured Handover</h3>
              <p className="text-muted text-sm m-0">
                Projects conclude with verified production builds, optional live deployment coordination, and clear technical documentation.
              </p>
            </article>
          </div>
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Project Inquiries & Quotations"
        title="Have a Website, Android App, or Game Project in Mind?"
        description={QUOTATION_MODEL_STATEMENT}
        actions={[
          { label: 'Submit Project Requirements', to: '/contact', variant: 'primary' },
          { label: 'View In Production Work', to: '/products/in-production', variant: 'secondary' },
          { label: 'About DSC Studio', to: '/about', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
