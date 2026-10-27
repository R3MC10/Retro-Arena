/* ROAD BRAWLER — original: fuel is the clock in a top-down traffic race. Preserve weaving,
   narrowing roads, bridges over water and contact that spins the car and costs real time.
   20-player twist: one shared road, solid rivals, directional shoulder checks, catch-up fuel,
   team placement points and a last-car eliminator. Each human has a following camera.
   First 10 seconds: start lights and a hint panel teach auto-drive, A/D, W/S, E and FUEL.
   Why fun: thread a gap without lifting, risk a fuel detour, or shove a rival at a bridge.
   Art: hand-painted letter rows in tools/art/road/art.js; render-sheet.cjs previews them. */
(()=>{
const X=RA.pix,P=X.PAL,ART=/* ART_BEGIN */{"car":["...kkkkkkk...","..kW11111Wk..",".kk11111113kk",".kK11111113Kk",".kK1CCCCC13Kk","..k1CbbbC13k.","..k112W2113k.","..k11222113k.","..k11222113k.","..k1CbbbC13k.",".kK1CCCCC13Kk",".kK12222223Kk",".kkR33333R3kk","..kkkkkkkkk.."],"dash":["...kkkkkkk...","..kY11111Yk..",".kk11111113kk",".kK11WWW113Kk",".kK1CCCCC13Kk","..k1CbbbC13k.","..k112Y2113k.","..k11YYY113k.","..k112Y2113k.","..k1CbbbC13k.",".kK1CCCCC13Kk",".kK12222223Kk",".kkR33333R3kk","..kkkkkkkkk.."],"crash":["...kkkkkkk...","..kW11111Wk..",".kk11111113kk",".kK11k11113Kk",".kK1CCkCC13Kk","..k1CbkkC13k.","..k112k2113k.","..k11222113k.","..k11222113k.","..k1CbbbC13k.",".kK1CCCCC13Kk",".kK12222223Kk",".kkR33333R3kk","..kkkkkkkkk.."],"sedan":["..kkkkkkkkk..",".kYW11111WYk.","kK111111113Kk","kK11CCCCC13Kk",".k11CbbbC13k.",".k112222213k.",".k112222213k.",".k112222213k.",".k11CCCCC13k.","kK11CbbbC13Kk","kK112222213Kk",".kR3333333Rk.","..kkkkkkkkk.."],"truck":["..kkkkkkkkk..",".kWY1111YW3k.","kK111111113Kk","kK1CCCCCCC3Kk",".k1CbbbbbC3k.",".k111111113k.",".kkkkkkkkkkk.","kK1wwwwwww3Kk","kK1wGGGGGw3Kk",".k1wGwwwGw3k.",".k1wGGGGGw3k.",".k1wGwwwGw3k.",".k1wGGGGGw3k.",".k1wGwwwGw3k.","kK1wGGGGGw3Kk","kK1wwwwwww3Kk",".kR3333333Rk.","..kkkkkkkkk.."],"bus":["..kkkkkkkkk..",".kYW11111WYk.","kK1CCCCCCC3Kk","kK1CbbbbbC3Kk",".k111111113k.",".kC1222223Ck.",".kC1WWWWW3Ck.",".kC1222223Ck.",".kk1222223kk.",".kC1222223Ck.",".kC1WWWWW3Ck.",".kC1222223Ck.",".kk1222223kk.",".kC1222223Ck.",".kC1WWWWW3Ck.",".kC1222223Ck.",".kk1222223kk.",".kC1222223Ck.","kKC1222223CKk","kK111111113Kk",".kR3333333Rk.","..kkkkkkkkk.."],"pickup":["...kkkkkkk...","..kYW111WYk..",".kk11111113kk",".kK1CCCCC13Kk","..k1CbbbC13k.","..k11111113k.","..k122W2233k.","..k122W2233k.","..k1WWWWW33k.","..k122W2233k.","..k122W2233k.",".kK13333333Kk",".kkR33333R3kk","..kkkkkkkkk.."],"palm":["......ee.......","..eeeelllee....",".eLLLLllLLLe...","eLLLeellleLLe..","ee....Nl....ee.",".....eNNLe.....","....eLNNLLe....","....eeNNeLe....","......NN.ee....","......NN.......","......NN.......",".....NNN.......","....mNNNm......","...mmNNNmm....."],"cactus":[".....kkk......","....kLLek.....","....kLLek.....",".kk.kLLek.kk..","kLLkkLLekkLek.","kLLekLLekLLek.","kLLLeLLLeLLek.",".kLLLllLLLek..","..kkkLLekkk...","....kLLek.....","....kLLek.....","....kLLek.....","...kNLLDNk....","..kkkkkkkkk..."],"building":[".kkkkkkkkkkkkkk.","kgggggggggggggGk","kgKKKKKKKKKKKgGk","kgKcCKcCKcCKKgGk","kgKbbKbbKbbKKgGk","kgKKKKKKKKKKKgGk","kgKpPKpPKpPKKgGk","kgKvvKvvKvvKKgGk","kgKKKKKKKKKKKgGk","kgKcCKcCKcCKKgGk","kgKbbKbbKbbKKgGk","kgKKKKKKKKKKKgGk","kgKpPKpPKpPKKgGk","kgKvvKvvKvvKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kgKKKKKKKKKKKgGk","kGGGGGGGGGGGGGGk",".kkkkkkkkkkkkkk."],"slick":["...kkkkkk....","..kkKggKkk...",".kKKgggKKKk..","kkKgggggKKkk.","kKgggggggKKk.",".kKKgggKKKk..","..kkKKKKkk...","....kkkk....."],"flame":["kYkYk","kYOYk",".YOY.",".YRY.","..R.."],"roll":["...kkkkkkk...","..kW11111Wk..",".kk11111113kk",".kG11111113Gk",".kK1CCCCC13Kk","..k1CbbbC13k.","..k112W2113k.","..k11222113k.","..k11222113k.","..k1CbbbC13k.",".kG1CCCCC13Gk",".kK12222223Kk",".kkR33333R3kk","..kkkkkkkkk.."]}/* ART_END */;
const CD=180,SECTION=6000,LENGTH=SECTION*3,TEAM=['#f05050','#60a0ff'];
let K,cars=[],theme=0,used=[],oils=[],effects=[],marks=[],first=0,ended=false,hitSeq=0,endTick=0;
const hash=n=>{let x=(n+K.seed)|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return((x^(x>>>16))>>>0)/4294967296};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),round=v=>Math.round(v*10)/10;
const mine=c=>K.isClient()?c.i===K.myIdx:K.seats[c.i].ctrl!=='net';
const human=c=>!c.cpu,teamOf=i=>i%2;
const elapsed=()=>Math.max(0,K.tick-CD),road=d=>{const z=((d%SECTION)+SECTION)%SECTION,bridge=z>2850&&z<3600;return{center:Math.sin(d/1100)*19+Math.sin(d/420)*6,half:Math.min(72+Math.sin(d/710)*15,50+Math.max(0,2850-z,z-3600)*.25),bridge,z}};
function start(seats,md,S,seed){theme=S.course==='rnd'?Math.floor(RA.util.mulberry(seed)()*3):+S.course;used=[];oils=[];effects=[];marks=[];endTick=0;first=0;ended=false;hitSeq=0;
 cars=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAM[i%2]:s.col,cpu:s.ctrl==='cpu',x:(i%5-2)*23,d:-(i/5|0)*25,v:0,vx:0,fuel:100,spin:0,angle:0,inv:0,dash:0,cd:0,turbo:0,shield:0,oil:0,out:0,fin:0,ft:0,crashes:0,picks:0,place:i+1,cam:-(i/5|0)*25,msg:'',mt:0,rescue:-1,ack:0}));}
