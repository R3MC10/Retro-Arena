/* ICE PEAK for Retro Arena: a race up a frozen mountain for up to 20 climbers, after Ice Climber (NES), in hand-drawn
   pixel art on a 320x180 screen.
   The original's fun, kept: every floor is a row of ice blocks. Jump straight up into the ice to smash a hole with your
   hammer, then jump through it and land on the ledge above. Jumps carry your momentum. Seals push ice back into your holes,
   birds and icicles knock you down, the higher floors have slippery ice, conveyor belts and drifting clouds, and the
   climber who grabs the condor at the summit wins.
   The 20-player twist: everyone shares one mountain, so the holes the leaders smash help the climbers behind. Swing the
   hammer (E / right-click) to knock rivals off their ledge. A rising avalanche keeps the pack moving. Vegetables are
   power-ups, and the further behind you are the better they get.
   Feel: smashing clears everything under your head (usually a 2-block hole), corner correction slips you into a hole when
   you are a few pixels off, and you can still jump just after walking off a ledge or just before you land.
   Controls: A / D walk, Space / W / click jump, E / right-click hammer, Q snowball. Gamepad: stick, A jump, B hammer, X snowball.
   Modes: RACE · TEAM RACE (red vs blue, points by place) · CO-OP CLIMB (everyone up before the avalanche, shared lives).
   Online is lag-free (RA.kit localFirst): your climber and the blocks you smash happen on your device at once; the host
   keeps the mountain, the seals, birds, icicles, vegetables, the avalanche and the finish order. */
(()=>{
/*ART*/
const TM=RA.music.track,sfx=RA.audio.sfx,X=RA.pix,txt=X.text,P=X.PAL;
const T=8,NC=32,WW=NC*T,FH=40,CH=15,HW=3,CD=150,TEAMC=['#e83838','#2c78f0'],TEAMN=['Red team','Blue team'];
const POSES=['stand','w1','w2','w3','jump','fall','sw1','sw2','sw3','dizzy','cheer'];
const ITEMS=[null,{n:'SPIKE BOOTS',c:'#c0c8d8',v:0},{n:'BIG HAMMER',c:'#ffa040',v:1},{n:'BALLOON',c:'#f070c0',v:2},{n:'SNOWBALLS',c:'#ffffff',v:3},{n:'PARKA',c:'#60a0ff',v:4},
 {n:'BLIZZARD',c:'#a0f0ff',v:2,party:1},{n:'QUAKE',c:'#b07038',v:0,party:1},{n:'ICICLE RAIN',c:'#a0f0ff',v:4,party:1}];
const MUSIC=[TM('Base Camp',96,['Am','F','C','G'],'k.......s.......','a5 - - e5 - - c6 - b5 - a5 - g5 - e5 - f5 - - c5 - - a5 - g5 - f5 - e5 - - -'),
 TM('Ice Climber',150,['C','F','G','C'],'k.hsk.hsk.hsk.hs','c5 e5 g5 c6 g5 e5 c5 e5 f5 a5 c6 f6 c6 a5 f5 a5 g5 b5 d6 g6 d6 b5 g5 b5 c6 g5 e5 c5 g4 c5 e5 g5'),
 TM('North Face',138,['Dm','C','Bb','A'],'k..hs.h.k.khs.h.','d5 f5 a5 d6 . a5 f5 . c5 e5 g5 c6 . g5 e5 . bb4 d5 f5 bb5 . f5 d5 . a4 c#5 e5 a5 - - - -'),
 TM('Avalanche',176,['Em','C','D','B'],'kshskshskshskshs','e5 g5 b5 e6 b5 g5 e5 b4 c5 e5 g5 c6 g5 e5 c5 g4 d5 f#5 a5 d6 a5 f#5 d5 a4 b4 d#5 f#5 b5 f#5 d#5 b4 f#4')];
RA.audio.add('smash',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=2200;g.gain.setValueAtTime(.2,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);s.connect(f);f.connect(g);s.start(now);s.stop(now+.17)});
RA.audio.add('bonk',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(220,now);o.frequency.exponentialRampToValueAtTime(110,now+.08);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start(now);o.stop(now+.11)});
RA.audio.add('hop',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(280,now);o.frequency.exponentialRampToValueAtTime(620,now+.09);g.gain.setValueAtTime(.045,now);g.gain.exponentialRampToValueAtTime(.001,now+.11);o.connect(g);o.start(now);o.stop(now+.12)});
RA.audio.add('whack',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(500,now);o.frequency.exponentialRampToValueAtTime(90,now+.15);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);o.connect(g);o.start(now);o.stop(now+.17)});
let K,cl=[],grid=null,NF=24,items=[],balls=[],seals=[],birds=[],icis=[],clouds=[],parts=[],texts=[],av=-60,avSp=0,finN=0,firstFin=0,lastHF=0,champ=-1,nextId=1,shake=0;
const condor={x:WW/2,y:0,d:1};
const L={broken:new Map()};   // guest: blocks I smashed that the host has not confirmed yet
const teamOf=i=>K.mode===1?i%2:K.mode===2?0:i,sameTeam=(a,b)=>a!==b&&teamOf(a)===teamOf(b);
const ownerNet=c=>K.seats[c.i]&&K.seats[c.i].ctrl==='net';
const isMine=c=>K.isClient()?c.i===K.myIdx:!ownerNet(c);

/* ---------- the mountain: grid of floors, 0 empty 1 ice 2 rock 3 slippery ice 4 belt left 5 belt right 6 valley floor ---------- */
const tier=f=>f<=6?'grass':f<=12?'earth':f<=18?'ice':'cryst';
const breakable=v=>v===1||v===3;
function build(seed){const rr=RA.util.mulberry(seed),g=new Uint8Array((NF+2)*NC);clouds=[];
 for(let c=0;c<NC;c++)g[c]=6;
 for(let f=1;f<=NF;f++){const row=f*NC;let base=f>5&&rr()<.22?3:1;for(let c=0;c<NC;c++)g[row+c]=base;
  if(f>9&&f<NF&&rr()<.16){// a cloud floor: a wide gap with a drifting cloud to ride
   const w=10+Math.floor(rr()*5),s=4+Math.floor(rr()*(NC-w-8));for(let c=s;c<s+w;c++)g[row+c]=0;clouds.push({f,x0:s*T,x1:(s+w)*T-20,x:s*T,d:1,sp:.35+rr()*.25})}
  else{const n=1+(rr()<.5?1:0);for(let k=0;k<n;k++){const w=2+Math.floor(rr()*2),s=2+Math.floor(rr()*(NC-w-4));for(let c=s;c<s+w;c++)g[row+c]=0}}
  if(f>3&&rr()<.5){const w=3+Math.floor(rr()*5),s=Math.floor(rr()*(NC-w));for(let c=s;c<s+w;c++)if(g[row+c])g[row+c]=2}
  if(f>7&&rr()<.2){const w=4+Math.floor(rr()*5),s=Math.floor(rr()*(NC-w)),d=rr()<.5?4:5;for(let c=s;c<s+w;c++)if(g[row+c])g[row+c]=d}
  let ok=0;for(let c=0;c<NC;c++)if(!g[row+c]||breakable(g[row+c]))ok++;if(ok<4)for(let c=0;c<4;c++)g[row+c+(NC>>1)]=1}
 return g}
