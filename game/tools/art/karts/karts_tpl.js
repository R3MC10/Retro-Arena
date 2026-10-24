/* TURBO KARTS for Retro Arena: kart racing for up to 20 in pixel art, with a Mode 7 chase camera like the 16-bit kart games.
   Everything is drawn on a 320x180 pixel screen (RA.pix): the track is a hand-patterned Mode 7 floor (curbs, mowed grass,
   chevron boost pads), karts are hand-drawn sprites seen from 8 directions with rolling treads, and the scenery and HUD
   are pixel art too. Local players get split screen (up to 4 views).
   Karts accelerate on their own: S brakes / reverses, A / D steer, Shift or E (right-click) hops into a drift:
   hold it through a bend until the sparks turn blue, then orange, and let go for a mini-turbo. Space or click uses your item,
   hold S while using it to throw it backwards. Hold W (touch: fire) just as the lights go green for a rocket start.
   Hitting a wall turns you along it instead of stopping you dead, and the arrow signs warn you of every sharp bend.
   Modes: RACE · TEAM RACE (red vs blue, points by finish place) · BALLOON BATTLE · TEAM BATTLE (arena, 3 balloons, star bumps steal one).
   Items come from ? boxes and depend on your place (the back of the pack gets the strong ones):
    BOOST · TRIPLE BOOST · OIL SLICK · BOUNCER (bounces off walls) · ROCKET (homes on the kart ahead) · SHIELD · STAR
    party: INK (blots the screens of everyone ahead) · SHRINK (everyone ahead shrinks and slows down).
   Online is lag-free (RA.kit localFirst): your kart, your drifting, your box pickups and the oil you run over all happen
   on your device at once. The host referees the shared things (boxes, rockets, bouncers, laps and places) and sends
   hits to the kart they hit, which checks its own shield and star.
   The sprites are painted in tools/art/karts (python), exported as ART below; edit karts_tpl.js there and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
/*ART*/
const T=RA.music.track,sfx=RA.audio.sfx;
const TS=1024,RW=32,CD=210;                       // texture / world size, road half width, countdown steps
const ROAD=0,CURB=1,OFF=2,WALL=3,PAD=4;
const TEAMC=['#f04848','#4890f8'],TEAMN=['Red team','Blue team'];
const ITEMS=[null,{n:'BOOST',c:'#ff9030',ic:'boost'},{n:'TRIPLE BOOST',c:'#ff6020',cnt:3,ic:'triple'},{n:'OIL SLICK',c:'#303040',ic:'oil'},{n:'BOUNCER',c:'#30d050',ic:'bouncer'},
 {n:'ROCKET',c:'#f04040',ic:'rocket'},{n:'SHIELD',c:'#60c0ff',ic:'shield'},{n:'STAR',c:'#f8e040',ic:'star'},{n:'INK',c:'#6040a0',party:1,ic:'ink'},{n:'SHRINK',c:'#e060e0',party:1,ic:'shrink'}];
// the camera: focal length (px at 171 px tall), eye height, distance behind the kart, horizon (share of the view)
const CAM={F:120,H:24,D:31,hor:.33};
RA.audio.add('boost',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(900,now+.35);
 g.gain.setValueAtTime(.09,now);g.gain.exponentialRampToValueAtTime(.001,now+.4);o.connect(g);o.start(now);o.stop(now+.42)});
RA.audio.add('spin',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(700,now);o.frequency.exponentialRampToValueAtTime(90,now+.5);
 g.gain.setValueAtTime(.07,now);g.gain.exponentialRampToValueAtTime(.001,now+.55);o.connect(g);o.start(now);o.stop(now+.56)});
RA.audio.add('box',(AC,now,g)=>{[880,1320,1760].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='triangle';o.frequency.value=f;
 q.gain.setValueAtTime(0,now+k*.05);q.gain.linearRampToValueAtTime(.08,now+k*.05+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.05+.12);o.connect(q);q.connect(g);o.start(now+k*.05);o.stop(now+k*.05+.13)});g.gain.value=1});
const MUSIC=[T('Paddock',112,['C','Am','F','G'],'k...s...k.k.s...','e5 - g5 c6 - g5 e5 - f5 - a5 c6 - a5 f5 - d5 - g5 b5 - g5 d5 - g5 - b5 d6 - - - -'),
 T('Green Flag',152,['G','D','Em','C'],'k.hsk.hsk.hsk.hs','g5 . b5 . d6 . b5 . a5 . f#5 . d5 . f#5 . e5 . g5 . b5 . e6 . c6 . g5 . e5 . c5 .'),
 T('Dune Drift',140,['Am','G','F','E'],'k..hs.h.k.khs.h.','a4 c5 e5 a5 . e5 c5 . g4 b4 d5 g5 . d5 b4 . f4 a4 c5 f5 . c5 a4 . e4 g#4 b4 e5 - - - -'),
 T('Ice Hairpin',160,['Dm','Bb','F','C'],'k.h.s.h.k.h.s.hh','d6 . a5 . f5 . a5 . bb5 . f5 . d5 . f5 . c6 . a5 . f5 . a5 . c6 . g5 . e5 . g5 .'),
 T('Neon Nights',128,['Em','C','D','B'],'k.hhs.hhk.hhs.hk','e5 - b5 - e6 - b5 - c6 - g5 - e5 - g5 - d6 - a5 - f#5 - a5 - b5 - f#5 - d#5 - b4 -'),
 T('Balloon Pop',168,['F','C','Dm','Bb'],'kshskshskshskshs','f5 a5 c6 a5 f5 a5 c6 f6 e6 c6 g5 c6 e6 g6 e6 c6 d6 a5 f5 a5 d6 f6 d6 a5 bb5 d6 f6 d6 bb5 f5 d5 f5')];
RA.audio.add('hop',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(220,now);o.frequency.exponentialRampToValueAtTime(440,now+.06);
 g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);o.connect(g);o.start(now);o.stop(now+.1)});
RA.audio.add('bump',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.value=380;s.connect(f);f.connect(g);g.gain.setValueAtTime(.35,now);g.gain.exponentialRampToValueAtTime(.001,now+.15);s.start(now);s.stop(now+.16)});
// every colour is a fixed palette entry: road + specks, centre/edge line, curb blocks, mowed off-road stripes + flowers,
// tyre barrier, far ground, and the horizon haze
const THEMES={
 sunny:{sky:['#3060d0','#4880e8','#6ca4f4','#a0ccf8'],hz:'#c8e4f8',road:'#686474',sp:['#7a7686','#58546a'],line:'#e8e4dc',curb:['#d82838','#f0ece4'],
  off:['#5cb444','#50a43c'],dot:['#f0c020','#ffffff'],bar:['#2c2638','#e8e4dc'],far:['#4c9c38','#46922f'],props:[['tree','tree','tree','tires'],'tires'],mus:1},
 dune:{sky:['#d05424','#e47434','#f09c4c','#f8cc84'],hz:'#f8e0b0',road:'#86583c',sp:['#966a4a','#744a30'],line:'#f8e8c0',curb:['#e06818','#f8ecd0'],
  off:['#e8c078','#dcb46c'],dot:['#c49058','#b07038'],bar:['#5a3a20','#f8ecd0'],far:['#e4bc74','#d8ac64'],props:[['cactus','cactus','rock'],'rock'],mus:2},
 frost:{sky:['#3c64b0','#5884cc','#80a8e0','#b8d4f4'],hz:'#e8f0fc',road:'#7c8cac',sp:['#8e9ebe','#6c7c9c'],line:'#ffffff',curb:['#2c68d8','#f8f8f8'],
  off:['#eef4fc','#e0eaf8'],dot:['#b8c8e8','#a8bce0'],bar:['#2c2638','#2c68d8'],far:['#f4f8ff','#e6eef9'],props:[['pine','pine','pine','snowman'],'tires'],ice:1,mus:3},
 neon:{sky:['#06030f','#0e0624','#1a0c3a','#2c1458'],hz:'#4a2080',road:'#2a2644',sp:['#383254','#201c38'],line:'#c860ff',curb:['#ff40c0','#40e8ff'],
  off:['#181230','#1e1638'],dot:['#3a2a68','#4a3088'],bar:['#100c18','#ff40c0'],far:['#100c1e','#16122a'],props:[['lamp'],'cone'],night:1,mus:4}};
const TRACKS=[
 {n:'SUNNY CIRCUIT',th:'sunny',pts:[[200,180],[520,140],[820,190],[880,420],[700,520],[760,760],[600,880],[300,860],[160,640],[300,470],[160,330]]},
 {n:'DUNE CANYON',th:'dune',pts:[[150,500],[220,200],[450,150],[560,330],[700,160],[880,260],[860,560],[650,600],[860,800],[560,900],[280,820]]},
 {n:'FROSTY PEAKS',th:'frost',pts:[[200,220],[800,220],[850,370],[420,390],[400,510],[800,530],[830,790],[220,810],[150,500]]},
 {n:'NEON CITY',th:'neon',pts:[[150,140],[620,140],[660,380],[880,420],[880,880],[540,880],[500,640],[300,640],[180,880],[110,520]]}];
let musOn=false,lastHF=0,K,karts=[],boxes=[],oils=[],proj=[],parts=[],texts=[],MAP=null,BAT=false,finN=0,firstFin=0,nextId=1,trackNo=0;
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a)),fwd=a=>[-Math.sin(a),Math.cos(a)];
const teamOf=i=>K.mode===1||K.mode===3?i%2:i,sameTeam=(a,b)=>a!==b&&teamOf(a)===teamOf(b);
const owned=p=>K.seats[p.i]&&K.seats[p.i].ctrl!=='net'&&!K.isClient()||K.isClient()&&p.i===K.myIdx;

