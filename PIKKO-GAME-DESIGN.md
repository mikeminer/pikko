# PIKKO — Gnam o Bleah!
### Game Design Document · v0.2 · 2026-10-03

> Gioco 3D in Three.js, realismo materico, che insegna a mangiare sano.
> Trascini il cibo verso Pikko: se è sano lo divora felice, se è spazzatura scappa… e se lo prende comunque fa una smorfia che fa ridere.
> Lingue: **English · Italiano · Polski**.
>
> **Gioco giocabile:** [pikko-game/](pikko-game/README.md) (Three.js + TypeScript + Vite). Avvio con `npm run dev` nella cartella.

---

## 0. In breve

| Voce | Decisione proposta |
| --- | --- |
| Titolo | **PIKKO** — *Yum or Bleah!* / *Gnam o Bleah!* / *Mniam czy Fuj!* |
| Protagonista | Pikko, un mangiatore schizzinoso a forma di fagiolo, in vinile soft-touch, con un germoglio sulla testa e una “finestra-pancia” trasparente che si riempie di calorie |
| Loop | Ogni round ci sono 2 cibi → ne trascini uno nella bocca di Pikko → reazione → la pancia si riempie di kcal → si continua finché la pancia è piena |
| Punteggio | Punti **a boccone**, moltiplicati dalla qualità del cibo. Meno kcal e più sano = più bocconi prima di riempire la pancia = più punti |
| Abitudine | Dopo 3 junk di fila Pikko si “vizia”: fa la smorfia al cibo sano e scappa da lui. Dopo 3 sani di fila si “riabitua”: il junk gli fa ancora più schifo. Il junk è **sempre** penalizzato (§4.5) |
| Durata partita | 2–5 minuti |
| Camera | Fissa, 3/4 frontale su un tavolo di cucina, leggero parallasse |
| Controlli | Trascinamento con mouse o dito (stessa azione) |
| Monetizzazione/accesso | Gioco base gratuito (Busta Base, 30 cibi). **Pikko Mart**: supermercato 3D con **24 buste espansione × 20 cibi 3D HD (10 sani + 10 junk) = 480 cibi**. **Un token Pump.fun per busta**: basta un lock attivo di quel token su DevFridge per sbloccare la busta |
| Stack | Vite + TypeScript + Three.js (0.186.x già nel repo), GLB + KTX2, Phantom, DevFridge SDK/API |

---

## 1. Il nome

### Raccomandato: **PIKKO**

- Viene da *picky* (“schizzinoso” in inglese), che è proprio la sua personalità: sceglie cosa mangiare e scappa dal cibo spazzatura.
- Due sillabe, doppia consonante, si pronuncia uguale in EN/IT/PL. Facile da urlare, da mettere in un hashtag e da stampare su un pupazzo.
- In polacco si declina in modo naturale (*Pikko, Pikka, Pikkowi*, come *Pinokio*), quindi le frasi del gioco suonano native.
- Il sottotitolo cambia per lingua e usa le onomatopee locali, che sono già divertenti:

| Lingua | Logo | Sottotitolo | Grido “sano” | Grido “bleah” |
| --- | --- | --- | --- | --- |
| EN | PIKKO | *Yum or Bleah!* | “Yum!” / “Nom nom!” | “Bleah!” / “Yuck!” |
| IT | PIKKO | *Gnam o Bleah!* | “Gnam!” | “Bleah!” |
| PL | PIKKO | *Mniam czy Fuj!* | “Mniam!” | “Fuj!” |

**Il supermercato:** *Pikko Mart*. **I pacchetti:** *Buste di Pikko* / *Pikko Bags* / *Torby Pikka*.

### Alternative

| Nome | Pro | Contro |
| --- | --- | --- |
| **KCALM DOWN** | Gioco di parole forte (*calm down* + kcal), ottimo per la community crypto | Funziona solo in inglese, non dice chi è il personaggio |
| **SNACK DODGE** | Descrive subito la meccanica della schivata | Generico, poco “iconico” |
| **BLEAH CLUB** | Divertente, “bleah” si capisce in tutte e tre le lingue | Mette al centro il cibo spazzatura invece di quello sano |
| **FRIDGE FEAST** | Si collega al brand DevFridge | Descrittivo, poco personaggio |

> ⚠️ **Da fare prima di adottarlo:** ricerca di marchio (EUIPO, USPTO, UPRP polacco), domini (`pikko.game`, `playpikko.com`…), handle social e store. Non l’ho verificato. Anche il ticker del token va controllato per evitare collisioni.

> ⚠️ **Rischio somiglianza:** “mostriciattolo verde e tondo che mangia caramelle” = *Om Nom* di *Cut the Rope* (ZeptoLab). Per questo Pikko **non è verde, non è una palla, non ha “nom” nel nome** e ha una silhouette verticale con germoglio e pancia trasparente. Mantenere questa distanza in tutte le revisioni dell’art.

---

## 2. Character Bible — Pikko

### 2.1 Concept in una riga
**Un designer toy in vinile, a forma di fagiolo, nato nel cassetto delle verdure di un frigo, con un germoglio sulla testa che mostra il suo umore e una pancia trasparente che mostra cosa ha mangiato.**

### 2.2 Lore (breve, per trailer e social)
Pikko è spuntato in fondo al cassetto delle verdure di un vecchio frigo. Ogni volta che si accende la luce del frigo si sveglia affamato. Ha gusti precisi: adora le cose che crescono e scappa dalle cose che arrivano già fritte. Il germoglio che ha in testa è un pezzetto dell’orto da cui viene: quando mangia bene fiorisce, quando mangia schifezze appassisce.

*(Collegamento naturale all’ecosistema DevFridge: il frigo è casa sua.)*

### 2.3 Silhouette e proporzioni (devono leggersi anche in nero pieno)

```
        ,/\,        ← germoglio: stelo + 2 foglie (mood indicator, catena di 3 ossa con molla)
       (_  _)
      .-'--'-.
     /  O  O  \     ← occhi grandi, lucidi, molto distanziati (1/5 della larghezza ciascuno)
    |    __    |    ← bocca larga: chiusa = 40% della larghezza, aperta = 60%, con 2 dentini
    |  [====]  |    ← FINESTRA-PANCIA trasparente: si riempie di liquido = barra kcal
     \ [====] /     ← bavaglino a quadretti bianco/rosso (tovaglia da trattoria)
      '-.__.-'
       d    b       ← piedini a sneaker con suola in gomma
```

- **Forma:** corpo unico testa+busto a goccia/fagiolo (tipo gommoso), alto **18 cm** in scala reale sul tavolo. Base più larga della testa = buffo e stabile.
- **Braccia:** corte, a manopola, senza dita (gesti: coprirsi la bocca, sventolare, fare il muscolo).
- **Piedi:** due piedini con suola in gomma ruvida e cucitura, per contatto e ombre credibili.
- **Germoglio:** il tratto più riconoscibile. Due foglie a cuore su uno stelo leggermente curvo.

### 2.4 Palette (codice colore del personaggio)

| Elemento | Colore | Nota |
| --- | --- | --- |
| Corpo | **Pikko Orange `#FF6B35`** | Si distingue dal verde delle verdure e dal marrone del fritto |
| Pancia (contorno) | Arancio scuro `#C94A1E` | Bordo in rilievo, come la cornice di un oblò |
| Germoglio | `#5BBF3A` sano · `#9AA04A` appassito | Interpolati in base all’umore |
| Bavaglino | Bianco `#F6F1E7` + rosso `#D7263D` a quadretti | Si macchia con il cibo spazzatura (decal) e si pulisce a fine round |
| Occhi | Nero lucido + 2 riflessi | Riflessi veri dall’environment map, non disegnati |
| Interno bocca | Rosa `#E86A7A`, lingua `#F28C9A` | |
| Liquido pancia | Sano: verde-oro limpido · Spazzatura: marrone torbido con bolle | |

### 2.5 Materiali (realismo da giocattolo vero)
- **Corpo:** vinile soft-touch → `MeshPhysicalMaterial`, roughness 0.45–0.55, clearcoat 0.15, sheen leggero sui bordi, micro-normal map con buccia d’arancia finissima e una linea di stampo laterale appena visibile (dettaglio da collezione).
- **Pancia:** cupola trasparente. Desktop: `transmission` + `thickness`. Mobile: vetro finto (env map + fresnel + alpha) per non pagare il pass di trasmissione.
- **Liquido:** mesh interna con un piano di superficie che oscilla (shader: wobble che decade), colore e torbidezza in base all’ultimo cibo.
- **Bavaglino:** tessuto in cotone con normal map della trama, roughness alta, cucitura in rilievo.
- **Suole:** gomma, roughness 0.9, tasselli in geometria.

### 2.6 Personalità e regole del personaggio
- **È schizzinoso, non è cattivo.** Non giudica il giocatore: reagisce al cibo.
- **Non ingrassa e non cambia corpo, mai.** Il cibo spazzatura gli dà effetti buffi e temporanei (mal di pancia da cartone animato, singhiozzo, scossa da zucchero). Il rutto è solo quello vittorioso. Nessuna battuta sul peso: il gioco è per bambini, e anche per questo evitiamo di associare il corpo al cibo.
- **Parla in grammelot** (versi senza parole), più le onomatopee localizzate. Così una sola registrazione vocale funziona in tre lingue.
- **Catchphrase:** l’onomatopea con le guance gonfie prima di “Bleah!” è il suo “sound logo”.
- **Posa firma:** dopo un boccone sano alza un braccio e fa il muscolo mentre il germoglio fa un fiorellino.

### 2.7 Rig ed espressioni
**Ossa:** root, hips, spine, head, jaw, arm_L/R (2 ossa), foot_L/R, sprout_01-03 (simulazione a molla), belly_liquid (controllo).

**Morph target (blend shape):**

