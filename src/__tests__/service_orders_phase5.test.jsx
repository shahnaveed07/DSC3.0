import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  ORDER_LIFECYCLE_STATUSES,
  applyCustomerQuotationAction,
  buildServiceOrderUrl,
  clearServiceOrderDraft,
  createServiceOrderRecord,
  loadServiceOrderDraft,
  loadUserServiceOrders,
  normalizeQuotationObject,
  saveUserServiceOrder,
  validateServiceOrderInput,
} from '../utils/serviceOrders'
import { ServiceOrderRequestPage } from '../pages/ServiceOrderRequestPage'
import { UserDashboardPage } from '../pages/UserDashboardPage'

describe('Phase 5: Service Order & Quotation Workflow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  describe('Pure Logic: Validation, Quotation Normalization & Lifecycle Actions', () => {
    it('exports all required order lifecycle statuses', () => {
      expect(ORDER_LIFECYCLE_STATUSES).toEqual([
        'Submitted',
        'Under Review',
        'Quotation Sent',
        'Awaiting Customer Approval',
        'Approved',
        'In Progress',
        'Testing / Review',
        'Completed',
        'Cancelled / Rejected',
      ])
    })

    it('builds prefilled service order URLs accurately', () => {
      const url = buildServiceOrderUrl({
        serviceSlug: 'game-development',
        scopeId: 'mobile-puzzle-arcade',
        deploymentOption: 'without-deployment',
      })
      expect(url).toBe(
        '/services/request?service=game-development&scope=mobile-puzzle-arcade&deployment=without-deployment',
      )
    })

    it('validates required service order fields and rejects incomplete submissions', () => {
      const invalid = validateServiceOrderInput({
        serviceSlug: 'websites',
        scopeId: 'business-corporate',
        deploymentOption: 'with-deployment',
        targetPlatform: 'Responsive Web (Desktop, Tablet & Mobile)',
        projectTitle: 'Hi',
        projectDescription: 'Too short',
        keyFeatures: 'Shrt',
        contactName: 'A',
        contactEmail: 'invalid-email',
      })

      expect(invalid.isValid).toBe(false)
      expect(invalid.errors.projectTitle).toBeTruthy()
      expect(invalid.errors.projectDescription).toBeTruthy()
      expect(invalid.errors.keyFeatures).toBeTruthy()
      expect(invalid.errors.contactName).toBeTruthy()
      expect(invalid.errors.contactEmail).toBeTruthy()

      const valid = validateServiceOrderInput({
        serviceSlug: 'android-applications',
        scopeId: 'android-utility-tool',
        deploymentOption: 'with-deployment',
        targetPlatform: 'Android Smartphones (Android 8.0+)',
        projectTitle: 'DSC Field Scanner Pro',
        projectDescription:
          'Offline barcode and inventory scanner for warehouse staff on Android devices.',
        keyFeatures: 'Offline SQLite storage, CSV export, multi-format barcode scanning.',
        referenceLinks: 'https://play.google.com/store/apps/details?id=com.dsc.qrscanner',
        preferredTimeline: '4 weeks',
        budgetExpectations: 'Custom studio evaluation requested',
        contactName: 'Naveed Test Client',
        contactEmail: 'client@example.com',
        contactHandle: 'naveed#0001',
      })

      expect(valid.isValid).toBe(true)
      expect(valid.cleaned.serviceType).toBe('Android Application Development')
      expect(valid.cleaned.deploymentPreference).toBe('With Deployment')
      expect(valid.cleaned.scopeTemplate).toBe(
        'Standalone Utility or Offline-First App Scope',
      )
    })

    it('never invents fake quotation prices before admin review', () => {
      const cleaned = validateServiceOrderInput({
        serviceSlug: 'websites',
        scopeId: 'custom-webapp',
        deploymentOption: 'without-deployment',
        targetPlatform: 'Single-Page Web Application (SPA / Portal)',
        projectTitle: 'Internal Operations Portal',
        projectDescription: 'Role-based internal operations web portal with audit logging.',
        keyFeatures: 'Authentication, role matrix, exportable reports.',
        contactName: 'Alex Rivera',
        contactEmail: 'alex@example.com',
      }).cleaned

      const record = createServiceOrderRecord(cleaned, {
        username: 'ALEXR',
        role: 'User',
      })

      expect(record.status).toBe('Submitted')
      expect(record.quotationStatus).toBe('Pending Scope Review')
      expect(record.quotation.hasIssuedQuotation).toBe(false)
      expect(record.quotation.quotedAmount).toBeNull()
      expect(record.quotation.deploymentPreference).toBe('Without Deployment')
    })

    it('applies customer quotation responses (approve, request_changes, decline) accurately', () => {
      const baseOrder = {
        id: 'ORD-SVC-TEST01',
        reference: 'ORD-SVC-TEST01',
        status: 'Quotation Sent',
        quotationStatus: 'Quotation Sent',
        quotation: normalizeQuotationObject(
          {
            summary: 'Custom website quotation prepared by DSC.',
            proposedScope: '5 responsive pages + CMS integration',
            quotedAmount: '450',
            currency: 'USD',
            estimatedTimeline: '3 weeks',
            deploymentPreference: 'With Deployment',
            adminNotes: 'Includes production domain and SSL setup.',
            customerResponseStatus: 'Awaiting Customer Approval',
          },
          'With Deployment',
          'Business & Corporate Website',
        ),
      }

      const approved = applyCustomerQuotationAction(
        baseOrder,
        'approve',
        'Proceed with this scope.',
      )
      expect(approved.status).toBe('Approved')
      expect(approved.quotationStatus).toBe('Quotation Approved by Client')
      expect(approved.quotation.customerResponseStatus).toBe('Approved by Client')

      const revisionRequested = applyCustomerQuotationAction(
        baseOrder,
        'request_changes',
        'Can we also include an analytics export tab?',
      )
      expect(revisionRequested.status).toBe('Under Review')
      expect(revisionRequested.quotationStatus).toBe('Changes / Clarification Requested')
      expect(revisionRequested.quotation.customerResponseStatus).toBe('Changes Requested')
      expect(revisionRequested.quotation.customerNotes).toContain('analytics export tab')

      const declined = applyCustomerQuotationAction(
        baseOrder,
        'decline',
        'Project postponed internally.',
      )
      expect(declined.status).toBe('Cancelled / Rejected')
      expect(declined.quotationStatus).toBe('Cancelled / Declined by Client')
      expect(declined.quotation.customerResponseStatus).toBe('Declined by Client')
    })
  })

  describe('ServiceOrderRequestPage: Guest Auth Gate & Authenticated Submission', () => {
    it('prompts unauthenticated visitors to log in or register while saving their draft', () => {
      clearServiceOrderDraft()

      render(
        <MemoryRouter initialEntries={['/services/request?service=game-development&deployment=without-deployment']}>
          <ServiceOrderRequestPage session={null} />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('service-order-auth-banner')).toBeTruthy()
      expect(screen.getByTestId('summary-service-title').textContent).toBe(
        'Game Development',
      )
      expect(screen.getByTestId('summary-deployment-label').textContent).toBe(
        'Without Deployment',
      )

      fireEvent.change(screen.getByLabelText(/PROJECT TITLE/i), {
        target: { value: 'Orbital Logic Puzzle' },
      })

      fireEvent.click(screen.getByTestId('submit-service-order-btn'))

      expect(
        screen.getByText(/A DSC client account is required to submit a service order/i),
      ).toBeTruthy()

      const savedDraft = loadServiceOrderDraft()
      expect(savedDraft.projectTitle).toBe('Orbital Logic Puzzle')
      expect(savedDraft.serviceSlug).toBe('game-development')
      expect(savedDraft.deploymentOption).toBe('without-deployment')
    })

    it('submits a complete service order for an authenticated DSC user and persists it to their account', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ message: 'Endpoint not mounted' }),
      })

      const session = {
        token: 'user-jwt-token',
        role: 'User',
        username: 'STUDIOUSER',
        fullName: 'Studio User',
        email: 'studiouser@example.com',
      }

      render(
        <MemoryRouter initialEntries={['/services/request?service=websites&scope=business-corporate&deployment=with-deployment']}>
          <ServiceOrderRequestPage session={session} />
        </MemoryRouter>,
      )

      fireEvent.change(screen.getByLabelText(/PROJECT TITLE/i), {
        target: { value: 'Apex Logistics Corporate Website' },
      })
      fireEvent.change(screen.getByLabelText(/PROJECT DESCRIPTION/i), {
        target: {
          value:
            'A multi-page responsive corporate website showcasing freight routes and client inquiry forms.',
        },
      })
      fireEvent.change(screen.getByLabelText(/KEY FEATURES NEEDED/i), {
        target: {
          value:
            'Landing page, services matrix, route coverage showcase, SEO metadata, and contact form.',
        },
      })
      fireEvent.change(screen.getByLabelText(/PREFERRED TIMELINE/i), {
        target: { value: '3 weeks' },
      })

      fireEvent.click(screen.getByTestId('submit-service-order-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('service-order-confirmation')).toBeTruthy()
      })

      expect(screen.getByTestId('confirmed-order-reference').textContent).toMatch(
        /^ORD-SVC-/,
      )
      expect(screen.getByTestId('confirmed-order-status').textContent).toContain(
        'Submitted (Pending Scope Review)',
      )

      const storedOrders = loadUserServiceOrders('STUDIOUSER')
      expect(storedOrders.length).toBe(1)
      expect(storedOrders[0].projectTitle).toBe('Apex Logistics Corporate Website')
      expect(storedOrders[0].deploymentPreference).toBe('With Deployment')
    })
  })

  describe('UserDashboardPage: Quotation Review & Customer Actions', () => {
    it('displays a studio quotation in My Orders and allows the customer to approve or request changes', async () => {
      const session = {
        token: 'user-jwt-token',
        role: 'User',
        username: 'QUOTECUSTOMER',
        email: 'customer@example.com',
      }

      // Seed a service order with an active quotation awaiting customer approval
      saveUserServiceOrder('QUOTECUSTOMER', {
        id: 'ORD-SVC-QUOTE99',
        reference: 'ORD-SVC-QUOTE99',
        title: 'Custom Android Companion App',
        projectTitle: 'Custom Android Companion App',
        serviceType: 'Android Application Development',
        category: 'Android Application Development',
        scopeTemplate: 'Business & Service Companion App',
        targetPlatform: 'Android Phones & Tablets',
        deploymentPreference: 'With Deployment',
        projectDescription: 'Customer companion Android application with push alerts.',
        keyFeatures: 'Account login, order notifications, offline cache.',
        status: 'Quotation Sent',
        quotationStatus: 'Awaiting Customer Approval',
        submittedAt: '2026-04-10T10:00:00.000Z',
        updatedAt: '2026-04-10T12:00:00.000Z',
        quotation: {
          hasIssuedQuotation: true,
          summary:
            'Full native Android application build with Google Play release packaging and deployment support.',
          proposedScope:
            'Authentication screens, dashboard feed, offline SQLite cache, and signed Play Store AAB release.',
          quotedAmount: '680',
          currency: 'USD',
          estimatedTimeline: '4–5 Weeks',
          deploymentPreference: 'With Deployment',
          adminNotes: 'Includes Play Console store listing setup and signing guidance.',
          customerResponseStatus: 'Awaiting Customer Approval',
          customerNotes: '',
          respondedAt: null,
        },
      })

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: 'NoOrder' }),
      })

      render(
        <MemoryRouter initialEntries={['/pages/udash?tab=orders&order=ORD-SVC-QUOTE99']}>
          <UserDashboardPage
            onLogout={vi.fn()}
            onSessionInvalid={vi.fn()}
            onSessionUpdate={vi.fn()}
            session={session}
          />
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('order-quotation-section')).toBeTruthy()
      })

      expect(screen.getByTestId('quotation-amount').textContent).toBe('USD 680')
      expect(screen.getByTestId('quotation-deployment').textContent).toBe(
        'With Deployment',
      )
      expect(screen.getByTestId('quotation-summary-text').textContent).toContain(
        'Full native Android application build',
      )

      // Test Request Changes validation (requires notes)
      fireEvent.click(screen.getByTestId('request-changes-quotation-btn'))
      await waitFor(() => {
        expect(
          screen.getByText(/Please provide notes describing the requested scope or quotation changes/i),
        ).toBeTruthy()
      })

      // Test Approve Quotation action
      fireEvent.click(screen.getByTestId('approve-quotation-btn'))

      await waitFor(() => {
        expect(
          screen.getByTestId('quotation-customer-response-status').textContent,
        ).toBe('Approved by Client')
      })

      const updatedOrders = loadUserServiceOrders('QUOTECUSTOMER')
      expect(updatedOrders[0].status).toBe('Approved')
      expect(updatedOrders[0].quotationStatus).toBe('Quotation Approved by Client')
    })
  })
})
