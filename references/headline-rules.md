# Headline Intelligence Engine

Treat the headline as the page's conclusion, not its filing label.

## Headline types

### Topic title

A noun phrase that names a subject but does not tell the audience what to conclude.

Examples: `AI agent adoption`, `Investment trends`, `Customer experience`, `Security`.

Use only for covers, contents, methodology labels, appendix pages, or intentionally neutral navigation.

### Insight headline

A complete claim that states a conclusion, trend, tension, implication, or decision value.

Examples:

- `AI agents have rapidly emerged as the next competitive frontier`
- `Early adopters are converting agent investment into measurable returns`
- `Executive sponsorship separates isolated pilots from scaled value`

Use for substantive narrative, data, evidence, case, risk, and synthesis pages.

## Priority order

Prefer a headline that expresses, in order:

1. A supported conclusion.
2. A directional trend.
3. A decision-relevant implication.
4. A contrast or tension.
5. A neutral topic only when the source provides no defensible claim.

## Rewrite workflow

1. **Classify the source title.** Mark it `topic`, `insight`, `navigation`, or `unknown`.
2. **Extract evidence.** Read the first complete source claim, chart conclusion, metric direction, qualifier, and source.
3. **Write the audience takeaway.** Complete: `After this page, the audience should believe that ...`
4. **Draft two candidates.** One conclusion-led and one decision-led.
5. **Select the strongest supported candidate.** Do not add causality, urgency, scale, leadership, or business value absent from the source.
6. **Fit the geometry.** Prefer 7-16 English words or 12-28 Chinese characters. Allow two lines; never shrink below the title minimum.
7. **Preserve the source title.** Store it as `sourceTitle`; store the selected visible title as `headline`.
8. **Flag uncertainty.** If no complete source claim supports a rewrite, retain the topic title and set `headline_type: topic` plus a review item.

## Safe transformations

- Topic + explicit trend sentence -> use the trend sentence as the headline.
- Topic + comparison data -> state the visible comparison without inventing a cause.
- Topic + single KPI -> express what the KPI demonstrates, preserving unit, population, and qualifier.
- Case label + outcome -> state the outcome and keep the organization or case detail in the body.
- Risk label + evidence -> state the risk and its decision implication without alarm language.

## Forbidden transformations

- Turning correlation into causation.
- Adding `rapidly`, `leading`, `critical`, `proven`, or `transformative` without source support.
- Removing qualifiers such as `surveyed`, `early adopters`, `on average`, or date scope.
- Writing a slogan that cannot be traced to visible evidence.
- Repeating the same grammatical opening on three consecutive pages.
- Using colons to disguise a topic label as an insight headline.

## Planner output

Record `sourceTitle`, `headline`, `headline_type`, `headline_evidence`, and optional `headline_alternatives`. Visible slide text uses `headline`; content QA preserves `sourceTitle` in the traceability map.
