/* CENTRE COURT for Retro Arena: 8-bit tennis for up to 20, after NES Tennis.
   The original it follows: a court seen from behind one baseline, the far player facing you; you serve with a toss and a
   second press at the top, run to the ball and swing - WHEN you swing and WHICH way you hold decides where it goes.
   Kept: real tennis rules (service boxes, faults, double bounce, out, net), 0-15-30-40, serve alternation, ball height + shadow.
   The 20-player twist: a LADDER of courts. Everyone plays at once, one game per court per round; winners move up a court,
   losers move down, the top court is Centre Court. After the last round the ladder is the result. Doubles: pairs climb together.
   First seconds: hints show SPACE toss / SPACE again at the top to serve; then MOVE, SPACE swing (early is fine - the racket
   waits for the ball), E lob, hold a direction to aim. A target cross on the court shows where your shot is going.
   Why it is fun: positioning and timing (a swing pressed just before contact is a PERFECT power shot), aiming at the lines is
   risky, lobs over net-rushers, and climbing to Centre Court.
   Online: your player (movement, swings, your hits) runs on your own device (RA.kit localFirst); hits are uploaded with a
   sequence number; the host owns the ball after that, judges bounces, points and the ladder.
   Player sprites are painted in tools/art/tennis (python), exported as ART below; edit tennis_tpl.js there and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
/*ART*/
const TM=RA.music.track,sfx=RA.audio.sfx;
// world units are metres: x across the court (screen x), y along it (far baseline -HL, near +HL), z up
const HL=11.885,HWS=4.115,HWD=5.485,SVC=6.4,NETH=.914,G=.0042,SPIN=.0016,REACH=1.45,LREACH=2.05,PSPD=.108,SWW=16,PERF=6;
const SURF={hard:{n:'HARD',e:.68,f:.8,c:['#2c64b8','#2a5eae'],o:['#3c8c50','#378449']},clay:{n:'CLAY',e:.74,f:.72,c:['#c8643c','#bc5c36'],o:['#a85030','#9c4a2c']},
 grass:{n:'GRASS',e:.58,f:.87,c:['#56aa44','#4c9e3c'],o:['#3c8834','#367e30']}};
const CNAME=k=>k===0?'CENTRE COURT':'COURT '+(k+1);
RA.audio.add('pok',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(330,now);o.frequency.exponentialRampToValueAtTime(110,now+.06);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);o.start(now);o.stop(now+.09)});
RA.audio.add('tok',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(240,now);o.frequency.exponentialRampToValueAtTime(140,now+.05);g.gain.setValueAtTime(.16,now);g.gain.exponentialRampToValueAtTime(.001,now+.07);o.connect(g);o.start(now);o.stop(now+.08)});
RA.audio.add('thud',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.value=300;s.connect(f);f.connect(g);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.001,now+.15);s.start(now);s.stop(now+.16)});
RA.audio.add('cheer',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;s.loop=true;f.type='bandpass';f.frequency.value=1400;f.Q.value=.6;s.connect(f);f.connect(g);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.09,now+.15);g.gain.exponentialRampToValueAtTime(.001,now+1.1);s.start(now);s.stop(now+1.15)});
RA.audio.add('call',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(392,now);o.frequency.setValueAtTime(294,now+.09);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.22);o.connect(g);o.start(now);o.stop(now+.23)});
const MUSIC=[TM('Match Point',132,['C','G','Am','F'],'k.hsk.hsk.hsk.hs','e5 . g5 e5 c5 . e5 g5 d5 . g5 d5 b4 . d5 g5 e5 . a5 e5 c5 . e5 a5 f5 . a5 f5 c5 . f5 a5'),
 TM('Baseline Boogie',150,['Am','Dm','G','C'],'kshskshskshskshs','a4 c5 e5 a5 e5 c5 a4 c5 d5 f5 a5 d6 a5 f5 d5 f5 g4 b4 d5 g5 d5 b4 g4 b4 c5 e5 g5 c6 g5 e5 c5 e5'),
 TM('Centre Court',120,['F','C','Dm','Bb'],'k..sk..sk..sk.hs','f5 a5 c6 a5 f5 . c5 . e5 g5 c6 g5 e5 . c5 . d5 f5 a5 f5 d5 . a4 . bb4 d5 f5 d5 bb4 . f4 .')];
let K,pl=[],units=[],courts=[],order=[],bye=-1,round=1,rounds=3,rs='play',rT=0,dbl=false,single=false,gTarget=3,games=[],texts=[],parts=[],VR={};
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const isNet=p=>!p.int&&K.seats[p.i]&&K.seats[p.i].ctrl==='net',isCpu=p=>p.int||p.cpuF||K.seats[p.i]&&K.seats[p.i].ctrl==='cpu';
// a human on this device; their court is drawn turned round when they play the far end, so everyone plays "up the screen"
const localHum=p=>{if(p.int||p.cpuF)return false;const s=K.seats[p.i];if(!s||K.demo)return false;return K.isClient()?p.i===K.myIdx:s.ctrl!=='cpu'&&s.ctrl!=='net'};
const flipped=p=>!!p&&p.side===1&&localHum(p)&&!pl.some(q=>q!==p&&q.court===p.court&&q.side===0&&localHum(q));
const flipInp=i=>{const o=Object.assign({},i);o.left=i.right;o.right=i.left;o.up=i.down;o.down=i.up;if(i.ax!=null)o.ax=-i.ax;if(i.ay!=null)o.ay=-i.ay;return o};
const sgn=s=>s===0?1:-1;          // side 0 = near (bottom, seen from behind), side 1 = far (top, facing you)
const hand=p=>p.side===0?1:-1;    // which screen side the racket is on
const gauss=()=>{let u=0;for(let k=0;k<4;k++)u+=Math.random();return(u-2)*1.73};
const netH=x=>NETH+.16*Math.min(1,Math.abs(x)/HWD);
// sounds only for the courts on screen (your own, or the one you watch)
const viewed=()=>{if(K.demo)return[Math.floor(K.tick/900)%Math.max(1,courts.length)];const r=[];for(const i of K.focus()){const p=pl[i];r.push(p&&p.court>=0?p.court:0)}return r.length?r:[0]};
const mine=c=>viewed().includes(c.k),sfxC=(c,n)=>{if(!K.demo&&mine(c))sfx(n)};
const shortN=n=>(n||'').replace(/^CPU /,'C').slice(0,4),uName=u=>dbl?units[u].map(i=>shortN(pl[i].name)).join('+'):(pl[units[u][0]].name||'').slice(0,8);
/* ---------- ball physics (shared by host, guests and the CPU's prediction) ---------- */
function newBall(){return{x:0,y:0,z:1,vx:0,vy:0,vz:0,sp:0,b:0,j:0,hs:-1,net:0,srv:0,held:1,sq:0,t:0,by:-1}}
function ballStep(b,sf){if(b.held)return 0;const py=b.y;let ev=0;
 b.vz-=G+(b.b===0?SPIN*b.sp:0);b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;
 if(!b.net&&(py>0)!==(b.y>0)&&Math.abs(b.x)<HWD+.9&&b.z<netH(b.x)){b.net=1;b.y=py>0?.06:-.06;b.vy*=-.12;b.vx*=.3;b.vz=Math.min(b.vz,0)*.3;ev='n'}
 if(b.z<=0&&b.vz<0){b.z=0;b.vz=-b.vz*sf.e;const fr=sf.f+(b.b===0?b.sp*.04:0);b.vx*=fr;b.vy*=fr;b.b++;b.sp*=.4;if(b.vz<.02){b.vz=0;b.b=Math.max(b.b,2)}ev=ev||'b'}
 if(b.z===0&&b.vz===0){b.vx*=.95;b.vy*=.95}
 return ev}
