/**
 * Handwriting shapes for the `tracing` template ("Tulis Angka", "Tulis Huruf").
 *
 * The guide used to be TEXT drawn with the phone's own font, and that was wrong
 * for a writing game in two ways:
 *
 *   1. Every phone drew a different shape. The app names 'Fredoka' but never
 *      loads it, so each device fell back to its own sans — one iPhone drew "1"
 *      with a slab flag nearly half the digit wide, other fonts add a serif
 *      foot. Same reason the animals are WebP images instead of emoji.
 *   2. Printed digits are not handwriting. Nobody teaches a child to write "1"
 *      with a flag and a foot; in Indonesian schools it is a single downstroke.
 *      Asking a child to trace typographic decoration is teaching the wrong
 *      shape — and it failed children who wrote the digit correctly.
 *
 * So every glyph is drawn here as the strokes a hand makes, in a 0..1 box
 * (y downwards), laid onto the canvas by `handwriting()`.
 *
 * TWO THINGS THE ORDER OF THESE POINTS NOW DECIDES, so do not shuffle them:
 *
 *   - STROKE ORDER. The template lights one stroke at a time, in this order.
 *     Write them the way a teacher writes them on the board: stem before bowl
 *     (B, D, P), down-strokes before cross-bars (A, E, F, t).
 *   - STROKE DIRECTION. Each stroke is a rail the finger follows from its
 *     first point to its last, so the array order IS the writing direction.
 *     Rings (0, O, o) run counter-clockwise from the top, the way a child is
 *     taught to start them.
 *
 * `dots` are the marks over i and j. They are NOT strokes: a dot is a tap, not
 * a path to follow, and a rail 20px across is fiddly for a four-year-old — so
 * the template draws them and fills them in on its own once the strokes are
 * done.
 */

export interface Point {
  x: number;
  y: number;
}

/** One continuous stroke — the finger stays down for the whole polyline. */
export type Stroke = Point[];

export interface Glyph {
  /** Strokes in writing order; each one runs in its writing direction. */
  strokes: Stroke[];
  /** Marks that are tapped, not traced (the dot on i and j). */
  dots?: Point[];
  /** Box width multiplier — M, W, m, w need more room than the rest. */
  width?: number;
}

/* ---------- little shape helpers (normalised 0..1 box) ---------- */

const TAU = Math.PI * 2;

/** Straight segments through the given corners. */
function poly(...corners: [number, number][]): Stroke {
  const out: Stroke = [];
  for (let i = 0; i < corners.length - 1; i += 1) {
    const [x0, y0] = corners[i]!;
    const [x1, y1] = corners[i + 1]!;
    const steps = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) * 60));
    for (let s = i === 0 ? 0 : 1; s <= steps; s += 1) {
      out.push({ x: x0 + ((x1 - x0) * s) / steps, y: y0 + ((y1 - y0) * s) / steps });
    }
  }
  return out;
}

/**
 * Ellipse arc, angles in degrees CLOCKWISE from 3 o'clock (y grows downwards,
 * so 90 is the bottom, -90 the top). `to` smaller than `from` sweeps counter-
 * clockwise. Getting this backwards draws a plausible-looking mess — always
 * LOOK at the rendered sheet, never just read the numbers.
 */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number): Stroke {
  const a0 = (from / 360) * TAU;
  const a1 = (to / 360) * TAU;
  const steps = Math.max(8, Math.round((Math.abs(a1 - a0) / TAU) * 90));
  const out: Stroke = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return out;
}

/** Cubic Bézier — the readable way to write S, s, f, r and t. */
function bez(
  p0: [number, number],
  c1: [number, number],
  c2: [number, number],
  p1: [number, number],
): Stroke {
  const steps = 26;
  const out: Stroke = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    out.push({
      x: a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
      y: a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1],
    });
  }
  return out;
}

