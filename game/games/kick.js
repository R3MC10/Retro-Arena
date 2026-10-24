/* PIXEL KICK for Retro Arena: arcade football for up to 10 a side, filmed by a TV broadcast camera on a perspective
   pitch (RA.fx.floor7) with pre-rendered shaded footballers (RA.fx.model, 8 directions, run cycle), a full stand of fans,
   real goal frames with nets, and a ball that flies, bounces and curls in 3D.
   W A S D run, Shift sprints. With the ball: tap Space (or click) to pass, hold it to charge a shot, E lobs / crosses,
   Q is a burst dribble. Without it: Space tackles, Q slides in, E shouts for a pass (CPU team mates will give it to you).
   The mouse aims passes and shots when you use it; otherwise you kick where you run, and shots towards goal aim at the goal.
   Touch: tap the button to pass or tackle, hold it to shoot. Every human plays one footballer; CPU players fill the teams
   up to the team size, keepers are always CPU.
   Modes: MATCH (red vs blue, humans split) · CO-OP (all of you against a CPU team).
   Power-ups drop onto the pitch and work as soon as you run over them:
    SPEED BOOTS · FIRE SHOT (your next shot burns through the keeper's gloves) · BANANA SHOT (your next shot curls)
    MAGNET (loose balls drift to you) · GIANT KEEPER (your keeper grows) · party: FREEZE (rivals freeze for 2 s)
    BRICK WALL (bricks up your own goal for a while) · TINY TEAM (rivals shrink and kick weakly).
   Online is lag-free (RA.kit localFirst): you run, dribble and kick on your own device at once; the host referees
   the ball when it is loose, tackles, keepers and goals, and accepts your touches and kicks. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx,{mix}=RA.util;
const PW=640,PH=400,GZ0=165,GZ1=235,GH=20,GD=16,TS=1024,OX=192,OZ=300,CZ=-300;
const TEAMC=['#e83838','#2c78f0'],TEAMN=['RED','BLUE'],GKC=['#f0d020','#30c060'],SHORTS=['#f4f4f4','#203060'];
const ITEMS=[null,{n:'SPEED BOOTS',c:'#40e0ff'},{n:'FIRE SHOT',c:'#ff6020'},{n:'BANANA SHOT',c:'#f8e040'},{n:'MAGNET',c:'#e04080'},{n:'GIANT KEEPER',c:'#60e060'},
 {n:'FREEZE',c:'#a0e8ff',party:1},{n:'BRICK WALL',c:'#c06040',party:1},{n:'TINY TEAM',c:'#e080ff',party:1}];
RA.audio.add('whistle',(AC,now,g)=>{const o=AC.createOscillator(),l=AC.createOscillator(),lg=AC.createGain();o.type='square';o.frequency.value=2200;l.frequency.value=32;lg.gain.value=180;l.connect(lg);lg.connect(o.frequency);
 g.gain.setValueAtTime(.05,now);g.gain.setValueAtTime(.05,now+.32);g.gain.exponentialRampToValueAtTime(.001,now+.4);o.connect(g);o.start(now);l.start(now);o.stop(now+.42);l.stop(now+.42)});
RA.audio.add('kick',(AC,now,g)=>{const o=AC.createOscillator();o.frequency.setValueAtTime(160,now);o.frequency.exponentialRampToValueAtTime(50,now+.09);g.gain.setValueAtTime(.35,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start(now);o.stop(now+.11)});
RA.audio.add('roar',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;s.loop=true;f.type='bandpass';f.frequency.value=700;f.Q.value=.6;
 g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.16,now+.25);g.gain.exponentialRampToValueAtTime(.001,now+2.2);s.connect(f);f.connect(g);s.start(now);s.stop(now+2.3)});
const MUSIC=[T('Tunnel',100,['D','Bm','G','A'],'k...s...k.k.s...','f#5 - a5 d6 - a5 f#5 - g5 - b5 d6 - b5 g5 - e5 - a5 c#6 - a5 e5 - a5 - - - - - - -'),
 T('Kick Off',148,['C','G','Am','F'],'k.hsk.hsk.hsk.hs','c5 e5 g5 . g5 a5 g5 e5 d5 . g5 . b4 d5 g5 . e5 a5 c6 . a5 e5 c5 . f5 . a5 . c6 . a5 .'),
 T('Terrace Chant',132,['G','C','D','G'],'k.s.k.s.k.s.kkss','g5 g5 g5 . d5 . g5 . c6 c6 b5 . a5 . g5 . a5 a5 a5 . f#5 . d5 . g5 - - - - - - .'),
 T('Extra Time',170,['Em','C','D','B'],'k.hhs.hhk.hhs.hs','e5 g5 b5 e6 b5 g5 e5 g5 c5 e5 g5 c6 g5 e5 c5 e5 d5 f#5 a5 d6 a5 f#5 d5 f#5 b4 d#5 f#5 b5 f#5 d#5 b4 .')];
let K,pl=[],ball=null,items=[],parts=[],texts=[],score=[0,0],ko=0,koT=0,cel=0,golden=false,nextId=1,seatP=[],wall=[0,0],gkBig=[0,0],lastGoal=null,shake=0;
const G={hold:false,claimSeq:0,kickSeq:0,pred:null,koSeen:-1,evSeen:0,cseq:0,claims:[],kicks:[]};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const attackX=t=>t===0?PW:0,dirX=t=>t===0?1:-1;
const ownerOf=p=>p.seat>=0&&K.seats[p.seat]&&K.seats[p.seat].ctrl==='net'?'net':'host';
const mine=p=>K.isClient()?p.seat>=0&&p.seat===K.myIdx:ownerOf(p)==='host';

/* ---------- pitch texture, stand ---------- */
let TEX=null,STAND=null;
function pitchTex(){if(TEX)return TEX;const c=document.createElement('canvas');c.width=c.height=TS;const g=c.getContext('2d'),im=g.createImageData(TS,TS),d=im.data;
 const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],L=.9;
 const edge=(x,z,x0,z0,x1,z1)=>x>=x0-L&&x<=x1+L&&z>=z0-L&&z<=z1+L&&(Math.abs(x-x0)<L||Math.abs(x-x1)<L||Math.abs(z-z0)<L||Math.abs(z-z1)<L);
 for(let v=0;v<TS;v++)for(let u=0;u<TS;u++){const x=u-OX,z=v-OZ,o=(v*TS+u)*4,b=BAY[(v&3)*4+(u&3)]/16-.5,n=Math.sin(u*12.9898+v*78.233)*43758.5%1;let c;
  const inP=x>=-40&&x<=PW+40&&z>=-30&&z<=PH+30;
  if(inP){const st=(Math.floor((x+1000)/40)&1)?1:.88,lf=1+Math.sin(x*.013+z*.02)*.04;c=[64*st*lf,146*st*lf,56*st*lf];
   const line=x>=-L&&x<=PW+L&&z>=-L&&z<=PH+L&&(edge(x,z,0,0,PW,PH)||Math.abs(x-PW/2)<L||Math.abs(Math.hypot(x-PW/2,z-PH/2)-50)<L||Math.hypot(x-PW/2,z-PH/2)<2.2||
    edge(x,z,0,80,90,320)||edge(x,z,PW-90,80,PW,320)||edge(x,z,0,140,30,260)||edge(x,z,PW-30,140,PW,260)||Math.hypot(x-60,z-200)<1.8||Math.hypot(x-PW+60,z-200)<1.8||
    (x>90&&x<110&&Math.abs(Math.hypot(x-60,z-200)-50)<L)||(x<PW-90&&x>PW-110&&Math.abs(Math.hypot(x-PW+60,z-200)-50)<L)||
    [[0,0],[PW,0],[0,PH],[PW,PH]].some(([cx,cz])=>Math.abs(Math.hypot(x-cx,z-cz)-8)<L&&x>=0&&x<=PW&&z>=0&&z<=PH));
   if(line)c=[236,240,232];else if(x<0||x>PW||z<0||z>PH)c=c.map(q=>q*.86)}
  else if(x>=-56&&x<=PW+56&&z>=-46&&z<=PH+46)c=[178,84,58];   // running track
  else c=[118,118,124].map(q=>q*(.9+((((u>>3)+(v>>3))&1)?.06:0)));
  const k=.94+n*.1;d[o]=clamp(c[0]*k+b*7,0,255);d[o+1]=clamp(c[1]*k+b*7,0,255);d[o+2]=clamp(c[2]*k+b*7,0,255);d[o+3]=255}
 g.putImageData(im,0,0);return TEX=c}
