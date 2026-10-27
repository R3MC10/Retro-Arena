/* THRILL BIKE for Retro Arena: side-view motocross for up to 20 riders, in hand-drawn pixel art on a 320x180 pixel screen.
   Hold Space (or click) for gas, add E / Shift / right-click for turbo: it is faster but heats the engine, and an engine that
   overheats stalls until it cools. Ride over the blue cooling arrows to reset the heat. W / S change lane (on the ground),
   A / D lean back and forward: in the air, match the angle of the slope you will land on or you crash.
   Ride into another rider's back wheel and you go down, just like the original. Mud slows you; ? crates give you a boost.
   Modes: RACE · TEAM RACE (red vs blue, points by finishing place) · ELIMINATOR (every 30 s the last rider is out).
   Online is lag-free (RA.kit localFirst): your bike runs on your own device; the host keeps the crates, places and eliminations. */
(()=>{
const ART={"poses": {"sit": ["....................................", "....................................", "....................................", "....................................", "....................................", ".................kkkk...............", "................k1112kkk............", "...............k11122233k...........", "...............k112kCCkk............", "...............k222233Gk............", "...............kk2333kk.............", "..............k112223kk.............", ".............k112222323k............", ".............k122223kk33kk..........", "............k122223k..kkKKk.........", "............k12223k...kKkkKk........", "....kkkkk..kwwwwwGkk...kGkWwk.......", "...k11122kkkwwwwwwwGk...kGGwwk......", "....k2KKKKKKkkkkkwGGkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK22223kwGk22223kGGkkkk....", "......kGGGGGGGkkKKKKkkkkk1112222k...", ".......kggggggkkkkkk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."], "back": ["....................................", "....................................", "....................................", "....................................", "....................................", "..............kkkk..................", ".............k1112kkk...............", "............k11122233k..............", "............k112kCCkk...............", "............k222233Gk...............", ".............k2333kk................", "............k1122233kk..............", "...........k1122223333kkk...........", "...........k122223kkk3333k..........", "...........k12223k...kkkKKk.........", "...........k1223k.....kKkkKk........", "....kkkkk.kwwwwwGkkk...kGkWwk.......", "...k11122kkwwwwwwwwGk...kGGwwk......", "....k2KKKKKkkkkkkwGGkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK22223kwGk22223kGGkkkk....", "......kGGGGGGGkkKKKKkkkkk1112222k...", ".......kggggggkkkkkk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."], "fwd": ["....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................kkkk............", "...................k1112kkk.........", "..................k11122233k........", "..................k112kCCkk.........", "................kkk222233Gk.........", "..............kk1112333kkk..........", ".............k1122222233k...........", "............k1222223kkk33k..........", "...........kww2223kk...kKKk.........", "...........kwwwwwwwGk.kKkkKk........", "....kkkkk...kkkkkwGGk..kGkWwk.......", "...k11122kkkkkkkkwGk....kGGwwk......", "....k2KKKKKKKKKKkwGkkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK22223kwGk22223kGGkkkk....", "......kGGGGGGGkkKKKKkkkkk1112222k...", ".......kggggggkkkkkk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."], "tuck": ["....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................kkkk.............", "..................k1112kkk..........", ".................k11122233k.........", ".............kkkkk112kCCkk..........", "............k1111222233Gk...........", "...........k112222222333k...........", "...........kwwww2223kkkKKkk.........", "...........kwwwwwwwGk.kkkkKk........", "....kkkkk...kkkkkwGGk..kGkWwk.......", "...k11122kkkkkkkkwGk....kGGwwk......", "....k2KKKKKKKKKKkwGkkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK22223kwGk22223kGGkkkk....", "......kGGGGGGGkkKKKKkkkkk1112222k...", ".......kggggggkkkkkk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."], "stand": ["....................................", "....................................", ".................kkkk...............", "................k1112kkk............", "...............k11122233k...........", "...............k112kCCkk............", "...............k222233Gk............", "...............kk2333kk.............", "..............k112223kk.............", ".............k112222323k............", ".............k122223kk33k...........", ".............k122223k.kk3kk.........", ".............k12223k....kKKk........", "............kwwwwwGkk....kk.........", "............kwwwwwwwGk.k..k.........", ".............kkkkkwGk.kKkkKk........", "....kkkkk........kwGk..kGkWwk.......", "...k11122kkkkkkkkwGGk...kGGwwk......", "....k2KKKKKKKKKKkwGkkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK2222kKKKKk2223kGGkkkk....", "......kGGGGGGGkkkkkkkkkkk1112222k...", ".......kggggggkkkgGk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."], "wave": ["....................................", "..................kk................", ".................kKKk...............", ".................k3k................", "..............kkkk3k................", ".............k1112k3k...............", "............k11122233k..............", "............k112kCCkk...............", "............k222233Gk...............", "............kk2333kk................", "...........k112223kk................", "...........k11222223kk..............", "...........k122223kk33kk............", "...........k122223k.kkKKk...........", "...........k12223k....kk..k.........", "...........kwwwwwGkk..kKkkKk........", "....kkkkk..kwwwwwwwGk..kGkWwk.......", "...k11122kkkkkkkkwGGk...kGGwwk......", "....k2KKKKKKKKKKkwGkkkkkkGGwk.......", ".....k2wwww22222kwGk1122kkGGk.......", "......kwKwK2222kKKKKk2223kGGkkkk....", "......kGGGGGGGkkkkkkkkkkk1112222k...", ".......kggggggkkkgGk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."]}, "wheels": [["...kkgkk...", "..kkKKKkk..", ".kgK...Kgk.", "kkK.G.G.Kkk", "kK..G.G..Kk", "gK.GGgGG.Kg", "kK..G.G..Kk", "kkK.G.G.Kkk", ".kgK...Kgk.", "..kkKKKkk..", "...kkgkk..."], ["...kkkkk...", "..kgKKKgk..", ".kKK...KKk.", "kgK..G..Kgk", "kK.G.GGG.Kk", "kK..GgG..Kk", "kK.GGG.G.Kk", "kgK..G..Kgk", ".kKK...KKk.", "..kgKKKgk..", "...kkkkk..."], ["...kkgkk...", "..kkKKKkk..", ".kgK...Kgk.", "kkKG..G.Kkk", "kK..GG.G.Kk", "gK..GgG..Kg", "kK.G.GG..Kk", "kkK.G..GKkk", ".kgK...Kgk.", "..kkKKKkk..", "...kkgkk..."], ["...kkkkk...", "..kgKKKgk..", ".kKK...KKk.", "kgK.G.G.Kgk", "kK...GG..Kk", "kK.GGgGG.Kk", "kK..GG...Kk", "kgK.G.G.Kgk", ".kKK...KKk.", "..kgKKKgk..", "...kkkkk..."]], "alone": {"runA": ["....kkkk...", "...k1112kk.", "..k1112223k", "..k112kCCk.", "..k222233Gk", "...k2333kk.", "..k1122233k", ".k11222k33k", "kK1222kkKk.", ".kk2223kk..", "..kwwwwwk..", ".kwwkkwwk..", "kwwk..kwGk.", "kKKk...kKKk", ".kk.....kk."], "runB": ["....kkkk...", "...k1112kk.", "..k1112223k", "..k112kCCk.", "..k222233Gk", "...k2333kk.", "..k112223k.", "..k122223k.", "..k12223Kk.", "..k2223kk..", "..kwwwwwk..", "...kwwwk...", "...kwwGk...", "..kKKKKk...", "...kkkk...."], "ball": ["...kkkk.....", "..k1112kkk..", ".k11122233k.", ".k112kCC2k..", ".k22223322k.", "..kw23222k..", ".kww22233Kk.", ".kwwwGG3Kk..", "kKKwwGkkk...", ".kKKkk......", "..kk........"], "flat": ["...........kkkk...", ".kk.kkkkkkk1112k..", "kKKkwwwww2222122k.", "kKKwwwwwG22223kCCk", ".kkkkkkkkkk23333k.", "...........kkkkk.."]}, "bare": ["....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", ".......................k..k.........", "......................kKkkKk........", "....kkkkk..............kGkWwk.......", "...k11122kkkkkkkkkkk....kGGwwk......", "....k2KKKKKKKKKKKKKKkkkkkGGwk.......", ".....k2wwww2222222221122kkGGk.......", "......kwKwK22223112222223kGGkkkk....", "......kGGGGGGGkkkGG2kkkkk1112222k...", ".......kggggggkkkgGk.....kkGGk22k...", "........kkkkkkGGGggk.......kGkkk....", ".............kGgggKk.......kgk......", "..........kkkkgKgKgk........k.......", ".........kKKKKKgggKk................", "..........kkkkkkkkk.................", "....................................", "....................................", "....................................", "....................................", "....................................", "...................................."]};
const T=RA.music.track,sfx=RA.audio.sfx,X=RA.pix,txt=X.text;
const LANES=4,LH=10,SKEW=5,TEAMC=['#e83838','#2c78f0'],TEAMN=['Red team','Blue team'];
const GAS=1.85,TURBO=2.6,GRAV=.1;
const ITEMS=[null,{n:'NITRO',c:'#ffa040',d:'Turbo with no heat'},{n:'ICE COOL',c:'#a0f0ff',d:'Engine stays cold'},{n:'OIL',c:'#9a94a8',d:'Q drops it behind you'},{n:'HEAT WAVE',c:'#f05050',d:'Everyone else gets hot',party:1}];
const MUSIC=[T('Paddock',120,['G','C','D','G'],'k...s...k.k.s...','g5 - b5 d6 - b5 g5 - c6 - e6 c6 - g5 e5 - d5 - f#5 a5 - d6 - - g5 - - - - - - -'),
 T('Thrill Ride',160,['C','C','F','G'],'k.hsk.hsk.hsk.hs','c5 c5 e5 g5 . g5 e5 c5 c5 c5 e5 g5 . c6 . . f5 f5 a5 c6 . a5 f5 . g5 g5 b5 d6 . b5 g5 .'),
 T('Dirt Track',144,['Am','G','F','E'],'k..hs.h.k.khs.h.','a4 c5 e5 a5 e5 c5 a4 c5 g4 b4 d5 g5 d5 b4 g4 b4 f4 a4 c5 f5 c5 a4 f4 a4 e4 g#4 b4 e5 - - - -'),
 T('Final Lap',178,['Dm','Bb','C','A'],'kshskshskshskshs','d5 f5 a5 d6 a5 f5 d5 f5 bb4 d5 f5 bb5 f5 d5 bb4 d5 c5 e5 g5 c6 g5 e5 c5 e5 a4 c#5 e5 a5 e5 c#5 a4 c#5')];
RA.audio.add('land',(AC,now,g)=>{const o=AC.createOscillator();o.frequency.setValueAtTime(110,now);o.frequency.exponentialRampToValueAtTime(40,now+.12);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.001,now+.14);o.connect(g);o.start(now);o.stop(now+.15)});
RA.audio.add('crash',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.setValueAtTime(1800,now);f.frequency.exponentialRampToValueAtTime(200,now+.4);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.001,now+.45);s.connect(f);f.connect(g);s.start(now);s.stop(now+.46)});
let shake=0,K,rd=[],TR=null,crates=[],oils=[],parts=[],texts=[],finN=0,firstFin=0,lastHF=0,champ=-1,nextId=1,elimT=0,outN=0,engine=null;
const teamOf=i=>K.mode===1?i%2:i,sameTeam=(a,b)=>a!==b&&teamOf(a)===teamOf(b);
const ownerNet=r=>K.seats[r.i]&&K.seats[r.i].ctrl==='net';
const isMine=r=>K.isClient()?r.i===K.myIdx:!ownerNet(r);

