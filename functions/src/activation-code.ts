/**
 * Activation code format — the ONE canonical implementation.
 *
 * Lives under `functions/` because Firebase only uploads this folder on
 * deploy, and the Cloud Function must be able to verify a code. The batch
 * generator (`scripts/generate-codes.mjs`) imports this same file, so the
 * alphabet and checksum can never drift between the tool that mints codes
 * and the server that accepts them.
 *
 * Plain, dependency-free TypeScript on purpose: Node runs it directly via
 * type stripping when the script imports it, and `tsc` compiles it for the
 * deployed function.
 */

/** Mirrors `GroupId` in src/engine/core/types.ts (functions/ cannot import src/). */
export type GroupId = 'tk' | 'sd1';

/**
 * Ambiguous characters are excluded so a parent reading a code off a phone
 * screen cannot confuse them: no O/0, I/1/L, S/5, Z/2, B/8.
 */
export const ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';

/** Random characters before the trailing checksum character. */
export const BODY_LEN = 7;

export const PREFIX: Record<GroupId, string> = {
  tk: 'TK',
  sd1: 'SD1',
};

export type CodeCheck =
  | { ok: true; group: GroupId; code: string }
  | { ok: false; reason: string };

/**
 * Checksum character appended to every code. This catches typing mistakes;
 * it is NOT what makes a code hard to guess (the 25^7 pool does that). Its
 * job is letting the Cloud Function reject a mistyped code without spending
 * a Firestore read.
 */
export function checksumChar(prefix: string, body: string): string {
  const input = `${prefix}-${body}`;
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum = (sum * 33 + input.charCodeAt(i)) % ALPHABET.length;
  }
  return ALPHABET[sum];
}

/** `TK` + `ACDEFGH` + checksum → `TK-ACDE-FGH4`. */
export function formatCode(prefix: string, body: string, check: string): string {
  const full = body + check;
  return `${prefix}-${full.slice(0, 4)}-${full.slice(4)}`;
}

/**
 * Generates one code. `randomInt` is rejection-sampled by Node, so there is
 * no modulo bias across the alphabet.
 */
export function generateCode(prefix: string, randomInt: (min: number, max: number) => number): string {
  let body = '';
  for (let i = 0; i < BODY_LEN; i++) body += ALPHABET[randomInt(0, ALPHABET.length)];
  return formatCode(prefix, body, checksumChar(prefix, body));
}

/**
 * Accepts what a parent might actually type: lower case, stray spaces.
 * Returns the normalized code and its group, or the reason it is rejected.
 */
export function verifyCode(raw: unknown): CodeCheck {
  const code = String(raw ?? '').trim().toUpperCase();
  const match = /^(TK|SD1)-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(code);
  if (!match) return { ok: false, reason: 'format salah (harus TK-XXXX-XXXX / SD1-XXXX-XXXX)' };

  const [, prefix, a, b] = match;
  const chars = a + b;
  for (const ch of chars) {
    if (!ALPHABET.includes(ch)) return { ok: false, reason: `karakter "${ch}" tidak dipakai di kode` };
  }

  const body = chars.slice(0, BODY_LEN);
  const check = chars.slice(BODY_LEN);
  if (checksumChar(prefix, body) !== check) {
    return { ok: false, reason: 'checksum tidak cocok (kemungkinan salah ketik)' };
  }

  const group = (Object.keys(PREFIX) as GroupId[]).find((g) => PREFIX[g] === prefix);
  if (!group) return { ok: false, reason: `kelompok "${prefix}" tidak dikenal` };
  return { ok: true, group, code };
}
