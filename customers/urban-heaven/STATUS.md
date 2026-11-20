# Property Manager — Urban Heaven site tour · checkpoint

Updated 19 November 2026 (rev uh2). Decisions and approximations are in design.json.

## Current implementation (asset version `uh1`)

- Route `/urban-heaven/` → `dist/urban-heaven/` (index.html, tour.js, route.js). Vendored Three.js from `dist/vendor`.
- Pickup chooser (Thudiyalur / Mettupalayam) with stop list and approximate km; `?from=thudiyalur` or `?from=mettupalayam` starts directly (for WhatsApp links).
- One shared 3D world: Mettupalayam Road (NH-181) running north from Thudiyalur to Mettupalayam with tamarind-lined verges, bilingual green stop boards (Tamil + English + km to Urban Heaven), KNM Mills compound and sheds at Santhaimedu, blue turn-guidance boards, side road through coconut groves, Urban Heaven gate arch, red-earth plots with kerbs and flags, "Site map — coming soon" board.
- Cab ride: default view from the front-left passenger seat of a right-hand-drive cab with a "PROPERTY MANAGER" dashboard screen; Outside view shows a white cab with a yellow PROPERTY MANAGER roof sign. Car keeps to the left lane. Drag to look around (no drift; "Look ahead" resets).
- HUD: km travelled / km to site, next stop or turn with distance, stop/turn banners, progress strip with stops, Pause/Play, 1×/2×/4×, Change pickup. Slows at stops and turns; arrival card with Ride again / Change pickup.
- Thudiyalur ≈ 10.7 km (turns L, R, L); Mettupalayam ≈ 18.7 km (turns R, R, L).

## Rev m14 / s8 (20 Nov 2026) — real site position

- Bright's pin 5WPX+F9 decoded to 11.186187, 76.948437. Turn-off moved ~1.9 km north to the real junction (11.18607, 76.96040); side route = real OSRM road geometry to the Panchayat road, then entry to the 9.0 m road. Turn sequence: KNM left (right from Mettupalayam) → right → left → left onto Panchayat road → right into the site. Map site outline = the Phase 2 boundary placed on the pin; 3D imagery centred on it; 3D cab now arrives from the north.
- Measured: Thudiyalur 14.36 km, Mettupalayam 17.01 km. Checked headless Chrome (map at turns/gate, zoom, 3D on real land). No page errors.

## Rev m13 / s7 (20 Nov 2026) — real surroundings

- Cartoon fields and coconut palms removed. Ground = three live Esri World Imagery rings (z15 ~8 km, z17 ~2.7 km, z19 ~0.45 km; CORS ok; polygon offsets so finer layers win), centred on the site position passed from the map tour. Gradient sky + haze fog to the horizon; park trees rebuilt as clustered canopies; 12.2 m road strip trimmed to the site frontage (+35 m each side). Imagery credit added.
- Checked headless Chrome/SwiftShader 1280×760 (final + orbit) and 390×780 (plot card). No page errors.
- Limitation: centred on the approximate site until Bright's gate pin.

## Rev m11 / s5 (20 Nov 2026) — Phase 2 layout in 3D

- `scripts/prepare-urban-heaven-layout.py` traces the 46 plots, park, P and EB from the PDF raster by colour (convex hull per plot), numbers them by position, attaches the PDF table areas → `dist/urban-heaven/site-layout.js`. Asserts 1..46 and the 10/20/10/6 category split.
- `dist/urban-heaven/site3d.js` (Three.js, shadows): after the map zooms into the site, a 3D scene opens straight down and swings to a bird's-eye view while the red-soil pad fades in, compound wall draws, the four internal roads roll out from the 12.2 m Panchayat road, park + trees + P/EB pop up, plots rise category by category with numbers, the entrance arch appears, and the cab drives in on the 9.0 m road (~11 s). Then: rotate/zoom, tap a plot → card (category, sq.ft, sq.m, cents, facing road), category chips dim the rest, Replay, ← Map.
- Bugs fixed during testing: kerb outlines floating before plots landed; invisible plots casting shadows and cutting holes in the soil pad (transparent depth writes); category filter not dimming (material.needsUpdate).
- Checked headless Chrome/SwiftShader 1280×760 (mid-animation, final, plot 43 card, Early Bird filter, orbit) and 390×780 (plot card). No page errors. SwiftShader runs the animation slower than real time; real-phone smoothness not yet checked.

## Rev m6 (19 Nov 2026) — Mettupalayam-side areas

