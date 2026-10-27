# Mr. Suresh — checkpoint

Updated: 27 October 2026. Read design.json for confirmed choices.

## Current implementation

- Live route: https://britsingh20-source.github.io/olive-tree-3d-studio/suresh/
- Latest checked viewer entrypoint: ?v=rotate8; index loads studio.js?v=rotate8.
- Reuses shared rathesh studio.css and tour.js, vendored Three.js and OrbitControls.
- Original 48 extracted root faces retained in Reference colours.
- Separate W207 PVC photo grain and black grooves; earlier image texture retained on wooden cabinetry.
- Five lower shutters lift upward; open storage; fixed louvers; warm-white LED.
- Rotate, zoom, pan, individual selection, finish tray, local persistence and tour available.
- Viewer quotation remains unset.

## Recent fixes

1. PVC reference photo now used instead of procedural approximation.
2. Coplanar white source enclosure and generated cabinet sides were found. Neutral enclosure now has polygon offset and no self-shadow casting/receiving; source coordinates remain unchanged. Near/far camera range tightened and anisotropic filtering increased.
3. resize() no longer calls fit(); unchanged stage sizes are ignored.
4. Drag detection remembers movement even when a pointer returns to its starting point, preventing unintended selection/refocus.
5. Orbit damping disabled and rotateSpeed set to .65 to stop post-release drift.

## Actual verification

- Initial build historically passed check-suresh.mjs for source faces/bounds, five lift actions, fixed louvers, TV size and tour sequencing. This predates photo TextureLoader changes; do NOT call this a current test pass.
- Initial desktop 1440x1000 and mobile 390x844 compatibility checks covered selection, wooden/glass opening, finish persistence and overflow. Earlier full WebGL inspection preceded the latest finish/side/rotation fixes.
- Current rotation fix: syntax check passed; resize harness invoked three resizes (two size changes) with zero fit/camera resets.
- Latest live browser test used CompatibilityRenderer (WebGL unavailable). Dragged full TV unit to a side/rear angle, released and took subsequent screenshots; view settled and stayed at that angle rather than returning to the front.
- Deployment of rotation release 03757abca94e24491788c56287f528c10cf7f074 completed successfully; GitHub Actions run 40477728931.

## Remaining verification and limitations

- Latest side-speckling fix has NOT been visually verified in full WebGL on the user's device. Do not mark the original side complaint definitively resolved from a CPU preview.
- Recheck current mobile touch drag/pinch and orientation changes; latest browser drag test was desktop compatibility mode.
- Recheck door movement and tour after future geometry/camera edits. No new failure is currently reported for these features.
- CPU compatibility renderer uses simplified face texture projection and painter sorting; side/rear material fidelity differs from WebGL. Do not confuse those limitations with the source geometry.
- check-suresh.mjs may need browser-aware/stubbed photo loading before a new meaningful automated run.
- Original SKP and marble reference are not guaranteed available in a fresh chat. The extracted layout and both wood/PVC image assets are in GitHub. Request only an unavailable source if needed for new geometry verification.

## Next action

For a new request, inspect current code and this checkpoint first. Ask no repeated colour/material questions. If the user reports side pixelation or rotation again, reproduce in the actual renderer and distinguish overlap flicker, texture aliasing, tour reframing and compatibility projection. Record observations and tests before claiming a fix.
