# Studio workflow

## Resume before asking

Read AGENTS.md, customers/index.json and the selected customer's design.json and STATUS.md. Then inspect current code, repository head and relevant assets. Do not ask the user to repeat confirmed choices. If records disagree with the latest instruction, follow the latest instruction, flag the discrepancy briefly and correct the record.

## Model and reference intake

Use the existing studio architecture and stylesheet. Inspect the source model, images and existing extraction scripts first. The bounded extractor scripts/extract-prem-skp.py has worked for the Suresh source; this is not a universal SketchUp converter. Try the established method before asking for exports. Verify extraction counts, axes, units, bounds, topology and source hash. Preserve verifiable geometry; label rendering approximations separately.

If extraction genuinely fails, state the exact observed blocker and request the smallest usable alternative: a geometry export such as GLB/glTF, OBJ with materials, or DAE, retaining units/components. Request a dimensioned view only for dimensions that cannot be verified. Never claim to inspect an attachment that was not actually read.

## Mandatory SKP intake and failure routing

For each SKP attachment, run the bundled Python-first procedure in `plugins/olive-tree-studio/skills/olive-tree-studio/references/skp-intake.md` without waiting for the user to mention an old chat. Obtain actual bytes through the file provider's supported transfer workflow, then run `plugins/olive-tree-studio/skills/olive-tree-studio/scripts/read_skp.py INPUT.skp OUTPUT.json`. Its sibling `extract_skp.py` is the bounded established reader, bundled so a new chat need not reconstruct it. Prefer inspected current repository code if newer.

Keep access/download, execution availability, container inspection, parsing and validation separate. DNS/transfer/runtime errors do not establish that an SKP is bad or unsupported. Do not repeatedly request another upload, PC folder or GLB/OBJ before actually attempting the reader on available bytes. Report unsupported TLV layouts/components precisely and never silently omit non-Ty cabinet instances. This is not a universal SketchUp converter.

Plugin 1.0.1 reader validation: supported synthetic triangle with Ty, missing source, empty source, unsupported container, unsupported TLV layout, non-Ty components and source/output collision. All seven passed on Windows Python 3.14.2. The core bundled extractor matches the repository reader previously used for the actual Venki files; no new claim of parsing a current customer upload is implied by these synthetic tests.

## Clarify design through source colours

Show each unresolved source colour visually and ask what it represents, one clear question at a time. Avoid A/B labels, unexplained position descriptions, or asking for colour codes already extractable from the model. If multiple brown shades are present, show separate swatches so the user can name each section.

For each relevant unit, resolve purpose, internal arrangement, materials, colour/texture, matte/gloss, shutter direction, drawers, handles, lighting and accessories only where missing. Briefly confirm the answer and save it before moving on. Do not attach contextless answers such as 'yes' or 'matte' to a unit without evidence. Fixed louvers and lofts specified as shuttering only must not acquire opening actions.

## Implementation

Reuse rotate/zoom/pan, individual-unit selection, finish choices for fronts/sides, persistence, opening mechanisms and guided tours from the appropriate existing viewer. Preserve existing customer routes. Store actual reference textures separately from approximations. Do not claim a photographed product's exact fabrication profile from its image alone.

Camera orientation must persist after dragging and display resize. A drag must not become a selection tap. Stop the tour on interaction without taking control back. Disable unintended post-release drift. Only explicit view controls, selection or an intentionally replayed tour may reframe the camera.

Avoid coplanar render surfaces causing side speckling. Diagnose geometry/depth conflicts before merely increasing pixel ratio. Keep source reference geometry intact. Verify texture filtering and shadow artifacts at oblique angles.

## Customer quotations

Use rates, units, scope, materials, inclusions and terms confirmed for THIS customer only. A general business rate, another customer's price or a remembered standard is not approval. Missing rates stay pending. Read the current authorized quotation document before importing it; keep its identity/version and customer confirmation. Do not publish private financial/contact documents into this public repository.

## Verification and publication

Run checks appropriate to the actual change. Test full-unit and individual views, desktop and mobile layouts, both sides and rear rotation, zoom/pan, drag-release persistence, front/side finish application and reload, doors/drawers and their clearances, fixed shutters, lighting, and tour stop/replay/completion where affected. Verify asset requests and console errors.

Record exact renderer, viewport/device, actions and results. Compatibility/CPU mode is not full WebGL material validation. A source-level test is not a visual test; a deployed commit is not proof a bug is fixed. Never report checks that were not performed. Existing check-suresh.mjs may need a browser-aware texture loader harness after photo texture changes; do not cite its historical pass as a fresh result.

Use a guarded current-head Git update, preserve unrelated changes, check deployment completion, then inspect the live viewer. Bump module/asset versions when needed. Share a direct customer link and any material verification limitation.

## Durable checkpoint after every change

Update design.json for confirmed decisions; update STATUS.md for implementation, tests, defects and next action. Include source paths and known asset locations. Keep confirmed facts, visual approximations, unresolved questions and historical results distinct. Add new customers to customers/index.json; never overwrite another customer's record.
