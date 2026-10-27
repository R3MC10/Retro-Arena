/* TETRONIX for Retro Arena: everyone vs everyone in a falling-block showdown, up to 20 lit 3D-looking wells. Lag-free: your well runs on your machine.
   A / D move, S soft drop, Space hard drop, W rotate, Q rotate back, E or Shift hold (modern rules). Lines become garbage for a rival
   (2 lines = 1, 3 = 2, TETRONIX = 4, back-to-back and combos add more); incoming garbage waits in the red meter and your own clears cancel it.
   Knock players out to earn badges that boost your attacks. Host picks rules (modern / classic), targeting, badges, items and length.
   Tetronix items (party): garbage lines can hold a glowing block. Clear that line to fire it: BOMB (blasts your bottom 4 rows),
   S-Z STORM (a rival's next 4 pieces are S and Z), LIGHTS OUT (a rival's well goes dark), MIRROR (a rival's left and right swap),
   ROCKET (a rival falls 3x faster), SHIELD (block all garbage for 10 s). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const CW=10,CH=22,VIS=20;
const SH={I:[[0,1],[1,1],[2,1],[3,1]],O:[[1,0],[2,0],[1,1],[2,1]],T:[[1,0],[0,1],[1,1],[2,1]],S:[[1,0],[2,0],[0,1],[1,1]],Z:[[0,0],[1,0],[1,1],[2,1]],J:[[0,0],[0,1],[1,1],[2,1]],L:[[2,0],[0,1],[1,1],[2,1]]};
const PN='IOTSZJL',PC={I:'#30e0f0',O:'#f8d830',T:'#b050f0',S:'#40e040',Z:'#f03838',J:'#3060f8',L:'#f89020',G:'#8a8a98',X:'#ffffff'};
const ITEMS=[null,{n:'BOMB',c:'#ff5030'},{n:'S-Z STORM',c:'#50f050'},{n:'LIGHTS OUT',c:'#303050'},{n:'MIRROR',c:'#c0e0ff'},{n:'ROCKET',c:'#ff8020'},{n:'SHIELD',c:'#40c0ff'}];
RA.audio.add('tmove',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.value=330;g.gain.setValueAtTime(.025,now);g.gain.exponentialRampToValueAtTime(.001,now+.03);o.connect(g);o.start();o.stop(now+.04)});
RA.audio.add('tlock',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.value=150;g.gain.setValueAtTime(.1,now);g.gain.exponentialRampToValueAtTime(.001,now+.07);o.connect(g);o.start();o.stop(now+.08)});
RA.audio.add('tline',(AC,now,g,n)=>{[0,.05,.1,.15].slice(0,Math.max(1,n|0)).forEach((d,k)=>{const o=AC.createOscillator(),v=AC.createGain();o.type='square';o.frequency.value=[523,659,784,1047][k];v.gain.setValueAtTime(.05,now+d);v.gain.exponentialRampToValueAtTime(.001,now+d+.12);o.connect(v);v.connect(g);o.start(now+d);o.stop(now+d+.13)})});
const MUSIC=[T('Korobeiniki',150,['Am','E','Am','E'],'k...s...k.k.s...','e5 - b4 c5 d5 - c5 b4 a4 - a4 c5 e5 - d5 c5 b4 - - c5 d5 - e5 - c5 - a4 - a4 - - - . d5 - f5 a5 - g5 f5 e5 - - c5 e5 - d5 c5 b4 - b4 c5 d5 - e5 - c5 - a4 - a4 - - -'),
 T('Kalinka',132,['Dm','A','Dm','A'],'k.hsk.hsk.hsk.hs','a4 . g4 f4 e4 . f4 . g4 . f4 e4 d4 . e4 . f4 . e4 d4 c#4 . d4 . e4 - - - a4 - - -'),
 T('Troika',164,['Em','B','Em','B'],'k.hhs.hhk.hhs.hk','e5 b4 e5 g5 f#5 e5 d#5 b4 e5 b4 e5 g5 b5 a5 g5 f#5 e5 g5 b5 e6 d#6 b5 f#5 d#5 e5 - - . b4 - - .'),
 T('Last Well',180,['Am','F','G','E'],'k.hsk.hsk.hsk.ss','a5 . e5 . c5 . a4 . f5 . c5 . a4 . f4 . g5 . d5 . b4 . g4 . e5 - g#5 - b5 - e6 -')];
let K,boards=[];
const rot=(cells,r,p)=>{let c=cells.map(a=>a.slice());const n=p==='I'?4:p==='O'?4:3;for(let k=0;k<((r%4)+4)%4;k++)c=c.map(([x,y])=>p==='O'?[x,y]:[n-1-y,x]);return c};
function bag(b){if(!b.bag||!b.bag.length){b.bag=K.S.rules==='classic'?[PN[Math.floor(b.rr()*7)]]:[...PN].sort(()=>b.rr()-.5)}return b.bag.pop()}
function newBoard(i,name,col){const b={i,name,col,well:new Array(CW*CH).fill(''),items:{},cur:null,next:[],hold:'',held:false,lines:0,score:0,kos:0,badges:0,out:false,
  pend:[],sentN:0,outLog:[],outSeq:0,outq:[],inbox:[],inSeen:0,inSeq:0,rSeen:0,combo:-1,b2b:false,fx:{},das:0,dir:0,grav:0,lockT:0,lockN:0,prev:{},tag:'',tagT:0,lastFrom:-1,ver:0,cpu:null,rr:RA.util.mulberry(K.seed+1)};
 for(let k=0;k<5;k++)b.next.push(bag(b));spawn(b);return b}
function spawn(b){let p=b.fx.storm>0?(b.rr()<.5?'S':'Z'):b.next.shift();if(b.fx.storm>0)b.fx.storm--;else b.next.push(bag(b));
 b.cur={p,r:0,x:p==='O'?3:3,y:0};b.held=false;b.lockT=0;b.lockN=0;if(collide(b,b.cur)){b.out=true;b.outAt=K.tick;sfx('boom');tag(b,'K.O.')}}
function cells(c){return rot(SH[c.p],c.r,c.p).map(([x,y])=>[x+c.x,y+c.y])}
function collide(b,c){for(const[x,y]of cells(c)){if(x<0||x>=CW||y>=CH)return true;if(y>=0&&b.well[y*CW+x])return true}return false}
function tryMove(b,dx,dy,dr){const c={...b.cur,x:b.cur.x+dx,y:b.cur.y+dy,r:b.cur.r+dr};if(!dr){if(collide(b,c))return false;b.cur=c;return true}
 for(const[kx,ky]of[[0,0],[-1,0],[1,0],[0,-1],[-2,0],[2,0],[-1,-1],[1,-1]]){const t={...c,x:c.x+kx,y:c.y+ky};if(!collide(b,t)){b.cur=t;return true}}return false}
function gravity(b){const lv=Math.floor(b.lines/10)+Math.floor(K.tick/3600*(K.S.speed|0)),f=Math.max(1,48-lv*5);return b.fx.rocket>0?Math.max(1,f/3):f}
function stepBoard(b,inp){if(b.out)return;for(const k in b.fx)if(b.fx[k]>0&&k!=='storm')b.fx[k]--;if(b.tagT>0)b.tagT--;
 const ed=k=>inp[k]&&!b.prev[k];let L=inp.left,R=inp.right;if(b.fx.mirror>0){[L,R]=[R,L]}
 const modern=K.S.rules!=='classic';
 if(ed('alt')||ed('b4'))if(modern&&!b.held){const h=b.hold;b.hold=b.cur.p;if(h){b.cur={p:h,r:0,x:3,y:0};if(collide(b,b.cur)){b.out=true;b.outAt=K.tick;tag(b,'K.O.');sfx('boom')}}else spawn(b);b.held=true;sfx('sel')}
 if(b.out)return;
 if(ed('up')){if(tryMove(b,0,0,1)){sfx('tmove');b.lockT=0;b.lastRot=true}}if(ed('b3')){if(tryMove(b,0,0,-1)){sfx('tmove');b.lockT=0;b.lastRot=true}}
 const d=L&&!R?-1:R&&!L?1:0;if(d!==b.dir){b.dir=d;b.das=0;if(d&&tryMove(b,d,0,0)){sfx('tmove');b.lastRot=false;if(b.lockN<15)b.lockT=0}}
 else if(d){b.das++;if(b.das>10&&b.das%2===0&&tryMove(b,d,0,0)){b.lastRot=false;if(b.lockN<15)b.lockT=0}}
 if(inp.tap&&modern){let n=0;while(tryMove(b,0,1,0))n++;b.score+=n*2;lock(b);b.prev=Object.assign({},inp);return}
 b.grav+=inp.down?Math.max(1,gravity(b)/2)*2:1;const g=inp.down?2:gravity(b);
 if(b.grav>=g){b.grav=0;if(tryMove(b,0,1,0)){if(inp.down)b.score++;b.lastRot=false}}
 if(collide(b,{...b.cur,y:b.cur.y+1})){b.lockT++;b.lockN++;if(b.lockT>(modern?30:2)||b.lockN>180)lock(b)}
 b.prev=Object.assign({},inp)}
function tspin(b){if(b.cur.p!=='T'||!b.lastRot)return false;const{x,y}=b.cur;let n=0;for(const[dx,dy]of[[0,0],[2,0],[0,2],[2,2]]){const X=x+dx,Y=y+dy;if(X<0||X>=CW||Y>=CH||Y>=0&&b.well[Y*CW+X])n++}return n>=3}
function lock(b){const ts=tspin(b);for(const[x,y]of cells(b.cur))if(y>=0)b.well[y*CW+x]=b.cur.p;sfx('tlock');
 const full=[];for(let y=0;y<CH;y++){let f=true;for(let x=0;x<CW;x++)if(!b.well[y*CW+x]){f=false;break}if(f)full.push(y)}
 let fired=[];for(const y of full){const it=b.items[y];if(it)fired.push(it)}
 if(full.length){for(const y of full){b.well.splice(y*CW,CW);b.well.unshift(...new Array(CW).fill(''))}
  const ni={};for(const k in b.items){const y=+k,below=full.filter(f=>f>y).length;if(!full.includes(y))ni[y+below]=b.items[k]}b.items=ni;
  b.lines+=full.length;b.combo++;const n=full.length;b.score+=[0,100,300,500,800][n]*(1+Math.floor(b.lines/10));sfx('tline',n);
  let atk=ts?n*2:[0,0,1,2,4][n];const hard=n===4||ts;if(hard&&b.b2b)atk++;b.b2b=hard;atk+=[0,0,1,1,2,2,3,3,4,4,4][Math.min(10,b.combo)]||0;
  if(K.S.badges==='on')atk=Math.floor(atk*(1+Math.min(4,b.badges)*.25));
  if(!b.well.some(Boolean))atk+=4;
  tag(b,ts?'T-SPIN '+['','SINGLE','DOUBLE','TRIPLE'][n]:n===4?'TETRONIX!':b.combo>1?b.combo+' COMBO':'');
  // your clears cancel your own incoming garbage first
  while(atk>0&&b.pend.length){const c=Math.min(atk,b.pend[0]);b.pend[0]-=c;atk-=c;if(!b.pend[0])b.pend.shift()}
  if(atk>0&&K.S.att!=='off')b.outq.push('G'+atk);
  for(const it of fired)fire(b,it)}
 else{b.combo=-1;// garbage rises when you lock without clearing
  if(b.pend.length&&!(b.fx.shield>0)){let n=0;while(b.pend.length&&n<8){const c=Math.min(8-n,b.pend[0]);addGarbage(b,c);n+=c;b.pend[0]-=c;if(!b.pend[0])b.pend.shift()}}}
 b.ver++;spawn(b)}
function addGarbage(b,n){const hole=Math.floor(b.rr()*CW);for(let k=0;k<n;k++){if(b.well.slice(0,CW).some(Boolean)){b.out=true;b.outAt=K.tick;tag(b,'K.O.');return}
  b.well.splice(0,CW);b.well.push(...Array.from({length:CW},(_,x)=>x===hole?'':'G'));const ni={};for(const k2 in b.items)ni[+k2-1]=b.items[k2];b.items=ni;
  if(K.S.items==='party'&&b.rr()<.25)b.items[CH-1]=1+Math.floor(b.rr()*6)}}
function fire(b,it){tag(b,ITEMS[it].n);sfx('pick');if(it===1){b.well.splice((CH-4)*CW,4*CW);b.well.unshift(...new Array(4*CW).fill(''));b.items={}}else if(it===6)b.fx.shield=600;else b.outq.push('I'+it)}
function receive(b,code,from){if(b.out)return;b.lastFrom=from;if(code[0]==='G'){if(b.fx.shield>0){tag(b,'BLOCKED');return}b.pend.push(Math.min(12,+code.slice(1)|0));tag(b,'+'+code.slice(1)+' ▲')}
 else{const it=+code.slice(1);if(it===2)b.fx.storm=4;else if(it===3)b.fx.dark=420;else if(it===4)b.fx.mirror=420;else if(it===5)b.fx.rocket=480;tag(b,ITEMS[it]?ITEMS[it].n+'!':'')}}
function tag(b,s){if(!s)return;b.tag=s;b.tagT=70}
/* routing (host) */
function pickTarget(from){const al=boards.filter(o=>o!==from&&!o.out);if(!al.length)return null;const m=K.S.target;
 if(m==='attacker'){const a=al.filter(o=>o.lastFrom===from.i);if(a.length)return a[Math.floor(Math.random()*a.length)];if(from.lastFrom>=0&&boards[from.lastFrom]&&!boards[from.lastFrom].out)return boards[from.lastFrom]}
 if(m==='ko')return al.slice().sort((a,c)=>stackH(c)-stackH(a))[0];if(m==='badges')return al.slice().sort((a,c)=>c.badges-a.badges)[0];
 return al[Math.floor(Math.random()*al.length)]}
