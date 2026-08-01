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

/** Point on the face at `deg` clockwise from 12 o'clock, `r` from the center. */
function at(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
}

export default function Clock({
  time,
  size = 120,
  className,
}: {
  time: ClockSpec;
  size?: number;
  /** Optional class so CSS can size the clock fluidly (fill an answer card). */
  className?: string;
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
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle cx="50" cy="50" r="46" fill={FACE} stroke={RIM} strokeWidth="6" />
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
