/* TINY TRACKS for Retro Arena: tabletop racing for up to 20 in pixel art, after Micro Machines.
   The original it follows: tiny cars race across a breakfast table, a school desk and the garden, seen from above, all on
   ONE screen that follows the leader. Fall behind the edge of the screen (or off the table) and you're out of the round;
   the last car left scores a point, and the pack is put back down for the next round. First to the target wins.
   The 20-player twist: twenty cars bumping for the lead on one screen; with teams, a round win scores for the team.
   First seconds: hints show A / D steer (the car accelerates by itself), S brakes, and arrows warn you near the edge.
   Online: your car drives on your own device (RA.kit localFirst); the host decides the camera, who drops off and the score.
   The car sprite is painted in tools/art/tiny (python), exported as ART below; edit tiny_tpl.js there and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
const ART={"car": ["....kkkkk....", "...k11111k...", ".kk1YW1WY1kk.", "kKK1111111KKk", "kKK1122211KKk", "kKK1CCCCC3KKk", ".kk1CCCCC3kk.", "..k1222223k..", "..k1W222W3k..", "..k1222223k..", ".kk1CCCCC3kk.", "kKK1222223KKk", "kKK1222223KKk", "kKK1222223KKk", ".kk1333333kk.", "...kkkkkkk..."]};
const TM=RA.music.track,sfx=RA.audio.sfx;
const WW=1200,WH=900,RW=24,CD=150,TEAMC=['#e83838','#2c78f0'],TEAMN=['Red team','Blue team'];
const VMAX=2.35,VOFF=1.35,ACC=.055,TURN=.068,GRIP=.17;
RA.audio.add('bump',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.value=500;s.connect(f);f.connect(g);g.gain.setValueAtTime(.25,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);s.start(now);s.stop(now+.11)});
RA.audio.add('pop',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(500,now);o.frequency.exponentialRampToValueAtTime(80,now+.3);g.gain.setValueAtTime(.07,now);g.gain.exponentialRampToValueAtTime(.001,now+.32);o.connect(g);o.start(now);o.stop(now+.33)});
RA.audio.add('point',(AC,now,g)=>{[659,784,988,1319].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='square';o.frequency.value=f;q.gain.setValueAtTime(0,now+k*.07);q.gain.linearRampToValueAtTime(.05,now+k*.07+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.07+.12);o.connect(q);q.connect(g);o.start(now+k*.07);o.stop(now+k*.07+.13)});g.gain.value=1});
const MUSIC=[TM('Breakfast Grand Prix',144,['C','Am','F','G'],'k.hsk.hsk.hsk.hs','e5 g5 c6 g5 e5 g5 c6 e6 d6 c6 a5 c6 a5 f5 a5 c6 b5 g5 d5 g5 b5 d6 g6 d6 c6 . . . . . . .'),
 TM('Homework Hurry',168,['Dm','Bb','C','A'],'kshskshskshskshs','d5 f5 a5 f5 d5 a4 d5 f5 bb4 d5 f5 d5 bb4 f4 bb4 d5 c5 e5 g5 e5 c5 g4 c5 e5 a4 c#5 e5 c#5 a4 e4 a4 c#5')];
const TR=[{n:'BREAKFAST TABLE',th:'table',pts:[[200,180],[620,140],[1000,220],[1040,480],[820,560],[900,760],[560,780],[420,560],[200,700],[140,420]]},
 {n:'SCHOOL DESK',th:'desk',pts:[[180,160],[1020,160],[1040,380],[640,420],[600,560],[1020,600],[1000,780],[200,780],[160,560],[420,460],[160,340]]},
 {n:'GARDEN PATH',th:'garden',pts:[[160,240],[460,120],[760,240],[1060,140],[1060,520],[760,460],[620,720],[1020,800],[300,800],[180,560]]}];
const TH={table:{base:['#a8643c','#9a5a34','#b8744a'],road:['#f0d8a8','#e4c890'],edge:['#f8b020','#e85828'],grain:1},desk:{base:['#5c6c8c','#546482','#687898'],road:['#f4f4ec','#e8e8e0'],edge:['#2058c0','#f05050'],line:1},
 garden:{base:['#4a9a3c','#40903a','#56a848'],road:['#c49058','#b88450'],edge:['#9a94a8','#7c7890'],flowers:1}};
let K,cars=[],MAP=null,round=1,rState='race',rT=0,score=[],parts=[],texts=[],cam={x:0,y:0,tk:0},lastWin=-1,winT=0,skid=null;
const teamOf=i=>K.mode===1?i%2:i,ownerNet=c=>K.seats[c.i]&&K.seats[c.i].ctrl==='net',isMine=c=>K.isClient()?c.i===K.myIdx:!ownerNet(c);
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a)),fwd=a=>[Math.sin(a),-Math.cos(a)];
/* ---------- the track: a spline painted onto the tabletop ---------- */
function spline(pts){const n=pts.length,fine=[];for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
  for(let t=0;t<1;t+=.01){const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);fine.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])])}}
 const out=[];let acc=0;out.push({x:fine[0][0],y:fine[0][1]});for(let i=1;i<=fine.length;i++){const a=fine[i-1],b=fine[i%fine.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=d;while(acc>=4){acc-=4;const k=1-acc/d;out.push({x:a[0]+(b[0]-a[0])*k,y:a[1]+(b[1]-a[1])*k})}}
 out.forEach((p,i)=>{const q=out[(i+1)%out.length],r=out[(i-1+out.length)%out.length],tx=q.x-r.x,ty=q.y-r.y,l=Math.hypot(tx,ty)||1;p.tx=tx/l;p.ty=ty/l;p.a=Math.atan2(p.tx,-p.ty)});return out}
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const C32=h=>{const c=X.hex(h);return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0};
const BUILT={};
function build(no){if(BUILT[no])return BUILT[no];const tr=TR[no],th=TH[tr.th],path=spline(tr.pts),N=path.length,D=new Float32Array(WW*WH).fill(1e9),I=new Uint16Array(WW*WH),R=RW+12;
 path.forEach((s,i)=>{const cx=Math.round(s.x),cy=Math.round(s.y);for(let dy=-R;dy<=R;dy++){const y=cy+dy;if(y<0||y>=WH)continue;for(let dx=-R;dx<=R;dx++){const x=cx+dx;if(x<0||x>=WW)continue;const d=dx*dx+dy*dy;if(d<D[y*WW+x]){D[y*WW+x]=d;I[y*WW+x]=i}}}});
 const tex=X.mk(WW,WH),g=tex.getContext('2d'),im=g.createImageData(WW,WH),o=new Uint32Array(im.data.buffer),surf=new Uint8Array(WW*WH);
 const cB=th.base.map(C32),cR=th.road.map(C32),cE=th.edge.map(C32),cK=C32('#100c18'),cW=C32('#ffffff'),cL=C32('#a0c0f0'),cG=C32('#2a7a30'),cF=['#f070c0','#fff07c','#ffffff'].map(C32);
 for(let y=0;y<WH;y++)for(let x=0;x<WW;x++){const q=y*WW+x,d=Math.sqrt(D[q]),h=hash(x,y),i=I[q],edgeT=x<24||y<24||x>=WW-24||y>=WH-24;let c,s;
  if(edgeT){c=x<20||y<20||x>=WW-20||y>=WH-20?cK:C32('#3c2a1c');s=3}
  else if(d<RW){s=0;c=h<.04?cR[1]:cR[0];if(th.line&&(y%10===0))c=cL;if(i<2)c=(((x>>2)+(y>>2))&1)?cW:cK}
  else if(d<RW+4){s=1;const b=Math.floor(i/3)&1;c=tr.th==='table'?((x+y)&3?cE[b]:cK):tr.th==='desk'?cE[d<RW+2?0:1]:(h<.5?cE[0]:cE[1])}
  else{s=2;c=cB[0];if(th.grain&&(Math.floor(y/3+Math.sin(x*.02)*3)&7)===0)c=cB[1];if(h<.02)c=cB[2];if(th.flowers&&h<.004)c=cF[(h*1000|0)%3];if(th.line&&hash(x>>4,y>>4)<.03&&(x&15)>3)c=cG}
  o[q]=c;surf[q]=s}
 g.putImageData(im,0,0);
 // decorations the cars race around
 const rr=RA.util.mulberry(no*31+5);const free=(x,y,r)=>{for(let k=0;k<12;k++){const a=k/12*Math.PI*2,px=Math.round(x+Math.cos(a)*r),py=Math.round(y+Math.sin(a)*r);if(px<30||py<30||px>WW-30||py>WH-30||D[py*WW+px]<(RW+10)**2)return false}return true};
 for(let k=0;k<60;k++){const x=40+rr()*(WW-80),y=40+rr()*(WH-80),r=10+rr()*22;if(!free(x,y,r))continue;
  if(tr.th==='table'){g.fillStyle=P.k;circ(g,x,y,r+1);g.fillStyle=rr()<.5?'#f4f4ec':'#e8e4dc';circ(g,x,y,r);g.fillStyle='#d8d4cc';circ(g,x,y,r*.6);g.fillStyle='#f4f4ec';circ(g,x,y,r*.5)}
  else if(tr.th==='desk'){const w=r*2,h=r*.6;g.fillStyle=P.k;g.fillRect(x-w/2-1,y-h/2-1,w+2,h+2);g.fillStyle=rr()<.5?'#f0c020':'#f070c0';g.fillRect(x-w/2,y-h/2,w,h);g.fillStyle='#f0b888';g.fillRect(x+w/2-4,y-h/2,4,h)}
  else{g.fillStyle=P.k;circ(g,x,y,r*.6+1);g.fillStyle='#7c7890';circ(g,x,y,r*.6);g.fillStyle='#9a94a8';circ(g,x-2,y-2,r*.3)}}
 return BUILT[no]={no,tr,path,N,tex,surf,I}}
