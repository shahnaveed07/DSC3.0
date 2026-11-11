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

export function InProductionPage() {
  usePageMetadata(SEO_ROUTES.inProduction)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = getProjectsByCategory(PORTFOLIO_CATEGORIES.IN_PRODUCTION, activeFilter)

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="PRODUCTS · IN PRODUCTION"
        title="In Production"
        subtitle="Released Android applications, websites, and games actively maintained in production by Dark Skull Corporation."
        actions={[
          { label: 'Own Products', to: '/products/own-products', variant: 'secondary' },
          { label: 'Built by DSC', to: '/products/built-by-dsc', variant: 'ghost' },
        ]}
      />

      <section className="studio-section" aria-label="In Production Portfolio">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PRODUCTION RELEASES</div>
            <h2>Active Production Portfolio</h2>
          </div>

          <div
            className="portfolio-filter-bar"
            role="group"
            aria-label="Filter In Production projects by type"
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
            categoryLabel="IN PRODUCTION · WEBSITES"
            badge="Official Domain Active"
            title="No Additional Websites Listed Yet"
            description="Aside from the official Dark Skull Corporation platform (dscweb.me), no additional separate public websites are currently listed in this stream."
            highlights={[
              'Official Studio Platform: https://dscweb.me',
              'Custom Website Development available on request for individuals and businesses',
            ]}
            primaryAction={{ label: 'Explore Website Services', to: '/services/websites' }}
            secondaryAction={{ label: 'Show All Production Projects', to: '/products/in-production' }}
          />
        )}
      </section>

      <StudioCtaBanner
        eyebrow="PORTFOLIO NAVIGATION"
        title="Explore Proprietary Products or Client Work"
        description="Browse DSC’s internal software products or review our client project showcase."
        primaryAction={{ label: 'Explore Own Products', to: '/products/own-products' }}
        secondaryAction={{ label: 'Explore Built by DSC', to: '/products/built-by-dsc' }}
      />
    </div>
  )
}
