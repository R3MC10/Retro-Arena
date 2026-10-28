/* GOAL RUSH. Original: stand-side 8-bit arcade football, physical lofted balls,
   leaping headers, sliding tackles and diving keepers; no offside, quick restarts.
   20-player twist: one footballer per human, up to ten per side. Tournament runs
   two concurrent fixtures so every human plays all three 60-second rounds and
   a final/consolation (four minutes). Penalty Party rotates shooter AND keeper.
   First ten seconds: overhead colour marker, kickoff banner, move/shoot/pass hint.
   Why fun: beat a defender with a pass, time a header, charge a Comet or Orbit shot.
   Art source: tools/art/goal/art.js; embedded by render-sheet.cjs. */
(()=>{
const X=RA.pix,P=X.PAL,ART=/* ART_BEGIN */{"idle":[".....kkkk....","....kNNNSk...","....kssksk...",".....kssk....","....k1123k...","...ks1223sk..","...kk2223kk..","....kwwwGk...","....kwkwwk...","....ks.ksk...","...kKK.kKKk..","...kkk.kkkk.."],"runA":[".....kkkk....","....kNNNSk...","....kssksk...",".....kssk....","....k1123k...","..ksk1223kk..","..kkk2223ssk.","....kwwwGkk..","...kwwkwwk...","..ksk...ksk..",".kKKk....kKKk","..kk......kk."],"runB":[".....kkkk....","....kNNNSk...","....kssksk...",".....kssk....","....k1123k...","....k1223ssk.","...ks2223kk..","...kkwwwGk...",".....kwwk....",".....kssk....","....kKKKKk...",".....kkkk...."],"kick":[".....kkkk....","....kNNNSk...","....kssksk...",".....kssk....","....k1123k...","...ks1223sk..","...kk2223kk..","....kwwwGk...","....kwkwwsk..","....ksk.ksskk","...kKKk..kKKk","...kkk....kk."],"header":[".....kkkk....","....kNNNSk...","....kssksk...","..kk.kssk.kk.",".kssk1123kssk","..kkk1223kkk.","....k2223k...","....kwwwGk...","...kwwkwwk...","..kss...ssk..","..kKKk.kKKk..","...kk...kk..."],"slide":[".............",".............",".............",".............",".............","...kkkk......","..kNNNSk.....","..kssksk.....","...kssk222kk.","..ks11223wwwk","..kkkkkwwwssk",".......kkkkKK"],"dive":["..................","..................","..................","..............kk..","............kkWwk.","...kkkk...kk112sk.","..kNNNSkk11223kk..","..kssksk12223k....","...kssk2223wwsk...","....kkkkwwwwssk...","........kkkkKKk...","...........kkk...."],"celebrate":["..kk......kk.",".kssk....kssk","..k1k.kk.k3k.","..k1kNNNSk3k.","..k1kssksk3k.","...k1kssk3k..","....k1223k...","....k2223k...","....kwwwGk...","....ks.ksk...","...kKK.kKKk..","...kkk.kkkk.."],"ball":[".kkk.","kwWwk","kWkWk","kwwWk",".kkk."]}/* ART_END */,SCR=X.screen();
const COLORS=['#f05050','#60a0ff','#f0c020','#88dc48'],NAMES=['RED','BLUE','GOLD','GREEN'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),q=v=>Math.round(v*10)/10;
let generation=0,K,pl=[],worlds=[],scores=[],points=[],round=0,stage=0,ended=false,party=null,feed=[],log=[],rng;
const teamOf=i=>K.mode===1?i%4:i%2;
const mine=p=>p.i<0?!K.isClient():K.isClient()?p.i===K.myIdx:K.seats[p.i].ctrl!=='net';
const cpu=p=>p.i<0||(K.isClient()&&p.i!==K.myIdx?p.netcpu:K.seats[p.i].ctrl==='cpu');
const controls=(p,k)=>{if(!cpu(p)&&mine(p))k={...k,alt:k.alt||RA.input.touchK.alt,b3:k.b3||RA.input.touchK.b3};if(K.mode!==2&&!cpu(p)&&side(p)===1)return{...k,left:k.right,right:k.left,ax:-(k.ax||0)};return k};
const world=p=>worlds[p.w],side=p=>world(p).teams.indexOf(p.team),dir=p=>((side(p)===0)!==!!world(p).flip)?1:-1;
const human=p=>p.i>=0&&!cpu(p),bySeat=i=>pl.find(p=>p.i===i);
const assist=p=>K.cpu===0&&K.mode!==2&&pl.some(human)?(pl.some(o=>o.team===p.team&&human(o))?1.04:.96):1;
function note(s){feed.unshift([s,150]);feed=feed.slice(0,3)}
function sound(s){if(!K.demo)RA.audio.sfx('goal-'+s)}
function makePlayer(i,team,gk=false){return{n:pl.length,i,team,gk:gk?1:0,w:0,x:300,z:90,h:0,vh:0,vx:0,vz:0,face:team%2?-1:1,pose:0,pt:0,cd:0,charge:0,super:0,goals:0,saves:0,fouls:0,prev:{},ack:0};}
function start(seats,md,S,seed){generation=0;rng=RA.util.mulberry(seed);pl=[];worlds=[];scores=Array(md===1?4:2).fill(0);points=scores.slice();round=0;stage=0;ended=false;feed=[];log=[];party=null;
 seats.forEach((s,i)=>pl.push(makePlayer(i,teamOf(i))));
 if(md===2){party={turn:0,clock:0,phase:0,goals:seats.map(()=>0),saves:seats.map(()=>0)};worlds=[makeWorld([0,1])];setupPenalty();return}
 const teams=md===1?4:2,size=md===1?Math.max(5,Math.ceil(seats.length/4)):Math.max(Math.ceil(seats.length/2),S.size==='auto'?5:+S.size);
 for(let t=0;t<teams;t++){while(pl.filter(p=>p.team===t).length<size)pl.push(makePlayer(-1,t));pl.filter(p=>p.team===t).at(-1).gk=1}
 fixtures();note('SPACE SHOOT - E PASS - Q CALL');
}
function makeWorld(teams){return{gen:++generation,teams,clock:0,flip:0,pause:110,msg:'KICK OFF',score:[0,0],ball:{x:300,z:90,h:0,vx:0,vz:0,vh:0,owner:-1,last:-1,lock:0,curve:0,hot:0},done:0,golden:0,pen:0,penClock:0,penTurn:0,penScores:[0,0]}}
function fixtures(){let pairs;if(K.mode===1){pairs=stage?[[...points.keys()].sort((a,b)=>points[b]-points[a]||scores[b]-scores[a]||a-b).slice(0,2),[...points.keys()].sort((a,b)=>points[b]-points[a]||scores[b]-scores[a]||a-b).slice(2)]:[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]][round]}else pairs=[[0,1]];
 worlds=pairs.map(makeWorld);worlds.forEach((w,j)=>{for(const p of pl)if(w.teams.includes(p.team))p.w=j;w.flip=(K.seed&1);reset(w,(K.seed+round)%2)});
}
function reset(w,kick){w.gen=++generation;const wi=worlds.indexOf(w);for(const t of w.teams){const a=pl.filter(p=>p.w===wi&&p.team===t&&!p.gk),d=(w.teams.indexOf(t)===0)!==!!w.flip?1:-1;a.forEach((p,j)=>{p.x=d===1?125+(j%3)*45:475-(j%3)*45;p.z=25+(Math.floor(j/3)+.5)*130/Math.ceil(a.length/3);p.h=p.vh=p.vx=p.vz=0;p.pt=p.cd=p.charge=0;p.pose=0;p.face=d});const g=pl.find(p=>p.w===wi&&p.team===t&&p.gk);if(g){g.x=d===1?20:580;g.z=90;g.h=0;g.pt=0}}
 const taker=pl.find(p=>p.w===wi&&!p.gk&&p.team===w.teams[kick%2]);Object.assign(w.ball,{x:300,z:90,h:0,vx:0,vz:0,vh:0,owner:taker?taker.n:-1,last:taker?taker.n:-1,lock:0,curve:0,hot:0});if(taker){taker.x=300;taker.z=90}w.pause=100;
}
function pose(p,n,t=12){p.pose=n;p.pt=t;if(!K.isClient()&&p.i>=0&&K.seats[p.i].ctrl==='net')K.fx('pose',p.i,n,t)}
function move(p,k){if(p.pt>0)p.pt--;else p.pose=0;if(p.cd)p.cd--;if(p.h>0||p.vh){p.h=Math.max(0,p.h+p.vh);p.vh-=.16;if(p.h===0)p.vh=0}
 const w=world(p);if(!w||w.done||w.pause>0)return;
 p.dribble=w.ball.owner===p.n?(p.dribble||0)+1:0;
 let dx=(k.right?1:0)-(k.left?1:0),dz=(k.down?1:0)-(k.up?1:0);if(Math.abs(k.ax||0)>.2)dx=k.ax;if(Math.abs(k.ay||0)>.2)dz=k.ay;
 const norm=Math.max(1,Math.hypot(dx,dz)),speed=cpu(p)?(p.gk?[.4,.8,1.2]:[1.05,1.36,1.56])[K.cpu]*assist(p):1.5;
 const slide=p.pose===3&&p.pt>5,stun=p.pose===7;
 p.vx=slide?p.face*2.7:stun?0:dx/norm*speed;p.vz=slide?0:stun?0:dz/norm*speed;
 p.x=clamp(p.x+p.vx,8,592);p.z=clamp(p.z+p.vz,5,175);if(dx)p.face=Math.sign(dx);
 if(K.mode===2&&p.n===party.shooter){p.x=450;p.z=clamp(p.z,70,110)}
 if(p.gk){p.x=clamp(p.x,dir(p)>0?8:560,dir(p)>0?40:592);p.z=clamp(p.z,53,127)}
 if(k.fire&&!p.prev.fire)p.charge=0;
 if(k.fire){p.charge=Math.min(60,p.charge+1);if(w.ball.owner!==p.n&&!p.h&&!p.cd){p.vh=2.3;p.h=.1;pose(p,2,26);p.cd=35}}

 if(k.alt&&!p.prev.alt&&w.ball.owner!==p.n&&!p.cd){pose(p,p.gk?4:3,24);p.cd=60}
 p.super=Math.min(100,p.super+.013);
}
function release(p,target,lob,power,superShot=false){const w=world(p),b=w.ball,dx=target.x-p.x,dz=target.z-p.z+(cpu(p)?(rng()-.5)*[24,10,4][K.cpu]:0),len=Math.hypot(dx,dz)||1;
 b.owner=-1;b.last=p.n;b.x=p.x+p.face*9;b.z=p.z;b.h=Math.max(2,p.h+2);b.vx=dx/len*power;b.vz=dz/len*power;b.vh=lob?2.6:.55;b.lock=14;b.curve=superShot&&lob?.022*dir(p):0;b.hot=superShot?1:0;
 if(superShot){p.super=0;note(lob?'ORBIT SHOT!':'COMET SHOT!');b.vh=lob?2.3:1.1}
 pose(p,p.h>3?2:1,16);p.charge=0;sound('kick');log.push([K.tick,lob?'lob':'kick',p.n,q(power)]);if(log.length>100)log.shift();
}
function actions(p,k){const w=world(p),b=w.ball;if(w.pause||w.done){p.prev={...k};return}
 if(p.gk){p.prev={...k};return}
 if(b.owner===p.n){if(!k.fire&&p.prev.fire){const target={x:dir(p)>0?620:-20,z:K.mode===2?(p.i%2?120:60):90+(k.down?22:k.up?-22:human(p)?(p.z<90?24:-24):(rng()-.5)*28)};release(p,target,k.up,3.4+Math.min(60,p.charge)/30,K.S.super!=='off'&&p.super>=100)}
 else if(k.alt&&!p.prev.alt){const mates=pl.filter(o=>o.w===p.w&&o.team===p.team&&o.n!==p.n&&!o.gk);mates.sort((a,c)=>(c.x-p.x)*dir(p)-(a.x-p.x)*dir(p)+Math.abs(a.z-p.z)-Math.abs(c.z-p.z));if(mates[0])release(p,mates[0],false,3.4)}}
 else if(k.b3&&!p.prev.b3){const owner=pl[b.owner];if(owner&&owner.team===p.team&&cpu(owner)){release(owner,p,false,3.6);note('PASS TO YOU!')}else note('FIND SPACE - Q CALLS A PASS')}
 p.prev={...k};
}
function bot(i){const p=bySeat(i);return p?brain(p):{}}
function brain(p){const w=world(p);if(!w||w.pause||w.done)return{};const b=w.ball,d=dir(p),owned=b.owner===p.n;
 if(K.mode===2){if(p.n===party.keeper){const z=clamp(b.z+b.vz*[2,5,8][K.cpu],58,122);return{up:b.owner<0&&p.z>z+2,down:b.owner<0&&p.z<z-2,alt:Math.abs(b.x-p.x)<[28,60,90][K.cpu],fire:false}}if(p.n!==party.shooter)return{};return{fire:party.clock<75,up:party.clock<75&&p.i%3===0,down:party.clock<75&&p.i%3===1}}
 if(p.gk){const target=clamp(b.z+b.vz*8,57,123),sp=[.55,.95,1.3][K.cpu];p.z+=clamp(target-p.z,-sp,sp);if(Math.abs(b.x-p.x)<75&&b.owner<0&&Math.abs(b.vx)>2&&!p.cd){pose(p,4,28);p.cd=70}return{}}
 let tx,tz;if(owned){tx=d>0?590:10;tz=90;const distance=Math.abs(tx-p.x);const shot=distance<(human(p)?145:[180,220,250][K.cpu]);return{left:!shot&&d<0,right:!shot&&d>0,up:!shot&&p.z>105,down:!shot&&p.z<75,fire:shot&&(p.charge<(human(p)?45:[12,25,40][K.cpu])),alt:p.dribble>120&&!shot&&rng()<[.15,.5,.7][K.cpu]}}
 const mates=pl.filter(o=>o.w===p.w&&o.team===p.team&&!o.gk).sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z));
 if(mates.slice(0,2).includes(p)){tx=b.x+b.vx*5;tz=b.z+b.vz*5}else{const j=mates.indexOf(p);tx=clamp(b.x-d*(45+(j%3)*50),65,535);tz=20+(j*43)%140}
 const near=Math.hypot(p.x-b.x,p.z-b.z);return{left:p.x>tx+3,right:p.x<tx-3,up:p.z>tz+3,down:p.z<tz-3,fire:b.h>8&&b.h<35&&near<28,alt:b.owner>=0&&pl[b.owner].team!==p.team&&near<17&&!p.cd&&rng()<.04};
}
function physics(w){const b=w.ball,wi=worlds.indexOf(w);if(b.lock)b.lock--;
 if(b.owner>=0){const p=pl[b.owner];b.x=p.x+dir(p)*7;b.z=p.z;b.h=p.h+1;b.vx=b.vz=b.vh=0;}
 else{b.x+=b.vx;b.z+=b.vz;b.h+=b.vh;b.vh-=.10;if(b.h<=0){b.h=0;b.vh=Math.abs(b.vh)>.45?-b.vh*.54:0;b.vx*=.985;b.vz*=.985}else{b.vx*=.998;b.vz*=.998}b.vz+=b.curve;b.curve*=.995;
 if(b.z<0||b.z>180){b.z=clamp(b.z,4,176);b.vz=0;b.vx*=.2;b.h=0;b.vh=0;w.pause=45;w.msg='QUICK THROW-IN';const last=pl[b.last],t=last?w.teams.find(t=>t!==last.team):w.teams[0];const p=pl.filter(p=>p.w===wi&&p.team===t&&!p.gk).sort((a,c)=>Math.abs(a.x-b.x)-Math.abs(c.x-b.x))[0];if(p){p.x=clamp(b.x,12,588);p.z=b.z;b.owner=p.n}sound('whistle');return}
 if(b.x<0||b.x>600){const right=b.x>600,attacking=w.teams[(right!==!!w.flip)?0:1];if(b.z>56&&b.z<124&&b.h<24){goal(w,attacking,b.last);return}b.x=right?579:21;b.z=90;b.h=0;b.vh=0;b.vx=b.vz=0;const g=pl.find(p=>p.w===wi&&p.gk&&p.team!==attacking);b.owner=g?g.n:-1;b.lock=30;w.msg='GOAL KICK';w.pause=40;return}}
 for(const p of pl.filter(p=>p.w===wi).sort((a,b)=>K.tick%2?a.n-b.n:b.n-a.n)){
 const near=Math.hypot(p.x-b.x,p.z-b.z);if(p.gk){if(b.owner===p.n){if(!p.cd){const mate=pl.filter(o=>o.w===wi&&o.team===p.team&&!o.gk).sort((a,c)=>Math.abs(a.x-p.x)-Math.abs(c.x-p.x))[0];if(mate){release(p,{x:mate.x+dir(p)*40,z:mate.z},true,4);p.cd=90}}}
 else if(b.owner<0&&Math.abs(p.x-b.x)<(p.pose===4?22:12)&&Math.abs(p.z-b.z)<(p.pose===4?22:12)&&b.h< (p.pose===4?27:18)&&!b.lock){const chance=human(p)?.9:[.40,.70,.86][K.cpu];if(rng()<chance){p.saves++;b.owner=p.n;p.cd=45;pose(p,4,28);sound('kick');log.push([K.tick,'save',p.n]);}else{b.lock=16;pose(p,4,25)}}continue}
 if(b.owner<0&&!b.lock&&near<14&&b.h<5&&!p.pt){b.owner=p.n;b.last=p.n;p.super=Math.min(100,p.super+7)}
 if(b.owner<0&&near<20&&p.h>2&&Math.abs(b.h-(p.h+12))<14&&!b.lock){release(p,{x:dir(p)>0?620:-20,z:90},false,5);b.h=p.h+12;b.vh=.2;pose(p,2,20);p.super=Math.min(100,p.super+15);note('HEADER!')}
 const owner=pl[b.owner];if(owner&&owner.team!==p.team&&near<(p.pose===3?19:10)&&p.pt&&p.pose===3){if(K.S.fouls!=='off'&&p.face!==dir(p)&&rng()<.45){p.fouls++;pose(p,7,60);b.lock=45;w.pause=45;w.msg='FOUL - FREE KICK';sound('whistle')}else{b.owner=p.n;b.last=p.n;b.lock=20;pose(owner,7,35);note('CLEAN TACKLE')}}
 }
}
function goal(w,t,last){w.score[w.teams.indexOf(t)]++;scores[t]++;const p=pl[last];if(p&&p.team===t){p.goals++;p.super=Math.min(100,p.super+35)}note(NAMES[t]+' GOAL!');sound('crowd');for(const p of pl)if(p.w===worlds.indexOf(w)&&p.team===t)pose(p,5,90);
 if(w.golden){w.done=1;return}reset(w,1-w.teams.indexOf(t));w.pause=110;w.msg=NAMES[t]+' GOAL!';for(const p of pl)if(p.w===worlds.indexOf(w)&&p.team===t)pose(p,5,90);
}
function finish(){if(ended)return;ended=true;let winner;if(K.mode===2){const a=K.seats.map((_,i)=>i).sort((a,b)=>party.goals[b]-party.goals[a]||party.saves[b]-party.saves[a]||a-b);winner={i:a[0]}}else if(K.mode===1){const w=worlds[0];const t=w.teams[w.score[0]>=w.score[1]?0:1];winner={team:t,name:NAMES[t]}}else{const w=worlds[0],t=w.teams[w.score[0]>=w.score[1]?0:1];winner={team:t,name:NAMES[t]}}K.end(winner)}
function step(){K.takeover();if(ended)return;for(const f of feed)f[1]--;feed=feed.filter(f=>f[1]>0);
 if(K.mode===2){penaltyStep();return}
 for(const p of (K.tick%2?pl:pl.slice().reverse())){const k=p.i<0?brain(p):controls(p,K.inp(p.i));if(mine(p))move(p,k);else{const u=K.remote(p.i);if(u){readUp(p,u);if(u.tk){k.alt=k.alt||!!u.tk[0];k.b3=k.b3||!!u.tk[1]}}}actions(p,k)}
 for(const w of worlds){if(w.done)continue;w.clock++;const half=(K.S.len==='short'?45:90)*60,limit=K.mode===1?3600:half*2;if(w.pen){teamPenalties(w);continue}
 if(K.mode===0&&w.clock===half){w.flip=1-w.flip;reset(w,1);w.pause=140;w.msg='HALF TIME - CHANGE ENDS';sound('whistle')}
 if(w.pause)w.pause--;else physics(w);
 if(w.clock>=limit){if(w.score[0]!==w.score[1])w.done=1;else if(K.mode===1&&stage===0)w.done=1;else if(w.clock<limit+(K.mode===1?600:1200)){if(!w.golden){w.golden=1;w.msg='GOLDEN GOAL';note('GOLDEN GOAL - NEXT GOAL WINS')}}else{teamPenalties(w)}}
 }
 if(worlds.every(w=>w.done)){if(K.mode!==1||stage){finish()}else{for(const w of worlds){const a=w.teams[0],b=w.teams[1];if(w.score[0]===w.score[1]){points[a]++;points[b]++}else points[w.score[0]>w.score[1]?a:b]+=3}round++;if(round===3)stage=1;fixtures();note(stage?'FINAL + CONSOLATION':'ROUND '+(round+1)+' OF 3')}}
}
// Tied matches finish with short alternating, physical kicks; five each, then
// paired sudden death (bounded at ten each; seeded draw as last resort).
// Tournament finals use two each to keep the whole cup below 4:20.
function teamPenalties(w){if(!w.pen){w.pen=1;w.penClock=0;w.penTurn=0;w.penScores=[0,0];setupTeamPenalty(w)}w.penClock++;
 const b=w.ball;if(w.penClock===60&&b.owner>=0){const p=pl[b.owner];release(p,{x:620,z:66+rng()*48},false,5)}
 if(b.owner<0&&!w.penResolved){b.x+=b.vx;b.z+=b.vz;b.h=Math.max(0,b.h+b.vh);b.vh-=.1;const keeper=pl.find(p=>p.w===worlds.indexOf(w)&&p.gk&&p.team===w.teams[1-w.penTurn%2]);if(keeper&&Math.abs(keeper.x-b.x)<18&&Math.abs(keeper.z-b.z)<(keeper.pose===4?20:9)&&b.h<25){w.penResolved=1;keeper.saves++;pose(keeper,4,30);note('PENALTY SAVED')}else if(b.x>600){w.penResolved=1;if(b.z>56&&b.z<124&&b.h<24){w.penScores[w.penTurn%2]++;note('PENALTY GOAL');sound('crowd')}}}
 if(w.penClock>=150){const turn=w.penTurn;w.penTurn++;if(w.penTurn>=(K.mode===1?4:10)&&w.penTurn%2===0&&w.penScores[0]!==w.penScores[1]||w.penTurn===(K.mode===1?4:20)){const win=w.penScores[0]===w.penScores[1]?(rng()<.5?0:1):w.penScores[0]>w.penScores[1]?0:1;w.score[win]++;w.done=1;note('PENALTIES '+w.penScores.join('-'));}else setupTeamPenalty(w)}
}
function setupTeamPenalty(w){w.penClock=0;w.penResolved=0;w.gen=++generation;w.flip=w.penTurn%2;w.pause=0;w.msg='PENALTIES '+w.penScores.join('-');const p=pl.find(p=>p.w===worlds.indexOf(w)&&!p.gk&&p.team===w.teams[w.penTurn%2]);for(const o of pl.filter(p=>p.w===worlds.indexOf(w))){o.x=o.gk&&o.team!==p.team?580:80;o.z=o.gk?90:160;o.cd=0}if(p){p.x=450;p.z=90;Object.assign(w.ball,{x:458,z:90,h:0,vx:0,vz:0,vh:0,owner:p.n,last:p.n,lock:0})}}
function setupPenalty(){const w=worlds[0],n=K.seats.length;if(party.turn>=n){finish();return}party.shooter=party.turn;party.keeper=(party.turn+1)%n;party.clock=0;party.phase=0;party.saveMiss=0;w.gen=++generation;w.pause=60;w.msg='SHOOTER '+(party.shooter+1)+' / KEEPER '+(party.keeper+1);w.ball.owner=party.shooter;
 for(const p of pl){p.w=0;p.gk=p.n===party.keeper?1:0;p.team=p.gk?1:0;p.x=p.n===party.shooter?450:p.gk?580:50+(p.n%10)*23;p.z=p.n===party.shooter||p.gk?90:145+Math.floor(p.n/10)*20;p.charge=p.pt=p.cd=p.h=0;p.prev={};p.face=1}Object.assign(w.ball,{x:458,z:90,h:0,vx:0,vz:0,vh:0,last:party.shooter,lock:0});}
