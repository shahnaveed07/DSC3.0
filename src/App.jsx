import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { checkOwnerAccess, getSystemStatus, isAbortError, isAuthError } from './services/dscApi'
import { clearStoredSession, loadStoredSession, touchStoredSession } from './utils/auth'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

// Lazy-loaded routes for code splitting and lightweight initial loads
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminWorkspacePage = lazy(() => import('./pages/AdminWorkspacePage').then((m) => ({ default: m.AdminWorkspacePage })))
const AppsPage = lazy(() => import('./pages/AppsPage').then((m) => ({ default: m.AppsPage })))
const BuiltByDscPage = lazy(() => import('./pages/BuiltByDscPage').then((m) => ({ default: m.BuiltByDscPage })))
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const DownloadsPage = lazy(() => import('./pages/DownloadsPage').then((m) => ({ default: m.DownloadsPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const FreePanelPage = lazy(() => import('./pages/FreePanelPage').then((m) => ({ default: m.FreePanelPage })))
const GenerateKeyPage = lazy(() => import('./pages/GenerateKeyPage').then((m) => ({ default: m.GenerateKeyPage })))
const InProductionPage = lazy(() => import('./pages/InProductionPage').then((m) => ({ default: m.InProductionPage })))
const LegacyProductsCatalogPage = lazy(() => import('./pages/LegacyProductsCatalogPage').then((m) => ({ default: m.LegacyProductsCatalogPage })))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then((m) => ({ default: m.MaintenancePage })))
const OwnProductsPage = lazy(() => import('./pages/OwnProductsPage').then((m) => ({ default: m.OwnProductsPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })))
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })))
const ServicesOverviewPage = lazy(() => import('./pages/ServicesOverviewPage').then((m) => ({ default: m.ServicesOverviewPage })))
const StatusPage = lazy(() => import('./pages/StatusPage').then((m) => ({ default: m.StatusPage })))
const StudioProductsPage = lazy(() => import('./pages/StudioProductsPage').then((m) => ({ default: m.StudioProductsPage })))
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })))
const UserLoginPage = lazy(() => import('./pages/UserLoginPage').then((m) => ({ default: m.UserLoginPage })))
const UserRegisterPage = lazy(() => import('./pages/UserRegisterPage').then((m) => ({ default: m.UserRegisterPage })))
const WebsitesPage = lazy(() => import('./pages/WebsitesPage').then((m) => ({ default: m.WebsitesPage })))

const STATUS_POLL_INTERVAL_MS = 2 * 60 * 1000

function RouteLoadingFallback() {
  return (
    <div className="center-wrap route-loader-shell">
      <div className="spinner-inline spinner-lg" />
    </div>
  )
}

function redirectForSession(session) {
  if (!session) return '/pages/ulogin'
  return session.role === 'Admin' ? '/pages/adash' : '/pages/udash'
}

function MaintenanceGate({ children, systemStatus, onRetry }) {
  const location = useLocation()
  const isAdminRoute = /^\/pages\/(alogin|adash|ownerdb|generatekey|Alogin\.html|Adash\.html|OwnerDB\.html|generateKey\.html)/i.test(
    location.pathname,
  )

  const maintenanceActive =
    systemStatus?.isMaintenanceMode === true ||
    systemStatus?.IsMaintenanceMode === true

  if (maintenanceActive && !isAdminRoute) {
    return <MaintenancePage onRetry={onRetry} systemStatus={systemStatus} />
  }

  return children
}

function RoleGate({ session, role, children, allowMustChange = false }) {
  if (!session) {
    return <Navigate replace to={role === 'Admin' ? '/pages/alogin' : '/pages/ulogin'} />
  }

  if (session.role !== role) {
    return <Navigate replace to={redirectForSession(session)} />
  }

  if (session.mustChangePassword && role === 'User' && !allowMustChange) {
    return <Navigate replace to="/pages/change" />
  }

  return children
}

function OwnerGate({ session, onSessionInvalid, children }) {
  const [ownerState, setOwnerState] = useState('checking')

  useEffect(() => {
    const token = session?.role === 'Admin' ? session?.token : null
    if (!token) {
      setOwnerState('denied')
      return undefined
    }

    let active = true
    setOwnerState('checking')

    checkOwnerAccess(token)
      .then((isOwner) => {
        if (active) setOwnerState(isOwner ? 'owner' : 'denied')
      })
      .catch((issue) => {
        if (!active) return
        if (isAuthError(issue)) {
          onSessionInvalid?.()
        } else {
          setOwnerState('denied')
        }
      })
    return () => {
      active = false
    }
  }, [session?.role, session?.token, onSessionInvalid])

  if (ownerState === 'checking') {
    return (
      <div className="center-wrap auth-shell">
        <section className="panel auth-card text-center">
          <div className="spinner-inline spinner-lg mb-16" />
          <h2 className="auth-title">Verifying Permissions</h2>
          <p className="auth-subtitle m-0">
            Checking owner privileges for your administrative session...
          </p>
        </section>
      </div>
    )
  }

  if (ownerState !== 'owner') {
    return <Navigate replace to="/pages/adash" />
  }

  return children
}

