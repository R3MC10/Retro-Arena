/* DR. PILLBOX for Retro Arena: up to 20 glass bottles in a lit lab. Lag-free: your bottle runs on your machine.
   A / D move the megavitamin, W / Space rotate (Q back), S drops faster. Line up 4 of a colour (viruses count) to clear them.
   Chains (a clear that makes halves fall into another clear) throw coloured halves into a rival's bottle. Clear every virus for the next stage.
   Modes: VERSUS (last bottle standing) · RACE (clear the target stages or be the last bottle standing). Host picks virus level, speed, targeting, garbage and items.
   Dr. Pillbox power pills (party): a 2+ chain fills your PILL slot; press E to use it.
    CHILL PILL (your capsules fall slowly) · RAINBOW (your next capsule matches any colour) · FEVER (a rival's capsules fall fast)
    VIRUS OUTBREAK (4 new viruses in a rival's bottle) · BITTER PILL (a rival's next 3 capsules are two-tone and clash). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const BW=8,BH=16,COL=[null,'#f03040','#f8d020','#3070f8','#ffffff'];
const PILLS=[null,{n:'CHILL PILL',c:'#80e0ff'},{n:'RAINBOW',c:'#ff80ff'},{n:'FEVER',c:'#ff6020'},{n:'VIRUS OUTBREAK',c:'#60ff60'},{n:'BITTER PILL',c:'#b08040'}];
RA.audio.add('pop',(AC,now,g,n)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(400+(n|0)*120,now);o.frequency.exponentialRampToValueAtTime(900+(n|0)*120,now+.1);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);o.connect(g);o.start();o.stop(now+.13)});
const MUSIC=[T('Chill',110,['F','Dm','Gm','C'],'k...s...k.k.s...','f5 - a5 - c6 - a5 - g5 - bb5 - d6 - bb5 - a5 - c6 - f6 - c6 - g5 - e5 - c5 - - -'),
 T('Fever',148,['Am','Dm','G','C'],'k.hsk.hsk.hsk.hs','a4 c5 e5 . d5 . c5 . d4 f4 a4 . g4 . f4 . g4 b4 d5 . c5 . b4 . c5 e5 g5 . e5 . c5 .'),
 T('Lab Rush',160,['Em','Am','D','G'],'k.hhs.hhk.hhs.hk','e5 g5 b5 g5 e5 g5 b5 g5 a4 c5 e5 c5 a4 c5 e5 c5 d5 f#5 a5 f#5 d5 f#5 a5 f#5 g4 b4 d5 b4 g5 - - .'),
 T('Outbreak',176,['Cm','Fm','G','Cm'],'k.hsk.hsk.hsk.ss','c5 . g5 . eb5 . c5 . f5 . ab5 . c6 . ab5 . g5 . b5 . d6 . b5 . c6 - g5 - c5 - - .')];
let K,boards=[];
// cell: 0 empty, or {c:1-3 (4 rainbow), v:virus, l: link dir 0 up 1 right 2 down 3 left / -1 single}
const DX=[0,1,0,-1],DY=[-1,0,1,0];
function seedViruses(b,lvl){b.cells=new Array(BW*BH).fill(null);const n=Math.min(84,4*(lvl+1));let k=0;
 for(let t=0;t<4000&&k<n;t++){const x=Math.floor(b.rr()*BW),y=Math.max(5,BH-1-Math.floor(b.rr()*Math.min(BH-5,4+lvl)));if(b.cells[y*BW+x])continue;const c=1+(k%3);
  if(run(b,x,y,c)>=2)continue;b.cells[y*BW+x]={c,v:1,l:-1};k++}b.vir=k}
function run(b,x,y,c){let h=0,v=0;for(const[dx,dy,acc]of[[1,0,'h'],[-1,0,'h'],[0,1,'v'],[0,-1,'v']]){let xx=x+dx,yy=y+dy;while(xx>=0&&yy>=0&&xx<BW&&yy<BH&&b.cells[yy*BW+xx]&&b.cells[yy*BW+xx].c===c){acc==='h'?h++:v++;xx+=dx;yy+=dy}}return Math.max(h,v)}
function newCap(b){if(b.bitter>0){b.bitter--;return[1+Math.floor(b.rr()*3),1+Math.floor(b.rr()*3)].map((c,k,a)=>k&&c===a[0]?(c%3)+1:c)}return[1+Math.floor(b.rr()*3),1+Math.floor(b.rr()*3)]}
function newBoard(i,name,col){const b={i,name,col,lvl:K.S.virus,cells:null,vir:0,cur:null,next:null,st:'fall',t:0,chain:0,score:0,stages:0,out:false,fx:{},pill:0,bitter:0,rain:0,
  pend:[],outq:[],outLog:[],outSeq:0,inbox:[],inSeen:0,inSeq:0,rSeen:0,prev:{},das:0,dir:0,grav:0,tag:'',tagT:0,lastFrom:-1,ver:0,rr:RA.util.mulberry(K.seed+7)};
 seedViruses(b,b.lvl);b.next=newCap(b);spawn(b);return b}
function spawn(b){const c=b.next;b.next=newCap(b);if(b.rain>0){b.rain--;c[0]=4}b.cur={x:3,y:0,r:0,c};b.grav=0;if(hit(b,b.cur)){b.out=true;b.outAt=K.tick;tag(b,'K.O.');sfx('boom')}}
const halves=p=>{const r=((p.r%4)+4)%4;// r0 horizontal (c0 left), r1 vertical (c0 bottom), r2 horizontal (c0 right), r3 vertical (c0 top)
 if(r===0)return[[p.x,p.y,p.c[0],1],[p.x+1,p.y,p.c[1],3]];if(r===1)return[[p.x,p.y,p.c[0],0],[p.x,p.y-1,p.c[1],2]];if(r===2)return[[p.x+1,p.y,p.c[0],3],[p.x,p.y,p.c[1],1]];return[[p.x,p.y-1,p.c[0],2],[p.x,p.y,p.c[1],0]]};
function hit(b,p){for(const[x,y]of halves(p)){if(x<0||x>=BW||y>=BH)return true;if(y>=0&&b.cells[y*BW+x])return true}return false}
function tryM(b,dx,dy,dr){const p={...b.cur,x:b.cur.x+dx,y:b.cur.y+dy,r:b.cur.r+dr};if(!hit(b,p)){b.cur=p;return true}if(dr){const q={...p,x:p.x-1};if(!hit(b,q)){b.cur=q;return true}}return false}
function settle(b){for(const[x,y,c,l]of halves(b.cur))if(y>=0)b.cells[y*BW+x]={c,v:0,l};b.cur=null;sfx('tlock');b.chain=0;b.st='check';b.t=0;b.ver++}
function findClears(b){const kill=new Set();const same=(a,c)=>a&&(a.c===c||a.c===4||c===4);
 for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const a=b.cells[y*BW+x];if(!a)continue;for(const[dx,dy]of[[1,0],[0,1]]){let n=1,xx=x+dx,yy=y+dy;const c=a.c===4?null:a.c;let cc=c;
   while(xx<BW&&yy<BH){const o=b.cells[yy*BW+xx];if(!o)break;if(cc==null&&o.c!==4)cc=o.c;if(!(o.c===4||o.c===cc||cc==null))break;n++;xx+=dx;yy+=dy}
   if(n>=4)for(let k=0;k<n;k++)kill.add((y+dy*k)*BW+x+dx*k)}}return[...kill]}
function unlink(b,i){const a=b.cells[i];if(!a||a.l<0||a.v)return;const x=i%BW,y=(i/BW)|0,ox=x+DX[a.l],oy=y+DY[a.l];if(ox>=0&&oy>=0&&ox<BW&&oy<BH){const o=b.cells[oy*BW+ox];if(o)o.l=-1}}
function dropStep(b){let moved=false;for(let y=BH-2;y>=0;y--)for(let x=0;x<BW;x++){const i=y*BW+x,a=b.cells[i];if(!a||a.v)continue;
  if(a.l===1){const o=b.cells[i+1];if(!b.cells[i+BW]&&!b.cells[i+BW+1]&&y+1<BH){b.cells[i+BW]=a;b.cells[i+BW+1]=o;b.cells[i]=null;b.cells[i+1]=null;moved=true}continue}
  if(a.l===3)continue;if(a.l===0){if(!b.cells[i+BW]){b.cells[i+BW]=a;b.cells[i]=null;const up=i-BW;if(up>=0&&b.cells[up]){b.cells[i]=b.cells[up];b.cells[up]=null}moved=true}continue}
  if(a.l===2)continue;if(!b.cells[i+BW]){b.cells[i+BW]=a;b.cells[i]=null;moved=true}}return moved}
function stepBoard(b,inp){if(b.out)return;for(const k in b.fx)if(b.fx[k]>0)b.fx[k]--;if(b.tagT>0)b.tagT--;const ed=k=>inp[k]&&!b.prev[k];
 if(ed('alt')&&b.pill){usePill(b,b.pill);b.pill=0}
 if(b.st==='fall'&&b.cur){if(ed('up')||inp.tap)if(tryM(b,0,0,1))sfx('tmove');if(ed('b3'))if(tryM(b,0,0,-1))sfx('tmove');
  const d=inp.left&&!inp.right?-1:inp.right&&!inp.left?1:0;if(d!==b.dir){b.dir=d;b.das=0;if(d&&tryM(b,d,0,0))sfx('tmove')}else if(d&&++b.das>12&&b.das%4===0)tryM(b,d,0,0);
  const lvS=Math.max(6,40-Math.floor(b.stages*2+K.tick/3600*6*(K.S.speed|0))),g=inp.down?2:b.fx.chill>0?lvS*2:b.fx.fever>0?Math.max(3,lvS/3):lvS;
  if(++b.grav>=g){b.grav=0;if(!tryM(b,0,1,0))settle(b)}}
 else if(b.st==='check'){const k=findClears(b);if(k.length){let vk=0,cols=[];for(const i of k){const a=b.cells[i];if(a.v)vk++;cols.push(a.c===4?1+Math.floor(b.rr()*3):a.c);unlink(b,i)}
   for(const i of k)b.cells[i]={c:b.cells[i].c,v:b.cells[i].v,l:-1,die:1};b.vir-=vk;b.chain++;b.score+=vk*100*Math.pow(2,Math.min(5,b.chain-1));sfx('pop',b.chain);b.st='clear';b.t=0;b.ver++;
   if(b.chain>=2){tag(b,b.chain+' CHAIN!');if(K.S.att!=='off')b.outq.push('G'+cols.slice(0,Math.min(4,b.chain)).join(''));if(K.S.items==='party'&&!b.pill)b.pill=1+Math.floor(b.rr()*5)}}
  else{// garbage lands after your move settles
   if(b.pend.length){const g=b.pend.shift();const xs=[...Array(BW).keys()].sort(()=>b.rr()-.5);g.forEach((c,k)=>{const x=xs[k%BW];if(!b.cells[x])b.cells[x]={c:+c,v:0,l:-1}});b.st='drop';b.t=0;return}
   if(b.vir<=0){b.stages++;b.score+=1000;tag(b,'STAGE CLEAR!');b.lvl=Math.min(20,b.lvl+1);seedViruses(b,b.lvl);if(K.mode===1&&b.stages>=K.S.race)b.won=true}
   b.st='fall';spawn(b)}}
 else if(b.st==='clear'){if(++b.t>18){for(let i=0;i<BW*BH;i++)if(b.cells[i]&&b.cells[i].die)b.cells[i]=null;b.st='drop';b.t=0;b.ver++}}
 else if(b.st==='drop'){if(++b.t%5===0){if(!dropStep(b))b.st='check';b.ver++}}
 b.prev=Object.assign({},inp)}
function usePill(b,k){tag(b,PILLS[k].n);sfx('pick');if(k===1)b.fx.chill=600;else if(k===2)b.rain=1;else b.outq.push('P'+k)}
function receive(b,code,from){if(b.out)return;b.lastFrom=from;if(code[0]==='G'){b.pend.push(code.slice(1).split(''));tag(b,'INCOMING!')}
 else{const k=+code.slice(1);if(k===3)b.fx.fever=420;else if(k===4){let n=0;for(let t=0;t<200&&n<4;t++){const x=Math.floor(b.rr()*BW),y=6+Math.floor(b.rr()*(BH-6));if(!b.cells[y*BW+x]){b.cells[y*BW+x]={c:1+n%3,v:1,l:-1};b.vir++;n++}}b.ver++}else if(k===5)b.bitter=3;tag(b,(PILLS[k]||{n:''}).n+'!')}}
function tag(b,s){if(!s)return;b.tag=s;b.tagT=70}
function route(from,code){const al=boards.filter(o=>o!==from&&!o.out);if(!al.length)return;let t;const m=K.S.target;
 if(m==='attacker'&&from.lastFrom>=0&&boards[from.lastFrom]&&!boards[from.lastFrom].out)t=boards[from.lastFrom];else if(m==='leader')t=al.slice().sort((a,c)=>a.vir-c.vir)[0];else t=al[Math.floor(Math.random()*al.length)];
 if(K.seats[t.i].ctrl==='net'){t.inbox.push([++t.inSeq,code,from.i]);if(t.inbox.length>12)t.inbox.shift()}else receive(t,code,from.i);K.fx('a',from.i,t.i)}
function outflow(b){while(b.outq.length){const c=b.outq.shift();b.outSeq++;b.outLog.push([b.outSeq,c]);if(b.outLog.length>12)b.outLog.shift();if(!K.isClient())route(b,c)}}
const ENC='0123456789abcdefghijklmnopqrstuvwxyz';
function pack(b){let s='';for(const a of b.cells)s+=a?ENC[1+(a.c-1)*7+(a.v?6:a.l+1)]:'0';
 return{w:s,c:b.cur?[b.cur.x,b.cur.y,b.cur.r,b.cur.c.join('')]:0,n:b.next.join(''),v:b.vir,l:b.lvl,sg:b.stages,s:b.score,o:b.out?1:0,pl:b.pill,p:b.pend.length,won:b.won?1:0,fx:Object.keys(b.fx).filter(k=>b.fx[k]>0).join(','),t:b.tagT>0?b.tag:'',oq:b.outLog.slice(-8),ver:b.ver}}
function unpack(b,d){if(!d)return;if(typeof d.w==='string'&&d.w.length===BW*BH)b.cells=[...d.w].map(ch=>{const n=ENC.indexOf(ch);if(n<=0)return null;const c=1+Math.floor((n-1)/7),r=(n-1)%7;return{c,v:r===6?1:0,l:r===6?-1:r-1}});
 b.cur=Array.isArray(d.c)?{x:d.c[0],y:d.c[1],r:d.c[2],c:String(d.c[3]).split('').map(Number)}:null;b.next=String(d.n||'11').split('').map(Number);b.vir=d.v|0;b.lvl=d.l|0;b.stages=d.sg|0;b.score=d.s|0;b.out=!!d.o;b.pill=d.pl|0;b.pendN=d.p|0;b.won=!!d.won;
 b.fxs=String(d.fx||'');if(d.t&&d.t!==b.tag){b.tag=d.t;b.tagT=60}}
function start(seats,md,S,seed){boards=seats.map((s,i)=>newBoard(i,s.name,s.col))}
function step(){for(const b of boards){if(K.seats[b.i].ctrl==='net'){if(b.tagT>0)b.tagT--;const d=K.remote(b.i);if(d){const w=b.out;unpack(b,d);for(const e of d.oq||[])if((e[0]|0)>b.rSeen){b.rSeen=e[0]|0;route(b,String(e[1]))}if(!w&&b.out)b.outAt=K.tick}continue}
  stepBoard(b,K.inp(b.i));outflow(b)}
 const al=boards.filter(b=>!b.out),lim=K.S.len*3600,won=boards.find(b=>b.won);
 if(won){K.end({i:won.i});return}
 if(boards.length>1?al.length<=1:!al.length){K.end(al[0]?{i:al[0].i}:null);return}
 if(lim&&K.tick>=lim){const w=al.slice().sort((a,c)=>c.stages-a.stages||a.vir-c.vir||c.score-a.score)[0];K.end(w?{i:w.i}:null)}
 if(al.length===2&&boards.length>2)K.track(3)}
function local(i){const b=boards[i];if(!b)return;stepBoard(b,K.inp(i));outflow(b)}
function upload(i){return boards[i]?pack(boards[i]):null}
let rotN=0;function snap(){rotN++;return{b:boards.map((b,k)=>{const d=pack(b);delete d.oq;if(b.sv===d.ver&&(k+rotN)%Math.max(4,boards.length)!==0)delete d.w;else b.sv=d.ver;d.in=b.inbox.slice(-8);return d})}}
function apply(g){(g.b||[]).forEach((d,k)=>{const b=boards[k];if(!b)return;if(k===K.myIdx){for(const e of d.in||[])if((e[0]|0)>b.inSeen){b.inSeen=e[0]|0;receive(b,String(e[1]),e[2]|0)}return}const w=b.out;unpack(b,d);if(!w&&b.out)b.outAt=K.tick})}
function follow(){for(const b of boards)if(b.i!==K.myIdx&&b.tagT>0)b.tagT--}
function onFx(k,a){if(k==='a'&&a[1]===K.myIdx)sfx('boom')}
/* CPU: try every spot for the capsule, prefer matching colours on top of same colours, low stacks */
function plan(b){let best=null;for(let r=0;r<4;r++)for(let x=-1;x<BW;x++){let p={...b.cur,x,y:0,r};if(hit(b,p))continue;while(!hit(b,{...p,y:p.y+1}))p.y++;let sc=p.y*.4+Math.random()*(K.cpu===0?4:K.cpu===1?1:.1);
  for(const[hx,hy,c]of halves(p)){const below=hy+1<BH?b.cells[(hy+1)*BW+hx]:null;if(below&&below.c===c)sc+=below.v?5:3;else if(below)sc-=2;
   for(const dx of[-1,1]){const s=hx+dx>=0&&hx+dx<BW&&hy>=0?b.cells[hy*BW+hx+dx]:null;if(s&&s.c===c)sc+=1.5}}if(!best||sc>best.sc)best={sc,x,r}}return best}
