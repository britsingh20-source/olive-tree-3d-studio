# Property Manager — Urban Heaven site tour · checkpoint

Updated 19 November 2026. Decisions and approximations are in design.json.

## Current implementation (asset version `uh1`)

- Route `/urban-heaven/` → `dist/urban-heaven/` (index.html, tour.js, route.js). Vendored Three.js from `dist/vendor`.
- Pickup chooser (Thudiyalur / Mettupalayam) with stop list and approximate km; `?from=thudiyalur` or `?from=mettupalayam` starts directly (for WhatsApp links).
- One shared 3D world: Mettupalayam Road (NH-181) running north from Thudiyalur to Mettupalayam with tamarind-lined verges, bilingual green stop boards (Tamil + English + km to Urban Heaven), KNM Mills compound and sheds at Santhaimedu, blue turn-guidance boards, side road through coconut groves, Urban Heaven gate arch, red-earth plots with kerbs and flags, "Site map — coming soon" board.
- Cab ride: default view from the front-left passenger seat of a right-hand-drive cab with a "PROPERTY MANAGER" dashboard screen; Outside view shows a white cab with a yellow PROPERTY MANAGER roof sign. Car keeps to the left lane. Drag to look around (no drift; "Look ahead" resets).
- HUD: km travelled / km to site, next stop or turn with distance, stop/turn banners, progress strip with stops, Pause/Play, 1×/2×/4×, Change pickup. Slows at stops and turns; arrival card with Ride again / Change pickup.
- Thudiyalur ≈ 10.7 km (turns L, R, L); Mettupalayam ≈ 18.7 km (turns R, R, L).

## Tests actually run (19 Nov 2026)

- `node check-urban-heaven.mjs` — passed (stop order, turn sequences, leg lengths, path continuity, totals, page wiring). Source test only.
- Headless Google Chrome via Playwright with SwiftShader (software WebGL), 1280×760: pickup screen, Thudiyalur start, before Narasimhanaickenpalayam, before KNM (inside + outside), before turn 2, approaching gate, inside site (outside view), arrival card; Mettupalayam route before Karamadai and before KNM. 390×780: pickup screen and Mettupalayam drive start. No page errors (one 404 = missing favicon).
- **Live** at https://britsingh20-source.github.io/olive-tree-3d-studio/urban-heaven/ — commit 271baa9, Pages run 44450011200 succeeded. Live route re-checked in headless Chrome (SwiftShader, 1280×760) with `?from=thudiyalur`: drive, KNM turn, gate and arrival all render; `?from=` auto-start confirmed.
- Not yet checked on a real phone GPU.

## Next action

Ask Bright the open questions in design.json one at a time (first: confirm 'Sandimad' and the KNM Mills km), then add the site map after arrival.
