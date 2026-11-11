import { useState } from 'react'
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_TYPE_FILTERS,
  getProjectsByCategory,
} from '../content/siteContent'
import { SEO_ROUTES } from '../content/seoConfig'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { ProjectCard } from '../components/ui/ProjectCard'
import {
  StudioCtaBanner,
  StudioEmptyStateCard,
  StudioPageHeader,
} from '../components/ui/StudioComponents'

export function OwnProductsPage() {
  usePageMetadata(SEO_ROUTES.ownProducts)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = getProjectsByCategory(PORTFOLIO_CATEGORIES.OWN_PRODUCT, activeFilter)

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="PRODUCTS · OWN PRODUCTS"
        title="Own Products"
        subtitle="First-party Android applications, games, and software products conceived, owned, and maintained directly by Dark Skull Corporation."
        actions={[
          { label: 'In Production', to: '/products/in-production', variant: 'secondary' },
          { label: 'Built by DSC', to: '/products/built-by-dsc', variant: 'ghost' },
        ]}
      />

      <section className="studio-section" aria-label="DSC Proprietary Products">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FIRST-PARTY STUDIO IP</div>
            <h2>DSC Proprietary Applications &amp; Games</h2>
          </div>

          <div
            className="portfolio-filter-bar"
            role="group"
            aria-label="Filter Own Products by type"
          >
            {PORTFOLIO_TYPE_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`portfolio-filter-btn${isActive ? ' active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="portfolio-projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <StudioEmptyStateCard
            categoryLabel="OWN PRODUCTS · WEBSITES"
            badge="First-Party Web"
            title="No DSC-Owned Websites Listed Yet"
            description="Dark Skull Corporation’s primary first-party web property is this official studio platform (dscweb.me). Separate first-party web products will appear here upon release."
            highlights={[
              'Android App: QR Scanner | Generator (Own Product & In Production)',
              'Android Game: Mind Matrix (Own Product & In Production)',
            ]}
            primaryAction={{ label: 'Explore Website Services', to: '/services/websites' }}
            secondaryAction={{ label: 'View All Products', to: '/products' }}
          />
        )}
      </section>

      <StudioCtaBanner
        eyebrow="CLIENT & PARTNER DELIVERY"
        title="Looking for Custom Software Built for Your Organization?"
        description="Explore our Built by DSC portfolio classification or review our software development services."
        primaryAction={{ label: 'Explore Built by DSC', to: '/products/built-by-dsc' }}
        secondaryAction={{ label: 'View Studio Services', to: '/services' }}
      />
    </div>
  )
}
