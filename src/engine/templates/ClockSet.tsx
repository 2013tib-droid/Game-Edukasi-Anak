import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { DayTime } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import Clock from '@/engine/ui/Clock';
import Scene from '@/engine/ui/Scene';
import { sparkleAt } from '@/engine/ui/juice';
import '@/engine/ui/clock-set.css';

/**
 * Template `clock-set` (Waktu Tepat, versi premium — docs/rencana-game-sd-
 * kelas-3-4.md 2b.3 no. 4): anak MEMUTAR jarum panjang dengan jari, jarum
 * pendek ikut bergerak sendiri seperti jam sungguhan (60 menit = 1 jam).
 *
 * Aturan main:
 * - Jarum panjang mendatangi jari: sentuhan di mana pun di muka jam memutar
 *   jarum ke arah jari, memilih posisi yang paling dekat dengan posisi
 *   sekarang (jadi menyentuh tak pernah melompatkan jam satu jam penuh).
 *   Sesudah itu gerakan jari diikuti terus-menerus, berputar berkali-kali
 *   kalau perlu — dua putaran = dua jam.
 * - Selama diputar, jarum mengikuti per menit; saat jari dilepas ia menempel ke
 *   kelipatan lima menit terdekat. Klik lembut tiap lewat lima menit.
 * - Anak menekan "Cocok!" sendiri. Menilai otomatis saat jari dilepas akan
 *   menghukum anak yang sedang mencoba-coba di tengah jalan.
 * - Langkah bertingkat (`steps`) bersambung: langkah berikutnya mulai dari
 *   posisi jam langkah sebelumnya, busur waktunya mulai dari situ juga.
 *
 * Gerakan jarum memakai state React, tapi hanya berubah per MENIT (paling
 * banyak 60 render per putaran, dan muka jamnya cuma ±40 elemen SVG) — bukan
 * tiap event pointer. Itu yang membuat PathTrace dulu tersendat.
 */

const DAY = 24 * 60;
/** Batas putaran supaya angka tidak tumbuh tanpa batas: sehari ke tiap arah. */
const LIMIT = DAY;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const minutesOf = (t: DayTime) => t.h * 60 + t.m;

/** Sudut jari dari pusat jam, dalam "menit jarum panjang" 0–60 (12 = 0). */
function dialMinute(cx: number, cy: number, x: number, y: number): number | null {
  const dx = x - cx;
  const dy = y - cy;
  if (Math.hypot(dx, dy) < 14) return null; // terlalu dekat poros: arahnya liar
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return mod(deg, 360) / 6;
}

/** Selisih dua posisi jarum, dinormalkan ke (-30, 30]. */
function wrap(d: number): number {
  const w = mod(d + 30, 60) - 30;
  return w === -30 ? 30 : w;
}

