// scene.js — LA STANZA DI ANDY · diorama pop-up di carta
// ---------------------------------------------------------------------------------------------------------------
// SUBJECT    la stanza di un bambino, vista come un modellino di carta fotografato: pavimento di assi, carta da
//            parati a nuvole, letto, scrivania, libreria a mensole, cassettone, baule, e giocattoli ovunque. Il twist:
//            lo spettatore è grande come un giocattolo, quindi il pavimento è un paesaggio e i mobili sono montagne.
//            Il primo sguardo va allo sceriffo di carta in basso a destra, poi al letto e alla scrivania.
// STOCK      cardstock per ogni carta, kraft per i dorsi; feltro di fibre basso (0.5-0.8).
// PALETTE    vedi pieces/palette.js (legno caldo, azzurro carta da parati, rossi/gialli/blu da giocattolo)
// LIGHT      chiave calda #ffdcb2 da sinistra-alto verso la finestra, fill frontale, perdite ambrate; lampada da
//            scrivania accesa = practical calda; alone bloom su vetri e lampade.
// LENS       fov 26, pitch 47, fascia nitida ~40 % del frame, blur 18 px a 1080p, bordi bassi occupati da carte grandi
// GROUND     assi di legno stampate (venature, nodi, chiodi, fughe) + tappeto-gioco con strade: la linea guida.
// LAYOUT     il tappeto porta dal basso a sinistra al letto; la scrivania è a destra; la libreria a sinistra; il
//            cassettone e il baule a destra in basso; il muro di fondo (nuvole, finestra, porta) chiude la scena.
// MOTION     molle a cerniera all'apertura, idle sway sui giocattoli leggeri, eroe a 3D model con passo.
// SOUND      flap di carta del kit, passo soft.
// BANNED     verde videogame, bianco puro, ombre grigie, cielo/orizzonte, pezzi piatti a sticker, copie stampate.
// ---------------------------------------------------------------------------------------------------------------
import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { makeCard, layeredCard, platform } from 'papercraft/lib/paperkit-3d.js';
import { createHarness } from './harness.js';
import { C, base, plain, shade, mix, rgba, arc, rrect } from './pieces/palette.js';
import { heroDoll } from './pieces/hero.js';

const H = createHarness({
  ground: C.floor,
  bounds: { x0: -46, x1: 46, z0: -32, z1: 40 },
  view: { pitch: 48, dist: 72, target: [0, 2.0, -6], follow: [-7.4, -7.2] },
  testView: { dist: 30, target: [3, 1.5, -6] },
  heroHeight: 3.6,
  play: true,
  light: { leak: C.leak, shadowExtent: 56, distance: 110, mapSize: 4096 },
  lens: { haze: C.haze, hazeStart: 40, hazeEnd: 110, hazeAmount: 0.2, bloom: 0.3, bloomThreshold: 0.78,
    exposure: 0.75, contrast: 1.24, saturation: 1.04, vignette: 0.055, shadowLift: 0.045, ao: 1.35 },
  walk: { step: 0.8, radius: 0.55 },
});
const { popup, walk, flags, P2: K2 } = H;
const D = P2.draw2;

// ===============================================================================================================
// 1. IL PAVIMENTO: assi di legno + tappeto-gioco con le strade (la linea guida)
// ===============================================================================================================
const MAT = { x: -3, z: 6, w: 38, h: 26 };
// un tappeto-gioco è un RETTANGOLO con gli angoli tondi, non un ovale: bordo a frangia, poi le fasce
const matPts = (k = 1) => {
  const hw = MAT.w / 2 * k, hd = MAT.h / 2 * k, r = 4 * k, pts = [];
  const corner = (cx, cz, a0, a1) => { for (let i = 0; i <= 6; i++) { const a = a0 + (a1 - a0) * i / 6; pts.push([MAT.x + cx + Math.cos(a) * r, MAT.z + cz + Math.sin(a) * r]); } };
  corner(hw - r, -(hd - r), -Math.PI / 2, 0);
  corner(hw - r, hd - r, 0, Math.PI / 2);
  corner(-(hw - r), hd - r, Math.PI / 2, Math.PI);
  corner(-(hw - r), -(hd - r), Math.PI, 1.5 * Math.PI);
  return pts;
};
// la strada principale: dal bordo davanti a sinistra, curva verso il letto (due pieghe in frame)
const ROAD = P2.pathLine([[MAT.x - 18, MAT.z + 14], [MAT.x - 7, MAT.z + 5], [MAT.x + 1, MAT.z - 2], [MAT.x + 14, MAT.z - 8], [MAT.x + 18, MAT.z - 13]], { step: 0.4 });
const CROSS = P2.pathLine([[MAT.x - 13, MAT.z - 7], [MAT.x - 4, MAT.z - 1], [MAT.x + 6, MAT.z + 3], [MAT.x + 15, MAT.z + 11]], { step: 0.4 });

