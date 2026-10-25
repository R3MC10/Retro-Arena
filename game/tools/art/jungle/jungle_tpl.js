/* JUNGLE FORCE for Retro Arena: co-op run and gun for up to 20 in pixel art, after Contra.
   The original it follows: run right through the jungle, somersault jumps, aim in 8 directions (hold up / down while you
   shoot, lie prone with down), one hit and you lose a life, flying capsules drop the eagle weapons - S spread, M machine
   gun, L laser, F fire - and a fortress wall with cannons and a core waits at the end.
   The 20-player twist: everyone pushes through the same stage. Out of lives? Press fire to borrow one from the team mate
   who has the most. CPU allies in CO-OP never run out: they are your backup, the team falls when every human is out. CO-OP: destroy the fortress core together. SCORE ATTACK: same stage, the best score wins.
   First seconds: hints show the keys; your commando has an arrow over the head.
   Keys: A / D run, W / S aim up / down (S standing = prone), Space / click jumps, E / Shift / right-click shoots.
   Online is lag-free (RA.kit localFirst): your commando and your bullets live on your device; the host runs the
   soldiers, turrets, capsules, enemy fire and the fortress.
   The sprites are painted in tools/art/jungle (python), exported as ART below; edit jungle_tpl.js and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
/*ART*/
const TM=RA.music.track,sfx=RA.audio.sfx;
const TS=16,LH=12,CD=120,RUNV=1.3,JUMP=5.2,GRAV=.25,MAXF=5;
const GUNS={R:{n:'RIFLE',cd:9,max:4,sp:4.2},M:{n:'MACHINE GUN',cd:6,max:6,sp:4.4,auto:1},S:{n:'SPREAD',cd:13,max:15,sp:3.8},L:{n:'LASER',cd:22,max:1,sp:7,pierce:1},F:{n:'FIRE',cd:16,max:3,sp:3,dmg:2}};
RA.audio.add('gun',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='bandpass';f.frequency.value=1800;s.connect(f);f.connect(g);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.06);s.start(now);s.stop(now+.07)});
RA.audio.add('las',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(1600,now);o.frequency.exponentialRampToValueAtTime(400,now+.15);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);o.connect(g);o.start(now);o.stop(now+.17)});
RA.audio.add('kill',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(300,now);o.frequency.exponentialRampToValueAtTime(60,now+.15);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);o.connect(g);o.start(now);o.stop(now+.17)});
RA.audio.add('powerup',(AC,now,g)=>{[392,523,659,784,1047].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='square';o.frequency.value=f;q.gain.setValueAtTime(0,now+k*.05);q.gain.linearRampToValueAtTime(.05,now+k*.05+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.05+.09);o.connect(q);q.connect(g);o.start(now+k*.05);o.stop(now+k*.05+.1)});g.gain.value=1});
const MUSIC=[TM('Jungle Assault',152,['Em','C','D','B'],'k.hsk.hsk.hsk.ss','e5 . e5 g5 . e5 b5 . a5 g5 . e5 . d5 e5 . e5 . e5 g5 . b5 d6 . c6 b5 . a5 . g5 a5 .'),
 TM('Fortress',132,['Am','F','G','E'],'k..sk..sk..sk.ss','a4 . e5 . a5 g5 e5 . f5 . c5 . f5 e5 c5 . g5 . d5 . g5 f5 d5 . e5 . b4 . g#5 . e5 .')];
// the stage, from chunks: # ground, R rock (solid), = ledge (stand on it, jump up through it), b bridge (blows up),
// ~ water (deadly), T turret in the rock, r rifleman, c capsule, B the fortress
const CH={
 start:["................","................","................","................","................","................","................","................","................","................","################","################"],
 ledges:["....................","....................","....................","....................","....................","...........=====....","....................","....=====...........","...............r....","....................","####################","####################"],
 bridge:["......................","......................","......................","......................","......................","......................","......................","......................","......................","......................","####bbbbbbbbbbbbbb####","####~~~~~~~~~~~~~~####"],
 rocks:["..................","..................","..................","..................","..................",".........c........","..................","............RRTRRR","..........RRRRRRRR","..........RRRRRRRR","##################","##################"],
 river:["....................","....................","....................","....................","....................","....................","....................","....................",".....===..===.......","....................","####~~~~~~~~~~~~####","####~~~~~~~~~~~~####"],
 hill:["......................","......................","......................","......................","......................","..............r.......","...........#######....","........##########....","......############....","....##############....","######################","######################"],
 nest:["....................","....................","....................","....................","...........c........","....................","..====.......====...","....................",".........r..........","....................","####################","####################"],
 turret:["..................","..................","..................","..................","..................","..................","..................","..RRTR........RTRR","..RRRR........RRRR","..RRRR........RRRR","##################","##################"],
 boss:["..................................","..................................","..................................","..................................","..................................","..................................","..................................","..................................","..................................","..................................","##################################","##################################"]};
const POOL=['ledges','bridge','rocks','river','hill','nest','turret'];
let K,LV=null,men=[],foes=[],eb=[],items=[],parts=[],texts=[],nextId=1,shake=0,boss=null,cleared=false,clearT=0,bridgeDone=new Set();
const teamOf=i=>K.mode===1?i:0,ownerNet=h=>K.seats[h.i]&&K.seats[h.i].ctrl==='net',isMine=h=>K.isClient()?h.i===K.myIdx:!ownerNet(h);
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
function build(seed,S){const rr=RA.util.mulberry(seed),n=S.length==='short'?5:S.length==='long'?11:8,list=['start'],bag=[];
 for(let k=0;k<n;k++){if(!bag.length)bag.push(...POOL.slice().sort(()=>rr()-.5));list.push(bag.pop())}list.push('boss');
 const rows=Array.from({length:LH},()=>'');for(const c of list)for(let r=0;r<LH;r++)rows[r]+=CH[c][r];
 const W=rows[0].length,tiles=new Uint8Array(W*LH),marks=[];const code={'#':1,R:2,'=':3,b:4,'~':5};
 for(let r=0;r<LH;r++)for(let c=0;c<W;c++){const ch=rows[r][c];if(code[ch])tiles[r*W+c]=code[ch];if(ch==='T'){tiles[r*W+c]=6;marks.push({k:'T',c,r})}if(ch==='r')marks.push({k:'r',c,r});if(ch==='c')marks.push({k:'c',c,r})}
 return{W,tiles,marks,bossX:(W-14)*TS}}
