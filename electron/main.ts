/* eslint-disable @typescript-eslint/no-var-requires */
import windowStateManager = require("electron-window-state");
import { app, BrowserWindow, ipcMain, shell } from "electron";
import serve = require("electron-serve");
import * as path from "path";

// Load express server
import "./express";
import { server } from "./express";

app.disableHardwareAcceleration();

try {
  require("electron-reloader")(module);
} catch (e) {
  console.error(e);
}

const serveURL = serve({ directory: "dist/www" });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;

let mainWindow: BrowserWindow | null;

function createWindow() {
  const windowState = windowStateManager({});

  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    minWidth: 1400,
    minHeight: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      spellcheck: false,
      devTools: dev,
      preload: path.join(__dirname, "preload.js"),
    },
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
  });

  windowState.manage(mainWindow);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("close", () => {
    windowState.saveState(mainWindow);
  });

  const handleRedirect = (e: Event, url: string) => {
    e.preventDefault();
    shell.openExternal(url);
  };

  mainWindow.webContents.on("will-navigate", handleRedirect);

  return mainWindow;
}

function loadVite(port: number | string) {
  if (!mainWindow) return;
  mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
    console.log("Error loading URL, retrying", e);
    setTimeout(() => {
      loadVite(port);
    }, 200);
  });
}

function createMainWindow() {
  mainWindow = createWindow();
  mainWindow.once("close", () => {
    mainWindow = null;
  });

  if (dev) loadVite(port);
  else serveURL(mainWindow);
}

app.once("ready", createMainWindow);

app.on("activate", () => {
  if (!mainWindow) {
    createMainWindow();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    server.close();
  }
});

ipcMain.on("to-main", (_event, count) => {
  if (!mainWindow) return;
  return mainWindow.webContents.send("from-main", `next count is ${count + 1}`);
});
