/**
 * Uang rupiah untuk template `cashier` (Toko Kembalian, sd2).
 *
 * Satu tempat yang memetakan NILAI pecahan ke gambarnya di registry item
 * (`src/engine/ui/items.ts` — foto SPECIMEN resmi BI untuk uang kertas, foto
 * koin untuk Rp500). Config game cukup menyebut nilainya (`5000`), jadi salah
 * ketik id gambar mustahil dan pecahan yang belum punya gambar tertolak saat
 * build (`Denom` adalah union literal).
 *
 * `koin1000` & `koin200` SENGAJA tidak dipakai: Rp1.000 sudah diwakili uang
 * kertas (satu nilai, satu gambar — anak tak perlu bertanya kenapa "seribu"
 * punya dua rupa), dan Rp200 nyaris tak dipakai berbelanja. `rp100000` juga
 * tidak: belanjaan di game ini berhenti di puluhan ribu.
 */

export type Denom = 500 | 1000 | 2000 | 5000 | 10000 | 20000 | 50000;

export const DENOM_ITEM: Record<Denom, string> = {
  500: 'koin500',
  1000: 'rp1000',
  2000: 'rp2000',
  5000: 'rp5000',
  10000: 'rp10000',
  20000: 'rp20000',
  50000: 'rp50000',
};

/** Semua pecahan, dari besar ke kecil — urutan untuk menghitung lembar paling sedikit. */
export const DENOMS_DESC: Denom[] = [50000, 20000, 10000, 5000, 2000, 1000, 500];

/** Koin digambar bulat & lebih kecil; uang kertas mendatar. */
export const isCoin = (d: Denom) => d < 1000;

/**
 * "Rp15.000" — titik ribuan ditulis sendiri, bukan `toLocaleString('id-ID')`:
 * hasil locale bergantung ICU tiap HP/Node, dan satu HP yang menulis "15,000"
 * membuat soal uang terbaca salah.
 */
export function formatRp(n: number): string {
  const s = String(Math.abs(Math.round(n)));
  const grouped = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '−' : ''}Rp${grouped}`;
}

/**
 * Jumlah lembar paling sedikit untuk membentuk `amount` dari pecahan yang
 * tersedia (pemrograman dinamis, bukan serakah — dengan pecahan terbatas,
 * serakah bisa salah). `Infinity` kalau tak bisa dibentuk.
 */
export function fewestPieces(amount: number, denoms: readonly Denom[]): number {
  const unit = 500;
  if (amount % unit !== 0) return Infinity;
  const n = amount / unit;
  const best = new Array<number>(n + 1).fill(Infinity);
  best[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (const d of denoms) {
      const k = d / unit;
      if (k <= i && best[i - k] + 1 < best[i]) best[i] = best[i - k] + 1;
    }
  }
  return best[n];
}
