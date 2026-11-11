import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { contactChannels, resolveServicePrefill } from '../content/siteContent'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { SEO_ROUTES } from '../content/seoConfig'

const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function buildPrefillState(searchParams) {
  const serviceSlug = searchParams.get('service') || ''
  const scopeId = searchParams.get('scope') || ''
  const deploymentOption = searchParams.get('deployment') || ''
  return resolveServicePrefill({ serviceSlug, scopeId, deploymentOption })
}

export function validateContactFields({ name, email, subject, message }) {
  const errors = {}
  const cleanName = String(name || '').trim()
  const cleanEmail = String(email || '').trim()
  const cleanSubject = String(subject || '').trim()
  const cleanMessage = String(message || '').trim()

  if (!cleanName) {
    errors.name = 'Please enter your name.'
  }
  if (!cleanEmail) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_FORMAT_REGEX.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address (e.g., you@example.com).'
  }
  if (!cleanSubject) {
    errors.subject = 'Please enter a subject for your inquiry.'
  }
  if (!cleanMessage) {
    errors.message = 'Please enter your message details.'
  }

  return errors
}

export function ContactPage() {
  usePageMetadata(SEO_ROUTES.contact)
  const [searchParams] = useSearchParams()

  const prefillKey = `${searchParams.get('service') || ''}|${searchParams.get('scope') || ''}|${searchParams.get('deployment') || ''}`
  const servicePrefill = buildPrefillState(searchParams)

  const [prevPrefillKey, setPrevPrefillKey] = useState(prefillKey)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState(() => servicePrefill?.category || 'website')
  const [subject, setSubject] = useState(() => servicePrefill?.subject || '')
  const [message, setMessage] = useState(() => servicePrefill?.message || '')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  if (prefillKey !== prevPrefillKey) {
    setPrevPrefillKey(prefillKey)
    if (servicePrefill) {
      setCategory(servicePrefill.category)
      setSubject(servicePrefill.subject)
      setMessage(servicePrefill.message)
      setFieldErrors({})
      setSubmitted(false)
      setCopied(false)
      setCopyError('')
    }
  }

  function clearFieldError(fieldKey) {
    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev
      const next = { ...prev }
      delete next[fieldKey]
      return next
    })
  }

  function getFormattedInquiryText() {
    return `Name: ${name.trim()}\nEmail: ${email.trim()}\nCategory: ${category}\nSubject: ${subject.trim()}\n\n${message.trim()}`
  }

  function getMailtoUrl() {
    const mailSubject = encodeURIComponent(`[DSC Inquiry - ${category.toUpperCase()}] ${subject.trim()}`)
    const mailBody = encodeURIComponent(getFormattedInquiryText())
    return `mailto:darkskullcorporation@gmail.com?subject=${mailSubject}&body=${mailBody}`
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateContactFields({ name, email, subject, message })
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setCopied(false)
      setCopyError('')
      return
    }

    setCopied(false)
    setCopyError('')
    setSubmitted(true)
  }

  async function handleCopyInquiry() {
    setCopyError('')
    const textToCopy = getFormattedInquiryText()
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
      setCopyError(
        'Automatic clipboard copy was blocked by your browser. Please select and copy the formatted inquiry text below or click "Open Email Client".',
      )
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-block">
        <div className="eyebrow">GET IN TOUCH</div>
        <h1>Contact Dark Skull Corporation</h1>
        <p className="lead">
          Reach out for custom website, Android application, or game development quotations, as
          well as product support and licensing assistance.
        </p>
      </section>

      <div className="grid-cards contact-channels-grid">
        {contactChannels.map((channel) => (
          <article className="info-card" key={channel.title}>
            <div className="card-label">{channel.label}</div>
            <h3>{channel.title}</h3>
            <p>{channel.body}</p>
            <div className="card-actions">
              <a
                className="button primary"
                href={channel.action.href}
                target={channel.action.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={channel.action.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              >
                {channel.action.label}
              </a>
            </div>
          </article>
        ))}
      </div>

      <section className="studio-section" aria-label="Direct Inquiry Form">
        <div className="info-card contact-inquiry-card">
          <div className="card-label">PROJECT &amp; SUPPORT INQUIRY</div>
          <h2>Prepare a Direct Message</h2>
          <p className="contact-helper-copy">
            Complete the form below to format a structured inquiry locally in your browser that you
            can open directly in your email client or copy to share in Discord.
          </p>

          {servicePrefill ? (
            <div
              className="contact-service-prefill-banner mt-16"
              data-testid="contact-service-prefill-banner"
            >
              <div className="eyebrow">SELECTED SERVICE QUOTATION SCOPE</div>
              <p className="mt-4">
                <strong>Service:</strong> {servicePrefill.serviceTitle} ·{' '}
                <strong>Scope:</strong> {servicePrefill.scopeName} ·{' '}
                <strong>Deployment:</strong> {servicePrefill.deploymentLabel}
              </p>
              <p className="mt-8 contact-prefill-note">
                {servicePrefill.quotationStatement}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="contact-form-wrap" noValidate>
            <div className="form-grid-2">
              <div className="input-group">
                <label htmlFor="contact-name">YOUR NAME</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearFieldError('name')
                    setSubmitted(false)
                  }}
                  required
                />
                {fieldErrors.name ? (
                  <span id="contact-name-error" className="field-error-text" role="alert">
                    {fieldErrors.name}
                  </span>
                ) : null}
              </div>

              <div className="input-group">
                <label htmlFor="contact-email">YOUR EMAIL ADDRESS</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                    setSubmitted(false)
                  }}
                  required
                />
                {fieldErrors.email ? (
                  <span id="contact-email-error" className="field-error-text" role="alert">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label htmlFor="contact-category">INQUIRY CATEGORY</label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubmitted(false)
                  }}
                >
                  <option value="website">Website Design &amp; Development</option>
                  <option value="android">Android App Support / Feedback</option>
                  <option value="game">Game Feedback (Mind Matrix)</option>
                  <option value="licensing">Software Panel &amp; Licensing Support</option>
                  <option value="general">General Studio Inquiry</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="contact-subject">SUBJECT</label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="e.g., Custom Business Website Quote"
                  value={subject}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    clearFieldError('subject')
                    setSubmitted(false)
                  }}
                  required
                />
                {fieldErrors.subject ? (
                  <span id="contact-subject-error" className="field-error-text" role="alert">
                    {fieldErrors.subject}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="contact-message">MESSAGE DETAILS</label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Describe your project goals, app feedback, or support question..."
                value={message}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                onChange={(e) => {
                  setMessage(e.target.value)
                  clearFieldError('message')
                  setSubmitted(false)
                }}
                required
              />
              {fieldErrors.message ? (
                <span id="contact-message-error" className="field-error-text" role="alert">
                  {fieldErrors.message}
                </span>
              ) : null}
            </div>

            <div className="card-actions mt-18">
              <button type="submit" className="button primary">
                {submitted ? 'Update Formatted Inquiry' : 'Submit Inquiry Details'}
              </button>
              <a className="button ghost" href="mailto:darkskullcorporation@gmail.com">
                Email Directly
              </a>
            </div>

            {submitted ? (
              <div className="status-banner success mt-18" role="status">
                <strong>Inquiry Formatted Locally &amp; Ready to Send:</strong> Your inquiry has
                been prepared below (it has not been sent to a server automatically). Choose how
                you would like to send it to our team:
                <pre className="inquiry-pre mt-12" data-testid="formatted-inquiry-preview">
                  {getFormattedInquiryText()}
                </pre>
                {copyError ? (
                  <p className="field-error-text mt-8" role="alert">
                    {copyError}
                  </p>
                ) : null}
                <div className="card-actions mt-12">
                  <a className="button primary" href={getMailtoUrl()}>
                    Open Email Client ↗
                  </a>
                  <button type="button" className="button secondary" onClick={handleCopyInquiry}>
                    {copied ? 'Copied Inquiry to Clipboard ✓' : 'Copy Message for Discord / Email'}
                  </button>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </section>

      <section className="studio-section" aria-label="Order and Payment Assistance">
        <div className="info-card">
          <div className="card-label">ORDER &amp; LICENSING SUPPORT</div>
          <h3>Software Order Verification</h3>
          <p>
            For existing software license orders, payment proofs are reviewed manually by an
            administrator. Please include your registered username and transaction reference when
            requesting order assistance.
          </p>
          <div className="card-actions mt-16">
            <Link className="button secondary" to="/pages/ulogin">
              Client Login
            </Link>
            <Link className="button ghost" to="/services">
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
