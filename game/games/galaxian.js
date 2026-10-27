/* GALAXOID for Retro Arena: the convoy shooter for up to 20 starfighters side by side, over a deep parallax starfield.
   A / D (or arrows) fly, Space / click fires. The convoy (flagships, red escorts, purple and blue drones) swoops down in curving
   dives; flagships bring escorts, and shooting a flagship in a dive with both escorts down is worth 800. No mouse steering.
   Modes: CO-OP (clear waves together, shared lives pool per player) · SCORE ATTACK (same waves, most points wins; host picks if your
   shots stun rivals). Every few waves the MOTHERSHIP boss (host setting). Galaxoid items (falling from flagships):
    TWIN SHOT · RAPID FIRE · ESCORT WING (two drones fly with you and shoot) · STAR SHIELD · CONVOY FREEZE · NOVA (clears every diver)
    party: DECOY (the convoy dives at a rival) · JAMMER (a rival's gun jams) · INVERTER (a rival's left and right swap).
   Your own ship runs on your machine with no lag; the host runs the aliens (RA.kit localFirst). */
(()=>{
const T=RA.music.track,sfx=RA.audio.sfx;
const ITEMS=[null,{n:'TWIN SHOT',c:'#f8f040'},{n:'RAPID FIRE',c:'#f89030'},{n:'ESCORT WING',c:'#60c0ff'},{n:'STAR SHIELD',c:'#80f0ff'},{n:'CONVOY FREEZE',c:'#c0e0ff'},{n:'NOVA',c:'#ffffff'},
 {n:'DECOY',c:'#ff60c0',party:1},{n:'JAMMER',c:'#a040ff',party:1},{n:'INVERTER',c:'#40ff90',party:1}];
const AK=[{n:'FLAG',c:'#f8e040',w:'#f84020',hp:1,pts:[60,150]},{n:'RED',c:'#f03030',w:'#f8f8f8',hp:1,pts:[50,100]},{n:'PURPLE',c:'#c040f0',w:'#40a0f8',hp:1,pts:[40,80]},{n:'DRONE',c:'#3080f8',w:'#f8d040',hp:1,pts:[30,60]}];
RA.audio.add('zap',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(1400,now);o.frequency.exponentialRampToValueAtTime(300,now+.12);g.gain.setValueAtTime(.04,now);g.gain.exponentialRampToValueAtTime(.001,now+.13);o.connect(g);o.start();o.stop(now+.14)});
RA.audio.add('dive',(AC,now,g)=>{const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(1200,now);o.frequency.exponentialRampToValueAtTime(400,now+.6);g.gain.setValueAtTime(.03,now);g.gain.exponentialRampToValueAtTime(.001,now+.62);o.connect(g);o.start();o.stop(now+.63)});
const MUSIC=[T('Convoy',110,['Cm','Ab','Eb','G'],'k...s...k.k.s...','c5 - eb5 g5 - eb5 c6 - bb5 - g5 - eb5 - - - ab4 - c5 eb5 - c5 ab5 - g5 - eb5 - b4 - - -'),
 T('Swoop',144,['Am','G','F','E'],'k.hsk.hsk.hsk.hs','a5 . e5 . c5 . e5 . g5 . d5 . b4 . d5 . f5 . c5 . a4 . c5 . e5 . b4 . g#4 . b4 .'),
 T('Starfighter',160,['Dm','C','Bb','A'],'k.hhs.hhk.hhs.hk','d5 a5 f5 a5 d6 a5 f5 a5 c5 g5 e5 g5 c6 g5 e5 g5 bb4 f5 d5 f5 bb5 f5 d5 f5 a4 e5 c#5 e5 a5 e5 c#5 e5'),
 T('Mothership',176,['Em','C','D','B'],'k.hsk.hsk.hsk.ss','e5 . g5 . b5 . e6 . c6 . g5 . e5 . c5 . d5 . f#5 . a5 . d6 . b5 - d#6 - f#6 - b6 -')];
let K,ships=[],aliens=[],shots=[],bombs=[],drops=[],parts=[],texts=[],stars=[],wave=0,waveT=0,fW=224,boss=null,freeze=0,nextId=0,diveT=0;
const H=256,SY=236;
function start(seats,md,S,seed){fW=Math.min(560,224+Math.max(0,seats.length-2)*20);
 ships=seats.map((s,i)=>({i,name:s.name,col:s.col,x:fW*(i+1)/(seats.length+1),alive:true,lives:S.lives,score:0,kills:0,inv:120,cd:0,fx:{},dead:0,out:false}));
 aliens=[];shots=[];bombs=[];drops=[];parts=[];texts=[];boss=null;wave=0;waveT=0;freeze=0;
 stars=Array.from({length:140},(_,k)=>({x:Math.random()*fW,y:Math.random()*H,z:.3+Math.random()*1.7,c:['#fff','#f8e080','#80c0ff','#ff9090'][k%4]}));
 if(!K.isClient())nextWave()}
function nextWave(){wave++;waveT=0;const S=K.S;
 if(S.boss==='on'&&wave%4===0){boss={x:fW/2,y:60,hp:40+ships.length*10,max:40+ships.length*10,t:0};K.fx('b');K.track(3);return}
 const cols=Math.min(18,10+Math.floor(ships.length/2)),rows=[1,1,2,2,2,2];const w=cols*16;const ox=(fW-w)/2+8;
 const rowsK=[0,1,2,3,3,3];aliens=[];
 rowsK.forEach((k,r)=>{for(let c=0;c<cols;c++){if(k===0&&(c<cols/2-3||c>cols/2+2||(c-Math.floor(cols/2-3))%2))continue;if(k===1&&(c<2||c>cols-3))continue;
  aliens.push({id:++nextId,k,hx:ox+c*16,hy:36+r*14,x:ox+c*16,y:36+r*14,st:'form',t:0,hp:AK[k].hp+(wave>6&&k===0?1:0)})}});
 K.track(1+(wave%2))}
const fpos=a=>{const sw=Math.sin(K.tick*.02)*10;return[a.hx+sw,a.hy]};
function launchDive(){const form=aliens.filter(a=>a.st==='form');if(!form.length)return;let a=form[Math.floor(Math.random()*form.length)];
 // flagships take their escorts with them
 const tgt=pickTarget();if(!tgt)return;const flag=form.filter(b=>b.k===0);if(flag.length&&Math.random()<.3)a=flag[Math.floor(Math.random()*flag.length)];
 const team=[a];if(a.k===0)team.push(...form.filter(b=>b.k===1&&Math.abs(b.hx-a.hx)<24).slice(0,2));
 for(const d of team){d.st='dive';d.t=0;d.tg=tgt.i;d.sx=d.x;d.sy=d.y;d.side=d.x<fW/2?-1:1;d.esc=team.length-1}sfx('dive');K.fx('s','dive')}
function pickTarget(){const al=ships.filter(s=>s.alive);if(!al.length)return null;const dec=al.filter(s=>s.decoy>0);if(dec.length)return dec[0];return al[Math.floor(Math.random()*al.length)]}
function stepAlien(a){if(a.st==='form'){const[x,y]=fpos(a);a.x=x;a.y=y;return}
 a.t++;const tg=ships[a.tg]||ships[0],sp=1.4+wave*.08;
 if(a.t<40){const an=a.t/40*Math.PI;a.x=a.sx+a.side*Math.sin(an)*26;a.y=a.sy-Math.sin(an)*14+a.t*.3}
 else{const tx=(tg?tg.x:fW/2)+Math.sin(a.t*.06)*30;a.x+=Math.max(-1.6,Math.min(1.6,(tx-a.x)*.03));a.y+=sp;
  if(a.t%(Math.max(20,60-wave*3))===0&&a.y<SY-30)bombs.push({x:a.x,y:a.y+6,vx:(tg?(tg.x-a.x)/120:0),vy:2.1+wave*.05})}
 if(a.y>H+10){a.st='return';a.y=-12;a.x=a.hx}
 if(a.st==='return'){const[hx,hy]=fpos(a);a.x+=(hx-a.x)*.08;a.y+=Math.min(2,hy-a.y);if(Math.abs(a.y-hy)<1.5)a.st='form'}}
/* ---- ships (each owner moves its own) */
function moveShip(s,inp){if(!s.alive)return;let d=(inp.right?1:0)-(inp.left?1:0);if(s.fx.inv>0)d=-d;s.x=Math.max(8,Math.min(fW-8,s.x+d*2.4));s.bank=d}
function fireShip(s){if(!s.alive||s.fx.jam>0)return;const lim=s.fx.rapid>0?4:1;if(shots.filter(b=>b.own===s.i).length>=lim*(s.fx.twin>0?2:1)||s.cd>0)return;s.cd=s.fx.rapid>0?6:10;
 const xs=s.fx.twin>0?[-4,4]:[0];for(const dx of xs)shots.push({x:s.x+dx,y:SY-8,own:s.i});if(s.fx.wing>0)for(const dx of[-14,14])shots.push({x:s.x+dx,y:SY-2,own:s.i});sfx('zap')}
function hitShip(s){if(!s.alive||s.inv>0)return;if(s.fx.shield>0){s.fx.shield=0;s.inv=60;say(s.x,SY-14,'SHIELD!','#80f0ff');return}
 s.alive=false;s.dead=120;boom(s.x,SY,s.col,16);K.fx('k',s.i);if(K.S.lives>0){s.lives--;if(s.lives<=0)s.out=true}}
function boom(x,y,col,n){sfx('boom');for(let k=0;k<n;k++)parts.push({x,y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:30,col:k%2?col:'#fff'});K.fx('x',Math.round(x),Math.round(y),col,n)}
function say(x,y,s,col){texts.push({x,y,s,col,t:60});K.fx('t',Math.round(x),Math.round(y),s,col)}
function useItem(s,k){say(s.x,SY-16,ITEMS[k].n,ITEMS[k].c);sfx('pick');const f=s.fx;
 if(k===1)f.twin=900;else if(k===2)f.rapid=900;else if(k===3)f.wing=900;else if(k===4)f.shield=99999;else if(k===5)freeze=300;else if(k===6){for(const a of aliens)if(a.st==='dive'){kill(a,s);}}
 else{const rv=ships.filter(o=>o!==s&&o.alive);if(!rv.length)return;const t=rv[Math.floor(Math.random()*rv.length)];if(k===7)t.decoy=600;else if(k===8)t.fx.jam=240;else if(k===9)t.fx.inv=420;say(t.x,SY-16,ITEMS[k].n+'!',ITEMS[k].c)}}
function kill(a,s){a.dead=true;const dive=a.st!=='form';let p=AK[a.k].pts[dive?1:0];if(a.k===0&&dive&&a.esc!==undefined){const left=aliens.filter(b=>!b.dead&&b.st==='dive'&&b.tg===a.tg&&b.k===1).length;p=left===0&&a.esc>=2?800:left===1?300:150}
 if(s){s.score+=p;s.kills++;if(p>=150)say(a.x,a.y-8,String(p),'#fff')}boom(a.x,a.y,AK[a.k].c,8);
 if(a.k===0&&K.S.items!=='off'&&(dive||Math.random()<.4)){let k=1+Math.floor(Math.random()*6);if(K.S.items==='party'&&Math.random()<.45)k=7+Math.floor(Math.random()*3);drops.push({x:a.x,y:a.y,k})}}
function step(){const S=K.S;waveT++;if(freeze>0)freeze--;
 for(const s of ships){const st=K.seats[s.i];
  if(!s.alive){if(s.dead>0&&--s.dead===0&&!s.out){s.alive=true;s.inv=150;s.fx={}}continue}
  for(const k in s.fx)if(s.fx[k]>0)s.fx[k]--;if(s.inv>0)s.inv--;if(s.cd>0)s.cd--;if(s.decoy>0)s.decoy--;
  const inp=K.inp(s.i);if(st.ctrl==='net'){const d=K.remote(s.i);if(d&&typeof d.x==='number'){s.x=Math.max(8,Math.min(fW-8,d.x));s.bank=d.b|0}}else moveShip(s,inp);
  if(inp.tap||inp.fire&&s.fx.rapid>0)fireShip(s)}
 if(!freeze){for(const a of aliens)stepAlien(a);
  if(--diveT<=0){diveT=Math.max(30,140-wave*8-ships.length*4);launchDive();if(ships.length>6&&Math.random()<.5)launchDive()}}
 for(const b of shots){b.y-=5;if(b.y<-4)b.dead=true;
  for(const a of aliens)if(!a.dead&&Math.abs(a.x-b.x)<7&&Math.abs(a.y-b.y)<6){b.dead=true;if(--a.hp<=0)kill(a,ships[b.own]);else a.flash=6;break}
  if(boss&&!b.dead&&Math.abs(boss.x-b.x)<34&&Math.abs(boss.y-b.y)<16){b.dead=true;boss.hp--;boss.flash=4;if(ships[b.own])ships[b.own].score+=20;if(boss.hp<=0){for(let k=0;k<6;k++)boom(boss.x+(Math.random()-.5)*60,boss.y+(Math.random()-.5)*20,'#f8a030',12);for(const s of ships)if(!s.out)s.score+=2000;boss=null}}
  if(S.ff==='stun'&&!b.dead)for(const s of ships)if(s.i!==b.own&&s.alive&&Math.abs(s.x-b.x)<7&&Math.abs(SY-b.y)<6){b.dead=true;s.fx.jam=90;say(s.x,SY-14,'STUNNED','#ff8080')}}
 shots=shots.filter(b=>!b.dead);
 for(const b of bombs){b.x+=b.vx;b.y+=b.vy;if(b.y>H)b.dead=true;for(const s of ships)if(s.alive&&Math.abs(s.x-b.x)<6&&Math.abs(SY-b.y)<6){b.dead=true;hitShip(s)}}bombs=bombs.filter(b=>!b.dead);
 for(const a of aliens)if(!a.dead&&a.st==='dive')for(const s of ships)if(s.alive&&Math.abs(s.x-a.x)<9&&Math.abs(SY-a.y)<8){hitShip(s);kill(a,null)}
 aliens=aliens.filter(a=>!a.dead);for(const a of aliens)if(a.flash)a.flash--;
 for(const d of drops){d.y+=1.2;for(const s of ships)if(s.alive&&Math.abs(s.x-d.x)<10&&Math.abs(SY-d.y)<9){d.dead=true;useItem(s,d.k);break}if(d.y>H)d.dead=true}drops=drops.filter(d=>!d.dead);
 if(boss){boss.t++;boss.x=fW/2+Math.sin(boss.t*.015)*(fW/2-50);boss.y=56+Math.sin(boss.t*.04)*14;if(boss.flash)boss.flash--;
  if(boss.t%Math.max(40,70-wave*2)===0)for(const dx of[-24,0,24]){const tg=pickTarget();bombs.push({x:boss.x+dx,y:boss.y+14,vx:tg?(tg.x-boss.x-dx)/140:0,vy:1.6})}
  if(boss.t%300===150)for(let k=0;k<3;k++){const id=++nextId;aliens.push({id,k:3,hx:boss.x,hy:boss.y,x:boss.x,y:boss.y,st:'dive',t:40,sx:boss.x,sy:boss.y,side:k-1,tg:(pickTarget()||{i:0}).i,hp:1})}}
 if(!aliens.length&&!boss&&waveT>60){for(const s of ships)if(!s.out)s.score+=500;nextWave()}
 fxStep();
 const live=ships.filter(s=>!s.out),lim=S.len*3600;
 if(!live.length){K.end(K.mode===0?{coop:0,name:'GAME OVER · WAVE '+wave}:bestOf());return}
 if(K.mode===0&&wave>S.waves){K.end({coop:1,name:'CONVOY DEFEATED!'});return}
 if(lim&&K.tick>=lim){K.end(K.mode===0?{coop:1,name:'TIME! WAVE '+wave}:bestOf())}}
function bestOf(){const b=ships.slice().sort((a,c)=>c.score-a.score)[0];return b?{i:b.i}:null}
function fxStep(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.t--}parts=parts.filter(p=>p.t>0);for(const t of texts){t.t--;t.y-=.4}texts=texts.filter(t=>t.t>0);for(const s of stars){s.y+=s.z*.6;if(s.y>H){s.y=0;s.x=Math.random()*fW}}}
// guest: fly my own ship here, send x
function local(i){const s=ships[i];if(!s)return;for(const k in s.fx)if(s.fx[k]>0)s.fx[k]--;moveShip(s,K.inp(i))}
function upload(i){const s=ships[i];return s?{x:Math.round(s.x*10)/10,b:s.bank|0}:null}
function snap(){return{wv:wave,fw:fW,fr:freeze,s:ships.map(s=>[Math.round(s.x),(s.alive?1:0)|(s.inv>0?2:0)|(s.out?4:0)|(s.fx.shield>0?8:0)|(s.fx.wing>0?16:0)|(s.fx.jam>0?32:0)|(s.fx.inv>0?64:0)|(s.fx.twin>0?128:0)|(s.fx.rapid>0?256:0),s.score,s.lives,s.kills,s.bank|0]),
 a:aliens.map(a=>[a.id,Math.round(a.x),Math.round(a.y),a.k,a.st==='form'?0:1,a.flash?1:0]),b:shots.map(b=>[Math.round(b.x),Math.round(b.y)]),eb:bombs.map(b=>[Math.round(b.x),Math.round(b.y)]),d:drops.map(d=>[Math.round(d.x),Math.round(d.y),d.k]),
 bo:boss?[Math.round(boss.x),Math.round(boss.y),boss.hp,boss.max,boss.flash?1:0]:0}}
