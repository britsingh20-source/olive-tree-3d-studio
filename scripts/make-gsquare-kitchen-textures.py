"""Generate illustrative textures for the gsquare kitchen viewer.

- wicker.jpg: cane/rattan weave in the honey-brown of Bright's basket photo (photo itself not committed: brand logo).
- granite-black.jpg: black granite with fine grey/white speckle (no longer used: worktop changed to white).
- quartz-white.jpg: white worktop with faint grey speckle (Bright, 28 Nov 00:11).
Usage: python scripts/make-gsquare-kitchen-textures.py dist/gsquare-kitchen/textures
"""
import random
import sys
from PIL import Image, ImageDraw, ImageFilter


def wicker(path, size=512, cells=12):
    img = Image.new("RGB", (size, size), (92, 52, 22))
    d = ImageDraw.Draw(img)
    c = size // cells
    rnd = random.Random(7)
    for gy in range(cells):
        for gx in range(cells):
            x0, y0 = gx * c, gy * c
            horizontal = (gx + gy) % 2 == 0
            for k in range(3):
                tone = rnd.randint(-14, 14)
                base = (196 + tone, 128 + tone, 62 + tone // 2)
                if horizontal:
                    y = y0 + 2 + k * (c - 4) // 3
                    d.rounded_rectangle([x0 + 1, y, x0 + c - 2, y + (c - 4) // 3 - 2], radius=3, fill=base)
                    d.line([x0 + 3, y + 2, x0 + c - 4, y + 2], fill=(226, 168, 98), width=1)
                else:
                    x = x0 + 2 + k * (c - 4) // 3
                    d.rounded_rectangle([x, y0 + 1, x + (c - 4) // 3 - 2, y0 + c - 2], radius=3, fill=base)
                    d.line([x + 2, y0 + 3, x + 2, y0 + c - 4], fill=(226, 168, 98), width=1)
    img.filter(ImageFilter.GaussianBlur(0.6)).save(path, quality=88)


def granite(path, size=512):
    rnd = random.Random(11)
    img = Image.new("RGB", (size, size), (18, 18, 19))
    d = ImageDraw.Draw(img)
    for _ in range(9000):
        x, y = rnd.randrange(size), rnd.randrange(size)
        r = rnd.choice([0, 0, 0, 1, 1, 2])
        v = rnd.choice([30, 38, 46, 60, 85, 120, 160])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(v, v, v + 2))
    img.filter(ImageFilter.GaussianBlur(0.5)).save(path, quality=90)


def quartz(path, size=512):
    rnd = random.Random(5)
    img = Image.new("RGB", (size, size), (242, 241, 236))
    d = ImageDraw.Draw(img)
    for _ in range(5000):
        x, y = rnd.randrange(size), rnd.randrange(size)
        r = rnd.choice([0, 0, 1])
        v = rnd.choice([205, 215, 222, 228, 190])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(v, v, v - 3))
    img.filter(ImageFilter.GaussianBlur(0.6)).save(path, quality=90)


if __name__ == "__main__":
    out = sys.argv[1]
    wicker(out + "/wicker.jpg")
    granite(out + "/granite-black.jpg")
    quartz(out + "/quartz-white.jpg")
    print("ok")
