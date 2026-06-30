export const schema = `
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  continent TEXT NOT NULL,
  group_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  team_strength INTEGER NOT NULL,
  federation_goal TEXT NOT NULL,
  minimum_reputation INTEGER NOT NULL,
  style TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  age INTEGER NOT NULL,
  position TEXT NOT NULL,
  overall INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  passing INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  finishing INTEGER NOT NULL,
  stamina INTEGER NOT NULL,
  morale INTEGER NOT NULL,
  chemistry INTEGER NOT NULL,
  potential INTEGER NOT NULL,
  fitness_status TEXT NOT NULL,
  desired_role TEXT NOT NULL,
  likely_retirement_age INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS careers (
  id TEXT PRIMARY KEY,
  coach_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  reputation INTEGER NOT NULL,
  federation_trust INTEGER NOT NULL,
  squad_morale INTEGER NOT NULL,
  season_year INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  career_id TEXT,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  goals_a INTEGER NOT NULL,
  goals_b INTEGER NOT NULL,
  phase TEXT NOT NULL,
  played_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS save_games (
  id TEXT PRIMARY KEY,
  career_id TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  payload TEXT NOT NULL
);
`;
