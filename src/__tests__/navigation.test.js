import { describe, expect, it } from 'vitest'
import { getContextualMenu } from '../utils/navigation'

describe('Contextual Navigation', () => {
  it('generates public menu items for guest browsing home', () => {
    const menu = getContextualMenu({
      pathname: '/',
      session: null,
      isOwner: false,
    })

    const navGroup = menu.find((g) => g.title === 'Navigation')
    expect(navGroup).toBeTruthy()

    const labels = navGroup.items.map((i) => i.label)
    expect(labels).toContain('Apps')
    expect(labels).toContain('Products')
    expect(labels).toContain('Downloads')
    expect(labels).toContain('About')
    expect(labels).toContain('Contact')
  })

  it('generates user account menu for authenticated user', () => {
    const userSession = { role: 'User', username: 'john_doe' }
    const menu = getContextualMenu({
      pathname: '/pages/udash',
      session: userSession,
      isOwner: false,
    })

    const accountGroup = menu.find((g) => g.title === 'User Account')
    expect(accountGroup).toBeTruthy()

    const labels = accountGroup.items.map((i) => i.label)
    expect(labels).toContain('Dashboard')
    expect(labels).toContain('Downloads')
    expect(labels).toContain('Products / Store')
    expect(labels).toContain('Change Password')

    const sessionGroup = menu.find((g) => g.title === 'Session')
    expect(sessionGroup).toBeTruthy()
    expect(sessionGroup.items.some((i) => i.label === 'Logout')).toBe(true)
  })

  it('generates admin controls for authenticated admin without owner probe', () => {
    const adminSession = { role: 'Admin', username: 'admin1' }
    const menu = getContextualMenu({
      pathname: '/pages/adash',
      session: adminSession,
      isOwner: false,
    })

    const adminGroup = menu.find((g) => g.title === 'Admin Controls')
    expect(adminGroup).toBeTruthy()

    const labels = adminGroup.items.map((i) => i.label)
    expect(labels).toContain('Admin Dashboard')
    expect(labels).toContain('Generate Key')
    // OwnerDB must NOT be displayed without verified owner claim
    expect(labels).not.toContain('OwnerDB')
  })

  it('includes OwnerDB when admin has verified owner access', () => {
    const adminSession = { role: 'Admin', username: 'lead_owner', isOwner: true }
    const menu = getContextualMenu({
      pathname: '/pages/adash',
      session: adminSession,
      isOwner: true,
    })

    const adminGroup = menu.find((g) => g.title === 'Admin Controls')
    const labels = adminGroup.items.map((i) => i.label)
    expect(labels).toContain('OwnerDB')
  })
})
