/**
 * Nada percobaan (Lab Cahaya & Bunyi): gelas yang diketuk, karet yang dipetik,
 * gendang yang dipukul. Di game itu BUNYI-nya adalah isi pelajarannya — anak
 * mendengar sendiri bahwa gelas berisi banyak air bernada rendah — jadi nadanya
 * harus benar-benar sampai ke speaker.
 *
 * Alasan yang sama dengan lagu kemenangan (`tune.ts`): iPhone yang sakelar
 * deringnya senyap MEMBISUKAN Web Audio, tapi tidak membisukan elemen media.
 * Jadi tiap nada disintesis sekali ke `OfflineAudioContext`, dibungkus WAV, lalu
 * diputar lewat elemen `<audio>`. Elemennya SENDIRI (bukan elemen narasi):
 * mengetuk gelas tidak boleh memotong kalimat Profesor Panda.
 *
 * Nol unduhan; WebAudio langsung tetap jadi cadangan kalau render ditolak.
 */
import { audioContext } from './sound';
import { wavBlob } from './tune';

export type ToneKind = 'gelas' | 'karet' | 'gendang';

export interface ToneSpec {
  kind: ToneKind;
  hz: number;
  /** 0..1 — seberapa keras (karet/gendang yang ditarik jauh = keras). */
  gain?: number;
}

const RATE = 44100;

const DUR: Record<ToneKind, number> = { gelas: 1.5, karet: 1.1, gendang: 0.7 };

const key = (s: ToneSpec) => `${s.kind}:${Math.round(s.hz)}:${Math.round((s.gain ?? 1) * 10)}`;

/** Jadwalkan satu nada di `ac`, mulai sekarang. */
function schedule(ac: BaseAudioContext, s: ToneSpec): { stop: () => void } {
  const now = ac.currentTime;
  const g = Math.max(0.15, Math.min(1, s.gain ?? 1));
  const out = ac.createGain();
  out.gain.value = g;
  out.connect(ac.destination);
  const nodes: AudioScheduledSourceNode[] = [];
  const dur = DUR[s.kind] * (0.55 + 0.45 * g);

  const osc = (type: OscillatorType, hz: number, peak: number, decay: number, from?: number) => {
    const o = ac.createOscillator();
    const env = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from ?? hz, now);
    if (from) o.frequency.exponentialRampToValueAtTime(hz, now + 0.08);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(peak, now + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    o.connect(env).connect(out);
    o.start(now);
    o.stop(now + decay + 0.05);
    nodes.push(o);
    return o;
  };

  if (s.kind === 'gelas') {
    // Gelas: sinus jernih + nada atas tak harmonis yang cepat padam = "ting".
    osc('sine', s.hz, 0.32, dur);
    osc('sine', s.hz * 2.76, 0.07, dur * 0.35);
    osc('sine', s.hz * 5.4, 0.025, 0.12);
  } else if (s.kind === 'karet') {
    // Karet: segitiga + sedikit nada atas, padam sedang. Lembut di speaker HP.
    osc('triangle', s.hz, 0.34, dur);
    osc('sine', s.hz * 2, 0.08, dur * 0.6);
  } else {
    // Gendang: nada turun cepat + desis pukulan.
    osc('sine', s.hz, 0.5, dur, s.hz * 1.9);
    const len = Math.floor(ac.sampleRate * 0.06);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const noise = ac.createBufferSource();
    const nEnv = ac.createGain();
    nEnv.gain.value = 0.12;
    noise.buffer = buf;
    noise.connect(nEnv).connect(out);
    noise.start(now);
    nodes.push(noise);
  }

  return {
    stop() {
      const t = ac.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      for (const n of nodes) {
        try {
          n.stop(t + 0.06);
        } catch {
          // sudah berhenti
        }
      }
    },
  };
}

const clips = new Map<string, Promise<string | null>>();

function render(s: ToneSpec): Promise<string | null> {
  const k = key(s);
  let p = clips.get(k);
  if (!p) {
    p = (async () => {
      try {
        if (typeof OfflineAudioContext === 'undefined') return null;
        const oc = new OfflineAudioContext(1, Math.ceil(RATE * (DUR[s.kind] + 0.1)), RATE);
        schedule(oc, s);
        return URL.createObjectURL(wavBlob(await oc.startRendering()));
      } catch {
        return null;
      }
    })();
    clips.set(k, p);
  }
  return p;
}

const ready = new Map<string, string | null>();

/** Render dulu semua nada satu percobaan supaya ketukan pertama langsung berbunyi. */
export function primeTones(specs: ToneSpec[]): void {
  for (const s of specs) void render(s).then((url) => ready.set(key(s), url));
}

let el: HTMLAudioElement | null = null;
let live: { stop: () => void } | null = null;

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';

function element(): HTMLAudioElement {
  el ??= new Audio();
  return el;
}

// Buka kunci elemen ini pada sentuhan pertama (izin putar di HP diberikan per elemen).
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      const a = element();
      a.src = SILENT_WAV;
      void a.play().catch(() => {});
    },
    { once: true },
  );
}

function playLive(s: ToneSpec): void {
  const ac = audioContext();
  if (!ac) return;
  live = schedule(ac, s);
}

/** Bunyikan satu nada sekarang (ketukan baru memotong nada sebelumnya). */
export function playTone(s: ToneSpec): void {
  stopTone();
  const url = ready.get(key(s));
  if (url) {
    const a = element();
    a.src = url;
    a.currentTime = 0;
    void a.play().catch(() => playLive(s));
    return;
  }
  // Belum sempat dirender: bunyikan langsung sekarang, render untuk berikutnya.
  playLive(s);
  primeTones([s]);
}

/** Hentikan nada yang sedang berbunyi (getaran ditahan jari, layar ditinggal). */
export function stopTone(): void {
  if (el) el.pause();
  if (live) {
    live.stop();
    live = null;
  }
}
