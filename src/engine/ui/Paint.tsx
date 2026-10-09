import type { BatikId, OrnamentId } from '@/engine/core/types';
import { PAINT_HEX, paintName, type PaintColor } from '@/engine/core/paint';

/**
 * Gambar-gambar Sanggar Warna (template `paint-studio`), semuanya SVG engine
 * supaya warnanya persis sama di semua HP (alasan yang sama dengan Shape.tsx).
 *
 * MOTIF BATIK (`BatikTileArt`) disederhanakan untuk layar HP, tapi bentuknya
 * TIDAK dikarang — sama seperti lambang sila di Sila.tsx:
 * - kawung   empat buah kolang-kaling (elips) bersilang di satu titik, ujungnya
 *            bertemu ujung bunga tetangga;
 * - parang   pita miring berulang berisi lengkung "S" (mata parang) dengan
 *            deret belah ketupat kecil (mlinjon) di antaranya;
 * - mega mendung  awan berlapis dengan gradasi biru tua → muda (ciri Cirebon);
 * - truntum  bunga bintang kecil bertaburan di latar gelap.
 * Tiap keping 60×60 dirancang menyambung dengan keping di sebelahnya, jadi
 * keping yang salah (atau parang yang miring ke arah lain) tampak memutus kain.
 */

const INK = '#3b2412';
const KREM = '#f3e3c1';
const SOGA = '#7a4a22';

/* ---------- cat ---------- */

export function PaintTube({ color, className }: { color: PaintColor; className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden>
      <rect x="14" y="1" width="12" height="9" rx="2" fill="#5c5f66" />
      <path d="M11 10 h18 l3 6 h-24 z" fill="#c9ccd1" />
      <rect x="7" y="15" width="26" height="38" rx="5" fill="#eef0f2" stroke="#9ea4ab" strokeWidth="1.5" />
      <rect x="7.75" y="23" width="24.5" height="23" fill={PAINT_HEX[color]} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <path d="M7 50 h26 v6 h-26 z" fill="#c9ccd1" />
      <path d="M9 53 h22" stroke="#9ea4ab" strokeWidth="1" />
    </svg>
  );
}

/** Tetes/coretan cat — dipakai di resep, toples, dan kartu warna. */
export function PaintBlob({ color, className }: { color: PaintColor; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M20 3 C29 3 37 9 36 19 C35 28 30 37 20 36 C11 36 4 30 4 21 C4 12 10 3 20 3 Z"
        fill={PAINT_HEX[color]}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.5"
      />
      <ellipse cx="14" cy="13" rx="5" ry="3" fill="#fff" opacity="0.35" transform="rotate(-30 14 13)" />
    </svg>
  );
}

/** Nama warna yang ditulis di bawah cat (aturan: tiap warna bernama, untuk anak buta warna). */
export function PaintLabel({ color }: { color: PaintColor }) {
  return <span className="ps-name">{paintName(color)}</span>;
}

/* ---------- roda warna (petunjuk) ---------- */

const WHEEL: PaintColor[] = ['merah', 'oranye', 'kuning', 'hijau', 'biru', 'ungu'];

/**
 * Roda warna kecil untuk petunjuk P2: primer & sekunder berselang-seling, jadi
 * "oranye ada DI ANTARA merah dan kuning" terlihat. `mark` menyalakan satu
 * juring; `temp` menandai separuh panas (merah–kuning) & dingin (hijau–ungu).
 */
