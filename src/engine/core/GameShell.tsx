import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { AnyGameConfig, GameLevel, MixedLevel, Stars, TemplateId } from '@/engine/core/types';
import { getTotalStars, saveLevelStars } from '@/engine/core/progress';
import { sfx, speak, stopSpeaking } from '@/engine/audio/sound';
import { FeedbackOverlay, LevelDots, SpeakButton, StarsRow } from '@/engine/ui/Feedback';
import MascotCard from '@/engine/ui/Mascot';
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
 * Turn the config's slots into a concrete level list for one playthrough:
 * a slot that is an array of variants collapses to one randomly-chosen
 * variant. When the game sets `sessionLevels`, only that many slots are
 * drawn (no repeats, random order) — a big pool, a short session.
 * Re-run per play (and on "Main Lagi") so questions vary.
 */
function resolveSlots(config: AnyGameConfig): ConcreteLevel[] {
  let slots = config.levels as Array<ConcreteLevel | ConcreteLevel[]>;
  const take = config.sessionLevels;
  if (take && take > 0 && take < slots.length) slots = shuffled(slots).slice(0, take);
  return slots.map((slot) =>
    Array.isArray(slot) ? slot[Math.floor(Math.random() * slot.length)]! : slot,
  );
}

type Screen = 'intro' | 'playing' | 'done';

export default function GameShell({
  config,
  onExit,
}: {
  config: AnyGameConfig;
  onExit: () => void;
}) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earned, setEarned] = useState<Stars[]>([]);
  const wrongCount = useRef(0);
  // Remount the template on retry/advance so its internal state resets.
  const [attemptKey, setAttemptKey] = useState(0);
  // Bumped on each play/replay so variant slots re-roll fresh questions.
  const [playNonce, setPlayNonce] = useState(0);

  const levels = useMemo(() => resolveSlots(config), [config, playNonce]);
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

  function handleStart() {
    sfx('tap');
    setPlayNonce((n) => n + 1); // re-roll variants for this play
    setLevelIndex(0);
    setScreen('playing');
  }

  const handleCorrect = useCallback(() => {
    if (!level) return;
    const stars = starsForMistakes(wrongCount.current);
    saveLevelStars(config.id, level.id, stars);
    setEarned((prev) => [...prev, stars]);
    sfx('correct');
    speak('Hebat! Kamu benar!');
    setFeedback('correct');
    window.setTimeout(() => {
      setFeedback(null);
      const next = levelIndex + 1;
      if (next >= levels.length) {
        sfx('win');
        speak('Selamat! Kamu hebat sekali!');
        setScreen('done');
      } else {
        setLevelIndex(next);
        setAttemptKey((k) => k + 1);
        // narration handled by the level-change effect
      }
    }, 1400);
  }, [config, level, levelIndex, levels]);

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
        <div className="game-big-emoji" aria-hidden>
          {config.emoji}
        </div>
        <h1>{config.title}</h1>
        <button className="btn btn--primary" style={{ fontSize: 26 }} onClick={handleStart}>
          ▶️ Mulai Main
        </button>
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
            setEarned([]);
            setAttemptKey((k) => k + 1);
            setPlayNonce((n) => n + 1); // fresh variants on replay
            setLevelIndex(0);
            setScreen('playing');
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
