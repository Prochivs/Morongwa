# Design QA — smooth rounded refinement

## Evidence

- Source visual truth: `/private/tmp/queuemate-hesed-desktop-final.png`, with user direction to make the treatment smoother, less generated-looking, and rounded.
- Source mobile truth: `/private/tmp/queuemate-hesed-mobile-final.png` with the same direction.
- Implementation desktop: `/private/tmp/queuemate-smooth-desktop.png`.
- Implementation mobile: `/private/tmp/queuemate-smooth-mobile.png`.
- Desktop comparison: `/private/tmp/queuemate-smooth-comparison.png`.
- Mobile comparison: `/private/tmp/queuemate-smooth-mobile-comparison.png`.
- Desktop viewport: 1440 × 1200 CSS px and image pixels, device scale factor 1.
- Mobile viewport: 500 × 1200 CSS px and image pixels, device scale factor 1.
- State: public homepage, navigation closed, top of page.

## Full-view comparison

The after-state preserves the monochrome hero and burgundy identity while replacing the rigid full-bleed geometry with a 28px framed hero, 16–24px card radii, soft elevation, calmer borders, and natural-case navigation and actions. Desktop and mobile retain the same content hierarchy and responsive order.

## Focused comparison

The original-resolution header, hero actions, image crop, mobile menu button, and first information band were inspected directly. The mobile comparison is itself a focused 500px view. The new radii remain consistent, image crops stay sharp, and no clipping or overflow is visible.

## Required fidelity surfaces

- Fonts and typography: Inter remains the product font. Navigation and actions now use natural case and calmer tracking, while small section labels retain controlled uppercase styling. Display text wraps cleanly at both viewports.
- Spacing and layout rhythm: 28px hero and CTA containers, 24px section grids, 16px panels and controls, and 12px buttons create a consistent radius scale. Softer shadows and spacing replace the previous hard-edged grid.
- Colors and visual tokens: black, white, soft gray, and burgundy remain intact. Shadows use neutral black opacity and semantic status colors remain unchanged.
- Image quality and asset fidelity: the 1536 × 1024 QueueMate hero remains sharp, correctly cropped, and monochrome. Rounded clipping is clean at desktop and mobile sizes.
- Copy and content: all QueueMate copy and the main request path remain unchanged. Navigation labels are easier to scan in natural case.

## Findings

No actionable P0, P1, or P2 issues remain. The smoother treatment directly addresses the user feedback without changing QueueMate functionality or content.

## Comparison history

1. User review identified a P1 aesthetic mismatch: the prior interface felt overly generated and too rigid, with 2–3px radii, hard borders, all-caps controls, and no elevation.
2. Fixes applied: introduced a 12/16/24/28px radius scale, softened borders, added restrained card elevation, converted controls to natural case, added subtle hover motion, and applied the same treatment to portal navigation, cards, fields, and buttons.
3. Post-fix evidence: `/private/tmp/queuemate-smooth-comparison.png` and `/private/tmp/queuemate-smooth-mobile-comparison.png` show the smoother hierarchy and consistent rounded framing.

## Interaction and runtime checks

- Browser-rendered desktop and mobile captures completed without page-level console errors.
- Production typecheck and build passed across all 31 routes.
- Reduced-motion support disables decorative transitions for users who request it.
- Primary request, navigation, and secondary CTA destinations remain unchanged.

## Follow-up polish

- P3: after user review, the global radius scale can be tuned slightly tighter or softer without structural changes.

final result: passed
