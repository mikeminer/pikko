# PIKKO — Prompt audio per Google Lyria 3.5
### Musica + effetti sonori · v0.1 · 2026-10-03

Ogni blocco grigio è un prompt **pronto da copiare e incollare** in Lyria. I prompt sono in inglese, perché i modelli musicali li seguono meglio. I **testi delle canzoni** sono nella loro lingua: italiano, inglese o polacco.

---

## Come usare questo file

1. Copia il blocco **Prompt** in Lyria.
2. Se Lyria ha un campo **Negative prompt** (o “evita”), incolla lì il blocco **Negative**. Se il campo non c’è, aggiungi in fondo al prompt la riga `Avoid: …`.
3. Per le canzoni: se Lyria ha un campo **Lyrics** separato, incolla lì il blocco **Lyrics**. Altrimenti incollalo in fondo al prompt, dopo la riga `Lyrics:`.
4. **Fai 2–3 generazioni per ogni prompt** e tieni la migliore. Per le canzoni virali conta soprattutto il ritornello: scegli la versione con il “Gnam / Bleah” più orecchiabile.
5. **Salva ogni file con il nome indicato** (es. `M01_theme_it.wav`) e poi passami tutto. Va bene qualunque formato esca da Lyria (WAV preferito, MP3 accettato). Al resto penso io: taglio, punti di loop, volume uniforme e conversione per il web.
6. **Se Lyria genera clip più lunghe del necessario** (succede spesso con gli effetti brevi), va benissimo: li ritaglio io.

> ⚠️ **Da verificare prima di pubblicare (non posso farlo io):**
> - le **condizioni d’uso commerciale** degli audio generati con Lyria nel tuo piano/account. I file Lyria contengono il watermark SynthID, che è normale e non va rimosso;
> - se vuoi la canzone su TikTok/Reels come “suono ufficiale”, le **regole del distributore e della piattaforma** sulla musica generata da AI (spesso chiedono di dichiararlo).
>
> **Regole fisse in tutti i prompt:** nessun nome di artista reale, nessuna imitazione di canzoni esistenti, testi originali e adatti ai bambini, nessun riferimento a crypto o token nelle canzoni.

---

## Il “suono di Pikko” (palette comune)

Tutti i prompt ripetono la stessa palette, così musica ed effetti sembrano dello stesso gioco:

- **Tonalità:** Fa maggiore (F major) per tutto, così si passa da un brano all’altro senza stonature.
- **Strumenti firma:** ukulele, marimba, glockenspiel, tuba (basso buffo), pizzicato di archi, kazoo come accento comico, battiti di mani, schiocchi di dita, piccoli ottoni.
- **Suoni “da cucina”:** il clic della luce del frigo, il ronzio del frigo, posate che tintinnano, il “pop” di un barattolo.
- **Carattere:** giocoso, caldo, buffo ma curato. Mai aggressivo, mai inquietante.

---

# PARTE 1 — LA CANZONE VIRALE

Una canzone sola con lo stesso ritornello-tormentone, in tre lingue. Il gancio virale è l’**onomatopea**: *Gnam / Yum / Mniam* per il cibo sano e *Bleah / Bleah / Fuj* per il junk, con una mini-coreografia che tutti possono rifare (vedi in fondo alla Parte 1).

**Durata ideale:** circa 2:00. **Tempo:** 120 BPM. **Tonalità:** F major.
**Struttura:** intro → strofa 1 → pre-ritornello → ritornello → strofa 2 (abitudine) → pre-ritornello → ritornello → ponte “ballo” → ritornello finale → outro.

> Lyria potrebbe non mantenere identica la melodia tra le tre lingue. Genera prima la versione **italiana**, scegli la migliore, poi genera EN e PL usando lo stesso prompt. Se le tre versioni vengono simili, perfetto; se no, va bene lo stesso: ogni lingua avrà la sua.

---

### M01 — “GNAM O BLEAH!” (italiano) · `M01_theme_it.wav`

**Prompt**
```text
An original, upbeat, extremely catchy children's pop song for a video game called PIKKO, about a picky little vinyl-toy creature that loves healthy food and makes funny disgusted faces at junk food. Language: Italian.

Style: bouncy bubblegum kids-pop with a light Afro-pop and reggaeton-lite bounce, clean modern production, playful and warm. Tempo: constant 120 BPM, 4/4, key of F major.

Instruments: ukulele strums, marimba riff, glockenspiel sparkles, a cheeky tuba bassline, pizzicato strings, hand claps, finger snaps, punchy kid-friendly drums, and a kazoo accent on every "Bleah". Add a fridge-light "click" at the very start.

Vocals: a bright, friendly, slightly cartoonish lead singer with a small group of kids singing the chorus shouts. The "Gnam gnam gnam!" lines are happy and bouncy; the "Bleah bleah bleah!" lines are sung with an exaggerated, funny, disgusted voice, followed by a short kazoo raspberry.

Structure (about 2 minutes): short intro with the shout "Pikko ha fame!", verse 1, pre-chorus, chorus, verse 2, pre-chorus, chorus, dance bridge with spoken-sung calls and a stop-time moment, final chorus with a key-lift feel, and a short outro ending on "Gnam o Bleah!" and a single fridge-door thud.

The chorus must be simple enough that a 5-year-old can sing it after one listen, and the first chorus should arrive within the first 30 seconds.
```

**Negative**
```text
explicit lyrics, sad mood, minor key, heavy distortion, aggressive rap, screaming, horror, long instrumental solos, slow tempo, tempo changes, real artist imitation, crypto or money references
```

