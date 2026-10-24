/* SKY ACES for Retro Arena: top-down biplane dogfights for up to 20 over a scrolling countryside, clouds drifting below and above.
   A / D bank, W / S throttle, Space or click fires the guns, E drops a bomb on ground targets. Keys steer, the mouse never does.
   Modes: DOGFIGHT (everyone for themselves) · SQUADRONS (red vs blue) · CO-OP (the Red Baron's squadron, flak guns and a zeppelin boss).
   One plane with upgrades from crates that float down on parachutes:
    TWIN VICKERS (double guns) · AFTERBURNER · ARMOR PLATE (+2 hits) · SMOKE SCREEN (trail that hides you) · REPAIR KIT
    party: ENGINE STALL (a rival's engine sputters) · OIL SPLAT (a rival's windscreen) · CROSSWIND (shoves everyone else sideways).
   Your plane and your bullets fly on your machine and you call your own hits, so dogfights have no lag (RA.kit localFirst). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const MW=1800,MH=1800,TEAMC=['#f04848','#4890f8'];
const ITEMS=[null,{n:'TWIN VICKERS',c:'#f8d040'},{n:'AFTERBURNER',c:'#ff7020'},{n:'ARMOR PLATE',c:'#a0a8b8'},{n:'SMOKE SCREEN',c:'#e0e0e0'},{n:'REPAIR KIT',c:'#40e060'},{n:'ENGINE STALL',c:'#806040',party:1},{n:'OIL SPLAT',c:'#202020',party:1},{n:'CROSSWIND',c:'#80d0ff',party:1}];
RA.audio.add('mg',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='bandpass';f.frequency.value=1500;g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.05);s.connect(f);f.connect(g);s.start();s.stop(now+.06)});
const MUSIC=[T('Hangar',104,['G','Em','C','D'],'k...s...k.k.s...','g5 - b5 d6 - b5 g5 - e5 - g5 b5 - g5 e5 - c5 - e5 g5 - e5 c5 - d5 - f#5 a5 - d6 - -'),
 T('Scramble',146,['Dm','Bb','C','A'],'k.hsk.hsk.hsk.hs','d5 . f5 . a5 . d6 . bb5 . f5 . d5 . bb4 . c5 . e5 . g5 . c6 . a5 . e5 . c#5 . a4 .'),
 T('Dogfight',162,['Em','C','G','B'],'k.hhs.hhk.hhs.hk','e5 g5 b5 e6 b5 g5 e5 . c5 e5 g5 c6 g5 e5 c5 . g4 b4 d5 g5 d5 b4 g4 . b4 d#5 f#5 b5 f#5 d#5 b4 .'),
 T('Red Baron',178,['Cm','Ab','Bb','G'],'k.hsk.hsk.hsk.ss','c5 . eb5 . g5 . c6 . ab5 . eb5 . c5 . ab4 . bb4 . d5 . f5 . bb5 . g5 - b5 - d6 - g6 -')];
let K,planes=[],foes=[],guns=[],shots=[],crates=[],bombs=[],parts=[],texts=[],smokes=[],clouds=[],zep=null,wind=0,nextId=0,deco=null;
const wrap=(v,m)=>((v%m)+m)%m,wd=(a,b,m)=>{let d=b-a;if(d>m/2)d-=m;if(d<-m/2)d+=m;return d};
const teamOf=i=>K.mode===1?i%2:K.mode===2?0:i;
function spawnPos(i){const a=i/Math.max(1,planes.length)*Math.PI*2;return[MW/2+Math.cos(a)*500,MH/2+Math.sin(a)*500,a+Math.PI]}
function start(seats,md,S,seed){champ=-1;wave=0;planes=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,x:0,y:0,a:0,sp:2,hp:3,maxhp:3,alive:true,dead:0,kills:0,deaths:0,score:0,lives:S.lives,out:false,fx:{},inv:120,cd:0,shotSeq:0,hitLog:[],rSeen:0,myShots:[],bombCd:0}));
 planes.forEach((p,i)=>{const[x,y,a]=spawnPos(i);Object.assign(p,{x,y,a})});
 const rr=RA.util.mulberry(seed);deco=[];for(let k=0;k<140;k++)deco.push({x:rr()*MW,y:rr()*MH,k:Math.floor(rr()*4),r:6+rr()*14});
 clouds=Array.from({length:26},()=>({x:rr()*MW,y:rr()*MH,r:30+rr()*50,hi:rr()<.4}));
 foes=[];guns=[];shots=[];crates=[];bombs=[];parts=[];texts=[];smokes=[];zep=null;wind=0;
 if(!K.isClient()&&md===2){for(let k=0;k<10;k++)guns.push({id:++nextId,x:rr()*MW,y:rr()*MH,hp:3,cd:Math.random()*120});spawnFoes(4+seats.length)}}
function spawnFoes(n){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2;foes.push({id:++nextId,x:wrap(MW/2+Math.cos(a)*800,MW),y:wrap(MH/2+Math.sin(a)*800,MH),a:a+Math.PI,sp:2.1,hp:2,cd:60,baron:k===0&&Math.random()<.4})}}
/* own plane: flown by its owner */
function fly(p,inp){if(!p.alive)return;const f=p.fx;let turn=(inp.right?1:0)-(inp.left?1:0);if(inp.ax&&Math.abs(inp.ax)>.2)turn=inp.ax;
 p.a+=turn*.055;const want=inp.up?3.4:inp.down?1.5:2.3;p.sp+=(want*(f.burn>0?1.5:1)*(f.stall>0&&(K.tick>>4)&1?.3:1)-p.sp)*.05;
 p.x=wrap(p.x+Math.cos(p.a)*p.sp,MW);p.y=wrap(p.y+Math.sin(p.a)*p.sp+(f.wind>0?1.1:0),MH);p.bank=turn;
 if(f.smoke>0&&K.tick%3===0)smokes.push({x:p.x,y:p.y,t:180});}
