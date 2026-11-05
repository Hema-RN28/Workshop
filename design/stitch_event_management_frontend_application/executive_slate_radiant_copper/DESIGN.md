---
name: Executive Slate & Radiant Copper
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad8ec'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecff'
  surface-container-high: '#e9e6fa'
  surface-container-highest: '#e3e0f4'
  on-surface: '#1a1a28'
  on-surface-variant: '#494553'
  inverse-surface: '#2f2f3e'
  inverse-on-surface: '#f2efff'
  outline: '#7a7585'
  outline-variant: '#cac4d5'
  surface-tint: '#6646c5'
  primary: '#3f139d'
  on-primary: '#ffffff'
  primary-container: '#5634b4'
  on-primary-container: '#c7b6ff'
  inverse-primary: '#cdbdff'
  secondary: '#9c4500'
  on-secondary: '#ffffff'
  secondary-container: '#ff7f2a'
  on-secondary-container: '#622800'
  tertiary: '#00402a'
  on-tertiary: '#ffffff'
  tertiary-container: '#005a3c'
  on-tertiary-container: '#46d89d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#4e2aac'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#773300'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fcf8ff'
  on-background: '#1a1a28'
  surface-variant: '#e3e0f4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-metric:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an enterprise-grade visual framework tailored for end-to-end event lifecycle management, registration infrastructures, attendee analytics, and credential operations. The audience comprises event marketing executives, operational directors, and institutional coordinators who require density, clarity, and rock-solid transactional trust.

The design movement is **Structured Corporate Modernism**: clean structural boundaries, purposeful whitespace, balanced hierarchy, and disciplined visual discipline reminiscent of premier financial and operational utilities like Stripe and Linear. 

### Visual Tenets
- **Precision over Decoration:** Interfaces must project administrative efficiency. Eliminate arbitrary glows, floating gradients, loud background blurs, and skeuomorphic ornaments.
- **Architectural Utility:** Hierarchy is created via crisp 1px borders, subtle tone steps, precise tabular data presentation, and deliberate typographic weighting.
- **Action Decisiveness:** Deep Purple serves as the stable anchor for structure and primary commitments, while Vibrant Orange is leveraged sparingly and decisively for critical callouts, key conversions, or transactional milestones.

## Colors

The system employs a tightly controlled light-first palette designed to minimize eye fatigue across high-density registration views and capacity dashboards.

### Palette Architecture
- **Primary (`#5634B4`):** Anchors operational interactions, navigation states, selected table rows, active states, and primary executive actions.
- **Secondary (`#F47721`):** High-priority operational triggers, registration capacity alerts, primary callouts, and conversion pathways. Used sparingly to avoid diminishing visual authority.
- **Surface & Canvas:**
  - Base Canvas Background: `#F8F8FC` provides a calm, cool-tinted backdrop separating structural surfaces.
  - Surface Containers: `#FFFFFF` defines data cards, floating panels, form sheets, and table headers.
- **Text & Hierarchy:**
  - Main Text (`#171725`): Deep neutral ensuring high legibility for metrics, headings, and data values.
  - Secondary Text (`#777789`): Calibrated for metadata, column headers, helper labels, and secondary stats.
- **Structural Outlines:**
  - Border Base (`#E8E7EF`): Consistent 1px boundary across cards, data cells, input fields, and dividers.
- **Functional Semantics:**
  - Success (`#10B981`): Confirmed ticket sales, operational capacity health, checked-in badges.
  - Warning (`#F59E0B`): Pending credentials, ticket inventory thresholds (<15%), incomplete attendee profiles.
  - Error (`#EF4444`): Failed transactions, overbooked sessions, payment rejections.

## Typography

The type system blends structural authority with high-speed scannability. **Plus Jakarta Sans** delivers crisp, executive clarity in display settings, while **Inter** powers data tables, operational forms, and registration sheets.

### Typographic Behavior
- **Tabular Figures (`tnum`):** All numerical representations—capacity counters, badge numbers, ticket revenues, check-in percentages, and time formats—must mandate `font-variant-numeric: tabular-nums` or `font-feature-settings: "tnum"`.
- **Vertical Density:** Line heights are maintained strictly within 1.25x to 1.5x ratios to prevent tall cards and excessive empty bands in complex admin views.
- **Letter Spacing:** Tighter letter spacing on headlines (`-0.01em` to `-0.02em`) preserves typographic cohesion across larger viewport headers.

## Layout & Spacing

The layout model uses a systematic fluid-grid structure optimized for screen real estate density without perceptual overcrowding.

### Grid & Breakpoints
- **Desktop (1200px+):** 12-column layout, `1.5rem` gutters, `2rem` outer margins. Max content container caps at `1440px` for ultra-wide monitors to maintain line-length integrity.
- **Tablet (768px – 1199px):** 8-column layout, `1rem` gutters, `1.5rem` margins. Side panels collapse into off-canvas drawers.
- **Mobile (Below 768px):** 4-column layout, `1rem` gutters, `1rem` margins. High-density data tables transform into modular, single-column card stacks.

### Spacing Principles
- **Base Grid:** Strictly aligned to a 4px/8px rhythm. Component internal vertical padding uses `0.5rem` (`space-sm`) or `0.75rem`, while structural panel padding uses `1.5rem` (`space-lg`).
- **Dense Data Zones:** Table rows and compact input layouts use `0.25rem` (`space-xs`) or `0.5rem` (`space-sm`) vertical gaps to allow 15+ data rows within standard vertical viewports.