function bot(i){const b=boards[i];if(!b||b.out||!b.cur)return{};if(b.pk!==b.ver+':'+b.cur.c){b.pk=b.ver+':'+b.cur.c;b.pl=plan(b);b.wait=K.cpu===0?30:K.cpu===1?12:4}
 if(b.pill&&K.tick%60===0)return{alt:true};if(--b.wait>0||!b.pl)return{};const o={};if(((b.cur.r%4)+4)%4!==b.pl.r){if(K.tick%3===0)o.up=true;return o}
 if(b.cur.x<b.pl.x&&K.tick%3===0)o.right=true;else if(b.cur.x>b.pl.x&&K.tick%3===0)o.left=true;else if(b.cur.x===b.pl.x)o.down=true;return o}
/* drawing: glass bottle in a lit lab */
const S=10,BWID=BW*S+30,BHG=BH*S+56;
function virus(g,x,y,c,t){const col=COL[c],j=Math.sin(t*.15+x)*.8;const gr=g.createRadialGradient(x-2,y-2,.5,x,y,6);gr.addColorStop(0,RA.util.mix(col,'#ffffff',.5));gr.addColorStop(1,RA.util.mix(col,'#000000',.4));g.fillStyle=gr;
 g.beginPath();for(let k=0;k<10;k++){const a=k/10*Math.PI*2,r=4.3+(k%2?.9:0)+j*.3;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fill();
 g.fillStyle='#fff';g.fillRect(x-2.6,y-1.6,2,2.4);g.fillRect(x+.6,y-1.6,2,2.4);g.fillStyle='#000';g.fillRect(x-2+(t>>4&1),y-.8,1,1.4);g.fillRect(x+1.2+(t>>4&1),y-.8,1,1.4);g.fillRect(x-1.6,y+2,3.2,.8)}
function half(g,x,y,c,l,a){const col=COL[c]||'#fff';const gr=g.createLinearGradient(x-4,y-4,x+4,y+4);if(c===4){gr.addColorStop(0,'#ff8080');gr.addColorStop(.5,'#80ff80');gr.addColorStop(1,'#8080ff')}else{gr.addColorStop(0,RA.util.mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,RA.util.mix(col,'#000000',.4))}
 g.globalAlpha=a==null?1:a;g.fillStyle=gr;const r=4.3;g.beginPath();g.arc(x,y,r,0,7);g.fill();
 if(l>=0){if(DX[l])g.fillRect(DX[l]>0?x:x-S/2,y-r,S/2,2*r);else g.fillRect(x-r,DY[l]>0?y:y-S/2,2*r,S/2)}
 g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(x-1.5,y-1.5,1.3,0,7);g.fill();g.globalAlpha=1}
function drawBottle(g,b,X,Y,sc,mine){g.save();g.translate(X,Y);g.scale(sc,sc);const ox=15,oy=40;
 const gl=g.createLinearGradient(ox-6,0,ox+BW*S+6,0);gl.addColorStop(0,'rgba(180,220,255,.35)');gl.addColorStop(.15,'rgba(255,255,255,.15)');gl.addColorStop(.85,'rgba(120,160,220,.12)');gl.addColorStop(1,'rgba(180,220,255,.35)');
 g.fillStyle='rgba(10,20,40,.85)';g.fillRect(ox,oy,BW*S,BH*S);g.fillStyle=gl;g.beginPath();g.moveTo(ox-5,oy-4);g.lineTo(ox+BW*S/2-12,oy-4);g.lineTo(ox+BW*S/2-12,oy-24);g.lineTo(ox+BW*S/2+12,oy-24);g.lineTo(ox+BW*S/2+12,oy-4);g.lineTo(ox+BW*S+5,oy-4);g.lineTo(ox+BW*S+5,oy+BH*S+5);g.lineTo(ox-5,oy+BH*S+5);g.closePath();g.fill();
 g.strokeStyle='rgba(200,230,255,.6)';g.lineWidth=1.2;g.stroke();
 const t=K.tick;for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const a=b.cells&&b.cells[y*BW+x];if(!a)continue;const cx=ox+x*S+5,cy=oy+y*S+5;if(a.die&&(t>>2)&1)continue;if(a.v)virus(g,cx,cy,a.c,t);else half(g,cx,cy,a.c,a.l)}
 if(b.cur&&!b.out)for(const[x,y,c,l]of halves(b.cur))if(y>=0)half(g,ox+x*S+5,oy+y*S+5,c,l);
 if(b.next){half(g,ox+BW*S/2-5,oy-14,b.next[0],1);half(g,ox+BW*S/2+5,oy-14,b.next[1],3)}
 g.font='6px "Russo One",sans-serif';g.textAlign='center';g.fillStyle=b.col;g.fillText(String(b.name).slice(0,12),ox+BW*S/2,oy+BH*S+14);
 g.fillStyle='#fff';g.fillText('VIRUS '+b.vir+'  ·  LV '+b.lvl+(b.pill?'  · E: '+PILLS[b.pill].n:''),ox+BW*S/2,oy-30);
 const pn=b.pend?b.pend.length:b.pendN|0;if(pn){g.fillStyle='#ff4040';g.fillText('▼'.repeat(Math.min(5,pn)),ox+BW*S/2,oy+4)}
 if(b.tagT>0){g.font='9px "Russo One",sans-serif';g.fillStyle='rgba(0,0,0,.6)';g.fillText(b.tag,ox+BW*S/2+1,oy+BH*S/2+1);g.fillStyle='#fff';g.fillText(b.tag,ox+BW*S/2,oy+BH*S/2)}
 if(b.out){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(ox,oy,BW*S,BH*S);g.font='13px "Russo One",sans-serif';g.fillStyle='#f04848';g.fillText('K.O.',ox+BW*S/2,oy+BH*S/2)}
 g.restore()}
