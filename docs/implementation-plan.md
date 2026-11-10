# DSCWeb Phase 1 Implementation Plan

Date: September 3, 2026

## Information architecture

- `/`
  - Overview, modernization message, featured products, roadmap
- `/pages/apps`
  - Current apps and future tooling
- `/pages/products`
  - Product catalog with checkout entry points
- `/pages/downloads`
  - Release center and free-panel archive visibility
- `/pages/about`
  - Company and architecture story
- `/pages/contact`
  - Contact channels
- `/pages/privacy-policy`
  - Policy content
- `/pages/ulogin`
  - User auth entry
- `/pages/udash`
  - User dashboard
- `/pages/change`
  - User password change
- `/pages/freepanel`
  - Public free-panel status
- `/pages/checkout`
  - Approval-based order submission
- `/pages/alogin`
  - Admin auth entry
- `/pages/adash`
  - Admin overview
- `/pages/ownerdb`, `/pages/generatekey`
  - Preserved route placeholders for the next admin migration step

## Frontend structure

- `src/components/layout`
  - Shared shell, header, footer
- `src/components/ui`
  - Reusable content and state blocks
- `src/content`
  - Centralized site copy and catalog metadata
- `src/hooks`
  - Generic remote-resource hook
- `src/services`
  - API client and endpoint adapters
- `src/utils`
  - Auth storage, JWT parsing, formatting helpers
- `src/pages`
  - Route-level React pages

## Runtime principles

- Keep API base URL centralized through `VITE_API_BASE_URL`
- Preserve legacy route shapes where possible, including `.html` aliases
- Block non-admin routes when maintenance mode is active
- Use role-based client guards for user and admin pages
- Prefer clear empty, loading, and failure states over hidden failures

## September 23, 2026 repair update

- Restored the shared header shape from stable DSCWeb:
  - Logo/brand
  - Current page label
  - Theme toggle
  - Login/session action
  - Menu dropdown with public navigation and Discord
- Added pre-render theme initialization in `index.html` to prevent saved light mode from briefly rendering as dark.
- Added React routes and `.html` redirects for:
  - `/pages/status`
  - `/pages/status.html`
  - `/pages/terms`
  - `/pages/terms.html`
  - `/pages/privacy-policy.html`
- Added React pages for stable `status.html` and `terms.html` content.
- Restored footer copyright and developer credit text.
- Copied stable `dsclogo.png` into `public/images/dsclogo.png` for the React header/status page.
- Verification:
  - `npm run build` passes.
  - `npm run lint` passes with warnings.
