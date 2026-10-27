/* TRACK STARS for Retro Arena: the button-bashing athletics meet for up to 20, with four track and field events, in pixel art.
   The original it follows: alternate two keys as fast as you can to sprint; hold the action key to set your angle and
   let go to jump or throw; step over the line and it's a foul. Four events: 100M DASH, LONG JUMP, 110M HURDLES, JAVELIN.
   The 20-player twist: everyone competes at once, a lane each, and every event hands out points by finishing place
   (gold, silver and bronze are counted too). Most points after the last event wins the meet.
   First seconds: each event opens with its own instruction card, and a tap-rate meter shows how fast you are bashing.
   Keys: A / D (or the arrow keys) alternately to run. Space (or W) jumps a hurdle; hold it to set the angle in the long
   jump and javelin, let go to jump / throw. Touch: tap the left / right buttons alternately, the fire button jumps.
   Online is lag-free (RA.kit localFirst): you run and jump on your own device; the host starts each event and keeps the score.
   The athlete sprites are painted in tools/art/track (python), exported as ART below; edit track_tpl.js and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
const ART={"a": {"r1": ["..................", ".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", "......khhhssksk...", "......khhsssssk...", ".......khsssSk....", "........ksSSksk...", ".......k1122ksk...", "......k11ssssk....", ".....kS12sssssk...", "....kSk1222sssk...", "....kSkk12223k....", "....kSkkaaaabk....", "....kSkkaaabbk....", ".....k.kSsssssk...", "......kSSsssssk...", ".....kSSSkkkssk...", "....kSSSk..kssk...", "...kSSSk...kwwwk..", "...kSSk....kssk...", "..kGGSk.....kk....", "..kSSk............", "...kk.............", ".................."], "r2": [".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", "......khhhssksk...", "......khhsssssk...", ".......khsssSk....", "........ksSSk.....", ".......k1122k.....", "......k11ss23k....", "......k12ss23k....", "......k12ss23k....", "......kS1ss23k....", ".......kasssbk....", ".......kaaabbk....", ".......kSsskk.....", ".......kSssk......", "........kssSk.....", "........kssSk.....", "........kssk......", ".......kGssk......", ".......kSssk......", "........kssk......", "........kwwwk.....", "........kssk......", ".........kk......."], "r3": ["..................", ".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", "......khhhssksk...", "......khhsssssk...", ".......khsssSk....", "........ksSSkSk...", ".......k1122kSk...", "......k11ss23k....", ".....ksssss23k....", "....ksssss223k....", "....kssk12223k....", "....kskkaaaabk....", "....kskkaaabbk....", ".....k.kSssSSSk...", "......kssssSSSk...", ".....ksssskkSSk...", "....kssskk.kSSk...", "...ksssk...kGGGk..", "...kssk....kSSk...", "..kwwsk.....kk....", "..kssk............", "...kk.............", ".................."], "r4": [".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", "......khhhssksk...", "......khhsssssk...", ".......khsssSk....", "........ksSSk.....", ".......k1122k.....", "......k11ss23k....", "......k1sss23k....", "......k1ss223k....", "......ksss223k....", "......kssaaabk....", ".......kasabbk....", ".......kSsskk.....", ".......kSsssk.....", ".......kSSsssk....", ".......kSSsssk....", ".......kSSssk.....", ".......kSwwwk.....", ".......kSssk......", ".......kSSk.......", ".......kGGGk......", ".......kSSk.......", "........kk........"], "stand": ["........kkkk......", ".......khhhhk.....", "......khhhhhsk....", ".....khhhhsssk....", ".....khhhssksk....", ".....khhsssssk....", "......khsssSk.....", ".......ksSSk......", "......k1122k......", ".....k112ss3k.....", ".....k122ss3k.....", ".....k122ss3k.....", "......k12ss3k.....", "......kaassbk.....", "......kaasbbk.....", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kGwwwk.....", ".......kSssk......", "........kkk......."], "set": ["..................", "..................", "..................", "..................", "..................", "..................", "...........kkkk...", "..........khhhhk..", ".........khhhhhsk.", "........khhhhsssk.", "........khhhssksk.", "........khhsssssk.", ".........khsssSk..", "..........ksSSk...", ".........k1122k...", "........k112223k..", "........k122223k..", "........k122223k..", ".........k12223k..", ".........kaaaabk..", ".........kassbbk..", ".........kSsskk...", ".........kSssk....", "......kkkkSssk....", ".....kSsskSssk....", "......kkk.kkk....."], "take": [".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", "......khhhssksk...", "......khhsssssk...", ".......khsssSk....", "........ksSSk.....", ".......k1122k.....", "......k1sss23k....", ".....ksssss23k....", "....kssss2223k....", "...kskkk12223k....", "....k..kaaaabk....", ".......kaaasssk...", ".......kSsssssk...", "......kSSssssssk..", "......kSSkkkkssk..", "......kSSk..kwwwk.", ".....kSSSk..kssk..", "....kSSSk....kk...", "....kSSk..........", "....kSSk..........", "...kGGSk..........", "...kSSk...........", "....kk............"], "fly": ["........kkkk......", ".......khhhhk.....", "......khhhhhsk....", ".....khhhhssssk...", ".....khhhssksk....", ".....khhsssssk....", "......khsssssk....", ".......ksSsssk....", "......k112ssk.....", ".....k112sssk.....", ".....k122ss3k.....", ".....k122223k.....", "......k12223k.....", "......kaaaabk.....", "......kaaabbk.....", ".......kSssskk....", ".......kSsssssk...", "........kkSsssskk.", "..........kkSsssGk", "............kkswwk", "..............kssk", "...............kk.", "..................", "..................", "..................", ".................."], "land": ["..................", "..................", "..................", "..................", "..................", "........kkkk......", ".......khhhhk.....", "......khhhhhsk....", ".....khhhhsssk....", ".....khhhssksk....", ".....khhsssssk....", "......khsssSk.....", ".......ksSSk......", "......k1122k......", ".....k112223k.....", ".....k122ss3k.....", ".....k122ssssk....", "......k122sssskk..", "......kaaaabssssk.", "......kaaabbkkkk..", ".......kkkkk......", "..................", "..................", "..................", "..................", ".................."], "hop": ["..........kkkk....", ".........khhhhk...", "........khhhhhsk..", ".......khhhhsssk..", ".......khhhssksk..", ".......khhsssssk..", "........khsssSk...", ".........ksSSk....", "........k1122k....", ".......k1ss223k...", "......kssss223Sk..", ".....kssss2223k...", "....ksssk12223k...", "...kskkkkaaaabk...", "....kkkkkaaabbkkk.", "....kSSSSssssssswk", "...kSSSSSssssssssk", "...kSSkkkkkkkkkkk.", "..kGGSk...........", "..kSSk............", "...kk.............", "..................", "..................", "..................", "..................", ".................."], "fall": ["..................", "..................", "..................", "..................", "..................", "..................", "...........kkkk...", "..........khhhhk..", ".........khhhhhsk.", "........khhhhsssk.", "........khhhssksk.", "........khhsssssk.", ".........khsssSk..", "..........ksSSk...", ".........k1122k...", "........k112223k..", "........k122223k..", "........k122223k..", "........kk12223k..", ".......kSssaaabk..", "......kksssaabbk..", ".....kssssSkkkk...", "....ksssskkSkk....", "...kssskk..kSSk...", "...kskk.....kkSk..", "....k.........k..."], "win": ["........kkkk......", "......kkhhhhk.....", ".....kShhhhhsk....", ".....khhhhsssk....", ".....khhhssssk....", ".....khhsssssk....", "......khsssssk....", "......kSsSsssk....", "......k11sssk.....", ".....k112ss3k.....", ".....k122ss3k.....", ".....k122223k.....", "......k12223k.....", "......kaaaabk.....", "......kaaabbk.....", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kSssk......", ".......kGwwwk.....", ".......kSssk......", "........kkk......."], "jr1": ["..................", ".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", ".....kkhhhssksk...", "....kskhhsssssk...", ".....kskhsssSk....", "......ksssSSk.....", "......ksss22k.....", "......k1sss23k....", ".....kS12ss23k....", "....kSk122223k....", "....kSkk12223k....", "....kSkkaaaabk....", "....kSkkaaabbk....", ".....k.kSsssssk...", "......kSSsssssk...", ".....kSSSkkkssk...", "....kSSSk..kssk...", "...kSSSk...kwwwk..", "...kSSk....kssk...", "..kGGSk.....kk....", "..kSSk............", "...kk.............", ".................."], "jr2": [".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", ".....kkhhhssksk...", "....kskhhsssssk...", ".....kskhsssSk....", "......ksssSSk.....", "......ksss22k.....", "......k1sss23k....", "......k12ss23k....", "......k122223k....", "......kS12223k....", ".......kaaaabk....", ".......kaaabbk....", ".......kSsskk.....", ".......kSssk......", "........kssSk.....", "........kssSk.....", "........kssk......", ".......kGssk......", ".......kSssk......", "........kssk......", "........kwwwk.....", "........kssk......", ".........kk......."], "jr3": ["..................", ".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", ".....kkhhhssksk...", "....kskhhsssssk...", ".....kskhsssSk....", "......ksssSSkSk...", "......ksss22kSk...", "......k1sss23k....", "......k12ss23k....", "......k122223k....", ".......k12223k....", ".......kaaaabk....", ".......kaaabbk....", ".......kSssSSSk...", "......kssssSSSk...", ".....ksssskkSSk...", "....kssskk.kSSk...", "...ksssk...kGGGk..", "...kssk....kSSk...", "..kwwsk.....kk....", "..kssk............", "...kk.............", ".................."], "jr4": [".........kkkk.....", "........khhhhk....", ".......khhhhhsk...", "......khhhhsssk...", ".....kkhhhssksk...", "....kskhhsssssk...", ".....kskhsssSk....", "......ksssSSk.....", "......ksss22k.....", "......k1sss23k....", "......k12ss23k....", "......k122223k....", ".......k12223k....", ".......kaaaabk....", ".......kaaabbk....", ".......kSsskk.....", ".......kSsssk.....", ".......kSSsssk....", ".......kSSsssk....", ".......kSSssk.....", ".......kSwwwk.....", ".......kSssk......", ".......kSSk.......", ".......kGGGk......", ".......kSSk.......", "........kk........"], "throw": ["..........kkkk....", ".........khhhhk...", "........khhhhhsk..", ".......khhhhsssk..", ".......khhhssksk..", ".......khhssssssk.", "........khsssssk..", ".........ksSssk...", "........k1ssssk...", "......kk1ssss3k...", ".....kSS1ss223k...", "....kSkk122223k...", "...kSk..k12223k...", "..kSk...kaaaabk...", "...k....kaaabbk...", ".......kSsskkk....", "......kSSsssk.....", "......kSSksssk....", ".....kSSSkksssk...", "....kSSSk..kssk...", "....kSSk...ksssk..", "...kSSSk....kssk..", "..kSSSk.....ksssk.", "..kGGk.......kwwwk", "..kSSk.......kssk.", "...kk.........kk.."]}};
const TM=RA.music.track,sfx=RA.audio.sfx;
const PXM=12,VMAX=11.2,EVENTS={dash:{n:'100M DASH',len:100},lj:{n:'LONG JUMP',board:40},hurd:{n:'110M HURDLES',len:110},jav:{n:'JAVELIN',line:30}};
const HURD=[...Array(10)].map((_,k)=>13.72+k*9.14),TEAMC=['#e83838','#2c78f0'],TEAMN=['Red team','Blue team'];
RA.audio.add('gun',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='highpass';f.frequency.value=900;s.connect(f);f.connect(g);g.gain.setValueAtTime(.5,now);g.gain.exponentialRampToValueAtTime(.001,now+.3);s.start(now);s.stop(now+.31)});
RA.audio.add('step',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(140,now);o.frequency.exponentialRampToValueAtTime(70,now+.03);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.04);o.connect(g);o.start(now);o.stop(now+.05)});
RA.audio.add('fan',(AC,now,g)=>{[784,988,1175,1568].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='square';o.frequency.value=f;q.gain.setValueAtTime(0,now+k*.09);q.gain.linearRampToValueAtTime(.05,now+k*.09+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.09+.16);o.connect(q);q.connect(g);o.start(now+k*.09);o.stop(now+k*.09+.17)});g.gain.value=1});
RA.audio.add('foul',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(200,now);o.frequency.setValueAtTime(150,now+.15);g.gain.setValueAtTime(.08,now);g.gain.exponentialRampToValueAtTime(.001,now+.4);o.connect(g);o.start(now);o.stop(now+.41)});
const MUSIC=[TM('Opening Ceremony',120,['C','G','Am','F'],'k...s...k...s...','c5 . e5 . g5 . c6 . b5 . g5 . d5 . g5 . a5 . e5 . c5 . e5 . f5 . a5 . c6 - - .'),
 TM('Starting Blocks',160,['Em','C','G','D'],'k.hsk.hsk.hsk.hs','e5 g5 b5 e6 d6 b5 g5 b5 c6 e6 g6 e6 d6 b5 g5 d5 b4 d5 g5 b5 a5 f#5 d5 f#5 e5 g5 b5 g5 e5 . . .')];
let K,ath=[],evList=['dash','lj','hurd','jav'],ev=0,ph='intro',pt=0,ga=0,pts=[],med=[],texts=[],parts=[],shake=0,lastRes=null;
const teamOf=i=>K.mode===1?i%2:i,ownerNet=a=>K.seats[a.i]&&K.seats[a.i].ctrl==='net',isMine=a=>K.isClient()?a.i===K.myIdx:!ownerNet(a);
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const EV=()=>evList[ev],isRun=()=>EV()==='dash'||EV()==='hurd';
/* ---------- the meet ---------- */
function start(seats,md,S,seed){evList=S.events==='sprint'?['dash','hurd']:S.events==='field'?['lj','jav']:['dash','lj','hurd','jav'];ev=0;pts=seats.map(()=>0);med=seats.map(()=>[0,0,0]);texts=[];parts=[];lastRes=null;
 ath=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,claims:[],cseq:0,cSeen:0}));beginEvent(0)}