function stackH(b){for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(b.well[y*CW+x])return CH-y;return 0}
function route(from,code){const t=pickTarget(from);if(!t)return;t.lastHit=from.i;t.lastHitT=K.tick;
 if(K.seats[t.i].ctrl==='net'){t.inbox.push([++t.inSeq,code,from.i]);if(t.inbox.length>12)t.inbox.shift()}else receive(t,code,from.i);K.fx('a',from.i,t.i)}
function outflow(b){while(b.outq.length){const c=b.outq.shift();b.outSeq++;b.outLog.push([b.outSeq,c]);if(b.outLog.length>12)b.outLog.shift();if(!K.isClient())route(b,c)}}
function checkKOs(){for(const b of boards)if(b.out&&!b.koDone){b.koDone=true;const k=b.lastHit;if(k!=null&&boards[k]&&K.tick-(b.lastHitT|0)<900){boards[k].kos++;boards[k].badges+=1+b.badges;K.fx('k',k,b.i)}}}
/* packing for the network */
function pack(b){return{w:b.well.map(c=>c||'.').join(''),it:b.items,c:b.cur?[b.cur.p,b.cur.r,b.cur.x,b.cur.y]:0,n:b.next.slice(0,3).join(''),h:b.hold,p:b.pend.reduce((a,v)=>a+v,0),
 l:b.lines,s:b.score,k:b.kos,bd:b.badges,o:b.out?1:0,fx:Object.keys(b.fx).filter(k=>b.fx[k]>0).join(','),t:b.tagT>0?b.tag:'',is:b.inSeen,oq:b.outLog.slice(-8),v:b.ver}}
