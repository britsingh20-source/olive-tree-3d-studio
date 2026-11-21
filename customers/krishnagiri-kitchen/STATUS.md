# Krishnagiri kitchen — studio status

Updated 2026-11-21 (Asia/Kolkata).

## Current state

New client. Source intake complete; colour-by-colour design questions in progress. No viewer built yet; route /krishnagiri-kitchen/ reserved in customers/index.json.

## Sources

- Chat uploads of both SKPs were text-corrupted in transfer (~51k U+FFFD replacement sequences each; zip container unreadable). This was a transfer fault, not a bad model.
- Originals staged from Bright's PC (Downloads/krishnagiri) and parsed with the bundled read_skp.py on Linux Python 3: EXTRACTION_OK for both. 58 vertices, 89 edges, 33 root faces, 120 × 96 × 84 in, zero omitted instances. Geometry and materials identical between the two files.
- Geometry saved to customers/krishnagiri-kitchen/source-geometry.json. Original SKPs not committed.
- Observed layout (not yet confirmed by Bright) is in design.json → source.observedLayout.

## Next action

#a56348 confirmed (shutters + shelves, aqua high gloss per reference photo, handleless). #ffb299 confirmed: cutlery tandem drawer. Global finish confirmed: every front aqua high gloss, handleless. #ffd562 confirmed: thali basket tandem. #5a7a43 confirmed: oil pull-out. #65ffff confirmed: S-corner (trays come out when door opens). Next colour: #3e5781 (24x30in, middle of side-wall base). Save each answer to design.json before the next question. Then build dist/krishnagiri-kitchen/ from the newest viewer template.
