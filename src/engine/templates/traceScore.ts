/**
 * Scoring for the `tracing` template — kept out of the React component so the
 * rules can be exercised headlessly.
 *
 * Why this is more than "how much of the glyph did the finger colour in": that
 * question cannot tell a 6 from a 9. The two digits are each other upside down,
 * so a 9 drawn on top of a 6 guide sweeps over most of the same pixels and used
 * to be accepted (reported by the project owner). Two things fix it:
 *
 *   1. The glyph is reduced to its CENTRE LINE (skeleton) and we ask which
 *      parts of that line the finger followed. Measuring against the filled
 *      shape instead is unreliable in both directions: a child whose finger
 *      drifts to one side of a fat stroke leaves half the area untouched, while
 *      a wrong digit that happens to overlap collects area for free.
 *   2. What matters is the BIGGEST UNBROKEN piece of that line the finger
 *      skipped — not the total it skipped. A wobbly finger leaves pinholes
 *      scattered along the whole line; a wrong glyph leaves one whole limb
 *      untouched (a 9 over a 6 never goes near the lower loop's left flank).
 *      A single overall percentage cannot tell those two apart, because the
 *      wobbly-but-correct trace can easily miss more in total.
 *
 * A third, looser rule (the finger must stay roughly on the ink) rejects
 * scribbling that merely crosses the glyph.
 *
 * All thresholds are deliberately forgiving: the rule we want is "you traced
 * this shape", not "you traced it neatly" — a rejected correct answer costs
 * far more here than an accepted wrong one.
 *
 * KNOWN LIMIT — do not "fix" it by tightening the numbers: when the drawn
 * glyph's line runs over ALL of the guide's line (an 8 traced over a 3, a 6
 * over a 5), nothing here can object, because the guide really was traced.
 * Telling those apart needs the child's own shape to be matched back against
 * the guide's, which is a bigger change than this bug called for.
 */

import { handwriting, type Stroke } from './glyphStrokes';

/** Logical canvas size (square). */
export const SIZE = 420;

/** Resolution the skeleton is computed at (half size — plenty, and 4× faster). */
const MASK = SIZE / 2;

export interface Tuning {
  /**
   * How close the finger must pass to count a piece of the line as traced,
   * as a multiple of the glyph's own half stroke width. Measuring in stroke
   * widths rather than pixels keeps the rule working across fonts (the app
   * asks for Fredoka but falls back to the phone's own font) and for the
   * smaller two-digit glyphs.
   */
  coverK: number;
  /** Margin around the ink that still counts as "on the glyph", same unit. */
  offK: number;
  /**
   * Floor under the cover radius, in canvas pixels. A hand wobbles by a real
   * distance, not by a share of the stroke width, so a thin guide font must
   * not make the game stricter than a fat one.
   */
  coverFloor: number;
  /** Finger path is resampled every N px, so scoring ignores pointer rate. */
  pathStep: number;
  /** Share of the line that must be traced overall. */
  passCoverage: number;
  /**
   * Biggest single unbroken piece of the line the finger may skip, as a share
   * of the whole line. This is the rule that tells a 6 from a 9: scattered
   * pinholes from a wobbly finger stay tiny, but a whole missed limb does not.
   */
  maxGap: number;
  /**
   * The same limit for glyphs still guided by the phone's font (letters). It
   * has to be much tighter: printed letters overlap each other far more than
   * handwriting strokes do, so there is less room between "traced it wobbly"
   * and "traced a different letter". When letters get handwriting strokes of
   * their own this can go away.
   */
  maxGapFont: number;
  /** Share of the finger path allowed to run off the glyph. */
  maxOffRatio: number;
}

/**
 * Measured headlessly, digit by digit (see the notes in CLAUDE.md).
 *
 * Handwriting guides: a fully traced digit leaves no gap worth the name even
 * with a badly wobbling finger, while a different digit traced over it leaves
 * 0.14 and up (9 over 6: 0.23, 6 over 9: 0.32). At `maxGap` 0.11 none of 360
 * fully- or nearly-fully-traced runs were rejected, and only 4 of 180 runs that
 * stopped a tenth short. Loosening further buys nothing: 0.09 and 0.11 catch
 * exactly the same wrong digits, so 0.11 is free forgiveness.
 *
 * Font guides (letters, until they get strokes too) keep their own tighter
 * limit — see `maxGapFont`.
 */
