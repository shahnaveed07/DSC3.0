export const SITE_NAME = 'Dark Skull Corporation'
export const SITE_SHORT_NAME = 'DSC'
export const SITE_URL = 'https://dscweb.me'
export const DEFAULT_OG_IMAGE = 'https://dscweb.me/images/dsclogo.png'

/**
 * Verified existing social image is /images/dsclogo.png (1280x1280 square).
 * Because it is 1:1 square rather than a 1200x630 landscape banner, default twitter:card
 * is set to "summary" so platforms do not crop the square logo.
 * Recommended future landscape share card specification:
 */
export const RECOMMENDED_SOCIAL_IMAGE_SPEC = {
  recommendedPath: '/images/og-cover-1200x630.png',
  width: 1200,
  height: 630,
  currentVerifiedImage: DEFAULT_OG_IMAGE,
  currentDimensions: '1280x1280',
}

export const FOUNDER_INFO = {
  name: 'Naveed Mushtaq',
  jobTitle: 'Founder & Lead Developer',
  designation: 'Naveed Mushtaq — Founder & Lead Developer',
  url: 'https://naveedmushtaq.tech/',
  github: 'https://github.com/shahnaveed07',
}

export const APPROVED_COMPANY_DESCRIPTION =
  'Dark Skull Corporation (DSC) is an independent software development studio primarily focused on Android application development and game development. We also offer custom website design and development for individuals, businesses and companies on request.'

export const BASE_SCHEMA_GRAPH = [
  {
    '@type': 'Organization',
    '@id': 'https://dscweb.me/#organization',
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: 'https://dscweb.me/',
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_OG_IMAGE,
      width: 1280,
      height: 1280,
    },
    description: APPROVED_COMPANY_DESCRIPTION,
    founder: {
      '@type': 'Person',
      '@id': 'https://naveedmushtaq.tech/#person',
      name: FOUNDER_INFO.name,
      jobTitle: FOUNDER_INFO.jobTitle,
      url: FOUNDER_INFO.url,
    },
    knowsAbout: [
      'Android Application Development',
      'Game Development',
      'Custom Website Development',
    ],
    sameAs: [
      'https://discord.gg/XB2Zjmsb7K',
      'https://github.com/shahnaveed07',
      'https://naveedmushtaq.tech/',
    ],
  },
  {
    '@type': 'Person',
    '@id': 'https://naveedmushtaq.tech/#person',
    name: FOUNDER_INFO.name,
    jobTitle: FOUNDER_INFO.jobTitle,
    url: FOUNDER_INFO.url,
    worksFor: {
      '@id': 'https://dscweb.me/#organization',
    },
    sameAs: [
      'https://naveedmushtaq.tech/',
      'https://github.com/shahnaveed07',
    ],
  },
  {
    '@type': 'WebSite',
    '@id': 'https://dscweb.me/#website',
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: 'https://dscweb.me/',
    inLanguage: 'en',
    publisher: {
      '@id': 'https://dscweb.me/#organization',
    },
  },
]

export const VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA = [
  {
    '@type': 'SoftwareApplication',
    name: 'QR Scanner | Generator',
    operatingSystem: 'Android',
    applicationCategory: 'UtilitiesApplication',
    description:
      'High-speed camera scanner and offline custom barcode and QR code generator for Android devices.',
    installUrl: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
    url: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
    author: {
      '@id': 'https://dscweb.me/#organization',
    },
    publisher: {
      '@id': 'https://dscweb.me/#organization',
    },
  },
  {
    '@type': 'SoftwareApplication',
    name: 'Mind Matrix',
    operatingSystem: 'Android',
    applicationCategory: 'GameApplication',
    description:
      'Cognitive mobile puzzle game featuring progressive logic, memory sequence recall, and pattern recognition drills playable offline.',
    installUrl: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
    url: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
    author: {
      '@id': 'https://dscweb.me/#organization',
    },
    publisher: {
      '@id': 'https://dscweb.me/#organization',
    },
  },
]

