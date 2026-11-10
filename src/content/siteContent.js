export const primaryNavItems = [
  { label: 'Home', to: '/' },
  {
    label: 'Products',
    to: '/products',
    children: [
      {
        label: 'In Production',
        to: '/products/in-production',
        description: 'Released Android applications, websites, and games in production.',
      },
      {
        label: 'Own Products',
        to: '/products/own-products',
        description: 'Proprietary software and products owned and developed by DSC.',
      },
      {
        label: 'Built by DSC',
        to: '/products/built-by-dsc',
        description: 'Websites, applications, and games built by DSC for clients and partners.',
      },
    ],
  },
  {
    label: 'Services',
    to: '/services',
    children: [
      {
        label: 'Website Development',
        to: '/services/websites',
        description: 'Custom responsive websites and web applications engineered for performance.',
      },
      {
        label: 'Android Application Development',
        to: '/services/android-applications',
        description: 'Native Android utilities and applications built for reliability and privacy.',
      },
      {
        label: 'Game Development',
        to: '/services/game-development',
        description: 'Interactive games, puzzle mechanics, and offline-ready gameplay.',
      },
    ],
  },
  { label: 'Our Team', to: '/team' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const pageLabels = [
  { label: 'Home', paths: ['/', '/index.html'] },
  { label: 'Products', paths: ['/products'] },
  { label: 'In Production', paths: ['/products/in-production'] },
  { label: 'Own Products', paths: ['/products/own-products'] },
  { label: 'Built by DSC', paths: ['/products/built-by-dsc'] },
  { label: 'Services', paths: ['/services'] },
  { label: 'Website Development', paths: ['/services/websites'] },
  { label: 'Android App Development', paths: ['/services/android-applications'] },
  { label: 'Game Development', paths: ['/services/game-development'] },
  { label: 'Our Team', paths: ['/team'] },
  { label: 'About', paths: ['/about', '/pages/about', '/pages/about.html'] },
  { label: 'Contact', paths: ['/contact', '/pages/contact', '/pages/contact.html'] },
  { label: 'Android Applications', paths: ['/pages/apps', '/pages/apps.html'] },
  { label: 'Websites', paths: ['/pages/websites', '/pages/websites.html'] },
  { label: 'Software Catalog', paths: ['/pages/products', '/pages/products.html', '/pages/catalog', '/pages/catalog.html'] },
  { label: 'Downloads', paths: ['/pages/downloads', '/pages/downloads.html'] },
  { label: 'Status', paths: ['/pages/status', '/pages/status.html'] },
  { label: 'Privacy Policy', paths: ['/pages/privacy-policy', '/pages/privacy-policy.html', '/pages/policy.html'] },
  { label: 'Terms', paths: ['/pages/terms', '/pages/terms.html'] },
  { label: 'Login', paths: ['/pages/ulogin', '/pages/Ulogin.html'] },
  { label: 'Admin Login', paths: ['/pages/alogin', '/pages/Alogin.html'] },
  { label: 'Free Panel', paths: ['/pages/freepanel', '/pages/freepanel.html'] },
  { label: 'Checkout', paths: ['/pages/checkout', '/pages/checkout.html'] },
  { label: 'Dashboard', paths: ['/pages/udash', '/pages/Udash.html'] },
  { label: 'Change Password', paths: ['/pages/change', '/pages/change.html'] },
  { label: 'Admin Dashboard', paths: ['/pages/adash', '/pages/Adash.html'] },
  { label: 'Owner Workspace', paths: ['/pages/ownerdb', '/pages/OwnerDB.html'] },
  { label: 'Key Generation', paths: ['/pages/generatekey', '/pages/generateKey.html'] },
]

export const studioProductCategories = [
  {
    id: 'in-production',
    categoryLabel: 'Classification A',
    badge: 'Live & Deployed',
    title: 'In Production',
    description:
      'Applications, websites, and games that are released, deployed, or actively available in production across supported platforms.',
    metaItems: ['Android Applications', 'Websites', 'Games'],
    highlights: [
      'Android Applications — Live production utilities and mobile software',
      'Websites — Deployed web platforms and public web properties',
      'Games — Released mobile and interactive game titles',
    ],
    action: {
      label: 'Explore In Production',
      to: '/products/in-production',
    },
  },
  {
    id: 'own-products',
    categoryLabel: 'Classification B',
    badge: 'Studio Proprietary',
    title: 'Own Products',
    description:
      'Proprietary products, applications, and internal intellectual property conceived, owned, and developed directly by Dark Skull Corporation.',
    metaItems: ['DSC-Owned IP', 'Internal Roadmaps', 'First-Party Releases'],
    highlights: [
      'Conceived, engineered, and maintained in-house by DSC',
      'Dedicated product lifecycle, updates, and direct studio governance',
      'Separated from client work and external commissions',
    ],
    action: {
      label: 'Explore Own Products',
      to: '/products/own-products',
    },
  },
  {
    id: 'built-by-dsc',
    categoryLabel: 'Classification C',
    badge: 'Client & Partner Work',
    title: 'Built by DSC',
    description:
      'Websites, Android applications, and games engineered by Dark Skull Corporation for external clients, organizations, and commissioned projects.',
    metaItems: ['Client Websites', 'Custom Apps', 'Commissioned Games'],
    highlights: [
      'Custom software and websites delivered for external clients',
      'Distinct portfolio classification separate from DSC-owned products',
      'Published only when verified client showcase approval is granted',
    ],
    action: {
      label: 'Explore Built by DSC',
      to: '/products/built-by-dsc',
    },
  },
]

export const inProductionStreams = [
  {
    id: 'android-applications',
    label: 'Stream 01',
    badge: 'Android Applications',
    title: 'Android Applications',
    description:
      'Production Android applications published and maintained by Dark Skull Corporation.',
    verifiedReleases: [
      {
        name: 'QR Scanner | Generator',
        type: 'Android Utility Application',
        status: 'In Production — Google Play',
        summary:
          'High-speed autofocus camera barcode/QR scanner and offline custom QR code generator for Android devices.',
        externalHref: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
        externalLabel: 'View on Google Play ↗',
        internalTo: '/pages/apps',
        internalLabel: 'View App Details',
      },
    ],
  },
  {
    id: 'websites',
    label: 'Stream 02',
    badge: 'Websites',
    title: 'Websites',
    description:
      'Production websites and web platforms deployed by Dark Skull Corporation.',
    verifiedReleases: [],
    emptyMessage:
      'No separate third-party or additional production website entries are listed in this directory yet. Verified production website deployments will appear here as they are approved for public showcase.',
  },
  {
    id: 'games',
    label: 'Stream 03',
    badge: 'Games',
    title: 'Games',
    description:
      'Production games and interactive experiences released by Dark Skull Corporation.',
    verifiedReleases: [
      {
        name: 'Mind Matrix',
        type: 'Mobile Logic & Puzzle Game',
        status: 'In Production — Google Play',
        summary:
          'Cognitive puzzle game with progressive logic, memory sequence recall, pattern recognition, and reaction drills playable offline.',
        externalHref: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
        externalLabel: 'View on Google Play ↗',
        internalTo: '/pages/apps',
        internalLabel: 'View Game Details',
      },
    ],
  },
]

export const studioServiceCategories = [
  {
    id: 'website-development',
    slug: 'websites',
    categoryLabel: 'Service 01',
    badge: 'Web Engineering',
    title: 'Website Development',
    description:
      'Custom responsive websites and web applications designed and engineered by Dark Skull Corporation for individuals, startups, businesses, and organizations.',
    metaItems: ['Responsive UI', 'Modern Web Stack', 'SEO & Performance'],
    highlights: [
      'Custom frontend architecture tailored to brand and operational goals',
      'Responsive layouts across desktop, tablet, and mobile viewports',
      'Clean semantic structure, accessibility, and technical SEO foundations',
    ],
    action: {
      label: 'Website Development Architecture',
      to: '/services/websites',
    },
  },
  {
    id: 'android-application-development',
    slug: 'android-applications',
    categoryLabel: 'Service 02',
    badge: 'Mobile Engineering',
    title: 'Android Application Development',
    description:
      'Native Android application design and development focused on intuitive user interfaces, offline capability, scoped permissions, and dependable device performance.',
    metaItems: ['Native Android', 'Offline-Ready', 'Privacy-First'],
    highlights: [
      'User-centered mobile workflows engineered for everyday utility',
      'Strict permission scoping and local-first data handling where applicable',
      'End-to-end build preparation for Google Play distribution',
    ],
    action: {
      label: 'Android Development Architecture',
      to: '/services/android-applications',
    },
  },
  {
    id: 'game-development',
    slug: 'game-development',
    categoryLabel: 'Service 03',
    badge: 'Interactive Systems',
    title: 'Game Development',
    description:
      'Design and engineering of engaging mobile and interactive games featuring responsive controls, structured progression systems, and polished visual feedback.',
    metaItems: ['Gameplay Systems', 'Puzzle & Logic', '60 FPS Polish'],
    highlights: [
      'Core gameplay loop engineering, level progression, and state architecture',
      'Responsive touch and input handling tuned for smooth frame pacing',
      'Offline-playable game design without intrusive dark patterns',
    ],
    action: {
      label: 'Game Development Architecture',
      to: '/services/game-development',
    },
  },
]

export const serviceBlueprints = {
  websites: {
    seoKey: 'serviceWebsites',
    eyebrow: 'DSC Studio Services · Web Engineering',
    title: 'Website Development',
    subtitle:
      'Custom website design and web application development for individuals, startups, businesses, and companies.',
    overview:
      'Dark Skull Corporation designs and develops responsive, standards-compliant websites and web interfaces. Every project is structured around clear information architecture, readable typography, accessible navigation, and reliable performance across modern browsers.',
    scopeAreas: [
      {
        title: 'Information Architecture & UI Design',
        description:
          'Structuring pages, navigation flows, and responsive layouts aligned with your organization or personal brand.',
      },
      {
        title: 'Frontend & Application Engineering',
        description:
          'Implementing clean, maintainable web interfaces using modern JavaScript, React, HTML5, and modular CSS systems.',
      },
      {
        title: 'Technical SEO & Performance',
        description:
          'Configuring semantic metadata, structured data, fast asset delivery, and mobile-friendly viewport behavior.',
      },
    ],
    deliverablesFramework: [
      'Responsive multi-viewport web interface (Desktop, Tablet, Mobile)',
      'Structured navigation, page hierarchy, and accessible UI components',
      'Technical SEO metadata, sitemap, and search engine readiness',
      'Deployment-ready production build and handover documentation',
    ],
    deploymentNote:
      'Deployment options (such as static cloud hosting, custom domain routing, or client-managed infrastructure) are aligned during project scoping.',
  },
  'android-applications': {
    seoKey: 'serviceAndroid',
    eyebrow: 'DSC Studio Services · Mobile Engineering',
    title: 'Android Application Development',
    subtitle:
      'Native Android application engineering focused on practical utility, clean interfaces, and dependable mobile performance.',
    overview:
      'Dark Skull Corporation builds Android applications with a focus on fast startup times, clear touch interactions, offline resilience, and transparent permission boundaries.',
    scopeAreas: [
      {
        title: 'Mobile UI & Interaction Design',
        description:
          'Crafting intuitive screens, accessible touch targets, and coherent navigation flows for Android devices.',
      },
      {
        title: 'Core Feature & Offline Engineering',
        description:
          'Building reliable local processing, device hardware integration, and responsive application state management.',
      },
      {
        title: 'Privacy & Permission Scoping',
        description:
          'Ensuring device permissions are requested strictly for user-invoked features with zero unnecessary background telemetry.',
      },
    ],
    deliverablesFramework: [
      'Native Android application package engineered for target Android API levels',
      'Scoped permission declarations and user-facing privacy disclosures',
      'Offline-capable or API-connected workflows according to project scope',
      'Release-ready build artifacts prepared for store or enterprise distribution',
    ],
    deploymentNote:
      'Distribution targets (Google Play Store publishing or direct signed APK/AAB delivery) are defined according to client requirements.',
  },
  'game-development': {
    seoKey: 'serviceGames',
    eyebrow: 'DSC Studio Services · Interactive Systems',
    title: 'Game Development',
    subtitle:
      'Interactive game design and engineering for puzzle, logic, casual, and mobile gaming experiences.',
    overview:
      'Dark Skull Corporation develops interactive games that combine clear rules, progressive challenge curves, tactile feedback, and stable frame rates on target devices.',
    scopeAreas: [
      {
        title: 'Gameplay Mechanics & Rules Engine',
        description:
          'Designing deterministic game loops, scoring logic, difficulty progression, and interactive puzzle or arcade systems.',
      },
      {
        title: 'HUD, Menus & Visual Polish',
        description:
          'Creating readable in-game HUDs, level selectors, pause/summary screens, and cohesive visual themes.',
      },
      {
        title: 'Performance & Offline Playability',
        description:
          'Optimizing rendering, input latency, and local state persistence for smooth offline and mobile play sessions.',
      },
    ],
    deliverablesFramework: [
      'Complete playable game loop with structured progression and state management',
      'Responsive touch/keyboard controls and cohesive UI/HUD screens',
      'Local progress persistence and performance-tuned assets',
      'Production build packaged for target mobile or web platforms',
    ],
    deploymentNote:
      'Platform packaging and release workflows (Android Google Play or web-based interactive builds) are coordinated per project.',
  },
}

/**
 * Centralized Social Media & Official External Links Configuration.
 * Do not invent URLs or use fake "#" destinations for unconfigured platforms.
 */
export const socialLinksConfig = [
  {
    id: 'facebook',
    label: 'Facebook',
    category: 'Official Social',
    url: '', // Official URL to be added when provided
  },
  {
    id: 'instagram',
    label: 'Instagram',
    category: 'Official Social',
    url: '', // Official URL to be added when provided
  },
  {
    id: 'youtube',
    label: 'YouTube',
    category: 'Official Social',
    url: '', // Official URL to be added when provided
  },
  {
    id: 'discord',
    label: 'Discord Community',
    category: 'Community',
    url: 'https://discord.gg/XB2Zjmsb7K',
  },
  {
    id: 'github',
    label: 'GitHub (@shahnaveed07)',
    category: 'Engineering',
    url: 'https://github.com/shahnaveed07',
  },
  {
    id: 'portfolio',
    label: 'Founder Portfolio',
    category: 'Leadership',
    url: 'https://naveedmushtaq.tech/',
  },
]

export const productCategories = [
  {
    id: 'android-applications',
    categoryLabel: 'Category 1',
    badge: 'Mobile Software',
    title: 'Android Applications',
    description:
      'Official Android applications and mobile games developed and published by Dark Skull Corporation with a focus on usability, offline reliability, and user privacy.',
    highlights: [
      'QR Scanner | Generator — High-speed camera barcode & offline QR utility',
      'Mind Matrix — Cognitive logic, memory & pattern recognition mobile game',
      'Scoped device permissions with zero background telemetry',
    ],
    imageWebp: '/images/dsclogo.webp',
    imageFallback: '/images/dsclogo.png',
    imageAlt: 'Dark Skull Corporation Android Applications',
    action: {
      label: 'Explore Android Applications',
      to: '/pages/apps',
    },
  },
  {
    id: 'websites',
    categoryLabel: 'Category 2',
    badge: 'Web Development',
    title: 'Websites',
    description:
      'Custom responsive websites designed and developed by Dark Skull Corporation for individuals, startups, businesses, and companies on request.',
    highlights: [
      'Responsive web architecture for desktop, tablet, and mobile browsers',
      'Custom website design and development available on request',
      'Direct collaboration with Founder & Lead Developer Naveed Mushtaq',
    ],
    imageWebp: '/images/dsclogo2.webp',
    imageFallback: '/images/dsclogo2.png',
    imageAlt: 'Dark Skull Corporation Websites',
    action: {
      label: 'Explore Websites',
      to: '/pages/websites',
    },
  },
]

export const homeHighlights = [
  {
    eyebrow: 'Android Development',
    title: 'Android Application Development',
    body: 'Designing and developing Android applications with intuitive interfaces, practical everyday features, and dependable performance.',
  },
  {
    eyebrow: 'Interactive Experiences',
    title: 'Game Development',
    body: 'Creating engaging games and cognitive experiences with thoughtful gameplay, polished interfaces, and offline-ready responsiveness.',
  },
  {
    eyebrow: 'Client Projects',
    title: 'Custom Website Development',
    body: 'Building responsive, modern websites for individuals, startups, businesses, and companies on request.',
  },
]

export const featuredApps = [
  {
    type: 'Android Utility',
    title: 'QR Scanner | Generator',
    description: 'High-speed camera detection for barcodes and custom offline QR code generation published on Google Play.',
    primaryAction: {
      label: 'Open Play Store',
      href: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
    },
  },
  {
    type: 'Puzzle Game',
    title: 'Mind Matrix',
    description: 'Handcrafted brain-training puzzle challenges focusing on pattern recognition, reaction timing, and cognitive drills.',
    primaryAction: {
      label: 'Open Play Store',
      href: 'https://play.google.com/store/apps/details?id=com.dsc.mindmatrix',
    },
  },
]

export const servicePillars = [
  {
    title: 'Android Application Development',
    items: [
      'Offline-capable QR code scanning and custom code generation',
      'Scoped device permissions and user-first interface design',
      'Zero third-party tracking or background bloatware',
    ],
  },
  {
    title: 'Game Development',
    items: [
      'Handcrafted brain-training and logic puzzle games',
      'Progressive difficulty scaling and smooth 60 FPS responsiveness',
      '100% offline playable experiences with no paywalls',
    ],
  },
  {
    title: 'Custom Website Development',
    items: [
      'Responsive websites for individuals, businesses, and companies on request',
      'Clean, accessible interfaces built for real-world usability and speed',
      'Direct collaboration with Founder Naveed Mushtaq',
    ],
  },
]

export const faqItems = [
  {
    question: 'How does software licensing and order delivery work?',
    answer:
      'Select your desired software tier and duration on the Checkout page, complete payment via UPI, and submit your screenshot transaction proof. Once our administrator verifies your payment (typically within 1 to 24 hours), your access key is generated and appears on your User Dashboard.',
  },
  {
    question: 'What is the Free Panel, and who can use it?',
    answer:
      'The Free Panel is a shared community evaluation edition that allows anyone to test our software panel interface and server connectivity without payment. Available slots are monitored live (up to 20 slots). When slots are open, free credentials and download links are displayed directly on the Free Panel page.',
  },
  {
    question: 'What are the system requirements for DSC software panels?',
    answer:
      'Our desktop utilities run on Windows 10 and Windows 11 (64-bit). They require Microsoft .NET Framework 4.8 and standard Visual C++ Redistributables. Android applications require Android 7.0 (Nougat) or newer.',
  },
  {
    question: 'What is Hardware ID (HWID) validation?',
    answer:
      'HWID validation is a security measure that locks your software license key to your specific computer hardware profile. This prevents license theft, key sharing, and unauthorized redistribution, ensuring each user maintains an isolated and secure session.',
  },
  {
    question: 'How do I reach the team for support or order inquiries?',
    answer:
      'For the fastest assistance, join our verified Discord community at discord.gg/XB2Zjmsb7K where we have active support channels. Alternatively, submit an inquiry through our Contact page or email darkskullcorporation@gmail.com.',
  },
]

export const productPlans = [
  {
    label: 'Community Evaluation',
    title: 'FREE-PANEL',
    category: 'Public Evaluation Tier',
    price: '$0 base rate',
    slug: 'free',
    badge: 'FREE ACCESS',
    description:
      'A community test edition designed to evaluate core software panel functionality, server connectivity, and interface speed before purchasing a private plan.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: '< 30 MB RAM',
      licensing: 'Shared pool (20 concurrent slots)',
      requirements: '.NET Framework 4.8',
    },
    features: [
      'Shared evaluation credentials displayed in real time',
      'Live server slot telemetry and availability monitor',
      'Direct binary package archive download when slots are open',
      'Community Discord troubleshooting and status reports',
    ],
    action: { label: 'Access Free Panel', to: '/pages/freepanel', primary: true },
  },
  {
    label: 'Content Creators',
    title: 'STREAMER-PANEL',
    category: 'Broadcasting & Overlay Utility',
    price: '$2 base rate',
    slug: 'streamer',
    description:
      'Engineered specifically for live streamers and content creators. Operates with OBS Studio and Streamlabs without interfering with capture software or revealing sensitive data on stream.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: '< 45 MB RAM',
      licensing: 'Single user HWID-bound',
      requirements: 'OBS 28+ or Streamlabs Desktop (optional)',
    },
    features: [
      'OBS and broadcast-safe overlay capture mode',
      'Customizable HUD opacity and instant hotkey toggle',
      'Durations from 1 to 365 days with duration discounts',
      'Verified screenshot payment approval and key delivery',
    ],
    action: { label: 'Order Streamer Panel', to: '/pages/checkout?panel=streamer', primary: true },
  },
  {
    label: 'VIP Dedicated Tier',
    title: 'SPECIAL-PANEL',
    category: 'High-Priority Software Suite',
    price: '$3 base rate',
    slug: 'special',
    featured: true,
    badge: 'VIP TIER',
    description:
      'Our flagship desktop panel tier featuring private server slot allocations, enhanced stability defense, and 24/7 priority customer support.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: '< 50 MB RAM',
      licensing: 'Dedicated private slot (HWID protected)',
      requirements: 'Windows 10/11 64-bit, .NET 4.8',
    },
    features: [
      'Dedicated private server allocation (no slot contention)',
      'Advanced anti-tamper and hardware protection layer',
      'Priority 24/7 Discord support with expedited response times',
      'Fast-track order approval and immediate key generation',
      'Full duration range from 1 to 365 days',
    ],
    action: { label: 'Order Special Panel', to: '/pages/checkout?panel=special', primary: true, elite: true },
  },
  {
    label: 'Tactical Controls',
    title: 'SNIPER-PANEL',
    category: 'Rapid Input & Hotkey Switcher',
    price: '$1 base rate',
    slug: 'sniper',
    description:
      'A streamlined utility designed for sub-millisecond hotkey switching, rapid tool swapping, and custom keybind profiles with negligible system overhead.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: '< 20 MB RAM',
      licensing: 'Single user HWID-bound',
      requirements: 'Windows 10/11 (64-bit)',
    },
    features: [
      'Sub-millisecond input response and hotkey mapping',
      'Multi-profile configuration switchers for distinct setups',
      'Ultra-compact memory footprint under 20 MB',
      'Flexible checkout durations starting from a 1-day trial',
    ],
    action: { label: 'Order Sniper Panel', to: '/pages/checkout?panel=sniper', primary: true },
  },
  {
    label: 'Input Calibration',
    title: 'AIM-ASSIST-PANEL',
    category: 'Precision Sensitivity Tuning',
    price: '$1 base rate',
    slug: 'aimassist',
    description:
      'Calibrate mouse input curves, acceleration smoothing, and crosshair positioning to build muscle memory and consistent cursor movement across games and display setups.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: '< 35 MB RAM',
      licensing: 'Single user HWID-bound',
      requirements: 'Windows 10/11, adjustable DPI mouse',
    },
    features: [
      'Raw input stream smoothing and dynamic sensitivity curve scaling',
      'Display DPI matching across multiple desktop resolutions',
      'Built-in precision calibration test canvas',
      'Manual payment verification and authenticated dashboard retrieval',
    ],
    action: { label: 'Order Aim Assist Panel', to: '/pages/checkout?panel=aimassist', primary: true },
  },
  {
    label: 'Next Generation',
    title: 'PREMIUM-PANEL',
    category: 'Unified Multi-Module Suite',
    price: '$5 base rate',
    slug: 'premium',
    description:
      'Currently under active development. Combines broadcasting protection, precision tuning, and automated cloud configuration profiles into one unified architecture.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: 'Under evaluation',
      licensing: 'Single user HWID-bound',
      requirements: 'Planned for Q4 2026',
    },
    features: [
      'Unified multi-module interface across all DSC desktop tools',
      'Automated cloud synchronization of user configurations',
      'Direct developer hotline support channel',
      'Automatic license rotation and silent updates',
    ],
    action: { label: 'In Development — Follow on Discord', href: 'https://discord.gg/XB2Zjmsb7K', disabled: false },
  },
  {
    label: 'Custom Engineering',
    title: 'CUSTOMISED-PANEL',
    category: 'Bespoke Private Compilation',
    price: '$10 base rate',
    slug: 'customised',
    description:
      'Custom compilation for teams, streamers, or organizations requiring bespoke feature sets, dedicated private pipelines, or specialized hardware configurations.',
    specs: {
      platform: 'Windows 10 / 11 (64-bit)',
      memory: 'Custom tailored',
      licensing: 'Private dedicated build',
      requirements: 'Direct developer consultation',
    },
    features: [
      'Bespoke feature integration based on specific client requirements',
      'Dedicated private build compilation and distribution channel',
      'One-on-one consultation with Founder & Lead Developer Naveed Mushtaq',
      'Custom branding, tailored keybind matrices, and private support',
    ],
    action: { label: 'Request Custom Build', to: '/pages/checkout?panel=customised', primary: true },
  },
]

