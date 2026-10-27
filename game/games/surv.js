/* NIGHT SURVIVORS for Retro Arena: horde survival for up to 20 in pixel art, with automatic weapons and growing enemy swarms.
   The original it follows: you only walk - your weapons fire by themselves; the night throws ever bigger swarms at you;
   kills drop XP gems, and every level offers three cards: a new weapon, a weapon level, or a passive.
   The 20-player twist: everyone survives the same night on one field. Fall and you become a ghost: a team mate standing
   next to you for two seconds brings you back. CO-OP: survive until dawn together (a reaper comes for the last minute).
   LAST STANDING: no revives, the last hunter alive wins.
   First seconds: hints show WASD to walk, and the cards show which key picks them (Space / E / Q, or wait and one is picked).
   Weapons: WHIP (slashes ahead), MAGIC BOLT (seeks the nearest), AXES (circle you), HOLY WATER (burning pools),
   LIGHTNING (strikes at random), GARLIC (hurts what comes close). Passives: BOOTS, HEART, MIGHT, MAGNET, CLOCK.
   Online is lag-free for your own walking (RA.kit localFirst); the host runs the night: enemies, weapons, gems and health.
   The sprites are painted in tools/art/surv (python), exported as ART below; edit surv_tpl.js and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
const ART={"hero": {"w1": [".....kkkk.....", "....k1111k....", "...k112222k...", "..k11222222k..", "..k1Kssss2k...", "..k1Ksksk2k...", "...kKsss22kk..", "..k122222223k.", ".ks12222223sk.", ".ks12222223sk.", "..k122222223k.", "..k12222223k..", "...k223322k...", "...knnkknnk...", "..knnnkknnnk..", "...kkk..kkk..."], "w2": [".....kkkk.....", "....k1111k....", "...k112222k...", "..k11222222k..", "..k1Kssss2k...", "..k1Ksksk2k...", "...kKsss22kk..", "..k122222223k.", ".ks12222223sk.", "..ks2222223sk.", "..k122222223k.", "..k12222223k..", "...k222322k...", "....knnnnk....", "...knnnkk.....", "....kkk......."], "hurt": [".....kkkk.....", "....kWWWWk....", "...kWWWWWWk...", "..kWWWWWWWWk..", "..kWKWWWWWk...", "..kWKWKWKWk...", "...kKWWWWWkk..", "..kWWWWWWWWWk.", ".kWWWWWWWWWWk.", ".kWWWWWWWWWWk.", "..kWWWWWWWWWk.", "..kWWWWWWWWk..", "...kWWWWWWk...", "...kWWkkWWk...", "..kWWWkkWWWk..", "...kkk..kkk..."], "ghost": [".....kkkk.....", "....kCCCCk....", "...kCCCCCCk...", "..kCCCCCCCCk..", "..kCkCCkCCCk..", "..kCCCCCCCCk..", "..kCCCkkCCCk..", "..kCCCCCCCCk..", "..kCCCCCCCCk..", "..kCCCCCCCCk..", "..kCCCCCCCCk..", "..kCCkCCkCCk..", "..kCkkCkkCk...", "...k..k..k....", "..............", ".............."]}, "bat": [[".k.........k.", "kkk..kkk..kkk", "kkkkkkkkkkkkk", "kkVVkrkrkVVkk", ".kVVVkkkVVVk.", "..kVkkkkkVk..", "...kkkkkkk...", ".....k.k....."], ["......k......", ".....kkk.....", "...kkkkkkk...", "..kVkrkrkVk..", ".kVVVkkkVVVk.", "kVVkkkkkkkVVk", "kVk.kkkkk.kVk", ".k...k.k...k."]], "zomb": [["....kkkk....", "...kllllk...", "..kllllllk..", "..klkllklk..", "..kllllllk..", "...klkklk...", ".kkvvvvvvkk.", "kllvvvvvvllk", "klkvvvvvvklk", ".kkvvvvvvkk.", "..kbbbbbbk..", "..kbbkkbbk..", "..kbbkkbbk..", ".kmmmkkmmmk.", "..kkk..kkk.."], ["....kkkk....", "...kllllk...", "..kllllllk..", "..klkllklk..", "..kllllllk..", "...klkklk...", "..kvvvvvvk..", ".klvvvvvvlk.", ".klvvvvvvlk.", "..kvvvvvvk..", "..kbbbbbbk..", "..kbbkbbk...", "...kbbbbk...", "..kmmmmmk...", "...kkkkk...."]], "skel": [["....kkkk....", "...kwwwwk...", "..kwwwwwwk..", "..kwkwwkwk..", "..kwwwwwwk..", "...kwkkwk...", "...kkwwkk...", "..kwwwwwwk..", ".kwkwwwwkwk.", "..kkwwwwkk..", "....kwwk....", "...kwkkwk...", "...kwkkwk...", "..kwwkkwwk..", "...kk..kk..."], ["....kkkk....", "...kwwwwk...", "..kwwwwwwk..", "..kwkwwkwk..", "..kwwwwwwk..", "...kwkkwk...", "...kkwwkk...", "..kwwwwwwk..", "..kwwwwwwwk.", "...kwwwwkk..", "....kwwk....", "....kwwk....", "...kwkwk....", "..kwwkwwk...", "...kk.kk...."]], "ghost": [["....kkkk....", "...kCCCCk...", "..kCCCCCCk..", ".kCCkCCkCCk.", ".kCCkCCkCCk.", ".kCCCCCCCCk.", ".kCCCkkCCCk.", ".kCCCCCCCCk.", ".kCCCCCCCCk.", ".kCCkCCkCCk.", ".kCkkCkkCk..", "..k..k..k..."], ["....kkkk....", "...kCCCCk...", "..kCCCCCCk..", ".kCCkCCkCCk.", ".kCCkCCkCCk.", ".kCCCCCCCCk.", ".kCCCkkCCCk.", ".kCCCCCCCCk.", ".kCCCCCCCCk.", "..kCCkCCkCCk", "..kCkkCkkCk.", "...k..k..k.."]], "boss": [["........kkkkkk..........", ".......kKKKKKKk.........", "......kKKKKKKKKk........", ".....kKKKKKKKKKKk.......", "....kKKggggggggKKk......", "....kKKgRggggRgKKk.k....", "....kKKggggggggKKkkGk...", "....kKKKggRRggKKKkGGk...", "...kKKKKKKKKKKKKKKGGk...", "..kKKKKKKKKKKKKKKKKGk...", ".kKKKKKKKKKKKKKKKKKKGk..", ".kKKkKKKKKKKKKKKKkKKGk..", ".kKkkKKKKKKKKKKKKkkKGk..", "..k.kKKKKKKKKKKKKk.kGk..", "....kKKKKKKKKKKKKk.kGk..", "...kKKKKKKKKKKKKKKkkGk..", "...kKKKKkKKKKkKKKKkkGk..", "..kKKKkkkKKKk.kKKKk.k...", "..kKKk..kKKk...kKKk.....", "...kk....kk.....kk......"]], "gem": {"b": ["..k..", ".kBk.", "kBBbk", "kBbbk", ".kbk.", "..k.."], "g": ["..k..", ".kLk.", "kLLlk", "kLllk", ".klk.", "..k.."], "r": ["..k..", ".kRk.", "kRRrk", "kRrrk", ".krk.", "..k.."]}, "axe": ["......kk....", ".....kGGk...", "....kGGGGk..", "...kGGWGGGk.", "..knnGGGGk..", ".knnkkGGk...", "knnk..kk....", ".kk........."], "chest": [".kkkkkkkkkkkk.", "kkkkkkkkkkkkkk", "kkNNNNNNNNNNkk", "kknnnnYYnnnnkk", "kkkkkkYYkkkkkk", "kkNNNNYYNNNNkk", "kknnnnnnnnnnkk", "kknnnnnnnnnnkk", "kkkkkkkkkkkkkk", ".kkkkkkkkkkkk."], "icon": {"whip": ["............", ".........kk.", "........knnk", "...kkk.knnk.", "..kWWWknnk..", ".kWkkkWnk...", "kWk...kWk...", ".k.....kWk..", "........kWk.", ".........k..", "............", "............"], "bolt": ["............", ".....kk.....", "....kCCk....", "...kCWWCk...", "..kCWWWWCk..", "..kCWWWWCk..", "...kCWWCk...", "....kCCk....", "....kck.....", "...kck......", "....k.......", "............"], "axe": ["......kk....", ".....kGGk...", "....kGGGGk..", "...kGGWGGGk.", "..knnGGGGk..", ".knnkkGGk...", "knnk..kk....", ".kk.........", "............", "............", "............", "............"], "water": [".....kk.....", "....kGGk....", "....kGGk....", "...kbBBbk...", "..kbBBBBbk..", "..kbBWBBbk..", "..kbBBBBbk..", "...kbbbbk...", "....kkkk....", "............", "............", "............"], "light": ["......kk....", ".....kYYk...", "....kYYk....", "...kYYYYk...", "....kYYk....", "...kYYk.....", "..kYYkk.....", ".kYYYYYk....", "..kkYYk.....", "..kYkk......", "...k........", "............"], "garlic": ["............", "....kkkk....", "...kwwwwk...", "..kwWWWWwk..", ".kwWWkWWWwk.", ".kwWkWkWWwk.", ".kwWWWWWWwk.", "..kwwwwwwk..", "...kLkkLk...", "....k..k....", "............", "............"], "boots": ["............", "...kk.......", "..knnk......", "..knNk......", "..knNk......", "..knNNkkk...", "..knNNNNnk..", ".kkkkkkkkkk.", "..kkkkkkkk..", "............", "............", "............"], "heart": ["............", "..kk...kk...", ".kRRk.kRRk..", "kRRRRkRRRRk.", "kRWRRRRRRRk.", "kRRRRRRRRRk.", ".kRRRRRRRk..", "..kRRRRRk...", "...kRRRk....", "....kRk.....", ".....k......", "............"], "might": ["............", ".....kk.....", "....krrk....", "...krRRrk...", "..krRWWRrk..", ".krRRRRRRrk.", "..krRRRRrk..", "...krrrrk...", "....kkkk....", "............", "............", "............"], "magnet": ["............", "..kk...kk...", ".kRRk.kRRk..", ".kRRk.kRRk..", ".kRRk.kRRk..", ".kRRrkrRRk..", "..kRRRRRk...", "...krrrk....", "....kkk.....", "............", "............", "............"], "clock": ["....kkkk....", "...kkkkkk...", "..kkWWWWkk..", ".kkWWkWWWkk.", ".kkWWkWWWkk.", ".kkWWkkkWkk.", ".kkWWWWWWkk.", "..kkWWWWkk..", "...kkkkkk...", "....kkkk....", "............", "............"]}, "decor": {"flower": ["..p..", "pYp..", "..p.L", ".L.L.", "..L.."], "grave": ["..GGG..", ".GgggG.", ".GgkgG.", ".GgggG.", ".GgkgG.", "GGGGGGG"], "rock": ["..GGG..", ".GGGgg.", "GGggggg"], "tuft": ["L.L.L", ".LLL."]}};
const TM=RA.music.track,sfx=RA.audio.sfx;
const FW=1600,FH=1200,CELL=32;
const WPN={whip:{n:'WHIP',d:'Slashes in front of you'},bolt:{n:'MAGIC BOLT',d:'Seeks the nearest foe'},axe:{n:'AXES',d:'Spin around you'},water:{n:'HOLY WATER',d:'Leaves burning pools'},
 light:{n:'LIGHTNING',d:'Strikes at random'},garlic:{n:'GARLIC',d:'Hurts what comes close'}};
const PAS={boots:{n:'BOOTS',d:'Walk 10% faster'},heart:{n:'HEART',d:'+25 health, heal 25'},might:{n:'MIGHT',d:'+15% damage'},magnet:{n:'MAGNET',d:'Pick gems up from further'},clock:{n:'CLOCK',d:'Weapons 8% quicker'}};
const START=['whip','axe','garlic','water'],MAXL=5;
// enemies: speed, health, contact damage per step, xp gem, size
const ENT={bat:{sp:.9,hp:8,dm:.06,gem:'b',r:5},zomb:{sp:.42,hp:26,dm:.1,gem:'b',r:6},skel:{sp:.58,hp:40,dm:.13,gem:'g',r:6},ghost:{sp:.7,hp:34,dm:.12,gem:'g',r:6},elite:{sp:.5,hp:420,dm:.3,gem:'r',r:9},boss:{sp:.55,hp:6000,dm:.6,gem:'r',r:12}};
RA.audio.add('hit',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(320,now);o.frequency.exponentialRampToValueAtTime(110,now+.05);g.gain.setValueAtTime(.025,now);g.gain.exponentialRampToValueAtTime(.001,now+.06);o.connect(g);o.start(now);o.stop(now+.07)});
RA.audio.add('gem',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(1400,now);o.frequency.exponentialRampToValueAtTime(2000,now+.04);g.gain.setValueAtTime(.03,now);g.gain.exponentialRampToValueAtTime(.001,now+.06);o.connect(g);o.start(now);o.stop(now+.07)});
RA.audio.add('lvl',(AC,now,g)=>{[523,659,784,1047].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='square';o.frequency.value=f;q.gain.setValueAtTime(0,now+k*.06);q.gain.linearRampToValueAtTime(.05,now+k*.06+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.06+.1);o.connect(q);q.connect(g);o.start(now+k*.06);o.stop(now+k*.06+.11)});g.gain.value=1});
RA.audio.add('zap',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=2000;s.connect(f);f.connect(g);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.18);s.start(now);s.stop(now+.19)});
const MUSIC=[TM('Graveyard Shift',128,['Am','F','C','E'],'k..sk..sk..sk.ss','a4 c5 e5 a5 g5 e5 c5 e5 f5 a5 c6 a5 g5 e5 c5 g4 e5 g5 c6 g5 e5 c5 g4 c5 e5 g#5 b5 g#5 e5 b4 g#4 b4'),
 TM('Dawn Is Coming',150,['Dm','Bb','C','A'],'k.hsk.hsk.hsk.hs','d5 f5 a5 d6 c6 a5 f5 a5 bb5 d6 f6 d6 c6 a5 f5 c5 c5 e5 g5 c6 bb5 g5 e5 g5 a5 c#6 e6 c#6 a5 e5 c#5 e5')];
let K,pl=[],en=[],gems=[],bolts=[],pools=[],fx=[],texts=[],nextId=1,shake=0,boss=null,won=false,endT=0;
const teamOf=i=>K.mode===1?i:0,ownerNet=p=>K.seats[p.i]&&K.seats[p.i].ctrl==='net',isMine=p=>K.isClient()?p.i===K.myIdx:!ownerNet(p);
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const LIM=()=>(+K.S.len||10)*3600,alive=p=>!p.out&&!p.down,clamp=(v,a,b)=>v<a?a:v>b?b:v;
/* ---------- the night ---------- */
function start(seats,md,S,seed){en=[];gems=[];bolts=[];pools=[];fx=[];texts=[];nextId=1;boss=null;won=false;endT=0;cams.length=0;
 pl=seats.map((s,i)=>{const a=i/seats.length*Math.PI*2;return{i,name:s.name,col:s.col,x:FW/2+Math.cos(a)*30,y:FH/2+Math.sin(a)*30,hp:100,mhp:100,lv:1,xp:0,next:6,face:1,w:Object.assign({bolt:1},{[START[i%4]]:1}),ps:{},cd:{},
  down:0,out:false,kills:0,cards:null,cardT:0,queue:0,rv:0,hurt:0,walk:0,mx:0,my:0}});
 GRID.clear()}