| Morph | Uso |
| --- | --- |
| `mouth_open_A` | Anticipazione quando il cibo sano si avvicina (si apre in base alla distanza) |
| `chew_L` / `chew_R` | Masticazione alternata |
| `swallow` | Rigonfiamento della gola che scende fino alla pancia |
| `smile_wide`, `eyes_happy_squint`, `cheeks_up` | Piacere |
| `brow_furrow`, `lip_raise_disgust`, `tongue_out`, `eyes_cross` | Smorfia di disgusto |
| `cheeks_puff` | Pre-rutto, pre-“bleah” |
| `eyes_wide`, `pupils_small` | Picco di zucchero |
| `eyelids_half` | Crollo da zucchero, noia |
| `mouth_shut_tight` | Rifiuto mentre schiva |

---

## 3. Core loop

```
 ┌───────────┐   ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
 │ ROUND N   │──▶│ 2 piatti     │──▶│ Trascina un cibo │──▶│ Reazione +   │
 │ (pancia<C)│   │ appaiono     │   │ verso Pikko      │   │ kcal + punti │
 └───────────┘   └──────────────┘   └──────────────────┘   └──────┬───────┘
       ▲                                                          │
       └────────────── pancia < capacità? ◀───────────────────────┘
                              │ no
                              ▼
                     🍽️ “Pancia piena!” → resoconto educativo → punteggio → rigioca
```

1. **Inizio:** Pikko si sveglia nel frigo, la luce si accende e saltella sul tavolo. Pancia vuota.
2. **Round:** due piatti arrivano scivolando sul tavolo (in basso nel layout portrait, ai lati in landscape).
3. **Scelta:** il giocatore trascina **uno** dei due cibi. L’altro torna nel frigo.
4. **Mangiare:** se lasci il cibo nella zona bocca, Pikko lo mangia. Se lo lasci altrove, torna sul piatto.
5. **Reazione e conseguenze:** animazione, suono, la pancia si riempie, appaiono i punti, una scheda informativa di una riga (es. *“Mela · 95 kcal · 4 g di fibre”*).
6. **Fine:** quando le kcal arrivano alla capacità (o dopo 40 round), Pikko è pieno e la partita si chiude con **vittoria** o **sconfitta**, poi parte il resoconto.

**Vittoria / sconfitta (decisa il 2026-10-03):**

| Esito | Regola proposta | Cosa fa Pikko | Suono |
| --- | --- | --- | --- |
| **Vittoria** | almeno **metà delle kcal nella pancia viene da cibo sano** (A/B), cioè la barra-pancia è “più verde che marrone” | si batte la pancia soddisfatto, **rutto vittorioso**, posa firma con il germoglio in fiore | `PIKKO_vittoria_rutto_variante04.mp3` |
| **Sconfitta** | più di metà delle kcal viene da junk (D/E) | si tiene la pancia, si piega, faccina verdognola per un attimo: **“Ahi! My stomach!”** | `PIKKO_sconfitta_Ahi_My_stomach_variante02.mp3` |

- La regola usa la stessa barra colorata dell’HUD (§4.4): il bambino *vede* se sta vincendo, senza fare conti. Insegna anche una cosa vera: poche schifezze pesano tantissimo in calorie.
- La sconfitta è comica, mai punitiva: il punteggio resta e si può rigiocare subito. Il mal di pancia è un effetto **temporaneo e buffo** (§2.6), mai legato al corpo o al peso.
- Il punteggio (§4) resta la sfida principale. Vittoria e sconfitta dicono solo *come* è finita la giornata.
- Il resoconto confronta comunque la tua partita con la “partita ideale” di quel menu.

---

## 4. Sistema di punteggio in kcal

### 4.1 Idea (la tua, formalizzata)
- La **Pancia di Pikko** ha una capacità di **2000 kcal** (il valore di riferimento delle etichette nutrizionali UE per un adulto medio. Nel gioco è solo un valore di riferimento, **non** un consiglio per bambini).
- Ogni cibo riempie la pancia delle sue kcal per **porzione reale**.
- Ogni boccone dà punti. **Più bocconi = più punti.** I cibi leggeri e sani riempiono poco, quindi danno molti bocconi. Il cibo spazzatura riempie subito, quindi la partita finisce dopo pochi bocconi.
- In più la **qualità** del cibo moltiplica i punti, così un cibo sano ma calorico (noci, avocado, salmone) non viene punito come una ciambella. **È importante per non insegnare che “calorie = cattive”.**

### 4.2 Formula

```
puntiBoccone = round( 100 × M_qualità × M_combo × M_ripetizione ) + bonusScelta

M_qualità    A=1.5  B=1.2  C=1.0  D=0.5  E=0.25        (voto del cibo, §8)
M_combo      1 + 0.1 × serieSana   (max 2.0)            serieSana = bocconi A/B consecutivi; si azzera con D/E
M_ripetizione 1.0 la 1ª e 2ª volta · 0.5 dalla 3ª volta dello stesso cibo  ("Pikko si è stufato dei cetrioli")
bonusScelta  +25 × (differenza di voto) se scegli il migliore dei due   (es. A vs E = +100)

Bonus di partita:
  +50  ogni nuovo gruppo di colore mangiato (rosso, arancio, giallo, verde, viola/blu, bianco)
  +500 "Arcobaleno": tutti e 6 i colori in una partita
  +25  bicchiere d'acqua (power-up 0 kcal, max 1 ogni 8 round, non conta come round)

Penalità abitudine (§4.5):
  M_abitudine  ×0.5 su ogni junk mangiato mentre Pikko è ABITUATO_JUNK (si somma al voto D/E)
  +300 "Palato resettato!" quando Pikko passa da ABITUATO_JUNK ad ABITUATO_SANO

Fine partita: quando kcalTotali ≥ 2000, oppure dopo 40 round ("Giornata perfetta", +1000).
Il boccone che fa traboccare la pancia vale comunque, poi game over con animazione "pancia piena".
Il limite di 40 round serve per le buste con cibi molto leggeri (es. Mercato Contadino: ~58 kcal medi per cibo sano).
```

### 4.3 Esempi (stima, per tarare)

| Stile di gioco | Bocconi | Punti per boccone (media) | Bonus | **Totale circa** |
| --- | --- | --- | --- | --- |
| Tutto sano, vario | ~24 | ~210 | ~800 | **~5.800** |
| Misto | ~13 | ~95 | ~250 | **~1.500** |
| Tutto spazzatura | ~7 | ~18 (dopo il 3° junk vale la metà) | 0 | **~125** |
| Junk → poi recupero sano | ~15 | ~110 | +300 reset + colori | **~2.200** |

La differenza di circa 45 volte rende la lezione evidente senza bisogno di spiegarla. L’ultima riga mostra che **uscire dall’abitudine conviene sempre**.

### 4.4 Barra kcal = pancia
- **Nel mondo 3D:** il liquido nella pancia di Pikko sale. È la barra principale ed è la cosa più iconica del gioco.
- **Nell’HUD:** una barra orizzontale con tacche ogni 500 kcal, numero `1.240 / 2.000 kcal` formattato per lingua, colorata a segmenti in base a cosa l’ha riempita (verde = sano, marrone = spazzatura). A fine partita la barra mostra a colpo d’occhio la “composizione” della giornata.

### 4.5 Abitudine del palato (meccanica “Pikko si vizia”)

**Idea:** il palato si abitua. Se Pikko mangia junk per un po’, il cibo sano gli sembra cattivo. Se mangia sano per un po’, il junk gli fa ancora più schifo. Sullo schermo è molto divertente, insegna qualcosa di vero e dà al giocatore una scelta in più: insistere con il sano anche quando Pikko fa i capricci.

**Stati:**

```
               3 sani di fila                       3 sani di fila
 ABITUATO_JUNK ───────────────▶ ABITUATO_SANO ◀──────────────── NEUTRO (inizio partita)
       ▲                              │                            │
       └──────── 3 junk di fila ──────┴──────── 3 junk di fila ────┘
```

- Il contatore conta i bocconi **consecutivi dello stesso tipo** (sano = A/B, junk = D/E). Il voto C (es. succo nella Busta Base) non sposta i contatori.
- Lo stato resta finché non arrivano **3 bocconi di fila del tipo opposto**. Uno o due bocconi non bastano a cambiare abitudine.
- Un indicatore discreto mostra lo stato: il germoglio (dritto e verde / curvo e giallastro) e un’icona del palato nell’HUD con 3 tacche di “cambio abitudine”.

**Reazioni e punteggio:**

| Stato di Pikko | Gli dai cibo **sano** | Gli dai **junk** |
| --- | --- | --- |
| **NEUTRO** | Felice, punti normali | Smorfia + schivata, punti D/E |
| **ABITUATO_SANO** | Felicissimo (fiorellino), punti normali + combo | **Mega smorfia** (la più esagerata del gioco), schivata più forte (+1), punti D/E **×0.5** e combo azzerata |
| **ABITUATO_JUNK** | **Smorfia di disgusto per il sano** (“palato viziato”) e **schivata del sano**: Pikko scappa dai broccoli! Punti **pieni** del cibo sano. Al 3° sano di fila: **+300 “Palato resettato!”** | Lo mangia avidamente, senza schivare… ma il germoglio si affloscia, il liquido diventa più torbido e i punti sono D/E **×0.5** |

**Regole di design importanti:**
1. **Il junk è sempre penalizzato**, anche quando Pikko lo vuole. L’abitudine cambia la *reazione*, non il *valore*.
2. **Il sano non viene mai penalizzato nei punti**, nemmeno quando Pikko fa la smorfia. Altrimenti il giocatore resterebbe intrappolato nel junk. Rompere l’abitudine deve essere difficile da fare (Pikko scappa), ma deve sempre convenire.
3. **Nessuna trappola senza uscita:** quando Pikko è ABITUATO_JUNK, ogni coppia di cibi contiene almeno un’opzione sana.
4. **Messaggio onesto** (scheda informativa al cambio di stato): *“Il palato si abitua! Nella realtà ci vogliono settimane, non 3 bocconi, ma funziona anche al contrario.”*
5. **Linguaggio:** “abitudine” / *habit* / *nawyk*, mai “dipendenza”.

---

## 5. Design dei round e difficoltà

Ogni coppia di cibi è progettata a mano (tabelle in `data/menus/*.json`), con una componente casuale tra coppie equivalenti, usando un seed.

