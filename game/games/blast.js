/* BLAST MAZE for Retro Arena: the classic bomb-maze battle for up to 20 bombers, top-down tiles with raised blocks (2.5D).
   WASD moves, Space / click drops a bomb, E / right-click uses your glove (throw) or remote. Blow up soft blocks for items:
    BOMB UP · FIRE UP · SKATE · KICK (walk into a bomb to send it sliding) · POWER GLOVE (pick up and throw) · FULL FIRE
    PIERCE BOMB (flames go through blocks) · REMOTE (E detonates your oldest bomb) · SKULL (party: a random curse that spreads on touch)
    LOUIE EGG (party: ride a kangaroo, one free hit).
   Out of the round? Ride the edge in a revenge cart and lob bombs in; knock someone out and you are back in (host setting).
   Modes: BATTLE (last bomber standing wins the round), TEAMS (red vs blue), CO-OP (clear the maze of balloon creeps together).
   Rounds: first to N round wins. When time runs low the arena closes in with falling blocks (sudden death). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const TS=16,FUSE=150,FLAME=28;
const ITEMS=[null,{n:'BOMB UP',c:'#303040',s:'B'},{n:'FIRE UP',c:'#f86020',s:'F'},{n:'SKATE',c:'#30a0f8',s:'S'},{n:'KICK',c:'#a060f0',s:'K'},{n:'POWER GLOVE',c:'#f0c030',s:'G'},
 {n:'FULL FIRE',c:'#f02020',s:'!'},{n:'PIERCE BOMB',c:'#20c0a0',s:'P'},{n:'REMOTE',c:'#e0e0f0',s:'R'},{n:'SKULL',c:'#c0c0c0',s:'☠',party:1},{n:'LOUIE EGG',c:'#f8e8c0',s:'L',party:1}];
const CURSES=['SLOW','FAST','REVERSE','TINY FIRE','DIARRHEA','NO BOMBS'];
RA.audio.add('bput',(AC,now,g)=>{const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(240,now);o.frequency.exponentialRampToValueAtTime(120,now+.08);g.gain.setValueAtTime(.2,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start();o.stop(now+.11)});
RA.audio.add('kaboom',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.setValueAtTime(1800,now);f.frequency.exponentialRampToValueAtTime(120,now+.5);
 g.gain.setValueAtTime(.5,now);g.gain.exponentialRampToValueAtTime(.001,now+.55);s.connect(f);f.connect(g);s.start();s.stop(now+.56)});
const MUSIC=[T('Fuse Lit',112,['C','Am','F','G'],'k...s...k.k.s...','c5 - e5 g5 - e5 c5 - a4 - c5 e5 - c5 a4 - f4 - a4 c5 - a4 f4 - g4 - b4 d5 - g5 - - -'),
 T('Battle Stage',144,['F','Dm','Bb','C'],'k.hsk.hsk.hsk.hs','f5 . a5 . c6 . a5 f5 . d5 . f5 . a5 . bb4 . d5 . f5 . bb5 . c5 . e5 . g5 . c6 . e6 - - .'),
 T('Kick It',156,['Am','G','F','E'],'k.hhs.hhk.hhs.hk','a4 c5 e5 a5 g5 e5 c5 . g4 b4 d5 g5 f5 d5 b4 . f4 a4 c5 f5 e5 c5 a4 . e4 g#4 b4 e5 g#5 - - .'),
 T('Hurry Up',176,['Dm','Bb','C','A'],'k.hsk.hsk.hsk.ss','d5 d5 f5 . a5 . d6 . c6 . bb5 . a5 . f5 . bb4 bb4 d5 . f5 . bb5 . a5 . g5 . e5 . c#5 . a4 - c#5 - e5 - a5 -')];
let K,W=15,H=13,map=new Uint8Array(W*H),items=new Uint8Array(W*H),men=[],bombs=[],flames=[],creeps=[],parts=[],texts=[],round=0,roundT=0,roundOver=0,hurry=0,hurryI=0,spiral=[],bombId=0;
const at=(x,y)=>y*W+x,inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const teamOf=i=>K.mode===1?i%2:K.mode===2?0:i,TEAMC=['#f04848','#4890f8'],TEAMN=['Red team','Blue team'];
// map: 0 floor, 1 hard pillar, 2 soft block, 3 falling-block wall
function buildMap(n,seed){const rr=RA.util.mulberry(seed),sz=K.S.size==='auto'?(n<=4?0:n<=8?1:2):+K.S.size;
 W=[15,21,31][sz]+(sz===2&&n>14?6:0);H=[13,17,23][sz]+(sz===2&&n>14?4:0);map=new Uint8Array(W*H);items=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x===0||y===0||x===W-1||y===H-1||(x%2===0&&y%2===0))map[at(x,y)]=1;else if(rr()<.72)map[at(x,y)]=2}
 const sp=spawns(n);for(const[x,y]of sp)for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1],[2,0],[0,2],[-2,0],[0,-2]]){const xx=x+dx,yy=y+dy;if(inside(xx,yy)&&map[at(xx,yy)]===2)map[at(xx,yy)]=0}
 const pool=[1,1,1,1,2,2,2,2,3,3,4,5,6,7,8];if(K.S.items==='party')pool.push(9,9,10,10,4,5);
 for(let i=0;i<W*H;i++)if(map[i]===2&&K.S.items!=='off'&&rr()<.3)items[i]=pool[Math.floor(rr()*pool.length)];
 // sudden-death spiral, outside in
 spiral=[];let x0=1,y0=1,x1=W-2,y1=H-2;while(x0<=x1&&y0<=y1){for(let x=x0;x<=x1;x++)spiral.push([x,y0]);for(let y=y0+1;y<=y1;y++)spiral.push([x1,y]);
  if(y1>y0)for(let x=x1-1;x>=x0;x--)spiral.push([x,y1]);if(x1>x0)for(let y=y1-1;y>y0;y--)spiral.push([x0,y]);x0++;y0++;x1--;y1--}return sp}
function spawns(n){const c=[[1,1],[W-2,H-2],[W-2,1],[1,H-2]],out=[];for(const p of c)out.push(p);
 const ring=[];for(let x=3;x<W-3;x+=2){ring.push([x,1]);ring.push([x,H-2])}for(let y=3;y<H-3;y+=2){ring.push([1,y]);ring.push([W-2,y])}
 ring.sort((a,b)=>Math.atan2(a[1]-H/2,a[0]-W/2)-Math.atan2(b[1]-H/2,b[0]-W/2));
 const step=Math.max(1,ring.length/Math.max(1,n-4));for(let k=0;out.length<n&&k<ring.length;k++)out.push(ring[Math.floor(k*step)%ring.length]);
 while(out.length<n)out.push([1+2*Math.floor(Math.random()*((W-1)/2)),1]);
 // inner pockets when the ring is full
 return out.slice(0,n)}
function newRound(){const sp=buildMap(men.length,K.seed+round*7919);bombs=[];flames=[];parts=[];texts=[];creeps=[];hurry=0;hurryI=0;roundT=0;roundOver=0;
 men.forEach((m,i)=>Object.assign(m,{x:sp[i][0]*TS+8,y:sp[i][1]*TS+8,alive:true,ghost:false,bombs:1,fire:2,speed:1,kick:false,glove:false,pierce:false,remote:false,curse:0,curseT:0,louie:false,inv:120,dir:2,carry:null,gx:0,cart:0}));
 if(K.mode===2){const n=Math.min(20,4+men.length*2+round*2);for(let k=0;k<n;k++){for(let t=0;t<100;t++){const x=1+Math.floor(Math.random()*(W-2)),y=1+Math.floor(Math.random()*(H-2));
   if(map[at(x,y)]===0&&!sp.some(p=>Math.abs(p[0]-x)+Math.abs(p[1]-y)<5)){creeps.push({x:x*TS+8,y:y*TS+8,d:Math.floor(Math.random()*4),hp:k%5===4?2:1,t:0});break}}}}
 round++;K.fx('r',round)}
function start(seats,md,S,seed){lastCoop=null;men=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,wins:0,kills:0,ko:0}));round=0;if(K.isClient()){buildMap(seats.length,seed);return}newRound()}
/* ---- movement with corner assist, like the original */
const DX=[0,1,0,-1],DY=[-1,0,1,0];
const solidAt=(tx,ty,m)=>{if(!inside(tx,ty))return true;const v=map[at(tx,ty)];if(v)return true;const b=bombs.find(b=>b.tx===tx&&b.ty===ty&&!b.air);
 if(b&&m){const mx=Math.floor(m.x/TS),my=Math.floor(m.y/TS);if(b.tx===mx&&b.ty===my)return false;return true}return!!b};
