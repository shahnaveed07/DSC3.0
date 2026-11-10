import { NavLink } from 'react-router-dom'
import { ButtonLink } from '../layout/SiteHeader'
import { ProjectCard } from './ProjectCard'

export { ProjectCard }

/**
 * Responsive page container for DSC Software Studio pages.
 */
export function StudioPageContainer({ children, className = '' }) {
  return <div className={`center-wrap studio-page-container ${className}`.trim()}>{children}</div>
}

/**
 * Accessible breadcrumb navigation bar.
 */
export function StudioBreadcrumbs({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <nav className="studio-breadcrumbs" aria-label="Breadcrumb">
      <ol className="studio-breadcrumb-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={item.label || idx} className="studio-breadcrumb-item">
              {item.to && !isLast ? (
                <NavLink to={item.to} className="studio-breadcrumb-link">
                  {item.label}
                </NavLink>
              ) : (
                <span
                  className="studio-breadcrumb-current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="studio-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Consistent Software Studio page header with eyebrow, H1 title, description, and optional actions.
 */
export function StudioPageHeader({
  eyebrow = 'Dark Skull Corporation',
  title,
  description,
  actions = [],
  breadcrumbs = [],
}) {
  return (
    <header className="studio-page-header">
      <StudioBreadcrumbs items={breadcrumbs} />
      <div className="page-header-center studio-header-box">
        {eyebrow ? <span className="hero-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {Array.isArray(actions) && actions.length > 0 ? (
          <div className="studio-header-actions">
            {actions.map((action, idx) => (
              <ButtonLink
                key={action.label || idx}
                action={action}
                className={
                  action.variant === 'secondary'
                    ? 'button button-secondary'
                    : action.variant === 'ghost'
                      ? 'button button-ghost'
                      : 'button button-primary'
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}

/**
 * Consistent section heading for inner page sections.
 */
export function StudioSectionHeader({ eyebrow, title, description, badge }) {
  return (
    <div className="studio-section-header">
      <div className="studio-section-title-group">
        {eyebrow || badge ? (
          <div className="studio-section-eyebrow-row">
            {eyebrow ? <span className="section-eyebrow m-0">{eyebrow}</span> : null}
            {badge ? <span className="badge primary">{badge}</span> : null}
          </div>
        ) : null}
        {title ? <h2 className="studio-section-title">{title}</h2> : null}
      </div>
      {description ? <p className="studio-section-desc">{description}</p> : null}
    </div>
  )
}

/**
 * Reusable category card for Products and Services overview & directory pages.
 */
export function StudioCategoryCard({
  categoryLabel,
  badge,
  title,
  description,
  highlights = [],
  metaItems = [],
  action,
  secondaryAction,
}) {
  return (
    <article className="product-category-card studio-category-card">
      <div className="product-category-top">
        <div className="product-category-meta">
          {categoryLabel ? (
            <span className="product-category-number">{categoryLabel}</span>
          ) : null}
          {badge ? <span className="badge primary">{badge}</span> : null}
        </div>
      </div>

      <h2 className="product-category-title">{title}</h2>
      <p className="product-category-desc">{description}</p>

      {Array.isArray(metaItems) && metaItems.length > 0 ? (
        <div className="studio-card-meta-strip">
          {metaItems.map((meta) => (
            <span key={meta} className="studio-card-meta-pill">
              {meta}
            </span>
          ))}
        </div>
      ) : null}

      {Array.isArray(highlights) && highlights.length > 0 ? (
        <ul className="product-features mb-24">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {action || secondaryAction ? (
        <div className="product-action-wrap studio-card-actions">
          {action ? (
            <ButtonLink
              action={action}
              className="button button-primary w-100"
            />
          ) : null}
          {secondaryAction ? (
            <ButtonLink
              action={secondaryAction}
              className="button button-secondary w-100"
            />
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/**
 * Honest empty state card when verified portfolio or team entries are not yet populated.
 */
export function StudioEmptyState({
  badge = 'STUDIO DIRECTORY',
  title,
  description,
  note,
  actions = [],
}) {
  return (
    <section className="websites-empty-card studio-empty-state" aria-live="polite">
      <div className="websites-empty-icon-wrap">
        <picture>
          <source srcSet="/images/dsclogo2.webp" type="image/webp" />
          <img
            src="/images/dsclogo2.png"
            alt="Dark Skull Corporation"
            className="websites-empty-logo"
            width="64"
            height="64"
            loading="lazy"
          />
        </picture>
      </div>

      {badge ? <span className="badge primary mb-10">{badge}</span> : null}
      <h2 className="websites-empty-title">{title}</h2>
      <p className="websites-empty-desc">{description}</p>
      {note ? <p className="studio-empty-note">{note}</p> : null}

      {Array.isArray(actions) && actions.length > 0 ? (
        <div className="websites-empty-actions">
          {actions.map((act, idx) => (
            <ButtonLink
              key={act.label || idx}
              action={act}
              className={
                act.variant === 'secondary'
                  ? 'button button-secondary'
                  : act.variant === 'ghost'
                    ? 'button button-ghost'
                    : 'button button-primary'
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

/**
 * Consistent Call-To-Action section for the bottom of Software Studio pages.
 */
export function StudioCtaBanner({ eyebrow = 'Dark Skull Corporation', title, description, actions = [] }) {
  return (
    <section className="about-cta-card studio-cta-banner">
      {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
      <h2 className="about-cta-title">{title}</h2>
      <p className="about-cta-desc">{description}</p>
      {Array.isArray(actions) && actions.length > 0 ? (
        <div className="about-cta-actions">
          {actions.map((act, idx) => (
            <ButtonLink
              key={act.label || idx}
              action={act}
              className={
                act.variant === 'secondary'
                  ? 'button button-secondary'
                  : act.variant === 'ghost'
                    ? 'button button-ghost'
                    : 'button button-primary'
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
