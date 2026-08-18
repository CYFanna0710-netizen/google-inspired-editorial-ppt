# Style system

## Canvas and grid

- Use 16:9, 13.333 x 7.5 in (1280 x 720 design units).
- Safe margins: left/right 40 px, top 43 px, bottom 34 px.
- Use a 12-column grid with 12-17 px gutters. Prefer 6/6, 7/5, 5/7, 4/4/4, and 3/3/3/3.
- Align text, charts, cards, and tables to grid lines. Only backgrounds and mesh decoration may bleed.

## Tokens

| Token | Hex |
|---|---|
| canvas | `#F8F9FA` |
| panel | `#EEF0F3` |
| dark | `#202124` |
| primary | `#202124` |
| secondary | `#5F6368` |
| inverse | `#FFFFFF` |
| muted-line | `#DADCE0` |
| red | `#EA4335` |
| yellow | `#FBBC04` |
| green | `#34A853` |
| blue | `#4285F4` |
| violet | `#5B3DF5` |

Chapter gradients advance red-yellow, yellow-green, green-blue, blue-violet. Render each as one continuous native gradient with at least three stops. Never randomize the spectrum, use gradient body text, or imitate a gradient with adjacent rectangular color blocks.

Read `gradient-diffusion-system.md` before authoring any colored page.

## Typography

Use legally supplied Google Sans only when the user provides it. Otherwise use Inter for English, Noto Sans CJK SC for Chinese, with Arial and Microsoft YaHei as Office fallbacks. Keep one Latin and one CJK family per deck.

| Role | Size |
|---|---:|
| Cover | 72-104 pt |
| Chapter | 64-88 pt |
| Closing CTA | 56-72 pt |
| Super KPI | 48-66 pt |
| Quote | 27-34 pt |
| Statement | 40-52 pt |
| Slide title | 42-50 pt |
| Module title | 16-20 pt |
| Body | 13.5-15 pt |
| Chart label | 9-12 pt |
| Footnote | 5-7 pt |

Shorten or split before reducing type. Keep ordinary titles left aligned and at no more than 60% of slide width.

## Space and visual language

- Preserve at least 25% empty space; quote slides preserve 40-60%.
- Keep mesh decoration at least 24 px from content and crop 25-50% at an edge.
- Use at most one mesh focal asset per slide.
- Prefer flat editorial composition over UI panels. No glassmorphism, heavy shadows, 3D charts, emoji, or photo-card walls.
- Use original mesh assets from `assets/graphics/mesh/`; do not extract reference artwork.
- Treat the cropped organic mesh as the primary visual signature on ordinary pages. Reserve strong diffusion and full-canvas gradients for chapter fields, closing pages, and tightly controlled focal accents.
- Use monochrome icons or numbered circles. Use blue circle/white check for checklist items.

## Charts and images

- Lead with the conclusion number. Use gray tracks with yellow-green or green-blue data colors.
- Horizontal bars: 4-8 categories, labels left, values right.
- Donuts: one percentage each, at most three per slide.
- Matrices: at most 7 columns x 3 main rows.
- Preserve units, dates, sample scope, and source.
- Keep image aspect ratios. Prefer large crops or transparent subjects. Use small circular portraits only for attribution.
