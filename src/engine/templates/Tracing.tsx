import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import { handwriting, type Stroke } from './glyphStrokes';

/**
 * Writing practice: the child drags a pencil along the letter or number, one
 * stroke at a time, exactly the way `path-trace` drives a vehicle down a road.
 *
 * Why a rail and not free drawing (owner's decision, 2026-09-09): the old
 * template let the child scribble anywhere over a grey guide and then judged
 * the result. That judging could never be made both fair and strict — a "9"
 * drawn on top of a "6" covers almost the same pixels, and every threshold
 * that caught it also started rejecting wobbly-but-correct strokes. A rail
 * removes the question instead of answering it: a child who follows the track
 * has, by construction, drawn the right shape in the right order and the right
 * direction, and one who wanders off is nudged back before the shape is
 * spoiled. Same gesture, same motor skill, no verdict to get wrong.
 *
 * Kid-friendly rules, inherited from `path-trace`:
 * - Progress only ever moves FORWARD; lifting the finger keeps the pencil
 *   where it is, so a slip never undoes the whole stroke.
 * - Wandering far off the track (not merely wobbling) is one gentle mistake,
 *   and only the CURRENT stroke restarts — strokes already written stay
 *   written.
 * - Finished strokes stay on screen in ink, so the letter builds up.
 *
 * Smoothness: pointer events only record where the finger is; one rAF loop
 * eases the pencil and writes `transform` / `stroke-dashoffset` straight to the
 * DOM. No React re-render while a finger is down — that is what made the road
 * stutter on low-end Android, and it would do the same here.
 */

// Logical drawing space. The SVG scales to the screen, so all geometry and
// tolerances live in these units — and because the pencil is drawn INSIDE the
// SVG, its position needs no pixel conversion at all.
const SIZE = 100;
const SAMPLES = 200; // points precomputed per stroke for hit testing
const LOOK_AHEAD = 26; // how many samples ahead a finger may jump to
// Tolerances are measured in TRACK WIDTHS, not fixed units: a two-digit number
// (10–20) is drawn in smaller boxes with a thinner track, and a fixed margin
// would be generous there and tight here.
const ON_TRACK = 0.75; // × track width — still counts as "on the line"
const OFF_TRACK = 1.35; // × track width — beyond this the stroke restarts
const FINISH_AT = 5; // samples from the end that already count as finished
const FOLLOW = 0.3; // per-frame easing of the pencil toward the finger

interface Pt {
  x: number;
  y: number;
}

