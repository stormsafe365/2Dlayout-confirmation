import { useEffect, useState } from "react";
import useStore from "../store";
import { TYPES, WALLS } from "../constants";
import { clamp, ft, INCH, parseFt } from "../format";
import { wallLen } from "../geometry";
import type { OpeningTypeKey, WallKey } from "../types";

export default function Editor() {
  const selId = useStore((s) => s.selId);
  const openings = useStore((s) => s.openings);
  const width = useStore((s) => s.width);
  const length = useStore((s) => s.length);
  const eave = useStore((s) => s.eave);
  const update = useStore((s) => s.update);
  const remove = useStore((s) => s.remove);

  const op = openings.find((o) => o.id === selId);
  if (!op) return null;

  const wl = wallLen(op.wall, width, length);
  const maxO = Math.max(0, wl - op.w);

  return (
    <div className="editor">
      <div className="ehead">
        <b>Edit · {TYPES[op.type].label}</b>
        <button className="del" onClick={() => remove(op.id)}>
          Delete
        </button>
      </div>

      <div className="g2">
        <div className="fld">
          <label>Type</label>
          <div className="inp">
            <select
              value={op.type}
              onChange={(e) => update(op.id, { type: e.target.value as OpeningTypeKey })}
            >
              {(Object.entries(TYPES) as [OpeningTypeKey, typeof TYPES.rollup][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="fld">
          <label>Wall</label>
          <div className="inp">
            <select
              value={op.wall}
              onChange={(e) => update(op.id, { wall: e.target.value as WallKey })}
            >
              {(Object.entries(WALLS) as [WallKey, typeof WALLS.front][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="g2">
        <FtInchField
          label="Width"
          value={op.w}
          min={0.5}
          max={wl}
          onCommit={(v) => update(op.id, { w: v })}
        />
        <FtInchField
          label="Height"
          value={op.h}
          min={0.5}
          max={eave}
          onCommit={(v) => update(op.id, { h: v })}
        />
      </div>

      <div className="fld">
        <label>
          Offset from {WALLS[op.wall].ref} corner <span>(max {ft(maxO)})</span>
        </label>
        <FtInchField
          value={op.o}
          min={0}
          max={maxO}
          onCommit={(v) => update(op.id, { o: v })}
          showSuffix
        />
        <input
          type="range"
          min={0}
          max={maxO}
          step={INCH}
          value={op.o}
          onChange={(e) => update(op.id, { o: +e.target.value })}
          aria-label="Offset slider"
        />
      </div>

      <p className="hint">
        Type any length as <code>2'3"</code>, <code>2.25</code>, or <code>27"</code> — or drag the
        opening directly on the plan.
      </p>
    </div>
  );
}

/**
 * Text input that accepts a length in feet/inches notation and commits a
 * decimal-feet number on blur or Enter. Snaps to the nearest inch.
 */
function FtInchField({
  label, value, min, max, onCommit, showSuffix = false,
}: {
  label?: string;
  value: number;
  min: number;
  max: number;
  onCommit: (v: number) => void;
  showSuffix?: boolean;
}) {
  const [text, setText] = useState(ft(value));
  // External value changed (drag, slider) — refresh the display.
  useEffect(() => { setText(ft(value)); }, [value]);

  const commit = () => {
    const parsed = parseFt(text);
    if (!Number.isFinite(parsed)) { setText(ft(value)); return; }
    // snap to nearest inch and clamp
    const snapped = Math.round(parsed * 12) / 12;
    const clamped = clamp(snapped, min, max);
    if (clamped !== value) onCommit(clamped);
    setText(ft(clamped));
  };

  const inputEl = (
    <input
      type="text"
      inputMode="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
        if (e.key === "Escape") { setText(ft(value)); (e.currentTarget as HTMLInputElement).blur(); }
      }}
      spellCheck={false}
    />
  );

  if (!label) {
    return (
      <div className="inp">
        {inputEl}
        {showSuffix && <span className="unit">ft′in″</span>}
      </div>
    );
  }
  return (
    <div className="fld">
      <label>{label}</label>
      <div className="inp">
        {inputEl}
        <span className="unit">ft′in″</span>
      </div>
    </div>
  );
}
