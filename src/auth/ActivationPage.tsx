import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import groupsData from '@/data/groups.json';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import { errorMessage, fetchOwnedGroups, redeemActivationCode } from '@/auth/entitlements';

function groupTitle(id: string): string {
  return groupsData.groups.find((g) => g.id === id)?.title ?? id;
}

/**
 * Menukar kode aktivasi jadi akses kelompok.
 *
 * Semua pemeriksaannya ada di Cloud Function `redeemActivationCode` — halaman
 * ini hanya mengirim kodenya dan menerjemahkan jawabannya. Kode aktivasi tidak
 * pernah bisa dibaca dari client (lihat firestore.rules), jadi tidak ada yang
 * bisa dicocokkan sendiri di HP.
 *
 * VERIFIKASI EMAIL jadi syarat di sini — dan HANYA di sini. Yang mengikat
 * pemeriksaannya ada di Cloud Function (`requireVerifiedEmail`); panel di
 * bawah cuma supaya orang tua melihat penjelasannya sebelum menekan
 * "Aktifkan" dan ditolak tanpa tahu sebabnya.
 */
export default function ActivationPage() {
  const { user, emailVerified, sendVerification, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ group: string; already: boolean } | null>(null);
  // Kelompok yang sudah dimiliki akun ini. `null` = belum diketahui; ini
  // keterangan tambahan, jadi kegagalannya ditelan dan tidak pernah
  // menghalangi penukaran kode.
  const [owned, setOwned] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    let alive = true;
    void fetchOwnedGroups(user.uid)
      .then((groups) => {
        if (alive) setOwned(groups);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [user, done]);

  function handleLogout() {
    // Pindah DULU, baru keluar. Kalau urutannya dibalik, `ProtectedRoute`
    // sempat melihat `user` sudah null dan melempar ke /masuk — formulir
    // kosong yang justru ingin kita hindari di seluruh perubahan ini.
    navigate('/', { replace: true });
    void logout();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await redeemActivationCode(code);
      setDone(result);
    } catch (err) {
      // Cloud Function sudah mengirim kalimat yang siap dibaca orang tua
      // (kode salah, sudah dipakai, terlalu sering mencoba).
      setError(
        errorMessage(err, 'Gagal mengaktifkan kode. Periksa koneksi internetnya ya.'),
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="page" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 72, lineHeight: 1 }} aria-hidden>
          🎉
        </div>
        <h1>{done.already ? 'Sudah aktif!' : 'Berhasil!'}</h1>
        <p style={{ fontSize: 19 }}>
          Kelompok <strong>{groupTitle(done.group)}</strong> sudah terbuka untuk akun ini.
          Selamat bermain!
        </p>
        <p style={{ display: 'grid', gap: 12 }}>
          <Link className="btn btn--primary" to={`/kelompok/${done.group}`}>
            🎮 Mulai Main
          </Link>
          <Link className="btn" to="/portal">
            🏠 Beranda
          </Link>
        </p>
      </div>
    );
  }

  // Email belum terverifikasi: tahan di sini, jangan biarkan kodenya
  // dibakar oleh akun yang emailnya salah ketik.
  if (isFirebaseConfigured && user && !emailVerified) {
    return <VerifyFirst email={user.email} onSend={sendVerification} onRecheck={refreshUser} />;
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/portal">
        <ArrowLeftIcon /> Kembali
      </Link>
      <AccountPanel email={user?.email ?? null} owned={owned} onLogout={handleLogout} />
      <h1>Masukkan Kode Aktivasi</h1>
      <p>Kode dikirim setelah pembelian di Lynk.id / Mayar.id.</p>
      {!isFirebaseConfigured && (
        <p style={{ background: '#fff3cd', padding: 12, borderRadius: 12 }}>
          ⚠️ Firebase belum dikonfigurasi (.env kosong). Aktivasi belum aktif.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input
          className="input"
          placeholder="Contoh: TK-ABCD-2345"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
        />
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        <button
          className="btn btn--primary"
          type="submit"
          disabled={busy || !isFirebaseConfigured}
        >
          {busy ? 'Memeriksa…' : 'Aktifkan'}
        </button>
      </form>
      <p style={{ fontSize: 15, opacity: 0.75 }}>
        Huruf besar/kecil dan tanda hubung tidak masalah — yang penting huruf dan angkanya
        benar.
      </p>
    </div>
  );
}

/**
 * "Akun mana yang sedang masuk" — satu-satunya tempat di app ini yang
 * menjawabnya, dan satu-satunya jalan keluar yang disengaja.
 *
 * Kelompok yang sudah dimiliki ikut ditampilkan supaya orang tua yang sudah
 * menukar kode tidak melihat formulir kode kosong lalu mengira aktivasinya
 * tidak tersimpan.
 */
function AccountPanel({
  email,
  owned,
  onLogout,
}: {
  email: string | null;
  owned: string[] | null;
  onLogout: () => void;
}) {
  if (!isFirebaseConfigured) return null;
  return (
    <div className="account-panel">
      <div className="account-panel__who">
        Masuk sebagai
        <span className="account-panel__email">{email ?? 'akun ini'}</span>
        {owned && owned.length > 0 && (
          <p className="account-panel__groups">
            ✅ Sudah aktif: {owned.map(groupTitle).join(' · ')}
          </p>
        )}
      </div>
      <button className="account-panel__out" type="button" onClick={onLogout}>
        Keluar
      </button>
    </div>
  );
}

/**
 * Layar "verifikasi emailmu dulu".
 *
 * Sengaja TIDAK memblokir apa pun selain aktivasi: tombol "Main dulu"
 * mengembalikan anak ke portal, jadi menunggu email tidak pernah berarti
 * menunggu untuk bermain. Permainan gratis tetap jalan penuh.
 */
function VerifyFirst({
  email,
  onSend,
  onRecheck,
}: {
  email: string | null;
  onSend: () => Promise<void>;
  onRecheck: () => Promise<boolean>;
}) {
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [stillUnverified, setStillUnverified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    setStillUnverified(false);
    try {
      await onSend();
      setSent(true);
    } catch {
      // Firebase membatasi pengiriman berulang — itu bukan kerusakan.
      setError('Belum bisa mengirim ulang sekarang. Tunggu sebentar lalu coba lagi ya.');
    } finally {
      setSending(false);
    }
  }

  async function handleRecheck() {
    setChecking(true);
    setError(null);
    try {
      const verified = await onRecheck();
      // Kalau sudah terverifikasi, `refreshUser` memicu render ulang dan
      // halaman ini menghilang dengan sendirinya.
      if (!verified) setStillUnverified(true);
    } catch {
      setError('Tidak bisa memeriksa sekarang. Periksa koneksi internetnya ya.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 440 }}>
      <Link className="back-link" to="/portal">
        <ArrowLeftIcon /> Kembali
      </Link>
      <h1>Verifikasi email dulu ya</h1>
      <p style={{ fontSize: 17 }}>
        Kami sudah mengirim tautan verifikasi ke
        {email ? (
          <>
            {' '}
            {/* Alamat email tidak punya spasi, jadi tanpa ini ia menolak
                turun baris dan meluber keluar layar — terukur 35px di HP.
                `anywhere` hanya memotong kalau memang tidak muat, jadi
                alamat yang pendek tetap utuh dalam satu baris. Dipasang di
                <strong>-nya saja supaya kalimat di sekelilingnya tetap
                memotong di spasi seperti biasa. */}
            <strong style={{ overflowWrap: 'anywhere' }}>{email}</strong>
          </>
        ) : (
          ' alamat email akun ini'
        )}
        . Buka email itu, ketuk tautannya, lalu kembali ke sini.
      </p>
      <p
        style={{
          background: '#fff3cd',
          padding: 12,
          borderRadius: 14,
          fontSize: 15.5,
        }}
      >
        Ini dilakukan sekali saja, dan gunanya melindungi pembelian Anda: kalau emailnya salah
        ketik, kode yang sudah ditukar tidak bisa dipulihkan lagi.{' '}
        <strong>Periksa juga folder spam.</strong>
      </p>
      {sent && (
        <p style={{ color: '#2d7a2d', fontWeight: 700 }}>Tautan verifikasi sudah dikirim ulang.</p>
      )}
      {stillUnverified && (
        <p style={{ color: '#c0392b' }}>
          Belum terverifikasi. Pastikan tautannya sudah diketuk, lalu coba periksa lagi.
        </p>
      )}
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => void handleRecheck()}
          disabled={checking}
        >
          {checking ? 'Memeriksa…' : '✅ Saya sudah verifikasi'}
        </button>
        <button className="btn" type="button" onClick={() => void handleSend()} disabled={sending}>
          {sending ? 'Mengirim…' : '📧 Kirim ulang emailnya'}
        </button>
        {/* Menunggu email TIDAK boleh berarti menunggu untuk bermain. */}
        <Link className="btn" to="/portal">
          🎮 Main dulu yang gratis
        </Link>
      </div>
    </div>
  );
}
