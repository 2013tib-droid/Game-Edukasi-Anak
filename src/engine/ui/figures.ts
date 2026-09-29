import type { FigureId } from '@/engine/core/types';
import type { FigureDef } from '@/engine/ui/figure';
import { KID_FIGURE } from '@/engine/ui/Kid';
import { PLANT_FIGURE } from '@/engine/ui/Plant';

/**
 * Tabel titik sentuh tiap figur `tap-picture`, satu tempat. Dipakai
 * `TapPicture.tsx` DAN `scripts/check-body-parts.mjs`, supaya yang diukur CI
 * persis yang digambar di layar. Menambah figur = satu komponen SVG (pola
 * `Kid.tsx`/`Plant.tsx`) + satu baris di sini + satu nama di `FigureId`.
 */
export const FIGURES: Record<FigureId, FigureDef> = {
  anak: KID_FIGURE,
  tanaman: PLANT_FIGURE,
};
