/* MAGIC JEWELRY for Retro Arena: falling columns of three jewels, up to 20 boards, built for online rooms.
   Line up three of a kind across, down or diagonally. Chains drop rock rows on a rival; rocks crack back into jewels
   when jewels next to them clear. The magic jewel wipes every jewel of the colour it lands on.
   Multiplayer twists: pick who your rocks hit (random, whoever attacks you, the leader, the weakest board),
   knock a board out to take its KO badges (each one makes your attacks hit harder), boards near the top glow red,
   and sparkling power jewels fill your item slot: Bomb, Shield, Slow for you, or Fog, Speed, Reverse, Jumble on your target.
   Online: the host runs every board, the others send their buttons and draw what the host sends (RA.rooms).
   Everything shared (screen, input, sound, music, rooms, menu) comes from engine/ra.js. */
(()=>{
const {$,esc,touchDev}=RA.util,T=RA.music.track,music=RA.music,sfx=RA.audio.sfx,audio=RA.audio.ensure;
const {touchK,mouse}=RA.input;
const MAXP=20,CS=14;let BW=6,BH=13;                 // well size in cells, cell size in pixels
let BLW=BW*CS+CS+22,BLH=BH*CS+38;
function setSize(w,h){BW=w;BH=h;BLW=BW*CS+CS+22;BLH=BH*CS+38}                           // one board block on screen (well + next box + name + score)
const TM=['RANDOM','ATTACKERS','LEADER','WEAKEST','NEXT IN RING'];
// A cell is colour (low 4 bits: 1-6 jewels, 7 rock, 8 magic) + power (high bits, 1-7). Clear a power jewel to fill your item slot.
const C=v=>v&15,PW=v=>v>>4;
const POW=[null,
 {n:'BOMB',self:1,col:'#fcfcfc',d:'blows away your bottom 3 rows',art:['......y...','.....r....','....kk....','..kkkkkk..','.kkwkkkkk.','.kwkkkkkk.','.kkkkkkkk.','.kkkkkkkk.','..kkkkkk..','...kkkk...']},
 {n:'SHIELD',self:1,col:'#3cbcfc',d:'blocks the next 6 rocks and pranks',art:['.kkkkkkkk.','kccccwccck','kcwccccbck','kccccccbck','kccccccbck','.kcccccbk.','.kcccccbk.','..kcccbk..','...kcbk...','....kk....']},
 {n:'SLOW',self:1,col:'#58f898',d:'your column falls slowly for 10 s',art:['..kkkkkk..','.kwwwwwwk.','kwwwkwwwwk','kwwwkwwwwk','kwwwkkkwwk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kkkkkk..','..........']},
 {n:'FOG',self:0,col:'#bcbcbc',d:'your target plays blind for 10 s',art:['..........','...kkk....','..kwwwkkk.','.kwwwwwwwk','kwwwwwwwwk','kssssssssk','.kkkkkkkk.','..........','.s.s.s.s..','..s.s.s.s.']},
 {n:'SPEED',self:0,col:'#f8b800',d:'your target falls 3x faster for 8 s',art:['.....kkkk.','....kyyk..','...kyyk...','..kyyykkk.','.kyyyyyyk.','.kkkyyyk..','...kyyk...','..kyyk....','..kyk.....','..kk......']},
 {n:'REVERSE',self:0,col:'#f878f8',d:'flips your target\'s left and right for 8 s',art:['..........','..k.......','.kpkkkkkk.','kppppppppk','.kpkkkkkk.','.kkkkkkpk.','kppppppppk','.kkkkkkpk.','.......k..','..........']},
 {n:'JUMBLE',self:0,col:'#e45c10',d:'recolours 8 of your target\'s jewels',art:['.kkkkkkkk.','kwwwwwwwwk','kwkwwwwkwk','kwwwwwwwwk','kwwwkkwwwk','kwwwkkwwwk','kwwwwwwwwk','kwkwwwwkwk','kwwwwwwwwk','.kkkkkkkk.']},
 // party / troll items (survey: wild party)
 {n:'FLIP',self:0,party:1,col:'#3cbcfc',d:'your target\'s well turns upside down for 8 s',art:['....k.....','...kck....','..kccck...','.kkkckkk..','...kck....','...kck....','.kkkckkk..','..kccck...','...kck....','....k.....']},
 {n:'DISCO',self:0,party:1,col:'#f878f8',d:'your target\'s jewels flash every colour for 8 s',art:['...kkkk...','..kppppk..','.kpwpppck.','.kppppcck.','.kppcccck.','.kpcccyyk.','.kcccyyyk.','..kyyyyk..','...kkkk...','....kk....']},
 {n:'ROCKET',self:0,party:1,all:1,col:'#d82800',d:'2 rocks on every other board',art:['....kk....','...kwwk...','...kwwk...','..kwrrwk..','..kwrrwk..','..kwwwwk..','.kkwwwwkk.','kk.kyyk.kk','...kyyk...','....kk....']},
 {n:'GIFT',self:1,party:1,col:'#58d854',d:'a surprise for you: good or bad',art:['..k....k..','.krk..krk.','..kkkkkk..','kkkkrkkkkk','kggggrgggk','kggggrgggk','kggggrgggk','kggggrgggk','kggggrgggk','kkkkkkkkkk']}];
const PCOL={k:'#000',w:'#fcfcfc',r:'#d82800',y:'#f8b800',c:'#3cbcfc',b:'#0058f8',s:'#7c7c7c',p:'#f878f8',g:'#00b800'};

const root=RA.mount(`
  <div class="top">
    <div class="row"><button id="mjBack">◀ GAMES</button><div class="brand">RETRO <b>ARENA</b> · MAGIC JEWELRY</div></div>
    <div class="info" id="mjInfo"></div>
  </div>
  <div class="screen">
    <canvas id="mjCv"></canvas>
    <button class="hudbtn ra-quit">MENU</button>
    <button class="hudbtn ra-mus" aria-label="Music on or off">♪</button>
    <div class="overlay" id="mjTitle">
      <h1>MAGIC JEWELRY</h1>
      <p>Line up three of a kind across, down or diagonally. Chains drop rocks on a rival, and you choose who. Knock boards out to steal their KO badges. Last board standing wins.</p>
    </div>
    <div class="overlay" id="mjOver" hidden>
      <h1 id="mjWin"></h1>
      <ol class="ranks" id="mjRanks"></ol>
      <div class="row"><button class="go" id="mjAgain">PLAY AGAIN</button><button id="mjSetupBtn">SETUP</button></div>
      <p id="mjOverNote" hidden>Waiting for the host…</p>
    </div>
  </div>
  <div class="tabs" id="mjTabs"><button class="tab on" id="mjTabOn">ONLINE</button><button class="tab" id="mjTabLocal">LOCAL</button></div>
  <section class="panel" id="mjOnlinePanel">
    <h2 class="ph">ONLINE · UP TO 20 PLAYERS</h2>
    <div id="mjOnline"></div>
    <div class="row mset" id="mjsetO"><span class="lbl">HOST SETTINGS</span></div>
  </section>
  <section class="panel" id="mjSetup" hidden>
    <h2 class="ph">LOCAL MATCH · ONE SCREEN</h2>
    <div class="row between">
      <div class="row"><span class="lbl">PLAYERS</span>
        <div class="step"><button id="mjMinus" aria-label="Fewer players">−</button><output id="mjN" aria-live="polite">2</output><button id="mjPlus" aria-label="More players">+</button></div>
        <label for="mjCpu">CPU <select id="mjCpu"><option value="0">Easy</option><option value="1" selected>Normal</option><option value="2">Hard</option></select></label></div>
      <button class="go" id="mjStart">START ▶</button>
    </div>
    <div class="row mset" id="mjsetL"></div>
    <div class="list mjslots" id="mjSlots"></div>
    <p class="note" id="mjNote"></p>
  </section>
  <div class="pad" hidden>
    <div class="dpad" role="group" aria-label="Move left and right, down to fall faster, up to drop"><i class="dU">▲</i><i class="dD">▼</i><i class="dL">◀</i><i class="dR">▶</i></div>
    <div class="ab"><button data-k="tgt" class="c">TARGET</button><button data-k="item" class="c">ITEM</button><button data-k="drop" class="b">DROP</button><button data-k="rot" class="a">TURN</button></div>
  </div>`);
root.classList.add('mj');
const cv=$('mjCv'),ctx=cv.getContext('2d');
const SO={el:root.querySelector('.screen'),canvas:cv,whole:true,baseH:BLH+20,minW:2*BLW+8,res:3};
const SCR=RA.screen(SO);

/* ---------- jewel art: drawn once per colour, a different shape per colour so it reads without colour too ---------- */
const JC=[null,['#d82800','#f87858','#880000'],['#00b800','#b8f818','#005800'],['#0058f8','#3cbcfc','#0000a8'],
 ['#f8b800','#fce4a0','#ac7c00'],['#d800cc','#f878f8','#6844fc'],['#e45c10','#fca044','#881400']];
// each jewel is a cut stone: a flat table in the middle, one facet per outline edge, lit from the top left like a pre-rendered PS1 sprite
const NG=n=>Array.from({length:n},(_,i)=>{const a=(i+.5)/n*Math.PI*2-Math.PI/2;return[Math.cos(a)*.98,Math.sin(a)*.98]});
const CUT=[null,
 [[0,-1.05],[1,0],[0,1.05],[-1,0]],                                                    // ruby: diamond
 [[-.5,-.96],[.5,-.96],[.78,-.68],[.78,.68],[.5,.96],[-.5,.96],[-.78,.68],[-.78,-.68]],// emerald: step cut
 NG(12),                                                                              // sapphire: round brilliant
 [[0,-.98],[.98,.82],[-.98,.82]],                                                     // topaz: trillion
 NG(6),                                                                               // amethyst: hexagon
 [[0,-1],[.62,-.15],[.86,.35],[.58,.88],[0,.98],[-.58,.88],[-.86,.35],[-.62,-.15]]];  // amber: pear drop
const JRGB=[null,[226,24,48],[24,200,84],[36,96,248],[250,196,24],[196,56,232],[250,118,24]];
const DITH=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// unlockable jewel sets (achievements): same cuts, other stone colours
const GSET={Pastel:[null,[248,140,160],[150,232,170],[150,180,250],[250,230,150],[220,170,248],[250,190,140]],
 Royal:[null,[150,8,40],[8,110,60],[20,40,160],[200,150,20],[110,20,150],[190,70,10]],
 Neon:[null,[255,40,120],[60,255,90],[40,200,255],[255,255,60],[230,60,255],[255,150,30]]};
// jewels render at 3x (smooth, no dither) and carry _q so they still draw at CS x CS
function gem(c,pal){const Q=3,N=CS*Q,k=document.createElement('canvas');k.width=k.height=N;k._q=Q;const g=k.getContext('2d'),im=g.createImageData(N,N),o=im.data;
 const put=(x,y,r,gg,bb)=>{const q=(y*N+x)*4,d=0;o[q]=Math.max(0,Math.min(255,r+d));o[q+1]=Math.max(0,Math.min(255,gg+d));o[q+2]=Math.max(0,Math.min(255,bb+d));o[q+3]=255};
 if(c===7){for(let Y=0;Y<N;Y++)for(let X=0;X<N;X++){const x=X/Q,y=Y/Q,n=Math.abs(Math.sin(Math.floor(x*2)*12.9+Math.floor(y*2)*78.2)*437.5)%1,edge=x<.6||y<.6||x>CS-.6||y>CS-.6,
   lit=x<1.6||y<1.6?1.35:x>CS-1.6||y>CS-1.6?.6:1,crack=(Math.abs(x-4.3)<.35&&y>3&&y<9)||(Math.abs(y-8.3)<.35&&x>3.6&&x<9);
   const v=edge?30:crack?60:(110+n*40)*lit;put(X,Y,v,v*.96,v*.9)}
  g.putImageData(im,0,0);return k}
 const P=CUT[c],E=P.map((v,i)=>{const w=P[(i+1)%P.length];let nx=w[1]-v[1],ny=v[0]-w[0];const l=Math.hypot(nx,ny);nx/=l;ny/=l;let cc=nx*v[0]+ny*v[1];if(cc<0){nx=-nx;ny=-ny;cc=-cc}return[nx,ny,cc]});
 const L=[-.5,-.68,.53],base=(pal||JRGB)[c];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=((x+.5)/N*2-1)/.99,v=((y+.5)/N*2-1)/.99;let d=0,f=0;
  E.forEach((e,i)=>{const t=(e[0]*u+e[1]*v)/e[2];if(t>d){d=t;f=i}});if(d>1.03)continue;
  let Nv=d<.5?[0,0,1]:[E[f][0]*.8,E[f][1]*.8,.6];const nl=Math.hypot(...Nv);
  let sh=.3+1.0*Math.max(0,(Nv[0]*L[0]+Nv[1]*L[1]+Nv[2]*L[2])/nl);sh*=1.1-.22*d;
  if(d>.84)sh*=.42;                                                   // dark girdle so every stone reads on any background
  const hl=d<.5&&Math.hypot(u+.18,v+.2)<.17?1:0;                       // specular glint on the table
  const w=Math.max(0,sh-1)*200+hl*255;put(x,y,base[0]*sh+w,base[1]*sh+w,base[2]*sh+w)}
 g.putImageData(im,0,0);return k}
let GEM=[null,1,2,3,4,5,6,7].map(c=>c&&gem(c));const GEM0=GEM,GEMS={};
const gemSet=n=>GSET[n]?GEMS[n]||(GEMS[n]=[null,1,2,3,4,5,6,7].map(c=>c&&gem(c,c<7?GSET[n]:null))):GEM0;
const FRAMES={Silver:'#d8dce8',Ruby:'#e02848'};
// a board's equipped look: mine from the save, online guests from their room presence
function lookOf(b){if(!b||b.ctrl==='cpu')return{};if(b.peer)return R.look(b.peer);return RA.look('jewels')}

/* ---------- sound + music ---------- */
RA.audio.add('gem',(AC,now,g,ch)=>{const base=520*Math.pow(1.19,Math.min(8,(ch|1)-1));
 [0,.06,.12].forEach((d,i)=>{const o=AC.createOscillator(),v=AC.createGain();o.type='square';o.frequency.value=base*[1,1.26,1.5][i];
  v.gain.setValueAtTime(.06,now+d);v.gain.exponentialRampToValueAtTime(.001,now+d+.16);o.connect(v);v.connect(g);o.start(now+d);o.stop(now+d+.18)})});
RA.audio.add('land',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(70,now+.07);
 g.gain.setValueAtTime(.18,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);o.connect(g);o.start();o.stop(now+.1)});
