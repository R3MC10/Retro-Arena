/* BRICKANOID for Retro Arena: battle-royale brick breaking for up to 20 players, every player on their own board, tilted 2.5D bricks.
   A / D (or arrows, or the stick) move the paddle, Space / click launches the ball and fires lasers. No mouse steering.
   Every 8 bricks you break pushes a junk row onto a rival's board; bricks that reach your paddle cost a life. Last board standing wins.
   Brickanoid capsules: S slow · C catch · E enlarge · D disruption (3 balls) · L laser · P extra paddle · B break (warp to a new stage and
   bury a rival). Purple CURSE capsules (troll) hit a rival instead: SHRINK their paddle, SPEED their ball, FOG their board, REVERSE their controls.
   Online is lag-free: your board runs on your own machine and the host only routes the junk and curses (RA.kit localFirst). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const COLS=11,ROWS=18,BW=16,BH=8,WALL=8,BWID=COLS*BW+WALL*2,BHGT=240,PY=222,TOP=16;
const BRC=[null,'#f8f8f8','#f8a030','#30d8f8','#40e040','#f03030','#3060f8','#f060f0','#f8f040','#b8b8c8','#e0b030','#787888'];// 9 silver, 10 gold, 11 junk
const CAPS=[null,{s:'S',c:'#f89020'},{s:'C',c:'#40d040'},{s:'E',c:'#3070f8'},{s:'D',c:'#30d8f8'},{s:'L',c:'#f03030'},{s:'P',c:'#a0a0b0'},{s:'B',c:'#f060f0'},{s:'?',c:'#8020c0',doh:1}];
const CURSE=['SHRINK','SPEED','FOG','REVERSE'];
RA.audio.add('ping',(AC,now,g,ch)=>{const o=AC.createOscillator();o.type='square';o.frequency.value=ch?660+ch*40:440;g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.06);o.connect(g);o.start();o.stop(now+.07)});
RA.audio.add('vaus',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.value=220;g.gain.setValueAtTime(.1,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);o.start();o.stop(now+.09)});
const MUSIC=[T('Mothership',100,['Em','C','Am','B'],'k...s...k.k.s...','e5 - g5 b5 - a5 g5 - f#5 - e5 - b4 - - - c5 - e5 g5 - f#5 e5 - d#5 - b4 - - - - -'),
 T('Paddle Launch',140,['Am','F','G','E'],'k.hsk.hsk.hsk.hs','a4 c5 e5 a5 . e5 c5 . f4 a4 c5 f5 . c5 a4 . g4 b4 d5 g5 . d5 b4 . e4 g#4 b4 e5 g#5 b5 e6 .'),
 T('Dimension Control',156,['Dm','Bb','F','C'],'k.hhs.hhk.hhs.hk','d5 . a5 . f5 . d5 . bb4 . f5 . d5 . bb4 . f4 . c5 . a4 . f5 . c5 . e5 . g5 . c6 - - .'),
 T('Curse Awakens',172,['Cm','Ab','Fm','G'],'k.hsk.hsk.hsk.ss','c5 . eb5 . g5 . c6 . ab5 . eb5 . c5 . ab4 . f4 . ab4 . c5 . f5 . g5 . b4 . d5 . g4 - - .')];
let K,boards=[];
function level(b,seed){const rr=RA.util.mulberry(seed),rows=4+Math.floor(rr()*5),start=2+Math.floor(rr()*2),shape=Math.floor(rr()*4);b.br=new Uint8Array(COLS*ROWS);b.hp=new Uint8Array(COLS*ROWS);
 for(let r=0;r<rows;r++)for(let c=0;c<=COLS>>1;c++){let v=1+((r+b.lvl)%8);if(shape===1&&(c+r)%3===0)continue;if(shape===2&&r%2&&c%2)continue;if(shape===3&&c<r-2)continue;
  if(rr()<.08+b.lvl*.01)v=9;if(rr()<.03)v=10;for(const cc of[c,COLS-1-c]){const i=(start+r)*COLS+cc;b.br[i]=v;b.hp[i]=v===9?2+Math.floor(b.lvl/4):1}}}
function newBoard(i,name,col){const b={i,name,col,lvl:1,lives:K.S.lives,score:0,out:false,px:BWID/2,pw:32,balls:[],caps:[],las:[],fx:{},broke:0,sentN:0,outq:[],inbox:[],inSeen:0,lasT:0,kills:0,cpuT:0,ver:0,koBy:-1};
 level(b,K.seed+i*0+1);serve(b);return b}
function serve(b){b.balls=[{x:b.px,y:PY-4,vx:0,vy:0,stuck:true,off:0}]}
function start(seats,md,S,seed){boards=seats.map((s,i)=>newBoard(i,s.name,s.col))}
const live=b=>!b.out;
/* ---- one board's physics: runs on its owner's machine (host for its own, local and CPU boards; each guest for theirs) */
function stepBoard(b,inp){if(b.out)return;const f=b.fx;for(const k in f)if(f[k]>0)f[k]--;
 let mv=0;if(inp.left)mv=-1;if(inp.right)mv=1;if(inp.ax&&Math.abs(inp.ax)>.25)mv=inp.ax;if(f.rev>0)mv=-mv;
 const pw=f.shrink>0?20:f.big>0?48:32;b.pw=pw;b.px=Math.max(WALL+pw/2,Math.min(BWID-WALL-pw/2,b.px+mv*4.2));
 if(inp.tap){for(const bl of b.balls)if(bl.stuck){bl.stuck=false;const a=-Math.PI/2+(bl.off||0)/pw*1.2;const sp=speed(b);bl.vx=Math.cos(a)*sp;bl.vy=Math.sin(a)*sp}
  if(f.laser>0&&b.lasT<=0){b.las.push({x:b.px-pw/2+3,y:PY-4},{x:b.px+pw/2-3,y:PY-4});b.lasT=14;sfx('shot')}}if(b.lasT>0)b.lasT--;
 for(const bl of b.balls){if(bl.stuck){bl.x=b.px+(bl.off||0);bl.y=PY-4;continue}moveBall(b,bl)}
 b.balls=b.balls.filter(bl=>bl.y<BHGT+6);
 if(!b.balls.length){lose(b,'ball')}
 for(const l of b.las){l.y-=5;const c=Math.floor((l.x-WALL)/BW),r=Math.floor((l.y-TOP)/BH);if(r>=0&&r<ROWS&&c>=0&&c<COLS&&b.br[r*COLS+c]){hitBrick(b,c,r);l.dead=true}if(l.y<TOP)l.dead=true}b.las=b.las.filter(l=>!l.dead);
 for(const c of b.caps){c.y+=1.1;if(c.y>PY-4&&c.y<PY+6&&Math.abs(c.x-b.px)<pw/2+6){c.dead=true;catchCap(b,c.k)}if(c.y>BHGT)c.dead=true}b.caps=b.caps.filter(c=>!c.dead);
 // bricks pushed down to the paddle cost a life
 for(let c=0;c<COLS;c++)if(b.br[(ROWS-1)*COLS+c]){lose(b,'bury');break}
 if(!b.br.some((v,i)=>v&&v!==10))nextLevel(b)}