| Fase | Round | Tipo di coppia | Timer | Schivata di Pikko |
| --- | --- | --- | --- | --- |
| **Colazione** | 1–5 | Ovvia: sano vs spazzatura (mela vs ciambella) | nessuno | lenta, 1 schivata |
| **Pranzo** | 6–15 | Scambi furbi: yogurt bianco vs gelato, frutta secca vs patatine, acqua vs cola | 8 s | media, 2 schivate |
| **Merenda** | 16–22 | Trappole: succo vs frutto intero, barretta “fitness” vs fiocchi d’avena, pane integrale vs bianco | 7 s | veloce, 2 schivate + finta |
| **Cena** | 23+ | Due cose sane con kcal diverse oppure “il male minore” (pizza margherita vs hot dog) | 6 s | veloce, 3 schivate |

**Timer scaduto:** Pikko si arrangia e prende **a caso** uno dei due, con un’espressione scocciata e niente `bonusScelta`.

**Modalità:**
- **Classica:** quella sopra.
- **Menu del giorno:** 20 round con lo stesso seed per tutti ogni giorno, classifica locale e condivisione del risultato.
- **Pikko Zen (bambini):** niente timer, niente schivate aggressive, schede informative più lunghe e lette ad alta voce (opzionale).

---

## 6. Trascinamento e schivata

### 6.1 Trascinamento
1. `pointerdown` su un piatto → raycast sul cibo → il cibo si solleva (spring), proietta un’ombra a contatto più morbida, inclinazione in base alla velocità.
2. Durante il trascinamento il cibo segue un **piano di trascinamento** davanti a Pikko con un leggero ritardo elastico. Il “peso” cambia per cibo (l’anguria è lenta, il mirtillo è veloce).
3. **Zona bocca:** sfera agganciata all’osso `jaw`. Raggio: 1× su desktop, **1.6× su touch**.
4. `pointerup` nella zona → si mangia. Fuori dalla zona → il cibo torna sul piatto con un rimbalzo.
5. `setPointerCapture` sul canvas, `touch-action: none` **solo** sulla superficie di gioco.
6. Tastiera/accessibilità: `←/→` o `1/2` selezionano il piatto, `Invio` lo porta alla bocca (con animazione automatica). Per i junk food parte comunque la schivata, che si supera con un secondo `Invio`.

### 6.2 Schivata (il “gag” del gioco)
Macchina a stati di Pikko quando il cibo trascinato è **D/E**:

```
IDLE ──(junk entro raggio R)──▶ SOSPETTO (strizza gli occhi, si tira indietro)
SOSPETTO ──(junk entro r)──▶ SCHIVA (passo laterale lontano dal puntatore, bocca serrata, mani sulla bocca)
SCHIVA ──(cooldown 0.4–0.8 s)──▶ SOSPETTO
dopo N schivate (1–3 per fase) ──▶ RASSEGNATO (sospiro, spalle giù, apre la bocca controvoglia) ──▶ MANGIA ──▶ SMORFIA
```

- Pikko si muove solo dentro un’area del tavolo (non esce mai di scena, non finisce dietro l’HUD).
- La schivata è **fisica e leggibile**: anticipazione di 120 ms (si piega dalla parte opposta) prima del passo, così il giocatore può “inseguirlo”.
- Con il cibo **A/B** fa il contrario: si sporge in avanti e apre la bocca in base alla distanza (`mouth_open_A`).
- **Schivata invertita (§4.5):** quando Pikko è ABITUATO_JUNK, la stessa macchina a stati si applica al cibo **sano**. Scappa dalla carota e si sporge verso le patatine. È la clip più condivisibile del gioco.
- **Perché il giocatore dovrebbe dargli il junk?** Perché a volte entrambe le opzioni sono junk, perché scade il timer, e perché la smorfia è divertente. Va bene: la smorfia è il premio comico, il punteggio è la lezione.

---

## 6.1 Tutorial in gioco (2026-10-04)

Il tutorial spiega tutto dentro il gioco, in tutte le 20 lingue (`tutorial.ts`, testi `tut*` in i18n):

- **Quando parte:** la prima volta che il giocatore tocca Gioca / Menu del giorno / Pikko Zen, prima della partita; sempre saltabile. Si rivede dal pulsante ❓ nel titolo, dalle Impostazioni ("Rivedi il tutorial") e dal menu pausa (solo le schede).
- **Struttura:** schede illustrate + **2 round di prova guidati** sulla scena 3D vera (zen, senza timer, senza punteggio né record). Un "coach" in basso spiega cosa succede dopo ogni boccone: il primo round sceglie tra cibo sano e spazzatura, il secondo fa provare di proposito il cibo spazzatura per vedere la smorfia e la schivata.

| # | Scheda / passo | Cosa spiega |
| --- | --- | --- |
| 1 | Ecco Pikko | trascinare il cibo (o 1/2 + Invio), sano = felice, spazzatura = smorfia e schivata |
| 2 | Riempi la pancia | kcal, vittoria con almeno metà pancia sana, giornata colazione→cena, timer del round |
| 3 | Prova 1 | trascina il cibo che credi sano (donut vs mela) |
| 4 | Prova 2 | dai di proposito il cibo spazzatura (broccoli vs barretta) |
| 5 | Il palato di Pikko | 3 spazzatura di fila = abitudine, 3 sani di fila = reset +300, la spazzatura è sempre penalizzata |
| 6 | Punti e bonus | punti per kcal, combo, arcobaleno, bonus scelta, ripetizione = noia, acqua ogni 8 round |
| 7 | Modalità | Classica 40 round, Menu del giorno 20 uguali per tutti, Zen senza timer |
| 8 | Pikko Mart | buste-Paese (20 cibi, 10 + 10, curiosità), prova di 5 round, Ricettario |
| 9 | Sbloccare le buste | **solo con la modalità bambini spenta:** lock su DevFridge + Phantom, pass da 5.000.000 PASTA, mai lock nel gioco, nessun ritiro anticipato, 2% PASTA, "non è un consiglio finanziario" |
| 10 | Condividi la giornata | scontrino, risultato in testo, link sfida, clip Bleah Cam |
| 11 | Sei pronto! | riepilogo e avvertenza "gioco educativo, non consiglio medico" |

- **Modalità bambini:** la scheda su lock e PASTA non compare ai bambini; compare agli adulti (modalità bambini spenta) e resta spiegata nel dialogo di sblocco della busta.
- **Tecnica:** `RunConfig.script` (cibi fissi per round) è la sola aggiunta al motore; il tutorial pilota i round con `Game.advance()` e l'evento `scriptBite`. Il completamento è salvato in `pikko.v1.tutorial.done`.

## 7. Reazioni

### 7.1 Cibo sano (per categoria, per associare sensazioni positive)
| Categoria | Reazione |
| --- | --- |
| Verdura croccante | Suono “crunch” profondo, occhi chiusi di piacere, il germoglio si allunga |
| Frutta | Spruzzo di succo (particelle), occhi che brillano, piccolo saltello |
| Proteine (uovo, pesce, legumi) | Fa il muscolo con il braccino: è la posa firma |
| Cereali integrali | Calore che sale lentamente, il liquido si illumina in modo costante (“energia lunga”) |
| Frutta secca | Mastica soddisfatto, accarezza la pancia |
| Acqua | Brivido di freschezza, gocce sul vinile |
| Serie di 5+ sani | Il germoglio fa un **fiorellino**, Pikko balla 2 secondi |

### 7.2 Cibo spazzatura (smorfie comiche, effetti temporanei)
| Categoria | Smorfia |
| --- | --- |
| Zuccheri (ciambelle, caramelle) | **Picco di zucchero**: occhi spalancati, tremolio veloce, gira su sé stesso… poi **crollo**: palpebre a metà, si siede. |
| Fritto/unto | Faccia lucida e mani unte (il cibo gli scivola), sospiro pesante con nuvoletta, bavaglino macchiato. *Il rutto è riservato alla vittoria (§3): così diventa il suono-trofeo di Pikko.* |
| Bibite gassate | **Singhiozzo** con bollicine che escono dalla pancia, a ogni “hic” un saltello |
| Salato (patatine) | Lingua fuori, si sventola la bocca, cerca l’acqua |
| Ultra-processato misto | La classica: guance gonfie → occhi incrociati → lingua fuori → “BLEAH!” → si scuote come un cane bagnato, il germoglio appassisce |

Il tint verdastro sul viso dura 1 secondo ed è leggero. Le smorfie si alternano (3 varianti per categoria) per non stancare.

### 7.3 Reazioni legate all’abitudine (§4.5)
| Situazione | Animazione |
| --- | --- |
| Diventa ABITUATO_JUNK | Il germoglio si piega a punto interrogativo, Pikko si stravacca, sbadiglia |
| Sano offerto mentre è ABITUATO_JUNK | Si tappa il naso, gira la testa, scappa. Quando mangia: smorfia “drammatica” (mastica piano, occhi al cielo), poi a sorpresa “…mh, non male” |
| 3° sano di fila (“Palato resettato!”) | Il germoglio si raddrizza di scatto con un “boing”, esplosione di foglioline, posa firma |
| Junk offerto mentre è ABITUATO_SANO | Mega smorfia: arretra tremando, si nasconde dietro il bavaglino, poi “BLEAAAH” lungo |

---

## 8. Database cibi (starter set)

> ⚠️ I valori kcal sono **approssimativi per porzione tipica** e vanno verificati con fonti ufficiali: USDA FoodData Central (pubblico dominio), tabelle CREA (IT), tabelle IŻŻ/NIZP-PZH (PL). Il voto A–E è un **Pikko Score interno** ispirato ai profili nutrizionali (zuccheri, grassi saturi, sale, fibre, frutta/verdura). Non è il Nutri-Score ufficiale, che in Italia è un tema politicamente divisivo: meglio un sistema proprio. **Revisione di un dietista/nutrizionista pediatrico prima del lancio.**