function standImg(){if(STAND)return STAND;const W=1200,H=150,c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);
 const rr=RA.util.mulberry(42);const rg=g.createLinearGradient(0,0,0,H);rg.addColorStop(0,'#1a1c2c');rg.addColorStop(.35,'#30344c');rg.addColorStop(1,'#20222e');g.fillStyle=rg;g.fillRect(0,0,W,H);
 g.fillStyle='#0c0d16';g.fillRect(0,0,W,12);for(let x=20;x<W;x+=150){g.fillStyle='#e8eef8';g.fillRect(x,4,22,5);RA.fx.light(g,x+11,8,14,'#fff6d0',.25)}
 for(let row=0;row<11;row++){const y=18+row*9.5;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,y+6,W,2);
  for(let x=2;x<W;x+=4.2){const r=rr(),col=r<.35?TEAMC[0]:r<.7?TEAMC[1]:['#f0d0a0','#ffffff','#f8e040','#303030','#80c0ff'][Math.floor(rr()*5)];
   g.fillStyle=mix(col,'#000000',.15+row*.02);g.fillRect(x,y+1.5,3,4);g.fillStyle='#e8c0a0';g.fillRect(x+.6,y-.6,1.8,2)}}
 // advertising boards along the bottom
 const ads=[['RETRO ARENA','#f8d040','#202060'],['PIXEL KICK','#ffffff','#c02020'],['20 PLAYERS','#202020','#40d060'],['PS1 POWER','#ffffff','#2060e0']];
 for(let k=0,x=0;x<W;k++,x+=150){const a=ads[k%4],y=H-14;const ag=g.createLinearGradient(0,y,0,H);ag.addColorStop(0,mix(a[2],'#ffffff',.25));ag.addColorStop(1,mix(a[2],'#000000',.3));g.fillStyle=ag;g.fillRect(x,y,148,14);
  g.fillStyle=a[1];g.font='9px "Russo One",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a[0],x+74,y+7.5)}
 return STAND=c}

/* ---------- footballer models: 8 directions x (4 run frames + stand) per kit, cached ---------- */
const MOD={};
function manImg(shirt,shorts,dirI,fr,gk){const key=shirt+shorts+dirI+'_'+fr;if(MOD[key])return MOD[key];
 const rel=dirI/8*Math.PI*2,c=Math.cos(rel),s=Math.sin(rel),t=.45,ct=Math.cos(t),st=Math.sin(t),sw=fr<4?Math.sin(fr/4*Math.PI*2):0,skin='#e8b890',boot='#202024',hair='#3a2418';
 const B=[[-1.6,0,8.4,2,shorts],[1.6,0,8.4,2,shorts],[-1.6,sw*2.4,5,1.7,skin],[1.6,-sw*2.4,5,1.7,skin],[-1.6,sw*4+.8,1.6,1.6,boot],[1.6,-sw*4+.8,1.6,1.6,boot],
  [0,0,8.8,2.9,shorts],[0,0,11.6,3.3,shirt],[0,0,14,3,shirt],[-3.6,-sw*2,12.6,1.4,shirt],[3.6,sw*2,12.6,1.4,shirt],[-3.9,-sw*2.6,10,1.15,gk?'#f8f8f8':skin],[3.9,sw*2.6,10,1.15,gk?'#f8f8f8':skin],
  [0,0,17.6,2.6,skin],[0,-.7,18.7,2.4,hair]];
 const balls=B.map(([lx,ly,lz,r,col])=>{const X=lx*c-ly*s,Y=lx*s+ly*c;return{x:8+X,y:22-lz*ct-Y*st,z:-Y*ct+lz*st,r,col}});
 return MOD[key]=RA.fx.model(16,24,balls,{amb:.45,q:2})}
const BALLM=[];function ballImg(k){if(BALLM[k])return BALLM[k];const a=k/4*Math.PI/2,b=[{x:6,y:6,r:5,col:'#f8f8f4'}];
 for(let q=0;q<5;q++){const t=a+q*1.26;b.push({x:6+Math.cos(t)*3,y:6+Math.sin(t)*2.4,z:2.6,r:1.3,col:'#202024',gloss:.2})}return BALLM[k]=RA.fx.model(12,12,b,{amb:.5,q:2})}

/* ---------- match setup ---------- */
function formation(n,team){const out=[],lines=n<=2?[n]:n<=4?[Math.ceil(n/2),Math.floor(n/2)]:[Math.ceil(n*.4),Math.ceil(n*.35),n-Math.ceil(n*.4)-Math.ceil(n*.35)];
 const xs=lines.length===1?[.55]:lines.length===2?[.35,.75]:[.28,.58,.86];
 lines.forEach((m,li)=>{for(let k=0;k<m;k++){const x=xs[li]*PW/2,z=PH*(k+1)/(m+1);out.push([team===0?x:PW-x,z])}});return out}
function start(seats,md,S,seed){score=[0,0];ko=0;koT=0;cel=0;golden=false;nextId=1;items=[];parts=[];texts=[];wall=[0,0];gkBig=[0,0];lastGoal=null;shake=0;
 Object.assign(G,{hold:false,claimSeq:0,kickSeq:0,pred:null,koSeen:-1,evSeen:0,cseq:0,claims:[],kicks:[]});
 const humans=[[],[]];seats.forEach((s,i)=>humans[md===1?0:i%2].push(i));
 const size=S.size==='auto'?Math.max(4,humans[0].length,humans[1].length):Math.max(+S.size,humans[0].length,humans[1].length);
 pl=[];seatP=[];
 for(const t of[0,1]){pl.push(mk(t,-1,'KEEPER',true,t===0?6:PW-6,PH/2));
  const f=formation(size,t);for(let k=0;k<size;k++){const si=humans[t][k];const p=mk(t,si==null?-1:si,si==null?'CPU':seats[si].name,false,f[k][0],f[k][1]);pl.push(p);if(si!=null)seatP[si]=p.n}}
 ball={h:-1,x:PW/2,z:PH/2,y:0,vx:0,vz:0,vy:0,fire:0,curve:0,last:-1,kt:-99,spin:0};
 kickoff(Math.floor(RA.util.mulberry(seed)()*2))}
function mk(team,seat,name,gk,x,z){const p={n:pl.length,team,seat,gk,name,x,z,d:team===0?0:Math.PI,vx:0,vz:0,run:0,st:'',stT:0,fx:{},home:[x,z],goals:0,stam:1,kc:0,ch:0,fh:false,dodge:0,
 cack:0,kack:0,ev:[],evSeq:0,sk:0,col:seat>=0?K.seats[seat].col:TEAMC[team]};return p}
function kickoff(t){ko++;koT=t;cel=0;ball.h=-1;ball.x=PW/2;ball.z=PH/2;ball.y=0;ball.vx=ball.vz=ball.vy=0;ball.fire=0;ball.curve=0;ball.last=-1;
 for(const p of pl)if(mine(p))place(p);sfx('whistle')}
function place(p){p.x=clamp(p.home[0],p.team===0?4:PW/2+14,p.team===0?PW/2-14:PW-4);p.z=p.home[1];p.vx=p.vz=0;p.st='';p.stT=0;p.ch=0;p.d=p.team===0?0:Math.PI;
 if(!p.gk&&p.team===koT){const mates=pl.filter(q=>q.team===koT&&!q.gk);const c=mates.slice().sort((a,b)=>Math.abs(a.home[1]-PH/2)+Math.abs(a.home[0]-PW/2)-(Math.abs(b.home[1]-PH/2)+Math.abs(b.home[0]-PW/2)))[0];
  if(c===p){p.x=PW/2-dirX(p.team)*7;p.z=PH/2}}}

/* ---------- your own footballer (runs on its owner's device) ---------- */
function holding(p){return K.isClient()&&p.seat===K.myIdx?G.hold:ball.h===p.n}
function ballView(){if(K.isClient()){const me=pl[seatP[K.myIdx]];if(me&&G.hold)return feet(me);if(G.pred)return G.pred}
 if(ball.h>=0&&pl[ball.h])return feet(pl[ball.h]);return ball}
