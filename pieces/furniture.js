// pieces/furniture.js — i mobili della stanza di Andy, in carta.
// Letto, scrivania, sedia, cassettone, baule, libreria a tre mensole sfalsate. Tutto quello su cui si cammina è un
// `platform()` costruito APERTO (gambe o pannelli con i vuoti tagliati fino alla base, piano in assi, supporto dietro)
// e registrato nel walk field; i pezzi appoggiati sul piano vivono nel frame `userData.deck`, così salgono col piano.
//
// SUBJECT    mobili di legno dipinto, tessuto di carta (coperta blu a stelle crema), ottone e ferro stampati
// STOCK      cardstock per ogni carta, kraft per i dorsi, spessore 0.08 = 2.2 % dell'eroe
// INKS       legno in 4 toni (b57a45 / cf9a63 / 8a5730 / 5e3a20), ottone d9a94e, ferro 7d7568, blu coperta 6f9ec4
//            + stelle f0d9a0, lenzuolo efe0c4, dorsi dei libri rosso/blu/giallo/verde/purpura
// LIGHT      chiave calda da sinistra-alto: ogni strato incollato ha un lip chiaro a sinistra e un'ombra corta a destra
// ---------------------------------------------------------------------------------------------------------------

import { makeCard, platform } from 'papercraft/lib/paperkit-3d.js';
import { C, arc, rrect, shade, mix, rgba } from './palette.js';