/* ---------- track building: spline → distance field → texture, surfaces, props, boxes (cached per track) ---------- */
const BUILT={};
function spline(pts){const n=pts.length,fine=[];
 for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
  for(let t=0;t<1;t+=.01){const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);fine.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])])}}
 const out=[];let acc=0;out.push({x:fine[0][0],z:fine[0][1]});
 for(let i=1;i<=fine.length;i++){const a=fine[i-1],b=fine[i%fine.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=d;
  while(acc>=4){acc-=4;const k=1-acc/d;out.push({x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k})}}
 if(out.length>1&&Math.hypot(out[0].x-out[out.length-1].x,out[0].z-out[out.length-1].z)<2)out.pop();
 out.forEach((p,i)=>{const q=out[(i+1)%out.length],r=out[(i-1+out.length)%out.length],tx=q.x-r.x,tz=q.z-r.z,l=Math.hypot(tx,tz)||1;p.tx=tx/l;p.tz=tz/l;p.nx=-p.tz;p.nz=p.tx;p.a=Math.atan2(-p.tx,p.tz)});
 return out}
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const C32=h=>{const c=X.hex(h);return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0};
function build(no,battle){const key=battle?'b'+no:'t'+no;if(BUILT[key])return BUILT[key];
 const tr=TRACKS[no],th=THEMES[tr.th],D=new Float32Array(TS*TS).fill(1e9),I=new Uint16Array(TS*TS),surf=new Uint8Array(TS*TS);
 let path=[],N=0;
 if(!battle){path=spline(tr.pts);N=path.length;const R=RW+30;
  path.forEach((s,i)=>{const cx=Math.round(s.x),cz=Math.round(s.z);for(let dz=-R;dz<=R;dz++){const y=cz+dz;if(y<0||y>=TS)continue;
   for(let dx=-R;dx<=R;dx++){const x=cx+dx;if(x<0||x>=TS)continue;const d2=dx*dx+dz*dz;if(d2>R*R)continue;const q=y*TS+x;
    if(d2<D[q]){D[q]=d2;I[q]=i}}}})}
 else{// arena: a rounded square with four pillars
  for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const q=y*TS+x,ex=Math.max(0,Math.abs(x-512)-250),ez=Math.max(0,Math.abs(y-512)-250);let d=Math.hypot(ex,ez)-110+RW;
   for(const[px,pz]of[[372,372],[652,372],[372,652],[652,652]]){const pd=RW+20+30-Math.hypot(x-px,y-pz);if(pd>d)d=pd}
   D[q]=d<0?0:d*d}}
 const pads=new Set(),curv=path.map((s,i)=>wrapA(path[(i+8)%N].a-path[(i-8+N)%N].a));
 if(!battle){// boost pads on the straightest bits
  const ac=curv.map((c,i)=>Math.abs(wrapA(path[(i+12)%N].a-path[(i-12+N)%N].a)));
  for(let k=0;k<3;k++){let best=-1,bv=9;for(let i=0;i<N;i+=3){const ok=[...pads].every(j=>Math.min(Math.abs(j-i),N-Math.abs(j-i))>N/5);if(ok&&ac[i]<bv&&i>N*.08){bv=ac[i];best=i}}if(best>=0)for(let j=0;j<5;j++)pads.add((best+j)%N)}}
 // the floor texture, one texel per world unit, all from fixed palette colours
 const cRoad=C32(th.road),cSp=th.sp.map(C32),cLine=C32(th.line),cCurb=th.curb.map(C32),cCurbD=th.curb.map(c=>C32(X.shades(c)[3])),cOff=th.off.map(C32),cDot=th.dot.map(C32),
  cBar=th.bar.map(C32),cFar=th.far.map(C32),cK=C32(P.k),cW=C32('#f0ece4'),cB=C32('#181420'),cPad=[C32('#f8c020'),C32('#f07018')],
  cWin=['#a08050','#3c80a0','#904880'].map(C32),cCity=['#1a1630','#241c40','#30265a','#e0b020'].map(C32);
 const tex=X.mk(TS,TS),tg=tex.getContext('2d'),im=tg.createImageData(TS,TS),o32=new Uint32Array(im.data.buffer),th0=tr.th;
 for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const q=y*TS+x,d=Math.sqrt(D[q]),h=hash(x,y);let c,s,along=0,across=0;
  if(!battle){const p=path[I[q]];along=I[q]*4+(x-p.x)*p.tx+(y-p.z)*p.tz;across=(x-p.x)*p.nx+(y-p.z)*p.nz}
  if(d<RW){s=ROAD;c=h<.05?cSp[0]:h>.965?cSp[1]:cRoad;
   if(battle){if((x&31)===0||(y&31)===0)c=cSp[1]}
   else{const i=I[q];
    if(i<=1)c=((Math.floor(along/4)+Math.floor((across+64)/4))&1)?cW:cB;
    else if(pads.has(i)&&Math.abs(across)<14){s=PAD;const a=Math.abs(across);c=a>12.6?cK:(((along-a*.9)%10+10)%10<5)?cPad[0]:cPad[1]}
    else if(d>RW-3&&d<RW-1.5)c=cLine;
    else if(d<1&&(Math.floor(along/12)&1))c=cLine}}
  else if(d<RW+5){s=CURB;const b=battle?((x+y)>>3)&1:Math.floor(along/8)&1;c=d>RW+4?cCurbD[b]:cCurb[b]}
  else if(d<RW+20){s=OFF;c=cOff[battle?((x>>4)+(y>>4))&1:Math.floor(along/16)&1];if(h<.012)c=cDot[h<.006?0:1];if(th.night&&((x&15)===0||(y&15)===0))c=cDot[0]}
  else if(d<RW+25){s=WALL;const b=battle?((x+y)>>2)&1:Math.floor(along/5)&1;c=d<RW+21||d>RW+24?cK:cBar[b]}
  else{s=WALL;
   if(th0==='sunny'){c=cFar[((x>>5)+(y>>5))&1];if(h<.004)c=cDot[h<.002?0:1]}
   else if(th0==='dune'){c=cFar[Math.floor((y+5*Math.sin(x*.045))/6)&1];if(h<.003)c=cDot[1]}
   else if(th0==='frost'){c=h<.02?cFar[1]:cFar[0];if(h<.003)c=cDot[1]}
   else{const gx=x&63,gy=y&63;
    if(gx<8||gy<8){c=cCity[0];if((gx===4&&gy>=8||gy===4&&gx>=8)&&((x+y)>>2)&1)c=cCity[3]}
    else{c=cCity[1];const hw=hash(x>>2,y>>2);if(gx===8||gy===8||gx===63||gy===63)c=cCity[2];else if((gx&3)&&(gy&3)&&hw<.12)c=cWin[(hw*30|0)%3]}}}
  surf[q]=s;o32[q]=c}
 tg.putImageData(im,0,0);
 // minimap: 16 world units a pixel, road in white with a dark rim
 const mini=X.mk(64,64),mg=mini.getContext('2d'),mi=mg.createImageData(64,64),m32=new Uint32Array(mi.data.buffer),rd=new Uint8Array(64*64);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){let r=0;for(const oy of[4,12])for(const ox of[4,12]){const s=surf[(y*16+oy)*TS+x*16+ox];if(s!==OFF&&s!==WALL)r=1}rd[y*64+x]=r}
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const q=y*64+x;if(rd[q])m32[q]=C32('#e8e4dc');else if(rd[q-1]||rd[q+1]||y>0&&rd[q-64]||y<63&&rd[q+64])m32[q]=cK}
 if(!battle){const s0=path[0];m32[(s0.z>>4)*64+(s0.x>>4)]=C32('#d82838')}
 mg.putImageData(mi,0,0);
 // props: arrow signs on the outside of every sharp bend, tyre stacks along the barrier, scenery behind them
 const rr=RA.util.mulberry(no*977+(battle?5:1)),props=[],signs=[];
 const free=(x,z,m)=>x>8&&z>8&&x<TS-8&&z<TS-8&&Math.sqrt(D[(z|0)*TS+(x|0)])>=m;
 if(!battle){for(let i=0;i<N;i+=5){const c=curv[(i+10)%N];if(Math.abs(c)<.7)continue;const s=path[i],left=c>0,sd=left?-1:1,x=s.x+s.nx*sd*(RW+23),z=s.z+s.nz*sd*(RW+23);
   if(free(x,z,RW+21)){props.push({x,z,k:'sign',fl:left?1:0});signs.push([i,sd])}}
  for(let i=0;i<N;i+=6)for(const sd of[-1,1]){if(signs.some(([j,d])=>d===sd&&Math.min(Math.abs(j-i),N-Math.abs(j-i))<4))continue;
   const s=path[i],x=s.x+s.nx*sd*(RW+23),z=s.z+s.nz*sd*(RW+23);if(free(x,z,RW+21))props.push({x,z,k:th.props[1]})}}
 else{for(let a=0;a<6.283;a+=.07){const x=512+Math.cos(a)*400,z=512+Math.sin(a)*400;if(free(x,z,RW+21))props.push({x,z,k:th.props[1]})}
  for(const[px,pz]of[[372,372],[652,372],[372,652],[652,652]]){props.push({x:px,z:pz,k:th.props[0][0],sc:1.4});for(let a=0;a<6.283;a+=.45)props.push({x:px+Math.cos(a)*26,z:pz+Math.sin(a)*26,k:th.props[1]})}}
 for(let k=0;k<300;k++){const x=rr()*TS,z=rr()*TS;if(free(x,z,RW+34))props.push({x,z,k:th.props[0][rr()*th.props[0].length|0],sc:.8+rr()*.5,fl:rr()<.5?1:0})}
 // item box rows
 const bx=[];if(!battle)for(const f of[.16,.4,.64,.86]){const s=path[Math.floor(f*N)];for(const o of[-20,-10,0,10,20])bx.push({x:s.x+s.nx*o,z:s.z+s.nz*o})}
 else for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++)if((gx+gz)&1||!gx&&!gz)bx.push({x:512+gx*120,z:512+gz*120});
 return BUILT[key]={no,th,tr,path,N,tex,surf,I,mini,props,bx,battle,curv}}
const surfAt=(x,z)=>{x|=0;z|=0;return x<0||z<0||x>=TS||z>=TS?WALL:MAP.surf[z*TS+x]},idxAt=(x,z)=>{x|=0;z|=0;return x<0||z<0||x>=TS||z>=TS?0:MAP.I[z*TS+x]};
const solid=(x,z,r)=>surfAt(x+r,z)===WALL||surfAt(x-r,z)===WALL||surfAt(x,z+r)===WALL||surfAt(x,z-r)===WALL;

