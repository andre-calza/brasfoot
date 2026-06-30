import { TopBar } from "../components/TopBar";
import type { Career, Team } from "../types/game";

interface Props {
  title: string;
  career: Career;
  team: Team;
  onBack: () => void;
}

export function SimplePage({ title, career, team, onBack }: Props) {
  return (
    <>
      <TopBar career={career} team={team} onBack={onBack} />
      <main className="page-grid two">
        <section className="panel highlight">
          <h2>{title}</h2>
          <p>Modulo preparado para expansao. O MVP ja registra carreira, elenco, taticas, calendario basico, tabela e simulacao realista.</p>
        </section>
      </main>
    </>
  );
}
