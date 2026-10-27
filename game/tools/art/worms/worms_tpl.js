/* WORM WAR for Retro Arena: artillery with destructible pixel terrain for up to 20, with teams battling across an island.
   The original it follows: teams of worms on an island you blow apart; aim with the cursor keys, hold fire for power, mind
   the wind; bazooka, grenades with fuses, cluster bombs, the sheep, the relic grenade, the ninja rope; crates fall in by
   parachute; fall too far and it hurts, fall in the water and you're gone. Last team with a worm standing wins.
   The 20-player twist: ALL AT ONCE turns - every team gets one attack per round at the same time (new wind every round),
   so twenty people never wait for each other. CLASSIC TURNS (one team at a time, like the original) for small groups.
   First seconds: hints show A / D walk, W / S aim, SPACE hold for power and release to fire, Q next weapon, E jump.
   An aim cross and a power arc show where you're shooting; your worm has an arrow over its head.
   Online: your worms walk, jump and swing on your own device (RA.kit localFirst) and your shots are claims; the host flies
   every projectile, blows the craters (sent to guests as an ordered list) and deals the damage.
   Sprites are painted in tools/art/worms (python), exported as ART below; edit worms_tpl.js there and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
/*ART*/
const TM=RA.music.track,sfx=RA.audio.sfx;
const WH=360,G=.11,WR=4,WHT=10,TEAMC=['#e83838','#2888ff'],TEAMN=['Red team','Blue team'];
RA.audio.add('boom',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.setValueAtTime(900,now);f.frequency.exponentialRampToValueAtTime(120,now+.5);s.connect(f);f.connect(g);g.gain.setValueAtTime(.5,now);g.gain.exponentialRampToValueAtTime(.001,now+.6);s.start(now);s.stop(now+.62)});
RA.audio.add('fire',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='bandpass';f.frequency.value=1200;s.connect(f);f.connect(g);g.gain.setValueAtTime(.22,now);g.gain.exponentialRampToValueAtTime(.001,now+.18);s.start(now);s.stop(now+.2)});
RA.audio.add('bang',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=700;s.connect(f);f.connect(g);g.gain.setValueAtTime(.35,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);s.start(now);s.stop(now+.13)});
RA.audio.add('tick',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.value=1500;g.gain.setValueAtTime(.04,now);g.gain.exponentialRampToValueAtTime(.001,now+.03);o.connect(g);o.start(now);o.stop(now+.04)});
RA.audio.add('splash',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='bandpass';f.frequency.setValueAtTime(600,now);f.frequency.exponentialRampToValueAtTime(2000,now+.3);s.connect(f);f.connect(g);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.001,now+.45);s.start(now);s.stop(now+.46)});
RA.audio.add('baa',(AC,now,g)=>{const o=AC.createOscillator(),l=AC.createOscillator(),q=AC.createGain();o.type='sawtooth';o.frequency.value=330;l.frequency.value=28;q.gain.value=40;l.connect(q);q.connect(o.frequency);g.gain.setValueAtTime(.07,now);g.gain.exponentialRampToValueAtTime(.001,now+.5);o.connect(g);o.start(now);l.start(now);o.stop(now+.5);l.stop(now+.5)});
RA.audio.add('holy',(AC,now,g)=>{[523,659,784,1047].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='triangle';o.frequency.value=f;q.gain.setValueAtTime(0,now);q.gain.linearRampToValueAtTime(.05,now+.15);q.gain.exponentialRampToValueAtTime(.001,now+1.1);o.connect(q);q.connect(g);o.start(now+k*.02);o.stop(now+1.15)});g.gain.value=1});
const MUSIC=[TM('Worm Parade',120,['C','Am','F','G'],'k..sk..sk.ksk..s','c5 e5 g5 e5 c5 . g4 . a4 c5 e5 c5 a4 . e4 . f4 a4 c5 a4 f4 . c5 . g4 b4 d5 b4 g4 . d5 .'),
 TM('Island Dawn',96,['Dm','Bb','F','C'],'k...s...k.k.s...','d5 . f5 . a5 . f5 . bb4 . d5 . f5 . d5 . a4 . c5 . f5 . c5 . g4 . c5 . e5 . g5 .'),
 TM('Sudden Death',152,['Em','C','D','B'],'kshskshskshskshs','e5 g5 b5 g5 e5 g5 b5 e6 c5 e5 g5 e5 c5 e5 g5 c6 d5 f#5 a5 f#5 d5 f#5 a5 d6 b4 d#5 f#5 b5 f#5 d#5 b4 .')];
// ---------- weapons ----------
// kind: c = hold fire for power and release, i = instant, d = drop at your feet, t = point at a target
const WP=[{k:'bazooka',n:'BAZOOKA',ki:'c',ammo:-1,r:26,dmg:45,wind:1,spr:'rocket',hold:'bazooka'},
 {k:'grenade',n:'GRENADE',ki:'c',ammo:-1,r:24,dmg:42,fuse:180,bnc:.45,spr:'grenade',hold:'launcher'},
 {k:'shotgun',n:'SHOTGUN',ki:'i',ammo:-1,dmg:22,hold:'shotgun'},
 {k:'cluster',n:'CLUSTER BOMB',ki:'c',ammo:2,r:18,dmg:24,fuse:180,bnc:.4,spr:'cluster',hold:'launcher',bits:5},
 {k:'homing',n:'HOMING MISSILE',ki:'c',ammo:1,r:24,dmg:42,spr:'missile',hold:'bazooka'},
 {k:'dynamite',n:'DYNAMITE',ki:'d',ammo:1,r:38,dmg:60,fuse:300,spr:'dynamite'},
 {k:'mine',n:'MINE',ki:'d',ammo:2,r:28,dmg:45,spr:'mine'},
 {k:'sheep',n:'SHEEP',ki:'d',ammo:1,r:36,dmg:60,spr:'sheep'},
 {k:'bat',n:'BASEBALL BAT',ki:'i',ammo:1,dmg:30,hold:'bat'},
 {k:'punch',n:'FIRE PUNCH',ki:'i',ammo:1,dmg:30,hold:'punch'},
 {k:'rope',n:'NINJA ROPE',ki:'i',ammo:-1,free:1},
 {k:'tele',n:'TELEPORT',ki:'t',ammo:1,spr:'tele'},
 {k:'girder',n:'GIRDER',ki:'t',ammo:2},
 {k:'air',n:'AIR STRIKE',ki:'t',ammo:0,r:20,dmg:26,spr:'strike'},
 {k:'banana',n:'BANANA BOMB',ki:'c',ammo:0,r:30,dmg:50,fuse:180,bnc:.5,spr:'banana',hold:'launcher',bits:5},
 {k:'holy',n:'RELIC GRENADE',ki:'c',ammo:0,r:46,dmg:75,fuse:180,bnc:.3,spr:'holy',hold:'launcher'}];
const WI={};WP.forEach((w,i)=>WI[w.k]=i);const CRATE=['air','banana','holy','homing','cluster','sheep','dynamite','tele'];
const THEMES={meadow:{n:'MEADOW',sky:['#4888d8','#78b0f0','#a8d0f8'],far:'#7c9cc8',top:['#88dc48','#38a038'],soil:['#8c5c34','#7a4e2a','#6a4222','#5a3a20'],stone:['#9a94a8','#5c566c'],water:['#2858b8','#4880e0']},
 arctic:{n:'ARCTIC',sky:['#7cb0e0','#a8d0f0','#d0e8f8'],far:'#a8c0d8',top:['#ffffff','#c8e8ff'],soil:['#6890c8','#5878b0','#4a6a9c','#3c5a88'],stone:['#c8e8ff','#a0c8f0'],water:['#3c6ac8','#6898e8']},
 desert:{n:'DESERT',sky:['#f0b060','#f8c878','#f8e0a8'],far:'#d89c60',top:['#f8e0a0','#e8c078'],soil:['#d8a058','#c88c48','#b87c40','#a06c38'],stone:['#e8c088','#8c5c34'],water:['#2c78a8','#48a0c8']},
 hell:{n:'HELL',sky:['#08040c','#1c0810','#3c1018'],far:'#2c0c14',top:['#ffa040','#e06818'],soil:['#9a94a8','#7c7890','#5c566c','#4c4658'],stone:['#f05050','#2c2638'],water:['#e06818','#f0a040']}};
let K,W=800,mask=null,tex=null,texG=null,TH=null,worms=[],teams=[],proj=[],crates=[],fx=[],parts=[],texts=[],ops=[],opsDone=0,wind=0,water=WH-14,round=0,phase='round',phT=0,turnT=1200,active=[],turnTeam=0,nextId=1,sdRound=8,classic=false,winT=0;
const teamOf=i=>K.mode===1?i%2:i,ownerNet=s=>K.seats[s]&&K.seats[s].ctrl==='net',isMine=w=>K.isClient()?w.seat===K.myIdx:!ownerNet(w.seat);
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const C32=h=>{const c=X.hex(h);return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0};
const solidAt=(x,y)=>{x|=0;y|=0;if(x<0||x>=W||y<0)return false;if(y>=WH)return true;return mask[y*W+x]===1};
/* ---------- the island ---------- */
function vnoise(seed){const rr=RA.util.mulberry(seed),g=new Float32Array(64*64);for(let i=0;i<g.length;i++)g[i]=rr();
 return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,s=t=>t*t*(3-2*t),a=g[(yi&63)*64+(xi&63)],b=g[(yi&63)*64+((xi+1)&63)],c=g[((yi+1)&63)*64+(xi&63)],d=g[((yi+1)&63)*64+((xi+1)&63)];
  return a+(b-a)*s(fx)+(c-a)*s(fy)+(a-b-c+d)*s(fx)*s(fy)}}
function genMap(seed,th){const n1=vnoise(seed),n2=vnoise(seed+7),rr=RA.util.mulberry(seed+3);mask=new Uint8Array(W*WH);
 const base=x=>WH*.52+Math.sin(x/W*Math.PI*2*(1+rr()*0))*20-Math.sin(x/W*Math.PI)*60+n1(x/90,3.3)*50-25;
 const bx=new Float32Array(W);for(let x=0;x<W;x++){const e=Math.min(1,Math.min(x,W-x)/90);bx[x]=base(x)+(1-e)*120}
 for(let y=0;y<WH;y++)for(let x=0;x<W;x++){const depth=y-bx[x],cave=n2(x/38,y/30)+n1(x/70+9,y/50)*.6;let s=depth>0&&!(cave>1.08&&depth>14&&y<WH-30);
  // floating islands high up
  if(!s&&y<bx[x]-40&&n2(x/45+20,y/22+5)>.86&&y>40)s=true;if(y>WH-18&&depth>-30&&Math.min(x,W-x)>40)s=s||depth>0;mask[y*W+x]=s?1:0}
 // smooth: drop single pixels
 for(let y=1;y<WH-1;y++)for(let x=1;x<W-1;x++){const q=y*W+x,n=mask[q-1]+mask[q+1]+mask[q-W]+mask[q+W];if(mask[q]&&n<=1)mask[q]=0;else if(!mask[q]&&n>=4)mask[q]=1}
 paintTex(th)}
