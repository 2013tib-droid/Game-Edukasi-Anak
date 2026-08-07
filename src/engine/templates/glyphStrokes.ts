/**
 * Handwriting shapes for the `tracing` template.
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
 * So the digits are drawn here as the strokes a hand makes. Shapes are written
 * in a 0..1 box (y downwards) and scaled onto the canvas by `handwriting()`.
 *
 * Letters have no handwriting data yet, so `strokesFor` returns null for them
 * and the tracing scorer falls back to the font. Adding letters later = adding
 * entries here; nothing else changes.
 */

export interface Point {
  x: number;
  y: number;
}

/** One continuous stroke — the finger stays down for the whole polyline. */
export type Stroke = Point[];

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
 * Ellipse arc, angles in degrees clockwise from 3 o'clock (y grows downwards,
 * so 90 is the bottom). `to` may be smaller than `from` to sweep the other way.
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

/** Glues strokes into one continuous stroke (the finger never lifts). */
function join(...parts: Stroke[]): Stroke {
  const out: Stroke = [];
  for (const part of parts) out.push(...(out.length ? part.slice(1) : part));
  return out;
}

/* ---------- the digits, as a hand writes them ---------- */

const DIGITS: Record<string, Stroke[]> = {
  // A ring. Starts at the top and goes round — direction is not checked.
  '0': [arc(0.5, 0.5, 0.36, 0.47, -90, 270)],

  // One downstroke. No flag, no foot: this is how a child writes it, and it is
  // the whole reason these shapes exist — see the file header.
  '1': [poly([0.5, 0.03], [0.5, 0.97])],

  // Over the top, down the diagonal, then along the base.
  '2': [join(arc(0.5, 0.31, 0.32, 0.26, 170, 390), poly([0.777, 0.44], [0.15, 0.92], [0.87, 0.92]))],

  // Two bowls on the right, meeting in the middle — one continuous stroke.
  '3': [join(arc(0.5, 0.29, 0.28, 0.21, 200, 450), arc(0.5, 0.71, 0.32, 0.21, -90, 150))],

  // Down the diagonal and across, then the stem through it.
  '4': [poly([0.68, 0.05], [0.12, 0.65], [0.9, 0.65]), poly([0.68, 0.05], [0.68, 0.97])],

  // Along the top, down the back, then the belly bulging right.
  '5': [join(poly([0.82, 0.07], [0.26, 0.07], [0.25, 0.5]), arc(0.5, 0.68, 0.32, 0.27, -140, 145))],

  // A long curve down into a closed loop — the tail is what separates it from 0.
  '6': [join(arc(0.5, 0.68, 0.29, 0.54, -70, -180), arc(0.5, 0.68, 0.29, 0.26, 180, -180))],

  // Across the top, then the long diagonal.
  '7': [poly([0.14, 0.08], [0.86, 0.08], [0.36, 0.96])],

  // A figure eight in one go.
  '8': [join(arc(0.5, 0.27, 0.26, 0.24, 90, -270), arc(0.5, 0.72, 0.32, 0.27, -90, 270))],

  // A closed loop on top, then the tail down — the mirror of 6, on purpose.
  '9': [join(arc(0.5, 0.32, 0.29, 0.26, 0, 360), arc(0.5, 0.32, 0.29, 0.54, 0, 110))],
};

/** Handwriting strokes for one character, or null when we have none. */
export function strokesFor(char: string): Stroke[] | null {
  return DIGITS[char] ?? null;
}

/** True when every character of `glyph` has handwriting strokes. */
export function hasHandwriting(glyph: string): boolean {
  return glyph.length > 0 && [...glyph].every((c) => strokesFor(c) !== null);
}

export interface Handwriting {
  /** Strokes in canvas coordinates. */
  strokes: Stroke[];
  /** How thick the guide is drawn, in canvas pixels. */
  width: number;
}

/**
 * Lays the glyph out on a `size`×`size` canvas: one box per character, side by
 * side, centred. Multi-digit numbers (10–20) get smaller boxes so they still
 * fit on a phone — the same reason the font version shrank them.
 */
export function handwriting(glyph: string, size: number): Handwriting | null {
  if (!hasHandwriting(glyph)) return null;
  const chars = [...glyph];
  const boxH = size * (chars.length > 1 ? 0.52 : 0.72);
  const boxW = boxH * 0.62;
  const gap = boxH * 0.16;
  const totalW = chars.length * boxW + (chars.length - 1) * gap;
  const left = (size - totalW) / 2;
  const top = (size - boxH) / 2;

  const strokes: Stroke[] = [];
  chars.forEach((c, i) => {
    const ox = left + i * (boxW + gap);
    for (const s of strokesFor(c)!) {
      strokes.push(s.map((p) => ({ x: ox + p.x * boxW, y: top + p.y * boxH })));
    }
  });
  return { strokes, width: boxH * 0.17 };
}
