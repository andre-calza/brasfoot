import { StatCard } from "../components/StatCard";
import { TopBar } from "../components/TopBar";
import type { Career, CareerEvent, Team } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  nextOpponent?: Team;
  phase: string;
  events: CareerEvent[];
  onNavigate: (view: string) => void;
  onSave: () => void;
}

export function DashboardPage({ career, team, nextOpponent, phase, events, onNavigate, onSave }: Props) {
  return (
    <>
      <TopBar career={career} team={team} />
      <main className="dashboard">
        <section className="hero-band">
          <div>
            <p className="eyebrow">Selecao atual</p>
            <h1>{team.name}</h1>
            <p>Proximo jogo: <strong>{nextOpponent?.name ?? "Aguardando tabela"}</strong></p>
          </div>
          <div className="score-token">{team.teamStrength}</div>
        </section>

        <section className="stats-grid">
          <StatCard label="Fase" value={phase} hint={`Grupo ${team.group}`} />
          <StatCard label="Moral do elenco" value={career.squadMorale} tone="good" />
          <StatCard label="Confianca" value={career.federationTrust} />
          <StatCard label="Reputacao" value={career.reputation} />
        </section>

        <section className="action-grid">
          {["Convocacao", "Escalacao", "Tatica", "Calendario", "Tabela da Copa", "Simular partida", "Estatisticas", "Debug"].map((item) => (
            <button key={item} className="secondary" onClick={() => onNavigate(item)}>{item}</button>
          ))}
          <button onClick={onSave}>Salvar jogo</button>
        </section>

        <section className="panel wide">
          <h2>Eventos recentes</h2>
          {events.length === 0 ? (
            <p className="muted">Nenhum evento entre partidas ainda.</p>
          ) : (
            <div className="event-card-grid">
              {events.slice(0, 4).map((event) => (
                <article key={event.id} className="career-event-card">
                  <span>{event.category}</span>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>
                    Moral {event.moraleDelta >= 0 ? "+" : ""}{event.moraleDelta} · Confianca {event.trustDelta >= 0 ? "+" : ""}{event.trustDelta} · Rep {event.reputationDelta >= 0 ? "+" : ""}{event.reputationDelta}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
