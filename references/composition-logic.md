# Composition and layout logic

This reference distills the layout logic visible in the 48-page `google_cloud_roi_of_ai_2025.pdf` reference. Page numbers below are evidence pointers, not templates to copy.

## Page anatomy

Build every page from five ordered layers:

1. **Persistent chrome** — discreet page number/source/footer only. It must not become a title bar.
2. **Headline zone** — the compositional anchor, normally left aligned and occupying roughly 45-60% of the canvas width. Cover and chapter titles may occupy 60-75%.
3. **Evidence zone** — the chart, metric, comparison, quotation, or image that proves the claim.
4. **Interpretation zone** — the minimum prose needed to connect evidence to the decision.
5. **Atmosphere layer** — diffuse gradient or edge mesh. It establishes movement and chapter identity; it never substitutes for evidence.

Reference evidence: cover p1; executive summary p2; dark insight page p3; background p4; contents p6; claim/KPI/definition p8; split evidence p14 and p17; closing p48.

## Dominant-axis rule

- Establish one dominant left axis per slide. Align the title, first body block, chart label, and conclusion to it unless a deliberate split begins.
- Use one secondary axis inside the evidence zone. Do not create a new alignment for every object.
- Titles are page objects, not headers. Avoid centered title bands and full-width title bars.
- Keep ordinary titles to two lines. If a title needs three lines, shorten it or allocate a lower-density silhouette.
- Put the title in the upper 10-22% of the page; put primary evidence in the central 25-78%; keep source/footer material in the bottom 8%.

## Grid grammar

Use an implicit 12-column grid with generous outer margins. Recurring structural ratios are:

- **6/6** for balanced explanation plus evidence.
- **5/7** when the evidence or chart is dominant.
- **7/5** when the narrative or claim is dominant.
- **4/4/4** only for genuinely peer-level comparisons.
- Narrow repeated columns only for a matrix with shared measures.

Text columns must remain narrow enough to scan. A full-width region is reserved for a single claim, quotation, chapter title, matrix, or intentionally panoramic visual.

## Semantic layout selection

Choose the silhouette from the communication job, not from visual variety:

| Communication job | Evidence shape | Composition family | Preferred templates |
|---|---|---|---|
| Establish topic or thesis | title + optional subtitle | headline-led / low density | T01, T04 |
| Transition chapter | chapter number + title | full-canvas atmospheric transition | T07 |
| Summarize several findings | short prose + one dominant KPI | asymmetric editorial summary | T02, T08 |
| Compare three peer stages/options | equal evidence blocks | 4/4/4 comparison | T09, T12 |
| Explain one chart | narrative + chart | 5/7 split evidence | T13, T18 |
| Show one decisive number | one KPI + short implication | super-KPI silhouette | T20 |
| Present 5-7 comparable measures | repeated cells/columns | overview or matrix | T14, T17 |
| Let a voice or conclusion breathe | quotation + attribution | low-density quote page | T10, T11 |
| Prove a case | objective/action/result/quote or source images | case-proof grid | T19 |
| Close with action | checklist or CTA | action page / atmospheric close | T22, T23 |

## Evidence hierarchy

Read order must be visible without narration: claim, dominant number/chart/quote/case artifact, interpretation, qualifier and source. Do not give all four equal weight.

Dark panels are evidence containers, as in the chart and data pages around p14, p17, p26, p28, p31, p33, and p36. They are not decorative half-page color blocks.

## Density and pacing

- Label each page low, medium, or high density before layout selection.
- Use low density for cover, chapter transition, quotation, super KPI, and closing pages.
- Insert a low-density reset after roughly 2-4 medium/high-density pages.
- Never place three high-density pages consecutively.
- Do not repeat the same two-column or card grid more than twice.
- A chapter should normally move: transition -> claim/context -> evidence -> proof/case -> implication/action.

Reference evidence: p7, p21, p38, and p46 are chapter resets; p10 is a quote reset; p24 is a metric overview; p25, p27, p30, p32, p34, and p37 are case-proof pages.

## Split and merge decisions

Split when any condition is true:

- More than one independent conclusion.
- A chart needs explanation plus more than two supporting metrics.
- More than seven peer metrics or more than three comparison columns.
- A quotation, case artifact, or image would become decorative because the page is already full.
- The title must shrink below the style minimum to make the content fit.

Merge only when inputs support the same one-sentence claim and share the same evidence hierarchy. Never preserve a one-source-slide to one-output-slide mapping merely for convenience.

## Image and chart placement

- Treat source images as evidence: large crop, before/after pair, or restrained case strip. Avoid photo walls.
- Do not overlay body text on evidence imagery unless the image has a deliberately empty field.
- Give charts the larger side of a 5/7 split and keep axes and labels editable.
- One chart equals one conclusion. If two charts answer different questions, split them.

## Forbidden shortcuts

- Decorative 50/50 color split without an evidence reason.
- Equal cards for content that is not peer-level.
- Repeated dashboard tiles for narrative material.
- Centered heading plus evenly scattered objects.
- Full-width paragraphs.
- A large gradient rectangle used as a container for ordinary prose.
- Squeezing content into a template instead of splitting the claim.

## Planning SOP

Record these fields before rendering every output slide: `communicationJob`, `coreClaim`, `semanticRole`, `evidenceType`, `density`, `compositionFamily`, `templateId`, `primaryAxis`, `sourceSlides`, and `retainedEvidence`.

Reject a plan when its composition family cannot be justified from the communication job and evidence type.