const cellAt=(f,c)=>f<0||c<0||c>=NC?2:f>NF?0:grid[f*NC+c];
const solidAt=(f,c)=>{const v=cellAt(f,c);if(breakable(v)&&K.isClient()&&L.broken.has(f*NC+c))return 0;return v};
// first solid block touching the box (x0..x1, y0..y1); blocks of floor f fill heights (f*FH-T, f*FH]
function hitBox(x0,y0,x1,y1){const fa=Math.max(0,Math.floor((y0+T)/FH)),fb=Math.min(NF,Math.floor(y1/FH)+1);
 for(let f=fa;f<=fb;f++){const lo=f*FH-T,hi=f*FH;if(y1<=lo||y0>=hi)continue;for(let c=Math.floor(x0/T);c<=Math.floor((x1-.001)/T);c++)if(solidAt(f,c))return{f,c}}return null}
const cloudUnder=(x,y)=>clouds.find(k=>Math.abs(y-k.f*FH)<.01&&x>k.x-2&&x<k.x+22);

/* ---------- setup ---------- */
function start(seats,md,S,seed){NF=+S.height||16;grid=build(seed);items=[];balls=[];seals=[];birds=[];icis=[];parts=[];texts=[];finN=0;firstFin=0;lastHF=0;champ=-1;nextId=1;shake=0;L.broken.clear();broken.length=0;
 avSp=(md===2?Math.max(1,+S.av||1):+S.av||0)*.05;av=-60;condor.x=WW/2;condor.y=NF*FH+50;condor.d=1;cams.length=0;
 cl=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,x:16+((i*53)%(WW-32)),y:0,vx:0,vy:0,face:i%2?-1:1,gr:true,floor:0,anim:0,swing:0,stun:0,fx:{},snow:0,pose:0,
  coyote:0,buf:0,lives:+S.lives||3,out:false,fin:0,ft:0,best:0,place:i+1,buried:0,ev:[],evSeq:0,evSeen:0,claims:[],cseq:0,cSeen:0,knocks:0,smashes:0,hitT:{}}))}

/* ---------- your own climber (runs on the device that owns it) ---------- */
function move(c,inp){const f=c.fx;for(const k in f)if(f[k]>0&&k!=='parka')f[k]--;if(c.swing>0)c.swing--;
 if(c.out){return}
 if(c.fin){c.vx*=.8;c.pose=10;return}
 if(K.tick<CD){c.pose=0;return}
 if(c.buried>0){if(--c.buried===0)respawn(c);return}
 if(c.stun>0){c.stun--;inp={}}
 let dir=(inp.right?1:0)-(inp.left?1:0);if(inp.ax&&Math.abs(inp.ax)>.3)dir=Math.sign(inp.ax);
 const under=c.gr?cellAt(c.floor,Math.floor(c.x/T)):0,slip=under===3&&!(f.boots>0);
 // walking, sliding on ice, belts, a little steering in the air
 const want=dir*1.15;if(c.gr)c.vx+=(want-c.vx)*(slip?(dir?.04:.012):.3);else c.vx+=(want-c.vx)*.07;
 if(dir&&c.stun<=0)c.face=dir;
 // jump: buffered a few frames, and allowed just after walking off a ledge
 const jp=(inp.up||inp.fire)&&!c.jh;c.jh=inp.up||inp.fire;if(jp)c.buf=7;else if(c.buf>0)c.buf--;
 if(c.gr)c.coyote=6;else if(c.coyote>0)c.coyote--;
 if(c.buf>0&&c.coyote>0&&c.stun<=0&&!(f.bal>0)){c.vy=f.boots>0?5.25:4.75;c.gr=false;c.coyote=0;c.buf=0;c.lastJump=K.tick;sfx('hop')}
 if(inp.alt&&!c.ah&&c.swing<=0&&c.stun<=0){c.swing=18;sfx('shot')}c.ah=inp.alt;
 if(inp.b3&&!c.qh&&c.snow>0&&c.stun<=0){c.snow--;claim(c,'s',c.face,0);sfx('shot')}c.qh=inp.b3;
 if(f.bal>0){c.vy=1.3;c.gr=false;c.x=Math.max(HW,Math.min(WW-HW,c.x+c.vx));c.y+=c.vy;c.pose=4;
  if(f.bal===1){c.vy=0;if(hitBox(c.x-HW,c.y,c.x+HW,c.y+CH)){const ft=Math.ceil(c.y/FH)*FH;c.y=ft;c.floor=Math.round(ft/FH);c.gr=true}}return}   // the balloon never leaves you inside the ice
 // belts carry you
 if(c.gr&&(under===4||under===5))c.x+=under===4?-.55:.55;
 const cu=c.gr?cloudUnder(c.x,c.y):null;if(cu)c.x+=cu.d*cu.sp;
 // sideways, against block sides and the mountain walls
 let nx=Math.max(HW,Math.min(WW-HW,c.x+c.vx));if(hitBox(nx-HW,c.y+.5,nx+HW,c.y+CH)){nx=c.x;c.vx=0}c.x=nx;
 c.vy=Math.max(-5.5,c.vy-.25);const ny=c.y+c.vy;
 if(c.vy>0){// head first: smash ice, bonk on rock, slip into a hole if only a corner is in the way
  const h=hitBox(c.x-HW,c.y+CH,c.x+HW,ny+CH);
  if(h){let slid=false;for(const d of[1,-1,2,-2,3,-3])if(!hitBox(c.x+d-HW,c.y+CH,c.x+d+HW,ny+CH)&&!hitBox(c.x+d-HW,c.y+.5,c.x+d+HW,c.y+CH)){c.x+=d;slid=true;break}
   if(slid)c.y=ny;
   else{let br=0;for(let col=Math.floor((c.x-HW-1)/T);col<=Math.floor((c.x+HW+1)/T);col++)if(breakable(solidAt(h.f,col))){smash(c,h.f,col);br++}
    sfx(br?'smash':'bonk');if(br&&isMine(c))shake=Math.max(shake,1.5);c.y=h.f*FH-T-CH-.01;c.vy=-.4}}
  else c.y=ny;c.gr=false}
 else{// feet first: land on the block tops (and clouds)
  const ft=Math.floor(c.y/FH+1e-6)*FH;let landed=false;
  if(ny<=ft&&c.y>=ft-.01){const fl=Math.round(ft/FH);if(hitBox(c.x-HW+1,ft-1,c.x+HW-1,ft)||cloudUnder(c.x,ft)){c.y=ft;if(!c.gr&&c.vy<-3.5){for(let k=0;k<4;k++)parts.push({x:c.x+(k-1.5)*3,y:ft+1,vx:(k-1.5)*.4,vy:.6,t:14,c:'#ffffff'})}
    c.vy=0;landed=true;c.floor=fl}}
  if(!landed){c.y=ny;c.gr=false}else c.gr=true}
 if(c.y<0){c.y=0;c.vy=0;c.gr=true;c.floor=0}
 c.best=Math.max(c.best,c.floor);
 c.anim=c.gr&&Math.abs(c.vx)>.15?c.anim+Math.abs(c.vx)*.11:0;
 // hammer: knock rivals and enemies in front of you
 if(c.swing>4&&c.swing<13){const reach=f.big>0?20:14,x0=c.face>0?c.x:c.x-reach,x1=c.face>0?c.x+reach:c.x;
  for(const o of cl){if(o===c||o.out||o.fin||sameTeam(c.i,o.i)||c.hitT[o.i]>K.tick)continue;if(o.x>x0&&o.x<x1&&Math.abs(o.y-c.y)<12){c.hitT[o.i]=K.tick+30;c.knocks++;claim(c,'k',o.i,c.face*(f.big>0?2:1));sfx('whack')}}
  for(const e of seals)if(!e.hit&&e.x>x0-4&&e.x<x1+4&&Math.abs(e.f*FH-c.y)<10){e.hit=1;claim(c,'e',e.id,c.face);sfx('whack')}
  for(const b of birds)if(!b.hit&&b.x>x0-4&&b.x<x1+4&&Math.abs(b.y-(c.y+8))<12){b.hit=1;claim(c,'b',b.id,c.face);sfx('whack')}}
 // hazards are checked by the climber they touch
 if(c.stun<=0){
  for(const e of seals)if(!e.hit&&Math.abs(e.x-c.x)<9&&Math.abs(e.f*FH-c.y)<6&&!(c.ht>K.tick)){c.ht=K.tick+50;hurt(c,e.d||1,'seal')}
  for(const b of birds)if(!b.hit&&Math.abs(b.x-c.x)<9&&Math.abs(b.y-(c.y+8))<10&&!(c.ht>K.tick)){c.ht=K.tick+50;hurt(c,b.vx>0?1:-1,'bird')}
  for(const ic of icis)if(ic.fall&&!ic.hit&&Math.abs(ic.x-c.x)<5&&ic.y<c.y+CH&&ic.y>c.y){ic.hit=1;claim(c,'x',ic.id,0);hurt(c,0,'icicle')}}
 for(const it of items)if(!it.got&&Math.abs(it.x-c.x)<9&&Math.abs(it.y+4-(c.y+7))<12){it.got=1;claim(c,'i',it.id,0);sfx('pick')}
 if(c.y>NF*FH&&Math.abs(condor.x-c.x)<16&&c.y+CH>condor.y-6&&c.y<condor.y+6)claim(c,'c',0,0);
 // the pose everyone sees
 const np=c.stun>0?(c.gr?9:5):c.swing>12?6:c.swing>6?7:c.swing>0?8:!c.gr?(c.vy>0?4:5):Math.abs(c.vx)>.15?[1,2,3,2][Math.floor(c.anim)&3]:0;
 c.pose=np}