function gunsFire(p,inp){if(!p.alive||p.cd>0)return;if(!(inp.fire||inp.tap))return;p.cd=6;sfx('mg');const off=p.fx.twin>0?[-4,4]:[0];
 for(const o of off){const s={id:++nextId,own:p.i,x:p.x+Math.cos(p.a)*8-Math.sin(p.a)*o,y:p.y+Math.sin(p.a)*8+Math.cos(p.a)*o,vx:Math.cos(p.a)*6+Math.cos(p.a)*p.sp,vy:Math.sin(p.a)*6+Math.sin(p.a)*p.sp,t:50};p.myShots.push(s)}}
function stepMyShots(p){for(const s of p.myShots){s.x=wrap(s.x+s.vx,MW);s.y=wrap(s.y+s.vy,MH);s.t--;
  for(const o of planes){if(o===p||!o.alive||o.inv>0)continue;if(K.mode===1&&teamOf(o.i)===teamOf(p.i))continue;if(Math.hypot(wd(s.x,o.x,MW),wd(s.y,o.y,MH))<9){s.t=0;claim(p,'p',o.i);break}}
  if(s.t>0)for(const f of foes)if(Math.hypot(wd(s.x,f.x,MW),wd(s.y,f.y,MH))<9){s.t=0;claim(p,'f',f.id);break}
  if(s.t>0&&zep&&Math.hypot(wd(s.x,zep.x,MW)/2.4,wd(s.y,zep.y,MH))<12){s.t=0;claim(p,'z',0)}
  if(s.t>0)for(const c of crates)if(Math.hypot(wd(s.x,c.x,MW),wd(s.y,c.y,MH))<8){s.t=0;claim(p,'c',c.id);break}}
 p.myShots=p.myShots.filter(s=>s.t>0)}
function claim(p,k,id){const e=[++p.shotSeq,k,id];p.hitLog.push(e);if(p.hitLog.length>10)p.hitLog.shift();if(!K.isClient())resolve(p,e)}
// host: apply a hit someone called
function resolve(p,[,k,id]){if(k==='p'){const o=planes[id];if(!o||!o.alive||o.inv>0)return;hurt(o,1,p)}
 else if(k==='f'){const f=foes.find(x=>x.id===id);if(!f)return;if(--f.hp<=0){f.dead=true;p.kills++;p.score+=f.baron?1000:200;boom(f.x,f.y,'#c03030');if(f.baron)say(f.x,f.y,'RED BARON DOWN!','#f8d040');maybeCrate(f.x,f.y,.35)}}
 else if(k==='z'){if(zep){zep.hp--;p.score+=20;if(zep.hp<=0){for(let q=0;q<6;q++)boom(zep.x+(Math.random()-.5)*60,zep.y+(Math.random()-.5)*20,'#f8a030');for(const o of planes)if(!o.out)o.score+=3000;zep=null;say(MW/2,MH/2,'ZEPPELIN DOWN!','#f8d040')}}}
 else if(k==='c'){const c=crates.find(x=>x.id===id);if(c){c.dead=true;item(p,c.k)}}}
function hurt(o,n,by){if(o.fx.armor>0){o.fx.armor--;say(o.x,o.y,'CLANG','#ccc');return}o.hp-=n;if(o.hp<=0){o.alive=false;o.dead=180;o.deaths++;boom(o.x,o.y,o.col);K.fx('k',o.i);
  if(by&&by!==o){by.kills++;by.score+=500;say(by.x,by.y-14,'ACE! '+by.kills,'#f8d040')}if(K.S.lives>0){o.lives--;if(o.lives<=0)o.out=true}maybeCrate(o.x,o.y,.5)}}