function circ(g,x,y,r){for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));g.fillRect(Math.round(x-w),Math.round(y+dy),w*2+1,1)}}
const surfAt=(x,y)=>{x|=0;y|=0;return x<0||y<0||x>=WW||y>=WH?3:MAP.surf[y*WW+x]},idxAt=(x,y)=>{x|=0;y|=0;return x<0||y<0||x>=WW||y>=WH?0:MAP.I[y*WW+x]};
/* ---------- the race: elimination rounds on one shared screen ---------- */
const VW=300,VH=160;
// after 15 s of a round the judged frame closes in, so every round ends within about 45 s
const shrink=()=>rState!=='race'?1:Math.max(.1,1-Math.max(0,K.tick-rT-600)/1800*.9),fw=()=>VW*shrink(),fh=()=>VH*shrink();   // the shared view everyone is judged on (smaller than any screen, so what you see is what counts)
function start(seats,md,S,seed){const rr=RA.util.mulberry(seed),no=S.track==='rnd'||S.track==null?Math.floor(rr()*TR.length):+S.track;MAP=build(no);round=1;rState='count';rT=0;lastWin=-1;parts=[];texts=[];
 score=seats.map(()=>0);skid=X.mk(WW,WH);cars=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,x:0,y:0,a:0,vx:0,vy:0,out:false,outT:0,fall:0,idx:0,lap:0,prog:0,wins:0,bt:null,off:0,lane:(rr()-.5)*24}));
 placeAll(MAP.N-6);cam.x=cars[0].x;cam.y=cars[0].y;cam.tk=K.tick}
