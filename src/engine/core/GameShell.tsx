import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type {
  AnyGameConfig,
  ClockSpec,
  GameLevel,
  MixedLevel,
  Stars,
  TemplateId,
} from '@/engine/core/types';
import { getLevelStars, getTotalStars, saveLevelStars } from '@/engine/core/progress';
import { clearSession, getSession, saveSession } from '@/engine/core/session';
import type { LevelPick } from '@/engine/core/session';
import { celebrate, sfx, speak, stopSpeaking } from '@/engine/audio/sound';
import { FeedbackOverlay, LevelDots, SpeakButton, StarsRow } from '@/engine/ui/Feedback';
import MascotCard from '@/engine/ui/Mascot';
import Clock from '@/engine/ui/Clock';
import { gameImageUrl } from '@/engine/ui/GameIcon';
import ItemPic from '@/engine/ui/ItemPic';
import BackIcon from '@/engine/ui/BackIcon';
import '@/engine/ui/engine.css';

/**
 * Props every template component receives. Templates report results via
 * callbacks; the shell owns narration, feedback overlays, stars, and flow.
 * - onCorrect(): level solved → shell celebrates and advances.
 * - onWrong(silent): a mistake. Non-silent shows the "coba lagi" overlay;
 *   silent just counts it (e.g. memory-card misses, which are part of play).
 */
export interface TemplateProps<T extends TemplateId = TemplateId> {
  level: GameLevel<T>;
  onCorrect: () => void;
  onWrong: (silent?: boolean) => void;
  /** Narrate arbitrary text (e.g. a story page) through the engine. */
  narrate: (text: string) => void;
  /**
   * Change what the top-bar 🔊 button repeats. By default it re-reads
   * `level.narration`, which is right for a level that shows one question —
   * but a story level walks through several pages inside the same level, and a
   * child on page 3 tapping 🔊 must hear page 3, not the opening line. Pass
   * `null` (or let the template unmount) to fall back to `level.narration`.
   */
  setRepeat: (speakCurrent: (() => void) | null) => void;
}

// Lazy per-template chunks — a game only downloads the template it uses.
const TEMPLATES: { [T in TemplateId]: LazyExoticComponent<ComponentType<TemplateProps<T>>> } = {
  'tap-answer': lazy(() => import('@/engine/templates/TapAnswer')),
  'drag-drop': lazy(() => import('@/engine/templates/DragDrop')),
  tracing: lazy(() => import('@/engine/templates/Tracing')),
  memory: lazy(() => import('@/engine/templates/Memory')),
  'count-tap': lazy(() => import('@/engine/templates/CountTap')),
  'story-choice': lazy(() => import('@/engine/templates/StoryChoice')),
  spell: lazy(() => import('@/engine/templates/Spell')),
  'path-trace': lazy(() => import('@/engine/templates/PathTrace')),
};

/** Shortest time the "Hebat! Kamu benar!" overlay stays up, in ms. */
const FEEDBACK_MS = 1400;
/**
 * Longest it may stay up. Only reached when the praise clip never reports back
 * (stalled download, a tab the browser refuses to sound) — the child moves on
 * anyway rather than sitting on a frozen overlay.
 */
const FEEDBACK_MAX_MS = 4000;

/**
 * Resolve which template renders a level. Homogeneous games use the game's
 * `template`; "mixed" games carry the template on each level.
 */
function templateFor(
  config: AnyGameConfig,
  level: GameLevel | MixedLevel | undefined,
): TemplateId {
  if (level && 'template' in level && level.template) return level.template;
  return config.template as TemplateId;
}

function starsForMistakes(wrong: number): Stars {
  if (wrong === 0) return 3;
  if (wrong <= 2) return 2;
  return 1;
}

type ConcreteLevel = GameLevel | MixedLevel;

