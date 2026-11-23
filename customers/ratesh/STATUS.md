# Mr. Ratesh — wardrobe & bay-window studio

Updated 2026-10-31 (Asia/Kolkata).

## Current state

Interactive viewer implemented at /ratesh/ using existing Studio stylesheet, controls, tours, vendor renderer and compatibility fallback. Reused the Studio architecture while adding Ratesh-specific geometry. Existing customer routes unchanged.

Confirmed design is in design.json. Left wardrobe: matte Daytona wood handleless doors; white interior; highlighted rod/shelf structure with no drawers. Bay seat: matte Daytona base, white cushion, lift-up storage. Red section fixed. Narrow unit: three glass shelves, Daytona backing/surround and warm-white lighting. Tall cabinet: black frames, smoke-grey glass, four Daytona wood shelves/inner box and warm-white lighting. Purple side door: rear hinge, opens outward into bay-window space, apple hooks only.

## Sources and assets

Three local SKPs parsed successfully using plugin 1.0.1 bundled reader with Python 3.14.2. Each: 116 vertices, 189 edges, 75 planar root faces with closed loops; 192 × 24 × 84 inch bounds; zero omitted component instances. All extracted geometry/materials match. Exact geometry preserved in customers/ratesh/source-geometry.json and all 75 faces retained for Reference colours in dist/ratesh/exact-layout.js.

Actual supplied wood image recovered from local PC, visually checked against attachment and copied unchanged to dist/ratesh/daytona-reference.jpg. JPEG source size 60,008 bytes. Printed label: ACE MICA, Block Wall Salt, Design No. 1305; user calls it Daytona wood. UV mapping excludes bottom label. Internal reference images remain visual references from chat, not repository images.

## Validation performed

- Node 24.22.1 syntax checks: model.js, studio.js and Three core passed.
- Model checks: seven selectable units, 75 source faces, eight opening actions, four tall wood shelves, three open glass shelves, no fixed-section opening action; rear hinge fixed in world space; side door moves toward bay-window side; seat rotates upward and both close/reset; reference-mode visibility toggles. Texture loader stubbed for these geometry tests; not visual proof.
- Local in-app browser preview at 1280 × 712: WebGL canvas loaded with no compatibility note; no captured console errors. Actual texture, white hanging wardrobe interior, glass cabinet closed/open with four shelves, side door opened, and bay-seat lift visually inspected. Initial seat framing clipped raised lid; bounds now include open poses. Final seat framing check pending.
- Mobile viewport 390 × 844: DOM confirmed correct viewport and contained stage sizing. Selected glass/wardrobe UI and finish selector operated. Mobile screenshot transport was scaled, so this is limited mobile visual evidence.
- Finish persistence: changed hanging wardrobe to warm grey, reloaded, reselected and verified retained finish. Restored Daytona afterward.
- Selected-unit rotation operated without changing selection; damping disabled, no forced resize recentering. Full delayed drift/tour-completion check pending.

## Limits and next action

Publication and live route verification pending at this checkpoint. Exact panel thickness, hardware, hook count/placement, cushion thickness, frame profile, shelf spacing and opening angles are visual approximations listed in design.json. No quote imported. CPU compatibility rendering and real handset/hardware testing not performed.

Next: verify deployment/live assets, seat framing, lighting controls and tour stop/replay; record results before sharing customer URL.

## Publication and final checks — 2026-10-31

Viewer code commit a70797f1dbe43702e61ee9ad305f99234d120242 deployed successfully in GitHub Actions run 41116691420. Live /ratesh/ route opened in browser and rendered. Captured console error list empty. Final local seat-opening screenshot confirms entire raised lid remains in frame. Live tour starts and stops; stop now restores finish/detail controls without reframing the camera. Delayed full-tour completion not tested. Real handset and CPU fallback still not tested. Finish persistence was tested locally; production uses the same code and separate origin storage.

Live URL: https://britsingh20-source.github.io/olive-tree-3d-studio/ratesh/

Next: verify final tour-control patch deployment, then share URL. Customer can review the design; unconfirmed fabrication dimensions/hardware remain clearly marked.

The tour-stop patch uses studio.js?v=ratesh2 so returning clients load the updated controls.

## Final live verification

Final viewer source commit 008fa9bf4d163642c3d438b19adf502cc0173fdc deployed successfully (run 41117004605). Live DOM confirms studio.js?v=ratesh2 and a rendered canvas without fallback note. Live lighting off/on and Reference colours toggles responded. Tour replay/stop tested on the final version; when stopped in a focused wardrobe view, finish strip, details and quote selection controls returned. Captured live console errors: none. Full tour completion and real mobile hardware remain untested.

Ready for customer review. No further design explanation is needed for the already supplied wardrobe structure. Exact hardware and fabrication dimensions remain approximations as listed in design.json.

## Small plants on glass shelves — 2026-10-31

User requested small plants on the glass shelves. Added one compact green plant in an ivory pot to each of the three narrow open glass shelves. Pots sit on shelf tops, in front of Daytona backing; warm lights remain visible. Plants belong to the open-shelf selectable unit and do not recolour when mica changes. Decorative species/pot shapes are illustrative.

Validation: model.js syntax passed; local 1280 × 712 WebGL preview selected Open glass shelves and visually confirmed three plants standing on the shelves with visible warm lighting. No source geometry or opening actions changed. No new mobile-specific check needed for this static decoration change. Module versions bumped to plants1 for both studio.js and model.js. Deployment verification pending.

