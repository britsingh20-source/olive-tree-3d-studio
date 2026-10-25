# Mr. Rathesh G — KNG Puthur

Independent customer route: `dist/rathesh/` (`/olive-tree-3d-studio/rathesh/`). Existing customer pages are preserved.

Inputs: `Untitled (3).skp` and `Untitled (4).skp`. Parsed vertices, edges and face loops match; thumbnails use different viewpoints. 142 vertices and 79 root faces. No component instances are omitted.

Confirmed reference mapping:

| Identification colour | Mechanism |
| --- | --- |
| Orange #db3500 | Normal hinged shutters; narrow end strips remain fixed fillers |
| Light yellow #ffd562 | The single 10-inch oil pull-out |
| Mustard #cccc00 | Rice pull-out basket |
| Green #5a7a43 | S-corner basket with hinged shutter and two curved swing-out trays |
| Dark red #9a0a05 | Plain tandem baskets, retaining two drawer divisions on each run |
| Pink #ffb299 | Pan pull-out |
| Brown #a56348 | Glass shutters |
| Open section beside rice | Two wicker baskets; no shutters |

Finish reference `download (1).png` is for materials only. Solid fronts default to glossy beige #b4a08a. Open boxes and visible interiors use wood grain. No handles are added. Actual glass panes remain transparent, with dark frames and wooden interiors.

The base run and loft each select as a complete product. Individual door/drawer/basket actions remain independent. Six customer-facing products contain 16 functional sections. Horizontal mica controls sit below the selected product. Saved choices are isolated by the Rathesh project key in browser local storage; no cross-device synchronization is implied. Rates have not been supplied.

`node check-rathesh.mjs` verifies every source vertex within 0.001 mm of its converted SKP coordinate, source-face coverage, functional mapping, shutter-free wicker baskets, S-corner motion, grouped products, and phone/desktop camera framing. Internal hardware is illustrative, derived from the identified mechanism rather than a manufacturer CAD assembly.

Regeneration: extract using `scripts/extract-prem-skp.py`, then run `scripts/prepare-rathesh-layout.py input.json dist/rathesh/exact-layout.js`. Do not run the Prem-specific layout generator against Rathesh inputs.
