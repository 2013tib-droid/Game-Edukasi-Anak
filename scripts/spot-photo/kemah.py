"""Tempelan perbedaan untuk lukisan Mata Jeli "kemah" (spot-diff `photo`).

    python3 scripts/spot-photo/kemah.py <foto 1200x800.png> public/assets/spot/kemah

Gambar sumber = kiriman pemilik (Gemini 2000x1342), dipotong ke 3:2
(2000x1333, buang 4 px atas) lalu diperkecil ke 1200x800 = foto.webp.
Satuan koordinat = gambar 150x100 (8 px per satuan), sama dengan
`SPOT_PHOTOS.kemah` di src/engine/core/spotDiff.ts — kotak di sana harus
sama dengan berkas yang dihasilkan (dicetak ke edits.json).

LIHAT tiap tempelan di atas foto sebelum dipasang (lihat CLAUDE.md).
"""
import json, sys, colorsys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

U = 8
base = Image.open(sys.argv[1]).convert('RGB')
A = np.asarray(base).astype(np.float32) / 255
H, W, _ = A.shape
r, g, b = A[..., 0], A[..., 1], A[..., 2]
mx = A.max(2); mn = A.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
d = mx - mn + 1e-9
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60


def box(x0, y0, x1, y1):
    return slice(int(y0 * U), int(y1 * U)), slice(int(x0 * U), int(x1 * U))


def huein(h, lo, hi):
    return (h >= lo) & (h <= hi) if lo <= hi else (h >= lo) | (h <= hi)


def feather(m, rad=1.2):
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(rad))
    return np.asarray(im).astype(np.float32) / 255


def dilate(m, n):
    if n <= 0:
        return m
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * n + 1))
    return np.asarray(im) > 127


def poly(pts):
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).polygon([(x * U, y * U) for x, y in pts], fill=255)
    return np.asarray(im) > 127


def ellipse(x0, y0, x1, y1):
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).ellipse((x0 * U, y0 * U, x1 * U, y1 * U), fill=255)
    return np.asarray(im) > 127


def rot_hue(px, deg, satk=1.0):
    flat = px.reshape(-1, 3)
    o = np.empty_like(flat)
    for i, (R, G, B) in enumerate(flat):
        h, l, s = colorsys.rgb_to_hls(R, G, B)
        o[i] = colorsys.hls_to_rgb((h + deg / 360) % 1, l, min(1, s * satk))
    return o.reshape(px.shape)


def lin_init(sub, mm):
    """Fill masked pixels by linear interpolation between the nearest
    unmasked pixels along the row AND the column (averaged) — a good start so
    the Jacobi relaxation converges instead of leaving a flat blob."""
    out = sub.copy()
    acc = np.zeros_like(sub); cnt = np.zeros(sub.shape[:2])
    for axis in (0, 1):
        S = sub if axis == 1 else sub.transpose(1, 0, 2)
        M = mm if axis == 1 else mm.T
        R = np.zeros_like(S); C = np.zeros(M.shape)
        for i in range(M.shape[0]):
            row = M[i]
            if not row.any():
                continue
            known = np.where(~row)[0]
            if len(known) < 2:
                continue
            for c in range(3):
                R[i, :, c] = np.interp(np.arange(len(row)), known, S[i, known, c])
            C[i] = row
        if axis == 0:
            R = R.transpose(1, 0, 2); C = C.T
        acc += R * C[..., None]; cnt += C
    fill = acc / np.maximum(cnt, 1)[..., None]
    out[mm] = fill[mm]
    return out


def inpaint(sl, m, it=1500, img=None):
    img = A if img is None else img
    ys, xs = sl
    y0 = max(ys.start - 4, 0); y1 = min(ys.stop + 4, H)
    x0 = max(xs.start - 4, 0); x1 = min(xs.stop + 4, W)
    sub = img[y0:y1, x0:x1].copy()
    mm = np.zeros(sub.shape[:2], bool)
    mm[ys.start - y0:ys.stop - y0, xs.start - x0:xs.stop - x0] = m
    sub = lin_init(sub, mm)
    for _ in range(it):
        avg = (np.roll(sub, 1, 0) + np.roll(sub, -1, 0) + np.roll(sub, 1, 1) + np.roll(sub, -1, 1)) / 4
        sub[mm] = avg[mm]
    return sub[ys.start - y0:ys.stop - y0, xs.start - x0:xs.stop - x0]


out = []


def save(name, x0, y0, x1, y1, rgb, alpha):
    rgba = np.dstack([rgb, alpha])
    im = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), 'RGBA')
    im.save(f'{sys.argv[2]}/{name}.webp', quality=90, method=6)
    out.append(dict(file=name, x=round(x0, 3), y=round(y0, 3), w=round(x1 - x0, 3), h=round(y1 - y0, 3)))


