import type { CSSProperties, ReactElement } from 'react';
import type { BarChartSpec, ChartRow, ChartSpec } from '@/engine/core/types';
import ItemPic from '@/engine/ui/ItemPic';
import './chart.css';

/**
 * Data statistik untuk tap-answer (`TapAnswerData.chart`, Detektif Data `sd2`):
 * tabel turus, piktogram, diagram batang, tabel angka, deret data.
 *
 * Config menyebut NILAI per kategori; semuanya digambar di sini, jadi batang
 * selalu persis setinggi datanya dan piktogram selalu persis sebanyak datanya.
 * Ditulis HTML/CSS (bukan satu SVG) supaya gambar kategori bisa memakai seni
 * item (`ItemPic`, jatuh ke emoji kalau gagal dimuat) tanpa hitung posisi.
 *
 * ATURAN: tak ada angka di atas batang dan tak ada kolom angka di tabel turus
 * maupun piktogram — itu jawabannya. Yang dibaca anak: turus, gambar, garis
 * bantu + angka di sumbu.
 */

/** Warna batang per URUTAN kategori — sama di diagram besar dan kartu mini. */
const BAR_COLORS = ['#ff8a65', '#4fc3f7', '#9ccc65', '#ba68c8'];

function Pic({ id, className }: { id: string; className: string }) {
  return <ItemPic id={id} className={className} fallbackClassName={className + ' chart-emoji'} />;
}

/** Turus berikat lima: empat garis tegak + satu garis miring melintang. */
function Tally({ n }: { n: number }) {
  const groups = Math.floor(n / 5);
  const rest = n % 5;
  const G = 34; // lebar satu ikat (4 garis × 6 + jarak)
  const w = groups * G + rest * 6 + 4;
  const lines: ReactElement[] = [];
  for (let g = 0; g < groups; g++) {
    const x0 = g * G + 3;
    for (let i = 0; i < 4; i++) {
      lines.push(<line key={`${g}-${i}`} x1={x0 + i * 6} y1={3} x2={x0 + i * 6} y2={25} />);
    }
    lines.push(<line key={`${g}-x`} x1={x0 - 3} y1={22} x2={x0 + 21} y2={6} />);
  }
  for (let i = 0; i < rest; i++) {
    const x = groups * G + 3 + i * 6;
    lines.push(<line key={`r${i}`} x1={x} y1={3} x2={x} y2={25} />);
  }
  return (
    <svg className="chart-tally" viewBox={`0 0 ${Math.max(w, 1)} 28`} style={{ '--w': w } as CSSProperties}>
      {lines}
    </svg>
  );
}

function RowLabel({ row, icon }: { row: ChartRow; icon: boolean }) {
  return (
    <div className="chart-rows__label">
      {icon && <Pic id={row.item} className="chart-rows__icon" />}
      <span>{row.label}</span>
    </div>
  );
}

/** Piktogram: `value / per` gambar; sisa setengah digambar separuh. */
function PictoRow({ row, per }: { row: ChartRow; per: 1 | 2 }) {
  const full = Math.floor(row.value / per);
  const half = row.value % per !== 0;
  return (
    <div className="chart-picto">
      {Array.from({ length: full }, (_, i) => (
        <Pic key={i} id={row.item} className="chart-picto__img" />
      ))}
      {half && (
        <span className="chart-picto__half">
          <Pic id={row.item} className="chart-picto__img" />
        </span>
      )}
    </div>
  );
}

/** Diagram batang tegak. `mini` = versi kecil di kartu jawaban. */
export function BarChart({ spec, mini }: { spec: BarChartSpec; mini?: boolean }) {
  const { rows, step, max } = spec;
  const every = spec.labelEvery ?? 1;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  return (
    <div
      className={'chart-bar' + (mini ? ' chart-bar--mini' : '')}
      style={{ '--n': rows.length } as CSSProperties}
    >
      <div className="chart-bar__axis">
        {ticks.map((v, i) =>
          i % every === 0 ? (
            <span key={v} className="chart-bar__tick" style={{ bottom: `${(v / max) * 100}%` }}>
              {v}
            </span>
          ) : null,
        )}
      </div>
      <div className="chart-bar__area">
        {ticks.map((v) => (
          <span key={v} className="chart-bar__grid" style={{ bottom: `${(v / max) * 100}%` }} />
        ))}
        <div className="chart-bar__cols">
          {rows.map((r, i) => (
            <div key={r.item + i} className="chart-bar__col">
              <span
                className="chart-bar__bar"
                style={{ height: `${(r.value / max) * 100}%`, background: BAR_COLORS[i % 4] }}
              />
            </div>
          ))}
        </div>
      </div>
      <span />
      <div className="chart-bar__icons">
        {rows.map((r, i) => (
          <Pic key={r.item + i} id={r.item} className="chart-bar__icon" />
        ))}
      </div>
    </div>
  );
}

export default function Chart({ spec }: { spec: ChartSpec }) {
  switch (spec.kind) {
    case 'tally':
      return (
        <div className="chart chart--rows">
          {spec.rows.map((r) => (
            <div key={r.item} className="chart-rows__row">
              <RowLabel row={r} icon />
              <div className="chart-rows__val">
                <Tally n={r.value} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'picto':
      return (
        <div className="chart chart--rows chart--picto">
          {spec.rows.map((r) => (
            <div key={r.item} className="chart-rows__row">
              <RowLabel row={r} icon={false} />
              <PictoRow row={r} per={spec.per} />
            </div>
          ))}
          <div className="chart-key">
            <Pic id={spec.rows[0].item} className="chart-key__img" />
            <span>
              = {spec.per}
              {spec.per > 1 && (
                <>
                  {' · '}
                  <span className="chart-picto__half chart-key__half">
                    <Pic id={spec.rows[0].item} className="chart-key__img" />
                  </span>{' '}
                  = {spec.per / 2}
                </>
              )}
            </span>
          </div>
        </div>
      );
    case 'bar':
      return (
        <div className="chart">
          <BarChart spec={spec} />
        </div>
      );
    case 'table':
      return (
        <div className="chart">
          <div className="chart-table" style={{ '--n': spec.rows.length } as CSSProperties}>
            {spec.rows.map((r) => (
              <div key={r.item} className="chart-table__col">
                <Pic id={r.item} className="chart-table__icon" />
                <span className="chart-table__num">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'list':
      return (
        <div className="chart">
          <div className="chart-list">
            <div className="chart-list__title">{spec.title}</div>
            <div className="chart-list__values">
              {spec.values.map((v, i) => (
                <span key={i} className="chart-list__chip">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
  }
}
