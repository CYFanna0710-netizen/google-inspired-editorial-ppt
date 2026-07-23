---
name: google-inspired-editorial-ppt
description: Create, rebuild, or visually restyle PowerPoint decks into a restrained Google-inspired enterprise editorial system with magazine-like photography, strong whitespace, continuous spectral or warm-neutral color atmospheres, editable objects, content traceability, and render-based QA. Use for .pptx requests that ask for Google-style, premium business, editorial, magazine, clean, restrained, AI/technology, brand, product, or consulting presentation design, including both structure-preserving visual-only restyles and full narrative rebuilds.
---

# Google-Inspired Editorial PPT

Produce an editable 16:9 business deck that combines Google-inspired information hierarchy with premium editorial imagery. Treat the reference as design evidence, never as permission to copy Google logos, branded footer text, proprietary artwork, or unlicensed fonts.

## Required companion skill

Read and follow the installed `Presentations` skill before editing or generating a deck. Use JavaScript ES modules and `@oai/artifact-tool` for the primary PPTX implementation. Use OOXML-only helper scripts solely for inspection, validation, or deterministic z-order repair.

## Route the request first

Read `references/mode-router.md` and select exactly one mode:

- `visual_only`: preserve slide count, page order, visible audience copy, data, and content structure. Change imagery, palette, typography, spacing, crops, and visual atmosphere only.
- `full_rebuild`: treat the source as a business-content library. Reorder, split, merge, or rewrite only within the user's authorization while preserving facts and provenance.
- `new_deck`: build from a supplied brief or outline without inventing business facts.

Do not silently switch modes. If the latest user instruction conflicts with an earlier one, the latest instruction wins.

## Required reading by mode

Always read:

- `references/style-system.md`
- `references/content-rules.md`
- `references/image-strategy.md`
- `references/layering-and-editability.md`
- `references/qa-rules.md`
- `references/locked-rules.md`

For `visual_only`, also read `references/visual-only-mode.md`.

For `full_rebuild` or `new_deck`, also read:

- `references/full-rebuild-mode.md`
- `references/composition-logic.md`
- `references/layout-library.md`
- `references/matching-rules.md`
- `references/gradient-diffusion-system.md`
- `references/emotional-editorial-imagery.md`

## Workspace and durable outputs

Follow the `Presentations` skill workspace rules. Retain:

```text
work/content-inventory.json
work/production-notes.json
work/deck-plan.json
work/content-map.json
work/rendered/
work/qa-report.json
final-deck.pptx
```

In `visual_only`, `deck-plan.json` must remain one-to-one with the source slide order. In `full_rebuild`, every output slide must record `sourceSlides` and retained evidence.

## Core workflow

1. Inspect the source with `scripts/inspect-input.mjs --input <pptx> --work <work-dir>`.
2. Extract native assets with `scripts/extract-assets.mjs --input <pptx> --out <work-dir>/assets`.
3. Scan internal production language with `scripts/detect-production-notes.mjs --inventory <work-dir>/content-inventory.json --out <work-dir>/production-notes.json`.
4. Review every slide at full size. Separate audience content from comments, TODOs, image prompts, editor instructions, and placeholders.
5. Select the mode and style branch. Write a page-level visual plan before implementation.
6. Source visuals in this order: original project images, supplied brand assets, licensed/public imagery, then image generation for genuinely missing cases.
7. Build with artifact-tool. Keep text, tables, charts, shapes, icons, and page furniture editable.
8. If imported objects obscure new editable overlays, repair z-order with `scripts/ooxml-zorder.py`; do not rasterize the whole slide as the first response.
9. Render every page and create a montage. Inspect both full-size slides and deck-level pacing.
10. Run preservation and QA scripts. Fix real critical errors, then rerender and retest.
11. Deliver the PPTX plus the content map or modification ledger when the user requests supporting files.

## Style branches

Choose one coherent branch per deck:

- `spectral_enterprise`: cool neutral canvas, near-black type, controlled continuous red-yellow-green-blue-violet diffusion, analytical and technology-oriented.
- `warm_editorial`: warm off-white canvas, charcoal type, restrained amber/copper accent, architectural or material photography, premium magazine mood.
- `dark_cinematic`: near-black canvas with warm-neutral photography and sparse light type; reserve for cover, chapter, manifesto, invitation, or closing pages.

Mix branches only as an intentional chapter system. Do not turn the deck into a collection of unrelated styles.

## Visual-only invariants

For `visual_only`:

- Keep source slide count and order unchanged.
- Keep visible business copy and numerical evidence unchanged except for line-break-only adjustments.
- Keep the original communication job of every slide.
- Do not merge, split, add, or delete audience-facing sections.
- Visually hide or replace production notes, empty image prompts, and internal editor instructions.
- Record every intentionally hidden item in `content-map.json`.
- Allow cover, chapter, manifesto, invitation, and closing pages to become full-bleed editorial compositions while keeping their source copy present.

Run `scripts/validate-visual-preservation.mjs --source <input.pptx> --output <final.pptx> --notes <production-notes.json> --out <work-dir>/qa-preservation.json`.

## Full-rebuild invariants

For `full_rebuild`:

- Preserve facts, numbers, units, dates, qualifiers, quotations, sources, and asset provenance.
- Split pages when two independent conclusions compete.
- Merge only when evidence supports one shared claim.
- Choose the composition family from the communication job before selecting T01-T23.
- Keep one primary claim and one visual focal point per page.
- Preserve source-to-output mappings and deletion rationales.

## Image rules

- Use images as evidence or atmosphere, not filler.
- Prefer large intentional crops, before/after pairs, material strips, process scenes, architectural context, and restrained editorial sequences.
- Do not reuse the same image more than once unless it is a deliberate background reprise.
- Generate images without embedded text, logos, or UI unless the task explicitly requires them.
- Keep a consistent color temperature and photographic treatment within each section.
- Never expose an image-generation prompt or production instruction to the audience.

## Editability and layer contract

- Keep audience text native and editable.
- Keep charts and tables native whenever their data is recoverable.
- Do not bake editable copy into generated images.
- Do not use full-slide rasterization to conceal layout problems.
- Permit a composited background image only when it contains no audience copy and the editable copy remains above it.
- Use `scripts/ooxml-zorder.py` for named-element front/back repair after artifact-tool export.

## QA gate

Run:

```text
validate-schemas.mjs
validate-visual-preservation.mjs   # visual_only
validate-content.mjs               # full_rebuild/new_deck
validate-layout.mjs
validate-fonts.mjs
validate-images.mjs
validate-rhythm.mjs
validate-style.mjs
compile-qa.mjs
slides_test.py
unzip -t
```

Automated warnings are evidence, not verdicts. Inspect their exact target before changing the deck. Do not “fix” a mode-specific false positive by violating the user's request—for example, do not reorder a visual-only deck merely to satisfy a rhythm heuristic.

Deliver only when the PPTX opens, every page renders, slide bounds are clean, serious visual defects are zero, visible content matches the selected mode, and unresolved placeholders are disclosed.