RA.audio.add('turn',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.value=1100;g.gain.setValueAtTime(.03,now);g.gain.exponentialRampToValueAtTime(.001,now+.03);o.connect(g);o.start();o.stop(now+.04)});
RA.audio.add('rock',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;f.type='lowpass';f.frequency.value=260;
 g.gain.value=.5;s.connect(f);f.connect(g);s.start()});
RA.audio.add('magic',(AC,now,g)=>{for(let i=0;i<8;i++){const o=AC.createOscillator(),v=AC.createGain();o.type='triangle';o.frequency.value=660*Math.pow(1.12,i);
 v.gain.setValueAtTime(0,now+i*.05);v.gain.linearRampToValueAtTime(.06,now+i*.05+.02);v.gain.linearRampToValueAtTime(0,now+i*.05+.2);o.connect(v);v.connect(g);o.start(now+i*.05);o.stop(now+i*.05+.22)}});
// 0 = lobby, 1-2 = match, 3 = Final Showdown (two boards left, or a fast solo run)
const TRACKS=[
 T('Magic Column',112,['C','Am','Dm','G'],'k...h...s...h.h.',
  'e5 - - g5 - - c6 - b5 - g5 - e5 - - - a4 - c5 - e5 - a5 - - - g5 - e5 - - - f5 - - a5 - - d6 - c6 - a5 - f5 - - - g5 - b5 - d6 - - - b5 - g5 - d5 - - -'),
 T('Treasure Drop',140,['Am','F','G','E'],'k.h.s.h.k.k.s.h.',
  'a4 . c5 . e5 . a5 - g5 . e5 . c5 . d5 . f5 . a5 . c6 - a5 . f5 . e5 . d5 - . . g5 . b5 . d6 - b5 . g5 . f5 . e5 . d5 . e5 - g#5 - b5 - e6 - d6 . b5 . g#5 - - .'),
 T('Gem Cascade',160,['Dm','Bb','C','A'],'k.hhs.hhk.hhs.hk',
  'd5 d5 f5 . a5 . d6 . c6 . a5 . f5 . e5 . d5 - bb4 - d5 - f5 - bb5 - a5 - f5 - d5 - c5 . e5 . g5 . c6 . bb5 . g5 . e5 . c5 . c#5 - e5 - a5 - c#6 - e6 - - - a5 - - .'),
 T('Final Showdown',176,['Em','C','D','B'],'k.hsk.hsk.hsk.ss',
  'e5 . e5 . g5 e5 . b5 . a5 g5 . f#5 . e5 . c5 . e5 . g5 c5 . c6 . b5 g5 . e5 . c5 . d5 . f#5 . a5 d5 . d6 . c6 a5 . f#5 . d5 . b4 - d#5 - f#5 - b5 - a5 - f#5 - d#5 - b4 -')];

