# Mr. Venki — Wardrobe and Dressing

Route: `/venki/`. No quotation rates are supplied or displayed. The customer's location has not been confirmed; the filename mentions GN Mills but the page does not treat that as an address.

Both supplied SketchUp files contain the same 64 root faces and 105 vertices, with no omitted nested components. `dist/venki/exact-layout.js` retains those faces, colours and coordinates in metres for Reference colours. The finished wardrobe is rebuilt from the measured frontal arrangement: 132 inches wide, 120 inches high and 21 inches deep. Dressing occupies 42 inches; wardrobe sections occupy 18, 36 and 36 inches. Loft occupies the top 36 inches. Small reveals and panel thickness are generated for rendering.

## Confirmed mapping

| Identification | Finished interpretation |
| --- | --- |
| Top yellow row | Seven loft shutters only, without plywood box carcasses |
| Peach single shutter | Top storage, hanging rod, two drawers and three lower shoe tiers |
| Green pair | Top storage, hanging rod, two drawers and three lower shoe tiers |
| Orange pair | Folded-clothes/bedding shelves, one drawer and larger bottom storage |
| Blue mirror | Fixed mirror with touch-controlled perimeter lighting |
| Narrow yellow strip below mirror | Pull-out makeup drawer, beige matte front |
| Brown panel below drawer | Matte PVC wooden louver backing |
| Four open compartments beside mirror | Cosmetics and decor; walnut brown matte wood-grain mica |
| Other similarly marked exposed areas | Walnut brown matte wood-grain mica |

All external shutters are full-length, handleless and beige matte. Every wardrobe section has concealed strip lights. Reference images inform the interiors; internal shelf spacing, stored contents and hardware are illustrative, pending site measurements. The loft remains shuttering only.

## Interaction

Full model appears on opening, with an automatic contextual tour. It shows the whole wardrobe, locates each item, zooms in, demonstrates doors/drawers or mirror lighting, closes the mechanism, then returns to the whole installation. Any customer interaction stops the tour. Replay is explicit.

Selecting a section provides an individual product view with rotate, move, zoom, details, door controls and a horizontal mica strip below. Front/side choices and quotation selections save in this browser under `venki-wardrobe-v1`; no cross-device persistence is claimed. Mica materials remain matte regardless of colour/catalogue choice. Mirror material is excluded from mica changes.

## Validation

`node check-venki.mjs` verifies all 64 source faces, seven loft leaves without boxes, twelve hinged leaves, six drawers, three strip-lit interiors, mirror light toggle, opening/closing and phone/desktop framing. Browser QA checked selection, opening, full-model reset and mirror-light buttons. The cloud browser uses the CPU compatibility renderer; PBR material rendering requires WebGL on the customer's device.

Rebuild layout from the bounded SKP extractor output:

```sh
python scripts/prepare-venki-layout.py extracted.json dist/venki/exact-layout.js
node check-venki.mjs
```
