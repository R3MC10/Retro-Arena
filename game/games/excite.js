/* EXCITEBIKE for Retro Arena: side-view motocross for up to 20 on a four-lane dirt track drawn in 2.5D: the track is an
   oblique slab with lanes receding into the distance, ramps are solid dirt wedges across every lane, a crowd fills the stands.
   Space or click is the gas, E / Shift / right-click is the turbo (it heats the engine: overheat and you stall until it cools),
   W / S change lane, A / D lean back and forward: in the air, match the slope you will land on or you crash.
   Run over the cooling arrows to reset the heat. Ride into a rival's back wheel and you go down.
   Modes: RACE · TEAM RACE (red vs blue, points by finishing place) · ELIMINATOR (every 30 seconds the last rider is out).
   Crates on the track (one lane each): NITRO (turbo without heat) · ICE COOL (no heat for a while) · ROLL CAGE (shrug off
   one crash) · OIL SLICK (dropped behind you) · party: HEAT WAVE (everyone else's engine gets hot) · WOBBLE (everyone else
   pulls wheelies by themselves for a while).
   Lag-free online (RA.kit localFirst): your bike, your jumps, your landings and your crashes all happen on your device;
   the host keeps the crates, oil, laps, places and eliminations, and sends item effects to the rider they hit. */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx,{mix}=RA.util;
const LANES=4,LH=9,SKEW=7,TEAMC=['#f04848','#4890f8'],TEAMN=['Red team','Blue team'];
const ITEMS=[null,{n:'NITRO',c:'#ff7020'},{n:'ICE COOL',c:'#60d0ff'},{n:'ROLL CAGE',c:'#c0c8d8'},{n:'OIL SLICK',c:'#303040'},{n:'HEAT WAVE',c:'#ff4040',party:1},{n:'WOBBLE',c:'#e080ff',party:1}];
RA.audio.add('rev',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(90,now);o.frequency.exponentialRampToValueAtTime(260,now+.25);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.3);o.connect(g);o.start(now);o.stop(now+.31)});
RA.audio.add('land',(AC,now,g)=>{const o=AC.createOscillator();o.frequency.setValueAtTime(120,now);o.frequency.exponentialRampToValueAtTime(40,now+.12);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.001,now+.14);o.connect(g);o.start(now);o.stop(now+.15)});
const MUSIC=[T('Paddock',120,['G','C','D','G'],'k...s...k.k.s...','g5 - b5 d6 - b5 g5 - c6 - e6 c6 - g5 e5 - d5 - f#5 a5 - d6 - - g5 - - - - - - -'),
 T('Excite',160,['C','C','F','G'],'k.hsk.hsk.hsk.hs','c5 c5 e5 g5 . g5 e5 c5 c5 c5 e5 g5 . c6 . . f5 f5 a5 c6 . a5 f5 . g5 g5 b5 d6 . b5 g5 .'),
 T('Dirt Track',144,['Am','G','F','E'],'k..hs.h.k.khs.h.','a4 c5 e5 a5 e5 c5 a4 c5 g4 b4 d5 g5 d5 b4 g4 b4 f4 a4 c5 f5 c5 a4 f4 a4 e4 g#4 b4 e5 - - - -'),
 T('Final Lap',178,['Dm','Bb','C','A'],'kshskshskshskshs','d5 f5 a5 d6 a5 f5 d5 f5 bb4 d5 f5 bb5 f5 d5 bb4 d5 c5 e5 g5 c6 g5 e5 c5 e5 a4 c#5 e5 a5 e5 c#5 a4 c#5')];
let K,rd=[],TR=null,crates=[],oils=[],parts=[],texts=[],finN=0,firstFin=0,lastHF=0,champ=-1,nextId=1,elimT=0,outN=0;
const teamOf=i=>K.mode===1?i%2:i,sameTeam=(a,b)=>a!==b&&teamOf(a)===teamOf(b);
const ownerNet=r=>K.seats[r.i]&&K.seats[r.i].ctrl==='net';

/* ---------- the track: a height profile with ramps, lane mud and cooling arrows (seeded) ---------- */
function build(seed,theme){const rr=RA.util.mulberry(seed),L=4200,h=new Float32Array(L+2),mud=[],cool=[],marks=[];
 let x=320;const up=(len,H)=>{const b=h[x];for(let k=1;k<=len;k++)h[x+k]=b+(H-b)*k/len;x+=len},flat=len=>{for(let k=1;k<=len;k++)h[x+k]=h[x];x+=len},down=(len,H)=>{const b=h[x];for(let k=1;k<=len;k++)h[x+k]=b+(H-b)*k/len;x+=len};
 const cliff=()=>{h[x+1]=0;x+=1};
 while(x<L-500){const t=Math.floor(rr()*7),s=x;marks.push(x);
  if(t===0){up(30,8);down(22,0)}else if(t===1){up(50,24);cliff()}else if(t===2){up(38,16);down(38,0);flat(24);up(38,16);down(38,0)}
  else if(t===3){up(40,18);flat(70+Math.floor(rr()*60));down(40,0)}else if(t===4){for(let k=0;k<6;k++){up(14,5);down(14,0)}}
  else if(t===5){up(40,20);flat(60);down(90,0)}else{up(60,30);cliff()}
  flat(90+Math.floor(rr()*150));
  if(rr()<.55){const ln=Math.floor(rr()*LANES);mud.push([x-60,x-20,ln])}
  if(rr()<.35){const ln=Math.floor(rr()*LANES);cool.push([x-40,ln])}}
 for(;x<=L;x++)h[x+1]=0;h[L+1]=0;
 return{L,h,mud,cool,theme,marks}}