function apply(g){wave=g.wv|0;freeze=g.fr|0;if(g.fw&&g.fw!==fW)fW=g.fw;
 (g.s||[]).forEach((a,i)=>{const s=ships[i];if(!s)return;const f=a[1]|0;s.alive=!!(f&1);s.inv=f&2?1:0;s.out=!!(f&4);
  const fx={shield:f&8,wing:f&16,jam:f&32,inv:f&64,twin:f&128,rapid:f&256};if(i===K.myIdx){for(const k in fx)s.fx[k]=fx[k]?Math.max(s.fx[k]|0,30):0}else{s.fx=fx;s.tx=a[0];s.bank=a[5]|0;if(s.x==null)s.x=a[0]}
  s.score=a[2]|0;s.lives=a[3]|0;s.kills=a[4]|0});
 const old=new Map(aliens.map(a=>[a.id,a]));aliens=(g.a||[]).map(r=>{const o=old.get(r[0])||{x:r[1],y:r[2]};return{id:r[0],x:o.x,y:o.y,tx:r[1],ty:r[2],k:r[3],st:r[4]?'dive':'form',flash:r[5]}});
 shots=(g.b||[]).map(r=>({x:r[0],y:r[1]}));bombs=(g.eb||[]).map(r=>({x:r[0],y:r[1]}));drops=(g.d||[]).map(r=>({x:r[0],y:r[1],k:r[2]}));
 boss=g.bo?{x:g.bo[0],y:g.bo[1],hp:g.bo[2],max:g.bo[3],flash:g.bo[4]}:null}