export function ColorWheel({ mark, temp, className }: { mark?: PaintColor; temp?: boolean; className?: string }) {
  const seg = (i: number) => {
    const a0 = ((i * 60 - 120) * Math.PI) / 180;
    const a1 = (((i + 1) * 60 - 120) * Math.PI) / 180;
    const p = (a: number, r: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(a0, 16)} L${p(a0, 44)} A44 44 0 0 1 ${p(a1, 44)} L${p(a1, 16)} A16 16 0 0 0 ${p(a0, 16)} Z`;
  };
  const arc = (d0: number, d1: number) => {
    const p = (d: number) => `${(50 + 48 * Math.cos((d * Math.PI) / 180)).toFixed(2)} ${(50 + 48 * Math.sin((d * Math.PI) / 180)).toFixed(2)}`;
    return `M${p(d0 + 4)} A48 48 0 0 1 ${p(d1 - 4)}`;
  };
  return (
    <svg viewBox="-2 -2 104 104" className={className} role="img" aria-label="Roda warna">
      {WHEEL.map((c, i) => (
        <path
          key={c}
          d={seg(i)}
          fill={PAINT_HEX[c]}
          stroke={mark === c ? '#1f1f1f' : '#fff'}
          strokeWidth={mark === c ? 4 : 2}
          opacity={mark && mark !== c ? 0.55 : 1}
        />
      ))}
      {temp && (
        // Separuh panas (merah–kuning) dilingkari jingga, separuh dingin
        // (hijau–ungu) biru. Bukan emoji: emoji di <text> SVG tak tergambar.
        <>
          <path d={arc(-120, 60)} fill="none" stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
          <path d={arc(60, 240)} fill="none" stroke="#0d3a73" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/* ---------- mangkuk ---------- */

/**
 * Mangkuk pencampur. Warna catnya DITULIS LANGSUNG ke DOM oleh template
 * (`paintRef`, `swirlRef`) selama diaduk — React tidak dirender ulang tiap frame.
 */
export function Bowl({
  color,
  paintRef,
  swirlRef,
  className,
}: {
  color: string | null;
  paintRef?: React.Ref<SVGEllipseElement>;
  swirlRef?: React.Ref<SVGPathElement>;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 78" className={className} aria-hidden>
      <ellipse cx="60" cy="72" rx="40" ry="5" fill="rgba(0,0,0,0.1)" />
      <path d="M6 26 Q8 70 60 70 Q112 70 114 26 Z" fill="#fdfdfd" stroke="#b9bec5" strokeWidth="2" />
      <path d="M14 44 Q30 62 60 63" stroke="#e9ecef" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="26" rx="54" ry="12" fill="#f1f3f5" stroke="#b9bec5" strokeWidth="2" />
      <ellipse
        ref={paintRef}
        cx="60"
        cy="27"
        rx="46"
        ry="8.5"
        fill={color ?? 'transparent'}
        stroke={color ? 'rgba(0,0,0,0.15)' : 'none'}
      />
      <path
        ref={swirlRef}
        d="M28 27 C40 18 56 34 66 26 C74 20 86 30 92 27"
        fill="none"
        stroke="transparent"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- palet ---------- */

export function PaletteBoard({ slots, className }: { slots: (PaintColor | null)[]; className?: string }) {
  const pos = slots.map((_, i) => {
    const t = slots.length === 1 ? 0.5 : i / (slots.length - 1);
    return { x: 34 + t * 84, y: 34 + Math.sin(t * Math.PI) * 14 };
  });
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden>
      <path
        d="M80 6 C124 4 156 26 154 50 C152 70 132 84 106 84 C94 84 96 70 84 70 C74 70 70 84 52 84 C22 84 4 66 6 44 C8 22 38 7 80 6 Z"
        fill="#e8c99a"
        stroke="#a87a43"
        strokeWidth="2.5"
      />
      <ellipse cx="128" cy="62" rx="8" ry="6.5" fill="#fff8ec" stroke="#a87a43" strokeWidth="2" />
      {slots.map((c, i) => (
        <circle
          key={i}
          cx={pos[i]!.x}
          cy={pos[i]!.y}
          r="13"
          fill={c ? PAINT_HEX[c] : '#fff8ec'}
          stroke={c ? 'rgba(0,0,0,0.25)' : '#a87a43'}
          strokeWidth="2"
          strokeDasharray={c ? undefined : '4 3'}
        />
      ))}
    </svg>
  );
}

/* ---------- hiasan pinggiran ---------- */

export function Ornament({
  o,
  color,
  flip,
  className,
}: {
  o: OrnamentId;
  color: PaintColor;
  flip?: boolean;
  className?: string;
}) {
  const fill = PAINT_HEX[color];
  const tf = flip ? (o === 'tumpal' || o === 'wajik' ? 'rotate(180 20 20)' : 'matrix(-1 0 0 1 40 0)') : undefined;
  let body;
  switch (o) {
    case 'tumpal':
      body = (
        <>
          <path d="M5 35 L35 35 L20 4 Z" fill={fill} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 32 L28 32 L20 15 Z" fill="#fff" opacity="0.55" />
          <path d="M20 31 L20 19" stroke={INK} strokeWidth="1.4" />
        </>
      );
      break;
    case 'bunga':
      body = (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={20 + 9 * Math.cos(((a - 90) * Math.PI) / 180)}
              cy={20 + 9 * Math.sin(((a - 90) * Math.PI) / 180)}
              r="7"
              fill={fill}
              stroke={INK}
              strokeWidth="1.3"
            />
          ))}
          <circle cx="20" cy="20" r="5" fill="#ffe8a3" stroke={INK} strokeWidth="1.3" />
        </>
      );
      break;
    case 'daun':
      body = (
        <>
          <path d="M6 35 C6 15 20 5 35 5 C35 22 25 35 6 35 Z" fill={fill} stroke={INK} strokeWidth="1.6" />
          <path d="M8 33 C16 24 24 15 31 9" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.7" />
        </>
      );
      break;
    case 'wajik':
      body = (
        <>
          <path d="M20 3 L35 26 L20 37 L5 26 Z" fill={fill} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M20 14 L27 25 L20 30 L13 25 Z" fill="#fff" opacity="0.6" />
        </>
      );
      break;
    case 'sulur':
      body = (
        <path
          d="M7 34 C5 14 33 8 32 24 C31 32 20 31 20 25 C20 21 25 21 25 24"
          fill="none"
          stroke={fill}
          strokeWidth="5"
          strokeLinecap="round"
        />
      );
      break;
  }
  return (
    <svg viewBox="0 0 40 40" className={className} data-ornament={`${o}:${color}${flip ? ':flip' : ''}`} aria-hidden>
      <g transform={tf}>{body}</g>
    </svg>
  );
}

/* ---------- motif batik ---------- */

function Kawung() {
  // Empat "buah kolang-kaling" sepanjang diagonal; ujung luarnya tepat di
  // pojok keping, jadi bertemu ujung bunga tetangga.
  const petals = [
    [1, 1, 45],
    [-1, 1, -45],
    [-1, -1, 45],
    [1, -1, -45],
  ] as const;
  return (
    <>
      <rect width="60" height="60" fill={KREM} />
      {petals.map(([sx, sy, a], i) => (
        <g key={i} transform={`translate(${30 + sx * 15.2} ${30 + sy * 15.2}) rotate(${a})`}>
          <ellipse rx="19.5" ry="8.8" fill={SOGA} stroke={INK} strokeWidth="1.2" />
          <ellipse rx="13" ry="3.6" fill={KREM} />
          <circle cx={6} r="1.4" fill={INK} />
          <circle cx={-6} r="1.4" fill={INK} />
        </g>
      ))}
      <circle cx="30" cy="30" r="3.2" fill={INK} />
      {[
        [0, 0],
        [60, 0],
        [0, 60],
        [60, 60],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill={INK} />
      ))}
    </>
  );
}

const PARANG_S = 'M-14 9 C-21 -4 -3 -13 0 0 C3 13 21 4 14 -9';
const TILE_SHIFTS = [-60, 0, 60].flatMap((x) => [-60, 0, 60].map((y) => [x, y] as const));

function Parang() {
  // Pita miring "/": deret mata parang (lengkung S) di dalam pita, deret
  // mlinjon (belah ketupat kecil) di garis antara dua pita. Satu "sel" pola
  // digambar di sembilan geseran keping, jadi pita & garisnya menyambung
  // mulus ke keping sebelah (yang di luar kotak terpotong sendiri oleh SVG).
  const h = 42.43 / 2;
  return (
    <>
      <rect width="60" height="60" fill={KREM} />
      {TILE_SHIFTS.map(([dx, dy]) => (
        <g key={`${dx}:${dy}`} transform={`translate(${30 + dx} ${30 + dy}) rotate(-45)`}>
          <path d={`M${-h * 2} -14 H${h * 2} M${-h * 2} 14 H${h * 2}`} stroke={INK} strokeWidth="1.4" />
          {[-h, h].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <path d={PARANG_S} fill="none" stroke={SOGA} strokeWidth="7" strokeLinecap="round" />
              <path d={PARANG_S} fill="none" stroke={KREM} strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ))}
          {[-h * 2, 0, h * 2].map((x) => (
            <path key={x} d={`M${x} ${h - 4} L${x + 4} ${h} L${x} ${h + 4} L${x - 4} ${h} Z`} fill={SOGA} />
          ))}
        </g>
      ))}
    </>
  );
}

const CLOUD = 'M-23 7 C-28 -2 -19 -11 -11 -7 C-10 -16 3 -18 6 -9 C11 -16 24 -11 21 -1 C28 0 27 11 18 11 L-18 11 C-23 11 -25 9 -23 7 Z';

function MegaMendung() {
  // Gradasi berlapis biru tua → muda: ciri mega mendung Cirebon.
  const layers = [
    [1, '#0d3a73'],
    [0.78, '#1c6fd6'],
    [0.56, '#6fb3ee'],
    [0.34, '#e3f2ff'],
  ] as const;
  return (
    <>
      <rect width="60" height="60" fill="#b8322b" />
      {[
        [30, 31],
        [0, 1],
        [60, 1],
        [0, 61],
        [60, 61],
      ].map(([x, y], j) => (
        <g key={j} transform={`translate(${x} ${y})`}>
          {layers.map(([s, c], i) => (
            <path key={i} d={CLOUD} transform={`scale(${s})`} fill={c} stroke={INK} strokeWidth={0.8 / s} />
          ))}
        </g>
      ))}
    </>
  );
}

function TruntumFlower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <circle key={i} cx={6.5 * Math.cos(a)} cy={6.5 * Math.sin(a)} r="3" fill="#f6e7c8" />;
      })}
      <circle r="2.8" fill="#d4a24c" />
    </g>
  );
}

function Truntum() {
  // Bunga bintang bertaburan di latar gelap (taburan seperti bintang malam).
  return (
    <>
      <rect width="60" height="60" fill="#3b2412" />
      <TruntumFlower x={30} y={30} />
      {[
        [0, 0],
        [60, 0],
        [0, 60],
        [60, 60],
      ].map(([x, y], i) => (
        <TruntumFlower key={i} x={x} y={y} />
      ))}
      {[
        [15, 15],
        [45, 15],
        [15, 45],
        [45, 45],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.7" fill="#f6e7c8" />
      ))}
    </>
  );
}

/** Satu keping kain batik 60×60. */
export function BatikTileArt({ m, flip, className }: { m: BatikId; flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      data-batik={`${m}${flip ? ':flip' : ''}`}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <g transform={flip ? 'matrix(-1 0 0 1 60 0)' : undefined}>
        {m === 'kawung' ? <Kawung /> : m === 'parang' ? <Parang /> : m === 'mega-mendung' ? <MegaMendung /> : <Truntum />}
      </g>
    </svg>
  );
}
