/* MUNCH-MAN for Retro Arena: up to 20 munchers in one big neon maze with the four ghosts (and their friends), 2.5D raised walls.
   WASD / arrows / mouse steer (turns are buffered, so press early like the arcade). Dots, power pellets, fruit, ghost chains 200-1600.
   Modes: BATTLE (most points / last muncher standing), CO-OP (clear mazes together, ghosts speed up each level), CHOMP (a powered Munch-Man
   can also eat rivals). Fruit power-ups made for Munch-Man only:
    CHERRY points · STRAWBERRY speed · ORANGE ghost repellent · APPLE phase through one wall · MELON freeze every rival
    GALAXOID (party) calls a red ghost onto the leader · BELL (party) everyone else's controls swap · KEY (party) warp to a random spot. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const TS=12,DX=[0,1,0,-1],DY=[-1,0,1,0];
const FRUIT=[null,{n:'CHERRY',c:'#f02040'},{n:'STRAWBERRY',c:'#ff4060'},{n:'ORANGE',c:'#ff9020'},{n:'APPLE',c:'#e83030'},{n:'MELON',c:'#40d060'},{n:'GALAXOID',c:'#f8d040',party:1},{n:'BELL',c:'#f8e040',party:1},{n:'KEY',c:'#80d0f8',party:1}];
const GCOL=['#ff2020','#ffb8ff','#20ffff','#ffb850'],GNAME=['SCARLET','ROSY','AQUA','AMBER'];
RA.audio.add('waka',(AC,now,g,ch)=>{const o=AC.createOscillator();o.type='triangle';const up=ch&1;o.frequency.setValueAtTime(up?260:480,now);o.frequency.linearRampToValueAtTime(up?480:260,now+.07);g.gain.setValueAtTime(.08,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);o.start();o.stop(now+.09)});
RA.audio.add('eatg',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(1600,now+.25);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.27);o.connect(g);o.start();o.stop(now+.28)});
RA.audio.add('pdie',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(900,now);o.frequency.exponentialRampToValueAtTime(80,now+.9);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.95);o.connect(g);o.start();o.stop(now+1)});
const MUSIC=[T('Insert Coin',120,['C','Am','F','G'],'k...s...k.k.s...','c5 c6 g5 e5 c6 g5 e5 - c#5 c#6 g#5 f5 c#6 g#5 f5 - c5 c6 g5 e5 c6 g5 e5 - eb5 e5 f5 - f5 f#5 g5 - g5 g#5 a5 - c6 - - -'),
 T('Neon Maze',140,['Am','F','C','G'],'k.hsk.hsk.hsk.hs','a4 . c5 . e5 . a5 . g5 . e5 . c5 . e5 . f4 . a4 . c5 . f5 . e5 . c5 . a4 . c5 . g4 . b4 . d5 . g5 . f5 . d5 . b4 . d5 .'),
 T('Power Pellet',160,['Dm','Bb','C','A'],'k.hhs.hhk.hhs.hk','d5 f5 a5 d6 a5 f5 d5 . bb4 d5 f5 bb5 f5 d5 bb4 . c5 e5 g5 c6 g5 e5 c5 . a4 c#5 e5 a5 e5 c#5 a4 .'),
 T('Last Life',176,['Em','C','D','B'],'k.hsk.hsk.hsk.ss','e5 . g5 . b5 . e6 . d6 . b5 . g5 . b5 . c5 . e5 . g5 . c6 . b5 . a5 . f#5 . d#5 - f#5 - b5 - d#6 -')];
let K,W=29,H=31,wall=new Uint8Array(W*H),dots=new Uint8Array(W*H),pacs=[],ghosts=[],fruit=null,texts=[],level=1,fright=0,chain=0,house={x:14,y:14},left=0,lvlT=0,pause=0;
const at=(x,y)=>y*W+x,inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const wrapX=x=>(x+W*TS)%(W*TS);
/* the maze: a braided random maze on odd cells, mirrored left-right, with a ghost house in the middle and side tunnels */
function buildMaze(n,seed){const rr=RA.util.mulberry(seed),sz=K.S.maze==='auto'?(n<=4?0:n<=10?1:2):+K.S.maze;
 const cw=[7,10,14][sz],ch=[8,11,15][sz];W=cw*4+1;H=ch*2+1;wall=new Uint8Array(W*H).fill(1);dots=new Uint8Array(W*H);
 const half=Math.ceil(W/2),cells=[],seen=new Set(),hw=(half-1)>>1;
 const carve=(x,y)=>{wall[at(x,y)]=0;wall[at(W-1-x,y)]=0};
 const stack=[[1,1]];seen.add('1,1');carve(1,1);
 while(stack.length){const[x,y]=stack[stack.length-1],nb=[];for(let d=0;d<4;d++){const nx=x+DX[d]*2,ny=y+DY[d]*2;if(nx>=1&&ny>=1&&nx<=half-1&&ny<H-1&&!seen.has(nx+','+ny))nb.push([nx,ny,d])}
  if(!nb.length){stack.pop();continue}const[nx,ny,d]=nb[Math.floor(rr()*nb.length)];seen.add(nx+','+ny);carve(x+DX[d],y+DY[d]);carve(nx,ny);stack.push([nx,ny])}
 // braid: knock out most dead ends so it plays like Munch-Man, not a labyrinth
 for(let y=1;y<H-1;y++)for(let x=1;x<half;x++){if(wall[at(x,y)])continue;let open=0;for(let d=0;d<4;d++)if(!wall[at(x+DX[d],y+DY[d])])open++;
  if(open===1){const opts=[];for(let d=0;d<4;d++){const wx=x+DX[d],wy=y+DY[d];if(wall[at(wx,wy)]&&wx>0&&wy>0&&wy<H-1&&wx<W-1)opts.push([wx,wy])}if(opts.length){const[a,b]=opts[Math.floor(rr()*opts.length)];carve(a,b)}}}
 for(let k=0;k<cw*ch/5;k++){const x=1+Math.floor(rr()*(half-2)),y=1+Math.floor(rr()*(H-2));if((x+y)%2===1&&x>1&&y>1&&y<H-2)carve(x,y)}
 // centre column open between halves where the maze needs it
 const cx=W>>1;for(let y=1;y<H-1;y+=2)if(rr()<.5)wall[at(cx,y)]=0;
 // ghost house
 const hy=H>>1;house={x:cx,y:hy};for(let y=hy-2;y<=hy+2;y++)for(let x=cx-4;x<=cx+4;x++)wall[at(x,y)]=(y===hy-2||y===hy+2||x===cx-4||x===cx+4)?1:0;
 wall[at(cx,hy-2)]=2;for(let x=cx-5;x<=cx+5;x++){if(inside(x,hy-3))wall[at(x,hy-3)]=0;if(inside(x,hy+3))wall[at(x,hy+3)]=0}for(let y=hy-3;y<=hy+3;y++){wall[at(cx-5,y)]=0;wall[at(cx+5,y)]=0}
 // tunnels
 for(const ty of[hy-6>2?hy-6:hy,hy+6<H-2?hy+6:hy]){wall[at(0,ty)]=0;wall[at(W-1,ty)]=0;wall[at(1,ty)]=0;wall[at(W-2,ty)]=0}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!wall[at(x,y)]&&!(Math.abs(x-cx)<=5&&Math.abs(y-hy)<=3))dots[at(x,y)]=1;
 for(const[x,y]of[[1,1],[W-2,1],[1,H-2],[W-2,H-2],[1,hy],[W-2,hy]])if(!wall[at(x,y)])dots[at(x,y)]=2;
 left=dots.reduce((a,v)=>a+(v?1:0),0)}
