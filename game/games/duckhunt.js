/* QUACK HUNT for Retro Arena: up to 20 hunters over one pseudo-3D field. The mouse (or right stick) aims the crosshair, click / A fires.
   3 shells per wave. Ducks fly in from the grass at different depths; the dog pops up with your catch, and laughs at whoever is last.
   Modes: HUNT (everyone shoots CPU ducks, most points wins) · BE THE DUCK (each wave one player flies the duck with WASD and scores by
   escaping; everyone else hunts it) · CLAY (clay pigeons in pairs, quick shots).
   Quack Hunt items fly by as balloons; shoot one to get it:
    GOLDEN DUCK (worth 5x) · SHOTGUN (wide spread) · SLOW-MO (every duck flies slowly) · EXTRA SHELLS
    party: DECOY (a rival sees fake ducks that cost points) · FLASH (a rival's screen whites out) · DOG BLOCK (the dog stands in front of a rival).
   Your crosshair and shots run on your machine and you call your own hits, so there is no lag (RA.kit localFirst). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const FW=320,FH=240,GROUND=196;
const ITEMS=[null,{n:'GOLDEN DUCK',c:'#f8d040'},{n:'SHOTGUN',c:'#a07040'},{n:'SLOW-MO',c:'#80c0ff'},{n:'EXTRA SHELLS',c:'#f06040'},{n:'DECOY',c:'#ff70c0',party:1},{n:'FLASH',c:'#ffffff',party:1},{n:'DOG BLOCK',c:'#c08040',party:1}];
const DK=[{n:'BLACK',b:'#303030',w:'#605050',pts:500,sp:1},{n:'BLUE',b:'#3050a0',w:'#8090c0',pts:1000,sp:1.25},{n:'RED',b:'#a03020',w:'#d08060',pts:1500,sp:1.55}];
RA.audio.add('zapper',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.value=2400;g.gain.setValueAtTime(.4,now);g.gain.exponentialRampToValueAtTime(.001,now+.25);s.connect(f);f.connect(g);s.start();s.stop(now+.26)});
RA.audio.add('quack',(AC,now,g)=>{const o=AC.createOscillator(),f=AC.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(520,now);o.frequency.exponentialRampToValueAtTime(380,now+.12);f.type='bandpass';f.frequency.value=900;g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.14);o.connect(f);f.connect(g);o.start();o.stop(now+.15)});
RA.audio.add('laugh',(AC,now,g)=>{for(let k=0;k<4;k++){const o=AC.createOscillator(),v=AC.createGain();o.type='square';o.frequency.value=[392,330,392,330][k];v.gain.setValueAtTime(.04,now+k*.12);v.gain.exponentialRampToValueAtTime(.001,now+k*.12+.1);o.connect(v);v.connect(g);o.start(now+k*.12);o.stop(now+k*.12+.11)}});
const MUSIC=[T('Field Day',118,['C','F','G','C'],'k...s...k.k.s...','g5 - e5 c5 - e5 g5 - a5 - f5 c5 - f5 a5 - g5 - d5 b4 - d5 g5 - c6 - - - - - - -'),
 T('Open Season',140,['G','Em','C','D'],'k.hsk.hsk.hsk.hs','g4 b4 d5 g5 . d5 b4 . e4 g4 b4 e5 . b4 g4 . c5 e5 g5 c6 . g5 e5 . d5 f#5 a5 d6 . a5 f#5 .'),
 T('Duck Season',156,['Am','D','G','C'],'k.hhs.hhk.hhs.hk','a4 c5 e5 a5 e5 c5 a4 . d5 f#5 a5 d6 a5 f#5 d5 . g4 b4 d5 g5 d5 b4 g4 . c5 e5 g5 c6 - - - .'),
 T('Last Shell',172,['Em','C','B','Em'],'k.hsk.hsk.hsk.ss','e5 . g5 . b5 . e6 . c6 . g5 . e5 . c5 . b4 . d#5 . f#5 . b5 . e5 - - - . - - -')];
let waveHits=0,K,hunters=[],ducks=[],balloons=[],feathers=[],texts=[],wave=0,waveT=0,phase='fly',dog={st:'hide',t:0,who:-1,n:0},duckIdx=-1,slow=0,nextId=0,cross={};
function start(seats,md,S,seed){hunters=seats.map((s,i)=>({i,name:s.name,col:s.col,score:0,hits:0,shells:3,cx:FW/2,cy:FH/2,fx:{},shotSeq:0,shotLog:[],rSeen:0,mySeen:0,flash:0,escaped:0}));
 ducks=[];balloons=[];feathers=[];texts=[];wave=0;slow=0;dog={st:'hide',t:0};if(!K.isClient())newWave()}
function newWave(){wave++;waveT=0;phase='fly';dog={st:'hide',t:0,who:-1,n:0};waveHits=0;const S=K.S;for(const h of hunters){h.shells=3+(h.fx.extra?2:0);h.fx.extra=0}
 const n=K.mode===1?1:K.mode===2?2:Math.max(1,Math.min(10,Math.round(hunters.length*S.ducks/2)));ducks=[];
 if(K.mode===1){duckIdx=(wave-1)%hunters.length}else duckIdx=-1;
 for(let k=0;k<n;k++){const kind=K.mode===2?3:Math.min(2,Math.floor(Math.random()*(1+wave/3))),z=.65+Math.random()*.6;
  ducks.push({id:++nextId,k:kind,x:40+Math.random()*(FW-80),y:GROUND,z,vx:(Math.random()<.5?-1:1)*(.8+Math.random()*.6),vy:-1.2,st:'fly',t:0,own:K.S.steal==='off'?k%hunters.length:-1,gold:Math.random()<.05,
   pilot:K.mode===1?duckIdx:-1,clay:K.mode===2})}
 if(K.mode===2)ducks.forEach((d,k)=>{d.x=k?FW-10:10;d.vx=k?-2.6:2.6;d.vy=-2.8;d.y=GROUND-10;d.z=.8})
 if(K.mode===1)K.fx('t',FW/2,80,(hunters[duckIdx]||{}).name+' IS THE DUCK!','#f8d040');
 K.fx('w',wave)}
function duckSpeed(d){return(DK[Math.min(2,d.k)]||DK[0]).sp*(1+wave*.04)*(slow>0?.45:1)}
function stepDuck(d){if(d.st==='hit'){if(++d.t>24){d.st='fall';d.vy=0}return}
 if(d.st==='fall'){d.vy=Math.min(4,d.vy+.18);d.y+=d.vy;if(d.y>=GROUND){d.st='down';d.dead=true}return}
 if(d.st==='away'){d.y-=2.5;if(d.y<-30)d.dead=true;return}
 d.t++;
 if(d.clay){d.x+=d.vx;d.y+=d.vy;d.vy+=.045;if(d.y>GROUND+10||d.x<-20||d.x>FW+20)d.dead=true,d.missed=true;return}
 if(d.pilot>=0){const s=K.seats[d.pilot];if(s&&s.ctrl==='net'){const r=K.remote(d.pilot);if(r&&typeof r.dx==='number'){d.x=r.dx;d.y=r.dy;d.vx=r.dvx||d.vx}}else{flyDuck(d,K.inp(d.pilot))}
  if(d.t>60*12){d.st='away';const p=hunters[d.pilot];if(p){p.score+=3000;p.escaped++}K.fx('t',d.x,d.y,'ESCAPED!','#80ff80')}return}
 const sp=duckSpeed(d);if(d.t%50===0&&Math.random()<.6){const a=-Math.PI*(.15+Math.random()*.7);d.vx=Math.cos(a)*(Math.random()<.5?-1:1);d.vy=Math.sin(a)*(.6+Math.random()*.6)}
 d.x+=d.vx*sp;d.y+=d.vy*sp;if(d.x<10||d.x>FW-10)d.vx=-d.vx;if(d.y<16)d.vy=Math.abs(d.vy);if(d.y>GROUND-24&&d.t>40)d.vy=-Math.abs(d.vy);
 if(d.t>(K.S.time|0)*60){d.st='away';K.fx('s','quack')}}
function flyDuck(d,inp){const sp=2.2;let mx=(inp.right?1:0)-(inp.left?1:0),my=(inp.down?1:0)-(inp.up?1:0);d.x=Math.max(8,Math.min(FW-8,d.x+mx*sp));d.y=Math.max(10,Math.min(GROUND-20,d.y+my*sp));if(mx)d.vx=mx}
/* shots: the shooter decides the hit on their own screen and reports [seq, duckId, x, y] */
function shoot(h,x,y){if(h.shells<=0||phase!=='fly')return null;h.shells--;sfx('zapper');const spread=h.fx.shotgun>0?14:6;
 let hit=null;for(const d of ducks){if(d.st!=='fly'||d.pilot===h.i)continue;if(K.S.steal==='off'&&d.own>=0&&d.own!==h.i)continue;const r=spread*d.z+4;if(Math.hypot(d.x-x,d.y-y)<r){hit=d;break}}
 let bal=null;for(const b of balloons)if(Math.hypot(b.x-x,b.y-y)<10)bal=b;
 return[++h.shotSeq,hit?hit.id:0,Math.round(x),Math.round(y),bal?bal.id:0]}
