import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

export function WebsitesPage() {
  usePageMetadata(SEO_ROUTES.websites)

  return (
    <div className="page-stack">
      <section className="hero-block">
        <div className="eyebrow">PRODUCTS · WEBSITES</div>
        <h1>Websites</h1>
        <p className="lead">
          Explore web platforms and custom website development by Dark Skull Corporation.
        </p>
      </section>

      <section className="info-card websites-empty-card" aria-label="Websites Directory Status">
        <div className="websites-empty-header">
          <div className="card-label">PORTFOLIO STATUS</div>
          <span className="status-pill">Accepting Custom Projects</span>
        </div>

        <h2>Custom Website Development on Request</h2>
        <p className="websites-empty-lead">
          We have not listed public client websites in this directory yet. Dark Skull Corporation
          designs and engineers custom responsive websites and web applications for individuals,
          creators, and businesses.
        </p>

        <div className="websites-capabilities-grid">
          <div className="website-capability-item">
            <h3>Business &amp; Brand Websites</h3>
            <p>
              Clean, fast-loading company websites and landing pages engineered for desktop,
              tablet, and mobile viewports.
            </p>
          </div>

          <div className="website-capability-item">
            <h3>Personal &amp; Creator Portfolios</h3>
            <p>
              Custom portfolio sites and showcase platforms tailored to highlight your work and
              services.
            </p>
          </div>

          <div className="website-capability-item">
            <h3>Web Applications &amp; Portals</h3>
            <p>
              Modern React applications, client dashboards, and API-connected web tools built for
              long-term maintainability.
            </p>
          </div>
        </div>

        <div className="card-actions mt-24">
          <Link className="button primary" to="/services/websites">
            Explore Website Services
          </Link>
          <Link className="button secondary" to="/contact">
            Request a Custom Quotation
          </Link>
        </div>
      </section>
    </div>
  )
}
