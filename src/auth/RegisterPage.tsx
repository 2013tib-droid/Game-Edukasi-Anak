import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export default function RegisterPage() {
  const { register, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter ya.');
      return;
    }
    setBusy(true);
    try {
      await register(email, password);
      // New accounts go straight to code activation.
      navigate('/aktivasi', { replace: true });
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <h1>Daftar Akun Orang Tua</h1>
      {!configured && (
        <p style={{ background: '#fff3cd', padding: 12, borderRadius: 12 }}>
          ⚠️ Firebase belum dikonfigurasi (.env kosong). Pendaftaran belum aktif.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Kata sandi (min. 8 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
      <p>
        Sudah punya akun? <Link to="/masuk">Masuk di sini</Link>
      </p>
    </div>
  );
}
