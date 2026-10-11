/**
 * Garden backdrop behind the landing hero (owner's ChatGPT mockup,
 * 2026-10-11): rolling hills along the bottom edge, a tree + bush + flowers
 * cluster in each bottom corner. Inline SVG — zero downloads, same on every
 * phone, the same reasoning as `Scene.tsx` for story backgrounds.
 *
 * Three separate pieces instead of one picture on purpose: a single SVG with
 * `slice` would show only grass on a wide screen and lop the trees off on a
 * narrow one. The hills stretch with the width (`preserveAspectRatio="none"`
 * — gentle curves survive being stretched), while the corner clusters keep
 * their shape and only scale with the screen.
 *
 * Everything sits BELOW the hero's text and buttons; the middle of the hero
 * stays plain sky so the headline stays readable.
 */
function Tree({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} 0) scale(${s})`}>
      <path d="M-6 132 L-5 78 Q0 72 5 78 L6 132 Z" fill="#c08a5c" />
      <path d="M-1 100 Q-12 92 -16 84" stroke="#c08a5c" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="52" r="32" fill="#92d36f" />
      <circle cx="-24" cy="68" r="22" fill="#86cb63" />
      <circle cx="24" cy="66" r="24" fill="#86cb63" />
      <circle cx="-8" cy="40" r="16" fill="#b2e68c" opacity="0.8" />
      <circle cx="14" cy="30" r="5" fill="#ff9aa8" />
      <circle cx="-20" cy="58" r="4.5" fill="#ffd166" />
      <circle cx="26" cy="58" r="4.5" fill="#ff9aa8" />
    </g>
  );
}

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 V12" stroke="#6cb24f" strokeWidth="2" />
      <circle cx="-3.5" cy="0" r="3.2" fill={c} />
      <circle cx="3.5" cy="0" r="3.2" fill={c} />
      <circle cx="0" cy="-3.5" r="3.2" fill={c} />
      <circle cx="0" cy="3.5" r="3.2" fill={c} />
      <circle cx="0" cy="0" r="2.4" fill="#ffe066" />
    </g>
  );
}

function Cluster({ side }: { side: 'l' | 'r' }) {
  // The right cluster is the left one mirrored, with a smaller tree, so the
  // two corners don't read as a stamped copy.
  const big = side === 'l';
  return (
    <svg
      className={`hg-cluster hg-cluster--${side}`}
      viewBox="0 0 170 140"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g transform={big ? undefined : 'translate(170 0) scale(-1 1)'}>
        <Tree x={52} s={big ? 1 : 0.86} />
        <circle cx="112" cy="128" r="24" fill="#7fc65d" />
        <circle cx="140" cy="132" r="18" fill="#8fd36f" />
        <circle cx="96" cy="134" r="14" fill="#93d872" />
        <Flower x={104} y={112} c="#ff9aa8" />
        <Flower x={128} y={118} c="#ffffff" />
        <Flower x={150} y={122} c="#ffb86b" />
      </g>
    </svg>
  );
}

function Cloud({ side }: { side: 'l' | 'r' }) {
  return (
    <svg className={`hg-cloud hg-cloud--${side}`} viewBox="0 0 120 56" aria-hidden="true">
      <path
        d="M20 50 Q4 50 6 37 Q8 25 22 27 Q24 10 44 12 Q56 0 72 10 Q92 6 96 24 Q114 24 114 38 Q114 50 98 50 Z"
        fill="#fff"
        opacity="0.92"
      />
    </svg>
  );
}

export default function HeroGarden() {
  return (
    <div className="hero-garden" aria-hidden="true">
      <Cloud side="l" />
      <Cloud side="r" />
      <svg className="hg-hills" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0 38 Q90 6 200 28 T400 22 V80 H0 Z" fill="#cdeea8" />
        <path d="M0 58 Q120 30 230 52 T400 46 V80 H0 Z" fill="#a9de85" />
      </svg>
      <Cluster side="l" />
      <Cluster side="r" />
    </div>
  );
}