function unpack(b,d){if(!d)return;if(typeof d.w==='string'&&d.w.length===CW*CH)b.well=[...d.w].map(c=>c==='.'?'':c);b.items=d.it||{};
 b.cur=Array.isArray(d.c)&&SH[d.c[0]]?{p:d.c[0],r:d.c[1]|0,x:d.c[2]|0,y:d.c[3]|0}:null;b.next=String(d.n||'').split('').filter(c=>SH[c]);b.hold=SH[d.h]?d.h:'';
 b.pendN=d.p|0;b.lines=d.l|0;b.score=d.s|0;b.kos=d.k|0;b.badges=d.bd|0;b.out=!!d.o;b.fxs=String(d.fx||'');if(d.t&&d.t!==b.tag){b.tag=d.t;b.tagT=60}}
function start(seats,md,S,seed){boards=seats.map((s,i)=>newBoard(i,s.name,s.col))}
function step(){for(const b of boards){const s=K.seats[b.i];
  if(s.ctrl==='net'){if(!K.R.peer(s.peer)){if(!b.out){b.out=true;b.outAt=K.tick;tag(b,'LEFT')}continue}if(b.tagT>0)b.tagT--;const d=K.remote(b.i);if(d){const wasOut=b.out;unpack(b,d);b.inbox=b.inbox.filter(e=>e[0]>(d.is|0));for(const e of d.oq||[])if((e[0]|0)>b.rSeen){b.rSeen=e[0]|0;route(b,String(e[1]))}if(!wasOut&&b.out)b.outAt=K.tick}continue}
  stepBoard(b,K.inp(b.i));outflow(b)}
 checkKOs();const al=boards.filter(b=>!b.out),lim=K.S.len*3600;
 if(boards.length>1?al.length<=1:!al.length){K.end(al[0]?{i:al[0].i}:null);return}
 if(lim&&K.tick>=lim){const w=al.slice().sort((a,c)=>c.kos-a.kos||c.score-a.score)[0];K.end(w?{i:w.i}:null)}
 if(al.length===2&&boards.length>2||al.length<=Math.max(2,boards.length/4)&&boards.length>4)K.track(3)}