export default function App() {
  const [session, setSession] = useState(() => loadStoredSession())
  const [statusRevision, setStatusRevision] = useState(0)
  const [systemStatus, setSystemStatus] = useState(null)
  const [systemStatusState, setSystemStatusState] = useState('loading')
  const [statusLastCheckedAt, setStatusLastCheckedAt] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setSystemStatusState((prev) => (prev === 'available' ? 'available' : 'loading'))

    Promise.resolve(getSystemStatus(controller.signal))
      .then((result) => {
        if (!active) return
        if (result && typeof result === 'object') {
          setSystemStatus(result)
          setSystemStatusState('available')
        } else {
          setSystemStatusState('unavailable')
        }
        setStatusLastCheckedAt(new Date().toISOString())
      })
      .catch((err) => {
        if (!active || isAbortError(err)) return
        // Do not falsely report the entire website as in maintenance or offline on backend failure
        setSystemStatusState('unavailable')
        setStatusLastCheckedAt(new Date().toISOString())
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [statusRevision])

  useEffect(() => {
    // Poll system status at a 2-minute interval while the tab is visible
    // Note: Background API polling intentionally does NOT refresh user session activity.
    const timer = setInterval(() => {
      if (!document.hidden) {
        setStatusRevision((v) => v + 1)
      }
    }, STATUS_POLL_INTERVAL_MS)

    function handleVisibilityChange() {
      if (!document.hidden) {
        setStatusRevision((v) => v + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!session?.token) return undefined

    function handleUserActivity() {
      const refreshed = touchStoredSession()
      if (!refreshed) {
        setSession(null)
      }
    }

    const events = ['pointerdown', 'keydown', 'touchstart']
    for (const eventName of events) {
      window.addEventListener(eventName, handleUserActivity, { passive: true })
    }

    const expiryWatch = setInterval(() => {
      const valid = loadStoredSession()
      if (!valid) {
        setSession(null)
      }
    }, 60 * 1000)

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, handleUserActivity)
      }
      clearInterval(expiryWatch)
    }
  }, [session?.token])

  const handleRetryStatus = useCallback(() => {
    setStatusRevision((v) => v + 1)
  }, [])

  function handleSessionChange(nextSession) {
    setSession(nextSession)
  }

  function handleLogout() {
    clearStoredSession()
    setSession(null)
  }

  return (
    <ErrorBoundary>
      <MaintenanceGate onRetry={handleRetryStatus} systemStatus={systemStatus}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/pages/status"
              element={
                <StatusPage
                  lastCheckedAt={statusLastCheckedAt}
                  onRetry={handleRetryStatus}
                  systemStatus={systemStatus}
                  systemStatusState={systemStatusState}
                />
              }
            />
            <Route path="/pages/status.html" element={<Navigate replace to="/pages/status" />} />

            <Route
              element={
                <SiteLayout
                  onLogout={handleLogout}
                  session={session}
                  systemStatus={systemStatus}
                />
              }
            >
              <Route index element={<HomePage systemStatus={systemStatus} />} />
              <Route path="/index.html" element={<Navigate replace to="/" />} />

              {/* Software Studio Public Routes */}
              <Route path="/products" element={<StudioProductsPage />} />
              <Route path="/products/in-production" element={<InProductionPage />} />
              <Route path="/products/own-products" element={<OwnProductsPage />} />
              <Route path="/products/built-by-dsc" element={<BuiltByDscPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />

              <Route path="/services" element={<ServicesOverviewPage />} />
              <Route
                path="/services/websites"
                element={<ServiceDetailPage serviceSlug="websites" />}
              />
              <Route
                path="/services/android-applications"
                element={<ServiceDetailPage serviceSlug="android-applications" />}
              />
              <Route
                path="/services/game-development"
                element={<ServiceDetailPage serviceSlug="game-development" />}
              />

              <Route path="/team" element={<TeamPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Preserved Existing & Legacy Routes */}
              <Route path="/pages/apps" element={<AppsPage />} />
              <Route path="/pages/apps.html" element={<Navigate replace to="/pages/apps" />} />

              <Route path="/pages/websites" element={<WebsitesPage />} />
              <Route path="/pages/websites.html" element={<Navigate replace to="/pages/websites" />} />

              <Route path="/pages/products" element={<ProductsPage />} />
              <Route path="/pages/products.html" element={<Navigate replace to="/pages/products" />} />

              <Route path="/pages/catalog" element={<LegacyProductsCatalogPage />} />
              <Route path="/pages/catalog.html" element={<Navigate replace to="/pages/catalog" />} />

              <Route
                path="/pages/downloads"
                element={<DownloadsPage systemStatus={systemStatus} />}
              />
              <Route
                path="/pages/downloads.html"
                element={<Navigate replace to="/pages/downloads" />}
              />

              <Route path="/pages/about" element={<AboutPage />} />
              <Route path="/pages/about.html" element={<Navigate replace to="/pages/about" />} />

              <Route path="/pages/contact" element={<ContactPage />} />
              <Route path="/pages/contact.html" element={<Navigate replace to="/pages/contact" />} />

              <Route
                path="/pages/privacy-policy"
                element={<PrivacyPolicyPage />}
              />
              <Route
                path="/pages/privacy-policy.html"
                element={<Navigate replace to="/pages/privacy-policy" />}
              />
              <Route
                path="/pages/policy.html"
                element={<Navigate replace to="/pages/privacy-policy" />}
              />

              <Route path="/pages/terms" element={<TermsPage />} />
              <Route path="/pages/terms.html" element={<Navigate replace to="/pages/terms" />} />

              {/* DSC Account Authentication & Recovery Routes */}
              <Route
                path="/login"
                element={
                  <UserLoginPage
                    onSessionChange={handleSessionChange}
                    session={session}
                  />
                }
              />
              <Route
                path="/pages/ulogin"
                element={
                  <UserLoginPage
                    onSessionChange={handleSessionChange}
                    session={session}
                  />
                }
              />
              <Route
                path="/pages/Ulogin.html"
                element={<Navigate replace to="/pages/ulogin" />}
              />

              <Route
                path="/register"
                element={
                  <UserRegisterPage
                    onSessionChange={handleSessionChange}
                    session={session}
                  />
                }
              />
              <Route
                path="/pages/register"
                element={
                  <UserRegisterPage
                    onSessionChange={handleSessionChange}
                    session={session}
                  />
                }
              />
              <Route
                path="/pages/register.html"
                element={<Navigate replace to="/register" />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage session={session} />}
              />
              <Route
                path="/pages/forgot-password"
                element={<ForgotPasswordPage session={session} />}
              />
              <Route
                path="/pages/forgot-password.html"
                element={<Navigate replace to="/forgot-password" />}
              />

              <Route
                path="/pages/alogin"
                element={
                  <AdminLoginPage
                    onSessionChange={handleSessionChange}
                    session={session}
                  />
                }
              />
              <Route
                path="/pages/Alogin.html"
                element={<Navigate replace to="/pages/alogin" />}
              />

              <Route path="/pages/freepanel" element={<FreePanelPage />} />
              <Route
                path="/pages/freepanel.html"
                element={<Navigate replace to="/pages/freepanel" />}
              />

              <Route path="/pages/checkout" element={<CheckoutPage />} />
              <Route
                path="/pages/checkout.html"
                element={<Navigate replace to="/pages/checkout" />}
              />

              <Route
                path="/dashboard"
                element={
                  <RoleGate role="User" session={session}>
                    <UserDashboardPage
                      onLogout={handleLogout}
                      onSessionInvalid={handleLogout}
                      onSessionUpdate={handleSessionChange}
                      session={session}
                    />
                  </RoleGate>
                }
              />
              <Route
                path="/pages/udash"
                element={
                  <RoleGate role="User" session={session}>
                    <UserDashboardPage
                      onLogout={handleLogout}
                      onSessionInvalid={handleLogout}
                      onSessionUpdate={handleSessionChange}
                      session={session}
                    />
                  </RoleGate>
                }
              />
              <Route
                path="/pages/Udash.html"
                element={<Navigate replace to="/pages/udash" />}
              />

              <Route
                path="/pages/change"
                element={
                  <RoleGate allowMustChange role="User" session={session}>
                    <ChangePasswordPage
                      onSessionInvalid={handleLogout}
                      onSessionUpdate={handleSessionChange}
                      session={session}
                    />
                  </RoleGate>
                }
              />
              <Route
                path="/pages/change.html"
                element={<Navigate replace to="/pages/change" />}
              />

              <Route
                path="/pages/adash"
                element={
                  <RoleGate role="Admin" session={session}>
                    <AdminDashboardPage
                      onSessionInvalid={handleLogout}
                      session={session}
                      systemStatus={systemStatus}
                    />
                  </RoleGate>
                }
              />
              <Route
                path="/pages/Adash.html"
                element={<Navigate replace to="/pages/adash" />}
              />

              <Route
                path="/pages/ownerdb"
                element={
                  <RoleGate role="Admin" session={session}>
                    <OwnerGate onSessionInvalid={handleLogout} session={session}>
                      <AdminWorkspacePage onSessionInvalid={handleLogout} session={session} />
                    </OwnerGate>
                  </RoleGate>
                }
              />
              <Route
                path="/pages/OwnerDB.html"
                element={<Navigate replace to="/pages/ownerdb" />}
              />

              <Route
                path="/pages/generatekey"
                element={
                  <RoleGate role="Admin" session={session}>
                    <GenerateKeyPage onSessionInvalid={handleLogout} session={session} />
                  </RoleGate>
                }
              />
              <Route
                path="/pages/generateKey.html"
                element={<Navigate replace to="/pages/generatekey" />}
              />

              <Route path="/pages/404" element={<NotFoundPage />} />
              <Route path="/pages/404.html" element={<NotFoundPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </MaintenanceGate>
    </ErrorBoundary>
  )
}
