/* BATTLE TOWN for Retro Arena: top-down tank battle for 2-20 crews, built for online rooms, drawn in PS1-style 2.5D.
   Modern controls: the hull drives in four directions (WASD), the turret follows the mouse and a click fires anywhere.
   Two modes:
    CO-OP   everyone guards one eagle against waves of CPU tanks. Friendly fire stuns a teammate (trolling allowed).
    VERSUS  every crew has its own eagle. Lose your eagle and your next death is your last. Last crew rolling wins.
   Power-ups: STAR (faster shots, double shot, then steel-breaking shells), HELMET (shield), SHOVEL (steel walls round your eagle),
   GRENADE (blows up enemies near you, every CPU tank in co-op), CLOCK (freezes the others), TANK (extra life), SWAP (trade places
   with a rival... or a teammate).
   Online: the host runs the battle; the others send their buttons and turret angle and draw what the host sends (RA.rooms).
   Everything shared (screen, input, sound, music, rooms, menu, PS1 effects) comes from engine/ra.js. */
(()=>{
const {$,esc,touchDev,mulberry,hash}=RA.util,T=RA.music.track,music=RA.music,sfx=RA.audio.sfx,audio=RA.audio.ensure;
const {touchK,mouse,touchAim}=RA.input;
const MAXP=20,TS=16,WH=5,TK=7;                 // tile size, wall height (2.5D), tank half size, in world pixels
const MODES=['CO-OP','VERSUS','TEAM WAR','GROUND WAR'];
const TEAMC=['#f04848','#4890f8'],TEAMN=['RED TEAM','BLUE TEAM'];
const ITEMS=[null,
 {n:'STAR',col:'#f8b800',art:['....k.....','...kyk....','kkkkyykkkk','kyyyyyyyyk','.kyyyyyyk.','..kyyyyk..','.kyykkyyk.','.kyk..kyk.','kkk....kkk','..........']},
 {n:'HELMET',col:'#3cbcfc',art:['..........','...kkkk...','..kccwck..','.kccccwck.','.kcccccck.','kkkkkkkkkk','kccccccsck','kkkkkkkkkk','..........','..........']},
 {n:'SHOVEL',col:'#bcbcbc',art:['......kkk.','.....kwsk.','....kssk..','...kssk...','..knnk....','.knnk.....','knnk......','kkk.......','..........','..........']},
 {n:'GRENADE',col:'#58d854',art:['....kk....','...kssk...','..kkkkkk..','.kggggggk.','kggwgggggk','kgwggggggk','kggggggggk','kggggggggk','.kggggggk.','..kkkkkk..']},
 {n:'CLOCK',col:'#fcfcfc',art:['..kkkkkk..','.kwwwwwwk.','kwwwkwwwwk','kwwwkwwwwk','kwwwkkkwwk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kkkkkk..','..........']},
 {n:'TANK',col:'#d82800',art:['..........','....kk....','...krrkkkk','...krrkkk.','.kkrrrrkk.','krrrrrrrrk','kssssssssk','kskskskskk','.kkkkkkkk.','..........']},
 {n:'SWAP',col:'#f878f8',art:['..........','..k.......','.kpkkkkkk.','kppppppppk','.kpkkkkkk.','.kkkkkkpk.','kppppppppk','.kkkkkkpk.','.......k..','..........']},
 // party / troll items (host setting "Wild party")
 {n:'REVERSE',col:'#c060ff',party:1,art:['..........','.kkkkkk...','kppppppk..','kpkkkkpk..','kpk..kpkk.','kpk.kpppk.','kpk..kpk..','kpkkkk.k..','kppppk....','.kkkk.....']},
 {n:'GHOST',col:'#e8e8f8',party:1,art:['...kkkk...','..kwwwwk..','.kwwwwwwk.','.kwkwwkwk.','.kwkwwkwk.','.kwwwwwwk.','.kwwwwwwk.','.kwwwwwwk.','.kwkwkwkk.','..k.k.k...']},
 {n:'BOUNCE',col:'#58d854',party:1,art:['..........','k.......k.','.k.....k..','..k...k...','...k.k....','....g.....','...kgk....','..kgggk...','...kgk....','....k.....']},
 {n:'OIL SLICK',col:'#383848',party:1,art:['..........','...kkkk...','..kssssk..','.kssssssk.','.kswssssk.','.kssssssk.','..kssssk..','kkkkkkkkkk','kssssssssk','kkkkkkkkkk']}];
const PCOL={k:'#000',w:'#fcfcfc',r:'#d82800',y:'#f8b800',c:'#3cbcfc',s:'#7c7c7c',p:'#f878f8',g:'#00b800',n:'#ac7c00'};
// CPU enemy kinds (co-op): speed, shell speed, hit points, score
const KIND=[null,{n:'BASIC',sp:.55,bs:2.4,hp:1,sc:100,col:'#a8a8b8'},{n:'FAST',sp:1.05,bs:2.8,hp:1,sc:200,col:'#c8b090'},
 {n:'POWER',sp:.7,bs:4,hp:1,sc:300,col:'#b8c8a0'},{n:'ARMOR',sp:.55,bs:2.8,hp:4,sc:400,col:'#98a8c0'}];

const root=RA.mount(`
  <div class="top">
    <div class="row"><button id="bcBack">◀ GAMES</button><div class="brand">RETRO <b>ARENA</b> · BATTLE TOWN</div></div>
    <div class="info" id="bcInfo"></div>
  </div>
  <div class="screen">
    <canvas id="bcCv"></canvas>
    <button class="hudbtn ra-quit">MENU</button>
    <button class="hudbtn ra-mus" aria-label="Music on or off">♪</button>
    <div class="overlay" id="bcTitle">
      <h1>BATTLE TOWN</h1>
      <p>Drive with WASD, the turret follows your mouse, click to fire. Guard your eagle, blast through brick, grab power-ups, outlast every other crew.</p>
    </div>
    <div class="overlay" id="bcOver" hidden>
      <h1 id="bcWin"></h1>
      <ol class="ranks" id="bcRanks"></ol>
      <div class="row"><button class="go" id="bcAgain">PLAY AGAIN</button><button id="bcSetupBtn">SETUP</button></div>
      <p id="bcOverNote" hidden>Waiting for the host…</p>
    </div>
  </div>
  <div class="row bcmode"><span class="lbl">MODE</span><div class="tabs" id="bcModes"><button class="tab" data-m="0">CO-OP</button><button class="tab" data-m="1">VERSUS</button><button class="tab" data-m="2">TEAM WAR</button><button class="tab" data-m="3">GROUND WAR</button></div><span class="note" id="bcModeNote"></span></div>
  <div class="row mset bcmode" id="bcSet"></div>
  <div class="tabs" id="bcTabs"><button class="tab on" id="bcTabOn">ONLINE</button><button class="tab" id="bcTabLocal">LOCAL</button></div>
  <section class="panel" id="bcOnlinePanel">
    <h2 class="ph">ONLINE · UP TO 20 CREWS</h2>
    <div id="bcOnline"></div>
  </section>
  <section class="panel" id="bcSetup" hidden>
    <h2 class="ph">LOCAL BATTLE · ONE SCREEN</h2>
    <div class="row between">
      <div class="row"><span class="lbl">CREWS</span>
        <div class="step"><button id="bcMinus" aria-label="Fewer crews">−</button><output id="bcN" aria-live="polite">2</output><button id="bcPlus" aria-label="More crews">+</button></div>
        <label for="bcCpu">CPU <select id="bcCpu"><option value="0">Easy</option><option value="1" selected>Normal</option><option value="2">Hard</option></select></label></div>
      <button class="go" id="bcStart">START ▶</button>
    </div>
    <div class="list bcslots" id="bcSlots"></div>
    <p class="note" id="bcNote"></p>
  </section>
  <div class="pad" hidden>
    <div class="dpad" role="group" aria-label="Drive"><i class="dU">▲</i><i class="dD">▼</i><i class="dL">◀</i><i class="dR">▶</i></div>
    <div class="ab"><button data-k="fire" class="a">FIRE</button></div>
  </div>`);
root.classList.add('bc');
const cv=$('bcCv'),ctx=cv.getContext('2d');
let VW=384,VH=216;
const SCR=RA.screen({el:root.querySelector('.screen'),canvas:cv,baseH:240,res:3,onResize:(w,h)=>{VW=w;VH=h}});

/* ---------- sound + music ---------- */
RA.audio.add('tshot',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(320,now);o.frequency.exponentialRampToValueAtTime(90,now+.09);
 g.gain.setValueAtTime(.09,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start();o.stop(now+.11)});
RA.audio.add('brick',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='bandpass';f.frequency.value=900;
 g.gain.setValueAtTime(.35,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);s.connect(f);f.connect(g);s.start();s.stop(now+.13)});
RA.audio.add('steel',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.value=1800;g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);o.start();o.stop(now+.09)});
RA.audio.add('power',(AC,now,g)=>{[0,.07,.14,.21].forEach((d,i)=>{const o=AC.createOscillator(),v=AC.createGain();o.type='square';o.frequency.value=[523,659,784,1047][i];
 v.gain.setValueAtTime(.05,now+d);v.gain.exponentialRampToValueAtTime(.001,now+d+.12);o.connect(v);v.connect(g);o.start(now+d);o.stop(now+d+.13)})});
RA.audio.add('stun',(AC,now,g)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(900,now);o.frequency.exponentialRampToValueAtTime(200,now+.3);
 g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.32);o.connect(g);o.start();o.stop(now+.33)});
const TRACKS=[
 T('Tank Garage',100,['Dm','Bb','C','A'],'k...s...k.k.s...',
  'd5 - - f5 - - a5 - g5 - f5 - e5 - - - f5 - - a5 - - d6 - c6 - bb5 - a5 - - - g5 - - c6 - - e6 - d6 - c6 - g5 - - - a5 - c#6 - e6 - - - c#6 - a5 - e5 - - -'),
 T('Brick by Brick',138,['Em','C','D','B'],'k.h.s.h.k.hks.h.',
  'e5 . e5 . g5 . b5 - a5 . g5 . e5 . d5 . c5 . e5 . g5 . c6 - b5 . g5 . e5 . c5 . d5 . f#5 . a5 . d6 - c6 . a5 . f#5 . d5 . b4 . d#5 . f#5 . b5 - a5 . f#5 . d#5 . b4 .'),
 T('Steel Rain',152,['Am','G','F','E'],'k.hhs.hhk.hhs.hk',
  'a4 a4 c5 . e5 . a5 . g5 . e5 . c5 . b4 . g4 g4 b4 . d5 . g5 . f5 . d5 . b4 . g4 . f4 f4 a4 . c5 . f5 . e5 . c5 . a4 . f4 . e4 - g#4 - b4 - e5 - g#5 - b5 - e6 - - .'),
 T('Last Crew Standing',172,['Cm','Ab','Bb','G'],'k.hsk.hsk.hsk.ss',
  'c5 . c5 . eb5 c5 . g5 . f5 eb5 . d5 . c5 . ab4 . c5 . eb5 ab4 . ab5 . g5 eb5 . c5 . ab4 . bb4 . d5 . f5 bb4 . bb5 . ab5 f5 . d5 . bb4 . g4 - b4 - d5 - g5 - f5 - d5 - b4 - g4 -')];

