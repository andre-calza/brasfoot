import { TopBar } from "../components/TopBar";
import { StatCard } from "../components/StatCard";
import type { Career, Player, Team } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  squad: Player[];
  starters: string[];
  onChange: (ids: string[]) => void;
  onBack: () => void;
}

export function LineupPage({ career, team, squad, starters, onChange, onBack }: Props) {
  const starterPlayers = squad.filter((player) => starters.includes(player.id));
  const avg = starterPlayers.length ? Math.round(starterPlayers.reduce((sum, player) => sum + player.overall, 0) / starterPlayers.length) : 0;
  const chemistry = starterPlayers.length ? Math.round(starterPlayers.reduce((sum, player) => sum + player.chemistry, 0) / starterPlayers.length) : 0;
  const hasGoalkeeper = starterPlayers.some((player) => player.position === "GK");

  function toggle(id: string) {
    if (starters.includes(id)) onChange(starters.filter((item) => item !== id));
    else if (starters.length < 11) onChange([...starters, id]);
  }

  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid">
        <section className="stats-grid full">
          <StatCard label="Titulares" value={`${starters.length}/11`} tone={starters.length === 11 ? "good" : "warn"} />
          <StatCard label="Goleiro titular" value={hasGoalkeeper ? "Sim" : "Nao"} tone={hasGoalkeeper ? "good" : "bad"} />
          <StatCard label="Overall medio" value={avg} />
          <StatCard label="Entrosamento" value={chemistry} />
        </section>
        <section className="panel wide">
          <h2>Escalacao</h2>
          <div className="table">
            {squad.sort((a, b) => b.overall - a.overall).map((player) => (
              <button key={player.id} className={`row ${starters.includes(player.id) ? "selected" : ""}`} onClick={() => toggle(player.id)}>
                <span>{player.name}</span><span>{player.position}</span><span>OVR {player.overall}</span><span>MOR {player.morale}</span><span>{player.fitnessStatus}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
