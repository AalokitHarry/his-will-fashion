---
name: His Will Fashion
description: Faith-inspired streetwear treated with illuminated-manuscript graphic weight — gold ink, rubrication red, near-black ground.
colors:
  ink: "#0d0a06"
  ink-soft: "#17130f"
  charcoal: "#241c14"
  parchment: "#f7f0df"
  parchment-dim: "#e9dcbc"
  gold: "#d9a92c"
  gold-soft: "#ecc568"
  rust: "#c22a2c"
  rust-soft: "#dd5b4f"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.rust}"
    textColor: "{colors.parchment}"
---

# Design System: His Will Fashion

## Overview

**Creative North Star: "The Illuminated Ledger"**

Scripture is treated like an illuminated manuscript capital worth flooding the page in gold ink, not a delicate serif quote sitting politely in the margin. The system refuses two ruts this project already tried and rejected: the soft-pastel "Christian merch" default, and the neutral black/cream/gold luxury-editorial default (Cormorant serif, restrained gold accent) that read as generic premium fashion rather than as this specific brand. This is streetwear first — a bold flat-graphic grammar borrowed from illuminated manuscripts and rubrication (marking key words in red ink), rebuilt at poster scale so it reads as hype fashion, not stationery.

Near-black is the ground everywhere, not just a dark accent band. Gold is a committed, flooded color carrying 30-60% of key surfaces — never a rare glint. Red ("rust" token) is reserved specifically for rubrication: verse references, emphasis marks, destructive actions. The recurring signature motif is a single oversized flat capital letter ("H"), rendered in solid gold with a small red rubricator's dot, used as a background graphic on hero moments — never literal calligraphy, always a bold geometric block.

**Key Characteristics:**
- Near-black ground carries the whole site; gold is a flooded field, not an accent
- Red is reserved for rubrication (verse marks, emphasis, destructive actions) — never a generic hover color
- Bold uppercase display type reads as poster/graphic-block lettering, not elegant serif
- Small, consistent cut-panel radius (6-14px) — not soft luxury pills, not 0px brutalism
- The giant illuminated-capital letterform is the signature recurring graphic device

## Colors

Two committed colors (gold, rust-red) carry all expression against a near-black ground; parchment/cream is reserved for text and light functional surfaces (form inputs, the cart drawer).

### Primary
- **Flooded Gold** (`#d9a92c`): The dominant graphic color — CTA buttons, hero/verse-spotlight section backgrounds, active filter states, the illuminated-capital motif, badges. Used as large flat fields, not a thin accent line.

### Secondary
- **Rubrication Red** (`#c22a2c`): Reserved meaning, not a general accent. Used for: verse-reference marks (the small dot in VerseMark/IlluminatedCapital), hover states on gold buttons (gold → red on hover), destructive actions (remove-from-cart, admin logout). Never used as a default link-hover color — that's gold's job.

### Neutral
- **Ink** (`#0d0a06`): The primary page ground, used everywhere except gold-flooded bands.
- **Ink Soft** (`#17130f`): Secondary dark surface (mobile nav panel).
- **Charcoal** (`#241c14`): Elevated card/panel surface against the ink ground — product image tiles, testimonial cards, order-summary asides.
- **Parchment** (`#f7f0df`): Primary text color on dark surfaces; also the fill for light functional surfaces (form inputs, the cart drawer panel) where legibility of dense text matters more than world-immersion.
- **Parchment Dim** (`#e9dcbc`): Reserved for subtle light-surface borders/fills; lightly used.

### Named Rules
**The Flooded Field Rule.** Gold never appears as a thin accent stroke on a light page — it always owns a whole region (a button, a full-width band, a badge fill) at 30-60% coverage of that region.

**The Rubrication-Only Rule.** Red is never used as a decorative or generic-hover accent. It appears only where something is being marked as significant (a verse reference) or as a warning (remove, log out, hover-state on a gold CTA).

## Typography

