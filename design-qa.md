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

final result: passed
