import type { ShapeId } from '@/engine/core/types';

/**
 * Satu sisi bangun ruang: warna dasar kartu yang digelapkan (`f` < 1) atau
 * dicerahkan (`f` > 1). Bangun ruang tetap punya SATU warna — itu yang
 * membuat soal "pola warna" tetap terbaca dengan kubus atau tabung — dan
 * beda terang antar sisi itulah yang membuatnya terlihat padat, bukan
 * sekadar segienam.
 */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(f <= 1 ? v * f : v + (255 - v) * (f - 1)),
  );
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * A geometric shape drawn as inline SVG in a given fill color. Ported from
 * shapeSVG() in petualangan-pintar.html — the Labirin Warna world needs every
 * shape×color combination and emoji simply don't cover them.
 *
 * Enam bentuk terakhir adalah **bangun ruang** (kubus, balok, bola, tabung,
 * kerucut, limas), digambar semu-3D dengan sisi gelap/terang dari warna yang
 * sama. Semuanya sengaja dibuat masih terbaca di sel deret **34 px** (lebar
 * terkecil `.ta-seq-shape` di HP kecil): limas berdasar lebar dengan rusuk
 * belakang yang terlihat, kerucut sengaja lebih ramping dan alasnya bulat —
 * kalau tidak, keduanya jadi segitiga yang sama di layar sekecil itu. Dua
 * pasang yang tetap tak boleh diadu sebagai jawaban lawan pengecoh
 * (kubus↔balok dan kerucut↔limas, plus bangun ruang lawan bangun datar yang
 * sesiluet) dijaga di config soal, lihat `src/games/sd1/pola-pintar.ts`.
 */
export default function Shape({
  kind,
  color,
  size = 70,
  className,
}: {
  kind: ShapeId;
  color: string;
  size?: number;
  /** Optional class so CSS can size the shape fluidly (e.g. fill an answer card). */
  className?: string;
}) {
  const p = { fill: color, stroke: 'rgba(0,0,0,.15)', strokeWidth: 3 };
  /** Sisi bangun ruang: warna kartu yang sama, digelapkan atau dicerahkan. */
  const sisi = (f: number) => ({ ...p, fill: shade(color, f) });
  return (
    <svg
      className={className}
      data-shape={kind}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
    >
      {kind === 'lingkaran' && <circle cx="50" cy="50" r="42" {...p} />}
      {kind === 'kotak' && <rect x="12" y="12" width="76" height="76" rx="10" {...p} />}
      {kind === 'segitiga' && <polygon points="50,10 92,88 8,88" {...p} />}
      {kind === 'bintang' && (
        <polygon
          points="50,6 61,38 95,38 68,58 78,92 50,71 22,92 32,58 5,38 39,38"
          {...p}
        />
      )}
      {kind === 'hati' && (
        <path
          d="M50 88 C20 62 8 44 14 28 C20 12 42 12 50 30 C58 12 80 12 86 28 C92 44 80 62 50 88 Z"
          {...p}
        />
      )}
      {kind === 'oval' && <ellipse cx="50" cy="50" rx="44" ry="30" {...p} />}
      {kind === 'ketupat' && <polygon points="50,8 92,50 50,92 8,50" {...p} />}
      {kind === 'persegi-panjang' && <rect x="6" y="26" width="88" height="48" rx="8" {...p} />}
      {kind === 'trapesium' && <polygon points="26,16 74,16 94,86 6,86" {...p} />}
      {kind === 'segilima' && <polygon points="50,6 94,38 77,90 23,90 6,38" {...p} />}
      {kind === 'segienam' && <polygon points="50,6 91,28 91,72 50,94 9,72 9,28" {...p} />}
      {kind === 'layang-layang' && <polygon points="50,4 88,40 50,96 12,40" {...p} />}
      {kind === 'bulan' && <path d="M68 10 A42 42 0 1 0 68 90 Q40 50 68 10 Z" {...p} />}
      {kind === 'awan' && (
        <path
          d="M25 75 A18 18 0 0 1 25 39 A22 22 0 0 1 58 27 A18 18 0 0 1 84 41 A18 18 0 0 1 78 75 Z"
          {...p}
        />
      )}
      {/* --- Bangun ruang: sisi kanan (gelap) dulu, lalu atas (terang), lalu
             muka depan, supaya rusuknya tertumpuk rapi. --- */}
      {kind === 'kubus' && (
        <>
          <polygon points="70,38 92,20 92,68 70,90" {...sisi(0.68)} />
          <polygon points="18,38 40,20 92,20 70,38" {...sisi(1.28)} />
          <rect x="18" y="38" width="52" height="52" {...p} />
        </>
      )}
      {kind === 'balok' && (
        <>
          <polygon points="76,46 94,28 94,64 76,82" {...sisi(0.68)} />
          <polygon points="10,46 28,28 94,28 76,46" {...sisi(1.28)} />
          <rect x="10" y="46" width="66" height="36" {...p} />
        </>
      )}
      {kind === 'bola' && (
        <>
          <circle cx="50" cy="50" r="42" {...p} />
          {/* Bulan sabit gelap + kilau: tanpa keduanya bola sama persis
              dengan lingkaran. */}
          <path d="M50,92 A42,42 0 0 0 92,50 Q74,74 50,92 Z" fill={shade(color, 0.68)} opacity=".85" />
          <ellipse cx="36" cy="33" rx="16" ry="10" fill={shade(color, 1.28)} transform="rotate(-32 36 33)" />
        </>
      )}
      {kind === 'tabung' && (
        <>
          <path d="M24,24 L24,74 A26,10 0 0 0 76,74 L76,24 Z" {...p} />
          <ellipse cx="50" cy="24" rx="26" ry="10" {...sisi(1.28)} />
        </>
      )}
      {kind === 'kerucut' && (
        <>
          <ellipse cx="50" cy="76" rx="25" ry="9" {...sisi(0.68)} />
          <path d="M50,8 L75,76 A25,9 0 0 1 25,76 Z" {...p} />
        </>
      )}
      {kind === 'limas' && (
        <>
          <polygon points="50,14 92,70 50,90" {...sisi(0.68)} />
          <polygon points="50,14 8,70 50,90" {...p} />
          {/* Rusuk alas yang menjauh — ini yang memisahkan limas dari
              kerucut di sel 34 px. */}
          <polyline
            points="8,70 50,56 92,70"
            fill="none"
            stroke={shade(color, 0.84)}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
