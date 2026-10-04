# PIKKO — loghi dei token delle buste-Paese

Un logo per ogni busta-Paese, da usare come **immagine del token su Pump.fun** e, identico, nel Pikko Mart del gioco.

- `PIKKO_<CODICE>_<busta>_1024.png`: 1024×1024, da caricare su Pump.fun.
- `PIKKO_<CODICE>_<busta>_512.png`: 512×512, per social, Telegram e anteprime.
- Sorgenti vettoriali: `pikko-game/public/logos/<busta>.svg`. Si rigenerano con `python tools/make_logos.py` e `node tools/render_logos.mjs ../PIKKO_TOKEN_LOGOS <anteprima.png>` dalla cartella `pikko-game`.
- `PIKKO_PIKKO_base_*.png` è la Busta Base gratuita: non serve un token.

| # | Paese | File da caricare | Nome token (proposta) | Ticker (proposta) |
| --- | --- | --- | --- | --- |
| 1 | Italia | `PIKKO_IT_italy_1024.png` | PIKKO Italy | `PKIT` |
| 2 | Polonia | `PIKKO_PL_poland_1024.png` | PIKKO Poland | `PKPL` |
| 3 | Giappone | `PIKKO_JP_japan_1024.png` | PIKKO Japan | `PKJP` |
| 4 | Messico | `PIKKO_MX_mexico_1024.png` | PIKKO Mexico | `PKMX` |
| 5 | Stati Uniti | `PIKKO_US_usa_1024.png` | PIKKO United States | `PKUS` |
| 6 | India | `PIKKO_IN_india_1024.png` | PIKKO India | `PKIN` |
| 7 | Francia | `PIKKO_FR_france_1024.png` | PIKKO France | `PKFR` |
| 8 | Spagna | `PIKKO_ES_spain_1024.png` | PIKKO Spain | `PKES` |
| 9 | Grecia | `PIKKO_GR_greece_1024.png` | PIKKO Greece | `PKGR` |
| 10 | Turchia | `PIKKO_TR_turkey_1024.png` | PIKKO Türkiye | `PKTR` |
| 11 | Cina | `PIKKO_CN_china_1024.png` | PIKKO China | `PKCN` |
| 12 | Corea del Sud | `PIKKO_KR_korea_1024.png` | PIKKO South Korea | `PKKR` |
| 13 | Thailandia | `PIKKO_TH_thailand_1024.png` | PIKKO Thailand | `PKTH` |
| 14 | Vietnam | `PIKKO_VN_vietnam_1024.png` | PIKKO Vietnam | `PKVN` |
| 15 | Brasile | `PIKKO_BR_brazil_1024.png` | PIKKO Brazil | `PKBR` |
| 16 | Perù | `PIKKO_PE_peru_1024.png` | PIKKO Peru | `PKPE` |
| 17 | Marocco | `PIKKO_MA_morocco_1024.png` | PIKKO Morocco | `PKMA` |
| 18 | Regno Unito | `PIKKO_GB_uk_1024.png` | PIKKO United Kingdom | `PKGB` |
| 19 | Germania | `PIKKO_DE_germany_1024.png` | PIKKO Germany | `PKDE` |
| 20 | Nigeria | `PIKKO_NG_nigeria_1024.png` | PIKKO Nigeria | `PKNG` |
| 21 | Indonesia | `PIKKO_ID_indonesia_1024.png` | PIKKO Indonesia | `PKID` |
| 22 | Russia | `PIKKO_RU_russia_1024.png` | PIKKO Russia | `PKRU` |
| 23 | Ucraina | `PIKKO_UA_ukraine_1024.png` | PIKKO Ukraine | `PKUA` |
| 24 | Filippine | `PIKKO_PH_philippines_1024.png` | PIKKO Philippines | `PKPH` |

**Prima di creare ogni token:**
1. **Nome e ticker sono proposte:** controlla che non siano già usati e che non creino confusione con altri progetti.
2. **Bandiere e simboli:** i loghi usano palette ispirate ai Paesi, non bandiere né stemmi. Alcuni Paesi regolano comunque l'uso commerciale dei propri colori e simboli nazionali: una verifica veloce per ogni Paese è prudente.
3. **Immagine definitiva:** controlla su Pump.fun formato, peso massimo e ritaglio al momento della creazione. In genere l'immagine di un token non si può cambiare dopo il lancio.
4. **Compatibilità con DevFridge:** dopo il lancio passami il **CA completo**. Prima di attivare la busta nel gioco verifico Token-2022, decimali, estensioni e route di riscatto.
5. **Niente promesse di guadagno** nella descrizione del token: la busta sblocca contenuti di gioco, non è un investimento.

Le illustrazioni sono originali, fatte per PIKKO (nessuna immagine di terzi).
