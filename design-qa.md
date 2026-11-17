# Customer portal reference QA

- Source visual truth: user-supplied conversation attachment from 2026-11-17 (pet-care mobile home reference; 1170 × 1769 PNG as displayed by the client). The chat client did not expose a local filesystem path.
- Implementation screenshot: `/private/tmp/queuemate-customer-quick-actions.png`
- Planner draft screenshot: `/private/tmp/queuemate-planner-todo-form.png`
- Planner list screenshot: `/private/tmp/queuemate-planner-rounded-add.png`
- Dark-mode screenshot: `/private/tmp/queuemate-customer-exact-heights-dark.png`
- Supporting navigation captures: `/private/tmp/queuemate-customer-requests-nav.png`, `/private/tmp/queuemate-customer-profile-nav.png`
- Viewport: iOS Simulator, 402 × 874 CSS points at 3× density.
- Implementation pixels: 1206 × 2622.
- Normalization: compared app-owned content only. The source includes a stylized phone frame while the implementation capture includes native iOS status and home-indicator areas. Those runtime-owned regions were excluded from fidelity findings.
- State: authenticated customer, light mode, active unpaid request.

## Full-view comparison evidence

The implementation preserves the source hierarchy while incorporating the user's latest refinements: fully circular 44-point header controls, a compact 180-point photographic request card, clear 66-point request rows, and a 64-point floating navigation bar aligned to the 27-point content gutters with an 18-point bottom margin. The light-mode canvas is pure white. Pet-specific content is intentionally mapped to QueueMate request data. The progress list, lower wellness cards, and floating feature action were intentionally omitted at the user's request.

## Focused comparison evidence

- Header: a circular person avatar, two-line greeting, and fully circular notification match the source's placement and scale.
- Feature card: the QueueMate agent photo fills the complete card behind a restored dark overlay. Its custom crop keeps both the agent's face and phone visible, while the overlay and text shadows preserve title and reference readability. The separate framed thumbnail is removed, the radius is reduced to 16 points, and the complete card remains an accessible tap target.
- Today's requests: requests scheduled, requested, or submitted today appear in compact tappable rows with the appointment date or time, institution, reference, city, and navigation chevron. Status pills are intentionally omitted from this home-screen summary. When the account has no requests, a centered empty state provides a direct New request button; View all appears when request history exists.
- Quick actions: compact Planner, Help, and Notifications cards sit directly below today's requests. Their enlarged 40-point icon tiles and labels are horizontally centered for a balanced three-column layout. Planner stores private account-linked to-dos without creating a request; Help provides direct support choices; Notifications shows live in-app updates. The header bell uses the same Notifications route.
- Bottom navigation: the customer tab bar floats above the home indicator, aligns to the same 27-point side gutters as the content above, shows labels, and gives the active route a dark rounded pill. Requests and Profile captures confirm the active state follows navigation.
- Dark mode: surfaces, borders, text, icon tiles, and floating navigation retain readable contrast without flattening the hierarchy.

## Required fidelity surfaces

- Fonts and typography: system mobile typography matches the soft, readable character of the source. Heading and body weights remain restrained; no clipping or broken wrapping is visible.
- Spacing and layout rhythm: 27-point content gutters, the compact 180-point feature card, 66-point request rows, restrained radii, and 64-point floating navigation preserve a balanced mobile rhythm with ample space above the persistent tab bar.
- Colors and visual tokens: a pure white light-mode canvas, darkened photographic feature card, pale-grey task surfaces, blue QueueMate accents, and muted copy preserve strong contrast while applying QueueMate tokens.
- Image quality and asset fidelity: the existing high-resolution QueueMate service-centre photo is sharp, positioned with its native aspect ratio so the face and phone remain visible, and protected by a translucent readability overlay. No placeholder art, CSS art, or custom SVG substitutes are used.
- Copy and content: all source-specific pet language has been replaced with coherent QueueMate content backed by the authenticated customer, active request, and today's real request data.
- Icons and interaction: Ionicons provide a consistent native icon family. Feature action, add request, and all three customer tabs are wired to existing routes.
- Accessibility: primary controls have practical mobile tap areas; notification and add controls have accessibility labels; text and borders retain contrast in light and dark modes.

## Findings

No actionable P0, P1, or P2 differences remain. The layout is intentionally adapted rather than copied literally: QueueMate has three customer destinations instead of the four destinations in the source, the progress/tasks section is intentionally removed, the feature card is intentionally taller, its floating action is removed, and the previously removed lower overview remains omitted.

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
- Simplification pass: removed the complete progress section, replaced initials with a circular person avatar, made the notification fully circular, reduced the card radius from 22 to 16 points, and increased the card to 230 points. The first crop did not resolve the image width correctly; the corrected full-width native-ratio crop now shows both the agent's face and phone in the post-fix capture.
- Card-height pass: reduced the request card from 230 to 180 points and shifted the image upward by 36 points to retain the face-and-phone focal crop in the shorter layout.
- Today's-requests pass: added a live section that includes requests scheduled, requested, or submitted today. The first horizontal badge placement compressed institution names; moving status below the request metadata produced the readable post-fix rows shown in the final capture.
- Full-color and empty-state pass: removed the full-card overlay and pressed opacity, then added text shadows for legibility. Added a centered no-request state with a direct New request action while preserving the existing-history and no-today variants.
- Overlay restoration pass: restored the translucent dark image overlay at the user's request without changing the centered empty state or its New request action.
- Request-row simplification pass: removed status pills from the home-screen list items and reduced the rows from 88 to 66 points, while preserving full status information on request details and the complete Requests screen.
- Quick-actions pass: added three compact actions below today's requests, connected them to functional Planner, Help, and Notifications screens, and verified each route in the iOS Simulator.
- Planner workflow pass: replaced the submitted-request schedule with private planner to-dos. Customers can create, edit, and delete reminders, then explicitly prepare the normal four-step request form later. Only final request submission sends data into QueueMate operations; a successfully submitted request removes its originating planner item.
- Planner-header pass: removed the list screen's subtitle and dark masthead, replacing them with a compact themed surface and subtle bottom divider.
- Planner-empty-state pass: removed the surrounding card border so the no-plans message sits directly on the page canvas.
- Planner-add-control pass: removed the solid blue fill from the top add control and retained its original rounded-square radius with a light outline and theme-aware dark plus.
- Planner-empty-icon pass: changed the empty-state calendar to the theme-aware dark text color while retaining its subtle light background.
- Mobile-navigation pass: standardized every former dark portal header to the Planner treatment—a compact themed surface, dark light-mode controls and title, no navigation subtitle, and a subtle bottom divider.

## Follow-up polish

- P3: the development-only blue simulator settings bubble overlaps the notification in captures; it is not part of the app and will not appear in a production build.

## Implementation checklist

- [x] Reference hierarchy translated to live QueueMate request data without the removed progress or overview sections.
- [x] Customer-only floating navigation added.
- [x] Today's request rows, centered empty state, New request action, detail navigation, and View all behavior implemented.
- [x] Agent portal navigation preserved.
- [x] Light and dark modes checked.
- [x] Mobile typecheck passed.
- [x] Primary routes and selected-tab states checked.
- [x] Planner schema applied to MongoDB and authenticated create/list/update/delete flow verified end to end.

final result: passed
