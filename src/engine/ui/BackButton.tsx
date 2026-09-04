/**
 * Tombol "Kembali" untuk area anak — satu bentuk yang sama di semua layar.
 *
 * Dulu tombolnya cuma emoji ⬅️ + teks: emoji itu digambar berbeda di tiap HP
 * (di iPhone jadi kotak biru abu-abu yang kaku, lihat tangkapan layar pemilik
 * 2026-09-04) dan sama sekali tidak senada dengan warna app. Alasan yang sama
 * dengan Shape.tsx / Clock.tsx / GameIcon: bentuk yang penting digambar sendiri
 * (SVG), bukan diserahkan ke font emoji HP. TIDAK ada gambar yang perlu
 * diimpor — panahnya SVG ±0,4 kB.
 *
 * `BackArrow` sengaja dipisah supaya versi <Link> (src/portal/BackLink.tsx)
 * memakai ikon & label yang SAMA — engine tetap tidak menyentuh react-router.
 */
import './back-button.css';

export const BACK_LABEL = 'Kembali';

/** Panah kembali dalam kepingan bulat — ukurannya ikut font (em). */
export function BackArrow() {
  return (
    <svg className="back-btn__arrow" viewBox="0 0 44 44" aria-hidden focusable="false">
      {/* Keping bulat: rim lebih gelap di bawah supaya terlihat timbul. */}
      <circle cx="22" cy="22.8" r="19.5" fill="#e08a00" />
      <circle cx="22" cy="21.4" r="19.5" fill="#ffb703" />
      <circle cx="22" cy="21.4" r="19.5" fill="none" stroke="#e08a00" strokeWidth="1.6" />
      {/* Kilau lembut di atas — tanpa gradien (butuh id unik per instance). */}
      <path
        d="M12.4 10.6a14.6 14.6 0 0 1 19.2 0"
        fill="none"
        stroke="#ffd977"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Panahnya: batang + kepala, ujung bulat supaya ramah anak. */}
      <path
        d="M31 21.4H14.6M21.5 12.9l-8.5 8.5 8.5 8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  onClick: () => void;
  /** Hanya panah, tanpa tulisan — untuk baris atas layar main yang sempit. */
  compact?: boolean;
};

export default function BackButton({ onClick, compact }: Props) {
  return (
    <button
      type="button"
      className={compact ? 'btn back-btn back-btn--compact' : 'btn back-btn'}
      onClick={onClick}
      aria-label={BACK_LABEL}
    >
      <BackArrow />
      {!compact && <span className="back-btn__text">{BACK_LABEL}</span>}
    </button>
  );
}
