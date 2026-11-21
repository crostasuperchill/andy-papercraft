// pieces/room.js — il muro di fondo della stanza di Andy: carta da parati a nuvole, finestra con le tende,
// porta con la targhetta, disegni attaccati con lo scotch. Carte in piedi viste di fronte: niente da calpestare.
import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { C, arc, rrect, base, shade, mix, rgba } from './palette.js';

const D = P2.draw2;

// ---- una nuvola di carta: lobi con la base piatta, bordo di taglio e ombra corta sullo strato sotto ----
function cloud(P, cx, cy, w, h, r) {
  const pts = [];
  const lobes = 4 + Math.floor(r() * 3);
  for (let i = 0; i <= lobes; i++) {
    const t = i / lobes, x = cx - w / 2 + t * w;
    pts.push([x, cy + h * (0.35 + 0.65 * Math.sin(t * Math.PI)) * (i === 0 || i === lobes ? 0.55 : 1)]);
  }
  pts.push([cx + w / 2, cy], [cx - w / 2, cy]);
  P.layer(pts, mix(C.cloud, C.wall, 0.06), { lip: 0.8, shadow: 0.7, shade: 0.5, depth: 0.9 });
  P.draw((g) => {
    g.fillStyle = rgba('#fffaf0', 0.5);
    D.ell(g, cx - w * 0.16, cy + h * 0.34, w * 0.16, h * 0.16, 0.2);
    D.ell(g, cx + w * 0.14, cy + h * 0.42, w * 0.11, h * 0.12, -0.2);
  });
}

// ---- carta da parati: azzurro con nuvole grandi, leggibili a distanza, su una base a due toni ----
function wallpaper(seedI) {
  return (P) => {
    const r = P2.rng(700 + seedI);
    base(P, C.wall, 0.09, 0.1, 0.4);
    P.marks('dab', { color: C.wallDeep, alpha: 0.16, size: 0.09, density: 0.5 });
    P.felt(0.7);
    const { x0, y0, w } = P.box;
    // nuvole in file sfalsate, sempre grandi: poche e contate
    const rows = 2;
    for (let j = 0; j < rows; j++) {
      const y = y0 + P.box.h * (0.2 + j * 0.4);
      for (let x = x0 + (j % 2) * w * 0.16; x < x0 + w; x += w * 0.34)
        cloud(P, x + (r() - 0.5) * w * 0.03, y + (r() - 0.5) * P.box.h * 0.03, w * (0.2 + r() * 0.07), P.box.h * (0.1 + r() * 0.04), r);
    }
    // battiscopa: una fascia di legno con un filo chiaro sopra
    P.layer([[x0, y0], [x0 + w, y0], [x0 + w, y0 + P.box.h * 0.055], [x0, y0 + P.box.h * 0.055]], C.wood,
      { lip: 0.9, shadow: 0.9, depth: 1.1 });
    P.draw((g) => {
      g.fillStyle = rgba(C.page, 0.4); g.fillRect(x0, y0 + P.box.h * 0.052, w, P.box.h * 0.006);
      g.fillStyle = rgba(shade(C.wood, -0.35), 0.5); g.fillRect(x0, y0 + P.box.h * 0.03, w, P.box.h * 0.004);
    });
    P.innerShade(shade(C.wall, -0.55), { alpha: 0.18, blurPx: 9 });
  };
}

