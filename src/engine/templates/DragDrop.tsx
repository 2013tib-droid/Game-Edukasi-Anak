import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';

interface DragState {
  itemId: string;
  x: number;
  y: number;
}

/**
 * One picture inside a chip or a target: registry art when the config names an
 * `item`, otherwise the plain emoji. `target` marks the cue drawn on an empty
 * target, which is sized separately from the thing being dragged.
 */
function Pic({ item, emoji, target }: { item?: string; emoji?: string; target?: boolean }) {
  const cls = 'dd-emoji' + (target ? ' dd-emoji--target' : '');
  if (item) {
    return <ItemPic id={item} className={`dd-img${target ? ' dd-img--target' : ''}`} fallbackClassName={cls} />;
  }
  if (!emoji) return null;
  return (
    <span className={cls} aria-hidden>
      {emoji}
    </span>
  );
}

/**
 * Drag each item onto its matching target. Uses pointer events (not HTML5
 * drag-and-drop, which is broken on mobile browsers).
 */
export default function DragDrop({ level, onCorrect, onWrong }: TemplateProps<'drag-drop'>) {
  const { targets, items, pictureTargets } = level.data;
  const [placed, setPlaced] = useState<Map<string, string>>(new Map()); // itemId -> targetId
  const [drag, setDrag] = useState<DragState | null>(null);
  const [overTarget, setOverTarget] = useState<string | null>(null);
  const targetRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  function targetAt(x: number, y: number): string | null {
    for (const [id, el] of targetRefs.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return null;
  }

  function handleDown(e: ReactPointerEvent, itemId: string) {
    if (placed.has(itemId)) return;
    e.preventDefault();
    sfx('tap');
    setDrag({ itemId, x: e.clientX, y: e.clientY });
  }

  function handleMove(e: ReactPointerEvent) {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setOverTarget(targetAt(e.clientX, e.clientY));
  }

  function handleUp(e: ReactPointerEvent) {
    if (!drag) return;
    const dropped = targetAt(e.clientX, e.clientY);
    const item = items.find((i) => i.id === drag.itemId)!;
    setDrag(null);
    setOverTarget(null);
    if (!dropped) return; // released over nothing: no penalty, just snap back
    if (dropped === item.targetId && !isFilled(dropped)) {
      sfx('correct');
      const next = new Map(placed).set(item.id, dropped);
      setPlaced(next);
      if (next.size === items.length) window.setTimeout(onCorrect, 350);
    } else {
      onWrong();
    }
  }

  function isFilled(targetId: string): boolean {
    for (const t of placed.values()) if (t === targetId) return true;
    return false;
  }

  return (
    <div onPointerMove={handleMove} onPointerUp={handleUp} style={{ flex: 1 }}>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        <div className={'dd-targets' + (pictureTargets ? ' dd-targets--pic' : '')}>
          {targets.map((t) => {
            const filledBy = items.find((i) => placed.get(i.id) === t.id);
            return (
              <div
                key={t.id}
                ref={(el) => {
                  if (el) targetRefs.current.set(t.id, el);
                  else targetRefs.current.delete(t.id);
                }}
                className={
                  'dd-target' +
                  (pictureTargets ? ' dd-target--pic' : '') +
                  (overTarget === t.id ? ' dd-target--over' : '') +
                  (filledBy ? ' dd-target--filled' : '')
                }
              >
                {filledBy ? (
                  <>
                    <Pic item={filledBy.item} emoji={filledBy.emoji} />
                    {filledBy.text && <span className="dd-label">{filledBy.text}</span>}
                  </>
                ) : (
                  <>
                    <Pic item={t.item} emoji={t.emoji} target />
                    <span className="dd-label">{t.label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="dd-items">
          {items.map((item) => (
            <div
              key={item.id}
              className={
                'dd-item' +
                (placed.has(item.id) ? ' dd-item--placed' : '') +
                (drag?.itemId === item.id ? ' dd-item--dragging' : '')
              }
              style={
                drag?.itemId === item.id ? { left: drag.x, top: drag.y } : undefined
              }
              onPointerDown={(e) => handleDown(e, item.id)}
            >
              <Pic item={item.item} emoji={item.emoji} />
              {item.text && <span className="dd-text">{item.text}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