const tileAt=(c,r)=>c<0||r<0?(c<0?2:0):c>=LV.W||r>=LH?0:LV.tiles[r*LV.W+c];
const solid=v=>v===1||v===2||v===4||v===6,plat=v=>v===3;
function start(seats,md,S,seed){S=S||{};LV=build(seed,S);men=[];foes=[];eb=[];items=[];parts=[];texts=[];nextId=1;boss=null;cleared=false;clearT=0;cams.length=0;bridgeDone=new Set();
 men=seats.map((s,i)=>({i,name:s.name,col:md===1?s.col:s.col,x:24+(i%6)*10,y:160,vx:0,vy:0,gr:true,face:1,aim:'f',gun:'R',cd:0,lives:+S.lives||5,dead:0,out:false,inv:120,score:0,kills:0,
  bul:[],claims:[],cseq:0,cSeen:0,ev:[],evSeq:0,evSeen:0,pose:'stand_f',anim:0,prone:false,jh:false,fh:false}));
 for(const m of LV.marks){if(m.k==='T')foes.push({id:nextId++,k:'T',x:m.c*TS+8,y:m.r*TS+8,hp:8,cd:60,on:0,ang:Math.PI});else if(m.k==='r'){let gy=(m.r+1)*TS;for(let r=m.r;r<LH;r++){const v=tileAt(m.c,r);if(solid(v)||plat(v)){gy=r*TS;break}}foes.push({id:nextId++,k:'r',x:m.c*TS+8,y:gy,hp:2,cd:80,on:0,face:-1})}else foes.push({id:nextId++,k:'cap',x0:m.c*TS,y0:m.r*TS,x:-99,y:-99,hp:1,on:0,t:0,gun:'MSLF'[Math.floor(Math.random()*4)]})}
 const bx=LV.bossX;boss={x:bx,core:{x:bx+88,y:118,hp:60},cans:[{x:bx+60,y:98,hp:14,cd:90},{x:bx+60,y:140,hp:14,cd:130}],on:0}}
/* ---------- your commando (runs on its owner's device) ---------- */
const HW=5,hH=h=>h.prone?9:!h.gr?14:22;
function hitWall(x,y,h){const c0=Math.floor((x-HW)/TS),c1=Math.floor((x+HW-.01)/TS),r0=Math.floor((y-h)/TS),r1=Math.floor((y-.01)/TS);for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(solid(tileAt(c,r)))return true;return false}
function move(h,inp){if(K.tick<CD){h.vx=0;return}
 if(h.out){if((inp.fire&&!h.fh)||(inp.alt&&!h.ah))claim(h,'borrow',0);h.fh=!!inp.fire;h.ah=!!inp.alt;return}
 if(h.inv>0)h.inv--;if(h.cd>0)h.cd--;
 if(h.dead>0){h.dead--;h.vy=Math.min(MAXF,h.vy+GRAV);h.x-=h.face*.7;h.y+=h.vy;if(h.y>LH*TS+30)h.y=LH*TS+30;if(h.dead===0)respawn(h);bullets(h);return}
 const dir=(inp.right?1:0)-(inp.left?1:0),up=!!inp.up,down=!!inp.down,jump=!!inp.fire,shoot=!!(inp.alt||inp.b4);
 const wet=tileAt(Math.floor(h.x/TS),Math.floor((h.y-2)/TS))===5;h.swim=wet;h.prone=down&&h.gr&&!dir&&!wet;h.vx=h.prone?0:dir*RUNV*(wet?.6:1);if(dir)h.face=dir;
 h.aim=up&&!dir?'u':up&&dir?'ud':down&&dir&&h.gr?'dd':down&&!h.gr?'d':'f';
 if(jump&&!h.jh&&h.gr){const onPlat=plat(tileAt(Math.floor(h.x/TS),Math.floor(h.y/TS)));if(down&&onPlat){h.drop=12;h.gr=false}else{h.vy=-JUMP*(h.swim?.75:1);h.gr=false;sfx('jump')}}h.jh=jump;
 if(h.drop>0)h.drop--;
 const G=GUNS[h.gun];if(shoot&&(!h.sh||G.auto)&&h.cd<=0&&h.bul.length<G.max)fire(h);h.sh=shoot;
 // physics against the stage: walls, floors, ledges you can jump up through
 const H=hH(h);let nx=h.x+h.vx;if(hitWall(nx,h.y,H))nx=h.x;h.x=Math.max(HW,nx);
 const py=h.y;h.vy=Math.min(MAXF,h.vy+GRAV);let ny=h.y+h.vy;h.gr=false;
 if(h.vy>=0){const r=Math.floor(ny/TS),c0=Math.floor((h.x-HW)/TS),c1=Math.floor((h.x+HW-.01)/TS);for(let c=c0;c<=c1;c++){const v=tileAt(c,r);if(solid(v)||plat(v)&&!(h.drop>0)&&py<=r*TS+.5){ny=r*TS;h.vy=0;h.gr=true;break}
   // water: you wade in it up to the chest (slow, no jumping out until the bank)
   if(v===5&&ny>=r*TS+8){ny=r*TS+8;h.vy=0;h.gr=true;h.swim=1;break}}}
 else if(hitWall(h.x,ny,H)){ny=Math.floor((ny-H)/TS+1)*TS+H;h.vy=0}
 h.y=ny;h.anim+=Math.abs(h.vx)*.12;
 if(h.y>LH*TS+20){die(h,'pit');return}
 bullets(h);if(h.inv<=0)hurtCheck(h);pickups(h);poseStep(h)}
const AIMV={f:[1,0],u:[0,-1],ud:[.72,-.72],dd:[.72,.72],d:[0,1]};
function muzzle(h){const a=AIMV[h.aim];return h.prone?{x:h.x+h.face*12,y:h.y-4}:h.aim==='u'?{x:h.x+h.face*3,y:h.y-31}:h.aim==='ud'?{x:h.x+h.face*11,y:h.y-25}:h.aim==='dd'?{x:h.x+h.face*12,y:h.y-8}:h.aim==='d'?{x:h.x,y:h.y}:{x:h.x+h.face*15,y:h.y-12+(h.gr?0:4)}}
function fire(h){const G=GUNS[h.gun],m=muzzle(h),a=AIMV[h.aim],dx=a[0]*h.face,dy=a[1],l=Math.hypot(dx,dy)||1,ang=Math.atan2(dy/l,dx/l);h.cd=G.cd;
 const mk=(an,s)=>h.bul.push({x:m.x,y:m.y,vx:Math.cos(an)*s,vy:Math.sin(an)*s,t:G.pierce?40:90,pierce:!!G.pierce,dmg:G.dmg||1,hit:new Set(),k:h.gun});
 if(h.gun==='S')for(const d of[-.36,-.18,0,.18,.36])mk(ang+d,G.sp);else mk(ang,G.sp);sfx(h.gun==='L'?'las':'gun')}
