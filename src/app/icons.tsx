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

export function BellIcon() {
  return (
    <svg {...base}>
      <path d="M18 16.5V11a6 6 0 1 0-12 0v5.5L4.5 19h15z" />
      <path d="M10 21.5a2.4 2.4 0 0 0 4 0" />
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

/* Ikon tombol di layar verifikasi email. Dulu emoji (✅ 📧 🎮) — dan 📧
   tampil sebagai kotak ungu buram di sebagian HP. Dirender di dalam lencana
   bulat berwarna (`.btn-badge`), jadi garisnya putih & sedikit lebih tebal. */
const badge = { ...base, width: 20, height: 20, strokeWidth: 2.6 };

export function CheckBadgeIcon() {
  return (
    <svg {...badge}>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg {...badge}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </svg>
  );
}

export function GamepadIcon() {
  return (
    <svg {...badge}>
      <path d="M7 7.5h10a4.5 4.5 0 0 1 4.3 5.8l-1.2 4a2.4 2.4 0 0 1-4 1L14.4 16.5H9.6L7.9 18.3a2.4 2.4 0 0 1-4-1l-1.2-4A4.5 4.5 0 0 1 7 7.5Z" />
      <path d="M8 10.5v3M6.5 12h3" />
      <circle cx="16" cy="11" r="0.6" fill="currentColor" />
      <circle cx="17.5" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}