/* ---------- setup ---------- */
const BASE=[['Red','#d82800'],['Blue','#0078f8'],['Gold','#f8b800'],['Green','#00b800'],['Pink','#f878f8'],['Cyan','#00e8d8'],['Orange','#e45c10'],['Violet','#6844fc'],['Gray','#bcbcbc'],['Mint','#58f898']];
const COLORS=Array.from({length:MAXP},(_,i)=>[i<10?BASE[i][0]:BASE[i%10][0]+' 2',BASE[i%10][1]]);
const CTRL=[['mk','Mouse + keys'],['k2','Keys IJKL'],['k3','Arrow keys'],['k4','Numpad'],['touch','Touch buttons'],['gp0','Gamepad 1'],['gp1','Gamepad 2'],['gp2','Gamepad 3'],['gp3','Gamepad 4'],['cpu','CPU']];
const KEYS={
 mk:{KeyA:'left',KeyD:'right',KeyS:'down',KeyW:'rot',Space:'drop',KeyE:'tgt',KeyQ:'item',KeyF:'item'},
 k2:{KeyJ:'left',KeyL:'right',KeyK:'down',KeyI:'rot',KeyU:'drop',KeyO:'tgt',KeyH:'item'},
 k3:{ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rot',Period:'drop',Slash:'tgt',Comma:'item'},
 k4:{Numpad4:'left',Numpad6:'right',Numpad5:'down',Numpad8:'rot',Numpad0:'drop',Numpad1:'tgt',Numpad3:'item'}};
const HOWTO=touchDev?'Touch: slide on the pad to move, down falls faster, up or DROP drops the column, TURN rotates it, TARGET picks who your rocks hit, ITEM fires your power-up.'
 :'Keys + mouse: A/D slide the column, click or W to rotate, right-click or Space to drop, S falls faster, E picks who your rocks hit (random, attackers, leader, weakest), Q or F fires your power-up. Clearing jewels and chains sends grey rock rows to the board you target; rocks sent to you show as INCOMING above your well and rise from the bottom. Gamepad: stick moves, A/B rotate, up or X drops, Y targets, RB fires the power-up, Back chat, Start menu.';
let saved=null;try{saved=JSON.parse(localStorage.getItem('mj-setup'))}catch(e){}
// your Magic Jewelry save file; the old device-only best score moves into it
const SAVE=RA.save('jewels');let best=0;try{best=+localStorage.getItem('mj-best')||0}catch(e){}
const ACH=RA.achievements('jewels',[
 {id:'first',name:'Polished',desc:'Finish your first game',test:s=>s.played>=1,unlock:['title:Polished','frame:Silver']},
 {id:'win1',name:'Crown Jewel',desc:'Win a versus match',test:s=>s.wins>=1,unlock:['title:Crown Jewel','burst:Stardust']},
 {id:'s5k',name:'Treasure Hunter',desc:'Score 5,000 in one game',test:(s,m)=>m.bestScore>=5000,unlock:['title:Treasure Hunter','gems:Pastel']},
 {id:'s20k',name:'Jeweller',desc:'Score 20,000 in one game',test:(s,m)=>m.bestScore>=20000,unlock:['title:Jeweller','gems:Royal']},
 {id:'lv10',name:'Deep Mine',desc:'Reach level 10',test:(s,m)=>m.bestLevel>=10,unlock:['title:Deep Miner','gems:Neon']},
 {id:'ko3',name:'Rock Thrower',desc:'3 KOs in one match',test:(s,m)=>m.ko>=3,unlock:['title:Rock Thrower','frame:Ruby']}]);
const syncBest=()=>{best=Math.max(best,SAVE.stats.bestScore|0)};syncBest();SAVE.ready.then(syncBest);
$('mjSlots').innerHTML=COLORS.map((c,i)=>'<div class="slot" id="mjs'+i+'"><span class="chip" style="background:'+c[1]+'">'+(i+1)+'</span><select id="mjc'+i+'" aria-label="'+c[0]+' controls">'+CTRL.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select></div>').join('');
for(let i=0;i<MAXP;i++)$('mjc'+i).value=(saved&&saved.c&&saved.c[i])||(i===0?(touchDev?'touch':'mk'):'cpu');
$('mjN').textContent=String(saved&&saved.n||2);if(saved&&saved.cpu!=null)$('mjCpu').value=saved.cpu;
$('mjNote').textContent=HOWTO+' Extra players on one keyboard: IJKL + U drop, O target, H item · Arrows + . drop, / target, comma item · Numpad 4 6 5, 8 rotate, 0 drop, 1 target, 3 item. 1 player = endless mode, chase your best score.';
const nSel=()=>+$('mjN').textContent;
function syncSlots(){const n=nSel();$('mjMinus').disabled=n<=1;$('mjPlus').disabled=n>=MAXP;for(let i=0;i<MAXP;i++)$('mjs'+i).hidden=i>=n}
function saveSetup(){try{localStorage.setItem('mj-setup',JSON.stringify({n:nSel(),cpu:$('mjCpu').value,c:[...Array(MAXP).keys()].map(i=>$('mjc'+i).value),tab:onlineTab}))}catch(e){}}
$('mjMinus').addEventListener('click',()=>{$('mjN').textContent=Math.max(1,nSel()-1);syncSlots();saveSetup()});
$('mjPlus').addEventListener('click',()=>{$('mjN').textContent=Math.min(MAXP,nSel()+1);syncSlots();saveSetup()});
$('mjSlots').addEventListener('change',saveSetup);$('mjCpu').addEventListener('change',saveSetup);
let onlineTab=!(saved&&saved.tab===false);
function setTab(on){onlineTab=on;$('mjTabOn').classList.toggle('on',on);$('mjTabLocal').classList.toggle('on',!on);$('mjOnlinePanel').hidden=!on;$('mjSetup').hidden=on;saveSetup()}
$('mjTabOn').addEventListener('click',()=>setTab(true));$('mjTabLocal').addEventListener('click',()=>setTab(false));
syncSlots();

/* ---------- host match settings (survey: host picks size, speed, length, modes, items, targeting) ---------- */
const MSET=[['mode','Mode',[['ffa','Everyone vs everyone'],['teams','2 teams'],['royale','Battle royale'],['coop','Co-op score attack'],['race','Race to 150 jewels']]],
 ['size','Board',[['6x13','6×13 classic'],['8x13','8×13 wide'],['10x15','10×15 huge']]],
 ['speed','Speed',[['n','Normal'],['f','Faster sooner'],['c','Slower, chill']]],
 ['len','Time limit',[[0,'None'],[2,'2 min'],[5,'5 min'],[10,'10 min']]],
 ['pow','Power jewels',[['all','All'],['self','Self-help only'],['troll','Troll only'],['off','Off']]],
 ['party','Party items',[[1,'On'],[0,'Off']]],
 ['tgt','Targeting',[['pick','Players pick'],['rand','Always random'],['lead','Always the leader'],['ring','Ring: next player']]]];
let CFG={mode:'ffa',size:'6x13',speed:'n',len:0,pow:'all',party:1,tgt:'pick'};
try{Object.assign(CFG,JSON.parse(localStorage.getItem('mj-mset')||'{}'))}catch(e){}
let M={...CFG};
const TEAMC=['#f04848','#4890f8'],TEAMN=['RED TEAM','BLUE TEAM'];
for(const pre of['L','O'])$('mjset'+pre).insertAdjacentHTML('beforeend',MSET.map(([k,t,o])=>'<label>'+t+' <select id="mj'+pre+k+'">'+
 o.map(([v,l])=>'<option value="'+v+'"'+(String(CFG[k])===String(v)?' selected':'')+'>'+l+'</option>').join('')+'</select></label>').join(''));
for(const[k]of MSET)for(const pre of['L','O'])$('mj'+pre+k).addEventListener('change',e=>{const v=e.target.value;CFG[k]=isNaN(+v)?v:+v;
 for(const q of['L','O'])$('mj'+q+k).value=v;try{localStorage.setItem('mj-mset',JSON.stringify(CFG))}catch(_){}});
const lockedTm=()=>({rand:0,lead:2,ring:4})[M.tgt];
const foe=(b,o)=>o!==b&&o.alive&&(M.mode!=='teams'||o.team!==b.team);

/* ---------- online room ---------- */
const NET={matchId:0,mroster:[],ev:[],es:0,seen:0,winner:-1,myIdx:-1,mc:-1,rc:0,dc:0,tc:0,prev:{},out:[],os:0,incSeen:0};
const R=RA.rooms({game:'jewels',el:$('mjOnline'),colors:COLORS,max:MAXP,minPlayers:2,cpus:1,
 note:'Up to 20 players per room, CPUs fill empty seats. Friends need to be signed in to claude.ai and have this page shared with them. '+HOWTO,
 controls:HOWTO,onStart:startOnline,onState:applySnap,onLeave:()=>{if(!RA.menu.open&&RA.menu.current&&RA.menu.current.id==='jewels')toLobby()}});
const isClient=()=>R.online&&!R.host;
const hostOnline=()=>R.online&&R.host;

/* ---------- the game ---------- */
let boards=[],state='menu',tick=0,matchT=0,parts=[],texts=[],lay=null,demo=true,lastTrack=-1;
const rnd6=()=>1+Math.floor(Math.random()*6);
function powPool(solo){if(M.pow==='off')return[];const out=[];for(let t=1;t<POW.length;t++){const P=POW[t];if(P.party&&!M.party)continue;if(solo&&!P.self)continue;
  if(M.mode==='coop'&&!P.self&&!P.all)continue;if(M.pow==='self'&&!P.self)continue;if(M.pow==='troll'&&P.self&&!P.party)continue;out.push(t)}return out}
function newPiece(lvl,b){if(Math.random()<(lvl>=2?.03:0))return[8,8,8];const j=[rnd6(),rnd6(),rnd6()];
 if(b&&!demo){const solo=boards.length===1,behind=!solo&&(height(b)>=8||b.score<=Math.min(...boards.filter(o=>o.alive).map(o=>o.score)));
  const pool=powPool(solo);if(pool.length&&Math.random()<(solo?.07:behind?.22:.11)){const t=pool[Math.floor(Math.random()*pool.length)];j[Math.floor(Math.random()*3)]|=t<<4}}
 return j}
function makeBoard(i,ctrl,name,peer){return{i,ctrl,name,peer:peer||'',col:COLORS[i][1],g:new Uint8Array(BW*BH),pc:null,next:newPiece(1),team:i,ph:'spawn',t:20,chain:0,
 score:0,jewels:0,lvl:1,garb:0,alive:true,outAt:0,mark:null,das:0,dasDir:0,lock:0,lockN:0,soft:false,prev:{},mcol:null,shake:0,bot:null,
 tm:ctrl==='cpu'?Math.floor(Math.random()*4):0,tg:-1,ko:0,lastBy:-1,lr:0,ld:0,lt:0,li:0,lmc:-2,item:0,itemT:0,fx:{fog:0,speed:0,rev:0,slow:0,shield:0,flip:0,disco:0}}}
const CPU=[{react:14,noise:60,drop:0},{react:7,noise:18,drop:.3},{react:3,noise:3,drop:.8}];
function startMatch(list,isDemo){
 demo=!!isDemo;if(hostOnline())SY.reset();M=demo?{...CFG,mode:'ffa',len:0,size:'6x13',tgt:'pick'}:{...CFG};const sz=M.size.split('x');setSize(+sz[0]||6,+sz[1]||13);
 boards=list.map((d,i)=>makeBoard(i,d.ctrl,d.name,d.peer));for(const b of boards){b.team=M.mode==='teams'?b.i%2:b.i;if(M.mode==='teams')b.col=TEAMC[b.team];if(lockedTm()!=null)b.tm=lockedTm()}NET.royT=0;tick=0;matchT=0;parts=[];texts=[];lastTrack=-1;NET.ev=[];NET.winner=-1;NET.wl='';
 const cl=CPU[+$('mjCpu').value]||CPU[1];for(const b of boards){b.cpu=isDemo?CPU[1]:cl;b.tg=pickTarget(b)}
 state='play';layout();
}
function enterPlay(tp){
 document.body.classList.add('playing');document.body.classList.toggle('touchplay',tp);
 document.body.classList.toggle('mouseaim',!touchDev&&boards.some(b=>b.ctrl==='mk'||b.ctrl==='me'||b.i===NET.myIdx));
 root.querySelector('.pad').hidden=!tp;$('mjTitle').hidden=true;$('mjOver').hidden=true;$('mjSetup').hidden=true;$('mjOnlinePanel').hidden=true;$('mjTabs').hidden=true;$('mjBack').hidden=true;
 RA.hud.disarm();layout();playTrack(1+((NET.matchId>>>0)%2||Math.floor(Math.random()*2)))}
function startLocal(){saveSetup();audio();const n=nSel(),list=[];
 const SEATN=RA.player.seats([...Array(n)].map((_,i)=>$('mjc'+i).value));for(let i=0;i<n;i++)list.push({ctrl:$('mjc'+i).value,name:SEATN[i]});
 NET.myIdx=-1;startMatch(list,false);enterPlay(boards.some(b=>b.ctrl==='touch'))}
function startOnline(list){audio();NET.matchId=(Math.random()*1e9)|0;NET.mroster=list.map(x=>x.peer);
 let cpu=0;const seats=list.map((x,i)=>x.cpu?{ctrl:'cpu',name:'CPU '+(++cpu)}:{ctrl:x.me?'me':'net',peer:x.peer,name:R.name(R.peer(x.peer),i)});
 NET.myIdx=list.findIndex(x=>x.me);startMatch(seats,false);enterPlay(touchDev)}
function toLobby(){
 document.body.classList.remove('playing','touchplay','mouseaim');root.querySelector('.pad').hidden=true;
 $('mjTitle').hidden=false;$('mjOver').hidden=true;$('mjTabs').hidden=false;$('mjBack').hidden=false;$('mjInfo').textContent=R.online?'Room '+R.code:'';
 setTab(onlineTab||R.online);if(R.online)R.render();
 NET.myIdx=-1;startDemo();music.play('jewels',0);lastTrack=0}
function startDemo(){startMatch([{ctrl:'cpu',name:'CPU'},{ctrl:'cpu',name:'CPU'}],true)}
function playTrack(k){if(k===lastTrack)return;lastTrack=k;music.play('jewels',k)}

/* effects: played here, and sent to everyone in the room by the host */
const focus=b=>b&&(b.i===NET.myIdx||(NET.myIdx<0&&b.ctrl!=='cpu'&&b.ctrl!=='net')||(NET.myIdx<0&&boards.every(o=>o.ctrl==='cpu')&&b.i===0));
function ev(k,bi,a){if(!hostOnline()||demo)return;NET.ev.push([++NET.es,k,bi,a]);if(NET.ev.length>24)NET.ev.shift()}
function noise(t,a,b,all){if(!demo&&(all||focus(b)))sfx(t,a);ev('s',b?b.i:-1,[t,a|0,all?1:0])}
function say(b,s,col,y){if(demo)return;texts.push({b:b.i,x:BW*CS/2,y,s,t:60,col});ev('x',b.i,[s,col,y])}
function fly(a,c){for(let k=0;k<6;k++)parts.push({fly:1,from:a,to:c,t:30+k*3,k:30+k*3});ev('f',a,c)}

const at=(b,x,y)=>b.g[y*BW+x];
function canAt(b,x,y){if(x<0||x>=BW)return false;for(let r=Math.floor(y);r<=Math.ceil(y)+2;r++){if(r>=BH)return false;if(r>=0&&b.g[r*BW+x])return false}return true}
function height(b){for(let r=0;r<BH;r++)for(let x=0;x<BW;x++)if(b.g[r*BW+x])return BH-r;return 0}
function shift(b,d){const pc=b.pc;if(pc&&canAt(b,pc.x+d,pc.y)){pc.x+=d;if(b.lock>0&&b.lockN++<12)b.lock=0;noise('turn',0,b)}}
function rotate(b){const j=b.pc.j;b.pc.j=[j[2],j[0],j[1]];noise('turn',0,b)}
function findMatches(g){const m=new Uint8Array(BW*BH);let n=0;
 for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const c=g[y*BW+x]&15;if(c<1||c>6)continue;
  for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){const px=x-dx,py=y-dy;if(px>=0&&px<BW&&py>=0&&py<BH&&(g[py*BW+px]&15)===c)continue;
   let L=1;for(;;){const nx=x+dx*L,ny=y+dy*L;if(nx<0||nx>=BW||ny<0||ny>=BH||(g[ny*BW+nx]&15)!==c)break;L++}
   if(L>=3)for(let k=0;k<L;k++){const q=(y+dy*k)*BW+x+dx*k;if(!m[q]){m[q]=1;n++}}}}
 return{m,n}}