**Lyrics**
```text
[Intro]
(click!) Pikko ha fame!

[Strofa 1]
Si accende la luce del frigo,
Pikko si sveglia e fa un sorriso,
un germoglio sulla testa,
e la pancia che fa festa!

[Pre-ritornello]
Una carota o una ciambella?
Scegli bene, scegli quella!

[Ritornello]
Gnam gnam gnam! Frutta e verdura!
Gnam gnam gnam! Che bella avventura!
Bleah bleah bleah! Ciambella e cola?
Bleah bleah bleah! Pikko scappa e vola!

[Strofa 2]
Tre ciambelle, una dopo l'altra,
e alla carota: «Bleah, che barba!»
Ma tre bocconi sani ed è fatta:
il germoglio rifiorisce e scatta!

[Pre-ritornello]
Una carota o una ciambella?
Scegli bene, scegli quella!

[Ritornello]
Gnam gnam gnam! Frutta e verdura!
Gnam gnam gnam! Che bella avventura!
Bleah bleah bleah! Ciambella e cola?
Bleah bleah bleah! Pikko scappa e vola!

[Ponte - ballo]
Fai il muscolo! (oh!)
Schiva a destra! (hop!)
Schiva a sinistra! (hop!)
Bocca aperta... (stop)
GNAM!

[Ritornello finale]
Gnam gnam gnam! Frutta e verdura!
Gnam gnam gnam! Che bella avventura!
Bleah bleah bleah! Ciambella e cola?
Bleah bleah bleah! Pikko scappa e vola!

[Outro]
Pikko! Gnam o Bleah!
```

---

### M02 — “YUM OR BLEAH!” (English) · `M02_theme_en.wav`

**Prompt**
```text
An original, upbeat, extremely catchy children's pop song for a video game called PIKKO, about a picky little vinyl-toy creature that loves healthy food and makes funny disgusted faces at junk food. Language: English.

Style: bouncy bubblegum kids-pop with a light Afro-pop and reggaeton-lite bounce, clean modern production, playful and warm. Tempo: constant 120 BPM, 4/4, key of F major.

Instruments: ukulele strums, marimba riff, glockenspiel sparkles, a cheeky tuba bassline, pizzicato strings, hand claps, finger snaps, punchy kid-friendly drums, and a kazoo accent on every "Bleah". Add a fridge-light "click" at the very start.

Vocals: a bright, friendly, slightly cartoonish lead singer with a small group of kids singing the chorus shouts. The "Yum yum yum!" lines are happy and bouncy; the "Bleah bleah bleah!" lines are sung with an exaggerated, funny, disgusted voice, followed by a short kazoo raspberry.

Structure (about 2 minutes): short intro with the shout "Pikko's hungry!", verse 1, pre-chorus, chorus, verse 2, pre-chorus, chorus, dance bridge with spoken-sung calls and a stop-time moment, final chorus with a key-lift feel, and a short outro ending on "Yum or Bleah!" and a single fridge-door thud.

The chorus must be simple enough that a 5-year-old can sing it after one listen, and the first chorus should arrive within the first 30 seconds.
```

**Negative**
```text
explicit lyrics, sad mood, minor key, heavy distortion, aggressive rap, screaming, horror, long instrumental solos, slow tempo, tempo changes, real artist imitation, crypto or money references
```

**Lyrics**
```text
[Intro]
(click!) Pikko's hungry!

[Verse 1]
The fridge light clicks, it's time to eat,
Pikko jumps up on tiny feet,
a little sprout on Pikko's head,
a hungry belly, let's get fed!

[Pre-chorus]
A carrot or a donut, which one?
Choose it right and have some fun!

[Chorus]
Yum yum yum! Apples and peas!
Yum yum yum! More of these, please!
Bleah bleah bleah! Soda and fries?
Bleah bleah bleah! Pikko runs and flies!

[Verse 2]
Three donuts in a row, oh dear,
now every carrot gets a sneer!
But three good bites, and that's the trick:
the sprout pops up, boing! Super quick!

[Pre-chorus]
A carrot or a donut, which one?
Choose it right and have some fun!

[Chorus]
Yum yum yum! Apples and peas!
Yum yum yum! More of these, please!
Bleah bleah bleah! Soda and fries?
Bleah bleah bleah! Pikko runs and flies!

[Bridge - dance]
Flex your arm! (oh!)
Dodge to the right! (hop!)
Dodge to the left! (hop!)
Open wide... (stop)
YUM!

[Final chorus]
Yum yum yum! Apples and peas!
Yum yum yum! More of these, please!
Bleah bleah bleah! Soda and fries?
Bleah bleah bleah! Pikko runs and flies!

[Outro]
Pikko! Yum or Bleah!
```

---

### M03 — “MNIAM CZY FUJ!” (polski) · `M03_theme_pl.wav`

> ⚠️ Testo polacco da far rileggere a un madrelingua **prima** di generare.

**Prompt**
```text
An original, upbeat, extremely catchy children's pop song for a video game called PIKKO, about a picky little vinyl-toy creature that loves healthy food and makes funny disgusted faces at junk food. Language: Polish.

Style: bouncy bubblegum kids-pop with a light Afro-pop and reggaeton-lite bounce, clean modern production, playful and warm. Tempo: constant 120 BPM, 4/4, key of F major.

Instruments: ukulele strums, marimba riff, glockenspiel sparkles, a cheeky tuba bassline, pizzicato strings, hand claps, finger snaps, punchy kid-friendly drums, and a kazoo accent on every "Fuj". Add a fridge-light "click" at the very start.

Vocals: a bright, friendly, slightly cartoonish lead singer with natural Polish pronunciation and a small group of kids singing the chorus shouts. The "Mniam mniam mniam!" lines are happy and bouncy; the "Fuj fuj fuj!" lines are sung with an exaggerated, funny, disgusted voice, followed by a short kazoo raspberry.

Structure (about 2 minutes): short intro with the shout "Pikko jest głodny!", verse 1, pre-chorus, chorus, verse 2, pre-chorus, chorus, dance bridge with spoken-sung calls and a stop-time moment, final chorus with a key-lift feel, and a short outro ending on "Mniam czy Fuj!" and a single fridge-door thud.

The chorus must be simple enough that a 5-year-old can sing it after one listen, and the first chorus should arrive within the first 30 seconds.
```