export const aboutStats = [
  { label: 'Founded', value: '2024' },
  { label: 'Primary Focus', value: 'Android Apps & Games' },
  { label: 'Founder', value: 'Naveed Mushtaq' },
  { label: 'Web Projects', value: 'Available on Request' },
]

export const contactChannels = [
  {
    label: 'Discord Server',
    title: 'dsc.gg/XB2Zjmsb7K',
    body: 'Live community support, update announcements, and direct interaction with our studio team.',
    action: { label: 'Join Discord', href: 'https://discord.gg/XB2Zjmsb7K' },
  },
  {
    label: 'Official Email',
    title: 'darkskullcorporation@gmail.com',
    body: 'Android app, game, and custom website inquiries, as well as product support and order assistance.',
    action: { label: 'Send Email', href: 'mailto:darkskullcorporation@gmail.com' },
  },
  {
    label: 'GitHub Organization',
    title: 'github.com/shahnaveed07',
    body: 'Public repositories, open-source projects, issue reporting, and technical documentation.',
    action: { label: 'View GitHub', href: 'https://github.com/shahnaveed07' },
  },
  {
    label: 'Developer Portfolio',
    title: 'naveedmushtaq.tech',
    body: 'Learn about Naveed Mushtaq — Founder & Lead Developer of Dark Skull Corporation, explore his portfolio, and review past projects.',
    action: { label: 'Visit Portfolio', href: 'https://naveedmushtaq.tech/' },
  },
]