function bullets(h){for(const b of h.bul){b.x+=b.vx;b.y+=b.vy;b.t--;if(b.k==='F'){b.ph=(b.ph||0)+.3}
  {const v=tileAt(Math.floor(b.x/TS),Math.floor(b.y/TS));if(solid(v)&&v!==6&&b.k!=='L'){b.t=0;continue}}
  for(const f of targets()){if(b.t<=0)break;if(b.hit.has(f.id)||f.dead||f.lk>K.tick)continue;if(Math.abs(b.x-f.x)<f.w&&b.y>f.y-f.h&&b.y<f.y+f.d){b.hit.add(f.id);claim(h,'h',f.id,b.dmg);f.fl=4;parts.push({x:b.x,y:b.y,vx:0,vy:0,t:6,col:'#fff07c',sz:2});if(!b.pierce)b.t=0}}}
 h.bul=h.bul.filter(b=>b.t>0)}
// everything a bullet can hit, as boxes: half width, height above, depth below
function targets(){const out=[];for(const f of foes){if(f.dead||!f.on&&f.k!=='T')continue;if(f.k==='s'||f.k==='r')out.push({ref:f,id:f.id,x:f.x,y:f.y,w:6,h:22,d:0,dead:f.dead,lk:f.lk});else if(f.k==='T')out.push({ref:f,id:f.id,x:f.x,y:f.y+7,w:9,h:15,d:0,dead:f.dead,lk:f.lk});else if(f.k==='cap')out.push({ref:f,id:f.id,x:f.x,y:f.y+5,w:8,h:9,d:0,dead:f.dead})}
 if(boss&&boss.on){boss.cans.forEach((c,k)=>{if(c.hp>0)out.push({id:'c'+k,x:c.x,y:c.y+6,w:8,h:12,d:0})});if(boss.core.hp>0)out.push({id:'core',x:boss.core.x,y:boss.core.y+14,w:9,h:28,d:0})}return out}
function hurtCheck(h){const H=hH(h);for(const b of eb){if(Math.abs(b.x-h.x)<HW+2&&b.y>h.y-H&&b.y<h.y){die(h,'shot');b.t=0;return}}
 for(const f of foes)if(f.k==='s'&&!f.dead&&Math.abs(f.x-h.x)<9&&Math.abs(f.y-h.y)<12){die(h,'touch');return}}
function pickups(h){for(const it of items){if(it.got||it.fly)continue;if(Math.abs(it.x-h.x)<12&&it.y>h.y-26&&it.y<h.y+6){it.got=1;h.gun=it.gun;sfx('powerup');say(h,GUNS[it.gun].n+'!','#fff07c');claim(h,'it',it.id)}}}
function die(h,why){if(h.dead||h.inv>0)return;h.why=why;
 // Easy: a life takes two hits (the first knocks you back and flashes you), pits still kill
 if(h.hp==null)h.hp=K.cpu===0?2:1;if(why!=='pit'&&h.hp>1&&!h.out){h.hp--;h.inv=90;h.vy=-2.4;h.vx=-h.face*1.5;sfx('kill');return}h.dead=60;h.vy=-3.2;h.gun='R';h.bul=[];if(!(K.mode===0&&K.seats[h.i]&&K.seats[h.i].ctrl==='cpu'&&K.seats.some(s=>s.ctrl!=='cpu')))h.lives--;sfx('kill');if(h.i===meIdx())shake=4}
function respawn(h){if(h.lives<=0){h.out=true;return}let x=Math.max(24,h.x-48);
 // back on solid ground a few steps behind (never into water or over a pit)
 for(let k=0;k<12;k++){const c=Math.floor(x/TS);let ok=false;for(let r=2;r<LH;r++){const v=tileAt(c,r);if(v===5)break;if(solid(v)||plat(v)){ok=true;break}}if(ok)break;x-=TS}h.x=Math.max(24,x);h.y=10;h.vy=0;h.inv=150;h.gr=false;h.hp=null}
function poseStep(h){let p;if(h.dead)p='die';else if(!h.gr)p='spin'+(Math.floor(K.tick/4)%4);else if(h.prone)p='prone';else if(Math.abs(h.vx)>.1){const f=1+Math.floor(h.anim)%3;p='run'+f+'_'+(h.aim==='u'?'ud':h.aim==='d'?'f':h.aim)}else p='stand_'+(h.aim==='dd'||h.aim==='d'?'f':h.aim);h.pose=p}
function claim(h,k,a,b){if(!K.isClient()){resolve(h,[0,k,a,b]);return}h.cseq++;h.claims.push([h.cseq,k,a,b]);if(h.claims.length>16)h.claims.shift()}
function say(h,s,col){if(h.i!==meIdx())return;texts.push({x:h.x,y:h.y-36,s,col,t:70})}

/* ---------- host: soldiers, turrets, capsules, enemy fire, bridges and the fortress ---------- */
const PTS={s:100,r:200,T:500,cap:300};
function resolve(h,[,k,a,b]){
 if(k==='h'){if(typeof a==='string'){if(!boss||!boss.on)return;const part=a==='core'?boss.core:boss.cans[+a[1]];if(!part||part.hp<=0)return;part.hp-=b||1;part.fl=4;if(part.hp<=0){h.score+=a==='core'?5000:1000;boom(part.x,part.y,3);if(a==='core'){cleared=true;clearT=K.tick;K.fx('clr')}}return}
  const f=foes.find(x=>x.id===a);if(!f||f.dead)return;f.hp-=b||1;f.fl=4;if(f.hp<=0){f.dead=1;f.vy=-3;h.score+=PTS[f.k]||100;h.kills++;sfx('kill');boom(f.x,f.y-8,f.k==='T'?2:1);
   if(f.k==='cap')items.push({id:nextId++,x:f.x,y:f.y,vy:-3,gun:f.gun,fly:0})}}
 else if(k==='it'){const it=items.find(x=>x.id===a);if(it)it.got=1}
 else if(k==='borrow'){if(K.mode!==0||!h.out)return;const d=men.filter(m=>m!==h&&!m.out&&m.lives>1&&K.seats[m.i].ctrl!=='cpu').sort((p,q)=>q.lives-p.lives)[0];if(d){d.lives--;send(d,'lend');send(h,'life');say(h,'BORROWED A LIFE','#88dc48')}}}