function move(m,d,sp){const tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS),cx=tx*TS+8,cy=ty*TS+8;m.dir=d;
 if(DX[d]){if(Math.abs(m.y-cy)>1){m.y+=Math.sign(cy-m.y)*Math.min(sp,Math.abs(cy-m.y));if(solidAt(tx+DX[d],ty,m))return;return}m.y=cy;
  const nx=m.x+DX[d]*sp,edge=Math.floor((nx+DX[d]*7)/TS);if(edge!==tx&&solidAt(edge,ty,m)){if(m.kick&&tryKick(edge,ty,d))return;m.x=cx;return}m.x=nx}
 else{if(Math.abs(m.x-cx)>1){m.x+=Math.sign(cx-m.x)*Math.min(sp,Math.abs(cx-m.x));return}m.x=cx;
  const ny=m.y+DY[d]*sp,edge=Math.floor((ny+DY[d]*7)/TS);if(edge!==ty&&solidAt(tx,edge,m)){if(m.kick&&tryKick(tx,edge,d))return;m.y=cy;return}m.y=ny}}
function tryKick(tx,ty,d){const b=bombs.find(b=>b.tx===tx&&b.ty===ty&&!b.air&&!b.slide);if(!b)return false;b.slide=d;sfx('sel');return true}
function dropBomb(m){const tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS);if(map[at(tx,ty)]||bombs.some(b=>b.tx===tx&&b.ty===ty))return;
 if(bombs.filter(b=>b.own===m.i).length>=m.bombs||m.curse===6)return;
 bombs.push({id:++bombId,tx,ty,own:m.i,fire:m.curse===4?1:m.fire,pierce:m.pierce,t:m.remote?99999:FUSE,slide:-1,air:0});sfx('bput')}
function throwBomb(m){const tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS),b=bombs.find(b=>b.tx===tx&&b.ty===ty&&!b.air);if(!b)return false;
 launch(b,m.dir,3);return true}
function launch(b,d,dist){b.air=1;b.ad=d;b.fx=b.tx*TS+8;b.fy=b.ty*TS+8;let tx=b.tx,ty=b.ty;for(let k=0;k<dist;k++){tx+=DX[d];ty+=DY[d]}
 b.gx=tx;b.gy=ty;b.at=0;b.al=24;b.slide=-1;if(b.t<40)b.t=40}
function land(b){let tx=b.gx,ty=b.gy;// wraps round the arena and bounces off blocks until it finds floor
 for(let k=0;k<40;k++){tx=((tx-1)%(W-2)+(W-2))%(W-2)+1;ty=((ty-1)%(H-2)+(H-2))%(H-2)+1;if(!map[at(tx,ty)]&&!bombs.some(o=>o!==b&&!o.air&&o.tx===tx&&o.ty===ty))break;tx+=DX[b.ad];ty+=DY[b.ad]}
 b.tx=tx;b.ty=ty;b.air=0;sfx('bput');
 for(const m of men)if(m.alive&&Math.floor(m.x/TS)===tx&&Math.floor(m.y/TS)===ty){m.stun=40}}
/* ---- explosions */
function explode(b){if(b.done)return;b.done=true;sfx('kaboom');shake=4;K.fx('b',b.tx,b.ty);addFlame(b.tx,b.ty,b.own,'c');
 for(let d=0;d<4;d++)for(let k=1;k<=b.fire;k++){const x=b.tx+DX[d]*k,y=b.ty+DY[d]*k;if(!inside(x,y))break;const v=map[at(x,y)];
  if(v===1||v===3)break;
  const ob=bombs.find(o=>!o.done&&!o.air&&o.tx===x&&o.ty===y);if(ob){ob.t=Math.min(ob.t,3);}
  if(v===2){map[at(x,y)]=0;burstBlock(x,y);addFlame(x,y,b.own,'e',1);if(!b.pierce)break;continue}
  if(items[at(x,y)]&&!map[at(x,y)]){items[at(x,y)]=0;addFlame(x,y,b.own,k===b.fire?'e':'m');if(!b.pierce)break;continue}
  addFlame(x,y,b.own,k===b.fire?'e':DX[d]?'h':'v')}}