/* ---------- setup ---------- */
const BASE=[['Red','#d82800'],['Blue','#0078f8'],['Gold','#f8b800'],['Green','#00b800'],['Pink','#f878f8'],['Cyan','#00e8d8'],['Orange','#e45c10'],['Violet','#6844fc'],['Gray','#bcbcbc'],['Mint','#58f898']];
const COLORS=Array.from({length:MAXP},(_,i)=>[i<10?BASE[i][0]:BASE[i%10][0]+' 2',BASE[i%10][1]]);
const CTRL=[['mk','Mouse + keys'],['k2','Keys IJKL'],['k3','Arrow keys'],['k4','Numpad'],['touch','Touch buttons'],['gp0','Gamepad 1'],['gp1','Gamepad 2'],['gp2','Gamepad 3'],['gp3','Gamepad 4'],['cpu','CPU']];
const KEYS={
 mk:{KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',Space:'fire'},
 k2:{KeyI:'up',KeyK:'down',KeyJ:'left',KeyL:'right',KeyU:'fire'},
 k3:{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Slash:'fire',Period:'fire'},
 k4:{Numpad8:'up',Numpad5:'down',Numpad4:'left',Numpad6:'right',Numpad0:'fire'}};
const HOWTO=touchDev?'Touch: the pad drives, FIRE shoots where you face, or tap the battlefield to shoot right there.'
 :'Mouse + keys: WASD drives, the turret follows the mouse, click (or Space) fires. Gamepad: left stick drives, right stick aims the turret, A / RB / RT fire, Back chat, Start menu.';
let saved=null;try{saved=JSON.parse(localStorage.getItem('bc-setup'))}catch(e){}
let selMode=saved&&saved.md>=0&&saved.md<=3?saved.md:1,mode=1;            // selMode = what the setup shows, mode = the match being played
// host match settings (survey: host picks turret, friendly fire, lives, camera, length, power-ups)
const BSET=[['turret','Turret',[['free','Free aim'],['classic','Classic (faces forward)']]],['ff','Friendly fire',[['stun','Stuns'],['off','Off'],['on','Hurts']]],
 ['lives','Lives',[[1,'1'],[3,'3'],[5,'5'],[9,'9']]],['cam','Camera',[['follow','Follow'],['whole','Whole map']]],['len','Time limit',[[0,'None'],[3,'3 min'],[5,'5 min'],[10,'10 min']]],
 ['pow','Power-ups',[['classic','Classic'],['party','Wild party'],['off','Off']]]];
let BS={turret:'free',ff:'stun',lives:3,cam:'follow',len:0,pow:'classic'};try{Object.assign(BS,JSON.parse(localStorage.getItem('bc-bset'))||{})}catch(e){}
const cleanBS=o=>{const r={};for(const[k,,opts]of BSET){const v=o&&o[k];const hit=opts.find(x=>String(x[0])===String(v));r[k]=hit?hit[0]:BS[k]}return r};
const teamMode=()=>mode>=2;
$('bcSlots').innerHTML=COLORS.map((c,i)=>'<div class="slot" id="bcs'+i+'"><span class="chip" style="background:'+c[1]+'">'+(i+1)+'</span><select id="bcc'+i+'" aria-label="'+c[0]+' controls">'+CTRL.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select></div>').join('');
for(let i=0;i<MAXP;i++)$('bcc'+i).value=(saved&&saved.c&&saved.c[i])||(i===0?(touchDev?'touch':'mk'):'cpu');
$('bcN').textContent=String(saved&&saved.n||2);if(saved&&saved.cpu!=null)$('bcCpu').value=saved.cpu;
$('bcNote').textContent=HOWTO+' Extra crews on one keyboard: IJKL + U fire · Arrows + / fire · Numpad 8 4 5 6 + 0 fire (their turret faces where they drive). In co-op, CPU seats fight on your side.';
const nSel=()=>+$('bcN').textContent;
function syncSlots(){const n=nSel();$('bcMinus').disabled=n<=1;$('bcPlus').disabled=n>=MAXP;for(let i=0;i<MAXP;i++)$('bcs'+i).hidden=i>=n}
function saveSetup(){try{localStorage.setItem('bc-setup',JSON.stringify({n:nSel(),cpu:$('bcCpu').value,c:[...Array(MAXP).keys()].map(i=>$('bcc'+i).value),tab:onlineTab,md:selMode}))}catch(e){}}
function setMode(m){selMode=m;root.querySelectorAll('#bcModes .tab').forEach(b=>b.classList.toggle('on',+b.dataset.m===m));
 $('bcModeNote').textContent=['Everyone guards one eagle against waves of CPU tanks.','Every crew guards its own eagle. Last crew rolling wins.','Red vs blue: each team guards one eagle. Destroy theirs or wipe them out.','Team war with CPU escort tanks rolling out of both bases to push the front.'][m]||'';saveSetup()}
$('bcSet').innerHTML=BSET.map(([k,t,o])=>'<label>'+t+' <select id="bs_'+k+'">'+o.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')+'</select></label>').join('');
function showBS(){for(const[k]of BSET){const el=$('bs_'+k);if(el.value!==String(BS[k]))el.value=String(BS[k]);const lock=R.online&&!R.host;if(el.disabled!==lock)el.disabled=lock}}
for(const[k]of BSET)$('bs_'+k).addEventListener('change',e=>{const v=e.target.value;BS[k]=isNaN(+v)?v:+v;try{localStorage.setItem('bc-bset',JSON.stringify(BS))}catch(_){}});
$('bcModes').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b&&!(R.online&&!R.host))setMode(+b.dataset.m)});
$('bcMinus').addEventListener('click',()=>{$('bcN').textContent=Math.max(1,nSel()-1);syncSlots();saveSetup()});
$('bcPlus').addEventListener('click',()=>{$('bcN').textContent=Math.min(MAXP,nSel()+1);syncSlots();saveSetup()});
$('bcSlots').addEventListener('change',saveSetup);$('bcCpu').addEventListener('change',saveSetup);
let onlineTab=!(saved&&saved.tab===false);
function setTab(on){onlineTab=on;$('bcTabOn').classList.toggle('on',on);$('bcTabLocal').classList.toggle('on',!on);$('bcOnlinePanel').hidden=!on;$('bcSetup').hidden=on;saveSetup()}
$('bcTabOn').addEventListener('click',()=>setTab(true));$('bcTabLocal').addEventListener('click',()=>setTab(false));
syncSlots();

/* ---------- online room ---------- */
const NET={matchId:0,mroster:[],ev:[],es:0,seen:0,chg:[],cs:0,cseen:0,chunk:0,winner:-1,myIdx:-1,fc:0,prev:{},lastAim:-99,lastAimT:0};
const R=RA.rooms({game:'tanks',controls:HOWTO,el:$('bcOnline'),colors:COLORS,max:MAXP,minPlayers:1,cpus:1,
 note:'Up to 20 crews per room, CPU crews fill seats. The host picks the mode above. Friends need to be signed in to claude.ai and have this page shared with them. '+HOWTO,
 onStart:startOnline,onState:applySnap,onLeave:()=>{if(!RA.menu.open&&RA.menu.current&&RA.menu.current.id==='tanks')toLobby()}});
const isClient=()=>R.online&&!R.host;
const hostOnline=()=>R.online&&R.host;

/* ---------- the map: tiles, with brick split in four quarters so shells chew it away ---------- */
// typ: 0 ground, 1 brick (msk = which quarters stand), 2 steel, 3 water, 4 trees, 5 ice, 6 eagle
let GW=21,GH=21,typ=new Uint8Array(GW*GH),msk=new Uint8Array(GW*GH),bases=[],spawnsE=[],seed=1;
const tIdx=(tx,ty)=>ty*GW+tx;
const enc=(t,m)=>t===1?String.fromCharCode(97+m):String(t);
const decT=c=>c>='a'&&c<='p'?[1,c.charCodeAt(0)-97]:[Math.max(0,Math.min(6,+c|0)),0];
function setTile(i,t,m){if(typ[i]===t&&msk[i]===(m|0))return;typ[i]=t;msk[i]=m|0;
 if(hostOnline()&&!demo){NET.chg.push([++NET.cs,i,enc(t,m|0)]);if(NET.chg.length>60)NET.chg.shift()}}
// a sub-block is one 8x8 quarter of a tile
function subSolid(sx,sy,shell){const tx=sx>>1,ty=sy>>1;if(tx<0||ty<0||tx>=GW||ty>=GH)return true;const i=tIdx(tx,ty),t=typ[i];
 if(t===1)return!!(msk[i]&(1<<(((sy&1)<<1)|(sx&1))));return t===2||t===6||(t===3&&!shell)}
function boxFree(x,y,gh){if(gh){for(let sy=Math.floor((y-TK)/8);sy<=Math.floor((y+TK-.01)/8);sy++)for(let sx=Math.floor((x-TK)/8);sx<=Math.floor((x+TK-.01)/8);sx++){const tx=sx>>1,ty=sy>>1;if(tx<0||ty<0||tx>=GW||ty>=GH)return false;const tt=typ[tIdx(tx,ty)];if(tt===2||tt===6)return false}return true}
 for(let sy=Math.floor((y-TK)/8);sy<=Math.floor((y+TK-.01)/8);sy++)for(let sx=Math.floor((x-TK)/8);sx<=Math.floor((x+TK-.01)/8);sx++)if(subSolid(sx,sy,false))return false;return true}
function buildMap(n,md,sd){
 seed=sd;const rr=mulberry(sd),r=(a,b)=>a+rr()*(b-a);
 GW=GH=md?Math.max(21,Math.ceil(n*5/3.1+8))|1:Math.min(33,21+2*Math.floor(n/3));
 typ=new Uint8Array(GW*GH);msk=new Uint8Array(GW*GH);bases=[];spawnsE=[];
 // scatter cover in 2x2 blocks: brick most of all, some steel, trees, water, ice
 for(let by=1;by<GH-1;by+=2)for(let bx=1;bx<GW-1;bx+=2){const v=rr();let t=0;
  if(v<.3)t=1;else if(v<.36)t=2;else if(v<.45)t=4;else if(v<.49)t=3;else if(v<.52)t=5;
  if(!t)continue;const shape=Math.floor(rr()*4);
  for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){if(shape===1&&dy===1||shape===2&&dx===1)continue;const x=bx+dx,y=by+dy;if(x<GW&&y<GH)typ[tIdx(x,y)]=t,msk[tIdx(x,y)]=t===1?15:0}}
 const clear=(cx,cy,rad)=>{for(let y=cy-rad;y<=cy+rad;y++)for(let x=cx-rad;x<=cx+rad;x++)if(x>=0&&y>=0&&x<GW&&y<GH){typ[tIdx(x,y)]=0;msk[tIdx(x,y)]=0}};
 const fort=(cx,cy,own)=>{clear(cx,cy,2);for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(x>=0&&y>=0&&x<GW&&y<GH){typ[tIdx(x,y)]=1;msk[tIdx(x,y)]=15}
  typ[tIdx(cx,cy)]=6;msk[tIdx(cx,cy)]=0;bases.push({tx:cx,ty:cy,own,alive:true,shovel:0})};
 const spots=[];
 if(md===0){const cx=GW>>1,cy=GH-2;fort(cx,cy,-1);
  for(let k=0;k<n;k++){const side=k%2?1:-1,off=3+2*Math.floor(k/2);spots.push([Math.max(1,Math.min(GW-2,cx+side*off)),GH-2])}
  for(let k=0;k<Math.max(3,Math.round(GW/7));k++)spawnsE.push([Math.round(1+(GW-3)*k/Math.max(2,Math.round(GW/7)-1)),1]);
  for(const s of spawnsE)clear(s[0],s[1],1);for(const s of spots)clear(s[0],s[1],0)}
 else if(md>=2){GW=Math.max(GW,25)|1;GH=GW;typ=new Uint8Array(GW*GH);msk=new Uint8Array(GW*GH);
  for(let by=1;by<GH-1;by+=2)for(let bx=1;bx<GW-1;bx+=2){const v=rr();let t=0;if(v<.3)t=1;else if(v<.36)t=2;else if(v<.45)t=4;else if(v<.49)t=3;else if(v<.52)t=5;
   if(!t)continue;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const x=bx+dx,y=by+dy,my=GH-1-y,mx=GW-1-x;if(x<GW&&y<GH&&y<GH/2){typ[tIdx(x,y)]=t;msk[tIdx(x,y)]=t===1?15:0;typ[tIdx(mx,my)]=t;msk[tIdx(mx,my)]=t===1?15:0}}}
  const cx=GW>>1;fort(cx,GH-2,0);fort(cx,1,1);
  for(let k=0;k<n;k++){const tm=k%2,j=k>>1,side=j%2?1:-1,off=3+2*Math.floor(j/2),x=Math.max(1,Math.min(GW-2,cx+side*off)),y=tm?2:GH-3;spots.push([x,y])}
  spawnsE.push([2,GH-2],[GW-3,GH-2],[2,1],[GW-3,1]);for(const sp of spots)clear(sp[0],sp[1],0);for(const sp of spawnsE)clear(sp[0],sp[1],0)}
 else{const c=(GW-1)/2,rad=(GW-1)/2-2.5,a0=r(0,Math.PI*2);
  for(let k=0;k<n;k++){const a=a0+k/n*Math.PI*2,bx=Math.round(c+Math.cos(a)*rad),by=Math.round(c+Math.sin(a)*rad);
   fort(bx,by,k);const sx=Math.round(c+Math.cos(a)*(rad-2.6)),sy=Math.round(c+Math.sin(a)*(rad-2.6));clear(sx,sy,0);spots.push([sx,sy])}}
 // a frame of steel round the arena
 return spots}

