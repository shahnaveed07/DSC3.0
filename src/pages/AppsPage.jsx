import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'

export function AppsPage() {
  usePageMeta(SEO_ROUTES.apps)

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Android Applications &amp; Games</h1>
        <p>
          Explore official Android applications and mobile games designed and developed by Dark Skull Corporation with a focus on usability, performance, offline capability, and user privacy.
        </p>
      </section>

      {/* Applications & Games Showcase */}
      <div className="apps-list mt-36">
        {/* App 1: QR Scanner | Generator */}
        <article className="app-card">
          <div className="app-card-header">
            <div>
              <span className="badge primary">ANDROID APPLICATION</span>
              <h2 className="app-card-title">QR Scanner | Generator</h2>
            </div>
            <div>
              <a
                className="button button-primary"
                href="https://play.google.com/store/apps/details?id=com.dsc.qrscanner"
                target="_blank"
                rel="noreferrer"
              >
                Google Play ↗
              </a>
            </div>
          </div>

          <p className="app-card-tagline">
            High-speed camera scanner &amp; customizable barcode/QR generator for Android.
          </p>
          <p className="app-card-desc">
            Instantly scan barcodes and QR codes with autofocus detection. Generate custom, styled QR codes from website links, Wi-Fi network credentials, contact cards (vCard), phone numbers, and plain text without needing an active internet connection.
          </p>

          <div className="app-feature-grid">
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Autofocus real-time camera viewfinder</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>100% offline generation engine</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Wi-Fi, URL, Text, and vCard formats</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Direct share, copy &amp; save to device</span>
            </div>
          </div>

          <div className="app-notice-box">
            <strong>Permissions Transparency:</strong> Camera access is requested strictly when the scanner viewfinder is active. Storage permission is requested only when exporting a generated QR image file to your gallery. No location data or contacts are ever uploaded.
          </div>
        </article>

        {/* App 2: Mind Matrix */}
        <article className="app-card">
          <div className="app-card-header">
            <div>
              <span className="badge primary">MOBILE LOGIC GAME</span>
              <h2 className="app-card-title">Mind Matrix</h2>
            </div>
            <div>
              <a
                className="button button-primary"
                href="https://play.google.com/store/apps/details?id=com.dsc.mindmatrix"
                target="_blank"
                rel="noreferrer"
              >
                Google Play ↗
              </a>
            </div>
          </div>

          <p className="app-card-tagline">
            Cognitive puzzle game with logic, memory, pattern recognition, and reaction drills.
          </p>
          <p className="app-card-desc">
            Mind Matrix is a handcrafted logic game engineered for players who enjoy mental exercises. Features progressive difficulty scaling across multiple challenge modes designed to train short-term memory, pattern recognition, and cognitive reflexes.
          </p>

          <div className="app-feature-grid">
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Progressive cognitive difficulty scaling</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>100% offline playable without internet</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Smooth 60 FPS animations &amp; tactile touch</span>
            </div>
            <div className="app-feature-item">
              <span className="app-feature-check">✓</span>
              <span>Zero pay-to-win mechanics or paywalls</span>
            </div>
          </div>
        </article>
      </div>

      {/* Studio Quality & Privacy Constitution */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge good mb-8">Studio Standards</span>
          <h2>Our App &amp; Game Quality Constitution</h2>
          <p className="mb-24">
            We design Android applications, games, and digital products around user respect and long-term reliability:
          </p>

          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">PRIVACY FIRST</span>
              <h3>Scoped Permissions</h3>
              <p className="text-muted text-sm m-0">
                Our Android applications and games request only the permissions required for user-invoked features and never harvest personal contacts or background telemetry.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">PERFORMANCE</span>
              <h3>Offline-Ready &amp; Fast</h3>
              <p className="text-muted text-sm m-0">
                We build our mobile apps and games for responsive touch feedback, low battery consumption, and reliable offline operation.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">CUSTOM PROJECTS</span>
              <h3>Websites on Request</h3>
              <p className="text-muted text-sm m-0">
                Alongside our Android apps and games, Dark Skull Corporation designs and develops custom websites for individuals, startups, and businesses on request.
              </p>
            </article>
          </div>

          <div className="portal-callout-card mt-24">
            <div className="portal-callout-info">
              <h3 className="portal-callout-title">Have an App, Game, or Website Project Inquiry?</h3>
              <p className="portal-callout-desc">
                Connect with <strong>Naveed Mushtaq </strong> and the Dark Skull Corporation team to discuss custom website development, Android applications, or studio collaborations.
              </p>
            </div>
            <div className="portal-callout-actions">
              <NavLink to="/pages/contact" className="button button-primary button-sm">
                Contact Studio
              </NavLink>
              <NavLink to="/pages/downloads" className="button button-secondary button-sm">
                Download Center
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
