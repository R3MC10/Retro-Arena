/* SNAKE PIT for Retro Arena: the classic grid snake for up to 20 players in one walled pit, top-down with raised walls (2.5D).
   WASD / arrows / mouse steer (the mouse points where your head should go), Space or click boosts (costs a tail segment).
   Eat apples to grow; when a snake dies its body turns into food. Host picks body hits (die or bite through), boost, win rule,
   length, lives, power-ups and the arena. Power-ups made for snakes only:
    GOLDEN EGG +5 length · VENOM FANG bite through one body · BURROW go underground, pass through anything · RATTLE stun every
    rival near you · MOLT shed your tail as a wall · CHARM rivals near you steer backwards · MONGOOSE (party) a mongoose hunts
    the longest snake · SHED SKIN (party) every rival loses a third of its length. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const C=12,DX=[0,1,0,-1],DY=[-1,0,1,0],DCH='urdl';
const ITEMS=[null,{n:'APPLE',c:'#e83030'},{n:'GOLDEN EGG',c:'#f8d040'},{n:'VENOM FANG',c:'#60e040'},{n:'BURROW',c:'#a07040'},{n:'RATTLE',c:'#f0a030'},{n:'MOLT',c:'#c0b8a0'},{n:'CHARM',c:'#ff70c0'},{n:'MONGOOSE',c:'#c08850',party:1},{n:'SHED SKIN',c:'#a0f0f0',party:1}];
RA.audio.add('chomp',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(600,now);o.frequency.exponentialRampToValueAtTime(180,now+.07);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);o.start();o.stop(now+.09)});
RA.audio.add('hiss',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=3000;g.gain.setValueAtTime(.18,now);g.gain.exponentialRampToValueAtTime(.001,now+.35);s.connect(f);f.connect(g);s.start();s.stop(now+.36)});
const MUSIC=[T('Charmer',96,['Dm','A','Dm','Gm'],'k...s...k.k.s...','d5 - e5 f5 - e5 d5 - c#5 - d5 - a4 - - - f5 - g5 a5 - g5 f5 - e5 - f5 - d5 - - - bb5 - a5 g5 - f5 e5 - d5 - c#5 - d5 - - -'),
 T('Desert Pit',128,['Am','Dm','E','Am'],'k.hsk.hsk.hsk.hs','a4 . c5 . e5 . d#5 e5 . c5 . a4 . b4 . d5 . f5 . e5 d5 . b4 . g#4 . e5 . g#5 . b5 . a5 . e5 . c5 . a4 - -'),
 T('Coil Rush',150,['Em','C','D','B7'],'k.hhs.hhk.hhs.hk','e5 g5 b5 . a5 g5 e5 . c5 e5 g5 . f#5 e5 c5 . d5 f#5 a5 . g5 f#5 d5 . b4 d#5 f#5 . a5 f#5 d#5 .'),
 T('Last Snake',170,['Cm','Ab','Bb','G'],'k.hsk.hsk.hsk.ss','c5 . eb5 . g5 . c6 . bb5 . ab5 . g5 . eb5 . f5 . ab5 . c6 . bb5 . g5 . f5 . d5 . g4 - b4 - d5 - g5 -')];
let W=40,H=30,wall=new Uint8Array(W*H),snakes=[],food=[],goose=null,parts=[],texts=[],K;
const at=(x,y)=>y*W+x,inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
function buildArena(n,seed){const rr=RA.util.mulberry(seed);W=Math.min(96,36+n*3)|0;H=Math.round(W*.7);wall=new Uint8Array(W*H);
 for(let x=0;x<W;x++){wall[at(x,0)]=1;wall[at(x,H-1)]=1}for(let y=0;y<H;y++){wall[at(0,y)]=1;wall[at(W-1,y)]=1}
 const kind=K.S.arena==='random'?['open','pillars','maze'][Math.floor(rr()*3)]:K.S.arena;
 if(kind==='pillars')for(let k=0;k<W*H/160;k++){const x=2+Math.floor(rr()*(W-6)),y=2+Math.floor(rr()*(H-6));for(let a=0;a<2;a++)for(let b=0;b<2;b++)wall[at(x+a,y+b)]=1}
 if(kind==='maze')for(let k=0;k<W*H/90;k++){const x=3+Math.floor(rr()*(W-8)),y=3+Math.floor(rr()*(H-8)),hz=rr()<.5,l=3+Math.floor(rr()*5);for(let i=0;i<l;i++){const xx=x+(hz?i:0),yy=y+(hz?0:i);if(inside(xx,yy)&&xx<W-2&&yy<H-2)wall[at(xx,yy)]=1}}}
function occupied(x,y){if(!inside(x,y)||wall[at(x,y)])return true;for(const s of snakes)if(s.alive&&s.body.some(b=>b[0]===x&&b[1]===y))return true;return false}
function freeSpot(m){for(let t=0;t<400;t++){const x=m+Math.floor(Math.random()*(W-2*m)),y=m+Math.floor(Math.random()*(H-2*m));if(!occupied(x,y)&&!food.some(f=>f.x===x&&f.y===y))return[x,y]}return[W>>1,H>>1]}
function spawnSnake(s){for(let t=0;t<200;t++){const[x,y]=freeSpot(4),d=Math.floor(Math.random()*4);let ok=true;const body=[];
  for(let i=0;i<4;i++){const bx=x-DX[d]*i,by=y-DY[d]*i;if(occupied(bx,by)||occupied(x+DX[d]*(i+1),y+DY[d]*(i+1))){ok=false;break}body.push([bx,by])}
  if(!ok)continue;Object.assign(s,{body,prev:body.map(b=>b.slice()),dir:d,want:d,grow:2,alive:true,mt:0,inv:90,fang:0,burrow:0,stun:0,charm:0,boostT:0});return}
 s.alive=false;s.respawn=30}
const teamOf=i=>K.mode===1?i%2:i;
const TEAMC=['#f04848','#4890f8'];
function start(seats,md,S,seed){snakes=seats.map((st,i)=>({i,name:st.name,col:md===1?TEAMC[i%2]:st.col,lives:S.lives,score:0,kills:0,best:0,body:[],prev:[],alive:false,respawn:i*3,out:false}));
 food=[];parts=[];texts=[];goose=null;buildArena(seats.length,seed);if(K.isClient())return;
 for(const s of snakes)spawnSnake(s);for(let k=0;k<Math.max(4,seats.length*2);k++)addFood(1)}
function addFood(k,x,y){if(x==null)[x,y]=freeSpot(1);food.push({x,y,k})}
function pickItem(){const pool=[];for(let k=2;k<ITEMS.length;k++){if(ITEMS[k].party&&K.S.pow!=='party')continue;pool.push(k)}return pool[Math.floor(Math.random()*pool.length)]}
function kill(s,by){if(!s.alive)return;s.alive=false;s.respawn=90;sfx('boom');K.fx('d',s.i);
 for(let k=0;k<s.body.length;k+=2){const[x,y]=s.body[k];if(inside(x,y)&&!wall[at(x,y)])food.push({x,y,k:1,t:900})}
 for(const[x,y]of s.body.slice(0,6))burst(x,y,s.col);
 if(by!=null&&by!==s.i&&snakes[by]){snakes[by].kills++;snakes[by].score+=50;say(snakes[by].body[0],'KO!',snakes[by].col)}
 if(K.S.lives>0){s.lives--;if(s.lives<=0)s.out=true}}
function burst(x,y,col){for(let i=0;i<6;i++)parts.push({x:x*C+6,y:y*C+6,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:30,col})}
function say(p,s,col){if(p)texts.push({x:p[0]*C+6,y:p[1]*C,s,col,t:60})}
function use(s,k){const h=s.body[0];say(h,ITEMS[k].n,ITEMS[k].c);sfx('pick');K.fx('i',s.i,k);
 if(k===2)s.grow+=5;else if(k===3)s.fang=3;else if(k===4)s.burrow=240;
 else if(k===5)for(const o of snakes){if(o===s||!o.alive||teamOf(o.i)===teamOf(s.i))continue;if(Math.hypot(o.body[0][0]-h[0],o.body[0][1]-h[1])<10){o.stun=60;say(o.body[0],'STUNNED',o.col)}}
 else if(k===6){const cut=Math.floor(s.body.length/2);if(cut>=2){for(const[x,y]of s.body.slice(-cut))if(!occupied(x,y)||true)wall[at(x,y)]=2;s.body.length-=cut;s.prev.length=s.body.length}}
 else if(k===7)for(const o of snakes){if(o===s||!o.alive||teamOf(o.i)===teamOf(s.i))continue;if(Math.hypot(o.body[0][0]-h[0],o.body[0][1]-h[1])<14)o.charm=240}
 else if(k===8){const lead=snakes.filter(o=>o.alive&&o!==s).sort((a,b)=>b.body.length-a.body.length)[0];if(lead){const[x,y]=freeSpot(2);goose={x,y,tgt:lead.i,t:600,mt:0}}}
 else if(k===9)for(const o of snakes){if(o===s||!o.alive||teamOf(o.i)===teamOf(s.i))continue;const n=Math.floor(o.body.length/3);if(o.body.length-n>=3){o.body.length-=n;o.prev.length=o.body.length}}}
function steer(s,inp){let d=-1;if(inp.up)d=0;else if(inp.right)d=1;else if(inp.down)d=2;else if(inp.left)d=3;
 if(d<0&&inp.aim!=null){const a=inp.aim,c=Math.cos(a),sn=Math.sin(a);if(Math.abs(c)>Math.abs(sn)*1.15)d=c>0?1:3;else if(Math.abs(sn)>Math.abs(c)*1.15)d=sn>0?2:0}
 if(d>=0&&s.charm>0)d=(d+2)%4;
 if(d>=0&&d!==(s.dir+2)%4)s.want=d}
function stepSnake(s){const inp=K.inp(s.i);steer(s,inp);
 const boost=K.S.boost==='on'&&inp.fire&&s.body.length>5;const iv=boost?3:Math.max(4,7-Math.floor(K.tick/3600));
 if(s.stun>0){s.stun--;return}if(++s.mt<iv)return;s.mt=0;
 if(boost&&++s.boostT%5===0){const t=s.body.pop();s.prev.pop();if(t)addFood(1,t[0],t[1])}
 s.dir=s.want;const h=s.body[0],nx=h[0]+DX[s.dir],ny=h[1]+DY[s.dir];s.prev=s.body.map(b=>b.slice());
 if(!inside(nx,ny)||wall[at(nx,ny)]===1&&s.burrow<=0){kill(s,null);return}
 if(wall[at(nx,ny)]===2){if(s.burrow<=0){kill(s,null);return}}
 if(s.burrow<=0&&s.inv<=0)for(const o of snakes){if(!o.alive)continue;const idx=o.body.findIndex((b,j)=>b[0]===nx&&b[1]===ny&&!(o===s&&j===o.body.length-1&&!s.grow));if(idx<0)continue;
  if(o!==s&&K.mode===1&&teamOf(o.i)===teamOf(s.i))continue;
  if(idx===0&&o!==s){kill(s,o.i);kill(o,s.i);return}
  if(o!==s&&(s.fang>0||K.S.hit==='bite')){const cut=o.body.splice(idx);o.prev.length=o.body.length;s.grow+=Math.ceil(cut.length/2);if(s.fang>0)s.fang--;sfx('chomp');say([nx,ny],'BITE!',s.col);if(o.body.length<2)kill(o,s.i);break}
  kill(s,o===s?null:o.i);return}
 s.body.unshift([nx,ny]);if(s.grow>0)s.grow--;else s.body.pop();while(s.prev.length<s.body.length)s.prev.push(s.prev[s.prev.length-1]||[nx,ny]);
 s.best=Math.max(s.best,s.body.length);
 const fi=food.findIndex(f=>f.x===nx&&f.y===ny);if(fi>=0){const f=food[fi];food.splice(fi,1);if(f.k===1){s.grow+=1;s.score+=10;sfx('chomp')}else use(s,f.k);
  if(f.k===1&&!f.t)addFood(1)}}
function step(){const S=K.S;
 for(const s of snakes){if(s.out)continue;if(!s.alive){if(--s.respawn<=0)spawnSnake(s);continue}
  if(s.inv>0)s.inv--;if(s.burrow>0)s.burrow--;if(s.charm>0)s.charm--;stepSnake(s)}
 for(const f of food)if(f.t)f.t--;food=food.filter(f=>!f.t||f.t>0);
 if(S.pow!=='off'&&K.tick%300===0&&food.filter(f=>f.k>1).length<2+snakes.length/4)addFood(pickItem());
 if(food.filter(f=>f.k===1).length<snakes.length)addFood(1);
 if(goose){goose.t--;const tg=snakes[goose.tgt];if(!tg||!tg.alive||goose.t<=0)goose=null;else if(++goose.mt>=5){goose.mt=0;const h=tg.body[0];
   const dx=Math.sign(h[0]-goose.x),dy=Math.sign(h[1]-goose.y);if(Math.abs(h[0]-goose.x)>Math.abs(h[1]-goose.y))goose.x+=dx;else goose.y+=dy;
   const hit=tg.body.findIndex(b=>b[0]===goose.x&&b[1]===goose.y);if(hit===0){kill(tg,null);goose=null}else if(hit>0){tg.body.length=Math.max(2,hit);tg.prev.length=tg.body.length;sfx('chomp')}}}
 fxStep();
 // the end
 const live=snakes.filter(s=>!s.out),lim=S.len*3600;
 if(K.mode===1){const tl=[0,1].filter(t=>live.some(s=>s.i%2===t));if(snakes.length>1&&tl.length<=1&&S.lives>0){K.end(tl.length?{team:tl[0],name:['Red team','Blue team'][tl[0]]}:null);return}}
 else if(S.lives>0&&(snakes.length>1?live.length<=1:!live.length)){K.end(live[0]?{i:live[0].i}:null);return}
 if(lim&&K.tick>=lim){if(K.mode===1){const sc=[0,1].map(t=>snakes.filter(s=>s.i%2===t).reduce((a,s)=>a+s.score+s.body.length*5,0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:['Red team','Blue team'][sc[0]>sc[1]?0:1]})}
  else{const b=snakes.slice().sort((a,c)=>(c.alive?c.body.length:0)-(a.alive?a.body.length:0)||c.score-a.score)[0];K.end(b?{i:b.i}:null)}}
 if(live.length===2&&snakes.length>2)K.track(3)}
function fxStep(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vx*=.92;p.vy*=.92;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.y-=.4}texts=texts.filter(t=>t.t>0)}
/* ---- online: each body goes as head + a string of steps */
function enc(s){let str='';for(let j=1;j<s.body.length;j++){const a=s.body[j-1],b=s.body[j];const d=DX.findIndex((dx,k)=>a[0]+dx===b[0]&&a[1]+DY[k]===b[1]);str+=d<0?'x':DCH[d]}return str}
function snap(){return{s:snakes.map(s=>[s.alive?1:0,s.alive?s.body[0][0]:0,s.alive?s.body[0][1]:0,s.alive?enc(s):'',s.lives,s.score,s.kills,(s.burrow>0?1:0)|(s.stun>0?2:0)|(s.charm>0?4:0)|(s.inv>0?8:0)|(s.fang>0?16:0),s.out?1:0,s.dir]),
 f:food.map(f=>[f.x,f.y,f.k]),g:goose?[goose.x,goose.y]:0,mw:[...wall].map((v,i)=>v===2?i:-1).filter(i=>i>=0).slice(0,300)}}