/* ---------- the battle ---------- */
let crews=[],tanks=[],shells=[],items=[],parts=[],texts=[],state='menu',demo=true,tick=0,matchT=0,lastTrack=-1,tankId=0;
let coop={left:0,on:0,spawnT:0,max:4,total:0},clockT={},grenFlash=0,shake=0;
const cam={x:0,y:0,z:1,snap:true};
const CPU=[{aim:.5,rate:70,react:30},{aim:.22,rate:40,react:18},{aim:.08,rate:22,react:9}];
function makeCrew(i,ctrl,name,peer,sp){return{i,ctrl,name,peer:peer||'',col:mode>=2?TEAMC[i%2]:COLORS[i][1],team:mode>=2?i%2:i,lives:BS.lives|0||3,kills:0,score:0,tank:null,respawn:30,sp,out:false,outAt:0,lastBy:-1,
 base:mode>=2?i%2:mode?i:0,prev:{},lf:0,aim:0,stunBy:-1}}
function newTank(o){return Object.assign({id:++tankId,crew:-1,kind:0,x:0,y:0,dir:0,aim:-Math.PI/2,hp:1,lvl:0,shield:0,stun:0,frozen:0,flash:false,cd:0,moving:false,anim:0,slide:0,spawnT:40,ai:{t:0,dir:0}},o)}
function startMatch(list,isDemo,md){
 demo=!!isDemo;tick=0;matchT=0;parts=[];texts=[];shells=[];items=[];tanks=[];lastTrack=-1;NET.ev=[];NET.chg=[];NET.winner=-1;grenFlash=0;shake=0;
 if(!isClient())NET.seed=(Math.random()*1e9)|0;
 md=isDemo?1:md==null?selMode:md;mode=md;
 const spots=buildMap(list.length,md,NET.seed);
 crews=list.map((d,i)=>makeCrew(i,d.ctrl,d.name,d.peer,spots[i]));
 const cl=CPU[+$('bcCpu').value]||CPU[1];for(const c of crews)c.cpu=isDemo?CPU[1]:cl;
 const hum=crews.filter(c=>c.ctrl!=='cpu').length||1;
 coop={war:md===3?600:0,total:md?0:10+6*Math.min(8,crews.length)+2*hum,left:0,on:0,spawnT:90,max:Math.min(14,3+crews.length)};coop.left=coop.total;coop.made=0;
 state='play';cam.snap=true;
}
function spawnCrew(c){const[tx,ty]=c.sp,x=tx*TS+8,y=ty*TS+8;
 if(tanks.some(t=>Math.abs(t.x-x)<TS&&Math.abs(t.y-y)<TS))return false;
 const up=mode===0||ty>GH/2;c.tank=newTank({crew:c.i,x,y,dir:up?0:2,aim:up?-Math.PI/2:Math.PI/2,shield:180,col:c.col});tanks.push(c.tank);return true}
function spawnEnemy(){const free=spawnsE.filter(([tx,ty])=>!tanks.some(t=>Math.abs(t.x-(tx*TS+8))<TS&&Math.abs(t.y-(ty*TS+8))<TS));if(!free.length)return;
 const[tx,ty]=free[Math.floor(Math.random()*free.length)],n=++coop.made;
 const late=n/Math.max(1,coop.total),k=Math.random()<late*.5?4:Math.random()<.3?2:Math.random()<.3+late*.3?3:1;
 tanks.push(newTank({kind:k,x:tx*TS+8,y:ty*TS+8,dir:2,aim:Math.PI/2,hp:KIND[k].hp,flash:n%4===0,col:KIND[k].col}));coop.left--}

/* effects: played here, and sent to everyone in the room by the host */
const myCrew=()=>NET.myIdx>=0?crews[NET.myIdx]:null;
// spectating: watchers and knocked-out crews follow one living crew; ← → / Tab / click switch who
let spec=-1;const live=c=>c&&!c.out;
const spectating=()=>!demo&&state==='play'&&(R.online?(NET.myIdx<0||!live(crews[NET.myIdx])):!crews.some(c=>c.ctrl!=='cpu'&&live(c)));
function cycle(d){const n=crews.length;let j=spec;for(let k=0;k<n;k++){j=((j+d)%n+n)%n;if(live(crews[j])){spec=j;return}}}
addEventListener('keydown',e=>{if(!RA.menu.current||RA.menu.current.id!=='tanks'||!spectating())return;if(e.code==='ArrowRight'||e.code==='Tab'||e.code==='KeyE'){cycle(1);e.preventDefault()}else if(e.code==='ArrowLeft'||e.code==='KeyQ'){cycle(-1);e.preventDefault()}});
cv.addEventListener('pointerdown',()=>{if(spectating())cycle(1)});
const focusCrews=()=>{if(spectating()){if(!live(crews[spec]))cycle(1);return live(crews[spec])?[crews[spec]]:[]}
 if(R.online)return NET.myIdx>=0?[crews[NET.myIdx]]:[];return crews.filter(c=>c.ctrl!=='cpu')};
function ev(k,a){if(!hostOnline()||demo)return;NET.ev.push([++NET.es,k,...a]);if(NET.ev.length>30)NET.ev.shift()}
function near(x,y){const fs=focusCrews();if(!fs.length)return true;return fs.some(c=>c.tank&&Math.hypot(c.tank.x-x,c.tank.y-y)<VW*.8)}
function noise(t,a,x,y){if(!demo&&(x==null||near(x,y)))sfx(t,a);ev('s',[t,a|0,Math.round(x||0),Math.round(y||0)])}
function boom(x,y,r){parts.push({ring:1,x,y,r,t:18,k:18});for(let i=0;i<r;i++)parts.push({x,y,z:0,vx:(Math.random()-.5)*2.6,vy:(Math.random()-.5)*2.6,vz:Math.random()*2.5,t:30+Math.random()*20,col:i%3?'#f8b800':'#5c5c5c'});
 if(r>=10)shake=Math.max(shake,r>=16?5:3);ev('b',[Math.round(x),Math.round(y),r])}
function chips(x,y,col){for(let i=0;i<5;i++)parts.push({x,y,z:WH,vx:(Math.random()-.5)*1.8,vy:(Math.random()-.5)*1.8,vz:Math.random()*1.6,t:26,col});ev('c',[Math.round(x),Math.round(y),col])}
function say(x,y,s,col){texts.push({x,y,s,col,t:70});ev('x',[Math.round(x),Math.round(y),s,col])}

/* ---------- tanks ---------- */
const DX=[0,1,0,-1],DY=[-1,0,1,0];
function blockedByTank(t,x,y){for(const o of tanks)if(o!==t&&o.spawnT<=0&&Math.abs(o.x-x)<TK*2&&Math.abs(o.y-y)<TK*2&&!(Math.abs(o.x-t.x)<TK*2&&Math.abs(o.y-t.y)<TK*2))return true;return false}
function drive(t,want,sp){
 if(want<0){if(t.slide>0&&onIce(t)){t.slide--;want=t.dir}else{t.moving=false;return}}
 if(want!==t.dir){if((want&1)!==(t.dir&1)){if(want&1)t.y=snapTo(t,t.y,'y');else t.x=snapTo(t,t.x,'x')}t.dir=want}
 const nx=t.x+DX[want]*sp,ny=t.y+DY[want]*sp;
 if(boxFree(nx,ny,t.ghost>0)&&!blockedByTank(t,nx,ny)){t.x=nx;t.y=ny;t.moving=true;t.anim+=sp;t.slide=onIce(t)?14:0}else{t.moving=false;t.slide=0;if(t.ai)t.ai.blocked=(t.ai.blocked|0)+1}}
// turning snaps to the half-tile grid like the original, so lining up with a corridor is easy
function snapTo(t,v,ax){const s=Math.round(v/8)*8;if(Math.abs(s-v)>4)return v;const nx=ax==='x'?s:t.x,ny=ax==='y'?s:t.y;return boxFree(nx,ny)?s:v}
const onIce=t=>t.oil>0||typ[tIdx(Math.max(0,Math.min(GW-1,Math.floor(t.x/TS))),Math.max(0,Math.min(GH-1,Math.floor(t.y/TS))))]===5;
function speedOf(t){return t.kind?KIND[t.kind].sp:t.lvl>=1?1.15:1}
function shellSpeed(t){return t.kind?KIND[t.kind].bs:t.lvl>=1?4.2:3}
function fire(t){if(t.cd>0||t.stun>0||t.frozen>0||t.spawnT>0)return;const mine=shells.filter(s=>s.own===t.id).length;if(mine>=(t.lvl>=2?2:1))return;
 const sp=shellSpeed(t),a=t.aim,cx=Math.cos(a),cy=Math.sin(a);
 shells.push({x:t.x+cx*10,y:t.y+cy*10,vx:cx*sp,vy:cy*sp,own:t.id,crew:t.crew,team:teamOf(t),pow:t.lvl>=3,t:0,b:t.bounce>0?3:0});t.cd=t.lvl>=2?12:20;
 parts.push({flash:1,x:t.x+cx*11,y:t.y+cy*11,t:5});noise('tshot',0,t.x,t.y)}
function hurt(t,by,dmg){
 if(t.spawnT>0)return;const bc=by?crews[by.crew]:null,tc=crews[t.crew];
 if(t.shield>0){chips(t.x,t.y,'#3cbcfc');return}
 // co-op: friendly fire stuns instead of killing (trolling allowed)
 const mate=mode===0?(tc&&(bc||(by&&by.crew>=0))):mode>=2&&by&&teamOf(by)===teamOf(t)&&by!==t;
 if(mate){if(BS.ff==='off')return;if(BS.ff!=='on'){t.stun=110;noise('stun',0,t.x,t.y);say(t.x,t.y-16,'STUNNED','#f878f8');return}}
 if(mode===0&&!tc&&by&&by.kind)return;
 t.hp-=dmg||1;if(t.hp>0){chips(t.x,t.y,'#fcfcfc');noise('steel',0,t.x,t.y);if(t.kind===4)t.col=['#d8d8e8','#e8c070','#c8c8a0','#98a8c0'][Math.max(0,t.hp-1)];return}
 kill(t,bc)}