// line everyone up two by two behind path index k
function placeAll(k){const n=cars.length,order=cars.slice().sort((a,b)=>((a.i*7919+round*104729)%997)-((b.i*7919+round*104729)%997));const w=cars[lastWin];if(w){order.splice(order.indexOf(w),1);order.push(w)}
 order.forEach((c,j)=>{const row=j>>1,sd=j&1?1:-1,i=((k-row*5)%MAP.N+MAP.N)%MAP.N,s=MAP.path[i];c.x=s.x+s.ty*sd*-8;c.y=s.y-s.tx*sd*-8;c.a=s.a;c.vx=c.vy=0;c.lane=(Math.random()-.5)*28;c.pace=.97+Math.random()*.05;c.out=false;c.outT=0;c.fall=0;c.idx=i;c.prog=c.lap*MAP.N+i;c.rid=round})}
function drive(c,inp){if(c.out||rState!=='race'){c.vx*=.9;c.vy*=.9;return}
 let steer=(inp.right?1:0)-(inp.left?1:0);if(inp.ax!=null&&Math.abs(inp.ax)>.2)steer=inp.ax;
 const s=surfAt(c.x,c.y),cpu=K.seats[c.i]&&K.seats[c.i].ctrl==='cpu';let max=s===0?VMAX:s===1?VMAX*.85:VOFF;if(cpu)max*=[.94,1,1.03][K.cpu]*(c.pace||1);
 // slipstream: everyone but the leader gets a little extra, so the pack stays a pack
 const L=leader();if(L&&L!==c&&rState==='race')max*=1.03;
 const f=fwd(c.a),sp0=c.vx*f[0]+c.vy*f[1];let sp=sp0;
 if(inp.down)sp=sp>0?sp-.09:Math.max(-.9,sp-.04);else if(sp<max)sp+=ACC*(1.15-sp/max);else sp+=(max-sp)*.06;
 c.a=wrapA(c.a+steer*TURN*Math.min(1,Math.abs(sp)/1)*(sp<0?-1:1));
 const f2=fwd(c.a),lx=c.vx-f[0]*sp0,ly=c.vy-f[1]*sp0,gr=s===2?.09:GRIP,lat=Math.hypot(lx,ly);
 c.vx=f2[0]*sp+lx*(1-gr);c.vy=f2[1]*sp+ly*(1-gr);c.x+=c.vx;c.y+=c.vy;c.lat=lat;
 if(surfAt(c.x,c.y)===3){c.fall=30;c.out=true;c.outT=0;sfx('pop');say(c,'OFF THE TABLE!','#f05050')}
 // bumping: push apart, trade momentum
 for(const o of cars){if(o===c||o.out)continue;const dx=c.x-o.x,dy=c.y-o.y,d=Math.hypot(dx,dy);if(d<9&&d>.01){const nx=dx/d,ny=dy/d;c.x+=nx*(9-d)*.5;c.y+=ny*(9-d)*.5;const vr=(c.vx-(o.vx||0))*nx+(c.vy-(o.vy||0))*ny;if(vr<0){c.vx-=nx*vr*.9;c.vy-=ny*vr*.9;if(vr<-.8&&isMine(c))sfx('bump')}}}
 // where you are round the track
 const id=idxAt(c.x,c.y),N=MAP.N;if(surfAt(c.x,c.y)<=1||Math.abs(((id-c.idx)%N+N*1.5)%N-N/2)<30){const d=((id-c.idx)%N+N*1.5)%N-N/2;if(Math.abs(d)<60){if(c.idx>N*.8&&id<N*.2)c.lap++;else if(c.idx<N*.2&&id>N*.8)c.lap--;c.idx=id}}c.prog=c.lap*N+c.idx;
 if(lat>.7&&K.tick%2===0)skidMark(c);if(s===2&&Math.hypot(c.vx,c.vy)>.8&&K.tick%4===0)parts.push({x:c.x-f2[0]*5,y:c.y-f2[1]*5,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,t:16,col:TH[MAP.tr.th].base[2]})}
