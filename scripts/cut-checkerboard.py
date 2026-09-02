"""Cut ONE piece of AI-generated art whose "transparent" background is really a
PAINTED grey/white checkerboard into a genuinely transparent WebP.

    pip install pillow numpy
    python scripts/cut-checkerboard.py <art.jpg> public/assets/<id>.webp [max_px]

Use this for art that arrives from an image generator (Gemini/ChatGPT) showing
the familiar checkerboard: the file is a JPEG, so the checker is baked into the
pixels and there is no alpha channel at all. For owner art photographed on
white paper use `cut-item.py` instead — its flood fill has a tight neighbour
tolerance (8) that a checkerboard's 227→255 steps would stop dead.

How it works, and the four traps:

  * The checker tones are READ OFF the frame edge, not hard-coded: generators
    hand out light checkers (~203/255) and dark ones (~78/108) depending on the
    prompt, and a fixed "background is light" test silently keeps the whole dark
    checker as artwork. Background is every colourless pixel BETWEEN the frame's
    dominant tones (plus `TONE_TOL` either side) — one band, because JPEG smears
    each square boundary into the values in between and a band per tone leaves
    that grid opaque, as a mesh over the finished card.
  * The single band makes both checker tones background at once, so the fill
    crosses square boundaries freely. It then walks in from the frame edge, which is why
    background enclosed by the artwork stays opaque — and why a near-white area
    INSIDE the drawing (a watermelon rind, a lion's cream belly) survives.
  * A hole THROUGH the drawing (a palette's thumb hole) is background the edge
    fill can never reach, so it survives as a patch of visible checker. Enclosed
    light regions are therefore re-checked: those carrying BOTH checker tones
    are cut, anything else is kept as artwork. "Carries both tones" means the
    region is BIMODAL on them, not merely spread across them — a lion's mane
    highlight fading into its shading spans the same range and must survive.
  * JPEG ringing leaves a grey halo hugging the black outline. `-erode` on the
    kept region would gnaw the outline itself, so instead the alpha is feathered
    one pixel. Always eyeball the result on a coloured background before
    shipping it.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1]
DST = sys.argv[2]
MAX_PX = int(sys.argv[3]) if len(sys.argv) > 3 else 512

# How far a pixel may drift from a checker tone (JPEG blur near the squares'
# own edges) and still count as background.
TONE_TOL = 16
# Saturation above this is paint, never checker — the checker is pure grey.
SAT_MAX = 24
# A tone must cover this much of the frame to be trusted as a checker tone;
# below it, we would be sampling artwork that happens to touch the edge.
TONE_SHARE = 0.05

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
H, W, _ = a.shape

lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)

frame = np.concatenate([lum[0], lum[-1], lum[:, 0], lum[:, -1]])
frame_sat = np.concatenate([sat[0], sat[-1], sat[:, 0], sat[:, -1]])
grey = frame[frame_sat <= SAT_MAX]
if grey.size == 0:
    sys.exit(f'{SRC}: no colourless pixels on the frame — is the background '
             'really a checkerboard?')
counts = np.bincount(grey, minlength=256)
tones = np.where(counts >= TONE_SHARE * frame.size)[0]

# One band spanning BOTH tones, not a band per tone: JPEG smears the border
# between two squares into every value in between (203|255 leaves a grid of
# ~225 pixels). Per-tone bands leave that grid opaque, and the leftover mesh
# is very visible once the art sits on a coloured card.
lo = max(0, int(tones.min()) - TONE_TOL)
hi = min(255, int(tones.max()) + TONE_TOL)
light = (lum >= lo) & (lum <= hi) & (sat <= SAT_MAX)
print(f'{SRC}: checker tones {tones.min()}-{tones.max()}, background band {lo}-{hi}')

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

# Checker the fill cannot reach: a hole THROUGH the artwork (the thumb hole of
# a paint palette, the gap inside a handle). It has to go too — it is background
# seen through the drawing — but a flat light area that merely belongs to the
# drawing (a lion's cream belly) must stay. What tells them apart is that real
# checker carries BOTH tones, while painted areas are one flat tone.
spread = int(tones.max()) - int(tones.min())
if spread >= 2 * TONE_TOL:
    seen = bg.copy()
    for sy in range(H):
        for sx in range(W):
            if seen[sy, sx] or not light[sy, sx]:
                continue
            comp = [(sy, sx)]
            seen[sy, sx] = True
            q = deque(comp)
            while q:
                y, x = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and light[ny, nx]:
                        seen[ny, nx] = True
                        comp.append((ny, nx))
                        q.append((ny, nx))
            if len(comp) < 64:
                continue
            vals = lum[tuple(np.array(comp).T)]
            # Checker is BIMODAL: almost every pixel sits on one of the two
            # tones, and both are well represented. A "lum spread" test alone is
            # far too loose — a lion's white mane highlight fading into its own
            # shading spans the same range and would be punched out.
            near_lo = float(np.mean(np.abs(vals - int(tones.min())) <= TONE_TOL))
            near_hi = float(np.mean(np.abs(vals - int(tones.max())) <= TONE_TOL))
            if near_lo >= 0.25 and near_hi >= 0.25 and near_lo + near_hi >= 0.85:
                for y, x in comp:
                    bg[y, x] = True

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
