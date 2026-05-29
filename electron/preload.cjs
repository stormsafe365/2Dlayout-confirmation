// Minimal preload — the layout builder is fully client-side, so we don't
// expose any privileged Node APIs to the renderer. Kept for future use
// (e.g. native file save dialogs for direct PDF export).
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("stormsafe", {
  platform: process.platform,
  version: process.versions.electron,
});