function skidMark(c){if(!skid)return;const g=skid.getContext('2d'),f=fwd(c.a);g.fillStyle='rgba(16,12,24,.35)';for(const sd of[-1,1]){const x=Math.round(c.x-f[0]*5+f[1]*sd*4),y=Math.round(c.y-f[1]*5-f[0]*sd*4);g.fillRect(x,y,1,1)}}
function say(c,s,col){texts.push({x:c.x,y:c.y-12,s,col,t:70,who:c.i})}
function leader(){let b=null;for(const c of cars)if(!c.out&&(!b||c.prog>b.prog))b=c;return b}
function camStep(){let n=0;while(cam.tk<K.tick&&n++<20){cam.tk++;const l=leader();if(!l)continue;const tx=l.x+l.vx*22,ty=l.y+l.vy*22;cam.x+=(tx-cam.x)*.08;cam.y+=(ty-cam.y)*.08;cam.x=Math.max(VW/2,Math.min(WW-VW/2,cam.x));cam.y=Math.max(VH/2,Math.min(WH-VH/2,cam.y))}cam.tk=K.tick}
function step(){for(const c of cars){if(ownerNet(c)){const u=K.remote(c.i);if(u)readUp(c,u);continue}drive(c,K.inp(c.i))}
 camStep();const now=K.tick,target=+K.S.target||5;
 if(rState==='count'&&now-rT>CD){rState='race';rT=now;sfx('go')}
 else if(rState==='race'){// anyone left behind the edge of the shared screen drops out
  for(const c of cars){if(c.out){if(c.fall>0)c.fall--;continue}const L=leader(),k=shrink(),jx=L?cam.x+(L.x-cam.x)*(1-k):cam.x,jy=L?cam.y+(L.y-cam.y)*(1-k):cam.y,off=Math.abs(c.x-jx)>fw()/2+6||Math.abs(c.y-jy)>fh()/2+6;c.outT=off?c.outT+1:0;if(c.outT>14){c.out=true;sfx('pop');for(let k=0;k<10;k++)parts.push({x:c.x,y:c.y,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,t:24,col:k&1?c.col:'#e8e4dc'})}}
  const live=cars.filter(c=>!c.out);if(live.length<=1&&cars.length>1||cars.length===1&&live.length===0){const w=live[0];lastWin=w?w.i:-1;if(w){w.wins++;score[K.mode===1?w.i%2:w.i]=(score[K.mode===1?w.i%2:w.i]|0)+1;K.fx('w',w.i)}rState='won';rT=now;
   }}
 else if(rState==='won'&&now-rT>140){const top=Math.max(...score);if(top>=target){endWho=score.indexOf(top);finish();return}const w=cars[lastWin]||leader()||cars[0];round++;placeAll(w.idx+4);rState='count';rT=now-CD+70;cam.x=w.x;cam.y=w.y}
 vis()}