function maybeCrate(x,y,ch){if(K.S.items==='off'||Math.random()>ch)return;let k=1+Math.floor(Math.random()*5);if(K.S.items==='party'&&Math.random()<.45)k=6+Math.floor(Math.random()*3);crates.push({id:++nextId,x,y,k,t:1200})}
function item(p,k){say(p.x,p.y-14,ITEMS[k].n,ITEMS[k].c);sfx('pick');const f=p.fx;if(k===1)f.twin=1200;else if(k===2)f.burn=600;else if(k===3)f.armor=2;else if(k===4)f.smoke=600;else if(k===5)p.hp=p.maxhp;
 else{const rv=planes.filter(o=>o!==p&&o.alive&&teamOf(o.i)!==teamOf(p.i));if(k===8){for(const o of rv)o.fx.wind=300;}else if(rv.length){const t=rv[Math.floor(Math.random()*rv.length)];if(k===6)t.fx.stall=360;else t.fx.oil=360;say(t.x,t.y-14,ITEMS[k].n+'!',ITEMS[k].c)}}}
function boom(x,y,col){sfx('boom');for(let q=0;q<14;q++)parts.push({x,y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:40,col:q%2?col:'#f8a030'});K.fx('x',Math.round(x),Math.round(y),col)}
function say(x,y,s,col){texts.push({x,y,s,col,t:70});K.fx('t',Math.round(x),Math.round(y),s,col)}
/* ---- host step */
function step(){const S=K.S;
 for(const p of planes){for(const k in p.fx)if(p.fx[k]>0&&k!=='armor')p.fx[k]--;if(p.inv>0)p.inv--;if(p.cd>0)p.cd--;if(p.bombCd>0)p.bombCd--;
  if(!p.alive){if(p.dead>0&&--p.dead===0&&!p.out){const[x,y,a]=spawnPos(p.i);Object.assign(p,{x,y,a,alive:true,hp:p.maxhp,inv:150,fx:{},sp:2})}continue}
  const s=K.seats[p.i];if(s.ctrl==='net'){const r=K.remote(p.i);if(r){p.x=r.x;p.y=r.y;p.a=r.a;p.sp=r.s;p.bank=r.b;p.netShots=r.sh||[];for(const e of r.hl||[])if((e[0]|0)>p.rSeen){p.rSeen=e[0]|0;resolve(p,e)}if(r.bm&&r.bm!==p.bmSeen){p.bmSeen=r.bm;dropBomb(p)}}continue}
  const inp=K.inp(p.i);fly(p,inp);gunsFire(p,inp);stepMyShots(p);if(inp.alt&&p.bombCd<=0){p.bombCd=60;dropBomb(p)}}
 // CPU squadron, flak and the zeppelin (co-op)
 for(const f of foes){const tg=planes.filter(p=>p.alive).sort((a,b)=>Math.hypot(wd(f.x,a.x,MW),wd(f.y,a.y,MH))-Math.hypot(wd(f.x,b.x,MW),wd(f.y,b.y,MH)))[0];
  if(tg){const want=Math.atan2(wd(f.y,tg.y,MH),wd(f.x,tg.x,MW));let d=want-f.a;d=Math.atan2(Math.sin(d),Math.cos(d));f.a+=Math.max(-.045,Math.min(.045,d))*(f.baron?1.3:1);
   if(Math.abs(d)<.2&&--f.cd<=0&&Math.hypot(wd(f.x,tg.x,MW),wd(f.y,tg.y,MH))<220){f.cd=f.baron?10:22;shots.push({x:f.x,y:f.y,vx:Math.cos(f.a)*6.5,vy:Math.sin(f.a)*6.5,t:45,foe:1})}}
  f.x=wrap(f.x+Math.cos(f.a)*f.sp*(f.baron?1.2:1),MW);f.y=wrap(f.y+Math.sin(f.a)*f.sp*(f.baron?1.2:1),MH)}
 foes=foes.filter(f=>!f.dead);
 for(const g of guns){if(g.dead)continue;const tg=planes.find(p=>p.alive&&Math.hypot(wd(g.x,p.x,MW),wd(g.y,p.y,MH))<200);if(tg&&--g.cd<=0){g.cd=70;const a=Math.atan2(wd(g.y,tg.y,MH),wd(g.x,tg.x,MW));shots.push({x:g.x,y:g.y,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3.5,t:60,flak:1})}}
 if(K.mode===2){if(!foes.length&&!zep){K.fx('w');if((++wave)%3===0){zep={x:MW/2,y:200,hp:60+planes.length*10,max:60+planes.length*10,t:0};K.track(3)}else spawnFoes(4+planes.length+wave)}
  if(zep){zep.t++;zep.x=wrap(zep.x+.6,MW);zep.y=MH/2+Math.sin(zep.t*.005)*500;if(zep.t%40===0)for(const p of planes)if(p.alive&&Math.hypot(wd(zep.x,p.x,MW),wd(zep.y,p.y,MH))<260){const a=Math.atan2(wd(zep.y,p.y,MH),wd(zep.x,p.x,MW));shots.push({x:zep.x,y:zep.y,vx:Math.cos(a)*4,vy:Math.sin(a)*4,t:70,flak:1})}}}
 for(const s of shots){s.x=wrap(s.x+s.vx,MW);s.y=wrap(s.y+s.vy,MH);s.t--;for(const p of planes)if(p.alive&&p.inv<=0&&Math.hypot(wd(s.x,p.x,MW),wd(s.y,p.y,MH))<8){s.t=0;hurt(p,1,null);break}}shots=shots.filter(s=>s.t>0);
 for(const b of bombs){b.t--;if(b.t<=0){boom(b.x,b.y,'#f8a030');for(const g of guns)if(!g.dead&&Math.hypot(wd(b.x,g.x,MW),wd(b.y,g.y,MH))<26){g.dead=true;const p=planes[b.own];if(p){p.score+=300;p.kills++}}}}bombs=bombs.filter(b=>b.t>0);
 for(const c of crates){c.t--;for(const p of planes)if(p.alive&&Math.hypot(wd(c.x,p.x,MW),wd(c.y,p.y,MH))<12){c.dead=true;item(p,c.k);break}if(c.t<=0)c.dead=true}crates=crates.filter(c=>!c.dead);
 if(S.items!=='off'&&K.tick%480===240&&crates.length<3+planes.length/4)maybeCrate(Math.random()*MW,Math.random()*MH,1);
 fxStep();
 const live=planes.filter(p=>!p.out),lim=S.len*3600;
 if(K.mode===2){if(!live.length){K.end({coop:0,name:'SHOT DOWN · WAVE '+wave});return}if(wave>S.waves){K.end({coop:1,name:'SKIES CLEARED!'});return}}
 else if(K.mode===1){const tl=[0,1].filter(t=>live.some(p=>p.i%2===t));if(S.lives>0&&planes.length>1&&tl.length<=1){K.end(tl.length?{team:tl[0],name:['Red squadron','Blue squadron'][tl[0]]}:null);return}}
 else if(S.lives>0&&(planes.length>1?live.length<=1:!live.length)){champ=live[0]?live[0].i:-1;K.end(live[0]?{i:live[0].i}:null);return}
 if(K.mode!==2&&S.kills&&planes.some(p=>p.kills>=S.kills)){const b=planes.slice().sort((a,c)=>c.kills-a.kills)[0];champ=b.i;K.end(K.mode===1?{team:teamOf(b.i),name:['Red squadron','Blue squadron'][teamOf(b.i)]}:{i:b.i});return}
 if(lim&&K.tick>=lim){if(K.mode===2)K.end({coop:1,name:'TIME! WAVE '+wave});else if(K.mode===1){const sc=[0,1].map(t=>planes.filter(p=>p.i%2===t).reduce((a,p)=>a+p.kills,0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:['Red squadron','Blue squadron'][sc[0]>sc[1]?0:1]})}else{const b=planes.slice().sort((a,c)=>c.kills-a.kills||c.score-a.score)[0];champ=b?b.i:-1;K.end(b?{i:b.i}:null)}}}
