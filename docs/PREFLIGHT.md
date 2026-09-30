# Pre-flight (design-taste-frontend)

Design read: editorial museum storytelling page for a design-literate audience, dark natural-history language, GSAP scroll choreography over canvas ASCII, custom type. Dials: VARIANCE 8, MOTION 7, DENSITY 3 (editorial, Awwwards-leaning; motion kept restrained per brief).

Deliberate deviations from the skill's defaults, because the brief overrides them:
- **Motion library:** GSAP + Lenis instead of Motion (brief requires GSAP, ScrollTrigger, SplitText).
- **Pure #000000 / #FFFFFF:** used because they are in the brief's core palette.
- **Dark only:** the brief defines a dark palette; the one light chapter is a deliberate theme switch, allowed once per page.
- **Mono uppercase labels:** used as museum catalogue lines at the end of chapters, not as eyebrows above headings.
- **Vertical text:** only the era label on the desktop depth gauge, where it saves margin width.
- **Hand-drawn SVG:** only pixel sprites (runner, cactus, footprint) built from bitmaps; they are the concept, not decoration.

| Check | Result |
|---|---|
| Zero em dashes in visible text | Pass |
| One theme per page, one deliberate switch | Pass (the white Sue chapter) |
| One accent, locked | Pass (amber: numerals, depth readout, meteor, ASCII eyes) |
| One radius system | Pass (0 everywhere) |
| Hero fits viewport, headline at most 2 lines on desktop, subtext at most 20 words | Pass (7 words) |
| Hero stack at most 4 elements | Pass (headline, subtext) |
| No scroll cue, no section counters, no version labels | Pass |
| Zigzag cap (at most 2 image and text splits in a row) | Pass (no two chapters share a layout) |
| Real numbers only | Pass (each chapter cites its source) |
| No duplicate CTA intent | Pass (one action: Return to the surface) |
| Motion motivated | Pass (see BRIEF.md, one sentence per device) |
| No scroll listeners, ScrollTrigger only | Pass |
| Reduced motion | Pass (no Lenis, no pins, no intro, no clipping) |
| 100dvh/svh for full-height sections | Pass |
| Animations cleaned up on unmount | Pass (useGSAP + matchMedia revert) |
| Images: responsive AVIF + WebP, sized per layout | Pass |
| Mobile collapse explicit per section | Pass (4 / 8 / 12 grid in sections.css) |