function render(g,Wv,Hv){const bg=g.createLinearGradient(0,0,0,Hv);bg.addColorStop(0,'#1c2a3a');bg.addColorStop(.6,'#0c141e');bg.addColorStop(1,'#05080c');g.fillStyle=bg;g.fillRect(0,0,Wv,Hv);
 g.fillStyle='rgba(255,255,255,.04)';for(let y=Hv*.62;y<Hv;y+=10)g.fillRect(0,y,Wv,1);const lamp=g.createRadialGradient(Wv/2,-20,10,Wv/2,-20,Hv);lamp.addColorStop(0,'rgba(255,240,200,.18)');lamp.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lamp;g.fillRect(0,0,Wv,Hv);
 if(!boards.length)return;const fs=K.demo?[]:K.focus(),main=fs.length===1?boards[fs[0]]:null,top=22,bot=Hv-26;
 const grid=(list,ax,aw)=>{const ah=bot-top;let best=null;for(let cols=1;cols<=list.length;cols++){const rows=Math.ceil(list.length/cols),sc=Math.min(aw/cols/BWID,ah/rows/BHG);if(!best||sc>best.sc)best={cols,sc}}
  const tw=best.cols*BWID*best.sc,ox=ax+(aw-tw)/2;list.forEach((b,k)=>drawBottle(g,b,ox+(k%best.cols)*BWID*best.sc,top+Math.floor(k/best.cols)*BHG*best.sc,best.sc,false))};
 if(main){const sc=(bot-top)/BHG,mw=BWID*sc;drawBottle(g,main,16,top,sc,true);const rest=boards.filter(b=>b!==main);if(rest.length)grid(rest,mw+28,Wv-mw-36)}else grid(boards,8,Wv-16)}