function kill(t,bc){t.dead=true;boom(t.x,t.y,16);noise('boom',22,t.x,t.y);
 if(t.kind){if(bc&&!(mode>=2&&teamOf(t)===bc.team)){bc.score+=KIND[t.kind].sc;bc.kills++;say(t.x,t.y-14,String(KIND[t.kind].sc),'#fcfcfc')}if(t.flash)dropItem(t.x,t.y)}
 else{const c=crews[t.crew];c.tank=null;c.respawn=150;c.lastBy=bc?bc.i:-1;
  if(bc&&bc!==c){bc.kills++;bc.score+=200;say(t.x,t.y-14,bc.name.slice(0,8)+' +200',bc.col)}
  if(c.lives<=0){c.out=true;c.outAt=matchT;say(t.x,t.y-24,c.name.slice(0,8)+' OUT','#d82800')}}}
function dropItem(x,y){if(BS.pow==='off')return;const n=BS.pow==='party'?ITEMS.length-1:7;let k=1+Math.floor(Math.random()*n);if(BS.pow==='party'&&Math.random()<.45)k=8+Math.floor(Math.random()*(ITEMS.length-8));if(mode===0&&k===7&&crews.length<2)k=1;
 if(x==null){for(let n=0;n<40;n++){const tx=1+Math.floor(Math.random()*(GW-2)),ty=1+Math.floor(Math.random()*(GH-2)),i=tIdx(tx,ty);if(typ[i]===0||typ[i]===5){x=tx*TS+8;y=ty*TS+8;break}}if(x==null)return}
 items.push({x,y,k,t:900});noise('pick',0,x,y)}
function grab(t,it){const c=crews[t.crew];it.t=0;noise('power',0,t.x,t.y);say(it.x,it.y-12,ITEMS[it.k].n,ITEMS[it.k].col);if(c)c.score+=50;
 switch(it.k){
  case 1:t.lvl=Math.min(3,t.lvl+1);break;
  case 2:t.shield=600;break;
  case 3:{const b=bases[mode>=2?teamOf(t):mode?t.crew:0];if(b&&b.alive){b.shovel=900;fortify(b,2,0)}break}
  case 4:{grenFlash=14;for(const o of tanks)if(o!==t&&!o.dead&&o.spawnT<=0&&(mode===0?o.kind>0:Math.hypot(o.x-t.x,o.y-t.y)<150)){o.shield=0;hurt(o,t,9)}break}
  case 5:for(const o of tanks)if(o!==t&&(mode===0?o.kind>0:true))o.frozen=mode===0?480:240;break;
  case 6:if(c){c.lives++;say(t.x,t.y-22,'1UP','#58d854')}break;
  case 7:{const pool=tanks.filter(o=>o!==t&&!o.dead&&o.spawnT<=0&&(mode===0?(o.crew>=0||true):o.crew>=0));const o=pool[Math.floor(Math.random()*pool.length)];
   if(o){const x=t.x,y=t.y;t.x=o.x;t.y=o.y;o.x=x;o.y=y;parts.push({ring:1,x:t.x,y:t.y,r:10,t:12,k:12,col:'#f878f8'},{ring:1,x:o.x,y:o.y,r:10,t:12,k:12,col:'#f878f8'})}break}
  // party items: troll the others, or bend the rules for yourself
  case 8:for(const o of tanks)if(o!==t&&!o.dead&&(mode>=2?teamOf(o)!==teamOf(t):true))o.rev=360;break;
  case 9:t.ghost=480;break;
  case 10:t.bounce=600;break;
  case 11:for(const o of tanks)if(o!==t&&!o.dead)o.oil=420;break}}
function fortify(b,t,m){for(let y=b.ty-1;y<=b.ty+1;y++)for(let x=b.tx-1;x<=b.tx+1;x++)if((x!==b.tx||y!==b.ty)&&x>=0&&y>=0&&x<GW&&y<GH){const i=tIdx(x,y);if(!tanks.some(o=>Math.abs(o.x-(x*TS+8))<TS-2&&Math.abs(o.y-(y*TS+8))<TS-2))setTile(i,t,t===1?15:m)}}
function stepTank(t,inp){
 if(t.spawnT>0){t.spawnT--;return}
 if(t.cd>0)t.cd--;if(t.shield>0)t.shield--;if(t.frozen>0){t.frozen--;t.moving=false;return}if(t.stun>0){t.stun--;t.moving=false;return}
 if(t.rev>0){t.rev--;inp=Object.assign({},inp,{up:inp.down,down:inp.up,left:inp.right,right:inp.left})}
 if(t.ghost>0)t.ghost--;if(t.bounce>0)t.bounce--;if(t.oil>0)t.oil--;
 if(inp.aim!=null&&!(BS.turret==='classic'&&!t.kind))t.aim=inp.aim;
 const want=inp.up?0:inp.down?2:inp.left?3:inp.right?1:-1;
 if((inp.aim==null||BS.turret==='classic'&&!t.kind)&&want>=0)t.aim=[-Math.PI/2,0,Math.PI/2,Math.PI][want];
 drive(t,want,speedOf(t));
 if(inp.fire)fire(t);
 for(const it of items)if(it.t>0&&t.kind===0&&Math.abs(it.x-t.x)<12&&Math.abs(it.y-t.y)<12)grab(t,it)}

/* ---------- shells ---------- */
function stepShell(s){
 for(let k=0;k<3&&!s.dead;k++){s.x+=s.vx/3;s.y+=s.vy/3;
  const sx=Math.floor(s.x/8),sy=Math.floor(s.y/8);
  if(s.x<0||s.y<0||s.x>=GW*TS||s.y>=GH*TS){s.dead=true;chips(s.x,s.y,'#7c7c7c');break}
  if(subSolid(sx,sy,true)){if(s.b>0&&typ[tIdx(sx>>1,sy>>1)]!==6){s.b--;s.x-=s.vx/3;s.y-=s.vy/3;const hx=subSolid(Math.floor((s.x+s.vx/3)/8),Math.floor(s.y/8),true);if(hx)s.vx=-s.vx;else s.vy=-s.vy;chips(s.x,s.y,'#58d854');continue}hitWall(s,sx,sy);break}
  for(const t of tanks)if(!t.dead&&t.id!==s.own&&t.spawnT<=0&&Math.abs(t.x-s.x)<TK&&Math.abs(t.y-s.y)<TK){s.dead=true;
   const by=tanks.find(o=>o.id===s.own)||{crew:s.crew,kind:s.crew>=0?0:1};hurt(t,by,1);break}}
 if(s.dead)return;
 for(const o of shells)if(o!==s&&!o.dead&&Math.abs(o.x-s.x)<4&&Math.abs(o.y-s.y)<4){o.dead=s.dead=true;parts.push({flash:1,x:s.x,y:s.y,t:6});break}
 if(++s.t>400)s.dead=true}
function hitWall(s,sx,sy){s.dead=true;const tx=sx>>1,ty=sy>>1,i=tIdx(tx,ty),t=typ[i];
 if(t===6){const b=bases.find(b=>b.tx===tx&&b.ty===ty);if(b&&b.alive)baseDown(b,s);return}
 if(t===2){if(s.pow){setTile(i,0,0);chips(s.x,s.y,'#bcbcbc');noise('brick',0,s.x,s.y)}else{chips(s.x,s.y,'#fcfcfc');noise('steel',0,s.x,s.y)}return}
 if(t===1){let m=msk[i];const q=(qx,qy)=>{if(qx>>1===tx&&qy>>1===ty)m&=~(1<<(((qy&1)<<1)|(qx&1)))};
  // the hit quarter and its neighbour across the shell's path (or a bigger bite for steel-breaking shells)
  if(Math.abs(s.vx)>Math.abs(s.vy)){q(sx,sy);q(sx,sy^1);if(s.pow){q(sx^1,sy);q(sx^1,sy^1)}}else{q(sx,sy);q(sx^1,sy);if(s.pow){q(sx,sy^1);q(sx^1,sy^1)}}
  setTile(i,m?1:0,m);chips(s.x,s.y,'#c86030');noise('brick',0,s.x,s.y)}}
function baseDown(b,s){b.alive=false;boom(b.tx*TS+8,b.ty*TS+8,24);noise('boom',30,null);shake=8;
 const bc=s.crew>=0?crews[s.crew]:null;
 if(mode===0){say(b.tx*TS+8,b.ty*TS-8,'EAGLE DOWN','#d82800');return}
 if(mode>=2){say(b.tx*TS+8,b.ty*TS-8,TEAMN[b.own]+' EAGLE DOWN',TEAMC[b.own]);for(const c of crews)if(c.team===b.own){c.lives=0;if(!c.tank){c.out=true;c.outAt=matchT}}if(bc&&bc.team!==b.own){bc.score+=500;bc.kills++}return}
 const c=crews[b.own];if(c){c.lives=0;say(b.tx*TS+8,b.ty*TS-8,c.name.slice(0,8)+' EAGLE DOWN',c.col);if(!c.tank){c.out=true;c.outAt=matchT}}
 if(bc&&bc.i!==b.own){bc.score+=500;bc.kills++}}

/* ---------- input ---------- */
const BITS=['up','down','left','right','fire'];
const toBits=o=>BITS.reduce((v,k,i)=>v|(o[k]?1<<i:0),0),fromBits=v=>{const o={};BITS.forEach((k,i)=>{if(v&(1<<i))o[k]=true});return o};
const toWorld=(fx,fy)=>[cam.x+fx*VW/cam.z,cam.y+fy*VH/cam.z];
function mouseAim(t){if(touchDev||!mouse.on||!t)return null;const[wx,wy]=toWorld(mouse.fx,mouse.fy);return Math.atan2(wy-t.y,wx-t.x)}
function touchAimAt(t){if(!touchAim.on||!t)return null;const[wx,wy]=toWorld(touchAim.fx,touchAim.fy);return Math.atan2(wy-t.y,wx-t.x)}
function padIn(n,t){const p=RA.input.pad(n),o={up:p.up,down:p.down,left:p.left,right:p.right,fire:p.a||p.rb||p.rt||p.x};
 if(Math.hypot(p.rx||0,p.ry||0)>.5)o.aim=Math.atan2(p.ry,p.rx);else if(t&&Math.hypot(p.ax||0,p.ay||0)>.5)o.aim=null;return o}
function touchIn(t){const o={up:touchK.up,down:touchK.down,left:touchK.left,right:touchK.right,fire:touchK.fire},a=touchAimAt(t);if(a!=null)o.aim=a;return o}
function mkIn(t){const o=RA.input.keys(KEYS.mk);if(mouse.down)o.fire=true;const a=mouseAim(t);if(a!=null)o.aim=a;return o}
function myInput(t){const o={};let aim=null;for(const s of[mkIn(t),RA.input.keys(KEYS.k3),touchIn(t),padIn(0,t)]){for(const k of BITS)if(s[k])o[k]=true;if(s.aim!=null&&aim==null)aim=s.aim}
 if(aim!=null)o.aim=aim;return o}
function readInput(c){const t=c.tank,k=c.ctrl;
 if(k==='cpu')return bot(c);
 if(k==='net'){const p=R.input(c.peer);if(!p)return{};const o=fromBits(p.i|0),d=(((p.f|0)-c.lf)%1000+1000)%1000;c.lf=p.f|0;if(d)o.fire=true;
  if(typeof p.a==='number')o.aim=p.a/100;return o}
 if(k==='me')return myInput(t);
 if(k==='touch')return touchIn(t);
 if(k.startsWith('gp'))return padIn(+k[2],t);
 if(k==='mk')return mkIn(t);
 return RA.input.keys(KEYS[k])}
// client: held bits, a fire counter (a quick click is never lost) and the turret angle
function clientSend(now){const c=myCrew(),t=c&&c.tank,o=myInput(t),pr=NET.prev;NET.prev=o;
 if(o.fire&&!pr.fire)NET.fc=(NET.fc+1)%1000;
 let a=o.aim!=null?Math.round(o.aim*100):NET.lastAim;if(Math.abs(a-NET.lastAim)<4&&now-NET.lastAimT<120)a=NET.lastAim;else{NET.lastAim=a;NET.lastAimT=now}
 const p={i:toBits(o),f:NET.fc};if(o.aim!=null)p.a=a;R.send(p,now)}
