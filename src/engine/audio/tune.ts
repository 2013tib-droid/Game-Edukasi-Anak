/**
 * The victory tune played when a child finishes a whole game.
 *
 * Synthesized with WebAudio instead of shipping an audio file, for the same
 * reason the other SFX are: it costs zero download, starts instantly, and can
 * never be the thing that fails on a slow connection. Narration is different —
 * a child who cannot read *depends* on it, so that one is worth real files.
 *
 * The context is passed in rather than created here: `sound.ts` owns the single
 * AudioContext (and the mobile unlock dance), and taking it as an argument also
 * makes the tune renderable into an OfflineAudioContext for testing.
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
