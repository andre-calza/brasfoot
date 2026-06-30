/// <reference types="vite/client" />

interface Window {
  worldCoach?: {
    saveCareer: (career: unknown) => Promise<{ ok: boolean }>;
    loadCareers: () => Promise<unknown[]>;
    saveMatch: (match: unknown) => Promise<{ ok: boolean }>;
    saveGame: (snapshot: unknown) => Promise<{ ok: boolean }>;
    loadLatestGame: () => Promise<unknown | null>;
  };
}