**Negative**
```text
explicit lyrics, sad mood, minor key, heavy distortion, aggressive rap, screaming, horror, long instrumental solos, slow tempo, tempo changes, real artist imitation, crypto or money references
```

**Lyrics**
```text
[Intro]
(klik!) Pikko jest głodny!

[Zwrotka 1]
Klik! Lodówka, światło lśni,
Pikko wstaje, już nie śpi,
na głowie kiełek zielony,
brzuszek pusty, wygłodzony!

[Przedrefren]
Marchewka czy pączek? Ty wybierasz!
Dobrze wybierz, nie przegrywasz!

[Refren]
Mniam mniam mniam! Marchew i groszek!
Mniam mniam mniam! Daj jeszcze troszkę!
Fuj fuj fuj! Cola i frytki?
Fuj fuj fuj! Pikko zwiewa, szybki!

[Zwrotka 2]
Trzy pączki pod rząd, ojej, ojej,
marchewka? «Fuj!» i w nogi, hej!
Lecz trzy zdrowe kęsy, to jest trik:
kiełek staje, boing! W jeden mig!

[Przedrefren]
Marchewka czy pączek? Ty wybierasz!
Dobrze wybierz, nie przegrywasz!

[Refren]
Mniam mniam mniam! Marchew i groszek!
Mniam mniam mniam! Daj jeszcze troszkę!
Fuj fuj fuj! Cola i frytki?
Fuj fuj fuj! Pikko zwiewa, szybki!

[Most - taniec]
Pokaż mięśnie! (oh!)
Unik w prawo! (hop!)
Unik w lewo! (hop!)
Otwórz buzię... (stop)
MNIAM!

[Refren końcowy]
Mniam mniam mniam! Marchew i groszek!
Mniam mniam mniam! Daj jeszcze troszkę!
Fuj fuj fuj! Cola i frytki?
Fuj fuj fuj! Pikko zwiewa, szybki!

[Outro]
Pikko! Mniam czy Fuj!
```

---

### M04 — Versione strumentale (karaoke e sfondo) · `M04_theme_instrumental.wav`

**Prompt**
```text
An original instrumental version of a bouncy children's pop theme for a video game called PIKKO. No vocals at all: the vocal melody of the chorus is played instead by a cheerful marimba doubled by glockenspiel, with a kazoo "raspberry" accent at the end of every second line.

Style: bouncy bubblegum kids-pop with a light Afro-pop and reggaeton-lite bounce, clean modern production. Tempo: constant 120 BPM, 4/4, key of F major. Instruments: ukulele, marimba, glockenspiel, cheeky tuba bass, pizzicato strings, hand claps, finger snaps, punchy kid-friendly drums.

Structure (about 2 minutes): intro with a fridge-light click, verse, pre-chorus, chorus hook, verse, pre-chorus, chorus hook, stop-time dance break with claps, final chorus hook, short outro ending on a fridge-door thud. The chorus hook should be instantly memorable and arrive within 30 seconds.
```

**Negative**
```text
vocals, singing, spoken words, sad mood, minor key, heavy distortion, tempo changes, long solos, real artist imitation
```

---

### Coreografia “Pikko Dance” (per il trend, da mettere nel trailer)

Quattro movimenti che chiunque può rifare in 15 secondi, sul ritornello e sul ponte:

| Momento | Movimento |
| --- | --- |
| “Gnam gnam gnam!” | Tre “morsi” con le mani a becco verso la bocca |
| “Bleah bleah bleah!” | Lingua fuori, mani sul viso, brivido di tutto il corpo |
| “Pikko scappa e vola!” / “runs and flies!” / “zwiewa, szybki!” | Passo laterale veloce, come la schivata di Pikko |
| Ponte: “Fai il muscolo / Schiva / Bocca aperta… GNAM!” | Muscolo, saltello a destra, saltello a sinistra, freeze, morso finale |

Il clip TikTok da 15 secondi lo ricavo io dal file: ritornello + “GNAM!” del ponte.

---

# PARTE 2 — MUSICA DI GIOCO (strumentale, in loop)

Tutti in **F major**, senza voce, con un groove che si ripete pulito, così posso creare loop perfetti. Durata ideale 60–90 s ciascuno. La musica cambia in base alla fase della giornata e **all’abitudine di Pikko**: quando si “vizia” col junk diventa pigra e stonata, quando torna al sano brilla. È un dettaglio che si nota nei video.

---

### M10 — Menu / schermata titolo · `M10_menu_loop.wav`

**Prompt**
```text
An original instrumental loop for the title screen of PIKKO, a cozy, funny 3D game about feeding healthy food to a picky little vinyl-toy creature that lives in a kitchen fridge.

Mood: warm, inviting, curious, "the fridge light just turned on at night". Tempo: constant 100 BPM, 4/4, key of F major.

Instruments: soft ukulele, marimba melody, glockenspiel twinkles, gentle tuba bass, light brushed drums, finger snaps, and a soft fridge hum underneath. Hint at the main "Gnam o Bleah" theme melody on marimba, played gently.

About 60–90 seconds, a steady groove that loops seamlessly: end in a way that flows naturally back into the beginning, no fade-out, no final hit.
```

