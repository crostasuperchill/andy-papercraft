// tools/record.mjs — registra un clip deterministico della scena: guida l'eroe con tasti veri e avanza il simulatore
// di un frame alla volta (`__papercraft.step`), catturando ogni frame con Page.captureScreenshot, poi ffmpeg -> mp4.
// (Lo screencast di Chrome headless consegna pochissimi frame: qui il tempo è il nostro.)
// uso: node tools/record.mjs <url> <out.mp4> [--secs=14] [--fps=20] [--w=1600] [--h=900] [--port=9410]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0], out = args[1];
const opt = (k, d) => { const a = args.find((s) => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const FPS = +opt('fps', 20), W = +opt('w', 1600), H = +opt('h', 900), PORT = +opt('port', 9410);
const dir = '/tmp/andy-frames';
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/andy-rec-${PORT}`, '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); wsUrl = (await r.json()).webSocketDebuggerUrl; } catch { await sleep(150); } }
if (!wsUrl) throw new Error('CDP non raggiungibile');

const ws = new WebSocket(wsUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej });
  ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
});
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
});
await new Promise((r) => ws.addEventListener('open', r));
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
for (const [m, p] of [['Page.enable', {}], ['Runtime.enable', {}], ['Network.enable', {}], ['Network.setCacheDisabled', { cacheDisabled: true }],
  ['Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }]]) await send(m, p, sessionId);
await send('Page.navigate', { url }, sessionId);
await sleep(10000);

const evalIn = (expression) => send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
const js = (a) => {
  const [c, code, key] = a.split(':');
  if (c === 'j') return `window.__jump&&window.__jump()`;
  return `window.dispatchEvent(new KeyboardEvent('${c === 'k' ? 'keydown' : 'keyup'}',{code:'${code}',key:'${key || code}',bubbles:true}))`;
};
// quattro segmenti: ognuno parte da un posto già valido (niente teletrasporto in video) e mostra un salto vero
const SEGS = {
  a: { restart: true, dur: 4.4, script: [[0.7, 'k:W,w'], [2.4, 'u:W'], [2.6, 'k:A,a'], [3.6, 'u:A']] },
  b: { place: [-17, -6.2], dur: 4.6, script: [[0.3, 'k:W,w'], [0.34, 'j'], [2.2, 'u:W'], [2.4, 'k:A,a'], [3.6, 'u:A']] },
  c: { place: [11, -12.4], dur: 4.2, script: [[0.3, 'k:W,w'], [0.34, 'j'], [1.6, 'u:W'], [1.9, 'k:D,d'], [3.2, 'u:D']] },
  d: { place: [-38, 5.6], dur: 5.4, script: [[0.3, 'k:W,w'], [0.34, 'j'], [1.5, 'u:W'], [1.7, 'k:W,w'], [1.75, 'j'], [3.0, 'u:W']] },
};
const seg = SEGS[opt('seg', 'a')];
if (!seg) throw new Error('segmento sconosciuto');
if (seg.restart) await evalIn('__papercraft.restart()');
if (seg.place) await evalIn(`__papercraft.place(${seg.place[0]}, ${seg.place[1]})`);
const N = Math.round(seg.dur * FPS);
let si = 0;
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  while (si < seg.script.length && seg.script[si][0] <= t) { await evalIn(js(seg.script[si][1])); si++; }
  await evalIn(`__papercraft.step(${1 / FPS})`);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 }, sessionId);
  writeFileSync(`${dir}/f${String(f).padStart(5, '0')}.jpg`, Buffer.from(shot.data, 'base64'));
}
ws.close(); chrome.kill();
await sleep(300);
const ff = spawn('ffmpeg', ['-y', '-framerate', String(FPS), '-i', `${dir}/f%05d.jpg`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: 'ignore' });
await new Promise((r) => ff.on('exit', r));
console.log('scritto', out);
process.exit(0);