const nextXp=lv=>Math.round(6+lv*4.5+Math.pow(lv,1.6));
const speedOf=p=>1.15*(1+.1*(p.ps.boots|0))*(p.down?.6:1),might=p=>1+.15*(p.ps.might|0),cdm=p=>1-.08*(p.ps.clock|0),magR=p=>28*(1+.3*(p.ps.magnet|0));
// your own hunter (runs on its owner's device): walking only, and picking cards
function move(p,inp){if(p.out)return;if(p.hurt>0)p.hurt--;if(!p.down&&!K.isClient())p.hp=Math.min(p.mhp,p.hp+.012);
 let mx=(inp.right?1:0)-(inp.left?1:0),my=(inp.down?1:0)-(inp.up?1:0);if(inp.ax!=null&&Math.hypot(inp.ax,inp.ay||0)>.25){mx=inp.ax;my=inp.ay||0}
 const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}const sp=speedOf(p);p.mx=mx;p.my=my;p.x=clamp(p.x+mx*sp,12,FW-12);p.y=clamp(p.y+my*sp,12,FH-12);if(mx)p.face=mx>0?1:-1;if(l>.1)p.walk+=sp*.12;
 // cards: Space / E / Q pick the first / second / third
 if(p.cards&&!p.down){const k=inp.fire&&!p.f1?0:inp.alt&&!p.f2?1:inp.b3&&!p.f3?2:-1;if(k>=0&&k<p.cards.length)claim(p,'pick',k)}
 p.f1=!!inp.fire;p.f2=!!inp.alt;p.f3=!!inp.b3}