/* ---------- the track: ramps, bumps, mud and cooling arrows, from the match seed ---------- */
function build(seed,theme){const rr=RA.util.mulberry(seed),L=2700,h=new Float32Array(L+2),mud=[],cool=[];let x=260;
 const to=(len,H)=>{const b=h[x];for(let k=1;k<=len;k++)h[x+k]=b+(H-b)*k/len;x+=len},flat=len=>{for(let k=1;k<=len;k++)h[x+k]=h[x];x+=len},drop=()=>{h[x+1]=0;x+=1};
 const F=[()=>{to(10,5);to(10,0)},()=>{to(24,12);to(18,0)},()=>{to(36,20);drop()},()=>{to(20,10);to(20,0);flat(14);to(20,10);to(20,0)},
  ()=>{to(26,13);flat(56);to(26,0)},()=>{for(let k=0;k<5;k++){to(8,4);to(8,0)}},()=>{to(30,16);flat(46);to(60,0)},()=>{to(44,9);to(44,0)}];
 let last=-1;while(x<L-320){let t;do t=Math.floor(rr()*F.length);while(t===last);last=t;F[t]();const gap=80+Math.floor(rr()*90);
  if(rr()<.5)mud.push([x+20,x+20+28+Math.floor(rr()*20),Math.floor(rr()*LANES)]);if(rr()<.4)cool.push([x+gap-36,Math.floor(rr()*LANES)]);flat(gap)}
 for(;x<=L;x++)h[x+1]=0;h[0]=h[L]=h[L+1]=0;return{L,h,mud,cool,theme}}
const mod=(x,L)=>((x%L)+L)%L;
const hAt=x=>{const L=TR.L;x=mod(x,L);const i=Math.floor(x),f=x-i;return TR.h[i]*(1-f)+TR.h[i+1]*f};
const slope=x=>(hAt(x+2)-hAt(x-2))/4;
const inMud=(x,z)=>{const xx=mod(x,TR.L);return TR.mud.some(m=>xx>m[0]&&xx<m[1]&&Math.abs(z-m[2])<.5)};
const onCool=(x,z)=>{const xx=mod(x,TR.L);return TR.cool.some(c=>xx>c[0]&&xx<c[0]+24&&Math.abs(z-c[1])<.5)};
const near=(a,b)=>{const L=TR.L,d=mod(a-b+L/2,L)-L/2;return d};   // signed distance a-b on the looping track

/* ---------- setup ---------- */
function start(seats,md,S,seed){const rr=RA.util.mulberry(seed),th=S.theme==='rnd'?Math.floor(rr()*3):+S.theme||0;TR=build(seed+7,th);
 crates=[];oils=[];parts=[];texts=[];finN=0;firstFin=0;lastHF=0;champ=-1;nextId=1;elimT=0;outN=0;cams.length=0;
 rd=seats.map((s,i)=>({lean:0,av:0,sc:0,cv:0,pose:0,cr:null,i,name:s.name,col:md===1?TEAMC[i%2]:s.col,d:-14-Math.floor(i/LANES)*34,z:i%LANES,tz:i%LANES,vx:0,y:0,vy:0,ang:0,gr:true,heat:0,stall:0,fx:{},
  lap:0,place:i+1,fin:0,ft:0,out:false,item:0,ev:[],evSeq:0,evSeen:0,claims:[],cseq:0,cSeen:0,perfect:0,crashes:0,gs:-1,wheel:0,auto:s.ctrl==='touch'}))}

/* ---------- your own bike (runs on the device that owns it) ----------
   The bike is a rigid body on two wheels: r.d / r.y are where the rear tyre touches the ground, r.ang its angle on screen
   (positive = nose down), r.av its spin. On the ground the front wheel rests on the track unless you pull a wheelie;
   in the air leaning applies torque. The suspension (r.sc, compression in pixels) is a damped spring. */
