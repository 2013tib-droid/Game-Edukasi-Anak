import { useState } from 'react';
import { FACE_OF, FEEL_LINES, type FaceRead } from '@/engine/core/feelings';
import Face from '@/engine/ui/Face';

/**
 * WAJAH PERASAAN = seni anak ayam kiriman pemilik (2026-11-13, enam ekspresi:
 * biasa, senang, sedih, marah, takut, kaget) di `public/assets/feel/<f>.webp`,
 * dipotong `scripts/cut-feel-sheet.py`. Pemilik menilai wajah SVG engine
 * kurang bagus — SVG itu (`Face.tsx`) sekarang hanya CADANGAN kalau berkasnya
 * gagal dimuat (kontrak yang sama dengan `ItemPic`).
 */
export function feelImageUrl(f: FaceRead): string {
  return `${import.meta.env.BASE_URL}assets/feel/${f}.webp`;
}

interface Props {
  feeling: FaceRead;
  className?: string;
  /** Diumumkan ke pembaca layar (nama perasaan). Tanpa = hiasan. */
  labelled?: boolean;
}

export default function FeelFace({ feeling, className, labelled }: Props) {
  const [failed, setFailed] = useState(false);
  const label = labelled && feeling !== 'biasa' ? FEEL_LINES.name[feeling] : undefined;
  if (failed) return <Face uid={`fb-${feeling}`} shape={FACE_OF[feeling]} className={className} label={label} />;
  return (
    <img
      className={className}
      src={feelImageUrl(feeling)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      data-feel={feeling}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Beberapa wajah ditumpuk, satu yang tampil — berganti dengan pudar-silang.
 * Dipakai wajah besar yang dibentuk anak (mode make/mirror) dan wajah teman
 * yang membaik sesudah ditolong.
 */
export function FeelStack({ set, show, className }: { set: FaceRead[]; show: FaceRead; className?: string }) {
  return (
    <span className={`ff-stack ${className ?? ''}`} data-show={show}>
      {set.map((f) => (
        <FeelFace key={f} feeling={f} className={`ff-stack__pic${f === show ? ' ff-stack__pic--on' : ''}`} />
      ))}
    </span>
  );
}
