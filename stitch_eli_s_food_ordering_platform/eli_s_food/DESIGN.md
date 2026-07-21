---
name: Eli’s Food
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5d3f3e'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#916e6d'
  outline-variant: '#e6bdbb'
  surface-tint: '#bf0029'
  primary: '#b90027'
  on-primary: '#ffffff'
  primary-container: '#e31837'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb3b1'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#feb246'
  on-secondary-container: '#6f4600'
  tertiary: '#00693e'
  on-tertiary: '#ffffff'
  tertiary-container: '#008550'
  on-tertiary-container: '#f1fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001d'
  secondary-fixed: '#ffddb6'
  secondary-fixed-dim: '#ffb95a'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#8df8b7'
  tertiary-fixed-dim: '#70db9d'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 80px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system for Eli’s Food is built to evoke the warmth and vibrancy of Ghanaian culinary culture while maintaining a modern, high-end digital experience. The brand personality is **appetizing, energetic, and professional**, focusing on the "joy of eating" through bold visual hierarchy and clean structural layouts.

The design style is a blend of **Minimalism** and **Tactile Modernism**. We use expansive white space to let high-resolution food photography act as the primary storyteller, supported by "squishy," touch-friendly interface elements that feel responsive and inviting. The emotional response should be one of immediate hunger satisfied by an efficient, trustworthy service.

## Colors
The palette is rooted in the "Vibrant Red" of the brand's heritage, used strategically for primary actions and urgent status indicators. 

- **Primary (#E31837):** Reserved for high-intent actions like "Add to Cart" or "Order Now."
- **Secondary (#FFB347):** Used for "Golden Hour" accents—ratings, discount tags, and flavor highlights—to create a sense of warmth.
- **Tertiary (#008751):** Introduced as a functional accent for "Open" status badges and dietary "Healthy/Vegan" tags, nodding to the Ghanaian flag's green.
- **Background (#FFFFFF):** A stark, clean canvas that ensures food photography colors remain true and appetizing.
- **Surface Neutrals:** Use #F9F9F9 for subtle section backgrounds to separate content modules without introducing heavy borders.

## Typography
The typography system uses **Plus Jakarta Sans** for headings to convey a bold, modern, and friendly confidence. Its geometric yet soft curves mirror the roundedness of the UI components. For body text, **Be Vietnam Pro** is selected for its exceptional legibility and warm, contemporary feel, making long ingredient lists or descriptions easy to digest.

Headlines should utilize tight letter spacing and heavy weights to create a "loud" and appetizing impact. Body text maintains generous line heights to ensure a relaxed reading pace.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density padding. We use a 12-column grid for desktop and a 4-column grid for mobile.

- **Vertical Rhythm:** A strict 8px baseline grid is used to align all components.
- **Margins:** Generous 20px safe areas on mobile ensure that the "Large Card" aesthetic doesn't feel cramped.
- **Reflow Rules:** On mobile, product cards transition to a single-column stack with full-bleed imagery to maximize appetite appeal. On desktop, they scale to a 3 or 4-column grid depending on category density.
- **Sticky Navigation:** The top bar and mobile bottom-nav are always present, using a subtle blur effect to maintain context of the scroll.

## Elevation & Depth
Depth is created through **Ambient Shadows** and **Tonal Layering** rather than harsh lines. 

- **Level 1 (Cards):** Soft, multi-layered shadows (Y: 4px, Blur: 20px, Color: rgba(0,0,0, 0.05)) are used for product cards to make them appear "lifted" off the white background.
- **Level 2 (Active States/Modals):** A deeper shadow (Y: 10px, Blur: 30px, Color: rgba(227, 24, 55, 0.1)) is used for the primary CTA buttons and floating action buttons to provide a tactile, pressable feel.
- **Backdrop:** Use a high-quality background blur (12px) behind sticky navigation bars to provide a sense of transparency and depth without cluttering the view.

## Shapes
This design system utilizes a **very rounded** shape language to appear friendly and organic. 
- **Product Cards:** Use `rounded-2xl` (1.5rem) to create a soft, premium container for food images.
- **Buttons:** Use `rounded-xl` (1rem) for a chunky, touch-optimized appearance.
- **Badges:** Small status badges (Open/Closed) use pill-shaped rounding for clear distinction from square text blocks.

## Components

### Buttons
- **Primary:** Vibrant Red background, white text, bold weight. Includes a subtle "press" animation where the shadow depth decreases.
- **Secondary:** White background with a 1.5px border in #E31837 or a soft Orange tint for less critical actions.

### Product Cards
- Large, high-aspect ratio images (4:3 or 1:1) with `rounded-2xl` corners.
- Content is bottom-aligned with the price highlighted in the Secondary Golden Orange.
- A "Quick Add" (+) floating button is positioned in the bottom-right corner of every card.

### Status Badges
- **Open:** Pill-shaped, Tertiary Green background with white text.
- **Closed:** Pill-shaped, Neutral mid-gray background.
- **Hot/New:** Floating tags on top of images using the Primary Red or Secondary Orange.

### Input Fields
- Soft gray backgrounds (#F2F2F2) with no borders until focused. On focus, a 2px Vibrant Red border appears.
- Large, accessible tap targets for all mobile inputs.

### Sticky Navigation
- A persistent bottom bar on mobile featuring "Home," "Menu," "Orders," and "Profile."
- The "Cart" icon should feature a Vibrant Red notification bubble for item counts.