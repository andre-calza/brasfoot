import type { Career, CareerEvent, MatchResult, PostMatchImpact, Team } from "../types/game";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function createCareer(coachName: string, team: Team, difficulty: Career["difficulty"]): Career {
  return {
    id: crypto.randomUUID(),
    coachName: coachName.trim() || "Treinador",
    teamId: team.id,
    difficulty,
    reputation: Math.max(35, team.teamStrength - 20),
    federationTrust: 70,
    squadMorale: 72,
    seasonYear: 2026
  };
}

export function evaluateCareer(team: Team, reachedPhase: string) {
  const phaseScore: Record<string, number> = {
    "Grupos": 1,
    "Fase de 32": 2,
    "Oitavas": 3,
    "Quartas": 4,
    "Semifinal": 5,
    "Final": 6,
    "Campeao": 7
  };
  const expected: Record<Team["tier"], number> = { S: 5, A: 4, B: 2, C: 2, D: 1 };
  const delta = phaseScore[reachedPhase] - expected[team.tier];
  return {
    reputationDelta: delta >= 0 ? 6 + delta * 3 : delta * 5,
    trustDelta: delta >= 0 ? 8 + delta * 4 : delta * 8,
    verdict: delta >= 2 ? "Campanha historica" : delta >= 0 ? "Objetivo cumprido" : delta === -1 ? "Abaixo do esperado" : "Fracasso"
  };
}

export function calculatePostMatchImpact(career: Career, userTeam: Team, result: MatchResult): { career: Career; impact: PostMatchImpact } {
  const userIsA = result.teamA.id === userTeam.id;
  const userGoals = userIsA ? result.goalsA : result.goalsB;
  const opponentGoals = userIsA ? result.goalsB : result.goalsA;
  const opponent = userIsA ? result.teamB : result.teamA;
  const strengthGap = userTeam.teamStrength - opponent.teamStrength;
  const won = userGoals > opponentGoals || result.penalties?.winner === (userIsA ? "A" : "B");
  const lost = userGoals < opponentGoals || (result.penalties && result.penalties.winner !== (userIsA ? "A" : "B"));
  const drew = !won && !lost;

  let moraleDelta = 0;
  let trustDelta = 0;
  let reputationDelta = 0;
  let summary = "Resultado dentro do esperado.";

  if (won) {
    moraleDelta = strengthGap < -10 ? 9 : strengthGap < 0 ? 6 : 4;
    trustDelta = strengthGap < -10 ? 10 : strengthGap < 0 ? 7 : 4;
    reputationDelta = strengthGap < -10 ? 4 : strengthGap < 0 ? 2 : 1;
    summary = strengthGap < -10 ? "Vitoria enorme contra uma selecao superior." : "Vitoria importante para a campanha.";
  } else if (drew) {
    moraleDelta = strengthGap < -10 ? 4 : strengthGap > 10 ? -3 : 1;
    trustDelta = strengthGap < -10 ? 3 : strengthGap > 10 ? -4 : 0;
    reputationDelta = strengthGap < -15 ? 1 : 0;
    summary = strengthGap > 10 ? "Empate frustrante contra um rival inferior." : "Empate aceitavel pelo contexto.";
  } else {
    moraleDelta = strengthGap > 10 ? -8 : strengthGap > 0 ? -5 : -3;
    trustDelta = strengthGap > 10 ? -10 : strengthGap > 0 ? -6 : -3;
    reputationDelta = strengthGap > 10 ? -3 : strengthGap > 0 ? -2 : -1;
    summary = strengthGap > 10 ? "Derrota pesada para a confianca da federacao." : "Derrota que pressiona o elenco.";
  }

  return {
    impact: { moraleDelta, trustDelta, reputationDelta, summary },
    career: {
      ...career,
      squadMorale: clamp(career.squadMorale + moraleDelta, 0, 100),
      federationTrust: clamp(career.federationTrust + trustDelta, 0, 100),
      reputation: clamp(career.reputation + reputationDelta, 0, 100)
    }
  };
}

export function randomEvent() {
  const events = [
    "Jogador jovem se destaca no treino: moral +2",
    "Imprensa critica a convocacao: confianca -2",
    "Estrela quer ser titular: moral -3 se ficar no banco",
    "Recuperacao fisica acima do esperado: cansaco reduzido",
    "Chuva forte antes da partida: jogo direto ganha valor",
    "Desgaste por viagem: resistencia do elenco cai levemente"
  ];
  return events[Math.floor(Math.random() * events.length)];
}

export function generateCareerEvent(): CareerEvent {
  const templates: Array<Omit<CareerEvent, "id">> = [
    {
      title: "Lesao durante treino",
      description: "Um jogador importante sentiu dores e o elenco ficou mais cauteloso.",
      moraleDelta: -3,
      trustDelta: -1,
      reputationDelta: 0,
      category: "Treino"
    },
    {
      title: "Estrela quer ser titular",
      description: "A imprensa repercutiu a insatisfacao de uma lideranca do elenco.",
      moraleDelta: -4,
      trustDelta: -2,
      reputationDelta: 0,
      category: "Elenco"
    },
    {
      title: "Jovem se destaca",
      description: "Um reserva treinou muito bem e aumentou a competitividade interna.",
      moraleDelta: 3,
      trustDelta: 1,
      reputationDelta: 1,
      category: "Treino"
    },
    {
      title: "Imprensa critica convocacao",
      description: "Analistas questionaram escolhas do treinador antes da proxima partida.",
      moraleDelta: -1,
      trustDelta: -3,
      reputationDelta: -1,
      category: "Imprensa"
    },
    {
      title: "Recuperacao acima do esperado",
      description: "A preparacao fisica trouxe boa resposta depois da ultima rodada.",
      moraleDelta: 2,
      trustDelta: 2,
      reputationDelta: 0,
      category: "Fisico"
    },
    {
      title: "Chuva forte prevista",
      description: "O gramado pesado deve favorecer jogo direto e partidas mais brigadas.",
      moraleDelta: 0,
      trustDelta: 0,
      reputationDelta: 0,
      category: "Clima"
    },
    {
      title: "Desgaste por viagem",
      description: "A logistica pesou e parte do elenco chega menos inteiro.",
      moraleDelta: -2,
      trustDelta: -1,
      reputationDelta: 0,
      category: "Viagem"
    }
  ];
  const event = templates[Math.floor(Math.random() * templates.length)];
  return { ...event, id: crypto.randomUUID() };
}

export function applyCareerEvent(career: Career, event: CareerEvent): Career {
  return {
    ...career,
    squadMorale: clamp(career.squadMorale + event.moraleDelta, 0, 100),
    federationTrust: clamp(career.federationTrust + event.trustDelta, 0, 100),
    reputation: clamp(career.reputation + event.reputationDelta, 0, 100)
  };
}
