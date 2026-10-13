import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import FeedbackSection from '@/portal/FeedbackSection';
import TopBar from '@/portal/TopBar';
import HeroGarden from '@/portal/HeroGarden';
import GameIcon from '@/engine/ui/GameIcon';
import { findGame, games } from '@/games/registry';
import { countVisit } from '@/portal/stats';
import { BuyButton } from '@/portal/BuyButton';
import { useOwnedGroups } from '@/portal/useAccess';
import groupsData from '@/data/groups.json';
import { isGroupVisible } from '@/data/access';
import './landing.css';

const logo = `${import.meta.env.BASE_URL}assets/logo.svg`;
/** Anak ayam petualang (maskot tahap 3 berdandan penjelajah, seni pemilik
 *  2026-10-12, dipotong `scripts/cut-soft.py`). Logo jadi cadangannya. */
const hero = `${import.meta.env.BASE_URL}assets/ui/petualang.webp`;

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
 * Groups still in production. Not buyable yet, so no buy button and no price
 * (SD Kelas 5 & 6 has none decided). SD Kelas 3 & 4 left this list on
 * 2026-10-13 — it is a price card above now.
 *
 * Owner's call (2026-08-07): the name reads "Kelompok SD Kelas 5 & 6", matching
 * the price cards above, and the description carries the subjects ONLY — no age
 * and no per-card "Segera Hadir" badge, since the section heading already says
 * it. This is deliberately different from `groups.json`, where the age does lead
 * the description.
 */
const soonGroups: {
  name: string;
  desc: string;
  price?: { was: string; now: string; off: string };
}[] = [
  { name: 'Kelompok SD Kelas 5 & 6', desc: 'Pecahan, bangun ruang, soal cerita' },
];

/** Jumlah game di kelompok yang TAMPIL di portal — dihitung, tidak pernah
 *  diketik, jadi angkanya tak bisa ketinggalan katalog (permintaan pemilik
 *  2026-10-12: "sekarang sudah lebih banyak"). Kelompok `draft` (sd2, sd3)
 *  ikut terhitung di build development, tapi TIDAK di produksi: di sana
 *  belum bisa dibeli, jadi angkanya otomatis naik begitu `draft` dilepas. */
const visibleGroups = new Set(groupsData.groups.filter(isGroupVisible).map((g) => g.id));
const gamesOnSale = games.filter((g) => visibleGroups.has(g.group)).length;

/**
 * "Setelah bermain, anak belajar…" — what the games train, in parents' words
 * (from the ChatGPT landing mockup the owner sent, 2026-10-11). Art comes from
 * the registry like `worlds`; the games picked here are ones NOT already shown
 * in `worlds`, except Hitung Hebat (no other on-sale art reads as "numbers").
 * Deliberately no brain emoji: the owner rejected 🧠 as a game icon
 * (CLAUDE.md, 2026-08-02).
 */
const skills = [
  { id: 'kenal-huruf', emoji: '🔤', label: 'Mengenal huruf', cls: 's-a' },
  { id: 'tangga-membaca', emoji: '📖', label: 'Belajar membaca', cls: 's-b' },
  { id: 'tulis-angka', emoji: '✏️', label: 'Belajar menulis', cls: 's-c' },
  { id: 'hitung-hebat', emoji: '🔢', label: 'Berhitung', cls: 's-d' },
  { id: 'pola-pintar', emoji: '🐛', label: 'Pola & logika', cls: 's-e' },
  { id: 'pasangan-pintar', emoji: '🤝', label: 'Ingatan & fokus', cls: 's-f' },
];

/**
 * "Kenapa orang tua memilih" — every line must be TRUE of the app as it ships.
 * The mockup also listed "Bisa offline" (there is no service worker) and
 * "Update gratis" (only bug fixes are free; big new content is a paid
 * expansion) — both left out on purpose. Add a card only if it can be pointed
 * at code that runs.
 *
 * `art` = path under `public/assets/` (owner's art, prompts in
 * `docs/prompt-ikon-alasan.md`); fill it ONLY once the file exists — a missing
 * file is a 404 in the console. `icon` stays the fallback if it fails to load.
 */