/** Glues strokes into one continuous stroke (the finger never lifts). */
function join(...parts: Stroke[]): Stroke {
  const out: Stroke = [];
  for (const part of parts) out.push(...(out.length ? part.slice(1) : part));
  return out;
}

/* ---------- shared proportions ----------
   Capitals and digits fill the box top to bottom. Lowercase keeps the three
   writing lines a child knows from ruled paper: ascenders start at the top
   line, small letters at the middle line, everything sits on the baseline,
   and tails hang below it. Letters keep their real relative heights — an "o"
   IS shorter than a "b", and blowing each letter up to fill the box would
   teach the opposite. */

const UT = 0.05; // capital top
const UB = 0.95; // capital bottom (the baseline for capitals)

const AT = 0.06; // lowercase ascender top
const XT = 0.38; // lowercase x-height (middle line)
const BL = 0.86; // lowercase baseline
const DB = 1.0; // lowercase descender bottom

/* ---------- digits, as a hand writes them ---------- */

const DIGITS: Record<string, Glyph> = {
  // A ring, counter-clockwise from the top — same start and direction as "O".
  '0': { strokes: [arc(0.5, 0.5, 0.36, 0.47, -90, -450)] },

  // One downstroke. No flag, no foot: this is how a child writes it, and it is
  // the whole reason these shapes exist — see the file header.
  '1': { strokes: [poly([0.5, 0.03], [0.5, 0.97])] },

  // Over the top, down the diagonal, then along the base.
  '2': {
    strokes: [
      join(arc(0.5, 0.31, 0.32, 0.26, 170, 390), poly([0.777, 0.44], [0.15, 0.92], [0.87, 0.92])),
    ],
  },

  // Two bowls on the right, meeting in the middle — one continuous stroke.
  '3': { strokes: [join(arc(0.5, 0.29, 0.28, 0.21, 200, 450), arc(0.5, 0.71, 0.32, 0.21, -90, 150))] },

  // Down the diagonal and across, then the stem through it.
  '4': { strokes: [poly([0.68, 0.05], [0.12, 0.65], [0.9, 0.65]), poly([0.68, 0.05], [0.68, 0.97])] },

  // Along the top, down the back, then the belly bulging right.
  '5': { strokes: [join(poly([0.82, 0.07], [0.26, 0.07], [0.25, 0.5]), arc(0.5, 0.68, 0.32, 0.27, -140, 145))] },

  // A long curve down into a closed loop — the tail is what separates it from 0.
  '6': { strokes: [join(arc(0.5, 0.68, 0.29, 0.54, -70, -180), arc(0.5, 0.68, 0.29, 0.26, 180, -180))] },

  // Across the top, then the long diagonal.
  '7': { strokes: [poly([0.14, 0.08], [0.86, 0.08], [0.36, 0.96])] },

  // A figure eight in one go, STARTING AT THE TOP: the upper-left half, all
  // the way round the lower loop, then the upper-right half back to the start.
  // The obvious two-ellipse version starts in the middle, at the crossing —
  // fine as a drawing, wrong as a rail, because the pencil then waits for the
  // child in the middle of the shape instead of at the top where a hand begins.
  '8': {
    strokes: [
      join(
        arc(0.5, 0.29, 0.25, 0.24, -90, -270),
        arc(0.5, 0.755, 0.31, 0.225, -90, 270),
        arc(0.5, 0.29, 0.25, 0.24, 90, -90),
      ),
    ],
  },

  // A loop closed counter-clockwise from the upper right, then the tail down —
  // the mirror of 6, on purpose.
  '9': { strokes: [join(arc(0.5, 0.32, 0.29, 0.26, -50, -360), arc(0.5, 0.32, 0.29, 0.54, 0, 110))] },
};

/* ---------- capitals ---------- */