const WB=19,WR=5,POSES=['sit','back','fwd','tuck','stand','wave'];
const gAngAt=x=>-Math.atan2(hAt(x+WB)-hAt(x),WB);
function spring(r){r.cv+=-r.sc*.3;r.cv*=.7;r.sc+=r.cv;if(r.sc<0){r.sc=0;if(r.cv<0)r.cv=0}if(r.sc>4){r.sc=4;if(r.cv>0)r.cv=0}}
function landAt(r){const g0=hAt(r.d),tt=Math.max(2,(r.vy+Math.sqrt(Math.max(0,r.vy*r.vy+2*GRAV*Math.max(0,r.y-g0))))/GRAV);return gAngAt(r.d+r.vx*tt)}
function ride(r,inp){const f=r.fx;for(const k in f)if(f[k]>0)f[k]--;
 r.wheel+=r.vx/8;spring(r);
 if(r.out){r.vx*=.95;return}
 if(K.tick<CD){if(inp.fire){if(r.gs<0)r.gs=K.tick}else r.gs=-1;r.pose=inp.fire?3:0;r.ang=gAngAt(r.d);return}
 if(K.tick===CD&&r.gs>=CD-25){r.vx=1.6;say(r,'GOOD START!','#fff07c')}
 if(r.cr){crashStep(r);return}
 const x=r.d,gas=(inp.fire||r.fin)&&r.stall<=0;let turbo=gas&&(inp.alt||inp.b4);if(r.auto&&gas)turbo=r.heat<55;
 let lean=(inp.right?1:0)-(inp.left?1:0);if(inp.ax&&Math.abs(inp.ax)>.3)lean=Math.sign(inp.ax);r.lean+=(lean-r.lean)*.3;
 // engine heat
 if(r.stall>0){r.stall--;r.heat=Math.max(0,r.heat-.45)}
 else{r.heat+=f.cool>0?-1:turbo&&!(f.nitro>0)?.6:-.35;r.heat=Math.max(0,Math.min(100,r.heat));if(r.gr&&onCool(x,r.z)&&r.heat>0){r.heat=0;if(isMine(r))sfx('pick')}
  if(r.heat>=100){r.stall=130;say(r,'OVERHEAT!','#f05050');sfx('crash')}}
 let max=turbo||f.nitro>0&&gas?TURBO:GAS;if(K.seats[r.i].ctrl==='cpu')max*=[.9,.96,1][K.cpu];if(r.gr&&inMud(x,r.z))max*=.5;
 const accel=gas&&r.vx<max;if(gas)r.vx+=(max-r.vx)*(r.vx<max?.028:.08);else r.vx*=r.gr?.982:.996;
 if(r.gr){
  const ld=(inp.up?1:0)-(inp.down?1:0);if(ld&&!r.lh&&r.stall<=0&&r.ang>gAngAt(x)-.2)r.tz=Math.max(0,Math.min(LANES-1,r.tz+ld));r.lh=ld;r.z+=(r.tz-r.z)*.18;if(Math.abs(r.tz-r.z)<.02)r.z=r.tz;
  r.vx=Math.max(0,r.vx-slope(x)*.035);
  {const hn=hAt(x+r.vx),h0=hAt(x);if(r.vy>.25&&hn<h0+r.vy-.6&&r.vx>1){r.gr=false;r.y=h0;r.air=0;r.leaned=0;r.av=Math.min(r.av,0);r.d=x+r.vx;return}}
  // wheelie: lean back on the gas lifts the front, gravity pulls it down, too far and you loop out
  const g0=gAngAt(x);if(lean<0)r.av-=gas&&r.vx>.5?.0075:.003;if(r.ang<g0)r.av+=.0042*Math.cos(r.ang-g0)+(lean>0?.007:0);
  r.av*=.88;r.ang+=r.av;if(r.ang>=g0){if(r.av>.04)r.cv+=r.av*8;r.ang=g0;r.av=0}
  if(r.ang<-Math.atan((hAt(x)-hAt(x-4))/4)-1.15){crash(r,'LOOPED OUT!');return}   // judged against the ground the rear wheel came up
  // the rear wheel follows the ground; when the ground falls away faster than the bike, it flies
  const nx=x+r.vx,hn=hAt(nx),h0=hAt(x),vy=hn-h0;
  if(r.vy>.25&&hn<h0+r.vy-.6&&r.vx>1){r.gr=false;r.y=h0;r.air=0;r.leaned=0;r.av=Math.min(r.av,0)}
  else{const kick=vy-r.vy;if(kick>.35)r.cv+=kick*1.6;r.vy=vy;r.y=hn}
  r.d=nx;
  if(accel&&r.vx>.3&&K.tick%2===0)parts.push({x:r.d-2,z:r.z,y:r.y+1,vx:-.8-Math.random()*1.2,vy:.5+Math.random()*1.3,t:22,c:inMud(r.d,r.z)?'#5a3a20':Math.random()<.5?'#c49058':'#8c5c34',g:1})}
 else{r.air++;r.d+=r.vx;r.vy-=GRAV;r.y+=r.vy;
  if(lean){r.av+=lean*.0042;r.leaned=1}else r.av+=(landAt(r)-r.ang)*.0016;   // no input: the bike slowly levels for the landing
  r.av*=.965;r.ang=Math.max(-1.5,Math.min(1.5,r.ang+r.av));
  const yf=r.y-WB*Math.sin(r.ang),gf=hAt(r.d+WB*Math.cos(r.ang));if(r.y<=hAt(r.d)||yf<=gf)land(r)}
 const np=r.fin&&r.vx<1.4?5:!r.gr?(r.lean<-.35?1:r.lean>.35?2:r.vy>0?0:4):r.lean<-.35?1:r.lean>.35?2:r.sc>1.6?4:turbo&&r.vx>2.1?3:0;
 if(np!==r.pose){r.pn=r.pn===np?r.pn:np;r.pnT=r.pn===np?(r.pnT|0)+1:0;if(r.pnT>=3){r.pose=np;r.pnT=0}}else r.pnT=0;   // a pose has to last 3 frames, no flicker
 // ride into the back wheel of the bike in front and you go down
 for(const o of rd){if(o===r||o.out||o.cr)continue;const dx=near(o.d,r.d+WB);if(dx>-2&&dx<5&&Math.abs(o.z-r.z)<.5&&r.gr&&o.gr&&r.vx>o.vx+.35){crash(r,'BUMP!');break}}
 for(const o of oils)if(!o.gone&&Math.abs(near(r.d+WB/2,o.x))<9&&Math.abs(r.z-o.z)<.5&&r.gr&&!(o.own===r.i&&K.tick-o.at<90)){o.gone=1;claim(r,'o',o.id);crash(r,'OIL!')}
 for(const c of crates)if(!c.got&&Math.abs(near(r.d+WB/2,c.x))<11&&Math.abs(r.z-c.z)<.5&&r.y-hAt(r.d)<16){c.got=1;claim(r,'c',c.id);sfx('pick')}
 if(inp.b3&&!r.qh&&r.item===3){r.item=0;claim(r,'oil',0)}r.qh=inp.b3}
function land(r){const g0=gAngAt(r.d),diff=r.ang-g0,imp=Math.max(0,-r.vy);r.y=hAt(r.d);r.gr=true;r.vy=0;r.cv+=imp*.8;
 for(let k=0;k<Math.min(14,4+imp*3);k++)parts.push({x:r.d+WB/2+(Math.random()-.5)*26,z:r.z,y:r.y+1,vx:(Math.random()-.5)*1.6,vy:.3+Math.random()*.9,t:20,c:'#e8c088',g:1});
 if(isMine(r)&&imp>2.2)shake=Math.min(4,imp);
 if(Math.abs(diff)<.14&&r.air>18&&r.leaned){r.vx=Math.min(TURBO,r.vx+.3);r.perfect++;say(r,'PERFECT!','#88dc48');sfx('land')}
 else if(Math.abs(diff)<.34){if(r.air>8)sfx('land')}
 else if(diff<0&&diff>-.8){r.vx*=.8;sfx('land')}             // rear wheel first: the front slams down, you keep going
 else if(diff>0&&diff<.62){r.vx*=.62;say(r,'WOBBLE','#ffa040');sfx('land')}
 else crash(r,diff>0?'NOSE DIVE!':'FLIPPED!')}