function collapse(g){for(let x=0;x<BW;x++){let w=BH-1;for(let y=BH-1;y>=0;y--){const c=g[y*BW+x];if(c){g[y*BW+x]=0;g[w*BW+x]=c;w--}}}}

/* targeting: who your rocks hit */
function pickTarget(b){const foes=boards.filter(o=>foe(b,o));if(!foes.length)return -1;let c=foes;
 if(b.tm===4){for(let k=1;k<boards.length;k++){const o=boards[(b.i+k)%boards.length];if(foe(b,o))return o.i}}
 if(b.tm===1){const a=foes.filter(o=>o.tg===b.i);if(a.length)c=a}
 else if(b.tm===2){const m=Math.max(...foes.map(o=>o.score));c=foes.filter(o=>o.score===m)}
 else if(b.tm===3){const h=foes.map(height),m=Math.max(...h);c=foes.filter((o,k)=>h[k]===m)}
 return c[Math.floor(Math.random()*c.length)].i}
const attackers=b=>boards.filter(o=>o.alive&&o!==b&&o.tg===b.i).length;

function topout(b){b.alive=false;b.pc=null;b.ph='dead';b.t=0;b.outAt=tick;b.shake=14;noise('boom',24,b,true);say(b,'OUT',COLORS[0][1],60);
 const k=boards[b.lastBy];
 if(k&&k!==b&&k.alive){k.ko+=1+b.ko;say(k,'KO!','#f8b800',30);noise('pick',0,k,true)}
 for(const o of boards)if(o.alive&&o.tg===b.i)o.tg=pickTarget(o)}
function land(b){const pc=b.pc,fy=Math.floor(pc.y);b.pc=null;noise('land',0,b);
 for(let k=0;k<3;k++)if(fy+k<0){topout(b);return}
 for(let k=0;k<3;k++)b.g[(fy+k)*BW+pc.x]=pc.j[k];
 if(pc.j[0]===8){const below=fy+3<BH?C(at(b,pc.x,fy+3)):0,m=new Uint8Array(BW*BH);let n=0;
  for(let k=0;k<3;k++)m[(fy+k)*BW+pc.x]=1;
  if(below>=1&&below<=6)for(let q=0;q<BW*BH;q++)if(C(b.g[q])===below){m[q]=1;n++}
  b.mark=m;b.chain=1;b.ph='clear';b.t=0;b.magic=n;noise('magic',0,b,true);
  if(n)say(b,'MAGIC!','#f8b800',50);return}
 check(b)}
function check(b){const f=findMatches(b.g);
 if(f.n){b.chain++;b.mark=f.m;b.ph='clear';b.t=0;b.magic=0;noise('gem',b.chain,b);
  if(b.chain>=2)say(b,b.chain+' CHAIN!',b.chain>=4?'#f878f8':'#3cbcfc',40)}
 else{b.chain=0;b.ph='spawn';b.t=4}}
function clearMarked(b){const g=b.g,m=b.mark;let n=0;
 for(let q=0;q<BW*BH;q++)if(m[q]){const v=g[q],c=C(v);g[q]=0;n++;const x=q%BW,y=(q/BW)|0;
  if(!demo||parts.length<200)burst(b.i,x,y,c);
  if(PW(v))gainItem(b,PW(v));
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<BW&&ny>=0&&ny<BH&&g[ny*BW+nx]===7&&!m[ny*BW+nx])g[ny*BW+nx]=rnd6()}}
 b.mark=null;const pts=(n-(b.magic?3:0))*10*b.chain*b.lvl+(b.magic?500:0);b.score+=Math.max(0,pts);b.jewels+=n;
 if(pts>0)say(b,'+'+pts,'#fcfcfc',96);
 // attack: chains and big clears drop rock rows; KO badges add 25% each; your own incoming rocks are cancelled first
 let rows=(b.chain>=2?b.chain-1:0)+(n>=6?1:0)+(b.magic&&b.magic>=6?1:0);
 if(rows&&boards.length>1){rows+=Math.floor(rows*.25*Math.min(8,b.ko));if(b.tm===1&&attackers(b)>=2)rows++;
  const c=Math.min(rows,b.garb);b.garb-=c;rows-=c;
  let o=boards[b.tg];if(!o||!foe(b,o)){b.tg=pickTarget(b);o=boards[b.tg]}
  if(rows&&o&&M.mode!=='coop'){fly(b.i,o.i);hit(o,'g',rows,b.i)}
  if(b.tm===0)b.tg=pickTarget(b)}
 collapse(b.g);b.ph='settle';b.t=0}
function gainItem(b,t){if(b.item){b.score+=150;say(b,'+150','#fcfcfc',86);return}
 b.item=t;b.itemT=60+Math.floor(Math.random()*150);noise('pick',0,b);say(b,'GOT '+POW[t].n,POW[t].col,86)}
// fire the item: self power-ups help you, the rest hit your current target (a Shield on them blocks it)
function useItem(b){const t=b.item;if(!t)return;b.item=0;const P=POW[t];
 if(P.self){if(t===1){for(let k=0;k<3*BW;k++){const q=(BH-1)*BW-k+BW-1;if(b.g[q])burst(b.i,q%BW,(q/BW)|0,C(b.g[q]))}
   b.g.copyWithin(3*BW,0,(BH-3)*BW);b.g.fill(0,0,3*BW);b.shake=12;noise('boom',24,b,true);say(b,'BOOM!','#fcfcfc',60)}
  else if(t===11){const g=[1,2,3,4,5,6,7,8][Math.floor(Math.random()*8)];if(g<=3){b.item=g;useItem(b)}else{applyHit(b,'i',g,b.i);say(b,'OOPS!','#58d854',50)}}
  else if(t===2){b.fx.shield=6;noise('sel',0,b);say(b,'SHIELD UP','#3cbcfc',60)}
  else{b.fx.slow=600;noise('sel',0,b);say(b,'SLOW TIME','#58f898',60)}
  return}
 if(P.all){for(const o of boards)if(foe(b,o)){fly(b.i,o.i);hit(o,'g',2,b.i)}say(b,P.n+'!',P.col,76);return}
 let o=boards[b.tg];if(!o||!foe(b,o)){b.tg=pickTarget(b);o=boards[b.tg]}if(!o)return;
 fly(b.i,o.i);hit(o,'i',t,b.i);say(b,P.n+' SENT',P.col,76)}
/* Online, every player runs their own board here with no delay. A hit on a board this device does not run
   travels instead: a guest sends it to the host, the host passes it on to the board's owner in the snapshot. */
const owned=b=>isClient()?b.i===NET.myIdx:b.ctrl!=='net';
const SY=RA.sync({owns:i=>!!boards[i]&&owned(boards[i]),host:()=>hostOnline(),onHit:(i,k,v,by)=>boards[i]&&applyHit(boards[i],k,v|0,by)});
const hit=(o,k,v,by)=>SY.hit(o.i,k,k==='g'?Math.max(0,Math.min(30,v|0)):Math.max(0,Math.min(15,v|0)),by);
function applyHit(o,k,v,by){if(!o.alive)return;
 if(k==='g'){let rows=v;const blk=Math.min(rows,o.fx.shield);if(blk){o.fx.shield-=blk;rows-=blk;say(o,'BLOCKED','#3cbcfc',70)}
  if(rows){o.garb+=rows;o.lastBy=by;const fb=boards[by];say(o,rows+(rows>1?' ROCKS':' ROCK')+(fb&&fb!==o?' FROM '+fb.name.slice(0,8):''),'#ff5030',70)}return}
 const t=v,P=POW[t];if(!P)return;
 if(o.fx.shield>0){o.fx.shield=Math.max(0,o.fx.shield-2);say(o,'BLOCKED','#3cbcfc',60);return}
 if(t===4)o.fx.fog=600;else if(t===5)o.fx.speed=480;else if(t===6)o.fx.rev=480;else if(t===8)o.fx.flip=480;else if(t===9)o.fx.disco=480;
 else{const js=[];for(let q=0;q<BW*BH;q++){const c=C(o.g[q]);if(c>=1&&c<=6)js.push(q)}
  for(let k2=0;k2<8&&js.length;k2++){const q=js.splice(Math.floor(Math.random()*js.length),1)[0];o.g[q]=rnd6()|(o.g[q]&0xf0)}}
 noise('magic',0,o,true);say(o,P.n+'!',P.col,60)}
function burst(bi,x,y,c){for(let k=0;k<4;k++)parts.push({b:bi,x:x*CS+CS/2,y:y*CS+CS/2,vx:(Math.random()-.5)*2.4,vy:-Math.random()*2.2,t:28,col:boards[bi]&&boards[bi]._bu==='Stardust'?(k&1?'#fff8c0':'#fcfcfc'):(c&15)>=1&&(c&15)<=6?JC[c&15][1]:'#fcfcfc'})}
function addRocks(b){const n=Math.min(3,b.garb);if(!n)return;b.garb-=n;b.shake=10;noise('rock',0,b);
 for(let k=0;k<n;k++){for(let x=0;x<BW;x++)if(b.g[x]){topout(b);return}
  b.g.copyWithin(0,BW);for(let x=0;x<BW;x++)b.g[(BH-1)*BW+x]=7}}
function spawn(b){addRocks(b);if(!b.alive)return;
 const mx=Math.floor((BW-1)/2);if(at(b,mx,0)){topout(b);return}
 b.pc={x:mx,y:-2,j:b.next};b.next=newPiece(b.lvl,b);b.lock=0;b.lockN=0;b.ph='fall';b.bot=null}
