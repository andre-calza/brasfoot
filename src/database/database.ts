import Database from "better-sqlite3";
import { app } from "electron";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { players, teams } from "./seedData.js";
import { schema } from "./schema.js";

let db: Database.Database | undefined;

export function getDatabase() {
  if (db) return db;
  const dbPath = join(app.getPath("userData"), "world-coach.sqlite");
  mkdirSync(dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(schema);
  seedDatabase(db);
  return db;
}

function seedDatabase(database: Database.Database) {
  const teamCount = database.prepare("SELECT COUNT(*) as count FROM teams").get() as { count: number };
  if (teamCount.count > 0) return;

  const insertTeam = database.prepare(`
    INSERT INTO teams VALUES (@id, @name, @continent, @group, @tier, @teamStrength, @federationGoal, @minimumReputation, @style)
  `);
  const insertPlayer = database.prepare(`
    INSERT INTO players VALUES (@id, @name, @country, @age, @position, @overall, @attack, @defense, @passing, @speed, @finishing, @stamina, @morale, @chemistry, @potential, @fitnessStatus, @desiredRole, @likelyRetirementAge)
  `);

  const tx = database.transaction(() => {
    teams.forEach((team) => insertTeam.run(team));
    players.forEach((player) => insertPlayer.run(player));
  });
  tx();
}
