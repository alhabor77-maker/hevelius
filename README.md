# Hevelius — Atlante delle costellazioni

Piccolo sito statico che presenta sei tavole dell'*Uranographia* di Johannes Hevelius (1690): Orione, Cane Minore, Toro, Scorpione, Cane Maggiore e Orsa Maggiore. Ogni tavola ha punti cliccabili sulle stelle principali, con una scheda di approfondimento.

## Come è fatto

- Solo HTML, CSS e JavaScript, senza dipendenze né passaggi di build.
- Tutti i percorsi sono relativi, quindi funziona anche da una sottocartella (`/hevelius/`) di GitHub Pages.
- Pensato anche per smartphone (iPhone/Safari).

## Immagini

Le tavole **non sono incluse nel repository**: vengono caricate direttamente da Wikimedia Commons (`upload.wikimedia.org`). Le opere sono di pubblico dominio; le pagine delle fonti sono elencate in `data/fonti_*.json` e nel sito stesso.

## Struttura

- `index.html`, `constellation.html`, `star.html`: le tre pagine
- `css/style.css`, `js/app.js`: stile e logica
- `data/`: stelle, testi, punti cliccabili e fonti (JSON)
