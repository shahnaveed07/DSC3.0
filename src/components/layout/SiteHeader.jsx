import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { pageLabels, primaryNavItems } from '../../content/siteContent'
import { checkOwnerAccess } from '../../services/dscApi'
import { getContextualMenu } from '../../utils/navigation'

function isExternal(target) {
  return /^https?:\/\//.test(String(target || ''))
}

export function SiteHeader({ session, systemStatus, onLogout, compact = false, wide = false }) {
  const location = useLocation()
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const menuToggleBtnRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [desktopDropdown, setDesktopDropdown] = useState(null)
  const [openSubmenus, setOpenSubmenus] = useState({ Products: true, Services: true })
  const [verifiedOwner, setVerifiedOwner] = useState(false)

  const isOwner = Boolean(session?.isOwner || verifiedOwner)

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

  const normalizedPath = useMemo(() => {
    const raw = location.pathname.toLowerCase().replace(/\.html$/i, '').replace(/\/+$/, '')
    return raw || '/'
  }, [location.pathname])

  const currentPageLabel = useMemo(() => {
    const currentPath = location.pathname.toLowerCase()
    const match = pageLabels.find((item) =>
      item.paths.some((path) => path.toLowerCase() === currentPath || path.toLowerCase() === normalizedPath),
    )

    return match?.label || ''
  }, [location.pathname, normalizedPath])

  const menuGroups = useMemo(() => {
    return getContextualMenu({
      pathname: location.pathname,
      session,
      isOwner,
      onLogout,
    })
  }, [location.pathname, session, isOwner, onLogout])

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
      if (!headerRef.current?.contains(event.target)) {
        setDesktopDropdown(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setDesktopDropdown(null)
        setMenuOpen((wasOpen) => {
          if (wasOpen) {
            menuToggleBtnRef.current?.focus()
          }
          return false
        })
      }
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function toggleSubmenu(label) {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  function isDesktopParentActive(item) {
    if (item.label === 'Products') {
      return (
        normalizedPath === '/products' ||
        normalizedPath.startsWith('/products/') ||
        normalizedPath.startsWith('/projects/')
      )
    }
    if (item.label === 'Services') {
      return normalizedPath === '/services' || normalizedPath.startsWith('/services/')
    }
    if (item.label === 'About') {
      return normalizedPath === '/about' || normalizedPath === '/pages/about'
    }
    if (item.label === 'Contact') {
      return normalizedPath === '/contact' || normalizedPath === '/pages/contact'
    }
    return normalizedPath === item.to
  }

  function handleMenuKeyDown(event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const panel = menuRef.current?.querySelector('#primary-menu')
    if (!panel) return

    const focusables = Array.from(
      panel.querySelectorAll('a.nav-link, button.nav-link-btn, button.nav-submenu-toggle'),
    ).filter((el) => !el.closest('[hidden]'))

    if (focusables.length === 0) return

    event.preventDefault()
    const currentIndex = focusables.indexOf(document.activeElement)

    if (event.key === 'Home') {
      focusables[0]?.focus()
    } else if (event.key === 'End') {
      focusables[focusables.length - 1]?.focus()
    } else if (event.key === 'ArrowDown') {
      const nextIndex = currentIndex < focusables.length - 1 ? currentIndex + 1 : 0
      focusables[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusables.length - 1
      focusables[prevIndex]?.focus()
    }
  }

  const accountRoute = session?.role === 'Admin' ? '/pages/adash' : '/pages/udash'

  return (
    <header
      ref={headerRef}
      className={`site-header ${compact ? 'site-header-compact' : ''} ${wide ? 'site-header-wide' : ''}`.trim()}
    >
      <NavLink
        className="logo-mark"
        to="/"
        aria-label="Dark Skull Corporation Home"
        onClick={() => {
          setDesktopDropdown(null)
          setMenuOpen(false)
        }}
      >
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

      {/* Desktop Software Studio Primary Navigation */}
      {!compact ? (
        <nav className="desktop-studio-nav" aria-label="Main navigation">
          <ul className="desktop-nav-list">
            {primaryNavItems.map((item) => {
              const hasChildren = Array.isArray(item.children) && item.children.length > 0
              const parentActive = isDesktopParentActive(item)
              const isDropdownOpen = desktopDropdown === item.label
              const dropdownId = `desktop-dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`

              if (hasChildren) {
                return (
                  <li
                    key={item.label}
                    className={`desktop-nav-item has-dropdown ${isDropdownOpen ? 'dropdown-open' : ''}`.trim()}
                  >
                    <div className="desktop-nav-trigger-group">
                      <NavLink
                        to={item.to}
                        end
                        className={`desktop-nav-link ${parentActive ? 'active' : ''}`.trim()}
                        onClick={() => setDesktopDropdown(null)}
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className={`desktop-dropdown-toggle ${parentActive || isDropdownOpen ? 'active' : ''}`.trim()}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                        aria-controls={dropdownId}
                        aria-label={`${item.label} dropdown`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDesktopDropdown((curr) => (curr === item.label ? null : item.label))
                        }}
                      >
                        <span
                          className={`desktop-dropdown-chevron ${isDropdownOpen ? 'open' : ''}`.trim()}
                          aria-hidden="true"
                        >
                          ▾
                        </span>
                      </button>
                    </div>

                    <div
                      id={dropdownId}
                      className="desktop-dropdown-panel"
                      role="region"
                      aria-label={`${item.label} submenu`}
                      hidden={!isDropdownOpen}
                    >
                      <NavLink
                        to={item.to}
                        end
                        className={({ isActive }) =>
                          `desktop-dropdown-overview ${isActive ? 'active' : ''}`.trim()
                        }
                        onClick={() => setDesktopDropdown(null)}
                      >
                        <span>{item.label} Overview</span>
                        <span aria-hidden="true">→</span>
                      </NavLink>
                      <div className="desktop-dropdown-items">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `desktop-dropdown-link ${isActive ? 'active' : ''}`.trim()
                            }
                            onClick={() => setDesktopDropdown(null)}
                          >
                            <span className="desktop-dropdown-title">{child.label}</span>
                            {child.description ? (
                              <span className="desktop-dropdown-desc">{child.description}</span>
                            ) : null}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </li>
                )
              }

              return (
                <li key={item.label} className="desktop-nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={`desktop-nav-link ${parentActive ? 'active' : ''}`.trim()}
                    onClick={() => setDesktopDropdown(null)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}

      <div className="header-actions">
        {currentPageLabel ? (
          <span className="current-page-label">{currentPageLabel}</span>
        ) : null}

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
          <>
            <NavLink
              to={accountRoute}
              className="button button-secondary header-account-link hide-mobile"
              title="Open Account Dashboard"
            >
              Account
            </NavLink>
            <button
              className="button button-secondary header-user-action"
              type="button"
              onClick={onLogout}
              title={`Sign out (${session.username || session.role})`}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink className="button button-primary header-user-action" to="/pages/ulogin">
            Login
          </NavLink>
        )}

        <div className="menu-container" ref={menuRef}>
          <button
            ref={menuToggleBtnRef}
            type="button"
            className="button button-secondary menu-toggle"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-controls="primary-menu"
            onClick={() => {
              setDesktopDropdown(null)
              setMenuOpen((isOpen) => !isOpen)
            }}
          >
            <span>Menu</span>
          </button>

          <nav
            id="primary-menu"
            className="menu-panel"
            aria-label="Contextual navigation"
            hidden={!menuOpen}
            onKeyDown={handleMenuKeyDown}
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

                    if (Array.isArray(item.children) && item.children.length > 0) {
                      const isSubmenuOpen = Boolean(openSubmenus[item.label])
                      const submenuId = `submenu-${String(item.label).toLowerCase().replace(/\s+/g, '-')}`

                      return (
                        <div key={item.to || item.label} className="nav-parent-group">
                          <div
                            className={`nav-parent-row ${item.isParentActive ? 'nav-parent-row-active' : ''}`.trim()}
                          >
                            <NavLink
                              to={item.to}
                              end
                              className={({ isActive }) =>
                                `nav-link nav-parent-link ${
                                  isActive || item.isCurrent
                                    ? 'active nav-link-active'
                                    : item.isParentActive
                                      ? 'nav-parent-active'
                                      : ''
                                }`.trim()
                              }
                              onClick={() => setMenuOpen(false)}
                            >
                              <span className="nav-link-text">{item.label}</span>
                              {item.isCurrent ? (
                                <span className="nav-active-dot" title="Current Page" aria-hidden="true" />
                              ) : null}
                            </NavLink>

                            <button
                              type="button"
                              className="nav-submenu-toggle"
                              aria-expanded={isSubmenuOpen}
                              aria-controls={submenuId}
                              aria-label={`Toggle ${item.label} submenu`}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSubmenu(item.label)
                              }}
                            >
                              <span
                                className={`nav-submenu-chevron ${isSubmenuOpen ? 'open' : ''}`.trim()}
                                aria-hidden="true"
                              >
                                ▾
                              </span>
                            </button>
                          </div>

                          <div
                            id={submenuId}
                            className="nav-submenu"
                            role="group"
                            aria-label={`${item.label} categories`}
                            hidden={!isSubmenuOpen}
                          >
                            {item.children.map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                className={({ isActive }) =>
                                  `nav-link nav-sublink ${isActive || child.isCurrent ? 'active nav-link-active' : ''}`.trim()
                                }
                                onClick={() => setMenuOpen(false)}
                              >
                                <span className="nav-link-text">{child.label}</span>
                                {child.isCurrent ? (
                                  <span className="nav-active-dot" title="Current Page" aria-hidden="true" />
                                ) : null}
                              </NavLink>
                            ))}
                          </div>
                        </div>
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