/* ---------- match setup ---------- */
function start(seats,md,S,seed){const rr=RA.util.mulberry(seed);BAT=md>=2;
 trackNo=S.track==='rnd'?Math.floor(rr()*TRACKS.length):(+S.track||0);MAP=build(trackNo,BAT);
 finN=0;firstFin=0;lastHF=0;champ=-1;musOn=false;boxes=MAP.bx.map((b,i)=>({id:i,x:b.x,z:b.z,t:0,lt:0}));oils=[];proj=[];parts=[];texts=[];nextId=1;
 karts=seats.map((s,i)=>{let x,z,a;
  if(BAT){const ang=i/seats.length*Math.PI*2;x=512+Math.cos(ang)*330;z=512+Math.sin(ang)*330;a=Math.atan2(-(512-x),512-z)}
  else{const row=i>>1,s0=MAP.path[(MAP.N-6-row*5+MAP.N*4)%MAP.N],sd=i&1?1:-1;x=s0.x+s0.nx*sd*13;z=s0.z+s0.nz*sd*13;a=s0.a}
  return{i,name:s.name,col:md===1||md===3?TEAMC[i%2]:s.col,x,z,a,va:a,sp:0,vis:0,fx:{},drift:0,dc:0,hop:0,item:0,cnt:0,roul:0,useSeq:0,useLog:[],uack:0,
   claims:[],cseq:0,ev:[],evSeq:0,evSeen:0,pops:0,popLog:[],popSeen:0,bal:3,out:false,hits:0,lap:0,idx:BAT?0:idxAt(x,z),half:true,prog:0,place:i+1,fin:0,ft:0,
   gs:-1,lane:(rr()-.5)*30,wrong:0,bump:{},turbos:0,auto:s.ctrl==='touch'||s.ctrl==='me'&&!!RA.util.touchDev}});
 cams.length=0}

/* ---------- your own kart (runs on its owner's device) ---------- */

/* ---------- your own kart (runs on its owner's device) ---------- */
const VMAX=2.4,VBOOST=3.4,VSTAR=3.0;
function drive(p,inp){const f=p.fx;for(const k in f)if(f[k]>0&&k!=='shield')f[k]--;if(p.roul>0)p.roul--;if(p.hop>0)p.hop--;
 if(p.out){p.sp*=.95;return}
 const gas=K.tick<CD?!!(inp.up||p.auto&&inp.fire):!inp.down;    // karts accelerate on their own; S brakes
 if(K.tick<CD){if(gas){if(p.gs<0)p.gs=K.tick}else p.gs=-1;return}
 if(K.tick===CD&&p.gs>=CD-28){f.boost=70;p.sp=VMAX;sfx('boost');say(p,'ROCKET START!','#f8d040')}
 let steer=(inp.left?1:0)-(inp.right?1:0);if(inp.ax&&Math.abs(inp.ax)>.15)steer=-inp.ax;
 // keys steer in over a few frames (taps make small corrections, holding gives full lock)
 p.st=(p.st||0)+Math.max(-.25,Math.min(.25,steer-(p.st||0)));if(!inp.ax)steer=p.st;
 if(f.spin>0){p.sp*=.95;move(p,p.va);return}
 const s=surfAt(p.x,p.z),cpu=K.seats[p.i]&&K.seats[p.i].ctrl==='cpu';
 let max=VMAX*(f.shrink>0?.72:1);if(cpu){max*=Math.min([.9,1,1.03][K.cpu],[.86,.93,.97][K.cpu]+(BAT?0:(p.place-1)/Math.max(1,karts.length-1)*.07));
  if(!BAT&&humanProg!=null&&p.prog>humanProg+MAP.N*.2)max*=.88}       // far ahead of every human: ease off so the race stays a race
 if(f.star>0)max=VSTAR;if(f.boost>0)max=VBOOST;if(s===OFF&&!(f.star>0||f.boost>0))max*=.62;
 if(s===OFF)p.offT=(p.offT|0)+1;if(s===PAD&&!(f.boost>20)){f.boost=50;sfx('boost')}
 if(gas){if(p.sp<max)p.sp=Math.min(max,p.sp+.05*(1.2-p.sp/max));else p.sp+=(max-p.sp)*.04}
 else if(inp.down)p.sp=p.sp>0?p.sp-.09:Math.max(-1,p.sp-.04);else p.sp*=.985;
 // drift: hop in while steering, hold through the bend, let go for a mini-turbo
 p.held=steer?(p.held|0)+1:0;const dr=inp.alt||inp.b4||(p.auto&&p.held>30&&p.sp>VMAX*.8);
 if(dr&&!p.drift&&!p.dHeld&&Math.abs(steer)>.2&&p.sp>1.5){p.drift=steer>0?1:-1;p.dc=0;p.hop=10;sfx('hop')}
 if(dr&&!p.dHeld&&!p.drift&&!(p.hop>0))p.hop=10;                 // a hop on its own, straight ahead
 p.dHeld=dr;
 if(p.drift&&(!dr||p.sp<1.2)){if(p.dc>150){f.boost=75;p.turbos++;sfx('boost')}else if(p.dc>75){f.boost=40;sfx('boost')}p.drift=0;p.dc=0}
 let turn;
 if(p.drift){const same=steer*p.drift>0;turn=p.drift*(.034+(same?.022:steer?-.016:0));p.dc+=same?1.6:1}
 else turn=steer*.05*Math.min(1,Math.abs(p.sp)/1)*(1-.28*Math.min(1,Math.abs(p.sp)/VBOOST))*(p.sp<0?-1:1)*(f.shrink>0?1.1:1);
 p.a=wrapA(p.a+turn);
 const grip=p.drift?.07:MAP.th.ice?.12:.24;p.va=wrapA(p.va+wrapA(p.a-p.va)*grip);
 move(p,p.va)}
// hitting a wall: slide along it, lose some speed, and get turned back along the track instead of stuck nose-in
function move(p,ang){const[fx,fz]=fwd(ang),nx=p.x+fx*p.sp,nz=p.z+fz*p.sp,r=4;
 if(!solid(nx,nz,r)){p.x=nx;p.z=nz;return}
 if(Math.abs(p.sp)>1.8)knock(p);
 if(!BAT&&MAP.path.length){let ta=MAP.path[idxAt(p.x,p.z)].a;if(Math.abs(wrapA(ta-p.a))>Math.PI/2)ta=wrapA(ta+Math.PI);p.a=wrapA(p.a+wrapA(ta-p.a)*.2);p.va=wrapA(p.va+wrapA(ta-p.va)*.3)}
 if(!solid(nx,p.z,r)){p.x=nx;p.sp*=.92}else if(!solid(p.x,nz,r)){p.z=nz;p.sp*=.92}else p.sp*=-.3}
function knock(p){if(p.kn&&K.tick-p.kn<20)return;p.kn=K.tick;p.walls=(p.walls|0)+1;sfx('bump');for(let k=0;k<6;k++)parts.push({x:p.x,z:p.z,y:3,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,vy:Math.random()*1.5,t:20,col:'#f8e8a0'})}
// owner-side checks: item boxes, oil, bumping other karts, using items
function ownerChecks(p,inp){if(p.out||K.tick<CD)return;
 for(const b of boxes)if(b.t<=0&&b.lt<=0&&Math.hypot(b.x-p.x,b.z-p.z)<9){b.lt=40;sfx('box');burst(b.x,b.z,6,'#ffffff',10);
  if(!p.item&&!p.roul){p.roul=45;claim(p,'b',b.id)}else claim(p,'b',b.id)}
 for(const o of oils)if(!o.gone&&!(o.own===p.i&&K.tick-o.at<40)&&Math.hypot(o.x-p.x,o.z-p.z)<8){o.gone=1;claim(p,'o',o.id);if(!(p.fx.star>0))hit(p,'s',o.own)}
 for(const q of karts){if(q===p||q.out)continue;const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<10&&d>.01){
   const push=(10-d)*(q.fx.star>0&&!(p.fx.star>0)?.9:.5);if(!solid(p.x+dx/d*push,p.z+dz/d*push,4)){p.x+=dx/d*push;p.z+=dz/d*push}p.sp*=.97;
   if(p.fx.star>0&&!(q.fx.star>0)&&!sameTeam(p.i,q.i)&&!(p.bump[q.i]>K.tick)){p.bump[q.i]=K.tick+60;claim(p,'st',q.i)}}}
 if(inp.tap&&p.item&&p.roul<=0)useItem(p,!!inp.down);
 if(!BAT){const id=idxAt(p.x,p.z),d=((id-(p.lidx==null?id:p.lidx))%MAP.N+MAP.N*1.5)%MAP.N-MAP.N/2;p.lidx=id;p.wrong=d<0&&p.sp>.8?p.wrong+1:Math.max(0,p.wrong-2)}}
function useItem(p,back){const k=p.item;if(--p.cnt<=0){p.item=0;p.cnt=0}
 p.useSeq++;p.useLog.push([p.useSeq,k,back?1:0]);if(p.useLog.length>6)p.useLog.shift();
 const f=p.fx;if(k===1||k===2){f.boost=80;sfx('boost')}else if(k===6){f.shield=1;sfx('pick')}else if(k===7){f.star=420;sfx('pick')}else sfx('shot');
 if(!K.isClient()){p.uack=p.useSeq;shared(p,k,back)}}
// a hit lands on the kart it hit (on its owner's device): star ignores it, a shield eats it
function hit(p,kind,by){const f=p.fx;if(f.star>0)return;if(kind==='k'){f.shrink=300;sfx('spin');return}if(kind==='i'){f.ink=240;return}
 if(f.shield>0){f.shield=0;sfx('pick');burst(p.x,p.z,10,'#80d0ff',6);return}
 f.spin=60;p.sp*=.35;p.drift=0;p.dc=0;sfx('spin');p.pops++;p.popLog.push([p.pops,by==null?-1:by,kind==='st'?1:0]);if(p.popLog.length>6)p.popLog.shift();
 if(!K.isClient())pop(p,by==null?-1:by,kind==='st')}
function claim(p,k,id){if(!K.isClient()){resolve(p,k,id);return}p.cseq++;p.claims.push([p.cseq,k,id]);if(p.claims.length>10)p.claims.shift()}

/* ---------- host: referee shared things ---------- */
function resolve(p,k,id){
 if(k==='b'){const b=boxes[id];if(!b||b.t>0)return;b.t=BAT?180:300;if(!p.item){p.item=roll(p);p.cnt=ITEMS[p.item].cnt||1;if(owned(p))p.roul=Math.max(p.roul,45)}}
 else if(k==='o'){oils=oils.filter(o=>o.id!==id)}
 else if(k==='st'){const q=karts[id];if(q)send(q,'st',p.i)}}
function roll(p){const S=K.S,n=karts.length;if(S.items==='boost')return Math.random()<.25?2:1;
 const f=n>1?(p.place-1)/(n-1):.5;let bag;
 if(BAT)bag=[3,4,4,5,6,7,1,3];else if(f<.15)bag=[3,3,4,6,1];else if(f<.55)bag=[1,3,4,5,6,2];else bag=[2,5,7,2,5,1,4];
 if(S.items==='party'&&f>.3)bag.push(8,9,8,9);return bag[Math.floor(Math.random()*bag.length)]}
