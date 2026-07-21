import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { GameConfig, GameLevel, Stars, TemplateId } from '@/engine/core/types';
import { saveLevelStars } from '@/engine/core/progress';
import { sfx, speak, stopSpeaking } from '@/engine/audio/sound';
import { FeedbackOverlay, LevelDots, SpeakButton, StarsRow } from '@/engine/ui/Feedback';
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
};

function starsForMistakes(wrong: number): Stars {
  if (wrong === 0) return 3;
  if (wrong <= 2) return 2;
  return 1;
}

type Screen = 'intro' | 'playing' | 'done';

export default function GameShell({
  config,
  onExit,
}: {
  config: GameConfig;
  onExit: () => void;
}) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earned, setEarned] = useState<Stars[]>([]);
  const wrongCount = useRef(0);
  // Remount the template on retry/advance so its internal state resets.
  const [attemptKey, setAttemptKey] = useState(0);

  const level = config.levels[levelIndex];
  const Template = TEMPLATES[config.template] as ComponentType<TemplateProps>;

  useEffect(() => () => stopSpeaking(), []);

  const startLevel = useCallback((text: string) => {
    wrongCount.current = 0;
    speak(text);
  }, []);

  function handleStart() {
    sfx('tap');
    setScreen('playing');
    if (level) startLevel(level.narration);
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
      if (next >= config.levels.length) {
        sfx('win');
        speak('Selamat! Kamu hebat sekali!');
        setScreen('done');
      } else {
        setLevelIndex(next);
        setAttemptKey((k) => k + 1);
        const nextLevel = config.levels[next];
        if (nextLevel) startLevel(nextLevel.narration);
      }
    }, 1400);
  }, [config, level, levelIndex, startLevel]);

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
          Kamu dapat <strong>{total}</strong> dari {config.levels.length * 3} bintang!
        </p>
        <button
          className="btn btn--primary"
          style={{ fontSize: 24 }}
          onClick={() => {
            setLevelIndex(0);
            setEarned([]);
            setAttemptKey((k) => k + 1);
            setScreen('playing');
            const first = config.levels[0];
            if (first) startLevel(first.narration);
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
        <LevelDots total={config.levels.length} current={levelIndex} />
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