function addFlame(x,y,own,k,blk){flames.push({x,y,own,t:FLAME,k,blk:blk|0})}
function burstBlock(x,y){for(let i=0;i<5;i++)parts.push({x:x*TS+8,y:y*TS+8,vx:(Math.random()-.5)*2.5,vy:(Math.random()-.5)*2.5,z:4,vz:Math.random()*2,t:28,col:i%2?'#b08050':'#806040'})}
function killMan(m,by){if(!m.alive||m.inv>0)return;if(m.louie){m.louie=false;m.inv=90;say(m,'LOUIE!','#f8e8c0');return}
 m.alive=false;m.dead=40;sfx('boom');K.fx('k',m.i);for(let i=0;i<10;i++)parts.push({x:m.x,y:m.y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,z:6,vz:Math.random()*3,t:36,col:i%2?m.col:'#fff'});
 if(by!=null&&by!==m.i&&men[by]){men[by].kills++;if(!men[by].alive&&men[by].ghost&&K.S.revenge==='on'){revive(men[by])}}
 m.ko++;
 // drop what you had, scattered over the floor
 const lost=[[1,m.bombs-1],[2,m.fire-2],[3,m.speed-1],[4,m.kick?1:0],[5,m.glove?1:0]];
 for(const[k,n]of lost)for(let q=0;q<Math.min(n,3);q++){for(let t=0;t<30;t++){const x=1+Math.floor(Math.random()*(W-2)),y=1+Math.floor(Math.random()*(H-2));if(!map[at(x,y)]&&!items[at(x,y)]){items[at(x,y)]=k;break}}}}
function revive(m){const tx=Math.max(1,Math.min(W-2,Math.floor(m.x/TS))),ty=Math.max(1,Math.min(H-2,Math.floor(m.y/TS)));
 let best=null;for(let r=0;r<6&&!best;r++)for(let y=ty-r;y<=ty+r&&!best;y++)for(let x=tx-r;x<=tx+r;x++)if(inside(x,y)&&!map[at(x,y)]&&!flames.some(f=>f.x===x&&f.y===y)){best=[x,y];break}
 if(!best)return;Object.assign(m,{alive:true,ghost:false,x:best[0]*TS+8,y:best[1]*TS+8,inv:120});say(m,'REVENGE!','#f8d040')}
function say(m,s,col){texts.push({x:m.x,y:m.y-14,s,col,t:60});K.fx('x',Math.round(m.x),Math.round(m.y-14),s,col)}
function pick(m,k){const n=ITEMS[k].n;say(m,n,ITEMS[k].c);sfx('pick');
 if(k===1)m.bombs=Math.min(10,m.bombs+1);else if(k===2)m.fire=Math.min(12,m.fire+1);else if(k===3)m.speed=Math.min(6,m.speed+1);else if(k===4)m.kick=true;else if(k===5)m.glove=true;
 else if(k===6)m.fire=12;else if(k===7)m.pierce=true;else if(k===8)m.remote=true;else if(k===9){m.curse=1+Math.floor(Math.random()*6);m.curseT=600;say(m,CURSES[m.curse-1],'#c0c0c0')}else if(k===10)m.louie=true}