function predict(b,sf,n){const c=Object.assign({},b),out=[];for(let t=1;t<=n;t++){ballStep(c,sf);out.push({t,x:c.x,y:c.y,z:c.z,b:c.b,net:c.net});if(c.b>=2)break}return out}
// a shot: aim at (tx,ty) on the ground at horizontal speed vh, clear the net by clr
function launch(c,p,x0,y0,z0,tx,ty,vh,sp,clr,srv){const dx=tx-x0,dy=ty-y0,d=Math.hypot(dx,dy)||1,ge=G+SPIN*sp;let T,vz;
 for(let k=0;k<14;k++){T=d/vh;vz=(.5*ge*T*T-z0)/T;const tn=Math.abs(dy)>.01?-y0/(dy/T):-1;if(tn<=0||tn>=T)break;const zn=z0+vz*tn-.5*ge*tn*tn;if(zn>=netH(x0+dx*tn/T)+clr)break;vh*=.93}
 const b=c.ball;Object.assign(b,{x:x0,y:y0,z:z0,vx:dx/T,vy:dy/T,vz,sp,b:0,j:0,hs:p.side,net:0,srv:srv?1:0,held:0,sq:b.sq+1,t:K.tick,by:p.i});return b}
/* ---------- the match ---------- */
function start(seats,md,S,seed){dbl=md===1;texts=[];parts=[];VR={};
 pl=seats.map((s,i)=>mkP(i,s.name,s.col));if(pl.length<2)pl.push(Object.assign(mkP(pl.length,'CPU','#c8c8d8'),{int:1}));
 units=[];if(dbl&&pl.length>=4){for(let i=0;i<pl.length;i+=2)units.push(i+1<pl.length?[i,i+1]:[i])}else{dbl=false;pl.forEach((p,i)=>units.push([i]))}
 const L=+S.len||1;single=units.length===2;rounds=[2,3,4][L]||3;gTarget=[1,2,3][L]||2;games=units.map(()=>0);
 const rr=RA.util.mulberry(seed);order=units.map((u,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(rr()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 // humans start in the middle of the ladder: from there a winning streak reaches Centre Court within the rounds
 const humU=u=>units[u].some(i=>!isCpu(pl[i])),H=order.filter(humU),O=order.filter(u=>!humU(u)),mid=Math.max(0,Math.floor(order.length/4)*2-2);
 if(H.length&&O.length){order=O.slice();H.forEach((u,j)=>order.splice(Math.min(order.length,mid+j),0,u))}
 round=1;rs='play';rT=0;assign()}
function mkP(i,name,col){return{i,name,col,court:-1,side:0,slot:0,x:0,y:HL,vx:0,vy:0,pose:'ready',swT:0,swk:'fore',sw:0,cd:0,lob:0,toss:0,tz:0,tvz:0,dist:0,rp:0,pf:0,pa:0,hit:null,idle:0,plan:null,wt:0,bf:0,aces:0,wins:0,perf:0}}
function assign(){courts=[];bye=-1;const n=Math.floor(order.length/2);
 // the player who waits a round should be a CPU when there is one: swap a human out of the bye with the lowest all-CPU unit
 const humU=u=>units[u].some(i=>!isCpu(pl[i]));if(order.length%2&&humU(order[order.length-1])){for(let j=order.length-2;j>=0;j--)if(!humU(order[j])){const t=order[j];order[j]=order[order.length-1];order[order.length-1]=t;break}}
 for(let k=0;k<n;k++){let A=order[2*k],B=order[2*k+1];const hum=u=>units[u].some(i=>!isCpu(pl[i])&&!isNet(pl[i]));if(hum(B)&&!hum(A))[A,B]=[B,A];
  const sname=K.S.surface&&K.S.surface!=='mix'?K.S.surface:['grass','hard','clay'][k%3];
  const c={k,u:[A,B],pts:[0,0],srv:(round+k)%2,srvN:0,st:'serve',t:K.tick,fault:0,ball:newBall(),pend:null,call:'',callT:-999,win:-1,sd:0,surf:sname,sf:SURF[sname],gs:0};
  [A,B].forEach((u,s)=>units[u].forEach((i,sl)=>{const p=pl[i];p.court=k;p.side=s;p.slot=sl;p.plan=null}));courts.push(c);resetPoint(c)}
 if(order.length%2){bye=order[order.length-1];units[bye].forEach(i=>{pl[i].court=-1})}}
const sidePl=(c,s)=>units[c.u[s]].map(i=>pl[i]);
// who serves and receives this point (doubles: the serving partner changes every game, the receiver every point)
function server(c){const ps=sidePl(c,c.srv);return ps[c.gs%ps.length]}
function receiver(c){const ps=sidePl(c,1-c.srv);return ps[c.srvN%ps.length]}
function homes(c){const out={},ss=c.srv,rsd=1-ss,dS=sgn(ss)*(c.srvN%2===0?1:-1),sv=server(c),rc=receiver(c);
 out[sv.i]=[dS*.9,sgn(ss)*(HL+.5)];out[rc.i]=[-dS*2.6,sgn(rsd)*(HL+.4)];
 for(const p of sidePl(c,ss))if(p!==sv)out[p.i]=[-dS*2.4,sgn(ss)*3.8];
 for(const p of sidePl(c,rsd))if(p!==rc)out[p.i]=[dS*2.4,sgn(rsd)*(SVC+.2)];return out}
function resetPoint(c){c.st='serve';c.t=K.tick;c.pend=null;const H=homes(c),b=c.ball;b.held=1;b.b=0;b.j=0;b.net=0;b.hs=-1;b.sq++;
 for(const s of[0,1])for(const p of sidePl(c,s)){const h=H[p.i];p.x=h[0];p.y=h[1];p.vx=p.vy=0;p.rp++;p.toss=0;p.tz=0;p.sw=0;p.swT=0;p.plan=null;p.wt=30+Math.random()*40;p.idle=0}}
function hw(c){return dbl?HWD:HWS}
function inCourt(c,b){return Math.abs(b.x)<=hw(c)+.05&&Math.abs(b.y)<=HL+.05}
function inBox(c,b){const ss=c.srv,dS=sgn(ss)*(c.srvN%2===0?1:-1),bs=-dS,rsd=1-ss;return b.y*sgn(rsd)>0&&Math.abs(b.y)<=SVC+.05&&b.x*bs>=-.05&&Math.abs(b.x)<=HWS+.05}
// host: judge a bounce. A point is only decided after a short grace, so a guest's hit that was already on its way still counts
function judge(c){const b=c.ball;if(c.pend||c.st!=='rally'||b.j===b.b)return;const first=b.j===0;b.j=b.b;const side=b.y>0?0:1;
 if(first&&b.b===1){if(side===b.hs)return decide(c,b.hs,b.srv?'FAULT':'NET',b.srv);if(b.srv?!inBox(c,b):!inCourt(c,b))return decide(c,b.hs,b.srv?'FAULT':'OUT!',b.srv);return}
 if(b.b>=2){if(first){/* rolled out without a proper bounce */const out=side===b.hs||!inCourt(c,b);return decide(c,out?b.hs:1-b.hs,out?'OUT!':'WINNER!',0)}
  return decide(c,side,b.srv?'ACE!':'WINNER!',0)}}
function decide(c,loser,call,fault){c.pend={l:loser,call,fault,t:K.tick+7}}
function resolve(c){const pd=c.pend;c.pend=null;
 if(pd.fault){if(c.fault===0){c.fault=1;say(c,'FAULT','#fff07c');c.st='dead';c.t=K.tick;c.next='serve';return}pd.call='DOUBLE FAULT'}
 if(pd.call==='ACE!'){const s=server(c);s.aces++}
 const ws=1-pd.l;c.pts[ws]++;for(const i of units[c.u[ws]])pl[i].pw=(pl[i].pw|0)+1;for(const i of units[c.u[1-ws]])pl[i].pl=(pl[i].pl|0)+1;c.fault=0;c.srvN++;c.st='dead';c.t=K.tick;c.next='point';sfxC(c,'cheer');
 const a=c.pts[ws],o=c.pts[1-ws],won=c.sd?a>o:a>=4&&(a-o>=2||a+o>=7);
 if(won){c.win=ws;c.next='game';for(const i of units[c.u[ws]])pl[i].wins++;say(c,'GAME '+uName(c.u[ws]),'#ffffff');if(single)games[c.u[ws]]++}
 else say(c,pd.call+(a+o===6&&!c.sd?'  DECIDING POINT':''),pd.call==='OUT!'||pd.call==='NET'||pd.call==='DOUBLE FAULT'?'#f05050':'#fff07c');
 K.fx('c',c.k)}
function say(c,s,col){c.call=s;c.callCol=col;c.callT=K.tick;sfxC(c,'call')}
function courtStep(c){const b=c.ball;
 if(c.st==='serve'){const s=server(c);if(b.held){b.x=s.x+hand(s)*.35;b.y=s.y;b.z=s.toss?s.tz:1}}
 else if(c.st==='rally'||c.st==='dead'){const ev=ballStep(b,c.sf);if(ev==='b'&&c.st==='rally')judge(c);if(ev)sfxC(c,ev==='n'?'thud':'tok')}
 if(c.pend&&K.tick>=c.pend.t)resolve(c);
 if(c.st==='dead'){const wait=c.next==='game'?150:c.next==='serve'?55:75;if(K.tick-c.t>wait){
  if(c.next==='game'){if(single&&Math.max(...games)>=gTarget){c.st='done';return}
   if(single){c.pts=[0,0];c.srv=1-c.srv;c.srvN=0;c.gs++;c.win=-1;resetPoint(c)}else c.st='done'}
  else resetPoint(c)}}}
function step(){for(const p of pl){const c=courts[p.court];if(isNet(p)){const u=K.remote(p.i);if(u)readUp(p,u,c);continue}control(p,p.int?bot(p.i):K.inp(p.i),c)}
 for(const c of courts)courtStep(c);
 if(rs==='play'){if(!single&&K.tick-rT>3600)for(const c of courts)if(!c.sd&&c.st!=='done'){c.sd=1;say(c,'SUDDEN DEATH: NEXT POINT WINS','#f05050')}
  if(courts.every(c=>c.st==='done')){if(single){finish();return}rs='between';rT=K.tick;climb()}}
 else if(rs==='between'&&K.tick-rT>260){if(round>=rounds){finish();return}round++;rs='play';rT=K.tick;assign()}
 vis()}
// the ladder: court winners move up, losers move down (top winner and bottom loser stay; a waiting player comes in at the bottom)
let moves={};
function climb(){const W=courts.map(c=>c.u[c.win<0?0:c.win]),L=courts.map(c=>c.u[c.win<0?1:1-c.win]),n=courts.length,o=[W[0]];
 for(let k=1;k<n;k++){o.push(W[k]);o.push(L[k-1])}if(bye>=0){o.push(bye);o.push(L[n-1])}else o.push(L[n-1]);
 if(n===1&&bye<0){o.length=0;o.push(W[0],L[0])}
 moves={};o.forEach((u,j)=>{const was=order.indexOf(u);moves[u]=Math.sign(was-j)});order=o}
let endWho=-1;
function finish(){const best=single?units.map((u,i)=>i).sort((a,b)=>games[b]-games[a])[0]:order[0];if(dbl)K.end({team:best,name:uName(best)});else K.end({i:units[best][0]})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.z+=.01}texts=texts.filter(t=>t.t>0)}
/* ---------- a player: movement, serve, swing ---------- */
function control(p,inp,c){if(flipped(p))inp=flipInp(inp);const tap=inp.fire&&!p.pf,atap=inp.alt&&!p.pa;p.pf=!!inp.fire;p.pa=!!inp.alt;p.inp=inp;
 if(p.cd>0)p.cd--;if(p.swT>0)p.swT--;
 if(!c){idleWalk(p,null);return}
 const b=c.ball;let mx=(inp.right?1:0)-(inp.left?1:0),my=(inp.down?1:0)-(inp.up?1:0);if(inp.ax!=null&&Math.abs(inp.ax)>.25)mx=inp.ax;if(inp.ay!=null&&Math.abs(inp.ay)>.25)my=inp.ay;
 if(c.st==='done'||c.st==='dead'&&K.tick-c.t>30){const h=c.st==='done'?[p.slot?2:-2,sgn(p.side)*(HL+1.5)]:homes(c)[p.i];if(h&&(c.st==='done'||c.next!=='game'))walkTo(p,h[0],h[1],.08);else{p.vx*=.8;p.vy*=.8}pose(p,c);return}
 const srv=c.st==='serve'&&server(c)===p;
 if(srv){my=0;if(!isCpu(p)){if(!tap&&!p.toss)p.idle++;if(p.idle>420&&!p.toss){p.toss=1;p.tz=1.15;p.tvz=.088;p.auto=1}}
  if(K.tick-c.t>24){if(tap&&!p.toss){p.toss=1;p.tz=1.15;p.tvz=.088;p.auto=0;p.idle=0}
   else if(p.toss){p.tz+=p.tvz;p.tvz-=G;if((tap||p.auto&&p.tvz<.002)&&p.tz>1.25){serveHit(p,c,inp);return}if(p.tz<1&&p.tvz<0){p.toss=0;p.tz=0}}}
  if(p.toss)mx=0}
 // run: snappy acceleration, slower while the swing plays out
 const cpu=isCpu(p),lvl=cpu?K.cpu:2,max=PSPD*(cpu?[.82,.9,.97][lvl]:1)*(p.swT>0?.45:1),l=Math.hypot(mx,my);
 const tx=l>0?mx/Math.max(1,l)*max:0,ty=l>0?my/Math.max(1,l)*max:0;p.vx+=(tx-p.vx)*.25;p.vy+=(ty-p.vy)*.25;
 // beginner assist: an armed swing drifts you sideways onto the incoming ball
 if(!cpu&&p.sw>0&&c.st==='rally'&&b.hs!==p.side&&b.y*sgn(p.side)>-2){const ax=b.x-hand(p)*.55-p.x;if(Math.abs(ax)<3.5)p.vx+=Math.sign(ax)*Math.min(Math.abs(ax),.045)}
 p.x+=p.vx;p.y+=p.vy;p.dist+=Math.hypot(p.vx,p.vy);
 const s=sgn(p.side);p.x=Math.max(-HWD-4.5,Math.min(HWD+4.5,p.x));p.y=s>0?Math.max(.7,Math.min(HL+4.5,p.y)):Math.min(-.7,Math.max(-HL-4.5,p.y));
 if(c.st==='rally'){if((tap||atap)&&p.sw<=0&&p.cd<=0){p.sw=SWW;p.lob=atap&&!tap?1:0}
  if(p.sw>0){p.sw--;if(tryHit(p,c,inp))return;if(p.sw===0){p.swT=10;p.swk=swingSide(p,b);p.cd=8}}}
 else p.sw=0;
 pose(p,c)}
function walkTo(p,x,y,sp){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d<.05){p.vx=p.vy=0;return}const v=Math.min(sp,d);p.vx=dx/d*v;p.vy=dy/d*v;p.x+=p.vx;p.y+=p.vy;p.dist+=v}
function idleWalk(p){p.vx*=.8;p.vy*=.8;p.pose='ready'}
const swingSide=(p,b)=>(b.x-p.x)*hand(p)>=-.1?'fore':'back';
function aimTarget(p,c,inp,kind){const opp=-sgn(p.side),W=hw(c),fwd=p.side===0?inp.up:inp.down,back=p.side===0?inp.down:inp.up;let ax=(inp.right?1:0)-(inp.left?1:0);if(inp.ax!=null&&Math.abs(inp.ax)>.4)ax=Math.sign(inp.ax);
 const depth=p.lob?9.8:kind==='smash'?7.6:kind==='volley'?(fwd?5:7.6):fwd?5.2:back?10.5:8.8,ty=opp*depth;let tx;
 if(!ax&&inp.aim!=null&&Math.abs(Math.sin(inp.aim))>.15&&Math.sign(Math.sin(inp.aim))===opp){tx=p.x+Math.cos(inp.aim)/Math.sin(inp.aim)*(ty-p.y);tx=Math.max(-W-.8,Math.min(W+.8,tx))}
 else if(ax)tx=ax*W*(fwd?.92:.8);else tx=Math.max(-2,Math.min(2,-p.x*.4));
 return[tx,ty,fwd,back]}
function tryHit(p,c,inp){const b=c.ball,s=sgn(p.side);if(b.held||b.hs===p.side||b.b>=2||b.srv&&b.b<1||b.y*s<0||c.pend&&!K.isClient()&&!isNet(p))return false;
 if(c.pend&&isNet(p))return false;
 const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy*1.2),dn=Math.hypot(b.x+b.vx-p.x-p.vx,(b.y+b.vy-p.y-p.vy)*1.2);let kind;
 // wait for the ball's closest approach: swing when it's as near as it gets (or about to pass), lunge only as a last resort
 if(dn<d-.01&&dn<=REACH&&p.sw>1)return false;
 if(d<=REACH&&b.z<=2.7)kind=b.z>1.95?'smash':b.b===0?'volley':swingSide(p,b);else if(d<=LREACH&&b.z<1.3)kind='lunge';else return false;
 const inc=Math.hypot(b.vx,b.vy),perfect=SWW-p.sw<=PERF&&kind!=='lunge',cpu=isCpu(p),lvl=cpu?K.cpu:2;
 const[tx0,ty0,fwd,back]=aimTarget(p,c,inp,kind);
 let sig=.28+.5*Math.pow(Math.min(1,d/REACH),2)+inc*.8+(perfect?-.14:0)+(kind==='lunge'?.45:0)+(cpu?[.3,.12,.03][lvl]:0);if(kind==='smash')sig=.3+(cpu?.1:0);
 const tx=tx0+gauss()*sig,ty=ty0+gauss()*sig*1.2;
 let vh=kind==='smash'?.44:p.lob?.17:kind==='lunge'?.2:kind==='volley'?.32:fwd?.28:.44+inc*.15+(perfect?.08:0);
 const sp=p.lob?.3:kind==='lunge'?-.4:kind==='smash'?.2:1,clr=p.lob?1.5:Math.max(perfect?.1:-.6,.14+gauss()*sig*.32);
 launch(c,p,b.x,b.y,Math.max(.25,b.z),tx,ty,vh,sp,clr,false);c.st='rally';if(c.pend&&isNet(p))c.pend=null;
 p.swk=kind;p.swT=kind==='lunge'?14:12;p.sw=0;p.cd=8;p.perf=perfect?K.tick:p.perf;sfxC(c,'pok');p.hit=hitRec(c,p);
 if(perfect&&p.i===meIdx())pop(p,'PERFECT!','#fff07c');return true}
