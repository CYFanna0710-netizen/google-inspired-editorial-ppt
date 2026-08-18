# Google ROI 2025 reference geometry

Use this file when selecting or implementing a layout. Measurements come from the 48-slide source PPTX, whose native frame is 2110.67 x 1187.33 px. Normalize geometry to the Skill canvas by multiplying coordinates by approximately 0.6065.

## Measured constants

- Ordinary left edge: 55-65 source px, or 34-40 design units.
- Ordinary right edge: 60-75 source px, or 36-46 design units.
- Primary title size: commonly 66 rendered px, approximately 49.5 pt in PowerPoint.
- Body size: commonly 18.67 rendered px, approximately 14 pt.
- Large quotation size: commonly 37.33-44 rendered px, approximately 28-33 pt.
- Page number size: approximately 16.5 pt in the source export; use a discreet 8-10 pt equivalent when removing branded footer chrome.
- Ordinary pages are predominantly neutral. Saturated color normally occupies less than one third of the canvas unless the page is a chapter divider.

## Base composition families

The 23 production template IDs are variants of these measured families. Do not treat every ID as an unrelated layout.

| Family | Reference pages | Measured silhouette | Production variants |
|---|---|---|---|
| F01 Opening thesis | 1, 4, 6 | oversized left headline, large neutral field, edge mesh | T01, T04, T06 |
| F02 Editorial summary | 2 | large title left, two prose columns, narrow KPI rail | T02 |
| F03 Insight columns | 3, 24 | five narrow peer columns, shared top axis, minimal card chrome | T03, T17 |
| F04 Chapter field | 7, 21, 38, 46 | full-canvas continuous gradient, small chapter number, oversized white title | T07 |
| F05 Claim and definition | 8, 19 | dominant claim left, KPI/definition or checklist evidence right | T08, T15 |
| F06 Framework and matrix | 9, 13, 16, 23 | three or five peer modules with shared measures | T09, T12, T14, T16 |
| F07 Voice and authority | 10-12, 15, 18, 20, 29, 35, 42 | quotation-led page or 5/7 explanation-plus-quote split | T10, T11 |
| F08 Split evidence | 14, 17, 26, 28, 31, 33, 39-45 | neutral narrative side plus dark evidence side; dark region is functional | T13, T18, T21 |
| F09 Metric proof | 22, 25, 36, 40 | one dominant metric or compact metric stack | T17, T20 |
| F10 Case proof | 27, 30, 32, 34, 37 | two large top evidence fields plus a low horizontal quotation rail | T19 |
| F11 Action close | 47, 48 | two broad checklist fields or minimal dark CTA | T22, T23 |

## Geometry contracts

### F02 Editorial summary

- Title: left 3.1%, top 22-25%, width 28-34%.
- Prose columns: begin around 45% page height; two columns of roughly 31% and 34% width.
- KPI rail: rightmost 22-25%; one large number, one short interpretation, one source line.
- Mesh: crop from the upper-left edge. Never place it behind the KPI.

### F08 Split evidence

- Split at 50-55% of canvas width depending on evidence complexity.
- Light side: one title, one conclusion paragraph, optional quotation or one KPI.
- Dark side: chart title above chart; source below chart; no decorative prose.
- The split is justified only when the dark side contains real evidence.

### F10 Case proof

- Top evidence region occupies about 58-64% of page height.
- Left top field contains objective and action; right top field contains 2-4 outcome metrics.
- Bottom rail contains one quotation, one portrait, attribution, and optional authentic logo.
- Avoid a 2 x 2 grid. The quotation rail must visually connect the case to a human authority.

### F11 Checklist

- One large title above two broad pale fields.
- Each field contains 3-4 actions, not a stack of separate rounded cards.
- Bold the action phrase and keep the explanation inline.

## Selection rule

Choose a family from the communication job and evidence topology. Choose a T-template only after the family is justified. Page sequence, odd/even index, and modulo arithmetic are forbidden template-selection inputs.