/** Fisher-Yates shuffle on a copy. */
function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Draw the level list for one playthrough as *picks* (slot index + variant
 * index): a slot that is an array of variants collapses to one randomly-chosen
 * variant. When the game sets `sessionLevels`, only that many slots are
 * drawn (no repeats, random order) — a big pool, a short session.
 * Re-run per play (and on "Main Lagi") so questions vary.
 *
 * Picks rather than level objects so an interrupted play can be stored (see
 * `session.ts`) and rebuilt later at exactly the same questions.
 */
function rollPicks(config: AnyGameConfig): LevelPick[] {
  const slots = config.levels as Array<ConcreteLevel | ConcreteLevel[]>;
  let order = slots.map((_, i) => i);
  const take = config.sessionLevels;
  if (take && take > 0 && take < order.length) order = shuffled(order).slice(0, take);
  return order.map((s) => {
    const slot = slots[s]!;
    return { s, v: Array.isArray(slot) ? Math.floor(Math.random() * slot.length) : 0 };
  });
}

/** Rebuild the concrete levels a pick list points at. */
function levelsFromPicks(config: AnyGameConfig, picks: LevelPick[]): ConcreteLevel[] {
  const slots = config.levels as Array<ConcreteLevel | ConcreteLevel[]>;
  return picks.map((p) => {
    const slot = slots[p.s]!;
    return Array.isArray(slot) ? slot[p.v]! : slot;
  });
}

/**
 * Screens: `intro` (start / resume) or `pick` (choose a level) → `playing` →
 * `done`. A game with `chooseLevel` opens straight on `pick` — its whole point
 * is that the child sees every title from the start.
 */
type Screen = 'intro' | 'pick' | 'playing' | 'done';

