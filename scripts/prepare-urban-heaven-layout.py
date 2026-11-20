#!/usr/bin/env python3
"""Urban Heaven (Veerapandi) Phase 2 layout -> dist/urban-heaven/site-layout.js

Source: "Veerapandi Phase 2 Layout - A4.pdf" (one raster page, 2382x3369 JPEG, sha256 f460b6102919b30d...).
The PDF holds no vector drawing, so plot outlines are traced from the image by colour (one
connected component per plot), simplified to polygons and converted to metres. Scale is set
from the drawn 7.2 m road width and checked against the 29'10" x 37'5" typical plot.
Areas (sq.ft / sq.m / cent) come from the PDF's own site table, not from the traced shapes.

Usage: python3 -I scripts/prepare-urban-heaven-layout.py <layout.pdf> dist/urban-heaven/site-layout.js
"""
import json, sys
import numpy as np
import cv2
import pymupdf

pdf, out = sys.argv[1], sys.argv[2]
doc = pymupdf.open(pdf)
xref = doc[0].get_images()[0][0]
raw = doc.extract_image(xref)['image']
img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)[:, :, ::-1].astype(int)  # RGB
H, W = img.shape[:2]
S = W / 910.0                       # image px per "reference px" (110 dpi render used for reading)
X0, X1, Y0, Y1 = 130, 470, 195, 905  # plan area in reference px

COLOURS = {
    'sunshine': (168, 195, 238), 'elegant': (220, 205, 236), 'ethnic': (170, 222, 209),
    'early': (228, 233, 139), 'park': (125, 187, 90), 'P': (224, 109, 90), 'EB': (94, 161, 84),
}
comps = []
sub = img[int(Y0 * S):int(Y1 * S), int(X0 * S):int(X1 * S)]
for cat, c in COLOURS.items():
    m = (np.abs(sub - np.array(c)).sum(2) < 45).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for ct in cnts:
        if cv2.contourArea(ct) < 4000:
            continue
        # printed numbers/dimensions punch notches into the colour; plots are convex, so use the hull,
        # then grow by half of the white separator line (~5 image px) so neighbours meet on the shared boundary
        hull = cv2.convexHull(ct)
        poly = cv2.approxPolyDP(hull, 5, True)[:, 0, :].astype(float)
        cxy = poly.mean(0)
        d = poly - cxy
        poly = cxy + d * (1 + 2.6 / np.maximum(np.abs(d), 1))  # push each vertex ~2.6 px outward per axis
        poly[:, 0] = poly[:, 0] / S + X0
        poly[:, 1] = poly[:, 1] / S + Y0
        x, y, w, h = cv2.boundingRect(ct)
        cx, cy = (x + w / 2) / S + X0, (y + h / 2) / S + Y0
        if cat == 'elegant' and cx > 454:   # thin gift-deed strip beside the main road, not a plot
            continue
        comps.append({'cat': cat, 'cx': cx, 'cy': cy, 'poly': poly.tolist()})

# Plot numbers by position (as printed on the drawing): rows top->bottom, columns left->right.
ROWS = [  # (row centre y in reference px, numbers left->right for the five 29'10" columns)
    (344, [45, 44, 43, 42, 41]), (409, [33, 34, 35, 36, 37]),
    (514, [32, 31, 30, 29, 28]), (579, [20, 21, 22, 23, 24]),
    (695, [19, 18, 17, 16, 15]), (759, [7, 8, 9, 10, 11]),
]
EAST_COL = [(332, 40), (375, 39), (419, 38), (502, 27), (545, 26), (589, 25), (683, 14), (725, 13), (770, 12)]
BOTTOM = [6, 5, 4, 3, 2, 1]

def number(cmp):
    cx, cy = cmp['cx'], cmp['cy']
    if cmp['cat'] in ('park', 'P', 'EB'):
        return cmp['cat']
    if cy < 280:
        return 46
    if cy > 820:
        xs = sorted(c['cx'] for c in comps if c['cy'] > 820 and c['cat'] not in ('park', 'P', 'EB'))
        return BOTTOM[xs.index(cx)]
    if cx > 393:
        return min(EAST_COL, key=lambda e: abs(e[0] - cy))[1]
    row = min(ROWS, key=lambda r: abs(r[0] - cy))[1]
    return row[min(range(5), key=lambda i: abs([161, 213, 264, 316, 367][i] - cx))]

# PDF site table: number -> (sq.ft, sq.m, cent)
TABLE = {1: (1313, 121.95, 3.01), 2: (1117, 103.74, 2.56), 3: (1301, 120.84, 2.99), 4: (1117, 103.74, 2.56), 5: (1018, 94.62, 2.34),
         6: (1068, 99.18, 2.45), 7: (1141, 106.02, 2.62), 8: (1117, 103.74, 2.56), 9: (1117, 103.74, 2.56), 10: (1117, 103.74, 2.56),
         11: (1117, 103.74, 2.56), 12: (859, 79.84, 1.97), 13: (883, 82.08, 2.03), 14: (883, 82.00, 2.03), 15: (1117, 103.74, 2.56),
         16: (1117, 103.74, 2.56), 17: (1117, 103.74, 2.56), 18: (1117, 103.74, 2.56), 19: (1141, 106.02, 2.62), 20: (1129, 104.88, 2.59),
         21: (1117, 103.74, 2.56), 22: (1117, 103.74, 2.56), 23: (1117, 103.74, 2.56), 24: (1117, 103.74, 2.56), 25: (859, 79.84, 1.97),
         26: (883, 82.08, 2.03), 27: (883, 82.00, 2.03), 28: (1117, 103.74, 2.56), 29: (1117, 103.74, 2.56), 30: (1117, 103.74, 2.56),
         31: (1117, 103.74, 2.56), 32: (1129, 104.88, 2.59), 33: (1117, 103.74, 2.56), 34: (1117, 103.74, 2.56), 35: (1117, 103.74, 2.56),
         36: (1117, 103.74, 2.56), 37: (1117, 103.74, 2.56), 38: (859, 79.84, 1.97), 39: (883, 82.08, 2.03), 40: (883, 82.00, 2.03),
         41: (1117, 103.74, 2.56), 42: (1117, 103.74, 2.56), 43: (1117, 103.74, 2.56), 44: (1117, 103.74, 2.56), 45: (1117, 103.74, 2.56),
         46: (1113, 103.41, 2.56)}
