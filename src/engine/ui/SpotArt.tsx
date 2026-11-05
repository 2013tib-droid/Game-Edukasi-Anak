import { SPOT_HEX, SPOT_H, SPOT_W, type SpotColor, type SpotPlace, type SpotShape } from '@/engine/core/spotDiff';

/**
 * Gambar engine untuk "Cari Perbedaan": latar tempat dan bentuk yang bisa
 * berganti warna. Latarnya SENGAJA tenang (pastel, tanpa benda kecil yang
 * bisa disangka perbedaan) — yang dicari anak adalah benda-bendanya, bukan
 * rumput. Latar di kedua gambar selalu identik.
 */

const SKY: Record<SpotPlace, [string, string]> = {
  taman: ['#bfe6ff', '#eaf7ff'],
  kebun: ['#c6ebff', '#f0faff'],
  sawah: ['#c2e5ff', '#eef8ff'],
  pantai: ['#b9e2ff', '#ecf8ff'],
  'kebun-binatang': ['#c9eaff', '#f2fbff'],
  kota: ['#cfe8ff', '#f4f9ff'],
};

export function SpotBackdrop({ place, uid }: { place: SpotPlace; uid: string }) {
  const [a, b] = SKY[place];
  const g = `sd-sky-${uid}`;
  return (
    <svg className="sd-backdrop" viewBox={`0 0 ${SPOT_W} ${SPOT_H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width={SPOT_W} height={SPOT_H} fill={`url(#${g})`} />
      <Ground place={place} />
    </svg>
  );
}

function Ground({ place }: { place: SpotPlace }) {
  if (place === 'pantai') {
    return (
      <>
        <rect y="34" width="150" height="14" fill="#8fd3f4" />
        <path d="M0 40 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#e8f8ff" strokeWidth="1.2" />
        <path d="M0 47 q20 -4 40 0 t40 0 t40 0 t40 0 V100 H0 Z" fill="#f7e4b3" />
      </>
    );
  }
  if (place === 'sawah') {
    return (
      <>
        <path d="M-5 40 L25 18 L52 40 Z" fill="#b7d9c3" />
        <path d="M38 40 L72 14 L104 40 Z" fill="#a8d0b6" />
        <rect y="38" width="150" height="62" fill="#b6e38f" />
        {[50, 63, 78, 95].map((y) => (
          <line key={y} x1="0" y1={y} x2="150" y2={y} stroke="#a2d47a" strokeWidth="1.4" />
        ))}
      </>
    );
  }
  if (place === 'kebun') {
    return (
      <>
        <rect y="38" width="150" height="62" fill="#a9df8a" />
        <rect y="38" width="150" height="5" fill="#93cf74" />
        {[58, 88].map((y) => (
          <rect key={y} x="0" y={y} width="150" height="6" rx="3" fill="#c9a77c" opacity="0.45" />
        ))}
      </>
    );
  }
  if (place === 'kebun-binatang') {
    return (
      <>
        <rect y="38" width="150" height="62" fill="#b3e394" />
        <g stroke="#c79b6a" strokeWidth="1.6">
          <line x1="0" y1="35" x2="150" y2="35" />
          <line x1="0" y1="40" x2="150" y2="40" />
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1={i * 10 + 2} y1="31" x2={i * 10 + 2} y2="43" />
          ))}
        </g>
      </>
    );
  }
  if (place === 'kota') {
    return (
      <>
        <g fill="#dfe6f0">
          <rect x="4" y="22" width="16" height="18" />
          <rect x="24" y="16" width="12" height="24" />
          <rect x="112" y="18" width="14" height="22" />
          <rect x="130" y="24" width="18" height="16" />
        </g>
        <rect y="38" width="150" height="62" fill="#e9e7e2" />
        <rect y="66" width="150" height="7" fill="#d4d1ca" />
      </>
    );
  }
  // taman
  return (
    <>
      <g fill="#a6dc8e">
        <circle cx="10" cy="40" r="9" />
        <circle cx="140" cy="40" r="9" />
      </g>
      <rect y="38" width="150" height="62" fill="#b7e79a" />
      <path d="M60 100 Q70 70 78 38 L84 38 Q86 70 96 100 Z" fill="#efe0bd" opacity="0.7" />
    </>
  );
}

/** Bentuk engine — warnanya yang bisa jadi perbedaan. */
export function SpotShapeArt({ shape, color }: { shape: SpotShape; color: SpotColor }) {
  const c = SPOT_HEX[color];
  if (shape === 'balon') {
    return (
      <svg viewBox="0 0 40 40" className="sd-shape" aria-hidden>
        <path d="M20 29 q-3 4 1 6 q3 2 -1 5" fill="none" stroke="#7a6a5a" strokeWidth="1.2" />
        <ellipse cx="20" cy="15" rx="11" ry="13.5" fill={c} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        <path d="M18 28 h4 l-2 3 z" fill={c} />
        <ellipse cx="15.5" cy="10" rx="3" ry="4.5" fill="#fff" opacity="0.55" />
      </svg>
    );
  }
  if (shape === 'layang') {
    return (
      <svg viewBox="0 0 40 40" className="sd-shape" aria-hidden>
        <path d="M20 31 q4 3 0 5 q-4 2 0 4" fill="none" stroke="#7a6a5a" strokeWidth="1.2" />
        <path d="M20 2 L33 15 L20 31 L7 15 Z" fill={c} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <path d="M20 2 V31 M7 15 H33" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
      </svg>
    );
  }
  // kupu-kupu
  return (
    <svg viewBox="0 0 40 40" className="sd-shape" aria-hidden>
      <g fill={c} stroke="rgba(0,0,0,0.3)" strokeWidth="1">
        <ellipse cx="12" cy="14" rx="9" ry="10" />
        <ellipse cx="28" cy="14" rx="9" ry="10" />
        <ellipse cx="13" cy="28" rx="7" ry="7" />
        <ellipse cx="27" cy="28" rx="7" ry="7" />
      </g>
      <circle cx="12" cy="14" r="3.2" fill="#fff" opacity="0.6" />
      <circle cx="28" cy="14" r="3.2" fill="#fff" opacity="0.6" />
      <rect x="18.3" y="9" width="3.4" height="24" rx="1.7" fill="#5a4636" />
      <path d="M19 9 q-3 -5 -6 -6 M21 9 q3 -5 6 -6" stroke="#5a4636" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
