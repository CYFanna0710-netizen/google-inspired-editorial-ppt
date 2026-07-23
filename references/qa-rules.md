# QA rules

## Severity

- `critical`: overflow, occlusion, broken/missing glyph, word split, data mismatch, stretched image, missing source, page-order error, copied Google logo, unreadable PPTX, or rasterized full slide.
- `major`: off-grid alignment, wrong template density, unsupported font, insufficient breathing-page cadence, or incorrect dark-page ratio.
- `minor`: small spacing, alignment, or consistency deviation that does not impede reading.

## Gates

1. Validate schemas and required intermediate files.
2. Compare input/output numeric tokens and source identifiers.
3. Validate chart values against displayed KPI values.
4. Scan bounds, overlaps, title wrapping, padding, gutters, and template alignment.
5. Scan fonts against the approved list and flag missing/substituted families.
6. Check image dimensions, effective resolution, crop declarations, and aspect-ratio preservation.
7. Check template repetition, density runs, chapter completeness, dark-page ratio, and breathing-page intervals.
8. Render every slide, inspect each at full size, and inspect the montage for pacing.
9. Run the style validator and visually reject adjacent-solid-rectangle gradient substitutes, rectangular color seams, and missing diffusion on chapter pages.
10. For emotional editorial pages, verify image-bundle coherence, intentional cropping, subject safety, native text editability, and relevance to the slide's narrative job.
11. Fail input inspection when master placeholder instructions, theme-font labels, or object names are mistaken for slide content.
12. In `visual_only`, compare source and output slide count, order, visible audience text, and numerical evidence after excluding reviewed production notes.
13. Scan rendered pages for visible TODOs, image prompts, generation instructions, editor comments, and unresolved placeholders.
14. Verify named foreground objects remain above full-bleed photography after export.

Pass only when `criticalCount` is zero. Fix content/data first, then overflow/overlap, typography, imagery, alignment, and rhythm. Rebuild and rerender after fixes.

## Mode-aware severity

- In `visual_only`, missing or changed audience copy, reordered pages, changed slide count, and visible production notes are critical.
- In `full_rebuild`, missing source mappings, invented claims, unsupported merges, and lost evidence are critical.
- Font warnings inherited from the source are major only when the final file renders incorrectly or uses an unavailable/unlicensed font.
- Rhythm warnings are advisory in `visual_only` if fixing them would require structural changes.
- Low-resolution files are advisory when they are tiny logos or icons used at safe effective resolution; inspect actual placement before escalation.
