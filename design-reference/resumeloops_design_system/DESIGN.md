---
name: ResumeLoops Design System
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#464555'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4f43e3'
  primary: '#3724cd'
  on-primary: '#ffffff'
  primary-container: '#5145e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c4c0ff'
  secondary: '#5e5d6d'
  on-secondary: '#ffffff'
  secondary-container: '#e3e0f4'
  on-secondary-container: '#646373'
  tertiary: '#4a4843'
  on-tertiary: '#ffffff'
  tertiary-container: '#62605a'
  on-tertiary-container: '#dfdbd4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3621cc'
  secondary-fixed: '#e3e0f4'
  secondary-fixed-dim: '#c7c4d8'
  on-secondary-fixed: '#1a1a28'
  on-secondary-fixed-variant: '#464555'
  tertiary-fixed: '#e6e2db'
  tertiary-fixed-dim: '#c9c6bf'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484741'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

ResumeLoops embodies editorial elegance for a premium SaaS experience, bridging the technical precision of Linear and Stripe with the refined, document-centric clarity of Notion. The design system creates an atmosphere of sophisticated calm, shifting away from generic software aesthetics toward a distinguished, publication-quality workspace. 

The aesthetic is anchored in Minimalism with subtle tactile refinement—relying on generous whitespace, immaculate typography, restrained indigo accents, and warm monochromatic surfaces. The emotional response is one of confidence, focus, and quiet authority.

## Colors

The color palette establishes an inviting, warm editorial workspace. The foundation rests on a warm ivory canvas (`#FAF9F6`), complemented by pure white structural surfaces (`#FFFFFF`). Text hierarchy is driven by rich near-black (`#171717`) for high-impact readability and muted stone gray (`#77756F`) for secondary annotations. 

Deep royal indigo (`#5145E5`) serves as the precise focal accent for interactive states and primary actions, supported by a soft lavender tint (`#EEEBFF`) for delicate highlights and active selections. All boundary lines utilize a subtle warm gray (`#E9E6E0`) to maintain architectural clarity without visual friction.

## Typography

Typography balances editorial grandness with crisp SaaS utility. Utilizing Inter across all roles, the system achieves harmony through rigorous tracking adjustments and generous line heights. Large headlines (`display-xl` down to `headline-lg`) feature tight letter-spacing for structural impact, while body and label styles prioritize supreme legibility at small viewports. 

Ensure that headlines larger than 32px automatically scale down using mobile variants on viewports under 768px to preserve spatial rhythm.

## Layout & Spacing

A 12-column fluid grid system governs the layout, prioritizing structured whitespace and contained content widths reminiscent of document editors. The outer canvas margin scales dynamically from 1rem on mobile to 2.5rem on desktop, framing the pure white surfaces against the warm ivory background. 

Gutters are fixed at 1.5rem to maintain consistent rhythm between columns. The component spacing scale (`space-xs` through `space-2xl`) enforces an 8pt baseline grid, ensuring predictable vertical pacing throughout documents, sidebars, and analytical views.

## Elevation & Depth

Visual hierarchy relies on a sophisticated hybrid of tonal surface layering and low-contrast outlines, rejecting heavy drop shadows in favor of editorial flatness. 

Depth is communicated through subtle boundary contrast using the warm border token (`#E9E6E0`) against pure white (`#FFFFFF`) containers resting on the warm ivory (`#FAF9F6`) canvas. When floating elements such as dropdown menus or command palettes appear, use extremely diffused, low-opacity ambient shadows tinted with the primary indigo hue for a weightless, premium elevation effect.

## Shapes

A restrained soft shape language (`roundedness` level 1) defines the UI. Base elements like buttons, inputs, and small containers utilize a tight 0.25rem radius. 

Larger containers, cards, and modals step up to `rounded-lg` (0.5rem) and `rounded-xl` (0.75rem). This restrained curvature preserves architectural discipline, preventing the interface from feeling overly casual while maintaining a modern, touch-friendly surface profile.

## Components

### Buttons
Primary buttons utilize the deep royal indigo (`#5145E5`) background with crisp white text, subtle 0.25rem rounding, and micro-elevation on hover. Secondary buttons feature a pure white surface with subtle warm gray borders (`#E9E6E0`) and rich near-black text (`#171717`). Ghost buttons strip away background fills entirely, relying on typography color shifts on hover.

### Chips & Badges
Compact status indicators and tags employ the soft lavender secondary accent (`#EEEBFF`) for active states, paired with primary indigo text. Neutral tags use the warm ivory background with stone gray text for subtle categorization.

### Lists & Navigation
Lists utilize generous vertical padding with subtle bottom borders (`#E9E6E0`) separating items. Navigation items feature soft hover states utilizing 5% opacity indigo backgrounds and smooth transitions.

### Checkboxes & Radio Buttons
Constructed with crisp 1px borders in subtle warm gray (`#E9E6E0`) and pure white inner surfaces. Checked states transition smoothly to solid primary indigo (`#5145E5`) with minimal white check icons.

### Input Fields
Inputs feature pure white backgrounds framed by subtle warm gray borders. Focus states elevate the border instantly to primary indigo with a subtle 2px ring glow using the soft lavender tint. Placeholder text strictly adheres to muted stone gray (`#77756F`).

### Cards
Resume and document preview cards rest on pure white surfaces enclosed by subtle warm gray borders, featuring internal content padding aligned to `space-lg`. Hover interactions apply a low-contrast border shift toward the primary indigo tone.

### Additional Components
- **Command Palette:** A centralized floating search and navigation modal featuring high-contrast typography and keyboard shortcut badges.
- **Document Toolbar:** A sticky floating header for resume editing actions, utilizing soft glassmorphic borders and crisp iconography.