import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function WebsitesPage() {
  usePageMeta(SEO_ROUTES.websites)

  return (
    <div className="center-wrap">
      {/* Page Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation · Products</span>
        <h1>Websites</h1>
        <p>
          Custom websites designed and developed by Dark Skull Corporation for individuals, startups, businesses, and companies on request.
        </p>
      </section>

      {/* Clean Portfolio Empty State (Phase 2 Structure) */}
      <section className="websites-empty-card mt-36" aria-labelledby="websites-portfolio-heading">
        <div className="websites-empty-brand">
          <picture>
            <source srcSet="/images/dsclogo2.webp" type="image/webp" />
            <img
              src="/images/dsclogo2.png"
              alt="Dark Skull Corporation Websites"
              className="websites-empty-logo"
              width="64"
              height="64"
              loading="lazy"
            />
          </picture>
        </div>

        <span className="badge primary mb-12">WEBSITE PORTFOLIO</span>
        <h2 id="websites-portfolio-heading" className="websites-empty-title">
          Website Portfolio Directory
        </h2>
        <p className="websites-empty-desc">
          Approved public website showcase entries are not yet listed in this directory. Dark Skull Corporation designs and develops responsive, modern websites for individuals, startups, businesses, and companies on request.
        </p>

        <div className="websites-empty-actions">
          <NavLink to="/pages/contact" className="button button-primary">
            Request a Website
          </NavLink>
          <NavLink to="/pages/products" className="button button-secondary">
            Back to Products
          </NavLink>
          <NavLink to="/pages/apps" className="button button-ghost">
            Android Applications
          </NavLink>
        </div>
      </section>
    </div>
  )
}
