import { useMemo, useState } from 'react';

// Simple math challenge separating the kids' area from the parents' area.
// Passing is remembered for the current browser session only.
const GATE_KEY = 'parentGatePassed';

function makeChallenge() {
  const a = 3 + Math.floor(Math.random() * 7); // 3-9
  const b = 3 + Math.floor(Math.random() * 7);
  return { question: `${a} × ${b}`, answer: a * b };
}

export default function ParentGate({ children }) {
  const [passed, setPassed] = useState(() => sessionStorage.getItem(GATE_KEY) === '1');
  const [challenge, setChallenge] = useState(makeChallenge);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const inputId = useMemo(() => `gate-${Math.random().toString(36).slice(2, 8)}`, []);

  if (passed) return children;

  function submit(e) {
    e.preventDefault();
    if (Number(input) === challenge.answer) {
      sessionStorage.setItem(GATE_KEY, '1');
      setPassed(true);
    } else {
      setWrong(true);
      setInput('');
      setChallenge(makeChallenge());
    }
  }

  return (
    <section className="page gate-page">
      <h1 className="page-title">👨‍👩‍👧 Khusus Orang Tua</h1>
      <p className="page-text">Untuk masuk, jawab soal berikut:</p>
      <form onSubmit={submit} className="gate-form">
        <label className="gate-question" htmlFor={inputId}>
          Berapa {challenge.question}?
        </label>
        <input
          id={inputId}
          className="input gate-input"
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        {wrong && <p className="form-error">Jawaban belum tepat, coba lagi.</p>}
        <button type="submit" className="btn btn-primary">Masuk</button>
      </form>
    </section>
  );
}
