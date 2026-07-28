#!/usr/bin/env node
/**
 * Activation code batch generator (Fase 5, jalur A — voucher pre-generated).
 *
 * Generates unique, single-use activation codes in the format
 * `TK-XXXX-XXXX` / `SD1-XXXX-XXXX` and writes three files per batch:
 *
 *   <batch>.txt         one code per line — upload target for Mayar/Lynk vouchers
 *   <batch>.csv         `code` column with header — for sellers wanting a CSV
 *   <batch>.import.json Firestore `activation_codes` documents (Fase 5 import)
 *
 * Zero dependencies on purpose: this must run before a Firebase project
 * exists, and codes are bearer secrets — the fewer moving parts the better.
 *
 * Usage:
 *   node scripts/generate-codes.mjs --group tk --count 100
 *   node scripts/generate-codes.mjs --verify TK-ACDE-FGH4
 *   node scripts/generate-codes.mjs --help
 */

import { randomInt } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { argv } from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Ambiguous characters are excluded so a parent reading a code off a phone
 * screen cannot confuse them: no O/0, I/1/L, S/5, Z/2, B/8.
 */
const ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';

/** Body length excluding the trailing checksum character. */
const BODY_LEN = 7;

/** Group id (matches `GroupId` in src/engine/core/types.ts) → code prefix. */
const PREFIX = {
  tk: 'TK',
  sd1: 'SD1',
};

const DEFAULT_OUT = 'codes';

/**
 * Checksum character appended to every code. This exists to catch typing
 * mistakes, NOT to make codes unguessable — the randomness does that. The
 * Cloud Function can reject a malformed code before spending a Firestore
 * read. If we ever mirror this check client-side, mirror this function
 * exactly.
 */
export function checksumChar(prefix, body) {
  const input = `${prefix}-${body}`;
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum = (sum * 33 + input.charCodeAt(i)) % ALPHABET.length;
  }
  return ALPHABET[sum];
}

/** `TK` + `ACDEFGH` + checksum → `TK-ACDE-FGH4`. */
function formatCode(prefix, body, check) {
  const full = body + check;
  return `${prefix}-${full.slice(0, 4)}-${full.slice(4)}`;
}

export function generateCode(prefix) {
  let body = '';
  // randomInt is rejection-sampled by Node, so no modulo bias.
  for (let i = 0; i < BODY_LEN; i++) body += ALPHABET[randomInt(0, ALPHABET.length)];
  return formatCode(prefix, body, checksumChar(prefix, body));
}

/**
 * Returns the group id when `code` is well-formed and its checksum matches,
 * otherwise a string explaining why it is rejected.
 */
export function verifyCode(raw) {
  const code = String(raw).trim().toUpperCase();
  const match = /^(TK|SD1)-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(code);
  if (!match) return { ok: false, reason: 'format salah (harus TK-XXXX-XXXX / SD1-XXXX-XXXX)' };

  const [, prefix, a, b] = match;
  const chars = a + b;
  for (const ch of chars) {
    if (!ALPHABET.includes(ch)) return { ok: false, reason: `karakter "${ch}" tidak dipakai di kode` };
  }

  const body = chars.slice(0, BODY_LEN);
  const check = chars.slice(BODY_LEN);
  if (checksumChar(prefix, body) !== check) return { ok: false, reason: 'checksum tidak cocok (kemungkinan salah ketik)' };

  const group = Object.keys(PREFIX).find((g) => PREFIX[g] === prefix);
  return { ok: true, group, code };
}

/**
 * Every code ever generated lives in the `.txt` files of the output dir, so
 * reading them back is enough to guarantee a new batch collides with
 * nothing. Collisions are astronomically unlikely (25^7 ≈ 6.1e9 per group)
 * but a duplicate would hand two buyers the same code, so we check.
 */
function readExistingCodes(outDir) {
  const existing = new Set();
  if (!existsSync(outDir)) return existing;
  for (const file of readdirSync(outDir)) {
    if (!file.endsWith('.txt')) continue;
    for (const line of readFileSync(join(outDir, file), 'utf8').split('\n')) {
      const code = line.trim();
      if (code) existing.add(code);
    }
  }
  return existing;
}

function parseArgs(argv) {
  const args = { group: null, count: null, out: DEFAULT_OUT, note: '', verify: null, help: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) fail(`opsi ${arg} butuh nilai`);
      return value;
    };
    switch (arg) {
      case '--group': case '-g': args.group = next().toLowerCase(); break;
      case '--count': case '-n': args.count = Number(next()); break;
      case '--out': case '-o': args.out = next(); break;
      case '--note': args.note = next(); break;
      case '--verify': args.verify = next(); break;
      case '--dry-run': args.dryRun = true; break;
      case '--help': case '-h': args.help = true; break;
      default: fail(`opsi tidak dikenal: ${arg}`);
    }
  }
  return args;
}

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  console.error('  Jalankan "node scripts/generate-codes.mjs --help" untuk bantuan.\n');
  process.exit(1);
}