const feet=p=>({x:p.x+Math.cos(p.d)*4.5,z:p.z+Math.sin(p.d)*4.5,y:0,vx:p.vx,vz:p.vz,vy:0,h:p.n});
function moveP(p,mx,mz,sprint){const f=p.fx;
 if(f.frz>0){p.vx*=.8;p.vz*=.8;return}
 if(p.st==='down'||p.st==='getup'){p.vx*=.85;p.vz*=.85}
 else if(p.st==='slide'){p.vx*=.95;p.vz*=.95}
 else{let sp=1.45*(f.boots>0?1.35:1)*(f.tiny>0?.8:1)*(holding(p)?.92:1);if(sprint&&p.stam>.05&&(mx||mz)){sp*=1.4;p.stam-=.008}else p.stam=Math.min(1,p.stam+.004);
  if(p.dodge>0)sp*=1.7;if(p.gk&&p.dive)sp*=1.9;const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l}
  p.vx+=(mx*sp-p.vx)*.25;p.vz+=(mz*sp-p.vz)*.25;if(l>.2&&p.dodge<=0)p.d=Math.atan2(mz,mx)}
 p.x=clamp(p.x+p.vx,-20,PW+20);p.z=clamp(p.z+p.vz,-16,PH+16);if(p.z>GZ0-3&&p.z<GZ1+3){if(p.x<3&&p.x>-GD-4)p.x=p.z>GZ0+2&&p.z<GZ1-2?3:p.x;if(p.x>PW-3&&p.x<PW+GD+4)p.x=p.z>GZ0+2&&p.z<GZ1-2?PW-3:p.x}const v=Math.hypot(p.vx,p.vz);p.run=v>.15?p.run+v*.13:0;
 if(p.stT>0&&--p.stT===0)p.st=p.st==='slide'||p.st==='down'?'getup':'',p.stT=p.st==='getup'?14:0;
 if(p.dodge>0)p.dodge--;if(p.kc>0)p.kc--;for(const k in f)if(f[k]>0&&k!=='fire'&&k!=='banana')f[k]--;
 for(const q of pl){if(q===p)continue;const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<6&&d>.01){p.x+=dx/d*(6-d)*.5;p.z+=dz/d*(6-d)*.5}}}
function control(p,inp){if(!p)return;
 let mx=(inp.right?1:0)-(inp.left?1:0),mz=(inp.down?1:0)-(inp.up?1:0);
 if(inp.ax!=null&&Math.hypot(inp.ax,inp.ay||0)>.25){mx=inp.ax;mz=inp.ay||0}
 // the camera looks along +z from the near touchline: screen up = +z (away), so W runs up the screen
 mz=-mz;
 moveP(p,mx,mz,inp.b4);
 const hold=holding(p),busy=p.st!==''||p.fx.frz>0;
 if(!hold&&!busy&&p.kc<=0){const b=ballView();if(b.h==null||b.h<0)if(Math.abs(b.x-p.x)<8&&Math.abs(b.z-p.z)<8&&(b.y||0)<7&&Math.hypot(b.x-p.x,b.z-p.z)<7.5)possess(p)}
 const aim=inp.aim!=null?inp.aim:null;
 if(inp.fire&&!busy)p.ch=Math.min(48,p.ch+1);
 if(!inp.fire&&p.fh&&!busy){if(hold){if(p.ch<9)pass(p,aim);else shoot(p,aim,Math.min(1,(p.ch-6)/36),inp)}else if(p.ch<12)tackle(p,false);p.ch=0}
 if(!inp.fire)p.ch=0;p.fh=!!inp.fire;
 if(inp.alt&&!p.ah&&!busy){if(hold)lob(p,aim);else claim(p,'call',0)}p.ah=!!inp.alt;
 if(inp.b3&&!p.qh&&!busy){if(hold){if(p.dodge<=0&&!(p.dc>K.tick)){p.dodge=12;p.dc=K.tick+60}}else{p.st='slide';p.stT=22;p.vx=Math.cos(p.d)*2.8;p.vz=Math.sin(p.d)*2.8}}p.qh=!!inp.b3;
 if(p.st==='slide')for(const q of pl)if(q.team!==p.team&&ball.h===q.n&&dist(p,q)<9&&!(p.slid===ko+'_'+p.stT)){p.slid=ko+'_'+p.stT;tackleOn(p,q,true)}
 for(const it of items)if(!it.got&&Math.hypot(it.x-p.x,it.z-p.z)<9){it.got=1;claim(p,'i',it.id)}}
function possess(p){p.kc=6;if(K.isClient()){G.hold=true;claim(p,'p',0)}else{ball.h=p.n;ball.last=p.n;ball.fire=p.fx.fire?ball.fire:0}sfx('pick')}
function kickBall(p,ang,sp,vy,kind){const b=feet(p),f=p.fx;let fire=0,curve=0;
 if(kind==='shot'&&f.fire>0){fire=1;f.fire=0;sp*=1.15}if(kind==='shot'&&f.banana>0){curve=(Math.random()<.5?-1:1)*.022;f.banana=0}if(f.tiny>0)sp*=.7;
 const k={x:b.x,z:b.z,y:1,vx:Math.cos(ang)*sp,vz:Math.sin(ang)*sp,vy,fire,curve};p.kc=14;sfx('kick');
 if(K.isClient()){G.hold=false;G.kickSeq++;G.kicks.push([G.kickSeq,Math.round(k.x*10)/10,Math.round(k.z*10)/10,Math.round(k.vx*100)/100,Math.round(k.vz*100)/100,Math.round(k.vy*100)/100,fire,curve]);if(G.kicks.length>6)G.kicks.shift();
  G.pred=Object.assign({h:-1,last:p.n},k)}
 else applyKick(p,k)}
function applyKick(p,k){Object.assign(ball,{h:-1,x:k.x,z:k.z,y:k.y,vx:k.vx,vz:k.vz,vy:k.vy,fire:k.fire,curve:k.curve,last:p.n,kt:K.tick});if(k.fire)K.fx('fi',p.n)}
function goalAim(p,ang,inp){const gx=attackX(p.team),ga=Math.atan2(PH/2-p.z,gx-p.x);if(ang!=null&&Math.abs(Math.atan2(Math.sin(ang-ga),Math.cos(ang-ga)))>1.2)return ang;
 const up=inp&&inp.up,dn=inp&&inp.down,tz=PH/2+(up?-24:dn?24:(Math.random()-.5)*(inp?40:64));return Math.atan2(tz-p.z,gx-p.x)}
function shoot(p,aim,pow,inp){const ang=goalAim(p,aim!=null?aim:p.d,inp);kickBall(p,ang+(Math.random()-.5)*.08*(1-pow*.5),4.4+pow*3.4,.35+pow*1.6,'shot')}
function lob(p,aim){const ang=aim!=null?aim:p.d,m=mate(p,ang);let a=ang,sp=3.6;if(m){a=Math.atan2(m.z-p.z,m.x-p.x);sp=clamp(dist(p,m)/48,2.4,4.6)}kickBall(p,a,sp,3.2,'lob')}
function pass(p,aim){const ang=aim!=null?aim:p.d,m=mate(p,ang);if(!m){kickBall(p,ang,4.2,.15,'pass');return}
 const lx=m.x+m.vx*14,lz=m.z+m.vz*14,d=Math.hypot(lx-p.x,lz-p.z);kickBall(p,Math.atan2(lz-p.z,lx-p.x),clamp(d/50,2.4,6.4),.1,'pass')}
function mate(p,ang){let best=null,bs=-1e9;for(const q of pl){if(q===p||q.team!==p.team)continue;const d=dist(p,q);if(d<12||d>300)continue;
  const a=Math.atan2(q.z-p.z,q.x-p.x),da=Math.abs(Math.atan2(Math.sin(a-ang),Math.cos(a-ang)));if(da>1.1)continue;
  let sc=-da*90-d*.15+(q.x-p.x)*dirX(p.team)*.15;for(const o of pl)if(o.team!==p.team){const t=((o.x-p.x)*(q.x-p.x)+(o.z-p.z)*(q.z-p.z))/(d*d);if(t>0&&t<1){const ex=p.x+(q.x-p.x)*t-o.x,ez=p.z+(q.z-p.z)*t-o.z;if(Math.hypot(ex,ez)<10)sc-=40}}
  if(q.seat>=0)sc+=10;if(sc>bs){bs=sc;best=q}}return best}
function tackle(p){const v=pl.find(q=>q.team!==p.team&&ball.h===q.n&&dist(p,q)<12);if(v)tackleOn(p,v,false)}
function tackleOn(p,v,slide){if(K.isClient())claim(p,'t',v.n,slide?1:0);else resolveTackle(p,v,slide)}
function claim(p,k,a,b){if(!K.isClient()){resolve(p,[0,k,a,b]);return}G.cseq++;G.claims.push([G.cseq,k,a,b|0]);if(G.claims.length>10)G.claims.shift()}