// Traffic moves in world space at a fixed speed: every client sees the same cars.
function traffic(c){const out=[],q=c.d-elapsed()*.72,base=Math.floor(q/105),density={light:.40,normal:.65,heavy:.88}[K.S.traffic]||.65;
 for(let j=base-2;j<base+5;j++){if(j<3||hash(j*7)>density)continue;const d=j*105+elapsed()*.72,r=road(d),x=r.center+(hash(j*7+1)*2-1)*(r.half-14);out.push({id:j,x,d,type:hash(j*7+2)<.20?'bus':hash(j*7+2)<.44?'truck':'sedan'});
 // the leader meets an additional vehicle in some waves; back markers pass it after it exits.
 if(Math.abs(d-Math.max(...cars.filter(o=>!o.out).map(o=>o.d)))<210&&hash(j*7+3)<.22)out.push({id:j+100000,x:r.center+(x<r.center?1:-1)*(r.half-19),d:d+36,type:'sedan'});
 }return out}
function pickups(c){const out=[],base=Math.floor(c.d/200);for(let j=base-1;j<base+3;j++){if(j<1)continue;const d=j*200+30,r=road(d),kind=K.S.items==='off'||j%3===0?0:1+(j%3),x=r.center+(hash(j*23+1)*2-1)*(r.half-16);if(!used.includes(j))out.push({id:j,x,d,kind});
 // a separate fuel lane, available only to the back half, is visible and labelled for them.
 if(j%3===0&&j>c.rescue&&(c.place>Math.ceil(cars.filter(o=>!o.out).length/2)||c.fuel<18))out.push({id:10000+j*20+c.i,x:r.center,d:d+90,kind:0});}return out}
