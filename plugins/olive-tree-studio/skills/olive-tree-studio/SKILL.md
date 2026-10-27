---
name: olive-tree-studio
description: "Use when continuing or creating Olive Tree Interiors customer 3D views from SketchUp models, source colour mappings and reference finishes, or fixing the Olive Tree 3D Studio. Read durable repository records before asking design questions."
---

# Olive Tree Studio

Repository: https://github.com/britsingh20-source/olive-tree-3d-studio

## First action: recover project state

Use available GitHub repository tools or an authorized local checkout to read the current default branch:
1. AGENTS.md
2. docs/STUDIO-WORKFLOW.md
3. customers/index.json
4. The selected customer's indexed design.json and STATUS.md
5. Relevant source code and assets

These files are the durable project record, not bundled snapshots. Fetch current content every new chat; do not rely on a stale copy or invent access to old conversations. If GitHub access is unavailable, identify that limitation and request access or the specific checkpoint files. This plugin supplies instructions; it does not grant repository access or include a universal SketchUp converter.

For Mr. Suresh, current paths are customers/suresh/design.json and customers/suresh/STATUS.md; viewer route /suresh/. Do not repeat confirmed questions. Read recent fixes and unverified items before claiming completion.

## Working method

Follow the current repository workflow and the user's latest instructions. Reuse existing architecture and visual style. Inspect source geometry, images, extraction scripts and verified dimensions before asking for alternative exports. Use the established bounded extractor when applicable; if it fails, explain the observed blocker and request only a suitable missing export or source.

Ask one clear question at a time only for missing/ambiguous decisions. Show actual source colour swatches so the user can explain each section. Avoid unexplained A/B names and demanding colour codes already available in the model. Resolve purpose, internal layout, materials, colour, sheen, shutters/drawers, handles, lighting and accessories only where needed. Confirm and persist answers as they arrive. Do not guess dimensions, fittings or the meaning of an isolated 'yes'.

Keep fixed decorative PVC louvers and shuttering-only lofts closed. Preserve verified geometry and distinguish render approximations. Use confirmed customer reference textures on the correct surfaces; separate wood shutters from PVC louvers.

Use only rates and terms confirmed for that customer. Do not borrow another quotation or infer approval from general business rates. Read the current authorized quote before importing prices.

## Implement, verify, checkpoint

Inspect current code/head and preserve unrelated work. Validate the behavior actually changed: desktop/mobile, side/rear rotation, zoom, persistent drag angle, selection, fronts/sides, saved finishes, opening actions, lighting and tour as relevant. Diagnose coplanar surfaces rather than calling every artifact low resolution. Keep tour/resize logic from recentering manual rotation; distinguish taps from drags.

Record exact tests, renderer/device and limits. CPU compatibility mode is not full WebGL validation. Historical tests and deployment success must not be presented as new visual proof.

After each customer confirmation or implementation change, update that customer's design.json and STATUS.md in the same repository change. Record outstanding questions, defects, source/asset paths, current deployment and next action. Keep sensitive private contact/financial documents out of the public repository. Read back saved records and verify deployment when code changed.

Finish with the customer URL, concise change summary and any material verification limit. For a future chat, direct the user to CONTINUE.md and select this plugin. Do not promise chat-history transfer or zero future clarification.
