// pieces/props.js — I GIOCATTOLI DI ANDY, sparsi sul pavimento di assi e sul tappeto-gioco.
// ---------------------------------------------------------------------------------------------------------------
// SUBJECT    i giocattoli veri di una stanza di bambino (1995): dinosauro, signor Patata, cane Slinky, salvadanaio,
//            astronauta giocattolo, soldatini verdi, blocchi alfabeto, macchinina RC, palla, aereo, orsetto, pastelli.
// STOCK      cardstock per ogni carta (t 0.075-0.10 = 2-3 % dell'eroe), ritagli die-cut, dorsi stampati a specchio.
// PALETTE    pieces/palette.js: verde dino + pancia crema, marrone patata, rosa porcellino + oro, bianco/verde/viola
//            astronauta, verde militare, primari dei blocchi. Accenti SEMPRE in contrasto (oro, rosso, crema, inchiostro).
// PRINT      ogni pezzo è un collage: base a due toni, 2-3 strati incollati con lip chiaro + ombra corta, 1-2 accenti
//            che contrastano, un ornamento (scaglie, cuciture, placche, lettere), feltro leggero 0.5-0.7.
// BUILD      una carta stampata per i pezzi piccoli; 2-3 carte a T (frontale + profilo dietro) per Rex e astronauta;
//            assemblaggi aperti di carte per Slinky (3 carte), aereo (fusoliera + ala orizzontale), macchinina
//            (carta di profilo + 4 dischi ruota su perno + carta frontale dietro), blocchi (3 facce per cubo).
// SOLID      solo i grandi: Rex 1.6, palla 0.9, RC 1.75, blocchi 1.4, orsetto 1.0 — raggio ~0.35 x larghezza.
// LAYOUT     tappeto x -22..18, z -6..20: i pezzi sul tappeto lasciano libera la strada stampata; niente a z < -20.
// ---------------------------------------------------------------------------------------------------------------
import { makeCard, paperMaterial } from 'papercraft/lib/paperkit-3d.js';
import { C, arc, shade, mix } from './palette.js';

