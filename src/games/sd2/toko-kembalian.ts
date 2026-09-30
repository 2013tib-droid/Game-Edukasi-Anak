import type { CashierData, CashierGood, Denom, MixedGameConfig, MixedLevel } from '@/engine/core/types';
import { formatRp } from '@/engine/core/money';
import { capitalize, terbilang } from '@/games/numbers';

/**
 * "Toko Kembalian" (SD Kelas 3 & 4, kelompok `sd2`) — uang & jual beli.
 * Patokannya `docs/rencana-game-sd-kelas-3-4.md` bagian "6. Toko Kembalian".
 *
 * INI CALON DEMO GRATIS `sd2` — tapi `sd2` masih `draft`, jadi game ini BELUM
 * masuk `FREE_GAME_IDS`. Urutan rilisnya ada di CLAUDE.md "Penamaan Kelompok".
 * Karena demo, game ini TIDAK dipotong: kedelapan slot dimainkan berurutan.
 *
 * KEPUTUSAN PEMILIK (2026-09-30), jangan diubah diam-diam:
 * - Gambar uang = foto SPECIMEN resmi BI yang sudah ada di registry (bukan
 *   SVG buatan): anak harus mengenali uang ASLI. Izin pakai dari BI diurus
 *   sebelum `sd2` rilis (lihat docs/asset-generation-prompts.md).
 * - Saat membayar pas, baki MENAMPILKAN total terkumpul / target.
 * - Kembalian juga DITARIK (bukan kartu pilihan) — seperti kasir sungguhan.
 *
 * ALUR (urutan TETAP — kesulitannya naik, jadi tanpa `sessionLevels`;
 * variasinya dari kolam varian per slot, pelajaran Kartu Kembar):
 *   l1  bayar pas satu barang                 — kls 3 (otomatis)
 *   l2  total dua barang                      — kls 3 (tombol Bayar)
 *   l3  kembalian dari satu lembar            — kls 3 (tombol Berikan)
 *   l4  bayar dengan lembar paling sedikit    — kls 3 (otomatis)
 *   l5  total tiga barang                     — kls 4
 *   l6  kembalian dari beberapa lembar        — kls 4
 *   l7  membandingkan harga (kartu pilihan)   — kls 4
 *   l8  soal cerita menabung (celengan)       — kls 4
 *
 * ATURAN MENULIS VARIAN BARU:
 * - Rupiah dikecualikan dari batas bilangan 1.000; bilangan LAIN (jumlah
 *   hari, jumlah barang) tetap ≤ 1.000 dan sebenarnya jauh di bawahnya.
 * - Narasi tanpa digit (`terbilang()`), dan PENDEK: angkanya sudah tertulis
 *   di label harga, di bawah uang pembeli, dan di baki. Hanya soal cerita
 *   (l8, tanpa papan barang) yang menyebut bilangannya di kalimat.
 * - Soal yang targetnya JAWABAN (total, kembalian, tabungan) wajib
 *   `check: 'button'` — kalau selesai sendiri, anak cukup menambah seribu terus.
 * - Dompet memuat pecahan kecil yang memungkinkan jawabannya tersusun, dan
 *   sebisa mungkin satu yang lebih besar dari yang dibutuhkan (pengecoh khas:
 *   menyerahkan lembar terbesar).
 */

const G = {
  roti: { item: 'bread', label: 'roti' },
  susu: { item: 'milk', label: 'susu' },
  pensil: { item: 'pencil', label: 'pensil' },
  buku: { item: 'book', label: 'buku' },
  apel: { item: 'apple', label: 'apel' },
  pisang: { item: 'banana', label: 'pisang' },
  jeruk: { item: 'orange', label: 'jeruk' },
  telur: { item: 'egg', label: 'telur' },
  bola: { item: 'ball', label: 'bola' },
  balon: { item: 'balloon', label: 'balon' },
  boneka: { item: 'teddy', label: 'boneka' },
  topi: { item: 'cap', label: 'topi' },
  tas: { item: 'backpack', label: 'tas' },
  payung: { item: 'umbrella', label: 'payung' },
  sepatu: { item: 'shoe', label: 'sepatu' },
  jagung: { item: 'corn', label: 'jagung' },
  wortel: { item: 'carrot', label: 'wortel' },
  semangka: { item: 'watermelon', label: 'semangka' },
} satisfies Record<string, Omit<CashierGood, 'price'>>;

type GoodName = keyof typeof G;

const good = (name: GoodName, price: number): CashierGood => ({ ...G[name], price });

function cashier(narration: string, data: CashierData): MixedLevel {
  return { id: '', narration, template: 'cashier', data };
}

