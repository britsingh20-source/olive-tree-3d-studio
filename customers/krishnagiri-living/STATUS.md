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

## Flicker near the stairs — 2026-11-22 (kl4)

Bright: the box near the staircase pixelates while rotating. Cause: coplanar overlapping faces in the SKP (z-fighting) — pooja wood side 43447 over white 43474/43475, stair side 43505 and stair faces 42978/43135/43141/43147/43157 over the three under-stair shutters, wood band 45003 over the crockery fronts, many entrance-partition faces. Layout script now finds all 40 overlapping pairs (same plane, area overlap) and assigns push-back levels (unit face wins; coloured beats white; smaller beats larger; chains levelled up to 5); model.js renders those faces with polygonOffset 2*level. CNC cut-outs use alphaToCoverage for smoother edges.

Validation: check-krishnagiri-living.mjs passed (adds pushBack assertions). Headless Chrome SwiftShader still renders of the pooja/under-stair corner and the crockery top: no speckling. Flicker is a motion artefact; it was not reproduced or re-tested while rotating on a real GPU/phone — ask Bright to confirm.

Deployed kl4: commit 82ad17b51c0121063d9959051d5fe24ab1b55c98; live index serves studio.js?v=kl4.

## iPhone load failure — 2026-11-22 (kl5)

Bright's iPhone (screenshot 09:22) showed "The 3D view could not load" on kl4 — an exception in start(). Not reproduced: kl4 loads in headless Chrome (SwiftShader), in Playwright WebKit 26.6 (Linux) and in the no-WebGL compatibility fallback. Likely device-side (iOS refusing/losing a WebGL context under memory pressure or with other 3D tabs open) but unconfirmed. Changes: the error box now shows the real error message + browser/OS and a Try again button (clickable); render-loop exceptions and webglcontextlost also show it; phone pixel ratio capped at 2x (was up to 3x) to cut GPU memory. Next: if it still fails, ask Bright for a screenshot of the Details line.

Deployed kl5: commit 5f0dc408256a96f7f27fa31f0a286a5aa1d4bce2, Pages run 44982863503 success; live page loads in Playwright WebKit 390x844 (loading hidden, no errors). Real iPhone not yet re-tested.

## Louver pixelation — 2026-11-22 (kl6)

Bright (on his phone, so kl5 loaded): the top louver pixelates; first version had the same wooden finish. Cause: ~160 thin InstancedMesh slats alias/shimmer while rotating (worse after the 2x phone pixel-ratio cap). Louver bands are now a single source face with a mipmapped canvas texture: 10 slats per 0.34 m tile, each a vertical strip of the wooden mica image, dark #4a301c gaps, edge shading, plus a matching bump map (bumpScale 2.2). No instanced slat geometry remains.

Validation: check-krishnagiri-living.mjs passed (asserts louver map + bumpMap and no InstancedMesh). Headless Chrome SwiftShader: close view at 1366x900 and distant view at 390x844 — slats read clearly, wood matches the mica, no aliasing in stills. Motion shimmer not testable here; ask Bright to confirm on the phone.

Deployed kl6: commit f8f467a9fcc2bca3055230374dcecd927d97b66f; live index serves studio.js?v=kl6.

## Phone review fixes — 2026-11-22 (kl7)

Bright (iPhone screenshots, marked): shimmer at the crockery unit's right side and on the entrance open box; inside of the entrance open box/partition white → must be wooden mica; louver looks dark when zoomed out (light when zoomed in); TV marble looks like the wall → make glossy and a little darker.

Causes/changes: generated carcasses shared planes with the measured outer faces (e.g. crockery side 43679, top 45221) → carcass inset 1.5 mm per side. Unpainted white source faces that belong to a unit/product region (crockery sides/back/top, entrance key box and open-box insides, plant-box back, under-stair side) now render wooden mica (floor excluded). Louver texture gaps 14% of pitch (was 24%) and lighter #7a5030 so the mipmapped average stays wood-coloured. Marble base #e6ddcf, stronger gold veins, roughness .05, clearcoat 1, envMapIntensity 1.35. Wood tile enlarged to 2.44 m (one mica sheet) — the 1.1 m tile showed a repeat seam on tall panels.

