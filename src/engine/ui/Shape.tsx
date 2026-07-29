import type { ShapeId } from '@/engine/core/types';

/**
 * A geometric shape drawn as inline SVG in a given fill color. Ported from
 * shapeSVG() in petualangan-pintar.html — the Labirin Warna world needs every
 * shape×color combination and emoji simply don't cover them.
 */
export default function Shape({
  kind,
  color,
  size = 70,
  className,
}: {
  kind: ShapeId;
  color: string;
  size?: number;
  /** Optional class so CSS can size the shape fluidly (e.g. fill an answer card). */
  className?: string;
}) {
  const p = { fill: color, stroke: 'rgba(0,0,0,.15)', strokeWidth: 3 };
  return (
    <svg
      className={className}
      data-shape={kind}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
    >
      {kind === 'lingkaran' && <circle cx="50" cy="50" r="42" {...p} />}
      {kind === 'kotak' && <rect x="12" y="12" width="76" height="76" rx="10" {...p} />}
      {kind === 'segitiga' && <polygon points="50,10 92,88 8,88" {...p} />}
      {kind === 'bintang' && (
        <polygon
          points="50,6 61,38 95,38 68,58 78,92 50,71 22,92 32,58 5,38 39,38"
          {...p}
        />
      )}
      {kind === 'hati' && (
        <path
          d="M50 88 C20 62 8 44 14 28 C20 12 42 12 50 30 C58 12 80 12 86 28 C92 44 80 62 50 88 Z"
          {...p}
        />
      )}
      {kind === 'oval' && <ellipse cx="50" cy="50" rx="44" ry="30" {...p} />}
      {kind === 'ketupat' && <polygon points="50,8 92,50 50,92 8,50" {...p} />}
      {kind === 'persegi-panjang' && <rect x="6" y="26" width="88" height="48" rx="8" {...p} />}
      {kind === 'trapesium' && <polygon points="26,16 74,16 94,86 6,86" {...p} />}
      {kind === 'segilima' && <polygon points="50,6 94,38 77,90 23,90 6,38" {...p} />}
      {kind === 'segienam' && <polygon points="50,6 91,28 91,72 50,94 9,72 9,28" {...p} />}
      {kind === 'layang-layang' && <polygon points="50,4 88,40 50,96 12,40" {...p} />}
      {kind === 'bulan' && <path d="M68 10 A42 42 0 1 0 68 90 Q40 50 68 10 Z" {...p} />}
      {kind === 'awan' && (
        <path
          d="M25 75 A18 18 0 0 1 25 39 A22 22 0 0 1 58 27 A18 18 0 0 1 84 41 A18 18 0 0 1 78 75 Z"
          {...p}
        />
      )}
    </svg>
  );
}
