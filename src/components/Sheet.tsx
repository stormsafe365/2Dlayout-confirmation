import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import useStore from "../store";
import { todayString } from "../format";
import SpecBar from "./SpecBar";
import Plan from "./Plan";
import Legend from "./Legend";
import Schedule from "./Schedule";
import Approval from "./Approval";

export default function Sheet() {
  const mode = useStore((s) => s.mode);
  const doc = useStore((s) => s.doc);
  const date = useMemo(() => todayString(), []);

  const docFields = [
    { wide: true,  label: "Customer",    val: doc.customer.trim() },
    { wide: false, label: "Quote no.",   val: doc.quote.trim() },
    { wide: false, label: "Date",        val: date },
    { wide: true,  label: "Job address", val: doc.address.trim() },
    { wide: false, label: "Phone",       val: doc.phone.trim() },
    { wide: false, label: "Sales rep",   val: doc.rep.trim() },
  ].filter((f) => f.val);

  return (
    <motion.div
      className="sheet"
      layout
      transition={{ type: "spring", duration: 0.5, bounce: 0.12 }}
    >
      <AnimatePresence initial={false}>
        {mode === "approval" && (
          <motion.div
            key="dochead"
            className="dochead"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="bk">
              Storm<span>Safe</span> Steel
              <small>Hurricane-Rated Steel Buildings · West Palm Beach, FL · 561-771-5555</small>
            </div>
            <div className="dt">
              <div className="ti">Building Layout Approval</div>
              <div>{date}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {mode === "approval" && docFields.length > 0 && (
          <motion.div
            key="docinfo"
            className="docinfo"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            {docFields.map((f, i) => (
              <div key={i} className={`c${f.wide ? " w" : ""}`}>
                <label>{f.label}</label>
                <div className="v">{f.val}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <SpecBar />

      <div className="sbody">
        <Plan />

        <Legend />

        <div className="sched-head">
          <h3>Opening Schedule</h3>
          <div className="note">Tags match plan callouts</div>
        </div>
        <Schedule />

        <AnimatePresence initial={false}>
          {mode === "approval" && (
            <motion.div
              key="approve"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <Approval />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
