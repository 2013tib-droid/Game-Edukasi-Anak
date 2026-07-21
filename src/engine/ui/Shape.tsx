import type { ShapeId } from '@/engine/core/types';

/**
 * A geometric shape drawn as inline SVG in a given fill color. Ported from
 * shapeSVG() in petualangan-pintar.html — the Bawah Laut world needs every
 * shape×color combination and emoji simply don't cover them.
 */
export default function Shape({
  kind,
  color,
  size = 70,
}: {
  kind: ShapeId;
  color: string;
  size?: number;
}) {
  const p = { fill: color, stroke: 'rgba(0,0,0,.15)', strokeWidth: 3 };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
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
    </svg>
  );
}