function claim(p,k,a){if(!K.isClient()){resolve(p,[0,k,a]);return}p.cseq=(p.cseq|0)+1;(p.claims||(p.claims=[])).push([p.cseq,k,a]);if(p.claims.length>8)p.claims.shift();if(k==='pick')p.picked=K.tick}
function resolve(p,[,k,a]){if(k==='pick'&&p.cards&&p.cards[a]){take(p,p.cards[a]);p.cards=null;p.queue--;if(p.queue>0)deal(p)}}
function take(p,c){if(WPN[c])p.w[c]=(p.w[c]|0)+1;else{p.ps[c]=(p.ps[c]|0)+1;if(c==='heart'){p.mhp+=25;p.hp=Math.min(p.mhp,p.hp+25)}}sfx('pick');if(p.i===meIdx())say(p,(WPN[c]||PAS[c]).n+' '+(WPN[c]?p.w[c]:p.ps[c]),'#fff07c')}
function deal(p){const opts=[];for(const k in WPN)if((p.w[k]|0)<MAXL&&(p.w[k]||Object.keys(p.w).length<5))opts.push(k);for(const k in PAS)if((p.ps[k]|0)<MAXL)opts.push(k);
 const owned=opts.filter(k=>p.w[k]||p.ps[k]),fresh=opts.filter(k=>!(p.w[k]||p.ps[k])),pick=[];const bag=[...owned,...owned,...fresh];
 while(pick.length<3&&bag.length){const k=bag.splice(Math.floor(Math.random()*bag.length),1)[0];if(!pick.includes(k))pick.push(k)}
 p.cards=pick.length?pick:null;p.cardT=K.tick;if(p.i===meIdx())sfx('lvl')}
// spatial grid for the swarm
const GRID=new Map();function gridBuild(){GRID.clear();for(const e of en){const k=((e.x/CELL)|0)+','+((e.y/CELL)|0);let c=GRID.get(k);if(!c)GRID.set(k,c=[]);c.push(e)}}
function near(x,y,r,f){const c0=Math.floor((x-r)/CELL),c1=Math.floor((x+r)/CELL),r0=Math.floor((y-r)/CELL),r1=Math.floor((y+r)/CELL);
 for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const c=GRID.get(cx+','+cy);if(c)for(const e of c)if(!e.dead&&Math.abs(e.x-x)<r+e.r&&Math.abs(e.y-y)<r+e.r)f(e)}}
function nearest(x,y,r){let best=null,bd=r*r;near(x,y,r,e=>{const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e}});return best}
function dmg(e,v,p,kx,ky){if(e.dead)return;e.hp-=v;e.fl=6;if(kx||ky){e.x+=kx;e.y+=ky}if(p&&p.i===meIdx()&&texts.length<40)texts.push({x:e.x,y:e.y-8,s:Math.round(v)+'',col:'#ffffff',t:24,dmg:1});
 if(e.hp<=0){e.dead=1;if(p)p.kills++;fx.push({k:'puff',x:e.x,y:e.y,t:14});const t=ENT[e.k];gems.push({x:e.x,y:e.y,v:t.gem==='b'?1:t.gem==='g'?4:20,c:t.gem});if(e.k==='elite')gems.push({x:e.x+6,y:e.y,v:0,c:'chest'});if(e.k==='boss'){boss=null;won=true;endT=K.tick}}}
function weapons(p){if(!alive(p))return;const m=might(p),c=cdm(p),t=K.tick;
 for(const k in p.w){const lv=p.w[k];p.cd[k]=(p.cd[k]|0)-1;if(p.cd[k]>0&&k!=='axe'&&k!=='garlic')continue;
  if(k==='whip'){p.cd[k]=Math.round(56*c);const w=40+6*lv,h=16+lv*2,v=(14+5*lv)*m;for(const d of[p.face,-p.face]){const cx=p.x+d*(w/2+4);near(cx,p.y-4,w/2,e=>{if(Math.abs(e.y-(p.y-4))<h)dmg(e,v,p,d*2,0)});fx.push({k:'slash',x:p.x,y:p.y-4,d,w,t:10})}}
  else if(k==='bolt'){p.cd[k]=Math.round(56*c);const n=1+Math.floor(lv/2);let shots=0;const seen=new Set();for(let q=0;q<n;q++){const e=nearest(p.x,p.y,170);if(!e)break;const a=Math.atan2(e.y-p.y,e.x-p.x)+(q?(q-n/2)*.25:0);bolts.push({x:p.x,y:p.y-6,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,v:(9+3*lv)*m,own:p.i,t:80,pr:lv>=4?2:1,hit:new Set()});shots++}}
  else if(k==='axe'){const n=Math.min(6,1+lv),R=28+3*lv;if(t%3)continue;for(let q=0;q<n;q++){const a=t*.06+q*Math.PI*2/n,ax=p.x+Math.cos(a)*R,ay=p.y-6+Math.sin(a)*R*.8;near(ax,ay,8,e=>{const key='a'+p.i;if((e.hc[key]|0)>t)return;e.hc[key]=t+24;dmg(e,(6+3*lv)*m,p,Math.cos(a)*1.5,Math.sin(a)*1.5)})}}
  else if(k==='water'){p.cd[k]=Math.round(160*c);const e=nearest(p.x,p.y,130);const tx=e?e.x:p.x+(Math.random()-.5)*80,ty=e?e.y:p.y+(Math.random()-.5)*60;pools.push({x:tx,y:ty,r:18+3*lv,t:110+20*lv,v:(3+lv)*m,own:p.i})}
  else if(k==='light'){p.cd[k]=Math.round(130*c);const cand=[];near(p.x,p.y,160,e=>cand.push(e));for(let q=0;q<Math.min(1+lv,cand.length);q++){const e=cand.splice(Math.floor(Math.random()*cand.length),1)[0];dmg(e,(20+8*lv)*m,p);fx.push({k:'zap',x:e.x,y:e.y,t:10})}if(cand.length||lv)if(p.i===meIdx())sfx('zap')}
  else if(k==='garlic'){if(t%18)continue;const R=22+4*lv;near(p.x,p.y-4,R,e=>{const d=Math.hypot(e.x-p.x,e.y-p.y)||1;if(d<R+e.r)dmg(e,(2+lv)*m,p,(e.x-p.x)/d*1.2,(e.y-p.y)/d*1.2)})}}}
