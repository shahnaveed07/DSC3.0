import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { buildCheckoutPayload, extractApiMessage, submitCheckout } from '../services/dscApi'
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
const MAX_PROOF_BYTES = 5 * 1024 * 1024
const TXN_ID_PATTERN = /^[A-Za-z0-9_-]{6,36}$/

function isAllowedProofFile(file) {
  if (!file) return false
  const mime = String(file.type || '').toLowerCase()
  if (ALLOWED_PROOF_TYPES.includes(mime)) return true
  const name = String(file.name || '').toLowerCase()
  return /\.(png|jpe?g)$/i.test(name)
}

function encodeFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = String(event.target?.result || '')
      if (!result.startsWith('data:image/')) {
        reject(new Error('Failed to encode payment screenshot as an image Data URL.'))
        return
      }
      resolve(result)
    }
    reader.onerror = () => {
      reject(new Error('Unable to read the selected screenshot file. Please try another image.'))
    }
    reader.readAsDataURL(file)
  })
}

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
  const [qrError, setQrError] = useState(false)
  const [qrRetryCount, setQrRetryCount] = useState(0)
  const [form, setForm] = useState({
    username: '',
    password: '',
    discordId: '',
    txnId: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidPanel = Boolean(panel && BASE_PRICES[panel] !== undefined)
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
    const base = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`
    return qrRetryCount > 0 ? `${base}&retry=${qrRetryCount}` : base
  }, [upiUrl, qrRetryCount])

  useEffect(() => {
    setQrLoading(true)
    setQrError(false)
  }, [upiUrl])

  function handleRetryQr() {
    setQrError(false)
    setQrLoading(true)
    setQrRetryCount((count) => count + 1)
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null
    if (!file) {
      setProofFile(null)
      setPreviewSrc('')
      return
    }

    if (!isAllowedProofFile(file)) {
      setError('Please upload a valid image file (PNG, JPG, JPEG).')
      setProofFile(null)
      setPreviewSrc('')
      return
    }

    if (file.size > MAX_PROOF_BYTES) {
      setError('Image is too large! Max allowed size is 5MB.')
      setProofFile(null)
      setPreviewSrc('')
      return
    }

    setError('')
    setProofFile(file)
    encodeFileAsDataUrl(file)
      .then((dataUrl) => {
        setPreviewSrc(dataUrl)
      })
      .catch((readErr) => {
        setError(readErr.message || 'Unable to read screenshot file.')
        setProofFile(null)
        setPreviewSrc('')
      })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading || success) return

    setError('')
    setSuccess('')

    const username = form.username.trim().toLowerCase()
    const password = form.password
    const discordId = form.discordId.trim() || 'None'
    const rawTxnInput = form.txnId
    const trimmedTxnId = rawTxnInput.trim()

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (days < 3) {
      setError(
        '1-day trials are provided via the live Free Panel or community testing. Paid orders require a minimum of 3 days.',
      )
      return
    }

    if (requiresProof && rawTxnInput.length > 0) {
      if (
        !trimmedTxnId ||
        trimmedTxnId.toUpperCase() === 'SS_PROOF_ONLY' ||
        !TXN_ID_PATTERN.test(trimmedTxnId)
      ) {
        setError(
          'Transaction ID / UTR must be 6 to 36 alphanumeric characters (or leave blank to verify via screenshot only).',
        )
        return
      }
    }

    let base64String = ''
    if (requiresProof) {
      if (!proofFile) {
        setError('Screenshot proof is required.')
        return
      }
      try {
        base64String = previewSrc || (await encodeFileAsDataUrl(proofFile))
        if (!previewSrc && base64String) {
          setPreviewSrc(base64String)
        }
      } catch (readErr) {
        setError(readErr.message || 'Unable to process payment proof screenshot.')
        return
      }
    }

    setLoading(true)

    try {
      const normalizedPlan = panel === 'aimassist' ? 'aimbot' : panel
      const orderData = buildCheckoutPayload({
        username,
        password,
        discordId,
        plan: normalizedPlan,
        days,
        amount: priceDisplayText,
        txnId: trimmedTxnId || 'SS_PROOF_ONLY',
        paymentProofBase64: base64String,
      })

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
            <NavLink className="button button-primary" to="/pages/catalog">
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

        <form id="checkoutForm" onSubmit={handleSubmit} noValidate>
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
                    {qrLoading && !qrError ? (
                      <div id="qrLoading" className="qr-placeholder">
                        <span className="text-xs text-muted">Generating QR...</span>
                      </div>
                    ) : null}

                    {qrError ? (
                      <div id="qrErrorBox" className="qr-error-box" role="alert">
                        <p className="text-xs text-danger m-0">
                          Unable to load the UPI QR code image. You can still pay via the UPI button above or retry loading the QR code.
                        </p>
                        <button
                          type="button"
                          className="button button-secondary button-sm mt-10"
                          onClick={handleRetryQr}
                        >
                          Retry QR Code
                        </button>
                      </div>
                    ) : null}

                    <img
                      id="qrImage"
                      alt="UPI QR Code"
                      src={qrCodeUrl}
                      onLoad={() => {
                        setQrLoading(false)
                        setQrError(false)
                      }}
                      onError={() => {
                        setQrLoading(false)
                        setQrError(true)
                      }}
                      className={`qr-image ${qrLoading || qrError ? 'hidden' : ''}`}
                      style={{ display: qrLoading || qrError ? 'none' : 'block' }}
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
                  <>
                    <label className="field" htmlFor="paymentTxnId">
                      <span className="micro-label">UPI TRANSACTION ID / UTR (OPTIONAL WITH SCREENSHOT)</span>
                      <input
                        id="paymentTxnId"
                        type="text"
                        placeholder="e.g. 12-digit UPI UTR reference"
                        value={form.txnId}
                        onChange={(e) => setForm((c) => ({ ...c, txnId: e.target.value }))}
                        autoComplete="off"
                      />
                    </label>

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
                  </>
                ) : null}
              </div>

              {error ? (
                <div className="form-error" role="alert">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="form-success" role="status">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                className={`button button-primary button-lg w-100 ${loading ? 'is-loading' : ''}`}
                disabled={loading || Boolean(success)}
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