const speed=b=>Math.min(.45,(M.speed==='c'?.014:.02)*Math.pow(M.speed==='f'?1.3:M.speed==='c'?1.13:1.2,b.lvl-1))*(b.fx.speed>0?3:1)*(b.fx.slow>0?.4:1);
function stepBoard(b){
 if(b.shake>0)b.shake--;
 if(!b.alive){b.t++;return}
 b.lvl=Math.min(20,1+Math.floor(b.jewels/24)+(boards.length>1?Math.floor(matchT/(60*40)):0));
 if(b.tm&&tick%60===b.i)b.tg=pickTarget(b);
 const F=b.fx;for(const k of['fog','speed','rev','slow','flip','disco'])if(F[k]>0)F[k]--;
 const inp=readInput(b);if(inp.gone){topout(b);return}
 if(inp.item&&!b.prev.item||inp.nitem)useItem(b);
 if((inp.tgt&&!b.prev.tgt||inp.ntgt)&&lockedTm()==null){b.tm=(b.tm+(inp.ntgt||1))%4;b.tg=pickTarget(b);noise('sel',0,b);say(b,TM[b.tm],'#3cbcfc',112)}
 if(b.ph==='spawn'){b.prev=inp;if(--b.t<=0)spawn(b);return}
 if(b.ph==='clear'){b.prev=inp;if(++b.t>=22)clearMarked(b);return}
 if(b.ph==='settle'){b.prev=inp;if(++b.t>=6)check(b);return}
 if(b.ph!=='fall'||!b.pc){b.prev=inp;return}
 control(b,inp);
 const pc=b.pc;if(!pc)return;
 const fy=Math.floor(pc.y),sp=b.soft?Math.max(speed(b),.5):speed(b);
 if(canAt(b,pc.x,fy+1)){const ny=Math.min(pc.y+sp,fy+1);if(b.soft&&Math.floor(ny)>fy)b.score++;pc.y=ny;if(Math.floor(pc.y)>fy)b.lock=0}
 else{pc.y=fy;if(++b.lock>=(b.soft?3:30))land(b)}
}
function hardDrop(b){const pc=b.pc;let n=0;pc.y=Math.floor(pc.y);while(canAt(b,pc.x,pc.y+1)){pc.y++;n++}b.score+=n*2;land(b)}
function control(b,inp){const pr=b.prev;b.prev=inp;const pc=b.pc;
 const nr=(inp.rot&&!pr.rot?1:0)+(inp.nrot|0);for(let k=0;k<nr%3;k++)rotate(b);
 const dir=((inp.right?1:0)-(inp.left?1:0))*(b.fx.rev>0?-1:1);
 if(dir){b.mcol=null;if(dir!==b.dasDir){b.dasDir=dir;b.das=0;shift(b,dir)}else if(++b.das>=10&&(b.das-10)%2===0)shift(b,dir)}
 else{b.dasDir=0;if(b.mcol!=null&&tick%2===0){const want=b.fx.rev>0?BW-1-b.mcol:b.mcol;if(want!==pc.x)shift(b,Math.sign(want-pc.x))}}
 b.soft=!!inp.down;
 if(inp.drop&&!pr.drop||inp.ndrop)hardDrop(b)}

/* ---------- input ---------- */
const BITS=['left','right','down','rot','drop','tgt','item'];
const toBits=o=>BITS.reduce((v,k,i)=>v|(o[k]?1<<i:0),0),fromBits=v=>{const o={};BITS.forEach((k,i)=>{if(v&(1<<i))o[k]=true});return o};
let mLast=-1;
function mouseCol(i){if(true||touchDev||!mouse.on||!lay||mouse.fx===mLast)return null;const L=lay.at[i];if(!L)return null;mLast=mouse.fx;
 const lx=(mouse.fx*SCR.w-lay.ox)/lay.z-L.x-2;return Math.max(0,Math.min(BW-1,Math.floor(lx/CS)))}
function padIn(n){const p=RA.input.pad(n);return{left:p.left,right:p.right,down:p.down,rot:p.a||p.b,drop:p.up||p.x,tgt:p.y||p.lb,item:p.rb||p.rt}}
const touchIn=()=>({left:touchK.left,right:touchK.right,down:touchK.down,rot:touchK.rot,drop:touchK.drop||touchK.up,tgt:touchK.tgt,item:touchK.item});
function mkIn(){const o=RA.input.keys(KEYS.mk),u=RA.input.pulses();if(u.rot||mouse.down)o.rot=true;if(u.drop)o.drop=true;if(u.item)o.item=true;return o}
// online: everything this device can press, merged
function myInput(){const o={};for(const s of[mkIn(),RA.input.keys(KEYS.k3),touchIn(),padIn(0)])for(const k of BITS)if(s[k])o[k]=true;return o}
function readInput(b){const c=b.ctrl;
 if(c==='cpu')return bot(b);
 if(c==='net'){const p=R.input(b.peer);if(!p)return{gone:1};
  const o=fromBits((p.i|0)&7),d=(n,l)=>(((n|0)-(l|0))%1000+1000)%1000;
  o.nrot=d(p.r,b.lr);o.ndrop=d(p.d,b.ld)?1:0;o.ntgt=d(p.t,b.lt)%4;o.nitem=d(p.u,b.li)?1:0;b.lr=p.r|0;b.ld=p.d|0;b.lt=p.t|0;b.li=p.u|0;
  if(typeof p.mc==='number'&&p.mc!==b.lmc){b.lmc=p.mc;b.mcol=p.mc>=0?Math.min(BW-1,p.mc|0):null}
  return o}
 if(c==='me'){const o=myInput(),m=mouseCol(b.i);if(m!=null)b.mcol=m;return o}
 if(c==='touch')return touchIn();
 if(c.startsWith('gp'))return padIn(+c[2]);
 const o=c==='mk'?mkIn():RA.input.keys(KEYS[c]);
 if(c==='mk'){const m=mouseCol(b.i);if(m!=null)b.mcol=m}
 return o}
// client: send my buttons as held bits plus press counters (so a quick tap is never lost on the way)
function clientSend(now){const o=myInput(),pr=NET.prev;NET.prev=o;
 if(o.rot&&!pr.rot)NET.rc=(NET.rc+1)%1000;if(o.drop&&!pr.drop)NET.dc=(NET.dc+1)%1000;if(o.tgt&&!pr.tgt)NET.tc=(NET.tc+1)%1000;if(o.item&&!pr.item)NET.uc=((NET.uc|0)+1)%1000;
 const m=NET.myIdx>=0?mouseCol(NET.myIdx):null;if(m!=null)NET.mc=m;
 R.send({i:toBits(o)&7,r:NET.rc,d:NET.dc,t:NET.tc,u:NET.uc|0,mc:NET.mc},now)}
const onKey=e=>state==='play'&&!demo&&(R.online?!!(KEYS.mk[e.code]||KEYS.k3[e.code]):boards.some(b=>KEYS[b.ctrl]&&KEYS[b.ctrl][e.code]));
RA.input.attachPointer(cv,{active:()=>state==='play'&&!demo&&(R.online?NET.myIdx>=0:boards.some(b=>b.ctrl==='mk')),touchActive:()=>false,
 right:()=>RA.input.pulse('drop'),wheel:()=>RA.input.pulse('rot')});
// middle click fires the item
cv.addEventListener('auxclick',e=>{if(e.button===1&&state==='play'&&!demo){e.preventDefault();RA.input.pulse('item')}});

