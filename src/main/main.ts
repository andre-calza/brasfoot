import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getDatabase } from "../database/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#101318",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173");
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  getDatabase();
  ipcMain.handle("save-career", (_event, career) => {
    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO careers VALUES (@id, @coachName, @teamId, @difficulty, @reputation, @federationTrust, @squadMorale, @seasonYear)
    `).run(career);
    return { ok: true };
  });

  ipcMain.handle("load-careers", () => {
    return getDatabase().prepare("SELECT * FROM careers ORDER BY season_year DESC").all();
  });

  ipcMain.handle("save-match", (_event, match) => {
    getDatabase().prepare(`
      INSERT INTO matches VALUES (@id, @careerId, @teamA, @teamB, @goalsA, @goalsB, @phase, @playedAt, @payload)
    `).run({
      id: crypto.randomUUID(),
      careerId: match.careerId ?? null,
      teamA: match.teamA.id,
      teamB: match.teamB.id,
      goalsA: match.goalsA,
      goalsB: match.goalsB,
      phase: match.phase ?? "Amistoso",
      playedAt: new Date().toISOString(),
      payload: JSON.stringify(match)
    });
    return { ok: true };
  });

  ipcMain.handle("save-game", (_event, snapshot) => {
    getDatabase().prepare(`
      INSERT OR REPLACE INTO save_games VALUES (@id, @careerId, @savedAt, @payload)
    `).run({
      id: snapshot.career.id,
      careerId: snapshot.career.id,
      savedAt: snapshot.savedAt,
      payload: JSON.stringify(snapshot)
    });
    return { ok: true };
  });

  ipcMain.handle("load-latest-game", () => {
    const row = getDatabase().prepare("SELECT payload FROM save_games ORDER BY saved_at DESC LIMIT 1").get() as { payload: string } | undefined;
    return row ? JSON.parse(row.payload) : null;
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
