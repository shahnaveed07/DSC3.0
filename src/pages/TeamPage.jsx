import { SEO_ROUTES } from '../content/seoConfig'
import { usePageMetadata } from '../hooks/usePageMetadata'
import {
  StudioCtaBanner,
  StudioPageHeader,
} from '../components/ui/StudioComponents'

export function TeamPage() {
  usePageMetadata(SEO_ROUTES.team)

  return (
    <div className="page-stack">
      <StudioPageHeader
        eyebrow="DSC SOFTWARE STUDIO · LEADERSHIP"
        title="Our Team"
        subtitle="Meet the founder and lead engineer behind Dark Skull Corporation’s Android applications, mobile games, and custom web development projects."
        actions={[
          { label: 'About Dark Skull Corporation', to: '/about', variant: 'secondary' },
          { label: 'Contact Studio', to: '/contact', variant: 'primary' },
        ]}
      />

      <section className="studio-section" aria-label="Founder and Lead Developer">
        <div className="section-heading">
          <div>
            <div className="eyebrow">STUDIO LEADERSHIP</div>
            <h2>Founder &amp; Lead Developer</h2>
          </div>
        </div>

        <article className="info-card founder-profile-card">
          <div className="studio-card-top">
            <span className="card-label">FOUNDER &amp; LEAD DEVELOPER</span>
            <span className="status-pill">Active Leadership</span>
          </div>

          <h3>Naveed Mushtaq — Founder &amp; Lead Developer</h3>

          <p className="studio-card-desc">
            <strong>Naveed Mushtaq</strong> founded Dark Skull Corporation in 2024 and leads
            product architecture, Android application engineering, mobile game development, and
            full-stack web software delivery across all DSC initiatives.
          </p>

          <ul className="feature-list studio-feature-list">
            <li>
              Lead engineer for DSC’s published Google Play titles, including{' '}
              <strong>QR Scanner | Generator</strong> and <strong>Mind Matrix</strong>
            </li>
            <li>
              Full-stack web and API systems architect for custom client websites and web
              applications
            </li>
            <li>
              Direct technical point of contact for custom software consultations, project
              quotations, and product support
            </li>
          </ul>

          <div className="card-actions studio-card-actions">
            <a
              className="button primary"
              href="https://naveedmushtaq.tech/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Developer Portfolio (naveedmushtaq.tech) ↗
            </a>
            <a
              className="button secondary"
              href="https://github.com/shahnaveed07"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub (@shahnaveed07) ↗
            </a>
          </div>
        </article>
      </section>

      <StudioCtaBanner
        eyebrow="COLLABORATE WITH DSC"
        title="Work Directly with Our Engineering Studio"
        description="Have a website, Android application, or game project in mind? Reach out to discuss your requirements with Dark Skull Corporation."
        primaryAction={{ label: 'Contact DSC', to: '/contact' }}
        secondaryAction={{ label: 'Explore Services', to: '/services' }}
      />
    </div>
  )
}