function paintTex(th){const t=THEMES[th];tex=X.mk(W,WH);texG=tex.getContext('2d');const im=texG.createImageData(W,WH),o=new Uint32Array(im.data.buffer);
 const top=t.top.map(C32),soil=t.soil.map(C32),stone=t.stone.map(C32);
 for(let x=0;x<W;x++){let d=99;for(let y=0;y<WH;y++){const q=y*W+x;if(!mask[q]){d=0;continue}d++;let c;
  if(d<=2)c=top[d===1?0:1];else if(d<=4&&hash(x,y)<.5)c=top[1];
  else{const h=hash(x>>2,y>>2),hs=hash(x,y);c=soil[Math.min(3,Math.floor((d-4)/22)+(hs<.15?1:0))];if(h<.06&&hash(x>>1,y>>1)<.7)c=hs<.5?stone[0]:stone[1];if(hs<.012)c=stone[1]}
  o[q]=c}}texG.putImageData(im,0,0)}
// craters and girders are 'ops' applied in order on every device
function applyOp(op){if(op[0]==='c'){const[,x,y,r]=op;const x0=Math.max(0,x-r-3|0),x1=Math.min(W-1,x+r+3|0),y0=Math.max(0,y-r-3|0),y1=Math.min(WH-1,y+r+3|0),im=texG.getImageData(x0,y0,x1-x0+1,y1-y0+1),o=new Uint32Array(im.data.buffer),w=x1-x0+1;
  for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){const d=Math.hypot(xx-x,yy-y),q=yy*W+xx,k=(yy-y0)*w+(xx-x0);if(d<=r){mask[q]=0;o[k]=0}else if(d<=r+3&&mask[q]){const c=o[k];o[k]=((255<<24)|(((c>>16)&255)*.55)<<16|(((c>>8)&255)*.55)<<8|((c&255)*.55))>>>0}}
  texG.putImageData(im,x0,y0)}
 else if(op[0]==='g'){const[,x,y]=op,gs=img('girder',()=>X.sprite(ART.t.girder));for(let yy=0;yy<5;yy++)for(let xx=0;xx<32;xx++){const px=x-16+xx,py=y-2+yy;if(px>=0&&px<W&&py>=0&&py<WH)mask[py*W+px]=1}texG.drawImage(gs,x-16,y-2)}}
function addOp(op){ops.push(op);applyOp(op);opsDone=ops.length}
const surfaceY=(x,from)=>{for(let y=from||0;y<WH;y++)if(solidAt(x,y))return y;return WH};
/* ---------- match ---------- */
function start(seats,md,S,seed){const rr=RA.util.mulberry(seed),n=seats.length,per=S.worms==null||S.worms==='auto'?(n<=2?3:n<=6?2:1):+S.worms;classic=S.turns==='classic';
 turnT=(+S.time||20)*60;sdRound=+S.sd||8;W=Math.max(640,Math.min(1600,380+n*per*42));
 const th=S.map==null||S.map==='rnd'?Object.keys(THEMES)[Math.floor(rr()*4)]:S.map;TH=th;genMap(seed,th);
 ops=[];opsDone=0;proj=[];crates=[];fx=[];parts=[];texts=[];nextId=1;round=0;phase='settle';phT=0;water=WH-14;winT=0;turnTeam=0;
 teams=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,ammo:WP.map(w=>w.ammo),wsel:0,next:0}));
 worms=[];const total=n*per,slots=[];for(let k=0;k<total;k++)slots.push((k+.5)/total);for(let k=slots.length-1;k>0;k--){const j=Math.floor(rr()*(k+1));[slots[k],slots[j]]=[slots[j],slots[k]]}
 let k=0;for(let i=0;i<n;i++)for(let j=0;j<per;j++){let x=Math.round(40+slots[k++]*(W-80)),y=surfaceY(x);for(let t=0;t<40&&(y>=water-6||y<20);t++){x=Math.round(40+rr()*(W-80));y=surfaceY(x)}
  worms.push({id:worms.length,seat:i,j,name:per>1?(s=>s)(['Loam','Pebble','Sprout','Mulch','Bramble','Silt','Wiggle','Grub'][(i*3+j)%8]):seats[i].name,x,y,vx:0,vy:0,gr:false,face:x<W/2?1:-1,aim:-.5,hp:+S.hp||100,dead:false,pose:'idle1',dist:0,rope:null,pw:0,ch:false,ev:[],evSeq:0,evSeen:0,fall:0,shots:[],sseq:0,acted:false,kills:0,dmg:0,hurt:0})}
 active=teams.map(()=>-1);startT=K.tick;newRound()}
const liveWorms=s=>worms.filter(w=>w.seat===s&&!w.dead);
const aliveTeams=()=>{const t=new Set();for(const w of worms)if(!w.dead)t.add(teamOf(w.seat));return t};
function newRound(){round++;phase='round';phT=K.tick;wind=Math.round((Math.random()*2-1)*(round===1?.3:1)*10)/10;
 if(classic){let tries=0;do{turnTeam=(turnTeam+(round>1?1:0))%teams.length;tries++}while(!liveWorms(turnTeam).length&&tries<=teams.length)}
 teams.forEach((t,s)=>{const lw=liveWorms(s);if(!lw.length){active[s]=-1;return}const w=lw[t.next%lw.length];t.next++;active[s]=classic&&s!==turnTeam?-1:w.id});
 for(const w of worms){w.acted=false;w.pw=0;w.ch=false}
 if(round>sdRound){water-=6;say(null,'SUDDEN DEATH: THE WATER RISES!','#60a0ff')}
 if(Math.random()<.55||round===2){const health=Math.random()<.35,x=40+Math.random()*(W-80);crates.push({id:nextId++,x,y:-10,vy:0,k:health?'health':'crate',w:health?-1:WI[CRATE[Math.floor(Math.random()*CRATE.length)]],land:0})}
 K.fx('r',round)}
const activeOf=s=>active[s]>=0?worms[active[s]]:null;
function step(){for(const w of worms){if(w.dead)continue;if(ownerNet(w.seat)){const u=K.remote(w.seat);if(u)readUp(w,u);continue}const me=activeOf(w.seat)===w;control(w,me&&phase==='round'?K.inp(w.seat):{},me)}
 // shot claims from guests
 for(let s=0;s<teams.length;s++){if(!ownerNet(s))continue;const u=K.remote(s);if(!u||!u.sh)continue;const t=teams[s];for(const c of u.sh)if((c[0]|0)>(t.seen|0)){t.seen=c[0]|0;const w=worms[c[1]];if(w&&w.seat===s&&!w.dead)doShot(w,c.slice(2))}}
 world();phases();vis()}
function world(){for(const p of proj)projStep(p);proj=proj.filter(p=>!p.gone);
 for(const c of crates){if(!c.land){c.vy=Math.min(c.vy+.05,.9);c.y+=c.vy;if(solidAt(c.x,c.y+5)){c.land=1;c.vy=0}if(c.y>water){c.gone=1}}else if(!solidAt(c.x,c.y+6)){c.land=0}}
 crates=crates.filter(c=>!c.gone)}
function phases(){const now=K.tick;
 if(phase==='round'){const done=worms.filter(w=>!w.dead&&activeOf(w.seat)===w).every(w=>w.acted&&now-w.actT>150);if(now-phT>=turnT||done&&now-phT>90){phase='settle';phT=now}}
 else if(phase==='settle'){const busy=proj.some(p=>p.k!=='mine'||p.trig)||worms.some(w=>!w.dead&&(!w.gr||w.hurt>0));if(!busy&&now-phT>60||now-phT>480){
  const at=aliveTeams();if(at.size<=1&&teams.length>1||teams.length===1&&!worms.some(w=>!w.dead)){if(!winT){winT=now;finish(at)}return}newRound()}}}