const onKey=e=>state==='play'&&!demo&&(R.online?!!(KEYS.mk[e.code]||KEYS.k3[e.code]):crews.some(c=>KEYS[c.ctrl]&&KEYS[c.ctrl][e.code]));
RA.input.attachPointer(cv,{active:()=>state==='play'&&!demo&&(R.online?NET.myIdx>=0:crews.some(c=>c.ctrl==='mk')),
 touchActive:()=>state==='play'&&!demo&&(R.online?NET.myIdx>=0:crews.some(c=>c.ctrl==='touch'))});

/* ---------- CPU crews and enemy tanks ---------- */
const teamOf=t=>t.team!=null?t.team:t.crew>=0&&crews[t.crew]?crews[t.crew].team:-1;
function targetFor(t,crewIdx){let best=null,bd=1e9;
 for(const o of tanks){if(o===t||o.dead||o.spawnT>0)continue;
  const foe=mode===0?(t.kind?o.kind===0:o.kind>0):mode>=2?teamOf(o)!==teamOf(t):o.crew!==crewIdx;if(!foe)continue;
  const d=Math.hypot(o.x-t.x,o.y-t.y);if(d<bd){bd=d;best=o}}
 return{best,bd}}
function botMove(t,tx,ty,P){const ai=t.ai;
 if(--ai.t<=0||(ai.blocked|0)>8){ai.blocked=0;ai.t=30+Math.floor(Math.random()*70);
  const dx=tx-t.x,dy=ty-t.y;
  if(Math.random()<.6)ai.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);else ai.dir=Math.floor(Math.random()*4)}
 return ai.dir}
function bot(c){const t=c.tank;if(!t)return{};const P=c.cpu||CPU[1],o={};
 const it=items.find(i=>i.t>0&&Math.hypot(i.x-t.x,i.y-t.y)<110);
 const{best,bd}=targetFor(t,c.i);
 let gx,gy;
 if(it){gx=it.x;gy=it.y}
 else if(best&&bd<180){gx=best.x;gy=best.y}
 else if(mode>=1){const eb=bases.filter(b=>b.alive&&b.own!==(mode>=2?c.team:c.i)).sort((a,b)=>Math.hypot(a.tx*TS-t.x,a.ty*TS-t.y)-Math.hypot(b.tx*TS-t.x,b.ty*TS-t.y))[0];
  if(eb){gx=eb.tx*TS+8;gy=eb.ty*TS+8}else if(best){gx=best.x;gy=best.y}else{gx=GW*8;gy=GH*8}}
 else{gx=best?best.x:GW*8;gy=best?best.y:GH*4}
 o[['up','right','down','left'][botMove(t,gx,gy,P)]]=true;
 if(best&&bd<200){o.aim=Math.atan2(best.y-t.y,best.x-t.x)+(Math.random()-.5)*P.aim*2;if(Math.random()*P.rate<3)o.fire=true}
 else{o.aim=Math.atan2(gy-t.y,gx-t.x);const ahead=[Math.floor((t.x+Math.cos(o.aim)*14)/8),Math.floor((t.y+Math.sin(o.aim)*14)/8)];if(subSolid(ahead[0],ahead[1],true)&&Math.random()<.08)o.fire=true}
 return o}
// classic CPU enemies: wander with a pull toward the eagle or the nearest crew, shoot where they face
function enemyInput(t){const o={};if(!t.ai.goal||Math.random()<.004)t.ai.goal=Math.random()<.5?'base':'crew';
 let gx=GW*8,gy=GH*TS;const b=t.team!=null?bases.find(x=>x.own!==t.team&&x.alive):bases[0];
 if(t.ai.goal==='base'&&b){gx=b.tx*TS+8;gy=b.ty*TS+8}else{const{best}=targetFor(t,-1);if(best){gx=best.x;gy=best.y}}
 o[['up','right','down','left'][botMove(t,gx,gy)]]=true;
 const{best}=targetFor(t,-1);if(best&&(Math.abs(best.x-t.x)<8||Math.abs(best.y-t.y)<8)&&Math.hypot(best.x-t.x,best.y-t.y)<140){o.aim=Math.atan2(best.y-t.y,best.x-t.x)}
 if(Math.random()<(t.kind===3?.05:.03))o.fire=true;return o}

/* ---------- host -> everyone: the battle in one compact snapshot (map changes go as a rolling list plus a slice of the whole map) ---------- */
function snapshot(){
 const g={ph:state==='over'?'over':'play',id:NET.matchId,r:NET.mroster,md:mode,bs:BS,sd:NET.seed,n:crews.length,w:NET.winner,t:(matchT/60)|0,el:coop.left+tanks.filter(t=>t.kind&&!t.dead).length,
  c:crews.map(c=>[c.lives,c.kills,c.score,c.out?1:0,c.tank?c.tank.id:0]),
  k:tanks.map(t=>[t.id,t.crew,t.kind,Math.round(t.x*2),Math.round(t.y*2),t.dir,Math.round(t.aim*50),t.lvl,(t.shield>0?1:0)|(t.stun>0?2:0)|(t.frozen>0?4:0)|(t.flash?8:0)|(t.moving?16:0)|(t.spawnT>0?32:0)|(t.ghost>0?64:0)|(t.rev>0?128:0),t.hp,t.team==null?-1:t.team]),
  s:shells.slice(0,60).map(s=>[Math.round(s.x),Math.round(s.y),Math.round(s.vx*10),Math.round(s.vy*10)]),
  i:items.map(i=>[Math.round(i.x),Math.round(i.y),i.k]),
  b:bases.map(b=>(b.alive?1:0)|(b.shovel>0?2:0)).join(''),
  m:NET.chg.slice(),e:NET.ev.slice()};
 // one slice of the whole map each time, so a late joiner (or a dropped change) catches up within a second
 const n=GW*GH,len=Math.min(n,200),st=NET.chunk%n;let str='';for(let q=0;q<len;q++){const i=(st+q)%n;str+=enc(typ[i],msk[i])}NET.chunk=(st+len)%n;g.mc=[st,str];
 while(JSON.stringify(g).length>3700&&(g.e.length||g.m.length>10||g.s.length)){if(g.e.length)g.e.shift();else if(g.m.length>10)g.m.shift();else g.s.pop()}
 return g}
