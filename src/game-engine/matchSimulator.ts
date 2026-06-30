import type { MatchEvent, MatchResult, MatchStats, Player, SimulationDebugReport, Tactic, Team } from "../types/game";

const defaultTactic: Tactic = {
  formation: "4-3-3",
  mentality: "Equilibrada",
  playStyle: "Posse de bola",
  pressure: "Media"
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 70;
}

function tacticBonus(team: Team, tactic: Tactic, opponentStrength: number) {
  let bonus = 0;
  if (team.style === tactic.playStyle) bonus += 2.5;
  if (tactic.mentality === "Ofensiva") bonus += team.teamStrength >= opponentStrength ? 1.5 : -0.5;
  if (tactic.mentality === "Tudo ao ataque") bonus += team.teamStrength >= opponentStrength ? 1 : -2.5;
  if (tactic.mentality === "Defensiva") bonus += team.teamStrength < opponentStrength ? 1.5 : -0.5;
  if (tactic.mentality === "Ultra defensiva") bonus += team.teamStrength < opponentStrength ? 1 : -1.5;
  if (tactic.playStyle === "Contra-ataque" && team.teamStrength < opponentStrength) bonus += 3;
  if (tactic.playStyle === "Posse de bola" && team.teamStrength > opponentStrength) bonus += 2;
  if (tactic.playStyle === "Jogo direto") bonus += team.teamStrength < opponentStrength ? 1.5 : -0.5;
  if (tactic.pressure === "Alta") bonus += 1.5;
  if (tactic.pressure === "Baixa") bonus -= 0.5;
  return bonus;
}

export function calculateEffectiveStrength(team: Team, players: Player[], tactic = defaultTactic, opponentStrength = 75, knockout = false) {
  const starters = players.slice().sort((a, b) => b.overall - a.overall).slice(0, 11);
  const averageStartingOverall = average(starters.map((player) => player.overall));
  const morale = average(starters.map((player) => player.morale));
  const chemistry = average(starters.map((player) => player.chemistry));
  const fatiguePenalty = starters.filter((player) => player.fitnessStatus === "Cansado").length * 0.8 + starters.filter((player) => player.fitnessStatus === "Lesionado").length * 2.5;
  const emotionalPenalty = knockout && team.tier === "D" ? 1.2 : knockout && team.tier === "S" ? 0.4 : 0.8;
  return clamp(
    team.teamStrength * 0.35 + averageStartingOverall * 0.4 + morale * 0.1 + chemistry * 0.1 + tacticBonus(team, tactic, opponentStrength) * 0.05 - fatiguePenalty - emotionalPenalty,
    35,
    99
  );
}

export function calculateWinProbabilities(strengthA: number, strengthB: number) {
  const diff = Math.abs(strengthA - strengthB);
  const aFavorite = strengthA >= strengthB;
  let favorite = 0.4;
  let draw = 0.3;
  let underdog = 0.3;

  if (diff >= 6 && diff <= 12) {
    favorite = 0.55;
    draw = 0.25;
    underdog = 0.2;
  } else if (diff >= 13 && diff <= 22) {
    favorite = 0.7;
    draw = 0.2;
    underdog = 0.1;
  } else if (diff > 23) {
    favorite = 0.87;
    draw = 0.1;
    underdog = 0.03;
  }

  return {
    winProbabilityA: aFavorite ? favorite : underdog,
    drawProbability: draw,
    winProbabilityB: aFavorite ? underdog : favorite,
    strengthDifference: diff
  };
}

function pickWeighted<T>(items: Array<[T, number]>) {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [item, weight] of items) {
    roll -= weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1][0];
}

