import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import groupsData from '@/data/groups.json';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import { errorMessage, fetchOwnedGroups, redeemActivationCode } from '@/auth/entitlements';
import { emailUrl, whatsappUrl } from '@/data/contact';
import { buyUrl, type SaleGroup } from '@/data/purchase';
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
      {/* Kembali & Keluar berbagi satu baris di atas — dua-duanya "pergi dari
          layar ini", dan yang penting: alamat email di bawahnya jadi dapat
          SELEBAR kartu. Waktu tombol Keluar masih duduk di sebelahnya, alamat
          pemilik sendiri patah di tengah kata ("2013.tib@gma / il.com") di HP
          320px. */}
      <div className="act-top">
        <Link className="back-link" to="/portal">
          <ArrowLeftIcon /> Kembali
        </Link>
        {isFirebaseConfigured && user && (
          <button className="back-link act-out" type="button" onClick={handleLogout}>
            Keluar
          </button>
        )}
      </div>
      <AccountPanel email={user?.email ?? null} owned={owned} />
      <section className="act-card">
        <div className="act-badge" aria-hidden>
          <KeyIcon />
        </div>
        <h1 className="act-title">Masukkan Kode Aktivasi</h1>
        <p className="act-sub">
          Kodenya dikirim ke email Anda setelah membayar di <strong>Mayar.id</strong>.
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
      <BuyLine owned={owned} />
      <HelpLine />
    </div>
  );
}

/**
 * "Belum punya kode?" — satu-satunya jalan ke checkout bagi orang tua yang
 * datang dari layar gembok game (layar itu di area anak, jadi ia menaut ke
 * sini, bukan langsung ke Mayar). Link dari `src/data/purchase.ts`; kelompok
 * yang linknya kosong tidak ditampilkan.
 *
 * Kelompok yang SUDAH dimiliki akun ini ikut disembunyikan: menawarkan beli
 * lagi sesuatu yang baru saja tertulis "Sudah aktif" di atasnya terbaca
 * seperti aktivasinya tidak tersimpan. Kalau semuanya sudah dimiliki (atau
 * semua link kosong), bagian ini hilang.
 *
 * Tampilannya sengaja lebih ringan dari kartu kode di atasnya (latar setengah
 * bening, tanpa bayangan terangkat): tombol "Aktifkan" tetap yang utama.
 */
function BuyLine({ owned }: { owned: string[] | null }) {
  const links = groupsData.groups
    .filter((g): g is typeof g & { id: SaleGroup } => g.id === 'tk' || g.id === 'sd1')
    .filter((g) => !owned?.includes(g.id))
    .map((g) => ({ ...g, url: buyUrl(g.id) }))
    .filter((g) => g.url !== null);
  if (links.length === 0) return null;
  return (
    <section className="act-buy" aria-labelledby="act-buy-title">
      <h2 className="act-buy__title" id="act-buy-title">
        Belum punya kode?
      </h2>
      <p className="act-buy__lead">Bayar di Mayar.id, kodenya langsung masuk ke email.</p>
      <ul className="act-buy__list">
        {links.map((g) => (
          <li key={g.id}>
            <a className="act-buy__item" href={g.url!} target="_blank" rel="noopener noreferrer">
              <span className="act-buy__pic" aria-hidden>
                <BuyPic pic={g.pic} emoji={g.emoji} />
              </span>
              <span className="act-buy__text">
                <span className="act-buy__name">{g.title}</span>
                <span className="act-buy__price">{g.priceLabel}</span>
              </span>
              <span className="act-buy__cta">Beli</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Gambar kelompok (sama dengan kartu portal), emoji sebagai cadangan. */
function BuyPic({ pic, emoji }: { pic?: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (!pic || failed) return <span className="act-buy__emoji">{emoji}</span>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/groups/${pic}.webp`}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Jalan keluar ke manusia, tepat di layar tempat orang tua paling mungkin
 * mentok (kode ditolak, kode sudah dipakai, salah akun). Nomor & alamatnya
 * dari `src/data/contact.ts` — satu sumber yang sama dengan kaki landing, jadi
 * tidak pernah ada dua nomor berbeda di app ini.
 *
 * Chip-nya meniru `.fb-btn` di kaki landing (putih, bingkai tipis, warna merek
 * hanya di ikon) supaya "hubungi kami" terlihat sama di seluruh area orang tua.
 *
 * Tidak dirender sama sekali kalau kontaknya kosong, jadi build setengah jadi
 * tak pernah menampilkan tautan mati. JANGAN pasang di layar anak.
 */
function HelpLine() {
  const wa = whatsappUrl();
  const mail = emailUrl();
  if (!wa && !mail) return null;
  return (
    <div className="act-contact">
      <span className="act-contact__label">Kodenya tidak bisa dipakai?</span>
      <span className="act-contact__chips">
        {wa && (
          <a className="act-chip act-chip--wa" href={wa} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.45 5.2L2 22l5.1-1.6a9.8 9.8 0 0 0 4.94 1.32c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2zm5.7 13.9c-.24.68-1.4 1.3-1.94 1.34-.5.05-.98.22-3.3-.7-2.78-1.1-4.54-3.94-4.68-4.12-.13-.18-1.12-1.5-1.12-2.85s.7-2.02.96-2.3c.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12.07.14.12.3.02.48-.1.18-.15.3-.3.46l-.43.5c-.14.14-.29.3-.12.58.17.29.75 1.23 1.6 2 1.11.98 2.04 1.29 2.33 1.43.29.15.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.09 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.68-.17 1.35z" />
            </svg>
            WhatsApp
          </a>
        )}
        {mail && (
          <a className="act-chip act-chip--mail" href={mail}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
            Email
          </a>
        )}
      </span>
    </div>
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
function AccountPanel({ email, owned }: { email: string | null; owned: string[] | null }) {
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
