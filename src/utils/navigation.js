/**
 * Centralized contextual navigation logic for DSC3.0 Software Studio.
 * Evaluates current route, user role, and owner permissions
 * to return structured navigation groups with:
 * - Products (In Production, Own Products, Built by DSC)
 * - Services (Website Development, Android Application Development, Game Development)
 * - Our Team, About, Contact, and role-specific User/Admin controls.
 */

function normalizePath(pathname = '') {
  const clean = String(pathname || '')
    .toLowerCase()
    .replace(/\/index\.html$/, '/')
    .replace(/\/+$/, '')
  const withoutHtml = clean.endsWith('.html') ? clean.replace(/\.html$/, '') : clean
  return withoutHtml || '/'
}

export function buildProductsNavItem(path) {
  const isProductsOverview = path === '/products'
  const isInProduction = path === '/products/in-production'
  const isOwnProducts = path === '/products/own-products'
  const isBuiltByDsc = path === '/products/built-by-dsc'
  const isProjectDetail = path.startsWith('/projects/')
  const isLegacyApps = path === '/pages/apps' || path === '/pages/websites'

  const isParentActive =
    isProductsOverview ||
    isInProduction ||
    isOwnProducts ||
    isBuiltByDsc ||
    isProjectDetail ||
    isLegacyApps

  return {
    label: 'Products',
    to: '/products',
    isCurrent: isProductsOverview,
    isParentActive,
    children: [
      {
        label: 'In Production',
        to: '/products/in-production',
        isCurrent: isInProduction,
      },
      {
        label: 'Own Products',
        to: '/products/own-products',
        isCurrent: isOwnProducts,
      },
      {
        label: 'Built by DSC',
        to: '/products/built-by-dsc',
        isCurrent: isBuiltByDsc,
      },
    ],
  }
}

export function buildServicesNavItem(path) {
  const isServicesOverview = path === '/services'
  const isWebsites = path === '/services/websites'
  const isAndroidApps = path === '/services/android-applications'
  const isGameDev = path === '/services/game-development'

  const isParentActive =
    isServicesOverview || isWebsites || isAndroidApps || isGameDev

  return {
    label: 'Services',
    to: '/services',
    isCurrent: isServicesOverview,
    isParentActive,
    children: [
      {
        label: 'Website Development',
        to: '/services/websites',
        isCurrent: isWebsites,
      },
      {
        label: 'Android Application Development',
        to: '/services/android-applications',
        isCurrent: isAndroidApps,
      },
      {
        label: 'Game Development',
        to: '/services/game-development',
        isCurrent: isGameDev,
      },
    ],
  }
}

export function buildPublicNavigationItems(path) {
  const isAbout = path === '/about' || path === '/pages/about'
  const isContact = path === '/contact' || path === '/pages/contact'

  return [
    { label: 'Home', to: '/', isCurrent: path === '/' || path === '' },
    buildProductsNavItem(path),
    buildServicesNavItem(path),
    { label: 'Our Team', to: '/team', isCurrent: path === '/team' },
    { label: 'About', to: '/about', isCurrent: isAbout },
    { label: 'Contact', to: '/contact', isCurrent: isContact },
    { label: 'Downloads', to: '/pages/downloads', isCurrent: path === '/pages/downloads' },
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
        items: buildPublicNavigationItems(path),
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
    const isDashboardPath = path === '/pages/udash' || path === '/dashboard'
    const userItems = [
      { label: 'Dashboard', to: '/pages/udash', isCurrent: isDashboardPath },
      { label: 'Downloads', to: '/pages/downloads', isCurrent: path === '/pages/downloads' },
      {
        label: 'Products / Store',
        to: '/pages/products',
        isCurrent: path === '/pages/products' || path === '/pages/catalog',
      },
      { label: 'Change Password', to: '/pages/change', isCurrent: path === '/pages/change' },
    ]

    const groups = [{ title: 'User Account', items: userItems }]

    // Secondary contextual exploration
    if (isDashboardPath || path === '/pages/change') {
      groups.push({
        title: 'Explore',
        items: buildPublicNavigationItems(path),
      })
    } else {
      groups.push({
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
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
          { label: 'Software Catalog', to: '/pages/products' },
          { label: 'Free Panel', to: '/pages/freepanel' },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Account',
        items: [
          { label: 'Client Login', to: '/pages/ulogin' },
          { label: 'Create Account', to: '/register' },
        ],
      },
    ]
  }

  // LEGACY SOFTWARE CATALOG (/pages/products or /pages/catalog)
  if (path === '/pages/products' || path === '/pages/catalog') {
    return [
      {
        title: 'Store & Catalog',
        items: [
          { label: 'Software Catalog', to: '/pages/products', isCurrent: true },
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
        items: [
          { label: 'Client Login', to: '/pages/ulogin' },
          { label: 'Create Account', to: '/register' },
        ],
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
          { label: 'Software Catalog', to: '/pages/products' },
        ],
      },
      {
        title: 'Navigation',
        items: buildPublicNavigationItems(path),
      },
      {
        title: 'Account',
        items: [
          { label: 'Client Login', to: '/pages/ulogin' },
          { label: 'Create Account', to: '/register' },
        ],
      },
    ]
  }

  // USER LOGIN, REGISTER, FORGOT PASSWORD
  if (
    path === '/pages/ulogin' ||
    path === '/login' ||
    path === '/register' ||
    path === '/pages/register' ||
    path === '/forgot-password' ||
    path === '/pages/forgot-password'
  ) {
    return [
      {
        title: 'Account Access',
        items: [
          {
            label: 'Client Login',
            to: '/pages/ulogin',
            isCurrent: path === '/pages/ulogin' || path === '/login',
          },
          {
            label: 'Create Account',
            to: '/register',
            isCurrent: path === '/register' || path === '/pages/register',
          },
          {
            label: 'Forgot Password',
            to: '/forgot-password',
            isCurrent: path === '/forgot-password' || path === '/pages/forgot-password',
          },
        ],
      },
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
        items: [
          { label: 'Client Login', to: '/pages/ulogin' },
          { label: 'Create Account', to: '/register' },
        ],
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

  // STANDARD PUBLIC PAGES
  return [
    {
      title: 'Navigation',
      items: buildPublicNavigationItems(path),
    },
    {
      title: 'Resources & Catalog',
      items: [
        { label: 'Android Apps & Games', to: '/pages/apps', isCurrent: path === '/pages/apps' },
        { label: 'Software Catalog', to: '/pages/products' },
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
        { label: 'Create Account', to: '/register' },
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
  '/products',
  '/products/in-production',
  '/products/own-products',
  '/products/built-by-dsc',
  '/services',
  '/services/websites',
  '/services/android-applications',
  '/services/game-development',
  '/team',
  '/about',
  '/contact',
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
