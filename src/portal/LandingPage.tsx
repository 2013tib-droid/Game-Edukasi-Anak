import { useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

const logo = `${import.meta.env.BASE_URL}assets/logo.svg`;

/**
 * Marketing landing — the app's front door. Kids/parents see this first; the
 * playable portal (group picker + games) lives behind the "Coba Demo Gratis"
 * and "Masuk" actions. Ported from the static landing so branding matches.
 */
export default function LandingPage() {
  const [buyModal, setBuyModal] = useState<string | null>(null);

  return (
    <div className="landing">
      <header>
        <div className="nav">
          <Link className="brand" to="/">
            <img className="logo" src={logo} alt="" /> Petualangan Pintar
          </Link>
          <Link className="btn btn-ghost" to="/masuk">
            👤 Masuk
          </Link>
        </div>
      </header>

      <div>
        {/* HERO */}
        <div className="container hero">
          <span className="badge">✨ Game Edukasi Anak Indonesia · Usia 4–8 Tahun</span>
          <h1>Belajar Jadi Petualangan yang Seru! 🚀</h1>
          <p className="lead">
            Kumpulan mini-game berhitung, mengenal huruf, warna &amp; bentuk — semua instruksi{' '}
            <b>dinarasikan suara Bahasa Indonesia</b>, jadi anak yang belum lancar membaca pun
            bisa main sendiri.
          </p>
          <Link className="btn btn-primary btn-demo" to="/portal">
            <span>🎮 Coba Demo Gratis</span>
            <span className="btn-sub">Tanpa login · Tanpa install · Langsung main</span>
          </Link>
          <div className="mascots" aria-hidden="true">
            <span>🥚</span>
            <span>🐣</span>
            <span>🐥</span>
            <span>🦉</span>
            <span>🦄</span>
            <span>🐲</span>
          </div>
        </div>

        {/* TRUST */}
        <div className="container trust">
          <span>Tanpa iklan</span>
          <span>Narasi Bahasa Indonesia</span>
          <span>Aman untuk anak</span>
        </div>

        {/* WORLDS */}
        <section className="container" id="dunia">
          <h2>Ada Apa di Dalamnya?</h2>
          <p className="section-sub">Empat dunia belajar dalam satu petualangan.</p>
          <div className="worlds">
            <div className="world w-forest">
              <span className="we">🦁</span>
              <div className="wn">Hutan Hewan</div>
              <div className="ws">Ayo Berhitung!</div>
            </div>
            <div className="world w-space">
              <span className="we">🏕️</span>
              <div className="wn">Taman Huruf</div>
              <div className="ws">Kenali Huruf!</div>
            </div>
            <div className="world w-ocean">
              <span className="we">🐠</span>
              <div className="wn">Bawah Laut</div>
              <div className="ws">Warna &amp; Bentuk!</div>
            </div>
            <div className="world w-fruit">
              <span className="we">🍉</span>
              <div className="wn">Pasar Buah</div>
              <div className="ws">Kenali Buah!</div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="container" id="paket">
          <h2>Pilih Dunia Sesuai Usia Anak</h2>
          <p className="section-sub">
            Beli sekali, mainkan selamanya — perbaikan &amp; penyempurnaan gratis.
          </p>
          <div className="plans">
            <div className="plan">
              <span className="ribbon">🎁 Demo Gratis Tersedia</span>
              <span className="pe">🐥</span>
              <h3>
                Dunia Ceria <small>(4–6 tahun)</small>
              </h3>
              <div className="price">
                Rp19.000 <small>sekali bayar</small>
              </div>
              <ul>
                <li>10–15 mini-game premium</li>
                <li>Narasi audio Bahasa Indonesia</li>
                <li>Bintang &amp; maskot yang tumbuh</li>
                <li>Bisa dipakai di 3 perangkat</li>
              </ul>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setBuyModal('Dunia Ceria')}
                >
                  🛒 Beli Dunia Ceria
                </button>
              </div>
            </div>

            <div className="plan">
              <span className="ribbon soon">🚀 Segera Hadir</span>
              <span className="pe">🦉</span>
              <h3>
                Dunia Eksplorasi <small>(6–8 tahun)</small>
              </h3>
              <div className="price">
                Rp39.000 <small>sekali bayar</small>
              </div>
              <ul>
                <li>10–15 mini-game premium</li>
                <li>Soal lebih menantang</li>
                <li>Narasi audio Bahasa Indonesia</li>
                <li>Bisa dipakai di 3 perangkat</li>
              </ul>
              <div className="actions">
                <button className="btn btn-ghost btn-disabled" disabled>
                  ⏳ Segera Hadir
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container" id="faq">
          <h2>Pertanyaan Orang Tua</h2>
          <div className="faq">
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
                Perbaikan dan penyempurnaan game di dunia yang sudah dibeli selalu gratis. Dunia
                baru untuk jenjang berikutnya (misal SD kelas 3–4) adalah produk terpisah.
              </p>
            </details>
          </div>
        </section>
      </div>

      <footer>© 2026 Petualangan Pintar · Dibuat dengan ❤️ untuk anak Indonesia</footer>

      {buyModal && (
        <div className="modal-overlay" onClick={() => setBuyModal(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="me">🛒</div>
            <h3>Pembelian Segera Dibuka!</h3>
            <p>
              {buyModal} akan segera bisa dibeli lewat QRIS &amp; e-wallet. Ikuti terus — sekarang
              coba dulu demo gratisnya, ya!
            </p>
            <div className="actions">
              <Link className="btn btn-primary" to="/portal">
                🎮 Main Demo Gratis Dulu
              </Link>
              <button className="btn btn-ghost" onClick={() => setBuyModal(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