function apply(g){(g.s||[]).forEach((a,i)=>{const s=snakes[i];if(!s)return;s.lives=a[4]|0;s.score=a[5]|0;s.kills=a[6]|0;s.out=!!a[8];const f=a[7]|0;
  s.burrow=f&1?1:0;s.stun=f&2;s.charm=f&4;s.inv=f&8?1:0;s.fang=f&16;
  if(!a[0]){if(s.alive)for(const b of s.body.slice(0,6))burst(b[0],b[1],s.col);s.alive=false;s.body=[];return}
  const body=[[a[1],a[2]]];for(const ch of String(a[3])){const d=DCH.indexOf(ch),p=body[body.length-1];body.push(d<0?p.slice():[p[0]+DX[d],p[1]+DY[d]])}
  const moved=!s.alive||!s.body.length||s.body[0][0]!==body[0][0]||s.body[0][1]!==body[0][1];
  if(moved){s.prev=s.body.length&&s.alive?s.body.map(b=>b.slice()):body.map(b=>b.slice());while(s.prev.length<body.length)s.prev.push(s.prev[s.prev.length-1]);s.mt=0;s.iv=Math.max(2,s.lastGap||6);s.lastGap=0}
  s.body=body;s.alive=true;s.dir=a[9]|0});
 food=(g.f||[]).map(a=>({x:a[0],y:a[1],k:a[2]}));goose=g.g?{x:g.g[0],y:g.g[1]}:null;
 for(let i=0;i<wall.length;i++)if(wall[i]===2)wall[i]=0;for(const i of g.mw||[])if(i>=0&&i<wall.length)wall[i]=2}