K=RA.kit({id:'drmario',name:'DR. PILLBOX',kind:'Virus puzzle',players:'1-20 players',demo:4,localFirst:true,
 desc:'Up to 20 glass bottles in a lit lab: line up megavitamins to wipe out the viruses, chain clears to drop halves on rivals, and throw Dr. Pillbox power pills like Fever and Virus Outbreak.',
 blurb:'A / D move, W or Space rotate, S drops faster, E uses your power pill. Clear every virus; chains drop halves into a rival bottle.',
 howto:'A / D move, W or Space rotate, Q rotate back, S drop faster, E use power pill. Gamepad: d-pad moves, A rotates, X rotates back, B uses the pill.',
 icon:['..........','..rrryyy..','..rrryyy..','..........','.b..bb..b.','bbb.bb.bbb','.b......b.','..........','...kwwk...','..k.ww.k..'],
 music:MUSIC,fireLabel:'TURN',
 modes:[['VERSUS','Everyone vs everyone. Last bottle standing wins.'],['RACE','Clear the target stages or be the last bottle standing. At the time limit: most stages, then fewest viruses, then score.']],
 settings:[['virus','Virus level',[[4,'4'],[0,'0'],[8,'8'],[12,'12'],[16,'16'],[20,'20']]],['speed','Speed',[[1,'Med'],[0,'Low'],[2,'Hi']]],['target','Target',[['random','Random'],['attacker','Attacker'],['leader','Leader']]],
  ['att','Garbage',[['on','On'],['off','Off']]],['items','Power pills',[['off','Off'],['party','Wild party']]],['race','Race stages',[[3,'3'],[1,'1'],[5,'5']]],['len','Time limit',[[0,'None'],[5,'5 min'],[10,'10 min']]]],
 kb:[['A D','move'],['W SPACE','rotate'],['S','drop'],['E','pill'],['C','chat'],['ESC','menu']],pad:[['DPAD','move'],['A','rotate'],['B','pill'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Intern',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Intern'},{id:'win1',name:'Chief Physician',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Chief Physician'},
  {id:'st3',name:'Cure Found',desc:'Clear 3 stages in one match',test:(s,m)=>m.stages>=3,unlock:'title:Cure Found'},{id:'pts',name:'Virologist',desc:'Score 20,000 in one match',test:(s,m)=>m.bestScore>=20000,unlock:'title:Virologist'}],
 alive:i=>!!boards[i]&&!boards[i].out,start,step,local,upload,follow,snap,apply,render,bot,onFx,
 ranks:()=>boards.slice().sort((a,b)=>(b.won|0)-(a.won|0)||(a.out-b.out)||((b.outAt|0)-(a.outAt|0))||b.stages-a.stages||a.vir-b.vir).map(b=>[b.name,b.col,b.stages+' stages · '+b.vir+' virus']),
 result:(i,w)=>{const b=boards[i];return{won:!!w&&w.i===i,stages:b.stages,bestScore:b.score}}});
window.__dm={get boards(){return boards},K,P:()=>boards[1]?boards[1].cur&&boards[1].cur.x:0};
})();
