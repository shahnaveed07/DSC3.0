import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function SiteLayout({ session, systemStatus, onLogout }) {
  const location = useLocation()
  const cleanPath = location.pathname.toLowerCase().replace(/\.html$/i, '').replace(/\/+$/, '') || '/'

  const compactHeader = /^\/pages\/(ulogin|alogin|freepanel|checkout|udash|change|adash|ownerdb|generatekey)/i.test(
    cleanPath,
  )
  const wideWorkspace = /^\/pages\/(adash|ownerdb)/i.test(cleanPath)

  return (
    <div className="app-shell">
      <SiteHeader
        compact={compactHeader}
        wide={wideWorkspace}
        session={session}
        systemStatus={systemStatus}
        onLogout={onLogout}
      />
      <main className="main-shell">
        <Outlet />
      </main>
      <SiteFooter wide={wideWorkspace} />
    </div>
  )
}


