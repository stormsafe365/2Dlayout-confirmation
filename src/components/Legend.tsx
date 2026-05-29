import useStore from "../store";
import { TYPES } from "../constants";
import type { OpeningTypeKey } from "../types";

export default function Legend() {
  const openings = useStore((s) => s.openings);
  const typeColors = useStore((s) => s.typeColors);

  const counts: Partial<Record<OpeningTypeKey, number>> = {};
  openings.forEach((o) => {
    counts[o.type] = (counts[o.type] || 0) + 1;
  });
  const order = (Object.keys(TYPES) as OpeningTypeKey[]).filter((k) => counts[k]);

  return (
    <div className="legend">
      {order.length === 0 ? (
        <div className="li" style={{ color: "var(--ink-3)" }}>No openings placed</div>
      ) : (
        order.map((k) => (
          <div className="li" key={k}>
            <span className="sw" style={{ background: typeColors[k] }} />
            {TYPES[k].label} <u>×{counts[k]}</u>
          </div>
        ))
      )}
    </div>
  );
}