function speed(b){return Math.min(4.2,(2+b.lvl*.12+(K.tick/3600)*.25*K.S.ramp)*(b.fx.slow>0?.65:1)*(b.fx.fast>0?1.45:1))}
function moveBall(b,bl){const sp=speed(b),m=Math.hypot(bl.vx,bl.vy)||1;bl.vx=bl.vx/m*sp;bl.vy=bl.vy/m*sp;
 const n=Math.ceil(sp/2);for(let s=0;s<n;s++){let nx=bl.x+bl.vx/n,ny=bl.y+bl.vy/n;
  if(nx<WALL+3){nx=WALL+3;bl.vx=Math.abs(bl.vx)}if(nx>BWID-WALL-3){nx=BWID-WALL-3;bl.vx=-Math.abs(bl.vx)}if(ny<TOP+3){ny=TOP+3;bl.vy=Math.abs(bl.vy)}
  // bricks: test the cell the ball moves into, axis by axis
  const cx=Math.floor((nx-WALL)/BW),cy=Math.floor((bl.y-TOP)/BH),rx=Math.floor((bl.x-WALL)/BW),ry=Math.floor((ny-TOP)/BH);
  const cell=(c,r)=>c>=0&&c<COLS&&r>=0&&r<ROWS&&b.br[r*COLS+c];
  const ex=Math.floor((nx+Math.sign(bl.vx)*3-WALL)/BW),ey=Math.floor((ny+Math.sign(bl.vy)*3-TOP)/BH);
  if(cell(ex,cy)){hitBrick(b,ex,cy);bl.vx=-bl.vx;nx=bl.x}
  if(cell(rx,ey)){hitBrick(b,rx,ey);bl.vy=-bl.vy;ny=bl.y}
  bl.x=nx;bl.y=ny;
  if(bl.vy>0&&bl.y>=PY-3&&bl.y<=PY+4&&Math.abs(bl.x-b.px)<=b.pw/2+2){const off=(bl.x-b.px)/(b.pw/2),a=-Math.PI/2+off*1.05;bl.vx=Math.cos(a)*sp;bl.vy=Math.sin(a)*sp;bl.y=PY-3;sfx('vaus');
   if(b.fx.catch>0){bl.stuck=true;bl.off=bl.x-b.px}}}}
