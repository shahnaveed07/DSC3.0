import { describe, expect, it } from 'vitest'
import { ApiError, extractApiMessage, isAuthError } from '../services/dscApi'

describe('API Service Contracts', () => {
  it('extracts API error messages from multiple payload shapes', () => {
    expect(extractApiMessage('Direct error string', 'fallback')).toBe('Direct error string')
    expect(extractApiMessage({ error: 'Database locked' }, 'fallback')).toBe('Database locked')
    expect(extractApiMessage({ message: 'Invalid token' }, 'fallback')).toBe('Invalid token')
    expect(extractApiMessage({ title: 'Unauthorized access' }, 'fallback')).toBe('Unauthorized access')
    expect(extractApiMessage({}, 'Default fallback')).toBe('Default fallback')
    expect(extractApiMessage(null, 'Default fallback')).toBe('Default fallback')
  })

  it('correctly identifies auth errors (401 and 403)', () => {
    const err401 = new ApiError('Unauthorized', { status: 401 })
    const err403 = new ApiError('Forbidden', { status: 403 })
    const err500 = new ApiError('Server Error', { status: 500 })
    const genericErr = new Error('Generic')

    expect(isAuthError(err401)).toBe(true)
    expect(isAuthError(err403)).toBe(true)
    expect(isAuthError(err500)).toBe(false)
    expect(isAuthError(genericErr)).toBe(false)
  })
})
