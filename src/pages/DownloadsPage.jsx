import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

export function DownloadsPage({ systemStatus }) {
  usePageMetadata(SEO_ROUTES.downloads)

  const latestVersion = systemStatus?.latestVersion || '2.0'
  const freeLink = systemStatus?.freeLink || ''

  return (
    <div className="page-stack">
      <div className="page-header-center">
        <div className="eyebrow">RELEASE ARCHIVES</div>
        <h1>Download Center</h1>
        <p className="lead">
          Official download links for Dark Skull Corporation Android applications, games, and
          evaluation builds. Current desktop release version: <strong>v{latestVersion}</strong>.
        </p>
      </div>

      <div className="downloads-grid">
        <article className="download-card">
          <div className="card-label">ANDROID UTILITY APP</div>
          <h3>QR Scanner | Generator</h3>
          <p>
            Official Google Play release for Android phones and tablets (Android 7.0+). Scan QR
            codes and barcodes via camera or gallery, and generate custom QR codes offline.
          </p>
          <div className="card-actions">
            <a
              className="button primary full-width"
              href="https://play.google.com/store/apps/details?id=com.dsc.qrscanner"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on Google Play ↗
            </a>
          </div>
        </article>

        <article className="download-card">
          <div className="card-label">ANDROID PUZZLE GAME</div>
          <h3>Mind Matrix</h3>
          <p>
            Official Google Play release for Android devices. Challenge your memory and cognitive
            focus with progressive pattern-recognition puzzle grids that work 100% offline.
          </p>
          <div className="card-actions">
            <a
              className="button primary full-width"
              href="https://play.google.com/store/apps/details?id=com.dsc.mindmatrix"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on Google Play ↗
            </a>
          </div>
        </article>

        <article className="download-card">
          <div className="card-label">COMMUNITY EVALUATION</div>
          <h3>Free Panel Build</h3>
          <p>
            Shared evaluation build for Windows 10/11 (64-bit). Check live slot availability and
            shared test credentials on the Free Panel page before downloading.
          </p>
          <div className="card-actions">
            {freeLink ? (
              <a
                className="button primary full-width"
                href={freeLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Free Build
              </a>
            ) : (
              <Link className="button secondary full-width" to="/pages/freepanel">
                Check Free Panel Status
              </Link>
            )}
          </div>
        </article>
      </div>

      <section className="studio-section" aria-label="Compatibility and Client Downloads">
        <div className="studio-grid-2">
          <article className="info-card">
            <div className="card-label">PLATFORM COMPATIBILITY</div>
            <h2>System Requirements &amp; Setup</h2>
            <ul className="feature-list mt-12">
              <li>
                <strong>Android Applications &amp; Games:</strong> Require Android 7.0 (Nougat) or
                newer and install directly via the Google Play Store.
              </li>
              <li>
                <strong>Windows Desktop Builds:</strong> Require Windows 10 or Windows 11 (64-bit)
                with Microsoft .NET Framework 4.8 installed.
              </li>
              <li>
                <strong>Archive Extraction:</strong> Extract desktop <code>.zip</code> archives to a
                dedicated folder before running the executable.
              </li>
            </ul>
          </article>

          <article className="info-card">
            <div className="card-label">LICENSED CLIENT BUILDS</div>
            <h2>Authenticated Dashboard Downloads</h2>
            <p>
              Private software panel builds (Streamer, Special, Sniper, Aim Assist, Customised) are
              delivered through the authenticated User Dashboard after order verification.
            </p>
            <div className="card-actions mt-18">
              <Link className="button primary" to="/pages/ulogin">
                Client Portal Login
              </Link>
              <Link className="button ghost" to="/contact">
                Support &amp; Help
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
