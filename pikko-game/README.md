# PIKKO — Yum or Bleah! / Gnam o Bleah! / Mniam czy Fuj!

Gioco 3D (Three.js + TypeScript + Vite) che insegna a mangiare sano. Trascini il cibo verso Pikko: il sano lo mangia felice, dal junk scappa e fa la smorfia. Design completo in [../PIKKO-GAME-DESIGN.md](../PIKKO-GAME-DESIGN.md).

## Avvio

```bash
npm install
npm run dev        # http://127.0.0.1:5180
npm test           # 30 test: regole, round, accesso DevFridge, copertura dei cibi
npm run build      # typecheck + build statica in dist/
```

`dist/` è un sito statico: si può pubblicare su qualunque hosting HTTPS (serve HTTPS per Phantom e per la condivisione).

## Cosa c'è

| Parte | Stato |
| --- | --- |
| Loop di gioco: 2 cibi per round, trascinamento (mouse/touch) e tastiera (1/2 + Invio), timer per fase, acqua ogni 8 round | ✅ |
| Punteggio GDD §4: voto × combo × ripetizione × abitudine + bonus scelta/colori/arcobaleno/reset/giornata perfetta | ✅ testato |
| Abitudine del palato (3 di fila), schivata normale e **invertita** (Pikko viziato scappa dal sano) | ✅ testato |
| Vittoria se ≥ 50% kcal sane, sconfitta altrimenti; rutto vittorioso / "Ahi! My stomach!" nella lingua scelta | ✅ |
| Modalità: Classica (40 round), Menu del giorno (seed giornaliero, 20 round), Pikko Zen (niente timer), Prova busta (5 round, punti non salvati), link sfida `?seed=` | ✅ |
| 25 buste: Base + **24 Paesi** con 480 cibi (10 sani + 10 “da ogni tanto” ciascuno; dati in `src/data/bags.json`, fonte `tools/catalog_v2.py`), 70% cibi della busta + 30% base, curiosità del Paese, ricettario-passaporto per Paese | ✅ |
| Logo di ogni busta = logo del token su Pump.fun (`public/logos/*.svg`, PNG in `../PIKKO_TOKEN_LOGOS/`), mostrato nel Pikko Mart | ✅ |
| Pikko procedurale: vinile, germoglio a molla, pancia trasparente che si riempie (verde/marrone), bavaglino che si macchia, sopracciglia/occhi/bocca/lingua espressivi, un accessorio per Paese (cappello da chef, basco, corona d'ulivo, nón lá, chullo…) | ✅ |
| Musica che cambia per fase; con l'abitudine junk diventa ovattata e lenta, con quella sana più brillante | ✅ (filtro in tempo reale al posto dei loop M15/M16 non ancora generati) |
| Stacchi S10/S11/S12/S13/S14/S17/S20 | ✅ sintetizzati in WebAudio (Do maggiore pentatonico, timer a tempo con il BPM del loop) finché non arrivano quelli generati |
| Scontrino di Pikko (PNG condivisibile), riga emoji stile Wordle, Bleah Cam (clip della smorfia con audio, se il browser lo supporta), Ricettario, record locali | ✅ |
| Pikko Mart, area adulti (domanda per adulti), wallet Solana (Wallet Standard + **Mobile Wallet Adapter per Solana Seeker / Android Chrome**, Phantom: solo connessione, nessuna firma), testo informativo con il 2% PASTA, verifica lock DevFridge con il valutatore testato | ✅ codice pronto · ⏳ **nessun mint configurato**: tutte le buste sono in modalità prova |
| EN / IT / PL con plurali polacchi | ✅ (polacco da rileggere da un madrelingua) |
| **Tutorial in gioco** (20 lingue): schede illustrate + 2 round di prova guidati con coach; parte alla prima partita, si rivede da ❓ / Impostazioni / pausa | ✅ |
| **Pass PASTA**: un lock attivo di 5.000.000 PASTA su DevFridge sblocca tutte le buste (mint verificato on-chain, aggregazione `single`), in attesa dei token dei Paesi | ✅ (dati reali di DevFridge simulati nei test: nessun lock firmato) |
| 20 lingue nel menu (EN IT PL ES FR DE PT EL TR AR HI ZH JA KO TH VI ID RU UK FIL), arabo RTL, plurali russi/ucraini, una busta-Paese per lingua (logo nel selettore, 📍 nel Mart) | ✅ (17 traduzioni automatiche: revisione madrelingua necessaria; voci registrate solo EN/IT/PL) |
| Logo PIKKO con il personaggio al posto della I (`public/pikko-logo.svg`, PNG in `../PIKKO_LOGO/`) nella schermata di caricamento e nel titolo | ✅ |
| Accessibilità: tastiera, focus visibile, `prefers-reduced-motion`, pausa automatica a schermo bloccato, recupero del contesto WebGL | ✅ |

## Cosa è ancora segnaposto (dichiarato)

- **Modelli dei cibi**: 41 archetipi procedurali (`src/render/foods.ts`, mappa in `src/data/visuals.ts`), **non** i 400 modelli HD del GDD §13.9. Sono etichettati come segnaposto anche nelle impostazioni del gioco.
- **Audio**: i loop dei pasti/menu/Mart/buste sono *candidati* (`PIKKO_loop_masters_v0.1`), non master approvati; voci e foley sono la variante 01 di ogni cue (tranne i 4 Gnam approvati, il rutto 04 e "Ahi! My stomach!" 02 scelti dall'utente). IT/PL della sconfitta: variante 01 provvisoria. `public/audio/manifest.json` riporta per ogni file sorgente, sha256 e stato.
- **Valori nutrizionali**: approssimativi, da far verificare (USDA / CREA / IŻŻ) da un nutrizionista.

## Attivare una busta con il suo token

In `src/access/bags.config.ts`, per la busta: `mint` (CA completo), `decimals` (letto da RPC), `minimumTokens` (stringa decimale) e `verified: true` **solo dopo** aver verificato Token-2022, estensioni e route di riscatto Jupiter. La regola decisa è "basta un lock attivo" (`minOriginalSeconds = 0`, `minRemainingSeconds = 0`). La verifica nel browser è una comodità, non una protezione: per proteggere davvero i contenuti servono un controllo lato server e la firma del wallet.

## Struttura

```
src/sim/       regole e round (puri, testati)
src/data/      cibi (430 incl. acqua), buste, mappa visiva
src/render/    scena, Pikko, cibi procedurali, texture
src/audio/     WebAudio: manifest, loop allineati al campione, stacchi sintetizzati
src/access/    valutatore timelock, gate per busta, wallet (Wallet Standard, MWA, Phantom)
src/ui/        HUD, schermate, scontrino
src/capture/   Bleah Cam
tools/         catalog_v2.py (catalogo Paesi), make_logos.py + render_logos.mjs (loghi), build_audio.py (audio web), shots.mjs e playthrough.mjs (test visivi/end-to-end con Chrome)
```