function follow(){for(const a of aliens){if(a.tx==null)continue;if(Math.abs(a.tx-a.x)>40||Math.abs(a.ty-a.y)>40){a.x=a.tx;a.y=a.ty}a.x+=(a.tx-a.x)*.4;a.y+=(a.ty-a.y)*.4}
 for(const s of ships)if(s.i!==K.myIdx&&s.tx!=null)s.x+=(s.tx-s.x)*.4;fxStep()}
function onFx(k,a){if(k==='x'){sfx('boom');for(let q=0;q<(a[3]|0);q++)parts.push({x:a[0],y:a[1],vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:30,col:q%2?a[2]:'#fff'})}
 else if(k==='t')texts.push({x:a[0],y:a[1],s:String(a[2]).slice(0,16),col:a[3],t:60});else if(k==='s')sfx('dive');else if(k==='b')K.track(3)}
function bot(i){const s=ships[i];if(!s||!s.alive)return{};const o={};let tx=s.x;
 const threat=bombs.filter(b=>b.y>SY-70&&Math.abs(b.x-s.x)<14);const tgt=aliens.filter(a=>a.st==='dive').sort((a,b)=>b.y-a.y)[0]||aliens[Math.floor((K.tick/120+i*3)%Math.max(1,aliens.length))]||boss;
 if(tgt)tx=tgt.x+(K.cpu===0?Math.sin(K.tick*.03+i)*18:0);const d=drops.find(d=>Math.abs(d.x-s.x)<60);if(d)tx=d.x;if(threat.length)tx=s.x+(threat[0].x>s.x?-30:30);
 if(tx<s.x-3)o.left=true;else if(tx>s.x+3)o.right=true;if(tgt&&Math.abs(tgt.x-s.x)<10&&K.tick%(K.cpu===2?8:18)===0)o.tap=true;return o}