/* ---------- CPU: tries every column and turn, keeps the one that clears the most (with a little noise) ---------- */
function landRow(g,x){let top=BH;for(let r=0;r<BH;r++)if(g[r*BW+x]){top=r;break}return top-3}
function evalPlace(g,x,j){const y=landRow(g,x);if(y<0)return -1e6;
 if(j[0]===8){const below=y+3<BH?g[(y+3)*BW+x]&15:0;let n=0;if(below>=1&&below<=6)for(const c of g)if((c&15)===below)n++;return n*14-y}
 const t=g.slice();for(let k=0;k<3;k++)t[(y+k)*BW+x]=j[k];
 let s=0;for(let ch=1;ch<6;ch++){const f=findMatches(t);if(!f.n)break;s+=f.n*12*ch*ch;for(let q=0;q<t.length;q++)if(f.m[q])t[q]=0;collapse(t)}
 for(let k=0;k<3;k++){const c=j[k]&15,yy=y+k;if(!t[yy*BW+x])continue;for(const[dx,dy]of[[1,0],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=yy+dy;if(nx>=0&&nx<BW&&ny>=0&&ny<BH&&(t[ny*BW+nx]&15)===c)s+=3}}
 let h=0;for(let xx=0;xx<BW;xx++)h=Math.max(h,BH-3-landRow(t,xx));s-=h*h*.6;if(x===2)s-=h>8?20:0;
 return s}
function bot(b){if(b.item&&--b.itemT<=0)return{item:true};const pc=b.pc;if(!pc)return{};
 if(!b.bot){let bs=-1e9,bx=pc.x,br=0;
  for(let r=0;r<3;r++){const j=r===0?pc.j:r===1?[pc.j[2],pc.j[0],pc.j[1]]:[pc.j[1],pc.j[2],pc.j[0]];
   for(let x=0;x<BW;x++){const s=evalPlace(b.g,x,j)+Math.random()*b.cpu.noise;if(s>bs){bs=s;bx=x;br=r}}}
  b.bot={x:bx,r:br,t:0,hard:Math.random()<b.cpu.drop}}
 const P=b.bot,o={};if(++P.t%b.cpu.react)return o.soft?o:{};
 if(P.r>0){P.r--;o.rot=true;return o}
 if(pc.x!==P.x){o[pc.x<P.x?'right':'left']=true;return o}
 if(P.hard&&pc.y>=0)o.drop=true;else o.down=true;
 return o}

/* ---------- host -> everyone: the whole match in one compact snapshot ---------- */
const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const encG=g=>String.fromCharCode(...Array.from(g,v=>48+v));
const encM=m=>{let s='';for(let y=0;y<BH;y++){let v=0;for(let x=0;x<BW;x++)if(m[y*BW+x])v|=1<<x;s+=B64[v&63]+B64[v>>6]}return s};
// one board as a compact array, shared by the host's snapshot and a guest's upload of its own board
const encB=b=>[encG(b.g),b.pc?b.pc.x:-1,b.pc?Math.round(b.pc.y*10):0,b.pc?encG(b.pc.j):'',encG(b.next),b.score,b.lvl,b.garb,b.alive?1:0,
 b.mark?encM(b.mark):'',b.tg,b.ko,b.tm,b.outAt,b.item,(b.fx.fog>0?1:0)|(b.fx.speed>0?2:0)|(b.fx.rev>0?4:0)|(b.fx.slow>0?8:0)|(b.fx.flip>0?16:0)|(b.fx.disco>0?32:0),b.fx.shield];
const decCell=c=>{const v=Math.max(0,(c||48)-48);return(v&15)>8||(v>>4)>=POW.length?0:v&255};
function decB(b,a,i){const old=b.mark,og=b.g.slice();
 const s=String(a[0]||'');for(let q=0;q<BW*BH;q++)b.g[q]=decCell(s.charCodeAt(q));
 b.pc=a[1]>=0&&String(a[3]).length===3?{x:Math.max(0,Math.min(BW-1,a[1]|0)),y:(a[2]|0)/10,j:[0,1,2].map(k=>decCell(String(a[3]).charCodeAt(k)))}:null;
 b.next=[0,1,2].map(k=>decCell(String(a[4]||'111').charCodeAt(k))||1);
 b.item=Math.max(0,Math.min(POW.length-1,a[14]|0));const f=a[15]|0;b.fx={fog:f&1,speed:f&2,rev:f&4,slow:f&8,flip:f&16,disco:f&32,shield:a[16]|0};
 Object.assign(b,{score:a[5]|0,lvl:a[6]|0,garb:a[7]|0,tg:a[10]|0,tm:Math.min(4,(a[12]|0)&7)});
 b.alive=!!a[8];b.outAt=a[13]|0;
 if(a[9]){const m=new Uint8Array(BW*BH),ms=String(a[9]);for(let y=0;y<BH;y++){const v=Math.max(0,B64.indexOf(ms[y*2]))|Math.max(0,B64.indexOf(ms[y*2+1]))<<6;for(let x=0;x<BW;x++)if(v&(1<<x))m[y*BW+x]=1}b.mark=m}
 else{if(old)for(let q=0;q<BW*BH;q++)if(old[q])burst(i,q%BW,(q/BW)|0,og[q]);b.mark=null}}
function snapshot(){
 const g={ph:state==='over'?'over':'play',id:NET.matchId,r:NET.mroster,w:NET.winner,wl:NET.wl||'',t:(matchT/60)|0,cf:[M.mode,M.size,M.speed,M.len,M.tgt],
  b:boards.map(encB),hx:SY.pack(),e:NET.ev.slice()};
 while(JSON.stringify(g).length>3700&&g.e.length)g.e.shift();
 return g}
// host: a guest's board comes from the guest, its hits on other boards are passed on
function readGuest(b){const p=R.input(b.peer);if(!p){if(b.alive)topout(b);return}
 const u=SY.read(p,NET.matchId,b.i);
 if(u&&Array.isArray(u.s)){const was=b.alive;decB(b,u.s,b.i);b.lastBy=u.s[17]|0;if(was&&!b.alive){b.alive=true;topout(b)}}}
// guest: send my own board (and my hits on others) every frame; the host keeps the latest
function clientSend(now){const b=boards[NET.myIdx];if(b)SY.upload(R.room,now,[...encB(b),b.lastBy|0],NET.matchId)}
function applySnap(g){
 if(!g)return;
 if(g.ph==='lobby'){if(!demo)toLobby();return}
 if(!Array.isArray(g.b)||!Array.isArray(g.r))return;
 const me=R.room&&R.room.peers().find(pe=>pe.sameTab),n=Math.min(MAXP,g.b.length);
 if(g.id!==NET.matchId||boards.length!==n||demo){
  NET.matchId=g.id;NET.seen=0;for(const e of g.e||[])NET.seen=Math.max(NET.seen,e[0]|0);
  NET.myIdx=me?g.r.indexOf(me.peer):-1;demo=false;SY.reset();
  if(Array.isArray(g.cf)){M={...CFG,mode:String(g.cf[0]),size:String(g.cf[1]),speed:String(g.cf[2]),len:g.cf[3]|0,tgt:String(g.cf[4])};const sz=M.size.split('x');setSize(Math.max(4,Math.min(10,+sz[0]||6)),Math.max(10,Math.min(15,+sz[1]||13)))}
  boards=g.b.slice(0,n).map((a,i)=>makeBoard(i,i===NET.myIdx?'me':'net','',g.r[i]));for(const b of boards){b.team=M.mode==='teams'?b.i%2:b.i;if(M.mode==='teams')b.col=TEAMC[b.team];if(lockedTm()!=null)b.tm=lockedTm()}parts=[];texts=[];lastTrack=-1;state='play';tick=0;
  const mb=boards[NET.myIdx];if(mb&&Array.isArray(g.b[NET.myIdx]))mb.next=[0,1,2].map(k=>decCell(String(g.b[NET.myIdx][4]||'111').charCodeAt(k))||1);
  layout();enterPlay(touchDev&&NET.myIdx>=0)}
 SY.unpack(g.hx);
 const all=R.room?R.room.peers():[];
 g.b.slice(0,n).forEach((a,i)=>{const b=boards[i];if(!b||!Array.isArray(a))return;
  if(i===NET.myIdx)b.ko=a[11]|0;   // my own board runs here; only KO badges (and hits, below) come from the host
  else{const was=b.alive;decB(b,a,i);b.ko=a[11]|0;if(was&&!b.alive){b.t=0;b.shake=14}b.syncT=tick}
  const id=g.r[i];b.isMe=!!id&&id===(me&&me.peer);b.name=id?(id===(me&&me.peer)?(RA.player.name||'YOU'):R.name(all.find(p=>p.peer===id),i)):'CPU'});
 for(const e of g.e||[]){if((e[0]|0)<=NET.seen)continue;NET.seen=e[0]|0;const k=e[1],bi=e[2]|0,a=e[3];
  if(k==='s'&&Array.isArray(a)&&a[2]&&bi!==NET.myIdx)sfx(String(a[0]),a[1]|0);
  else if(k==='x'&&Array.isArray(a)&&boards[bi]&&bi!==NET.myIdx)texts.push({b:bi,x:BW*CS/2,y:a[2]|0,s:String(a[0]).slice(0,12),t:60,col:/^#[0-9a-f]{6}$/i.test(a[1])?a[1]:'#fcfcfc'});
  else if(k==='f'&&boards[bi]&&boards[a|0]&&bi!==NET.myIdx)for(let j=0;j<6;j++)parts.push({fly:1,from:bi,to:a|0,t:30+j*3,k:30+j*3})}
 if(Math.abs(matchT-(g.t|0)*60)>90)matchT=(g.t|0)*60;
 if(g.ph==='over'&&state!=='over'){NET.winner=g.w;NET.wl=g.wl||'';showOver(boards[g.w]||null)}
}

/* ---------- layout: boards in a grid that fits the window, never cut off ---------- */
function layout(){const n=Math.max(1,boards.length),sc=SO.el,dpr=window.devicePixelRatio||1,W=Math.max(320,sc.clientWidth*dpr),H=Math.max(200,sc.clientHeight*dpr);
 let bestR=1,bs=0;for(let R=1;R<=Math.min(n,4);R++){const C=Math.ceil(n/R),s=Math.min(W/(C*BLW+8),H/(R*BLH+20));if(s>bs+1e-6){bs=s;bestR=R}}
 const R=bestR,C=Math.ceil(n/R),nw=C*BLW+8,nh=R*BLH+20;SO.minW=nw;SO.baseH=nh;
 // phone held sideways: keep the boards clear of the touch pad on both sides
 const padW=document.body.classList.contains('touchplay')&&W>H?400*dpr:0;
 if(padW){const s0=Math.max(1,Math.floor(Math.min(H/nh,(W-padW)/nw)));SO.minW=Math.max(nw,Math.ceil(W/s0));SO.baseH=Math.max(nh,Math.ceil(H/s0))}
 lay={R,C,at:[],w:nw,h:nh,z:1,ox:0,oy:0};
 boards.forEach((b,i)=>{const r=Math.floor(i/C),inRow=Math.min(C,n-r*C),c=i-r*C;lay.at[i]={x:4+(C-inRow)*BLW/2+c*BLW+6,y:14+r*BLH}});
 SCR.fit();place()}
function place(){if(!lay)return;lay.z=Math.min(1,SCR.w/lay.w,SCR.h/lay.h);lay.ox=Math.round((SCR.w-lay.w*lay.z)/2);lay.oy=Math.round((SCR.h-lay.h*lay.z)/2)}
SO.onResize=()=>place();
addEventListener('resize',()=>{if(boards.length&&!RA.menu.open&&RA.menu.current&&RA.menu.current.id==='jewels')layout()});

/* ---------- drawing ---------- */
const bgC=document.createElement('canvas');
// marble floor tile: two stones, gold inlay seams, a small jewel set in every light square
// scenes change with level (survey): dusk marble, treasure cave, ice palace, volcano
const SCENES=[{n:'Marble Dusk',sky:['#05021a','#4a1c62'],glow:'#c04878',line:'#e888c0',lt:[70,56,120],dk:[26,20,60],seam:[200,150,40]},
 {n:'Treasure Cave',sky:['#0c0602','#5c3410'],glow:'#f8a030',line:'#f8c060',lt:[120,84,40],dk:[46,30,14],seam:[250,200,60]},
 {n:'Ice Palace',sky:['#020c1e','#2c6c9c'],glow:'#7cd8ff',line:'#bcecff',lt:[150,200,230],dk:[40,70,110],seam:[230,250,255]},
 {n:'Volcano',sky:['#100202','#7c1408'],glow:'#ff5010',line:'#ff9050',lt:[90,40,30],dk:[30,10,8],seam:[255,120,20]}];
const floorOf=S=>{const k=document.createElement('canvas');k.width=k.height=64;const g=k.getContext('2d'),im=g.createImageData(64,64),o=im.data;
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const lt=((x>>5)^(y>>5))&1,n=Math.abs(Math.sin(x*3.1+y*1.7)+Math.sin(x*.37-y*.53)*1.6),vein=n>2.2?30:0,
  seam=(x&31)===0||(y&31)===0,q=(y*64+x)*4;let r,gg,bb;
  if(seam){[r,gg,bb]=S.seam}else if(lt){r=S.lt[0]+vein;gg=S.lt[1]+vein;bb=S.lt[2]+vein}else{r=S.dk[0]+vein*.5;gg=S.dk[1]+vein*.5;bb=S.dk[2]+vein*.5}
  const dx=(x&31)-16,dy=(y&31)-16;if(lt&&Math.abs(dx)+Math.abs(dy)<4){r=230-(dx+dy)*10;gg=60;bb=90}
  o[q]=r;o[q+1]=gg;o[q+2]=bb;o[q+3]=255}
 g.putImageData(im,0,0);return k};
const FLOORS=SCENES.map(floorOf);let sceneK=-1;
function sceneNow(){if(demo||!boards.length)return 0;const b=boards[NET.myIdx]||boards.find(o=>o.ctrl!=='cpu'&&o.ctrl!=='net')||boards[0];return Math.min(3,Math.floor(((b.lvl||1)-1)/3))}
function drawBg(){const w=SCR.w,h=SCR.h,hor=Math.round(h*.58),sk=sceneNow(),S=SCENES[sk];
 const K=ctx._k||1;if(bgC.width!==w*K||bgC.height!==h*K||sceneK!==sk){sceneK=sk;bgC.width=w*K;bgC.height=h*K;const g=bgC.getContext('2d');g.scale(K,K);
  RA.fx.gradient(g,0,0,w,hor,S.sky[0],S.sky[1],24);
  for(let i=0;i<w*hor/700;i++){const x=(i*97)%w,y=(i*61+((i*i)%37))%Math.max(1,hor-8);g.fillStyle=i%7?'#8c7cc8':'#fcfcfc';g.fillRect(x,y,1,1)}
  RA.fx.light(g,w/2,hor,Math.round(w*.32),S.glow,.22)}
 ctx.drawImage(bgC,0,0,w,h);
 RA.fx.floor(ctx,FLOORS[sk],{x:0,z:tick*.35,angle:Math.sin(tick*.003)*.18,height:26,fov:110,horizon:hor},0,0,w,h);
 ctx.fillStyle=S.line;ctx.fillRect(0,hor,w,1);
 // big jewels tumbling past at two depths, each with its shadow on the floor
 for(let i=0;i<12;i++){const near=i%2,sp=near?.14:.06,sz=near?2.4:1.5,x=((i*131+tick*sp*(i%3?1:-1))%(w+60)+w+60)%(w+60)-30,y=(((i*89-tick*sp*.5)%(hor*.9))+hor*.9)%(hor*.9);
  RA.fx.sprite(ctx,GEM[1+i%6],x,y,sz,Math.sin(tick*.01+i)*.5,near?.5:.28)}}
// a raised chrome frame: drop shadow, gouraud-shaded metal with a hard highlight band, dark inner lip
const shade=(col,k)=>RA.util.mix(col,k<1?'#000000':'#ffffff',k<1?1-k:k-1);
function frameRect(x,y,w,h,col){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(x+2,y+4,w+8,h+6);
 ctx.fillStyle='#000';ctx.fillRect(x-4,y-4,w+8,h+8);
 const gr=ctx.createLinearGradient(x-3,y-3,x+w+3,y+h+3);gr.addColorStop(0,shade(col,1.7));gr.addColorStop(.15,col);gr.addColorStop(.48,shade(col,.5));gr.addColorStop(.52,shade(col,1.3));gr.addColorStop(1,shade(col,.35));
 ctx.fillStyle=gr;ctx.fillRect(x-3,y-3,w+6,h+6);
 ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x-3,y-3,w+6,1);ctx.fillRect(x-3,y-3,1,h+6);
 ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,w+2,h+2)}
