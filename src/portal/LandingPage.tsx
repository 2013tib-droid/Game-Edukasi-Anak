import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import groupsData from '@/data/groups.json';
import { gamesForGroup } from '@/games/registry';
import { getTotalStars } from '@/engine/core/progress';
import './landing.css';

/**
 * Parent-facing marketing landing (route "/"). The kid-facing group picker
 * lives at "/portal". This page sells access: value proposition, playable
 * worlds, honest pricing, and FAQ — no ads, no external links inside the
 * kid area, purchases gated behind the parent flow.
 *
 * Gameplay data (world emoji/title) comes from the game registry so the
 * showcase can't drift from what actually ships; marketing copy (subtitle,
 * card color) is landing-local.
 */

// Optional launch countdown for the next grade. Set an ISO date to show a
// "rilis dalam X hari" timer under the "Segera Hadir" plan; null hides it.
const LAUNCH_DATE: string | null = null;

// Marketing dressing for the four TK worlds, keyed by registry game id.
const WORLD_STYLE: Record<string, { subtitle: string; cls: string }> = {
  'hutan-hewan': { subtitle: 'Ayo Berhitung!', cls: 'lp-w-forest' },
  'taman-huruf': { subtitle: 'Kenali Huruf!', cls: 'lp-w-space' },
  'bawah-laut': { subtitle: 'Warna & Bentuk!', cls: 'lp-w-ocean' },
  'pasar-buah': { subtitle: 'Kenali Buah!', cls: 'lp-w-fruit' },
};

// Per-group plan copy. `ready` groups show a demo badge + buy button;
// otherwise the plan is "Segera Hadir" and not yet purchasable.
const PLAN_INFO: Record<string, { emoji: string; ready: boolean; features: string[] }> = {
  tk: {
    emoji: '🐥',
    ready: true,
    features: [
      '10–15 mini-game premium',
      'Narasi audio Bahasa Indonesia',
      'Bintang & maskot yang tumbuh',
      'Bisa dipakai di 3 perangkat',
    ],
  },
  sd1: {
    emoji: '🦉',
    ready: false,
    features: [
      '10–15 mini-game premium',
      'Soal lebih menantang',
      'Narasi audio Bahasa Indonesia',
      'Bisa dipakai di 3 perangkat',
    ],
  },
};