function beginEvent(k){ev=k;ph='intro';pt=K.tick;ga=0;for(const a of ath)resetAth(a);lastRes=null;cams.length=0}
function resetAth(a){Object.assign(a,{x:0,v:0,h:0,vh:0,st:'stand',lk:null,taps:[],rate:0,ang:0,hold:false,res:null,fs:0,hits:0,stum:0,jav:null,air:0,tk:0,fh:false,bt:null,pose:'stand',jx:0,shown:false})}
// the referee: intro card, marks / set / GO, the event itself, the results board
function phaseStep(){const now=K.tick,e=EV();
 if(ph==='intro'&&now-pt>150){ph='ready';pt=now;ga=now+70+Math.floor(Math.random()*50)+(isRun()?40:0);for(const a of ath)a.st='set'}
 else if(ph==='ready'&&now>=ga){ph='go';pt=now;sfx('gun')}
 else if(ph==='go'){const lim=e==='dash'?60*25:e==='hurd'?60*30:60*16;const all=ath.every(a=>a.res!=null);if(all&&now-pt>30||now-pt>lim)finishEvent()}
 else if(ph==='done'&&now-pt>300){if(ev+1<evList.length)beginEvent(ev+1);else endMeet()}}
function finishEvent(){const e=EV(),run=isRun(),key=a=>a.res==null||a.res<0?(run?1e9:-1e9):a.res;
 const order=ath.slice().sort((a,b)=>run?key(a)-key(b):key(b)-key(a)),n=ath.length;
 order.forEach((a,k)=>{const ok=a.res!=null&&a.res>=0;pts[a.i]+=ok?n-k:0;if(ok&&k<3)med[a.i][k]++});lastRes=order.map(a=>[a.i,a.res==null?-2:a.res]);ph='done';pt=K.tick;
 if(order[0]&&order[0].res!=null&&order[0].res>=0)K.fx('w',order[0].i)}