// the well is tinted glass: deep gradient back wall, a pale reflection streak across the front
function glass(x,y,w,h,danger){const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,danger?'#4c1018':'#22205c');g.addColorStop(1,danger?'#160406':'#06061c');
 ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}
function reflect(x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='rgba(255,255,255,.07)';ctx.beginPath();
 ctx.moveTo(x+w*.15,y);ctx.lineTo(x+w*.5,y);ctx.lineTo(x,y+h*.45);ctx.lineTo(x,y+h*.2);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.04)';ctx.beginPath();ctx.moveTo(x+w,y+h*.55);ctx.lineTo(x+w,y+h*.7);ctx.lineTo(x+w*.6,y+h);ctx.lineTo(x+w*.4,y+h);ctx.fill();ctx.restore()}
let discoOn=false;
const gemOf=v=>{const c=v&15;if(discoOn&&c>=1&&c<=6)return GEM[1+((tick>>2)+c)%6];return GEM[c===8?1+((tick>>2)%6):c]||GEM[1]};
const ICON=POW.map(P=>{if(!P)return null;const k=document.createElement('canvas');k.width=k.height=10;RA.gfx.blit(k.getContext('2d'),P.art,0,0,PCOL);return k});
// a power jewel sparkles in its power's colour
function sparkle(v,x,y){const t=PW(v);if(!t)return;const on=(tick>>3)&1,cx=x+CS-4,cy=y+3,col=on?POW[t].col:'#fcfcfc';
 RA.fx.light(ctx,cx,cy,5,POW[t].col,.35);ctx.fillStyle='#000';ctx.fillRect(cx-3,cy-1,7,3);ctx.fillRect(cx-1,cy-3,3,7);
 ctx.fillStyle=col;ctx.fillRect(cx-2,cy,5,1);ctx.fillRect(cx,cy-2,1,5);ctx.fillStyle='#fff';ctx.fillRect(cx,cy,1,1)}
function drawBoard(b,L){ctx.save();discoOn=!!b.fx.disco&&b.alive;const lk=lookOf(b);GEM=gemSet(lk.gems);b._fr=FRAMES[lk.frame];b._bu=lk.burst;
 if(b.fx.flip&&b.alive){const cy=L.y+10+BH*CS/2;ctx.translate(0,cy*2);ctx.scale(1,-1)}
 drawBoard0(b,L);ctx.restore();discoOn=false;GEM=GEM0}
function drawBoard0(b,L){
 const sx=b.shake?Math.round((Math.random()-.5)*3):0,X=L.x+2+sx,Y=L.y+10,txt=RA.gfx.text,danger=b.alive&&height(b)>=BH-3;
 txt(ctx,b.name.slice(0,9),X+BW*CS/2,L.y,b.alive?b.col:'#7c7c7c');
 if(focus(b)&&!demo&&boards.length>1){ctx.fillStyle=b.col;ctx.fillRect(X+BW*CS/2-12,L.y+7,24,1)}
 frameRect(X,Y,BW*CS,BH*CS,!b.alive?'#4c4c4c':danger?((tick>>3)&1?'#d82800':'#881400'):b.fx.speed?((tick>>2)&1?'#f8b800':'#fcfcfc'):b.garb?'#e45c10':(b._fr||'#f8b800'));
 // the well is a box with depth: lit back wall, darker inner walls on the left and top, jewels cast shadows on it
 glass(X,Y,BW*CS,BH*CS,danger);
 ctx.fillStyle='rgba(255,255,255,.035)';for(let x=1;x<BW;x+=2)ctx.fillRect(X+x*CS,Y,CS,BH*CS);
 ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(X,Y,3,BH*CS);ctx.fillRect(X,Y,BW*CS,3);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(X+3,Y+3,2,BH*CS-3);ctx.fillRect(X+3,Y+3,BW*CS-3,2);
 ctx.fillStyle='rgba(0,0,0,.5)';for(let y=0;y<BH;y++)for(let x=0;x<BW;x++)if(b.g[y*BW+x])ctx.fillRect(X+x*CS+3,Y+y*CS+3,CS-2,CS-2);
 if(b.pc)for(let k=0;k<3;k++){const yy=Math.round(Y+(b.pc.y+k)*CS);if(yy>=Y)ctx.fillRect(X+b.pc.x*CS+3,yy+3,CS-2,Math.min(CS-2,Y+BH*CS-yy-3))}
 const fl=b.mark&&((tick>>2)&1);
 for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const c=b.g[y*BW+x];if(!c)continue;
  if(b.mark&&b.mark[y*BW+x]){const k=c&15,col=k>=1&&k<=6?JC[k][1]:'#fcfcfc';RA.fx.light(ctx,X+x*CS+CS/2,Y+y*CS+CS/2,CS,col,fl?.55:.3);
   if(fl){ctx.fillStyle='#fcfcfc';ctx.fillRect(X+x*CS+1,Y+y*CS+1,CS-2,CS-2);continue}}
  ctx.drawImage(gemOf(c),X+x*CS,Y+y*CS);sparkle(c,X+x*CS,Y+y*CS)}
 reflect(X,Y,BW*CS,BH*CS);
 if(!b.alive){const k=Math.min(BH,(b.t>>2));ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(X,Y+(BH-k)*CS,BW*CS,k*CS)}
 // FOG: the well is clouded over, only the falling column shows
 if(b.fx.fog&&b.alive){ctx.fillStyle='#5c5c6c';ctx.fillRect(X,Y,BW*CS,BH*CS);ctx.fillStyle='#7c7c8c';for(let k=0;k<BH+1;k++){const fx=(k*37+tick*(k%2?1:-1)*.3)%(BW*CS+20)-10;ctx.fillRect(X+Math.max(0,Math.round(fx)),Y+k*CS+3,Math.min(26,BW*CS-Math.max(0,Math.round(fx))),5)}}
 if(b.pc){const pc=b.pc;
  // ghost: where it will land (dim), then the falling column
  let gy=Math.floor(pc.y);while(canAt(b,pc.x,gy+1))gy++;
  ctx.globalAlpha=b.fx.fog?0:.28;for(let k=0;k<3;k++)if(gy+k>=0)ctx.drawImage(gemOf(pc.j[k]),X+pc.x*CS,Y+(gy+k)*CS);ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.rect(X,Y,BW*CS,BH*CS);ctx.clip();
  for(let k=0;k<3;k++){const yy=Math.round(Y+(pc.y+k)*CS);ctx.drawImage(gemOf(pc.j[k]),X+pc.x*CS,yy);sparkle(pc.j[k],X+pc.x*CS,yy)}ctx.restore()}
 // side column: next jewels, incoming rocks, KO badges, level
 const NX=X+BW*CS+6;frameRect(NX,Y,CS,3*CS,'#4c4c4c');glass(NX,Y,CS,3*CS,false);
 if(b.alive&&!b.fx.fog)for(let k=0;k<3;k++)ctx.drawImage(gemOf(b.next[k]),NX,Y+k*CS);else if(b.alive)txt(ctx,'?',NX+CS/2,Y+12,'#a8a8a8');
 // item slot (blinks when full: fire it!), then incoming rocks
 frameRect(NX,Y+3*CS+6,CS,CS,b.item&&(tick>>4)&1?POW[b.item].col:'#4c4c4c');glass(NX,Y+3*CS+6,CS,CS,false);if(b.item)ctx.drawImage(ICON[b.item],NX+2,Y+3*CS+8);
 for(let k=0;k<Math.min(6,b.garb);k++){ctx.fillStyle='#000';ctx.fillRect(NX,Y+4*CS+12+k*6,CS,5);ctx.fillStyle=k<3?'#d82800':'#7c7c7c';ctx.fillRect(NX+1,Y+4*CS+13+k*6,CS-2,3)}
 // active effects, shown on the well
  const fxs=[b.fx.flip?['FLIP','#3cbcfc']:null,b.fx.disco?['DISCO','#f878f8']:null,b.fx.shield?['SHIELD '+b.fx.shield,'#3cbcfc']:null,b.fx.slow?['SLOW','#58f898']:null,b.fx.speed?['FAST!','#f8b800']:null,b.fx.rev?['REVERSE','#f878f8']:null,b.fx.fog?['FOG','#fcfcfc']:null].filter(Boolean);
 fxs.forEach((f,k)=>txt(ctx,f[0],X+BW*CS/2,Y+3+k*7,f[1]));
 if(b.alive&&b.garb>0&&!demo){const fb=boards[b.lastBy];txt(ctx,'▼ '+b.garb+' INCOMING'+(fb&&fb!==b?' · '+fb.name.slice(0,7):''),X+BW*CS/2,Y-8,(tick>>3)&1?'#ff5030':'#ffd040')}
 if(b.fx.shield&&b.alive){ctx.fillStyle='#3cbcfc';ctx.fillRect(X,Y,BW*CS,1);ctx.fillRect(X,Y+BH*CS-1,BW*CS,1);ctx.fillRect(X,Y,1,BH*CS);ctx.fillRect(X+BW*CS-1,Y,1,BH*CS)}
 if(b.ko){txt(ctx,'KO',NX+CS/2,Y+BH*CS-40,'#f8b800');RA.gfx.num(ctx,b.ko,NX+CS/2,Y+BH*CS-33,'#fcfcfc')}
 txt(ctx,'LV',NX+CS/2,Y+BH*CS-22,'#a8a8a8');RA.gfx.num(ctx,b.lvl,NX+CS/2,Y+BH*CS-15,'#fcfcfc');
 RA.gfx.num(ctx,b.score,X+BW*CS/2,Y+BH*CS+5,'#fcfcfc');
 if(focus(b)&&!demo&&b.alive&&boards.length>1){const a=attackers(b);txt(ctx,TM[b.tm]+(a?' - '+a+' ON YOU':''),X+BW*CS/2,Y+BH*CS+12,a>=2?'#d82800':'#3cbcfc')}
 if(!b.alive&&boards.length>1){const rank=boards.filter(o=>o.alive||o.outAt>b.outAt).length+1;txt(ctx,'NO '+rank,X+BW*CS/2,Y+BH*CS/2-2,'#a8a8a8')}
}
// your target: a blinking bracket in your colour around the board your rocks will hit
function drawTarget(f){const t=boards[f.tg];if(!t||!t.alive||(tick>>4)%4===3)return;const L=lay.at[t.i];if(!L)return;
 const X=L.x+2,Y=L.y+10,w=BW*CS,h=BH*CS;ctx.fillStyle=f.col;
 for(const[x,y,dx,dy]of[[X-6,Y-6,1,1],[X+w+5,Y-6,-1,1],[X-6,Y+h+5,1,-1],[X+w+5,Y+h+5,-1,-1]]){ctx.fillRect(Math.min(x,x+dx*7),y,8,1);ctx.fillRect(x,Math.min(y,y+dy*7),1,8)}}
