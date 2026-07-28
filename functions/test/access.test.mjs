/**
 * End-to-end test of the Fase 5 callables against the Firebase emulators.
 *
 *   npx firebase emulators:start --only auth,firestore,functions --project demo-gea
 *   npm run test:emulator
 *
 * Uses the demo project id, so it never touches a real Firebase project and
 * needs no credentials. Module resolution walks up: firebase-admin comes
 * from functions/node_modules, the client SDK from the repo root.
 */
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'demo-gea';

import { initializeApp as adminInit } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { generateCode } from '../../scripts/generate-codes.mjs';

const adminApp = adminInit({ projectId: 'demo-gea' });
const db = getFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);

const clientApp = initializeApp({ apiKey: 'demo-key', projectId: 'demo-gea', appId: '1:1:web:1' });
const auth = getAuth(clientApp);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const fns = getFunctions(clientApp, 'asia-southeast2');
connectFunctionsEmulator(fns, '127.0.0.1', 5001);

const redeem = httpsCallable(fns, 'redeemActivationCode');
const verify = httpsCallable(fns, 'verifyAccess');

let pass = 0;
let fail = 0;
function check(name, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${detail}`);
  }
}
async function expectError(name, fn, wantCode) {
  try {
    await fn();
    check(name, false, '(tidak error, padahal harus ditolak)');
  } catch (e) {
    const code = String(e.code || '').replace(/^functions\//, '');
    check(`${name} → ${code}`, code === wantCode, `(dapat "${code}", mau "${wantCode}")`);
  }
}

const newUser = async (email) => (await adminAuth.createUser({ email, password: 'rahasia123' })).uid;
const signIn = (email) => signInWithEmailAndPassword(auth, email, 'rahasia123');
const seedCode = (code, group) =>
  db.doc(`activation_codes/${code}`).set({ code, group, used: false, usedBy: null, usedAt: null });

console.log('\n== 1. Tanpa login ==');
await signOut(auth);
await expectError('redeem tanpa login', () => redeem({ code: 'TK-ACDE-FGHJ' }), 'unauthenticated');
await expectError('verifyAccess tanpa login', () => verify({ deviceId: 'aaaaaaaaaa' }), 'unauthenticated');

console.log('\n== 2. Validasi format (tanpa menyentuh Firestore) ==');
const emailA = `a${Date.now()}@test.id`;
const uidA = await newUser(emailA);
await signIn(emailA);
for (const bad of ['', 'sembarang', 'TK-ACDE-FGH', 'XX-ACDE-FGHJ', 'TK-ACDE-FGHI']) {
  await expectError(`kode "${bad}"`, () => redeem({ code: bad }), 'invalid-argument');
}

console.log('\n== 3. Kode valid tapi tidak terdaftar ==');
await expectError('kode tak terdaftar', () => redeem({ code: generateCode('TK') }), 'not-found');

console.log('\n== 4. Penukaran berhasil ==');
const codeTk = generateCode('TK');
await seedCode(codeTk, 'tk');
const r1 = await redeem({ code: codeTk });
check('mengembalikan group tk', r1.data.group === 'tk');
check('alreadyOwned false', r1.data.alreadyOwned === false);
const userDoc = (await db.doc(`users/${uidA}`).get()).data();
check('users/{uid}.groups berisi tk', JSON.stringify(userDoc?.groups) === '["tk"]');
const codeDoc = (await db.doc(`activation_codes/${codeTk}`).get()).data();
check('kode ditandai used', codeDoc.used === true);
check('usedBy = pembeli', codeDoc.usedBy === uidA);
check('usedAt terisi', Boolean(codeDoc.usedAt));

console.log('\n== 5. Huruf kecil + spasi tetap diterima ==');
const codeTk2 = generateCode('TK');
await seedCode(codeTk2, 'tk');
const r2 = await redeem({ code: `  ${codeTk2.toLowerCase()}  ` });
check('dinormalkan lalu diterima', r2.data.group === 'tk');
check('alreadyOwned true (grup sudah dimiliki)', r2.data.alreadyOwned === true);

console.log('\n== 6. Kode dipakai ulang ==');
const rAgain = await redeem({ code: codeTk });
check('pemilik sama → idempotent', rAgain.data.group === 'tk' && rAgain.data.alreadyOwned === true);
const emailB = `b${Date.now()}@test.id`;
await newUser(emailB);
await signOut(auth);
await signIn(emailB);
await expectError('akun lain', () => redeem({ code: codeTk }), 'already-exists');

console.log('\n== 7. verifyAccess + batas 3 perangkat ==');
const infoB = await verify({ deviceId: 'device-satu-000' });
check('akun baru: groups kosong', JSON.stringify(infoB.data.groups) === '[]');
check('deviceCount 1', infoB.data.deviceCount === 1);
check('maxDevices 3', infoB.data.maxDevices === 3);
check('perangkat sama tidak menambah kuota', (await verify({ deviceId: 'device-satu-000' })).data.deviceCount === 1);
await verify({ deviceId: 'device-dua-0000' });
check('perangkat ke-3 masih boleh', (await verify({ deviceId: 'device-tiga-000' })).data.deviceCount === 3);
await expectError('perangkat ke-4', () => verify({ deviceId: 'device-empat-00' }), 'resource-exhausted');
check(
  'perangkat lama tetap bisa setelah kuota penuh',
  (await verify({ deviceId: 'device-dua-0000' })).data.deviceCount === 3,
);
await expectError('deviceId ngawur', () => verify({ deviceId: 'x' }), 'invalid-argument');

console.log('\n== 8. verifyAccess memantulkan grup yang dimiliki ==');
await signOut(auth);
await signIn(emailA);
check('groups = [tk]', JSON.stringify((await verify({ deviceId: 'hp-ayah-00001' })).data.groups) === '["tk"]');

console.log('\n== 9. Prefix kode vs field group tidak cocok ==');
const mismatch = generateCode('SD1');
await db.doc(`activation_codes/${mismatch}`).set({ code: mismatch, group: 'tk', used: false });
await expectError('batch salah dibuat', () => redeem({ code: mismatch }), 'failed-precondition');

console.log('\n== 10. Rate limit percobaan kode ==');
const emailC = `c${Date.now()}@test.id`;
await newUser(emailC);
await signOut(auth);
await signIn(emailC);
let limited = false;
let attempts = 0;
for (let i = 0; i < 15; i++) {
  try {
    await redeem({ code: generateCode('TK') });
  } catch (e) {
    const code = String(e.code || '').replace(/^functions\//, '');
    if (code === 'resource-exhausted') {
      limited = true;
      break;
    }
    if (code === 'not-found') attempts++;
  }
}
check(`brute force dihentikan setelah ${attempts} percobaan`, limited && attempts === 10);

console.log(`\n=== callables: ${pass} lulus, ${fail} gagal ===\n`);
process.exit(fail === 0 ? 0 : 1);