/* ---------- host: the referee ---------- */
function resolve(p,[,k,a,b]){
 if(k==='p'){if(ball.h<0&&Math.hypot(ball.x-p.x,ball.z-p.z)<18&&ball.y<9&&!(ball.last===p.n&&K.tick-ball.kt<8)&&cel===0){ball.h=p.n;ball.last=p.n}}
 else if(k==='t'){const v=pl[a];if(v)resolveTackle(p,v,!!b)}
 else if(k==='i'){const it=items.find(x=>x.id===a);if(it&&!it.dead){it.dead=1;powerUp(p,it.k)}}
 else if(k==='call'){const h=pl[ball.h];if(h&&h.team===p.team&&h!==p&&h.seat<0&&!h.gk)h.callTo=p.n;say(p,'PASS!','#ffffff')}}
function resolveTackle(p,v,slide){if(v.gk||ball.h!==v.n||dist(p,v)>(slide?16:14))return;if(!slide&&Math.random()<.45){say(v,'NICE SKILL!','#c0e0ff');return}
 if(ownerOf(v)==='net')send(v,'lose');
 if(!slide&&ownerOf(p)!=='net'){ball.h=p.n;ball.last=p.n;p.hold=0;sfx('shot');return}
 let a=p.d;if(Math.cos(a)*dirX(p.team)<0)a=Math.PI-a;ball.h=-1;ball.x=v.x;ball.z=v.z;ball.vx=Math.cos(a)*1.8;ball.vz=Math.sin(a)*1.8;ball.vy=.6;ball.last=p.n;ball.kt=K.tick-12;
 if(slide){send(v,'down');say(v,'TACKLE!','#f8d040')}sfx('shot')}
function send(q,kind){if(ownerOf(q)==='net'){q.evSeq++;q.ev.push([q.evSeq,kind]);if(q.ev.length>6)q.ev.shift()}else onEv(q,kind)}
function onEv(p,kind){if(kind==='lose'){if(K.isClient())G.hold=false;return}if(kind==='down'){p.st='down';p.stT=40;p.ch=0;if(K.isClient())G.hold=false}else if(kind==='frz')p.fx.frz=130;else if(kind==='tiny')p.fx.tiny=480}
function powerUp(p,k){const it=ITEMS[k];say(p,it.n,it.c);sfx('pick');const t=p.team,rv=pl.filter(q=>q.team!==t);
 if(k<=4){if(ownerOf(p)==='net')send(p,'it'+k);else selfItem(p,k)}
 else if(k===5){gkBig[t]=720}else if(k===6){for(const q of rv)send(q,'frz')}else if(k===7)wall[t]=480;else if(k===8)for(const q of rv)send(q,'tiny')}
function selfItem(p,k){const f=p.fx;if(k===1)f.boots=600;else if(k===2)f.fire=1;else if(k===3)f.banana=1;else if(k===4)f.mag=600}
const _onEv=onEv;onEv=function(p,kind){if(/^it\d$/.test(kind))selfItem(p,+kind[2]);else _onEv(p,kind)};
function readUpload(p,r){if(typeof r.x!=='number')return;p.x=r.x;p.z=r.z;p.d=r.d;p.vx=r.vx||0;p.vz=r.vz||0;p.st=r.s||'';p.fl=r.f|0;p.run=r.r||0;p.ch=r.c|0;
 for(const e of r.cl||[])if((e[0]|0)>p.cack){p.cack=e[0]|0;resolve(p,e)}
 for(const e of r.k||[])if((e[0]|0)>p.kack){p.kack=e[0]|0;if(ball.h===p.n||ball.h<0&&ball.last===p.n&&K.tick-ball.kt<30)applyKick(p,{x:e[1],z:e[2],y:1,vx:e[3],vz:e[4],vy:e[5],fire:e[6],curve:e[7]})}}
function ballStep(b,host){if(b.h>=0)return;
 if(b.curve){const c=Math.cos(b.curve),s=Math.sin(b.curve),vx=b.vx*c-b.vz*s;b.vz=b.vx*s+b.vz*c;b.vx=vx;b.curve*=.985}
 if(host)for(const p of pl)if(p.fx.mag>0||p.fl&16){const dx=p.x-b.x,dz=p.z-b.z,d=Math.hypot(dx,dz);if(d<80&&d>4){b.vx+=dx/d*.07;b.vz+=dz/d*.07}}
 b.x+=b.vx;b.z+=b.vz;b.y+=b.vy;if(b.y>0){b.vy-=.2;b.vx*=.996;b.vz*=.996}else{b.y=0;if(b.vy<-.9){b.vy=-b.vy*.52;if(host)sfx('kick')}else b.vy=0;b.vx*=.982;b.vz*=.982}
 b.spin=(b.spin||0)+Math.hypot(b.vx,b.vz)*.35;
 // goal frames: posts and crossbar
 for(const gx of[0,PW]){if(Math.abs(b.x-gx)<3){for(const pz of[GZ0,GZ1])if(Math.abs(b.z-pz)<3&&b.y<GH){b.vz=-b.vz*.7;b.vx=-b.vx*.5;b.x+=b.vx;if(host)sfx('shot')}
  if(b.z>GZ0&&b.z<GZ1&&Math.abs(b.y-GH)<2.5){b.vy=-Math.abs(b.vy)*.6;b.vx=-b.vx*.4;if(host)sfx('shot')}}}
 const inMouth=b.z>GZ0&&b.z<GZ1&&b.y<GH;
 for(const t of[0,1])if(wall[t]>0&&inMouth){const gx=t===0?0:PW;if(Math.abs(b.x-gx)<4){b.vx=-b.vx*.8;b.x=gx+(t===0?4:-4)}}
 if(b.x<0||b.x>PW){if(inMouth||b.x<-GD+2||b.x>PW+GD-2){if(b.x<-GD+2){b.x=-GD+2;b.vx=0}if(b.x>PW+GD-2){b.x=PW+GD-2;b.vx=0}}
  else if(K.S.walls==='on'||!host){b.x=b.x<0?0:PW;b.vx=-b.vx*.6}else out(b)}
 if(b.z<0||b.z>PH){if(b.x>0&&b.x<PW||!inMouth){if(K.S.walls==='on'||!host){b.z=b.z<0?0:PH;b.vz=-b.vz*.6}else out(b)}}}
function out(b){const last=pl[b.last],t=last?1-last.team:0,q=pl.filter(p=>p.team===t&&!p.gk).sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z))[0];
 b.x=clamp(b.x,2,PW-2);b.z=clamp(b.z,2,PH-2);b.vx=b.vz=b.vy=0;b.y=0;if(q){b.h=q.n;b.last=q.n;say(q,'THROW-IN','#ffffff')}sfx('whistle')}
function step(){if(K.tick===2)music();const S=K.S;
 for(const p of pl){if(ownerOf(p)==='net'){const r=K.remote(p.seat);if(r)readUpload(p,r);continue}
  if(p.seat>=0&&K.seats[p.seat].ctrl!=='cpu')control(p,K.inp(p.seat));else{ai(p);for(const it of items)if(!it.dead&&Math.hypot(it.x-p.x,it.z-p.z)<9){it.dead=1;powerUp(p,it.k)}}}
 if(cel>0){if(--cel===0)kickoff(lastGoal);}
 else{ballStep(ball,true);
  if(ball.h<0){// keepers grab, players nearby collect a loose ball
   for(const p of pl){if(p.st||p.fx.frz>0)continue;const reach=p.gk?(gkBig[p.team]>0?17:11):7;
    if(Math.hypot(ball.x-p.x,ball.z-p.z)<reach&&ball.y<(p.gk?(gkBig[p.team]>0?28:18):7)&&!(ball.last===p.n&&K.tick-ball.kt<12)){
     if(p.gk&&(Math.abs(p.x-(p.team===0?0:PW))>70))continue;
     if(ownerOf(p)==='net')continue;   // guests collect the ball themselves (claim)
     if(p.gk&&ball.fire){ball.vx=-ball.vx*.35;ball.vz=(Math.random()-.5)*3;ball.vy=1.5;ball.fire=0;say(p,'OUCH!','#ff8040');continue}
     if(p.seat>=0&&mine(p)&&K.seats[p.seat].ctrl!=='cpu')continue;   // local humans pick it up in control()
     ball.h=p.n;ball.last=p.n;ball.fire=0;p.hold=0;if(p.gk)say(p,'SAVED!','#f8d040');break}}
   if(ball.fire)for(const p of pl)if(!p.gk&&p.n!==ball.last&&Math.hypot(ball.x-p.x,ball.z-p.z)<6&&ball.y<10&&p.st!=='down'){send(p,'down');ball.vx*=.7;ball.vz*=.7}}
  const gl=goalCheck();if(gl!=null)goal(gl)}
 for(const t of[0,1]){if(wall[t]>0)wall[t]--;if(gkBig[t]>0)gkBig[t]--}
 if(S.items!=='off'&&K.tick%540===270&&items.length<3&&cel===0){const r=Math.random();let k=1+Math.floor(r*5);if(S.items==='party'&&Math.random()<.45)k=6+Math.floor(Math.random()*3);
  items.push({id:nextId++,k,x:80+Math.random()*(PW-160),z:40+Math.random()*(PH-80),t:900})}
 for(const it of items)it.t--;items=items.filter(it=>!it.dead&&it.t>0);
 vis();
 const lim=S.len*3600;if(lim&&K.tick>=lim&&cel===0){if(score[0]!==score[1]||S.gold!=='on'){finish();return}if(!golden){golden=true;say({x:PW/2,z:PH/2},'GOLDEN GOAL!','#f8d040');K.track(3);K.fx('gg')}}}
