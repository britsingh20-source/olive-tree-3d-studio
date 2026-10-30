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