function follow(){for(const s of snakes){s.mt=(s.mt|0)+1;s.lastGap=(s.lastGap|0)+1}fxStep()}
function onFx(k,a){if(k==='d'){sfx('boom')}else if(k==='i'){sfx('pick');const s=snakes[a[0]];if(s&&s.body[0])say(s.body[0],ITEMS[a[1]]?ITEMS[a[1]].n:'',ITEMS[a[1]]?ITEMS[a[1]].c:'#fff')}}
/* ---- CPU */
function bot(i){const s=snakes[i];if(!s||!s.alive)return{};const h=s.body[0];
 let tgt=null,bd=1e9;for(const f of food){const d=Math.abs(f.x-h[0])+Math.abs(f.y-h[1])+(f.k>1?-4:0);if(d<bd){bd=d;tgt=f}}
 const safe=d=>{const x=h[0]+DX[d],y=h[1]+DY[d];if(d===(s.dir+2)%4)return-1e9;if(occupied(x,y)||wall[at(x,y)]===2)return-1e6;let free=0;for(let k=0;k<4;k++)if(!occupied(x+DX[k],y+DY[k]))free++;
  return free*3-(tgt?Math.abs(tgt.x-x)+Math.abs(tgt.y-y):0)+Math.random()*(K.cpu===0?6:K.cpu===1?2:.5)};
 let best=s.dir,bv=-1e12;for(let d=0;d<4;d++){const v=safe(d);if(v>bv){bv=v;best=d}}
 return{[['up','right','down','left'][best]]:true}}