/** l1 — bayar pas satu barang; baki menampilkan target, selesai sendiri. */
const payExact = (name: GoodName, price: number, wallet: Denom[]) =>
  cashier(`Bayar ${G[name].label} dengan uang pas!`, {
    target: price,
    wallet,
    check: 'auto',
    tray: 'laci',
    goods: [good(name, price)],
  });

/** l2 / l5 — total beberapa barang; anak menjumlah sendiri lalu menekan Bayar. */
function payTotal(items: [GoodName, number][], wallet: Denom[]): MixedLevel {
  const names = items.map(([n]) => G[n].label);
  const list = names.length === 2 ? `${names[0]} dan ${names[1]}` : `${names.slice(0, -1).join(', ')}, dan ${names[names.length - 1]}`;
  return cashier(`Bayar ${list}!`, {
    target: items.reduce((a, [, p]) => a + p, 0),
    wallet,
    check: 'button',
    tray: 'laci',
    goods: items.map(([n, p]) => good(n, p)),
  });
}

/**
 * l3 / l6 — kembalian: harga & uang pembeli di papan, anak menarik kembaliannya.
 * Narasinya SATU kalimat untuk semua varian: angkanya sudah tertulis di label
 * harga & di bawah uang pembeli, dan kalimat yang menyebut dua harga lengkap
 * ("delapan belas ribu lima ratus, dibayar dua puluh satu ribu…") memakan
 * empat-lima baris di HP 320 px.
 */
function change(name: GoodName, price: number, paid: Denom[], wallet: Denom[]): MixedLevel {
  const paidSum = paid.reduce((a, b) => a + b, 0);
  return cashier('Pembeli sudah membayar. Beri kembaliannya!', {
    target: paidSum - price,
    wallet,
    check: 'button',
    tray: 'tangan',
    goods: [good(name, price)],
    paid,
  });
}

/** l4 — bayar pas dengan lembar paling sedikit (jumlah minimumnya dihitung engine). */
const payFewest = (name: GoodName, price: number, wallet: Denom[]) =>
  cashier(`Bayar ${G[name].label} dengan uang paling sedikit!`, {
    target: price,
    wallet,
    check: 'auto',
    fewest: true,
    tray: 'laci',
    goods: [good(name, price)],
  });

/**
 * l7 — mana yang lebih murah. Harga keduanya tertulis BESAR di papan
 * ("3 × Rp2.000 / atau / Paket Rp5.000"), kartunya cukup satu kata. Percobaan
 * pertama menaruh harga di kartu jawaban, dan "Paket Rp5.000" mengecil jadi
 * tulisan 15 px di kartu HP — perbandingannya justru jadi bagian terkecil
 * di layar.
 *
 * Pilihan ketiga "Sama saja" ada di SEMUA varian (dan benar di sebagian),
 * supaya anak tidak bisa menebak di antara dua kartu.
 */
function cheaper(count: number, each: number, name: string, bundle: number): MixedLevel {
  const many = count * each;
  const nb = (s: string) => s.replace(/ /g, '\u00A0');
  return {
    id: '',
    narration: `${capitalize(terbilang(count))} ${name}: beli satuan atau paket? Mana lebih murah?`,
    template: 'tap-answer',
    data: {
      board: `${nb(`${count} × ${formatRp(each)}`)} atau ${nb(`Paket ${formatRp(bundle)}`)}`,
      choices: [
        { id: 'a', text: 'Satuan', correct: many < bundle || undefined },
        { id: 'b', text: 'Paket', correct: bundle < many || undefined },
        { id: 's', text: 'Sama saja', correct: many === bundle || undefined },
      ],
    },
  };
}

