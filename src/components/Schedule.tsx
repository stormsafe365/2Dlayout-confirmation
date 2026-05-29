import { AnimatePresence, motion } from "framer-motion";
import useStore from "../store";
import { TYPES, WALLS } from "../constants";
import { ft } from "../format";

export default function Schedule() {
  const openings = useStore((s) => s.openings);
  const selId = useStore((s) => s.selId);
  const select = useStore((s) => s.select);
  const typeColors = useStore((s) => s.typeColors);

  return (
    <table className="sched">
      <thead>
        <tr>
          <th style={{ width: 36 }}>#</th>
          <th>Type</th>
          <th>Wall</th>
          <th>Size (W×H)</th>
          <th>Offset to corner</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {openings.length === 0 ? (
          <tr className="sched-empty">
            <td colSpan={6}>No openings placed yet.</td>
          </tr>
        ) : (
          <AnimatePresence initial={false}>
            {openings.map((op, i) => {
              const t = TYPES[op.type];
              const w = WALLS[op.wall];
              return (
                <motion.tr
                  key={op.id}
                  layout
                  className={`row ${i % 2 === 1 ? "alt" : ""} ${op.id === selId ? "sel" : ""}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: "spring", duration: 0.34, bounce: 0.16 }}
                  onClick={() => select(op.id === selId ? null : op.id)}
                >
                  <td>
                    <span className="tg" style={{ background: typeColors[op.type] }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="ty">
                    <b>{t.label}</b>
                    <small>{t.abbr}</small>
                  </td>
                  <td>{w.label}</td>
                  <td className="mono">{ft(op.w)} × {ft(op.h)}</td>
                  <td className="mono">{ft(op.o)} from {w.ref}</td>
                  <td style={{ color: "var(--ink-3)" }}>—</td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        )}
      </tbody>
    </table>
  );
}