function useCountdown(iso: string | null): string | null {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    const tick = () => {
      const d = target - Date.now();
      if (d <= 0) {
        setText('🎉 Sudah rilis!');
        return;
      }
      const hari = Math.floor(d / 864e5);
      const jam = Math.floor((d % 864e5) / 36e5);
      const mnt = Math.floor((d % 36e5) / 6e4);
      setText(`⏰ Rilis dalam ${hari} hari ${jam} jam ${mnt} menit`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [iso]);
  return text;
}

export default function LandingPage() {
  const [buyGroup, setBuyGroup] = useState<string | null>(null);
  const countdown = useCountdown(LAUNCH_DATE);
  // Returning-visitor shortcut — only shown once there's local progress.
  const [hasProgress, setHasProgress] = useState(false);
  useEffect(() => setHasProgress(getTotalStars() > 0), []);

  const worlds = gamesForGroup('tk')
    .filter((g) => WORLD_STYLE[g.id])
    .slice(0, 4);

  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-nav">
          <Link className="lp-brand" to="/">
            <img className="lp-logo" src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" />
            Petualangan Pintar
          </Link>
          <Link className="lp-btn lp-btn--ghost" to="/masuk">
            👤 Masuk
          </Link>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <div className="lp-container lp-hero">
          <span className="lp-badge">✨ Game Edukasi Anak Indonesia · Usia 4–8 Tahun</span>
          <h1>Belajar Jadi Petualangan yang Seru! 🚀</h1>
          <p className="lp-lead">
            Kumpulan mini-game berhitung, mengenal huruf, warna &amp; bentuk — semua instruksi{' '}
            <b>dinarasikan suara Bahasa Indonesia</b>, jadi anak yang belum lancar membaca pun
            bisa main sendiri.
          </p>
          {hasProgress && (
            <p className="lp-resume">
              <Link to="/portal">↩️ Lanjutkan bermain</Link>
            </p>
          )}
          <Link className="lp-btn lp-btn--primary lp-btn--demo" to="/portal">
            <span>🎮 Coba Demo Gratis</span>
            <span className="lp-btn-sub">Tanpa login · Tanpa install · Langsung main</span>
          </Link>
          <div className="lp-mascots" aria-hidden="true">
            <span>🥚</span>
            <span>🐣</span>
            <span>🐥</span>
            <span>🦉</span>
            <span>🦄</span>
            <span>🐲</span>
          </div>
        </div>

        {/* ============ TRUST POINTS ============ */}
        <div className="lp-container lp-trust">
          <span>Tanpa iklan</span>
          <span>Narasi Bahasa Indonesia</span>
          <span>Aman untuk anak</span>
        </div>

        {/* ============ WORLDS ============ */}
        <section className="lp-container lp-section" id="dunia">
          <h2>Ada Apa di Dalamnya?</h2>
          <p className="lp-section-sub">Empat dunia belajar dalam satu petualangan.</p>
          <div className="lp-worlds">
            {worlds.map((w) => {
              const style = WORLD_STYLE[w.id];
              return (
                <Link key={w.id} to="/kelompok/tk" className={`lp-world ${style.cls}`}>
                  <span className="lp-we" aria-hidden>
                    {w.emoji}
                  </span>
                  <div className="lp-wn">{w.title}</div>
                  <div className="lp-ws">{style.subtitle}</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section className="lp-container lp-section lp-section--paket" id="paket">
          <h2>Pilih Paket Sesuai Usia Anak</h2>
          <p className="lp-section-sub">
            Beli sekali, mainkan selamanya — perbaikan &amp; penyempurnaan gratis.
          </p>
          <div className="lp-plans">
            {groupsData.groups.map((group) => {
              const info = PLAN_INFO[group.id];
              if (!info) return null;
              return (
                <div className="lp-plan" key={group.id}>
                  <span className={`lp-ribbon ${info.ready ? '' : 'lp-ribbon--soon'}`}>
                    {info.ready ? '🎁 Demo Gratis Tersedia' : '🚀 Segera Hadir'}
                  </span>
                  <span className="lp-pe" aria-hidden>
                    {info.emoji}
                  </span>
                  <h3>{group.title}</h3>
                  <div className="lp-price">
                    {group.priceLabel} <small>sekali bayar</small>
                  </div>
                  <ul>
                    {info.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="lp-actions">
                    {info.ready ? (
                      <button
                        className="lp-btn lp-btn--primary"
                        onClick={() => setBuyGroup(group.id)}
                      >
                        🛒 Beli {group.title}
                      </button>
                    ) : (
                      <>
                        {countdown && <div className="lp-countdown">{countdown}</div>}
                        <button className="lp-btn lp-btn--ghost lp-btn--disabled" disabled>
                          ⏳ Segera Hadir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="lp-container lp-section lp-section--faq" id="faq">
          <h2>Pertanyaan Orang Tua</h2>
          <div className="lp-faq">
            <details>
              <summary>Apakah aman untuk anak?</summary>
              <p>
                Aman. Tidak ada iklan, tidak ada link keluar, dan tidak ada tombol pembelian di
                area bermain anak. Semua urusan akun &amp; pembelian dipisah di area orang tua.
              </p>
            </details>
            <details>
              <summary>Bisa dimainkan di perangkat apa saja?</summary>
              <p>
                Semua ponsel dan tablet yang memiliki browser — Android, iPhone, maupun iPad. Game
                dibuat ringan supaya tetap lancar di perangkat kelas menengah ke bawah, tanpa perlu
                install aplikasi.
              </p>
            </details>
            <details>
              <summary>Satu akun bisa dipakai di berapa perangkat?</summary>
              <p>Sampai 3 perangkat per akun — cukup untuk perangkat ayah, ibu, dan si kecil.</p>
            </details>
            <details>
              <summary>Kalau ada game baru, bayar lagi?</summary>
              <p>
                Perbaikan dan penyempurnaan game di paket yang sudah dibeli selalu gratis. Paket
                baru untuk jenjang berikutnya (misal SD kelas 3–4) adalah produk terpisah.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        © 2026 Petualangan Pintar · Dibuat dengan ❤️ untuk anak Indonesia
      </footer>

      {/* ============ BUY MODAL ============ */}
      {buyGroup && (
        <div
          className="lp-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBuyGroup(null);
          }}
        >
          <div className="lp-modal" role="dialog" aria-modal="true" aria-labelledby="lp-modal-title">
            <div className="lp-me" aria-hidden>
              🛒
            </div>
            <h3 id="lp-modal-title">Pembelian Segera Dibuka!</h3>
            <p>
              {groupsData.groups.find((g) => g.id === buyGroup)?.title} akan segera bisa dibeli
              lewat QRIS &amp; e-wallet. Ikuti terus — sekarang coba dulu demo gratisnya, ya!
            </p>
            <div className="lp-actions">
              <Link className="lp-btn lp-btn--primary" to="/portal">
                🎮 Main Demo Gratis Dulu
              </Link>
              <button className="lp-btn lp-btn--ghost" onClick={() => setBuyGroup(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
