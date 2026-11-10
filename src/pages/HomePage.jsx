import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { ButtonLink } from '../components/layout/SiteHeader'

export function HomePage({ systemStatus }) {
  usePageMeta(SEO_ROUTES.home)

  const isMaintenance =
    systemStatus?.isMaintenanceMode === true || systemStatus?.IsMaintenanceMode === true

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero-v2">
        <div className="home-hero-content">
          <div className="hero-eyebrow-row">
            <span className="hero-eyebrow">DARK SKULL CORPORATION</span>
            <span className="hero-dot">·</span>
            <span className="hero-subkicker">SOFTWARE STUDIO</span>
            <span className="hero-dot">·</span>
            <span className={`status-pill-inline ${isMaintenance ? 'text-warning' : 'text-success'}`}>
              <span className="status-dot-inline" />
              {isMaintenance ? 'System Maintenance' : 'Systems Operational'}
            </span>
          </div>

          <h1 className="home-hero-title">
            Building <span className="text-highlight">Apps, Games</span> &amp; Digital Experiences.
          </h1>

          <p className="home-hero-desc">
            We create Android applications and engaging games, while also building custom websites for individuals and businesses on request.
          </p>

          <div className="home-hero-actions">
            <NavLink to="/pages/apps" className="button button-primary button-lg">
              Explore Our Apps &amp; Games
            </NavLink>
            <NavLink to="/products" className="button button-secondary button-lg">
              View Our Products
            </NavLink>
            <NavLink to="/contact" className="button button-ghost button-lg">
              Request a Website
            </NavLink>
          </div>
        </div>

        {/* Hero Capability Strip */}
        <div className="hero-capability-grid">
          <div className="hero-cap-item">
            <span className="hero-cap-num">01</span>
            <div className="hero-cap-text">
              <strong>Android App Development</strong>
              <span>Intuitive mobile tools &amp; offline utilities</span>
            </div>
          </div>
          <div className="hero-cap-item">
            <span className="hero-cap-num">02</span>
            <div className="hero-cap-text">
              <strong>Game Development</strong>
              <span>Mind Matrix puzzle &amp; interactive experiences</span>
            </div>
          </div>
          <div className="hero-cap-item">
            <span className="hero-cap-num">03</span>
            <div className="hero-cap-text">
              <strong>Custom Website Development</strong>
              <span>Websites for individuals &amp; businesses on request</span>
            </div>
          </div>
          <div className="hero-cap-item">
            <span className="hero-cap-num">04</span>
            <div className="hero-cap-text">
              <strong>Software &amp; Client Portal</strong>
              <span>Verified releases, products &amp; community access</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="home-divider" />

      {/* Studio Focus Cards */}
      <section className="home-section home-disciplines-section">
        <div className="section-head-v2">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Studio Focus</span>
            <h2 className="section-title-v2">What We Build</h2>
          </div>
          <p className="section-subtitle-v2">
            Dark Skull Corporation (DSC) is an independent software development studio focused on usability, performance, quality, and practical real-world applications.
          </p>
        </div>

        <div className="disciplines-grid">
          <article className="discipline-card">
            <div className="discipline-num">01</div>
            <span className="discipline-category">Primary Focus</span>
            <h3 className="discipline-title">Android App Development</h3>
            <p className="discipline-text">
              Designing and developing Android applications with intuitive interfaces, useful features and dependable performance.
            </p>
          </article>

          <article className="discipline-card">
            <div className="discipline-num">02</div>
            <span className="discipline-category">Primary Focus</span>
            <h3 className="discipline-title">Game Development</h3>
            <p className="discipline-text">
              Creating engaging games and interactive experiences with thoughtful gameplay, polished interfaces and continuous refinement.
            </p>
          </article>

          <article className="discipline-card">
            <div className="discipline-num">03</div>
            <span className="discipline-category">On Request</span>
            <h3 className="discipline-title">Custom Website Development</h3>
            <p className="discipline-text">
              Building responsive websites for individuals, startups, businesses and companies on request.
            </p>
          </article>
        </div>
      </section>

      <hr className="home-divider" />

      {/* Featured Projects Showcase */}
      <section className="home-section">
        <div className="section-head-v2">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Official Portfolio</span>
            <h2 className="section-title-v2">Featured Apps, Games &amp; Releases</h2>
          </div>
          <p className="section-subtitle-v2">
            Published Android applications, mobile games, and studio software available for immediate access.
          </p>
        </div>

        <div className="showcase-grid">
          {/* Card 1: QR Scanner */}
          <article className="showcase-card">
            <div className="showcase-card-top">
              <span className="showcase-badge">Android Application</span>
              <h3 className="showcase-title">QR Scanner | Generator</h3>
              <p className="showcase-desc">
                High-speed autofocus camera scanner for barcodes and QR codes, paired with an offline generator for Wi-Fi, contacts, and URLs on Google Play.
              </p>
            </div>
            <div className="showcase-card-bottom">
              <ButtonLink
                action={{
                  label: 'Google Play ↗',
                  href: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
                }}
                className="button button-primary"
              />
            </div>
          </article>

          {/* Card 2: Mind Matrix */}
          <article className="showcase-card">
            <div className="showcase-card-top">
              <span className="showcase-badge">Mobile Game</span>
              <h3 className="showcase-title">Mind Matrix</h3>
              <p className="showcase-desc">
                Minimalist mobile puzzle game featuring progressive logic, sequence recall, and cognitive reflex drills playable completely offline.
              </p>
            </div>
            <div className="showcase-card-bottom">
              <ButtonLink
                action={{
                  label: 'Google Play ↗',
                  href: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
                }}
                className="button button-primary"
              />
            </div>
          </article>

          {/* Card 3: Custom Website Development */}
          <article className="showcase-card">
            <div className="showcase-card-top">
              <span className="showcase-badge">Client Services</span>
              <h3 className="showcase-title">Custom Website Development</h3>
              <p className="showcase-desc">
                Need a modern, responsive website for your personal brand, startup, or company? We accept custom web design and development projects on request.
              </p>
            </div>
            <div className="showcase-card-bottom">
              <ButtonLink action={{ label: 'Request a Website', to: '/pages/contact' }} className="button button-secondary" />
            </div>
          </article>

          {/* Card 4: Free Panel */}
          <article className="showcase-card">
            <div className="showcase-card-top">
              <span className="showcase-badge">Public Evaluation</span>
              <h3 className="showcase-title">Free Panel Build</h3>
              <p className="showcase-desc">
                Public community evaluation release from our software catalog. Check live slot availability, view shared credentials, and download the package archive.
              </p>
            </div>
            <div className="showcase-card-bottom">
              <ButtonLink action={{ label: 'Access Free Panel', to: '/pages/freepanel' }} className="button button-secondary" />
            </div>
          </article>
        </div>
      </section>

      <hr className="home-divider" />

      {/* Split Highlights: About & Contact */}
      <section className="home-section home-split-grid">
        <article className="highlight-panel">
          <span className="section-eyebrow">About Dark Skull Corporation</span>
          <h2 className="highlight-title">Independent Software Studio</h2>
          <p className="highlight-desc">
            Founded and led by <strong>Naveed Mushtaq </strong>, Dark Skull Corporation is an independent software development studio primarily focused on Android application development and game development, with custom website development available on request.
          </p>
          <div className="highlight-action">
            <ButtonLink action={{ label: 'Read About Studio', to: '/pages/about' }} className="button button-secondary" />
          </div>
        </article>

        <article className="highlight-panel highlight-panel-alt">
          <span className="section-eyebrow">Project &amp; Support Inquiries</span>
          <h2 className="highlight-title">Work With Us or Get Help</h2>
          <p className="highlight-desc">
            Whether you want to commission a custom website, inquire about our Android apps and games, or need assistance with an existing product order, reach out via our Contact page or Discord community.
          </p>
          <div className="highlight-action">
            <ButtonLink action={{ label: 'Contact Studio', to: '/pages/contact' }} className="button button-primary" />
          </div>
        </article>
      </section>
    </div>
  )
}
