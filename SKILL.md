---
name: prismatic-mesh-editorial-ppt
description: Restyle and restructure an uploaded PowerPoint into a fixed enterprise editorial presentation system featuring white-space-led layouts, prismatic mesh visuals, oversized metrics, gradient data graphics, chapter pacing, content-aware template selection, and render-based QA. Use when a user uploads a PPTX and asks to redesign, restyle, reformat, rebuild, or convert it into this fixed presentation style while preserving facts, data, sources, and editable slide objects.
---

# Prismatic Mesh Editorial PPT

Transform an input PPTX into an editable 16:9 enterprise editorial deck. Preserve facts, data, qualifiers, quotations, sources, and asset provenance. Never copy Google logos, branded footer text, or unlicensed fonts.

## Required reading

Read the core references before building. Also read the emotional imagery reference whenever the deck contains brand, culture, mission, vision, lifestyle, or narrative-transition content:

- `references/style-system.md` for visual tokens and typography.
- `references/gradient-diffusion-system.md` for continuous gradients, diffuse color fields, and forbidden hard-block substitutes.
- `references/composition-logic.md` for page anatomy, grid logic, semantic layout decisions, and evidence-backed page families.
- `references/reference-geometry.md` for measured source-deck geometry and the eleven base composition families behind T01-T23.
- `references/visual-language.md` for image, color, and spatial decisions.
- `references/headline-rules.md` for topic-title detection and evidence-supported insight headlines.
- `references/rhythm-rules.md` for page-type ratios, climax placement, and sequence variation.
- `references/emotional-editorial-imagery.md` for editorial lifestyle image selection, artful crop systems, and E01-E07 emotional page patterns.
- `references/layout-library.md` for T01-T23 contracts.
- `references/matching-rules.md` for semantic classification and split/merge rules.
- `references/locked-rules.md` before planning and again before QA.
- `references/content-rules.md` for factual traceability.
- `references/qa-rules.md` for gates and remediation order.
- `references/visual-dna-priors.json` for advisory, role-conditioned priors. Never convert these sample observations into universal pass/fail thresholds.
- `references/template-capabilities.json` for T01-T23 execution capabilities. Templates are render primitives, never the source of art direction.
- `references/planner-5.0.md` for the Design Reasoning + Visual DNA pipeline, schema contracts, replan behavior, and validator boundaries.
- `references/visual-concept-intelligence.md` and `references/visual-grammar-library.json` only when the user explicitly requests the Planner 6.0 Visual Concept Intelligence MVP. Planner 5.0 remains the default comparison path.
- `references/template-capability-manifest.json` and `references/visual-grammar-template-map.json` whenever Planner 6.0 must evaluate the 23-page editable skeleton library. These files describe execution capability boundaries; they do not define art direction.

Also read and follow the installed `Presentations` skill, especially its content rules, JavaScript ES-module requirement, artifact-tool setup, and render-based QA.

## Inputs and outputs

Require an input `.pptx`. Accept optional logo, brand name, palette, licensed fonts, images, and audience notes. If only PDF is supplied, parse what is recoverable and state that editable chart data and object structure may be incomplete. Never invent a missing input.

Create a task workspace outside the project when possible. Keep these durable outputs:

```text
work/content-inventory.json
work/deck-plan.json
work/content-map.json
work/visual-dna-trace.json
work/qa-report.json
final-deck.pptx
```

## Workflow

