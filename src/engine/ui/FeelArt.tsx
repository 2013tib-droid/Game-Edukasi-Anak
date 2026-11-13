import type { FeelAction, FeelEvent } from '@/engine/core/feelings';

/**
 * Gambar KEJADIAN & TINDAKAN untuk Wajah Perasaan (`face-feel`). Digambar
 * engine (nol aset): kotak 100 × 100, garis tebal & warna cerah supaya
 * terbaca di kartu ±70 px. Tanpa ungu (pemilik tak suka), tanpa kekerasan.
 * Bagian yang bergerak diberi kelas `fa-*` (animasinya di face-feel.css).
 */

const INK = '#5a3a1a';

export function EventArt({ id, className }: { id: FeelEvent; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {EVENTS[id]}
    </svg>
  );
}

export function ActionArt({ id, className }: { id: FeelAction; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {ACTIONS[id]}
    </svg>
  );
}

const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    className="fa-twinkle"
    d={`M${x} ${y - 7 * s} l${2 * s} ${5 * s} ${5 * s} ${2 * s} -${5 * s} ${2 * s} -${2 * s} ${5 * s} -${2 * s} -${5 * s} -${5 * s} -${2 * s} ${5 * s} -${2 * s} Z`}
    fill="#ffd23f"
    stroke="#e0a100"
    strokeWidth="1"
  />
);

const Ground = () => <path d="M6 88 H94" stroke="#9bcf6a" strokeWidth="5" strokeLinecap="round" />;