function goalCheck(){if(ball.h>=0||ball.z<=GZ0||ball.z>=GZ1||ball.y>=GH)return null;if(ball.x<-1&&!wall[0])return 1;if(ball.x>PW+1&&!wall[1])return 0;return null}
function goal(t){score[t]++;const s=pl[ball.last],own=s&&s.team!==t;if(s&&!own)s.goals++;lastGoal=1-t;cel=170;
 const nm=s?(own?'OWN GOAL · '+s.name:s.name):'';K.fx('g',t,s?s.n:-1,own?1:0);celebrate(t,nm);
 if(golden){finish();return}}
function celebrate(t,nm){sfx('roar');shake=6;texts.push({x:PW/2,z:PH/2,y:0,big:'GOAL!',s:nm,col:TEAMC[t],t:150});for(let k=0;k<70;k++)parts.push({x:t===0?PW:0,z:PH/2+(Math.random()-.5)*60,y:10+Math.random()*10,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*3,vy:Math.random()*2.5,t:90,col:k%3?TEAMC[t]:'#ffffff'})}
function finish(){const w=score[0]>score[1]?0:score[1]>score[0]?1:-1;
 if(K.mode===1)K.end({coop:w===0?1:0,name:w===0?'YOU WIN '+score[0]+'-'+score[1]+'!':w<0?'DRAW '+score[0]+'-'+score[1]:'CPU WINS '+score[1]+'-'+score[0]});
 else K.end(w<0?null:{team:w,name:TEAMN[w]+' '+score[w]+'-'+score[1-w]})}
function music(){K.track(1+Math.floor(Math.random()*2))}
function say(p,s,col){texts.push({x:p.x,z:p.z,y:24,s,col,t:70})}
function vis(){for(const q of parts){q.x+=q.vx;q.z+=q.vz;q.y=Math.max(0,q.y+q.vy);q.vy-=.07;q.t--}parts=parts.filter(q=>q.t>0);if(parts.length>400)parts.splice(0,parts.length-400);
 for(const t of texts){t.t--;if(!t.big)t.y+=.2}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.9;
 const b=ballView();if(b.fire||ball.fire&&ball.h<0)parts.push({x:b.x,z:b.z,y:(b.y||0)+2,vx:(Math.random()-.5)*.3,vz:(Math.random()-.5)*.3,vy:.3,t:16,col:Math.random()<.5?'#ff8020':'#f8e040'})}

/* ---------- CPU footballers and keepers ---------- */
function ai(p){const b=ballView(),t=p.team,dx=dirX(t),gx=attackX(t),own=t===0?0:PW,lvl=K.mode===1&&t===1?K.cpu:Math.max(1,K.cpu);let mx=0,mz=0,spr=false;
 const go=(x,z,stop)=>{const ddx=x-p.x,ddz=z-p.z,d=Math.hypot(ddx,ddz);if(d>(stop||3)){mx=ddx/d;mz=ddz/d;if(d<14){mx*=d/14;mz*=d/14}}return d};
 if(p.st==='down'||p.st==='getup'||p.fx.frz>0){moveP(p,0,0,false);return}
 if(p.gk){if(ball.h===p.n){p.hold=(p.hold|0)+1;if(p.hold>55){const m=mate(p,dx>0?0:Math.PI)||pl.find(q=>q.team===t&&!q.gk);if(m)pass(p,Math.atan2(m.z-p.z,m.x-p.x));else kickBall(p,dx>0?0:Math.PI,5.5,2.4,'pass')}moveP(p,0,0,false);return}
  const near=Math.hypot(b.x-own,b.z-PH/2),loose=ball.h<0,hd=ball.h>=0?pl[ball.h]:null;
  if(hd&&hd.team!==t&&near<60){go(hd.x,hd.z,1);moveP(p,mx*1.2,mz*1.2,true);if(dist(p,hd)<9&&Math.random()<[.05,.08,.12][lvl]){ball.h=p.n;ball.last=p.n;p.hold=0;say(p,'GRABBED!','#f8d040');if(ownerOf(hd)==='net')send(hd,'lose')}return}let tx=own+dx*(near<140?10:6),tz=clamp(b.z,GZ0+3,GZ1-3);
  if(loose&&near<70&&Math.hypot(b.x-p.x,b.z-p.z)<50){tx=b.x+b.vx*4;tz=b.z+b.vz*4}
  p.dive=false;if(loose&&Math.abs(b.vx)>1.5&&Math.sign(b.vx)===-dx){const tt=(own-b.x)/b.vx;if(tt>0&&tt<60){tz=clamp(b.z+b.vz*tt,GZ0-6,GZ1+6);spr=true;p.dive=Math.random()<[.75,.85,.92][lvl]}}
  go(clamp(tx,own===0?-4:PW-60,own===0?60:PW+4),tz,1);moveP(p,mx*(spr?1.3:1),mz*(spr?1.3:1),spr);return}
 const hold=ball.h===p.n,teamBall=ball.h>=0&&pl[ball.h]&&pl[ball.h].team===t;
 if(hold){p.hold=(p.hold|0)+1;const dg=Math.hypot(gx-p.x,PH/2-p.z);
  if(p.callTo!=null&&pl[p.callTo]){const m=pl[p.callTo];p.callTo=null;pass(p,Math.atan2(m.z-p.z,m.x-p.x));moveP(p,0,0,false);return}
  const opp=pl.filter(q=>q.team!==t&&!q.gk&&dist(p,q)<30&&((q.x-p.x)*dx>-4));
  if(dg<60||dg<[85,105,125][lvl]&&Math.random()<.03+lvl*.015){shoot(p,null,.5+Math.random()*.5,null);moveP(p,0,0,false);return}
  if(opp.length&&p.hold>12&&Math.random()<[.03,.06,.09][lvl]){const m=mate(p,Math.atan2(PH/2-p.z,gx-p.x))||mate(p,dx>0?0:Math.PI);if(m){pass(p,Math.atan2(m.z-p.z,m.x-p.x));moveP(p,0,0,false);return}}
  let a=Math.atan2(PH/2-p.z,gx-p.x);const o=opp.sort((q,r)=>dist(p,q)-dist(p,r))[0];if(o){const ao=Math.atan2(o.z-p.z,o.x-p.x);a+=(Math.sin(a-ao)>0?.7:-.7)}
  if(p.z<20)a+=.4*dx;if(p.z>PH-20)a-=.4*dx;mx=Math.cos(a);mz=Math.sin(a);moveP(p,mx,mz,lvl>0&&!opp.length);return}
 p.hold=0;
 // the closest outfield player of the team (human or not) presses the ball; a second one helps when the rivals have it
 const order=pl.filter(q=>q.team===t&&!q.gk).sort((q,r)=>Math.hypot(q.x-b.x,q.z-b.z)-Math.hypot(r.x-b.x,r.z-b.z)),rank=order.indexOf(p);
 const chase=!teamBall&&(rank===0||rank===1&&ball.h>=0&&!teamBall&&lvl>=1||order[0]&&order[0].seat>=0&&rank===1);
 if(chase){const lead=ball.h<0?8:4,d=go(b.x+(b.vx||0)*lead,b.z+(b.vz||0)*lead,1);spr=d>40;
  const h=ball.h>=0?pl[ball.h]:null;if(h&&h.team!==t&&dist(p,h)<10&&Math.random()<[.02,.05,.09][lvl]){if(Math.random()<.4){p.st='slide';p.stT=22;p.vx=Math.cos(p.d)*2.8;p.vz=Math.sin(p.d)*2.8;resolveTackle(p,h,true)}else resolveTackle(p,h,false)}}
 else{const shift=(b.x-PW/2)*.45+(teamBall?dx*45:-dx*15);let hx=clamp(p.home[0]+shift,8,PW-8),hz=clamp(p.home[1]+(b.z-PH/2)*.3,10,PH-10);
  if(teamBall&&p.home[0]*dx>(dx>0?PW*.3:-PW*.7))hx=clamp(hx+dx*30,8,PW-8);go(hx,hz,5)}
 moveP(p,mx,mz,spr)}
