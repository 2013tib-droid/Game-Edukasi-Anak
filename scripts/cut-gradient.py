"""Cut art out of a mockup/screenshot whose background is a smooth GRADIENT.

    pip install pillow numpy
    python3 scripts/cut-gradient.py <mockup.jpg> <out.webp> [options]

The owner sometimes sends new art already placed on a mock-up of the screen it
belongs to (the app's cream-to-pink gradient behind it), not on white paper.
`cut-item.py` is the wrong tool there: it looks for pixels that are "light and
colourless", and the pastel gradient is neither — it walks a few pixels in from
the paper and stops, leaving the whole screen attached to the art.

So the background is modelled per ROW instead: the outer columns of a mock-up
are always pure gradient, so their median is what this row's background looks
like. Everything within `--tol` of that, plus the soft white GLOW artists put
behind a subject (as bright as the paper but visibly less saturated, see
`--dsat`), is background — and, as in every cutter here, only the part of it
the flood fill can REACH from the border is removed.

  * Background the fill cannot reach stays opaque on purpose. Run
    `--list-holes` to print those trapped blobs with their sizes and boxes,
    then punch the ones that are real holes with `--hole=x,y` — one seed point
    per hole, PER IMAGE. Never punch by size: on the trophy the BIGGEST
    trapped blob (2190 px) is a highlight painted on the cup, while the two
    handle holes are 1838 and 1942 px, so a threshold would have punched a
    window straight through the trophy.
  * Always paste the result on a strong colour at the size it is really shown
    before shipping it. Leftover paper reads as a pale blob and, on the pastel
    screens this art is made for, is invisible while you work.

Example (public/assets/ui/selamat.webp, the "Selamat!" trophy):

    python3 scripts/cut-gradient.py art.jpg public/assets/ui/selamat.webp \
        --crop-bottom=575 --max=320 --hole=430,260 --hole=734,317
"""
import sys
from collections import deque

import numpy as np
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(
    crop_bottom=0,
    max=320,
    tol=16,
    dsat=10,
)
holes: list[tuple[int, int]] = []
list_holes = False
for a in sys.argv[1:]:
    if not a.startswith('--'):
        continue
    if a == '--list-holes':
        list_holes = True
        continue
    key, _, val = a[2:].partition('=')
    key = key.replace('-', '_')
    if key == 'hole':
        x, y = val.split(',')
        holes.append((int(x), int(y)))
    elif key in opts:
        opts[key] = int(val)
    else:
        sys.exit(f'opsi tak dikenal: {a}')

if len(args) < (1 if list_holes else 2):
    sys.exit(__doc__)
SRC = args[0]
DST = args[1] if len(args) > 1 else None

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
if opts['crop_bottom']:
    a = a[: opts['crop_bottom']]
H, W, _ = a.shape

# This row's background, straight from the columns nothing is drawn in.
edge = np.concatenate([a[:, :8], a[:, -8:]], axis=1)
rowbg = np.median(edge, axis=1)
bglum = rowbg.max(axis=1)[:, None]
bgsat = (rowbg.max(axis=1) - rowbg.min(axis=1))[:, None]

lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
near = np.abs(a - rowbg[:, None, :]).max(axis=2) <= opts['tol']
glow = (
    (lum >= bglum - 2)
    & (sat <= bgsat - opts['dsat'])
    & np.all(a >= rowbg[:, None, :] - 6, axis=2)
)
paper = near | glow


def fill(seeds: list[tuple[int, int]]) -> np.ndarray:
    """Every `paper` pixel reachable from `seeds` (y, x)."""
    out = np.zeros((H, W), bool)
    q = deque()
    for y, x in seeds:
        if paper[y, x] and not out[y, x]:
            out[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and not out[ny, nx] and paper[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    return out


border = [(y, x) for y in (0, H - 1) for x in range(W)]
border += [(y, x) for x in (0, W - 1) for y in range(H)]
bg = fill(border)

trapped = paper & ~bg
if list_holes:
    label = np.zeros((H, W), np.int32)
    found = []
    n = 0
    for sy in range(H):
        for sx in range(W):
            if not trapped[sy, sx] or label[sy, sx]:
                continue
            n += 1
            label[sy, sx] = n
            q = deque([(sy, sx)])
            box = [sx, sy, sx, sy]
            count = 0
            while q:
                y, x = q.popleft()
                count += 1
                box = [min(box[0], x), min(box[1], y), max(box[2], x), max(box[3], y)]
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and trapped[ny, nx] and not label[ny, nx]:
                        label[ny, nx] = n
                        q.append((ny, nx))
            found.append((count, box, (sy, sx)))
    found.sort(reverse=True)
    print(f'{len(found)} bidang latar terkurung; 15 terbesar:')
    for count, box, (sy, sx) in found[:15]:
        cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
        print(f'  {count:6d} px  box={tuple(box)}  tengah=({cx},{cy})  contoh benih=({sx},{sy})')
    print('\nLihat dulu bidang mana yang benar-benar lubang, lalu --hole=x,y per lubang.')
    if not DST:
        sys.exit(0)

for x, y in holes:
    if not trapped[y, x]:
        sys.exit(f'--hole={x},{y} bukan latar terkurung (sudah terbuang, atau itu gambarnya)')
    patch = fill([(y, x)])
    print(f'lubang ({x},{y}): {int(patch.sum())} px ditembus')
    bg |= patch

keep = ~bg
ys, xs = np.where(keep)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
rgba = np.dstack(
    [a[y0:y1, x0:x1].astype(np.uint8), keep[y0:y1, x0:x1].astype(np.uint8) * 255]
)
img = Image.fromarray(rgba, 'RGBA')

scale = min(1.0, opts['max'] / max(img.size))
if scale < 1.0:
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
img.save(DST, 'WEBP', quality=92, method=6)
print(
    f'{DST}: {img.size[0]}x{img.size[1]} (rasio {img.width / img.height:.2f}), '
    f'latar terbuang {bg.mean() * 100:.1f}%'
)
