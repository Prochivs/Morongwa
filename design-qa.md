# QueueMate Pricing Cards — Design QA

## Evidence

- Source visual truth: `/private/tmp/queuemate-pricing-reference.png`
- Source pixels: `455 × 341`
- Desktop implementation: `/private/tmp/queuemate-pricing-plans-960.png`
- Desktop implementation pixels: `960 × 741`
- Mobile implementation: `/private/tmp/queuemate-pricing-plans-mobile.png`
- Mobile implementation pixels: `430 × 1374`
- Side-by-side comparison: `/private/tmp/queuemate-pricing-comparison.png`
- Desktop CSS viewport: `960 × 800`, device scale factor `1`
- Mobile CSS viewport: `430 × 800`, device scale factor `1`
- Density normalization: the 960 px implementation capture is displayed at 455 px wide beside the 455 px source thumbnail in the combined comparison.
- State: public homepage, signed out, live pricing loaded, pricing section at rest.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: both designs use a centered two-line hierarchy, compact plan names, prominent prices, small feature copy, and restrained button labels. QueueMate keeps its established Poppins family and medium weights.
- Spacing and layout rhythm: the final section matches the reference's centered header, three equal cards, feature lists, bottom-aligned actions, and emphasized middle choice. The QueueMate container uses its established larger radius as an intentional brand adaptation.
- Colors and visual tokens: the source purple/coral treatment is intentionally translated to QueueMate's `#1a1c27` dark surface and solid brand blue. The featured middle card uses a blue border and filled action while the outer cards use subtle outlines.
- Image quality and asset fidelity: the reference is entirely interface UI and contains no photography, illustration, logo, or decorative raster asset requiring recreation.
- Copy and content: generic plan copy is replaced with QueueMate's live service names, BWP prices, verified-agent benefits, request updates, and fixed-price promise.
- Responsive behavior: the three-card row becomes a clean single-column stack at 430 px with no clipping or horizontal overflow.
- Interaction: all three action buttons link to `/register`; the destination returned HTTP 200.
- Browser console: no browser warnings or errors were recorded in the final desktop or mobile captures.

## Full-view comparison evidence

- `/private/tmp/queuemate-pricing-comparison.png` places the source and final implementation in one comparison input at the same displayed width.
- The comparison confirms matching information hierarchy, centered alignment, three-card structure, featured middle action, and dark-panel composition.
- A separate focused crop was not needed because the comparison keeps headings, prices, feature lists, borders, and actions readable; the mobile capture was reviewed separately.

## Comparison history

1. Initial implementation: `/private/tmp/queuemate-pricing-plans-960.png` before the final spacing pass measured `960 × 926`.
   - [P2] The outer whitespace, header scale, gap above the cards, and 330 px card height made the section substantially taller and airier than the compact source.
   - Fix: reduced the outer section padding, headline size, card gap, and card minimum height.
2. Post-fix implementation: `/private/tmp/queuemate-pricing-plans-960.png` now measures `960 × 741`.
   - The normalized comparison shows the compact three-card rhythm and section proportions now align without actionable P0/P1/P2 drift.

## Implementation checklist

- [x] Centered reference-inspired pricing header
- [x] Three live service-price cards
- [x] Shared feature lists and bottom-aligned actions
- [x] Featured middle option
- [x] Working registration links
- [x] Responsive single-column mobile layout
- [x] TypeScript check and browser-rendered evidence

## Follow-up polish

- P3: the source uses a purple/coral gradient accent; QueueMate intentionally uses a solid blue accent to preserve brand consistency and avoid introducing a one-off visual language.

---

# QueueMate Testimonials and Page Titles — Design QA

## Evidence

- Source visual truth: `/private/tmp/uidux-testimonials-reference.png` (`1600 × 1200`).
- Populated implementation state: `/private/tmp/queuemate-testimonials-populated-section.png` (`1440 × 1200`).
- Side-by-side comparison: `/private/tmp/queuemate-testimonials-comparison.png` (`3040 × 1200`).
- Final live-data homepage: `/private/tmp/queuemate-testimonials-final-live.png` (`1440 × 3600`).
- Responsive populated state: `/private/tmp/queuemate-testimonials-mobile-full.png` (`500 × 6500`).
- Shared page-title check: `/private/tmp/queuemate-how-it-works-regular.png` (`1440 × 900`).
- Desktop CSS viewport: `1440 × 3600`; mobile CSS viewport: `500 × 6500`; device scale factor `1`.
- State: public pages, signed out, light theme. The populated comparison used three clearly labelled temporary QA-only reviews; those fixtures were removed before the final build. The live API currently has no approved reviews, so the shipped state displays the verified empty-state message.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: QueueMate retains its established Poppins family. The testimonial hierarchy follows the source while using the product's sentence case. Shared secondary-page H1 titles now use regular weight, verified on the How it works page.
- Spacing and layout rhythm: the desktop section matches the source's centered introduction, three-card row, elevated middle card, framed background band, and centered paging controls. The mobile layout becomes a clean single-column stack without clipping or horizontal overflow.
- Colors and visual tokens: the source's amber accent is translated to QueueMate blue `#009de7`; navy text, pale slate framing, soft shadows, and rounded corners remain consistent with the rest of the site.
- Image quality and asset fidelity: the testimonial reference contains interface elements only. Lucide stars and arrows are used as crisp vector icons; no new raster asset was required.
- Copy and content: no invented customer claims ship in production. Reviews render only from the approved public API, and the live empty state explains the verification requirement.
- Primary interaction: previous and next controls expose working handlers, clear disabled states, and accessible labels. The single-page QA fixture correctly displayed both controls as disabled.
- Browser console: no application console errors were observed; the only message was the standard React DevTools development notice.

## Full-view comparison evidence

- `/private/tmp/queuemate-testimonials-comparison.png` places the source and populated implementation in the same `3040 × 1200` comparison input.
- The comparison confirms the same testimonial-section hierarchy, three-card composition, elevated center card, review-rating row, customer metadata, and paging-control placement.
- Decorative source dots were intentionally omitted to keep QueueMate's visual language restrained and avoid adding one-off ornamentation.

## Comparison history

1. Initial live-data render: `/private/tmp/queuemate-testimonials-section.png`.
   - [P2] The approved-review API was empty, so visual fidelity of the populated card composition could not be assessed from the production state alone.
   - Fix: rendered three explicitly labelled temporary QA records, captured desktop and mobile evidence, and removed every fixture before the final build.
2. Populated comparison: `/private/tmp/queuemate-testimonials-comparison.png`.
   - The source structure and QueueMate adaptation align without actionable P0/P1/P2 drift.
3. Final live-data render: `/private/tmp/queuemate-testimonials-final-live.png`.
   - The production build uses the real approved-review feed and presents the honest verified empty state until reviews are available.

## Implementation checklist

- [x] Reference-inspired section directly below pricing
- [x] Three responsive testimonial cards with elevated center card
- [x] Approved-review API integration with no fabricated production data
- [x] Accessible paging controls and disabled states
- [x] Responsive desktop and mobile visual checks
- [x] Regular-weight shared secondary-page titles
- [x] TypeScript check and browser-rendered evidence

## Follow-up polish

- P3: when more than three approved reviews exist, add a browser-level interaction test that clicks both paging controls and records the state transition.

final result: passed
