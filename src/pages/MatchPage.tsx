import { useMemo, useState } from "react";
import { simulateMatch } from "../game-engine/matchSimulator";
import { TopBar } from "../components/TopBar";
import type { Career, MatchResult, Player, PostMatchImpact, Tactic, Team } from "../types/game";

interface Props {
  career: Career;
  userTeam: Team;
  teamA: Team;
  teamB: Team;
  fixtureId?: string;
  playersA: Player[];
  playersB: Player[];
  tacticA: Tactic;
  tacticB: Tactic;
  onBack: () => void;
  onMatchPlayed?: (fixtureId: string | undefined, result: MatchResult) => PostMatchImpact | undefined;
}

export function MatchPage({ career, userTeam, teamA, teamB, fixtureId, playersA, playersB, tacticA, tacticB, onBack, onMatchPlayed }: Props) {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [impact, setImpact] = useState<PostMatchImpact | null>(null);
  const [match] = useState({ teamA, teamB, fixtureId, playersA, playersB, tacticA, tacticB });
  const subtitle = useMemo(() => `${match.teamA.name} x ${match.teamB.name}`, [match.teamA.name, match.teamB.name]);

  function play() {
    const result = simulateMatch(match.teamA, match.teamB, match.playersA, match.playersB, match.tacticA, match.tacticB, match.fixtureId ? !match.fixtureId.startsWith("group-") : false);
    setResult(result);
    setImpact(onMatchPlayed?.(match.fixtureId, result) ?? null);
    window.worldCoach?.saveMatch({ ...result, careerId: career.id, phase: match.fixtureId?.startsWith("group-") ? "Grupos" : "Mata-mata" });
  }

  return (
    <>
      <TopBar career={career} team={userTeam} onBack={onBack} />
      <main className="page-grid two">
        <section className="panel">
          <h2>{subtitle}</h2>
          <button onClick={play} disabled={Boolean(result)}>Simular partida</button>
          {result ? (
            <div className="scoreboard">
              <strong>{result.goalsA} x {result.goalsB}</strong>
              <span>{result.penalties ? `Penaltis: ${result.penalties.goalsA} x ${result.penalties.goalsB}` : "Tempo normal"}</span>
            </div>
          ) : null}
          {result ? (
            <div className="stats-list">
              <span>Posse: {result.stats.possessionA}% - {result.stats.possessionB}%</span>
              <span>Finalizacoes: {result.stats.shotsA} - {result.stats.shotsB}</span>
              <span>No alvo: {result.stats.shotsOnTargetA} - {result.stats.shotsOnTargetB}</span>
              <span>xG: {result.stats.xgA} - {result.stats.xgB}</span>
            </div>
          ) : null}
          {impact ? (
            <div className="impact-box">
              <strong>{impact.summary}</strong>
              <span>Moral {impact.moraleDelta >= 0 ? "+" : ""}{impact.moraleDelta}</span>
              <span>Confianca {impact.trustDelta >= 0 ? "+" : ""}{impact.trustDelta}</span>
              <span>Reputacao {impact.reputationDelta >= 0 ? "+" : ""}{impact.reputationDelta}</span>
            </div>
          ) : null}
        </section>
        <section className="panel timeline-panel">
          <h2>Timeline</h2>
          <div className="timeline">
            {(result?.events ?? [{ minute: 0, type: "info" as const, text: "A partida ainda nao foi simulada." }]).map((event, index) => (
              <div key={`${event.minute}-${index}`} className={`event ${event.type}`}>
                <time>{event.minute}'</time>
                <span>{event.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
