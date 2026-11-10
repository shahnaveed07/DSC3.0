import { usePageMeta } from '../hooks/usePageMeta'
import { FOUNDER_INFO, SEO_ROUTES } from '../content/seoConfig'
import {
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function TeamPage() {
  usePageMeta(SEO_ROUTES.team)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow="Dark Skull Corporation · Software Studio"
        title="Our Team"
        description="Learn about the leadership and engineering team behind Dark Skull Corporation."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Our Team' },
        ]}
        actions={[
          { label: 'About Dark Skull Corporation', to: '/about', variant: 'secondary' },
          { label: 'Contact Studio', to: '/contact', variant: 'primary' },
        ]}
      />

      {/* Verified Founder & Studio Leadership Section */}
      <section className="seo-section mt-36" aria-labelledby="founder-leadership-heading">
        <div className="seo-container">
          <StudioSectionHeader
            eyebrow="Studio Leadership"
            title="Founder & Lead Developer"
            description="Verified studio leadership information currently configured in Dark Skull Corporation:"
          />

          <div className="portal-callout-card mt-20">
            <div className="portal-callout-info">
              <span className="badge primary mb-8">Verified Leadership Profile</span>
              <h3 className="portal-callout-title">{FOUNDER_INFO.designation}</h3>
              <p className="portal-callout-desc">
                {FOUNDER_INFO.name} is the {FOUNDER_INFO.jobTitle} of Dark Skull Corporation, leading the studio&apos;s Android application development, game development, and custom web engineering work.
              </p>
            </div>
            <div className="portal-callout-actions">
              <a
                href={FOUNDER_INFO.url}
                target="_blank"
                rel="noreferrer"
                className="button button-primary button-sm"
              >
                Founder Portfolio ↗
              </a>
              <a
                href={FOUNDER_INFO.github}
                target="_blank"
                rel="noreferrer"
                className="button button-secondary button-sm"
              >
                GitHub (@shahnaveed07) ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Team Member Profiles Directory — Honest Empty State */}
      <section className="studio-section mt-36" aria-labelledby="team-profiles-heading">
        <StudioSectionHeader
          eyebrow="Team Directory Structure"
          title="Team Member Profiles"
          description="This section is structured to present verified team member profiles, designations, areas of expertise, profile photographs, and professional links."
        />

        <div className="mt-24">
          <StudioEmptyState
            badge="TEAM PROFILES DIRECTORY"
            title="Additional Team Member Profiles Pending"
            description="Individual team member cards, verified biographies, profile photographs, and professional links will be published here once official team profile data is provided in a subsequent phase."
            note="Dark Skull Corporation does not display fabricated biographies, placeholder names, or synthetic profile images."
            actions={[
              { label: 'Read About DSC Studio', to: '/about', variant: 'primary' },
              { label: 'Explore Studio Services', to: '/services', variant: 'secondary' },
              { label: 'Contact Studio', to: '/contact', variant: 'ghost' },
            ]}
          />
        </div>
      </section>

      <StudioCtaBanner
        eyebrow="Collaborate with DSC"
        title="Connect with Our Studio Team"
        description="Have a question about our Android applications, games, or custom development services? Reach out via our Contact page or official Discord community."
        actions={[
          { label: 'Contact Dark Skull Corporation', to: '/contact', variant: 'primary' },
          { label: 'Explore Products', to: '/products', variant: 'secondary' },
        ]}
      />
    </StudioPageContainer>
  )
}
