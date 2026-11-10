import { Navigate, NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { serviceBlueprints, studioServiceCategories } from '../content/siteContent'
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

  if (!blueprint) {
    return <Navigate replace to="/services" />
  }

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
          { label: 'Discuss a Project Inquiry', to: '/contact', variant: 'primary' },
          { label: 'All Services', to: '/services', variant: 'secondary' },
        ]}
      />

      {/* 1. Service Overview */}
      <section className="seo-section mt-36" aria-labelledby="service-overview-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="01 · Service Overview"
            title={`${blueprint.title} Overview`}
            description={blueprint.overview}
          />
        </div>
      </section>

      {/* 2. Scope of Work */}
      <section className="seo-section" aria-labelledby="service-scope-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="02 · Scope of Work"
            title="Core Engineering & Focus Areas"
            description="Projects within this discipline are organized around the following core engineering areas:"
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
        </div>
      </section>

      {/* 3. Deliverables & 4. Deployment Options */}
      <section className="seo-section" aria-labelledby="service-deliverables-heading">
        <div className="seo-container">
          <div className="studio-two-col-grid">
            <div className="studio-architecture-box">
              <span className="badge primary mb-8">03 · Deliverables Framework</span>
              <h3>Standard Project Deliverables</h3>
              <p className="text-muted text-sm mb-16">
                Specific deliverables are defined according to the agreed project scope:
              </p>
              <ul className="product-features">
                {blueprint.deliverablesFramework.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="studio-architecture-box">
              <span className="badge primary mb-8">04 · Deployment Options</span>
              <h3>Release &amp; Target Environments</h3>
              <p className="text-muted text-sm mb-16">{blueprint.deploymentNote}</p>

              <span className="badge primary mb-8 mt-16">05 · Package &amp; Requirements Structure</span>
              <h3>Service Packages &amp; Requirements Submission</h3>
              <p className="text-muted text-sm m-0">
                Structured service packages and online requirements submission workflows will be introduced in a subsequent studio phase. For current project inquiries, reach out directly through our Contact page.
              </p>
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
        description="Contact Dark Skull Corporation to discuss your project goals, timeline, and technical requirements."
        actions={[
          { label: 'Contact Studio', to: '/contact', variant: 'primary' },
          { label: 'All Services', to: '/services', variant: 'secondary' },
          { label: 'Explore Products', to: '/products', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
