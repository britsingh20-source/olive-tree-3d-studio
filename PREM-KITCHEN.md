# Mr. Prem — interactive kitchen from exact SKP face coordinates

Client: Mr. Prem. Temple Town, Teachers Colony, Karamadai.
Route: `dist/prem/index.html` (public URL path `/olive-tree-3d-studio/prem/`).

The first screenshot-based approximation has been replaced. The supplied `kit(1).skp`, `kit (1).skp` and `kit (2).skp` contain identical root vertices, edges and faces, with different saved views. The bounded SKP 26.2 TLV extractor reads 113 root vertices, 174 root edges and 63 root face loops, validates loop closure and plane equations, and resolves material identities from the embedded material XML. The only omitted instance is the non-cabinet `Ty` human figure. No cabinet group or instance is omitted.

`dist/prem/exact-layout.js` preserves these 63 face records and the direct coordinate conversion: metres = inches × 0.0254, SketchUp XYZ → Three.js XZY with negated source Y and a horizontal translation to the model's origin. No cabinet widths, heights, front planes, front divisions, worktop outline, external side polygon or floor outline are estimated. `scripts/extract-prem-skp.py` and `scripts/prepare-prem-layout.py` reproduce the data from these specific files; they are not a general SketchUp converter.

## Mapping and preserved divisions

| Source reference | Mechanism |
| --- | --- |
| Dark blue | Dishwasher fitted inside its three-face source bay |
| Orange | Two source outer tandem fronts, retained exactly; supersedes the earlier three-drawer assumption |
| Red | Two tandem front divisions on each of the two separate source runs |
| Yellow | Complete plywood boxes, shelves and normal shutters; narrow source filler faces remain fixed |
| Green | Oil pull-out |
| Dark purple | One large pull-out rice basket behind a single shutter |
| Dark maroon | Original single outer shutter, two internal pull-out wicker baskets |
| Cyan | Two sideways-opening aluminium-framed glass wall shutters |
| Light purple | Pantry, original three source shutters at their original elevations, with fixed shelving |
| Magenta | Tall unit; baskets and shutter pull out together |

Internal carcass thickness, drawer channels, rack layouts, six tall baskets, shelf counts and dishwasher internals are design visualizations within the source front arrangement. They require hardware/site confirmation. The dishwasher occupies the original source bay; its door is fitted at the bay's opening rather than treating the blue rear cavity face as an appliance door. No quotation prices have been entered.

## Interactions

The full kitchen opens first. Selecting one of the 20 units opens a full-screen product view with a horizontal mica tray below. Rotation, panning, zooming, opening doors/drawers, front/top views and return-to-whole-room controls remain available. Mica targets include fronts, sides or both; selected unit or all cabinetry. Generic colour previews and the shared 306-sample uploaded catalogue are available.

“Reference colours” shows just the 63 original SKP root faces in their recorded identification colours, with the generated internal hardware hidden. It closes all moving parts so the original arrangement can be checked. Selecting a unit returns to finished mica mode.

Each unit has an “Add this unit to quotation” checkbox. The overall design checkbox reveals the quotation area, currently a pending message and selected unit names. Add Prem's confirmed pricing later; never reuse Pradap's pricing. Choices are saved only in the current browser/device under a client-specific versioned key. No server-side approval submission or device synchronization is implied.

The GPU renderer uses Three.js with PBR/clearcoat and a room environment. A simpler CPU compatibility renderer uses the same geometry and action parents on devices without WebGL. The compatibility view supports the original concave source polygons. Full glossy WebGL rendering cannot be visually verified in the current QA browser, where WebGL is disabled.

## Validation

`node check-prem.mjs` compares every closed source mesh vertex in world space to its SKP-derived coordinates within one micrometre. It also checks all 63 unique face IDs, 20 selectable units, source drawer divisions, mechanisms, fixed architecture during movement, and narrow/wide camera framing. Existing Pradap files and quotation remain untouched.

## Current appearance preset

At the client's request, the finish and viewing preset now follows the existing polished kitchen at the main Olive Tree studio: blue acrylic `#23576c`, roughness 0.07, clearcoat 1, clearcoat roughness 0.025, IOR 1.49, specular intensity 1 and material environment intensity 1.25. The renderer uses sRGB output, ACES exposure 1, the same four bright reflection panels, PMREM blur 0.012, environment intensity 0.85 and the existing key/fill/hemisphere lighting levels. Orbit damping and auto-rotation speed match that viewer. This replaces the earlier sage-green default while retaining sage green as a selectable option. These changes affect appearance and camera controls only; `exact-layout.js` is unchanged.
