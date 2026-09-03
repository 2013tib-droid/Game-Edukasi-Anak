import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BoardOp } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import Shape from '@/engine/ui/Shape';
import Clock from '@/engine/ui/Clock';
import ItemPic from '@/engine/ui/ItemPic';

/** Human-readable operator glyphs for equation picture boards. */
const OP_GLYPH: Record<BoardOp, string> = {
  plus: '+',
  minus: '−',
  equals: '=',
  arrow: '→',
  question: '?',
};

/**
 * Lebar tulisan dalam satuan `em`, ditaksir per karakter.
 *
 * Jumlah karakter saja tidak cukup: di font tebal ini satu HURUF KAPITAL jauh
 * lebih lebar daripada satu angka (~0,72em lawan ~0,58em), jadi "RAK" (3
 * karakter) hampir selebar "10.30" (5 karakter). Menakar lebarnya dulu bikin
 * satu aturan berlaku untuk suku kata, angka, jam, maupun nilai uang.
 */
function emWidth(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) em += 0.58;
    else if (/[IJ]/.test(ch)) em += 0.4;
    else if (/[MW]/.test(ch)) em += 0.94;
    else if (/[A-Z]/.test(ch)) em += 0.72;
    else if (/[a-z]/.test(ch)) em += 0.56;
    else if (/[ .,:]/.test(ch)) em += 0.3;
    else em += 0.6;
  }
  return em;
}

/**
 * Size class for a text-only answer. A single letter or number is the whole
 * visual and gets the huge type; a wider answer (suku kata "RAK", jam "10.30",
 * uang "Rp15.000") steps down so it still fits di dalam kartu — kartu di HP
 * cuma ~100px lebarnya dan tulisan tanpa spasi tidak bisa pindah baris sendiri.
 *
 * Ambangnya dihitung dari `emWidth`, bukan `text.length`. Dulu pakai panjang
 * karakter dan jawaban 3 huruf kapital ("RAK", "ROK", "RUK" di Suku Kata)
 * masuk kelas terbesar lalu patah jadi "RA / K" di HP.
 *
 * Ukuran final masih dipangkas lagi oleh `--fit` (lihat engine.css): CSS
 * membagi lebar kartu yang SEBENARNYA dengan taksiran ini, jadi kartu sempit
 * di layar 320px pun tidak pernah kepenuhan.
 */
function mainTextClass(text: string): string {
  const em = emWidth(text);
  const size =
    em <= 1.3
      ? '' // "7", "A", "12"
      : em <= 2.4
        ? ' choice-text--lg' // "RAK", "BAL"
        : em <= 3.3
          ? ' choice-text--md' // "BUKU", "CANG", "10.30"
          : em <= 4.7
            ? ' choice-text--word' // "BONEKA", "Rp15.000"
            : ' choice-text--sm'; // lebih panjang lagi
  return `choice-text choice-text--main${size}`;
}

/**
 * Size class for the written equation. It is `white-space: nowrap` on purpose
 * (a sum split across two lines stops reading as one sentence), so a long one
 * — three addends, two-digit numbers — has to step DOWN in size or it widens
 * the phone screen. Thresholds measured at 360px: "4 + 4 = ?" fits at the big
 * size, "2 + 3 + 4 = ?" does not.
 */
function equationClass(eq: string, dense: boolean): string {
  if (dense) return 'ta-equation ta-equation--dense';
  const size = eq.length <= 11 ? '' : eq.length <= 15 ? ' ta-equation--long' : ' ta-equation--xlong';
  return `ta-equation${size}`;
}

