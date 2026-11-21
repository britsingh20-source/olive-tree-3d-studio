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

#a56348 confirmed (shutters + shelves, aqua high gloss per reference photo, handleless). Next colour: #ffb299 (24x10in front above the yellow on the back wall). Save each answer to design.json before the next question. Then build dist/krishnagiri-kitchen/ from the newest viewer template.