function endMeet(){const order=ath.slice().sort((a,b)=>pts[b.i]-pts[a.i]||med[b.i][0]-med[a.i][0]);
 if(K.mode===1){const sc=[0,1].map(t=>ath.filter(a=>a.i%2===t).reduce((s,a)=>s+pts[a.i],0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}
 else K.end(order[0]?{i:order[0].i}:null)}
/* ---------- your athlete (runs on its owner's device) ---------- */
function athStep(a,inp){const e=EV();a.tk++;
 // alternate the two keys: each new key counts as a stride; the tap rate sets your top speed
 const L=!!(inp.left),R=!!(inp.right);let tap=null;if(L&&!a.pl)tap='L';if(R&&!a.pr)tap='R';a.pl=L;a.pr=R;
 const fire=!!(inp.fire||inp.up),press=fire&&!a.fh,release=!fire&&a.fh;a.fh=fire;
 if(ph==='ready'){if(tap&&isRun()&&!a.fs){a.fs=40;say(a,'FALSE START!','#f05050');sfx('foul')}return}
 if(ph!=='go'||a.st==='done'&&a.v<.05){if(a.st==='done')a.v=Math.max(0,a.v-.12);a.x+=a.v/60;return}
 if(a.fs>0&&K.tick-ga<a.fs)return;
 if(tap&&tap!==a.lk&&a.st==='run'||tap&&a.st==='set'){a.lk=tap;a.taps.push(K.tick);if(a.st==='set')a.st='run';if(isMine(a)&&a.i===meIdx()&&(a.taps.length&1))sfx('step')}
 while(a.taps.length&&K.tick-a.taps[0]>36)a.taps.shift();a.rate=a.taps.length/.6;
 const running=a.st==='run'||a.st==='hold';
 if(a.stum>0)a.stum--;
 if(running){const tgt=a.stum>0?2:a.st==='hold'?a.v*.995:Math.min(VMAX,a.rate*1.08);a.v+=Math.max(-.06,Math.min(.05,tgt-a.v))}
 else if(a.st!=='air'&&a.st!=='hop')a.v=Math.max(0,a.v-.14);
 a.x+=a.v/60;
 if(e==='dash'||e==='hurd'){const len=EVENTS[e].len;
  if(e==='hurd'){if(press&&a.st==='run'&&a.h<=0){a.st='hop';a.vh=3.6;a.air=0}
   if(a.st==='hop'){a.air++;a.vh-=9.8/60;a.h+=a.vh/60;if(a.h<=0){a.h=0;a.st='run'}}
   for(const hx of HURD){const px=a.x-a.v/60;if(px<hx&&a.x>=hx&&a.h<.55&&!(a.hit&&a.hit.has(hx))){(a.hit||(a.hit=new Set())).add(hx);a.hits++;a.v*=.55;a.stum=20;sfx('foul')}}}
  if(a.x>=len&&a.res==null){a.res=Math.round(((K.tick-ga)/60+(a.fs?.3:0))*100)/100;a.st='done';claim(a,'r',a.res)}}
 else if(e==='lj'){const B=EVENTS.lj.board;
  if(a.st==='run'&&press){a.st='hold';a.ang=8}
  if(a.st==='hold'){a.ang=Math.min(70,a.ang+1.1);if(release||a.x>B+1.5){if(a.x>B){foul(a)}else{a.st='air';const th=a.ang*Math.PI/180;a.vx=a.v*Math.cos(th);a.vh=a.v*Math.sin(th)*.9;a.jx=a.x;a.air=0}}}
  if(a.st==='run'&&a.x>B+1.5)foul(a);
  if(a.st==='air'){a.air++;a.vh-=9.8/60;a.h+=a.vh/60;a.x+=(a.vx-a.v)/60;if(a.h<=0){a.h=0;a.st='land';a.v=0;a.res=Math.round((a.x-B)*100)/100;if(a.res<0)a.res=0;claim(a,'r',a.res);sfx('step');for(let k=0;k<8;k++)parts.push({x:a.x,h:.1,vx:(Math.random()-.3)*2,vh:Math.random()*2,t:30,col:'#e8c088',lane:a.i})}}
  if(a.st==='land'){a.air++;if(a.air>40)a.st='done'}}
 else if(e==='jav'){const Ln=EVENTS.jav.line;
  if(a.st==='run'&&press){a.st='hold';a.ang=10}
  if(a.st==='hold'){a.ang=Math.min(65,a.ang+1);if(release||a.x>Ln+1){if(a.x>Ln)foul(a);else{const sp=a.v*1.6+8,th=a.ang*Math.PI/180;a.jav={x:a.x+.4,h:1.9,vx:sp*Math.cos(th),vh:sp*Math.sin(th),stuck:0};a.st='thrown';a.air=0;sfx('step')}}}
  if(a.st==='run'&&a.x>Ln+1)foul(a);
  if(a.st==='thrown'){a.air++;a.v=Math.max(0,a.v-.25)}
  const j=a.jav;if(j&&!j.stuck){j.vh-=9.8/60;j.vx*=.999;j.x+=j.vx/60;j.h+=j.vh/60;if(j.h<=0){j.h=0;j.stuck=1;a.res=Math.round((j.x-Ln)*100)/100;claim(a,'r',a.res);a.st='done';sfx('step')}}}}
function foul(a){if(a.res!=null)return;a.res=-1;a.st='done';say(a,'FOUL!','#f05050');sfx('foul');claim(a,'r',-1)}
function claim(a,k,v){if(!K.isClient()){resolve(a,[0,k,v]);return}a.cseq++;a.claims.push([a.cseq,k,v]);if(a.claims.length>8)a.claims.shift()}
function resolve(a,[,k,v]){if(k==='r'&&ph==='go'){a.res=v;if(v>=0&&isRun()&&!ath.some(o=>o!==a&&o.res!=null&&o.res>=0&&o.res<v))say(a,'LEADS!','#fff07c')}}
function say(a,s,col){texts.push({i:a.i,s,col,t:80})}
function step(){phaseStep();for(const a of ath){if(ownerNet(a)){const u=K.remote(a.i);if(u)readUp(a,u);continue}athStep(a,K.inp(a.i))}vis()}
function vis(){for(const p of parts){p.x+=p.vx/60;p.h=Math.max(0,p.h+p.vh/60);p.vh-=9.8/60;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts)t.t--;texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.85;
 for(const a of ath){if(a.st==='run'&&a.v>6&&K.tick%5===0)parts.push({x:a.x-.3,h:.05,vx:-1,vh:.8,t:10,col:'#e88060',lane:a.i})}}
/* ---------- guests ---------- */
const STS=['stand','set','run','hold','air','land','hop','thrown','done'];
function local(i){const a=ath[i];if(a)athStep(a,K.inp(i));vis()}
function upload(i){const a=ath[i];if(!a)return null;return{x:Math.round(a.x*100)/100,v:Math.round(a.v*100)/100,h:Math.round(a.h*100)/100,s:STS.indexOf(a.st),an:Math.round(a.ang),st:a.stum,
 j:a.jav?[Math.round(a.jav.x*10)/10,Math.round(a.jav.h*10)/10,a.jav.stuck?1:0]:0,fs:a.fs,hi:a.hit?[...a.hit]:[],ev,c:a.claims}}
function readUp(a,u){if(typeof u.x!=='number'||u.ev!==ev)return;a.x=u.x;a.v=u.v;a.h=u.h;a.st=STS[u.s]||'run';a.ang=u.an;a.stum=u.st|0;a.fs=u.fs|0;a.hit=new Set(u.hi||[]);
 a.jav=u.j?{x:u.j[0],h:u.j[1],stuck:u.j[2]}:null;for(const e of u.c||[])if((e[0]|0)>a.cSeen){a.cSeen=e[0]|0;resolve(a,e)}}
function snap(){return{ev,pz:ph,pt,ga,sc:pts,me:med,lr:lastRes,el:evList,a:ath.map(a=>[Math.round(a.x*100),Math.round(a.v*100),Math.round(a.h*100),STS.indexOf(a.st),Math.round(a.ang),a.res==null?-2e4:Math.round(a.res*100),a.jav?[Math.round(a.jav.x*10),Math.round(a.jav.h*10),a.jav.stuck?1:0]:0,a.stum|0,a.hit?[...a.hit].length:0])}}
function apply(g){if(g.el)evList=g.el;if(g.ev!==ev||g.pz==="intro"&&ph==="done"){beginEvent(g.ev)}const was=ph;ph=g.pz;pt=g.pt;ga=g.ga;pts=g.sc||pts;med=g.me||med;lastRes=g.lr;
 if(ph==='ready'&&was!=='ready')for(const a of ath)if(a.st==='stand')a.st='set';
 (g.a||[]).forEach((r,i)=>{const a=ath[i];if(!a)return;const res=r[5]===-2e4?null:r[5]/100;if(i===K.myIdx){if(a.res==null&&res!=null)a.res=res;return}
  a.tx=r[0]/100;a.v=r[1]/100;a.h=r[2]/100;a.st=STS[r[3]]||'run';a.ang=r[4];a.res=res;a.jav=r[6]?{x:r[6][0]/10,h:r[6][1]/10,stuck:r[6][2]}:null;a.stum=r[7];a.hits=r[8];if(a.gx==null||Math.abs(a.tx-a.x)>6){a.x=a.tx;a.gx=1}})}
function follow(){for(const a of ath){if(a.i===K.myIdx||a.tx==null)continue;a.tx+=a.v/60;a.x+=(a.tx-a.x)*.3}}
function onFx(k,a){if(k==='w'){const o=ath[a[0]];if(o&&o.i===meIdx())sfx('fan');else sfx('pick')}}
/* ---------- CPU athletes ---------- */
function bot(i){const a=ath[i];if(!a||ph!=='go')return{};const lvl=a.i===meIdx()?2:K.cpu,o={},e=EV();
 const b=a.bt||(a.bt={key:0,next:0,rate:[5.6,8.6,9.8][lvl]*(.94+Math.random()*.1),err:Math.random()-.5,react:[24,11,7][lvl]+Math.floor(Math.random()*6)});
 if(K.tick-ga<b.react)return o;
 if(a.st==='set'||a.st==='run'){if(K.tick>=b.next){b.key^=1;b.next=K.tick+60/b.rate*(.85+Math.random()*.3)}o[b.key?'left':'right']=true}
 if(e==='hurd'&&a.st==='run'){const hx=HURD.find(x=>x>a.x+.2);if(hx!=null){const d=hx-a.x,want=a.v*(.37+(Math.random()-.5)*.22*(2.4-lvl));if(d<want&&!a.fh)o.fire=true}}
 if(e==='lj'||e==='jav'){const tgt=(e==='lj'?[37,41,44]:[34,39,42])[lvl]+b.err*6*(2-lvl)/2,start=(tgt-(e==='lj'?8:10))/(e==='lj'?1.1:1),edge=e==='lj'?EVENTS.lj.board:EVENTS.jav.line,margin=[.9,.45,.15][lvl]+Math.abs(b.err)*.3;
  if(a.st==='run'&&a.x>=edge-margin-a.v*start/60)o.fire=true;if(a.st==='hold'&&a.ang<tgt)o.fire=true}
 return o}
/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const athImg=(pose,col)=>img('a'+pose+col,()=>X.recolor(ART.a[pose]||ART.a.stand,col,{a:'#1c2a5c',b:'#101838',h:'#3a2414'},'ath'+pose));
function crowdImg(){return img('crowd',()=>{const w=480,h=40,c=X.mk(w,h),g=c.getContext('2d'),rr=RA.util.mulberry(3),cols=['#e83838','#2c78f0','#f4f4f4','#f0c020','#38a038','#b080f0','#ffa040'],sk=['#f0b888','#c07850','#8c5c34'];
 g.fillStyle='#2c2638';g.fillRect(0,0,w,h);for(let r=0;r<7;r++){g.fillStyle=r&1?'#3a3248':'#443a54';g.fillRect(0,4+r*5,w,1)}
 for(let r=0;r<7;r++)for(let x=1+(r&1)*2;x<w-3;x+=4)if(rr()<.9){const y=r*5;g.fillStyle=cols[rr()*cols.length|0];g.fillRect(x,y+2,3,3);g.fillStyle=sk[rr()*sk.length|0];g.fillRect(x+1,y,1,2)}return c})}
const cams=[];let SCR=null;
const fmt=(v,run)=>v==null?'--':v<0?'FOUL':run?v.toFixed(2)+' S':v.toFixed(2)+' M';
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function poseOf(a,e){const st=a.st,jv=e==='jav';if(a.stum>0)return'fall';
 if(st==='set')return e==='dash'||e==='hurd'?'set':'stand';if(st==='stand')return'stand';
 if(st==='run'||st==='hold'){if(a.v<.3)return jv?'jr2':'stand';const f=1+Math.floor(a.x/.55)%4;return(jv?'jr':'r')+f}
 if(st==='air')return a.air<9?'take':'fly';if(st==='land')return'land';if(st==='hop')return'hop';if(st==='thrown')return a.air<22?'throw':'stand';
 if(st==='done'){if(ph==='done'&&lastRes&&lastRes.slice(0,3).some(r=>r[0]===a.i&&r[1]>=0))return(K.tick>>4)&1?'win':'stand';return a.v>.3?'r'+(1+Math.floor(a.x/.55)%4):'stand'}return'stand'}
function view(g,vw,vh){const e=EV(),me=ath[meIdx()]||null,N=ath.length,LS=Math.max(4,Math.min(12,Math.floor(80/N))),top=78,ly=k=>top+6+(k+1)*LS,run=isRun();
 let focus=me||ath.slice().sort((a,b)=>b.x-a.x)[0];let fx=focus.x;if(e==='jav'&&focus.jav)fx=Math.max(fx,focus.jav.x);
 let cam=cams[0];if(!cam)cam=cams[0]={x:fx,tk:K.tick};let nn=0;while(cam.tk<K.tick&&nn++<30){cam.tk++;cam.x+=(fx-cam.x)*.15}cam.tk=K.tick;const cx=cam.x,SX=x=>Math.round((x-cx)*PXM+vw*.35);
 // sky, crowd, wall with boards, infield
 g.fillStyle='#5c94fc';g.fillRect(0,0,vw,24);const cr=crowdImg(),off=Math.round(-((cx*PXM*.5)%cr.width));for(let x=off-cr.width;x<vw;x+=cr.width)g.drawImage(cr,x,18);
 const crowdJump=ph==='done'||ph==='go'&&(K.tick>>3)&1;if(crowdJump&&ph==='done'){g.fillStyle='rgba(0,0,0,0)'}
 g.fillStyle=P.k;g.fillRect(0,58,vw,1);g.fillStyle='#2058c0';g.fillRect(0,59,vw,8);for(let m=Math.floor((cx-40)/36)*36;m<cx+40;m+=36){const sx=SX(m);g.fillStyle=P.k;g.fillRect(sx-2,59,2,8);X.text(g,['RETRO ARENA','TRACK STARS','GO GO GO','20 PLAYERS'][((m/36)%4+4)%4],sx+4,60,{col:'#fff07c',shadow:false})}
 g.fillStyle='#38a038';g.fillRect(0,67,vw,top-67);for(let y=67;y<top;y++)for(let x=0;x<vw;x++)if(X.dither(x,y,.15)){g.fillStyle='#2e8a30';g.fillRect(x,y,1,1)}
 const tb=ly(N-1)+5;g.fillStyle='#c8502c';g.fillRect(0,top,vw,tb-top);g.fillStyle='#b04424';for(let y=top;y<tb;y+=2)for(let x=((y>>1)&1);x<vw;x+=3)g.fillRect(x,y,1,1);
 g.fillStyle='#e8e4dc';g.fillRect(0,top,vw,1);for(let k=0;k<N;k++)g.fillRect(0,ly(k)+Math.floor(LS/2)-LS+1+Math.floor(LS/2),vw,1);g.fillRect(0,tb,vw,1);
 g.fillStyle='#38a038';g.fillRect(0,tb+1,vw,vh-tb-1);
 // distance markers, lines, pits, hurdles
 for(let m=Math.floor((cx-30)/10)*10;m<cx+30;m+=10){if(m<0)continue;const sx=SX(m);g.fillStyle='#e8e4dc';g.fillRect(sx,top-4,1,4);X.text(g,e==='lj'?(m-EVENTS.lj.board)+'':e==='jav'?(m-EVENTS.jav.line)+'':m+'',sx+2,top-10,{col:'#ffffff'})}
 const line=(x,col)=>{const sx=SX(x);if(sx<-4||sx>vw+4)return;g.fillStyle=col;g.fillRect(sx,top,2,tb-top)};line(0,'#e8e4dc');
 if(run){const L=EVENTS[e].len,sx=SX(L);if(sx>-6&&sx<vw+6)for(let y=top;y<tb;y+=2){g.fillStyle=((y>>1)&1)?P.k:'#ffffff';g.fillRect(sx,y,2,2);g.fillStyle=((y>>1)&1)?'#ffffff':P.k;g.fillRect(sx+2,y,2,2)}}
 if(e==='lj'){const B=EVENTS.lj.board;const s0=SX(B+.4),s1=SX(B+10);g.fillStyle='#e8c088';for(let k=0;k<N;k++)g.fillRect(s0,ly(k)-LS+2,s1-s0,LS-1);line(B,'#ffffff')}
 if(e==='jav'){line(EVENTS.jav.line,'#ffffff');const s0=SX(EVENTS.jav.line+1);g.fillStyle='#38a038';if(s0<vw)g.fillRect(Math.max(0,s0),top+1,vw,tb-top-1);for(let m=10;m<100;m+=10){const sx=SX(EVENTS.jav.line+m);if(sx>0&&sx<vw){g.fillStyle='#e8e4dc';g.fillRect(sx,top,1,tb-top)}}}
 // athletes, back lane first
 for(let k=0;k<N;k++){const a=ath[k],y=ly(k);
  if(e==='hurd')for(const hx of HURD){const sx=SX(hx);if(sx<-8||sx>vw+8)continue;const down=a.hit&&a.hit.has(hx)||a.hits&&!isMine(a)&&false;
   if(down){g.fillStyle=P.k;g.fillRect(sx-1,y-3,10,3);g.fillStyle='#ffffff';g.fillRect(sx,y-2,8,1)}else{g.fillStyle=P.k;g.fillRect(sx-1,y-13,3,13);g.fillRect(sx-1,y-14,10,4);g.fillStyle='#e8e4dc';g.fillRect(sx,y-12,1,12);g.fillStyle='#f05050';g.fillRect(sx,y-13,8,2);g.fillStyle='#ffffff';g.fillRect(sx+3,y-13,2,2)}}
  const sx=SX(a.x);if(sx>-20&&sx<vw+20){const im=athImg(poseOf(a,e),a.col),up=Math.round(a.h*14);g.globalAlpha=.35;g.fillStyle=P.k;g.fillRect(sx-5,y-1,10,2);g.globalAlpha=1;g.drawImage(im,sx-9,y-im.height+1-up);
   if(e==='jav'&&(a.st==='run'||a.st==='hold'||a.st==='set')&&!a.jav){g.fillStyle=P.k;for(let q=0;q<14;q++){g.fillRect(sx-8+q,y-25-up-Math.round(q*.25),1,1)}g.fillStyle='#e8e4dc';g.fillRect(sx+3,y-24-up,3,1)}
   if(a===me){g.fillStyle=P.k;g.fillRect(sx-4,y-33-up,9,5);g.fillStyle=(K.tick>>3)&1?'#ffffff':a.col;g.fillRect(sx-3,y-32-up,7,1);g.fillRect(sx-2,y-31-up,5,1);g.fillRect(sx-1,y-30-up,3,1)}
   if(a.st==='hold'&&(a===me||K.seats[a.i]&&K.seats[a.i].ctrl!=='cpu')){const th=a.ang*Math.PI/180;g.fillStyle='#fff07c';for(let q=4;q<16;q++)g.fillRect(Math.round(sx+6+Math.cos(th)*q),Math.round(y-12-Math.sin(th)*q),1,1);X.text(g,Math.round(a.ang)+'',sx+10,y-30,{col:'#fff07c',outline:P.k})}}
  if(a.jav){const j=a.jav,jx=SX(j.x),jy=y-Math.round(j.h*3)-2;if(jx>-20&&jx<vw+20){const th=j.stuck?-.5:Math.atan2(j.vh*3,j.vx*PXM||1);for(let q=-8;q<=8;q++){const px=Math.round(jx+Math.cos(th)*q),py=Math.round(jy-Math.sin(th)*q);g.fillStyle=P.k;g.fillRect(px,py+1,1,1);g.fillStyle=q>5?'#f05050':'#ffffff';g.fillRect(px,py,1,1)}if(j.stuck&&a.res!=null&&a.res>=0&&(a===ath[meIdx()]))X.text(g,a.res.toFixed(1),jx,jy-12,{col:'#fff07c',align:'center',outline:P.k})}}
  // lane chip at the left edge
  g.fillStyle=P.k;g.fillRect(0,y-LS+1,4,LS-1);g.fillStyle=a.col;g.fillRect(1,y-LS+2,2,Math.max(1,LS-3))}
 for(const p of parts){const a=ath[p.lane];if(!a)continue;const sx=SX(p.x);g.fillStyle=p.col;g.fillRect(sx,ly(p.lane)-Math.round(p.h*14)-1,1,1)}
 hud(g,vw,vh,me,run)}
function hud(g,vw,vh,me,run){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),e=EV(),E=EVENTS[e];
 TX(E.n,4,14,{col:'#fff07c'});TX('EVENT '+(ev+1)+'/'+evList.length,4,23,{col:'#a0f0ff'});
 if(run&&ph==='go'){const t=(me&&me.res!=null&&me.res>=0?me.res:(K.tick-ga)/60);TX(t.toFixed(2),vw-4,14,{col:'#ffffff',align:'right'})}
 if(K.demo){TX('TRACK STARS',vw/2,vh-16,{col:'#fff07c',align:'center',scale:2});return}
 // the instruction card
 const touch=me&&K.seats[me.i]&&K.seats[me.i].ctrl==='touch',runK=touch?'TAP LEFT / RIGHT':'A D A D A D...';
 if(ph==='intro'){const lines={dash:[runK+' TO RUN','THE FASTER YOU BASH, THE FASTER YOU GO','DON\'T MOVE BEFORE THE GUN!'],lj:[runK+' TO RUN UP','HOLD SPACE TO RAISE THE ANGLE','LET GO BEFORE THE WHITE BOARD'],
   hurd:[runK+' TO RUN','SPACE JUMPS A HURDLE','TAKE OFF 3-4 STRIDES BEFORE IT'],jav:[runK+' TO RUN UP','HOLD SPACE TO RAISE THE ANGLE','LET GO BEFORE THE LINE (ABOUT 40)']}[e];
  const w=Math.max(...lines.map(s=>X.tw(s)))+16,x0=Math.round(vw/2-w/2),y0=44;g.fillStyle=P.k;g.fillRect(x0,y0,w,56);g.fillStyle='#241c34';g.fillRect(x0+1,y0+1,w-2,54);
  TX(E.n,vw/2,y0+5,{col:'#fff07c',align:'center',scale:2});lines.forEach((s,k)=>TX(s,vw/2,y0+24+k*9,{col:k?'#e8e4dc':'#88dc48',align:'center',shadow:false}))}
 if(ph==='ready'){const s=K.tick>=ga-45?'SET...':'ON YOUR MARKS';TX(s,vw/2,52,{col:'#ffffff',align:'center',scale:2})}
 if(ph==='go'&&K.tick-ga<50)TX('GO!',vw/2,50,{col:'#88dc48',align:'center',scale:3});
 // your speed meter and your result
 if(me&&(ph==='go'||ph==='ready')){const bx=4,by=vh-12;g.fillStyle=P.k;g.fillRect(bx,by,62,6);g.fillStyle='#5c566c';g.fillRect(bx+1,by+1,60,4);const f=Math.min(1,me.v/VMAX);g.fillStyle=f>.85?'#88dc48':f>.6?'#fff07c':'#ffa040';g.fillRect(bx+1,by+1,Math.round(60*f),4);TX('SPEED',bx,by-9,{col:'#9a94a8'});
  if(ph==='go'&&me.st==='run'&&me.v<5&&K.tick-ga>60&&(K.tick>>4)&1)TX(touch?'TAP FASTER!':'BASH A D FASTER!',vw/2,vh-30,{col:'#ffa040',align:'center'})}
 for(const t of texts)if(me&&t.i===me.i)TX(t.s,vw/2,70,{col:t.col,align:'center',scale:2});
 if(me&&me.res!=null&&ph==='go')TX(fmt(me.res,run),vw/2,vh-24,{col:me.res<0?'#f05050':'#fff07c',align:'center',scale:2});
 // the results board, then the points table
 if(ph==='done'&&lastRes){const rows=lastRes.slice(0,Math.min(8,lastRes.length)),mi=lastRes.findIndex(r=>me&&r[0]===me.i);if(mi>=8)rows.push(lastRes[mi]);
  const w=200,h=16+rows.length*9+30,x0=Math.round(vw/2-w/2),y0=34;g.fillStyle=P.k;g.fillRect(x0,y0,w,h);g.fillStyle='#241c34';g.fillRect(x0+1,y0+1,w-2,h-2);TX(E.n+' RESULTS',vw/2,y0+4,{col:'#fff07c',align:'center'});
  rows.forEach((r,k)=>{const a=ath[r[0]],pl=lastRes.indexOf(r),y=y0+16+k*9,mc=['#fff07c','#e8e4dc','#ffa040'][pl];if(a===me){g.fillStyle='#3a3248';g.fillRect(x0+2,y-1,w-4,9)}
   if(mc&&r[1]>=0){g.fillStyle=mc;g.fillRect(x0+5,y+1,5,5)}TX((pl+1)+'',x0+14,y,{col:'#ffffff',shadow:false});g.fillStyle=a.col;g.fillRect(x0+30,y+1,4,5);TX((a.name||'').slice(0,10),x0+37,y,{col:'#ffffff',shadow:false});TX(fmt(r[1]<-1?null:r[1],run),x0+w-6,y,{col:r[1]<0?'#f05050':'#a0f0ff',align:'right',shadow:false})});
  const top3=ath.slice().sort((a,b)=>pts[b.i]-pts[a.i]).slice(0,3);TX('POINTS: '+top3.map(a=>(a.name||'').slice(0,6)+' '+pts[a.i]).join('  '),vw/2,y0+h-11,{col:'#88dc48',align:'center',shadow:false})}}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);if(!ath.length){SCR.present(ctx,W,H);return}
 g.save();g.beginPath();g.rect(0,0,SCR.w,SCR.h-(K.demo?0:9));g.clip();view(g,SCR.w,SCR.h-(K.demo?0:9));g.restore();SCR.present(ctx,W,H)}
