"""Cut ONE piece of AI-generated art whose "transparent" background is really a
PAINTED grey/white checkerboard into a genuinely transparent WebP.

    pip install pillow numpy
    python scripts/cut-checkerboard.py <art.jpg> public/assets/<id>.webp [max_px]

Use this for art that arrives from an image generator (Gemini/ChatGPT) showing
the familiar checkerboard: the file is a JPEG, so the checker is baked into the
pixels and there is no alpha channel at all. For owner art photographed on
white paper use `cut-item.py` instead — its flood fill has a tight neighbour
tolerance (8) that a checkerboard's 227→255 steps would stop dead.

How it works, and the two traps:

  * A pixel counts as background when it is light (max channel >= 210) and
    colourless (saturation <= 20) — that covers BOTH checker tones at once, so
    the fill crosses square boundaries freely. It then walks in from the frame
    edge, which is why background enclosed by the artwork stays opaque.
  * JPEG ringing leaves a grey halo hugging the black outline. `-erode` on the
    kept region would gnaw the outline itself, so instead the alpha is feathered
    one pixel and near-background pixels touching the cut are faded, not cut.
    Always eyeball the result on a coloured background before shipping it.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1]
DST = sys.argv[2]
MAX_PX = int(sys.argv[3]) if len(sys.argv) > 3 else 512

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
H, W, _ = a.shape

lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
light = (lum >= 210) & (sat <= 20)

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
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and light[ny, nx]:
            bg[ny, nx] = True
            q.append((ny, nx))

ys, xs = np.where(~bg)
top, bottom = ys.min(), ys.max() + 1
left, right = xs.min(), xs.max() + 1

alpha = np.where(bg, 0, 255).astype(np.uint8)
img = Image.fromarray(a.astype(np.uint8), 'RGB')
img.putalpha(Image.fromarray(alpha))
img = img.crop((left, top, right, bottom))

# Feather the cut so the outline keeps its anti-aliasing instead of showing a
# stair-stepped edge once the art is scaled down.
r, g, b, al = img.split()
img = Image.merge('RGBA', (r, g, b, al.filter(ImageFilter.GaussianBlur(0.6))))

w, h = img.size
scale = MAX_PX / max(w, h)
if scale < 1:
    img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

img.save(DST, 'WEBP', quality=92, method=6)
print(f'{DST}: {img.size[0]}x{img.size[1]} (from {W}x{H})')