function serveHit(p,c,inp){const q=Math.max(0,1-Math.abs(p.tvz)/.045),ss=p.side,dS=sgn(ss)*(c.srvN%2===0?1:-1),bs=-dS,ys=-sgn(ss);
 let ax=(inp.right?1:0)-(inp.left?1:0);if(inp.ax!=null&&Math.abs(inp.ax)>.4)ax=Math.sign(inp.ax);let lat=ax===0?2:ax===bs?3.5:.55;
 if(!ax&&inp.aim!=null&&Math.abs(Math.sin(inp.aim))>.15){const t=p.x+Math.cos(inp.aim)/Math.sin(inp.aim)*(ys*5.2-p.y);lat=Math.max(.3,Math.min(3.9,t*bs))}
 const cpu=isCpu(p),lvl=cpu?K.cpu:2,first=c.fault===0,vh=first?.29+.13*q:.25+.03*q,sig=first?.22+.5*(1-q)+(cpu?[.25,.12,.05][lvl]:0):.18;
 const tx=bs*lat+gauss()*sig,ty=ys*5.0+gauss()*sig*1.3;
 launch(c,p,p.x+hand(p)*.3,p.y,p.tz+.6,tx,ty,vh,.4,first?.12+gauss()*sig*.3:.35,true);c.st='rally';
 p.toss=0;p.tz=0;p.swk='serve';p.swT=14;p.cd=10;sfxC(c,'pok');p.hit=hitRec(c,p);if(q>.85&&first&&p.i===meIdx())pop(p,'PERFECT SERVE!','#fff07c');return true}
