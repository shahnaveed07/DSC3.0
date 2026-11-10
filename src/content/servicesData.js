/**
 * Centralized Services, Scope Templates, Deployment Options, and Quotation Model
 * for Dark Skull Corporation (DSC) — Phase 3: Services & Packages.
 *
 * Rules:
 * - Quotation-based pricing only. Never imply or display fixed public prices.
 * - Do not invent unverified client testimonials, arbitrary delivery day guarantees,
 *   or unverified technology claims.
 */

export const QUOTATION_MODEL_STATEMENT =
  'Every project is evaluated according to its requirements. DSC will provide a custom quotation after reviewing the project scope.'

export const DEPLOYMENT_OPTIONS = [
  {
    id: 'with-deployment',
    label: 'With Deployment',
    badge: 'Managed Release & Handover',
    shortSummary:
      'DSC handles production build preparation, hosting or store release configuration, environment setup, and live verification alongside full project deliverables.',
    inclusions: [
      'Production build compilation, optimization, and asset bundling',
      'Environment configuration, domain/DNS routing, or store release preparation',
      'Live deployment verification and post-launch readiness check',
      'Complete source/build package and operational handover documentation',
    ],
  },
  {
    id: 'without-deployment',
    label: 'Without Deployment',
    badge: 'Source & Build Handover',
    shortSummary:
      'DSC delivers the verified production-ready source code, compiled build artifacts, and technical documentation so your internal team can deploy on your own infrastructure.',
    inclusions: [
      'Complete, clean, and documented source code repository handover',
      'Verified production build artifacts ready for your target environment',
      'Configuration guide and environment variable specification',
      'Structured technical handover for your internal engineering or ops team',
    ],
  },
]

export const studioServiceCategories = [
  {
    id: 'website-development',
    slug: 'websites',
    inquiryCategory: 'website',
    categoryLabel: 'Service 01',
    badge: 'Web Engineering',
    title: 'Website Development',
    description:
      'Custom responsive websites and web applications designed and engineered by Dark Skull Corporation for individuals, startups, businesses, and organizations.',
    metaItems: ['Responsive UI', 'Modern Web Stack', 'Quotation-Based Scope'],
    whatWeProvide: [
      'Business websites',
      'Portfolio websites',
      'E-commerce websites',
      'Custom web applications',
      'Website redesign and improvements',
    ],
    highlights: [
      'Business, portfolio, e-commerce, and custom web applications',
      'Responsive layouts across desktop, tablet, and mobile viewports',
      'Available With Deployment or Without Deployment based on your workflow',
    ],
    action: {
      label: 'Explore Website Development',
      to: '/services/websites',
    },
  },
  {
    id: 'android-application-development',
    slug: 'android-applications',
    inquiryCategory: 'android',
    categoryLabel: 'Service 02',
    badge: 'Mobile Engineering',
    title: 'Android Application Development',
    description:
      'Native and custom Android application design and development focused on intuitive user interfaces, offline capability, scoped permissions, and dependable device performance.',
    metaItems: ['Android Platform', 'Offline & API-Ready', 'Quotation-Based Scope'],
    whatWeProvide: [
      'Business applications',
      'Utility applications',
      'Custom Android applications',
      'Application UI/UX implementation',
      'Backend-integrated applications',
    ],
    highlights: [
      'Business, utility, and custom Android applications with clean UI/UX',
      'Strict permission scoping, local-first workflows, or backend integration',
      'Available With Deployment (release coordination) or Without Deployment (build handover)',
    ],
    action: {
      label: 'Explore Android Development',
      to: '/services/android-applications',
    },
  },
  {
    id: 'game-development',
    slug: 'game-development',
    inquiryCategory: 'game',
    categoryLabel: 'Service 03',
    badge: 'Interactive Systems',
    title: 'Game Development',
    description:
      'Design and engineering of custom 2D and 3D games featuring responsive controls, structured gameplay systems, character and environment integration, and polished delivery.',
    metaItems: ['2D & 3D Games', 'Gameplay Systems', 'Quotation-Based Scope'],
    whatWeProvide: [
      'Custom game development',
      '2D and 3D game development',
      'Game UI and gameplay systems',
      'Character and environment integration',
      'Game optimization and delivery',
    ],
    highlights: [
      'Custom 2D and 3D game development, gameplay mechanics, and interactive UI',
      'Character/environment integration and frame-pacing performance optimization',
      'Available With Deployment or Without Deployment for target platforms',
    ],
    action: {
      label: 'Explore Game Development',
      to: '/services/game-development',
    },
  },
]

