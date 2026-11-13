import { forwardRef } from 'react';
import { feelWeights, type FaceShape } from '@/engine/core/feelings';

/**
 * WAJAH ANAK AYAM (template `face-feel`, Wajah Perasaan). Digambar ENGINE
 * supaya (a) sama di semua HP, (b) bagiannya bisa digeser anak.
 *
 * Geometrinya SATU fungsi (`faceAttrs`): React memakainya untuk gambar
 * pertama, dan template menulis ulang atribut yang sama LANGSUNG ke DOM
 * (`paintFace`) selama jari menyeret — tanpa render ulang React per gerakan
 * (pelajaran PathTrace). Tiap bagian yang bisa berubah ditandai `data-fp`.
 *
 * Kotak gambar 200 × 200. Mata di y 100, paruh 121, mulut 150, alis 76.
 */

type Attrs = Record<string, string | number>;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const f1 = (v: number) => Math.round(v * 10) / 10;

export function faceAttrs(s: FaceShape): Record<string, Attrs> {
  const w = feelWeights(s);
  const wide = clamp01((s.eye - 0.6) / 0.4);
  const squint = clamp01((0.6 - s.eye) / 0.2);
  const happy = clamp01((s.mouth - 0.57) / 0.05);
  const white = clamp01((wide - 0.3) / 0.3);
  const lift = 10 * wide;

  const out: Record<string, Attrs> = {};

  // Alis: ujung DALAM turun = marah (V), naik = sedih/cemas.
  const yi = 77 + 11 * s.brow - lift;
  const yo = 77 - 5 * s.brow - lift;
  out.browL = { d: `M54 ${f1(yo)} Q70 ${f1((yi + yo) / 2 - 4)} 87 ${f1(yi)}` };
  out.browR = { d: `M146 ${f1(yo)} Q130 ${f1((yi + yo) / 2 - 4)} 113 ${f1(yi)}` };

  // Mata.
  for (const [side, cx] of [
    ['L', 72],
    ['R', 128],
  ] as const) {
    const cy = 102;
    out[`sclera${side}`] = { cx, cy, rx: 14, ry: f1(16 * (0.85 + 0.15 * wide)), opacity: f1(white * (1 - happy)) };
    out[`pupil${side}`] = {
      cx,
      cy: f1(cy + 1.5 * wide),
      rx: f1(9.5 - 3.5 * wide),
      ry: f1(11.5 - 4.5 * wide - 5 * squint),
      opacity: f1(1 - happy),
    };
    out[`hi${side}`] = { cx: cx + 3, cy: f1(cy - 4 + 1.5 * wide - 1.5 * squint), r: f1(3.2 - 1.2 * wide), opacity: f1((1 - happy) * (1 - squint * 0.6)) };
    out[`happy${side}`] = { d: `M${cx - 12} ${cy + 4} Q${cx} ${cy - 12} ${cx + 12} ${cy + 4}`, opacity: f1(happy) };
  }

  // Mulut: dua kurva (atas & bawah) di antara dua sudut.
  const halfW = 22 - 7 * s.open * (1 - Math.max(0, s.mouth));
  const y0 = 150 - 6 * s.mouth;
  const top = y0 + 22 * s.mouth - 12 * s.open;
  const bot = y0 + 22 * s.mouth + 26 * s.open;
  const x1 = 100 - halfW;
  const x2 = 100 + halfW;
  out.mouth = { d: `M${f1(x1)} ${f1(y0)} Q100 ${f1(top)} ${f1(x2)} ${f1(y0)} Q100 ${f1(bot)} ${f1(x1)} ${f1(y0)}Z` };

  // Hiasan dari kedekatan ke tiap perasaan.
  out.blush = { opacity: f1(0.9 * Math.max(w.senang, 0.5 * w.kaget)) };
  out.tear = { opacity: f1(w.sedih) };
  out.sweat = { opacity: f1(w.takut) };
  out.anger = { opacity: f1(w.marah) };
  out.tint = { opacity: f1(0.32 * w.marah) };
  out.pale = { opacity: f1(0.4 * w.takut) };
  out.pop = { opacity: f1(w.kaget) };
  out.shine = { opacity: f1(w.senang) };

  // Sayap: senang melambai, sedih terkulai, takut menutup, kaget terangkat.
  // Positif = sayap terangkat ke luar.
  const a = 60 * w.senang - 18 * w.sedih + 25 * w.marah + 35 * w.takut + 95 * w.kaget;
  out.wingL = { transform: `rotate(${f1(a)} 40 124)` };
  out.wingR = { transform: `rotate(${f1(-a)} 160 124)` };
  return out;
}

/** Tulis bentuk wajah ke SVG yang sudah tergambar (tanpa React). */
export function paintFace(root: Element | null, s: FaceShape): void {
  if (!root) return;
  const attrs = faceAttrs(s);
  root.querySelectorAll<SVGElement>('[data-fp]').forEach((el) => {
    const a = attrs[el.dataset.fp!];
    if (!a) return;
    for (const [k, v] of Object.entries(a)) el.setAttribute(k, String(v));
  });
}

interface Props {
  shape: FaceShape;
  className?: string;
  /** Teks untuk pembaca layar (nama perasaan). Tanpa = hiasan. */
  label?: string;
  /** Id unik untuk gradien (beberapa wajah dalam satu layar). */
  uid: string;
  children?: React.ReactNode;
}

