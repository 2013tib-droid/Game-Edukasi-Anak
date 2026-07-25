import { Link } from 'react-router-dom';
import TopBar from '@/portal/TopBar';
import './landing.css';

const logo = `${import.meta.env.BASE_URL}assets/logo.svg`;

const worlds = [
  { cls: 'w-forest', emoji: '🦁', name: 'Hutan Hewan' },
  { cls: 'w-space', emoji: '🏕️', name: 'Taman Huruf' },
  { cls: 'w-rainbow', emoji: '🌈', name: 'Istana Pelangi' },
  { cls: 'w-fruit', emoji: '🍉', name: 'Pasar Buah' },
];

/** Parent-facing questions, ordered by what a first-time visitor asks first. */
const faqs = [
  {
    q: 'Bisa dicoba dulu sebelum bayar?',
    a: 'Bisa. Ketuk "Main Sekarang" — ada beberapa game yang gratis dimainkan penuh tanpa perlu daftar atau login.',
  },
  {
    q: 'Bayarnya sekali atau langganan?',
    a: 'Sekali bayar untuk satu kelompok, lalu bisa dimainkan selamanya. Tidak ada tagihan bulanan. Perbaikan bug selalu gratis; kalau nanti ada paket konten besar yang baru, itu ekspansi terpisah dan sifatnya opsional.',
  },
  {
    q: 'Main di HP atau tablet?',
    a: 'Keduanya. Dibuka lewat browser di HP Android atau tablet — tidak perlu instal aplikasi, tidak makan memori HP. Tampilannya menyesuaikan posisi tegak maupun mendatar.',
  },
  {
    q: 'Satu akun bisa dipakai di berapa perangkat?',
    a: 'Sampai 3 perangkat. Cukup masuk dengan akun yang sama di perangkat lain, jadi anak bisa main bergantian di perangkat mana pun di rumah tanpa perlu beli ulang.',
  },
  {
    q: 'Setelah bayar, bagaimana cara membukanya?',
    a: 'Anda menerima kode aktivasi dari halaman pembelian. Daftar akun di portal, masukkan kode itu sekali, dan semua game kelompok tersebut langsung terbuka untuk akun Anda.',
  },
];

/**
 * Front door — kept intentionally simple: one clean hero with a single main
 * action, then the reassurance parents ask for (worlds, price, FAQ). The
 * playable portal and the parent login live one tap away.
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

      <section className="worlds">
        <h2 className="worlds-title">Petualangan seru menanti</h2>
        <ul className="world-list">
          {worlds.map((w) => (
            <li key={w.name} className="world">
              <span className={`world-disc ${w.cls}`} aria-hidden="true">
                {w.emoji}
              </span>
              <span className="world-name">{w.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="prices">
        <div className="pcard">
          <div className="pc-name">Kelompok Playgroup dan TK</div>
          <div className="pc-row">
            <span className="pc-was">Rp39.000</span>
            <span className="pc-now">Rp19.000</span>
            <span className="pc-off">−50%</span>
          </div>
          <div className="pc-sub">
            Buka semua game Playgroup &amp; TK · sekali bayar, main selamanya
          </div>
        </div>

        <div className="pcard pcard--soon">
          <span className="pc-badge pc-badge--soon">🚀 Segera Hadir</span>
          <div className="pc-name">Kelompok SD Awal · Kelas 1–2</div>
          <div className="pc-row">
            <span className="pc-now pc-now--soon">Rp49.000</span>
          </div>
          <div className="pc-sub">Soal lebih menantang — menyusul!</div>
        </div>
      </div>

      <section className="faq">
        <h2 className="faq-title">Pertanyaan yang sering ditanya</h2>
        {faqs.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>
              <span className="faq-q">{f.q}</span>
              <span className="faq-mark" aria-hidden="true" />
            </summary>
            <p className="faq-a">{f.a}</p>
          </details>
        ))}
      </section>

      <footer>Tanpa iklan · Aman untuk anak</footer>
      </div>
    </>
  );
}