function resolve(h,shot){const[,did,x,y,bid]=shot;K.fx('z',x,y,h.i);
 const d=ducks.find(o=>o.id===did&&o.st==='fly');if(d){d.st='hit';d.t=0;d.by=h.i;const p=(d.clay?800:(DK[d.k]||DK[0]).pts)*(d.gold||h.fx.gold>0?5:1);h.score+=p;h.hits++;waveHits++;K.fx('h',d.id,h.i,p);burst(d.x,d.y)}
 const b=balloons.find(o=>o.id===bid);if(b){b.dead=true;item(h,b.k)}}
function item(h,k){K.fx('t',h.cx,h.cy-10,ITEMS[k].n,ITEMS[k].c);sfx('pick');if(k===1)h.fx.gold=600;else if(k===2)h.fx.shotgun=900;else if(k===3)slow=420;else if(k===4){h.shells+=3;h.fx.extra=1}
 else{const rv=hunters.filter(o=>o!==h);if(!rv.length)return;const t=rv[Math.floor(Math.random()*rv.length)];if(k===5)t.fx.decoy=420;else if(k===6)t.fx.flash=90;else if(k===7)t.fx.dog=300;K.fx('t',FW/2,60,t.name+': '+ITEMS[k].n+'!',ITEMS[k].c)}}
