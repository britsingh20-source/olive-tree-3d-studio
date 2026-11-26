# gsquare — under-staircase unit checkpoint

Updated 27 November 2026. Confirmed choices are in design.json.

## Current state

- Two uploads (gsquare.skp, gsquare (1).skp) read with the bundled Python reader: EXTRACTION_OK, 259 vertices, 424 edges, 170 root faces, inches, bounds 144.3 x 108.1 x 120 in. No component instances. Both files have identical geometry/materials; only the saved view differs.
- Extracted JSON kept at customers/gsquare/source/gsquare-extract.json. Original SKPs not committed.
- Client name is provisional ("gsquare", from the folder name) — confirm with Bright.
- No viewer built yet. No rates imported.

## Confirmed so far

- Cyan #00ffff (large sloped panel under the stair): wooden mica, same grain as Bright's reference photo, glossy. Photo saved at dist/gsquare/textures/wood-mica-gloss-ref.jpg. It is a fixed TV back panel; a 65-inch TV goes in front of it, centred, bottom edge 26 in from floor (confirmed).
- Light purple #9999ff (two fronts under the TV, 18 x 12 in each): aluminium-frame shutters with grey tinted glass, opening from the middle (left hinged on left edge, right on right edge). Small chrome-gold knobs.
- Brown #663300, two fronts beside the glass shutters: hinged doors on their outer edges (open away from the glass). Wood mica, matte (grain rendered same as TV panel photo — approximation). Small chrome-gold knobs. The other brown pieces at the far left (behind the orange column) are still unknown.
- Green #00ff00, inner sides + bottom of the TV recess: matte wood mica. The low green strip at floor level is a skirting with an LED strip lighting the floor — matte wood mica skirting, warm white LED.
- Yellow #ffff00, sloping top of the TV recess: matte wood mica with a warm white LED strip shining down on the TV panel.
- Orange #ff3b00, front of the tall column left of the TV: fixed fluted panel, no opening (reference photo dist/gsquare/textures/fluted-panel-ref.jpg, vertical flutes).
- Dark blue #000066, right of the TV (60 in tall, two ~15 in halves): pair of storage doors opening from the middle (outer-edge hinges), matte wood mica, handleless push-to-open. Inside: empty storage, no shelves or fittings.
- Dark plum #660033, upper part of the far-right tall unit: POOJA unit — two CNC-cut doors in the pattern of Bright's photo (dist/gsquare/textures/pooja-cnc-pattern-ref.jpg), but in our matte wood mica, not the photo's colour. Open from the middle. Warm light inside makes the cut-outs glow (no acrylic).
- Pink #ff007f, under the pooja doors: two stacked drawers (lower 6 in, upper 4 in, 36 in wide), matte wood mica, small chrome-gold knobs.
- Bright pink #ff00ff, bottom of the pooja unit (0–20 in): two storage doors opening from the middle, matte wood mica, small chrome-gold knobs. Inside not asked (render empty).
- Violet #7b00ff, narrow outer side of the pooja unit: plain matte wood mica panel.
- Dark mustard #664a00, back of the TV wall facing the stair: fixed back panel covered with artificial green grass mat (procedural texture; product photo not committed).
- Red #cc0000, side wall next to the grass panel: a 24 x 78 in door into a storage space under the stair, hinged on the staircase-side edge, matte wood mica, push-to-open (no handle).
- Dark red #660000, stepped panel on the side of the stair: matte wood mica cladding.
- Dark green #336600 + gold #ffbf00 + yellow face 46137, thin edges around the grass panel: matte wood mica border with concealed lights making the grass glow (light colour rendered warm white — approximation).
- Gold #cc9900 + #cc6600, 2 in upright strip between fluted column and TV area: matte wood mica front with a concealed LED that lights up the fluted (louver) column (my reading of 'highlight the lower').
- Lime/teal/blue (#31ff31, #006666, #6565ff), open space at the back of the fluted column: closed with a matte wood mica panel on the staircase side; the inner blue rectangle and shelf are hidden.
- Brown back faces 45978/45407, low box behind the fluted column: closed plain matte wood mica.

All source colours are now explained (G01 Mint Mist is unused; white Default faces are the staircase/structure).

## How Bright wants questions asked (27 Nov 2026)

Each question gets its own picture where ONLY the item being asked about is in colour (bold, outlined); everything else is light grey. Do not show the full multi-colour model. One simple question per picture, plain words, short answer options.

## Implementation (27 Nov 2026)

Viewer at dist/gsquare (route /gsquare/), copied from the Ratesh foyer-pooja viewer pattern: rotate/zoom/pan, unit selection, front/side finish choices saved in the browser (key gsquare-v1), open/close, lighting toggle, guided tour only by button, Reference colours shows all 170 source faces. White source faces render as plaster architecture (staircase/walls).

Units: TV back panel & frame (glossy, LED), 65-inch TV, cabinet under the TV (2 brown + 2 glass doors, gold knobs, skirting + floor LED), fluted column & concealed profile light, storage right of the TV (push-to-open, empty), pooja CNC doors (warm glow), pooja drawers, pooja lower storage, rear grass panel (glow), rear storage door + stair cladding.

Textures: dist/gsquare/textures (wood-mica-gloss-ref.jpg, wood-tile-vertical.jpg, fluted-panel-ref.jpg, pooja-door-left/right.jpg, pooja-glow-left/right.png, grass-mat.jpg generated by scripts/make-gsquare-textures.py). Grass product photo NOT committed.

## Actual verification

- node check-gsquare.mjs passed: all 170 source faces exact; source bounds 144.3 x 120 x 108.1 in; TV centred, bottom 26 in, clears the slope; 13 actions all open outward (front +Z, pooja and rear door -X); rear door 0-85 deg sweep clears the grass border; corner storage door at 80 deg clears the closed pooja unit; lights toggle; reference mode.
- Headless Google Chrome with SwiftShader WebGL, 1280x900, local http server: page loads, no page errors (only favicon 404); full view, each of the 10 units selected and opened, and rotated left/rear views screenshotted and inspected.
- NOT yet done: mobile viewport, real GPU/device, close-up check of the closed pooja CNC face orientation, reload persistence of finishes, tour run-through.

## Known issue / question for Bright

The storage door right of the TV, hinged at the corner shared with the pooja unit, can open only ~80 deg (pooja drawer knobs) and can't be open together with the pooja left doors. Viewer limits it to 80 deg and leaves it out of "Open all". Asked Bright whether to keep this or hinge it on its other side.

## Next action

Get Bright's answer on the corner door; then mobile/real-device checks and any feedback.
