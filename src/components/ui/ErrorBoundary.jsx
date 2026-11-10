import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="status-layout" role="alert" aria-live="assertive">
          <section className="panel status-panel">
            <picture>
              <source srcSet="/images/dsclogo.webp" type="image/webp" />
              <img
                src="/images/dsclogo.png"
                alt="Dark Skull Corporation"
                className="status-logo"
                width="72"
                height="72"
              />
            </picture>
            <span className="hero-eyebrow text-warning">Application Notice</span>
            <h1 className="auth-title mt-6">Something Went Wrong</h1>
            <p className="auth-subtitle mt-6">
              An unexpected issue occurred while rendering this view. You can reload the application or return safely to the home page.
            </p>
            <div className="status-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={this.handleReload}
              >
                Reload Application
              </button>
              <Link
                to="/"
                className="button button-secondary"
                onClick={this.handleReset}
              >
                Return to Home
              </Link>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