function spawnPos(i,n){const cx=W>>1,spots=[];for(let y=H-2;y>0;y--)for(let x=1;x<W-1;x++)if(!wall[at(x,y)]&&Math.abs(y-house.y)>4)spots.push([x,y]);
 spots.sort((a,b)=>Math.abs(b[1]-house.y)-Math.abs(a[1]-house.y));const k=Math.floor(i*spots.length/Math.max(n,1)*.6+((i*7919)%Math.max(1,spots.length>>3)));const p=spots[Math.min(spots.length-1,k)]||[1,1];return p}
function resetPacs(){pacs.forEach((p,i)=>{if(p.out)return;const[x,y]=spawnPos(i,pacs.length);Object.assign(p,{x:x*TS+6,y:y*TS+6,dir:3,want:3,alive:true,dieT:0,inv:120,speedT:0,repel:0,phase:0,frozen:0,swap:0})})}
function makeGhosts(){const n=Math.min(4+Math.floor(pacs.length/3),12);ghosts=[];for(let k=0;k<n;k++){const t=k%4;ghosts.push({t,x:(house.x-2+(k%4))*TS+6,y:house.y*TS+6,dir:0,mode:'house',hT:60+k*90,eaten:false,tgt:-1})}}
function start(seats,md,S,seed){pacs=seats.map((s,i)=>({i,name:s.name,col:i===0&&md!==1?'#ffe020':s.col,score:0,lives:S.lives,ghostsEaten:0,kills:0,out:false}));
 if(pacs.length>1&&md!==1)pacs.forEach((p,i)=>{p.col=i===0?'#ffe020':seats[i].col});level=1;fright=0;texts=[];fruit=null;lvlT=0;pause=60;
 buildMaze(pacs.length,seed);if(K.isClient())return;resetPacs();makeGhosts()}
