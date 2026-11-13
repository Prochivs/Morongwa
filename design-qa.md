# Design QA — pricing follow-up section

## Evidence

- Source visual truth: `/private/tmp/queuemate-section-reference.jpg`
- Implementation screenshot: `/private/tmp/queuemate-control-section-960.png`
- Responsive implementation screenshot: `/private/tmp/queuemate-control-section-mobile.png`
- Side-by-side comparison: `/private/tmp/queuemate-design-comparison.png`
- Comparison viewport: 960 × 453 CSS px, device scale factor 1
- Source pixels: 960 × 453
- Implementation pixels: 960 × 424, captured directly from the rendered section at 960 CSS px wide
- Mobile evidence: 430 × 944 section capture at 430 CSS px wide, device scale factor 1
- State: public homepage, pricing loaded, new section immediately below pricing

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the implementation preserves the reference's two-line display statement, medium optical weight, compact body copy, and small card labels while using QueueMate's established Poppins family.
- Spacing and layout rhythm: the left statement/CTA and right 2 × 2 card grid match the reference composition. The implementation is 29 px shorter than the source, an acceptable P3 density variation.
- Colors and visual tokens: the source green/lime palette is intentionally translated to QueueMate's `#1a1c27` background and brand blue accent.
- Image quality and asset fidelity: the reference contains no photographic or product imagery. Its decorative pixel borders were intentionally omitted to preserve QueueMate's cleaner visual language and the user's earlier preference to avoid decorative iconography.
- Copy and content: all source product copy was replaced with QueueMate-specific request, pricing, progress, agent, and institution-rule content.
- Responsive behavior: the card grid stacks into four full-width cards at 430 px without overflow or clipped text.
- Interaction: the primary CTA resolves to `/register`; the route returned HTTP 200.
- Browser console: no warnings or errors were recorded during the final desktop capture.

## Comparison history

1. First comparison found a P2 proportion mismatch: the long QueueMate heading wrapped to four lines and produced a 532 px-tall section.
2. Fixed by shortening the second display line, enforcing a two-line heading, tightening card padding and type, and reducing vertical padding.
3. Post-fix evidence shows a 424 px-tall section with the same left/right composition, two-line headline, CTA placement, and 2 × 2 card rhythm as the 453 px source.

## Focused-region comparison

The 960 px side-by-side image keeps the headline, body copy, CTA, card labels, titles, descriptions, borders, and radii readable at native scale, so a separate focused crop was not needed.

## Follow-up polish

- P3: a subtle branded edge motif could be explored later if more decoration is desired, but it is not needed for fidelity or usability.

final result: passed