function smash(c,f,col){c.smashes++;const tl=tier(f),cols={grass:['#88dc48','#7c4a24','#b07038'],earth:['#e8c088','#c49058','#8c5c34'],ice:['#a0f0ff','#60a0ff','#ffffff'],cryst:['#ffb0e0','#b080f0','#ffffff']}[tl];
 for(let k=0;k<7;k++)parts.push({x:col*T+4,y:f*FH-4,vx:(Math.random()-.5)*2.4,vy:Math.random()*2.2+.4,t:34,c:cols[k%3],sz:2,g:1});
 if(K.isClient()){L.broken.set(f*NC+col,K.tick);claim(c,'bk',f*NC+col,0)}else breakBlock(f*NC+col)}
function hurt(c,dir,why){const f=c.fx;if(f.parka>0){f.parka=0;sfx('pick');say(c,'PARKA!','#60a0ff');return}
 if(why==='icicle'||why==='quake'){c.stun=why==='quake'?55:40;c.vx=0;return}
 c.stun=46;c.vx=dir*2.3;c.vy=2.4;c.gr=false;c.swing=0;sfx('whack')}
function respawn(c){const f=Math.max(1,Math.ceil((av+24)/FH));let col=Math.floor(c.x/T);for(let k=0;k<NC&&!(solidAt(f,col)&&!solidAt(f+1,col));k++)col=(col+1)%NC;
 c.y=f*FH;c.x=col*T+4;c.vx=c.vy=0;c.gr=true;c.floor=f;c.stun=40}
function claim(c,k,a,b){if(!K.isClient()){resolve(c,[0,k,a,b]);return}c.cseq++;c.claims.push([c.cseq,k,a,b]);if(c.claims.length>12)c.claims.shift()}

/* ---------- host: the mountain, the seals, birds and icicles, the avalanche, the finish ---------- */
const broken=[];
function breakBlock(cell){if(!breakable(grid[cell]))return;broken.push([cell,K.tick,grid[cell]]);grid[cell]=0}
function resolve(c,[,k,a,b]){
 if(k==='bk')breakBlock(a);
 else if(k==='k'){const o=cl[a];if(o&&!o.out&&!o.fin)send(o,'k',b,c.i)}
 else if(k==='e'){const e=seals.find(x=>x.id===a);if(e){e.hit=1;e.vx=(b||1)*2;e.vy=2;say(c,'BONK!','#fff07c')}}
 else if(k==='b'){const e=birds.find(x=>x.id===a);if(e){e.hit=1;e.vy=0}}
 else if(k==='i'){const it=items.find(x=>x.id===a);if(it&&!it.dead){it.dead=1;powerUp(c)}}
 else if(k==='x'){const ic=icis.find(x=>x.id===a);if(ic)ic.dead=1}
 else if(k==='s')balls.push({id:nextId++,x:c.x+a*6,y:c.y+10,vx:a*3.2,vy:1.2,own:c.i,t:110});
 else if(k==='c'&&!c.fin&&c.y>NF*FH-4){c.fin=++finN;c.ft=K.tick-CD;if(finN===1)firstFin=K.tick;if(K.seats[c.i].ctrl!=='cpu')lastHF=K.tick;sfx('roar');say(c,'GOT THE CONDOR!','#fff07c');K.fx('f',c.i)}}
function send(o,kind,v,by){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind,v|0,by==null?-1:by]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind,v,by)}
function onEv(c,kind,v){if(kind==='k')hurt(c,v,'hammer');else if(kind==='q'){if(c.gr)hurt(c,0,'quake')}else if(kind==='w')c.fx.wind=300;else if(kind==='it')self(c,v);else if(kind==='av'){c.buried=60;if(isMine(c))shake=4}}
function self(c,k){const f=c.fx;if(k===1)f.boots=900;else if(k===2)f.big=700;else if(k===3)f.bal=150;else if(k===4)c.snow+=3;else if(k===5)f.parka=1}
function powerUp(c){const n=cl.length,fr=n>1?(c.place-1)/(n-1):.5,S=K.S;let bag=fr<.25?[1,2,4,5]:fr<.6?[1,2,3,4,5]:[3,3,1,2,4];if(S.items==='party'&&fr>.25)bag.push(6,7,8);
 const k=bag[Math.floor(Math.random()*bag.length)],it=ITEMS[k];say(c,it.n,it.c);if(k<=5){send(c,'it',k);return}
 const rv=cl.filter(o=>o!==c&&!o.out&&!o.fin&&!sameTeam(c.i,o.i));
 if(k===6)for(const o of rv)send(o,'w');else if(k===7){for(const o of rv)send(o,'q');K.fx('qk')}else for(const o of rv)if(o.y>c.y)for(let q=0;q<2;q++)icis.push({id:nextId++,x:Math.max(6,Math.min(WW-6,o.x+(q?14:-10))),y:o.y+60+q*16,fall:1,vy:0,t:200})}
function readUp(c,u){if(typeof u.x!=='number')return;Object.assign(c,{x:u.x,y:u.y,vx:u.vx,face:u.f,pose:u.p|0,stun:u.st|0,snow:u.sn|0,floor:u.fl|0});c.gr=!!u.g;c.fl=u.fx|0;c.best=Math.max(c.best,c.floor);
 for(const e of u.c||[])if((e[0]|0)>c.cSeen){c.cSeen=e[0]|0;resolve(c,e)}}
