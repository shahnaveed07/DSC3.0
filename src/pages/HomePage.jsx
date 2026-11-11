import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

export function HomePage({ systemStatus }) {
  usePageMetadata(SEO_ROUTES.home)

  const showHomeDownloadBtn = systemStatus?.showHomeDownloadBtn !== false

  return (
    <div className="page-stack">
      {/* 1. Concise Hero Section */}
      <section className="hero-card home-hero">
        <div className="hero-content">
          <div className="eyebrow">DARK SKULL CORPORATION · SOFTWARE STUDIO</div>
          <h1 className="home-hero-title">
            Building Practical Android Apps, Interactive Games &amp; Modern{' '}
            <span className="text-gradient">Digital Experiences</span>
          </h1>
          <p className="home-hero-lead">
            Dark Skull Corporation (DSC) is an independent software studio founded by{' '}
            <a
              href="https://naveedmushtaq.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-inline"
            >
              Naveed Mushtaq
            </a>
            . We release privacy-conscious Android utilities and offline-ready mobile games on
            Google Play, and engineer custom websites and applications for clients.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/products/in-production">
              Explore Our Apps &amp; Games
            </Link>
            <Link className="button secondary" to="/services">
              Explore Studio Services
            </Link>
            {showHomeDownloadBtn ? (
              <Link className="button ghost" to="/pages/downloads">
                Download Center
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Featured Android Applications & Games */}
      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">RELEASED ON GOOGLE PLAY</div>
            <h2>Featured Android Applications &amp; Games</h2>
          </div>
          <Link className="button ghost" to="/products/in-production">
            View Full Portfolio →
          </Link>
        </div>

        <div className="home-showcase-grid">
          <article className="info-card showcase-card">
            <div className="showcase-card-top">
              <div className="card-label">ANDROID APPLICATION</div>
              <span className="status-pill">Available on Google Play</span>
            </div>
            <h3>QR Scanner | Generator</h3>
            <p className="showcase-desc">
              A fast, privacy-focused QR code and barcode utility for Android. Scan physical codes
              instantly via the device camera or existing gallery images, and generate custom QR
              codes for URLs, Wi-Fi credentials, contacts, and plain text.
            </p>
            <ul className="feature-list">
              <li>Instant camera viewfinder &amp; gallery image recognition</li>
              <li>Custom QR code generator with direct image export</li>
              <li>Strictly scoped permissions with zero background tracking</li>
            </ul>
            <div className="card-actions showcase-actions">
              <a
                className="button primary"
                href="https://play.google.com/store/apps/details?id=com.dsc.qrscanner"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get on Google Play ↗
              </a>
              <Link className="button ghost" to="/projects/qr-scanner-generator">
                Project Details
              </Link>
            </div>
          </article>

          <article className="info-card showcase-card">
            <div className="showcase-card-top">
              <div className="card-label">ANDROID PUZZLE GAME</div>
              <span className="status-pill">Available on Google Play</span>
            </div>
            <h3>Mind Matrix</h3>
            <p className="showcase-desc">
              An interactive brain-training and pattern-recognition puzzle game for Android. Built
              to sharpen working memory, spatial recall, and cognitive focus through progressively
              challenging grid levels.
            </p>
            <ul className="feature-list">
              <li>Progressive difficulty tiers that adapt to player skill</li>
              <li>Smooth 60 FPS animations with tactile dark-mode visuals</li>
              <li>100% offline playable with zero paywalls</li>
            </ul>
            <div className="card-actions showcase-actions">
              <a
                className="button primary"
                href="https://play.google.com/store/apps/details?id=com.dsc.mindmatrix"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get on Google Play ↗
              </a>
              <Link className="button ghost" to="/projects/mind-matrix">
                Project Details
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* 3. Clean Overview of Development Services */}
      <section className="home-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">SOFTWARE STUDIO SERVICES</div>
            <h2>Development Services</h2>
          </div>
          <Link className="button ghost" to="/services">
            All Services &amp; Scope Options →
          </Link>
        </div>

        <div className="home-focus-grid">
          <article className="info-card focus-card">
            <div className="focus-card-header">
              <span className="focus-index">01</span>
              <span className="card-label">MOBILE ENGINEERING</span>
            </div>
            <h3>Android App Development</h3>
            <p>
              Native Android utilities and business applications engineered for fast startup,
              offline reliability, and strict permission boundaries.
            </p>
            <div className="card-actions">
              <Link className="button secondary" to="/services/android-applications">
                Android Service Scope →
              </Link>
            </div>
          </article>

          <article className="info-card focus-card">
            <div className="focus-card-header">
              <span className="focus-index">02</span>
              <span className="card-label">INTERACTIVE MEDIA</span>
            </div>
            <h3>Game Development</h3>
            <p>
              2D and 3D puzzle and logic games featuring responsive touch controls, progressive
              level design, and optimized frame rates across Android devices.
            </p>
            <div className="card-actions">
              <Link className="button secondary" to="/services/game-development">
                Game Service Scope →
              </Link>
            </div>
          </article>

          <article className="info-card focus-card">
            <div className="focus-card-header">
              <span className="focus-index">03</span>
              <span className="card-label">WEB ARCHITECTURE</span>
            </div>
            <h3>Custom Website Development</h3>
            <p>
              Responsive business websites, portfolios, and custom web applications available on
              request with deployment or source-handover options.
            </p>
            <div className="card-actions">
              <Link className="button secondary" to="/services/websites">
                Website Service Scope →
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* 4. Single Clear Contact / Project Inquiry CTA */}
      <section className="studio-cta-banner">
        <div className="studio-cta-content">
          <div className="eyebrow">START A PROJECT</div>
          <h2>Have a Website, Android App, or Game Project in Mind?</h2>
          <p>
            Share your project scope, target platform, and timeline with Dark Skull Corporation to
            receive a custom quotation tailored to your requirements.
          </p>
        </div>
        <div className="studio-cta-actions">
          <Link className="button primary" to="/contact">
            Request a Custom Quotation
          </Link>
          <Link className="button ghost" to="/about">
            About Dark Skull Corporation
          </Link>
        </div>
      </section>
    </div>
  )
}