function penaltyStep(){const w=worlds[0];if(w.pause){w.pause--;return}party.clock++;
 for(const n of[party.shooter,party.keeper]){const p=pl[n],k=controls(p,K.inp(p.i));if(mine(p))move(p,k);else{const u=K.remote(p.i);if(u)readUp(p,u)}if(n===party.shooter&&party.clock<160)actions(p,k);else p.prev={...k}}
 const b=w.ball,keeper=pl[party.keeper];if(party.clock===160&&b.owner===party.shooter)release(pl[party.shooter],{x:620,z:90},false,4.5);
 if(!party.phase){if(b.owner<0){if(b.lock)b.lock--;b.x+=b.vx;b.z+=b.vz;b.h=Math.max(0,b.h+b.vh);b.vh-=.1;if(b.h===0)b.vh=0;
 if(!party.saveMiss&&Math.abs(keeper.x-b.x)<(keeper.pose===4?24:10)&&Math.abs(keeper.z-b.z)<(keeper.pose===4?22:9)&&b.h<26){if(cpu(keeper)&&rng()>[.35,.7,.9][K.cpu])party.saveMiss=1;else{party.saves[keeper.i]++;party.phase=1;note('SAVED!');pose(keeper,4,35);sound('crowd')}}
 else if(b.x>600){if(b.z>56&&b.z<124&&b.h<24){party.goals[party.shooter]++;note('GOAL!');pose(pl[party.shooter],5,40);sound('crowd')}else note('WIDE!');party.phase=1}}
 else if(b.owner===party.shooter){b.x=pl[party.shooter].x+8;b.z=pl[party.shooter].z}}
 if(party.clock>=330){party.turn++;setupPenalty()}}