let champ=-1,wave=0;
function dropBomb(p){bombs.push({x:p.x+Math.cos(p.a)*30,y:p.y+Math.sin(p.a)*30,t:45,own:p.i})}
function fxStep(){for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vx*=.96;q.vy*=.96;q.t--}parts=parts.filter(q=>q.t>0);for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);for(const s of smokes)s.t--;smokes=smokes.filter(s=>s.t>0);
 for(const c of clouds){c.x=wrap(c.x+.15,MW)}}
// guest: fly my plane, my bullets, my hits
function local(i){const p=planes[i];if(!p)return;for(const k in p.fx)if(p.fx[k]>0&&k!=='armor')p.fx[k]--;if(p.cd>0)p.cd--;if(p.bombCd>0)p.bombCd--;const inp=K.inp(i);fly(p,inp);gunsFire(p,inp);stepMyShots(p);
 if(inp.alt&&p.bombCd<=0&&p.alive){p.bombCd=60;p.bm=(p.bm|0)+1}}
function upload(i){const p=planes[i];if(!p)return null;return{x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,a:Math.round(p.a*100)/100,s:Math.round(p.sp*10)/10,b:p.bank|0,sh:p.myShots.slice(-8).map(s=>[Math.round(s.x),Math.round(s.y)]),hl:p.hitLog.slice(-8),bm:p.bm|0}}
function snap(){return{w:wave,p:planes.map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.a*100),p.hp,(p.alive?1:0)|(p.inv>0?2:0)|(p.out?4:0)|(p.fx.twin>0?8:0)|(p.fx.smoke>0?16:0)|(p.fx.oil>0?32:0)|(p.fx.stall>0?64:0)|(p.fx.wind>0?128:0)|(p.fx.armor>0?256:0)|(p.fx.burn>0?512:0),p.kills,p.score,p.lives,p.bank|0,
  (p.netShots||p.myShots.map(s=>[Math.round(s.x),Math.round(s.y)])).slice(-6)]),
 f:foes.map(f=>[f.id,Math.round(f.x),Math.round(f.y),Math.round(f.a*100),f.baron?1:0]),g:guns.filter(g=>!g.dead).map(g=>[g.id,Math.round(g.x),Math.round(g.y)]),s:shots.slice(-40).map(s=>[Math.round(s.x),Math.round(s.y)]),
 c:crates.map(c=>[c.id,Math.round(c.x),Math.round(c.y),c.k]),z:zep?[Math.round(zep.x),Math.round(zep.y),zep.hp,zep.max]:0,bo:bombs.map(b=>[Math.round(b.x),Math.round(b.y),b.t])}}