function send(q,kind,by){if(!q||q.out||by!=null&&by>=0&&sameTeam(q.i,by))return;
 if(K.seats[q.i].ctrl==='net'){q.evSeq++;q.ev.push([q.evSeq,kind,by==null?-1:by]);if(q.ev.length>6)q.ev.shift()}else hit(q,kind,by)}
function pop(p,by,steal){const o=karts[by];if(o&&o!==p)o.hits++;
 if(BAT){p.bal=Math.max(0,p.bal-1);if(steal&&o&&o.bal<5&&!o.out){o.bal++;say(o,'STOLE A BALLOON!','#f8d040')}
  if(p.bal===0){p.out=true;boom(p.x,p.z,p.col);say(p,'OUT!','#ff6060')}}}
function shared(p,k,back){const[fx,fz]=fwd(p.a);
 if(k===3)oils.push({id:nextId++,x:p.x-fx*11,z:p.z-fz*11,own:p.i,at:K.tick,t:2400});
 else if(k===4){const a=back?p.a+Math.PI:p.a,[ax,az]=fwd(a);proj.push({id:nextId++,k:4,x:p.x+ax*11,z:p.z+az*11,a,sp:5,t:480,own:p.i})}
 else if(k===5){const tg=BAT?karts.filter(q=>q!==p&&!q.out&&!sameTeam(q.i,p.i)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0]:karts.find(q=>q.place===p.place-1);
  proj.push({id:nextId++,k:5,x:p.x+fx*11,z:p.z+fz*11,a:p.a,sp:5.4,t:600,own:p.i,tg:tg?tg.i:-1})}
 else if(k===8||k===9){const tg=karts.filter(q=>q!==p&&!q.out&&!sameTeam(q.i,p.i)&&(BAT||q.place<p.place));for(const q of tg)send(q,k===8?'i':'k',p.i);
  say(p,k===8?'INK!':'SHRINK!',ITEMS[k].c)}}
function readUpload(p,r){if(typeof r.x!=='number')return;p.x=r.x;p.z=r.z;p.a=r.a;p.sp=r.s;p.fl=r.f|0;
 for(const e of r.u||[])if((e[0]|0)>p.uack){p.uack=e[0]|0;if(p.item){if(--p.cnt<=0){p.item=0;p.cnt=0}}shared(p,e[1]|0,!!e[2])}
 for(const e of r.c||[])if((e[0]|0)>(p.cSeen|0)){p.cSeen=e[0]|0;resolve(p,e[1],e[2])}
 for(const e of r.p||[])if((e[0]|0)>p.popSeen){p.popSeen=e[0]|0;pop(p,e[1]|0,!!e[2])}}
function trackLap(p){if(BAT)return;const id=idxAt(p.x,p.z),N=MAP.N,prev=p.idx;p.idx=id;
 if(prev>N*.75&&id<N*.25){if(p.half){p.lap++;p.half=false;if(owned(p)&&p.lap===K.S.laps&&p.lap>1)say(p,'FINAL LAP!','#f8d040')}}
 else if(prev<N*.25&&id>N*.75)p.half=false;if(id>N*.4&&id<N*.6)p.half=true;
 p.prog=p.lap*N+id-(p.lap===0&&id<N*.5?N:0)}
function music(){if(!musOn&&K.tick>2&&!K.demo){musOn=true;K.track(BAT?5:MAP.th.mus)}}
function step(){music();
 for(const p of karts){const s=K.seats[p.i];
  if(s.ctrl==='net'){const r=K.remote(p.i);if(r)readUpload(p,r)}
  else{const inp=p.fin&&!BAT?bot(p.i):K.inp(p.i);drive(p,inp);ownerChecks(p,inp)}
  trackLap(p)}
 for(const b of boxes){if(b.t>0)b.t--;if(b.lt>0)b.lt--}for(const o of oils)if(--o.t<=0)o.gone=1;oils=oils.filter(o=>!o.gone||K.isClient());oils=oils.filter(o=>o.t>0);
 for(const j of proj){j.t--;
  if(j.k===5){const tg=karts[j.tg];let tx,tz;if(tg&&!tg.out){if(!BAT&&Math.hypot(tg.x-j.x,tg.z-j.z)>90){const s=MAP.path[(idxAt(j.x,j.z)+10)%MAP.N];tx=s.x;tz=s.z}else{tx=tg.x;tz=tg.z}
    const want=Math.atan2(-(tx-j.x),tz-j.z);j.a=wrapA(j.a+Math.max(-.12,Math.min(.12,wrapA(want-j.a))))}
   const[fx,fz]=fwd(j.a);j.x+=fx*j.sp;j.z+=fz*j.sp;if(K.tick%2===0)parts.push({x:j.x,z:j.z,y:3,vx:0,vz:0,vy:.2,t:20,col:'#c0c0c0',sz:2})}
  else{const[fx,fz]=fwd(j.a),nx=j.x+fx*j.sp,nz=j.z+fz*j.sp;if(!solid(nx,nz,3)){j.x=nx;j.z=nz}else{const bx=solid(nx,j.z,3),bz=solid(j.x,nz,3);let vx=fx,vz=fz;if(bx||!bz)vx=-vx;if(bz||!bx)vz=-vz;j.a=Math.atan2(-vx,vz)}}
  for(const q of karts){if(q.out||q.i===j.own&&j.t>440||sameTeam(q.i,j.own))continue;if(Math.hypot(q.x-j.x,q.z-j.z)<8){j.t=0;boom(j.x,j.z,j.k===5?'#ff6030':'#40e060');send(q,'s',j.own);break}}}
 proj=proj.filter(j=>j.t>0);
 if(K.S.items!=='off'&&K.tick%600===300&&!BAT)for(const b of boxes)b.t=Math.min(b.t,60);
 places();vis();checkEnd()}
let humanProg=null;
function places(){const hs=karts.filter(p=>K.seats[p.i]&&K.seats[p.i].ctrl!=='cpu'&&!p.fin);humanProg=hs.length?Math.max(...hs.map(p=>p.prog)):null;
 const order=karts.slice().sort(BAT?(a,b)=>(a.out-b.out)||b.bal-a.bal||b.hits-a.hits:(a,b)=>(a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:b.prog-a.prog));order.forEach((p,k)=>p.place=k+1);
 if(!BAT)for(const p of karts)if(!p.fin&&p.lap>K.S.laps){p.fin=++finN;p.ft=K.tick-CD;if(finN===1)firstFin=K.tick;if(K.seats[p.i].ctrl!=='cpu')lastHF=K.tick;K.fx('f',p.i);if(owned(p))confetti(p);say(p,ord(p.fin)+' PLACE!',p.fin<=3?'#f8d040':'#ffffff')}}
