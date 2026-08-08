/**
 * Audio manager: Indonesian narration + SFX.
 * - Narration: pre-rendered neural-voice clips when a line has one (see
 *   `voice.ts`), otherwise the device's own Web Speech voice (id-ID). Call
 *   sites never know the difference.
 * - SFX: tiny WebAudio chimes generated on the fly (no downloads, instant).
 * - Victory tune: synthesized too, but rendered offline and played as a media
 *   clip — see `tune.ts` for why WebAudio alone is not audible on a muted
 *   iPhone.
 * Everything is triggered from user gestures (button taps), which satisfies
 * mobile autoplay policies.
 */
import { voiceUrl, voicesReady } from './voice';
import { playTune, tuneClipUrl } from './tune';
import type { Tune } from './tune';

/**
 * Safari 16.4+ lets a page say what its audio is for. Without this, iOS files
 * the page under "ambient" and **the ring switch silences every Web Audio
 * sound** — the tap/correct/wrong chimes go mute on a phone in silent mode,
 * while the narration (a media element) keeps playing. A game whose whole point
 * is to be heard belongs in "playback", same as the narration it sits next to.
 * Unknown to older iOS and to Android, where it does nothing.
 */
interface AudioSession {
  type: 'auto' | 'playback' | 'transient' | 'transient-solo' | 'ambient' | 'play-and-record';
}

function claimPlaybackSession(): void {
  const session = (navigator as Navigator & { audioSession?: AudioSession }).audioSession;
  if (session && session.type === 'auto') session.type = 'playback';
}

if (typeof navigator !== 'undefined') {
  try {
    claimPlaybackSession();
  } catch {
    // Property is read-only on some builds — nothing to do but carry on.
  }
}

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
// and the child hears the robot voice for that one line. Same moment is a good
// one to render the victory tune, so finishing a game never waits on it.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      const el = element();
      el.src = SILENT_WAV;
      void el.play().catch(() => {});
      void tuneClipUrl();
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

/**
 * Play an audio clip on the shared element, then move the queue on. `onFail`
 * runs instead when the clip cannot be played at all (missing, corrupt, or
 * refused by the autoplay policy) — never leave the queue stuck, and never let
 * a child end up hearing nothing.
 */
function playClip(url: string, gen: number, onFail: () => void): void {
  const el = element();
  let settled = false;
  const done = (failed: boolean) => {
    if (settled || gen !== generation) return;
    settled = true;
    el.onended = null;
    el.onerror = null;
    if (failed) onFail();
    else void pump(gen);
  };
  el.onended = () => done(false);
  el.onerror = () => done(true);
  el.src = url;
  void el.play().catch(() => done(true));
}

/** The live-synth tune, if that fallback is what is sounding right now. */
let tune: Tune | null = null;
let tuneTimer = 0;

/** Last resort: play the tune live through WebAudio (silent on a muted iPhone). */
function playTuneLive(gen: number): void {
  const ac = ctx();
  if (!ac) {
    void pump(gen); // no WebAudio here either — don't stall the queue
    return;
  }
  tune = playTune(ac);
  tuneTimer = window.setTimeout(() => {
    tune = null;
    tuneTimer = 0;
    void pump(gen);
  }, tune.duration * 1000);
}

/** Play the victory tune, then carry on with the rest of the queue. */
async function playTuneItem(gen: number): Promise<void> {
  const url = await tuneClipUrl(); // rendered once, then instant
  if (gen !== generation) return;
  if (url) playClip(url, gen, () => playTuneLive(gen));
  else playTuneLive(gen);
}

async function pump(gen: number): Promise<void> {
  if (gen !== generation) return;
  const item = queue.shift();
  if (item === undefined) {
    busy = false;
    return;
  }
  if (item.kind === 'tune') {
    void playTuneItem(gen);
    return;
  }
  const { text } = item;
  await voicesReady(); // instant once loaded; capped so a bad network can't mute the game
  if (gen !== generation) return;
  const url = voiceUrl(text);
  if (url) playClip(url, gen, () => speakWithDevice(text, gen));
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
