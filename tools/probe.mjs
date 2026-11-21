// tools/probe.mjs — headless Chrome + CDP: apre una pagina, raccoglie console/eccezioni, esegue JS e salva uno screenshot.
// uso: node tools/probe.mjs <url> <out.png> [--wait=6000] [--eval="expr"]... [--w=1600] [--h=900] [--dpr=1]
// Serve a verificare la scena senza browser interattivo: gli errori di modulo arrivano qui, non in un rettangolo vuoto.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1] || 'shot.png';
const opt = (k, d) => { const a = args.find((s) => s.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const evals = args.filter((s) => s.startsWith('--eval=')).map((s) => s.slice(7));
const W = +opt('w', 1600), Hh = +opt('h', 900), DPR = +opt('dpr', 1), WAIT = +opt('wait', 6000), PORT = +opt('port', 9333);

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--hide-scrollbars', `--window-size=${W},${Hh}`, `--force-device-scale-factor=${DPR}`,
  `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/andy-probe-${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--use-gl=angle', '--use-angle=metal', 'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore'] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); const j = await r.json(); if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl; } catch {}
    await sleep(150);
  }
  throw new Error('CDP non raggiungibile');
}

const ws = new WebSocket(await wsUrl());
let id = 0; const pending = new Map(); const logs = [];
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej });
  ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
  setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + method)); } }, 60000);
});
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); return; }
  if (m.method === 'Runtime.consoleAPICalled') logs.push(`[console.${m.params.type}] ` + m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '));
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push(`[exception] ${d.text} ${d.exception?.description || ''} @${d.url || ''}:${d.lineNumber ?? ''}`);
  }
  if (m.method === 'Log.entryAdded') logs.push(`[log.${m.params.entry.level}] ${m.params.entry.text} ${m.params.entry.url || ''}`);
});
await new Promise((r) => ws.addEventListener('open', r));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);
await send('Network.enable', {}, sessionId);
await send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: W, height: Hh, deviceScaleFactor: DPR, mobile: false }, sessionId);
await send('Page.navigate', { url }, sessionId);
await sleep(WAIT);
const results = {};
for (const e of evals) {
  try { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }, sessionId); results[e] = r.result?.value ?? r.result?.description ?? null; }
  catch (err) { results[e] = 'ERR ' + err.message; }
}
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(JSON.stringify({ logs: logs.slice(0, 60), results, out }, null, 2));
try { await send('Target.closeTarget', { targetId }); } catch {}
ws.close(); chrome.kill();
process.exit(0);
