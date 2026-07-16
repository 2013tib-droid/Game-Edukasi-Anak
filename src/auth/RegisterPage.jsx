import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan masuk.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/weak-password': 'Kata sandi terlalu pendek (minimal 6 karakter).',
};

export default function RegisterPage() {
  const { register, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setBusy(true);
    try {
      await register(email.trim(), password);
      navigate('/orangtua');
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Gagal mendaftar. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <section className="page">
        <h1 className="page-title">Daftar</h1>
        <p className="page-text">
          Pendaftaran belum aktif — Firebase belum dikonfigurasi (lihat <code>.env.example</code>).
        </p>
        <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1 className="page-title">Daftar Akun</h1>
      <form onSubmit={submit} className="auth-form">
        <label className="field">
          Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          Kata sandi
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label className="field">
          Ulangi kata sandi
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
      <p className="page-text">
        Sudah punya akun? <Link to="/masuk">Masuk di sini</Link>
      </p>
    </section>
  );
}
