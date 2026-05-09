# NZ Recipe Helper - Design System

## Design Philosophy
Warm, organic, NZ-inspired. Japanese cuisine meets New Zealand nature.
Clean and minimal with subtle decorative touches.

## Color Palette

### Primary
- `--color-sage`: #4A6741 (deep sage green - CTAs, headers, active states)
- `--color-sage-light`: #6B8F5E (lighter sage - hover states)
- `--color-sage-muted`: #8BAF7E (muted sage - icons, secondary elements)

### Background
- `--color-cream`: #F7F3EC (main background)
- `--color-cream-dark`: #EDE8DF (slightly darker for cards/sections)
- `--color-white`: #FFFFFF (card backgrounds)

### Accent
- `--color-terracotta`: #C4673A (warm accent - highlights, links)
- `--color-terracotta-light`: #E8956A (lighter terracotta)
- `--color-gold`: #D4A84B (badges, sale indicators)

### Text
- `--color-text-primary`: #2D2D2D (headings)
- `--color-text-secondary`: #5A5A5A (body text)
- `--color-text-muted`: #9A9A9A (captions, hints)

### Store Brand Colors (unchanged)
- PAK'nSAVE: #FFD100 bg, #1A1A1A text
- Countdown: #007A3D bg, #FFFFFF text
- New World: #E31837 bg, #FFFFFF text

### Status
- In stock: #2E7D32 (green)
- Out of stock: #C62828 (red)
- Sale: #E65100 (orange)

## Typography
- Headings: system sans-serif, bold (700)
- Body: system sans-serif, regular (400)
- App title on landing: 28px bold
- Section headings: 16px semibold
- Body text: 14px regular
- Captions: 12px regular

## Border Radius
- Cards: 16px (rounded-2xl)
- Buttons: 9999px (fully rounded / pill)
- Input fields: 16px
- Badges/chips: 9999px
- Thumbnails: 12px

## Shadows
- Cards: 0 1px 3px rgba(0,0,0,0.06)
- Elevated: 0 4px 12px rgba(0,0,0,0.08)
- None on most elements (flat, clean)

## Spacing
- Page padding: 16px (px-4)
- Card padding: 16px-20px
- Section gap: 20px
- Element gap within card: 12px

## Component Styles

### Header (sticky)
- Background: white
- Border bottom: 1px solid cream-dark
- Logo + app name left, language toggle right
- Subtle shadow

### Search Bar
- White background, cream border
- Sage green search icon
- Pill-shaped
- Focus: sage border

### Store Tabs
- Pill-shaped buttons
- Active: store brand color
- Inactive: white bg, light border, brand text color

### Recipe Card
- White bg, rounded-2xl
- Header gradient: sage green (not orange)
- Recipe emoji + name + description
- Metadata (servings, time) in sage-muted

### Ingredient Card
- White bg, rounded-xl, subtle border
- Product image thumbnail (rounded-lg)
- Checkbox: sage green when checked (not orange)
- Price in sage green
- Store badge: small pill with store color
- Substitution hint: cream-dark bg

### Price Compare Panel
- Trigger button: sage green outline
- Store total cards: store brand colors (light bg)
- "BEST" badge: sage green
- Per-item table: clean white with subtle dividers

### CTA Buttons
- Primary: sage green bg, white text, pill shape
- Secondary: white bg, sage border, sage text
- Disabled: muted sage, reduced opacity

### Bottom elements
- Suggestion chips: white bg, sage border, sage text
- Hover: sage bg, white text

### Floating Chat Button
- Sage green (not orange)
- Chat header: sage green gradient

### Footer
- Minimal, muted text on cream bg

## Decorative Elements (future)
- Landing page: organic blob shapes in cream-dark
- Cherry blossom / fern SVG illustrations
- Wave pattern (seigaiha) at bottom
- These are stretch goals - prioritize color/tone first

## Landing Page Layout
- Centered content
- Logo/illustration area at top
- App name + tagline
- 3 feature highlights with icon circles
- Primary CTA button (pill, sage green)
- "Already have an account? Log in" link

## Inner Pages Layout
- Sticky header with back nav
- Content cards with clear hierarchy
- Bottom navigation bar (Home, Search, Saved, My List, Profile)
- Bottom nav is a stretch goal