function hitBrick(b,c,r){const i=r*COLS+c,v=b.br[i];if(v===10){sfx('ping',0);return}if(--b.hp[i]>0){sfx('ping',1);return}
 b.br[i]=0;b.ver++;b.score+=v===9?50*b.lvl:v===11?20:50+v*10;sfx('ping',v);b.broke++;
 if(K.S.att!=='off'&&b.broke%8===0)b.outq.push('J');
 if(K.S.caps!=='off'&&Math.random()<.16&&!b.caps.length){let k=1+Math.floor(Math.random()*7);if(Math.random()<(K.S.caps==='party'?.4:.15))k=8;if(k===7&&Math.random()<.6)k=1+Math.floor(Math.random()*6);
  b.caps.push({x:WALL+c*BW+8,y:TOP+r*BH+4,k})}}
function catchCap(b,k){sfx('pick');b.score+=1000;const f=b.fx;tag(b,k===8?'CURSE!':['','SLOW','CATCH','ENLARGE','DISRUPTION','LASER','1UP','BREAK'][k]);
 if(k===1)f.slow=600;else if(k===2)f.catch=900;else if(k===3)f.big=1200;else if(k===4){const s=b.balls.find(x=>!x.stuck)||b.balls[0];if(s)for(const a of[-.5,.5])b.balls.push({x:s.x,y:s.y,vx:Math.cos(-Math.PI/2+a)*2,vy:Math.sin(-Math.PI/2+a)*2})}
 else if(k===5)f.laser=900;else if(k===6)b.lives++;else if(k===7){b.outq.push('J','J','J');nextLevel(b)}else if(k===8)b.outq.push('SVFR'[Math.floor(Math.random()*4)])}
function tag(b,s){b.tag=s;b.tagT=70}
function nextLevel(b){b.lvl++;b.score+=2000;level(b,K.seed+b.lvl*977+b.i*13);b.ver++;serve(b);b.caps=[];b.las=[];tag(b,'ROUND '+b.lvl)}
function lose(b,why){if(b.out)return;b.lives--;sfx('boom');tag(b,why==='bury'?'BURIED!':'MISS');b.fx={};
 if(why==='bury'){for(let r=ROWS-1;r>=ROWS-6;r--)for(let c=0;c<COLS;c++)b.br[r*COLS+c]=0;b.ver++}
 if(b.lives<=0){b.out=true;b.outAt=K.tick;b.balls=[];return}serve(b)}