let champ=-1;
function checkEnd(){const S=K.S,lim=(S.len||(BAT?3:0))*3600;
 if(BAT){const alive=karts.filter(p=>!p.out),teams=new Set(alive.map(p=>teamOf(p.i)));
  if(karts.length>1&&teams.size<=1||karts.length===1&&!alive.length||lim&&K.tick>=lim+CD){const b=karts.slice().sort((a,c)=>a.place-c.place)[0];champ=b?b.i:-1;
   if(K.mode===3){const sc=[0,1].map(t=>karts.filter(p=>p.i%2===t).reduce((a,p)=>a+p.bal,0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}else K.end(b?{i:b.i}:null)}return}
 const humans=karts.filter(p=>K.seats[p.i].ctrl!=='cpu'&&!p.fin).length,all=karts.every(p=>p.fin);
 if(all||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>300||finN&&K.tick-firstFin>1800||lim&&K.tick>=lim+CD){places();const w=karts.find(p=>p.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=karts.length,sc=[0,1].map(t=>karts.filter(p=>p.i%2===t).reduce((a,p)=>a+(n-p.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}
  else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(p,s,col){texts.push({x:p.x,z:p.z,y:16,s,col,t:80,own:p.i})}
function boom(x,z,col){sfx('boom');burst(x,z,16,col,4);K.fx('x',Math.round(x),Math.round(z),col)}
function burst(x,z,n,col,y){for(let k=0;k<n;k++)parts.push({x,z,y:y||4,vx:(Math.random()-.5)*2.4,vz:(Math.random()-.5)*2.4,vy:Math.random()*2,t:30,col:k%2?col:'#f8a030'})}
function confetti(p){for(let k=0;k<40;k++)parts.push({x:p.x,z:p.z,y:10,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*3,vy:1+Math.random()*2,t:70,col:['#f84040','#40c0f8','#f8e040','#40f880','#f880f8'][k%5]})}
// effects everyone sees, worked out from each kart's flags so they look the same on every screen
function vis(){for(const q of parts){q.x+=q.vx;q.z+=q.vz;q.y=Math.max(0,q.y+q.vy);q.vy-=q.g==null?.08:q.g;q.vx*=.94;q.vz*=.94;q.t--}parts=parts.filter(q=>q.t>0);if(parts.length>600)parts.splice(0,parts.length-600);
 for(const t of texts){t.t--;t.y+=.15}texts=texts.filter(t=>t.t>0);
 for(const p of karts){const fl=flags(p),[fx,fz]=fwd(p.a),rx=fz,rz=-fx;p.odo=(p.odo||0)+Math.abs(p.sp);
  if(fl&256&&!p.hl)p.vh=10;p.hl=fl&256;if(p.vh>0)p.vh--;
  if(fl&8&&!(p.vh>0)){// drift: tyre smoke, then blue / orange sparks from the rear wheels
   const lv=fl&128?2:fl&64?1:0,col=['#e8e4dc','#60a0ff','#ffa040'][lv];
   for(const sd of[-1,1]){const x=p.x-fx*4+rx*sd*4,z=p.z-fz*4+rz*sd*4;
    if(lv)parts.push({x,z,y:1,vx:-fx*.3+(Math.random()-.5)*.8,vz:-fz*.3+(Math.random()-.5)*.8,vy:.6+Math.random()*.8,g:.12,t:10,col:Math.random()<.3?'#ffffff':col,sz:1});
    if(K.tick%4===0)parts.push({x,z,y:.5,vx:-fx*.2,vz:-fz*.2,vy:.15,g:0,t:16,col:'#e8e4dc',sz:1.5,smoke:1})}}
  if(fl&1&&K.tick%4===0)parts.push({x:p.x+(Math.random()-.5)*8,z:p.z+(Math.random()-.5)*8,y:2+Math.random()*5,vx:0,vz:0,vy:.2,g:0,t:12,col:['#fff07c','#ffffff','#a0f0ff'][Math.random()*3|0],sz:1});
  if(Math.abs(p.sp)>1.3&&K.tick%3===0&&surfAt(p.x,p.z)===OFF)parts.push({x:p.x-fx*5,z:p.z-fz*5,y:.5,vx:(Math.random()-.5)*.6-fx*.3,vz:(Math.random()-.5)*.6-fz*.3,vy:.4,t:18,col:MAP.th.off[1],sz:2,smoke:1})}}
// what everyone sees about a kart: 1 star 2 shield 4 boost 8 drift 16 spin 32 shrink 64 blue sparks 128 orange sparks 256 hop 512 drifting right
function flags(p){if(K.isClient()&&p.i!==K.myIdx||K.seats[p.i]&&K.seats[p.i].ctrl==='net'&&!K.isClient())return p.fl|0;const f=p.fx;
 return(f.star>0?1:0)|(f.shield>0?2:0)|(f.boost>0?4:0)|(p.drift?8:0)|(f.spin>0?16:0)|(f.shrink>0?32:0)|(p.drift&&p.dc>75&&p.dc<=150?64:0)|(p.drift&&p.dc>150?128:0)|(p.hop>0?256:0)|(p.drift<0?512:0)}
/* ---------- guests: upload my kart, take the host's word for everything shared ---------- */
function local(i){const p=karts[i];if(!p)return;const inp=p.fin&&!BAT?bot(i):K.inp(i);drive(p,inp);ownerChecks(p,inp);for(const b of boxes)if(b.lt>0)b.lt--}
function upload(i){const p=karts[i];if(!p)return null;return{x:Math.round(p.x*10)/10,z:Math.round(p.z*10)/10,a:Math.round(p.a*100)/100,s:Math.round(p.sp*10)/10,f:flags(p),
 u:p.useLog,c:p.claims.slice(-8),p:p.popLog}}
function snap(){const net=p=>K.seats[p.i].ctrl==='net';
 return{k:karts.map(p=>[Math.round(p.x),Math.round(p.z),Math.round(p.a*100),Math.round(p.sp*10),flags(p),p.lap,p.place,p.item,p.cnt,p.uack,net(p)?p.ev:0,p.bal,p.fin,p.hits,p.out?1:0,p.ft]),
  b:boxes.map(b=>b.t>0?0:1).join(''),o:oils.map(o=>[o.id,Math.round(o.x),Math.round(o.z),o.own]),j:proj.map(j=>[j.id,j.k,Math.round(j.x),Math.round(j.z),Math.round(j.a*100)])}}
function apply(g){(g.k||[]).forEach((a,i)=>{const p=karts[i];if(!p)return;p.lap=a[5]|0;p.place=a[6]|0;p.bal=a[11]|0;p.fin=a[12]|0;p.hits=a[13]|0;p.out=!!a[14];p.ft=a[15]|0;
  if(i===K.myIdx){if((a[9]|0)>=p.useSeq){if(!p.item&&a[7])p.roul=Math.max(p.roul,20);p.item=a[7]|0;p.cnt=a[8]|0}
   for(const e of a[10]||[])if((e[0]|0)>p.evSeen){p.evSeen=e[0]|0;hit(p,e[1],e[2]|0)}return}
  p.tx=a[0];p.tz=a[1];p.ta=a[2]/100;p.sp=a[3]/10;p.fl=a[4]|0;if(p.gx==null){p.x=p.tx;p.z=p.tz;p.a=p.ta;p.gx=1}});
 const bs=String(g.b||'');boxes.forEach((b,k)=>b.t=bs[k]==='0'?1:0);
 const om=new Map(oils.map(o=>[o.id,o]));oils=(g.o||[]).map(r=>{const o=om.get(r[0]);return{id:r[0],x:r[1],z:r[2],own:r[3],at:o?o.at:K.tick,gone:o&&o.gone,t:1}});
 const pm=new Map(proj.map(j=>[j.id,j]));proj=(g.j||[]).map(r=>{const o=pm.get(r[0]);return{id:r[0],k:r[1],x:o?o.x:r[2],z:o?o.z:r[3],tx:r[2],tz:r[3],a:r[4]/100}})}
function follow(){music();
 for(const p of karts){if(p.i===K.myIdx||p.tx==null)continue;const[fx,fz]=fwd(p.ta),ex=p.tx+fx*p.sp*2,ez=p.tz+fz*p.sp*2;
  if(Math.hypot(ex-p.x,ez-p.z)>40){p.x=ex;p.z=ez}else{p.x+=(ex-p.x)*.3;p.z+=(ez-p.z)*.3}p.a=wrapA(p.a+wrapA(p.ta-p.a)*.35)}
 for(const j of proj){const[fx,fz]=fwd(j.a);j.tx+=fx*(j.k===5?5.4:5)*.5;j.tz+=fz*(j.k===5?5.4:5)*.5;j.x+=(j.tx-j.x)*.4;j.z+=(j.tz-j.z)*.4}
 vis()}
function onFx(k,a){if(k==='x'){sfx('boom');burst(a[0],a[1],16,a[2],4)}else if(k==='f'){const p=karts[a[0]];if(p&&(p.i===K.myIdx))confetti(p)}}

/* ---------- CPU drivers ---------- */
function bot(i){const p=karts[i];if(!p||p.out)return{};const o={up:true};let tx,tz;
 if(BAT){const rv=karts.filter(q=>q!==p&&!q.out&&!sameTeam(q.i,i)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
  const bx=!p.item&&boxes.filter(b=>b.t<=0).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
  const tg=bx||rv;if(!tg)return o;tx=tg.x;tz=tg.z;if(solid(p.x+fwd(p.a)[0]*24,p.z+fwd(p.a)[1]*24,4)){tx=512;tz=512}}
 else{const N=MAP.N,look=7+Math.floor(Math.abs(p.sp)*3),s=MAP.path[(idxAt(p.x,p.z)+look)%N];let lane=p.lane+Math.sin(K.tick*.01+i)*6;
  if(!p.item){const b=boxes.find(b=>b.t<=0&&Math.hypot(b.x-s.x,b.z-s.z)<40);if(b){tx=b.x;tz=b.z}}
  if(tx==null){tx=s.x+s.nx*lane*.6;tz=s.z+s.nz*lane*.6}}
 let want=Math.atan2(-(tx-p.x),tz-p.z);
 // look ahead: if the way to the target runs into a wall or pillar, take the clearer side
 const clear=(a,L)=>{const[fx,fz]=fwd(a);for(let t=8;t<=L;t+=8)if(solid(p.x+fx*t,p.z+fz*t,5))return t;return 99};
 if(clear(want,40)<99){let best=want,bc=0;for(const da of[.35,-.35,.7,-.7,1.05,-1.05,1.4,-1.4]){const c=clear(want+da,40);if(c>bc){bc=c;best=want+da}}want=best}
 const d=wrapA(want-p.a),dz=[.08,.05,.03][K.cpu],tdist=Math.hypot(tx-p.x,tz-p.z);
 if(d>dz)o.left=true;else if(d<-dz)o.right=true;
 if(BAT&&Math.abs(d)>1&&tdist<90&&p.sp>1.2){o.up=false;o.down=true}
 // stuck against something: back out, turning the other way
 if(K.tick>CD+30&&Math.abs(p.sp)<.4&&!(p.fx.spin>0))p.stk=(p.stk|0)+1;else p.stk=Math.max(0,(p.stk|0)-1);
 if(p.stk>25){p.rev=45;p.stk=0}
 if(p.rev>0){p.rev--;o.up=false;o.down=true;const l=o.left;o.left=!!o.right;o.right=!!l;if(!o.left&&!o.right)o.left=true;return o}
 // drift through the bends the track says are coming; Normal lets go on blue sparks, Hard waits for orange
 if(K.cpu>=1&&!BAT){const cv=MAP.curv[(idxAt(p.x,p.z)+5)%MAP.N],want=K.cpu>=2?155:80;
  if(!p.drift){if(Math.abs(cv)>.45&&p.sp>VMAX*.75&&(cv>0?o.left:o.right))o.b4=true}
  else if(cv*p.drift>.12||p.dc<want&&cv*p.drift>.02)o.b4=true}
 if(K.tick<CD)o.up=K.tick>CD-(K.cpu>=2||i%3===0?24:-1)&&K.cpu>=1;
 if(Math.abs(d)>1.4&&p.sp>1.5){o.up=false;o.down=true}
 if(p.item&&p.roul<=0&&K.tick>CD){const k=p.item,r=Math.random();let use=false;
  const foes=karts.filter(q=>q!==p&&!q.out&&!sameTeam(q.i,i)),dist=q=>Math.hypot(q.x-p.x,q.z-p.z),ang=q=>Math.abs(wrapA(Math.atan2(-(q.x-p.x),q.z-p.z)-p.a));
  const ahead=foes.find(q=>dist(q)<(BAT?150:90)&&ang(q)<(BAT?.25:.15)),behind=foes.find(q=>dist(q)<60&&ang(q)>2.4);
  if(k===1||k===2)use=BAT?!!ahead||r<.01:Math.abs(d)<.12&&r<.05;else if(k===7)use=BAT?foes.some(q=>dist(q)<140):Math.abs(d)<.12&&r<.05;else if(k===6)use=true;
  else if(k===3)use=BAT?!!behind||r<.005:karts.some(q=>q!==p&&q.place===p.place+1&&dist(q)<50)||r<.004;
  else if(k===4)use=!!ahead||r<.003;else if(k===5)use=BAT?foes.some(q=>dist(q)<260):r<.02;
  else use=r<.02;if(use&&(K.tick>>1)&1){o.tap=true;o.fire=true}}
 return o}


/* ---------- drawing: everything on the low-res pixel screen ---------- */
const SIGN=['kkkkkkkkkkkkkk','kYYYYYYYYYYYYk','kYkkYYYkkYYYYk','kYYkkYYYkkYYYk','kYYYkkYYYkkYYk','kYYkkYYYkkYYYk','kYkkYYYkkYYYYk','kyyyyyyyyyyyyk','kkkkkkkkkkkkkk',
 '.....kGgk.....','.....kGgk.....','.....kGgk.....','.....kGgk.....','....kkkkkk....'];
const FLAME=[['...W...','..WWW..','.WYYYW.','.YYOYY.','.OOoOO.','..OoO..','...o...'],['..W.W..','.WWYWW.','.YWYWY.','OYYOYYO','.OOoOO.','.o.O.o.','.......']];
// an ellipse of letters: fill, optional rim, optional light (upper left) and dark (lower right) shading
function disc(w,h,fill,rim,shade){const r=[];for(let y=0;y<h;y++){let s='';for(let x=0;x<w;x++){const dx=(x+.5-w/2)/(w/2),dy=(y+.5-h/2)/(h/2),d=dx*dx+dy*dy;
  s+=d>1?'.':rim&&d>(rim==='ring'?.62:.55)?(rim==='ring'?fill:rim):rim==='ring'?'.':shade&&dx<-.15&&dy<-.15&&d<.42?'1':shade&&dx+dy>.55?'3':fill}r.push(s)}return r}
const CACHE=new Map(),cache=(k,f)=>{let v=CACHE.get(k);if(!v){v=f();CACHE.set(k,v)}return v};
const SHADOW=()=>cache('shadow',()=>X.sprite(disc(26,6,'k')));
const RING=()=>cache('ring',()=>X.sprite(disc(40,30,'C','ring')));
const LAMP=col=>X.recolor(disc(10,10,'2','k',1),col,null,'lamp');
const SUN=()=>cache('sun',()=>X.sprite(disc(14,14,'Y','O',1),{1:'#ffffff',3:'#f0c020'}));
const MOON=()=>cache('moon',()=>X.sprite(disc(12,12,'w','G',1),{1:'#ffffff',3:'#9a94a8'}));
const kartSpr=(col,view,fr,flip)=>cache('k'+col+view+fr+flip,()=>{const c=X.recolor(ART.kart[view][fr],col,null,'kart'+view+fr);return flip?X.flipX(c):c});
const wSpr=(k,flip,col)=>cache('w'+k+flip+(col||''),()=>{const rows=k==='sign'?SIGN:ART.world[k],c=col?X.recolor(rows,col,null,'w'+k):X.sprite(rows);return flip?X.flipX(c):c});
const iconSpr=k=>cache('i'+k,()=>X.sprite(ART.icon[ITEMS[k].ic]));
const flameSpr=f=>cache('fl'+f,()=>X.sprite(FLAME[f],{W:'#ffffff',Y:'#fff07c',O:'#ffa040',o:'#e06818'}));
// prop size in sprite pixels per screen pixel at the chase distance
const PS={tree:3,pine:3,cactus:2.6,rock:2.2,tires:1.5,snowman:2,lamp:3.2,cone:1.4,sign:1.7};
// draw canvas c scaled by k with its anchor (ax, ay) at x, y; pixel-exact sizes
function blit(g,c,x,y,k,ax,ay){const w=Math.max(1,Math.round(c.width*k)),h=Math.max(1,Math.round(c.height*k));g.drawImage(c,Math.round(x-w*(ax==null?.5:ax)),Math.round(y-h*(ay==null?1:ay)),w,h);return h}
// sky: palette bands with a dithered seam (stars at night)
function skyImg(th,w,hor){return cache('sky'+th.mus+'/'+w+'/'+hor,()=>{const c=X.mk(w,Math.max(1,hor)),g=c.getContext('2d'),im=g.createImageData(c.width,c.height),o=new Uint32Array(im.data.buffer),cols=th.sky.map(C32),n=cols.length,st=[C32('#ffffff'),C32('#a0a0d0')];
 for(let y=0;y<c.height;y++){const t=y/Math.max(1,hor)*n,k=Math.min(n-1,Math.floor(t)),fr=t-k;for(let x=0;x<w;x++){let cc=cols[k];if(k<n-1&&fr>.72&&X.dither(x,y,(fr-.72)/.28))cc=cols[k+1];
  if(th.night&&hash(x,y)<.004&&y<hor*.8)cc=st[hash(y,x)<.5?0:1];o[y*w+x]=cc}}g.putImageData(im,0,0);return c})}
// the horizon: a strip exactly one full turn wide (2·π·F pixels), so it pans in step with the camera
function stripImg(th,SW,sc){const HH=Math.max(8,Math.round(46*sc));return cache('st'+th.mus+'/'+SW+'/'+HH,()=>{
 const c=X.mk(SW,HH),g=c.getContext('2d'),im=g.createImageData(SW,HH),o=new Uint32Array(im.data.buffer),rr=RA.util.mulberry(th.mus*31+7),Q=C32;
 const per=(x,k,ph)=>Math.sin(2*Math.PI*k*x/SW+ph),wd=(a,b)=>{const d=Math.abs(a-b)%SW;return Math.min(d,SW-d)},R=v=>Math.round(v*sc);
 const set=(x,yb,col)=>{const y=HH-1-yb;if(y>=0&&y<HH)o[y*SW+x]=col};
 if(th.mus===1){const M=[Q('#8cacd4'),Q('#6c8cbc'),Q('#eef4fc'),Q('#c8d8ec')],Hc=[Q('#6cc058'),Q('#3c8a48'),Q('#2a6a38')],Cw=Q('#ffffff'),Cs=Q('#d0e0f4');
  const cl=[...Array(6)].map((_,k)=>({x:(k+rr()*.6)*SW/6,y:R(32+rr()*8),rx:R(10+rr()*12),ry:R(3+rr()*2)})),pk=[...Array(7)].map(()=>({c:rr()*SW,h:R(14+rr()*14),s:.5+rr()*.4}));
  for(let x=0;x<SW;x++){let hm=0,bp=null;for(const p of pk){const v=p.h-wd(x,p.c)*p.s;if(v>hm){hm=v;bp=p}}
   if(bp){const left=((x-bp.c)%SW+SW)%SW>SW/2;for(let yb=0;yb<hm;yb++)set(x,yb,yb>bp.h*.72?M[left?2:3]:M[left?0:1])}
   const tb=(x%9)-4,hh=R(9+4*per(x,5,3)+2*per(x,11,1)+Math.max(0,3-tb*tb/4));
   for(let yb=0;yb<hh;yb++)set(x,yb,yb>=hh-1?Hc[0]:yb<hh*.45&&X.dither(x,yb,.5)?Hc[2]:Hc[1]);
   for(const k of cl){const dx=wd(x,k.x)/k.rx;if(dx>1)continue;const hy=Math.round(k.ry*Math.sqrt(1-dx*dx));for(let yb=k.y-hy;yb<=k.y+hy;yb++)set(x,yb,yb<k.y-hy/3?Cs:Cw)}}}
 else if(th.mus===2){const mh=new Float32Array(SW);for(let x=0;x<SW;){const w=20+rr()*50|0,h=rr()<.65?R(10+rr()*16):0;for(let k=0;k<w&&x<SW;k++,x++)mh[x]=h}
  const Mc=[Q('#e89858'),Q('#c06838'),Q('#a85430'),Q('#80402a')],Dc=[Q('#f8d088'),Q('#e8b868'),Q('#d8a058')];
  for(let x=0;x<SW;x++){const h=mh[x],edge=mh[(x+1)%SW]<h||mh[(x+2)%SW]<h;for(let yb=0;yb<h;yb++)set(x,yb,yb>=h-R(2)?Mc[0]:edge?Mc[3]:yb%5===0?Mc[2]:Mc[1]);
   const hd=R(6+3*per(x,6,0)+2*per(x,13,1));for(let yb=0;yb<hd;yb++)set(x,yb,yb>=hd-1?Dc[0]:yb<hd*.4&&X.dither(x,yb,.5)?Dc[2]:Dc[1])}}
 else if(th.mus===3){const pk=[...Array(9)].map(()=>({c:rr()*SW,h:R(16+rr()*20),s:.8+rr()*.6})),Mc=[Q('#b0c0e0'),Q('#7888b0'),Q('#f4f8ff'),Q('#d0dcf0')],Pc=[Q('#2a7444'),Q('#1c5c30')];
  const tr=[];for(let x=0;x<SW;x+=5+(rr()*4|0))tr.push({x,h:R(5+rr()*6)});
  for(let x=0;x<SW;x++){let best=0,bp=null;for(const p of pk){const v=p.h-wd(x,p.c)*p.s;if(v>best){best=v;bp=p}}
   if(bp){const left=((x-bp.c)%SW+SW)%SW>SW/2;for(let yb=0;yb<best;yb++)set(x,yb,yb>bp.h*.62?Mc[left?2:3]:Mc[left?0:1])}
   for(const t of tr){const d=Math.abs(x-t.x);if(d>t.h/2)continue;const ht=t.h-d*2;for(let yb=0;yb<ht;yb++)set(x,yb,x<t.x?Pc[0]:Pc[1])}}}
 else{const Fc=[Q('#1a1030'),Q('#3a2468')],Nc=[Q('#241640'),Q('#4a2c80')],Wc=['#ffd070','#60e0ff','#f070c0'].map(Q);
  for(const[L,mn,mx,wmin,wmax]of[[0,10,32,6,14],[1,6,22,8,20]]){for(let x=0;x<SW;){const w=wmin+rr()*(wmax-wmin)|0,h=R(mn+rr()*(mx-mn));
    for(let k=0;k<w&&x<SW;k++,x++)for(let yb=0;yb<h;yb++){let col=L?Nc[0]:Fc[0];
     if(L&&yb===h-1)col=Nc[1];else if(k%3===1&&yb%3===1&&yb<h-2&&hash(x,yb+L*99)<(L?.35:.2))col=L?Wc[hash(yb,x)*3|0]:Fc[1];set(x,yb,col)}
    x+=L?0:1}}}
 g.putImageData(im,0,0);return c})}
// a few rows of haze where the floor meets the sky (hides the far-texture shimmer)
function hazeImg(th,w){return cache('hz'+th.mus+'/'+w,()=>{const c=X.mk(w,5),g=c.getContext('2d');g.fillStyle=th.hz;
 for(let y=0;y<5;y++)for(let x=0;x<w;x++)if(y<2||X.dither(x,y,[1,1,.6,.35,.15][y]))g.fillRect(x,y,1,1);return c})}
function inkImg(w,h){return cache('ink'+w+'/'+h,()=>{const c=X.mk(w,h),g=c.getContext('2d'),rr=RA.util.mulberry(5),bl=[...Array(8)].map(()=>({x:w*(.1+rr()*.8),y:h*(.25+rr()*.6),r:h*(.1+rr()*.08)}));
 const im=g.createImageData(w,h),o=new Uint32Array(im.data.buffer),ink=C32('#160a28');
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(const b of bl){const d=Math.hypot(x-b.x,(y-b.y)*1.2)/b.r;if(d<1||d<1.25&&X.dither(x,y,(1.25-d)*4)){o[y*w+x]=ink;break}}g.putImageData(im,0,0);return c})}
const cams=[];
// one camera view: sky, horizon strip, Mode 7 floor, depth-sorted sprites, then this kart's HUD
function view(g,p,vx,vy,vw,vh,ci,many){const th=MAP.th;let cam=cams[ci];if(!cam||cam.p!==p.i){cam=cams[ci]={p:p.i,a:p.a}}
 const pf=flags(p);cam.a=wrapA(cam.a+wrapA(p.a-cam.a)*(pf&16?.03:pf&8?.16:.2));
 const sc=vh/171,F=CAM.F*sc,H=CAM.H,D=CAM.D,hor=Math.round(vh*CAM.hor),[cfx,cfz]=fwd(cam.a),cx=p.x-cfx*D,cz=p.z-cfz*D,ca=Math.cos(cam.a),sa=Math.sin(cam.a);
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 g.drawImage(skyImg(th,vw,hor),vx,vy);
 const sx=vx+vw/2+wrapA(cam.a-2.2)*F;if(Math.abs(sx-vx-vw/2)<vw)blit(g,th.night?MOON():SUN(),sx,vy+hor*.32,sc<.7?.5:1,.5,.5);
 const SW=Math.round(2*Math.PI*F),st=stripImg(th,SW,sc);let ox=Math.round(((vw/2+cam.a*F)%SW+SW)%SW-SW);for(;ox<vw;ox+=SW)g.drawImage(st,vx+ox,vy+hor-st.height);
 RA.fx.floor7(g,MAP.tex,{x:cx,z:cz,angle:cam.a,height:H,fov:F,horizon:hor},vx,vy,vw,vh);
 g.drawImage(hazeImg(th,vw),vx,vy+hor);
 const PJ=(x,z)=>{const dx=x-cx,dz=z-cz,f=-dx*sa+dz*ca;if(f<4)return null;const r=dx*ca+dz*sa,s=F/f;return{x:vx+vw/2+r*s,y:vy+hor+H*s,s,f,k:D*sc/f}};
 const L=[],lim=vw/2+30;
 for(const pr of MAP.props){const q=PJ(pr.x,pr.z);if(!q||q.f>620||Math.abs(q.x-vx-vw/2)>lim+q.s*40)continue;L.push([q.f,0,pr,q])}
 for(const b of boxes){if(b.t>0||b.lt>0)continue;const q=PJ(b.x,b.z);if(q&&q.f<600)L.push([q.f,1,b,q])}
 for(const o of oils){if(o.gone)continue;const q=PJ(o.x,o.z);if(q&&q.f<500)L.push([q.f+40,2,o,q])}
 for(const j of proj){const q=PJ(j.x,j.z);if(q&&q.f<600)L.push([q.f,3,j,q])}
 for(const k of karts){const q=PJ(k.x,k.z);if(q&&q.f<700)L.push([q.f,4,k,q])}
 for(const t of parts){const q=PJ(t.x,t.z);if(q&&q.f<260)L.push([q.f-.5,5,t,q])}
 L.sort((a,b)=>b[0]-a[0]);
 for(const[,ty,o,q]of L){
  if(ty===0)blit(g,wSpr(o.k,o.fl|0),q.x,q.y+1,q.k*PS[o.k]*(o.sc||1));
  else if(ty===1){const sp=Math.abs(Math.cos(K.tick*.05+o.id*.7)),c=wSpr('box',0),kk=q.k*1.5,w=Math.max(1,Math.round(c.width*kk*Math.max(.2,sp))),h=Math.max(1,Math.round(c.height*kk)),up=Math.round((5+Math.sin(K.tick*.08+o.id))*q.s);
   g.globalAlpha=.35;blit(g,SHADOW(),q.x,q.y,kk*.5,.5,.5);g.globalAlpha=1;g.drawImage(c,Math.round(q.x-w/2),Math.round(q.y-up-h),w,h)}
  else if(ty===2)blit(g,wSpr('puddle',0),q.x,q.y,q.k*1.5,.5,.5);
  else if(ty===3){const kk=q.k*1.3;g.globalAlpha=.35;blit(g,SHADOW(),q.x,q.y,kk*.45,.5,.5);g.globalAlpha=1;
   if(o.k===4)blit(g,wSpr('ball',0),q.x,q.y-Math.abs(Math.sin(K.tick*.2+o.id))*3*q.s,kk);else blit(g,wSpr('rocket',0),q.x,q.y-3*q.s,kk)}
  else if(ty===4)drawKart(g,o,q,cam.a,p,PJ,many);
  else{const z=Math.max(1,Math.round((o.sz||1)*q.k*2*(o.smoke?Math.min(1,o.t/10):1)));if(o.smoke&&o.t<6&&(K.tick&1))continue;g.fillStyle=o.col;g.fillRect(Math.round(q.x-z/2),Math.round(q.y-o.y*q.s-z/2),z,z)}}
 hud(g,p,vx,vy,vw,vh,many);
 g.restore()}
const RAINBOW=['#f05050','#f0c020','#88dc48','#30c8e0','#b080f0'];
function drawKart(g,k,q,camA,me,PJ,many){const fl=flags(k),kk=q.k*(fl&32?.6:1),dr=fl&8?(fl&512?-1:1):0,spin=fl&16?K.tick*.45+k.i:0;
 const rel=wrapA(k.a+spin+dr*.35-camA),n=Math.min(4,Math.round(Math.abs(rel)/(Math.PI/4))),vw=['back','bq','side','fq','front'][n],flip=rel>0&&n>0&&n<4?1:0;
 const col=fl&1?RAINBOW[(K.tick>>2)%5]:k.col,c=kartSpr(col,vw,((k.odo||0)/3|0)&1,flip),up=k.vh>0?Math.sin(k.vh/10*Math.PI)*2.2*q.s:0;
 g.globalAlpha=.4;blit(g,SHADOW(),q.x,q.y,kk,.5,.5);g.globalAlpha=k.out?.4:1;
 const h=blit(g,c,q.x,q.y-up,kk);g.globalAlpha=1;
 if(fl&4&&n<=2){const ex=[[0,-5],[-11,-7],[-16,-8]][n],sx=flip?-ex[0]:ex[0];blit(g,flameSpr((K.tick>>1)&1),q.x+sx*kk,q.y-up+ex[1]*kk,kk*1.3,.5,.5)}
 if(fl&2&&(K.tick>>2)%6){g.globalAlpha=.75;blit(g,RING(),q.x,q.y-up-h*.45,kk,.5,.5);g.globalAlpha=1}
 if(BAT&&!k.out){const b=wSpr('balloon',0,k.col);for(let j=0;j<k.bal;j++){const bx=q.x+(j-(k.bal-1)/2)*9*kk,by=q.y-up-h-3*kk-Math.sin(K.tick*.06+j)*kk;
   g.fillStyle=P.G;g.fillRect(Math.round(bx),Math.round(by),1,Math.max(1,Math.round(3*kk)));blit(g,b,bx,by,kk)}}
 if(k!==me&&karts.length>1&&!K.demo&&q.f<80&&!many)X.text(g,(k.name||'').slice(0,8),q.x,q.y-up-h-(BAT?16*kk:3)-8,{col:k.col,align:'center',outline:P.k})}
const tm=t=>{t=Math.max(0,t);const s=t/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor(s*100)%100).padStart(2,'0')};
const PLC=['#fff07c','#e8e4dc','#ffa040'];
function hud(g,p,vx,vy,vw,vh,many){const f=p.fx||{},top=vy+(vy<4?14:3),TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{}));
 const mine=p.i===K.myIdx||!K.isClient()&&K.seats[p.i]&&K.seats[p.i].ctrl!=='cpu'&&K.seats[p.i].ctrl!=='net';
 if(f.ink>0&&mine){const im=inkImg(vw,vh);if(f.ink>50||(K.tick>>1)&1)g.drawImage(im,vx,vy)}
 // countdown lights, then GO
 if(K.tick<CD+40){const nl=K.tick<CD?Math.min(3,Math.floor(K.tick/(CD/4))):4,cx=Math.round(vx+vw/2),cy=Math.round(vy+vh*.24);
  g.fillStyle=P.k;g.fillRect(cx-23,cy-8,46,16);g.fillStyle=P.K;g.fillRect(cx-22,cy-7,44,14);
  for(let j=0;j<3;j++)g.drawImage(LAMP(nl>=4?'#50e070':nl>j?'#f05050':'#4a1820'),cx-20+j*15,cy-5);
  if(nl>=4)TX('GO!',cx,cy+12,{col:'#88dc48',align:'center',scale:2});
  else if(!many&&!K.demo)TX(p.auto?'HOLD FIRE AT GO = ROCKET START':'HOLD W AT GO = ROCKET START',cx,cy+12,{col:'#e8e4dc',align:'center'});
  if(mine&&p===karts[K.myIdx>=0?K.myIdx:0]){if(K.tick%(CD/4|0)===0&&K.tick<CD&&K.tick>0)RA.audio.blip(440);if(K.tick===CD)RA.audio.blip(880)}}
 if(K.demo){TX('TURBO KARTS',vx+vw/2,vy+vh-14,{col:'#fff07c',align:'center',scale:2});return}
 // lap + time (or balloons), top left
 if(BAT){TX(p.out?'OUT':p.bal+' BALLOON'+(p.bal===1?'':'S'),vx+4,top,{col:p.out?'#f05050':'#ffffff'});TX('HITS '+p.hits,vx+4,top+9,{col:'#fff07c'})}
 else{TX('LAP',vx+4,top,{col:'#9a94a8'});TX(Math.max(1,Math.min(K.S.laps,p.lap))+'/'+K.S.laps,vx+24,top,{col:'#ffffff'});TX(tm(p.fin?p.ft:K.tick-CD),vx+4,top+9,{col:'#a0f0ff'})}
 // place, bottom right
 const pl=p.place||1,pc=PLC[pl-1]||'#ffffff',suf=ord(pl).replace(/^\d+/,''),big=many?2:3;
 const pw=X.tw(pl+'',big);TX(pl+'',vx+vw-6-12-pw,vy+vh-7*big-4,{col:pc,scale:big});TX(suf,vx+vw-5-11,vy+vh-7*big-4,{col:pc});
 if(mine&&K.tick>=CD){// item slot, top centre
  const ix=Math.round(vx+vw/2),iy=top-2;g.fillStyle=P.k;g.fillRect(ix-13,iy,26,22);g.fillStyle=P.G;g.fillRect(ix-12,iy+1,24,20);g.fillStyle=P.K;g.fillRect(ix-11,iy+2,22,18);
  const ik=p.roul>0?1+(Math.floor(K.tick/3)%9):p.item;if(ik&&ITEMS[ik])g.drawImage(iconSpr(ik),ix-8,iy+4);
  if(p.item&&p.cnt>1&&!(p.roul>0))TX('x'+p.cnt,ix+15,iy+12,{col:'#ffffff'});
  const ef=[['boost',80,'#ffa040'],['star',420,'#fff07c'],['shrink',300,'#f070c0']].filter(e=>f[e[0]]>0);
  ef.forEach((e,j)=>{const y=iy+24+j*3;g.fillStyle=P.k;g.fillRect(ix-12,y,24,2);g.fillStyle=e[2];g.fillRect(ix-12,y,Math.ceil(24*Math.min(1,f[e[0]]/e[1])),2)});
  // hints for the first seconds of the race
  const t=K.tick-CD;if(!many&&!BAT&&t>60&&t<60*9&&!p.fin)TX(p.auto?'DRIFT: HOLD A TURN':'SHIFT / E IN A TURN = DRIFT',vx+vw/2,top+30,{col:'#e8e4dc',align:'center'});
  if(!many&&!BAT&&t>=60*9&&t<60*13&&!p.fin)TX('LET GO ON ORANGE SPARKS = TURBO',vx+vw/2,top+30,{col:'#ffa040',align:'center'});
  if(p.wrong>40&&!p.fin&&(K.tick>>4)&1)TX('WRONG WAY!',vx+vw/2,vy+vh*.42,{col:'#f05050',align:'center',scale:2});
  if(p.fin&&!BAT)TX(ord(p.fin)+' - FINISHED',vx+vw/2,vy+vh*.3,{col:p.fin<=3?'#fff07c':'#ffffff',align:'center',scale:many?1:2});
  const tx=texts.filter(t=>t.own===p.i).pop();if(tx&&!p.fin)TX(tx.s,vx+vw/2,vy+vh*.36,{col:tx.col,align:'center',scale:many||tx.s.length>12?1:2})}
 // minimap + standings
 if(!many&&MAP){const mx=vx+4,my=vy+vh-68;g.drawImage(MAP.mini,mx,my);
  for(const k of karts){if(k.out)continue;const x=Math.round(mx+k.x/16),y=Math.round(my+k.z/16);g.fillStyle=P.k;g.fillRect(x-1,y-1,3,3);g.fillStyle=k.col;g.fillRect(x,y,1,1)}
  {const x=Math.round(mx+p.x/16),y=Math.round(my+p.z/16);g.fillStyle=(K.tick>>3)&1?'#ffffff':p.col;g.fillRect(x-1,y-1,3,3)}
  for(const b of proj){g.fillStyle=b.k===5?'#f05050':'#88dc48';g.fillRect(Math.round(mx+b.x/16),Math.round(my+b.z/16),1,1)}
  const ord2=karts.slice().sort((a,b)=>a.place-b.place),mi=ord2.indexOf(p),pick=new Set([0,1,2,mi-1,mi,mi+1].filter(j=>j>=0&&j<ord2.length));let list=[...pick].sort((a,b)=>a-b).map(j=>ord2[j]);
  list.forEach((k,j)=>{const y=top+21+j*8;if(k===p){g.fillStyle=P.K;g.fillRect(vx+2,y-1,64,9)}g.fillStyle=P.k;g.fillRect(vx+3,y,6,7);g.fillStyle=k.col;g.fillRect(vx+4,y+1,4,5);
   if(j&&list[j-1].place<k.place-1){g.fillStyle=P.G;g.fillRect(vx+5,y-2,2,1)}TX(k.place+' '+(k.name||'').slice(0,6),vx+11,y,{col:k.out?'#5c566c':'#ffffff',outline:false,shadow:P.k});
   const tag=BAT?k.bal+'':k.fin?'*':'';if(tag)TX(tag,vx+64,y,{col:'#fff07c',align:'right',outline:false})})}}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);
 if(!MAP){SCR.present(ctx,W,H);return}
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=karts.slice().sort((a,b)=>a.place-b.place).find(k=>!k.out)||karts[0];fs=lead?[K.demo?karts[(Math.floor(K.tick/600))%karts.length].i:lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length,w=SCR.w,h=SCR.h-(K.demo?0:9);
 const rects=n<=1?[[0,0,w,h]]:n===2?[[0,0,w,h>>1],[0,h>>1,w,h-(h>>1)]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];
 fs.forEach((i,k)=>{const r=rects[k];view(g,karts[i],r[0],r[1],r[2],r[3],k,n>1)});
 if(n>1){g.fillStyle=P.k;if(n===2)g.fillRect(0,(h>>1)-1,w,2);else{g.fillRect((w>>1)-1,0,2,h);g.fillRect(0,(h>>1)-1,w,2)}}
 if(n===3){const mx=(w>>1)+((w-(w>>1))>>1)-32,my=(h>>1)+((h-(h>>1))>>1)-32;g.drawImage(MAP.mini,mx,my);for(const k of karts){if(k.out)continue;g.fillStyle=k.col;g.fillRect(Math.round(mx+k.x/16)-1,Math.round(my+k.z/16)-1,2,2)}}
 SCR.present(ctx,W,H);engineSound()}
// engine note for the kart you're driving
let engine=null;
function engineSound(){const AC=RA.audio.ctx,me=K.demo||K.state!=='play'?null:karts[K.myIdx>=0?K.myIdx:K.seats.findIndex(s=>s.ctrl!=='cpu'&&s.ctrl!=='net')];
 if(!AC)return;if(!me||RA.menu.current&&RA.menu.current.id!=='karts'){if(engine)engine.g.gain.setTargetAtTime(0,AC.currentTime,.05);return}
 if(!engine){const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=600;g.gain.value=0;
  o.connect(f);o2.connect(f);f.connect(g);g.connect(AC.destination);o.start();o2.start();engine={o,o2,g}}
 const V=RA.audio.vol,fl=flags(me),vol=V.mute?0:.03*V.master/100*V.sfx/100,fr=50+Math.abs(me.sp)*26+(fl&4?18:0)+(fl&8?6:0);
 engine.o.frequency.setTargetAtTime(fr,AC.currentTime,.06);engine.o2.frequency.setTargetAtTime(fr*.5,AC.currentTime,.06);engine.g.gain.setTargetAtTime(vol,AC.currentTime,.08)}
let SCR=null;
K=RA.kit({id:'karts',name:'TURBO KARTS',kind:'Kart racing',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Pixel-art kart racing for up to 20 with a Mode 7 chase camera: drift through the bends for blue and orange mini-turbos, grab ? boxes, fire rockets and bouncers, or pop balloons in battle mode. Split screen for local players.',
 blurb:'Your kart accelerates by itself: A / D steer, S brakes, Shift / E drift (let go on orange sparks for a turbo), Space or click uses your item. Hold W as the lights go green for a rocket start.',
 howto:'The kart accelerates by itself. A / D steer, S brakes, W held at the green light = rocket start, Shift or E (right-click) drifts, Space or click uses an item (hold S to throw it back). Gamepad: stick steers, B / RB drift, A item.',
 icon:['..........','....kkk...','...kwwk...','.kkrrrrkk.','krrrrrrrrk','krrkrrkrrk','kkkskkkskk','.kkk..kkk.','..........','..........'],
 music:MUSIC,fireLabel:'ITEM',
 modes:[['RACE','Everyone for themselves.'],['TEAM RACE','Red vs blue: points for every finishing place.'],['BALLOON BATTLE','Arena: pop balloons, last kart rolling wins.'],['TEAM BATTLE','Arena, red vs blue balloons.']],
 settings:[['track','Track',[['rnd','Random track'],[0,'Sunny Circuit'],[1,'Dune Canyon'],[2,'Frosty Peaks'],[3,'Neon City']]],['laps','Laps',[[3,'3 laps'],[2,'2 laps'],[5,'5 laps'],[1,'1 lap']]],
  ['items','Items',[['on','Kart items'],['party','Wild party'],['boost','Boosts only'],['off','Off']]],['len','Time limit',[[0,'None'],[3,'3 min'],[5,'5 min']]]],
 kb:[['S','brake'],['W','rocket start'],['A D','steer'],['SHIFT E','drift'],['SPACE LMB','item'],['C','chat'],['ESC','menu']],pad:[['LS','steer'],['B RB','drift'],['A','item'],['DP','brake'],['START','menu']],
 ach:[{id:'first',name:'Green Flag',desc:'Finish your first race',test:s=>s.played>=1,unlock:'title:Rookie Racer'},{id:'win1',name:'Chequered Flag',desc:'Win a race or battle',test:(s,m)=>m.won,unlock:'title:Champion'},
  {id:'pod5',name:'Podium Regular',desc:'5 podium finishes',test:s=>s.podiums>=5,unlock:'title:Podium Regular'},{id:'turbo',name:'Drift King',desc:'10 orange mini-turbos in one race',test:(s,m)=>m.turbos>=10,unlock:'title:Drift King'},
  {id:'hit5',name:'Sharpshooter',desc:'Hit 5 karts in one match',test:(s,m)=>m.kills>=5,unlock:'title:Sharpshooter'}],
 alive:i=>!!karts[i]&&!karts[i].out,out:i=>!!karts[i]&&(karts[i].out||!BAT&&!!karts[i].fin&&K.state!=='play'),
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>MAP?(BAT?'Arena':TRACKS[trackNo].n):'',
 ranks:()=>karts.slice().sort((a,b)=>a.place-b.place).map(p=>[p.name,p.col,BAT?(p.out?'out':p.bal+' balloons')+' · '+p.hits+' hits':p.fin?tm(p.ft):'lap '+Math.max(1,Math.min(K.S.laps,p.lap))]),
 result:(i,w)=>{const p=karts[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:p.hits,podiums:!BAT&&p.place<=3?1:0,turbos:p.turbos|0}}});
window.__tk={get karts(){return karts},get map(){return MAP},K,bot:i=>bot(i)};
})();
