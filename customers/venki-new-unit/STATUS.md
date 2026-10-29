# Mr. Venki — new unit checkpoint

Updated 29 October 2026. Confirmed choices are in design.json.

## Current implementation

New route: https://britsingh20-source.github.io/olive-tree-3d-studio/venki-new-unit/

Implemented in dist/venki-new-unit; publication explicitly approved by the user; published at commit fbcebbf5790ab0632a277b98da9fea3a967a9eb7. Live desktop compatibility-mode checks completed; full WebGL/mobile checks pending. This is a separate unit. Existing /venki/ and /venki/study/ files are untouched.

- Two double-door cabinets with handleless beige-matte fronts; four evenly spaced shelves per cabinet. No hanging rails or internal drawers in these cabinets.
- Fixed tall beige front; smaller side section in walnut brown matte mica. No opening action on fixed section.
- Walnut brown matte handleless side shutter: rear-edge hinge, swings inward toward mirror through 90 degrees in the preview. One hanging rod only behind it.
- Mirror with warm-white light and touch toggle. Walnut brown matte mirror surround and four open compartments.
- Beige-matte handleless makeup drawer; fixed brown mica table beneath it. No PVC louver assumption.
- Select individual units, rotate/zoom/pan, front/top controls, doors/drawer, front/side mica choices, browser persistence, reference colours and optional guided tour.
- Tour starts only by explicit button. Manual rotation uses no damping; resize does not call fit; dragged-out-and-back gestures are marked moved to prevent accidental selection.
- No loft or quotation prices added.

## Source and assets

Three uploads Untitled (5)(1).skp, Untitled (6)(1).skp and Untitled (7)(1).skp were downloaded and read with scripts/extract-prem-skp.py. Each has 82 vertices, 125 edges, 50 root faces; all extracted geometry/materials compare equal. Bounds: 132 x 24 x 84 inches. Ty human instance omitted. SHA256 values are in design.json.

Normalized source face loops, IDs and colours retained in dist/venki-new-unit/exact-layout.js and displayed under Reference colours. Fixed brown faces use the actual extracted polygons, including table opening loops. New casing, thicknesses and moving fronts are render approximations around verified source planes.

Original SKPs are not committed. Scratch copies and JSON exist at /workspace/scratch/b44db19839ae/venki-work, but may expire. The extracted layout is durable in the repository. Procedural walnut texture reuses existing Venki createWoodTexture; no exact laminate photo was supplied.

## Actual verification

- All three extractions passed extractor loop-continuity and face-planarity assertions.
- node --check passed new model.js and studio.js.
- node check-venki-new-unit.mjs passed: all 50 source face vertices/loops preserved; 132 x 84 x 24 inch renderer bounds; two double-door cabinets; four evenly spaced shelves each; no actions on fixed front/surround/table; one rod and no shelves/drawers behind side shutter; rear hinge and inward rotation; open/close animation; mirror toggle; reference mode; resize harness with zero fit calls and no camera movement.
- Swept the side shutter 0–90 degrees in one-degree steps: no mirror collision or crossing into open compartments. Minimum axis-aligned Z gap to mirror pane about 57 mm in the render. This is a render clearance check, not fabrication approval.
- No browser screenshots or full WebGL validation completed yet. Local browser installation failed (download was not a valid archive); cloud browser cannot access localhost. Do not claim desktop/mobile interactions or material fidelity verified from source tests.

## Approximations / outstanding

See design.json. Exact laminate shades/grain, physical material grades/thicknesses, fittings, rod placement and mirror reflection remain illustrative. Table brown tone uses provisional walnut colour. No customer-specific prices imported.

## Next action

User explicitly approved public publication of the viewer and design records on 29 October 2026. Publish using the connected GitHub tools, then inspect live viewer in cloud browser. Verify full/individual view, side/rear rotation persistence, doors/drawer, mirror light, reference mode, finish reload and mobile layout/touch when available. Record actual renderer/device and limits. User confirmed evenly spaced shelves in latest turn; do not repeat that question.

## Live check after publication

29 October 2026: opened the exact customer URL in cloud Chrome, approximately 1348 x 926 viewport. Page loaded with correct new-unit title, eight selectable units and model canvas. Renderer explicitly reported Compatibility view (WebGL unavailable). Observed closed model, clicked Open all and observed cabinets with shelf interiors and pulled-out drawer; no claim of full WebGL material fidelity. Browser-resize/touch, finish reload and full tour checks remain pending. Public route verified live. The initial shell HTTP probe returned 404 before deployment completed; subsequent cloud-browser page load is the live verification.
