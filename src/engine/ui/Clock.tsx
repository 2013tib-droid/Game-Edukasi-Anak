import type { ClockSpec } from '@/engine/core/types';

/**
 * An analog clock face drawn as inline SVG — WITH the numbers 1–12 on it.
 *
 * The Jam Pintar world used to render clocks with the clock-face emoji
 * (🕐–🕧). Those have no numerals at all (and on some phones the hands are
 * barely visible), so a child could only compare hand angles instead of
 * actually reading a clock. Everything here is drawn by us, so it looks the
 * same on every device and the numbers are always there.
 *
 * The two hands are deliberately different: the hour hand is short, fat and
 * dark blue, the minute hand is long, thin and red — "jarum pendek" vs
 * "jarum panjang" must be obvious at a glance on a small phone.
 */

const FACE = '#FFFDF5';
const RIM = '#F2A73B';
const NUM = '#3A2E20';
const HOUR_HAND = '#2F4B7C';
const MINUTE_HAND = '#E4572E';

const RING = '#DDEBFF';
const RING_NUM = '#2F4B7C';
const ARC = '#3CB878';

/**
 * Sector of the face from minute `a` to minute `b` (any direction, under a full
 * hour), as an SVG path. Minutes, not degrees: 1 minute = 6°.
 */
function sector(a: number, b: number, r: number): string {
  const [x0, y0] = at(a * 6, r);
  const [x1, y1] = at(b * 6, r);
  const span = Math.abs(b - a);
  const large = span > 30 ? 1 : 0;
  const sweep = b > a ? 1 : 0;
  return `M50 50 L${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1} Z`;
}

/**
 * BUSUR WAKTU (Waktu Tepat): area yang disapu jarum panjang dari `from` sampai
 * `to` — "tiga puluh menit" jadi setengah lingkaran yang kelihatan. Tiap jam
 * penuh menambah satu lapis lingkaran tembus pandang, jadi "satu jam
 * seperempat" terbaca sebagai satu lingkaran utuh + seperempat yang lebih tua.
 */
function TimeArc({ from, to }: { from: number; to: number }) {
  const span = Math.abs(to - from);
  if (span < 1) return null;
  const dir = to > from ? 1 : -1;
  const full = Math.floor(span / 60);
  const rest = span - full * 60;
  const r = 30;
  const start = from + dir * full * 60;
  return (
    <g data-arc={span} opacity="0.32" fill={ARC}>
      {Array.from({ length: full }, (_, i) => (
        <circle key={i} cx="50" cy="50" r={r} />
      ))}
      {rest > 0 && <path d={sector(start % 60, start % 60 + dir * rest, r)} />}
    </g>
  );
}

/** Point on the face at `deg` clockwise from 12 o'clock, `r` from the center. */
function at(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
}

export default function Clock({
  time,
  size = 120,
  className,
  ring24 = false,
  arc,
}: {
  time: ClockSpec;
  size?: number;
  /** Optional class so CSS can size the clock fluidly (fill an answer card). */
  className?: string;
  /**
   * Cincin luar berangka 13–24 (jam 24, kelas 4). Angkanya menempel di luar
   * angka 1–12 yang sama posisinya, jadi anak melihat 13 = satu siang.
   */
  ring24?: boolean;
  /**
   * Busur waktu, dalam MENIT jarum panjang sejak suatu titik (boleh lebih
   * dari 60 dan boleh mundur) — lihat `TimeArc`.
   */
  arc?: { from: number; to: number };
}) {
  const m = time.m ?? 0;
  // The hour hand creeps forward as the minutes pass — at half past it sits
  // exactly between two numbers, which is what makes "setengah" readable.
  const hourDeg = (time.h % 12) * 30 + m * 0.5;
  const minuteDeg = m * 6;
  const [hx, hy] = at(hourDeg, 21);
  // Stops just short of the numerals (r 34.5) so the hand never sits on top
  // of the number it points at.
  const [mx, my] = at(minuteDeg, 28);

  return (
    <svg
      className={className}
      data-clock={`${time.h}:${String(m).padStart(2, '0')}`}
      width={size}
      height={size}
      viewBox={ring24 ? '-17 -17 134 134' : '0 0 100 100'}
      aria-hidden
    >
      {ring24 && (
        <g data-ring24="">
          <circle cx="50" cy="50" r="65" fill={RING} />
          {Array.from({ length: 12 }, (_, i) => {
            const n = i + 13;
            const [x, y] = at((i + 1) * 30, 57.5);
            return (
              <text
                key={n}
                x={x}
                y={y}
                fill={RING_NUM}
                fontSize="9"
                fontWeight="700"
                fontFamily="inherit"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {n}
              </text>
            );
          })}
        </g>
      )}
      <circle cx="50" cy="50" r="46" fill={FACE} stroke={RIM} strokeWidth="6" />
      {arc && <TimeArc from={arc.from} to={arc.to} />}
      {/* Hour ticks, tucked between the rim and the numerals. */}
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = at(i * 30, 40.5);
        return <circle key={i} cx={x} cy={y} r="1.3" fill={RIM} />;
      })}
      {/* The numerals — the whole reason this component exists. */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const [x, y] = at(n * 30, 34.5);
        return (
          <text
            key={n}
            x={x}
            y={y}
            fill={NUM}
            fontSize="12"
            fontWeight="700"
            fontFamily="inherit"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {n}
          </text>
        );
      })}
      <line
        x1="50"
        y1="50"
        x2={hx}
        y2={hy}
        stroke={HOUR_HAND}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2={mx}
        y2={my}
        stroke={MINUTE_HAND}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="3.6" fill={HOUR_HAND} />
    </svg>
  );
}