/* ---- the step */
function step(){const S=K.S;roundT++;
 if(roundOver){if(--roundOver===0){const best=Math.max(...men.map(m=>m.wins));if(best>=S.rounds||K.mode===2&&lastCoop!=null){finish();return}newRound()}fxStep();return}
 for(const m of men){
  if(m.inv>0)m.inv--;if(m.stun>0){m.stun--;continue}
  if(!m.alive){if(m.dead>0){m.dead--;if(!m.dead&&S.revenge==='on'&&K.mode!==2){m.ghost=true;m.gx=Math.random()*perim()}}if(m.ghost)ghostStep(m);continue}
  const inp=K.inp(m.i);let d=-1;if(inp.up)d=0;else if(inp.down)d=2;else if(inp.left)d=3;else if(inp.right)d=1;
  if(m.curse===3&&d>=0)d=(d+2)%4;
  const sp=m.curse===1?.6:m.curse===2?3.2:.9+m.speed*.22;if(d>=0)move(m,d,sp),m.walk=(m.walk||0)+sp;
  if(inp.tap||m.curse===5&&roundT%20===0)dropBomb(m);
  if(inp.alt&&!m.altPrev){if(m.remote){const b=bombs.filter(b=>b.own===m.i&&!b.air).sort((a,c)=>a.id-c.id)[0];if(b)b.t=1}else if(m.glove)throwBomb(m)}m.altPrev=inp.alt;
  if(m.curseT>0&&--m.curseT===0)m.curse=0;
  const tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS);const it=items[at(tx,ty)];if(it&&!map[at(tx,ty)]){items[at(tx,ty)]=0;pick(m,it)}
  if(m.curse)for(const o of men)if(o!==m&&o.alive&&!o.curse&&Math.hypot(o.x-m.x,o.y-m.y)<12){o.curse=m.curse;o.curseT=m.curseT;say(o,'CURSED','#c0c0c0')}}
 for(const b of bombs){
  if(b.air){b.at++;const p=b.at/b.al,tx=b.gx*TS+8,ty=b.gy*TS+8;b.px=b.fx+(tx-b.fx)*p;b.py=b.fy+(ty-b.fy)*p;if(b.at>=b.al)land(b);continue}
  if(b.slide>=0&&roundT%3===0){const nx=b.tx+DX[b.slide],ny=b.ty+DY[b.slide];
   if(!inside(nx,ny)||map[at(nx,ny)]||bombs.some(o=>o!==b&&!o.air&&o.tx===nx&&o.ty===ny)||men.some(m=>m.alive&&Math.floor(m.x/TS)===nx&&Math.floor(m.y/TS)===ny))b.slide=-1;else{b.tx=nx;b.ty=ny}}
  if(--b.t<=0)explode(b)}
 bombs=bombs.filter(b=>!b.done);
 for(const f of flames){f.t--;for(const m of men)if(m.alive&&Math.floor(m.x/TS)===f.x&&Math.floor(m.y/TS)===f.y)killMan(m,f.own);
  for(const c of creeps)if(!c.dead&&Math.floor(c.x/TS)===f.x&&Math.floor(c.y/TS)===f.y&&!c.hit){c.hit=20;if(--c.hp<=0){c.dead=true;if(men[f.own])men[f.own].kills++;K.fx('c',Math.round(c.x),Math.round(c.y))}}}
 flames=flames.filter(f=>f.t>0);
 for(const c of creeps){if(c.dead)continue;if(c.hit)c.hit--;const sp=.5;const tx=Math.floor(c.x/TS),ty=Math.floor(c.y/TS),cx=tx*TS+8,cy=ty*TS+8;
  if(Math.abs(c.x-cx)<sp&&Math.abs(c.y-cy)<sp){c.x=cx;c.y=cy;const ok=[0,1,2,3].filter(d=>!solidAt(tx+DX[d],ty+DY[d]));if(!ok.includes(c.d)||Math.random()<.15)c.d=ok.length?ok[Math.floor(Math.random()*ok.length)]:c.d}
  if(!solidAt(Math.floor((c.x+DX[c.d]*8)/TS),Math.floor((c.y+DY[c.d]*8)/TS))||(Math.abs(c.x-cx)>sp||Math.abs(c.y-cy)>sp)){c.x+=DX[c.d]*sp;c.y+=DY[c.d]*sp}
  for(const m of men)if(m.alive&&Math.hypot(m.x-c.x,m.y-c.y)<10)killMan(m,null)}
 creeps=creeps.filter(c=>!c.dead);
 // hurry up: falling blocks
 const lim=S.len*3600;if(lim&&roundT>lim-1800&&!hurry){hurry=1;K.track(3);K.fx('h')}
 if(hurry&&roundT>lim-1500&&roundT%8===0&&hurryI<spiral.length-4){const[x,y]=spiral[hurryI++];map[at(x,y)]=3;items[at(x,y)]=0;bombs=bombs.filter(b=>!(b.tx===x&&b.ty===y));
  for(const m of men)if(m.alive&&Math.floor(m.x/TS)===x&&Math.floor(m.y/TS)===y){m.inv=0;m.louie=false;killMan(m,null)}}
 fxStep();
 // who won the round?
 const alive=men.filter(m=>m.alive);
 if(K.mode===2){if(!alive.length&&!men.some(m=>m.dead>0)){lastCoop=false;endRound(null)}else if(!creeps.length){lastCoop=true;endRound({coop:1})}}
 else if(K.mode===1){const ts=[0,1].filter(t=>alive.some(m=>m.i%2===t));if(ts.length<=1&&men.length>1){endRound(ts.length?{team:ts[0]}:null)}}
 else if(men.length>1?alive.length<=1:!alive.length)endRound(alive[0]?{i:alive[0].i}:null);
 if(lim&&roundT>=lim&&!roundOver)endRound(null)}
let lastCoop=null;
function endRound(w){if(roundOver)return;roundOver=150;
 if(w&&w.i!=null){men[w.i].wins++;say(men[w.i],'ROUND WIN!','#f8d040')}else if(w&&w.team!=null){for(const m of men)if(m.i%2===w.team)m.wins++;}
 else if(w&&w.coop)for(const m of men)m.wins++;
 K.fx('w',w&&w.i!=null?w.i:w&&w.team!=null?100+w.team:-1)}
function finish(){if(K.mode===2){K.end({coop:lastCoop?1:0,name:lastCoop?'MAZE CLEARED!':'GAME OVER'});return}
 if(K.mode===1){const t=[0,1].sort((a,b)=>men.filter(m=>m.i%2===b).reduce((s,m)=>s+m.wins,0)-men.filter(m=>m.i%2===a).reduce((s,m)=>s+m.wins,0))[0];K.end({team:t,name:TEAMN[t]});return}
 const b=men.slice().sort((a,c)=>c.wins-a.wins||c.kills-a.kills)[0];K.end(b?{i:b.i}:null)}
function perim(){return 2*(W+H)*TS}
function ghostStep(m){const inp=K.inp(m.i),P=perim();if(inp.left||inp.up)m.gx-=1.4;if(inp.right||inp.down)m.gx+=1.4;m.gx=((m.gx%P)+P)%P;
 const[x,y,d]=perimPos(m.gx);m.x=x;m.y=y;m.cart=d;
 if(inp.tap&&!(m.cd>0)){const tx=Math.max(0,Math.min(W-1,Math.floor(x/TS))),ty=Math.max(0,Math.min(H-1,Math.floor(y/TS)));
  const b={id:++bombId,tx,ty,own:m.i,fire:2,pierce:false,t:FUSE,slide:-1,air:0};bombs.push(b);launch(b,d,3+Math.floor(Math.random()*3));m.cd=240}
 if(m.cd>0)m.cd--}
function perimPos(s){const w=W*TS,h=H*TS;if(s<w)return[s,-6,2];s-=w;if(s<h)return[w+6,s,3];s-=h;if(s<w)return[w-s,h+6,0];s-=w;return[-6,h-s,1]}
function fxStep(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;p.vz-=.2;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.7;p.vy*=.7}p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0)}
/* ---- CPU bombers: stay out of blast lines, bomb blocks and rivals when there is a way out */
function danger(){const d=new Uint8Array(W*H);for(const b of bombs){if(b.air)continue;d[at(b.tx,b.ty)]=1;for(let k=0;k<4;k++)for(let r=1;r<=b.fire;r++){const x=b.tx+DX[k]*r,y=b.ty+DY[k]*r;if(!inside(x,y)||map[at(x,y)]===1||map[at(x,y)]===3)break;d[at(x,y)]=1;if(map[at(x,y)]===2)break}}
 for(const f of flames)d[at(f.x,f.y)]=1;return d}
