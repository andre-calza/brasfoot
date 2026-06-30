import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { teams, players } from "../database/seedData";
import { simulateMatch } from "../game-engine/matchSimulator";
import { applyCareerEvent, calculatePostMatchImpact, generateCareerEvent } from "../services/careerService";
import { CalendarPage } from "../pages/CalendarPage";
import { CareerCreationPage } from "../pages/CareerCreationPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LineupPage } from "../pages/LineupPage";
import { MatchPage } from "../pages/MatchPage";
import { SquadPage } from "../pages/SquadPage";
import { StatsPage } from "../pages/StatsPage";
import { TablePage } from "../pages/TablePage";
import { TacticPage } from "../pages/TacticPage";
import { applyFixtureResult, createInitialWorldCupState, getNextFixtureForTeam, getWorldCupStatus } from "../services/worldCupService";
import type { Career, CareerEvent, GameSaveSnapshot, MatchResult, Player, Tactic, Team, WorldCupFixture, WorldCupState } from "../types/game";
import "./styles.css";

type View = "home" | "career" | "dashboard" | "squad" | "lineup" | "tactic" | "match" | "table" | "stats" | "calendar";

const defaultTactic: Tactic = { formation: "4-3-3", mentality: "Equilibrada", playStyle: "Posse de bola", pressure: "Media" };

