import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { AboutPage } from '../pages/AboutPage'
import { AppsPage } from '../pages/AppsPage'
import { DownloadsPage } from '../pages/DownloadsPage'
import { ProductsPage } from '../pages/ProductsPage'
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage'
import { TermsPage } from '../pages/TermsPage'
import { ContactPage } from '../pages/ContactPage'

describe('Brand Identity, Portfolio & AdSense Content Verification Suite', () => {
  it('AppsPage showcases QR Scanner | Generator and Mind Matrix with Google Play links and no Calculator', () => {
    render(
      <MemoryRouter>
        <AppsPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/QR Scanner \| Generator/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Mind Matrix/i).length).toBeGreaterThanOrEqual(1)

    const playLinks = screen.getAllByRole('link', { name: /Google Play/i })
    expect(playLinks.length).toBeGreaterThanOrEqual(2)
    expect(playLinks[0].getAttribute('href')).toContain('com.dsc.qrscanner')
    expect(playLinks[1].getAttribute('href')).toContain('com.dsc.mindmatrix')

    // Ensure Calculator is completely absent
    expect(screen.queryByText(/DSC WEB CALCULATOR/i)).toBeNull()
    expect(screen.queryByText(/Calculator Tool/i)).toBeNull()
  })

  it('HomePage and AboutPage present DSC as an Android App & Game Development studio led by Naveed Mushtaq — Founder ', () => {
    const { unmount } = render(
      <MemoryRouter>
        <HomePage systemStatus={{ isMaintenanceMode: false }} />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/Digital Experiences/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Android App Development/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Game Development/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Custom Website Development/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /Explore Our Apps & Games/i })).toBeTruthy()
    expect(screen.queryByText(/Calculator/i)).toBeNull()
    unmount()

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/Naveed Mushtaq — Founder/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Android Application Development/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/User-Centered Development/i)).toBeTruthy()
  })

  it('DownloadsPage showcases QR Scanner, Mind Matrix, and Free Panel without Calculator', () => {
    render(
      <MemoryRouter>
        <DownloadsPage systemStatus={{}} />
      </MemoryRouter>
    )

    expect(screen.getByText(/QR Scanner \| Generator/i)).toBeTruthy()
    expect(screen.getByText(/Mind Matrix/i)).toBeTruthy()
    expect(screen.getByText(/Free Panel Build/i)).toBeTruthy()
    expect(screen.queryByText(/Calculator/i)).toBeNull()
  })

  it('ProductsPage renders all preserved product catalogue entries, category filters, and setup guides', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /All Products/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Free Tier/i })).toBeTruthy()
    expect(screen.getByText(/FREE-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/STREAMER-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/SPECIAL-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/SNIPER-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/AIM-ASSIST-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/PREMIUM-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/CUSTOMISED-PANEL/i)).toBeTruthy()
    expect(screen.getByText(/How Licensing & Order Delivery Works/i)).toBeTruthy()
  })

  it('PrivacyPolicyPage includes Google AdSense disclosures and Founder & Lead Developer attribution', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Cookies, Local Storage & Advertising Disclosures/i)).toBeTruthy()
    expect(screen.getByText(/Third-Party Advertising: Third-party vendors, including Google/i)).toBeTruthy()
    expect(screen.getByText(/Personalized Ad Opt-Out/i)).toBeTruthy()
    expect(screen.getAllByText(/Founder & Lead Developer/i).length).toBeGreaterThanOrEqual(1)
  })

  it('TermsPage renders full licensing and platform rules', () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Software Licensing & Single-User Restrictions/i)).toBeTruthy()
    expect(screen.getByText(/Payment Verification & Delivery Policy/i)).toBeTruthy()
    expect(screen.getByText(/Free Panel Fair Use Policy/i)).toBeTruthy()
  })

  it('ContactPage includes Website Design & Development inquiry option and prepares structured inquiry', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Official Email/i)).toBeTruthy()
    expect(screen.getByText(/darkskullcorporation@gmail.com/i)).toBeTruthy()
    expect(screen.getByText(/Discord Server/i)).toBeTruthy()
    expect(screen.getByRole('option', { name: /Website Design & Development/i })).toBeTruthy()

    const submitBtn = screen.getByRole('button', { name: /Submit Inquiry Details/i })
    expect(submitBtn).toBeTruthy()
  })
})