function finish(at){const t=[...at][0];if(K.mode===1)K.end(t==null?null:{team:t,name:TEAMN[t]});else K.end(t==null?null:{i:t})}
/* ---------- a worm: walk, jump, aim, fire, rope (runs on its owner's device) ---------- */
function hitBox(x,y){return solidAt(x-3,y-1)||solidAt(x+3,y-1)||solidAt(x-3,y-8)||solidAt(x+3,y-8)||solidAt(x,y-10)||solidAt(x,y-1)||solidAt(x-4,y-5)||solidAt(x+4,y-5)}
function control(w,inp,me){if(w.hurt>0)w.hurt--;
 const t=teams[w.seat],tap=k=>inp[k]&&!(w.prev&&w.prev[k]),done=()=>{phys(w);w.prev=Object.assign({},inp);w.pose=poseOf(w)};
 // the weapon menu (Q): move through the grid with WASD / the stick / the mouse, Space or a click picks, Q closes
 if(me&&t.menu){menuStep(w,t,inp,tap);done();return}
 if(me&&!w.acted&&!w.rope&&phase==='round'&&tap('b3')){t.menu=1;t.mc=t.wsel;t.mT=K.tick;sfx('tick');done();return}
 // your sheep is loose: E makes it jump, Space blows it up
 const sh=me&&proj.find(p=>p.k==='sheep'&&p.own===w.id&&!p.gone);if(sh){if(tap('alt'))sheepCmd(w,sh,'sj');if(tap('fire'))sheepCmd(w,sh,'sd');done();return}
 const wp=WP[t.wsel];
 // aim: W / S (or the mouse), relative to where you face
 if(me){if(inp.aim!=null){const a=inp.aim,f=Math.cos(a)>=0?1:-1;if(!w.rope||true){w.face=f;w.aim=Math.max(-1.55,Math.min(1.55,f>0?a:Math.atan2(Math.sin(a),-Math.cos(a))))}}
  else if(!w.rope){if(inp.up)w.aim=Math.max(-1.55,w.aim-.035);if(inp.down)w.aim=Math.min(1.55,w.aim+.035)}}
 if(w.rope){ropeStep(w,inp,me);w.prev=Object.assign({},inp);return}
 // walking and jumping
 if(w.gr&&w.hurt<=0){let dir=me&&!w.ch?(inp.right?1:0)-(inp.left?1:0):0;if(inp.ax!=null&&Math.abs(inp.ax)>.3&&me&&!w.ch)dir=Math.sign(inp.ax);
  if(dir){w.face=dir;w.walk=(w.walk||0)+.7;while(w.walk>=1){w.walk--;let moved=false;for(let up=0;up<=6;up++)if(!hitBox(w.x+dir,w.y-up)){w.x+=dir;w.y-=up;moved=true;break}if(!moved){w.blk=(w.blk|0)+1;break}w.blk=0;w.dist++;w.wk=K.tick;
    // walking downhill: settle onto the ground below (up to 8 px) instead of dropping into a fall every step
    let d=0;while(d<8&&!hitBox(w.x,w.y+1)){w.y++;d++}if(!hitBox(w.x,w.y+1))w.y-=d}}
  if(w.blk>20&&dir)w.wallT=K.tick;            // pushing against a wall: the hint says how to get up
  if(me&&tap('alt')&&!w.ch){w.vx=w.face*1.6;w.vy=-3.4;w.gr=false;w.y-=1;w.jt=K.tick;w.flip=0;sfx('tick')}
  else if(me&&tap('b4')&&!w.ch)backflip(w)}
 // in the air: press jump again for a high back-flip (the classic double jump), and steer a little
 else if(!w.gr&&w.hurt<=0&&me){if(tap('alt')&&!w.flip&&K.tick-(w.jt||-99)<22){backflip(w)}
  const dir=(inp.right?1:0)-(inp.left?1:0);if(dir&&!w.ch)w.vx=Math.max(-1.9,Math.min(1.9,w.vx+dir*.04))}
 // fire
 if(w.noFire){if(!inp.fire)w.noFire=0}
 else if(me&&!w.acted&&phase==='round'&&w.hurt<=0){
  if(wp.ki==='c'){if(inp.fire&&t.ammo[t.wsel]!==0){w.ch=true;w.pw=Math.min(1,w.pw+1/55);if(w.pw>=1)release(w,t)}else if(w.ch)release(w,t)}
  else if(tap('fire')&&t.ammo[t.wsel]!==0)shoot(w,t,1)}
 else if(!inp.fire){w.ch=false}
 if(wp.k==='rope'&&me&&tap('fire'))ropeFire(w);
 phys(w);w.prev=Object.assign({},inp);w.pose=poseOf(w)}
function backflip(w){w.vx=-w.face*.85;w.vy=-4.7;w.gr=false;w.y-=1;w.flip=1;w.jt=-99;sfx('tick')}
function menuStep(w,t,inp,tap){const C=4;let m=t.mc;if(tap('left'))m--;if(tap('right'))m++;if(tap('up'))m-=C;if(tap('down'))m+=C;m=(m+WP.length)%WP.length;
 const mo=RA.input.mouse;if(MENU.on&&mo.on&&localMouse(w.seat)&&(mo.fx!==t.mfx||mo.fy!==t.mfy)){t.mfx=mo.fx;t.mfy=mo.fy;const sx=mo.fx*SCR.w-MENU.x,sy=mo.fy*SCR.h-MENU.y,c=Math.floor(sx/MENU.cw),r=Math.floor(sy/MENU.ch);if(c>=0&&c<C&&r>=0&&r*C+c<WP.length)m=r*C+c}
 if(m!==t.mc)sfx('tick');t.mc=m;
 if(tap('fire')&&K.tick-t.mT>4){if(t.ammo[m]!==0){t.wsel=m;t.menu=0;w.pw=0;w.ch=false;w.noFire=1;sfx('pick')}else sfx('tick')}
 else if(tap('b3')&&K.tick-t.mT>4)t.menu=0;
 if(phase!=='round'||w.acted)t.menu=0}
const localMouse=s=>K.isClient()?s===K.myIdx:K.seats[s]&&K.seats[s].ctrl==='mk';
function sheepCmd(w,p,k){if(K.isClient())claim(w,[k,p.id,0,0,0]);else sheepDo(p,k)}
function sheepDo(p,k){if(k==='sj'&&p.sgr){p.vy=-3.6;sfx('baa')}if(k==='sd')p.det=1}
function release(w,t){shoot(w,t,Math.max(.12,w.pw));w.ch=false;w.pw=0}
function shoot(w,t,pow){const wp=WP[t.wsel];if(wp.k==='rope'){ropeFire(w);return}if(t.ammo[t.wsel]>0)t.ammo[t.wsel]--;if(!wp.free){w.acted=true;w.actT=K.tick}
 const a=w.face>0?w.aim:Math.PI-w.aim,c=[wp.k,Math.round(w.x),Math.round(w.y-6),Math.round(a*100)/100,Math.round(pow*100)/100];
 if(wp.ki==='t'){const d=40+pow*200;c[1]=Math.round(w.x+Math.cos(a)*d);c[2]=Math.round(w.y-6+Math.sin(a)*d);if(wp.k==='tele'){const ty=findTele(c[1],c[2]);if(ty!=null){w.x=c[1];w.y=ty;w.vx=w.vy=0;w.gr=false;fxAt(w.x,w.y-5,'tele')}return}}
 if(wp.k==='punch'){w.vy=-3.4;w.vx=w.face*.4;w.gr=false;w.y-=1}
 w.pose='aim';if(K.isClient())claim(w,c);else doShot(w,c)}
function claim(w,c){const t=teams[w.seat];t.sseq=(t.sseq|0)+1;(t.shots||(t.shots=[])).push([t.sseq,w.id,...c]);if(t.shots.length>8)t.shots.shift()}
function findTele(x,y){if(x<6||x>W-6)return null;for(let yy=Math.max(12,y);yy<water-4;yy++)if(!hitBox(x,yy)&&hitBox(x,yy+1))return yy;return null}
function phys(w){if(w.x<-30||w.x>W+30||w.y>water+4){drown(w);return}if(w.gr){if(!hitBox(w.x,w.y+1)){let d=0;while(d<3&&!hitBox(w.x,w.y+1)){w.y++;d++}if(hitBox(w.x,w.y+1))return;w.y-=d;w.gr=false;w.vy=0;w.vx=0}else return}
 // pressed against a wall in the air: slide up it and catch the ledge as soon as it's within reach
 if(w.press){const d=w.press;let up=-1;for(let u=0;u<=10;u++)if(!hitBox(w.x+d,w.y-u)){up=u;break}if(up>=0){w.x+=d;w.y-=up;if(up===0)w.press=0}}
 w.vy=Math.min(9,w.vy+G*1.8);const n=Math.ceil(Math.max(Math.abs(w.vx),Math.abs(w.vy))*2)+1;
 for(let k=0;k<n;k++){const nx=w.x+w.vx/n,ny=w.y+w.vy/n;
  if(hitBox(nx,ny)){if(w.vy>0&&!hitBox(w.x+w.vx/n,w.y)){w.x+=w.vx/n}
   const sp=Math.hypot(w.vx,w.vy);
   if(w.vy>0&&hitBox(w.x,w.y+1)){ // landing: fall damage from a long drop
    if(w.vy>6.2&&!w.rope){const d=Math.round((w.vy-6)*9);hurtSelf(w,d)}
    if(w.hurt>0&&sp>2.2){w.vy*=-.3;w.vx*=.5;if(Math.abs(w.vy)<1.2){w.gr=true;w.vx=w.vy=0;w.flip=0;w.press=0}}else{w.gr=true;w.vx=0;w.vy=0;w.flip=0;w.press=0}}
   else{// a ledge just above your feet: climb onto it instead of bouncing off
    if(w.hurt<=0&&!w.rope){let up=0;for(let u=1;u<=10;u++)if(!hitBox(nx,ny-u)){up=u;break}if(up){w.x=nx;w.y=ny-up;w.vy=Math.min(w.vy,0);continue}}
    if(w.hurt<=0&&!w.rope){w.press=Math.sign(w.vx)||w.press;w.vx=0}else{w.vx*=-.35;if(w.vy<0)w.vy=0}}break}
  w.x=nx;w.y=ny}
 if(w.x<-30||w.x>W+30||w.y>water+4){drown(w)}}
function hurtSelf(w,d){texts.push({x:w.x,y:w.y-16,s:'-'+d,col:'#f05050',t:70});if(!K.isClient())damage(w,d,null);else claim(w,['fall',d,0,0,0])}
function drown(w){if(w.dead||w.drown)return;w.drown=1;sfx('splash');for(let k=0;k<10;k++)parts.push({x:w.x,y:water,vx:(Math.random()-.5)*2,vy:-1-Math.random()*2,t:30,col:'#a0f0ff',g:.1});
 if(!K.isClient())kill(w,'drowned');else claim(w,['drown',0,0,0,0])}
// ninja rope: a hook flies along your aim and catches the first thing it touches; then you swing
function ropeFire(w){const a=w.face>0?w.aim:Math.PI-w.aim;for(let d=6;d<170;d+=2){const x=w.x+Math.cos(a)*d,y=w.y-6+Math.sin(a)*d;if(solidAt(x,y)){w.rope={x,y,len:Math.max(14,d)};w.gr=false;sfx('tick');return}}}
function ropeStep(w,inp,me){const r=w.rope;if(me&&(inp.up))r.len=Math.max(10,r.len-1.2);if(me&&inp.down)r.len=Math.min(200,r.len+1.2);
 w.vy+=G*1.8;if(me){if(inp.left)w.vx-=.06;if(inp.right)w.vx+=.06}
 let nx=w.x+w.vx,ny=w.y+w.vy;const dx=nx-r.x,dy=ny-6-r.y,d=Math.hypot(dx,dy);if(d>r.len){nx=r.x+dx/d*r.len;ny=r.y+dy/d*r.len+6;const vr=(w.vx*dx+w.vy*dy)/d;w.vx-=dx/d*vr;w.vy-=dy/d*vr}
 if(hitBox(nx,ny)){w.vx*=-.4;w.vy*=-.4}else{w.x=nx;w.y=ny}w.vx*=.995;w.face=w.vx>=0?1:-1;
 const rel=me&&(inp.alt&&!(w.prev&&w.prev.alt)||inp.fire&&!(w.prev&&w.prev.fire));if(rel){w.rope=null;w.gr=false}
 if(w.y>water+4)drown(w);w.pose='rope'}