def warna(name, bx, lo, hi, deg, minsat=0.3, satk=1.0, keep=None, minval=0.25):
    sl = box(*bx)
    m = huein(hue[sl], lo, hi) & (sat[sl] > minsat) & (mx[sl] > minval)
    k = keep[sl] if keep is not None else True
    m = dilate(m & k, 1) & (sat[sl] > minsat * 0.6) & k
    save(name, *bx, rot_hue(A[sl], deg, satk), feather(m, 0.8))


def shifted(dx, dy):
    S = np.roll(A, (-int(round(dy * U)), -int(round(dx * U))), (0, 1))
    return S


def hilang(name, bx, obj, grow=2, src=None):
    """src=(dx,dy): CLONE grass/water texture from a nearby patch, blended
    seamlessly (difference at the border is interpolated inward). Without
    src: smooth fill (fine for flat sky)."""
    sl = box(*bx)
    m0 = obj(sl) if callable(obj) else obj[sl]
    m = dilate(m0, grow)
    big = dilate(m, 2)
    if src is None:
        fill = inpaint(sl, big)
    elif src[0] == 'flat':
        # flat colour = median of a clean reference box (the art is flat-shaded)
        ref = A[box(*src[1])].reshape(-1, 3)
        fill = np.broadcast_to(np.median(ref, 0), A[sl].shape).copy()
    else:
        # plain clone from a clean patch, mean colour matched to the ring
        S = shifted(*src)[sl]
        ring = dilate(big, 3) & ~big
        fill = S + (A[sl][ring].mean(0) - S[big].mean(0))
    save(name, *bx, fill, feather(m, 1.2))


def salin(name, bx, obj, tx, ty):
    sl = box(*bx)
    m = feather(dilate(obj(sl), 1), 0.8)
    x0, y0, x1, y1 = bx
    save(name, tx, ty, tx + x1 - x0, ty + y1 - y0, A[sl], m)


def notsky(sl):
    h = hue[sl]; s = sat[sl]; v = mx[sl]
    return ~((huein(h, 185, 220) & (v > 0.75)) | ((s < 0.12) & (v > 0.85)))


def notwater(sl):
    h = hue[sl]; s = sat[sl]; v = mx[sl]
    return ~((huein(h, 180, 215) & (v > 0.6)) | ((s < 0.15) & (v > 0.85)))


def white(sl):
    return (sat[sl] < 0.1) & (mx[sl] > 0.88)


TENT = poly([(27.3, 32.3), (51.6, 30.3), (66.6, 59.4), (13.6, 58.8)]) & ~ellipse(33.2, 45.6, 35.4, 48)
warna('tenda-biru', (14, 30, 66.5, 59.5), 36, 56, 165, 0.55, 0.85, TENT, 0.66)
warna('tenda-merah', (14, 30, 66.5, 59.5), 36, 56, -38, 0.55, 1.0, TENT, 0.66)
warna('tas-hijau', (7, 66.5, 24.5, 86.5), 20, 48, 95, 0.25)
warna('botol-merah', (24.5, 73.5, 31.8, 84), 175, 225, 170, 0.15, 1.6)
warna('pisang-hijau', (31.5, 71.5, 41.5, 79.5), 42, 62, 45, 0.4)
warna('kupu1-kuning', (54.5, 25, 61, 30.5), 280, 360, 60, 0.25)
warna('kupu2-hijau', (109.5, 46.5, 117.5, 52.5), 240, 300, -150, 0.15)
warna('bunga1-biru', (1, 81.5, 9.5, 88.5), 300, 360, -120, 0.3)
warna('bunga2-kuning', (137.5, 80.5, 145.5, 88), 340, 20, 48, 0.4)
warna('bunga3-biru', (127.5, 50.5, 133.5, 56.5), 340, 20, -160, 0.4)
hilang('senter-hilang', (20.8, 83.6, 34, 90.6), ellipse(21.2, 84, 33.6, 90), 1, ('flat', (23, 90, 31, 91.5)))
hilang('kelinci-hilang', (113, 50.3, 127, 64), ellipse(114, 51, 126, 63.3), 1)
hilang('burung-hilang', (113, 4.5, 119, 8), notsky)
hilang('ikan2-hilang', (99.5, 87.6, 108.6, 95), ellipse(100.2, 89.8, 106.4, 94.4) | ellipse(104.4, 88.1, 108, 91.9), 1)
hilang('awan-hilang', (95.5, 3, 113, 9.5), white, 2)
hilang('ikan1-hilang', (127.5, 70.8, 135, 76), ellipse(127.9, 71.2, 134.6, 75.6), 1, ('flat', (129, 76.2, 133, 77.2)))
salin('kupu-salin', (54.5, 25, 61, 30.5), notsky, 81, 25.5)
salin('ikan-salin', (100, 89.5, 108.5, 94), notwater, 81, 88)
json.dump(out, open(f'{sys.argv[2]}/edits.json', 'w'), indent=1)
print(len(out))
