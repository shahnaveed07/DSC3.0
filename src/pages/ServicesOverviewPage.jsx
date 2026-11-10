import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { studioServiceCategories } from '../content/siteContent'
import {
  StudioCategoryCard,
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
          { label: 'Contact Studio for Inquiries', to: '/contact', variant: 'primary' },
          { label: 'Explore Our Products', to: '/products', variant: 'secondary' },
        ]}
      />

      {/* Three Core Service Categories */}
      <section className="studio-section mt-36" aria-labelledby="service-categories-heading">
        <StudioSectionHeader
          eyebrow="Official Service Categories"
          title="What You Can Request from DSC"
          description="Select a development discipline below to review its architectural scope, engineering focus, and project workflow structure."
        />

        <div className="studio-three-col-grid mt-24">
          {studioServiceCategories.map((service) => (
            <StudioCategoryCard
              key={service.id}
              categoryLabel={service.categoryLabel}
              badge={service.badge}
              title={service.title}
              description={service.description}
              metaItems={service.metaItems}
              highlights={service.highlights}
              action={service.action}
              secondaryAction={{ label: 'Inquire via Contact', to: '/contact' }}
            />
          ))}
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
              <span className="card-badge">01 · SCOPING</span>
              <h3>Clear Requirements</h3>
              <p className="text-muted text-sm m-0">
                We align on functional goals, target platforms, and technical constraints before writing production code.
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
                Projects conclude with verified production builds, deployment coordination, and clear technical documentation.
              </p>
            </article>
          </div>
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Project Inquiries"
        title="Have a Website, Android App, or Game Project in Mind?"
        description="Reach out to Dark Skull Corporation through our Contact page to discuss your project goals with our studio team."
        actions={[
          { label: 'Contact Dark Skull Corporation', to: '/contact', variant: 'primary' },
          { label: 'View In Production Work', to: '/products/in-production', variant: 'secondary' },
          { label: 'About DSC Studio', to: '/about', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