const reasons: { icon: string; art?: string; cls: string; title: string; text: string }[] = [
  {
    icon: '🎮',
    art: 'reasons/game-edukatif.webp',
    cls: 'r-a',
    title: `${gamesOnSale} game edukatif`,
    text: 'Game untuk Playgroup, TK, dan Sekolah Dasar.',
  },
  {
    icon: '🔊',
    art: 'reasons/dipandu-suara.webp',
    cls: 'r-b',
    title: 'Dipandu suara',
    text: 'Semua soal dibacakan, cocok untuk yang belum lancar membaca.',
  },
  {
    icon: '🚫',
    art: 'reasons/tanpa-iklan.webp',
    cls: 'r-c',
    title: 'Tanpa iklan',
    text: 'Tanpa iklan & tanpa tautan keluar di area anak.',
  },
  {
    icon: '💪',
    art: 'reasons/salah-itu-boleh.webp',
    cls: 'r-d',
    title: 'Salah itu boleh',
    text: 'Salah dijawab "Coba lagi, kamu pasti bisa!" — tanpa hukuman.',
  },
  {
    icon: '🐣',
    art: 'mascot/mascot-2.webp',
    cls: 'r-e',
    title: 'Teman yang tumbuh',
    text: 'Bintang membuat maskotnya tumbuh dari telur jadi naga.',
  },
  {
    icon: '💛',
    art: 'reasons/sekali-bayar.webp',
    cls: 'r-f',
    title: 'Sekali bayar',
    text: 'Main selamanya, satu akun untuk sampai 3 perangkat.',
  },
];

function ReasonIcon({ icon, art, cls }: { icon: string; art?: string; cls: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={`reason-icon ${cls}`} aria-hidden="true">
      {art && !broken ? (
        <img
          className="reason-img"
          src={`${import.meta.env.BASE_URL}assets/${art}`}
          alt=""
          onError={() => setBroken(true)}
        />
      ) : (
        icon
      )}
    </span>
  );
}

/** Parent-facing questions, ordered by what a first-time visitor asks first. */
const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Bisa dicoba dulu sebelum bayar?',
    a: 'Bisa. Ketuk "Coba Gratis" — tiap kelompok punya satu game yang bisa dimainkan penuh tanpa daftar atau login: Hutan Hewan (Playgroup & TK), Tulis Huruf (SD Kelas 1 & 2), dan Toko Kembalian (SD Kelas 3 & 4).',
  },
  {
    q: 'Untuk usia berapa?',
    a: 'Kelompok Playgroup dan TK untuk usia 4–7 tahun (berhitung, mengenal huruf, warna & bentuk). Kelompok Sekolah Dasar untuk usia 6 tahun ke atas (membaca, menulis, berhitung, logika).',
  },
  {
    q: 'Bayarnya sekali atau langganan?',
    a: 'Sekali bayar untuk satu kelompok, lalu bisa dimainkan selamanya. Tidak ada tagihan bulanan. Perbaikan bug selalu gratis; kalau nanti ada paket konten besar yang baru, itu ekspansi terpisah dan sifatnya opsional.',
  },
  {
    q: 'Bagaimana cara membayarnya?',
    a: 'Ketuk "Beli Sekarang" di kartu harga. Pembayaran lewat halaman Mayar.id, bisa memakai QRIS atau e-wallet.',
  },
  {
    q: 'Setelah bayar, bagaimana cara membukanya?',
    a: 'Kode aktivasi dikirim otomatis ke email Anda. Daftar atau masuk di portal, masukkan kode itu sekali, dan semua game kelompok tersebut langsung terbuka untuk akun Anda.',
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
    q: 'Bisa minta pengembalian dana?',
    a: (
      <>
        Aturannya ada di <Link to="/ketentuan">Syarat &amp; Ketentuan</Link>, bagian
        Pengembalian Dana.
      </>
    ),
  },
];

/** The hero's centrepiece. Falls back to the logo if the art fails to load —
 *  the first screen must never show a hole. */
function HeroMascot() {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return <img className="logo" src={logo} alt="" width={128} height={128} />;
  }
  return (
    <img
      className="hero-mascot"
      src={hero}
      alt=""
      width={305}
      height={400}
      onError={() => setBroken(true)}
    />
  );
}

/**
 * The landing's main action — "Coba Gratis" → portal. Rendered twice (hero and
 * the closing band at the bottom), so it lives in one place; both count as the
 * same `landing_main_click` (the server only accepts a closed list of names).
 */