export const privacySections = [
  {
    title: 'Information We Collect',
    description: 'We adhere to data minimization. We only collect technical details strictly necessary to provide and secure our services:',
    items: [
      'Usernames and salted password hashes for client portal accounts',
      'Hardware Identifier (HWID) strings to bind software licenses to authorized machines',
      'Screenshot proofs of transaction submitted during the checkout process',
      'Basic technical logs (IP address, operating system, browser user agent) for server security and rate-limiting',
      'Crash logs and diagnostic information for Android mobile applications',
    ],
    note: 'We do not collect government identification, financial card numbers, or sensitive personal data.',
  },
  {
    title: 'How We Use Information',
    description: 'Data collected is used solely to maintain platform operations, licensing integrity, and customer support:',
    items: [
      'Verifying payment proofs and issuing valid license keys',
      'Enforcing single-device license binding via HWID checks',
      'Providing customer service and resolving order questions',
      'Monitoring server health, uptime, and preventing denial-of-service attacks',
      'Debugging crashes and improving performance across desktop and Android tools',
    ],
    note: 'We never sell, rent, or trade your personal information to third parties.',
  },
  {
    title: 'Cookies, Local Storage & Advertising Disclosures',
    description: 'Transparency regarding browser storage and third-party advertising cookies (including Google AdSense):',
    items: [
      'Local Storage: Used strictly to save interface preferences (such as Light / Dark theme) and store your authenticated session token.',
      'Third-Party Advertising: Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites.',
      'Google Advertising Cookies: Google’s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.',
      'Personalized Ad Opt-Out: Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads).',
      'Network Opt-Out: You can also opt out of a third-party vendor’s use of cookies for personalized advertising by visiting www.aboutads.info.',
    ],
    note: 'You can disable or delete browser cookies and clear local storage at any time through your browser settings.',
  },
  {
    title: 'Android App Permissions',
    description: 'Permissions in our Android mobile applications are strictly scoped to user-invoked features:',
    items: [
      'Camera Permission (QR Scanner): Used solely to detect physical QR and barcode patterns via the camera viewfinder. No image data is transmitted or stored externally.',
      'Storage / Photo Permission: Used solely when you explicitly tap to save or export a generated QR code image file to your device gallery.',
      'Zero Background Tracking: Our mobile applications do not run persistent background tracking services or harvest personal contacts.',
    ],
    note: 'Permissions can be revoked at any time via your Android device system settings.',
  },
  {
    title: 'Data Security & Storage',
    description: 'We take technical measures to safeguard the integrity and confidentiality of your data:',
    items: [
      'Transport Layer Security: All web traffic and API endpoints are encrypted using HTTPS/TLS.',
      'Cryptographic Validation: HWID tokens and authentication requests are verified on secure server-side infrastructure.',
      'Access Controls: Order proofs and user account records are restricted to authenticated administrators only.',
    ],
    note: 'While we employ industry-standard security practices, no internet transmission or database is completely impenetrable.',
  },
  {
    title: 'Data Retention & User Rights',
    description: 'We respect your control over your personal information:',
    items: [
      'Account Deletion: You may request complete deletion of your account and associated order records by emailing darkskullcorporation@gmail.com.',
      'Access & Correction: You may request an export of your account data or correct outdated order information at any time.',
      'Retention Period: Transaction proofs are retained for historical audit and support verification, then purged according to data retention schedules.',
    ],
  },
  {
    title: "Children's Privacy Protection",
    description: 'Protecting the safety of young users online:',
    items: [
      'Our website and software products are not directed to children under the age of 13.',
      'We do not knowingly collect personal information from children under 13.',
      'If you believe a child has provided us with personal information, please notify us immediately for swift removal.',
    ],
  },
  {
    title: 'Policy Updates & Contact Details',
    description: 'How we communicate policy updates:',
    items: [
      'This Privacy Policy may be updated periodically to reflect changes in our products or regulatory requirements.',
      'The current effective date will always be prominently displayed at the top of this page.',
      'Direct privacy inquiries to: darkskullcorporation@gmail.com (Attn: Naveed Mushtaq — Founder & Lead Developer).',
    ],
  },
]