function burst(x,y){for(let k=0;k<10;k++)feathers.push({x,y,vx:(Math.random()-.5)*2,vy:-Math.random()*1.5,t:50,r:Math.random()*6})}
function step(){waveT++;if(slow>0)slow--;
 for(const h of hunters){for(const k in h.fx)if(h.fx[k]>0&&k!=='extra')h.fx[k]--;const s=K.seats[h.i];
  if(s.ctrl==='net'){const r=K.remote(h.i);if(r){h.cx=r.cx;h.cy=r.cy;h.shells=r.sh|0;for(const e of r.sl||[])if((e[0]|0)>h.rSeen){h.rSeen=e[0]|0;resolve(h,e)}}continue}
  aimLocal(h);const inp=K.inp(h.i);if(inp.tap&&!(K.mode===1&&duckIdx===h.i)){const sh=shoot(h,h.cx,h.cy);if(sh)resolve(h,sh)}}
 for(const d of ducks)stepDuck(d);ducks=ducks.filter(d=>!d.dead||d.keep);
 for(const b of balloons){b.x+=b.vx;b.y+=Math.sin(K.tick*.05+b.id)*.3;if(b.x<-20||b.x>FW+20)b.dead=true}balloons=balloons.filter(b=>!b.dead);
 if(K.S.items!=='off'&&waveT%420===200&&!balloons.length){let k=1+Math.floor(Math.random()*4);if(K.S.items==='party'&&Math.random()<.45)k=5+Math.floor(Math.random()*3);const l=Math.random()<.5;balloons.push({id:++nextId,k,x:l?-10:FW+10,y:30+Math.random()*80,vx:l?.9:-.9})}
 fxStep();
 // wave over: everything shot, gone, or everyone out of shells
 const flying=ducks.filter(d=>d.st==='fly'),busy=ducks.some(d=>d.st==='hit'||d.st==='fall');
 if(phase==='fly'&&!busy&&(!flying.length||K.mode!==1&&hunters.every(h=>h.shells<=0||K.mode===1&&h.i===duckIdx))){
  for(const d of flying){d.st='away'}phase='dog';dog={st:'up',t:0,n:waveHits};
  const worst=hunters.slice().sort((a,b)=>a.score-b.score)[0];if(!dog.n||hunters.length>1&&Math.random()<.5){dog.laugh=1;dog.who=worst?worst.i:-1;sfx('laugh')}K.fx('d',dog.n,dog.laugh?dog.who:-1)}
 if(phase==='dog'&&++dog.t>110){if(wave>=K.S.waves){finish();return}newWave()}}