function send(o,kind){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind)}
function onEv(h,kind){if(kind==='life'){h.out=false;h.lives=1;h.dead=0;const lead=men.filter(m=>!m.out&&m!==h).sort((p,q)=>q.x-p.x)[0];h.x=lead?lead.x-20:h.x;h.y=10;h.inv=150;respawn(h)}else if(kind==='lend'){if(!K.isClient()||h.i===K.myIdx)h.lives=Math.max(1,h.lives-0)}}
function boom(x,y,n){for(let k=0;k<6*n;k++)parts.push({x:x+(Math.random()-.5)*10*n,y:y+(Math.random()-.5)*10*n,vx:(Math.random()-.5)*2,vy:-Math.random()*2,t:20+Math.random()*10,col:['#fff07c','#ffa040','#f05050','#ffffff'][k%4],sz:2,g:.05});shake=Math.max(shake,n*2);sfx('boom',n*6)}
function groundY(c){for(let r=2;r<LH;r++){const v=tileAt(c,r);if(solid(v)||plat(v))return r*TS}return null}
function step(){for(const h of men){if(ownerNet(h)){const u=K.remote(h.i);if(u)readUp(h,u);continue}move(h,K.inp(h.i))}
 if(K.tick<CD){vis();return}
 const live=men.filter(m=>!m.out&&!m.dead),lead=live.reduce((a,b)=>!a||b.x>a.x?b:a,null),n=men.length;
 // runners come in from the right, a few from behind
 if(lead&&lead.x<LV.bossX-160){const every=Math.round([200,105,75][K.cpu]/(1+.1*(n-1)));if(K.tick%every===0){const fromBack=Math.random()<.15,x=fromBack?Math.max(8,lead.x-230):lead.x+190+Math.random()*40,c=Math.floor(x/TS),gy=groundY(c);
   if(gy!=null&&!fromBack||gy!=null)foes.push({id:nextId++,k:'s',x,y:gy,vx:0,vy:0,hp:1,on:1,face:fromBack?1:-1,t:0})}}
 for(const f of foes){if(f.dead){f.vy=(f.vy||0)+.2;f.y+=f.vy;if(f.y>LH*TS+60)f.gone=1;continue}if(f.fl>0)f.fl--;
  const near=live.reduce((a,m)=>{const d=Math.hypot(m.x-f.x,m.y-f.y);return d<a.d?{m,d}:a},{m:null,d:1e9});
  if(f.k==='s'){f.t++;f.x+=f.face*1.1;f.vy=Math.min(MAXF,(f.vy||0)+GRAV);let ny=f.y+f.vy;const r=Math.floor(ny/TS),v=tileAt(Math.floor(f.x/TS),r);if(f.vy>=0&&(solid(v)||plat(v))&&f.y<=r*TS+1){ny=r*TS;f.vy=0}f.y=ny;
   if(solid(tileAt(Math.floor((f.x+f.face*6)/TS),Math.floor((f.y-8)/TS))))f.face=-f.face;if(f.y>LH*TS+20||!live.some(m=>Math.abs(m.x-f.x)<320))f.gone=1}
  else if(f.k==='r'){if(!f.on&&near.m&&near.d<240)f.on=1;if(f.on&&near.m){f.face=near.m.x<f.x?-1:1;if(--f.cd<=0){f.cd=[240,130,100][K.cpu];shoot(f.x+f.face*8,f.y-15,near.m,1.5)}}}
  else if(f.k==='T'){if(!f.on&&near.m&&near.d<230)f.on=1;if(f.on&&near.m){const a=Math.atan2(near.m.y-12-f.y,near.m.x-f.x);f.ang=Math.round(a/(Math.PI/4))*(Math.PI/4);if(--f.cd<=0){f.cd=[260,145,110][K.cpu];shoot(f.x+Math.cos(f.ang)*10,f.y+Math.sin(f.ang)*10,null,1.6,f.ang)}}}
  else if(f.k==='cap'){if(!f.on&&lead&&lead.x>f.x0-150){f.on=1;f.x=lead.x-170;f.t=0}if(f.on){f.t++;f.x+=1.3;f.y=f.y0+Math.sin(f.t*.05)*22;if(f.t>500)f.gone=1}}}
 foes=foes.filter(f=>!f.gone);
 // the fortress: two cannons lob shells, the core waits to be destroyed
 if(boss&&!cleared){if(!boss.on&&lead&&lead.x>boss.x-170){boss.on=1;K.fx('bs')}if(boss.on)for(const c of boss.cans){if(c.hp<=0)continue;if(--c.cd<=0){c.cd=[230,90,70][K.cpu];const t=live[Math.floor(Math.random()*live.length)];if(t)shoot(c.x-8,c.y,t,2.2)}}}
 for(const b of eb){b.x+=b.vx;b.y+=b.vy;if(b.g)b.vy+=b.g;b.t--;const v=tileAt(Math.floor(b.x/TS),Math.floor(b.y/TS));if(solid(v)&&v!==6)b.t=0}eb=eb.filter(b=>b.t>0);
 for(const it of items){if(it.got)continue;it.vy=Math.min(3,it.vy+.15);it.y+=it.vy;const r=Math.floor(it.y/TS),v=tileAt(Math.floor(it.x/TS),r);if(it.vy>0&&(solid(v)||plat(v))){it.y=r*TS;it.vy=-it.vy*.4;if(Math.abs(it.vy)<.5)it.vy=0}it.x+=.4;if(it.y>LH*TS+40)it.got=1}
 items=items.filter(it=>!it.got);
 // bridges blow up a plank at a time once someone steps on
 for(const m of live){const c=Math.floor(m.x/TS);if(tileAt(c,10)===4&&!bridgeDone.has(c)){let c0=c;while(tileAt(c0-1,10)===4)c0--;if(!bridgeDone.has('s'+c0)){bridgeDone.add('s'+c0);for(let q=c0,k=0;tileAt(q,10)===4;q++,k++)bridgeDone.add({c:q,at:K.tick+20+k*14})}}}
 for(const e of bridgeDone)if(typeof e==='object'){if(K.tick>=e.at&&!e.gone&&LV.tiles[10*LV.W+e.c]===4){LV.tiles[10*LV.W+e.c]=0;e.gone=1;boom(e.c*TS+8,160,1)}
  // engineers patch the bridge after a while so nobody is stranded
  else if(e.gone&&K.tick>=e.at+480){LV.tiles[10*LV.W+e.c]=4;bridgeDone.delete(e);if(![...bridgeDone].some(o=>typeof o==='object'))for(const o of [...bridgeDone])if(typeof o==='string')bridgeDone.delete(o)}}
 vis();checkEnd()}