/* ---- camera + drawing */
const cam={x:0,y:0,z:1};
function camFor(Wv,Hv){const fs=K.focus().map(i=>snakes[i]).filter(s=>s&&s.alive&&s.body.length);const ww=W*C,hh=H*C;
 let tx=ww/2,ty=hh/2,z=Math.min(Wv/ww,Hv/(hh+20));
 if(fs.length===1&&!K.demo){const p=fs[0].body[0];tx=p[0]*C;ty=p[1]*C;z=Math.max(z,Math.min(2.2,Hv/(22*C)))}
 cam.z+=(z-cam.z)*.1;const vw=Wv/cam.z,vh=Hv/cam.z,cl=(v,size,view)=>size<=view?(size-view)/2:Math.max(0,Math.min(size-view,v));
 cam.x+=(cl(tx-vw/2,ww,vw)-cam.x)*.15;cam.y+=(cl(ty-vh/2,hh,vh)-cam.y)*.15}
function aim(i,fx,fy){const s=snakes[i];if(!s||!s.alive)return null;const h=s.body[0],wx=cam.x+fx*K.W/cam.z,wy=cam.y+fy*K.H/cam.z;
 const dx=wx-(h[0]*C+6),dy=wy-(h[1]*C+6);if(Math.hypot(dx,dy)<C*1.2)return null;return Math.atan2(dy,dx)}
