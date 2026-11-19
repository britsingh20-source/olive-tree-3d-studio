# Mr. Pon Karthikeyan — TV unit (Irugur) checkpoint

Updated 17 November 2026. Confirmed choices are in design.json.

## Current implementation

- Viewer built in dist/pon-karthikeyan (route /pon-karthikeyan/), asset version `pk1`, storage key `pon-karthikeyan-tv-v1`.
- **Live** at https://britsingh20-source.github.io/olive-tree-3d-studio/pon-karthikeyan/ — commit cbb2fa9, GitHub Actions run 44081269882 succeeded (Claude GitHub App installed by the user 17 Nov 2026).
- Built from the dist/ratesh template: shared rathesh studio.css and tour.js, vendored Three.js r180 + OrbitControls, compatibility fallback, finish tray with persistence, reference colours, guided tour (button only), no damping, resize never calls fit, drag-vs-tap detection.
- Eight selectable units:
  1. Green matte TV panel (behind the TV and above the ledge) plus an illustrative 65-inch TV.
  2. Wooden mica ledge with a warm-white LED strip under it and illustrative decoratives.
  3. Fixed PVC louver header from 84 in to 120 in, using the customer's PVC photo. No opening action.
  4. Tall black-glass cabinet with a left-hinged glass shutter. The rounded edge comes from the exact SKP faces; the edge and side are wooden mica.
  5. Floating console 8 in above the floor:
     - five side-hinged wooden mica shutters (hinge sides illustrative);
     - one black glass shutter that lifts upward;
     - wooden mica top, with a warm-white glow underneath.
  6. Awards niche with textured green wallpaper and two L-shaped wooden mica shelves; trophy, certificate and medal props are illustrative.
  7. Robot cleaner bay with a 16 in robot visible through the open slot under the console, and a fixed wooden mica shutter facing the TV.
  8. Pooja unit:
     - CNC double doors facing the TV, opening toward it, made from the customer's reference photo;
     - green matte front;
     - 4 in strip with a concealed vertical light;
     - green matte continued on the 9 in wall end.
- Textures are the customer's own photos: wood mica, PVC louver and the CNC pooja door.

## Source intake

- `tv unit irugur.skp` and `tv unit irugur (1).skp` were copied from the user's PC folder Downloads\NEW through the desktop bridge.
- Earlier direct chat uploads of the same files were corrupted in transfer. About 78k and 82k bytes were replaced by U+FFFD, and the reader reported UNSUPPORTED_CONTAINER on those copies. This was a transfer fault, not a model fault. For future SKPs, use the PC folder or a ZIP.
- Plugin reader result for both files: EXTRACTION_OK, inches, 149 vertices, 242 edges, 95 root faces, faces spanning 153.05 × 82 × 120 in, no omitted instances. The two files have identical geometry and materials.

## Colour intake (all source colours resolved)

See `design.json` → `sourceColours` and `confirmed`. Two answers needed interpretation:

- **Corrected answer:** the small bottom glass shutter's earlier "side hinge" answer was corrected to lift upward.
- **"Yes, proceed":** the final reply was taken as confirming both a wooden mica console top and the under-console LED.

## Actual verification (17 Nov 2026)

- **Automated check:** `node check-pon-karthikeyan.mjs` passed. Node does not load images, so the texture loader was stubbed for this check. It covered:
  - all 95 source faces (vertices and loops) and their bounds;
  - unit IDs, and no opening actions on the fixed units;
  - the left-hinged tall glass shutter;
  - the console's five hinged shutters and one lift-up flap;
  - the pooja doors' full open/close, opening toward the TV, and a 0–84° sweep that never hits the console;
  - the robot's size against the slot;
  - the lights toggle, reference mode, a resize harness (no fit, no camera move) and damping disabled.
- `node --check` passed for studio.js.
- **Browser (headless Google Chrome, Playwright, WebGL via ANGLE/SwiftShader software GL — not a real GPU or handset):**
  - **1280×900:** checked the full view, Open all, pooja closed and open, the niche, the robot bay, reference colours, and a drag to a side angle. No page errors; the only failed request was a 404 for favicon.ico.
  - **Tour and finishes:** started the tour and stopped it ("Tour stopped · you are in control"). Applied Green matte mica to the console, reloaded, and it was retained (localStorage).
  - **390×844 mobile viewport:** the page layout, the console product view with shutters opened, and the finish tray showing the wood sample swatch.
