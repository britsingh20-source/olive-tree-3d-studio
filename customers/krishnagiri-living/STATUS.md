# Krishnagiri living area — studio status

Updated 2026-11-22 (Asia/Kolkata). Same client as `krishnagiri-kitchen`.

## Current state

First 3D viewer built 2026-11-22 (kl1) — see below. All painted colours (front and back) confirmed.

## Sources

- Staged from Bright's PC folder Downloads/krishnagiri: `krisnagiri living area.skp` (newer, sha256 91a4b0bd…) and `krisnagiri living area (1).skp` (older, c516a50e…).
- First read_skp.py run: UNSUPPORTED_LAYOUT, AssertionError ('plane', 46494). Diagnosis: only planarity check; faces 46494/46632 deviate 0.00019 in / 0.000014 in from their planes (float drift). Tolerance raised to 1e-3 in in extract_skp.py and scripts/extract-prem-skp.py; both files then EXTRACTION_OK: 381 vertices, 649 edges, 283 root faces, 362.9 × 255.0 × 120.7 in, no component instances.
- The two files differ only in face 43750 (painted #660000 in newer). Newer used. Geometry saved in customers/krishnagiri-living/source-geometry.json. Original SKPs not committed.

## Confirmed

- #660000 (17 faces) = wooden mica, one material everywhere; same swatch as the kitchen (dist/krishnagiri-living/wood-mica-reference.jpg).

- #ff31ff (2 faces, 18x93in each) = tinted glass shutters of a crockery unit with glass shelves and concealed lights inside. Details (tint, shelf count, hinges, handles) still open.

- #ff7b00 (1 face, underside at 93in over the 57in opening) = concealed LED strip light position.

- #3a3a3a (1 face above opening + crockery unit, 96.7–120in) = plain white wall.

- #660066 (24x54in, 30–84in, right end of wall unit) = book shelf, clear glass shutters, concealed lights inside. Shelf count/hinge open.

- #ff8c65 (24x9in, 21–30in, below book shelf) = tandem drawer.

- #ff9999 (24x21in, 0–21in, below drawer) = fixed shutter with robot cleaner inside (no opening action). Robot exits via the #006666 side opening.

- #006666 (14in deep x 4.1in high at floor, side of the robot bay) = robot cleaner entry/exit opening.

- #31ff31 (low unit along left wall) = seating bench with cushion top; seat lifts for storage under the seating area only.

- #ff9831 (underside at 54in over the open niche, x39.5–87.5) = concealed LED strip.

- #661900 (top of wall unit at 84in) = same wooden mica.

- #000066 (two 15x84in panels beside the staircase) = pooja unit, two CNC shutters. Bright's photo is for the CNC pattern only (mandala split across shutters, round centre handle, hanging bells, lotus motifs) — not its colour. Photo not committed.

- #660033 (108x36in band above entrance, 84–120in) = fixed louver wall panel, vertical wood-look slats per Bright's reference (dist/krishnagiri-living/louver-reference.jpg).

- #ff6532 (underside at 117in over the entrance partition, 66x12in) = hanging designer lights with plants underneath.

All 14 painted colours confirmed 2026-11-22.

- Unpainted: entrance partition five 4x4in posts = wooden rafters in the same wooden mica; 12.5in base = planter box with pebbles.

- Unpainted left-wall block under the louver band = TV panelling area; SketchUp geometry irregular, only the front matters. Awaiting Bright's TV panelling reference.

## Back-side colours found — 2026-11-22

Bright said the TV panelling has its own colours. The faces looked white because their colour is on the BACK side (tag 3503), which the reader ignored. extract_skp.py / extract-prem-skp.py now record backColor; 62 faces affected; source-geometry.json regenerated. Asking about these colours next.

- TV wall #ff007f (back-side colour; 90x47in panel 20–67in + 108in strip 68–84in) = white marble-look panels with gold/beige veining, from Bright's photo — TV background only, not its brown panels/boxes. Photo not committed.

- TV wall #6600cc (middle low front 18x12in, 8–20in) = tinted glass shutter, lift-up.

- TV wall four low wood-mica fronts (18x12in, 8–20in) = side-hinged shutters; hinge sides open.

- TV wall #660066 (18in x 0–67in by the bench) = display box, clear glass shutter, glass shelves, concealed lights inside.

- TV wall #ff6532 (undersides at 67in and 8in) = concealed LED strips; surfaces wooden mica.

- #664a00 (two small panels on the column, TV side + entrance side) = two-way switch boxes, one each side.

- #31ffff (entrance-side recess in the column by the rafters) = open display box for car keys + decor shelves, wooden mica. Shelf count open.

- Rafter inner sides #ff9831 = small plant shelves in the four gaps between rafters, staggered 5 ft / 4 ft alternately, concealed light under each shelf.

- #666600 (outer sides of the end rafters) = wooden mica.

- #99ff99 (floor of the box above the rafters) = 2–3 plants (money plants + bonsai) lit by hanging pencil lights so they glow.

- Entrance end face #660066 (12in x 0–87.5in, facing living room) = tinted grey glass display shutter, concealed lights inside.

- Beam underside over rafters #ff6532 (84.5in) = small surface lights, one between each pair of pillars/rafters.

- #ffcd9b (three 18in sloped-top panels under the stairs) = staircase storage shutters, wooden mica.

- #660033 band above the book-shelf wall unit = same wood-slat louver panel, continuing from above the TV.

Colour intake (front + back colours) complete 2026-11-22.

## Next action

Ask Bright what each source colour is, one at a time (started with #660000, 17 faces), saving each answer here and in design.json. Then build dist/krishnagiri-living/ from the krishnagiri-kitchen viewer.

## First viewer — 2026-11-22 (asset version kl1)

Built dist/krishnagiri-living/ on the krishnagiri-kitchen studio shell (studio.js/css, tour.js, camera fixes: no damping, drag never selects, tour only by button and stops without reframing, resize reframes only the untouched opening view, no scroll lock in product view). New model.js for the living area: 11 sections in 7 products, 17 opening actions (glass hinged shutters, TV glass lift-up, tandem slide, wood shutters, pooja CNC pair, under-stair sloped shutters, bench seat lift). Robot bay fixed with robot visible through the side opening. Marble TV background, louver bands, LED strips (4), surface lights between rafters, staggered plant shelves with lights, pebbles, key box shelves, switch boxes, money plants + bonsai with pencil lights. Lighting on/off and Reference colours (shows visible source colours incl. back-side colours). Finish strip applies to wood fronts only; default wooden mica. Layout script uses visible (back-side) colours/normals; product regions attach surrounding faces to each product.

Bench correction during build: source shows the seat at 12in (44687/44883 top), not 29in; seat top now lifts with the lid.

Validation performed:
- node check-krishnagiri-living.mjs (Node 22.23.5): passed — 283 source faces each rendered once at measured position, unit kinds per confirmations, hinge/lift/slide types, robot bay fixed, 7 products, marble/louver/white-wall/wood materials, only RectAreaLights (11), all actions open and return to rest, lights toggle, reference mode shows exactly 283 faces, no scroll lock, asset versions match.
- Headless Chrome (Playwright 1.63, SwiftShader software WebGL — not a real GPU), local server: desktop 1366x900 default view and close views of TV wall, wall unit + crockery, entrance rafters (from the room), plant box above the entrance, pooja + under-stair, Open all; mobile 390x844 default view, product view of TV unit, entrance partition and bench (opened). No page errors (only the site favicon 404).
- Not tested: real phones/GPUs, compatibility fallback, finish persistence across reload, full tour run, drag/resize camera persistence in this route (code identical to kitchen).

## Next action

Bright reviews the 3D view. Open questions (design.json → openQuestions): pooja shutter colour, glass shades, shelf counts, hinge sides, cushion colour, TV size.

Deployed: commit 94d1b59a8e3a51aa39c6abb8fb24d5838f0dcff0, Pages run 44978272293 success. Live route, model.js?v=kl1, studio.js?v=kl1, exact-layout.js and both textures return HTTP 200; live page loaded in headless Chrome (SwiftShader) at 390x844 and the TV unit product view rendered; only console error is the site favicon 404.

Live URL: https://britsingh20-source.github.io/olive-tree-3d-studio/krishnagiri-living/

## Review corrections — 2026-11-22 (kl2)

Bright: wood was horizontal everywhere — vertical units need vertical grain, horizontal units horizontal grain; inside of display boxes looked white — must be wood; look was cartoonish — improve lighting/finish and surface lights; the panel above the TV unit ("lower panel", read as the louver panel) showed white and lines.

Changes: grainUV() gives every wood box/face its grain along its longer side (source faces and generated boxes); glass-unit and pooja carcass interiors + book-shelf shelves in wooden mica; louver bands rebuilt as InstancedMesh vertical slats (24 mm wide, 34 mm pitch) on a dark backing, walnut-tinted wood grain; marble redrawn (soft clouding, gold veins, faint joints; recursion depth-limited after it stalled page load); LED strips now aluminium profile with a narrow diffuser; surface lights over the rafters are black round surface downlights each with a small area light; polished tile floor receiving shadows; studio lighting: lower hemisphere fill, sun/fill aimed at the model centre with wider soft shadows, exposure .95. Area lights 16.

Validation: check-krishnagiri-living.mjs passed (adds: grain along the longer side for every wood source face, crockery interior wood, >100 louver slats). Headless Chrome SwiftShader 1366x900 renders inspected: TV wall (marble, LED profile, vertical-grain posts, horizontal-grain TV shutters), wall unit + crockery (wood interiors, vertical grain on tall fronts), entrance rafters (downlights), louver close-up (slats, first attempt showed photo stripes across slats — fixed). Final slat tint tweak not re-rendered. Real phone/GPU not tested.

("Lower panel" = louver panel — confirmed by Bright in kl3 feedback.)

Deployed kl2: commit 7cb3ea6acff0d94ef8ac3970077f2163182889b0, Pages run 44980406116 success; live serves studio.js?v=kl2 and model.js with grainUV; live page loaded in headless Chrome 390x844.

## Louver colour — 2026-11-22 (kl3)

Bright: the louver ("lower") panel was too dark and did not match the wooden mica. Slats now use the same wooden mica material (vertical grain); gap backing lightened to dark brown #4a301c. check-krishnagiri-living.mjs passed; headless Chrome SwiftShader render of the louver above the TV wall inspected (slats match the rafters/shelf wood). Real phone not tested.

Deployed kl3: commit 9fd5b15596bae08aedf23a88ac60de93fb3d7bc2, Pages run 44980885892 success; live index serves studio.js?v=kl3.