let endAt=0,endWho=-1;
function finish(){if(K.mode===1)K.end({team:endWho,name:TEAMN[endWho]+' WINS!'});else K.end({i:endWho})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.y-=.25}texts=texts.filter(t=>t.t>0)}
/* ---------- guests ---------- */
function local(i){const c=cars[i];if(c)drive(c,K.inp(i));vis()}
function upload(i){const c=cars[i];if(!c)return null;return{x:Math.round(c.x*10)/10,y:Math.round(c.y*10)/10,a:Math.round(c.a*100)/100,vx:Math.round(c.vx*100)/100,vy:Math.round(c.vy*100)/100,id:c.idx,lp:c.lap,rid:c.rid}}
function readUp(c,u){if(typeof u.x!=='number'||u.rid!==c.rid||c.out)return;c.x=u.x;c.y=u.y;c.a=u.a;c.vx=u.vx;c.vy=u.vy;c.idx=u.id;c.lap=u.lp;c.prog=c.lap*MAP.N+c.idx;if(Math.hypot(c.vx,c.vy)>.5&&K.tick%2===0)skidMark(c)}
function snap(){return{cs:cars.map(c=>[Math.round(c.x),Math.round(c.y),Math.round(c.a*100),c.out?1:0,c.fall,c.wins,c.idx,c.lap,Math.round(c.vx*10),Math.round(c.vy*10)]),cm:[Math.round(cam.x),Math.round(cam.y)],rs:rState,rt:rT,ro:round,sc:score,lw:lastWin,tk:MAP.no}}
function apply(g){if(g.tk!=null&&(!MAP||MAP.no!==g.tk))MAP=build(g.tk);const newRound=g.ro!==round;round=g.ro;rState=g.rs;rT=g.rt;score=g.sc||score;lastWin=g.lw;if(g.cm){cam.x=g.cm[0];cam.y=g.cm[1];cam.tk=K.tick}
 (g.cs||[]).forEach((a,i)=>{const c=cars[i];if(!c)return;c.wins=a[5];if(i===K.myIdx){if(newRound||a[3]&&!c.out||c.rid!==round){c.x=a[0];c.y=a[1];c.a=a[2]/100;c.vx=c.vy=0;c.idx=a[6];c.lap=a[7];c.rid=round}c.out=!!a[3];c.fall=a[4];return}
  c.tx=a[0];c.ty=a[1];c.a=a[2]/100;c.out=!!a[3];c.fall=a[4];c.vx=a[8]/10;c.vy=a[9]/10;c.idx=a[6];c.lap=a[7];if(c.gx==null||Math.hypot(c.tx-c.x,c.ty-c.y)>40){c.x=c.tx;c.y=c.ty;c.gx=1}})}
