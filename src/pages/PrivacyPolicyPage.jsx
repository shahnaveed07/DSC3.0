import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { PageSection } from '../components/ui/PageSection'
import { privacySections } from '../content/siteContent'

export function PrivacyPolicyPage() {
  usePageMeta(SEO_ROUTES.privacy)

  return (
    <div className="page-stack">
      {/* Hero */}
      <section className="hero-block">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Privacy Policy &amp; Cookie Disclosures</h1>
        <p className="hero-copy">
          We believe in data minimization and transparent operation. This Privacy Policy details the technical information collected when you access DSCWeb (dscweb.me), use our Android applications, or license our desktop software panels.
        </p>
        <p className="mt-8 text-sm text-muted">
          <strong>Last Updated:</strong> October 2026 &nbsp;|&nbsp; <strong>Effective Date:</strong> August 2026
        </p>
      </section>

      {/* Main Content Sections */}
      <PageSection
        title="Privacy &amp; Data Handling Principles"
        description="We collect only the technical data required to verify software licenses, authenticate sessions, process checkout orders, and maintain server reliability. We never sell or monetize user personal information."
      >
        <div className="card-grid columns-2">
          {privacySections.map((section) => (
            <article className="info-card" key={section.title}>
              <h3>{section.title}</h3>
              {section.description ? (
                <p className="text-sm text-muted mb-12">
                  {section.description}
                </p>
              ) : null}
              <ul className="feature-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {section.note ? (
                <p className="text-xs text-muted mt-12">
                  <strong>Note:</strong> {section.note}
                </p>
              ) : null}
            </article>
          ))}

          {/* Contact Box */}
          <article className="info-card">
            <h3>Privacy Questions &amp; Data Deletion</h3>
            <p className="text-sm text-muted mb-12">
              To exercise your data privacy rights, request an export of your account records, or request complete deletion of your data:
            </p>
            <p className="text-sm mb-8">
              <strong>Dark Skull Corporation</strong>
              <br />
              Founder &amp; Lead Developer: Naveed Mushtaq
              <br />
              Official Email:{' '}
              <a href="mailto:darkskullcorporation@gmail.com" className="text-primary">
                darkskullcorporation@gmail.com
              </a>
              <br />
              Discord Community:{' '}
              <a
                href="https://discord.gg/XB2Zjmsb7K"
                target="_blank"
                rel="noreferrer"
                className="text-primary"
              >
                Discord ↗
              </a>
            </p>
            <div className="mt-12">
              <Link to="/pages/contact" className="button button-secondary button-sm">
                Open Contact Page
              </Link>
            </div>
          </article>
        </div>
      </PageSection>
    </div>
  )
}
