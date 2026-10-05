import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedbackSection from '@/portal/FeedbackSection';
import TopBar from '@/portal/TopBar';
import GameIcon from '@/engine/ui/GameIcon';
import { findGame } from '@/games/registry';
import { countVisit } from '@/portal/stats';
import { BuyButton } from '@/portal/BuyButton';
import { useOwnedGroups } from '@/portal/useAccess';
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
 * Game art floating around the logo in the hero — the first thing a parent
 * sees, so it shows the product's art instead of describing it. Deliberately
 * DIFFERENT games from `worlds` below so the two rows don't repeat each other.
 * Art comes from the registry (same rule as `worlds`); emoji is only a fallback.
 */
const floaters = [
  { cls: 'f1', id: 'puzzle-gambar', emoji: '🧩' },
  { cls: 'f2', id: 'tulis-huruf', emoji: '✏️' },
  { cls: 'f3', id: 'kartu-kembar', emoji: '🃏' },
  { cls: 'f4', id: 'jalan-kendaraan', emoji: '🚗' },
  { cls: 'f5', id: 'kenal-huruf', emoji: '🔤' },
  { cls: 'f6', id: 'anggota-tubuh', emoji: '🧒' },
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
    a: 'Bisa. Ketuk "Coba Gratis" — ada beberapa game yang gratis dimainkan penuh tanpa perlu daftar atau login.',
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
  const owned = useOwnedGroups();
  // Penghitung seadanya — HANYA di halaman ini. Jangan pernah dipasang di
  // area anak; lihat aturan di `src/portal/stats.ts`.
  useEffect(() => {
    countVisit('landing_view');
  }, []);

  return (
    <>
      <TopBar account />
      <div className="landing">
        <section className="hero">
          <div className="hero-stage">
            <span className="hero-glow" aria-hidden="true" />
            {floaters.map((f) => {
              const meta = findGame(f.id);
              return (
                <span key={f.id} className={`floater ${f.cls}`} aria-hidden="true">
                  <GameIcon
                    pic={meta?.pic}
                    emoji={f.emoji}
                    className="floater-art"
                    fallbackClassName="floater-emoji"
                  />
                </span>
              );
            })}
            <img className="logo" src={logo} alt="" width={128} height={128} />
          </div>

          <span className="hero-eyebrow">Untuk anak Playgroup, TK &amp; SD</span>
          <h1>Petualangan Pintar</h1>
          <p className="tag">Belajar jadi menyenangkan, tanpa terasa seperti belajar.</p>

          <Link className="cta" to="/portal" onClick={() => countVisit('landing_main_click')}>
            <span className="cta-spark cta-spark--l" aria-hidden="true" />
            <span className="cta-spark cta-spark--r" aria-hidden="true" />
            <svg className="cta-star" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M50 6 61.8 33.6 92 36.4 69.2 56.4 76 86 50 70.4 24 86 30.8 56.4 8 36.4 38.2 33.6Z"
                fill="#ffcf3f"
                stroke="#f29a1f"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path d="M30 34 40 31" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7" />
              <circle cx="40" cy="50" r="4.5" fill="#4a2a14" />
              <path d="M56 50q4.5-4 9 0" fill="none" stroke="#4a2a14" strokeWidth="4" strokeLinecap="round" />
              <path d="M42 59q8 8 16 0" fill="#e35d4a" stroke="#4a2a14" strokeWidth="3.5" strokeLinejoin="round" />
              <circle cx="31" cy="58" r="5" fill="#ff8fa0" opacity=".6" />
              <circle cx="69" cy="58" r="5" fill="#ff8fa0" opacity=".6" />
            </svg>
            <span className="cta-label">Coba Gratis</span>
            <span className="cta-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h13M12.5 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>

          <ul className="perks">
            <li>
              <span aria-hidden="true">🔊</span> Dipandu suara
            </li>
            <li>
              <span aria-hidden="true">🛡️</span> Tanpa iklan
            </li>
            <li>
              <span aria-hidden="true">💛</span> Sekali bayar
            </li>
          </ul>
        </section>

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
          <BuyButton group="tk" owned={owned.includes('tk')} />
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
          <BuyButton group="sd1" owned={owned.includes('sd1')} />
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

      <footer className="lfoot">
        <div className="lfoot-links">
          {/* Wajib ada sebelum berjualan: app ini mengumpulkan email & kata
              sandi, sasarannya anak, dan platform penjualan lazim memintanya.
              Ditaut di KAKI LANDING (halaman orang tua) — bukan di area anak. */}
          <Link to="/privasi">Kebijakan Privasi</Link>
          <span aria-hidden="true">·</span>
          <Link to="/ketentuan">Syarat &amp; Ketentuan</Link>
          <span aria-hidden="true">·</span>
          <Link to="/ketentuan">Pengembalian Dana</Link>
        </div>
        <div>Tanpa iklan · Aman untuk anak</div>
      </footer>
      </div>
    </>
  );
}