/* ---------- host: the swarm, the gems, health and the end of the night ---------- */
function spawn(k,near){const a=Math.random()*Math.PI*2,R=200+Math.random()*40,x=clamp(near.x+Math.cos(a)*R,8,FW-8),y=clamp(near.y+Math.sin(a)*R*.8,8,FH-8),t=ENT[k],n=pl.length,lvl=[.8,1,1.25][K.cpu];
 const e={id:nextId++,k,x,y,hp:t.hp*(1+.06*(n-1))*lvl*(1+K.tick/LIM()*1.5),r:t.r,hc:{},fl:0,ph:Math.random()*6};e.mh=e.hp;en.push(e);return e}
function spawner(){const t=K.tick,min=t/3600,live=pl.filter(alive);if(!live.length)return;const n=pl.length,cap=Math.min(260,80+n*14);
 const rate=(.8+min*1.2)*(1+.3*(n-1))*[.75,1,1.25][K.cpu]/60;let k=rate;while(k>0&&en.length<cap){if(Math.random()<k){const p=live[Math.floor(Math.random()*live.length)],r=Math.random();
   const kind=min<1?(r<.6?'bat':'zomb'):min<3?(r<.35?'bat':r<.7?'zomb':'skel'):(r<.25?'bat':r<.5?'skel':r<.75?'ghost':'zomb');
   // swarms come in little packs
   const e=spawn(kind,p);if(kind==='bat')for(let q=0;q<2;q++){const b=spawn('bat',p);b.x=e.x+(Math.random()-.5)*20;b.y=e.y+(Math.random()-.5)*20}}k-=1}
 if(t>0&&t%3600===1800){const p=live[Math.floor(Math.random()*live.length)];spawn('elite',p);say(p,'A GIANT IS COMING!','#f05050')}
 if(K.mode===0&&!boss&&!won&&t===LIM()-3600){const p=live[0];boss=spawn('boss',p);for(const q of pl)say(q,'THE REAPER!','#f05050');K.fx('bs')}}
function step(){K.takeover();for(const p of pl){if(ownerNet(p)){const u=K.remote(p.i);if(u)readUp(p,u);continue}if(!p.out)move(p,K.inp(p.i))}
 if(K.tick<60){vis();return}
 spawner();gridBuild();
 const live=pl.filter(alive),t=K.tick;
 // enemies walk at the nearest hunter, keep a little apart, bite on contact
 for(const e of en){if(e.dead)continue;if(e.fl>0)e.fl--;let tg=null,bd=1e9;for(const p of live){const d=(p.x-e.x)**2+(p.y-e.y)**2;if(d<bd){bd=d;tg=p}}if(!tg)continue;
  const T=ENT[e.k],d=Math.sqrt(bd)||1;let vx=(tg.x-e.x)/d*T.sp,vy=(tg.y-6-e.y)/d*T.sp;if(e.k==='bat'){vx+=Math.sin(t*.2+e.ph)*.5;vy+=Math.cos(t*.17+e.ph)*.5}
  if(e.k!=='ghost'&&e.k!=='boss'){near(e.x,e.y,8,o=>{if(o===e||o.k==='ghost')return;const dx=e.x-o.x,dy=e.y-o.y,l=Math.hypot(dx,dy)||1;if(l<10){vx+=dx/l*.3;vy+=dy/l*.3}})}
  e.x=clamp(e.x+vx,4,FW-4);e.y=clamp(e.y+vy,4,FH-4);e.face=vx>0?1:-1;
  if(d<e.r+7&&!tg.down){tg.hp-=T.dm;tg.hurt=6}}
 for(const p of pl)weapons(p);
 for(const b of bolts){b.x+=b.vx;b.y+=b.vy;b.t--;const own=pl[b.own];near(b.x,b.y,4,e=>{if(b.t<=0||b.hit.has(e.id))return;b.hit.add(e.id);dmg(e,b.v,own,b.vx*.6,b.vy*.6);if(--b.pr<=0)b.t=0})}bolts=bolts.filter(b=>b.t>0);
 for(const q of pools){q.t--;if(q.t%12===0)near(q.x,q.y,q.r,e=>{if(Math.hypot(e.x-q.x,(e.y-q.y)*1.4)<q.r)dmg(e,q.v,pl[q.own])})}pools=pools.filter(q=>q.t>0);
 en=en.filter(e=>!e.dead);
 // gems drift to whoever is close; levels deal three cards
 for(const g of gems){let tg=null,bd=1e9;for(const p of live){const d=Math.hypot(p.x-g.x,p.y-6-g.y);if(d<magR(p)&&d<bd){bd=d;tg=p}}
  if(tg){const a=Math.atan2(tg.y-6-g.y,tg.x-g.x),s=Math.min(4,2+(magR(tg)-bd)*.1);g.x+=Math.cos(a)*s;g.y+=Math.sin(a)*s;if(bd<8){g.got=1;if(g.c==='chest'){tg.queue++;if(!tg.cards)deal(tg);say(tg,'TREASURE!','#fff07c')}else{tg.xp+=g.v;if(tg.i===meIdx()&&t%3===0)sfx('gem')}}}}
 gems=gems.filter(g=>!g.got);if(gems.length>180){const big=gems.splice(0,gems.length-150);const v=big.reduce((s,g)=>s+(g.c==='chest'?0:g.v),0);gems.push({x:big[0].x,y:big[0].y,v,c:'r'});for(const g of big)if(g.c==='chest')gems.push(g)}
 for(const p of pl){if(p.out)continue;
  while(p.xp>=p.next){p.xp-=p.next;p.lv++;p.next=nextXp(p.lv);p.queue++;if(!p.cards)deal(p)}
  if(p.cards&&t-p.cardT>60*8)resolve(p,[0,'pick',Math.floor(Math.random()*p.cards.length)]);
  if(!p.down&&p.hp<=0){p.hp=0;p.down=K.mode===1?1:60*20;p.rv=0;p.cards=null;p.queue=0;sfx('die');for(const q of pl)if(q!==p)say(q,(p.name||'').slice(0,8)+' IS DOWN!','#f05050')}
  else if(p.down){p.down--;const helper=pl.find(q=>q!==p&&alive(q)&&Math.hypot(q.x-p.x,q.y-p.y)<20);if(helper&&K.mode===0){p.rv++;if(p.rv>=120){p.down=0;p.hp=p.mhp*.5;p.rv=0;say(p,'REVIVED!','#88dc48');say(helper,'REVIVED '+(p.name||'').slice(0,8)+'!','#88dc48')}}else p.rv=Math.max(0,p.rv-2);
   if(p.down<=0&&p.rv<120){p.out=true;p.down=0}}}
 vis();checkEnd()}
