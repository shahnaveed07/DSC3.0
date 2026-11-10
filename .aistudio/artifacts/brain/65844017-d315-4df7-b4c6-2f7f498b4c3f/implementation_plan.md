# DSCWeb — Complete Professional Theme Redesign (Slate, White & Blue System)

This plan replaces the legacy Black & Gold visual palette across the DSCWeb React application (`https://dscweb.me/`) with a restrained, high-trust corporate **Slate, White & Blue** design system tailored for an independent software development studio, while preserving 100% of existing product catalogue, authentication, dashboard, checkout, and SEO prerendering functionality.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and theme initialization decisions incorporate your Phase 1 confirmations:

- **Confirmed Decision 1 — Default to Light Mode (`#F8FAFC`) for New Visitors**: New visitors without a stored preference will initially receive the clean **Light Mode (`#F8FAFC` background / `#FFFFFF` cards / `#0F172A` slate typography / `#2563EB` blue primary accents)**. The pre-render theme script and header toggle will continue using the `dscThemePreferenceV2` storage key so explicit user theme switches between Light and Dark Mode (`#0B1220` deep slate) persist across reloads with zero flash.
- **Confirmed Decision 2 — Category Tags Styled in Primary Blue Accent**: Non-status category and portfolio tags (`Primary Focus`, `Available on Request`, `ANDROID APPLICATION`, `MOBILE LOGIC GAME`, product category chips, and studio badges) will use the **Primary Blue Accent** (`--primary` / `--primary-soft` / `--primary-border`), while semantic green (`good`), muted amber (`warning`), and red (`danger`) remain strictly reserved for genuine functional status indicators (such as order review status, slot capacity alerts, and form validation).

---

## 1. Overview & Core Concept

- **What It Does**: Establishes a centralized CSS custom property architecture in both Dark (`:root`) and Light (`:root[data-theme="light"]`) modes built on Slate neutrals (`#0B1220`–`#F8FAFC`) and Engineering Blue (`#2563EB`–`#1E3A8A`), removing all legacy metallic gold (`#D4AF37`, `#F5D76E`, `#B8860B`), cream (`#FAF8F2`, `#E2DEC9`), and pure pitch-black (`#050505`) styling.
- **Target Audience / Persona**: Clients, businesses, and users visiting Dark Skull Corporation to explore Android applications, mobile games, custom website development services, or licensed software products.
- **Key Value**: Communicates technical credibility, modern software engineering rigor, and WCAG 2.1 AA contrast compliance across all 20 routes without altering any business logic, API contracts, or SEO metadata.

---

## 2. User Experience & Visual Design

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Restrained corporate software studio — crisp 1px structural borders, balanced whitespace, subtle elevation, and zero neon, gold, or heavy gradient distractions.
  - *Color Palette & Mood*:
    - **Light Mode (Initial Default — `data-theme="light"`)**:
      - Canvas & Surfaces: Main background `#F8FAFC`, secondary/footer `#F1F5F9`, header/cards/elevated surfaces `#FFFFFF`, hover surface `#F8FAFC`.
      - Borders: Standard `#E2E8F0`, strong `#CBD5E1`, card hover `#94A3B8`.
      - Typography: Primary `#0F172A`, secondary/soft `#475569`, muted `#64748B`, disabled `#94A3B8`.
      - Primary & Links: Primary `#2563EB`, hover `#1D4ED8`, strong `#1E40AF`, active `#1E3A8A`, button text `#FFFFFF`, links `#2563EB`, eyebrows `#475569`.
    - **Dark Mode (`data-theme="dark"`)**:
      - Canvas & Surfaces: Main background `#0B1220`, secondary/cards/inputs `#111827`, header/footer `#0F172A`, strong/hover surface `#1E293B`, elevated surface `#1F2937`.
      - Borders: Standard `#334155`, strong `#475569`, card hover `#64748B`.
      - Typography: Primary `#F8FAFC`, secondary/soft `#CBD5E1`, muted `#94A3B8`, disabled `#64748B`.
      - Primary & Links: Primary `#2563EB`, hover `#1D4ED8`, strong `#1E40AF`, active `#1E3A8A`, button text `#FFFFFF`, links `#60A5FA`, eyebrows `#94A3B8`.
    - **Semantic Status Tokens**:
      - Success (Restrained Green): `#16A34A` (Light) / `#22C55E` (Dark) with subtle tinted backgrounds and borders.
      - Warning (Muted Amber): `#D97706` (Light) / `#F59E0B` (Dark) reserved strictly for real operational warnings.
      - Danger (Standard Red): `#DC2626` (Light) / `#EF4444` (Dark) for errors and destructive actions.
      - Information (Professional Blue): `#2563EB` / `#60A5FA` with subtle blue tint (`rgba(37, 99, 235, 0.10)`).
  - *Component Styling & Layout*:
    - **Buttons**: Primary buttons use `#2563EB` background with `#FFFFFF` text (`#1D4ED8` hover, `#1E3A8A` active); secondary buttons use neutral surface (`--surface`) with `--border-strong` border and `--text` label; destructive buttons use `--danger` with `#FFFFFF` text.
    - **Cards, Tables & Modals**: Clean flat surfaces (`--card-bg`) with 1px `--card-border`, subtle shadow tokens, neutral table headers (`--bg-soft`), and accessible focus rings (`--ring: 0 0 0 2px rgba(37, 99, 235, 0.35)`).