function crash(r,why){if(r.cr)return;r.crashes++;sfx('crash');say(r,why,'#f05050');
 r.cr={ph:0,x:r.d+10,y:r.y+14,vx:r.vx*1.05+.4,vy:1.3+Math.max(0,r.vy)*.5,rot:0,spin:.18+r.vx*.07,t:0};
 r.av=r.gr?.03:r.av+.06;r.tz=Math.round(r.z);
 for(let k=0;k<16;k++)parts.push({x:r.d+WB/2,z:r.z,y:r.y+3,vx:(Math.random()-.2)*2,vy:Math.random()*2,t:30+Math.random()*20|0,c:k%3?'#c49058':'#8c5c34',g:1})}
// a crash plays out with physics: the rider flies, bounces and slides, lies there, gets up, runs back and climbs on again
function crashStep(r){const c=r.cr;c.t++;
 // the bike slides (and tumbles if it was in the air)
 if(!r.gr){r.d+=r.vx;r.vy-=GRAV;r.y+=r.vy;r.ang+=r.av;if(r.y<=hAt(r.d)){r.y=hAt(r.d);r.gr=true;r.vy=0;r.cv+=2;r.av*=.4}}
 else{r.vx*=.94;r.d+=r.vx;r.y=hAt(r.d);r.av*=.9;r.ang+=r.av;const g0=gAngAt(r.d);if(r.vx<.5){const tgt=g0+Math.round((r.ang-g0)/(Math.PI*2))*Math.PI*2;r.ang+=(tgt-r.ang)*.15}}
 if(c.ph===0){c.vy-=.12;c.x+=c.vx;c.y+=c.vy;c.rot+=c.spin;const gh=hAt(c.x)+3;
  if(c.y<=gh){c.y=gh;if(c.vy<-.9){c.vy=-c.vy*.35;c.vx*=.65;c.spin*=.6;for(let k=0;k<5;k++)parts.push({x:c.x,z:r.z,y:c.y,vx:(Math.random()-.5)*1.5,vy:Math.random(),t:16,c:'#e8c088',g:1})}else{c.vy=0;c.vx*=.82;c.spin*=.8}
   if(Math.abs(c.vx)<.12&&c.vy===0){c.ph=1;c.t=0;c.rot=0}}}
 else if(c.ph===1){c.y=hAt(c.x)+1;if(c.t>28){c.ph=2;c.t=0}}
 else if(c.ph===2){const dx=r.d+6-c.x;c.x+=Math.sign(dx)*Math.min(1.4,Math.abs(dx));c.y=hAt(c.x);if(Math.abs(dx)<2){c.ph=3;c.t=0}}
 else if(c.ph===3&&c.t>14){r.cr=null;r.vx=0;r.ang=gAngAt(r.d);r.av=0;r.heat=Math.min(r.heat,30);r.gr=true}
 r.pose=0}
function claim(r,k,a){if(!K.isClient()){resolve(r,[0,k,a]);return}r.cseq++;r.claims.push([r.cseq,k,a]);if(r.claims.length>10)r.claims.shift()}

/* ---------- host ---------- */
function resolve(r,[,k,a]){if(k==='c'){const c=crates.find(x=>x.id===a);if(c&&!c.dead){c.dead=1;give(r)}}
 else if(k==='o')oils=oils.filter(o=>o.id!==a);
 else if(k==='oil')oils.push({id:nextId++,x:mod(r.d-22,TR.L),z:Math.round(r.z),own:r.i,at:K.tick,t:2400})}
function give(r){const n=rd.length,f=n>1?(r.place-1)/(n-1):.5;let bag=f<.3?[2,3,3]:[1,1,2,3];if(K.S.items==='party'&&f>.3)bag.push(4,4);
 const k=bag[Math.floor(Math.random()*bag.length)];say(r,ITEMS[k].n,ITEMS[k].c);
 if(k<4)send(r,'it',k);else for(const o of rd)if(o!==r&&!o.out&&!o.fin&&!sameTeam(r.i,o.i))send(o,'hw',0)}
function send(o,kind,v){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind,v|0]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind,v)}
function onEv(r,kind,v){if(kind==='it'){if(v===1)r.fx.nitro=300;else if(v===2){r.fx.cool=420;r.heat=0}else r.item=3}else if(kind==='hw')r.heat=Math.min(92,r.heat+55)}
const packCr=c=>c?[c.ph,Math.round(c.x*10)/10,Math.round(c.y*10)/10,Math.round(c.rot*100)/100,c.t]:0,unCr=a=>Array.isArray(a)?{ph:a[0],x:a[1],y:a[2],rot:a[3],t:a[4]}:null;
function readUp(r,u){if(typeof u.d!=='number')return;Object.assign(r,{d:u.d,z:u.z,vx:u.v,y:u.y,ang:u.a,gr:!!u.g,heat:u.h|0,stall:u.s|0,item:u.it|0,pose:u.p|0,sc:u.k||0,cr:unCr(u.c)});r.fl=u.f|0;
 for(const e of u.cl||[])if((e[0]|0)>r.cSeen){r.cSeen=e[0]|0;resolve(r,e)}}
const CD=180;
function step(){const S=K.S;
 for(const r of rd){if(ownerNet(r)){const u=K.remote(r.i);if(u)readUp(r,u)}else ride(r,r.fin||K.seats[r.i].ctrl==='cpu'?bot(r.i):K.inp(r.i))}
 if(S.items!=='off'&&K.tick%220===110&&crates.length<3+rd.length/4){const lead=Math.max(...rd.map(r=>r.d));crates.push({id:nextId++,x:mod(lead+260+Math.random()*400,TR.L),z:Math.floor(Math.random()*LANES),t:2400})}
 for(const c of crates)c.t--;crates=crates.filter(c=>!c.dead&&c.t>0);for(const o of oils)o.t--;oils=oils.filter(o=>o.t>0&&!o.gone);
 for(const r of rd){r.lap=Math.max(0,Math.floor(r.d/TR.L));if(!r.fin&&!r.out&&r.d>=S.laps*TR.L){r.fin=++finN;r.ft=K.tick-CD;if(finN===1)firstFin=K.tick;if(K.seats[r.i].ctrl!=='cpu')lastHF=K.tick;say(r,ord(r.fin)+' PLACE!',r.fin<=3?'#fff07c':'#ffffff');K.fx('f',r.i)}}
 places();
 if(K.mode===2&&K.tick>CD){elimT++;if(elimT>=1800){elimT=0;const live=rd.filter(r=>!r.out&&!r.fin);if(live.length>1){const last=live.sort((a,b)=>a.d-b.d)[0];last.out=true;last.outAt=++outN;say(last,'ELIMINATED!','#f05050');texts[texts.length-1].all=1;sfx('crash')}}}
 vis();checkEnd()}
