# World Coach

MVP desktop offline inspirado em jogos de treinador, focado em selecoes da Copa do Mundo. O projeto usa Electron, React, TypeScript, Vite e SQLite local.

## Rodando

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia Vite, compila o processo principal e abre o Electron.
- `npm run build`: gera build de renderer e processo principal.
- `npm run dist`: alias de build desktop do MVP.
- `npm run typecheck`: valida TypeScript.
- `npm run test:sim`: roda 1.000 simulacoes para confrontos de calibracao.

## Estrutura

- `src/main`: processo principal do Electron e IPC.
- `src/renderer`: entrada React e CSS.
- `src/database`: schema SQLite, conexao e seeds.
- `src/services`: regras de carreira e Copa 2026.
- `src/game-engine`: simulador de partidas.
- `src/components`: componentes reutilizaveis.
- `src/pages`: telas do jogo.
- `src/types`: interfaces TypeScript.

## MVP implementado

- 48 selecoes organizadas em 12 grupos.
- 30 jogadores ficticios por selecao.
- Criacao de carreira.
- Painel principal da selecao.
- Convocacao com validacao por posicao.
- Escalacao com validacoes basicas.
- Tatica com formacao, mentalidade, estilo e pressao.
- Simulador realista com controle de zebras e placares absurdos.
- Timeline textual da partida.
- Estatisticas pos-jogo.
- Tabela inicial da Copa.
- Persistencia SQLite para carreiras e partidas pelo Electron.
- Teste de simulacao em massa.

O jogo nao usa APIs externas e foi preparado para evoluir em ciclos: calendario completo, mata-mata persistido, propostas, envelhecimento de jogadores e eventos aleatorios mais profundos.
