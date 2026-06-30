import { useMemo, useState } from "react";
import { createCareer } from "../services/careerService";
import type { Career, Team } from "../types/game";
import { TopBar } from "../components/TopBar";

interface Props {
  teams: Team[];
  onCreate: (career: Career) => void;
  onBack: () => void;
}

export function CareerCreationPage({ teams, onCreate, onBack }: Props) {
  const [coachName, setCoachName] = useState("Andre");
  const [teamId, setTeamId] = useState("brasil");
  const [difficulty, setDifficulty] = useState<Career["difficulty"]>("Normal");
  const team = useMemo(() => teams.find((item) => item.id === teamId) ?? teams[0], [teamId, teams]);

  return (
    <>
      <TopBar onBack={onBack} />
      <main className="page-grid two">
        <section className="panel">
          <h2>Criacao de carreira</h2>
          <label>Nome do treinador<input value={coachName} onChange={(event) => setCoachName(event.target.value)} /></label>
          <label>Selecao inicial<select value={teamId} onChange={(event) => setTeamId(event.target.value)}>{teams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Dificuldade<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Career["difficulty"])}><option>Normal</option><option>Desafiador</option><option>Realista</option></select></label>
          <button onClick={() => onCreate(createCareer(coachName, team, difficulty))}>Comecar carreira</button>
        </section>
        <section className="panel highlight">
          <h2>{team.name}</h2>
          <div className="badge-row"><span>Tier {team.tier}</span><span>{team.continent}</span><span>Grupo {team.group}</span></div>
          <p>Objetivo da federacao: <strong>{team.federationGoal}</strong></p>
          <p>Reputacao inicial estimada: <strong>{Math.max(35, team.teamStrength - 20)}</strong></p>
          <p>Estilo tipico: <strong>{team.style}</strong></p>
        </section>
      </main>
    </>
  );
}