export const TUNING: Tuning = {
  coverK: 0.8,
  offK: 0.8,
  coverFloor: 18,
  pathStep: 4,
  passCoverage: 0.75,
  maxGap: 0.11,
  maxGapFont: 0.05,
  maxOffRatio: 0.25,
};

/**
 * Guide font for a glyph. Two-digit numbers (10–20) get a smaller size so
 * the whole glyph still fits inside the square canvas on a phone.
 */
export function glyphFont(glyph: string): string {
  const scale = glyph.length > 1 ? 0.5 : 0.75;
  return `bold ${SIZE * scale}px 'Fredoka', 'Baloo 2', sans-serif`;
}

/**
 * Draws the glyph centred on a SIZE×SIZE context (guide *and* mask use this).
 * Digits are drawn as handwriting strokes; anything else still falls back to
 * the phone's font (see glyphStrokes.ts).
 */
export function drawGlyph(ctx: CanvasRenderingContext2D, glyph: string): void {
  const hand = handwriting(glyph, SIZE);
  if (hand) {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = hand.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of hand.strokes) {
      ctx.beginPath();
      stroke.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    return;
  }
  ctx.font = glyphFont(glyph);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
}

/** Renders the glyph and returns a MASK×MASK bitmap of its ink. */
function inkBitmap(glyph: string): Uint8Array {
  const off = document.createElement('canvas');
  off.width = SIZE;
  off.height = SIZE;
  const ctx = off.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  drawGlyph(ctx, glyph);
  const img = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const bits = new Uint8Array(MASK * MASK);
  for (let y = 0; y < MASK; y += 1) {
    for (let x = 0; x < MASK; x += 1) {
      bits[y * MASK + x] = img[(y * 2 * SIZE + x * 2) * 4 + 3]! > 40 ? 1 : 0;
    }
  }
  return bits;
}

/**
 * Zhang-Suen thinning: peels the shape down to a 1px centre line, the line a
 * finger is meant to follow. Runs once per level (a few ms at this size).
 */
function skeleton(src: Uint8Array): Uint8Array {
  const b = Uint8Array.from(src);
  // Hot loop: runs over every ink pixel a dozen times, so it deliberately
  // avoids allocating (no neighbour array, no closures) — with an array per
  // pixel this took 48ms for a wide glyph like "W" on a desktop, which would
  // be a visible hitch when a level opens on a cheap phone.
  const dead = new Int32Array(MASK * MASK);
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step += 1) {
      let n = 0;
      for (let y = 1; y < MASK - 1; y += 1) {
        const row = y * MASK;
        for (let x = 1; x < MASK - 1; x += 1) {
          if (!b[row + x]) continue;
          const p0 = b[row - MASK + x]!; // N
          const p1 = b[row - MASK + x + 1]!; // NE
          const p2 = b[row + x + 1]!; // E
          const p3 = b[row + MASK + x + 1]!; // SE
          const p4 = b[row + MASK + x]!; // S
          const p5 = b[row + MASK + x - 1]!; // SW
          const p6 = b[row + x - 1]!; // W
          const p7 = b[row - MASK + x - 1]!; // NW
          const live = p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7;
          if (live < 2 || live > 6) continue;
          const turns =
            (!p0 && p1 ? 1 : 0) +
            (!p1 && p2 ? 1 : 0) +
            (!p2 && p3 ? 1 : 0) +
            (!p3 && p4 ? 1 : 0) +
            (!p4 && p5 ? 1 : 0) +
            (!p5 && p6 ? 1 : 0) +
            (!p6 && p7 ? 1 : 0) +
            (!p7 && p0 ? 1 : 0);
          if (turns !== 1) continue;
          if (step === 0) {
            if (p0 * p2 * p4 || p2 * p4 * p6) continue;
          } else if (p0 * p2 * p6 || p0 * p4 * p6) continue;
          dead[n] = row + x;
          n += 1;
        }
      }
      if (n) {
        changed = true;
        for (let i = 0; i < n; i += 1) b[dead[i]!] = 0;
      }
    }
  }
  return b;
}

