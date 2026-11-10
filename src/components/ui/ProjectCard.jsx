import { NavLink } from 'react-router-dom'

/**
 * Reusable Software Studio Project Card component (Phase 2).
 * Renders a canonical project record consistently across /products,
 * /products/in-production, /products/own-products, and /products/built-by-dsc.
 */
export function ProjectCard({
  project,
  headingLevel = 'h3',
  showFullDescription = false,
  showFeatures = false,
  showPermissionsNotice = false,
  detailActionLabel = 'View Project',
}) {
  if (!project) return null

  const HeadingTag = headingLevel
  const detailPath = project.slug ? `/projects/${project.slug}` : null
  const externalUrl = project.liveUrl || project.storeUrl
  const externalLabel =
    project.liveLabel || project.storeLabel || (project.liveUrl ? 'Live Website ↗' : 'Google Play ↗')

  return (
    <article
      className="studio-project-card"
      data-testid={`project-card-${project.slug || project.id}`}
    >
      <div className="studio-project-card-top">
        <div className="studio-project-identity">
          {project.icon ? (
            <div className="studio-project-icon-wrap">
              <picture>
                {project.icon.webp ? (
                  <source srcSet={project.icon.webp} type="image/webp" />
                ) : null}
                <img
                  src={project.icon.png || project.icon.src}
                  alt={project.icon.alt || `${project.name} icon`}
                  className="studio-project-icon"
                  width="48"
                  height="48"
                  loading="lazy"
                />
              </picture>
            </div>
          ) : null}

          <div className="studio-project-title-group">
            <div className="studio-project-badges">
              <span className="badge primary">
                {project.typeBadge || project.projectType}
              </span>
              {project.productionStatus ? (
                <span className="badge good">{project.productionStatus}</span>
              ) : null}
            </div>

            <HeadingTag className="studio-project-title">
              {detailPath ? (
                <NavLink to={detailPath} className="studio-project-title-link">
                  {project.name}
                </NavLink>
              ) : (
                project.name
              )}
            </HeadingTag>
          </div>
        </div>
      </div>

      {project.shortDescription ? (
        <p className="studio-project-tagline">{project.shortDescription}</p>
      ) : null}

      {showFullDescription && project.description ? (
        <p className="studio-project-desc">{project.description}</p>
      ) : !project.shortDescription && project.description ? (
        <p className="studio-project-desc">{project.description}</p>
      ) : null}

      {/* Metadata Strip: Ownership & Platforms */}
      {project.ownership || (Array.isArray(project.platforms) && project.platforms.length > 0) ? (
        <div className="studio-project-meta-row">
          {project.ownership ? (
            <span className="studio-project-meta-item">
              <strong>Owner:</strong> {project.ownership}
            </span>
          ) : null}
          {Array.isArray(project.platforms) && project.platforms.length > 0 ? (
            <span className="studio-project-meta-item">
              <strong>Platform:</strong> {project.platforms.join(', ')}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Technology Tags */}
      {Array.isArray(project.technologies) && project.technologies.length > 0 ? (
        <div className="studio-card-meta-strip" aria-label="Technologies">
          {project.technologies.map((tech) => (
            <span key={tech} className="studio-card-meta-pill">
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      {/* Optional Feature List */}
      {showFeatures && Array.isArray(project.features) && project.features.length > 0 ? (
        <div className="app-feature-grid mt-14 mb-14">
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

      {/* Optional Permissions Transparency Notice */}
      {showPermissionsNotice && project.permissionsNotice ? (
        <div className="app-notice-box mb-16">
          <strong>Permissions Transparency:</strong> {project.permissionsNotice}
        </div>
      ) : null}

      {/* Card Actions */}
      <div className="studio-project-actions">
        {detailPath ? (
          <NavLink
            to={detailPath}
            className="button button-primary button-sm"
          >
            {detailActionLabel}
          </NavLink>
        ) : null}

        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`button ${detailPath ? 'button-secondary' : 'button-primary'} button-sm`}
          >
            {externalLabel}
          </a>
        ) : null}

        {project.repositoryUrl ? (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-ghost button-sm"
          >
            Repository ↗
          </a>
        ) : null}
      </div>
    </article>
  )
}
