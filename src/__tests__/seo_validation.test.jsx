import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  BASE_SCHEMA_GRAPH,
  INDEXABLE_PUBLIC_ROUTES,
  SEO_ROUTES,
  SITE_NAME,
  buildRouteStructuredData,
} from '../content/seoConfig'
import { HomePage } from '../pages/HomePage'
import { StudioProductsPage } from '../pages/StudioProductsPage'
import { InProductionPage } from '../pages/InProductionPage'
import { OwnProductsPage } from '../pages/OwnProductsPage'
import { BuiltByDscPage } from '../pages/BuiltByDscPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ServicesOverviewPage } from '../pages/ServicesOverviewPage'
import { ServiceDetailPage } from '../pages/ServiceDetailPage'
import { TeamPage } from '../pages/TeamPage'
import { AppsPage } from '../pages/AppsPage'
import { WebsitesPage } from '../pages/WebsitesPage'
import { ProductsPage } from '../pages/ProductsPage'
import { LegacyProductsCatalogPage } from '../pages/LegacyProductsCatalogPage'
import { DownloadsPage } from '../pages/DownloadsPage'
import { FreePanelPage } from '../pages/FreePanelPage'
import { AboutPage } from '../pages/AboutPage'
import { ContactPage } from '../pages/ContactPage'
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage'
import { TermsPage } from '../pages/TermsPage'
import { StatusPage } from '../pages/StatusPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { UserLoginPage } from '../pages/UserLoginPage'
import { AdminLoginPage } from '../pages/AdminLoginPage'
import { ChangePasswordPage } from '../pages/ChangePasswordPage'
import { GenerateKeyPage } from '../pages/GenerateKeyPage'
import { MaintenancePage } from '../pages/MaintenancePage'
import { NotFoundPage } from '../pages/NotFoundPage'

const rootDir = process.cwd()