/* movement on the tile grid with buffered turns */
const solid=(tx,ty,g)=>{tx=(tx+W)%W;if(ty<0||ty>=H)return true;const v=wall[at(tx,ty)];return v===1||(v===2&&!g)};
function mover(o,sp,isG){const tx=Math.floor(o.x/TS),ty=Math.floor(o.y/TS),cx=tx*TS+6,cy=ty*TS+6;
 const atC=Math.abs(o.x-cx)<=sp/2+.01&&Math.abs(o.y-cy)<=sp/2+.01;
 if(atC){if(o.want!=null&&o.want!==o.dir&&!solid(tx+DX[o.want],ty+DY[o.want],isG)){o.x=cx;o.y=cy;o.dir=o.want}
  if(solid(tx+DX[o.dir],ty+DY[o.dir],isG)&&!(o.phase>0&&!isG&&inside(tx+DX[o.dir]*2,ty+DY[o.dir]*2)&&!wall[at(tx+DX[o.dir]*2,ty+DY[o.dir]*2)])){o.x=cx;o.y=cy;return false}}
 else if(o.want===(o.dir+2)%4)o.dir=o.want;
 o.x=wrapX(o.x+DX[o.dir]*sp);o.y+=DY[o.dir]*sp;
 if(o.phase>0&&!isG){const nx=Math.floor(o.x/TS),ny=Math.floor(o.y/TS);if(wall[at(nx,ny)]===1&&(nx!==tx||ny!==ty)){o.phase=0;o.x=wrapX(o.x+DX[o.dir]*TS);o.y+=DY[o.dir]*TS;say(o,'PHASE!','#e83030')}}
 return true}
function say(o,s,col){texts.push({x:o.x,y:o.y-10,s,col,t:60});K.fx('x',Math.round(o.x),Math.round(o.y-10),s,col)}
function nearestPac(x,y,skip){let b=null,bd=1e9;for(const p of pacs){if(!p.alive||p.out||p===skip)continue;const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;b=p}}return b}
function ghostTarget(g){const S=K.S;if(g.mode==='eyes')return[house.x,house.y-3];if(g.mode==='leave')return[house.x,house.y-3];
 const scatter=lvlT%1800<420&&S.ai!=='aggressive';const corners=[[W-3,-2],[2,-2],[W-1,H],[0,H]];
 const tp=g.tgt>=0&&pacs[g.tgt]&&pacs[g.tgt].alive?pacs[g.tgt]:nearestPac(g.x,g.y);if(!tp||scatter&&g.t<4)return corners[g.t];
 const px=Math.floor(tp.x/TS),py=Math.floor(tp.y/TS);if(tp.repel>0)return[2*Math.floor(g.x/TS)-px,2*Math.floor(g.y/TS)-py];
 if(S.ai==='dumb'&&Math.random()<.5)return[Math.floor(Math.random()*W),Math.floor(Math.random()*H)];
 if(g.t===0)return[px,py];if(g.t===1)return[px+DX[tp.dir]*4,py+DY[tp.dir]*4];
 if(g.t===2){const b=ghosts.find(o=>o.t===0)||g;const ax=px+DX[tp.dir]*2,ay=py+DY[tp.dir]*2;return[2*ax-Math.floor(b.x/TS),2*ay-Math.floor(b.y/TS)]}
 return Math.hypot(px-g.x/TS,py-g.y/TS)>8?[px,py]:corners[3]}
function stepGhost(g){if(g.mode==='house'){g.y=house.y*TS+6+Math.sin(K.tick*.12+g.t)*3;if(--g.hT<=0){g.mode='leave';g.x=house.x*TS+6;g.y=house.y*TS+6}return}
 const fr=fright>0&&!g.eaten&&g.mode!=='eyes',sp=g.mode==='eyes'?2.4:fr?.6:Math.min(1.25,.82+level*.05)*(K.S.ai==='aggressive'?1.1:1);
 const tx=Math.floor(g.x/TS),ty=Math.floor(g.y/TS),cx=tx*TS+6,cy=ty*TS+6;
 if(Math.abs(g.x-cx)<=sp/2+.01&&Math.abs(g.y-cy)<=sp/2+.01&&g.lc!==tx+ty*999){g.lc=tx+ty*999;g.x=cx;g.y=cy;
  if(g.mode==='leave'&&ty<=house.y-3){g.mode='chase'}
  if(g.mode==='eyes'&&Math.abs(tx-house.x)<=1&&Math.abs(ty-(house.y-3))<=1){g.mode='house';g.hT=60;g.eaten=false;g.x=house.x*TS+6;g.y=house.y*TS+6;return}
  const[gx,gy]=ghostTarget(g),through=g.mode==='leave'||g.mode==='eyes';let best=-1,bd=1e9;
  for(const d of[0,3,2,1]){if(d===(g.dir+2)%4&&g.mode!=='leave')continue;if(solid(tx+DX[d],ty+DY[d],through))continue;
   const dd=fr?Math.random():Math.hypot(tx+DX[d]-gx,ty+DY[d]-gy);if(dd<bd){bd=dd;best=d}}
  if(best<0)best=(g.dir+2)%4;g.dir=best}
 g.x=wrapX(g.x+DX[g.dir]*sp);g.y+=DY[g.dir]*sp}
