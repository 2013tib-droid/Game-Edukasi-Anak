/**
 * The victory tune played when a child finishes a whole game.
 *
 * Synthesized rather than shipped as an audio file, for the same reason the
 * other SFX are: zero download, instant, and it can never be the thing that
 * fails on a slow connection.
 *
 * BUT it is not played *live* through WebAudio, because **iOS silences the Web
 * Audio API whenever the ring switch is on silent** — a phone handed to a child
 * is very often exactly that. Media elements are not silenced (that is why the
 * narration clips keep playing), so the tune is rendered offline into a WAV and
 * handed to the same `<audio>` element the narration uses. Same notes, same
 * zero-download property, but on the audio path that actually reaches a
 * speaker. Live playback stays as the fallback (see `playTune`).
 *
 * The context is passed in rather than created here: `sound.ts` owns the single
 * AudioContext (and the mobile unlock dance), and taking it as an argument is
 * what lets the very same code render into an OfflineAudioContext.
 */

/** Note frequencies, equal temperament (Hz). */
const HZ = {
  C3: 130.81,
  F3: 174.61,
  G3: 196.0,
  G4: 392.0,
  C5: 523.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  E6: 1318.51,
  G6: 1568.0,
} as const;

interface Note {
  hz: number;
  /** Start, in seconds from the top of the tune. */
  at: number;
  dur: number;
  wave?: OscillatorType;
  /** Peak gain. Voices are balanced by ear, melody loudest. */
  gain?: number;
}

const MELODY = 0.16; // melody peak gain
const HARMONY = 0.075;
const BASS = 0.11;
const SPARKLE = 0.05;

/**
 * C major, ~2.6 s: an arpeggio climbing to a held G, then IV–V–I landing on a
 * high C with a twinkle over it. Deliberately short — it plays *before* the
 * "Selamat!" narration, so a long tune would just make the child wait.
 */
const NOTES: Note[] = [
  // Melody — triangle, the friendliest of the cheap waveforms.
  { hz: HZ.G4, at: 0.0, dur: 0.16 },
  { hz: HZ.C5, at: 0.16, dur: 0.16 },
  { hz: HZ.E5, at: 0.32, dur: 0.16 },
  { hz: HZ.G5, at: 0.48, dur: 0.32 },
  { hz: HZ.E5, at: 0.8, dur: 0.16 },
  { hz: HZ.G5, at: 0.96, dur: 0.48 },
  { hz: HZ.F5, at: 1.44, dur: 0.16 },
  { hz: HZ.A5, at: 1.6, dur: 0.16 },
  { hz: HZ.G5, at: 1.76, dur: 0.16 },
  { hz: HZ.C6, at: 1.92, dur: 0.7 },

  // Harmony under the sustained notes — sine, so it fills without competing.
  { hz: HZ.C5, at: 0.48, dur: 0.32, wave: 'sine', gain: HARMONY },
  { hz: HZ.E5, at: 0.96, dur: 0.48, wave: 'sine', gain: HARMONY },
  { hz: HZ.C5, at: 1.44, dur: 0.32, wave: 'sine', gain: HARMONY },
  { hz: HZ.E5, at: 1.92, dur: 0.7, wave: 'sine', gain: HARMONY },
  { hz: HZ.G5, at: 1.92, dur: 0.7, wave: 'sine', gain: HARMONY },

  // Bass — I, I, IV, V, I. Sine only: phone speakers turn low square waves
  // into buzz.
  { hz: HZ.C3, at: 0.0, dur: 0.94, wave: 'sine', gain: BASS },
  { hz: HZ.C3, at: 0.96, dur: 0.48, wave: 'sine', gain: BASS },
  { hz: HZ.F3, at: 1.44, dur: 0.32, wave: 'sine', gain: BASS },
  { hz: HZ.G3, at: 1.76, dur: 0.16, wave: 'sine', gain: BASS },
  { hz: HZ.C3, at: 1.92, dur: 0.7, wave: 'sine', gain: BASS },

  // Twinkle over the final chord — quiet, or it is shrill on a phone speaker.
  { hz: HZ.E6, at: 2.04, dur: 0.12, gain: SPARKLE },
  { hz: HZ.G6, at: 2.18, dur: 0.3, gain: SPARKLE },
];

const ATTACK = 0.015;

/** Seconds from the first note to silence, plus a little tail. */
export const TUNE_SECONDS =
  NOTES.reduce((max, n) => Math.max(max, n.at + n.dur), 0) + 0.08;

export interface Tune {
  /** Seconds until the last note has died away. */
  duration: number;
  /** Silence it now — the child tapped "Main Lagi" or left the screen. */
  stop: () => void;
}

/** Schedule the whole tune on `ac`, starting immediately. */
export function playTune(ac: BaseAudioContext): Tune {
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 1;
  master.connect(ac.destination);

  const voices: OscillatorNode[] = [];
  for (const n of NOTES) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.wave ?? 'triangle';
    osc.frequency.value = n.hz;

    // Fast attack, flat middle, exponential release: a plucked-toy envelope.
    const start = now + n.at;
    const peak = n.gain ?? MELODY;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + ATTACK);
    gain.gain.setValueAtTime(peak, start + Math.max(ATTACK * 2, n.dur * 0.55));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);

    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + n.dur + 0.05);
    voices.push(osc);
  }

  return {
    duration: TUNE_SECONDS,
    stop() {
      // Ramp the master down first: cutting oscillators dead mid-cycle clicks
      // audibly on Android speakers.
      const t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0.0001, t + 0.04);
      for (const osc of voices) osc.stop(t + 0.05);
    },
  };
}

/* ---------- Offline render, so the tune can play as a media clip ---------- */

/** Wrap mono float samples in a 16-bit PCM WAV container. */
function wavBlob(buffer: AudioBuffer): Blob {
  const samples = buffer.getChannelData(0);
  const bytes = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(bytes);
  const text = (at: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(at + i, s.charCodeAt(i));
  };
  const rate = buffer.sampleRate;
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}

const RENDER_RATE = 44100;

let clip: Promise<string | null> | null = null;

/**
 * Render the tune once into an object URL an `<audio>` element can play.
 * Resolves to null when the browser has no OfflineAudioContext — the caller
 * then falls back to live WebAudio playback.
 *
 * Kept in memory rather than fetched: ~240 kB of PCM the user never downloads.
 */
export function tuneClipUrl(): Promise<string | null> {
  clip ??= (async () => {
    try {
      const Offline =
        typeof OfflineAudioContext !== 'undefined' ? OfflineAudioContext : undefined;
      if (!Offline) return null;
      const oc = new Offline(1, Math.ceil(RENDER_RATE * TUNE_SECONDS), RENDER_RATE);
      playTune(oc);
      return URL.createObjectURL(wavBlob(await oc.startRendering()));
    } catch {
      return null; // rendering unsupported or refused — live playback it is
    }
  })();
  return clip;
}
