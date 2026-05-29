import { AnimatePresence, motion, type Variants } from "framer-motion";
import useStore from "../store";
import { TYPES } from "../constants";
import { ft } from "../format";
import type { OpeningTypeKey } from "../types";
import Editor from "./Editor";

const fade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 + i * 0.04, // 40ms cascade — Emil: 30–80ms stagger window
      type: "spring" as const,
      duration: 0.4,
      bounce: 0.18,
    },
  }),
};

export default function Panel() {
  const width = useStore((s) => s.width);
  const length = useStore((s) => s.length);
  const eave = useStore((s) => s.eave);
  const wind = useStore((s) => s.wind);
  const pitch = useStore((s) => s.pitch);
  const setBuilding = useStore((s) => s.setBuilding);

  const doc = useStore((s) => s.doc);
  const setDoc = useStore((s) => s.setDoc);

  const notes = useStore((s) => s.notes);
  const setNotes = useStore((s) => s.setNotes);

  const openings = useStore((s) => s.openings);
  const selId = useStore((s) => s.selId);
  const select = useStore((s) => s.select);
  const add = useStore((s) => s.add);
  const typeColors = useStore((s) => s.typeColors);

  return (
    <aside className="panel no-print">
      <div className="panel-title">Layout Builder</div>
      <div className="panel-sub">
        Place openings, fine-tune sizes, then switch to Approval Sheet to review &amp; export.
      </div>

      <div className="sec">Building</div>
      <div className="g3">
        <NumField label="Width"  value={width}  unit="ft" min={8}  max={120} onChange={(v) => setBuilding({ width: v })} />
        <NumField label="Length" value={length} unit="ft" min={8}  max={200} onChange={(v) => setBuilding({ length: v })} />
        <NumField label="Eave"   value={eave}   unit="ft" min={6}  max={30}  onChange={(v) => setBuilding({ eave: v })} />
      </div>
      <div className="g2">
        <NumField label="Wind rating" value={wind} unit="mph" min={100} max={250} step={5} onChange={(v) => setBuilding({ wind: v })} />
        <div className="fld">
          <label>Roof pitch</label>
          <div className="inp">
            <input
              type="text"
              value={pitch}
              onChange={(e) => setBuilding({ pitch: e.target.value })}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="sec">Document Info</div>
      <div className="panel-sub" style={{ margin: "-6px 0 10px" }}>
        Blank fields are hidden on the approval sheet.
      </div>
      <div className="fld">
        <label>Customer</label>
        <div className="inp">
          <input
            type="text"
            placeholder="Name / company"
            value={doc.customer}
            onChange={(e) => setDoc({ customer: e.target.value })}
          />
        </div>
      </div>
      <div className="fld">
        <label>Job address</label>
        <textarea
          placeholder="Street, City, FL ZIP"
          value={doc.address}
          onChange={(e) => setDoc({ address: e.target.value })}
        />
      </div>
      <div className="g2">
        <div className="fld">
          <label>Phone</label>
          <div className="inp">
            <input
              type="text"
              placeholder="(000) 000-0000"
              value={doc.phone}
              onChange={(e) => setDoc({ phone: e.target.value })}
            />
          </div>
        </div>
        <div className="fld">
          <label>Quote no.</label>
          <div className="inp">
            <input
              type="text"
              placeholder="SS-0000"
              value={doc.quote}
              onChange={(e) => setDoc({ quote: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="fld">
        <label>Sales rep</label>
        <div className="inp">
          <input
            type="text"
            placeholder="Name"
            value={doc.rep}
            onChange={(e) => setDoc({ rep: e.target.value })}
          />
        </div>
      </div>
      <div className="fld">
        <label>Notes (optional)</label>
        <textarea
          placeholder="Door swing, wainscot, insulation, concrete, special requests…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="sec">Add Opening</div>
      <div className="addgrid">
        {(Object.entries(TYPES) as [OpeningTypeKey, typeof TYPES.rollup][]).map(([k, v], i) => (
          <motion.button
            key={k}
            className="addbtn"
            custom={i}
            initial="hidden"
            animate="show"
            variants={fade}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            onClick={() => add(k, "front", 0)}
          >
            <span className="sw" style={{ background: typeColors[k] }} />
            <span>
              <b>{v.label}</b>
              <small>{ft(v.w)} × {ft(v.h)}</small>
            </span>
          </motion.button>
        ))}
      </div>

      <div className="sec">
        Placed <span className="count">· {openings.length}</span>
      </div>
      <div className="olist">
        <AnimatePresence initial={false}>
          {openings.length === 0 ? (
            <motion.div
              key="empty"
              className="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No openings yet — add one above.
            </motion.div>
          ) : (
            openings.map((op, i) => {
              const t = TYPES[op.type];
              return (
                <motion.div
                  key={op.id}
                  layout
                  className={`oitem ${op.id === selId ? "sel" : ""}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
                  onClick={() => select(op.id === selId ? null : op.id)}
                >
                  <span className="tag" style={{ background: typeColors[op.type] }}>
                    {i + 1}
                  </span>
                  <span className="nm">{t.label}</span>
                  <span className="sz">{ft(op.w)} × {ft(op.h)}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selId !== null && (
          <motion.div
            key="editor-wrap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              height: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
              opacity: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
              // exit is snappier than enter — release should always feel fast
              default: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
            }}
            style={{ overflow: "hidden" }}
          >
            <Editor />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function NumField({
  label, value, unit, onChange, min, max, step = 1,
}: {
  label: string;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="fld">
      <label>{label}</label>
      <div className="inp">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = +e.target.value;
            if (!Number.isFinite(v)) return;
            onChange(Math.max(min, Math.min(max, v)));
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}