const hitRec=(c,p)=>{const b=c.ball;return{sq:b.sq,rp:p.rp,x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,sp:b.sp,s:b.srv}};
function pose(p,c){const b=c?c.ball:null;let k='ready';
 if(p.swT>0){const t=p.swT,kd=p.swk;k=kd==='serve'||kd==='smash'?(t>9?'serve2':'serve3'):kd==='lunge'?'lunge':kd==='volley'?(t>7?'volley':'fore3'):(t>8?kd+'2':kd+'3')}
 else if(p.toss)k='serve1';else if(p.sw>0&&b)k=swingSide(p,b)+'1';
 else if(c&&c.st==='dead'&&c.next==='game'&&K.tick-c.t>20)k=c.win===p.side?'win':'sad';
 else if(Math.hypot(p.vx,p.vy)>.02)k='run'+(1+Math.floor(p.dist/.55)%4);
 if(k!==p.pose){if((p.hold|0)>0&&p.swT<=0&&k.startsWith('run')&&p.pose.startsWith('run')){}p.pose=k}}
function pop(p,s,col){texts=texts.filter(t=>t.who!==p.i);texts.push({x:p.x,y:p.y,z:2.8,s,col,t:60,who:p.i})}
/* ---------- guests ---------- */
let myHitT=-999;
function local(i){const p=pl[i];if(!p)return;const c=courts[p.court];if(c&&c.st!=='serve'){const ev=ballStep(c.ball,c.sf);if(ev)sfxC(c,ev==='n'?'thud':'tok')}
 const sq=c?c.ball.sq:0;control(p,K.inp(i),c);if(c&&c.ball.sq!==sq)myHitT=K.tick;
 if(c&&c.st==='serve'&&server(c)===p){const b=c.ball;b.x=p.x+hand(p)*.35;b.y=p.y;b.z=p.toss?p.tz:1}
 vis()}
