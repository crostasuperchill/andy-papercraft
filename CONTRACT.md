# CONTRATTO — come si aggiunge roba alla stanza

Progetto: `~/dev/toy-story-papercraft` (diorama pop-up di carta in three.js r187, stile "papercraft").
Server già attivo: **http://127.0.0.1:8177/** (python http.server, NON riavviarlo, NON cambiare porta).

## Regole assolute

1. **Modifica SOLO il tuo file**: `pieces/furniture.js` oppure `pieces/props.js`. Non toccare `scene.js`, `harness.js`,
   `index.html`, `lib/`, `pieces/palette.js`, `pieces/hero.js`, `pieces/room.js`. Se ti serve un helper, scrivilo dentro
   il tuo file.
2. **Leggi prima la skill**: `~/.hermes/skills/creative/papercraft/SKILL.md`, poi
   `references/procedural-art.md` (sezioni 0, 3, 4), `references/mechanisms.md` (sezioni 7, 8, 14) e
   `references/look.md` (sezioni 3 e 12). Contengono i numeri che fanno funzionare la carta; non improvvisare.
3. **Ogni pezzo è una carta stampata**: silhouette tozza (niente punte, niente aghi), dentro un collage di 3-5 inchiostri
   (base a due toni, 1-2 strati incollati con lip chiaro + ombra corta, 1-2 accenti che contrastano, un ornamento),
   feltro leggero (`P.felt(0.6-0.8)`), nessun riempimento piatto. Usa `P2.drawnPiece` per i pezzi disegnati e
   `P2.printCard`-style `paint(P)` per i pannelli piatti.
4. **Tutto ciò su cui si cammina è costruito APERTO e registrato nel walk field** (`H.walk.add(node)`): gambe a pannello
   con i vuoti tagliati fino alla base (`facePts`), piano d'appoggio in assi, supporto posteriore. Mai un blocco solido
   di terreno, mai un cartoncino piatto su cui si cammina.
5. **Niente cielo, niente orizzonte**: la scena è vista dall'alto dentro la stanza. Le altezze massime sono quelle date.
6. **Deterministico**: ogni scelta casuale da un rng seminato (`P2.rng(seed)`); niente `Math.random()`.
7. **Nomi**: dai un nome ai gruppi camminabili (`node.name = 'letto'`), e registra i punti notevoli in `H.spots`.
8. Il file deve passare `node --check pieces/<tuo>.js` e la scena deve partire **senza errori in console** e senza
   warning `papercraft fromDrawing ... dropped`.

## API (harness.js — leggilo)

```js
export function buildFurniture(H) { ... }   // il tuo export
// H = { THREE, P2, flags, scene, camera, paper, view, target, walk, hinges, spots,
//       popup(pts, paint, opts), cardOpts(x, z, scale, parent), lamp(x,y,z,k,dist), glowing(group),
//       inFrame(x,z), sharpAt(x,z), bounds, heroHeight }
```

- `H.popup(pts, paint, { x, z, yaw, scale, node, height, solid, level, parent, order, wx, wz, base, sway, holes })`
  mette una carta su una cerniera (si alza in apertura). `node` = un gruppo già costruito (platform, boxFold,
  layeredCard, crossCard, un modello 3D): allora `pts`/`paint` sono `null` e `height` è l'altezza del nodo (per la
  velocità della molla).
- `H.popup` restituisce `{ group, pivot, order, ... }`; il gruppo è quello che va in `H.walk.add(...)` per le
  costruzioni camminabili (`platform` porta già `userData.walk`).
- `H.cardOpts(x, z, scale)` = opzioni di stampa (paper, pxPerUnit, effects, seed): passalo come `print: H.cardOpts(x,z)`
  alle costruzioni (`platform`, `boxFold`).
- `H.lamp(x, y, z, k)` = luce pratica calda (accendila dove c'è una lampada vera).
- `H.glowing(group)` = i pannelli marcati `P.glow(...)` si accendono a sera.
- `H.THREE` per i gruppi; `H.paper` per `makeCard`.

Costruzioni pronte (importale da `papercraft/lib/paperkit-3d.js`):

```js
import { makeCard, layeredCard, platform, crossCard, boxFold, clusterLayout } from 'papercraft/lib/paperkit-3d.js';
```
`platform({ w, d, h, paper, paints: { face, deck, support }, facePts, supportPts, holes: { face, support }, print, seed })`
è il mobile: faccia frontale (gambe/vassoi) sulla cerniera, piano che resta LIVELLO, supporto dietro. Il piano
camminabile è `userData.walk` con `frame` = `userData.deck` (frame livellato: y su, z verso il fronte, il piano va da
z 0 a -d). I pezzi che stanno SOPRA il piano vanno in `node.userData.deck` (o con `parent: deck` in `popup`).

Tavolozza: `import { C, arc, rrect, base, plain, shade, mix, rgba } from './palette.js';` (leggi il file).
Light: chiave calda da sinistra-alto; quindi `rimLight` di default `[-0.55, 0.83]` va bene.

## Verifica (obbligatoria, due giri minimo)

1. `node --check pieces/<tuo>.js`
2. `node tools/probe.mjs "http://127.0.0.1:8177/?capture" shots/<nome>-<giro>.png --port=9401 --wait=9000 --eval="(...)"`
   (`--port` diverso per agente: furniture 9401, props 9402; `--eval` può contenere `__papercraft.look(x, z, dist)`
   e ritorna JSON con `logs` — devono essere vuoti di errori — e `results`).
   Lo screenshot va poi guardato con i tuoi occhi (`vision_analyze`): ingrandisci il pezzo, controlla taglio, ombre,
   strati. Itera almeno 2 volte, aggiustando i tre problemi peggiori che vedi.
3. Controlla anche `__papercraft.walkMap(-40, -30, 40, 30, 2)` per non aver messo muri invisibili dove serve passare.

## Coordinate della stanza

Pavimento y=0, eroe alto 3.6, camera dall'alto a 47°. Z negativo = fondo (muro), z positivo = davanti.
Muro di fondo a z=-30. Tappeto-gioco in centro (x -22..18, z -6..20).

Altezze di salto: il giocatore salta fino a **~5.3 unità** e il walk field accetta un gradino di 6.6 durante il volo
quindi ogni dislivello ≤ 4.5 unità è superabile; oltre serve una scala di appoggi.
