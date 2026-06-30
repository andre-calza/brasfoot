import { useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import type { Career, Player, Team, Position } from "../types/game";

interface Props {
  career: Career;
  team: Team;
  players: Player[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onBack: () => void;
}

const minimums: Record<Position, number> = { GK: 3, DEF: 6, MID: 6, FWD: 4 };

export function SquadPage({ career, team, players, selectedIds, onChange, onBack }: Props) {
  const [position, setPosition] = useState<"ALL" | Position>("ALL");
  const selected = useMemo(() => players.filter((player) => selectedIds.includes(player.id)), [players, selectedIds]);
  const filtered = players.filter((player) => position === "ALL" || player.position === position).sort((a, b) => b.overall - a.overall);
  const counts = {
    GK: selected.filter((player) => player.position === "GK").length,
    DEF: selected.filter((player) => player.position === "DEF").length,
    MID: selected.filter((player) => player.position === "MID").length,
    FWD: selected.filter((player) => player.position === "FWD").length
  };
  const alerts = Object.entries(minimums).filter(([pos, min]) => counts[pos as Position] < min).map(([pos, min]) => `${pos}: minimo ${min}`);

  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((item) => item !== id));
    else if (selectedIds.length < 26) onChange([...selectedIds, id]);
  }

  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid">
        <section className="panel wide">
          <div className="section-head"><h2>Convocacao</h2><select value={position} onChange={(event) => setPosition(event.target.value as "ALL" | Position)}><option value="ALL">Todas</option><option value="GK">Goleiros</option><option value="DEF">Defensores</option><option value="MID">Meias</option><option value="FWD">Atacantes</option></select></div>
          <div className="notice">{selectedIds.length}/26 selecionados {alerts.length ? `- Alertas: ${alerts.join(", ")}` : "- Convocacao valida"}</div>
          <div className="table">
            {filtered.map((player) => (
              <button key={player.id} className={`row ${selectedIds.includes(player.id) ? "selected" : ""}`} onClick={() => toggle(player.id)}>
                <span>{player.name}</span><span>{player.position}</span><span>{player.age} anos</span><strong>{player.overall}</strong><span>{player.fitnessStatus}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
