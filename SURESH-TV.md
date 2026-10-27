# Mr. Suresh — TV unit
Route: `/suresh/`. Reuses the existing studio style, OrbitControls, finish controls, browser-local persistence, reference view, compatibility renderer and contextual tour.

## Verified source
Input: `sanganoor tv panel (3).skp`; SHA-256 `44423a42d3d11c1e94b78e75486613fb9a07e3f73bec725fbf33355e9b304f9e`.
The repository's bounded SKP extractor recovered 73 vertices, 119 edges and 48 root faces. One non-cabinet Ty figure is omitted. Every root face is retained unchanged in the reference view after inch-to-metre and axis conversion.
Bounds: 84 inches wide × 104 inches high × 12 inches overall depth. TV backing: 67 × 48 inches. Four existing side compartments and five lower shutter-front divisions are preserved.

## Customer-confirmed mapping
| Source marker | Interpretation |
| --- | --- |
| Brown #a56348 | Fixed vertical PVC walnut-brown louvers |
| Green #5a7a43 | TV back panel; glossy cream/beige marble-look finish matching supplied reference |
| Yellow #ffd562 | Walnut-brown wooden shutters; matte, handleless, lifting upward |
| Blue #4d6fb2 | Grey-tinted glass shutter; handleless, lifting upward |
| Orange #db3500 | Concealed LED; warm white |

65-inch TV. Storage behind the lower wooden and glass shutters remains open, without internal shelves or accessories. The side compartments already present in the source remain; no new fittings are added. Top and lower louver panels are fixed decorative surfaces, not loft shutters.

## Preview limits
The original source geometry is separately inspectable. Louver profile spacing, TV casing, panel render thickness, small shutter reveals and marble pattern are visual representations, not fabrication specifications. The render enclosure uses the supplied lower-board depth. Exact carcass grade, thickness, hinge/lift hardware, fabrication details and customer quotation remain unconfirmed. No other customer's rates or terms are copied.

## Checks
`node check-suresh.mjs`: all 48 reference faces, 73 source vertices, bounds, five upward lift actions, open/closed movement, handleless/open storage state, 65-inch screen, fixed vertical louvers, and guided-tour sequencing.
Desktop 1440 × 1000 and phone 390 × 844 compatibility-view inspection: overview, individual product selection, wooden/glass shutter movement, finish change and reload persistence, horizontal overflow, source reference and controls. The live site was also inspected in the in-app browser using full WebGL material rendering. Material samples and the marble pattern remain visual previews.

## Rebuild geometry
```sh
python scripts/extract-prem-skp.py input.skp extracted.json
python scripts/prepare-suresh-layout.py extracted.json dist/suresh/exact-layout.js
node check-suresh.mjs
```
