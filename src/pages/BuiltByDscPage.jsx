import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_TYPE_FILTERS,
  getProjectsByCategory,
} from '../content/projectsData'
import {
  ProjectCard,
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function BuiltByDscPage() {
  usePageMeta(SEO_ROUTES.builtByDsc)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const matchingProjects = getProjectsByCategory(
    PORTFOLIO_CATEGORIES.BUILT_BY_DSC,
    selectedFilter,
  )
  const activeFilterObj =
    PORTFOLIO_TYPE_FILTERS.find((f) => f.id === selectedFilter) || PORTFOLIO_TYPE_FILTERS[0]

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

      {/* Project Type Filter Controls */}
      <div
        className="category-filter-bar mt-24"
        role="group"
        aria-label="Filter Built by DSC client projects by category"
      >
        {PORTFOLIO_TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`button ${selectedFilter === filter.id ? 'button-primary' : 'button-secondary'} button-sm category-filter-btn`}
            aria-pressed={selectedFilter === filter.id}
            onClick={() => setSelectedFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Client Projects Grid or Honest Empty State */}
      <section className="studio-section mt-36" aria-live="polite">
        {matchingProjects.length > 0 ? (
          <div className="studio-two-col-grid">
            {matchingProjects.map((project) => (
              <ProjectCard key={project.id} project={project} showFullDescription />
            ))}
          </div>
        ) : (
          <StudioEmptyState
            badge={`CLIENT PORTFOLIO · ${activeFilterObj.label.toUpperCase()}`}
            title="No Approved Client Showcase Entries Listed Yet"
            description="Verified client projects, websites, applications, and games built by Dark Skull Corporation will be published in this directory only when verified project details and client showcase approvals are finalized."
            note="Dark Skull Corporation does not publish unverified client names, fabricated case studies, or placeholder screenshots."
            actions={[
              { label: 'Explore Development Services', to: '/services', variant: 'primary' },
              { label: 'Contact Studio', to: '/contact', variant: 'secondary' },
              { label: 'Back to Products Overview', to: '/products', variant: 'ghost' },
            ]}
          />
        )}
      </section>

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
