import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { studioProductCategories } from '../content/siteContent'
import { getFeaturedProjects } from '../content/projectsData'
import {
  ProjectCard,
  StudioCategoryCard,
  StudioCtaBanner,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function StudioProductsPage() {
  usePageMeta(SEO_ROUTES.studioProducts)
  const featuredProjects = getFeaturedProjects()

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Dark Skull Corporation · Software Studio"
        title="Products & Portfolio"
        description="Explore software, applications, websites, and games developed by Dark Skull Corporation, organized across three distinct studio portfolio classifications."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products' },
        ]}
        actions={[
          { label: 'In Production Releases', to: '/products/in-production', variant: 'primary' },
          { label: 'Own Products', to: '/products/own-products', variant: 'secondary' },
          { label: 'Built by DSC', to: '/products/built-by-dsc', variant: 'ghost' },
        ]}
      />

      {/* Three Portfolio Classifications */}
      <section className="studio-section mt-36" aria-labelledby="portfolio-classifications-heading">
        <StudioSectionHeader
          eyebrow="Portfolio Architecture"
          title="Three Portfolio Classifications"
          description="Dark Skull Corporation separates live production deployments, proprietary studio-owned software, and client-commissioned projects into distinct categories."
        />

        <div className="studio-three-col-grid mt-24">
          {studioProductCategories.map((category) => (
            <StudioCategoryCard
              key={category.id}
              categoryLabel={category.categoryLabel}
              badge={category.badge}
              title={category.title}
              description={category.description}
              metaItems={category.metaItems}
              highlights={category.highlights}
              action={category.action}
            />
          ))}
        </div>
      </section>

      {/* Featured Verified Studio Projects */}
      {featuredProjects.length > 0 ? (
        <section className="studio-section mt-36" aria-labelledby="featured-projects-heading">
          <StudioSectionHeader
            eyebrow="Verified Studio Releases"
            title="Featured Projects"
            description="Official Android applications and mobile games conceived, engineered, and published in production by Dark Skull Corporation."
          />

          <div className="studio-two-col-grid mt-24">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showFullDescription
                detailActionLabel="View Project"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Classification Distinction Guide */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge primary mb-8">Portfolio Governance</span>
          <h2>How DSC Classifies Products &amp; Projects</h2>
          <p className="mb-24">
            Not every project engineered by Dark Skull Corporation is a proprietary studio product. Our three-tier classification ensures transparent ownership and clear project provenance:
          </p>

          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">A · IN PRODUCTION</span>
              <h3>Live &amp; Deployed Releases</h3>
              <p className="text-muted text-sm m-0">
                Encompasses Android applications, websites, and games that are actively deployed, published on official stores, or operating in production.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">B · OWN PRODUCTS</span>
              <h3>DSC Proprietary Software</h3>
              <p className="text-muted text-sm m-0">
                Represents software products and intellectual property conceived, owned, and maintained directly by Dark Skull Corporation.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">C · BUILT BY DSC</span>
              <h3>Client &amp; Partner Deliveries</h3>
              <p className="text-muted text-sm m-0">
                Represents custom websites, Android applications, and games built by DSC for external clients, businesses, and partner projects.
              </p>
            </article>
          </div>
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Commission or Collaborate"
        title="Looking for Custom Software or Website Development?"
        description="Explore our official development services or contact Dark Skull Corporation to discuss an Android application, game, or website project."
        actions={[
          { label: 'View Development Services', to: '/services', variant: 'primary' },
          { label: 'Contact Studio', to: '/contact', variant: 'secondary' },
          { label: 'Published Android Apps', to: '/pages/apps', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