function shoot(x,y,tg,sp,ang){sp*=[.8,1,1][K.cpu];const a=ang!=null?ang:Math.atan2(tg.y-12-y,tg.x-x);eb.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:200})}
function checkEnd(){const hum=men.filter(m=>K.seats[m.i]&&K.seats[m.i].ctrl!=='cpu'),live=(hum.length&&K.mode===0?hum:men).filter(m=>!m.out);
 const lender=men.some(m=>!m.out&&m.lives>1&&K.seats[m.i].ctrl!=='cpu');if(!live.length&&lender){if(!men.outAt)men.outAt=K.tick;if(K.tick-men.outAt<300)return}else men.outAt=0;
 const done=cleared&&K.tick-clearT>180,lost=!live.length;if(!done&&!lost)return;
 if(K.mode===0)K.end(done?{coop:1,name:'FORTRESS DESTROYED!'}:{coop:0,name:'THE JUNGLE WON'});
 else{const w=men.slice().sort((a,b)=>b.score-a.score)[0];K.end(w?{i:w.i,name:(w.name||'')+' - '+w.score+' PTS'}:null)}}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy+=p.g;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.85}

/* ---------- guests ---------- */
const PS=['stand_f','stand_u','stand_ud','run1_f','run2_f','run3_f','run1_ud','run2_ud','run3_ud','run1_dd','run2_dd','run3_dd','prone','spin0','spin1','spin2','spin3','die'];
function local(i){const h=men[i];if(h)move(h,K.inp(i));vis()}
function upload(i){const h=men[i];if(!h)return null;return{x:Math.round(h.x*10)/10,y:Math.round(h.y*10)/10,f:h.face,p:PS.indexOf(h.pose),g:h.gun,l:h.lives,o:h.out?1:0,d:h.dead,iv:h.inv>0?1:0,c:h.claims,b:h.bul.map(b=>[Math.round(b.x),Math.round(b.y)])}}
function readUp(h,u){if(typeof u.x!=='number')return;h.x=u.x;h.y=u.y;h.face=u.f;h.pose=PS[u.p]||'stand_f';h.gun=u.g||'R';h.lives=u.l;h.out=!!u.o;h.dead=u.d|0;h.inv=u.iv?2:0;h.bv=u.b||[];
 for(const e of u.c||[])if((e[0]|0)>h.cSeen){h.cSeen=e[0]|0;resolve(h,e)}}
function snap(){const br=[];for(let c=0;c<LV.W;c++)if(LV.orig&&LV.orig[10*LV.W+c]===4&&LV.tiles[10*LV.W+c]===0)br.push(c);
 return{mn:men.map(h=>[Math.round(h.x),Math.round(h.y),h.face,PS.indexOf(h.pose),h.gun,h.lives,h.out?1:0,h.dead,h.inv>0?1:0,h.score,ownerNet(h)?h.ev:0,h.bv||h.bul.map(b=>[Math.round(b.x),Math.round(b.y)])]),
  fo:foes.map(f=>[f.id,f.k,Math.round(f.x),Math.round(f.y),(f.dead?1:0)|(f.on?2:0)|(f.fl>0?4:0),f.k==='T'?Math.round(f.ang*100):f.face||0,f.gun||'']),
  eb:eb.map(b=>[Math.round(b.x),Math.round(b.y)]),it:items.map(it=>[it.id,Math.round(it.x),Math.round(it.y),it.gun]),br,
  bo:boss?[boss.on?1:0,boss.core.hp,boss.cans[0].hp,boss.cans[1].hp]:0,cl:cleared?1:0}}
function apply(g){if(!LV.orig)LV.orig=LV.tiles.slice();const brs=new Set(g.br||[]);for(let c=0;c<LV.W;c++)if(LV.orig[10*LV.W+c]===4)LV.tiles[10*LV.W+c]=brs.has(c)?0:4;
 (g.mn||[]).forEach((a,i)=>{const h=men[i];if(!h)return;h.score=a[9];if(i===K.myIdx){for(const e of a[10]||[])if((e[0]|0)>h.evSeen){h.evSeen=e[0]|0;onEv(h,e[1])}if(a[5]<h.lives&&!h.dead)h.lives=a[5];return}
  h.tx=a[0];h.ty=a[1];h.face=a[2];h.pose=PS[a[3]]||'stand_f';h.gun=a[4];h.lives=a[5];h.out=!!a[6];h.dead=a[7];h.inv=a[8]?2:0;h.bv=a[11]||[];if(h.gx==null){h.x=h.tx;h.y=h.ty;h.gx=1}});
 const fm=new Map(foes.map(f=>[f.id,f]));foes=(g.fo||[]).map(r=>{const o=fm.get(r[0])||{};const f=Object.assign(o,{id:r[0],k:r[1],tx:r[2],ty:r[3],dead:r[4]&1,on:r[4]&2?1:0,fl:r[4]&4?4:0,gun:r[6]});
  if(f.x==null||Math.abs(f.x-r[2])>30){f.x=r[2];f.y=r[3]}if(f.k==='T')f.ang=r[5]/100;else f.face=r[5];return f});
 eb=(g.eb||[]).map(r=>({x:r[0],y:r[1],t:2}));const im=new Map(items.map(i=>[i.id,i]));items=(g.it||[]).map(r=>({id:r[0],x:r[1],y:r[2],gun:r[3],got:im.get(r[0])&&im.get(r[0]).got}));
 if(g.bo&&boss){boss.on=g.bo[0];boss.core.hp=g.bo[1];boss.cans[0].hp=g.bo[2];boss.cans[1].hp=g.bo[3]}cleared=!!g.cl}
function follow(){for(const h of men){if(h.i===K.myIdx||h.tx==null)continue;const dx=h.tx-h.x,dy=h.ty-h.y;if(Math.abs(dx)>40||Math.abs(dy)>40){h.x=h.tx;h.y=h.ty}else{h.x+=dx*.4;h.y+=dy*.4}}
 for(const f of foes){if(f.tx==null)continue;f.x+=(f.tx-f.x)*.35;f.y+=(f.ty-f.y)*.35;if(f.k==='s')f.t=(f.t||0)+1}vis()}
function onFx(k){if(k==='clr'){sfx('boom',40);shake=8}else if(k==='bs')sfx('roar')}

