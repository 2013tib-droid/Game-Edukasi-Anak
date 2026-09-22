import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPendingGoogleRedirect, isGoogleCancelled, useAuth } from '@/auth/AuthContext';

/**
 * Tombol "Masuk dengan Google" — dipakai bersama oleh layar Masuk & Daftar,
 * supaya keduanya tidak pernah menyimpang (pelajaran lama: ikon game yang
 * ditulis di dua tempat berakhir beda selama seminggu).
 *
 * Tombol ini menangani DUA alur sekaligus:
 *  1. jendela pop-up — jalur utama, dan satu-satunya yang benar-benar mulus;
 *  2. pindah-halaman — cadangan kalau pop-up diblokir. Di situ halamannya
 *     ditinggalkan dan dibuka lagi dari nol, jadi penyelesaiannya terjadi di
 *     efek saat halaman ini dibuka, bukan di penanganan klik.
 *
 * Navigasinya SENGAJA menunggu `user` muncul dari context, bukan langsung
 * sesudah Firebase menjawab: `ProtectedRoute` melempar balik ke `/masuk`
 * selama `user` masih null, jadi pindah terlalu cepat akan terlihat seperti
 * "masuknya gagal padahal berhasil".
 */
interface Props {
  /** Tulisan tombolnya — beda di layar Masuk dan layar Daftar. */
  label: string;
  /** Tujuan sesudah berhasil masuk. */
  to: string;
  /** Sibuk bersama dengan formulir email, supaya keduanya tidak jalan bareng. */
  busy: boolean;
  setBusy: (busy: boolean) => void;
  /** Satu tempat pesan kesalahan untuk seluruh halaman. */
  onError: (message: string | null) => void;
}

export default function GoogleSignInButton({ label, to, busy, setBusy, onError }: Props) {
  const { user, configured, loginWithGoogle, finishGoogleRedirect } = useAuth();
  const navigate = useNavigate();
  // Dibaca saat render pertama: kalau halaman ini memang baru kembali dari
  // Google, tombolnya langsung tampil "Melanjutkan…" tanpa berkedip dulu.
  const [waiting, setWaiting] = useState(() => hasPendingGoogleRedirect());
  const resumed = useRef(false);

  // Sepulang dari Google. Sekali per pembukaan halaman — `finishGoogleRedirect`
  // sendiri sudah menjawab false kalau tak ada yang ditunggu.
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    // Tidak ada yang ditunggu: jangan sekali pun mengunci tombolnya, supaya
    // kunjungan biasa ke halaman ini tak pernah berkedip "sedang sibuk".
    if (!hasPendingGoogleRedirect()) return;
    let alive = true;
    void (async () => {
      setBusy(true);
      try {
        const signedIn = await finishGoogleRedirect();
        if (!alive) return;
        // Tidak jadi masuk (dibatalkan di halaman Google, atau memang tidak
        // ada kepindahan): kembalikan halamannya seperti semula.
        if (!signedIn) {
          setWaiting(false);
          setBusy(false);
        }
      } catch (err) {
        if (!alive) return;
        setWaiting(false);
        setBusy(false);
        if (!isGoogleCancelled(err)) onError(googleErrorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sekali saat halaman dibuka
  }, []);

  // Berhasil masuk: pindah begitu context benar-benar memegang usernya.
  useEffect(() => {
    if (!waiting || !user) return;
    setBusy(false);
    navigate(to, { replace: true });
  }, [waiting, user, to, navigate, setBusy]);

  async function handleClick() {
    onError(null);
    setBusy(true);
    try {
      const mode = await loginWithGoogle();
      // Alur pindah-halaman: halaman ini sudah ditinggalkan, jangan menyentuh
      // state apa pun lagi.
      if (mode === 'redirect') return;
      setWaiting(true);
    } catch (err) {
      setBusy(false);
      // Menutup jendela Google sendiri bukan kesalahan — diam saja.
      if (isGoogleCancelled(err)) return;
      onError(googleErrorMessage(err));
    }
  }

  return (
    <button
      type="button"
      className="btn btn--google"
      onClick={() => void handleClick()}
      disabled={busy || !configured}
    >
      <GoogleLogo />
      {waiting ? 'Melanjutkan…' : label}
    </button>
  );
}

/**
 * Logo "G" resmi Google. Wajib logo aslinya (bukan emoji atau huruf G biasa) —
 * itu syarat merek Google untuk tombol masuk, dan orang tua mengenalinya dari
 * warnanya, bukan dari tulisannya.
 */
function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/**
 * Kalimat siap dibaca orang tua.
 *
 * Dua kode pertama itu kesalahan PEMASANGAN, bukan kesalahan orang tuanya —
 * kalimatnya sengaja menyebut "belum aktif" supaya laporan yang masuk ke
 * WhatsApp bisa langsung dikenali pemiliknya, bukan jadi "Google-nya error".
 */
function googleErrorMessage(err: unknown): string {
  switch ((err as { code?: string } | null)?.code) {
    case 'auth/operation-not-allowed':
      return 'Masuk dengan Google belum aktif di aplikasi ini. Sementara pakai email & kata sandi dulu ya.';
    case 'auth/unauthorized-domain':
      return 'Masuk dengan Google belum diizinkan untuk alamat situs ini. Sementara pakai email & kata sandi dulu ya.';
    case 'auth/account-exists-with-different-credential':
      return 'Email ini sudah punya akun dengan kata sandi. Masuk pakai email & kata sandi ya.';
    case 'auth/network-request-failed':
      return 'Koneksi internetnya terputus. Coba lagi sebentar lagi ya.';
    default:
      return 'Gagal masuk dengan Google. Coba lagi, atau pakai email & kata sandi ya.';
  }
}
