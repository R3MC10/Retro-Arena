// Retro Arena networking for the desktop app.
// Gives the game the same small "room" API it uses on claude.ai, but built on:
//  - LAN: UDP beacons (find games on the same network) + a relay on the host PC
//  - Internet: direct player-to-player WebRTC (free public relays only for the handshake)
import {joinRoom, selfId} from 'trystero';

const APP_ID = 'retro-arena-r3mc10-v1';
const LAN = window.RA_LAN || null;
window.RA_APP = true;

const myId = (() => {
  try {
    let v = localStorage.getItem('ra-id');
    if (!v) { v = 'u' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('ra-id', v); }
    return v;
  } catch { return 'u' + Math.random().toString(36).slice(2); }
})();
const ME = selfId;

/* Peer list shared by the lobby and every room. Each peer may be reached by LAN, internet, or both. */
class Core {
  constructor() { this.map = new Map(); this.mine = {}; this.hs = new Set(); this.ev = new Map(); this.cache = null; this.t = 0; }
  // a moment (chat line...) from a peer, or our own echo
  fire(topic, data, peer, by) {
    if (typeof topic !== 'string') return;
    const self = peer === ME, msg = Object.freeze({topic, data, peer, by: self ? myId : (typeof by === 'string' ? by : null), isMe: self, sameTab: self, kind: 'viewer', guest: false});
    for (const h of this.ev.get(topic) || []) { try { h(msg); } catch (e) { console.error(e); } }
  }
  self() { return {peer: ME, by: myId, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: this.mine, updatedAt: Date.now()}; }
  set(peer, by, pr, src, extra) {
    if (typeof peer !== 'string' || peer === ME) return;
    const e = this.map.get(peer) || {src: new Set(), seen: {}};
    e.by = typeof by === 'string' ? by : null;
    e.presence = Object.freeze({...(pr && typeof pr === 'object' ? pr : {}), ...(extra || {})});
    e.src.add(src); e.seen[src] = Date.now(); e.updatedAt = Date.now();
    this.map.set(peer, e); this.changed();
  }
  drop(peer, src) {
    const e = this.map.get(peer); if (!e) return;
    e.src.delete(src); if (!e.src.size) this.map.delete(peer); this.changed();
  }
  prune(src, ms) { const now = Date.now(); for (const [p, e] of this.map) if (e.src.has(src) && now - e.seen[src] > ms) this.drop(p, src); }
  patch(p) { const m = {...this.mine}; for (const k in p) { if (p[k] === null) delete m[k]; else m[k] = p[k]; } this.mine = m; this.changed(); }
  list() {
    if (!this.cache) {
      const arr = [Object.freeze(this.self())];
      for (const [peer, e] of this.map) arr.push(Object.freeze({peer, by: e.by, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: e.presence, updatedAt: e.updatedAt}));
      this.cache = Object.freeze(arr);
    }
    return this.cache;
  }
  changed() {
    this.cache = null;
    if (this.t) return;
    this.t = setTimeout(() => { this.t = 0; const peers = this.list(); for (const h of this.hs) { try { h({peers, joined: [], left: [], updated: []}); } catch (e) { console.error(e); } } }, 0);
  }
}

function makeApi(core, senders, extras, evSenders) {
  let pending = false;
  const flush = () => { pending = false; for (const f of senders) { try { f(core.mine); } catch {} } };
  return Object.freeze({
    peers: () => core.list(),
    onPeers(h) { core.hs.add(h); setTimeout(() => core.hs.has(h) && h({peers: core.list(), joined: core.list(), left: [], updated: []}), 0); return () => core.hs.delete(h); },
    presence(patch) {
      core.patch(patch || {});
      if (!pending) { pending = true; setTimeout(flush, 30); } // coalesce to ~30 sends a second
      return Promise.resolve();
    },
    connected: () => true,
    onConnection(h) { setTimeout(() => h(true), 0); return () => {}; },
    // events go to everyone in the room (and back to us, like claude.ai rooms)
    async emit(topic, data) {
      if (!/^[a-z][a-z0-9_.-]{0,47}$/.test(String(topic))) throw Object.assign(new Error('bad topic'), {code: 'invalid_argument'});
      if (JSON.stringify(data === undefined ? null : data).length > 4096) throw Object.assign(new Error('too big'), {code: 'invalid_argument'});
      for (const f of evSenders || []) { try { f(topic, data); } catch {} }
      setTimeout(() => core.fire(topic, data, ME, myId), 0);
    },
    on(topic, h) { if (!core.ev.has(topic)) core.ev.set(topic, new Set()); core.ev.get(topic).add(h); return () => core.ev.get(topic).delete(h); },
    ...extras
  });
}

