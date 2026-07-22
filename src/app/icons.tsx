/**
 * Small inline SVG icons — stroked, currentColor, sized 18px. Used by the
 * app header and back links so the parent-facing chrome looks consistent and
 * professional (no emoji).
 */
const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function HomeIcon() {
  return (
    <svg {...base}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 19.5c0-3.4 2.9-5.4 6.5-5.4s6.5 2 6.5 5.4" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg {...base}>
      <path d="M20 12H5" />
      <path d="M11 6 5 12l6 6" />
    </svg>
  );
}