---

## 3. Key Product & Engineering Decisions

- **Decision 1 — Flash-Free Light Mode Default & `theme-color` Synchronization**:
  - *Chosen Approach*: Configure root `<html lang="en" data-theme="light" style="color-scheme: light;">` and `<meta name="theme-color" content="#F8FAFC" />` in the base HTML template, update the inline bootstrap script and header theme resolver to default to `'light'` when `dscThemePreferenceV2` is unset, and dynamically sync `<meta name="theme-color">` between `#F8FAFC` (light) and `#0B1220` (dark).
  - *Why*: Eliminates initial theme flashing for new visitors while preserving instant persistence when a user toggles between Light and Dark modes.
- **Decision 2 — Complete Fallback & Legacy Token Eradication**:
  - *Chosen Approach*: Replace all hardcoded CSS fallback values (e.g., `var(--button-primary-bg, #D4AF37)`, `var(--primary-text, #080808)`, `#51421D`, `#C8B273`, `#FAF8F2`) and remap legacy alias variables (`--elite-bg`, `--elite-border`, `--elite-text-gold`, `--gold-border-subtle`) to the new Slate & Blue token hierarchy while keeping QR code containers white where technically required for camera scanning.
  - *Why*: Ensures no component, modal, tooltip, or featured product card can ever fall back to gold, cream, or olive colors.

---

## 4. Technical Architecture & Theme Token Strategy *(Technical Reference)*

### Theme Architecture & Component Consumption Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                 Centralized CSS Variable System (Slate & Blue)            │
│  • :root (Dark Slate #0B1220 / #111827 / #0F172A + Blue #2563EB)          │
│  • :root[data-theme="light"] (Light Slate #F8FAFC / #FFFFFF + #2563EB)    │
│  • Semantic Status Tokens (Success Green, Warning Amber, Danger Red)      │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
                    ▼ (Pre-Render Bootstrap)            ▼ (Runtime Toggle)
┌───────────────────────────────────────┐ ┌─────────────────────────────────┐
│     HTML Entry & Prerender Shells     │ │     SiteHeader Theme Controller │
│  • Default: data-theme="light"        │ │  • Reads dscThemePreferenceV2   │
│  • Reads dscThemePreferenceV2         │ │  • Toggles Light <-> Dark       │
│  • Sets meta[name="theme-color"]      │ │  • Updates data-theme,          │
│    (#F8FAFC light / #0B1220 dark)     │ │    colorScheme & theme-color    │
└───────────────────┬───────────────────┘ └─────────────────┬───────────────┘
                    │                                       │
                    ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  Unified Component & Page Surface Layer                   │
│  • Buttons (.button-primary #2563EB + #FFF, .button-secondary neutral)    │
│  • Category Badges (Primary Blue Accent) vs Status Badges (Semantic)      │
│  • Cards, Forms, Tables, Modals, Toasts, Tooltips & Skeletons             │
│  • All 20 Public, Auth, Checkout, Client Dashboard & Admin Workspace Views│
└───────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **Theme Toggle & Persistence**:
  - Initial state resolves from `localStorage.getItem('dscThemePreferenceV2')`, defaulting to `'light'` when unset.
  - Clicking the header theme toggle switches `'light'` ↔ `'dark'`, writes to `dscThemePreferenceV2`, updates `document.documentElement.setAttribute('data-theme', nextTheme)`, `document.documentElement.style.colorScheme = nextTheme`, and sets `<meta name="theme-color">` to `#F8FAFC` (light) or `#0B1220` (dark).
- **Category Badge vs. Semantic Status Badge Separation**:
  - Category labels across public pages (`AboutPage`, `AppsPage`, `ProductsPage`, `DownloadsPage`, `ContactPage`) use primary blue accent badge classes, while operational status indicators (`FreePanelPage` slot full warnings, `UserDashboardPage` pending/expired alerts, `AdminDashboardPage` order status pills) retain semantic green, amber, and red tokens.