- Mettupalayam route re-fetched via Teachers Colony on the old Mettupalayam–Coimbatore Road (previous OSRM route went east via Jadayampalayam). Boards: Mettupalayam → Teachers Colony 5.6 km → Karamadai 8.3 → Kalattiyur 10.7 → KNM 17.5 → gate 19.1 km.
- Stop banner removed (it covered the board); highlighted board is the announcement. Turn/arrival banners kept.
- Measured headless Chrome: Mettupalayam ride 50 s, all boards passed at 150–160, KNM/turns 80. Highlight verified at Teachers Colony 1280×760 and 390×780.

## Rev m4 (19 Nov 2026) — 150–160 km/h, 80 after KNM

- Highway 150–160 km/h; 80 km/h limit from the KNM Mills turn through the side road; slows only at the gate.
- Measured headless Chrome (300 ms sampling): Thudiyalur 34 s (stops passed at 152–159, KNM/turns 80, gate 20); Mettupalayam 54 s (Karamadai 160, KNM/turns 80). No page errors.

## Rev m3 (19 Nov 2026) — steady 90 km/h, highlighted boards

- Highway speed fixed at 90 km/h (no slowing at stops). The stop's green board scales up (1.45× desktop; centred and enlarged on phones ≤640 px) with a pulsing yellow glow from 600 m before to 400 m after.
- Measured headless Chrome: Thudiyalur 66 s, all highway samples 90; Mettupalayam 101 s, Karamadai passed at 90. Highlight verified at Narasimhanaickenpalayam on 1280×760 and 390×780.

## Rev m2 (19 Nov 2026) — speed profile

- Speed buttons removed; speedometer (km/h) added bottom-left. No pause at stops.
- Measured in headless Chrome (500 ms sampling): Thudiyalur ride 72 s — cruise 80–87, NGGO 40, Narasimhanaickenpalayam 40, Periyanaickenpalayam 42, KNM turn 25, gate 12. Mettupalayam ride 105 s — cruise 80–86, Karamadai 42, KNM 25. No page errors.

## Rev m1 (19 Nov 2026) — top-view map tour

- Bright dropped the in-car 3D. `/urban-heaven/` is now a Leaflet map (vendored `dist/vendor/leaflet` 1.9.4) with Esri satellite + labels, toggle to OpenStreetMap. Files: `index.html`, `map.js`, `map-data.js`. Old 3D cab kept at `cab3d.html` (unlinked).
- Flow: pickup chooser → whole-route overview → fly down to pickup → cab icon drives real road geometry, rotates with heading, yellow travelled line, bilingual green stop signs (km to site), blue turn signs, banners at stops (1.2 s pause) and turns, HUD km/next/strip, 1×/2×/4×, follow-cab/recenter, drag to pan → enters gate → map zooms to the site outline → arrival card.
- Totals: Thudiyalur ≈ 12.3 km, Mettupalayam ≈ 21 km (including the ~1.6 km side road).
- Checked headless Chrome 1280×760 and 390×780: chooser, start, Periyanaickenpalayam, after KNM turn, arrival zoom. No page errors (favicon 404 only).

## Rev uh8 (19 Nov 2026) — front passenger seat

- Bright: back seat blocked the front view → customer now sits in the front-left passenger seat (eye −0.4, 1.52, 0.4 m; pitch −0.12), still free 360° drag. Own passenger backrest hides when looking back. Rear bench split into three equal seats with three headrests (centre armrest removed).
- Checked headless Chrome/SwiftShader 1280×760 forward/left/back, 390×780 forward. No page errors.

## Rev uh7 (19 Nov 2026) — back seat, 360°, Olivetree Builders

- Default view `rear`: customer in the rear-left seat (eye −0.38, 1.42, 1.2 m), free 360° drag (pitch −0.9…0.6), ‹ › turn 90°, arrow keys. Own backrest/headrest hidden while looking backwards so the third row and road behind show.
- 3D cabin extended: rear doors, C/D pillars, third row, tailgate frame, roof AC vents, branded rear mats; front seatbacks get hard backs with map pocket + Olivetree Builders branding, embroidered headrests. Sun strip, screen header and cluster rebranded.
- Photo views (uh6) remain in code but are not shown (they are front-seat photos).
- Checked headless Chrome/SwiftShader 1280×760 forward/left/back, 390×780 forward. No page errors.

## Rev uh6 (19 Nov 2026) — look around

