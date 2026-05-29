import { AnimatePresence, motion } from "framer-motion";
import useStore from "../store";
import { ACCENTS, TYPES } from "../constants";
import type { OpeningTypeKey } from "../types";

export default function Tweaks() {
  const dir = useStore((s) => s.dir);
  const setDir = useStore((s) => s.setDir);

  const showDims = useStore((s) => s.showDims);
  const toggleDims = useStore((s) => s.toggleDims);
  const blueprint = useStore((s) => s.blueprint);
  const toggleBlueprint = useStore((s) => s.toggleBlueprint);

  const density = useStore((s) => s.density);
  const setDensity = useStore((s) => s.setDensity);
  const accent = useStore((s) => s.accent);
  const setAccent = useStore((s) => s.setAccent);

  const typeColors = useStore((s) => s.typeColors);
  const setTypeColor = useStore((s) => s.setTypeColor);
  const resetTypeColors = useStore((s) => s.resetTypeColors);

  const width = useStore((s) => s.width);
  const length = useStore((s) => s.length);
  const eave = useStore((s) => s.eave);
  const wind = useStore((s) => s.wind);
  const setBuilding = useStore((s) => s.setBuilding);

  const tweaksMin = useStore((s) => s.tweaksMin);
  const toggleTweaks = useStore((s) => s.toggleTweaks);

  return (
    <motion.aside
      className="tweaks no-print"
      data-density={density}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 28 }}
      layout
    >
      <div className="th">
        <b>Tweaks</b>
        <button onClick={toggleTweaks} aria-label={tweaksMin ? "Expand tweaks" : "Minimize tweaks"}>
          {tweaksMin ? "+" : "–"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!tweaksMin && (
          <motion.div
            key="tbody"
            className="tbody"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="tw-sec">Sheet style</div>
            <div className="tw-row">
              <span className="tw-l" style={{ margin: 0 }}>Tick mode</span>
            </div>
            <div className="tw-row">
              <select value={dir} onChange={(e) => setDir(e.target.value as "engineering" | "architectural")}>
                <option value="engineering">engineering</option>
                <option value="architectural">architectural</option>
              </select>
            </div>

            <div className="tw-l" style={{ marginTop: 14 }}>Accent</div>
            <div className="swatches">
              {ACCENTS.map(([hex, name]) => (
                <button
                  key={hex}
                  className={accent === hex ? "on" : ""}
                  style={{ background: hex }}
                  title={name}
                  aria-label={`Accent ${name}`}
                  onClick={() => {
                    setAccent(hex);
                    document.documentElement.style.setProperty("--teal", hex);
                    document.documentElement.style.setProperty("--teal-glow", `${hex}1f`);
                  }}
                />
              ))}
            </div>

            <div className="tw-l" style={{ marginTop: 14 }}>Density</div>
            <div className="seg">
              {(["compact", "regular", "comfy"] as const).map((d) => (
                <button
                  key={d}
                  className={density === d ? "on" : ""}
                  onClick={() => {
                    setDensity(d);
                    document.documentElement.setAttribute("data-density", d);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="tw-row" style={{ marginTop: 14 }}>
              <span className="tw-l" style={{ margin: 0 }}>Dimension lines</span>
              <button
                className={`toggle ${showDims ? "on" : ""}`}
                onClick={toggleDims}
                aria-pressed={showDims}
              />
            </div>
            <div className="tw-row" style={{ marginTop: 10 }}>
              <span className="tw-l" style={{ margin: 0 }}>Blueprint view</span>
              <button
                className={`toggle ${blueprint ? "on" : ""}`}
                onClick={toggleBlueprint}
                aria-pressed={blueprint}
              />
            </div>

            <div
              className="tw-sec"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              Feature colors
              <button className="del" style={{ padding: "3px 8px" }} onClick={resetTypeColors}>
                Reset
              </button>
            </div>
            <div className="colorgrid">
              {(Object.entries(TYPES) as [OpeningTypeKey, typeof TYPES.rollup][]).map(([k, v]) => (
                <label className="crow" key={k}>
                  <input
                    type="color"
                    value={typeColors[k]}
                    onChange={(e) => setTypeColor(k, e.target.value)}
                  />
                  <span>{v.label}</span>
                </label>
              ))}
            </div>

            <div className="tw-sec">Building</div>
            <Slider label="Width" value={width} unit="ft" min={8} max={120}
              onChange={(v) => setBuilding({ width: v })} />
            <Slider label="Length" value={length} unit="ft" min={8} max={200}
              onChange={(v) => setBuilding({ length: v })} />
            <Slider label="Eave height" value={eave} unit="ft" min={6} max={30}
              onChange={(v) => setBuilding({ eave: v })} />
            <Slider label="Wind rating" value={wind} unit="mph" min={100} max={250} step={5}
              onChange={(v) => setBuilding({ wind: v })} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

function Slider({
  label, value, unit, min, max, step = 1, onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <div className="tw-l">
        {label} <span>{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </>
  );
}