const EVENTS: Record<FeelEvent, JSX.Element> = {
  kado: (
    <g strokeLinejoin="round">
      <g className="fa-bob">
        <rect x="20" y="46" width="60" height="42" rx="5" fill="#ff6b6b" stroke={INK} strokeWidth="3" />
        <rect x="15" y="34" width="70" height="16" rx="5" fill="#ff8f8f" stroke={INK} strokeWidth="3" />
        <rect x="45" y="34" width="10" height="54" fill="#ffd23f" stroke={INK} strokeWidth="2.5" />
        <path d="M50 34 C38 18 24 24 34 33 Z M50 34 C62 18 76 24 66 33 Z" fill="#ffd23f" stroke={INK} strokeWidth="2.5" />
      </g>
      <Spark x={12} y={22} />
      <Spark x={88} y={18} s={0.8} />
      <Spark x={86} y={62} s={0.6} />
    </g>
  ),
  kue: (
    <g strokeLinejoin="round">
      <ellipse cx="50" cy="88" rx="40" ry="6" fill="#e9eef5" stroke={INK} strokeWidth="2.5" />
      <rect x="18" y="58" width="64" height="28" rx="6" fill="#ffb3c6" stroke={INK} strokeWidth="3" />
      <rect x="26" y="40" width="48" height="20" rx="6" fill="#fff1d6" stroke={INK} strokeWidth="3" />
      <path d="M18 66 q8 6 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#fff" strokeWidth="3" />
      {[36, 50, 64].map((x) => (
        <g key={x}>
          <rect x={x - 2.5} y="26" width="5" height="14" rx="2" fill="#7cc6ff" stroke={INK} strokeWidth="1.8" />
          <path className="fa-flame" d={`M${x} 14 C${x - 5} 20 ${x - 4} 25 ${x} 25 C${x + 4} 25 ${x + 5} 20 ${x} 14 Z`} fill="#ffb02e" stroke="#e46a00" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  ),
  pelangi: (
    <g fill="none" strokeLinecap="round">
      <circle cx="80" cy="22" r="10" fill="#ffd23f" stroke="#f0a500" strokeWidth="2.5" />
      {['#ff5d5d', '#ffa43a', '#ffd84d', '#6fcf6a', '#5aa8ff'].map((c, i) => (
        <path key={c} d={`M${12 + i * 6} 82 A${38 - i * 6} ${38 - i * 6} 0 0 1 ${88 - i * 6} 82`} stroke={c} strokeWidth="6.5" />
      ))}
      <g fill="#fff" stroke="#c9d6e2" strokeWidth="2">
        <path d="M2 84 q2 -10 12 -8 q4 -8 12 -2 q8 0 6 10 Z" />
        <path d="M70 84 q2 -10 12 -8 q4 -8 12 -2 q8 0 4 10 Z" />
      </g>
    </g>
  ),
  'es-jatuh': (
    <g strokeLinejoin="round">
      <Ground />
      <path d="M58 80 C48 72 50 62 62 64 C66 54 80 56 80 66 C92 66 92 80 82 84 Z" fill="#ff9ec4" stroke={INK} strokeWidth="3" />
      <circle cx="47" cy="78" r="3.5" fill="#ff9ec4" stroke={INK} strokeWidth="1.5" />
      <circle cx="90" cy="74" r="2.5" fill="#ff9ec4" stroke={INK} strokeWidth="1.5" />
      <g transform="rotate(-62 30 60)">
        <path d="M18 46 L42 46 L30 84 Z" fill="#f2b56b" stroke={INK} strokeWidth="3" />
        <path d="M22 54 L38 54 M25 62 L35 62" stroke="#c98a3a" strokeWidth="2" />
      </g>
      <path className="fa-fall" d="M70 30 v12 M76 26 v10" stroke="#9aa9b8" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  'balon-lepas': (
    <g strokeLinejoin="round">
      <g className="fa-float">
        <ellipse cx="62" cy="28" rx="16" ry="20" fill="#ff5d6c" stroke={INK} strokeWidth="3" />
        <ellipse cx="56" cy="20" rx="4" ry="6" fill="#fff" opacity="0.6" />
        <path d="M60 48 l2 -2 l2 2 Z" fill="#ff5d6c" stroke={INK} strokeWidth="2" />
        <path d="M62 49 C56 60 68 66 60 78" fill="none" stroke={INK} strokeWidth="2" />
      </g>
      <path d="M30 62 l6 -8 M24 48 l7 -6 M34 80 l4 -8" stroke="#9aa9b8" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
      <g fill="#fff" stroke="#c9d6e2" strokeWidth="2">
        <path d="M8 34 q2 -9 11 -7 q4 -7 11 -1 q7 1 5 9 Z" />
      </g>
    </g>
  ),
  'mainan-rusak': (
    <g strokeLinejoin="round">
      <Ground />
      <path d="M14 70 L20 52 L54 52 L66 64 L82 66 L82 78 L14 78 Z" fill="#5aa8ff" stroke={INK} strokeWidth="3" />
      <rect x="26" y="56" width="22" height="10" rx="2" fill="#dff0ff" stroke={INK} strokeWidth="2" />
      <path d="M44 52 l-4 9 6 3 -5 10" fill="none" stroke={INK} strokeWidth="2.5" />
      <circle cx="28" cy="80" r="8" fill="#555" stroke={INK} strokeWidth="2.5" />
      <g className="fa-roll">
        <circle cx="86" cy="82" r="8" fill="#555" stroke={INK} strokeWidth="2.5" />
        <circle cx="86" cy="82" r="3" fill="#ccc" />
      </g>
      <path d="M70 84 h-6 M72 90 h-8" stroke="#9aa9b8" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  'menara-roboh': (
    <g strokeLinejoin="round" stroke={INK} strokeWidth="3">
      <Ground />
      <rect x="14" y="68" width="22" height="18" rx="3" fill="#ffd84d" />
      <rect x="62" y="70" width="22" height="16" rx="3" fill="#6fcf6a" transform="rotate(12 73 78)" />
      <g className="fa-tumble">
        <rect x="34" y="36" width="20" height="18" rx="3" fill="#ff6b6b" transform="rotate(-25 44 45)" />
        <rect x="58" y="22" width="18" height="16" rx="3" fill="#5aa8ff" transform="rotate(30 67 30)" />
        <path d="M30 22 l-6 -4 M86 46 l6 -2 M48 14 l0 -6" strokeWidth="2.5" strokeLinecap="round" stroke="#9aa9b8" />
      </g>
    </g>
  ),
  'gambar-dicoret': (
    <g strokeLinejoin="round">
      <rect x="14" y="14" width="72" height="72" rx="4" fill="#fffdf5" stroke={INK} strokeWidth="3" transform="rotate(-4 50 50)" />
      <circle cx="68" cy="30" r="8" fill="#ffd23f" />
      <path d="M28 70 L28 52 L42 40 L56 52 L56 70 Z" fill="#ffb3a0" stroke="#d07a5a" strokeWidth="2" />
      <path d="M20 74 H80" stroke="#6fcf6a" strokeWidth="4" />
      <path
        className="fa-scribble"
        d="M18 40 L74 26 L22 56 L82 44 L20 72 L78 62 L30 80"
        fill="none"
        stroke="#3b3b3b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  'mainan-direbut': (
    <g strokeLinejoin="round">
      <g className="fa-tug">
        <circle cx="50" cy="56" r="16" fill="#ff8a5c" stroke={INK} strokeWidth="3" />
        <path d="M34 56 H66 M50 40 C42 48 42 64 50 72 M50 40 C58 48 58 64 50 72" fill="none" stroke="#fff" strokeWidth="2.5" />
        <path d="M6 54 C20 50 28 52 36 54 L36 60 C28 62 20 62 6 60 Z" fill="#ffd84d" stroke={INK} strokeWidth="3" />
        <path d="M94 54 C80 50 72 52 64 54 L64 60 C72 62 80 62 94 60 Z" fill="#c98a5a" stroke={INK} strokeWidth="3" />
      </g>
      <path d="M40 24 l-6 -8 M50 22 v-10 M60 24 l6 -8" stroke="#ff5d5d" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  petir: (
    <g strokeLinejoin="round">
      <path d="M14 48 q-2 -16 16 -16 q6 -16 24 -10 q16 -8 24 8 q16 2 12 18 Z" fill="#7b8797" stroke="#3e4752" strokeWidth="3" />
      <path className="fa-flash" d="M50 46 L40 66 H50 L44 88 L64 60 H54 L60 46 Z" fill="#ffd23f" stroke="#e09a00" strokeWidth="2.5" />
      <path d="M22 60 l-4 10 M30 66 l-4 10 M74 60 l-4 10 M82 66 l-4 10" stroke="#5aa8ff" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  'lampu-mati': (
    <g strokeLinejoin="round">
      <rect x="6" y="6" width="88" height="88" rx="10" fill="#2f3a5a" />
      <rect x="56" y="18" width="28" height="30" rx="3" fill="#425380" stroke="#8b9cc8" strokeWidth="2.5" />
      <path d="M70 18 V48 M56 33 H84" stroke="#8b9cc8" strokeWidth="2" />
      <path d="M76 24 a6 6 0 1 0 4 9 a5 5 0 1 1 -4 -9 Z" fill="#fff3b0" />
      <path d="M32 6 V24" stroke="#8b9cc8" strokeWidth="2.5" />
      <path d="M24 30 a8 8 0 1 1 16 0 c0 6 -4 8 -4 13 h-8 c0 -5 -4 -7 -4 -13 Z" fill="#59627a" stroke="#8b9cc8" strokeWidth="2.5" />
      <rect x="27" y="43" width="10" height="5" rx="1.5" fill="#8b9cc8" />
      <path d="M18 74 q14 -8 28 0 q14 8 28 0" fill="none" stroke="#425380" strokeWidth="4" />
    </g>
  ),
  'kotak-kejutan': (
    <g strokeLinejoin="round">
      <rect x="24" y="62" width="52" height="30" rx="4" fill="#5aa8ff" stroke={INK} strokeWidth="3" />
      <path d="M24 62 L14 52 L62 52 L76 62" fill="#8fc6ff" stroke={INK} strokeWidth="3" />
      <g className="fa-boing">
        <path d="M50 62 l-8 -5 16 -5 -16 -5 16 -5 -8 -4" fill="none" stroke="#9aa9b8" strokeWidth="3" />
        <circle cx="50" cy="26" r="13" fill="#ffe0b8" stroke={INK} strokeWidth="3" />
        <path d="M38 18 L50 2 L62 18 Z" fill="#ff6b6b" stroke={INK} strokeWidth="2.5" />
        <circle cx="50" cy="2" r="3" fill="#ffd23f" stroke={INK} strokeWidth="1.5" />
        <circle cx="45" cy="25" r="2" fill={INK} />
        <circle cx="55" cy="25" r="2" fill={INK} />
        <path d="M44 31 q6 5 12 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="28" r="2.5" fill="#ff6b6b" />
      </g>
      <path d="M18 30 l-8 -4 M16 42 l-10 0 M82 30 l8 -4 M84 42 l10 0" stroke="#ff7a3a" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
};

const Heart = ({ x, y, s = 1, fill = '#ff6b8a' }: { x: number; y: number; s?: number; fill?: string }) => (
  <path
    d={`M${x} ${y + 10 * s} C${x - 14 * s} ${y} ${x - 10 * s} ${y - 12 * s} ${x} ${y - 5 * s} C${x + 10 * s} ${y - 12 * s} ${x + 14 * s} ${y} ${x} ${y + 10 * s} Z`}
    fill={fill}
    stroke={INK}
    strokeWidth={2.5}
    strokeLinejoin="round"
  />
);

const Bubble = ({ jag = false }: { jag?: boolean }) =>
  jag ? (
    <path d="M10 22 L22 30 L28 12 L40 26 L52 8 L58 26 L76 12 L74 32 L92 34 L78 48 L90 64 L70 62 L68 82 L54 68 L42 84 L36 66 L16 72 L24 54 L8 44 L22 38 Z" fill="#ffe14d" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
  ) : (
    <path d="M16 18 H84 a8 8 0 0 1 8 8 V62 a8 8 0 0 1 -8 8 H40 L24 86 L28 70 H16 a8 8 0 0 1 -8 -8 V26 a8 8 0 0 1 8 -8 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
  );

const ACTIONS: Record<FeelAction, JSX.Element> = {
  peluk: (
    <g>
      <Heart x={50} y={52} s={2.6} />
      <path d="M14 62 C14 36 30 30 40 44 M86 62 C86 36 70 30 60 44" fill="none" stroke="#f6b51e" strokeWidth="9" strokeLinecap="round" />
      <path d="M14 62 C14 36 30 30 40 44 M86 62 C86 36 70 30 60 44" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  pinjamkan: (
    <g strokeLinejoin="round">
      <path d="M22 50 L28 36 L56 36 L66 46 L78 48 L78 58 L22 58 Z" fill="#5aa8ff" stroke={INK} strokeWidth="3" />
      <circle cx="34" cy="60" r="7" fill="#555" stroke={INK} strokeWidth="2.5" />
      <circle cx="68" cy="60" r="7" fill="#555" stroke={INK} strokeWidth="2.5" />
      <path d="M14 82 H74 M62 72 L76 82 L62 92" fill="none" stroke="#6fcf6a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Heart x={86} y={22} s={0.9} />
    </g>
  ),
  'ajak-main': (
    <g strokeLinejoin="round">
      <g className="fa-bounce">
        <circle cx="50" cy="40" r="22" fill="#ff8a5c" stroke={INK} strokeWidth="3" />
        <path d="M28 40 H72 M50 18 C40 28 40 52 50 62 M50 18 C60 28 60 52 50 62" fill="none" stroke="#fff" strokeWidth="3" />
      </g>
      <ellipse cx="50" cy="88" rx="20" ry="4" fill="#000" opacity="0.12" />
      <Spark x={14} y={24} />
      <Spark x={86} y={66} s={0.8} />
    </g>
  ),
  temani: (
    <g>
      <path d="M8 76 H92" stroke="#c98a5a" strokeWidth="6" strokeLinecap="round" />
      <path d="M18 76 V90 M82 76 V90" stroke="#c98a5a" strokeWidth="5" strokeLinecap="round" />
      <Heart x={34} y={50} s={1.6} fill="#ffd84d" />
      <Heart x={66} y={50} s={1.6} fill="#ff8fa3" />
      <path d="M44 62 Q50 70 56 62" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  'tarik-napas': (
    <g strokeLinejoin="round">
      <path d="M50 92 V58" stroke="#6fcf6a" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 74 C40 66 30 72 32 80 C40 82 46 78 50 74 Z" fill="#8fdc7f" stroke={INK} strokeWidth="2" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="50" cy="34" rx="9" ry="14" fill="#ffb3c6" stroke={INK} strokeWidth="2" transform={`rotate(${a} 50 46)`} />
      ))}
      <circle cx="50" cy="46" r="8" fill="#ffd23f" stroke={INK} strokeWidth="2" />
      <path className="fa-breath" d="M70 30 c8 -4 14 2 10 8 c-4 6 4 10 10 6 M72 54 c8 -2 12 4 8 8" fill="none" stroke="#7cc6ff" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  'bilang-pelan': (
    <g>
      <Bubble />
      <path d="M22 44 q7 -8 14 0 t14 0 t14 0 t14 0" fill="none" stroke="#5aa8ff" strokeWidth="4" strokeLinecap="round" />
      <Heart x={50} y={58} s={0.6} />
    </g>
  ),
  'minta-peluk': (
    <g>
      <circle cx="50" cy="64" r="16" fill="#ffd84d" stroke={INK} strokeWidth="3" />
      <path d="M36 58 C24 46 20 34 18 24 M64 58 C76 46 80 34 82 24" fill="none" stroke="#f6b51e" strokeWidth="9" strokeLinecap="round" />
      <path d="M36 58 C24 46 20 34 18 24 M64 58 C76 46 80 34 82 24" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Heart x={50} y={22} s={1.3} />
    </g>
  ),
  tertawa: (
    <g>
      <Bubble />
      <text x="50" y="52" textAnchor="middle" fontSize="19" fontWeight="900" fill="#e5262c" fontFamily="sans-serif">
        HA HA
      </text>
    </g>
  ),
  pergi: (
    <g fill="#9a7b5a">
      {[
        [16, 70, -10],
        [30, 60, 10],
        [46, 70, -10],
        [60, 60, 10],
      ].map(([x, y, r]) => (
        <ellipse key={`${x}`} cx={x} cy={y} rx="6" ry="9" transform={`rotate(${r! + 90} ${x} ${y})`} />
      ))}
      <path d="M70 46 H92 M82 36 L92 46 L82 56" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  berteriak: (
    <g>
      <Bubble jag />
      <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="900" fill="#e5262c" fontFamily="sans-serif">
        AAA!
      </text>
    </g>
  ),
  cemberut: (
    <g strokeLinejoin="round">
      <path d="M14 52 q-2 -16 16 -16 q6 -16 24 -10 q16 -8 24 8 q16 2 12 18 Z" fill="#8a96a6" stroke="#3e4752" strokeWidth="3" />
      <path d="M26 64 l-3 9 M40 66 l-3 9 M54 64 l-3 9 M68 66 l-3 9" stroke="#5aa8ff" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 86 H72" stroke="#3e4752" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
};