function checkEnd(){const live=pl.filter(alive),downs=pl.filter(p=>p.down&&!p.out);
 if(K.mode===1){if(pl.length>1&&live.length<=1&&!downs.length||pl.length===1&&!live.length){const w=live[0]||pl.slice().sort((a,b)=>b.kills-a.kills)[0];K.end(w?{i:w.i}:null)}
  else if(K.tick>=LIM()){const w=live.slice().sort((a,b)=>b.kills-a.kills)[0];K.end(w?{i:w.i,name:(w.name||'')+' SURVIVED!'}:null)}return}
 if(!live.length&&!downs.length){K.end({coop:0,name:'THE NIGHT WON  -  '+tm(K.tick)});return}
 if(won&&K.tick-endT>120||K.tick>=LIM()){K.end({coop:1,name:won?'THE REAPER FALLS!':'DAWN!  YOU SURVIVED'})}}
const tm=t=>{const s=Math.floor(t/60);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function say(p,s,col){if(p.i!==meIdx()&&!(K.seats[p.i]&&!K.isClient()&&K.seats[p.i].ctrl!=='cpu'&&K.seats[p.i].ctrl!=='net'))return;texts.push({x:p.x,y:p.y-24,s,col,t:80,who:p.i})}
function vis(){for(const f of fx)f.t--;fx=fx.filter(f=>f.t>0);for(const t of texts){t.t--;t.y-=t.dmg?.4:.25}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.85}

/* ---------- guests: walk my hunter, take the host's word for the night ---------- */
const B64='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_',b2=v=>{v=clamp(Math.round(v),0,4095);return B64[v>>6]+B64[v&63]},u2=(s,i)=>B64.indexOf(s[i])*64+B64.indexOf(s[i+1]);
function local(i){const p=pl[i];if(p&&!p.out)move(p,K.inp(i));vis()}
function upload(i){const p=pl[i];if(!p)return null;return{x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,f:p.face,mx:Math.round(p.mx*10),my:Math.round(p.my*10),c:p.claims||[]}}
function readUp(p,u){if(typeof u.x!=='number')return;if(!p.down){p.x=u.x;p.y=u.y}else{p.x=u.x;p.y=u.y}p.face=u.f||1;p.mx=(u.mx|0)/10;p.my=(u.my|0)/10;if(Math.abs(p.mx)+Math.abs(p.my)>.1)p.walk+=.13;
 for(const e of u.c||[])if((e[0]|0)>(p.cSeen|0)){p.cSeen=e[0]|0;resolve(p,e)}}
// Small unsigned integers use five data bits per character, with bit 5 continuing.
const packN=a=>a.map(v=>{let s='';do{s+=B64[(v&31)|(v>31?32:0)];v>>>=5}while(v);return s}).join('');
function unpackN(s){const a=[];let v=0,n=0;for(const c of s){const k=B64.indexOf(c);v|=(k&31)<<n;if(k&32)n+=5;else{a.push(v);v=0;n=0}}return a}
const WK=Object.keys(WPN),PK=Object.keys(PAS),CK=[...WK,...PK];
const packW=(o,keys)=>Object.keys(o).map(k=>B64[keys.indexOf(k)*5+o[k]-1]).join('');
function unpackW(s,keys){const o={};for(const c of s){const v=B64.indexOf(c);o[keys[Math.floor(v/5)]]=v%5+1}return o}
// Bucket positions into 256px cells: each cell header is four characters, each
// position is two bytes. Every entity and its rounded position are retained.
function packPos(a){const groups=new Map();for(const [k,x,y] of a){const X=Math.round(x),Y=Math.round(y),key=k+','+(X>>8)+','+(Y>>8);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(X&255,Y&255)}
 let s='';for(const [key,xy] of groups){const [k,x,y]=key.split(',').map(Number);s+=B64[k]+B64[x*8+y]+b2(xy.length/2)+btoa(String.fromCharCode(...xy)).replace(/=+$/,'')}return s}
function unpackPos(s){const a=[];for(let i=0;i<s.length;){const k=B64.indexOf(s[i]),cell=B64.indexOf(s[i+1]),n=u2(s,i+2),len=Math.ceil(n*8/3),xy=atob(s.slice(i+4,i+4+len));for(let j=0;j<xy.length;j+=2)a.push([k,(cell>>3)*256+xy.charCodeAt(j),(cell&7)*256+xy.charCodeAt(j+1)]);i+=4+len}return a}
function snap(){return{pl:pl.map(p=>[packN([Math.round(p.x),Math.round(p.y),Math.ceil(p.hp),p.lv,p.xp,(p.down?1:0)|(p.out?2:0)|(p.hurt>0?4:0)|(p.face<0?8:0),p.kills,Math.ceil(p.down/60),p.rv]),packW(p.w,WK),packW(p.ps,PK),p.cards?p.cards.map(k=>B64[CK.indexOf(k)]).join(''):''].join('.').replace(/\.$/,'')).join('!'),
 en:packPos(en.map(e=>[Object.keys(ENT).indexOf(e.k)*2+(e.fl>0?1:0),e.x,e.y])),gm:packPos(gems.map(g=>[['b','g','r','chest'].indexOf(g.c),g.x,g.y])),
 bo:bolts.map(b=>b2(b.x)+b2(b.y)).join(''),po:pools.map(q=>b2(q.x)+b2(q.y)+B64[q.r]).join(''),fx:fx.filter(f=>f.t>6).map(f=>f.k[0]+b2(f.x)+b2(f.y)+B64[(f.d||0)+1]+b2(f.w||0)).join(''),bh:boss?Math.round(boss.hp/boss.mh*100):-1,wn:won?1:0}}
function apply(g){(g.pl?g.pl.split('!'):[]).forEach((s,i)=>{const p=pl[i];if(!p)return;const f=s.split('.'),a=unpackN(f[0]);p.hp=a[2];p.lv=a[3];p.xp=a[4];p.next=p.lv===1?6:nextXp(p.lv);p.down=a[5]&1?Math.max(1,a[7]*60):0;p.out=!!(a[5]&2);p.hurt=a[5]&4?6:0;p.kills=a[6];
  p.w=unpackW(f[1],WK);p.ps=unpackW(f[2],PK);p.mhp=100+25*(p.ps.heart||0);const cards=f[3]?[...f[3]].map(c=>CK[B64.indexOf(c)]):null;if(i===K.myIdx){if(!p.picked||K.tick-p.picked>20||!cards)p.cards=cards}else p.cards=cards;p.rv=a[8];
  if(i===K.myIdx){if(Math.hypot(p.x-a[0],p.y-a[1])>60){p.x=a[0];p.y=a[1]}return}p.tx=a[0];p.ty=a[1];p.face=a[5]&8?-1:1;if(p.gx==null){p.x=a[0];p.y=a[1];p.gx=1}});
 en=unpackPos(g.en||'').map(([v,x,y])=>{const k=Object.keys(ENT)[v>>1];return{k,x,y,r:ENT[k].r,fl:v&1?6:0,face:1,ph:(x*7+y)%6}});
 gems=unpackPos(g.gm||'').map(([v,x,y])=>({c:['b','g','r','chest'][v],x,y}));
 const bs=String(g.bo||'');bolts=[];for(let i=0;i+4<=bs.length;i+=4)bolts.push({x:u2(bs,i),y:u2(bs,i+2)});
 const ps=String(g.po||'');pools=[];for(let i=0;i+5<=ps.length;i+=5)pools.push({x:u2(ps,i),y:u2(ps,i+2),r:B64.indexOf(ps[i+4])});
 const fs=String(g.fx||'');for(let i=0;i+8<=fs.length;i+=8){const k={s:'slash',z:'zap',p:'puff'}[fs[i]],x=u2(fs,i+1),y=u2(fs,i+3);if(k&&!fx.some(o=>o.k===k&&o.x===x&&o.y===y))fx.push({k,x,y,d:B64.indexOf(fs[i+5])-1,w:u2(fs,i+6),t:10})}
 boss=g.bh>=0?{hp:g.bh,mh:100}:null;won=!!g.wn}
function follow(){for(const p of pl){if(p.i===K.myIdx||p.tx==null)continue;const dx=p.tx-p.x,dy=p.ty-p.y;if(Math.abs(dx)+Math.abs(dy)>.3)p.walk+=.13;p.x+=dx*.35;p.y+=dy*.35}vis()}
function onFx(k){if(k==='bs')sfx('boom',30)}

/* ---------- CPU hunters: kite the swarm, sweep up gems, revive friends ---------- */
function bot(i){const p=pl[i];if(!p||p.out)return{};const o={};let fx=0,fy=0;
 near(p.x,p.y,90,e=>{const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,w=(e.k==='boss'||e.k==='elite'?4:1)*500/(d*d);fx+=dx/d*w;fy+=dy/d*w});
 const lvl=K.cpu;let g=null,bd=160;for(const q of gems){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;g=q}}if(g){fx+=(g.x-p.x)/bd*(.6+lvl*.2);fy+=(g.y-p.y)/bd*(.6+lvl*.2)}
 if(K.mode===0)for(const q of pl)if(q!==p&&q.down&&!q.out){const d=Math.hypot(q.x-p.x,q.y-p.y)||1;if(d<500){fx+=(q.x-p.x)/d*2;fy+=(q.y-p.y)/d*2}}
 const others=pl.filter(q=>q!==p&&alive(q));if(others.length){const cx=others.reduce((s,q)=>s+q.x,0)/others.length,cy=others.reduce((s,q)=>s+q.y,0)/others.length;fx+=(cx-p.x)*.0015;fy+=(cy-p.y)*.0015}
 if(p.x<80)fx+=1;if(p.x>FW-80)fx-=1;if(p.y<80)fy+=1;if(p.y>FH-80)fy-=1;
 // keep moving round the swarm instead of backing into a corner
 const t=K.tick*.01+i;fx+=Math.cos(t)*.25;fy+=Math.sin(t)*.25;
 const l=Math.hypot(fx,fy);if(l>.05){o.ax=fx/l;o.ay=fy/l;if(o.ax>.38)o.right=true;if(o.ax<-.38)o.left=true;if(o.ay>.38)o.down=true;if(o.ay<-.38)o.up=true}
 if(p.cards&&(K.tick>>1)&1){let k=0,best=-1;p.cards.forEach((c,j)=>{const sc=(WPN[c]?(p.w[c]?3:2):(c==='heart'&&p.hp<p.mhp*.5?4:1))+Math.random();if(sc>best){best=sc;k=j}});o[['fire','alt','b3'][k]]=true}
 return o}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const heroImg=(k,col,flip)=>img('h'+k+col+flip,()=>{const c=X.recolor(ART.hero[k],col,{n:'#5a3a20'},'hero'+k);return flip?X.flipX(c):c});
