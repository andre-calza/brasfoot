export type Tier = "S" | "A" | "B" | "C" | "D";
export type Position = "GK" | "DEF" | "MID" | "FWD";
export type Mentality = "Ultra defensiva" | "Defensiva" | "Equilibrada" | "Ofensiva" | "Tudo ao ataque";
export type PlayStyle = "Posse de bola" | "Contra-ataque" | "Pelas pontas" | "Pelo meio" | "Jogo direto";
export type Pressure = "Baixa" | "Media" | "Alta";
export type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "5-3-2";

export interface Team {
  id: string;
  name: string;
  continent: string;
  group: string;
  tier: Tier;
  teamStrength: number;
  federationGoal: string;
  minimumReputation: number;
  style: PlayStyle;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  age: number;
  position: Position;
  overall: number;
  attack: number;
  defense: number;
  passing: number;
  speed: number;
  finishing: number;
  stamina: number;
  morale: number;
  chemistry: number;
  potential: number;
  fitnessStatus: "Disponivel" | "Cansado" | "Lesionado";
  desiredRole: "Titular" | "Rotacao" | "Reserva";
  likelyRetirementAge: number;
}

export interface Tactic {
  formation: Formation;
  mentality: Mentality;
  playStyle: PlayStyle;
  pressure: Pressure;
}

export interface MatchEvent {
  minute: number;
  type: "chance" | "save" | "foul" | "yellow" | "red" | "goal" | "offside" | "injury" | "substitution" | "pressure" | "penalty" | "shootout" | "info";
  team?: string;
  text: string;
}

export interface MatchStats {
  possessionA: number;
  possessionB: number;
  shotsA: number;
  shotsB: number;
  shotsOnTargetA: number;
  shotsOnTargetB: number;
  foulsA: number;
  foulsB: number;
  yellowCardsA: number;
  yellowCardsB: number;
  redCardsA: number;
  redCardsB: number;
  xgA: number;
  xgB: number;
}

export interface MatchResult {
  teamA: Team;
  teamB: Team;
  goalsA: number;
  goalsB: number;
  winner: "A" | "B" | "draw";
  expectedResult: "favorite" | "draw" | "underdog";
  events: MatchEvent[];
  stats: MatchStats;
  penalties?: {
    goalsA: number;
    goalsB: number;
    winner: "A" | "B";
  };
  debug: SimulationDebugReport;
}

export interface SimulationDebugReport {
  effectiveStrengthA: number;
  effectiveStrengthB: number;
  winProbabilityA: number;
  drawProbability: number;
  winProbabilityB: number;
  strengthDifference: number;
  absurdScoresBlocked: number;
}

export interface Career {
  id: string;
  coachName: string;
  teamId: string;
  difficulty: "Normal" | "Desafiador" | "Realista";
  reputation: number;
  federationTrust: number;
  squadMorale: number;
  seasonYear: number;
}

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface WorldCupFixture {
  id: string;
  phase: "Grupos" | "Fase de 32" | "Oitavas" | "Quartas" | "Semifinal" | "Terceiro lugar" | "Final";
  group?: string;
  round: number;
  teamAId: string;
  teamBId: string;
  played: boolean;
  result?: MatchResult;
}

export interface WorldCupState {
  fixtures: WorldCupFixture[];
  standings: Record<string, Standing[]>;
}

export interface PostMatchImpact {
  moraleDelta: number;
  trustDelta: number;
  reputationDelta: number;
  summary: string;
}

export interface CareerEvent {
  id: string;
  title: string;
  description: string;
  moraleDelta: number;
  trustDelta: number;
  reputationDelta: number;
  category: "Treino" | "Imprensa" | "Elenco" | "Fisico" | "Clima" | "Viagem";
}

export interface GameSaveSnapshot {
  career: Career;
  squadIds: string[];
  starterIds: string[];
  tactic: Tactic;
  worldCup: WorldCupState;
  careerEvents: CareerEvent[];
  savedAt: string;
}
