#!/usr/bin/env python3
"""Turn an AI-generated animal picture into a game-ready transparent asset.

Removes a plain (solid-ish) background by flood-filling from the image border
— so a same-coloured area *enclosed* by the character (e.g. a teal belly mark)
is kept — feathers the edge, trims empty margins, downscales, and writes a
transparent PNG or WebP named after the item id.

Usage:
    python3 scripts/cutout-bg.py INPUT OUTPUT [--tol 42] [--max 400]

    INPUT   any image (jpg/png/webp). Plain background, or already transparent.
    OUTPUT  target path; extension decides format (.webp recommended, .png ok).

Examples:
    python3 scripts/cutout-bg.py ~/downloads/dog.jpg public/assets/items/dog.webp
    python3 scripts/cutout-bg.py panda.png public/assets/items/panda.webp --tol 55

Then set the item's `ext` in src/engine/ui/items.ts (e.g. ext: 'webp').

Requires: pip install Pillow numpy
"""
import argparse
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def flood_remove(im: Image.Image, tol: float) -> Image.Image:
    """Return RGBA with the border-connected background made transparent."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    arr = np.asarray(rgb).astype(np.int16)
    corners = [arr[0, 0], arr[0, w - 1], arr[h - 1, 0], arr[h - 1, w - 1]]
    bg = np.mean(corners, axis=0)
    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    is_bgish = dist < tol

    alpha = np.full((h, w), 255, dtype=np.uint8)
    visited = np.zeros((h, w), dtype=bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bgish[y, x] and not visited[y, x]:
                visited[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_bgish[y, x] and not visited[y, x]:
                visited[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        alpha[y, x] = 0
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bgish[ny, nx]:
                visited[ny, nx] = True; dq.append((ny, nx))

    soft = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6))
    return Image.fromarray(np.dstack([np.asarray(rgb), np.asarray(soft)]).astype(np.uint8), 'RGBA')


def already_transparent(im: Image.Image) -> bool:
    if im.mode not in ('RGBA', 'LA'):
        return False
    a = np.asarray(im.convert('RGBA'))[:, :, 3]
    return bool((a == 0).mean() > 0.02)  # >2% fully transparent -> keep as-is


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('output')
    ap.add_argument('--tol', type=float, default=42, help='background colour tolerance')
    ap.add_argument('--max', type=int, default=400, help='max output dimension (px)')
    ap.add_argument('--quality', type=int, default=88, help='webp quality')
    args = ap.parse_args()

    im = Image.open(args.input)
    if already_transparent(im):
        print('input already has transparency — keeping alpha, skipping removal')
        res = im.convert('RGBA')
    else:
        res = flood_remove(im, args.tol)

    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
    res.thumbnail((args.max, args.max), Image.LANCZOS)

    if args.output.lower().endswith('.webp'):
        res.save(args.output, 'WEBP', quality=args.quality, method=6)
    else:
        res.save(args.output)
    print(f'saved {args.output}  {res.size}')


if __name__ == '__main__':
    main()