let floorC=null,floorSig='';
function buildFloor(){const sig=W+'x'+H+K.seed;if(sig===floorSig)return;floorSig=sig;floorC=document.createElement('canvas');floorC.width=W*C*2;floorC.height=H*C*2;const g=floorC.getContext('2d');g.scale(2,2);
 const rr=RA.util.mulberry(K.seed|0);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const l=((x+y)&1)?0:6,n=rr()*8;g.fillStyle=`rgb(${168+l+n},${136+l+n*.8},${88+l*.6})`;g.fillRect(x*C,y*C,C,C)}
 for(let k=0;k<W*H/6;k++){g.fillStyle='rgba(90,60,30,.25)';g.beginPath();g.arc(rr()*W*C,rr()*H*C,.6+rr()*1.4,0,7);g.fill()}
 const v=g.createRadialGradient(W*C/2,H*C/2,Math.min(W,H)*C*.2,W*C/2,H*C/2,Math.max(W,H)*C*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,10,0,.45)');g.fillStyle=v;g.fillRect(0,0,W*C,H*C)}
function block(g,x,y,top,side){const X=x*C,Y=y*C,h=6;g.fillStyle=side;g.fillRect(X,Y-h+C,C,h);g.fillStyle=top;g.fillRect(X,Y-h,C,C);
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(X,Y-h,C,1.5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X+C-1.5,Y-h,1.5,C)}
function render(g,Wv,Hv){camFor(Wv,Hv);buildFloor();
 const bg=g.createLinearGradient(0,0,0,Hv);bg.addColorStop(0,'#2a1408');bg.addColorStop(1,'#120804');g.fillStyle=bg;g.fillRect(0,0,Wv,Hv);
 g.save();g.setTransform(cam.z,0,0,cam.z,-cam.x*cam.z,-cam.y*cam.z);g.imageSmoothingEnabled=true;
 g.drawImage(floorC,0,0,W*C,H*C);
 // food
 for(const f of food){const X=f.x*C+6,Y=f.y*C+6,b=Math.sin(K.tick*.1+f.x)*1.2;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(X+1,Y+4,4,2,0,0,7);g.fill();
  if(f.k===1){const r=g.createRadialGradient(X-1.5,Y-2+b,.5,X,Y+b,5);r.addColorStop(0,'#ff9090');r.addColorStop(.4,'#e02828');r.addColorStop(1,'#701010');g.fillStyle=r;g.beginPath();g.arc(X,Y+b,4.4,0,7);g.fill();g.fillStyle='#40a020';g.fillRect(X,Y-6+b,2.5,2)}
  else{const it=ITEMS[f.k],r=g.createRadialGradient(X-1.5,Y-2+b,.5,X,Y+b,6);r.addColorStop(0,'#fff');r.addColorStop(.35,it.c);r.addColorStop(1,'#202020');g.fillStyle=r;g.beginPath();g.arc(X,Y+b,5.2,0,7);g.fill();
   g.strokeStyle=`rgba(255,255,255,${.4+.4*Math.sin(K.tick*.15)})`;g.lineWidth=1;g.beginPath();g.arc(X,Y+b,7,0,7);g.stroke();
   g.fillStyle='#000';g.font='bold 6px "Russo One",sans-serif';g.textAlign='center';g.fillText('?',X,Y+2+b)}}
 // snakes, each segment eased between its last and current cell
 for(const s of snakes){if(!s.alive||!s.body.length)continue;const iv=s.iv||7,p=Math.min(1,(s.mt|0)/iv);
  const pts=s.body.map((b,j)=>{const a=s.prev[j]||b;return[(a[0]+(b[0]-a[0])*p)*C+6,(a[1]+(b[1]-a[1])*p)*C+6]});
  const ghost=s.burrow>0,blink=s.inv>0&&(K.tick>>2)&1;if(blink)continue;g.globalAlpha=ghost?.35:1;
  g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=9;g.lineCap=g.lineJoin='round';g.beginPath();pts.forEach((q,j)=>j?g.lineTo(q[0]+2,q[1]+4):g.moveTo(q[0]+2,q[1]+4));g.stroke();
  const dark=RA.util.mix(s.col,'#000000',.45),lite=RA.util.mix(s.col,'#ffffff',.45);
  g.strokeStyle=dark;g.lineWidth=10;g.beginPath();pts.forEach((q,j)=>j?g.lineTo(q[0],q[1]-1):g.moveTo(q[0],q[1]-1));g.stroke();
  g.strokeStyle=s.col;g.lineWidth=7;g.stroke();
  for(let j=pts.length-1;j>=0;j--){const[x,y]=pts[j],r=j===0?6.2:5.4-Math.min(1.6,j/pts.length*1.8),gr=g.createRadialGradient(x-1.5,y-2,.5,x,y,r+1);
   gr.addColorStop(0,lite);gr.addColorStop(.5,j%2?s.col:RA.util.mix(s.col,'#000000',.12));gr.addColorStop(1,dark);g.fillStyle=gr;g.beginPath();g.arc(x,y-1,r,0,7);g.fill()}
  const[hx,hy]=pts[0],d=s.dir,ex=DX[d],ey=DY[d],px=-ey,py=ex;
  for(const sd of[-1,1]){const x=hx+ex*2+px*sd*2.6,y=hy-1+ey*2+py*sd*2.6;g.fillStyle='#fff';g.beginPath();g.arc(x,y,1.8,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(x+ex*.6,y+ey*.6,1,0,7);g.fill()}
  if((K.tick>>4)%3===0){g.strokeStyle='#e02040';g.lineWidth=1;g.beginPath();g.moveTo(hx+ex*5,hy-1+ey*5);g.lineTo(hx+ex*8,hy-1+ey*8);g.stroke()}
  if(s.fang){g.fillStyle='#80ff60';g.fillRect(hx+ex*5-1,hy+ey*5-2,2,2)}
  if(s.stun){g.fillStyle='#f8d040';for(let k=0;k<3;k++){const an=K.tick*.2+k*2.1;g.fillRect(hx+Math.cos(an)*7,hy-8+Math.sin(an)*2,2,2)}}
  if(s.charm){g.fillStyle='#ff70c0';g.font='7px sans-serif';g.textAlign='center';g.fillText('♥',hx,hy-9)}
  g.globalAlpha=1;
  RA.gfx.text(g,s.name,hx,hy-14,s.col)}
 if(goose){const X=goose.x*C+6,Y=goose.y*C+6;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(X+1,Y+4,6,2.5,0,0,7);g.fill();
  const r=g.createRadialGradient(X-2,Y-3,1,X,Y,7);r.addColorStop(0,'#f0c890');r.addColorStop(1,'#704020');g.fillStyle=r;g.beginPath();g.ellipse(X,Y-1,7,5,0,0,7);g.fill();g.fillStyle='#000';g.fillRect(X+3,Y-3,1.5,1.5)}
 // raised walls on top, drawn back to front
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=wall[at(x,y)];if(v===1)block(g,x,y,'#7a5a3a','#3e2a18');else if(v===2)block(g,x,y,'#d8d0b8','#8a8270')}
 for(const p of parts){g.globalAlpha=p.t/30;g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,1.6,0,7);g.fill()}g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,t.x,t.y,t.col);
 g.restore();
 // HUD: lengths
 const list=snakes.slice().sort((a,b)=>b.body.length-a.body.length).slice(0,8);g.font='6px "Russo One",sans-serif';g.textAlign='left';
 list.forEach((s,k)=>{const y=30+k*8;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(Wv-74,y-6,70,7.5);g.fillStyle=s.col;g.fillRect(Wv-73,y-5,4,5);g.fillStyle=s.out?'#777':'#fff';
  g.fillText((s.name||'').slice(0,12),Wv-67,y);g.textAlign='right';g.fillText(s.alive?s.body.length:'—',Wv-7,y);g.textAlign='left'})}
