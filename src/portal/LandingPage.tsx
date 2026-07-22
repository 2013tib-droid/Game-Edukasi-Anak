import { Link } from 'react-router-dom';
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
    <div className="landing">
      <Link className="parent-btn" to="/masuk">
        <span className="parent-btn__ic" aria-hidden>
          👤
        </span>
        Orang Tua
      </Link>

      <img className="logo" src={logo} alt="" width={112} height={112} />
      <h1>Petualangan Pintar</h1>
      <p className="tag">Main sambil belajar — dipandu suara Bahasa Indonesia 🎈</p>

      <Link className="cta" to="/portal">
        🎮 Main Sekarang
      </Link>

      <div className="pricecard">
        <span className="pc-tag">🎉 Harga Perkenalan</span>
        <div className="pc-row">
          <span className="pc-was">Rp39.000</span>
          <span className="pc-now">Rp15.000</span>
          <span className="pc-off">−60%</span>
        </div>
        <span className="pc-sub">Buka semua game TK · sekali bayar, main selamanya</span>
      </div>

      <div className="worlds" aria-hidden="true">
        {worlds.map((w) => (
          <div key={w.name} className={`chip ${w.cls}`}>
            <span className="ce">{w.emoji}</span>
            <span className="cn">{w.name}</span>
          </div>
        ))}
      </div>

      <footer>Tanpa iklan · Aman untuk anak</footer>
    </div>
  );
}