function say(c,msg){c.msg=msg;c.mt=110}
function sound(c,s){if(human(c)&&mine(c)&&!K.demo)RA.audio.sfx(s)}
function particle(c,col,n=6){for(let j=0;j<n;j++)effects.push({x:c.x,d:c.d,vx:(Math.random()-.5)*1.7,vd:(Math.random()-.5)*1.2,life:20+Math.random()*15,col})}
function crash(c,reason){if(c.inv||c.spin||c.out||c.fin)return;if(c.shield){c.shield=0;c.inv=55;say(c,'SHIELD SAVED YOU');sound(c,'road-pick');return}c.spin=90;c.inv=140;c.crashes++;(c.log||(c.log=[])).push([K.tick,reason,Math.round(c.d),Math.round(c.x)]);if(c.log.length>30)c.log.shift();c.v*=.32;c.vx=c.vx*.5+(c.x>road(c.d).center?-1:1)*.7;say(c,reason);sound(c,'road-spin');particle(c,P.w,10)}
function drive(c,k){if(c.out||c.fin||K.tick<CD)return;
 for(const key of ['inv','cd','dash','turbo','mt'])if(c[key]>0)c[key]--;
 let steer=(k.right?1:0)-(k.left?1:0);if(Math.abs(k.ax||0)>.2)steer=k.ax;
 if((k.alt||k.fire)&&!c.cd&&!c.spin&&c.fuel>0){c.dash=15;c.cd=150;c.vx+=Math.sign(steer||c.vx||1)*1.9;sound(c,'road-bump')}
 if((k.b3||(K.seats[c.i].ctrl==='touch'&&k.fire))&&c.oil){c.oil=0;if(!K.isClient())oils.push([round(c.x),round(c.d-14),K.tick+420]);else c.drop=K.tick;}
 const ai=c.cpu,leader=cars.find(o=>human(o)&&!o.out),gap=leader?c.d-leader.d:0;
 let top=k.up?2.48:k.down?1.15:2.22;
 if(ai){top*=[.80*(.88+hash(c.i*117)*.20),.94,.99][K.cpu];top*=gap>230?.91:gap< -350?1.035:1;top=Math.min(top,2.46)}
 if(c.turbo)top*=1.28;
 if(c.fuel<=0)top=0;
 if(c.spin){c.spin--;c.angle+=.22;c.v*=.984;c.vx*=.96;if(K.tick%3===0){particle(c,P.G,1);marks.push({x:c.x,d:c.d,t:260})}if(!c.spin)c.angle=0;}
 else {c.v+=(top-c.v)*.027;c.vx+=(steer*3.5-c.vx)*.16;c.angle=steer*.13;}
 c.x+=c.vx;c.d+=c.v;c.fuel=Math.max(0,c.fuel-(K.S.fuel==='generous'?.010:.015));
 const r=road(c.d),edge=r.half-7,off=c.x-r.center;
 if(Math.abs(off)>edge){c.x=r.center+Math.sign(off)*edge;const hard=Math.abs(c.vx)>2.1&&c.v>1.45;c.vx*=-.3;if(hard)crash(c,'BARRIER - STEER EARLIER');else{c.v*=.97;if(K.tick%6===0)particle(c,P.Y,2);sound(c,'road-skid')}}
 for(const o of traffic(c))if(Math.abs(c.x-o.x)<(o.type==='sedan'?10:12)&&Math.abs(c.d-o.d)<(o.type==='bus'?22:16))crash(c,'TRAFFIC!');
 for(const o of oils)if(Math.abs(c.x-o[0])<11&&Math.abs(c.d-o[1])<10)crash(c,'OIL SLICK!');
 for(const p of pickups(c))if(Math.abs(c.x-p.x)<13&&Math.abs(c.d-p.d)<17){if(K.isClient()){c.want=p.id;}else collect(c,p)}
 if(c.fuel<=0&&c.v<.08){c.out=K.tick;say(c,'OUT OF FUEL');}
 c.cam+=(c.d-c.cam)*.22;
}
function collect(c,p){if(p.id>=10000){const j=Math.floor((p.id-10000)/20);if(j<=c.rescue)return;c.rescue=j}else{if(used.includes(p.id))return;used.push(p.id);if(used.length>90)used.shift();}const ev=[++hitSeq,c.i,p.kind,p.id];if(mine(c))award(c,p.kind);else K.fx('pick',...ev)}
function award(c,kind){c.picks++;if(kind===0){c.fuel=Math.min(100,c.fuel+31);say(c,'FUEL +31')}if(kind===1){c.turbo=190;say(c,'TURBO!')}if(kind===2){c.oil=1;say(c,'OIL - Q / PAD X')}if(kind===3){c.shield=1;say(c,'SHIELD READY')}sound(c,'road-pick')}
function impact(c,dx){if(c.out||c.fin)return;if(c.shield){c.shield=0;c.inv=55;say(c,'SHIELD SAVED YOU');sound(c,'road-pick');return}c.vx+=dx;c.x+=Math.sign(dx)*2;c.v*=.94;sound(c,'road-bump');particle(c,P.Y,3)}
function sendImpact(c,dx){if(mine(c))impact(c,dx);else K.fx('hit',++hitSeq,c.i,round(dx))}
function order(){return cars.slice().sort((a,b)=>a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:a.out&&b.out?b.out-a.out:a.out?1:b.out?-1:b.d-a.d)}
function step(){K.takeover();if(ended){visual();return}for(const c of cars){c.cpu=K.seats[c.i].ctrl==='cpu';if(mine(c))drive(c,K.inp(c.i));else{const u=K.remote(c.i);if(u)readUp(c,u)}}
 if(K.tick<CD){visual();return}
 for(const c of cars)if(!c.fin&&!c.out&&c.fuel<=0&&c.v<.08)c.out=K.tick;
 order().forEach((c,i)=>c.place=i+1);
 // Host referees shared contacts and pickups; victims apply impulses on their owning device.
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j];if(a.out||b.out||a.fin||b.fin||Math.abs(a.d-b.d)>16||Math.abs(a.x-b.x)>12)continue;
 const sd=a.x>=b.x?1:-1,over=(12-Math.abs(a.x-b.x))*.35;if(K.tick%10===0){sendImpact(a,sd*(b.dash?2.9:.5));sendImpact(b,-sd*(a.dash?2.9:.5))}if(mine(a))a.x+=sd*over;if(mine(b))b.x-=sd*over;}
 for(const c of cars){if(c.want!=null){const p=pickups(c).find(p=>p.id===c.want);if(p&&Math.abs(c.x-p.x)<21&&Math.abs(c.d-p.d)<35)collect(c,p);c.want=null}if(c.drop){oils.push([round(c.x),round(c.d-14),K.tick+420]);c.drop=0}}
 oils=oils.filter(p=>p[2]>K.tick).slice(-12);
 if(K.mode===2){if(elapsed()>0&&elapsed()%elimT()===0){const last=order().filter(c=>!c.out).pop();if(last){last.out=K.tick;K.fx('out',last.i)}}const live=cars.filter(c=>!c.out);if(live.length<=1)finish();}
 else {for(const c of cars)if(!c.fin&&!c.out&&c.d>=LENGTH){c.fin=1+cars.filter(o=>o.fin).length;c.ft=elapsed();if(!first)first=K.tick;}
 if(first&&K.tick-first>=1200||cars.every(c=>c.fin||c.out)||elapsed()>18000)finish();}
 visual();}
