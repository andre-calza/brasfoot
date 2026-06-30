import type { Player, Position, Team, Tier } from "../types/game.js";

const teamRows: Array<[string, string, Tier, number, string]> = [
  ["Brasil", "America do Sul", "S", 94, "Semifinal"],
  ["Franca", "Europa", "S", 93, "Semifinal"],
  ["Argentina", "America do Sul", "S", 92, "Semifinal"],
  ["Alemanha", "Europa", "S", 90, "Semifinal"],
  ["Espanha", "Europa", "S", 90, "Semifinal"],
  ["Inglaterra", "Europa", "S", 89, "Semifinal"],
  ["Portugal", "Europa", "S", 88, "Semifinal"],
  ["Holanda", "Europa", "A", 86, "Quartas"],
  ["Belgica", "Europa", "A", 85, "Quartas"],
  ["Croacia", "Europa", "A", 84, "Quartas"],
  ["Uruguai", "America do Sul", "A", 84, "Quartas"],
  ["Italia", "Europa", "A", 83, "Quartas"],
  ["Colombia", "America do Sul", "A", 82, "Quartas"],
  ["Marrocos", "Africa", "A", 81, "Oitavas"],
  ["Japao", "Asia", "A", 82, "Quartas"],
  ["Mexico", "America do Norte", "B", 77, "Fase de 32"],
  ["Estados Unidos", "America do Norte", "B", 78, "Fase de 32"],
  ["Suica", "Europa", "B", 79, "Fase de 32"],
  ["Dinamarca", "Europa", "B", 78, "Fase de 32"],
  ["Senegal", "Africa", "B", 77, "Fase de 32"],
  ["Servia", "Europa", "B", 76, "Fase de 32"],
  ["Coreia do Sul", "Asia", "B", 76, "Fase de 32"],
  ["Equador", "America do Sul", "B", 76, "Fase de 32"],
  ["Chile", "America do Sul", "B", 74, "Fase de 32"],
  ["Nigeria", "Africa", "B", 75, "Fase de 32"],
  ["Canada", "America do Norte", "C", 72, "Competir"],
  ["Australia", "Oceania", "C", 72, "Competir"],
  ["Paraguai", "America do Sul", "C", 73, "Competir"],
  ["Tunisia", "Africa", "C", 71, "Competir"],
  ["Costa Rica", "America do Norte", "C", 69, "Competir"],
  ["Gana", "Africa", "C", 72, "Competir"],
  ["Camaroes", "Africa", "C", 72, "Competir"],
  ["Argelia", "Africa", "C", 73, "Competir"],
  ["Turquia", "Europa", "C", 74, "Competir"],
  ["Polonia", "Europa", "C", 75, "Competir"],
  ["Suecia", "Europa", "C", 75, "Competir"],
  ["Noruega", "Europa", "C", 75, "Competir"],
  ["Curacao", "America do Norte", "D", 55, "Campanha digna"],
  ["Panama", "America do Norte", "D", 56, "Campanha digna"],
  ["Cabo Verde", "Africa", "D", 58, "Campanha digna"],
  ["Nova Zelandia", "Oceania", "D", 60, "Campanha digna"],
  ["Catar", "Asia", "D", 61, "Campanha digna"],
  ["Arabia Saudita", "Asia", "D", 64, "Campanha digna"],
  ["Iraque", "Asia", "D", 62, "Campanha digna"],
  ["Jordania", "Asia", "D", 60, "Campanha digna"],
  ["Haiti", "America do Norte", "D", 54, "Campanha digna"],
  ["Africa do Sul", "Africa", "D", 63, "Campanha digna"],
  ["Uzbequistao", "Asia", "D", 65, "Campanha digna"]
];

const firstNames = ["Lucas", "Mateo", "Rafael", "Nico", "Andre", "Bruno", "Caio", "Diego", "Emil", "Felix", "Hugo", "Ivan", "Joao", "Leo", "Marco", "Noah", "Oscar", "Paulo", "Rui", "Tomas"];
const lastNames = ["Silva", "Costa", "Rocha", "Mendes", "Alves", "Moreira", "Ferreira", "Ramos", "Lima", "Vidal", "Reis", "Nunes", "Pinto", "Castro", "Santos", "Teixeira"];
const positions: Position[] = ["GK", "GK", "GK", "DEF", "DEF", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD", "FWD", "FWD", "GK", "DEF", "DEF", "MID", "MID", "MID", "FWD", "DEF", "MID"];

function idFromName(name: string) {
  return name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function tierFloor(tier: Tier) {
  const floors: Record<Tier, number> = { S: 78, A: 74, B: 68, C: 62, D: 52 };
  return floors[tier];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const teams: Team[] = teamRows.map(([name, continent, tier, teamStrength, goal], index) => ({
  id: idFromName(name),
  name,
  continent,
  group: String.fromCharCode(65 + Math.floor(index / 4)),
  tier,
  teamStrength,
  federationGoal: goal,
  minimumReputation: Math.max(35, teamStrength - 25),
  style: index % 5 === 0 ? "Posse de bola" : index % 5 === 1 ? "Contra-ataque" : index % 5 === 2 ? "Pelas pontas" : index % 5 === 3 ? "Pelo meio" : "Jogo direto"
}));

export function generatePlayersForTeam(team: Team): Player[] {
  const floor = tierFloor(team.tier);
  return positions.map((position, index) => {
    const starterBias = index < 18 ? 5 : 0;
    const variance = ((index * 7 + team.name.length * 3) % 12) - 5;
    const overall = clamp(Math.round(floor + (team.teamStrength - 60) * 0.45 + starterBias + variance), floor, Math.min(94, team.teamStrength + 3));
    const name = `${firstNames[(index + team.name.length) % firstNames.length]} ${lastNames[(index * 3 + team.name.length) % lastNames.length]}`;
    return {
      id: `${team.id}-${index + 1}`,
      name,
      country: team.name,
      age: 18 + ((index * 5 + team.name.length) % 18),
      position,
      overall,
      attack: clamp(overall + (position === "FWD" ? 7 : position === "MID" ? 3 : -4), 35, 96),
      defense: clamp(overall + (position === "DEF" || position === "GK" ? 7 : -3), 35, 96),
      passing: clamp(overall + (position === "MID" ? 6 : 0), 35, 96),
      speed: clamp(overall + ((index % 4) - 1), 35, 96),
      finishing: clamp(overall + (position === "FWD" ? 8 : -5), 35, 96),
      stamina: clamp(overall + ((index % 5) - 2), 35, 96),
      morale: clamp(68 + (team.teamStrength - 60) * 0.25 + (index % 9), 45, 95),
      chemistry: clamp(65 + (index % 8) + (team.tier === "S" ? 8 : 0), 45, 95),
      potential: clamp(overall + (index % 6), overall, 97),
      fitnessStatus: index % 23 === 0 ? "Cansado" : "Disponivel",
      desiredRole: index < 11 ? "Titular" : index < 20 ? "Rotacao" : "Reserva",
      likelyRetirementAge: 34 + (index % 5)
    };
  });
}

export const players: Player[] = teams.flatMap(generatePlayersForTeam);