function upload(i){const p=pl[i];if(!p)return null;return{x:Math.round(p.x*100)/100,y:Math.round(p.y*100)/100,po:p.pose,tz:Math.round(p.tz*100)/100,tg:p.toss?1:0,rp:p.rp,h:p.hit}}
function readUp(p,u,c){if(typeof u.x!=='number'||u.rp!==p.rp)return;p.x=u.x;p.y=u.y;p.pose=u.po||'ready';p.tz=u.tz||0;p.toss=u.tg|0;
 const h=u.h;if(!h||!c||h.rp!==p.rp||h.sq!==c.ball.sq+1)return;const b=c.ball;
 if(h.s){if(c.st!=='serve'||server(c)!==p)return}else{if(c.st!=='rally'||b.hs===p.side||b.b>=2&&!c.pend)return}
 Object.assign(b,{x:h.x,y:h.y,z:h.z,vx:h.vx,vy:h.vy,vz:h.vz,sp:h.sp,b:0,j:0,hs:p.side,net:0,srv:h.s?1:0,held:0,sq:h.sq,t:K.tick,by:p.i});c.st='rally';c.pend=null;p.acc=(p.acc|0)+1;sfxC(c,'pok')}
const ST=['serve','rally','dead','done'],PO=['ready','run1','run2','run3','run4','fore1','fore2','fore3','back1','back2','back3','serve1','serve2','serve3','volley','lunge','win','sad'],SN=['hard','clay','grass'],NX=['','serve','point','game'];
const r1=v=>Math.round(v*10)/10;
const r2=v=>Math.round(v*100)/100;
function snap(){return{cp:pl.map(p=>isCpu(p)?1:0),pl:pl.map(p=>[r1(p.x),r1(p.y),PO.indexOf(p.pose),r1(p.tz),p.toss,p.rp,p.court,p.side,p.slot,p.wins,p.aces]),
 ct:courts.map(c=>{const b=c.ball;return[ST.indexOf(c.st),b.sq,b.hs,b.b,b.net,b.srv,b.held,r2(b.x),r2(b.y),r2(b.z),r2(b.vx),r2(b.vy),r2(b.vz),r2(b.sp),c.pts,c.srv,c.srvN,c.fault,c.call,c.callT,c.sd,c.t,c.win,NX.indexOf(c.next||''),c.gs,c.u,SN.indexOf(c.surf),c.callCol||'']}),
 lo:order,by:bye,rd:round,rz:rs,rq:rT,gm:games,mv:moves}}
function apply(g){if(g.cp)g.cp.forEach((v,i)=>{if(pl[i]&&i!==K.myIdx)pl[i].cpuF=v});order=g.lo||order;bye=g.by;round=g.rd;rs=g.rz;rT=g.rq;games=g.gm||games;moves=g.mv||moves;
 (g.ct||[]).forEach((a,k)=>{let c=courts[k];const sn=SN[a[26]];if(!c||c.surf!==sn||c.u+''!==a[25]+''){c=courts[k]={k,ball:newBall(),pend:null}};c.u=a[25];c.surf=sn;c.sf=SURF[sn];
  const prevCall=c.callT;c.st=ST[a[0]];c.pts=a[14];c.srv=a[15];c.srvN=a[16];c.fault=a[17];c.call=a[18];c.callT=a[19];c.sd=a[20];c.t=a[21];c.win=a[22];c.next=NX[a[23]];c.gs=a[24];c.callCol=a[27];c.k=k;
  if(prevCall!=null&&c.callT!==prevCall&&mine(c))sfx('call');
  const b=c.ball,me=pl[K.myIdx],my=me&&me.court===k,take=()=>{if(a[1]!==b.sq&&my&&!a[6])sfx('pok');Object.assign(b,{sq:a[1],hs:a[2],b:a[3],net:a[4],srv:a[5],held:a[6],x:a[7],y:a[8],z:a[9],vx:a[10],vy:a[11],vz:a[12],sp:a[13]})};
  if(!my)take();else if(a[1]>b.sq||c.st!=='rally'||a[1]<b.sq&&K.tick-myHitT>45)take();else if(a[1]===b.sq&&Math.hypot(a[7]-b.x,a[8]-b.y)>1.2)take()});
 courts.length=(g.ct||[]).length;
 (g.pl||[]).forEach((a,i)=>{const p=pl[i];if(!p)return;p.court=a[6];p.side=a[7];p.slot=a[8];p.wins=a[9];p.aces=a[10];
  if(i===K.myIdx){if(a[5]!==p.rp){p.x=a[0];p.y=a[1];p.vx=p.vy=0;p.rp=a[5];p.toss=0;p.tz=0;p.sw=0;p.hit=null}return}
  p.tx=a[0];p.ty=a[1];p.pose=PO[a[2]]||'ready';p.tz=a[3];p.toss=a[4];if(p.gx==null||Math.hypot(p.tx-p.x,p.ty-p.y)>3){p.x=p.tx;p.y=p.ty;p.gx=1}})}
function follow(){for(const p of pl){if(p.i===K.myIdx||p.tx==null)continue;const ox=p.x,oy=p.y;p.x+=(p.tx-p.x)*.3;p.y+=(p.ty-p.y)*.3;p.dist+=Math.hypot(p.x-ox,p.y-oy)}
 const me=pl[K.myIdx];for(const c of courts){if(me&&me.court===c.k)continue;if(c.st==='rally'||c.st==='dead')ballStep(c.ball,c.sf);else if(c.st==='serve'){const s=server(c);if(s){c.ball.x=s.x+hand(s)*.35;c.ball.y=s.y;c.ball.z=s.toss?s.tz:1}}}}
function onFx(k,a){}
/* ---------- CPU players ---------- */
function bot(i){const p=pl[i];if(!p)return{};const o=brain(p);return flipped(p)?flipInp(o):o}
function brain(p){const i=p.i;const c=courts[p.court];if(!c)return{};const o={},lvl=p.i===meIdx()?(window.__tn.lv!=null?window.__tn.lv:2):K.cpu,b=c.ball,s=sgn(p.side),now=K.tick;
 const press=k=>{if(!p.bf){o[k]=true;p.bf=1}else p.bf=0};
 if(c.st==='serve'){if(server(c)===p&&now-c.t>24){if(!p.toss){if(--p.wt<0)press('fire')}else if(p.tvz<(lvl<0?.02:[.012,.007,.003][lvl])+Math.random()*.004){press('fire');const r=Math.random();if(r<.35)o.left=true;else if(r<.7)o.right=true}}else if(server(c)!==p){const h=homes(c)[p.i];if(h)steer(o,p,h[0],h[1],.15)}return o}
 if(c.st!=='rally'){p.bf=0;return o}
 const incoming=b.hs!==p.side&&b.b<2;
 if(incoming&&now-b.t>=(lvl<0?30:[22,15,9][lvl])){if(!p.plan||p.plan.sq!==b.sq)p.plan=plan(p,c,lvl);}
 const pn=p.plan&&p.plan.sq===b.sq&&incoming?p.plan:null;
 if(pn&&!pn.mate){const left=pn.at-now;steer(o,p,pn.x,pn.y,.12);
  if(left<=(lvl<0?13:4)&&p.sw<=0&&p.cd<=0)press(pn.lob?'alt':'fire');else if(p.sw>0)p.bf=0;
  if(left<=2&&p.sw>0){o.left=o.right=o.up=o.down=false;if(pn.ax<0)o.left=true;else if(pn.ax>0)o.right=true;if(pn.dp>0)o[p.side===0?'down':'up']=true;else if(pn.dp<0)o[p.side===0?'up':'down']=true}}
 else{p.bf=0;// recover: centre of the baseline, or the net for a doubles partner
  const net=dbl&&sidePl(c,p.side).length>1&&p.slot===(c.gs+c.srvN+p.side)%2,rx=dbl?(p.slot?1.8:-1.8)+b.x*.25:Math.max(-1.5,Math.min(1.5,b.x*.35)),ry=s*(net?4:HL+.8);steer(o,p,rx,ry,.3)}
 return o}