Validation: check-krishnagiri-living.mjs passed (adds: white faces inside units are wood, floor stays plain, marble glossy). Headless Chrome SwiftShader 1366x900: overview from Bright's angle, crockery right side (clean, seam gone after tile change), entrance key box (wood, shelves, switch plate), TV wall marble (distinct from wall). Motion shimmer cannot be observed in stills — ask Bright to confirm on the phone.

Deployed kl7: commit c565360d44e1b92eb5bb5d9877966f0aee5a1409; live index serves studio.js?v=kl7.

## Staircase hides the TV unit — 2026-11-22 (kl8)

Bright: while rotating to see the TV unit, the staircase hides it. Unassigned staircase faces (x > 254in) moved into model.staircase with their own transparent-capable materials. Each frame, if the staircase bounding box lies between the camera and the orbit target (full view), it fades smoothly to 12% opacity (no depth write, no shadow); otherwise it returns to solid. New toolbar button 'Hide staircase' / 'Show staircase' hides it entirely. Also fixed: the kl7 'unpainted faces inside a unit → wood' rule had turned the staircase side above the storage shutters and the landing above the pooja to wood; those stay white now.

Validation: check-krishnagiri-living.mjs passed (adds staircase grouping/fade and units-never-faded assertions). Headless Chrome SwiftShader 1366x900 from beyond the staircase looking at the TV wall: stairs faded, TV unit clearly visible, stair sides white again. Real phone not tested.

Deployed kl8: commit 34ffac3014660bd9aef716633b0031d0aed18da1; live index serves studio.js?v=kl8 with the Hide staircase button.

## Robot cleaner loop — 2026-11-22 (kl9)