function apply(g){wave=g.w|0;(g.p||[]).forEach((a,i)=>{const p=planes[i];if(!p)return;const f=a[4]|0,was=p.alive;p.alive=!!(f&1);p.inv=f&2?1:0;p.out=!!(f&4);p.hp=a[3]|0;p.kills=a[5]|0;p.score=a[6]|0;p.lives=a[7]|0;
  const fx={twin:f&8,smoke:f&16,oil:f&32,stall:f&64,wind:f&128,armor:f&256,burn:f&512};
  if(i===K.myIdx){for(const k in fx)if(fx[k]&&!(p.fx[k]>0))p.fx[k]=k==='armor'?1:300;else if(!fx[k]&&k!=='armor')p.fx[k]=Math.min(p.fx[k]|0,p.fx[k]>0?p.fx[k]:0);if(!was&&p.alive){p.x=a[0];p.y=a[1];p.a=a[2]/100}return}
  p.fx=fx;p.tx=a[0];p.ty=a[1];p.ta=a[2]/100;p.bank=a[8]|0;p.osh=a[9]||[];if(p.x==null||!was){p.x=a[0];p.y=a[1];p.a=p.ta}});
 const old=new Map(foes.map(f=>[f.id,f]));foes=(g.f||[]).map(r=>{const o=old.get(r[0]);return{id:r[0],x:o?o.x:r[1],y:o?o.y:r[2],tx:r[1],ty:r[2],a:r[3]/100,baron:r[4]}});
 guns=(g.g||[]).map(r=>({id:r[0],x:r[1],y:r[2]}));shots=(g.s||[]).map(r=>({x:r[0],y:r[1]}));crates=(g.c||[]).map(r=>({id:r[0],x:r[1],y:r[2],k:r[3]}));zep=g.z?{x:g.z[0],y:g.z[1],hp:g.z[2],max:g.z[3]}:null;bombs=(g.bo||[]).map(r=>({x:r[0],y:r[1],t:r[2]}))}
function follow(){for(const p of planes){if(p.i===K.myIdx||p.tx==null)continue;const dx=wd(p.x,p.tx,MW),dy=wd(p.y,p.ty,MH);if(Math.abs(dx)>60||Math.abs(dy)>60){p.x=p.tx;p.y=p.ty}else{p.x=wrap(p.x+dx*.4,MW);p.y=wrap(p.y+dy*.4,MH)}let d=p.ta-p.a;d=Math.atan2(Math.sin(d),Math.cos(d));p.a+=d*.4;if(p.fx.smoke&&K.tick%3===0)smokes.push({x:p.x,y:p.y,t:180})}
 for(const f of foes){if(f.tx==null)continue;const dx=wd(f.x,f.tx,MW),dy=wd(f.y,f.ty,MH);f.x=wrap(f.x+dx*.4,MW);f.y=wrap(f.y+dy*.4,MH)}fxStep()}
function onFx(k,a){if(k==='x'){sfx('boom');for(let q=0;q<14;q++)parts.push({x:a[0],y:a[1],vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:40,col:q%2?a[2]:'#f8a030'})}else if(k==='t')texts.push({x:a[0],y:a[1],s:String(a[2]).slice(0,22),col:a[3],t:70})}
function bot(i){const p=planes[i];if(!p||!p.alive)return{};const rv=[...planes.filter(o=>o!==p&&o.alive&&(K.mode===2||teamOf(o.i)!==teamOf(i))&&K.mode!==2),...foes];
 const tg=rv.sort((a,b)=>Math.hypot(wd(p.x,a.x,MW),wd(p.y,a.y,MH))-Math.hypot(wd(p.x,b.x,MW),wd(p.y,b.y,MH)))[0];const c=crates[0];const o={};let tx,ty;
 if(tg){tx=tg.x;ty=tg.y}else if(c){tx=c.x;ty=c.y}else return{up:true};const want=Math.atan2(wd(p.y,ty,MH),wd(p.x,tx,MW));let d=want-p.a;d=Math.atan2(Math.sin(d),Math.cos(d));
 if(d>.06)o.right=true;else if(d<-.06)o.left=true;if(Math.abs(d)<[.12,.2,.3][K.cpu]&&Math.hypot(wd(p.x,tx,MW),wd(p.y,ty,MH))<220)o.fire=true;if(Math.random()<.3)o.up=true;
 if(K.mode===2&&guns.some(g=>!g.dead&&Math.hypot(wd(p.x+Math.cos(p.a)*30,g.x,MW),wd(p.y+Math.sin(p.a)*30,g.y,MH))<20))o.alt=true;return o}
