/* ICE PEAK for Retro Arena: a race up a frozen mountain for up to 20, in the spirit of Ice Climber.
   Every floor of the mountain is a row of ice blocks: jump into them from below to smash a hole with your hammer, jump
   through it and land on the ledge above. Rock blocks don't break. Swing your hammer (E / right-click) to knock rivals off
   their ledge, grab vegetables for power-ups, dodge the birds and falling icicles, and stay ahead of the avalanche that
   rises from the valley. The first climber to grab the condor circling the summit wins.
   A / D walk, Space / W / click jumps (you can steer in the air), E or right-click swings the hammer, Q throws a snowball.
   Modes: RACE · TEAM RACE (red vs blue, points by finishing place) · CO-OP CLIMB (everyone up before the avalanche, shared lives).
   Power-ups (vegetables; the lower you are, the better they get):
    SPIKE BOOTS (no slipping, higher jumps) · BIG HAMMER (longer reach, harder knocks) · BALLOON (float up through two floors)
    SNOWBALLS x3 · PARKA (shrugs off one knock) · party: BLIZZARD (whiteout and wind for everyone else) ·
    QUAKE (everyone else on the ground falls over) · ICICLE RAIN (icicles drop on the climbers ahead of you).
   Lag-free online (RA.kit localFirst): your climber, your jumps and the blocks you smash happen on your device at once;
   the host keeps the mountain (blocks re-freeze after a while), birds, icicles, items, the avalanche and the finish order,
   and sends knocks to the climber they hit, who checks their own parka. Local players get split-screen columns. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx,{mix}=RA.util;
const CW=16,NC=20,WW=CW*NC,FH=48,BH=12,CHW=4,CHH=18,TEAMC=['#f04848','#4890f8'],TEAMN=['Red team','Blue team'];
const ITEMS=[null,{n:'SPIKE BOOTS',c:'#c0c8d8'},{n:'BIG HAMMER',c:'#e0a040'},{n:'BALLOON',c:'#ff60a0'},{n:'SNOWBALLS',c:'#f0f8ff'},{n:'PARKA',c:'#60c0ff'},
 {n:'BLIZZARD',c:'#d0e8ff',party:1},{n:'QUAKE',c:'#c08040',party:1},{n:'ICICLE RAIN',c:'#a0e0ff',party:1}];
const VEG=['#a050c0','#f08020','#40c040','#f04040','#e0e040','#ffffff','#e080ff','#80ff80','#40a0ff'];
RA.audio.add('smash',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=2400;g.gain.setValueAtTime(.16,now);g.gain.exponentialRampToValueAtTime(.001,now+.14);s.connect(f);f.connect(g);s.start(now);s.stop(now+.15)});
RA.audio.add('jump',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(300,now);o.frequency.exponentialRampToValueAtTime(700,now+.1);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);o.connect(g);o.start(now);o.stop(now+.13)});
const MUSIC=[T('Base Camp',96,['Am','F','C','G'],'k.......s.......','a5 - - e5 - - c6 - b5 - a5 - g5 - e5 - f5 - - c5 - - a5 - g5 - f5 - e5 - - -'),
 T('Ice Climber',150,['C','F','G','C'],'k.hsk.hsk.hsk.hs','c5 e5 g5 c6 g5 e5 c5 e5 f5 a5 c6 f6 c6 a5 f5 a5 g5 b5 d6 g6 d6 b5 g5 b5 c6 g5 e5 c5 g4 c5 e5 g5'),
 T('North Face',138,['Dm','C','Bb','A'],'k..hs.h.k.khs.h.','d5 f5 a5 d6 . a5 f5 . c5 e5 g5 c6 . g5 e5 . bb4 d5 f5 bb5 . f5 d5 . a4 c#5 e5 a5 - - - -'),
 T('Avalanche',176,['Em','C','D','B'],'kshskshskshskshs','e5 g5 b5 e6 b5 g5 e5 b4 c5 e5 g5 c6 g5 e5 c5 g4 d5 f#5 a5 d6 a5 f#5 d5 a4 b4 d#5 f#5 b5 f#5 d#5 b4 f#4')];
let K,cl=[],grid=null,NF=25,items=[],balls=[],birds=[],icis=[],parts=[],texts=[],av=-120,avSp=0,finN=0,firstFin=0,lastHF=0,condor={x:WW/2,y:0,d:1},nextId=1,champ=-1,flakes=[];
const L={broken:new Map()};   // guest: blocks I smashed that the host may not know about yet (cell -> tick)
const teamOf=i=>K.mode===1?i%2:K.mode===2?0:i,sameTeam=(a,b)=>a!==b&&teamOf(a)===teamOf(b);
const ownerNet=c=>K.seats[c.i]&&K.seats[c.i].ctrl==='net';
const mineC=c=>K.isClient()?c.i===K.myIdx:!ownerNet(c);

/* ---------- the mountain: floors of ice (1) and rock (2) blocks ---------- */
function build(seed){const rr=RA.util.mulberry(seed),g=new Uint8Array((NF+2)*NC);
 for(let c=0;c<NC;c++)g[c]=2;                       // the valley floor
 for(let f=1;f<=NF;f++){const row=f*NC;for(let c=0;c<NC;c++)g[row+c]=1;
  const holes=1+Math.floor(rr()*2);for(let h=0;h<holes;h++){const w=1+Math.floor(rr()*2),s=Math.floor(rr()*(NC-w));for(let c=s;c<s+w;c++)g[row+c]=0}
  const rocks=f>3?Math.floor(rr()*3):0;for(let r=0;r<rocks;r++){const w=2+Math.floor(rr()*4),s=Math.floor(rr()*(NC-w));for(let c=s;c<s+w;c++)if(g[row+c])g[row+c]=2}
  if(!g.slice(row,row+NC).some(v=>v!==2))g[row+Math.floor(rr()*NC)]=1}
 for(let c=0;c<NC;c++)g[(NF+1)*NC+c]=0;
 return g}
const cellAt=(f,c)=>f<0||f>NF||c<0||c>=NC?2:grid[f*NC+c];
function solidAt(f,c){const v=cellAt(f,c);if(v!==1)return v;if(K.isClient()&&L.broken.has(f*NC+c))return 0;return 1}
// the block a point is inside of (blocks of floor f fill y in (f*FH-BH, f*FH])
function hitCell(x,y){if(x<0||x>=WW)return 2;const f=Math.round(y/FH),top=f*FH;if(y>top||y<=top-BH)return 0;return solidAt(f,Math.floor(x/CW))?[f,Math.floor(x/CW)]:0}
const solidPt=(x,y)=>x<0||x>=WW?true:!!hitCell(x,y);