/** l8 — soal cerita: anak menghitung sendiri, lalu memasukkan uangnya ke celengan. */
const save = (narration: string, target: number, wallet: Denom[]) =>
  cashier(narration, { target, wallet, check: 'button', tray: 'celengan' });

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: MixedLevel[]): MixedLevel[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: MixedGameConfig = {
  id: 'toko-kembalian',
  group: 'sd2',
  title: 'Toko Kembalian',
  emoji: '🏪',
  template: 'mixed',
  levels: [
    // --- l1 (kls 3) Bayar pas satu barang ---
    slot(
      'l1',
      payExact('roti', 4000, [1000, 2000, 5000]),
      payExact('pensil', 2500, [500, 1000, 2000]),
      payExact('buku', 7000, [1000, 2000, 5000]),
      payExact('susu', 6000, [1000, 2000, 5000]),
      payExact('apel', 3500, [500, 1000, 2000]),
      payExact('bola', 12000, [1000, 2000, 5000, 10000]),
    ),

    // --- l2 (kls 3) Total dua barang ---
    slot(
      'l2',
      payTotal([['roti', 4000], ['susu', 6000]], [1000, 2000, 5000, 10000]),
      payTotal([['pensil', 2000], ['buku', 5000]], [1000, 2000, 5000]),
      payTotal([['apel', 3000], ['pisang', 2500]], [500, 1000, 2000, 5000]),
      payTotal([['bola', 12000], ['balon', 1500]], [500, 1000, 2000, 10000]),
      payTotal([['telur', 2000], ['jagung', 5000]], [1000, 2000, 5000]),
      payTotal([['boneka', 18000], ['balon', 1000]], [1000, 2000, 5000, 10000]),
    ),

    // --- l3 (kls 3) Kembalian dari satu lembar ---
    slot(
      'l3',
      change('buku', 7000, [10000], [1000, 2000, 5000]),
      change('roti', 4000, [5000], [500, 1000, 2000]),
      change('susu', 6000, [10000], [1000, 2000, 5000]),
      change('apel', 3500, [5000], [500, 1000, 2000]),
      change('bola', 12000, [20000], [1000, 2000, 5000]),
      change('pensil', 2500, [5000], [500, 1000, 2000]),
    ),

    // --- l4 (kls 3) Lembar paling sedikit ---
    slot(
      'l4',
      payFewest('topi', 15000, [1000, 2000, 5000, 10000]),
      payFewest('buku', 7000, [1000, 2000, 5000]),
      payFewest('bola', 12000, [1000, 2000, 5000, 10000]),
      payFewest('semangka', 8000, [1000, 2000, 5000]),
      payFewest('jeruk', 3500, [500, 1000, 2000]),
      payFewest('tas', 25000, [1000, 5000, 10000, 20000]),
    ),

    // --- l5 (kls 4) Total tiga barang ---
    slot(
      'l5',
      payTotal([['roti', 4000], ['susu', 6000], ['telur', 2000]], [1000, 2000, 5000, 10000]),
      payTotal([['pensil', 2000], ['buku', 5000], ['balon', 1500]], [500, 1000, 2000, 5000]),
      payTotal([['apel', 3000], ['jeruk', 3500], ['pisang', 2500]], [500, 1000, 2000, 5000]),
      payTotal([['topi', 15000], ['bola', 12000], ['jagung', 5000]], [2000, 5000, 10000, 20000]),
      payTotal([['wortel', 4000], ['jagung', 5000], ['telur', 2500]], [500, 1000, 2000, 5000]),
      payTotal([['payung', 25000], ['sepatu', 40000], ['topi', 15000]], [5000, 10000, 20000, 50000]),
    ),

    // --- l6 (kls 4) Kembalian dari beberapa lembar ---
    slot(
      'l6',
      change('bola', 12000, [10000, 5000], [1000, 2000, 5000]),
      change('boneka', 18500, [20000, 1000], [500, 1000, 2000]),
      change('topi', 15000, [10000, 10000], [1000, 2000, 5000]),
      change('buku', 7500, [5000, 5000], [500, 1000, 2000]),
      change('tas', 21000, [20000, 5000], [1000, 2000, 5000]),
      change('sepatu', 36000, [50000], [1000, 2000, 5000, 10000]),
    ),

    // --- l7 (kls 4) Membandingkan harga ---
    slot(
      'l7',
      cheaper(3, 2000, 'pensil', 5000),
      cheaper(2, 3000, 'roti', 5000),
      cheaper(4, 1000, 'balon', 5000),
      cheaper(2, 5000, 'buku', 12000),
      cheaper(2, 2500, 'susu', 5000),
      cheaper(3, 4000, 'apel', 10000),
    ),

    // --- l8 (kls 4) Soal cerita menabung ---
    slot(
      'l8',
      save(`Adi menabung ${terbilang(2000)} sehari, lima hari. Berapa tabungannya?`, 10000, [1000, 2000, 5000, 10000]),
      save(`Sinta menabung ${terbilang(1000)} sehari, tujuh hari. Berapa tabungannya?`, 7000, [1000, 2000, 5000, 10000]),
      save(`Beni menabung ${terbilang(5000)} seminggu, empat minggu. Berapa tabungannya?`, 20000, [5000, 10000, 20000, 50000]),
      save(`Rina menabung ${terbilang(500)} sehari, enam hari. Berapa tabungannya?`, 3000, [500, 1000, 2000, 5000]),
      save(`Tas ${terbilang(15000)}, uang Dodi baru ${terbilang(10000)}. Kurang berapa?`, 5000, [1000, 2000, 5000, 10000]),
      save(`Bola ${terbilang(12000)}, uang Tini baru ${terbilang(9000)}. Kurang berapa?`, 3000, [500, 1000, 2000, 5000]),
    ),
  ],
};

export default config;
