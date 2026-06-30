interface HomePageProps {
  onNewCareer: () => void;
  onLoad: () => void;
}

export function HomePage({ onNewCareer, onLoad }: HomePageProps) {
  return (
    <main className="home-shell">
      <section className="home-panel">
        <p className="eyebrow">Desktop offline</p>
        <h1>World Coach</h1>
        <p>Assuma uma selecao nacional, convoque seus jogadores e dispute uma Copa com 48 equipes.</p>
        <div className="home-actions">
          <button onClick={onNewCareer}>Novo jogo</button>
          <button className="secondary" onClick={onLoad}>Carregar jogo</button>
          <button className="secondary">Configuracoes</button>
          <button className="danger">Sair</button>
        </div>
      </section>
    </main>
  );
}