function local(i){const b=boards[i];if(!b)return;stepBoard(b,K.inp(i));outflow(b)}
function upload(i){return boards[i]?pack(boards[i]):null}
// Two rotating wells bound traffic at 20 seats; moving pieces update every send.
let rotN=0;function snap(){const first=rotN;rotN=(rotN+2)%boards.length;return{b:boards.map((b,k)=>{const d=pack(b),send=(k-first+boards.length)%boards.length<2;
 const w=send?d.w.replace(/\.+$/,'').replace(/([.IOTSZJLGX])\1{2,25}/g,z=>String.fromCharCode(96+z.length)+z[0])||'.':'';
 return[w,d.c,d.n,d.h,d.p,d.l,d.s,d.k,d.bd,d.o,d.fx,d.t,b.out?[]:b.inbox.slice(-8),d.it]})}}
function apply(g){(g.b||[]).forEach((a,k)=>{const b=boards[k];if(!b)return;const d={c:a[1],n:a[2],h:a[3],p:a[4],l:a[5],s:a[6],k:a[7],bd:a[8],o:a[9],fx:a[10],t:a[11],in:a[12],it:a[13]};
 if(a[0])d.w=a[0].replace(/([a-z])([.IOTSZJLGX])/g,(_,n,c)=>c.repeat(n.charCodeAt(0)-96)).padEnd(CW*CH,'.');
 if(k===K.myIdx){b.kos=d.k|0;b.badges=d.bd|0;for(const e of d.in||[])if((e[0]|0)>b.inSeen){b.inSeen=e[0]|0;receive(b,String(e[1]),e[2]|0)}return}
  const wasOut=b.out;unpack(b,d);if(!wasOut&&b.out)b.outAt=K.tick})}
