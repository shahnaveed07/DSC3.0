export function FullScreenLoader({ message = 'Loading...', active = true }) {
  if (!active) return null

  return (
    <div
      className="fullscreen-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-modal="true"
    >
      <div className="fullscreen-loading-dialog">
        <div className="fullscreen-spinner" aria-hidden="true">
          <div className="fullscreen-spinner-track" />
          <div className="fullscreen-spinner-head" />
        </div>
        <p className="fullscreen-loading-message">{message}</p>
      </div>
    </div>
  )
}