/* ---------- CPU commandos ---------- */
function bot(i){const h=men[i];if(!h||h.dead||K.tick<CD)return{};if(h.out)return K.tick%40===0?{fire:true}:{};const o={},lvl=h.i===meIdx()?2:K.cpu,b=h.bt||(h.bt={lx:h.x,st:0,back:0,jh:0,pr:0});
 if(b.back>0){b.back--;o.left=true;return o}
 if(K.tick%40===0){if(Math.abs(h.x-b.lx)<4&&!targets().some(t=>t.x>h.x-40&&t.x-h.x<180))b.st++;else b.st=0;b.lx=h.x;if(b.st>=3){b.back=20;b.st=0}}
 if(b.pr>0){b.pr--;o.down=true;if((K.tick>>2)&1)o.alt=true;return o}
 const c=Math.floor(h.x/TS),r=Math.floor((h.y-1)/TS);
 // incoming fire: lie down under shots at chest height, jump the low ones
 if(h.gr)for(const e of eb){const dx=e.x-h.x;if(Math.abs(dx)>60||Math.random()>[.15,.35,.6][lvl])continue;const ey=h.y-e.y;if(ey>10&&ey<24){b.pr=14;o.down=true;return o}if(ey>=0&&ey<=10&&Math.abs(dx)<36){o.fire=true;o.right=true;return o}}
 // what to shoot: the nearest target ahead, aimed in 8 directions
 let tg=null,bd=1e9;for(const t of targets()){const dx=t.x-h.x,dy=(t.y-t.h/2)-(h.y-14);if(dx<-110||dx>200)continue;const d=Math.hypot(dx,dy*1.3);if(d<bd){bd=d;tg={dx,dy,id:t.id}}}
 let move=1;if(tg){const a=Math.atan2(tg.dy,Math.abs(tg.dx)),side=tg.dx>=0?1:-1;
  if(a<-1.15){o.up=true;move=0;if(side<0&&h.face>0)o.left=true}else if(a<-.35){o.up=true;o[side>0?'right':'left']=true;move=0}else if(a>.5&&h.gr&&Math.abs(tg.dx)<120){o.down=true;o[side>0?'right':'left']=true;move=0}
  else{if(side<0){o.left=true;move=0}else if(bd<150)move=0}
  if((K.tick>>2)&1)o.alt=true;
  // a soldier about to run into you: hop over him
  if(h.gr&&foes.some(f=>f.k==='s'&&!f.dead&&Math.abs(f.x-h.x)<26&&Math.abs(f.y-h.y)<10)&&Math.random()<[.3,.5,.8][lvl]){o.fire=true;o.right=true;return o}}
 if(!h.gr){o.right=true;o.left=false}
 // don't stand forever behind something you can't hit
 if(!move){b.hold=(b.hold|0)+1;if(b.hold>240){move=1;if(b.hold>330)b.hold=0}}else b.hold=0;
 if(move){o.right=true;o.left=false}
 if(h.gr&&(o.right||move)){const ahead=Math.floor((h.x+HW+6)/TS);
  if(solid(tileAt(ahead,r))||solid(tileAt(ahead,r-1)))o.fire=true;
  let ground=false;for(let k=r+1;k<LH;k++){const v=tileAt(ahead,k);if(solid(v)||plat(v)){ground=true;break}if(v===5)break}if(!ground){o.fire=true;o.right=true}}
 return o}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const cmImg=(pose,col,face)=>img('c'+pose+col+face,()=>{const c=X.recolor(ART.cm[pose]||ART.cm.stand_f,col,{h:'#1c1418',R:'#d82838'},'cm'+pose);return face<0?X.flipX(c):c});
const solImg=(k,face)=>img('s'+k+face,()=>{const c=X.sprite(ART.sol[k],{M:'#4a5a28',G:'#8c8c78',g:'#6c6c58'});return face>0?X.flipX(c):c});
const flashOf=c=>img(c,()=>{const o=X.mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffffff';g.fillRect(0,0,o.width,o.height);return o});
function tile(k){return img('t'+k,()=>{const c=X.mk(16,16),g=c.getContext('2d'),px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1)};
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const h=((x*7+y*13)*37)%17;
  if(k==='top')px(x,y,y<3?(y===0?'#88dc48':h<5?'#38a038':'#5cb444'):y<5&&(x+y)%3===0?'#2a6a28':h<3?'#6c3a1c':h<6?'#8c5030':'#7c4424');
  else if(k==='dirt')px(x,y,h<3?'#6c3a1c':h<6?'#8c5030':'#7c4424');
  else if(k==='rock')px(x,y,(x===0||y===0)?'#9a94a8':(x===15||y===15)?'#3c3648':h<4?'#5c566c':'#6c667c');
  else if(k==='ledge'){if(y<4)px(x,y,y===0?'#88dc48':y===3?'#1c5c30':'#38a038');else if(y<7&&(x*5+y)%4===0)px(x,y,'#2a6a28')}
  else if(k==='bridge'){if(y>=3&&y<8)px(x,y,x%4===3?'#3c200c':y===3?'#c08040':'#9c6030');if(y===1&&x%8<7)px(x,y,'#5a3a20');if(x%8===0&&y<3)px(x,y,'#5a3a20')}
  else if(k==='w0'||k==='w1'){const f=k==='w1'?2:0;px(x,y,y<2?((x+f)%6<3?'#a0f0ff':'#60a0ff'):y<6?'#2058c0':'#142870')}}return c})}
function jungleImg(){return img('jungle',()=>{const w=320,h=140,c=X.mk(w,h),g=c.getContext('2d'),rr=RA.util.mulberry(4);for(let y=0;y<h;y++){g.fillStyle=y<40?'#142870':y<70?'#1c3c70':'#123a30';g.fillRect(0,y,w,1)}
  for(let k=0;k<26;k++){const x=rr()*w,top=40+rr()*30,tw=3+rr()*3|0;g.fillStyle='#0c2418';g.fillRect(x|0,top|0,tw,h);for(let q=0;q<5;q++){g.fillStyle=q&1?'#164a2a':'#0f3420';const a=q*1.3,lx=x+Math.cos(a)*10,ly=top+Math.sin(a)*4;for(let s=0;s<14;s++)g.fillRect(Math.round(x+(lx-x)*s/7),Math.round(top+(ly-top)*s/7+s*s*.04),2,2)}}
  for(let x=0;x<w;x++){const hh=Math.round(8+6*Math.sin(x*.05)+4*Math.sin(x*.13));g.fillStyle='#0a2a1a';g.fillRect(x,h-hh-40,1,hh+40)}return c})}
