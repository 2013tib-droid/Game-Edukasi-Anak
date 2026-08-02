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
import { getTotalStars, saveLevelStars } from '@/engine/core/progress';
import { clearSession, getSession, saveSession } from '@/engine/core/session';
import type { LevelPick } from '@/engine/core/session';
import { sfx, speak, stopSpeaking } from '@/engine/audio/sound';
import { FeedbackOverlay, LevelDots, SpeakButton, StarsRow } from '@/engine/ui/Feedback';
import MascotCard from '@/engine/ui/Mascot';
import Clock from '@/engine/ui/Clock';
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

type Screen = 'intro' | 'playing' | 'done';

export default function GameShell({
  config,
  onExit,
  iconClock,
}: {
  config: AnyGameConfig;
  onExit: () => void;
  /**
   * Draw the intro screen's big icon as a real clock face instead of
   * `config.emoji`. Declared once in the game registry (`GameMeta.iconClock`)
   * and passed down by `GamePage`, so the portal card and this screen always
   * show the same icon.
   */
  iconClock?: ClockSpec;
}) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earned, setEarned] = useState<Stars[]>([]);
  const wrongCount = useRef(0);
  // Remount the template on retry/advance so its internal state resets.
  const [attemptKey, setAttemptKey] = useState(0);
  // Level list of the current play, re-rolled on each play/replay so variant
  // slots serve fresh questions.
  const [picks, setPicks] = useState<LevelPick[]>(() => rollPicks(config));
  // Interrupted play from a previous visit, if any — read once on mount so
  // the intro can offer "Lanjut Main" at the level the child stopped at.
  const [saved, setSaved] = useState(() => getSession(config));

  const levels = useMemo(() => levelsFromPicks(config, picks), [config, picks]);
  const level = levels[levelIndex];
  const Template = TEMPLATES[templateFor(config, level)] as ComponentType<TemplateProps>;

  useEffect(() => () => stopSpeaking(), []);

  // Narrate the instruction whenever a new level is shown (covers first
  // level, advancing, and freshly re-rolled variants after a replay).
  useEffect(() => {
    if (screen !== 'playing') return;
    wrongCount.current = 0;
    const lv = levels[levelIndex];
    if (lv) speak(lv.narration);
  }, [screen, levelIndex, levels]);

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
    speak('Hebat! Kamu benar!');
    setFeedback('correct');
    window.setTimeout(() => {
      setFeedback(null);
      const next = levelIndex + 1;
      if (next >= levels.length) {
        // Finished: nothing left to resume.
        clearSession(config.id);
        setSaved(null);
        sfx('win');
        speak('Selamat! Kamu hebat sekali!');
        setScreen('done');
      } else {
        // Remember where we are, so leaving now resumes here next time.
        saveSession(config.id, { picks, index: next, earned: earnedNow });
        setLevelIndex(next);
        setAttemptKey((k) => k + 1);
        // narration handled by the level-change effect
      }
    }, 1400);
  }, [config, earned, level, levelIndex, levels, picks]);

  const handleWrong = useCallback((silent?: boolean) => {
    wrongCount.current += 1;
    if (silent) return;
    sfx('wrong');
    speak('Coba lagi, kamu pasti bisa!');
    setFeedback('wrong');
    window.setTimeout(() => setFeedback(null), 1300);
  }, []);

  if (screen === 'intro') {
    return (
      <div className="game-center">
        {iconClock ? (
          <Clock time={iconClock} className="game-big-clock" />
        ) : (
          <div className="game-big-emoji" aria-hidden>
            {config.emoji}
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
          ⬅️ Kembali
        </button>
      </div>
    );
  }

  if (screen === 'done') {
    const total = earned.reduce<number>((s, x) => s + x, 0);
    return (
      <div className="game-center">
        <div className="game-big-emoji" aria-hidden>
          🎉
        </div>
        <h1>Selamat!</h1>
        <StarsRow stars={starsForMistakes(0)} />
        <p style={{ fontSize: 22 }}>
          Kamu dapat <strong>{total}</strong> dari {levels.length * 3} bintang!
        </p>
        <MascotCard totalStars={getTotalStars()} />
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
        <button className="btn" onClick={onExit}>
          ⬅️ Kembali
        </button>
      </div>
    );
  }

  if (!level) return null;

  return (
    <div className="game-screen">
      <div className="game-topbar">
        <button className="btn" onClick={onExit} aria-label="Kembali">
          ⬅️
        </button>
        <LevelDots total={levels.length} current={levelIndex} />
        <SpeakButton onSpeak={() => speak(level.narration)} />
      </div>
      <Suspense fallback={<div className="game-center">⏳</div>}>
        <Template
          key={`${levelIndex}-${attemptKey}`}
          level={level}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          narrate={speak}
        />
      </Suspense>
      {feedback && <FeedbackOverlay kind={feedback} />}
    </div>
  );
}