function steer(o,p,x,y,dz){const dx=x-p.x,dy=y-p.y;if(dx>dz)o.right=true;else if(dx<-dz)o.left=true;if(dy>dz)o.down=true;else if(dy<-dz)o.up=true}
function plan(p,c,lvl){const b=c.ball,path=predict(b,c.sf,170),s=sgn(p.side),spd=PSPD*(lvl<0?.8:[.82,.9,.97][lvl])*.92,err=gauss()*(lvl<0?.9:[.55,.3,.12][lvl]);let best=null,bestScore=1e9;
 if(path.some(q=>q.net&&q.b>=1&&q.y*s<0))return{sq:b.sq,mate:1};          // it's going into the net: nothing to do
 for(const q of path){if(q.b>=2)break;if(q.y*s<.3||Math.abs(q.y)>HL+2.6)continue;const okH=q.b===1?q.z<1.6:(q.z<2.3&&Math.abs(q.y)<8.5&&!b.srv);if(!okH)continue;
  const sx=q.x-hand(p)*.7+err,sy=q.y+s*.25,d=Math.hypot(sx-p.x,sy-p.y),need=d/spd,score=(need>q.t?(need-q.t)*3:0)+(q.b===1&&q.z>.45&&q.z<1.3?0:6)+q.t*.02;
  if(score<bestScore){bestScore=score;best={x:sx,y:sy,at:K.tick+q.t,q}}}
 if(!best)return{sq:b.sq,mate:1};
 // doubles: the partner nearer to the ball takes it
 for(const m of sidePl(c,p.side))if(m!==p&&Math.hypot(m.x-best.x,m.y-best.y)<Math.hypot(p.x-best.x,p.y-best.y)-.3)return{sq:b.sq,mate:1};
 const opp=sidePl(c,1-p.side),o0=opp[0]||{x:0,y:0},atNet=opp.some(q=>Math.abs(q.y)<6),r=Math.random();
 const ax=r<(lvl<0?.1:[.3,.45,.6][lvl])?(o0.x>0?-1:1):0,lob=atNet&&Math.random()<.5?1:0,dp=Math.random()<.2?1:Math.random()<.07?-1:0;
 return Object.assign(best,{sq:b.sq,ax,lob,dp})}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const plImg=(view,pose,col)=>img('p'+view+pose+col,()=>X.recolor(ART[view][pose]||ART[view].ready,col,{h:'#3a2414'},'t'+view+pose));
