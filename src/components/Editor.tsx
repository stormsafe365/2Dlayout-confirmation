import useStore from "../store";
import { TYPES, WALLS } from "../constants";
import { ft } from "../format";
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
        <div className="fld">
          <label>Width</label>
          <div className="inp">
            <input
              type="number"
              min={0.5}
              max={wl}
              step={0.5}
              value={+op.w.toFixed(3)}
              onChange={(e) => update(op.id, { w: +e.target.value || 1 })}
            />
            <span className="unit">ft</span>
          </div>
        </div>
        <div className="fld">
          <label>Height</label>
          <div className="inp">
            <input
              type="number"
              min={0.5}
              max={eave}
              step={0.5}
              value={+op.h.toFixed(3)}
              onChange={(e) => update(op.id, { h: +e.target.value || 1 })}
            />
            <span className="unit">ft</span>
          </div>
        </div>
      </div>

      <div className="fld">
        <label>
          Offset — <span>{ft(op.o)}</span> from {WALLS[op.wall].ref} corner
          {" "}(max {ft(maxO)})
        </label>
        <input
          type="range"
          min={0}
          max={maxO}
          step={0.5}
          value={op.o}
          onChange={(e) => update(op.id, { o: +e.target.value })}
        />
      </div>

      <p className="hint">Drag the opening directly on the plan to reposition it.</p>
    </div>
  );
}
