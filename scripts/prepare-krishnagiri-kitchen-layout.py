"""Turn the extracted Krishnagiri kitchen SKP JSON into dist/krishnagiri-kitchen/exact-layout.js.

Usage: python3 -I scripts/prepare-krishnagiri-kitchen-layout.py customers/krishnagiri-kitchen/source-geometry.json dist/krishnagiri-kitchen/exact-layout.js
Source units are inches (SketchUp Z up); output is metres, Three.js Y up, -Z away from the viewer.
"""
import json, sys
from pathlib import Path

p = json.loads(Path(sys.argv[1]).read_text())
vs = p['vertices']
origin = [min(v[i] for v in vs.values()) for i in range(2)]


def point(v):
    return [(v[0] - origin[0]) * .0254, v[2] * .0254, -(v[1] - origin[1]) * .0254]


def normal(n):
    return [n[0], n[2], -n[1]]


faces = [{**f, 'points': [[point(vs[str(v)]) for v in l] for l in f['loops']], 'normal': normal(f['normal'])} for f in p['faces']]
by = {f['id']: f for f in faces}
BASE, WALL = .6096, .3048
# (id, name, kind, source faces, cabinet depth) — purposes as confirmed by Bright on 2026-11-21.
groups = [
    ('shelves-back-1', 'Shutter with shelves · back 1', 'shelves', [42836], BASE),
    ('shelves-back-2', 'Shutter with shelves · back 2', 'shelves', [42830], BASE),
    ('cutlery', 'Cutlery tandem drawer', 'cutlery', [42849], BASE),
    ('thali', 'Thali basket tandem', 'thali', [43189], BASE),
    ('oil', 'Oil pull-out', 'oil', [42842], BASE),
    ('corner', 'S-corner unit', 'corner', [42792], BASE),
    ('shelves-side', 'Shutter with shelves · side', 'shelves', [42794], BASE),
    ('rice', 'Rice basket', 'rice', [42861], BASE),
    ('wicker', 'Open unit · two wicker baskets', 'wicker-open', [42855], BASE),
    ('glass-back', 'Black glass wall units · back', 'glass', [43107, 43014], WALL),
    ('glass-side', 'Black glass wall units · side', 'glass', [43100, 43008], WALL),
    ('wall-normal', 'Wall unit · normal shutter', 'shelves', [42896], WALL),
    ('open-box', 'Open wooden box', 'open', [42912, 42921, 42940, 42944, 42945, 42942], WALL),
]
units = []
for uid, name, kind, ids, depth in groups:
    parts = []
    for fid in (ids[:1] if kind == 'open' else ids):
        f = by[fid]
        pts = sum(f['points'], [])
        lo = [min(v[i] for v in pts) for i in range(3)]
        hi = [max(v[i] for v in pts) for i in range(3)]
        parts.append({'faceId': fid, 'normal': f['normal'], 'center': [(lo[i] + hi[i]) / 2 for i in range(3)],
                      'w': max(hi[0] - lo[0], hi[2] - lo[2]), 'h': hi[1] - lo[1], 'depth': depth})
    units.append({'id': uid, 'name': name, 'kind': kind, 'ref': by[ids[0]]['color'], 'sourceFaces': ids, 'parts': parts})

special = {'countertop': [42973], 'litUndersides': [43064]}
d = {'source': p['source'], 'sha256': p['sha256'], 'sourceUnits': 'inches', 'metresPerInch': .0254, 'originInches': origin,
     'sourceFaces': faces, 'units': units, 'special': special,
     'omittedNonCabinetInstances': p['omittedNonCabinetInstances'],
     'validation': {'sourceVertexCount': len(vs), 'sourceEdgeCount': len(p['edges']), 'sourceFaceCount': len(faces)},
     'notes': ['All solid fronts: aqua/mint high gloss, handleless (confirmed 2026-11-21).',
               'Wooden mica only inside open cabinet areas: wicker unit, open box, lit wall-unit undersides.',
               'Black tinted glass wall shutters with concealed lights and one glass shelf.',
               'Countertop colour not confirmed; black stone is a placeholder.']}
Path(sys.argv[2]).write_text('export const exactLayout=' + json.dumps(d, separators=(',', ':')) + ';\n')
print('Prepared', len(faces), 'source faces;', len(units), 'sections')
