"""Convert the extracted gsquare SKP JSON into dist/gsquare/exact-layout.js.

World axes (metres): X = (x - 256.1 in), Y = height (source z), Z = (244.3 in - y).
So the TV wall faces +Z, the pooja unit front faces -X and the grass panel / rear storage door face the staircase (-Z / -X).
Faces keep their front colour and, where present, their back-side colour (the colour SketchUp shows on the visible side).

Usage: python scripts/prepare-gsquare-layout.py customers/gsquare/source/gsquare-extract.json dist/gsquare/exact-layout.js
"""
import json
import sys

I = 0.0254
X0, Y0 = 256.1, 244.3


def conv(p):
    x, y, z = p
    return [round((x - X0) * I, 6), round(z * I, 6), round((Y0 - y) * I, 6)]


def main(src, out):
    d = json.load(open(src))
    V = d["vertices"]
    faces = []
    for f in d["faces"]:
        nx, ny, nz = f["normal"]
        face = {"id": f["id"], "color": f["color"], "normal": [round(nx, 6), round(nz, 6), round(-ny, 6)],
                "points": [[conv(V[str(v)]) for v in loop] for loop in f["loops"]]}
        if "backColor" in f:
            face["backColor"] = f["backColor"]
        faces.append(face)
    pts = [p for f in faces for l in f["points"] for p in l]
    size = [round(max(p[i] for p in pts) - min(p[i] for p in pts), 6) for i in range(3)]
    layout = {"source": "gsquare.skp / gsquare (1).skp (identical geometry)", "sourceUnits": "inches",
              "sha256": d["sha256"], "size": size, "sourceFaces": faces}
    with open(out, "w") as fh:
        fh.write("export const exactLayout=" + json.dumps(layout, separators=(",", ":")) + ";\n")
    print(len(faces), "faces", size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