## Elevation & Depth

Depth is established primarily through **structural delineation and low-contrast borders**, supplemented by minimal, highly controlled elevation tiers. The interface avoids diffused colorful blurs and deep drops.

### Elevation Hierarchy
- **Level 0 (Flat / Canvas):** Applied to the base background (`#F8F8FC`). Separated from surfaces via direct visual tone difference.
- **Level 1 (Card / Table Surface):** Background `#FFFFFF` with a crisp `1px solid #E8E7EF` border and subtle ambient shadow: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)`.
- **Level 2 (Popovers / Dropdowns / Datepickers):** Floating contextual controls use `1px solid #E8E7EF` alongside `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modals / Slide-Over Sheets):** Heavy focus overlays use `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)` over a restrained neutral backdrop mask (`#171725` at 40% opacity).

## Shapes

The design system adopts a **disciplined, soft geometry (Level 1)**. Overly rounded or pill-shaped cards compromise enterprise credibility and reduce usable interior rectangular area for dense data tables and form grids.

### Radius Assignments
- **Core Elements (Inputs, Buttons, Badges, Table Rows):** Fixed at `4px` (`0.25rem`). Ensures crisp structural boundaries and predictable alignment.
- **Containers (Cards, Modals, Flyout Panels):** Set to `8px` (`0.5rem`). Softens major visual boundaries without producing whimsical bubble silhouettes.
- **Pills / Status Dots:** Strict exception reserved exclusively for operational counter indicators and circular avatars (`9999px`).

## Components

### Buttons
- **Primary:** Background `#5634B4`, text `#FFFFFF`, border `transparent`, border-radius `4px`. Hover state: darken by 6% (`#4A2C9D`). Active state: scale `0.99`.
- **Secondary / Conversion:** Background `#F47721`, text `#FFFFFF`, border `transparent`, border-radius `4px`. Reserved for high-value conversions (e.g., "Publish Event", "Export Manifest"). Hover state: `#DE6818`.
- **Tertiary / Outline:** Background `#FFFFFF`, text `#171725`, border `1px solid #E8E7EF`. Hover: background `#F8F8FC`, border `#D8D7E2`.
- **Ghost:** Background `transparent`, text `#777789`. Hover: background `#F8F8FC`, text `#171725`.
- **Sizing:** Compact (32px height, 12px padding-x, 13px label), Default (38px height, 16px padding-x, 14px label).

### Input Fields & Controls
- **Text Inputs & Dropdowns:** Height 38px, background `#FFFFFF`, border `1px solid #E8E7EF`, border-radius `4px`, padding `0 12px`, text `#171725`. 
  - Placeholder: `#777789`.
  - Focus state: border-color `#5634B4`, outline `2px solid rgba(86, 52, 180, 0.12)`, transition `border-color 150ms ease`.
  - Error state: border-color `#EF4444`, outline `2px solid rgba(239, 68, 68, 0.12)`.
- **Checkboxes & Radios:** 16px x 16px square (checkbox: radius 3px; radio: radius 50%). Border `1px solid #E8E7EF`. Checked state: background `#5634B4` with white icon vector.

### Data Tables & Lists
- **Structure:** Zero vertical borders between cells; horizontal divider `1px solid #E8E7EF`. 
- **Headers:** Background `#F8F8FC`, font size `12px`, font weight `500`, uppercase tracking `0.04em`, text `#777789`, padding `10px 16px`.
- **Rows:** Background `#FFFFFF`, padding `12px 16px`. Hover state: background `rgba(86, 52, 180, 0.02)`. Selected state: background `rgba(86, 52, 180, 0.05)`.
- **Numbers:** Tabular font spacing applied directly to attendee seats, badge IDs, price tags, and timestamps.

### Status Badges & Chips
- **Geometry:** Height 22px, border-radius `4px`, padding `2px 8px`, typography `label-sm`.
- **Confirmed / Active:** Background `rgba(16, 185, 129, 0.10)`, text `#0D9468`, border `1px solid rgba(16, 185, 129, 0.20)`.
- **Pending / Capacity Warning:** Background `rgba(245, 158, 11, 0.10)`, text `#B45309`, border `1px solid rgba(245, 158, 11, 0.20)`.
- **Cancelled / Sold Out:** Background `rgba(239, 68, 68, 0.08)`, text `#DC2626`, border `1px solid rgba(239, 68, 68, 0.18)`.
- **Draft / Inactive:** Background `#F8F8FC`, text `#777789`, border `1px solid #E8E7EF`.

### Cards & Panels
- **Structure:** Background `#FFFFFF`, border `1px solid #E8E7EF`, border-radius `8px`, shadow `0 1px 3px rgba(0,0,0,0.04)`.
- **Header:** Padding `16px 20px`, border-bottom `1px solid #E8E7EF`. Actions aligned to the right via inline-flex clusters.
- **Body:** Padding `20px`.

### Specialized Domain Components
- **Capacity Progress Gauge:** 6px track height, background `#E8E7EF`, border-radius `3px`. Fill bar: `#5634B4` for standard loads, switching to `#F47721` when capacity exceeds 85%, and `#EF4444` at 100%.
- **Live Ticket Tier Matrix:** Card split with high-contrast badge, pricing header (`data-metric`), capacity tabular ratio, and direct inline increment stepper.