export default function App() {
  const [view, setView] = useState<View>("home");
  const [career, setCareer] = useState<Career | null>(null);
  const [squadIds, setSquadIds] = useState<string[]>([]);
  const [starterIds, setStarterIds] = useState<string[]>([]);
  const [tactic, setTactic] = useState<Tactic>(defaultTactic);
  const [worldCup, setWorldCup] = useState<WorldCupState>(() => createInitialWorldCupState(teams));
  const [careerEvents, setCareerEvents] = useState<CareerEvent[]>([]);

  const currentTeam = useMemo(() => teams.find((team) => team.id === career?.teamId) ?? teams[0], [career]);
  const teamPlayers = useMemo(() => players.filter((player) => player.country === currentTeam.name), [currentTeam.name]);
  const squad = useMemo(() => teamPlayers.filter((player) => squadIds.includes(player.id)), [teamPlayers, squadIds]);
  const nextUserFixture = useMemo(() => getNextFixtureForTeam(worldCup, currentTeam.id), [worldCup, currentTeam.id]);
  const opponent = useMemo(() => {
    if (!nextUserFixture) return teams.find((team) => team.group === currentTeam.group && team.id !== currentTeam.id) ?? teams[1];
    const opponentId = nextUserFixture.teamAId === currentTeam.id ? nextUserFixture.teamBId : nextUserFixture.teamAId;
    return teams.find((team) => team.id === opponentId) ?? teams[1];
  }, [currentTeam, nextUserFixture]);
  const matchTeamA = useMemo(() => teams.find((team) => team.id === nextUserFixture?.teamAId) ?? currentTeam, [currentTeam, nextUserFixture]);
  const matchTeamB = useMemo(() => teams.find((team) => team.id === nextUserFixture?.teamBId) ?? opponent, [nextUserFixture, opponent]);
  const opponentPlayers = useMemo(() => players.filter((player) => player.country === opponent.name), [opponent.name]);

  function startCareer(newCareer: Career) {
    setCareer(newCareer);
    const bestPlayers = players.filter((player) => player.country === teams.find((team) => team.id === newCareer.teamId)?.name).sort((a, b) => b.overall - a.overall);
    setSquadIds(bestPlayers.slice(0, 26).map((player) => player.id));
    setStarterIds(bestPlayers.slice(0, 11).map((player) => player.id));
    setWorldCup(createInitialWorldCupState(teams));
    setCareerEvents([]);
    setView("dashboard");
    window.worldCoach?.saveCareer(newCareer);
  }

  function buildSnapshot(activeCareer = career): GameSaveSnapshot | undefined {
    if (!activeCareer) return undefined;
    return {
      career: activeCareer,
      squadIds,
      starterIds,
      tactic,
      worldCup,
      careerEvents,
      savedAt: new Date().toISOString()
    };
  }

  async function persistSnapshot(snapshot: GameSaveSnapshot) {
    localStorage.setItem("worldCoach.latestSave", JSON.stringify(snapshot));
    await window.worldCoach?.saveGame(snapshot);
  }

  async function saveGame(activeCareer = career) {
    const snapshot = buildSnapshot(activeCareer);
    if (!snapshot) return;
    await persistSnapshot(snapshot);
  }

  async function loadGame() {
    const electronSave = await window.worldCoach?.loadLatestGame();
    const fallbackSave = localStorage.getItem("worldCoach.latestSave");
    const snapshot = (electronSave ?? (fallbackSave ? JSON.parse(fallbackSave) : null)) as GameSaveSnapshot | null;
    if (!snapshot) {
      setView("career");
      return;
    }
    setCareer(snapshot.career);
    setSquadIds(snapshot.squadIds);
    setStarterIds(snapshot.starterIds);
    setTactic(snapshot.tactic);
    setWorldCup(snapshot.worldCup);
    setCareerEvents(snapshot.careerEvents);
    setView("dashboard");
  }

  function playersForTeam(team: Team) {
    return players.filter((player) => player.country === team.name).sort((a, b) => b.overall - a.overall).slice(0, 11);
  }

  function tacticForTeam(team: Team): Tactic {
    if (team.id === currentTeam.id) return tactic;
    return { formation: "4-4-2", mentality: "Equilibrada", playStyle: team.style, pressure: "Media" };
  }

  function startersForFixtureTeam(team: Team): Player[] {
    if (team.id !== currentTeam.id) return playersForTeam(team);
    const selectedStarters = squad.filter((player) => starterIds.includes(player.id));
    return selectedStarters.length >= 11 ? selectedStarters : squad.slice().sort((a, b) => b.overall - a.overall).slice(0, 11);
  }

  function simulateFixture(fixture: WorldCupFixture): MatchResult {
    const teamA = teams.find((team) => team.id === fixture.teamAId)!;
    const teamB = teams.find((team) => team.id === fixture.teamBId)!;
    return simulateMatch(teamA, teamB, startersForFixtureTeam(teamA), startersForFixtureTeam(teamB), tacticForTeam(teamA), tacticForTeam(teamB), fixture.phase !== "Grupos");
  }

  function recordMatch(fixtureId: string | undefined, result: MatchResult) {
    const nextWorldCup = fixtureId ? applyFixtureResult(worldCup, fixtureId, result) : worldCup;
    if (fixtureId) setWorldCup(nextWorldCup);
    if (!career) return undefined;
    const update = calculatePostMatchImpact(career, currentTeam, result);
    const event = generateCareerEvent();
    const careerAfterEvent = applyCareerEvent(update.career, event);
    const nextEvents = [event, ...careerEvents].slice(0, 12);
    setCareer(careerAfterEvent);
    setCareerEvents(nextEvents);
    persistSnapshot({
      career: careerAfterEvent,
      squadIds,
      starterIds,
      tactic,
      worldCup: nextWorldCup,
      careerEvents: nextEvents,
      savedAt: new Date().toISOString()
    });
    return update.impact;
  }

  function simulateRoundFromState(state: WorldCupState) {
    const next = state.fixtures.find((fixture) => !fixture.played);
    if (!next) return state;
    return state.fixtures
      .filter((fixture) => !fixture.played && fixture.phase === next.phase && fixture.round === next.round && fixture.teamAId !== currentTeam.id && fixture.teamBId !== currentTeam.id)
      .reduce((nextState, fixture) => applyFixtureResult(nextState, fixture.id, simulateFixture(fixture)), state);
  }

  function simulateCurrentRound() {
    const nextWorldCup = simulateRoundFromState(worldCup);
    setWorldCup(nextWorldCup);
    const snapshot = buildSnapshot();
    if (snapshot) persistSnapshot({ ...snapshot, worldCup: nextWorldCup, savedAt: new Date().toISOString() });
  }

  function navigate(label: string) {
    const map: Record<string, View> = {
      Convocacao: "squad",
      Escalacao: "lineup",
      Tatica: "tactic",
      Calendario: "calendar",
      "Tabela da Copa": "table",
      "Simular partida": "match",
      Estatisticas: "stats",
      Debug: "stats"
    };
    setView(map[label] ?? "dashboard");
  }

  if (view === "home") return <HomePage onNewCareer={() => setView("career")} onLoad={loadGame} />;
  if (view === "career") return <CareerCreationPage teams={teams} onCreate={startCareer} onBack={() => setView("home")} />;
  if (!career) return <HomePage onNewCareer={() => setView("career")} onLoad={() => setView("career")} />;
  if (view === "squad") return <SquadPage career={career} team={currentTeam} players={teamPlayers} selectedIds={squadIds} onChange={setSquadIds} onBack={() => setView("dashboard")} />;
  if (view === "lineup") return <LineupPage career={career} team={currentTeam} squad={squad} starters={starterIds} onChange={setStarterIds} onBack={() => setView("dashboard")} />;
  if (view === "tactic") return <TacticPage career={career} team={currentTeam} tactic={tactic} onChange={setTactic} onBack={() => setView("dashboard")} />;
  if (view === "match") return (
    <MatchPage
      career={career}
      userTeam={currentTeam}
      teamA={matchTeamA}
      teamB={matchTeamB}
      fixtureId={nextUserFixture?.id}
      playersA={startersForFixtureTeam(matchTeamA)}
      playersB={startersForFixtureTeam(matchTeamB)}
      tacticA={tacticForTeam(matchTeamA)}
      tacticB={tacticForTeam(matchTeamB)}
      onBack={() => setView("dashboard")}
      onMatchPlayed={recordMatch}
    />
  );
  if (view === "table") return <TablePage career={career} team={currentTeam} teams={teams} standings={worldCup.standings} fixtures={worldCup.fixtures} onBack={() => setView("dashboard")} />;
  if (view === "stats") return <StatsPage career={career} team={currentTeam} teams={teams} players={players} onBack={() => setView("dashboard")} />;
  if (view === "calendar") return <CalendarPage career={career} team={currentTeam} teams={teams} fixtures={worldCup.fixtures} onBack={() => setView("dashboard")} onPlayNext={() => setView("match")} onSimulateRound={simulateCurrentRound} />;
  return <DashboardPage career={career} team={currentTeam} nextOpponent={nextUserFixture ? opponent : undefined} phase={getWorldCupStatus(worldCup)} events={careerEvents} onNavigate={navigate} onSave={() => saveGame()} />;
}

createRoot(document.getElementById("root")!).render(<App />);