function finish(){const b=hunters.slice().sort((a,c)=>c.score-a.score)[0];K.end(b?{i:b.i}:null)}
function fxStep(){for(const f of feathers){f.x+=f.vx;f.y+=f.vy;f.vy+=.04;f.vx*=.98;f.r+=.1;f.t--}feathers=feathers.filter(f=>f.t>0);for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0)}
// crosshair: mouse anywhere over the field, or the right stick
let view={ox:0,oy:0,z:1};
function aimLocal(h){const{mouse}=RA.input;const s=K.seats[h.i];if(s&&s.ctrl==='mk'||s&&s.ctrl==='me'){if(mouse.on){h.cx=(mouse.fx*K.W-view.ox)/view.z;h.cy=(mouse.fy*K.H-view.oy)/view.z}}
 const p=RA.input.pad(s&&s.ctrl&&s.ctrl.startsWith('gp')?+s.ctrl[2]:0);if(Math.hypot(p.rx||0,p.ry||0)>.2){h.cx+=p.rx*4;h.cy+=p.ry*4}if(Math.hypot(p.ax||0,p.ay||0)>.2&&!(K.mode===1&&duckIdx===h.i)){h.cx+=p.ax*4;h.cy+=p.ay*4}
 h.cx=Math.max(0,Math.min(FW,h.cx));h.cy=Math.max(0,Math.min(FH,h.cy))}
// guest: my crosshair, my shots, and my duck when I am the duck
function local(i){const h=hunters[i];if(!h)return;for(const k in h.fx)if(h.fx[k]>0&&k!=='extra')h.fx[k]--;aimLocal(h);const inp=K.inp(i);
 if(inp.tap&&!(K.mode===1&&duckIdx===i)){const sh=shoot(h,h.cx,h.cy);if(sh){h.shotLog.push(sh);if(h.shotLog.length>6)h.shotLog.shift();K.fx('z',sh[2],sh[3],i)}}
 const d=ducks.find(o=>o.pilot===i&&o.st==='fly');if(d){d.own=1;flyDuck(d,inp)}}
function upload(i){const h=hunters[i];if(!h)return null;const d=ducks.find(o=>o.pilot===i&&o.st==='fly');const r={cx:Math.round(h.cx),cy:Math.round(h.cy),sh:h.shells,sl:h.shotLog.slice(-6)};if(d){r.dx=Math.round(d.x);r.dy=Math.round(d.y);r.dvx=d.vx}return r}
function snap(){return{wv:wave,dp:phase,di:duckIdx,sl:slow,dg:[dog.st==='up'?1:0,dog.n|0,dog.laugh?1:0,dog.who|0,dog.t|0],
 h:hunters.map(h=>[Math.round(h.cx),Math.round(h.cy),h.shells,h.score,h.hits,(h.fx.gold>0?1:0)|(h.fx.shotgun>0?2:0)|(h.fx.decoy>0?4:0)|(h.fx.flash>0?8:0)|(h.fx.dog>0?16:0)]),
 d:ducks.map(d=>[d.id,Math.round(d.x),Math.round(d.y),Math.round(d.z*100),d.k,['fly','hit','fall','away','down'].indexOf(d.st),d.vx<0?1:0,d.gold?1:0,d.pilot,d.own,d.by==null?-1:d.by]),
 b:balloons.map(b=>[b.id,Math.round(b.x),Math.round(b.y),b.k])}}
function apply(g){wave=g.wv|0;phase=g.dp||'fly';duckIdx=g.di|0;slow=g.sl|0;const dg=g.dg||[];dog.st=dg[0]?'up':'hide';dog.n=dg[1]|0;dog.laugh=!!dg[2];dog.who=dg[3]|0;dog.t=dg[4]|0;
 (g.h||[]).forEach((a,i)=>{const h=hunters[i];if(!h)return;if(i!==K.myIdx){h.tx=a[0];h.ty=a[1];h.shells=a[2]}else if(a[2]>h.shells&&phase==='fly'&&h.wave!==wave){h.shells=a[2];h.wave=wave}
  h.score=a[3]|0;h.hits=a[4]|0;const f=a[5]|0,fx={gold:f&1,shotgun:f&2,decoy:f&4,flash:f&8,dog:f&16};for(const k in fx)if(i!==K.myIdx||fx[k])h.fx[k]=fx[k]?Math.max(h.fx[k]|0,20):0});
 const old=new Map(ducks.map(d=>[d.id,d]));ducks=(g.d||[]).map(a=>{const o=old.get(a[0]);const mine=a[8]===K.myIdx&&o&&a[5]===0;
  const d={id:a[0],x:o&&!mine?o.x:a[1],y:o&&!mine?o.y:a[2],tx:a[1],ty:a[2],z:a[3]/100,k:a[4],st:['fly','hit','fall','away','down'][a[5]]||'fly',vx:a[6]?-1:1,gold:!!a[7],pilot:a[8],own:a[9],by:a[10]>=0?a[10]:null};if(mine){d.x=o.x;d.y=o.y;d.vx=o.vx}
  if(o&&o.st==='fly'&&d.st==='hit')burst(d.x,d.y);return d});
 balloons=(g.b||[]).map(a=>({id:a[0],x:a[1],y:a[2],k:a[3]}))}