const UPPER: Record<string, Glyph> = {
  A: {
    strokes: [
      poly([0.5, UT], [0.12, UB]),
      poly([0.5, UT], [0.88, UB]),
      poly([0.234, 0.68], [0.766, 0.68]),
    ],
  },
  B: {
    strokes: [
      poly([0.2, UT], [0.2, UB]),
      join(arc(0.2, 0.275, 0.4, 0.225, -90, 90), arc(0.2, 0.725, 0.46, 0.225, -90, 90)),
    ],
  },
  C: { strokes: [arc(0.52, 0.5, 0.36, 0.45, -50, -310)] },
  D: { strokes: [poly([0.2, UT], [0.2, UB]), arc(0.2, 0.5, 0.6, 0.45, -90, 90)] },
  E: {
    strokes: [
      poly([0.24, UT], [0.24, UB]),
      poly([0.24, UT], [0.82, UT]),
      poly([0.24, 0.5], [0.74, 0.5]),
      poly([0.24, UB], [0.82, UB]),
    ],
  },
  F: {
    strokes: [poly([0.24, UT], [0.24, UB]), poly([0.24, UT], [0.82, UT]), poly([0.24, 0.5], [0.74, 0.5])],
  },
  G: {
    strokes: [
      join(arc(0.52, 0.5, 0.36, 0.45, -50, -310), poly([0.88, 0.5], [0.58, 0.5])),
    ],
  },
  H: {
    strokes: [poly([0.18, UT], [0.18, UB]), poly([0.82, UT], [0.82, UB]), poly([0.18, 0.52], [0.82, 0.52])],
  },
  I: {
    strokes: [poly([0.26, UT], [0.74, UT]), poly([0.5, UT], [0.5, UB]), poly([0.26, UB], [0.74, UB])],
  },
  J: { strokes: [join(poly([0.68, UT], [0.68, 0.72]), arc(0.44, 0.72, 0.24, 0.23, 0, 180))] },
  K: {
    strokes: [poly([0.2, UT], [0.2, UB]), poly([0.84, UT], [0.2, 0.54]), poly([0.2, 0.54], [0.86, UB])],
  },
  L: { strokes: [poly([0.24, UT], [0.24, UB], [0.82, UB])] },
  M: { width: 1.28, strokes: [poly([0.12, UB], [0.12, UT], [0.5, 0.62], [0.88, UT], [0.88, UB])] },
  N: { strokes: [poly([0.18, UB], [0.18, UT], [0.82, UB], [0.82, UT])] },
  O: { strokes: [arc(0.5, 0.5, 0.38, 0.45, -90, -450)] },
  P: { strokes: [poly([0.2, UT], [0.2, UB]), arc(0.2, 0.3, 0.46, 0.25, -90, 90)] },
  Q: { strokes: [arc(0.5, 0.5, 0.38, 0.45, -90, -450), poly([0.62, 0.68], [0.9, 0.99])] },
  R: {
    strokes: [poly([0.2, UT], [0.2, UB]), join(arc(0.2, 0.3, 0.44, 0.25, -90, 90), poly([0.2, 0.55], [0.84, UB]))],
  },
  S: {
    strokes: [
      join(
        bez([0.8, 0.19], [0.66, 0.03], [0.22, 0.03], [0.24, 0.3]),
        bez([0.24, 0.3], [0.26, 0.52], [0.76, 0.48], [0.76, 0.7]),
        bez([0.76, 0.7], [0.76, 0.98], [0.3, 0.99], [0.2, 0.8]),
      ),
    ],
  },
  T: { strokes: [poly([0.12, UT], [0.88, UT]), poly([0.5, UT], [0.5, UB])] },
  U: {
    strokes: [
      join(poly([0.18, UT], [0.18, 0.62]), arc(0.5, 0.62, 0.32, 0.33, 180, 0), poly([0.82, 0.62], [0.82, UT])),
    ],
  },
  V: { strokes: [poly([0.14, UT], [0.5, UB], [0.86, UT])] },
  W: { width: 1.28, strokes: [poly([0.08, UT], [0.28, UB], [0.5, 0.3], [0.72, UB], [0.92, UT])] },
  X: { strokes: [poly([0.16, UT], [0.84, UB]), poly([0.84, UT], [0.16, UB])] },
  Y: { strokes: [poly([0.16, UT], [0.5, 0.5]), poly([0.84, UT], [0.5, 0.5], [0.5, UB])] },
  Z: { strokes: [poly([0.16, UT], [0.84, UT], [0.16, UB], [0.84, UB])] },
};