K=RA.kit({id:'track',name:'TRACK STARS',kind:'Athletics',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'The button-bashing athletics meet for up to 20: 100m dash, long jump, 110m hurdles and javelin, everyone at once. Bash two keys to run, hold to set your angle, and win the most points.',
 blurb:'Bash A and D (or the arrows) one after the other to run. Space jumps hurdles; hold it for the angle in the long jump and javelin, then let go.',
 howto:'Alternate A / D (or Left / Right) as fast as you can to run. Space / W jumps a hurdle. Long jump and javelin: hold Space to raise the angle, let go before the line. Touch: tap the left and right buttons in turn.',
 icon:['..........','......kk..','.....kssk.','...kkrrk..','..ksrrrk..','...krrk...','..kbbkk...','.kbk.kbk..','kwk...kwk.','..........'],
 music:MUSIC,fireLabel:'JUMP',
 modes:[['MEET','Everyone for themselves: most points wins.'],['TEAM MEET','Red vs blue: every athlete\'s points count for the team.']],
 settings:[['events','Events',[['all','All four'],['sprint','Sprint + hurdles'],['field','Long jump + javelin']]]],
 kb:[['A D','run (bash!)'],['SPACE W','jump / hold for angle'],['C','chat'],['ESC','menu']],pad:[['DPAD L R','run (bash!)'],['A','jump / angle'],['START','menu']],
 ach:[{id:'first',name:'Opening Ceremony',desc:'Finish your first meet',test:s=>s.played>=1,unlock:'title:Athlete'},{id:'win1',name:'Champion',desc:'Win a meet',test:(s,m)=>m.won,unlock:'title:Champion'},
  {id:'gold3',name:'Golden Run',desc:'3 golds in one meet',test:(s,m)=>m.golds>=3,unlock:'title:Golden'}],
 alive:i=>!!ath[i],out:()=>false,
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>EVENTS[EV()]?EVENTS[EV()].n:'',
 ranks:()=>ath.slice().sort((a,b)=>pts[b.i]-pts[a.i]).map(a=>[a.name,a.col,pts[a.i]+' pts · '+med[a.i].join('/')]),
 result:(i,w)=>({won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),golds:med[i]?med[i][0]:0,kills:0})});
window.__tf={get ath(){return ath},get ph(){return ph},get ev(){return ev},get pts(){return pts},K,bot:i=>bot(i)};

})();
