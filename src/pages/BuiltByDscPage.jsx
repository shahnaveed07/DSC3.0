import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function BuiltByDscPage() {
  usePageMeta(SEO_ROUTES.builtByDsc)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Products · Classification C"
        title="Built by DSC"
        description="Websites, Android applications, and games developed by Dark Skull Corporation for clients, partner organizations, and commissioned projects."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: 'Built by DSC' },
        ]}
        actions={[
          { label: 'Explore Studio Services', to: '/services', variant: 'primary' },
          { label: 'Back to Products', to: '/products', variant: 'secondary' },
        ]}
      />

      {/* Structural Overview of Client & Commissioned Work */}
      <section className="seo-section mt-36">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Client Deliveries"
            title="Commissioned Software & Client Projects"
            description="Built by DSC highlights software, websites, and interactive applications engineered by Dark Skull Corporation on behalf of external clients and collaborators."
          />

          <div className="card-grid columns-3 mt-24">
            <article className="info-card">
              <span className="card-badge">CUSTOM WEBSITES</span>
              <h3>Client Web Platforms</h3>
              <p className="text-muted text-sm m-0">
                Responsive websites and custom web interfaces engineered to meet client branding, accessibility, and performance goals.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">MOBILE APPLICATIONS</span>
              <h3>Custom Android Software</h3>
              <p className="text-muted text-sm m-0">
                Tailored Android applications developed for client workflows, customer engagement, or specialized device utility.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">INTERACTIVE PROJECTS</span>
              <h3>Commissioned Games</h3>
              <p className="text-muted text-sm m-0">
                Custom interactive experiences and mobile games built according to partner specifications and gameplay requirements.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Honest Empty State */}
      <div className="mt-36">
        <StudioEmptyState
          badge="CLIENT PORTFOLIO DIRECTORY"
          title="No Approved Client Showcase Entries Listed Yet"
          description="Verified client projects, websites, applications, and games built by Dark Skull Corporation will be published in this directory only when verified project details and client showcase approvals are finalized."
          note="Dark Skull Corporation does not publish unverified client names, fabricated case studies, or placeholder screenshots."
          actions={[
            { label: 'Explore Development Services', to: '/services', variant: 'primary' },
            { label: 'Contact Studio', to: '/contact', variant: 'secondary' },
            { label: 'Back to Products Overview', to: '/products', variant: 'ghost' },
          ]}
        />
      </div>

      <StudioCtaBanner
        eyebrow="Work With Dark Skull Corporation"
        title="Planning a Custom Website, Android App, or Game?"
        description="Review our development service categories or reach out to our team to discuss your project requirements."
        actions={[
          { label: 'Website Development', to: '/services/websites', variant: 'primary' },
          { label: 'Android App Development', to: '/services/android-applications', variant: 'secondary' },
          { label: 'Game Development', to: '/services/game-development', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