function poseOf(w){if(w.rope)return'rope';if(!w.gr)return w.hurt>0||w.flip?'fly':'jump';if(w.hurt>0)return'hurt';if(w.ch||w.aimT>K.tick)return'aim';
 if(K.tick-(w.wk||-99)<8)return'walk'+[1,2,3,2][Math.floor(w.dist/3)%4];return(K.tick>>5)&1?'idle1':'idle2'}
/* ---------- host: shots, projectiles, explosions, damage ---------- */
function doShot(w,c){const[k,x,y,a,pow]=c;if(k==='fall'){damage(w,x,null);return}if(k==='drown'){kill(w,'drowned');return}if(k==='crate'){const cr=crates.find(q=>q.id===x);if(cr)openCrate(w,cr);return}if(k==='sj'||k==='sd'){const sp=proj.find(q=>q.id===x);if(sp)sheepDo(sp,k);return}
 const wp=WP[WI[k]];if(!wp)return;w.acted=true;w.actT=K.tick;addFeed((teams[w.seat].name||'').slice(0,8)+': '+wp.n,teams[w.seat].col);const t=teams[w.seat];if(!K.isClient()&&ownerNet(w.seat)&&t.ammo[WI[k]]>0)t.ammo[WI[k]]--;
 const sp=(wp.ki==='c'?7.2:4)*pow,vx=Math.cos(a)*sp,vy=Math.sin(a)*sp;sfx('fire');
 if(wp.ki==='c'){const px=x+Math.cos(a)*9,py=y+Math.sin(a)*9;proj.push({id:nextId++,k,x:px,y:py,vx,vy,t:0,fuse:wp.fuse||0,own:w.id,spin:0})}
 else if(k==='shotgun'){for(let s=0;s<2;s++){const aa=a+(s?.03:-.03);let hx=x,hy=y;for(let d=8;d<240;d+=2){hx=x+Math.cos(aa)*d;hy=y+Math.sin(aa)*d;const hit=worms.find(o=>!o.dead&&o!==w&&Math.abs(o.x-hx)<5&&hy>o.y-11&&hy<o.y);if(hit){damage(hit,wp.dmg,w);knock(hit,Math.cos(aa)*2.4,-1.6);break}if(solidAt(hx,hy)){addOp(['c',Math.round(hx),Math.round(hy),7]);break}}fx.push({k:'tr',x0:x,y0:y,x1:hx,y1:hy,t:8})}sfx('bang')}
 else if(k==='bat'||k==='punch'){const f=Math.cos(a)>=0?1:-1;for(const o of worms){if(o.dead||o===w)continue;if(Math.abs(o.x-(x+f*8))<12&&Math.abs(o.y-6-y)<14){damage(o,wp.dmg,w);if(k==='bat')knock(o,Math.cos(a)*7,Math.sin(a)*7-1);else knock(o,f*1.5,-6)}}sfx('bang')}
 else if(wp.ki==='d'){const p={id:nextId++,k,x:x+(w.face||1)*6,y:y+2,vx:k==='sheep'?0:(w.face||1)*.3,vy:0,t:0,fuse:wp.fuse||0,own:w.id,face:w.face||1};if(k==='sheep')sfx('baa');proj.push(p)}
 else if(k==='air'){for(let i=0;i<5;i++)proj.push({id:nextId++,k:'strike',x:x-30+i*15,y:-20-i*6,vx:wind*.5,vy:2.5,t:0,own:w.id})}
 else if(k==='girder'){if(x>16&&x<W-16&&y>10&&y<water-4)addOp(['g',x,y])}}
function projStep(p){const wp=WP[WI[p.k]]||{r:20,dmg:26};p.t++;
 if(p.k==='mine'){if(!p.gr){p.vy=Math.min(5,p.vy+G);if(!solidAt(p.x,p.y+3)){p.y+=p.vy;p.x+=p.vx}else{p.gr=1;p.vy=0;p.vx=0}}else if(!solidAt(p.x,p.y+3))p.gr=0;
  if(!p.trig&&p.t>90&&worms.some(o=>!o.dead&&Math.hypot(o.x-p.x,o.y-5-p.y)<20)){p.trig=K.tick;sfx('tick')}if(p.trig&&K.tick-p.trig>50)explode(p,wp);if(p.y>water)p.gone=1;return}
 if(p.k==='sheep'){const f=p.face,gr=solidAt(p.x,p.y+3);p.sgr=gr?1:0;
  if(gr&&p.vy>=0){p.vy=0;
   if(solidAt(p.x+f*4,p.y)){let up=0;for(let u=1;u<=6;u++)if(!solidAt(p.x+f*4,p.y-u)){up=u;break}   // a bump: walk up it, a wall: hop, then turn
    if(up){p.y-=up;p.x+=f*.8}else if(!p.bonk){p.vy=-3.2;p.bonk=1}else{p.face=-f;p.bonk=0}}
   else{p.x+=f*.8;p.bonk=0;if(!solidAt(p.x,p.y+3)){let d=0;while(d<6&&!solidAt(p.x,p.y+3)){p.y++;d++}}}
   if(p.t%50===0&&p.vy===0){p.vy=-1.6}}
  else{p.vy=Math.min(5,p.vy+G*1.6);if(!solidAt(p.x+f*4,p.y-2))p.x+=f*.9;const ny=p.y+p.vy;
   if(p.vy>0&&solidAt(p.x,ny+3)){let y=Math.floor(ny);while(solidAt(p.x,y+3)&&y>p.y-8)y--;p.y=y;p.vy=0}else if(p.vy<0&&solidAt(p.x,ny-5))p.vy=0;else p.y=ny}
  if(p.t>420||p.det)explode(p,wp);if(p.y>water)p.gone=1;return}
 if(p.k==='dynamite'){p.vy=Math.min(5,p.vy+G*1.4);if(!solidAt(p.x,p.y+4))p.y+=p.vy;else p.vy=0;if(p.t%20===0)sfx('tick');if(p.t>=p.fuse)explode(p,wp);if(p.y>water)p.gone=1;return}
 p.vy+=G;if(wp.wind||p.k==='strike')p.vx+=wind*.006;
 if(p.k==='homing'&&p.t>30&&p.t<170){const tg=worms.filter(o=>!o.dead&&o.id!==p.own&&teamOf(o.seat)!==teamOf(worms[p.own].seat)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(tg){const ax=tg.x-p.x,ay=tg.y-6-p.y,d=Math.hypot(ax,ay)||1,s=Math.hypot(p.vx,p.vy);p.vx+=(ax/d*Math.max(3,s)-p.vx)*.08;p.vy+=(ay/d*Math.max(3,s)-p.vy)*.08}}
 const n=Math.ceil(Math.max(Math.abs(p.vx),Math.abs(p.vy)))+1;
 for(let k=0;k<n;k++){const nx=p.x+p.vx/n,ny=p.y+p.vy/n;
  const hitW=(wp.fuse==null||p.k==='strike'||p.k==='cbit'||p.k==='bbit')&&p.t>3&&worms.some(o=>!o.dead&&Math.abs(o.x-nx)<5&&ny>o.y-11&&ny<o.y);
  if(solidAt(nx,ny)||hitW){if(wp.fuse&&p.k!=='cbit'&&p.k!=='bbit'){// bounce
    const sx=solidAt(nx,p.y),sy=solidAt(p.x,ny);if(sx||!sy)p.vx*=-wp.bnc;if(sy||!sx)p.vy*=-wp.bnc;p.vx*=.9;if(Math.abs(p.vy)>.6)sfx('tick');break}
   p.x=nx;p.y=ny;explode(p,p.k==='cbit'?{r:11,dmg:16}:p.k==='bbit'?{r:24,dmg:34}:wp);return}
  p.x=nx;p.y=ny}
 p.spin+=p.vx*.2;if(wp.fuse&&p.t>=p.fuse)explode(p,wp);
 if(p.y>water+2){p.gone=1;for(let k=0;k<6;k++)parts.push({x:p.x,y:water,vx:(Math.random()-.5)*1.5,vy:-1-Math.random(),t:24,col:'#a0f0ff',g:.1})}
 if(p.x<-60||p.x>W+60)p.gone=1}
function explode(p,wp){p.gone=1;boom(Math.round(p.x),Math.round(p.y),wp.r,wp.dmg,worms[p.own]);
 if(p.k==='cluster'||p.k==='banana')for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.45;proj.push({id:nextId++,k:p.k==='cluster'?'cbit':'bbit',x:p.x,y:p.y-4,vx:Math.cos(a)*2.4,vy:Math.sin(a)*3.2-1,t:0,own:p.own,spin:0})}
 if(p.k==='holy')K.fx('h',0)}
function boom(x,y,r,dmg,by){addOp(['c',x,y,r]);K.fx('b',x,y,r);burst(x,y,r);
 for(const o of worms){if(o.dead)continue;const dx=o.x-x,dy=o.y-5-y,d=Math.hypot(dx,dy),R=r*1.35;if(d>R)continue;const f=1-d/R,dm=Math.round(dmg*Math.max(.15,f));damage(o,dm,by);const nd=d||1;knock(o,dx/nd*f*dmg*.11,dy/nd*f*dmg*.11-1.6*f)}
 for(const p of proj){if(p.k==='mine'&&!p.gone&&Math.hypot(p.x-x,p.y-y)<r+6){p.trig=p.trig||K.tick-30}}
 for(const c of crates)if(Math.hypot(c.x-x,c.y-y)<r+4)c.gone=1}
function damage(o,d,by){if(o.dead||d<=0)return;o.hp=Math.max(0,o.hp-d);o.dmgT=K.tick;texts.push({x:o.x,y:o.y-18,s:'-'+d,col:teams[o.seat].col,t:80});if(by&&by!==o){if(teamOf(by.seat)===teamOf(o.seat)){teams[by.seat].ff=(teams[by.seat].ff|0)+d}else teams[by.seat].dmg=(teams[by.seat].dmg|0)+d}
 if(o.hp<=0)setTimeout0(()=>kill(o,'blown up',by))}
const later=[];const setTimeout0=f=>later.push(f);
function kill(o,why,by){if(o.dead)return;o.dead=true;o.hp=0;if(by&&by!==o&&teamOf(by.seat)!==teamOf(o.seat))teams[by.seat].kills=(teams[by.seat].kills|0)+1;
 if(!o.drown){boomSmall(o)}texts.push({x:o.x,y:o.y-24,s:(o.name||'').toUpperCase()+' '+(why==='drowned'?'SANK':'IS OUT'),col:'#ffffff',t:110});addFeed((o.name||'').slice(0,8)+(why==='drowned'?' SANK':' IS OUT'),'#fff07c');K.fx('k',o.id)}