| id | EN | IT | PL | Porzione | kcal | Voto | Colore |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apple | Apple | Mela | Jabłko | 1 media (180 g) | 95 | A | rosso |
| banana | Banana | Banana | Banan | 1 media (120 g) | 105 | A | giallo |
| carrot | Carrot | Carota | Marchewka | 1 media (60 g) | 25 | A | arancio |
| broccoli | Broccoli | Broccoli | Brokuł | 100 g cotti | 35 | A | verde |
| strawberries | Strawberries | Fragole | Truskawki | 150 g | 48 | A | rosso |
| orange | Orange | Arancia | Pomarańcza | 1 media (130 g) | 62 | A | arancio |
| tomato | Tomato | Pomodoro | Pomidor | 1 medio (120 g) | 22 | A | rosso |
| kiwi | Kiwi | Kiwi | Kiwi | 1 (70 g) | 42 | A | verde |
| blueberries | Blueberries | Mirtilli | Borówki | 100 g | 57 | A | viola |
| yogurt | Plain yogurt | Yogurt bianco | Jogurt naturalny | 125 g | 75 | A | bianco |
| egg | Boiled egg | Uovo sodo | Jajko na twardo | 1 (50 g) | 78 | A | bianco |
| almonds | Almonds | Mandorle | Migdały | 30 g | 175 | A | — |
| avocado | Avocado | Avocado | Awokado | ½ (100 g) | 160 | A | verde |
| salmon | Salmon | Salmone | Łosoś | 100 g cotto | 205 | A | — |
| chickpeas | Chickpeas | Ceci | Ciecierzyca | 100 g cotti | 165 | A | — |
| oats | Porridge | Porridge d’avena | Owsianka | 40 g secchi | 150 | A | — |
| wholebread | Wholegrain bread | Pane integrale | Chleb pełnoziarnisty | 1 fetta (30 g) | 75 | B | — |
| water | Water | Acqua | Woda | 1 bicchiere | 0 | power-up | — |
| donut | Glazed donut | Ciambella glassata | Pączek z lukrem | 1 (65 g) | 250 | E | — |
| fries | French fries | Patatine fritte | Frytki | porzione media | 365 | E | — |
| cheeseburger | Cheeseburger | Cheeseburger | Cheeseburger | 1 | 300 | D | — |
| cola | Cola | Cola | Cola | lattina 330 ml | 140 | E | — |
| chips | Crisps | Patatine in busta | Chipsy | 30 g | 160 | E | — |
| chocobar | Chocolate bar | Barretta al cioccolato | Baton czekoladowy | 45 g | 240 | E | — |
| hotdog | Hot dog | Hot dog | Hot dog | 1 con pane | 290 | E | — |
| nuggets | Chicken nuggets | Crocchette di pollo | Nuggetsy | 6 pezzi | 270 | D | — |
| pizza | Pepperoni pizza | Pizza al salame | Pizza z salami | 1 trancio | 300 | D | — |
| juice | Fruit juice | Succo di frutta | Sok owocowy | 200 ml | 90 | C | — |
| fitbar | “Fitness” bar | Barretta “fitness” | Baton „fit” | 1 (40 g) | 180 | D | — |
| milkshake | Milkshake | Frappè | Koktajl mleczny | 350 ml | 420 | E | — |

Schema dati:

```ts
interface Food {
  id: string;
  name: { en: string; it: string; pl: string };
  fact: { en: string; it: string; pl: string };   // 1 riga, max ~60 caratteri
  portion: { en: string; it: string; pl: string };
  kcal: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'powerup';
  category: 'veg' | 'fruit' | 'protein' | 'grain' | 'nuts' | 'water' | 'sugar' | 'fried' | 'fizzy' | 'salty' | 'ultra';
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'purple' | 'white';
  model: string;          // es. 'foods/apple.glb'
  weight: number;         // inerzia nel trascinamento
  source: string;         // riferimento della fonte nutrizionale
  pack: string;           // 'base' | id della busta (§13)
}
```

---

## 9. Principi educativi ed etici (non negoziabili)

1. **Mai vergogna del corpo.** Pikko non ingrassa, nessuno viene chiamato grasso, nessun “dieta”.
2. **Le calorie non sono il nemico.** Il moltiplicatore qualità protegge i cibi sani e calorici. Il resoconto parla di *energia*, *fibre*, *zuccheri aggiunti*, *varietà*, non solo di kcal.
3. **Linguaggio:** nel gioco “spazzatura/junk” va bene come tono comico. Nelle schede educative usiamo “cibo da ogni tanto” / *sometimes food* / *jedzenie od święta*.
4. **Varietà > restrizione:** bonus arcobaleno e malus ripetizione premiano la dieta varia, non il mangiare poco.
5. **Disclaimer** nel menu info: *“Gioco educativo, non sostituisce il parere di un medico o di un nutrizionista.”*
6. **Revisione esterna:** un nutrizionista pediatrico rivede valori, voti e testi in tutte e tre le lingue.

---

## 10. Direzione visiva “ultra realistica”

**Obiettivo:** sembra un vero designer toy fotografato su un vero tavolo di cucina. Realismo dei **materiali** e della **luce**, personaggio stilizzato.

### 10.1 Scena
- **Set:** piano di un tavolo in rovere oliato (texture PBR 1K/2K, venatura nel verso corretto e in scala reale) con una tovaglietta di lino. Sullo sfondo, sfocato, l’interno di un frigo aperto con la luce calda: è la “casa” di Pikko.
- **Luce:** HDRI di una cucina diurna (Poly Haven CC0, da verificare l’asset specifico) → PMREM. Key light morbida da finestra (DirectionalLight con una sola shadow map da 1024 px) + rim light calda dal frigo.
- **Ombre:** shadow map limitata a Pikko e ai cibi + **contact shadow** morbida sotto piedi e piatti (texture o pass dedicato).
- **Tone mapping:** AgX o ACES Filmic, esposizione tarata confrontando bianchi (bavaglino, piatto) e neri (occhi).
- **Profondità di campo:** solo desktop e solo sullo sfondo (o finta, con un piano sfocato). Mai sul gameplay.

### 10.2 Cibi
- **Modelli fotogrammetrici o scolpiti a mano** con PBR coerente: buccia della mela con lenticelle e cera (clearcoat basso), glassa della ciambella lucida e traslucida, patatine con olio (roughness variabile), cola con condensa sulla lattina.
- Fonti: Poly Haven/ambientCG (CC0, verificare asset per asset), Sketchfab CC-BY (con attribuzione in `CREDITS.md`) oppure fotogrammetria propria (la scelta migliore per un look coerente e per avere i diritti).
- **Mai hotlink**: tutto servito dal nostro host, con provenienza e licenza registrate.
- Animazione “morso”: ogni cibo ha 2–3 stati mangiati (mesh o morph) per il boccone visibile prima di sparire.

### 10.3 Budget (punto di partenza, da misurare su un telefono reale)
| Voce | Desktop | Mobile |
| --- | --- | --- |
| DPR | fino a 2 | max 1.5 |
| Pikko | ~40k tri, texture 2K | LOD ~20k tri, texture 1K |
| Cibo | 3–8k tri, 1K | 2–4k tri, 512–1K |
| Luci con ombra | 1 (2048 px) | 1 (1024 px) |
| Draw call | < 120 | < 80 |
| Trasmissione pancia | sì | vetro finto |
| Post-processing | SMAA + DoF leggero | nessuno obbligatorio |
| Texture | KTX2/Basis | KTX2/Basis, fallback WebP |

Opzione **Qualità: Alta / Media / Bassa** nel menu. Loop di rendering in pausa quando la scheda è nascosta. `prefers-reduced-motion` → niente camera shake e niente tremolio, reazioni più brevi.

---

## 11. Audio

> Tutti i prompt di generazione (canzone in 3 lingue, musica di gioco, temi delle 24 buste, effetti sonori) sono in [PIKKO-AUDIO-LYRIA-PROMPTS.md](PIKKO-AUDIO-LYRIA-PROMPTS.md). Lì c’è anche la musica che cambia quando Pikko si “vizia” o torna al sano.
- **Voce di Pikko:** grammelot registrato da un doppiatore (una sessione, circa 80 versi), con le onomatopee “Gnam/Yum/Mniam” e “Bleah/Yuck/Fuj” registrate per lingua.
- **Foley realistico:** crunch di carota e mela, succo, frizzante, rutto (comico, non volgare), squeak del vinile quando salta, passi di gomma sul legno.
- **Musica:** loop jazz-lounge da cucina, si accelera nelle fasi con il timer.
- **Tecnico:** AudioContext avviato al primo gesto; mute separato dalla sospensione; ripresa con gesto dopo il blocco schermo; nessun suono accumulato.
- **Aptica:** `navigator.vibrate` breve su Android per morso e rutto (su iOS Safari non è disponibile, nessun fallback necessario).

---

## 12. Layout e controlli

| | Portrait (390×844) | Landscape telefono | Desktop |
| --- | --- | --- | --- |
| Pikko | centro-alto | centro | centro |
| Piatti | in basso, alla portata del pollice, sx/dx | ai lati sx/dx | in basso sx/dx |
| HUD | barra kcal in alto (safe area), punti in alto a dx, timer come anello attorno al piatto | barra a sx in verticale | barra in alto |
| Pausa | pulsante in alto a sx 48×48 px | idem | `Esc`/`P` |

- `100dvh`, `env(safe-area-inset-*)`, target touch ≥ 48 px.
- Le schede informative compaiono **sopra Pikko**, mai sopra i piatti, e non bloccano il round successivo.
- I dialoghi (pausa, supermercato, wallet) mettono in pausa il gioco, restituiscono il focus e si chiudono con `Esc`.

---

## 13. Pikko Mart — il supermercato e le buste espansione

### 13.1 Esperienza
Una scena 3D a parte: una corsia di supermercato realistica (scaffali in metallo verniciato, luci al neon con leggero flicker, pavimento in linoleum lucido con riflessi). Pikko spinge un carrellino. Su un espositore ci sono le **buste della spesa**: ognuna è un pacchetto espansione, riconoscibile da carta kraft o tela, logo stampato e qualche prodotto che spunta fuori.

Toccando una busta:
1. Animazione: la busta si apre e mostra in anteprima 3 cibi del pack che girano su sé stessi.
2. Scheda: nome, contenuti (numero di cibi, nuove reazioni, accessorio per Pikko), **requisito di accesso** e stato (🔒 bloccata / ✅ sbloccata / ⏳ scade il …).
3. **Prova gratuita**: 5 round con i cibi del pack, chiaramente etichettati **PROVA** (punteggio non salvato).