export function generateScore(homeTeam: Team, awayTeam: Team, expectedResult: "A" | "B" | "draw", strengthDifference = Math.abs(homeTeam.teamStrength - awayTeam.teamStrength)) {
  if (expectedResult === "draw") {
    const score = pickWeighted([[0, strengthDifference > 20 ? 38 : 18], [1, 46], [2, strengthDifference > 20 ? 8 : 20], [3, 2]]);
    return { goalsA: score, goalsB: score, absurdScoresBlocked: 0 };
  }

  const favoriteIsA = homeTeam.teamStrength >= awayTeam.teamStrength;
  const winnerIsFavorite = expectedResult === (favoriteIsA ? "A" : "B");
  const hugeGap = strengthDifference > 23;
  let absurdScoresBlocked = 0;

  let winnerGoals: number;
  let loserGoals: number;
  if (!winnerIsFavorite && hugeGap) {
    winnerGoals = pickWeighted([[1, 75], [2, 25]]);
    loserGoals = winnerGoals === 1 ? 0 : 1;
  } else if (!winnerIsFavorite) {
    winnerGoals = pickWeighted([[1, 45], [2, 48], [3, 7]]);
    loserGoals = Math.max(0, winnerGoals - pickWeighted([[1, 70], [2, 30]]));
  } else {
    winnerGoals = pickWeighted([[1, 12], [2, 31], [3, 29], [4, 18], [5, 8], [6, 2]]);
    loserGoals = pickWeighted([[0, 42], [1, 42], [2, 14], [3, 2]]);
    if (hugeGap && winnerGoals < 2) winnerGoals = 2;
    if (hugeGap && winnerGoals >= 4) loserGoals = Math.min(loserGoals, 1);
    else if (hugeGap) loserGoals = Math.min(loserGoals, 2);
  }

  if (!winnerIsFavorite && hugeGap && winnerGoals - loserGoals > 1) {
    winnerGoals = 2;
    loserGoals = 1;
    absurdScoresBlocked++;
  }

  if (loserGoals >= winnerGoals) {
    loserGoals = Math.max(0, winnerGoals - 1);
  }

  return expectedResult === "A"
    ? { goalsA: winnerGoals, goalsB: loserGoals, absurdScoresBlocked }
    : { goalsA: loserGoals, goalsB: winnerGoals, absurdScoresBlocked };
}

export function generateMatchEvents(teamA: Team, teamB: Team, goalsA: number, goalsB: number, knockout = false): MatchEvent[] {
  const events: MatchEvent[] = [{ minute: 1, type: "info", text: `Comeca ${teamA.name} x ${teamB.name}.` }];
  const goalMinutes = [...Array(goalsA).fill(teamA.name), ...Array(goalsB).fill(teamB.name)]
    .map((team, index) => ({ team, minute: 8 + ((index * 17 + team.length * 3) % 78) }))
    .sort((a, b) => a.minute - b.minute);

  [12, 24, 33, 45, 58, 67, 76, 84].forEach((minute, index) => {
    const team = index % 2 === 0 ? teamA.name : teamB.name;
    const text = [
      `${team} troca passes no meio-campo.`,
      `${team} chega com perigo pela esquerda.`,
      `Defesa do goleiro apos chute de ${team}.`,
      "Fim do primeiro tempo.",
      `${team} tenta acelerar em contra-ataque.`,
      `Cartao amarelo para ${team} depois de falta tatica.`,
      `${team} pressiona nos minutos finais.`,
      "Substituicao sugerida para renovar o folego."
    ][index];
    events.push({ minute, type: index === 5 ? "yellow" : index === 2 ? "save" : index === 7 ? "substitution" : "chance", team, text });
  });

  goalMinutes.forEach((goal) => events.push({ minute: goal.minute, type: "goal", team: goal.team, text: `GOOOL do ${goal.team}!` }));
  if (knockout && goalsA === goalsB) events.push({ minute: 120, type: "shootout", text: "Empate no mata-mata. A decisao vai para os penaltis." });
  events.push({ minute: 90, type: "info", text: "Fim de jogo." });
  return events.sort((a, b) => a.minute - b.minute);
}

function buildStats(goalsA: number, goalsB: number, strengthA: number, strengthB: number): MatchStats {
  const possessionA = clamp(Math.round(50 + (strengthA - strengthB) * 0.7), 35, 65);
  const shotsA = clamp(Math.round(7 + goalsA * 2 + (strengthA - strengthB) * 0.12), 2, 22);
  const shotsB = clamp(Math.round(7 + goalsB * 2 + (strengthB - strengthA) * 0.12), 2, 22);
  return {
    possessionA,
    possessionB: 100 - possessionA,
    shotsA,
    shotsB,
    shotsOnTargetA: clamp(goalsA + Math.floor(shotsA / 3), goalsA, shotsA),
    shotsOnTargetB: clamp(goalsB + Math.floor(shotsB / 3), goalsB, shotsB),
    foulsA: 8 + Math.floor(Math.random() * 9),
    foulsB: 8 + Math.floor(Math.random() * 9),
    yellowCardsA: Math.floor(Math.random() * 4),
    yellowCardsB: Math.floor(Math.random() * 4),
    redCardsA: Math.random() < 0.03 ? 1 : 0,
    redCardsB: Math.random() < 0.03 ? 1 : 0,
    xgA: Number((goalsA * 0.65 + shotsA * 0.08).toFixed(2)),
    xgB: Number((goalsB * 0.65 + shotsB * 0.08).toFixed(2))
  };
}

