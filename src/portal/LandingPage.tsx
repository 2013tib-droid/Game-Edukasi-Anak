import { Link } from 'react-router-dom';
import TopBar from '@/portal/TopBar';
import './landing.css';

const logo = `${import.meta.env.BASE_URL}assets/logo.svg`;

const worlds = [
  { cls: 'w-forest', emoji: '🦁', name: 'Hutan Hewan' },
  { cls: 'w-space', emoji: '🏕️', name: 'Taman Huruf' },
  { cls: 'w-ocean', emoji: '🐠', name: 'Bawah Laut' },
  { cls: 'w-fruit', emoji: '🍉', name: 'Pasar Buah' },
];

/**
 * Front door — kept intentionally simple: one clean hero with a single main
 * action. The playable portal (group picker + games) and the parent login
 * live one tap away. No walls of text.
 */
export default function LandingPage() {
  return (
    <>
      <TopBar accountTo="/masuk" accountLabel="Orang Tua" />
      <div className="landing">
        <img className="logo" src={logo} alt="" width={112} height={112} />
      <h1>Petualangan Pintar</h1>
      <p className="tag">Main sambil belajar — dipandu suara Bahasa Indonesia 🎈</p>

      <Link className="cta" to="/portal">
        🎮 Main Sekarang
      </Link>

      <div className="worlds" aria-hidden="true">
        {worlds.map((w) => (
          <div key={w.name} className={`chip ${w.cls}`}>
            <span className="ce">{w.emoji}</span>
            <span className="cn">{w.name}</span>
          </div>
        ))}
      </div>

      <div className="prices">
        <div className="pcard">
          <span className="pc-badge">🎉 Harga Perkenalan</span>
          <div className="pc-name">Kelompok TK · 5–7 tahun</div>
          <div className="pc-row">
            <span className="pc-was">Rp39.000</span>
            <span className="pc-now">Rp19.000</span>
            <span className="pc-off">−50%</span>
          </div>
          <div className="pc-sub">Buka semua game TK · sekali bayar, main selamanya</div>
        </div>

        <div className="pcard pcard--soon">
          <span className="pc-badge pc-badge--soon">🚀 Segera Hadir</span>
          <div className="pc-name">Kelompok SD Awal · Kelas 1–2</div>
          <div className="pc-row">
            <span className="pc-now pc-now--soon">Rp39.000</span>
          </div>
          <div className="pc-sub">Soal lebih menantang — menyusul!</div>
        </div>
      </div>

      <footer>Tanpa iklan · Aman untuk anak</footer>
      </div>
    </>
  );
}