function TryFreeButton() {
  return (
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
  );
}

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
      <TopBar brand account />
      <div className="landing">
        <section className="hero">
          <HeroGarden />
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
            <HeroMascot />
          </div>

          <span className="hero-eyebrow">Untuk anak Playgroup, TK &amp; SD</span>
          <h1>Petualangan Pintar</h1>
          <p className="tag">Belajar jadi menyenangkan, tanpa terasa seperti belajar.</p>

          <TryFreeButton />

          <ul className="perks">
            <li>
              <span aria-hidden="true">🔊</span> Dipandu suara
            </li>
            <li>
              <span aria-hidden="true">🛡️</span> Aman untuk anak
            </li>
            <li>
              <span aria-hidden="true">🚫</span> Tanpa iklan
            </li>
            <li>
              <span aria-hidden="true">💛</span> Sekali bayar
            </li>
          </ul>
        </section>

      <section className="worlds">
        <h2 className="lsec-title">Petualangan seru menanti</h2>
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

      <section className="lsec skills">
        <h2 className="lsec-title">Sambil bermain, anak belajar</h2>
        <p className="lsec-sub">Bukan sekadar main — tiap game melatih satu kemampuan.</p>
        <ul className="skill-list">
          {skills.map((k) => {
            const meta = findGame(k.id);
            return (
              <li key={k.id} className="skill">
                <span className={`skill-disc ${k.cls}`} aria-hidden="true">
                  <GameIcon
                    pic={meta?.pic}
                    emoji={k.emoji}
                    className="skill-art"
                    fallbackClassName="skill-emoji"
                  />
                </span>
                <span className="skill-name">{k.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="lsec reasons">
        <h2 className="lsec-title">Kenapa orang tua memilih Petualangan Pintar?</h2>
        <ul className="reason-list">
          {reasons.map((r) => (
            <li key={r.title} className="reason">
              <ReasonIcon icon={r.icon} art={r.art} cls={r.cls} />
              <span className="reason-body">
                <span className="reason-title">{r.title}</span>
                <span className="reason-text">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lsec plans">
        <h2 className="lsec-title">Pilih paket untuk si kecil</h2>
        <div className="prices">
          <div className="pcard">
            <span className="pc-ribbon">Harga perkenalan</span>
            <div className="pc-name">Kelompok Playgroup dan TK</div>
            <div className="pc-row">
              <span className="pc-was">Rp39.000</span>
              <span className="pc-now">Rp19.000</span>
              <span className="pc-off">−50%</span>
            </div>
            <BuyButton group="tk" owned={owned.includes('tk')} />
          </div>

          <div className="pcard">
            <span className="pc-ribbon">Harga perkenalan</span>
            <div className="pc-name">Kelompok SD Kelas 1 &amp; 2</div>
            <div className="pc-row">
              <span className="pc-was">Rp49.000</span>
              <span className="pc-now">Rp29.000</span>
              <span className="pc-off">−40%</span>
            </div>
            <BuyButton group="sd1" owned={owned.includes('sd1')} />
          </div>

          {/* Owner's call (2026-10-13): SD Kelas 3 & 4 moves from "Segera hadir"
              to a buyable card. The −33% chip is rounded DOWN (actual 33.9%). */}
          <div className="pcard">
            <span className="pc-ribbon">Harga perkenalan</span>
            <div className="pc-name">Kelompok SD Kelas 3 &amp; 4</div>
            <div className="pc-row">
              <span className="pc-was">Rp59.000</span>
              <span className="pc-now">Rp39.000</span>
              <span className="pc-off">−33%</span>
            </div>
            <BuyButton group="sd2" owned={owned.includes('sd2')} />
          </div>
        </div>
      </section>

      <section className="soon">
        <h2 className="soon-title">Segera hadir</h2>
        <ul className="soon-list">
          {soonGroups.map((g) => (
            <li key={g.name} className="soon-item">
              <span className="soon-name">{g.name}</span>
              {g.price && (
                <span className="pc-row">
                  <span className="pc-was">{g.price.was}</span>
                  <span className="pc-now">{g.price.now}</span>
                  <span className="pc-off">{g.price.off}</span>
                </span>
              )}
              <span className="soon-desc">{g.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="faq">
        <h2 className="lsec-title">Pertanyaan yang sering ditanya</h2>
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

      <section className="closing">
        <img className="closing-logo" src={logo} alt="" width={84} height={84} />
        <h2 className="closing-title">Yuk, mulai petualangannya!</h2>
        <p className="closing-sub">Coba dulu game gratisnya — tanpa daftar, tanpa login.</p>
        <TryFreeButton />
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