const sprImg=(k,f,flip)=>img('e'+k+f+flip,()=>{const rows=k==='elite'?ART.zomb[f]:k==='boss'?ART.boss[0]:ART[k][f],c=X.sprite(rows,{l:'#6cc058',v:'#6838a8',b:'#2058c0',m:'#462818'});return flip?X.flipX(c):c});
const whiteOf=c=>img(c,()=>{const o=X.mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffffff';g.fillRect(0,0,o.width,o.height);return o});
const gemImg=c=>img('g'+c,()=>c==='chest'?X.sprite(ART.chest):X.sprite(ART.gem[c]));
const iconImg=k=>img('i'+k,()=>X.sprite(ART.icon[k]));
const axeImg=a=>img('ax'+Math.round(a/(Math.PI/8)),()=>X.rot(X.sprite(ART.axe),Math.round(a/(Math.PI/8))*(Math.PI/8)));
function groundImg(){return img('ground',()=>{const S=128,c=X.mk(S,S),g=c.getContext('2d');for(let y=0;y<S;y++)for(let x=0;x<S;x++){const h=hash(x,y);g.fillStyle=h<.08?'#1e4a2a':h>.95?'#3a7a40':X.dither(x,y,.35)?'#2a5c32':'#24542e';g.fillRect(x,y,1,1)}return c})}
const decImg=k=>img('d'+k,()=>X.sprite(ART.decor[k],{G:'#7c7890',g:'#5c566c',L:'#3a7a40'}));
const cams=[];let SCR=null;
function view(g,p,vx,vy,vw,vh,ci,small){let cam=cams[ci];if(!cam||cam.i!==p.i)cam=cams[ci]={i:p.i,x:p.x,y:p.y,tk:K.tick};let nn=0;while(cam.tk<K.tick&&nn++<30){cam.tk++;cam.x+=(p.x-cam.x)*.25;cam.y+=(p.y-cam.y)*.25}cam.tk=K.tick;
 const cx=Math.round(clamp(cam.x-vw/2,-40,FW+40-vw)),cy=Math.round(clamp(cam.y-vh/2,-40,FH+40-vh));
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();g.translate(vx-cx,vy-cy);
 const gi=groundImg();for(let y=Math.floor(cy/128)*128;y<cy+vh;y+=128)for(let x=Math.floor(cx/128)*128;x<cx+vw;x+=128)g.drawImage(gi,x,y);
 for(let gy=Math.floor(cy/40);gy<=Math.floor((cy+vh)/40);gy++)for(let gx=Math.floor(cx/40);gx<=Math.floor((cx+vw)/40);gx++){const h=hash(gx+999,gy);if(h<.2){const k=h<.08?'tuft':h<.14?'flower':h<.17?'rock':'grave';const d=decImg(k);g.drawImage(d,gx*40+Math.floor(hash(gx,gy+7)*30),gy*40+Math.floor(hash(gx+3,gy)*30))}}
 // the edge of the field: a dark wood
 g.fillStyle='#100c18';if(cx<0)g.fillRect(cx,cy,-cx,vh);if(cy<0)g.fillRect(cx,cy,vw,-cy);if(cx+vw>FW)g.fillRect(FW,cy,cx+vw-FW,vh);if(cy+vh>FH)g.fillRect(cx,FH,vw,cy+vh-FH);
 g.fillStyle='#2c2638';for(let x=Math.max(0,cx-cx%24);x<Math.min(FW,cx+vw);x+=24){g.fillRect(x,0,2,6);g.fillRect(x,FH-6,2,6)}for(let y=Math.max(0,cy-cy%24);y<Math.min(FH,cy+vh);y+=24){g.fillRect(0,y,6,2);g.fillRect(FW-6,y,6,2)}
 const vis=(x,y,m)=>x>cx-m&&x<cx+vw+m&&y>cy-m&&y<cy+vh+m;
 for(const q of pools){if(!vis(q.x,q.y,q.r))continue;for(let y=-q.r;y<=q.r;y+=1)for(let x=-q.r;x<=q.r;x++){const d=Math.hypot(x,y*1.6)/q.r;if(d>1)continue;if(X.dither(q.x+x+(K.tick>>2),q.y+y,d>.8?.8:.45)){g.fillStyle=d>.8?'#a0f0ff':(hash(x+(K.tick>>3),y)<.1?'#ffffff':'#3068d0');g.fillRect(q.x+x,q.y+y,1,1)}}}
 for(const gm of gems)if(vis(gm.x,gm.y,8)){const im=gemImg(gm.c);g.drawImage(im,Math.round(gm.x-im.width/2),Math.round(gm.y-im.height/2+((K.tick>>4)&1)))}
 // everyone standing, back to front
 const L=[];for(const q of pl)if(!q.out&&vis(q.x,q.y,24))L.push([q.y,0,q]);for(const e of en)if(vis(e.x,e.y,20))L.push([e.y,1,e]);L.sort((a,b)=>a[0]-b[0]);
 for(const[,ty,o]of L){if(ty===0){const flip=o.face<0?1:0;
   if(o.down){g.globalAlpha=.6+.2*Math.sin(K.tick*.1);const im=heroImg('ghost',o.col,flip);g.drawImage(im,Math.round(o.x-7),Math.round(o.y-im.height-2+Math.sin(K.tick*.08)*2));g.globalAlpha=1;
    const pr=o.rv/120;g.fillStyle=P.k;g.fillRect(Math.round(o.x-9),Math.round(o.y-24),18,4);g.fillStyle='#88dc48';g.fillRect(Math.round(o.x-8),Math.round(o.y-23),Math.round(16*pr),2);X.text(g,Math.ceil(o.down/60)+'',o.x,o.y-34,{col:'#f05050',align:'center',outline:P.k});continue}
   g.globalAlpha=.35;g.fillStyle=P.k;g.fillRect(Math.round(o.x-5),Math.round(o.y-1),10,2);g.globalAlpha=1;
   const im=heroImg(Math.floor(o.walk)%2?'w2':'w1',o.col,flip);g.drawImage(o.hurt>0&&(K.tick>>1)&1?whiteOf(im):im,Math.round(o.x-im.width/2),Math.round(o.y-im.height));
   const hp=o.hp/o.mhp;g.fillStyle=P.k;g.fillRect(Math.round(o.x-7),Math.round(o.y+1),14,3);g.fillStyle=hp>.5?'#88dc48':hp>.25?'#fff07c':'#f05050';g.fillRect(Math.round(o.x-6),Math.round(o.y+2),Math.max(0,Math.round(12*hp)),1);
   if(o.w.garlic){const R=22+4*o.w.garlic;for(let a=0;a<64;a++){if((a+(K.tick>>2))%4)continue;const t=a/64*Math.PI*2;g.fillStyle='#e8e4dc';g.fillRect(Math.round(o.x+Math.cos(t)*R),Math.round(o.y-4+Math.sin(t)*R*.8),1,1)}}
   if(o.w.axe){const n=Math.min(6,1+o.w.axe),R=28+3*o.w.axe;for(let q=0;q<n;q++){const a=K.tick*.06+q*Math.PI*2/n,ai=axeImg(K.tick*.3+q);g.drawImage(ai,Math.round(o.x+Math.cos(a)*R-ai.width/2),Math.round(o.y-6+Math.sin(a)*R*.8-ai.height/2))}}
   const hum=K.seats[o.i]&&K.seats[o.i].ctrl!=='cpu';if(hum&&o!==p&&!small)X.text(g,(o.name||'').slice(0,6),o.x,o.y-26,{col:o.col,align:'center',outline:P.k})}
  else{const f=((K.tick>>3)+((o.ph*3)|0))&1,flip=(o.face||1)<0?1:0,im=sprImg(o.k,o.k==='boss'?0:f,flip),sc=o.k==='elite'?1.6:1,w=Math.round(im.width*sc),h=Math.round(im.height*sc),bob=o.k==='bat'||o.k==='ghost'?Math.round(Math.sin(K.tick*.15+o.ph)*2)-6:0;
   g.globalAlpha=o.k==='ghost'?.75:1;g.drawImage(o.fl>0&&(K.tick&1)?whiteOf(im):im,Math.round(o.x-w/2),Math.round(o.y-h+bob),w,h);g.globalAlpha=1}}
 for(const b of bolts)if(vis(b.x,b.y,6)){g.fillStyle='#30c8e0';g.fillRect(Math.round(b.x)-2,Math.round(b.y)-2,4,4);g.fillStyle='#ffffff';g.fillRect(Math.round(b.x)-1,Math.round(b.y)-1,2,2)}
 for(const f of fx){if(!vis(f.x,f.y,60))continue;if(f.k==='slash'){const w=f.w,k=1-f.t/10;for(let q=0;q<w;q++){const x=f.x+f.d*(4+q),y=f.y-6+Math.round(Math.sin(q/w*Math.PI)*-6+k*6);g.fillStyle=q%3?'#ffffff':'#a0f0ff';g.fillRect(Math.round(x),y,1,2)}}
  else if(f.k==='zap'){let x=f.x,y=f.y-70;g.fillStyle='#fff07c';while(y<f.y){const nx=x+(hash(Math.round(y),f.t)*6-3);g.fillRect(Math.round(nx),Math.round(y),2,4);x=nx;y+=4}g.fillStyle='#ffffff';g.fillRect(Math.round(f.x)-3,Math.round(f.y)-2,6,3)}
  else{const r=14-f.t;for(let a=0;a<8;a++){g.fillStyle=f.t>7?'#e8e4dc':'#9a94a8';g.fillRect(Math.round(f.x+Math.cos(a*.8)*r),Math.round(f.y-4+Math.sin(a*.8)*r*.7),1,1)}}}
 for(const t of texts)if(vis(t.x,t.y,20)&&(t.dmg?p.i===meIdx():t.who===p.i))X.text(g,t.s,t.x,t.y,{col:t.col,align:'center',outline:P.k});
 g.restore();hud(g,p,vx,vy,vw,vh,small,cx,cy)}
const KEYN=['SPACE','E','Q'],PADN=['A','B','X'];
function hud(g,p,vx,vy,vw,vh,small,cx,cy){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{}));
 if(K.demo){TX('NIGHT SURVIVORS',vx+vw/2,vy+vh-16,{col:'#b080f0',align:'center',scale:2});return}
 // XP bar, level, clock, kills
 const top=vy+(vy<4?12:2);g.fillStyle=P.k;g.fillRect(vx+2,top,vw-4,5);g.fillStyle='#142870';g.fillRect(vx+3,top+1,vw-6,3);g.fillStyle='#60a0ff';g.fillRect(vx+3,top+1,Math.round((vw-6)*Math.min(1,p.xp/p.next)),3);
 TX('LV '+p.lv,vx+4,top+7,{col:'#ffffff'});const left=K.mode===0?Math.max(0,LIM()-K.tick):K.tick;TX(tm(left),vx+vw/2,top+7,{col:K.mode===0&&left<3600?'#fff07c':'#ffffff',align:'center',scale:small?1:2});
 TX(p.kills+' KILLS',vx+vw-4,top+7,{col:'#e8e4dc',align:'right'});
 // weapons and passives you have
 let ix=vx+4;for(const k in p.w){g.drawImage(iconImg(k),ix,top+17);X.text(g,p.w[k]+'',ix+9,top+24,{col:'#fff07c',shadow:P.k});ix+=14}for(const k in p.ps){g.drawImage(iconImg(k),ix,top+17);X.text(g,p.ps[k]+'',ix+9,top+24,{col:'#a0f0ff',shadow:P.k});ix+=14}
 // friends who are down, off screen: an arrow pointing at them
 for(const q of pl){if(q===p||!q.down||q.out)continue;const sx=q.x-cx,sy=q.y-cy;if(sx>0&&sx<vw&&sy>0&&sy<vh)continue;const ex=clamp(sx,8,vw-8),ey=clamp(sy,40,vh-8);g.fillStyle=P.k;g.fillRect(vx+ex-4,vy+ey-4,9,9);g.fillStyle=(K.tick>>3)&1?'#f05050':q.col;g.fillRect(vx+ex-3,vy+ey-3,7,7);TX('!',vx+ex,vy+ey-3,{col:'#ffffff',align:'center',shadow:false})}
 if(boss){const bw=Math.min(200,vw-40),bx=vx+vw/2-bw/2,by=vy+vh-12;g.fillStyle=P.k;g.fillRect(bx-1,by-1,bw+2,6);g.fillStyle='#6c1424';g.fillRect(bx,by,bw,4);g.fillStyle='#f05050';g.fillRect(bx,by,Math.round(bw*boss.hp/boss.mh),4);TX('THE REAPER',vx+vw/2,by-9,{col:'#f05050',align:'center'})}
 if(p.down)TX(K.mode===0?'YOU\'RE DOWN - A FRIEND CAN REVIVE YOU':'OUT!',vx+vw/2,vy+vh*.6,{col:'#f05050',align:'center'});
 if(p.out&&K.mode===0)TX('OUT - WATCH THEM SURVIVE',vx+vw/2,vy+vh*.6,{col:'#f05050',align:'center'});
 const t=K.tick,pad=K.seats[p.i]&&/^gp|touch/.test(K.seats[p.i].ctrl);
 if(t<60*6&&!p.cards)TX(pad?'MOVE - YOUR WEAPONS FIRE BY THEMSELVES':'WASD TO WALK - WEAPONS FIRE BY THEMSELVES',vx+vw/2,vy+vh-24,{col:'#ffffff',align:'center'});
 else if(t<60*12&&K.mode===0&&pl.length>1&&!p.cards)TX('STAND BY A FALLEN FRIEND TO REVIVE THEM',vx+vw/2,vy+vh-24,{col:'#88dc48',align:'center'});
 // the level-up cards
 if(p.cards&&!p.down&&(p.i===meIdx()||!K.isClient()&&K.seats[p.i].ctrl!=='cpu')){const n=p.cards.length,cw=small?50:80,gap=4,x0=Math.round(vx+vw/2-(n*cw+(n-1)*gap)/2),y0=vy+(small?28:40);
  TX('LEVEL UP! PICK ONE',vx+vw/2,y0-10,{col:'#fff07c',align:'center'});
  p.cards.forEach((c,k)=>{const x=x0+k*(cw+gap),info=WPN[c]||PAS[c],lv=(WPN[c]?p.w[c]:p.ps[c])|0,h=small?40:58;g.fillStyle=P.k;g.fillRect(x,y0,cw,h);g.fillStyle=WPN[c]?'#2c2048':'#1c2c48';g.fillRect(x+1,y0+1,cw-2,h-2);
   g.drawImage(iconImg(c),x+3,y0+3);TX(lv?'LV '+(lv+1):'NEW!',x+cw-3,y0+4,{col:lv?'#a0f0ff':'#88dc48',align:'right',shadow:false});TX(info.n.slice(0,small?8:13),x+3,y0+16,{col:'#ffffff',shadow:false});
   if(!small){const words=info.d.split(' ');let line='',ly=y0+27;for(const w of words){if(X.tw(line+' '+w)>cw-6){TX(line,x+3,ly,{col:'#9a94a8',shadow:false});ly+=8;line=w}else line=line?line+' '+w:w}TX(line,x+3,ly,{col:'#9a94a8',shadow:false})}
   TX((pad?PADN:KEYN)[k],x+cw/2,y0+h-9,{col:'#fff07c',align:'center',shadow:false})})}}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!pl.length){SCR.present(ctx,W,H);return}
 let fs=K.demo?[]:K.focus();if(!fs.length){const a=pl.filter(alive);fs=[(a[Math.floor(K.tick/600)%Math.max(1,a.length)]||pl[0]).i]}
 fs=fs.slice(0,4);const n=fs.length,w=SCR.w,h=SCR.h-(K.demo?0:9);
 const rects=n<=1?[[0,0,w,h]]:n===2?[[0,0,w>>1,h],[w>>1,0,w-(w>>1),h]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];
 fs.forEach((i,k)=>{const r=rects[k];view(g,pl[i],r[0],r[1],r[2],r[3],k,n>1)});if(n>1){g.fillStyle=P.k;g.fillRect((w>>1)-1,0,2,h);if(n>2)g.fillRect(0,(h>>1)-1,w,2)}SCR.present(ctx,W,H)}
