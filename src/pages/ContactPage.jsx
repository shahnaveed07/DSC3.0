import { useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import {
  QUOTATION_MODEL_STATEMENT,
  buildServiceOrderUrl,
  contactChannels,
  resolveServicePrefill,
} from '../content/siteContent'

export function ContactPage() {
  usePageMeta(SEO_ROUTES.contact)

  const [searchParams] = useSearchParams()
  const serviceParam = searchParams.get('service') || ''
  const scopeParam = searchParams.get('scope') || ''
  const deploymentParam = searchParams.get('deployment') || ''

  const prefill = resolveServicePrefill({
    serviceSlug: serviceParam,
    scopeId: scopeParam,
    deploymentOption: deploymentParam,
  })
  const formalOrderUrl = prefill
    ? buildServiceOrderUrl({
        serviceSlug: prefill.serviceSlug,
        scopeId: prefill.scopeId,
        deploymentOption: prefill.deploymentId,
      })
    : '/services/request'

  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    category: prefill ? prefill.category : 'website',
    subject: prefill ? prefill.subject : '',
    message: prefill ? prefill.message : '',
  }))
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [formError, setFormError] = useState('')

  const categoryLabels = {
    website: 'Website Design & Development',
    android: 'Android App Development Inquiry',
    game: 'Game Development Inquiry',
    order: 'Order / Payment Verification',
    support: 'Technical & Software Support',
    freepanel: 'Free Panel Assistance',
    custom: 'Custom Build & Studio Inquiry',
    bug: 'Bug Report / Issue',
    general: 'General Question',
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    setFormError('')

    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (!name || !email || !subject || !message) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (message.length < 10) {
      setFormError('Please provide a descriptive message (at least 10 characters).')
      return
    }

    setFormSubmitted(true)
  }

  const formattedInquiry = `Category: ${categoryLabels[form.category] || form.category}
From: ${form.name} (${form.email})
Subject: ${form.subject}

Message:
${form.message}
`

  const mailtoUrl = `mailto:darkskullcorporation@gmail.com?subject=${encodeURIComponent(
    `[DSC Inquiry - ${categoryLabels[form.category] || 'Support'}] ${form.subject}`,
  )}&body=${encodeURIComponent(formattedInquiry)}`

  async function handleCopyInquiry() {
    try {
      await navigator.clipboard.writeText(formattedInquiry)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      // Ignore clipboard error
    }
  }

  return (
    <div className="center-wrap">
      {/* Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Contact &amp; Project Inquiries</h1>
        <p>
          Want to commission a custom website for your individual brand or business, inquire about Android application or game development, or get assistance with an order? Reach Dark Skull Corporation through our official channels or the inquiry form below.
        </p>
      </section>

      {/* Official Communication Channels Grid */}
      <div className="channels-grid mt-36">
        {contactChannels.map((c) => (
          <article key={c.label} className="channel-card">
            <div>
              <span className="badge primary mb-10">{c.label}</span>
              <h2 className="channel-card-title">{c.title}</h2>
              <p className="channel-card-desc">{c.body}</p>
            </div>

            <div className="channel-card-action">
              <a
                className="button button-primary w-100"
                href={c.action.href}
                target={c.action.href.startsWith('mailto:') ? '_self' : '_blank'}
                rel="noreferrer"
              >
                {c.action.label} {c.action.href.startsWith('http') ? '↗' : ''}
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Working Contact Inquiry Form */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge good mb-8">Direct Message</span>
          <h2>Send a Project or Support Inquiry</h2>
          <p className="mb-24">
            We welcome inquiries for <strong>Website Design &amp; Development</strong>, <strong>Android App Development</strong>, <strong>Game Development</strong>, and product or order support. Fill in the details below to send directly to our official mailbox or copy for Discord.
          </p>

          {prefill ? (
            <div className="studio-prefill-notice mb-24" data-testid="contact-service-prefill-banner">
              <div className="studio-prefill-notice-top">
                <div>
                  <span className="badge primary mb-8">Selected Studio Configuration</span>
                  <h3 className="m-0">{prefill.serviceTitle} — Quotation Request</h3>
                </div>
                <div className="flex gap-8 flex-wrap">
                  <NavLink
                    to={formalOrderUrl}
                    className="button button-primary button-sm"
                    data-testid="contact-formal-order-cta"
                  >
                    Submit Formal Service Order
                  </NavLink>
                  <NavLink
                    to={`/services/${prefill.serviceSlug}`}
                    className="button button-secondary button-sm"
                  >
                    Modify Scope or Deployment
                  </NavLink>
                </div>
              </div>
              <div className="studio-selected-config-strip mt-12">
                <div className="studio-selected-config-item">
                  <span className="micro-label">SERVICE</span>
                  <strong>{prefill.serviceTitle}</strong>
                </div>
                <div className="studio-selected-config-item">
                  <span className="micro-label">SCOPE TEMPLATE</span>
                  <strong>{prefill.scopeName}</strong>
                </div>
                <div className="studio-selected-config-item">
                  <span className="micro-label">DEPLOYMENT PREFERENCE</span>
                  <strong>{prefill.deploymentLabel}</strong>
                </div>
              </div>
              <p className="text-muted text-sm mt-12 mb-0">{QUOTATION_MODEL_STATEMENT}</p>
            </div>
          ) : null}

          {formSubmitted ? (
            <div className="inquiry-preview-card">
              <span className="badge good mb-8">INQUIRY PREPARED</span>
              <h3 className="mt-6 mb-12 text-main">Ready to Send</h3>
              <p className="text-muted text-sm mb-16">
                Your inquiry has been compiled. Click below to launch your default email client, or copy the formatted message to send on Discord:
              </p>

              <pre className="inquiry-pre mb-20">
                {formattedInquiry}
              </pre>

              <div className="flex gap-12 flex-wrap">
                <a href={mailtoUrl} className="button button-primary">
                  Open Email Client (darkskullcorporation@gmail.com) ↗
                </a>
                <button type="button" onClick={handleCopyInquiry} className="button button-secondary">
                  {copiedText ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false)
                    setForm({ name: '', email: '', category: 'website', subject: '', message: '' })
                  }}
                  className="button button-ghost"
                >
                  Write Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="contact-form">
              <div className="form-grid-2">
                <label className="field" htmlFor="contactName">
                  <span className="micro-label">YOUR NAME *</span>
                  <input
                    id="contactName"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>

                <label className="field" htmlFor="contactEmail">
                  <span className="micro-label">YOUR EMAIL ADDRESS *</span>
                  <input
                    id="contactEmail"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label className="field" htmlFor="contactCategory">
                  <span className="micro-label">INQUIRY CATEGORY *</span>
                  <select
                    id="contactCategory"
                    className="input-field"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="website">Website Design &amp; Development</option>
                    <option value="android">Android App Development Inquiry</option>
                    <option value="game">Game Development Inquiry</option>
                    <option value="order">Order / Payment Verification</option>
                    <option value="support">Technical &amp; Software Support</option>
                    <option value="freepanel">Free Panel Assistance</option>
                    <option value="custom">Custom Build &amp; Studio Inquiry</option>
                    <option value="bug">Bug Report / Issue</option>
                    <option value="general">General Question</option>
                  </select>
                </label>

                <label className="field" htmlFor="contactSubject">
                  <span className="micro-label">SUBJECT *</span>
                  <input
                    id="contactSubject"
                    type="text"
                    required
                    placeholder="Brief summary of inquiry"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  />
                </label>
              </div>

              <label className="field mb-20" htmlFor="contactMessage">
                <span className="micro-label">MESSAGE DETAILS *</span>
                <textarea
                  id="contactMessage"
                  required
                  rows={5}
                  placeholder="Include any relevant order IDs, hardware tokens, or detailed questions..."
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                />
              </label>

              {formError ? (
                <div className="form-error mb-16">
                  {formError}
                </div>
              ) : null}

              <button type="submit" className="button button-primary button-lg">
                Submit Inquiry Details
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Order Verification Notice */}
      <section className="seo-section">
        <div className="seo-container">
          <span className="badge primary mb-8">Order Notice</span>
          <h2>Order &amp; Payment Verification Timeline</h2>
          <p>
            Orders placed via the checkout system undergo manual verification of uploaded screenshot payment proofs. Once confirmed by an administrator, your license key is unlocked immediately on your <strong>Client Dashboard</strong>.
          </p>
          <p>
            Typical verification takes between 15 minutes and 2 hours during active operating windows (UTC+0 to UTC+12). If your order remains pending after 24 hours, post your registered username and order details in our Discord <code>#order-help</code> channel for priority review.
          </p>
        </div>
      </section>
    </div>
  )
}