/* ---- drawing */
const ART={};function planeArt(col){if(ART[col])return ART[col];const c=document.createElement('canvas'),Q=3,S=28;c.width=c.height=S*Q;const g=c.getContext('2d');g.scale(Q,Q);g.translate(14,14);
 const wing=g.createLinearGradient(0,-13,0,13);wing.addColorStop(0,RA.util.mix(col,'#ffffff',.4));wing.addColorStop(.5,col);wing.addColorStop(1,RA.util.mix(col,'#000000',.4));g.fillStyle=wing;
 g.beginPath();g.roundRect?g.roundRect(-3,-13,7,26,2.5):g.rect(-3,-13,7,26);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-1,-13,1,26);
 const body=g.createLinearGradient(-10,-3,-10,3);body.addColorStop(0,'#e8e0c8');body.addColorStop(.5,'#b8a888');body.addColorStop(1,'#6a5a40');g.fillStyle=body;g.beginPath();g.ellipse(0,0,12,3.2,0,0,7);g.fill();
 g.fillStyle=col;g.beginPath();g.moveTo(-12,0);g.lineTo(-9,-6);g.lineTo(-7,-6);g.lineTo(-8,0);g.lineTo(-7,6);g.lineTo(-9,6);g.closePath();g.fill();
 g.fillStyle='#2a2a2a';g.beginPath();g.arc(2,0,2,0,7);g.fill();g.fillStyle='#ccc';g.fillRect(11,-.6,2,1.2);c._q=Q;return ART[col]=c}