// incoming from rivals
function receive(b,code){if(b.out)return;const f=b.fx;
 if(code==='J'){for(let r=ROWS-1;r>0;r--)for(let c=0;c<COLS;c++){b.br[r*COLS+c]=b.br[(r-1)*COLS+c];b.hp[r*COLS+c]=b.hp[(r-1)*COLS+c]}
  for(let c=0;c<COLS;c++){b.br[c]=Math.random()<.8?11:0;b.hp[c]=1}b.ver++;tag(b,'JUNK!')}
 else{const k='SVFR'.indexOf(code);if(k===0)f.shrink=600;else if(k===1)f.fast=480;else if(k===2)f.fog=480;else if(k===3)f.rev=420;tag(b,CURSE[k]||'')}}
/* ---- host: route attacks; read guests' boards */
function pack(b){let s='';for(let i=0;i<COLS*ROWS;i++)s+=b.br[i].toString(36);
 return{v:b.ver,s,p:Math.round(b.px),w:b.pw,l:b.balls.slice(0,4).map(x=>[Math.round(x.x),Math.round(x.y)]),c:b.caps.map(c=>[Math.round(c.x),Math.round(c.y),c.k]),z:b.las.map(l=>[Math.round(l.x),Math.round(l.y)]),
  li:b.lives,sc:b.score,lv:b.lvl,o:b.out?1:0,fx:Object.keys(b.fx).filter(k=>b.fx[k]>0).join(','),t:b.tagT>0?b.tag:'',q:b.outSeq|0,oq:(b.outLog||[]).slice(-8),is:b.inSeen}}
function unpack(b,d,own){if(!d)return;if(typeof d.s==='string'&&d.s.length===COLS*ROWS){for(let i=0;i<COLS*ROWS;i++)b.br[i]=parseInt(d.s[i],36)||0}
 b.px=d.p;b.pw=d.w;b.balls=(d.l||[]).map(a=>({x:a[0],y:a[1]}));b.caps=(d.c||[]).map(a=>({x:a[0],y:a[1],k:a[2]}));b.las=(d.z||[]).map(a=>({x:a[0],y:a[1]}));
 b.lives=d.li|0;b.score=d.sc|0;b.lvl=d.lv|0;b.out=!!d.o;b.fxs=String(d.fx||'');if(d.t&&d.t!==b.tag){b.tag=d.t;b.tagT=60}}
function route(from,code){const tg=boards.filter(o=>o!==from&&!o.out);if(!tg.length)return;const t=tg[Math.floor(Math.random()*tg.length)];
 t.lastFrom=from.i;if(K.seats[t.i].ctrl==='net'){t.inbox.push([++t.inSeq,code,from.i]);if(t.inbox.length>12)t.inbox.shift()}else receive(t,code);
 K.fx('a',from.i,t.i,code)}
function outflow(b){// local boards: take what the board queued
 while(b.outq.length){const c=b.outq.shift();b.outSeq=(b.outSeq|0)+1;(b.outLog=b.outLog||[]).push([b.outSeq,c]);if(b.outLog.length>12)b.outLog.shift();if(!K.isClient())route(b,c)}}
