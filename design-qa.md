# Customer portal reference QA

- Source visual truth: user-supplied conversation attachment from 2026-11-17 (pet-care mobile home reference; 1170 × 1769 PNG as displayed by the client). The chat client did not expose a local filesystem path.
- Implementation screenshot: `/private/tmp/queuemate-customer-request-image-background.png`
- Dark-mode screenshot: `/private/tmp/queuemate-customer-exact-heights-dark.png`
- Supporting navigation captures: `/private/tmp/queuemate-customer-requests-nav.png`, `/private/tmp/queuemate-customer-profile-nav.png`
- Viewport: iOS Simulator, 402 × 874 CSS points at 3× density.
- Implementation pixels: 1206 × 2622.
- Normalization: compared app-owned content only. The source includes a stylized phone frame while the implementation capture includes native iOS status and home-indicator areas. Those runtime-owned regions were excluded from fidelity findings.
- State: authenticated customer, light mode, active unpaid request.

## Full-view comparison evidence

The implementation preserves the source hierarchy while incorporating the user's latest refinements: 44-point header controls, a taller 142-point photographic feature card, 64-point progress rows and check tiles, and a 64-point floating navigation bar aligned to the 27-point content gutters with an 18-point bottom margin. The light-mode canvas is pure white. Pet-specific content is intentionally mapped to QueueMate request data. The source's lower wellness cards and floating feature action were intentionally omitted at the user's request.

## Focused comparison evidence

- Header: avatar, two-line greeting, and circular notification match the source's placement and scale.
- Feature card: the real QueueMate agent photo fills the complete card behind a subtle dark overlay. The large title and reference remain readable, the separate framed thumbnail is removed, and the complete card remains an accessible tap target.
- Progress list: three 64-point rows use 40-point icon tiles, matched label hierarchy, rounded pale-grey surfaces, 8-point gaps, and independent 64-point check controls.
- Bottom navigation: the customer tab bar floats above the home indicator, aligns to the same 27-point side gutters as the content above, shows labels, and gives the active route a dark rounded pill. Requests and Profile captures confirm the active state follows navigation.
- Dark mode: surfaces, borders, text, icon tiles, and floating navigation retain readable contrast without flattening the hierarchy.

## Required fidelity surfaces

- Fonts and typography: system mobile typography matches the soft, readable character of the source. Heading and body weights remain restrained; no clipping or broken wrapping is visible.
- Spacing and layout rhythm: 27-point content gutters, the intentional 142-point feature card, section gaps, 64-point row heights, radii, and 64-point floating navigation preserve a balanced mobile rhythm. The progress list ends with enough breathing room above the persistent tab bar.
- Colors and visual tokens: a pure white light-mode canvas, darkened photographic feature card, pale-grey task surfaces, blue QueueMate accents, and muted copy preserve strong contrast while applying QueueMate tokens.
- Image quality and asset fidelity: the existing high-resolution QueueMate service-centre photo is sharp, correctly cropped across the full feature card, and protected by a translucent readability overlay. No placeholder art, CSS art, or custom SVG substitutes are used.
- Copy and content: all source-specific pet language has been replaced with coherent QueueMate content backed by the authenticated customer and active request.
- Icons and interaction: Ionicons provide a consistent native icon family. Feature action, add request, and all three customer tabs are wired to existing routes.
- Accessibility: primary controls have practical mobile tap areas; notification and add controls have accessibility labels; text and borders retain contrast in light and dark modes.

## Findings

No actionable P0, P1, or P2 differences remain. The layout is intentionally adapted rather than copied literally: QueueMate has three customer destinations instead of the four destinations in the source, real request milestones replace pet-care tasks, the feature card is intentionally taller, its floating action is removed, and the previously removed lower overview remains omitted.

## Comparison history

- Pass 1: the original implementation used a 194-point feature card, 76-point progress rows, 20-point gutters, and 72-point navigation. These were P2 density mismatches against the normalized source.
- Pass 2: reduced the feature card to 128 points, rows to 64 points, controls to 44 points, and navigation to 64 points. The feature card and horizontal gutters remained too large/small respectively.
- Pass 3: set the source-normalized 27-point gutters, 112-point feature card, 116-point square image, 40-point action pill, pale-grey row surfaces, and full-height warm canvas. Post-fix capture shows the reference proportions without clipping or overlap.
- Interaction pass: captured Requests and Profile destinations to verify the active navigation pill follows the route.
- Theme pass: captured dark mode and confirmed readable contrast and retained hierarchy.
- Navigation-centering pass: the first width-only adjustment remained left-anchored because the tab navigator uses logical `start` and `end` positioning. Replacing it with equal 7% logical insets produced matching 28-point side margins in the post-fix simulator capture.
- Navigation-width pass: restored the tab bar to its original full width, then aligned it to the established 27-point content gutters at the user's request while retaining its 18-point bottom spacing.
- Home-surface pass: changed light-mode app backgrounds to pure white, increased the active-request card from 112 to 142 points, enlarged its image to 128 points, and removed the visible action pill. Post-fix capture confirms the card remains balanced and fully tappable.
- Feature-image pass: replaced the separate framed photo with the same high-resolution image as a full-card background and added a dark overlay. Post-fix capture confirms the title, reference, phone, and QueueMate uniform remain legible.

## Follow-up polish

- P3: the development-only blue simulator settings bubble overlaps the notification in captures; it is not part of the app and will not appear in a production build.

## Implementation checklist

- [x] Reference hierarchy translated to live QueueMate request data without the removed overview section.
- [x] Customer-only floating navigation added.
- [x] Agent portal navigation preserved.
- [x] Light and dark modes checked.
- [x] Mobile typecheck passed.
- [x] Primary routes and selected-tab states checked.

final result: passed