const Face = forwardRef<SVGSVGElement, Props>(function Face({ shape, className, label, uid, children }, ref) {
  const a = faceAttrs(shape);
  const g = `ffg-${uid}`;
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={`${g}-body`} cx="40%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="0.55" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#f6b51e" />
        </radialGradient>
        <radialGradient id={`${g}-wing`} cx="50%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffe36e" />
          <stop offset="1" stopColor="#f2a91a" />
        </radialGradient>
      </defs>

      {/* bayangan lantai */}
      <ellipse cx="100" cy="194" rx="58" ry="5" fill="#000" opacity="0.08" />

      {/* kaki */}
      <g fill="#ff9a2e" stroke="#d9741a" strokeWidth="2" strokeLinejoin="round">
        <path d="M76 182 l-8 9 h8 l2 -4 l2 4 h8 l-6 -9 Z" />
        <path d="M124 182 l-8 9 h8 l2 -4 l2 4 h8 l-6 -9 Z" />
      </g>

      {/* sayap (di belakang badan) */}
      <g data-fp="wingL" transform={String(a.wingL!.transform)}>
        <ellipse cx="20" cy="140" rx="17" ry="27" fill={`url(#${g}-wing)`} stroke="#e39a12" strokeWidth="2.5" />
      </g>
      <g data-fp="wingR" transform={String(a.wingR!.transform)}>
        <ellipse cx="180" cy="140" rx="17" ry="27" fill={`url(#${g}-wing)`} stroke="#e39a12" strokeWidth="2.5" />
      </g>

      {/* jambul */}
      <g fill="#ffd84d" stroke="#e39a12" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M100 38 C92 22 84 18 78 20 C86 24 90 30 92 38 Z" />
        <path d="M100 38 C100 20 104 10 112 8 C108 18 107 28 106 38 Z" />
        <path d="M104 38 C112 26 120 22 126 24 C118 28 113 33 110 40 Z" />
      </g>

      {/* badan */}
      <circle cx="100" cy="112" r="80" fill={`url(#${g}-body)`} stroke="#e8a114" strokeWidth="3" />
      <ellipse cx="100" cy="156" rx="50" ry="30" fill="#fff4c4" opacity="0.85" />
      <circle data-fp="tint" cx="100" cy="112" r="78" fill="#ff5b3a" opacity={a.tint!.opacity} />
      <circle data-fp="pale" cx="100" cy="112" r="78" fill="#ffffff" opacity={a.pale!.opacity} />
      <ellipse cx="74" cy="60" rx="18" ry="9" fill="#fff" opacity="0.45" transform="rotate(-25 74 60)" />

      {/* pipi */}
      <g data-fp="blush" opacity={a.blush!.opacity} fill="#ff8fa3">
        <ellipse cx="52" cy="130" rx="12" ry="7.5" />
        <ellipse cx="148" cy="130" rx="12" ry="7.5" />
      </g>

      {/* mata */}
      {(['L', 'R'] as const).map((sd) => (
        <g key={sd} className="ff-eye">
          <ellipse data-fp={`sclera${sd}`} {...a[`sclera${sd}`]} fill="#fff" stroke="#5a3a1a" strokeWidth="2.5" />
          <ellipse data-fp={`pupil${sd}`} {...a[`pupil${sd}`]} fill="#3b2412" />
          <circle data-fp={`hi${sd}`} {...a[`hi${sd}`]} fill="#fff" />
          <path data-fp={`happy${sd}`} {...a[`happy${sd}`]} fill="none" stroke="#3b2412" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      ))}

      {/* alis */}
      <g fill="none" stroke="#7a4a1c" strokeWidth="6" strokeLinecap="round">
        <path data-fp="browL" d={String(a.browL!.d)} />
        <path data-fp="browR" d={String(a.browR!.d)} />
      </g>

      {/* paruh */}
      <path d="M90 118 Q100 110 110 118 Q100 128 90 118 Z" fill="#ff9a2e" stroke="#d9741a" strokeWidth="2" strokeLinejoin="round" />

      {/* mulut */}
      <path data-fp="mouth" d={String(a.mouth!.d)} fill="#a8402a" stroke="#5a2a14" strokeWidth="4.5" strokeLinejoin="round" />

      {/* air mata */}
      <g data-fp="tear" opacity={a.tear!.opacity}>
        <path className="ff-tear" d="M62 116 C56 126 55 132 62 134 C69 132 68 126 62 116 Z" fill="#7cc6ff" stroke="#3f9ae0" strokeWidth="1.8" />
      </g>
      {/* keringat */}
      <g data-fp="sweat" opacity={a.sweat!.opacity}>
        <path d="M160 58 C153 70 152 77 160 79 C168 77 167 70 160 58 Z" fill="#bfe6ff" stroke="#5aa8e6" strokeWidth="1.8" />
      </g>
      {/* tanda kesal + uap */}
      <g data-fp="anger" opacity={a.anger!.opacity}>
        <g stroke="#e5262c" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M150 48 q5 4 0 9 M158 44 q-4 5 1 9 M150 48 q4 -5 9 -1 M150 57 q5 -4 9 -1" />
        </g>
        <g className="ff-steam" fill="#fff" stroke="#c9c9c9" strokeWidth="2">
          <circle cx="24" cy="44" r="9" />
          <circle cx="34" cy="36" r="7" />
          <circle cx="176" cy="40" r="8" />
        </g>
      </g>
      {/* garis kaget */}
      <g data-fp="pop" opacity={a.pop!.opacity} stroke="#ff7a3a" strokeWidth="4.5" strokeLinecap="round">
        <path d="M22 66 l-14 -8 M18 84 l-16 0 M178 66 l14 -8 M182 84 l16 0 M40 34 l-8 -12 M160 34 l8 -12" />
      </g>
      {/* kilau senang */}
      <g data-fp="shine" opacity={a.shine!.opacity} fill="#ffcf1f" stroke="#e39a12" strokeWidth="1.5">
        <path className="ff-twinkle" d="M172 28 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
        <path className="ff-twinkle ff-twinkle--late" d="M26 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" />
      </g>
      {children}
    </svg>
  );
});

export default Face;
