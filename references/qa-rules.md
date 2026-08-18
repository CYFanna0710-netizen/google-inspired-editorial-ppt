# QA rules

## Severity

- `critical`: overflow, occlusion, broken/missing glyph, word split, data mismatch, stretched image, missing source, page-order error, copied Google logo, unreadable PPTX, or rasterized full slide.
- `major`: off-grid alignment, wrong template density, unsupported font, insufficient breathing-page cadence, low-confidence planning, or excessive dark-page use.
- `minor`: small spacing, alignment, or consistency deviation that does not impede reading.

## Gates

1. Validate schemas and required intermediate files.
2. Validate the plan's evidence contracts, composition family, primary axis, confidence, and chapter boundaries.
3. Compare input/output numeric tokens and source identifiers.
4. Validate chart values against displayed KPI values.
5. Scan bounds, overlaps, title wrapping, padding, gutters, and template alignment.
6. Scan fonts against the approved list and flag missing/substituted families.
7. Check image dimensions, effective resolution, crop declarations, and aspect-ratio preservation.
8. Check silhouette repetition, density runs, chapter completeness, justified dark evidence, and breathing-page intervals.
9. Render every slide, inspect each at full size, and inspect the montage for pacing.
10. Run the style validator and visually reject adjacent-solid-rectangle gradient substitutes, rectangular color seams, habitual diffuse backgrounds, and missing continuity on chapter pages.
11. For emotional editorial pages, verify image-bundle coherence, intentional cropping, subject safety, native text editability, and relevance to the slide's narrative job.
12. Fail input inspection when master placeholder instructions, theme-font labels, or object names are mistaken for slide content.
13. Run `validate-aesthetic.mjs` after rendering. Review over-templating, topic-title overuse, excessive decoration, missing visual climax, density imbalance, and consecutive family or visual-strategy stasis.
14. For decks of 10 pages or fewer, confirm one visual climax, one strong data page, and one synthesis or action page. A metadata label is insufficient: the chosen climax must use a visibly distinct composition or evidence treatment.

Pass only when `criticalCount` is zero. Fix content/data first, then overflow/overlap, typography, imagery, alignment, and rhythm. Rebuild and rerender after fixes.