function boomSmall(o){addOp(['c',Math.round(o.x),Math.round(o.y-4),10]);burst(o.x,o.y-4,10)}
function knock(o,vx,vy){if(isMine(o)){o.vx=vx;o.vy=vy;o.gr=false;o.rope=null;o.hurt=40;o.y-=1}else{o.evSeq++;o.ev.push([o.evSeq,Math.round(vx*100),Math.round(vy*100)]);if(o.ev.length>6)o.ev.shift()}}
function burst(x,y,r){sfx('boom');fx.push({k:'ex',x,y,r,t:0});for(let k=0;k<18;k++){const a=Math.random()*Math.PI*2,s=1+Math.random()*2.5;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,t:30+Math.random()*20,col:k%3?TH&&THEMES[TH].soil[k%4]:'#fff07c',g:.12})}
 for(let k=0;k<6;k++)parts.push({x:x+(Math.random()-.5)*r,y:y+(Math.random()-.5)*r,vx:(Math.random()-.5)*.3,vy:-.4-Math.random()*.4,t:50,col:'#9a94a8',smoke:1})}
function fxAt(x,y,k){fx.push({k,x,y,t:0})}
const feed=[];function addFeed(s,col){feed.push({s,col,t:K.tick});if(feed.length>5)feed.shift();if(!K.isClient())K.fx('f',s,col)}
function say(w,s,col){texts.push({x:w?w.x:null,y:w?w.y-20:0,s,col,t:120,big:!w})}
function vis(){while(later.length)later.shift()();
 for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy+=p.g;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>400)parts.splice(0,parts.length-400);
 for(const f of fx)f.t++;fx=fx.filter(f=>f.t<(f.k==='ex'?16:f.k==='tr'?8:24));for(const t of texts){t.t--;if(!t.big)t.y-=.3}texts=texts.filter(t=>t.t>0);
 // crates: whoever touches one opens it
 for(const c of crates){if(c.gone)continue;for(const w of worms){if(w.dead||!isMine(w))continue;if(Math.abs(w.x-c.x)<9&&Math.abs(w.y-5-c.y)<10){if(K.isClient())claim(w,['crate',c.id,0,0,0]);else openCrate(w,c);c.gone=K.isClient()?0:1;break}}}}
function openCrate(w,c){if(c.gone&&!K.isClient())return;c.gone=1;const t=teams[w.seat];if(c.k==='health'){w.hp+=25;texts.push({x:w.x,y:w.y-18,s:'+25',col:'#88dc48',t:80})}else{if(t.ammo[c.w]>=0)t.ammo[c.w]++;texts.push({x:w.x,y:w.y-22,s:WP[c.w].n+'!',col:'#fff07c',t:90})}sfx('pick')}
/* ---------- guests ---------- */
function local(i){for(const w of worms){if(w.seat!==i||w.dead)continue;const me=activeOf(i)===w;control(w,me&&phase==='round'?K.inp(i):{},me)}
 for(const p of proj)ghostStep(p);vis()}
function upload(i){const ws=worms.filter(w=>w.seat===i),sh=teams[i]&&teams[i].shots||[];
 return{w:ws.map(w=>[w.id,Math.round(w.x*10)/10,Math.round(w.y*10)/10,Math.round(w.vx*100)/100,Math.round(w.vy*100)/100,w.face,Math.round(w.aim*100)/100,w.pose,w.gr?1:0,w.rope?Math.round(w.rope.x):-1,w.rope?Math.round(w.rope.y):-1,Math.round(w.pw*100),teams[i].wsel,w.acted?1:0,w.evSeen]),sh}}
function readUp(w,u){const r=(u.w||[]).find(a=>a[0]===w.id);if(!r)return;w.x=r[1];w.y=r[2];w.vx=r[3];w.vy=r[4];w.face=r[5];w.aim=r[6];w.pose=r[7];w.gr=!!r[8];w.rope=r[9]>=0?{x:r[9],y:r[10],len:0}:null;w.pw=r[11]/100;teams[w.seat].wsel=r[12];w.ch=w.pw>0;
}
function snap(){return{wm:worms.map(w=>[Math.round(w.x),Math.round(w.y),w.face,Math.round(w.aim*100),w.pose,w.hp,w.dead?1:0,w.rope?Math.round(w.rope.x):-1,w.rope?Math.round(w.rope.y):-1,Math.round(w.pw*100),w.acted?1:0,ownerNet(w.seat)?w.ev:0]),
 pj:proj.map(p=>[p.id,p.k,Math.round(p.x),Math.round(p.y),Math.round(p.vx*100),Math.round(p.vy*100),p.t,p.face||0,p.trig?1:0]),cr:crates.map(c=>[c.id,c.k,Math.round(c.x),Math.round(c.y),c.w]),
 on:ops.length,op:ops.slice(-30),wd:wind,wa:water,ro:round,pz:phase==='round'?0:1,pt:phT,ac:active,tt:turnTeam,am:teams.map(t=>t.ammo.join(',')),ws:teams.map(t=>t.wsel),tk:[teams.map(t=>t.kills|0),teams.map(t=>t.dmg|0)]}}
function apply(g){wind=g.wd;water=g.wa;phase=g.pz?'settle':'round';phT=g.pt;turnTeam=g.tt;active=g.ac||active;
 if(g.ro!==round){round=g.ro;for(const w of worms){w.acted=false;w.pw=0;w.ch=false}}
 // terrain ops, in order (the last 30 ride along every snapshot)
 const first=g.on-(g.op||[]).length;(g.op||[]).forEach((op,k)=>{const idx=first+k;if(idx>=ops.length&&idx===ops.length){ops.push(op);applyOp(op)}});
 (g.am||[]).forEach((s,i)=>{const t=teams[i];if(!t)return;const a=String(s).split(',').map(Number);if(i!==K.myIdx||true)t.ammo=a;if(i!==K.myIdx)t.wsel=g.ws[i]});
 if(g.tk){teams.forEach((t,i)=>{t.kills=g.tk[0][i];t.dmg=g.tk[1][i]})}
 (g.wm||[]).forEach((a,k)=>{const w=worms[k];if(!w)return;w.hp=a[5];const wasDead=w.dead;w.dead=!!a[6];if(w.dead&&!wasDead&&w.seat===K.myIdx){}
  if(w.seat===K.myIdx){if(a[10])w.acted=true;for(const e of a[11]||[])if((e[0]|0)>w.evSeen){w.evSeen=e[0]|0;w.vx=e[1]/100;w.vy=e[2]/100;w.gr=false;w.rope=null;w.hurt=40;w.y-=1}return}
  w.tx=a[0];w.ty=a[1];w.face=a[2];w.aim=a[3]/100;w.pose=a[4];w.rope=a[7]>=0?{x:a[7],y:a[8]}:null;w.pw=a[9]/100;if(w.gx==null||Math.hypot(w.tx-w.x,w.ty-w.y)>40){w.x=w.tx;w.y=w.ty;w.gx=1}});
 const pm=new Map(proj.map(p=>[p.id,p]));proj=(g.pj||[]).map(r=>{const o=pm.get(r[0])||{};return Object.assign(o,{id:r[0],k:r[1],x:o.x==null||Math.hypot(o.x-r[2],o.y-r[3])>12?r[2]:o.x,y:o.x==null||Math.hypot(o.x-r[2],o.y-r[3])>12?r[3]:o.y,tx:r[2],ty:r[3],vx:r[4]/100,vy:r[5]/100,t:r[6],face:r[7],trig:r[8]})});
 const cm=new Map(crates.map(c=>[c.id,c]));crates=(g.cr||[]).map(r=>Object.assign(cm.get(r[0])||{},{id:r[0],k:r[1],x:r[2],y:r[3],w:r[4]}))}
function ghostStep(p){if(p.tx!=null){p.x+=(p.tx-p.x)*.3;p.y+=(p.ty-p.y)*.3;p.tx+=p.vx;p.ty+=p.vy}p.spin=(p.spin||0)+p.vx*.2}
function follow(){for(const w of worms){if(w.seat===K.myIdx||w.tx==null)continue;const ox=w.x;w.x+=(w.tx-w.x)*.35;w.y+=(w.ty-w.y)*.35;w.dist=(w.dist||0)+Math.abs(w.x-ox)}if(K.myIdx<0){for(const p of proj)ghostStep(p);vis()}}
function onFx(k,a){if(k==='f'){feed.push({s:a[0],col:a[1],t:K.tick});if(feed.length>5)feed.shift();return}if(k==='b'){const[x,y,r]=a;if(K.isClient())burst(x,y,r)}else if(k==='h')sfx('holy');else if(k==='r')sfx('pick');else if(k==='k')sfx('splash')}
/* ---------- CPU worms ---------- */
// fly a test shot with the real physics: where does it land?
function sim(x,y,a,pow,k){const wp=WP[WI[k]],sp=7.2*pow;let px=x+Math.cos(a)*9,py=y+Math.sin(a)*9,vx=Math.cos(a)*sp,vy=Math.sin(a)*sp;
 // the same sub-steps as the real projectile, so it can't skip past a thin worm or wall the real shot would hit
 for(let t=1;t<400;t++){vy+=G;if(wp.wind)vx+=wind*.006;const n=Math.ceil(Math.max(Math.abs(vx),Math.abs(vy)))+1;
  for(let k=0;k<n;k++){px+=vx/n;py+=vy/n;if(px<0||px>=W||py>water)return{x:px,y:py,lost:1};if(solidAt(px,py))return{x:px,y:py,t};
   if(t>3)for(const o of worms)if(!o.dead&&o.cpuSelf!==1&&Math.abs(o.x-px)<5&&py>o.y-11&&py<o.y)return{x:px,y:py,t,hit:o}}}return{x:px,y:py,lost:1}}
function safeShot(w,i,a,pow,k){const wp=WP[WI[k]];if(!wp||!wp.r)return true;w.cpuSelf=1;const r=sim(w.x,w.y-6,a,pow,k);w.cpuSelf=0;if(r.lost)return true;
 if(r.hit&&teamOf(r.hit.seat)===teamOf(i))return false;const far=Math.hypot(r.x-w.x,r.y-w.y)*.03;return worms.every(f=>f.dead||teamOf(f.seat)!==teamOf(i)||Math.hypot(r.x-f.x,r.y-f.y+5)>wp.r*1.6+(k==='grenade'?44:14)+far)}