function killPac(p,by){if(!p.alive||p.inv>0)return;p.alive=false;p.dieT=90;sfx('pdie');K.fx('d',p.i);if(by&&by!==p){by.kills++;by.score+=1000;say(by,'1000','#fff')}
 if(K.S.lives>0){p.lives--;if(p.lives<=0)p.out=true}}
function eatAt(p){const tx=((Math.floor(p.x/TS))%W+W)%W,ty=Math.floor(p.y/TS);if(!inside(tx,ty))return;const v=dots[at(tx,ty)];if(!v)return;dots[at(tx,ty)]=0;left--;
 if(v===1){p.score+=10;if(!K.demo&&p===pacs[K.focus()[0]])sfx('waka',K.tick)}else{p.score+=50;fright=Math.max(120,420-level*30);chain=0;p.power=fright;K.track(2);for(const g of ghosts)if(g.mode==='chase')g.dir=(g.dir+2)%4,g.lc=-1}}
function useFruit(p,k){say(p,FRUIT[k].n,FRUIT[k].c);sfx('pick');p.score+=[0,100,300,500,700,1000,2000,3000,5000][k];
 if(k===2)p.speedT=480;else if(k===3)p.repel=480;else if(k===4)p.phase=1;else if(k===5){for(const o of pacs)if(o!==p&&o.alive)o.frozen=150}
 else if(k===6){const lead=pacs.filter(o=>o!==p&&o.alive).sort((a,b)=>b.score-a.score)[0];if(lead){ghosts.push({t:0,x:house.x*TS+6,y:(house.y-3)*TS+6,dir:0,mode:'chase',hT:0,tgt:lead.i,extra:600});say(lead,'HUNTED!','#ff2020')}}
 else if(k===7){for(const o of pacs)if(o!==p&&o.alive)o.swap=420}else if(k===8){const sp=spawnPos(Math.floor(Math.random()*20),20);p.x=sp[0]*TS+6;p.y=sp[1]*TS+6}}
function step(){const S=K.S;if(pause>0){pause--;return}lvlT++;if(fright>0&&--fright===0)K.track(1);
 for(const p of pacs){const s=K.seats[p.i];if(K.hostOnline()&&s.ctrl==='net'&&!K.R.peer(s.peer)){p.out=true;p.alive=false}if(p.out)continue;
  if(!p.alive){if(--p.dieT<=0&&!p.out){const[x,y]=spawnPos(p.i,pacs.length);Object.assign(p,{x:x*TS+6,y:y*TS+6,alive:true,inv:150,dir:3,want:3})}continue}
  if(p.inv>0)p.inv--;if(p.speedT>0)p.speedT--;if(p.repel>0)p.repel--;if(p.swap>0)p.swap--;if(p.power>0)p.power--;
  const inp=K.inp(p.i);let d=-1;if(inp.up)d=0;else if(inp.right)d=1;else if(inp.down)d=2;else if(inp.left)d=3;
  if(d>=0&&p.swap>0)d=(d+2)%4;if(d>=0)p.want=d;
  if(p.frozen>0){p.frozen--;continue}
  const sp=(p.speedT>0?1.55:1.15)+Math.min(.2,level*.02);if(mover(p,sp,false))p.anim=(p.anim||0)+1;eatAt(p);
  if(fruit&&Math.hypot(fruit.x-p.x,fruit.y-p.y)<8){useFruit(p,fruit.k);fruit=null}}
 for(const g of ghosts){stepGhost(g);if(g.extra&&--g.extra<=0)g.gone=true}ghosts=ghosts.filter(g=>!g.gone);
 // collisions
 for(const p of pacs){if(!p.alive)continue;for(const g of ghosts){if(g.mode==='house'||g.mode==='eyes')continue;if(Math.hypot(g.x-p.x,g.y-p.y)>8)continue;
   if(fright>0&&!g.eaten){g.mode='eyes';g.eaten=true;chain++;const pts=200*Math.pow(2,Math.min(3,chain-1));p.score+=pts;p.ghostsEaten++;say(p,String(pts),'#20ffff');sfx('eatg');K.fx('g')}
   else killPac(p,null)}}
 if(K.mode===2)for(const p of pacs){if(!p.alive||!(p.power>0))continue;for(const o of pacs){if(o===p||!o.alive||o.power>0)continue;if(Math.hypot(o.x-p.x,o.y-p.y)<8)killPac(o,p)}}
 // fruit
 if(!fruit&&S.fruit!=='off'&&lvlT%900===450){const pool=[1,2,3,4,5];if(S.fruit==='party')pool.push(6,7,8,6,7,8);const k=pool[Math.floor(Math.random()*pool.length)];fruit={k,x:house.x*TS+6,y:(house.y+3)*TS+6,t:600}}
 if(fruit&&--fruit.t<=0)fruit=null;
 for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);
 // level clear: new maze, ghosts get faster
 if(left<=0){level++;lvlT=0;pause=90;buildMaze(pacs.length,K.seed+level*101);resetPacs();makeGhosts();fright=0;K.fx('l',level);for(const p of pacs)if(!p.out)p.score+=500}
 const live=pacs.filter(p=>!p.out),lim=S.len*3600;
 if(K.mode===1){if(!live.length){K.end({coop:0,name:'GAME OVER · LEVEL '+level});return}if(level>S.levels){K.end({coop:1,name:'ALL MAZES CLEARED!'});return}}
 else if(S.lives>0&&(pacs.length>1?live.length<=1:!live.length)){K.end(live[0]?{i:live[0].i}:null);return}
 if(lim&&K.tick>=lim){if(K.mode===1)K.end({coop:1,name:'TIME! LEVEL '+level});else{const b=pacs.slice().sort((a,c)=>c.score-a.score)[0];K.end(b?{i:b.i}:null)}}
 if(lim&&K.tick===lim-1800)K.track(3)}
