import { useEffect, useMemo, useRef, useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';

// Template "tracing": trace a letter/number/shape with a finger.
// The glyph is rendered to an offscreen canvas and sampled into target dots;
// the level completes when the child's strokes cover enough of the glyph.
// level.rounds: [{ char, prompt?, audioSrc? }]
const COVERAGE_NEEDED = 0.6;
const SAMPLE_STEP = 14; // px between sampled glyph points
const HIT_RADIUS = 26; // finger stroke "width" for coverage detection

export default function Tracing({ level, onCorrect, onComplete }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [size, setSize] = useState(320);
  const round = level.rounds[roundIndex];

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const targetsRef = useRef([]); // [{x, y, hit}]
  const doneRef = useRef(false);

  const prompt = round.prompt ?? `Tulis "${round.char}" dengan jarimu!`;

  useEffect(() => {
    const width = Math.min(window.innerWidth - 48, 420);
    setSize(Math.max(240, width));
  }, []);

  // (Re)build glyph guide + sampled target points for the current round.
  const setupKey = useMemo(() => `${round.char}-${size}`, [round, size]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    doneRef.current = false;

    ctx.clearRect(0, 0, size, size);
    ctx.font = `bold ${size * 0.75}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ddd6fe';
    ctx.fillText(round.char, size / 2, size / 2 + size * 0.03);

    // Sample the glyph pixels into coverage targets
    const pixels = ctx.getImageData(0, 0, size, size).data;
    const targets = [];
    for (let y = 0; y < size; y += SAMPLE_STEP) {
      for (let x = 0; x < size; x += SAMPLE_STEP) {
        const alpha = pixels[(y * size + x) * 4 + 3];
        if (alpha > 100) targets.push({ x, y, hit: false });
      }
    }
    targetsRef.current = targets;
  }, [setupKey, round, size]);

  function localPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function markHits(point) {
    targetsRef.current.forEach((t) => {
      if (t.hit) return;
      const dx = t.x - point.x;
      const dy = t.y - point.y;
      if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) t.hit = true;
    });
  }

  function strokeTo(point) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const from = lastPointRef.current ?? point;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    markHits(point);
  }

  function pointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = null;
    strokeTo(localPoint(e));
  }

  function pointerMove(e) {
    if (!drawingRef.current) return;
    strokeTo(localPoint(e));
  }

  function pointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
    if (doneRef.current) return;
    const targets = targetsRef.current;
    const coverage = targets.filter((t) => t.hit).length / Math.max(targets.length, 1);
    if (coverage >= COVERAGE_NEEDED) {
      doneRef.current = true;
      onCorrect();
      setTimeout(() => {
        if (roundIndex + 1 < level.rounds.length) setRoundIndex(roundIndex + 1);
        else onComplete();
      }, 900);
    }
  }

  function reset() {
    // Not a mistake — kids may simply want a clean slate. onWrong is only
    // for genuinely wrong actions; a messy trace never punishes.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.font = `bold ${size * 0.75}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ddd6fe';
    ctx.fillText(round.char, size / 2, size / 2 + size * 0.03);
    targetsRef.current.forEach((t) => { t.hit = false; });
  }

  return (
    <div className="template">
      <PromptBar text={prompt} audioSrc={round.audioSrc} />
      <canvas
        ref={canvasRef}
        className="tracing-canvas"
        width={size}
        height={size}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      />
      <button type="button" className="btn btn-ghost" onClick={reset}>
        🧽 Ulangi
      </button>
      <p className="round-counter">Huruf {roundIndex + 1} / {level.rounds.length}</p>
    </div>
  );
}
