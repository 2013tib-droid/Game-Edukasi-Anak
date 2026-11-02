"""Alat bersama pembuat tempelan lukisan Mata Jeli (spot-diff `photo`).

Dipakai skrip per lukisan (sekolah.py, pasar.py, pantai.py, sawah.py);
kemah.py sengaja dibiarkan berdiri sendiri (tempelannya sudah dilihat dan
dipasang). Satuan = gambar 150x100, 8 px per satuan (foto 1200x800).

    from lib import Photo
    P = Photo(sys.argv[1], sys.argv[2])
    P.warna(...); P.hilang(...); P.salin(...)
    P.done()   # menulis edits.json

LIHAT tiap tempelan di atas foto sebelum dipasang (lihat CLAUDE.md).
"""
import json, colorsys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

U = 8


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


def rot_hue(px, deg, satk=1.0, lk=1.0):
    flat = px.reshape(-1, 3)
    o = np.empty_like(flat)
    for i, (R, G, B) in enumerate(flat):
        h, l, s = colorsys.rgb_to_hls(R, G, B)
        o[i] = colorsys.hls_to_rgb((h + deg / 360) % 1, min(1, l * lk), min(1, s * satk))
    return o.reshape(px.shape)


def lin_init(sub, mm):
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
    out = sub.copy()
    fill = acc / np.maximum(cnt, 1)[..., None]
    out[mm] = fill[mm]
    return out