/* ---- drawing */
const ART={};
function alienArt(k,fl){const key=k+':'+fl;if(ART[key])return ART[key];const c=document.createElement('canvas'),Q=3,S=16;c.width=c.height=S*Q;const g=c.getContext('2d');g.scale(Q,Q);const A=AK[k];
 const body=g.createLinearGradient(8,2,8,14);body.addColorStop(0,RA.util.mix(A.c,'#ffffff',.5));body.addColorStop(1,RA.util.mix(A.c,'#000000',.4));
 const wing=g.createLinearGradient(0,4,0,14);wing.addColorStop(0,RA.util.mix(A.w,'#ffffff',.4));wing.addColorStop(1,RA.util.mix(A.w,'#000000',.4));
 const up=fl?-2:0;g.fillStyle=wing;g.beginPath();g.moveTo(8,7);g.lineTo(1,4+up);g.lineTo(1,11+up);g.lineTo(6,12);g.closePath();g.fill();g.beginPath();g.moveTo(8,7);g.lineTo(15,4+up);g.lineTo(15,11+up);g.lineTo(10,12);g.closePath();g.fill();
 g.fillStyle=body;g.beginPath();g.ellipse(8,8,3.4,6,0,0,7);g.fill();if(k===0){g.fillStyle='#f84020';g.beginPath();g.moveTo(8,1);g.lineTo(10,4);g.lineTo(6,4);g.fill()}
 g.fillStyle='#fff';g.fillRect(6.4,6,1.2,1.6);g.fillRect(8.4,6,1.2,1.6);g.strokeStyle=RA.util.mix(A.c,'#000000',.3);g.lineWidth=.6;g.beginPath();g.moveTo(7,13);g.lineTo(6,15.5);g.moveTo(9,13);g.lineTo(10,15.5);g.stroke();c._q=Q;return ART[key]=c}