function local(i){const p=bySeat(i);if(!p||ended)return;const k=controls(p,K.inp(i));move(p,k);p.prev={...k}}
function upload(i){const p=bySeat(i);return p?{gen:world(p).gen,tk:[RA.input.touchK.alt?1:0,RA.input.touchK.b3?1:0],a:[q(p.x),q(p.z),q(p.h),q(p.vh),p.pose,p.pt,p.cd,p.charge,q(p.super)]}:null}
function readUp(p,u){if(u.gen!==world(p).gen)return;const a=u.a;if(!Array.isArray(a)||a.length!==9||a.some(v=>!Number.isFinite(v)))return;p.x=clamp(a[0],8,592);p.z=clamp(a[1],5,175);p.h=clamp(a[2],0,40);p.vh=clamp(a[3],-5,3);p.pose=clamp(a[4]|0,0,7);p.pt=clamp(a[5]|0,0,90);p.cd=clamp(a[6]|0,0,90);p.charge=clamp(a[7]|0,0,60);p.super=clamp(a[8],0,100)}
function snap(){return{pp:pl.map(p=>[q(p.x),q(p.z),q(p.h),p.pose,p.pt,p.cd,p.charge,Math.round(p.super),p.goals,p.saves,p.w,p.team,p.gk,p.face,cpu(p)?1:0]),ww:worlds.map(w=>({a:[...w.teams,w.clock,w.flip,w.pause,...w.score,w.done,w.golden,w.pen,w.penClock,w.penTurn,...w.penScores,w.gen],b:Object.values(packBall(w.ball)),msg:w.msg})),ss:scores,pts:points,rr:round,st:stage,pa:party,ff:feed}}
function packBall(b){return{x:q(b.x),z:q(b.z),h:q(b.h),vx:q(b.vx),vz:q(b.vz),vh:q(b.vh),owner:b.owner,last:b.last,lock:b.lock,curve:q(b.curve),hot:b.hot}}
function apply(g){scores=g.ss||scores;points=g.pts||points;round=g.rr||0;stage=g.st||0;party=g.pa;feed=g.ff||[];while(worlds.length<(g.ww||[]).length)worlds.push(makeWorld([0,1]));worlds.length=g.ww.length;
 const resets=[];g.ww.forEach((o,i)=>{const a=o.a,w=worlds[i];resets[i]=w.gen!==a[14];Object.assign(w,{gen:a[14]});Object.assign(w,{teams:a.slice(0,2),clock:a[2],flip:a[3],pause:a[4],score:a.slice(5,7),done:a[7],golden:a[8],pen:a[9],penClock:a[10],penTurn:a[11],penScores:a.slice(12,14),msg:o.msg});Object.keys(packBall(w.ball)).forEach((k,j)=>w.ball[k]=o.b[j])});
 g.pp.forEach((a,j)=>{const p=pl[j];if(!p)return;const own=p.i===K.myIdx;const fields=['x','z','h','pose','pt','cd','charge','super','goals','saves','w','team','gk','face','netcpu'];fields.forEach((k,i)=>{if(!own||resets[a[10]]||i>=7)p[k]=a[i]});});}