function follow(){for(const c of cars){if(c.i===K.myIdx||c.tx==null)continue;c.tx+=c.vx;c.ty+=c.vy;c.x+=(c.tx-c.x)*.35;c.y+=(c.ty-c.y)*.35}vis()}
function onFx(k,a){if(k==='w'){const c=cars[a[0]];if(c&&c.i===meIdx())sfx('point');else sfx('pick')}}
/* ---------- CPU drivers ---------- */
function bot(i){const c=cars[i];if(!c||c.out)return{};const o={},lvl=c.i===meIdx()?2:K.cpu,N=MAP.N,sp=Math.hypot(c.vx,c.vy),look=7+Math.floor(sp*5);
 const s=MAP.path[(c.idx+look)%N],lane=c.lane*.5+Math.sin(K.tick*.01+i)*4,tx=s.x+s.ty*lane,ty=s.y-s.tx*lane,at=Math.atan2(tx-c.x,-(ty-c.y)),d=wrapA(at-c.a),dz=[.12,.08,.05][lvl];
 if(d>dz)o.right=true;else if(d<-dz)o.left=true;if(Math.abs(d)>1&&sp>1.4)o.down=true;
 // the lead CPU eases off a little when it's about to leave a human behind
 const me=cars[meIdx()];if(me&&!me.out&&c.prog>me.prog+30&&Math.hypot(c.x-cam.x,c.y-cam.y)>VW*.3&&lvl<2&&(K.tick&1))o.down=true;
 return o}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const carImg=(col,a)=>{const q=Math.round(a/(Math.PI/8))&15;return img('c'+col+q,()=>X.rot(X.recolor(ART.car,col,null,'car'),q*Math.PI/8))};