**Negative**
```text
vocals, singing, sad mood, minor key, distortion, tempo changes, fade out, big ending, horror
```

---

### M11 — Colazione (round 1–5, facile) · `M11_breakfast_loop.wav`

**Prompt**
```text
An original instrumental gameplay loop for the "breakfast" phase of PIKKO, a funny 3D game where you drag food to a picky little creature.

Mood: sunny morning, light, playful, relaxed. Tempo: constant 104 BPM, 4/4, key of F major.

Instruments: plucky ukulele, marimba, glockenspiel, pizzicato strings, soft tuba bass, light shaker, gentle claps, a tiny kitchen-cup clink as percussion. Simple and uncluttered so sound effects stay clearly audible on top.

About 60–90 seconds, steady and loopable: no intro build, no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, sad mood, minor key, distortion, tempo changes, fade out, big ending, busy drums
```

---

### M12 — Pranzo (round 6–15, con timer) · `M12_lunch_loop.wav`

**Prompt**
```text
An original instrumental gameplay loop for the "lunch" phase of PIKKO, a funny 3D game where you drag food to a picky little creature before a timer runs out.

Mood: busy, bouncy, cheerful, a little more energy than breakfast. Tempo: constant 112 BPM, 4/4, key of F major.

Instruments: ukulele, marimba riff, glockenspiel, bouncy tuba bass, pizzicato strings, snappy kid-friendly drums, claps, a light cowbell, and cutlery-clink percussion. Keep the mid-range open so sound effects stay audible.

About 60–90 seconds, steady and loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, sad mood, minor key, distortion, tempo changes, fade out, big ending
```

---

### M13 — Merenda (round 16–22, trappole) · `M13_snack_loop.wav`

**Prompt**
```text
An original instrumental gameplay loop for the "afternoon snack" phase of PIKKO, a funny 3D game with tricky food choices and a ticking timer.

Mood: cheeky, sneaky, playful tension, like a cartoon detective in a kitchen. Tempo: constant 120 BPM, 4/4, key of F major.

Instruments: pizzicato strings in a sneaky pattern, marimba, staccato muted brass, tuba bass, ukulele chops, tight drums with a ticking woodblock clock motif, claps, a light kazoo accent every 8 bars.

About 60–90 seconds, steady and loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, scary, horror, minor-key dread, distortion, tempo changes, fade out, big ending
```

---

### M14 — Cena (round 23+, veloce) · `M14_dinner_loop.wav`

**Prompt**
```text
An original instrumental gameplay loop for the final "dinner" phase of PIKKO, a funny 3D game where you feed a picky creature fast before its belly is full.

Mood: high energy, festive, slightly frantic in a fun way, like the last minutes of a game show. Tempo: constant 128 BPM, 4/4, key of F major.

Instruments: driving ukulele strums, fast marimba riff, glockenspiel, energetic tuba bass, pizzicato strings, punchy drums with claps, small brass stabs, and a quick kazoo fill every 8 bars.

About 60–90 seconds, steady and loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, sad mood, minor key, heavy distortion, aggressive, tempo changes, fade out, big ending
```

---

### M15 — “Pikko viziato” (stato ABITUATO_JUNK) · `M15_junk_habit_loop.wav`

**Prompt**
```text
An original instrumental comedic loop for PIKKO, played when the little creature has eaten too much junk food and becomes lazy and sluggish.

Mood: lazy, groggy, sticky, funny, like a sugar crash on a sofa. Tempo: constant 96 BPM, 4/4, key of F major, with a lazy, dragging swing.

Instruments: a slightly detuned, wobbly lounge electric piano, a sleepy tuba bass, a droopy slide whistle now and then, a lazy kazoo melody, soft brushed drums that sound a bit behind the beat, a fizzy soda-bubble texture, and an occasional comedic tuba "burp" note.

About 60 seconds, loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, scary, horror, sad or depressing, heavy distortion, tempo changes, fade out, real burping sounds
```

---

### M16 — “Pikko in forma” (stato ABITUATO_SANO) · `M16_healthy_habit_loop.wav`

**Prompt**
```text
An original instrumental loop for PIKKO, played when the little creature is on a healthy-food streak and feels amazing.

Mood: sparkling, bright, proud, sunny, full of energy but light. Tempo: constant 120 BPM, 4/4, key of F major.

Instruments: bright ukulele, sparkling glockenspiel and celesta runs, marimba melody, bouncy tuba bass, pizzicato strings, crisp drums, claps, little brass fanfares every 8 bars, and soft "leaf rustle" shimmers.

About 60 seconds, loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, sad mood, minor key, distortion, tempo changes, fade out, big ending
```

---

### M17 — Pikko Mart (musica del supermercato) · `M17_mart_loop.wav`

**Prompt**
```text
An original instrumental supermarket background loop for "Pikko Mart", the in-game grocery store of PIKKO.

Mood: funny, cozy "elevator and supermarket music", relaxed and slightly cheesy in a loving way. Tempo: constant 98 BPM, 4/4, key of F major.

Style: light bossa nova lounge. Instruments: nylon guitar, soft vibraphone melody, warm upright bass, brushed drums, gentle marimba, a soft flute line, and every 16 bars a polite two-note store chime. Very subtle shopping-cart squeak as percussion.

About 90 seconds, loopable: no fade-out, no ending, ends ready to repeat.
```