### 13.2 Le 24 buste: un Paese per busta (decisione 2026-10-04)

Ogni busta è un **Paese**: oltre a insegnare a mangiare sano, il gioco fa **conoscere i cibi del mondo**. Ogni busta ha **10 cibi sani** e **10 cibi “da ogni tanto”** della cucina di quel Paese. Il catalogo completo è in [PIKKO-BAGS.json](PIKKO-BAGS.json) (v0.3), con nomi EN/IT/PL, kcal, porzione, voto, categoria, una curiosità sul Paese e la palette. La fonte è `pikko-game/tools/catalog_v2.py`, validata in automatico (24 × 10 + 10, ID unici). La v0.3 (2026-10-04) aggiunge Indonesia, Russia, Ucraina e Filippine, una per ciascuna delle 4 lingue aggiunte per il pubblico crypto/Seeker: sono 4 token Pump.fun in più. Il borsch sta nella busta Ucraina: la cultura del borsch ucraino è patrimonio UNESCO (2022). Il catalogo a temi v0.1 resta in `PIKKO-BAGS-v0.1-temi.json`.

| # | Paese | Esempi sani | Esempi da ogni tanto | Pikko indossa | Logo token |
| --- | --- | --- | --- | --- | --- |
| 1 | **Italia** (IT) | Minestrone, Pasta e fagioli, Insalata caprese | Panzerotto fritto, Arancino, Cannolo siciliano | Cappello da chef | `PIKKO_IT_italy_1024.png` |
| 2 | **Polonia** (PL) | Grano saraceno, Cetrioli fermentati, Zuppa di barbabietola | Pączek alla rosa (bombolone polacco), Zapiekanka (baguette gratinata), Salsiccia alla griglia | Foulard folk di Łowicz | `PIKKO_PL_poland_1024.png` |
| 3 | **Giappone** (JP) | Edamame, Zuppa di miso, Nigiri al salmone | Tempura, Tonkatsu (cotoletta fritta), Ramen istantaneo | Fascia hachimaki | `PIKKO_JP_japan_1024.png` |
| 4 | **Messico** (MX) | Guacamole, Pico de gallo, Fagioli in pentola (frijoles de olla) | Churros con cioccolata, Chimichanga, Quesadilla fritta extra formaggio | Bavaglino papel picado | `PIKKO_MX_mexico_1024.png` |
| 5 | **Stati Uniti** (US) | Wrap al tacchino, Cobb salad leggera, Patata al forno con yogurt | Mac and cheese, Pollo fritto e waffle, Torta di mele con gelato | Cappellino di carta da diner | `PIKKO_US_usa_1024.png` |
| 6 | **India** (IN) | Dal di lenticchie, Chana masala, Pollo tandoori | Samosa, Pakora, Gulab jamun | Ghirlanda di calendule | `PIKKO_IN_india_1024.png` |
| 7 | **Francia** (FR) | Ratatouille, Insalata nizzarda, Insalata di lenticchie du Puy | Croissant al burro, Pain au chocolat, Croque-monsieur | Basco | `PIKKO_FR_france_1024.png` |
| 8 | **Spagna** (ES) | Gazpacho, Salmorejo, Pisto (verdure stufate) | Churros con cioccolata calda, Patatas bravas, Panino con calamari fritti | Sciarpa rossa e gialla | `PIKKO_ES_spain_1024.png` |
| 9 | **Grecia** (GR) | Insalata greca, Tzatziki con cetriolo, Fasolada (zuppa di fagioli) | Pita gyros con patatine, Baklava, Loukoumades (frittelle al miele) | Corona d'ulivo | `PIKKO_GR_greece_1024.png` |
| 10 | **Turchia** (TR) | Zuppa di lenticchie rosse, Insalata del pastore (çoban), Cacık (yogurt e cetriolo) | Kebab döner arrotolato, Künefe, Lokum (delizia turca) | Grembiule bianco e rosso | `PIKKO_TR_turkey_1024.png` |
| 11 | **Cina** (CN) | Pesce al vapore con zenzero, Bok choy all'aglio, Congee (porridge di riso) | Maiale in agrodolce, Involtini primavera fritti, Riso fritto con salsiccia | Fascia rossa e oro | `PIKKO_CN_china_1024.png` |
| 12 | **Corea del Sud** (KR) | Bibimbap, Kimchi, Stufato di pasta di soia (doenjang) | Pollo fritto coreano, Tteokbokki (gnocchi di riso piccanti), Ramyeon istantaneo piccante | Cuffie K-pop | `PIKKO_KR_korea_1024.png` |
| 13 | **Thailandia** (TH) | Zuppa tom yum, Insalata di papaya verde, Insalata di pollo larb | Pad thai, Riso glutinoso al mango, Tè thai al latte | Ghirlanda di gelsomino | `PIKKO_TH_thailand_1024.png` |
| 14 | **Vietnam** (VN) | Phở di manzo, Involtini freschi (gỏi cuốn), Zuppa agra di pesce (canh chua) | Bánh mì con paté e maionese, Involtini fritti (chả giò), Dolce dei tre colori (chè ba màu) | Cappello conico nón lá | `PIKKO_VN_vietnam_1024.png` |
| 15 | **Brasile** (BR) | Riso e fagioli (arroz com feijão), Moqueca di pesce, Açaí puro (senza zucchero) | Coxinha (crocchetta di pollo), Pastel fritto, Brigadeiros | Fascia verde e oro | `PIKKO_BR_brazil_1024.png` |
| 16 | **Perù** (PE) | Ceviche peruviano, Insalata di quinoa, Mais andino con formaggio | Lomo saltado con patatine, Salchipapa (wurstel e patatine), Picarones con sciroppo | Cappello chullo | `PIKKO_PE_peru_1024.png` |
| 17 | **Marocco** (MA) | Zuppa harira, Tajine di verdure, Zaalouk (insalata di melanzane) | Tè alla menta molto zuccherato, Chebakia (biscotti al miele), Pastilla dolce di pollo | Sciarpa rossa e verde | `PIKKO_MA_morocco_1024.png` |
| 18 | **Regno Unito** (GB) | Porridge con frutti di bosco, Patata al cartoccio con fagioli, Purè di piselli (mushy peas) | Fish and chips, Colazione inglese completa, Sfogliatina alla salsiccia | Cappello da pioggia giallo | `PIKKO_GB_uk_1024.png` |
| 19 | **Germania** (DE) | Stufato di lenticchie (Linseneintopf), Pane integrale di segale, Quark alle erbe | Currywurst con patatine, Bratwurst nel panino, Cotoletta (Schnitzel) con patatine | Sciarpa nero-rosso-oro | `PIKKO_DE_germany_1024.png` |
| 20 | **Nigeria** (NG) | Efo riro (stufato di spinaci), Moi moi (sformato di fagioli al vapore), Zuppa di okra | Puff-puff (frittelle dolci), Chin chin (biscottini fritti), Pasticcio di carne | Sciarpa verde e bianca | `PIKKO_NG_nigeria_1024.png` |
| 21 | **Indonesia** (ID) | Gado-gado, Tempeh alla griglia, Sayur asem (zuppa di verdure al tamarindo) | Martabak dolce al cioccolato, Gorengan (frittelle), Krupuk | Fascia batik (iket) | `PIKKO_ID_indonesia_1024.png` |
| 22 | **Russia** (RU) | Shchi (zuppa di cavolo), Grano saraceno ai funghi, Vinegret | Blini con latte condensato, Pirozhki fritti, Belyashi | Colbacco ushanka | `PIKKO_RU_russia_1024.png` |
| 23 | **Ucraina** (UA) | Borsch ucraino, Holubtsi (involtini di cavolo), Uzvar senza zucchero | Salo su pane di segale, Pampushky dolci fritti, Torta Kyiv | Corona di fiori vinok | `PIKKO_UA_ukraine_1024.png` |
| 24 | **Filippine** (PH) | Sinigang, Pinakbet, Tinola | Lechon, Sisig, Halo-halo | Cappello salakot | `PIKKO_PH_philippines_1024.png` |