Bright: the robot cleaner should come out and go in on a loop like the earlier TV wall (pon-karthikeyan) — 4 s out/cleaning, 4 s in, repeating. Implemented a 12 s loop driven by model.update: 4 s out (dock → side opening #006666 at x86.5 → open recess → room), 4 s zigzag cleaning at one of six floor spots in front of the wall unit/TV area (cycles spots), 4 s back to the dock; smoothstep timing, robot turns to its direction of travel, side brush spins; paused in Reference colours. Robot redrawn (13 in dia: body, top, lidar, bumper, status LED, brush) and moved from the carcass interior into the bay unit group so it can leave the cabinet.

Validation: check-krishnagiri-living.mjs passed (adds loop timing: in the room at 4 s, cleaning phase to 8 s, back at the dock at 12 s, out again at 16 s; frozen in reference mode). Headless Chrome SwiftShader still of the cleaning phase: robot on the floor in front of the wall unit. Motion not viewed in real time here; real phone not tested.

Deployed kl9: commit 60794d753c82a8472eca6823dc0c6b5890a16192; live index serves studio.js?v=kl9.

## Pooja colour confirmed + Option 2 — 2026-11-22 (kl10)

Bright: the beige pooja doors ("high classy beige") are good. Asked for Option 2: apart from the glass shutters, TV base unit shutters and the "study" shutters in beige. Read "study" as the staircase (under-stair) storage shutters — no study in the model; asked Bright to confirm.

Implemented the kitchen-style option panel (two cards with rendered previews option-1.jpg / option-2.jpg, choice saved on the device as saved.option). Option 2 paints the fronts of tv-shutters and under-stair with BEIGE_FINISH (acrylic gloss, #e6d9c4 — the matte pooja #efebe4 looked almost white under gloss); the user's own finish picks on those units are cleared when an option is chosen. paint() now also drops the wood bump map on solid finishes. Pooja shutter colour recorded as confirmed (#efebe4, matte).

Validation: check-krishnagiri-living.mjs passed (adds OPTIONS: two options, Option 2 only touches tv-shutters/under-stair, never glass units). Headless Chrome SwiftShader 1366x900: Option 1 and Option 2 from the same camera (TV base wood vs beige), Option 2 at the staircase (beige sloped storage shutters, beige pooja). Real phone not tested.

Deployed kl10: commit 6eeecc18de2a26d840d96c25133c8bb4d35050ce; live index serves studio.js?v=kl10 and option images.

## Final beige scheme — 2026-11-22 (kl11)

Bright (marked iPhone screenshots, 15:10): the three staircase storage shutters near the pooja must be wooden mica, not beige; the marked fronts by the bay-window seat must be beige; keep only the beige design — no Option 1/2. Read the marks as faces 46951 + 44607 (two 24x30in fronts above the open niche, 54-84in) and 44860 (13x18in front at the seat end, 12-30in).

Changes: option cards, option images and applyOption removed; BEIGE_UNITS=['tv-shutters'] get the beige acrylic default front; BEIGE_FACES render with a beige acrylic material (#e6d9c4, clearcoat); under-stair back to wooden mica. Saved per-device finishes for tv-shutters/under-stair and the stored option are cleared once (saved.scheme=11) so phones that picked an option see the final scheme.

Validation: check-krishnagiri-living.mjs passed (beige scheme: TV shutters default beige, under-stair wood, three beige faces, no option code). Headless Chrome SwiftShader 1366x900: seat-side wall unit (beige fronts above the niche and at the seat end), staircase storage (wood) with beige pooja, TV base (beige shutters, glass lift-up). Real phone not tested.

Deployed kl11: commit b043a24ac6538a1d4439cd5e3c28a44a35990a17; live index serves studio.js?v=kl11 without option cards.

## Beige fronts as real shutters — 2026-11-22 (kl12)

Bright (iPhone, 15:24): the beige panels beside the book-shelf glass shutter don't open and don't look like doors; the drawer and fixed panel below the glass shutter must be beige. Layout now has units wall-upper (46951+44607, two hinged shutters opening from the middle) and seat-end (44860, one hinged shutter), both 'wood-shutters' kind with carcass and 19 mm doors; wall-unit product has 5 members. BEIGE_UNITS = tv-shutters, wall-upper, seat-end, tandem, robot-bay (BEIGE_FACES empty). SCHEME=12 clears any saved finishes for these units once.

Validation: check-krishnagiri-living.mjs passed (13 sections; wall-upper/seat-end open on hinges; beige units). Headless Chrome SwiftShader 1366x900 seat-side view closed and Open all: doors swing, drawer slides, robot panel beige. Real phone not tested.

Deployed kl12: commit 4ce03bd0b65ec68f849260610965a5316f1e629d; live index serves studio.js?v=kl12.

## Walkthrough — 2026-11-22 (kl13)

Bright (marked top view): a walkthrough 3D view from the entrance to the pooja, realistic, as a person entering would see it. Added a 'Walkthrough' toolbar button: Catmull-Rom camera path at 62 in eye height, FOV 60, 11 keyframes / 60 s — entrance partition (rafters, plants, pebbles) → around the grey-glass end → TV wall (marble, beige base, display box) → seat and book-shelf unit (beige shutters, drawer, robot) → crockery → ends facing the pooja CNC shutters. Lights on, doors closed, Reference off, controls disabled during the walk; any drag/tap stops it; staircase fades automatically. Bug found while testing: an inline // comment had swallowed the camera update (fixed with a block comment).

Validation: check-krishnagiri-living.mjs passed (route starts in front of the partition, never crosses the TV wall/bench, ends looking at the pooja). Headless Chrome SwiftShader 1366x900 frames at 0, 9, 17, 30, 42, 52 s inspected (route adjusted after the 9 s and 42 s frames were too close). Smoothness of motion on a phone not tested.

Deployed kl13: commit 6ad76d4fb446a150d6287b34de0f29a58d3b7e47; live index has the Walkthrough button and studio.js?v=kl13.

## Interactive walkthrough — 2026-11-22 (kl14)

Bright: the walkthrough must be interactive — open the entrance glass shutter, a 65-inch TV switched on/off, sit on the bay-window seat, read at the study table, books in the book shelf, open the drawer, open/close crockery, open the pooja and the wooden staircase-storage shutters.

Added props in model.js (all render approximations): 65" TV on the marble panel with setTV(on) (emissive generic landscape + soft area light, light hidden when off), books on the book-shelf base and shelves, open book + cup on the desk niche top (43916, 30 in), crockery (plates, bowls, cups, glasses) on the crockery glass shelves, pooja platform at 30 in with brass diya (glowing flame), kalash and bell, under-stair storage interior (wood lined) with three bins; staircase side faces that share the shutters' plane hide while that storage is open. Pooja cabinet now one open box (no divider between the pair). Walkthrough rewritten as WALK_STEPS (27 steps, ~96 s, eye 62 in / seated 42 in) with fx open/close/tv; labels shown in the hint line.

Validation: check-krishnagiri-living.mjs passed (walk does every requested action, sits on the seat, reads, all fx units have actions, TV toggles). Headless Chrome SwiftShader 1366x900 frames at 11.5 s (entrance display open), 22 s (TV on), 36 s (seated), 46.5 s (reading), 68.5 s (crockery open), 81.5 s (pooja open — found the middle divider, fixed), 93 s (staircase storage open — interior then switched to wood, not re-rendered). Book shelf/drawer frames not rendered. Motion on a phone not tested. Bugs hit while building: two inline // comments swallowed code on the minified lines (fixed with block comments).

Deployed kl14: commit 9d7bb9e7d576fd47f5fdbc216cab22fd73f05de6; live index serves studio.js?v=kl14.

## Panel stop + TV video — 2026-11-22 (kl15)

Bright: play a Vijay video on the TV; show the panel between the book shelf and the crockery unit during the walk. Declined to embed a real person's/third-party footage in the published page; added a 'TV video' toolbar button instead — the viewer chooses a video on their own device and it plays on the 65" TV (VideoTexture, muted, loop) during the walkthrough; nothing is uploaded. Added 4 walk steps (31 steps / ~110 s) at the wooden frame panel of the opening (x114.5–171.5): front view, look up to the frame top and LED strip (93 in), pan left post and right side.

Validation: check-krishnagiri-living.mjs passed (panel stop between book shelf and crockery; setTVSource exists). Headless Chrome SwiftShader frames at 64.5 s and 68.2 s show the frame, LED and posts. The video chooser was not exercised with a real file here (headless) — ask Bright to try on the phone.

Deployed kl15: push runs 45020074360 and 45020128672 (incl. re-run) FAILED at deploy-pages ('No artifacts named github-pages' although upload succeeded — GitHub-side); manual workflow_dispatch run 45020818806 succeeded; live index then served studio.js?v=kl15 with the TV video button.

## Pergola study from the TV side — 2026-11-22 (kl16)

Bright: after the entrance glass door, from the TV unit look left at the pergola — whole, top, bottom — then TV on/off; the pergola is not highlighted. Walk now (34 steps, ~120 s): close entrance display → pergola from the TV side (rafters, lit shelves) → pergola top (plants, pencil lights) → pergola bottom (pebble planter) → TV wall → TV on → TV off → seat … Lighting: beam downlights 110 (6x6 cm), lens emissive 2.2; new area light under each of the 4 plant shelves (60); plant-box area light 95 (21 area lights total).

Validation: check-krishnagiri-living.mjs passed (pergola whole/top/bottom after closing the entrance display and before the TV switches on; area lights <=24). Headless Chrome SwiftShader frames at 19.4/22.9/26.4 s inspected. Phone performance with 21 area lights not tested.

Deployed kl16: commit 165af3fa901216c9d07bc733172f7c2b665e528f, Pages run 45022275334 success; live index serves studio.js?v=kl16.

## Walkthrough order — 2026-11-22 (kl17)

Bright: pooja shown too tight — see top and bottom first, then open; don't open the staircase shutters; end with the whole view towards the pergola/TV unit; TV-on step wasted time — look up/down/right while it plays. WALK_STEPS now 40 steps / ~135 s: TV on → look up (louver) → down (beige base) → right (display box) → off; pooja whole from x235 → top → bottom → step in, open, close; turn back over the hall (crockery, book shelf) → final whole view of the pergola and TV unit. Staircase storage steps removed.

Validation: check-krishnagiri-living.mjs passed (looks up/down while the TV plays; no under-stair fx; pooja top/bottom before opening; ends looking at the pergola/TV). Headless Chrome SwiftShader frames at 31.9 s (look up with TV on), 103.4 s (whole pooja), 106.4 s (pooja top), 132.4 s (final whole view). Motion on a phone not tested.

Deployed kl17: commit 5cfdef3d50dbd4a8964c65b40794bb3558752032, Pages run 45023946960 success; live index serves studio.js?v=kl17.

## Android stuck on load — 2026-11-22 (kl18)

Bright: works on iPhone, but the customer's Android (and Bright's Android) gets stuck. Measured (headless Chrome, Android UA, SwiftShader): 21 RectAreaLights and 963 meshes, 65 s to first view — area lights are evaluated in every lit material, too heavy for typical Android GPUs. Changes: six beam downlight area lights merged into one; pebbles (260) → 4 InstancedMeshes; books → 1 InstancedMesh with per-instance colours (963 → 655 meshes, 16 area lights on full). Lite mode (Android / deviceMemory<=4 / ?lite; ?full overrides): no glass-unit or plant-shelf area lights (7 incl. the TV light, which is hidden while off), pixel ratio ≤1.5, shadow map 1024. Watchdog: after 25 s still loading, a 'light version' link (?lite) appears.

Validation: check-krishnagiri-living.mjs passed (lite ≤7 area lights, <700 meshes). Same Android-UA headless test: 34.8 s (was 65 s) in software rendering; ?lite renders at 390x844. Not tested on a real Android phone — ask Bright/customer to retry.

Deployed kl18: push run 45033255684 failed at deploy-pages (GitHub artifact metadata error); workflow_dispatch run 45033407162 succeeded; live index serves studio.js?v=kl18.

## Auto-start walkthrough — 2026-11-22 (kl19)

Bright: kl18 loads on Android, but customers think the page hangs because the 3D view and Walkthrough button are below the intro. Now the page scrolls to the 3D view immediately on open (loading message visible) and starts the walkthrough automatically once loaded; Stop/replay button kept; ?nowalk or ?debug disable it. Validation: check passed; headless Chrome (Android UA, 390x844): scrolled to the viewer at open, walkthrough running ('Stop walkthrough', entrance step) after load, no page errors.

Deployed kl19: Pages run 45034450279 success; live index serves studio.js?v=kl19.

## Android stutter early in the walk — 2026-11-22 (kl20)

Bright: kl19 now auto-starts on Android (earlier failure was the 10-minute page cache), but panning stutters on Android until after the TV unit; iPhone smooth. Causes found in code: setStairOpacity toggled material.transparent and set needsUpdate on every fade frame → shader recompiles per frame while the staircase faded (first part of the walk pans past it); TV on/off toggled a light's visibility and the screen emissiveMap → recompiled every lit material; lights on/off by visibility likewise. Fixes: stair materials permanently transparent (only opacity/depthWrite change); TV light always present (intensity 0/6) and emissiveMap always bound; setLights uses intensity; renderer.compile(scene) at load with hidden objects temporarily shown and the stairs at 50% so every program exists before the walk. ?debug&walk lets tests auto-run the walk.

Validation: check-krishnagiri-living.mjs passed (adds: light count unchanged by lights-off/TV-on, stair fade leaves material versions unchanged). Headless Chrome (Android UA, SwiftShader): renderer.info.programs stays 24 from load through walk times 5–135 s incl. TV on/off and stair fade. Frame smoothness on a real Android phone not measured — ask Bright.