/* ---------- lobby: everyone running the app ---------- */
const lobby = new Core();
const lobbySend = [], lobbyEv = [];
let hubPort = 0;
try {
  const t = joinRoom({appId: APP_ID}, 'lobby');
  const a = t.makeAction('pres');
  a.onMessage = (m, {peerId}) => lobby.set(peerId, m && m.by, m && m.p, 'net');
  const ev = t.makeAction('ev');
  ev.onMessage = (m, {peerId}) => m && lobby.fire(m.topic, m.data, peerId, (lobby.map.get(peerId) || {}).by);
  lobbyEv.push((topic, data) => ev.send({topic, data}).catch(() => {}));
  t.onPeerJoin = id => { a.send({by: myId, p: lobby.mine}, {target: id}).catch(() => {}); };
  t.onPeerLeave = id => lobby.drop(id, 'net');
  lobbySend.push(pr => a.send({by: myId, p: pr}).catch(() => {}));
} catch (e) { console.warn('internet lobby unavailable', e); }
if (LAN) {
  LAN.onBeacon(m => { if (m.peer !== ME) lobby.set(m.peer, m.by, m.pr, 'lan', {_ip: m.ip}); });
  const beacon = () => LAN.setBeacon({peer: ME, by: myId, pr: hubPort ? {...lobby.mine, _lan: hubPort} : lobby.mine});
  lobbySend.push(beacon); beacon();
  setInterval(() => lobby.prune('lan', 4000), 1000);
}

/* ---------- named rooms (one per game) ---------- */
async function joinNamed(name) {
  const core = new Core(), senders = [], cleanup = [], evs = [];
  let ws = null, hosting = false;
  // room names are '<game>-<code>' (Worms uses 'gb-<code>'); the host advertises {gm, c} in its lobby presence
  const roomOf = o => ((o.gm || 'gb') + '-' + String(o.c)).toLowerCase();
  const lanHost = LAN && lobby.list().find(p => !p.isMe && p.presence.open && roomOf(p.presence.open) === name.toLowerCase() && p.presence._lan && p.presence._ip);
  const connect = url => new Promise(res => {
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    try { ws = new WebSocket(url); } catch { return fin(false); }
    ws.onopen = () => { ws.send(JSON.stringify({t: 'hello', peer: ME, by: myId, pr: core.mine})); fin(true); };
    ws.onerror = () => fin(false);
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } if (m.t === 'p') core.set(m.peer, m.by, m.pr, 'lan'); else if (m.t === 'e') core.fire(m.topic, m.data, m.peer, m.by); else if (m.t === 'bye') core.drop(m.peer, 'lan'); };
    ws.onclose = () => { for (const p of [...core.map.keys()]) core.drop(p, 'lan'); };
    setTimeout(() => fin(false), 3000);
  });
  let viaLan = false;
  if (lanHost) viaLan = await connect('ws://' + lanHost.presence._ip + ':' + lanHost.presence._lan);
  if (!viaLan && LAN && !lanHost) { // nobody on the LAN hosts this code: we may be the host, so open a relay
    try { hubPort = await LAN.hubStart(); hosting = true; await connect('ws://127.0.0.1:' + hubPort); for (const f of lobbySend) f(lobby.mine); } catch {}
  }
  senders.push(pr => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({t: 'p', pr})); });
  evs.push((topic, data) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({t: 'e', topic, data})); });
  cleanup.push(() => { try { ws && ws.close(); } catch {} });
  if (!viaLan) {
    try {
      const t = joinRoom({appId: APP_ID}, name);
      const a = t.makeAction('pres');
      a.onMessage = (m, {peerId}) => core.set(peerId, m && m.by, m && m.p, 'net');
      t.onPeerJoin = id => { a.send({by: myId, p: core.mine}, {target: id}).catch(() => {}); };
      t.onPeerLeave = id => core.drop(id, 'net');
      senders.push(pr => a.send({by: myId, p: pr}).catch(() => {}));
      const ev = t.makeAction('ev');
      ev.onMessage = (m, {peerId}) => m && core.fire(m.topic, m.data, peerId, (core.map.get(peerId) || {}).by);
      evs.push((topic, data) => ev.send({topic, data}).catch(() => {}));
      cleanup.push(() => t.leave());
    } catch (e) { console.warn('internet room unavailable', e); }
  }
  return makeApi(core, senders, {
    name,
    leave: async () => {
      for (const f of cleanup) { try { f(); } catch {} }
      if (hosting && LAN) { hubPort = 0; await LAN.hubStop(); for (const f of lobbySend) f(lobby.mine); }
    }
  }, evs);
}
const lobbyApi = makeApi(lobby, lobbySend, {join: joinNamed, name: 'lobby'}, lobbyEv);

/* ---------- player id + local save (stands in for login / cloud save) ---------- */
const userApi = Object.freeze({
  id: async () => myId,
  me: async () => ({id: myId, name: '', email: null}),
  profiles: async ids => Object.fromEntries((ids || []).map(i => [i, {id: i, name: ''}])),
  isOwner: async () => true, canEdit: async () => true, can: async () => null
});
const dbApi = Object.freeze({
  doc: path => ({
    get: async () => { let d = null; try { d = JSON.parse(localStorage.getItem('ra-db:' + path)); } catch {} return {exists: !!d, data: () => d || undefined}; },
    set: async d => { try { localStorage.setItem('ra-db:' + path, JSON.stringify(d)); } catch {} }
  })
});

window.claude = Object.freeze({
  use: async n => n === 'room' ? lobbyApi : n === 'user' ? userApi : n === 'db' ? dbApi : null
});