function bfs(sx,sy,goal,dz){const prev=new Int32Array(W*H).fill(-1),q=[at(sx,sy)];prev[q[0]]=q[0];
 for(let h=0;h<q.length;h++){const c=q[h],x=c%W,y=(c/W)|0;if(goal(x,y))return path(prev,c,q[0]);for(let k=0;k<4;k++){const nx=x+DX[k],ny=y+DY[k];if(!inside(nx,ny))continue;const n=at(nx,ny);
  if(prev[n]>=0||map[n]||bombs.some(b=>!b.air&&b.tx===nx&&b.ty===ny)||(dz&&dz[n]&&!goal(nx,ny)&&false))continue;prev[n]=c;q.push(n)}}return null}
function path(prev,c,s){const p=[];while(c!==s){p.unshift(c);c=prev[c]}return p}
function bot(i){const m=men[i];if(!m)return{};if(!m.alive){if(m.ghost){const o={};o[(i+((K.tick/300)|0))%2?'left':'right']=true;if(Math.random()<.02)o.tap=true;return o}return{}}
 const tx=Math.floor(m.x/TS),ty=Math.floor(m.y/TS),dz=danger(),o={},sm=K.cpu===0?.5:K.cpu===1?.85:1;
 const go=p=>{if(!p||!p.length)return;const n=p[0],nx=n%W,ny=(n/W)|0;o[nx>tx?'right':nx<tx?'left':ny>ty?'down':'up']=true};
 if(dz[at(tx,ty)]){go(bfs(tx,ty,(x,y)=>!dz[at(x,y)]));return o}
 const near=men.some(e=>e!==m&&e.alive&&teamOf(e.i)!==teamOf(i)&&Math.abs(Math.floor(e.x/TS)-tx)+Math.abs(Math.floor(e.y/TS)-ty)<=Math.min(3,m.fire)&&(Math.floor(e.x/TS)===tx||Math.floor(e.y/TS)===ty))||creeps.some(c=>Math.abs(Math.floor(c.x/TS)-tx)+Math.abs(Math.floor(c.y/TS)-ty)<=2);
 const blockNext=[0,1,2,3].some(k=>inside(tx+DX[k],ty+DY[k])&&map[at(tx+DX[k],ty+DY[k])]===2);
 if((near||blockNext)&&Math.random()<sm*.3&&bombs.filter(b=>b.own===i).length<m.bombs){
  // only if there is a safe cell to run to afterwards
  const fake={tx,ty,fire:m.fire};const d2=danger();d2[at(tx,ty)]=1;for(let k=0;k<4;k++)for(let r=1;r<=m.fire;r++){const x=tx+DX[k]*r,y=ty+DY[k]*r;if(!inside(x,y)||map[at(x,y)])break;d2[at(x,y)]=1}
  if(bfs(tx,ty,(x,y)=>!d2[at(x,y)])){o.tap=true;return o}}
 const it=bfs(tx,ty,(x,y)=>items[at(x,y)]&&!map[at(x,y)]&&items[at(x,y)]!==9&&!dz[at(x,y)]);if(it&&it.length<8&&!it.some(n=>dz[n])){go(it);return o}
 const tgt=bfs(tx,ty,(x,y)=>!dz[at(x,y)]&&([0,1,2,3].some(k=>inside(x+DX[k],y+DY[k])&&map[at(x+DX[k],y+DY[k])]===2)||men.some(e=>e!==m&&e.alive&&teamOf(e.i)!==teamOf(i)&&Math.floor(e.x/TS)===x&&Math.floor(e.y/TS)===y)));
 if(tgt&&tgt.length&&!tgt.some(n=>dz[n]))go(tgt);
 return o}
/* ---- online */
function snap(){let soft='';for(let i=0;i<W*H;i+=4){let v=0;for(let k=0;k<4;k++)v|=(map[i+k]===2?1:0)<<k;soft+=v.toString(16)}
 let hard='';for(let i=0;i<W*H;i++)if(map[i]===3)hard+=i.toString(36)+',';
 const it=[];for(let i=0;i<W*H;i++)if(items[i]&&!map[i])it.push(i,items[i]);
 return{W,H,rd:round,ro:roundOver?1:0,m:men.map(m=>[Math.round(m.x*2),Math.round(m.y*2),m.dir,(m.alive?1:0)|(m.ghost?2:0)|(m.inv>0?4:0)|(m.louie?8:0)|(m.curse?16:0)|(m.stun>0?32:0),m.wins,m.kills,m.bombs,m.fire,m.speed]),
  b:bombs.map(b=>[b.tx,b.ty,b.t,b.air?Math.round(b.px):-1,b.air?Math.round(b.py):-1]),f:flames.map(f=>[f.x,f.y,f.t,'chvem'.indexOf(f.k)]),
  c:creeps.map(c=>[Math.round(c.x),Math.round(c.y),c.hit?1:0]),s:soft,h:hard,it}}
function apply(g){if(g.W!==W||g.H!==H){W=g.W|0;H=g.H|0;map=new Uint8Array(W*H);items=new Uint8Array(W*H)}round=g.rd|0;roundOver=g.ro?1:0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=at(x,y);map[i]=(x===0||y===0||x===W-1||y===H-1||(x%2===0&&y%2===0))?1:0}
 const s=String(g.s||'');for(let q=0;q<s.length;q++){const v=parseInt(s[q],16);for(let k=0;k<4;k++){const i=q*4+k;if(i<W*H&&v&(1<<k)&&map[i]!==1)map[i]=2}}
 for(const t of String(g.h||'').split(','))if(t){const i=parseInt(t,36);if(i>=0&&i<W*H)map[i]=3}
 items.fill(0);const it=g.it||[];for(let q=0;q+1<it.length;q+=2)if(it[q]>=0&&it[q]<W*H)items[it[q]]=it[q+1]|0;
 (g.m||[]).forEach((a,i)=>{const m=men[i];if(!m)return;m.tx=a[0]/2;m.ty=a[1]/2;if(m.x==null||Math.hypot(m.tx-m.x,m.ty-m.y)>40){m.x=m.tx;m.y=m.ty}m.dir=a[2]|0;const f=a[3]|0;
  const was=m.alive;m.alive=!!(f&1);m.ghost=!!(f&2);m.inv=f&4?1:0;m.louie=!!(f&8);m.curse=f&16?1:0;m.stun=f&32?1:0;m.wins=a[4]|0;m.kills=a[5]|0;m.bombs=a[6];m.fire=a[7];m.speed=a[8]});
 bombs=(g.b||[]).map(a=>({tx:a[0],ty:a[1],t:a[2],air:a[3]>=0?1:0,px:a[3],py:a[4]}));flames=(g.f||[]).map(a=>({x:a[0],y:a[1],t:a[2],k:'chvem'[a[3]]||'c'}));
 creeps=(g.c||[]).map(a=>({x:a[0],y:a[1],hit:a[2]}))}