**Negative**
```text
vocals, singing, sad mood, distortion, tempo changes, fade out, big ending, loud drums
```

---

### M18 — Fine partita “Pancia piena!” · `M18_results.wav`

**Prompt**
```text
An original short instrumental results-screen piece for PIKKO, played when the little creature's belly is full and the score appears.

Mood: satisfied, proud, warm, a little silly. Tempo: 110 BPM, key of F major.

Instruments: ukulele, marimba, glockenspiel, tuba, pizzicato strings, claps and a small brass section. Start with a quick rising fanfare (2 seconds), then a gentle, happy loopable groove for about 30 seconds while the score is shown. Hint at the "Gnam o Bleah" theme melody.

Total 30–40 seconds. The groove part must loop seamlessly.
```

**Negative**
```text
vocals, singing, sad mood, minor key, distortion, tempo changes, long fade out
```

---

# PARTE 3 — TEMI DELLE 20 BUSTE-PAESE (Pikko Mart)

Dal 2026-10-04 ogni busta è un **Paese**. Quando apri una busta nel Pikko Mart parte un tema di 15–20 secondi, che uso anche come loop. Ogni prompt è completo: copia solo il blocco del Paese che stai generando.

**Regole per tutti i Paesi:** sempre **C major (Do maggiore)**, compatibile con la canzone e con gli stacchi; sempre senza voce; strumenti autentici di quel Paese suonati in modo allegro e rispettoso, **mai caricature o cliché**. Il nome del file deve essere quello indicato.

> I temi già generati B03–B09 (street food, colazione, Natale, Halloween, Pasqua, mare) non sono più buste, ma restano utili per eventi stagionali futuri. **B01 e B02 si riusano** per Italia e Polonia.

### B01 · Italia · `B01_italy.wav`
> ✅ Già generato come B01_mediterranean: si riusa per Italy, non serve rigenerarlo.

### B02 · Polonia · `B02_poland.wav`
> ✅ Già generato come B02_polish_pantry: si riusa per Poland, non serve rigenerarlo.

