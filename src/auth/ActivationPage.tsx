import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import groupsData from '@/data/groups.json';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import { errorMessage, fetchOwnedGroups, redeemActivationCode } from '@/auth/entitlements';
import { emailUrl, whatsappUrl } from '@/data/contact';
import './activation.css';

/**
 * Menyisipkan tanda hubungnya sendiri, supaya orang tua cukup mengetik huruf
 * dan angkanya (permintaan pemilik 2026-09-22). Kode sekarang enam karakter,
 * dicetak sebagai K7P-M4X.
 *
 * YANG LEBIH DARI ENAM KARAKTER SENGAJA DIBIARKAN APA ADANYA, tanpa tanda
 * hubung: kode format lama (TK-ABCD-2345, sepuluh karakter) masih sah di
 * server, dan aturan "hubung tiap tiga" akan menampilkannya jadi
 * TKA-BCD-234-5 — terbaca seperti kode yang salah ketik. Dan JANGAN PERNAH
 * memotong kelebihannya: kolom yang menolak kode lama berarti pembeli mentok
 * padahal sudah membayar.
 *
 * Pemisahnya murni tampilan; server membuang semua pemisah sebelum
 * mencocokkan (`normalizeCode` di functions/src/index.ts).
 */
export function formatCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length > 6) return clean;
  return clean.length > 3 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
}

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
      <div className="page act act--center">
        <section className="act-card">
          <div className="act-badge act-badge--ok" aria-hidden>
            <CheckIcon />
          </div>
          <h1 className="act-title">{done.already ? 'Sudah aktif!' : 'Berhasil!'}</h1>
          <p className="act-done-group">{groupTitle(done.group)}</p>
          <p className="act-sub" style={{ marginBottom: 0 }}>
            Semua gamenya sudah terbuka untuk akun ini. Selamat bermain!
          </p>
          <div className="act-actions">
            <Link className="btn btn--primary act-submit" to={`/kelompok/${done.group}`}>
              🎮 Mulai Main
            </Link>
            <Link className="btn act-submit" to="/portal">
              🏠 Beranda
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Email belum terverifikasi: tahan di sini, jangan biarkan kodenya
  // dibakar oleh akun yang emailnya salah ketik.
  if (isFirebaseConfigured && user && !emailVerified) {
    return <VerifyFirst email={user.email} onSend={sendVerification} onRecheck={refreshUser} />;
  }

  return (
    <div className="page act">
      <Link className="back-link" to="/portal">
        <ArrowLeftIcon /> Kembali
      </Link>
      <AccountPanel email={user?.email ?? null} owned={owned} onLogout={handleLogout} />
      <section className="act-card">
        <div className="act-badge" aria-hidden>
          <KeyIcon />
        </div>
        <h1 className="act-title">Masukkan Kode Aktivasi</h1>
        <p className="act-sub">
          Kodenya dikirim setelah pembelian di <strong>Lynk.id</strong> /{' '}
          <strong>Mayar.id</strong>.
        </p>
        {!isFirebaseConfigured && (
          <p className="act-note">
            ⚠️ Firebase belum dikonfigurasi (.env kosong). Aktivasi belum aktif.
          </p>
        )}
        <form onSubmit={handleSubmit} className="act-form">
          <input
            className="input act-input"
            placeholder="K7P-M4X"
            aria-label="Kode aktivasi"
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
          {/* Keterangan "ketik huruf dan angkanya saja" DIHAPUS (keputusan
              pemilik 2026-09-24): contoh di kolomnya sudah menunjukkan
              bentuknya, dan perilakunya memang memaafkan — tanda hubung
              disisipkan sendiri (`formatCode`), huruf kecil & pemisah apa pun
              dibuang server (`normalizeCode`). Kalimat yang menerangkan hal
              yang sudah terjadi sendiri cuma menambah bacaan di layar yang
              orang tuanya sedang buru-buru. Jangan dihidupkan lagi tanpa
              alasan baru. */}
          {error && (
            <p className="act-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="btn btn--primary act-submit"
            type="submit"
            disabled={busy || !isFirebaseConfigured}
          >
            {busy ? 'Memeriksa…' : 'Aktifkan'}
          </button>
        </form>
      </section>
      <HelpLine />
    </div>
  );
}

/**
 * Jalan keluar ke manusia, tepat di layar tempat orang tua paling mungkin
 * mentok (kode ditolak, kode sudah dipakai, salah akun). Nomor & alamatnya
 * dari `src/data/contact.ts` — satu sumber yang sama dengan kaki landing, jadi
 * tidak pernah ada dua nomor berbeda di app ini.
 *
 * Tidak dirender sama sekali kalau kontaknya kosong, jadi build setengah jadi
 * tak pernah menampilkan tautan mati. JANGAN pasang di layar anak.
 */
function HelpLine() {
  const wa = whatsappUrl();
  const mail = emailUrl();
  if (!wa && !mail) return null;
  return (
    <p className="act-help">
      Kodenya tidak bisa dipakai?{' '}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      )}
      {wa && mail && <span className="act-help__dot">·</span>}
      {mail && <a href={mail}>Email</a>}
    </p>
  );
}

/**
 * Kunci yang digambar TEGAK, bukan miring 45°: di lingkaran 74px gagang yang
 * miring berikut giginya terbaca seperti kaca pembesar bersilang (percobaan
 * pertama, terlihat di tangkapan layar). Tegak, siluetnya tak bisa salah baca.
 */
function KeyIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7.4" r="4.4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 11.8V20.2M12 15.2h4M12 18h3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Ikon orang, bukan huruf pertama email: alamat pemilik sendiri berawalan
 * ANGKA ("2013.tib@…"), jadi lingkarannya berisi "2" — terbaca seperti
 * penghitung, bukan identitas. Foto profil Google sengaja tidak dipakai
 * (lihat PrivacyPage), jadi ikon tetap yang paling jujur.
 */
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.9" stroke="currentColor" strokeWidth="2.1" />
      <path
        d="M4.9 20c.7-3.6 3.6-5.6 7.1-5.6s6.4 2 7.1 5.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m4.5 12.5 5 5 10-11"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    <div className="acct">
      <div className="acct__row">
        <span className="acct__avatar" aria-hidden>
          <PersonIcon />
        </span>
        <span className="acct__who">
          <span className="acct__label">Masuk sebagai</span>
          <span className="acct__email">{email ?? 'akun ini'}</span>
        </span>
        <button className="acct__out" type="button" onClick={onLogout}>
          Keluar
        </button>
      </div>
      {owned && owned.length > 0 && (
        <div className="acct__owned">
          {/* Labelnya tetap ada: chip hijau sendirian tidak mengabarkan APA yang
              hijau, dan yang membacanya orang tua yang baru sekali ke sini. */}
          <span className="acct__label">Sudah aktif</span>
          <ul className="acct__groups">
            {owned.map((id) => (
              <li className="acct__chip" key={id}>
                ✅ {groupTitle(id)}
              </li>
            ))}
          </ul>
        </div>
      )}
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
