# Visual Concept Intelligence MVP

## Position in the pipeline

Run this layer after Evidence Topology and before Art Direction. Treat the result as a visual sentence: a semantic relationship expressed through an object, an action, and a scale system. Do not treat it as a style label or template recommendation.

Planner 5.0 remains the default and immutable comparison path. The 6.0 MVP is an opt-in sidecar that reads a completed 5.0 deck plan and writes concept candidates. It does not call Composition Solver, template matching, asset selection, or Renderer.

## Candidate contract

Generate exactly three candidates per requested page. Each candidate must:

- use a distinct grammar and visual gesture;
- name one semantically linked Hero Object;
- encode the page's core relationship in area, width, position, distance, direction, density, layer priority, or figure-ground;
- define non-equal scale behavior when the content contains unequal values or stages;
- give color a semantic role;
- bind whitespace to a visible counterforce;
- state a memorable visual moment and explicit `do_not` conditions.

Reject a candidate that survives only as decoration after its semantic action is removed.

## Signal routing

- Route percentage metrics that form a whole to `ratio_composition`.
- Route four or more ordered actions to `process_transformation`.
- Route explicit wrong/right, before/after, or rejected/preferred framing to `contrast_translation`.
- Route unmatched pages to `thesis_emphasis`; mark the lower-confidence fallback in analysis.

Never route by page number or template ID.

## Scoring

Score semantic fit, relationship encoding, Hero clarity, scale contrast, color function, whitespace counterforce, neighbor difference, and execution feasibility. Use the weights in `visual-grammar-library.json`. Apply risk penalties only after the positive score is explicit.

Select the highest total. Preserve all candidates and score breakdowns for human review. An automatic winner is a planning recommendation, not aesthetic proof.

## MVP review boundary

Use `scripts/plan-concepts-v6.mjs` to generate candidates and `scripts/validate-visual-concepts.mjs` to validate them. Stop before rendering. Do not claim that a concept has improved the deck until Composition Solver and Renderer can execute it and a human has reviewed the rendered page.
