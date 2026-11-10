import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_OG_IMAGE,
  INDEXABLE_PUBLIC_ROUTES,
  SEO_ROUTES,
  SITE_NAME,
  buildRouteStructuredData,
} from '../src/content/seoConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist')
const baseHtmlPath = path.join(distDir, 'index.html')

function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function injectRouteSeoIntoHtml(templateHtml, route) {
  const escapedTitle = escapeHtmlAttr(route.title)
  const escapedDesc = escapeHtmlAttr(route.description)
  const escapedCanonical = escapeHtmlAttr(route.canonical)
  const escapedRobots = escapeHtmlAttr(route.robots || 'index, follow')
  const escapedOgType = escapeHtmlAttr(route.ogType || 'website')
  const escapedSiteName = escapeHtmlAttr(SITE_NAME)
  const escapedOgImage = escapeHtmlAttr(route.ogImage || DEFAULT_OG_IMAGE)
  const structuredDataJson = JSON.stringify(buildRouteStructuredData(route), null, 2)

  let html = templateHtml

  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapedTitle}</title>`,
  )

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapedDesc}" />`,
  )

  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${escapedRobots}" />`,
  )

  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapedCanonical}" />`,
  )

  // Open Graph replacements
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapedOgType}" />`,
  )
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapedCanonical}" />`,
  )
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapedTitle}" />`,
  )
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapedDesc}" />`,
  )
  html = html.replace(
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${escapedSiteName}" />`,
  )
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapedOgImage}" />`,
  )

  // Twitter replacements
  html = html.replace(
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:card" content="summary" />`,
  )
  html = html.replace(
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${escapedCanonical}" />`,
  )
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
  )
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapedDesc}" />`,
  )
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapedOgImage}" />`,
  )

  // JSON-LD replacement
  html = html.replace(
    /<script\s+id="dsc-schema-jsonld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="dsc-schema-jsonld" type="application/ld+json">\n${structuredDataJson}\n    </script>`,
  )

  return html
}

function runPrerender() {
  if (!fs.existsSync(baseHtmlPath)) {
    throw new Error(`dist/index.html not found at ${baseHtmlPath}. Run vite build first.`)
  }

  const templateHtml = fs.readFileSync(baseHtmlPath, 'utf8')

  // 1. Update root dist/index.html with exact Home metadata & JSON-LD
  const homeHtml = injectRouteSeoIntoHtml(templateHtml, SEO_ROUTES.home)
  fs.writeFileSync(baseHtmlPath, homeHtml, 'utf8')

  // 2. Generate static HTML route shells for all routes with a sub-path
  const routesToEmit = Object.values(SEO_ROUTES).filter(
    (route) => route.routePath && route.routePath !== '/' && route.key !== 'maintenance',
  )

  for (const route of routesToEmit) {
    const relativeRoute = route.routePath.replace(/^\/+/, '')
    const routeHtml = injectRouteSeoIntoHtml(templateHtml, route)

    // Emit dist/<route>/index.html for directory-style static resolution
    const dirTarget = path.join(distDir, relativeRoute, 'index.html')
    fs.mkdirSync(path.dirname(dirTarget), { recursive: true })
    fs.writeFileSync(dirTarget, routeHtml, 'utf8')
  }

  // Emit static shells for /about and /contact clean route aliases
  for (const [aliasDir, seoRoute] of [
    ['about', SEO_ROUTES.about],
    ['contact', SEO_ROUTES.contact],
  ]) {
    const aliasHtml = injectRouteSeoIntoHtml(templateHtml, seoRoute)
    const aliasTarget = path.join(distDir, aliasDir, 'index.html')
    fs.mkdirSync(path.dirname(aliasTarget), { recursive: true })
    fs.writeFileSync(aliasTarget, aliasHtml, 'utf8')
  }

  // Emit dist/404.html for static hosts
  const notFoundHtml = injectRouteSeoIntoHtml(templateHtml, SEO_ROUTES.notFound)
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8')

  // 3. Verify sitemap.xml and robots.txt exist in dist/
  const sitemapPath = path.join(distDir, 'sitemap.xml')
  const robotsPath = path.join(distDir, 'robots.txt')
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('dist/sitemap.xml is missing after build.')
  }
  if (!fs.existsSync(robotsPath)) {
    throw new Error('dist/robots.txt is missing after build.')
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
  for (const pubRoute of INDEXABLE_PUBLIC_ROUTES) {
    if (!sitemapContent.includes(`<loc>${pubRoute.canonical}</loc>`)) {
      throw new Error(`dist/sitemap.xml is missing canonical public route: ${pubRoute.canonical}`)
    }
  }

  console.log(
    `[SEO Prerender] Generated static HTML metadata shells for ${routesToEmit.length + 1} routes and verified sitemap.xml (${INDEXABLE_PUBLIC_ROUTES.length} public URLs).`,
  )
}

runPrerender()
