import { players, teams } from "../database/seedData";
import { runSimulationTest } from "./matchSimulator";

const matchups = [
  ["Alemanha", "Curacao"],
  ["Brasil", "Argentina"],
  ["Japao", "Marrocos"],
  ["Franca", "Haiti"],
  ["Mexico", "Estados Unidos"]
];

const reports = matchups.map(([a, b]) => {
  const teamA = teams.find((team) => team.name === a);
  const teamB = teams.find((team) => team.name === b);
  if (!teamA || !teamB) throw new Error(`Selecao nao encontrada: ${a} x ${b}`);
  return runSimulationTest(
    teamA,
    teamB,
    players.filter((player) => player.country === teamA.name),
    players.filter((player) => player.country === teamB.name)
  );
});

console.table(reports);