export const serviceBlueprints = {
  websites: {
    slug: 'websites',
    seoKey: 'serviceWebsites',
    inquiryCategory: 'website',
    eyebrow: 'DSC Studio Services · Web Engineering',
    title: 'Website Development',
    subtitle:
      'Custom website design, web application engineering, and website modernization for individuals, startups, businesses, and organizations.',
    overview:
      'Dark Skull Corporation designs and develops responsive, standards-compliant websites and custom web applications. Every web project is engineered around clear information architecture, readable typography, accessible navigation, and reliable performance across desktop and mobile browsers.',
    whatWeProvide: [
      {
        title: 'Business Websites',
        description:
          'Professional company websites, service showcases, and corporate web presences structured to communicate credibility and convert visitors.',
      },
      {
        title: 'Portfolio Websites',
        description:
          'Personal, creator, and studio portfolio websites built to present projects, case studies, and professional credentials clearly.',
      },
      {
        title: 'E-Commerce Websites',
        description:
          'Product catalog, storefront, and order-capture web interfaces tailored to digital or physical product offerings.',
      },
      {
        title: 'Custom Web Applications',
        description:
          'Interactive web platforms, client portals, dashboards, and API-connected single-page applications.',
      },
      {
        title: 'Website Redesign and Improvements',
        description:
          'Visual modernization, responsive layout remediation, navigation restructuring, and technical SEO or performance upgrades for existing websites.',
      },
    ],
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
      'Interactive forms, API integrations, or dynamic views as defined in scope',
      'Deployment-ready production build and handover documentation',
    ],
    developmentProcess: [
      {
        step: '01',
        title: 'Requirements & Scope Evaluation',
        description:
          'We review your goals, target audience, required pages or application modules, and preferred deployment model to prepare a custom quotation.',
      },
      {
        step: '02',
        title: 'Information Architecture & UI Structure',
        description:
          'We establish the navigation hierarchy, responsive layout grid, typography, and component system before full implementation.',
      },
      {
        step: '03',
        title: 'Frontend & Integration Engineering',
        description:
          'Pages, interactive workflows, forms, and API integrations are developed using clean, maintainable web standards.',
      },
      {
        step: '04',
        title: 'Quality Assurance & Delivery',
        description:
          'We verify cross-viewport responsiveness, accessibility, and SEO metadata, then either deploy the website live or hand over the production build.',
      },
    ],
    technologies: [
      { name: 'React & Modern JavaScript (ES6+)', category: 'Frontend Architecture' },
      { name: 'Semantic HTML5 & Modular CSS3', category: 'Interface Standards' },
      { name: 'Vite Build & Bundling Pipeline', category: 'Build Tooling' },
      { name: 'REST API & JSON Client Integration', category: 'Data & Services' },
      { name: 'Technical SEO, OpenGraph & Sitemap Generation', category: 'Search & Metadata' },
    ],
    scopeTemplates: [
      {
        id: 'foundational-web',
        badge: 'Scope Template 01',
        name: 'Portfolio or Business Presence Scope',
        idealFor: 'Individuals, founders, and businesses establishing a clean public website.',
        summary:
          'Focused on core brand presentation, structured multi-section or multi-page navigation, responsive layouts, and inquiry capture.',
        inclusions: [
          'Custom responsive homepage and core informational pages',
          'Desktop and mobile navigation with consistent theme styling',
          'Contact / inquiry workflow and official social channel links',
          'Foundational technical SEO metadata and sitemap configuration',
        ],
      },
      {
        id: 'commerce-or-growth-web',
        badge: 'Scope Template 02',
        name: 'Multi-Page Business or E-Commerce Scope',
        idealFor: 'Growing companies, service studios, and product catalogs requiring structured hierarchies.',
        summary:
          'Expanded page architecture with dedicated product or service catalogs, filtering, detailed item views, and structured inquiry or checkout flows.',
        inclusions: [
          'Structured multi-category product or service directory pages',
          'Individual detail views, filtering, and search-friendly routing',
          'Custom inquiry, quotation request, or order submission forms',
          'Performance tuning, OpenGraph social cards, and structured data',
        ],
      },
      {
        id: 'custom-webapp',
        badge: 'Scope Template 03',
        name: 'Custom Web Application or Redesign Scope',
        idealFor: 'Organizations needing authenticated portals, dashboards, or full website modernization.',
        summary:
          'Tailored application engineering with authenticated user/admin views, backend API integration, or comprehensive architectural overhaul of an existing site.',
        inclusions: [
          'Custom application views, role-based dashboards, or state workflows',
          'Integration with backend APIs, authentication, and data tables',
          'UI/UX redesign, responsive remediation, and codebase modernization',
          'Comprehensive build verification and technical documentation',
        ],
      },
      {
        id: 'custom-scope',
        badge: 'Flexible Scope',
        name: 'Custom Project Scope',
        idealFor: 'Unique web projects or hybrid requirements defined directly from your brief.',
        summary:
          'Describe your exact functional, design, and technical requirements and DSC will structure a bespoke scope and quotation around your needs.',
        inclusions: [
          'Requirements tailored directly to your project specification',
          'Custom combination of pages, web app modules, or redesign tasks',
          'Flexible milestone and deliverable planning',
          'Choice of With Deployment or Without Deployment delivery',
        ],
      },
    ],
    deploymentOptions: {
      'with-deployment': {
        title: 'With Deployment (Managed Web Launch)',
        description:
          'DSC prepares the production bundle, configures cloud static/web hosting (such as Vercel, Netlify, or your preferred provider), sets up custom domain routing and HTTPS/SSL, and verifies the live website.',
        deliverables: [
          'Live deployed website on configured hosting environment',
          'Custom domain DNS and HTTPS/SSL verification where applicable',
          'Production build verification across desktop and mobile viewports',
          'Full source repository and deployment configuration handover',
        ],
      },
      'without-deployment': {
        title: 'Without Deployment (Source & Build Handover)',
        description:
          'DSC delivers the complete source repository, compiled production assets, and build instructions so you or your internal team can host and deploy the website on your own servers.',
        deliverables: [
          'Clean source code repository and production-ready build output',
          'Routing, environment variable, and build script documentation',
          'Verified local/staging build check prior to handover',
          'Zero lock-in — deploy on any hosting infrastructure you control',
        ],
      },
    },
    deploymentNote:
      'Every Website Development project can be requested With Deployment (live hosting & domain setup) or Without Deployment (complete source & production build handover).',
  },

  'android-applications': {
    slug: 'android-applications',
    seoKey: 'serviceAndroid',
    inquiryCategory: 'android',
    eyebrow: 'DSC Studio Services · Mobile Engineering',
    title: 'Android Application Development',
    subtitle:
      'Native and custom Android application engineering focused on practical utility, clean UI/UX, offline resilience, and dependable mobile performance.',
    overview:
      'Dark Skull Corporation builds Android applications with a focus on fast startup times, intuitive touch interactions, offline capability where appropriate, backend API connectivity when required, and transparent permission boundaries.',
    whatWeProvide: [
      {
        title: 'Business Applications',
        description:
          'Customer-facing or internal Android applications tailored to business operations, service workflows, and mobile engagement.',
      },
      {
        title: 'Utility Applications',
        description:
          'Focused, high-speed Android tools and everyday utilities (such as scanners, generators, and productivity tools) built for reliability.',
      },
      {
        title: 'Custom Android Applications',
        description:
          'Bespoke Android software engineered from the ground up around your specific functional requirements and target device matrix.',
      },
      {
        title: 'Application UI/UX Implementation',
        description:
          'Modern, accessible mobile screen layouts, intuitive navigation flows, dark/light theme support, and responsive touch targets.',
      },
      {
        title: 'Backend-Integrated Applications',
        description:
          'Android applications connected to authenticated REST APIs, user accounts, cloud data synchronization, and remote service endpoints.',
      },
    ],
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
      'Android application engineered for target Android API levels',
      'Clean mobile UI/UX implementation across standard Android screen densities',
      'Scoped permission declarations and transparent privacy disclosures',
      'Offline-capable local storage or authenticated backend API integration',
      'Signed release-ready APK / AAB build artifacts and technical documentation',
    ],
    developmentProcess: [
      {
        step: '01',
        title: 'Requirements & Device Scope Review',
        description:
          'We evaluate your functional features, target Android versions, hardware permission needs, and backend requirements to prepare a custom quotation.',
      },
      {
        step: '02',
        title: 'Mobile UI/UX & State Architecture',
        description:
          'We design the screen hierarchy, user navigation flows, local data persistence, and API communication contracts.',
      },
      {
        step: '03',
        title: 'Application Engineering & Integration',
        description:
          'Core application features, hardware/sensor integrations, and backend endpoints are implemented and tested across device profiles.',
      },
      {
        step: '04',
        title: 'Release Packaging & Store / Build Handover',
        description:
          'We compile signed APK/AAB release artifacts and either coordinate store deployment or hand over the complete build package.',
      },
    ],
    technologies: [
      { name: 'Android SDK & Modern Android APIs', category: 'Mobile Platform' },
      { name: 'Native Android UI & Material Component Systems', category: 'Mobile UI/UX' },
      { name: 'Camera, Sensor & Local Storage Integration', category: 'Device Capabilities' },
      { name: 'REST APIs, JSON & Token Authentication', category: 'Backend Connectivity' },
      { name: 'Signed APK / Android App Bundle (AAB) Packaging', category: 'Release Engineering' },
    ],
    scopeTemplates: [
      {
        id: 'utility-or-standalone-app',
        badge: 'Scope Template 01',
        name: 'Standalone Utility or Offline-First App Scope',
        idealFor: 'Tools, scanners, calculators, and self-contained mobile applications.',
        summary:
          'Focused on fast local execution, clean multi-screen mobile UI, scoped device hardware features, and offline reliability without complex server dependencies.',
        inclusions: [
          'Core utility workflows and intuitive Android screen layouts',
          'Local device storage and offline-capable operation',
          'Strictly scoped hardware permissions (e.g., camera or file export)',
          'Release-ready APK / AAB build preparation',
        ],
      },
      {
        id: 'business-or-connected-app',
        badge: 'Scope Template 02',
        name: 'Business or Backend-Integrated App Scope',
        idealFor: 'Businesses and startups requiring user accounts, API data, and multi-screen workflows.',
        summary:
          'Combines polished mobile UI/UX with user authentication, remote API integration, dynamic content views, and structured state management.',
        inclusions: [
          'Multi-screen navigation, forms, and account workflows',
          'Integration with REST APIs, user authentication, and remote data',
          'Error handling, loading states, and local caching where needed',
          'Signed release builds and privacy/permission compliance review',
        ],
      },
      {
        id: 'ui-ux-or-custom-android',
        badge: 'Scope Template 03',
        name: 'Custom Android Suite or UI/UX Modernization',
        idealFor: 'Complex custom Android products or existing apps needing UI/UX and architectural upgrades.',
        summary:
          'Comprehensive engineering for custom mobile products, multi-role workflows, or modernizing the interface and stability of an existing Android codebase.',
        inclusions: [
          'Bespoke feature engineering or full UI/UX implementation',
          'Custom backend integration, dashboard synchronization, or hardware APIs',
          'Performance profiling, crash remediation, and API level updates',
          'Full source code, build artifacts, and handover documentation',
        ],
      },
      {
        id: 'custom-scope',
        badge: 'Flexible Scope',
        name: 'Custom Project Scope',
        idealFor: 'Unique Android application requirements defined directly from your specification.',
        summary:
          'Share your Android app concept, required screens, and technical goals, and DSC will prepare a tailored scope and custom quotation.',
        inclusions: [
          'Feature set tailored to your specific Android project brief',
          'Optional offline-first, hybrid, or backend-connected architecture',
          'Transparent permission and privacy boundary planning',
          'Choice of With Deployment or Without Deployment delivery',
        ],
      },
    ],
    deploymentOptions: {
      'with-deployment': {
        title: 'With Deployment (Store Release & Distribution Coordination)',
        description:
          'DSC prepares the signed production AAB/APK release packages, assists with store listing technical requirements, privacy disclosures, and release track setup, or configures your distribution channel.',
        deliverables: [
          'Signed production Android App Bundle (AAB) and APK artifacts',
          'Store release preparation, target API compliance, and listing guidance',
          'Permission disclosure and privacy policy alignment support',
          'Complete source code and release keystore/build handover',
        ],
      },
      'without-deployment': {
        title: 'Without Deployment (Source & Signed Build Handover)',
        description:
          'DSC delivers the complete Android source project, compiled APK/AAB build artifacts, and build instructions so your team can publish or distribute internally under your own developer account.',
        deliverables: [
          'Complete Android project source code and Gradle build configuration',
          'Compiled APK / AAB packages ready for your internal or store pipeline',
          'Technical documentation covering build steps and environment setup',
          'Full control over your own publishing timeline and accounts',
        ],
      },
    },
    deploymentNote:
      'Every Android Application Development project can be requested With Deployment (store release & distribution coordination) or Without Deployment (source & build package handover).',
  },

  'game-development': {
    slug: 'game-development',
    seoKey: 'serviceGames',
    inquiryCategory: 'game',
    eyebrow: 'DSC Studio Services · Interactive Systems',
    title: 'Game Development',
    subtitle:
      'Custom 2D and 3D game development, gameplay systems engineering, UI/HUD design, and performance optimization.',
    overview:
      'Dark Skull Corporation designs and develops interactive games that combine clear mechanics, progressive challenge curves, responsive controls, character and environment integration, and stable frame pacing on target platforms.',
    whatWeProvide: [
      {
        title: 'Custom Game Development',
        description:
          'End-to-end creation of original puzzle, logic, arcade, casual, and interactive games built around your concept and target platform.',
      },
      {
        title: '2D and 3D Game Development',
        description:
          'Engineering of 2D grid/sprite-based games and 3D interactive environments with structured scene management and camera controls.',
      },
      {
        title: 'Game UI and Gameplay Systems',
        description:
          'Core gameplay loops, rules engines, scoring, difficulty progression, level selectors, HUD overlays, and interactive menus.',
      },
      {
        title: 'Character and Environment Integration',
        description:
          'Integrating character controllers, animations, interactive props, level layouts, audio cues, and environmental feedback into cohesive scenes.',
      },
      {
        title: 'Game Optimization and Delivery',
        description:
          'Frame-rate stabilization, memory and asset optimization, input latency tuning, and packaging for mobile or web delivery.',
      },
    ],
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
      '2D or 3D scene implementation with character and environment integration',
      'Responsive touch, mouse, or keyboard controls and cohesive UI/HUD screens',
      'Local progress persistence, scoring records, and performance-tuned assets',
      'Production game build packaged for target Android or web platforms',
    ],
    developmentProcess: [
      {
        step: '01',
        title: 'Game Concept & Mechanics Scoping',
        description:
          'We review your core game loop, 2D/3D visual style, target platforms, level structure, and deployment preference to prepare a custom quotation.',
      },
      {
        step: '02',
        title: 'Core Gameplay Prototype & Rules Engine',
        description:
          'We engineer the primary controls, rules engine, collision/logic systems, and gameplay feel to validate responsiveness early.',
      },
      {
        step: '03',
        title: 'Levels, UI/HUD & Asset Integration',
        description:
          'Characters, environments, progression curves, menus, HUD overlays, and audio/visual feedback are integrated into structured scenes.',
      },
      {
        step: '04',
        title: 'Optimization, QA & Release Delivery',
        description:
          'We profile frame pacing, memory footprint, and device compatibility, then coordinate release deployment or hand over the production build.',
      },
    ],
    technologies: [
      { name: '2D & 3D Interactive Scene & Gameplay Engineering', category: 'Game Architecture' },
      { name: 'Deterministic State, Scoring & Progression Systems', category: 'Gameplay Systems' },
      { name: 'Responsive Touch, Pointer & Keyboard Input Controllers', category: 'Input & Controls' },
      { name: 'In-Game HUD, Menu Systems & Local Save Persistence', category: 'UI & Data' },
      { name: 'Android Mobile & Web Interactive Build Packaging', category: 'Target Platforms' },
    ],
    scopeTemplates: [
      {
        id: 'focused-2d-or-puzzle-game',
        badge: 'Scope Template 01',
        name: '2D Puzzle, Logic, or Arcade Game Scope',
        idealFor: 'Focused 2D mobile or web games centered on replayable mechanics and clean UI.',
        summary:
          'Covers core gameplay loop engineering, progressive difficulty or level sets, responsive controls, HUD/menu screens, and local high-score/progress saving.',
        inclusions: [
          'Core 2D gameplay mechanics, rules engine, and scoring system',
          'Title screen, level/mode selector, in-game HUD, and summary views',
          'Local progress persistence and offline-ready playability',
          'Performance-tuned production build for Android or Web',
        ],
      },
      {
        id: 'full-2d-3d-game',
        badge: 'Scope Template 02',
        name: 'Multi-Level 2D / 3D Game & Asset Integration Scope',
        idealFor: 'Games requiring character controllers, multiple environments, and richer progression.',
        summary:
          'Includes 2D or 3D scene construction, character and environment asset integration, multi-stage progression systems, and polished UI/UX flows.',
        inclusions: [
          '2D or 3D gameplay systems with character and environment integration',
          'Multiple levels, stages, or game modes with structured progression',
          'Custom HUD overlays, settings controls, and visual/audio feedback',
          'Device optimization and cross-resolution testing',
        ],
      },
      {
        id: 'gameplay-systems-or-optimization',
        badge: 'Scope Template 03',
        name: 'Game UI, Systems Engineering, or Optimization Scope',
        idealFor: 'Projects needing specialized gameplay systems, UI implementation, or performance tuning.',
        summary:
          'Targeted engineering for specific game modules, UI/HUD overhauls, character/environment integration, or frame-rate and delivery optimization.',
        inclusions: [
          'Custom gameplay mechanics, UI/HUD implementation, or scene integration',
          'Rendering, memory, and frame-pacing optimization for target devices',
          'Bug remediation, control responsiveness tuning, and build preparation',
          'Structured source and asset package handover',
        ],
      },
      {
        id: 'custom-scope',
        badge: 'Flexible Scope',
        name: 'Custom Project Scope',
        idealFor: 'Original game concepts or custom interactive builds defined from your game design brief.',
        summary:
          'Share your game concept, 2D/3D preferences, target platform, and feature list, and DSC will prepare a tailored project scope and quotation.',
        inclusions: [
          'Scope defined directly around your game design requirements',
          'Flexible combination of 2D/3D gameplay, UI, and asset integration',
          'Milestone structure aligned with playable builds',
          'Choice of With Deployment or Without Deployment delivery',
        ],
      },
    ],
    deploymentOptions: {
      'with-deployment': {
        title: 'With Deployment (Store or Web Release Coordination)',
        description:
          'DSC packages the optimized production game build, assists with Google Play Store release preparation or web hosting deployment, and verifies live installation and launch.',
        deliverables: [
          'Signed release-ready mobile package (AAB/APK) or live deployed web build',
          'Store release preparation, device compatibility setup, and launch verification',
          'Performance and asset compression check on production build',
          'Full project source and compiled build handover',
        ],
      },
      'without-deployment': {
        title: 'Without Deployment (Game Source & Build Package Handover)',
        description:
          'DSC delivers the complete game project source, integrated assets, and compiled release builds so you or your publishing team can handle store submission or distribution directly.',
        deliverables: [
          'Complete game source project, scenes, and gameplay scripts',
          'Compiled production game builds for target platforms',
          'Build configuration and asset pipeline documentation',
          'Ready for publishing under your own studio or store account',
        ],
      },
    },
    deploymentNote:
      'Every Game Development project can be requested With Deployment (store or web release coordination) or Without Deployment (complete source & build handover).',
  },
}

