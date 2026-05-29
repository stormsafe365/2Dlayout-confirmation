import { motion } from "framer-motion";
import useStore from "../store";

export default function AppBar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const reset = useStore((s) => s.reset);

  return (
    <header className="appbar">
      <div className="brand">
        <div className="wm">
          Storm<span>Safe</span> · Layout
        </div>
        <div className="tl">Approval Builder</div>
      </div>

      <div className="modeswitch" role="tablist" aria-label="Sheet mode">
        <button
          role="tab"
          aria-selected={mode === "builder"}
          className={mode === "builder" ? "on" : ""}
          onClick={() => setMode("builder")}
        >
          Builder
        </button>
        <button
          role="tab"
          aria-selected={mode === "approval"}
          className={mode === "approval" ? "on" : ""}
          onClick={() => setMode("approval")}
        >
          Approval Sheet
        </button>
        {mode === "builder" ? (
          <motion.span
            layoutId="modePill"
            className="mode-pill"
            style={{ width: "calc(50% - 3px)" }}
            transition={{ type: "spring", duration: 0.32, bounce: 0.12 }}
          />
        ) : (
          <motion.span
            layoutId="modePill"
            className="mode-pill"
            style={{ width: "calc(50% - 3px)", left: "auto", right: 3 }}
            transition={{ type: "spring", duration: 0.32, bounce: 0.12 }}
          />
        )}
      </div>

      <div className="right">
        <motion.button
          className="btn"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.18 }}
          onClick={() => {
            if (confirm("Reset to the example layout?")) reset();
          }}
        >
          Reset
        </motion.button>
        <motion.button
          className="btn btn-go"
          whileHover={{ y: -1, boxShadow: "0 10px 32px rgba(34,211,200,.35)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.18 }}
          onClick={() => {
            // approval mode gives the cleanest print output
            if (mode !== "approval") setMode("approval");
            setTimeout(() => window.print(), 60);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v14" />
            <path d="m5 12 7 7 7-7" />
            <path d="M5 21h14" />
          </svg>
          Export PDF
        </motion.button>
      </div>
    </header>
  );
}
