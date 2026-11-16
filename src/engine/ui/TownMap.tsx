import { DIRS4, screenVec, type Dir4, type Rot, type ScreenSide, type SymbolId } from '@/engine/core/compass';

/**
 * Gambar peta kota Kurir Kompas (`compass-map`) — semuanya SVG engine, nol
 * aset: mawar angin, pohon, sungai, jembatan, panah sisi layar.
 *
 * Mawar angin IKUT berputar dengan peta (`rot`), tapi huruf U·T·S·B-nya
 * dihitung letaknya dan digambar TEGAK — seperti ikon bangunan di peta.
 */

const LETTER: Record<Dir4, string> = { u: 'U', t: 'T', s: 'S', b: 'B' };

export function CompassRose({ rot, className = '' }: { rot: Rot; className?: string }) {
  return (
    <svg className={`cm-rose ${className}`} viewBox="-50 -50 100 100" role="img" aria-label="Mawar angin">
      <circle r="47" fill="#fffdf6" stroke="#c9a66b" strokeWidth="2.5" />
      <g transform={`rotate(${rot})`}>
        {/* Empat ujung kecil (arah antara) */}
        {[45, 135, 225, 315].map((a) => (
          <path key={a} d="M0 -24 L5 -5 L0 0 L-5 -5 Z" fill="#d9c7a1" transform={`rotate(${a})`} />
        ))}
        {/* Selatan, timur, barat: abu kebiruan; UTARA merah menonjol */}
        {[90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 -30 L7 0 L0 0 Z" fill="#7d8da1" />
            <path d="M0 -30 L-7 0 L0 0 Z" fill="#a9b6c6" />
          </g>
        ))}
        <path d="M0 -34 L8.5 0 L0 0 Z" fill="#c62828" />
        <path d="M0 -34 L-8.5 0 L0 0 Z" fill="#ef5350" />
        <circle r="4" fill="#fff" stroke="#5a4630" strokeWidth="1.5" />
      </g>
      {DIRS4.map((d) => {
        const [x, y] = screenVec(d, rot);
        return (
          <text
            key={d}
            x={x * 39}
            y={y * 39}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={d === 'u' ? 15 : 10.5}
            fontWeight={900}
            fill={d === 'u' ? '#c62828' : '#5a4630'}
            data-dir={d}
          >
            {LETTER[d]}
          </text>
        );
      })}
    </svg>
  );
}

/** Pohon di blok hijau. */
export function TreeGlyph() {
  return (
    <svg className="cm-tree" viewBox="0 0 40 40" aria-hidden>
      <rect x="18" y="24" width="4" height="9" rx="1.5" fill="#8d6e63" />
      <circle cx="20" cy="17" r="10" fill="#4c9f50" />
      <circle cx="14" cy="21" r="6.5" fill="#5bb45f" />
      <circle cx="26" cy="21" r="6.5" fill="#429347" />
      <circle cx="17" cy="13" r="3" fill="#7fce82" opacity="0.8" />
    </svg>
  );
}

/** Riak sungai — sama di semua arah, jadi tak perlu ikut diputar. */
export function WaveGlyph() {
  return (
    <svg className="cm-wave" viewBox="0 0 40 40" preserveAspectRatio="none" aria-hidden>
      <path d="M4 14 q5 -5 10 0 t10 0 t10 0" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
      <path d="M6 27 q5 -5 10 0 t10 0 t10 0" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Jembatan papan; `across` = arah jalannya di LAYAR. */
export function BridgeGlyph({ across }: { across: 'datar' | 'tegak' }) {
  return (
    <svg className="cm-bridge" viewBox="0 0 40 40" preserveAspectRatio="none" aria-hidden>
      <g transform={across === 'tegak' ? 'rotate(90 20 20)' : undefined}>
        <rect x="0" y="8" width="40" height="24" fill="#c8935a" />
        {[5, 13, 21, 29, 37].map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2="32" stroke="#9c6b3a" strokeWidth="1.6" />
        ))}
        <rect x="0" y="5" width="40" height="4" rx="2" fill="#8d5a2b" />
        <rect x="0" y="31" width="40" height="4" rx="2" fill="#8d5a2b" />
      </g>
    </svg>
  );
}

/** Contoh simbol besar untuk soal legenda "simbol ini artinya apa?". */
export function SymbolTile({ symbol }: { symbol: SymbolId }) {
  return (
    <span className={`cm-symbol cm-symbol--${symbol}`} role="img" aria-label="Simbol peta">
      {symbol === 'sungai' && <WaveGlyph />}
      {symbol === 'jembatan' && (
        <>
          <WaveGlyph />
          <BridgeGlyph across="datar" />
        </>
      )}
      {symbol === 'pepohonan' && <TreeGlyph />}
    </span>
  );
}

const SIDE_DEG: Record<ScreenSide, number> = { atas: 0, kanan: 90, bawah: 180, kiri: 270 };

/** Panah sisi layar (kartu jawaban "utara ada di mana?"). */
export function SideArrow({ side }: { side: ScreenSide }) {
  return (
    <svg className="cm-arrow" viewBox="0 0 40 40" aria-hidden>
      <path
        d="M20 5 L33 20 H25 V35 H15 V20 H7 Z"
        fill="#1e88e5"
        stroke="#0d5aa7"
        strokeWidth="2"
        strokeLinejoin="round"
        transform={`rotate(${SIDE_DEG[side]} 20 20)`}
      />
    </svg>
  );
}

/** Petunjuk tingkat 1: panah utara besar melintasi peta. */
export function NorthArrow({ rot }: { rot: Rot }) {
  const [x, y] = screenVec('u', rot);
  return (
    <svg className="cm-north" viewBox="0 0 100 100" aria-hidden>
      <g transform={`rotate(${rot} 50 50)`}>
        <line x1="50" y1="86" x2="50" y2="46" stroke="#c62828" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 9" />
        <path d="M50 24 L62 44 H38 Z" fill="#c62828" />
      </g>
      <circle cx={50 + x * 38} cy={50 + y * 38} r="9" fill="#fff" stroke="#c62828" strokeWidth="2" />
      <text x={50 + x * 38} y={50 + y * 38} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight={900} fill="#c62828">
        U
      </text>
    </svg>
  );
}
