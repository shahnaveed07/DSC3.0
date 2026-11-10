import { useMemo, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { extractApiMessage, submitCheckout } from '../services/dscApi'
import { FullScreenLoader } from '../components/ui/FullScreenLoader'
import { PasswordInput } from '../components/ui/PasswordInput'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'


const BASE_PRICES = {
  free: 0,
  sniper: 1,
  aimbot: 1,
  aimassist: 1,
  streamer: 2,
  special: 3,
  premium: 5,
  customised: 10,
}

const DURATION_MULTIPLIERS = {
  1: { multiplier: 0.5, label: '1 Day - Trial' },
  3: { multiplier: 1, label: '3 Days - Starter' },
  7: { multiplier: 2, label: '7 Days - Weekly' },
  15: { multiplier: 3, label: '15 Days - Standard' },
  30: { multiplier: 4, label: '30 Days - Monthly' },
  60: { multiplier: 6, label: '60 Days - Bi-Monthly' },
  365: { multiplier: 8, label: '365 Days - Yearly' },
}

const USD_TO_INR = 90
const ALLOWED_PROOF_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const panel = String(searchParams.get('panel') || '').trim().toLowerCase()

  usePageMeta({
    ...SEO_ROUTES.checkout,
    title: panel
      ? `Checkout — ${panel.toUpperCase()} Panel | Dark Skull Corporation`
      : SEO_ROUTES.checkout.title,
  })

  const [days, setDays] = useState(30)
  const [proofFile, setProofFile] = useState(null)
  const [previewSrc, setPreviewSrc] = useState('')
  const [qrLoading, setQrLoading] = useState(true)
  const [form, setForm] = useState({
    username: '',
    password: '',
    discordId: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidPanel = panel && BASE_PRICES[panel] !== undefined
  const basePriceUSD = isValidPanel ? BASE_PRICES[panel] : 0
  const durationConfig = DURATION_MULTIPLIERS[days] || { multiplier: 1, label: `${days} Days` }
  const totalUsd = basePriceUSD * durationConfig.multiplier
  const totalInr = totalUsd * USD_TO_INR
  const requiresProof = panel !== 'free' && totalInr > 0

  const priceDisplayText = `USD ${totalUsd} (${totalInr} INR)`

  const upiUrl = useMemo(() => {
    return `upi://pay?pa=naveedmushtaq@ptyes&pn=${encodeURIComponent('Dark Skull Corp')}&am=${totalInr}&cu=INR&tn=DSC-${panel}`
  }, [panel, totalInr])

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`
  }, [upiUrl])

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null
    if (file) {
      if (!ALLOWED_PROOF_TYPES.includes(file.type.toLowerCase())) {
        setError('Please upload a valid image file (PNG, JPG, JPEG).')
        setProofFile(null)
        setPreviewSrc('')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image is too large! Max allowed size is 5MB.')
        setProofFile(null)
        setPreviewSrc('')
        return
      }
      setError('')
      setProofFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewSrc(e.target?.result || '')
      reader.readAsDataURL(file)
    } else {
      setProofFile(null)
      setPreviewSrc('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const username = form.username.trim().toLowerCase()
    const password = form.password
    const discordId = form.discordId.trim() || 'None'

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (days < 3) {
      setError('1-day trials are provided via the live Free Panel or community testing. Paid orders require a minimum of 3 days.')
      return
    }

    let base64String = ''
    if (requiresProof) {
      if (!proofFile) {
        setError('Screenshot proof is required.')
        return
      }
      base64String = previewSrc
    }

    setLoading(true)

    try {
      const normalizedPlan = panel === 'aimassist' ? 'aimbot' : panel
      const orderData = {
        Username: username,
        PasswordHash: password,
        DiscordId: discordId,
        Plan: normalizedPlan,
        Days: days,
        Amount: priceDisplayText,
        TxnId: 'SS_PROOF_ONLY',
        PaymentProofBase64: base64String,
      }

      await submitCheckout(orderData)
      setSuccess('Order placed successfully. Track it from the login dashboard.')
      setTimeout(() => {
        navigate('/pages/ulogin')
      }, 1500)
    } catch (submitError) {
      setError(
        extractApiMessage(
          submitError.payload,
          submitError.message || 'Order submission failed.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isValidPanel) {
    return (
      <div className="center-wrap auth-shell">
        <section className="panel auth-card text-center">
          <h1 className="auth-title">Invalid Selection</h1>
          <p className="auth-subtitle">No valid panel was selected for checkout.</p>
          <div className="mt-20">
            <NavLink className="button button-primary" to="/pages/products">
              View Products
            </NavLink>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="center-wrap">
      <FullScreenLoader active={loading} message="Processing order..." />
      <section className="panel auth-card checkout-card">
        <div className="logo-mark free-panel-icon-60 mb-14">
          <picture>
            <source srcSet="/images/dsclogo.webp" type="image/webp" />
            <img
              src="/images/dsclogo.png"
              alt="Dark Skull Corporation"
              className="header-logo-img"
              width="60"
              height="60"
            />
          </picture>
        </div>
        <h1 className="auth-title">Complete Order</h1>
        <p className="auth-subtitle">
          Selected: <strong id="displayPanelName" className="text-primary">{panel.toUpperCase()} PANEL</strong>
        </p>

        <form id="checkoutForm" onSubmit={handleSubmit}>
          <div className="checkout-grid mt-20">
            {/* Left Column: Plan, Duration, Pricing & Payment Info */}
            <div className="checkout-col">
              <div className="checkout-summary-card">
                <label className="field" htmlFor="selectDays">
                  <span className="micro-label">DURATION &amp; PLAN</span>
                  <select
                    id="selectDays"
                    className="input-field"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  >
                    {[3, 7, 15, 30, 60, 365].map((dayVal) => (
                      <option key={dayVal} value={dayVal}>
                        {DURATION_MULTIPLIERS[dayVal]?.label || `${dayVal} Days`}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-muted mt-4">
                    Note: For 1-day community evaluation, use the live Free Panel.
                  </span>
                </label>

                <div className="mt-16">
                  <span className="micro-label">TOTAL AMOUNT</span>
                  <div id="displayPrice" className="checkout-price-value">
                    {priceDisplayText}
                  </div>
                </div>
              </div>

              {requiresProof ? (
                <div className="checkout-summary-card checkout-qr-section">
                  <span className="micro-label">UPI PAYMENT</span>
                  <p className="text-sm text-muted mt-4 mb-14">
                    Pay via any UPI application or scan the QR code below.
                  </p>

                  <a
                    id="upiPayBtn"
                    className="button button-primary w-100 mb-16"
                    href={upiUrl}
                  >
                    Pay with UPI App ({totalInr} INR)
                  </a>

                  <div className="payment-qr-container">
                    {qrLoading ? (
                      <div id="qrLoading" className="qr-placeholder">
                        <span className="text-xs text-muted">Generating QR...</span>
                      </div>
                    ) : null}
                    <img
                      id="qrImage"
                      alt="UPI QR Code"
                      src={qrCodeUrl}
                      onLoad={() => setQrLoading(false)}
                      className={`qr-image ${qrLoading ? 'hidden' : ''}`}
                      style={{ display: qrLoading ? 'none' : 'block' }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column: Account Details & Screenshot Proof */}
            <div className="checkout-col">
              <div className="checkout-summary-card">
                <label className="field" htmlFor="regUsername">
                  <span className="micro-label">DESIRED USERNAME</span>
                  <input
                    id="regUsername"
                    type="text"
                    placeholder="Must match game username"
                    value={form.username}
                    onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                    required
                    autoComplete="username"
                  />
                </label>

                <label className="field" htmlFor="regPassword">
                  <span className="micro-label">ACCOUNT PASSWORD (MINIMUM 6 CHARACTERS)</span>
                  <PasswordInput
                    id="regPassword"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                </label>

                <label className="field" htmlFor="regDiscord">
                  <span className="micro-label">DISCORD USERNAME / ID (OPTIONAL)</span>
                  <input
                    id="regDiscord"
                    type="text"
                    placeholder="e.g. username#1234"
                    value={form.discordId}
                    onChange={(e) => setForm((c) => ({ ...c, discordId: e.target.value }))}
                  />
                </label>

                {requiresProof ? (
                  <div id="paymentProofGroup" className="mt-16">
                    <label className="field" htmlFor="paymentProofImg">
                      <span className="micro-label">UPLOAD PAYMENT PROOF SCREENSHOT</span>
                      <input
                        id="paymentProofImg"
                        type="file"
                        className="custom-file-input"
                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                        onChange={handleFileChange}
                      />
                    </label>

                    {previewSrc ? (
                      <div id="imagePreviewBox" className="image-preview-container">
                        <img
                          id="imagePreview"
                          alt="Screenshot Preview"
                          src={previewSrc}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {error ? (
                <div className="form-error">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="form-success">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                className={`button button-primary button-lg w-100 ${loading ? 'is-loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="button-loading-content">
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Processing order...</span>
                  </span>
                ) : (
                  <span>Submit Order</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
