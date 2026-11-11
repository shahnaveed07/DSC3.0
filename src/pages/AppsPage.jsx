import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

const androidApps = [
  {
    id: 'qr-scanner',
    category: 'Android Utility Application',
    title: 'QR Scanner | Generator',
    packageId: 'com.dsc.qrscanner',
    status: 'Available on Google Play',
    summary:
      'A fast, privacy-focused QR code and barcode utility for Android. Scan physical codes through your camera viewfinder or decode images from your gallery, and generate custom QR codes for URLs, Wi-Fi networks, contacts, and plain text.',
    features: [
      'Real-time camera viewfinder recognition for QR codes and standard barcodes',
      'Decode QR images directly from saved device screenshots and photos',
      'Built-in QR code generator for links, Wi-Fi credentials, vCards, and text',
      'Export and share generated QR graphics in crisp PNG format',
      'Offline core functionality with zero background tracking',
    ],
    permissionsNotice:
      'Permissions Transparency: Camera access is used strictly when scanning physical codes. Storage access is requested only when exporting or reading QR image files.',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
    detailPath: '/projects/qr-scanner-generator',
  },
  {
    id: 'mind-matrix',
    category: 'Android Puzzle & Brain Game',
    title: 'Mind Matrix',
    packageId: 'com.dsc.mindmatrix',
    status: 'Available on Google Play',
    summary:
      'An interactive brain-training and pattern-recognition puzzle game for Android. Challenge your working memory, spatial recall, and cognitive focus across progressively complex matrix grids.',
    features: [
      'Progressive difficulty levels that scale with player accuracy and speed',
      'Pattern-recall, sequence logic, and spatial memory matrix challenges',
      'Smooth 60 FPS animations with clean dark-mode visuals and tactile feedback',
      '100% offline playable — enjoy full puzzle sessions anywhere without internet',
      'Lightweight install size optimized for phones and tablets (Android 7.0+)',
    ],
    permissionsNotice:
      'Permissions Transparency: Mind Matrix requires no camera, microphone, location, or contact permissions and runs completely offline.',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
    detailPath: '/projects/mind-matrix',
  },
]

export function AppsPage() {
  usePageMetadata(SEO_ROUTES.apps)

  return (
    <div className="page-stack">
      <section className="hero-block">
        <div className="eyebrow">PRODUCTS · ANDROID APPLICATIONS</div>
        <h1>Android Applications &amp; Games</h1>
        <p className="lead">
          Official Android utilities and interactive puzzle games engineered by Dark Skull
          Corporation and published on the Google Play Store.
        </p>
        <div className="hero-actions mt-18">
          <Link className="button secondary" to="/products/in-production">
            In Production Portfolio
          </Link>
          <Link className="button ghost" to="/services/android-applications">
            Android Development Services →
          </Link>
        </div>
      </section>

      <div className="stack-list">
        {androidApps.map((app) => (
          <article className="info-card app-detail-card" key={app.id}>
            <div className="app-detail-header">
              <div>
                <div className="card-label">{app.category}</div>
                <h2>{app.title}</h2>
                <div className="package-badge">Package ID: {app.packageId}</div>
              </div>
              <span className="status-pill">{app.status}</span>
            </div>

            <p className="app-summary">{app.summary}</p>

            <div className="app-features-block">
              <h3 className="subhead">Key Capabilities &amp; Features</h3>
              <ul className="feature-list">
                {app.features.map((feat) => (
                  <li key={feat}>{feat}</li>
                ))}
              </ul>
            </div>

            <div className="permissions-callout">
              <p>{app.permissionsNotice}</p>
            </div>

            <div className="card-actions mt-18">
              <a
                className="button primary"
                href={app.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get on Google Play ↗
              </a>
              <Link className="button secondary" to={app.detailPath}>
                View Project Details
              </Link>
              <Link className="button ghost" to="/pages/privacy-policy">
                App Privacy Policy
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