/** Fisher-Yates pada salinan — urutan pilihan jawaban diacak sekali per level. */
function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export default function ClockSet({
  level,
  onCorrect,
  onWrong,
  narrate,
  setRepeat,
}: TemplateProps<'clock-set'>) {
  const data = level.data;
  const from = minutesOf(data.from);

  /** Menit yang sudah diputar sejak `from` (bulat). */
  const [delta, setDelta] = useState(0);
  const deltaF = useRef(0);
  const deltaShown = useRef(0);
  const lastDial = useRef<number | null>(null);
  const dragging = useRef<number | null>(null);
  const [step, setStep] = useState(0);
  /** Posisi `delta` saat langkah sekarang dimulai — pangkal busur waktu. */
  const [stepStart, setStepStart] = useState(0);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const asking = step >= data.steps.length;
  const current = data.steps[step];
  const choices = useMemo(() => shuffled(data.ask?.choices ?? []), [data.ask]);

  // Kalimat yang sedang berlaku (atas layar + tombol 🔊).
  // `steps: []` = jamnya cuma dibaca: pertanyaannya ya narasi level itu sendiri.
  const prompt = asking
    ? data.steps.length > 0
      ? (data.ask?.prompt ?? level.narration)
      : level.narration
    : step === 0
      ? level.narration
      : (current?.say ?? level.narration);

  useEffect(() => {
    setRepeat(() => narrate(prompt));
    return () => setRepeat(null);
  }, [prompt, narrate, setRepeat]);

  const now = from + delta;
  const shown = mod(now, DAY);
  const h24 = Math.floor(shown / 60);
  const clock = { h: h24 % 12 === 0 ? 12 : h24 % 12, m: shown % 60 };

  function setFromFloat(f: number) {
    const clamped = Math.max(-LIMIT, Math.min(LIMIT, f));
    deltaF.current = clamped;
    const r = Math.round(clamped);
    const prev = deltaShown.current;
    if (r === prev) return;
    // Bunyi di luar updater state: StrictMode menjalankan updater dua kali.
    if (Math.floor(r / 5) !== Math.floor(prev / 5)) sfx('tick');
    deltaShown.current = r;
    setDelta(r);
  }

  function centre(): { cx: number; cy: number } | null {
    const svg = wrapRef.current?.querySelector('svg');
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    if (asking || solved || dragging.current !== null) return;
    const c = centre();
    if (!c) return;
    const dial = dialMinute(c.cx, c.cy, e.clientX, e.clientY);
    dragging.current = e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    lastDial.current = dial;
    if (dial === null) return;
    // Jarum mendatangi jari, lewat jalan terpendek dari posisinya sekarang.
    const hand = mod(from + deltaF.current, 60);
    setFromFloat(deltaF.current + wrap(dial - hand));
  }

  function move(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragging.current !== e.pointerId) return;
    const c = centre();
    if (!c) return;
    const dial = dialMinute(c.cx, c.cy, e.clientX, e.clientY);
    if (dial === null) return;
    if (lastDial.current === null) {
      lastDial.current = dial;
      return;
    }
    const d = wrap(dial - lastDial.current);
    lastDial.current = dial;
    setFromFloat(deltaF.current + d);
  }

  function up(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragging.current !== e.pointerId) return;
    dragging.current = null;
    lastDial.current = null;
    // Menempel ke kelipatan lima menit terdekat.
    setFromFloat(Math.round(deltaF.current / 5) * 5);
  }

  function check() {
    if (asking || solved || !current) return;
    if (mod(now, DAY) !== mod(minutesOf(current.to), DAY)) {
      sfx('tap');
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      onWrong();
      return;
    }
    const next = step + 1;
    if (next >= data.steps.length && !data.ask) {
      setSolved(true);
      onCorrect();
      return;
    }
    // Satu langkah dari beberapa: rayakan kecil di jamnya, lalu lanjut.
    sfx('correct');
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
    setStep(next);
    // Pangkal busur pindah hanya kalau masih ada jarum yang harus diputar;
    // pertanyaan penutup justru menanyakan busur langkah terakhir.
    if (next < data.steps.length) setStepStart(delta);
    if (next < data.steps.length) narrate(data.steps[next]!.say ?? level.narration);
    else if (data.ask) narrate(data.ask.prompt);
  }

  function answer(correct: boolean | undefined) {
    if (solved) return;
    if (correct) {
      setSolved(true);
      onCorrect();
    } else {
      sfx('tap');
      onWrong();
    }
  }

  // Busur langkah terakhir tetap terlihat saat pertanyaan "berapa lama?"
  // muncul — justru itu yang sedang ditanyakan.
  const arcStep = asking ? data.steps[data.steps.length - 1] : current;
  const keptArc = arcStep?.arc ? { from: from + stepStart, to: now } : undefined;

  return (
    <div className={'cs-wrap' + (!asking && current?.show ? ' cs-wrap--digital' : '')}>
      {data.scene && <Scene id={data.scene} />}
      <div className="game-prompt cs-prompt">{prompt}</div>
      <div className="game-area cs-area">
        {!asking && current?.show && (
          <div className="cs-digital" aria-label={`Pukul ${current.show}`}>
            {current.show}
          </div>
        )}
        <div
          ref={wrapRef}
          className={
            'cs-dial' +
            (asking ? ' cs-dial--still' : '') +
            (shake ? ' cs-dial--shake' : '') +
            (data.ring24 ? ' cs-dial--24' : '')
          }
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="slider"
          aria-label="Jam. Putar jarum panjang dengan jarimu."
          aria-valuenow={shown}
          aria-valuemin={0}
          aria-valuemax={DAY - 1}
          aria-valuetext={`${String(h24).padStart(2, '0')}.${String(clock.m).padStart(2, '0')}`}
        >
          <Clock time={clock} className="cs-clock" ring24={data.ring24} arc={keptArc} />
        </div>
        <div className="cs-controls">
          {asking ? (
            <div className="cs-chips">
              {choices.map((c) => (
                <button
                  key={c.text}
                  type="button"
                  className="choice-card cs-chip"
                  onClick={() => answer(c.correct)}
                >
                  {/* "115 menit" tak muat sebaris di kartu sepertiga lebar HP
                      320 px: bilangannya tetap besar, satuannya turun baris. */}
                  {/^\d+ menit$/.test(c.text) ? (
                    <>
                      <span className="cs-chip__num">{c.text.split(' ')[0]}</span>{' '}
                      <span className="cs-chip__unit">menit</span>
                    </>
                  ) : (
                    c.text
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" className="btn btn--primary cs-check" onClick={check}>
              ✓ Cocok!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