let SCR=null;
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H),vw=SCR.w,vh=SCR.h-(K.demo?0:9);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!MAP||!cars.length){SCR.present(ctx,W,H);return}
 if(!K.isClient())camStep();const cx=Math.round(cam.x-vw/2),cy=Math.round(cam.y-vh/2);
 g.save();g.beginPath();g.rect(0,0,vw,vh);g.clip();g.drawImage(MAP.tex,-cx,-cy);if(skid)g.drawImage(skid,-cx,-cy);
 for(const p of parts){g.fillStyle=p.col;g.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),1,1)}
 const me=cars[meIdx()];
 for(const c of cars){if(c.out&&!(c.fall>0))continue;const im=carImg(c.col,c.a),sc=c.fall>0?c.fall/30:1,w=Math.round(im.width*sc),h=Math.round(im.height*sc),x=Math.round(c.x-cx),y=Math.round(c.y-cy);
  g.globalAlpha=.35;g.fillStyle=P.k;g.fillRect(x-4+1,y-4+2,8,8);g.globalAlpha=1;g.drawImage(im,x-(w>>1),y-(h>>1),w,h);
  if(c.outT>2&&(K.tick>>2)&1){g.fillStyle='#f05050';g.fillRect(x-6,y-9,12,1)}
  const hum=K.seats[c.i]&&K.seats[c.i].ctrl!=='cpu';if(c===me){g.fillStyle=P.k;g.fillRect(x-3,y-15,7,4);g.fillStyle=(K.tick>>3)&1?'#ffffff':c.col;g.fillRect(x-2,y-14,5,1);g.fillRect(x-1,y-13,3,1)}else if(hum&&!c.out)X.text(g,(c.name||'').slice(0,5),x,y-17,{col:c.col,align:'center',outline:P.k})}
 for(const t of texts)if(me&&t.who===me.i)X.text(g,t.s,t.x-cx,t.y-cy,{col:t.col,align:'center',outline:P.k});
 // the judged frame: a faint border so you can see where the edge is
 const FW=Math.round(fw()),FH=Math.round(fh()),Ld=leader(),kk=shrink(),jx=Ld?cam.x+(Ld.x-cam.x)*(1-kk):cam.x,jy=Ld?cam.y+(Ld.y-cam.y)*(1-kk):cam.y,fx=Math.round(jx-cx-FW/2),fy=Math.round(jy-cy-FH/2);g.fillStyle=shrink()<1?'rgba(60,8,20,.5)':'rgba(16,12,24,.35)';g.fillRect(0,0,vw,fy);g.fillRect(0,fy+FH,vw,vh-fy-FH);g.fillRect(0,fy,fx,FH);g.fillRect(fx+FW,fy,vw-fx-FW,FH);
 if(shrink()<1){g.fillStyle=(K.tick>>3)&1?'#f05050':'#fff07c';g.fillRect(fx,fy,FW,1);g.fillRect(fx,fy+FH-1,FW,1);g.fillRect(fx,fy,1,FH);g.fillRect(fx+FW-1,fy,1,FH)}
 g.restore();hud(g,vw,vh,me);SCR.present(ctx,W,H)}