K=RA.kit({id:'surv',name:'NIGHT SURVIVORS',kind:'Horde survival',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Horde survival for up to 20: you only walk, your weapons fire by themselves. Gather gems, pick upgrades, revive fallen friends and survive the night together - or be the last hunter standing.',
 blurb:'WASD to walk - your weapons fire on their own. Grab gems to level up and pick a card with Space / E / Q. Stand next to a fallen friend to revive them.',
 howto:'WASD (or the stick) walks. Weapons attack by themselves. On a level up, Space / E / Q (gamepad A / B / X) picks the first / second / third card, or one is picked for you. Stand by a downed friend for 2 seconds to revive them.',
 icon:['...kkkk...','..krrrrk..','.krrrrrrk.','.krsssrrk.','.krskskrk.','..krrrrk..','.krrrrrrk.','krrrrrrrrk','.krrkkrrk.','..kk..kk..'],
 music:MUSIC,fireLabel:'PICK',
 modes:[['CO-OP','Survive the night together; revive your friends.'],['LAST STANDING','No revives: the last hunter alive wins.']],
 settings:[['len','Night length',[[6,'6 min'],[3,'3 min'],[10,'10 min'],[15,'15 min']]]],
 kb:[['WASD','walk'],['SPACE E Q','pick card 1 2 3'],['C','chat'],['ESC','menu']],pad:[['LS','walk'],['A B X','pick card'],['START','menu']],
 ach:[{id:'first',name:'First Night',desc:'Play your first night',test:s=>s.played>=1,unlock:'title:Hunter'},{id:'win1',name:'Dawn',desc:'Survive a night or be the last one standing',test:(s,m)=>m.won,unlock:'title:Survivor'},
  {id:'k500',name:'Slayer',desc:'500 kills in one night',test:(s,m)=>m.kills>=500,unlock:'title:Slayer'}],
 alive:i=>!!pl[i]&&!pl[i].out,out:i=>!!pl[i]&&pl[i].out,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>K.mode===0?'Co-op':'Last standing',
 ranks:()=>pl.slice().sort((a,b)=>(a.out-b.out)||b.kills-a.kills).map(p=>[p.name,p.col,p.kills+' kills · level '+p.lv+(p.out?' · out':'')]),
 result:(i,w)=>{const p=pl[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.i===i),kills:p.kills|0}}});
window.__ns={get pl(){return pl},get en(){return en},K,bot:i=>bot(i)};

})();