function propeller(g,x,y,a){g.save();g.translate(x+Math.cos(a)*12.5,y+Math.sin(a)*12.5);g.rotate(a+Math.PI/2);g.fillStyle='rgba(200,200,200,.5)';g.beginPath();g.ellipse(0,0,6,1.2,0,0,7);g.fill();g.restore()}
const cam={x:MW/2,y:MH/2,z:1.6};
function render(g,Wv,Hv){const fs=K.demo?[]:K.focus(),me=fs.length?planes[fs[0]]:null;let tx=cam.x,ty=cam.y;if(me){tx=me.x;ty=me.y}else{const al=planes.filter(p=>p.alive);if(al.length){tx=al[(Math.floor(K.tick/400))%al.length].x;ty=al[(Math.floor(K.tick/400))%al.length].y}}
 const dx=wd(cam.x,tx,MW),dy=wd(cam.y,ty,MH);if(Math.abs(dx)>200||Math.abs(dy)>200){cam.x=tx;cam.y=ty}else{cam.x=wrap(cam.x+dx*.12,MW);cam.y=wrap(cam.y+dy*.12,MH)}
 const z=Math.max(Wv/520,Hv/300)*(me&&me.alive?1:.8);cam.z+=(z-cam.z)*.05;const vw=Wv/cam.z,vh=Hv/cam.z,X=x=>(wd(cam.x,x,MW)+vw/2)*cam.z,Y=y=>(wd(cam.y,y,MH)+vh/2)*cam.z;
 // ground: fields and forests, scrolling with the camera
 const gr=g.createLinearGradient(0,0,Wv,Hv);gr.addColorStop(0,'#5a9a40');gr.addColorStop(1,'#4a8030');g.fillStyle=gr;g.fillRect(0,0,Wv,Hv);
 for(const d of deco){const x=X(d.x),y=Y(d.y),r=d.r*cam.z;if(x<-60||y<-60||x>Wv+60||y>Hv+60)continue;
  if(d.k===0){g.fillStyle='rgba(200,180,80,.45)';g.fillRect(x-r*2,y-r,r*4,r*2)}else if(d.k===1){const t=g.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);t.addColorStop(0,'#3a8a30');t.addColorStop(1,'#1a4a18');g.fillStyle=t;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  else if(d.k===2){g.fillStyle='#8a6a40';g.fillRect(x-r*.6,y-r*.4,r*1.2,r*.8);g.fillStyle='#b03020';g.fillRect(x-r*.7,y-r*.6,r*1.4,r*.3)}else{g.fillStyle='rgba(60,120,200,.6)';g.beginPath();g.ellipse(x,y,r*1.6,r*.8,0,0,7);g.fill()}}
 for(const gn of guns){const x=X(gn.x),y=Y(gn.y);g.fillStyle='#404040';g.beginPath();g.arc(x,y,5*cam.z,0,7);g.fill();g.fillStyle='#888';g.fillRect(x-1*cam.z,y-7*cam.z,2*cam.z,6*cam.z)}
 for(const c of clouds)if(!c.hi){const x=X(c.x),y=Y(c.y);const cg=g.createRadialGradient(x,y,2,x,y,c.r*cam.z);cg.addColorStop(0,'rgba(255,255,255,.45)');cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.beginPath();g.arc(x,y,c.r*cam.z,0,7);g.fill()}
 for(const s of smokes){g.fillStyle=`rgba(230,230,230,${s.t/220})`;g.beginPath();g.arc(X(s.x),Y(s.y),(6+(180-s.t)*.06)*cam.z,0,7);g.fill()}
 for(const b of bombs){g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(X(b.x),Y(b.y),(2+b.t*.05)*cam.z,0,7);g.fill()}
 for(const c of crates){const x=X(c.x),y=Y(c.y),it=ITEMS[c.k];g.strokeStyle='#eee';g.lineWidth=.6;g.beginPath();g.moveTo(x-6*cam.z,y-10*cam.z);g.lineTo(x,y);g.lineTo(x+6*cam.z,y-10*cam.z);g.stroke();g.fillStyle='#f0f0f0';g.beginPath();g.arc(x,y-12*cam.z,7*cam.z,Math.PI,0);g.fill();
  const cg=g.createLinearGradient(x-4*cam.z,y-4*cam.z,x+4*cam.z,y+4*cam.z);cg.addColorStop(0,'#fff');cg.addColorStop(.4,it.c);cg.addColorStop(1,RA.util.mix(it.c,'#000000',.5));g.fillStyle=cg;g.fillRect(x-4*cam.z,y-4*cam.z,8*cam.z,8*cam.z)}
 g.save();g.scale(cam.z,cam.z);
 const drawPlane=(x,y,a,col,bank,ghost)=>{x/=cam.z;y/=cam.z;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+8,y+10,10,4,a,0,7);g.fill();g.save();g.translate(x,y);g.rotate(a);g.scale(1,1-Math.abs(bank||0)*.25);if(ghost)g.globalAlpha=.5;g.drawImage(planeArt(col),-14,-14);g.restore();propeller(g,x,y,a)};
 for(const f of foes)drawPlane(X(f.x),Y(f.y),f.a,f.baron?'#e01818':'#806060',0);
 if(zep){const x=X(zep.x)/cam.z,y=Y(zep.y)/cam.z;const zg=g.createLinearGradient(0,y-12,0,y+12);zg.addColorStop(0,'#d8d0c0');zg.addColorStop(1,'#706858');g.fillStyle=zg;g.beginPath();g.ellipse(x,y,46,13,0,0,7);g.fill();g.fillStyle='#504840';g.fillRect(x-8,y+10,16,5)}
 for(const p of planes){if(!p.alive||p.inv>0&&(K.tick>>2)&1)continue;drawPlane(X(p.x),Y(p.y),p.a,p.col,p.bank,p.fx.smoke>0&&p!==me);if(planes.length>1)RA.gfx.text(g,p.name,X(p.x)/cam.z,Y(p.y)/cam.z-18,p.col);
  if(p.hp<p.maxhp){g.fillStyle='#300';g.fillRect(X(p.x)/cam.z-8,Y(p.y)/cam.z+14,16,2);g.fillStyle='#4f4';g.fillRect(X(p.x)/cam.z-8,Y(p.y)/cam.z+14,16*p.hp/p.maxhp,2)}}
 g.fillStyle='#ffe080';for(const p of planes){const sh=p===me||K.seats[p.i]&&K.seats[p.i].ctrl!=='net'&&!K.isClient()?p.myShots.map(s=>[s.x,s.y]):(p.osh||p.netShots||[]);for(const s of sh)g.fillRect(X(s[0])/cam.z-1,Y(s[1])/cam.z-1,2,2)}
 g.fillStyle='#ff8040';for(const s of shots){g.beginPath();g.arc(X(s.x)/cam.z,Y(s.y)/cam.z,1.6,0,7);g.fill()}
 for(const q of parts){g.globalAlpha=q.t/40;g.fillStyle=q.col;g.fillRect(X(q.x)/cam.z-1.5,Y(q.y)/cam.z-1.5,3,3)}g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,X(t.x)/cam.z,Y(t.y)/cam.z,t.col);
 g.restore();
 for(const c of clouds)if(c.hi){const x=X(c.x),y=Y(c.y);const cg=g.createRadialGradient(x,y,2,x,y,c.r*cam.z*1.3);cg.addColorStop(0,'rgba(255,255,255,.55)');cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.beginPath();g.arc(x,y,c.r*cam.z*1.3,0,7);g.fill()}
 if(me&&me.fx.oil>0){g.fillStyle='rgba(10,10,10,.85)';for(let k=0;k<6;k++){g.beginPath();g.arc(Wv*(.2+.13*k),Hv*(.3+.1*Math.sin(k*2.3)),Hv*.12,0,7);g.fill()}}
 // HUD
 g.font='7px "Russo One",sans-serif';g.textAlign='left';g.fillStyle='#fff';if(me&&!K.demo){g.fillText('HP '+'▮'.repeat(Math.max(0,me.hp))+(me.fx.armor>0?' +ARMOR':'')+'   KILLS '+me.kills+(K.S.lives>0?'   LIVES '+me.lives:''),8,Hv-34)}
 if(K.mode===2&&!K.demo)g.fillText('WAVE '+wave+' / '+K.S.waves+(zep?'  · ZEPPELIN '+zep.hp:''),8,34);
 // radar
 if(me){const R=34,cx=Wv-R-8,cy=Hv-R-34;g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(cx,cy,R,0,7);g.fill();for(const o of[...planes.filter(p=>p.alive&&p!==me),...foes]){const ddx=wd(me.x,o.x,MW)/700*R,ddy=wd(me.y,o.y,MH)/700*R;if(Math.hypot(ddx,ddy)>R)continue;g.fillStyle=o.col||'#e03030';g.fillRect(cx+ddx-1.2,cy+ddy-1.2,2.4,2.4)}g.fillStyle='#fff';g.fillRect(cx-1,cy-1,2,2)}
 const list=planes.slice().sort((a,b)=>b.kills-a.kills||b.score-a.score).slice(0,8);g.font='6px "Russo One",sans-serif';
 list.forEach((p,k)=>{const y=30+k*8;g.textAlign='left';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(Wv-90,y-6,86,7.5);g.fillStyle=p.col;g.fillRect(Wv-89,y-5,4,5);g.fillStyle=p.out?'#777':'#fff';g.fillText((p.name||'').slice(0,12),Wv-83,y);g.textAlign='right';g.fillText(p.kills+' ✈',Wv-7,y)})}