export const SEO_ROUTES = {
  home: {
    key: 'home',
    routePath: '/',
    title: 'Dark Skull Corporation | Android Apps & Game Development',
    description:
      'Dark Skull Corporation is an independent software studio focused on Android applications, game development and custom websites for individuals and businesses.',
    canonical: 'https://dscweb.me/',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  studioProducts: {
    key: 'studioProducts',
    routePath: '/products',
    title: 'Software Studio Products & Portfolio | Dark Skull Corporation',
    description:
      'Explore the Dark Skull Corporation product portfolio organized across In Production releases, DSC Own Products, and client projects Built by DSC.',
    canonical: 'https://dscweb.me/products',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  inProduction: {
    key: 'inProduction',
    routePath: '/products/in-production',
    title: 'In Production — Apps, Websites & Games | Dark Skull Corporation',
    description:
      'Browse applications, websites, and games deployed and available in production from Dark Skull Corporation, including QR Scanner and Mind Matrix.',
    canonical: 'https://dscweb.me/products/in-production',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
    extraSchemaNodes: VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA,
  },
  ownProducts: {
    key: 'ownProducts',
    routePath: '/products/own-products',
    title: 'Own Products — Proprietary Studio Software | Dark Skull Corporation',
    description:
      'Discover proprietary software products, mobile applications, and internal intellectual property conceived, owned, and developed by Dark Skull Corporation.',
    canonical: 'https://dscweb.me/products/own-products',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
    extraSchemaNodes: VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA,
  },
  builtByDsc: {
    key: 'builtByDsc',
    routePath: '/products/built-by-dsc',
    title: 'Built by DSC — Client & Commissioned Projects | DSC Studio',
    description:
      'Explore the Built by DSC portfolio classification for custom websites, Android applications, and games developed by Dark Skull Corporation for clients.',
    canonical: 'https://dscweb.me/products/built-by-dsc',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  projectQrScanner: {
    key: 'projectQrScanner',
    routePath: '/projects/qr-scanner-generator',
    title: 'QR Scanner | Generator — Android App | Dark Skull Corporation',
    description:
      'Official project overview for QR Scanner | Generator by Dark Skull Corporation: high-speed Android barcode scanner and offline custom QR code generator.',
    canonical: 'https://dscweb.me/projects/qr-scanner-generator',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'ItemPage',
    extraSchemaNodes: [VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA[0]],
  },
  projectMindMatrix: {
    key: 'projectMindMatrix',
    routePath: '/projects/mind-matrix',
    title: 'Mind Matrix — Mobile Logic & Puzzle Game | Dark Skull Corporation',
    description:
      'Official project overview for Mind Matrix by Dark Skull Corporation: offline Android cognitive puzzle game with logic, memory, and pattern recognition drills.',
    canonical: 'https://dscweb.me/projects/mind-matrix',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'ItemPage',
    extraSchemaNodes: [VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA[1]],
  },
  services: {
    key: 'services',
    routePath: '/services',
    title: 'Software Development Services — Web, Android & Games | DSC',
    description:
      'Explore official development services from Dark Skull Corporation: custom Website Development, Android Application Development, and Game Development.',
    canonical: 'https://dscweb.me/services',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  serviceWebsites: {
    key: 'serviceWebsites',
    routePath: '/services/websites',
    title: 'Website Development Services | Dark Skull Corporation',
    description:
      'Custom responsive website design and web application engineering by Dark Skull Corporation for individuals, startups, businesses, and organizations.',
    canonical: 'https://dscweb.me/services/websites',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  serviceAndroid: {
    key: 'serviceAndroid',
    routePath: '/services/android-applications',
    title: 'Android Application Development Services | Dark Skull Corporation',
    description:
      'Native Android application design and development services by Dark Skull Corporation focused on usability, offline reliability, and user privacy.',
    canonical: 'https://dscweb.me/services/android-applications',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  serviceGames: {
    key: 'serviceGames',
    routePath: '/services/game-development',
    title: 'Game Development Services | Dark Skull Corporation',
    description:
      'Mobile and interactive game development services by Dark Skull Corporation featuring structured gameplay mechanics, smooth controls, and offline polish.',
    canonical: 'https://dscweb.me/services/game-development',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  team: {
    key: 'team',
    routePath: '/team',
    title: 'Our Team & Studio Leadership | Dark Skull Corporation',
    description:
      'Meet the leadership and engineering team behind Dark Skull Corporation, founded by Naveed Mushtaq to build Android applications, games, and websites.',
    canonical: 'https://dscweb.me/team',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'AboutPage',
  },
  apps: {
    key: 'apps',
    routePath: '/pages/apps',
    title: 'Android Apps & Games | Dark Skull Corporation',
    description:
      'Explore Android applications and mobile games developed by Dark Skull Corporation, including QR Scanner & Generator and Mind Matrix on Google Play.',
    canonical: 'https://dscweb.me/pages/apps',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
    extraSchemaNodes: VERIFIED_SOFTWARE_APPLICATIONS_SCHEMA,
  },
  products: {
    key: 'products',
    routePath: '/pages/products',
    title: 'Software Products Catalog | Dark Skull Corporation',
    description:
      'Explore the Dark Skull Corporation desktop software panel catalog, base rates, duration options, setup guides, and verified Client Dashboard delivery.',
    canonical: 'https://dscweb.me/pages/products',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  websites: {
    key: 'websites',
    routePath: '/pages/websites',
    title: 'Custom Websites & Web Development | Dark Skull Corporation',
    description:
      'Explore the Websites category by Dark Skull Corporation. We design and develop responsive custom websites for individuals, startups, and businesses on request.',
    canonical: 'https://dscweb.me/pages/websites',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  catalog: {
    key: 'catalog',
    routePath: '/pages/catalog',
    title: 'Software Panel Catalog & Licensing | Dark Skull Corporation',
    description:
      'Explore the Dark Skull Corporation desktop software panel catalog, base rates, duration options, setup guides, and verified Client Dashboard delivery.',
    canonical: 'https://dscweb.me/pages/catalog',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  downloads: {
    key: 'downloads',
    routePath: '/pages/downloads',
    title: 'Software & Android App Downloads | DSC',
    description:
      'Visit the official Dark Skull Corporation download center for available software releases, Android applications and public downloads.',
    canonical: 'https://dscweb.me/pages/downloads',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  freepanel: {
    key: 'freepanel',
    routePath: '/pages/freepanel',
    title: 'Free Panel Access & Live Credentials | DSC',
    description:
      'Access Dark Skull Corporation public Free Panel evaluation credentials, check live slot availability and download the public evaluation build.',
    canonical: 'https://dscweb.me/pages/freepanel',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  about: {
    key: 'about',
    routePath: '/pages/about',
    title: 'About Dark Skull Corporation | Founder & Lead Developer',
    description:
      'Learn about Dark Skull Corporation, its Android app and game development focus, website services, and founder Naveed Mushtaq.',
    canonical: 'https://dscweb.me/pages/about',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'AboutPage',
  },
  contact: {
    key: 'contact',
    routePath: '/pages/contact',
    title: 'Contact DSC | Website & Software Development Inquiries',
    description:
      'Contact Dark Skull Corporation for Android app development, game development, custom website projects, business inquiries and support.',
    canonical: 'https://dscweb.me/pages/contact',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'ContactPage',
  },
  privacy: {
    key: 'privacy',
    routePath: '/pages/privacy-policy',
    title: 'Privacy Policy & Cookie Disclosures | Dark Skull Corporation',
    description:
      'Read the Dark Skull Corporation Privacy Policy covering data handling, local storage, cookie usage, third-party advertising disclosures and user rights.',
    canonical: 'https://dscweb.me/pages/privacy-policy',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  terms: {
    key: 'terms',
    routePath: '/pages/terms',
    title: 'Terms of Service & Licensing | Dark Skull Corporation',
    description:
      'Review the Terms of Service, software licensing rules, payment verification policies and fair use terms for Dark Skull Corporation websites and products.',
    canonical: 'https://dscweb.me/pages/terms',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  status: {
    key: 'status',
    routePath: '/pages/status',
    title: 'System Status & Service Availability | DSC',
    description:
      'Check current platform operational status, scheduled maintenance notices and service availability for Dark Skull Corporation web services.',
    canonical: 'https://dscweb.me/pages/status',
    robots: 'index, follow',
    indexable: true,
    ogType: 'website',
    schemaType: 'WebPage',
  },
  checkout: {
    key: 'checkout',
    routePath: '/pages/checkout',
    title: 'Order Checkout | Dark Skull Corporation',
    description:
      'Complete your Dark Skull Corporation software panel order, duration selection, and payment verification.',
    canonical: 'https://dscweb.me/pages/checkout',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  ulogin: {
    key: 'ulogin',
    routePath: '/pages/ulogin',
    title: 'Client Portal Login | Dark Skull Corporation',
    description:
      'Sign in to your Dark Skull Corporation Client Portal to access your software licenses, downloads, and account details.',
    canonical: 'https://dscweb.me/pages/ulogin',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  register: {
    key: 'register',
    routePath: '/register',
    title: 'Create DSC Account | Dark Skull Corporation',
    description:
      'Register a Dark Skull Corporation account to request development services, track project orders, and manage your software licenses.',
    canonical: 'https://dscweb.me/register',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  forgotPassword: {
    key: 'forgotPassword',
    routePath: '/forgot-password',
    title: 'Account Password Recovery | Dark Skull Corporation',
    description:
      'Initiate password recovery or reset your Dark Skull Corporation client account password.',
    canonical: 'https://dscweb.me/forgot-password',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  alogin: {
    key: 'alogin',
    routePath: '/pages/alogin',
    title: 'Admin Portal Login | Dark Skull Corporation',
    description:
      'Administrative access portal for Dark Skull Corporation management, order approvals, and platform configuration.',
    canonical: 'https://dscweb.me/pages/alogin',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  udash: {
    key: 'udash',
    routePath: '/pages/udash',
    title: 'Client Dashboard | Dark Skull Corporation',
    description:
      'Manage your Dark Skull Corporation client account, active subscription status, license keys, and verified downloads.',
    canonical: 'https://dscweb.me/pages/udash',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  change: {
    key: 'change',
    routePath: '/pages/change',
    title: 'Change Account Password | Dark Skull Corporation',
    description:
      'Update your Dark Skull Corporation client account password and security credentials.',
    canonical: 'https://dscweb.me/pages/change',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  adash: {
    key: 'adash',
    routePath: '/pages/adash',
    title: 'Admin Dashboard | Dark Skull Corporation',
    description:
      'Administrative dashboard for Dark Skull Corporation order verification, user management, and system status.',
    canonical: 'https://dscweb.me/pages/adash',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  ownerdb: {
    key: 'ownerdb',
    routePath: '/pages/ownerdb',
    title: 'Owner Database Manager | Dark Skull Corporation',
    description:
      'Owner database and configuration management workspace for Dark Skull Corporation.',
    canonical: 'https://dscweb.me/pages/ownerdb',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  generatekey: {
    key: 'generatekey',
    routePath: '/pages/generatekey',
    title: 'Generate Access Key | Dark Skull Corporation',
    description:
      'Administrative license key generation utility for Dark Skull Corporation.',
    canonical: 'https://dscweb.me/pages/generatekey',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  maintenance: {
    key: 'maintenance',
    routePath: '/',
    title: 'Scheduled System Maintenance | Dark Skull Corporation',
    description:
      'Dark Skull Corporation web services are temporarily undergoing scheduled maintenance. Please check back shortly.',
    canonical: 'https://dscweb.me/',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
  notFound: {
    key: 'notFound',
    routePath: '/pages/404',
    title: 'Page Not Found (404) | Dark Skull Corporation',
    description:
      'The requested page could not be found. Return to the Dark Skull Corporation homepage or browse our Android apps, games and products.',
    canonical: 'https://dscweb.me/pages/404',
    robots: 'noindex, nofollow',
    indexable: false,
    ogType: 'website',
  },
}

export const INDEXABLE_PUBLIC_ROUTES = Object.values(SEO_ROUTES).filter(
  (route) => route.indexable,
)

export function buildRouteStructuredData(routeConfig) {
  if (!routeConfig) {
    return {
      '@context': 'https://schema.org',
      '@graph': BASE_SCHEMA_GRAPH,
    }
  }

  const graph = [...BASE_SCHEMA_GRAPH]

  if (routeConfig.indexable !== false && routeConfig.canonical) {
    const pageNode = {
      '@type': routeConfig.schemaType || 'WebPage',
      '@id': `${routeConfig.canonical}#webpage`,
      url: routeConfig.canonical,
      name: routeConfig.title,
      description: routeConfig.description,
      inLanguage: 'en',
      isPartOf: {
        '@id': 'https://dscweb.me/#website',
      },
      about: {
        '@id': 'https://dscweb.me/#organization',
      },
    }
    graph.push(pageNode)
  }

  if (Array.isArray(routeConfig.extraSchemaNodes)) {
    graph.push(...routeConfig.extraSchemaNodes)
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