function places(){rd.slice().sort((a,b)=>a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:(a.out-b.out)||(a.out&&b.out?b.outAt-a.outAt:b.d-a.d)).forEach((r,k)=>r.place=k+1)}
function checkEnd(){const lim=K.S.len*3600;
 if(K.mode===2){const live=rd.filter(r=>!r.out);if(rd.length>1&&live.length<=1||!live.some(r=>!r.fin)){places();const w=rd.find(r=>r.place===1);champ=w?w.i:-1;K.end(w?{i:w.i}:null)}return}
 const humans=rd.filter(r=>K.seats[r.i].ctrl!=='cpu'&&!r.fin).length;
 if(rd.every(r=>r.fin)||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>240||finN&&K.tick-firstFin>1800||lim&&K.tick>lim+CD){places();const w=rd.find(r=>r.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=rd.length,sc=[0,1].map(t=>rd.filter(r=>r.i%2===t).reduce((a,r)=>a+(n-r.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(r,s,col){texts.push({d:r.d,z:r.z,y:r.y+30,s,col,t:60,who:r.i})}
function vis(){for(const p of parts){p.x+=p.vx;p.y=Math.max(0,p.y+p.vy);p.vy-=.08;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>300)parts.splice(0,parts.length-300);
 for(const t of texts){t.t--;t.y+=.3}texts=texts.filter(t=>t.t>0);
 for(const r of rd){if(r.out||r.cr)continue;const fl=flags(r);
  if(fl&4&&K.tick%4===0)parts.push({x:r.d+8,z:r.z,y:r.y+18,vx:-.3,vy:.5,t:30,c:'#9a94a8',smoke:1})}}
// what the others see: 1 ground 2 crashed 4 hot / stalled 8 turbo flame 16 out
function flags(r){if(r.fl!=null&&(K.isClient()?r.i!==K.myIdx:ownerNet(r)))return r.fl;return(r.gr?1:0)|(r.cr?2:0)|(r.stall>0||r.heat>85?4:0)|(r.vx>GAS+.15?8:0)|(r.out?16:0)}

/* ---------- guests ---------- */
function local(i){const r=rd[i];if(r)ride(r,r.fin?bot(i):K.inp(i))}
function upload(i){const r=rd[i];if(!r)return null;return{d:Math.round(r.d*10)/10,z:Math.round(r.z*100)/100,v:Math.round(r.vx*100)/100,y:Math.round(r.y*10)/10,a:Math.round(r.ang*100)/100,g:r.gr?1:0,f:flags(r),h:Math.round(r.heat),c:packCr(r.cr),s:r.stall,it:r.item,p:r.pose,k:Math.round(r.sc*10)/10,cl:r.claims}}
function snap(){return{rd:rd.map(r=>[Math.round(r.d*10)/10,Math.round(r.z*100)/100,Math.round(r.y*10)/10,Math.round(r.ang*100),Math.round(r.vx*10),flags(r),r.place,r.lap,r.fin,r.ft,r.out?1:0,ownerNet(r)?r.ev:0,packCr(r.cr),r.pose,Math.round(r.sc*10)/10]),
 cr:crates.map(c=>[c.id,Math.round(c.x),c.z]),ol:oils.map(o=>[o.id,Math.round(o.x),o.z,o.own]),el:elimT}}
function apply(g){(g.rd||[]).forEach((a,i)=>{const r=rd[i];if(!r)return;r.place=a[6];r.lap=a[7];r.fin=a[8];r.ft=a[9];r.out=!!a[10];
  if(i===K.myIdx){for(const e of a[11]||[])if((e[0]|0)>r.evSeen){r.evSeen=e[0]|0;onEv(r,e[1],e[2])}return}
  r.td=a[0];r.tzz=a[1];r.y=a[2];r.ang=a[3]/100;r.vx=a[4]/10;r.fl=a[5];r.cr=unCr(a[12]);r.pose=a[13]|0;r.sc=a[14]||0;if(r.gx==null){r.d=r.td;r.z=r.tzz;r.gx=1}});
 const cm=new Map(crates.map(c=>[c.id,c]));crates=(g.cr||[]).map(x=>({id:x[0],x:x[1],z:x[2],got:cm.get(x[0])&&cm.get(x[0]).got}));
 const om=new Map(oils.map(o=>[o.id,o]));oils=(g.ol||[]).map(x=>({id:x[0],x:x[1],z:x[2],own:x[3],at:om.get(x[0])?om.get(x[0]).at:K.tick,gone:om.get(x[0])&&om.get(x[0]).gone}));elimT=g.el|0}
function follow(){for(const r of rd){if(r.i===K.myIdx||r.td==null)continue;r.td+=r.vx;const dd=r.td-r.d;if(Math.abs(dd)>60)r.d=r.td;else r.d+=r.vx+dd*.2;r.z+=(r.tzz-r.z)*.3;r.wheel+=r.vx/8}vis()}
function onFx(k,a){if(k==='f'){const r=rd[a[0]];if(r&&r.i===K.myIdx)sfx('pick')}}

/* ---------- CPU riders ---------- */
function bot(i){const r=rd[i];if(!r||r.out)return{};const o={fire:true},x=r.d,lvl=K.cpu;
 if(r.cr||r.stall>0)return o;
 if(r.gr&&r.heat<[40,58,72][lvl]&&slope(x)<.25)o.alt=true;
 if(r.gr&&!(r.lc>K.tick)){const cost=z=>{let c=Math.abs(z-r.tz)*.4;for(let a=16;a<150;a+=8){if(inMud(x+a,z))c+=1.5;if(r.heat>35&&onCool(x+a,z))c-=5}
   for(const q of rd)if(q!==r&&!q.out){const dx=near(q.d,x);if(Math.abs(q.z-z)<.5&&dx>8&&dx<70&&q.vx<r.vx+.2)c+=6}for(const ol of oils){const dx=near(ol.x,x);if(ol.z===z&&dx>0&&dx<110)c+=8}return c};
  let best=r.tz,bc=cost(r.tz)-.6;for(let z=0;z<LANES;z++){const c=cost(z)+(Math.random()-.5)*[2,1,.3][lvl];if(c<bc){bc=c;best=z}}
  if(best>r.tz)o.up=true;else if(best<r.tz)o.down=true;r.lc=K.tick+(best!==r.tz?16:6)}
 if(!r.gr){const g0=hAt(x),t=Math.max(2,(r.vy+Math.sqrt(Math.max(0,r.vy*r.vy+2*GRAV*Math.max(0,r.y-g0))))/GRAV),want=gAngAt(x+r.vx*t)+(r.err||0),pred=r.ang+r.av*Math.min(t,20)*4;
  if(r.air===1)r.err=(Math.random()-.5)*[.55,.25,.08][lvl];if(pred>want+.06)o.left=true;else if(pred<want-.06)o.right=true}
 if(r.item===3&&rd.some(q=>q!==r&&Math.abs(q.z-r.z)<.5&&near(r.d,q.d)>10&&near(r.d,q.d)<60))o.b3=true;
 return o}

/* ---------- pixel art ---------- */
const P=X.PAL,U=h=>{const c=X.hex(h);return(255<<24|c[2]<<16|c[1]<<8|c[0])>>>0};
const THEMES=[{n:'STADIUM',sky:['#2058c0','#60a0ff','#a0f0ff'],dirt:['#c49058','#e8c088','#8c5c34','#5a3a20'],grass:['#38a038','#88dc48','#1c5c30'],stand:'#2c2638',night:0},
 {n:'DESERT',sky:['#b8202c','#e06818','#ffa040'],dirt:['#e8c088','#fff0c0','#c49058','#8c5c34'],grass:['#c49058','#e8c088','#8c5c34'],stand:'#462818',night:0},
 {n:'NIGHT',sky:['#100c18','#2c2638','#6838a8'],dirt:['#8c5c34','#c49058','#5a3a20','#462818'],grass:['#1c5c30','#38a038','#100c18'],stand:'#100c18',night:1}];
const IMG={};
// crowd: little fans in many shirt colours, a second frame with arms up
function crowd(th,cheer){const k='cr'+th.n+cheer;if(IMG[k])return IMG[k];const W=256,H=44,c=X.mk(W,H),g=c.getContext('2d'),rr=RA.util.mulberry(11);
 g.fillStyle=th.stand;g.fillRect(0,0,W,H);
 const shirts=['#b8202c','#2058c0','#f0c020','#38a038','#e8e4dc','#e06818','#6838a8','#30c8e0','#f070c0'],skins=['#f0b888','#c07850','#7c4a24'],hair=['#100c18','#7c4a24','#f0c020','#462818'];
 for(let row=0;row<5;row++){g.fillStyle=X.PAL.K;g.fillRect(0,row*9+7,W,2);
  for(let x=(row&1)*2;x<W;x+=5){if(rr()<.08)continue;const sh=shirts[Math.floor(rr()*shirts.length)],sk=skins[Math.floor(rr()*3)],hr=hair[Math.floor(rr()*4)],y=row*9+1,up=cheer&&rr()<.6;
   g.fillStyle=sh;g.fillRect(x,y+4,4,3);g.fillStyle=sk;g.fillRect(x+1,y+1,2,3);g.fillStyle=hr;g.fillRect(x+1,y,2,1);if(up){g.fillStyle=sk;g.fillRect(x,y,1,3);g.fillRect(x+3,y,1,3)}}}
 return IMG[k]=c}
function ads(){if(IMG.ads)return IMG.ads;const L=[['THRILL!','#fff07c','#b8202c'],['RETRO ARENA','#ffffff','#2058c0'],['20 RIDERS','#100c18','#88dc48'],['TURBO!','#ffffff','#e06818']],W=L.length*72,c=X.mk(W,11),g=c.getContext('2d');
 L.forEach((a,k)=>{g.fillStyle=X.PAL.k;g.fillRect(k*72,0,72,11);g.fillStyle=a[2];g.fillRect(k*72+1,1,70,9);txt(g,a[0],k*72+36,2,{col:a[1],align:'center',shadow:false})});return IMG.ads=c}
function skyImg(th,h){const k='s'+th.n+h;if(IMG[k])return IMG[k];const c=X.mk(4,h),g=c.getContext('2d');
 for(let y=0;y<h;y++)for(let x=0;x<4;x++){const t=y/Math.max(1,h-1)*2,i=Math.min(1,Math.floor(t)),f=t-i;g.fillStyle=X.dither(x,y,f)?th.sky[i+1]:th.sky[i];g.fillRect(x,y,1,1)}return IMG[k]=c}
function towerImg(){return IMG.tw||(IMG.tw=X.sprite(['kkkkkkkkkkkk','kYWYkYWYkYWk','kWYWkWYWkWYk','kkkkkkkkkkkk','.....kk.....','.....Kk.....','.....Kk.....','.....Kk.....','.....Kk.....','.....Kk.....','.....Kk.....','....kKKk....']))}
function glowImg(){if(IMG.gl)return IMG.gl;const c=X.mk(28,22),g=c.getContext('2d');g.fillStyle='#fff07c';for(let y=0;y<22;y++)for(let x=0;x<28;x++){const d=Math.hypot(x-14,(y-4)*1.4)/16;if(d<1&&X.dither(x,y,(1-d)*.45))g.fillRect(x,y,1,1)}return IMG.gl=c}
function crate(){return IMG.crate||(IMG.crate=X.sprite(['kkkkkkkkk','kTTTTTTNk','kTNNNNNDk','kTNkWkNDk','kTNNWkNDk','kTNNkNNDk','kTNNNNNDk','kTNNkNNDk','kNDDDDDDk','kkkkkkkkk']))}
function lightsImg(n){const k='l'+n;if(IMG[k])return IMG[k];const m=[n>0&&n<4?'RR':n>=4?'dd':'dd',n>1&&n<4?'RR':'dd',n>2&&n<4?'RR':'dd',n>=4?'LL':'ee'].join('K'),row='kK'+m+'Kk';
 return IMG[k]=X.sprite(['.'+'k'.repeat(row.length-2)+'.','kK'+'K'.repeat(row.length-4)+'Kk',row,row,'kK'+'K'.repeat(row.length-4)+'Kk','.'+'k'.repeat(row.length-2)+'.'])}

/* ---------- drawing one view ---------- */
const cams=[];let SCR=null,trackCv=null,trackIm=null;
function view(g,r,vx,vy,vw,vh,ci,small){const th=THEMES[TR.theme]||THEMES[0];let cam=cams[ci];if(!cam||cam.i!==r.i){cam=cams[ci]={i:r.i,x:r.d}}
 const hudH=small?11:28,base=vy+vh-hudH-(small?14:30),farY=base-(LANES-.5)*LH,ax=Math.round(vw*.3);
 const cx=r.d+WB/2;cam.x+=(cx-cam.x)*.25;if(Math.abs(cx-cam.x)>200)cam.x=cx;
 const shx=!small&&shake>.4?Math.round((Math.random()-.5)*shake):0,shy=!small&&shake>.4?Math.round((Math.random()-.5)*shake):0;
 const SX=(x,z)=>vx+ax+shx+Math.round(x-cam.x)+Math.round(z*SKEW),SY=(h,z)=>shy+Math.round(base-z*LH-h);
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 // sky, stands (parallax), ad boards, barrier
 const standH=small?20:44,standY=farY-14-standH;
 g.drawImage(skyImg(th,Math.max(4,standY-vy+2)),vx,vy,vw,Math.max(4,standY-vy+2));
 if(th.night){const tw=towerImg(),gl=glowImg();for(let k=-1;k<vw/110+1;k++){const lx=vx+k*110-(Math.floor(cam.x*.35)%110);g.drawImage(gl,lx-8,standY-gl.height+6);g.drawImage(tw,lx,standY-tw.height+2)}
  for(let k=0;k<26;k++){g.fillStyle=k%3?'#9a94a8':'#ffffff';g.fillRect(vx+(k*53)%vw,vy+(k*29)%Math.max(1,standY-vy-14),1,1)}}
 {const cr=crowd(th,texts.some(t=>t.s==='PERFECT!'&&Math.abs(near(t.d,cam.x))<200)&&(K.tick>>3)&1),sh=standH,off=Math.floor(cam.x*.5)%256;for(let x=-off;x<vw;x+=256)g.drawImage(cr,0,44-sh,256,sh,vx+x,standY,256,sh)}
 {const ad=ads(),off=Math.floor(cam.x*.8)%ad.width;for(let x=-off;x<vw;x+=ad.width)g.drawImage(ad,vx+x,standY+standH)}
 const by=standY+standH+11;g.fillStyle=th.grass[2];g.fillRect(vx,by,vw,farY-by);
 // the track: painted pixel by pixel, far lanes first; ramps rise as solid dirt
 const top=Math.max(vy,farY-40),bot2=base+5+10,TH=bot2-top;
 if(!trackCv||trackCv.width!==vw||trackCv.height!==TH){trackCv=X.mk(vw,TH);trackIm=trackCv.getContext('2d').createImageData(vw,TH)}
 const px=new Uint32Array(trackIm.data.buffer);px.fill(0);
 const D=th.dirt.map(U),Mu=[U('#5a3a20'),U('#462818'),U('#7c4a24')],Co=[U('#30c8e0'),U('#a0f0ff'),U('#2058c0')],Wh=U('#e8e4dc'),Bk=U('#100c18');
 const steps=Math.round(LANES*LH)+2;
 for(let s=0;s<vw;s++){let prev=-1;
  for(let k=0;k<=steps;k++){const z=LANES-.5-k/LH,wx=cam.x+(s-ax)-z*SKEW,h=hAt(wx),y0=Math.round(base-z*LH-h)-top;
   const zr=Math.floor((z+.5)*LH),sl=(hAt(wx+2)-hAt(wx-2))/4,lane=Math.floor(z+.5),xx=mod(wx,TR.L),ix=Math.floor(wx);
   let c;
   if(xx<4||xx>TR.L-4)c=((Math.floor(xx)>>1)+(zr>>1))&1?Wh:Bk;
   else if(TR.mud.some(m=>xx>m[0]+((zr*7)&3)&&xx<m[1]-((zr*5)&3)&&Math.abs(z-m[2])<.42))c=Mu[(ix+zr)%5===0?2:X.dither(ix,zr,.35)?1:0];
   else if(TR.cool.some(cc=>{const q=xx-cc[0];return q>0&&q<24&&Math.abs(z-cc[1])<.4&&((7-Math.floor(q)%8)-Math.abs(zr%LH-LH/2)+1+80)%8<3}))c=Co[(K.tick>>2)&1];
   else{let base2=sl>.12?1:sl<-.12?2:0;c=D[base2];if(zr%LH===0)c=(ix>>2)&1?D[base2===2?0:1]:c;else if(RA.util.hash(ix>>1,zr)%13===0)c=D[base2===1?0:base2===2?3:2]}
   // nearer rows paint over farther ones: a rising ramp hides the dirt behind it
   const a=prev<0?y0:y0>prev?prev+1:y0,b=prev<0?y0:Math.max(y0,prev);for(let y=Math.max(0,a);y<=Math.min(TH-1,b);y++)px[y*vw+s]=c;
   prev=Math.max(prev,y0)}
  // the front face down to the trackside, darker dirt with stripes
  const wx=cam.x+(s-ax)+.5*SKEW,yf=Math.round(base+5-hAt(wx))-top;for(let y=Math.max(0,yf+1);y<TH;y++)px[y*vw+s]=((y+top)%4===0)?D[3]:D[2];if(yf>=0&&yf<TH)px[yf*vw+s]=D[1]}
 trackCv.getContext('2d').putImageData(trackIm,0,0);g.drawImage(trackCv,vx,top);
 g.fillStyle=th.grass[0];g.fillRect(vx,bot2,vw,vy+vh-bot2);g.fillStyle=th.grass[1];const gh=vy+vh-hudH-bot2;if(gh>2)for(let x=0;x<vw;x++){const wx=x+Math.floor(cam.x);if(RA.util.hash(wx,3)%6===0)g.fillRect(vx+x,bot2+1+RA.util.hash(wx,9)%(gh-1),1,1)}
 // things on the track, far lanes first
 const L=[];for(const c of crates){if(c.got)continue;const dx=near(c.x,cam.x);if(Math.abs(dx)<vw)L.push([c.z,cam.x+dx,0,c])}
 for(const o of oils){if(o.gone)continue;const dx=near(o.x,cam.x);if(Math.abs(dx)<vw)L.push([o.z+.01,cam.x+dx,1,o])}
 for(const q of rd){if(q.out)continue;const dx=near(q.d,cam.x);if(Math.abs(dx)<vw)L.push([q.z,cam.x+dx,2,q])}
 L.sort((a,b)=>b[0]-a[0]||a[1]-b[1]);
 for(const[z,x,ty,o]of L){const sx=SX(x,z),gy=SY(hAt(x),z);
  if(ty===0){const im=crate(),b=(K.tick>>4)&1;g.drawImage(im,sx-4,gy-11-b)}
  else if(ty===1){g.fillStyle=P.k;g.fillRect(sx-7,gy-1,14,2);g.fillRect(sx-5,gy-2,10,1);g.fillStyle=P.v;g.fillRect(sx-3,gy-2,3,1)}
  else drawRider(g,o,sx,SY(o.y,z),gy,r)}
 for(const p of parts){const sx=SX(p.x,p.z),sy=SY(p.y,p.z);g.fillStyle=p.c;const s=p.smoke?2:1;g.fillRect(sx,sy,s,s)}
 for(const t of texts){if(t.who!==r.i&&!t.all)continue;const sx=SX(t.d,t.z),sy=SY(t.y,t.z);if(sx>vx-40&&sx<vx+vw+40)txt(g,t.s,sx,sy-8,{col:t.col,align:'center',outline:P.k})}
 hud(g,r,vx,vy,vw,vh,small,cam);g.restore();if(small){g.fillStyle=P.k;g.fillRect(vx,vy+vh-1,vw,1)}}
function frameImg(col,pose){return X.recolor(ART.poses[POSES[pose]||'sit'],col,null,'pose'+pose)}
function bareImg(col){return X.recolor(ART.bare,col,null,'bare')}
function wheelImg(f){const k='w'+f;return IMG[k]||(IMG[k]=X.sprite(ART.wheels[f&3]))}
function aloneImg(col,name,flip){const k='a'+name+col+(flip?1:0);if(IMG[k])return IMG[k];const s=X.recolor(ART.alone[name],col,null,'al'+name);return IMG[k]=flip?X.flipX(s):s}
// one bike on screen: (sx, sy) = where the rear tyre meets the ground
function drawRider(g,q,sx,sy,gy,me){const fl=flags(q),cr=q.cr,ang=q.ang||0,ca=Math.cos(ang),sa=Math.sin(ang);
 g.fillStyle='rgba(16,12,24,.45)';g.fillRect(sx-2,gy-1,WB+6,2);g.fillRect(sx+1,gy-2,WB,1);
 const rax=sx+WR*sa,ray=sy-WR*ca,fax=rax+WB*ca,fay=ray+WB*sa,wf=Math.floor(q.wheel||0)&3,wi=wheelImg(wf);
 g.drawImage(wi,Math.round(rax-5),Math.round(ray-5));g.drawImage(wi,Math.round(fax-5),Math.round(fay-5));
 // frame + rider: the composite's rear axle is at (8, 26), its centre at (18, 17); the suspension lowers it
 let sc=q.sc||0;if(!cr&&(q.vx||0)<.3&&K.tick>=CD)sc+=(K.tick>>2)&1?.6:0;   // idling engine shakes the bike
 const ox=10,oy=-9+sc,cx=rax+ox*ca-oy*sa,cy=ray+ox*sa+oy*ca,im=X.rot(cr?bareImg(q.col):frameImg(q.col,q.pose|0),ang);
 g.drawImage(im,Math.round(cx-im.width/2),Math.round(cy-im.height/2));
 if(fl&8&&!cr){const ex=rax-3*ca+5*sa,ey=ray-3*sa-5*ca;g.fillStyle=(K.tick>>1)&1?'#ffa040':'#fff07c';g.fillRect(Math.round(ex-3),Math.round(ey),3,2);g.fillStyle='#f05050';g.fillRect(Math.round(ex-5),Math.round(ey),2,1)}
 if(fl&4&&!cr&&(K.tick>>3)&1){g.fillStyle=P.G;g.fillRect(Math.round(cx-2),Math.round(cy-8),2,2);g.fillRect(Math.round(cx),Math.round(cy-11),3,3)}
 if(cr){// the rider: tumbling, lying, running back, climbing on
  const rx=sx+(cr.x-q.d),ry=gy-(cr.y-hAt(cr.x));let im2;
  if(cr.ph===0)im2=X.rot(aloneImg(q.col,'ball'),cr.rot%(Math.PI*2)-Math.PI);
  else if(cr.ph===1)im2=aloneImg(q.col,'flat');
  else im2=aloneImg(q.col,(cr.t>>2)&1?'runA':'runB',cr.ph===2&&cr.x>q.d+6);
  g.drawImage(im2,Math.round(rx-im2.width/2),Math.round(ry-im2.height+(cr.ph===0?im2.height/2-4:0)))}
 const st=K.seats[q.i];if(q!==me&&!K.demo&&st&&(st.ctrl==='net'?!!st.peer:st.ctrl!=='cpu'))txt(g,q.name.slice(0,10),sx+WB/2,sy-40,{col:q.col,align:'center',outline:P.k})}
function hud(g,r,vx,vy,vw,vh,small,cam){const S=K.S,H=small?11:28,y=vy+vh-H;
 g.fillStyle=P.k;g.fillRect(vx,y,vw,H);g.fillStyle=P.K;g.fillRect(vx,y,vw,1);
 if(K.tick<CD+50){const n=K.tick<CD?Math.floor(K.tick/(CD/4)):4,li=lightsImg(n);g.drawImage(li,vx+vw/2-li.width,vy+(small?2:14),li.width*2,li.height*2);
  if(n>=4)txt(g,'GO!',vx+vw/2,vy+(small?18:32),{col:'#88dc48',align:'center',scale:small?2:3,outline:P.k});
  if(K.tick<CD&&K.tick%(CD/4|0)===0&&K.tick>0&&isMine(r))RA.audio.blip(440);if(K.tick===CD&&isMine(r))RA.audio.blip(880)}
 if(K.demo){txt(g,'THRILL BIKE',vx+vw/2,y+(small?2:10),{col:'#fff07c',align:'center'});return}
 // temperature: segmented gauge like the original
 const segs=small?10:16,gx=vx+(small?4:6),gy2=y+(small?3:14),hot=r.heat/100;
 if(!small)txt(g,r.stall>0?((K.tick>>3)&1?'OVERHEAT':''):'TEMP',gx,y+4,{col:r.stall>0?'#f05050':'#9a94a8',shadow:false});
 for(let k=0;k<segs;k++){const on=k<Math.round(hot*segs),c=k<segs*.5?'#30c8e0':k<segs*.8?'#f0c020':'#f05050';g.fillStyle=on?c:P.K;g.fillRect(gx+k*4,gy2,3,small?5:8)}
 // progress strip with every rider, lap, time, place
 const p0=vx+(small?segs*4+12:segs*4+16),p1=vx+vw-(small?58:70),tot=S.laps*TR.L,py=y+(small?5:6);g.fillStyle=P.K;g.fillRect(p0,py,p1-p0,2);
 for(let k=1;k<S.laps;k++)g.fillRect(p0+Math.round(k/S.laps*(p1-p0)),py-1,1,4);g.fillStyle=P.W;g.fillRect(p1,py-2,2,6);
 for(const q of rd){if(q.out)continue;const t=Math.max(0,Math.min(1,q.d/tot)),x=Math.round(p0+t*(p1-p0));g.fillStyle=q===r?P.W:q.col;g.fillRect(x-1,py-(q===r?2:1),q===r?3:2,q===r?6:4)}
 if(!small){txt(g,'LAP '+Math.min(S.laps,r.lap+1)+'/'+S.laps,p0,y+14,{col:'#e8e4dc',shadow:false});txt(g,tm(r.fin?r.ft:Math.max(0,K.tick-CD)),p0+60,y+14,{col:'#9a94a8',shadow:false});
  if(K.mode===2)txt(g,'OUT IN '+Math.ceil((1800-elimT)/60),p1-2,y+14,{col:elimT>1500&&(K.tick>>3)&1?'#f05050':'#ffa040',align:'right',shadow:false});
  if(r.item===3)txt(g,'Q: OIL',p1-2,y+20,{col:'#9a94a8',align:'right',shadow:false})}
 const pc=r.place===1?'#fff07c':r.place<=3?'#e8e4dc':'#9a94a8';txt(g,r.place+'',vx+vw-(small?20:26),y+(small?2:5),{col:pc,align:'right',scale:small?1:2,shadow:false});txt(g,ord(r.place).replace(/^\d+/,''),vx+vw-(small?5:6),y+(small?2:5),{col:pc,align:'right',shadow:false});
 // first seconds: how to ride; in the air: which way to lean
 const t=K.tick-CD;if(!small&&t>0&&t<420&&isMine(r))txt(g,t<210?'HOLD SPACE = GAS   E = TURBO':'W/S = LANE   A/D = LEAN IN THE AIR',vx+vw/2,vy+vh-H-12,{col:'#fff07c',align:'center',outline:P.k});
 if(!r.gr&&!r.cr&&isMine(r)){const g0=hAt(r.d),tt=Math.max(2,(r.vy+Math.sqrt(Math.max(0,r.vy*r.vy+2*GRAV*Math.max(0,r.y-g0))))/GRAV),want=gAngAt(r.d+r.vx*tt),d=r.ang+r.av*Math.min(tt,20)*4-want;
  if(Math.abs(d)>.25)txt(g,d>0?'< LEAN BACK (A)':'LEAN FWD (D) >',vx+vw/2,vy+(small?2:28),{col:'#fff07c',align:'center',outline:P.k})}
 const f=r.fx||{};let cy=vy+(small?2:42);for(const[k,max,it]of[['nitro',300,1],['cool',420,2]])if(f[k]>0){txt(g,ITEMS[it].n,vx+6,cy,{col:ITEMS[it].c,outline:P.k});g.fillStyle=ITEMS[it].c;g.fillRect(vx+6,cy+8,Math.round(40*f[k]/max),1);cy+=11}
 if(r.fin)txt(g,ord(r.fin)+' PLACE',vx+vw/2,vy+vh*.3,{col:'#fff07c',align:'center',scale:2,outline:P.k});if(r.out)txt(g,'ELIMINATED',vx+vw/2,vy+vh*.3,{col:'#f05050',align:'center',scale:2,outline:P.k})}
const tm=t=>{const s=t/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor(s*100)%100).padStart(2,'0')};
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);
 if(!TR){g.fillStyle=P.k;g.fillRect(0,0,W,H);SCR.present(ctx,W,H);return}
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=rd.slice().sort((a,b)=>a.place-b.place).find(r=>!r.out)||rd[0];fs=lead?[lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length;g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);
const w=SCR.w,h=SCR.h-(K.demo?0:9),rects=n<=1?[[0,0,w,h]]:n===2?[[0,0,w,h>>1],[0,h>>1,w,h-(h>>1)]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];
 fs.forEach((i,k)=>{const q=rects[k];view(g,rd[i],q[0],q[1],q[2],q[3],k,n>1)});
 SCR.present(ctx,W,H);engineSound();if(shake>0)shake*=.85}
// engine note for the rider you're driving
function engineSound(){const AC=RA.audio.ctx,me=K.demo||K.state!=='play'?null:rd[K.myIdx>=0?K.myIdx:K.seats.findIndex(s=>s.ctrl!=='cpu'&&s.ctrl!=='net')];
 if(!AC){return}if(!me||RA.menu.current&&RA.menu.current.id!=='excite'){if(engine){engine.g.gain.setTargetAtTime(0,AC.currentTime,.05)}return}
 if(!engine){const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=700;g.gain.value=0;
  o.connect(f);o2.connect(f);f.connect(g);g.connect(AC.destination);o.start();o2.start();engine={o,o2,g}}
 const V=RA.audio.vol,vol=V.mute?0:.035*V.master/100*V.sfx/100,f=me.cr||me.stall>0?38:45+me.vx*34+(me.gr?0:20);
 engine.o.frequency.setTargetAtTime(f,AC.currentTime,.05);engine.o2.frequency.setTargetAtTime(f*.5,AC.currentTime,.05);engine.g.gain.setTargetAtTime(vol,AC.currentTime,.08)}
K=RA.kit({id:'excite',name:'THRILL BIKE',kind:'Motocross',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'Side-view motocross for up to 20 riders in pixel art: hold the gas, use the turbo without overheating, lean to land clean, and never ride into someone\'s back wheel.',
 blurb:'Hold Space for gas, E for turbo (watch the temperature!), W / S change lane, A / D lean in the air.',
 howto:'Space / click gas, E / Shift / right-click turbo, W / S lane, A / D lean back / forward, Q drops oil. Gamepad: A gas, B turbo, stick for lanes and lean. Touch: the button is gas, the turbo is automatic.',
 icon:['..........','.....kk...','....krrk..','..kkrrrkk.','.krrrrrrsk','kkkkkskkkk','kwk...kwk.','kkk...kkk.','..........','..........'],
 music:MUSIC,fireLabel:'GAS',
 modes:[['RACE','Everyone for themselves.'],['TEAM RACE','Red vs blue: points for every finishing place.'],['ELIMINATOR','Every 30 seconds the rider in last place is out.']],
 settings:[['laps','Laps',[[3,'3 laps'],[2,'2 laps'],[5,'5 laps'],[1,'1 lap']]],['theme','Track',[['rnd','Random'],[0,'Stadium'],[1,'Desert'],[2,'Night']]],['items','Crates',[['on','On'],['party','Wild party'],['off','Off']]],['len','Time limit',[[0,'None'],[5,'5 min']]]],
 kb:[['SPACE LMB','gas'],['E SHIFT','turbo'],['W S','lane'],['A D','lean'],['Q','oil'],['C','chat'],['ESC','menu']],pad:[['A','gas'],['B','turbo'],['LS','lane / lean'],['X','oil'],['START','menu']],
 ach:[{id:'first',name:'First Heat',desc:'Finish your first race',test:s=>s.played>=1,unlock:'title:Rider'},{id:'win1',name:'Champion',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Motocross Champ'},
  {id:'perf10',name:'Smooth Operator',desc:'10 perfect landings in one race',test:(s,m)=>m.perfect>=10,unlock:'title:Smooth Operator'},{id:'clean',name:'Clean Race',desc:'Win without crashing',test:(s,m)=>m.won&&m.clean,unlock:'title:Clean Rider'}],
 alive:i=>!!rd[i]&&!rd[i].out,out:i=>!!rd[i]&&rd[i].out,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>TR?(THEMES[TR.theme]||THEMES[0]).n:'',
 ranks:()=>rd.slice().sort((a,b)=>a.place-b.place).map(r=>[r.name,r.col,r.fin?tm(r.ft):r.out?'eliminated':'lap '+Math.min(K.S.laps,r.lap+1)]),
 result:(i,w)=>{const r=rd[i];return{won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),perfect:r.perfect|0,clean:r.crashes?0:1,kills:0}}});
window.__eb={get rd(){return rd},K,get tr(){return TR},bot:i=>bot(i)};
})();