function render(){
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;drawBg();if(!lay)return;
 ctx.setTransform(lay.z,0,0,lay.z,lay.ox,lay.oy);
 boards.forEach((b,i)=>drawBoard(b,lay.at[i]));
 if(!demo&&state==='play')for(const b of boards)if(focus(b)&&b.alive&&boards.length>1)drawTarget(b);
 for(const p of parts){if(p.fly){const a=lay.at[p.from],c=lay.at[p.to];if(!a||!c||p.t>p.k-6)continue;const f=1-p.t/(p.k-6),x=a.x+BW*CS/2+(c.x-a.x)*f,y=a.y+BH*CS/2+(c.y-a.y)*f-Math.sin(f*Math.PI)*30;
   ctx.fillStyle='#000';ctx.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);ctx.fillStyle='#bcbcbc';ctx.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);continue}
  const L=lay.at[p.b];if(!L)continue;ctx.fillStyle=p.col;ctx.fillRect(Math.round(L.x+2+p.x),Math.round(L.y+10+p.y),p.t>14?2:1,p.t>14?2:1)}
 for(const t of texts){const L=lay.at[t.b];if(L)RA.gfx.text(ctx,t.s,L.x+2+t.x,Math.round(L.y+10+t.y*CS/10),t.col)}
 ctx.setTransform(1,0,0,1,0,0);
}

/* ---------- match flow ---------- */
function stepFx(){for(const p of parts){p.t--;if(!p.fly){p.x+=p.vx;p.y+=p.vy;p.vy+=.12}}parts=parts.filter(p=>p.t>0);
 for(const t of texts){t.t--;t.y-=.35}texts=texts.filter(t=>t.t>0)}
function step(){tick++;
 if(isClient()&&!demo){if(state==='play')matchT++;
  for(const b of boards){if(b.i===NET.myIdx&&state==='play'){stepBoard(b);continue}
   if(b.shake>0)b.shake--;if(!b.alive)b.t++;
   else if(b.pc&&tick-(b.syncT|0)<20&&canAt(b,b.pc.x,Math.floor(b.pc.y)+1))b.pc.y=Math.min(b.pc.y+speed(b),Math.floor(b.pc.y)+1)}
  stepFx();if(boards.filter(b=>b.alive).length===2&&boards.length>2)playTrack(3);return}
 if(state!=='play'){stepFx();return}
 matchT++;
 for(const b of boards){if(b.ctrl==='net'){readGuest(b);if(!b.alive)b.t++}else stepBoard(b)}
 stepFx();
 const alive=boards.filter(b=>b.alive);
 if(!demo&&(boards.length>2&&alive.length===2||boards.length===1&&boards[0].lvl>=8))playTrack(3);
 // royale: every 30 s (after the first minute) every well gets a rock row, faster later
 if(!demo&&M.mode==='royale'&&matchT>3600&&matchT%Math.max(900,1800-((matchT/3600)|0)*300)===0)for(const b of alive){hit(b,'g',1,-1);say(b,'WELLS CLOSE IN','#d82800',40)}
 // co-op: pressure rocks for everyone every 25 s
 if(!demo&&M.mode==='coop'&&boards.length>1&&matchT%1500===0)for(const b of alive)hit(b,'g',1+Math.floor(matchT/7200),-1);
 if(!demo&&boards.length>1){let end=null;
  if(M.mode==='race'){const w=boards.find(b=>b.alive&&b.jewels>=150);if(w)end=w}
  const lim=M.len?M.len*3600:M.mode==='coop'?3*3600:0;
  if(lim&&matchT>=lim)end=leader()||'draw';
  if(M.mode==='teams'&&new Set(alive.map(b=>b.team)).size<=1&&alive.length)end=alive[0];
  if(M.mode==='coop'&&!alive.length)end='draw';
  if(end){NET.winner=end==='draw'?-1:end.i;showOver(end==='draw'?null:end);return}}
 if((M.mode==='teams'||M.mode==='coop')&&boards.length>1&&!demo)return;
 if(boards.length>1?alive.length<=1:!alive.length){
  if(demo){if(!alive.length||boards.some(b=>!b.alive&&b.t>120))startDemo();return}
  if(boards.some(b=>!b.alive&&b.t<60))return;          // let the last board crumble first
  NET.winner=alive[0]?alive[0].i:-1;showOver(alive[0]||null)}
}
function leader(){const sc={};for(const b of boards){const k=M.mode==='coop'?0:b.team,o=sc[k]||(sc[k]={s:0,b,al:0});o.s+=b.score;o.al+=b.alive?1:0;if(b.score>o.b.score)o.b=b}
 const a=Object.values(sc).sort((x,y)=>(y.al>0)-(x.al>0)||y.s-x.s);return a.length>1&&a[0].s===a[1].s?null:a[0].b}
function showOver(w){state='over';
 if(!isClient())NET.wl=M.mode==='coop'?'TEAM SCORE '+boards.reduce((a,b)=>a+b.score,0):w&&M.mode==='teams'?TEAMN[w.team]+' WINS':'';
 const solo=boards.length===1,b0=boards[0];
 if(solo&&b0.score>best){best=b0.score;try{localStorage.setItem('mj-best',best)}catch(e){}}
 const me=boards[NET.myIdx]||(!isClient()&&boards.find(b=>b.ctrl!=='cpu'));
 if(me){const m={won:!solo&&!!w&&(w===me||(M.mode==='teams'&&w.team===me.team)||M.mode==='coop'),bestScore:me.score|0,bestLevel:me.lvl|0,ko:me.ko|0};SAVE.record(m);ACH.check(m)}
 $('mjWin').textContent=solo?'SCORE '+b0.score:NET.wl?NET.wl:w?(w.isMe?'YOU WIN!':w.name.toUpperCase()+' WINS'):'DRAW';
 const list=solo?boards:boards.slice().sort((a,b)=>(b.alive-a.alive)||(b.outAt-a.outAt)||(b.score-a.score));
 $('mjRanks').innerHTML=solo?'<li><span class="pos">★</span><span>Best score</span><em>'+best+'</em></li><li><span class="pos">LV</span><span>Level reached</span><em>'+b0.lvl+'</em></li>':
  list.slice(0,8).map((b,k)=>'<li style="animation-delay:'+k*60+'ms"><span class="pos">'+(k+1)+'</span><span style="color:'+b.col+'">'+esc(b.name)+'</span><em>'+(b.ko?b.ko+' KO · ':'')+b.score+'</em></li>').join('');
 $('mjAgain').hidden=isClient();$('mjSetupBtn').hidden=isClient();$('mjOverNote').hidden=!isClient();
 $('mjAgain').textContent=hostOnline()?'BACK TO ROOM':'PLAY AGAIN';$('mjSetupBtn').textContent=R.online?'LEAVE ROOM':'SETUP';
 $('mjOver').hidden=false;root.querySelector('.pad').hidden=true;sfx('pick');
 if(hostOnline())RA.autoBack({still:()=>state==='over'&&hostOnline(),label:n=>$('mjAgain').textContent='BACK TO ROOM ('+n+')',go:()=>$('mjAgain').click()});
 else if(isClient())RA.autoBack({still:()=>state==='over',label:n=>$('mjOverNote').textContent='Back to the room in '+n+'…'})}
function hudInfo(){if(demo||state!=='play')return;const s=(matchT/60)|0,b=boards[NET.myIdx]||boards.find(b=>b.ctrl!=='cpu')||boards[0];
 const lim=boards.length>1?(M.len?M.len*60:M.mode==='coop'?180:0):0,rs=lim?Math.max(0,lim-s):s,t=Math.floor(rs/60)+':'+String(rs%60).padStart(2,'0'),n=boards.filter(b=>b.alive).length;
 const MN={teams:'Teams',royale:'Battle royale',coop:'Co-op',race:'Race to 150'}[M.mode];
 $('mjInfo').innerHTML=(R.online?'Room <b>'+R.code+'</b> · ':'')+(isClient()&&NET.myIdx<0?'<b>Watching</b>, you play next round · ':'')+
  (boards.length===1?'Best <b>'+Math.max(best,b.score)+'</b> · ':'<b>'+n+'</b> board'+(n===1?'':'s')+' left · ')+(MN?'<b>'+MN+'</b> · ':'')+(lim?'Time left <b>':'Time <b>')+t+'</b>'}
function frame(now){
 if(isClient()&&!demo&&state==='play'&&NET.myIdx>=0)clientSend(now);
 if(hostOnline()){const inGame=!demo&&(state==='play'||state==='over');R.broadcast(now,inGame?snapshot():null,inGame)}
 R.tick(now);
 if(tick%15===0)hudInfo();render()}

$('mjStart').addEventListener('click',startLocal);
$('mjAgain').addEventListener('click',()=>{if(hostOnline()){toLobby();return}startLocal()});
$('mjSetupBtn').addEventListener('click',()=>{if(R.online)R.leave();else toLobby()});
$('mjBack').addEventListener('click',()=>{if(R.online)R.leave();RA.menu.show()});
R.init();

RA.legend(root,{kb:[['A D','move'],['LMB W','rotate'],['RMB SPACE','drop'],['S','fall faster'],['E','target'],['Q F','power-up'],['C','chat'],['ESC','menu']],
 pad:[['DP','move'],['A B','rotate'],['X','drop'],['Y LB','target'],['RB RT','power-up'],['BACK','chat'],['START','menu']]});
RA.register({id:'jewels',name:'MAGIC JEWELRY',kind:'Puzzle',players:'1-20 players',ready:true,el:root,
 desc:'Falling columns of three jewels, built for online rooms. Line up three of a kind, pick who your rocks hit, steal KO badges, last board standing wins.',
 icon:['....kk....','...kcck...','...kcck...','...kkkk...','...krrk...','...krrk...','...kkkk...','...kyyk...','...kyyk...','....kk....'],
 music:TRACKS,
 enter(){toLobby()},
 leave(){if(R.online)R.leave();state='menu';boards=[];document.body.classList.remove('playing','touchplay','mouseaim')},
 step,frame,onKey,
 onQuit(){if(R.online)R.leave();else toLobby()}});
window.__mj={get boards(){return boards},get state(){return state},get lay(){return lay},step,startLocal,findMatches,snapshot,applySnap,startOnline,R,NET,hit};
})();
