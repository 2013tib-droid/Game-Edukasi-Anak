import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { getFirebase, isFirebaseConfigured } from '@/auth/firebase';

interface AuthContextValue {
  /** Current Firebase user, or null when signed out. */
  user: User | null;
  /** True until the first auth state resolves — gate redirects on this. */
  loading: boolean;
  /** False when .env has no Firebase keys; auth screens show a notice. */
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  /**
   * Masuk (atau mendaftar sekaligus) dengan akun Google.
   *
   * Mengembalikan `'redirect'` kalau jendela pop-up diblokir dan alur
   * pindah-halaman dipakai sebagai gantinya — di situ halamannya akan
   * ditinggalkan, jadi jangan menaruh apa pun sesudah panggilan ini.
   */
  loginWithGoogle: () => Promise<GoogleSignInMode>;
  /**
   * Menyelesaikan alur pindah-halaman sesudah browser kembali dari Google.
   * Menjawab `false` (tanpa menyentuh jaringan) kalau memang tidak ada
   * kepindahan yang sedang ditunggu.
   */
  finishGoogleRedirect: () => Promise<boolean>;
  logout: () => Promise<void>;
  /** Send the "reset your password" email. See the note in `resetPassword`. */
  resetPassword: (email: string) => Promise<void>;
  /**
   * Apakah email akun ini sudah diverifikasi.
   *
   * Dipakai sebagai syarat MENUKAR KODE saja — bukan syarat masuk dan bukan
   * syarat bermain. Lihat catatan di `sendVerification`.
   */
  emailVerified: boolean;
  /** Kirim (atau kirim ulang) email verifikasi ke alamat akun ini. */
  sendVerification: () => Promise<void>;
  /**
   * Tanyakan ulang ke server apakah emailnya sudah diverifikasi, lalu
   * kembalikan hasilnya. Dipakai tombol "Saya sudah verifikasi".
   */
  refreshUser: () => Promise<boolean>;
}

export type GoogleSignInMode = 'popup' | 'redirect';

/**
 * Penanda "kita sedang pergi ke Google dan akan kembali lagi ke halaman ini".
 *
 * Dipakai `sessionStorage`, bukan `localStorage`: penanda ini hanya berlaku
 * untuk satu tab dalam satu perjalanan. Kalau memakai localStorage, sesi yang
 * gagal di tengah jalan akan membuat tab lain ikut menunggu selamanya.
 */
const REDIRECT_FLAG = 'pp_google_redirect_v1';

/** Aman dipanggil di mana saja: sessionStorage bisa dimatikan browser. */
function readFlag(): boolean {
  try {
    return sessionStorage.getItem(REDIRECT_FLAG) === '1';
  } catch {
    return false;
  }
}

function writeFlag(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(REDIRECT_FLAG, '1');
    else sessionStorage.removeItem(REDIRECT_FLAG);
  } catch {
    // Mode penyamaran / cookie dimatikan: alur pop-up tetap jalan, dan alur
    // pindah-halaman cuma kehilangan navigasi otomatisnya di akhir.
  }
}

/**
 * True kalau halaman ini baru saja dibuka ulang sepulang dari Google. Dipakai
 * tombolnya supaya langsung tampil "Melanjutkan…" pada gambar pertama, bukan
 * berkedip memperlihatkan formulir dulu.
 */
export function hasPendingGoogleRedirect(): boolean {
  return readFlag();
}

/**
 * Kode kegagalan pop-up yang PANTAS dicoba ulang lewat pindah-halaman.
 *
 * `auth/popup-closed-by-user` & `auth/cancelled-popup-request` SENGAJA tidak
 * ada di sini: itu artinya orang tuanya sendiri yang menutup jendelanya, dan
 * melemparnya ke alur pindah-halaman justru memaksa mereka meneruskan sesuatu
 * yang baru saja dibatalkan.
 */
const POPUP_FALLBACK = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
]);

