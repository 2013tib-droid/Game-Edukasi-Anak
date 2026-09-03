import { Link } from 'react-router-dom';
import FeedbackSection from '@/portal/FeedbackSection';
import TopBar from '@/portal/TopBar';
import GameIcon from '@/engine/ui/GameIcon';
import { findGame } from '@/games/registry';
import './landing.css';

const logo = `${import.meta.env.BASE_URL}assets/logo.svg`;

/**
 * A taste of both groups — the first row is Playgroup & TK, the second is
 * SD Kelas 1 & 2. Both groups are on sale, so neither may be the only one
 * shown here.
 *
 * `id` menunjuk `src/games/registry.ts`: GAMBAR dan NAMA-nya diambil dari
 * sana, sumber yang sama dengan kartu portal & layar intro. Jangan menyalin
 * nama file seni atau judul ke sini — ikon yang ditulis di dua tempat pernah
 * menyimpang sampai seminggu (CLAUDE.md, 2026-08-09).
 *
 * `emoji` di sini SENGAJA lokal: itu cuma cadangan kalau file seninya gagal
 * dimuat, dan beberapa di antaranya ditera khusus untuk tampil sebagai emoji
 * telanjang di lingkaran pastel — Jam Pintar memakai ⏰ (jam weker), BUKAN
 * 🕒 milik registry yang di HP tampil seperti piringan abu-abu polos.
 */
const worlds = [
  { cls: 'w-forest', id: 'hutan-hewan', emoji: '🦁' },
  { cls: 'w-space', id: 'taman-huruf', emoji: '🏕️' },
  { cls: 'w-color', id: 'labirin-warna', emoji: '🎨' },
  { cls: 'w-fruit', id: 'pasar-buah', emoji: '🍉' },
  { cls: 'w-count', id: 'hitung-hebat', emoji: '🔢' },
  { cls: 'w-spell', id: 'ejaan-jitu', emoji: '✏️' },
  { cls: 'w-clock', id: 'jam-pintar', emoji: '⏰' },
  { cls: 'w-story', id: 'cerita-kancil', emoji: '📖' },
];

/**
 * Groups still in production. Listed WITHOUT a price on purpose — nothing here
 * is for sale yet, so a number (even struck through) would read as an offer.
 *
 * Owner's call (2026-08-07): the name reads "Kelompok SD Kelas 3 & 4", matching
 * the price cards above, and the description carries the subjects ONLY — no age
 * and no per-card "Segera Hadir" badge, since the section heading already says
 * it. This is deliberately different from `groups.json`, where the age does lead
 * the description.
 */
const soonGroups = [
  { name: 'Kelompok SD Kelas 3 & 4', desc: 'Perkalian, pembagian, membaca cerita' },
  { name: 'Kelompok SD Kelas 5 & 6', desc: 'Pecahan, bangun ruang, soal cerita' },
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
          {worlds.map((w) => {
            const meta = findGame(w.id);
            return (
              <li key={w.id} className="world">
                <span className={`world-disc ${w.cls}`} aria-hidden="true">
                  <GameIcon
                    pic={meta?.pic}
                    emoji={w.emoji}
                    className="world-art"
                    fallbackClassName="world-emoji"
                  />
                </span>
                <span className="world-name">{meta?.title ?? w.id}</span>
              </li>
            );
          })}
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

        <div className="pcard">
          <div className="pc-name">Kelompok SD Kelas 1 &amp; 2</div>
          <div className="pc-row">
            <span className="pc-was">Rp49.000</span>
            <span className="pc-now">Rp29.000</span>
            <span className="pc-off">−40%</span>
          </div>
          <div className="pc-sub">
            Buka semua game SD Kelas 1 &amp; 2 · sekali bayar, main selamanya
          </div>
        </div>
      </div>

      <section className="soon">
        <h2 className="soon-title">Segera hadir</h2>
        <ul className="soon-list">
          {soonGroups.map((g) => (
            <li key={g.name} className="soon-item">
              <span className="soon-name">{g.name}</span>
              <span className="soon-desc">{g.desc}</span>
            </li>
          ))}
        </ul>
      </section>

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

      <FeedbackSection />

      <footer>Tanpa iklan · Aman untuk anak</footer>
      </div>
    </>
  );
}