function applySnap(g){
 if(!g)return;
 if(g.bs)BS=cleanBS(g.bs);
 if(g.ph==='lobby'){if(!demo)toLobby();if(typeof g.md==='number')setMode(Math.max(0,Math.min(3,g.md|0)));showBS();return}
 if(!Array.isArray(g.c)||!Array.isArray(g.r))return;
 const me=R.room&&R.room.peers().find(pe=>pe.sameTab),n=Math.min(MAXP,g.c.length);
 if(g.id!==NET.matchId||crews.length!==n||demo){
  NET.matchId=g.id;NET.seen=0;NET.cseen=0;for(const e of g.e||[])NET.seen=Math.max(NET.seen,e[0]|0);
  NET.seed=g.sd|0;NET.myIdx=me?g.r.indexOf(me.peer):-1;
  startMatch(g.r.slice(0,n).map((p,i)=>({ctrl:'net',name:'',peer:p})),false,Math.max(0,Math.min(3,g.md|0)));
  enterPlay(touchDev&&NET.myIdx>=0)}
 const all=R.room?R.room.peers():[];
 g.c.slice(0,n).forEach((a,i)=>{const c=crews[i];if(!c||!Array.isArray(a))return;c.lives=a[0]|0;c.kills=a[1]|0;c.score=a[2]|0;c.out=!!a[3];
  const id=g.r[i];c.name=id?(id===(me&&me.peer)?(RA.player.name||'YOU'):R.name(all.find(p=>p.peer===id),i)):'CPU '+(g.r.slice(0,i+1).filter(x=>!x).length)});
 // tanks: keep the ones we know (so they glide), add new ones, drop the rest
 const seen=new Set();
 for(const a of g.k||[]){if(!Array.isArray(a))continue;const id=a[0]|0;seen.add(id);let t=tanks.find(o=>o.id===id);
  if(!t){t=newTank({id,crew:a[1]|0,kind:a[2]|0,x:a[3]/2,y:a[4]/2});tanks.push(t)}
  const f=a[8]|0;Object.assign(t,{crew:a[1]|0,kind:Math.max(0,Math.min(4,a[2]|0)),tx:a[3]/2,ty:a[4]/2,dir:a[5]&3,aim:a[6]/50,lvl:a[7]|0,shield:f&1,stun:f&2,frozen:f&4,flash:!!(f&8),moving:!!(f&16),spawnT:f&32?1:0,ghost:f&64?1:0,rev:f&128?1:0,hp:a[9]|0,team:a[10]>=0?a[10]|0:null});
  t.col=t.kind?(t.team!=null?RA.util.mix(TEAMC[t.team]||'#888888','#888888',.35):KIND[t.kind].col):(crews[t.crew]||{col:'#fcfcfc'}).col;
  const c=crews[t.crew];if(c&&!t.kind)c.tank=t}
 tanks=tanks.filter(t=>seen.has(t.id));for(const c of crews)if(c.tank&&!seen.has(c.tank.id))c.tank=null;
 shells=(g.s||[]).map(a=>({x:a[0],y:a[1],vx:a[2]/10,vy:a[3]/10}));
 items=(g.i||[]).map(a=>({x:a[0],y:a[1],k:Math.max(1,Math.min(ITEMS.length-1,a[2]|0)),t:99}));
 String(g.b||'').split('').forEach((v,i)=>{if(bases[i]){const was=bases[i].alive;bases[i].alive=!!(+v&1);bases[i].shovel=+v&2?1:0;if(was&&!bases[i].alive)shake=8}});
 coop.left=g.el|0;matchT=(g.t|0)*60;
 for(const m of g.m||[]){if((m[0]|0)<=NET.cseen)continue;NET.cseen=m[0]|0;const i=m[1]|0;if(i>=0&&i<GW*GH){const[t,k]=decT(String(m[2]));typ[i]=t;msk[i]=k}}
 if(Array.isArray(g.mc)){const st=g.mc[0]|0,s=String(g.mc[1]||'');for(let q=0;q<s.length;q++){const i=(st+q)%(GW*GH);const[t,k]=decT(s[q]);typ[i]=t;msk[i]=k}}
 for(const e of g.e||[]){if((e[0]|0)<=NET.seen)continue;NET.seen=e[0]|0;const k=e[1];
  if(k==='s'){if(!e[4]&&!e[5]||near(e[4],e[5]))sfx(String(e[2]),e[3]|0)}
  else if(k==='b'){const x=e[2],y=e[3],r=e[4]|0;parts.push({ring:1,x,y,r,t:18,k:18});for(let q=0;q<r;q++)parts.push({x,y,z:0,vx:(Math.random()-.5)*2.6,vy:(Math.random()-.5)*2.6,vz:Math.random()*2.5,t:30+Math.random()*20,col:q%3?'#f8b800':'#5c5c5c'});if(r>=10)shake=Math.max(shake,r>=16?5:3)}
  else if(k==='c'&&/^#[0-9a-f]{6}$/i.test(e[4]))for(let q=0;q<5;q++)parts.push({x:e[2],y:e[3],z:WH,vx:(Math.random()-.5)*1.8,vy:(Math.random()-.5)*1.8,vz:Math.random()*1.6,t:26,col:e[4]});
  else if(k==='x')texts.push({x:e[2],y:e[3],s:String(e[4]).slice(0,20),col:/^#[0-9a-f]{6}$/i.test(e[5])?e[5]:'#fcfcfc',t:70})}
 if(g.ph==='over'&&state!=='over'){NET.winner=g.w|0;showOver()}}

/* ---------- art: PS1-style pre-rendered pieces, built once ---------- */
const mk=(w,h,f)=>{const k=document.createElement('canvas');k.width=w;k.height=h;f(k.getContext('2d'),w,h);return k};
const DIT=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function pix(w,h,f){return mk(w,h,(g)=>{const im=g.createImageData(w,h),o=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=f(x,y);if(!c)continue;const q=(y*w+x)*4,d=(DIT[(y&3)*4+(x&3)]-7.5)*1.4;
 o[q]=Math.max(0,Math.min(255,c[0]+d));o[q+1]=Math.max(0,Math.min(255,c[1]+d));o[q+2]=Math.max(0,Math.min(255,c[2]+d));o[q+3]=c[3]==null?255:c[3]}g.putImageData(im,0,0)})}
// ground: worn asphalt with cracks; ice: glossy blue
const GROUND=pix(32,32,(x,y)=>{const n=hash(x,y)%100/100,m=hash(x>>2,y>>2)%100/100,crack=(hash(x>>3,y)%41===0)?-16:0;const v=44+n*10+m*12+crack;return[v,v*.98,v*.92]});
const ICE=pix(16,16,(x,y)=>{const s=(x+y)%11<2?40:0;return[150+s,200+s*.6,235]});
// brick quarter top face (8x8) and steel tile top (16x16)
const BRICKT=pix(8,8,(x,y)=>{const mortar=y===3||y===7||(y<3&&x===3)||(y>3&&y<7&&x===7);if(mortar)return[120,110,100];const n=hash(x,y+5)%30;return[178+n-(y%4)*8,84+n*.4-(y%4)*4,48]});
const STEELT=pix(16,16,(x,y)=>{const e=x===0||y===0?60:x===15||y===15?-60:0,riv=(x===3||x===12)&&(y===3||y===12),g=(x+y)/30;return riv?[240,240,250]:[190-g*60+e,195-g*60+e,210-g*50+e]});
const LEAVES=pix(20,20,(x,y)=>{const d=Math.hypot(x-10,y-10);if(d>9.6)return null;const n=hash(x,y)%60,l=(x+y<16)?40:(x+y>26)?-30:0;return[30+n*.3+l*.5,110+n+l,40+n*.3+l*.4]});
const EAGLE=pix(16,16,(x,y)=>{const art=['................','.......kk.......','......kyyk......','.k...kyyyyk...k.','kyk..kykkyk..kyk','kyyk.kyyyyk.kyyk','kyyyykyyyykyyyyk','.kyyyyyyyyyyyyk.','..kyyyyyyyyyyk..','...kkyyyyyykk...','....kyykkyyk....','...kyyk..kyyk...','...kkk....kkk...','..kssssssssssk..','..kkkkkkkkkkkk..','................'][y][x];
 if(art==='.')return null;if(art==='k')return[30,20,10];if(art==='s')return[150,150,160];const l=x+y<14?1.2:.85;return[240*l,180*l,60*l]});
const RUBBLE=pix(16,16,(x,y)=>{const d=Math.hypot(x-8,y-9);if(d>7)return null;const n=hash(x,y)%60;return[60+n,50+n*.8,45+n*.6]});
const ICON=ITEMS.map(P=>P&&mk(10,10,g=>RA.gfx.blit(g,P.art,0,0,PCOL)));
// a tank hull for each colour: two treads (2 frames), shaded plate lit from the top left, facing up; turned at draw time
const hullCache={};
function hull(col,fr){const key=col+fr;if(hullCache[key])return hullCache[key];const c=RA.util.hex?RA.util.hex(col):[200,200,200];
 return hullCache[key]=pix(14,14,(x,y)=>{
  if(x<=2||x>=11){const tread=((y+fr*2)%4)<2;const v=tread?40:70;return[v,v,v+6]}
  const l=1.25-((x-3)/8)*.35-(y/13)*.35,edge=x===3||y===0?1.25:x===10||y===13?.6:1;return[c[0]*l*edge,c[1]*l*edge,c[2]*l*edge]})}

/* ---------- drawing ---------- */
let groundC=null,groundSig='';
function buildGround(){const w=GW*TS,h=GH*TS,sig=w+'x'+h+':'+seed;if(groundSig===sig)return;groundSig=sig;
 groundC=mk(w,h,g=>{for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32)g.drawImage(GROUND,x,y);
  // lane paint: faded yellow dashes across the middle
  g.fillStyle='rgba(220,180,60,.25)';for(let x=0;x<w;x+=24)g.fillRect(x,(h>>1)-1,12,2);for(let y=0;y<h;y+=24)g.fillRect((w>>1)-1,y,2,12)})}
function drawWater(x0,y0,x1,y1){for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){if(typ[tIdx(tx,ty)]!==3)continue;const X=tx*TS,Y=ty*TS;
 const g=ctx.createLinearGradient(0,Y,0,Y+TS);g.addColorStop(0,'#1c58b8');g.addColorStop(1,'#0c2c78');ctx.fillStyle=g;ctx.fillRect(X,Y,TS,TS);
 ctx.fillStyle='rgba(180,230,255,.55)';for(let k=0;k<3;k++){const wx=(tick*.3+k*7+ty*5)%TS;ctx.fillRect(X+Math.floor(wx),Y+3+k*5,4,1)}
 if(ty>0&&typ[tIdx(tx,ty-1)]!==3){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(X,Y,TS,3)}}}
function drawTankAt(t,x,y){
 const z=t.spawnT>0?0:1;if(!z){const r=3+((tick>>2)%4)*2;ctx.fillStyle='#fcfcfc';ctx.fillRect(x-r,y,r*2+1,1);ctx.fillRect(x,y-r,1,r*2+1);return}
 if(t.frozen&&((tick>>3)&1)){ctx.globalAlpha=.6}if(t.ghost)ctx.globalAlpha=.45;
 RA.fx.shadow(ctx,x+2,y+6,9,.4);
 RA.fx.sprite(ctx,hull(t.col,t.moving?(Math.floor(t.anim/2)&1):0),x,y-2,1,t.dir*Math.PI/2);
 // turret: a lit dome and a barrel pointing at the aim, raised above the hull
 const a=t.aim,cx=Math.cos(a),cy=Math.sin(a);
 ctx.fillStyle='#000';for(let i=3;i<=(t.kind===3||t.lvl>=3?11:10);i++)ctx.fillRect(Math.round(x+cx*i)-1,Math.round(y-4+cy*i)-1,3,3);
 ctx.fillStyle=t.lvl>=3?'#f8f8f8':'#c8c8d0';for(let i=3;i<=(t.lvl>=3?11:10);i++)ctx.fillRect(Math.round(x+cx*i),Math.round(y-4+cy*i),1,1);
 ctx.fillStyle='#000';RA.gfx.disc(ctx,x,y-4,4);ctx.fillStyle=t.col;RA.gfx.disc(ctx,x,y-4,3);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x-2,y-6,2,1);
 if(t.flash&&(tick>>3)&1){ctx.fillStyle='#d82800';RA.gfx.disc(ctx,x,y-4,2)}
 if(t.lvl>0&&!t.kind){ctx.fillStyle='#f8b800';for(let k=0;k<t.lvl;k++)ctx.fillRect(x-4+k*3,y+5,2,2)}
 ctx.globalAlpha=1;
 if(t.shield){ctx.strokeStyle=(tick>>2)&1?'rgba(120,220,255,.9)':'rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y-2,10,0,Math.PI*2);ctx.stroke()}
 if(t.stun){for(let k=0;k<3;k++){const an=tick*.15+k*2.1;ctx.fillStyle='#f8b800';ctx.fillRect(Math.round(x+Math.cos(an)*7),Math.round(y-12+Math.sin(an)*2),2,2)}}
 if(t.frozen){ctx.fillStyle='rgba(160,220,255,.35)';ctx.fillRect(x-8,y-9,16,16)}
 if(t.rev&&(tick>>3)&1)RA.gfx.text(ctx,'?!',x,y-28,'#c060ff')}
function render(){
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#0a0818';ctx.fillRect(0,0,VW,VH);
 if(!crews.length&&!tanks.length)return;
 buildGround();
 const z=cam.z;let sx=0,sy=0;if(shake>0){sx=Math.round((Math.random()-.5)*shake*2);sy=Math.round((Math.random()-.5)*shake*2)}
 ctx.setTransform(z,0,0,z,Math.round(-cam.x*z)+sx,Math.round(-cam.y*z)+sy);
 const x0=Math.max(0,Math.floor(cam.x/TS)-1),y0=Math.max(0,Math.floor(cam.y/TS)-1),x1=Math.min(GW-1,Math.ceil((cam.x+VW/z)/TS)+1),y1=Math.min(GH-1,Math.ceil((cam.y+VH/z)/TS)+1);
 // the arena sits on a dark plinth: drop shadow and a lit rim
 ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(6,8,GW*TS,GH*TS);ctx.fillStyle='#3c3c4c';ctx.fillRect(-3,-3,GW*TS+6,GH*TS+6);ctx.fillStyle='#8c8ca0';ctx.fillRect(-3,-3,GW*TS+6,1);
 ctx.drawImage(groundC,0,0);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(typ[tIdx(tx,ty)]===5)ctx.drawImage(ICE,tx*TS,ty*TS);
 drawWater(x0,y0,x1,y1);
 // shadows of raised blocks fall down and to the right
 ctx.fillStyle='rgba(0,0,0,.35)';
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const i=tIdx(tx,ty),t=typ[i];
  if(t===2||t===6)ctx.fillRect(tx*TS+3,ty*TS+2,TS,TS);else if(t===1)for(let q=0;q<4;q++)if(msk[i]&(1<<q))ctx.fillRect(tx*TS+(q&1)*8+3,ty*TS+(q>>1)*8+2,8,8)}
 for(const it of items){if(it.t<180&&(tick>>3)&1)continue;RA.fx.shadow(ctx,it.x+1,it.y+7,7,.35)}
 // raised blocks and tanks, back to front, row by row of 8-pixel strips
 const order=tanks.filter(t=>!t.dead).map(t=>({y:(t.dy!=null?t.dy:t.y)+TK,t}));order.sort((a,b)=>a.y-b.y);let oi=0;
 for(let sy=y0*2;sy<=y1*2+1;sy++){const rowY=sy*8+8;
  while(oi<order.length&&order[oi].y<=rowY){const t=order[oi++].t;drawTankAt(t,Math.round(t.dx!=null?t.dx:t.x),Math.round(t.dy!=null?t.dy:t.y))}
  const ty=sy>>1,top=!(sy&1);
  for(let tx=x0;tx<=x1;tx++){const i=tIdx(tx,ty),t=typ[i],X=tx*TS;
   if(t===1){for(let qx=0;qx<2;qx++){const q=((sy&1)<<1)|qx;if(!(msk[i]&(1<<q)))continue;const bx=X+qx*8,by=sy*8;
     const below=subSolid(tx*2+qx,sy+1,false)&&typ[tIdx(tx,Math.min(GH-1,(sy+1)>>1))]===1;
     if(!below){ctx.fillStyle='#6c2c14';ctx.fillRect(bx,by+8-WH,8,WH);ctx.fillStyle='#8c3c1c';ctx.fillRect(bx,by+8-WH,8,1)}
     ctx.drawImage(BRICKT,bx,by-WH)}}
   else if(top&&t===2){ctx.fillStyle='#5c606c';ctx.fillRect(X,ty*TS+TS-WH,TS,WH);ctx.fillStyle='#8c909c';ctx.fillRect(X,ty*TS+TS-WH,TS,1);ctx.drawImage(STEELT,X,ty*TS-WH)}
   else if(top&&t===6){const b=bases.find(b=>b.tx===tx&&b.ty===ty);const alive=!b||b.alive;
    ctx.fillStyle='#4c4c58';ctx.fillRect(X,ty*TS+TS-WH,TS,WH);ctx.fillStyle='#2c2c38';ctx.fillRect(X,ty*TS-WH,TS,TS);
    if(alive){ctx.drawImage(EAGLE,X,ty*TS-WH-2);if(mode>=2&&b){ctx.fillStyle=TEAMC[b.own];ctx.fillRect(X+2,ty*TS+TS-WH-2,TS-4,2)}else if(mode===1&&b){const c=crews[b.own];if(c){ctx.fillStyle=c.col;ctx.fillRect(X+2,ty*TS+TS-WH-2,TS-4,2)}}
     if(b&&b.shovel)RA.fx.light(ctx,X+8,ty*TS,14,'#a0c0ff',.25)}
    else ctx.drawImage(RUBBLE,X,ty*TS-WH)}}}
 while(oi<order.length){const t=order[oi++].t;drawTankAt(t,Math.round(t.dx!=null?t.dx:t.x),Math.round(t.dy!=null?t.dy:t.y))}
 // power-ups float and glow
 for(const it of items){if(it.t<180&&(tick>>3)&1)continue;const bob=Math.round(Math.sin(tick*.1+it.x)*2);
  RA.fx.light(ctx,it.x,it.y-6+bob,10,ITEMS[it.k].col,.3);ctx.fillStyle='#000';ctx.fillRect(it.x-7,it.y-13+bob,14,14);ctx.fillStyle=ITEMS[it.k].col;ctx.fillRect(it.x-6,it.y-12+bob,12,12);ctx.drawImage(ICON[it.k],it.x-5,it.y-11+bob)}
 // shells with a hot glow
 for(const s of shells){RA.fx.light(ctx,s.x,s.y-4,5,'#ffc060',.35);ctx.fillStyle='#000';ctx.fillRect(Math.round(s.x)-2,Math.round(s.y)-6,4,4);ctx.fillStyle='#fcfcfc';ctx.fillRect(Math.round(s.x)-1,Math.round(s.y)-5,2,2)}
 // tree canopies cover everything below them
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(typ[tIdx(tx,ty)]===4){const sw=Math.round(Math.sin(tick*.02+tx+ty));ctx.drawImage(LEAVES,tx*TS-2+sw,ty*TS-8)}
 for(const p of parts){
  if(p.ring){const f=1-p.t/p.k;RA.fx.light(ctx,p.x,p.y-4,Math.round(p.r*(.6+f)),p.col||'#ff9030',.6*(1-f));if(!p.col&&p.t>p.k-6){ctx.fillStyle='#fcfcfc';RA.gfx.disc(ctx,p.x,p.y-4,Math.round(p.r*.4))}}
  else if(p.flash){RA.fx.light(ctx,p.x,p.y-4,6,'#fff0a0',.7)}
  else{ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y-p.z-4),p.t>12?2:1,p.t>12?2:1)}}
 // names over crews; an arrow over yours
 for(const c of crews){const t=c.tank;if(!t||t.spawnT>0)continue;const x=Math.round(t.dx!=null?t.dx:t.x),y=Math.round(t.dy!=null?t.dy:t.y);
  const mine=focusCrews().includes(c)&&crews.length>1;RA.gfx.text(ctx,c.name.slice(0,8),x,y-20,c.col);if(mine&&(tick>>4)&1){ctx.fillStyle=c.col;ctx.fillRect(x-1,y-13,3,2)}}
 for(const t of texts)RA.gfx.text(ctx,t.s,Math.round(t.x),Math.round(t.y),t.col);
 // every eagle wears its owner's name (colours repeat with 20 crews)
 for(const b of bases){if(!b.alive)continue;const nm=mode===0?'EAGLE':mode>=2?TEAMN[b.own]:crews[b.own]&&crews[b.own].name;if(!nm)continue;
  RA.gfx.text(ctx,String(nm).slice(0,12),b.tx*TS+8,b.ty*TS-WH-9,mode>=2?TEAMC[b.own]:crews[b.own]?crews[b.own].col:'#fcfcfc')}
 ctx.setTransform(1,0,0,1,0,0);
 if(grenFlash>0){ctx.fillStyle='rgba(255,255,255,'+(grenFlash/20)+')';ctx.fillRect(0,0,VW,VH)}
 if(!demo)drawHud();
 if(spectating()){const f=crews[spec];ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(VW/2-70,22,140,16);ctx.font='7px "Russo One",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';
  ctx.fillText('👁 SPECTATING '+(f?f.name:'').toUpperCase(),VW/2,29.5);ctx.fillStyle='#9ab';ctx.font='5px "Exo 2",sans-serif';ctx.fillText('◀ ▶ / click to switch crew',VW/2,35.5)}
 // crosshair
 const c=myCrew()||crews.find(c=>c.ctrl==='mk');
 if(state==='play'&&!demo&&c&&c.tank&&mouse.on&&!touchDev&&(c.ctrl==='mk'||c.ctrl==='me'||c.ctrl==='net')){const x=Math.round(mouse.fx*VW),y=Math.round(mouse.fy*VH);
  ctx.fillStyle='#000';ctx.fillRect(x-6,y-1,5,3);ctx.fillRect(x+2,y-1,5,3);ctx.fillRect(x-1,y-6,3,5);ctx.fillRect(x-1,y+2,3,5);
  ctx.fillStyle=c.col;ctx.fillRect(x-5,y,4,1);ctx.fillRect(x+2,y,4,1);ctx.fillRect(x,y-5,1,4);ctx.fillRect(x,y+2,1,4)}}
