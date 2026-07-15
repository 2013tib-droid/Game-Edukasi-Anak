import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../app/Layout';
import { useAuth } from './AuthContext';

// Phase 1 stub: the real flow calls the `redeemActivationCode` Cloud Function
// (Phase 5), which validates the code server-side and writes users/{uid}.access.
export default function ActivationPage() {
  const { user, loading } = useAuth();
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout backTo="/orang-tua" title="Kode Aktivasi">
      {loading ? (
        <p>Memuat akun…</p>
      ) : !user ? (
        <div className="card">
          <p>Masuk dulu sebelum memasukkan kode aktivasi, ya.</p>
          <Link className="btn" to="/masuk">
            Masuk
          </Link>
        </div>
      ) : (
        <form className="card" onSubmit={submit}>
          <p>
            Masukkan kode aktivasi yang Anda terima setelah pembelian di Lynk.id /
            Mayar.id.
          </p>
          <label className="field">
            <span>Kode Aktivasi</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="contoh: TK-AB12-CD34"
              required
            />
          </label>
          {submitted && (
            <p className="notice">
              🚧 Validasi kode akan aktif pada Fase 5 (Cloud Function). Kode Anda belum
              diproses.
            </p>
          )}
          <button className="btn" type="submit">
            Aktifkan
          </button>
        </form>
      )}
    </Layout>
  );
}
