# Mode router

Choose one mode before planning or editing.

## Decision order

1. If the user says the structure, slide order, content, copy, or logic must not change, select `visual_only`.
2. If the user says to treat the source as a content library, rebuild the narrative, reorder, split, merge, rewrite, or not follow the original page sequence, select `full_rebuild`.
3. If no source deck exists and the user supplies a brief or outline, select `new_deck`.
4. If instructions conflict, apply the latest explicit instruction and record the selected mode in the work log.

## Scope matrix

| Operation | visual_only | full_rebuild | new_deck |
|---|---:|---:|---:|
| Change palette, type, spacing, images | yes | yes | yes |
| Replace production-note placeholders | yes | yes | n/a |
| Change slide order | no | yes | yes |
| Split or merge slides | no | yes | yes |
| Rewrite audience copy | no, except line-break-only | yes, meaning-preserving | yes |
| Add new claims | no | only from supplied evidence | only from supplied evidence/research |
| Preserve one-to-one slide mapping | required | no | n/a |

## Clarification threshold

Do not ask when the user's wording clearly matches a mode. Ask only when two possible modes would materially change the deliverable and no safe default exists.