function bot(i){const w=activeOf(i);if(!w||w.dead||phase!=='round'||w.acted)return{};const t=teams[i],lvl=i===meIdx()?2:K.cpu,b=w.bt&&w.bt.r===round?w.bt:(w.bt={r:round,st:'think',T:K.tick+[100,60,35][lvl]+Math.random()*30});const o={};
 if(K.tick<b.T)return o;
 if(b.st==='think'){const enemies=worms.filter(e=>!e.dead&&teamOf(e.seat)!==teamOf(i));if(!enemies.length)return o;let best=null;
  // shotgun when there's a clear line; otherwise search bazooka / grenade shots
  for(const e of enemies){const dx=e.x-w.x,dy=e.y-w.y,d=Math.hypot(dx,dy);if(d<170){let clear=true;for(let s=8;s<d-4;s+=3){const px=w.x+dx/d*s,py=w.y-6+dy/d*s;if(solidAt(px,py)||worms.some(f=>f!==w&&!f.dead&&teamOf(f.seat)===teamOf(i)&&Math.abs(f.x-px)<6&&py>f.y-12&&py<f.y+1)){clear=false;break}}if(clear&&(!best||d<best.d)){best={k:'shotgun',a:Math.atan2(dy,dx),pow:1,d,sc:d*.5}}}}
  w.cpuSelf=1;const friends=worms.filter(f=>!f.dead&&teamOf(f.seat)===teamOf(i)),near=enemies.slice().sort((a,c)=>Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(c.x-w.x,c.y-w.y)).slice(0,3);
  for(const k of['bazooka','grenade'])for(let a=-Math.PI+.1;a<0;a+=.1)for(let pow=.35;pow<=1;pow+=.08){const r=sim(w.x,w.y-6,a,pow,k);if(r.lost)continue;
   const safe=friends.every(f=>Math.hypot(r.x-f.x,r.y-f.y+5)>WP[WI[k]].r*1.6+(k==='grenade'?44:14)+Math.hypot(r.x-w.x,r.y-w.y)*.03);if(!safe||r.hit&&teamOf(r.hit.seat)===teamOf(i))continue;
   for(const e of near){const d=Math.hypot(r.x-e.x,r.y-e.y+5),self=Math.hypot(r.x-w.x,r.y-w.y+5);if(self<40)continue;const sc=d+(k==='grenade'?14:0);if(!best||sc<best.sc)best={k,a,pow,sc}}}
  w.cpuSelf=0;if(!best||best.sc>60){// nothing good: walk towards the nearest enemy for a bit
   b.st='walk';b.dir=near[0]&&near[0].x>w.x?1:-1;b.T=K.tick;b.end=K.tick+60;b.tries=(b.tries|0)+1;if(b.tries>2&&best){b.st='aim';b.plan=best}else if(b.tries>2){w.acted=true;w.actT=K.tick;addFeed((teams[i].name||'').slice(0,8)+' SKIPS','#9a94a8');b.st='done'}   /* no safe shot anywhere: skip the go, like a player would */return o}
  const err=[.26,.1,.03][lvl];let pa=best.a,pp=best.pow;for(let tr=0;tr<6;tr++){const na=best.a+(Math.random()-.5)*err*2*(1-tr/6),np=Math.max(.2,Math.min(1,best.pow+(Math.random()-.5)*err*(1-tr/6)));if(best.k==='shotgun'||safeShot(w,i,na,np,best.k)){pa=na;pp=np;break}}
  best.a=pa;best.pow=pp;b.plan=best;b.st='aim';return o}
 if(b.st==='walk'){if(K.tick>b.end){b.st='think';return o}o[b.dir>0?'right':'left']=true;if(w.blk>6||K.tick%40===20){if(K.tick%40===20||K.tick%40===27)o.alt=true}return o}   // blocked: jump, and jump again for the back-flip
 if(b.st==='aim'){const pl=b.plan,want=WI[pl.k];if(t.wsel!==want&&t.ammo[want]!==0){const ph=K.tick%10<2;if(!t.menu){if(ph&&K.tick-(b.mq|0)>20){o.b3=true;b.mq=K.tick}return o}const C=4,cr=Math.floor(t.mc/C),cc=t.mc%C,tr=Math.floor(want/C),tc=want%C;
   if(ph){if(cr<tr)o.down=true;else if(cr>tr)o.up=true;else if(cc<tc)o.right=true;else if(cc>tc)o.left=true;else o.fire=true}return o}
  const f=Math.cos(pl.a)>=0?1:-1;if(w.face!==f){o[f>0?'right':'left']=true;return o}const rel=f>0?pl.a:Math.atan2(Math.sin(pl.a),-Math.cos(pl.a));
  if(rel<w.aim-.015)o.up=true;else if(rel>w.aim+.015)o.down=true;else{const a=w.face>0?w.aim:Math.PI-w.aim;if(WP[want].ki==='c'&&!safeShot(w,i,a,pl.pow,pl.k)){b.st='think';b.T=K.tick+10;return o}b.st=WP[want].ki==='c'?'charge':'fire'}return o}
 if(b.st==='fire'){o.fire=true;b.st='done';return o}
 if(b.st==='charge'){if(w.pw<b.plan.pow-.01){o.fire=true;return o}const a=w.face>0?w.aim:Math.PI-w.aim;if(!safeShot(w,i,a,w.pw,b.plan.k)){if(w.pw<1){o.fire=true;return o}}b.st='done';return o}
 return o}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const wormImg=(pose,col,face)=>img('w'+pose+col+face,()=>{const c=X.recolor(ART.w[pose]||ART.w.idle1,col,{h:'#b8447c'},'w'+pose);return face<0?X.flipX(c):c});