const cams=[];let SCR=null;
function view(g,focus,vx,vy,vw,vh,ci){let cam=cams[ci];const lead=focus.reduce((a,b)=>b.x>a.x?b:a);let tx=Math.max(0,Math.min(LV.W*TS-vw,lead.x-vw*.4));if(!cam)cam=cams[ci]={x:tx,tk:K.tick};
 let nn=0;while(cam.tk<K.tick&&nn++<30){cam.tk++;cam.x+=(tx-cam.x)*.15}cam.tk=K.tick;const cx=Math.round(cam.x)+(shake>.5?Math.round((Math.random()-.5)*shake):0),cy=LH*TS-vh;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 const jg=jungleImg(),off=-Math.round((cx*.4)%jg.width);for(let x=off-jg.width;x<vw;x+=jg.width)g.drawImage(jg,vx+x,vy);
 g.translate(vx-cx,vy-cy);
 const c0=Math.max(0,Math.floor(cx/TS)),c1=Math.min(LV.W-1,Math.floor((cx+vw)/TS));
 for(let r=0;r<LH;r++)for(let c=c0;c<=c1;c++){const v=tileAt(c,r);if(!v)continue;const k=v===1?(tileAt(c,r-1)===1?'dirt':'top'):v===2||v===6?'rock':v===3?'ledge':v===4?'bridge':((K.tick>>4)&1?'w1':'w0');g.drawImage(tile(k),c*TS,r*TS)}
 // the fortress
 if(boss&&boss.x<cx+vw+40){const x=boss.x+40,y=60;g.fillStyle='#3c3648';g.fillRect(x,y,120,100);for(let r=0;r<5;r++)for(let c=0;c<6;c++){g.fillStyle=(r+c)&1?'#5c566c':'#4c465c';g.fillRect(x+c*20+1,y+r*20+1,18,18)}
  g.fillStyle='#f05050';g.fillRect(x+8,y-6,104,6);for(let k=0;k<6;k++){g.fillStyle='#fff07c';g.fillRect(x+12+k*18,y-5,4,3)}
  boss.cans.forEach(c=>{if(c.hp<=0){g.fillStyle=P.k;g.fillRect(c.x-6,c.y,12,12);return}g.fillStyle=c.fl>0?'#ffffff':'#9a94a8';g.fillRect(c.x-6,c.y,12,12);g.fillStyle=P.k;g.fillRect(c.x-16,c.y+4,12,4)});
  const co=boss.core;if(co.hp>0){const pul=(K.tick>>3)&1;g.fillStyle=P.k;g.fillRect(co.x-10,co.y-2,20,32);g.fillStyle=co.fl>0?'#ffffff':pul?'#f05050':'#b8202c';g.fillRect(co.x-8,co.y,16,28);g.fillStyle='#ffb0b0';g.fillRect(co.x-5,co.y+4,4,6)}else{g.fillStyle=P.k;g.fillRect(co.x-10,co.y-2,20,32)}}
 for(const f of foes){if(f.x<cx-30||f.x>cx+vw+30)continue;
  if(f.k==='s'||f.k==='r'){const k=f.dead?'r1':f.k==='r'?'aim':['r1','r2','r3','r2'][((f.t||0)>>3)&3],im=solImg(k,f.face||-1);const draw=f.fl>0?flashOf(im):im;g.drawImage(draw,Math.round(f.x-im.width/2),Math.round(f.y-im.height+1))}
  else if(f.k==='T'){const a=f.ang||Math.PI;g.fillStyle=P.k;g.fillRect(f.x-7,f.y-7,14,14);g.fillStyle=f.dead?'#3c3648':f.fl>0?'#ffffff':'#9a94a8';g.fillRect(f.x-6,f.y-6,12,12);g.fillStyle=f.dead?'#2c2638':'#f05050';g.fillRect(f.x-2,f.y-2,4,4);
   if(!f.dead){g.fillStyle=P.k;for(let q=4;q<12;q++)g.fillRect(Math.round(f.x+Math.cos(a)*q)-1,Math.round(f.y+Math.sin(a)*q)-1,3,3);g.fillStyle='#e8e4dc';for(let q=4;q<12;q++)g.fillRect(Math.round(f.x+Math.cos(a)*q),Math.round(f.y+Math.sin(a)*q),1,1)}}
  else if(f.k==='cap'&&f.on&&!f.dead){const im=img('cap'+((K.tick>>3)&1),()=>X.sprite(ART.caps[(K.tick>>3)&1]));g.drawImage(im,Math.round(f.x-im.width/2),Math.round(f.y))}}
 for(const it of items){const e=img('eagle',()=>X.sprite(ART.eagle,{W:'#f05050'}));g.drawImage(e,Math.round(it.x-7),Math.round(it.y-12));X.text(g,it.gun,it.x,it.y-12,{col:'#ffffff',align:'center',outline:P.k})}
 for(const h of men){if(h.out)continue;if(h.inv>0&&!h.dead&&(K.tick>>1)&1)continue;const im=cmImg(h.pose,h.col,h.face);g.drawImage(im,Math.round(h.x-im.width/2),Math.round(h.y-im.height+1));
  if(focus.includes(h)&&focus.length===1){g.fillStyle=P.k;g.fillRect(Math.round(h.x)-3,Math.round(h.y)-35,7,4);g.fillStyle=(K.tick>>3)&1?'#ffffff':h.col;g.fillRect(Math.round(h.x)-2,Math.round(h.y)-34,5,1);g.fillRect(Math.round(h.x)-1,Math.round(h.y)-33,3,1)}
  const hum=K.seats[h.i]&&K.seats[h.i].ctrl!=='cpu';if(hum&&(!focus.includes(h)||focus.length>1))X.text(g,(h.name||'').slice(0,6),h.x,h.y-40,{col:h.col,align:'center',outline:P.k})}
 for(const h of men){const bl=isMine(h)?h.bul:(h.bv||[]);for(const b of bl){const bx=Math.round(b.x!=null?b.x:b[0]),by=Math.round(b.y!=null?b.y:b[1]),k=b.k||h.gun;
  if(k==='L'){g.fillStyle='#a0f0ff';g.fillRect(bx-4,by-1,8,2);g.fillStyle='#ffffff';g.fillRect(bx-3,by,6,1)}else if(k==='F'){g.fillStyle='#ffa040';g.fillRect(bx-2,by-2,5,5);g.fillStyle='#fff07c';g.fillRect(bx-1,by-1,3,3)}else{g.fillStyle=P.k;g.fillRect(bx-1,by-1,3,3);g.fillStyle=k==='S'?'#f05050':'#ffffff';g.fillRect(bx,by,1+(k==='M'?1:0),1+(k==='M'?1:0))}}}
 for(const b of eb){g.fillStyle=P.k;g.fillRect(Math.round(b.x)-2,Math.round(b.y)-2,4,4);g.fillStyle=(K.tick>>2)&1?'#ffa040':'#fff07c';g.fillRect(Math.round(b.x)-1,Math.round(b.y)-1,2,2)}
 for(const p of parts){g.fillStyle=p.col;g.fillRect(Math.round(p.x),Math.round(p.y),p.sz||1,p.sz||1)}
 for(const t of texts)X.text(g,t.s,t.x,t.y,{col:t.col,align:'center',outline:P.k});
 g.restore();hud(g,focus,vx,vy,vw,vh)}
