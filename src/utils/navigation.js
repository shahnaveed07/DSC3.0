/**
 * Centralized contextual navigation logic for DSCWeb_React.
 * Evaluates current route, user role, and owner permissions
 * to return only relevant, purposeful navigation options in structured groups.
 */

function normalizePath(pathname = '') {
  const clean = String(pathname || '').toLowerCase().replace(/\/index\.html$/, '/')
  return clean.endsWith('.html') ? clean.replace(/\.html$/, '') : clean
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

    // If browsing public pages while logged in as admin, show concise contextual public links
    const isAdminTool = ['/pages/adash', '/pages/generatekey', '/pages/ownerdb'].includes(path)
    if (!isAdminTool) {
      const publicItems = [
        { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
        { label: 'Apps', to: '/pages/apps', isCurrent: path === '/pages/apps' },
        { label: 'Products', to: '/pages/products', isCurrent: path === '/pages/products' },
        { label: 'Contact', to: '/pages/contact', isCurrent: path === '/pages/contact' },
      ].filter((item) => !item.isCurrent)

      if (publicItems.length > 0) {
        groups.push({ title: 'Public Site', items: publicItems })
      }
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
      { label: 'Products / Store', to: '/pages/products', isCurrent: path === '/pages/products' },
      { label: 'Change Password', to: '/pages/change', isCurrent: path === '/pages/change' },
    ]

    const groups = [{ title: 'User Account', items: userItems }]

    // Secondary contextual exploration
    if (path === '/pages/udash' || path === '/pages/change') {
      groups.push({
        title: 'Explore',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      })
    } else {
      const publicLinks = [
        { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
        { label: 'Apps', to: '/pages/apps', isCurrent: path === '/pages/apps' },
        { label: 'Contact', to: '/pages/contact', isCurrent: path === '/pages/contact' },
      ].filter((item) => !item.isCurrent)

      if (publicLinks.length > 0) {
        groups.push({ title: 'Navigation', items: publicLinks })
      }
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

  // HOME (/)
  if (path === '/' || path === '' || path === '/index.html') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'About', to: '/pages/about' },
          { label: 'Contact', to: '/pages/contact' },
          { label: 'Status', to: '/pages/status' },
        ],
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

  // APPS (/pages/apps)
  if (path === '/pages/apps') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'About', to: '/pages/about' },
          { label: 'Contact', to: '/pages/contact' },
          { label: 'Status', to: '/pages/status' },
        ],
      },
      {
        title: 'Community',
        items: [{ label: 'Discord', href: 'https://discord.gg/XB2Zjmsb7K' }],
      },
      {
        title: 'Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // PRODUCTS (/pages/products)
  if (path === '/pages/products') {
    return [
      {
        title: 'Store & Catalog',
        items: [
          { label: 'Products', to: '/pages/products', isCurrent: true },
          { label: 'Checkout', to: '/pages/checkout' },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'About', to: '/pages/about' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      },
      {
        title: 'Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // DOWNLOADS (/pages/downloads)
  if (path === '/pages/downloads') {
    return [
      {
        title: 'Downloads',
        items: [
          { label: 'Downloads', to: '/pages/downloads', isCurrent: true },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Status', to: '/pages/status' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      },
      {
        title: 'Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // ABOUT (/pages/about)
  if (path === '/pages/about') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      },
      {
        title: 'Community',
        items: [{ label: 'Discord', href: 'https://discord.gg/XB2Zjmsb7K' }],
      },
    ]
  }

  // CONTACT (/pages/contact)
  if (path === '/pages/contact') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'About', to: '/pages/about' },
          { label: 'Status', to: '/pages/status' },
        ],
      },
      {
        title: 'Community',
        items: [{ label: 'Discord', href: 'https://discord.gg/XB2Zjmsb7K' }],
      },
    ]
  }

  // STATUS (/pages/status)
  if (path === '/pages/status') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      },
      {
        title: 'Access',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // CHECKOUT (/pages/checkout)
  if (path === '/pages/checkout') {
    return [
      {
        title: 'Checkout Navigation',
        items: [
          { label: 'Checkout', to: '/pages/checkout', isCurrent: true },
          { label: 'Products', to: '/pages/products' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'Home', to: '/' },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Account',
        items: [{ label: 'Client Login', to: '/pages/ulogin' }],
      },
    ]
  }

  // FREE PANEL (/pages/freepanel)
  if (path === '/pages/freepanel') {
    return [
      {
        title: 'Navigation',
        items: [
          { label: 'Free Panel', to: '/pages/freepanel', isCurrent: true },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Home', to: '/' },
          { label: 'Contact', to: '/pages/contact' },
        ],
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
        items: [
          { label: 'Home', to: '/' },
          { label: 'Apps', to: '/pages/apps' },
          { label: 'Products', to: '/pages/products' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'Contact', to: '/pages/contact' },
        ],
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
        items: [
          { label: 'Home', to: '/' },
          { label: 'Downloads', to: '/pages/downloads' },
          { label: 'Status', to: '/pages/status' },
          { label: 'Contact', to: '/pages/contact' },
        ],
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
          { label: 'Privacy Policy', to: '/pages/privacy-policy', isCurrent: path === '/pages/privacy-policy' || path === '/pages/policy' },
          { label: 'Terms of Service', to: '/pages/terms', isCurrent: path === '/pages/terms' },
        ],
      },
      {
        title: 'Navigation',
        items: [
          { label: 'Home', to: '/' },
          { label: 'About', to: '/pages/about' },
          { label: 'Contact', to: '/pages/contact' },
        ],
      },
    ]
  }

  // Fallback
  return [
    {
      title: 'Navigation',
      items: [
        { label: 'Home', to: '/' },
        { label: 'Apps', to: '/pages/apps' },
        { label: 'Products', to: '/pages/products' },
        { label: 'Downloads', to: '/pages/downloads' },
        { label: 'About', to: '/pages/about' },
        { label: 'Contact', to: '/pages/contact' },
        { label: 'Status', to: '/pages/status' },
      ],
    },
    {
      title: 'Access',
      items: [{ label: 'Client Login', to: '/pages/ulogin' }],
    },
  ]
}

/**
 * Canonical public showcase and content routes that require the website footer.
 */
export const FOOTER_PAGES = new Set([
  '/',
  '/pages/apps',
  '/pages/products',
  '/pages/downloads',
  '/pages/about',
  '/pages/contact',
  '/pages/privacy-policy',
  '/pages/terms',
])

/**
 * Checks whether the current path requires the full website footer.
 */
// export function isFooterNeeded(pathname = '/') {
//   const clean = normalizePath(pathname).replace(/\/+$/, '') || '/'
//   return FOOTER_PAGES.has(clean)
// }
export function isFooterNeeded(_pathname = '/') {
  return true
}

