import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import groupsData from '@/data/groups.json';
import { isFirebaseConfigured } from '@/auth/firebase';
import { errorMessage, redeemActivationCode } from '@/auth/entitlements';

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
 */
export default function ActivationPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ group: string; already: boolean } | null>(null);

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

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/portal">
        <ArrowLeftIcon /> Kembali
      </Link>
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