H.printGround(({ g, ppu, X, Z, rnd, washes, torn, band, ribbon, bandOf, line, drifts }) => {
  // ---- assi: file di 3.6 unità, tono per asse con più stacco, fuga scura, venature, nodi, chiodi ----
  washes([C.floor, C.floorB, C.floorLight, C.floorB]);
  const bh = 3.6;
  for (let z = -38; z < 48; z += bh) {
    // un asse ogni tanto è di legno diverso: è quello che fa leggere un pavimento vero
    const odd = rnd() < 0.14;
    const tone = odd ? mix(C.floor, C.wood, 0.45) : [C.floor, C.floorB, C.floorLight, mix(C.floor, C.page, 0.1)][Math.floor(rnd() * 4)];
    g.fillStyle = rgba(tone, 1); g.fillRect(0, Z(z), X(56) - X(-56), bh * ppu);
    // base a due toni dentro l'asse: più chiara verso la luce
    const gr = g.createLinearGradient(0, Z(z), 0, Z(z) + bh * ppu);
    gr.addColorStop(0, rgba(shade(tone, 0.06), 0.5)); gr.addColorStop(1, rgba(shade(tone, -0.08), 0.5));
    g.fillStyle = gr; g.fillRect(0, Z(z), X(56) - X(-56), bh * ppu);
    // venature: lunghe, che curvano, con un filo chiaro accanto
    for (let k = 0; k < 4; k++) {
      const y0 = Z(z) + bh * ppu * (0.16 + 0.22 * k + rnd() * 0.08);
      g.strokeStyle = rgba(shade(tone, -0.3), 0.55); g.lineWidth = 0.05 * ppu * (0.7 + rnd() * 0.9);
      g.beginPath(); g.moveTo(0, y0);
      for (let px = 0; px < X(56) - X(-56); px += 22) g.lineTo(px, y0 + Math.sin(px * 0.013 + k * 2.3 + z) * 1.8 + Math.sin(px * 0.0032) * 5);
      g.stroke();
      g.strokeStyle = rgba(C.page, 0.22); g.lineWidth = 0.032 * ppu; g.beginPath(); g.moveTo(0, y0 + 2.4);
      for (let px = 0; px < X(56) - X(-56); px += 26) g.lineTo(px, y0 + 2.4 + Math.sin(px * 0.012 + k * 1.7) * 1.8); g.stroke();
    }
    // nodi: 1-2 per asse, anelli concentrici
    for (let k = 0; k < 2; k++) if (rnd() < 0.5) {
      const nx = rnd() * (X(56) - X(-56)), ny = Z(z) + bh * ppu * (0.2 + rnd() * 0.6), rr = (0.13 + rnd() * 0.13) * ppu;
      for (let q = 4; q >= 1; q--) { g.strokeStyle = rgba(shade(tone, -0.34 + q * 0.045), 0.55); g.lineWidth = 0.028 * ppu; g.beginPath(); g.ellipse(nx, ny, rr * q * 0.35, rr * q * 0.22, 0.25, 0, 7); g.stroke(); }
      g.fillStyle = rgba(shade(tone, -0.45), 0.5); g.beginPath(); g.ellipse(nx, ny, rr * 0.18, rr * 0.12, 0.25, 0, 7); g.fill();
    }
    // fuga: solco scuro con il filo di luce sul lato in ombra (il trucco che fa leggere il rilievo)
    g.fillStyle = rgba(C.floorGap, 0.72); g.fillRect(0, Z(z) - 0.1 * ppu, X(56) - X(-56), 0.13 * ppu);
    g.fillStyle = rgba(C.page, 0.26); g.fillRect(0, Z(z) + 0.06 * ppu, X(56) - X(-56), 0.06 * ppu);
    // giunti testa-coda sfalsati, con due chiodi
    for (let jx = -50 + ((z * 7) % 15); jx < 56; jx += 14 + (rnd() * 5 | 0)) {
      g.fillStyle = rgba(C.floorGap, 0.5); g.fillRect(X(jx), Z(z), 0.12 * ppu, bh * ppu);
      g.fillStyle = rgba(shade(tone, -0.4), 0.8);
      for (const q of [0.12, 0.88]) {
        g.fillStyle = rgba(shade(tone, -0.4), 0.8); g.beginPath(); g.arc(X(jx) + 0.24 * ppu, Z(z) + bh * ppu * q, 0.05 * ppu, 0, 7); g.fill();
        g.fillStyle = rgba(C.page, 0.35); g.beginPath(); g.arc(X(jx) + 0.225 * ppu, Z(z) + bh * ppu * q - 0.02 * ppu, 0.018 * ppu, 0, 7); g.fill();
      }
    }
  }
  // polvere e graffi: raggruppati, non sparsi uniformi
  drifts((x, y) => { g.fillStyle = rgba(C.page, 0.3 + rnd() * 0.3); g.beginPath(); g.ellipse(x, y, 1.2 + rnd() * 2.5, 0.8 + rnd() * 1.4, rnd() * 3, 0, 7); g.fill(); }, { n: 9000, inside: 0.35, outside: 0.004 });
  // scarabocchi a pastello: pochi, grandi, con lo spessore di un pastello vero
  const scribble = (cx, cz, col, len = 6) => {
    g.strokeStyle = rgba(col, 0.55); g.lineWidth = 0.16 * ppu; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X(cx), Z(cz));
    for (let t = 0; t <= len; t += 0.3) g.lineTo(X(cx + t), Z(cz + Math.sin(t * 2.4) * 1.2 + Math.sin(t * 0.7) * 0.7));
    g.stroke();
  };
  scribble(-34, 16, C.red, 7); scribble(-33.6, 13.5, C.blue, 6); scribble(28, 14, C.yellow, 5.5);
  scribble(-30, -18, C.green, 6);
  // una biglia rotolata sotto il letto: un cerchio di carta con dentro il colore
  for (const [bx, bz, br] of [[-30, -22, 0.5], [-27, 8, 0.35]]) {
    g.fillStyle = rgba(C.page, 0.85); g.beginPath(); g.arc(X(bx), Z(bz), br * ppu, 0, 7); g.fill();
    g.strokeStyle = rgba(shade(C.blue, -0.2), 0.35); g.lineWidth = 0.06 * ppu; g.beginPath(); g.arc(X(bx), Z(bz), br * ppu, 0, 7); g.stroke();
  }
  // ---- tappeto-gioco: carta strappata con bordo crema, campo blu, strade, isolati ----
  torn(matPts(1.045), rgba('#cdb98e', 1));                      // frangia di carta chiara
  torn(matPts(1.0), rgba('#4f7ba0', 1));                         // bordo blu
  torn(matPts(0.93), rgba('#e0cfa6', 0.95), 'rgba(0,0,0,0)');    // filo crema interno
  torn(matPts(0.9), rgba('#8ba06a', 1), 'rgba(0,0,0,0)');         // campo del tappeto
  // isolati: blocchi di colore con edifici stampati (pochi, grandi, leggibili)
  const blocks = [['#b8564a', 6, 5], ['#c9a06a', 7, 4], ['#5f89a8', 5, 4], ['#c9a75e', 6, 4], ['#9c7a8f', 5, 4], ['#b8564a', 6, 5]];
  for (const [col, bw, bd] of blocks) {
    const cx = MAT.x + (rnd() - 0.5) * 30, cz = MAT.z + (rnd() - 0.5) * 20;
    if (ROAD.dist(cx, cz) < 4.6 || CROSS.dist(cx, cz) < 4.2) continue;
    const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => [cx + u * bw / 2 + (rnd() - 0.5) * 0.6, cz + v * bd / 2 + (rnd() - 0.5) * 0.6]);
    torn(cs, rgba(col, 0.92), 'rgba(250,240,220,0.45)');
    g.fillStyle = rgba(shade(col, -0.4), 0.55);
    for (let k = 0; k < 5; k++) { const bx = X(cx + (rnd() - 0.5) * bw * 0.6), bz = Z(cz + (rnd() - 0.5) * bd * 0.6), s = (0.5 + rnd() * 0.7) * ppu; g.fillRect(bx, bz, s, s * (0.6 + rnd() * 0.6)); }
  }
  // strade: nastro crema con bordo scuro e linea tratteggiata
  const road = (route, w) => {
    line(route.pts, w + 0.5, rgba(shade(C.rugBlue, -0.3), 0.55));
    line(route.pts, w, rgba('#e6d8b4', 0.98));
    g.strokeStyle = rgba(C.rugGold, 0.75); g.lineWidth = 0.16 * ppu; g.setLineDash([0.9 * ppu, 0.7 * ppu]); g.lineCap = 'butt';
    g.beginPath(); route.pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.stroke(); g.setLineDash([]);
  };
  road(ROAD, 4.4); road(CROSS, 3.4);
  // qualche segno di gioco sopra il tappeto: pedine, una pista di macchinine, un cerchio di gesso
  for (let k = 0; k < 5; k++) {
    const cx = MAT.x + (rnd() - 0.5) * 26, cz = MAT.z + (rnd() - 0.5) * 16;
    g.strokeStyle = rgba('#f4ecd8', 0.55); g.lineWidth = 0.12 * ppu; g.beginPath(); g.arc(X(cx), Z(cz), (0.7 + rnd() * 0.7) * ppu, 0, 7); g.stroke();
  }
});