function finish(){if(ended)return;ended=true;endTick=K.tick;order().forEach((c,i)=>c.place=i+1);if(K.mode===1){const pts=[0,0];order().forEach((c,j)=>pts[c.i%2]+=cars.length-j);const t=pts[0]===pts[1]?order()[0].i%2:pts[0]>pts[1]?0:1;K.end({team:t,name:t?'BLUE TEAM':'RED TEAM'})}else K.end({i:order()[0].i})}
function visual(){for(const p of effects){p.x+=p.vx;p.d+=p.vd;p.life--}effects=effects.filter(p=>p.life>0).slice(-140);for(const m of marks)m.t--;marks=marks.filter(m=>m.t>0).slice(-240)}
function local(i){if(cars[i])drive(cars[i],K.inp(i));visual()}
function upload(i){const c=cars[i];return c?{a:[round(c.x),round(c.d),round(c.v),round(c.vx),round(c.fuel),c.spin,c.inv,c.dash,c.cd,c.turbo,c.shield,c.oil,c.crashes,c.picks],ack:c.ack,want:c.want,drop:c.drop}:null}
function readUp(c,u){if(!Array.isArray(u.a)||u.a.length!==14||u.a.some(v=>!Number.isFinite(v))||c.out||c.fin)return;const a=u.a;c.x=clamp(a[0],-130,130);c.d=a[1];c.v=clamp(a[2],0,3.5);c.vx=clamp(a[3],-7,7);c.fuel=clamp(a[4],0,100);[c.spin,c.inv,c.dash,c.cd,c.turbo,c.shield,c.oil,c.crashes,c.picks]=a.slice(5);c.angle=c.spin?c.spin*.22:clamp(c.vx*.04,-.2,.2);c.want=u.want;if(u.drop&&u.drop!==c.lastDrop){c.drop=u.drop;c.lastDrop=u.drop}c.cam=c.d;}
function snap(){return{rc:cars.map(c=>[round(c.x),round(c.d),round(c.v),round(c.vx),Math.round(c.fuel),c.spin,c.inv,c.dash,c.cd,c.turbo,c.shield,c.oil,c.out,c.fin,c.ft,c.cpu?1:0,c.crashes,c.picks,c.rescue]),th:theme,us:used.slice(-60),oi:oils,ff:first}}
function apply(g){theme=g.th;used=g.us||[];oils=g.oi||[];first=g.ff||0;(g.rc||[]).forEach((a,i)=>{const c=cars[i];if(!c)return;c.cpu=!!a[15];c.out=a[12];c.fin=a[13];c.ft=a[14];c.rescue=a[18];if(i===K.myIdx)return;c.tx=a[0];c.td=a[1];c.v=a[2];c.vx=a[3];c.fuel=a[4];c.spin=a[5];c.inv=a[6];c.dash=a[7];c.cd=a[8];c.turbo=a[9];c.shield=a[10];c.oil=a[11];c.crashes=a[16];c.picks=a[17];if(Math.abs(c.d-c.td)>100){c.x=c.tx;c.d=c.td} });order().forEach((c,i)=>c.place=i+1)}
function follow(){for(const c of cars)if(c.i!==K.myIdx&&c.td!=null){if(!c.out&&!c.fin)c.td+=c.v;c.x+=(c.tx-c.x)*.35;c.d+=(c.td-c.d)*.35;c.angle=c.spin?K.tick*.22:c.vx*.04;c.cam=c.d}}
function onFx(k,a){if(k==='pick'){const c=cars[a[1]];if(c&&mine(c)){award(c,a[2]);c.ack=a[0];c.want=null}}if(k==='hit'){const c=cars[a[1]];if(c&&mine(c))impact(c,a[2])}if(k==='out'&&cars[a[0]])cars[a[0]].out=K.tick;}
// Predict the gap in traffic, rather than twitching toward the centre of the road.
// Eliminator: 25 s per knock-out up to 8 cars, shorter for big fields so a match stays near 3 minutes
const elimT=()=>Math.max(600,Math.min(1500,Math.round(10500/Math.max(1,cars.length-1))));
function bot(i){const c=cars[i];if(!c||c.out||c.fin)return{};const lvl=c.cpu?K.cpu:2,look=[48,78,95][lvl],r=road(c.d+look);let target=r.center+(i%5-2)*10;
 const fuel=pickups(c).filter(p=>p.d>c.d+14&&p.d<c.d+180&&(p.kind===0?c.fuel<85:K.S.items!=='off')).sort((a,b)=>(a.kind===0?-90:0)+a.d-((b.kind===0?-90:0)+b.d))[0];if(fuel)target=fuel.x;
 const obs=traffic(c).filter(o=>o.d>c.d-12&&o.d<c.d+look);for(const o of obs)if(Math.abs(target-o.x)<23){const left=o.x-26,right=o.x+26;target=left>r.center-r.half+12&&Math.abs(c.x-left)<Math.abs(c.x-right)||right>r.center+r.half-12?left:right;}
 target=clamp(target,r.center-r.half+14,r.center+r.half-14);
 const err=target-c.x-c.vx*16,dead=[5,3,2][lvl],o={left:err< -dead,right:err>dead,up:true};
 // Easy misses occasional hazards and reacts late, but never parks at a wall.
 if(c.cpu&&lvl===0&&K.tick%240<12){o.left=false;o.right=false}
 if(c.oil&&K.tick%240===0)o.b3=true;return o}
