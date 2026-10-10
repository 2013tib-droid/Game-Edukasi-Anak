import type { VoyPhrase, VoyWord } from '@/engine/core/types';

/**
 * Otak Kapten Kata (template `word-voyage`) — dipakai template DAN
 * `scripts/extract-narration.mjs`, jadi teks yang diucapkan tak bisa
 * menyimpang dari yang dirender.
 *
 * INGATAN KATA (Leitner sederhana): tiap kata Inggris punya kotak 0–5 di
 * localStorage HP itu. Benar pada percobaan pertama = naik satu kotak (naik
 * dua kalau dijawab cepat), salah = turun dua. Saat misi dimulai, kata yang
 * kotaknya rendah atau sudah lama tak muncul lebih sering terambil, dan kotak
 * itu juga menentukan seberapa MIRIP pengecohnya: kata yang sudah dikuasai
 * diadu dengan kata yang ejaannya mirip (thirteen ↔ thirty), kata baru diadu
 * dengan kata yang jelas berbeda.
 *
 * Ini cuma ingatan latihan, bukan nilai: bintang tetap dihitung shell dari
 * banyaknya salah, dan kehilangan data ini (ganti HP, mode privat) tidak
 * menghilangkan apa pun — game kembali memilih kata secara merata.
 */

/** Kalimat bahasa Indonesia yang diucapkan template (selain narasi level). */
export const VOY_LINES = {
  bossWin: 'Guritanya menyerah! Kamu menang!',
} as const;

/** Teks Inggris satu kalimat — kata-katanya digabung spasi. */
export function phraseText(p: Pick<VoyPhrase, 'words'>): string {
  return p.words.join(' ');
}

/** Kata tanpa tanda baca (untuk dibandingkan & ditulis di kartu rumpang). */
export function bare(word: string): string {
  return word.replace(/[.,!?]/g, '');
}

/** Kata yang bisa dieja di mode `spell`: huruf saja, tanpa spasi, 3–8 huruf. */
export function spellable(w: VoyWord): boolean {
  return /^[a-z]{3,8}$/i.test(w.en);
}

/* ---------- Ingatan kata ---------- */

const STORE = 'pp_kata_v1';

interface Memo {
  /** Kotak 0–5. */
  b: number;
  /** Terakhir muncul (ms). */
  t: number;
}

let cache: Record<string, Memo> | null = null;

function memory(): Record<string, Memo> {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}') as unknown;
    cache = raw && typeof raw === 'object' ? (raw as Record<string, Memo>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function persist(): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(memory()));
  } catch {
    // Penyimpanan diblokir (mode privat) — main terus tanpa ingatan.
  }
}

export function boxOf(en: string): number {
  const m = memory()[en];
  return m && Number.isFinite(m.b) ? Math.max(0, Math.min(5, m.b)) : 0;
}

/**
 * Catat satu jawaban. `firstTry` = benar tanpa salah dulu; `fast` = dijawab
 * di bawah ±3,5 detik. Jawaban yang benar sesudah salah tidak menaikkan kotak.
 */
export function remember(en: string, result: 'right' | 'wrong', fast = false): void {
  const all = memory();
  const cur = boxOf(en);
  const b = result === 'wrong' ? Math.max(0, cur - 2) : Math.min(5, cur + (fast ? 2 : 1));
  all[en] = { b, t: Date.now() };
  persist();
}

/** Bobot terambil: makin lemah & makin lama tak muncul, makin berat. */
function weight(en: string, now: number): number {
  const m = memory()[en];
  const box = boxOf(en);
  const hours = m ? (now - m.t) / 36e5 : 0;
  const fresh = m ? Math.min(8, hours / 6) : 5;
  return (6 - box) ** 2 + fresh + Math.random() * 2;
}

/** Ambil `n` kata berbeda, berbobot ingatan (tanpa pengulangan). */
export function drawWords(pool: VoyWord[], n: number): VoyWord[] {
  const now = Date.now();
  const bag = pool.map((w) => ({ w, k: weight(w.en, now) }));
  const out: VoyWord[] = [];
  while (out.length < n && bag.length) {
    let roll = Math.random() * bag.reduce((a, x) => a + x.k, 0);
    let i = 0;
    while (i < bag.length - 1 && (roll -= bag[i]!.k) > 0) i += 1;
    out.push(bag.splice(i, 1)[0]!.w);
  }
  return out;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Jarak edit (Levenshtein) — ukuran "mirip ejaannya". */
export function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Pengecoh untuk satu kata. Kata yang belum dikuasai (kotak < 3) diadu
 * dengan kata acak; yang sudah dikuasai dengan kata yang ejaannya PALING
 * MIRIP (huruf awal sama dihitung lebih mirip) — di situlah anak benar-benar
 * harus membaca, bukan menebak dari panjang kata.
 */
export function distractors(target: VoyWord, pool: VoyWord[], n: number): VoyWord[] {
  const others = pool.filter((w) => w.en !== target.en && w.id !== target.id);
  if (boxOf(target.en) < 3) return shuffle(others).slice(0, n);
  const ranked = shuffle(others)
    .map((w) => ({ w, d: editDistance(w.en, target.en) - (w.en[0] === target.en[0] ? 1 : 0) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.w);
  // Dua termirip + sisanya acak, supaya soalnya tidak selalu kembar tiga.
  return [...ranked.slice(0, 2), ...shuffle(ranked.slice(2))].slice(0, n);
}

/** Banyak pilihan: 3 untuk kata baru, 4 begitu kata itu mulai dikuasai. */
export function optionCount(target: VoyWord): number {
  return boxOf(target.en) >= 2 ? 4 : 3;
}
