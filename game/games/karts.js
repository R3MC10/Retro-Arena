/* TURBO KARTS for Retro Arena: kart racing for up to 20 with a Mode 7 chase camera, like the 16 and 32-bit kart games.
   The track is a textured perspective floor (RA.fx.floor); karts, trees and item boxes are pre-rendered shaded models
   (RA.fx.model) seen from 16 angles. Local players get split screen (up to 4 views).
   W / S gas and brake (touch and gamepad accelerate on their own), A / D steer, Shift or E (right-click) hops into a drift:
   hold it through a bend until the sparks turn blue, then orange, and let go for a mini-turbo. Space or click uses your item,
   hold S while using it to throw it backwards. Hold gas just as the lights go green for a rocket start.
   Modes: RACE · TEAM RACE (red vs blue, points by finish place) · BALLOON BATTLE · TEAM BATTLE (arena, 3 balloons, star bumps steal one).
   Items come from ? boxes and depend on your place (the back of the pack gets the strong ones):
    BOOST · TRIPLE BOOST · OIL SLICK · BOUNCER (bounces off walls) · ROCKET (homes on the kart ahead) · SHIELD · STAR
    party: INK (blots the screens of everyone ahead) · SHRINK (everyone ahead shrinks and slows down).
   Online is lag-free (RA.kit localFirst): your kart, your drifting, your box pickups and the oil you run over all happen
   on your device at once. The host referees the shared things (boxes, rockets, bouncers, laps and places) and sends
   hits to the kart they hit, which checks its own shield and star. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx,{mix}=RA.util;
const TS=1024,RW=32,CD=210;                       // texture / world size, road half width, countdown steps
const ROAD=0,CURB=1,OFF=2,WALL=3,PAD=4;
const TEAMC=['#f04848','#4890f8'],TEAMN=['Red team','Blue team'];
const ITEMS=[null,{n:'BOOST',c:'#ff9030'},{n:'TRIPLE BOOST',c:'#ff6020',cnt:3},{n:'OIL SLICK',c:'#303040'},{n:'BOUNCER',c:'#30d050'},{n:'ROCKET',c:'#f04040'},
 {n:'SHIELD',c:'#60c0ff'},{n:'STAR',c:'#f8e040'},{n:'INK',c:'#6040a0',party:1},{n:'SHRINK',c:'#e060e0',party:1}];
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
const THEMES={
 sunny:{sky:['#2a64c8','#a8d8f8'],hz:'#c8e4f4',hill:['#3c8a48','#5aa858'],road:[96,96,104],curb:[[232,48,48],[248,248,248]],off:[88,164,64],far:[72,142,56],wall:[48,48,56],props:['tree','tires'],mus:1},
 dune:{sky:['#d8602a','#f8d890'],hz:'#f8e0b0',hill:['#b05a30','#d08048'],road:[150,104,70],curb:[[216,96,32],[248,232,192]],off:[226,186,116],far:[234,198,126],wall:[120,72,40],props:['cactus','rock'],mus:2},
 frost:{sky:['#5880c0','#e0ecf8'],hz:'#eef4fc',hill:['#a8b8d8','#f0f4fc'],road:[140,160,190],curb:[[48,112,224],[248,248,248]],off:[232,240,250],far:[216,228,246],wall:[90,100,130],props:['pine','snowman'],ice:1,mus:3},
 neon:{sky:['#06030f','#3a1060'],hz:'#5a2080',hill:['#160a2a','#22103e'],road:[40,36,62],curb:[[255,64,192],[64,232,255]],off:[26,20,44],far:[18,14,32],wall:[90,30,120],props:['lamp','cone'],night:1,mus:4}};
const TRACKS=[
 {n:'SUNNY CIRCUIT',th:'sunny',pts:[[200,180],[520,140],[820,190],[880,420],[700,520],[760,760],[600,880],[300,860],[160,640],[300,470],[160,330]]},
 {n:'DUNE CANYON',th:'dune',pts:[[150,500],[220,200],[450,150],[560,330],[700,160],[880,260],[860,560],[650,600],[860,800],[560,900],[280,820]]},
 {n:'FROSTY PEAKS',th:'frost',pts:[[160,150],[860,150],[880,300],[300,310],[300,450],[860,450],[880,610],[300,620],[300,760],[860,760],[880,900],[140,900],[100,520]]},
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
function build(no,battle){const key=battle?'b'+no:'t'+no;if(BUILT[key])return BUILT[key];
 const tr=TRACKS[no],th=THEMES[tr.th],D=new Float32Array(TS*TS).fill(1e9),I=new Uint16Array(TS*TS),surf=new Uint8Array(TS*TS),side=new Int8Array(TS*TS);
 let path=[],N=0;
 if(!battle){path=spline(tr.pts);N=path.length;const R=RW+30;
  path.forEach((s,i)=>{const cx=Math.round(s.x),cz=Math.round(s.z);for(let dz=-R;dz<=R;dz++){const y=cz+dz;if(y<0||y>=TS)continue;
   for(let dx=-R;dx<=R;dx++){const x=cx+dx;if(x<0||x>=TS)continue;const d2=dx*dx+dz*dz;if(d2>R*R)continue;const q=y*TS+x;
    if(d2<D[q]){D[q]=d2;I[q]=i;side[q]=(dx*s.nx+dz*s.nz)>=0?1:-1}}}})}
 else{// arena: a rounded square with four pillars
  for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const q=y*TS+x,ex=Math.max(0,Math.abs(x-512)-250),ez=Math.max(0,Math.abs(y-512)-250);let d=Math.hypot(ex,ez)-110+RW;
   for(const[px,pz]of[[372,372],[652,372],[372,652],[652,652]]){const pd=RW+20+30-Math.hypot(x-px,y-pz);if(pd>d)d=pd}
   D[q]=d<0?0:d*d}}
 const pads=new Set();if(!battle){// boost pads on the straightest bits
  const curv=path.map((s,i)=>Math.abs(wrapA(path[(i+12)%N].a-path[(i-12+N)%N].a)));
  for(let k=0;k<3;k++){let best=-1,bv=9;for(let i=0;i<N;i+=3){const ok=[...pads].every(j=>Math.min(Math.abs(j-i),N-Math.abs(j-i))>N/5);if(ok&&curv[i]<bv&&i>N*.08){bv=curv[i];best=i}}if(best>=0)for(let j=0;j<5;j++)pads.add((best+j)%N)}}
 const tex=document.createElement('canvas');tex.width=tex.height=TS;const tg=tex.getContext('2d'),im=tg.createImageData(TS,TS),px=im.data;
 for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const q=y*TS+x,d=Math.sqrt(D[q]),i=I[q],n=hash(x,y),b=BAY[(y&3)*4+(x&3)]/16-.5,
   lf=Math.sin(x*.021)*Math.sin(y*.017)*.06+Math.sin((x+y)*.009)*.05;let c,s;
  if(d<RW){s=ROAD;c=th.road;let k=.94+n*.08+lf*.5;
   if(!battle&&(i<=2||i>=N-1)){c=(((x>>2)+(y>>2))&1)?[248,248,248]:[24,24,24];k=1}
   else if(pads.has(i)&&d<14){s=PAD;const st=((i*4+Math.round(d*.5))>>2)&1;c=st?[255,200,40]:[255,120,30];k=1+n*.05}
   else if(battle){if(((x>>5)+(y>>5))&1)k*=.9}
   else if(d>RW-3)k*=.82;else if(d<1.2&&(i>>2)&1)c=th.night?[200,90,255]:[230,230,230];
   if(th.night&&d>RW-5&&d<RW-3)c=th.curb[(i>>3)&1];
   c=c.map(v=>v*k)}
  else if(d<RW+5){s=CURB;c=th.curb[(battle?((x+y)>>4):(i>>1))&1].map(v=>v*(.92+n*.08))}
  else if(d<RW+20){s=OFF;c=th.off.map(v=>v*(.9+n*.12+lf))}
  else if(d<RW+25){s=WALL;const st=battle?((x+y)>>3)&1:(i>>1)&1;c=th.wall.map(v=>v*(st?1:.7)*(.9+n*.1))}
  else{s=WALL;c=th.far.map(v=>v*(.88+n*.14+lf*1.5));
   if(th.night&&hash(x>>3,y>>3)<.06&&(x&7)>2&&(y&7)>2)c=[255,220,120].map(v=>v*(.6+n*.4));
   else if(!th.night&&hash(x>>2,y>>2)<.02)c=th.ice?[255,255,255]:tr.th==='dune'?[200,150,90]:[248,220,80]}
  surf[q]=s;const o=q*4;px[o]=Math.max(0,Math.min(255,c[0]+b*8));px[o+1]=Math.max(0,Math.min(255,c[1]+b*8));px[o+2]=Math.max(0,Math.min(255,c[2]+b*8));px[o+3]=255}
 tg.putImageData(im,0,0);
 // minimap
 const mini=document.createElement('canvas');mini.width=mini.height=128;const mg=mini.getContext('2d'),mi=mg.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const s=surf[(y*8+4)*TS+x*8+4],o=(y*128+x)*4;if(s<=CURB||s===PAD){mi.data[o]=mi.data[o+1]=mi.data[o+2]=235;mi.data[o+3]=230}}
 mg.putImageData(mi,0,0);
 // props: barriers along the track, scenery behind them
 const rr=RA.util.mulberry(no*977+(battle?5:1)),props=[];
 const free=(x,z,m)=>x>8&&z>8&&x<TS-8&&z<TS-8&&Math.sqrt(D[(z|0)*TS+(x|0)])>=m;
 if(!battle)for(let i=0;i<N;i+=6)for(const sd of[-1,1]){const s=path[i],x=s.x+s.nx*sd*(RW+23),z=s.z+s.nz*sd*(RW+23);if(free(x,z,RW+21))props.push({x,z,k:th.props[1]})}
 else{for(let a=0;a<6.283;a+=.07){const x=512+Math.cos(a)*400,z=512+Math.sin(a)*400;if(free(x,z,RW+21))props.push({x,z,k:th.props[1]})}
  for(const[px,pz]of[[372,372],[652,372],[372,652],[652,652]]){props.push({x:px,z:pz,k:th.props[0],sc:1.4});for(let a=0;a<6.283;a+=.45)props.push({x:px+Math.cos(a)*26,z:pz+Math.sin(a)*26,k:th.props[1]})}}
 for(let k=0;k<300;k++){const x=rr()*TS,z=rr()*TS;if(free(x,z,RW+34))props.push({x,z,k:th.props[0],sc:.8+rr()*.5})}
 // item box rows
 const bx=[];if(!battle)for(const f of[.16,.4,.64,.86]){const s=path[Math.floor(f*N)];for(const o of[-20,-10,0,10,20])bx.push({x:s.x+s.nx*o,z:s.z+s.nz*o})}
 else for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++)if((gx+gz)&1||!gx&&!gz)bx.push({x:512+gx*120,z:512+gz*120});
 return BUILT[key]={no,th,tr,path,N,tex,surf,I,side,mini,props,bx,battle}}
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
   gs:-1,lane:(rr()-.5)*30,wrong:0,bump:{},turbos:0,auto:s.ctrl==='touch'||/^gp/.test(s.ctrl)||s.ctrl==='me'&&(RA.util.touchDev||Object.keys(RA.input.pad(0)).length>0)}});
 cams.length=0}

/* ---------- your own kart (runs on its owner's device) ---------- */
function drive(p,inp){const f=p.fx;for(const k in f)if(f[k]>0&&k!=='shield')f[k]--;if(p.roul>0)p.roul--;if(p.hop>0)p.hop--;
 if(p.out){p.sp*=.95;return}
 const gas=(inp.up||p.auto&&!inp.down)&&!inp.down;
 if(K.tick<CD){if(gas){if(p.gs<0)p.gs=K.tick}else p.gs=-1;return}
 if(K.tick===CD&&p.gs>=CD-28){f.boost=70;sfx('boost');say(p,'ROCKET START!','#f8d040')}
 let steer=(inp.left?1:0)-(inp.right?1:0);if(inp.ax&&Math.abs(inp.ax)>.15)steer=-inp.ax;
 if(f.spin>0){p.sp*=.95;p.vis+=.4;move(p,p.va);return}
 p.vis*=.8;
 const s=surfAt(p.x,p.z),cpu=K.seats[p.i]&&K.seats[p.i].ctrl==='cpu';
 let max=3*(f.shrink>0?.72:1);if(cpu)max*=[.88,.96,1.01][K.cpu]+(BAT?0:(p.place-1)/Math.max(1,karts.length)*.07);
 if(f.star>0)max=3.7;if(f.boost>0)max=4.4;if(s===OFF&&!(f.star>0||f.boost>0))max*=.5;
 if(s===PAD&&!(f.boost>20)){f.boost=50;sfx('boost')}
 if(gas){if(p.sp<max)p.sp=Math.min(max,p.sp+.055*(1.15-p.sp/max));else p.sp+=(max-p.sp)*.05}
 else if(inp.down)p.sp=p.sp>0?p.sp-.1:Math.max(-1.2,p.sp-.04);else p.sp*=.985;
 // drift: hop in while steering, hold through the bend, let go for a mini-turbo
 p.held=steer?(p.held|0)+1:0;const dr=inp.alt||inp.b4||(p.auto&&p.held>30&&p.sp>2.4);
 if(dr&&!p.drift&&!p.dHeld&&steer&&p.sp>1.6){p.drift=steer>0?1:-1;p.dc=0;p.hop=8}
 p.dHeld=dr;
 if(p.drift&&(!dr||p.sp<1.2)){if(p.dc>150){f.boost=75;p.turbos++;sfx('boost')}else if(p.dc>75){f.boost=40;sfx('boost')}p.drift=0;p.dc=0}
 let turn;
 if(p.drift){const same=steer*p.drift>0;turn=p.drift*(.036+(same?.02:steer?-.015:0));p.dc+=same?1.6:1}
 else turn=steer*.045*Math.min(1,Math.abs(p.sp)/1.2)*(p.sp<0?-1:1)*(f.shrink>0?1.1:1);
 p.a=wrapA(p.a+turn);
 const grip=p.drift?.07:MAP.th.ice?.12:.24;p.va=wrapA(p.va+wrapA(p.a-p.va)*grip);
 move(p,p.va)}