const thing=k=>img('t'+k,()=>X.sprite(ART.t[k]));
const rotThing=(k,a)=>{const q=Math.round(a/(Math.PI/12));return img('r'+k+q,()=>X.rot(thing(k),q*Math.PI/12))};
const cams=[];let SCR=null;
function skyImg(w,h){return img('sky'+TH+w+'x'+h,()=>{const t=THEMES[TH],c=X.mk(w,h),g=c.getContext('2d'),n=t.sky.length;for(let y=0;y<h;y++){const f=y/h*n,k=Math.min(n-1,Math.floor(f)),fr=f-k;for(let x=0;x<w;x++){g.fillStyle=k<n-1&&fr>.7&&X.dither(x,y,(fr-.7)/.3)?t.sky[k+1]:t.sky[k];g.fillRect(x,y,1,1)}}return c})}
function farImg(){return img('far'+TH+W,()=>{const t=THEMES[TH],c=X.mk(W,WH),g=c.getContext('2d'),n=vnoise(77);g.fillStyle=t.far;for(let x=0;x<W;x++){const h=WH*.45+n(x/60,1)*40-20;g.fillRect(x,Math.round(h),1,WH)}return c})}
function view(g,focusW,vx,vy,vw,vh,ci){let cam=cams[ci];const fp=focusProj(focusW);const tx=Math.max(0,Math.min(W-vw,(fp?fp.x:focusW.x)-vw/2)),ty=Math.max(0,Math.min(WH-vh,(fp?fp.y:focusW.y-10)-vh*.55));
 if(!cam)cam=cams[ci]={x:tx,y:ty,tk:K.tick};{let n=0;while(cam.tk<K.tick&&n++<40){cam.tk++;cam.x+=(tx-cam.x)*.12;cam.y+=(ty-cam.y)*.12}cam.tk=K.tick}
 const cx=Math.round(cam.x),cy=Math.round(cam.y);g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 g.drawImage(skyImg(vw,vh),vx,vy);g.drawImage(farImg(),Math.round(vx-cx*.5),Math.round(vy-cy*.6+20));
 g.translate(vx-cx,vy-cy);g.drawImage(tex,0,0);
 const me=focusW;
 for(const c of crates){const im=thing(c.k==='health'?'health':'crate');g.drawImage(im,Math.round(c.x-5),Math.round(c.y-5));if(!c.land){g.fillStyle='#f4f4ec';g.fillRect(Math.round(c.x-8),Math.round(c.y-18),17,4);g.fillStyle='#e83838';g.fillRect(Math.round(c.x-6),Math.round(c.y-17),13,2);g.fillStyle=P.k;g.fillRect(Math.round(c.x-7),Math.round(c.y-14),1,9);g.fillRect(Math.round(c.x+7),Math.round(c.y-14),1,9)}}
 for(const p of proj){const wp=WP[WI[p.k]],spr=p.k==='cbit'?'cbit':p.k==='bbit'?'banana':p.k==='strike'?'strike':wp&&wp.spr;if(!spr)continue;let im;
  if(p.k==='bazooka'||p.k==='homing'||p.k==='strike')im=rotThing(spr,Math.atan2(p.vy,p.vx)+(p.k==='strike'?-Math.PI/2:0));else if(p.k==='sheep')im=p.face<0?img('sheepL',()=>X.flipX(thing('sheep'))):thing('sheep');else im=wp&&wp.fuse&&p.k!=='dynamite'?rotThing(spr,p.spin||0):thing(spr);
  g.drawImage(im,Math.round(p.x-im.width/2),Math.round(p.y-im.height/2));
  if((p.k==='bazooka'||p.k==='homing')&&K.tick%2===0)parts.push({x:p.x,y:p.y,vx:0,vy:-.2,t:18,col:'#c8c4d8',smoke:1});
  if(wp&&wp.fuse&&p.k!=='cbit'&&p.k!=='bbit'){const s=Math.max(0,Math.ceil((wp.fuse-p.t)/60));X.text(g,s+'',p.x,p.y-12,{col:'#ffffff',align:'center',outline:P.k})}
  if(p.k==='sheep'){const sl=Math.max(0,Math.ceil((420-p.t)/60));X.text(g,sl+'',p.x,p.y-14,{col:sl<=2?'#f05050':'#ffffff',align:'center',outline:P.k})}
  if(p.k==='mine'&&p.trig&&(K.tick>>2)&1){g.fillStyle='#f05050';g.fillRect(Math.round(p.x)-1,Math.round(p.y)-4,2,2)}}
 for(const w of worms){if(w.dead){const gi=thing('grave');g.drawImage(gi,Math.round(w.x-4),Math.round(Math.min(w.y,surfaceY(Math.round(w.x),Math.max(0,Math.round(w.y-12))))-9));continue}
  const col=teams[w.seat].col,im=wormImg(w.pose,col,w.face),x=Math.round(w.x-im.width/2),y=Math.round(w.y-im.height+1);
  if(w.rope){g.fillStyle='#c8c4d8';const dx=w.rope.x-w.x,dy=w.rope.y-(w.y-8),d=Math.hypot(dx,dy);for(let s=0;s<d;s+=1)g.fillRect(Math.round(w.x+dx*s/d),Math.round(w.y-8+dy*s/d),1,1);g.drawImage(thing('hook'),Math.round(w.rope.x-1),Math.round(w.rope.y-1))}
  g.drawImage(im,x,y);
  const isAct=activeOf(w.seat)===w&&phase==='round'&&!w.acted,wp=WP[teams[w.seat].wsel];
  if(isAct&&wp.hold&&w.gr&&!w.rope){const a=w.face>0?w.aim:Math.PI-w.aim,h=img('h'+wp.hold,()=>X.sprite(ART.t[wp.hold])),hc=w.face>0?h:img('hf'+wp.hold,()=>X.flipX(h)),rot=X.rot(hc,w.face>0?a:a-Math.PI);g.drawImage(rot,Math.round(w.x-rot.width/2+Math.cos(a)*3),Math.round(w.y-7-rot.height/2+Math.sin(a)*3))}
  // name and health
  const hum=K.seats[w.seat]&&K.seats[w.seat].ctrl!=='cpu';X.text(g,w.hp+'',w.x,y-8,{col,align:'center',outline:P.k});if(hum&&w!==me&&activeOf(w.seat)===w)X.text(g,(teams[w.seat].name||'').slice(0,6),w.x,y-16,{col:'#ffffff',align:'center',outline:P.k});
  if(w===me&&activeOf(w.seat)===w&&phase==='round'){const b=(K.tick>>3)&1;g.fillStyle=P.k;g.fillRect(Math.round(w.x)-3,y-22,7,4);g.fillStyle=b?'#ffffff':col;g.fillRect(Math.round(w.x)-2,y-21,5,1);g.fillRect(Math.round(w.x)-1,y-20,3,1);
   if(!w.acted){const a=w.face>0?w.aim:Math.PI-w.aim,ax=w.x+Math.cos(a)*26,ay=w.y-7+Math.sin(a)*26;g.fillStyle=P.k;g.fillRect(Math.round(ax)-2,Math.round(ay),5,1);g.fillRect(Math.round(ax),Math.round(ay)-2,1,5);g.fillStyle='#fff07c';g.fillRect(Math.round(ax)-1,Math.round(ay),3,1);g.fillRect(Math.round(ax),Math.round(ay)-1,1,3);
    if(w.pw>0)for(let s=0;s<w.pw*22;s++){const px=w.x+Math.cos(a)*(8+s),py=w.y-7+Math.sin(a)*(8+s);g.fillStyle=s/22<.5?'#fff07c':s/22<.8?'#ffa040':'#f05050';g.fillRect(Math.round(px),Math.round(py),2,2)}}}}
 for(const f of fx){if(f.k==='ex'){const r=f.r*(.4+f.t/16*.8),c=f.t<4?'#ffffff':f.t<9?'#fff07c':'#ffa040';g.fillStyle=c;for(let a=0;a<24;a++){const an=a/24*Math.PI*2,rr=r*(f.t<9?1:.7)*(.8+hash(a,f.x)*.4);g.fillRect(Math.round(f.x+Math.cos(an)*rr)-1,Math.round(f.y+Math.sin(an)*rr)-1,3,3)}if(f.t<6){g.fillStyle='#fff07c';g.fillRect(Math.round(f.x-r*.4),Math.round(f.y-r*.4),Math.round(r*.8),Math.round(r*.8))}}
  else if(f.k==='tr'){g.fillStyle='#fff07c';const d=Math.hypot(f.x1-f.x0,f.y1-f.y0);for(let s=0;s<d;s+=3)g.fillRect(Math.round(f.x0+(f.x1-f.x0)*s/d),Math.round(f.y0+(f.y1-f.y0)*s/d),1,1)}
  else if(f.k==='tele'){g.fillStyle=(f.t>>1)&1?'#a0f0ff':'#ffffff';for(let a=0;a<8;a++){const an=a/8*Math.PI*2+f.t*.2;g.fillRect(Math.round(f.x+Math.cos(an)*(12-f.t/3)),Math.round(f.y+Math.sin(an)*(12-f.t/3)),2,2)}}}
 for(const p of parts){g.fillStyle=p.col;if(p.smoke){g.globalAlpha=Math.min(1,p.t/30)*.7;g.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,3,3);g.globalAlpha=1}else g.fillRect(Math.round(p.x),Math.round(p.y),1,1)}
 for(const t of texts)if(!t.big)X.text(g,t.s,t.x,t.y,{col:t.col,align:'center',outline:P.k});
 // the water, rising in sudden death
 const wc=THEMES[TH].water;for(let x=Math.max(0,cx-2);x<cx+vw+2;x++){const wy=Math.round(water+Math.sin(x*.12+K.tick*.06)*1.5);g.fillStyle=wc[1];g.fillRect(x,wy,1,1);g.fillStyle=wc[0];g.fillRect(x,wy+1,1,WH+40-wy)}
 g.restore();hud(g,me,vx,vy,vw,vh)}
function focusProj(w){if(!w)return null;const p=proj.find(p=>p.own===w.id&&p.k!=='mine');return p||null}
function hud(g,me,vx,vy,vw,vh){g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();hud2(g,me,vx,vy,vw,vh,vw<240);g.restore()}
// weapon icons for the menu and the weapon bar (the art's sprites, centred in a cell)
const ICON={bazooka:'bazooka',grenade:'grenade',shotgun:'shotgun',cluster:'cluster',homing:'missile',dynamite:'dynamite',mine:'mine',sheep:'sheep',bat:'bat',punch:'punch',tele:'tele',air:'strike',banana:'banana',holy:'holy'};
function iconImg(k){return img('ic'+k,()=>{const c=X.mk(16,12),g=c.getContext('2d');
 if(k==='rope'){g.fillStyle='#c8c4d8';for(let i=0;i<9;i++)g.fillRect(3+i,9-i,1,1);g.drawImage(thing('hook'),11,0)}
 else if(k==='girder'){const gs=thing('girder');g.drawImage(gs,0,0,16,5,0,4,16,5)}
 else{const im=thing(ICON[k]);const sc=Math.min(1,14/im.width,11/im.height);g.drawImage(im,Math.round(8-im.width*sc/2),Math.round(6-im.height*sc/2),Math.round(im.width*sc),Math.round(im.height*sc))}return c})}
