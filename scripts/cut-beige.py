"""Cut 3D-render art off a WARM BEIGE background (with a soft floor shadow).

    pip install pillow numpy
    python3 scripts/cut-beige.py <art.jpg> public/assets/games/<id>.webp 320 [--shadow]

Gemini sometimes ignores "latar putih" and renders on beige paper with a drop
shadow (Taman Labirin & Labirin Hujan icons, 2026-11-06). None of the other
cutters fit: the paper is not white (cut-item/cut-soft), and the shadow is not
the per-row gradient cut-gradient models.

Background = warm pixels (r >= g, g > b), flood-filled from the border only, so
the cream maze paths trapped inside the hedges stay. `--shadow` also eats the
grey-green floor shadow (low saturation, not dark); use it only when the art is
saturated — check the result on a dark colour before shipping.
Needs no scipy (not installable in Claude sessions).
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter
src, dst, maxpx = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB').resize((1000, 1000), Image.LANCZOS)
a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
H, W = r.shape
warm = (r - g >= -4) & (g - b >= 4) & (r > 90)
if '--shadow' in sys.argv:
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    warm |= (g - r <= 30) & (mx - mn <= 36) & (r > 85)

def label(mask):
    lab = np.zeros(mask.shape, np.int32); n = 0; sizes = [0]
    for y0 in range(H):
        for x0 in np.nonzero(mask[y0] & (lab[y0] == 0))[0]:
            if lab[y0, x0]: continue
            n += 1; q = deque([(y0, x0)]); lab[y0, x0] = n; c = 0
            while q:
                y, x = q.popleft(); c += 1
                for yy, xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                    if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx))
            sizes.append(c)
    return lab, sizes

lab, _ = label(warm)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fg = ~np.isin(lab, list(border))
lab2, sizes = label(fg)
keep = [i for i, s in enumerate(sizes) if i and s > 300]
print('fg comps kept', [sizes[i] for i in keep])
fg = np.isin(lab2, keep)
alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
out = im.convert('RGBA'); out.putalpha(alpha)
out = out.crop(out.getbbox())
w, h = out.size; s = maxpx / max(w, h)
out = out.resize((round(w * s), round(h * s)), Image.LANCZOS)
out.save(dst, 'WEBP', quality=88, method=6)
print(dst, out.size)
