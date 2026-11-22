"""Turn the extracted Krishnagiri living-area SKP JSON into dist/krishnagiri-living/exact-layout.js.

Usage: python3 -I scripts/prepare-krishnagiri-living-layout.py customers/krishnagiri-living/source-geometry.json dist/krishnagiri-living/exact-layout.js
Source units are inches (SketchUp Z up); output is metres, Three.js Y up, -Z away from the viewer (same as krishnagiri-kitchen).

Many faces in this model carry their identification colour on the BACK side (SketchUp tag 3503). For those the
visible side is opposite the stored normal, so `visibleColor`/`visibleNormal` are what the viewer uses.
All meanings below were confirmed by Bright on 2026-11-22 (see customers/krishnagiri-living/design.json).
"""
import json, sys
from pathlib import Path

p = json.loads(Path(sys.argv[1]).read_text())
vs = p['vertices']
origin = [min(v[i] for v in vs.values()) for i in range(2)]
IN = .0254


def point(v):
    return [(v[0] - origin[0]) * IN, v[2] * IN, -(v[1] - origin[1]) * IN]


def axis(n):
    return [n[0], n[2], -n[1]]


faces = []
for f in p['faces']:
    back = 'backColor' in f
    n = [-c for c in f['normal']] if back else f['normal']
    faces.append({'id': f['id'], 'color': f['color'], 'backColor': f.get('backColor'), 'visibleColor': f.get('backColor') or f['color'],
                  'normal': axis(f['normal']), 'visibleNormal': axis(n), 'loops': f['loops'],
                  'points': [[point(vs[str(v)]) for v in l] for l in f['loops']]})
by = {f['id']: f for f in faces}

# (id, name, kind, product, source faces, cabinet depth in inches)
groups = [
    ('crockery', 'Crockery unit · tinted glass', 'glass-tinted', 'crockery', [45220, 45225], 15),
    ('book-shelf', 'Book shelf · clear glass', 'glass-clear', 'wall-unit', [43896], 15),
    ('wall-upper', 'Wall unit · beige shutters above the niche', 'wood-shutters', 'wall-unit', [46951, 44607], 15),
    ('seat-end', 'Wall unit · beige shutter at the seat end', 'wood-shutters', 'wall-unit', [44860], 15),
    ('tandem', 'Tandem drawer', 'tandem', 'wall-unit', [44620], 15),
    ('robot-bay', 'Robot cleaner bay · fixed shutter', 'fixed', 'wall-unit', [44629], 15),
    ('tv-shutters', 'TV unit · wooden mica shutters', 'wood-shutters', 'tv-unit', [45882, 46921, 46939, 46933], 12.5),
    ('tv-lift', 'TV unit · tinted glass lift-up', 'glass-lift', 'tv-unit', [46927], 12.5),
    ('tv-display', 'TV unit · clear glass display box', 'glass-clear', 'tv-unit', [45456], 12.5),
    ('entrance-display', 'Entrance · grey tinted glass display', 'glass-grey', 'entrance', [44927], 10),
    ('pooja', 'Pooja unit · CNC shutters', 'cnc', 'pooja', [43445, 43523], 24),
    ('under-stair', 'Under-staircase storage', 'stair-shutters', 'under-stair', [43495, 43517, 43511], 24),
    ('bench', 'Seating bench · lift-up cushion seat', 'bench', 'bench', [44799], 13),
]
units = []
for uid, name, kind, product, ids, depth in groups:
    parts = []
    for fid in ids:
        f = by[fid]
        pts = sum(f['points'], [])
        lo = [min(v[i] for v in pts) for i in range(3)]
        hi = [max(v[i] for v in pts) for i in range(3)]
        parts.append({'faceId': fid, 'normal': f['visibleNormal'], 'center': [(lo[i] + hi[i]) / 2 for i in range(3)],
                      'w': max(hi[0] - lo[0], hi[2] - lo[2]), 'h': hi[1] - lo[1], 'depth': depth * IN, 'lo': lo, 'hi': hi})
    units.append({'id': uid, 'name': name, 'kind': kind, 'product': product, 'ref': by[ids[0]]['visibleColor'],
                  'sourceFaces': ids, 'parts': parts})