/* ---------- lowercase ---------- */

const LOWER: Record<string, Glyph> = {
  a: { strokes: [arc(0.46, 0.62, 0.26, 0.24, -60, -420), poly([0.72, XT], [0.72, BL])] },
  b: { strokes: [poly([0.24, AT], [0.24, BL]), arc(0.24, 0.62, 0.42, 0.24, -90, 90)] },
  c: { strokes: [arc(0.52, 0.62, 0.28, 0.24, -50, -310)] },
  d: { strokes: [arc(0.5, 0.62, 0.26, 0.24, -60, -420), poly([0.76, AT], [0.76, BL])] },
  e: { strokes: [join(poly([0.24, 0.62], [0.78, 0.62]), arc(0.5, 0.62, 0.28, 0.24, 0, -290))] },
  f: {
    strokes: [
      join(bez([0.8, 0.14], [0.72, 0.02], [0.4, 0.02], [0.4, 0.24]), poly([0.4, 0.24], [0.4, BL])),
      poly([0.2, 0.42], [0.66, 0.42]),
    ],
  },
  g: {
    strokes: [
      arc(0.5, 0.62, 0.26, 0.24, -60, -420),
      join(poly([0.76, XT], [0.76, 0.9]), arc(0.54, 0.9, 0.22, 0.1, 0, 180)),
    ],
  },
  h: {
    strokes: [poly([0.24, AT], [0.24, BL]), join(arc(0.49, 0.56, 0.25, 0.18, 180, 360), poly([0.74, 0.56], [0.74, BL]))],
  },
  i: { strokes: [poly([0.5, XT], [0.5, BL])], dots: [{ x: 0.5, y: 0.18 }] },
  j: {
    strokes: [join(poly([0.58, XT], [0.58, 0.9]), arc(0.36, 0.9, 0.22, 0.1, 0, 180))],
    dots: [{ x: 0.58, y: 0.18 }],
  },
  k: {
    strokes: [poly([0.24, AT], [0.24, BL]), poly([0.74, XT], [0.24, 0.66]), poly([0.24, 0.66], [0.78, BL])],
  },
  l: { strokes: [poly([0.5, AT], [0.5, BL])] },
  m: {
    width: 1.3,
    strokes: [
      poly([0.16, XT], [0.16, BL]),
      join(arc(0.32, 0.55, 0.16, 0.17, 180, 360), poly([0.48, 0.55], [0.48, BL])),
      join(arc(0.64, 0.55, 0.16, 0.17, 180, 360), poly([0.8, 0.55], [0.8, BL])),
    ],
  },
  n: {
    strokes: [poly([0.24, XT], [0.24, BL]), join(arc(0.49, 0.55, 0.25, 0.17, 180, 360), poly([0.74, 0.55], [0.74, BL]))],
  },
  o: { strokes: [arc(0.5, 0.62, 0.28, 0.24, -90, -450)] },
  p: { strokes: [poly([0.24, XT], [0.24, DB]), arc(0.24, 0.62, 0.42, 0.24, -90, 90)] },
  q: { strokes: [arc(0.5, 0.62, 0.26, 0.24, -60, -420), poly([0.76, XT], [0.76, DB])] },
  r: { strokes: [poly([0.3, XT], [0.3, BL]), bez([0.3, 0.55], [0.34, 0.4], [0.6, 0.4], [0.76, 0.46])] },
  s: {
    strokes: [
      join(
        bez([0.74, 0.46], [0.64, 0.34], [0.3, 0.34], [0.3, 0.53]),
        bez([0.3, 0.53], [0.3, 0.64], [0.72, 0.62], [0.72, 0.74]),
        bez([0.72, 0.74], [0.72, 0.9], [0.36, 0.92], [0.26, 0.8]),
      ),
    ],
  },
  t: {
    strokes: [
      join(poly([0.46, 0.14], [0.46, 0.76]), bez([0.46, 0.76], [0.46, 0.9], [0.66, 0.9], [0.72, 0.78])),
      poly([0.2, 0.42], [0.72, 0.42]),
    ],
  },
  u: {
    strokes: [
      join(poly([0.24, XT], [0.24, 0.7]), arc(0.49, 0.7, 0.25, 0.16, 180, 0), poly([0.74, 0.7], [0.74, BL])),
    ],
  },
  v: { strokes: [poly([0.2, XT], [0.5, BL], [0.8, XT])] },
  w: { width: 1.3, strokes: [poly([0.1, XT], [0.3, BL], [0.5, 0.5], [0.7, BL], [0.9, XT])] },
  x: { strokes: [poly([0.22, XT], [0.78, BL]), poly([0.78, XT], [0.22, BL])] },
  y: { strokes: [poly([0.22, XT], [0.48, 0.77]), poly([0.8, XT], [0.36, DB])] },
  z: { strokes: [poly([0.22, XT], [0.78, XT], [0.22, BL], [0.78, BL])] },
};

