import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { RoadSpec } from '@/engine/core/types';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * Path tracing: the child drags a vehicle along a road with one finger, from
 * the start to the goal. Motor-skill practice (pre-writing) dressed as a
 * delivery trip — the same gesture as the letter/number tracing template but
 * along a drawn road instead of a glyph.
 *
 * Kid-friendly rules:
 * - Progress only ever moves FORWARD; lifting the finger keeps the vehicle
 *   where it is, so a small slip never undoes the whole trip.
 * - Straying far off the road (not merely wobbling) is one gentle mistake:
 *   the vehicle drives back to the start and the shell says "coba lagi".
 *
 * Smoothness: pointer events only record where the finger is. One rAF loop
 * eases the car toward that spot and writes `transform` / `stroke-dashoffset`
 * directly to the DOM — no React re-render while a finger is down, which is
 * what made it stutter on low-end Android.
 */

// Logical drawing space; the SVG scales to the screen, so all geometry,
// tolerances and hit tests are in these units.
const W = 100;
const H = 72;
const SAMPLES = 240; // path points precomputed for hit testing
const LOOK_AHEAD = 26; // how many samples ahead a finger may jump to
const ON_ROAD = 9; // distance that still counts as "on the road"
const OFF_ROAD = 17; // beyond this the trip resets (one mistake)
const FINISH_AT = 4; // samples from the end that already count as arrived
const FOLLOW = 0.3; // per-frame easing of the car toward the finger
const TURN = 0.25; // per-frame easing of the car's heading (no snapping)

/** SVG path (`d`) for a road shape. Geometry lives here, configs only name it. */
function roadPath(road: RoadSpec): string {
  const steps = Math.max(1, Math.min(6, road.steps ?? 3));
  const x0 = 10;
  const x1 = 90;
  const span = x1 - x0;
  const at = (i: number, n: number) => x0 + (span * i) / n;

  switch (road.kind) {
    case 'lurus':
      return `M ${x0} ${H / 2} L ${x1} ${H / 2}`;

    case 'zigzag': {
      let d = `M ${x0} 58`;
      for (let i = 1; i <= steps; i += 1) d += ` L ${at(i, steps)} ${i % 2 ? 14 : 58}`;
      return d;
    }

    case 'gelombang': {
      let d = `M ${x0} ${H / 2}`;
      for (let i = 1; i <= steps; i += 1) {
        const cx = (at(i - 1, steps) + at(i, steps)) / 2;
        d += ` Q ${cx} ${i % 2 ? 4 : 68}, ${at(i, steps)} ${H / 2}`;
      }
      return d;
    }

    case 'bukit': {
      // Rolling hills sitting on a baseline: up over each hill, back down.
      let d = `M ${x0} 58`;
      for (let i = 1; i <= steps; i += 1) {
        const a = at(i - 1, steps);
        const b = at(i, steps);
        d += ` C ${a + (b - a) * 0.25} 9, ${b - (b - a) * 0.25} 9, ${b} 58`;
      }
      return d;
    }

    case 'tangga': {
      // Right-angle stairs climbing from bottom-left to top-right.
      const rise = (58 - 14) / steps;
      let d = `M ${x0} 58`;
      for (let i = 1; i <= steps; i += 1) {
        d += ` L ${at(i, steps)} ${58 - rise * (i - 1)}`;
        d += ` L ${at(i, steps)} ${58 - rise * i}`;
      }
      return d;
    }

    case 'lengkung':
      return `M 14 11 C 14 72, 86 72, 86 11`;

    case 'ess':
      return `M 12 56 C 34 56, 30 36, 50 36 S 66 15, 88 15`;
  }
}

interface Pt {
  x: number;
  y: number;
}


