import { useEffect } from "react";
import useStore from "./store";
import AppBar from "./components/AppBar";
import Panel from "./components/Panel";
import Sheet from "./components/Sheet";
import Tweaks from "./components/Tweaks";

export default function App() {
  const mode = useStore((s) => s.mode);
  const density = useStore((s) => s.density);

  // Reflect mode + density on <body> for CSS hooks (print, hide panel).
  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);
  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  return (
    <div className="app" data-mode={mode}>
      <AppBar />
      <div className="wrap">
        <Panel />
        <main className="stage">
          <Sheet />
        </main>
      </div>
      <Tweaks />
    </div>
  );
}
