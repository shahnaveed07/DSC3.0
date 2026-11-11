import { Link } from 'react-router-dom'
import { getFeaturedProjects, studioProductCategories } from '../content/siteContent'
import { SEO_ROUTES } from '../content/seoConfig'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { ProjectCard } from '../components/ui/ProjectCard'
import {
  StudioCategoryCard,
  StudioCtaBanner,
  StudioPageHeader,
} from '../components/ui/StudioComponents'

export function StudioProductsPage() {
  usePageMetadata(SEO_ROUTES.studioProducts)
  const featuredProjects = getFeaturedProjects()

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="DSC SOFTWARE STUDIO · PORTFOLIO"
        title="Products & Portfolio"
        subtitle="Explore Dark Skull Corporation’s released Android applications and games, proprietary studio software, and client engineering portfolio."
        actions={[
          { label: 'View In Production', to: '/products/in-production', variant: 'primary' },
          { label: 'View Own Products', to: '/products/own-products', variant: 'secondary' },
          { label: 'View Built by DSC', to: '/products/built-by-dsc', variant: 'ghost' },
        ]}
      />

      <section className="studio-section" aria-label="Portfolio Categories">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PORTFOLIO CLASSIFICATIONS</div>
            <h2>Browse by Classification</h2>
          </div>
          <p className="section-subcopy">
            Select a portfolio category to view released software, proprietary DSC products, or
            commissioned client projects.
          </p>
        </div>

        <div className="studio-grid-3">
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

      <section className="studio-section" aria-label="Featured Projects">
        <div className="section-heading">
          <div>
            <div className="eyebrow">RELEASED ON GOOGLE PLAY</div>
            <h2>Featured Projects</h2>
          </div>
          <div className="card-actions">
            <Link className="button ghost" to="/products/in-production">
              View All In Production →
            </Link>
          </div>
        </div>

        <div className="portfolio-projects-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="CUSTOM SOFTWARE & DEVELOPMENT"
        title="Looking for a Custom Website, Android App, or Game?"
        description="Explore our software development services or contact Dark Skull Corporation to request a custom project quotation."
        primaryAction={{ label: 'Explore Services', to: '/services' }}
        secondaryAction={{ label: 'Contact Studio', to: '/contact' }}
      />
    </div>
  )
}
