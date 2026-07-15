import { useState, type ReactNode } from 'react';

// Simple multiplication gate: young kids can't multiply yet, so this keeps
// the parent area (account, purchase) out of the child flow.
function makeChallenge() {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  return { a, b, answer: a * b };
}

export default function ParentGate({ children }: { children: ReactNode }) {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [input, setInput] = useState('');
  const [passed, setPassed] = useState(false);
  const [wrong, setWrong] = useState(false);

  if (passed) return <>{children}</>;

  const pressDigit = (d: string) => {
    setWrong(false);
    setInput((prev) => (prev.length >= 3 ? prev : prev + d));
  };

  const submit = () => {
    if (Number(input) === challenge.answer) {
      setPassed(true);
    } else {
      setWrong(true);
      setInput('');
      setChallenge(makeChallenge());
    }
  };

  return (
    <div className="card">
      <h2>🔐 Khusus Orang Tua</h2>
      <p>
        Untuk masuk, jawab dulu: <strong>{challenge.a} × {challenge.b} = ?</strong>
      </p>
      <input value={input} readOnly aria-label="Jawaban" placeholder="Jawabanmu" />
      {wrong && <p className="error">Belum tepat, coba lagi ya.</p>}
      <div className="gate-keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="btn secondary" onClick={() => pressDigit(d)}>
            {d}
          </button>
        ))}
        <button className="btn secondary" onClick={() => setInput('')}>
          ✖️
        </button>
        <button className="btn secondary" onClick={() => pressDigit('0')}>
          0
        </button>
        <button className="btn" onClick={submit} disabled={input.length === 0}>
          ✔️
        </button>
      </div>
    </div>
  );
}