function follow(){for(const b of boards)if(b.i!==K.myIdx&&b.tagT>0)b.tagT--}
function onFx(k,a){if(k==='a'&&a[1]===K.myIdx)sfx('boom');if(k==='k'&&a[0]===K.myIdx){const b=boards[a[0]];if(b)tag(b,'K.O. BADGE!')}}
/* CPU: the classic placement score (height, holes, bumpiness, lines), then walk the piece there */
function plan(b){let best=null;for(let r=0;r<4;r++)for(let x=-2;x<CW;x++){let c={...b.cur,r,x,y:0};if(collide(b,c))continue;while(!collide(b,{...c,y:c.y+1}))c.y++;
  const w=b.well.slice();for(const[px,py]of cells(c))if(py>=0)w[py*CW+px]='x';let lines=0;for(let y=0;y<CH;y++){let f=true;for(let xx=0;xx<CW;xx++)if(!w[y*CW+xx]){f=false;break}if(f)lines++}
  const h=[];let holes=0;for(let xx=0;xx<CW;xx++){let top=CH;for(let y=0;y<CH;y++)if(w[y*CW+xx]){top=y;break}h.push(CH-top);for(let y=top+1;y<CH;y++)if(!w[y*CW+xx])holes++}
  let bump=0;for(let xx=0;xx<CW-1;xx++)bump+=Math.abs(h[xx]-h[xx+1]);const agg=h.reduce((a,v)=>a+v,0);
  const sc=-.51*agg+.76*lines-.36*holes-.18*bump+Math.random()*(K.cpu===0?3:K.cpu===1?.6:.05);if(!best||sc>best.sc)best={sc,r,x}}return best}
