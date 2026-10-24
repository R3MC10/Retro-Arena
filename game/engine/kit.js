/* RA.kit: the shared arena-game shell. A game hands it its modes, host settings and five hooks, and the kit builds the rest:
   title + attract demo, mode tabs, host settings (synced to the room), ONLINE / LOCAL tabs with seats and controls, the online room
   (RA.rooms), host snapshots, guest input upload, the results screen, save file + achievements, auto back-to-room, legends, menu entry.
   const K=RA.kit({id, name, kind, players, desc, icon, music, blurb, howto, kb, pad, max, modes:[[name,note]], settings:[[key,label,[[v,l]..]]],
     ach:[...RA.achievements defs], demo:4,
     start(seats, mode, S, seed)   seats=[{ctrl,name,peer,col}] → build the match (host, local and guests all call it)
     step()                        one 60 Hz step of the match (host / local). Read seat buttons with K.inp(i). Call K.end(win) when it is over.
     follow()                      one step on a guest (glide things toward the last snapshot)
     snap() / apply(g)             host → guests state (keep it under ~3 KB of JSON)
     render(ctx, W, H)             draw a frame (logical pixels, the canvas is 3x for smooth edges)
     aim(i)                        optional: the local mouse aim angle for seat i (world space), or null
     bot(i)                        CPU buttons for seat i
     ranks()                       [[name, col, text]] best first, for the results screen
     result(i, win)                the save-file record for seat i ({won, kills, bestScore, ...})
     teamOf(i)                     optional: team of seat i (team modes)
   win = {i: seat} | {team: t, name} | null (draw). K.fx(kind, ...args) sends a one-off effect to guests (they get onFx(kind,args)). */
