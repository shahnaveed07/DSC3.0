/**
 * Centralized contextual navigation logic for DSC3.0.
 * Evaluates current route, user role, and owner permissions
 * to return structured navigation groups with Products organized into:
 * 1. Android Applications (/pages/apps)
 * 2. Websites (/pages/websites)
 */

function normalizePath(pathname = '') {
  const clean = String(pathname || '').toLowerCase().replace(/\/index\.html$/, '/')
  return clean.endsWith('.html') ? clean.replace(/\.html$/, '') : clean
}

function buildProductsNavItem(path) {
  const isProductsOverview = path === '/pages/products'
  const isAndroidApps = path === '/pages/apps'
  const isWebsites = path === '/pages/websites'
  const isParentActive = isProductsOverview || isAndroidApps || isWebsites

  return {
    label: 'Products',
    to: '/pages/products',
    isCurrent: isProductsOverview,
    isParentActive,
    children: [
      {
        label: 'Android Applications',
        to: '/pages/apps',
        isCurrent: isAndroidApps,
      },
      {
        label: 'Websites',
        to: '/pages/websites',
        isCurrent: isWebsites,
      },
    ],
  }
}

function buildPublicNavigationItems(path) {
  return [
    { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
    buildProductsNavItem(path),
    { label: 'Downloads', to: '/pages/downloads', isCurrent: path === '/pages/downloads' },
    { label: 'About', to: '/pages/about', isCurrent: path === '/pages/about' },
    { label: 'Contact', to: '/pages/contact', isCurrent: path === '/pages/contact' },
    { label: 'Status', to: '/pages/status', isCurrent: path === '/pages/status' },
  ]
}

export function getContextualMenu({ pathname = '/', session = null, isOwner = false, onLogout }) {
  const path = normalizePath(pathname)
  const role = session?.role

  // ---------------------------------------------------------------------------
  // 1. ADMIN LOGGED-IN CONTEXT
  // ---------------------------------------------------------------------------
  if (role === 'Admin') {
    const adminItems = [
      { label: 'Admin Dashboard', to: '/pages/adash', isCurrent: path === '/pages/adash' },
      { label: 'Generate Key', to: '/pages/generatekey', isCurrent: path === '/pages/generatekey' },
    ]

    // Only expose OwnerDB if verified owner
    if (isOwner) {
      adminItems.push({
        label: 'OwnerDB',
        to: '/pages/ownerdb',
        isCurrent: path === '/pages/ownerdb',
        badge: 'Owner',
      })
    }

    const operationsItems = [
      { label: 'Download Panel', to: '/pages/downloads', isCurrent: path === '/pages/downloads' },
      { label: 'System Status', to: '/pages/status', isCurrent: path === '/pages/status' },
    ]

    const groups = [
      { title: 'Admin Controls', items: adminItems },
      { title: 'Operations', items: operationsItems },
    ]

    // If browsing public pages while logged in as admin, show public navigation
    const isAdminTool = ['/pages/adash', '/pages/generatekey', '/pages/ownerdb'].includes(path)
    if (!isAdminTool) {
      groups.push({
        title: 'Public Site',
        items: [
          { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
          buildProductsNavItem(path),
          { label: 'About', to: '/pages/about', isCurrent: path === '/pages/about' },
          { label: 'Contact', to: '/pages/contact', isCurrent: path === '/pages/contact' },
        ],
      })
    }

    groups.push({
      title: 'Session',
      items: [
        {
          label: 'Logout',
          isAction: true,
          onClick: onLogout,
          isDestructive: true,
        },
      ],
    })

    return groups
  }

  // ---------------------------------------------------------------------------
  // 2. USER LOGGED-IN CONTEXT
  // ---------------------------------------------------------------------------
  if (role === 'User') {
    const userItems = [
      { label: 'Dashboard', to: '/pages/udash', isCurrent: path === '/pages/udash' },
      { label: 'Downloads', to: '/pages/downloads', isCurrent: path === '/pages/downloads' },
      { label: 'Products / Store', to: '/pages/catalog', isCurrent: path === '/pages/catalog' },
      { label: 'Change Password', to: '/pages/change', isCurrent: path === '/pages/change' },
    ]

    const groups = [{ title: 'User Account', items: userItems }]

    // Secondary contextual exploration
    if (path === '/pages/udash' || path === '/pages/change') {
      groups.push({
        title: 'Explore',
        items: [
          { label: 'Home', to: '/' },
          buildProductsNavItem(path),
          { label: 'About', to: '/pages/about' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      })
    } else {
      groups.push({
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
          buildProductsNavItem(path),
          { label: 'About', to: '/pages/about', isCurrent: path === '/pages/about' },
          { label: 'Contact', to: '/pages/contact', isCurrent: path === '/pages/contact' },
        ],
      })
    }

    groups.push({
      title: 'Session',
      items: [
        {
          label: 'Logout',
          isAction: true,
          onClick: onLogout,
          isDestructive: true,
        },
      ],
    })

    return groups
  }

  // ---------------------------------------------------------------------------
  // 3. PUBLIC / GUEST CONTEXT (BY CURRENT PAGE)
  // ---------------------------------------------------------------------------

  // CHECKOUT (/pages/checkout)
  if (path === '/pages/checkout') {
    return [
      {
        title: 'Checkout Navigation',
        items: [
          { label: 'Checkout', to: '/pages/checkout', isCurrent: true },
          { label: 'Software Catalog', to: '/pages/catalog' },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Account',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // LEGACY SOFTWARE CATALOG (/pages/catalog)
  if (path === '/pages/catalog') {
    return [
      {
        title: 'Store & Catalog',
        items: [
          { label: 'Software Catalog', to: '/pages/catalog', isCurrent: true },
          { label: 'Checkout', to: '/pages/checkout' },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // FREE PANEL (/pages/freepanel)
  if (path === '/pages/freepanel') {
    return [
      {
        title: 'Evaluation',
        items: [
          { label: 'Free Panel', to: '/pages/freepanel', isCurrent: true },
          { label: 'Software Catalog', to: '/pages/catalog' },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Account',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // USER LOGIN (/pages/ulogin)
  if (path === '/pages/ulogin') {
    return [
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Admin Access',
        items: [{ label: 'Admin Portal', to: '/pages/alogin' }],
      },
    ]
  }

  // ADMIN LOGIN (/pages/alogin)
  if (path === '/pages/alogin') {
    return [
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Client Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // LEGAL PAGES (/pages/privacy-policy, /pages/terms, /pages/policy)
  if (path === '/pages/privacy-policy' || path === '/pages/terms' || path === '/pages/policy') {
    return [
      {
        title: 'Policies',
        items: [
          {
            label: 'Privacy Policy',
            to: '/pages/privacy-policy',
            isCurrent: path === '/pages/privacy-policy' || path === '/pages/policy',
          },
          {
            label: 'Terms of Service',
            to: '/pages/terms',
            isCurrent: path === '/pages/terms',
          },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
    ]
  }

  // STANDARD PUBLIC PAGES (/, /pages/products, /pages/apps, /pages/websites, /pages/downloads, /pages/about, /pages/contact, /pages/status)
  return [
    {
      title: 'Navigation',
      items: buildPublicNavigationItems(path),
    },
    {
      title: 'Community',
      items: [{ label: 'Discord', href: 'https://discord.gg/XB2Zjmsb7K' }],
    },
    {
      title: 'Access Portals',
      items: [
        { label: 'Client Login', to: '/pages/ulogin' },
        { label: 'Admin Portal', to: '/pages/alogin' },
      ],
    },
  ]
}

/**
 * Canonical public showcase and content routes that require the website footer.
 */
export const FOOTER_PAGES = new Set([
  '/',
  '/pages/apps',
  '/pages/websites',
  '/pages/products',
  '/pages/downloads',
  '/pages/about',
  '/pages/contact',
  '/pages/privacy-policy',
  '/pages/terms',
])

export function isFooterNeeded(_pathname = '/') {
  return true
}
