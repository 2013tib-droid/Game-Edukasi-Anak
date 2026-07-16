import { useEffect } from 'react';
import { narrate } from '../audio/audioManager.js';

// Shows the instruction text with a big replay-audio button. Kids who can't
// read yet tap 🔊 to hear the instruction again. `speak` overrides the
// narrated text when it should differ from the on-screen text.
export default function PromptBar({ text, speak, audioSrc }) {
  const spoken = speak ?? text;

  useEffect(() => {
    narrate(spoken, { src: audioSrc });
  }, [spoken, audioSrc]);

  return (
    <div className="prompt-bar">
      <button
        type="button"
        className="prompt-audio-btn"
        aria-label="Dengarkan instruksi"
        onClick={() => narrate(spoken, { src: audioSrc })}
      >
        🔊
      </button>
      <p className="prompt-text">{text}</p>
    </div>
  );
}