function bot(i){return{}}

/* ---------- guests ---------- */
function local(i){const p=pl[seatP[i]];if(!p)return;if(ko!==G.koSeen){G.koSeen=ko;place(p);G.hold=false;G.pred=null}
 control(p,K.inp(i));if(G.pred){ballStep(G.pred,false);if(K.tick-(G.pred.at||(G.pred.at=K.tick))>45)G.pred=null}}
function upload(i){const p=pl[seatP[i]];if(!p)return null;
 return{x:Math.round(p.x*10)/10,z:Math.round(p.z*10)/10,d:Math.round(p.d*100)/100,vx:Math.round(p.vx*100)/100,vz:Math.round(p.vz*100)/100,s:p.st,r:Math.round(p.run*10)/10,c:p.ch,
  f:(p.fx.boots>0?1:0)|(p.fx.fire?2:0)|(p.fx.banana?4:0)|(p.fx.frz>0?8:0)|(p.fx.mag>0?16:0)|(p.fx.tiny>0?32:0),cl:G.claims,k:G.kicks}}
const flagsOf=p=>p.fl!=null&&ownerOf(p)==='net'?p.fl:(p.fx.boots>0?1:0)|(p.fx.fire?2:0)|(p.fx.banana?4:0)|(p.fx.frz>0?8:0)|(p.fx.mag>0?16:0)|(p.fx.tiny>0?32:0);
function snap(){return{p:pl.map(p=>[Math.round(p.x),Math.round(p.z),Math.round(p.d*100),Math.round(p.run*10),({'':0,slide:1,down:2,getup:3})[p.st]|0,flagsOf(p),p.goals,p.ch|0]),
 b:[ball.h,Math.round(ball.x*10),Math.round(ball.z*10),Math.round(ball.y*10),Math.round(ball.vx*100),Math.round(ball.vz*100),Math.round(ball.vy*100),ball.fire|0,ball.last],
 s:score,ko,kt:koT,ce:cel,gg:golden?1:0,w:wall,gb:gkBig.map(v=>v>0?1:0),it:items.map(it=>[it.id,it.k,Math.round(it.x),Math.round(it.z)]),
 h:pl.filter(p=>ownerOf(p)==='net').map(p=>[p.n,p.cack,p.kack,p.ev])}}
function apply(g){const me=K.myIdx>=0?pl[seatP[K.myIdx]]:null;score=g.s||score;koT=g.kt|0;cel=g.ce|0;golden=!!g.gg;wall=g.w||wall;gkBig=(g.gb||[0,0]).map(v=>v?1:0);
 (g.p||[]).forEach((a,n)=>{const p=pl[n];if(!p)return;p.goals=a[6]|0;if(p===me)return;p.tx=a[0];p.tz=a[1];p.d=a[2]/100;p.run=a[3]/10;p.st=['','slide','down','getup'][a[4]|0];p.fl=a[5]|0;p.ch=a[7]|0;if(p.gx==null){p.x=p.tx;p.z=p.tz;p.gx=1}});
 const B=g.b||[];ball.h=B[0]|0;ball.last=B[8]|0;const nb={x:B[1]/10,z:B[2]/10,y:B[3]/10,vx:B[4]/100,vz:B[5]/100,vy:B[6]/100};ball.fire=B[7]|0;
 if(ball.h<0){if(Math.hypot(nb.x-ball.x,nb.z-ball.z)>24||ball.h!==ball.ph)Object.assign(ball,nb);else{ball.tx=nb.x;ball.tz=nb.z;ball.vx=nb.vx;ball.vz=nb.vz;ball.vy=nb.vy;ball.y+=(nb.y-ball.y)*.5}}else Object.assign(ball,nb);ball.ph=ball.h;
 const im=new Map(items.map(i=>[i.id,i]));items=(g.it||[]).map(r=>({id:r[0],k:r[1],x:r[2],z:r[3],got:im.get(r[0])&&im.get(r[0]).got}));
 for(const r of g.h||[]){if(!me||r[0]!==me.n)continue;
  for(const e of r[3]||[])if((e[0]|0)>G.evSeen){G.evSeen=e[0]|0;onEv(me,e[1])}
  if(ball.h===me.n)G.hold=true;else if(G.hold&&(r[1]|0)>=G.claimLast())G.hold=false;
  if(G.pred&&(r[2]|0)>=G.kickSeq&&K.tick-(G.pred.at||0)>4)G.pred=null}
 if(typeof g.ko==='number'&&g.ko!==ko){ko=g.ko}}
G.claimLast=()=>{let m=0;for(const c of G.claims)if(c[1]==='p')m=c[0];return m};
function follow(){for(const p of pl){if(p.tx==null||K.myIdx>=0&&p.n===seatP[K.myIdx])continue;const dx=p.tx-p.x,dz=p.tz-p.z;if(Math.hypot(dx,dz)>40){p.x=p.tx;p.z=p.tz}else{p.x+=dx*.35;p.z+=dz*.35}}
 if(ball.h<0){ballStep(ball,false);if(ball.tx!=null){ball.x+=(ball.tx-ball.x)*.25;ball.z+=(ball.tz-ball.z)*.25;ball.tx+=ball.vx;ball.tz+=ball.vz}}
 if(cel>0)cel--;vis()}
function onFx(k,a){if(k==='g'){const s=pl[a[1]];celebrate(a[0],s?(a[2]?'OWN GOAL · ':'')+s.name:'')}else if(k==='gg'){K.track(3)}else if(k==='fi')sfx('boom')}