const hAt=x=>{const L=TR.L;x=((x%L)+L)%L;const i=Math.floor(x),f=x-i;return TR.h[i]*(1-f)+TR.h[i+1]*f};
const slopeAt=x=>(hAt(x+3)-hAt(x-3))/6;
const inMud=(x,z)=>{const L=TR.L,xx=((x%L)+L)%L;return TR.mud.some(m=>xx>m[0]&&xx<m[1]&&Math.abs(z-m[2])<.5)};
const onCool=(x,z)=>{const L=TR.L,xx=((x%L)+L)%L;return TR.cool.some(c=>xx>c[0]&&xx<c[0]+20&&Math.abs(z-c[1])<.5)};

/* ---------- setup ---------- */
function start(seats,md,S,seed){const rr=RA.util.mulberry(seed),th=S.theme==='rnd'?Math.floor(rr()*3):+S.theme||0;TR=build(seed+7,th);
 crates=[];oils=[];parts=[];texts=[];finN=0;firstFin=0;lastHF=0;champ=-1;nextId=1;elimT=0;outN=0;
 rd=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,d:-(Math.floor(i/LANES))*22,z:i%LANES,tz:i%LANES,vx:0,y:0,vy:0,pitch:0,gr:true,heat:0,stall:0,crash:0,fx:{},
  lap:0,place:i+1,fin:0,ft:0,out:false,ev:[],evSeq:0,evSeen:0,claims:[],cseq:0,cSeen:0,perfect:0,crashes:0,gs:-1,wob:0}));cams.length=0}

/* ---------- your own bike (runs on its owner's device) ---------- */
function ride(r,inp){const f=r.fx;for(const k in f)if(f[k]>0&&k!=='cage')f[k]--;
 if(r.out||r.fin&&r.vx<.05){r.vx*=.96;return}
 if(K.tick<150){if(inp.fire){if(r.gs<0)r.gs=K.tick}else r.gs=-1;return}
 if(K.tick===150&&r.gs>=122){r.vx=2.4;say(r,'HOLESHOT!','#f8d040');sfx('rev')}
 if(r.crash>0){r.crash--;r.vx*=.9;r.d+=r.vx;r.y=hAt(r.d);if(r.crash===0){r.pitch=slopeToA(r.d);r.heat=Math.min(r.heat,40)}return}
 const x=r.d,gas=inp.fire&&r.stall<=0,turbo=gas&&(inp.alt||inp.b4)&&r.stall<=0;
 let lean=(inp.right?1:0)-(inp.left?1:0);if(inp.ax&&Math.abs(inp.ax)>.25)lean=inp.ax;if(f.wob>0&&(K.tick>>5)&1)lean=-1;
 // heat
 if(r.stall>0){r.stall--;r.heat=Math.max(0,r.heat-.5)}
 else{r.heat+=f.cool>0?0:turbo&&!(f.nitro>0)?.42:gas?.03:-.3;r.heat=Math.max(0,r.heat);if(onCool(x,r.z))r.heat=0;
  if(r.heat>=100){r.stall=150;r.heat=100;say(r,'OVERHEAT!','#ff6040');sfx('boom')}}
 const max=(turbo||f.nitro>0&&gas?4.1:3.1)*(r.gr&&inMud(x,r.z)?.45:1)*(K.seats[r.i].ctrl==='cpu'?[.9,.97,1.01][K.cpu]:1);
 if(gas)r.vx+=(max-r.vx)*(r.vx<max?.035:.06);else r.vx*=r.gr?.985:.997;
 if(r.gr){// lanes, wheelies, terrain, take-off
  const ld=(inp.down?1:0)-(inp.up?1:0);if(ld&&!r.lh)r.tz=Math.max(0,Math.min(LANES-1,r.tz-ld));r.lh=ld;
  r.z+=(r.tz-r.z)*.14;
  const s=slopeAt(x);r.vx=Math.max(0,r.vx-s*.06);
  const want=slopeToA(x)+(lean<0?-.45:0);r.pitch+=(want-r.pitch)*.3;
  const nx=x+r.vx,hn=hAt(nx),vy=hn-hAt(x);
  if(hn<hAt(x)+r.vy-.6&&r.vx>1.2&&r.vy>0){r.gr=false;r.y=hAt(x);r.air=0}else{r.vy=vy;r.y=hn}
  r.d=nx}
 else{r.air=(r.air|0)+1;r.d+=r.vx;r.vy-=.17;r.y+=r.vy;r.pitch+=lean*.055+(lean?0:.006);
  const g=hAt(r.d);if(r.y<=g){const diff=Math.abs(r.pitch-slopeToA(r.d));r.y=g;r.gr=true;r.vy=0;sfx('land');
   if(diff<.22){if(r.air>24){r.vx+=.35;r.perfect++;say(r,'PERFECT!','#40ff80')}}else if(diff<.55)r.vx*=.82;else crash(r,'BAD LANDING')}}
 // ride into someone's back wheel and you go down
 for(const o of rd){if(o===r||o.out||o.crash>0&&o.d<r.d)continue;const dx=o.d-r.d;if(dx>6&&dx<15&&Math.abs(o.z-r.z)<.45&&Math.abs(o.y-r.y)<6&&r.vx>o.vx+.5&&r.crash<=0){crash(r,'BUMP!');break}}
 for(const o of oils)if(!o.gone&&Math.abs(((r.d%TR.L)+TR.L)%TR.L-o.x)<8&&Math.abs(r.z-o.z)<.5&&r.gr&&!(o.own===r.i&&K.tick-o.at<60)){o.gone=1;claim(r,'o',o.id);crash(r,'OIL!')}
 for(const c of crates)if(!c.got&&Math.abs(((r.d%TR.L)+TR.L)%TR.L-c.x)<9&&Math.abs(r.z-c.z)<.5&&r.y-hAt(r.d)<12){c.got=1;claim(r,'c',c.id);sfx('pick')}
 if(inp.b3&&!r.qh&&r.item){use(r)}r.qh=inp.b3}