function follow(){for(const d of ducks){if(d.pilot===K.myIdx&&d.st==='fly')continue;if(d.tx==null)continue;if(Math.abs(d.tx-d.x)>40||Math.abs(d.ty-d.y)>40){d.x=d.tx;d.y=d.ty}d.x+=(d.tx-d.x)*.35;d.y+=(d.ty-d.y)*.35}
 for(const h of hunters)if(h.i!==K.myIdx&&h.tx!=null){h.cx+=(h.tx-h.cx)*.4;h.cy+=(h.ty-h.cy)*.4}fxStep()}
let flashes=[];function onFx(k,a){if(k==='z'){if(a[2]!==K.myIdx)sfx('zapper');flashes.push({x:a[0],y:a[1],t:8,col:(hunters[a[2]]||{}).col||'#fff'})}else if(k==='t')texts.push({x:a[0],y:a[1],s:String(a[2]).slice(0,30),col:a[3],t:90});
 else if(k==='h'){const d=ducks.find(o=>o.id===a[0]);if(d)burst(d.x,d.y);const h=hunters[a[1]];if(h)texts.push({x:d?d.x:FW/2,y:d?d.y-10:80,s:String(a[2]),col:h.col,t:60})}else if(k==='d'&&a[1]>=0)sfx('laugh');else if(k==='s')sfx('quack')}
function bot(i){const h=hunters[i];if(!h)return{};if(K.mode===1&&duckIdx===i){const o={};const t=K.tick*.02+i;o[Math.sin(t)>0?'left':'right']=true;o[Math.cos(t*1.3)>0?'up':'down']=true;return o}
 const tg=ducks.filter(d=>d.st==='fly'&&d.pilot!==i&&(K.S.steal!=='off'||d.own<0||d.own===i)).sort((a,b)=>a.id-b.id)[0];if(!tg){return{}}
 const err=[16,7,2][K.cpu]||7;h.cx+=(tg.x+tg.vx*6+Math.sin(K.tick*.1+i)*err-h.cx)*.08;h.cy+=(tg.y+Math.cos(K.tick*.1+i)*err-h.cy)*.08;
 return Math.hypot(h.cx-tg.x,h.cy-tg.y)<err+4&&K.tick%[50,30,18][K.cpu]===0?{tap:true}:{}}