special = {
    'marble': [45244, 45981],                      # TV background, white marble-look panels
    'louver': [46502, 45184],                      # wood-slat louver wall bands (84-120in)
    'whiteWall': [45137],                          # charcoal in model = plain white wall
    'ledStrips': [43751, 44605, 45617, 45644],     # concealed LED strips; surfaces wooden mica
    'surfaceLights': [45702],                      # beam over rafters: small surface lights between pillars
    'pencilLights': [46692],                       # ceiling of the box above the rafters
    'plantFloor': [46584],                         # money plants + bonsai, glowing
    'pebbles': [46159],                            # planter base top
    'robotOpening': [44795],                       # robot cleaner entry/exit
    'switchBoxes': [46830, 46909],                 # two-way switch boxes
    'keyBox': [45756, 46845, 46903],               # open display box for keys/decor, wooden mica
    'rafterShelfSides': [46313, 46315, 46393, 46395, 46413, 46415, 46433, 46435],
    # rafter gaps in inches (x from, x to) between neighbouring 4x4 rafters; staggered shelf heights 60/48in
    'rafterGaps': [[61, 66, 60], [70, 75, 48], [79, 84, 60], [88, 93, 48]],
    'rafterDepth': [113.7, 117.7],
    'beamGaps': [[52, 57], [61, 66], [70, 75], [79, 84], [88, 93], [97, 101.5]],
    'benchBox': {'x': [39.5, 52.5], 'y': [229.7, 277.6], 'z': [1, 11.25]}, 'benchTop': [44687, 44883],
    # product regions in source inches [x, y, height]: fixed faces inside belong to that product in Product view
    'productRegions': {'tv-unit': [[39, 121.6, 0], [53, 230, 84.2]], 'wall-unit': [[39, 277, 0], [112, 293, 84.2]],
                       'crockery': [[171, 292, 0], [208, 308, 93.1]], 'entrance': [[39, 109, 0], [112, 122, 120.1]],
                       'pooja': [[303, 262, 0], [328, 293, 84.1]], 'under-stair': [[326, 208, 0], [329, 263, 74]],
                       'bench': [[39, 229, 0], [53, 278, 31]]},
    'keyRecess': {'x': [40.6, 51.0], 'y': [109.6, 116.6], 'z': [1.0, 83.6], 'switch': [55.0, 62.3]},
}
# Coplanar overlapping faces flicker (z-fighting) while rotating (Bright 2026-11-22, box near the stairs).
# For each overlapping pair push one face behind the other: a unit face always wins; otherwise white loses;
# otherwise the larger face loses.
def _area(f):
    lo = [min(v[i] for l in f['points'] for v in l) for i in range(3)]
    hi = [max(v[i] for l in f['points'] for v in l) for i in range(3)]
    return lo, hi
unit_faces = {fid for u in units for fid in u['sourceFaces']}
flat = []
for f in faces:
    n = [abs(c) for c in f['normal']]
    if max(n) < .999:
        continue
    ax = n.index(max(n)); lo, hi = _area(f)
    flat.append((f, ax, lo, hi))
push = set(); edges = []
for i, (a, ax, alo, ahi) in enumerate(flat):
    for b, bx, blo, bhi in flat[i + 1:]:
        if ax != bx or abs(alo[ax] - blo[ax]) > .0005:
            continue
        if any(min(ahi[k], bhi[k]) - max(alo[k], blo[k]) <= .001 for k in range(3) if k != ax):
            continue
        if a['id'] in unit_faces and b['id'] in unit_faces:
            continue
        if a['id'] in unit_faces or b['id'] in unit_faces:
            loser = b if a['id'] in unit_faces else a
        elif (a['visibleColor'] == '#ffffff') != (b['visibleColor'] == '#ffffff'):
            loser = a if a['visibleColor'] == '#ffffff' else b
        else:
            sa = [ahi[k] - alo[k] for k in range(3) if k != ax]; sb = [bhi[k] - blo[k] for k in range(3) if k != bx]
            loser = a if sa[0] * sa[1] >= sb[0] * sb[1] else b
        push.add(loser['id']); edges.append((loser['id'], (b if loser is a else a)['id']))
level = {}
for _ in range(10):
    for lo_id, win_id in edges:
        level[lo_id] = max(level.get(lo_id, 0), level.get(win_id, 0) + 1)
special['pushBack'] = {str(k): v for k, v in sorted(level.items())}
WOOD = {'#660000', '#661900', '#666600', '#31ffff', '#99ff99', '#31ff31', '#ff9831', '#ff7b00', '#ff6532'}
d = {'source': p['source'], 'sha256': p['sha256'], 'sourceUnits': 'inches', 'metresPerInch': IN, 'originInches': origin,
     'sourceFaces': faces, 'units': units, 'special': special, 'woodColours': sorted(WOOD),
     'omittedNonCabinetInstances': p['omittedNonCabinetInstances'],
     'validation': {'sourceVertexCount': len(vs), 'sourceEdgeCount': len(p['edges']), 'sourceFaceCount': len(faces),
                    'backColouredFaces': sum(1 for f in faces if f['backColor'])},
     'notes': ['Wooden mica = Bright\'s reference (same as kitchen) everywhere wood is confirmed.',
               'Render approximations: glass tints, shelf counts, hinge sides, pooja shutter colour, cushion colour, plants.']}
Path(sys.argv[2]).write_text('export const exactLayout=' + json.dumps(d, separators=(',', ':')) + ';\n')
print('Prepared', len(faces), 'source faces;', d['validation']['backColouredFaces'], 'back-coloured;', len(units), 'sections')