**Logo = immagine del token su Pump.fun.** Ogni busta ha il suo logo in [PIKKO_TOKEN_LOGOS/](PIKKO_TOKEN_LOGOS/) (PNG 1024×1024 e 512×512, quadrato e leggibile anche ritagliato a cerchio). Il sorgente vettoriale è in `pikko-game/public/logos/<busta>.svg`. Il disegno è uguale per tutti: busta di carta kraft, il piatto simbolo del Paese che spunta fuori, una fascia con i colori del Paese, il codice del Paese in grande e il germoglio di Pikko come firma.
- I loghi usano **palette ispirate** ai Paesi, **non bandiere né stemmi** (alcuni Paesi limitano l'uso commerciale delle bandiere). Prima di pubblicare un token è comunque da verificare per ogni Paese.
- I loghi sono illustrazioni vettoriali originali fatte per PIKKO: nessuna immagine di terzi.

**Nel gioco:** il Pikko Mart mostra il logo di ogni busta. All'inizio di una partita parte la curiosità sul Paese, ogni scheda cibo indica il Paese, e il Ricettario diventa un **passaporto del gusto** raggruppato per Paese (es. “Perù · 7/20”).

**Come si gioca una busta:** la partita usa per circa il 70% i cibi della busta e per il 30% quelli della Busta Base. Così le ripetizioni restano poche anche nelle partite lunghe, e le coppie mischiano cibi “nuovi” e cibi “noti”.

**Rispetto per le cucine:** dolci tradizionali, street food fritto e piatti da festa (cannolo, pączek, baklava, jollof da festa…) stanno nella colonna “da ogni tanto”. Nelle schede vanno presentati come **“da festa / da ogni tanto”**, mai come cibo “cattivo”. Nessuna cucina è “sana” o “malsana” in blocco: ognuna ha entrambe le colonne.

### 13.3 Busta = token in timelock (la tua idea)
Ogni busta corrisponde a un token Solana che creerai. Il giocatore lo blocca volontariamente su **DevFridge** e la busta si sblocca **finché il lock è attivo**.

**Come funziona tecnicamente:**
- Non serve un nuovo contratto di timelock: si riusa il programma Fridge esistente (`9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6`, Solana mainnet). Il gioco **legge** i lock tramite l’API/SDK DevFridge e applica le proprie regole per ogni busta.
- I token restano nel vault PDA del programma, non in un wallet nostro.
- Le regole sono indipendenti per ogni mint.

**Decisione presa (2026-10-03, buste per Paese dal 2026-10-04): un token Pump.fun per Paese, 20 mint in totale, logo del token = logo della busta.** La regola è: **basta un lock attivo del token di quella busta.** Durata originale e tempo residuo non contano, conta solo che il lock non sia ancora scaduto.

Ogni busta è una mini-community con il suo Paese e il suo piatto simbolo (i “Pierogi holders”, gli “Onigiri holders”…). Per gestirla bene:
- **Ogni mint viene verificato singolarmente** (§13.5). Le buste con mint non verificato restano in modalità prova, mentre le altre funzionano normalmente.
- **Lanci scaglionati:** non uscire con 20 token il primo giorno. Ogni nuova busta è un evento (vedi §14), che aiuta la viralità e concentra l’attenzione di una community alla volta.
- **Il riscatto è per-token:** ogni token ha bisogno della sua route Jupiter per il 2% PASTA. Un token con poca liquidità potrebbe non essere riscattabile subito alla scadenza. Va detto nell’onboarding di quella busta.

### 13.4 Regola di accesso per busta (configurazione)

#### Pass PASTA: tutte le buste, finché non partono i token dei Paesi (decisione 2026-10-04)

Nel frattempo **un solo lock attivo di 5.000.000 PASTA su [devfridge.cool](https://devfridge.cool) sblocca TUTTE le buste.** La regola vale anche dopo il lancio dei token dei Paesi: una busta si apre con il pass **oppure** con il suo token.

| Parametro | Valore |
| --- | --- |
| Mint PASTA | `39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump` (da [docs.devfridge.cool/tokenomics](https://docs.devfridge.cool/tokenomics)) |
| Verifica on-chain (2026-10-04, RPC mainnet) | programma **Token-2022**, **6 decimali**, nessuna autorità di mint né di freeze, solo estensioni `metadataPointer` e `tokenMetadata` (nome "pappardelle", simbolo PASTA) |
| Minimo | `5000000` PASTA = `5000000000000` raw |
| Aggregazione | **`single`**: serve un unico lock da almeno 5.000.000 PASTA (più lock piccoli non si sommano; si cambia con `aggregation: 'sum'`) |
| Durata | qualsiasi, basta che il lock sia **attivo adesso** (come per le buste dei Paesi) |
| Riscatto | per i vault PASTA il 2% viene bruciato direttamente (nessuna route Jupiter necessaria) |

**Wallet (2026-10-16):** `src/access/wallet.ts` unisce i wallet Wallet Standard (estensioni desktop) e **Mobile Wallet Adapter** (Solana Seeker: Seed Vault Wallet, Solflare, Phantom; solo Android + Chrome + HTTPS, caricato in modo lazy) con il Phantom iniettato (browser interno di Phantom). Con più wallet il giocatore sceglie; senza wallet su telefono c'è il link "Apri in Phantom". Il gioco legge solo la chiave pubblica e non firma mai.

Il gioco mostra il minimo e il mint, il 2% PASTA e la regola "nessun ritiro anticipato" prima di qualsiasi lock; il lock si fa solo su DevFridge, mai dentro il gioco. Il controllo nel browser resta una comodità (UX), non una protezione. Implementazione: `PASS_ACCESS` in `src/access/bags.config.ts`, `checkBag`/`checkPass` in `src/access/gate.ts`, test in `tests/access.test.ts`.


```ts
// src/access/bags.config.ts — VALORI SEGNAPOSTO, nessuno è reale finché non viene verificato
export const BAGS = [
  {
    id: 'mediterranean',
    mint: 'TBD_FULL_BASE58_MINT',      // CA Pump.fun completo, mai solo il ticker
    decimals: null,                    // letto e verificato via RPC, non indovinato
    minimumTokens: 'TBD',              // ⚠️ vedi nota sotto: con "1 unità raw" basterebbe un lock di polvere
    minOriginalSeconds: 0,             // DECISO: qualsiasi durata del lock
    minRemainingSeconds: 0,            // DECISO: basta che sia attivo adesso
    aggregation: 'sum',                // somma più lock dello stesso mint
    verified: false,                   // true solo dopo la verifica Token-2022 / estensioni / route
  },
];
```

> ⚠️ **Quantità minima, decisione aperta.** “Basta un lock attivo” senza una quantità minima significa che chiunque può bloccare 0,000001 token (pochissimi centesimi) per 1 minuto e sbloccare la busta. Consiglio di fissare un minimo per busta (anche piccolo, uguale per tutte e 20, così è facile da comunicare). La durata può restare libera.

- **Valutazione:** `GET https://scan.devfridge.cool/api/sdk/check?wallet=…&mint=…` → `evaluateTimelocks()` (helper testato della skill DevFridge, BigInt sulle stringhe raw, freshness ≤ 90 s, `nextCheckAt` per il ricontrollo).
- **Ricontrollo:** quando si apre il Pikko Mart, quando l’app torna in primo piano, ogni 60 s mentre si gioca una busta, e a `nextCheckAt`. Coalescenza delle richieste e backoff su 429.
- **Errore API ≠ zero token:** in caso di errore la busta mostra “Verifica non disponibile, riprova”, non “bloccata”. Se un lock scade durante una partita, la partita in corso finisce normalmente e il blocco vale dalla successiva.
- **Cambio account o disconnessione:** accesso azzerato subito e risposte in volo ignorate.

### 13.5 Verifiche obbligatorie prima di attivare lock reali (per ogni mint)
1. Il mint è **Token-2022** e compatibile con Fridge (il programma gestisce timelock Token-2022). Un token Pump.fun **non è automaticamente** compatibile: verifica program owner, decimals ed estensioni via RPC affidabile.
2. Esiste una **route Jupiter eseguibile** per il riscatto (serve per il 2% PASTA). Un token illiquido o non graduato potrebbe non essere riscattabile subito alla scadenza.
3. Report su DevFridge Scan e badge accanto al token nel Mart (il badge mostra il lock aggregato del mint, **non** prova che *questo* giocatore abbia accesso).

Finché un mint non passa queste verifiche, la sua busta resta in **modalità prova**, chiaramente etichettata.

### 13.6 Testo di onboarding (da mostrare **prima** di qualsiasi firma)

**IT**
> La tua busta si apre con un lock. Collega Phantom e blocca **[quantità] [TOKEN]** su DevFridge per sbloccare **[busta]** finché il lock è attivo. Il gioco controlla il lock su Solana.
> Scegli bene la data di sblocco: **non è possibile ritirare prima.** Quando riscatti dopo la scadenza, DevFridge trattiene **il 2% dell’importo del vault** per comprare e bruciare PASTA, il token che sostiene lo sviluppatore dell’ecosistema. Le commissioni di rete sono a parte. Prima di bloccare, verifica la compatibilità del token e la possibilità di riscattarlo.

**EN**
> Your bag opens with a lock. Connect Phantom and lock **[amount] [TOKEN]** on DevFridge to unlock **[bag]** while your lock is active. The game checks that lock on Solana.
> Choose your unlock date carefully: **there is no early withdrawal.** When you redeem after expiry, DevFridge takes **2% of the redeemed vault amount** to buy and burn PASTA, the token that supports the ecosystem's developer. Network fees are separate. Check token compatibility and redemption routing before you lock.

**PL** *(da far rivedere a un madrelingua)*
> Twoja torba otwiera się dzięki blokadzie. Połącz Phantom i zablokuj **[ilość] [TOKEN]** w DevFridge, aby odblokować **[torbę]** na czas trwania blokady. Gra sprawdza blokadę w sieci Solana.
> Wybierz datę odblokowania rozważnie: **nie ma możliwości wcześniejszej wypłaty.** Przy wypłacie po wygaśnięciu DevFridge pobiera **2% kwoty z sejfu**, aby kupić i spalić PASTA, token wspierający twórcę ekosystemu. Opłaty sieciowe są osobne. Przed zablokowaniem sprawdź zgodność tokena i możliwość wypłaty.

Prima della firma mostra sempre: mint completo, quantità esatta, data di sblocco ed esempio del 2% (es. vault da 100.000 → 2.000 di commissione, 98.000 restituiti, prima delle commissioni di rete). Niente promesse di rendimento, niente FOMO, niente “blocca di più per non perdere tutto”.

### 13.7 ⚠️ Pubblico di minori — punto critico
Il gioco insegna a mangiare sano, quindi una parte dei giocatori sarà **bambina**. Wallet e token **non** devono rivolgersi a loro.
- **Modalità Bambini predefinita:** il gioco base completo, senza nessuna interfaccia crypto visibile.
- **Area Genitori / Adulti** con age-gate per il Pikko Mart e il wallet. Messaggi rivolti agli adulti (“sblocca nuove buste per la tua famiglia”), non ai bambini.
- Verificare i requisiti d’età di Phantom e le norme locali (GDPR art. 8 / consenso dei minori in IT e PL, regole UE su pubblicità ai minori e su cripto-attività/MiCA, policy degli store se in futuro ci sarà un’app). **Serve un parere legale**, non posso darlo io.
- Niente tracciamento o profilazione nella modalità bambini.

### 13.8 Limiti di sicurezza (da dire chiaramente)
- Il blocco lato browser è **UX**, non protezione: chi scarica il codice può vedere gli asset delle buste. Se vuoi proteggere davvero i contenuti: gli asset delle buste sono serviti da un server dopo un **sign-in con firma del wallet** (nonce monouso, verifica Ed25519 lato server) e un controllo dei lock aggiornato lato server.
- I punteggi sono **locali** e marcati “record locale”. Una classifica competitiva richiede punteggi autorevoli lato server (fase successiva, non inclusa).

### 13.9 Produzione dei 480 cibi 3D HD

È la voce di lavoro più grande di tutto il progetto: **400 modelli** (430 con la Busta Base). Non si improvvisano. I modelli procedurali vanno bene solo come segnaposto di sviluppo, etichettati “blockout”, non come asset HD finali.

**Specifica unica per ogni cibo** (identica per tutti, così il gioco li tratta allo stesso modo):

| Voce | HD (desktop) | Mobile (LOD1) |
| --- | --- | --- |
| Triangoli | ≤ 20k | ≤ 5k |
| Texture PBR | 2K: baseColor, normal, ORM | 1K |
| Formato | GLB, meshopt, KTX2 (UASTC per normal, ETC1S per colore) | idem |
| Peso indicativo | ≤ 1,5 MB | ≤ 400 KB |
| Scala / pivot | centimetri reali, pivot al centro della base, Y in alto | idem |
| Nome file | `bags/<bagId>/<foodId>.glb` (ID da PIKKO-BAGS.json) | `…/<foodId>.lod1.glb` |

- **Il morso senza modelli extra:** shader con maschera “a morso” (dissolve con SDF a forma di dentini + bordo di colore interno), in 2–3 morsi progressivi. Evita di modellare 800 varianti “morse”.
- **Download per busta:** si scarica solo quando entri nella busta (HD ~30 MB, mobile ~8 MB). La Busta Base deve stare sotto ~10 MB per far partire subito la prima partita.
- **Fonti, in ordine di qualità e controllo:**
  1. **Fotogrammetria propria** (cibo vero, set con luce diffusa e giradischi, poi cleanup e retopo). Look più coerente e diritti certi.
  2. **3D artist su commissione**, con cessione dei diritti scritta.
  3. **Marketplace** (licenze da verificare per l’uso in un gioco web: i GLB sono scaricabili dal browser, quindi alcune licenze lo vietano).
  4. **Generatori AI image/text-to-3D**: veloci per una prima bozza, ma servono retopo, ri-texturing PBR e controllo dei termini d’uso commerciale. Da soli non garantiscono la qualità HD.
- **Validazione automatica:** uno script con `gltf-transform` controlla per ogni GLB triangoli, texture, scala, pivot e nomi. Gira in CI e blocca gli asset fuori specifica.
- **Registro diritti:** `CREDITS.json` con autore, fonte, licenza e data per ognuno dei 400 asset.
- **Piano realistico:** produrre a lotti di 20 (una busta alla volta), allineati ai lanci scaglionati dei token.

---

## 14. Viralità e retention

### 14.1 Cosa c’è già (e funziona)
- **Un personaggio con reazioni comiche** (smorfie, rutti, schivate): sono le cose che la gente registra e condivide.
- **La schivata invertita** (Pikko “viziato” che scappa dai broccoli): una gag originale, perfetta per clip di 5 secondi.
- **Onomatopee nelle 3 lingue** (*Bleah / Fuj / Gnam / Mniam*): suonano bene anche senza traduzione.
- **20 community di token**, ognuna con un motivo per spingere la *propria* busta.

### 14.2 Cosa manca: le mie raccomandazioni in ordine di impatto

| # | Funzione | Perché funziona | Costo |
| --- | --- | --- | --- |
| 1 | **“Bleah Cam”**: il gioco registra in automatico gli ultimi 5 s della reazione migliore (`canvas.captureStream` + `MediaRecorder`), video verticale 9:16 con logo PIKKO, pronto per TikTok, Reels e Shorts | La smorfia *è* il contenuto. Ogni condivisione è uno spot | medio |
| 2 | **“Scontrino di Pikko”**: a fine partita un’immagine a forma di scontrino del supermercato con i cibi mangiati, le kcal, il punteggio e il “cassiere: Pikko”. Si condivide con la Web Share API | Riconoscibile al primo colpo, coerente con il Pikko Mart, non serve spiegarlo | basso |
| 3 | **Menu del giorno con griglia emoji** in stile Wordle: `PIKKO #142 🟢🟢🟤🟢🟢🌸 5.820` | Si condivide senza spoiler e crea un appuntamento quotidiano | basso |
| 4 | **Link sfida**: “Batti il mio menu” → il link contiene solo il seed della partita (nessun dato personale), così l’amico gioca la stessa sequenza | Trasforma ogni partita in un invito diretto | basso |
| 5 | **Creator kit**: Pikko su green screen / sfondo trasparente con tutte le reazioni (WebM con alpha + PNG), più un pacchetto di sticker per Telegram e WhatsApp | I creator fanno meme con Pikko senza bisogno di giocare. È così che un personaggio diventa iconico | medio |
| 6 | **Lancio di una busta = evento**: una busta nuova ogni 1–2 settimane, con un Menu del giorno speciale e l’accessorio mostrato in anteprima | Ritmo costante di novità, la community del token ha un momento tutto suo | basso (con gli asset pronti) |
| 7 | **Accessorio sullo scontrino e nella Bleah Cam**: se hai sbloccato la Busta Giappone, il tuo Pikko nelle condivisioni porta la fascia hachimaki | Chi ha un lock attivo lo mostra in modo naturale, senza parlare di prezzi | basso |
| 8 | **Prima partita velocissima**: gioco giocabile in meno di 5 secondi con una connessione 4G (Busta Base < 10 MB, niente wallet e niente registrazione prima di giocare) | Un link condiviso che carica lentamente è un link perso | medio |
| 9 | **Anteprima social del link**: immagine Open Graph / Twitter card con una smorfia di Pikko diversa per ogni lingua | Il link si presenta da solo in chat | basso |
| 10 | **Modalità Classe** (versione bambini, senza nessuna parte crypto): schede stampabili, menu tematici per i docenti | Gli insegnanti diffondono il gioco gratis e lo rendono credibile | medio |

### 14.3 Cosa **non** fare
- **Niente ricompense in token per chi condivide** o porta amici: spinge allo spam e rischia di sembrare un’offerta finanziaria, cosa da evitare tanto più in un gioco educativo.
- Niente scarsità finta, conti alla rovescia aggressivi o messaggi tipo “blocca ora o perdi la busta”.
- Nella modalità bambini nessuna funzione social diretta: la condivisione passa dall’Area Genitori.

### 14.4 Retention
- **Ricettario di Pikko:** un album con tutti i cibi scoperti, modello 3D girevole e scheda. Completare l’album di una busta sblocca un accessorio.
- **Menu del giorno:** seed giornaliero, risultato condivisibile (*“Ho dato 24 bocconi sani a Pikko 🥕 5.820 pt”*).
- **Serie di giorni senza punizione:** se salti un giorno non perdi niente, semplicemente non aumenti la serie.
- **Armadio di Pikko:** bavaglini e accessori dal gioco e dalle buste. Pikko è il personaggio, gli accessori sono l’identità del giocatore.
- **Iconicità fuori dal gioco:** pacchetto di sticker (le 6 smorfie), emoji, una GIF per ogni reazione, un pupazzo in vinile stampabile in 3D (lo stesso modello del gioco).
- Metriche da misurare separatamente dal TVL dei lock: completamento della prima partita, ritorno a 1 e a 7 giorni, partite per sessione. Le idee qui sopra sono ipotesi di design, non risultati garantiti.

---

## 15. Localizzazione: 20 lingue, una busta per lingua

**Aggiornamento 2026-10-04.** Il gioco ha 20 lingue nel menu (pulsante 🌐 sul titolo e selettore nelle Impostazioni). Ogni lingua ha la **sua busta-Paese** (`LANG_META[lang].bag`): nel selettore compare il logo della busta e nel Mart quella busta sta subito dopo la Busta base, con 📍 e contorno arancione.

| Lingua | Busta di casa | Lingua | Busta di casa |
| --- | --- | --- | --- |
| English | Regno Unito | Ελληνικά | Grecia |
| Italiano | Italia | Türkçe | Turchia |
| Polski | Polonia | العربية (RTL, `ar-MA`) | Marocco |
| Español | Spagna | हिन्दी | India |
| Français | Francia | 中文 (`zh-CN`) | Cina |
| Deutsch | Germania | 日本語 | Giappone |
| Português (`pt-BR`) | Brasile | 한국어 | Corea |
| ไทย | Thailandia | Tiếng Việt | Vietnam |
| Bahasa Indonesia | Indonesia | Русский | Russia |
| Українська (`uk`) | Ucraina | Filipino (`fil`, anche browser `tl`) | Filippine |

Le buste USA, Messico, Perù e Nigeria non hanno una lingua "di casa" propria: usano inglese o spagnolo. EN/IT/PL stanno nel bundle; le altre 17 lingue sono file `src/i18n/locales/<lang>.json` caricati solo quando servono (UI completa, 25 buste, 510 cibi). Russo e ucraino hanno i plurali one/few/many. `tests/locales.test.ts` blocca chiavi, segnaposto, cibi o buste mancanti.

- **Le 17 traduzioni nuove sono automatiche** (campo `review` in ogni file) e vanno riviste da madrelingua prima del lancio, soprattutto il testo informativo su lock e 2% PASTA.
- **Voci registrate** (sconfitta, yum, bleah) esistono solo in EN/IT/PL: le altre lingue usano l'inglese finché non generiamo le voci.
- **Solana dApp Store:** non ha un elenco chiuso di lingue (accetta qualsiasi locale BCP-47; default `en-US`). Nel build Android/TWA vanno dichiarati esplicitamente i 20 locale (`resConfigs`), perché Bubblewrap di default dichiara "tutte le lingue".

### 15.1 Regole di base (valgono per tutte le lingue)

- File `src/i18n/{en,it,pl}.json` con chiavi complete. **Mai concatenare frasi:** il polacco declina il nome (*Daj jedzenie Pikkowi*, *Brzuszek Pikka jest pełny*).
- Plurali con `Intl.PluralRules` (il PL ha *1 punkt / 2–4 punkty / 5+ punktów*).
- Numeri con `Intl.NumberFormat` (EN `1,240` · IT `1.240` · PL `1 240`).
- Il layout deve reggere circa il 30% di testo in più (il polacco è spesso più lungo).
- Lingua scelta da `navigator.language`, poi selettore con bandierina, salvata in `localStorage` (in try/catch).

| Chiave | EN | IT | PL |
| --- | --- | --- | --- |
| `play` | Play | Gioca | Graj |
| `drag_hint` | Drag a food to Pikko | Trascina un cibo da Pikko | Przeciągnij jedzenie do Pikka |
| `belly` | Belly | Pancia | Brzuszek |
| `belly_full` | Pikko is full! | Pikko è pieno! | Pikko jest pełny! |
| `score` | Score | Punti | Wynik |
| `round` | Round | Round | Runda |
| `combo` | Healthy streak ×{n} | Serie sana ×{n} | Zdrowa seria ×{n} |
| `rainbow` | Rainbow bonus! | Bonus arcobaleno! | Bonus tęczy! |
| `bored` | Pikko is bored of {food} | Pikko si è stufato di {food} | Pikko ma dość: {food} |
| `habit_junk` | Pikko got used to junk! | Pikko si è viziato col junk! | Pikko przyzwyczaił się do śmieciowego jedzenia! |
| `habit_healthy` | Pikko loves healthy food now! | Pikko si è abituato al sano! | Pikko polubił zdrowe jedzenie! |
| `palate_reset` | Palate reset! +300 | Palato resettato! +300 | Smak zresetowany! +300 |
| `habit_fact` | Taste adapts! In real life it takes weeks, not 3 bites. | Il palato si abitua! Nella realtà ci vogliono settimane, non 3 bocconi. | Smak się przyzwyczaja! W prawdziwym życiu trwa to tygodnie, nie 3 kęsy. |
| `victory` | Healthy day! Pikko wins! | Giornata sana! Pikko ha vinto! | Zdrowy dzień! Pikko wygrywa! |
| `defeat` | Ouch… too much junk today! | Ahi… troppo junk oggi! | Auć… dziś za dużo śmieciowego jedzenia! |
| `defeat_voice` *(audio)* | “Ahi! My stomach!” | proposta: “Ahi! Il mio pancino!” | proposta: “Aj! Mój brzuszek!” |
| `share_receipt` | Share Pikko's receipt | Condividi lo scontrino di Pikko | Udostępnij paragon Pikka |
| `challenge` | Beat my menu! | Batti il mio menu! | Pobij moje menu! |
| `time_up` | Time's up! Pikko picks… | Tempo scaduto! Sceglie Pikko… | Koniec czasu! Pikko wybiera… |
| `mart` | Pikko Mart | Pikko Mart | Pikko Mart |
| `bag` | Shopping bag | Busta della spesa | Torba na zakupy |
| `locked` | Locked | Bloccata | Zablokowana |
| `unlocked_until` | Unlocked until {date} | Sbloccata fino al {date} | Odblokowana do {date} |
| `trial` | TRIAL — score not saved | PROVA — punti non salvati | PRÓBA — wynik niezapisany |
| `connect` | Connect Phantom | Collega Phantom | Połącz Phantom |
| `check_failed` | Couldn't verify — try again | Verifica non riuscita, riprova | Nie udało się sprawdzić, spróbuj ponownie |
| `local_best` | Local best | Record locale | Rekord lokalny |
| `disclaimer` | Educational game — not medical advice. | Gioco educativo, non è un consiglio medico. | Gra edukacyjna, nie porada medyczna. |

---

## 16. Architettura tecnica

```
src/
  main.ts                 bootstrap, feature detection WebGL, fallback visibile
  sim/                    logica pura, testabile, senza Three.js
    rules.ts              punteggio (§4), capacità, combo, ripetizioni
    rounds.ts             generatore di coppie con seed (§5)
    pikkoBrain.ts         macchina a stati IDLE/SOSPETTO/SCHIVA/RASSEGNATO/MANGIA/REAZIONE
  render/
    scene.ts              renderer, PMREM, luci, ombre, qualità, resize con ResizeObserver
    pikko.ts              GLB, AnimationMixer, morph target, molla del germoglio, liquido pancia
    foods.ts              caricamento lazy dei GLB per busta, LOD, dispose
    mart.ts               scena supermercato
  input/
    drag.ts               pointer events → azioni (mouse/touch/penna), zona bocca
    keyboard.ts           selezione e conferma accessibili
  audio/                  WebAudio, banchi di suoni, ripresa dopo il blocco schermo
  access/
    phantom.ts            Wallet Standard / window.phantom.solana, deeplink "Apri in Phantom"
    gate.ts               fetch API DevFridge + evaluateTimelocks + ricontrolli
    bags.config.ts        §13.4
  i18n/                   en.json · it.json · pl.json
  ui/                     HUD, dialoghi, resoconto, Ricettario (DOM sopra il canvas)
  data/
    foods.json            §8
    menus/*.json          coppie per fase e per busta
public/models, public/textures, CREDITS.md
```

- **Simulazione a passo fisso** (60 Hz, recupero limitato), rendering indipendente.
- **Pikko:** modellato in Blender, esportato in GLB con morph target e clip (`idle`, `hop`, `chew`, `swallow`, `flex`, `dodge_L/R`, `cover_mouth`, `sigh`, `disgust_A/B/C`, `burp`, `hiccup`, `sugar_rush`, `crash`, `victory_burp`, `defeat_stomach_ache`). Compressione con `gltf-transform` (meshopt + KTX2).
- **Fallback procedurale** solo durante lo sviluppo, etichettato “blockout”.
- **Persistenza locale:** record, Ricettario, armadio, lingua, qualità. Tutto con try/catch; il gioco funziona anche senza.
- **WebGL context lost:** pausa + overlay “Ripristino grafica…”, ricostruzione delle risorse.
- Dipendenze bloccate nel lockfile (three `0.186.1`, già presente).

---

## 17. Piano di test

**Logica (unit test, `node --test` o Vitest):**
- formula del punteggio: confini di combo, ripetizione, overflow della pancia, power-up acqua
- generatore di round: stesso seed = stessa sequenza; nessuna coppia identica
- regole delle buste: soglia esatta (uguale / meno 1 unità raw), lock scaduto, somma di più lock, prova scaduta per freschezza, errore API, risposta per l’account vecchio dopo un cambio account

**Gameplay e dispositivi:**
- partita completa → resoconto → rigioca; pausa e ripresa; timer scaduto
- trascinamento con mouse, touch e tastiera; zona bocca su touch; la schivata non porta mai Pikko fuori area
- 390×844 portrait, telefono landscape, desktop; safe area con notch; cambio orientamento a metà round
- audio dopo il blocco schermo, mute persistente; reduced motion; perdita del contesto WebGL
- Phantom desktop, Phantom in-app browser mobile, nessun wallet, firma rifiutata, cambio account
- **Distinguere** l’emulazione dai test su un telefono reale. Gli FPS si dichiarano solo se misurati.

**Mai durante i test:** firmare lock reali, comprare token o approvare spese.

---

## 18. Roadmap

| Milestone | Contenuto | Uscita |
| --- | --- | --- |
| **M0 — Blockout giocabile** | loop completo con cibi segnaposto, punteggio, schivata, resoconto, 3 lingue | build locale |
| **M1 — Pikko vero** | modello, rig, morph, 6 reazioni, liquido pancia, materiali vinile; screenshot desktop e telefono per l’approvazione | **gate artistico** |
| **M2 — Cucina realistica** | set, HDRI, 30 cibi PBR, audio, qualità Alta/Media/Bassa | beta pubblica gratuita |
| **M3 — Pikko Mart + viralità** | scena supermercato, 24 buste in modalità prova, Ricettario, armadio, Scontrino di Pikko, Bleah Cam, Menu del giorno, link sfida | |
| **M4 — Accesso DevFridge** | Phantom, gate per busta (20 mint, regola “lock attivo”), onboarding con il 2%, Area Genitori; attivato **solo** per i mint verificati | prime 2–3 buste |
| **M5 — Live** | un lancio di busta ogni 1–2 settimane (asset a lotti di 20), creator kit, buste stagionali al momento giusto (Halloween, Natale, Pasqua), (opzionale) classifica server | |

---

## 19. Decisioni aperte

| # | Domanda | Default proposto |
| --- | --- | --- |
| 1 | Nome definitivo | ✅ **PIKKO** (manca la verifica di marchio e dominio) |
| 2 | Un token o un token per busta (§13.3) | ✅ **un token per busta**, 20 mint |
| 3 | 20 CA Pump.fun + decimals | **Blocker per M4.** Me li dai tu; finché mancano: modalità prova |
| 4 | Regola di durata | ✅ **basta un lock attivo** |
| 4b | Quantità minima per busta | ❓ consiglio un minimo uguale per tutte, altrimenti basta un lock di polvere |
| 4c | Ordine di lancio delle buste | proposta: Italia + Polonia (le due community “di casa”), poi un Paese ogni 1–2 settimane |
| 4d | Chi produce i 400 modelli HD e con che metodo (§13.9) | ❓ fotogrammetria o artista su commissione |
| 5 | Chi fa il modello 3D di Pikko (interno, freelance, AI + ritocco) e i diritti | modello originale, diritti ceduti per iscritto |
| 6 | Fonte nutrizionale ufficiale e revisore | FoodData Central + CREA + IŻŻ, nutrizionista pediatrico |
| 7 | Parere legale per minori + token in IT/PL/UE | necessario prima di M4 |
| 8 | Hosting e dominio | da decidere |

---

## 20. Fonti e date
- Meccanica DevFridge (vault, 2% PASTA buy-and-burn, niente ritiro anticipato): https://docs.devfridge.cool/fridge · https://docs.devfridge.cool/tokenomics · https://docs.devfridge.cool/program (revisione della skill: 2026-09-22, **da ricontrollare al lancio**)
- SDK/API: https://sdk.devfridge.cool · endpoint `https://scan.devfridge.cool/api/sdk/check`
- Programma: https://solscan.io/account/9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6 (verified build osservata il 2026-09-22 sul commit `292645a`; nessun audit indipendente dichiarato in SECURITY.md)
- Phantom: https://docs.phantom.com/solana/integrating-phantom
- Three.js: https://threejs.org/manual/pages/color-management.html · https://threejs.org/manual/pages/responsive.html
- Asset CC0: https://polyhaven.com/license · https://docs.ambientcg.com/license/
- Dati nutrizionali: https://fdc.nal.usda.gov · CREA Alimenti e Nutrizione · NIZP-PZH / IŻŻ tabele składu
