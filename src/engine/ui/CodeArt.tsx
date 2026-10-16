import type { CodeDir } from '@/engine/core/codeQuest';

/**
 * Gambar kecil yang dipakai bersama `code-quest` (Kode Kelinci · Misi Kode)
 * dan `color-path` (Petak Ajaib · Kode Warna): panah kartu & batu. Satu
 * sumber supaya panah "kanan" di kedua game satu rupa.
 */

export function ArrowIcon({ dir }: { dir: CodeDir }) {
  const rot = { atas: 0, kanan: 90, bawah: 180, kiri: 270 }[dir];
  return (
    <svg viewBox="0 0 40 40" className="cq-arrow" aria-hidden>
      <path
        d="M20 4.5 L35 20 H26 V35.5 H14 V20 H5 Z"
        transform={`rotate(${rot} 20 20)`}
        strokeLinejoin="round"
        strokeWidth="3.4"
        paintOrder="stroke"
      />
    </svg>
  );
}

/** Batu, digambar engine (bukan emoji — beda bentuk di tiap HP). */
export function Rock() {
  return (
    <svg viewBox="0 0 40 40" className="cq-rock" aria-hidden>
      <path d="M6 31 C4 22 10 13 18 12 C22 8 30 10 32 17 C37 20 37 29 33 32 Z" className="cq-rock__body" />
      <path d="M13 20 C16 17 20 16 23 17" className="cq-rock__shine" />
    </svg>
  );
}
