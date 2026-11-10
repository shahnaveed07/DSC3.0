import { useEffect } from 'react'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  buildRouteStructuredData,
} from '../content/seoConfig'

function upsertMetaTag(attributeName, attributeValue, contentValue) {
  if (!contentValue) return
  const selector = `meta[${attributeName}="${attributeValue}"]`
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', contentValue)
}

function upsertCanonicalLink(hrefValue) {
  if (!hrefValue) return
  let canonicalLink = document.head.querySelector('link[rel="canonical"]')
  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalLink)
  }
  canonicalLink.setAttribute('href', hrefValue)
}

function normalizeCanonicalUrl(canonical) {
  if (!canonical) {
    const pathname =
      typeof window !== 'undefined' && window.location?.pathname
        ? window.location.pathname
        : '/'
    if (pathname === '/' || pathname === '/index.html') {
      return `${SITE_URL}/`
    }
    const cleanPath = pathname.replace(/\.html$/i, '').replace(/\/+$/, '')
    return `${SITE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`
  }

  const trimmed = String(canonical).trim()
  if (trimmed === SITE_URL || trimmed === `${SITE_URL}/`) {
    return `${SITE_URL}/`
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '')
  }
  const cleanRel = trimmed.replace(/\/+$/, '')
  return `${SITE_URL}${cleanRel.startsWith('/') ? cleanRel : `/${cleanRel}`}`
}

function formatDocumentTitle(rawTitle) {
  if (!rawTitle) {
    return `${SITE_NAME} | Android Apps & Game Development`
  }
  const trimmed = String(rawTitle).trim()
  if (
    /Dark Skull Corporation/i.test(trimmed) ||
    /\bDSC\b/.test(trimmed) ||
    /\bDSCWeb\b/i.test(trimmed)
  ) {
    return trimmed
  }
  return `${trimmed} | ${SITE_NAME}`
}

export function usePageMeta({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogUrl,
  ogImage = DEFAULT_OG_IMAGE,
  twitterCard = 'summary',
  twitterTitle,
  twitterDescription,
  twitterImage,
  schemaType = 'WebPage',
  extraSchemaNodes,
  jsonLd,
} = {}) {
  useEffect(() => {
    const resolvedTitle = formatDocumentTitle(title)
    const resolvedDescription =
      description ||
      'Dark Skull Corporation is an independent software studio focused on Android applications, game development and custom websites for individuals and businesses.'
    const resolvedCanonical = normalizeCanonicalUrl(canonical)
    const resolvedRobots = robots || 'index, follow'
    const resolvedOgTitle = ogTitle ? formatDocumentTitle(ogTitle) : resolvedTitle
    const resolvedOgDescription = ogDescription || resolvedDescription
    const resolvedOgType = ogType || 'website'
    const resolvedOgUrl = ogUrl ? normalizeCanonicalUrl(ogUrl) : resolvedCanonical
    const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE
    const resolvedTwitterCard = twitterCard || 'summary'
    const resolvedTwitterTitle = twitterTitle ? formatDocumentTitle(twitterTitle) : resolvedOgTitle
    const resolvedTwitterDescription = twitterDescription || resolvedOgDescription
    const resolvedTwitterImage = twitterImage || resolvedOgImage

    document.title = resolvedTitle

    upsertMetaTag('name', 'description', resolvedDescription)
    upsertMetaTag('name', 'robots', resolvedRobots)
    upsertCanonicalLink(resolvedCanonical)

    // Open Graph metadata
    upsertMetaTag('property', 'og:type', resolvedOgType)
    upsertMetaTag('property', 'og:title', resolvedOgTitle)
    upsertMetaTag('property', 'og:description', resolvedOgDescription)
    upsertMetaTag('property', 'og:url', resolvedOgUrl)
    upsertMetaTag('property', 'og:site_name', SITE_NAME)
    upsertMetaTag('property', 'og:image', resolvedOgImage)

    // Twitter / X Card metadata
    upsertMetaTag('name', 'twitter:card', resolvedTwitterCard)
    upsertMetaTag('name', 'twitter:url', resolvedOgUrl)
    upsertMetaTag('name', 'twitter:title', resolvedTwitterTitle)
    upsertMetaTag('name', 'twitter:description', resolvedTwitterDescription)
    upsertMetaTag('name', 'twitter:image', resolvedTwitterImage)

    // Structured Data (Schema.org JSON-LD)
    const structuredDataPayload =
      jsonLd ||
      buildRouteStructuredData({
        title: resolvedTitle,
        description: resolvedDescription,
        canonical: resolvedCanonical,
        indexable: !/noindex/i.test(resolvedRobots),
        schemaType,
        extraSchemaNodes,
      })

    let ldScript =
      document.head.querySelector('script#dsc-schema-jsonld') ||
      document.head.querySelector('script[type="application/ld+json"]')

    if (!ldScript) {
      ldScript = document.createElement('script')
      ldScript.setAttribute('type', 'application/ld+json')
      ldScript.setAttribute('id', 'dsc-schema-jsonld')
      document.head.appendChild(ldScript)
    } else if (!ldScript.getAttribute('id')) {
      ldScript.setAttribute('id', 'dsc-schema-jsonld')
    }

    ldScript.textContent = JSON.stringify(structuredDataPayload)
  }, [
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogType,
    ogUrl,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schemaType,
    extraSchemaNodes,
    jsonLd,
  ])
}