function step(){for(const b of boards){b.inSeq=b.inSeq|0;const s=K.seats[b.i];
  if(s.ctrl==='net'){if(!K.R.peer(s.peer)){if(!b.out){b.out=true;b.outAt=K.tick;tag(b,'LEFT')}continue}if(b.tagT>0)b.tagT--;const d=K.remote(b.i);if(d){const wasOut=b.out;unpack(b,d);b.inbox=b.inbox.filter(e=>e[0]>(d.is|0));for(const e of d.oq||[]){if((e[0]|0)>(b.rSeen|0)){b.rSeen=e[0]|0;route(b,String(e[1]))}}if(!wasOut&&b.out)b.outAt=K.tick}continue}
  if(b.tagT>0)b.tagT--;stepBoard(b,K.inp(b.i));outflow(b)}
 const alive=boards.filter(live),lim=K.S.len*3600;
 if(boards.length>1?alive.length<=1:!alive.length){K.end(alive[0]?{i:alive[0].i}:null);return}
 if(lim&&K.tick>=lim){const w=boards.slice().sort((a,b)=>(a.out-b.out)||b.score-a.score)[0];K.end(w?{i:w.i}:null)}
 if(alive.length===2&&boards.length>2)K.track(3)}
// guest: my own board runs here
function local(i){const b=boards[i];if(!b)return;if(b.tagT>0)b.tagT--;stepBoard(b,K.inp(i));outflow(b)}
function upload(i){const b=boards[i];return b?pack(b):null}
let snapRot=0;
// Broadcast only drawing state and inboxes; upload-only routing fields stay in pack().
// A-Z followed by a brick encode a run of 1-26 cells; omit trailing empty cells.
function snap(){const first=snapRot;snapRot=(snapRot+2)%boards.length;return{b:boards.map((b,k)=>{const d=pack(b);let s='';if((k-first+boards.length)%boards.length<2){b.sentVer=d.v;s=d.s.replace(/0+$/,'').replace(/([0-9a-z])\1{2,25}/g,z=>String.fromCharCode(64+z.length)+z[0])||'0'}
 const a=[s,d.p,d.w,d.l,d.c,d.z,d.li,d.sc.toString(36),d.lv,d.o|(d.fx.includes('laser')?2:0)|(d.fx.includes('fog')?4:0)];
 if(d.t||b.inbox.length)a.push(d.t);if(b.inbox.length)a.push(b.out?[]:b.inbox.slice(-8));return a})}}
function apply(g){(g.b||[]).forEach((a,k)=>{const b=boards[k];if(!b)return;const d={p:a[1],w:a[2],l:a[3],c:a[4],z:a[5],li:a[6],sc:parseInt(a[7],36),lv:a[8],o:a[9]&1,fx:[a[9]&2?'laser':'',a[9]&4?'fog':''].join(','),t:a[10],in:a[11]};
  if(a[0])d.s=a[0].replace(/([A-Z])([0-9a-z])/g,(_,n,c)=>c.repeat(n.charCodeAt(0)-64)).padEnd(COLS*ROWS,'0');
  if(k===K.myIdx){for(const e of d.in||[]){if((e[0]|0)>b.inSeen){b.inSeen=e[0]|0;b.lastFrom=e[2];receive(b,String(e[1]))}}return}
  const wasOut=b.out;unpack(b,d);if(!wasOut&&b.out)b.outAt=K.tick})}
function follow(){for(const b of boards)if(b.i!==K.myIdx&&b.tagT>0)b.tagT--}
function onFx(k,a){if(k==='a'&&a[1]===K.myIdx)sfx('boom')}
/* ---- CPU */
function bot(i){const b=boards[i];if(!b||b.out)return{};const o={};let tx=b.px;
 const bl=b.balls.filter(x=>!x.stuck&&x.vy>0).sort((p,q)=>q.y-p.y)[0];
 if(bl){let x=bl.x,y=bl.y,vx=bl.vx;const t=(PY-y)/Math.max(.1,bl.vy);x+=vx*t;const L=WALL+3,R=BWID-WALL-3,Wd=R-L;let u=((x-L)%(2*Wd)+2*Wd)%(2*Wd);x=L+(u>Wd?2*Wd-u:u);tx=x+(K.cpu===0?Math.sin(K.tick*.02+i)*14:K.cpu===1?Math.sin(K.tick*.03+i)*6:0)}
 else{const cap=b.caps.find(c=>c.k!==8);if(cap)tx=cap.x}
 if(tx<b.px-3)o[b.fx.rev>0?'right':'left']=true;else if(tx>b.px+3)o[b.fx.rev>0?'left':'right']=true;
 if(b.balls.some(x=>x.stuck)&&++b.cpuT%50===0)o.tap=true;if(b.fx.laser>0&&K.tick%16===0)o.tap=true;return o}
