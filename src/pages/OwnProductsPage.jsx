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

export function OwnProductsPage() {
  usePageMeta(SEO_ROUTES.ownProducts)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const matchingProjects = getProjectsByCategory(
    PORTFOLIO_CATEGORIES.OWN_PRODUCT,
    selectedFilter,
  )
  const activeFilterObj =
    PORTFOLIO_TYPE_FILTERS.find((f) => f.id === selectedFilter) || PORTFOLIO_TYPE_FILTERS[0]

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Products · Classification B"
        title="Own Products"
        description="Proprietary software products, Android applications, and games conceived, owned, and developed directly by Dark Skull Corporation."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: 'Own Products' },
        ]}
        actions={[
          { label: 'View In Production Releases', to: '/products/in-production', variant: 'primary' },
          { label: 'Back to Products', to: '/products', variant: 'secondary' },
        ]}
      />

      {/* Project Type Filter Bar */}
      <div
        className="category-filter-bar mt-24"
        role="group"
        aria-label="Filter Own Products by project type"
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

      {/* DSC-Owned Products Grid */}
      <section className="studio-section mt-36" aria-live="polite">
        <StudioSectionHeader
          eyebrow="First-Party Portfolio"
          badge={activeFilterObj.label}
          title={
            selectedFilter === 'all'
              ? 'DSC Proprietary Applications & Games'
              : `Own Products — ${activeFilterObj.label}`
          }
          description="Only products whose intellectual property and studio ownership are explicitly established under Dark Skull Corporation are listed here."
        />

        {matchingProjects.length > 0 ? (
          <div className="studio-two-col-grid mt-24">
            {matchingProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showFullDescription
                showFeatures
              />
            ))}
          </div>
        ) : (
          <div className="mt-24">
            <StudioEmptyState
              badge={`OWN PRODUCTS · ${activeFilterObj.label.toUpperCase()}`}
              title={`No DSC-Owned ${activeFilterObj.label} Listed Yet`}
              description={`There are currently no verified proprietary ${activeFilterObj.label.toLowerCase()} products published in this category. Select another filter to view DSC-owned Android applications and games.`}
              note="No unverified or placeholder product entries are displayed."
              actions={[
                { label: 'Explore In Production', to: '/products/in-production', variant: 'primary' },
                { label: 'Back to Products Overview', to: '/products', variant: 'secondary' },
              ]}
            />
          </div>
        )}
      </section>

      {/* Structural Classification Scope */}
      <section className="seo-section mt-36">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Studio Ownership"
            title="About DSC Own Products"
            description="This classification is reserved exclusively for products and intellectual property owned and governed by Dark Skull Corporation, distinct from client-commissioned deliveries."
          />

          <div className="card-grid columns-3 mt-24">
            <article className="info-card">
              <span className="card-badge">FIRST-PARTY IP</span>
              <h3>Studio-Owned Products</h3>
              <p className="text-muted text-sm m-0">
                Products designed, architected, and maintained in-house under the Dark Skull Corporation brand and long-term roadmap.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">CONTINUOUS LIFECYCLE</span>
              <h3>Direct Maintenance</h3>
              <p className="text-muted text-sm m-0">
                First-party releases receive ongoing engineering updates, stability improvements, and direct studio support.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">CLEAR PROVENANCE</span>
              <h3>Separated from Client Work</h3>
              <p className="text-muted text-sm m-0">
                Projects commissioned by external organizations are cataloged separately under Built by DSC rather than claimed as DSC-owned IP.
              </p>
            </article>
          </div>
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Dark Skull Corporation"
        title="Explore Our Services or Contact the Studio"
        description="Learn more about our software development services or reach out to Dark Skull Corporation with product questions."
        actions={[
          { label: 'Explore Services', to: '/services', variant: 'primary' },
          { label: 'Built by DSC', to: '/products/built-by-dsc', variant: 'secondary' },
          { label: 'Contact Us', to: '/contact', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