/**
 * Returns all studio service category summary objects.
 */
export function getAllServices() {
  return [...studioServiceCategories]
}

/**
 * Returns a detailed service blueprint by slug ('websites', 'android-applications', 'game-development').
 */
export function getServiceBlueprint(slug) {
  if (!slug || typeof slug !== 'string') return null
  return serviceBlueprints[slug.trim()] || null
}

/**
 * Returns a deployment option object by ID ('with-deployment' or 'without-deployment').
 */
export function getDeploymentOptionById(optionId) {
  if (!optionId || typeof optionId !== 'string') return DEPLOYMENT_OPTIONS[0]
  return DEPLOYMENT_OPTIONS.find((opt) => opt.id === optionId.trim()) || DEPLOYMENT_OPTIONS[0]
}

/**
 * Returns a scope template object for a given service slug and template ID.
 */
export function getScopeTemplateById(serviceSlug, scopeId) {
  const blueprint = getServiceBlueprint(serviceSlug)
  if (!blueprint || !Array.isArray(blueprint.scopeTemplates)) return null
  if (!scopeId || typeof scopeId !== 'string') {
    return blueprint.scopeTemplates[0] || null
  }
  return (
    blueprint.scopeTemplates.find((tpl) => tpl.id === scopeId.trim()) ||
    blueprint.scopeTemplates[0] ||
    null
  )
}

