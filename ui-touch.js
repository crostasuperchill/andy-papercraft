// ui-touch.js — controlli per il telefono: levetta a sinistra, bottone di salto a destra.
// Non reinventa il movimento: traduce il dito in tasti veri (KeyW/A/S/D e Space), così il camera-follow e le molle
// del salto restano quelli del gioco. Si installa solo su dispositivi a puntatore grosso (iPhone/iPad/Android).
export function installTouchControls(H) {
  const coarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  if (!coarse) return false;

  document.body.classList.add('touch');
  const css = document.createElement('style');
  css.textContent = `
    body.touch { touch-action: none; overscroll-behavior: none; -webkit-user-select: none; user-select: none; }
    body.touch #hint { display: none; }
    #stick, #jump { position: fixed; z-index: 8; touch-action: none; -webkit-tap-highlight-color: transparent; }
    #stick {
      left: max(18px, env(safe-area-inset-left)); bottom: max(22px, env(safe-area-inset-bottom));
      width: 132px; height: 132px; border-radius: 50%;
      background: radial-gradient(circle at 38% 32%, rgba(247,236,214,.34), rgba(58,36,18,.20) 70%);
      border: 2px solid rgba(247,236,214,.55); box-shadow: 0 6px 18px rgba(30,16,6,.35), inset 0 0 18px rgba(30,16,6,.25);
      backdrop-filter: blur(3px);
    }
    #stick .knob {
      position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 50%;
      background: radial-gradient(circle at 36% 30%, #fdf3dc, #e3cfa6 65%, #c8ae82);
      border: 2px solid rgba(90,52,20,.55); box-shadow: 0 4px 10px rgba(30,16,6,.45);
      transition: transform .06s linear;
    }
    #stick .ring { position:absolute; left:50%; top:50%; width: 68px; height: 68px; margin:-34px 0 0 -34px; border-radius:50%;
      border: 1px dashed rgba(247,236,214,.45); }
    #jump {
      right: max(20px, env(safe-area-inset-right)); bottom: max(30px, env(safe-area-inset-bottom));
      width: 104px; height: 104px; border-radius: 50%; display: grid; place-items: center;
      font: 700 13px/1 ui-sans-serif, -apple-system, sans-serif; letter-spacing: .09em; color: #fdf1d6;
      background: radial-gradient(circle at 40% 32%, #d2694a, #aa4232 70%, #8c3326);
      border: 2px solid rgba(247,236,214,.6); box-shadow: 0 8px 20px rgba(30,16,6,.45), inset 0 -4px 10px rgba(0,0,0,.25);
    }
    #jump.press { transform: translateY(2px) scale(.97); filter: brightness(1.12); }
  `;
  document.head.appendChild(css);

  const stick = document.createElement('div'); stick.id = 'stick';
  stick.innerHTML = '<div class="ring"></div><div class="knob"></div>';
  const jump = document.createElement('div'); jump.id = 'jump'; jump.textContent = 'SALTA';
  document.body.append(stick, jump);
  const knob = stick.querySelector('.knob');

  // --- tasti sintetici: stessa strada del gioco vero ---
  const held = new Set();
  const key = (code, on) => {
    if (on === held.has(code)) return;
    on ? held.add(code) : held.delete(code);
    window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
  };
  const releaseAll = () => { for (const c of [...held]) key(c, false); knob.style.transform = 'translate(0,0)'; };

  // --- levetta: 8 direzioni con isteresi, così non balla sul bordo ---
  const R = 46;
  let id = null, cx = 0, cy = 0;
  const axes = { KeyW: false, KeyS: false, KeyA: false, KeyD: false };
  const apply = (vx, vy) => {
    const set = (code, v, on, off) => { if (v > on) axes[code] = true; else if (v < off) axes[code] = false; key(code, axes[code]); };
    set('KeyA', -vx, 0.34, 0.22); set('KeyD', vx, 0.34, 0.22);
    set('KeyW', -vy, 0.34, 0.22); set('KeyS', vy, 0.34, 0.22);
  };
  const move = (e) => {
    if (id === null || e.pointerId !== id) return;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    apply(dx / R, dy / R);
  };
  stick.addEventListener('pointerdown', (e) => {
    id = e.pointerId; const r = stick.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    stick.setPointerCapture(e.pointerId); move(e); e.preventDefault();
  });
  stick.addEventListener('pointermove', move);
  const end = (e) => { if (e.pointerId !== id) return; id = null; releaseAll(); };
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);
  stick.addEventListener('pointerleave', end);

  // --- salto ---
  const tap = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true })), 90);
  };
  jump.addEventListener('pointerdown', (e) => { jump.classList.add('press'); tap(); e.preventDefault(); });
  jump.addEventListener('pointerup', () => jump.classList.remove('press'));
  jump.addEventListener('pointercancel', () => jump.classList.remove('press'));

  // due dita sul canvas: la camera si inclina come col trascinamento del mouse (l'harness legge pointermove)
  document.addEventListener('touchmove', (e) => { if (e.target === H.renderer.domElement) e.preventDefault(); }, { passive: false });
  return true;
}