function drawHud(){const txt=RA.gfx.text;
 const fs=focusCrews();let y=VH-14-Math.min(4,fs.length)*9;
 if(mode===0){txt(ctx,'ENEMIES '+coop.left+(tanks.some(t=>t.kind)?'+':''),VW/2,y,'#fcfcfc');const b=bases[0];if(b&&!b.alive)txt(ctx,'EAGLE DOWN',VW/2,VH/2-20,'#d82800')}
 else if(mode>=2){txt(ctx,[0,1].map(tm=>TEAMN[tm].split(' ')[0]+' '+crews.filter(c=>c.team===tm&&!c.out).length).join('  VS  '),VW/2,y,'#fcfcfc')}
 else{const alive=crews.filter(c=>!c.out).length;txt(ctx,alive+' CREWS LEFT',VW/2,y,'#fcfcfc')}
 for(const c of fs.slice(0,4)){txt(ctx,c.name.slice(0,8)+' LIVES '+c.lives+'  KO '+c.kills,VW/2,(y+=9)+4,c.col)}
 // minimap
 const mw=Math.min(72,Math.round(VW*.16)),mh=Math.round(mw*GH/GW),mx=VW-mw-4,my=VH-mh-4,s=mw/(GW*TS);
 ctx.fillStyle='#000';ctx.fillRect(mx-1,my-1,mw+2,mh+2);ctx.fillStyle='#2c2c34';ctx.fillRect(mx,my,mw,mh);
 for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){const t=typ[tIdx(tx,ty)];if(!t||t===5)continue;ctx.fillStyle=t===1?'#8c3c1c':t===2?'#9c9cac':t===3?'#1c58b8':t===4?'#286c30':'#f8b800';
  ctx.fillRect(mx+Math.floor(tx*TS*s),my+Math.floor(ty*TS*s),Math.max(1,Math.ceil(TS*s)),Math.max(1,Math.ceil(TS*s)))}
 for(const t of tanks){if(t.dead||t.spawnT>0)continue;ctx.fillStyle=t.col;ctx.fillRect(mx+Math.round(t.x*s)-1,my+Math.round(t.y*s)-1,2,2)}
 ctx.fillStyle='rgba(255,255,255,.6)';const rx=mx+Math.round(cam.x*s),ry=my+Math.round(cam.y*s),rw=Math.round(VW/cam.z*s),rh=Math.round(VH/cam.z*s);
 ctx.fillRect(rx,ry,rw,1);ctx.fillRect(rx,ry+rh,rw,1);ctx.fillRect(rx,ry,1,rh);ctx.fillRect(rx+rw,ry,1,rh)}
function camStep(){
 const fs=focusCrews().map(c=>c.tank).filter(Boolean);let pts=fs.length?fs:demo||!crews.length?tanks.filter(t=>!t.dead):[];
 // focused crew between lives: hold the camera where it was instead of jumping to someone else
 if(!pts.length&&!demo&&focusCrews().length&&cam.lt){pts=[cam.lt]}
 if(!pts.length&&fs.length===0&&!demo){const al=tanks.filter(t=>!t.dead&&t.crew>=0);pts=al.length?[al[(Math.floor(tick/600))%al.length]]:[]}
 if(fs.length===1)cam.lt={x:fs[0].x,y:fs[0].y};
 const W=GW*TS,H=GH*TS,fitAll=Math.min(VW/(W+16),VH/(H+16));
 let tx=W/2,ty=H/2,tz=demo?Math.max(fitAll,.6):1;
 if(BS.cam==='whole'&&!demo&&state==='play'){pts=[];tz=Math.min(1.4,fitAll)}
 if(pts.length&&!(demo&&pts.length>2)){let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const t of pts){a=Math.min(a,t.x);b=Math.max(b,t.x);c=Math.min(c,t.y);d=Math.max(d,t.y)}
  tx=(a+b)/2;ty=(c+d)/2;tz=Math.max(Math.min(fitAll,1),Math.min(1.2,VW/(b-a+200),VH/(d-c+150)));
  const me=fs.length===1?fs[0]:null;if(me&&mouse.on&&!touchDev&&!spectating()){tx+=(mouse.fx-.5)*VW/tz*.35;ty+=(mouse.fy-.5)*VH/tz*.35}}
 else if(demo){tz=fitAll<.6?.6:fitAll;tx=W/2+Math.sin(tick*.003)*W*.25;ty=H/2+Math.cos(tick*.004)*H*.2}
 cam.z+=(tz-cam.z)*(cam.snap?1:.08);const vw=VW/cam.z,vh=VH/cam.z;
 const cl=(v,size,view)=>size+32<=view?(size-view)/2:Math.max(-16,Math.min(size-view+16,v));
 const nx=cl(tx-vw/2,W,vw),ny=cl(ty-vh/2,H,vh),k=cam.snap?1:.15;cam.x+=(nx-cam.x)*k;cam.y+=(ny-cam.y)*k;cam.snap=false}

/* ---------- match flow ---------- */
function stepFx(){for(const p of parts){p.t--;if(!p.ring&&!p.flash){p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;p.vz-=.15;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6}}}parts=parts.filter(p=>p.t>0);
 for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.85;if(shake<.4)shake=0;if(grenFlash>0)grenFlash--}
