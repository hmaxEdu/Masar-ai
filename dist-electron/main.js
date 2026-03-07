import { app as n, BrowserWindow as i } from "electron";
import o from "node:path";
import { fileURLToPath as t } from "node:url";
const s = o.dirname(t(import.meta.url));
process.env.DIST = o.join(s, "../dist");
process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : o.join(process.env.DIST, "../public");
let e;
function r() {
  e = new i({
    icon: o.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: o.join(s, "preload.js")
    },
    width: 1200,
    height: 800
  }), e.webContents.on("did-finish-load", () => {
    e?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(o.join(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  i.getAllWindows().length === 0 && r();
});
n.whenReady().then(r);