// ===============================================================================================================
// 2. PROVA DELLA MATERIA (?test): una carta stampata sul pavimento stampato, sotto la lente finale
// ===============================================================================================================
if (flags.TEST) {
  const doll = heroDoll(H);
  H.setHero(popup(null, null, { node: doll, height: 3.2, x: 2, z: -4, scale: 1.2 }), { stride: doll.userData.stride });
} else buildWorld();

function buildWorld() {
  // ---- IL MURO DI FONDO (carta da parati a nuvole, finestra, porta) lo costruisce pieces/room.js ----
  buildRoom(H);
  // ---- i mobili su cui si salta ----
  buildFurniture(H);
  // ---- i giocattoli sparsi ----
  buildProps(H);
  // i solidi dei giocattoli stanno sul pavimento: senza un tetto bloccherebbero anche i piani dei mobili che gli stanno
  // sopra (il baule dietro la macchinina RC restava inaccessibile)
  for (const q of walk.solids) if (q.top === Infinity) q.top = 2.4;
  // ---- carte grandi e sfocate che entrano dal bordo basso: la scala del modellino ----
  buildForeground(H);
  buildFillers(H);
  // ---- l'eroe: parte dal tappeto, in basso a destra ----
  const doll = heroDoll(H);
  const hero = popup(null, null, { node: doll, height: 3.2, x: 0, z: 8, scale: 1.26, sway: 0.15 });
  H.setHero(hero, { stride: doll.userData.stride });
  H.spots.hero = [0, 8];
}