const GLYPHS: Record<string, Glyph> = { ...DIGITS, ...UPPER, ...LOWER };

/** Handwriting strokes for one character, or null when we have none. */
export function strokesFor(char: string): Glyph | null {
  return GLYPHS[char] ?? null;
}

/** True when every character of `glyph` has handwriting strokes. */
export function hasHandwriting(glyph: string): boolean {
  return glyph.length > 0 && [...glyph].every((c) => strokesFor(c) !== null);
}

export interface HandwritingDot extends Point {
  /** Radius in canvas units. */
  r: number;
}

export interface Handwriting {
  /** Strokes in canvas coordinates, in writing order. */
  strokes: Stroke[];
  /** Tapped marks (i, j) in canvas coordinates. */
  dots: HandwritingDot[];
  /** How thick the guide is drawn, in canvas units. */
  width: number;
}

/**
 * Lays the glyph out on a `size`×`size` canvas: one box per character, side by
 * side, centred. Multi-character numbers (10–20) get smaller boxes so they
 * still fit on a phone.
 */
export function handwriting(glyph: string, size: number): Handwriting | null {
  if (!hasHandwriting(glyph)) return null;
  const chars = [...glyph];
  const many = chars.length > 1;
  const boxH = size * (many ? 0.6 : 0.84);
  const unit = boxH * 0.62; // width of a normal character box
  const gap = boxH * 0.14;
  const widths = chars.map((c) => unit * (strokesFor(c)!.width ?? 1));
  const totalW = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * gap;
  const left = (size - totalW) / 2;
  /* Digeser sedikit ke BAWAH dari tengah, bukan dipusatkan: pensil di template
     digambar dari mata pensil ke ATAS, jadi kalau goresan pertama menyentuh
     tepi atas kanvas (angka "1" mulai di 0.03) badan pensilnya terpotong. */
  const top = (size - boxH) / 2 + size * 0.03;
  const thickness = boxH * 0.15;

  const strokes: Stroke[] = [];
  const dots: HandwritingDot[] = [];
  let ox = left;
  chars.forEach((c, i) => {
    const g = strokesFor(c)!;
    const boxW = widths[i]!;
    for (const s of g.strokes) {
      strokes.push(s.map((p) => ({ x: ox + p.x * boxW, y: top + p.y * boxH })));
    }
    for (const d of g.dots ?? []) {
      dots.push({ x: ox + d.x * boxW, y: top + d.y * boxH, r: thickness * 0.5 });
    }
    ox += boxW + gap;
  });
  return { strokes, dots, width: thickness };
}