function move(p,ang){const[fx,fz]=fwd(ang),nx=p.x+fx*p.sp,nz=p.z+fz*p.sp,r=4;
 if(!solid(nx,nz,r)){p.x=nx;p.z=nz;return}
 if(Math.abs(p.sp)>2.2)knock(p);
 if(!solid(nx,p.z,r)){p.x=nx;p.sp*=.9}else if(!solid(p.x,nz,r)){p.z=nz;p.sp*=.9}else p.sp*=-.35}
function knock(p){if(p.kn&&K.tick-p.kn<20)return;p.kn=K.tick;sfx('shot');for(let k=0;k<6;k++)parts.push({x:p.x,z:p.z,y:3,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,vy:Math.random()*1.5,t:20,col:'#f8e8a0'})}
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
 if(k==='b'){const b=boxes[id];if(!b||b.t>0)return;b.t=300;if(!p.item){p.item=roll(p);p.cnt=ITEMS[p.item].cnt||1;if(owned(p))p.roul=Math.max(p.roul,45)}}
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
function places(){const order=karts.slice().sort(BAT?(a,b)=>(a.out-b.out)||b.bal-a.bal||b.hits-a.hits:(a,b)=>(a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:b.prog-a.prog));order.forEach((p,k)=>p.place=k+1);
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
function vis(){for(const q of parts){q.x+=q.vx;q.z+=q.vz;q.y=Math.max(0,q.y+q.vy);q.vy-=.08;q.vx*=.96;q.vz*=.96;q.t--}parts=parts.filter(q=>q.t>0);if(parts.length>500)parts.splice(0,parts.length-500);
 for(const t of texts){t.t--;t.y+=.15}texts=texts.filter(t=>t.t>0);
 for(const p of karts){const fl=flags(p);if(fl&8&&K.tick%2===0){const[fx,fz]=fwd(p.a),c=fl&128?'#ff9020':fl&64?'#40a0ff':'#f8f8c0';for(const sd of[-1,1])parts.push({x:p.x-fx*5+fz*sd*4,z:p.z-fz*5-fx*sd*4,y:1,vx:(Math.random()-.5)*.6,vz:(Math.random()-.5)*.6,vy:.6+Math.random(),t:12,col:c,sz:1.5})}
  if(fl&4&&K.tick%2===0){const[fx,fz]=fwd(p.a);parts.push({x:p.x-fx*7,z:p.z-fz*7,y:2,vx:-fx*.5,vz:-fz*.5,vy:.3,t:14,col:'#ffb040',sz:2.5})}
  if(p.sp>1.5&&K.tick%4===0&&surfAt(p.x,p.z)===OFF)parts.push({x:p.x,z:p.z,y:1,vx:(Math.random()-.5),vz:(Math.random()-.5),vy:.5,t:20,col:MAP.th.ice?'#ffffff':'rgb('+MAP.th.off.map(v=>v*.8|0)+')',sz:3})}}
// what everyone sees about a kart: 1 star 2 shield 4 boost 8 drift 16 spin 32 shrink 64 blue sparks 128 orange sparks 256 hop
function flags(p){if(K.isClient()&&p.i!==K.myIdx||K.seats[p.i]&&K.seats[p.i].ctrl==='net'&&!K.isClient())return p.fl|0;const f=p.fx;
 return(f.star>0?1:0)|(f.shield>0?2:0)|(f.boost>0?4:0)|(p.drift?8:0)|(f.spin>0?16:0)|(f.shrink>0?32:0)|(p.drift&&p.dc>75&&p.dc<=150?64:0)|(p.drift&&p.dc>150?128:0)|(p.hop>0?256:0)}

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
 const want=Math.atan2(-(tx-p.x),tz-p.z),d=wrapA(want-p.a),dz=[.08,.05,.03][K.cpu];
 if(d>dz)o.left=true;else if(d<-dz)o.right=true;
 if(K.cpu>=1&&Math.abs(d)>.3&&p.sp>2.2&&!BAT)o.b4=true;if(p.drift&&Math.abs(d)>.08&&d*p.drift>0)o.b4=true;
 if(Math.abs(d)>1.4&&p.sp>1.5){o.up=false;o.down=true}
 if(p.item&&p.roul<=0&&K.tick>CD){const k=p.item,r=Math.random();let use=false;
  if(k===1||k===2||k===7)use=Math.abs(d)<.12&&r<.05;else if(k===6)use=true;else if(k===3)use=karts.some(q=>q!==p&&q.place===p.place+1&&Math.hypot(q.x-p.x,q.z-p.z)<50)||r<.004;
  else if(k===4){const ah=karts.find(q=>q!==p&&!q.out&&Math.hypot(q.x-p.x,q.z-p.z)<90&&Math.abs(wrapA(Math.atan2(-(q.x-p.x),q.z-p.z)-p.a))<.15);use=!!ah||r<.003}
  else use=r<.02;if(use&&(K.tick>>1)&1){o.tap=true;o.fire=true}}
 return o}

