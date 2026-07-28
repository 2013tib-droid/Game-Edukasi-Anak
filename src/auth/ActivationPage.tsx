import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/app/icons';
import { useAuth } from '@/auth/AuthContext';
import { redeemActivationCode, type AccessError } from '@/auth/access';

const GROUP_LABEL: Record<string, string> = {
  tk: 'TK (5–7 tahun)',
  sd1: 'SD Awal (kelas 1–2)',
};

/**
 * Parent-facing redemption screen. All validation is server-side; this only
 * normalizes what is typed and reports back what the function said.
 */
export default function ActivationPage() {
  const { configured, refreshAccess } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await redeemActivationCode(code.trim());
      const label = GROUP_LABEL[result.group] ?? result.group;
      setSuccess(
        result.alreadyOwned
          ? `Akun ini memang sudah punya akses ${label}. Selamat bermain!`
          : `Berhasil! Semua game ${label} sudah terbuka.`,
      );
      setCode('');
      // Pull the new group list so the portal unlocks without a reload.
      await refreshAccess().catch(() => {});
    } catch (err) {
      setError((err as AccessError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/portal">
        <ArrowLeftIcon /> Kembali
      </Link>
      <h1>Masukkan Kode Aktivasi</h1>
      <p>Kode dikirim setelah pembelian di Lynk.id / Mayar.id.</p>

      {!configured && (
        <p role="status">
          Server belum dikonfigurasi, jadi kode belum bisa divalidasi di perangkat ini.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input
          className="input"
          placeholder="Contoh: TK-ACDE-FGHJ"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={busy || !configured}
          required
        />
        {error && (
          <p role="alert" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}
        {success && (
          <p role="status" style={{ color: '#1e8449' }}>
            ✅ {success}
          </p>
        )}
        <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Memeriksa…' : 'Aktifkan'}
        </button>
      </form>

      {success && (
        <Link className="btn" to="/portal" style={{ marginTop: 16 }}>
          🎮 Mulai Bermain
        </Link>
      )}
    </div>
  );
}
