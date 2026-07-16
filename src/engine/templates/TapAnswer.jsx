import { useMemo, useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';
import { shuffle } from '../core/utils.js';

// Template "tap-jawab": pick the correct answer out of 2-4 big options.
// level.rounds: [{ prompt, audioSrc?, options: [{ label, correct? }] }]
export default function TapAnswer({ level, onCorrect, onWrong, onComplete }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const round = level.rounds[roundIndex];

  const options = useMemo(() => shuffle(round.options), [round]);

  function choose(option) {
    if (locked) return;
    if (option.correct) {
      setLocked(true);
      onCorrect();
      setTimeout(() => {
        setLocked(false);
        if (roundIndex + 1 < level.rounds.length) setRoundIndex(roundIndex + 1);
        else onComplete();
      }, 900);
    } else {
      onWrong();
    }
  }

  return (
    <div className="template">
      <PromptBar text={round.prompt} audioSrc={round.audioSrc} />
      <div className={`option-grid option-grid-${options.length}`}>
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            className="option-card"
            onClick={() => choose(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="round-counter">Soal {roundIndex + 1} / {level.rounds.length}</p>
    </div>
  );
}