/** SVG `d` for one stroke. */
function toPath(stroke: Stroke): string {
  return stroke.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

export default function Tracing({ level, onCorrect, onWrong }: TemplateProps<'tracing'>) {
  const { glyph } = level.data;
  const hand = useMemo(() => handwriting(glyph, SIZE), [glyph]);
  const paths = useMemo(() => (hand ? hand.strokes.map(toPath) : []), [hand]);
  const track = hand?.width ?? 10;
  const onTrack = track * ON_TRACK;
  const offTrack = track * OFF_TRACK;

  const svgRef = useRef<SVGSVGElement>(null);
  const liveRef = useRef<SVGPathElement>(null); // the stroke being written
  const inkRef = useRef<SVGPathElement>(null); // its filled-in part
  const penRef = useRef<SVGGElement>(null);

  // Which stroke is being written. In state because it changes what is drawn;
  // mirrored in a ref because the rAF loop reads it without re-rendering.
  const [index, setIndex] = useState(0);
  const idx = useRef(0);
  const [solved, setSolved] = useState(false);

  const geom = useRef<{ points: Pt[]; length: number }>({ points: [], length: 0 });
  const shown = useRef(0); // drawn position along the stroke (float index)
  const target = useRef(0); // where the finger says the pencil should be
  const finger = useRef<Pt | null>(null);
  const dragging = useRef(false);
  const blocked = useRef(false); // ignore the rest of a gesture after a reset
  const finished = useRef(false); // whole glyph done
  const raf = useRef(0);

  /** Point at a fractional sample index (smooth between samples). */
  function pointAt(t: number): Pt {
    const list = geom.current.points;
    if (list.length === 0) return { x: SIZE / 2, y: SIZE / 2 };
    const clamped = Math.max(0, Math.min(list.length - 1, t));
    const i = Math.floor(clamped);
    const a = list[i]!;
    const b = list[Math.min(list.length - 1, i + 1)]!;
    const f = clamped - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  /** Write the pencil + written part of the stroke to the DOM. No React. */
  function paint() {
    const p = pointAt(shown.current);
    penRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`);
    if (inkRef.current) {
      const total = geom.current.length || 1;
      const travelled = total * (shown.current / Math.max(1, geom.current.points.length - 1));
      inkRef.current.style.strokeDashoffset = String(total - travelled);
    }
  }

  function tick() {
    raf.current = 0;
    const list = geom.current.points;
    if (list.length === 0) return;

    // 1. Where does the finger want the pencil to be?
    const p = finger.current;
    if (p && dragging.current && !blocked.current && !finished.current) {
      let best = target.current;
      let bestDist = Infinity;
      const from = Math.floor(target.current);
      const to = Math.min(list.length - 1, from + LOOK_AHEAD);
      for (let i = from; i <= to; i += 1) {
        const dd = Math.hypot(p.x - list[i]!.x, p.y - list[i]!.y);
        if (dd < bestDist) {
          bestDist = dd;
          best = i;
        }
      }
      if (bestDist > offTrack) {
        // Off the line: one gentle mistake, and only this stroke starts over.
        blocked.current = true;
        dragging.current = false;
        finger.current = null;
        target.current = 0;
        onWrong();
      } else if (bestDist <= onTrack && best > target.current) {
        target.current = best; // progress only ever moves forward
      }
    }

    // 2. Ease the drawn position toward it — this is what looks smooth.
    const diff = target.current - shown.current;
    shown.current += Math.abs(diff) < 0.4 ? diff : diff * FOLLOW;
    paint();

    // 3. Stroke finished once the PENCIL (not just the finger) reaches the end.
    if (!finished.current && shown.current >= list.length - 1 - FINISH_AT) {
      dragging.current = false;
      finger.current = null;
      if (idx.current < paths.length - 1) {
        idx.current += 1;
        sfx('tap');
        setIndex(idx.current); // the effect below re-arms for the next stroke
      } else {
        finished.current = true;
        setSolved(true);
        onCorrect();
      }
      return;
    }
    if (dragging.current || Math.abs(target.current - shown.current) > 0.2) schedule();
  }

  function schedule() {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }

  // Arm the current stroke: sample it once so hit testing is plain array math.
  useEffect(() => {
    const path = liveRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const list: Pt[] = [];
    for (let i = 0; i < SAMPLES; i += 1) {
      const p = path.getPointAtLength((total * i) / (SAMPLES - 1));
      list.push({ x: p.x, y: p.y });
    }
    geom.current = { points: list, length: total };
    shown.current = 0;
    target.current = 0;
    finger.current = null;
    if (inkRef.current) {
      inkRef.current.style.strokeDasharray = String(total);
      inkRef.current.style.strokeDashoffset = String(total);
    }
    paint();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [glyph, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // A new glyph: back to the first stroke.
  useEffect(() => {
    idx.current = 0;
    setIndex(0);
    finished.current = false;
    setSolved(false);
  }, [glyph]);

  function svgPoint(e: ReactPointerEvent): Pt {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  function down(e: ReactPointerEvent) {
    if (finished.current) return;
    e.preventDefault();
    const p = svgPoint(e);
    const here = pointAt(shown.current);
    // The finger has to start on (or right next to) the pencil, so a child
    // cannot skip to the end of the stroke.
    if (Math.hypot(p.x - here.x, p.y - here.y) > offTrack * 1.6) return;
    dragging.current = true;
    blocked.current = false;
    finger.current = p;
    svgRef.current?.setPointerCapture(e.pointerId);
    schedule();
  }

  function move(e: ReactPointerEvent) {
    if (!dragging.current || finished.current || blocked.current) return;
    e.preventDefault();
    finger.current = svgPoint(e);
    schedule();
  }

  function up() {
    dragging.current = false;
    blocked.current = false;
    finger.current = null;
  }

  if (!hand) return <div className="game-prompt">{level.narration}</div>;

  return (
    <div className="tr-wrap">
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        <div className="trace-stage">
          <svg
            ref={svgRef}
            className="trace-svg"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            {/* Every stroke as a faint track, so the whole shape is visible
                from the start and the child knows where the letter is going. */}
            {paths.map((d, i) => (
              <path
                key={`g${i}`}
                className={`trace-track${i === index && !solved ? ' trace-track--now' : ''}`}
                d={d}
                style={{ strokeWidth: track }}
              />
            ))}
            {/* Dashes down the middle of the stroke being written — the same
                "this is a road" cue the vehicle game uses. */}
            {!solved && (
              <path className="trace-dash" d={paths[index] ?? ''} style={{ strokeWidth: track * 0.13 }} />
            )}
            {/* Strokes already written, in ink. */}
            {paths.slice(0, index).map((d, i) => (
              <path key={`d${i}`} className="trace-ink" d={d} style={{ strokeWidth: track }} />
            ))}
            {/* The stroke being written: `liveRef` is measured, `inkRef` fills
                in behind the pencil. */}
            <path ref={liveRef} className="trace-measure" d={paths[index] ?? ''} />
            <path ref={inkRef} className="trace-ink" d={paths[index] ?? ''} style={{ strokeWidth: track }} />

            {/* The dot on i and j: a tap, not a stroke — see glyphStrokes.ts. */}
            {hand.dots.map((dot, i) => (
              <circle
                key={`o${i}`}
                className={`trace-dot${solved ? ' trace-dot--done' : ''}`}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
              />
            ))}

            {!solved && (
              <g ref={penRef} className="trace-pen">
                {/* Drawn tip-first at the origin and leaned over, so the point
                    sits exactly on the track. An SVG pencil, not an emoji:
                    emoji pencils face different ways on different phones. */}
                <g transform="rotate(-35)">
                  <polygon points="0,0 -2.2,-4 2.2,-4" fill="#5b4636" />
                  <rect x="-2.2" y="-5.4" width="4.4" height="1.4" fill="#e7e2d8" />
                  <rect x="-2.2" y="-11.4" width="4.4" height="6" fill="#ffb01f" />
                  <rect x="-2.2" y="-13.5" width="4.4" height="2.1" rx="0.9" fill="#f2879b" />
                </g>
              </g>
            )}
          </svg>
        </div>
        <p className="game-hint">Ikuti garisnya dengan jarimu!</p>
      </div>
    </div>
  );
}
