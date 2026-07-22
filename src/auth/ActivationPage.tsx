import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

// Phase 5 will wire this to the `redeemActivationCode` Cloud Function.
// For now it is a working form with the final UX copy.
export default function ActivationPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO(fase-5): call httpsCallable(functions, 'redeemActivationCode')({ code })
    setMessage('Validasi kode belum aktif — menunggu Cloud Function (Fase 5).');
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <Link className="back-link" to="/portal">
        <span aria-hidden>⬅️</span> Kembali
      </Link>
      <h1>Masukkan Kode Aktivasi</h1>
      <p>Kode dikirim setelah pembelian di Lynk.id / Mayar.id.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input
          className="input"
          placeholder="Contoh: TK-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          required
        />
        {message && <p>{message}</p>}
        <button className="btn btn--primary" type="submit">
          Aktifkan
        </button>
      </form>
    </div>
  );
}