/* ---------- drawing ---------- */
const MODELS={};
function kartImg(col,k){const key=col+k;if(MODELS[key])return MODELS[key];
 const rel=k/16*Math.PI*2,c=Math.cos(rel),s=Math.sin(rel),t=.62,ct=Math.cos(t),st=Math.sin(t),lt=mix(col,'#ffffff',.35),dk=mix(col,'#000000',.35);
 const parts3=[[0,-6,3,4,col],[0,-1,3,4.6,col],[0,4,3,4.2,col],[0,8.5,2.6,3,lt],[-4.6,0,2.4,3,dk],[4.6,0,2.4,3,dk],
  [-6,-5.5,2.2,2.7,'#202024'],[6,-5.5,2.2,2.7,'#202024'],[-5.6,5.6,2,2.3,'#202024'],[5.6,5.6,2,2.3,'#202024'],
  [-2,-9.5,3,1.3,'#9a9aa0'],[2,-9.5,3,1.3,'#9a9aa0'],[0,-8,6,1.8,dk],
  [0,-2.5,6.8,2.9,'#e8e0d0'],[0,-2,10.2,3.1,lt],[0,.6,10.4,1.7,'#203048'],[-2.4,1.5,7,1.1,'#f0c8a0'],[2.4,1.5,7,1.1,'#f0c8a0']];
 const balls=parts3.map(([lx,ly,lz,r,cl])=>{const X=lx*c-ly*s,Y=lx*s+ly*c;return{x:12+X,y:12-lz*ct-Y*st,z:-Y*ct+lz*st,r,col:cl,spec:cl==='#203048'?40:18}});
 return MODELS[key]=RA.fx.model(24,22,balls,{amb:.42})}