const HELP = `
  Generator kode aktivasi — Game Edukasi Anak

  Pemakaian:
    node scripts/generate-codes.mjs --group <tk|sd1> --count <jumlah> [opsi]
    node scripts/generate-codes.mjs --verify <kode>

  Opsi:
    -g, --group <tk|sd1>   Kelompok yang dibuka kode ini. WAJIB.
    -n, --count <jumlah>   Banyak kode yang dibuat (1–100000). WAJIB.
    -o, --out <folder>     Folder keluaran (default: ${DEFAULT_OUT}/).
        --note <teks>      Catatan batch, ikut tersimpan di file import.
        --dry-run          Tampilkan contoh kode, jangan tulis file.
        --verify <kode>    Cek satu kode (format + checksum), lalu keluar.
    -h, --help             Tampilkan bantuan ini.

  Contoh:
    node scripts/generate-codes.mjs -g tk -n 100 --note "batch launching TikTok"
    npm run gen:codes -- -g sd1 -n 50

  Catatan: folder keluaran masuk .gitignore — kode aktivasi adalah rahasia,
  siapa pun yang memegangnya bisa membuka game. Jangan pernah di-commit.
`;

function main() {
  const args = parseArgs(argv.slice(2));

  if (args.help) {
    console.log(HELP);
    return;
  }

  if (args.verify !== null) {
    const result = verifyCode(args.verify);
    if (result.ok) console.log(`\n  ✓ ${result.code} — valid, kelompok "${result.group}"\n`);
    else console.log(`\n  ✗ ${args.verify} — ${result.reason}\n`);
    process.exit(result.ok ? 0 : 1);
  }

  if (!args.group) fail('--group wajib diisi (tk atau sd1)');
  const prefix = PREFIX[args.group];
  if (!prefix) fail(`kelompok "${args.group}" tidak dikenal — pilih: ${Object.keys(PREFIX).join(', ')}`);

  if (args.count === null) fail('--count wajib diisi');
  if (!Number.isInteger(args.count) || args.count < 1 || args.count > 100000) {
    fail('--count harus bilangan bulat 1–100000');
  }

  const outDir = resolve(process.cwd(), args.out);
  const existing = args.dryRun ? new Set() : readExistingCodes(outDir);
  const batch = [];
  const seen = new Set();

  let attempts = 0;
  const maxAttempts = args.count * 50;
  while (batch.length < args.count) {
    if (++attempts > maxAttempts) fail('gagal membuat kode unik — kolam kode hampir penuh?');
    const code = generateCode(prefix);
    if (seen.has(code) || existing.has(code)) continue;
    seen.add(code);
    batch.push(code);
  }

  if (args.dryRun) {
    console.log(`\n  Dry run — ${batch.length} kode "${args.group}", tidak ada file ditulis.\n`);
    for (const code of batch.slice(0, 10)) console.log(`    ${code}`);
    if (batch.length > 10) console.log(`    … dan ${batch.length - 10} lainnya`);
    console.log();
    return;
  }

  const createdAt = new Date();
  const stamp = createdAt.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const batchId = `${prefix}-${stamp}-${batch.length}`;

  mkdirSync(outDir, { recursive: true });
  for (const ext of ['txt', 'csv', 'import.json']) {
    const path = join(outDir, `${batchId}.${ext}`);
    if (existsSync(path)) fail(`file ${path} sudah ada — hapus dulu atau pakai --out lain`);
  }

  const docs = batch.map((code) => ({
    code,
    group: args.group,
    used: false,
    usedBy: null,
    usedAt: null,
    batch: batchId,
    note: args.note,
    createdAt: createdAt.toISOString(),
  }));

  writeFileSync(join(outDir, `${batchId}.txt`), batch.join('\n') + '\n', 'utf8');
  writeFileSync(join(outDir, `${batchId}.csv`), 'code\n' + batch.join('\n') + '\n', 'utf8');
  writeFileSync(join(outDir, `${batchId}.import.json`), JSON.stringify(docs, null, 2) + '\n', 'utf8');

  console.log(`
  ✓ ${batch.length} kode aktivasi "${args.group}" dibuat.

    Batch     : ${batchId}
    Folder    : ${outDir}
    Contoh    : ${batch[0]}
    Unik thd  : ${existing.size} kode yang sudah pernah dibuat

  Langkah berikutnya:
    1. Upload ${batchId}.txt ke Mayar/Lynk sebagai stok voucher produk digital.
    2. Simpan ${batchId}.import.json — dipakai mengisi koleksi
       "activation_codes" saat Cloud Function siap.
    3. JANGAN commit folder ${args.out}/ (sudah masuk .gitignore).
`);
}

// Only run the CLI when invoked directly; importing this file (tests, or the
// Cloud Function reusing `verifyCode`) must not generate anything.
if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