/* CPU munchers: head for the nearest dot, flee ghosts, chase blue ones */
function bot(i){const p=pacs[i];if(!p||!p.alive)return{};const tx=((Math.floor(p.x/TS))%W+W)%W,ty=Math.floor(p.y/TS);const o={};
 const danger=ghosts.filter(g=>g.mode!=='house'&&g.mode!=='eyes'&&!(fright>0&&!g.eaten)&&Math.hypot(g.x-p.x,g.y-p.y)<TS*5);
 const blue=fright>40?ghosts.filter(g=>g.mode==='chase'&&!g.eaten&&Math.hypot(g.x-p.x,g.y-p.y)<TS*8):[];
 let best=-1,bv=-1e9;for(let d=0;d<4;d++){if(solid(tx+DX[d],ty+DY[d],false))continue;const nx=tx+DX[d],ny=ty+DY[d];let v=Math.random()*(K.cpu===0?8:2);
  if(d===(p.dir+2)%4)v-=3;for(const g of danger)v-=200/(1+Math.hypot(g.x/TS-nx,g.y/TS-ny));for(const g of blue)v+=60/(1+Math.hypot(g.x/TS-nx,g.y/TS-ny));
  // look along this way for dots
  let x=nx,y=ny,k=0;for(;k<8&&!solid(x,y,false);k++){if(dots[at((x+W)%W,y)]){v+=12-k;break}x+=DX[d];y+=DY[d]}
  if(fruit)v+=30/(1+Math.hypot(fruit.x/TS-nx,fruit.y/TS-ny));if(v>bv){bv=v;best=d}}
 if(best>=0)o[['up','right','down','left'][best]]=true;
 if(!danger.length&&best>=0&&bv<1&&Math.random()<.02){let near=null,nd=1e9;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(dots[at(x,y)]){const d=Math.abs(x-tx)+Math.abs(y-ty);if(d<nd){nd=d;near=[x,y]}}
  if(near){delete o.up;delete o.down;delete o.left;delete o.right;o[Math.abs(near[0]-tx)>Math.abs(near[1]-ty)?(near[0]>tx?'right':'left'):(near[1]>ty?'down':'up')]=true}}
 return o}
/* online */
function snap(){let s='';for(let i=0;i<W*H;i+=2){s+=(dots[i]|((dots[i+1]||0)<<2)).toString(16)}
 return{W,H,lv:level,fr:fright,ps:pause,d:s,
  p:pacs.map(p=>[Math.round(p.x*2),Math.round(p.y*2),p.dir,(p.alive?1:0)|(p.inv>0?2:0)|(p.speedT>0?4:0)|(p.repel>0?8:0)|(p.frozen>0?16:0)|(p.swap>0?32:0)|(p.power>0?64:0)|(p.out?128:0),p.score,p.lives,p.kills]),
  g:ghosts.map(g=>[Math.round(g.x*2),Math.round(g.y*2),g.dir,g.t,['house','leave','chase','eyes'].indexOf(g.mode),g.eaten?1:0,g.extra?1:0]),f:fruit?[Math.round(fruit.x),Math.round(fruit.y),fruit.k]:0}}
let mazeKey='';
function apply(g){level=g.lv|0;fright=g.fr|0;pause=g.ps|0;const key=g.W+'x'+g.H+':'+level;if(key!==mazeKey){mazeKey=key;buildMaze(pacs.length,K.seed+(level>1?level*101:0))}
 const s=String(g.d||'');for(let q=0;q<s.length;q++){const v=parseInt(s[q],16);if(q*2<W*H)dots[q*2]=v&3;if(q*2+1<W*H)dots[q*2+1]=(v>>2)&3}
 (g.p||[]).forEach((a,i)=>{const p=pacs[i];if(!p)return;p.tx=a[0]/2;p.ty=a[1]/2;if(p.x==null||Math.abs(p.tx-p.x)>30||Math.abs(p.ty-p.y)>30){p.x=p.tx;p.y=p.ty}const was=p.alive;p.dir=a[2];const f=a[3]|0;
  p.alive=!!(f&1);p.inv=f&2?1:0;p.speedT=f&4;p.repel=f&8;p.frozen=f&16;p.swap=f&32;p.power=f&64;p.out=!!(f&128);p.score=a[4]|0;p.lives=a[5]|0;p.kills=a[6]|0;if(was&&!p.alive)p.dieA=0});
 const old=ghosts;ghosts=(g.g||[]).map((a,k)=>{const o=old[k]||{};const x=a[0]/2,y=a[1]/2;return{x:o.x!=null&&Math.abs(o.x-x)<30?o.x:x,y:o.y!=null&&Math.abs(o.y-y)<30?o.y:y,tx:x,ty:y,dir:a[2],t:a[3],mode:['house','leave','chase','eyes'][a[4]]||'chase',eaten:!!a[5],extra:a[6]}});
 fruit=g.f?{x:g.f[0],y:g.f[1],k:g.f[2]}:null}