function step(){tick++;
 if(isClient()&&!demo){for(const t of tanks){if(t.tx==null)continue;t.x+=(t.tx-t.x)*.45;t.y+=(t.ty-t.y)*.45;if(t.moving)t.anim+=.5}stepFx();camStep();
  if(mode===1&&crews.filter(c=>!c.out).length===2&&crews.length>2)playTrack(3);return}
 if(state!=='play'){stepFx();camStep();return}
 matchT++;
 for(const c of crews){if(c.tank||c.out)continue;if(--c.respawn<=0){if(c.lives>0){if(spawnCrew(c))c.lives--}else{c.out=true;c.outAt=matchT}}}
 for(const t of tanks){if(t.dead)continue;if(t.kind){if(t.spawnT>0){t.spawnT--;continue}stepTank(t,t.frozen>0?{}:enemyInput(t))}}
 for(const c of crews)if(c.tank&&!c.tank.dead)stepTank(c.tank,readInput(c));
 for(const s of shells)if(!s.dead)stepShell(s);
 shells=shells.filter(s=>!s.dead);tanks=tanks.filter(t=>!t.dead);for(const c of crews)if(c.tank&&c.tank.dead)c.tank=null;
 for(const it of items)it.t--;items=items.filter(i=>i.t>0);
 for(const b of bases)if(b.shovel>0&&--b.shovel===0&&b.alive)fortify(b,1,15);
 if(mode===0){if(coop.left>0&&--coop.spawnT<=0&&tanks.filter(t=>t.kind).length<coop.max){spawnEnemy();coop.spawnT=Math.max(50,150-matchT/90)}
  if(matchT%1500===0)dropItem()}
 else if(matchT%(demo?400:Math.max(240,600-crews.length*20))===0&&items.length<2+Math.floor(crews.length/4))dropItem();
 // ground war: each living base sends an escort tank every 12 s (max 4 per side) that pushes for the enemy eagle
 if(mode===3&&matchT%720===0)for(const b of bases){if(!b.alive||tanks.filter(t=>t.kind&&t.team===b.own).length>=4)continue;
  const k=1+Math.floor(Math.random()*3),x=b.tx*TS+8+(Math.random()<.5?-1:1)*TS*2,y=b.ty*TS+8;if(boxFree(x,y))tanks.push(newTank({kind:k,team:b.own,x,y,dir:b.own?2:0,aim:b.own?Math.PI/2:-Math.PI/2,hp:KIND[k].hp,col:RA.util.mix(TEAMC[b.own],'#888888',.35)}))}
 stepFx();camStep();
 // how does it end?
 let over=false,win=null;
 if(mode===0){const enemies=coop.left+tanks.filter(t=>t.kind).length,b=bases[0],out=crews.every(c=>c.out);
  if(b&&!b.alive||out){over=true}else if(!enemies||BS.len&&matchT>=BS.len*3600){over=true;win='coop'}
  if(!demo&&enemies<=4&&enemies>0)playTrack(3)}
 else if(mode>=2){const at=[0,1].filter(tm=>crews.some(c=>c.team===tm&&!c.out)&&bases[tm]&&bases[tm].alive);
  const lim=BS.len?BS.len*3600:0;
  if(at.length<=1){over=true;win=at.length?{i:200+at[0]}:null}
  else if(lim&&matchT>=lim){const sc=[0,1].map(tm=>crews.filter(c=>c.team===tm).reduce((a,c)=>a+c.kills*10+c.score/100,0));over=true;win=sc[0]===sc[1]?null:{i:200+(sc[0]>sc[1]?0:1)}}}
 else{const alive=crews.filter(c=>!c.out);if(!demo&&alive.length===2&&crews.length>2)playTrack(3);
  if(crews.length>1?alive.length<=1:!alive.length){over=true;win=alive[0]||null}
  else if(matchT>=(BS.len?BS.len*3600:60*60*6)){over=true;win=alive.slice().sort((a,b)=>b.kills-a.kills||b.score-a.score)[0]}}
 if(over){if(demo){startDemo();return}
  // let the last explosion play out, then show the results
  if(!overT)NET.winner=win==='coop'?99:win?win.i:-1;if(++overT>70){overT=0;showOver()}}}
let overT=0;
const SAVE=RA.save('tanks');   // your Battle Town save file
const ACH=RA.achievements('tanks',[
 {id:'first',name:'Recruit',desc:'Finish your first battle',test:s=>s.played>=1,unlock:'title:Recruit'},
 {id:'save',name:'City Saved',desc:'Win a co-op defence',test:(s,m)=>m.coop&&m.won,unlock:'title:Defender'},
 {id:'win1',name:'Last Tank Rolling',desc:'Win a versus battle',test:(s,m)=>!m.coop&&m.won,unlock:'title:Commander'},
 {id:'ko10',name:'Tank Buster',desc:'10 KOs in one battle',test:(s,m)=>m.kills>=10,unlock:'title:Tank Buster'},
 {id:'ko100',name:'Iron Fist',desc:'100 KOs in total',test:s=>s.kills>=100,unlock:'title:Iron Fist'}]);
function showOver(){state='over';
 const w=NET.winner,me=crews[NET.myIdx]||(!isClient()&&crews.find(c=>c.ctrl!=='cpu'));
 if(me){const m={won:mode===0?w===99:w>=200?me.team===w-200:w===me.i,kills:me.kills|0,bestScore:me.score|0,coop:mode===0};SAVE.record(m);ACH.check(m)}$('bcWin').textContent=mode===0?(w===99?'CITY SAVED!':'GAME OVER'):w>=200?(me&&me.team===w-200?'YOUR TEAM WINS!':TEAMN[w-200]+' WINS'):w>=0&&crews[w]?(crews[w]===me?'YOU WIN!':crews[w].name.toUpperCase()+' WINS'):'DRAW';
 const list=crews.slice().sort((a,b)=>mode===0?b.score-a.score:((!b.out)-(!a.out))||(b.outAt-a.outAt)||(b.kills-a.kills));
 $('bcRanks').innerHTML=list.slice(0,10).map((c,k)=>'<li style="animation-delay:'+k*60+'ms"><span class="pos">'+(k+1)+'</span><span style="color:'+c.col+'">'+esc(c.name)+'</span><em>'+c.kills+' KO · '+c.score+'</em></li>').join('');
 $('bcAgain').hidden=isClient();$('bcSetupBtn').hidden=isClient();$('bcOverNote').hidden=!isClient();
 $('bcAgain').textContent=hostOnline()?'BACK TO ROOM':'PLAY AGAIN';$('bcSetupBtn').textContent=R.online?'LEAVE ROOM':'SETUP';
 $('bcOver').hidden=false;root.querySelector('.pad').hidden=true;sfx('pick');
 if(hostOnline())RA.autoBack({still:()=>state==='over'&&hostOnline(),label:n=>$('bcAgain').textContent='BACK TO ROOM ('+n+')',go:()=>$('bcAgain').click()});
 else if(isClient())RA.autoBack({still:()=>state==='over',label:n=>$('bcOverNote').textContent='Back to the room in '+n+'…'})}
function enterPlay(tp){
 document.body.classList.add('playing');document.body.classList.toggle('touchplay',tp);
 document.body.classList.toggle('mouseaim',!touchDev&&(R.online?NET.myIdx>=0:crews.some(c=>c.ctrl==='mk')));
 root.querySelector('.pad').hidden=!tp;for(const id of['bcTitle','bcOver','bcSetup','bcOnlinePanel','bcTabs','bcBack'])$(id).hidden=true;root.querySelectorAll('.bcmode').forEach(e=>e.hidden=true);
 RA.hud.disarm();cam.snap=true;playTrack(1+((NET.matchId>>>0)%2||Math.floor(Math.random()*2)))}
function startLocal(){saveSetup();audio();const n=nSel(),list=[];
 const SEATN=RA.player.seats([...Array(n)].map((_,i)=>$('bcc'+i).value));for(let i=0;i<n;i++)list.push({ctrl:$('bcc'+i).value,name:SEATN[i]});
 NET.myIdx=-1;overT=0;startMatch(list,false);enterPlay(crews.some(c=>c.ctrl==='touch'))}
function startOnline(list){audio();NET.matchId=(Math.random()*1e9)|0;NET.mroster=list.map(x=>x.peer);overT=0;
 let cpu=0;const seats=list.map((x,i)=>x.cpu?{ctrl:'cpu',name:'CPU '+(++cpu)}:{ctrl:x.me?'me':'net',peer:x.peer,name:R.name(R.peer(x.peer),i)});
 NET.myIdx=list.findIndex(x=>x.me);startMatch(seats,false);enterPlay(touchDev)}
function toLobby(){
 document.body.classList.remove('playing','touchplay','mouseaim');root.querySelector('.pad').hidden=true;
 $('bcTitle').hidden=false;$('bcOver').hidden=true;$('bcTabs').hidden=false;$('bcBack').hidden=false;root.querySelectorAll('.bcmode').forEach(e=>e.hidden=false);showBS();$('bcInfo').textContent=R.online?'Room '+R.code:'';
 setTab(onlineTab||R.online);if(R.online)R.render();
 NET.myIdx=-1;overT=0;startDemo();setMode(selMode);music.play('tanks',0);lastTrack=0}
function startDemo(){startMatch([0,1,2,3].map(i=>({ctrl:'cpu',name:'CPU'})),true)}
function playTrack(k){if(k===lastTrack)return;lastTrack=k;music.play('tanks',k)}
function hudInfo(){if(demo||state!=='play')return;const s=(matchT/60)|0,t=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
 $('bcInfo').innerHTML=(R.online?'Room <b>'+R.code+'</b> · ':'')+(isClient()&&NET.myIdx<0?'<b>Watching</b>, you play next round · ':'')+'<b>'+MODES[mode]+'</b> · Time <b>'+t+'</b>'}
function frame(now){
 if(isClient()&&!demo&&state==='play'&&NET.myIdx>=0)clientSend(now);
 if(hostOnline()){const inGame=!demo&&(state==='play'||state==='over');if(inGame)R.broadcast(now,snapshot(),true);else R.broadcast(now,null,false)}
 R.tick(now);
 if(tick%15===0)hudInfo();render()}
// the lobby snapshot carries the host's mode so everyone sees it
const _bc=R.broadcast;R.broadcast=(now,g,inGame)=>{if(!inGame&&R.host&&R.room){if(now-R.lastB<300)return;R.lastB=now;const ids=R.roster().map(pe=>pe.peer);
 R.room.presence({host:1,g:{ph:'lobby',r:ids,cpu:+(root.querySelector('[data-r="cpus"]')||{value:1}).value,md:selMode,bs:BS}}).catch(()=>{});
 if(now-R.lastL>1500&&R.lobby){R.lastL=now;R.lobby.presence({open:{gm:'tanks',c:R.code,n:ids.length,ph:'lobby'}}).catch(()=>{})}return}_bc(now,g,inGame)};

$('bcStart').addEventListener('click',startLocal);
$('bcAgain').addEventListener('click',()=>{if(hostOnline()){toLobby();return}startLocal()});
$('bcSetupBtn').addEventListener('click',()=>{if(R.online)R.leave();else toLobby()});
$('bcBack').addEventListener('click',()=>{if(R.online)R.leave();RA.menu.show()});
setMode(selMode);showBS();setInterval(showBS,500);R.init();

RA.legend(root,{kb:[['W A S D','drive'],['MOUSE','aim turret'],['LMB SPACE','fire'],['C','chat'],['ESC','menu']],
 pad:[['LS','drive'],['RS','aim turret'],['A RB RT','fire'],['BACK','chat'],['START','menu']]});
RA.register({id:'tanks',name:'BATTLE TOWN',kind:'Tank battle',players:'1-20 players',ready:true,el:root,
 desc:'Top-down tank battle in 2.5D. Co-op: guard one eagle against CPU waves. Versus: every crew has an eagle. Team War and Ground War: red vs blue, two eagles, CPU escorts. Host picks turret, lives, power-ups and more.',
 icon:['..........','....kk....','...kggkkkk','...kggkkk.','.kkggggkk.','kggggggggk','kddddddddk','kdkdkdkdkk','.kkkkkkkk.','..........'],
 music:TRACKS,
 enter(){toLobby()},
 leave(){if(R.online)R.leave();state='menu';crews=[];tanks=[];document.body.classList.remove('playing','touchplay','mouseaim')},
 step,frame,onKey,
 onQuit(){if(R.online)R.leave();else toLobby()}});
window.__bc={get crews(){return crews},get tanks(){return tanks},get state(){return state},get mode(){return mode},get shells(){return shells},get items(){return items},get bases(){return bases},
 get map(){return{GW,GH,typ,msk}},step,startLocal,snapshot,applySnap,startOnline,setMode,grab,R,NET,cam};
})();
