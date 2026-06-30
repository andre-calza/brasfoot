import type { MatchResult, Standing, Team, WorldCupFixture, WorldCupState } from "../types/game";

const knockoutOrder: WorldCupFixture["phase"][] = ["Fase de 32", "Oitavas", "Quartas", "Semifinal", "Final"];

export function createInitialStandings(teams: Team[]): Record<string, Standing[]> {
  return teams.reduce<Record<string, Standing[]>>((groups, team) => {
    groups[team.group] ??= [];
    groups[team.group].push({ teamId: team.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
    return groups;
  }, {});
}

export function buildGroupFixtures(groupTeams: Team[]) {
  return [
    [groupTeams[0], groupTeams[1]],
    [groupTeams[2], groupTeams[3]],
    [groupTeams[0], groupTeams[2]],
    [groupTeams[1], groupTeams[3]],
    [groupTeams[0], groupTeams[3]],
    [groupTeams[1], groupTeams[2]]
  ];
}

export function createGroupFixtures(teams: Team[]): WorldCupFixture[] {
  const byGroup = teams.reduce<Record<string, Team[]>>((groups, team) => {
    groups[team.group] ??= [];
    groups[team.group].push(team);
    return groups;
  }, {});

  return Object.entries(byGroup).flatMap(([group, groupTeams]) => {
    const fixtures = buildGroupFixtures(groupTeams);
    return fixtures.map(([teamA, teamB], index) => ({
      id: `group-${group}-${index + 1}`,
      phase: "Grupos" as const,
      group,
      round: Math.floor(index / 2) + 1,
      teamAId: teamA.id,
      teamBId: teamB.id,
      played: false
    }));
  });
}

export function createInitialWorldCupState(teams: Team[]): WorldCupState {
  return {
    fixtures: createGroupFixtures(teams),
    standings: createInitialStandings(teams)
  };
}

export function applyResult(standings: Standing[], result: MatchResult) {
  const a = standings.find((row) => row.teamId === result.teamA.id);
  const b = standings.find((row) => row.teamId === result.teamB.id);
  if (!a || !b) return standings;

  a.played++;
  b.played++;
  a.goalsFor += result.goalsA;
  a.goalsAgainst += result.goalsB;
  b.goalsFor += result.goalsB;
  b.goalsAgainst += result.goalsA;

  if (result.goalsA > result.goalsB) {
    a.wins++;
    b.losses++;
    a.points += 3;
  } else if (result.goalsB > result.goalsA) {
    b.wins++;
    a.losses++;
    b.points += 3;
  } else {
    a.draws++;
    b.draws++;
    a.points++;
    b.points++;
  }
  return sortStandings(standings);
}

export function applyFixtureResult(state: WorldCupState, fixtureId: string, result: MatchResult): WorldCupState {
  const nextStandings = Object.fromEntries(
    Object.entries(state.standings).map(([group, rows]) => [group, rows.map((row) => ({ ...row }))])
  ) as Record<string, Standing[]>;
  const fixture = state.fixtures.find((item) => item.id === fixtureId);
  if (!fixture || fixture.played) return state;
  if (fixture?.group) {
    nextStandings[fixture.group] = applyResult(nextStandings[fixture.group], result);
  }

  return advanceWorldCupIfNeeded({
    standings: nextStandings,
    fixtures: state.fixtures.map((item) => item.id === fixtureId ? { ...item, played: true, result } : item)
  });
}

export function getNextFixtureForTeam(state: WorldCupState, teamId: string) {
  return state.fixtures.find((fixture) => !fixture.played && (fixture.teamAId === teamId || fixture.teamBId === teamId));
}

export function getCurrentPendingFixture(state: WorldCupState) {
  return state.fixtures.find((fixture) => !fixture.played);
}

export function getWorldCupStatus(state: WorldCupState) {
  const pending = getCurrentPendingFixture(state);
  if (pending) return `${pending.phase}${pending.phase === "Grupos" ? ` - Rodada ${pending.round}` : ""}`;
  const final = state.fixtures.find((fixture) => fixture.phase === "Final" && fixture.played);
  if (final?.result) return `Campeao: ${winnerName(final)}`;
  return "Copa concluida";
}

export function advanceWorldCupIfNeeded(state: WorldCupState): WorldCupState {
  if (state.fixtures.some((fixture) => !fixture.played)) return state;

  if (!state.fixtures.some((fixture) => fixture.phase === "Fase de 32")) {
    return {
      ...state,
      fixtures: [...state.fixtures, ...createRoundOf32Fixtures(state)]
    };
  }

  const lastPhase = [...knockoutOrder].reverse().find((phase) => state.fixtures.some((fixture) => fixture.phase === phase));
  if (!lastPhase || lastPhase === "Final") return state;
  if (state.fixtures.some((fixture) => fixture.phase === nextKnockoutPhase(lastPhase))) return state;

  return {
    ...state,
    fixtures: [...state.fixtures, ...createNextKnockoutFixtures(state, lastPhase)]
  };
}

function createRoundOf32Fixtures(state: WorldCupState): WorldCupFixture[] {
  const qualified = qualifiedTeams(state.standings);
  const pairs: Array<[string, string]> = [];
  let left = 0;
  let right = qualified.length - 1;
  while (left < right) {
    pairs.push([qualified[left].teamId, qualified[right].teamId]);
    left++;
    right--;
  }
  return pairs.map(([teamAId, teamBId], index) => ({
    id: `r32-${index + 1}`,
    phase: "Fase de 32",
    round: 4,
    teamAId,
    teamBId,
    played: false
  }));
}

function createNextKnockoutFixtures(state: WorldCupState, phase: WorldCupFixture["phase"]): WorldCupFixture[] {
  const phaseFixtures = state.fixtures.filter((fixture) => fixture.phase === phase);
  const winners = phaseFixtures.map(winnerId).filter(Boolean) as string[];
  const losers = phaseFixtures.map(loserId).filter(Boolean) as string[];

  if (phase === "Semifinal") {
    return [
      { id: "third-place", phase: "Terceiro lugar", round: 8, teamAId: losers[0], teamBId: losers[1], played: false },
      { id: "final", phase: "Final", round: 8, teamAId: winners[0], teamBId: winners[1], played: false }
    ];
  }

  const nextPhase = nextKnockoutPhase(phase);
  const nextRound = phase === "Fase de 32" ? 5 : phase === "Oitavas" ? 6 : 7;
  const fixtures: WorldCupFixture[] = [];
  for (let index = 0; index < winners.length; index += 2) {
    fixtures.push({
      id: `${nextPhase.toLowerCase().replace(/\s+/g, "-")}-${fixtures.length + 1}`,
      phase: nextPhase,
      round: nextRound,
      teamAId: winners[index],
      teamBId: winners[index + 1],
      played: false
    });
  }
  return fixtures;
}

function nextKnockoutPhase(phase: WorldCupFixture["phase"]): WorldCupFixture["phase"] {
  if (phase === "Fase de 32") return "Oitavas";
  if (phase === "Oitavas") return "Quartas";
  if (phase === "Quartas") return "Semifinal";
  return "Final";
}

function winnerId(fixture: WorldCupFixture) {
  if (!fixture.result) return undefined;
  if (fixture.result.penalties) return fixture.result.penalties.winner === "A" ? fixture.teamAId : fixture.teamBId;
  if (fixture.result.goalsA > fixture.result.goalsB) return fixture.teamAId;
  if (fixture.result.goalsB > fixture.result.goalsA) return fixture.teamBId;
  return undefined;
}

function loserId(fixture: WorldCupFixture) {
  const winner = winnerId(fixture);
  if (!winner) return undefined;
  return winner === fixture.teamAId ? fixture.teamBId : fixture.teamAId;
}

function winnerName(fixture: WorldCupFixture) {
  const winner = winnerId(fixture);
  return winner ?? "indefinido";
}

export function sortStandings(standings: Standing[]) {
  return standings.slice().sort((a, b) => {
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    return b.points - a.points || goalDiffB - goalDiffA || b.goalsFor - a.goalsFor || a.teamId.localeCompare(b.teamId);
  });
}

export function qualifiedTeams(groupStandings: Record<string, Standing[]>) {
  const direct: Standing[] = [];
  const thirds: Standing[] = [];
  Object.values(groupStandings).forEach((standings) => {
    const sorted = sortStandings(standings);
    direct.push(sorted[0], sorted[1]);
    thirds.push(sorted[2]);
  });
  return [...direct, ...sortStandings(thirds).slice(0, 8)];
}

export function buildKnockoutPairs(qualified: Standing[], teamsById: Record<string, Team>) {
  const sorted = sortStandings(qualified);
  const pairs: Array<[Team, Team]> = [];
  let left = 0;
  let right = sorted.length - 1;
  while (left < right) {
    pairs.push([teamsById[sorted[left].teamId], teamsById[sorted[right].teamId]]);
    left++;
    right--;
  }
  return pairs;
}