# The PDF's printed rows add up to 49,504 sq.ft / 4,598.28 sq.m / 113.54 cents while its stated totals are
# 49,494 / 4,598.13 / 113.62 - within per-row rounding (46 rows). The viewer shows the PDF's stated totals.
assert abs(sum(v[0] for v in TABLE.values()) - 49494) <= 23, 'table total drifted beyond row rounding'

# Scale from the plot pitch: columns repeat every 51.6 ref px (29'10" = 9.09 m), rows every 64.9 ref px
# (37'5" = 11.40 m) -> 0.1762 / 0.1757 m per px; use the mean. (Road widths then read 7.3 m / 9.1 m.)
M = (9.093 / 51.6 + 11.405 / 64.9) / 2
ORIGIN = (136.0, 204.0)  # NW corner of the plan (park top-left) -> (0, 0); x east, z south
to_m = lambda p: [round((p[0] - ORIGIN[0]) * M, 2), round((p[1] - ORIGIN[1]) * M, 2)]

plots, extras = [], []
for c in comps:
    n = number(c)
    rec = {'cat': c['cat'], 'poly': [to_m(p) for p in c['poly']], 'c': to_m((c['cx'], c['cy']))}
    if isinstance(n, int):
        sqft, sqm, cent = TABLE[n]
        rec.update(n=n, sqft=sqft, sqm=sqm, cent=cent)
        plots.append(rec)
    else:
        rec['id'] = n
        extras.append(rec)
plots.sort(key=lambda p: p['n'])
nums = [p['n'] for p in plots]
assert nums == list(range(1, 47)), f'expected plots 1..46, got {nums}'
counts = {k: sum(p['cat'] == k for p in plots) for k in ('sunshine', 'elegant', 'ethnic', 'early')}
assert counts == {'sunshine': 10, 'elegant': 20, 'ethnic': 10, 'early': 6}, counts
w = (453.9 - 136.0) * M  # plots span; boundary incl. gift-deed strip ~ (466.8-136)*M
print('metres/px %.4f  plot band width %.1f m  boundary width %.1f m (PDF north 56.8 m)' % (M, w, (466.8 - 136.0) * M))
typ = next(p for p in plots if p['n'] == 43)
xs = [q[0] for q in typ['poly']]; zs = [q[1] for q in typ['poly']]
print('plot 43 traced %.2f x %.2f m (PDF 29\'10" x 37\'5" = 9.09 x 11.40 m incl. border lines)' % (max(xs) - min(xs), max(zs) - min(zs)))

ROADS = [  # internal roads as drawn (reference px y-range), full width of the layout
    {'name': '7.2 m wide road', 'w': 7.2, 'y': (270.5, 311.7)}, {'name': '7.2 m wide road', 'w': 7.2, 'y': (440.5, 482.3)},
    {'name': '9.0 m wide road', 'w': 9.0, 'y': (611.0, 662.6)}, {'name': '7.2 m wide road', 'w': 7.2, 'y': (791.2, 833.0)},
]
data = {
    'source': 'Veerapandi Phase 2 Layout - A4.pdf (DTCP Approval No. 25/2025) - traced; indicative, refer to the DTCP approved plan',
    'metresPerPx': round(M, 5),
    'plots': plots, 'extras': extras,
    'roads': [{'name': r['name'], 'w': r['w'], 'z0': to_m((0, r['y'][0]))[1], 'z1': to_m((0, r['y'][1]))[1]} for r in ROADS],
    'boundary': [to_m(p) for p in [(136, 202.5), (466.8, 202.5), (466.8, 897.5), (136, 897.5)]],
    'giftStrip': [to_m(p) for p in [(454.5, 202.5), (466.8, 202.5), (466.8, 897.5), (454.5, 897.5)]],
    'mainRoad': {'name': '12.2 m existing Panchayat road', 'w': 12.2, 'x0': to_m((468.5, 0))[0], 'x1': to_m((537.0, 0))[0]},
    'facts': {'plots': 46, 'sqft': 49494, 'sqm': 4598.13, 'cents': 113.62, 'park': 515.35, 'typical': "29'10\" x 37'5\"",
              'categories': {'sunshine': ['Sunshine East', 10], 'elegant': ['Elegant North', 20], 'ethnic': ['Ethnic South', 10], 'early': ['Early Bird South', 6]}},
}
with open(out, 'w') as f:
    f.write('// Generated by scripts/prepare-urban-heaven-layout.py - do not edit by hand.\n')
    f.write('export const LAYOUT = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print('wrote', out, len(plots), 'plots', [e['id'] for e in extras])
