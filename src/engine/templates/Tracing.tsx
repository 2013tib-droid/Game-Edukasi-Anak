import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';

const SIZE = 420; // logical canvas size (square)
const BRUSH = 16;
const SAMPLE_STEP = 6; // glyph mask sampling grid
const COVER_RADIUS = 20; // how close a stroke must pass to cover a sample
const PASS_COVERAGE = 0.55; // fraction of glyph that must be traced
const MAX_OFF_RATIO = 0.55; // fraction of stroke allowed outside the glyph

/**
 * Guide font for a glyph. Two-digit numbers (10–20) get a smaller size so
 * the whole glyph still fits inside the square canvas on a phone.
 */
function glyphFont(glyph: string): string {
  const scale = glyph.length > 1 ? 0.5 : 0.75;
  return `bold ${SIZE * scale}px 'Fredoka', 'Baloo 2', sans-serif`;
}

interface Sample {
  x: number;
  y: number;
  covered: boolean;
}

/** Trace a letter/number with a finger over a gray guide glyph. */
export default function Tracing({ level, onCorrect, onWrong }: TemplateProps<'tracing'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samples = useRef<Sample[]>([]);
  const inGlyph = useRef<(x: number, y: number) => boolean>(() => false);
  const strokeTotal = useRef(0);
  const strokeOff = useRef(0);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState(false);

  function drawGuide(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#e8e0d0';
    ctx.font = glyphFont(level.data.glyph);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level.data.glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
  }

  // Build glyph mask + guide once per level.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    drawGuide(ctx);

    // Offscreen mask of the glyph for coverage checks.
    const off = document.createElement('canvas');
    off.width = SIZE;
    off.height = SIZE;
    const octx = off.getContext('2d', { willReadFrequently: true })!;
    octx.fillStyle = '#000';
    octx.font = glyphFont(level.data.glyph);
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(level.data.glyph, SIZE / 2, SIZE / 2 + SIZE * 0.04);
    const img = octx.getImageData(0, 0, SIZE, SIZE).data;
    const alphaAt = (x: number, y: number) =>
      img[(Math.round(y) * SIZE + Math.round(x)) * 4 + 3]! > 40;

    const list: Sample[] = [];
    for (let y = 0; y < SIZE; y += SAMPLE_STEP) {
      for (let x = 0; x < SIZE; x += SAMPLE_STEP) {
        if (alphaAt(x, y)) list.push({ x, y, covered: false });
      }
    }
    samples.current = list;
    // Off-glyph test uses a forgiving margin (near the edge still counts).
    inGlyph.current = (x, y) => {
      for (let dy = -COVER_RADIUS; dy <= COVER_RADIUS; dy += COVER_RADIUS) {
        for (let dx = -COVER_RADIUS; dx <= COVER_RADIUS; dx += COVER_RADIUS) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && py >= 0 && px < SIZE && py < SIZE && alphaAt(px, py)) return true;
        }
      }
      return false;
    };
    strokeTotal.current = 0;
    strokeOff.current = 0;
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  function canvasPoint(e: ReactPointerEvent): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  function registerPoint(x: number, y: number) {
    strokeTotal.current += 1;
    if (!inGlyph.current(x, y)) strokeOff.current += 1;
    for (const s of samples.current) {
      if (!s.covered && Math.abs(s.x - x) + Math.abs(s.y - y) < COVER_RADIUS) {
        s.covered = true;
      }
    }
  }

  function down(e: ReactPointerEvent) {
    if (solved) return;
    e.preventDefault();
    drawing.current = true;
    const p = canvasPoint(e);
    lastPoint.current = p;
    registerPoint(p.x, p.y);
  }

  function move(e: ReactPointerEvent) {
    if (!drawing.current || solved) return;
    const p = canvasPoint(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#ff8f2c';
    ctx.lineWidth = BRUSH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current!.x, lastPoint.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
    registerPoint(p.x, p.y);
  }

  function up() {
    drawing.current = false;
    lastPoint.current = null;
  }

  function reset() {
    sfx('tap');
    const ctx = canvasRef.current!.getContext('2d')!;
    drawGuide(ctx);
    for (const s of samples.current) s.covered = false;
    strokeTotal.current = 0;
    strokeOff.current = 0;
  }

  function submit() {
    if (solved) return;
    const total = samples.current.length || 1;
    const covered = samples.current.filter((s) => s.covered).length;
    const coverage = covered / total;
    const offRatio = strokeTotal.current > 0 ? strokeOff.current / strokeTotal.current : 1;
    if (coverage >= PASS_COVERAGE && offRatio <= MAX_OFF_RATIO) {
      setSolved(true);
      onCorrect();
    } else {
      onWrong();
      reset();
    }
  }

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          style={{ aspectRatio: '1 / 1' }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn" onClick={reset}>
            🧽 Hapus
          </button>
          <button className="btn btn--primary" style={{ fontSize: 22 }} onClick={submit}>
            ✅ Sudah!
          </button>
        </div>
      </div>
    </>
  );
}
