import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  DEPLOYMENT_OPTIONS,
  QUOTATION_MODEL_STATEMENT,
  buildServiceInquiryUrl,
  getAllServices,
  getDeploymentOptionById,
  getScopeTemplateById,
  getServiceBlueprint,
  resolveServicePrefill,
  serviceBlueprints,
  studioServiceCategories,
} from '../content/servicesData'
import { ServicesOverviewPage } from '../pages/ServicesOverviewPage'
import { ServiceDetailPage } from '../pages/ServiceDetailPage'
import { ContactPage } from '../pages/ContactPage'

afterEach(() => {
  cleanup()
})

describe('Phase 3 — Services, Scope Templates, Deployment Options & Quotation Model', () => {
  describe('Pure Data & Helper Functions (servicesData.js)', () => {
    it('exports the exact required quotation model statement', () => {
      expect(QUOTATION_MODEL_STATEMENT).toBe(
        'Every project is evaluated according to its requirements. DSC will provide a custom quotation after reviewing the project scope.',
      )
    })

    it('provides all three required service categories and blueprints', () => {
      const services = getAllServices()
      expect(services).toHaveLength(3)
      expect(services.map((s) => s.slug)).toEqual([
        'websites',
        'android-applications',
        'game-development',
      ])

      for (const slug of ['websites', 'android-applications', 'game-development']) {
        const bp = getServiceBlueprint(slug)
        expect(bp).not.toBeNull()
        expect(bp.whatWeProvide.length).toBeGreaterThanOrEqual(5)
        expect(bp.scopeAreas.length).toBeGreaterThanOrEqual(3)
        expect(bp.deliverablesFramework.length).toBeGreaterThanOrEqual(4)
        expect(bp.developmentProcess).toHaveLength(4)
        expect(bp.technologies.length).toBeGreaterThanOrEqual(4)
        expect(bp.scopeTemplates.length).toBeGreaterThanOrEqual(4)
        expect(bp.deploymentOptions['with-deployment']).toBeDefined()
        expect(bp.deploymentOptions['without-deployment']).toBeDefined()
      }
    })

    it('contains zero fixed public prices across all service definitions and scope templates', () => {
      const serialized = JSON.stringify({ studioServiceCategories, serviceBlueprints })
      expect(serialized).not.toMatch(/\$\d+/)
      expect(serialized).not.toMatch(/₹\s*\d+/)
    })

    it('resolves deployment options and scope templates safely with fallbacks', () => {
      expect(getDeploymentOptionById('with-deployment').label).toBe('With Deployment')
      expect(getDeploymentOptionById('without-deployment').label).toBe('Without Deployment')
      expect(getDeploymentOptionById('invalid').id).toBe('with-deployment')

      const webScope = getScopeTemplateById('websites', 'custom-webapp')
      expect(webScope.name).toContain('Custom Web Application')

      const fallbackScope = getScopeTemplateById('websites', 'non-existent')
      expect(fallbackScope.id).toBe('foundational-web')
      expect(getScopeTemplateById('unknown-service', 'any')).toBeNull()
    })

    it('builds inquiry URLs and resolves prefill data for ContactPage', () => {
      const url = buildServiceInquiryUrl({
        serviceSlug: 'game-development',
        scopeId: 'full-2d-3d-game',
        deploymentOption: 'without-deployment',
      })
      expect(url).toBe(
        '/contact?service=game-development&scope=full-2d-3d-game&deployment=without-deployment',
      )

      const prefill = resolveServicePrefill({
        serviceSlug: 'game-development',
        scopeId: 'full-2d-3d-game',
        deploymentOption: 'without-deployment',
      })
      expect(prefill).not.toBeNull()
      expect(prefill.category).toBe('game')
      expect(prefill.serviceTitle).toBe('Game Development')
      expect(prefill.scopeName).toBe('Multi-Level 2D / 3D Game & Asset Integration Scope')
      expect(prefill.deploymentLabel).toBe('Without Deployment')
      expect(prefill.subject).toContain('Game Development (Without Deployment)')
      expect(prefill.message).toContain('Multi-Level 2D / 3D Game & Asset Integration Scope')
    })
  })

  describe('ServicesOverviewPage (/services)', () => {
    it('renders all three services, capabilities, deployment options, and quotation model statement', () => {
      render(
        <MemoryRouter initialEntries={['/services']}>
          <ServicesOverviewPage />
        </MemoryRouter>,
      )

      expect(
        screen.getByRole('heading', { level: 1, name: /Software Development Services/i }),
      ).toBeTruthy()
      expect(screen.getByTestId('quotation-model-statement').textContent).toContain(
        QUOTATION_MODEL_STATEMENT,
      )

      // Check service capabilities from Section 4A, 4B, 4C
      expect(screen.getByText('Business websites')).toBeTruthy()
      expect(screen.getByText('E-commerce websites')).toBeTruthy()
      expect(screen.getByText('Backend-integrated applications')).toBeTruthy()
      expect(screen.getByText('2D and 3D game development')).toBeTruthy()
      expect(screen.getByText('Character and environment integration')).toBeTruthy()

      // Check deployment options overview
      for (const opt of DEPLOYMENT_OPTIONS) {
        expect(screen.getByTestId(`overview-deployment-${opt.id}`)).toBeTruthy()
      }
    })
  })

  describe('ServiceDetailPage (/services/:slug)', () => {
    it('renders Website Development details and updates quotation CTA when scope and deployment options change', () => {
      render(
        <MemoryRouter initialEntries={['/services/websites']}>
          <ServiceDetailPage serviceSlug="websites" />
        </MemoryRouter>,
      )

      expect(
        screen.getByRole('heading', { level: 1, name: /^Website Development$/i }),
      ).toBeTruthy()
      expect(screen.getByTestId('service-quotation-statement').textContent).toContain(
        QUOTATION_MODEL_STATEMENT,
      )

      // Initial state: first scope template + With Deployment
      expect(screen.getByTestId('selected-scope-name').textContent).toContain(
        'Portfolio or Business Presence Scope',
      )
      expect(screen.getByTestId('selected-deployment-label').textContent).toContain(
        'With Deployment',
      )

      // Select Custom Web Application scope template
      const customWebAppCard = screen.getByTestId('scope-template-custom-webapp')
      const selectScopeBtn = customWebAppCard.querySelector('button')
      fireEvent.click(selectScopeBtn)

      expect(screen.getByTestId('selected-scope-name').textContent).toContain(
        'Custom Web Application or Redesign Scope',
      )

      // Select Without Deployment option
      const withoutDeployCard = screen.getByTestId('deployment-option-without-deployment')
      const selectDeployBtn = withoutDeployCard.querySelector('button')
      fireEvent.click(selectDeployBtn)

      expect(screen.getByTestId('selected-deployment-label').textContent).toContain(
        'Without Deployment',
      )

      const proceedCta = screen.getByTestId('proceed-quotation-cta')
      expect(proceedCta.getAttribute('href')).toBe(
        '/contact?service=websites&scope=custom-webapp&deployment=without-deployment',
      )
    })

    it('renders Android Application Development and Game Development pages accurately', () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/services/android-applications']}>
          <ServiceDetailPage serviceSlug="android-applications" />
        </MemoryRouter>,
      )
      expect(
        screen.getByRole('heading', { level: 1, name: /^Android Application Development$/i }),
      ).toBeTruthy()
      expect(screen.getByText('Backend-Integrated Applications')).toBeTruthy()
      unmount()

      render(
        <MemoryRouter initialEntries={['/services/game-development']}>
          <ServiceDetailPage serviceSlug="game-development" />
        </MemoryRouter>,
      )
      expect(
        screen.getByRole('heading', { level: 1, name: /^Game Development$/i }),
      ).toBeTruthy()
      expect(screen.getByText('2D and 3D Game Development')).toBeTruthy()
      expect(screen.getByText('Game Optimization and Delivery')).toBeTruthy()
    })
  })

  describe('ContactPage Query Parameter Integration (/contact?service=...)', () => {
    it('pre-populates inquiry category, subject, message, and summary banner from service query params', () => {
      render(
        <MemoryRouter
          initialEntries={[
            '/contact?service=android-applications&scope=business-or-connected-app&deployment=without-deployment',
          ]}
        >
          <Routes>
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('contact-service-prefill-banner')).toBeTruthy()
      expect(screen.getByLabelText(/INQUIRY CATEGORY/i).value).toBe('android')
      expect(screen.getByLabelText(/SUBJECT/i).value).toContain(
        'Android Application Development (Without Deployment)',
      )
      expect(screen.getByLabelText(/MESSAGE DETAILS/i).value).toContain(
        'Business or Backend-Integrated App Scope',
      )
    })
  })
})