Plant update commit 985de618a2fc23fa934116bbfdc8c6635074ab63 deployed successfully in run 41118233495. Existing live /ratesh/ tab refreshed; selected Open glass shelves and visually confirmed all three plants, pots, shelves and warm lighting. Captured live console errors: none. Ready for customer review.

## Foyer + pooja unit — intake started 2026-11-23

New project for the same customer (user confirmed Mr. Ratesh, wardrobe record). Source `Untitled (8).skp` (109,242 bytes, sha256 7a01bdcd…e387) from the user's local "foir and pooja" folder, staged and parsed with the bundled read_skp.py on Linux Python 3: EXTRACTION_OK, 68 vertices, 107 edges, 40 root faces, 54 × 53 × 84 in bounds, zero omitted instances. Geometry stored at customers/ratesh/foyer-pooja-source-geometry.json. The model is unpainted, so sections are identified by position (see design.json `foyerPooja.sectionsByPosition`). Folder name suggests foyer + pooja; not yet confirmed.

Nothing built yet. Planned route /ratesh/foyer-pooja/ (existing /ratesh/ wardrobe route untouched).

Next: confirm meaning of section 1, then 2 and 3, then finishes/fittings one question at a time.

Correction (same day): second file `gn mills foir and pooja.skp` (107,825 bytes, sha256 28d2aba3…fd75) parsed EXTRACTION_OK and is identical in geometry and face colours to Untitled (8).skp. Both ARE painted — the earlier "unpainted" note came from grouping on a wrong JSON key. User rejected the position-based section reading; intake now proceeds colour by colour (design.json `foyerPooja.sourceColours`).

### Foyer + pooja — first viewer draft (2026-11-23)

Confirmed in chat (all saved in design.json `foyerPooja.confirmed`): green = artificial grass mat; red-orange = two drawers; brown = fixed PVC louvers in Straight Wood colour; peach and white = ACE MICA Straight Wood 1201, matte; tall unit = pooja items storage, upper two shutters with Pattern 1 CNC pooja cutting and 2 shelves, lower two plain shutters with no shelves; counter = storage box for books; all fronts handleless; warm light inside pooja + strip light on grass wall.

Built dist/ratesh/foyer-pooja/ (index.html, studio.js copied from /ratesh/ with paths/text adapted, new model.js, exact-layout.js from scripts/prepare-ratesh-foyer-pooja-layout.py, textures from scripts/make-ratesh-foyer-textures.py, reference straight-wood-1201.jpg). /ratesh/ wardrobe page only gained a nav link to the new page.

Validation performed:
- `node check-ratesh-foyer-pooja.mjs` passed: 40 source faces retained exactly, 54 × 84 × 53 in bounds, 5 source colours, 7 units, 8 actions; every door swings outward and drawers slide out; lights and reference toggles. Texture loader stubbed — not visual proof.
- Local headless Google Chrome (Playwright, SwiftShader software WebGL — not GPU hardware) at 1280 × 800 and 390 × 844: canvas rendered, no compatibility note, no page errors (only favicon 404). Visually checked full view, Open all (doors + drawers), lights off, Reference colours, selecting the CNC pooja unit and opening it (2 shelves + warm light visible), finish saved to localStorage and retained after reload, tour started and stopped on drag.
- Known limitation found: previewing another finish on the pooja unit changes only its sides; CNC door faces stay Straight Wood.
- Not tested: real phone/GPU hardware, CPU compatibility renderer, drag-then-resize camera persistence, full tour completion.

Published: commit 9cca7a5dc6767737cc30fc6e7043bdf60247a69f deployed in GitHub Actions run 45230755034 (success). Live https://britsingh20-source.github.io/olive-tree-3d-studio/ratesh/foyer-pooja/ returned 200 and rendered in headless Chrome (SwiftShader) at 1280 × 800; Open all, lights off and Reference colours behaved as locally; no page errors (only favicon 404). Ready for customer review.

Next: customer review; confirm book-counter interior and shutter hinge sides; decide on round centre disc of CNC pattern.

### Mica change — 2026-11-23

User said Straight Wood 1201 looks too dark; all wood surfaces now use ACE MICA Natural Rough Cut Wood 9189 (matte), including louver colour and CNC door textures (regenerated with scripts/make-ratesh-foyer-textures.py). Asset version fp2. Source checks re-passed; local headless Chrome (SwiftShader) at 1280 × 800 and 390 × 844 rendered with the lighter wood and no page errors.
Deployed 57bcfeaf in run 45231706439 (success); live page serves studio.js?v=fp2 and rendered in headless Chrome (SwiftShader) with the new wood, no page errors.

### Scandic Wood 1382 + texture rendering fix — 2026-11-23

User supplied ACE MICA Scandic Wood 1382 and said earlier texture output looked clumsy. Cause found: every box face stretched the whole 500 × 1000 sample (label included) to its own size, so grain was smeared on long panels and squashed on edges. Fix: label-free, 2× upscaled tile treated as a 48 × 87.4 in sheet; world-scale UVs on every box (vertical grain on upright faces, along the long side of flat faces), mirrored repeat, 16× anisotropy; CNC door textures regenerated from the same tile at true scale; studio paint() sets mirrored wrap on preview textures. Asset version fp3.

Validation: check-ratesh-foyer-pooja.mjs passed; local headless Chrome (SwiftShader) 1280 × 800 and 390 × 844 rendered without page errors; drawer close-up visually shows continuous, natural grain at consistent scale. Rendered tone reads slightly darker than the flat sample under studio lighting.
