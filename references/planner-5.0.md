# Planner 5.0 — Design Reasoning + Visual DNA

## Architecture

```text
SOURCE CONTENT
→ Narrative Intelligence
→ Evidence Topology
→ Art Direction Engine
→ Visual DNA
→ Motif Engine
→ Composition Solver
→ Template Capability Matching
→ Organic / Visual Asset Selection
→ Renderer
→ Structural QA
→ Visual DNA QA
→ Neighbor / Rhythm QA
```

Planner 4.0 remains the compatibility base. `plan-deck-v5.mjs` invokes it for stable narrative, evidence, source mapping, split/merge, headline, and rhythm fields, then adds the 5.0 reasoning layers. The retained `deck-plan-v4-base.json` makes this dependency inspectable.

## Required per-page delta

- `evidence_topology`: entities and relations that the page must communicate.
- `design_reasoning`: audience effect, energy, focal hierarchy, reading path, gravity, two-dimensional mass intent, intentional empty zone, whitespace intention, tension, and neighbor difference.
- `visual_dna_priors`: role-conditioned sample priors resolved through the declared fallback hierarchy. They are advisory.
- `motif_decision`: `none` or a semantically triggered motif with visual role, placement rationale, and passing removal test.
- `composition_solution`: normalized focal, headline, evidence, cluster, empty-zone, and asset bboxes plus anchor, scale, entry, overlap, spacing, tolerances, capacity, and solver status.
- `template_match`: selected T01-T23 render primitive, compatibility score, reasons, fit transform, and rejected alternatives.
- `asset_query` and `asset_selection`: semantic visual-asset requirements and a rights-cleared registry result.

## Failure and replan contract

`Composition Solver` returns `needs_content_replan` when hierarchy, citations, editability, and required whitespace cannot coexist at approved text sizes. `Template Capability Matching` returns `no_true_match` when no T01-T23 primitive supports the composition requirements. The renderer must stop in either case. It must never silently shrink content, invent a template, or choose the closest-looking page.

## Motif boundary

Absence can be intentional; decoration cannot. `primary_motif: none` incurs no penalty. When a motif exists, it requires a semantic trigger, explicit visual role, placement rationale, and a passing semantic-removal test.

## Prior boundary

The values in `visual-dna-priors.json` are observations from the 48-page reference sample. Resolve them by page role and motif role before broader fallbacks. A deviation creates review evidence, not a universal hard failure.

## Renderer boundary

The renderer consumes Composition Solver bboxes, capability-matched primitive, and registered asset selection. It may apply declared tolerances but must not independently decide the core composition. Text, charts, diagrams, and layout objects remain editable; an original organic visual may be an embedded image, but a complete slide may never be rasterized.

## QA boundary

Hard failures cover schema violations, missing motif semantics for a present motif, failed removal tests, impossible composition, focal overload, semantically unjustified full-field gradients, invalid asset rights, structural source loss, overlaps, and out-of-bounds objects. Visual DNA prior deviations and multi-feature neighbor similarity are warnings for review.