export function buildProps(H) {
  const THREE = H.THREE, P2 = H.P2, D = P2.draw2, PI = Math.PI;

  // ==============================================================================================================
  // helpers (dentro il file: il contratto vieta di toccare il kit)
  // ==============================================================================================================
  /** una carta stampata a misura di giocattolo (spessore e bordo da carta, dorso a specchio) */
  const pc = (piece, o = {}) => makeCard(piece[0], {
    paint: piece[1], paper: H.paper, thickness: o.t ?? 0.085, edgeWidth: o.edge ?? 0.05,
    pxPerUnit: o.px ?? 42, seed: o.seed ?? 7, back: o.back ?? 'mirror', rimLight: [-0.55, 0.83],
  });

  /** carta singola su cerniera + nome + spot */
  const single = (name, piece, o) => {
    const hd = H.popup(piece[0], piece[1], { x: o.x, z: o.z, yaw: o.yaw ?? 0, scale: o.scale ?? 1, solid: o.solid ?? 0, sway: o.sway ?? 0 });
    hd.group.name = name; H.spots[name] = [o.x, o.z];
    return hd;
  };

  /** assemblaggio (gruppo di carte) su UNA cerniera: sale e si piega come un pezzo solo */
  const assemble = (name, g, o) => {
    const hd = H.popup(null, null, { node: g, height: o.height ?? 3, x: o.x, z: o.z, yaw: o.yaw ?? 0,
      scale: o.scale ?? 1, solid: o.solid ?? 0, level: true, sway: o.sway ?? 0 });
    hd.group.name = name; if (!g.name) g.name = name; H.spots[name] = [o.x, o.z];
    return hd;
  };

  /** la carta di profilo dietro (T): ruotata di 90°, accostata al dorso di quella frontale */
  const profileCard = (piece, o = {}) => {
    const m = pc(piece, { ...o, px: (o.px ?? 42) * 0.78, seed: (o.seed ?? 7) + 13 });
    const bw = P2.bbox(piece[0]).w;
    m.rotation.y = PI / 2;
    m.position.z = -(bw / 2 + 0.07);
    return m;
  };

  /** lettera stampata su una faccia (i blocchi alfabeto) */
  const letter = (P, ch, x, y, size, color) => P.draw((g) => {
    g.save(); g.translate(x, y); g.scale(1, -1);
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${size}px "Arial Black", "Helvetica Neue", Impact, sans-serif`;
    g.fillText(ch, 0, 0); g.restore();
  });

  // ==============================================================================================================
  // 1. REX — dinosauro verde, alto 8, (6,-10). Carta frontale grossa + carta di profilo dietro (T).
  // ==============================================================================================================
  const rexFront = (seed) => P2.drawnPiece((gg, ink) => {
    const dino = mix(C.dino, C.greenDark, 0.06 + seed * 0.02), dinoD = shade(dino, -0.16);
    // coda: massa grassa bassa a sinistra
    gg.fillStyle = ink(dinoD); P2.fillLimb(gg, -0.95, 2.9, -2.15, 2.75, -2.35, 1.65, 1.05, 0.62);
    // zampe + piedi
    gg.fillStyle = ink(dino);
    D.rect(gg, -1.32, 0.14, 1.12, 2.95, 0.5); D.rect(gg, 0.24, 0.14, 1.12, 2.95, 0.5);
    gg.fillStyle = ink(dinoD);
    D.rect(gg, -1.46, 0, 1.5, 0.64, 0.3); D.rect(gg, 0.1, 0, 1.5, 0.64, 0.3);
    // corpo + pancia chiara incollata (ovale che segue il corpo, non un uovo)
    gg.fillStyle = ink(dino); D.ell(gg, 0, 4.15, 1.6, 2.15);
    gg.fillStyle = ink(C.dinoBelly); D.ell(gg, 0.06, 3.62, 0.84, 1.55);
    // collo + testa + muso
    gg.fillStyle = ink(dino);
    P2.fillLimb(gg, 0.3, 5.5, 0.24, 6.35, 0.5, 6.85, 1.55, 1.35);
    D.ell(gg, 0.52, 7.02, 1.22, 1.1);
    D.rect(gg, 0.45, 6.0, 1.4, 0.9, 0.34);
    // braccine (davanti alla pancia, con la mano tonda)
    gg.fillStyle = ink(shade(dino, -0.24));
    P2.fillLimb(gg, -1.12, 4.7, -1.55, 4.2, -1.42, 3.78, 0.5, 0.34);
    P2.fillLimb(gg, 1.14, 4.8, 1.55, 4.3, 1.44, 3.88, 0.5, 0.34);
    D.ell(gg, -1.42, 3.74, 0.22, 0.2); D.ell(gg, 1.44, 3.84, 0.22, 0.2);
    // cresta dorsale: tre piastre tonde (non punte), più scure, lungo il fianco destro
    gg.fillStyle = ink(shade(dino, -0.26));
    D.ell(gg, 1.62, 3.5, 0.5, 0.62, 0.12);
    D.ell(gg, 1.72, 4.85, 0.52, 0.62, 0.06);
    D.ell(gg, 1.5, 6.05, 0.42, 0.5, -0.1);
    // ---- stampa: bocca, denti, occhio, narici, strisce, unghie ----
    gg.fillStyle = ink('#38200f', 'print'); gg.beginPath(); gg.ellipse(1.02, 6.34, 0.74, 0.3, 0, Math.PI, Math.PI * 2); gg.fill();
    gg.fillStyle = ink('#f7efd9', 'print');
    for (let i = 0; i < 5; i++) { const tx = 0.5 + i * 0.26; D.poly(gg, [[tx, 6.34], [tx + 0.17, 6.34], [tx + 0.085, 6.03]]); }
    gg.fillStyle = ink('#f8f0dc', 'print'); D.ell(gg, 0.92, 7.24, 0.21, 0.23);
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, 0.98, 7.22, 0.105, 0.125);
    gg.fillStyle = ink('#fffaf0', 'print'); D.ell(gg, 1.03, 7.29, 0.038, 0.042);
    gg.fillStyle = ink(dinoD, 'print'); D.ell(gg, 0.9, 7.55, 0.22, 0.06, -0.12);      // sopracciglio
    gg.fillStyle = ink('#2f1a0c', 'print'); D.ell(gg, 1.66, 6.62, 0.075, 0.055);
    gg.fillStyle = ink(dinoD, 'print');                                               // strisce sul fianco
    D.ell(gg, -0.72, 5.15, 0.2, 0.42, 0.35); D.ell(gg, -0.66, 3.0, 0.18, 0.3, -0.4);
    gg.fillStyle = ink(shade(C.dinoBelly, -0.18), 'print');                            // pieghe della pancia
    for (const py of [2.9, 3.55, 4.2]) { gg.beginPath(); gg.ellipse(0.06, py, 0.72, 0.2, 0, 0.2, PI - 0.2); gg.lineWidth = 0.05; gg.strokeStyle = ink(shade(C.dinoBelly, -0.18), 'print'); gg.stroke(); }
    gg.fillStyle = ink(C.yellow, 'print');                                             // unghie
    for (const [tx, ty] of [[-1.3, 0.18], [-0.8, 0.16], [0.26, 0.16], [0.78, 0.18], [1.3, 0.17]]) D.ell(gg, tx, ty, 0.07, 0.06);
  }, { w: 6.0, h: 8.5, res: 64, simplify: 1.0, name: 'rex' });

  const rexProfile = (seed) => P2.drawnPiece((gg, ink) => {
    const dino = shade(mix(C.dino, C.greenDark, 0.12), -0.08);
    gg.fillStyle = ink(dino);
    D.ell(gg, 0.15, 3.0, 1.3, 1.45);                                   // massa del corpo
    P2.fillLimb(gg, 0.35, 3.9, 0.5, 5.0, 0.55, 5.75, 1.2, 0.95);       // collo
    D.ell(gg, 0.6, 6.05, 0.8, 0.72);                                   // testa di profilo
    P2.fillLimb(gg, -1.1, 2.9, -1.75, 2.6, -1.9, 1.9, 0.85, 0.5);      // coda
    D.rect(gg, -0.55, 0.1, 0.62, 2.1, 0.28); D.rect(gg, 0.45, 0.1, 0.62, 2.1, 0.28);
    gg.fillStyle = ink(shade(dino, -0.22));
    for (const [sx, sy, sr] of [[-0.5, 4.4, 0.36], [0.15, 4.5, 0.4], [0.75, 4.2, 0.34]]) D.ell(gg, sx, sy, sr, sr * 0.72);
    gg.fillStyle = ink(C.dinoBelly, 'print'); D.rect(gg, -0.4, 1.5, 1.1, 0.5, 0.2);
  }, { w: 4.6, h: 7.0, res: 56, simplify: 1.2, name: 'rex profilo' });

  {
    const g = new THREE.Group();
    g.add(pc(rexFront(0), { seed: 201, px: 46 }));
    g.add(profileCard(rexProfile(0), { seed: 209, px: 42, t: 0.075 }));
    assemble('rex', g, { x: 6, z: -10, yaw: 0.10, height: 8, solid: 1.6 });
  }

  // ==============================================================================================================
  // 2. SIGNOR PATATA — (-6,-6), alto 4.2. Corpo ovale marrone, cappello/occhi/baffi/naso/orecchie incollati,
  //    braccia FAT (0.42 su ~1.0 di lunghezza: non stecchini).
  // ==============================================================================================================
  const potato = (seed) => P2.drawnPiece((gg, ink) => {
    const skin = mix(C.potato, C.potatoB, 0.08 + seed * 0.05);
    // corpo ovale
    gg.fillStyle = ink(skin); D.ell(gg, 0, 1.75, 1.24, 1.62);
    // scarpe: disegnate DOPO il corpo, sporgono ai lati della base
    gg.fillStyle = ink(C.boot);
    D.rect(gg, -1.16, 0, 0.86, 0.42, 0.2); D.rect(gg, 0.3, 0, 0.86, 0.42, 0.2);
    gg.fillStyle = ink(C.bootB); D.rect(gg, -1.16, 0, 0.86, 0.14, 0.06); D.rect(gg, 0.3, 0, 0.86, 0.14, 0.06);
    // orecchie
    gg.fillStyle = ink(C.pig); D.ell(gg, -1.2, 2.28, 0.28, 0.36); D.ell(gg, 1.2, 2.28, 0.28, 0.36);
    // braccia grasse
    gg.fillStyle = ink(skin);
    P2.fillLimb(gg, -1.05, 2.05, -1.72, 1.55, -1.78, 1.1, 0.46, 0.4);
    P2.fillLimb(gg, 1.05, 2.05, 1.72, 1.55, 1.78, 1.1, 0.46, 0.4);
    gg.fillStyle = ink(mix(skin, '#f0d3ac', 0.35)); D.ell(gg, -1.78, 1.06, 0.26, 0.24); D.ell(gg, 1.78, 1.06, 0.26, 0.24);
    // cappello: falda + cupola
    gg.fillStyle = ink(C.woodInk);
    D.rect(gg, -0.92, 3.06, 1.84, 0.24, 0.12);
    D.rect(gg, -0.63, 3.22, 1.26, 0.95, 0.22);
    // naso grosso arancione
    gg.fillStyle = ink(mix(C.yellow, C.red, 0.32)); D.ell(gg, 0, 1.92, 0.44, 0.36);
    // baffi (due lobi)
    gg.fillStyle = ink(C.woodInk); D.ell(gg, -0.32, 1.5, 0.36, 0.16, 0.16); D.ell(gg, 0.32, 1.5, 0.36, 0.16, -0.16);
    // bocca
    gg.fillStyle = ink('#6b2418'); D.ell(gg, 0, 1.13, 0.28, 0.2);
    gg.fillStyle = ink(C.red, 'print'); D.ell(gg, 0, 1.08, 0.16, 0.09);
    // occhi bianchi
    gg.fillStyle = ink(C.potatoEye); D.ell(gg, -0.44, 2.48, 0.31, 0.33); D.ell(gg, 0.44, 2.48, 0.31, 0.33);
    // stampa: pupille, macchie di patata, luce del cappello
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -0.4, 2.46, 0.11, 0.13); D.ell(gg, 0.48, 2.46, 0.11, 0.13);
    gg.fillStyle = ink('#fffaf0', 'print'); D.ell(gg, -0.35, 2.52, 0.04, 0.045); D.ell(gg, 0.53, 2.52, 0.04, 0.045);
    gg.fillStyle = ink(shade(skin, -0.3), 'print');
    D.ell(gg, -0.7, 2.9, 0.05, 0.04); D.ell(gg, 0.72, 1.5, 0.045, 0.035); D.ell(gg, -0.5, 0.9, 0.04, 0.03); D.ell(gg, 0.1, 2.9, 0.035, 0.03);
    gg.fillStyle = ink(shade(skin, 0.25), 'print'); D.ell(gg, -0.25, 1.7, 0.36, 0.28, 0.2);
    gg.fillStyle = ink(shade(C.woodInk, 0.25), 'print'); D.rect(gg, -0.55, 3.5, 0.5, 0.09, 0.04);
    gg.fillStyle = ink(C.red, 'print'); D.ell(gg, -0.86, 2.1, 0.16, 0.1); D.ell(gg, 0.9, 1.86, 0.14, 0.09);
  }, { w: 4.2, h: 4.3, res: 80, simplify: 0.8, name: 'patata' });

  single('patata', potato(0), { x: -6, z: -6, yaw: -0.34, scale: 1.0, sway: 0.5 });

  // ==============================================================================================================
  // 3. SLINKY — (-4,6): tre carte in fila (testa, molla a fisarmonica, coda), lungo ~7, alto 2.6.
  // ==============================================================================================================
  const slinkyHead = (seed) => P2.drawnPiece((gg, ink) => {
    const fur = mix(C.wood, '#a8784a', 0.25);
    // zampe anteriori + petto (tiene su la testa)
    gg.fillStyle = ink(shade(fur, -0.14));
    D.rect(gg, 0.18, 0, 0.4, 1.3, 0.16); D.rect(gg, 0.62, 0, 0.4, 1.15, 0.16);
    D.ell(gg, 0.5, 1.35, 0.55, 0.62);
    // collare
    gg.fillStyle = ink(C.red); D.rect(gg, 0.12, 1.22, 0.9, 0.26, 0.1);
    // testa
    gg.fillStyle = ink(fur); D.ell(gg, 0.05, 1.88, 0.66, 0.62);
    // muso lungo verso sinistra
    P2.fillLimb(gg, 0.02, 1.78, -0.6, 1.72, -1.02, 1.62, 0.62, 0.44);
    gg.fillStyle = ink(mix(fur, '#f0dcc0', 0.4)); D.ell(gg, -0.9, 1.62, 0.22, 0.16);
    // orecchio floscio, appeso al lato della testa
    gg.fillStyle = ink(shade(fur, -0.34)); D.ell(gg, 0.72, 1.46, 0.3, 0.56, 0.3);
    gg.fillStyle = ink(shade(fur, -0.1)); D.ell(gg, 0.14, 2.16, 0.22, 0.2);
    // stampa
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -1.06, 1.64, 0.11, 0.095);
    D.ell(gg, 0.24, 2.02, 0.13, 0.15); D.ell(gg, 0.29, 2.05, 0.055, 0.062);
    gg.fillStyle = ink('#fffaf0', 'print'); D.ell(gg, 0.33, 2.09, 0.03, 0.033);
    gg.fillStyle = ink(C.yellow, 'print'); D.ell(gg, 0.57, 1.26, 0.11, 0.12);
    gg.fillStyle = ink(shade(fur, 0.18), 'print'); D.ell(gg, 0.0, 1.95, 0.22, 0.16);
    gg.fillStyle = ink(C.red, 'print'); D.rect(gg, 0.18, 1.36, 0.78, 0.05, 0.02);
  }, { w: 2.6, h: 2.7, res: 80, simplify: 0.8, name: 'slinky testa' });

  const slinkySpring = () => P2.drawnPiece((gg, ink) => {
    // le spire SONO la sagoma: una fila di anelli che si sovrappongono, bordo superiore e inferiore a scallops
    for (let i = 0; i < 8; i++) {
      const cx = -1.54 + i * 0.44;
      gg.fillStyle = ink(i % 2 ? C.slinky : shade(C.slinky, 0.14));
      D.ell(gg, cx, 0.8, 0.3, 0.72, (i % 3 - 1) * 0.05);
    }
    // stampa: l'ombra dentro ogni spira (il buco del cerchio) e un filo di luce
    for (let i = 0; i < 8; i++) {
      const cx = -1.54 + i * 0.44;
      gg.fillStyle = ink(shade(C.slinky, -0.55), 'print');
      gg.beginPath(); gg.ellipse(cx + 0.1, 0.8, 0.17, 0.44, 0, -1.15, 1.15); gg.fill();
      gg.fillStyle = ink('#eceeec', 'print');
      gg.beginPath(); gg.ellipse(cx - 0.09, 0.84, 0.035, 0.36, 0, -0.9, 0.9); gg.fill();
    }
  }, { w: 4.0, h: 1.8, res: 64, simplify: 0.9, name: 'slinky molla' });

  const slinkyTail = () => P2.drawnPiece((gg, ink) => {
    const fur = mix(C.wood, '#a8784a', 0.25);
    gg.fillStyle = ink(shade(fur, -0.06));
    D.rect(gg, -0.72, 0, 0.4, 1.1, 0.16); D.rect(gg, -0.24, 0, 0.4, 1.25, 0.16);
    D.ell(gg, 0, 1.42, 0.62, 0.55);
    // coda arricciata stampata (spirale) + punta tagliata: un lobo tondo che ne fa parte
    gg.fillStyle = ink(shade(fur, 0.14)); D.ell(gg, 0.62, 1.62, 0.3, 0.26);
    gg.fillStyle = ink(shade(fur, -0.3), 'print');
    gg.beginPath(); gg.arc(0.72, 1.72, 0.2, -1.4, 3.2); gg.lineWidth = 0.09; gg.strokeStyle = ink(shade(fur, -0.3), 'print'); gg.stroke();
    gg.fillStyle = ink(shade(fur, 0.2), 'print'); D.ell(gg, -0.05, 1.5, 0.3, 0.24);
  }, { w: 1.9, h: 2.1, res: 80, simplify: 0.8, name: 'slinky coda' });

  {
    const g = new THREE.Group();
    const head = pc(slinkyHead(0), { seed: 231, px: 44 }); head.position.set(-2.95, 0, 0); head.rotation.y = -0.12; g.add(head);
    const spring = pc(slinkySpring(), { seed: 233, px: 44 }); spring.position.set(0, 0, 0.02); g.add(spring);
    const tail = pc(slinkyTail(), { seed: 235, px: 44 }); tail.position.set(2.38, 0, 0.04); tail.rotation.y = 0.14; g.add(tail);
    assemble('slinky', g, { x: -4, z: 6, yaw: 0.52, height: 2.6 });
  }

  // ==============================================================================================================
  // 4. PORCELLINO SALVADANAIO — (9,4), alto 3.2. Rosa, tappo dorato, monetina nella fessura.
  // ==============================================================================================================
  const pig = () => P2.drawnPiece((gg, ink) => {
    // zampe
    gg.fillStyle = ink(C.pigB);
    D.rect(gg, -1.2, 0, 0.5, 0.6, 0.16); D.rect(gg, -0.45, 0, 0.5, 0.55, 0.16);
    D.rect(gg, 0.1, 0, 0.5, 0.55, 0.16); D.rect(gg, 0.75, 0, 0.5, 0.6, 0.16);
    // corpo
    gg.fillStyle = ink(C.pig); D.ell(gg, 0, 1.55, 1.55, 1.24);
    // orecchie (lobi)
    gg.fillStyle = ink(C.pigB); D.ell(gg, -0.8, 2.58, 0.32, 0.3, -0.2); D.ell(gg, 0.8, 2.58, 0.32, 0.3, 0.2);
    // grugno
    gg.fillStyle = ink(mix(C.pig, '#f7d8c8', 0.55)); D.ell(gg, 0, 1.3, 0.5, 0.42);
    // tappo dorato sopra il dorso
    gg.fillStyle = ink(C.yellow); D.rect(gg, -0.28, 2.62, 0.56, 0.3, 0.1);
    gg.fillStyle = ink(shade(C.yellow, -0.22)); D.rect(gg, -0.36, 2.86, 0.72, 0.14, 0.07);
    // monetina che entra nella fessura
    gg.fillStyle = ink(shade(C.yellow, 0.16)); D.ell(gg, 0.62, 2.9, 0.34, 0.34);
    gg.fillStyle = ink(shade(C.yellow, -0.3)); D.ell(gg, 0.62, 2.9, 0.2, 0.2);
    // stampa
    gg.fillStyle = ink(shade(C.yellow, 0.3), 'print'); D.ell(gg, 0.62, 2.98, 0.1, 0.08);
    gg.fillStyle = ink('#3a2014', 'print'); D.ell(gg, -0.17, 1.32, 0.07, 0.09); D.ell(gg, 0.17, 1.32, 0.07, 0.09);
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -0.55, 1.86, 0.08, 0.1); D.ell(gg, 0.55, 1.86, 0.08, 0.1);
    gg.fillStyle = ink('#fffaf0', 'print'); D.ell(gg, -0.52, 1.9, 0.028, 0.032); D.ell(gg, 0.58, 1.9, 0.028, 0.032);
    gg.fillStyle = ink(shade(C.pig, -0.32), 'print'); D.rect(gg, -0.16, 2.66, 0.7, 0.07, 0.03);  // fessura
    gg.fillStyle = ink(C.red, 'print'); D.ell(gg, -0.95, 1.42, 0.16, 0.1); D.ell(gg, 0.98, 1.46, 0.15, 0.1);
    gg.fillStyle = ink(shade(C.pig, 0.3), 'print'); D.ell(gg, -0.45, 2.1, 0.4, 0.22, 0.3);
    // codino arricciato
    gg.strokeStyle = ink(shade(C.pig, -0.34), 'print'); gg.lineWidth = 0.08; gg.beginPath(); gg.arc(-1.44, 1.9, 0.2, -1.2, 4.2); gg.stroke();
  }, { w: 3.7, h: 3.3, res: 80, simplify: 0.8, name: 'salvadanaio' });

  single('salvadanaio', pig(), { x: 9, z: 4, yaw: 0.26, scale: 1.0, sway: 0.4 });

  // ==============================================================================================================
  // 5. ASTRONAUTA — (14,2), alto 4.2. Bianco/verde/viola, casco, ali; frontale + profilo dietro (T).
  // ==============================================================================================================
  const astroFront = () => P2.drawnPiece((gg, ink) => {
    // stivali
    gg.fillStyle = ink(C.greenDark);
    D.rect(gg, -0.66, 0, 0.56, 0.42, 0.18); D.rect(gg, 0.1, 0, 0.56, 0.42, 0.18);
    // gambe
    gg.fillStyle = ink(C.whiteB);
    D.rect(gg, -0.6, 0.34, 0.46, 1.0, 0.18); D.rect(gg, 0.14, 0.34, 0.46, 1.0, 0.18);
    // ali / pinne del jetpack
    gg.fillStyle = ink(C.lime); D.ell(gg, -1.32, 2.5, 0.62, 0.3, 0.75); D.ell(gg, 1.32, 2.5, 0.62, 0.3, -0.75);
    gg.fillStyle = ink(C.purple); D.ell(gg, -1.3, 2.34, 0.34, 0.16, 0.75); D.ell(gg, 1.3, 2.34, 0.34, 0.16, -0.75);
    // torso
    gg.fillStyle = ink(C.white); D.rect(gg, -0.84, 1.1, 1.68, 1.9, 0.4);
    // pannello petto verde + cintura viola
    gg.fillStyle = ink(C.lime); D.rect(gg, -0.5, 1.85, 1.0, 0.7, 0.18);
    gg.fillStyle = ink(C.purple); D.rect(gg, -0.86, 1.1, 1.72, 0.3, 0.1);
    // braccia
    gg.fillStyle = ink(C.white);
    P2.fillLimb(gg, -0.78, 2.66, -1.2, 2.2, -1.22, 1.72, 0.44, 0.34);
    P2.fillLimb(gg, 0.78, 2.66, 1.2, 2.2, 1.22, 1.72, 0.44, 0.34);
    gg.fillStyle = ink(C.greenDark); D.ell(gg, -1.22, 1.66, 0.24, 0.24); D.ell(gg, 1.22, 1.66, 0.24, 0.24);
    // casco
    gg.fillStyle = ink(C.white); D.ell(gg, 0, 3.5, 0.9, 0.82);
    gg.fillStyle = ink(C.purple); D.ell(gg, 0, 3.52, 0.66, 0.58);
    gg.fillStyle = ink(C.skin); D.ell(gg, 0, 3.4, 0.42, 0.4);
    // stampa: faccia, visiera, bottoni, badge
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -0.15, 3.48, 0.055, 0.06); D.ell(gg, 0.15, 3.48, 0.055, 0.06);
    gg.fillStyle = ink('#8a3a22', 'print'); D.ell(gg, 0, 3.28, 0.13, 0.06);
    gg.fillStyle = ink(mix(C.whiteB, '#ffffff', 0.5), 'print');
    gg.beginPath(); gg.ellipse(0, 3.62, 0.6, 0.5, 0, 0.35, PI - 0.35); gg.lineWidth = 0.07; gg.strokeStyle = ink(mix(C.whiteB, '#ffffff', 0.55), 'print'); gg.stroke();
    gg.fillStyle = ink(C.red, 'print'); D.ell(gg, -0.34, 2.28, 0.09, 0.09); D.ell(gg, 0.0, 2.3, 0.09, 0.09);
    gg.fillStyle = ink(shade(C.lime, -0.25), 'print'); D.rect(gg, -0.4, 1.98, 0.8, 0.05, 0.02); D.rect(gg, -0.4, 2.12, 0.8, 0.05, 0.02);
    gg.fillStyle = ink(C.yellow, 'print'); D.poly(gg, [[0.52, 2.86], [0.6, 2.72], [0.68, 2.86], [0.84, 2.88], [0.72, 2.98], [0.76, 3.14], [0.6, 3.04], [0.44, 3.14], [0.48, 2.98], [0.36, 2.88]]);
    gg.fillStyle = ink(shade(C.white, -0.22), 'print'); D.rect(gg, -0.8, 1.42, 1.6, 0.06, 0.03);
    gg.fillStyle = ink(C.purple, 'print'); D.ell(gg, -1.24, 2.52, 0.18, 0.08, 0.75); D.ell(gg, 1.24, 2.52, 0.18, 0.08, -0.75);
  }, { w: 4.0, h: 4.4, res: 80, simplify: 0.8, name: 'astronauta' });

  const astroProfile = () => P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(shade(C.whiteB, -0.06));
    D.rect(gg, -0.45, 0.34, 0.4, 1.0, 0.16); D.rect(gg, 0.1, 0.34, 0.4, 1.0, 0.16);
    D.rect(gg, -0.55, 1.1, 1.1, 1.9, 0.35);
    gg.fillStyle = ink(shade(C.white, -0.1)); D.ell(gg, 0, 3.5, 0.62, 0.6);
    gg.fillStyle = ink(C.purple, 'print'); D.ell(gg, 0.16, 3.5, 0.42, 0.42);
    gg.fillStyle = ink(C.greenDark, 'print'); D.rect(gg, -0.5, 0.1, 1.0, 0.2, 0.08);
  }, { w: 1.4, h: 4.2, res: 64, simplify: 1.0, name: 'astronauta profilo' });

  {
    const g = new THREE.Group();
    g.add(pc(astroFront(), { seed: 251, px: 44 }));
    g.add(profileCard(astroProfile(), { seed: 259, px: 42, t: 0.07 }));
    assemble('astronauta', g, { x: 14, z: 2, yaw: -0.22, height: 4.2 });
  }

  // ==============================================================================================================
  // 6. SOLDATINI — 7 carte intorno a (-1,-14), alti 2.2, basetta rotonda stampata, pose diverse.
  // ==============================================================================================================
  const soldier = (pose, seed) => {
    const big = pose === 'crawl';
    return P2.drawnPiece((gg, ink) => {
      const uni = mix(C.greenDark, C.green, 0.15 + (seed % 3) * 0.12);
      // basetta rotonda stampata (plinto): sul cartoncino, non un blocco
      gg.fillStyle = ink(C.kraft); D.ell(gg, 0, 0.26, 0.7, 0.26);
      gg.fillStyle = ink(shade(C.kraft, -0.3)); D.ell(gg, 0, 0.2, 0.7, 0.2);
      if (big) {                                    // che avanza carponi: schiena obliqua, testa alta, fucile pronto
        gg.fillStyle = ink(shade(uni, -0.12));
        D.rect(gg, -0.92, 0.28, 0.78, 0.3, 0.14);   // gamba posteriore stesa
        D.rect(gg, -0.3, 0.26, 0.72, 0.42, 0.2);    // bacino
        gg.fillStyle = ink(uni);
        P2.fillLimb(gg, -0.1, 0.5, 0.3, 0.95, 0.5, 1.22, 0.76, 0.6);        // schiena obliqua
        P2.fillLimb(gg, 0.36, 1.02, 0.78, 0.7, 0.92, 0.4, 0.3, 0.24);       // braccio a terra
        // testa alta + elmetto
        D.ell(gg, 0.56, 1.44, 0.28, 0.28);
        gg.fillStyle = ink(shade(uni, 0.16)); D.ell(gg, 0.56, 1.54, 0.36, 0.26);
        gg.fillStyle = ink(shade(uni, 0.3)); D.rect(gg, 0.2, 1.48, 0.76, 0.1, 0.05);
        // fucile in diagonale, appoggiato al corpo
        gg.fillStyle = ink(C.woodInk); P2.fillLimb(gg, -0.5, 0.62, 0.38, 1.06, 1.12, 0.92, 0.18, 0.13);
        // stampa: viso, cintura, giberne, canna
        gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, 0.66, 1.42, 0.04, 0.045); D.ell(gg, 0.84, 1.4, 0.035, 0.04);
        gg.fillStyle = ink(shade(uni, -0.45), 'print'); D.rect(gg, -0.34, 0.34, 0.7, 0.1, 0.03);
        gg.fillStyle = ink(mix(C.kraft, uni, 0.4), 'print'); D.rect(gg, -0.2, 0.42, 0.2, 0.2, 0.05);
        gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, 1.14, 0.9, 0.05, 0.05);
        gg.fillStyle = ink(shade(uni, -0.5), 'print'); D.rect(gg, -0.92, 0.28, 0.2, 0.28, 0.06);
      } else {
        const low = pose === 'kneel' ? 1 : 0;       // in ginocchio: tutto più basso
        const o = -0.28 * low;
        // gambe
        gg.fillStyle = ink(shade(uni, -0.1));
        if (pose === 'kneel') {
          D.rect(gg, -0.46, 0.2, 0.32, 0.72, 0.12);              // ginocchio a terra
          D.rect(gg, 0.12, 0.2, 0.32, 1.0, 0.12);
        } else {
          D.rect(gg, -0.44, 0.2, 0.34, 1.04, 0.12);
          D.rect(gg, 0.1, 0.2, 0.34, 1.04, 0.12);
        }
        gg.fillStyle = ink(uni);
        D.rect(gg, -0.48, 0.92 + o, 0.96, 0.9, 0.2);             // torso
        // braccia
        P2.fillLimb(gg, -0.44, 1.66 + o, -0.72, 1.32 + o, -0.66, 1.02 + o, 0.3, 0.24);
        gg.fillStyle = ink(uni);
        if (pose === 'grenade' || pose === 'aim') {
          P2.fillLimb(gg, 0.44, 1.62 + o, 0.86, 1.86 + o, 0.96, 1.98 + o, 0.3, 0.24);   // braccio alzato
        } else {
          P2.fillLimb(gg, 0.44, 1.62 + o, 0.74, 1.32 + o, 0.7, 1.02 + o, 0.3, 0.24);
        }
        // fucile grasso in diagonale
        gg.fillStyle = ink(C.woodInk);
        if (pose === 'aim' || pose === 'kneel') P2.fillLimb(gg, -0.3, 1.7 + o, 0.5, 1.55 + o, 0.95, 1.5 + o, 0.16, 0.12);
        else if (pose !== 'grenade') P2.fillLimb(gg, 0.32, 1.84 + o, 0.78, 1.2 + o, 0.92, 0.5 + o, 0.19, 0.14);
        // testa + elmetto
        gg.fillStyle = ink(mix(C.skin, uni, 0.18)); D.ell(gg, 0, 2.02 + o, 0.26, 0.26);
        gg.fillStyle = ink(shade(uni, 0.16)); D.ell(gg, 0, 2.12 + o, 0.34, 0.26);
        gg.fillStyle = ink(shade(uni, 0.3)); D.rect(gg, -0.36, 2.06 + o, 0.72, 0.1, 0.05);
        // stampa: viso, giberne, cintura, suola
        gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -0.08, 2.0 + o, 0.035, 0.04); D.ell(gg, 0.09, 2.0 + o, 0.035, 0.04);
        gg.fillStyle = ink(shade(uni, -0.4), 'print'); D.rect(gg, -0.46, 1.16 + o, 0.92, 0.12, 0.04);
        gg.fillStyle = ink(mix(C.kraft, uni, 0.4), 'print'); D.rect(gg, -0.42, 1.5 + o, 0.2, 0.24, 0.06); D.rect(gg, 0.22, 1.5 + o, 0.2, 0.24, 0.06);
        gg.fillStyle = ink(shade(uni, -0.5), 'print'); D.rect(gg, -0.44, 0.2, 0.34, 0.14, 0.04); D.rect(gg, 0.1, 0.2, 0.34, 0.14, 0.04);
        gg.fillStyle = ink(C.yellow, 'print'); D.ell(gg, 0, 1.28 + o, 0.05, 0.05);
      }
    }, { w: 2.9, h: big ? 2.0 : 2.8, res: 80, simplify: 0.7, name: 'soldatino ' + pose });
  };

  {
    const squad = [
      ['stand', -3.3, -14.4, 0.34, 1.0],
      ['aim', -1.5, -15.5, -0.14, 0.96],
      ['kneel', 0.7, -14.7, 0.5, 1.03],
      ['crawl', -2.5, -12.6, 0.26, 1.0],
      ['grenade', -0.7, -13.1, -0.44, 0.99],
      ['stand', 1.9, -12.8, -0.58, 0.93],
      ['aim', 0.3, -16.1, 0.2, 0.91],
    ];
    squad.forEach(([pose, x, z, yaw, sc], i) => {
      const fig = soldier(pose, i);
      const hd = H.popup(fig[0], fig[1], { x, z, yaw, scale: sc, sway: 0.8 });
      hd.group.name = 'soldatino-' + i;
    });
    H.spots.soldatini = [-1, -14];
  }

  // ==============================================================================================================
  // 7. BLOCCHI ALFABETO — (-13,9): 5 cubi da 1.8 in piramide 2+2+1, lettere A N D Y S su faccia e coperchio.
  // ==============================================================================================================
  const blockFace = (ch, tint) => [
    [[-0.9, 0], [0.9, 0], [0.9, 1.8], [-0.9, 1.8]],
    (P) => {
      P.gradient(shade(tint, 0.1), shade(tint, -0.12), 0.6);
      P.marks('dot', { color: shade(tint, -0.3), alpha: 0.16, size: 0.03, density: 0.5 });
      P.felt(0.55);
      // cornice incollata (strato con lip e ombra) + lettera stampata sopra
      P.layer((g) => {
        g.fillStyle = mix(tint, '#fff7e8', 0.42);
        g.beginPath(); g.rect(-0.68, 0.22, 1.36, 1.36); g.fill();
      }, mix(tint, '#fff7e8', 0.42), { depth: 0.75, lip: 0.85, shadow: 0.95, rim: 0.4 });
      letter(P, ch, 0, 0.92, 1.12, mix(shade(tint, -0.62), '#2b1a0e', 0.35));
      P.innerShade(shade(tint, -0.5), { alpha: 0.28, blurPx: 8 });
    },
  ];

  {
    const g = new THREE.Group();
    const S = 1.8, tk = 0.1, H2 = S / 2;
    const cubes = [
      ['A', -0.94, 0.9, 0.0, 0.02, 0], ['N', 0.9, 0.9, -0.04, -0.05, 1],
      ['D', -0.86, 2.72, 0.06, 0.04, 2], ['Y', 0.96, 2.72, 0.0, 1.62, 3],
      ['S', 0.04, 4.54, 0.04, 0.1, 4],
    ];
    for (const [ch, cx, cy, cz, yaw, i] of cubes) {
      const cg = new THREE.Group();
      cg.position.set(cx, 0, cz); cg.rotation.y = yaw;
      const tint = ['#c8483d', '#4a7fa8', '#d9a94e', '#6f9160', '#b8564a'][i];
      const face = (c, s, px, rot, pos) => {
        const pr = blockFace(ch, c);
        const m = makeCard(pr[0], { paint: pr[1], paper: H.paper, thickness: tk, edgeWidth: 0.045, pxPerUnit: px, seed: s, back: 'kraft' });
        if (rot) m.rotation.set(rot[0], rot[1], 0);
        m.position.set(pos[0], pos[1], pos[2]);
        cg.add(m);
      };
      const y0 = cy - H2;
      face(tint, 300 + i, 44, null, [0, y0, H2]);                        // davanti
      face(shade(tint, 0.04), 360 + i, 40, [0, PI / 2], [H2, y0, 0]);    // destra
      face(shade(tint, -0.2), 380 + i, 40, [0, -PI / 2], [-H2, y0, 0]);  // sinistra
      face(shade(tint, -0.3), 400 + i, 40, [0, PI], [0, y0, -H2]);       // dietro
      face(mix(tint, '#fff7e8', 0.3), 340 + i, 40, [-PI / 2, 0], [0, cy + H2, H2]);  // coperchio
      g.add(cg);
    }
    assemble('blocchi', g, { x: -13, z: 9, yaw: 0.14, height: 5.4, solid: 1.4 });
  }

  // ==============================================================================================================
  // 8. MACCHININA RC — (24,2), lunga 5, alta 2. Corpo di profilo + carta frontale dietro + 4 dischi ruota su perno.
  // ==============================================================================================================
  const rcBody = () => P2.drawnPiece((gg, ink) => {
    // telaio
    gg.fillStyle = ink(shade(C.red, -0.5)); D.rect(gg, -2.35, 0.62, 4.7, 0.3, 0.1);
    // scocca
    gg.fillStyle = ink(C.red);
    D.rect(gg, -2.3, 0.78, 4.6, 0.62, 0.22);
    D.rect(gg, -0.95, 1.26, 2.1, 0.58, 0.24);            // cabina
    D.rect(gg, -1.6, 1.1, 1.1, 0.3, 0.14);               // cofano
    // alettone
    gg.fillStyle = ink(C.cream); D.rect(gg, 1.85, 1.36, 0.4, 0.56, 0.1);
    gg.fillStyle = ink(C.red); D.rect(gg, 1.55, 1.68, 0.95, 0.16, 0.06);
    // antennina
    gg.fillStyle = ink(shade(C.red, -0.3)); D.rect(gg, 1.9, 1.85, 0.14, 0.5, 0.06);
    gg.fillStyle = ink(C.yellow); D.ell(gg, 1.97, 2.36, 0.13, 0.13);
    // striscia crema + numero
    gg.fillStyle = ink(C.cream);
    gg.beginPath(); gg.rect(-2.3, 0.9, 4.6, 0.18); gg.fill();
    gg.fillStyle = ink(C.yellow, 'print'); D.ell(gg, -1.55, 1.16, 0.2, 0.14);
    gg.save(); gg.translate(-1.55, 1.16); gg.scale(1, -1);
    gg.fillStyle = ink('#2b1a0e', 'print'); gg.textAlign = 'center'; gg.textBaseline = 'middle';
    gg.font = '900 0.24px "Arial Black", "Helvetica Neue", sans-serif'; gg.fillText('8', 0, 0); gg.restore();
    // parabrezza
    gg.fillStyle = ink(mix(C.blue, C.cream, 0.25), 'print'); D.rect(gg, -0.82, 1.32, 0.6, 0.44, 0.08);
    gg.fillStyle = ink(mix(C.blue, '#ffffff', 0.4), 'print'); D.rect(gg, -0.76, 1.56, 0.24, 0.1, 0.04);
    // fari e macchie
    gg.fillStyle = ink(C.yellowLight, 'print'); D.ell(gg, -2.18, 1.1, 0.14, 0.1);
    gg.fillStyle = ink(shade(C.red, 0.28), 'print'); D.rect(gg, -2.3, 1.28, 4.6, 0.05, 0.02);
  }, { w: 5.0, h: 2.5, res: 64, simplify: 1.0, name: 'rc corpo' });

  const wheel = (seed) => {
    const pts = Array.from({ length: 26 }, (_, i) => { const a = i / 26 * PI * 2; return [Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5]; });
    return [pts, (P) => {
      P.fill(shade(C.bootB, -0.1));
      P.felt(0.5);
      P.layer(Array.from({ length: 22 }, (_, i) => { const a = i / 22 * PI * 2; return [Math.cos(a) * 0.3, 0.5 + Math.sin(a) * 0.3]; }), C.yellow, { depth: 0.8, lip: 0.9, shadow: 0.8 });
      P.layer(Array.from({ length: 16 }, (_, i) => { const a = i / 16 * PI * 2; return [Math.cos(a) * 0.11, 0.5 + Math.sin(a) * 0.11]; }), shade(C.bootB, -0.4), { depth: 0.5 });
      P.draw((g) => {                       // battistrada stampato + brad
        g.strokeStyle = 'rgba(30,20,10,0.6)'; g.lineWidth = 0.035;
        for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 0.42, 0.5 + Math.sin(a) * 0.42); g.lineTo(Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5); g.stroke(); }
        g.fillStyle = 'rgba(255,246,220,0.55)'; g.beginPath(); g.arc(-0.05, 0.58, 0.045, 0, 7); g.fill();
      });
      P.innerShade('#20140a', { alpha: 0.35, blurPx: 6 });
    }];
  };

  {
    const g = new THREE.Group();
    const body = pc(rcBody(), { seed: 401, px: 46, t: 0.11 }); body.position.z = 0.1; g.add(body);

    const wheels = [];
    for (const [wx, wz] of [[-1.55, 0.2], [1.55, 0.2], [-1.55, -0.62], [1.55, -0.62]]) {
      const w = pc(wheel(0), { seed: 405 + wheels.length, px: 52, t: 0.06 });
      w.position.set(wx, 0, wz); wheels.push(w); g.add(w);
    }
    H.onStep((t) => { for (const w of wheels) w.rotation.z = -t * 0.55; });
    assemble('rc', g, { x: 24, z: 2, yaw: -0.3, height: 2, solid: 1.75 });
  }

  // ==============================================================================================================
  // 9. PALLA — (-20,12), diametro 2.4: tre dischi incrociati (sfera di carta), stampa a spicchi.
  // ==============================================================================================================
  const ballSphere = (seed) => {
    const R = 1.2;
    const print = P2.printCard([[-1, 0], [1, 0], [1, 2], [-1, 2]], {
      pxPerUnit: 96, sheet: H.paper.sheet, seed,
      paint: (P) => {
        P.gradient(shade(C.cream, 0.1), shade(C.cream, -0.16), 0.0);
        P.felt(0.6);
        // spicchi rossi (periodo 2/3: la cucitura del giro non si vede) + calotta al polo
        P.layer((g) => { g.fillStyle = C.red; for (let k = -3; k < 4; k++) g.fillRect(k * (2 / 3), 0, 1 / 3, 2); }, C.red, { depth: 1.6, lip: 0.9, rim: 0.5 });
        P.layer((g) => { g.fillStyle = C.yellow; g.fillRect(-1, 1.84, 2, 0.16); }, C.yellow, { depth: 0.9, lip: 0.9, rim: 0.4 });
        P.draw((g) => {
          g.strokeStyle = 'rgba(58,24,10,0.3)'; g.lineWidth = 0.02;
          for (let k = -3; k < 4; k++) { g.beginPath(); g.moveTo(k * (2 / 3) + 0.02, 0); g.lineTo(k * (2 / 3) + 0.02, 1.84); g.stroke(); }
          g.fillStyle = 'rgba(255,250,236,0.5)'; g.fillRect(-1, 0.9, 2, 0.05);
        });
        P.innerShade('#3a1d0c', { alpha: 0.3, blurPx: 20 });
      },
    });
    const tex = new THREE.CanvasTexture(print.canvas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = H.paper.map.anisotropy;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(R, 34, 22), paperMaterial({ map: tex, normalMap: H.paper.normalMap, normalScale: 0.45 }));
    mesh.position.y = R; mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  };

  {
    const g = new THREE.Group();
    g.add(ballSphere(511));
    assemble('palla', g, { x: -20, z: 12, yaw: 0.18, height: 2.4, solid: 0.9 });
  }

  // ==============================================================================================================
  // 10. AEREO GIOCATTOLO — (-13,16), apertura alare 6, alto 2.4: fusoliera di profilo + ala orizzontale a croce.
  // ==============================================================================================================
  const planeBody = () => P2.drawnPiece((gg, ink) => {
    // vista frontale: ali spiegate (6), fusoliera rossa in mezzo, elica in alto, carrello — legge subito
    // stabilizzatore dietro (più scuro, sotto)
    gg.fillStyle = ink(shade(C.blue, -0.3));
    D.poly(gg, [[-0.42, 0.62], [-2.5, 0.42], [-2.55, 0.15], [-0.3, 0.4]]);
    D.poly(gg, [[0.42, 0.62], [2.5, 0.42], [2.55, 0.15], [0.3, 0.4]]);
    // ali: due bande grasse, appena rialzate alle punte
    gg.fillStyle = ink(C.blue);
    D.poly(gg, [[-0.36, 0.98], [-2.62, 1.34], [-3.0, 1.18], [-3.0, 0.7], [-2.6, 0.62], [-0.36, 0.72]]);
    D.poly(gg, [[0.36, 0.98], [2.62, 1.34], [3.0, 1.18], [3.0, 0.7], [2.6, 0.62], [0.36, 0.72]]);
    // bordo d'attacco crema su ogni ala (strato)
    gg.fillStyle = ink(C.cream);
    D.poly(gg, [[-0.36, 0.98], [-2.62, 1.34], [-2.96, 1.2], [-0.36, 0.86]]);
    D.poly(gg, [[0.36, 0.98], [2.62, 1.34], [2.96, 1.2], [0.36, 0.86]]);
    // fusoliera verticale
    gg.fillStyle = ink(C.red);
    D.rect(gg, -0.5, 0.3, 1.0, 1.5, 0.42);
    // muso / cofano
    gg.fillStyle = ink(shade(C.red, 0.1)); D.ell(gg, 0, 1.78, 0.5, 0.42);
    // carrello
    gg.fillStyle = ink(C.metal); D.rect(gg, -0.75, 0.32, 0.14, 0.38, 0.05); D.rect(gg, 0.61, 0.32, 0.14, 0.38, 0.05);
    gg.fillStyle = ink(C.bootB); D.ell(gg, -0.72, 0.24, 0.28, 0.26); D.ell(gg, 0.72, 0.24, 0.28, 0.26);
    // elica: pale incrociate + mozzo
    gg.fillStyle = ink(C.woodInk);
    D.rect(gg, -0.1, 1.72, 0.2, 0.8, 0.06);
    D.rect(gg, -1.05, 2.06, 2.1, 0.18, 0.08);
    gg.fillStyle = ink(C.yellow); D.ell(gg, 0, 2.15, 0.2, 0.2);
    // ---- stampa ----
    gg.fillStyle = ink(C.cream, 'print'); D.rect(gg, -0.5, 1.12, 1.0, 0.16, 0.06);
    gg.fillStyle = ink(mix(C.blue, C.cream, 0.5), 'print'); D.rect(gg, -0.34, 1.44, 0.68, 0.26, 0.1);
    gg.fillStyle = ink(C.yellow, 'print');
    for (const sx of [-1, 1]) {
      D.poly(gg, [[sx * 1.28, 1.16], [sx * 1.4, 1.02], [sx * 1.58, 1.04], [sx * 1.46, 0.94], [sx * 1.52, 0.76], [sx * 1.34, 0.86], [sx * 1.16, 0.76], [sx * 1.22, 0.94], [sx * 1.1, 1.04], [sx * 1.28, 1.02]]);
      D.ell(gg, sx * 2.5, 1.0, 0.09, 0.07);
    }
    gg.fillStyle = ink(C.yellow, 'print'); D.ell(gg, 0, 0.78, 0.16, 0.16);
    gg.fillStyle = ink(shade(C.red, 0.3), 'print'); D.rect(gg, -0.48, 0.42, 0.96, 0.05, 0.02);
    gg.fillStyle = ink(shade(C.cream, -0.25), 'print');
    for (const rx of [-2.2, 2.2]) D.ell(gg, rx, 0.86, 0.05, 0.07);
  }, { w: 6.4, h: 2.7, res: 64, simplify: 0.9, name: 'aereo' });

  {
    single('aereo', planeBody(), { x: -13, z: 16, yaw: 0.3, sway: 0.4 });
  }

  // ==============================================================================================================
  // 11. ORSETTO DI PEZZA — (-25,15), alto 4. Seduto, cuciture stampate, fiocco rosso.
  // ==============================================================================================================
  const bear = (seed) => P2.drawnPiece((gg, ink) => {
    const fur = mix(C.wood, '#c69a6a', 0.28 + seed * 0.04), furD = shade(fur, -0.14);
    // zampe sedute
    gg.fillStyle = ink(furD);
    D.ell(gg, -0.75, 0.45, 0.56, 0.46, -0.1); D.ell(gg, 0.75, 0.45, 0.56, 0.46, 0.1);
    // corpo
    gg.fillStyle = ink(fur); D.ell(gg, 0, 1.62, 1.12, 1.16);
    // pancia chiara incollata
    gg.fillStyle = ink(mix(fur, '#f4e6cb', 0.55)); D.ell(gg, 0, 1.5, 0.72, 0.8);
    // braccia
    P2.fillLimb(gg, -0.9, 2.1, -1.35, 1.55, -1.24, 1.0, 0.5, 0.42);
    P2.fillLimb(gg, 0.9, 2.1, 1.35, 1.55, 1.24, 1.0, 0.5, 0.42);
    // testa
    gg.fillStyle = ink(fur); D.ell(gg, 0, 3.1, 0.86, 0.8);
    // orecchie
    D.ell(gg, -0.66, 3.7, 0.3, 0.29); D.ell(gg, 0.66, 3.7, 0.3, 0.29);
    // muso
    gg.fillStyle = ink(mix(fur, '#f8ecd6', 0.66)); D.ell(gg, 0, 2.94, 0.42, 0.32);
    // fiocco
    gg.fillStyle = ink(C.red);
    D.poly(gg, [[-0.06, 2.36], [-0.5, 2.5], [-0.5, 2.14]]); D.poly(gg, [[0.06, 2.36], [0.5, 2.5], [0.5, 2.14]]);
    D.ell(gg, 0, 2.33, 0.12, 0.13);
    // stampa: occhi, naso, bocca, cuciture, cuscinetti
    gg.fillStyle = ink('#241a10', 'print'); D.ell(gg, -0.32, 3.2, 0.085, 0.1); D.ell(gg, 0.32, 3.2, 0.085, 0.1);
    gg.fillStyle = ink('#fffaf0', 'print'); D.ell(gg, -0.29, 3.24, 0.03, 0.034); D.ell(gg, 0.35, 3.24, 0.03, 0.034);
    gg.fillStyle = ink('#2b1a0e', 'print'); D.ell(gg, 0, 2.98, 0.13, 0.1);
    gg.strokeStyle = ink('#2b1a0e', 'print'); gg.lineWidth = 0.035;
    gg.beginPath(); gg.moveTo(0, 2.9); gg.lineTo(0, 2.82); gg.moveTo(-0.14, 2.76); gg.quadraticCurveTo(0, 2.7, 0.14, 2.76); gg.stroke();
    gg.fillStyle = ink(mix(fur, '#f4e6cb', 0.5), 'print'); D.ell(gg, -0.75, 0.42, 0.26, 0.2); D.ell(gg, 0.75, 0.42, 0.26, 0.2);
    gg.fillStyle = ink(furD, 'print');
    gg.beginPath(); gg.arc(0.62, 1.9, 0.34, -0.9, 0.9); gg.lineWidth = 0.07; gg.strokeStyle = ink(furD, 'print'); gg.stroke();
    gg.fillStyle = ink(shade(fur, 0.2), 'print'); D.ell(gg, -0.3, 2.0, 0.42, 0.26, 0.3);
    gg.fillStyle = ink(C.red, 'print'); D.ell(gg, -0.5, 2.3, 0.05, 0.05); D.ell(gg, 0.5, 2.3, 0.05, 0.05);
  }, { w: 3.4, h: 4.1, res: 80, simplify: 0.8, name: 'orsetto' });

  single('orsetto', bear(0), { x: -25, z: 15, yaw: -0.28, scale: 1.0, solid: 1.0, sway: 0.45 });

  // ==============================================================================================================
  // 12. SCATOLA DI PASTELLI — (17,-6), scatola 3x2x2 aperta, 6 pastelli colorati che spuntano.
  // ==============================================================================================================
  const crayonBox = (face) => [
    [[-1.5, 0], [1.5, 0], [1.5, 2.0], [-1.5, 2.0]],
    (P) => {
      P.gradient(shade(C.kraft, 0.12), shade(C.kraft, -0.16), 0.4);
      P.felt(0.6);
      P.layer((g) => { g.fillStyle = C.blue; g.fillRect(-1.5, 0.55, 3, 0.95); }, C.blue, { depth: 1, lip: 0.9, rim: 0.5 });
      P.layer((g) => { g.fillStyle = C.cream; g.fillRect(-1.24, 0.78, 2.48, 0.5); }, C.cream, { depth: 0.7, lip: 0.8 });
      letter(P, '8', 0, 1.03, 0.44, mix(C.red, '#2b1a0e', 0.25));
      P.draw((g) => {
        g.fillStyle = C.red; g.fillRect(-1.5, 1.78, 3, 0.16);
        for (let i = 0; i < 6; i++) {                    // pastelli stampati in fila sul bordo
          g.fillStyle = [C.red, C.yellow, C.green, C.blue, C.purple, '#d98a4a'][i];
          g.fillRect(-1.3 + i * 0.44, 1.56, 0.28, 0.2);
        }
      });
      P.innerShade('#3a1d0c', { alpha: 0.3, blurPx: 10 });
    }];

  const crayon = (col, hgt) => {
    const w = 0.21;
    return [[[-w, 0], [w, 0], [w, hgt - 0.3], [0, hgt], [-w, hgt - 0.3]],
      (P) => {
        P.gradient(shade(col, 0.18), shade(col, -0.2), 0.5);
        P.felt(0.55);
        P.layer((g) => { g.fillStyle = shade(col, -0.28); g.fillRect(-w, 0.05, 2 * w, hgt * 0.34); }, shade(col, -0.3), { depth: 0.5, lip: 0.6 });
        P.draw((g) => {
          g.fillStyle = 'rgba(255,248,232,0.75)'; g.fillRect(-w * 0.55, hgt * 0.42, w * 0.3, hgt * 0.4);
          g.fillStyle = 'rgba(255,248,232,0.5)'; g.fillRect(-w * 0.8, hgt * 0.36, 2 * w * 0.8, 0.05);
        });
        P.innerShade('#2b1a0e', { alpha: 0.28, blurPx: 6 });
      }];
  };

  // faccia laterale della scatola: 2 larghi (profondità) x 2 alti
  const crayonSide = () => [
    [[-1.0, 0], [1.0, 0], [1.0, 2.0], [-1.0, 2.0]],
    (P) => {
      P.gradient(shade(C.kraft, 0.06), shade(C.kraft, -0.22), 0.4);
      P.felt(0.6);
      P.layer((g) => { g.fillStyle = C.blue; g.fillRect(-1.0, 0.55, 2.0, 0.95); }, C.blue, { depth: 1, lip: 0.9, rim: 0.5 });
      P.draw((g) => {
        g.fillStyle = C.red; g.fillRect(-1.0, 1.78, 2.0, 0.16);
        g.fillStyle = 'rgba(255,246,224,0.7)';
        for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-0.6 + i * 0.4, 1.2, 0.12, 0, 7); g.fill(); }
      });
      P.innerShade('#3a1d0c', { alpha: 0.3, blurPx: 10 });
    },
  ];

  {
    const g = new THREE.Group();
    const box = pc(crayonBox('front'), { seed: 701, px: 46 }); box.position.set(0, 0, 0.62); g.add(box);
    const back = pc([crayonBox('front')[0], (P) => { P.fill(shade(C.kraft, -0.3)); P.felt(0.5); P.innerShade('#2b1a0e', { alpha: 0.35, blurPx: 8 }); }],
      { seed: 703, px: 34, t: 0.07, back: 'kraft' });
    back.position.set(0, 0, -0.62); g.add(back);
    const side = pc(crayonSide(), { seed: 705, px: 44, t: 0.07 });
    side.rotation.y = PI / 2; side.position.set(1.5, 0, 0); g.add(side);
    const cols = [C.red, C.yellow, C.blue, C.green, C.purple, '#d98a4a'];
    const hs = [2.25, 2.55, 2.15, 2.6, 2.35, 2.5];
    cols.forEach((col, i) => {
      const c = pc(crayon(col, hs[i]), { seed: 711 + i, px: 56, t: 0.055, back: 'kraft' });
      c.position.set(-1.16 + i * 0.46, 0.35, i % 2 ? 0.18 : -0.12);
      c.rotation.z = (i % 2 ? 1 : -1) * 0.05;
      g.add(c);
    });
    assemble('pastelli', g, { x: 17, z: -6, yaw: 0.32, height: 3.0 });
  }
}
