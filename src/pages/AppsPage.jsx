import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { getAllProjects } from '../content/projectsData'

export function AppsPage() {
  usePageMeta(SEO_ROUTES.apps)
  const projects = getAllProjects()

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Android Applications &amp; Games</h1>
        <p>
          Explore official Android applications and mobile games designed and developed by Dark Skull Corporation with a focus on usability, performance, offline capability, and user privacy.
        </p>
      </section>

      {/* Applications & Games Showcase — Powered by Canonical Project Records */}
      <div className="apps-list mt-36">
        {projects.map((project) => (
          <article key={project.id} className="app-card">
            <div className="app-card-header">
              <div>
                <span className="badge primary">{project.typeBadge || project.projectType}</span>
                <h2 className="app-card-title">{project.name}</h2>
              </div>
              <div className="studio-release-actions m-0">
                <NavLink
                  className="button button-secondary button-sm"
                  to={`/projects/${project.slug}`}
                >
                  Project Details
                </NavLink>
                {project.storeUrl ? (
                  <a
                    className="button button-primary button-sm"
                    href={project.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.storeLabel || 'Google Play ↗'}
                  </a>
                ) : null}
              </div>
            </div>

            {project.shortDescription ? (
              <p className="app-card-tagline">{project.shortDescription}</p>
            ) : null}
            {project.description ? (
              <p className="app-card-desc">{project.description}</p>
            ) : null}

            {Array.isArray(project.features) && project.features.length > 0 ? (
              <div className="app-feature-grid">
                {project.features.map((feature) => (
                  <div key={feature} className="app-feature-item">
                    <span className="app-feature-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {project.permissionsNotice ? (
              <div className="app-notice-box">
                <strong>Permissions Transparency:</strong> {project.permissionsNotice}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {/* Studio Quality & Privacy Constitution */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge good mb-8">Studio Standards</span>
          <h2>Our App &amp; Game Quality Constitution</h2>
          <p className="mb-24">
            We design Android applications, games, and digital products around user respect and long-term reliability:
          </p>

          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">PRIVACY FIRST</span>
              <h3>Scoped Permissions</h3>
              <p className="text-muted text-sm m-0">
                Our Android applications and games request only the permissions required for user-invoked features and never harvest personal contacts or background telemetry.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">PERFORMANCE</span>
              <h3>Offline-Ready &amp; Fast</h3>
              <p className="text-muted text-sm m-0">
                We build our mobile apps and games for responsive touch feedback, low battery consumption, and reliable offline operation.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">CUSTOM PROJECTS</span>
              <h3>Websites on Request</h3>
              <p className="text-muted text-sm m-0">
                Alongside our Android apps and games, Dark Skull Corporation designs and develops custom websites for individuals, startups, and businesses on request.
              </p>
            </article>
          </div>

          <div className="portal-callout-card mt-24">
            <div className="portal-callout-info">
              <h3 className="portal-callout-title">Have an App, Game, or Website Project Inquiry?</h3>
              <p className="portal-callout-desc">
                Connect with <strong>Naveed Mushtaq </strong> and the Dark Skull Corporation team to discuss custom website development, Android applications, or studio collaborations.
              </p>
            </div>
            <div className="portal-callout-actions">
              <NavLink to="/pages/contact" className="button button-primary button-sm">
                Contact Studio
              </NavLink>
              <NavLink to="/pages/downloads" className="button button-secondary button-sm">
                Download Center
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