function hud(g,focus,vx,vy,vw,vh){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),me=focus[0];
 if(K.tick<CD)TX('JUNGLE FORCE - GO!',vx+vw/2,vy+50,{col:'#fff07c',align:'center',scale:2});
 if(K.demo){TX('JUNGLE FORCE',vx+vw/2,vy+vh-16,{col:'#fff07c',align:'center',scale:2});return}
 focus.forEach((h,k)=>{const x=vx+4+k*80,y=vy+14;TX((focus.length>1?(h.name||'').slice(0,5)+' ':'')+'',x,y,{col:h.col});for(let l=0;l<Math.min(8,h.lives);l++){g.fillStyle=P.k;g.fillRect(x+l*6,y+9,5,7);g.fillStyle=h.col;g.fillRect(x+l*6+1,y+10,3,5);g.fillStyle='#fff07c';g.fillRect(x+l*6+2,y+11,1,1)}
  TX(GUNS[h.gun].n,x,y+18,{col:h.gun==='R'?'#9a94a8':'#fff07c'});TX(h.score+'',x,y+27,{col:'#ffffff'})});
 const alive=men.filter(m=>!m.out).length;TX(alive+'/'+men.length+' IN THE FIGHT',vx+vw-4,vy+14,{col:'#a0f0ff',align:'right'});
 if(boss&&boss.on&&!cleared){TX('DESTROY THE CORE!',vx+vw/2,vy+14,{col:'#f05050',align:'center'});const bw=100,bx=vx+vw/2-50;g.fillStyle=P.k;g.fillRect(bx-1,vy+23,bw+2,5);g.fillStyle='#f05050';g.fillRect(bx,vy+24,Math.round(bw*boss.core.hp/60),3)}
 if(cleared)TX('FORTRESS DESTROYED!',vx+vw/2,vy+vh*.35,{col:'#fff07c',align:'center',scale:2});
 const t=K.tick-CD,pad=K.seats[me.i]&&/^gp|touch/.test(K.seats[me.i].ctrl);
 if(t>0&&t<60*6)TX(pad?'A JUMP - B SHOOT - STICK AIMS':'A D RUN - SPACE JUMP - E / SHIFT SHOOT',vx+vw/2,vy+vh-22,{col:'#ffffff',align:'center'});
 else if(t>=60*6&&t<60*12)TX('HOLD W / S TO AIM UP / DOWN - S TO LIE DOWN',vx+vw/2,vy+vh-22,{col:'#fff07c',align:'center'});
 else if(t>=60*12&&t<60*17)TX('SHOOT THE FLYING CAPSULES FOR WEAPONS',vx+vw/2,vy+vh-22,{col:'#88dc48',align:'center'});
 if(me.out)TX(K.mode===0&&men.some(m=>m!==me&&!m.out&&m.lives>1&&K.seats[m.i].ctrl!=='cpu')?'OUT - PRESS SPACE TO BORROW A LIFE':'OUT OF LIVES',vx+vw/2,vy+vh*.5,{col:'#f05050',align:'center'})}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!LV||!men.length){SCR.present(ctx,W,H);return}
 let ids=K.demo?[]:K.focus();if(!ids.length){const lead=men.filter(m=>!m.out).sort((a,b)=>b.x-a.x)[0]||men[0];ids=[lead.i]}
 const focus=ids.map(i=>men[i]).filter(Boolean);view(g,focus.length?focus:[men[0]],0,0,SCR.w,SCR.h-(K.demo?0:9),0);SCR.present(ctx,W,H)}
K=RA.kit({id:'jungle',name:'JUNGLE FORCE',kind:'Run and gun',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Co-op run and gun for up to 20: somersault through the jungle, aim in 8 directions, shoot the capsules for spread, machine gun, laser and fire, and bring down the fortress together.',
 blurb:'A / D run, Space jumps, E / Shift / right-click shoots, hold W / S to aim up or down (S to lie down). Out of lives? Space borrows one from a friend.',
 howto:'A / D run, Space / click jump, E / Shift / right-click shoot. Hold W to aim up, W + A/D diagonally up, S + A/D diagonally down, S standing to go prone, S in the air to shoot down. S + Space on a ledge drops through it.',
 icon:['...kkkk...','..krrrrk..','.kksskks..','..kssssk..','.kkkkkkkkk','kssbbsk...','.kbbbbk...','.kbbkbbk..','.kbk.kbk..','kkk...kkk.'],
 music:MUSIC,fireLabel:'JUMP',
 modes:[['CO-OP','Bring down the fortress together; borrow lives from friends.'],['SCORE ATTACK','Same stage: the best score wins.']],
 settings:[['length','Stage',[['normal','Normal'],['short','Short'],['long','Long']]],['lives','Lives',[[5,'5 lives'],[3,'3 lives'],[9,'9 lives']]]],
 kb:[['A D','run'],['SPACE','jump'],['E SHIFT RMB','shoot'],['W S','aim / prone'],['C','chat'],['ESC','menu']],pad:[['LS','run / aim'],['A','jump'],['B','shoot'],['START','menu']],
 ach:[{id:'first',name:'Boots On',desc:'Play your first stage',test:s=>s.played>=1,unlock:'title:Recruit'},{id:'win1',name:'Mission Complete',desc:'Destroy the fortress',test:(s,m)=>m.won,unlock:'title:Commando'},
  {id:'k100',name:'One Man Army',desc:'100 kills in one stage',test:(s,m)=>m.kills>=100,unlock:'title:One Man Army'}],
 alive:i=>!!men[i]&&!men[i].out,out:i=>!!men[i]&&men[i].out,
 start:(...a)=>{start(...a);LV.orig=LV.tiles.slice()},step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>K.mode===0?'Co-op':'Score attack',
 ranks:()=>men.slice().sort((a,b)=>b.score-a.score).map(h=>[h.name,h.col,h.score+' pts · '+h.kills+' kills'+(h.out?' · out':'')]),
 result:(i,w)=>{const h=men[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.i===i),kills:h.kills|0}}});
window.__jf={get men(){return men},get foes(){return foes},get lv(){return LV},get boss(){return boss},K,bot:i=>bot(i)};

})();