/* ---------- setup ---------- */
function start(seats,md,S,seed){NF=+S.height||25;grid=build(seed);items=[];balls=[];birds=[];icis=[];parts=[];texts=[];finN=0;firstFin=0;lastHF=0;champ=-1;nextId=1;L.broken.clear();
 avSp=(md===2?Math.max(1,+S.av||1):+S.av||0)*.045;av=-140;condor={x:WW/2,y:NF*FH+44,d:1};
 cl=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,x:12+((i*37)%(WW-24)),y:0,vx:0,vy:0,face:i%2?-1:1,gr:true,anim:0,swing:0,stun:0,fx:{},snow:0,
  lives:+S.lives||3,out:false,fin:0,ft:0,best:0,place:i+1,ev:[],evSeq:0,evSeen:0,claims:[],cseq:0,cSeen:0,knocks:0,smashes:0,auto:/^gp|touch/.test(s.ctrl)}));
 flakes=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),s:.3+Math.random()*.7}));cams.length=0}

/* ---------- your own climber (runs on its owner's device) ---------- */
function move(c,inp){const f=c.fx;for(const k in f)if(f[k]>0&&k!=='parka')f[k]--;if(c.swing>0)c.swing--;
 if(c.out||c.fin){c.vx*=.9;return}
 if(K.tick<120)return;
 if(c.stun>0){c.stun--;inp={}}
 let dir=(inp.right?1:0)-(inp.left?1:0);if(inp.ax&&Math.abs(inp.ax)>.25)dir=inp.ax;
 const ground=c.gr,ice=ground&&!(f.boots>0),wind=f.wind>0?(Math.sin(K.tick*.02+c.i)>0?.12:-.12):0;
 if(f.bal>0){c.vy=1.7;c.vx+=(dir*1.2-c.vx)*.1;c.x+=c.vx;c.y+=c.vy;c.x=Math.max(CHW,Math.min(WW-CHW,c.x));c.gr=false;c.anim+=.2;return}
 if(ground){c.vx+=(dir*1.5-c.vx)*(dir?(ice?.08:.3):(ice?.025:.3))}else c.vx+=(dir*1.5-c.vx)*.07;
 c.vx+=wind;if(dir)c.face=dir>0?1:-1;
 const jump=inp.up||inp.fire;if(jump&&!c.jh&&ground&&c.stun<=0){c.vy=f.boots>0?5.7:5.05;c.gr=false;sfx('jump')}c.jh=jump;
 if(inp.alt&&c.swing<=0&&c.stun<=0){c.swing=18;sfx('shot')}
 if(inp.b3&&!c.qh&&c.snow>0&&c.stun<=0){c.snow--;throwBall(c)}c.qh=inp.b3;
 c.vy=Math.max(-5.5,c.vy-.21);
 // horizontal move with the walls and block sides
 const nx=c.x+c.vx;if(nx<CHW||nx>WW-CHW){c.x=nx<CHW?CHW:WW-CHW;c.vx=0}
 else if(solidPt(nx+Math.sign(c.vx)*CHW,c.y+3)||solidPt(nx+Math.sign(c.vx)*CHW,c.y+CHH-2))c.vx=0;else c.x=nx;
 // vertical: head smashes ice, feet land on tops
 const ny=c.y+c.vy;c.gr=false;
 if(c.vy>0){const hc=hitCell(c.x-CHW+1,ny+CHH)||hitCell(c.x+CHW-1,ny+CHH)||hitCell(c.x,ny+CHH);
  if(hc){if(hc!==2){const[fl,col]=hc;if(cellAt(fl,col)===1)smash(c,fl,col)}c.vy=-.6;c.y=Math.round((ny+CHH)/FH)*FH-BH-CHH-.01}else c.y=ny}
 else{const top=Math.floor(c.y/FH+1e-6)*FH;if(ny<=top&&c.y>=top-.01&&(solidPt(c.x-CHW+1,top)||solidPt(c.x+CHW-1,top))){c.y=top;c.vy=0;c.gr=true}else c.y=ny}
 if(c.y<0){c.y=0;c.vy=0;c.gr=true}
 c.anim=c.gr&&Math.abs(c.vx)>.2?c.anim+Math.abs(c.vx)*.12:0;c.best=Math.max(c.best,Math.floor(c.y/FH));
 // hammer: knock the rivals in front of you
 if(c.swing>6&&c.swing<14)for(const o of cl){if(o===c||o.out||o.fin||sameTeam(c.i,o.i)||(c.hitT&&c.hitT[o.i]>K.tick))continue;
  const reach=f.big>0?20:13;if((o.x-c.x)*c.face>-2&&Math.abs(o.x-c.x)<reach&&Math.abs(o.y-c.y)<14){(c.hitT=c.hitT||{})[o.i]=K.tick+30;c.knocks++;claim(c,'k',o.i,c.face*(f.big>0?2:1))}}
 // vegetables, icicles and birds are checked by the climber they touch
 for(const it of items)if(!it.got&&Math.abs(it.x-c.x)<10&&Math.abs(it.y+6-(c.y+9))<14){it.got=1;claim(c,'i',it.id,0);sfx('pick')}
 for(const ic of icis)if(ic.fall&&!ic.hit&&Math.abs(ic.x-c.x)<6&&ic.y<c.y+CHH&&ic.y>c.y){ic.hit=1;claim(c,'x',ic.id,0);hurt(c,0,'ice')}
 for(const b of birds)if(Math.abs(b.x-c.x)<9&&Math.abs(b.y-(c.y+9))<10&&!(c.bh>K.tick)){c.bh=K.tick+60;hurt(c,b.vx>0?1:-1,'bird')}
 if(!c.fin&&c.y>NF*FH&&Math.abs(condor.x-c.x)<16&&Math.abs(condor.y-(c.y+9))<16)claim(c,'c',0,0)}
function smash(c,f,col){c.smashes++;sfx('smash');for(let k=0;k<8;k++)parts.push({x:col*CW+8,y:f*FH-6,vx:(Math.random()-.5)*3,vy:Math.random()*2.5,t:40,col:k%2?'#c8f0ff':'#ffffff',g:1});
 if(K.isClient()){L.broken.set(f*NC+col,K.tick);claim(c,'b',f*NC+col,0)}else breakBlock(f*NC+col)}
