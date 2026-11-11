import { useParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  buildProjectSeoConfig,
  getAllProjects,
  getProjectBySlug,
} from '../content/projectsData'
import {
  ProjectCard,
  StudioCtaBanner,
  StudioEmptyState,
  StudioPageContainer,
  StudioPageHeader,
  StudioSectionHeader,
} from '../components/ui/StudioComponents'

export function ProjectDetailPage({ projectSlug }) {
  const params = useParams()
  const activeSlug = projectSlug || params.slug || ''
  const project = getProjectBySlug(activeSlug)

  const seoConfig = buildProjectSeoConfig(project, SEO_ROUTES)
  usePageMeta(seoConfig)

  if (!project) {
    return (
      <StudioPageContainer>
        <StudioPageHeader
          eyebrow="Dark Skull Corporation · Portfolio"
          title="Project Not Found"
          description="The requested project entry could not be found in the verified Dark Skull Corporation portfolio directory."
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/products' },
            { label: 'Not Found' },
          ]}
        />

        <div className="mt-36">
          <StudioEmptyState
            badge="PORTFOLIO LOOKUP"
            title="Unrecognized Project Identifier"
            description="Only verified projects with confirmed production status or studio ownership are published in the DSC portfolio."
            actions={[
              { label: 'Products & Portfolio Overview', to: '/products', variant: 'primary' },
              { label: 'In Production Releases', to: '/products/in-production', variant: 'secondary' },
              { label: 'Own Products', to: '/products/own-products', variant: 'ghost' },
            ]}
          />
        </div>
      </StudioPageContainer>
    )
  }

  const externalUrl = project.liveUrl || project.storeUrl
  const externalLabel =
    project.liveLabel || project.storeLabel || (project.liveUrl ? 'Open Live Project ↗' : 'View on Google Play ↗')

  const relatedProjects = getAllProjects().filter((item) => item.slug !== project.slug)

  return (
    <StudioPageContainer>
      <StudioPageHeader
        eyebrow={`Dark Skull Corporation · ${project.projectType}`}
        title={project.name}
        description={project.shortDescription}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: 'In Production', to: '/products/in-production' },
          { label: project.name },
        ]}
        actions={[
          ...(externalUrl
            ? [{ label: externalLabel, href: externalUrl, variant: 'primary' }]
            : []),
          { label: 'In Production', to: '/products/in-production', variant: 'secondary' },
          { label: 'Own Products', to: '/products/own-products', variant: 'ghost' },
        ]}
      />

      {/* Project Overview & Verified Metadata */}
      <section className="seo-section mt-36" aria-labelledby="project-overview-heading">
        <div className="seo-container">
          <div className="studio-project-detail-head">
            {project.icon ? (
              <div className="studio-project-detail-icon-wrap">
                <picture>
                  {project.icon.webp ? (
                    <source srcSet={project.icon.webp} type="image/webp" />
                  ) : null}
                  <img
                    src={project.icon.png || project.icon.src}
                    alt={project.icon.alt || `${project.name} icon`}
                    className="studio-project-detail-icon"
                    width="64"
                    height="64"
                    loading="eager"
                  />
                </picture>
              </div>
            ) : null}

            <div className="studio-project-detail-titles">
              <div className="studio-project-badges mb-8">
                <span className="badge primary">{project.typeBadge || project.projectType}</span>
                {project.productionStatus ? (
                  <span className="badge good">{project.productionStatus}</span>
                ) : null}
              </div>
              <h2 id="project-overview-heading" className="studio-section-title m-0">
                Project Overview
              </h2>
            </div>
          </div>

          <p className="studio-section-desc mt-16 mb-24">{project.description}</p>

          {/* Verified Project Specifications */}
          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">CLASSIFICATION</span>
              <h3>Type &amp; Status</h3>
              <p className="text-muted text-sm m-0">
                <strong>Project Type:</strong> {project.projectType}
              </p>
              {project.productionStatus ? (
                <p className="text-muted text-sm m-0">
                  <strong>Status:</strong> {project.productionStatus}
                </p>
              ) : null}
              {Array.isArray(project.portfolioCategory) && project.portfolioCategory.length > 0 ? (
                <p className="text-muted text-sm m-0">
                  <strong>Categories:</strong> {project.portfolioCategory.join(', ')}
                </p>
              ) : null}
            </article>

            <article className="info-card">
              <span className="card-badge">PROVENANCE</span>
              <h3>Ownership &amp; Package</h3>
              {project.ownership ? (
                <p className="text-muted text-sm m-0">
                  <strong>Owner:</strong> {project.ownership}
                </p>
              ) : null}
              {project.packageId ? (
                <p className="text-muted text-sm m-0">
                  <strong>Package ID:</strong> <code>{project.packageId}</code>
                </p>
              ) : null}
              <p className="text-muted text-sm m-0">
                <strong>Publisher:</strong>{' '}
                {project.publisher || project.ownership || 'Dark Skull Corporation'}
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">PLATFORM</span>
              <h3>Target Environment</h3>
              {Array.isArray(project.platforms) && project.platforms.length > 0 ? (
                <p className="text-muted text-sm m-0">
                  <strong>Platforms:</strong> {project.platforms.join(', ')}
                </p>
              ) : null}
              {project.downloadRequirements ? (
                <p className="text-muted text-sm m-0">
                  <strong>Compatibility:</strong> {project.downloadRequirements}
                </p>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      {/* Features & Technical Stack */}
      <section className="seo-section" aria-labelledby="project-features-heading">
        <div className="seo-container">
          <div className="studio-two-col-grid">
            {Array.isArray(project.features) && project.features.length > 0 ? (
              <div className="studio-architecture-box">
                <span className="card-badge">CAPABILITIES</span>
                <h2 id="project-features-heading">Key Features</h2>
                <ul className="feature-list mt-12">
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {Array.isArray(project.technologies) && project.technologies.length > 0 ? (
              <div className="studio-architecture-box">
                <span className="card-badge">TECHNICAL ARCHITECTURE</span>
                <h2>Technologies &amp; Engineering</h2>
                <p className="text-muted text-sm mb-14">
                  Documented technical components and platform capabilities utilized in {project.name}:
                </p>
                <div className="studio-card-meta-strip">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="studio-card-meta-pill">
                      {tech}
                    </span>
                  ))}
                </div>
                {externalUrl ? (
                  <div className="mt-20">
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-primary button-sm"
                    >
                      {externalLabel}
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {project.permissionsNotice ? (
            <div className="app-notice-box mt-24">
              <strong>Permissions Transparency:</strong> {project.permissionsNotice}
            </div>
          ) : null}
        </div>
      </section>

      {/* Related Verified Studio Projects */}
      {relatedProjects.length > 0 ? (
        <section className="studio-section mt-36" aria-labelledby="related-projects-heading">
          <StudioSectionHeader
            eyebrow="More From Dark Skull Corporation"
            title="Other Verified Studio Projects"
            description="Explore additional verified applications and games developed by Dark Skull Corporation."
          />
          <div className="studio-two-col-grid mt-20">
            {relatedProjects.map((rel) => (
              <ProjectCard key={rel.id} project={rel} />
            ))}
          </div>
        </section>
      ) : null}

      <StudioCtaBanner
        eyebrow="Dark Skull Corporation · Portfolio"
        title="Explore All Portfolio Categories or Contact DSC"
        description="Browse our complete In Production, Own Products, and Built by DSC directories, or reach out to discuss a custom software project."
        actions={[
          { label: 'All Products & Portfolio', to: '/products', variant: 'primary' },
          { label: 'Android Apps Page', to: '/pages/apps', variant: 'secondary' },
          { label: 'Contact Studio', to: '/contact', variant: 'ghost' },
        ]}
      />
    </StudioPageContainer>
  )
}