export function buildRoom(H) {
  const Z = -29.2;                                  // il muro, un filo davanti al bordo del foglio
  // ---- pannelli: due pieni, uno con la finestra, uno con la porta (tutto stampato, niente buchi) ----
  const panels = [[-46, 22, 0], [-24, 20, 1], [-4, 22, 2], [18, 12, 3], [30, 16, 4]];
  panels.forEach(([x0, w, i]) => {
    H.popup([[-w / 2, 0], [w / 2, 0], [w / 2, 13.5], [-w / 2, 13.5]], wallpaper(i), { x: x0 + w / 2, z: Z, height: 13.5, edge: 0.05 });
  });

  // ---- FINESTRA: vetro chiaro che brilla (P.glow → bloom), telaio di carta, davanzale, tende ----
  const WX = -14, WW = 13, WH = 7.6;
  const glass = (P) => {
    const { x0, y0, w, h } = P.box;
    P.gradient('#eaf3f0', '#a9c8d4', 0.15);
    // fuori: due colline di carta e una nuvola, viste attraverso il vetro
    P.layer((g) => { g.fillStyle = '#b9d3a8'; g.beginPath(); g.moveTo(x0, y0 + h * 0.5); g.quadraticCurveTo(x0 + w * 0.3, y0 + h * 0.34, x0 + w * 0.55, y0 + h * 0.46); g.quadraticCurveTo(x0 + w * 0.8, y0 + h * 0.3, x0 + w, y0 + h * 0.44); g.lineTo(x0 + w, y0); g.lineTo(x0, y0); g.closePath(); g.fill(); }, '#b9d3a8', { lip: 0.7, shadow: 0.5 });
    P.layer((g) => { g.fillStyle = '#8fae76'; g.beginPath(); g.moveTo(x0, y0 + h * 0.22); g.quadraticCurveTo(x0 + w * 0.4, y0 + h * 0.12, x0 + w, y0 + h * 0.2); g.lineTo(x0 + w, y0); g.lineTo(x0, y0); g.closePath(); g.fill(); }, '#8fae76', { lip: 0.7, shadow: 0.5 });
    P.layer((g) => { g.fillStyle = '#f6f1e2'; D.ell(g, x0 + w * 0.66, y0 + h * 0.74, w * 0.1, h * 0.07); D.ell(g, x0 + w * 0.76, y0 + h * 0.77, w * 0.07, h * 0.06); }, '#f6f1e2', { lip: 0.8, shadow: 0.6 });
    // croce del telaio
    P.layer(rrect(x0 + w * 0.48, y0, w * 0.04, h, w * 0.02), C.page, { lip: 0.9, shadow: 0.9, depth: 1.2 });
    P.layer(rrect(x0, y0 + h * 0.52, w, h * 0.035, w * 0.02), C.page, { lip: 0.9, shadow: 0.9, depth: 1.2 });
    P.glow((g) => g.fillRect(x0, y0, w, h));            // il vetro è la fonte di luce: alone bloom
    P.innerShade('#5b7a86', { alpha: 0.3, blurPx: 10 });
  };
  const win = H.popup([[-WW / 2, 0], [WW / 2, 0], [WW / 2, WH], [-WW / 2, WH]], glass, { x: WX, z: Z + 0.12, height: WH });
  H.glowing(win.group);
  const framePaint = (P) => {
    base(P, C.page, 0.08, 0.1, 0.5); P.felt(0.6);
    P.layer(rrect(P.box.x0, P.box.y0, P.box.w, P.box.h * 0.7, 0.2), mix(C.page, C.woodLight, 0.2), { lip: 0.8, shadow: 0.7 });
    P.innerShade('#7a6042', { alpha: 0.25, blurPx: 7 });
  };
  H.popup([[-WW / 2 - 1.2, 0], [WW / 2 + 1.2, 0], [WW / 2 + 1.2, 0.85], [-WW / 2 - 1.2, 0.85]], framePaint, { x: WX, z: Z + 0.2, height: 1, order: 2 });   // davanzale
  // tende: due carte larghe con pieghe stampate ai lati della finestra
  const curtain = () => (P) => {
    const { x0, y0, w, h } = P.box;
    base(P, C.page, 0.1, 0.08, 0.4);
    P.felt(0.7);
    for (let i = 0; i < 4; i++)
      P.layer((g) => { const fx = x0 + (i + 0.5) * w / 4; g.beginPath(); g.moveTo(fx - w / 10, y0); g.quadraticCurveTo(fx + w * 0.06, y0 + h * 0.6, fx - w / 12, y0 + h); g.lineTo(fx + w / 12, y0 + h); g.quadraticCurveTo(fx + w * 0.18, y0 + h * 0.6, fx + w / 7, y0); g.closePath(); g.fill(); }, mix(C.page, C.blanket, 0.22), { lip: 0.6, shadow: 0.9, depth: 1.2 });
    P.marks('dot', { color: mix(C.page, C.blanket, 0.5), alpha: 0.5, size: 0.05, density: 0.7 });
  };
  H.popup([[0, 0], [3.4, 0], [3.0, 11], [0.4, 11]], curtain(), { x: WX - WW / 2 - 2.4, z: Z + 0.55, height: 11, order: 3, sway: 0.15 });
  H.popup([[0, 0], [3.4, 0], [3.4, 11], [0, 11]], curtain(), { x: WX + WW / 2 - 1.4, z: Z + 0.55, height: 11, order: 3, sway: 0.15 });

  // ---- PORTA: riquadri incassati, maniglia, targhetta ----
  const door = (P) => {
    const { x0, y0, w, h } = P.box;
    base(P, mix(C.woodLight, C.wood, 0.3), 0.1, 0.12, 0.35);
    P.felt(0.7);
    for (const [u, v, ww, hh] of [[0.13, 0.52, 0.32, 0.36], [0.55, 0.52, 0.32, 0.36], [0.13, 0.1, 0.32, 0.33], [0.55, 0.1, 0.32, 0.33]])
      P.layer(rrect(x0 + w * u, y0 + h * v, w * ww, h * hh, 0.25), shade(C.wood, -0.16), { lip: 0.9, shadow: 0.9, depth: 1.4, shade: 0.8 });
    P.marks('hatch', { color: shade(C.wood, -0.35), alpha: 0.3, size: 0.05, angle: 0.35, density: 0.6 });
    P.layer((g) => { g.fillStyle = C.yellow; D.ell(g, x0 + w * 0.88, y0 + h * 0.5, w * 0.035, w * 0.035); }, C.yellow, { lip: 1, shadow: 1, depth: 1.6 });
    P.draw((g) => { g.fillStyle = '#8a7530'; D.ell(g, x0 + w * 0.885, y0 + h * 0.49, w * 0.014, w * 0.014); });
    P.innerShade('#3a2010', { alpha: 0.3, blurPx: 10 });
  };
  H.popup([[-4.4, 0], [4.4, 0], [4.4, 11.2], [-4.4, 11.2]], door, { x: 24, z: Z + 0.5, height: 11.2, order: 4 });
  H.spots.door = [24, Z + 0.5];
  H.popup([[-2.6, 0], [2.6, 0], [2.6, 1.7], [-2.6, 1.7]], (P) => {
    const { x0, y0, w, h } = P.box;
    base(P, C.page, 0.07, 0.08, 0.4); P.felt(0.6);
    P.layer(rrect(x0 + w * 0.06, y0 + h * 0.1, w * 0.88, h * 0.8, 0.3), C.red, { lip: 1, shadow: 1, depth: 1.5 });
    P.draw((g) => {
      g.fillStyle = '#f6ecd4'; g.font = `700 ${h * 0.5}px ui-sans-serif, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('ANDY', x0 + w / 2, y0 + h * 0.52);
    });
    P.innerShade('#3a2010', { alpha: 0.3, blurPx: 8 });
  }, { x: 24, z: Z + 0.58, yaw: 0.02, height: 1.7, order: 5 });

  // ---- DISEGNI DEL BAMBINO ATTACCATI AL MURO: matita colorata e scotch ai bordi ----
  const drawing = (kind) => (P) => {
    const { x0, y0, w, h } = P.box;
    P.fill('#f7efdb');
    P.felt(0.6);
    P.draw((g) => {
      g.lineCap = 'round'; g.lineJoin = 'round';
      if (kind === 'rocket') {
        g.strokeStyle = '#4a6a8e'; g.lineWidth = h * 0.045;
        g.beginPath(); g.moveTo(x0 + w * 0.5, y0 + h * 0.16); g.lineTo(x0 + w * 0.62, y0 + h * 0.5); g.lineTo(x0 + w * 0.62, y0 + h * 0.78); g.lineTo(x0 + w * 0.38, y0 + h * 0.78); g.lineTo(x0 + w * 0.38, y0 + h * 0.5); g.closePath(); g.stroke();
        g.fillStyle = '#c8452d'; g.beginPath(); g.arc(x0 + w * 0.5, y0 + h * 0.38, h * 0.08, 0, 7); g.fill();
        g.strokeStyle = '#c8452d'; g.lineWidth = h * 0.05;
        for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x0 + w * (0.5 + 0.12 * s), y0 + h * 0.7); g.lineTo(x0 + w * (0.5 + 0.2 * s), y0 + h * 0.86); g.stroke(); }
        g.strokeStyle = '#d9a94e'; g.lineWidth = h * 0.04;
        for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0 + w * (0.44 + 0.04 * i), y0 + h * 0.1); g.lineTo(x0 + w * (0.42 + 0.04 * i), y0 + h * 0.02); g.stroke(); }
      } else {
        g.strokeStyle = '#7d5a3c'; g.lineWidth = h * 0.04;
        g.beginPath(); g.ellipse(x0 + w * 0.5, y0 + h * 0.42, w * 0.2, h * 0.16, 0, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(x0 + w * 0.32, y0 + h * 0.42); g.lineTo(x0 + w * 0.3, y0 + h * 0.16); g.moveTo(x0 + w * 0.68, y0 + h * 0.42); g.lineTo(x0 + w * 0.72, y0 + h * 0.16); g.stroke();
        g.fillStyle = '#4a6a8e'; D.ell(g, x0 + w * 0.5, y0 + h * 0.66, w * 0.06, h * 0.09);
        g.fillStyle = '#e0b23f'; D.ell(g, x0 + w * 0.5, y0 + h * 0.78, w * 0.05, h * 0.05);
        g.strokeStyle = '#c8452d'; g.lineWidth = h * 0.03;
        g.beginPath(); g.moveTo(x0 + w * 0.16, y0 + h * 0.86); g.lineTo(x0 + w * 0.84, y0 + h * 0.86); g.stroke();
      }
    });
    P.draw((g) => { g.fillStyle = rgba('#efe2bd', 0.75); g.fillRect(x0 + w * 0.06, y0 + h * 0.88, w * 0.14, h * 0.12); g.fillRect(x0 + w * 0.8, y0 + h * 0.88, w * 0.14, h * 0.12); });
    P.innerShade('#7a6042', { alpha: 0.2, blurPx: 6 });
  };
  H.popup([[-3.2, 0], [3.2, 0], [3.2, 4.2], [-3.2, 4.2]], drawing('rocket'), { x: 4, z: Z + 0.06, height: 4.2, order: 6 });
  H.popup([[-2.6, 0], [2.6, 0], [2.6, 3.4], [-2.6, 3.4]], drawing('cowboy'), { x: 34, z: Z + 0.06, height: 3.4, order: 6 });
}