/* ---- drawing: my board big on the left, rivals tiled on the right */
const BG={};
function bgFor(lvl){const k=lvl%4;if(BG[k])return BG[k];const c=document.createElement('canvas'),Q=2;c.width=BWID*Q;c.height=BHGT*Q;const g=c.getContext('2d');g.scale(Q,Q);
 const hue=[220,160,280,20][k],gr=g.createLinearGradient(0,0,0,BHGT);gr.addColorStop(0,`hsl(${hue},55%,16%)`);gr.addColorStop(1,`hsl(${hue},60%,6%)`);g.fillStyle=gr;g.fillRect(0,0,BWID,BHGT);
 g.strokeStyle=`hsla(${hue},70%,55%,.18)`;g.lineWidth=.6;for(let y=0;y<BHGT;y+=12)for(let x=0;x<BWID;x+=14){const ox=(y/12)%2?7:0;g.beginPath();for(let a=0;a<6;a++){const an=a*Math.PI/3;g.lineTo(x+ox+Math.cos(an)*6,y+Math.sin(an)*6)}g.closePath();g.stroke()}
 // metal side pipes
 for(const x of[0,BWID-WALL]){const p=g.createLinearGradient(x,0,x+WALL,0);p.addColorStop(0,'#5a6070');p.addColorStop(.4,'#e0e4f0');p.addColorStop(1,'#40444f');g.fillStyle=p;g.fillRect(x,0,WALL,BHGT)}
 const p=g.createLinearGradient(0,0,0,TOP);p.addColorStop(0,'#5a6070');p.addColorStop(.5,'#e0e4f0');p.addColorStop(1,'#40444f');g.fillStyle=p;g.fillRect(0,0,BWID,TOP-2);return BG[k]=c}
function drawBrick(g,x,y,v,hp){const col=BRC[v];g.fillStyle=RA.util.mix(col,'#000000',.55);g.fillRect(x,y+BH-2,BW-1,2.5);
 const gr=g.createLinearGradient(x,y,x,y+BH-2);gr.addColorStop(0,RA.util.mix(col,'#ffffff',.45));gr.addColorStop(.5,col);gr.addColorStop(1,RA.util.mix(col,'#000000',.25));g.fillStyle=gr;g.fillRect(x,y,BW-1,BH-2);
 g.fillStyle='rgba(255,255,255,.45)';g.fillRect(x,y,BW-1,1);if(v===9||v===10){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+2,y+2,3,1)}if(v===11){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+4,y+2,1,3);g.fillRect(x+10,y+1,1,4)}}
