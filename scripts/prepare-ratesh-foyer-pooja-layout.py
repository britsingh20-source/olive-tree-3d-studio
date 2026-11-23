"""Convert the extracted Ratesh foyer + pooja SKP JSON into dist/ratesh/foyer-pooja/exact-layout.js.

World axes (metres): X = (x - 86.8 in), Y = height (source z), Z = (215.4 in - y).
So the book-counter front faces +Z and the tall pooja unit front faces +X.

Usage: python scripts/prepare-ratesh-foyer-pooja-layout.py customers/ratesh/foyer-pooja-source-geometry.json dist/ratesh/foyer-pooja/exact-layout.js
"""
import json
import sys

I = 0.0254
X0, Y0 = 86.8, 215.4


def conv(p):
    x, y, z = p
    return [round((x - X0) * I, 6), round(z * I, 6), round((Y0 - y) * I, 6)]


def main(src, out):
    d = json.load(open(src))
    V = d["vertices"]
    faces = []
    for f in d["faces"]:
        nx, ny, nz = f["normal"]
        faces.append({
            "id": f["id"],
            "color": f["color"],
            "normal": [round(nx, 6), round(nz, 6), round(-ny, 6)],
            "points": [[conv(V[str(v)]) for v in loop] for loop in f["loops"]],
        })
    pts = [p for f in faces for l in f["points"] for p in l]
    size = [round(max(p[i] for p in pts) - min(p[i] for p in pts), 6) for i in range(3)]
    layout = {"source": "gn mills foir and pooja.skp / Untitled (8).skp (identical)", "sourceUnits": "inches",
              "sha256": d["sha256"], "size": size, "sourceFaces": faces}
    with open(out, "w") as fh:
        fh.write("export const exactLayout=" + json.dumps(layout, separators=(",", ":")) + ";\n")
    print(len(faces), "faces", size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