const sprites=new Map();let ballSprite;function sprite(p,key){const col=p.gk?'#fff07c':K.mode===2&&p.i>=0?K.seats[p.i].col:COLORS[p.team],id=key+col;let s=sprites.get(id);if(!s){s=X.recolor(ART[key]||ART.idle,col);sprites.set(id,s)}return s}
function view(g,wi,vx,vy,vw,vh,team){const w=worlds[wi];if(!w)return;g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();const compact=vw<250,small=vh<130;const flip=team!=null&&w.teams.indexOf(team)===1,top=vy+(vh<130?32:57),bottom=vy+vh-(vh<130?16:32),mid=vx+vw/2;
 const proj=(x,z,h=0)=>{const depth=z/180,span=vw*(.77+.18*depth);return{x:Math.round(mid+((flip?600-x:x)/600-.5)*span),y:Math.round(top+depth*(bottom-top)-h*.67)}};
 const rect=(x,z,ww,zz,col)=>{const a=proj(x,z),b=proj(x+ww,z),c=proj(x+ww,z+zz),d=proj(x,z+zz);g.fillStyle=col;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y);g.closePath();g.fill()};
 g.fillStyle='#142038';g.fillRect(vx,vy,vw,vh);if(!small)for(let r=0;r<4;r++){g.fillStyle=r%2?'#34304c':'#24243c';g.fillRect(vx,vy+25+r*6,vw,6);for(let x=0;x<vw;x+=5){g.fillStyle=[P.R,P.C,P.Y,P.G][((x/5|0)+r+(K.tick>>5))%4];g.fillRect(vx+x,vy+26+r*6,2,2)}}if(!small){g.fillStyle=P.k;g.fillRect(vx,vy+49,vw,8);X.text(g,compact?'GOAL RUSH':'GOAL RUSH   *   RETRO ARENA',mid,vy+49,{align:'center',col:P.Y})}
 for(let j=0;j<10;j++)rect(j*60,0,60,180,j%2?'#287848':'#308852');
 const line=(a,b)=>{g.strokeStyle='#b8d8a0';g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
 for(const z of[0,180])line(proj(0,z),proj(600,z));for(const x of[0,300,600])line(proj(x,0),proj(x,180));
 for(const x of[0,510]){line(proj(x,35),proj(x+90,35));line(proj(x,145),proj(x+90,145));line(proj(x===0?90:510,35),proj(x===0?90:510,145))}
 let last=proj(330,90);for(let j=1;j<=24;j++){const a=j*Math.PI/12,next=proj(300+Math.cos(a)*30,90+Math.sin(a)*30);line(last,next);last=next}
 // Goal nets are complete behind players, front posts drawn again afterwards.
 const net=x=>{const a=proj(x,56),b=proj(x,124),off=x===0?-9:9;g.fillStyle='#142c38';g.beginPath();g.moveTo(a.x,a.y-16);g.lineTo(b.x,b.y-16);g.lineTo(b.x+off,b.y);g.lineTo(a.x+off,a.y);g.fill();for(let j=0;j<5;j++){const yy=a.y+(b.y-a.y)*j/4;line({x:a.x,y:yy-16},{x:a.x+off,y:yy})}line({x:a.x,y:a.y-16},{x:b.x,y:b.y-16});};net(0);net(600);
 const objects=pl.filter(p=>p.w===wi).map(p=>({z:p.z,p}));objects.push({z:w.ball.z,ball:1});objects.sort((a,b)=>a.z-b.z);
 for(const o of objects){if(o.ball){const b=w.ball,s=proj(b.x,b.z),v=proj(b.x,b.z,b.h);g.fillStyle=P.k;g.fillRect(s.x-2,s.y,5,2);if(b.hot){g.fillStyle=P.O;g.fillRect(v.x-7*Math.sign(b.vx),v.y,6,2)}g.drawImage(ballSprite||(ballSprite=X.sprite(ART.ball)),v.x-2,v.y-4);continue}const p=o.p,s=proj(p.x,p.z,p.h),key=p.pt?({1:'kick',2:'header',3:'slide',4:'dive',5:'celebrate',7:'slide'}[p.pose]||'idle'):Math.abs(p.vx)+Math.abs(p.vz)>.1?((K.tick/7|0)%2?'runA':'runB'):'idle';const im=sprite(p,key),ground=proj(p.x,p.z);g.fillStyle='#205438';g.fillRect(ground.x-4,ground.y,9,2);g.save();g.translate(s.x,s.y);g.scale((p.face<0)!==flip?-1:1,1);g.drawImage(im,-(im.width>>1),-im.height);g.restore();if(human(p)){g.fillStyle=K.seats[p.i].col;g.fillRect(s.x-2,s.y-18,5,2);X.text(g,String(p.i+1),s.x,s.y-27,{align:'center',col:K.seats[p.i].col,outline:P.k})}}
 for(const x of[0,600]){const a=proj(x,56),b=proj(x,124);g.fillStyle=P.W;g.fillRect(a.x-1,a.y-17,2,18);g.fillRect(b.x-1,b.y-17,2,18);line({x:a.x,y:a.y-17},{x:b.x,y:b.y-17})}
 g.fillStyle=P.k;g.fillRect(vx,vy+14,vw,11);const left=Math.max(0,(K.mode===1?3600:(K.S.len==='short'?5400:10800))-w.clock),clock=K.mode===2?'SHOT '+(party.turn+1)+'/'+K.seats.length:w.pen?'PENS '+w.penScores.join('-'):w.golden?'GOLDEN GOAL':Math.floor(left/3600)+':'+String(Math.ceil(left/60)%60).padStart(2,'0');
 X.text(g,K.mode===2?'PENALTY PARTY':NAMES[w.teams[0]]+' '+w.score[0]+' : '+w.score[1]+' '+NAMES[w.teams[1]],mid,vy+16,{align:'center',col:P.W});X.text(g,clock,vx+4,vy+(small?24:27),{col:P.Y});
 if(K.mode===1)X.text(g,stage?'FINAL':(compact?'R':'ROUND ')+(round+1)+'/3',vx+vw-4,vy+(small?24:27),{align:'right',col:P.C});
 if(w.pause||w.golden||w.pen)X.text(g,w.msg,mid,vy+vh*.45,{align:'center',col:P.Y,outline:P.k});
 if(K.mode===2){const me=K.myIdx>=0?K.myIdx:K.seats.findIndex(s=>s.ctrl!=='cpu');if(me>=0)X.text(g,'YOU '+party.goals[me]+' GOAL '+party.saves[me]+' SAVE',vx+vw-4,vy+27,{align:'right',col:P.W});X.text(g,party.phase&&feed[0]?feed[0][0]:w.msg,mid,vy+38,{align:'center',col:P.C});X.text(g,'SPACE SHOOT  E DIVE  W/S AIM',mid,vy+vh-23,{align:'center',col:P.Y})}
 else if(K.tick<600&&!small)X.text(g,compact?'SPACE SHOT E PASS':'SPACE SHOOT  E PASS  Q CALL',mid,vy+vh-(compact?30:23),{align:'center',col:P.Y});
 else if(feed[0]&&!small)X.text(g,compact?feed[0][0].slice(0,23):feed[0][0],mid,vy+vh-23,{align:'center',col:P.Y});
 const focus=pl.find(p=>p.w===wi&&human(p)&&(K.isClient()?p.i===K.myIdx:true));if(focus){g.fillStyle=P.k;g.fillRect(vx+4,vy+vh-13,97,5);g.fillStyle=P.O;g.fillRect(vx+5,vy+vh-12,Math.round(focus.charge/60*43),3);g.fillStyle=P.C;g.fillRect(vx+53,vy+vh-12,Math.round(focus.super/100*47),3);X.text(g,focus.super>=100?'SUPER READY':compact?'PWR / SUP':'POWER / SUPER',vx+4,vy+vh-8,{col:P.W})}
 const rx=vx+vw-51,ry=vy+vh-(small?17:19);g.fillStyle=P.k;g.fillRect(rx-1,ry-1,48,18);g.fillStyle='#246038';g.fillRect(rx,ry,46,16);for(const p of pl.filter(p=>p.w===wi)){g.fillStyle=human(p)?K.seats[p.i].col:COLORS[p.team];g.fillRect(rx+Math.round(p.x/600*44),ry+Math.round(p.z/180*14),2,2)}g.fillStyle=P.W;g.fillRect(rx+Math.round(w.ball.x/600*44),ry+Math.round(w.ball.z/180*14),2,2);
 g.restore();}