function drawBoard(g,b,X,Y,s,mine){g.save();g.translate(X,Y);g.scale(s,s);g.drawImage(bgFor(b.lvl),0,0,BWID,BHGT);
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const v=b.br[r*COLS+c];if(v)drawBrick(g,WALL+c*BW,TOP+r*BH,v)}
 for(const c of b.caps){const cp=CAPS[c.k],gr=g.createLinearGradient(0,c.y-3,0,c.y+3);gr.addColorStop(0,'#fff');gr.addColorStop(.4,cp.c);gr.addColorStop(1,RA.util.mix(cp.c,'#000000',.5));g.fillStyle=gr;
  g.beginPath();g.ellipse(c.x,c.y,7,3.4,0,0,7);g.fill();g.fillStyle='#fff';g.font='bold 5.5px "Russo One",sans-serif';g.textAlign='center';g.fillText(cp.s,c.x,c.y+2)}
 g.fillStyle='#ff6060';for(const l of b.las)g.fillRect(l.x-.6,l.y-4,1.2,5);
 if(!b.out){const pw=b.pw,x=b.px-pw/2,gr=g.createLinearGradient(0,PY-3,0,PY+4);gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,'#a8b0c8');gr.addColorStop(1,'#40465a');g.fillStyle=gr;g.fillRect(x+4,PY-3,pw-8,7);
  const rg=g.createLinearGradient(0,PY-3,0,PY+4);rg.addColorStop(0,'#ffb0a0');rg.addColorStop(.5,'#e02020');rg.addColorStop(1,'#701010');g.fillStyle=rg;g.beginPath();g.arc(x+4,PY+.5,3.5,0,7);g.arc(x+pw-4,PY+.5,3.5,0,7);g.fill();
  if((b.fxs||'').includes('laser')||b.fx.laser>0){g.fillStyle='#ff4040';g.fillRect(x+1,PY-5,2,3);g.fillRect(x+pw-3,PY-5,2,3)}
  for(const bl of b.balls){const bg=g.createRadialGradient(bl.x-1,bl.y-1,.3,bl.x,bl.y,3.2);bg.addColorStop(0,'#fff');bg.addColorStop(1,'#8090b0');g.fillStyle=bg;g.beginPath();g.arc(bl.x,bl.y,2.8,0,7);g.fill()}}
 const fog=(mine?b.fx.fog>0:false)||(b.fxs||'').includes('fog');if(fog){const fg=g.createLinearGradient(0,BHGT*.35,0,BHGT*.75);fg.addColorStop(0,'rgba(60,20,90,0)');fg.addColorStop(.4,'rgba(60,20,90,.95)');fg.addColorStop(1,'rgba(60,20,90,.95)');g.fillStyle=fg;g.fillRect(WALL,BHGT*.35,BWID-2*WALL,BHGT*.45)}
 g.fillStyle='rgba(0,0,0,.55)';g.fillRect(WALL,BHGT-12,BWID-2*WALL,12);g.font='7px "Russo One",sans-serif';g.textAlign='left';g.fillStyle=b.col;g.fillText(String(b.name).slice(0,12),WALL+3,BHGT-3.5);
 g.textAlign='right';g.fillStyle='#fff';g.fillText('R'+b.lvl+'  '+'▮'.repeat(Math.max(0,Math.min(6,b.lives)))+'  '+b.score,BWID-WALL-3,BHGT-3.5);
 if(b.tagT>0){g.textAlign='center';g.font='12px "Russo One",sans-serif';g.fillStyle='rgba(0,0,0,.6)';g.fillText(b.tag,BWID/2+1,BHGT/2+1);g.fillStyle='#fff';g.fillText(b.tag,BWID/2,BHGT/2)}
 if(b.out){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,BWID,BHGT);g.textAlign='center';g.font='14px "Russo One",sans-serif';g.fillStyle='#f04848';g.fillText('K.O.',BWID/2,BHGT/2)}
 if(mine){g.strokeStyle=b.col;g.lineWidth=1.5;g.strokeRect(-1,-1,BWID+2,BHGT+2)}
 g.restore()}