class Photo:
    def __init__(self, src, outdir):
        self.outdir = outdir
        self.A = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
        A = self.A
        self.H, self.W, _ = A.shape
        r, g, b = A[..., 0], A[..., 1], A[..., 2]
        self.mx = A.max(2); mn = A.min(2)
        self.sat = np.where(self.mx > 0, (self.mx - mn) / np.maximum(self.mx, 1e-6), 0)
        d = self.mx - mn + 1e-9
        self.hue = np.where(self.mx == r, ((g - b) / d) % 6,
                            np.where(self.mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
        self.out = []

    # ── bentuk ───────────────────────────────────────────────────────
    def box(self, x0, y0, x1, y1):
        return slice(int(y0 * U), int(y1 * U)), slice(int(x0 * U), int(x1 * U))

    def poly(self, pts):
        im = Image.new('L', (self.W, self.H), 0)
        ImageDraw.Draw(im).polygon([(x * U, y * U) for x, y in pts], fill=255)
        return np.asarray(im) > 127

    def ellipse(self, x0, y0, x1, y1):
        im = Image.new('L', (self.W, self.H), 0)
        ImageDraw.Draw(im).ellipse((x0 * U, y0 * U, x1 * U, y1 * U), fill=255)
        return np.asarray(im) > 127

    def color(self, sl, lo, hi, minsat=0.3, minval=0.25):
        return huein(self.hue[sl], lo, hi) & (self.sat[sl] > minsat) & (self.mx[sl] > minval)

    # ── isi ──────────────────────────────────────────────────────────
    def inpaint(self, sl, m, it=1500):
        A = self.A; H, W = self.H, self.W
        ys, xs = sl
        y0 = max(ys.start - 4, 0); y1 = min(ys.stop + 4, H)
        x0 = max(xs.start - 4, 0); x1 = min(xs.stop + 4, W)
        sub = A[y0:y1, x0:x1].copy()
        mm = np.zeros(sub.shape[:2], bool)
        mm[ys.start - y0:ys.stop - y0, xs.start - x0:xs.stop - x0] = m
        sub = lin_init(sub, mm)
        for _ in range(it):
            avg = (np.roll(sub, 1, 0) + np.roll(sub, -1, 0) + np.roll(sub, 1, 1) + np.roll(sub, -1, 1)) / 4
            sub[mm] = avg[mm]
        return sub[ys.start - y0:ys.stop - y0, xs.start - x0:xs.stop - x0]

    def save(self, name, x0, y0, x1, y1, rgb, alpha):
        rgba = np.dstack([rgb, alpha])
        im = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), 'RGBA')
        im.save(f'{self.outdir}/{name}.webp', quality=90, method=6)
        self.out.append(dict(file=name, x=round(x0, 3), y=round(y0, 3), w=round(x1 - x0, 3), h=round(y1 - y0, 3)))

    # ── tiga jenis tempelan ──────────────────────────────────────────
    def warna(self, name, bx, lo, hi, deg, minsat=0.3, satk=1.0, keep=None, minval=0.25, lk=1.0, grow=1):
        """Putar hue bagian berwarna lo..hi di dalam kotak (dan `keep`)."""
        sl = self.box(*bx)
        m = self.color(sl, lo, hi, minsat, minval)
        k = keep[sl] if keep is not None else True
        m = dilate(m & k, grow) & (self.sat[sl] > minsat * 0.6) & k
        self.save(name, *bx, rot_hue(self.A[sl], deg, satk, lk), feather(m, 0.8))

    def warnai(self, name, bx, hue, sk, keep, maxsat=0.15, vmin=0.3, vmax=0.95):
        """Beri warna bagian yang ABU-ABU (warna tak bisa diputar):
        hue tujuan (derajat), kejenuhan HLS `sk`."""
        sl = self.box(*bx)
        m = (self.sat[sl] < maxsat) & (self.mx[sl] > vmin) & (self.mx[sl] < vmax) & keep[sl]
        px = self.A[sl]
        flat = px.reshape(-1, 3)
        o = np.empty_like(flat)
        for i, (R, G, B) in enumerate(flat):
            h, l, s = colorsys.rgb_to_hls(R, G, B)
            o[i] = colorsys.hls_to_rgb(hue / 360, l, sk)
        self.save(name, *bx, o.reshape(px.shape), feather(dilate(m, 1) & keep[sl] & (self.sat[sl] < maxsat * 2), 0.8))

    def hilang(self, name, bx, obj, grow=2, src=None, keep=None):
        """Hapus benda. src=None: isi halus (langit, rumput rata);
        src=('flat', kotak): warna rata = median kotak rujukan;
        src=(dx, dy): klon tekstur dari geseran (dx, dy) satuan."""
        A = self.A
        sl = self.box(*bx)
        m0 = obj(sl) if callable(obj) else obj[sl]
        m = dilate(m0, grow)
        big = dilate(m, 2)
        if keep is not None:
            m = m & keep[sl]; big = big & keep[sl]
        if src is None:
            fill = self.inpaint(sl, big)
        elif src == 'rows':
            # tiap baris diisi garis lurus antara tepi kiri & kanan topeng
            # (dicari sampai 3 satuan di luar kotak): cakrawala, langit
            # bergradasi tegak, & gelombang mendatar tetap lurus
            ys, xs = sl
            pad = 3 * U
            x0 = max(xs.start - pad, 0); x1 = min(xs.stop + pad, self.W)
            fill = A[sl].copy()
            for r in range(fill.shape[0]):
                full = A[ys.start + r, x0:x1]
                row = np.zeros(x1 - x0, bool)
                row[xs.start - x0:xs.stop - x0] = big[r]
                if not row.any():
                    continue
                known = np.where(~row)[0]
                for c in range(3):
                    fill[r, :, c] = np.interp(np.arange(x1 - x0), known, full[known, c])[xs.start - x0:xs.stop - x0]
        elif src[0] == 'flat':
            ref = A[self.box(*src[1])].reshape(-1, 3)
            fill = np.broadcast_to(np.median(ref, 0), A[sl].shape).copy()
        else:
            S = np.roll(A, (-int(round(src[1] * U)), -int(round(src[0] * U))), (0, 1))[sl]
            ring = dilate(big, 3) & ~big
            fill = S + (A[sl][ring].mean(0) - S[big].mean(0)) if ring.any() else S.copy()
        self.save(name, *bx, fill, feather(m, 1.2))

    def salin(self, name, bx, obj, tx, ty):
        """Salin benda (tanpa latarnya) ke kotak bertitik kiri-atas (tx, ty)."""
        sl = self.box(*bx)
        m = feather(dilate(obj(sl) if callable(obj) else obj[sl], 1), 0.8)
        x0, y0, x1, y1 = bx
        self.save(name, tx, ty, tx + x1 - x0, ty + y1 - y0, self.A[sl], m)

    # ── penyaring umum ───────────────────────────────────────────────
    def notsky(self, sl):
        h = self.hue[sl]; s = self.sat[sl]; v = self.mx[sl]
        return ~((huein(h, 185, 220) & (v > 0.75)) | ((s < 0.12) & (v > 0.85)))

    def white(self, sl):
        return (self.sat[sl] < 0.1) & (self.mx[sl] > 0.88)

    def notgrass(self, sl):
        h = self.hue[sl]; s = self.sat[sl]
        return ~(huein(h, 65, 110) & (s > 0.35))

    def done(self):
        json.dump(self.out, open(f'{self.outdir}/edits.json', 'w'), indent=1)
        print(len(self.out), 'tempelan')