const MENU={on:false,x:0,y:0,cw:38,ch:30};let startT=0;
function hud2(g,me,vx,vy,vw,vh,small){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),cxm=vx+vw/2;
 if(K.demo){TX('WORM WAR',cxm,vy+vh-16,{col:'#fff07c',align:'center',scale:2});return}
 // wind
 const wx=small?vx+vw-44:cxm,wy=small?vy+44:vy+26;g.fillStyle='rgba(16,12,24,.8)';g.fillRect(wx-34,wy-2,68,9);g.fillStyle='#5c566c';g.fillRect(wx,wy-1,1,7);const wl=Math.round(wind*30);g.fillStyle=wind<0?'#60a0ff':'#f05050';g.fillRect(Math.min(wx,wx+wl),wy+1,Math.abs(wl),3);
 if(!small)TX('WIND',wx-38,wy-1,{col:'#c8c4d8',align:'right'});
 // round and timer
 const left=phase==='round'?Math.max(0,Math.ceil((turnT-(K.tick-phT))/60)):0;TX(phase==='round'?left+'':'',vx+vw-6,vy+12,{col:left<=5&&phase==='round'?'#f05050':'#ffffff',align:'right',scale:2});TX('ROUND '+round,vx+vw-6,vy+30,{col:'#a0f0ff',align:'right'});
 // teams: health left
 if(!small){const list=teams.map((t,s)=>({t,s,hp:worms.filter(w=>w.seat===s&&!w.dead).reduce((a,w)=>a+w.hp,0)})).sort((a,b)=>b.hp-a.hp).slice(0,Math.min(teams.length,8));
  list.forEach((e,j)=>{const y=vy+Math.max(16,Math.round(vh*.07))+j*8;g.fillStyle=P.k;g.fillRect(vx+3,y-1,70,7);g.fillStyle=e.t.col;g.fillRect(vx+4,y,Math.max(0,Math.round(e.hp/((+K.S.hp||100)*Math.max(1,worms.filter(w=>w.seat===e.s).length))*26)),5);TX((e.t.name||'').slice(0,6),vx+33,y-1,{col:e.hp?'#ffffff':'#5c566c',outline:false,shadow:P.k})})}
 // what just happened (shots, worms out)
 if(!small)feed.filter(f=>K.tick-f.t<360).forEach((f,j,a)=>{TX(f.s,vx+vw-6,vy+42+j*8,{col:f.col,align:'right'})});
 for(const t of texts)if(t.big)TX(t.s,cxm,vy+vh*.3,{col:t.col,align:'center'});
 // a new round: say what it is
 const menuOpen=me&&teams[me.seat].menu;
 if(phase==='round'&&K.tick-phT<90&&!menuOpen&&round>1){const t=teams[turnTeam];TX('ROUND '+round,cxm,vy+vh*.22,{col:'#ffffff',align:'center',scale:2});
  TX(classic?((t.name||'').toUpperCase().slice(0,10)+"'S TURN"):'EVERY TEAM FIRES ONE SHOT',cxm,vy+vh*.22+18,{col:classic?t.col:'#fff07c',align:'center'})}
 if(!me)return;const t=teams[me.seat],wp=WP[t.wsel],am=t.ammo[t.wsel],act=activeOf(me.seat)===me;
 // the first seconds: how this game works
 if(round===1&&K.tick-startT<480&&!small&&!menuOpen&&!me.acted){const lines=classic?['WORM WAR - CLASSIC TURNS','Teams take turns: one team at a time.','On your turn: aim, fire ONE shot, run.']:['WORM WAR - ALL AT ONCE','Every round each team fires ONE shot.','Everyone aims at the same time.'];
  lines.push('Blast worms or knock them in the water.','Last team with a worm standing wins.');
  const bw=Math.min(vw-150,250),bx=cxm-bw/2,by=vy+38;g.fillStyle='rgba(16,12,24,.78)';g.fillRect(bx,by,bw,18+(lines.length-1)*9);TX(lines[0],cxm,by+4,{col:'#fff07c',align:'center'});lines.slice(1).forEach((l,j)=>TX(l,cxm,by+16+j*9,{col:'#ffffff',align:'center',outline:false}))}
 // the weapon bar: icon, name, ammo, how to change it
 const bw=small?Math.min(vw-8,120):150,bx=cxm-bw/2,by=vy+vh-22;g.fillStyle='rgba(16,12,24,.88)';g.fillRect(bx,by,bw,14);g.drawImage(iconImg(wp.k),bx+3,by+1);
 TX(wp.n+(am<0?'':' x'+am),bx+22,by+4,{col:am===0?'#5c566c':'#fff07c',outline:false});if(!small)TX('Q: WEAPONS',bx+bw-3,by+4,{col:'#a0f0ff',align:'right',outline:false});
 // what to do now
 let msg='',col='#ffffff';const sh=proj.find(p=>p.k==='sheep'&&p.own===me.id);
 if(sh){msg='E: SHEEP JUMPS   SPACE: BAAA-BOOM!';col='#fff07c'}
 else if(phase==='round'&&act&&!me.acted){if(me.wallT>K.tick-90){msg=small?'E E: BACK-FLIP UP':'TOO STEEP? E JUMP - E AGAIN IN THE AIR: HIGH BACK-FLIP';col='#fff07c'}
  else if(round<=2)msg=small?'W S AIM - SPACE FIRE':wp.ki==='c'?'YOUR TURN: W S AIM - HOLD SPACE FOR POWER, LET GO':wp.ki==='t'?'YOUR TURN: AIM, HOLD SPACE FOR DISTANCE':'YOUR TURN: W S AIM - SPACE USE';else msg='YOUR TURN - '+left+' S';}
 else if(phase==='round'&&act&&me.acted){msg='SHOT FIRED - RUN FOR COVER!';col='#fff07c'}
 else if(phase==='round'&&!act){msg=classic?((teams[turnTeam].name||'').slice(0,10).toUpperCase()+' IS AIMING'):'THIS WORM RESTS THIS ROUND';col='#a0f0ff'}
 else if(phase==='settle'){msg='WAITING FOR THE DUST TO SETTLE...';col='#a0f0ff'}
 if(msg&&!menuOpen)TX(msg,cxm,vy+vh-34,{col,align:'center'});
 // the weapon menu
 MENU.on=!!t.menu;if(t.menu){const C=4,R=Math.ceil(WP.length/C),cw=MENU.cw,ch=MENU.ch,mw=C*cw,mh=R*ch,mx=Math.round(cxm-mw/2),my=Math.round(vy+vh/2-mh/2-6);MENU.x=mx;MENU.y=my;
  g.fillStyle='rgba(16,12,24,.92)';g.fillRect(mx-6,my-16,mw+12,mh+34);TX('WEAPONS',cxm,my-12,{col:'#fff07c',align:'center'});
  WP.forEach((w2,k)=>{const x=mx+(k%C)*cw,y=my+Math.floor(k/C)*ch,a=t.ammo[k],sel=k===t.mc;g.fillStyle=sel?'#3c3648':'#241e30';g.fillRect(x+1,y+1,cw-2,ch-2);if(sel){g.fillStyle='#fff07c';g.fillRect(x,y,cw,1);g.fillRect(x,y+ch-1,cw,1);g.fillRect(x,y,1,ch);g.fillRect(x+cw-1,y,1,ch)}
   g.globalAlpha=a===0?.3:1;g.drawImage(iconImg(w2.k),x+3,y+4,32,24);g.globalAlpha=1;TX(a<0?'':a+'',x+cw-3,y+2,{col:a===0?'#5c566c':'#ffffff',align:'right'})});
  const cur=WP[t.mc],ca=t.ammo[t.mc];TX(cur.n+(ca===0?(CRATE.includes(cur.k)?' - FIND IT IN CRATES':' - NONE LEFT'):''),cxm,my+mh+3,{col:ca===0?'#9a94a8':'#ffffff',align:'center',outline:false});TX('WASD / MOUSE: CHOOSE   SPACE: TAKE   Q: CLOSE',cxm,my+mh+11,{col:'#a0f0ff',align:'center',outline:false})}}
function render(ctx,W2,H2){if(!SCR)SCR=X.screen();const g=SCR.size(W2,H2);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!tex||!worms.length){SCR.present(ctx,W2,H2);return}
 let fs=K.demo?[]:K.focus();let fw=fs.map(s=>activeOf(s)||liveWorms(s)[0]).filter(Boolean);
 if(!fw.length){const t=K.demo?teams[Math.floor(K.tick/600)%teams.length]:null;fw=[(t&&activeOf(t.i))||worms.find(w=>!w.dead&&activeOf(w.seat)===w)||worms.find(w=>!w.dead)||worms[0]]}
 fw=fw.slice(0,2);const h=SCR.h-(K.demo?0:Math.round(SCR.h*9/180)),w=SCR.w;if(fw.length===1)view(g,fw[0],0,0,w,h,0);else{const hw=w>>1;view(g,fw[0],0,0,hw,h,0);view(g,fw[1],hw,0,w-hw,h,1);g.fillStyle=P.k;g.fillRect(hw-1,0,2,h)}
 // minimap
 if(!K.demo){const mw=60,mh=Math.round(mw*WH/W),mx=w-mw-3,my=h-mh-3,mi=img('mini'+opsDone+W,()=>{const c=X.mk(mw,mh),gg=c.getContext('2d');gg.fillStyle='rgba(16,12,24,.7)';gg.fillRect(0,0,mw,mh);gg.fillStyle=THEMES[TH].soil[0];for(let y=0;y<mh;y++)for(let x=0;x<mw;x++)if(mask[Math.floor(y*WH/mh)*W+Math.floor(x*W/mw)])gg.fillRect(x,y,1,1);return c});
  g.drawImage(mi,mx,my);for(const wm of worms){if(wm.dead)continue;g.fillStyle=teams[wm.seat].col;g.fillRect(mx+Math.round(wm.x*mw/W)-1,my+Math.round(wm.y*mh/WH)-2,2,2)}g.fillStyle=THEMES[TH].water[1];g.fillRect(mx,my+Math.round(water*mh/WH),mw,1)}
 SCR.present(ctx,W2,H2)}
K=RA.kit({id:'worms',name:'WORM WAR',kind:'Artillery',players:'1-20 players',demo:4,localFirst:true,baseH:330,minPlayers:1,
 desc:'Turn-based artillery on a destructible pixel island for up to 20: bazookas and grenades in the wind, cluster bombs, the sheep, the relic grenade and the ninja rope. Everyone takes their turn at once - or the classic way, one team at a time.',
 blurb:'A / D walk, E jump - press E again in the air for a high back-flip. W / S aim (or the mouse), hold SPACE for power and let go to fire, Q opens the weapon menu. One attack per round - then run!',
 howto:'A / D walk, E jump (E again in the air = high back-flip, Shift = back-flip from the ground), W / S or mouse aim, hold Space / left click for power and release to fire, Q weapon menu (WASD or mouse to choose, Space to take). Sheep: E makes it jump, Space blows it up. Crates drop in by parachute: walk into them. Water and long falls hurt.',
 icon:['..........','...ppp....','..pWkpp...','..ppppp...','...ppp....','..ppp.....','.ppp...kk.','.pppp.kRRk','..pppp.kk.','...pppp...'],
 music:MUSIC,fireLabel:'FIRE',
 modes:[['FREE FOR ALL','Every player is a team: the last one with a worm standing wins.'],['TEAMS','Red vs blue: odd and even seats team up.']],
 settings:[['turns','Turns',[['all','All at once'],['classic','Classic (one team at a time)']]],['worms','Worms each',[['auto','Auto'],[1,'1'],[2,'2'],[3,'3']]],['map','Island',[['rnd','Random'],['meadow','Meadow'],['arctic','Arctic'],['desert','Desert'],['hell','Hell']]],
  ['time','Turn time',[[20,'20 s'],[15,'15 s'],[30,'30 s']]],['hp','Health',[[100,'100'],[150,'150'],[200,'200']]],['sd','Sudden death',[[8,'Round 8'],[5,'Round 5'],[12,'Round 12']]]],
 kb:[['A D','walk'],['W S','aim'],['SPACE','hold = power'],['Q','weapons'],['E','jump'],['E E','back-flip'],['C','chat'],['ESC','menu']],pad:[['LS','walk / aim'],['A','fire'],['B','jump'],['B B','back-flip'],['X','weapons'],['START','menu']],
 aim:(i,fx,fy)=>{const w=activeOf(K.isClient()?K.myIdx:i);if(!w||!SCR)return null;const cam=cams[0];if(!cam)return null;const x=fx*SCR.w+cam.x,y=fy*SCR.h+cam.y;return Math.atan2(y-(w.y-7),x-w.x)},
 ach:[{id:'first',name:'Fresh Grub',desc:'Play your first match',test:s=>s.played>=1,unlock:'title:Grub'},{id:'win1',name:'Last Worm Standing',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Worm Lord'},
  {id:'k3',name:'Grave Digger',desc:'Take out 3 enemy worms in one match',test:(s,m)=>m.kills>=3,unlock:'title:Grave Digger'}],
 alive:i=>worms.some(w=>w.seat===i&&!w.dead),out:i=>!worms.some(w=>w.seat===i&&!w.dead),
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>TH?THEMES[TH].n+(classic?' · CLASSIC':''):'',
 ranks:()=>teams.map((t,s)=>({t,s,live:worms.filter(w=>w.seat===s&&!w.dead).length,hp:worms.filter(w=>w.seat===s&&!w.dead).reduce((a,w)=>a+w.hp,0)})).sort((a,b)=>b.live-a.live||b.hp-a.hp||(b.t.dmg|0)-(a.t.dmg|0)).map(e=>[e.t.name,e.t.col,e.live?e.hp+' hp':(e.t.kills|0)+' kills · '+(e.t.dmg|0)+' dmg']),
 result:(i,w)=>{const t=teams[i];return{won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),kills:t?t.kills|0:0}}});
window.__wm={get worms(){return worms},get mask(){return mask},get W(){return W},get teams(){return teams},get proj(){return proj},get phase(){return phase},get round(){return round},get ops(){return ops},get active(){return active},K,bot:i=>bot(i),sim};

})();