/* ---- drawing: pseudo-3D field, depth-scaled ducks, the dog */
let bgC=null;function bg(){if(bgC)return bgC;const c=document.createElement('canvas'),Q=3;c.width=FW*Q;c.height=FH*Q;const g=c.getContext('2d');g.scale(Q,Q);
 const sky=g.createLinearGradient(0,0,0,GROUND);sky.addColorStop(0,'#4aa0f8');sky.addColorStop(1,'#a8d8ff');g.fillStyle=sky;g.fillRect(0,0,FW,FH);
 for(const[cx,cy,r]of[[60,40,18],[90,36,22],[220,50,16],[248,46,20]]){const cg=g.createRadialGradient(cx,cy-4,2,cx,cy,r);cg.addColorStop(0,'#fff');cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.beginPath();g.arc(cx,cy,r,0,7);g.fill()}
 g.fillStyle='#5a9a40';g.beginPath();g.moveTo(0,GROUND-30);for(let x=0;x<=FW;x+=8)g.lineTo(x,GROUND-34+Math.sin(x*.05)*6);g.lineTo(FW,GROUND);g.lineTo(0,GROUND);g.fill();
 // the tree
 const tr=g.createLinearGradient(30,0,46,0);tr.addColorStop(0,'#5a3820');tr.addColorStop(.5,'#8a5a30');tr.addColorStop(1,'#4a2c18');g.fillStyle=tr;g.fillRect(34,GROUND-110,12,110);
 for(const[x,y,r]of[[40,GROUND-120,30],[22,GROUND-100,20],[60,GROUND-98,22]]){const lg=g.createRadialGradient(x-8,y-8,3,x,y,r);lg.addColorStop(0,'#90e060');lg.addColorStop(1,'#2a7020');g.fillStyle=lg;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 return bgC=c}
let fgC=null;function fg(){if(fgC)return fgC;const c=document.createElement('canvas'),Q=3;c.width=FW*Q;c.height=FH*Q;const g=c.getContext('2d');g.scale(Q,Q);
 const gr=g.createLinearGradient(0,GROUND-20,0,FH);gr.addColorStop(0,'#78c838');gr.addColorStop(1,'#3a7a18');g.fillStyle=gr;g.beginPath();g.moveTo(0,FH);for(let x=0;x<=FW;x+=6)g.lineTo(x,GROUND-14-Math.abs(Math.sin(x*.31))*16-Math.abs(Math.sin(x*.07))*10);g.lineTo(FW,FH);g.fill();
 const dt=g.createLinearGradient(0,GROUND+8,0,FH);dt.addColorStop(0,'#a07040');dt.addColorStop(1,'#5a3818');g.fillStyle=dt;g.fillRect(0,GROUND+10,FW,FH);
 g.fillStyle='rgba(0,0,0,.15)';for(let k=0;k<60;k++)g.fillRect((k*53)%FW,GROUND+14+(k*31)%30,3,1.5);return fgC=c}
function drawDuck(g,d){const s=d.z*(d.k===3?.7:1),x=d.x,y=d.y;if(d.clay){g.save();g.translate(x,y);const cg=g.createRadialGradient(-1,-1,.5,0,0,5);cg.addColorStop(0,'#ffd0a0');cg.addColorStop(1,'#c05020');g.fillStyle=cg;g.beginPath();g.ellipse(0,0,5*s,2.4*s,K.tick*.2,0,7);g.fill();g.restore();return}
 const A=DK[d.k]||DK[0],fl=(K.tick>>2)&1,dir=d.vx<0?-1:1;g.save();g.translate(x,y);g.scale(dir*s,s);
 if(d.st==='hit'){g.fillStyle=A.b;g.beginPath();g.ellipse(0,0,8,6,0,0,7);g.fill();g.fillStyle='#209040';g.beginPath();g.arc(6,-6,4,0,7);g.fill();g.fillStyle='#fff';g.fillRect(5,-8,3,3);g.restore();return}
 if(d.st==='fall'){g.rotate(Math.PI/2);g.scale(1,(K.tick>>2)&1?1:-1)}
 const body=g.createLinearGradient(0,-6,0,6);body.addColorStop(0,d.gold?'#fff0a0':RA.util.mix(A.b,'#ffffff',.3));body.addColorStop(1,d.gold?'#c09010':RA.util.mix(A.b,'#000000',.3));g.fillStyle=body;g.beginPath();g.ellipse(0,0,9,5,0,0,7);g.fill();
 g.fillStyle=d.gold?'#f8d040':A.w;g.beginPath();g.moveTo(-2,-1);g.lineTo(fl?-10:-6,fl?-12:8);g.lineTo(4,-1);g.closePath();g.fill();
 const hg=g.createRadialGradient(8,-6,.5,9,-5,4.5);hg.addColorStop(0,'#50e080');hg.addColorStop(1,'#106030');g.fillStyle=d.gold?'#f8e070':hg;g.beginPath();g.arc(9,-5,4,0,7);g.fill();
 g.fillStyle='#fff';g.fillRect(7,-3,4,1);g.fillStyle='#f8b020';g.beginPath();g.moveTo(12,-5);g.lineTo(16,-4);g.lineTo(12,-3);g.fill();g.fillStyle='#000';g.fillRect(9.5,-6.5,1.4,1.4);
 g.restore();if(d.pilot>=0&&hunters[d.pilot])RA.gfx.text(g,hunters[d.pilot].name,x,y-14,hunters[d.pilot].col);if(d.own>=0&&K.S.steal==='off'&&hunters[d.own]){g.strokeStyle=hunters[d.own].col;g.lineWidth=.8;g.beginPath();g.arc(x,y,12*s,0,7);g.stroke()}}
function drawDog(g){if(dog.st!=='up')return;const t=dog.t,up=Math.min(1,t/20)-Math.max(0,(t-90)/20),x=FW/2,y=GROUND+8-up*40;
 const fur=g.createLinearGradient(x-12,y-30,x+12,y);fur.addColorStop(0,'#e0a060');fur.addColorStop(1,'#8a5020');g.fillStyle=fur;g.beginPath();g.ellipse(x,y-12,11,15,0,0,7);g.fill();
 g.fillStyle='#fff3e0';g.beginPath();g.ellipse(x,y-6,7,9,0,0,7);g.fill();g.fillStyle='#4a2810';g.beginPath();g.ellipse(x-11,y-20,4,9,.3,0,7);g.ellipse(x+11,y-20,4,9,-.3,0,7);g.fill();
 g.fillStyle='#000';g.beginPath();g.arc(x,y-14,2.4,0,7);g.fill();g.fillRect(x-5,y-22,2,2.4);g.fillRect(x+3,y-22,2,2.4);
 if(dog.laugh){g.fillStyle='#600';g.beginPath();g.ellipse(x,y-8,4,(t>>3)&1?3:1.5,0,0,7);g.fill();const w=hunters[dog.who];if(w&&hunters.length>1)RA.gfx.text(g,'HA HA '+w.name,x,y-46,w.col)}
 else for(let k=0;k<Math.min(3,dog.n);k++){g.fillStyle='#209040';g.beginPath();g.arc(x-12+k*12,y-30,4,0,7);g.fill();g.fillStyle='#303030';g.beginPath();g.ellipse(x-12+k*12,y-24,4,3,0,0,7);g.fill()}}
function render(g,Wv,Hv){const z=Math.min(Wv/FW,Hv/FH),ox=(Wv-FW*z)/2,oy=(Hv-FH*z)/2;view={ox,oy,z};const sk=g.createLinearGradient(0,oy,0,oy+GROUND*z);sk.addColorStop(0,'#4aa0f8');sk.addColorStop(1,'#a8d8ff');g.fillStyle=sk;g.fillRect(0,0,Wv,Hv);g.fillStyle='#4a9a28';g.fillRect(0,oy+(GROUND-24)*z,Wv,Hv);g.fillStyle='#7a5028';g.fillRect(0,oy+(GROUND+10)*z,Wv,Hv);
 g.save();g.translate(ox,oy);g.scale(z,z);g.imageSmoothingEnabled=true;g.drawImage(bg(),0,0,FW,FH);
 const me=hunters[K.myIdx>=0?K.myIdx:K.focus()[0]];
 if(me&&me.fx.decoy>0)for(let k=0;k<3;k++){const dx=(K.tick*.8+k*110)%(FW+40)-20;drawDuck(g,{x:dx,y:50+k*30+Math.sin(K.tick*.05+k)*10,z:.9,k:0,vx:1,st:'fly'})}
 for(const d of ducks)if(d.st!=='down')drawDuck(g,d);
 for(const b of balloons){const it=ITEMS[b.k];g.strokeStyle='#666';g.lineWidth=.5;g.beginPath();g.moveTo(b.x,b.y+8);g.lineTo(b.x,b.y+20);g.stroke();const bg2=g.createRadialGradient(b.x-2,b.y-3,.5,b.x,b.y,8);bg2.addColorStop(0,'#fff');bg2.addColorStop(.35,it.c);bg2.addColorStop(1,RA.util.mix(it.c,'#000000',.45));g.fillStyle=bg2;g.beginPath();g.ellipse(b.x,b.y,7,8.5,0,0,7);g.fill()}
 drawDog(g);g.drawImage(fg(),0,0,FW,FH);
 for(const f of feathers){g.fillStyle='rgba(255,255,255,.85)';g.save();g.translate(f.x,f.y);g.rotate(f.r);g.fillRect(-2,-.6,4,1.2);g.restore()}
 for(const f of flashes){g.globalAlpha=f.t/8;g.strokeStyle=f.col;g.lineWidth=1.5;g.beginPath();g.arc(f.x,f.y,10-f.t,0,7);g.stroke();f.t--}flashes=flashes.filter(f=>f.t>0);g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,t.x,t.y,t.col);
 // crosshairs: everyone's, mine on top
 for(const h of hunters){if(K.mode===1&&h.i===duckIdx)continue;const mine=me===h,r=mine?7:5;g.strokeStyle=h.col;g.lineWidth=mine?1.4:.8;g.globalAlpha=mine?1:.6;g.beginPath();g.arc(h.cx,h.cy,r,0,7);g.moveTo(h.cx-r-3,h.cy);g.lineTo(h.cx-r+2,h.cy);g.moveTo(h.cx+r-2,h.cy);g.lineTo(h.cx+r+3,h.cy);g.moveTo(h.cx,h.cy-r-3);g.lineTo(h.cx,h.cy-r+2);g.moveTo(h.cx,h.cy+r-2);g.lineTo(h.cx,h.cy+r+3);g.stroke();
  if(!mine&&hunters.length>1){g.font='5px "Russo One",sans-serif';g.textAlign='center';g.fillStyle=h.col;g.fillText(h.name,h.cx,h.cy+r+8)}}g.globalAlpha=1;
 if(me&&me.fx.dog>0){g.save();g.translate(FW/2,FH*.55);g.scale(3,3);const ks=dog.st,kt=dog.t,kl=dog.laugh;dog.st='up';dog.t=40;dog.laugh=1;drawDog(g);dog.st=ks;dog.t=kt;dog.laugh=kl;g.restore()}
 g.restore();
 if(me&&me.fx.flash>0){g.fillStyle=`rgba(255,255,255,${Math.min(1,me.fx.flash/40)})`;g.fillRect(0,0,Wv,Hv)}
 // HUD: shells, wave, scores
 g.font='7px "Russo One",sans-serif';g.textAlign='left';g.fillStyle='#fff';if(!K.demo){g.fillText('ROUND '+wave+' / '+K.S.waves+(slow>0?'  · SLOW-MO':''),8,34);if(me&&!(K.mode===1&&duckIdx===me.i))g.fillText('SHOT '+'▮'.repeat(Math.max(0,me.shells)),8,Hv-34);
  if(K.mode===1&&me&&duckIdx===me.i){g.textAlign='center';g.fillText("YOU'RE THE DUCK! FLY WITH WASD",Wv/2,46)}}
 const list=hunters.slice().sort((a,b)=>b.score-a.score).slice(0,8);g.font='6px "Russo One",sans-serif';
 list.forEach((h,k)=>{const y=30+k*8;g.textAlign='left';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(Wv-90,y-6,86,7.5);g.fillStyle=h.col;g.fillRect(Wv-89,y-5,4,5);g.fillStyle='#fff';g.fillText((h.name||'').slice(0,12),Wv-83,y);g.textAlign='right';g.fillText(h.score,Wv-7,y)})}
