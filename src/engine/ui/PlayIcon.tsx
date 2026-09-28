/**
 * Lencana "Main" untuk tombol utama layar intro game.
 *
 * Menggantikan emoji ▶️ / 🔄: di iPhone & Android emoji itu kotak biru-abu
 * mengkilap yang bentrok dengan tombol kuning kita (keluhan pemilik
 * 2026-09-28). SVG ini lingkaran putih berisi segitiga oranye membulat —
 * sama di semua HP, tanpa aset yang harus diunduh (pola `BackIcon`).
 * Ukurannya dalam `em`, jadi ikut besar tulisan tombolnya.
 */
export default function PlayIcon({
  kind = 'play',
  size = '1.5em',
}: {
  kind?: 'play' | 'replay';
  size?: number | string;
}) {
  return (
    <svg
      className={kind === 'play' ? 'play-icon play-icon--pulse' : 'play-icon'}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      style={{ display: 'block', flex: 'none' }}
    >
      <circle cx="20" cy="21.5" r="18" fill="rgba(58,46,32,0.18)" />
      <circle cx="20" cy="20" r="18" fill="#fff" />
      {kind === 'play' ? (
        <path
          d="M16 12.2 L28.2 19.1 Q29.8 20 28.2 20.9 L16 27.8 Q14.3 28.8 14.3 26.8 V13.2 Q14.3 11.2 16 12.2 Z"
          fill="#f0662a"
          stroke="#f0662a"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : (
        <g fill="none" stroke="#f0662a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M27.6 15.4 A9 9 0 1 0 29 22" />
          <path d="M28.4 9.6 V15.8 H22.2" />
        </g>
      )}
    </svg>
  );
}