function hurt(c,dir,why){const f=c.fx;if(f.parka>0){f.parka=0;sfx('pick');say(c,'PARKA!','#80d0ff');return}
 c.stun=why==='quake'?50:38;c.vx=dir*3;c.vy=why==='quake'?1:2.2;c.gr=false;sfx('boom')}
function throwBall(c){if(K.isClient())claim(c,'s',c.face,0);else balls.push({id:nextId++,x:c.x+c.face*6,y:c.y+12,vx:c.face*3.6,vy:1.4,own:c.i,t:120})}
function claim(c,k,a,b){if(!K.isClient()){resolve(c,[0,k,a,b]);return}c.cseq++;c.claims.push([c.cseq,k,a,b]);if(c.claims.length>10)c.claims.shift()}

/* ---------- host: the mountain, the hazards, the finish ---------- */
const broken=[];   // host: [cell, tick] to re-freeze later
function breakBlock(cell){if(grid[cell]!==1)return;grid[cell]=0;broken.push([cell,K.tick])}
function resolve(c,[,k,a,b]){
 if(k==='b')breakBlock(a);
 else if(k==='k'){const o=cl[a];if(o&&!o.out&&!o.fin)send(o,'k',b,c.i)}
 else if(k==='i'){const it=items.find(x=>x.id===a);if(it&&!it.dead){it.dead=1;powerUp(c)}}
 else if(k==='x'){const ic=icis.find(x=>x.id===a);if(ic)ic.dead=1}
 else if(k==='s')balls.push({id:nextId++,x:c.x+a*6,y:c.y+12,vx:a*3.6,vy:1.4,own:c.i,t:120});
 else if(k==='c'&&!c.fin&&c.y>NF*FH-4){c.fin=++finN;c.ft=K.tick-120;if(finN===1)firstFin=K.tick;if(K.seats[c.i].ctrl!=='cpu')lastHF=K.tick;sfx('roar');say(c,ord(c.fin)+' TO THE TOP!','#f8d040');K.fx('f',c.i)}}
function send(o,kind,v,by){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind,v|0,by==null?-1:by]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind,v,by)}
function onEv(c,kind,v,by){if(kind==='k')hurt(c,v,'hammer');else if(kind==='q'){if(c.gr)hurt(c,0,'quake')}else if(kind==='w')c.fx.wind=300;else if(kind==='it')self(c,v)}
function self(c,k){const f=c.fx;if(k===1)f.boots=900;else if(k===2)f.big=700;else if(k===3)f.bal=110;else if(k===4)c.snow+=3;else if(k===5)f.parka=1}
function powerUp(c){const n=cl.length,f=n>1?(c.place-1)/(n-1):.5,S=K.S;let bag=f<.2?[1,2,4,5]:f<.6?[1,2,3,4,5]:[3,3,1,2,4];if(S.items==='party'&&f>.25)bag.push(6,7,8,6);
 const k=bag[Math.floor(Math.random()*bag.length)],it=ITEMS[k];say(c,it.n,it.c);
 if(k<=5){if(ownerNet(c))send(c,'it',k);else self(c,k);return}
 const rv=cl.filter(o=>o!==c&&!o.out&&!o.fin&&!sameTeam(c.i,o.i));
 if(k===6)for(const o of rv)send(o,'w');else if(k===7){for(const o of rv)send(o,'q');K.fx('qk')}else for(const o of rv)if(o.y>c.y)for(let q=0;q<2;q++)icis.push({id:nextId++,x:Math.max(8,Math.min(WW-8,o.x+(q?20:-6)*(Math.random()-.3))),y:o.y+70+q*20,fall:1,vy:0})}
function readUpload(c,r){if(typeof r.x!=='number')return;c.x=r.x;c.y=r.y;c.vx=r.vx;c.face=r.f;c.fl=r.fl|0;c.anim=r.a||0;c.swing=r.s|0;c.stun=r.st|0;c.snow=r.sn|0;c.best=Math.max(c.best,Math.floor(c.y/FH));
 for(const e of r.c||[])if((e[0]|0)>c.cSeen){c.cSeen=e[0]|0;resolve(c,e)}}
function step(){const S=K.S;if(K.tick===2)K.track(1+Math.floor(Math.random()*2));
 for(const c of cl){if(ownerNet(c)){const r=K.remote(c.i);if(r)readUpload(c,r);continue}move(c,c.fin?{}:K.inp(c.i))}
 // blocks re-freeze after a while (not on top of a climber)
 for(let k=broken.length-1;k>=0;k--){const[cell,t]=broken[k];if(K.tick-t>1500){const f=Math.floor(cell/NC),col=cell%NC;
   if(!cl.some(c=>Math.abs(c.x-(col*CW+8))<14&&c.y>f*FH-BH-CHH-2&&c.y<f*FH+2)){grid[cell]=1;broken.splice(k,1)}}}
 // snowballs
 for(const b of balls){b.x+=b.vx;b.y+=b.vy;b.vy-=.12;b.t--;if(b.x<0||b.x>WW||solidPt(b.x,b.y))b.t=0;
  for(const o of cl)if(o.i!==b.own&&!o.out&&!o.fin&&!sameTeam(o.i,b.own)&&Math.abs(o.x-b.x)<7&&b.y>o.y&&b.y<o.y+CHH){b.t=0;send(o,'k',Math.sign(b.vx),b.own);burst(b.x,b.y,'#ffffff');break}}
 balls=balls.filter(b=>b.t>0);
 // nitpicker birds sweep across the floors near the climbers
 if(K.tick%200===100&&birds.length<Math.min(8,2+cl.length/3)){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&!c.fin&&c.y>FH*2){const d=Math.random()<.5?1:-1;birds.push({x:d>0?-10:WW+10,y:Math.floor(c.y/FH+1)*FH+20,vx:d*(1+Math.random()*.6),t:0})}}
 for(const b of birds){b.x+=b.vx;b.t++;b.y+=Math.sin(b.t*.08)*.6}birds=birds.filter(b=>b.x>-20&&b.x<WW+20);
 // icicles grow under blocks above climbers, then drop
 if(K.tick%90===45&&icis.length<10){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&c.y>FH*3&&!c.fin){const f=Math.floor(c.y/FH)+1,col=Math.floor(Math.random()*NC);if(cellAt(f,col)>0)icis.push({id:nextId++,x:col*CW+8,y:f*FH-BH,fall:0,t:0,vy:0})}}
 for(const ic of icis){ic.t=(ic.t||0)+1;if(!ic.fall&&ic.t>100)ic.fall=1;if(ic.fall){ic.vy-=.18;ic.y+=ic.vy;if(ic.y<av||ic.y<-20)ic.dead=1;else if(ic.vy<-1&&solidPt(ic.x,ic.y)&&ic.t>4){ic.dead=1;burst(ic.x,ic.y,'#c8f0ff')}}
  if(!ic.fall&&cellAt(Math.round((ic.y+BH)/FH),Math.floor(ic.x/CW))===0)ic.fall=1}
 icis=icis.filter(ic=>!ic.dead);
 // vegetables
 if(S.items!=='off'&&K.tick%240===120&&items.length<4+cl.length/3){const c=cl[Math.floor(Math.random()*cl.length)];if(c&&!c.fin){const f=Math.min(NF,Math.floor(c.y/FH)+1+Math.floor(Math.random()*3)),col=Math.floor(Math.random()*NC);
   if(cellAt(f,col)>0)items.push({id:nextId++,x:col*CW+8,y:f*FH,k:Math.floor(Math.random()*VEG.length),t:1800})}}
 for(const it of items)it.t--;items=items.filter(it=>!it.dead&&it.t>0);
 // the condor circles the summit
 condor.x+=condor.d*1.2;if(condor.x<20||condor.x>WW-20)condor.d*=-1;condor.y=NF*FH+40+Math.sin(K.tick*.04)*10;
 // the avalanche rises; whoever it catches is buried and starts again just above it (co-op: loses a life)
 if(K.tick>300)av+=avSp;
 for(const c of cl){if(c.out||c.fin)continue;if(c.y<av-6&&!(c.buried>K.tick)){c.buried=K.tick+90;
   if(K.mode===2){c.lives--;if(c.lives<=0){c.out=true;say(c,'BURIED!','#ff6060');continue}}send(c,'av',0);say(c,'AVALANCHE!','#ff8080')}}
 places();vis();checkEnd()}