export default function PathTrace({ level, onCorrect, onWrong }: TemplateProps<'path-trace'>) {
  const { road, vehicle, vehicleItem, goal } = level.data;
  const d = useMemo(() => roadPath(road), [road]);

  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<SVGPathElement>(null);

  // Everything that changes while a finger is moving lives in refs and is
  // written straight to the DOM inside one requestAnimationFrame loop.
  // Re-rendering React on every pointermove made the car stutter on
  // low-end Android; now a move event only records the finger position.
  const geom = useRef<{ points: Pt[]; length: number }>({ points: [], length: 0 });
  const shown = useRef(0); // drawn position along the road (float index)
  const target = useRef(0); // where the finger says the car should be
  const heading = useRef(0); // drawn angle, eased so it never snaps
  const finger = useRef<Pt | null>(null);
  const dragging = useRef(false);
  const blocked = useRef(false); // ignore the rest of a gesture after a reset
  const finished = useRef(false);
  const raf = useRef(0);

  const [done, setDone] = useState(false);

  /** Point at a fractional sample index (smooth between samples). */
  function pointAt(t: number): Pt {
    const list = geom.current.points;
    if (list.length === 0) return { x: 10, y: H / 2 };
    const clamped = Math.max(0, Math.min(list.length - 1, t));
    const i = Math.floor(clamped);
    const a = list[i]!;
    const b = list[Math.min(list.length - 1, i + 1)]!;
    const f = clamped - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  /** Write the car + travelled road to the DOM. No React involved. */
  function paint() {
    const svg = svgRef.current;
    const car = carRef.current;
    if (!svg || !car) return;
    const scale = svg.getBoundingClientRect().width / W;
    const p = pointAt(shown.current);
    car.style.transform =
      `translate3d(${p.x * scale}px, ${p.y * scale}px, 0) translate(-50%, -50%)` +
      // scaleX(-1): vehicle emoji face LEFT in most fonts — mirror them first
      // so the rotation makes them head along the road.
      ` rotate(${heading.current}deg) scaleX(-1)`;
    if (doneRef.current) {
      const total = geom.current.length || 1;
      const travelled = total * (shown.current / Math.max(1, geom.current.points.length - 1));
      doneRef.current.style.strokeDashoffset = String(total - travelled);
    }
  }

  /** Angle of the road at a position, in degrees. */
  function headingAt(t: number): number {
    const a = pointAt(t);
    const b = pointAt(t + 4);
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  }

  function tick() {
    raf.current = 0;
    const list = geom.current.points;
    if (list.length === 0) return;

    // 1. Where does the finger want the car to be?
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
      if (bestDist > OFF_ROAD) {
        // Off the road: one gentle mistake, the car drives back to the start.
        blocked.current = true;
        dragging.current = false;
        finger.current = null;
        target.current = 0;
        onWrong();
      } else if (bestDist <= ON_ROAD && best > target.current) {
        target.current = best; // progress only ever moves forward
      }
    }

    // 2. Ease the drawn position toward it — this is what looks smooth.
    const diff = target.current - shown.current;
    shown.current += Math.abs(diff) < 0.4 ? diff : diff * FOLLOW;
    const want = headingAt(shown.current);
    let turn = ((want - heading.current + 540) % 360) - 180;
    heading.current += turn * TURN;
    paint();

    // 3. Finish once the car itself (not just the finger) reaches the goal.
    if (!finished.current && shown.current >= list.length - 1 - FINISH_AT) {
      finished.current = true;
      dragging.current = false;
      setDone(true);
      onCorrect();
      return;
    }
    if (dragging.current || Math.abs(target.current - shown.current) > 0.2) schedule();
  }

  function schedule() {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }

  // Sample the road once per level so hit testing is plain array math.
  useEffect(() => {
    const path = pathRef.current;
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
    finished.current = false;
    finger.current = null;
    heading.current = headingAt(0);
    setDone(false);

    if (doneRef.current) {
      doneRef.current.style.strokeDasharray = String(total);
      doneRef.current.style.strokeDashoffset = String(total);
    }
    // Place the goal marker at the end of the road.
    const svg = svgRef.current;
    if (svg && goalRef.current) {
      const scale = svg.getBoundingClientRect().width / W;
      const end = list[list.length - 1]!;
      goalRef.current.style.transform = `translate3d(${end.x * scale}px, ${end.y * scale}px, 0) translate(-50%, -50%)`;
    }
    paint();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the drawing in place when the screen rotates or resizes.
  useEffect(() => {
    const onResize = () => {
      const svg = svgRef.current;
      const list = geom.current.points;
      if (svg && goalRef.current && list.length > 0) {
        const scale = svg.getBoundingClientRect().width / W;
        const end = list[list.length - 1]!;
        goalRef.current.style.transform = `translate3d(${end.x * scale}px, ${end.y * scale}px, 0) translate(-50%, -50%)`;
      }
      paint();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function svgPoint(e: ReactPointerEvent): Pt {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  function down(e: ReactPointerEvent) {
    if (finished.current) return;
    e.preventDefault();
    const p = svgPoint(e);
    const here = pointAt(target.current);
    // The finger must start on (or right next to) the vehicle.
    if (Math.hypot(p.x - here.x, p.y - here.y) > OFF_ROAD) return;
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

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        <div className="road-stage">
          <svg
            ref={svgRef}
            className="road-svg"
            viewBox={`0 0 ${W} ${H}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            {/* road edge → asphalt → center dashes → travelled part */}
            <path ref={pathRef} className="road-edge" d={d} />
            <path className="road-fill" d={d} />
            <path className="road-dash" d={d} />
            <path ref={doneRef} className="road-done" d={d} />
          </svg>

          <div ref={goalRef} className="road-marker">
            {goal ?? '🏁'}
          </div>
          <div ref={carRef} className={`road-vehicle${done ? ' road-vehicle--done' : ''}`}>
            {vehicleItem ? (
              <ItemPic id={vehicleItem} className="road-vehicle-img" fallbackClassName="road-vehicle-emoji" />
            ) : (
              <span className="road-vehicle-emoji" aria-hidden>
                {vehicle}
              </span>
            )}
          </div>
        </div>
        <p className="road-hint">Geser dengan jarimu, jangan keluar jalan!</p>
      </div>
    </>
  );
}
