import { NavLink, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { SEO_ROUTES } from '../content/seoConfig'
import { productCategories } from '../content/siteContent'
import { LegacyProductsCatalog } from './LegacyProductsCatalogPage'

export { LegacyProductsCatalog }

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const viewMode = searchParams.get('view')
  const panelParam = searchParams.get('panel')
  const showLegacyCatalog = viewMode === 'catalog' || Boolean(panelParam)

  usePageMeta(showLegacyCatalog ? SEO_ROUTES.catalog : SEO_ROUTES.products)

  if (showLegacyCatalog) {
    return <LegacyProductsCatalog />
  }

  return (
    <div className="center-wrap">
      {/* Products Overview Header */}
      <section className="page-header-center">
        <span className="hero-eyebrow">Dark Skull Corporation</span>
        <h1>Products</h1>
        <p>
          Explore software and digital products developed by Dark Skull Corporation.
        </p>
      </section>

      {/* Primary Product Categories: 1. Android Applications & 2. Websites */}
      <div className="products-overview-grid mt-36">
        {productCategories.map((category) => (
          <article key={category.id} className="product-category-card">
            <div className="product-category-top">
              <div className="product-category-meta">
                <span className="product-category-number">{category.categoryLabel}</span>
                <span className="badge primary">{category.badge}</span>
              </div>

              <div className="product-category-visual">
                <picture>
                  <source srcSet={category.imageWebp} type="image/webp" />
                  <img
                    src={category.imageFallback}
                    alt={category.imageAlt}
                    className="product-category-img"
                    width="56"
                    height="56"
                    loading="lazy"
                  />
                </picture>
              </div>
            </div>

            <h2 className="product-category-title">{category.title}</h2>
            <p className="product-category-desc">{category.description}</p>

            <ul className="product-features mb-24">
              {category.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="product-action-wrap">
              <NavLink to={category.action.to} className="button button-primary w-100">
                {category.action.label}
              </NavLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