- Bright: view could not rotate. Now three photo views, switched by swipe, ‹ › buttons or arrow keys, with a crossfade and the road camera turning to match:
  - left window `cabin-left.webp` ← reference `52F52B7C…`/`793C1EDD…` set (file 21307b66), road vanishing (1560, 360)
  - windscreen `cabin-front.webp` (file db210f90), vanishing (930, 424), live route on the touchscreen
  - driver's side `cabin-right.webp` (file 63904f9c), vanishing (−300, 440)
- Checked headless Chrome/SwiftShader 1280×760 and 390×780: all three views, buttons, desktop swipe. No page errors.
- Gaps: no rear/back view photo; photos come from different cars/seats/times (front has no driver, right view has the driver's arm and a different shirt); road/buildings still procedural.

## Rev uh5 (19 Nov 2026) — photo cockpit

- Inside-only experience. `cabin-front.webp` = Bright's reference photo `3217F66C…png` (1672×941) with windscreen made transparent (mirror, dashcam, stem kept; rosary removed). Camera matched to the photo: hfov 100°, vanishing point (930, 424), object-fit cover; live route screen overlaid on the photo's touchscreen at (748,627)-(964,742).
- Outside/3D-cabin buttons hidden; 3D cabin and chase view remain in code but unused.
- Pickup → inside view verified in headless Chrome 1280×760 and 390×780 (local build); earlier live uh4 also showed inside view in Chrome, so Bright's "inside view not coming" is not reproduced — may be a cached page or a different browser (not tested: iPhone Safari).
- Realism gap: cabin is photographic, road/buildings are still procedural. Needs real route footage.

## Rev uh4 (19 Nov 2026)

- Interior and exterior restyled from Bright's three reference photos (details in design.json). Inside view now looks slightly down (pitch −0.14) so the dashboard and road are both in frame.
- Fixed: centre stack, screen, vents and passenger panel were buried inside the dash geometry.
- Checked headless Chrome/SwiftShader: 1280×760 forward/right/down/back + exterior front 3/4/side; 390×780 forward. No page errors from the tour.

## Rev uh3 (19 Nov 2026)

- New realistic cabin `dist/urban-heaven/interior.js` replaces the simple interior (details in design.json). Live canvases: speedometer/trip cluster and the touchscreen route map update while driving; steering wheel follows road curvature.
- Passenger eye at (−0.4, 1.52, 0.4) m car-local; inside FOV 70° landscape / 84° portrait.
- Checked headless Chrome/SwiftShader: 1280×760 forward, look right (driver side), look down, look back; 390×780 forward. No page errors from the tour.
- Open: no driver figure (wheel turns by itself); dashboard face is still fairly plain.

## Rev uh2 (19 Nov 2026)

- Box car replaced by an original full-size SUV (`dist/urban-heaven/suv.js`), wheels turn with distance, RoomEnvironment reflections. Inside view: higher SUV seat, two-tone dash, centre screen, long bonnet.
- Outside camera now a 3/4 rear chase view.
- Bug fixed: the single huge ground plane overdrew the road at low camera angles (road vanished in side/low views). Ground now subdivided and 12 cm lower; camera near plane 0.1; road polygon offset uses units only.
- Checked in headless Chrome/SwiftShader 1280×760: front 3/4, side, rear chase and inside views; road visible in all; no page errors.

## Tests actually run (19 Nov 2026, rev uh1)

- `node check-urban-heaven.mjs` — passed (stop order, turn sequences, leg lengths, path continuity, totals, page wiring). Source test only.
- Headless Google Chrome via Playwright with SwiftShader (software WebGL), 1280×760: pickup screen, Thudiyalur start, before Narasimhanaickenpalayam, before KNM (inside + outside), before turn 2, approaching gate, inside site (outside view), arrival card; Mettupalayam route before Karamadai and before KNM. 390×780: pickup screen and Mettupalayam drive start. No page errors (one 404 = missing favicon).
- **Live** at https://britsingh20-source.github.io/olive-tree-3d-studio/urban-heaven/ — commit 271baa9, Pages run 44450011200 succeeded. Live route re-checked in headless Chrome (SwiftShader, 1280×760) with `?from=thudiyalur`: drive, KNM turn, gate and arrival all render; `?from=` auto-start confirmed.
- Not yet checked on a real phone GPU.

## Next action

Bright is sending reference photos of the road and buildings. Use them for road width/markings, verge, shop-front styles, textures and landmark boards per stretch (target ~50–60% real look). Then continue with the open questions below.

### Earlier next action

Ask Bright the open questions in design.json one at a time (first: confirm 'Sandimad' and the KNM Mills km), then add the site map after arrival.
