// pieces/foreground.js — carte grandi appena fuori dal piano nitido, che entrano dal bordo basso dell'inquadratura.
// Non si calpestano: servono a vendere la scala (un modellino vero ha sempre qualcosa di enorme e sfocato davanti).
import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { C, base, shade, mix, rgba } from './palette.js';

const D = P2.draw2;

export function buildForeground(H) {
  // un pastello enorme, sdraiato: carta con l'etichetta e la punta di cera
  const crayon = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink('#c8483d'); D.rect(g, -2.8, 0, 5.6, 1.5, 0.4);
    g.fillStyle = ink(shade('#c8483d', -0.12)); D.rect(g, -2.8, 0, 5.6, 0.4, 0.2);
    g.fillStyle = ink('#8f3228'); D.poly(g, [[-2.8, 0.15], [-3.7, 0.75], [-2.8, 1.35]]);
    g.fillStyle = ink('#f0e2c0'); D.rect(g, 0.4, 0, 2.0, 1.5, 0.1);
    g.fillStyle = ink('#c8483d', 'print'); g.fillRect(0.55, 0.55, 1.7, 0.16); g.fillRect(0.55, 0.85, 1.7, 0.16);
    g.fillStyle = ink('#5a3a20', 'print'); g.fillRect(0.6, 0.22, 1.6, 0.06);
  }, { w: 8, h: 1.9, name: 'pastello', layer: { depth: 0.6 } });
  H.popup(crayon[0], crayon[1], { x: 25, z: 13.5, yaw: -0.5, scale: 2.3, height: 3 });

  // un calzino rovesciato: polsino a righe, tallone e punta
  const sock = P2.drawnPiece((g, ink) => {
    g.fillStyle = ink('#e8e0cc');
    D.rect(g, -1.9, 0.3, 1.1, 1.9, 0.3);
    D.ell(g, 0.2, 1.3, 1.6, 0.9);
    D.ell(g, 1.3, 0.55, 0.9, 0.55);
    g.fillStyle = ink('#c8483d'); D.rect(g, -1.92, 1.9, 1.14, 0.5, 0.2);
    g.fillStyle = ink('#f4ecd8', 'print'); D.ell(g, 1.35, 0.5, 0.55, 0.3);
    g.fillStyle = ink('#a8a08c', 'print'); for (let i = 0; i < 3; i++) g.fillRect(-1.6 + i * 0.35, 0.7, 0.06, 1.0);
  }, { w: 4.4, h: 3.2, name: 'calzino', layer: { depth: 0.6 } });
  H.popup(sock[0], sock[1], { x: -21, z: 12.6, yaw: 0.35, scale: 2.6, height: 4 });

  // un blocco alfabeto gigante coricato sul bordo: faccia con la lettera su carta incollata
  H.popup([[-1.5, 0], [1.5, 0], [1.5, 3], [-1.5, 3]], (P) => {
    const { x0, y0, w, h } = P.box;
    P.gradient(shade(C.red, 0.08), shade(C.red, -0.16), 0.5); P.felt(0.7);
    P.layer([[x0 + w * 0.06, y0 + h * 0.06], [x0 + w * 0.94, y0 + h * 0.06], [x0 + w * 0.94, y0 + h * 0.94], [x0 + w * 0.06, y0 + h * 0.94]],
      mix(C.cream, C.page, 0.2), { rim: 0.8, lip: 0.9, depth: 0.8, shade: 0.6 });
    P.draw((g) => {
      g.fillStyle = shade(C.red, -0.3); g.font = `700 ${h * 0.56}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('A', x0 + w / 2, y0 + h * 0.52);
    });
    P.innerShade('#3a2010', { alpha: 0.32, blurPx: 9 });
  }, { x: 34, z: 11.5, yaw: 0.55, scale: 2.1, height: 5 });
}

// ---------------------------------------------------------------------------------------------------------------
// riempimento della fascia nitida: piccoli giocattoli sparsi sul tappeto, ognuno una carta stampata
// (servono a non lasciare vuoto il centro del frame: il "barePct" dei controlli)
// ---------------------------------------------------------------------------------------------------------------
export function buildFillers(H) {
  const P2 = H.P2, D = P2.draw2, T = H.THREE;
  const piece = (draw, opts, place) => {
    const [pts, paint] = P2.drawnPiece(draw, { layer: { depth: 0.45 }, ...opts });
    return H.popup(pts, paint, { scale: 1, ...place });
  };

  // un dado: faccia con cinque pallini, spigolo scuro
  piece((g, ink) => {
    g.fillStyle = ink('#f2e7cd'); D.rect(g, -1, 0, 2, 2, 0.25);
    g.fillStyle = ink('#d8c9a8'); D.rect(g, -1, 1.55, 2, 0.45, 0.15);
    g.fillStyle = ink('#a8402f', 'print');
    for (const [x, y] of [[-0.42, 0.42], [0.42, 0.42], [0, 1], [-0.42, 1.58], [0.42, 1.58]]) D.ell(g, x, y, 0.17, 0.17);
  }, { w: 2.2, h: 2.2, name: 'dado' }, { x: -8.6, z: 3.6, yaw: 0.4, scale: 0.9 });

  // una carta da gioco sdraiata: carta bianca con il seme rosso stampato
  piece((g, ink) => {
    g.fillStyle = ink('#f6efdd'); D.rect(g, -0.9, 0, 1.8, 2.6, 0.18);
    g.fillStyle = ink('#b8443a', 'print');
    D.ell(g, 0, 1.75, 0.3, 0.3); D.poly(g, [[-0.28, 1.6], [0.28, 1.6], [0, 1.0]]);
    D.ell(g, 0, 0.55, 0.2, 0.2);
  }, { w: 2.0, h: 2.8, name: 'carta' }, { x: -12.4, z: 2.2, yaw: -0.3, scale: 0.85 });

  // tre jack: stelline di metallo stampato, sparse a ventaglio
  for (const [i, dx, dz, a] of [[0, -0.6, 0.2, 0.2], [1, 0.5, -0.4, -0.5], [2, 0.1, 0.9, 0.9]])
    piece((g, ink) => {
      g.fillStyle = ink(i === 1 ? '#c9a94e' : '#b8b4a6');
      g.beginPath(); g.moveTo(0, 1.2);
      for (let k = 1; k <= 6; k++) { const ang = -Math.PI / 2 + k * Math.PI / 3; g.lineTo(Math.cos(ang) * 0.55, 0.5 + Math.sin(ang) * 0.55); }
      D.rect(g, -0.1, 0, 0.2, 0.62);
      g.fillStyle = ink('#8a8478', 'print'); D.rect(g, -0.06, 0.05, 0.12, 0.5);
    }, { w: 1.5, h: 1.6, name: 'jack' }, { x: 2.6 + dx, z: 4.6 + dz, yaw: a, scale: 0.85 });

  // una biglia: disco di carta con la spirale dentro
  piece((g, ink) => {
    g.fillStyle = ink('#8fb2c4'); D.ell(g, 0, 0.9, 0.9, 0.9);
    g.fillStyle = ink('#e8eef0', 'print'); D.ell(g, 0.9, 0.9, 0.9, 0.9);
    g.fillStyle = ink('#c95a4a', 'print'); g.save(); g.beginPath(); g.ellipse(0, 0.9, 0.7, 0.45, 0.6, 0, 7); g.clip();
    g.fillRect(0, 0, 1.0, 2); g.restore();
    g.strokeStyle = ink('#3a5a6e', 'print'); g.lineWidth = 0.05; g.beginPath(); g.ellipse(0, 0.9, 0.86, 0.86, 0, 0, 7); g.stroke();
  }, { w: 2.0, h: 2.0, name: 'biglia' }, { x: -3.2, z: 6.2, yaw: 0.1, scale: 0.8 });

  // un domino in piedi, mezzi pallini rossi
  piece((g, ink) => {
    g.fillStyle = ink('#efe6cf'); D.rect(g, -0.7, 0, 1.4, 2.6, 0.2);
    g.fillStyle = ink('#8a7452'); D.rect(g, -0.7, 1.25, 1.4, 0.07);
    g.fillStyle = ink('#a8402f', 'print');
    D.ell(g, -0.28, 0.55, 0.14, 0.14); D.ell(g, 0.28, 0.9, 0.14, 0.14); D.ell(g, -0.28, 1.75, 0.14, 0.14); D.ell(g, 0.28, 2.1, 0.14, 0.14); D.ell(g, 0.28, 1.55, 0.1, 0.1);
  }, { w: 1.6, h: 2.8, name: 'domino' }, { x: -6.4, z: 7.4, yaw: 0.65, scale: 0.95 });
}