function render(g,Wv,Hv){const bg=g.createLinearGradient(0,0,0,Hv);bg.addColorStop(0,'#0a0618');bg.addColorStop(1,'#000');g.fillStyle=bg;g.fillRect(0,0,Wv,Hv);
 if(!boards.length)return;const fs=K.demo?[]:K.focus(),main=fs.length===1?boards[fs[0]]:null,top=26,bot=Hv-30;
 if(main){const s=(bot-top)/BHGT,mw=BWID*s;drawBoard(g,main,10,top,s,true);const rest=boards.filter(b=>b!==main);if(!rest.length)return;
  const ax=20+mw,aw=Wv-ax-8,ah=bot-top;let best=null;for(let cols=1;cols<=rest.length;cols++){const rows=Math.ceil(rest.length/cols),sc=Math.min(aw/cols/(BWID+6),ah/rows/(BHGT+6));if(!best||sc>best.sc)best={cols,rows,sc}}
  rest.forEach((b,k)=>drawBoard(g,b,ax+(k%best.cols)*(BWID+6)*best.sc,top+Math.floor(k/best.cols)*(BHGT+6)*best.sc,best.sc,false))}
 else{const n=boards.length,aw=Wv-16,ah=bot-top;let best=null;for(let cols=1;cols<=n;cols++){const rows=Math.ceil(n/cols),sc=Math.min(aw/cols/(BWID+6),ah/rows/(BHGT+6));if(!best||sc>best.sc)best={cols,rows,sc}}
  const tw=best.cols*(BWID+6)*best.sc,ox=(Wv-tw)/2;boards.forEach((b,k)=>drawBoard(g,b,ox+(k%best.cols)*(BWID+6)*best.sc,top+Math.floor(k/best.cols)*(BHGT+6)*best.sc,best.sc,fs.includes(b.i)))}}
K=RA.kit({id:'arkanoid',name:'BRICKANOID',kind:'Brick breaker',players:'1-20 players',demo:4,localFirst:true,
 desc:'Battle-royale brick breaking for up to 20, each on your own board with tilted 2.5D bricks. Break bricks to bury rivals in junk, catch Brickanoid capsules, and throw purple curses.',
 blurb:'Move the paddle with A / D, launch and fire with Space or click. Every 8 bricks sends a junk row to a rival. Last board standing wins.',
 howto:'A / D or arrows move the paddle, Space or click launches the ball and fires lasers. Gamepad: stick or d-pad moves, A launches.',
 icon:['..........','rrooyyggcc','rrooyyggcc','..........','.bb...ww..','.bb...ww..','..........','....w.....','..........','..kssssk..'],
 music:MUSIC,fireLabel:'FIRE',
 modes:[['ROYALE','Everyone vs everyone. Last board standing wins.']],
 settings:[['lives','Lives',[[3,'3'],[1,'1'],[5,'5']]],['att','Junk attacks',[['on','On'],['off','Off']]],['caps','Capsules',[['classic','Classic + some CURSES'],['party','Wild party (lots of CURSES)'],['off','Off']]],
  ['ramp','Speed-up',[[1,'Normal'],[2,'Fast'],[0,'None']]],['len','Time limit',[[5,'5 min'],[3,'3 min'],[10,'10 min'],[0,'None']]]],
 kb:[['A D','move'],['LMB SPACE','launch / laser'],['C','chat'],['ESC','menu']],pad:[['LS','move'],['A','launch / laser'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Paddle Pilot',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Vaus Pilot'},{id:'win1',name:'Curse Breaker',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Doh Slayer'},
  {id:'r5',name:'Dimension Hopper',desc:'Reach round 5',test:(s,m)=>m.round>=5,unlock:'title:Dimension Hopper'},{id:'pts',name:'Brick Ace',desc:'Score 30,000 in one match',test:(s,m)=>m.bestScore>=30000,unlock:'title:Arkanoid Ace'}],
 alive:i=>!!boards[i]&&!boards[i].out,start,step,local,upload,follow,snap,apply,render,bot,onFx,
 ranks:()=>boards.slice().sort((a,b)=>(a.out-b.out)||((b.outAt|0)-(a.outAt|0))||b.score-a.score).map(b=>[b.name,b.col,'R'+b.lvl+' · '+b.score]),
 result:(i,w)=>{const b=boards[i];return{won:!!w&&w.i===i,round:b.lvl,bestScore:b.score}}});
window.__ak={get boards(){return boards},K,bot};
})();
