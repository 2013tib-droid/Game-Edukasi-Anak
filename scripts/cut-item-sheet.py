"""Cut a labelled art sheet into transparent per-item WebP files.

Written for the "benda sehari-hari" sheet (batch 4): a 5x4 grid of cartoon
objects on white paper, each with an English caption underneath. Keep it as
the starting point for the next batch — adjust NAMES, ART_ROWS and HOLES.

    pip install pillow numpy scipy
    python3 scripts/cut-item-sheet.py <sheet.png> <out-dir>

Two things that are easy to get wrong, both learned the hard way:

  * The flood fill walks from the paper inwards over "light and colourless"
    pixels, with a small neighbour tolerance (8). Raising it eats artwork that
    is itself nearly white — at 14 the egg lost its body, because the step
    from paper to eggshell is only 14 levels.
  * Background the fill cannot reach (the gap between a chair's back and its
    seat, the eye of a key) is punched separately via HOLES, per item and by
    hand. No automatic rule can do this safely: a football's white patches
    look exactly like enclosed paper.

Always eyeball the result on a coloured background before shipping it.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image
from scipy import ndimage

# Items whose artwork encloses background the flood fill cannot reach, and how
# many such holes to punch (biggest first).
HOLES = {'chair': 1, 'key': 1}

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'

# Item ids, laid out exactly like the sheet. `teddy` is deliberately not
# `bear`: `bear` is the real animal in Hutan Hewan.
NAMES = [
    ['ball', 'book', 'pencil', 'backpack', 'key'],
    ['umbrella', 'shoe', 'chair', 'door', 'milk'],
    ['egg', 'bread', 'rice', 'balloon', 'teddy'],
    ['flower', 'moon', 'cloud', 'carrot', 'corn'],
]

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(np.int16)
H, W, _ = a.shape

lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
# "ink" = anything that is clearly not paper/shadow
ink = (lum < 235) | (sat > 18)

# --- grid: find blank columns / rows to split cells -------------------------
def bands(mask_1d, min_run):
    """Return (start, end) runs of True longer than min_run."""
    runs, s = [], None
    for i, v in enumerate(list(mask_1d) + [False]):
        if v and s is None:
            s = i
        elif not v and s is not None:
            if i - s >= min_run:
                runs.append((s, i))
            s = None
    return runs

col_has = ink.any(axis=0)
row_has = ink.any(axis=1)
col_runs = bands(col_has, 20)
row_runs = bands(row_has, 20)
print('col runs', col_runs)
print('row runs', row_runs)


def is_bg_flood(cell):
    """Alpha mask via flood fill from the border over light, desaturated pixels."""
    h, w, _ = cell.shape
    cl = cell.max(axis=2)
    cs = cell.max(axis=2) - cell.min(axis=2)
    light = (cl >= 196) & (cs <= 30)
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        base = cell[y, x]
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx] and light[ny, nx]:
                if int(np.abs(cell[ny, nx] - base).max()) <= 8:
                    bg[ny, nx] = True
                    q.append((ny, nx))
    return bg


# Artwork bands per row, chosen to sit above each row's English label
# (labels live at y ≈ 260-290, 543-566, 806-830, 1071-1095).
ART_ROWS = [(0, 258), (300, 540), (575, 804), (840, 1068)]

made = []
for ri, (y0, y1) in enumerate(ART_ROWS):
    for ci, (x0, x1) in enumerate(col_runs):
        name = NAMES[ri][ci]
        cx0, cx1 = max(0, x0 - 8), min(W, x1 + 8)
        cell = a[y0:y1, cx0:cx1]
        bg = is_bg_flood(cell)
        # Enclosed background: the gap between a chair's back and seat, the eye
        # of the key. Flood fill can't reach these, so punch the N biggest
        # near-white enclosed blobs. Only for items that need it — a football's
        # white patches look exactly the same to any automatic rule.
        for _ in range(HOLES.get(name, 0)):
            crgb = cell
            clum = crgb.max(axis=2)
            csat = crgb.max(axis=2) - crgb.min(axis=2)
            cand = (~bg) & (clum >= 248) & (csat <= 6)
            lab, k = ndimage.label(cand)
            if k:
                sizes = ndimage.sum(cand, lab, range(1, k + 1))
                bg |= lab == (int(np.argmax(sizes)) + 1)
        # tight bbox of the artwork
        keep = ~bg
        ys, xs = np.where(keep)
        by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        art = cell[by0:by1, bx0:bx1]
        alpha = (~bg[by0:by1, bx0:bx1]).astype(np.uint8) * 255
        rgba = np.dstack([art.astype(np.uint8), alpha])
        img = Image.fromarray(rgba, 'RGBA')
        img.save(f'{OUT}/{name}.webp', 'WEBP', quality=92, method=6)
        made.append((name, img.size))

for n, s in made:
    print(n, s)