describe('Complete Technical & On-Page SEO Validation Suite', () => {
  it('validates public/sitemap.xml structure, HTTPS canonical URLs, uniqueness, and exclusion of private/checkout routes', () => {
    const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml')
    const xml = fs.readFileSync(sitemapPath, 'utf8')

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    // Ensure no arbitrary priority, changefreq, or invented lastmod tags
    expect(xml).not.toContain('<priority>')
    expect(xml).not.toContain('<changefreq>')
    expect(xml).not.toContain('<lastmod>')

    const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
    expect(locMatches.length).toBe(INDEXABLE_PUBLIC_ROUTES.length)

    // Uniqueness check
    const uniqueLocs = new Set(locMatches)
    expect(uniqueLocs.size).toBe(locMatches.length)

    // HTTPS & canonical format check
    for (const url of locMatches) {
      expect(url.startsWith('https://dscweb.me')).toBe(true)
      expect(url.endsWith('.html')).toBe(false)
      expect(url.includes('?')).toBe(false)
      if (url !== 'https://dscweb.me/') {
        expect(url.endsWith('/')).toBe(false)
      }
    }

    // All indexable public routes must be in sitemap.xml
    const expectedUrls = INDEXABLE_PUBLIC_ROUTES.map((r) => r.canonical)
    expect(locMatches.sort()).toEqual(expectedUrls.sort())

    // Non-indexable routes must NEVER appear in sitemap.xml
    const forbiddenSubstrings = [
      '/pages/products',
      '/pages/catalog',
      '/pages/checkout',
      '/pages/ulogin',
      '/pages/alogin',
      '/pages/udash',
      '/pages/adash',
      '/pages/ownerdb',
      '/pages/change',
      '/pages/generatekey',
      '/pages/404',
    ]
    for (const forbidden of forbiddenSubstrings) {
      expect(xml).not.toContain(forbidden)
    }
  })

  it('validates public/robots.txt directives, sitemap reference, and crawlability alignment with noindex routes', () => {
    const robotsPath = path.join(rootDir, 'public', 'robots.txt')
    const robots = fs.readFileSync(robotsPath, 'utf8')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Sitemap: https://dscweb.me/sitemap.xml')

    // Admin & private workspaces disallowed
    expect(robots).toContain('Disallow: /pages/adash')
    expect(robots).toContain('Disallow: /pages/ownerdb')
    expect(robots).toContain('Disallow: /pages/generatekey')
    expect(robots).toContain('Disallow: /pages/udash')
    expect(robots).toContain('Disallow: /pages/change')
    expect(robots).toContain('Disallow: /pages/alogin')

    // Public pages and noindex-discoverable pages (/pages/checkout, /pages/ulogin) must not be blocked
    expect(robots).not.toContain('Disallow: /pages/apps')
    expect(robots).not.toContain('Disallow: /pages/products')
    expect(robots).not.toContain('Disallow: /pages/checkout')
    expect(robots).not.toContain('Disallow: /pages/ulogin')
  })

  it('ensures every indexable public route has a unique title, unique description, and valid canonical URL with zero Calculator references', () => {
    const titles = new Set()
    const descriptions = new Set()
    const canonicals = new Set()

    for (const route of INDEXABLE_PUBLIC_ROUTES) {
      expect(route.title.length).toBeGreaterThan(20)
      expect(route.description.length).toBeGreaterThanOrEqual(120)
      expect(route.description.length).toBeLessThanOrEqual(170)
      expect(route.robots).toBe('index, follow')
      expect(route.canonical.startsWith('https://dscweb.me')).toBe(true)

      expect(titles.has(route.title)).toBe(false)
      expect(descriptions.has(route.description)).toBe(false)
      expect(canonicals.has(route.canonical)).toBe(false)

      titles.add(route.title)
      descriptions.add(route.description)
      canonicals.add(route.canonical)

      expect(route.title).not.toMatch(/calculator/i)
      expect(route.description).not.toMatch(/calculator/i)
    }
  })

  it('validates index.html Google Search Console token, Open Graph, Twitter cards, and Schema.org JSON-LD', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8')

    // Preserve Google Search Console verification token
    expect(indexHtml).toContain(
      '<meta name="google-site-verification" content="Hw79fkwrion-b4AozRAnpjjcOAv9kHsCs40eEAq00c4" />',
    )
    expect(indexHtml).not.toMatch(/calculator/i)

    const jsonLdMatch = indexHtml.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
    )
    expect(jsonLdMatch).toBeTruthy()
    const parsed = JSON.parse(jsonLdMatch[1])
    expect(parsed['@context']).toBe('https://schema.org')
    expect(Array.isArray(parsed['@graph'])).toBe(true)

    const org = parsed['@graph'].find((n) => n['@type'] === 'Organization')
    expect(org).toBeTruthy()
    expect(org.name).toBe('Dark Skull Corporation')
    expect(org.alternateName).toBe('DSC')
    expect(org.url).toBe('https://dscweb.me/')
    expect(org.founder.name).toBe('Naveed Mushtaq')
    expect(org.founder.jobTitle).toBe('Founder & Lead Developer')
    expect(org.knowsAbout).toEqual([
      'Android Application Development',
      'Game Development',
      'Custom Website Development',
    ])

    // Verify no invented fields
    expect(org.address).toBeUndefined()
    expect(org.telephone).toBeUndefined()
    expect(org.aggregateRating).toBeUndefined()

    const website = parsed['@graph'].find((n) => n['@type'] === 'WebSite')
    expect(website).toBeTruthy()
    expect(website.potentialAction).toBeUndefined()
  })

  it('renders each public page with a single H1 and dynamically updates head title, description, canonical, Open Graph, Twitter, and JSON-LD without duplicate tags', () => {
    const publicPageMatrix = [
      { key: 'home', element: <HomePage systemStatus={{ isMaintenanceMode: false }} /> },
      { key: 'studioProducts', element: <StudioProductsPage /> },
      { key: 'inProduction', element: <InProductionPage /> },
      { key: 'ownProducts', element: <OwnProductsPage /> },
      { key: 'builtByDsc', element: <BuiltByDscPage /> },
      { key: 'projectQrScanner', element: <ProjectDetailPage projectSlug="qr-scanner-generator" /> },
      { key: 'projectMindMatrix', element: <ProjectDetailPage projectSlug="mind-matrix" /> },
      { key: 'services', element: <ServicesOverviewPage /> },
      { key: 'serviceWebsites', element: <ServiceDetailPage serviceSlug="websites" /> },
      { key: 'serviceAndroid', element: <ServiceDetailPage serviceSlug="android-applications" /> },
      { key: 'serviceGames', element: <ServiceDetailPage serviceSlug="game-development" /> },
      { key: 'team', element: <TeamPage /> },
      { key: 'apps', element: <AppsPage /> },
      { key: 'downloads', element: <DownloadsPage systemStatus={{}} /> },
      { key: 'freepanel', element: <FreePanelPage /> },
      { key: 'about', element: <AboutPage /> },
      { key: 'contact', element: <ContactPage /> },
      { key: 'privacy', element: <PrivacyPolicyPage /> },
      { key: 'terms', element: <TermsPage /> },
      { key: 'status', element: <StatusPage /> },
    ]

    for (const item of publicPageMatrix) {
      const expected = SEO_ROUTES[item.key]
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[expected.routePath]}>
          {item.element}
        </MemoryRouter>,
      )

      // Exactly 1 H1 on every public page
      const h1Elements = container.querySelectorAll('h1')
      expect(h1Elements.length).toBe(1)
      expect(h1Elements[0].textContent.trim().length).toBeGreaterThan(3)

      // Exact title without double "| DSCWeb" branding
      expect(document.title).toBe(expected.title)
      expect(document.title).not.toContain('| DSCWeb')

      // Single meta description, robots, canonical, OG, and Twitter tags
      const descTags = document.head.querySelectorAll('meta[name="description"]')
      expect(descTags.length).toBe(1)
      expect(descTags[0].getAttribute('content')).toBe(expected.description)

      const robotsTags = document.head.querySelectorAll('meta[name="robots"]')
      expect(robotsTags.length).toBe(1)
      expect(robotsTags[0].getAttribute('content')).toBe('index, follow')

      const canonicalLinks = document.head.querySelectorAll('link[rel="canonical"]')
      expect(canonicalLinks.length).toBe(1)
      expect(canonicalLinks[0].getAttribute('href')).toBe(expected.canonical)

      expect(
        document.head.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ).toBe(expected.title)
      expect(
        document.head.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ).toBe(expected.description)
      expect(
        document.head.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      ).toBe(expected.canonical)
      expect(
        document.head.querySelector('meta[property="og:site_name"]')?.getAttribute('content'),
      ).toBe(SITE_NAME)
      expect(
        document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      ).toBe('summary')
      expect(
        document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      ).toBe(expected.title)

      const ldScript = document.head.querySelector('script#dsc-schema-jsonld')
      expect(ldScript).toBeTruthy()
      const ldJson = JSON.parse(ldScript.textContent)
      expect(Array.isArray(ldJson['@graph'])).toBe(true)

      if (item.key === 'apps' || item.key === 'inProduction') {
        const softwareNodes = ldJson['@graph'].filter(
          (node) => node['@type'] === 'SoftwareApplication',
        )
        expect(softwareNodes.length).toBe(2)
        expect(softwareNodes.map((s) => s.name)).toEqual([
          'QR Scanner | Generator',
          'Mind Matrix',
        ])
      }

      unmount()
    }
  })

  it('sets robots="noindex, nofollow" on Legacy Products, Websites, Checkout, Login, Password, Key Generation, Maintenance, and 404 pages', () => {
    const noindexPages = [
      { key: 'products', path: '/pages/products', element: <ProductsPage /> },
      { key: 'websites', path: '/pages/websites', element: <WebsitesPage /> },
      { key: 'catalog', path: '/pages/catalog', element: <LegacyProductsCatalogPage /> },
      { key: 'checkout', path: '/pages/checkout?panel=streamer', element: <CheckoutPage /> },
      { key: 'ulogin', path: '/pages/ulogin', element: <UserLoginPage session={null} /> },
      { key: 'alogin', path: '/pages/alogin', element: <AdminLoginPage session={null} /> },
      {
        key: 'change',
        path: '/pages/change',
        element: <ChangePasswordPage session={{ role: 'User', plan: 'streamer' }} />,
      },
      {
        key: 'generatekey',
        path: '/pages/generatekey',
        element: <GenerateKeyPage session={{ role: 'Admin', token: 't' }} />,
      },
      {
        key: 'maintenance',
        path: '/',
        element: <MaintenancePage systemStatus={{ isMaintenanceMode: true }} />,
      },
      { key: 'notFound', path: '/pages/404', element: <NotFoundPage /> },
    ]

    for (const page of noindexPages) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[page.path]}>{page.element}</MemoryRouter>,
      )

      const robotsMeta = document.head.querySelector('meta[name="robots"]')
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow')
      unmount()
    }
  })

  it('builds valid structured data graphs for all routes without Calculator references', () => {
    expect(BASE_SCHEMA_GRAPH.length).toBe(3)
    for (const route of Object.values(SEO_ROUTES)) {
      const schema = buildRouteStructuredData(route)
      const serialized = JSON.stringify(schema)
      expect(serialized).not.toMatch(/calculator/i)
      expect(() => JSON.parse(serialized)).not.toThrow()
    }
  })
})
