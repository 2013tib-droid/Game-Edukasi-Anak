import { Link } from 'react-router-dom';
import gamesData from '../data/games.json';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ParentAreaPage() {
  const { user, hasAccess, logout, isFirebaseConfigured } = useAuth();

  return (
    <section className="page">
      <h1 className="page-title">Area Orang Tua</h1>

      {!isFirebaseConfigured && (
        <p className="page-text placeholder-note">
          ⚙️ Firebase belum dikonfigurasi — akun &amp; pembelian belum aktif.
          Salin <code>.env.example</code> menjadi <code>.env</code> dan isi
          kredensial dari Firebase Console.
        </p>
      )}

      {isFirebaseConfigured && !user && (
        <div className="parent-section">
          <p className="page-text">Masuk atau daftar untuk mengelola pembelian.</p>
          <Link to="/masuk" className="btn btn-primary">Masuk</Link>
          <Link to="/daftar" className="btn btn-ghost">Daftar</Link>
        </div>
      )}

      {user && (
        <div className="parent-section">
          <p className="page-text">Masuk sebagai <strong>{user.email}</strong></p>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Keluar
          </button>
        </div>
      )}

      <h2 className="section-title">Paket</h2>
      <div className="package-list">
        {gamesData.groups.map((group) => {
          const owned = hasAccess(group.id);
          return (
            <div key={group.id} className="package-card">
              <div className="package-info">
                <span className="package-title">
                  {group.emoji} {group.title} <small>({group.subtitle})</small>
                </span>
                <span className="package-price">
                  {owned ? '✅ Sudah dimiliki' : `Rp${group.price.toLocaleString('id-ID')} — sekali bayar`}
                </span>
              </div>
              {!owned && (
                <button type="button" className="btn btn-primary" disabled>
                  Beli (segera)
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="page-text placeholder-note">
        💳 Pembayaran QRIS &amp; kode aktivasi/referral hadir di Fase 5.
        Tombol Beli akan aktif setelah payment gateway terpasang.
      </p>
    </section>
  );
}
