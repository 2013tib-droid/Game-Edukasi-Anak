import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Layout from '../app/Layout';
import { auth, firebaseReady } from '../firebase';

function describeAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau kata sandi salah.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    default:
      return 'Gagal masuk. Periksa koneksi internet lalu coba lagi.';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/orang-tua');
    } catch (err: unknown) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : '';
      setError(describeAuthError(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout backTo="/orang-tua" title="Masuk">
      {!firebaseReady && (
        <p className="notice">⚙️ Firebase belum dikonfigurasi — login belum bisa dipakai.</p>
      )}
      <form className="card" onSubmit={submit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>Kata Sandi</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !firebaseReady}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
        <p style={{ textAlign: 'center' }}>
          Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
        </p>
      </form>
    </Layout>
  );
}