function propImg(k){if(MODELS['p'+k])return MODELS['p'+k];const B=(x,y,r,col,z,o)=>Object.assign({x,y,r,col,z:z||0},o||{});let w,h,b,wh;
 if(k==='tree'){w=24;h=40;wh=28;b=[B(12,34,2,'#6a4428'),B(12,30,2.2,'#7a5030'),B(12,26,2.2,'#7a5030'),B(8,18,6,'#2a7a30'),B(16,18,6,'#2a7a30'),B(12,12,7,'#3a9a3c'),B(9,8,4.5,'#4aaa48',2),B(15,9,4.5,'#4aaa48',1),B(12,19,6,'#30883a',3)]}
 else if(k==='tires'){w=14;h=18;wh=8;b=[B(7,14,4.5,'#202024'),B(7,9,4.5,'#2a2a2e',1),B(7,4.5,4.3,'#e83838',2)]}
 else if(k==='cactus'){w=18;h=32;wh=20;b=[B(9,28,3,'#3a8a40'),B(9,22,3.2,'#46a04a'),B(9,15,3.2,'#46a04a'),B(9,8,3,'#50b050'),B(4,16,2.2,'#46a04a',1),B(3.5,11,2,'#50b050',1),B(14,19,2.2,'#46a04a',1),B(14.5,14,2,'#50b050',1)]}
 else if(k==='rock'){w=20;h=14;wh=9;b=[B(8,9,5,'#a0786a'),B(13,9,4.5,'#8a6858',1),B(10,6,4,'#b08878',2)]}
 else if(k==='pine'){w=20;h=38;wh=26;b=[B(10,34,2,'#5a3a20'),B(10,28,7,'#1e5a3a'),B(10,21,6,'#24683e'),B(10,14,5,'#2a7444'),B(10,8,3.6,'#30804a'),B(10,4,2.2,'#f8fcff',2),B(7,20,2.4,'#f8fcff',4),B(13,27,2.6,'#f0f6ff',4)]}
 else if(k==='snowman'){w=14;h=26;wh=14;b=[B(7,20,5.5,'#f4f8ff'),B(7,12,4.2,'#f8fbff',1),B(7,6,3.2,'#ffffff',2),B(7,6.5,.9,'#f08020',5),B(5.8,5,.5,'#101010',5),B(8.2,5,.5,'#101010',5),B(7,2.5,2.4,'#202030',1)]}
 else if(k==='lamp'){w=10;h=40;wh=26;b=[B(5,37,2.5,'#40404c'),B(5,30,1.3,'#606070'),B(5,23,1.3,'#606070'),B(5,16,1.3,'#606070'),B(5,9,1.3,'#606070'),B(5,4,3,'#ff60d0',1,{gloss:1})]}
 else{w=10;h=12;wh=6;b=[B(5,9,4,'#f06010'),B(5,6,3,'#f8f8f8',1),B(5,3.5,2,'#f06010',2)]}
 const m=RA.fx.model(w,h,b,{amb:.45});m.wh=wh;m.ww=wh*w/h;return MODELS['p'+k]=m}
function ballImg(col){const k='b'+col;return MODELS[k]||(MODELS[k]=RA.fx.model(12,12,[{x:6,y:6,r:5,col},{x:6,y:7.5,r:3.6,z:2,col:'#f8f8f0'}],{amb:.45}))}
const SKY={};
function skyStrip(th){const key=th.sky.join();if(SKY[key])return SKY[key];const W=528,H=48,c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);
 const rr=RA.util.mulberry(7);
 if(th.night){for(let x=0;x<W;){const bw=10+rr()*22,bh=12+rr()*32;const gr=g.createLinearGradient(0,H-bh,0,H);gr.addColorStop(0,th.hill[1]);gr.addColorStop(1,th.hill[0]);g.fillStyle=gr;g.fillRect(x,H-bh,bw,bh);
   for(let wy=H-bh+3;wy<H-3;wy+=4)for(let wx=x+2;wx<x+bw-2;wx+=4)if(rr()<.35){g.fillStyle=rr()<.5?'#ffd070':'#60e0ff';g.fillRect(wx,wy,1.5,1.5)}x+=bw+1}}
 else for(const[L,amp,base]of[[0,18,20],[1,10,8]]){g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=4){const y=H-base-amp*(.5+.5*Math.sin(x*Math.PI*2/W*(3+L*4)+L))*(.6+.4*Math.sin(x*Math.PI*2/W*(7+L)));g.lineTo(x,y)}
  g.lineTo(W,H);g.closePath();const gr=g.createLinearGradient(0,H-base-amp,0,H);gr.addColorStop(0,mix(th.hill[L],'#ffffff',.25));gr.addColorStop(1,mix(th.hill[L],'#000000',.25));g.fillStyle=gr;g.fill();
  if(th.ice&&L===0){g.fillStyle='rgba(255,255,255,.7)';for(let x=0;x<W;x+=66){g.beginPath();g.arc(x+33,H-base-amp+4,6,0,7);g.fill()}}}
 return SKY[key]=c}
