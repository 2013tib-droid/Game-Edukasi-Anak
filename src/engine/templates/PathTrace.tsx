import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { RoadSpec } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
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
  const dragging = useRef(false);
  const blocked = useRef(false); // ignore rest of the gesture after a reset
  const [road$, setRoad$] = useState<{ points: Pt[]; length: number }>({ points: [], length: 0 });
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

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
    setRoad$({ points: list, length: total });
    setIndex(0);
    setDone(false);
  }, [d]);

  function svgPoint(e: ReactPointerEvent): Pt {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

  function finish() {
    setDone(true);
    dragging.current = false;
    sfx('correct');
    onCorrect();
  }

  function down(e: ReactPointerEvent) {
    if (done) return;
    e.preventDefault();
    const p = svgPoint(e);
    const here = road$.points[index];
    // The finger must start on (or right next to) the vehicle.
    if (!here || dist(p, here) > OFF_ROAD) return;
    dragging.current = true;
    blocked.current = false;
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function move(e: ReactPointerEvent) {
    if (!dragging.current || done || blocked.current) return;
    e.preventDefault();
    const p = svgPoint(e);
    const list = road$.points;
    if (list.length === 0) return;

    // Closest road point within the look-ahead window (forward only).
    let best = index;
    let bestDist = Infinity;
    const end = Math.min(list.length - 1, index + LOOK_AHEAD);
    for (let i = index; i <= end; i += 1) {
      const dd = dist(p, list[i]!);
      if (dd < bestDist) {
        bestDist = dd;
        best = i;
      }
    }

    if (bestDist > OFF_ROAD) {
      // Off the road: gentle reset, one mistake, wait for a fresh touch.
      blocked.current = true;
      dragging.current = false;
      setIndex(0);
      onWrong();
      return;
    }
    if (bestDist > ON_ROAD) return; // wobbling near the edge: just no progress

    if (best > index) {
      setIndex(best);
      if (best >= list.length - 1 - FINISH_AT) finish();
    }
  }

  function up() {
    dragging.current = false;
    blocked.current = false;
  }

  const list = road$.points;
  const at = list[index] ?? { x: 10, y: H / 2 };
  const goalAt = list[list.length - 1] ?? { x: 90, y: H / 2 };
  // Heading, so the vehicle points where the road goes.
  const ahead = list[Math.min(list.length - 1, index + 4)] ?? at;
  const angle = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI;
  const travelled = road$.length * (index / Math.max(1, SAMPLES - 1));

  const pct = (v: number, max: number) => `${(v / max) * 100}%`;

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
            <path
              className="road-done"
              d={d}
              style={{
                strokeDasharray: road$.length || 1,
                strokeDashoffset: (road$.length || 1) - travelled,
              }}
            />
          </svg>

          <div className="road-marker road-marker--goal" style={{ left: pct(goalAt.x, W), top: pct(goalAt.y, H) }}>
            {goal ?? '🏁'}
          </div>
          <div
            className={`road-vehicle${done ? ' road-vehicle--done' : ''}`}
            style={{
              left: pct(at.x, W),
              top: pct(at.y, H),
              // scaleX(-1): vehicle emoji face LEFT in most fonts — mirror them
              // first so the rotation makes them head along the road.
              transform: `translate(-50%, -50%) rotate(${angle}deg) scaleX(-1)`,
            }}
          >
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
