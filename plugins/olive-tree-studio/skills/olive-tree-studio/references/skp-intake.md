# SKP intake and failure handling

## Required sequence

1. Resolve the user's current attachment or selected file. Reuse an exact known identifier; do not ask for another upload merely because a .skp has no text preview. Use the Library skill for Library-backed files and its current download helpers. An attachment's metadata is not its file bytes.
2. Confirm an execution runtime exists, materialize the file and verify the local file has nonzero bytes. Keep provider identity/version with the local file. Treat missing files, transfer errors, DNS failures and runtime unavailability as access/execution blockers, not corrupt models. A supplied PC path uses local tools directly.
3. Run Python on the real file using the bundled wrapper:

   `python "<skill_root>/scripts/read_skp.py" "<input.skp>" "<output.json>"`

   On Linux the executable may be `python3`. Resolve skill_root from the actual skill resource location; do not guess another OS's path. The sibling `extract_skp.py` is the established extractor from repository `scripts/extract-prem-skp.py`. It uses Python's standard library only. The repository may contain a newer version; compare before using that instead. Do not replace it with an invented general converter.
4. Inspect the structured result and extracted geometry: SHA256, units, counts, bounds, face loops/planarity, material colours and omitted instance inventory. The supported family is ZIP-based SKP with the studio's known model.dat TLV layout and root cabinet faces. The only historically verified omitted instance is Ty. Non-Ty component instances or missing root geometry require further inspection; do not silently drop cabinetry or claim complete extraction.
5. On success, preserve extracted JSON, render source-colour swatches/views and continue the existing studio workflow. Compare multiple files before assuming they are different units. Save source names/hashes, extractor path/version, bounds, validated counts and unresolved details in the customer's checkpoint. Never claim automatic access to an old upload in a later chat.

## Failure routing

| Observed stage/result | Required response |
| --- | --- |
| Attachment resolves but download/DNS fails | Say the file is attached but transfer failed. Retry only after a meaningful change, or use another available authorized runtime/provider path. Never call it a bad SKP; never ask for the same upload as the first remedy. |
| No execution runtime | Say Python cannot run in the current environment. Keep resolved file identity and checkpoint. Do not claim a parse attempt or promise a background retry. |
| SOURCE_NOT_AVAILABLE / EMPTY_SOURCE | Fix materialization or local path before making a format claim. |
| UNSUPPORTED_CONTAINER / UNSUPPORTED_LAYOUT | Report the exact container/parser observation. This bounded reader has not established that the file is corrupt. Inspect existing extraction scripts or a usable embedded preview before asking for GLB/glTF, OBJ+materials or DAE with units/components retained. |
| UNSUPPORTED_COMPONENTS | Preserve the instance inventory. Inspect component-aware options; do not use root-only geometry as a complete model. |
| EXTRACTION_OK | Continue from actual extracted geometry and colours. No replacement export or repeated design briefing is needed. |

## Known regression to avoid

In the Venki intake, Windows DNS/download failures happened before Python received any SKP bytes. The same three uploads later parsed successfully in an available Linux runtime: 82 vertices, 125 edges, 50 root faces, matching geometry/materials, 132 x 24 x 84 inch source bounds. This demonstrates that transfer failure is not parsing failure; it does not guarantee that every SketchUp version or component hierarchy is supported. This procedure must run automatically, without the user reminding the assistant that Python worked in an old chat.
