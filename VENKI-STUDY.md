# Mr. Venki — Study with wardrobe

Route: `/venki/study/`. Both this room and the original `/venki/` wardrobe have a room selector. Each room has its own saved finishes and quotation selections; no quotation rates are added.

The supplied `study with wardrobe.skp` and `study with wardrobe (1).skp` have matching geometry: 117 vertices and 77 root faces with no omitted nested instances. All faces are retained for Reference colours. Overall source dimensions are 132 × 120 inches with 24-inch overall depth. The study desk and side-opening flower-shelf outlines retain exact source coordinates in the finished model.

## Confirmed sections

- Yellow top row: seven loft shutters only, without plywood boxes.
- Green pair at left: hanging rod, top storage, two internal drawers and three shoe tiers.
- Peach single shutter: folded-clothes/bedding shelves, one drawer and bottom storage.
- Blue section: hinged glass shutter, shelves and books.
- Three brown drawer fronts: pull-out drawers, finished beige matte.
- Narrow purple/pink shelves: small flower pots; visible faces walnut-brown matte mica. The source shelves open to the side, towards the study desk.
- Magenta study top and supporting side panel: walnut-brown matte mica.
- Concealed strip lights in both wardrobe sections, the book cabinet and the flower-pot shelves.

Beige fronts are matte and handleless. Exposed wood-grain surfaces are matte walnut. The glass stays glass when the frame/carcass mica is changed. Internal fittings, books, clothes and flower pots are illustrative; final shelf spacing needs site confirmation.

## Interaction and checks

The same contextual automatic tour, stop-on-touch, rotate/move/zoom, individual selection, opening mechanisms and bottom mica strip are retained. Flower shelves are framed from their side opening during selection/tour. Finish storage key: `venki-study-wardrobe-v1`.

`node check-venki-study.mjs` verifies the source faces, exact desk/shelf placement, 11 hinged shutters, six drawers, matte fronts, books, pots, strip lights, distinct room storage and phone/desktop framing. `node check-venki.mjs` checks the original wardrobe after navigation changes. Browser QA verified the glass cabinet, flower niches, selection controls and navigation to the original room. The test browser uses compatibility rendering; full material lighting requires WebGL.

Rebuild layout using the existing bounded SKP extractor, then:

```sh
python scripts/prepare-venki-study.py extracted.json dist/venki/study/exact-layout.js
node check-venki-study.mjs
```
