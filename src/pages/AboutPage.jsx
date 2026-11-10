import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { aboutStats } from '../content/siteContent'

const focusAreas = [
  {
    title: 'Android Application Development',
    tag: 'Primary Focus',
    desc: 'Designing and developing Android applications with intuitive interfaces, practical everyday utility, scoped permissions, and dependable performance.',
  },
  {
    title: 'Game Development',
    tag: 'Primary Focus',
    desc: 'Creating engaging games and interactive experiences such as Mind Matrix with thoughtful gameplay, polished interfaces, and offline-first reliability.',
  },
  {
    title: 'Custom Website Development',
    tag: 'Available on Request',
    desc: 'Designing and developing responsive, modern websites for individuals, startups, businesses, and companies tailored to real-world goals.',
  },
]

const studioPrinciples = [
  {
    number: '01',
    title: 'User-Centered Development',
    desc: 'Every application, game, and website is designed around intuitive navigation, clear visual hierarchy, and practical usefulness for real users.',
  },
  {
    number: '02',
    title: 'Quality & Reliability',
    desc: 'We prioritize clean engineering, responsive performance, and dependable operation across Android devices and modern web browsers.',
  },
  {
    number: '03',
    title: 'Continuous Improvement',
    desc: 'We actively refine our published apps, games, and web platforms based on user feedback, usability testing, and ongoing technical updates.',
  },
]

export function AboutPage() {
  usePageMeta(SEO_ROUTES.about)

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Independent Software Studio</h1>
        <p>
          Dark Skull Corporation (DSC) is an independent software development studio primarily focused on Android application development and game development. We also offer custom website design and development for individuals, businesses and companies on request. Our goal is to build useful, intuitive and reliable digital experiences.
        </p>
      </section>

      {/* Stats Strip */}
      <div className="about-stats-grid mb-32">
        {aboutStats.map((st) => (
          <div key={st.label} className="about-stat-item text-center">
            <span className="micro-label">{st.label}</span>
            <div className="about-stat-value">{st.value}</div>
          </div>
        ))}
      </div>

      {/* Focus Areas */}
      <div className="focus-grid">
        {focusAreas.map((area) => (
          <div key={area.title} className="focus-card">
            <span className="badge primary mb-8">{area.tag}</span>
            <h2 className="focus-card-title">{area.title}</h2>
            <p className="focus-card-desc">{area.desc}</p>
          </div>
        ))}
      </div>

      {/* Studio Principles, Development Areas & Founder Section */}
      <section className="seo-section">
        <div className="seo-container">
          <h2>Studio Principles</h2>
          <div className="principles-grid-about">
            {studioPrinciples.map((pr) => (
              <div key={pr.number} className="principle-item-about">
                <span className="principle-item-num">{pr.number}</span>
                <h3 className="principle-item-title">{pr.title}</h3>
                <p className="principle-item-desc">{pr.desc}</p>
              </div>
            ))}
          </div>

          {/* Technology & Development Areas Section */}
          <h2 className="mt-36">Technology Stack &amp; Development Areas</h2>
          <p>
            Dark Skull Corporation designs and develops software products across our core areas of focus:
          </p>
          <ul className="feature-list">
            <li>
              <strong>Android Application Development:</strong> Native Android applications engineered for fast startup, offline capability, and scoped device permissions, published on Google Play (including <em>QR Scanner | Generator</em>).
            </li>
            <li>
              <strong>Game Development:</strong> Interactive mobile puzzle and cognitive games (including <em>Mind Matrix</em>) built with responsive touch controls, progressive challenge design, and smooth offline performance.
            </li>
            <li>
              <strong>Custom Website Development:</strong> Responsive web applications and custom websites built with modern web technologies (React, Vite, HTML, CSS, JavaScript, and REST APIs) for individuals, businesses, and companies on request.
            </li>
          </ul>

          {/* Founder & Lead Developer Section */}
          <h2 className="mt-36">Founder </h2>
          <div className="portal-callout-card mt-16 mb-16">
            <div className="portal-callout-info">
              <span className="badge primary mb-8">Studio Leadership</span>
              <h3 className="portal-callout-title">Naveed Mushtaq — Founder </h3>
              <p className="portal-callout-desc">
                Naveed Mushtaq is the Founder and Lead Developer of Dark Skull Corporation. He established DSC with a vision of building useful software products, Android applications and engaging games, while leading the studio&apos;s development direction and engineering work.
              </p>
            </div>
            <div className="portal-callout-actions">
              <a
                href="https://naveedmushtaq.tech/"
                target="_blank"
                rel="noreferrer"
                className="button button-primary button-sm"
              >
                Visit Founder Portfolio ↗
              </a>
              <a
                href="https://github.com/shahnaveed07"
                target="_blank"
                rel="noreferrer"
                className="button button-secondary button-sm"
              >
                GitHub (@shahnaveed07) ↗
              </a>
            </div>
          </div>
          <p>
            You can explore public repositories, studio releases, and project updates on GitHub at{' '}
            <a
              href="https://github.com/shahnaveed07"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold"
            >
              github.com/shahnaveed07 ↗
            </a>{' '}
            or visit{' '}
            <a
              href="https://naveedmushtaq.tech/"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold"
            >
              naveedmushtaq.tech ↗
            </a>{' '}
            to learn more about <strong>Naveed Mushtaq — Founder &amp; Lead Developer</strong>.
          </p>
        </div>
      </section>

      {/* Call to action */}
      <section className="about-cta-card">
        <h2 className="about-cta-title">Explore Our Apps, Games &amp; Services</h2>
        <p className="about-cta-desc">
          Browse our Android applications and games, view our product catalog, or contact us to discuss a custom website development project.
        </p>
        <div className="about-cta-actions">
          <NavLink to="/pages/apps" className="button button-primary">
            Explore Apps &amp; Games
          </NavLink>
          <NavLink to="/pages/contact" className="button button-secondary">
            Request a Website / Contact Us
          </NavLink>
          <NavLink to="/pages/products" className="button button-ghost">
            View Products
          </NavLink>
        </div>
      </section>
    </div>
  )
}
