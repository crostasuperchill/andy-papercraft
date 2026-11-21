# La stanza di Andy — un diorama di carta giocabile

Un mondo pop-up di carta nella stanza di un bambino: pavimento in assi stampate, carta da parati a nuvole, letto,
scrivania, libreria a mensole sfalsate, cassettone, baule, giocattoli ovunque. Visto con una lente macro lunga e
sfocatura tilt-shift, con un alone bloom filmico sulle lampade e sui vetri. Gira in three.js r187, senza build step.

Costruito con la skill **papercraft** (`~/.hermes/skills/creative/papercraft`): carte di cartoncino con spessore,
bordo di taglio stampato (linea scura + filo chiaro sul lato illuminato), stampe a collage di strati incollati,
ombre morbide calde, apertura ad anta.

## Come si gioca

```bash
cd ~/dev/toy-story-papercraft
python3 -m http.server 8177 --bind 127.0.0.1
# poi apri http://127.0.0.1:8177/
```

- **WASD / frecce**: cammina (il camera-follow ti sta dietro, con zona morta e anticipo)
- **spazio** (o J): salta. Salto ~5.3 unità: dal pavimento al letto, sedia → scrivania, mensola → mensola
- **trascina col mouse**: inclina/orienta la camera (l'inclinazione resta fra 40 e 55 gradi)
- **click**: chiude e riapre il libro (tutto si ripiega piatto e si riapre a molla)

Il giro classico: tappeto → **sedile** (3.2) → **scrivania** (7.2); tappeto → **letto** (4.6); pavimento →
**mensola A** (3.4) → **B** (6.6) → **C** (9.8); **baule** (2.7) → **cassettone** (5.6).

## Cosa c'è dentro

```
index.html          pagina + import map (three vendorizzato, niente CDN)
scene.js            il mondo: pavimento stampato, layout, salto, assemblaggio
harness.js          l'harness del kit papercraft (unica modifica: la lente è BloomPost)
lib/                paperkit 2D/3D, paper-motion, paper-sound (kit) + lens-bloom.js (bloom su PaperPost)
pieces/palette.js   la tavolozza di questa stanza
pieces/hero.js      lo sceriffo: 18 carte a T, gambe e braccia su perni, passo con la distanza percorsa
pieces/room.js      muro a nuvole, finestra che brilla, porta, disegni appesi
pieces/furniture.js letto, scrivania, sedia, cassettone, baule, libreria (platform aperti e camminabili)
pieces/props.js     Rex, Patata, Slinky, salvadanaio, astronauta, soldatini, blocchi, RC, palla, aereo, orsetto
pieces/foreground.js carte grandi sfocate sul bordo basso + piccoli giocattoli che riempiono la fascia nitida
tools/probe.mjs     Chrome headless via CDP: console, eccezioni, eval, screenshot (il modo per verificare)
tools/record.mjs    registra un clip deterministico (step + captureScreenshot -> ffmpeg)
atlas.html          debug: stampa in griglia le carte di un pezzo, senza 3D
```

## Il salto (l'unica vera aggiunta al kit)

Il `WalkField` del kit conosce gradini e piani, non il volo. Due ritocchi minimi e documentati:

1. `WalkField.air` — in volo i piedi non devono stare tutti sul bordo di un piano (altrimenti saltare fra due mobili
   viene fermato dal pavimento sotto).
2. `WalkField.airY` — si entra in un piano solo quando i piedi sono arrivati alla sua quota: si salta *sopra* i vuoti
   e si atterra, non si attraversano i tavoli.

L'arco è disegnato in `scene.js` (v0 19.5, g 34, piegamento di carta in partenza e atterraggio), il camera-follow resta
quello dell'harness.

## Verificato / non verificato

Verificato con test scriptati sulla build: salto tappeto→letto (4.67), sedia→scrivania (7.27), mensola A→B (6.68),
B→C (9.88), baule (2.78); nessun errore in console; `measure.py` 16 PASS / 4 WARN (printDetail, localContrast,
barePct, warmthLR: il tappeto-gioco tiene volutamente molto terreno aperto al centro).

Non verificato: fps su GPU lenta, controlli touch (solo tastiera), mood `?mood=dusk|night` (la lampada è accesa ma le
pronte pratiche non sono state ritoccate), e i libri/giocattoli appoggiati sui piani non hanno solidi (ci si passa
attraverso).
