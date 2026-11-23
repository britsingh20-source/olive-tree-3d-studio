"""Generate render textures for Ratesh's foyer + pooja viewer.

- pooja-door-left.jpg / pooja-door-right.jpg: Scandic Wood 1382 mica (ACE MICA) with the
  studio's Pattern 1 pooja CNC cutting (mandala jali, hanging bells, lotus),
  drawn procedurally as a visual approximation (not a fabrication drawing).
- pooja-glow-left.png / pooja-glow-right.png: emissive masks of the cut-outs so
  the warm pooja light glows through them.
- grass-mat.jpg: illustrative artificial-grass texture.

Usage: python scripts/make-ratesh-foyer-textures.py dist/ratesh/foyer-pooja [wood.jpg]
"""
import math
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

out = sys.argv[1]
PX = 20  # pixels per inch
W, H = 37 * PX, 54 * PX  # pair of upper pooja shutters
SEAM = W // 2

# Wood at true sheet scale: the tile represents a 48 x 87.4 in ACE MICA sheet (label removed).
tile = Image.open(f"{out}/{sys.argv[2] if len(sys.argv) > 2 else 'scandic-wood-1382-tile.jpg'}").convert("RGB")
ppi = tile.width / 48
wood = tile.crop((int(5 * ppi), int(8 * ppi), int(5 * ppi + 37 * ppi), int(8 * ppi + 54 * ppi))).resize((W, H), Image.LANCZOS)

mask = Image.new("L", (W, H), 0)  # 255 = cut-out
md = ImageDraw.Draw(mask)


def poly(cx, cy, r, n, rot=0.0):
    return [(cx + r * math.cos(rot + 2 * math.pi * k / n), cy + r * math.sin(rot + 2 * math.pi * k / n)) for k in range(n)]


def clear_of_seam(points, gap=6):
    xs = [p[0] for p in points]
    return max(xs) < SEAM - gap or min(xs) > SEAM + gap


# Mandala jali around a round centre
cx, cy = SEAM, int(H * 0.47)
disc = 2.8 * PX
for ring in range(7):
    r = disc + 22 + ring * 30
    count = 12 + ring * 5
    size = 8 + ring * 1.9
    for k in range(count):
        a = 2 * math.pi * (k + 0.5 * (ring % 2)) / count
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        p = poly(x, y, size, 6, a)
        if clear_of_seam(p):
            md.polygon(p, fill=255)
# Outer scalloped petals
for k in range(24):
    a = 2 * math.pi * k / 24
    x, y = cx + (disc + 245) * math.cos(a), cy + (disc + 245) * math.sin(a)
    p = poly(x, y, 15, 10, a)
    if clear_of_seam(p):
        md.polygon(p, fill=255)

# Hanging bells with dotted chains
for bx, length in [(55, 210), (135, 130), (235, 60), (W - 235, 60), (W - 135, 130), (W - 55, 210)]:
    for y in range(14, length, 14):
        md.ellipse((bx - 2.5, y - 2.5, bx + 2.5, y + 2.5), fill=255)
    top = length
    md.ellipse((bx - 6, top - 2, bx + 6, top + 10), fill=255)
    md.polygon([(bx - 9, top + 6), (bx + 9, top + 6), (bx + 17, top + 40), (bx - 17, top + 40)], fill=255)
    md.ellipse((bx - 5, top + 38, bx + 5, top + 48), fill=255)


def lotus(x, y, s):
    for ang, ln in [(-60, 0.8), (-30, 1.0), (0, 1.15), (30, 1.0), (60, 0.8)]:
        a = math.radians(ang - 90)
        pts = []
        for t in range(21):
            u = t / 20 * math.pi
            px_ = math.sin(u) * 0.28 * s
            py_ = -(1 - math.cos(u)) / 2 * ln * s
            pts.append((x + px_ * math.cos(a + math.pi / 2) - py_ * math.cos(a) * -1 * 0 + py_ * -math.cos(a + math.pi / 2) * 0, 0))
        # simple petal: rotated ellipse polygon
        petal = []
        for t in range(32):
            u = 2 * math.pi * t / 32
            ex, ey = 0.22 * s * math.cos(u), 0.5 * ln * s * math.sin(u)
            ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
            ox, oy = ex * ca - (ey - 0.5 * ln * s) * sa, ex * sa + (ey - 0.5 * ln * s) * ca
            petal.append((x + ox, y + oy))
        md.polygon(petal, fill=255)
    md.rectangle((x - 0.9 * s, y + 0.12 * s, x + 0.9 * s, y + 0.2 * s), fill=255)


lotus(SEAM - 95, int(H * 0.80), 46)
lotus(SEAM + 95, int(H * 0.80), 46)
lotus(70, int(H * 0.93), 40)
lotus(W - 70, int(H * 0.93), 40)

mask = mask.filter(ImageFilter.GaussianBlur(0.6))

# Compose: warm amber light seen through the cut-outs
glow = Image.new("RGB", (W, H), (236, 158, 70))
gd = ImageDraw.Draw(glow)
for r in range(380, 0, -20):
    k = r / 380
    gd.ellipse((cx - r * 1.4, cy - r * 1.4, cx + r * 1.4, cy + r * 1.4), fill=(int(200 + 50 * (1 - k)), int(110 + 70 * (1 - k)), int(40 + 40 * (1 - k))))
face = Image.composite(glow, wood, mask)
fd = ImageDraw.Draw(face)
# Decorative round centre (no handle function: fronts are handleless)
dark = wood.point(lambda v: int(v * 0.72))
cm = Image.new("L", (W, H), 0)
ImageDraw.Draw(cm).ellipse((cx - disc, cy - disc, cx + disc, cy + disc), fill=255)
face = Image.composite(dark, face, cm)
fd = ImageDraw.Draw(face)
fd.ellipse((cx - disc, cy - disc, cx + disc, cy + disc), outline=(52, 33, 20), width=3)
fd.line((SEAM, 0, SEAM, H), fill=(40, 26, 16), width=2)

emissive = Image.composite(glow, Image.new("RGB", (W, H), 0), mask)
for name, box in [("left", (0, 0, SEAM, H)), ("right", (SEAM, 0, W, H))]:
    face.crop(box).save(f"{out}/pooja-door-{name}.jpg", quality=88)
    emissive.crop(box).save(f"{out}/pooja-glow-{name}.png", optimize=True)

# Artificial grass mat (illustrative, tileable-ish)
random.seed(7)
G = 512
g = Image.new("RGB", (G, G), (58, 92, 40))
gdraw = ImageDraw.Draw(g)
for _ in range(9000):
    x, y = random.randrange(G), random.randrange(G)
    ln = random.randint(6, 16)
    a = random.uniform(-0.6, 0.6) - math.pi / 2
    c = random.choice([(78, 122, 52), (96, 140, 60), (64, 104, 44), (112, 154, 70), (48, 80, 34)])
    gdraw.line((x, y, x + ln * math.cos(a) * 0.4, y + ln * math.sin(a)), fill=c, width=2)
g.save(f"{out}/grass-mat.jpg", quality=86)
print("ok", W, H)
