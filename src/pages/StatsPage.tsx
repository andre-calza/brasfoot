import { runSimulationTest } from "../game-engine/matchSimulator";
import { TopBar } from "../components/TopBar";
import type { Career, Player, Team } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  teams: Team[];
  players: Player[];
  onBack: () => void;
}

export function StatsPage({ career, team, teams, players, onBack }: Props) {
  const pairs = [["Alemanha", "Curacao"], ["Brasil", "Argentina"], ["Japao", "Marrocos"], ["Franca", "Haiti"], ["Mexico", "Estados Unidos"]];
  const reports = pairs.map(([a, b]) => {
    const teamA = teams.find((item) => item.name === a)!;
    const teamB = teams.find((item) => item.name === b)!;
    return runSimulationTest(teamA, teamB, players.filter((player) => player.country === teamA.name), players.filter((player) => player.country === teamB.name), 1000);
  });

  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid">
        <section className="panel wide">
          <h2>Teste de simulacao em massa</h2>
          <div className="table">
            {reports.map((report) => (
              <div key={report.matchup} className="row static">
                <strong>{report.matchup}</strong>
                <span>A {report.winsA}%</span>
                <span>E {report.draws}%</span>
                <span>B {report.winsB}%</span>
                <span>Maior {report.biggestScore}</span>
                <span>Gols {report.averageGoals}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
