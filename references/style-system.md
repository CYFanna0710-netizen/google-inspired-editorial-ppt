# Combined style system

## Design thesis

Combine Google-inspired clarity, evidence hierarchy, continuous color atmosphere, and systematic grids with magazine-like photography, artful cropping, typographic restraint, and deliberate pacing.

The result must feel editorial rather than like a software dashboard. Avoid pills, card walls, fake controls, glossy gradients, and repeated UI modules.

## Canvas and grid

- Use 16:9, 13.333 x 7.5 inches, or 1280 x 720 design units.
- Use outer margins near 6-8% of canvas width on text-led pages.
- Use a 12-column grid with one dominant left axis and at most one secondary evidence axis.
- Permit edge bleed only for backgrounds, photography, gradient atmosphere, and intentional crops.
- Keep ordinary titles in the upper 10-22% of the page and footnotes in the bottom 8%.

## Branch A: spectral enterprise

| Token | Hex |
|---|---|
| canvas | `#F8F9FA` |
| panel | `#EEF0F3` |
| dark | `#202124` |
| primary | `#202124` |
| secondary | `#5F6368` |
| line | `#DADCE0` |
| red | `#EA4335` |
| yellow | `#FBBC04` |
| green | `#34A853` |
| blue | `#4285F4` |
| violet | `#5B3DF5` |

Use continuous spectral gradients as atmosphere, not literal Google branding. Keep 70-85% of ordinary pages neutral.

## Branch B: warm editorial

| Token | Hex |
|---|---|
| canvas | `#F2EFE8` |
| paper-light | `#F8F5EF` |
| charcoal | `#23211F` |
| ink | `#1B1A18` |
| secondary | `#756F67` |
| line | `#D8D0C5` |
| amber | `#C89146` |
| pale-amber | `#E7C89A` |
| stone | `#C9C2B7` |

Use warm off-white pages, charcoal typography, thin amber rules, restrained architectural or material imagery, and sparse dark narrative pages.

## Branch C: dark cinematic

Use `#171614` to `#262320` as the base. Pair with white, stone, or pale-amber type. Reserve for cover, chapter, manifesto, invitation, and closing pages. Keep body copy short and contrast high.

## Typography

Use supplied licensed fonts when available. Otherwise use:

- English: Inter, Aptos, Arial.
- Chinese: Noto Sans CJK SC, Microsoft YaHei, PingFang SC, or another installed licensed CJK sans.

Keep one Latin and one CJK family per deck.

| Role | Recommended size |
|---|---:|
| Cover | 50-72 pt for mixed-language business decks; larger when title is short |
| Chapter | 44-64 pt |
| Closing CTA | 40-56 pt |
| Super KPI | 48-66 pt |
| Quote / manifesto | 28-42 pt |
| Slide title | 26-35 pt |
| Module title | 16-20 pt |
| Body | 12.5-16 pt, preferably 16+ when no template constraint exists |
| Chart label | 9-12 pt |
| Footnote | 7-9 pt |

Respect the source template's scale in visual-only mode. Shorten or split before shrinking in full-rebuild mode.

## Page anatomy

Build each page from:

1. persistent chrome;
2. headline zone;
3. evidence or image zone;
4. interpretation zone;
5. atmosphere layer.

Make claim, evidence, interpretation, and qualification visually distinct.

## Editorial image language

- Prefer one large crop plus one detail over many equal cards.
- Use asymmetry, edge crops, panoramic strips, and negative space.
- Keep source images large enough to remain evidence.
- Use a coherent color temperature per section.
- Limit text over photography to high-contrast title-level copy.

## Shapes and decoration

- Use thin rules, restrained numbers, monochrome icons, or a single mesh focal element.
- Keep mesh decoration edge-bound and at least 24 px from content.
- Avoid heavy shadows, glassmorphism, 3D charts, emoji, gradients in body text, and oversized rounded UI panels.
- Use native continuous gradients and soft diffusion; never approximate gradients with adjacent solid rectangles.

## Pacing

Use low-density pages for cover, chapter, manifesto, quote, major image, super KPI, invitation, and closing. In full-rebuild mode, insert a useful low-density reset after roughly two to four analytical pages. In visual-only mode, improve perceived rhythm without changing slide order.