/* ---------- drawing ---------- */
const CAM={x:PW/2,F:345,HF:82800,hor:-75,W:384,H:216,shx:0,shy:0};
function proj(x,z){const f=z-CZ;if(f<10)return null;const s=CAM.F/f;return{x:CAM.W/2+(x-CAM.x)*s+CAM.shx,y:CAM.hor+CAM.HF/f+CAM.shy,s,f}}
function aim(i,fx,fy){const p=pl[seatP[i]];if(!p)return null;const sx=fx*CAM.W,sy=fy*CAM.H,f=CAM.HF/Math.max(4,sy-CAM.hor),x=CAM.x+(sx-CAM.W/2)*f/CAM.F,z=CZ+f;return Math.atan2(z-p.z,x-p.x)}
function render(g,W,H){const tex=pitchTex(),b=ballView();
 const fn=-CZ,ff=PH-CZ,HF=(.73*H)/(1/fn-1/ff),F=1.15*fn*H/216*(W/H>2.2?1.15:1);CAM.W=W;CAM.H=H;CAM.F=F;CAM.HF=HF;CAM.hor=.93*H-HF/fn;
 const half=W/2*(-CZ+PH/2)/F;const tx=clamp(b.x,half-50,PW-half+50);CAM.x+=(tx-CAM.x)*.08;if(Math.abs(tx-CAM.x)>200)CAM.x=tx;
 CAM.shx=shake>.3?(Math.random()-.5)*shake:0;CAM.shy=shake>.3?(Math.random()-.5)*shake:0;
 g.fillStyle='#14161f';g.fillRect(0,0,W,H);
 const fr=2;g.save();g.scale(1/fr,1/fr);RA.fx.floor7(g,tex,{x:CAM.x+OX-CAM.shx*0,z:CZ+OZ,angle:0,height:HF/F,fov:F*fr,horizon:CAM.hor*fr},Math.round(CAM.shx*fr),Math.round(CAM.shy*fr),Math.round(W*fr),Math.round(H*fr));g.restore();
 // the stand behind the far touchline
 const sz=PH+46,sp=proj(-280,sz),se=proj(PW+280,sz);if(sp&&se){const st=standImg(),hh=150*sp.s,jump=texts.some(t=>t.big)?Math.sin(K.tick*.5)*1.5*sp.s:0;g.drawImage(st,sp.x,sp.y-hh+jump,se.x-sp.x,hh)}
 // depth-sorted things on the pitch
 const L=[];for(const p of pl){const q=proj(p.x,p.z);if(q)L.push([q.f,0,p,q])}
 {const q=proj(b.x,b.z);if(q)L.push([q.f-.5,1,b,q])}
 for(const it of items){if(it.got)continue;const q=proj(it.x,it.z);if(q)L.push([q.f,2,it,q])}
 for(const gx of[0,PW]){L.push([GZ1-CZ+1,3,{gx,back:1}]);L.push([GZ0-CZ-1,3,{gx,back:0}])}
 for(const q of parts){const pq=proj(q.x,q.z);if(pq)L.push([pq.f,4,q,pq])}
 L.sort((a,c)=>c[0]-a[0]);
 for(const[,ty,o,q]of L){
  if(ty===0)drawMan(g,o,q);
  else if(ty===1){const r=2.6*q.s,y=q.y-(o.y||0)*q.s;RA.fx.shadow(g,q.x,q.y,Math.max(1,r*.9),.45);g.drawImage(ballImg(Math.floor((ball.spin||0))&3),q.x-r,y-r*2,r*2,r*2);
   if(o.fire||ball.fire&&ball.h<0)RA.fx.light(g,q.x,y-r,r*2.4,'#ff7020',.5)}
  else if(ty===2){const it=ITEMS[o.k],bob=Math.sin(K.tick*.1+o.id)*1.5,y=q.y-(9+bob)*q.s,r=4.5*q.s;RA.fx.shadow(g,q.x,q.y,r*.7,.35);RA.fx.light(g,q.x,y,r*2.2,it.c,.3);
   const gr=g.createRadialGradient(q.x-r*.3,y-r*.3,1,q.x,y,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,it.c);gr.addColorStop(1,mix(it.c,'#000000',.5));g.fillStyle=gr;g.beginPath();g.arc(q.x,y,r,0,7);g.fill();
   if(q.s>.5){g.fillStyle='#fff';g.font=Math.round(r*1.1)+'px "Russo One",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('★',q.x,y+.5)}}
  else if(ty===3)drawGoal(g,o.gx,o.back);
  else{g.globalAlpha=Math.min(1,o.t/20);g.fillStyle=o.col;const sz=Math.max(.8,1.4*q.s);g.fillRect(q.x-sz/2,q.y-o.y*q.s-sz/2,sz,sz);g.globalAlpha=1}}
 // big texts and floating names
 for(const t of texts){if(t.big)continue;const q=proj(t.x,t.z);if(q)RA.gfx.text(g,t.s,q.x,q.y-t.y*q.s,t.col)}
 // your own player off screen: an arrow on the edge pointing at them
 for(const p of pl){if(p.seat<0||K.demo)continue;const loc=K.isClient()?p.seat===K.myIdx:K.seats[p.seat]&&!['cpu','net'].includes(K.seats[p.seat].ctrl);if(!loc)continue;
  const q=proj(p.x,p.z);if(!q||q.x>4&&q.x<W-4)continue;const x=q.x<4?10:W-10,y=clamp(q.y-12,40,H-30),d=q.x<4?-1:1;
  g.fillStyle=p.col;g.beginPath();g.moveTo(x+d*6,y);g.lineTo(x-d*2,y-6);g.lineTo(x-d*2,y+6);g.fill();RA.gfx.text(g,p.name,x-d*16,y-4,p.col)}
 hud(g,W,H)}
function drawGoal(g,gx,back){const d=gx===0?-GD:GD,P=(x,z,y)=>{const q=proj(x,z);return q?[q.x,q.y-y*q.s]:null};
 const a=P(gx,GZ0,0),b=P(gx,GZ1,0),c=P(gx,GZ0,GH),e=P(gx,GZ1,GH),ba=P(gx+d,GZ0,0),bb=P(gx+d,GZ1,0),bc=P(gx+d*.7,GZ0,GH*.85),be=P(gx+d*.7,GZ1,GH*.85);if(!a||!b)return;
 const t=gx===0?0:1;
 if(back){g.fillStyle='rgba(235,240,255,.12)';g.beginPath();g.moveTo(...be);g.lineTo(...bb);g.lineTo(...ba);g.lineTo(...bc);g.closePath();g.fill();
  g.beginPath();g.moveTo(...e);g.lineTo(...be);g.lineTo(...bb);g.lineTo(...b);g.closePath();g.fill();g.beginPath();g.moveTo(...c);g.lineTo(...e);g.lineTo(...be);g.lineTo(...bc);g.closePath();g.fill();
  g.strokeStyle='rgba(240,240,255,.35)';g.lineWidth=.4;for(let k=1;k<8;k++){const z=GZ0+(GZ1-GZ0)*k/8,p1=P(gx,z,GH),p2=P(gx+d*.7,z,GH*.85),p3=P(gx+d,z,0);g.beginPath();g.moveTo(...p1);g.lineTo(...p2);g.lineTo(...p3);g.stroke()}
  for(let k=1;k<5;k++){const y=GH*.85*k/5,p1=P(gx+d*.7+(d*.3)*(1-k/5),GZ0,y),p2=P(gx+d*.7+(d*.3)*(1-k/5),GZ1,y);g.beginPath();g.moveTo(...p1);g.lineTo(...p2);g.stroke()}
  if(wall[t]>0){g.fillStyle='#a04830';g.beginPath();g.moveTo(...a);g.lineTo(...b);g.lineTo(...e);g.lineTo(...c);g.closePath();g.fill();g.strokeStyle='#d8c0a0';g.lineWidth=.5;
   for(let k=1;k<6;k++){const y=GH*k/6,p1=P(gx,GZ0,y),p2=P(gx,GZ1,y);g.beginPath();g.moveTo(...p1);g.lineTo(...p2);g.stroke()}}
  post(g,b,e,ca(gx,GZ1));return}
 post(g,a,c,ca(gx,GZ0));const s=proj(gx,PH/2).s;g.strokeStyle='#f4f4f4';g.lineWidth=Math.max(1,1.6*s);g.beginPath();g.moveTo(...c);g.lineTo(...e);g.stroke()}
const ca=(x,z)=>proj(x,z).s;
function post(g,a,c,s){g.strokeStyle='#202020';g.lineWidth=Math.max(1.2,2*s);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(c[0],c[1]);g.stroke();g.strokeStyle='#f8f8f8';g.lineWidth=Math.max(.8,1.5*s);g.stroke()}
function drawMan(g,p,q){const t=p.team,big=p.gk&&gkBig[t]>0,fl=flagsOf(p),tiny=fl&32?.7:1,sc=q.s*.86*(big?1.6:1)*tiny;
 const rel=p.d-Math.PI/2,di=((Math.round(rel/(Math.PI*2)*8)%8)+8)%8,moving=p.run>0,fr=p.st==='slide'||p.st==='down'?1:moving?Math.floor(p.run)%4:4;
 const img=manImg(p.gk?GKC[t]:TEAMC[t],SHORTS[t],di,fr,p.gk),w=16*sc,h=24*sc;
 if(p.seat>=0){g.strokeStyle=p.col;g.lineWidth=Math.max(.8,1.2*q.s);g.beginPath();g.ellipse(q.x,q.y,6*q.s,2.6*q.s,0,0,7);g.stroke()}
 RA.fx.shadow(g,q.x,q.y,Math.max(1,4.5*q.s*(big?1.5:1)),.38);
 if(fl&8)g.globalAlpha=.7;
 if(p.st==='slide'||p.st==='down'){g.save();g.translate(q.x,q.y-h*.25);g.rotate((Math.cos(p.d)>=0?1:-1)*1.3);g.drawImage(img,-w/2,-h/2,w,h);g.restore()}
 else g.drawImage(img,q.x-w/2,q.y-h*.94,w,h);g.globalAlpha=1;
 if(fl&8){g.fillStyle='rgba(170,230,255,.45)';g.fillRect(q.x-w*.4,q.y-h*.9,w*.8,h*.9)}
 if(fl&1&&K.tick%4===0)parts.push({x:p.x,z:p.z,y:1,vx:-p.vx*.2,vz:-p.vz*.2,vy:.2,t:12,col:'#60e8ff'});
 if(fl&2)RA.fx.light(g,q.x,q.y-h*.1,4*q.s,'#ff6020',.4);
 // names over humans, an arrow over your own player, a power bar while charging
 const local=!K.demo&&p.seat>=0&&(K.isClient()?p.seat===K.myIdx:K.seats[p.seat]&&K.seats[p.seat].ctrl!=='cpu'&&K.seats[p.seat].ctrl!=='net');
 if(p.seat>=0&&!K.demo){RA.gfx.text(g,p.name,q.x,q.y-h-9,p.col)}
 if(local){g.fillStyle=p.col;g.beginPath();g.moveTo(q.x-3,q.y-h-3);g.lineTo(q.x+3,q.y-h-3);g.lineTo(q.x,q.y-h+.5);g.fill()}
 if(p.ch>9){const k=Math.min(1,(p.ch-6)/36);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(q.x-9,q.y+3,18,3);const pg=g.createLinearGradient(q.x-9,0,q.x+9,0);pg.addColorStop(0,'#40f080');pg.addColorStop(.6,'#f8e040');pg.addColorStop(1,'#ff3020');g.fillStyle=pg;g.fillRect(q.x-9,q.y+3,18*k,3)}}
function txt(g,s,x,y,size,col,align){g.save();g.font=size+'px "Russo One","Arial Black",sans-serif';g.textAlign=align||'center';g.textBaseline='middle';
 const gr=g.createLinearGradient(0,y-size/2,0,y+size/2);gr.addColorStop(0,mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.35));
 g.lineJoin='round';g.lineWidth=Math.max(1.5,size/5);g.strokeStyle='#000';g.strokeText(s,x,y);g.fillStyle=gr;g.fillText(s,x,y);g.restore()}
function hud(g,W,H){const lim=K.S.len*3600,left=lim?Math.max(0,lim-K.tick):K.tick,s=Math.ceil(left/60),clock=golden?'GOLDEN GOAL':Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
 const cx=82,y=40;g.fillStyle='rgba(8,10,24,.78)';g.fillRect(cx-70,y-9,140,18);
 const sg=(x,col)=>{const gr=g.createLinearGradient(0,y-9,0,y+9);gr.addColorStop(0,mix(col,'#ffffff',.3));gr.addColorStop(1,mix(col,'#000000',.3));g.fillStyle=gr;g.fillRect(x,y-9,34,18)};
 sg(cx-70,TEAMC[0]);sg(cx+36,TEAMC[1]);txt(g,K.mode===1?'YOU':TEAMN[0],cx-53,y,7,'#ffffff');txt(g,K.mode===1?'CPU':TEAMN[1],cx+53,y,7,'#ffffff');
 txt(g,score[0]+' - '+score[1],cx,y-1,11,'#ffffff');txt(g,clock,cx,y+15,6,golden||left<600&&lim?'#f8d040':'#c8d8f0');
 for(const t of texts)if(t.big){const k=1-t.t/150,sz=30*(k<.15?k/.15:1);txt(g,t.big,cx,H*.38,sz,t.col);if(t.s)txt(g,t.s,cx,H*.38+22,9,'#ffffff')}
 // radar
 const rw=Math.min(110,W*.24),rh=rw*PH/PW,rx=W-rw-8,ry=H-rh-8;g.fillStyle='rgba(20,70,30,.7)';g.fillRect(rx,ry,rw,rh);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.6;g.strokeRect(rx,ry,rw,rh);
 g.beginPath();g.moveTo(rx+rw/2,ry);g.lineTo(rx+rw/2,ry+rh);g.stroke();
 for(const p of pl){const x=rx+p.x/PW*rw,yy=ry+(1-p.z/PH)*rh;g.fillStyle=p.gk?GKC[p.team]:TEAMC[p.team];g.fillRect(x-1.3,yy-1.3,2.6,2.6);if(p.seat>=0){g.strokeStyle=p.col;g.lineWidth=.6;g.strokeRect(x-2.2,yy-2.2,4.4,4.4)}}
 const b=ballView();g.fillStyle='#fff';g.fillRect(rx+b.x/PW*rw-1,ry+(1-b.z/PH)*rh-1,2,2);
 // your power-ups with time left
 const me=K.demo?null:K.isClient()?pl[seatP[K.myIdx]]:pl.find(p=>p.seat>=0&&K.seats[p.seat].ctrl!=='cpu');
 if(me){const f=me.fx,chips=[];if(f.boots>0)chips.push([1,f.boots/600]);if(f.fire)chips.push([2,1]);if(f.banana)chips.push([3,1]);if(f.mag>0)chips.push([4,f.mag/600]);if(f.tiny>0)chips.push([8,f.tiny/480]);if(f.frz>0)chips.push([6,f.frz/130]);
  chips.forEach(([k,v],n)=>{const x=8,yy=H-46-n*12;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,yy-5,84,10);g.fillStyle=ITEMS[k].c;g.fillRect(x,yy+3,84*v,2);txt(g,ITEMS[k].n,x+3,yy-.5,6,ITEMS[k].c,'left')});
  const sx=8,sy=H-24;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(sx,sy,60,4);g.fillStyle=me.stam>.3?'#60e080':'#f06040';g.fillRect(sx,sy,60*me.stam,4);txt(g,'STAMINA',sx,sy-5,5,'#c8d8f0','left')}}
