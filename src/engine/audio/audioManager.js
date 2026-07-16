// Narration + SFX manager.
// Narration: plays a pre-recorded TTS asset when `src` is given (Phase 4
// asset pipeline); otherwise falls back to the browser's Indonesian
// speechSynthesis voice so games are fully narrated during development.
// SFX: tiny WebAudio blips, no asset downloads.

let audioCtx = null;
let currentAudio = null;

function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function pickIndonesianVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices.find((v) => v.lang?.toLowerCase().startsWith('id')) || null;
}

export function stopNarration() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis?.cancel();
}

export function narrate(text, { src } = {}) {
  stopNarration();
  if (src) {
    currentAudio = new Audio(src);
    currentAudio.play().catch(() => {});
    return;
  }
  if (!('speechSynthesis' in window) || !text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  utter.rate = 0.95;
  const voice = pickIndonesianVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

function blip(freq, startAt, duration, type = 'sine', gainValue = 0.12) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration);
}

const SFX = {
  tap: () => blip(600, 0, 0.08, 'triangle'),
  correct: () => {
    blip(523, 0, 0.12);
    blip(659, 0.1, 0.12);
    blip(784, 0.2, 0.2);
  },
  wrong: () => blip(220, 0, 0.25, 'triangle', 0.08),
  win: () => {
    [523, 587, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.12, 0.18));
  },
};

export function playSfx(name) {
  SFX[name]?.();
}

// Some browsers load speechSynthesis voices asynchronously.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