function follow(){for(const o of[...pacs,...ghosts]){if(o.tx==null)continue;let dx=o.tx-o.x;if(Math.abs(dx)>W*TS/2)o.x=o.tx;else o.x+=dx*.45;o.y+=(o.ty-o.y)*.45;if(o.anim!=null||o.score!=null)o.anim=(o.anim||0)+1}for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0)}
function onFx(k,a){if(k==='x')texts.push({x:a[0],y:a[1],s:String(a[2]).slice(0,14),col:a[3],t:60});else if(k==='d')sfx('pdie');else if(k==='g')sfx('eatg')}
/* drawing */
const cam={x:0,y:0,z:1};
function camFor(Wv,Hv){const fs=K.focus().map(i=>pacs[i]).filter(p=>p&&p.alive);const ww=W*TS,hh=H*TS;let z=Math.min(Wv/(ww+16),Hv/(hh+30)),tx=ww/2,ty=hh/2;
 if(fs.length===1&&!K.demo&&z<1.5){z=1.5;tx=fs[0].x;ty=fs[0].y}cam.z+=(z-cam.z)*.1;const vw=Wv/cam.z,vh=Hv/cam.z,cl=(v,size,view)=>size+16<=view?(size-view)/2:Math.max(-8,Math.min(size-view+8,v));
 cam.x+=(cl(tx-vw/2,ww,vw)-cam.x)*.15;cam.y+=(cl(ty-vh/2,hh,vh)-cam.y)*.15}
let wallC=null,wallSig='';
function buildWalls(){const sig=W+'x'+H+':'+level+':'+K.seed;if(sig===wallSig)return;wallSig=sig;wallC=document.createElement('canvas');const Q=3;wallC.width=W*TS*Q;wallC.height=(H*TS+6)*Q;const g=wallC.getContext('2d');g.scale(Q,Q);
 const hue=[220,280,170,330,30,120][(level-1)%6],side=`hsl(${hue},70%,22%)`,top=`hsl(${hue},80%,45%)`,rim=`hsl(${hue},100%,75%)`;
 // thin neon bars: a core per wall tile plus arms to its wall neighbours, raised with a dark side (2.5D)
 const I=3.2,isW=(x,y)=>inside(x,y)&&wall[at(x,y)]===1;
 const bar=(x,y,dy,fill)=>{g.fillStyle=fill;const X=x*TS,Y=y*TS+dy;g.fillRect(X+I,Y+I,TS-2*I,TS-2*I);
  if(isW(x+1,y))g.fillRect(X+TS-I-.1,Y+I,I+.2,TS-2*I);if(isW(x-1,y))g.fillRect(X-.1,Y+I,I+.2,TS-2*I);if(isW(x,y+1))g.fillRect(X+I,Y+TS-I-.1,TS-2*I,I+.2);if(isW(x,y-1))g.fillRect(X+I,Y-.1,TS-2*I,I+.2)};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(wall[at(x,y)]===1)bar(x,y,2.5,side);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=wall[at(x,y)];if(v===2){g.fillStyle='#ffb8de';g.fillRect(x*TS,y*TS+4.5,TS,2);continue}if(v===1)bar(x,y,0,top)}
 g.globalCompositeOperation='lighter';g.globalAlpha=.35;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(wall[at(x,y)]===1){g.fillStyle=rim;g.fillRect(x*TS+I,y*TS+I,TS-2*I,1)}g.globalAlpha=1;g.globalCompositeOperation='source-over';
 wallC._lvl=hue}
