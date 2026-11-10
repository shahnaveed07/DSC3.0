export function SiteFooter({ wide = false }) {
  return (
    <footer id="dsc-footer" className="developer-footer">
      <div className={`footer-container ${wide ? 'footer-container-wide' : ''}`.trim()}>
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
