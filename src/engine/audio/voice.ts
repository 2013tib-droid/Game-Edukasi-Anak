/**
 * Pre-rendered narration lookup.
 *
 * The device's own `speechSynthesis` voice is a lottery: some Android phones
 * have a warm Indonesian voice, some have a robotic one, some have no id-ID
 * voice at all and read our narration with an English accent — or stay
 * silent. Since a child who can't read yet depends entirely on the narration,
 * the real narration ships as audio files rendered once with a neural voice,
 * exactly like animals ship as WebP art instead of the device emoji font.
 *
 * This module only answers "is there a file for this line, and where?" —
 * playback and the fallback live in `sound.ts`.
 *
 * The manifest is produced by the render script from
 * `scripts/narration-lines.json` and maps SPOKEN TEXT to a file under
 * `public/assets/voice/`:
 *
 *     { "Ayo hitung! Ada berapa kuda?": "hutan-hewan/3f2a1c9d4b70.mp3" }
 *
 * The value carries its own file extension, so the render script can change
 * audio format without an app change.
 *
 * Keyed by the text itself rather than by a hash the browser recomputes: the
 * lookup stays synchronous (no `crypto.subtle`), and there is no way for the
 * script's hashing and the app's hashing to silently drift apart. `_shared`
 * and `_engine` are scopes too — lines spoken by several games / by the shell.
 */

/** Spoken text → file path relative to `public/assets/voice/`. */
export type VoiceManifest = Record<string, string>;

const DIR = `${import.meta.env.BASE_URL}assets/voice/`;

/** How long to wait for the manifest before narrating with the device voice. */
const LOAD_TIMEOUT_MS = 2000;

let manifest: VoiceManifest = {};
let loading: Promise<void> | null = null;

/**
 * Normalize a config string to the form the render script hashed. Configs glue
 * equation halves together with non-breaking spaces so a phone never wraps
 * "= ?" onto its own line — that is a layout trick, and the voice files were
 * rendered from ordinary spaces.
 *
 * MUST stay identical to `spoken()` in `scripts/extract-narration.mjs`.
 */
export function spokenText(text: string): string {
  return text.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Fetch the manifest once. Absent (voices not rendered yet) or unreachable
 * (offline) is a normal state, not an error: the app simply narrates with the
 * device voice, which is what it did before the files existed.
 */
export function loadVoiceManifest(): Promise<void> {
  loading ??= (async () => {
    try {
      const res = await fetch(`${DIR}manifest.json`);
      if (res.ok) manifest = (await res.json()) as VoiceManifest;
    } catch {
      // Offline or no manifest deployed — keep the empty map.
    }
  })();
  return loading;
}

/** Resolve once the manifest is in, or after the timeout — never hangs. */
export function voicesReady(): Promise<void> {
  return Promise.race([
    loadVoiceManifest(),
    new Promise<void>((resolve) => setTimeout(resolve, LOAD_TIMEOUT_MS)),
  ]);
}

/** URL of the rendered clip for this line, or null to use the device voice. */
export function voiceUrl(text: string): string | null {
  const file = manifest[spokenText(text)];
  return file ? `${DIR}${file}` : null;
}

// Start fetching as soon as the audio manager is pulled in — that happens when
// a game chunk loads, which is a beat before the first line is ever spoken.
if (typeof window !== 'undefined') void loadVoiceManifest();
