import { NavLink } from 'react-router-dom'
import { useRemoteResource } from '../hooks/useRemoteResource'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { getFreePanelStatus } from '../services/dscApi'

export function DownloadsPage({ systemStatus }) {
  usePageMeta(SEO_ROUTES.downloads)

  const { data, loading } = useRemoteResource(getFreePanelStatus, [])
  const freeLink =
    data?.freeLink || data?.FreeLink || systemStatus?.freeLink || systemStatus?.FreeLink
  const usedSlots = Number(data?.usedSlots || data?.UsedSlots || 0)
  const maxSlots = Number(data?.maxSlots || data?.MaxSlots || 20)
  const slotsAvailable = maxSlots - usedSlots > 0

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Official Apps, Games &amp; Software Downloads</h1>
        <p>
          Access our published Android applications and games on Google Play, as well as verified community and client software releases.
        </p>
      </section>

      {/* Downloads Grid */}
      <div className="downloads-grid mt-36">
        {/* QR Scanner Mobile */}
        <article className="download-card">
          <div>
            <div className="download-card-meta">
              <span className="badge primary">ANDROID APPLICATION</span>
              <span className="text-muted text-sm">Google Play Verified</span>
            </div>

            <h2 className="download-card-title">QR Scanner | Generator</h2>
            <p className="download-card-desc">
              Instant autofocus barcode detection and offline custom QR code creator for Android devices. Supports Wi-Fi networks, URLs, and contact vCards.
            </p>

            <div className="download-status-box mt-14 mb-16">
              <strong>Requirements:</strong> Android 7.0 (Nougat) or newer. Zero external telemetry.
            </div>
          </div>

          <div className="download-card-actions">
            <a
              className="button button-primary w-100"
              href="https://play.google.com/store/apps/details?id=com.dsc.qrscanner"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on Google Play ↗
            </a>
          </div>
        </article>

        {/* Mind Matrix */}
        <article className="download-card">
          <div>
            <div className="download-card-meta">
              <span className="badge primary">MOBILE GAME</span>
              <span className="text-muted text-sm">Google Play Verified</span>
            </div>

            <h2 className="download-card-title">Mind Matrix</h2>
            <p className="download-card-desc">
              Progressive cognitive training puzzle game with pattern recognition drills, memory sequences, and reflex challenges.
            </p>

            <div className="download-status-box mt-14 mb-16">
              <strong>Requirements:</strong> Android 6.0+ compatible. Fully playable offline.
            </div>
          </div>

          <div className="download-card-actions">
            <a
              className="button button-primary w-100"
              href="https://play.google.com/store/apps/details?id=com.dsc.mindmatrix"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get on Google Play ↗
            </a>
          </div>
        </article>

        {/* Free Panel Package */}
        <article className="download-card">
          <div>
            <div className="download-card-meta">
              <span className="badge primary">COMMUNITY EVALUATION</span>
              <span className="text-muted text-sm">
                {loading ? 'Checking slots...' : `${usedSlots} / ${maxSlots} Slots Used`}
              </span>
            </div>

            <h2 className="download-card-title">Free Panel Build</h2>
            <p className="download-card-desc">
              Public community evaluation release. Check server connectivity, view real-time slot availability, and download the verified evaluation package.
            </p>

            <div className="download-status-box mt-14 mb-16">
              <strong>Status:</strong> {slotsAvailable ? 'Slots currently open for evaluation.' : 'Public pool is currently at capacity.'}
            </div>
          </div>

          <div className="download-card-actions">
            {freeLink ? (
              <>
                <a
                  className="button button-primary w-100"
                  href={freeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">📥 </span>Download Free Panel Package
                </a>
                <NavLink to="/pages/freepanel" className="button button-secondary w-100">
                  View Shared Credentials
                </NavLink>
              </>
            ) : (
              <NavLink to="/pages/freepanel" className="button button-secondary w-100">
                Check Availability &amp; Credentials
              </NavLink>
            )}
          </div>
        </article>
      </div>

      {/* Authenticated Client Downloads Information */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge good mb-8">Client Portal</span>
          <h2>Licensed Product Downloads</h2>
          <p className="mb-16">
            Looking for your licensed product build (Streamer, Special, Sniper, Aim Assist)?
          </p>
          <div className="portal-callout-card">
            <div className="portal-callout-info">
              <p className="portal-callout-desc">
                Once your order payment is verified by an administrator, your download link and authorization key are automatically unlocked inside your authenticated <strong>Client Dashboard</strong>.
              </p>
            </div>
            <div className="portal-callout-actions">
              <NavLink to="/pages/ulogin" className="button button-primary button-sm">
                Sign In to Client Portal
              </NavLink>
              <NavLink to="/pages/catalog" className="button button-secondary button-sm">
                View Products Catalog
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements & Compatibility Guide */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge primary mb-8">Technical Requirements</span>
          <h2>Platform Compatibility &amp; Setup Guide</h2>

          <div className="card-grid columns-2 mt-20">
            <article className="info-card">
              <span className="card-badge">ANDROID &amp; WINDOWS</span>
              <h3>Supported Environments</h3>
              <ul className="feature-list">
                <li>Android Apps &amp; Games: Android 6.0 / 7.0 or newer via Google Play</li>
                <li>Windows Releases: Windows 10 or Windows 11 (64-bit)</li>
                <li>Runtime: Microsoft .NET Framework 4.8 for desktop packages</li>
                <li>Support: Direct assistance available on our official Discord server</li>
              </ul>
            </article>

            <article className="info-card">
              <span className="card-badge">INSTALLATION NOTICE</span>
              <h3>Independent Release Verification</h3>
              <p className="text-muted text-sm m-0">
                Our Android apps and games are distributed directly through Google Play. For standalone Windows builds distributed through our portal, Windows Defender SmartScreen may display an &ldquo;Unrecognized app&rdquo; prompt.
              </p>
              <p className="text-muted text-sm m-0 mt-6">
                Click <strong>More info</strong> and select <strong>Run anyway</strong>, or reach out on Discord if you need setup assistance.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
