/**
 * firestore.rules seen from the browser's side — the anti-piracy surface.
 *
 * Everything a user could try in order to unlock games without paying must
 * be denied here, because rules are the last line of defence if a client
 * bug ever exposes a write path.
 *
 *   npx firebase emulators:start --only auth,firestore,functions --project demo-gea
 *   npm run test:emulator
 */
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

import { initializeApp as adminInit } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const suffix = Date.now();
const adminApp = adminInit({ projectId: 'demo-gea' }, `rules-${suffix}`);
const app = initializeApp(
  { apiKey: 'demo-key', projectId: 'demo-gea', appId: '1:1:web:1' },
  `rules-${suffix}`,
);
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const email = `rules${suffix}@test.id`;
await getAdminAuth(adminApp).createUser({ email, password: 'rahasia123' });
const { user } = await signInWithEmailAndPassword(auth, email, 'rahasia123');
const uid = user.uid;

let pass = 0;
let fail = 0;
async function denied(name, fn) {
  try {
    await fn();
    console.log(`  ✗ ${name} — TERNYATA DIIZINKAN`);
    fail++;
  } catch (e) {
    if (String(e.code || e.message).includes('permission-denied')) {
      console.log(`  ✓ ${name} ditolak`);
      pass++;
    } else {
      console.log(`  ✗ ${name} — error lain: ${e.code || e.message}`);
      fail++;
    }
  }
}
async function allowed(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name} diizinkan`);
    pass++;
  } catch (e) {
    console.log(`  ✗ ${name} — ditolak: ${e.code || e.message}`);
    fail++;
  }
}

console.log('\n== firestore.rules dari sisi client ==');
await allowed('baca profil sendiri', () => getDoc(doc(db, `users/${uid}`)));
await denied('baca kode aktivasi', () => getDoc(doc(db, 'activation_codes/TK-ACDE-FGHJ')));
await denied('tulis kode aktivasi', () => setDoc(doc(db, 'activation_codes/TK-ACDE-FGHJ'), { used: false }));
await denied('daftar semua kode aktivasi', () => getDocs(collection(db, 'activation_codes')));
await denied('beri diri sendiri akses grup', () =>
  setDoc(doc(db, `users/${uid}`), { groups: ['tk', 'sd1'] }, { merge: true }),
);
await denied('ubah groups lewat updateDoc', () => updateDoc(doc(db, `users/${uid}`), { groups: ['sd1'] }));
await denied('baca profil akun lain', () => getDoc(doc(db, 'users/akun-orang-lain')));
await allowed('baca daftar perangkat sendiri', () => getDocs(collection(db, `users/${uid}/devices`)));
await denied('hapus perangkat (akal-akalan batas 3)', () =>
  deleteDoc(doc(db, `users/${uid}/devices/device-satu-000`)),
);
await denied('tambah perangkat sendiri', () => setDoc(doc(db, `users/${uid}/devices/palsu`), { x: 1 }));
await denied('reset penghitung rate limit', () => setDoc(doc(db, `redeem_attempts/${uid}`), { count: 0 }));
await denied('baca koleksi asing', () => getDoc(doc(db, 'apa_saja/x')));
await allowed('tulis progress bintang sendiri', () =>
  setDoc(doc(db, `users/${uid}/progress/hutan-hewan`), { stars: 3 }),
);

console.log(`\n=== rules: ${pass} lulus, ${fail} gagal ===\n`);
process.exit(fail === 0 ? 0 : 1);
