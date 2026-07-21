import { useEffect, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';

/**
 * Interactive story: narrated pages, some with a decision. Wrong choices get
 * gentle feedback and another try; the story always moves forward on the
 * right choice (no fail states — positive feedback only).
 */
export default function StoryChoice({
  level,
  onCorrect,
  onWrong,
  narrate,
}: TemplateProps<'story-choice'>) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = level.data.pages[pageIndex];

  // Narrate each page as it appears (level narration itself covers page 0).
  useEffect(() => {
    if (pageIndex > 0 && page) narrate(page.text);
  }, [pageIndex, page, narrate]);

  if (!page) return null;

  function advance() {
    sfx('tap');
    if (pageIndex + 1 >= level.data.pages.length) onCorrect();
    else setPageIndex(pageIndex + 1);
  }

  function choose(correct: boolean | undefined, feedback: string | undefined) {
    if (correct) {
      sfx('correct');
      advance();
    } else {
      if (feedback) narrate(feedback);
      onWrong();
    }
  }

  return (
    <>
      <div className="game-area">
        {page.emoji && (
          <div className="story-emoji" aria-hidden>
            {page.emoji}
          </div>
        )}
        <p className="story-text">{page.text}</p>
        {page.choices ? (
          <div className="story-choices">
            {page.choices.map((c, i) => (
              <button
                key={i}
                type="button"
                className="btn"
                style={{ fontSize: 20 }}
                onClick={() => choose(c.correct, c.feedback)}
              >
                {c.text}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            style={{ alignSelf: 'center', fontSize: 22 }}
            onClick={advance}
          >
            ➡️ Lanjut
          </button>
        )}
      </div>
    </>
  );
}