export default function GameShell({
  config,
  onExit,
  icon,
  iconPic,
  iconClock,
}: {
  config: AnyGameConfig;
  onExit: () => void;
  /**
   * The game's icon, straight from the registry (`GameMeta.emoji`) via
   * `GamePage`. The registry WINS over `config.emoji` on purpose: the portal
   * card reads the registry, so anything else here would let the two drift —
   * which is exactly what happened to Pasangan Pintar (card 🤝, intro 🧠).
   * `config.emoji` stays as the fallback for shells rendered outside the
   * portal (tests, previews).
   */
  icon?: string;
  /**
   * The game's icon ART (`GameMeta.pic`), drawn instead of `icon` on the intro
   * screen. Same single-source rule as `icon`: the registry decides, so the
   * portal card and this screen can never drift apart.
   */
  iconPic?: string;
  /**
   * Draw the intro screen's big icon as a real clock face instead of an emoji.
   * Declared once in the game registry (`GameMeta.iconClock`) and passed down
   * by `GamePage`, so the portal card and this screen always show the same
   * icon.
   */
  iconClock?: ClockSpec;
}) {
  const picker = config.chooseLevel;
  const [screen, setScreen] = useState<Screen>(picker ? 'pick' : 'intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  // Sampul kartu yang filenya gagal dimuat (deploy setengah jadi) — kartunya
  // jatuh ke gambar item/emoji, jangan pernah kosong. Pola yang sama dengan
  // `brokenArt` di `StoryChoice`.
  const [brokenCover, setBrokenCover] = useState<Record<string, boolean>>({});
  const [earned, setEarned] = useState<Stars[]>([]);
  const wrongCount = useRef(0);
  // Remount the template on retry/advance so its internal state resets.
  const [attemptKey, setAttemptKey] = useState(0);
  // Level list of the current play, re-rolled on each play/replay so variant
  // slots serve fresh questions.
  const [picks, setPicks] = useState<LevelPick[]>(() => rollPicks(config));
  // Interrupted play from a previous visit, if any — read once on mount so
  // the intro can offer "Lanjut Main" at the level the child stopped at.
  // A picker game has nothing to resume: one pick = one level, so a play is
  // either finished or never got past its first level.
  const [saved, setSaved] = useState(() => (picker ? null : getSession(config)));
  // What the 🔊 button repeats, when a template narrates something other than
  // the level narration (story pages). Registered by the template and cleared
  // on its unmount, so a level that never registers falls back to the default.
  const repeat = useRef<(() => void) | null>(null);
  const setRepeat = useCallback((speakCurrent: (() => void) | null) => {
    repeat.current = speakCurrent;
  }, []);

  const levels = useMemo(() => levelsFromPicks(config, picks), [config, picks]);
  const level = levels[levelIndex];
  const Template = TEMPLATES[templateFor(config, level)] as ComponentType<TemplateProps>;

  useEffect(() => () => stopSpeaking(), []);

  // Narrate the instruction whenever a new level is shown (covers first
  // level, advancing, and freshly re-rolled variants after a replay).
  //
  // **Cerita adalah kekecualian** (laporan pemilik 2026-09-03, Jalak &
  // Kerbau): `narration` sebuah cerita itu judul + ajakan ("Burung Jalak dan
  // Kerbau. Ayo ikuti ceritanya!") — kalimat untuk KARTU PEMILIH cerita, dan
  // anak yang baru saja mengetuk kartu itu sudah mendengarnya di sana. Kalau
  // shell membacakannya sekali lagi di sini, halaman pertama cerita ("Kerbau
  // berkubang di sawah…") harus mengantre di belakangnya dulu — anak menatap
  // gambar sambil mendengar judul yang sudah dia dengar. Cerita punya
  // pembuka sendiri: halaman pertamanya, yang dibacakan `StoryChoice`.
  useEffect(() => {
    if (screen !== 'playing') return;
    wrongCount.current = 0;
    const lv = levels[levelIndex];
    if (lv && templateFor(config, lv) !== 'story-choice') speak(lv.narration);
  }, [screen, levelIndex, levels, config]);

  /** Start over from level 1 with freshly drawn questions. */
  function handleStart() {
    sfx('tap');
    setPicks(rollPicks(config)); // re-roll variants for this play
    setEarned([]);
    setLevelIndex(0);
    clearSession(config.id);
    setSaved(null);
    setScreen('playing');
  }

  /** Play the one level the child tapped on the picker. */
  function handlePick(slotIndex: number) {
    sfx('tap');
    setPicks([{ s: slotIndex, v: 0 }]);
    setEarned([]);
    setLevelIndex(0);
    // Every pick plays at level index 0, so without a new attempt key React
    // would keep the previous story's template mounted (stuck on its last page).
    setAttemptKey((k) => k + 1);
    clearSession(config.id);
    setScreen('playing');
  }

  /** Pick up the interrupted play at the level the child stopped at. */
  function handleResume() {
    if (!saved) return;
    sfx('tap');
    setPicks(saved.picks);
    setEarned(saved.earned);
    setLevelIndex(saved.index);
    setScreen('playing');
  }

  const handleCorrect = useCallback(() => {
    if (!level) return;
    const stars = starsForMistakes(wrongCount.current);
    saveLevelStars(config.id, level.id, stars);
    const earnedNow = [...earned, stars];
    setEarned(earnedNow);
    sfx('correct');
    setFeedback('correct');

    const go = () => {
      setFeedback(null);
      const next = levelIndex + 1;
      if (next >= levels.length) {
        // Finished: nothing left to resume.
        clearSession(config.id);
        setSaved(null);
        // Victory tune first, praise line after it — see `celebrate`.
        celebrate('Selamat! Kamu hebat sekali!');
        setScreen('done');
      } else {
        // Remember where we are, so leaving now resumes here next time.
        saveSession(config.id, { picks, index: next, earned: earnedNow });
        setLevelIndex(next);
        setAttemptKey((k) => k + 1);
        // narration handled by the level-change effect
      }
    };
    // Move on once BOTH are true: the praise has been heard to the end, and the
    // overlay has been up long enough to read. Waiting for the voice is what
    // matters — whatever comes next (the new level's narration, or the victory
    // tune) starts by cutting off whatever is still speaking, so advancing on a
    // timer alone chopped "Hebat! Kamu benar!" down to "Hebat" on a phone,
    // where a clip only starts after its mp3 has been fetched.
    let spoken = false;
    let shown = false;
    let moved = false;
    const step = () => {
      if (!spoken || !shown || moved) return;
      moved = true;
      go();
    };
    speak('Hebat! Kamu benar!', () => {
      spoken = true;
      step();
    });
    window.setTimeout(() => {
      shown = true;
      step();
    }, FEEDBACK_MS);
    // A clip that never reports back (stalled download, muted tab) must not
    // strand the child on the overlay for ever.
    window.setTimeout(() => {
      spoken = true;
      shown = true;
      step();
    }, FEEDBACK_MAX_MS);
  }, [config, earned, level, levelIndex, levels, picks]);

  const handleWrong = useCallback((silent?: boolean) => {
    wrongCount.current += 1;
    if (silent) return;
    sfx('wrong');
    speak('Coba lagi, kamu pasti bisa!');
    setFeedback('wrong');
    window.setTimeout(() => setFeedback(null), 1300);
  }, []);

  if (screen === 'pick' && picker) {
    const slots = config.levels as Array<ConcreteLevel | ConcreteLevel[]>;
    return (
      <div className="game-center game-center--pick">
        <h1 className="pick-heading">{config.title}</h1>
        <p className="pick-prompt">{picker.title}</p>
        <div className="pick-grid">
          {slots.map((slot, i) => {
            // A picker game declares one level per slot (see `LevelPicker`);
            // a variant pool would have no single card to show, so take its
            // first level rather than rendering nothing.
            const lv = Array.isArray(slot) ? slot[0]! : slot;
            const card = lv.card;
            const label = card?.label ?? lv.narration;
            const stars = getLevelStars(config.id, lv.id);
            // Cerita yang tampilannya belum digarap: kartunya tetap terlihat
            // supaya anak tahu judulnya menyusul, tapi mati total — tidak bisa
            // ditekan, dan tombol 🔊-nya diganti gembok supaya tidak ada satu
            // pun bagian kartu yang memberi respons dan bikin salah harap.
            const soon = card?.soon === true;
            // Sampulnya dilepas kalau filenya gagal dimuat — kartunya lalu
            // memakai gambar item/emoji seperti sebelum ada sampul.
            const cover = card?.art && !brokenCover[card.art] ? card.art : null;
            return (
              <button
                key={lv.id}
                type="button"
                className={`btn pick-card${soon ? ' pick-card--soon' : ''}`}
                disabled={soon}
                aria-label={soon ? `${label} — segera hadir` : undefined}
                onClick={() => handlePick(i)}
              >
                {/* Sampul: ilustrasi adegan selebar kartu, jadi kartunya
                    terbaca seperti buku cerita di rak — anak yang belum lancar
                    membaca mengenali ceritanya dari gambarnya, bukan judulnya.
                    Cerita yang belum punya ilustrasi memakai gambar item/emoji
                    di atas langit-rumput yang sama, supaya semua kartu tetap
                    sebentuk. */}
                <span className="pick-card__cover">
                  {cover ? (
                    <img
                      className="pick-card__art"
                      src={`${import.meta.env.BASE_URL}assets/story/${cover}.webp`}
                      alt=""
                      aria-hidden
                      draggable={false}
                      onError={() => setBrokenCover((b) => ({ ...b, [cover]: true }))}
                    />
                  ) : (
                    <span className="pick-card__pic" aria-hidden>
                      {card?.item ? (
                        <ItemPic id={card.item} className="pick-card__img" />
                      ) : (
                        (card?.emoji ?? config.emoji)
                      )}
                    </span>
                  )}
                  <span className="pick-card__stars" aria-label={`${stars} bintang`}>
                    {'⭐'.repeat(stars)}
                    {'☆'.repeat(3 - stars)}
                  </span>
                  {/* Reading is not assumed: 🔊 replays the level's own
                      narration line — already recorded, so no new audio. A
                      level that is not open yet gets a padlock in the same
                      corner instead: nothing on the card responds. */}
                  {soon ? (
                    <span className="pick-card__soon" aria-hidden>
                      🔒
                    </span>
                  ) : (
                    <span
                      className="pick-card__speak"
                      role="button"
                      tabIndex={0}
                      aria-label={`Dengarkan ${label}`}
                      onClick={(e) => {
                        // Listening must not count as choosing.
                        e.stopPropagation();
                        sfx('tap');
                        speak(lv.narration);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.stopPropagation();
                        e.preventDefault();
                        speak(lv.narration);
                      }}
                    >
                      🔊
                    </span>
                  )}
                </span>
                <span className="pick-card__label">{label}</span>
              </button>
            );
          })}
        </div>
        <button className="btn" onClick={onExit}>
          <BackIcon /> Kembali
        </button>
      </div>
    );
  }

  if (screen === 'intro') {
    return (
      <div className="game-center">
        {iconClock ? (
          <Clock time={iconClock} className="game-big-clock" />
        ) : iconPic ? (
          <img className="game-big-pic" src={gameImageUrl(iconPic)} alt="" />
        ) : (
          <div className="game-big-emoji" aria-hidden>
            {icon ?? config.emoji}
          </div>
        )}
        <h1>{config.title}</h1>
        {saved ? (
          <>
            {/* Coming back after stopping mid-game: continue where the child
                left off, with the same questions, instead of level 1 again. */}
            <button className="btn btn--primary" style={{ fontSize: 26 }} onClick={handleResume}>
              ▶️ Lanjut Level {saved.index + 1}
            </button>
            <button className="btn" style={{ fontSize: 22 }} onClick={handleStart}>
              🔄 Mulai dari Awal
            </button>
          </>
        ) : (
          <button className="btn btn--primary" style={{ fontSize: 26 }} onClick={handleStart}>
            ▶️ Mulai Main
          </button>
        )}
        <button className="btn" onClick={onExit}>
          <BackIcon /> Kembali
        </button>
      </div>
    );
  }

  if (screen === 'done') {
    const total = earned.reduce<number>((s, x) => s + x, 0);
    return (
      <div className="game-center">
        <div className="game-big-emoji game-big-emoji--party" aria-hidden>
          🎉
        </div>
        <h1>Selamat!</h1>
        <StarsRow stars={starsForMistakes(0)} />
        <p style={{ fontSize: 22 }}>
          Kamu dapat <strong>{total}</strong> dari {levels.length * 3} bintang!
        </p>
        <MascotCard totalStars={getTotalStars()} />
        {picker ? (
          // Back to the titles: replaying the same level is one more tap from
          // there, and the child usually wants a different story anyway.
          <button
            className="btn btn--primary"
            style={{ fontSize: 24 }}
            onClick={() => {
              sfx('tap');
              setScreen('pick');
            }}
          >
            {picker.again ?? '🔁 Pilih Lagi'}
          </button>
        ) : (
          <button
            className="btn btn--primary"
            style={{ fontSize: 24 }}
            onClick={() => {
              setAttemptKey((k) => k + 1);
              handleStart(); // fresh variants, from level 1
            }}
          >
            🔁 Main Lagi
          </button>
        )}
        <button className="btn" onClick={onExit}>
          <BackIcon /> Kembali
        </button>
      </div>
    );
  }

  if (!level) return null;

  return (
    <div className="game-screen">
      <div className="game-topbar">
        <button className="btn" onClick={onExit} aria-label="Kembali">
          <BackIcon size={26} />
        </button>
        {/* A picked level plays alone: one lone dot says nothing, but the
            empty row keeps the back/🔊 buttons in their usual corners. */}
        {levels.length > 1 ? (
          <LevelDots total={levels.length} current={levelIndex} />
        ) : (
          <div className="level-dots" />
        )}
        <SpeakButton onSpeak={() => (repeat.current ? repeat.current() : speak(level.narration))} />
      </div>
      <Suspense fallback={<div className="game-center">⏳</div>}>
        <Template
          key={`${levelIndex}-${attemptKey}`}
          level={level}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          narrate={speak}
          setRepeat={setRepeat}
        />
      </Suspense>
      {feedback && <FeedbackOverlay kind={feedback} />}
    </div>
  );
}