const IMG=new Map();function sprite(type,col){const key=type+col;if(!IMG.has(key))IMG.set(key,X.recolor(ART[type],col,null,'road-'+type));return IMG.get(key)}
function blit(g,im,x,y,a=0){if(a){a=Math.atan2(Math.sin(a),Math.cos(a));im=X.rot(im,Math.round(a/(Math.PI/18))*Math.PI/18)};g.drawImage(im,Math.round(x-im.width/2),Math.round(y-im.height/2))}
const SCENERY={};function scenery(type){return SCENERY[type]||(SCENERY[type]=X.sprite(ART[type]))}
const THEMES=[{name:'COAST',land:'#4c9848',water:'#2058a0',edge:'#e8c088',side:'#307a36',prop:'palm'},{name:'DESERT',land:'#c49058',water:'#308cb0',edge:'#f0d090',side:'#b07840',prop:'cactus'},{name:'NIGHT CITY',land:'#18182c',water:'#142850',edge:'#50546c',side:'#28243c',prop:'building'}];
let SCR=X.screen(),engine=null;
function view(g,c,vx,vy,vw,vh,small){const th=THEMES[theme],bottom=vy+vh,anchor=bottom-(small?22:40),cam=c.cam,ox=vx+vw/2;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();g.fillStyle=th.land;g.fillRect(vx,vy,vw,vh);
 for(let y=vy;y<bottom;y++){const d=cam+anchor-y,r=road(d),l=Math.round(ox+r.center-r.half),rr=Math.round(ox+r.center+r.half);
 if(r.bridge||theme===0){g.fillStyle=th.water;g.fillRect(vx,y,Math.max(0,l-vx-15),1);if(r.bridge)g.fillRect(rr+8,y,vx+vw-rr-8,1);if((Math.floor(d/9)&3)===0){g.fillStyle=theme===2?'#205080':'#3898c0';for(let xx=vx+((Math.floor(d/7)*13)%23);xx<l-18;xx+=25)g.fillRect(xx,y,8,1)}}
 g.fillStyle=th.edge;g.fillRect(l-7,y,7,1);g.fillRect(rr,y,7,1);g.fillStyle='#383c48';g.fillRect(l,y,rr-l,1);
 if(Math.floor(d/13)%2===0){g.fillStyle='#626474';g.fillRect(l+2,y,1,1);g.fillRect(rr-3,y,1,1)}
 if(Math.floor(d/19)%2===0){g.fillStyle='#d8cc9c';g.fillRect(Math.round(l+(rr-l)/3),y,1,1);g.fillRect(Math.round(l+2*(rr-l)/3),y,1,1)}
 if(r.bridge){g.fillStyle='#a0acb0';g.fillRect(l-4,y,3,1);g.fillRect(rr+1,y,3,1);if(Math.floor(d)%24<3){g.fillStyle=P.k;g.fillRect(l-6,y,5,1);g.fillRect(rr+1,y,5,1)}}
 if(Math.abs(d-LENGTH)<3||d>=0&&d<5){g.fillStyle=(Math.floor(y/3)&1)?P.W:P.k;for(let xx=l;xx<rr;xx+=6)g.fillRect(xx,y,3,1)} }
 const dmin=cam+anchor-bottom,dmax=cam+anchor-vy;
 for(let j=Math.floor(dmin/68);j<=Math.ceil(dmax/68);j++){const d=j*68,r=road(d);if(r.bridge)continue;const sd=j%2?1:-1,xx=ox+r.center+sd*(r.half+20+hash(j*31)*17);blit(g,scenery(th.prop),xx,anchor+cam-d);if(theme===2){g.fillStyle=j%2?P.p:P.c;g.fillRect(Math.round(xx-5),Math.round(anchor+cam-d),10,2)}}
 for(let section=1;section<=3;section++){const yy=anchor+cam-section*SECTION;if(yy>vy+25&&yy<bottom-15){g.fillStyle=P.k;g.fillRect(ox-57,yy-9,114,13);X.text(g,section===3?'FINISH':'SECTION '+(section+1),ox,yy-6,{align:'center',col:P.Y})}}
 for(const m of marks){const y=anchor+cam-m.d;if(y>vy&&y<bottom){g.fillStyle=P.K;g.fillRect(Math.round(ox+m.x-4),Math.round(y),2,3);g.fillRect(Math.round(ox+m.x+4),Math.round(y),2,3)}}
 for(const o of oils)if(Math.abs(o[1]-cam)<190)blit(g,scenery('slick'),ox+o[0],anchor+cam-o[1]);
 for(const o of traffic(c)){const y=anchor+cam-o.d;if(y<vy-30||y>bottom+30)continue;blit(g,sprite(o.type,o.type==='bus'?'#e0b848':o.type==='truck'?'#a0b0b8':'#c87848'),ox+o.x,y)}
 for(const p of pickups(c)){const y=anchor+cam-p.d;if(y<vy-22||y>bottom+22)continue;blit(g,sprite('pickup',[P.L,P.c,P.v,P.W][p.kind]),ox+p.x,y);X.text(g,['FUEL','BOOST','OIL','GUARD'][p.kind],ox+p.x,y-16,{align:'center',col:[P.Y,P.C,P.V,P.W][p.kind],outline:P.k})}
 for(const o of cars){if(o.out&&o!==c)continue;const y=anchor+cam-o.d;if(y<vy-25||y>bottom+25)continue;const xx=ox+o.x;
 if(o.shield){g.strokeStyle=P.C;g.strokeRect(Math.round(xx-8),Math.round(y-12),16,24)}if(o.turbo&&K.tick%4<2)blit(g,scenery('flame'),xx,y+13);
 g.fillStyle=P.k;g.fillRect(Math.round(xx-5),Math.round(y-7),12,17);const paint=o.inv&&!o.spin&&(K.tick>>2)&1?P.W:o.fin&&(K.tick>>3)&1?P.Y:o.col;blit(g,sprite(o.spin?'crash':o.dash?'dash':Math.floor(o.d/7)%2?'roll':'car',paint),xx,y,o.angle);
 if(o===c){g.fillStyle=P.Y;g.fillRect(Math.round(xx-2),Math.round(y-16),5,2);g.fillRect(Math.round(xx-1),Math.round(y-14),3,1)}else if(!o.cpu)X.text(g,o.name.slice(0,5),xx,y-20,{align:'center',col:o.col,outline:P.k});
 }
 for(const p of effects){g.fillStyle=p.col;g.fillRect(Math.round(ox+p.x),Math.round(anchor+cam-p.d),2,2)}
 // The HUD sits on an opaque strip so it survives water, neon, traffic and split screen.
 g.fillStyle=P.k;g.fillRect(vx,vy,vw,30);const tx=(s,x,y,col=P.W,align='left',scale=1)=>X.text(g,s,x,y,{col,align,scale,shadow:false});
 tx('FUEL',vx+5,vy+12,c.fuel<25?P.R:P.Y);g.fillStyle=P.K;g.fillRect(vx+35,vy+12,42,6);g.fillStyle=c.fuel<25?P.R:P.L;g.fillRect(vx+36,vy+13,Math.round(c.fuel*.40),4);
 tx(c.place+'/'+cars.length,vx+vw-5,vy+12,P.W,'right');const x0=vx+88,x1=vx+vw-44,span=K.mode===2?Math.max(LENGTH,...cars.map(o=>o.d+200)):LENGTH;
 g.fillStyle=P.g;g.fillRect(x0,vy+15,x1-x0,2);for(let j=1;j<=3;j++){g.fillStyle=P.W;g.fillRect(Math.round(x0+(x1-x0)*j/3),vy+13,1,5)}
 for(const o of cars){g.fillStyle=o===c?P.W:o.out?P.g:o.col;g.fillRect(Math.round(x0+clamp(o.d/span,0,1)*(x1-x0)),vy+13,o===c?2:1,5)}
 tx(th.name+'  '+(K.mode===2?'OUT IN '+Math.ceil((elimT()-elapsed()%elimT())/60):'SECTION '+Math.min(3,1+Math.floor(Math.max(0,c.d)/SECTION))+'/3'),vx+5,vy+22,P.G);
 tx(c.oil?'Q:OIL':c.cd?'BUMP '+(c.cd/60).toFixed(1):'E:BUMP',vx+vw-5,vy+22,c.cd?P.g:P.C,'right');
  if(K.tick<600&&!K.demo){if(K.tick<CD){tx(String(Math.max(1,3-Math.floor(K.tick/60))),ox,vy+vh*.36,P.Y,'center',3)}
 const yy=bottom-(small?18:30);g.fillStyle=P.k;g.fillRect(vx+2,yy-2,vw-4,small?17:26);tx('A/D STEER  W FASTER  S BRAKE',ox,yy,P.Y,'center');tx('E BUMP - GRAB FUEL - 3 SECTIONS',ox,yy+9,P.W,'center');}
 else if(c.mt>0)tx(c.msg,ox,vy+(small?25:37),P.Y,'center');
 if(c.spin)tx('SPIN! RECOVERING',ox,vy+vh*.4,P.R,'center');if(c.out)tx(K.mode===2?'ELIMINATED':'OUT OF FUEL',ox,vy+vh*.5,P.R,'center');if(c.fin)tx('FINISHED #'+c.fin,ox,vy+vh*.4,P.Y,'center',2);
 if(first&&!c.fin&&!c.out)tx('FINISH CLOSES IN '+Math.max(0,Math.ceil((1200-K.tick+first)/60)),ox,bottom-12,P.Y,'center');
 if(K.demo)tx('ROAD BRAWLER',ox,bottom-16,P.Y,'center',2);g.restore();}