let V={cx:160,top:40};const ZS=13;   // height drawn at the players' scale (the sprites are taller than the ground scale)
function proj(x,y,z){if(V.f){x=-x;y=-y}const u=y+12,s=.75+u/60;return[V.cx+x*11*s,V.top+4.8*(.75*u+u*u/120)-z*ZS*s,s]}
function unproj(sx,sy,vr){const d=(sy-vr.top)/4.8,u=60*(-.75+Math.sqrt(Math.max(0,.5625+d/30))),s=.75+u/60,f=vr.f?-1:1;return[f*(sx-vr.cx)/(11*s),f*(u-12)]}
const C32=h=>{const c=X.hex(h);return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
// the court picture for one view size: surface, lines, run-off, ad boards and the crowd, inverse-projected per pixel
function courtImg(sname,w,h,dl){return img('court'+sname+w+'x'+h+dl,()=>{const sf=SURF[sname],cv=X.mk(w,h),g=cv.getContext('2d'),im=g.createImageData(w,h),o=new Uint32Array(im.data.buffer);
 const vr={cx:w/2,top:40},cC=sf.c.map(C32),cO=sf.o.map(C32),cW=C32('#f4f4ec'),cK=C32('#100c18'),cWall=C32('#1c4c34'),cWall2=C32('#163c2a');
 const ads=['#e83838','#f8c020','#2888ff','#f4f4ec','#20c040'].map(C32),crowd=['#e83838','#2888ff','#f8c020','#f4f4ec','#20c040','#ff78e0','#ff8020','#8060ff','#100c18','#5c566c'].map(C32),skin=['#f0b888','#c07850','#8c5c34'].map(C32);
 const by=V.top,bx=V.cx,bf=V.f;V.top=40;V.cx=w/2;V.f=false;const wallY=Math.round(proj(0,-HL-6.2,0)[1]);
 for(let y=0;y<h;y++){for(let x=0;x<w;x++){const q=y*w+x;let c;
  if(y<wallY-7){// crowd in the stands: rows of little people
   const ry=wallY-8-y,row=Math.floor(ry/5),cx=x+(row&1)*2,col=Math.floor(cx/4),yy=ry%5,xx=cx%4,hh=hash(col,row);
   c=C32(row%2?'#2c2638':'#3c3648');if(hh<.9){if(yy>=3&&xx>=1&&xx<=2)c=skin[Math.floor(hh*30)%3];else if(yy<=2&&xx<=3)c=crowd[Math.floor(hh*97)%crowd.length]}
   if(hash(col,row+77)<.08&&yy<=2)c=C32('#2c2638')}
  else if(y<wallY){const seg=Math.floor((x-w/2)/24+50),k=(x-w/2+1200)%24;c=y===wallY-7||y===wallY-1?cK:ads[seg%ads.length];if(k<2)c=cK;else if(y>wallY-6&&y<wallY-2&&(k%6===3)&&ads[seg%ads.length]!==cW)c=cW}
  else{const[wx,wy]=unproj(x+.5,y+.5,vr),s=.75+(wy+12)/60,ax=Math.abs(wx),ay=Math.abs(wy),lx=.55/(11*s),ly=.5/(4.8*s);
   if(ax>HWD+6.2)c=(Math.floor(wy)&1)?cWall:cWall2;
   else if(ax>HWD+5.6)c=ads[(Math.floor((wy+30)/3.2))%ads.length];
   else{const inC=ax<=HWD&&ay<=HL;c=inC?(sname==='grass'?cC[Math.floor((wy+30)/2.4)&1]:cC[hash(x,y)<.06?1:0]):(sname==='grass'?cO[Math.floor((wy+30)/2.4)&1]:cO[hash(x,y)<.05?1:0]);
    const L=(v,t,wd)=>Math.abs(v-t)<wd;
    if(ay<=HL+ly&&(L(ax,HWD,lx)||L(ax,HWS,lx)))c=cW;               // doubles and singles sidelines
    if(ax<=HWD+lx&&L(ay,HL,ly))c=cW;                                // baselines
    if(ax<=HWS+lx&&L(ay,SVC,ly))c=cW;                               // service lines
    if(ay<=SVC&&L(wx,0,lx))c=cW;                                    // centre service line
    if(L(wx,0,lx)&&ay>HL-.35&&ay<=HL)c=cW}}
  o[q]=c}}
 g.putImageData(im,0,0);V.top=by;V.cx=bx;V.f=bf;return cv})}
function drawNet(g,c){const xe=HWD+.9,[xa,ny]=proj(-xe,0,0),[xb]=proj(xe,0,0),x0=Math.min(xa,xb),x1=Math.max(xa,xb);
 for(let x=Math.round(x0);x<=Math.round(x1);x++){const wx=(x-V.cx)/(11*proj(0,0,0)[2]),top=Math.round(ny-netH(wx)*ZS*proj(0,0,0)[2]);
  for(let y=top+1;y<Math.round(ny);y++){if(((x+y)&1)===0){g.fillStyle='rgba(16,12,24,.75)';g.fillRect(x,y,1,1)}}g.fillStyle='#f4f4ec';g.fillRect(x,top,1,1)}
 g.fillStyle=P.k;g.fillRect(Math.round(x0)-1,Math.round(ny-15),3,15);g.fillRect(Math.round(x1)-1,Math.round(ny-15),3,15);g.fillStyle='#9a94a8';g.fillRect(Math.round(x0),Math.round(ny-14),1,14);g.fillRect(Math.round(x1),Math.round(ny-14),1,14);
 // the umpire's chair by the left post
 const ux=Math.round(proj(-HWD-2.2,0,0)[0]);g.fillStyle=P.k;g.fillRect(ux-4,ny-26,9,27);g.fillStyle='#b07038';g.fillRect(ux-3,ny-12,1,12);g.fillRect(ux+3,ny-12,1,12);g.fillRect(ux-3,ny-14,7,2);
 g.fillStyle='#f4f4ec';g.fillRect(ux-2,ny-21,5,7);g.fillStyle='#f0b888';g.fillRect(ux-1,ny-25,3,4);g.fillStyle='#2c2638';g.fillRect(ux-1,ny-26,3,1)}
function drawBall(g,b,heldBy){const[sx,sy,s]=proj(b.x,b.y,0),[bx,by]=proj(b.x,b.y,b.z);g.fillStyle='rgba(16,12,24,.55)';g.fillRect(Math.round(sx)-1,Math.round(sy),3,1);
 const x=Math.round(bx),y=Math.round(by);if(s>.92){g.fillStyle=P.k;g.fillRect(x-1,y-2,3,5);g.fillRect(x-2,y-1,5,3);g.fillStyle='#d8f048';g.fillRect(x-1,y-1,3,3);g.fillStyle='#f8ffb0';g.fillRect(x-1,y-1,1,1)}
 else{g.fillStyle=P.k;g.fillRect(x-1,y-1,4,4);g.fillStyle='#d8f048';g.fillRect(x,y,2,2)}}
function drawPl(g,p,me){const[sx,sy]=proj(p.x,p.y,0),view=(p.side===0)!==!!V.f?'b':'f',im=plImg(view,p.pose,p.col);
 g.fillStyle='rgba(16,12,24,.4)';g.fillRect(Math.round(sx)-5,Math.round(sy)-1,11,2);g.fillRect(Math.round(sx)-3,Math.round(sy)+1,7,1);
 g.drawImage(im,Math.round(sx)-17,Math.round(sy)-41);
 const hum=!isCpu(p);if(p===me){g.fillStyle=P.k;g.fillRect(Math.round(sx)-3,Math.round(sy)-35,7,4);g.fillStyle=(K.tick>>3)&1?'#ffffff':p.col;g.fillRect(Math.round(sx)-2,Math.round(sy)-34,5,1);g.fillRect(Math.round(sx)-1,Math.round(sy)-33,3,1)}
 else if(hum)X.text(g,(p.name||'').slice(0,6),Math.round(sx),Math.round(sy)-38<16?Math.round(sy)+3:Math.round(sy)-38,{col:p.col,align:'center',outline:P.k})}
function view(g,c,vx,vy,vw,vh,small){g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();g.translate(vx,vy);const fp=c&&K.focus().map(i=>pl[i]).find(p=>p&&p.court===c.k);V={cx:vw/2,top:40,f:!K.demo&&flipped(fp)};VR[c?c.k:-1]={cx:vx+vw/2,top:vy+40,x:vx,y:vy,w:vw,h:vh,f:V.f};
 g.drawImage(courtImg(c?c.surf:'hard',vw,vh,dbl?1:0),0,0);if(!c){g.restore();return}
 const me=fp||pl[meIdx()],ps=pl.filter(p=>p.court===c.k),b=c.ball;
 // aim cross: where your shot would go if you hit now
 if(me&&me.court===c.k&&c.st==='rally'&&b.hs!==me.side&&me.inp&&!K.demo){const[tx,ty]=aimTarget(me,c,me.inp,'fore'),[ax,ay]=proj(tx,ty,0);g.fillStyle=me.sw>0?'#fff07c':'rgba(255,255,255,.45)';const X0=Math.round(ax),Y0=Math.round(ay);g.fillRect(X0-2,Y0,5,1);g.fillRect(X0,Y0-1,1,3)}
 // painter's order down the screen: far players, the ball, the net and near players by depth
 const dz=y=>V.f?-y:y,items=ps.map(p=>[dz(p.y),()=>drawPl(g,p,me)]);items.push([0,()=>drawNet(g,c)]);items.push([dz(b.y)+(Math.abs(b.y)<.3?.4*Math.sign(dz(b.y)||1):0),()=>drawBall(g,b)]);
 items.sort((a,b)=>a[0]-b[0]).forEach(it=>it[1]());
 for(const t of texts){if(!me||t.who!==me.i||me.court!==c.k)continue;const[x,y]=proj(t.x,t.y,t.z);X.text(g,t.s,Math.round(x),Math.round(y)-20,{col:t.col,align:'center',outline:P.k})}
 if(c.call&&K.tick-c.callT<80)X.text(g,c.call,vw/2,small?52:62,{col:c.callCol||'#ffffff',align:'center',outline:P.k,scale:!small&&c.call.length<10?2:1});
 board(g,c,vw,vh,small,me);g.restore()}
const PT=['0','15','30','40'];
function ptLabel(c,s){if(c.win===s)return'WIN';return PT[Math.min(3,c.pts[s])]}
function board(g,c,vw,vh,small,me){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{}));
 const x0=3,y0=13,wd=small?58:84,nl=small?5:9;g.fillStyle='rgba(16,12,24,.82)';g.fillRect(x0,y0,wd,single&&!small?37:28);g.fillStyle='#5c566c';g.fillRect(x0,y0+9,wd,1);
 TX(single?'GAMES '+games[c.u[0]]+'-'+games[c.u[1]]:small&&c.k===0?'CENTRE':CNAME(c.k),x0+3,y0+2,{col:'#a0f0ff',outline:false});
 (V.f?[0,1]:[1,0]).forEach((s,j)=>{const y=y0+12+j*8,u=c.u[s],cols=units[u].map(i=>pl[i].col);cols.forEach((col,q)=>{g.fillStyle=col;g.fillRect(x0+3+q*3,y,2,5)});
  if(c.srv===s){g.fillStyle='#d8f048';g.fillRect(x0+wd-(small?19:26),y+1,3,3)}TX(small?units[u].map(i=>shortN(pl[i].name)).join('+').slice(0,dbl?5:4):uName(u).slice(0,nl),x0+10,y-1,{col:me&&units[u].includes(me.i)?'#ffffff':'#c8c4d8',outline:false});TX(ptLabel(c,s),x0+wd-3,y-1,{col:'#fff07c',align:'right',outline:false})});
 if(single&&!small)TX('FIRST TO '+gTarget,x0+3,y0+28,{col:'#9a94a8',outline:false})}
