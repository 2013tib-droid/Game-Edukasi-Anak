import { useMemo, useRef, useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';
import { shuffle } from '../core/utils.js';

// Template "drag & drop": drag each item onto its matching zone (pairing,
// grouping and sorting all use the same mechanic). Pointer events only —
// works with fingers, no drag library.
// level: { prompt, speak?, audioSrc?,
//          zones: [{ id, label, color? }], items: [{ id, label, zone }] }
export default function DragDrop({ level, onCorrect, onWrong, onComplete }) {
  const items = useMemo(() => shuffle(level.items), [level]);
  const [placed, setPlaced] = useState({}); // itemId -> zoneId
  const [drag, setDrag] = useState(null); // { itemId, x, y }
  const zoneRefs = useRef({});
  const boardRef = useRef(null);

  function pointerDown(e, item) {
    if (placed[item.id]) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ itemId: item.id, x: e.clientX, y: e.clientY });
  }

  function pointerMove(e) {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  }

  function pointerUp(e) {
    if (!drag) return;
    const item = level.items.find((i) => i.id === drag.itemId);
    const hitZone = Object.entries(zoneRefs.current).find(([, el]) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
    });
    setDrag(null);

    if (!hitZone) return; // dropped nowhere: no penalty, just snaps back
    const [zoneId] = hitZone;
    if (zoneId === item.zone) {
      const nextPlaced = { ...placed, [item.id]: zoneId };
      setPlaced(nextPlaced);
      onCorrect();
      if (Object.keys(nextPlaced).length === level.items.length) {
        setTimeout(onComplete, 900);
      }
    } else {
      onWrong();
    }
  }

  const dragItem = drag ? level.items.find((i) => i.id === drag.itemId) : null;
  const boardRect = boardRef.current?.getBoundingClientRect();

  return (
    <div className="template" ref={boardRef}>
      <PromptBar text={level.prompt} speak={level.speak} audioSrc={level.audioSrc} />

      <div className="dd-zones">
        {level.zones.map((zone) => (
          <div
            key={zone.id}
            ref={(el) => { zoneRefs.current[zone.id] = el; }}
            className={`dd-zone ${zone.color ? 'dd-zone-colored' : ''}`}
            style={zone.color ? { background: zone.color, borderColor: zone.color } : undefined}
          >
            <span className="dd-zone-label">{zone.label}</span>
            <div className="dd-zone-items">
              {level.items
                .filter((item) => placed[item.id] === zone.id)
                .map((item) => (
                  <span key={item.id} className="dd-item dd-item-placed">{item.label}</span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dd-tray">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dd-item ${placed[item.id] ? 'dd-item-done' : ''} ${drag?.itemId === item.id ? 'dd-item-ghost' : ''}`}
            onPointerDown={(e) => pointerDown(e, item)}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            disabled={Boolean(placed[item.id])}
          >
            {item.label}
          </button>
        ))}
      </div>

      {drag && dragItem && boardRect && (
        <span
          className="dd-item dd-item-dragging"
          style={{ left: drag.x - boardRect.left, top: drag.y - boardRect.top }}
        >
          {dragItem.label}
        </span>
      )}
    </div>
  );
}