const _onEv=onEv;onEv=function(c,kind,v,by){if(kind==='av'){const f=Math.max(0,Math.ceil((av+20)/FH));let col=Math.floor(c.x/CW);for(let k=0;k<NC&&!cellAt(f,col);k++)col=(col+1)%NC;
  c.y=f*FH+.5;c.x=col*CW+8;c.vx=c.vy=0;c.stun=60;return}_onEv(c,kind,v,by)};
function places(){const o=cl.slice().sort((a,b)=>(a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:(a.out-b.out)||b.y-a.y));o.forEach((c,k)=>c.place=k+1)}
function checkEnd(){const lim=K.S.len*3600,live=cl.filter(c=>!c.out);
 if(K.mode===2){const up=live.filter(c=>c.fin).length;if(!live.length){K.end({coop:0,name:'BURIED · FLOOR '+Math.max(...cl.map(c=>c.best))});return}
  if(up&&(up===live.length||K.tick-firstFin>2700)){K.end({coop:1,name:up===live.length?'ALL TO THE TOP!':up+' OF '+live.length+' REACHED THE TOP!'});return}if(lim&&K.tick>lim){K.end({coop:0,name:'OUT OF TIME'});return}return}
 const humans=cl.filter(c=>K.seats[c.i].ctrl!=='cpu'&&!c.fin&&!c.out).length,all=live.every(c=>c.fin);
 if(all&&finN||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>300||finN&&K.tick-firstFin>1800||lim&&K.tick>lim){places();const w=cl.find(c=>c.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=cl.length,sc=[0,1].map(t=>cl.filter(c=>c.i%2===t).reduce((a,c)=>a+(n-c.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(c,s,col){texts.push({x:c.x,y:c.y+28,s,col,t:80})}
function burst(x,y,col){for(let k=0;k<8;k++)parts.push({x,y,vx:(Math.random()-.5)*2.5,vy:Math.random()*2,t:30,col,g:1})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy-=.12;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>400)parts.splice(0,parts.length-400);
 for(const t of texts){t.t--;t.y+=.3}texts=texts.filter(t=>t.t>0);
 for(const c of cl){if(c.gr&&Math.abs(c.vx)>1&&K.tick%6===0&&!(c.fx.boots>0))parts.push({x:c.x,y:c.y+1,vx:-c.vx*.3,vy:.4,t:14,col:'#e8f4ff'})}}

/* ---------- guests ---------- */
function local(i){const c=cl[i];if(!c)return;move(c,c.fin?{}:K.inp(i));for(const[cell,t]of L.broken)if(K.tick-t>90)L.broken.delete(cell)}
function upload(i){const c=cl[i];if(!c)return null;return{x:Math.round(c.x*10)/10,y:Math.round(c.y*10)/10,vx:Math.round(c.vx*100)/100,f:c.face,fl:flags(c),a:Math.round(c.anim*10)/10,s:c.swing,st:c.stun,sn:c.snow,c:c.claims}}
function flags(c){if(c.fl!=null&&(K.isClient()?c.i!==K.myIdx:ownerNet(c)))return c.fl;const f=c.fx;return(f.boots>0?1:0)|(f.big>0?2:0)|(f.bal>0?4:0)|(f.parka>0?8:0)|(f.wind>0?16:0)|(c.gr?32:0)}
function packGrid(){let s='';for(let f=1;f<=NF;f++){let v=0;for(let c=0;c<NC;c++)if(grid[f*NC+c]===1)v|=1<<c;s+=v.toString(36)+'.'}return s}
function snap(){return{c:cl.map(c=>[Math.round(c.x),Math.round(c.y),c.face,flags(c),Math.round(c.anim*10),c.swing,c.stun,c.place,c.fin,c.out?1:0,c.lives,c.best,ownerNet(c)?c.ev:0,c.ft,c.snow]),
 g:packGrid(),it:items.map(it=>[it.id,it.x,it.y,it.k]),b:balls.map(b=>[Math.round(b.x),Math.round(b.y)]),bd:birds.map(b=>[Math.round(b.x),Math.round(b.y),b.vx>0?1:0]),
 ic:icis.map(ic=>[ic.id,Math.round(ic.x),Math.round(ic.y),ic.fall?1:0]),av:Math.round(av),cx:Math.round(condor.x),cy:Math.round(condor.y)}}
function apply(g){const parts2=String(g.g||'').split('.');for(let f=1;f<=NF;f++){const v=parseInt(parts2[f-1]||'0',36)|0;for(let c=0;c<NC;c++){const cell=f*NC+c,was=grid[cell];
  if(was===2)continue;grid[cell]=(v>>c)&1?1:0;if(grid[cell]===1&&L.broken.has(cell)&&K.tick-L.broken.get(cell)>40)L.broken.delete(cell)}}
 (g.c||[]).forEach((a,i)=>{const c=cl[i];if(!c)return;c.place=a[7]|0;c.fin=a[8]|0;c.out=!!a[9];c.lives=a[10]|0;c.best=a[11]|0;c.ft=a[13]|0;
  if(i===K.myIdx){for(const e of a[12]||[])if((e[0]|0)>c.evSeen){c.evSeen=e[0]|0;onEv(c,e[1],e[2],e[3])}return}
  c.tx=a[0];c.ty=a[1];c.face=a[2];c.fl=a[3];c.anim=a[4]/10;c.swing=a[5];c.stun=a[6];c.snow=a[14]|0;if(c.gx==null){c.x=c.tx;c.y=c.ty;c.gx=1}});
 const im=new Map(items.map(x=>[x.id,x]));items=(g.it||[]).map(r=>({id:r[0],x:r[1],y:r[2],k:r[3],got:im.get(r[0])&&im.get(r[0]).got}));
 balls=(g.b||[]).map(r=>({x:r[0],y:r[1]}));birds=(g.bd||[]).map(r=>({x:r[0],y:r[1],vx:r[2]?1:-1}));
 const om=new Map(icis.map(x=>[x.id,x]));icis=(g.ic||[]).map(r=>({id:r[0],x:r[1],y:r[2],fall:r[3],hit:om.get(r[0])&&om.get(r[0]).hit}));
 av=g.av|0;condor.x=g.cx|0;condor.y=g.cy|0}
function follow(){for(const c of cl){if(c.i===K.myIdx||c.tx==null)continue;const dx=c.tx-c.x,dy=c.ty-c.y;if(Math.hypot(dx,dy)>40){c.x=c.tx;c.y=c.ty}else{c.x+=dx*.35;c.y+=dy*.35}}vis()}
function onFx(k,a){if(k==='f'){const c=cl[a[0]];if(c){sfx('roar');say(c,'TO THE TOP!','#f8d040')}}else if(k==='qk')shake=6}
let shake=0;

/* ---------- CPU climbers ---------- */
function bot(i){const c=cl[i];if(!c||c.out||c.fin)return{};const o={},f=Math.floor(c.y/FH+.01),up=f+1;
 if(c.fx.bal>0){return{}}
 // a target hole (or ice to smash) in the floor above
 if(c.best>(c.lb|0)){c.lb=c.best;c.lbT=K.tick}const stuck=K.tick-(c.lbT|0)>400;if(stuck&&c.tgT>K.tick+60)c.tgT=0;
 if(c.gr){if(c.tgF!==up||c.tgT<K.tick){let best=null,bs=1e9;for(let col=0;col<NC;col++){const v=up>NF?0:solidAt(up,col);if(v===2)continue;const d=Math.abs(col*CW+8-c.x)+(v===1?20:0)+Math.random()*(stuck?200:[30,14,4][K.cpu]);if(d<bs){bs=d;best=col}}
   c.tgF=up;c.tgC=best;c.tgT=K.tick+120}
  if(up>NF){const dx=condor.x-c.x;if(Math.abs(dx)>4)o[dx>0?'right':'left']=true;if(Math.abs(dx)<30&&K.tick&1)o.up=true;return o}
  const tx=c.tgC*CW+8,dx=tx-c.x;if(Math.abs(dx)>2.5)o[dx>0?'right':'left']=true;else if(Math.abs(c.vx)<.6&&K.tick&1)o.up=true}
 else if(c.vy<2.5){// steer onto the nearest solid ledge of the floor just below my feet
  const lf=Math.floor(c.y/FH);let best=null,bs=1e9;if(c.y-lf*FH<FH*.6)for(let col=0;col<NC;col++)if(solidAt(lf,col)){const d=Math.abs(col*CW+8-c.x);if(d<bs){bs=d;best=col}}if(best!=null){const dx=best*CW+8-c.x;if(Math.abs(dx)>3)o[dx>0?'right':'left']=true}}
 for(const r of cl)if(r!==c&&!r.out&&!r.fin&&!sameTeam(i,r.i)&&Math.abs(r.y-c.y)<10&&Math.abs(r.x-c.x)<14&&Math.random()<[.02,.05,.1][K.cpu]){c.face=r.x>c.x?1:-1;o.alt=true}
 if(c.snow>0&&Math.random()<.02&&cl.some(r=>r!==c&&Math.abs(r.y-c.y)<20&&Math.abs(r.x-c.x)<90))o.b3=true;
 return o}

/* ---------- drawing ---------- */
const IMG={};
function blockImg(kind,theme){const key='b'+kind+theme;if(IMG[key])return IMG[key];const Q=3,c=document.createElement('canvas');c.width=CW*Q;c.height=(BH+4)*Q;const g=c.getContext('2d');g.scale(Q,Q);
 if(kind===1){const gr=g.createLinearGradient(0,4,CW,BH+4);gr.addColorStop(0,'#e8fbff');gr.addColorStop(.35,'#8ed8f8');gr.addColorStop(1,'#3a88c8');g.fillStyle=gr;g.fillRect(0,4,CW,BH);
  g.fillStyle='#f4fdff';g.fillRect(0,0,CW,4.5);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(1.5,5.5,4,1.2);g.fillRect(1.5,5.5,1.2,4);g.fillStyle='rgba(20,60,120,.45)';g.fillRect(0,BH+3,CW,1);g.fillRect(CW-1,4,1,BH)}
 else{const gr=g.createLinearGradient(0,4,0,BH+4);gr.addColorStop(0,'#a07858');gr.addColorStop(1,'#4a3020');g.fillStyle=gr;g.fillRect(0,4,CW,BH);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(5,7,3,2);g.fillRect(10,11,4,2);g.fillRect(2,12,2,2);
  g.fillStyle='#ffffff';g.fillRect(0,0,CW,4.5);g.fillStyle='#dceaf8';g.fillRect(0,3.5,CW,1);g.beginPath();g.arc(4,4.5,2,0,Math.PI);g.arc(11,4.5,1.6,0,Math.PI);g.fill()}
 c._q=Q;return IMG[key]=c}
function climberImg(col,fr){const key='c'+col+fr;if(IMG[key])return IMG[key];const sw=fr===1?1:fr===2?-1:0,jump=fr===3,hit=fr===4,lt=mix(col,'#ffffff',.3),B=(x,y,r,cl,z,o)=>Object.assign({x,y,r,col:cl,z:z||0},o||{});
 const b=[B(8+sw*2,20-(jump?2:0),2.3,'#3a3040'),B(11-sw*2,20-(jump?3:0),2.3,'#3a3040',1),B(9.5,14,4.6,col),B(9.5,10.5,4.2,lt,1),B(9.5,6,4,'#f8f8f8'),B(10.3,6.3,2.7,'#f0c8a0',2),B(11.3,5.6,.6,'#202020',4),
  B(5.5,12,2,col,-1)];
 if(hit){b.push(B(14,10,1.2,'#8a5a30',3),B(16.5,10,1.2,'#8a5a30',3),B(19,10,2.6,'#a0a8b8',4))}else b.push(B(12.5,12.5,1.3,'#8a5a30',3),B(13.5,9,1.2,'#8a5a30',3),B(14.2,6.3,2.4,'#a0a8b8',4));
 return IMG[key]=RA.fx.model(hit?22:18,23,b,{amb:.42})}
const VEGI=[];function vegImg(k){return VEGI[k]||(VEGI[k]=RA.fx.model(10,12,[{x:5,y:7,r:4,col:VEG[k]},{x:5,y:2.5,r:2,col:'#40a040',z:1},{x:3.5,y:5.5,r:1.2,col:'#ffffff',z:3,gloss:1}],{amb:.45}))}
let BIRD=null,CONDOR=null,SKYC=null;
function birdImg(){return BIRD||(BIRD=RA.fx.model(14,10,[{x:7,y:5,r:3.4,col:'#4870d8'},{x:10.5,y:4,r:2.2,col:'#5890f0',z:1},{x:12.8,y:4.2,r:1,col:'#f0c020',z:2},{x:3,y:3,r:2.4,col:'#3860c0',z:-1}],{amb:.45}))}
function condorImg(){return CONDOR||(CONDOR=RA.fx.model(34,20,[{x:17,y:11,r:6,col:'#a05a30'},{x:7,y:8,r:5,col:'#8a4a28',z:-1},{x:27,y:8,r:5,col:'#8a4a28',z:-1},{x:3,y:6,r:3.4,col:'#7a4020',z:-2},{x:31,y:6,r:3.4,col:'#7a4020',z:-2},
 {x:22,y:7,r:3.2,col:'#f0e0d0',z:2},{x:25.5,y:7.5,r:2,col:'#f08080',z:3},{x:27.6,y:8,r:1,col:'#f0c020',z:4},{x:15,y:16,r:2.4,col:'#c06030',z:1}],{amb:.45}))}
function mountains(w,h){const key=w+'x'+h;if(SKYC&&SKYC.key===key)return SKYC;const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.scale(2,2);
 for(const[L,col,amp,base]of[[0,'#8aa8d8',.35,.55],[1,'#c8d8f0',.25,.75]]){g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=3){const y=h*base-h*amp*Math.abs(Math.sin(x*.012+L*2))*(.6+.4*Math.sin(x*.031+L));g.lineTo(x,y)}g.lineTo(w,h);g.closePath();
  const gr=g.createLinearGradient(0,h*(base-amp),0,h);gr.addColorStop(0,'#ffffff');gr.addColorStop(.18,col);gr.addColorStop(1,mix(col,'#203050',.5));g.fillStyle=gr;g.fill()}
 c.key=key;return SKYC=c}
const cams=[];
function view(g,c,vx,vy,vw,vh,ci,many){let cam=cams[ci];if(!cam||cam.i!==c.i)cam=cams[ci]={i:c.i,y:c.y};
 const sc=Math.min(vw/(WW+24),vh/150),wv=vw/sc,hv=vh/sc;cam.y+=(c.y-cam.y)*.12;const cy=Math.max(hv*.35,cam.y+hv*.12),cx=WW/2;
 const X=x=>vx+vw/2+(x-cx)*sc+(shake>.3?(Math.random()-.5)*shake:0),Y=y=>vy+vh/2-(y-cy)*sc;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 // sky by altitude, far peaks, the mountain face
 const alt=Math.min(1,cam.y/(NF*FH)),sg=g.createLinearGradient(0,vy,0,vy+vh);sg.addColorStop(0,mix('#3a70c8','#0a1840',alt));sg.addColorStop(1,mix('#c8e4f8','#5878b8',alt));g.fillStyle=sg;g.fillRect(vx,vy,vw,vh);
 const mt=mountains(Math.round(vw),Math.round(vh));g.drawImage(mt,vx,vy+vh*.25+Math.min(vh*.6,cam.y*sc*.08),vw,vh);
 const wl=X(-6),wr=X(WW+6);const rg=g.createLinearGradient(wl,0,wr,0);rg.addColorStop(0,'rgba(40,60,100,.8)');rg.addColorStop(.5,'rgba(70,96,140,.55)');rg.addColorStop(1,'rgba(40,60,100,.8)');g.fillStyle=rg;g.fillRect(wl,vy,wr-wl,vh);
 g.fillStyle='rgba(255,255,255,.08)';for(let k=0;k<12;k++){const yy=((k*97-cy*sc*.6)%vh+vh)%vh;g.fillRect(wl+((k*53)%(wr-wl)),vy+yy,2,vh*.2)}
 // cliff walls at both sides
 for(const[a,b]of[[X(-60),X(0)],[X(WW),X(WW+60)]]){const cg=g.createLinearGradient(a,0,b,0);cg.addColorStop(0,'#3a3050');cg.addColorStop(1,'#5a5070');g.fillStyle=cg;g.fillRect(a,vy,b-a,vh)}
 // floors in view
 const f0=Math.max(0,Math.floor((cy-hv/2)/FH)-1),f1=Math.min(NF+1,Math.ceil((cy+hv/2)/FH)+1),bw=CW*sc,bh=(BH+4)*sc;
 for(let f=f0;f<=f1;f++){const top=Y(f*FH);for(let col=0;col<NC;col++){const v=solidAt(f,col);if(!v)continue;g.drawImage(blockImg(v,0),X(col*CW),top-4*sc,bw+.5,bh)}
  if(f>0&&f<=NF&&(f%5===0)){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(X(-58),top-8*sc,40*sc,10*sc);RA.gfx.text(g,f+'F',X(-38),top-7*sc,'#f8f8ff')}}
 // the summit and the condor
 {const sy=Y(NF*FH);if(sy>vy-40){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(X(0),sy-4*sc);g.lineTo(X(WW/2),sy-26*sc);g.lineTo(X(WW),sy-4*sc);g.fill();
  const ci2=condorImg(),cw=34*sc*1.2,ch=20*sc*1.2,cxx=X(condor.x),cyy=Y(condor.y);g.save();g.translate(cxx,cyy);if(condor.d<0)g.scale(-1,1);g.drawImage(ci2,-cw/2,-ch/2+Math.sin(K.tick*.2)*2*sc,cw,ch);g.restore();
  RA.gfx.text(g,'GRAB THE CONDOR!',X(WW/2),Y(NF*FH+75),'#f8d040')}}
 for(const it of items){if(it.got)continue;const x=X(it.x),y=Y(it.y+7+Math.sin(K.tick*.1+it.id)*1.5);RA.fx.light(g,x,y,8*sc,'#ffffa0',.2);g.drawImage(vegImg(it.k),x-5*sc,y-6*sc,10*sc,12*sc)}
 for(const ic of icis){const x=X(ic.x),y=Y(ic.y),l=(ic.fall?9:Math.min(9,(ic.t||50)/10))*sc;g.fillStyle='#d8f4ff';g.beginPath();g.moveTo(x-2.5*sc,y);g.lineTo(x+2.5*sc,y);g.lineTo(x,y+l);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.fillRect(x-1*sc,y,.8*sc,l*.6)}
 for(const b of birds){const x=X(b.x),y=Y(b.y);g.save();g.translate(x,y);if(b.vx<0)g.scale(-1,1);g.drawImage(birdImg(),-7*sc,-5*sc+(K.tick>>3&1?-1:1)*sc,14*sc,10*sc);g.restore()}
 for(const o of cl){if(o.out)continue;const x=X(o.x),y=Y(o.y),fl=flags(o),fr=o.swing>6&&o.swing<14?4:!(fl&32)&&!o.gr&&o.vy!==0?3:o.anim>0?1+(Math.floor(o.anim)&1):0;
  const im=climberImg(o.col,fr),w=(fr===4?22:18)*sc,h=23*sc;
  RA.fx.shadow(g,x,Y(Math.floor(o.y/FH+.01)*FH),4*sc,.3);
  if(fl&4){g.strokeStyle='#ddd';g.lineWidth=.5;g.beginPath();g.moveTo(x,y-h*.8);g.lineTo(x,y-h*1.4);g.stroke();const bg=g.createRadialGradient(x-2*sc,y-h*1.6,1,x,y-h*1.5,7*sc);bg.addColorStop(0,'#fff');bg.addColorStop(.3,'#ff60a0');bg.addColorStop(1,'#a02050');g.fillStyle=bg;g.beginPath();g.ellipse(x,y-h*1.55,6*sc,7.5*sc,0,0,7);g.fill()}
  g.save();g.translate(x,y);if(o.face<0)g.scale(-1,1);if(o.stun>0)g.rotate(Math.sin(K.tick*.5)*.4);if(o.fin)g.globalAlpha=.6;
  g.drawImage(im,-9*sc,-h+1*sc,w,h);g.restore();
  if(fl&8){g.strokeStyle='rgba(120,200,255,.8)';g.lineWidth=.8;g.beginPath();g.arc(x,y-h*.5,10*sc,0,7);g.stroke()}
  if(fl&2)RA.fx.light(g,x+o.face*10*sc,y-h*.6,6*sc,'#ffc060',.3);
  if(o.stun>0)for(let k=0;k<3;k++){const a=K.tick*.15+k*2.1;g.fillStyle='#f8e040';g.fillRect(x+Math.cos(a)*6*sc-1,y-h-2*sc+Math.sin(a)*2*sc,2,2)}
  if(cl.length>1&&!K.demo)RA.gfx.text(g,o.name,x,y-h-9*sc,o.col)}
 for(const b of balls){g.fillStyle='#ffffff';g.beginPath();g.arc(X(b.x),Y(b.y),2.4*sc,0,7);g.fill()}
 for(const p of parts){g.globalAlpha=Math.min(1,p.t/15);g.fillStyle=p.col;g.fillRect(X(p.x)-sc,Y(p.y)-sc,2*sc,2*sc)}g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,X(t.x),Y(t.y),t.col);
 // the avalanche
 const ay=Y(av);if(ay<vy+vh){const ag=g.createLinearGradient(0,ay-10,0,ay+40);ag.addColorStop(0,'#ffffff');ag.addColorStop(.5,'#e0f0ff');ag.addColorStop(1,'#a8c8f0');g.fillStyle=ag;g.beginPath();g.moveTo(vx,vy+vh);
  for(let x=0;x<=vw;x+=6)g.lineTo(vx+x,ay-Math.abs(Math.sin(x*.05+K.tick*.08))*8*sc-Math.sin(x*.013-K.tick*.03)*4*sc);g.lineTo(vx+vw,vy+vh);g.closePath();g.fill();
  if(avSp>0&&K.tick%3===0)parts.push({x:cx+(Math.random()-.5)*WW,y:av+4,vx:(Math.random()-.5)*2,vy:1+Math.random()*1.5,t:30,col:'#ffffff',g:1})}
 // snowfall (and the blizzard)
 const bl=c.fx&&c.fx.wind>0;g.fillStyle='rgba(255,255,255,.85)';for(const fk of flakes){const x=vx+((fk.x*vw+K.tick*(bl?3:.3)*fk.s)%vw+vw)%vw,y=vy+((fk.y*vh+K.tick*(bl?1.5:.6)*fk.s+cy*sc*fk.s*.3)%vh+vh)%vh;g.fillRect(x,y,1.2*fk.s+.4,1.2*fk.s+.4)}
 if(bl){g.fillStyle='rgba(240,248,255,'+Math.min(.75,c.fx.wind/80)+')';g.fillRect(vx,vy,vw,vh)}
 hud(g,c,vx,vy,vw,vh,many,X,Y);
 g.restore();if(many){g.strokeStyle='#000';g.lineWidth=1.5;g.strokeRect(vx,vy,vw,vh)}}
function txt(g,s,x,y,size,col,align){g.save();g.font=size+'px "Russo One","Arial Black",sans-serif';g.textAlign=align||'center';g.textBaseline='middle';
 const gr=g.createLinearGradient(0,y-size/2,0,y+size/2);gr.addColorStop(0,mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.35));
 g.lineJoin='round';g.lineWidth=Math.max(1.5,size/5);g.strokeStyle='#000';g.strokeText(s,x,y);g.fillStyle=gr;g.fillText(s,x,y);g.restore()}
function hud(g,c,vx,vy0,vw,vh0,many){const top=vy0===0?24:4,vy=vy0+top,vh=vh0-top,sc=many?.8:1;
 if(K.tick<120){const n=3-Math.floor(K.tick/40);txt(g,n>0?n+'':'GO!',vx+vw/2,vy+vh*.35,24*sc,n>0?'#ffffff':'#40ff80');if(K.tick%40===0)RA.audio.blip(K.tick<120?440:880)}
 else if(K.tick<160)txt(g,'CLIMB!',vx+vw/2,vy+vh*.35,22*sc,'#40ff80');
 if(K.demo)return;
 const fl=Math.min(NF,Math.floor(c.y/FH+.01));txt(g,'FLOOR '+fl+'/'+NF,vx+8,vy+10,9*sc,'#ffffff','left');
 txt(g,K.mode===2?'LIVES '+'♥'.repeat(Math.max(0,c.lives)):ord(c.place),vx+8,vy+22,8*sc,K.mode===2?'#ff8080':c.place===1?'#f8d040':'#ffffff','left');
 if(c.snow>0)txt(g,'❄ x'+c.snow,vx+8,vy+33,7*sc,'#e0f4ff','left');
 const f=c.fx||{},chips=[['boots',900,1],['big',700,2],['bal',110,3],['wind',300,6]].filter(e=>f[e[0]]>0);if(f.parka>0)chips.push(['parka',1,5]);
 chips.forEach((e,n)=>{const x=vx+vw/2-40,y=vy+6+n*10;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,80,8);g.fillStyle=ITEMS[e[2]].c;g.fillRect(x,y+6,80*Math.min(1,f[e[0]]/e[1]),2);txt(g,ITEMS[e[2]].n,x+40,y+3.5,5.5,ITEMS[e[2]].c)});
 // altimeter: every climber, the avalanche and the summit
 const ax=vx+vw-12,ay0=vy+vh-10,ay1=vy+30,H=ay0-ay1,yy=v=>ay0-Math.max(0,Math.min(1,v/(NF*FH)))*H;
 g.fillStyle='rgba(0,0,0,.45)';g.fillRect(ax-3,ay1-4,6,H+8);g.fillStyle='rgba(255,255,255,.9)';g.fillRect(ax-4,ay1-2,8,2);
 if(av>-100){g.fillStyle='rgba(255,120,120,.8)';g.fillRect(ax-3,yy(av),6,ay0-yy(av))}
 for(const o of cl){if(o.out)continue;g.fillStyle=o.col;const s=o===c?3.4:2.2;g.fillRect(ax-s,yy(o.y)-s/2,s*2,s)}
 if(c.fin)txt(g,ord(c.fin)+' · AT THE TOP!',vx+vw/2,vy+vh*.25,12*sc,'#f8d040');
 if(c.y-av<FH&&avSp>0&&!c.fin&&(K.tick>>4)&1)txt(g,'AVALANCHE!',vx+vw/2,vy+vh-20,12*sc,'#ff6060')}
function render(g,W,H){if(!grid){g.fillStyle='#000';g.fillRect(0,0,W,H);return}if(shake>0)shake*=.9;
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=cl.slice().sort((a,b)=>a.place-b.place).find(c=>!c.out)||cl[0];fs=lead?[lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length;if(!n){g.fillStyle='#000';g.fillRect(0,0,W,H);return}
 fs.forEach((i,k)=>view(g,cl[i],Math.round(W*k/n),0,Math.round(W/n),H,k,n>1))}
K=RA.kit({id:'icepeak',name:'ICE PEAK',kind:'Climbing race',players:'1-20 players',demo:6,localFirst:true,baseH:216,
 desc:'Race up a frozen mountain for up to 20: smash the ice above you, knock rivals off their ledges with your hammer, outrun the avalanche and grab the condor at the summit.',
 blurb:'A / D walk, Space jumps up into the ice to smash it, E swings the hammer, Q throws a snowball. Grab the condor at the top!',
 howto:'A / D walk, Space / W / click jump (steer in the air), E or right-click hammer, Q snowball. Gamepad: stick, A jump, B hammer, X snowball.',
 icon:['....kk....','...kwwk...','..kwwwck..','..kcwwcck.','.kccccscck','.kcsccccsk','kssccsscck','kssssssssk','kkkkkkkkkk','..........'],
 music:MUSIC,fireLabel:'JUMP',
 modes:[['RACE','First to grab the condor wins.'],['TEAM RACE','Red vs blue: points for every finishing place.'],['CO-OP CLIMB','Everyone up before the avalanche, shared fate.']],
 settings:[['height','Mountain',[[25,'25 floors'],[15,'15 floors'],[40,'40 floors']]],['av','Avalanche',[[1,'Slow'],[0,'Off'],[2,'Fast']]],['items','Vegetables',[['on','On'],['party','Wild party'],['off','Off']]],
  ['lives','Co-op lives',[[3,'3'],[1,'1'],[5,'5']]],['len','Time limit',[[0,'None'],[5,'5 min'],[8,'8 min']]]],
 kb:[['A D','walk'],['SPACE W','jump'],['E RMB','hammer'],['Q','snowball'],['C','chat'],['ESC','menu']],pad:[['LS','walk'],['A','jump'],['B','hammer'],['X','snowball'],['START','menu']],
 ach:[{id:'first',name:'Base Camp',desc:'Finish your first climb',test:s=>s.played>=1,unlock:'title:Climber'},{id:'win1',name:'Summit',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Mountaineer'},
  {id:'smash50',name:'Ice Breaker',desc:'Smash 50 blocks in one climb',test:(s,m)=>m.smashes>=50,unlock:'title:Ice Breaker'},{id:'knock10',name:'Hammer Time',desc:'Knock rivals 10 times in one climb',test:(s,m)=>m.kills>=10,unlock:'title:Hammer Time'}],
 alive:i=>!!cl[i]&&!cl[i].out&&!cl[i].fin,out:i=>!!cl[i]&&cl[i].out,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>grid?NF+' floors':'',
 ranks:()=>cl.slice().sort((a,b)=>a.place-b.place).map(c=>[c.name,c.col,c.fin?'summit · '+(c.ft/60).toFixed(1)+'s':c.out?'buried':'floor '+c.best]),
 result:(i,w)=>{const c=cl[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:c.knocks|0,smashes:c.smashes|0,bestScore:c.best}}});
window.__ip={get cl(){return cl},K,get grid(){return grid}};
})();