function render(ctx,W,H){const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,W,H);if(cars.length){let fs=K.demo?[0]:K.focus();if(!fs.length)fs=[order().find(c=>!c.out)?.i||0];fs=fs.slice(0,4);const w=SCR.w,h=SCR.h-(K.demo?0:9),n=fs.length,rects=n===1?[[0,0,w,h]]:n===2?[[0,0,w,h>>1],[0,h>>1,w,h-(h>>1)]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];fs.forEach((i,j)=>view(g,cars[i],...rects[j],n>1));}SCR.present(ctx,W,H);engineSound()}
function engineSound(){const ac=RA.audio.ctx;if(!ac)return;const me=cars[K.myIdx>=0?K.myIdx:K.seats.findIndex(s=>s.ctrl!=='cpu'&&s.ctrl!=='net')],active=me&&!K.demo&&K.state==='play'&&RA.menu.current?.id==='road-fighter';if(!engine&&active){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';g.gain.value=0;o.connect(g);g.connect(ac.destination);o.start();engine={o,g}}if(engine){const v=RA.audio.vol;engine.g.gain.setTargetAtTime(active&&!v.mute ? .025*v.master/100*v.sfx/100:0,ac.currentTime,.1);engine.o.frequency.setTargetAtTime(me?42+me.v*48:40,ac.currentTime,.08)}}
for(const [name,notes]of [['road-pick',[660,880,1320]],['road-bump',[100,65]],['road-skid',[460,260]],['road-spin',[380,210,80]]])RA.audio.add(name,(ac,t,g)=>{g.gain.value=.12;notes.forEach((f,j)=>{const o=ac.createOscillator(),v=ac.createGain();o.type=name==='road-pick'?'square':'sawtooth';o.frequency.setValueAtTime(f,t+j*.07);v.gain.setValueAtTime(.6,t+j*.07);v.gain.exponentialRampToValueAtTime(.001,t+j*.07+.1);o.connect(v);v.connect(g);o.start(t+j*.07);o.stop(t+j*.07+.11)})});
const T=RA.music.track;
K=RA.kit({id:'road-fighter',name:'ROAD BRAWLER',kind:'Road racing',baseH:180,demo:8,localFirst:true,
 desc:'Weave through traffic, chase fuel and shoulder-check twenty rivals on one road.',blurb:'Three road sections. Fuel is your clock. Auto-drive, steer through traffic and reach the finish first.',
 howto:'A/D or arrows steer, W faster, S brake, E / Space bump (pad B/A), Q drops oil (pad X). Green cars refill fuel. Race 3 sections; team points per place; eliminator drops last every 25 seconds.',
 fireLabel:'BUMP',kb:[['A D','steer'],['W S','speed / brake'],['E SPACE','bump'],['Q','oil'],['ESC','menu']],pad:[['LS','steer / speed'],['B A','bump'],['X','oil']],
 icon:['s.......s.','s..kkkk.s.','s.kccccks.','s.kckkcks.','s..cccc.s.','s.kccccks.','s.kkkkkks.','s....w..s.','s.......s.','s....w..s.'],
 music:[T('Saltwater Sprint',150,['Am','F','C','G'],'k.hsk.hsk.hsk.hs','a4 e5 a5 b5 c6 b5 a5 e5 f5 a5 c6 a5 g5 e5 c5 g4'),T('Mirage Motorway',156,['Dm','Bb','F','A'],'ksh.k.hsksh.k.hs','d5 a5 f5 e5 d5 f5 a5 c6 bb5 f5 d5 f5 a5 e5 c#5 e5'),T('Neon Overdrive',164,['Em','C','Am','B'],'k.hsksh.k.hsksh.','e5 b5 e6 d6 b5 g5 e5 g5 c6 g5 e5 c5 a4 e5 b4 d#5')],
 modes:[['RACE','First across three sections. Finish within 20 seconds of the winner.'],['TEAM RACE','Red vs blue: every place earns points.'],['ELIMINATOR','Last car is out every 10-25 seconds. Keep driving to be the last survivor.']],
 settings:[['course','Course',[['rnd','Random'],[0,'Coast'],[1,'Desert'],[2,'Night city']]],['traffic','Traffic',[['light','Light'],['normal','Normal'],['heavy','Heavy']],'normal'],['items','Items',[['on','On'],['off','Off']]],['fuel','Fuel',[['normal','Normal'],['generous','Generous']]]],
 start,step,local,upload,snap,apply,follow,onFx,bot,render,teamOf,alive:i=>!!cars[i]&&!cars[i].out,out:i=>!!cars[i]?.out,
 ranks:()=>order().map(c=>[c.name,c.col,K.mode===2&&!c.out?'Survived '+((endTick?endTick-CD:elapsed())/60).toFixed(1)+'s':c.fin?'#'+c.fin+' - '+(c.ft/60).toFixed(1)+'s':c.out?(K.mode===2?'Eliminated':'Fuel empty'):'Section '+Math.min(3,1+Math.floor(Math.max(0,c.d)/SECTION))+' - '+Math.round(clamp(c.d/LENGTH,0,1)*100)+'%']),
 result:(i,w)=>({won:w&&(w.team!=null?w.team===i%2:w.i===i),clean:cars[i].crashes===0,pickups:cars[i].picks,bestScore:Math.round(cars[i].d),kills:0}),
 ach:[{id:'first',name:'Road Rookie',desc:'Complete a match',test:s=>s.played>=1,unlock:'title:Road Rookie'},{id:'win',name:'Road Warrior',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Road Warrior'},{id:'clean',name:'Clean Machine',desc:'Win without spinning',test:(s,m)=>m.won&&m.clean,unlock:'title:Clean Machine'},{id:'fuel',name:'Pit Crew',desc:'Collect 10 pickup cars in one match',test:(s,m)=>m.pickups>=10,unlock:'title:Pit Crew'}]});
setInterval(engineSound,150);
window.__road={K,bot,get cars(){return cars},traffic,pickups,road,crash,get art(){return ART}};
})();

