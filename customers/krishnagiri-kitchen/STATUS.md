# Krishnagiri kitchen — studio status

Updated 2026-11-21 (Asia/Kolkata).

## Current state

All 10 source colours confirmed with Bright (see design.json → confirmed, globalFinish, globalRules). First interactive viewer built at /krishnagiri-kitchen/ for Bright's review. Bright asked to see the 3D view before answering the countertop question and will send corrections.

## Sources

- Chat uploads of both SKPs were text-corrupted in transfer (~51k U+FFFD sequences each; zip unreadable) — transfer fault, not a bad model.
- Originals staged from Bright's PC (Downloads/krishnagiri), parsed with bundled read_skp.py (Linux Python 3): EXTRACTION_OK for both; 58 vertices, 89 edges, 33 root faces, 120 × 96 × 84 in, zero omitted instances; identical geometry/materials.
- Geometry: customers/krishnagiri-kitchen/source-geometry.json. Layout: scripts/prepare-krishnagiri-kitchen-layout.py → dist/krishnagiri-kitchen/exact-layout.js. Original SKPs not committed.
- Wood mica reference (Bright's swatch) committed unchanged as dist/krishnagiri-kitchen/wood-mica-reference.jpg. The aqua reference kitchen photo (third-party watermark) is NOT committed; colour sampled only.

## Implementation (asset version kk1)

Template: dist/rathesh kitchen (S-corner, wicker, rice, oil, glass mechanisms) with fixes from ratesh: orbit damping off; drag/multi-touch never becomes a selection tap; tour starts only by button and stopping it never reframes; resize reframes only the untouched opening view (stops after the first user camera move); Lighting on/off toggle added. 13 sections / 5 selectable products. Aqua high gloss (#7fb3ad approx.) handleless fronts; wood mica only in the open wicker unit, the open box and the lit wall-unit undersides; black tinted glass wall shutters with concealed lights and one glass shelf; closed cabinet interiors neutral off-white; countertop black stone placeholder.

## Validation performed (2026-11-21)

- node check-krishnagiri-kitchen.mjs (Node 22.23.5): passed — 33 source faces at measured positions, colour→section mapping, wicker/open box without shutters, S-corner trays, all actions open/close back to initial, lights toggle, reference mode shows exactly 33 faces, product framing at phone/desktop aspects, tour stop/complete.
- Headless Chrome (Playwright, SwiftShader WebGL — software renderer, not real GPU) against local server: desktop 1366×900 and mobile 390×844. Visually inspected default view, three close angles closed, two angles with Open all (S-corner trays, wicker baskets, rice/drawers out), under-unit LED strips and open box. Countertop z-fighting found and fixed with polygon offset. Drag-rotate: camera moved, no drift after release, viewport resize did not change camera, drag did not select. Tour started by button and stopped on tap. Lighting button toggled. No page errors (only favicon 404).
- Not tested: real phones/GPUs, CPU compatibility fallback, finish persistence across reload, full tour completion in browser.

## Next action

Wait for Bright's review/corrections of the 3D view; ask countertop material/colour. Then update design.json, bump ?v=, re-verify and redeploy.

## Deployment — 2026-11-21

Viewer commit 2e8216007e266cfd17851a6cf3d46f39339d117b deployed by GitHub Pages run 44885859441 (success). Live route returned index (title, Lighting button, studio.js?v=kk1), model.js, exact-layout.js and wood-mica-reference.jpg with HTTP 200. Live page loaded in headless Chrome (SwiftShader) at 390×844 and rendered the kitchen; only console error is the site-wide favicon 404.

Live URL: https://britsingh20-source.github.io/olive-tree-3d-studio/krishnagiri-kitchen/
