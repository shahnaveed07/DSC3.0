export function PageSection({
  eyebrow,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(eyebrow || title || description) && (
        <div className="section-header">
          {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}
