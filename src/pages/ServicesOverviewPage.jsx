import { Link } from 'react-router-dom'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  studioServiceCategories,
} from '../content/siteContent'
import { SEO_ROUTES } from '../content/seoConfig'
import { usePageMetadata } from '../hooks/usePageMetadata'
import {
  StudioCategoryCard,
  StudioCtaBanner,
  StudioPageHeader,
} from '../components/ui/StudioComponents'

export function ServicesOverviewPage() {
  usePageMetadata(SEO_ROUTES.services)

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="DSC SOFTWARE STUDIO · SERVICES"
        title="Software Development Services"
        subtitle="Custom websites, Android applications, and interactive games engineered by Dark Skull Corporation. Review service capabilities, scope options, and deployment choices below."
        actions={[
          { label: 'Website Development', to: '/services/websites', variant: 'primary' },
          { label: 'Android Applications', to: '/services/android-applications', variant: 'secondary' },
          { label: 'Game Development', to: '/services/game-development', variant: 'ghost' },
        ]}
      />

      {/* Quotation Model Notice */}
      <section className="studio-section" aria-label="Custom Quotation Model">
        <div className="service-quotation-banner" data-testid="quotation-model-banner">
          <div className="service-quotation-banner-body">
            <div className="eyebrow">QUOTATION-BASED PRICING MODEL</div>
            <h2>Tailored Project Scope &amp; Custom Quotations</h2>
            <p className="service-quotation-statement" data-testid="quotation-model-statement">
              {QUOTATION_MODEL_STATEMENT}
            </p>
          </div>
          <div className="service-quotation-banner-actions">
            <Link className="button primary" to="/contact">
              Request a Custom Quotation
            </Link>
            <Link className="button ghost" to="/products/in-production">
              View Released Work
            </Link>
          </div>
        </div>
      </section>

      {/* Core Service Categories */}
      <section className="studio-section" aria-label="Service Categories">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CORE DEVELOPMENT SERVICES</div>
            <h2>Explore Service Tracks</h2>
          </div>
        </div>

        <div className="studio-grid-3">
          {studioServiceCategories.map((service) => (
            <StudioCategoryCard
              key={service.id}
              categoryLabel={service.categoryLabel}
              badge={service.badge}
              title={service.title}
              description={service.description}
              metaItems={service.metaItems}
              highlights={service.whatWeProvide || service.highlights}
              action={service.action}
            />
          ))}
        </div>
      </section>

      {/* Deployment Options Overview */}
      <section className="studio-section" aria-label="Deployment Options">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DELIVERY &amp; HANDOVER</div>
            <h2>Deployment Options Available Across All Services</h2>
          </div>
        </div>

        <div className="studio-grid-2">
          {DEPLOYMENT_OPTIONS.map((option) => (
            <article
              key={option.id}
              className="info-card service-deployment-card"
              data-testid={`overview-deployment-${option.id}`}
            >
              <div className="studio-card-top">
                <span className="card-label">DEPLOYMENT OPTION</span>
                <span className="status-pill">{option.badge}</span>
              </div>
              <h3>{option.label}</h3>
              <p className="studio-card-desc">{option.shortSummary}</p>
            </article>
          ))}
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="START A PROJECT"
        title="Ready to Discuss Your Project Requirements?"
        description="Contact Dark Skull Corporation with your target platform, project scope, and preferred deployment option to receive a custom quotation."
        primaryAction={{ label: 'Request Project Quotation', to: '/contact' }}
        secondaryAction={{ label: 'Explore Products & Portfolio', to: '/products' }}
      />
    </div>
  )
}
