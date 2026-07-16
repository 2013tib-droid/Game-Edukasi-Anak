import { useMemo, useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';
import { narrate } from '../audio/audioManager.js';
import { shuffle } from '../core/utils.js';

// Template "hitung & ketuk": tap exactly N of the target item.
// Owner's question-design rule (CLAUDE.md): the board always mixes the
// target with distractor items AND shows MORE targets than asked, so the
// child must both recognise the item and stop counting at N.
// level.rounds: [{ prompt, audioSrc?, target, need, targetTotal, distractors: {emoji: count} }]
export default function CountTap({ level, onCorrect, onWrong, onComplete }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [locked, setLocked] = useState(false);
  const round = level.rounds[roundIndex];

  const items = useMemo(() => {
    const list = [];
    for (let i = 0; i < round.targetTotal; i += 1) list.push(round.target);
    Object.entries(round.distractors ?? {}).forEach(([emoji, count]) => {
      for (let i = 0; i < count; i += 1) list.push(emoji);
    });
    return shuffle(list).map((emoji, i) => ({ id: i, emoji }));
  }, [round]);

  function tapItem(item) {
    if (locked) return;
    if (item.emoji !== round.target) {
      onWrong();
      return;
    }
    const next = new Set(selected);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    setSelected(next);
  }

  function submit() {
    if (locked) return;
    if (selected.size === round.need) {
      setLocked(true);
      onCorrect();
      setTimeout(() => {
        setLocked(false);
        setSelected(new Set());
        if (roundIndex + 1 < level.rounds.length) setRoundIndex(roundIndex + 1);
        else onComplete();
      }, 900);
    } else {
      onWrong();
      narrate(selected.size < round.need ? 'Masih kurang, hitung lagi ya!' : 'Kebanyakan, hitung lagi ya!');
    }
  }

  return (
    <div className="template">
      <PromptBar text={round.prompt} audioSrc={round.audioSrc} />
      <div className="count-board">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`count-item ${selected.has(item.id) ? 'count-item-selected' : ''}`}
            onClick={() => tapItem(item)}
          >
            {item.emoji}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={submit}>
        Sudah! ({selected.size})
      </button>
      <p className="round-counter">Soal {roundIndex + 1} / {level.rounds.length}</p>
    </div>
  );
}
