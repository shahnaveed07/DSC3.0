import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  PORTFOLIO_CATEGORIES,
  PROJECT_TYPES,
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectsByCategory,
  portfolioProjects,
} from '../content/projectsData'
import { StudioProductsPage } from '../pages/StudioProductsPage'
import { InProductionPage } from '../pages/InProductionPage'
import { OwnProductsPage } from '../pages/OwnProductsPage'
import { BuiltByDscPage } from '../pages/BuiltByDscPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'

describe('Phase 2 — Canonical Portfolio Data & Filtering Suite', () => {
  it('maintains a single canonical record per verified project without duplication across portfolio categories', () => {
    const all = getAllProjects()
    expect(all.length).toBe(2)

    const slugs = all.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(all.length)
    expect(slugs).toEqual(['qr-scanner-generator', 'mind-matrix'])

    // Verify canonical fields
    const qr = getProjectBySlug('qr-scanner-generator')
    expect(qr).toBeTruthy()
    expect(qr.name).toBe('QR Scanner | Generator')
    expect(qr.projectType).toBe(PROJECT_TYPES.ANDROID_APPLICATION)
    expect(qr.ownership).toBe('Dark Skull Corporation')
    expect(qr.portfolioCategory).toContain(PORTFOLIO_CATEGORIES.IN_PRODUCTION)
    expect(qr.portfolioCategory).toContain(PORTFOLIO_CATEGORIES.OWN_PRODUCT)
    expect(qr.storeUrl).toBe('https://play.google.com/store/apps/details?id=com.dsc.qrscanner')

    const mind = getProjectBySlug('mind-matrix')
    expect(mind).toBeTruthy()
    expect(mind.name).toBe('Mind Matrix')
    expect(mind.projectType).toBe(PROJECT_TYPES.GAME)
    expect(mind.ownership).toBe('Dark Skull Corporation')
    expect(mind.portfolioCategory).toContain(PORTFOLIO_CATEGORIES.IN_PRODUCTION)
    expect(mind.portfolioCategory).toContain(PORTFOLIO_CATEGORIES.OWN_PRODUCT)
    expect(mind.storeUrl).toBe('https://play.google.com/store/apps/details?id=com.dsc.mindmatrix')

    // Verify unknown slug returns null
    expect(getProjectBySlug('non-existent-project')).toBeNull()
    expect(getFeaturedProjects().length).toBe(2)
  })

  it('filters canonical projects accurately by portfolioCategory and projectType', () => {
    // In Production
    expect(getProjectsByCategory(PORTFOLIO_CATEGORIES.IN_PRODUCTION, 'all').length).toBe(2)
    expect(
      getProjectsByCategory(PORTFOLIO_CATEGORIES.IN_PRODUCTION, 'android-applications').map(
        (p) => p.slug,
      ),
    ).toEqual(['qr-scanner-generator'])
    expect(
      getProjectsByCategory(PORTFOLIO_CATEGORIES.IN_PRODUCTION, 'games').map((p) => p.slug),
    ).toEqual(['mind-matrix'])
    expect(getProjectsByCategory(PORTFOLIO_CATEGORIES.IN_PRODUCTION, 'websites')).toEqual([])

    // Own Products (same underlying canonical records, not duplicated objects)
    const ownAll = getProjectsByCategory(PORTFOLIO_CATEGORIES.OWN_PRODUCT, 'all')
    expect(ownAll.length).toBe(2)
    expect(ownAll[0]).toBe(portfolioProjects[0])
    expect(ownAll[1]).toBe(portfolioProjects[1])

    // Built by DSC (no fabricated client records)
    expect(getProjectsByCategory(PORTFOLIO_CATEGORIES.BUILT_BY_DSC, 'all')).toEqual([])
    expect(getProjectsByCategory(PORTFOLIO_CATEGORIES.BUILT_BY_DSC, 'websites')).toEqual([])
  })

  it('StudioProductsPage (/products) displays category cards and featured verified projects linking to /projects/:slug', () => {
    render(
      <MemoryRouter>
        <StudioProductsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Products & Portfolio/i })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: /Featured Projects/i })).toBeTruthy()

    const qrCard = screen.getByTestId('project-card-qr-scanner-generator')
    const mindCard = screen.getByTestId('project-card-mind-matrix')
    expect(qrCard).toBeTruthy()
    expect(mindCard).toBeTruthy()

    const detailLinks = screen.getAllByRole('link', { name: /View Project/i })
    expect(detailLinks.map((l) => l.getAttribute('href'))).toEqual([
      '/projects/qr-scanner-generator',
      '/projects/mind-matrix',
    ])
  })

  it('InProductionPage (/products/in-production) filters projects across All, Android Applications, Websites, and Games', () => {
    render(
      <MemoryRouter>
        <InProductionPage />
      </MemoryRouter>,
    )

    const allBtn = screen.getByRole('button', { name: /^All$/i })
    const androidBtn = screen.getByRole('button', { name: /^Android Applications$/i })
    const websitesBtn = screen.getByRole('button', { name: /^Websites$/i })
    const gamesBtn = screen.getByRole('button', { name: /^Games$/i })

    expect(allBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('project-card-qr-scanner-generator')).toBeTruthy()
    expect(screen.getByTestId('project-card-mind-matrix')).toBeTruthy()

    // Filter: Android Applications
    fireEvent.click(androidBtn)
    expect(androidBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('project-card-qr-scanner-generator')).toBeTruthy()
    expect(screen.queryByTestId('project-card-mind-matrix')).toBeNull()

    // Filter: Games
    fireEvent.click(gamesBtn)
    expect(gamesBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('project-card-mind-matrix')).toBeTruthy()
    expect(screen.queryByTestId('project-card-qr-scanner-generator')).toBeNull()

    // Filter: Websites (Empty State)
    fireEvent.click(websitesBtn)
    expect(websitesBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByTestId('project-card-qr-scanner-generator')).toBeNull()
    expect(screen.queryByTestId('project-card-mind-matrix')).toBeNull()
    expect(screen.getByText(/No Additional Websites Listed Yet/i)).toBeTruthy()
  })

  it('OwnProductsPage (/products/own-products) renders DSC-owned products and shows empty state when filtering by Websites', () => {
    render(
      <MemoryRouter>
        <OwnProductsPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('project-card-qr-scanner-generator')).toBeTruthy()
    expect(screen.getByTestId('project-card-mind-matrix')).toBeTruthy()

    const websitesBtn = screen.getByRole('button', { name: /^Websites$/i })
    fireEvent.click(websitesBtn)

    expect(screen.queryByTestId('project-card-qr-scanner-generator')).toBeNull()
    expect(screen.getByText(/No DSC-Owned Websites Listed Yet/i)).toBeTruthy()
  })

  it('BuiltByDscPage (/products/built-by-dsc) supports project type filters and shows honest client empty state', () => {
    render(
      <MemoryRouter>
        <BuiltByDscPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/No Approved Client Showcase Entries Listed Yet/i)).toBeTruthy()

    const gamesBtn = screen.getByRole('button', { name: /^Games$/i })
    fireEvent.click(gamesBtn)
    expect(gamesBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/CLIENT PORTFOLIO · GAMES/i)).toBeTruthy()
  })

  it('ProjectDetailPage (/projects/:slug) renders verified project details and handles unknown slugs gracefully', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/projects/qr-scanner-generator']}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /QR Scanner \| Generator/i }),
    ).toBeTruthy()
    expect(screen.getByText(/com\.dsc\.qrscanner/i)).toBeTruthy()
    expect(screen.getByText(/Permissions Transparency:/i)).toBeTruthy()
    unmount()

    render(
      <MemoryRouter initialEntries={['/projects/unknown-slug']}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Project Not Found/i })).toBeTruthy()
    expect(screen.getByText(/Unrecognized Project Identifier/i)).toBeTruthy()
  })
})
