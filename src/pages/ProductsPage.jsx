import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { productPlans } from '../content/siteContent'

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'available', label: 'Available Now' },
  { id: 'free', label: 'Free Tier' },
  { id: 'upcoming', label: 'Custom & Future' },
]

export function ProductsPage() {
  usePageMeta(SEO_ROUTES.products)

  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedProduct, setExpandedProduct] = useState(null)

  const filteredProducts = productPlans.filter((p) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'available') return !p.action.disabled && p.slug !== 'free'
    if (activeFilter === 'free') return p.slug === 'free'
    if (activeFilter === 'upcoming') return p.slug === 'premium' || p.slug === 'customised'
    return true
  })

  function toggleProductSpecs(slug) {
    setExpandedProduct((current) => (current === slug ? null : slug))
  }

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Software Products Catalog</h1>
        <p>
          Explore our available software catalog with transparent base pricing, flexible duration options, and verified Client Dashboard delivery. Looking for our Android apps, games, or custom website development? Visit our Apps or Contact pages.
        </p>

        {/* Filter Tabs */}
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`button ${activeFilter === cat.id ? 'button-primary' : 'button-secondary'} button-sm`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <div className="products-grid mt-36">
        {filteredProducts.map((p) => {
          const isExpanded = expandedProduct === p.slug
          return (
            <article
              key={p.slug}
              className={`product-card ${p.featured ? 'elite' : ''}`}
            >
              <div>
                {p.badge ? (
                  <span className="elite-badge">{p.badge}</span>
                ) : null}
                <span className="badge primary mb-8">{p.category}</span>

                <h2 className="product-title mt-6">{p.title}</h2>
                <div className="product-price">
                  {p.price.split(' ')[0]} <span className="product-price-rate">/ Base Rate</span>
                </div>

                <p className="product-desc">
                  {p.description}
                </p>

                {/* Key Features */}
                <span className="micro-label mb-8">CORE CAPABILITIES</span>
                <ul className="product-features mb-16">
                  {p.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>

                {/* Tech Specs Summary */}
                {p.specs ? (
                  <div className="product-spec-box mb-16">
                    <div className="product-spec-row">
                      <span className="text-muted">Platform:</span>
                      <strong className="text-main">{p.specs.platform}</strong>
                    </div>
                    <div className="product-spec-row">
                      <span className="text-muted">Memory:</span>
                      <strong className="text-main">{p.specs.memory}</strong>
                    </div>
                    <div className="product-spec-row">
                      <span className="text-muted">Licensing:</span>
                      <strong className="text-main">{p.specs.licensing}</strong>
                    </div>
                  </div>
                ) : null}

                {/* Collapsible Specs & Guide */}
                {isExpanded ? (
                  <div className="product-guide-box mb-16">
                    <h4 className="text-primary mb-8">Installation &amp; Activation Guide</h4>
                    <ol className="feature-list mb-10">
                      <li>Windows 10 / 11 64-bit with .NET Framework 4.8 runtime required.</li>
                      <li>Place the executable in an isolated folder and run with administrative rights.</li>
                      <li>Upon launch, copy your hardware token and paste your assigned license key.</li>
                      <li>All licenses are bound to 1 machine (HWID) to safeguard credential integrity.</li>
                    </ol>
                    <p className="text-xs text-muted m-0">
                      Need help? Open a support ticket on our{' '}
                      <a href="https://discord.gg/XB2Zjmsb7K" target="_blank" rel="noreferrer" className="text-primary">
                        Discord server
                      </a>.
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => toggleProductSpecs(p.slug)}
                  className="product-guide-toggle mb-16"
                >
                  {isExpanded ? '▲ Hide Setup Guide' : '▼ View Setup & System Requirements'}
                </button>
              </div>

              {/* Action Button */}
              <div className="product-action-wrap">
                {p.action.href ? (
                  <a
                    href={p.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-secondary w-100"
                  >
                    {p.action.label} ↗
                  </a>
                ) : p.action.disabled ? (
                  <button
                    type="button"
                    className="button button-ghost w-100 disabled-btn"
                    disabled
                  >
                    {p.action.label}
                  </button>
                ) : (
                  <NavLink
                    to={p.action.to}
                    className="button button-primary w-100"
                  >
                    {p.action.label}
                  </NavLink>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Licensing Workflow Explanation */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge primary mb-8">Transparent Process</span>
          <h2>How Licensing &amp; Order Delivery Works</h2>
          <p className="mb-24">
            We prioritize security and transparent delivery. Here is what happens when you purchase or evaluate our software:
          </p>

          <div className="card-grid columns-3">
            <article className="info-card">
              <span className="card-badge">STEP 1</span>
              <h3>Select Plan &amp; Duration</h3>
              <p className="text-muted text-sm m-0">
                Choose your desired tier (Streamer, Special, Sniper, Aim Assist) and duration (1-day trial, weekly, 30 days, or yearly). The total amount is clearly calculated in USD and INR.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">STEP 2</span>
              <h3>Submit Payment Proof</h3>
              <p className="text-muted text-sm m-0">
                Complete payment using UPI or direct QR code and upload your screenshot payment confirmation at checkout. Your client account credentials are submitted simultaneously.
              </p>
            </article>

            <article className="info-card">
              <span className="card-badge">STEP 3</span>
              <h3>Instant Key Activation</h3>
              <p className="text-muted text-sm m-0">
                Our administrator verifies your payment proof. Once confirmed, your unique hardware-bound license key and download build are unlocked in your Client Dashboard.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Product FAQ */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge good mb-8">Answers &amp; Support</span>
          <h2>Frequently Asked Questions</h2>
          <div className="faq-stack mt-20">
            <div className="card faq-card">
              <h3 className="faq-title">
                Can I use my license key on more than one computer?
              </h3>
              <p className="faq-answer">
                No. All Dark Skull Corporation software panel licenses are cryptographically bound to a single machine Hardware Identifier (HWID). If you upgrade your hardware or need an authorized HWID reset, contact support in our Discord community.
              </p>
            </div>

            <div className="card faq-card">
              <h3 className="faq-title">
                What is the difference between the Free Panel and Paid Tiers?
              </h3>
              <p className="faq-answer">
                The Free Panel is a shared community test pool limited to 20 concurrent slots, intended for evaluation of UI speed and server connectivity. Paid tiers (Streamer, Special, Sniper, Aim Assist) provide private dedicated slots, priority server bandwidth, and continuous uptime without slot congestion.
              </p>
            </div>

            <div className="card faq-card">
              <h3 className="faq-title">
                How quickly are checkout orders processed?
              </h3>
              <p className="faq-answer">
                Screenshot payment proofs are reviewed manually by administrators. Average verification takes between 15 minutes and a few hours during active hours. For priority review, you can post your order username in our Discord ticket channel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
