import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { LegacyProductsCatalog } from './LegacyProductsCatalogPage'

export { LegacyProductsCatalog }

/**
 * Preserves the legacy /pages/products route behavior (software catalog & licensing)
 * to prevent any route collision with the new /products Software Studio overview.
 */
export function ProductsPage() {
  usePageMeta(SEO_ROUTES.products)
  return <LegacyProductsCatalog />
}
