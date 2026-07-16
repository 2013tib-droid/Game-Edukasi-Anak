import { Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../templates/index.js';
import { narrate, playSfx, stopNarration } from '../audio/audioManager.js';
import { starsForMistakes } from './utils.js';
import { loadProgress, saveLevelStars } from './progress.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import FeedbackFlash from '../ui/FeedbackFlash.jsx';
import '../ui/engine.css';

// Orchestrates one game: level intro -> template play -> star popup -> next.
// Templates only report onCorrect/onWrong/onComplete; scoring, narration of
// transitions, progress saving and navigation all live here.
export default function GameShell({ game, config, backTo }) {
  const { user } = useAuth();
  const levels = config.levels;

  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | play | levelDone | gameDone
  const [earnedStars, setEarnedStars] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(() => loadProgress(game.id));

  const mistakesRef = useRef(0);
  const feedbackTimer = useRef(null);
  const level = levels[levelIndex];

  useEffect(() => () => {
    stopNarration();
    clearTimeout(feedbackTimer.current);
  }, []);

  function flash(kind) {
    clearTimeout(feedbackTimer.current);
    setFeedback(kind);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1200);
  }

  function startLevel() {
    // The start tap doubles as the user gesture that unlocks audio autoplay.
    mistakesRef.current = 0;
    playSfx('tap');
    setPhase('play');
  }

  function handleCorrect() {
    playSfx('correct');
    flash('correct');
  }

  function handleWrong() {
    mistakesRef.current += 1;
    playSfx('wrong');
    flash('wrong');
    narrate('Coba lagi, kamu pasti bisa!');
  }

  function handleLevelComplete() {
    const stars = starsForMistakes(mistakesRef.current);
    setEarnedStars(stars);
    setProgress(saveLevelStars(game.id, level.id, stars, user));
    playSfx('win');
    narrate('Hore! Kamu berhasil!');
    setPhase('levelDone');
  }

  function nextLevel() {
    playSfx('tap');
    if (levelIndex + 1 < levels.length) {
      setLevelIndex(levelIndex + 1);
      setPhase('intro');
    } else {
      narrate('Selamat! Semua level selesai. Kamu hebat!');
      setPhase('gameDone');
    }
  }

  function replayGame() {
    playSfx('tap');
    setLevelIndex(0);
    setPhase('intro');
  }

  const Template = TEMPLATES[level.template ?? game.template];

  return (
    <div className="game-shell">
      <header className="game-shell-header">
        <Link to={backTo} className="btn-icon" aria-label="Kembali" onClick={stopNarration}>
          ←
        </Link>
        <ProgressBar value={levelIndex + (phase === 'levelDone' || phase === 'gameDone' ? 1 : 0)} max={levels.length} />
        <span className="game-shell-stars" aria-label="Total bintang">
          ⭐ {Object.values(progress.stars).reduce((a, b) => a + b, 0)}
        </span>
      </header>

      {phase === 'intro' && (
        <div className="game-overlay">
          <h1 className="overlay-title">{level.title}</h1>
          <p className="overlay-sub">
            Level {levelIndex + 1} dari {levels.length}
            {progress.stars[level.id] ? ` · rekor ${'⭐'.repeat(progress.stars[level.id])}` : ''}
          </p>
          <button type="button" className="btn btn-primary btn-huge" onClick={startLevel}>
            ▶️ Mulai
          </button>
        </div>
      )}

      {phase === 'play' && Template && (
        <Suspense fallback={<div className="game-overlay"><p className="overlay-sub">Memuat… ⏳</p></div>}>
          <Template
            key={`${level.id}-${levelIndex}`}
            level={level}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onComplete={handleLevelComplete}
          />
        </Suspense>
      )}

      {phase === 'play' && !Template && (
        <div className="game-overlay">
          <p className="overlay-sub">Template "{level.template}" belum tersedia.</p>
          <Link to={backTo} className="btn btn-primary">Kembali</Link>
        </div>
      )}

      {phase === 'levelDone' && (
        <div className="game-overlay">
          <div className="star-row" aria-label={`${earnedStars} bintang`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={`star ${n <= earnedStars ? 'star-on' : 'star-off'}`}>★</span>
            ))}
          </div>
          <h1 className="overlay-title">Hore, berhasil! 🎉</h1>
          <button type="button" className="btn btn-primary btn-huge" onClick={nextLevel}>
            {levelIndex + 1 < levels.length ? 'Level Berikutnya ▶️' : 'Selesai 🏁'}
          </button>
        </div>
      )}

      {phase === 'gameDone' && (
        <div className="game-overlay">
          <h1 className="overlay-title">🏆 Semua level selesai!</h1>
          <p className="overlay-sub">
            Kamu mengumpulkan ⭐ {Object.values(progress.stars).reduce((a, b) => a + b, 0)} bintang. Hebat sekali!
          </p>
          <button type="button" className="btn btn-primary btn-huge" onClick={replayGame}>
            🔁 Main Lagi
          </button>
          <Link to={backTo} className="btn btn-ghost" onClick={stopNarration}>
            Pilih Game Lain
          </Link>
        </div>
      )}

      <FeedbackFlash kind={feedback} />
    </div>
  );
}
