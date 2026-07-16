import { useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';
import { narrate } from '../audio/audioManager.js';

// Template "cerita interaktif": narrated pages, some with choices.
// level.pages: [{ text, audioSrc?, scene?, choices?: [{ text, correct, feedback? }] }]
export default function StoryChoice({ level, onCorrect, onWrong, onComplete }) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = level.pages[pageIndex];
  const isLast = pageIndex === level.pages.length - 1;

  function nextPage() {
    if (isLast) onComplete();
    else setPageIndex(pageIndex + 1);
  }

  function choose(choice) {
    if (choice.correct) {
      onCorrect();
      setTimeout(nextPage, 900);
    } else {
      onWrong();
      if (choice.feedback) narrate(choice.feedback);
    }
  }

  return (
    <div className="template">
      {page.scene && <div className="story-scene" aria-hidden="true">{page.scene}</div>}
      <PromptBar text={page.text} audioSrc={page.audioSrc} />

      {page.choices ? (
        <div className="story-choices">
          {page.choices.map((choice) => (
            <button
              key={choice.text}
              type="button"
              className="btn btn-primary story-choice"
              onClick={() => choose(choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="btn btn-primary" onClick={nextPage}>
          {isLast ? 'Tamat 🏁' : 'Lanjut ▶️'}
        </button>
      )}

      <p className="round-counter">Halaman {pageIndex + 1} / {level.pages.length}</p>
    </div>
  );
}
