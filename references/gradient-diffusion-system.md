# Gradient and diffusion system

## Primary correction

Treat continuous color atmosphere as a defining feature. Do not translate the reference into large adjacent color blocks. A red half beside a yellow half is not a gradient.

## Three-layer construction

1. **Base field:** use one native linear gradient across the full canvas or designated background region. Use at least three stops and a 20-40 degree direction.
2. **Diffuse bloom:** add one or two large radial gradients with transparent outer stops. Crop them at an edge. Keep opacity low enough that text remains dominant.
3. **Mesh texture:** add one original point/grid mesh from an edge. Let it inherit the chapter color family; never cover content.

## Chapter sequences

- Chapter 01: `#EA4335 -> #F97316 -> #FBBC04`.
- Chapter 02: `#FBBC04 -> #84CC16 -> #34A853`.
- Chapter 03: `#34A853 -> #14B8A6 -> #4285F4`.
- Chapter 04: `#4285F4 -> #6366F1 -> #5B3DF5`.
- Continue by hue adjacency, not random color jumps.

## Ordinary pages

- Keep 70-85% neutral canvas.
- Use a soft edge wash occupying roughly 15-30% of the canvas, not a full hard block.
- Prefer a diffused corner glow behind a metric, image, or quote.
- Allow a hard dark half-page only when it carries evidence or a chart.
- Do not repeat the exact same diffusion corner on consecutive pages.

## Data graphics

- Use continuous gradient fills inside chart marks or a single controlled accent color.
- Keep tracks neutral gray.
- Do not use separate red/yellow/green/blue blocks as decorative category headers unless categories genuinely require distinct encoding.

## Implementation contract

Use native artifact-tool gradient fills:

```js
shape.fill = "linear(28deg, #EA4335 0%, #F97316 48%, #FBBC04 100%)";
slide.background.fill = "linear(28deg, #34A853 0%, #14B8A6 52%, #4285F4 100%)";
wash.fill = "radial(#FFFFFF/30 0%, #FFFFFF/0 72%)";
```

Do not use a loop that creates neighboring solid rectangles to approximate a gradient.

## Render QA

Inspect every chapter page at full size. Fail when:

- a primary color transition has a straight rectangular seam;
- a gradient reads as two or three solid panels;
- radial diffusion lowers text contrast;
- the mesh becomes the focal point instead of the title;
- ordinary pages accumulate more than one dominant color field.
