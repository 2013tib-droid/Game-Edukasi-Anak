"""Siapkan ILUSTRASI ADEGAN cerita (gambar kiriman pemilik yang SUDAH punya
latar sendiri) jadi WebP siap pakai di `public/assets/story/`.

    pip install pillow
    python3 scripts/story-art.py <art.png> public/assets/story/<id>.webp [max_px]

Bedanya dengan `cut-item.py` / `cut-item-sheet.py`: yang itu MEMOTONG latar
supaya itemnya transparan dan bisa ditaruh di papan soal mana pun. Ilustrasi
adegan justru dipakai utuh berikut latarnya — jadi di sini tidak ada
flood-fill sama sekali, cuma diperkecil & dikompres.

Lebar bawaan 900px: di layar gambarnya paling lebar ±340px CSS, jadi 900px
sudah cukup tajam untuk layar 2–3× tanpa membuat filenya berat (anak main di
HP Android kelas bawah — lihat CLAUDE.md).
"""

import sys
from PIL import Image


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    src, dst = sys.argv[1], sys.argv[2]
    max_px = int(sys.argv[3]) if len(sys.argv) > 3 else 900

    im = Image.open(src).convert("RGB")
    if im.width > max_px:
        h = round(im.height * max_px / im.width)
        im = im.resize((max_px, h), Image.LANCZOS)
    im.save(dst, "WEBP", quality=80, method=6)
    print(f"{dst}: {im.width}x{im.height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