- **Live check after deployment:** loaded the live URL in headless Chrome (SwiftShader WebGL) at 1280×900. studio.js, model.js, exact-layout.js and all four texture images returned 200. The closed view and Open all both rendered correctly; the only 404 was favicon.
- **Not yet done:** a real phone (touch/pinch), a real GPU, and the full tour running to completion.

## Revision 2 — 17 Nov 2026 (customer feedback with second reference image)

- **PVC louvers rebuilt as 3D vertical slats over a dark backing.**
  - The slats are 1.4 in wide on a 2 in pitch, with an even procedural grain in the walnut tone of the PVC photo.
  - They are merged into one mesh for performance.
  - The louvers now also cover the side-wall return above 7 ft.
  - A warm LED strip runs along the ceiling line, with 3 point lights.
- **TV panel stands 3 in off the wall** and is now matte green (#6b8559). The TV was moved forward to sit on the panel, and the upper green strip stays on the wall.
- **Awards niche background is now green floral mica** (procedural tone-on-tone pattern).
- **Pooja CNC shutters now use the customer's wood mica.** The board areas were replaced with vertical-grain wood; the cut-outs, bells, lotus and handle are kept. Door edges are wood mica too.
- **Wood grain is now consistent.** UVs are worked out from world position with mirrored repeat, so the grain runs continuously across the console shutters. Tall members (tall-unit side, rounded edge, pooja strip and doors) have vertical grain.
- **Lighting cut from 13 to 8 point lights** for phone performance.
- The finish tray adds sage green and olive green alternatives.

### Rev 2 verification

- `node check-pon-karthikeyan.mjs` passed. It adds checks for the 3 in panel depth, the louver slat count (header plus side return), the floral niche and the wood pooja doors.
- **Local headless Chrome (SwiftShader software WebGL), 1280×900:** inspected the full view, the pooja (closed) and the niche.
  - The software renderer ran at about 1 fps, and the existing Ratesh page was equally slow. That is a limit of the test machine, not a measure of performance.
  - Real-phone frame rate has not been measured.
- **Deployed:** commit b4ad201, Actions run 44083616525 succeeded. In headless Chrome the live URL loaded the pk2 modules and textures (all 200) and the full view rendered as in the local check.

## Revision 3 — 17 Nov 2026

- **Hollow left side of the tall left unit closed** with a full-height wooden mica panel (8–84 in, vertical grain), per the customer's screenshot. The inner carcass side and the console's left end were also closed.
- **Lesson:** this source face was white. It wasn't one of the coloured faces, so it was never asked about. For future clients, also show the visible white/unassigned faces during colour intake.
- **Verified:** check passed (asserts the left side panel). Local SwiftShader screenshot of the tall unit rotated to its left side shows a solid wood side with no gap.

## Revision 4 — 17 Nov 2026

- **Concealed warm-white strip added on both sides and the top of the 3 in TV panel.** It has 3 point lights plus an additive glow gradient in the reveal, and toggles with Lighting.
  - The panel is drawn with a 1.5 in reveal so the light can show.
  - The green mica wall panel now covers the wall behind and above the TV panel.
- **Verified:** check passed (panel depth 3.1 in, 3 panel lights, reveal under the ledge). Local SwiftShader screenshots of the full view and the TV panel view show the light line on the top and the right side; the left side was hidden at those angles.

## Revision 5 — 17 Nov 2026 (supersedes rev 4 lighting)

- **TV panel lighting changed to a single vertical concealed strip on the niche side**, running from the console up to the louvers.
  - The left and top strips were removed.
  - The panel is now flush with the tall unit and the ledge, with a 1.5 in reveal on the niche side only.
- **New concealed strip along the bottom of the louvers** at 84 in, running full width from the left glass cabinet to the right end. It has 2 point lights and a glow wash down the green panel.
- **Verified:** check passed (1 panel light, panel x 24.1–118.5, full-width louver bottom strip). Local SwiftShader full-view screenshot shows the wash under the louvers and the vertical strip by the niche.

## Revision 6 — 17 Nov 2026

- Removed the full-width strip under the louvers, following the customer's "only the side vertical light enough". Only the vertical TV-panel strip on the niche side remains.
- The other previously confirmed lights are unchanged.
- Check passed.

## Revision 7 — 17 Nov 2026

- **All point lights removed (customer: LED strip only, the spots looked odd).** Every light is now an emissive strip plus an additive gradient wash on the lit surface:
  - under the ledge;
  - the vertical strip by the TV panel;
  - the louver ceiling line and side return;
  - under the console (floor and wall);
  - the pooja strip and pooja interior.

  The Lighting button toggles all washes.
- **Tall black-glass cabinet:** vertical strips inside on both sides, washing the back and sides.
- **Pooja front (foyer side):**
  - Green grass mat.
  - Illustrative stainless-steel CNC scenery panel (tree, hills, birds).
  - This corrects the earlier 'green matte' reading of 'green matt'.
- **Verified:**
  - Check passed: no lights in the scene graph, 2 tall-cabinet strips, the grass foyer face, and 12 glow washes that toggle with Lighting.
  - Local SwiftShader screenshots show the full view without hot-spots and the open tall cabinet lit inside.
  - Wash strengths were tuned after the first screenshot.

## Revision 8 — 17 Nov 2026

- **Tall glass cabinet:** 4 evenly spaced transparent glass shelves added (count assumed).
- **Grass mat:** finish redone as dense mixed-green blades with bump, at a smaller tile size.
- **Pebble box:** added at the foot of the foyer face — 24.1 in wide (pooja width), 15 in high, 8 in deep (assumed), wooden mica, filled with merged white/grey pebbles.
- **Verified:** check passed. Local SwiftShader screenshots show the foyer side (grass, SS art, pebble box) and the opened tall cabinet with its glass shelves lit.

## Revision 9 — 17 Nov 2026

- **Robot cleaner animation** (button "▶ Robot cleaner", which toggles to Stop).
  - **Route:** the robot leaves the dock, goes under the console through the open slot, cleans 4 serpentine rows in front of the unit, then returns and parks. It turns smoothly and its side brush spins.
  - **Implementation:** the route is driven by `model.robot.update(dt)` inside `model.update`, and `onDone` resets the button.
- **Verified:** check simulates the full run at 60 fps. The robot only passes x 120–144 under the console (y > 55 in); it reaches the far left (x < 20 in) and the front area, finishes, and ends exactly at the dock.
- **Not visually verified:** the motion itself. The local software renderer runs at about 1 fps and the studio clamps frame steps to 0.05 s, so it can't show the animation meaningfully. It needs a real browser.

## Revision 10 — 17 Nov 2026 (supersedes rev 9 button)

- **The robot now runs by itself in a loop; the button is removed.**
  - It starts 2 s after load.
  - Each cycle it rests 3–4 s (random) in the bay, then makes a 6 s trip out through the slot to a new spot under or in front of the console (not the same as the previous trip), does a short zigzag clean, and returns.
  - `paused` can stop it.
- **Verified:** the check simulates 70 s at 60 fps:
  - ≥6 trips, each 6 s ±0.1;
  - every rest 3–4 s;
  - ≥3 distinct spots;
  - the robot is back at the dock after each trip;
  - it never leaves the slot zone at x 120–144.
- **Not visually verified:** the motion. It still needs a real browser.

## Design preview — 19 Nov 2026: curvy double-layer TV panel (not confirmed)

- **Request:** the customer asked for a curvy double-layer panel like the reference image.
- **What was added:** a switchable preview next to the existing design. The current panel is unchanged and stays the default.
  - Button: "TV panel: Current / Curvy (preview)", saved in localStorage.
  - Curvy mode: a 3 in raised green mica layer with an S-curve left edge and a warm strip and wash following the curve. The rectangular box and its vertical strip are hidden, and so is the under-ledge wash.
- **Verified:**
  - Check: default is current; the switch shows and hides each design; the TV stays on the raised layer between 28 and 60 in high; the layer is 3 in; the Lighting toggle covers the curve glow; switching back restores everything.
  - Local SwiftShader screenshots of the full view and the TV-panel view in curvy mode.
- **Deployed:** commit 69b579d. The first Pages run failed with a transient GitHub error ('No artifacts named github-pages'); the re-run of run 44426976781 succeeded and the live page serves pk12.
- **Update (19 Nov, b):** the ledge is removed in the curvy design.
  - **Curve:** re-traced from the reference photo by detecting its glowing edge plus grid reading, and scaled so the TV matches the reference TV position.
  - **Added:** a rounded bottom-right corner, with the strip and wash following both edges. The glow is clipped to the panel area.
  - **Verified:** check passed (ledge hidden in curvy, restored in current). Local SwiftShader side-by-side screenshot against the reference.
- **Update (19 Nov, c):** in curvy mode, the louver run above the TV panel (x 24.1–120) is hidden: slats, backing, cove strip and wash.
  - Louvers are now built as three runs.
  - The base green and the curvy layer go up to the ceiling (120 in).
  - The curve is extended with the photo's upper sweep, using a piecewise vertical scale above the TV top.
  - **Verified:** check passed (middle louvers hidden only in curvy; layer top at 120 in). Local SwiftShader side-by-side screenshot against the reference.
- **Update (19 Nov, d): three TV panel options**, offered prominently on the page.
  - The toggle button was replaced by a "Choose your TV panel design · 3 designs" card section above the toolbar.
  - Each card has a rendered thumbnail (option-1/2/3.jpg), its option number, a description and a Selected state.
  - A badge on the 3D view reads "TV panel · Option N of 3: …". On phones the cards swipe sideways, with a hint.
  - The choice is saved in localStorage as panelDesign: current | curvyLouver | curvyCeiling. The old value 'curvy' maps to curvyCeiling.
  - **Model:** makeCurvy() builds Option 2 (top at 84 in, linear scale, louvers full width) and Option 3 (top at 120 in, piecewise scale, middle louvers hidden).
  - **Verified:**
    - Check passed: each option shows exactly its group; TV clearance and layer top (84/120); no ledge on 2 and 3; middle louvers visible on 1 and 2 and hidden on 3; lights toggle; return to 1 restores everything.
    - Local SwiftShader: clicked all three cards; badge and localStorage updated (curvyCeiling); thumbnails rendered from each option.
    - Desktop and 390 px mobile screenshots of the chooser.
- **Update (19 Nov, e): Option 4, "Curvy with open niches"** (customer: remove the glass display box and show the paneling fully to the ceiling with open storage cut-outs like the reference).
  - **Removed in Option 4:** the tall-glass group and the left louver run (`louver.left`).
  - **Base panel:** an extruded green base 8.15 in deep across x 0.1–120, z 20–120, with 4 rounded niche holes laid out from the reference.
  - **Lighting:** a niche strip plus a back wash in each niche.
  - **Curvy layer and TV:** the curvy layer (`makeCurvy` with backY 64, minX 0.1) sits in front, and the TV is moved +8.15 in onto it.
  - **Console:** keeps a rounded left end (an ellipse approximation of the old rounded edge).
  - **Props:** books and vases in the niches are illustrative.
  - **UI:** cards now say "4 designs" (2-column grid under 980 px). The tall-glass unit button is hidden in Option 4, and the tour is rebuilt from the visible units whenever the design changes.
  - **Verified:**
    - Check passed: Option 4 hides the tall glass and the left and middle louvers, has 4 niches, the TV sits on the layer, the layer tops at 120, and everything restores on Option 1.
    - Local SwiftShader: chose Option 4; the badge reads Option 4 of 4 and the tall-glass button is hidden.
    - Tour run for 60 s: it never visited the glass cabinet, with no page errors.
    - Side-by-side screenshot against the reference.
- **Awaiting customer feedback:** which option; the layer tone; Option 4 build-out depth and niche layout. See `design.json` → `designPreviews`.

## Next action

Share the live URL. Ask the open questions in design.json only as needed: the glass cabinet interior, niche lighting and quotation rates. Then check on a real phone.