K=RA.kit({id:'kick',name:'PIXEL KICK',kind:'Football',players:'1-20 players',demo:8,localFirst:true,baseH:216,
 desc:'Arcade football for up to 10 a side on a TV-camera pitch: pass, charge shots, lob, slide in, and grab fire shots, banana shots and giant keepers. Red vs blue or all of you against a CPU team.',
 blurb:'WASD runs, Shift sprints. Tap Space to pass, hold to shoot, E lobs, Q slides in. The mouse aims if you use it.',
 howto:'WASD run, Shift sprint. Ball: tap Space / click = pass, hold = shot, E = lob, Q = dribble burst. No ball: Space = tackle, Q = slide, E = call for a pass. Touch: tap = pass / tackle, hold = shoot.',
 icon:['..kkkkkk..','.kwwkkwwk.','kwwwkkwwwk','kkwwwwwwkk','kkkwwwwkkk','kwwwkkwwwk','kwwkkkkwwk','kwwwkkwwwk','.kwwwwwwk.','..kkkkkk..'],
 music:MUSIC,fireLabel:'KICK',
 modes:[['MATCH','Red vs blue: humans are split between the teams.'],['CO-OP','All of you on one team against the CPU.']],
 settings:[['len','Match length',[[3,'3 min'],[2,'2 min'],[5,'5 min'],[8,'8 min']]],['size','Team size',[['auto','Auto'],[3,'3 a side'],[5,'5 a side'],[7,'7 a side'],[10,'10 a side']]],
  ['walls','Boards',[['on','Arcade boards'],['off','Throw-ins']]],['items','Power-ups',[['on','On'],['party','Wild party'],['off','Off']]],['gold','If drawn',[['on','Golden goal'],['off','Draw']]]],
 kb:[['W A S D','run'],['SHIFT','sprint'],['SPACE LMB','pass / shoot'],['E','lob / call'],['Q','slide / burst'],['C','chat'],['ESC','menu']],pad:[['LS','run'],['A','pass / shoot'],['B','lob / call'],['X','slide'],['Y','sprint'],['START','menu']],
 ach:[{id:'first',name:'Debut',desc:'Play your first match',test:s=>s.played>=1,unlock:'title:Debutant'},{id:'win1',name:'Three Points',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Winner'},
  {id:'hat',name:'Hat-trick',desc:'Score 3 goals in one match',test:(s,m)=>m.kills>=3,unlock:'title:Hat-trick Hero'},{id:'g25',name:'Golden Boot',desc:'Score 25 goals in total',test:s=>s.kills>=25,unlock:'title:Golden Boot'},
  {id:'cs',name:'Clean Sheet',desc:'Win without conceding',test:(s,m)=>m.won&&m.cs,unlock:'title:The Wall'}],
 start,step,local,upload,follow,snap,apply,render,bot,onFx,aim,teamOf:i=>K.mode===1?0:i%2,
 info:()=>score[0]+' - '+score[1],
 ranks:()=>{const w=score[0]>score[1]?0:score[1]>score[0]?1:-1;return K.seats.map((s,i)=>{const p=pl[seatP[i]];return{p,i}}).filter(x=>x.p).sort((a,b)=>(b.p.team===w)-(a.p.team===w)||b.p.goals-a.p.goals)
  .map(({p})=>[p.name,TEAMC[p.team],p.goals+' goal'+(p.goals===1?'':'s')+' · '+(K.mode===1?(p.team===0?'you':'CPU'):TEAMN[p.team])])},
 result:(i,w)=>{const p=pl[seatP[i]];if(!p)return{};const t=p.team,won=score[t]>score[1-t];return{won,kills:p.goals,cs:won&&score[1-t]===0?1:0}}});
window.__pk={get pl(){return pl},get ball(){return ball},K,get score(){return score}};
})();
