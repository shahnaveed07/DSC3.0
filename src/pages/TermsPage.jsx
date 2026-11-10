import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { PageSection } from '../components/ui/PageSection'
import { termsSections } from '../content/siteContent'

export function TermsPage() {
  usePageMeta(SEO_ROUTES.terms)

  return (
    <div className="page-stack">
      {/* Hero */}
      <section className="hero-block">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Terms of Service &amp; Licensing Agreements</h1>
        <p className="hero-copy">
          Please read these terms carefully before accessing DSCWeb or licensing Dark Skull Corporation software.
          By purchasing, downloading, or running our software panels and mobile applications, you agree to comply with single-device licensing, respectful platform conduct, and security policies.
        </p>
        <p className="mt-8 text-sm text-muted">
          <strong>Last Updated:</strong> October 2026 &nbsp;|&nbsp; <strong>Effective Date:</strong> August 2026
        </p>
      </section>

      {/* Main Sections */}
      <PageSection
        eyebrow="Platform Rules"
        title="Terms &amp; Conditions"
        description="These provisions constitute the legal agreement between you and Dark Skull Corporation regarding website usage, digital orders, and software execution."
      >
        <div className="card-grid columns-2">
          {termsSections.map((item) => (
            <article className="info-card" key={item.title}>
              <span className="card-badge">{item.label}</span>
              <h3>{item.title}</h3>
              <p className="text-sm text-muted m-0">{item.body}</p>
            </article>
          ))}
        </div>

        {/* Support & Dispute Resolution Box */}
        <div className="portal-callout-card mt-36">
          <div className="portal-callout-info">
            <h3 className="portal-callout-title">Licensing Questions &amp; Dispute Resolution</h3>
            <p className="portal-callout-desc">
              If you have questions regarding these terms, need an authorized Hardware ID (HWID) reset due to an operating system reinstall or computer upgrade, or need clarification on software usage:
            </p>
          </div>
          <div className="portal-callout-actions">
            <a href="mailto:darkskullcorporation@gmail.com" className="button button-primary button-sm">
              Email Legal &amp; Licensing
            </a>
            <Link to="/pages/contact" className="button button-secondary button-sm">
              Contact Support Desk
            </Link>
            <a
              href="https://discord.gg/XB2Zjmsb7K"
              target="_blank"
              rel="noreferrer"
              className="button button-ghost button-sm"
            >
              Discord Community ↗
            </a>
          </div>
        </div>
      </PageSection>
    </div>
  )
}