function ladder(g,x,y){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),me=meIdx();if(single||!courts.length)return;
 const n=courts.length,rowH=Math.min(9,Math.floor(120/(n+1)));g.fillStyle='rgba(16,12,24,.82)';g.fillRect(x-2,y-2,58,rowH*n+14);TX('ROUND '+round+'/'+rounds,x+1,y,{col:'#a0f0ff',outline:false});
 courts.forEach((c,k)=>{const yy=y+10+k*rowH;TX(k===0?'C':''+(k+1),x+1,yy,{col:k===0?'#fff07c':'#9a94a8',outline:false});[0,1].forEach(s=>{units[c.u[s]].forEach((i,q)=>{g.fillStyle=pl[i].col;g.fillRect(x+9+s*22+q*3,yy+1,2,5);if(i===me){g.fillStyle='#ffffff';g.fillRect(x+9+s*22+q*3,yy+6,2,1)}})});
  TX(c.st==='done'?'*':c.pts[1]+'',x+21,yy,{col:'#c8c4d8',outline:false});TX(c.st==='done'?'':c.pts[0]+'',x+51,yy,{col:'#c8c4d8',outline:false})})}
let SCR=null;
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H),w=SCR.w,h=SCR.h-(K.demo?0:9);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!courts.length&&!pl.length){SCR.present(ctx,W,H);return}
 let fs=K.demo?[]:K.focus(),cs=[];for(const i of fs){const p=pl[i];const k=p&&p.court>=0?p.court:0;if(!cs.includes(k))cs.push(k)}
 if(!cs.length)cs=[K.demo?Math.floor(K.tick/900)%Math.max(1,courts.length):0];cs=cs.slice(0,2);
 if(cs.length===1)view(g,courts[cs[0]],0,0,w,h,false);else{const hw2=w>>1;view(g,courts[cs[0]],0,0,hw2,h,true);view(g,courts[cs[1]],hw2,0,w-hw2,h,true);g.fillStyle=P.k;g.fillRect(hw2-1,0,2,h)}
 if(cs.length===1&&w>=300)ladder(g,w-60,13);hud(g,w,h);SCR.present(ctx,W,H)}
function hud(g,w,h){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),me=pl[meIdx()];
 if(K.demo){TX('CENTRE COURT',w/2,h-16,{col:'#fff07c',align:'center',scale:2});return}
 if(rs==='between'){const n=courts.length;g.fillStyle='rgba(16,12,24,.88)';g.fillRect(w/2-90,30,180,24+Math.ceil(order.length/2)*9);TX(round>=rounds?'FINAL LADDER':'ROUND '+(round+1)+' - NEW COURTS',w/2,34,{col:'#fff07c',align:'center'});
  order.forEach((u,j)=>{const k=j>>1,y=46+k*9,x=w/2+(j&1?6:-6),nm=uName(u).slice(0,9),mv=moves[u]|0;TX((j&1?'':(k===n&&bye>=0?'WAIT ':k===0?'C ':(k+1)+' '))+nm+(mv>0?' +':mv<0?' -':''),x,y,{col:me&&units[u].includes(me.i)?'#ffffff':mv>0?'#88dc48':mv<0?'#f05050':'#c8c4d8',align:j&1?'left':'right',outline:false})});return}
 if(!me)return;const c=courts[me.court];
 if(me.court<0){TX('YOU SIT OUT THIS ROUND - BACK IN NEXT ROUND',w/2,h-22,{col:'#fff07c',align:'center'});return}
 if(!c)return;const tut=round===1&&K.tick<60*40;
 if(c.st==='serve'&&server(c)===me)TX(me.toss?'SPACE AGAIN AT THE TOP!':'SPACE: TOSS   HOLD A / D: AIM THE SERVE',w/2,h-12,{col:'#ffffff',align:'center'});
 else if(c.st==='rally'&&tut)TX('SPACE: SWING (EARLY IS FINE)  E: LOB  HOLD A/D: AIM',w/2,h-12,{col:'#ffffff',align:'center'});
 if(c.st==='done'&&!single)TX('WAITING FOR THE OTHER COURTS',w/2,h-12,{col:'#a0f0ff',align:'center'})}
K=RA.kit({id:'tennis',name:'CENTRE COURT',kind:'Sports',players:'1-20 players',demo:4,localFirst:true,baseH:180,
 desc:'Fast 8-bit tennis for up to 20: everyone plays at once on a ladder of courts - win your game and move up, lose and move down, until the best player holds Centre Court.',
 blurb:'SPACE toss, SPACE again at the top to serve. Run to the ball and SPACE to swing - the racket waits for the ball. E lobs. Hold a direction (or point the mouse) to aim.',
 howto:'WASD move, SPACE swing / serve (mouse button too), E lob, hold A / D to aim (or point with the mouse). Win your game to climb the ladder of courts.',
 icon:['....kkk...','...kwwwk..','..kw.w.wk.','..kww.wwk.','..kw.w.wk.','...kwwwk..','....kn....','...kn...y.','..kn.....y','.kn.......'],
 music:MUSIC,fireLabel:'SWING',
 modes:[['SINGLES LADDER','One game per court per round: winners move up, losers move down.'],['DOUBLES LADDER','Seats pair up (1+2, 3+4, ...) and climb the courts together.']],
 settings:[['len','Match',[[1,'Normal'],[0,'Short'],[2,'Long']]],['surface','Courts',[['mix','Grass, hard and clay'],['hard','All hard'],['clay','All clay'],['grass','All grass']]]],
 kb:[['WASD','move / aim'],['SPACE','swing'],['E','lob'],['C','chat'],['ESC','menu']],pad:[['LS','move / aim'],['A','swing'],['B','lob'],['START','menu']],
 aim:(i,fx,fy)=>{const p=K.isClient()?pl[K.myIdx]:pl[i];if(!p||!SCR)return null;const vr=VR[p.court];if(!vr)return null;const[wx,wy]=unproj(fx*SCR.w,fy*SCR.h,vr);return Math.atan2(wy-p.y,wx-p.x)},
 ach:[{id:'first',name:'Ball Kid',desc:'Play your first match',test:s=>s.played>=1,unlock:'title:Ball Kid'},{id:'win1',name:'Centre Court',desc:'Finish top of the ladder',test:(s,m)=>m.won,unlock:'title:Champion'},
  {id:'ace',name:'Ace!',desc:'Serve an ace',test:(s,m)=>m.aces>=1,unlock:'title:Ace'}],
 alive:i=>!!pl[i],out:i=>false,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf:i=>{const u=units.findIndex(u=>u.includes(i));return dbl?u:i},
 info:()=>dbl?'DOUBLES':'SINGLES',
 ranks:()=>{const ord=single?units.map((u,i)=>i).sort((a,b)=>games[b]-games[a]):order.slice();return ord.map((u,j)=>{const p=pl[units[u][0]];return[uName(u),p.col,single?games[u]+' game'+(games[u]===1?'':'s'):j===0?'Champion':j===1?'Centre Court':'Court '+(1+(j>>1))]})},
 result:(i,w)=>{const p=pl[i];return{won:!!w&&(w.team!=null?units[w.team]&&units[w.team].includes(i):w.i===i),kills:p.wins|0,aces:p.aces|0}}});
window.__tn={get pl(){return pl},get courts(){return courts},get order(){return order},get round(){return round},get rs(){return rs},get games(){return games},K,bot:i=>bot(i),predict,reset:c=>resetPoint(c)};

})();
