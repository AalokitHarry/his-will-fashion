# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Young Christian adults in India, both genders. They want their everyday wardrobe to visibly reflect their faith without looking like generic "Jesus merch" — streetwear they'd wear on the street, not just to church. Product range spans a broadly male-leaning streetwear register (Lion of Judah, Kingdom Mindset) to more feminine pieces (Jesus' Little Princess), so the audience is mixed rather than narrowly one gender.

## Product Purpose

His Will Fashion sells faith-inspired streetwear — heavyweight T-shirts carrying scripture verses and Christian messaging, designed with real streetwear/hype-fashion craft rather than typical Christian-merch design conventions. Success means believers choosing it as their actual daily wardrobe, not a novelty or church-only item.

## Positioning

Streetwear-grade design paired with real scripture — the mechanism a generic Christian-apparel competitor can't copy without becoming a streetwear brand first, and a generic streetwear competitor can't copy without genuine faith positioning. Not "Jesus merch": intended to hold up visually next to any hype streetwear label.

## Operating Context

- Instagram: @his_wll_fashion_club — primary brand/community channel.
- Tagline: "Wear Your Faith. Live His Will."
- Shipping: Pan India.
- Checkout: Cash-on-Delivery only (Razorpay/online payment was explicitly removed per prior decision — do not reintroduce without the user asking).
- Small-batch model per existing About-page copy ("we design in small batches, print with intention").
- Admin dashboard at `/admin` (password-gated) for viewing orders stored in Cloudflare D1.

## Capabilities and Constraints

- Stack (existing, not to be re-litigated): `client/` — React 19 + Vite + Tailwind v4 + Framer Motion, deployed as a Cloudflare Pages static site. `worker/` — Hono on Cloudflare Workers + D1 for order storage. Deployed via `wrangler pages deploy` (client) and `wrangler deploy` (worker, from `worker/`).
- 8 real products, each with 3 real photos (model / flat-lay / hanging), stored under `client/public/products/`.
- No online payment integration by explicit user decision — COD only.
- Undecided: exact founder/team size and production scale beyond "small batches" — not yet confirmed, do not invent specifics (e.g. don't state team headcount or unit volume).

## Brand Commitments

- Name: His Will Fashion.
- Tagline: "Wear Your Faith. Live His Will." — treat as fixed, appears in hero and nav.
- Confirmed factual claim (do not remove without the user's say-so): "A portion of every drop supports ministry work and community outreach across India."
- Values as currently stated on the About page: Faith First, Uncompromising Craft, Community, Purpose Over Profit.

## Evidence on Hand

- 8 real product photos per item (3 each) — actual product photography, not stock/placeholder.
- Homepage testimonials use three real customer names (Alex Jadhav, Shweta Bamnia, Lucky Rajendar) confirmed by the user, but the quote text attached to them is placeholder copy the user chose to keep rather than real quotes — future work must not treat these quotes as verified statements from those people, and must not fabricate additional testimonials, review counts, or customer numbers.
- No case studies, press mentions, or third-party proof exist — do not invent any.
- Team size / production volume beyond "small batches" is not established — do not state specifics.

## Product Principles

1. Streetwear craft first — the product must read as real streetwear before it reads as "Christian merch"; faith messaging should feel integrated into design, not slapped on.
2. Faith is the non-negotiable core, not a theme — scripture and conviction drive the product, per existing "Faith First" value.
3. COD-only, Pan-India — checkout and logistics assumptions should never assume online payment or international shipping unless the user changes this.
4. Small, real, and honest — avoid inflating claims (customer counts, press, scale) beyond what's confirmed; the brand's credibility rests on being a real small operation, not a fabricated big one.
5. Community over transaction — the brand frames itself as a movement/family (per About page), not just a storefront.