// fast Mode 7 floor: same projection as RA.fx.floor (forward = (-sin a, cos a)), but steps the texture
// coordinates along each row and reads packed 32-bit texels, about 10x quicker; the haze gradient is drawn on top
let FB=null,FC=null;const T32=new WeakMap();
function floor7(g,tex,cx,cz,ang,H,F,hor,x0,y0,w,h){let tx=T32.get(tex);if(!tx){tx=new Uint32Array(tex.getContext('2d').getImageData(0,0,TS,TS).data.buffer);T32.set(tex,tx)}
 const rows=h-hor;if(rows<=0)return;if(!FB||FB.width!==w||FB.height!==rows){FC=FC||document.createElement('canvas');FC.width=w;FC.height=rows;FB=FC.getContext('2d').createImageData(w,rows)}
 const out=new Uint32Array(FB.data.buffer),ca=Math.cos(ang),sa=Math.sin(ang),M=TS-1;let o=0;
 for(let r=0;r<rows;r++){const d=H*F/(r+1),lx=-sa*d,lz=ca*d,rx=ca*d*w/F/2,rz=sa*d*w/F/2;let u=cx+lx-rx,t=cz+lz-rz;const du=2*rx/w,dt=2*rz/w;
  for(let i=0;i<w;i++){out[o++]=tx[(((t|0)&M)<<10)|((u|0)&M)];u+=du;t+=dt}}
 FC.getContext('2d').putImageData(FB,0,0);g.drawImage(FC,x0,y0+hor)}
