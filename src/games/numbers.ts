/**
 * Indonesian number words for NARRATION.
 *
 * WHY THIS EXISTS: a level's `narration` is both read aloud and printed on
 * screen, so a bare digit in it goes straight to the voice engine. Digits are
 * the one thing every text-to-speech engine reads in its OWN language: the
 * rendered Azure line "Ada 6 singa" came back as "Ada SIX singa", and a phone
 * falling back to `speechSynthesis` without an Indonesian voice does the same.
 * Words can't be misread that way.
 *
 * RULE: never put a digit in `narration`. Numerals belong on the BOARD —
 * `equation` ("6 − 2 = ?"), number cards, the money board — where the child
 * sees the symbol while hearing the word. That pairing is the point.
 */

const UNITS = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
];

/**
 * Spell a whole number in Indonesian: 6 → "enam", 12 → "dua belas",
 * 25 → "dua puluh lima", 15000 → "lima belas ribu".
 *
 * Covers 0–999.999, far past the number range these games use (30 for SD
 * Kelas 1 & 2; rupiah notes go to Rp15.000). Anything outside falls back to
 * the plain digits rather than inventing words — a caller that trips this is
 * asking for something the games shouldn't be teaching yet.
 */
export function terbilang(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999999) return String(n);
  if (n < 10) return UNITS[n]!;
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${UNITS[n - 10]!} belas`;
  if (n < 100) return join(`${UNITS[Math.floor(n / 10)]!} puluh`, n % 10);
  if (n < 200) return join("seratus", n - 100);
  if (n < 1000) return join(`${UNITS[Math.floor(n / 100)]!} ratus`, n % 100);
  if (n < 2000) return join("seribu", n - 1000);
  return join(`${terbilang(Math.floor(n / 1000))} ribu`, n % 1000);
}

/** "dua puluh" + 5 → "dua puluh lima"; remainder 0 drops the tail. */
const join = (head: string, rest: number) =>
  rest === 0 ? head : `${head} ${terbilang(rest)}`;

/**
 * Rupiah in words: 15000 → "lima belas ribu rupiah". The written form
 * ("Rp15.000") stays on the board and on the answer cards — that's the
 * notation the child is learning to read; this is only what they hear.
 */
export const rupiahWords = (n: number) => `${terbilang(n)} rupiah`;

/** Capitalize a sentence that starts with a spelled-out number. */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