function follow(){for(const m of men){if(m.tx==null)continue;const dx=m.tx-m.x,dy=m.ty-m.y;m.x+=dx*.4;m.y+=dy*.4;if(Math.abs(dx)+Math.abs(dy)>.3)m.walk=(m.walk||0)+1}fxStep()}
function onFx(k,a){if(k==='b'){sfx('kaboom');shake=4}else if(k==='k'){sfx('boom');const m=men[a[0]];if(m)for(let i=0;i<10;i++)parts.push({x:m.x,y:m.y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,z:6,vz:Math.random()*3,t:36,col:i%2?m.col:'#fff'})}
 else if(k==='x')texts.push({x:a[0],y:a[1],s:String(a[2]).slice(0,16),col:a[3],t:60});else if(k==='h')K.track(3)}
/* ---- drawing */
let shake=0;const cam={x:0,y:0,z:1};
function camFor(Wv,Hv){const fs=K.focus().map(i=>men[i]).filter(Boolean);const ww=W*TS,hh=H*TS;let z=Math.min(Wv/(ww+28),Hv/(hh+36)),tx=ww/2,ty=hh/2;
 if(fs.length===1&&!K.demo&&z<1.15){z=1.15;tx=fs[0].x;ty=fs[0].y}
 cam.z+=(z-cam.z)*.1;const vw=Wv/cam.z,vh=Hv/cam.z,cl=(v,size,view)=>size+28<=view?(size-view)/2:Math.max(-14,Math.min(size-view+14,v));
 cam.x+=(cl(tx-vw/2,ww,vw)-cam.x)*.15;cam.y+=(cl(ty-vh/2+4,hh,vh)-cam.y)*.15}
const ART={};
function art(key,w,h,f){if(ART[key])return ART[key];const k=document.createElement('canvas'),Q=3;k.width=w*Q;k.height=h*Q;const g=k.getContext('2d');g.scale(Q,Q);f(g);k._q=Q;return ART[key]=k}
const hardArt=()=>art('hard',TS,TS+6,g=>{g.fillStyle='#3a4050';g.fillRect(0,6,TS,TS);const t=g.createLinearGradient(0,0,TS,TS);t.addColorStop(0,'#c8d0e0');t.addColorStop(1,'#6a7488');g.fillStyle=t;g.fillRect(0,0,TS,TS);
 g.fillStyle='rgba(255,255,255,.5)';g.fillRect(0,0,TS,1.2);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(TS-1.2,0,1.2,TS);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=.6;g.strokeRect(3,3,TS-6,TS-6)});
const softArt=()=>art('soft',TS,TS+5,g=>{g.fillStyle='#6a3818';g.fillRect(0,5,TS,TS);const t=g.createLinearGradient(0,0,0,TS);t.addColorStop(0,'#d88848');t.addColorStop(1,'#a05828');g.fillStyle=t;g.fillRect(0,0,TS,TS);
 g.strokeStyle='rgba(60,25,5,.7)';g.lineWidth=.8;for(let r=0;r<4;r++){g.beginPath();g.moveTo(0,r*4);g.lineTo(TS,r*4);g.stroke();for(let c=0;c<3;c++){const x=(c*6+(r%2)*3)%TS;g.beginPath();g.moveTo(x,r*4);g.lineTo(x,r*4+4);g.stroke()}}
 g.fillStyle='rgba(255,230,180,.35)';g.fillRect(0,0,TS,1)});
const fallArt=()=>art('fall',TS,TS+6,g=>{g.fillStyle='#402020';g.fillRect(0,6,TS,TS);const t=g.createLinearGradient(0,0,TS,TS);t.addColorStop(0,'#f0a0a0');t.addColorStop(1,'#a04040');g.fillStyle=t;g.fillRect(0,0,TS,TS)});
let floorC=null,floorSig='';
function buildFloor(){const sig=W+'x'+H;if(sig===floorSig)return;floorSig=sig;floorC=document.createElement('canvas');floorC.width=W*TS*2;floorC.height=H*TS*2;const g=floorC.getContext('2d');g.scale(2,2);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=g.createLinearGradient(x*TS,y*TS,x*TS+TS,y*TS+TS);const a=(x+y)&1;t.addColorStop(0,a?'#3e9a48':'#46a850');t.addColorStop(1,a?'#2e8038':'#3a9444');g.fillStyle=t;g.fillRect(x*TS,y*TS,TS,TS)}
 g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(y>0&&(x===0||y===0||x===W-1||y===H-1||(x%2===0&&y%2===0)))g.fillRect(x*TS,y*TS+TS,TS,5)}
