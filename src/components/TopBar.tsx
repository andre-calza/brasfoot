import type { Career, Team } from "../types/game";

interface TopBarProps {
  career?: Career;
  team?: Team;
  onBack?: () => void;
}

export function TopBar({ career, team, onBack }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <strong>World Coach</strong>
        <span>{career && team ? `${career.coachName} - ${team.name} ${career.seasonYear}` : "Copa do Mundo 2026"}</span>
      </div>
      {onBack ? <button className="ghost" onClick={onBack}>Voltar</button> : null}
    </header>
  );
}
