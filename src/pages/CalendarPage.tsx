import { TopBar } from "../components/TopBar";
import type { Career, Team, WorldCupFixture } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  teams: Team[];
  fixtures: WorldCupFixture[];
  onBack: () => void;
  onPlayNext: () => void;
  onSimulateRound: () => void;
}

export function CalendarPage({ career, team, teams, fixtures, onBack, onPlayNext, onSimulateRound }: Props) {
  const teamById = Object.fromEntries(teams.map((item) => [item.id, item]));
  const nextUserFixture = fixtures.find((fixture) => !fixture.played && (fixture.teamAId === team.id || fixture.teamBId === team.id));
  const grouped = fixtures.reduce<Record<string, WorldCupFixture[]>>((rounds, fixture) => {
    const key = `${fixture.phase} - Rodada ${fixture.round}`;
    rounds[key] ??= [];
    rounds[key].push(fixture);
    return rounds;
  }, {});

  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid">
        <section className="panel wide">
          <div className="section-head">
            <div>
              <h2>Calendario da Copa</h2>
              <p className="muted">
                Proximo jogo: {nextUserFixture ? `${teamById[nextUserFixture.teamAId]?.name} x ${teamById[nextUserFixture.teamBId]?.name}` : "fase de grupos concluida"}
              </p>
            </div>
            <div className="button-row">
              <button className="secondary" onClick={onSimulateRound}>Simular outros jogos</button>
              <button onClick={onPlayNext} disabled={!nextUserFixture}>Jogar proximo</button>
            </div>
          </div>
        </section>

        {Object.entries(grouped).map(([round, roundFixtures]) => (
          <section key={round} className="panel wide">
            <h2>{round}</h2>
            <div className="fixture-grid">
              {roundFixtures.map((fixture) => {
                const teamA = teamById[fixture.teamAId];
                const teamB = teamById[fixture.teamBId];
                const score = fixture.result ? `${fixture.result.goalsA} x ${fixture.result.goalsB}` : "x";
                const isUserMatch = fixture.teamAId === team.id || fixture.teamBId === team.id;
                return (
                  <article key={fixture.id} className={`fixture-card ${fixture.played ? "played" : ""} ${isUserMatch ? "user-match" : ""}`}>
                    <span>Grupo {fixture.group}</span>
                    <strong>{teamA?.name} <em>{score}</em> {teamB?.name}</strong>
                    <small>{fixture.played ? "Encerrado" : "Pendente"}</small>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