function drawPac(g,p){if(!p.alive){if(p.dieA==null)return;p.dieA=Math.min(1,(p.dieA||0)+.02);const a=p.dieA*Math.PI;g.fillStyle=p.col;g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,5.5,-Math.PI/2+a,-Math.PI/2-a+Math.PI*2);g.fill();return}
 if(p.inv>0&&(K.tick>>2)&1)return;const m=Math.abs(Math.sin((p.anim||0)*.25))*.8+.05,ang=[-Math.PI/2,0,Math.PI/2,Math.PI][p.dir],r=p.power>0?6.6:5.6;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(p.x+1,p.y+5,5,2,0,0,7);g.fill();
 const gr=g.createRadialGradient(p.x-2,p.y-3,.5,p.x,p.y,r+1);gr.addColorStop(0,'#ffffff');gr.addColorStop(.3,p.col);gr.addColorStop(1,RA.util.mix(p.col,'#000000',.5));g.fillStyle=gr;
 g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,r,ang+m,ang-m+Math.PI*2);g.closePath();g.fill();
 g.fillStyle='#000';const ex=p.x+Math.cos(ang-1.2)*r*.5,ey=p.y+Math.sin(ang-1.2)*r*.5;g.beginPath();g.arc(ex,ey,.9,0,7);g.fill();
 if(p.frozen){g.fillStyle='rgba(160,220,255,.5)';g.beginPath();g.arc(p.x,p.y,r+2,0,7);g.fill()}if(p.repel){g.strokeStyle='rgba(255,150,40,.7)';g.beginPath();g.arc(p.x,p.y,r+3+Math.sin(K.tick*.2),0,7);g.stroke()}
}
function drawGhost(g,o){const x=o.x,y=o.y,fr=fright>0&&!o.eaten&&o.mode!=='eyes';
 if(o.mode!=='eyes'){const col=fr?(fright<120&&(K.tick>>3)&1?'#ffffff':'#2030ff'):GCOL[o.t];g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x+1,y+6,5,2,0,0,7);g.fill();
  const gr=g.createRadialGradient(x-2,y-4,.5,x,y-1,8);gr.addColorStop(0,'#fff');gr.addColorStop(.3,col);gr.addColorStop(1,RA.util.mix(col,'#000000',.45));g.fillStyle=gr;
  g.beginPath();g.arc(x,y-1,5.6,Math.PI,0);g.lineTo(x+5.6,y+5);const w=(K.tick>>3)&1;for(let k=0;k<4;k++){const sx=x+5.6-k*2.8;g.lineTo(sx-1.4,y+(w^(k&1)?3.4:5))}g.lineTo(x-5.6,y+5);g.closePath();g.fill();
  if(o.extra){g.strokeStyle='#f8d040';g.lineWidth=.8;g.stroke()}}
 if(fr){g.fillStyle='#ffd0c0';g.fillRect(x-3,y-2,1.5,1.5);g.fillRect(x+1.5,y-2,1.5,1.5);return}
 for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(x+s*2.4,y-2,1.9,2.3,0,0,7);g.fill();g.fillStyle='#1830d0';g.beginPath();g.arc(x+s*2.4+DX[o.dir]*.9,y-2+DY[o.dir]*.9,1,0,7);g.fill()}}
function drawFruit(g,f){const x=f.x,y=f.y+Math.sin(K.tick*.1)*1,it=FRUIT[f.k];g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+6,4,1.6,0,0,7);g.fill();
 const gr=g.createRadialGradient(x-1.5,y-2,.5,x,y,6);gr.addColorStop(0,'#fff');gr.addColorStop(.35,it.c);gr.addColorStop(1,RA.util.mix(it.c,'#000000',.5));g.fillStyle=gr;
 if(f.k===1){g.beginPath();g.arc(x-2,y+1,3,0,7);g.arc(x+2.5,y+2,3,0,7);g.fill();g.strokeStyle='#40a020';g.lineWidth=.8;g.beginPath();g.moveTo(x-2,y-2);g.lineTo(x+1,y-6);g.lineTo(x+2.5,y-1);g.stroke()}
 else if(f.k===8){g.fillRect(x-1,y-5,2,9);g.beginPath();g.arc(x,y-5,3,0,7);g.fill()}
 else if(f.k===7){g.beginPath();g.moveTo(x-5,y+4);g.quadraticCurveTo(x-4,y-6,x,y-6);g.quadraticCurveTo(x+4,y-6,x+5,y+4);g.closePath();g.fill()}
 else if(f.k===6){g.beginPath();g.moveTo(x,y-5);g.lineTo(x+5,y+3);g.lineTo(x,y+1);g.lineTo(x-5,y+3);g.closePath();g.fill()}
 else{g.beginPath();g.arc(x,y,4.6,0,7);g.fill();g.fillStyle='#40a020';g.fillRect(x-.5,y-6.5,1.4,2.6)}}