/**
 * Rasterises handwriting strokes into a 1px centre line on the mask grid — the
 * same thing `skeleton()` recovers from a font glyph, only exact.
 */
function strokeLine(strokes: Stroke[]): Uint8Array {
  const bits = new Uint8Array(MASK * MASK);
  const put = (x: number, y: number) => {
    const mx = Math.round(x / 2);
    const my = Math.round(y / 2);
    if (mx >= 0 && my >= 0 && mx < MASK && my < MASK) bits[my * MASK + mx] = 1;
  };
  for (const stroke of strokes) {
    for (let i = 0; i < stroke.length - 1; i += 1) {
      const a = stroke[i]!;
      const b = stroke[i + 1]!;
      // Step in half-mask-pixels so the line never has holes in it.
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
      for (let s = 0; s <= steps; s += 1) {
        put(a.x + ((b.x - a.x) * s) / steps, a.y + ((b.y - a.y) * s) / steps);
      }
    }
  }
  return bits;
}

/**
 * Distance (two-pass chamfer) from every pixel to the nearest pixel set in
 * `seed`. Used twice: distance to the background gives a stroke's half width,
 * distance to the ink says how far off the glyph the finger wandered.
 */
function distanceTo(seed: Uint8Array): Float32Array {
  const d = new Float32Array(MASK * MASK);
  for (let i = 0; i < d.length; i += 1) d[i] = seed[i] ? 0 : Infinity;
  const pull = (i: number, x: number, y: number, w: number) => {
    if (x < 0 || y < 0 || x >= MASK || y >= MASK) return;
    const v = d[y * MASK + x]! + w;
    if (v < d[i]!) d[i] = v;
  };
  for (let y = 0; y < MASK; y += 1) {
    for (let x = 0; x < MASK; x += 1) {
      const i = y * MASK + x;
      if (!d[i]) continue;
      pull(i, x - 1, y, 1);
      pull(i, x, y - 1, 1);
      pull(i, x - 1, y - 1, 1.414);
      pull(i, x + 1, y - 1, 1.414);
    }
  }
  for (let y = MASK - 1; y >= 0; y -= 1) {
    for (let x = MASK - 1; x >= 0; x -= 1) {
      const i = y * MASK + x;
      if (!d[i]) continue;
      pull(i, x + 1, y, 1);
      pull(i, x, y + 1, 1);
      pull(i, x + 1, y + 1, 1.414);
      pull(i, x - 1, y + 1, 1.414);
    }
  }
  return d;
}

export interface TraceResult {
  ok: boolean;
  /** Share of the glyph's centre line the finger followed (0–1). */
  coverage: number;
  /** Share of the finger path that ran outside the glyph (0–1). */
  offRatio: number;
  /** Biggest unbroken piece of the line that was skipped, as a share (0–1). */
  biggestGap: number;
}

interface Sample {
  x: number;
  y: number;
  /** Position in the mask bitmap, for finding neighbouring samples. */
  mx: number;
  my: number;
  covered: boolean;
}

export interface TraceScorer {
  /** Adds a finger position; the gap since the previous point is filled in. */
  addPoint(x: number, y: number): void;
  /** Marks the end of one stroke (the next point starts a new one). */
  endStroke(): void;
  /** Forgets everything drawn so far (the glyph is kept). */
  reset(): void;
  score(): TraceResult;
}

/**
 * Builds the guide's centre line and returns a scorer the template feeds
 * finger positions into. Needs a DOM canvas (browser only).
 */
