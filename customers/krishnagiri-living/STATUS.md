# Krishnagiri living area — studio status

Updated 2026-11-22 (Asia/Kolkata). Same client as `krishnagiri-kitchen`.

## Current state

Colour intake started. No viewer yet. All 14 painted source colours confirmed; unit details (finishes, shelves, white geometry) next (22 materials defined, 8 unused) (see design.json → sourceColours).

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

## Next action

Ask Bright what each source colour is, one at a time (started with #660000, 17 faces), saving each answer here and in design.json. Then build dist/krishnagiri-living/ from the krishnagiri-kitchen viewer.
