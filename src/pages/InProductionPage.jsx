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

export function InProductionPage() {
  usePageMeta(SEO_ROUTES.inProduction)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const matchingProjects = getProjectsByCategory(
    PORTFOLIO_CATEGORIES.IN_PRODUCTION,
    selectedFilter,
  )
  const activeFilterObj =
    PORTFOLIO_TYPE_FILTERS.find((f) => f.id === selectedFilter) || PORTFOLIO_TYPE_FILTERS[0]

  const websiteProjects = getProjectsByCategory(
    PORTFOLIO_CATEGORIES.IN_PRODUCTION,
    'websites',
  )

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Products · Classification A"
        title="In Production"
        description="Applications, websites, and games developed by Dark Skull Corporation that are released, deployed, or actively available in production."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: 'In Production' },
        ]}
        actions={[
          { label: 'All Product Categories', to: '/products', variant: 'secondary' },
          { label: 'Own Products', to: '/products/own-products', variant: 'ghost' },
        ]}
      />

      {/* Category Filter Controls: All, Android Applications, Websites, Games */}
      <div
        className="category-filter-bar mt-24"
        role="group"
        aria-label="Filter In Production projects by category"
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

      {/* Filtered Project Grid or Empty State */}
      <section className="studio-section mt-36" aria-live="polite">
        <StudioSectionHeader
          eyebrow="Production Releases"
          badge={activeFilterObj.label}
          title={
            selectedFilter === 'all'
              ? 'Active Production Applications, Websites & Games'
              : `In Production — ${activeFilterObj.label}`
          }
          description="Only projects with verified production deployment or official store availability are included in this directory."
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
              badge={`${activeFilterObj.label.toUpperCase()} DIRECTORY`}
              title={`No Additional ${activeFilterObj.label} Listed Yet`}
              description="No separate third-party or additional production website entries are listed in this directory yet. Verified production website deployments will appear here as they are approved for public showcase."
              note="Dark Skull Corporation does not list development-only experiments as released production products."
              actions={[
                { label: 'Show All In Production', to: '/products/in-production', variant: 'secondary' },
                { label: 'Website Development Services', to: '/services/websites', variant: 'primary' },
                { label: 'Contact Studio', to: '/contact', variant: 'ghost' },
              ]}
            />
          </div>
        )}
      </section>

      {/* Websites Production Directory Notice when viewing "All" */}
      {selectedFilter === 'all' && websiteProjects.length === 0 ? (
        <section className="studio-stream-section mt-36" aria-labelledby="in-prod-websites-heading">
          <StudioSectionHeader
            eyebrow="Production Stream · Websites"
            badge="Websites"
            title="Production Websites Directory"
            description="Public websites and web platforms deployed by Dark Skull Corporation."
          />
          <div className="mt-20">
            <StudioEmptyState
              badge="WEBSITES DIRECTORY"
              title="No Additional Websites Listed Yet"
              description="No separate third-party or additional production website entries are listed in this directory yet. Verified production website deployments will appear here as they are approved for public showcase."
              actions={[
                { label: 'Website Development Services', to: '/services/websites', variant: 'primary' },
                { label: 'Contact Studio', to: '/contact', variant: 'secondary' },
              ]}
            />
          </div>
        </section>
      ) : null}

      <StudioCtaBanner
        eyebrow="Explore More Categories"
        title="Review DSC Own Products or Client Work"
        description="Navigate across our other product classifications or explore the services we provide for custom applications, websites, and games."
        actions={[
          { label: 'Own Products', to: '/products/own-products', variant: 'primary' },
          { label: 'Built by DSC', to: '/products/built-by-dsc', variant: 'secondary' },
          { label: 'All Products', to: '/products', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