1. Initialize artifact-tool resolution using the current Presentations skill's `setup_artifact_tool_workspace.mjs`.
2. Run `scripts/inspect-input.mjs --input <pptx> --work <work-dir>`.
3. Run `scripts/extract-assets.mjs --input <pptx> --out <work-dir>/assets`.
4. Review `content-inventory.json`; reject inventories containing master placeholder text, verify `parserVersion`, inspect every `needsReview` item, write each slide's communication job and one-sentence claim, assign semantic roles and evidence types, then verify all numbers, sources, quotations, notes, charts, tables, and images are represented.
5. Run `scripts/plan-deck-v5.mjs --inventory <inventory> --out <deck-plan>` for the default Planner 5.0 pass. It must execute Narrative Intelligence → Evidence Topology → Art Direction → Visual DNA → Motif Engine → Composition Solver → Template Capability Matching → Organic Asset Selection. Review `visual-dna-trace.json`, rejected template alternatives, motif removal tests, prior resolution, asset rights, and any `needs_content_replan` result. Use `scripts/plan-deck.mjs` only for an explicit Planner 4.0 compatibility or benchmark run.
5a. For an explicitly requested Planner 6.0 Visual Concept Intelligence MVP review, keep the 5.0 plan immutable and run `scripts/plan-concepts-v6.mjs --plan <deck-plan-v5> --pages <comma-separated-pages> --out <visual-concepts.json>`. Generate exactly three grammar-distinct candidates per page and validate them with `scripts/validate-visual-concepts.mjs`.
5b. If the user explicitly requests a Planner 6.0 template-capability planning test, preserve this order: communication goal → semantic relationship → visual action → visual concept → required capabilities → capability matching. Read `template-capability-manifest.json` and `visual-grammar-template-map.json`; run `scripts/validate-template-capability-manifest.mjs`; use `scripts/lib/template-capability-matcher-v6.mjs` only after the visual concept exists. A conditional match is not selectable while required capabilities are missing. Emit `renderer_capability_gap` instead of substituting an equal card, column, checklist, or nearest content-type template. Stop before Composition Solver, Renderer, or PPTX generation unless the user separately authorizes those gates.
6. Apply mandatory split rules before art direction. Merge only content sharing one conclusion. Preserve a source-slide array and deletion rationale on every output page. Never begin with a template ID: art direction must produce spatial requirements; the capability matcher may then select one of T01-T23 as an execution primitive.
6a. For low-density brand or narrative pages, write `imageIntent` records and choose one E01-E07 pattern before sourcing images. Keep analytical pages under the Google ROI structural system.
6b. Run `scripts/validate-schemas.mjs --work <work-dir>` after planning and again after any manual JSON edit. Do not build from schema-invalid intermediate files.
6c. Run `scripts/validate-plan.mjs --work <work-dir>`. Resolve every missing evidence contract, synthetic chapter boundary, and low-confidence decision before building.
7. Run `scripts/build-deck-v5.mjs --plan <deck-plan> --output <final-deck.pptx> --work <work-dir>` for Planner 5.0. The renderer must consume the Composition Solver bboxes and matched primitive; it must not independently redesign the page. Use `scripts/build-deck.mjs` only with a 4.0 plan.
8. Run `scripts/render-deck.mjs --input <final-deck.pptx> --out <work-dir>/rendered`.
9. Run all validators with the same work directory: schemas, plan, content, layout, fonts, images, editability, and rhythm. Run `scripts/validate-editability.mjs --input <final-deck.pptx> --work <work-dir>` after rendering.
9a. Run `scripts/validate-style.mjs --input <final-deck.pptx> --work <work-dir>` and reject chapter pages built from adjacent solid rectangles.
9b. Run `scripts/validate-aesthetic.mjs --input <final-deck.pptx> --work <work-dir>` and review every aesthetic warning before delivery.
9c. For Planner 5.0, run `scripts/validate-visual-dna.mjs --work <work-dir> --rendered <work-dir>/rendered` and `scripts/validate-neighbor-rhythm-v5.mjs --work <work-dir>`. Motif absence is never an error. A present motif without a semantic trigger, visual role, or passing removal test is a critical error. Prior deviations remain warnings.
10. Run `scripts/compile-qa.mjs --work <work-dir> --out <work-dir>/qa-report.json`.
11. Inspect every rendered slide at full size and the montage for pacing. Fix every critical error and rerun build, render, and QA until critical errors equal zero.
12. For Planner 5.0 regression, run `scripts/run-v5-benchmarks.mjs --out <benchmark-dir>`. It creates shared enterprise-strategy, AI-industry-research, and investment-analysis fixtures, generates both 4.0 and 5.0 PPTX files, runs structural and visual QA, emits per-slide traces, and builds side-by-side review packs. Inspect all contact sheets and at least five full-size representative comparisons per deck.

## Generator contract

- Use JavaScript ES modules and `@oai/artifact-tool`; never use `python-pptx` as the generator.
- Keep text, tables, charts, shapes, and icons editable. A mesh decoration may be an original SVG/PNG asset; never rasterize the whole slide.
- Use exactly one T01-T23 template ID per output page and vary silhouettes across sequences.
- Keep the T01-T23 count fixed. Select templates only after Composition Solver output through `template-capabilities.json`; if no primitive fits, return to content planning instead of forcing a layout.
- The inspected 23-page skeleton is `assets/templates/base-template-23p-capability-source.pptx`. Treat its objects as source-slide-local primitives. Never modify this source file in place and never infer a semantic capability from the mere presence of columns or cards.
- Organic assets must come from `assets/organic/asset-registry.json` or another rights-cleared registry with equivalent metadata. A request such as `mesh: true` is invalid; plan an asset query with family, palette, role, entry edge, and crop behavior.
- Keep one primary claim and one visual focal point per slide.
- Use the user reference only for design-system evidence, not as a copied page background.
- Reproduce the reference's continuous color atmosphere, not literal brand artwork: use native continuous gradients, soft radial diffusion, and edge mesh. Never simulate a gradient with adjacent solid-color blocks.
- Use CHANDON-derived emotional imagery logic only as a compositional grammar. Never copy its photographs, brand masks, logo, wordmark, or exact pages.
- Preserve source mappings in `content-map.json` and retain `content-inventory.json`, `deck-plan.json`, and `qa-report.json`.
- Fail explicitly when critical content or editability cannot be preserved.

## PDF-only branch

Use PDF extraction only for text, images, and visible structure. Record `recoverability: partial` for charts/tables without native data. Do not imply that rasterized PDF elements became editable.

## Delivery gate

Deliver only when all schemas validate, the PPTX opens, every slide renders, serious errors are zero, the font scan is clean, all source numbers are accounted for, and the output contains editable slide objects.
