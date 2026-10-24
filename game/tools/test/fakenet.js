(()=>{const ME='p'+Math.random().toString(36).slice(2),myId='u'+ME;
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


function chan(name,core,senders,evs){const bc=new BroadcastChannel('ra-'+name);
 bc.onmessage=e=>{const m=e.data;if(m.peer===ME)return;if(m.t==='p')core.set(m.peer,m.by,m.pr,'bc');else if(m.t==='e')core.fire(m.topic,m.data,m.peer,m.by);else if(m.t==='hi')bc.postMessage({t:'p',peer:ME,by:myId,pr:core.mine});else if(m.t==='bye')core.drop(m.peer,'bc')};
 senders.push(pr=>bc.postMessage({t:'p',peer:ME,by:myId,pr}));evs.push((topic,data)=>bc.postMessage({t:'e',peer:ME,by:myId,topic,data}));bc.postMessage({t:'hi',peer:ME});return bc}
const lobby=new Core(),ls=[],le=[];chan('lobby',lobby,ls,le);
async function joinNamed(name){const core=new Core(),s=[],e=[];const bc=chan(name.toLowerCase(),core,s,e);
 return makeApi(core,s,{name,leave:async()=>{bc.postMessage({t:'bye',peer:ME});bc.close()}},e)}
const lobbyApi=makeApi(lobby,ls,{join:joinNamed,name:'lobby'},le);
const userApi={id:async()=>myId,me:async()=>({id:myId,name:''}),profiles:async ids=>Object.fromEntries((ids||[]).map(i=>[i,{id:i,name:''}]))};
const dbApi={doc:p=>({get:async()=>({exists:false,data:()=>undefined}),set:async()=>{}})};
window.claude={use:async n=>n==='room'?lobbyApi:n==='user'?userApi:n==='db'?dbApi:null};
})();