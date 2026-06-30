import { TopBar } from "../components/TopBar";
import { sortStandings } from "../services/worldCupService";
import type { Career, Standing, Team, WorldCupFixture } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  teams: Team[];
  standings: Record<string, Standing[]>;
  fixtures: WorldCupFixture[];
  onBack: () => void;
}

export function TablePage({ career, team, teams, standings, fixtures, onBack }: Props) {
  const teamById = Object.fromEntries(teams.map((item) => [item.id, item]));
  const knockoutFixtures = fixtures.filter((fixture) => fixture.phase !== "Grupos");
  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid">
        <section className="groups-grid no-padding">
          {Object.entries(standings).map(([group, rows]) => (
            <section key={group} className="panel">
              <h2>Grupo {group}</h2>
              <div className="mini-table">
                {sortStandings(rows).map((row) => {
                  const rowTeam = teams.find((item) => item.id === row.teamId);
                  return <div key={row.teamId}><strong>{rowTeam?.name}</strong><span>{row.points} pts</span><span>{row.goalsFor - row.goalsAgainst} SG</span></div>;
                })}
              </div>
            </section>
          ))}
        </section>

        <section className="panel wide">
          <h2>Mata-mata</h2>
          {knockoutFixtures.length === 0 ? (
            <p className="muted">O chaveamento sera gerado automaticamente apos a fase de grupos.</p>
          ) : (
            <div className="fixture-grid">
              {knockoutFixtures.map((fixture) => {
                const score = fixture.result ? `${fixture.result.goalsA} x ${fixture.result.goalsB}` : "x";
                return (
                  <article key={fixture.id} className={`fixture-card ${fixture.played ? "played" : ""}`}>
                    <span>{fixture.phase}</span>
                    <strong>{teamById[fixture.teamAId]?.name} <em>{score}</em> {teamById[fixture.teamBId]?.name}</strong>
                    <small>{fixture.played ? "Encerrado" : "Pendente"}</small>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