**Display Font:** Big Shoulders Display (with Arial Narrow, sans-serif fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** A bold, tall, condensed poster-lettering face for every headline — uppercase, heavy weight, no italics (the face has none loaded) — paired with a plain, highly legible workhorse sans for everything functional. Two typefaces total.

### Hierarchy
- **Display** (700 weight, `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.05, uppercase): Page headlines (h1/h2), product names. Always uppercase via `.font-display`/`.font-editorial`.
- **Label** (600 weight, ~12px, letter-spacing 0.08-0.2em, uppercase): Eyebrows, nav links, buttons, form labels, badges — `.font-condensed`.
- **Body** (400 weight, Inter, line-height ~1.6): Paragraph copy, descriptions.

### Named Rules
**The No-Italic Rule.** Never apply `italic` to `.font-display`/`.font-editorial` text — the loaded font files have no italic weight, so browsers synthesize a faux-italic that looks broken. Use color (gold) or a following rubrication mark to differentiate emphasis instead.

**The Line-Height Floor Rule.** Any headline wrapped in the word-reveal component (`RevealText`) needs `leading-[1.05]` or looser. This font's natural glyph height exceeds a tighter line-height (observed: `leading-[0.95]` clips the tops of ascenders inside the component's `overflow-hidden` reveal mask). Plain (non-revealed) headings can go tighter if desired, but revealed ones must not.

## Layout

Standard `max-w-7xl` (or narrower per-section) centered containers with `px-5 md:px-8` gutters, matching the pre-existing site structure. Product grids: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Section rhythm alternates plain ink ground with full-bleed gold-flooded bands (hero ticker, verse spotlight, page-hero bands on Shop/Contact) for the "Committed" color-strategy rhythm — this replaces the previous design's ink/parchment alternation now that ink is the base ground everywhere.

## Elevation & Depth

Flat by design — no shadows. Depth is conveyed through color-field layering (ink → charcoal → gold, darkest to brightest) and thin gold-tinted borders (`border-gold/15`) on elevated panels, not through box-shadow.

## Shapes

Small, consistent "cut graphic panel" radius — `6px` to `14px` (`rounded-lg`/`rounded-xl` etc.) — deliberately between the previous two extremes this project tried (full pill/`rounded-full` luxury buttons, and `0px` brutalist sharpness). True circles (`rounded-full`) are reserved for genuinely circular elements only: icon buttons, badge dots, avatar-like marks — never elongated pill buttons.

### Named Rules
**The Circle-Or-Cut Rule.** An element is either a true circle (`rounded-full`, for icon buttons/dots/badges) or a small cut-corner rectangle (`rounded-lg`/`rounded-xl`). Nothing in between (no large soft pill buttons).

## Components

### Buttons
- **Shape:** `rounded-lg` (8px)
- **Primary:** Flooded gold background, ink text, gold border — `bg-gold text-ink border border-gold`
- **Hover:** Swaps to rubrication red — `hover:bg-rust hover:border-rust hover:text-parchment`
- **Secondary/Ghost:** Transparent with a parchment/40 border, gold on hover

### Cards / Containers
- **Corner Style:** `rounded-lg`
- **Background:** `bg-charcoal` with `border-gold/15` — the standard elevated-panel treatment against the ink page ground
- **Shadow Strategy:** None (see Elevation & Depth)

### Inputs / Fields
- **Style:** Light parchment fill (`bg-parchment text-ink`) with a `border-parchment/20` stroke, sitting on the dark page — a deliberate "light functional slot on a dark shell" pattern for anything task-focused (Checkout, Contact, Admin forms)
- **Focus:** Border shifts to gold (`focus:border-gold`)

### Navigation
Solid `bg-ink/95 backdrop-blur-md` bar, fixed, with a `border-gold/20` bottom hairline — always solid (not transparent-over-hero), since hero backgrounds vary between ink (Home) and gold (Shop/Contact) across the site and a transparent bar could lose contrast against either. Logo mark is a small gold square badge with a bold ink "H" (the illuminated-capital motif in miniature), not the previous circular cross glyph.

### Illuminated Capital (signature component)
A single oversized flat capital letter in flooded gold, with a small red rubricator's dot near its top-left stroke, plus a faint radial gold-linework field behind it. Used as a decorative background graphic on hero/section-opener moments on desktop and tablet only — hidden below the `md` breakpoint, where the single-column mobile layout has no room for a competing background element.

### Verse Mark (signature component)
A small badge used everywhere a scripture reference or tagline appears (product cards, product detail, hero). Reveals in three registered passes on scroll — an ink keyline draws first, a gold field floods in behind it, then the reference text (with a small red rubrication dot) fades in on top — echoing a woodblock print pulling into color registration.

## Do's and Don'ts

### Do:
- **Do** treat gold as a page-scale field (buttons, full-width bands, badges), never a thin accent line.
- **Do** reserve red (`rust` token) exclusively for rubrication meaning: verse marks, emphasis, destructive/warning actions.
- **Do** keep headline type uppercase and un-italicized.
- **Do** use `leading-[1.05]` or looser on any headline wrapped in the word-reveal animation component.
- **Do** keep the navbar solid/dark at all times — never transparent over a hero, since hero backgrounds vary by page.

### Don't:
- **Don't** use `rounded-full` on anything but genuinely circular elements (icon buttons, dots, badges) — no pill-shaped CTA buttons.
- **Don't** add box-shadow anywhere; depth comes from color-field layering only.
- **Don't** use gold or red as a generic hover color on non-CTA, non-rubrication text — most link hovers use gold, but red hovers are reserved for destructive actions and the gold→red CTA-hover swap specifically.
- **Don't** revert to the previous luxury-editorial palette (warm near-black + soft antique gold `#c9a24d` + Cormorant serif) — that direction was explicitly tried and rejected before this system.
