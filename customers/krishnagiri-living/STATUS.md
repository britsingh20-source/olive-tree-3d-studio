# Krishnagiri living area — studio status

Updated 2026-11-22 (Asia/Kolkata). Same client as `krishnagiri-kitchen`.

## Current state

Colour intake started. No viewer yet. 19 non-white source colours unresolved (see design.json → sourceColours).

## Sources

- Staged from Bright's PC folder Downloads/krishnagiri: `krisnagiri living area.skp` (newer, sha256 91a4b0bd…) and `krisnagiri living area (1).skp` (older, c516a50e…).
- First read_skp.py run: UNSUPPORTED_LAYOUT, AssertionError ('plane', 46494). Diagnosis: only planarity check; faces 46494/46632 deviate 0.00019 in / 0.000014 in from their planes (float drift). Tolerance raised to 1e-3 in in extract_skp.py and scripts/extract-prem-skp.py; both files then EXTRACTION_OK: 381 vertices, 649 edges, 283 root faces, 362.9 × 255.0 × 120.7 in, no component instances.
- The two files differ only in face 43750 (painted #660000 in newer). Newer used. Geometry saved in customers/krishnagiri-living/source-geometry.json. Original SKPs not committed.

## Next action

Ask Bright what each source colour is, one at a time (started with #660000, 17 faces), saving each answer here and in design.json. Then build dist/krishnagiri-living/ from the krishnagiri-kitchen viewer.