K=RA.kit({id:'snake',name:'SNAKE PIT',kind:'Snakes',players:'1-20 players',demo:6,
 desc:'Classic grid snake for up to 20 in one pit, top-down with raised walls. Eat, grow, cut rivals off. Snake-only power-ups: venom fang, burrow, rattle, molt, charm, mongoose.',
 blurb:'Steer with WASD, arrows or the mouse, hold click or Space to boost. Eat apples to grow, and make every other snake crash into you.',
 howto:'WASD / arrows steer, or point the mouse where your head should go. Click or Space boosts (costs tail). Gamepad: stick steers, A boosts.',
 icon:['..........','......kkk.','.....kgwgk','.....kgggk','..kkk.kgk.','.kgggkkgk.','kgkkkgggk.','kgk..kkk..','.kgkk.....','..kgk.....'],
 music:MUSIC,fireLabel:'BOOST',
 modes:[['FREE FOR ALL','Every snake for itself.'],['TEAMS','Red vs blue: teammates slide past each other, rivals crash.']],
 settings:[['hit','Body hit',[['die','Crash = out'],['bite','Bite through']]],['boost','Boost',[['on','On'],['off','Off']]],['lives','Lives',[[3,'3'],[1,'1'],[5,'5'],[0,'Endless']]],
  ['len','Time limit',[[3,'3 min'],[2,'2 min'],[5,'5 min'],[0,'None']]],['pow','Power-ups',[['on','Snake items'],['party','Wild party'],['off','Off']]],['arena','Arena',[['random','Random'],['open','Open'],['pillars','Pillars'],['maze','Maze']]]],
 kb:[['W A S D','steer'],['MOUSE','point head'],['LMB SPACE','boost'],['C','chat'],['ESC','menu']],pad:[['LS','steer'],['A','boost'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Hatchling',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Hatchling'},{id:'win1',name:'King Cobra',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:King Cobra'},
  {id:'long',name:'Anaconda',desc:'Grow to 40 long',test:(s,m)=>m.best>=40,unlock:'title:Anaconda'},{id:'ko5',name:'Constrictor',desc:'5 KOs in one match',test:(s,m)=>m.kills>=5,unlock:'title:Constrictor'}],
 alive:i=>!!snakes[i]&&snakes[i].alive&&!snakes[i].out,start,step,follow,snap,apply,render,aim,bot,onFx,teamOf,
 ranks:()=>snakes.slice().sort((a,b)=>(a.out-b.out)||b.best-a.best||b.score-a.score).map(s=>[s.name,s.col,'best '+s.best+' · '+s.kills+' KO']),
 result:(i,w)=>{const s=snakes[i];return{won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),kills:s.kills,best:s.best,bestScore:s.score}}});
window.__sn={get snakes(){return snakes},get food(){return food},K};
})();