function simulateShootout(strengthA: number, strengthB: number) {
  const bias = clamp((strengthA - strengthB) * 0.004, -0.08, 0.08);
  const goalsA = 3 + Math.floor(Math.random() * 3);
  let goalsB = 3 + Math.floor(Math.random() * 3);
  const winner = Math.random() < 0.5 + bias ? "A" : "B";
  if (winner === "A" && goalsB >= goalsA) goalsB = goalsA - 1;
  if (winner === "B" && goalsA >= goalsB) return { goalsA: goalsB - 1, goalsB, winner } as const;
  return { goalsA, goalsB, winner } as const;
}

export function simulateMatch(teamA: Team, teamB: Team, playersA: Player[], playersB: Player[], tacticA = defaultTactic, tacticB = defaultTactic, knockout = false): MatchResult {
  const effectiveStrengthA = calculateEffectiveStrength(teamA, playersA, tacticA, teamB.teamStrength, knockout);
  const effectiveStrengthB = calculateEffectiveStrength(teamB, playersB, tacticB, teamA.teamStrength, knockout);
  const probabilities = calculateWinProbabilities(effectiveStrengthA, effectiveStrengthB);
  const roll = Math.random();
  const expected = roll < probabilities.winProbabilityA ? "A" : roll < probabilities.winProbabilityA + probabilities.drawProbability ? "draw" : "B";
  const score = generateScore(teamA, teamB, expected, probabilities.strengthDifference);
  const penalties = knockout && score.goalsA === score.goalsB ? simulateShootout(effectiveStrengthA, effectiveStrengthB) : undefined;
  const winner = penalties ? penalties.winner : score.goalsA > score.goalsB ? "A" : score.goalsB > score.goalsA ? "B" : "draw";
  const debug: SimulationDebugReport = {
    effectiveStrengthA,
    effectiveStrengthB,
    ...probabilities,
    absurdScoresBlocked: score.absurdScoresBlocked
  };

  return {
    teamA,
    teamB,
    goalsA: score.goalsA,
    goalsB: score.goalsB,
    winner,
    expectedResult: expected === "draw" ? "draw" : expected === (effectiveStrengthA >= effectiveStrengthB ? "A" : "B") ? "favorite" : "underdog",
    events: generateMatchEvents(teamA, teamB, score.goalsA, score.goalsB, knockout),
    stats: buildStats(score.goalsA, score.goalsB, effectiveStrengthA, effectiveStrengthB),
    penalties,
    debug
  };
}

export function runSimulationTest(teamA: Team, teamB: Team, playersA: Player[], playersB: Player[], runs = 1000) {
  let winsA = 0;
  let draws = 0;
  let winsB = 0;
  let absurdScoresBlocked = 0;
  let totalGoals = 0;
  let biggestScore = "0x0";
  let biggestTotal = 0;

  for (let i = 0; i < runs; i++) {
    const result = simulateMatch(teamA, teamB, playersA, playersB);
    if (result.winner === "A") winsA++;
    if (result.winner === "draw") draws++;
    if (result.winner === "B") winsB++;
    absurdScoresBlocked += result.debug.absurdScoresBlocked;
    totalGoals += result.goalsA + result.goalsB;
    if (result.goalsA + result.goalsB > biggestTotal) {
      biggestTotal = result.goalsA + result.goalsB;
      biggestScore = `${result.goalsA}x${result.goalsB}`;
    }
  }

  return {
    matchup: `${teamA.name} x ${teamB.name}`,
    runs,
    winsA: Number(((winsA / runs) * 100).toFixed(1)),
    draws: Number(((draws / runs) * 100).toFixed(1)),
    winsB: Number(((winsB / runs) * 100).toFixed(1)),
    biggestScore,
    absurdScoresBlocked,
    averageGoals: Number((totalGoals / runs).toFixed(2))
  };
}