function drawMan(g,m){const x=m.x,y=m.y,bob=Math.sin((m.walk||0)*.35)*1,d=m.dir;if(m.inv>0&&(K.tick>>2)&1&&m.alive)g.globalAlpha=.5;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+6,6,2.5,0,0,7);g.fill();
 if(m.louie){const lg=g.createRadialGradient(x-2,y-2,1,x,y+1,8);lg.addColorStop(0,'#f8e0b0');lg.addColorStop(1,'#a07040');g.fillStyle=lg;g.beginPath();g.ellipse(x,y+2,8,5,0,0,7);g.fill()}
 const yy=y-(m.louie?5:0);
 // body + feet
 const bg=g.createLinearGradient(x-5,yy-2,x+5,yy+6);bg.addColorStop(0,RA.util.mix(m.col,'#ffffff',.35));bg.addColorStop(1,RA.util.mix(m.col,'#000000',.35));
 g.fillStyle='#e05050';g.beginPath();g.ellipse(x-3,yy+5+(bob>0?-1:0),2.4,1.6,0,0,7);g.ellipse(x+3,yy+5+(bob<0?-1:0),2.4,1.6,0,0,7);g.fill();
 g.fillStyle=bg;g.beginPath();g.ellipse(x,yy+1.5,4.6,4,0,0,7);g.fill();g.fillStyle='#20203a';g.fillRect(x-4.5,yy+1,9,1.4);
 // head: white helmet, pink antenna, face plate
 const hg=g.createRadialGradient(x-2,yy-9,1,x,yy-6,7);hg.addColorStop(0,'#ffffff');hg.addColorStop(.7,'#e0e4f0');hg.addColorStop(1,'#9098b0');g.fillStyle=hg;g.beginPath();g.arc(x,yy-6,6,0,7);g.fill();
 g.strokeStyle='#808898';g.lineWidth=.8;g.beginPath();g.moveTo(x,yy-12);g.lineTo(x,yy-14.5);g.stroke();const ag=g.createRadialGradient(x-.6,yy-16,.3,x,yy-15.5,2.2);ag.addColorStop(0,'#ffd0f0');ag.addColorStop(1,'#e03890');g.fillStyle=ag;g.beginPath();g.arc(x,yy-15.5,2,0,7);g.fill();
 if(d!==0){g.fillStyle='#f8c8a0';g.beginPath();g.ellipse(x+DX[d]*1.5,yy-5.5,3.8,3,0,0,7);g.fill();g.fillStyle='#202030';for(const s of[-1,1])g.fillRect(x+DX[d]*2+s*1.5-.5,yy-7,1,2.6)}
 g.globalAlpha=1;if(m.curse&&(K.tick>>3)&1){g.fillStyle='rgba(120,0,160,.35)';g.beginPath();g.arc(x,yy-3,10,0,7);g.fill()}
 if(m.stun){g.fillStyle='#f8d040';for(let k=0;k<3;k++){const an=K.tick*.2+k*2.1;g.fillRect(x+Math.cos(an)*7,yy-16+Math.sin(an)*2,1.6,1.6)}}
 RA.gfx.text(g,m.name,x,yy-26,m.col)}
function drawCart(g,m){const x=m.x,y=m.y;g.fillStyle='#585868';g.beginPath();g.roundRect?g.roundRect(x-7,y-4,14,8,2):g.rect(x-7,y-4,14,8);g.fill();g.fillStyle='#fff';g.globalAlpha=.75;g.beginPath();g.arc(x,y-6,4.5,0,7);g.fill();g.globalAlpha=1;
 g.fillStyle=m.col;g.fillRect(x-7,y-1,14,2);RA.gfx.text(g,m.name,x,y-18,m.col)}
function drawBomb(g,x,y,b,lift){const p=1+Math.sin(K.tick*.3)*.06*(b.t<60?2:1),r=6*p;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+1,y+6,5,2,0,0,7);g.fill();
 const bg=g.createRadialGradient(x-2.5,y-3-lift,.5,x,y-lift,r+1);bg.addColorStop(0,'#8890b0');bg.addColorStop(.35,'#30344a');bg.addColorStop(1,'#08080e');g.fillStyle=bg;g.beginPath();g.arc(x,y-lift,r,0,7);g.fill();
 g.fillStyle='#c8a060';g.fillRect(x+2,y-lift-r-1,2,2.5);if((K.tick>>1)&1){g.fillStyle=b.t<60?'#ff4020':'#fff080';g.beginPath();g.arc(x+3.2,y-lift-r-2,1.6,0,7);g.fill()}}
function drawFlame(g,f){const X=f.x*TS,Y=f.y*TS,a=Math.min(1,f.t/10),w=f.k==='c'?TS:TS*.7;g.globalAlpha=a;
 const gr=g.createRadialGradient(X+8,Y+8,1,X+8,Y+8,10);gr.addColorStop(0,'#ffffe0');gr.addColorStop(.45,'#ffc030');gr.addColorStop(1,'rgba(240,60,0,0)');g.fillStyle=gr;
 if(f.k==='h')g.fillRect(X,Y+(TS-w)/2-2,TS,w+4);else if(f.k==='v')g.fillRect(X+(TS-w)/2-2,Y,w+4,TS);else g.fillRect(X-2,Y-2,TS+4,TS+4);g.globalAlpha=1}
function drawItem(g,k,x,y){const it=ITEMS[k];if(!it)return;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-6,y-4,14,13);const t=g.createLinearGradient(x-7,y-7,x+7,y+7);t.addColorStop(0,'#fff');t.addColorStop(.25,it.c);t.addColorStop(1,RA.util.mix(it.c,'#000000',.5));
 g.fillStyle=t;g.fillRect(x-7,y-7-Math.sin(K.tick*.1)*1,14,14);g.fillStyle=k===1?'#fff':'#000';g.font='bold 9px "Russo One",sans-serif';g.textAlign='center';g.fillText(it.s,x,y+3.5-Math.sin(K.tick*.1)*1)}