function shipArt(col){if(ART[col])return ART[col];const c=document.createElement('canvas'),Q=3,S=18;c.width=c.height=S*Q;const g=c.getContext('2d');g.scale(Q,Q);
 const hull=g.createLinearGradient(0,0,18,0);hull.addColorStop(0,'#8088a0');hull.addColorStop(.5,'#ffffff');hull.addColorStop(1,'#707890');g.fillStyle=hull;g.beginPath();g.moveTo(9,1);g.lineTo(12,10);g.lineTo(17,14);g.lineTo(17,17);g.lineTo(1,17);g.lineTo(1,14);g.lineTo(6,10);g.closePath();g.fill();
 g.fillStyle=col;g.fillRect(1,13,3,4);g.fillRect(14,13,3,4);g.fillStyle='#f03030';g.fillRect(8,3,2,4);const cp=g.createRadialGradient(9,10,.3,9,10,2.4);cp.addColorStop(0,'#c0f0ff');cp.addColorStop(1,'#2060c0');g.fillStyle=cp;g.beginPath();g.arc(9,10,2.2,0,7);g.fill();c._q=Q;return ART[col]=c}
function render(g,Wv,Hv){const z=Math.min(Wv/fW,Hv/(H+14)),ox=(Wv-fW*z)/2,oy=(Hv-H*z)/2;
 g.fillStyle='#000004';g.fillRect(0,0,Wv,Hv);g.save();g.setTransform(1,0,0,1,0,0);g.restore();
 g.save();g.translate(ox,oy);g.scale(z,z);const neb=g.createRadialGradient(fW*.7,H*.3,10,fW*.7,H*.3,fW*.6);neb.addColorStop(0,'rgba(80,30,120,.35)');neb.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=neb;g.fillRect(0,0,fW,H);
 for(const s of stars){g.globalAlpha=.3+s.z*.35;g.fillStyle=s.c;g.fillRect(s.x,s.y,s.z*.7,s.z*1.6)}g.globalAlpha=1;
 g.imageSmoothingEnabled=true;
 for(const a of aliens){const fl=((K.tick>>3)+a.id)&1;g.save();g.translate(a.x,a.y);if(a.st==='dive')g.rotate(Math.sin(K.tick*.1+a.id)*.5);if(a.flash)g.globalAlpha=.5;g.drawImage(alienArt(a.k,fl),-8,-8);g.restore()}
 if(boss){g.save();g.translate(boss.x,boss.y);if(boss.flash)g.globalAlpha=.6;const bg=g.createLinearGradient(0,-16,0,16);bg.addColorStop(0,'#f8d060');bg.addColorStop(1,'#803010');g.fillStyle=bg;g.beginPath();g.ellipse(0,0,36,12,0,0,7);g.fill();
  g.fillStyle='#f84020';g.beginPath();g.ellipse(0,-8,14,8,0,Math.PI,0);g.fill();for(let k=-2;k<=2;k++){g.fillStyle=(K.tick>>3)%5===k+2?'#fff':'#40e0ff';g.beginPath();g.arc(k*12,2,2.4,0,7);g.fill()}g.restore();
  g.fillStyle='#300';g.fillRect(fW/2-60,6,120,4);g.fillStyle='#f84020';g.fillRect(fW/2-60,6,120*boss.hp/boss.max,4)}
 g.fillStyle='#fff';for(const b of shots){g.fillRect(b.x-.6,b.y-4,1.2,6)}g.fillStyle='#ff6040';for(const b of bombs){g.beginPath();g.arc(b.x,b.y,1.6,0,7);g.fill()}
 for(const d of drops){const it=ITEMS[d.k];const gr=g.createRadialGradient(d.x-1.5,d.y-1.5,.3,d.x,d.y,6);gr.addColorStop(0,'#fff');gr.addColorStop(.4,it.c);gr.addColorStop(1,RA.util.mix(it.c,'#000000',.5));g.fillStyle=gr;g.beginPath();g.arc(d.x,d.y,5,0,7);g.fill()}
 for(const s of ships){if(!s.alive||s.inv>0&&(K.tick>>2)&1)continue;g.save();g.translate(s.x,SY);g.rotate((s.bank|0)*.12);g.drawImage(shipArt(s.col),-9,-9);g.restore();
  if(s.fx.wing>0)for(const dx of[-14,14]){g.save();g.translate(s.x+dx,SY+4);g.scale(.55,.55);g.drawImage(shipArt(s.col),-9,-9);g.restore()}
  if(s.fx.shield>0){g.strokeStyle='rgba(128,240,255,.7)';g.lineWidth=1;g.beginPath();g.arc(s.x,SY,12,0,7);g.stroke()}
  if(s.fx.jam>0&&(K.tick>>3)&1)RA.gfx.text(g,'JAM',s.x,SY-22,'#a040ff');if(ships.length>1)RA.gfx.text(g,s.name,s.x,SY+16,s.col)}
 for(const p of parts){g.globalAlpha=p.t/30;g.fillStyle=p.col;g.fillRect(p.x-1,p.y-1,2,2)}g.globalAlpha=1;
 for(const t of texts)RA.gfx.text(g,t.s,t.x,t.y,t.col);
 g.restore();
 g.font='7px "Russo One",sans-serif';g.textAlign='left';g.fillStyle='#fff';if(!K.demo)g.fillText('WAVE '+wave+(freeze>0?'  · FROZEN':''),8,34);
 const list=ships.slice().sort((a,b)=>b.score-a.score).slice(0,8);g.font='6px "Russo One",sans-serif';
 list.forEach((s,k)=>{const y=30+k*8;g.textAlign='left';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(Wv-90,y-6,86,7.5);g.fillStyle=s.col;g.fillRect(Wv-89,y-5,4,5);g.fillStyle=s.out?'#777':'#fff';
  g.fillText((s.name||'').slice(0,10)+(K.S.lives>0?' '+'▲'.repeat(Math.max(0,Math.min(5,s.lives))):''),Wv-83,y);g.textAlign='right';g.fillText(s.score,Wv-7,y)})}