K=RA.kit({id:'duckhunt',name:'QUACK HUNT',kind:'Light gun',players:'1-20 players',demo:4,localFirst:true,
 desc:'Up to 20 hunters over one pseudo-3D field: shoot the ducks, take turns being the duck, or blast clay pigeons. The dog laughs at whoever is last. Quack Hunt items fly by on balloons.',
 blurb:'Aim with the mouse, click to fire. 3 shells a round. In BE THE DUCK, one player flies the duck with WASD and everyone else hunts it.',
 howto:'Mouse aims the Sharpshot, click fires (3 shells a round). As the duck: WASD flies. Gamepad: right stick aims, A fires, left stick flies the duck.',
 icon:['..........','...gg.....','..gggw....','..kkkkkk..','.kbbbbbk..','kbbwbbbk..','.kbbbbk...','..kkkk....','....rr....','...rrrr...'],
 music:MUSIC,fireLabel:'FIRE',
 modes:[['HUNT','Everyone shoots CPU ducks. Most points wins.'],['BE THE DUCK','Each round one player is the duck. Escape for big points.'],['CLAY','Clay pigeons in pairs: quick shots.']],
 settings:[['waves','Rounds',[[10,'10'],[5,'5'],[20,'20']]],['ducks','Ducks per round',[[1,'Normal'],[2,'Lots'],[.5,'Few']]],['steal','Steal shots',[['on','Anyone can hit any duck'],['off','Your own ducks only']]],
  ['time','Duck flight time',[[420,'7 s'],[300,'5 s'],[600,'10 s']]],['items','Items',[['on','Quack Hunt items'],['party','Wild party'],['off','Off']]]],
 kb:[['MOUSE','aim'],['LMB','fire'],['W A S D','fly (duck)'],['C','chat'],['ESC','menu']],pad:[['RS','aim'],['A','fire'],['LS','fly (duck)'],['BACK','chat'],['START','menu']],
 aim:()=>null,
 ach:[{id:'first',name:'Sharpshot',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Zapper'},{id:'win1',name:'Sharpshooter',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Sharpshooter'},
  {id:'h20',name:'Duck Season',desc:'Hit 20 ducks in one match',test:(s,m)=>m.kills>=20,unlock:'title:Duck Season'},{id:'esc',name:'Duck Escape',desc:'Escape as the duck',test:(s,m)=>m.escaped>=1,unlock:'title:Wabbit Season'}],
 alive:i=>!!hunters[i],start,step,local,upload,follow,snap,apply,render,bot,onFx,
 ranks:()=>hunters.slice().sort((a,b)=>b.score-a.score).map(h=>[h.name,h.col,h.score+' · '+h.hits+' hits']),
 result:(i,w)=>{const h=hunters[i];return{won:!!w&&w.i===i,kills:h.hits,escaped:h.escaped,bestScore:h.score}}});
window.__dh={get hunters(){return hunters},get ducks(){return ducks},K,P:()=>hunters[1]?Math.round(hunters[1].cx):0};
})();
