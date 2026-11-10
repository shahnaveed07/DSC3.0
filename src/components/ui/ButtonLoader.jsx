export function ButtonLoader({ loading, loadingText, children, className = '' }) {
  if (loading) {
    return (
      <span className={`button-loading-content ${className}`}>
        <span className="spinner-inline" aria-hidden="true" />
        {loadingText ? <span>{loadingText}</span> : null}
      </span>
    )
  }

  return children
}
