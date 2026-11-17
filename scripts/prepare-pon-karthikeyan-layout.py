"""Convert the extracted Irugur TV-unit SKP JSON into the viewer's exact-layout.js.

Usage: python3 scripts/prepare-pon-karthikeyan-layout.py customers/pon-karthikeyan/source-geometry.json dist/pon-karthikeyan/exact-layout.js
Axes: three.js x = source x, y = source z (height), z = -source y (front of unit at z=0).
"""
import json, sys
from pathlib import Path

p = json.loads(Path(sys.argv[1]).read_text())
vs = p['vertices']
origin = [min(v[i] for v in vs.values()) for i in range(3)]
I = .0254

def point(v):
    return [(v[0] - origin[0]) * I, (v[2] - origin[2]) * I, -(v[1] - origin[1]) * I]

def normal(n):
    return [n[0], n[2], -n[1]]

faces = []
for f in p['faces']:
    loops = [[point(vs[str(i)]) for i in loop] for loop in f['loops']]
    faces.append({'id': f['id'], 'color': f['color'], 'name': f['name'], 'normal': normal(f['normal']), 'points': loops})

meaning = json.loads(Path('customers/pon-karthikeyan/design.json').read_text())['sourceColours']
d = {
    'source': p['source'], 'sha256': p['sha256'], 'sourceUnits': 'inches', 'metresPerInch': I,
    'originInches': origin, 'sizeInches': [round(max(v[i] for v in vs.values()) - origin[i], 3) for i in range(3)],
    'sourceFaces': faces,
    'colourMeanings': {c: v.get('meaning') for c, v in meaning.items()},
    'omittedNonCabinetInstances': p['omittedNonCabinetInstances'],
    'validation': {'sourceVertexCount': len(vs), 'sourceEdgeCount': len(p['edges']), 'sourceFaceCount': len(faces)},
}
Path(sys.argv[2]).write_text('export const exactLayout=' + json.dumps(d, separators=(',', ':')) + ';\n')
print('Prepared', len(faces), 'source faces; size (in)', d['sizeInches'])