const cams=[];
// one camera view of the world: sky, Mode 7 road, depth-sorted billboards, then this kart's HUD
function view(g,p,vx,vy,vw,vh,ci,many){const th=MAP.th;let cam=cams[ci];if(!cam||cam.p!==p.i){cam=cams[ci]={p:p.i,a:p.a,x:p.x,z:p.z}}
 cam.a=wrapA(cam.a+wrapA(p.a-cam.a)*(p.fx&&p.fx.spin>0?.04:.16));const back=26,[cfx,cfz]=fwd(cam.a);cam.x=p.x-cfx*back;cam.z=p.z-cfz*back;
 const F=84*vh/216,H=36,hor=Math.round(vh*.36),ca=Math.cos(cam.a),sa=Math.sin(cam.a);
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 const sg=g.createLinearGradient(0,vy,0,vy+hor);sg.addColorStop(0,th.sky[0]);sg.addColorStop(1,th.sky[1]);g.fillStyle=sg;g.fillRect(vx,vy,vw,hor+1);
 if(!th.night){g.fillStyle='rgba(255,250,220,.9)';const sx=vx+vw/2+wrapA(cam.a-2.2)*F;g.beginPath();g.arc(sx,vy+hor*.35,8,0,7);g.fill();RA.fx.light(g,sx,vy+hor*.35,22,'#fff0b0',.25)}
 else{g.fillStyle='#fff';for(let k=0;k<40;k++){const sx=vx+((k*97+cam.a*F*.5)%vw+vw)%vw,sy=vy+(k*53%Math.max(1,hor-10));g.fillRect(sx,sy,.8,.8)}}
 const strip=skyStrip(th),SW=2*Math.PI*F,sh=48*F/84;let ox=((vw/2+cam.a*F)%SW+SW)%SW-SW;for(;ox<vw;ox+=SW)g.drawImage(strip,vx+ox,vy+hor-sh,SW,sh);
 const fr=many?2:3;g.save();g.scale(1/fr,1/fr);floor7(g,MAP.tex,cam.x,cam.z,cam.a,H,F*fr,hor*fr,Math.round(vx*fr),Math.round(vy*fr),Math.round(vw*fr),Math.round(vh*fr));g.restore();
 const hg=g.createLinearGradient(0,vy+hor,0,vy+hor+vh*.16);hg.addColorStop(0,th.hz);hg.addColorStop(1,th.hz+'00');g.globalAlpha=.85;g.fillStyle=hg;g.fillRect(vx,vy+hor,vw,vh*.16);g.globalAlpha=1;
 const P=(x,z)=>{const dx=x-cam.x,dz=z-cam.z,f=-dx*sa+dz*ca;if(f<5)return null;const r=dx*ca+dz*sa,s=F/f;return{x:vx+vw/2+r*s,y:vy+hor+H*s,s,f}};
 const L=[],lim=vw/2+40;
 for(const pr of MAP.props){const q=P(pr.x,pr.z);if(!q||q.f>520||Math.abs(q.x-vx-vw/2)>lim+q.s*30)continue;L.push([q.f,0,pr,q])}
 for(const b of boxes){if(b.t>0||b.lt>0)continue;const q=P(b.x,b.z);if(q&&q.f<600)L.push([q.f,1,b,q])}
 for(const o of oils){if(o.gone)continue;const q=P(o.x,o.z);if(q&&q.f<500)L.push([q.f+50,2,o,q])}
 for(const j of proj){const q=P(j.x,j.z);if(q&&q.f<600)L.push([q.f,3,j,q])}
 for(const k of karts){const q=P(k.x,k.z);if(q&&q.f<700)L.push([q.f,4,k,q])}
 for(const t of parts){const q=P(t.x,t.z);if(q&&q.f<300)L.push([q.f,5,t,q])}
 L.sort((a,b)=>b[0]-a[0]);
 for(const[,ty,o,q]of L){const s=q.s;
  if(ty===0){const m=propImg(o.k),h=m.wh*s*(o.sc||1),w=m.ww*s*(o.sc||1);RA.fx.shadow(g,q.x,q.y,w*.45,.3);g.drawImage(m,q.x-w/2,q.y-h,w,h);if(o.k==='lamp'&&s>.15)RA.fx.light(g,q.x,q.y-h*.9,Math.max(3,8*s),'#ff60d0',.35)}
  else if(ty===1){const bob=Math.sin(K.tick*.08+o.id)*1.2,y=q.y-(6+bob)*s,sz=7*s;RA.fx.shadow(g,q.x,q.y,sz*.5,.3);g.save();g.translate(q.x,y);g.rotate(Math.sin(K.tick*.05+o.id)*.5);
   const gr=g.createLinearGradient(-sz/2,-sz/2,sz/2,sz/2);gr.addColorStop(0,'#fff');gr.addColorStop(.3,'hsl('+((K.tick*4+o.id*40)%360)+',90%,60%)');gr.addColorStop(1,'hsl('+((K.tick*4+o.id*40+120)%360)+',80%,35%)');
   g.fillStyle=gr;g.globalAlpha=.9;g.fillRect(-sz/2,-sz/2,sz,sz);g.globalAlpha=1;g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=Math.max(.5,s*.4);g.strokeRect(-sz/2,-sz/2,sz,sz);
   if(sz>5){g.fillStyle='#fff';g.font='bold '+Math.round(sz*.7)+'px "Russo One",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,sz*.05)}g.restore()}
  else if(ty===2){const sq=H/Math.hypot(H,q.f);g.fillStyle='rgba(16,12,28,.85)';g.beginPath();g.ellipse(q.x,q.y,8*s,8*s*sq,0,0,7);g.fill();g.fillStyle='rgba(140,120,200,.35)';g.beginPath();g.ellipse(q.x-2*s,q.y-1*s*sq,3*s,2*s*sq,0,0,7);g.fill()}
  else if(ty===3){const sz=6*s;RA.fx.shadow(g,q.x,q.y,sz*.5,.35);if(o.k===4)g.drawImage(ballImg('#30c050'),q.x-sz/2,q.y-sz-.5*s,sz,sz);else{g.drawImage(ballImg('#e83030'),q.x-sz/2,q.y-sz-3*s,sz,sz);RA.fx.light(g,q.x,q.y-sz,sz*.6,'#ffa040',.4)}}
  else if(ty===4)drawKart(g,o,q,cam,p);
  else{const sz=Math.max(.6,(o.sz||1.2)*s*.6);g.globalAlpha=Math.min(1,o.t/12);g.fillStyle=o.col;g.fillRect(q.x-sz/2,q.y-o.y*s-sz/2,sz,sz);g.globalAlpha=1}}
 for(const t of texts){const q=P(t.x,t.z);if(!q||q.f>260)continue;if(t.own!==p.i&&t.s.length>12)continue;RA.gfx.text(g,t.s,q.x,q.y-t.y*q.s-6,t.col)}
 hud(g,p,vx,vy,vw,vh,many);
 g.restore();
 if(many){g.strokeStyle='#000';g.lineWidth=1.5;g.strokeRect(vx,vy,vw,vh)}}
function drawKart(g,k,q,cam,me){const fl=flags(k),s=q.s*(fl&32?.62:1),spin=fl&16?(K.tick*.5+k.i):0;
 let rel=wrapA(k.a+spin+(k.drift?k.drift*.35:0)-cam.a),idx=((Math.round(rel/(Math.PI*2)*16)%16)+16)%16;
 if(K.isClient()&&k.i!==K.myIdx&&fl&8)idx=(idx+16)%16;
 const img=kartImg(k.col,idx),w=24*.45*s,h=22*.45*s,hop=fl&256?Math.sin((k.hop||4)/8*Math.PI)*3*s:0,ghost=k.out;
 RA.fx.shadow(g,q.x,q.y,w*.42,.38);if(ghost)g.globalAlpha=.35;
 g.drawImage(img,q.x-w/2,q.y-h*.82-hop,w,h);g.globalAlpha=1;
 if(fl&1)RA.fx.light(g,q.x,q.y-h*.4,w*.7,'hsl('+(K.tick*12%360)+',100%,60%)',.45);
 if(fl&4)RA.fx.light(g,q.x,q.y-h*.2,w*.3,'#ffa030',.5);
 if(fl&2){g.strokeStyle='rgba(140,210,255,.8)';g.lineWidth=Math.max(.5,s*.4);g.beginPath();g.arc(q.x,q.y-h*.45,w*.62,0,7);g.stroke();RA.fx.light(g,q.x,q.y-h*.45,w*.5,'#60c0ff',.15)}
 if(BAT&&!k.out)for(let b=0;b<k.bal;b++){const bx=q.x+(b-(k.bal-1)/2)*3.4*s,by=q.y-h-6*s-Math.sin(K.tick*.06+b)*s;g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.4;g.beginPath();g.moveTo(q.x,q.y-h*.7);g.lineTo(bx,by);g.stroke();
  const bg=g.createRadialGradient(bx-s,by-s,.2,bx,by,2.2*s);bg.addColorStop(0,'#fff');bg.addColorStop(.3,k.col);bg.addColorStop(1,mix(k.col,'#000000',.4));g.fillStyle=bg;g.beginPath();g.ellipse(bx,by,1.9*s,2.3*s,0,0,7);g.fill()}
 if(k!==me&&karts.length>1&&s>.9&&q.f<160)RA.gfx.text(g,k.name,q.x,q.y-h-(BAT?14*s:4)-4,k.col)}
function txt(g,s,x,y,size,col,align){g.save();g.font=size+'px "Russo One","Arial Black",sans-serif';g.textAlign=align||'center';g.textBaseline='middle';
 const gr=g.createLinearGradient(0,y-size/2,0,y+size/2);gr.addColorStop(0,mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.35));
 g.lineJoin='round';g.lineWidth=Math.max(1.5,size/5);g.strokeStyle='#000';g.strokeText(s,x,y);g.fillStyle=gr;g.fillText(s,x,y);g.restore()}
function itemIcon(g,k,x,y,sz){const it=ITEMS[k];if(!it)return;g.save();g.translate(x,y);const r=sz/2;
 if(k===1||k===2){for(let m=0;m<(k===2?3:1);m++){const ox=k===2?(m-1)*r*.55:0;g.fillStyle='#f8f0e0';g.fillRect(ox-r*.25,0,r*.5,r*.6);const gr=g.createRadialGradient(ox-r*.2,-r*.3,1,ox,0,r*.7);gr.addColorStop(0,'#ffb0a0');gr.addColorStop(1,'#d02020');g.fillStyle=gr;g.beginPath();g.arc(ox,0,r*.62*(k===2?.7:1),Math.PI,0);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ox,-r*.25,r*.12,0,7);g.fill()}}
 else if(k===3){g.fillStyle='#181424';g.beginPath();g.ellipse(0,r*.2,r*.8,r*.45,0,0,7);g.fill();g.fillStyle='rgba(160,140,255,.5)';g.beginPath();g.ellipse(-r*.25,r*.05,r*.3,r*.12,0,0,7);g.fill()}
 else if(k===4||k===5){g.drawImage(ballImg(k===4?'#30c050':'#e83030'),-r*.7,-r*.7,r*1.4,r*1.4);if(k===5){g.fillStyle='#ffa030';g.beginPath();g.moveTo(-r*.2,r*.6);g.lineTo(0,r);g.lineTo(r*.2,r*.6);g.fill()}}
 else if(k===6){g.strokeStyle='#80d0ff';g.lineWidth=r*.2;g.beginPath();g.arc(0,0,r*.6,0,7);g.stroke();RA.fx.light(g,0,0,r*.6,'#60c0ff',.3)}
 else if(k===7){g.fillStyle='hsl('+(K.tick*8%360)+',100%,62%)';g.beginPath();for(let q=0;q<10;q++){const a=q/10*Math.PI*2-Math.PI/2,rr=q&1?r*.32:r*.75;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.fill();g.fillStyle='#000';g.fillRect(-r*.18,-r*.15,r*.1,r*.22);g.fillRect(r*.08,-r*.15,r*.1,r*.22)}
 else if(k===8){g.fillStyle='#2a1a40';g.beginPath();g.arc(0,r*.1,r*.5,0,7);g.fill();g.fillRect(-r*.1,-r*.7,r*.2,r*.5);g.fillStyle='#fff';g.fillRect(-r*.15,-r*.1,r*.1,r*.1);g.fillRect(r*.08,-r*.1,r*.1,r*.1)}
 else{g.fillStyle='#e060e0';g.beginPath();g.moveTo(-r*.7,0);g.lineTo(r*.4,-r*.4);g.lineTo(r*.4,r*.4);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(r*.55,0,r*.18,0,7);g.fill()}
 g.restore()}
const tm=t=>{t=Math.max(0,t);const s=t/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor(s*100)%100).padStart(2,'0')};
function hud(g,p,vx,vy0,vw,vh0,many){const sc=many?.75:1,me=p,f=p.fx||{},top=vy0===0?24:4,vy=vy0+top,vh=vh0-top;
 // countdown lights
 if(K.tick<CD+40){const n=K.tick<CD?Math.min(3,Math.floor(K.tick/(CD/4))):4,cx=vx+vw/2,cy=vy+vh*.22;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(cx-34*sc,cy-10*sc,68*sc,20*sc);
  for(let k=0;k<3;k++){const on=n>k&&n<4,go=n>=4;g.fillStyle=go?'#30f060':on?'#ff3030':'#401818';g.beginPath();g.arc(cx+(k-1)*20*sc,cy,7*sc,0,7);g.fill();if(on||go)RA.fx.light(g,cx+(k-1)*20*sc,cy,12*sc,go?'#40ff80':'#ff4040',.35)}
  if(n>=4)txt(g,'GO!',cx,cy+22*sc,18*sc,'#40ff80');
  if(K.tick%(CD/4|0)===0&&K.tick<CD&&K.tick>0&&me===karts[K.myIdx>=0?K.myIdx:0])RA.audio.blip(440);if(K.tick===CD&&me===karts[K.myIdx>=0?K.myIdx:0])RA.audio.blip(880)}
 // place + lap / balloons
 if(!K.demo){if(BAT){txt(g,'🎈 '.repeat(0)+(p.out?'OUT':p.bal+' BALLOON'+(p.bal===1?'':'S')),vx+8*sc,vy+14*sc,9*sc,p.out?'#ff6060':'#ffffff','left');txt(g,'HITS '+p.hits,vx+8*sc,vy+26*sc,7*sc,'#f8d040','left')}
  else{txt(g,'LAP '+Math.max(1,Math.min(K.S.laps,p.lap))+'/'+K.S.laps,vx+8*sc,vy+14*sc,9*sc,'#ffffff','left');txt(g,tm(p.fin?p.ft:K.tick-CD),vx+8*sc,vy+26*sc,7*sc,'#c8d8f0','left')}
  const pl=p.place||1,pc=pl===1?'#f8d040':pl===2?'#d8d8e8':pl===3?'#e09050':'#ffffff';txt(g,pl+'',vx+vw-30*sc,vy+vh-24*sc,26*sc,pc,'right');txt(g,ord(pl).replace(/^\d+/,''),vx+vw-28*sc,vy+vh-30*sc,9*sc,pc,'left');
  // speed bar
  const spd=Math.max(0,Math.min(1,Math.abs(p.sp)/4.4));g.fillStyle='rgba(0,0,0,.5)';g.fillRect(vx+vw-62*sc,vy+vh-10*sc,54*sc,4*sc);const sgr=g.createLinearGradient(vx+vw-62*sc,0,vx+vw-8*sc,0);sgr.addColorStop(0,'#40f080');sgr.addColorStop(.7,'#f8e040');sgr.addColorStop(1,'#ff4020');g.fillStyle=sgr;g.fillRect(vx+vw-62*sc,vy+vh-10*sc,54*sc*spd,4*sc)}
 // item slot + active effects (time left as bars)
 if(!K.demo&&(p.i===K.myIdx||!K.isClient()&&K.seats[p.i]&&K.seats[p.i].ctrl!=='cpu')){const ix=vx+vw/2,iy=vy+18*sc,bs=24*sc;
  const fr=g.createLinearGradient(0,iy-bs/2,0,iy+bs/2);fr.addColorStop(0,'#dfe6f0');fr.addColorStop(.5,'#8a96a8');fr.addColorStop(1,'#4a5468');g.fillStyle=fr;g.fillRect(ix-bs/2-2,iy-bs/2-2,bs+4,bs+4);
  g.fillStyle='rgba(10,20,50,.85)';g.fillRect(ix-bs/2,iy-bs/2,bs,bs);
  if(p.roul>0)itemIcon(g,1+(Math.floor(K.tick/3)%9),ix,iy,bs*.8);else if(p.item){itemIcon(g,p.item,ix,iy,bs*.8);if(p.cnt>1)txt(g,'x'+p.cnt,ix+bs/2+8*sc,iy+bs/2-4*sc,7*sc,'#ffffff')}
  const ef=[['boost',80,'#ff9030'],['star',420,'#f8e040'],['shrink',300,'#e060e0'],['ink',240,'#8060c0']].filter(e=>f[e[0]]>0);
  ef.forEach((e,k)=>{const y=iy+bs/2+5*sc+k*4*sc;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(ix-bs/2,y,bs,2.5*sc);g.fillStyle=e[2];g.fillRect(ix-bs/2,y,bs*Math.min(1,f[e[0]]/e[1]),2.5*sc)});
  if(f.shield>0)txt(g,'SHIELD',ix,iy+bs/2+7*sc+ef.length*4*sc,6*sc,'#80d0ff');
  if(p.drift){const lv=p.dc>150?2:p.dc>75?1:0;txt(g,['DRIFT','BLUE TURBO','ORANGE TURBO'][lv],vx+vw/2,vy+vh-16*sc,7*sc,['#f8f8c0','#40a0ff','#ff9020'][lv])}
  if(p.wrong>40&&!p.fin&&(K.tick>>4)&1)txt(g,'WRONG WAY!',vx+vw/2,vy+vh*.42,14*sc,'#ff4040');
  if(p.fin&&!BAT)txt(g,ord(p.fin)+' · FINISHED',vx+vw/2,vy+vh*.3,12*sc,p.fin<=3?'#f8d040':'#ffffff')}
 if(f.ink>0){g.fillStyle='rgba(16,8,30,'+Math.min(.92,f.ink/60)+')';for(let k=0;k<7;k++){g.beginPath();g.arc(vx+vw*(.15+.12*k),vy+vh*(.35+.18*Math.sin(k*2.1)),vh*(.1+.04*(k%3)),0,7);g.fill()}}
 // minimap and standings
 if(!many&&MAP){const ms=Math.min(84,vh*.36),mx=vx+6,my=vy+vh-ms-6;g.globalAlpha=.75;g.drawImage(MAP.mini,mx,my,ms,ms);g.globalAlpha=1;
  for(const k of karts){if(k.out)continue;const x=mx+k.x/TS*ms,y=my+k.z/TS*ms;g.fillStyle='#000';g.fillRect(x-2,y-2,4,4);g.fillStyle=k.col;g.fillRect(x-1.4,y-1.4,2.8,2.8)}
  for(const b of proj){g.fillStyle=b.k===5?'#ff4040':'#40ff60';g.fillRect(mx+b.x/TS*ms-1,my+b.z/TS*ms-1,2,2)}
  let list=karts.slice().sort((a,b)=>a.place-b.place).slice(0,8);if(!list.includes(p))list=list.slice(0,7).concat([p]);g.font='6px "Russo One",sans-serif';
  list.forEach((k,n)=>{const y=vy+36+n*8;g.textAlign='left';g.fillStyle=k===p?'rgba(255,255,255,.3)':'rgba(0,0,0,.5)';g.fillRect(vx+6,y-6,74,7.5);g.fillStyle=k.col;g.fillRect(vx+7,y-5,4,5);
   g.fillStyle=k.out?'#888':'#fff';g.fillText(k.place+'. '+(k.name||'').slice(0,10),vx+13,y);g.textAlign='right';g.fillText(BAT?'●'.repeat(k.bal):k.fin?'✓':'L'+Math.max(1,Math.min(K.S.laps,k.lap)),vx+78,y)})}}