/** Orang tua membatalkan sendiri — bukan kesalahan, jangan tampilkan pesan. */
export function isGoogleCancelled(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return (
    code === 'auth/popup-closed-by-user'
    || code === 'auth/cancelled-popup-request'
    || code === 'auth/user-cancelled'
  );
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  // `user.reload()` mengubah objeknya DI TEMPAT dan TIDAK memicu
  // `onAuthStateChanged`, jadi React tak akan menggambar ulang dengan
  // sendirinya. Penanda ini yang memaksanya sesudah verifikasi terbukti.
  const [verifyTick, setVerifyTick] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        getFirebase(),
        import('firebase/auth'),
      ]);
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      async login(email, password) {
        const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(email, password) {
        const [{ auth }, { createUserWithEmailAndPassword, sendEmailVerification }] =
          await Promise.all([getFirebase(), import('firebase/auth')]);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Langsung kirim tautan verifikasinya, jadi orang tua yang mengetik
        // emailnya benar biasanya sudah terverifikasi sebelum sampai ke
        // layar aktivasi. Kegagalan pengiriman TIDAK menggagalkan
        // pendaftaran: akunnya sudah jadi, dan tautannya bisa diminta lagi
        // dari halaman aktivasi.
        await sendEmailVerification(cred.user).catch(() => undefined);
      },
      /**
       * Masuk dengan akun Google.
       *
       * KENAPA ADA, padahal keputusan produknya "email + kata sandi":
       *  - Akun Google datang dengan email yang SUDAH terverifikasi, jadi
       *    gerbang `requireVerifiedEmail` di `redeemActivationCode` lolos
       *    seketika. Orang tua yang baru membayar tidak perlu menunggu email
       *    verifikasi yang sering mendarat di folder spam sebelum kodenya
       *    bisa ditukar.
       *  - Tidak ada kata sandi baru yang bisa dilupakan, jadi tiket "kata
       *    sandi saya lupa" di WhatsApp ikut hilang.
       *
       * EMAIL + KATA SANDI TETAP ADA DAN JANGAN DIHAPUS: Google menolak alur
       * OAuth di dalam WebView aplikasi (`disallowed_useragent`) — dan
       * promosinya justru lewat TikTok & WhatsApp, yang membuka tautan di
       * browser dalam aplikasi. Di situ tombol ini tidak akan bisa dipakai,
       * dan formulir email adalah satu-satunya jalan masuk.
       */
      async loginWithGoogle() {
        const [{ auth }, mod] = await Promise.all([getFirebase(), import('firebase/auth')]);
        const provider = new mod.GoogleAuthProvider();
        // Selalu tampilkan pemilih akun: satu HP sering dipakai berdua, dan
        // diam-diam masuk ke akun Google yang kebetulan aktif akan memberi
        // akses berbayar kepada akun yang salah.
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
          await mod.signInWithPopup(auth, provider);
          return 'popup';
        } catch (err) {
          const code = (err as { code?: string }).code ?? '';
          if (!POPUP_FALLBACK.has(code)) throw err;
          // Penanda dipasang SEBELUM berpindah — sesudahnya halaman ini
          // sudah tidak berjalan lagi.
          writeFlag(true);
          await mod.signInWithRedirect(auth, provider);
          return 'redirect';
        }
      },

      async finishGoogleRedirect() {
        if (!isFirebaseConfigured || !readFlag()) return false;
        writeFlag(false);
        const [{ auth }, { getRedirectResult }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        // Jawabannya null kalau orang tuanya membatalkan di halaman Google.
        // Itu bukan kegagalan — cukup kembali ke formulir seperti semula.
        return (await getRedirectResult(auth)) !== null;
      },

      async logout() {
        const [{ auth }, { signOut }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await signOut(auth);
      },
      /**
       * A parent who forgets their password would otherwise lose the group
       * they paid for, and the only recovery path would be messaging the
       * owner on WhatsApp one by one.
       *
       * Callers must show the SAME confirmation whether or not the address is
       * registered: Firebase reports unknown addresses as `auth/user-not-found`,
       * and surfacing that would turn this form into a way to check which
       * emails have an account here.
       */
      async resetPassword(email) {
        const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        await sendPasswordResetEmail(auth, email);
      },

      emailVerified: user?.emailVerified ?? false,

      /**
       * Verifikasi email dipakai sebagai syarat MENUKAR KODE, bukan syarat
       * masuk dan bukan syarat bermain (keputusan yang ditulis di
       * docs/fase-6-rilis-prompt.md langkah 4).
       *
       * Alasannya dua arah:
       *  - Akun dengan email salah ketik yang sudah menukar kode jadi akses
       *    berbayar yang TIDAK BISA DIPULIHKAN: setel ulang kata sandi
       *    mengirim ke alamat yang tidak ada, dan kodenya sudah hangus.
       *    Memeriksanya di gerbang aktivasi menutup itu tepat pada saat
       *    satu-satunya saat yang penting.
       *  - JANGAN pernah menjadikannya syarat bermain. Anak yang sedang
       *    menunggu tidak paham kenapa permainannya berhenti, dan email
       *    verifikasi sering mendarat di folder spam.
       */
      async sendVerification() {
        const [{ auth }, { sendEmailVerification }] = await Promise.all([
          getFirebase(),
          import('firebase/auth'),
        ]);
        const current = auth.currentUser;
        if (!current) throw new Error('Belum ada akun yang masuk.');
        await sendEmailVerification(current);
      },

      async refreshUser() {
        const { auth } = await getFirebase();
        const current = auth.currentUser;
        if (!current) return false;
        await current.reload();
        // WAJIB: `reload()` memperbarui objek di sisi HP, tapi klaim
        // `email_verified` yang dibaca Cloud Function ada di ID TOKEN.
        // Tanpa memaksa token baru, aktivasi tetap ditolak walaupun di layar
        // sudah tertulis "terverifikasi" — dan itu terbaca seperti bug.
        await current.getIdToken(true);
        setVerifyTick((n) => n + 1);
        return current.emailVerified;
      },
    }),
    [user, loading, verifyTick],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
