// pieces/palette.js — la tavolozza di QUESTA stanza (non della countryside: hex derivati dal brief)
// Stanza di Andy, giorno, luce calda dalla finestra: pavimento in legno, carta da parati azzurra a nuvole,
// giocattoli nei colori primari dei primi anni '90. Ogni pezzo porta 3-5 inchiostri e un accento che contrasta.
import { shade, mix, rgba } from 'papercraft/lib/paperkit-2d.js';

export const C = {
  // ---- ground: il pavimento di assi, stampato sulla pagina (autore: più chiaro e meno saturo dei mobili) ----
  page: '#f4ead6',
  floor: '#bb9c74', floorB: '#ae8d64', floorGap: '#7c5c38', floorLight: '#c9ad86',
  rug: '#b8564a', rugB: '#9e453c', rugCream: '#e6d6b2', rugBlue: '#4c779c', rugGold: '#cf9c3e',
  // ---- walls: carta da parati a nuvole, la stanza di Andy ----
  wall: '#93b2c4', wallDeep: '#7d9cb1', cloud: '#f2e6cc', wallTrim: '#d9c8a4',
  // ---- wood: mobili ----
  wood: '#a26a38', woodDark: '#77451f', woodLight: '#c08a52', woodInk: '#4d2c14',
  // ---- bed ----
  sheet: '#e8d8b8', blanket: '#5d8cb8', blanketB: '#4a76a0', pillow: '#f0e3c6', star: '#f0d9a0',
  // ---- toys / accents ----
  red: '#c8483d', redDark: '#a03a32', yellow: '#e3b23f', yellowLight: '#f0cd6f', blue: '#4a7fa8',
  green: '#6f9160', greenDark: '#4f6f46', cream: '#f0e5cb', kraft: '#cdb188',
  // astronauta
  white: '#e8e2d2', whiteB: '#d6cebb', purple: '#7d6b9e', lime: '#8fae5c',
  // cowboy (l'eroe)
  skin: '#f2cf9e', skinB: '#dfb684', hair: '#7d4a20', shirt: '#eec333', check: '#bf4433',
  denim: '#4a6f9c', denimB: '#3c5a80', boot: '#7a4520', bootB: '#563014', vest: '#eddfb4',
  spot: '#6b4224', hat: '#a86936', hatBand: '#5f3a1c', bandana: '#bf4530',
  // dinosaur / potato / pig / slinky
  dino: '#7fa25c', dinoB: '#5f8048', dinoBelly: '#e0d6a8',
  potato: '#b98a5a', potatoB: '#9c7048', potatoEye: '#f4ece0',
  pig: '#e8a9a0', pigB: '#cf8b83', pigRing: '#d9a94e',
  metal: '#b6b2a4', metalB: '#918d80', slinky: '#9aa3ab',
  // ---- ink / light ----
  ink: '#3a2412', inkSoft: '#5a3a20',
  key: '#ffdcb2', fill: '#f2dcc2', leak: '#a0602c', haze: '#d8bf8e',
};

/** assistant: a soft two-tone base over the whole card, the paper-collage starting point of every print. */
export const base = (P, c, lit = 0.1, dark = 0.12, angle = 0.5) =>
  P.gradient(shade(c, lit), shade(c, -dark), angle);

/** A flat painter for a cloth/paper surface: two tones + felt + a soft inner shade. */
export const plain = (c) => (P) => {
  base(P, c, 0.08, 0.1, 0.6);
  P.felt(0.7);
  P.innerShade(shade(c, -0.5), { alpha: 0.24, blurPx: 9 });
};

export const arc = (cx, cy, rx, ry, a0, a1, n = 10) =>
  Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(a0 + (a1 - a0) * i / n) * rx, cy + Math.sin(a0 + (a1 - a0) * i / n) * ry]);

export const rrect = (x, y, w, h, k) => (k <= 0 ? [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] : [
  ...arc(x + w - k, y + k, k, k, -Math.PI / 2, 0, 5),
  ...arc(x + w - k, y + h - k, k, k, 0, Math.PI / 2, 5),
  ...arc(x + k, y + h - k, k, k, Math.PI / 2, Math.PI, 5),
  ...arc(x + k, y + k, k, k, Math.PI, 1.5 * Math.PI, 5),
]);

export { shade, mix, rgba };
