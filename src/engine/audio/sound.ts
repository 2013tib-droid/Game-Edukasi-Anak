/**
 * Audio manager: Indonesian narration + SFX.
 * - Narration: pre-rendered neural-voice clips when a line has one (see
 *   `voice.ts`), otherwise the device's own Web Speech voice (id-ID). Call
 *   sites never know the difference.
 * - SFX: tiny WebAudio chimes generated on the fly (no downloads, instant).
 * Everything is triggered from user gestures (button taps), which satisfies
 * mobile autoplay policies.
 */
import { voiceUrl, voicesReady } from './voice';
import { playTune } from './tune';
import type { Tune } from './tune';

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

function utterance(text: string): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  const voice = indonesianVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.92; // slightly slow for young kids
  utter.pitch = 1.1;
  return utter;
}

/* ---------- Narration queue ----------
 *
 * Lines go through ONE queue whichever source speaks them, because a screen
 * can mix the two: while voices are being rendered game by game, a story page
 * may have a real clip and its options may not. Two independent players would
 * talk over each other; a single queue keeps the order the call site asked for.
 *
 * The victory tune rides the same queue (see `celebrate`) so it plays *before*
 * the praise line instead of over it, and so `stopSpeaking()` silences music
 * and speech together — a child who taps "Main Lagi" must not hear the last
 * screen's celebration over the next question.
 */

type QueueItem = { kind: 'say'; text: string } | { kind: 'tune' };

/** Items waiting to be played, in order. */
let queue: QueueItem[] = [];
/** Bumped by every interruption — stale callbacks check it before continuing. */
let generation = 0;
/** True while a line is being spoken or resolved. */
let busy = false;

/**
 * ONE reusable <audio> element for every clip. Mobile browsers grant playback
 * permission per element, so reusing the element the child's first tap
 * unlocked keeps later narration audible, where a fresh element per line could
 * be blocked mid-game.
 */
let player: HTMLAudioElement | null = null;

function element(): HTMLAudioElement {
  player ??= new Audio();
  return player;
}

/** Empty 44-byte WAV — plays instantly, makes no sound. */
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';

// Warm the element up on the very first touch anywhere, long before the first
// narration: otherwise level 1's clip can be refused by the autoplay policy
// and the child hears the robot voice for that one line.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      const el = element();
      el.src = SILENT_WAV;
      void el.play().catch(() => {});
    },
    { once: true },
  );
}

/** Speak one line with the device's own voice (no rendered clip for it). */
function speakWithDevice(text: string, gen: number): void {
  if (gen !== generation) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    void pump(gen); // no voice at all on this device — don't stall the queue
    return;
  }
  const utter = utterance(text);
  utter.onend = () => void pump(gen);
  utter.onerror = () => void pump(gen);
  window.speechSynthesis.speak(utter);
}

/** Play the pre-rendered clip, falling back to the device voice if it can't. */
function playClip(url: string, text: string, gen: number): void {
  const el = element();
  let settled = false;
  const done = (fallback: boolean) => {
    if (settled || gen !== generation) return;
    settled = true;
    el.onended = null;
    el.onerror = null;
    if (fallback) speakWithDevice(text, gen);
    else void pump(gen);
  };
  el.onended = () => done(false);
  el.onerror = () => done(true); // clip missing or corrupt
  el.src = url;
  void el.play().catch(() => done(true)); // autoplay refused
}

/** The tune currently sounding, so an interruption can cut it short. */
let tune: Tune | null = null;
let tuneTimer = 0;

/** Play the victory tune, then carry on with the rest of the queue. */
function playTuneItem(gen: number): void {
  const ac = ctx();
  if (!ac) {
    void pump(gen); // no WebAudio here — don't stall the queue
    return;
  }
  tune = playTune(ac);
  tuneTimer = window.setTimeout(() => {
    tune = null;
    tuneTimer = 0;
    void pump(gen);
  }, tune.duration * 1000);
}

async function pump(gen: number): Promise<void> {
  if (gen !== generation) return;
  const item = queue.shift();
  if (item === undefined) {
    busy = false;
    return;
  }
  if (item.kind === 'tune') {
    playTuneItem(gen);
    return;
  }
  const { text } = item;
  await voicesReady(); // instant once loaded; capped so a bad network can't mute the game
  if (gen !== generation) return;
  const url = voiceUrl(text);
  if (url) playClip(url, text, gen);
  else speakWithDevice(text, gen);
}

function enqueue(items: QueueItem[], interrupt: boolean): void {
  if (interrupt) stopSpeaking();
  queue.push(...items.filter((i) => i.kind === 'tune' || i.text.trim()));
  if (busy) return;
  busy = true;
  void pump(generation);
}

function say(text: string): QueueItem {
  return { kind: 'say', text };
}

/** Narrate instruction text in Indonesian. Cancels any ongoing narration. */
export function speak(text: string): void {
  enqueue([say(text)], true);
}

/**
 * Finishing a whole game: play the victory tune, then the praise line.
 *
 * Queued rather than mixed, because the tune is loud enough to bury a voice —
 * and the praise line is the part the child has to understand.
 */
export function celebrate(text: string): void {
  enqueue([{ kind: 'tune' }, say(text)], true);
}

/**
 * Narrate text AFTER whatever is already being said (no cancel) — used when a
 * screen has several things to read in order, e.g. the story page followed by
 * "Pilihan A…", "Pilihan B…". Children who can't read yet must hear every
 * option, so these lines have to queue instead of cutting each other off.
 */
export function speakNext(...texts: string[]): void {
  enqueue(texts.map(say), false);
}

export function stopSpeaking(): void {
  generation += 1;
  queue = [];
  busy = false;
  if (tuneTimer) {
    window.clearTimeout(tuneTimer);
    tuneTimer = 0;
  }
  if (tune) {
    tune.stop();
    tune = null;
  }
  if (player) {
    player.onended = null;
    player.onerror = null;
    player.pause();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// No 'win' chime here on purpose: finishing a game plays the real tune
// (`celebrate`). Two victory sounds would only drift apart.
type SfxKind = 'tap' | 'correct' | 'wrong';

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
