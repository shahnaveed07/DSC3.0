import { Link } from 'react-router-dom'
import { aboutStats } from '../content/siteContent'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

const focusAreas = [
  {
    label: '01 · Mobile Utilities',
    title: 'Android Application Development',
    body: 'We build practical, everyday Android utilities such as QR Scanner | Generator. Our apps focus on fast startup times, intuitive navigation, offline functionality, and strict permission boundaries.',
  },
  {
    label: '02 · Interactive Entertainment',
    title: 'Mobile Game Engineering',
    body: 'We design brain-training and logic puzzle games like Mind Matrix. Our games emphasize progressive difficulty scaling, responsive touch controls, smooth 60 FPS animations, and 100% offline playability.',
  },
  {
    label: '03 · Bespoke Web Projects',
    title: 'Custom Website Development',
    body: 'Beyond our own mobile releases, we design and build custom, responsive websites for individuals, creators, and businesses on request — engineered for speed, accessibility, and maintainability.',
  },
  {
    label: '04 · Engineering Ethics',
    title: 'User-Centered Development',
    body: 'Every project we ship follows clear principles: request only necessary device permissions, avoid intrusive adware or dark patterns, and provide direct communication channels for user support.',
  },
]

export function AboutPage() {
  usePageMetadata(SEO_ROUTES.about)

  return (
    <div className="page-stack">
      <section className="hero-block">
        <div className="eyebrow">COMPANY PROFILE</div>
        <h1>About Dark Skull Corporation</h1>
        <p className="lead">
          Founded in 2024 by{' '}
          <a
            href="https://naveedmushtaq.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-inline"
          >
            <strong>Naveed Mushtaq — Founder</strong>
          </a>
          , Dark Skull Corporation (DSC) is an independent software studio focused on building
          practical Android applications, engaging mobile puzzle games, and custom websites on
          request.
        </p>
      </section>

      <div className="stats-strip">
        {aboutStats.map((stat) => (
          <div className="stat-box" key={stat.label}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <section className="studio-section" aria-label="Development Focus">
        <div className="section-heading">
          <div>
            <div className="eyebrow">WHAT WE DO</div>
            <h2>Core Development Focus</h2>
          </div>
        </div>
        <div className="grid-cards">
          {focusAreas.map((item) => (
            <article className="info-card" key={item.title}>
              <div className="card-label">{item.label}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="studio-section" aria-label="Founder and Contact">
        <div className="studio-grid-2">
          <article className="info-card">
            <div className="card-label">LEADERSHIP</div>
            <h2>Naveed Mushtaq — Founder &amp; Lead Developer</h2>
            <p>
              <strong>Naveed Mushtaq</strong> leads product engineering, UI/UX architecture, and
              application development across Dark Skull Corporation’s published Google Play releases
              and custom web projects.
            </p>
            <div className="card-actions mt-18">
              <a
                className="button primary"
                href="https://naveedmushtaq.tech/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Developer Portfolio ↗
              </a>
              <a
                className="button ghost"
                href="https://github.com/shahnaveed07"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub (@shahnaveed07) ↗
              </a>
            </div>
          </article>

          <article className="info-card">
            <div className="card-label">EXPLORE DSC</div>
            <h2>Portfolio &amp; Project Inquiries</h2>
            <p>
              Browse our released Android applications and games, review our development services,
              or contact the studio directly to discuss a custom project.
            </p>
            <div className="card-actions mt-18">
              <Link className="button primary" to="/products">
                Explore Products
              </Link>
              <Link className="button secondary" to="/services">
                Explore Services
              </Link>
              <Link className="button ghost" to="/contact">
                Contact Us
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