### B03 · Giappone · `B03_japan.wav`
```text
Original instrumental 20-second loop for the "Japan" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Japan: koto plucks, shakuhachi-style flute phrase, light taiko-style percussion, soft modern drums, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B04 · Messico · `B04_mexico.wav`
```text
Original instrumental 20-second loop for the "Mexico" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Mexico: bright trumpets, vihuela and guitarrón-style strumming, marimba, güiro and maracas, with light marimba accents as the PIKKO signature. Constant 120 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B05 · Stati Uniti · `B05_usa.wav`
```text
Original instrumental 20-second loop for the "the United States" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of the United States: twangy electric guitar, boogie-woogie piano, upright bass, brushed shuffle drums, a saxophone riff, with light marimba accents as the PIKKO signature. Constant 132 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B06 · India · `B06_india.wav`
```text
Original instrumental 20-second loop for the "India" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of India: sitar melody, tabla groove, dholak bounce, bansuri flute, harmonium drone, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B07 · Francia · `B07_france.wav`
```text
Original instrumental 20-second loop for the "France" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of France: musette accordion, café-style acoustic guitar, upright bass, light brushes, a clarinet counter-melody, with light marimba accents as the PIKKO signature. Constant 116 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B08 · Spagna · `B08_spain.wav`
```text
Original instrumental 20-second loop for the "Spain" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Spain: Spanish nylon guitar rasgueado, palmas hand claps, cajón, castanet accents, a light flute line, with light marimba accents as the PIKKO signature. Constant 120 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B09 · Grecia · `B09_greece.wav`
```text
Original instrumental 20-second loop for the "Greece" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Greece: bouzouki melody, baglamas, acoustic guitar, double bass, light hand percussion, with light marimba accents as the PIKKO signature. Constant 116 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B10 · Turchia · `B10_turkey.wav`
```text
Original instrumental 20-second loop for the "Türkiye" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Türkiye: bağlama (saz) melody, ney-style flute phrase, darbuka groove, kanun plucks, frame drum, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B11 · Cina · `B11_china.wav`
```text
Original instrumental 20-second loop for the "China" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of China: guzheng plucks, dizi bamboo flute melody, erhu answer phrase, light woodblock and soft drums, with light marimba accents as the PIKKO signature. Constant 108 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B12 · Corea del Sud · `B12_korea.wav`
```text
Original instrumental 20-second loop for the "South Korea" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of South Korea: gayageum plucks, a bright modern K-pop-style synth bass and clean drums, light janggu-style accents, with light marimba accents as the PIKKO signature. Constant 118 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B13 · Thailandia · `B13_thailand.wav`
```text
Original instrumental 20-second loop for the "Thailand" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Thailand: ranat (Thai xylophone) melody, khim hammered dulcimer, ching small cymbals, soft drums, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B14 · Vietnam · `B14_vietnam.wav`
```text
Original instrumental 20-second loop for the "Vietnam" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Vietnam: đàn tranh zither plucks, đàn bầu-style gliding melody, bamboo flute, light percussion, with light marimba accents as the PIKKO signature. Constant 104 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B15 · Brasile · `B15_brazil.wav`
```text
Original instrumental 20-second loop for the "Brazil" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Brazil: samba-style surdo and pandeiro groove, cavaquinho strumming, acoustic guitar, a bright flute melody, with light marimba accents as the PIKKO signature. Constant 104 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B16 · Perù · `B16_peru.wav`
```text
Original instrumental 20-second loop for the "Peru" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Peru: quena and panpipe (siku) melody, charango strumming, bombo drum, light rattles, with light marimba accents as the PIKKO signature. Constant 110 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B17 · Marocco · `B17_morocco.wav`
```text
Original instrumental 20-second loop for the "Morocco" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Morocco: oud melody, gimbri bass, qraqeb metal castanets groove, bendir frame drum, a light ney phrase, with light marimba accents as the PIKKO signature. Constant 108 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B18 · Regno Unito · `B18_uk.wav`
```text
Original instrumental 20-second loop for the "the United Kingdom" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of the United Kingdom: bright brass band, tin whistle, acoustic guitar strums, light snare and claps, with light marimba accents as the PIKKO signature. Constant 116 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B19 · Germania · `B19_germany.wav`
```text
Original instrumental 20-second loop for the "Germany" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Germany: cheerful brass (tuba, trumpets), accordion, clarinet, oompah bass and light snare, with light marimba accents as the PIKKO signature. Constant 120 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B20 · Nigeria · `B20_nigeria.wav`
```text
Original instrumental 20-second loop for the "Nigeria" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Nigeria: highlife-style clean electric guitar, talking drum, shekere, bass guitar, light horns, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B21 · Indonesia · `B21_indonesia.wav`
```text
Original instrumental 20-second loop for the "Indonesia" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of Indonesia: bright gamelan-style metallophones, angklung (bamboo rattles), kendang hand drum, soft bass, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B22 · Russia · `B22_russia.wav`
```text
Original instrumental 20-second loop for the "Russia" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the folk music of Russia: balalaika and domra tremolo, bayan accordion, light tambourine, plucked bass, with light marimba accents as the PIKKO signature. Constant 120 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B23 · Ucraina · `B23_ukraine.wav`
```text
Original instrumental 20-second loop for the "Ukraine" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the folk music of Ukraine: bandura arpeggios, sopilka flute, violin, light frame drum and claps, with light marimba accents as the PIKKO signature. Constant 116 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

### B24 · Filippine · `B24_philippines.wav`
```text
Original instrumental 20-second loop for the "the Philippines" shopping bag in PIKKO, a cheerful cooking game that teaches healthy eating and foods of the world. Joyful, warm and respectful of the music of the Philippines: rondalla-style bandurria and guitar strums, kulintang gong accents, ukulele, light percussion, with light marimba accents as the PIKKO signature. Constant 112 BPM, 4/4, C major, no vocals, no clichés or caricature, loopable, no fade-out.
```

---

# PARTE 4 — EFFETTI SONORI VIRALI

Gli effetti brevi sono il “marchio sonoro” di Pikko: devono essere riconoscibili anche a occhi chiusi.

> **Nota onesta:** Lyria è un modello **musicale**. È ottimo per stinger, jingle, fanfare e versi cantati, ma potrebbe non rendere realistici i rumori “veri” (crunch di una carota, gulp, rutto, frizzante della cola). Prova lo stesso con i prompt della sezione 4.3. Se il risultato non convince, quei suoni conviene registrarli con il telefono (una carota vera morsa vicino al microfono suona benissimo) o usare un generatore di effetti sonori dedicato. Me lo dirai quando mi passi i file.

### 4.1 Il sound logo: “GNAM!” e “BLEAH!” cantati, in 3 lingue

Sono gli effetti più virali del gioco: partono a ogni boccone. Ne servono **3 varianti per ciascuno**, così non stancano. Lyria genera probabilmente clip più lunghe: nel file mi basta che il verso sia pulito e isolato, al taglio penso io.

#### S01 — “GNAM!” felice (IT) · `S01_gnam_it.wav`
```text
A very short original vocal sound-logo for the video game PIKKO: a cute, cartoonish little creature voice happily shouting "Gnam!" (Italian for "yum"), three separate takes with a pause of 2 seconds between them, each with a different happy intonation (bouncy, satisfied, excited). Each take is followed by a tiny glockenspiel sparkle in F major. Dry and close, clean, no background music, no reverb tail longer than half a second.
```

#### S02 — “YUM!” felice (EN) · `S02_yum_en.wav`
```text
A very short original vocal sound-logo for the video game PIKKO: a cute, cartoonish little creature voice happily shouting "Yum!", three separate takes with a pause of 2 seconds between them, each with a different happy intonation (bouncy, satisfied, excited). Each take is followed by a tiny glockenspiel sparkle in F major. Dry and close, clean, no background music, no reverb tail longer than half a second.
```

#### S03 — “MNIAM!” felice (PL) · `S03_mniam_pl.wav`
```text
A very short original vocal sound-logo for the video game PIKKO: a cute, cartoonish little creature voice happily shouting "Mniam!" (Polish for "yum"), three separate takes with a pause of 2 seconds between them, each with a different happy intonation (bouncy, satisfied, excited). Each take is followed by a tiny glockenspiel sparkle in F major. Dry and close, clean, no background music, no reverb tail longer than half a second.
```

#### S04 — “BLEAH!” disgustato (IT + EN) · `S04_bleah.wav`
```text
A very short original comedic vocal sound-logo for the video game PIKKO: a cute, cartoonish little creature voice reacting with exaggerated, funny disgust: first puffed cheeks "mmm-mmh", then a loud "BLEAH!" with the tongue out, followed by a short kazoo raspberry and a descending "wah-wah" muted trombone. Three separate takes with a pause of 2 seconds between them: short, long and dramatic, and shivering. Dry and close, no background music, kid-friendly, funny not gross.
```

#### S05 — “FUJ!” disgustato (PL) · `S05_fuj_pl.wav`
```text
A very short original comedic vocal sound-logo for the video game PIKKO: a cute, cartoonish little creature voice reacting with exaggerated, funny disgust: first puffed cheeks "mmm-mmh", then a loud "FUJ!" (Polish for "yuck") with the tongue out, followed by a short kazoo raspberry and a descending "wah-wah" muted trombone. Three separate takes with a pause of 2 seconds between them: short, long and dramatic, and shivering. Dry and close, no background music, kid-friendly, funny not gross.
```

#### S06 — Versi di Pikko senza parole (grammelot) · `S06_pikko_voice.wav`
```text
A collection of short, original, wordless cartoon vocalizations for PIKKO, a cute little vinyl-toy creature, with 1.5 seconds of silence between each: curious "hm?", happy hum "mm-mm!", giggle, surprised "oh!", proud "ta-da!", sleepy yawn, lazy sigh, nervous "uh-oh", effort grunt "hnngh", content "ahhh", tiny hiccup, playful "hop!". High-pitched but warm, expressive, no real words in any language, dry and close, no background music.
```

### 4.2 Stinger musicali (tutti in F major)

#### S10 — Combo sana (5 livelli) · `S10_combo_levels.wav`
```text
Five very short original ascending musical stingers for a healthy-food combo in the game PIKKO, each 1 second long with 1.5 seconds of silence between them. Each one is one step higher and a little richer than the previous: level 1 a single marimba note, level 2 marimba plus glockenspiel, level 3 adds pizzicato strings, level 4 adds a small brass chord, level 5 a sparkling mini-fanfare with celesta. All in F major, bright and rewarding, no vocals.
```

#### S11 — Abitudine junk (“Pikko si è viziato”) · `S11_habit_junk.wav`
```text
A short original comedic musical stinger (about 2 seconds) for the game PIKKO when the little creature gets used to junk food: a descending tuba glissando with a droopy slide whistle and a lazy, slightly detuned piano chord at the end, like a sugar crash. Funny, not sad. No vocals, dry, no background music.
```

#### S12 — “Palato resettato!” · `S12_palate_reset.wav`
```text
A short original triumphant musical stinger (about 2.5 seconds) for the game PIKKO when the little creature switches back to loving healthy food: a springy cartoon "boing" leading into a bright brass and glockenspiel fanfare with a sparkling harp glissando at the end, in F major. Joyful and proud. No vocals, no background music.
```

#### S13 — Bonus arcobaleno · `S13_rainbow.wav`
```text
A short original magical musical stinger (about 3 seconds) for the "rainbow bonus" in the game PIKKO, awarded for eating foods of every color: a rising seven-note glockenspiel and celesta run across a full F major scale, joined by a soft choir-like synth pad "aah" (no words) and a final shimmering chord. Wondrous and happy. No lyrics, no background music.
```

#### S14 — Giornata perfetta · `S14_perfect_day.wav`
```text
A short original victory fanfare (about 4 seconds) for the "perfect day" achievement in the game PIKKO: full playful brass fanfare with snare roll, timpani hit, marimba and glockenspiel flourishes, ending on a big bright F major chord and a tiny kazoo "ta-da". Celebratory and funny. No vocals, no background music.
```

#### S15 — Pancia piena (finale felice) · `S15_belly_full_happy.wav`
```text
A short original musical stinger (about 2.5 seconds) for the end of a game of PIKKO when the creature's belly is full after healthy food: a satisfied, content descending marimba and ukulele phrase ending on a warm F major chord with a soft happy sigh-like flute note. No vocals, no background music.
```

#### S16 — Pancia piena (finale con rutto comico) · `S16_belly_full_burp.wav`
```text
A short original comedic musical stinger (about 2.5 seconds) for the end of a game of PIKKO when the creature's belly is full after junk food: a wobbly tuba phrase that ends in a low, round, funny tuba "burp" note (a musical burp, not a real one), then a tiny cymbal tap. Silly and kid-friendly. No vocals, no background music.
```

#### S17 — Timer quasi scaduto · `S17_timer_warning.wav`
```text
An original 3-second loopable tension cue for the last seconds of a turn timer in the game PIKKO: a ticking woodblock clock at 120 BPM with a rising pizzicato string pattern and a light hi-hat, playful not stressful, in F major. Must loop seamlessly. No vocals, no background music.
```

#### S18 — Busta sbloccata · `S18_bag_unlocked.wav`
```text
A short original celebratory stinger (about 3 seconds) for unlocking a shopping-bag expansion pack in the game PIKKO: a crinkly paper-bag rustle, a cheerful cash-register "ding", then a bright brass and glockenspiel fanfare in F major. Exciting and satisfying. No vocals, no background music.
```

#### S19 — Nuovo cibo nel Ricettario · `S19_new_recipe.wav`
```text
A very short original "new discovery" stinger (about 1.5 seconds) for the game PIKKO: a page-turn swish followed by a three-note rising celesta and marimba motif in F major. Light and curious. No vocals, no background music.
```

#### S20 — Picco di zucchero e crollo · `S20_sugar_rush.wav`
```text
A short original comedic musical effect (about 3 seconds) for PIKKO eating sugary junk food: a super-fast frantic xylophone and piccolo run going up and spinning (sugar rush), then a sudden slow-motion descending slide whistle and a sleepy low bassoon note (sugar crash). Funny and cartoonish. No vocals, no background music.
```

#### S21 — Singhiozzo da bibita · `S21_hiccups.wav`
```text
A short original comedic effect (about 3 seconds) for PIKKO after drinking a fizzy soda: four cartoon "hic" sounds played by a pitched woodblock and a bouncy pizzicato note, each with a tiny bubble-pop sparkle, rhythmically spaced, the last one higher and surprised. Funny and kid-friendly. No vocals, no background music.
```

#### S22 — Fine round con la Bleah Cam (registrazione) · `S22_bleah_cam.wav`
```text
A very short original "camera snapshot" stinger (about 1 second) for the replay-clip feature in the game PIKKO: a playful camera-shutter click followed by a two-note kazoo and glockenspiel "ta-da" in F major. No vocals, no background music.
```

### 4.3 Rumori realistici (prova con Lyria, eventualmente si registrano)

Per ognuno: suono **asciutto, ravvicinato, senza musica**, ripetuto 3–4 volte con 1,5 secondi di silenzio tra le ripetizioni (mi servono le varianti).

#### S30 — Morso croccante (carota, mela) · `S30_crunch.wav`
```text
Realistic close-up sound effect, no music: a crisp, juicy bite into a fresh carrot and then into a fresh apple, followed by two or three crunchy chews. Four separate takes with 1.5 seconds of silence between them. Dry, high detail, clean studio recording, no background noise.
```

#### S31 — Masticata morbida e “gulp” · `S31_chew_gulp.wav`
```text
Realistic but cute close-up sound effect, no music: soft chewing of a small bite of food followed by a short, funny cartoon-style "gulp" swallow. Four separate takes with 1.5 seconds of silence between them. Dry, clean, kid-friendly, not gross.
```

#### S32 — Spruzzo di frutta succosa · `S32_juice_splash.wav`
```text
Realistic close-up sound effect, no music: biting into a very juicy orange and a ripe peach with a small splash of juice. Four separate takes with 1.5 seconds of silence between them. Dry, fresh, clean studio recording.
```

#### S33 — Lattina frizzante · `S33_fizz.wav`
```text
Realistic close-up sound effect, no music: a soda can opening with a sharp "pssht" followed by fizzing bubbles, and separately the fizz of bubbles rising in a glass. Three separate takes with 1.5 seconds of silence between them. Dry, crisp, clean.
```

#### S34 — Rutto comico · `S34_burp.wav`
```text
A funny cartoon burp sound effect for a cute little creature in a children's game, no music: short, round, slightly musical and silly, more "brrup!" than gross, followed by a tiny surprised "oops" pitch. Four different takes with 1.5 seconds of silence between them. Clean, kid-friendly.
```

#### S35 — Frigo: apertura, luce, chiusura · `S35_fridge.wav`
```text
Realistic sound effects of a kitchen fridge, no music, each separated by 1.5 seconds of silence: the fridge door unsealing and opening, the small click of the interior light, a soft electrical fridge hum lasting 4 seconds, and the door closing with a soft rubber-seal thud. Dry, clean, close-up.
```

#### S36 — Piatto che scivola e trascinamento · `S36_plate_drag.wav`
```text
Realistic sound effects, no music, each separated by 1.5 seconds of silence: a ceramic plate sliding across a wooden kitchen table and stopping, food being lifted off a plate with a light whoosh, food being dropped back onto a plate with a soft bounce. Three takes of each. Dry, clean, close-up.
```

#### S37 — Schivata · `S37_dodge.wav`
```text
Cartoon sound effects for a cute little vinyl-toy creature quickly dodging sideways, no music: a fast airy whoosh combined with a tiny rubber-sneaker squeak on a wooden table. Five different takes with 1.5 seconds of silence between them, from small dodge to big dramatic dodge. Clean and playful.
```

#### S38 — Passi e saltelli in vinile · `S38_vinyl_steps.wav`
```text
Realistic close-up sound effects of a small soft vinyl toy with rubber-soled feet, no music: light rubbery footsteps on a wooden table, a small hop and landing, and a soft squeaky vinyl squeeze. Four takes of each, separated by 1.5 seconds of silence. Dry, clean, cute.
```

#### S39 — Supermercato: carrello e busta · `S39_mart.wav`
```text
Realistic sound effects for a supermarket, no music, each separated by 1.5 seconds of silence: a small shopping cart rolling with a squeaky wheel for 3 seconds, a paper shopping bag being picked up and crinkled, and a cash-register beep at the checkout. Dry, clean, close-up.
```

---

## Checklist per quando mi passi i file

| Gruppo | File | Quantità |
| --- | --- | --- |
| Canzone | `M01_theme_it`, `M02_theme_en`, `M03_theme_pl`, `M04_theme_instrumental` | 4 |
| Musica di gioco | `M10`–`M18` | 9 |
| Temi delle buste-Paese | `B03_japan` … `B24_philippines` (B01/B02 già fatti) | 22 |
| Sound logo e voce | `S01`–`S06` | 6 |
| Stinger | `S10`–`S22` | 13 |
| Rumori | `S30`–`S39` | 10 |
| **Totale** | | **62 file** |

**Se ti serve una priorità:** M01, M04, S01–S05, M11–M14 e S10–S12 bastano per il primo prototipo. Il resto può arrivare dopo.

**Cosa farò io con i file:**
1. Ascolto e scelta: se un file non funziona ti dico quale rigenerare e come modificare il prompt.
2. Taglio, punti di loop senza “clic”, volume uniforme (musica più bassa degli effetti, così le reazioni di Pikko si sentono sempre).
3. Conversione per il web, con file leggeri per i telefoni.
4. Collegamento al gioco: musica che cambia con la fase e con l’abitudine di Pikko, sound logo nella lingua scelta, clip da 15 secondi del ritornello per TikTok/Reels.
5. Registro di provenienza (`AUDIO-CREDITS.json`: strumento, data, prompt usato per ogni file).
