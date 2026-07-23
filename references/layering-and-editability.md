# Layering and editability

## Object contract

Keep audience copy, titles, captions, charts, tables, labels, icons, page numbers, and source lines editable. Background textures and generated photography may be raster assets.

## Imported-deck z-order problem

Some PPTX import/export paths place newly added shapes behind existing source objects or full-slide pictures. Detect this by rendering; do not assume creation order equals visual order.

Remediation order:

1. Use native `bringToFront` or `sendToBack` when the export path preserves it.
2. Name important shapes deterministically, such as `cover-title`, `editorial-background`, or `contact-card`.
3. Export the PPTX and run `scripts/ooxml-zorder.py` to move named shapes within the slide's `<p:spTree>`.
4. Rerender the affected slides and inspect at full size.
5. If the exporter cannot preserve a native object at all, rebuild only the affected object or page through a more reliable native path.

Do not bake audience copy into a full-slide image merely to defeat z-order. Rasterized text is a last-resort defect, not a normal workflow.

## OOXML z-order model

Within `<p:spTree>`, later drawable elements appear in front. Preserve the required non-drawable group metadata at the beginning. Move only complete drawable child elements whose non-visual name matches an explicit rule.

## Safety

Write repaired decks to a new file unless the caller explicitly passes the same output path. Validate with `unzip -t`, render all slides, and run overflow checks after repair.