const slopeToA=x=>Math.atan(slopeAt(x));
function crash(r,why){if(r.fx.cage>0){r.fx.cage=0;say(r,'ROLL CAGE!','#c0c8d8');r.vx*=.6;return}r.crash=100;r.crashes++;r.gr=true;r.vy=0;r.drift=0;say(r,why,'#ff6060');sfx('boom');
 for(let k=0;k<12;k++)parts.push({x:r.d,z:r.z,y:r.y+4,vx:(Math.random()-.3)*2,vy:Math.random()*2.5,t:40,col:k%2?'#8a6040':r.col})}
function use(r){const k=r.item;r.item=0;if(k===4)claim(r,'oil',0)}
function claim(r,k,a){if(!K.isClient()){resolve(r,[0,k,a]);return}r.cseq++;r.claims.push([r.cseq,k,a]);if(r.claims.length>10)r.claims.shift()}

/* ---------- host ---------- */
function resolve(r,[,k,a]){
 if(k==='c'){const c=crates.find(x=>x.id===a);if(c&&!c.dead){c.dead=1;give(r)}}
 else if(k==='o')oils=oils.filter(o=>o.id!==a);
 else if(k==='oil')oils.push({id:nextId++,x:(((r.d-14)%TR.L)+TR.L)%TR.L,z:Math.round(r.z),own:r.i,at:K.tick,t:2400})}
function give(r){const n=rd.length,f=n>1?(r.place-1)/(n-1):.5;let bag=f<.3?[2,3,4,4]:[1,1,2,3,4];if(K.S.items==='party'&&f>.3)bag.push(5,6,5);
 const k=bag[Math.floor(Math.random()*bag.length)];say(r,ITEMS[k].n,ITEMS[k].c);
 if(k<=4){send(r,'it',k);return}const rv=rd.filter(o=>o!==r&&!o.out&&!o.fin&&!sameTeam(r.i,o.i));for(const o of rv)send(o,k===5?'hw':'wb',0)}
function send(o,kind,v){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind,v|0]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind,v)}
function onEv(r,kind,v){const f=r.fx;if(kind==='it'){if(v===1)f.nitro=300;else if(v===2){f.cool=480;r.heat=0}else if(v===3)f.cage=1;else if(v===4)r.item=4}
 else if(kind==='hw')r.heat=Math.min(95,r.heat+55);else if(kind==='wb')f.wob=300}
function readUpload(r,u){if(typeof u.d!=='number')return;r.d=u.d;r.z=u.z;r.vx=u.v;r.y=u.y;r.pitch=u.p;r.fl=u.f|0;r.heat=u.h|0;r.crash=u.c|0;
 for(const e of u.cl||[])if((e[0]|0)>r.cSeen){r.cSeen=e[0]|0;resolve(r,e)}}
function step(){const S=K.S;if(K.tick===2)K.track(1+Math.floor(Math.random()*2));
 for(const r of rd){if(ownerNet(r)){const u=K.remote(r.i);if(u)readUpload(r,u)}else ride(r,r.fin?bot(r.i):K.inp(r.i))}
 // crates appear ahead of the pack, one lane each
 if(S.items!=='off'&&K.tick%200===100&&crates.length<4+rd.length/3){const lead=Math.max(...rd.map(r=>r.d));const x=((lead+250+Math.random()*500)%TR.L+TR.L)%TR.L;crates.push({id:nextId++,x,z:Math.floor(Math.random()*LANES),t:2400})}
 for(const c of crates)c.t--;crates=crates.filter(c=>!c.dead&&c.t>0);for(const o of oils)o.t--;oils=oils.filter(o=>o.t>0);
 // laps, places, finish
 for(const r of rd){r.lap=Math.floor(r.d/TR.L);if(!r.fin&&!r.out&&r.d>=S.laps*TR.L){r.fin=++finN;r.ft=K.tick-150;if(finN===1)firstFin=K.tick;if(K.seats[r.i].ctrl!=='cpu')lastHF=K.tick;say(r,ord(r.fin)+'!',r.fin<=3?'#f8d040':'#ffffff');K.fx('f',r.i)}}
 places();
 if(K.mode===2&&K.tick>150){elimT++;if(elimT>=1800){elimT=0;const live=rd.filter(r=>!r.out);if(live.length>1){const last=live.sort((a,b)=>a.d-b.d)[0];last.out=true;outN++;last.outAt=outN;say(last,'ELIMINATED!','#ff6060');sfx('boom')}}}
 vis();checkEnd()}