export const termsSections = [
  {
    label: '1. Acceptance',
    title: 'Acceptance of Terms & Eligibility',
    body: 'By accessing or using the DSCWeb website (dscweb.me), purchasing licenses, downloading binaries, or using our Android applications and games, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use immediately.',
  },
  {
    label: '2. License Grant',
    title: 'Software Licensing & Single-User Restrictions',
    body: 'All Dark Skull Corporation software products and panels are licensed, not sold. Licenses are granted on a non-exclusive, non-transferable, revocable basis for single-machine use bound to your unique Hardware ID (HWID). Sharing license keys, renting access, or attempting to bypass hardware locks is strictly prohibited.',
  },
  {
    label: '3. Prohibited Use',
    title: 'Prohibited Conduct & Intellectual Property',
    body: 'You agree not to decompile, reverse-engineer, disassemble, modify, or crack any DSC binary or script. You may not redistribute software packages, host unauthorized mirrors, conduct automated scraping of our services, or attempt to compromise server infrastructure.',
  },
  {
    label: '4. Orders & Verification',
    title: 'Payment Verification & Delivery Policy',
    body: 'Orders placed through the checkout system require manual administrator review of payment transaction proofs. Once payment is confirmed, license keys are issued to your User Dashboard. Due to the digital nature of software licenses, all sales are final once an access key is generated and activated.',
  },
  {
    label: '5. Free Evaluation',
    title: 'Free Panel Fair Use Policy',
    body: 'The Free Panel is provided as a courtesy for community evaluation only. Access is subject to slot availability (maximum 20 concurrent slots) and may be suspended or restarted during maintenance windows without prior notice.',
  },
  {
    label: '6. Disclaimer',
    title: 'Disclaimer of Warranties',
    body: 'DSC software and web services are provided on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied. Dark Skull Corporation does not guarantee uninterrupted operation, error-free execution, or compatibility with all third-party software.',
  },
  {
    label: '7. Limitation',
    title: 'Limitation of Liability',
    body: 'In no event shall Dark Skull Corporation, Founder & Lead Developer Naveed Mushtaq, or affiliates be liable for indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use our software, website, or services.',
  },
  {
    label: '8. Governance',
    title: 'Modifications & Contact Information',
    body: 'We reserve the right to modify these terms at any time. Continued use of our website or software after changes indicates acceptance. For legal questions regarding these terms, contact darkskullcorporation@gmail.com.',
  },
]

export const footerGroups = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Our Team', to: '/team' },
      { label: 'About Studio', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Download Center', to: '/pages/downloads' },
      { label: 'Client Login', to: '/pages/ulogin' },
    ],
  },
  {
    title: 'Products',
    links: [
      { label: 'Products Overview', to: '/products' },
      { label: 'In Production', to: '/products/in-production' },
      { label: 'Own Products', to: '/products/own-products' },
      { label: 'Built by DSC', to: '/products/built-by-dsc' },
      { label: 'Android Applications', to: '/pages/apps' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Services Overview', to: '/services' },
      { label: 'Website Development', to: '/services/websites' },
      { label: 'Android App Development', to: '/services/android-applications' },
      { label: 'Game Development', to: '/services/game-development' },
    ],
  },
  {
    title: 'Contact & Legal',
    links: [
      { label: 'darkskullcorporation@gmail.com', href: 'mailto:darkskullcorporation@gmail.com' },
      { label: 'System Status', to: '/pages/status' },
      { label: 'Privacy Policy', to: '/pages/privacy-policy' },
      { label: 'Terms of Service', to: '/pages/terms' },
    ],
  },
]
