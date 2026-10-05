import { useEffect, useRef, useState } from 'react';
import type { Stage, StageMap } from '@/engine/core/types';
import { getLevelStars } from '@/engine/core/progress';
import { sfx, speak, stopSpeaking } from '@/engine/audio/sound';
import BackIcon from './BackIcon';
import './stage-map.css';

/**
 * Peta tahap berkelok (`GameConfig.stageMap`) — dari referensi "Peta Galaksi"
 * yang dikirim pemilik (docs/rencana-referensi-galaksi.md, tahap 2), tapi
 * pastel senada app, bukan galaksi gelap.
 *
 * Kemajuan tiap tahap DITURUNKAN dari bintang slot-slotnya, bukan disimpan
 * sendiri: tahap selesai = semua slotnya pernah dijawab. Bintang biasa sudah
 * tersinkron ke Firestore, jadi peta ikut pulih di HP baru tanpa data baru.
 */

export interface StageProgress {
  done: number;
  total: number;
  stars: number;
}

export function stageProgress(gameId: string, stage: Stage): StageProgress {
  let done = 0;
  let stars = 0;
  for (const id of stage.slots) {
    const s = getLevelStars(gameId, id);
    if (s > 0) done += 1;
    stars += s;
  }
  return { done, total: stage.slots.length, stars };
}

/** Tahap ke-i terbuka kalau i = 0 atau tahap sebelumnya selesai. */
export function stageUnlocked(gameId: string, stages: Stage[], i: number): boolean {
  if (i === 0) return true;
  const prev = stageProgress(gameId, stages[i - 1]!);
  return prev.done >= prev.total;
}

/**
 * Dibacakan saat tahap terkunci disentuh. WAJIB sama persis dengan baris di
 * `ENGINE_LINES` (scripts/extract-narration.mjs), kalau tidak rekamannya tak
 * ketemu dan jatuh ke suara HP.
 */
const LOCKED_LINE = 'Tahap ini masih terkunci. Selesaikan tahap sebelumnya dulu ya!';

/** Tinggi satu baris peta dalam piksel CSS; jalan & titik dihitung darinya. */
const ROW = 116;
/** Posisi mendatar titik, persen lebar peta — bergantian kiri/kanan. */
const X = [30, 70];

export default function StageMapView({
  gameId,
  title,
  map,
  onPlay,
  onExit,
}: {
  gameId: string;
  title: string;
  map: StageMap;
  onPlay: (index: number) => void;
  onExit: () => void;
}) {
  const { stages } = map;
  const progress = stages.map((s) => stageProgress(gameId, s));
  const unlocked = stages.map((_, i) => stageUnlocked(gameId, stages, i));
  // Tahap "sekarang" = tahap terbuka pertama yang belum selesai; kalau semua
  // selesai, tahap terakhir.
  const firstOpen = progress.findIndex((p, i) => unlocked[i] && p.done < p.total);
  const current = firstOpen === -1 ? stages.length - 1 : firstOpen;
  const [shake, setShake] = useState<number | null>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  // Tahap yang sedang dikerjakan langsung terlihat, walau petanya panjang.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  // Peta ini layar PEMBUKA game, jadi ajakannya dibacakan — anak yang belum
  // lancar membaca tak punya pegangan lain (laporan pemilik 2026-10-05:
  // "tangga membaca gaada suaranya"). Kalimatnya `map.title`, ikut dirender
  // lewat `npm run narasi`.
  useEffect(() => {
    speak(map.title);
    return () => stopSpeaking();
  }, [map.title]);

  const pts = stages.map((_, i) => ({ x: X[i % 2]!, y: i * ROW + ROW / 2 }));
  const height = stages.length * ROW;
  // Jalan dalam satuan: x = persen lebar (0–100), y = piksel. SVG-nya
  // `preserveAspectRatio="none"` supaya x mengikuti lebar peta apa pun, dan
  // tebal garisnya dijaga `vector-effect: non-scaling-stroke`.
  const pathThrough = (upTo: number) =>
    pts
      .slice(0, upTo + 1)
      .map((p, i) => {
        if (i === 0) return `M${p.x} ${p.y}`;
        const a = pts[i - 1]!;
        return `C${a.x} ${a.y + ROW / 2} ${p.x} ${p.y - ROW / 2} ${p.x} ${p.y}`;
      })
      .join(' ');
  // Bagian jalan yang sudah dilalui: sampai titik tahap selesai terakhir.
  const lastDone = progress.reduce((acc, p, i) => (p.done >= p.total ? i : acc), -1);

  return (
    <div className="game-center game-center--pick stage-screen">
      <h1 className="pick-heading">{title}</h1>
      <p className="pick-prompt">{map.title}</p>
      <div className="stage-map" style={{ height }}>
        <svg
          className="stage-map__road"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path className="stage-map__edge" d={pathThrough(stages.length - 1)} />
          <path className="stage-map__lane" d={pathThrough(stages.length - 1)} />
          {lastDone > 0 && <path className="stage-map__walked" d={pathThrough(lastDone)} />}
          <path className="stage-map__dash" d={pathThrough(stages.length - 1)} />
        </svg>
        {stages.map((stage, i) => {
          const p = progress[i]!;
          const open = unlocked[i]!;
          const done = p.done >= p.total;
          const isCurrent = open && i === current && !done;
          const pt = pts[i]!;
          const cls =
            'stage-node' +
            (done ? ' stage-node--done' : '') +
            (isCurrent ? ' stage-node--now' : '') +
            (!open ? ' stage-node--locked' : '') +
            (shake === i ? ' stage-node--shake' : '');
          return (
            <div
              key={stage.id}
              className={cls}
              data-stage={stage.id}
              style={{ left: `${pt.x}%`, top: pt.y }}
            >
              <button
                ref={i === current ? currentRef : undefined}
                type="button"
                className="stage-node__btn"
                aria-label={
                  `Tahap ${i + 1}: ${stage.label}` +
                  (open ? `, ${p.done} dari ${p.total} soal` : ' — terkunci')
                }
                onClick={() => {
                  if (!open) {
                    sfx('wrong');
                    speak(LOCKED_LINE);
                    setShake(i);
                    window.setTimeout(() => setShake(null), 450);
                    return;
                  }
                  onPlay(i);
                }}
              >
                <span className="stage-node__emoji" aria-hidden>
                  {stage.emoji}
                </span>
                <span className="stage-node__num" aria-hidden>
                  {done ? '✓' : open ? i + 1 : '🔒'}
                </span>
              </button>
              {isCurrent && (
                <span className="stage-node__go" aria-hidden>
                  Mulai
                </span>
              )}
              <span className="stage-node__label">{stage.label}</span>
              <span className="stage-node__bar" aria-hidden>
                <span style={{ width: `${(p.done / p.total) * 100}%` }} />
              </span>
            </div>
          );
        })}
      </div>
      <button className="btn" onClick={onExit}>
        <BackIcon /> Kembali
      </button>
    </div>
  );
}
