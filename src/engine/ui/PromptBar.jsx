import { useEffect } from 'react';
import { narrate } from '../audio/audioManager.js';

// Shows the instruction text with a big replay-audio button. Kids who can't
// read yet tap 🔊 to hear the instruction again.
export default function PromptBar({ text, audioSrc }) {
  useEffect(() => {
    narrate(text, { src: audioSrc });
  }, [text, audioSrc]);

  return (
    <div className="prompt-bar">
      <button
        type="button"
        className="prompt-audio-btn"
        aria-label="Dengarkan instruksi"
        onClick={() => narrate(text, { src: audioSrc })}
      >
        🔊
      </button>
      <p className="prompt-text">{text}</p>
    </div>
  );
}