K=RA.kit({id:'skyaces',name:'SKY ACES',kind:'Dogfight',players:'1-20 players',demo:6,localFirst:true,
 desc:'Top-down biplane dogfights for up to 20 over scrolling countryside: free-for-all, red vs blue squadrons, or co-op against the Red Baron, flak guns and a zeppelin. Parachute crates upgrade your plane.',
 blurb:'Bank with A / D, throttle with W / S, Space or click fires, E drops a bomb. Shoot down rivals, grab the crates.',
 howto:'A / D bank, W / S throttle, Space or click fires, E drops a bomb. Gamepad: stick banks, A fires, B bombs.',
 icon:['..........','....rr....','....rr....','kkkkrrkkkk','kwwwrrwwwk','kkkkrrkkkk','....rr....','...rrrr...','..........','..........'],
 music:MUSIC,fireLabel:'FIRE',
 modes:[['DOGFIGHT','Everyone for themselves.'],['SQUADRONS','Red vs blue.'],['CO-OP','Fly together against the Red Baron, flak and the zeppelin.']],
 settings:[['lives','Lives',[[3,'3'],[1,'1'],[5,'5'],[0,'Endless']]],['kills','Kills to win',[[10,'10'],[5,'5'],[20,'20'],[0,'None']]],['waves','Co-op waves',[[6,'6'],[3,'3'],[9,'9']]],
  ['items','Crates',[['on','Sky Aces crates'],['party','Wild party'],['off','Off']]],['len','Time limit',[[5,'5 min'],[3,'3 min'],[10,'10 min'],[0,'None']]]],
 kb:[['A D','bank'],['W S','throttle'],['LMB SPACE','fire'],['E','bomb'],['C','chat'],['ESC','menu']],pad:[['LS','bank / throttle'],['A','fire'],['B','bomb'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Cadet',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Cadet'},{id:'win1',name:'Flying Ace',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Flying Ace'},
  {id:'k5',name:'Ace in a Day',desc:'5 kills in one match',test:(s,m)=>m.kills>=5,unlock:'title:Ace in a Day'},{id:'k10',name:'Red Baron',desc:'10 kills in one match',test:(s,m)=>m.kills>=10,unlock:'title:Red Baron'}],
 alive:i=>!!planes[i]&&!planes[i].out,start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 ranks:()=>planes.slice().sort((a,b)=>(b.i===champ)-(a.i===champ)||b.kills-a.kills||b.score-a.score).map(p=>[p.name,p.col,p.kills+' kills · '+p.deaths+' down']),
 result:(i,w)=>{const p=planes[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.team!=null?teamOf(i)===w.team:w.i===i),kills:p.kills,bestScore:p.score}}});
window.__sa={get planes(){return planes},K,P:()=>planes[1]?Math.round(planes[1].x):0};
})();
