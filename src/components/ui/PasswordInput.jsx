import { useState } from 'react'

export function PasswordInput({
  id,
  name,
  value = '',
  onChange,
  placeholder = 'Enter password',
  autoComplete = 'current-password',
  disabled = false,
  readOnly = false,
  required = false,
  minLength,
  maxLength,
  className = '',
  wrapperClassName = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false)

  const handleToggle = (e) => {
    e.preventDefault()
    if (!disabled && !readOnly) {
      setIsVisible((prev) => !prev)
    }
  }

  const toggleLabel = isVisible ? 'Hide password' : 'Show password'

  return (
    <div className={`password-input-wrapper ${wrapperClassName}`.trim()}>
      <input
        id={id}
        name={name}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={className}
        {...props}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={handleToggle}
        disabled={disabled || readOnly}
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        title={toggleLabel}
        tabIndex={0}
      >
        {isVisible ? (
          /* Eye-Off (password is visible, click to hide) */
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        ) : (
          /* Eye (password is hidden, click to show) */
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
