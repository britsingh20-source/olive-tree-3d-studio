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

## S-corner hinge correction — 2026-11-21 (kk2)

Bright: the S-corner door was opening from the right; it must open from the left so only the S-corner comes out. Shutter now hinged on the right (corner) side, opening from the left edge toward the room (travel 1.45 rad so it stops just in front of the side-run fronts); S trays swing out as before. Source face 42792 unchanged. Asset version bumped to kk2.

Validation: check-krishnagiri-kitchen.mjs passed (adds hinge-side assertions). Headless Chrome (SwiftShader) local render with only the S-corner opened: door folds toward the corner side, both trays visible and out; no page errors. Real-device check not done.

Deployed: commit 102923aeba62e899709b97d5cbd94942132a15d5, Pages run 44886443336 success; live index serves studio.js?v=kk2 and live model.js contains the right-hinge S-corner.

## Glass-unit concealed lighting — 2026-11-21 (kk3)

Bright asked for concealed lighting inside the glass shutters (the kk1 single top strip did not read through the tint). Each glass bay now has a top strip, an under-shelf strip and two vertical inner-side profiles plus a warm point light; strips render after the tinted glass so they glow through. Glass made darker (near-black, ~80% opacity, low reflection) so it reads as black tinted glass instead of grey. Lighting toggle switches all strips/lights off.

Validation: check-krishnagiri-kitchen.mjs passed (adds ≥8 strips and ≥4 lamps per glass unit). Headless Chrome (SwiftShader) close-up rendered with lighting on and off; strips visible through the glass when on, dark when off; no page errors. Real-device/GPU check not done.

Deployed: commit 3b2a8aeaaa1d4964abec80d5de5d85d414d2e8fd, Pages run 44887322737 success; live index serves studio.js?v=kk3 and live model.js contains the glass-unit lighting.

## Baskets and lighting corrections — 2026-11-21 (kk4)

Bright: (1) baskets should look like his reference wicker basket, only two; (2) lights looked artificial — inside glass units keep only the top concealed light (remove shelf/side strips); (3) under-unit/open-box lights looked like spotlights; they must look like LED surface/strip lights and read naturally while rotating.

Changes: two rattan baskets with woven texture body, brown wooden rim and front handle slot (procedural approximation; reference photo not committed). Removed the fixed shelf between baskets. All PointLights replaced by frosted LED strips + RectAreaLights (vendored three r180 RectAreaLightUniformsLib/TexturesLib, initialised only for WebGL). Glass units: single top strip each, warm white.

Validation: check-krishnagiri-kitchen.mjs passed (one strip/lamp per glass bay, only RectAreaLights, rattan bodies present). Headless Chrome SwiftShader renders inspected: baskets pulled out; under-unit LED strips and open-box wash from two angles (no spot pools); glass units showing top strip only. Final warm-white strip colour tweak made after the glass render (not re-rendered). Software renderer is slow with area lights; real GPU/phone not tested.

Deployed: commit 4f34e244f121dc4f3d68e8950daff5b8ef2674a9; Pages run 44888669344 first failed with a GitHub artifact-metadata error, succeeded on re-run. Live serves studio.js?v=kk4 and both vendored RectAreaLight libs (HTTP 200); live page loaded in headless Chrome 390x844 with no console/page errors.

## Base shutter colour question + wood end panels — 2026-11-21 (kk5)

Bright asked why the base shutter colour changed. Code check: DEFAULT_FINISH #7fb3ad and the front material are identical in every commit since kk1; nothing changed it. Likely a swatch tapped in the finish strip (saved per browser); told Bright 'Restore aqua & wood' resets it. His following screenshot shows the normal aqua.

Bright marked two exposed end panels for wooden mica: left end of the back glass wall units (face 42991) and outer side of the tall pink-shutter/open-box unit (face 42898). Added special.woodEndPanels to the layout script; those source faces now use the wood-mica skin. check-krishnagiri-kitchen.mjs passed (asserts both are wood). Headless Chrome SwiftShader render from Bright's screenshot angle confirms both panels wood, other fronts unchanged.

Deployed: commit 1c74b0f9e286968cb3552f727485490a4b6dc3ba, Pages run 44890162328 success; live serves studio.js?v=kk5 and layout with woodEndPanels.

## Vertical grain on end panels — 2026-11-21 (kk6)

Bright: the end-panel mica was horizontal; he needs vertical. Faces 42991 and 42898 now use a second wood texture rotated 90° with panel-local UVs so the grain runs vertically in one continuous piece (two seam iterations fixed during render checks). Other wood surfaces unchanged. check-krishnagiri-kitchen.mjs passed (asserts rotation). Headless Chrome SwiftShader render from Bright's angle: both panels vertical, seamless.

Deployed: commit 81efe589f53da47d11b8f3d11603f0b4273e73ee, Pages run 44890896432 success; live serves studio.js?v=kk6 with vertical end-panel grain.

## Option 2 · Beige & wood — 2026-11-21 (kk7)

Bright: keep aqua+wood as Option 1 and add beige+wood (from his beige reference kitchen photo) as Option 2. model.js exports OPTIONS; the toolbar 'Restore aqua & wood' button is replaced by 'Option 1 · Aqua & wood' and 'Option 2 · Beige & wood'. Choosing an option repaints all solid fronts and their sides (wood areas keep wood), saves the choice in the browser (saved.option) and is restored on reload. Both colours are in the finish strip.

Validation: check-krishnagiri-kitchen.mjs passed (OPTIONS values, option buttons/persistence). Headless Chrome SwiftShader: clicked Option 2, rendered (beige fronts, wood/glass/lights unchanged); reload kept Option 2 pressed and a front at #a8927e; no page errors. Real phone not tested.

Deployed: commit ada4d0dcc88b1fb896739f1906722177131677e6, Pages run 44897744404 success; live index has both option buttons and studio.js?v=kk7.

## Option picker moved to the top — 2026-11-21 (kk8)

Bright: option buttons were only visible after scrolling; place Option 1 / Option 2 on top like the earlier TV panel (pon-karthikeyan). Removed the toolbar option buttons; added the same 'panel-options' card block (copied styles) after the selection bar and before the toolbar, with rendered thumbnails option-1.jpg (aqua) and option-2.jpg (beige) and a 'design-badge' on the 3D stage. Cards are a radiogroup; choice persists (saved.option).

Validation: check-krishnagiri-kitchen.mjs passed (cards present, above toolbar). Headless Chrome SwiftShader 390×844 @2x: card block begins ~560 px from page top (visible on first screen), Option 2 card click → badge 'Option 2 · Beige & wood', card checked, fronts beige; no page errors. Real phone not tested.

Deployed: commit fe2e79e58f4cbe888026f66b19d1bb8755d23db4, Pages run 44898528893 success; live index has the option card block, studio.js?v=kk8, option thumbnails HTTP 200.

## Acrylic gloss for both options — 2026-11-21 (kk9)

Bright: both options look glossy but not like acrylic. Changes (studio.js paint + model.js default): solid fronts drop the mica grain map, roughness 0.015, clearcoat 1 with 0 roughness, and use a dedicated acrylic reflection environment (grey room, LED cove/plinth lines, windows, floor tile lines; captured from 0.9 m — first attempt captured at floor level showed no lines, fixed). Wood and textured finishes unchanged. Option card thumbnails re-rendered (on-stage badge blanked in the thumbnails).

Validation: check-krishnagiri-kitchen.mjs passed (acrylic assertions). Headless Chrome SwiftShader renders of Option 1 and Option 2 base runs: crisp moving-line reflections visible, colours retained. Real phone/GPU not tested.
