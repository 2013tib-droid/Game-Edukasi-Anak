"""Cut ONE piece of art (owner-supplied, white paper background) into a
transparent WebP ready for `src/engine/ui/items.ts`.

    pip install pillow numpy
    python3 scripts/cut-item.py <art.png> public/assets/items/<id>.webp [max_px]

The sibling script `cut-item-sheet.py` does the same for a whole labelled
sheet; this one is for the single images the owner sends one at a time.

Same two traps as the sheet script, both learned the hard way:

  * The flood fill walks from the paper inwards over "light and colourless"
    pixels with a small neighbour tolerance (8). Raising it eats artwork that
    is itself nearly white.
  * Background the fill CANNOT reach (a gap enclosed by the artwork) stays
    opaque on purpose. Enclosed light areas that belong to the animal — the
    jalak's white wing bar and tail tip — must survive, so never "clean up"
    leftover white automatically. Eyeball the result on a coloured background
    before shipping it.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image

SRC = sys.argv[1]
DST = sys.argv[2]
MAX_PX = int(sys.argv[3]) if len(sys.argv) > 3 else 512

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
H, W, _ = a.shape

lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
light = (lum >= 196) & (sat <= 30)

bg = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if light[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if light[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((y, x))
while q:
    y, x = q.popleft()
    base = a[y, x]
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and light[ny, nx]:
            if int(np.abs(a[ny, nx] - base).max()) <= 8:
                bg[ny, nx] = True
                q.append((ny, nx))

ys, xs = np.where(~bg)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
rgba = np.dstack([a[y0:y1, x0:x1].astype(np.uint8), (~bg[y0:y1, x0:x1]).astype(np.uint8) * 255])
img = Image.fromarray(rgba, 'RGBA')

# Item art is drawn at ~100px on screen; anything past ~512 is weight for
# nothing on a low-end Android.
scale = min(1.0, MAX_PX / max(img.size))
if scale < 1.0:
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

img.save(DST, 'WEBP', quality=92, method=6)
print(f'{DST}: {img.size[0]}x{img.size[1]}, latar terbuang {bg.mean() * 100:.1f}%')
