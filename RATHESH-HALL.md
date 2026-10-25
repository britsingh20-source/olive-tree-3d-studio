# Mr. Rathesh G — Hall

Public route: `/rathesh/hall/`. Kitchen and hall share room navigation.

The hall retains all 93 source faces from `hallll.skp`, including sloped outlines and original doorway positioning. Original identification colours remain available in Reference colours. Finishes and illustrative mechanisms are generated separately.

## Independent items

- TV panel: glossy white marble with grey veins; walnut edges.
- Paneling and louvers: walnut brown mica.
- Pooja: two hinged walnut doors, with actual CNC circular, bell and lotus cut-outs.
- TV storage: walnut end shutters and hinged glass centre doors.
- Robot-cleaner cabinet: hinged walnut shutter above a clear 152.4 mm floor entrance; no bottom plinth across the opening. Clearance is illustrative and must be checked against the chosen cleaner.
- Decorative display: tinted hinged glass front, five glass shelves, walnut backing and warm lighting.
- Doorway surround: independently selectable walnut trim.

Each item supports rotate, move, zoom, door controls, front/side finish selection, a bottom mica strip, browser-local saved finishes, and quotation selection without rates. The automatic tour returns to the whole hall, highlights each next item, zooms in, demonstrates its mechanism, closes it, then returns. User input stops the tour; Replay restarts it.

## Rebuilding and validation

Extract the SKP using `scripts/extract-prem-skp.py`, then run:

```sh
python scripts/prepare-rathesh-hall.py path/to/extracted.json dist/rathesh/hall/exact-layout.js
node check-rathesh-hall.mjs
node check-rathesh.mjs
```

The hall check verifies original face coordinates, independent products, eight hinges, CNC holes, cleaner entrance, glass display internals and phone/desktop framing. WebGL provides PBR materials and reflections; the compatibility renderer provides simplified geometry and controls on browsers without WebGL.
