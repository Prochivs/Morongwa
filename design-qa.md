# QueueMate Mobile — CityBus Design QA

## Evidence

- Source project: `/Users/withusprochivs/Music/tutorial-rect`
- Source visual truth — CityBus home: `/private/tmp/citybus-home-472.png`
- Source visual truth — CityBus booking flow: `/private/tmp/citybus-booking.png`
- Implementation — QueueMate home, original simulator capture: `/private/tmp/queuemate-citybus-pass.png`
- Implementation — QueueMate home, density-normalized: `/private/tmp/queuemate-home-472.png`
- Implementation — QueueMate requests: `/private/tmp/queuemate-requests-final.png`
- Implementation — QueueMate request detail: `/private/tmp/queuemate-detail-final.png`
- Full-view side-by-side comparison: `/private/tmp/queuemate-citybus-compare.png`
- Runtime: Expo Go on iOS 18.4, CityBus Test simulator.
- Viewport and normalization: CityBus source captured at 472 × 1024 CSS pixels with device scale factor 1. QueueMate simulator captured at 944 × 2048 pixels at 2× and normalized to 472 × 1024 pixels. The compared images therefore have equal pixel and logical dimensions.
- State: customer home with an active request, light theme, authenticated state.

## Full-view comparison evidence

The combined comparison confirms that QueueMate now follows the CityBus composition and flow language: full-width photographic header, compact brand layer, task-entry card immediately below the image, strong single CTA, white ticket-style cards, shallow borders and shadows, service shortcuts, and a black icon-only tab bar. QueueMate intentionally retains its blue brand, queue-agent imagery, and request-specific content.

## Focused region comparison evidence

The home comparison is large enough to read the hero hierarchy, CTA card, ticket card, section titles, imagery, icon family, borders, and bottom navigation without a second crop. The separate QueueMate request-list and request-detail captures verify the equivalent CityBus booking/list pattern at native simulator resolution, including segmented states, status badges, the dark detail header, summary card, progress tracker, and tap targets.

## Required fidelity surfaces

- Fonts and typography: passed. The implementation preserves QueueMate’s established sans-serif product voice while matching CityBus’s hierarchy, compact label weights, large hero statement, centered dark headers, and readable ticket metadata. This is an intentional brand adaptation rather than unintentional drift.
- Spacing and layout rhythm: passed. Hero proportion, 20-point page gutters, shallow 9–12 point radii, compact card padding, section gaps, bottom-bar clearance, and ticket density match the source system without clipping or overlap.
- Colors and visual tokens: passed. CityBus’s red action role maps consistently to QueueMate blue `#009de7`; black navigation/header surfaces, white cards, pale slate page backgrounds, and semantic payment/status tones preserve the reference contrast structure.
- Image quality and asset fidelity: passed. QueueMate uses its real high-resolution service-centre image with a controlled dark overlay and cover crop. Ionicons provide one consistent interface icon family. No placeholder, emoji, handcrafted SVG, or CSS illustration substitutes are used.
- Copy and content: passed. CityBus-specific bus language has been replaced with concise QueueMate actions, while real institution, request, payment, schedule, customer, and agent data remain intact.
- Interaction and accessibility: passed. Primary buttons meet mobile tap-target sizing, disabled/loading states remain visible, cards provide press feedback, tabs expose selected state, text contrast is sufficient, and scrolling preserves access to persistent navigation.

## Findings

- No actionable P0, P1, or P2 findings remain.
- [P3] The CityBus home exposes origin/destination controls directly in the first card; QueueMate uses a single “Request assistance” entry card because its four-step request needs institution, service, schedule, contact, and policy acknowledgement. The visual pattern is preserved while avoiding an incomplete inline form.
- [P3] Expo Go’s floating development gear appears in simulator screenshots. It is development chrome and is not included in preview or production builds.

## Comparison history

1. The first implementation pass revealed a P2 duplicate native modal header above QueueMate’s custom dark request header.
2. The request route was changed from a native modal header to a full card screen with `headerShown: false`; card radii and shared title scale were also tightened to the CityBus rhythm.
3. The post-fix simulator pass verified home, requests, profile, request detail, and request creation. The normalized side-by-side comparison found no remaining actionable P0/P1/P2 differences.

## Primary interactions and console checks

- Tested customer Home → Requests tab → request card → Request details.
- Tested entry into the four-step Request assistance flow and verified the duplicate header fix.
- Verified profile rendering, active tab state, request filters, button disabled/loading styling, and API-backed request data.
- Metro console checked after the final bundle. No render, navigation, runtime errors, or app-owned warnings remain.
- `npm run typecheck -w @queuemate/mobile` passed.
- `npx expo-doctor apps/mobile` completed without a reported failure.

## Implementation checklist

- [x] CityBus-style photographic welcome and customer home.
- [x] Compact authentication hierarchy and form surfaces.
- [x] Black icon-only bottom navigation.
- [x] Segmented ticket-style request and assignment lists.
- [x] Four-step request creation flow: Place, Details, Contact, Review.
- [x] Compact dark request and assignment detail headers.
- [x] CityBus-style profile identity and account layout.
- [x] Existing customer/agent API behavior, payment, review, and status mutations preserved.
- [x] Light and dark theme token compatibility retained.

final result: passed
