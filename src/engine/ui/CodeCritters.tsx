import type { CodeDir } from '@/engine/core/codeQuest';

/**
 * Hewan yang "mengintip" dari atas kartu panah di baki code-quest (mockup
 * pemilik 2026-10-13): pinguin = atas (biru), katak = kanan (hijau),
 * singa = bawah (oranye), kelinci = kiri (merah muda).
 *
 * Digambar engine, BUKAN seni item WebP: seni item itu badan utuh dengan pose
 * berbeda-beda, jadi kepalanya tak bisa dipotong rapi ke tepi kartu. Di sini
 * semua kepala satu gaya, kaki depannya menggantung tepat di garis y≈34 —
 * tepi atas kartu. viewBox 80×40: x 10–70 kepala, sisanya garis kilau.
 */

function Sparks() {
  return (
    <g className="cq-peek__spark" stroke="#ffd23f" strokeWidth="2.6" strokeLinecap="round">
      <path d="M4 15 L9 18 M3 23 H9 M5 31 L9 28" />
      <path d="M76 15 L71 18 M77 23 H71 M75 31 L71 28" />
    </g>
  );
}

function Eye({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#2b2140" />
      <circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.36} fill="#fff" />
    </g>
  );
}

function Cheeks({ y, dx = 11 }: { y: number; dx?: number }) {
  return (
    <g fill="#ff9fb4" opacity="0.8">
      <ellipse cx={40 - dx} cy={y} rx="3.4" ry="2.2" />
      <ellipse cx={40 + dx} cy={y} rx="3.4" ry="2.2" />
    </g>
  );
}

function Paws({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth="1.4">
      <ellipse cx="27" cy="35" rx="5.6" ry="3.6" />
      <ellipse cx="53" cy="35" rx="5.6" ry="3.6" />
    </g>
  );
}

function Penguin() {
  return (
    <>
      <ellipse cx="40" cy="22" rx="17" ry="15" fill="#34406b" />
      <path d="M40 15 C34 9 25 13 26 21 C27 29 33 32 40 32 C47 32 53 29 54 21 C55 13 46 9 40 15 Z" fill="#fff" />
      <Eye x={34} y={20} />
      <Eye x={46} y={20} />
      <path d="M37 24 H43 L40 28 Z" fill="#ff9b2f" stroke="#e07a12" strokeWidth="1" strokeLinejoin="round" />
      <Cheeks y={26} dx={10} />
      <Paws fill="#34406b" stroke="#232c4f" />
    </>
  );
}

function Frog() {
  return (
    <>
      <ellipse cx="40" cy="25" rx="19" ry="12" fill="#5fcf5a" stroke="#3a9e3a" strokeWidth="1.4" />
      <circle cx="31" cy="13" r="7.5" fill="#5fcf5a" stroke="#3a9e3a" strokeWidth="1.4" />
      <circle cx="49" cy="13" r="7.5" fill="#5fcf5a" stroke="#3a9e3a" strokeWidth="1.4" />
      <circle cx="31" cy="13" r="5" fill="#fff" />
      <circle cx="49" cy="13" r="5" fill="#fff" />
      <Eye x={31} y={13.5} r={3} />
      <Eye x={49} y={13.5} r={3} />
      <path d="M33 25 Q40 32 47 25 Q40 28 33 25 Z" fill="#c2384f" stroke="#2b2140" strokeWidth="1.3" strokeLinejoin="round" />
      <Cheeks y={25} dx={13} />
      <Paws fill="#5fcf5a" stroke="#3a9e3a" />
    </>
  );
}

function Lion() {
  const mane = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return <circle key={i} cx={40 + Math.cos(a) * 14} cy={21 + Math.sin(a) * 12.5} r="6" />;
  });
  return (
    <>
      <g fill="#d9792b" stroke="#b25a17" strokeWidth="1.2">{mane}</g>
      <ellipse cx="40" cy="21" rx="15" ry="13.5" fill="#d9792b" />
      <circle cx="29" cy="11" r="4" fill="#ffcf6b" stroke="#c98a2a" strokeWidth="1.2" />
      <circle cx="51" cy="11" r="4" fill="#ffcf6b" stroke="#c98a2a" strokeWidth="1.2" />
      <ellipse cx="40" cy="22" rx="11.5" ry="10.5" fill="#ffd77d" />
      <Eye x={35} y={20} r={2.8} />
      <Eye x={45} y={20} r={2.8} />
      <ellipse cx="40" cy="25" rx="5" ry="3.6" fill="#fff3d6" />
      <path d="M38 23.4 H42 L40 25.4 Z" fill="#6b3a1f" />
      <path d="M37.5 27.2 Q40 29.6 42.5 27.2" fill="none" stroke="#6b3a1f" strokeWidth="1.2" strokeLinecap="round" />
      <Cheeks y={25} dx={8.5} />
      <Paws fill="#ffd77d" stroke="#c98a2a" />
    </>
  );
}

function Rabbit() {
  return (
    <>
      <g fill="#fff" stroke="#d9c9cf" strokeWidth="1.3">
        <ellipse cx="32" cy="9" rx="4.6" ry="11" transform="rotate(-10 32 9)" />
        <ellipse cx="48" cy="9" rx="4.6" ry="11" transform="rotate(10 48 9)" />
      </g>
      <g fill="#ffb3c6">
        <ellipse cx="32" cy="9.5" rx="2.2" ry="8" transform="rotate(-10 32 9.5)" />
        <ellipse cx="48" cy="9.5" rx="2.2" ry="8" transform="rotate(10 48 9.5)" />
      </g>
      <ellipse cx="40" cy="24" rx="15" ry="12" fill="#fff" stroke="#d9c9cf" strokeWidth="1.3" />
      <Eye x={34.5} y={23} r={2.8} />
      {/* Mengedip — seperti di mockup. */}
      <path d="M43 23 Q46 20.5 49 23" fill="none" stroke="#2b2140" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M38.6 26.6 H41.4 L40 28 Z" fill="#ff7a99" />
      <path d="M38 29 Q40 30.6 42 29" fill="none" stroke="#2b2140" strokeWidth="1.1" strokeLinecap="round" />
      <Cheeks y={28} dx={10} />
      <Paws fill="#fff" stroke="#d9c9cf" />
    </>
  );
}

const CRITTER: Record<CodeDir, () => JSX.Element> = {
  atas: Penguin,
  kanan: Frog,
  bawah: Lion,
  kiri: Rabbit,
};

export default function CodeCritter({ dir }: { dir: CodeDir }) {
  const Face = CRITTER[dir];
  return (
    <svg viewBox="0 0 80 40" className="cq-peek" aria-hidden>
      <Sparks />
      <g transform="translate(40 36) scale(1.2) translate(-40 -36)">
        <Face />
      </g>
    </svg>
  );
}