function step(){const S=K.S;
 for(const c of cl){if(ownerNet(c)){const u=K.remote(c.i);if(u)readUp(c,u);continue}move(c,c.fin?{}:K.inp(c.i))}
 // blocks freeze again after a while unless someone stands in the gap
 for(let k=broken.length-1;k>=0;k--){const[cell,t,v]=broken[k];if(K.tick-t>1800){const f=Math.floor(cell/NC),col=cell%NC;
   if(!cl.some(c=>Math.abs(c.x-(col*T+4))<8&&c.y>f*FH-T-CH-2&&c.y<f*FH+2)){grid[cell]=v;broken.splice(k,1)}}}
 for(const k of clouds){k.x+=k.d*k.sp;if(k.x<k.x0||k.x>k.x1)k.d*=-1}
 // seals walk the floors and push ice into the holes
 if(K.tick%300===150&&seals.length<2+cl.length/4){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&!c.fin){const f=Math.min(NF,c.floor+1+Math.floor(Math.random()*2));
   if(f>0&&grid.slice(f*NC,f*NC+NC).some(breakable)){const d=Math.random()<.5?1:-1;seals.push({id:nextId++,f,x:d>0?4:WW-4,d,st:0,t:0})}}}
 for(const e of seals){e.t++;if(e.hit){e.x+=e.vx;e.vy=(e.vy||0)-.2;e.yy=(e.yy||0)+e.vy;if(e.yy<-80)e.dead=1;continue}
  if(e.st>0){if(--e.st===0){const cell=e.f*NC+e.fill;if(grid[cell]===0&&!cl.some(c=>Math.abs(c.x-(e.fill*T+4))<7&&c.y>e.f*FH-T-CH&&c.y<e.f*FH+1)){grid[cell]=1;K.fx('fill',cell)}}continue}
  const nx=e.x+e.d*.45,col=Math.floor((nx+e.d*5)/T);if(nx<4||nx>WW-4){e.d*=-1;continue}
  if(!cellAt(e.f,col)){if(e.t>20&&ORIG.has(e.f*NC+col)&&Math.random()<.6){e.st=50;e.fill=col}else e.d*=-1}else e.x=nx;if(e.t>2400)e.dead=1}
 seals=seals.filter(e=>!e.dead);
 // birds swoop across near the climbers
 if(K.tick%220===100&&birds.length<Math.min(6,1+cl.length/3)){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&!c.fin&&c.floor>2){const d=Math.random()<.5?1:-1;birds.push({id:nextId++,x:d>0?-8:WW+8,y:(c.floor+1)*FH+14,y0:(c.floor+1)*FH+14,vx:d*(.7+Math.random()*.4),t:0})}}
 for(const b of birds){b.t++;if(b.hit){b.vy=(b.vy||0)-.2;b.y+=b.vy;b.x+=b.vx*.3;if(b.y<b.y0-100)b.dead=1;continue}b.x+=b.vx;b.y=b.y0+Math.sin(b.t*.05)*10;if(b.x<-12||b.x>WW+12)b.dead=1}
 birds=birds.filter(b=>!b.dead);
 // icicles grow under the ice above a climber, then drop
 if(K.tick%110===55&&icis.length<8){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&c.floor>2&&!c.fin){const f=c.floor+1,col=Math.max(0,Math.min(NC-1,Math.floor(c.x/T)+Math.floor(Math.random()*7)-3));if(cellAt(f,col))icis.push({id:nextId++,x:col*T+4,y:f*FH-T,fall:0,t:0,vy:0})}}
 for(const ic of icis){ic.t++;if(!ic.fall&&(ic.t>110||!cellAt(Math.round((ic.y+T)/FH),Math.floor(ic.x/T))))ic.fall=1;
  if(ic.fall){ic.vy-=.2;ic.y+=ic.vy;if(ic.vy<-1&&hitBox(ic.x-1,ic.y,ic.x+1,ic.y+1)&&ic.t>3){ic.dead=1;for(let k=0;k<4;k++)parts.push({x:ic.x,y:ic.y+2,vx:(Math.random()-.5)*1.5,vy:Math.random(),t:16,c:'#a0f0ff',g:1})}if(ic.y<av-20)ic.dead=1}}
 icis=icis.filter(ic=>!ic.dead);
 // snowballs
 for(const b of balls){b.x+=b.vx;b.y+=b.vy;b.vy-=.1;b.t--;if(b.x<0||b.x>WW||hitBox(b.x-1,b.y-1,b.x+1,b.y+1))b.t=0;
  for(const o of cl)if(o.i!==b.own&&!o.out&&!o.fin&&!sameTeam(o.i,b.own)&&Math.abs(o.x-b.x)<6&&b.y>o.y&&b.y<o.y+CH){b.t=0;send(o,'k',Math.sign(b.vx),b.own);break}}
 balls=balls.filter(b=>b.t>0);
 // vegetables appear a floor or two above the climbers
 if(S.items!=='off'&&K.tick%200===80&&items.length<3+cl.length/3){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&!c.fin){const f=Math.min(NF,c.floor+1+Math.floor(Math.random()*2)),col=2+Math.floor(Math.random()*(NC-4));
   if(cellAt(f,col)&&!cellAt(f+1,col))items.push({id:nextId++,x:col*T+4,y:f*FH,k:Math.floor(Math.random()*5),t:1800})}}
 for(const it of items)it.t--;items=items.filter(it=>!it.dead&&it.t>0);
 // the condor circles above the summit
 condor.x+=condor.d*.9;if(condor.x<24||condor.x>WW-24)condor.d*=-1;condor.y=NF*FH+50+Math.sin(K.tick*.05)*5;
 // the avalanche: whoever it catches is buried and dug out just above it
 if(K.tick>CD+300)av+=avSp;
 for(const c of cl){if(c.out||c.fin||c.buried)continue;if(c.y<av-4&&!(c.bt>K.tick)){c.bt=K.tick+90;if(K.mode===2){c.lives--;if(c.lives<=0){c.out=true;say(c,'BURIED!','#f05050');continue}}send(c,'av');say(c,'AVALANCHE!','#f05050')}}
 places();vis();checkEnd()}
