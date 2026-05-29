// Electron main process for StormSafe Layout Builder.
// In dev (VITE_DEV_SERVER_URL set), loads the running Vite server.
// In production, loads the built dist/index.html via file://.

const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("node:path");

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 980,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#08121d",
    title: "StormSafe Layout Builder",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Open any external links (mailto:, http://) in the system browser instead.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  // Hide the default Edit/View menu — the app provides its own UI.
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