function places(){const o=rd.slice().sort((a,b)=>(a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:(a.out-b.out)||(a.out&&b.out?b.outAt-a.outAt:b.d-a.d)));o.forEach((r,k)=>r.place=k+1)}
function checkEnd(){const lim=K.S.len*3600;
 if(K.mode===2){const live=rd.filter(r=>!r.out);if(live.length<=1&&rd.length>1||!live.length){places();const w=live[0]||rd.find(r=>r.place===1);champ=w?w.i:-1;K.end(w?{i:w.i}:null);return}
  if(!live.some(r=>!r.fin)){places();const w=rd.find(r=>r.place===1);champ=w.i;K.end({i:w.i})}return}
 const humans=rd.filter(r=>K.seats[r.i].ctrl!=='cpu'&&!r.fin).length,all=rd.every(r=>r.fin);
 if(all||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>300||finN&&K.tick-firstFin>1800||lim&&K.tick>lim){places();const w=rd.find(r=>r.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=rd.length,sc=[0,1].map(t=>rd.filter(r=>r.i%2===t).reduce((a,r)=>a+(n-r.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(r,s,col){texts.push({d:r.d,z:r.z,y:r.y+24,s,col,t:70})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy-=.12;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>400)parts.splice(0,parts.length-400);
 for(const t of texts){t.t--;t.y+=.25}texts=texts.filter(t=>t.t>0);
 for(const r of rd){if(r.out)continue;const fl=flags(r);if(fl&1&&K.tick%2===0&&r.vx>1)parts.push({x:r.d-8,z:r.z,y:r.y+2,vx:-r.vx*.3,vy:.4+Math.random()*.6,t:16,col:inMud(r.d,r.z)?'#5a3a20':'#b08860'});
  if(fl&4&&K.tick%3===0)parts.push({x:r.d-6,z:r.z,y:r.y+8,vx:-.4,vy:.8,t:22,col:'rgba(255,255,255,.7)'});if(fl&8&&K.tick%2===0)parts.push({x:r.d-9,z:r.z,y:r.y+4,vx:-1,vy:.1,t:10,col:'#ff9030'})}}
// what others see: 1 on the ground 2 crashed 4 overheated (smoke) 8 turbo flame 16 roll cage 32 out
function flags(r){if(r.fl!=null&&(K.isClient()?r.i!==K.myIdx:ownerNet(r)))return r.fl;return(r.gr?1:0)|(r.crash>0?2:0)|(r.stall>0||r.heat>85?4:0)|(r.vx>3.3?8:0)|(r.fx.cage>0?16:0)|(r.out?32:0)}

/* ---------- guests ---------- */
function local(i){const r=rd[i];if(!r)return;ride(r,r.fin?bot(i):K.inp(i))}
function upload(i){const r=rd[i];if(!r)return null;return{d:Math.round(r.d*10)/10,z:Math.round(r.z*100)/100,v:Math.round(r.vx*100)/100,y:Math.round(r.y*10)/10,p:Math.round(r.pitch*100)/100,f:flags(r),h:Math.round(r.heat),c:r.crash,cl:r.claims}}
function snap(){return{rd:rd.map(r=>[Math.round(r.d*10)/10,Math.round(r.z*100)/100,Math.round(r.y*10)/10,Math.round(r.pitch*100),Math.round(r.vx*10),flags(r),r.place,r.lap,r.fin,r.ft,r.out?1:0,ownerNet(r)?r.ev:0,Math.round(r.heat)]),
 c:crates.map(c=>[c.id,Math.round(c.x),c.z]),o:oils.map(o=>[o.id,Math.round(o.x),o.z,o.own]),el:elimT}}
function apply(g){(g.rd||[]).forEach((a,i)=>{const r=rd[i];if(!r)return;r.place=a[6];r.lap=a[7];r.fin=a[8];r.ft=a[9];r.out=!!a[10];
  if(i===K.myIdx){for(const e of a[11]||[])if((e[0]|0)>r.evSeen){r.evSeen=e[0]|0;onEv(r,e[1],e[2])}return}
  r.td=a[0];r.tz2=a[1];r.y=a[2];r.pitch=a[3]/100;r.vx=a[4]/10;r.fl=a[5];r.heat=a[12];if(r.gx==null){r.d=r.td;r.z=r.tz2;r.gx=1}});
 const cm=new Map(crates.map(c=>[c.id,c]));crates=(g.c||[]).map(x=>({id:x[0],x:x[1],z:x[2],got:cm.get(x[0])&&cm.get(x[0]).got}));
 const om=new Map(oils.map(o=>[o.id,o]));oils=(g.o||[]).map(x=>({id:x[0],x:x[1],z:x[2],own:x[3],at:om.get(x[0])?om.get(x[0]).at:K.tick,gone:om.get(x[0])&&om.get(x[0]).gone}));elimT=g.el|0}
function follow(){for(const r of rd){if(r.i===K.myIdx||r.td==null)continue;const e=r.td+r.vx*2,dd=e-r.d;if(Math.abs(dd)>60)r.d=e;else r.d+=dd*.3+r.vx*.7;r.z+=(r.tz2-r.z)*.3;r.td+=r.vx}vis()}
function onFx(k,a){if(k==='f'){const r=rd[a[0]];if(r)say(r,ord(r.place)+'!','#f8d040')}}

/* ---------- CPU riders ---------- */
function bot(i){const r=rd[i];if(!r||r.out)return{};const o={fire:true},x=r.d,lvl=K.cpu;
 if(r.stall>0)return{};
 if(r.gr&&r.heat<[45,62,78][lvl]&&slopeAt(x)<.3)o.alt=true;
 // lanes: dodge mud, oil and slower bikes ahead, head for cooling arrows when hot
 if(r.gr&&!(r.lc>K.tick)){const cost=z=>{let c=Math.abs(z-r.z)*.3;for(let a=20;a<160;a+=10){if(inMud(x+a,z))c+=2;if(r.heat>40&&onCool(x+a,z))c-=6}
   for(const q of rd)if(q!==r&&!q.out&&Math.abs(q.z-z)<.5&&q.d-x>4&&q.d-x<50&&q.vx<r.vx)c+=5;for(const ol of oils){const dx=((ol.x-x)%TR.L+TR.L)%TR.L;if(ol.z===z&&dx<120)c+=6}return c};
  let best=r.tz,bc=cost(r.tz);for(let z=0;z<LANES;z++){const c=cost(z)+(Math.random()-.5)*[3,1.5,.5][lvl];if(c<bc-.5){bc=c;best=z}}
  if(best<r.tz)o.up=true;else if(best>r.tz)o.down=true;r.lc=K.tick+(o.up||o.down?18:6)}
 // in the air: lean to match the slope it will land on
 if(!r.gr){const t=Math.max(2,(r.vy+Math.sqrt(Math.max(0,r.vy*r.vy+2*.17*Math.max(0,r.y-hAt(x+r.vx*8)))))/.17),lx=x+r.vx*t,want=slopeToA(lx)+(Math.random()-.5)*[.5,.25,.1][lvl];
  if(r.pitch<want-.05)o.right=true;else if(r.pitch>want+.05)o.left=true}
 if(r.item&&Math.random()<.02)o.b3=true;
 return o}

/* ---------- drawing ---------- */
const THEMES=[{n:'Stadium',sky:['#3878d0','#b8dcf8'],dirt:'#b88a58',face:'#7a5634',grass:'#4a9a40',stand:'#30344c'},{n:'Desert',sky:['#e07038','#f8d898'],dirt:'#d8a868',face:'#9a6838',grass:'#c8a060',stand:'#6a4030'},
 {n:'Night',sky:['#080818','#302058'],dirt:'#8a6a50',face:'#4a3424',grass:'#1a3a28',stand:'#14141f'}];
const BIKES={};
function bikeImg(col){if(BIKES[col])return BIKES[col];const B=(x,y,r,c,z,o)=>Object.assign({x,y,r,col:c,z:z||0},o||{}),lt=mix(col,'#ffffff',.3);
 return BIKES[col]=RA.fx.model(26,20,[B(5,15,4.2,'#202024'),B(21,15,4.2,'#202024'),B(5,15,2,'#a0a0a8',1),B(21,15,2,'#a0a0a8',1),B(13,13,3.4,'#707078'),B(9,11,3,col,1),B(17,10.5,2.6,col,1),B(20.5,9,1.6,'#c0c0c8',2),
  B(12,8,3.2,col,2),B(13,4.6,2.6,lt,3),B(14.2,3.8,2.5,'#f8f8f8',4),B(15.8,4,1.1,'#203048',5),B(16.5,7.8,1.3,col,3),B(10.5,12.5,1.6,'#303040',3)],{amb:.42})}
let STANDS=null;
function stands(th){const key=th.n;if(STANDS&&STANDS.key===key)return STANDS;const W=600,H=70,c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.scale(2,2);const rr=RA.util.mulberry(3);
 const sg=g.createLinearGradient(0,0,0,H);sg.addColorStop(0,mix(th.stand,'#000000',.4));sg.addColorStop(1,th.stand);g.fillStyle=sg;g.fillRect(0,8,W,H-8);g.fillStyle=mix(th.stand,'#000000',.6);g.fillRect(0,0,W,9);
 for(let row=0;row<7;row++)for(let x=2;x<W;x+=4.4){const r=rr(),col=['#f04848','#4890f8','#f8e040','#ffffff','#40c060','#e0a070'][Math.floor(r*6)];g.fillStyle=mix(col,'#000000',.15+row*.03);g.fillRect(x,12+row*7.5,3,4);g.fillStyle='#e8c0a0';g.fillRect(x+.6,10.6+row*7.5,1.8,1.8)}
 const ads=[['EXCITE!','#f8d040','#c02020'],['RETRO ARENA','#ffffff','#2050c0'],['20 RIDERS','#202020','#40d060']];
 for(let k=0,x=0;x<W;k++,x+=100){const a=ads[k%3];g.fillStyle=a[2];g.fillRect(x,H-11,98,11);g.fillStyle=a[1];g.font='7px "Russo One",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a[0],x+49,H-5)}
 c.key=key;return STANDS=c}
const cams=[];
function view(g,r,vx,vy,vw,vh,ci,many){const th=THEMES[TR.theme]||THEMES[0];let cam=cams[ci];if(!cam||cam.i!==r.i)cam=cams[ci]={i:r.i,x:r.d};
 const sc=vh/216*1.3,base=vy+vh*.8;cam.x+=(r.d+vw*.12/sc-cam.x)*.15;if(Math.abs(r.d-cam.x)>400)cam.x=r.d;
 const X=(x,z)=>vx+vw*.35+(x-cam.x)*sc+z*SKEW*sc,Y=(h,z)=>base-(h+z*LH)*sc;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
 const sk=g.createLinearGradient(0,vy,0,base);sk.addColorStop(0,th.sky[0]);sk.addColorStop(1,th.sky[1]);g.fillStyle=sk;g.fillRect(vx,vy,vw,vh);
 if(TR.theme===2){g.fillStyle='#fff';for(let k=0;k<30;k++)g.fillRect(vx+(k*137%vw),vy+(k*71%(vh*.4)),1,1);for(let k=0;k<4;k++){const lx=vx+((k*300-cam.x*sc*.5)%(vw+200)+vw+200)%(vw+200)-100;RA.fx.light(g,lx,vy+vh*.12,30,'#fff8d0',.25)}}
 // far hills, stands, the track's far wall
 g.fillStyle=mix(th.grass,'#000000',.2);g.beginPath();g.moveTo(vx,Y(0,LANES+3));for(let x=0;x<=vw;x+=8)g.lineTo(vx+x,Y(0,LANES+3)-14*sc-Math.sin((x+cam.x*sc*.3)*.02)*8*sc);g.lineTo(vx+vw,Y(0,LANES+3));g.fill();
 const st=stands(th),sw=600*sc*.42,sh=70*sc*.42,sy=Y(0,LANES+1.2)-sh;let ox=((-(cam.x*sc*.8))%sw+sw)%sw-sw;for(;ox<vw;ox+=sw)g.drawImage(st,vx+ox,sy,sw,sh);
 g.fillStyle=th.grass;g.fillRect(vx,Y(0,LANES+1.2),vw,vh);
 // the track slab: top surface across the lanes, then the dirt face in front
 const x0=cam.x-vw*.35/sc-LANES*SKEW-10,x1=x0+vw/sc+LANES*SKEW+20,stp=Math.max(1.5,2/sc);
 for(let x=x0;x<x1;x+=stp){const h0=hAt(x),h1=hAt(x+stp),s=(h1-h0)/stp,shade=Math.max(.6,Math.min(1.25,1-s*.9)),xx=((x%TR.L)+TR.L)%TR.L;
  const stripe=Math.floor(xx/40)&1?1:.95;g.fillStyle=mix(th.dirt,s>0?'#000000':'#ffffff',Math.min(.4,Math.abs(1-shade*stripe)));
  g.beginPath();g.moveTo(X(x,-.6),Y(h0,-.6));g.lineTo(X(x+stp,-.6),Y(h1,-.6));g.lineTo(X(x+stp,LANES-.4),Y(h1,LANES-.4));g.lineTo(X(x,LANES-.4),Y(h0,LANES-.4));g.closePath();g.fill()}
 // lane lines, mud, cooling arrows, start / finish
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=Math.max(.5,.5*sc);for(let z=.5;z<LANES-.5;z++){g.beginPath();for(let x=x0;x<x1;x+=6){const a=Math.floor(x/12)&1;if(a)g.moveTo(X(x,z),Y(hAt(x),z));else g.lineTo(X(x,z),Y(hAt(x),z))}g.stroke()}
 const vis2=(a,b)=>{const L=TR.L;const out=[];for(let k=Math.floor(x0/L)-1;k<=Math.floor(x1/L)+1;k++)out.push(k*L);return out};
 for(const off of vis2()){for(const m of TR.mud){if(m[1]+off<x0||m[0]+off>x1)continue;g.fillStyle='rgba(70,44,22,.85)';g.beginPath();for(let x=m[0];x<=m[1];x+=4)g.lineTo(X(x+off,m[2]-.45),Y(hAt(x+off),m[2]-.45));for(let x=m[1];x>=m[0];x-=4)g.lineTo(X(x+off,m[2]+.45),Y(hAt(x+off),m[2]+.45));g.fill()}
  for(const c of TR.cool){const x=c[0]+off;if(x<x0||x>x1)continue;for(let k=0;k<3;k++){const xx=x+k*7;g.fillStyle=(K.tick>>3)%3===k?'#a0f0ff':'#40a0e0';g.beginPath();g.moveTo(X(xx,c[1]-.35),Y(hAt(xx),c[1]-.35));g.lineTo(X(xx+5,c[1]),Y(hAt(xx+5),c[1]));g.lineTo(X(xx,c[1]+.35),Y(hAt(xx),c[1]+.35));g.fill()}}
  for(const fx of[off,off+TR.L])if(fx>x0&&fx<x1){for(let z=0;z<LANES*2;z++)for(let k=0;k<3;k++){g.fillStyle=(z+k)&1?'#f8f8f8':'#181818';const zz=-.5+z/2;g.beginPath();g.moveTo(X(fx+k*4,zz),Y(0,zz));g.lineTo(X(fx+k*4+4,zz),Y(0,zz));g.lineTo(X(fx+k*4+4,zz+.5),Y(0,zz+.5));g.lineTo(X(fx+k*4,zz+.5),Y(0,zz+.5));g.fill()}}}
 // front face of the slab
 const fg=g.createLinearGradient(0,Y(0,-.6),0,Y(-14,-.6));fg.addColorStop(0,th.face);fg.addColorStop(1,mix(th.face,'#000000',.45));g.fillStyle=fg;g.beginPath();g.moveTo(X(x0,-.6),Y(-14,-.6));
 for(let x=x0;x<x1;x+=stp)g.lineTo(X(x,-.6),Y(hAt(x),-.6));g.lineTo(X(x1,-.6),Y(-14,-.6));g.closePath();g.fill();g.fillStyle=mix(th.grass,'#000000',.15);g.fillRect(vx,Y(-14,-.6),vw,vh);
 // things on the track, far lanes first
 const L=[];const P=(d,z)=>{const L2=TR.L,dx=((d-cam.x)%L2+L2*1.5)%L2-L2/2;return cam.x+dx};
 for(const c of crates){if(c.got)continue;const x=P(c.x,c.z);if(x>x0&&x<x1)L.push([c.z,x,0,c])}
 for(const o of oils){if(o.gone)continue;const x=P(o.x,o.z);if(x>x0&&x<x1)L.push([o.z+.01,x,1,o])}
 for(const q of rd){if(q.out)continue;if(q.d>x0-40&&q.d<x1+40)L.push([q.z,q.d,2,q])}
 L.sort((a,b)=>b[0]-a[0]||a[1]-b[1]);
 for(const[z,x,ty,o]of L){const s=sc*(1-z*.05);
  if(ty===0){const h=hAt(x),cx=X(x,z),cy=Y(h,z),w=10*s;RA.fx.shadow(g,cx,cy,w*.5,.3);const cg=g.createLinearGradient(cx-w/2,cy-w,cx+w/2,cy);cg.addColorStop(0,'#f8d898');cg.addColorStop(1,'#8a5a28');g.fillStyle=cg;g.fillRect(cx-w/2,cy-w-Math.sin(K.tick*.1)*s,w,w);
   g.strokeStyle='#5a3818';g.lineWidth=.6*s;g.strokeRect(cx-w/2,cy-w-Math.sin(K.tick*.1)*s,w,w);g.fillStyle='#fff';g.font=Math.round(7*s)+'px "Russo One",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',cx,cy-w/2-Math.sin(K.tick*.1)*s)}
  else if(ty===1){g.fillStyle='rgba(16,12,28,.85)';g.beginPath();g.ellipse(X(x,z),Y(hAt(x),z),9*s,2.6*s,0,0,7);g.fill()}
  else drawRider(g,o,X(o.d,o.z),Y(o.y,o.z),s,r,Y(hAt(o.d),o.z))}
 for(const p of parts){const x=X(p.x,p.z),y=Y(p.y,p.z);g.globalAlpha=Math.min(1,p.t/12);g.fillStyle=p.col;g.fillRect(x-sc,y-sc,2*sc,2*sc)}g.globalAlpha=1;
 for(const t of texts){const x=X(t.d,t.z),y=Y(t.y,t.z);if(x>vx-60&&x<vx+vw+60)RA.gfx.text(g,t.s,x,y,t.col)}
 hud(g,r,vx,vy,vw,vh,many);g.restore();if(many){g.strokeStyle='#000';g.lineWidth=1.5;g.strokeRect(vx,vy,vw,vh)}}
function drawRider(g,q,x,y,s,me,gy){const fl=flags(q),img=bikeImg(q.col),w=26*s*1.1,h=20*s*1.1;
 RA.fx.shadow(g,x,gy,w*.32,.35);
 g.save();g.translate(x,y);if(fl&2){g.rotate(K.tick*.3);g.globalAlpha=.85}else g.rotate(q.pitch);g.drawImage(img,-w/2,-h*.92,w,h);g.restore();g.globalAlpha=1;
 if(fl&16)RA.fx.light(g,x,y-h*.5,w*.45,'#d0e0ff',.18);
 if(fl&8)RA.fx.light(g,x-w*.45,y-h*.3,5*s,'#ffa030',.4);
 if(q!==me&&rd.length>1&&!K.demo)RA.gfx.text(g,q.name,x,y-h-6,q.col)}
function txt(g,s,x,y,size,col,align){g.save();g.font=size+'px "Russo One","Arial Black",sans-serif';g.textAlign=align||'center';g.textBaseline='middle';
 const gr=g.createLinearGradient(0,y-size/2,0,y+size/2);gr.addColorStop(0,mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.35));
 g.lineJoin='round';g.lineWidth=Math.max(1.5,size/5);g.strokeStyle='#000';g.strokeText(s,x,y);g.fillStyle=gr;g.fillText(s,x,y);g.restore()}
const tm=t=>{const s=Math.max(0,t)/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor(s*100)%100).padStart(2,'0')};
function hud(g,r,vx,vy0,vw,vh0,many){const top=vy0===0?24:4,vy=vy0+top,vh=vh0-top,sc=many?.8:1,S=K.S;
 if(K.tick<150){const n=3-Math.floor(K.tick/50);txt(g,n>0?n+'':'GO!',vx+vw/2,vy+vh*.3,24*sc,n>0?'#ffffff':'#40ff80');if(K.tick%50===0&&K.tick<150)RA.audio.blip(440)}
 else if(K.tick<190)txt(g,'GO!',vx+vw/2,vy+vh*.3,24*sc,'#40ff80');
 // progress strip with every rider
 const px0=vx+vw*.2,px1=vx+vw*.8,tot=S.laps*TR.L;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(px0-3,vy+3,px1-px0+6,7);
 for(const q of rd){if(q.out)continue;const t=Math.max(0,Math.min(1,q.d/tot)),x=px0+t*(px1-px0);g.fillStyle=q.col;const s=q===r?3:2;g.fillRect(x-s/2,vy+6.5-s,s,s*2)}
 for(let k=1;k<S.laps;k++){const x=px0+k/S.laps*(px1-px0);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x,vy+3,1,7)}
 if(K.demo)return;
 txt(g,'LAP '+Math.min(S.laps,r.lap+1)+'/'+S.laps,vx+8,vy+20,9*sc,'#ffffff','left');txt(g,tm(r.fin?r.ft:K.tick-150),vx+8,vy+31,6.5*sc,'#c8d8f0','left');
 const pc=r.place===1?'#f8d040':'#ffffff';txt(g,ord(r.place),vx+vw-10,vy+20,12*sc,pc,'right');
 if(K.mode===2){const left=Math.ceil((1800-elimT)/60);txt(g,'ELIMINATION IN '+left,vx+vw-10,vy+33,6.5*sc,left<6?'#ff6060':'#f8d0a0','right')}
 // engine temperature
 const tx=vx+8,ty=vy+vh-16,tw=Math.min(110,vw*.3);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(tx-2,ty-9,tw+4,15);txt(g,r.stall>0?'OVERHEATED!':'TEMP',tx,ty-4.5,5.5,r.stall>0?'#ff6040':'#c8d8f0','left');
 const hg=g.createLinearGradient(tx,0,tx+tw,0);hg.addColorStop(0,'#40c0ff');hg.addColorStop(.55,'#f8e040');hg.addColorStop(.85,'#ff6020');hg.addColorStop(1,'#ff2020');g.fillStyle=hg;g.fillRect(tx,ty,tw*Math.min(1,r.heat/100),4);
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.5;g.strokeRect(tx,ty,tw,4);
 const f=r.fx||{},chips=[['nitro',300,1],['cool',480,2],['wob',300,6]].filter(e=>f[e[0]]>0);if(f.cage>0)chips.push(['cage',1,3]);if(r.item)chips.push(['item',1,r.item]);
 chips.forEach((e,n)=>{const x=vx+vw/2-40,y=vy+14+n*10;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,80,8);g.fillStyle=ITEMS[e[2]].c;g.fillRect(x,y+6,80*Math.min(1,f[e[0]]/e[1]||1),2);txt(g,ITEMS[e[2]].n+(e[0]==='item'?' · Q':''),x+40,y+3.5,5.5,ITEMS[e[2]].c==='#303040'?'#c0c0d0':ITEMS[e[2]].c)});
 if(!r.gr&&!K.demo){const want=slopeToA(r.d+r.vx*12),d=r.pitch-want;txt(g,d>.3?'◀ LEAN BACK':d<-.3?'LEAN FORWARD ▶':'',vx+vw/2,vy+vh-28,7*sc,'#f8e040')}
 if(r.fin)txt(g,ord(r.fin)+' · FINISHED',vx+vw/2,vy+vh*.35,12*sc,r.fin<=3?'#f8d040':'#ffffff');if(r.out)txt(g,'ELIMINATED',vx+vw/2,vy+vh*.35,14*sc,'#ff6060')}
function render(g,W,H){if(!TR){g.fillStyle='#000';g.fillRect(0,0,W,H);return}
 let fs=K.demo?[]:K.focus();if(!fs.length){const lead=rd.slice().sort((a,b)=>a.place-b.place).find(r=>!r.out)||rd[0];fs=lead?[lead.i]:[]}
 fs=fs.slice(0,4);const n=fs.length;if(!n){g.fillStyle='#000';g.fillRect(0,0,W,H);return}
 const rects=n===1?[[0,0,W,H]]:n===2?[[0,0,W,H/2],[0,H/2,W,H/2]]:[[0,0,W/2,H/2],[W/2,0,W/2,H/2],[0,H/2,W/2,H/2],[W/2,H/2,W/2,H/2]];if(n===3){g.fillStyle='#000';g.fillRect(W/2,H/2,W/2,H/2)}
 fs.forEach((i,k)=>{const q=rects[k];view(g,rd[i],Math.round(q[0]),Math.round(q[1]),Math.round(q[2]),Math.round(q[3]),k,n>1)})}
K=RA.kit({id:'excite',name:'EXCITEBIKE',kind:'Motocross',players:'1-20 players',demo:8,localFirst:true,baseH:216,
 desc:'Side-view motocross for up to 20 on a 2.5D dirt track: hit the ramps, lean to land clean, keep the engine cool, and don\'t ride into anyone\'s back wheel. Race, team race or eliminator.',
 blurb:'Space = gas, E / Shift = turbo (heats the engine), W / S change lane, A / D lean. Land at the slope\'s angle!',
 howto:'Space / click gas, E / Shift / right-click turbo, W / S lanes, A / D lean back / forward, Q uses an oil slick. Gamepad: A gas, B turbo, stick lanes and lean.',
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
window.__eb={get rd(){return rd},K,get tr(){return TR}};
})();
