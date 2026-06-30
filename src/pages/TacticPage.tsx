import { TopBar } from "../components/TopBar";
import type { Career, Formation, Mentality, PlayStyle, Pressure, Tactic, Team } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  tactic: Tactic;
  onChange: (tactic: Tactic) => void;
  onBack: () => void;
}

export function TacticPage({ career, team, tactic, onChange, onBack }: Props) {
  const set = <K extends keyof Tactic>(key: K, value: Tactic[K]) => onChange({ ...tactic, [key]: value });
  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid two">
        <section className="panel">
          <h2>Tatica</h2>
          <label>Formacao<select value={tactic.formation} onChange={(e) => set("formation", e.target.value as Formation)}><option>4-3-3</option><option>4-4-2</option><option>3-5-2</option><option>5-3-2</option></select></label>
          <label>Mentalidade<select value={tactic.mentality} onChange={(e) => set("mentality", e.target.value as Mentality)}><option>Ultra defensiva</option><option>Defensiva</option><option>Equilibrada</option><option>Ofensiva</option><option>Tudo ao ataque</option></select></label>
          <label>Estilo<select value={tactic.playStyle} onChange={(e) => set("playStyle", e.target.value as PlayStyle)}><option>Posse de bola</option><option>Contra-ataque</option><option>Pelas pontas</option><option>Pelo meio</option><option>Jogo direto</option></select></label>
          <label>Pressao<select value={tactic.pressure} onChange={(e) => set("pressure", e.target.value as Pressure)}><option>Baixa</option><option>Media</option><option>Alta</option></select></label>
        </section>
        <section className="panel highlight">
          <h2>Impacto</h2>
          <p>Contra-ataque favorece selecoes mais fracas contra favoritas.</p>
          <p>Pressao alta aumenta roubo de bola e tambem o desgaste.</p>
          <p>Postura ofensiva cria mais chances e expoe a defesa.</p>
        </section>
      </main>
    </>
  );
}