(()=>{
const {$,esc,touchDev}=RA.util;
const BITS=['up','down','left','right','fire','alt','b3','b4'];
const toBits=o=>BITS.reduce((v,k,i)=>v|(o[k]?1<<i:0),0),fromBits=v=>{const o={};BITS.forEach((k,i)=>{if(v&(1<<i))o[k]=true});return o};
const BASE=[['Red','#e83838'],['Blue','#2888ff'],['Gold','#f8c020'],['Green','#20c040'],['Pink','#ff78e0'],['Cyan','#20e8e0'],['Orange','#ff8020'],['Violet','#8060ff'],['Silver','#c8c8d8'],['Mint','#70f8a8']];
const CTRL=[['mk','Mouse + keys'],['k2','Keys IJKL'],['k3','Arrow keys'],['k4','Numpad'],['touch','Touch buttons'],['gp0','Gamepad 1'],['gp1','Gamepad 2'],['gp2','Gamepad 3'],['gp3','Gamepad 4'],['cpu','CPU']];
const KEYS={mk:{KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',Space:'fire',KeyE:'alt',KeyQ:'b3',ShiftLeft:'b4'},
 k2:{KeyI:'up',KeyK:'down',KeyJ:'left',KeyL:'right',KeyU:'fire',KeyO:'alt'},
 k3:{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Slash:'fire',Period:'alt'},
 k4:{Numpad8:'up',Numpad5:'down',Numpad4:'left',Numpad6:'right',Numpad0:'fire',NumpadDecimal:'alt'}};
RA.kit=o=>{
 const id=o.id,P=id.slice(0,3),MAX=o.max||20,COLORS=Array.from({length:MAX},(_,i)=>[i<10?BASE[i][0]:BASE[i%10][0]+' 2',BASE[i%10][1]]);
 const q=s=>$(P+s),modes=o.modes||[['MATCH','']];
 const root=RA.mount(`
  <div class="top"><div class="row"><button id="${P}Back">◀ GAMES</button><div class="brand">RETRO <b>ARENA</b> · ${esc(o.name)}</div></div><div class="info" id="${P}Info"></div></div>
  <div class="screen"><canvas id="${P}Cv"></canvas>
   <button class="hudbtn ra-quit">MENU</button><button class="hudbtn ra-mus" aria-label="Music on or off">♪</button>
   <div class="overlay" id="${P}Title"><h1>${esc(o.name)}</h1><p>${o.blurb||''}</p></div>
   <div class="overlay" id="${P}Over" hidden><h1 id="${P}Win"></h1><ol class="ranks" id="${P}Ranks"></ol>
    <div class="row" style="justify-content:center"><button class="go" id="${P}Again">PLAY AGAIN</button><button id="${P}SetupBtn">SETUP</button></div><p id="${P}OverNote" hidden>Waiting for the host…</p></div></div>
  <div class="row kmode"${modes.length<2?' hidden':''}><span class="lbl">MODE</span><div class="tabs" id="${P}Modes">${modes.map((m,i)=>'<button class="tab" data-m="'+i+'">'+m[0]+'</button>').join('')}</div><span class="note" id="${P}ModeNote"></span></div>
  <div class="row mset kmode" id="${P}Set"></div>
  <div class="tabs" id="${P}Tabs"><button class="tab on" id="${P}TabOn">ONLINE</button><button class="tab" id="${P}TabLocal">LOCAL</button></div>
  <section class="panel" id="${P}OnlinePanel"><h2 class="ph">ONLINE · UP TO ${MAX} PLAYERS</h2><div id="${P}Online"></div></section>
  <section class="panel" id="${P}Setup" hidden><h2 class="ph">LOCAL · ONE SCREEN</h2>
   <div class="row between"><div class="row"><span class="lbl">PLAYERS</span><div class="step"><button id="${P}Minus" aria-label="Fewer">−</button><output id="${P}N">2</output><button id="${P}Plus" aria-label="More">+</button></div>
    <label>CPU <select id="${P}Cpu"><option value="0">Easy</option><option value="1" selected>Normal</option><option value="2">Hard</option></select></label></div><button class="go" id="${P}Start">START ▶</button></div>
   <div class="list kslots" id="${P}Slots"></div><p class="note">${o.howto||''}</p></section>
  <div class="pad" hidden><div class="dpad"><i class="dU">▲</i><i class="dD">▼</i><i class="dL">◀</i><i class="dR">▶</i></div><div class="ab"><button data-k="fire" class="a">${o.fireLabel||'GO'}</button></div></div>`);
 root.classList.add('kit');
 const cv=q('Cv'),ctx=cv.getContext('2d');
 const K={root,ctx,cv,W:384,H:216,seats:[],mode:0,S:{},seed:1,tick:0,demo:true,state:'menu',myIdx:-1,colors:COLORS,cpu:1,fxq:[],winner:null};
 const SCR=RA.screen({el:root.querySelector('.screen'),canvas:cv,baseH:o.baseH||240,res:3,onResize:(w,h)=>{K.W=w;K.H=h}});K.SCR=SCR;
 // ---- saved setup + host settings
 const LS=id+'-kit';let sv={};try{sv=JSON.parse(localStorage.getItem(LS))||{}}catch(e){}
 const SET=o.settings||[];const S0={};for(const[k,,opts,d]of SET)S0[k]=d!=null?d:opts[0][0];
 let S=Object.assign({},S0,sv.S||{});
 const cleanS=x=>{const r={};for(const[k,,opts]of SET){const v=x&&x[k];const hit=opts.find(y=>String(y[0])===String(v));r[k]=hit?hit[0]:S[k]}return r};
 let selMode=sv.md>=0&&sv.md<modes.length?sv.md:0,onlineTab=sv.tab!==false;
 const save=()=>{try{localStorage.setItem(LS,JSON.stringify({S,md:selMode,tab:onlineTab,n:nSel(),cpu:q('Cpu').value,c:[...Array(MAX).keys()].map(i=>q('c'+i).value)}))}catch(e){}};
 q('Set').innerHTML=SET.map(([k,t,op])=>'<label>'+t+' <select id="'+P+'s_'+k+'">'+op.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+'</select></label>').join('');
 q('Slots').innerHTML=COLORS.map((c,i)=>'<div class="slot" id="'+P+'sl'+i+'"><span class="chip" style="background:'+c[1]+'">'+(i+1)+'</span><select id="'+P+'c'+i+'" aria-label="Seat '+(i+1)+' controls">'+CTRL.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('')+'</select></div>').join('');
 for(let i=0;i<MAX;i++)q('c'+i).value=(sv.c&&sv.c[i])||(i===0?(touchDev?'touch':'mk'):'cpu');
 q('N').textContent=String(sv.n||2);if(sv.cpu!=null)q('Cpu').value=sv.cpu;
 const nSel=()=>+q('N').textContent;
 function syncSlots(){const n=nSel();q('Minus').disabled=n<=1;q('Plus').disabled=n>=MAX;for(let i=0;i<MAX;i++)q('sl'+i).hidden=i>=n}
 function setMode(m){selMode=m;root.querySelectorAll('#'+P+'Modes .tab').forEach(b=>b.classList.toggle('on',+b.dataset.m===m));q('ModeNote').textContent=(modes[m]||[])[1]||'';save()}
 function showS(){for(const[k]of SET){const el=q('s_'+k);if(el.value!==String(S[k]))el.value=String(S[k]);const lock=R.online&&!R.host;if(el.disabled!==lock)el.disabled=lock}}
 for(const[k]of SET)q('s_'+k).addEventListener('change',e=>{const v=e.target.value;S[k]=isNaN(+v)||v===''?v:+v;save()});
 q('Modes').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b&&!(R.online&&!R.host))setMode(+b.dataset.m)});
 q('Minus').addEventListener('click',()=>{q('N').textContent=Math.max(1,nSel()-1);syncSlots();save()});
 q('Plus').addEventListener('click',()=>{q('N').textContent=Math.min(MAX,nSel()+1);syncSlots();save()});
 q('Slots').addEventListener('change',save);q('Cpu').addEventListener('change',save);
 function setTab(on){onlineTab=on;q('TabOn').classList.toggle('on',on);q('TabLocal').classList.toggle('on',!on);q('OnlinePanel').hidden=!on;q('Setup').hidden=on;save()}
 q('TabOn').addEventListener('click',()=>setTab(true));q('TabLocal').addEventListener('click',()=>setTab(false));syncSlots();
 // ---- online
 const NET={id:0,r:[],ev:[],es:0,seen:0,fc:0,prev:{},lastA:-1e9,lastAT:0};
 const R=RA.rooms({game:id,controls:o.howto,el:q('Online'),colors:COLORS,max:MAX,minPlayers:o.minPlayers||1,cpus:o.cpus==null?1:o.cpus,
  note:'Up to '+MAX+' players per room, CPU players fill seats. The host picks the mode and settings above. '+(o.howto||''),
  onStart:startOnline,onState:applySnap,onLeave:()=>{if(!RA.menu.open&&RA.menu.current&&RA.menu.current.id===id)toLobby()}});
 K.R=R;const isClient=()=>R.online&&!R.host,hostOnline=()=>R.online&&R.host;K.isClient=isClient;K.hostOnline=hostOnline;
 // ---- input
 const {mouse,touchK,touchAim}=RA.input;
 const padIn=n=>{const p=RA.input.pad(n),r={up:p.up,down:p.down,left:p.left,right:p.right,fire:p.a||p.rt,alt:p.b||p.rb,b3:p.x||p.lb,b4:p.y};
  if(Math.hypot(p.rx||0,p.ry||0)>.5)r.aimA=Math.atan2(p.ry,p.rx);r.ax=p.ax||0;r.ay=p.ay||0;return r};
 const touchIn=()=>({up:touchK.up,down:touchK.down,left:touchK.left,right:touchK.right,fire:touchK.fire});
 function localIn(i,ctrl){let r;
  if(ctrl==='mk'||ctrl==='me'){r=RA.input.keys(KEYS.mk);if(mouse.down)r.fire=true;if(mouse.right)r.alt=true;
   if(ctrl==='me'){const a=RA.input.keys(KEYS.k3);for(const k in a)if(a[k])r[k]=true;const t=touchIn();for(const k in t)if(t[k])r[k]=true;const g=padIn(0);for(const k of BITS)if(g[k])r[k]=true;if(g.aimA!=null)r.aim=g.aimA}
   if(r.aim==null&&!touchDev&&mouse.on&&o.aim){const a=o.aim(i,mouse.fx,mouse.fy);if(a!=null)r.aim=a}
   if(r.aim==null&&touchAim.on&&o.aim){const a=o.aim(i,touchAim.fx,touchAim.fy);if(a!=null)r.aim=a}}
  else if(ctrl==='touch'){r=touchIn();if(touchAim.on&&o.aim){const a=o.aim(i,touchAim.fx,touchAim.fy);if(a!=null)r.aim=a}}
  else if(ctrl&&ctrl.startsWith('gp')){r=padIn(+ctrl[2]);if(r.aimA!=null)r.aim=r.aimA}
  else r=RA.input.keys(KEYS[ctrl]||{});
  return r}
 K.inp=i=>{const s=K.seats[i];if(!s)return{};
  if(s.ctrl==='cpu')return o.bot?o.bot(i):{};
  if(s.ctrl==='net'){const p=R.input(s.peer);if(!p)return{};const r=fromBits(p.i|0),d=(((p.f|0)-(s.lf|0))%1000+1000)%1000;s.lf=p.f|0;if(d)r.tap=true;if(typeof p.a==='number')r.aim=p.a/100;return r}
  const r=localIn(i,s.ctrl),pr=s.prev||{};s.prev=r;if(r.fire&&!pr.fire)r.tap=true;return r};
 function clientSend(now){const r=localIn(NET.myIdx,'me'),pr=NET.prev;NET.prev=r;if(r.fire&&!pr.fire)NET.fc=(NET.fc+1)%1000;
  let a=r.aim!=null?Math.round(r.aim*100):NET.lastA;if(Math.abs(a-NET.lastA)<4&&now-NET.lastAT<120)a=NET.lastA;else{NET.lastA=a;NET.lastAT=now}
  const p={i:toBits(r),f:NET.fc};if(r.aim!=null)p.a=a;R.send(p,now)}
 const usesKey=e=>{if(K.state!=='play'||K.demo)return false;if(R.online)return!!(KEYS.mk[e.code]||KEYS.k3[e.code]);return K.seats.some(s=>KEYS[s.ctrl]&&KEYS[s.ctrl][e.code])};
 RA.input.attachPointer(cv,{active:()=>K.state==='play'&&!K.demo&&(R.online?NET.myIdx>=0:K.seats.some(s=>s.ctrl==='mk')),
  touchActive:()=>K.state==='play'&&!K.demo&&(R.online?NET.myIdx>=0:K.seats.some(s=>s.ctrl==='touch'))});
 // ---- match flow
 K.fx=(k,...a)=>{if(hostOnline()&&!K.demo){NET.ev.push([++NET.es,k,...a]);if(NET.ev.length>30)NET.ev.shift()}};
 // spectating: watchers, and players who are out, follow one living player; ← → / Tab / click switch who
 const alive=i=>o.alive?o.alive(i):true;K.spec=-1;
 K.spectating=()=>!K.demo&&K.state!=='menu'&&(R.online?(NET.myIdx<0||!alive(NET.myIdx)):!K.seats.some((s,i)=>s.ctrl!=='cpu'&&alive(i)));
 K.cycle=d=>{const n=K.seats.length;if(!n)return;let j=K.spec;for(let k=0;k<n;k++){j=((j+d)%n+n)%n;if(alive(j)){K.spec=j;return}}};
 K.focus=()=>{if(K.spectating()){if(K.spec<0||!alive(K.spec))K.cycle(1);return K.spec>=0&&alive(K.spec)?[K.spec]:[]}
  return R.online?[NET.myIdx]:K.seats.map((s,i)=>s.ctrl!=='cpu'&&alive(i)?i:-1).filter(i=>i>=0)};
 addEventListener('keydown',e=>{if(RA.menu.current&&RA.menu.current.id!==id||!K.spectating())return;
  if(e.code==='ArrowRight'||e.code==='Tab'||e.code==='KeyE'){K.cycle(1);e.preventDefault()}else if(e.code==='ArrowLeft'||e.code==='KeyQ'){K.cycle(-1);e.preventDefault()}});
 cv.addEventListener('pointerdown',()=>{if(K.spectating())K.cycle(1)});
 let overT=0,lastTrack=-1;
 K.track=k=>{if(k===lastTrack||K.demo&&k)return;lastTrack=k;RA.music.play(id,k)};
 K.end=win=>{if(K.demo){startDemo();return}if(K.state!=='play')return;K.winner=win||null;K.state='ending';overT=60};
 function begin(seats,md,demo){K.demo=!!demo;K.tick=0;K.mode=md;K.S=S;K.winner=null;K.state='play';NET.ev=[];overT=0;
  seats.forEach((s,i)=>{s.col=s.col||COLORS[i][1]});K.seats=seats;K.cpu=demo?1:+q('Cpu').value;o.start(seats,md,S,K.seed)}
 function startDemo(){K.seed=(Math.random()*1e9)|0;begin(Array.from({length:o.demo||4},(_,i)=>({ctrl:'cpu',name:'CPU '+(i+1)})),Math.min(modes.length-1,o.demoMode||0),true)}
 function enterPlay(tp){document.body.classList.add('playing');document.body.classList.toggle('touchplay',tp);
  document.body.classList.toggle('mouseaim',!!o.aim&&!touchDev&&(R.online?NET.myIdx>=0:K.seats.some(s=>s.ctrl==='mk')));
  root.querySelector('.pad').hidden=!tp;for(const s of['Title','Over','Setup','OnlinePanel','Tabs','Back'])q(s).hidden=true;root.querySelectorAll('.kmode').forEach(e=>e.hidden=true);
  RA.hud.disarm();lastTrack=-1;K.track(1+Math.floor(Math.random()*Math.max(1,(o.music||[]).length-1)))}
 function startLocal(){save();RA.audio.ensure();const n=nSel(),ctr=[...Array(n)].map((_,i)=>q('c'+i).value),nm=RA.player.seats(ctr);
  NET.myIdx=-1;K.myIdx=-1;K.seed=(Math.random()*1e9)|0;begin(ctr.map((c,i)=>({ctrl:c,name:nm[i]})),selMode,false);enterPlay(K.seats.some(s=>s.ctrl==='touch'))}
 function startOnline(list){RA.audio.ensure();NET.id=(Math.random()*1e9)|0;NET.r=list.map(x=>x.peer);K.seed=(Math.random()*1e9)|0;let c=0;
  const seats=list.map((x,i)=>x.cpu?{ctrl:'cpu',name:'CPU '+(++c)}:{ctrl:x.me?'me':'net',peer:x.peer,name:x.me?(RA.player.name||'YOU'):R.name(R.peer(x.peer),i)});
  NET.myIdx=list.findIndex(x=>x.me);K.myIdx=NET.myIdx;begin(seats,selMode,false);enterPlay(touchDev)}
 function verdict(){const w=K.winner,me=K.myIdx>=0?K.myIdx:K.seats.findIndex(s=>s.ctrl!=='cpu');
  if(!w)return'DRAW';if(w.team!=null){const mt=o.teamOf&&me>=0?o.teamOf(me):-1;return mt===w.team?'YOUR TEAM WINS!':(w.name||'TEAM '+(w.team+1)).toUpperCase()+' WINS'}
  if(w.coop!=null)return w.coop?(w.name||'YOU WIN!'):(w.name||'GAME OVER');
  const s=K.seats[w.i];return!s?'DRAW':w.i===me&&(R.online||K.seats.filter(x=>x.ctrl!=='cpu').length===1)?'YOU WIN!':esc(s.name).toUpperCase()+' WINS'}
 let ranksCache=[];
 function showOver(){K.state='over';const me=K.myIdx>=0?K.myIdx:isClient()?-1:K.seats.findIndex(s=>s.ctrl!=='cpu');
  if(me>=0&&o.result){const m=o.result(me,K.winner)||{};SAVE.record(m);ACH.check(m)}
  q('Win').textContent=verdict();const rk=isClient()?ranksCache:o.ranks();ranksCache=rk;
  q('Ranks').innerHTML=rk.slice(0,10).map((r,k)=>'<li style="animation-delay:'+k*60+'ms"><span class="pos">'+(k+1)+'</span><span style="color:'+r[1]+'">'+esc(r[0])+'</span><em>'+esc(r[2])+'</em></li>').join('');
  q('Again').hidden=isClient();q('SetupBtn').hidden=isClient();q('OverNote').hidden=!isClient();
  q('Again').textContent=hostOnline()?'BACK TO ROOM':'PLAY AGAIN';q('SetupBtn').textContent=R.online?'LEAVE ROOM':'SETUP';
  q('Over').hidden=false;root.querySelector('.pad').hidden=true;RA.audio.sfx('pick');K.track(o.overTrack||0);
  if(hostOnline())RA.autoBack({still:()=>K.state==='over'&&hostOnline(),label:n=>q('Again').textContent='BACK TO ROOM ('+n+')',go:()=>q('Again').click()});
  else if(isClient())RA.autoBack({still:()=>K.state==='over',label:n=>q('OverNote').textContent='Back to the room in '+n+'…'})}
 function toLobby(){document.body.classList.remove('playing','touchplay','mouseaim');root.querySelector('.pad').hidden=true;
  q('Title').hidden=false;q('Over').hidden=true;q('Tabs').hidden=false;q('Back').hidden=false;root.querySelectorAll('.kmode').forEach(e=>e.hidden=e.id!==P+'Set'&&modes.length<2);
  showS();q('Info').textContent=R.online?'Room '+R.code:'';setTab(onlineTab||R.online);if(R.online)R.render();
  NET.myIdx=-1;K.myIdx=-1;startDemo();setMode(selMode);RA.music.play(id,0);lastTrack=0}
 // ---- snapshots
 function snapshot(){const g=Object.assign({ph:K.state==='over'?'over':'play',id:NET.id,r:NET.r,md:K.mode,bs:S,sd:K.seed,n:K.seats.length,t:K.tick},o.snap());
  if(K.state==='over'){g.w=K.winner;g.rk=ranksCache}g.e=NET.ev.slice();
  while(JSON.stringify(g).length>3800&&g.e.length)g.e.shift();return g}
 function applySnap(g){if(!g)return;if(g.bs)S=cleanS(g.bs);
  if(g.ph==='lobby'){if(!K.demo)toLobby();if(typeof g.md==='number')setMode(Math.max(0,Math.min(modes.length-1,g.md|0)));showS();return}
  if(!Array.isArray(g.r))return;const me=R.room&&R.room.peers().find(p=>p.sameTab),n=Math.min(MAX,g.n|0);
  if(g.id!==NET.id||K.seats.length!==n||K.demo){NET.id=g.id;NET.seen=0;for(const e of g.e||[])NET.seen=Math.max(NET.seen,e[0]|0);
   K.seed=g.sd|0;NET.myIdx=me?g.r.indexOf(me.peer):-1;K.myIdx=NET.myIdx;const all=R.room?R.room.peers():[];let c=0;
   begin(g.r.slice(0,n).map((p,i)=>({ctrl:'net',peer:p,name:p?(p===(me&&me.peer)?(RA.player.name||'YOU'):R.name(all.find(x=>x.peer===p),i)):'CPU '+(++c)})),Math.max(0,Math.min(modes.length-1,g.md|0)),false);
   enterPlay(touchDev&&NET.myIdx>=0)}
  K.tick=g.t|0;o.apply(g);
  for(const e of g.e||[]){if((e[0]|0)<=NET.seen)continue;NET.seen=e[0]|0;if(o.onFx)o.onFx(e[1],e.slice(2))}
  if(g.ph==='over'&&K.state!=='over'){K.winner=g.w||null;ranksCache=Array.isArray(g.rk)?g.rk:[];showOver()}}
 const _bc=R.broadcast;R.broadcast=(now,g,inGame)=>{if(!inGame&&R.host&&R.room){if(now-R.lastB<300)return;R.lastB=now;const ids=R.roster().map(p=>p.peer);
  R.room.presence({host:1,g:{ph:'lobby',r:ids,md:selMode,bs:S}}).catch(()=>{});
  if(now-R.lastL>1500&&R.lobby){R.lastL=now;R.lobby.presence({open:{gm:id,c:R.code,n:ids.length,ph:'lobby'}}).catch(()=>{})}return}_bc(now,g,inGame)};
 // ---- loop
 function step(){
  if(isClient()&&!K.demo){K.tick++;if(o.follow)o.follow();return}
  if(K.state==='play'||K.state==='ending'){K.tick++;o.step();if(K.state==='ending'&&--overT<=0){ranksCache=o.ranks();showOver()}}
  else if(o.idle)o.idle()}
 function frame(now){
  if(isClient()&&!K.demo&&K.state==='play'&&NET.myIdx>=0)clientSend(now);
  if(hostOnline()){const inGame=!K.demo&&K.state!=='menu';if(inGame)R.broadcast(now,snapshot(),true);else R.broadcast(now,null,false)}
  R.tick(now);
  if(K.tick%15===0&&!K.demo&&K.state==='play'){const s=(K.tick/60)|0;q('Info').innerHTML=(R.online?'Room <b>'+R.code+'</b> · ':'')+(isClient()&&NET.myIdx<0?'<b>Watching</b> · ':'')+(modes.length>1?'<b>'+modes[K.mode][0]+'</b> · ':'')+'Time <b>'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</b>'+(o.info?' · '+o.info():'')}
  ctx.setTransform(1,0,0,1,0,0);o.render(ctx,K.W,K.H);
  if(K.spectating()&&K.state==='play'){const f=K.seats[K.spec];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(K.W/2-70,K.H-38,140,16);
   ctx.font='7px "Russo One",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('👁 SPECTATING '+(f?f.name:'').toUpperCase(),K.W/2,K.H-30.5);
   ctx.fillStyle='#9ab';ctx.font='5px "Exo 2",sans-serif';ctx.fillText('◀ ▶ / click to switch player',K.W/2,K.H-24.5)}}
 q('Start').addEventListener('click',startLocal);
 q('Again').addEventListener('click',()=>{if(hostOnline()){toLobby();return}startLocal()});
 q('SetupBtn').addEventListener('click',()=>{if(R.online)R.leave();else toLobby()});
 q('Back').addEventListener('click',()=>{if(R.online)R.leave();RA.menu.show()});
 const SAVE=RA.save(id),ACH=RA.achievements(id,o.ach||[{id:'first',name:'First Match',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Rookie'},{id:'win1',name:'Champion',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Champ'}]);
 K.SAVE=SAVE;K.ACH=ACH;
 setMode(selMode);showS();setInterval(showS,500);R.init();
 if(o.kb)RA.legend(root,{kb:o.kb,pad:o.pad||[]});
 RA.register({id,name:o.name,kind:o.kind,players:o.players||'1-'+MAX+' players',ready:true,el:root,desc:o.desc,icon:o.icon,music:o.music,
  enter(){toLobby()},leave(){if(R.online)R.leave();K.state='menu';K.seats=[];document.body.classList.remove('playing','touchplay','mouseaim')},
  step,frame,onKey:usesKey,onQuit(){if(R.online)R.leave();else toLobby()}});
 K.startLocal=startLocal;K.startOnline=startOnline;K.snapshot=snapshot;K.applySnap=applySnap;K.step=step;K.setMode=setMode;K.NET=NET;K.toLobby=toLobby;
 K.setS=x=>{Object.assign(S,x);showS()};
 return K};
})();