import { buildRoom } from './pieces/room.js';
import { buildFurniture } from './pieces/furniture.js';
import { buildProps } from './pieces/props.js';
import { buildForeground, buildFillers } from './pieces/foreground.js';

// il salto: lo spazio si chiama "il tappeto", la stanza è il livello
H.start();
window.__andy = { H };   // maniglia di debug: __andy.H.walk.walkMap(...), __andy.H.hero, ...

document.getElementById('boot')?.classList.add('gone');
addEventListener('pointerdown', () => document.getElementById('hint')?.classList.add('gone'), { once: true });
addEventListener('keydown', (e) => { if (e.code === 'KeyW' || e.code === 'ArrowUp') document.getElementById('hint')?.classList.add('gone'); }, { once: true });

// ===============================================================================================================
// 3. IL SALTO (il WalkField non ne ha uno: alziamo il gradino per la durata del volo e disegniamo l'arco)
// ===============================================================================================================
{
  const hero = H.hero, STEP0 = walk.step, JUMP_V = 19.5, G = 34;
  let air = false, vy = 0, t = 0, fromY = 0, squash = 0;
  const feet = () => ({ x: hero.group.position.x, y: hero.group.position.y - 0.02, z: hero.group.position.z });
  const press = () => {
    if (air) return;
    air = true; t = 0; vy = JUMP_V; fromY = feet().y; walk.air = true; walk.airY = fromY;          // 6.6: il gradino più alto che si scavalca
    squash = 0.12;                                                              // piegamento in partenza
  };
  addEventListener('keydown', (e) => { if ((e.code === 'Space' || e.code === 'KeyJ') && !e.repeat) { e.preventDefault(); press(); } });
  H.onStep((time, dt) => {
    const p = feet();
    if (air) {
      t += dt; vy -= G * dt;
      const arc = fromY + (JUMP_V * t - 0.5 * G * t * t);
      const ground = walk.surface(p.x, p.z)?.y ?? 0;
      walk.airY = arc;                                    // la quota dei piedi in volo: il walk field la usa per
                                                          // lasciar entrare in un piano solo quando ci si arriva davvero
      if (vy < 0 && arc <= ground + 0.03) { air = false; walk.air = false; walk.airY = 0; squash = -0.3; hero.group.position.y = ground + 0.02; }
      else hero.group.position.y = Math.max(ground, arc) + 0.02;
    } else { walk.step = STEP0; walk.air = false; walk.airY = 0; }
    if (squash > 0) squash = Math.max(0, squash - dt * 2.2); else if (squash < 0) squash = Math.min(0, squash + dt * 2.6);
    const node = hero.pivot.children[0];
    if (node && squash) node.rotation.x += squash * 0.22;                       // solo rotazione: la carta si piega, non si scala
  });
  // maniglia per i test: un salto dall'esterno (usata dai controlli scriptati)
  window.__jump = press;
}
