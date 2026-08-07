import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import { SIZE, createTraceScorer, drawGlyph, type TraceScorer } from './traceScore';

const BRUSH = 16;

/** Trace a letter/number with a finger over a gray guide glyph. */
export default function Tracing({ level, onCorrect, onWrong }: TemplateProps<'tracing'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scorer = useRef<TraceScorer | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState(false);

  function drawGuide(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#e8e0d0';
    drawGlyph(ctx, level.data.glyph);
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
    scorer.current = createTraceScorer(level.data.glyph);
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  function canvasPoint(e: ReactPointerEvent): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  function down(e: ReactPointerEvent) {
    if (solved) return;
    e.preventDefault();
    drawing.current = true;
    const p = canvasPoint(e);
    lastPoint.current = p;
    scorer.current?.addPoint(p.x, p.y);
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
    scorer.current?.addPoint(p.x, p.y);
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    scorer.current?.endStroke();
  }

  function reset() {
    sfx('tap');
    const ctx = canvasRef.current!.getContext('2d')!;
    drawGuide(ctx);
    scorer.current?.reset();
  }

  function submit() {
    if (solved) return;
    if (scorer.current?.score().ok) {
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
