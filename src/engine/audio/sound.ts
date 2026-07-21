/**
 * Audio manager: Indonesian narration + SFX, zero assets required.
 * - Narration: Web Speech API (id-ID). When real TTS audio files arrive in
 *   public/assets/, `speak` will prefer them (keyed lookup) — same call site.
 * - SFX: tiny WebAudio chimes generated on the fly (no downloads, instant).
 * Everything is triggered from user gestures (button taps), which satisfies
 * mobile autoplay policies.
 */

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  audioCtx ??= new AudioContext();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function indonesianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  cachedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id')) ?? null;
  return cachedVoice;
}

// Voice list loads async on some browsers; refresh the cache when it arrives.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

/** Narrate instruction text in Indonesian. Cancels any ongoing narration. */
export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  const voice = indonesianVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.92; // slightly slow for young kids
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

type SfxKind = 'tap' | 'correct' | 'wrong' | 'win';

/** Note sequences per effect: [frequency Hz, start s, duration s] */
const SEQUENCES: Record<SfxKind, [number, number, number][]> = {
  tap: [[600, 0, 0.08]],
  correct: [
    [523, 0, 0.12],
    [659, 0.12, 0.12],
    [784, 0.24, 0.2],
  ],
  // gentle, non-punishing "try again" sound
  wrong: [
    [330, 0, 0.15],
    [294, 0.15, 0.2],
  ],
  win: [
    [523, 0, 0.12],
    [659, 0.12, 0.12],
    [784, 0.24, 0.12],
    [1047, 0.36, 0.3],
  ],
};

export function sfx(kind: SfxKind): void {
  const ac = ctx();
  if (!ac) return;
  const now = ac.currentTime;
  for (const [freq, start, dur] of SEQUENCES[kind]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  }
}
