"""Potong LEMBAR enam wajah anak ayam (Wajah Perasaan) jadi enam WebP transparan.

    python3 scripts/cut-feel-sheet.py <lembar.png> public/assets/feel [tinggi=420]

Lembarnya 3 × 2 (biasa, senang, sedih / marah, takut, kaget), latar KREM
nyaris putih + bayangan lantai lembut + pil nama di bawah tiap gambar. Tak ada
pemotong lama yang cocok: anak ayamnya sendiri kuning hangat, jadi aturan
"hangat = latar" milik cut-beige.py akan memakannya. Di sini latar = piksel
TERANG yang birunya tinggi (krem & bayangan), ditelusuri dari tepi sel saja —
putih mata & awan uap yang terkurung garis tetap utuh. Pil nama dibuang dengan
memotong sel di atasnya. `biasa` hanya menyimpan badan (tanda seru di
sampingnya dibuang: wajah biasa tak boleh terbaca kesal).
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
size = int(sys.argv[3]) if len(sys.argv) > 3 else 420
NAMES = [['biasa', 'senang', 'sedih'], ['marah', 'takut', 'kaget']]
sheet = Image.open(src).convert('RGB')
W, H = sheet.size
cw = W // 3
ROWS = [(0, int(H * 0.418)), (int(H * 0.5), int(H * 0.91))]

def flood(mask, seeds):
    h, w = mask.shape
    seen = np.zeros_like(mask)
    q = deque(seeds)
    for y, x in seeds: seen[y, x] = True
    while q:
        y, x = q.popleft()
        for yy, xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = True; q.append((yy, xx))
    return seen

for ri, (y0, y1) in enumerate(ROWS):
    for ci in range(3):
        name = NAMES[ri][ci]
        # Awan uap `marah` melewati batas kolomnya — sel itu dilebarkan.
        x0, x1 = {'marah': (0, int(W * 0.35)), 'takut': (int(W * 0.36), 2 * cw)}.get(name, (ci * cw, (ci + 1) * cw))
        cell = sheet.crop((x0, y0, x1, y1))
        a = np.asarray(cell).astype(int)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        h, w = r.shape
        mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
        bgish = (b > 168) & (mx - mn < 62) & (r > 200) & (b <= r - 2)
        seeds = [(y, x) for y in range(h) for x in (0, w - 1) if bgish[y, x]] + [(y, x) for x in range(w) for y in (0, h - 1) if bgish[y, x]]
        bg = flood(bgish, seeds)
        fg = ~bg
        if name == 'biasa':
            # simpan komponen terbesar saja (badan)
            best = None; left = fg.copy()
            ys, xs = np.nonzero(left)
            while len(ys):
                comp = flood(left, [(ys[0], xs[0])])
                if best is None or comp.sum() > best.sum(): best = comp
                left &= ~comp; ys, xs = np.nonzero(left)
            fg = best
        alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
        rgba = cell.convert('RGBA'); rgba.putalpha(alpha)
        box = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
        rgba = rgba.crop(box)
        k = size / max(rgba.size)
        rgba = rgba.resize((round(rgba.width * k), round(rgba.height * k)), Image.LANCZOS)
        rgba.save(f'{out}/{name}.webp', quality=90, method=6)
        print(name, rgba.size)
