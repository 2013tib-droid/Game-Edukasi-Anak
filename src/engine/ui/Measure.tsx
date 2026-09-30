import type { MeasureSpec } from '@/engine/core/types';
import Ruler from '@/engine/ui/Ruler';
import { Balance, Scale } from '@/engine/ui/Scale';
import Beaker from '@/engine/ui/Beaker';
import { GridShape, RectPlot } from '@/engine/ui/Plot';
import './measure.css';

/**
 * Alat ukur di atas kartu jawaban tap-answer (`TapAnswerData.measure`).
 * Config menyebut nilainya; semua gambar di sini digambar engine.
 */
export default function Measure({ spec }: { spec: MeasureSpec }) {
  switch (spec.kind) {
    case 'ruler':
      return (
        <div className="measure measure--ruler">
          <Ruler thing={spec.thing} from={spec.from} to={spec.to} max={spec.max} />
        </div>
      );
    case 'scale':
      return (
        <div className="measure measure--scale">
          <Scale item={spec.item} value={spec.value} unit={spec.unit} />
        </div>
      );
    case 'balance':
      return (
        <div className={'measure measure--balance' + (spec.scales.length > 1 ? ' measure--pair' : '')}>
          {spec.scales.map((s, i) => (
            <Balance key={i} spec={s} />
          ))}
        </div>
      );
    case 'beaker':
      return (
        <div className="measure measure--beaker">
          <Beaker ml={spec.ml} liquid={spec.liquid} />
        </div>
      );
    case 'grid':
      return (
        <div className="measure measure--grid">
          <GridShape rows={spec.rows} />
        </div>
      );
    case 'rect':
      return (
        <div className="measure measure--rect">
          <RectPlot w={spec.w} h={spec.h} unit={spec.unit} />
        </div>
      );
  }
}