function bot(i){const b=boards[i];if(!b||b.out||!b.cur)return{};const o={};const key=b.cur.p+b.ver;if(b.planK!==key){b.planK=key;b.plan=plan(b);b.wait=K.cpu===0?40:K.cpu===1?16:5}
 if(--b.wait>0)return{};const p=b.plan;if(!p)return{tap:true};
 if(((b.cur.r%4)+4)%4!==p.r){if(K.tick%3===0)o.up=true;return o}if(b.cur.x<p.x)o.right=true;else if(b.cur.x>p.x)o.left=true;else if(K.tick%(K.cpu===2?3:8)===0)o.tap=true;
 if(o.left||o.right){if(K.tick%3)return{};}return o}
/* drawing: lit well, glossy bevelled blocks, my well big */
const BL={};function block(p,s){const k=p+s;if(BL[k])return BL[k];const c=document.createElement('canvas'),Q=3;c.width=c.height=s*Q;const g=c.getContext('2d');g.scale(Q,Q);const col=PC[p]||PC.G;
 const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,RA.util.mix(col,'#ffffff',.5));gr.addColorStop(.45,col);gr.addColorStop(1,RA.util.mix(col,'#000000',.45));g.fillStyle=gr;g.fillRect(0,0,s,s);
 g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,0,s,s*.12);g.fillRect(0,0,s*.12,s);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,s*.88,s,s*.12);g.fillRect(s*.88,0,s*.12,s);
 const gl=g.createRadialGradient(s*.3,s*.3,0,s*.3,s*.3,s*.5);gl.addColorStop(0,'rgba(255,255,255,.55)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(0,0,s,s);return BL[k]=c}
const S=10,WW=CW*S+40,WH=VIS*S+30;
function drawWell(g,b,X,Y,sc,mine){g.save();g.translate(X,Y);g.scale(sc,sc);
 const fr=g.createLinearGradient(0,0,WW,0);fr.addColorStop(0,'#5a6074');fr.addColorStop(.5,'#c8d0e4');fr.addColorStop(1,'#40465a');g.fillStyle=fr;g.fillRect(14,4,CW*S+12,VIS*S+12);
 const bg=g.createLinearGradient(0,10,0,VIS*S+10);bg.addColorStop(0,'#101830');bg.addColorStop(1,'#06080f');g.fillStyle=bg;g.fillRect(20,10,CW*S,VIS*S);
 g.strokeStyle='rgba(120,150,220,.08)';g.lineWidth=.5;for(let x=1;x<CW;x++){g.beginPath();g.moveTo(20+x*S,10);g.lineTo(20+x*S,10+VIS*S);g.stroke()}
 const dark=(mine?b.fx.dark>0:false)||(b.fxs||'').includes('dark');
 for(let y=CH-VIS;y<CH;y++)for(let x=0;x<CW;x++){const c=b.well[y*CW+x];if(!c)continue;const yy=10+(y-(CH-VIS))*S;g.drawImage(block(c,S),20+x*S,yy,S,S)}
 for(const k in b.items){const y=+k;if(y<CH-VIS)continue;const it=ITEMS[b.items[k]];if(!it)continue;const yy=10+(y-(CH-VIS))*S;g.strokeStyle=it.c;g.lineWidth=1.5;g.strokeRect(21,yy+1,CW*S-2,S-2);
  g.fillStyle=it.c;g.globalAlpha=.5+.4*Math.sin(K.tick*.2);g.fillRect(20+((K.tick>>3)%CW)*S+2,yy+2,S-4,S-4);g.globalAlpha=1}
 if(b.cur&&!b.out){if(K.S.rules!=='classic'&&mine){let gy=b.cur.y;while(!collide(b,{...b.cur,y:gy+1})&&gy<CH)gy++;g.globalAlpha=.25;for(const[x,y]of cells({...b.cur,y:gy}))if(y>=CH-VIS)g.drawImage(block(b.cur.p,S),20+x*S,10+(y-(CH-VIS))*S,S,S);g.globalAlpha=1}
  for(const[x,y]of cells(b.cur))if(y>=CH-VIS)g.drawImage(block(b.cur.p,S),20+x*S,10+(y-(CH-VIS))*S,S,S)}
 if(dark){g.fillStyle='rgba(0,0,0,.93)';g.fillRect(20,10+VIS*S*.25,CW*S,VIS*S*.75)}
 // garbage meter
 const pn=b.pend?b.pend.reduce((a,v)=>a+v,0):b.pendN|0;g.fillStyle='#200';g.fillRect(14,10,4,VIS*S);if(pn){g.fillStyle=(K.tick>>3)&1?'#ff3030':'#ff8060';const h=Math.min(VIS,pn)*S;g.fillRect(14,10+VIS*S-h,4,h)}
 // next + hold (only on the big well)
 if(mine){g.font='6px "Russo One",sans-serif';g.fillStyle='#fff';g.textAlign='left';g.fillText('NEXT',CW*S+28,16);(b.next||[]).slice(0,3).forEach((p,k)=>{for(const[x,y]of rot(SH[p],0,p))g.drawImage(block(p,6),CW*S+28+x*6,22+k*22+y*6,6,6)});
  if(K.S.rules!=='classic'){g.fillText('HOLD',-26,16);if(b.hold)for(const[x,y]of rot(SH[b.hold],0,b.hold))g.drawImage(block(b.hold,6),-26+x*6,22+y*6,6,6)}
  g.fillText('LINES '+b.lines,CW*S+28,100);g.fillText('KO '+b.kos,CW*S+28,110);g.fillText('BADGE '+b.badges,CW*S+28,120);const f=Object.keys(b.fx).filter(k=>b.fx[k]>0);if(f.length)g.fillText(f.join(' ').toUpperCase(),CW*S+28,132)}
 g.font='7px "Russo One",sans-serif';g.textAlign='center';g.fillStyle=b.col;g.fillText(String(b.name).slice(0,12),20+CW*S/2,VIS*S+24);
 if(b.tagT>0){g.font='10px "Russo One",sans-serif';g.fillStyle='rgba(0,0,0,.6)';g.fillText(b.tag,21+CW*S/2,VIS*S/2+11);g.fillStyle='#fff';g.fillText(b.tag,20+CW*S/2,VIS*S/2+10)}
 if(b.out){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(20,10,CW*S,VIS*S);g.font='14px "Russo One",sans-serif';g.fillStyle='#f04848';g.fillText('K.O.',20+CW*S/2,VIS*S/2+10)}
 g.restore()}
function render(g,Wv,Hv){const bg=g.createRadialGradient(Wv/2,Hv/2,10,Wv/2,Hv/2,Wv*.7);bg.addColorStop(0,'#1a1430');bg.addColorStop(1,'#04040a');g.fillStyle=bg;g.fillRect(0,0,Wv,Hv);
 if(!boards.length)return;const fs=K.demo?[]:K.focus(),main=fs.length===1?boards[fs[0]]:null,top=24,bot=Hv-28;
 const grid=(list,ax,aw)=>{const ah=bot-top,pad=!main&&fs.length?40:0,gw=WW+pad*2;let best=null;for(let cols=1;cols<=list.length;cols++){const rows=Math.ceil(list.length/cols),sc=Math.min(aw/cols/gw,ah/rows/WH);if(!best||sc>best.sc)best={cols,sc}}
  const tw=best.cols*gw*best.sc,ox=ax+(aw-tw)/2;list.forEach((b,k)=>drawWell(g,b,ox+((k%best.cols)*gw+pad)*best.sc,top+Math.floor(k/best.cols)*WH*best.sc,best.sc,!main&&fs.includes(b.i)))};
 if(main){const sc=(bot-top)/WH,mw=(WW+40)*sc;drawWell(g,main,30*sc,top,sc,true);const rest=boards.filter(b=>b!==main);if(rest.length)grid(rest,mw+20,Wv-mw-28)}else grid(boards,8,Wv-16)}
K=RA.kit({id:'tetris',name:'TETRONIX',kind:'Falling blocks',players:'1-20 players',demo:6,localFirst:true,
 desc:'Everyone vs everyone in a falling-block showdown: up to 20 lit 3D-looking wells, garbage attacks, KO badges, modern or classic rules, and Tetronix-only party items.',
 blurb:'A / D move, W rotates, S soft drops, Space hard drops, E holds. Clear lines to bury rivals in garbage. Last well standing wins.',
 howto:'A / D move, W rotate, Q rotate back, S soft drop, Space hard drop, E or Shift hold. Gamepad: d-pad moves, up rotates, A hard drop, B hold, X rotate back.',
 icon:['..........','.cccc.....','..........','....yy....','....yy....','.p......rr','ppp....rr.','.....gg...','.bbbgg....','.b........'],
 music:MUSIC,fireLabel:'DROP',
 modes:[['99 BATTLE','Everyone vs everyone. Last well standing wins.']],
 settings:[['rules','Rules',[['modern','Modern (hold, ghost, 7-bag)'],['classic','Classic NES']]],['target','Garbage target',[['random','Random'],['attacker','Attackers'],['ko','K.O.s (highest stack)'],['badges','Badges']]],
  ['badges','Badges',[['on','On'],['off','Off']]],['items','Items',[['off','Off'],['party','Wild party']]],['att','Garbage',[['on','On'],['off','Off']]],['speed','Speed-up',[[1,'Normal'],[2,'Fast'],[0,'None']]],['len','Time limit',[[0,'None'],[5,'5 min'],[10,'10 min']]]],
 kb:[['A D','move'],['W','rotate'],['S','soft drop'],['SPACE','hard drop'],['E','hold'],['C','chat'],['ESC','menu']],pad:[['DPAD','move'],['UP','rotate'],['A','hard drop'],['B','hold'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Comrade',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Comrade'},{id:'win1',name:'Last Well Standing',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Number One'},
  {id:'ko3',name:'Badge Collector',desc:'3 K.O.s in one match',test:(s,m)=>m.kills>=3,unlock:'title:Badge Collector'},{id:'l40',name:'Line Clearer',desc:'Clear 40 lines in one match',test:(s,m)=>m.lines>=40,unlock:'title:Line Clearer'}],
 alive:i=>!!boards[i]&&!boards[i].out,start,step,local,upload,follow,snap,apply,render,bot,onFx,
 ranks:()=>boards.slice().sort((a,b)=>((K.winner&&K.winner.i===b.i)?1:0)-((K.winner&&K.winner.i===a.i)?1:0)||(a.out-b.out)||((b.outAt|0)-(a.outAt|0))||b.kos-a.kos).map(b=>[b.name,b.col,b.kos+' KO · '+b.lines+' lines']),
 result:(i,w)=>{const b=boards[i];return{won:!!w&&w.i===i,kills:b.kos,lines:b.lines,bestScore:b.score}}});
window.__tt={get boards(){return boards},K,bot};
})();