export function buildFurniture(H) {
  const P2 = H.P2, THREE = H.THREE, D = P2.draw2;
  const { popup, walk } = H;
  const PI = Math.PI;

  // ===============================================================================================================
  // helpers: sagome tagliate, legno stampato, tessuto
  // ===============================================================================================================
  const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  /** Una sagoma die-cut da un'unione di rettangoli (gambe, assi, pannelli): il box ha margine, così non viene tagliata. */
  const cut = (parts, w, h, name) => P2.fromDrawing((g) => {
    for (const [x, y, ww, hh] of parts) D.rect(g, x, y, ww, hh);
  }, { w: w + 0.5, h: h + 0.4, name });

  /** Un telaio aperto: una traversa in cima e n montanti, i vuoti tagliati fino alla base (supporto posteriore). */
  const postsOutline = (w, h, { n = 2, pw = 0.9, beam = 1.0 } = {}) => {
    const parts = [[-w / 2, h - beam, w, beam]];
    for (let i = 0; i < n; i++) {
      const cx = n === 1 ? 0 : -w / 2 + pw / 2 + i * (w - pw) / (n - 1);
      parts.push([cx - pw / 2, 0, pw, h]);
    }
    return cut(parts, w, h, 'supporto');
  };

  const starPts = (cx, cy, R, r = R * 0.45, n = 5, rot = -PI / 2) => {
    const out = [];
    for (let i = 0; i < n * 2; i++) { const a = rot + i * PI / n, rr = i % 2 ? r : R; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return out;
  };

  /** Pannello con due angoli superiori arrotondati e un arco appena accennato (testiera, schienale). */
  const roundedTop = (w, h, { c = 0.85, arch = 0.4, n = 10 } = {}) => {
    const hw = w / 2, out = [[-hw, 0], [hw, 0], [hw, h - c]];
    out.push(...arc(hw - c, h - c, c, c, 0, PI / 2, 5));
    for (let i = 1; i < n; i++) { const t = i / n; out.push([(hw - c) - 2 * (hw - c) * t, h + arch * Math.sin(PI * t)]); }
    out.push(...arc(-hw + c, h - c, c, c, PI / 2, PI, 5));
    return out;
  };

  /** Legno stampato: base a due toni, assi ognuna il suo strato incollato, venature e chiodi stampati, banda e ombra. */
  function paintWood(c, { planks = 5, axis = 'v', nails = true, grain = true, band = null, knots = 0, tone = 1 } = {}) {
    return (P) => {
      const { box, U, r } = P;
      P.gradient(shade(c, 0.1 * tone), shade(c, -0.18 * tone), axis === 'v' ? 0.22 : 0.9);
      P.felt(0.7);
      const N = Math.max(1, planks), tones = [-0.17, 0.09, -0.08, 0.14, -0.13, 0.04];
      const span = axis === 'v' ? box.w : box.h, step = span / N, gap = Math.max(0.02, U * 0.009);
      P.layer((g) => {
        for (let i = 0; i < N; i++) {
          g.fillStyle = shade(c, tones[i % tones.length] * tone);
          if (axis === 'v') g.fillRect(box.x0 - 1 + i * step + gap, box.y0 - 1, step - 2 * gap, box.h + 2);
          else g.fillRect(box.x0 - 1, box.y0 - 1 + i * step + gap, box.w + 2, step - 2 * gap);
        }
      }, c, { lip: 0.7, depth: 0.72, shade: 0.68 });
      // i giunti fra le assi: una fuga scura stampata, la cucitura che legge le assi
      P.draw((g) => {
        g.fillStyle = rgba(shade(c, -0.62), 0.9);
        for (let i = 1; i < N; i++) {
          if (axis === 'v') g.fillRect(box.x0 + i * step - Math.max(0.012, U * 0.005), box.y0 - 1, Math.max(0.024, U * 0.01), box.h + 2);
          else g.fillRect(box.x0 - 1, box.y0 + i * step - Math.max(0.012, U * 0.005), box.w + 2, Math.max(0.024, U * 0.01));
        }
      });
      if (grain) P.draw((g) => {
        g.lineCap = 'round';
        for (let i = 0; i < N; i++) for (let k = 0; k < 2; k++) {
          g.strokeStyle = rgba(shade(c, -0.45), 0.42 + 0.22 * r());
          g.lineWidth = U * (0.008 + 0.007 * r());
          const u0 = i * step + step * (0.2 + 0.55 * r());
          const v0 = (axis === 'v' ? box.y0 : box.x0) + (axis === 'v' ? box.h : box.w) * (0.05 + 0.55 * r());
          const L = (axis === 'v' ? box.h : box.w) * (0.18 + 0.3 * r()), wob = U * 0.05;
          g.beginPath();
          if (axis === 'v') { const x = box.x0 + u0; g.moveTo(x, v0); g.bezierCurveTo(x + wob, v0 + L * 0.3, x - wob, v0 + L * 0.7, x + wob * 0.4, v0 + L); }
          else { const y = box.y0 + u0; g.moveTo(v0, y); g.bezierCurveTo(v0 + L * 0.3, y + wob, v0 + L * 0.7, y - wob, v0 + L, y + wob * 0.4); }
          g.stroke();
        }
        // nodi: grandi, contati
        for (let k = 0; k < knots; k++) {
          const x = box.x0 + box.w * (0.1 + 0.8 * r()), y = box.y0 + box.h * (0.1 + 0.8 * r()), rr = U * (0.035 + 0.02 * r());
          g.strokeStyle = rgba(shade(c, -0.45), 0.55); g.lineWidth = U * 0.012;
          for (let q = 3; q >= 1; q--) { g.beginPath(); g.ellipse(x, y, rr * q * 0.42, rr * q * 0.26, 0.3, 0, 7); g.stroke(); }
        }
      });
      if (nails) P.draw((g) => {
        for (let i = 0; i < N; i++) for (const e of [0.07, 0.93]) {
          const x = axis === 'v' ? box.x0 + (i + 0.5) * step : box.x0 + box.w * e;
          const y = axis === 'v' ? box.y0 + box.h * e : box.y0 + (i + 0.5) * step;
          const rr = Math.max(0.05, U * 0.016);
          g.fillStyle = rgba(shade(c, -0.6), 0.8); g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();   // testa del chiodo
          g.fillStyle = rgba(mix(c, '#fff6e2', 0.55), 0.7); g.beginPath(); g.arc(x - rr * 0.32, y + rr * 0.32, rr * 0.4, 0, 7); g.fill(); // luce sul bordo
        }
      });
      if (band) P.layer((g) => g.fillRect(box.x0 - 1, box.y0 + box.h * band.y0, box.w + 2, box.h * (band.y1 - band.y0) + 1),
        band.c || shade(c, 0.1), { lip: 0.8, depth: 0.8, shade: 0.6 });
      P.innerShade(shade(c, -0.62), { alpha: 0.4, blurPx: 10 });
    };
  }

  /** La coperta blu a stelle crema sul piano del letto (il piano camminabile è il materasso stampato). */
  function paintQuilt(P) {
    const { box, U } = P;
    P.gradient(shade(C.sheet, 0.07), shade(C.sheet, -0.09), 0.6); P.felt(0.6);
    // l'orlo del lenzuolo ripiegato sul davanti: una striscia di carta incollata, con la piega
    P.layer((g) => g.fillRect(box.x0 - 1, box.y0 - 1, box.w + 2, box.h * 0.095 + 1), mix(C.sheet, '#fffdf4', 0.35), { lip: 0.95, depth: 0.9, shade: 0.5 });
    P.draw((g) => {
      g.strokeStyle = rgba(shade(C.sheet, -0.35), 0.5); g.lineWidth = U * 0.012; g.setLineDash([U * 0.06, U * 0.05]);
      g.beginPath(); g.moveTo(box.x0, box.y0 + box.h * 0.055); g.lineTo(box.x1, box.y0 + box.h * 0.055); g.stroke(); g.setLineDash([]);
    });
    // la coperta: un pannello di carta blu incollato, bordo chiaro a sinistra, ombra corta
    const q0 = box.y0 + box.h * 0.11, q1 = box.y1 - box.h * 0.015;
    P.layer(rectPts(box.x0 + box.w * 0.012, q0, box.w * 0.976, q1 - q0), C.blanket, { lip: 0.8, shade: 0.7, depth: 0.9 });
    // trapuntatura: reticolo stampato a 45 gradi
    P.draw((g) => {
      g.strokeStyle = rgba(shade(C.blanket, -0.28), 0.5); g.lineWidth = U * 0.011; g.setLineDash([U * 0.09, U * 0.07]);
      const dq = q1 - q0;
      for (let k = -4; k < 14; k++) {
        g.beginPath(); g.moveTo(box.x0 + box.w * k / 6, q0); g.lineTo(box.x0 + box.w * (k / 6 + dq / box.w), q0 + dq); g.stroke();
        g.beginPath(); g.moveTo(box.x0 + box.w * k / 6, q1); g.lineTo(box.x0 + box.w * (k / 6 + dq / box.w), q1 - dq); g.stroke();
      }
      g.setLineDash([]);
    });
    // le stelle crema: carte incollate, contate
    const r = P2.rng(77), st = [];
    for (let i = 0; i < 14; i++) st.push(starPts(box.x0 + box.w * (0.08 + 0.84 * r()), q0 + (q1 - q0) * (0.08 + 0.8 * r()), U * (0.042 + 0.018 * r()), U * 0.019));
    P.layer((g) => { g.fillStyle = C.star; for (const s of st) D.poly(g, s); }, C.star, { lip: 0.85, depth: 0.5, shade: 0.4 });
    P.innerShade(shade(C.blanket, -0.5), { alpha: 0.22, blurPx: 8 });
  }

  /** Il runner di stoffa sul piano del cassettone. */
  function runner(P) {
    const { box, U } = P;
    const y0 = box.y0 + box.h * 0.34, y1 = box.y0 + box.h * 0.66;
    P.layer(rectPts(box.x0 + box.w * 0.05, y0, box.w * 0.9, y1 - y0), C.rugCream, { lip: 0.85, depth: 0.8, shade: 0.5 });
    P.draw((g) => {
      // una riga rossa cucita a ogni bordo e la frangia alle due estremità
      g.fillStyle = rgba(C.rug, 0.8);
      g.fillRect(box.x0 + box.w * 0.05, y0 + (y1 - y0) * 0.12, box.w * 0.9, U * 0.035);
      g.fillRect(box.x0 + box.w * 0.05, y1 - (y1 - y0) * 0.12 - U * 0.035, box.w * 0.9, U * 0.035);
      g.strokeStyle = rgba(shade(C.rugCream, -0.4), 0.6); g.lineWidth = U * 0.012; g.setLineDash([U * 0.06, U * 0.045]);
      g.beginPath(); g.moveTo(box.x0 + box.w * 0.05, y0 + U * 0.07); g.lineTo(box.x1 - box.w * 0.05, y0 + U * 0.07);
      g.moveTo(box.x0 + box.w * 0.05, y1 - U * 0.07); g.lineTo(box.x1 - box.w * 0.05, y1 - U * 0.07); g.stroke(); g.setLineDash([]);
      g.strokeStyle = rgba(C.rugCream, 0.9); g.lineWidth = U * 0.011;
      for (let i = 0; i < 18; i++) {
        const yy = y0 + (y1 - y0) * i / 17;
        g.beginPath(); g.moveTo(box.x0 + box.w * 0.05, yy); g.lineTo(box.x0 + box.w * 0.05 - U * 0.04, yy + U * 0.01); g.stroke();
        g.beginPath(); g.moveTo(box.x1 - box.w * 0.05, yy); g.lineTo(box.x1 - box.w * 0.05 + U * 0.04, yy + U * 0.01); g.stroke();
      }
    });
  }

  // ---- le costruzioni: platform aperto, camminabile, con i pezzi del piano nel deck frame -------------------------
  function build({ name, cx, cz, w, d, h, facePts, supportPts, paints, holes = {}, seed }) {
    const z = cz + d / 2;                                  // la cerniera sta sul fronte, il piano va indietro di d
    const node = platform({ w, d, h, paper: H.paper, seed, facePts, supportPts, holes: holes || {},
      paints, print: H.cardOpts(cx, cz) });
    node.name = name;
    const hnd = popup(null, null, { node, height: h, x: cx, z, level: true });
    walk.add(node);
    H.spots[name] = [cx, cz, w, d, h];
    return { node, hnd, deck: node.userData.deck, cx, cz, w, d, h };
  }

  /** Carta che appoggia piatta sul piano (libri, foglio, coperchio, cuscino). */
  function lying(deck, pts, paint, { x = 0, z = 0, yaw = 0, y = 0.07, thickness = 0.1, seed = 1, holes = null, tilt = 0 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw;
    const m = makeCard(pts, { paint, paper: H.paper, thickness, edgeWidth: 0.045, pxPerUnit: 46, effects: 1, seed, holes, folds: [], back: 'kraft' });
    m.rotation.x = -PI / 2 + tilt; g.add(m); deck.add(g); return g;      // tilt: appoggiata ma inclinata (cuscino)
  }

  /** Carta appesa sotto il piano (anta, cassetto, gonna): nel frame del piano, attaccata al bordo davanti. */
  function hanging(deck, pts, paint, { x = 0, z = 0.06, y = 0, seed = 1, thickness = 0.09 } = {}) {
    const m = makeCard(pts, { paint, paper: H.paper, thickness, edgeWidth: 0.05, pxPerUnit: 46, effects: 1, seed, folds: [], back: 'kraft' });
    m.position.set(x, y, z); deck.add(m); return m;
  }

  /** Un pezzo in piedi sul piano, sulla sua cerniera (sale col piano). */
  function standing(deck, pts, paint, { x = 0, z = 0, yaw = 0, height, order, seed = 1, scale = 1 } = {}) {
    return popup(pts, paint, { parent: deck, x, z, yaw, height, order, scale, edge: 0.05 });
  }

  // ===============================================================================================================
  // 1. IL LETTO — centro (-17, -15), 18 x 13, piano 4.6, testiera e cuscino, coperta blu a stelle
  // ===============================================================================================================
  {
    const cx = -17, cz = -15, w = 18, d = 13, h = 4.6;
    const facePts = cut([
      [-w / 2, h - 1.4, w, 1.4],                        // traversa del piede
      [-w / 2, 0, w, 1.1],                              // asse di base
      [-w / 2 + 0.2, 0, 1.6, h],                        // montante sinistro
      [-w * 0.17 - 0.7, 0, 1.4, h],                     // montanti del piede
      [w * 0.17 - 0.7, 0, 1.4, h],
      [w / 2 - 1.8, 0, 1.6, h],                         // montante destro
    ], w, h, 'letto');

    const paintFace = (P) => {
      paintWood(C.wood, { planks: 11, axis: 'v', nails: true, knots: 2 })(P);
      const { box, U } = P;
      // la coperta ripiegata sul piede: blu con le stelle crema, e l'orlo del lenzuolo sotto
      P.layer((g) => g.fillRect(box.x0 - 1, box.y1 - box.h * 0.30, box.w + 2, box.h * 0.30 + 1), C.blanket, { lip: 0.8, depth: 0.9, shade: 0.6 });
      P.layer((g) => g.fillRect(box.x0 - 1, box.y1 - box.h * 0.375, box.w + 2, box.h * 0.07), C.sheet, { lip: 0.9, depth: 0.8 });
      const r = P2.rng(12), st = [];
      for (let i = 0; i < 9; i++) st.push(starPts(box.x0 + box.w * (0.06 + 0.88 * r()), box.y1 - box.h * (0.05 + 0.2 * r()), U * 0.045, U * 0.02));
      P.layer((g) => { g.fillStyle = C.star; for (const s of st) D.poly(g, s); }, C.star, { lip: 0.8, depth: 0.5 });
    };

    const b = build({ name: 'letto', cx, cz, w, d, h, seed: 501, facePts,
      paints: { face: paintFace, deck: paintQuilt, support: paintWood(C.woodDark, { planks: 4, axis: 'v', nails: true, knots: 1 }) } });
    const o = b.hnd.order;

    // la testiera: alta 4 sopra il piano, appoggiata al bordo di fondo
    const hb = roundedTop(16.2, 4.05, { c: 0.9, arch: 0.42 });
    standing(b.deck, hb, (P) => {
      paintWood(C.wood, { planks: 6, axis: 'v', nails: true, knots: 1, band: { y0: 0.86, y1: 1, c: C.woodLight } })(P);
      const { box, U } = P;
      // pannello interno più chiaro, con una stella intagliata
      P.layer(rectPts(box.x0 + box.w * 0.1, box.y0 + box.h * 0.14, box.w * 0.8, box.h * 0.6), mix(C.wood, C.page, 0.18), { lip: 0.8, depth: 0.8, shade: 0.6 });
      P.layer((g) => { g.fillStyle = C.star; D.poly(g, starPts(box.x0 + box.w * 0.5, box.y0 + box.h * 0.44, box.w * 0.075)); }, C.star, { lip: 0.9, depth: 0.8, shade: 0.5 });
      P.draw((g) => { g.fillStyle = rgba(shade(C.wood, -0.4), 0.6); for (const t of [0.12, 0.88]) for (const y of [0.06, 0.9]) { g.beginPath(); g.arc(box.x0 + box.w * t, box.y0 + box.h * y, U * 0.016, 0, 7); g.fill(); } });
    }, { x: 0.4, z: -d + 0.45, height: 4.05, order: o + 0.35, seed: 505 });

    // il cuscino: due carte appoggiate, una sotto più scura (spessore di carta)
    const pillowPts = rrect(-3.3, 0, 6.6, 2.9, 0.85);
    lying(b.deck, pillowPts, (P) => {
      const { box, U } = P;
      P.gradient(shade(C.pillow, 0.06), shade(C.pillow, -0.14), 0.4); P.felt(0.75);
      // la faccia gonfia del cuscino: uno strato incollato più chiaro, rientrato dal bordo
      P.layer(rrect(box.x0 + box.w * 0.09, box.y0 + box.h * 0.14, box.w * 0.82, box.h * 0.72, U * 0.18), mix(C.pillow, '#fffdf3', 0.22), { lip: 0.95, shade: 0.6, depth: 0.8 });
      P.draw((g) => {
        // la cucitura tutto intorno e la piega al centro
        g.strokeStyle = rgba(shade(C.pillow, -0.4), 0.5); g.lineWidth = U * 0.012; g.setLineDash([U * 0.05, U * 0.04]);
        g.strokeRect(box.x0 + box.w * 0.05, box.y0 + box.h * 0.09, box.w * 0.9, box.h * 0.82); g.setLineDash([]);
        g.strokeStyle = rgba(shade(C.pillow, -0.32), 0.4); g.lineWidth = U * 0.016;
        g.beginPath(); g.moveTo(box.x0 + box.w * 0.3, box.y0 + box.h * 0.2); g.quadraticCurveTo(box.x0 + box.w * 0.5, box.y0 + box.h * 0.5, box.x0 + box.w * 0.3, box.y1 - box.h * 0.2); g.stroke();
      });
      P.innerShade(shade(C.pillow, -0.55), { alpha: 0.26, blurPx: 9 });
    }, { x: -3.4, z: -d + 3.0, yaw: -0.05, y: 0.12, thickness: 0.16, seed: 511, tilt: 0.62 });
    lying(b.deck, rrect(-3.35, 0, 6.7, 2.95, 0.85), (P) => { P.fill(shade(C.pillow, -0.26)); P.felt(0.5); }, { x: -3.4, z: -d + 3.05, yaw: -0.05, y: 0.05, thickness: 0.14, seed: 512, tilt: 0.58 });

    // l'orlo del lenzuolo ripiegato: una striscia di carta sul davanti del materasso
    lying(b.deck, rectPts(-8.4, -0.9, 16.8, 1.5), (P) => {
      const { box, U } = P;
      P.gradient(shade(C.sheet, 0.12), shade(C.sheet, -0.06), 0.5); P.felt(0.7);
      P.layer(rectPts(box.x0 - 1, box.y0 - 1, box.w + 2, box.h * 0.5), mix(C.sheet, '#ffffff', 0.3), { lip: 0.9, depth: 0.8 });
      P.draw((g) => { g.strokeStyle = rgba(shade(C.sheet, -0.4), 0.5); g.lineWidth = U * 0.013; g.setLineDash([U * 0.07, U * 0.05]);
        g.beginPath(); g.moveTo(box.x0, box.y0 + box.h * 0.48); g.lineTo(box.x1, box.y0 + box.h * 0.48); g.stroke(); g.setLineDash([]); });
      P.innerShade(shade(C.sheet, -0.5), { alpha: 0.2, blurPx: 7 });
    }, { x: 0, z: -0.55, y: 0.1, thickness: 0.12, seed: 515 });
  }

  // ===============================================================================================================
  // 2. LA SCRIVANIA — centro (13, -20), 22 x 11, piano 7.2: gambe a pannello con vuoti, cassetti, lampada accesa,
  //    mucchio di libri, bicchiere con matite, foglio disegnato
  // ===============================================================================================================
  {
    const cx = 13, cz = -20, w = 22, d = 11, h = 7.2;
    const facePts = cut([
      [-w / 2, h - 1.6, w, 1.6],                        // fascia sotto il piano
      [-w / 2 + 0.25, 0, 2.6, h],                        // gamba a pannello sinistra
      [w / 2 - 2.85, 0, 2.6, h],                         // gamba a pannello destra
      [-w / 2 + 0.25, 0.25, w - 0.5, 0.75],              // traversa bassa
    ], w, h, 'scrivania');

    const lampLocal = { x: -7.6, z: -7.4 };              // dove sta la lampada sul piano (per la pozza di luce)

    const paintFace = (P) => {
      paintWood(C.wood, { planks: 13, axis: 'v', nails: true, knots: 2 })(P);
      const { box, U } = P;
      // i pannelli delle gambe: un riquadro dipinto di crema, listato
      for (const sgn of [-1, 1]) {
        const x0 = sgn < 0 ? box.x0 + box.w * 0.014 : box.x1 - box.w * 0.132;
        const pw = box.w * 0.118;
        P.layer(rectPts(x0, box.y0 + box.h * 0.06, pw, box.h * 0.86), mix(C.cream, C.sheet, 0.25), { rim: 0.6, lip: 0.8, depth: 0.7, shade: 0.4 });
        P.draw((g) => {
          g.strokeStyle = rgba(shade(C.woodInk, 0.1), 0.55); g.lineWidth = U * 0.014;
          g.strokeRect(x0 + pw * 0.16, box.y0 + box.h * 0.12, pw * 0.68, box.h * 0.74);
        });
      }
      // la fascia: venature chiare e un bordo scuro
      P.draw((g) => { g.fillStyle = rgba(shade(C.wood, -0.4), 0.5); g.fillRect(box.x0, box.y1 - box.h * 0.215, box.w, U * 0.03); });
    };

    const paintDesk = (P) => {
      paintWood(C.woodLight, { planks: 9, axis: 'h', nails: true, knots: 2, tone: 0.9 })(P);
      const { box, U } = P;
      // pozza calda della lampada, stampata nel piano
      const lx = box.x0 + box.w / 2 + lampLocal.x, ly = box.y0 - lampLocal.z;
      P.draw((g) => {
        const gr = g.createRadialGradient(lx, ly, 0, lx, ly, 3.4);
        gr.addColorStop(0, 'rgba(255,226,160,0.55)'); gr.addColorStop(0.55, 'rgba(255,214,140,0.22)'); gr.addColorStop(1, 'rgba(255,205,130,0)');
        g.fillStyle = gr; g.fillRect(box.x0, box.y0, box.w, box.h);
      });
      // segni di matita e una macchia d'inchiostro
      P.draw((g) => {
        g.strokeStyle = rgba(shade(C.woodInk, 0.2), 0.4); g.lineWidth = U * 0.008;
        for (let i = 0; i < 5; i++) { const y = box.y0 + box.h * (0.2 + 0.6 * P.r()); g.beginPath(); g.moveTo(box.x0 + box.w * 0.1, y); g.lineTo(box.x0 + box.w * (0.25 + 0.2 * P.r()), y + U * 0.02); g.stroke(); }
      });
    };

    const b = build({ name: 'scrivania', cx, cz, w, d, h, seed: 601, facePts,
      supportPts: postsOutline(w * 0.96, h, { n: 2, pw: 1.5, beam: 1.4 }).map(([x, y]) => [x, y - h]),
      paints: { face: paintFace, deck: paintDesk,
        support: (P) => { paintWood(C.wood, { planks: 3, axis: 'v', nails: true, tone: 0.9 })(P);
          const { box, U } = P;
          P.layer((g) => { g.save(); g.translate(box.x0 + box.w / 2, box.y0 + box.h * 0.45); g.rotate(-0.6); g.fillRect(-box.w * 0.9, -U * 0.05, box.w * 1.8, U * 0.1); g.restore(); }, shade(C.wood, -0.16), { lip: 0.7, depth: 0.7 });
        } } });
    const o = b.hnd.order;

    // ---- i cassetti sotto il piano: la fessura scura dietro, il cassetto davanti con la maniglia d'ottone
    const drawerPaint = (wide) => (P) => {
      const { box, U } = P;
      P.fill(shade(C.woodInk, -0.1)); P.felt(0.4);
      // il fronte del cassetto: una carta chiara incollata con il suo bordo, dentro una fuga scura
      const m = U * 0.06;
      P.layer(rectPts(box.x0 + m, box.y0 + m, box.w - 2 * m, box.h - 2 * m), shade(C.woodLight, 0.04), { rim: 0.9, lip: 0.9, depth: 0.85, shade: 0.55 });
      P.draw((g) => {
        // le assi del cassetto e la fuga fra le due
        g.fillStyle = rgba(shade(C.wood, -0.5), 0.5);
        for (const x of [0.34, 0.67]) g.fillRect(box.x0 + box.w * x - U * 0.008, box.y0 + box.h * 0.14, U * 0.016, box.h * 0.72);
        // l'ombra che il piano fa sul cassetto
        g.fillStyle = rgba('#3a2412', 0.35); g.fillRect(box.x0, box.y1 - box.h * 0.14, box.w, box.h * 0.14);
      });
      // maniglia d'ottone: una barra con i due perni e l'ombra sotto
      const hw = wide ? box.w * 0.3 : box.w * 0.42, hh = U * 0.16;
      P.draw((g) => { g.fillStyle = rgba('#4a2a10', 0.45); g.fillRect(box.x0 + box.w * 0.5 - hw / 2, box.y0 + box.h * 0.46 - hh * 0.2, hw, hh * 0.5); });
      P.layer(rectPts(box.x0 + box.w * 0.5 - hw / 2, box.y0 + box.h * 0.44, hw, hh), C.rugGold, { lip: 0.95, depth: 0.9, shade: 0.6 });
      P.draw((g) => {
        g.fillStyle = rgba('#5e3a20', 0.6);
        for (const t of [0.04, 0.96]) g.fillRect(box.x0 + box.w * 0.5 - hw / 2 + hw * t - U * 0.02, box.y0 + box.h * 0.44 - U * 0.03, U * 0.04, hh + U * 0.06);
      });
    };
    // fessura scura
    hanging(b.deck, rectPts(-4.9, -1.55, 9.8, 1.55), (P) => { P.fill('#2a1a0e'); P.felt(0.4); }, { x: -0.7, z: 0.02, seed: 611 });
    hanging(b.deck, rectPts(-3.5, -1.42, 7.0, 1.42), drawerPaint(true), { x: -3.3, z: 0.16, seed: 612 });
    hanging(b.deck, rectPts(-1.6, -1.2, 3.2, 1.2), drawerPaint(false), { x: 3.4, z: 0.3, seed: 613 });

    // ---- la lampada da scrivania, accesa
    const lampPts = P2.fromDrawing((g) => {
      D.ell(g, 0, 0.26, 1.05, 0.26);                                        // base tonda
      D.rect(g, -0.26, 0.2, 0.52, 1.62, 0.12);                              // stelo (grasso: niente stuzzicadenti)
      D.poly(g, [[-0.42, 2.6], [0.42, 2.6], [0.92, 1.7], [-0.92, 1.7]]);    // paralume
      D.rect(g, -0.98, 1.6, 1.96, 0.24, 0.1);                               // bordo del paralume
    }, { w: 2.5, h: 3.2, name: 'lampada' });
    const lamp = standing(b.deck, lampPts, (P) => {
      const { U } = P;
      P.gradient(shade('#6c6156', 0.1), shade('#4a423a', -0.1), 0.3); P.felt(0.6);
      // stelo e base d'ottone
      P.layer(rectPts(-0.28, 0.18, 0.56, 1.64), C.rugGold, { lip: 0.9, depth: 0.8, shade: 0.5 });
      P.layer((g) => { g.beginPath(); g.ellipse(0, 0.26, 0.85, 0.2, 0, 0, 7); g.fill(); }, shade(C.rugGold, -0.1), { rim: 0.7, lip: 0.9, depth: 0.8 });
      // paralume rosso con il bordo crema e il vetro acceso
      P.layer((g) => { g.beginPath(); g.moveTo(-0.42, 2.54); g.lineTo(0.42, 2.54); g.lineTo(0.88, 1.78); g.lineTo(-0.88, 1.78); g.closePath(); g.fill(); }, C.red, { rim: 0.8, lip: 0.9, depth: 0.85, shade: 0.5 });
      P.layer(rectPts(-0.96, 1.62, 1.92, 0.28), mix(C.cream, C.yellow, 0.35), { rim: 0.8, lip: 0.9, depth: 0.8 });
      P.draw((g) => { g.fillStyle = rgba(shade(C.red, -0.4), 0.6); for (let i = -2; i <= 2; i++) g.fillRect(i * 0.3 - 0.035, 1.8 + Math.abs(i) * 0.085, 0.07, 0.7 - Math.abs(i) * 0.085); });
      P.innerShade('#2a1608', { alpha: 0.22, blurPx: 7 });
      // il vetro acceso sotto il bordo: alone caldo
      P.glow((g) => { g.beginPath(); g.ellipse(0, 1.75, 0.92, 0.16, 0, 0, 7); g.fill(); g.fillRect(-0.9, 1.5, 1.8, 0.2); });
    }, { x: lampLocal.x, z: lampLocal.z, height: 2.9, order: o + 1.2, seed: 615 });
    H.glowing(lamp.group);

    // ---- il mucchio di 3 libri (carte appoggiate, ognuna il suo strato)
    const bookCovers = [
      { c: C.blue, a: C.cream, x: -1.6, z: -2.6, yaw: 0.16, w: 4.6, d: 3.3 },
      { c: C.red, a: C.yellow, x: -1.2, z: -2.9, yaw: -0.1, w: 4.0, d: 2.9 },
      { c: C.yellow, a: C.red, x: -1.9, z: -2.4, yaw: 0.3, w: 3.4, d: 2.5 },
    ];
    bookCovers.forEach((bk, i) => {
      lying(b.deck, rectPts(-bk.w / 2, -bk.d / 2, bk.w, bk.d), (P) => {
        const { box, U } = P;
        P.gradient(shade(bk.c, 0.12), shade(bk.c, -0.14), 0.5); P.felt(0.65);
        // il taglio delle pagine sul bordo vicino (il basso della stampa): crema con le righe dei fogli
        P.layer(rectPts(box.x0, box.y0, box.w, box.h * 0.13), C.sheet, { rim: 0.8, lip: 0.8, depth: 0.7 });
        P.draw((g) => {
          g.strokeStyle = rgba(shade(C.sheet, -0.35), 0.5); g.lineWidth = U * 0.006;
          for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(box.x0, box.y0 + box.h * 0.13 * k / 5); g.lineTo(box.x1, box.y0 + box.h * 0.13 * k / 5); g.stroke(); }
        });
        // il dorso di carta incollato sul lato sinistro, con le due file d'oro
        P.layer(rectPts(box.x0, box.y0, box.w * 0.17, box.h), shade(bk.c, -0.26), { lip: 0.85, depth: 0.75 });
        P.layer((g) => { g.fillStyle = C.rugGold; g.fillRect(box.x0, box.y0 + box.h * 0.2, box.w * 0.17, box.h * 0.045); g.fillRect(box.x0, box.y0 + box.h * 0.76, box.w * 0.17, box.h * 0.045); }, C.rugGold, { lip: 0.75, depth: 0.6 });
        // l'etichetta in copertina: una carta chiara con un ornamento
        P.layer(rectPts(box.x0 + box.w * 0.26, box.y0 + box.h * 0.4, box.w * 0.5, box.h * 0.34), bk.a, { rim: 0.7, lip: 0.8, depth: 0.7 });
        P.layer((g) => { g.fillStyle = shade(bk.c, -0.3); D.poly(g, starPts(box.x0 + box.w * 0.51, box.y0 + box.h * 0.57, box.w * 0.07)); }, shade(bk.c, -0.3), { lip: 0.8, depth: 0.5 });
      }, { x: bk.x, z: bk.z, yaw: bk.yaw, y: 0.1 + i * 0.22, thickness: 0.18, seed: 620 + i });
    });

    // ---- il bicchiere con le matite: un assemblaggio aperto di 4 carte sottili + 3 matite
    const cupPaint = (P) => {
      const { box, U } = P;
      P.gradient(shade(C.cream, 0.1), shade(C.kraft, -0.05), 0.4); P.felt(0.6);
      P.layer(rectPts(box.x0 - 1, box.y0 + box.h * 0.42, box.w + 2, box.h * 0.28), C.red, { lip: 0.85, depth: 0.7 });
      P.draw((g) => {
        g.fillStyle = rgba(shade(C.kraft, -0.4), 0.5);
        for (const x of [0.08, 0.92]) g.fillRect(box.x0 + box.w * x - U * 0.012, box.y0 + box.h * 0.1, U * 0.024, box.h * 0.8);
        g.fillStyle = rgba('#3a2412', 0.35); g.beginPath(); g.ellipse(box.x0 + box.w / 2, box.y1 - box.h * 0.02, box.w * 0.42, box.h * 0.06, 0, 0, 7); g.fill();
      });
    };
    const cupPts = P2.fromDrawing((g) => { D.rect(g, -1.1, 0, 2.2, 1.5, 0.12); }, { w: 2.8, h: 2.0, name: 'bicchiere' });
    for (let k = 0; k < 4; k++) {
      const a = PI / 4 + k * PI / 2, rr = 0.92;
      standing(b.deck, cupPts, cupPaint, { x: 5.2 + Math.sin(a) * rr, z: -4.9 + Math.cos(a) * rr, yaw: a, height: 1.5, order: o + 1.35 + k * 0.02, seed: 630 + k });
    }
    const pencils = [[C.red, 2.6, 0.5, 0.0], [C.yellow, 2.9, 1.35, 0.18], [C.green, 2.35, 2.4, -0.16]];
    pencils.forEach(([col, hh, ang, dx], i) => {
      const pw = 0.26;
      const pp = P2.drawnPiece((g, ink) => {
        g.fillStyle = ink(col); D.rect(g, -pw / 2, 0, pw, hh * 0.82, 0.05);                                              // fusto
        g.fillStyle = ink(mix(C.wood, C.page, 0.4)); D.poly(g, [[-pw / 2, hh * 0.82], [pw / 2, hh * 0.82], [0, hh]]);     // punta
        g.fillStyle = ink(shade(col, -0.35)); D.rect(g, -pw / 2, 0, pw * 0.32, hh * 0.82, 0.04);
        g.fillStyle = ink('#3a2412', 'print'); D.poly(g, [[-0.045, hh * 0.94], [0.045, hh * 0.94], [0, hh]]);
        g.fillStyle = ink('#d9a94e', 'print'); D.rect(g, -pw / 2, hh * 0.62, pw, hh * 0.03);
      }, { w: 0.9, h: hh + 0.4, name: 'matita' });
      standing(b.deck, pp[0], pp[1], { x: 5.2 + dx, z: -4.9 + (i - 1) * 0.1, yaw: ang, height: hh, order: o + 1.45 + i * 0.02, seed: 640 + i });
    });

    // ---- il foglio con il disegno: una carta appoggiata con un razzo a pastello
    lying(b.deck, rectPts(-1.9, -1.4, 3.8, 2.8), (P) => {
      const { box, U } = P;
      P.gradient('#fbf3df', '#efe1c6', 0.5); P.felt(0.55);
      P.draw((g) => {
        const X = (f) => box.x0 + box.w * f, Y = (f) => box.y0 + box.h * f;
        g.lineCap = g.lineJoin = 'round';
        // il razzo: corpo a pastello blu, punta rossa, alette, fiamma
        g.strokeStyle = rgba(C.blue, 0.95); g.lineWidth = U * 0.055;
        g.beginPath(); g.moveTo(X(0.5), Y(0.22)); g.lineTo(X(0.5), Y(0.66)); g.stroke();
        g.fillStyle = rgba(C.red, 0.9); g.beginPath(); g.moveTo(X(0.5), Y(0.9)); g.lineTo(X(0.6), Y(0.64)); g.lineTo(X(0.4), Y(0.64)); g.closePath(); g.fill();
        g.strokeStyle = rgba(C.red, 0.85); g.lineWidth = U * 0.045;
        g.beginPath(); g.moveTo(X(0.41), Y(0.34)); g.lineTo(X(0.3), Y(0.16)); g.stroke();
        g.beginPath(); g.moveTo(X(0.59), Y(0.34)); g.lineTo(X(0.7), Y(0.16)); g.stroke();
        g.fillStyle = rgba(C.yellow, 0.9); g.beginPath(); g.moveTo(X(0.5), Y(0.2)); g.lineTo(X(0.45), Y(0.1)); g.lineTo(X(0.55), Y(0.1)); g.closePath(); g.fill();
        // una stella grande in alto a sinistra e un sole a destra
        g.fillStyle = rgba(C.yellow, 0.85); D.poly(g, starPts(X(0.2), Y(0.76), U * 0.13));
        g.strokeStyle = rgba(C.red, 0.7); g.lineWidth = U * 0.03;
        g.beginPath(); g.arc(X(0.84), Y(0.84), U * 0.1, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(X(0.14), Y(0.1)); g.lineTo(X(0.86), Y(0.1)); g.stroke();
      });
    }, { x: 2.4, z: -1.5, yaw: -0.22, y: 0.05, thickness: 0.06, seed: 650 });
  }

  // ===============================================================================================================
  // 3. LA SEDIA — centro (11, -9.5), 7 x 7, piano 3.2: il gradino per la scrivania, con schienale
  // ===============================================================================================================
  {
    const cx = 11, cz = -9.5, w = 7, d = 7, h = 3.2;
    const facePts = cut([
      [-w / 2, h - 1.0, w, 1.0],                          // traversa sotto la seduta
      [-w / 2, 0.1, w, 0.55],                             // traversa bassa
      [-w / 2 + 0.1, 0, 0.95, h],                         // gambe davanti
      [w / 2 - 1.05, 0, 0.95, h],
    ], w, h, 'sedia');
    const b = build({ name: 'sedia', cx, cz, w, d, h, seed: 701, facePts,
      supportPts: postsOutline(w * 0.9, h, { n: 2, pw: 0.9, beam: 0.9 }).map(([x, y]) => [x, y - h]),
      paints: {
        face: (P) => { paintWood(C.wood, { planks: 5, axis: 'v', nails: true, knots: 1 })(P);
          const { box, U } = P;
          P.draw((g) => { g.fillStyle = rgba(shade(C.wood, -0.45), 0.5); g.fillRect(box.x0, box.y1 - box.h * 0.12, box.w, U * 0.03); }); },
        deck: (P) => { paintWood(C.woodLight, { planks: 4, axis: 'h', nails: true, knots: 1, band: { y0: 0, y1: 0.14, c: shade(C.woodLight, -0.1) } })(P); },
        support: paintWood(C.wood, { planks: 2, axis: 'v', nails: true, tone: 0.9 }),
      } });
    const o = b.hnd.order;
    // lo schienale: due montanti e tre fasce, con la stella dipinta sulla fascia alta
    const bp = cut([
      [-3.0, 0, 0.75, 3.4], [2.25, 0, 0.75, 3.4],
      [-3.0, 2.5, 6.0, 0.9], [-3.0, 1.45, 6.0, 0.42], [-3.0, 0.2, 6.0, 0.45],
    ], 6.4, 3.4, 'schienale');
    standing(b.deck, bp, (P) => {
      paintWood(C.wood, { planks: 6, axis: 'v', nails: true, knots: 1 })(P);
      const { box, U } = P;
      P.layer((g) => { g.fillStyle = C.star; D.poly(g, starPts(box.x0 + box.w * 0.5, box.y0 + box.h * 0.84, U * 0.12)); }, C.star, { lip: 0.9, depth: 0.7, shade: 0.5 });
      P.draw((g) => { g.fillStyle = rgba(shade(C.wood, -0.45), 0.6); for (const x of [0.06, 0.94]) for (const y of [0.1, 0.9]) { g.beginPath(); g.arc(box.x0 + box.w * x, box.y0 + box.h * y, U * 0.02, 0, 7); g.fill(); } });
    }, { x: 0, z: -d + 0.55, height: 3.4, order: o + 0.3, seed: 705 });
  }

  // ===============================================================================================================
  // 4. IL CASSETTONE — centro (27, -4), 13 x 8, piano 5.6: tre cassetti stampati, piano con il runner
  // ===============================================================================================================
  {
    const cx = 27, cz = -4, w = 13, d = 8, h = 5.6;
    const facePts = cut([
      [-w / 2, 1.45, w, h - 1.45],                        // il corpo
      [-w / 2 + 0.15, 0, 1.3, 1.8],                       // tre piedi, i vuoti fino a terra
      [-0.65, 0, 1.3, 1.8],
      [w / 2 - 1.45, 0, 1.3, 1.8],
    ], w, h, 'cassettone');
    build({ name: 'cassettone', cx, cz, w, d, h, seed: 801, facePts,
      paints: {
        face: (P) => {
          paintWood(C.wood, { planks: 7, axis: 'v', nails: true, knots: 2 })(P);
          const { box, U } = P;
          // tre cassetti: ognuno il suo strato incollato, con la fuga scura e la maniglia d'ottone
          const y0 = box.y0 + box.h * 0.255, y1 = box.y1 - box.h * 0.03, nh = (y1 - y0) / 3;
          for (let i = 0; i < 3; i++) {
            const a = y0 + i * nh, bh = nh - U * 0.045;
            P.layer(rectPts(box.x0 + box.w * 0.045, a, box.w * 0.91, bh), shade(C.woodLight, -0.02 - i * 0.03), { rim: 0.8, lip: 0.85, depth: 0.85, shade: 0.5 });
            // venature delle assi del cassetto
            P.draw((g) => {
              g.strokeStyle = rgba(shade(C.wood, -0.3), 0.32); g.lineWidth = U * 0.009;
              for (let k = 0; k < 3; k++) { const y = a + bh * (0.2 + 0.3 * k); g.beginPath(); g.moveTo(box.x0 + box.w * 0.08, y); g.bezierCurveTo(box.x0 + box.w * 0.3, y + U * 0.03, box.x0 + box.w * 0.6, y - U * 0.03, box.x0 + box.w * 0.92, y); g.stroke(); }
              g.fillStyle = rgba(shade(C.wood, -0.5), 0.45); g.fillRect(box.x0 + box.w * 0.045, a - U * 0.03, box.w * 0.91, U * 0.035);
            });
            P.layer(rectPts(box.x0 + box.w * 0.42, a + bh * 0.44, box.w * 0.16, U * 0.11), C.rugGold, { lip: 0.95, depth: 0.8, shade: 0.6 });
            P.draw((g) => { g.fillStyle = rgba('#5e3a20', 0.5); g.beginPath(); g.ellipse(box.x0 + box.w * 0.5, a + bh * 0.64, box.w * 0.035, U * 0.02, 0, 0, 7); g.fill(); });
          }
        },
        deck: (P) => { paintWood(C.woodLight, { planks: 6, axis: 'h', nails: true, knots: 1 })(P); runner(P); },
        support: paintWood(C.woodDark, { planks: 4, axis: 'v', nails: true, knots: 1 }),
      } });
  }

  // ===============================================================================================================
  // 5. IL BAULE DEI GIOCATTOLI — centro (20, 6), 9 x 6, piano 2.7: assi verticali, cerniere, chiusura
  // ===============================================================================================================
  {
    const cx = 20, cz = 6, w = 9, d = 6, h = 2.7;
    const parts = [[-w / 2, 0, w, 0.4], [-w / 2, h - 0.5, w, 0.5]];
    const npl = 6;
    for (let i = 0; i < npl; i++) { const bw = w / npl - 0.16; parts.push([-w / 2 + i * (w / npl) + 0.08, 0, bw, h]); }
    const facePts = cut(parts, w, h, 'baule');
    const paintChestFace = (P) => {
      paintWood(C.wood, { planks: 6, axis: 'v', nails: true, knots: 2 })(P);
      const { box, U } = P;
      // le fasce di ferro con i rivetti
      for (const t of [0.2, 0.8]) {
        const x0 = box.x0 + box.w * t - U * 0.055;
        P.layer(rectPts(x0, box.y0, U * 0.11, box.h), '#7d7568', { lip: 0.7, depth: 0.8, shade: 0.7 });
        P.draw((g) => {
          g.fillStyle = rgba('#3c352c', 0.8);
          for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x0 + U * 0.055, box.y0 + box.h * (0.12 + 0.25 * i), U * 0.016, 0, 7); g.fill(); }
          g.fillStyle = rgba('#cfc6b4', 0.55);
          for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x0 + U * 0.04, box.y0 + box.h * (0.125 + 0.25 * i), U * 0.007, 0, 7); g.fill(); }
        });
      }
      // la chiusura in mezzo + la stella dipinta di crema
      P.layer(rectPts(box.x0 + box.w * 0.47, box.y1 - box.h * 0.62, box.w * 0.06, box.h * 0.2), C.rugGold, { lip: 0.9, depth: 0.8, shade: 0.6 });
      P.layer((g) => { g.fillStyle = mix(C.cream, C.star, 0.4); D.poly(g, starPts(box.x0 + box.w * 0.5, box.y0 + box.h * 0.42, box.w * 0.1)); }, C.star, { lip: 0.9, depth: 0.8, shade: 0.5 });
    };
    const b = build({ name: 'baule', cx, cz, w, d, h, seed: 901, facePts,
      paints: {
        face: paintChestFace,
        deck: (P) => {
          paintWood(C.wood, { planks: 7, axis: 'h', nails: true, knots: 1 })(P);
          const { box, U } = P;
          // le cerniere vere e proprie: due piastre di ferro sul bordo di fondo del coperchio
          for (const fx of [0.24, 0.76]) {
            const hx = box.x0 + box.w * fx - U * 0.13;
            P.layer(rectPts(hx, box.y1 - box.h * 0.17, U * 0.26, box.h * 0.15), '#6f675c', { lip: 0.8, depth: 0.8, shade: 0.7 });
            P.draw((g) => {
              g.fillStyle = rgba('#cfc6b4', 0.6);
              for (const t of [0.3, 0.7]) { g.beginPath(); g.arc(hx + U * 0.26 * t, box.y1 - box.h * 0.095, U * 0.018, 0, 7); g.fill(); }
              g.fillStyle = rgba('#2e2a22', 0.85); g.fillRect(hx, box.y1 - box.h * 0.032, U * 0.26, U * 0.045);   // il perno sporgente
            });
          }
          // i rinforzi del coperchio stampati (due fasce larghe con i rivetti)
          for (const t of [0.22, 0.78]) {
            P.layer(rectPts(box.x0, box.y0 + box.h * t - U * 0.06, box.w, U * 0.12), '#7d7568', { lip: 0.75, depth: 0.8, shade: 0.7 });
            P.draw((g) => { g.fillStyle = rgba('#cfc6b4', 0.5); for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(box.x0 + box.w * (0.06 + 0.14 * i), box.y0 + box.h * t, U * 0.013, 0, 7); g.fill(); } });
          }
        },
        support: paintWood(C.woodDark, { planks: 3, axis: 'v', nails: true }),
      } });
    // due fasce di ferro in rilievo sul coperchio (carte appoggiate: leggono come spessore)
    for (const t of [0.22, 0.78]) {
      lying(b.deck, rectPts(-w / 2 + 0.1, -0.35, w - 0.2, 0.7), (P) => {
        const { box, U } = P;
        P.gradient(shade('#7d7568', 0.14), shade('#6a635a', -0.12), 0.4); P.felt(0.6);
        P.draw((g) => {
          g.fillStyle = rgba('#cfc6b4', 0.55);
          for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(box.x0 + box.w * (0.05 + 0.128 * i), box.y0 + box.h * 0.5, U * 0.03, 0, 7); g.fill(); }
          g.fillStyle = rgba('#3c352c', 0.6);
          for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(box.x0 + box.w * (0.05 + 0.128 * i), box.y0 + box.h * 0.45, U * 0.022, 0, 7); g.fill(); }
        });
      }, { x: 0, z: -(d * t), y: 0.13, thickness: 0.09, seed: 910 + Math.round(t * 100) });
    }
    // la chiusura sopra il coperchio
    lying(b.deck, rectPts(-0.7, -0.55, 1.4, 1.1), (P) => {
      const { box, U } = P;
      P.gradient(shade(C.rugGold, 0.16), shade(C.rugGold, -0.16), 0.4); P.felt(0.6);
      P.draw((g) => { g.fillStyle = rgba('#5e3a20', 0.55); g.fillRect(box.x0 + box.w * 0.42, box.y0 + box.h * 0.2, box.w * 0.16, box.h * 0.6); });
    }, { x: 0.2, z: -0.62, y: 0.2, thickness: 0.1, seed: 918 });     // la linguetta della chiusura, sul bordo davanti
  }

  // ===============================================================================================================
  // 6. LA LIBRERIA A MENSOLE SFALSATE — tre piani camminabili, ognuno un platform con i pannelli laterali a libri
  // ===============================================================================================================
  const shelfPaint = (seed) => (P) => {
    const { box, U } = P;
    P.gradient(shade(C.woodDark, 0.1), shade(C.woodDark, -0.14), 0.3); P.felt(0.7);
    // i pannelli laterali: pile di libri (due dorsi per fila, alti), con l'asse chiara fra una fila e l'altra
    const pw = 1.6, spines = [C.red, C.blue, C.yellow, C.green, C.purple, C.rug, C.rugBlue];
    const r = P2.rng(seed), rows = [];
    let y = box.y0 + 0.16;
    while (y + 0.7 < box.y1 - 1.35) { rows.push(y); y += 0.84; }
    P.layer((g) => {
      for (const sgn of [-1, 1]) {
        const x0 = sgn < 0 ? box.x0 + 0.06 : box.x1 - pw - 0.06, ww = (pw - 0.12) / 2;
        for (const yy of rows) for (let k = 0; k < 2; k++) {
          g.fillStyle = spines[Math.floor(r() * spines.length)];
          g.fillRect(x0 + k * ww + 0.015, yy, ww - 0.03, 0.6);
        }
      }
    }, C.red, { lip: 0.8, depth: 0.6, shade: 0.55 });
    // le file d'oro sui dorsi e l'asse chiara fra le file (stampate)
    P.draw((g) => {
      for (const sgn of [-1, 1]) {
        const x0 = sgn < 0 ? box.x0 + 0.06 : box.x1 - pw - 0.06, ww = (pw - 0.12) / 2;
        for (const yy of rows) {
          g.fillStyle = rgba(C.rugGold, 0.55);
          for (let k = 0; k < 2; k++) { g.fillRect(x0 + k * ww + 0.02, yy + 0.12, ww - 0.04, U * 0.028); g.fillRect(x0 + k * ww + 0.02, yy + 0.46, ww - 0.04, U * 0.022); }
          g.fillStyle = rgba(shade(C.woodInk, -0.2), 0.75);
          g.fillRect(x0 - 0.06, yy + 0.6, pw, 0.24);
          g.fillStyle = rgba(mix(C.cream, C.page, 0.2), 0.22);
          g.fillRect(x0 - 0.06, yy + 0.6, pw, U * 0.03);
        }
      }
    });
    // il ripiano del piano: un'asse chiara con il bordo e i chiodi
    P.layer((g) => g.fillRect(box.x0 - 1, box.y1 - box.h * 0.16, box.w + 2, box.h * 0.16 + 1), C.woodLight, { lip: 0.9, depth: 0.85, shade: 0.5 });
    P.draw((g) => {
      g.fillStyle = rgba(shade(C.wood, -0.45), 0.55);
      for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(box.x0 + box.w * (0.1 + 0.2 * i), box.y1 - box.h * 0.08, U * 0.018, 0, 7); g.fill(); }
    });
  };
  const shelfDeck = (P) => {
    paintWood(C.woodLight, { planks: 6, axis: 'h', nails: true, knots: 1, tone: 0.85 })(P);
    const { box, U } = P;
    P.layer((g) => g.fillRect(box.x0 - 1, box.y0 - 1, box.w + 2, box.h * 0.09 + 1), shade(C.woodLight, 0.12), { lip: 0.9, depth: 0.8 });
    P.draw((g) => { g.fillStyle = rgba(shade(C.wood, -0.4), 0.4); g.fillRect(box.x0, box.y0 + box.h * 0.09, box.w, U * 0.02); });
  };

  const shelves = [
    { name: 'mensolaA', cx: -38, cz: 6, w: 12, d: 6, h: 3.4, seed: 401, books: 4, extras: 'etch' },
    { name: 'mensolaB', cx: -38, cz: -0.6, w: 12, d: 6, h: 6.6, seed: 411, books: 5, extras: 'box' },
    { name: 'mensolaC', cx: -33, cz: -7.2, w: 11, d: 6, h: 9.8, seed: 421, books: 4, extras: null },
  ];

  /** Un libro in piedi: ogni parte il suo strato (dorso, piatti, ornamenti). */
  function bookSpine(hh, ww, cover, accent) {
    return P2.drawnPiece((g, ink) => {
      g.fillStyle = ink(cover); D.rect(g, -ww / 2, 0, ww, hh, 0.07);
      g.fillStyle = ink(shade(cover, -0.22)); D.rect(g, -ww / 2, 0, ww * 0.22, hh, 0.05);
      g.fillStyle = ink(accent); D.rect(g, -ww * 0.2, hh * 0.14, ww * 0.62, hh * 0.075, 0.02);
      D.rect(g, -ww * 0.2, hh * 0.76, ww * 0.62, hh * 0.06, 0.02);
      g.fillStyle = ink(mix(accent, C.cream, 0.3), 'print'); D.ell(g, ww * 0.1, hh * 0.47, ww * 0.16, hh * 0.05);
      g.fillStyle = ink('#3a2412', 'print'); D.rect(g, -ww / 2 + ww * 0.04, 0, ww * 0.02, hh * 0.2);
    }, { w: ww + 0.4, h: hh + 0.3, name: 'libro' });
  }

  for (const sh of shelves) {
    const { cx, cz, w, d, h } = sh;
    const facePts = cut([
      [-w / 2, h - 1.15, w, 1.15],                        // l'asse del piano
      [-w / 2, 0, 1.6, h],                                // pannello laterale sinistro
      [w / 2 - 1.6, 0, 1.6, h],                           // destro
    ], w, h, sh.name);
    const b = build({ name: sh.name, cx, cz, w, d, h, seed: sh.seed, facePts,
      paints: { face: shelfPaint(sh.seed), deck: shelfDeck, support: paintWood(C.woodDark, { planks: 4, axis: 'v', nails: true, knots: 1 }) } });
    const o = b.hnd.order;

    // i libri in piedi, appoggiati al fondo del piano
    const spines = [C.red, C.blue, C.yellow, C.green, C.purple, C.rug, C.rugBlue];
    let bx = -w / 2 + 2.6;
    for (let i = 0; i < sh.books; i++) {
      const hh = 2.1 + (i % 3) * 0.22 + (i === 2 ? 0.1 : 0), ww = 0.5 + (i % 2) * 0.14;
      const [pts, paint] = bookSpine(hh, ww, spines[(i + sh.seed) % spines.length], C.cream);
      standing(b.deck, pts, paint, { x: bx, z: -d + 0.7, yaw: (i % 2 ? 0.06 : -0.05), height: hh, order: o + 0.4 + i * 0.02, seed: sh.seed + 10 + i });
      bx += ww + 0.16;
    }
    if (sh.extras === 'box') {
      // una scatola di cartone: il coperchio appoggiato + la faccia davanti
      const bw = 3.4, bd = 2.6, bh = 1.9;
      lying(b.deck, rectPts(-bw / 2, -bd / 2, bw, bd), (P) => {
        const { box, U } = P;
        P.gradient(shade(C.kraft, 0.12), shade(C.kraft, -0.1), 0.5); P.felt(0.7);
        P.draw((g) => {
          g.fillStyle = rgba(shade(C.kraft, -0.3), 0.55);
          g.fillRect(box.x0 + box.w * 0.46, box.y0, box.w * 0.03, box.h);
          g.fillStyle = rgba('#d9c8a4', 0.75); g.fillRect(box.x0 + box.w * 0.2, box.y0 + box.h * 0.42, box.w * 0.6, box.h * 0.14);
          g.strokeStyle = rgba(shade(C.kraft, -0.35), 0.5); g.lineWidth = U * 0.012;
          for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(box.x0 + box.w * i / 4, box.y0 + box.h * 0.08); g.lineTo(box.x0 + box.w * i / 4, box.y0 + box.h * 0.92); g.stroke(); }
        });
      }, { x: 2.4, z: -d + 1.6, yaw: 0.12, y: 0.1, thickness: 0.16, seed: sh.seed + 30 });
      standing(b.deck, rrect(-bw / 2, 0, bw, bh, 0.1), (P) => {
        const { box, U } = P;
        P.gradient(shade(C.kraft, 0.1), shade(C.kraft, -0.12), 0.5); P.felt(0.7);
        P.draw((g) => {
          g.fillStyle = rgba('#d9c8a4', 0.8); g.fillRect(box.x0 + box.w * 0.12, box.y1 - box.h * 0.42, box.w * 0.76, box.h * 0.12);
          g.fillStyle = rgba(shade(C.kraft, -0.4), 0.4); g.fillRect(box.x0, box.y0 + box.h * 0.16, box.w, U * 0.02);
        });
        P.innerShade(shade(C.kraft, -0.5), { alpha: 0.28, blurPx: 8 });
      }, { x: 2.4, z: -d + 1.6 + bd / 2 - 0.06, height: bh, order: o + 0.9, seed: sh.seed + 31 });
    }
    if (sh.extras === 'etch') {
      // un Etch-a-Sketch appoggiato
      const etch = P2.drawnPiece((g, ink) => {
        g.fillStyle = ink(C.red); D.rect(g, -1.5, 0, 3.0, 2.2, 0.26);
        g.fillStyle = ink('#b9c2bd'); D.rect(g, -1.24, 0.3, 2.48, 1.6, 0.08);
        g.fillStyle = ink(shade(C.red, -0.3)); D.rect(g, -1.5, 1.72, 3.0, 0.48, 0.2);
        g.fillStyle = ink('#d8cfbb'); D.ell(g, -1.16, 0.34, 0.24, 0.2); D.ell(g, 1.16, 0.34, 0.24, 0.2);
        g.fillStyle = ink('#8d9a94', 'print'); D.rect(g, -0.9, 0.7, 0.3, 0.06, 0.02);
        g.fillStyle = ink(C.cream, 'print'); D.rect(g, -0.5, 1.86, 1.0, 0.16, 0.03);
      }, { w: 3.4, h: 2.5, name: 'etch' });
      standing(b.deck, etch[0], etch[1], { x: -2.6, z: -d + 1.5, yaw: 0.2, height: 2.2, order: o + 1.0, seed: sh.seed + 40 });
    }
  }
}
