/**
 * Canonical Software Studio Project & Portfolio Data Architecture (Phase 2).
 *
 * Single source of truth for verified Dark Skull Corporation (DSC) projects.
 * Avoids duplicating project records across /products, /products/in-production,
 * /products/own-products, /products/built-by-dsc, /projects/:slug, /pages/apps,
 * and /pages/downloads.
 */

export const PROJECT_TYPES = {
  ANDROID_APPLICATION: 'Android Application',
  WEBSITE: 'Website',
  GAME: 'Game',
}

export const PORTFOLIO_CATEGORIES = {
  IN_PRODUCTION: 'In Production',
  OWN_PRODUCT: 'Own Product',
  BUILT_BY_DSC: 'Built by DSC',
}

export const PORTFOLIO_TYPE_FILTERS = [
  {
    id: 'all',
    label: 'All',
    projectType: null,
  },
  {
    id: 'android-applications',
    label: 'Android Applications',
    projectType: PROJECT_TYPES.ANDROID_APPLICATION,
  },
  {
    id: 'websites',
    label: 'Websites',
    projectType: PROJECT_TYPES.WEBSITE,
  },
  {
    id: 'games',
    label: 'Games',
    projectType: PROJECT_TYPES.GAME,
  },
]

/**
 * Canonical verified project records.
 * Only projects with verified ownership and production evidence in the repository are included.
 */
export const portfolioProjects = [
  {
    id: 'dsc-qr-scanner-generator',
    slug: 'qr-scanner-generator',
    name: 'QR Scanner | Generator',
    shortDescription:
      'High-speed camera scanner & customizable barcode/QR generator for Android.',
    description:
      'Instantly scan barcodes and QR codes with autofocus detection. Generate custom, styled QR codes from website links, Wi-Fi network credentials, contact cards (vCard), phone numbers, and plain text without needing an active internet connection.',
    projectType: PROJECT_TYPES.ANDROID_APPLICATION,
    typeBadge: 'ANDROID APPLICATION',
    portfolioCategory: [
      PORTFOLIO_CATEGORIES.IN_PRODUCTION,
      PORTFOLIO_CATEGORIES.OWN_PRODUCT,
    ],
    ownership: 'Dark Skull Corporation',
    productionStatus: 'In Production — Google Play',
    packageId: 'com.dsc.qrscanner',
    platforms: ['Android 7.0 (Nougat) or newer'],
    technologies: [
      'Android',
      'Autofocus Camera Barcode Detection',
      'Offline QR Code Engine',
      'vCard & Wi-Fi Payload Encoding',
    ],
    features: [
      'Autofocus real-time camera viewfinder',
      '100% offline generation engine',
      'Wi-Fi, URL, Text, and vCard formats',
      'Direct share, copy & save to device',
    ],
    permissionsNotice:
      'Camera access is requested strictly when the scanner viewfinder is active. Storage permission is requested only when exporting a generated QR image file to your gallery. No location data or contacts are ever uploaded.',
    downloadRequirements:
      'Android 7.0 (Nougat) or newer. Zero external telemetry.',
    icon: {
      webp: '/images/dsclogo.webp',
      png: '/images/dsclogo.png',
      alt: 'QR Scanner | Generator application icon',
    },
    storeUrl: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
    storeLabel: 'Google Play ↗',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'dsc-mind-matrix',
    slug: 'mind-matrix',
    name: 'Mind Matrix',
    shortDescription:
      'Cognitive puzzle game with logic, memory, pattern recognition, and reaction drills.',
    description:
      'Mind Matrix is a handcrafted logic game engineered for players who enjoy mental exercises. Features progressive difficulty scaling across multiple challenge modes designed to train short-term memory, pattern recognition, and cognitive reflexes.',
    projectType: PROJECT_TYPES.GAME,
    typeBadge: 'MOBILE LOGIC GAME',
    portfolioCategory: [
      PORTFOLIO_CATEGORIES.IN_PRODUCTION,
      PORTFOLIO_CATEGORIES.OWN_PRODUCT,
    ],
    ownership: 'Dark Skull Corporation',
    productionStatus: 'In Production — Google Play',
    packageId: 'com.dsc.mindmatrix',
    platforms: ['Android 6.0 or newer'],
    technologies: [
      'Android',
      'Cognitive Logic & Memory Engine',
      'Offline State Persistence',
      '60 FPS Touch Interface',
    ],
    features: [
      'Progressive cognitive difficulty scaling',
      '100% offline playable without internet',
      'Smooth 60 FPS animations & tactile touch',
      'Zero pay-to-win mechanics or paywalls',
    ],
    downloadRequirements:
      'Android 6.0+ compatible. Fully playable offline.',
    icon: {
      webp: '/images/dsclogo2.webp',
      png: '/images/dsclogo2.png',
      alt: 'Mind Matrix mobile game icon',
    },
    storeUrl: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
    storeLabel: 'Google Play ↗',
    featured: true,
    displayOrder: 2,
  },
]

/**
 * Returns all canonical portfolio projects ordered by displayOrder.
 */
export function getAllProjects() {
  return [...portfolioProjects].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
}

/**
 * Returns featured verified projects ordered by displayOrder.
 */
export function getFeaturedProjects() {
  return getAllProjects().filter((project) => Boolean(project.featured))
}

/**
 * Finds a single canonical project by its URL slug.
 */
export function getProjectBySlug(slug) {
  if (!slug) return null
  const normalized = String(slug).trim().toLowerCase()
  return portfolioProjects.find((project) => project.slug.toLowerCase() === normalized) || null
}

/**
 * Resolves a filter ID ('all', 'android-applications', 'websites', 'games')
 * or direct projectType string into a canonical PROJECT_TYPES value.
 */
export function resolveProjectTypeFilter(filterIdOrType = 'all') {
  if (!filterIdOrType || filterIdOrType === 'all') return null
  const matchedFilter = PORTFOLIO_TYPE_FILTERS.find(
    (f) => f.id === filterIdOrType || f.projectType === filterIdOrType,
  )
  return matchedFilter ? matchedFilter.projectType : null
}

/**
 * Returns canonical projects belonging to a specific portfolio classification
 * ('In Production', 'Own Product', 'Built by DSC') and optional project type filter.
 */
export function getProjectsByCategory(category, typeFilter = 'all') {
  const targetType = resolveProjectTypeFilter(typeFilter)
  return getAllProjects().filter((project) => {
    const categories = Array.isArray(project.portfolioCategory)
      ? project.portfolioCategory
      : [project.portfolioCategory]
    const inCategory = category ? categories.includes(category) : true
    const matchesType = targetType ? project.projectType === targetType : true
    return inCategory && matchesType
  })
}
