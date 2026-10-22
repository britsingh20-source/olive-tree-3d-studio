# Mr. Prem — interactive kitchen

Client: Mr. Prem. Temple Town, Teachers Colony, Karamadai.
Route: `dist/prem/index.html` (public URL path `/olive-tree-3d-studio/prem/`).

This client has an isolated route and browser-storage key. Existing Pradap files, prices, routes and choices are untouched. No Prem prices have been entered.

## Confirmed mapping

| Reference | Unit and mechanism |
| --- | --- |
| Dark blue | Dishwasher, downward-opening door |
| Orange | Three tandem drawers; no special organizers |
| Red | Two tandem drawers |
| Yellow | Complete plywood boxes with shelves and hinged shutters |
| Green | Oil pull-out |
| Dark purple | One large pull-out rice basket and one shutter |
| Dark maroon | Two separate pull-out wicker baskets |
| Cyan | Aluminium-framed glass wall unit, sideways-opening shutters |
| Light purple | Pantry with fixed shelves behind hinged shutters |
| Magenta | Tall unit; basket frame and shutter pull out together |
| White / grey | Exterior carcass panels, not an additional independent pantry |

Default finish: handleless glossy sage green, white stone worktops, pale veined backsplash, warm wall-cabinet lighting. These finishes follow the photo reference; the coloured SketchUp model identifies units only.

## Preview limits

Clean geometry is rebuilt from the supplied screenshots and confirmed section mapping. Native SketchUp 26.2 geometry has not been converted or measured here. Dimensions and reconstruction positions in `model.js` are provisional, and the upper unit subdivisions are illustrative. Check against the complete SKP and site before manufacture or quotation. The pantry/tall unit contains an illustrative shelf/basket count rather than a confirmed manufacturing count.

The full renderer uses Three.js with PBR/clearcoat and a room environment. The compatibility renderer is a simpler, CPU-drawn view if the device cannot create a WebGL context. Both use the same geometry, ray hit targets and cabinet actions.

## Interactions

Whole model on initial load. Selecting a unit focuses it and reveals the full-width horizontal mica tray below. Rotate, pan, zoom, open/close and return-to-whole-room controls remain available. Mica targets: front, side or both; selected unit or all cabinetry. Colours, catalogue selections, quotation item checkboxes and design checkbox persist locally on the same browser/device. No server-side approval submission or device synchronization is implied.

Each unit has an “Add this unit to quotation” checkbox. The overall design checkbox opens the quotation area, currently a pending message and list of selected unit names. Add confirmed quotation data and rendering later; do not reuse Pradap's pricing.

Catalogue files are shared with the existing project under `dist/catalogue/`. The route adds no new external JavaScript dependencies. Fonts gracefully fall back to system fonts when unavailable.

Run `node check-prem.mjs` to verify geometry, correct mechanisms and unit counts, closed/open transitions, hit targets and narrow/wide camera framing.
