# Customer portal reference QA

- Source visual truth: user-supplied conversation attachment from 2026-11-17 (pet-care mobile home reference; 1170 × 1769 PNG as displayed by the client). The chat client did not expose a local filesystem path.
- Implementation screenshot: `/private/tmp/queuemate-customer-home-v1.png`
- Dark-mode screenshot: `/private/tmp/queuemate-customer-home-dark.png`
- Supporting navigation captures: `/private/tmp/queuemate-customer-requests-nav.png`, `/private/tmp/queuemate-customer-profile-nav.png`
- Viewport: iOS Simulator, 402 × 874 CSS points at 3× density.
- Implementation pixels: 1206 × 2622.
- Normalization: compared app-owned content only. The source includes a stylized phone frame while the implementation capture includes native iOS status and home-indicator areas. Those runtime-owned regions were excluded from fidelity findings.
- State: authenticated customer, light mode, active unpaid request.

## Full-view comparison evidence

The implementation preserves the source hierarchy and rhythm: compact greeting row, circular notification control, large dark identity-style card with an overlapping image, a light pill action, a three-row daily checklist with separate completion tiles, two summary cards, and a floating rounded navigation bar with a dark active item. Pet-specific content is intentionally mapped to QueueMate request data.

## Focused comparison evidence

- Header: avatar, two-line greeting, and circular notification match the source's placement and scale.
- Feature card: real QueueMate agent imagery replaces the pet image; the overlap, white image frame, black surface, large title, secondary line, and floating action pill match the reference treatment.
- Progress list: three rows use consistent icon tiles, label hierarchy, rounded pale surfaces, and independent check controls.
- Bottom navigation: the customer tab bar floats above the home indicator, shows labels, and gives the active route a dark rounded pill. Requests and Profile captures confirm the active state follows navigation.
- Dark mode: surfaces, borders, text, icon tiles, and floating navigation retain readable contrast without flattening the hierarchy.

## Required fidelity surfaces

- Fonts and typography: system mobile typography matches the soft, readable character of the source. Heading and body weights remain restrained; no clipping or broken wrapping is visible.
- Spacing and layout rhythm: page margins, card overlap, section gaps, row heights, radii, and floating navigation are consistent. The page scrolls so summary content remains reachable above the persistent tab bar.
- Colors and visual tokens: off-white/light-blue QueueMate background, black feature card, white surfaces, blue brand accents, and muted copy preserve the source balance while applying QueueMate tokens.
- Image quality and asset fidelity: the existing high-resolution QueueMate service-centre photo is sharp, correctly cropped, and contained by a real image frame. No placeholder art, CSS art, or custom SVG substitutes are used.
- Copy and content: all source-specific pet language has been replaced with coherent QueueMate content backed by the authenticated customer and active request.
- Icons and interaction: Ionicons provide a consistent native icon family. Feature action, add request, and all three customer tabs are wired to existing routes.
- Accessibility: primary controls have practical mobile tap areas; notification and add controls have accessibility labels; text and borders retain contrast in light and dark modes.

## Findings

No actionable P0, P1, or P2 differences remain. The layout is intentionally adapted rather than copied literally: QueueMate has three customer destinations instead of the four destinations in the source, and real request milestones replace pet-care tasks.

## Comparison history

- Pass 1: implemented and captured the authenticated customer home. No P0/P1/P2 visual mismatch was found after excluding device-frame/runtime chrome.
- Interaction pass: captured Requests and Profile destinations to verify the active navigation pill follows the route.
- Theme pass: captured dark mode and confirmed readable contrast and retained hierarchy.

## Follow-up polish

- P3: the development-only blue simulator settings bubble overlaps the notification in captures; it is not part of the app and will not appear in a production build.

## Implementation checklist

- [x] Reference hierarchy translated to live QueueMate request data.
- [x] Customer-only floating navigation added.
- [x] Agent portal navigation preserved.
- [x] Light and dark modes checked.
- [x] Mobile typecheck passed.
- [x] Primary routes and selected-tab states checked.

final result: passed
