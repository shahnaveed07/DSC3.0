import { describe, expect, it } from 'vitest'
import { getContextualMenu } from '../utils/navigation'

describe('Contextual Navigation — DSC Software Studio Architecture', () => {
  it('generates public menu items with Products (In Production, Own Products, Built by DSC), Services (Website, Android, Game Development), Our Team, About, and Contact', () => {
    const menu = getContextualMenu({
      pathname: '/',
      session: null,
      isOwner: false,
    })

    const navGroup = menu.find((g) => g.title === 'Navigation')
    expect(navGroup).toBeTruthy()

    const labels = navGroup.items.map((i) => i.label)
    expect(labels).toContain('Home')
    expect(labels).toContain('Products')
    expect(labels).toContain('Services')
    expect(labels).toContain('Our Team')
    expect(labels).toContain('About')
    expect(labels).toContain('Contact')

    const productsItem = navGroup.items.find((i) => i.label === 'Products')
    expect(productsItem).toBeTruthy()
    expect(productsItem.to).toBe('/products')
    expect(productsItem.children.map((c) => c.label)).toEqual([
      'In Production',
      'Own Products',
      'Built by DSC',
    ])
    expect(productsItem.children.map((c) => c.to)).toEqual([
      '/products/in-production',
      '/products/own-products',
      '/products/built-by-dsc',
    ])

    const servicesItem = navGroup.items.find((i) => i.label === 'Services')
    expect(servicesItem).toBeTruthy()
    expect(servicesItem.to).toBe('/services')
    expect(servicesItem.children.map((c) => c.label)).toEqual([
      'Website Development',
      'Android Application Development',
      'Game Development',
    ])
    expect(servicesItem.children.map((c) => c.to)).toEqual([
      '/services/websites',
      '/services/android-applications',
      '/services/game-development',
    ])
  })

  it('sets active state on Products and Services parent and child items accurately', () => {
    const inProdMenu = getContextualMenu({ pathname: '/products/in-production', session: null })
    const inProdProducts = inProdMenu
      .find((g) => g.title === 'Navigation')
      .items.find((i) => i.label === 'Products')
    expect(inProdProducts.isParentActive).toBe(true)
    expect(inProdProducts.isCurrent).toBe(false)
    expect(inProdProducts.children[0].isCurrent).toBe(true)

    const gameServiceMenu = getContextualMenu({
      pathname: '/services/game-development',
      session: null,
    })
    const servicesNav = gameServiceMenu
      .find((g) => g.title === 'Navigation')
      .items.find((i) => i.label === 'Services')
    expect(servicesNav.isParentActive).toBe(true)
    expect(servicesNav.isCurrent).toBe(false)
    expect(servicesNav.children[2].isCurrent).toBe(true)
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
