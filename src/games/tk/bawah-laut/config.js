// Bawah Laut — Warna & Bentuk! (migrated from petualangan-pintar.html)
import { SHAPES, COLORS, shapeSVG, pick, shuffle } from '../_shared/petualangan.js';

const ROUNDS = 5;

function shapeRound() {
  const target = pick(SHAPES);
  const color = pick(COLORS);
  const others = shuffle(SHAPES.filter((s) => s.id !== target.id)).slice(0, 3);
  return {
    prompt: `Sentuh bentuk ${target.label}!`,
    speak: `Mana bentuk ${target.label}? Ayo sentuh!`,
    options: shuffle([target, ...others]).map((shape) => ({
      html: shapeSVG(shape.id, color.hex),
      correct: shape.id === target.id,
    })),
  };
}

function colorRound() {
  const target = pick(COLORS);
  const shape = pick(SHAPES);
  const others = shuffle(COLORS.filter((c) => c.id !== target.id)).slice(0, 3);
  return {
    prompt: `Sentuh warna ${target.label}!`,
    speak: `Mana warna ${target.label}? Ayo sentuh!`,
    options: shuffle([target, ...others]).map((color) => ({
      html: shapeSVG(shape.id, color.hex),
      correct: color.id === target.id,
    })),
  };
}

function comboRound() {
  const targetShape = pick(SHAPES);
  const targetColor = pick(COLORS);
  const options = [{ html: shapeSVG(targetShape.id, targetColor.hex), correct: true }];
  while (options.length < 4) {
    const shape = pick(SHAPES);
    const color = pick(COLORS);
    if (shape.id === targetShape.id && color.id === targetColor.id) continue;
    options.push({ html: shapeSVG(shape.id, color.hex) });
  }
  return {
    prompt: `Sentuh ${targetShape.label} ${targetColor.label}!`,
    speak: `Cari ${targetShape.label}. Yang berwarna ${targetColor.label}. Ayo sentuh!`,
    options: shuffle(options),
  };
}

export default {
  levels: [
    {
      id: 'kenali-bentuk',
      template: 'tap-answer',
      title: '🐠 Kenali Bentuk',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, shapeRound) }),
    },
    {
      id: 'kenali-warna',
      template: 'tap-answer',
      title: '🐙 Kenali Warna',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, colorRound) }),
    },
    {
      id: 'bentuk-dan-warna',
      template: 'tap-answer',
      title: '🐬 Bentuk + Warna',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, comboRound) }),
    },
  ],
};