export function createTraceScorer(glyph: string, tune: Partial<Tuning> = {}): TraceScorer {
  const t: Tuning = { ...TUNING, ...tune };
  const ink = inkBitmap(glyph);
  // For handwriting glyphs the centre line is already known — it is the stroke
  // the shape was drawn from. Only font glyphs have to have it guessed back out
  // of the filled shape by thinning.
  const hand = handwriting(glyph, SIZE);
  const bone = hand ? strokeLine(hand.strokes) : skeleton(ink);

  // Centre-line points, in canvas coordinates.
  const background = ink.map((v) => (v ? 0 : 1));
  const inside = distanceTo(background);
  const toInk = distanceTo(ink);
  const halfWidths: number[] = [];
  const samples: Sample[] = [];
  /** Mask position → index in `samples`, for walking along the line. */
  const indexAt = new Int32Array(MASK * MASK).fill(-1);
  for (let y = 0; y < MASK; y += 1) {
    for (let x = 0; x < MASK; x += 1) {
      if (!bone[y * MASK + x]) continue;
      indexAt[y * MASK + x] = samples.length;
      samples.push({ x: x * 2, y: y * 2, mx: x, my: y, covered: false });
      halfWidths.push(inside[y * MASK + x]! * 2);
    }
  }

  // How thick this glyph's strokes are, in canvas pixels (median half width —
  // the median ignores the fat blobs where strokes cross).
  const sorted = [...halfWidths].sort((a, b) => a - b);
  const halfWidth = sorted.length ? sorted[Math.floor(sorted.length / 2)]! : 20;

  /** Off-glyph test with a forgiving margin: just past the edge still counts. */
  const offMargin = Math.max(6, halfWidth * t.offK);
  const onGlyph = (x: number, y: number) => {
    const mx = Math.round(x / 2);
    const my = Math.round(y / 2);
    if (mx < 0 || my < 0 || mx >= MASK || my >= MASK) return false;
    return toInk[my * MASK + mx]! * 2 <= offMargin;
  };

  const coverRadius = Math.max(t.coverFloor, halfWidth * t.coverK);
  const radius2 = coverRadius * coverRadius;
  let total = 0;
  let outside = 0;
  let last: { x: number; y: number } | null = null;

  function mark(x: number, y: number) {
    total += 1;
    if (!onGlyph(x, y)) outside += 1;
    for (const s of samples) {
      if (s.covered) continue;
      const dx = s.x - x;
      const dy = s.y - y;
      if (dx * dx + dy * dy < radius2) s.covered = true;
    }
  }

  return {
    addPoint(x, y) {
      // Resample the segment: pointer events arrive far apart when a finger
      // moves fast, and scoring must not depend on the device's event rate.
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const steps = Math.floor(Math.hypot(dx, dy) / t.pathStep);
        for (let i = 1; i <= steps; i += 1) {
          mark(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
        if (steps === 0) mark(x, y);
      } else {
        mark(x, y);
      }
      last = { x, y };
    },
    endStroke() {
      last = null;
    },
    reset() {
      for (const s of samples) s.covered = false;
      total = 0;
      outside = 0;
      last = null;
    },
    score(): TraceResult {
      if (!samples.length) return { ok: false, coverage: 0, offRatio: 1, biggestGap: 1 };
      const coverage = samples.filter((s) => s.covered).length / samples.length;
      const offRatio = total > 0 ? outside / total : 1;

      // Biggest unbroken skipped piece: flood-fill the untraced samples along
      // the line and keep the largest island.
      const seen = new Uint8Array(samples.length);
      let biggest = 0;
      for (let i = 0; i < samples.length; i += 1) {
        if (samples[i]!.covered || seen[i]) continue;
        let size = 0;
        const stack = [i];
        seen[i] = 1;
        while (stack.length) {
          const cur = samples[stack.pop()!]!;
          size += 1;
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              const nx = cur.mx + dx;
              const ny = cur.my + dy;
              if (nx < 0 || ny < 0 || nx >= MASK || ny >= MASK) continue;
              const j = indexAt[ny * MASK + nx]!;
              if (j < 0 || seen[j] || samples[j]!.covered) continue;
              seen[j] = 1;
              stack.push(j);
            }
          }
        }
        if (size > biggest) biggest = size;
      }
      const biggestGap = biggest / samples.length;

      const gapLimit = hand ? t.maxGap : t.maxGapFont;
      return {
        ok: coverage >= t.passCoverage && biggestGap <= gapLimit && offRatio <= t.maxOffRatio,
        coverage,
        offRatio,
        biggestGap,
      };
    },
  };
}