/** Pick the one correct answer out of 2–4 big cards. */
export default function TapAnswer({ level, onCorrect, onWrong }: TemplateProps<'tap-answer'>) {
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // Shuffle once per level attempt so the correct card moves around.
  const choices = useMemo(
    () => [...level.data.choices].sort(() => Math.random() - 0.5),
    [level],
  );

  // Total picture count on the board (animals + props like houses, ignoring
  // operators). Busy boards (subtraction: "7 ducks → 3 houses" = 10 items)
  // shrink the pictures a notch so everything fits without scrolling.
  const boardItemCount = useMemo(
    () =>
      (level.data.boardItems ?? []).reduce(
        (n, tok) => ('op' in tok ? n : n + tok.count),
        0,
      ),
    [level],
  );
  // A board that also carries an `equation` line has one extra row to fit, so
  // it runs out of height a notch earlier. Terukur di HP 360×640: 6 gambar +
  // "4 − 2 = ?" membuat layar scroll 112px (Hutan Hewan maupun Hitung Hebat),
  // sedangkan 6 gambar tanpa persamaan masih muat — jadi ambangnya digeser
  // hanya untuk papan berpersamaan.
  const denseBoard = boardItemCount > 6 || (!!level.data.equation && boardItemCount > 5);

  // Answers that are pure pictures (fruit, objects, clock faces — no letter,
  // caption or shape) get the wide two-across grid: the picture IS the answer,
  // so card width is what matters. Letter/number/shape answers keep the tight
  // grid. Clocks belong here too — their numerals only stay legible on a phone
  // if the card is wide.
  const pictureChoices = choices.every(
    (c) => (c.emoji || c.item || c.clock) && !c.text && !c.shape,
  );

  function handleTap(id: string, correct: boolean | undefined) {
    if (solved) return;
    if (correct) {
      setSolved(true);
      onCorrect();
    } else {
      sfx('tap');
      setShakeId(id);
      window.setTimeout(() => setShakeId(null), 450);
      onWrong();
    }
  }

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        {level.data.pictureItem ? (
          <div
            className={
              'ta-picture ta-picture--img' +
              (pictureChoices ? ' ta-picture--compact' : '') +
              (level.data.silhouette ? ' ta-picture--silhouette' : '')
            }
            aria-hidden
          >
            <ItemPic
              id={level.data.pictureItem}
              className="ta-picture__img"
              fallbackClassName="ta-picture__emoji"
            />
          </div>
        ) : (
          level.data.picture && (
            <div
              className={
                'ta-picture' +
                (pictureChoices ? ' ta-picture--compact' : '') +
                (level.data.silhouette ? ' ta-picture--silhouette' : '')
              }
              aria-hidden
            >
              {level.data.picture}
            </div>
          )
        )}
        {level.data.clock && (
          <div className="ta-clock" aria-hidden>
            <Clock time={level.data.clock} className="ta-clock__face" />
          </div>
        )}
        {level.data.sequence && (
          <div className="ta-sequence" aria-hidden>
            {level.data.sequence.map((u, i) =>
              u ? (
                <div key={i} className="ta-seq-cell">
                  <Shape kind={u.kind} color={u.color} size={52} className="ta-seq-shape" />
                </div>
              ) : (
                <div key={i} className="ta-seq-cell ta-seq-cell--q">
                  ?
                </div>
              ),
            )}
          </div>
        )}
        {level.data.boardItems && (
          <div
            className={'ta-board ta-board--pics' + (denseBoard ? ' ta-board--dense' : '')}
            aria-hidden
          >
            {level.data.boardItems.map((tok, i) =>
              'op' in tok ? (
                <span key={i} className="ta-board__op">
                  {OP_GLYPH[tok.op]}
                </span>
              ) : (
                <span key={i} className="ta-board__group">
                  {Array.from({ length: tok.count }, (_, n) => (
                    <ItemPic
                      key={n}
                      id={tok.item}
                      className="ta-board__img"
                      fallbackClassName="ta-board__emoji"
                    />
                  ))}
                </span>
              ),
            )}
          </div>
        )}
        {/* The same sum written in numbers, under the pictures the child just
            counted — the bridge from "this many" to "3 + 3 = ?". */}
        {level.data.equation && (
          <div className={equationClass(level.data.equation, denseBoard)} aria-hidden>
            {level.data.equation}
          </div>
        )}
        {level.data.board && !level.data.boardItems && (
          <div className="ta-board" aria-hidden>
            {/* Split on normal spaces into atomic tokens; operators are glued
                to their group with non-breaking spaces in the config, so each
                token stays whole and a wrap breaks only between equation
                halves — never mid-group. */}
            {level.data.board.split(' ').map((token, i) => (
              <span key={i} className="ta-board__tok">
                {token}
              </span>
            ))}
          </div>
        )}
        <div className={'choice-grid' + (pictureChoices ? ' choice-grid--pics' : '')}>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={'choice-card' + (shakeId === c.id ? ' choice-card--shake' : '')}
              onClick={() => handleTap(c.id, c.correct)}
            >
              {c.shape && (
                <Shape
                  kind={c.shape.kind}
                  color={c.shape.color}
                  size={64}
                  className="choice-shape"
                />
              )}
              {c.clock && <Clock time={c.clock} className="choice-clock" />}
              {c.item ? (
                <ItemPic id={c.item} className="choice-img" fallbackClassName="choice-emoji" />
              ) : (
                c.emoji && (
                  <span className="choice-emoji" aria-hidden>
                    {c.emoji}
                  </span>
                )
              )}
              {c.text && (
                // A text answer with no emoji (a letter/number) is the main
                // visual — render it big. With an emoji it's just a caption.
                <span
                  className={c.emoji ? 'choice-text' : mainTextClass(c.text)}
                  // Lebar taksiran tulisan, dipakai engine.css untuk membagi
                  // lebar kartu (`cqw`) — pengaman terakhir supaya tulisan
                  // tidak pernah patah, berapa pun lebar layarnya.
                  style={{ '--fit': emWidth(c.text) } as CSSProperties}
                >
                  {c.text}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
