/**
 * Aturan teks template `word-train` (Susun Kalimat) — dipakai template DAN
 * `scripts/extract-narration.mjs`, supaya kalimat yang dibacakan saat kereta
 * berangkat persis sama dengan baris yang dirender Azure. Beda satu karakter
 * = rekamannya tak ketemu dan anak mendengar suara HP.
 */

/** Gerbong tanda baca: menempel di kata sebelumnya, tanpa spasi. */
export function isPunct(word: string): boolean {
  return /^[.?!,]$/.test(word);
}

/** Kata tanpa penanda imbuhan `|` ("me|nyapu" → "menyapu"). */
export function plainWord(word: string): string {
  return word.replace(/\|/g, '');
}

/** Kalimat utuh yang dibacakan: "Ibu menyapu lantai." */
export function sentenceText(words: string[]): string {
  return words
    .map(plainWord)
    .reduce((out, w) => (out === '' ? w : isPunct(w) ? out + w : `${out} ${w}`), '');
}
