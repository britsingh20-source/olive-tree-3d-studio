# Mr. Pon Karthikeyan — TV unit (Irugur) checkpoint

Updated 17 November 2026. Confirmed choices are in design.json.

## Current implementation

- Viewer built in dist/pon-karthikeyan (route /pon-karthikeyan/), asset version `pk1`, storage key `pon-karthikeyan-tv-v1`.
- **Not yet published.** This Claude session could not get write access to the repository (add_repo push was refused); files were prepared in a local clone for the user to commit.
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
- **Not yet done:** live deployment, a real phone (touch/pinch), a real GPU, and the full tour running to completion.

## Next action

1. Commit `dist/pon-karthikeyan/`, `customers/pon-karthikeyan/`, `customers/index.json`, `scripts/prepare-pon-karthikeyan-layout.py` and `check-pon-karthikeyan.mjs` to main.
2. Wait for the Pages deployment, then open https://britsingh20-source.github.io/olive-tree-3d-studio/pon-karthikeyan/ and record the live check.
3. Ask the open questions in design.json only as needed: the glass cabinet interior, niche lighting and quotation rates.
