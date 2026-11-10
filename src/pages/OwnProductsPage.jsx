import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function OwnProductsPage() {
  usePageMeta(SEO_ROUTES.ownProducts)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Products · Classification B"
        title="Own Products"
        description="Proprietary software products, mobile applications, and internal intellectual property conceived, owned, and developed directly by Dark Skull Corporation."
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

      {/* Honest Empty State for Phase 1 */}
      <div className="mt-36">
        <StudioEmptyState
          badge="OWN PRODUCTS DIRECTORY"
          title="Own Products Portfolio Structure Ready"
          description="Dedicated product profiles and detailed proprietary project entries for DSC Own Products are not yet populated in this directory. To view currently released applications and games in production, visit our In Production directory."
          note="No unverified or placeholder product entries are displayed."
          actions={[
            { label: 'Explore In Production', to: '/products/in-production', variant: 'primary' },
            { label: 'View Android Apps & Games', to: '/pages/apps', variant: 'secondary' },
            { label: 'Back to Products Overview', to: '/products', variant: 'ghost' },
          ]}
        />
      </div>

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
