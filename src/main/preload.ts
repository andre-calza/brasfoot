import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("worldCoach", {
  saveCareer: (career: unknown) => ipcRenderer.invoke("save-career", career),
  loadCareers: () => ipcRenderer.invoke("load-careers"),
  saveMatch: (match: unknown) => ipcRenderer.invoke("save-match", match),
  saveGame: (snapshot: unknown) => ipcRenderer.invoke("save-game", snapshot),
  loadLatestGame: () => ipcRenderer.invoke("load-latest-game")
});
