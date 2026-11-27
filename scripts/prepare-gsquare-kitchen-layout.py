"""Convert the extracted gsquare kitchen SKP JSON into dist/gsquare-kitchen/exact-layout.js.

Source-relative inches (xr, yr, z) = raw source minus model minimum (55.5485, 55.3499, 0).
World axes (metres): X = xr - 66, Y = height (z), Z = 48 - yr.
So the long counter fronts face +Z, the short counter and wall cabinet fronts face -X and the tall unit fronts face -Z.

Usage: python scripts/prepare-gsquare-kitchen-layout.py customers/gsquare-kitchen/source/gsquare-k-extract.json dist/gsquare-kitchen/exact-layout.js
"""
import json
import sys

I = 0.0254
X0, Y0 = 55.5485457415881 + 66, 55.34990343313095 + 48


def conv(p):
    x, y, z = p
    return [round((x - X0) * I, 6), round(z * I, 6), round((Y0 - y) * I, 6)]


def main(src, out):
    d = json.load(open(src))
    V = d["vertices"]
    faces = []
    for f in d["faces"]:
        nx, ny, nz = f["normal"]
        faces.append({"id": f["id"], "color": f["color"], "normal": [round(nx, 6), round(nz, 6), round(-ny, 6)],
                      "points": [[conv(V[str(v)]) for v in loop] for loop in f["loops"]]})
    pts = [p for f in faces for l in f["points"] for p in l]
    size = [round(max(p[i] for p in pts) - min(p[i] for p in pts), 6) for i in range(3)]
    layout = {"source": "gsquare k.skp / (1) / (2) (identical geometry)", "sourceUnits": "inches",
              "sha256": d["sha256"], "size": size, "sourceFaces": faces}
    with open(out, "w") as fh:
        fh.write("export const exactLayout=" + json.dumps(layout, separators=(",", ":")) + ";\n")
    print(len(faces), "faces", size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
