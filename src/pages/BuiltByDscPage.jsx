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

export function BuiltByDscPage() {
  usePageMetadata(SEO_ROUTES.builtByDsc)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = getProjectsByCategory(PORTFOLIO_CATEGORIES.BUILT_BY_DSC, activeFilter)
  const activeFilterObj =
    PORTFOLIO_TYPE_FILTERS.find((f) => f.id === activeFilter) || PORTFOLIO_TYPE_FILTERS[0]

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="PRODUCTS · BUILT BY DSC"
        title="Built by DSC"
        subtitle="Custom websites, Android applications, and games engineered by Dark Skull Corporation for external clients and partner organizations."
        actions={[
          { label: 'Explore Studio Services', to: '/services', variant: 'primary' },
          { label: 'Request Project Consultation', to: '/contact', variant: 'secondary' },
        ]}
      />

      <section className="studio-section" aria-label="Built by DSC Portfolio">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CLIENT &amp; PARTNER DELIVERIES</div>
            <h2>Client Project Showcase</h2>
          </div>

          <div
            className="portfolio-filter-bar"
            role="group"
            aria-label="Filter Built by DSC projects by type"
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
            categoryLabel={`CLIENT PORTFOLIO · ${activeFilterObj.label.toUpperCase()}`}
            badge="Verified Showcase Policy"
            title="No Approved Client Showcase Entries Listed Yet"
            description="Dark Skull Corporation publishes client websites, Android applications, and games in this directory only after formal client showcase approval is granted."
            highlights={[
              'Website Development — Custom business websites, portfolios, and web platforms',
              'Android Application Development — Tailored mobile utilities and business apps',
              'Game Development — Interactive mobile games and puzzle experiences',
            ]}
            primaryAction={{ label: 'Explore Development Services', to: '/services' }}
            secondaryAction={{ label: 'Start a Project Inquiry', to: '/contact' }}
          />
        )}
      </section>

      <StudioCtaBanner
        eyebrow="START YOUR PROJECT"
        title="Ready to Build a Custom Website, Android App, or Game?"
        description="Contact Dark Skull Corporation with your project scope and timeline to receive a custom quotation."
        primaryAction={{ label: 'Contact DSC Studio', to: '/contact' }}
        secondaryAction={{ label: 'View Own Products', to: '/products/own-products' }}
      />
    </div>
  )
}