function places(){cl.slice().sort((a,b)=>a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:(a.out-b.out)||b.y-a.y).forEach((c,k)=>c.place=k+1)}
function checkEnd(){const lim=K.S.len*3600,live=cl.filter(c=>!c.out);
 if(K.mode===2){const up=live.filter(c=>c.fin||c.y>=NF*FH).length;if(!live.length){K.end({coop:0,name:'BURIED AT FLOOR '+Math.max(...cl.map(c=>c.best))});return}
  if(live.some(c=>c.fin)&&(up===live.length||K.tick-firstFin>2400)){K.end({coop:1,name:up===live.length?'ALL TO THE TOP!':up+' OF '+live.length+' MADE IT!'});return}if(lim&&K.tick>lim+CD)K.end({coop:0,name:'OUT OF TIME'});return}
 const humans=cl.filter(c=>K.seats[c.i].ctrl!=='cpu'&&!c.fin&&!c.out).length;
 if(live.every(c=>c.fin)&&finN||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>300||finN&&K.tick-firstFin>1800||lim&&K.tick>lim+CD){places();const w=cl.find(c=>c.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=cl.length,sc=[0,1].map(t=>cl.filter(c=>c.i%2===t).reduce((a,c)=>a+(n-c.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(c,s,col){texts.push({x:c.x,y:c.y+26,s,col,t:70,who:c.i})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy-=.15;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>300)parts.splice(0,parts.length-300);
 for(const t of texts){t.t--;t.y+=.3}texts=texts.filter(t=>t.t>0)}

/* ---------- guests ---------- */
function local(i){const c=cl[i];if(!c)return;move(c,c.fin?{}:K.inp(i));for(const[cell,t]of L.broken)if(K.tick-t>90)L.broken.delete(cell);for(const k of clouds){k.x+=k.d*k.sp;if(k.x<k.x0||k.x>k.x1)k.d*=-1}}
function flags(c){if(c.fl!=null&&(K.isClient()?c.i!==K.myIdx:ownerNet(c)))return c.fl;const f=c.fx;return(f.boots>0?1:0)|(f.big>0?2:0)|(f.bal>0?4:0)|(f.parka>0?8:0)|(f.wind>0?16:0)|(c.buried>0?32:0)}
function upload(i){const c=cl[i];if(!c)return null;return{x:Math.round(c.x*10)/10,y:Math.round(c.y*10)/10,vx:Math.round(c.vx*100)/100,f:c.face,p:c.pose,st:c.stun,sn:c.snow,fl:c.floor,g:c.gr?1:0,fx:flags(c),c:c.claims}}
function packGrid(){let s='';for(let f=1;f<=NF;f++){let a=0,b=0;for(let c=0;c<16;c++){if(grid[f*NC+c]===0&&breakSrc(f,c))a|=1<<c;if(grid[f*NC+16+c]===0&&breakSrc(f,16+c))b|=1<<c}s+=a.toString(36)+','+b.toString(36)+'.'}return s}
const ORIG=new Map();const breakSrc=(f,c)=>ORIG.get(f*NC+c);
function snap(){return{cl:cl.map(c=>[Math.round(c.x),Math.round(c.y),c.face,c.pose,flags(c),c.stun,c.place,c.fin,c.out?1:0,c.lives,c.best,ownerNet(c)?c.ev:0,c.ft,c.snow]),
 gd:packGrid(),it:items.map(it=>[it.id,it.x,it.y,it.k]),se:seals.map(e=>[e.id,e.f,Math.round(e.x),e.d,e.hit?1:0,Math.round(e.yy||0),e.st]),bd:birds.map(b=>[b.id,Math.round(b.x),Math.round(b.y),b.vx>0?1:0,b.hit?1:0]),
 ic:icis.map(ic=>[ic.id,ic.x,Math.round(ic.y),ic.fall?1:0]),sb:balls.map(b=>[Math.round(b.x),Math.round(b.y)]),av:Math.round(av),cx:Math.round(condor.x),cy:Math.round(condor.y),cd:condor.d,cu:clouds.map(k=>[Math.round(k.x),k.d])}}
function apply(g){const rows=String(g.gd||'').split('.');for(let f=1;f<=NF;f++){const[a,b]=(rows[f-1]||'0,0').split(',').map(v=>parseInt(v,36)|0);
  for(let c=0;c<NC;c++){const cell=f*NC+c,o=ORIG.get(cell);if(o==null)continue;const gone=c<16?(a>>c)&1:(b>>(c-16))&1;grid[cell]=gone?0:o;if(!gone&&L.broken.has(cell)&&K.tick-L.broken.get(cell)>40)L.broken.delete(cell)}}
 (g.cl||[]).forEach((a,i)=>{const c=cl[i];if(!c)return;c.place=a[6];c.fin=a[7];c.out=!!a[8];c.lives=a[9];c.best=a[10];c.ft=a[12];
  if(i===K.myIdx){for(const e of a[11]||[])if((e[0]|0)>c.evSeen){c.evSeen=e[0]|0;onEv(c,e[1],e[2],e[3])}return}
  c.tx=a[0];c.ty=a[1];c.face=a[2];c.pose=a[3];c.fl=a[4];c.stun=a[5];c.snow=a[13];if(c.gx==null){c.x=c.tx;c.y=c.ty;c.gx=1}});
 const im=new Map(items.map(x=>[x.id,x]));items=(g.it||[]).map(r=>({id:r[0],x:r[1],y:r[2],k:r[3],got:im.get(r[0])&&im.get(r[0]).got}));
 const sm=new Map(seals.map(x=>[x.id,x]));seals=(g.se||[]).map(r=>{const o=sm.get(r[0]);return{id:r[0],f:r[1],x:o&&!r[4]?o.x+(r[2]-o.x)*.5:r[2],d:r[3],hit:r[4]||o&&o.hit,yy:r[5],st:r[6],t:o?o.t+1:0}});
 const bm=new Map(birds.map(x=>[x.id,x]));birds=(g.bd||[]).map(r=>({id:r[0],x:r[1],y:r[2],vx:r[3]?1:-1,hit:r[4]||bm.get(r[0])&&bm.get(r[0]).hit,t:bm.get(r[0])?bm.get(r[0]).t+1:0}));
 const om=new Map(icis.map(x=>[x.id,x]));icis=(g.ic||[]).map(r=>({id:r[0],x:r[1],y:r[2],fall:r[3],hit:om.get(r[0])&&om.get(r[0]).hit}));
 balls=(g.sb||[]).map(r=>({x:r[0],y:r[1]}));av=g.av|0;condor.x=g.cx|0;condor.y=g.cy|0;condor.d=g.cd||1;(g.cu||[]).forEach((r,k)=>{if(clouds[k]){clouds[k].x=r[0];clouds[k].d=r[1]}})}
function follow(){for(const c of cl){if(c.i===K.myIdx||c.tx==null)continue;const dx=c.tx-c.x,dy=c.ty-c.y;if(Math.abs(dx)>40||Math.abs(dy)>40){c.x=c.tx;c.y=c.ty}else{c.x+=dx*.4;c.y+=dy*.4}}vis()}
function onFx(k,a){if(k==='f'){const c=cl[a[0]];if(c)sfx('roar')}else if(k==='qk')shake=5;else if(k==='fill'){}}

/* ---------- CPU climbers ---------- */
function bot(i){const c=cl[i];if(!c||c.out||c.fin||c.stun>0)return{};const o={},lvl=K.cpu,f=c.floor,up=f+1;
 if(c.fx.bal>0)return{};
 // like a person: after landing on a new floor, look up for a moment before moving
 if(c.gr&&c.bf!==f){c.bf=f;c.wait=K.tick+[90,35,18][lvl]+Math.random()*[70,30,15][lvl];c.err=(Math.random()-.5)*[13,4,1.5][lvl]}
 if(c.wait>K.tick)return{};
 if(up>NF){const dx=condor.x-c.x;if(Math.abs(dx)>6)o[dx>0?'right':'left']=true;if(Math.abs(dx)<24&&c.gr&&(K.tick&1))o.up=true;return o}
 if(c.gr){if(c.tf!==up||c.tT<K.tick){// pick a way up: an open hole next to a ledge, or ice to smash
   // only spots with ground to stand on, and preferably without a gap in my own floor on the way
   const here=Math.floor(c.x/T),gapBetween=col=>{for(let k=Math.min(here,col);k<=Math.max(here,col);k++)if(!solidAt(f,k)&&!cloudUnder(k*T+4,f*FH))return true;return false};
   let best=null,bs=1e9;for(let col=0;col<NC;col++){const v=solidAt(up,col);if(v===2||v===4||v===5||!solidAt(f,col))continue;
    const ledge=solidAt(up,col-1)||solidAt(up,col+1)||cloudUnder(col*T+4,up*FH);if(!v&&!ledge)continue;
    const d=Math.abs(col*T+4-c.x)+(v?16:0)+(gapBetween(col)?400:0)+Math.random()*[40,16,4][lvl];if(d<bs){bs=d;best=col}}
   c.tf=up;c.tc=best;c.tT=K.tick+(best==null?30:90)}
  if(c.tc==null){o[(K.tick>>7)&1?'left':'right']=true;return o}
  const tx=c.tc*T+4+(c.err||0),dx=tx-c.x,ahead=Math.floor((c.x+Math.sign(dx)*6)/T);
  if(Math.abs(dx)>1.5){if(!solidAt(f,ahead)&&!cloudUnder(ahead*T+4,f*FH)&&Math.abs(dx)>10){if(Math.abs(c.vx)<.3&&(K.tick&1))o.up=true;o[dx>0?'right':'left']=Math.abs(c.vx)>.2||!c.gr}   // a gap ahead: hop over it from a standstill
   else o[dx>0?'right':'left']=true}else if(Math.abs(c.vx)<.5&&(K.tick&1)&&Math.random()<[.3,.6,.9][lvl])o.up=true}
 else if(c.y>up*FH-2&&c.vy<1.5){// through the hole: drift onto the nearest ledge
  let best=null,bs=1e9;for(let col=0;col<NC;col++)if(solidAt(up,col)){const d=Math.abs(col*T+4-c.x);if(d<bs){bs=d;best=col}}if(best!=null){const dx=best*T+4-c.x;if(Math.abs(dx)>1)o[dx>0?'right':'left']=true}}
 for(const r of cl)if(r!==c&&!r.out&&!r.fin&&!sameTeam(i,r.i)&&Math.abs(r.y-c.y)<8&&Math.abs(r.x-c.x)<16&&Math.random()<[.02,.05,.1][lvl]){c.face=r.x>c.x?1:-1;o.alt=true}
 for(const e of seals)if(!e.hit&&Math.abs(e.f*FH-c.y)<6&&Math.abs(e.x-c.x)<22&&(e.x-c.x)*c.face>0&&Math.random()<[.1,.25,.5][lvl])o.alt=true;
 if(c.snow>0&&Math.random()<.02&&cl.some(r=>r!==c&&Math.abs(r.y-c.y)<16&&Math.abs(r.x-c.x)<80))o.b3=true;
 return o}

/* ---------- pixel art ---------- */
const IMG={};
const tileImg=k=>IMG['t'+k]||(IMG['t'+k]=X.sprite(ART.tile[k]));
function climberImg(col,pose,face){const k='c'+col+pose+face;if(IMG[k])return IMG[k];const s=X.recolor(ART.cl[POSES[pose]||'stand'],col,null,'cl'+pose);return IMG[k]=face<0?X.flipX(s):s}
const sealImg=(f,d)=>{const k='s'+f+d;return IMG[k]||(IMG[k]=d<0?X.sprite(ART.seal[f]):X.flipX(X.sprite(ART.seal[f])))};
const birdImg=(f,d)=>{const k='b'+f+d;return IMG[k]||(IMG[k]=d>0?X.sprite(ART.bird[f]):X.flipX(X.sprite(ART.bird[f])))};
const condorImg=(f,d)=>{const k='cd'+f+d;return IMG[k]||(IMG[k]=d>0?X.sprite(ART.condor[f]):X.flipX(X.sprite(ART.condor[f])))};
const vegImg=k=>IMG['v'+k]||(IMG['v'+k]=X.sprite(ART.veg[k]));
const cloudImg=()=>IMG.cloud||(IMG.cloud=X.sprite(ART.cloud));
const iciImg=()=>IMG.ici||(IMG.ici=X.sprite(ART.icicle));
const balloonImg=()=>IMG.bal||(IMG.bal=X.sprite(['.kkkk.','kPpppk','kPpppk','kppppk','.kppk.','..kk..','...k..','..k...','...k..']));
const tileOf=(f,v)=>v===6?'grass':v===2?'rock':v===3?'slip':v===4||v===5?'beltL':tier(f);
// rock wall texture for the mountain sides, and far mountains for the background
function wallImg(){if(IMG.wall)return IMG.wall;const c=X.mk(32,40),g=c.getContext('2d'),rr=RA.util.mulberry(5);g.fillStyle='#5c566c';g.fillRect(0,0,32,40);
 for(let k=0;k<26;k++){const x=Math.floor(rr()*30),y=Math.floor(rr()*38),w=2+Math.floor(rr()*5);g.fillStyle=rr()<.5?'#9a94a8':'#2c2638';g.fillRect(x,y,w,2)}
 g.fillStyle='#ffffff';g.fillRect(0,0,32,3);g.fillStyle='#a0f0ff';g.fillRect(0,3,32,1);for(let x=0;x<32;x+=5){g.fillStyle='#ffffff';g.fillRect(x,3,2,2)}return IMG.wall=c}
function farImg(w){const k='far'+w;if(IMG[k])return IMG[k];const h=70,c=X.mk(w,h),g=c.getContext('2d'),rr=RA.util.mulberry(9);
 // two ranges of peaks: flat colours, a snow cap, lit on the left
 for(const[L,col,shade,cap,n]of[[0,'#8a9ad0','#7484c0','#e8eef8',3],[1,'#5868a8','#4a5898','#ffffff',5]]){const peaks=[];for(let k=0;k<=n;k++)peaks.push([k*w/n+(rr()-.5)*w/n*.5,L?30+rr()*18:6+rr()*16]);
  for(let x=0;x<w;x++){let y=1e9,best=peaks[0];for(const p of peaks){const v=p[1]+Math.abs(x-p[0])*(L?.85:.7);if(v<y){y=v;best=p}}y=Math.min(h,Math.round(y));const lit=x<best[0];
   g.fillStyle=lit?col:shade;g.fillRect(x,y,1,h-y);const sn=Math.round((L?5:9)-Math.abs(x-best[0])*.12);if(y<best[1]+(L?10:14)&&sn>0){g.fillStyle=lit?cap:'#c8d4ec';g.fillRect(x,y,1,sn)}}}
 return IMG[k]=c}
function skyImg(w,h,alt){const a=Math.round(alt*8),k='sky'+w+'x'+h+':'+a;if(IMG[k])return IMG[k];const c=X.mk(w,h),g=c.getContext('2d'),t=a/8;
 // banded sky like a 16-bit game: flat bands of close colours, dithered only on a 4px seam between bands
 const ramp=t<.4?['#4878e0','#5890f0','#70a8f8','#90c4ff','#b0dcff']:t<.75?['#283c90','#34509c','#4a62b0','#6a70c0','#8a7ccc']:['#100c18','#18142c','#20204a','#2c2c60','#3a3878'];
 const n=ramp.length,bh=h/n;for(let y=0;y<h;y++){const b=Math.min(n-1,Math.floor(y/bh)),into=y-b*bh;for(let x=0;x<w;x++){let col=ramp[b];if(b<n-1&&into>bh-4&&X.dither(x,y,(into-(bh-4))/4))col=ramp[b+1];g.fillStyle=col;g.fillRect(x,y,1,1)}}
 if(t>.6){g.fillStyle='#ffffff';for(let k=0;k<w*h/700;k++)g.fillRect((k*71)%w,(k*37)%Math.round(h*.55),1,1)}return IMG[k]=c}
/* ---------- drawing one view ---------- */
const cams=[];let SCR=null;
function view(g,c,vx,vy,vw,vh,ci,small){let cam=cams[ci];if(!cam||cam.i!==c.i)cam=cams[ci]={i:c.i,y:c.y+40,x:c.x};
 const tgt=c.gr?c.y+38:Math.min(cam.y,c.y+38);cam.y+=(Math.max(vh/2-20,tgt)-cam.y)*.1;if(c.y+38<cam.y-vh)cam.y=c.y+38;
 const wall=vw>=WW+40?Math.floor((vw-WW)/2):0;cam.x+=(Math.max(vw/2-wall,Math.min(WW-vw/2+wall,c.x))-cam.x)*.2;if(wall)cam.x=WW/2;
 const shx=!small&&shake>.4?Math.round((Math.random()-.5)*shake):0,shy=!small&&shake>.4?Math.round((Math.random()-.5)*shake):0;
 const SX=x=>Math.round(vx+vw/2+(x-cam.x))+shx,SY=y=>Math.round(vy+vh/2-(y-cam.y))+shy;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 // sky by altitude: blue, then dusk, then stars near the top
 const alt=Math.max(0,Math.min(1,cam.y/(NF*FH)));g.drawImage(skyImg(vw,vh,alt),vx,vy);
 const fi=farImg(Math.max(64,vw));g.drawImage(fi,vx,Math.round(vy+vh-fi.height+Math.min(150,cam.y*.05)));
 // distant drifting clouds
 for(let k=0;k<4;k++){const cx=vx+((k*97+K.tick*.08*(k+1))%(vw+60))-30,cy=vy+20+k*30+Math.round(cam.y*.05)%40;g.fillStyle='rgba(255,255,255,.35)';g.fillRect(Math.round(cx),cy,30,3);g.fillRect(Math.round(cx)+5,cy-2,18,2)}
 // the floors in view
 const f0=Math.max(0,Math.floor((cam.y-vh/2)/FH)-1),f1=Math.min(NF+1,Math.ceil((cam.y+vh/2)/FH)+1);
 {const gy=SY(0)+T;if(gy<vy+vh){g.fillStyle='#7c4a24';g.fillRect(vx,gy,vw,vy+vh-gy);g.fillStyle='#462818';for(let x=0;x<vw;x+=2)for(let y=gy+2;y<vy+vh;y+=3)if(RA.util.hash(x+Math.round(cam.x),y-gy)%5===0)g.fillRect(vx+x,y,1,1)}}
 for(let f=f0;f<=f1;f++){const y=SY(f*FH);for(let col=0;col<NC;col++){const v=solidAt(f,col);if(!v)continue;const sx=SX(col*T);if(sx<vx-8||sx>vx+vw)continue;
   g.drawImage(tileImg(tileOf(f,v)),sx,y);if(v===4||v===5){g.fillStyle='#fff07c';const ph=((K.tick>>2)+col*2)%8;g.fillRect(sx+(v===4?7-ph:ph),y+3,1,2)}}}
 // the summit
 if(SY(NF*FH)>vy-60){const y=SY(NF*FH);g.fillStyle='#ffffff';for(let x=0;x<WW;x+=2)g.fillRect(SX(x),y-1-((x>>3)&1),2,1);
  const cf=condorImg((K.tick>>3)&1,condor.d),cx=SX(condor.x)-cf.width/2,cy=SY(condor.y)-cf.height/2;g.drawImage(cf,Math.round(cx),Math.round(cy));
  if(!c.fin)txt(g,'GRAB THE CONDOR!',SX(WW/2),SY(NF*FH+80),{col:'#fff07c',align:'center',outline:P.k})}
 for(const k of clouds){const y=SY(k.f*FH);if(y<vy-10||y>vy+vh+10)continue;g.drawImage(cloudImg(),SX(k.x)-1,y-1)}
 // mountain sides with floor numbers
 if(wall){for(const side of[0,1]){const x0=side?vx+wall+WW:vx;for(let f=f0-3;f<=f1+1;f++)g.drawImage(wallImg(),x0,SY((f+1)*FH),wall,FH);g.fillStyle='#2c2638';g.fillRect(side?x0:x0+wall-1,vy,1,vh)}
  for(let f=f0;f<=f1;f++)if(f>0&&f<=NF&&f%5===0){const y=SY(f*FH);g.fillStyle=P.k;g.fillRect(vx+2,y-9,wall-4,9);txt(g,f+'F',vx+wall/2,y-8,{col:'#fff07c',align:'center',shadow:false})}}
 // vegetables, icicles, seals, birds
 for(const it of items){if(it.got)continue;const vi=vegImg(it.k);g.drawImage(vi,SX(it.x)-vi.width/2,SY(it.y)-vi.height-((K.tick>>4)&1))}
 for(const ic of icis){const im=iciImg(),grow=ic.fall?1:Math.min(1,(ic.t||60)/60);if(grow<1){g.drawImage(im,0,0,im.width,Math.max(1,Math.round(im.height*grow)),SX(ic.x)-2,SY(ic.y),im.width,Math.max(1,Math.round(im.height*grow)))}else g.drawImage(im,SX(ic.x)-2,SY(ic.y)-(ic.fall?im.height:0))}
 for(const e of seals){const im=sealImg(e.st>0?0:(e.t>>3)&1,e.d),y=SY(e.f*FH+(e.yy||0))-im.height;g.save();if(e.hit){g.translate(SX(e.x),y+3);g.rotate(Math.PI);g.drawImage(im,-im.width/2,-3)}else g.drawImage(im,SX(e.x)-im.width/2,y);g.restore();
  if(e.st>0){g.drawImage(tileImg('ice'),SX(e.x)+e.d*(6+(50-e.st)/10)-4,SY(e.f*FH)-T)}}
 for(const b of birds){const im=birdImg(b.hit?0:(b.t>>3)&1,b.vx>0?1:-1);g.drawImage(im,SX(b.x)-im.width/2,SY(b.y)-im.height/2)}
 // climbers: the one you watch last, so it is on top
 const order=cl.filter(o=>!o.out&&!(flags(o)&32)).sort((a,b)=>(a===c)-(b===c));
 for(const o of order){const im=climberImg(o.col,o.pose|0,o.face||1),fl=flags(o),x=SX(o.x),y=SY(o.y);if(y<vy-30||y>vy+vh+30)continue;
  const ax=o.face<0?im.width-1-6:6;if(fl&4){const bi=balloonImg();g.drawImage(bi,x-3,y-im.height-bi.height+2)}
  g.drawImage(im,x-ax,y-im.height+1);
  if(fl&8&&(K.tick>>2)&1){g.fillStyle='#a0f0ff';g.fillRect(x-6,y-im.height,1,im.height);g.fillRect(x+6,y-im.height,1,im.height)}
  if(fl&2&&o.pose>=6&&o.pose<=8){g.fillStyle='#ffa040';g.fillRect(x+o.face*12,y-10,2,2)}
  if(o.stun>0&&o.pose===9)for(let k=0;k<2;k++){const a=K.tick*.2+k*Math.PI;g.fillStyle='#fff07c';g.fillRect(Math.round(x+Math.cos(a)*6),Math.round(y-im.height-2+Math.sin(a)*2),2,2)}
  const st=K.seats[o.i];if(o!==c&&!K.demo&&st&&(st.ctrl==='net'?!!st.peer:st.ctrl!=='cpu'))txt(g,o.name.slice(0,10),x,y-im.height-9,{col:o.col,align:'center',outline:P.k})}
 for(const b of balls){g.fillStyle='#ffffff';g.fillRect(SX(b.x)-1,SY(b.y)-1,3,3)}
 for(const p of parts){g.fillStyle=p.c;const s=p.sz||1;g.fillRect(SX(p.x),SY(p.y),s,s)}
 for(const t of texts){if(t.who!==c.i)continue;txt(g,t.s,SX(t.x),SY(t.y),{col:t.col,align:'center',outline:P.k})}
 // the avalanche
 const ay=SY(av);if(ay<vy+vh){g.fillStyle='#ffffff';for(let x=0;x<vw;x++){const h=Math.round(3+Math.abs(Math.sin((x+K.tick*.7)*.09))*5);g.fillRect(vx+x,ay-h,1,vy+vh-ay+h)}
  g.fillStyle='#a0f0ff';for(let x=0;x<vw;x+=3)g.fillRect(vx+x,ay+4+((x*7+K.tick)%9),2,1)}
 if(c.fx&&c.fx.wind>0){g.fillStyle='rgba(232,228,220,.55)';g.fillRect(vx,vy,vw,vh);g.fillStyle='#ffffff';for(let k=0;k<40;k++)g.fillRect(vx+((k*53+K.tick*4)%vw),vy+(k*29)%vh,3,1)}
 hud(g,c,vx,vy,vw,vh,small,wall);g.restore();if(small){g.fillStyle=P.k;g.fillRect(vx+vw-1,vy,1,vh);g.fillRect(vx,vy+vh-1,vw,1)}}
function hud(g,c,vx,vy,vw,vh,small,wall){
 if(K.tick<CD){const n=3-Math.floor(K.tick/(CD/3));txt(g,n>0?n+'':'GO',vx+vw/2,vy+vh*.3,{col:'#ffffff',align:'center',scale:3,outline:P.k});if(K.tick%(CD/3|0)===0)RA.audio.blip(440)}
 else if(K.tick<CD+40)txt(g,'CLIMB!',vx+vw/2,vy+vh*.3,{col:'#88dc48',align:'center',scale:3,outline:P.k});
 if(K.demo){txt(g,'ICE PEAK',vx+vw/2,vy+vh-16,{col:'#fff07c',align:'center',outline:P.k});return}
 const fl=Math.min(NF,c.floor);
 if(wall>=28){// left wall: floor and place; right wall: the altimeter with everyone on it
  g.fillStyle=P.k;g.fillRect(vx,vy+14,wall,36);txt(g,'FLOOR',vx+wall/2,vy+16,{col:'#9a94a8',align:'center',shadow:false});txt(g,fl+'',vx+wall/2,vy+25,{col:'#ffffff',align:'center',scale:2,shadow:false});
  txt(g,K.mode===2?'♥'.repeat(Math.max(0,c.lives)):ord(c.place),vx+wall/2,vy+41,{col:K.mode===2?'#f05050':c.place===1?'#fff07c':'#e8e4dc',align:'center',shadow:false});
  const ax=vx+wall+WW+wall/2,a0=vy+vh-14,a1=vy+18,H=a0-a1,Y=y=>Math.round(a0-Math.max(0,Math.min(1,y/(NF*FH)))*H);
  g.fillStyle=P.k;g.fillRect(ax-3,a1-3,7,H+6);g.fillStyle='#fff07c';g.fillRect(ax-3,a1-5,7,2);
  if(av>-30){g.fillStyle='#e8e4dc';g.fillRect(ax-2,Y(av),5,a0-Y(av))}
  for(const o of cl){if(o.out)continue;g.fillStyle=o.col;g.fillRect(ax-2,Y(o.y),5,1)}g.fillStyle='#ffffff';g.fillRect(ax-4,Y(c.y)-1,9,3);g.fillStyle=c.col;g.fillRect(ax-3,Y(c.y),7,1);
  let iy=vy+56;const f=c.fx||{};for(const[k,max,it]of[['boots',900,1],['big',700,2],['bal',150,3],['wind',300,6]])if(f[k]>0){g.fillStyle=ITEMS[it].c;g.fillRect(vx+3,iy,Math.round((wall-6)*f[k]/max),2);txt(g,ITEMS[it].n.split(' ')[0].slice(0,5),vx+wall/2,iy+3,{col:ITEMS[it].c,align:'center',shadow:false});iy+=13}
  if(f.parka>0){txt(g,'PARKA',vx+wall/2,iy+3,{col:'#60a0ff',align:'center',shadow:false});iy+=13}if(c.snow>0)txt(g,'Q x'+c.snow,vx+wall/2,iy+3,{col:'#ffffff',align:'center',shadow:false})}
 else txt(g,fl+'F '+(K.mode===2?'':ord(c.place)),vx+4,vy+(vy===0?16:4),{col:'#ffffff',outline:P.k});
 const t=K.tick-CD;if(!small&&t>0&&t<500&&isMine(c)){g.fillStyle=P.k;g.fillRect(vx+wall+4,vy+28,WW-8,11)}if(!small&&t>0&&t<500&&isMine(c))txt(g,t<250?'SPACE: JUMP INTO THE ICE TO SMASH IT':'JUMP THROUGH THE HOLE  E: HAMMER',vx+vw/2,vy+30,{col:'#fff07c',align:'center',outline:P.k});
 if(c.fin)txt(g,ord(c.fin)+' TO THE TOP!',vx+vw/2,vy+vh*.3,{col:'#fff07c',align:'center',scale:small?1:2,outline:P.k});
 if(c.y-av<FH&&avSp>0&&!c.fin&&(K.tick>>4)&1)txt(g,'AVALANCHE!',vx+vw/2,vy+vh-32,{col:'#f05050',align:'center',scale:small?1:2,outline:P.k})}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);
 if(!grid){SCR.present(ctx,W,H);return}if(shake>0)shake*=.85;
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=cl.slice().sort((a,b)=>a.place-b.place).find(c=>!c.out)||cl[0];fs=lead?[lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length,w=SCR.w,h=SCR.h-(K.demo?0:9);
 const rects=n<=1?[[0,0,w,h]]:n===2?[[0,0,w>>1,h],[w>>1,0,w-(w>>1),h]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];
 fs.forEach((i,k)=>{const q=rects[k];view(g,cl[i],q[0],q[1],q[2],q[3],k,n>1)});SCR.present(ctx,W,H)}
K=RA.kit({id:'icepeak',name:'ICE PEAK',kind:'Climbing race',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Ice Climber for up to 20 in pixel art: jump up into the ice to smash a hole, jump through it, knock rivals off their ledge with your hammer, outrun the avalanche and grab the condor at the summit.',
 blurb:'Space jumps: jump up into the ice to smash it, then jump through the hole. E swings the hammer, Q throws snowballs. Grab the condor at the top!',
 howto:'A / D walk, Space / W / click jump, E / right-click hammer, Q snowball. Gamepad: stick, A jump, B hammer, X snowball.',
 icon:['....kk....','...kwwk...','..kwwwck..','..kcwwcck.','.kccccscck','.kcsccccsk','kssccsscck','kssssssssk','kkkkkkkkkk','..........'],
 music:MUSIC,fireLabel:'JUMP',
 modes:[['RACE','First to grab the condor wins.'],['TEAM RACE','Red vs blue: points for every finishing place.'],['CO-OP CLIMB','Everyone up before the avalanche, shared fate.']],
 settings:[['height','Mountain',[[16,'16 floors'],[24,'24 floors'],[32,'32 floors']]],['av','Avalanche',[[1,'Slow'],[0,'Off'],[2,'Fast']]],['items','Vegetables',[['on','On'],['party','Wild party'],['off','Off']]],
  ['lives','Co-op lives',[[3,'3'],[1,'1'],[5,'5']]],['len','Time limit',[[0,'None'],[5,'5 min'],[8,'8 min']]]],
 kb:[['A D','walk'],['SPACE W','jump'],['E RMB','hammer'],['Q','snowball'],['C','chat'],['ESC','menu']],pad:[['LS','walk'],['A','jump'],['B','hammer'],['X','snowball'],['START','menu']],
 ach:[{id:'first',name:'Base Camp',desc:'Finish your first climb',test:s=>s.played>=1,unlock:'title:Climber'},{id:'win1',name:'Summit',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Mountaineer'},
  {id:'smash50',name:'Ice Breaker',desc:'Smash 50 blocks in one climb',test:(s,m)=>m.smashes>=50,unlock:'title:Ice Breaker'},{id:'knock10',name:'Hammer Time',desc:'Knock rivals 10 times in one climb',test:(s,m)=>m.kills>=10,unlock:'title:Hammer Time'}],
 alive:i=>!!cl[i]&&!cl[i].out&&!cl[i].fin,out:i=>!!cl[i]&&cl[i].out,
 start:(...a)=>{start(...a);ORIG.clear();for(let i=NC;i<grid.length;i++)if(breakable(grid[i]))ORIG.set(i,grid[i])},step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>grid?NF+' floors':'',
 ranks:()=>cl.slice().sort((a,b)=>a.place-b.place).map(c=>[c.name,c.col,c.fin?'summit '+(c.ft/60).toFixed(1)+'s':c.out?'buried':'floor '+c.best]),
 result:(i,w)=>{const c=cl[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:c.knocks|0,smashes:c.smashes|0,bestScore:c.best}}});
window.__ip={get cl(){return cl},K,get grid(){return grid},bot:i=>bot(i)};
})();
