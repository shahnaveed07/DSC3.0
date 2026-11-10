import { Link, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

const statusStates = {
  update: {
    label: 'Software Update',
    title: 'Update temporarily unavailable',
    description: "We couldn't reach the current update server. Please try again shortly.",
  },
  maintenance: {
    label: 'System Maintenance',
    title: "We'll be back shortly",
    description: 'DSCWeb is temporarily unavailable while maintenance is being performed.',
  },
  unavailable: {
    label: 'Service Unavailable',
    title: 'This service is temporarily unavailable',
    description: 'Please try again shortly.',
  },
  deployment: {
    label: 'Deployment',
    title: 'Changes are being deployed',
    description: 'New changes are currently being deployed. Please try again shortly.',
  },
  default: {
    label: 'Notice',
    title: 'We are Working on New Updates',
    description: 'Please try again shortly.',
  },
}

export function StatusPage() {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const state = statusStates[typeParam] || statusStates.default

  usePageMeta({
    ...SEO_ROUTES.status,
    title: typeParam ? `System Status — ${state.label} | DSC` : SEO_ROUTES.status.title,
    description: typeParam ? state.description : SEO_ROUTES.status.description,
  })

  return (
    <section className="status-layout">
      <div className="panel status-panel">
        <Link className="status-brand" to="/" aria-label="Dark Skull Corporation Home">
          <picture>
            <source srcSet="/images/dsclogo.webp" type="image/webp" />
            <img src="/images/dsclogo.png" alt="Dark Skull Corporation logo" className="status-logo" width="48" height="48" />
          </picture>
        </Link>

        <div className="status-content">
          <span className="card-badge status-badge">{state.label}</span>
          <h1>{state.title}</h1>
          <p>{state.description}</p>
        </div>

        <div className="status-actions" aria-label="Status page actions">
          <button className="button button-primary" type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
          <Link className="button button-ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