function render(ctx,W,H){const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,W,H);if(worlds.length){let teams=[...new Set(K.focus().map(i=>teamOf(i)))];if(K.demo||!teams.length||K.mode===2)teams=[0];teams=teams.slice(0,4);const n=teams.length,hh=H-9;teams.forEach((t,j)=>{const wi=K.mode===2?0:Math.max(0,worlds.findIndex(w=>w.teams.includes(t))),cols=n>1?2:1,rows=n>2?2:1,vw=Math.floor(W/cols),vh=Math.floor(hh/rows);view(g,wi,j%cols*vw,Math.floor(j/cols)*vh,vw,vh,t)})}SCR.present(ctx,W,H)}
for(const [name,notes]of[['kick',[130,70]],['whistle',[1500,1800,1500]],['crowd',[260,390,520,780]]])RA.audio.add('goal-'+name,(ac,t,g)=>{g.gain.value=.12;notes.forEach((f,j)=>{const o=ac.createOscillator(),v=ac.createGain();o.type=name==='crowd'?'sawtooth':'square';o.frequency.setValueAtTime(f,t+j*.06);v.gain.setValueAtTime(.35,t+j*.06);v.gain.exponentialRampToValueAtTime(.001,t+j*.06+.14);o.connect(v);v.connect(g);o.start(t+j*.06);o.stop(t+j*.06+.15)})});
const T=RA.music.track;
K=RA.kit({id:'goal-3',name:'GOAL RUSH',baseH:180,localFirst:true,kind:'Side-view football',demo:8,
 desc:'Stand-side football: jumping headers, slides, diving keepers and charged Orbit / Comet shots. Twenty players, fixed footballers, concurrent tournament fixtures and a rotating shootout.',
 blurb:'Score at the opposite end. WASD runs across and into the pitch. Hold / release Space to shoot; W + release lobs. E passes or slides. Q calls a CPU pass. Space jumps for headers off the ball.',
 howto:'WASD move / depth. Space hold/release shoots; W + shot lobs. Off ball Space jumps for headers. E passes / slides; keeper E dives. Q calls a pass. Super at full meter fires automatically. No offside. Tournament: 3 concurrent 1-minute rounds + final/consolation.',
 fireLabel:'SHOOT',kb:[['WASD','move / depth'],['SPACE','shoot / jump'],['E','pass / slide / dive'],['Q','call pass']],pad:[['LS','move'],['A','shoot / jump'],['B','pass / slide / dive'],['X','call pass']],
 icon:['..kkkkkk..','.kwwkkwwk.','kwWwkkwWwk','kwwwwwwwwk','kkkwwwwkkk','kwWwkkwWwk','kwwkkkkwwk','kwWwkkwWwk','.kwwwwwwk.','..kkkkkk..'],
 modes:[['MATCH','Two halves, change ends, golden goal then penalties.'],['TOURNAMENT','Four teams. Two simultaneous pitches, three 60s rounds, final + consolation. 4 min, up to 4:20 with final penalties.'],['PENALTY PARTY','One shot and one turn keeping each. Goals, then saves break ties. About 2 min at 20.']],
 settings:[['size','Team size',[['auto','Auto'],[5,'5'],[7,'7'],[10,'10']]],['len','Match length',[['normal','2 x 90s'],['short','2 x 45s']]],['super','Super shots',[['on','On'],['off','Off']]],['fouls','Fouls',[['on','On'],['off','Off']]]],
 music:[T('Terrace Anthem',144,['C','Am','F','G'],'k.hsk.hsk.hsk.hs','c5 e5 g5 c6 b5 g5 e5 g5 a5 c6 a5 e5 f5 a5 g5 e5'),T('Floodlight Fever',156,['Dm','Bb','Gm','A'],'ksh.k.hsksh.k.hs','d5 f5 a5 d6 c6 a5 f5 e5 bb4 d5 f5 a5 g5 e5 c#5 a4'),T('Ninety Minute Heart',168,['Em','C','D','B'],'k.hsksh.k.hsksh.','e5 g5 b5 e6 d6 b5 g5 b5 c6 g5 e5 g5 f#5 a5 d#5 b4')],
 start,step,local,upload,snap,apply,follow(){},render,bot,teamOf,onFx(kind,a){if(kind==='pose'){const p=bySeat(a[0]);if(p&&p.i===K.myIdx){p.pose=a[1];p.pt=a[2]}}},
 ranks:()=>K.seats.map((s,i)=>({s,i,t:teamOf(i),p:bySeat(i)})).sort((a,b)=>K.mode===2?party.goals[b.i]-party.goals[a.i]||party.saves[b.i]-party.saves[a.i]:((K.winner?.team===b.t)-(K.winner?.team===a.t))||b.p.goals-a.p.goals).map(({s,i,t,p})=>[s.name,s.col,K.mode===2?party.goals[i]+' goals / '+party.saves[i]+' saves':NAMES[t]+' / '+p.goals+' goals']),
 result:(i,w)=>({won:K.mode===2?w?.i===i:w?.team===teamOf(i),kills:K.mode===2?party.goals[i]:bySeat(i).goals,bestScore:K.mode===2?party.goals[i]:scores[teamOf(i)]}),
 ach:[{id:'debut',name:'First Whistle',desc:'Finish a match',test:s=>s.played>=1,unlock:'title:Footballer'},{id:'win',name:'Cup Winner',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Cup Winner'},{id:'hat',name:'Three Cheers',desc:'Score three goals',test:(s,m)=>m.kills>=3,unlock:'title:Striker'}]});
for(const [key,label]of[['alt','PASS / SLIDE'],['b3','CALL']]){const b=document.createElement('button');b.className='a';b.textContent=label;const set=v=>{RA.input.touchK[key]=v;b.classList.toggle('down',v)};b.addEventListener('pointerdown',e=>{e.preventDefault();set(true);b.setPointerCapture(e.pointerId)});for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>set(false));K.root.querySelector('.ab').appendChild(b)}
window.__goal={K,bot,get pl(){return pl},get worlds(){return worlds},get party(){return party},get log(){return log},get scores(){return scores},get art(){return ART},release,pose,physics};
})();
