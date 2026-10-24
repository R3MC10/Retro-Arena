// Retro Arena desktop app: window + LAN discovery + LAN room relay.
const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const dgram = require('dgram');
const {WebSocketServer} = require('ws');

const BEACON_PORT = 41234;
if (process.env.RA_PROFILE) app.setPath('userData', process.env.RA_PROFILE); // lets two copies run on one PC
let win = null;

/* ---------- LAN discovery: every app shouts "I'm here" once a second ---------- */
let beacon = null; // what this app announces (lobby presence)
const udp = dgram.createSocket({type: 'udp4', reuseAddr: true});
udp.on('error', () => {});
udp.on('message', (buf, rinfo) => {
  let m;
  try { m = JSON.parse(buf.toString()); } catch { return; }
  if (!m || m.app !== 'retro-arena' || typeof m.peer !== 'string') return;
  if (win && !win.isDestroyed()) win.webContents.send('lan-beacon', {peer: m.peer, by: m.by, pr: m.pr || {}, ip: rinfo.address});
});
udp.bind(BEACON_PORT, () => { try { udp.setBroadcast(true); } catch {} });
setInterval(() => {
  if (!beacon) return;
  const msg = Buffer.from(JSON.stringify({app: 'retro-arena', ...beacon}));
  if (msg.length > 8000) return;
  udp.send(msg, BEACON_PORT, '255.255.255.255', () => {});
}, 1000);
ipcMain.on('lan-beacon-set', (_e, data) => { beacon = data; });

/* ---------- LAN room relay: the host PC passes messages between players ---------- */
let hub = null;
ipcMain.handle('lan-hub-start', async () => {
  if (hub) return hub.port;
  const wss = new WebSocketServer({port: 0, maxPayload: 64 * 1024});
  await new Promise(r => wss.on('listening', r));
  const state = new Map(); // peer -> {by, pr, ws}
  const send = (ws, m) => { try { ws.send(JSON.stringify(m)); } catch {} };
  wss.on('connection', ws => {
    let me = null;
    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw); } catch { return; }
      if (m.t === 'hello' && typeof m.peer === 'string' && !me) {
        me = m.peer;
        state.set(me, {by: m.by || null, pr: m.pr || {}, ws});
        for (const [peer, s] of state) if (peer !== me) send(ws, {t: 'p', peer, by: s.by, pr: s.pr});
        for (const [peer, s] of state) if (peer !== me) send(s.ws, {t: 'p', peer: me, by: m.by || null, pr: m.pr || {}});
      } else if (m.t === 'e' && me && typeof m.topic === 'string') {
        const s = state.get(me);
        for (const [peer, o] of state) if (peer !== me) send(o.ws, {t: 'e', peer: me, by: s.by, topic: m.topic, data: m.data});
      } else if (m.t === 'p' && me) {
        const s = state.get(me); s.pr = m.pr || {};
        for (const [peer, o] of state) if (peer !== me) send(o.ws, {t: 'p', peer: me, by: s.by, pr: s.pr});
      }
    });
    ws.on('close', () => {
      if (!me) return;
      state.delete(me);
      for (const [, o] of state) send(o.ws, {t: 'bye', peer: me});
    });
  });
  hub = {wss, port: wss.address().port};
  return hub.port;
});
ipcMain.handle('lan-hub-stop', async () => {
  if (!hub) return;
  try { hub.wss.close(); for (const c of hub.wss.clients) c.terminate(); } catch {}
  hub = null;
});

/* ---------- window ---------- */
function createWindow() {
  win = new BrowserWindow({
    width: 1100, height: 900, backgroundColor: '#101010', title: 'Retro Arena',
    webPreferences: {preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false}
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  if (process.env.RA_DEVTOOLS) win.webContents.openDevTools();
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
