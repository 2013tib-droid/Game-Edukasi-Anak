import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx, speakNext } from '@/engine/audio/sound';

/**
 * Interactive story: narrated pages, some with a decision. Wrong choices get
 * gentle feedback and another try; the story always moves forward on the
 * right choice (no fail states — positive feedback only).
 *
 * Reading is NOT assumed: every option is labelled A/B/C, read aloud
 * automatically after the page text, and can be replayed one by one with the
 * 🔊 button on the option itself (SD kelas 1–2 masih belum lancar membaca).
 */

/** Option labels — spoken and printed, so "pilih B" is unambiguous. */
const LETTERS = ['A', 'B', 'C', 'D'];

export default function StoryChoice({
  level,
  onCorrect,
  onWrong,
  narrate,
}: TemplateProps<'story-choice'>) {
  const [pageIndex, setPageIndex] = useState(0);
  const raw = level.data.pages[pageIndex];
  // Configs list the good choice first (`ask()` in the game configs), so
  // without shuffling the answer would always be A — and now that the letters
  // are on screen a child could win by always tapping A without listening.
  const page = useMemo(() => {
    if (!raw?.choices) return raw;
    const choices = [...raw.choices];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j]!, choices[i]!];
    }
    return { ...raw, choices };
  }, [raw]);
  // Guards against narrating the same page twice (StrictMode runs effects
  // twice in dev, and queued lines would stack up instead of cancelling).
  const narratedPage = useRef(-1);

  /** "Pilihan A. Labu yang paling kecil." — one queued line per option. */
  function optionLines(choices: { text: string }[]): string[] {
    return choices.map((c, i) => `Pilihan ${LETTERS[i] ?? i + 1}. ${c.text}`);
  }

  // Narrate each page as it appears. Page 0's own text is queued behind the
  // level narration (the story title, spoken by GameShell); later pages cancel
  // it and speak on their own. Options always follow the page text.
  useEffect(() => {
    if (!page || narratedPage.current === pageIndex) return;
    narratedPage.current = pageIndex;
    if (pageIndex === 0) speakNext(page.text);
    else narrate(page.text);
    if (page.choices) speakNext(...optionLines(page.choices));
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
      if (feedback) {
        narrate(feedback);
        // Read the options again so the child can retry by ear, not by memory.
        if (page?.choices) speakNext(...optionLines(page.choices));
      }
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
            {page.choices.map((c, i) => {
              const letter = LETTERS[i] ?? String(i + 1);
              return (
                <button
                  key={i}
                  type="button"
                  className="btn story-choice"
                  onClick={() => choose(c.correct, c.feedback)}
                >
                  <span className="story-choice__letter" aria-hidden>
                    {letter}
                  </span>
                  <span className="story-choice__text">{c.text}</span>
                  <span
                    className="story-choice__speak"
                    role="button"
                    tabIndex={0}
                    aria-label={`Dengarkan pilihan ${letter}`}
                    onClick={(e) => {
                      // Listening must not count as choosing.
                      e.stopPropagation();
                      sfx('tap');
                      narrate(`Pilihan ${letter}. ${c.text}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      e.stopPropagation();
                      e.preventDefault();
                      narrate(`Pilihan ${letter}. ${c.text}`);
                    }}
                  >
                    🔊
                  </span>
                </button>
              );
            })}
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
