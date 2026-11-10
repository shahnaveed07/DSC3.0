import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { inProductionStreams } from '../content/siteContent'
import {
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

const STREAM_FILTERS = [
  { id: 'all', label: 'All Production Types' },
  { id: 'android-applications', label: 'Android Applications' },
  { id: 'websites', label: 'Websites' },
  { id: 'games', label: 'Games' },
]

export function InProductionPage() {
  usePageMeta(SEO_ROUTES.inProduction)
  const [selectedStream, setSelectedStream] = useState('all')

  const visibleStreams = inProductionStreams.filter(
    (stream) => selectedStream === 'all' || stream.id === selectedStream,
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
          { label: 'Official Download Center', to: '/pages/downloads', variant: 'ghost' },
        ]}
      />

      {/* Category Filter Controls */}
      <div className="category-filter-bar mt-24" role="group" aria-label="Filter In Production categories">
        {STREAM_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`button ${selectedStream === filter.id ? 'button-primary' : 'button-secondary'} button-sm`}
            aria-pressed={selectedStream === filter.id}
            onClick={() => setSelectedStream(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Three Production Streams: Android Applications, Websites, Games */}
      <div className="studio-streams-stack mt-36">
        {visibleStreams.map((stream) => (
          <section
            key={stream.id}
            id={stream.id}
            className="studio-stream-section"
            aria-labelledby={`stream-heading-${stream.id}`}
          >
            <StudioSectionHeader
              eyebrow={stream.label}
              badge={stream.badge}
              title={stream.title}
              description={stream.description}
            />

            {Array.isArray(stream.verifiedReleases) && stream.verifiedReleases.length > 0 ? (
              <div className="studio-release-grid mt-20">
                {stream.verifiedReleases.map((release) => (
                  <article key={release.name} className="app-card studio-release-card">
                    <div className="app-card-header">
                      <div>
                        <span className="badge primary">{release.type}</span>
                        <h3 className="app-card-title">{release.name}</h3>
                      </div>
                      <span className="badge good">{release.status}</span>
                    </div>

                    <p className="app-card-desc">{release.summary}</p>

                    <div className="studio-release-actions">
                      {release.externalHref ? (
                        <a
                          href={release.externalHref}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-primary button-sm"
                        >
                          {release.externalLabel}
                        </a>
                      ) : null}
                      {release.internalTo ? (
                        <NavLink
                          to={release.internalTo}
                          className="button button-secondary button-sm"
                        >
                          {release.internalLabel}
                        </NavLink>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-20">
                <StudioEmptyState
                  badge={`${stream.title.toUpperCase()} DIRECTORY`}
                  title={`No Additional ${stream.title} Listed Yet`}
                  description={stream.emptyMessage}
                  actions={[
                    { label: 'Website Development Services', to: '/services/websites', variant: 'primary' },
                    { label: 'Contact Studio', to: '/contact', variant: 'secondary' },
                  ]}
                />
              </div>
            )}
          </section>
        ))}
      </div>

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