/**
 * Builds a structured Contact / Requirements inquiry URL carrying the selected
 * service slug, scope template ID, and deployment option ID.
 */
export function buildServiceInquiryUrl({
  serviceSlug,
  scopeId,
  deploymentOption = 'with-deployment',
} = {}) {
  const params = new URLSearchParams()
  if (serviceSlug) params.set('service', serviceSlug)
  if (scopeId) params.set('scope', scopeId)
  if (deploymentOption) params.set('deployment', deploymentOption)
  const queryString = params.toString()
  return queryString ? `/contact?${queryString}` : '/contact'
}

/**
 * Resolves URL query parameters (`service`, `scope`, `deployment`) into pre-populated
 * Contact form fields and selection summary metadata.
 */
export function resolveServicePrefill({ serviceSlug, scopeId, deploymentOption } = {}) {
  const blueprint = getServiceBlueprint(serviceSlug)
  if (!blueprint) {
    return null
  }

  const template = getScopeTemplateById(blueprint.slug, scopeId)
  const deployment = getDeploymentOptionById(deploymentOption)

  const category = blueprint.inquiryCategory || 'website'
  const scopeName = template ? template.name : 'Custom Project Scope'
  const deploymentLabel = deployment ? deployment.label : 'With Deployment'

  const subject = `Project Quotation Inquiry — ${blueprint.title} (${deploymentLabel})`
  const message = [
    `Service Requested: ${blueprint.title}`,
    `Selected Scope Template: ${scopeName}`,
    `Deployment Preference: ${deploymentLabel}`,
    '',
    'Project Goals & Requirements:',
    'Please describe your project objectives, target features, and any reference links here so DSC can review the scope and provide a custom quotation.',
  ].join('\n')

  return {
    serviceSlug: blueprint.slug,
    serviceTitle: blueprint.title,
    category,
    scopeId: template ? template.id : 'custom-scope',
    scopeName,
    deploymentId: deployment ? deployment.id : 'with-deployment',
    deploymentLabel,
    subject,
    message,
  }
}