K=RA.kit({id:'galaxian',name:'GALAXOID',kind:'Space shooter',players:'1-20 players',demo:4,localFirst:true,
 desc:'The convoy shooter for up to 20 starfighters side by side: swooping flagship dives with escorts, the Mothership boss, and Galaxoid-only items like Escort Wing, Nova and Convoy Freeze.',
 blurb:'Fly with A / D, fire with Space or click. Shoot flagships in their dive with both escorts down for 800 points.',
 howto:'A / D or arrows fly, Space or click fires. Gamepad: stick or d-pad flies, A fires.',
 icon:['..........','.y......y.','.yy.rr.yy.','..yrrrry..','...rwwr...','..y.rr.y..','..........','....ww....','...wrrw...','..wwwwww..'],
 music:MUSIC,fireLabel:'FIRE',
 modes:[['CO-OP','Clear the waves together.'],['SCORE ATTACK','Same waves, most points wins.']],
 settings:[['lives','Lives',[[3,'3'],[1,'1'],[5,'5'],[0,'Endless']]],['waves','Co-op waves',[[8,'8'],[4,'4'],[16,'16']]],['boss','Mothership boss',[['on','Every 4th wave'],['off','Off']]],
  ['items','Items',[['on','Galaxoid items'],['party','Wild party'],['off','Off']]],['ff','Shots vs rivals',[['off','Pass through'],['stun','Stun']]],['len','Time limit',[[0,'None'],[5,'5 min'],[10,'10 min']]]],
 kb:[['A D','fly'],['LMB SPACE','fire'],['C','chat'],['ESC','menu']],pad:[['LS','fly'],['A','fire'],['BACK','chat'],['START','menu']],
 ach:[{id:'first',name:'Starfighter Cadet',desc:'Finish your first match',test:s=>s.played>=1,unlock:'title:Cadet'},{id:'win1',name:'Convoy Breaker',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Convoy Breaker'},
  {id:'k50',name:'Ace',desc:'50 aliens in one match',test:(s,m)=>m.kills>=50,unlock:'title:Ace'},{id:'pts',name:'High Scorer',desc:'Score 10,000 in one match',test:(s,m)=>m.bestScore>=10000,unlock:'title:High Scorer'}],
 alive:i=>!!ships[i]&&!ships[i].out,start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf:i=>K.mode===0?0:i,
 ranks:()=>ships.slice().sort((a,b)=>b.score-a.score).map(s=>[s.name,s.col,s.score+' · '+s.kills+' aliens']),
 result:(i,w)=>{const s=ships[i];return{won:!!w&&(w.coop!=null?!!w.coop:w.i===i),kills:s.kills,bestScore:s.score}}});
window.__gx={P:()=>Math.round(ships[1].x),get ships(){return ships},get aliens(){return aliens},K};
})();