function render(g,W,H){if(!MAP){g.fillStyle='#000';g.fillRect(0,0,W,H);return}
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=karts.slice().sort((a,b)=>a.place-b.place).find(k=>!k.out)||karts[0];fs=lead?[K.demo?karts[(Math.floor(K.tick/600))%karts.length].i:lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length;if(!n){g.fillStyle='#000';g.fillRect(0,0,W,H);return}
 const rects=n===1?[[0,0,W,H]]:n===2?[[0,0,W,H/2],[0,H/2,W,H/2]]:[[0,0,W/2,H/2],[W/2,0,W/2,H/2],[0,H/2,W/2,H/2],[W/2,H/2,W/2,H/2]];
 if(n===3){g.fillStyle='#000';g.fillRect(W/2,H/2,W/2,H/2)}
 fs.forEach((i,k)=>{const r=rects[k];view(g,karts[i],Math.round(r[0]),Math.round(r[1]),Math.round(r[2]),Math.round(r[3]),k,n>1)});
 if(n===3&&MAP){const ms=Math.min(W,H)/2-16;g.drawImage(MAP.mini,W*.75-ms/2,H*.75-ms/2,ms,ms);for(const k of karts){g.fillStyle=k.col;g.fillRect(W*.75-ms/2+k.x/TS*ms-1.5,H*.75-ms/2+k.z/TS*ms-1.5,3,3)}}}
K=RA.kit({id:'karts',name:'TURBO KARTS',kind:'Kart racing',players:'1-20 players',demo:6,localFirst:true,baseH:216,
 desc:'Kart racing for up to 20 with a Mode 7 chase camera: drift for mini-turbos, grab ? boxes, fire rockets and bouncers, or pop balloons in battle mode. Split screen for local players.',
 blurb:'W gas, A / D steer, Shift / E drift (let go for a turbo), Space or click uses your item. Hold gas as the lights go green for a rocket start.',
 howto:'W / S gas and brake, A / D steer, Shift or E (right-click) drifts, Space or click uses an item (hold S to throw it back). Gamepad and touch accelerate by themselves.',
 icon:['..........','....kkk...','...kwwk...','.kkrrrrkk.','krrrrrrrrk','krrkrrkrrk','kkkskkkskk','.kkk..kkk.','..........','..........'],
 music:MUSIC,fireLabel:'ITEM',
 modes:[['RACE','Everyone for themselves.'],['TEAM RACE','Red vs blue: points for every finishing place.'],['BALLOON BATTLE','Arena: pop balloons, last kart rolling wins.'],['TEAM BATTLE','Arena, red vs blue balloons.']],
 settings:[['track','Track',[['rnd','Random track'],[0,'Sunny Circuit'],[1,'Dune Canyon'],[2,'Frosty Peaks'],[3,'Neon City']]],['laps','Laps',[[3,'3 laps'],[2,'2 laps'],[5,'5 laps'],[1,'1 lap']]],
  ['items','Items',[['on','Kart items'],['party','Wild party'],['boost','Boosts only'],['off','Off']]],['len','Time limit',[[0,'None'],[3,'3 min'],[5,'5 min']]]],
 kb:[['W S','gas / brake'],['A D','steer'],['SHIFT E','drift'],['SPACE LMB','item'],['C','chat'],['ESC','menu']],pad:[['LS','steer'],['B RB','drift'],['A','item'],['DP','brake'],['START','menu']],
 ach:[{id:'first',name:'Green Flag',desc:'Finish your first race',test:s=>s.played>=1,unlock:'title:Rookie Racer'},{id:'win1',name:'Chequered Flag',desc:'Win a race or battle',test:(s,m)=>m.won,unlock:'title:Champion'},
  {id:'pod5',name:'Podium Regular',desc:'5 podium finishes',test:s=>s.podiums>=5,unlock:'title:Podium Regular'},{id:'turbo',name:'Drift King',desc:'10 orange mini-turbos in one race',test:(s,m)=>m.turbos>=10,unlock:'title:Drift King'},
  {id:'hit5',name:'Sharpshooter',desc:'Hit 5 karts in one match',test:(s,m)=>m.kills>=5,unlock:'title:Sharpshooter'}],
 alive:i=>!!karts[i]&&!karts[i].out,out:i=>!!karts[i]&&(karts[i].out||!BAT&&!!karts[i].fin&&K.state!=='play'),
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>MAP?(BAT?'Arena':TRACKS[trackNo].n):'',
 ranks:()=>karts.slice().sort((a,b)=>a.place-b.place).map(p=>[p.name,p.col,BAT?(p.out?'out':p.bal+' balloons')+' · '+p.hits+' hits':p.fin?tm(p.ft):'lap '+Math.max(1,Math.min(K.S.laps,p.lap))]),
 result:(i,w)=>{const p=karts[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:p.hits,podiums:!BAT&&p.place<=3?1:0,turbos:p.turbos|0}}});
window.__tk={get karts(){return karts},get map(){return MAP},K};
})();