function render(g,Wv,Hv){camFor(Wv,Hv);buildWalls();
 g.fillStyle='#000006';g.fillRect(0,0,Wv,Hv);
 g.save();g.setTransform(cam.z,0,0,cam.z,-cam.x*cam.z,-cam.y*cam.z);g.imageSmoothingEnabled=true;
 const fl=g.createRadialGradient(W*TS/2,H*TS/2,10,W*TS/2,H*TS/2,W*TS*.7);fl.addColorStop(0,'#0c0c24');fl.addColorStop(1,'#020208');g.fillStyle=fl;g.fillRect(0,0,W*TS,H*TS);
 // dots
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=dots[at(x,y)];if(!v)continue;const X=x*TS+6,Y=y*TS+6;
  if(v===1){g.fillStyle='#ffd8b8';g.fillRect(X-1.1,Y-1.1,2.2,2.2)}else if((K.tick>>4)&1||fright){const gr=g.createRadialGradient(X-1,Y-1,.3,X,Y,4);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#ffb090');g.fillStyle=gr;g.beginPath();g.arc(X,Y,3.6,0,7);g.fill()}}
 if(fruit)drawFruit(g,fruit);
 for(const o of ghosts)drawGhost(g,o);for(const p of pacs)drawPac(g,p);
 g.drawImage(wallC,0,0,W*TS,H*TS+6);
 if(pacs.length>1)for(const p of pacs)if(p.alive&&!(p.inv>0&&(K.tick>>2)&1))RA.gfx.text(g,p.name,p.x,p.y-20,p.col);
 for(const t of texts)RA.gfx.text(g,t.s,t.x,t.y,t.col);
 g.restore();
 g.font='7px "Russo One",sans-serif';g.textAlign='center';g.fillStyle='#fff';if(!K.demo){g.fillText((K.mode===1?'CO-OP · ':'')+'LEVEL '+level+'  ·  DOTS '+left,Wv/2,Hv-34);if(pause>0)g.fillText(level>1?'LEVEL '+level+'!':'READY!',Wv/2,Hv/2)}
 const list=pacs.slice().sort((a,b)=>b.score-a.score).slice(0,8);g.font='6px "Russo One",sans-serif';
 list.forEach((p,k)=>{const y=30+k*8;g.textAlign='left';g.fillStyle='rgba(0,0,0,.6)';g.fillRect(Wv-86,y-6,82,7.5);g.fillStyle=p.col;g.fillRect(Wv-85,y-5,4,5);g.fillStyle=p.out?'#777':'#fff';
  g.fillText((p.name||'').slice(0,10)+(K.S.lives>0?' '+'●'.repeat(Math.max(0,Math.min(5,p.lives))):''),Wv-79,y);g.textAlign='right';g.fillText(p.score,Wv-7,y)})}
K=RA.kit({id:'pacman',name:'MUNCH-MAN',kind:'Maze chase',players:'1-20 players',demo:4,
 desc:'Up to 20 munchers in one big neon maze with the ghosts and their friends. Battle for points, clear mazes together in co-op, or Chomp rivals when powered. Munch-Man-only fruit power-ups.',
 blurb:'Steer with WASD or the arrows. Eat every dot, grab power pellets and chain the ghosts, and keep an eye out for fruit.',
 howto:'WASD / arrows steer (turns are buffered: press early), Gamepad: stick steers.',
 icon:['...kkkk...','..kyyyyk..','.kyyyykk..','kyyyykk...','kyyyk.....','kyyyk.....','kyyyykk...','.kyyyykk..','..kyyyyk..','...kkkk...'],
 music:MUSIC,fireLabel:'·',
 modes:[['BATTLE','Most points wins. Ghosts catch everyone.'],['CO-OP','Clear mazes together. Share your lives wisely.'],['CHOMP','A powered Munch-Man can eat rivals too.']],
 settings:[['lives','Lives',[[3,'3'],[1,'1'],[5,'5'],[0,'Endless']]],['len','Time limit',[[3,'3 min'],[2,'2 min'],[5,'5 min'],[0,'None']]],['maze','Maze',[['auto','Auto'],[0,'Small'],[1,'Medium'],[2,'Large']]],
  ['ai','Ghost AI',[['classic','Classic'],['aggressive','Aggressive'],['dumb','Dumb']]],['fruit','Fruit',[['on','Maze fruit'],['party','Wild party'],['off','Off']]],['levels','Co-op mazes',[[3,'3'],[5,'5'],[1,'1']]]],
 kb:[['W A S D','steer'],['C','chat'],['ESC','menu']],pad:[['LS','steer'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Wakka Wakka',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Wakka'},{id:'win1',name:'Top Muncher',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Top Muncher'},
  {id:'g4',name:'Ghostbuster',desc:'Eat 8 ghosts in one match',test:(s,m)=>m.ghosts>=8,unlock:'title:Ghostbuster'},{id:'pts',name:'High Score',desc:'Score 10,000 in one match',test:(s,m)=>m.bestScore>=10000,unlock:'title:High Score'}],
 alive:i=>!!pacs[i]&&pacs[i].alive&&!pacs[i].out,out:i=>!pacs[i]||pacs[i].out,start,step,follow,snap,apply,render,bot,onFx,
 teamOf:i=>K.mode===1?0:i,
 ranks:()=>pacs.slice().sort((a,b)=>(K.winner&&K.winner.i===b.i?1:0)-(K.winner&&K.winner.i===a.i?1:0)||b.score-a.score).map(p=>[p.name,p.col,p.score+' pts · '+p.ghostsEaten+' ghosts']),
 result:(i,w)=>{const p=pacs[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.i===i),ghosts:p.ghostsEaten,kills:p.kills,bestScore:p.score}}});
window.__pm={get pacs(){return pacs},get ghosts(){return ghosts},K,bot};
})();
