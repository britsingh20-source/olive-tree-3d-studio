# Mr. Venki — entirely new unit

Updated 29 October 2026.

Separate design intake; existing /venki/ and /venki/study/ viewers remain unchanged. No new viewer is deployed.

## Confirmed

Four tall yellow source shutter panels: beige matte. Exact shade pending. Small yellow horizontal strip beneath blue section is confirmed as a drawer front. Drawer front finish is confirmed beige matte.

Blue rectangular section above drawer: mirror with lighting. Warm-white lighting confirmed; control remains unconfirmed.

Mirror surround and four open compartments beside mirror: walnut brown mica, matte confirmed. Exact texture pending. Lower brown section beneath drawer has not been mapped by this confirmation.

Tall red section at far left: fixed section, no opening action, beige finish. Its smaller side section is walnut brown mica, matte. Keep the front and side finishes separate; confirm visually if the precise side surface is ambiguous.

Lower brown section beneath beige drawer: table finished in brown mica. No cupboard/shutter action confirmed. Exact brown shade remains unspecified.

Four beige shutters and beige drawer: handleless design confirmed. User requested returning to the unresolved green source colour before other details.

Green-marked section beside mirror: side-opening shutter confirmed, correcting prior side-panel description. Walnut brown mica matte finish confirmed. Rear hinge edge near mirror backing confirmed. Swing inward toward mirror confirmed. Handleless confirmed. Safe opening angle remains pending; verify mirror clearance during implementation. Do not make this section fixed.

## Actual checks

Python scripts/extract-prem-skp.py read all three supplied SKP files successfully. Each has 82 vertices, 125 edges, 50 root faces. All extracted geometry/materials compare equal. Face-loop continuity and planarity checks passed in the extractor. Root bounds are 132 x 24 x 84 inches. Non-cabinet Ty instance omitted. This is source extraction, not a finished viewer or full SketchUp component validation.

Local work at /workspace/scratch/b44db19839ae/venki-work contains unit0/1/2.skp, corresponding JSON and Venki_New_Unit_Source_Colours.png. Scratch paths may expire; original uploads are retained separately. No SKP files or extracted layout committed yet.

## Next action

Map the remaining source colours one question at a time, confirming mirror light control (touch sensor or wall switch), then resolving internal layouts. Remaining functional details are unresolved. Do not reuse old Venki design choices or rates for this new unit. Reuse existing Studio architecture when implementation begins.