function render(g,Wv,Hv){camFor(Wv,Hv);buildFloor();if(shake>0)shake*=.85;
 const bg=g.createLinearGradient(0,0,0,Hv);bg.addColorStop(0,'#101830');bg.addColorStop(1,'#04060c');g.fillStyle=bg;g.fillRect(0,0,Wv,Hv);
 g.save();g.setTransform(cam.z,0,0,cam.z,-cam.x*cam.z+(Math.random()-.5)*shake,-cam.y*cam.z+(Math.random()-.5)*shake);g.imageSmoothingEnabled=true;
 g.drawImage(floorC,0,0,W*TS,H*TS);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const it=items[at(x,y)];if(it&&!map[at(x,y)])drawItem(g,it,x*TS+8,y*TS+8)}
 for(const f of flames)drawFlame(g,f);
 // rows back to front: blocks, bombs, bombers, creeps
 for(let y=0;y<H;y++){for(let x=0;x<W;x++){const v=map[at(x,y)];if(v===1)g.drawImage(hardArt(),x*TS,y*TS-6);else if(v===2)g.drawImage(softArt(),x*TS,y*TS-5);else if(v===3)g.drawImage(fallArt(),x*TS,y*TS-6)}
  for(const b of bombs)if(!b.air&&b.ty===y)drawBomb(g,b.tx*TS+8,b.ty*TS+8,b,0);
  for(const c of creeps)if(Math.floor(c.y/TS)===y){const gr=g.createRadialGradient(c.x-2,c.y-5,1,c.x,c.y-2,7);gr.addColorStop(0,'#ffd8a0');gr.addColorStop(1,c.hit?'#fff':'#e06020');g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(c.x,c.y+6,5,2,0,0,7);g.fill();
   g.fillStyle=gr;g.beginPath();g.arc(c.x,c.y-2-Math.abs(Math.sin(K.tick*.1+c.x))*2,6,0,7);g.fill();g.fillStyle='#000';g.fillRect(c.x-2.5,c.y-4,1.4,2);g.fillRect(c.x+1.1,c.y-4,1.4,2)}
  for(const m of men)if(m.alive&&Math.floor(m.y/TS)===y)drawMan(g,m)}
 for(const b of bombs)if(b.air){const p=b.at!=null&&b.al?b.at/b.al:.5;drawBomb(g,b.px,b.py,b,Math.sin(Math.PI*Math.max(0,Math.min(1,p)))*22)}
 for(const m of men)if(!m.alive&&m.ghost)drawCart(g,m);
 for(const p of parts){g.globalAlpha=Math.min(1,p.t/20);g.fillStyle=p.col;g.fillRect(p.x-1,p.y-1-p.z,2,2)}g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,t.x,t.y,t.col);
 g.restore();
 // HUD: round, round wins
 g.font='7px "Russo One",sans-serif';g.textAlign='center';g.fillStyle='#fff';
 if(!K.demo){g.fillText(K.mode===2?'STAGE '+round:'ROUND '+round+' · FIRST TO '+K.S.rounds,Wv/2,Hv-34);if(hurry&&(K.tick>>4)&1){g.fillStyle='#ff5040';g.fillText('HURRY UP!',Wv/2,Hv-42)}}
 const list=men.slice().sort((a,b)=>b.wins-a.wins||b.kills-a.kills).slice(0,8);g.font='6px "Russo One",sans-serif';
 list.forEach((m,k)=>{const y=30+k*8;g.textAlign='left';g.fillStyle='rgba(0,0,0,.5)';g.fillRect(Wv-80,y-6,76,7.5);g.fillStyle=m.col;g.fillRect(Wv-79,y-5,4,5);g.fillStyle=m.alive?'#fff':'#888';
  g.fillText((m.name||'').slice(0,12),Wv-73,y);g.textAlign='right';g.fillText('★'+m.wins,Wv-7,y)});
 const me=men[K.myIdx>=0?K.myIdx:K.focus()[0]];if(me&&!K.demo&&me.alive){g.textAlign='left';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(6,Hv-30,96,12);g.fillStyle='#fff';
  g.fillText('💣'+me.bombs+'  🔥'+me.fire+'  ⚡'+me.speed+(me.kick?'  K':'')+(me.glove?'  G':'')+(me.remote?'  R':'')+(me.pierce?'  P':''),9,Hv-22)}}
K=RA.kit({id:'blast',name:'BLAST MAZE',kind:'Bomb maze',players:'1-20 players',demo:6,baseH:240,
 desc:'The classic bomb-maze battle for up to 20. Blast blocks for items, kick and throw bombs, ride the revenge cart when you are out. Battle, Teams or Co-op, first to N rounds.',
 blurb:'Move with WASD, drop bombs with Space or click, E / right-click throws (glove) or detonates (remote). Last bomber standing takes the round.',
 howto:'WASD / arrows move, Space or click drops a bomb, E or right-click throws a bomb (glove) or detonates (remote). Out? Ride the edge cart: A / D slide, click lobs a bomb. Gamepad: stick moves, A bomb, B throw.',
 icon:['....kk....','...kwwk...','..kwwwwk..','.kwkwwkwk.','.kwwwwwwk.','..kpppkk..','.kprrrrpk.','.kprrrrpk.','..kk..kk..','.krk..krk.'],
 music:MUSIC,fireLabel:'BOMB',
 modes:[['BATTLE','Last bomber standing wins the round.'],['TEAMS','Red vs blue, last team standing.'],['CO-OP','Clear the maze of creeps together. Friendly flames still hurt!']],
 settings:[['rounds','Rounds to win',[[3,'3'],[1,'1'],[5,'5']]],['size','Arena',[['auto','Auto'],[0,'Small'],[1,'Medium'],[2,'Large']]],['len','Round time',[[3,'3 min'],[2,'2 min'],[5,'5 min'],[0,'None']]],
  ['revenge','Revenge carts',[['on','On'],['off','Off']]],['items','Items',[['classic','Classic'],['party','Wild party'],['off','Off']]]],
 kb:[['W A S D','move'],['LMB SPACE','bomb'],['RMB E','throw / detonate'],['C','chat'],['ESC','menu']],pad:[['LS','move'],['A','bomb'],['B','throw'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Fuse Lit',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Fuse Lit'},{id:'win1',name:'Bomb Master',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Bomb Master'},
  {id:'ko5',name:'Chain Reaction',desc:'5 KOs in one match',test:(s,m)=>m.kills>=5,unlock:'title:Chain Reaction'},{id:'flaw',name:'Untouchable',desc:'Win without being blown up',test:(s,m)=>m.won&&!m.ko,unlock:'title:Untouchable'}],
 alive:i=>!!men[i]&&men[i].alive,out:i=>!men[i]||(!men[i].alive&&!men[i].ghost&&!(men[i].dead>0)),start,step,follow,snap,apply,render,bot,onFx,teamOf,
 ranks:()=>men.slice().sort((a,b)=>b.wins-a.wins||b.kills-a.kills).map(m=>[m.name,m.col,'★'+m.wins+' · '+m.kills+' KO']),
 result:(i,w)=>{const m=men[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:m.kills,ko:m.ko,bestScore:m.wins}}});
window.__bm={get men(){return men},get bombs(){return bombs},K};
})();
