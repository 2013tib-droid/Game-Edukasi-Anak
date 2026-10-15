import { RULE_HEX, chipKind, sizeOf, type RuleChip, type RuleToy } from '@/engine/core/ruleSort';

/**
 * Gambar template `rule-sort`: mainan (bentuk berwarna bermata) dan TANDA
 * (kondisi KALAU). Semua digambar engine — tak ada aset yang perlu diunduh,
 * dan tampilannya sama di semua HP.
 *
 * Aturan rupa tanda (jangan diubah tanpa alasan kuat):
 * - tanda WARNA = tetes cat berwarna — SENGAJA bukan lingkaran, karena
 *   lingkaran merah akan terbaca "mainan lingkaran merah", bukan "merah";
 * - tanda BENTUK = siluet PUTIH bergaris tebal — tanpa warna, artinya "warna
 *   apa saja" (abu-abu ditolak: terbaca sebagai mainan abu-abu);
 * - tanda UKURAN = dua balok besar–kecil, yang dimaksud diisi;
 * - tanda LAINNYA = tiga mainan kecil campur = "semua sisanya".
 */

/** Mainan: bentuk berwarna + dua mata, supaya terasa seperti mainan, bukan soal geometri. */
export function ToyArt({ toy, className }: { toy: RuleToy; className?: string }) {
  const small = sizeOf(toy) === 'kecil';
  // Titik tengah tiap bentuk (bintang & segitiga beratnya di bawah).
  const eyeY = toy.shape === 'segitiga' ? 62 : toy.shape === 'hati' ? 44 : 50;
  return (
    <span
      className={'rs-toy' + (small ? ' rs-toy--small' : '') + (className ? ' ' + className : '')}
      data-toy={`${toy.color}-${toy.shape}-${sizeOf(toy)}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden>
        <ShapeInner toy={toy} />
        <g fill="#2b2118">
          <ellipse cx="39" cy={eyeY} rx="5.4" ry="7" />
          <ellipse cx="61" cy={eyeY} rx="5.4" ry="7" />
        </g>
        <g fill="#fff">
          <circle cx="40.6" cy={eyeY - 2.6} r="2" />
          <circle cx="62.6" cy={eyeY - 2.6} r="2" />
        </g>
      </svg>
    </span>
  );
}

/** Isi SVG `Shape` tanpa pembungkus <svg> — supaya mata bisa ditumpuk di SVG yang sama. */
function ShapeInner({ toy }: { toy: RuleToy }) {
  const p = { fill: RULE_HEX[toy.color], stroke: 'rgba(0,0,0,.18)', strokeWidth: 3 };
  switch (toy.shape) {
    case 'lingkaran':
      return <circle cx="50" cy="50" r="42" {...p} />;
    case 'segitiga':
      return <polygon points="50,8 93,88 7,88" strokeLinejoin="round" {...p} />;
    case 'bintang':
      return <polygon points="50,6 61,38 95,38 68,58 78,92 50,71 22,92 32,58 5,38 39,38" strokeLinejoin="round" {...p} />;
    case 'hati':
      return <path d="M50 88 C20 62 8 44 14 28 C20 12 42 12 50 30 C58 12 80 12 86 28 C92 44 80 62 50 88 Z" {...p} />;
  }
}

/** Tetes cat (tanda warna). */
function Drop({ hex }: { hex: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path
        d="M50 8 C62 30 80 46 80 64 C80 82 66 94 50 94 C34 94 20 82 20 64 C20 46 38 30 50 8 Z"
        fill={hex}
        stroke="rgba(0,0,0,.2)"
        strokeWidth="3"
      />
      <path d="M36 62 C36 54 40 48 44 44" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

/** Siluet putih bergaris (tanda bentuk = warna apa saja). */
function Outline({ shape }: { shape: RuleToy['shape'] }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <g fill="#fff" stroke="#3b4656" strokeWidth="8" strokeLinejoin="round">
        {shape === 'lingkaran' && <circle cx="50" cy="50" r="38" />}
        {shape === 'segitiga' && <polygon points="50,12 90,86 10,86" />}
        {shape === 'bintang' && <polygon points="50,8 61,38 93,38 67,57 77,90 50,70 23,90 33,57 7,38 39,38" />}
        {shape === 'hati' && (
          <path d="M50 86 C22 62 10 45 16 30 C22 15 42 15 50 32 C58 15 78 15 84 30 C90 45 78 62 50 86 Z" />
        )}
      </g>
    </svg>
  );
}

function SizeMark({ big }: { big: boolean }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <rect
        x="8"
        y="26"
        width="52"
        height="52"
        rx="10"
        fill={big ? '#3b4656' : '#fff'}
        stroke="#3b4656"
        strokeWidth="6"
        strokeDasharray={big ? undefined : '9 7'}
      />
      <rect
        x="68"
        y="52"
        width="26"
        height="26"
        rx="6"
        fill={big ? '#fff' : '#3b4656'}
        stroke="#3b4656"
        strokeWidth="5"
        strokeDasharray={big ? '7 5' : undefined}
      />
    </svg>
  );
}

function Others() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <circle cx="30" cy="34" r="17" fill={RULE_HEX.merah} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      <polygon points="72,16 92,52 52,52" fill={RULE_HEX.biru} stroke="rgba(0,0,0,.18)" strokeWidth="3" strokeLinejoin="round" />
      <polygon
        points="50,56 56,71 72,71 59,80 64,95 50,86 36,95 41,80 28,71 44,71"
        fill={RULE_HEX.kuning}
        stroke="rgba(0,0,0,.18)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Gambar satu tanda. */
export function ChipArt({ chip }: { chip: RuleChip }) {
  const kind = chipKind(chip);
  return (
    <span className={`rs-chipart rs-chipart--${kind}`} data-chip={chip}>
      {kind === 'warna' && <Drop hex={RULE_HEX[chip as keyof typeof RULE_HEX]} />}
      {kind === 'bentuk' && <Outline shape={chip as RuleToy['shape']} />}
      {kind === 'ukuran' && <SizeMark big={chip === 'besar'} />}
      {kind === 'lainnya' && <Others />}
    </span>
  );
}
