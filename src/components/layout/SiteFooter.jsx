import { NavLink } from 'react-router-dom'
import { footerGroups, socialLinksConfig } from '../../content/siteContent'

export function SiteFooter({ wide = false }) {
  return (
    <footer id="dsc-footer" className="developer-footer">
      <div className={`footer-container ${wide ? 'footer-container-wide' : ''}`.trim()}>
        {/* Multi-Group Software Studio Footer */}
        <div className="footer-grid">
          {/* Column 1: DSC Company Information */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <picture>
                <source srcSet="/images/dsclogo.webp" type="image/webp" />
                <img
                  src="/images/dsclogo.png"
                  alt="Dark Skull Corporation logo"
                  className="footer-logo-img"
                  width="32"
                  height="32"
                  loading="lazy"
                />
              </picture>
              <strong className="footer-brand-name">Dark Skull Corporation</strong>
            </div>
            <p className="footer-brand-desc">
              Independent software development studio building Android applications, interactive games, and custom responsive websites.
            </p>

            {/* Centralized Social Media & Community Links */}
            <div className="footer-social-section">
              <span className="footer-col-title">Official Social &amp; Community</span>
              <div className="footer-social-list">
                {socialLinksConfig.map((social) =>
                  social.url ? (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-pill"
                    >
                      <span>{social.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span
                      key={social.id}
                      className="footer-social-pill footer-social-pending"
                      title={`${social.label} official link will be added when published`}
                    >
                      <span>{social.label}</span>
                      <small className="footer-social-tag">Soon</small>
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Columns 2–5: Main Navigation, Products, Services, Contact & Legal */}
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-col">
              <h3 className="footer-col-title">{group.title}</h3>
              <ul className="footer-link-list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="footer-nav-link"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <NavLink to={link.to} className="footer-nav-link">
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2026 Dark Skull Corporation. All rights reserved.
          </p>
          <p className="footer-credit">
            Developed by{' '}
            <a
              href="https://naveedmushtaq.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-developer-link"
              title="Visit Developer's Portfolio"
            >
              Naveed Mushtaq
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
