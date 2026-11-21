// pieces/hero.js — lo sceriffo: un burattino di carta, 18 carte a T (una frontale + una di profilo dietro ogni parte).
// Legge da davanti, di lato e da dietro, si gira verso la direzione di marcia (lo fa l'harness), gambe e braccia
// oscillano con la distanza percorsa. Proporzioni da giocattolo: testa grande, gambe corte, stivali grossi.
import { makeCard } from 'papercraft/lib/paperkit-3d.js';
import { C, arc } from './palette.js';

export function heroDoll(H) {
  const P2 = H.P2, THREE = H.THREE, D = P2.draw2;
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const PROFILE = -Math.PI / 2;                 // una carta di profilo: il suo +x punta avanti (+z)
  const card = ([pts, paint], seed, { x = 0, y = 0, z = 0, ry = 0, parent = body, back = 'mirror', folds = [] } = {}) => {
    const m = makeCard(pts, { paint, paper: H.paper, thickness: 0.042, edgeWidth: 0.02, pxPerUnit: 120, seed, back, folds });
    m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m;
  };
  const paint = (draw, opts) => P2.drawnPiece(draw, { layer: { depth: 0.4 }, ...opts });

  // ---- GAMBE: jeans con cucitura e risvolto, stivale marrone con sperone ----
  const leg = (side) => {
    const hip = new THREE.Group(); hip.position.set(side * 0.13, 0.95, 0); body.add(hip);
    const front = paint((gg, ink) => {
      gg.fillStyle = ink(C.denim); D.rect(gg, -0.13, 0.2, 0.26, 0.82, 0.06);                 // gamba
      gg.fillStyle = ink(C.denimB); D.rect(gg, -0.13, 0.2, 0.26, 0.12, 0.03);               // risvolto
      gg.fillStyle = ink(C.boot); D.rect(gg, -0.16, 0, 0.32, 0.29, 0.09);                   // stivale
      gg.fillStyle = ink(C.bootB); D.rect(gg, -0.145, 0.21, 0.29, 0.06, 0.02);                // tacco
      gg.fillStyle = ink('#f2e2c2', 'print'); gg.fillRect(-0.095, 0.42, 0.014, 0.56);        // cucitura
      gg.fillStyle = ink('#d9a94e', 'print'); gg.fillRect(-0.14, 0.015, 0.28, 0.028);         // suola
    }, { w: 0.36, h: 1.02, name: 'gamba' });
    const profile = paint((gg, ink) => {
      gg.fillStyle = ink(P2.shade(C.denim, -0.08)); D.rect(gg, -0.1, 0.2, 0.2, 0.82, 0.05);
      gg.fillStyle = ink(P2.shade(C.denimB, -0.05)); D.rect(gg, -0.1, 0.2, 0.2, 0.12, 0.03);
      gg.fillStyle = ink(P2.shade(C.boot, -0.05)); D.rect(gg, -0.1, 0, 0.34, 0.24, 0.07);    // piede verso +z
      gg.fillStyle = ink(C.bootB); D.rect(gg, -0.1, 0.18, 0.3, 0.06, 0.02);
    }, { w: 0.44, h: 1.02, name: 'gamba profilo' });
    card(front, 310 + side, { y: -1.02, parent: hip, back: (P) => { P.fill(P2.shade(C.denim, -0.12)); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 6 }); } });
    card(profile, 314 + side, { y: -1.02, z: -0.17, ry: PROFILE, parent: hip });
    return hip;
  };
  const legs = [leg(-1), leg(1)];

  // ---- TORSO: camicia a quadri, gilet maculato da mucca, cintura con fibbia, bandana rossa, stella di sceriffo ----
  const torsoFront = P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(C.shirt); D.rect(gg, -0.36, 0, 0.72, 1.34, 0.18);
    // quadri della camicia (stampa piatta: è un disegno, non uno strato)
    gg.fillStyle = ink(P2.rgba(C.check, 0.55), 'print');
    for (let y = 0.13; y < 1.3; y += 0.17) gg.fillRect(-0.36, y, 0.72, 0.05);
    for (let x = -0.3; x < 0.36; x += 0.16) gg.fillRect(x, 0, 0.045, 1.34);
    // gilet: due pannelli di carta incollati, bordo chiaro, macchie da mucca
    gg.fillStyle = ink(C.vest); D.rect(gg, -0.4, 0.05, 0.3, 1.26, 0.07); D.rect(gg, 0.1, 0.05, 0.3, 1.26, 0.07);
    gg.fillStyle = ink(P2.shade(C.vest, -0.16)); D.rect(gg, -0.4, 0.05, 0.3, 0.1, 0.04); D.rect(gg, 0.1, 0.05, 0.3, 0.1, 0.04);
    // macchie della mucca (grandi, contate)
    gg.fillStyle = ink(C.spot, 'print');
    D.ell(gg, -0.26, 0.9, 0.1, 0.13, 0.3); D.ell(gg, -0.16, 0.52, 0.09, 0.11, -0.4); D.ell(gg, 0.24, 0.72, 0.11, 0.1, 0.2); D.ell(gg, 0.19, 0.3, 0.08, 0.09);
    // cintura e fibbia
    gg.fillStyle = ink(C.bootB); D.rect(gg, -0.4, 0, 0.8, 0.13, 0.03);
    gg.fillStyle = ink(C.yellow, 'print'); D.rect(gg, -0.09, 0.015, 0.18, 0.1, 0.02);
    gg.fillStyle = ink(C.bootB, 'print'); D.rect(gg, -0.045, 0.04, 0.09, 0.05, 0.01);
    // bandana al collo
    gg.fillStyle = ink(C.bandana); D.poly(gg, [[-0.24, 1.3], [0.24, 1.3], [0.06, 1.05], [-0.06, 1.05]]);
    gg.fillStyle = ink(P2.shade(C.bandana, -0.25), 'print'); D.poly(gg, [[-0.13, 1.22], [0.0, 1.13], [0.13, 1.22], [0.0, 1.26]]);
    // stella di sceriffo, stampata
    const star = (cx, cy, R) => [[0, 1], [0.22, 0.31], [1, 0.31], [0.36, -0.19], [0.59, -0.95], [0, -0.5], [-0.59, -0.95], [-0.36, -0.19], [-1, 0.31], [-0.22, 0.31]]
      .map(([u, v]) => [cx + u * R, cy + v * R]);
    gg.fillStyle = ink(C.yellow, 'print'); D.poly(gg, star(-0.17, 1.06, 0.07));
  }, { w: 0.86, h: 1.38, name: 'torso' });
  card(torsoFront, 301, { y: 0.86, back: (P) => { P.fill(P2.shade(C.vest, -0.2)); P.marks('dot', { color: C.spot, alpha: 0.5, size: 0.09, density: 0.8 }); P.innerShade('#3a2010', { alpha: 0.35, blurPx: 8 }); } });
  card(P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(P2.shade(C.shirt, -0.1)); D.rect(gg, -0.22, 0, 0.44, 1.32, 0.12);
    gg.fillStyle = ink(P2.shade(C.vest, -0.12)); D.rect(gg, -0.19, 0.06, 0.38, 1.18, 0.06);
    gg.fillStyle = ink(C.spot, 'print'); D.ell(gg, -0.02, 0.8, 0.08, 0.1, 0.4); D.ell(gg, 0.05, 0.4, 0.07, 0.08);
    gg.fillStyle = ink(C.bootB); D.rect(gg, -0.2, 0, 0.4, 0.13, 0.03);
  }, { w: 0.5, h: 1.36, name: 'torso profilo' }), 302, { y: 0.8, z: -0.2, ry: PROFILE });

  // ---- TESTA: faccia leggibile a distanza di gioco, capelli dietro, orecchie nel profilo ----
  card(P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(C.skin); D.ell(gg, 0, 0.4, 0.375, 0.4);
    gg.fillStyle = ink(C.hair); D.rect(gg, -0.33, 0.58, 0.66, 0.22, 0.09);                        // frangia
    gg.fillStyle = ink(C.hair, 'print'); D.rect(gg, -0.37, 0.32, 0.08, 0.26, 0.03); D.rect(gg, 0.29, 0.32, 0.08, 0.26, 0.03); // basette
    gg.fillStyle = ink('#2a1608', 'print'); D.ell(gg, -0.13, 0.43, 0.05, 0.062); D.ell(gg, 0.13, 0.43, 0.05, 0.062);
    gg.fillStyle = ink('#f7f2e4', 'print'); D.ell(gg, -0.113, 0.442, 0.014, 0.016); D.ell(gg, 0.147, 0.442, 0.014, 0.016);
    gg.fillStyle = ink(C.hair, 'print'); D.ell(gg, -0.13, 0.525, 0.072, 0.024, -0.22); D.ell(gg, 0.13, 0.525, 0.072, 0.024, 0.22); // sopracciglia
    gg.fillStyle = ink(P2.shade(C.skin, -0.22), 'print'); D.ell(gg, 0, 0.335, 0.06, 0.055);       // naso
    gg.fillStyle = ink('#8a3a22', 'print'); gg.beginPath(); gg.ellipse(0, 0.225, 0.12, 0.06, 0, 0, Math.PI); gg.fill(); // sorriso
    gg.fillStyle = ink(P2.rgba('#d98a72', 0.5), 'print'); D.ell(gg, -0.22, 0.27, 0.065, 0.045); D.ell(gg, 0.22, 0.27, 0.065, 0.045); // guance
  }, { w: 0.88, h: 0.88, name: 'faccia' }), 304, { y: 1.98, back: (P) => { P.fill(C.hair); P.innerShade('#2a1608', { alpha: 0.4, blurPx: 8 }); } });
  card(P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(P2.shade(C.skin, -0.05)); D.ell(gg, 0, 0.4, 0.35, 0.4);
    gg.fillStyle = ink(C.hair); D.ell(gg, -0.11, 0.46, 0.29, 0.35);                            // capelli dietro
    gg.fillStyle = ink(P2.shade(C.skin, -0.18), 'print'); D.ell(gg, -0.02, 0.38, 0.075, 0.1); // orecchio
    gg.fillStyle = ink(P2.shade(C.skin, -0.05), 'print'); D.poly(gg, [[0.18, 0.47], [0.33, 0.38], [0.18, 0.33]]); // naso di profilo
    gg.fillStyle = ink('#2a1608', 'print'); D.ell(gg, 0.21, 0.4, 0.032, 0.043);
  }, { w: 0.82, h: 0.88, name: 'testa profilo' }), 305, { y: 1.98, z: -0.35, ry: PROFILE });

  // ---- CAPPELLO: falda orizzontale (vista dall'alto come una vera falda) + cupola frontale e di profilo ----
  const brim = makeCard(P2.roughen(Array.from({ length: 40 }, (_, i) => { const a = i / 40 * Math.PI * 2; return [Math.cos(a) * 0.36, Math.sin(a) * 0.29]; }), P2.rng(9), { amp: 0.004, keepBase: false }),
    { paint: (P) => { P.gradient(P2.shade(C.hat, 0.12), P2.shade(C.hat, -0.2), 0.4); P.felt(0.7); P.marks('dot', { color: P2.shade(C.hat, -0.4), alpha: 0.35, size: 0.03, density: 0.8 }); P.innerShade('#3a2010', { alpha: 0.3, blurPx: 8 }); },
      paper: H.paper, thickness: 0.045, edgeWidth: 0.022, pxPerUnit: 110, seed: 306, folds: [], back: 'mirror' });
  brim.rotation.x = -Math.PI / 2; brim.position.set(0, 2.96, 0.02); body.add(brim);
  const crown = (c, seed, ry) => card(P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink(c); D.rect(gg, -0.25, 0, 0.5, 0.4, 0.1);
    gg.fillStyle = ink(P2.shade(c, -0.3)); D.rect(gg, -0.26, 0, 0.52, 0.1, 0.03);              // nastro
    gg.fillStyle = ink(P2.shade(c, 0.18), 'print'); D.rect(gg, -0.22, 0.24, 0.14, 0.035, 0.015);   // piega
  }, { w: 0.54, h: 0.44, name: 'cupola' }), seed, { y: 2.70, z: ry ? -0.15 : 0.035, ry });
  crown(C.hat, 307, 0); crown(P2.shade(C.hat, -0.08), 308, PROFILE);

  // ---- BRACCIA: manica a quadri + mano; il braccio destro porta il lazo ----
  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group(); sh.position.set(side * 0.56, 2.04, 0); body.add(sh);
    const art = (c) => P2.drawnPiece((gg, ink) => {
      gg.fillStyle = ink(c); D.rect(gg, -0.1, 0.14, 0.2, 0.7, 0.08);
      gg.fillStyle = ink(P2.rgba(C.check, 0.45), 'print'); gg.fillRect(-0.1, 0.44, 0.2, 0.035); gg.fillRect(-0.1, 0.66, 0.2, 0.035);
      gg.fillStyle = ink(C.shirt); D.rect(gg, -0.105, 0.72, 0.21, 0.1, 0.03);                        // spalla del gilet
      gg.fillStyle = ink(C.skin); D.ell(gg, 0, 0.1, 0.105, 0.095);                                // mano
    }, { w: 0.28, h: 0.86, name: 'braccio' });
    card(art(C.shirt), 330 + side, { y: -0.86, parent: sh });
    card(art(P2.shade(C.shirt, -0.1)), 340 + side, { y: -0.86, z: -0.12, ry: PROFILE, parent: sh });
    return sh;
  });
  // il lazo appeso alla mano destra: un anello di corda disegnato in profilo
  card(P2.drawnPiece((gg, ink) => {
    gg.fillStyle = ink('#c9a86a'); gg.beginPath(); gg.arc(0.02, 0.34, 0.26, 0, Math.PI * 2); gg.fill();
    gg.fillStyle = ink('#e6d9b8', 'print'); gg.beginPath(); gg.arc(0.02, 0.34, 0.19, 0, Math.PI * 2); gg.fill();
  }, { w: 0.6, h: 0.7, name: 'lazo' }), 350, { y: -1.34, z: 0.05, ry: PROFILE, parent: arms[1] });

  // ---- passo: la fase corre con la distanza percorsa; in appoggio l'angolo è lineare nella distanza, così il piede
  // piantato non slitta; le braccia vanno in opposizione; il corpo fa due rimbalzi per falcata ----
  const legLen = 1.02 * 1.25, stepLen = 1.15, R = stepLen / (2 * legLen);
  const gaitAngle = (ph, gait) => { const u = (ph / Math.PI) % 2, A = gait * R; if (u >= 1) return A * (3 - 2 * u); const e = u * u * (3 - 2 * u); return A * (2 * e - 1); };
  g.userData.stride = (walked, gait) => {
    const ph = walked / stepLen * Math.PI, l0 = gaitAngle(ph, gait), l1 = gaitAngle(ph + Math.PI, gait);
    legs[0].rotation.x = -l0; legs[1].rotation.x = -l1;
    arms[0].rotation.x = l0 * 0.75; arms[1].rotation.x = l1 * 0.75 * 0.4;
    body.position.y = Math.abs(Math.sin(ph)) * 0.045 * gait;
  };
  return g;
}
