# Content rules

- Preserve every factual number, sign, percentage, currency, unit, date, multiplier, qualifier, and cited source.
- Record each output slide's `sourceSlides` and each retained claim's provenance.
- Never add a commercial fact, customer result, quotation, person, title, organization, source, or dataset absent from input.
- Preserve complete quotation attribution: speaker, title, and organization when supplied.
- Preserve chart categories, series, values, units, time range, sample scope, and source.
- Keep source footnotes in a dedicated area. Never delete a source solely to fit layout.
- Mark uncertain extraction as `needsReview`; do not silently repair it.
- For every removed or compressed item, record text and reason in `removedOrCondensed`.
- Treat the original deck as content evidence, not as a visual template.
- Generate `content-map.json` from the plan with source-to-output traceability.
- Parse slide XML, slide relationships, notes, chart caches, and table cells from the actual slide package. Never use master/layout placeholder strings as visible content.
- Give every extracted image a source-slide relationship, media filename, and recoverability status.
- Put uncertain quote attribution, missing media relationships, empty chart caches, and PDF-only structures in `needsReview`; resolve or disclose them before delivery.
