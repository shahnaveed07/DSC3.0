import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { pageLabels } from '../../content/siteContent'
import { checkOwnerAccess } from '../../services/dscApi'
import { getContextualMenu } from '../../utils/navigation'

function isExternal(target) {
  return /^https?:\/\//.test(String(target || ''))
}

const THEME_STORAGE_KEY = 'dscThemePreferenceV2'

function resolveInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
  } catch {
    // Ignore localStorage access errors.
  }
  const currentAttr = document.documentElement.getAttribute('data-theme')
  if (currentAttr === 'light' || currentAttr === 'dark') {
    return currentAttr
  }
  return 'light'
}

export function SiteHeader({ session, systemStatus, onLogout, compact = false, wide = false }) {
  const location = useLocation()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [verifiedOwner, setVerifiedOwner] = useState(false)

  const isOwner = Boolean(session?.isOwner || verifiedOwner)

  const [theme, setThemeState] = useState(resolveInitialTheme)

  // Check and keep owner permission updated for admin sessions
  useEffect(() => {
    let active = true
    if (session?.role === 'Admin' && session?.token && !session?.isOwner) {
      checkOwnerAccess(session.token)
        .then((ownerRes) => {
          if (active) setVerifiedOwner(Boolean(ownerRes))
        })
        .catch(() => {
          if (active) setVerifiedOwner(false)
        })
    }
    return () => {
      active = false
    }
  }, [session])

  const currentPageLabel = useMemo(() => {
    const currentPath = location.pathname.toLowerCase()
    const match = pageLabels.find((item) =>
      item.paths.some((path) => path.toLowerCase() === currentPath),
    )

    return match?.label || ''
  }, [location.pathname])

  const menuGroups = useMemo(() => {
    return getContextualMenu({
      pathname: location.pathname,
      session,
      isOwner,
      onLogout,
    })
  }, [location.pathname, session, isOwner, onLogout])

  useEffect(() => {
    const validTheme = theme === 'light' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', validTheme)
    document.documentElement.style.colorScheme = validTheme

    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', validTheme === 'light' ? '#F8FAFC' : '#0B1220')
    }
  }, [theme])

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function toggleTheme() {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } catch {
        // Ignore localStorage access errors.
      }
      return nextTheme
    })
  }

  return (
    <header
      className={`site-header ${compact ? 'site-header-compact' : ''} ${wide ? 'site-header-wide' : ''}`.trim()}
    >
      <NavLink className="logo-mark" to="/" aria-label="Dark Skull Corporation Home">
        <picture>
          <source srcSet="/images/dsclogo.webp" type="image/webp" />
          <img
            src="/images/dsclogo.png"
            alt="Dark Skull Corporation logo"
            className="header-logo-img"
            width="36"
            height="36"
            loading="eager"
          />
        </picture>
        <span>
          <strong className="logo-text">Dark Skull Corporation</strong>
        </span>
      </NavLink>

      <div className="header-actions">
        {currentPageLabel ? (
          <span className="current-page-label">{currentPageLabel}</span>
        ) : null}

        <button
          type="button"
          className="button button-secondary theme-toggle"
          aria-label={`Switch to ${theme === 'dark' ? 'light mode' : 'dark mode'}`}
          onClick={toggleTheme}
        >
          <span className="theme-toggle-full">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          <span className="theme-toggle-compact">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {systemStatus?.showHomeDownloadBtn || systemStatus?.ShowHomeDownloadBtn ? (
          <NavLink
            to="/pages/downloads"
            className="button button-secondary header-download-btn"
            title="Download Software Panel"
          >
            📥 Download<span className="hide-mobile">&nbsp;Panel</span>
          </NavLink>
        ) : null}

        {session ? (
          <button
            className="button button-secondary header-user-action"
            type="button"
            onClick={onLogout}
            title={`Sign out (${session.username || session.role})`}
          >
            Logout
          </button>
        ) : (
          <NavLink className="button button-primary header-user-action" to="/pages/ulogin">
            Login
          </NavLink>
        )}

        <div className="menu-container" ref={menuRef}>
          <button
            type="button"
            className="button button-secondary menu-toggle"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span>Menu</span>
          </button>

          <nav
            id="primary-menu"
            className="menu-panel"
            aria-label="Contextual navigation"
            hidden={!menuOpen}
          >
            {menuGroups.map((group, groupIdx) => (
              <div key={group.title || groupIdx} className="menu-group">
                {group.title ? (
                  <div className="menu-group-header">{group.title}</div>
                ) : null}
                <div className="menu-group-items">
                  {group.items.map((item, itemIdx) => {
                    if (item.isAction) {
                      return (
                        <button
                          key={item.label || itemIdx}
                          type="button"
                          className={`nav-link nav-link-btn ${item.isDestructive ? 'nav-link-destructive' : ''}`}
                          onClick={() => {
                            setMenuOpen(false)
                            item.onClick?.()
                          }}
                        >
                          <span className="nav-link-text">{item.label}</span>
                        </button>
                      )
                    }

                    if (item.href) {
                      return (
                        <a
                          key={item.href}
                          className="nav-link"
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="nav-link-text">{item.label}</span>
                          <span className="nav-external-arrow" aria-hidden="true">↗</span>
                        </a>
                      )
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          `nav-link ${isActive || item.isCurrent ? 'active nav-link-active' : ''}`.trim()
                        }
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="nav-link-text">{item.label}</span>
                        {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                        {item.isCurrent ? <span className="nav-active-dot" title="Current Page" aria-hidden="true" /> : null}
                      </NavLink>
                    )
                  })}
                </div>
                {groupIdx < menuGroups.length - 1 ? <div className="menu-divider" role="separator" /> : null}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export function ButtonLink({ action, className = 'button button-primary' }) {
  if (!action) return null

  if (action.disabled) {
    return (
      <span className={`${className} button-disabled`.trim()} aria-disabled="true">
        {action.label}
      </span>
    )
  }

  if (isExternal(action.href)) {
    return (
      <a className={className} href={action.href} target="_blank" rel="noreferrer">
        {action.label}
      </a>
    )
  }

  if (action.href) {
    return (
      <a className={className} href={action.href}>
        {action.label}
      </a>
    )
  }

  return (
    <NavLink className={className} to={action.to}>
      {action.label}
    </NavLink>
  )
}