function hud(g,vw,vh,me){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),target=+K.S.target||5;
 if(K.demo){TX('TINY TRACKS',vw/2,vh-16,{col:'#fff07c',align:'center',scale:2});return}
 TX('ROUND '+round,4,14,{col:'#fff07c'});TX('FIRST TO '+target,4,23,{col:'#a0f0ff'});
 // points table: the leaders and you
 const order=K.mode===1?[0,1]:cars.map(c=>c.i).sort((a,b)=>(score[b]|0)-(score[a]|0));let list=order.slice(0,5);if(me&&K.mode!==1&&!list.includes(me.i))list[4]=me.i;
 list.forEach((k,j)=>{const y=34+j*9,col=K.mode===1?TEAMC[k]:cars[k].col,nm=K.mode===1?TEAMN[k].split(' ')[0]:(cars[k].name||'').slice(0,6);g.fillStyle=P.k;g.fillRect(3,y-1,5,7);g.fillStyle=col;g.fillRect(4,y,3,5);
  TX(nm,10,y-1,{col:me&&k===me.i?'#ffffff':'#c8c4d8',shadow:P.k,outline:false});for(let p=0;p<target;p++){g.fillStyle=p<(score[k]|0)?'#fff07c':'#3c3648';g.fillRect(48+p*5,y+1,4,4)}});
 if(rState==='count'){const n=Math.max(1,3-Math.floor((K.tick-rT)/(CD/3)));TX(K.tick-rT>CD-10?'GO!':n+'',vw/2,vh*.3,{col:'#ffffff',align:'center',scale:3});if((K.tick-rT)%(CD/3|0)===0)RA.audio.blip(440)}
 if(rState==='won'){const w=cars[lastWin];TX(w?(w.name||'').slice(0,10)+' WINS THE ROUND!':'NOBODY LEFT!',vw/2,vh*.3,{col:w?w.col:'#ffffff',align:'center',scale:w&&(w.name||'').length<7?2:1})}
 if(rState==='race'&&K.tick-rT>600&&K.tick-rT<720)TX('THE SCREEN IS CLOSING IN!',vw/2,vh*.22,{col:'#f05050',align:'center'});
 if(me&&me.out&&rState==='race')TX('OUT! BACK NEXT ROUND',vw/2,vh*.7,{col:'#f05050',align:'center'});
 const t=K.tick;if(me&&round===1&&t<CD+60*6)TX('A D STEER - THE CAR GOES BY ITSELF - S BRAKES',vw/2,vh-22,{col:'#ffffff',align:'center'});
 else if(me&&round===1&&t<CD+60*12)TX('STAY ON SCREEN! THE LAST CAR LEFT SCORES',vw/2,vh-22,{col:'#fff07c',align:'center'})}
K=RA.kit({id:'tiny',name:'TINY TRACKS',kind:'Tabletop racing',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Tabletop racing for up to 20 on one screen: tiny cars on the breakfast table, the school desk and the garden path. Fall behind the edge of the screen and you are out - the last car left scores.',
 blurb:'A / D steer - your car accelerates by itself, S brakes. Keep up: the screen follows the leader, and the last car on it scores a point.',
 howto:'A / D (or the stick) steer, S brakes / reverses. Bump rivals off the screen or off the table. First to the target score wins.',
 icon:['..........','...kkkk...','..krrrrk..','.kkrccrkk.','.kkrccrkk.','..krrrrk..','.kkrrrrkk.','.kkrrrrkk.','..krrrrk..','...kkkk...'],
 music:MUSIC,fireLabel:'',
 modes:[['RACE','Everyone for themselves: first to the target.'],['TEAM RACE','Red vs blue: a round win scores for the team.']],
 settings:[['track','Track',[['rnd','Random'],[0,'Breakfast Table'],[1,'School Desk'],[2,'Garden Path']]],['target','First to',[[5,'5 points'],[3,'3 points'],[8,'8 points']]]],
 kb:[['A D','steer'],['S','brake'],['C','chat'],['ESC','menu']],pad:[['LS','steer'],['DOWN','brake'],['START','menu']],
 ach:[{id:'first',name:'Tiny Driver',desc:'Finish your first race',test:s=>s.played>=1,unlock:'title:Tiny Driver'},{id:'win1',name:'Table Champion',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Table Champion'},
  {id:'r3',name:'Hat-trick',desc:'Win 3 rounds in one race',test:(s,m)=>m.kills>=3,unlock:'title:Round Winner'}],
 alive:i=>!!cars[i],out:i=>false,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>MAP?MAP.tr.n:'',
 ranks:()=>cars.slice().sort((a,b)=>b.wins-a.wins).map(c=>[c.name,c.col,c.wins+' round'+(c.wins===1?'':'s')]),
 result:(i,w)=>{const c=cars[i];return{won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),kills:c.wins|0}}});
window.__tt={get cars(){return cars},get score(){return score},get round(){return round},K,bot:i=>bot(i)};

})();
