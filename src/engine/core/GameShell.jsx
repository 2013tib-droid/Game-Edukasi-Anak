import { Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../templates/index.js';
import { narrate, playSfx, stopNarration } from '../audio/audioManager.js';
import { starsForMistakes } from './utils.js';
import { loadProgress, saveLevelStars, totalStars } from './progress.js';
import { mascotFor } from './mascot.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import FeedbackFlash from '../ui/FeedbackFlash.jsx';
import '../ui/engine.css';

// Orchestrates one game: level map -> intro -> template play -> star popup.
// Levels unlock in order (finish one to open the next). A level definition
// may include generate() returning fresh content (rounds/pairs/items/...)
// so questions can be randomized on every play.
export default function GameShell({ game, config, backTo }) {
  const { user } = useAuth();
  const levels = config.levels;

  const [phase, setPhase] = useState('map'); // map | intro | play | levelDone | gameDone
  const [levelIndex, setLevelIndex] = useState(0);
  const [resolved, setResolved] = useState(null); // level def + generated content
  const [earnedStars, setEarnedStars] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(() => loadProgress(game.id));

  const mistakesRef = useRef(0);
  const feedbackTimer = useRef(null);

  useEffect(() => () => {
    stopNarration();
    clearTimeout(feedbackTimer.current);
  }, []);

  const gameStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);

  function isUnlocked(index) {
    return index === 0 || (progress.stars[levels[index - 1].id] ?? 0) > 0;
  }

  function flash(kind) {
    clearTimeout(feedbackTimer.current);
    setFeedback(kind);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1200);
  }

  function openLevel(index) {
    playSfx('tap');
    const def = levels[index];
    setLevelIndex(index);
    setResolved(def.generate ? { ...def, ...def.generate() } : def);
    setPhase('intro');
  }

  function startPlay() {
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
    setProgress(saveLevelStars(game.id, levels[levelIndex].id, stars, user));
    playSfx('win');
    narrate('Hore! Kamu berhasil!');
    setPhase('levelDone');
  }

  function afterLevel() {
    if (levelIndex + 1 < levels.length) openLevel(levelIndex + 1);
    else {
      narrate('Selamat! Semua level selesai. Kamu hebat!');
      setPhase('gameDone');
    }
  }

  function toMap() {
    playSfx('tap');
    stopNarration();
    setProgress(loadProgress(game.id));
    setPhase('map');
  }

  const level = resolved;
  const Template = level ? TEMPLATES[level.template ?? game.template] : null;
  const mascot = mascotFor(totalStars());

  return (
    <div className="game-shell">
      <header className="game-shell-header">
        {phase === 'map' ? (
          <Link to={backTo} className="btn-icon" aria-label="Kembali" onClick={stopNarration}>←</Link>
        ) : (
          <button type="button" className="btn-icon" aria-label="Ke daftar level" onClick={toMap}>←</button>
        )}
        <ProgressBar
          value={phase === 'map' ? levels.filter((l) => progress.stars[l.id]).length : levelIndex + (phase === 'levelDone' || phase === 'gameDone' ? 1 : 0)}
          max={levels.length}
        />
        <span className="game-shell-stars" aria-label="Bintang game ini">⭐ {gameStars}</span>
      </header>

      {phase === 'map' && (
        <div className="level-map">
          <h1 className="overlay-title">
            <span aria-hidden="true">{game.emoji}</span> {game.title}
          </h1>
          {levels.map((def, index) => {
            const stars = progress.stars[def.id] ?? 0;
            const unlocked = isUnlocked(index);
            return (
              <button
                key={def.id}
                type="button"
                className="level-btn"
                disabled={!unlocked}
                onClick={() => openLevel(index)}
              >
                <span className="level-btn-icon" aria-hidden="true">
                  {stars > 0 ? '⭐' : unlocked ? '🎯' : '🔒'}
                </span>
                <span className="level-btn-text">
                  <span className="level-btn-title">{def.title}</span>
                  <span className="level-btn-sub">
                    {stars > 0
                      ? `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} — main lagi yuk!`
                      : unlocked ? 'Ayo main!' : 'Selesaikan level sebelumnya dulu'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {phase === 'intro' && level && (
        <div className="game-overlay">
          <h1 className="overlay-title">{level.title}</h1>
          <p className="overlay-sub">
            Level {levelIndex + 1} dari {levels.length}
            {progress.stars[level.id] ? ` · rekor ${'⭐'.repeat(progress.stars[level.id])}` : ''}
          </p>
          <button type="button" className="btn btn-primary btn-huge" onClick={startPlay}>
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
          <p className="overlay-sub">Template "{level?.template}" belum tersedia.</p>
          <button type="button" className="btn btn-primary" onClick={toMap}>Kembali</button>
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
          <button type="button" className="btn btn-primary btn-huge" onClick={afterLevel}>
            {levelIndex + 1 < levels.length ? 'Level Berikutnya ▶️' : 'Selesai 🏁'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={toMap}>Pilih Level</button>
        </div>
      )}

      {phase === 'gameDone' && (
        <div className="game-overlay">
          <div className="mascot-big" aria-hidden="true">{mascot.emoji}</div>
          <h1 className="overlay-title">🏆 Semua level selesai!</h1>
          <p className="overlay-sub">
            {mascot.name} bangga padamu! Kamu punya ⭐ {totalStars()} bintang.
            {mascot.next ? ` ${mascot.next.min - totalStars()} lagi untuk jadi ${mascot.next.emoji}!` : ' Level maskot tertinggi! 🏆'}
          </p>
          <button type="button" className="btn btn-primary btn-huge" onClick={toMap}>
            🔁 Pilih Level
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
