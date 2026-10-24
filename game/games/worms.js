/* WORMS for Retro Arena: real-time artillery for 2-20 players.
   Built on the shared engine (engine/ra.js): screen fit, input, sound, music, online rooms and the menu come from RA.
   This file is only what makes Worms feel like Worms: terrain, weapons, worm physics, bots, camera, HUD. */
(()=>{
const {$,rnd,hash,mulberry,hex,mix,esc,touchDev,setH}=RA.util,{blit,NES}=RA.gfx;
const audio=RA.audio.ensure,sfx=RA.audio.sfx,blip=RA.audio.blip,music=RA.music,toast=RA.ui.toast;
const {touchK,mouse,touchAim}=RA.input;
const root=RA.mount(`
  <div class="top">
    <div class="row"><button id="toMenu">◀ GAMES</button><div class="brand">RETRO <b>ARENA</b> · WORMS</div></div>
    <div class="info" id="info"></div>
  </div>
  <div class="players" id="players"></div>
  <div class="screen">
    <canvas id="cv"></canvas>
    <div class="feed" id="feed"></div>
    <button class="hudbtn ra-quit" id="padMenu">MENU</button>
    <button class="hudbtn ra-mus" id="mus" aria-label="Music on or off">♪</button>
    <div class="wbar" id="wbar" hidden><button id="wPrev" aria-label="Previous weapon">◀</button><button class="wn" id="wNow" aria-label="Open weapon list"><b id="wName"></b><small id="wAmmo"></small></button><button id="wNext" aria-label="Next weapon">▶</button></div>
    <div class="wpanel" id="wpanel" hidden></div>
    <div class="spec" id="spec" hidden><button id="specPrev" aria-label="Watch previous worm">◀</button><span id="specName"></span><button id="specNext" aria-label="Watch next worm">▶</button></div>
    <div class="overlay" id="title">
      <h1>WORMS</h1>
      <p>Real-time artillery brawl. Everyone moves at once. Grab airdrops, last worm standing wins. Big maps, fog of war: you only see what is near your worm.</p>
    </div>
    <div class="overlay" id="over" hidden>
      <h1 id="winner">RED WINS</h1>
      <ol class="ranks" id="ranks"></ol>
      <button class="go" id="again">NEW MATCH</button>
      <p id="overNote" hidden>Waiting for the host…</p>
    </div>
  </div>

  <div class="tabs" id="tabs">
    <button class="tab on" id="tabLocal">LOCAL</button>
    <button class="tab" id="tabOnline">ONLINE</button>
  </div>

  <section class="panel" id="setup">
    <h2 class="ph">LOCAL MATCH · ONE SCREEN</h2>
    <div class="row between">
      <div class="row"><span class="lbl">PLAYERS</span>
        <div class="step"><button id="npMinus" aria-label="Fewer players">−</button><output id="npVal" aria-live="polite">4</output><button id="npPlus" aria-label="More players">+</button></div>
        <select id="np" hidden aria-label="Players"></select></div>
      <button class="go" id="start">START ▶</button>
    </div>
    <div class="row mset" id="msetL"></div>
    <div class="list" id="slots"></div>
    <p class="note" id="localNote">Mouse + keys: A/D walk, Space jump (W/S climb the Ninja Rope and fly the Jet Pack), the mouse aims, left click fires (hold to charge, the dotted line shows where it lands), E/Q or the mouse wheel switch weapon, right-click or Tab opens the full weapon list, Esc for the menu. Extra players on one keyboard: IJKL + U jump, O fire, P weapon · Arrows + . jump, / fire, ' weapon · Numpad 4 6 8 5, 7 jump, 9 fire, 1 weapon. Gamepad: A jump, B/X/RB fire, Y/LB weapon. Pick lives, water, time limit, fog and mode above. Worms that are out can click the map to drop a crate.</p>
  </section>

  <section class="panel" id="online" hidden>
    <h2 class="ph">ONLINE · UP TO 20 PLAYERS</h2>
    <p class="msg" id="netMsg" hidden></p>
    <div class="list" id="onHome">
      <div class="row">
        <label for="nick" id="nickRow" hidden>Name <input id="nick" maxlength="12" autocomplete="off"></label>
        <label for="ow">Start weapon <select id="ow"></select></label>
      </div>
      <div class="row">
        <button class="go" id="create">CREATE ROOM</button>
        <input id="code" maxlength="5" placeholder="CODE" aria-label="Room code" autocomplete="off">
        <button id="join">JOIN</button>
      </div>
      <p class="note online" id="whoOnline"></p>
      <div class="list" id="rooms"></div>
      <p class="note" id="record"></p>
      <p class="note" id="netNote">Up to 20 players per room. Friends need to be signed in to claude.ai and have this page shared with them. Controls: A/D walk (the mouse only aims), Space jump, mouse aims, click fires, E/Q or wheel switch weapon, right-click for the weapon list. Gamepad and touch work too.</p>
    </div>
    <div class="list" id="onRoom" hidden>
      <div class="row between"><div class="row"><span class="lbl">ROOM</span><span class="code" id="rcode"></span></div><button id="leave">LEAVE</button></div>
      <div class="roster" id="roster"></div>
      <div class="row" id="hostCtl">
        <label for="cpus">CPU worms <select id="cpus"></select></label>
        <button class="go" id="hstart">START</button>
      </div>
      <div class="row mset" id="msetO"></div>
      <div class="ctlCard"><b>CONTROLS</b><p id="ctlTxt">A/D walk, Space jump (tap twice to backflip), W/S climb the rope and fly the jet pack. The mouse aims, left click fires (hold to charge). E/Q or the mouse wheel switch weapon, right-click or Tab opens the weapon list. Out of lives? Click the map to drop a crate. C opens chat, Esc for the menu. Gamepad: stick moves, A jump, B fire, Y/LB weapon.</p></div>
      <p class="note" id="rwait">Waiting for the host to start…</p>
    </div>
  </section>

  <div class="pad" id="pad" hidden>
    <div class="dpad" id="dpad" role="group" aria-label="Walk left and right, aim up and down"><i class="dU">▲</i><i class="dD">▼</i><i class="dL">◀</i><i class="dR">▶</i></div>
    <div class="ab"><button data-k="next" class="c">WPN</button><button data-k="jump" class="b">JUMP</button><button data-k="fire" class="a">FIRE</button></div>
  </div>
</div>
`);
let G=0.12;const G0=0.12,MAXP=20;
let W=320,H=200,WATER=188;
const cv=$('cv'),ctx=cv.getContext('2d');
const tCan=document.createElement('canvas'),tCtx=tCan.getContext('2d');
const sky=document.createElement('canvas');
let terr,tImg,tDirty=true,shake=0;
const solid=(x,y)=>{x=Math.floor(x);y=Math.floor(y);if(x<0||x>=W||y<0)return false;if(y>=H)return true;return terr[y*W+x]===1};
// The world is bigger than the screen: map size grows with player count, a fixed 8-bit view window follows you.
let VW=384,VH=216;const visR=()=>M.fog===2?190:128;
const cam={x:0,y:0,z:1,snap:true};
let layers=[],tD=null,skyG=null;
const mm=document.createElement('canvas'),mmCtx=mm.getContext('2d');let mmDirty=true;
function setSize(n){
 n=Math.max(2,Math.min(MAXP,n|0));
 W=Math.min(2400,560+n*100);H=Math.min(420,220+n*10);WATER=H-12;
 tCan.width=W;tCan.height=H;
 terr=new Uint8Array(W*H);tImg=tCtx.createImageData(W,H);
 sizeMini();
 buildSky();cam.snap=true;cam.z=1;cam.x=(W-VW)/2;cam.y=H-VH;
}
function sizeMini(){mm.width=Math.max(56,Math.min(120,Math.round(VW*.2)));mm.height=Math.max(8,Math.round(mm.width*H/W));mmDirty=true;mm.ok=0}
// Crisp pixels at any resolution: the engine picks a whole-number scale and widens or narrows the view to fill the window.
const SCR=RA.screen({el:root.querySelector('.screen'),canvas:cv,onResize:(w,h)=>{VW=w;VH=h;fogC.width=w;fogC.height=h;if(terr){sizeMini();buildSky()}}});
const CLOUD=['.....kkkk.......','...kkwwwwkk.....','..kwwwwwwwwkkk..','.kwwwwwwwwwwwwk.','kwwwwwwwwwwwwwwk','kwwwwwwwwwwwsswk','.kswwwssssssssk.','..kkkkkkkkkkkk..'];
// Parallax background: clouds and far mountains drift slowly, near hills faster. Same 8-bit art, modern depth.
function layer(f,draw){const c=document.createElement('canvas');c.width=Math.ceil(VW+(W-VW)*f)+2;c.height=Math.ceil(VH+(H-VH)*f)+2;draw(c.getContext('2d'),c.width,c.height);return{c,f}}
function buildSky(){
 const T=THEME,hc=T.hills;skyG=RA.fx.gradientCanvas(VW,VH,T.sky[0],T.sky[1],24);
 const range=(s,w,h,base,amp,top,bot,seed)=>{const g=s.createLinearGradient(0,h*(base-amp/h*2),0,h);g.addColorStop(0,top);g.addColorStop(1,bot);s.fillStyle=g;
  for(let x=0;x<w;x++){const y=Math.round(h*base+amp*Math.sin(x*.013+seed)+amp*.5*Math.sin(x*.041+seed*2)+amp*.2*Math.sin(x*.13));s.fillRect(x,y,1,h-y)}};
 layers=[
  layer(.08,(s,w,h)=>{for(let i=0;i<Math.max(4,Math.round(w/90));i++){const cx=(i*97+30)%w,cy=10+(i*41)%Math.max(24,h*.3),n=4+i%3,b=[];
   for(let k=0;k<n;k++)b.push({x:6+k*8+((k*7)%3),y:13+(k%2?-3:0)-(k>0&&k<n-1?3:0),r:6+(k*5)%4,col:T.cloud||'#fff4ec',spec:4,gloss:.15});
   s.globalAlpha=.92;s.drawImage(RA.fx.model(n*8+12,26,b,{amb:.62}),cx-n*4-6,cy-13);s.globalAlpha=1}}),
  layer(.22,(s,w,h)=>range(s,w,h,.5,16,hc[0],hc[1],2)),
  layer(.4,(s,w,h)=>range(s,w,h,.6,12,hc[2],hc[3],5)),
  layer(.6,(s,w,h)=>{range(s,w,h,.68,9,hc[4],hc[5],1);
   for(let x=4;x<w;x+=7){const y=Math.round(h*.68+9*Math.sin(x*.013+1)+4.5*Math.sin(x*.041+2)+1.8*Math.sin(x*.13))-1,t=4+hash(x,5)%5;s.fillStyle=hc[6];for(let k=0;k<t;k++)s.fillRect(x-(t-k>>1),y-k,(t-k>>1)*2+1,1)}})];
}

/* ---------- terrain (seeded so every online player builds the same map) ---------- */
// PS1-era terrain: textured soil (strata, pebbles, roots) lit from the top left, a lush grass cap, deeper soil gets darker
const DIT=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function soil(x,y,depth){const n=hash(x>>2,y>>2)%100/100,f=hash(x,y)%100/100,band=Math.sin(y*.16+Math.sin(x*.025)*2.4)*.5+.5;
 let c=[92+band*34+n*16,58+band*22+n*10,36+band*12+n*6];
 const px=x>>3,py=y>>3,hh=hash(px,py+999);
 if(hh%6===0){const cx=(px<<3)+(hh>>4)%6+1,cy=(py<<3)+(hh>>8)%6+1,d=(x-cx)**2+(y-cy)**2;if(d<6){const l=(x<cx||y<cy)?1.25:d>3?.7:1;c=[128*l,120*l,110*l]}}
 else if(hh%11===1&&Math.abs((x&7)-(y&7))<1&&f<.8)c=[150,120,80];                       // a root
 const k=Math.max(.5,1-depth/160)*(1+(DIT[(y&3)*4+(x&3)]-7.5)/90);return c.map(v=>v*k)}
// Map themes: a random one every round (survey). Cap = top layer colours, soil tint, sky + hill colours.
const THEMES=[
 {n:'Meadow',cap:[[176,236,88],[120,200,56],[80,164,44],[56,124,36],[44,96,30]],tint:[1,1,1],sky:['#26407e','#f2b47a'],hills:['#8c7ca8','#c8a0a0','#5c6c8c','#a88c8c','#2c5c44','#4c6c4c','#1c4430']},
 {n:'Desert',cap:[[248,220,140],[236,196,112],[216,168,88],[188,140,72],[160,116,60]],tint:[1.35,1.15,.8],sky:['#3a78c8','#f8d898'],hills:['#c89c78','#e8c098','#b07c58','#d0a078','#8c5c38','#a87850','#6c4428']},
 {n:'Arctic',cap:[[252,252,252],[224,236,248],[196,216,240],[168,192,224],[140,168,208]],tint:[.85,.95,1.3],sky:['#1c2c5c','#a8c8f0'],hills:['#9cb0d0','#d0e0f4','#7890b8','#b8c8e0','#5c7498','#8ca0c0','#3c5478']},
 {n:'Hell',cap:[[255,140,40],[232,88,24],[192,48,20],[140,28,20],[100,20,20]],tint:[1.3,.6,.55],sky:['#1c0408','#c83c14'],hills:['#5c1c1c','#943020','#3c1010','#782818','#240808','#481010','#140404']},
 {n:'Candy',cap:[[255,200,232],[248,160,208],[232,120,184],[200,96,160],[168,72,136]],tint:[1.25,.9,1.2],sky:['#5c3c9c','#ffc8e0'],hills:['#c89ce0','#f0c0e8','#a07cc8','#d8a0d0','#7c5ca8','#a888c8','#5c3c88']}];
let THEME=THEMES[0];
const GRASS=THEME.cap;
function setPix(i,c){const q=i*4,d=tImg.data;d[q]=c[0];d[q+1]=c[1];d[q+2]=c[2];d[q+3]=255}
const airAt=(x,y)=>x<0||x>=W||y<0?true:y>=H?false:!terr[y*W+x];
function genTerrain(seed){
 const R=mulberry(seed),r=(a,b)=>a+R()*(b-a);
 THEME=THEMES[(seed>>>0)%THEMES.length];buildSky();
 terr.fill(0);
 const p=[r(0,7),r(0,7),r(0,7)],f=[r(.005,.009),r(.017,.03),r(.07,.11)],base=H*.56,a0=H*.12,a1=H*.07;
 for(let x=0;x<W;x++){
  const edge=Math.min(1,Math.min(x,W-1-x)/70); // land slopes into the sea at both ends
  let h=Math.max(H*.28,base+a0*Math.sin(x*f[0]+p[0])+a1*Math.sin(x*f[1]+p[1])+5*Math.sin(x*f[2]+p[2]));
  h+=(1-edge)*(WATER-h)*.7;
  for(let y=Math.max(0,Math.floor(h));y<H;y++)terr[y*W+x]=1;}
 // floating islands to fight over
 for(let i=0,n=Math.round(W/420);i<n;i++){const cx=r(80,W-80),cy=r(H*.2,H*.38),rw=r(22,48),rh=r(6,11);
  for(let y=Math.floor(cy-rh);y<cy+rh*1.7;y++)for(let x=Math.floor(cx-rw);x<cx+rw;x++){
   const dx=(x-cx)/rw,dy=(y-cy)/(y<cy?rh:rh*1.7);if(dx*dx+dy*dy<1&&x>=0&&x<W&&y>=0&&y<H)terr[y*W+x]=1}}
 // caves
 for(let c=0,n=Math.round(W*H/26000);c<n;c++){const cx=r(30,W-30),cy=r(base,H-26),rr=r(8,18);
  for(let y=Math.floor(cy-rr);y<cy+rr;y++)for(let x=Math.floor(cx-rr);x<cx+rr;x++)
   if(x>=0&&x<W&&y>=0&&y<H&&(x-cx)**2+(y-cy)**2<rr*rr)terr[y*W+x]=0;}
 tImg.data.fill(0);
 for(let x=0;x<W;x++){let depth=0;
  for(let y=0;y<H;y++){const i=y*W+x;
   if(!terr[i]){depth=0;continue}
   const grass=depth<5+(hash(x,3)%3),below=airAt(x,y+1)||airAt(x+1,y+1),lit=airAt(x-1,y)||airAt(x-1,y-1);
   let c=grass?THEME.cap[Math.min(4,depth)]:soil(x,y,depth).map((v,k)=>Math.min(255,v*THEME.tint[k]));
   if(below)c=c.map(v=>v*.45);else if(lit&&!grass)c=c.map(v=>Math.min(255,v*1.35+12));else if(airAt(x+1,y))c=c.map(v=>v*.6);
   setPix(i,c);
   depth++;}}
 tD=[0,0,W,H];tDirty=true;mmDirty=true;
}
function markDirty(x0,y0,x1,y1){x0=Math.max(0,x0|0);y0=Math.max(0,y0|0);x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));
 tD=tD?[Math.min(tD[0],x0),Math.min(tD[1],y0),Math.max(tD[2],x1),Math.max(tD[3],y1)]:[x0,y0,x1,y1];tDirty=true;mmDirty=true}
function carve(cx,cy,r){
 const R=r+2;
 for(let y=Math.floor(cy-R);y<=cy+R;y++)for(let x=Math.floor(cx-R);x<=cx+R;x++){
  if(x<0||x>=W||y<0||y>=H)continue;
  const d2=(x-cx)**2+(y-cy)**2;if(d2<=r*r){const i=y*W+x;terr[i]=0;tImg.data[i*4+3]=0}
  else if(d2<=R*R&&terr[y*W+x]){const q=(y*W+x)*4,k=.72;tImg.data[q]*=k;tImg.data[q+1]*=k*.95;tImg.data[q+2]*=k*.9}}
 // black outline on the new crater edge, 8-bit style
 for(let y=Math.floor(cy-R);y<=cy+R;y++)for(let x=Math.floor(cx-R);x<=cx+R;x++){
  if(x<0||x>=W||y<0||y>=H)continue;const i=y*W+x;
  if(terr[i]&&(airAt(x-1,y)||airAt(x+1,y)||airAt(x,y-1)||airAt(x,y+1))){const q=i*4;setPix(i,[tImg.data[q]*.5+14,tImg.data[q+1]*.45+8,tImg.data[q+2]*.4+4])}}
 markDirty(cx-R-1,cy-R-1,cx+R+2,cy+R+2);
}

/* ---------- weapons ---------- */
// spr = how the shot is drawn; start = ammo at match start (inf = unlimited); crate = weight in weapon crates.
const DEF={
 bazooka:{n:'Bazooka',desc:'charge · wind',charge:1,speed:6.6,wind:1,r:16,dmg:38,cd:50,inf:1,spr:0,cam:1},
 homing:{n:'Homing Missile',charge:1,speed:6,r:16,dmg:40,cd:60,home:1,target:1,start:1,crate:3,spr:0,cam:1},
 mortar:{n:'Mortar',speed:6.4,wind:1,r:10,dmg:20,cd:60,split:5,piece:'shard',start:2,crate:3,spr:6,cam:1},
 grenade:{n:'Grenade',desc:'charge · bounces',charge:1,speed:5.4,r:19,dmg:44,cd:60,fuse:180,bounce:.45,inf:1,spr:1,cam:1},
 cluster:{n:'Cluster Bomb',charge:1,speed:5.4,r:12,dmg:24,cd:60,fuse:180,bounce:.45,split:5,piece:'bomblet',start:2,crate:3,spr:2,cam:1},
 banana:{n:'Banana Bomb',charge:1,speed:5.4,r:22,dmg:40,cd:80,fuse:180,bounce:.45,split:5,piece:'bananalet',crate:2,spr:4,cam:1},
 holy:{n:'Holy Hand Grenade',charge:1,speed:5,r:46,dmg:90,cd:80,fuse:180,bounce:.15,holy:1,crate:1,spr:5,cam:1},
 petrol:{n:'Petrol Bomb',charge:1,speed:5.6,r:6,dmg:8,cd:60,fire:14,start:1,crate:3,spr:7,cam:1},
 sheep:{n:'Sheep',walker:1,speed:1,r:28,dmg:55,cd:60,fuse:360,remote:1,start:1,crate:2,spr:8,cam:1},
 oldwoman:{n:'Old Woman',walker:1,speed:.6,r:24,dmg:50,cd:60,fuse:300,crate:2,spr:9,cam:1},
 shotgun:{n:'Shotgun',desc:'instant',ray:1,r:7,dmg:22,cd:34,inf:1},
 handgun:{n:'Handgun',ray:1,burst:6,every:7,r:4,dmg:8,cd:60,start:2,crate:3},
 uzi:{n:'Uzi',desc:'rapid fire',ray:1,auto:1,spread:.09,r:3,dmg:4,cd:7,inf:1},
 minigun:{n:'Minigun',ray:1,burst:24,every:3,spread:.12,r:4,dmg:5,push:1,cd:90,start:1,crate:2},
 punch:{n:'Fire Punch',melee:'punch',dmg:30,cd:50,start:2,crate:2},
 bat:{n:'Baseball Bat',melee:'bat',dmg:30,cd:60,start:1,crate:2},
 prod:{n:'Prod',melee:'prod',dmg:0,cd:30,inf:1},
 kamikaze:{n:'Kamikaze',kamikaze:1,r:26,dmg:55,cd:60,start:1,crate:1},
 dynamite:{n:'Dynamite',drop:1,r:28,dmg:60,cd:40,fuse:300,start:1,crate:3,spr:3},
 mine:{n:'Mine',drop:1,mine:1,r:16,dmg:40,cd:40,start:2,crate:3,spr:10},
 airstrike:{n:'Air Strike',strike:'missile',cd:90,target:1,start:1,crate:2},
 napalm:{n:'Napalm Strike',strike:'napbomb',cd:90,target:1,crate:2},
 donkey:{n:'Concrete Donkey',strike:'donkeyP',cd:120,target:1,crate:1},
 rope:{n:'Ninja Rope',rope:1,cd:12,inf:1},
 jetpack:{n:'Jet Pack',jet:1,cd:20,start:1,crate:2},
 parachute:{n:'Parachute',para:1,cd:10,start:2,crate:2},
 teleport:{n:'Teleport',teleport:1,cd:60,target:1,start:2,crate:2},
 girder:{n:'Girder',girder:1,cd:30,target:1,start:2,crate:2},
 armageddon:{n:'Armageddon',armageddon:1,cd:120,crate:.4},
 // more from the Worms series
 sheepl:{n:'Sheep Launcher',desc:'charge · lands a sheep',charge:1,speed:6,lands:'sheep',cd:70,start:1,crate:2,spr:8,cam:1},
 madcow:{n:'Mad Cows',desc:'three cows',walker:1,herd:3,speed:.8,r:20,dmg:35,cd:80,fuse:330,crate:2,spr:14,cam:1},
 skunk:{n:'Skunk',desc:'poison gas',walker:1,speed:1,r:12,dmg:20,poison:1,cd:60,fuse:300,start:1,crate:2,spr:18,cam:1},
 pigeon:{n:'Homing Pigeon',home:1,speed:3.4,r:18,dmg:40,cd:70,target:1,crate:2,spr:15,cam:1},
 mole:{n:'Mole Bomb',desc:'digs then blows',charge:1,speed:5,dig:60,r:20,dmg:40,cd:60,start:1,crate:2,spr:17,cam:1},
 vase:{n:'Ming Vase',drop:1,r:22,dmg:35,cd:50,fuse:240,split:6,piece:'shard',crate:2,spr:16},
 longbow:{n:'Longbow',desc:'instant · knockback',ray:1,r:2,dmg:16,push:1,cd:40,start:2,crate:3},
 flamer:{n:'Flamethrower',flamer:1,cd:60,start:1,crate:2},
 torch:{n:'Blow Torch',desc:'digs a tunnel',torch:1,dmg:12,cd:40,start:2,crate:2},
 mailstrike:{n:'Mail Strike',strike:'letter',cd:90,target:1,crate:2},
 minestrike:{n:'Mine Strike',strike:'mineP',cd:90,target:1,crate:2},
 sheepstrike:{n:'Sheep Strike',strike:'sheepP',cd:100,target:1,crate:1},
 quake:{n:'Earthquake',quake:1,cd:120,crate:1},
 scales:{n:'Scales of Justice',desc:'everyone shares health',scales:1,cd:120,crate:.6},
 nuke:{n:'Nuclear Test',desc:'water rises, all poisoned',nuke:1,cd:150,crate:.4},
 // pieces that weapons spawn
 bomblet:{r:9,dmg:16,fuse:50,bounce:.45,spr:2},
 shard:{r:8,dmg:14,spr:6},
 bananalet:{r:15,dmg:26,spr:4},
 missile:{r:13,dmg:30,spr:0},
 napbomb:{r:5,dmg:6,fire:8,spr:7},
 donkeyP:{r:22,dmg:40,donkey:6,spr:11},
 meteor:{r:16,dmg:30,spr:12},
 flame:{flame:1,spr:13},
 letter:{r:10,dmg:18,spr:19},
 mineP:{mine:1,r:16,dmg:40,spr:10},
 sheepP:{r:20,dmg:35,spr:8}
};
const WLIST=['bazooka','homing','mortar','grenade','cluster','banana','holy','petrol','sheep','oldwoman','shotgun','handgun','uzi','minigun','punch','bat','prod','kamikaze','dynamite','mine','airstrike','napalm','donkey','rope','jetpack','parachute','teleport','girder','armageddon','sheepl','madcow','skunk','pigeon','mole','vase','longbow','flamer','torch','mailstrike','minestrike','sheepstrike','quake','scales','nuke'];
const DEFAULTS=['bazooka','grenade','shotgun','uzi'];
const CRATES=WLIST.filter(id=>DEF[id].crate);
let ALLOW=null;   // weapons the host allowed this match (preset), null = all
const okW=id=>id==='bazooka'||!ALLOW||ALLOW.includes(id);
const startAmmo=()=>WLIST.map(id=>!okW(id)?0:DEF[id].inf?-1:(DEF[id].start|0));
const ammoOf=(p,id)=>p.ammo?p.ammo[WLIST.indexOf(id)]:-1;
const hasW=(p,id)=>{const a=ammoOf(p,id);return a<0||a>0};
function selectW(p,k){const id=WLIST[k];if(!id||!hasW(p,id)||p.charging||p.wpn===id)return;p.wpn=id;if(!isClient())sfx('sel')}
function cycleW(p,d){if(p.charging)return;let k=WLIST.indexOf(p.wpn);
 for(let n=0;n<WLIST.length;n++){k=(k+d+WLIST.length)%WLIST.length;if(hasW(p,WLIST[k])){selectW(p,k);return}}}

/* ---------- colors & local setup ---------- */
const BASE=[['Red','#d82800'],['Blue','#0078f8'],['Gold','#f8b800'],['Green','#00b800'],['Pink','#f878f8'],['Cyan','#00e8d8'],['Orange','#e45c10'],['Violet','#6844fc'],['Gray','#bcbcbc'],['Mint','#58f898']];
const COLORS=[];for(let i=0;i<MAXP;i++){const b=BASE[i%10];COLORS.push([i<10?b[0]:b[0]+' 2',b[1]])}
const CTRL=[['mk','Mouse + keys'],['k2','Keys IJKL'],['k3','Arrow keys'],['k4','Numpad'],['touch','Touch buttons'],['gp0','Gamepad 1'],['gp1','Gamepad 2'],['gp2','Gamepad 3'],['gp3','Gamepad 4'],['cpu','CPU']];
const wOpts=DEFAULTS.map((k,i)=>'<option value="'+i+'" title="'+DEF[k].desc+'">'+DEF[k].n+'</option>').join('');
let saved=null;try{saved=JSON.parse(localStorage.getItem('gb-setup'))}catch(e){}
const defCtrl=Array.from({length:MAXP},(_,i)=>i===0?(touchDev?'touch':'mk'):'cpu');
$('np').innerHTML=Array.from({length:MAXP-1},(_,i)=>'<option>'+(i+2)+'</option>').join('');
$('cpus').innerHTML=Array.from({length:MAXP},(_,i)=>'<option>'+i+'</option>').join('');
$('ow').innerHTML=wOpts;
$('slots').innerHTML=COLORS.map(([n,c],i)=>
 '<div class="slot" id="s'+i+'"><b class="chip" style="background:'+c+'">P'+(i+1)+'</b>'+
 '<select id="c'+i+'" aria-label="P'+(i+1)+' controls">'+CTRL.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select>'+
 '<select id="w'+i+'" aria-label="P'+(i+1)+' weapon">'+wOpts+'</select></div>').join('');
for(let i=0;i<MAXP;i++){const sc=saved&&saved.c&&saved.c[i];$('c'+i).value=(sc==='k1'?'mk':sc)||defCtrl[i];$('w'+i).value=(saved&&saved.w&&saved.w[i]!=null)?saved.w[i]:i%4}
$('np').value=(saved&&saved.np)||(touchDev?2:4);
if(saved&&saved.ow!=null)$('ow').value=saved.ow;
function syncSlots(){const n=+$('np').value;$('npVal').textContent=n;$('npMinus').disabled=n<=2;$('npPlus').disabled=n>=MAXP;for(let i=0;i<MAXP;i++)$('s'+i).hidden=i>=n}
$('np').addEventListener('change',syncSlots);
const stepNp=d=>{$('np').value=Math.max(2,Math.min(MAXP,+$('np').value+d));syncSlots();saveSetup()};
$('npMinus').addEventListener('click',()=>stepNp(-1));$('npPlus').addEventListener('click',()=>stepNp(1));syncSlots();
function saveSetup(){const ids=[...Array(MAXP).keys()];
 try{localStorage.setItem('gb-setup',JSON.stringify({np:+$('np').value,c:ids.map(i=>$('c'+i).value),w:ids.map(i=>+$('w'+i).value),ow:+$('ow').value}))}catch(e){}}
const APP=!!window.RA_APP;
let nickVal='';try{nickVal=localStorage.getItem('gb-nick')||''}catch(e){}
if(!nickVal)nickVal='Worm'+Math.floor(rnd(10,99));
$('nick').value=nickVal;$('nickRow').hidden=true;   // the nickname is picked once in the main menu (RA.player)
const nick=()=>RA.player.name||nickVal;
if(touchDev)$('localNote').textContent='Touch: put a finger on the game screen to aim at that spot. Hold to charge (the dotted line shows where it lands), let go to fire; guns fire right away; strikes and teleport land where you tap. Slide your thumb on the pad to walk. JUMP: tap for a hop, hold for a high jump, double-tap for a backflip. WPN switches weapon, tap the weapon name at the top for the full list. One player per phone; other slots can be CPU or a gamepad. Turn the phone sideways for a bigger screen.';
if(APP)$('netNote').textContent='Up to 20 players per room. Players on your network show up on their own; internet players appear once connected. Controls: A/D walk (the mouse only aims), Space jump, mouse aims, click fires, E/Q or wheel switch weapon, right-click for the weapon list, or a gamepad.';

/* ---------- state ---------- */
let padWanted=false;
let players=[],projs=[],parts=[],texts=[],crates=[],feedView=[];
let state='menu',wind=0,tick=0,matchT=0,crateT=0,windT=0,armT=0,armBy=null,graves=[];
// Host match settings (survey: host picks mode, lives, water, length, fog; spectators drop crates)
const MSET=[['mode','Mode',[['ffa','Free for all'],['teams','2 teams'],['sudden','Sudden death']]],
 ['lives','Lives',[[1,'1'],[2,'2'],[3,'3'],[5,'5']]],
 ['water','Water rises',[[30,'0:30'],[90,'1:30'],[150,'2:30'],[240,'4:00'],[0,'Never']]],
 ['len','Time limit',[[0,'None'],[5,'5 min'],[10,'10 min']]],
 ['fog','Fog of war',[[1,'Normal'],[2,'Wide'],[0,'Off']]],
 ['drops','Spectator crates',[[1,'On'],[0,'Off']]],
 ['party','Party crates',[[1,'On'],[0,'Off']]],
 ['wset','Weapons',[[0,'All weapons'],[1,'Preset 1'],[2,'Preset 2'],[3,'Preset 3']]]];
let CFG={mode:'ffa',lives:3,water:150,len:0,fog:1,drops:1,party:1,wset:0};
try{Object.assign(CFG,JSON.parse(localStorage.getItem('ra-worms-mset')||'{}'))}catch(e){}
let M={...CFG};   // settings of the match being played
const TEAMC=['#f04848','#4890f8'],TEAMN=['RED TEAM','BLUE TEAM'];
const suddenAt=()=>M.mode==='sudden'?60:M.water?M.water*60:1e9;
const sdLeft=()=>Math.max(0,Math.min(9999,Math.ceil((suddenAt()-matchT)/60)));
// Online: host runs the match, others send buttons and draw what the host sends.
const NET={mode:'local',host:false,lobby:null,room:null,user:null,db:null,me:null,code:'',
 order:[],mroster:[],matchId:0,seed:0,xs:0,xlog:[],feed:[],fs:0,fseen:0,winner:-1,names:{},lastI:-1,lastA:'',lastAT:0,lastB:0,lastL:0,hostGone:0,late:false,saved:false,sd:0,rec:null};
const isClient=()=>NET.mode==='online'&&!NET.host;
/* Lag-free online (engine RA.sync): every player's own worm moves, jumps, aims and ropes on their own PC.
   The host referees the rest (shots, explosions, damage, crates, deaths) and sends knockback to the worm's owner. */
const ownsW=p=>!!p&&(isClient()?!!p.mine:p.ctrl!=='net');
const SY=RA.sync({owns:i=>ownsW(players[i]),host:()=>NET.mode==='online'&&NET.host,
 onHit:(i,k,v)=>{const u=players[i];if(!u||!u.alive)return;
  if(k==='k'&&Array.isArray(v)){u.vx=(+v[0]||0)/100;u.vy=(+v[1]||0)/100;u.grounded=false;u.rope=u.rope&&Math.abs(u.vx)+Math.abs(u.vy)>3?null:u.rope}
  if(k==='t'&&Array.isArray(v)){u.x=(+v[0]||0)/10;u.y=(+v[1]||0)/10;u.vx=u.vy=0;u.grounded=false;u.rope=u.hook=null}}});
// knockback on a worm another device runs: tell its owner
const kicked=u=>{if(NET.mode==='online'&&!ownsW(u))SY.hit(u.i,'k',[Math.round(u.vx*100),Math.round(u.vy*100)])};
const LOCALW=w=>!!(w.rope||w.jet||w.para||w.teleport);   // these only move your own worm, so they run on your PC

function spawn(p){
 let best=null,bd=-1;
 for(let k=0;k<12;k++){
  const x=Math.round(rnd(14,W-14));let y=-1;
  for(let yy=0;yy<WATER-6;yy++)if(solid(x,yy+1)&&!solid(x,yy)){y=yy;break}
  if(y<0)continue;
  const d=Math.min(999,...players.filter(q=>q!==p&&q.alive).map(q=>Math.abs(q.x-x)));
  if(d>bd){bd=d;best=[x,y]}}
 if(!best)best=[W/2,10];
 p.life=(p.life|0)+1;Object.assign(p,{x:best[0],y:best[1],vx:0,vy:0,hp:100,alive:true,grounded:false,burst:0,kami:0,flip:0,rope:null,hook:null,jet:0,chute:0,lastJ:-99,charging:false,power:0,cd:30,dir:best[0]<W/2?1:-1,aim:.5,lastBy:null,inv:120,coy:0,jb:0,jumping:false,flash:0,reveal:0});
}
function startMatch(list,seed){
 setSize(list.length);genTerrain(seed);projs=[];parts=[];texts=[];crates=[];feedView=[];
 M={...CFG};if(M.mode==='sudden')M.lives=1;
 ALLOW=M.wset?wPreset(M.wset).w:null;list.forEach(d=>{if(!okW(d.weapon))d.weapon='bazooka'});
 players=list.map((d,i)=>({i,col:M.mode==='teams'?TEAMC[i%2]:COLORS[i][1],team:M.mode==='teams'?i%2:i,lives:M.lives,kills:0,prev:{},ammo:startAmmo(),wpn:d.weapon,...d}));
 players.forEach(spawn);
 wind=0;tick=0;matchT=0;crateT=240;windT=0;armT=0;armBy=null;graves=[];NET.xs=0;NET.xlog=[];NET.feed=[];NET.fs=0;NET.winner=-1;NET.wl='';NET.dt={};NET.lowG=0;G=G0;memClear();NET.saved=false;state='play';if(NET.mode==='online')SY.reset();
 showGame();
}
function newLocalGame(){
 saveSetup();const n=+$('np').value,list=[];
 const SEATN=RA.player.seats([...Array(n)].map((_,i)=>$('c'+i).value));for(let i=0;i<n;i++)list.push({name:SEATN[i],ctrl:$('c'+i).value,weapon:DEFAULTS[+$('w'+i).value]});
 NET.mode='local';startMatch(list,(Math.random()*1e9)|0);
}
function showGame(){
 $('toMenu').hidden=true;
 $('setup').hidden=true;$('online').hidden=true;$('tabs').hidden=true;$('title').hidden=true;$('over').hidden=true;
 const tp=NET.mode==='online'?touchDev:players.some(p=>p.ctrl==='touch');
 padWanted=tp;$('pad').hidden=!tp;document.body.classList.toggle('touchplay',tp);RA.hud.disarm();
 document.body.classList.add('playing');document.body.classList.toggle('many',players.length>8);openPanel(false);
 mouse.down=false;music.play('worms',NET.mode==='online'?(NET.matchId>>>0)%3:Math.floor(Math.random()*3));
 hud();
}
function showMenu(){
 state='menu';padWanted=false;specIdx=-1;lastPts=[];$('spec').hidden=true;$('toMenu').hidden=false;document.body.classList.remove('touchplay','playing','mouseaim');openPanel(false);$('wbar').hidden=true;
 music.play('worms',3);$('over').hidden=true;$('pad').hidden=true;$('tabs').hidden=false;$('title').hidden=false;
 const on=$('tabOnline').classList.contains('on');$('setup').hidden=on;$('online').hidden=!on;
 $('players').innerHTML='';feedView=[];hud();
}
function renderRanks(){
 const list=players.slice().sort((a,b)=>(b.lives>0)-(a.lives>0)||(b.outAt||0)-(a.outAt||0)||b.lives-a.lives||b.kills-a.kills);
 $('ranks').innerHTML=list.slice(0,8).map((p,k)=>'<li style="animation-delay:'+k*60+'ms"><span class="pos">'+(k+1)+'</span><span style="color:'+p.col+'">'+esc(nameOf(p))+'</span><em>'+p.kills+' KO</em></li>').join('');
}
// time limit: most worms left, then most KOs (per team in team mode)
function leader(){const sc={};for(const p of players){const k=p.team,o=sc[k]||(sc[k]={k,l:0,ko:0,p});o.l+=Math.max(0,p.lives);o.ko+=p.kills|0;if(p.lives>o.p.lives)o.p=p}
 const a=Object.values(sc).sort((x,y)=>y.l-x.l||y.ko-x.ko);return a.length>1&&a[0].l===a[1].l&&a[0].ko===a[1].ko?null:a[0].p}
function gameOver(p){
 state='over';NET.winner=p?p.i:-1;NET.wl=p?(M.mode==='teams'?TEAMN[p.team]:nameOf(p).toUpperCase())+' WINS':'DRAW';
 $('winner').textContent=NET.wl;$('over').hidden=false;$('pad').hidden=true;
 renderRanks();
 $('again').textContent=NET.mode==='online'?'BACK TO ROOM':'NEW MATCH';$('again').hidden=false;$('overNote').hidden=true;
 if(NET.host||NET.mode!=='online')saveStats();
 if(NET.mode==='online'&&NET.host)RA.autoBack({still:()=>state==='over'&&NET.mode==='online',label:n=>$('again').textContent='BACK TO ROOM ('+n+')',go:()=>$('again').click()});
 hud();
}

/* ---------- physics ---------- */
const curW=p=>DEF[p.wpn]||DEF.bazooka;
function hitWorm(x,y,owner,age){
 return players.find(u=>u.alive&&!(u===owner&&age<12)&&Math.abs(u.x-x)<4.5&&y>u.y-15&&y<u.y+1.5);
}
function addFeed(k,v){
 NET.feed.push([k,v,++NET.fs]);if(NET.feed.length>4)NET.feed.shift();
 feedView.push({k,v,until:performance.now()+5000});
}
function die(p,boom){
 if(!p.alive)return;
 p.alive=false;p.lives--;if(p.lives<=0)p.outAt=matchT;p.respawn=120;p.charging=false;p.burst=0;p.kami=0;p.rope=p.hook=null;p.jet=0;p.chute=0;
 if(p.y<WATER){graves.push({x:p.x,y:p.y-4,vy:-1.5,col:p.col,c:lookOf(p).grave==='Celtic'});if(graves.length>40)graves.shift()}
 const killer=p.lastBy&&p.lastBy!==p?p.lastBy:null;
 if(killer)killer.kills++;
 addFeed(killer?killer.i:-1,p.i);
 if(boom){word(p.x,p.y-20);explode(p.x,p.y-4,9,14,null)}
}
function stepWorm(u){
 if(!u.alive)return;
 if(u.kami>0){const[cx,cy]=aimVec(u);u.kami--;u.grounded=false;
  for(let s=0;s<5;s++){u.x+=cx*.9;u.y+=cy*.9;
   if(solid(u.x,u.y-4)||hitWorm(u.x,u.y-4,u,0)||u.kami<=0||u.x<0||u.x>=W||u.y>WATER){u.kami=0;explode(u.x,u.y-4,DEF.kamikaze.r,DEF.kamikaze.dmg,u);u.hp=0;return}}
  parts.push({x:u.x-cx*4,y:u.y-4-cy*4,vx:0,vy:0,t:10,col:tick&2?'#f8b800':'#d82800',g:0});return}
 if(u.inv>0)u.inv--;
 if(u.flash>0)u.flash--;
 if(u.reveal>0)u.reveal--;
 if(u.hide>0&&!isClient())u.hide--;
 if(u.poison>0&&!isClient()){u.poison--;if(u.poison%40===0&&u.hp>1){u.hp--;if(u.poison%120===0)texts.push({x:u.x,y:u.y-17,n:3,t:40,col:'#a8f048'})}}
 if(u.hook){const h=u.hook;
  for(let s=0;s<4;s++){h.x+=h.vx/4;h.y+=h.vy/4;
   if(solid(h.x,h.y)){u.rope={x:h.x,y:h.y,len:Math.max(10,Math.hypot(h.x-u.x,h.y-(u.y-5)))};u.hook=null;u.grounded=false;u.chute=0;sfx('sel');break}}
  if(u.hook&&++h.t>24)u.hook=null}
 if(u.rope){ropeStep(u);return}
 if(u.grounded){if(solid(u.x,u.y+1))return;u.grounded=false}
 if(u.chute)u.vx+=(wind*.6-u.vx)*.04;
 u.vy=Math.min(u.vy+(u.jet>0?G*.45:u.chute?G*.4:G),u.chute?.7:7);
 const steps=Math.ceil(Math.max(Math.abs(u.vx),Math.abs(u.vy)))+1;
 for(let s=0;s<steps;s++){
  let nx=u.x+u.vx/steps;
  if(solid(nx,u.y-3)||solid(nx,u.y-7)){u.vx*=-.3;nx=u.x}
  let ny=u.y+u.vy/steps;
  if(u.vy<0&&solid(nx,ny-9)){u.vy=0;ny=u.y}
  if(u.vy>=0&&solid(nx,ny+1)){
   u.x=nx;u.y=Math.floor(ny);let g=0;while(solid(u.x,u.y)&&g++<8)u.y--;
   u.flip=0;u.chute=0;
   if(u.vy>1.6)for(let i=0;i<4;i++)parts.push({x:u.x+rnd(-3,3),y:u.y,vx:rnd(-.6,.6),vy:rnd(-.6,-.1),t:16,col:'#bcbcbc',g:0});
   if(u.vy>3.6&&u.inv<=0&&!(u.jet>0)){const dmg=Math.round((u.vy-3.6)*12);u.hp-=dmg;if(isClient())NET.fd=(NET.fd|0)+dmg;u.flash=6;texts.push({x:u.x,y:u.y-17,n:dmg,t:50,col:u.col})}
   u.vx=0;u.vy=0;u.grounded=true;u.jumping=false;return;}
  u.x=nx;u.y=ny;}
 if(u.y>WATER){if(isClient()){u.vx=0;u.vy=Math.min(u.vy,.5);return}splash(u.x);die(u,false)}
}
// Ninja Rope: swing on a fixed-length rope, bump off walls, let go with jump.
function ropeStep(u){const r=u.rope;
 if(!solid(r.x,r.y)&&!solid(r.x+1,r.y)&&!solid(r.x-1,r.y)&&!solid(r.x,r.y+1)&&!solid(r.x,r.y-1)){u.rope=null;return} // anchor blown away
 u.vy+=G;u.vx*=.996;u.vy*=.996;
 let nx=u.x+u.vx,ny=u.y+u.vy;
 const dx=nx-r.x,dy=(ny-5)-r.y,d=Math.hypot(dx,dy)||1;
 if(d>r.len){const k=r.len/d,ux=dx/d,uy=dy/d,vr=u.vx*ux+u.vy*uy;nx=r.x+dx*k;ny=r.y+dy*k+5;if(vr>0){u.vx-=vr*ux;u.vy-=vr*uy}}
 if(solid(nx,ny)||solid(nx,ny-4)||solid(nx,ny-8)){u.vx*=-.35;u.vy*=-.35;if(solid(u.x,u.y-4))u.rope=null}
 else{u.x=nx;u.y=ny}
 if(Math.abs(u.vx)>.05)u.dir=u.vx<0?-1:1;
 if(u.y>WATER){u.rope=null;splash(u.x);die(u,false)}
}
function walk(u,dir){
 u.dir=dir;const nx=u.x+dir*.85;
 for(let up=0;up<=4;up++)if(!solid(nx,u.y-up)&&!solid(nx,u.y-up-7)){u.x=nx;u.y-=up;return}
}
const pixCircle=(cx,cy,r,col)=>RA.gfx.circle(ctx,cx,cy,r,col);
function debris(x,y,r){
 r=r||10;parts.push({ring:1,x,y,r,t:9});
 for(let i=0,n=6+r/3;i<n;i++){const a=rnd(0,6.28),s=rnd(.6,2.4);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,t:28,col:i%2?NES.dirt:'#000',g:.1})}
 for(let i=0,n=3+r/6;i<n;i++){const a=rnd(0,6.28),s=rnd(1.5,3.5);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,t:rnd(14,24)|0,col:i%2?'#f8b800':'#fcfcfc',g:.12})}
 for(let i=0,n=2+r/5;i<n;i++)parts.push({smoke:1,x:x+rnd(-r/2,r/2),y:y+rnd(-r/2,r/3),vx:rnd(-.2,.2),vy:rnd(-.5,-.15),t:rnd(35,65)|0,s:rnd(2,r>=20?6:4)|0,g:0});
 shake=Math.max(shake,Math.min(5,r/6));
 if(r>=20&&typeof seen==='function'&&seen(x,y))flashT=3;
}
let flashT=0;
function explode(x,y,r,dmg,src){
 x=Math.round(x);y=Math.round(y);
 carve(x,y,r);
 if(NET.host){NET.xlog.push([++NET.xs,x,y,r]);if(NET.xlog.length>16)NET.xlog.shift()}
 for(const u of players){if(!u.alive||u.inv>0)continue;
  const dx=u.x-x,dy=(u.y-4)-y,d=Math.hypot(dx,dy),R=r+5;
  if(d<R){const f=1-d/R,h=Math.round(dmg*(.35+.65*f));u.hp-=h;u.flash=6;
   if(src&&src!==u)u.lastBy=src;
   texts.push({x:u.x,y:u.y-17,n:h,t:50,col:u.col});
   const k=f*3.4/(d||1);u.vx+=dx*k;u.vy+=dy*k-1.3*f;u.grounded=false;kicked(u)}}
 debris(x,y,r);if(r>=20)word(x,y-r-4);
 const hit=crates.filter(c=>Math.hypot(c.x-x,c.y-4-y)<r+3);
 crates=crates.filter(c=>!hit.includes(c));
 sfx('boom',r);
 for(const c of hit)explode(c.x,c.y-4,10,15,src);
}
function splash(x){for(let i=0;i<8;i++)parts.push({x:x+rnd(-3,3),y:WATER,vx:rnd(-.8,.8),vy:rnd(-2.2,-.8),t:35,col:NES.waterL,g:.1})}
function boom(p,x,y){
 const w=p.w;
 if(w.donkey){p.n=(p.n==null?w.donkey:p.n)-1;explode(x,y,w.r,w.dmg,p.owner);if(p.n>0){p.y=y+2;p.vy=1.6;p.vx=0;return}p.dead=true;return}
 if(w.lands){p.dead=true;const sw=DEF[w.lands];projs.push({x,y:y-3,vx:0,vy:-1,w:sw,dir:p.vx<0?-1:1,fuse:sw.fuse,age:0,owner:p.owner,ground:false,bump:0,cam:1});return}
 if(w.dig&&!p.dug){p.dug=1;p.dg=w.dig;const d=Math.hypot(p.vx,p.vy)||1;p.dx=p.vx/d*1.3;p.dy=p.vy/d*1.3;return}
 p.dead=true;
 if(w.poison)for(const u of players)if(u.alive&&Math.hypot(u.x-x,u.y-y)<w.r+34)u.poison=600;
 if(w.holy)sfx('holy');
 if(w.r)explode(x,y,w.r,w.dmg,p.owner);
 if(w.fire)for(let i=0;i<w.fire;i++)projs.push({x,y:y-3,vx:rnd(-1.5,1.5),vy:rnd(-2.6,-.6),w:DEF.flame,t:rnd(150,240)|0,age:0,owner:p.owner});
 if(w.split){const pc=DEF[w.piece],k=w.banana||w.piece==='bananalet'?1.35:1;
  for(let i=0;i<w.split;i++)projs.push({x,y:y-2,vx:rnd(-1.6,1.6)*k,vy:rnd(-3,-1.5)*k,w:pc,fuse:pc.fuse?rnd(35,65):undefined,age:99,owner:p.owner})}
}
// tunnels (mole, blow torch, quake): carve and tell everyone, no damage
function digAt(x,y,r){x=Math.round(x);y=Math.round(y);carve(x,y,r);if(NET.host){NET.xlog.push([++NET.xs,x,y,r]);if(NET.xlog.length>16)NET.xlog.shift()}}
// place a worm somewhere (its owner's device is told when another PC runs it)
function place(u,x,y){u.x=x;u.y=y;u.vx=u.vy=0;u.grounded=false;if(NET.mode==='online'&&!ownsW(u))SY.hit(u.i,'t',[Math.round(x*10),Math.round(y*10)])}
// Party crates (survey: wild party / troll items). Purple "?" crates, the host rolls one of these.
const PARTY=[
 ['LOW GRAVITY',p=>{NET.lowG=900}],
 ['SWAP!',p=>{const o=players.filter(u=>u.alive&&u!==p);if(!o.length)return;const u=o[Math.floor(Math.random()*o.length)],a=[p.x,p.y];place(p,u.x,u.y);place(u,a[0],a[1])}],
 ['SHEEP RAIN',p=>{for(const u of players.filter(u=>u.alive&&u!==p).slice(0,5))projs.push({x:u.x+rnd(-20,20),y:-10,vx:0,vy:1,w:DEF.sheepP,age:99,owner:p})}],
 ['DISCO!',p=>{for(const u of players)if(u.alive){u.vx=rnd(-1.5,1.5);u.vy=-3;u.grounded=false;kicked(u)}}],
 ['INVISIBLE',p=>{p.hide=600}],
 ['SHIELD',p=>{p.inv=420}],
 ['WEAPON STORM',p=>{const pool=CRATES.filter(okW);for(let i=0;i<3&&pool.length;i++){const k=WLIST.indexOf(pool[Math.floor(Math.random()*pool.length)]);if(p.ammo[k]>=0)p.ammo[k]=Math.min(9,p.ammo[k]+1)}}],
 ['STINK BOMB',p=>{for(const u of players)if(u.alive&&u!==p&&Math.abs(u.x-p.x)<160)u.poison=600}],
 ['GOTCHA!',p=>{explode(p.x,p.y-4,14,22,null)}]];
function partyCrate(p){const e=PARTY[Math.floor(Math.random()*PARTY.length)];e[1](p);texts.push({x:p.x,y:p.y-24,s:e[0],t:90,col:'#c878f8'});sfx('holy')}
// Fire from petrol and napalm: falls, sticks to the ground, burns whoever stands in it.
function stepFlame(p){
 if(--p.t<=0||p.y>WATER||p.x<0||p.x>=W){p.dead=true;return}
 if(!p.st){p.vy=Math.min(p.vy+G,4);const nx=p.x+p.vx,ny=p.y+p.vy;if(solid(nx,ny))p.st=1;else{p.x=nx;p.y=ny}}
 else if(!solid(p.x,p.y+1)){p.st=0;p.vx=0}
 if(p.t%6===0)for(const u of players)if(u.alive&&u.inv<=0&&Math.abs(u.x-p.x)<5&&p.y>u.y-11&&p.y<u.y+3){u.hp-=2;u.flash=4;if(u!==p.owner)u.lastBy=p.owner}
}
// Sheep and Old Woman walk, hop over bumps, turn at walls and blow up (sheep: click again to detonate).
function stepWalker(p){
 if(p.fuse!=null&&--p.fuse<=0){boom(p,p.x,p.y-3);return}
 if(p.x<0||p.x>=W){p.dead=true;return}
 if(p.ground){
  if(!solid(p.x,p.y+1))p.ground=false;
  else{const nx=p.x+p.dir*p.w.speed;let ok=false;
   for(let up=0;up<=4&&!ok;up++)if(!solid(nx,p.y-up)&&!solid(nx,p.y-up-5)){p.x=nx;p.y-=up;ok=true}
   if(!ok){if(++p.bump>2){p.dir*=-1;p.bump=0}p.vx=p.dir;p.vy=-2.6;p.ground=false}
   else if(Math.random()<.008){p.vx=p.dir;p.vy=-2.2;p.ground=false}
   return}}
 p.vy=Math.min(p.vy+G,5);
 const st=Math.ceil(Math.max(Math.abs(p.vx),Math.abs(p.vy)))+1;
 for(let s=0;s<st;s++){const nx=p.x+p.vx/st,ny=p.y+p.vy/st;
  if(solid(nx,p.y-3)){p.vx=-p.vx*.5;p.dir=Math.sign(p.vx)||p.dir}else p.x=nx;
  if(p.vy>=0&&solid(p.x,ny+1)){p.y=Math.floor(ny);let g=0;while(solid(p.x,p.y)&&g++<6)p.y--;p.ground=true;p.vx=0;p.vy=0;break}
  if(p.vy<0&&solid(p.x,ny-5))p.vy=0;else p.y=ny}
 if(p.y>WATER){splash(p.x);p.dead=true}
}
function stepProj(p){
 p.age++;
 if(p.w.flame)return stepFlame(p);
 if(p.w.walker)return stepWalker(p);
 if(p.dug){if(--p.dg<=0||p.x<0||p.x>=W||p.y>=H){boom(p,p.x,p.y);return}p.x+=p.dx;p.y+=p.dy;if(p.dg%3===0)digAt(p.x,p.y,5);
  if(hitWorm(p.x,p.y,p.owner,99)){boom(p,p.x,p.y);return}return}
 if(p.w.home&&p.age===1&&p.tx!=null){let best=null,bd=1e9;for(const u of players){if(!u.alive||u===p.owner||(M.mode==='teams'&&p.owner&&u.team===p.owner.team))continue;const d=Math.hypot(u.x-p.tx,u.y-5-p.ty);if(d<bd){bd=d;best=u}}p.lock=best}
 if(p.w.home&&p.lock&&p.lock.alive){p.tx=p.lock.x;p.ty=p.lock.y-5}
 if(p.w.home&&p.age>14&&p.tx!=null){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy)||1,sp=Math.max(3.2,Math.min(5,Math.hypot(p.vx,p.vy)));
  p.vx+=(dx/d*sp-p.vx)*.2;p.vy+=(dy/d*sp-p.vy)*.2-G;if(p.age%3===0)parts.push({x:p.x,y:p.y,vx:0,vy:0,t:12,col:'#bcbcbc',g:0})}
 p.vy+=G;if(p.w.wind)p.vx+=wind*.006;
 const sticky=p.w.fuse||p.w.mine;
 const steps=Math.ceil(Math.hypot(p.vx,p.vy))+1;
 for(let s=0;s<steps;s++){
  const nx=p.x+p.vx/steps,ny=p.y+p.vy/steps;
  if(solid(nx,ny)){
   if(!sticky){boom(p,nx,ny);return}
   if(p.w.bounce){const b=p.w.bounce,hx=solid(nx,p.y),hy=solid(p.x,ny);
    if(hx)p.vx*=-b;if(hy){p.vy*=-b;if(Math.abs(p.vy)<.4)p.vy=0}
    if(!hx&&!hy){p.vx*=-b;p.vy*=-b}p.vx*=.9}
   else{p.vx=0;p.vy=0}
   break;}
  if(!sticky&&hitWorm(nx,ny,p.owner,p.age)){boom(p,nx,ny);return}
  p.x=nx;p.y=ny;}
 if(p.w.mine&&p.fuse==null&&p.age>90&&players.some(u=>u.alive&&Math.abs(u.x-p.x)<12&&Math.abs(u.y-p.y)<12)){p.fuse=40;sfx('pick')}
 if(p.fuse!=null&&--p.fuse<=0){boom(p,p.x,p.y);return}
 if(p.x<-40||p.x>W+40||p.y>WATER){if(p.y>WATER)splash(p.x);p.dead=true}
}
const aimVec=u=>[Math.cos(u.aim)*u.dir,-Math.sin(u.aim)];
function shootRay(p,w){
 const a=p.aim+(w.spread||0)*rnd(-1,1),vx=Math.cos(a)*p.dir,vy=-Math.sin(a);
 let x=p.x+vx*4,y=p.y-5+vy*4;
 for(let i=0;i<300;i++){x+=vx;y+=vy;
  if(i%3===0)parts.push({x,y,vx:0,vy:0,t:4,col:'#fcfcfc',g:0});
  if(x<0||x>=W||y>=H||y<-50)break;
  const u=hitWorm(x,y,p,0);
  if(solid(x,y)||u){explode(x,y,w.r,w.dmg,p);if(u&&w.push){u.vx+=vx*.9;u.vy+=vy*.9-.3;u.grounded=false;kicked(u)}break}}
 p.reveal=45;sfx('shot');
}
function melee(p,w){
 const[cx,cy]=aimVec(p),kind=w.melee,reach=kind==='bat'?15:11;
 if(kind==='punch'){p.vy=-3.4;p.grounded=false;p.jumping=false}
 for(const u of players){if(u===p||!u.alive||u.inv>0)continue;
  const dx=u.x-p.x,dy=u.y-p.y;
  if(Math.abs(dy)>12||Math.abs(dx)>reach||(dx!==0&&Math.sign(dx)!==p.dir))continue;
  u.lastBy=p;if(w.dmg){u.hp-=w.dmg;u.flash=6;texts.push({x:u.x,y:u.y-17,n:w.dmg,t:50,col:u.col})}
  if(kind==='bat'){u.vx=cx*6;u.vy=cy*6-1}else if(kind==='punch'){u.vx=p.dir*1.2;u.vy=-5}else{u.vx=p.dir*1.6;u.vy=-1.2}
  u.grounded=false;kicked(u);shake=Math.max(shake,2);word(u.x,u.y-22)}
 parts.push({ring:1,x:p.x+p.dir*7,y:p.y-5,r:4,t:6});sfx('shot');
}
function sparkle(x,y){for(let i=0;i<12;i++){const a=i/12*6.28;parts.push({x,y,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3,t:18,col:i%2?'#fcfcfc':'#3cbcfc',g:0})}}
function teleport(p){const x=Math.round(p.tx),y=Math.round(p.ty);
 if(x<6||x>W-6||y<10||y>WATER-6||solid(x,y)||solid(x,y-8))return false;
 sparkle(p.x,p.y-5);p.x=x;p.y=y;p.vx=p.vy=0;p.grounded=false;sparkle(x,y-5);sfx('pick');return true}
// Girder: a steel bar you place in the air or against walls (Worms style).
function addGirder(cx,cy){cx=Math.round(cx);cy=Math.round(cy);
 for(let y=cy-2;y<cy+2;y++)for(let x=cx-16;x<cx+16;x++){if(x<0||x>=W||y<0||y>=H)continue;const i=y*W+x;terr[i]=1;
  setPix(i,y===cy-2||y===cy+1||x===cx-16||x===cx+15?[0,0,0]:(x-cx+16)%8===4?[124,124,124]:[188,188,188])}
 markDirty(cx-17,cy-3,cx+17,cy+3);
 if(NET.host){NET.xlog.push([++NET.xs,cx,cy,-1]);if(NET.xlog.length>16)NET.xlog.shift()}}
function girder(p){const x=p.tx,y=p.ty;
 if(y>WATER-4||y<4||x<0||x>W)return false;
 if(players.some(u=>u.alive&&Math.abs(u.x-x)<18&&u.y>y-3&&u.y-10<y+3))return false;
 addGirder(x,y);sfx('pick');return true}
// Returns false when nothing happened (bad teleport/girder spot), so no ammo is used.
function fire(p){
 const w=curW(p),[cx,cy]=aimVec(p);
 if(isClient()){if(!p.mine)return false;
  if(w.para&&(p.grounded||p.chute||p.rope))return false;
  if(w.teleport&&!teleport(p))return false;
  NET.fq.push([++NET.fqs,WLIST.indexOf(p.wpn),Math.round(p.aim*1000),p.dir,Math.round((p.power||0)*100),Math.round(p.tx),Math.round(p.ty),Math.round(p.x*10),Math.round(p.y*10)]);
  if(NET.fq.length>8)NET.fq.shift();
  if(!LOCALW(w)){p.cd=w.cd;p.reveal=45;return true}
  if(w.teleport){p.cd=w.cd;return true}}
 if(w.rope){if(p.rope||p.hook)p.rope=p.hook=null;else{p.hook={x:p.x,y:p.y-5,vx:cx*8,vy:cy*8,t:0};p.jet=0;p.chute=0}p.cd=w.cd;sfx('sel');return true}
 if(w.jet&&p.jet>0){p.jet=0;p.cd=w.cd;return true}
 if(w.para){if(p.grounded||p.chute||p.rope)return false;p.chute=1;p.jet=0}
 else if(w.jet){p.jet=360;p.rope=p.hook=null;p.chute=0;p.grounded=false;p.vy=Math.min(p.vy,-1)}
 else if(w.teleport){if(!teleport(p))return false}
 else if(w.girder){if(!girder(p))return false}
 else if(w.ray){if(w.burst){p.burst=w.burst;p.burstT=0;p.burstW=w}else shootRay(p,w)}
 else if(w.melee)melee(p,w);
 else if(w.kamikaze){p.kami=70;p.vx=p.vy=0;p.grounded=false;sfx('shot')}
 else if(w.armageddon){armT=480;armBy=p;sfx('holy')}
 else if(w.strike){const tx=Math.max(10,Math.min(W-10,p.tx)),pc=DEF[w.strike];
  if(w.strike==='donkeyP')projs.push({x:tx,y:-20,vx:0,vy:1.6,w:pc,age:99,owner:p});
  else{const n=w.strike==='napbomb'||w.strike==='letter'?3:2;for(let i=-n;i<=n;i++)projs.push({x:tx+i*8,y:-10-Math.abs(i)*6,vx:p.dir*.35,vy:2,w:pc,age:99,owner:p})}
  sfx('shot')}
 else if(w.flamer){for(let i=0;i<10;i++)projs.push({x:p.x+cx*6,y:p.y-5+cy*6,vx:cx*rnd(2,3.4)+rnd(-.3,.3),vy:cy*rnd(2,3.4)+rnd(-.3,.3),w:DEF.flame,t:rnd(120,200)|0,age:0,owner:p});sfx('shot')}
 else if(w.torch){for(let i=1;i<=9;i++){const x=p.x+cx*i*5,y=p.y-5+cy*i*5;digAt(x,y,6);const u=hitWorm(x,y,p,0);if(u&&u.inv<=0){u.hp-=w.dmg;u.flash=6;u.lastBy=p}}sfx('shot')}
 else if(w.quake){shake=14;for(const u of players)if(u.alive&&u!==p){u.vx=rnd(-2,2);u.vy=rnd(-3.4,-1.6);u.grounded=false;kicked(u)}for(let i=0;i<6;i++)digAt(rnd(10,W-10),WATER-rnd(2,30),8);sfx('boom',30)}
 else if(w.scales){const al=players.filter(u=>u.alive),avg=Math.round(al.reduce((a,u)=>a+u.hp,0)/Math.max(1,al.length));for(const u of al){u.hp=avg;u.flash=6}sfx('holy')}
 else if(w.nuke){WATER=Math.max(Math.round(H*.4),WATER-24);for(const u of players)if(u.alive&&u!==p)u.poison=900;shake=20;sfx('holy')}
 else if(w.drop)projs.push({x:p.x,y:p.y-4,vx:p.dir*.6,vy:-1,w,fuse:w.fuse,age:0,owner:p});
 else if(w.walker)for(let i=0;i<(w.herd||1);i++)projs.push({x:p.x+p.dir*5,y:p.y-2,vx:p.dir*(1.2+i*.5),vy:-1.6-i*.4,w,dir:p.dir,fuse:w.fuse+i*25,age:0,owner:p,ground:false,bump:0,cam:i?0:1});
 else{
  const sp=w.speed*(w.charge?Math.max(.15,p.power):1);
  projs.push({x:p.x+cx*5,y:p.y-5+cy*5,vx:cx*sp,vy:cy*sp,w,fuse:w.fuse,age:0,owner:p,tx:p.tx,ty:p.ty,cam:w.cam});
 }
 p.cd=w.cd;
 const k=WLIST.indexOf(p.wpn);if(p.ammo[k]>0&&--p.ammo[k]===0)p.wpn='bazooka';
 p.reveal=45; // firing gives away your position through the fog
 if(!w.ray&&!w.melee&&!w.strike&&!w.kamikaze&&!w.para&&!w.jet)sfx('shot');
 return true;
}

/* ---------- crates ---------- */
function spawnCrate(force){
 if(!force&&crates.length>=Math.max(4,Math.round(W/220)))return;
 const hp=Math.random()<.3;
 const party=!hp&&M.party&&Math.random()<.3,pool=CRATES.filter(okW);
 let id=null;if(!hp&&pool.length){let t=Math.random()*pool.reduce((a,k)=>a+DEF[k].crate,0);id=pool.find(k=>(t-=DEF[k].crate)<0)||pool[0]}
 if(!hp&&!party&&!id)return;
 crates.push({x:Math.round(rnd(12,W-12)),y:-8,hp,id,party,landed:false});
}
function stepCrate(c){
 c.landed=solid(c.x,c.y+1)||solid(c.x-3,c.y+1)||solid(c.x+3,c.y+1);
 if(!c.landed)c.y+=.5;
 if(c.y>WATER){c.gone=true;return}
 for(const p of players){if(!p.alive||Math.abs(p.x-c.x)>6||Math.abs(p.y-c.y)>8)continue;
  c.gone=true;sfx('pick');
  if(c.party)partyCrate(p);else if(c.hp){p.hp=Math.min(150,p.hp+35);texts.push({x:p.x,y:p.y-17,n:35,t:50,col:'#58d854'})}
  else{const k=WLIST.indexOf(c.id);if(p.ammo[k]>=0)p.ammo[k]=Math.min(9,p.ammo[k]+1);texts.push({x:p.x,y:p.y-24,s:'+'+DEF[c.id].n.toUpperCase(),t:70,col:'#f8b800'})}
  break;}
}

/* ---------- input ---------- */
const KEYS={
 mk:{KeyA:'left',KeyD:'right',Space:'jump',KeyW:'up',KeyS:'down',KeyE:'next',KeyQ:'prev',KeyF:'fire'},
 k2:{KeyJ:'left',KeyL:'right',KeyI:'up',KeyK:'down',KeyU:'jump',KeyO:'fire',KeyP:'next'},
 k3:{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Period:'jump',Slash:'fire',Quote:'next'},
 k4:{Numpad4:'left',Numpad6:'right',Numpad8:'up',Numpad5:'down',Numpad7:'jump',Numpad9:'fire',Numpad1:'next'}};
const BITS=['left','right','up','down','jump','fire','next','prev'];
const toBits=o=>BITS.reduce((b,k,i)=>b|(o[k]?1<<i:0),0);
const fromBits=b=>{const o={};BITS.forEach((k,i)=>{if(b&(1<<i))o[k]=true});return o};
// Which keys Worms uses right now (the engine holds them until read, so quick taps never get lost).
function onKey(e){if(state!=='play')return false;
 if(e.code==='Tab'){e.preventDefault();openPanel(!panelOn);return false}
 return !!(NET.mode==='online'?(KEYS.mk[e.code]||KEYS.k3[e.code]):players.some(p=>KEYS[p.ctrl]&&KEYS[p.ctrl][e.code]))}
// Phone aiming: a finger on the game screen points your worm at it; holding = fire held (charge), letting go = fire released.
// Mouse aiming (PC): the worm always points at the cursor. Both are kept as screen fractions so they stay put while the camera moves.
const toWorld=o=>[cam.x+o.fx*VW/cam.z,cam.y+o.fy*VH/cam.z];
function aimFor(p){if(!p||!p.alive)return null;let x,y;
 if(touchAim.on)[x,y]=toWorld(touchAim);else if(mouse.on)[x,y]=toWorld(mouse);else return null;
 const dx=x-p.x,dy=(p.y-5)-y;
 return{dir:dx<0?-1:1,aim:Math.max(-1.5,Math.min(1.5,Math.atan2(dy,Math.max(.5,Math.abs(dx))))),d:Math.hypot(dx,dy)}}
RA.input.attachPointer(cv,{
 active:()=>state==='play',
 touchActive:()=>state==='play'&&document.body.classList.contains('touchplay'),
 click:()=>{if(panelOn){openPanel(false);return false}if(spectatorClick())return false},
 touch:()=>{if(panelOn){openPanel(false);return false}},
 right:()=>openPanel(!panelOn),
 wheel:dy=>pulse(dy>0?'next':'prev')});
// Short "button presses" from the weapon bar, wheel and weapon list, read by the player on this device.
let pendSel=null;
const pulse=k=>RA.input.pulse(k),uiK=()=>RA.input.pulses();
function chooseW(k){pendSel=k}
const usesMouse=p=>!!p&&(p.ctrl==='mk'||(NET.mode==='online'&&p.mine))&&!touchDev;
function focusP(){if(!players.length)return null;if(NET.mode==='online')return players.find(p=>p.mine)||null;
 const h=humans();return h.find(p=>p.ctrl==='mk')||h.find(p=>p.ctrl==='touch')||(h.length===1?h[0]:null)}
function readPad(n){const p=RA.input.pad(n);return{left:p.left,right:p.right,up:p.up,down:p.down,jump:p.a,fire:p.b||p.x||p.rb||p.rt,next:p.y,prev:p.lb}}
const readKeys=set=>RA.input.keys(KEYS[set]);
// Everything this device can press, merged (online play).
function myInput(){const o={},src=[readKeys('mk'),readKeys('k3'),touchK,readPad(0),uiK(),{fire:mouse.down}];
 for(const s of src)for(const k of BITS)if(s[k])o[k]=true;return o}
function readInput(p,fp){
 const c=p.ctrl;
 if(c==='cpu')return bot(p);
 if(c==='net'){const pe=NET.room&&NET.room.peers().find(q=>q.peer===p.peer);
  if(!pe){if(p.lives>0){p.lives=0;p.alive=false}return{}}
  const o=fromBits((pe.presence.i|0)&255),a=pe.presence.a,ws=pe.presence.ws;
  if(Array.isArray(a))o.aimTo={aim:Math.max(-1.5,Math.min(1.5,(a[0]|0)/100)),dir:a[1]<0?-1:1,d:a[2]==null?null:Math.max(0,Math.min(2000,+a[2]||0))};
  if(Array.isArray(ws)&&ws[0]!==p.wsq){p.wsq=ws[0];o.select=ws[1]|0}
  return o}
 let o;
 if(c==='me')o=myInput();
 else if(c==='touch')o={...touchK};
 else if(c==='mk'){o=readKeys('mk');if(mouse.down)o.fire=true}
 else if(c.startsWith('gp'))o=readPad(+c[2]);
 else o=readKeys(c);
 if(c==='me'||c==='touch'||c==='mk')o.aimTo=aimFor(p);
 if(p===fp){const u=uiK();if(u.next)o.next=true;if(u.prev)o.prev=true;if(pendSel!=null){o.select=pendSel;pendSel=null}}
 return o;
}
// Modern feel: coyote time, jump buffer, tap-or-hold jump height, a little air steering.
function control(p,inp){
 const pr=p.prev;p.prev=inp;
 if(!p.alive||p.kami>0)return;
 if(p.cd>0)p.cd--;
 if(inp.select!=null)selectW(p,inp.select);
 if(inp.next&&!pr.next)cycleW(p,1);
 if(inp.prev&&!pr.prev)cycleW(p,-1);
 const w=curW(p);
 if(p.rope){
  if(inp.jump&&!pr.jump){p.rope=null;p.vy=Math.min(p.vy,-1.4);p.jb=0;p.jumping=false;p.lastJ=-99}
  else{if(inp.left)p.vx-=.07;if(inp.right)p.vx+=.07;
   if(inp.up)p.rope.len=Math.max(8,p.rope.len-.9);if(inp.down)p.rope.len=Math.min(170,p.rope.len+.9)}}
 if(p.jet>0){
  if(--p.jet<=0)p.jet=0;
  if(inp.jump||inp.up){p.vy=Math.max(-2,p.vy-.22);p.grounded=false;
   if(tick%2)parts.push({x:p.x-p.dir*3,y:p.y-2,vx:rnd(-.3,.3),vy:1.3,t:10,col:tick&4?'#f8b800':'#d82800',g:0})}
  if(inp.left){p.vx=Math.max(-1.8,p.vx-.08);p.dir=-1}else if(inp.right){p.vx=Math.min(1.8,p.vx+.08);p.dir=1}else p.vx*=.98}
 const flying=!!p.rope||p.jet>0;
 if(p.grounded)p.coy=6;else if(p.coy>0)p.coy--;
 if(!flying&&inp.jump&&!pr.jump){
  // Worms backflip: tap jump twice quickly
  if(!p.grounded&&p.jumping&&tick-p.lastJ<14&&!p.flip){p.vy=-3.4;p.vx=-(p.face||p.dir)*.7;p.flip=1;p.jumping=false;p.jb=0}else p.jb=7;
  p.lastJ=tick}else if(p.jb>0)p.jb--;
 if(!p.charging&&p.grounded&&!(p.jet>0&&(inp.jump||inp.up))){if(inp.left)walk(p,-1);else if(inp.right)walk(p,1)}
 if(!p.grounded&&!p.charging&&!flying){
  if(inp.left){p.vx=Math.max(-1.4,p.vx-.05);p.dir=-1}
  else if(inp.right){p.vx=Math.min(1.4,p.vx+.05);p.dir=1}}
 // body faces where you walk; the mouse only aims (weapon side follows the cursor)
 if(inp.left)p.face=-1;else if(inp.right)p.face=1;else if(p.grounded&&!flying)p.face=null;
 if(inp.aimTo){p.dir=inp.aimTo.dir;p.aim=inp.aimTo.aim}
 if(!inp.aimTo&&!flying){if(inp.up)p.aim=Math.min(1.5,p.aim+.035);if(inp.down)p.aim=Math.max(-1.5,p.aim-.035)}
 // where strikes / teleport / girder / homing land: the cursor or finger, else 110 px along the aim
 {const[cx,cy]=aimVec(p),d=inp.aimTo&&inp.aimTo.d!=null?inp.aimTo.d:110;p.tx=p.x+cx*d;p.ty=p.y-5+cy*d}
 if(p.jb>0&&p.coy>0&&!p.charging&&!flying){p.vy=-2.8;p.vx=(p.face||p.dir)*1.1;p.grounded=false;p.coy=0;p.jb=0;p.jumping=true}
 if(p.jumping&&!inp.jump&&p.vy<-1){p.vy*=.5;p.jumping=false}
 if(p.burst>0&&--p.burstT<=0){p.burst--;p.burstT=p.burstW.every;shootRay(p,p.burstW)}
 if(inp.fire&&!pr.fire){const rm=projs.find(q=>q.owner===p&&q.w&&q.w.remote&&!q.dead);
  if(rm){boom(rm,rm.x,rm.y-3);p.cd=Math.max(p.cd,20);return}}
 if(w.charge){
  if(inp.fire&&!pr.fire&&p.cd<=0){p.charging=true;p.power=0}
  if(p.charging){p.power=Math.min(1,p.power+1/50);if(!inp.fire||p.power>=1){p.charging=false;fire(p)}}
 }else if(inp.fire&&p.cd<=0&&p.burst<=0&&(w.auto||!pr.fire))fire(p);
}
const BOTW=['bazooka','grenade','shotgun','uzi','homing','cluster','banana','holy','mortar','handgun','minigun','petrol','dynamite','airstrike','napalm','donkey'];
function bot(p){
 const o={},foes=players.filter(q=>q!==p&&q.alive);
 if(!foes.length||!p.alive)return o;
 const B=p.b||(p.b={t:null,wait:rnd(40,100),stuck:0,lx:p.x,np:1,burst:0,hold:0});
 if(!B.t||!B.t.alive||tick%240===0)B.t=foes.reduce((a,q)=>Math.abs(q.x-p.x)<Math.abs(a.x-p.x)?q:a);
 const t=B.t,dx=t.x-p.x,dist=Math.abs(dx),dy=t.y-p.y,w=curW(p);
 const cr=crates.find(c=>c.landed&&Math.abs(c.x-p.x)<70);
 let goal=null;
 if(cr)goal=cr.x;else if(dist>(w.ray?110:150)||(w.drop&&dist>8))goal=t.x;
 if(p.x<16)goal=45;else if(p.x>W-16)goal=W-45;
 if(B.hold>0){B.hold--;o.jump=true}
 if(goal!==null&&Math.abs(goal-p.x)>3&&!p.charging){
  o[goal<p.x?'left':'right']=true;
  if(Math.abs(p.x-B.lx)<.05){if(++B.stuck>20){o.jump=true;B.hold=12;B.stuck=0}}else B.stuck=0;
  B.lx=p.x;
 }else if(Math.sign(dx)!==p.dir&&!p.charging)o[dx<0?'left':'right']=true;
 const want=(w.ray||w.drop||w.strike)?Math.atan2(-dy,Math.max(1,dist)):.8;
 // switch weapons now and then, favouring the crate weapons it has
 if(!p.charging&&(tick+p.i*37)%480===0){const own=BOTW.filter(id=>hasW(p,id)),lim=own.filter(id=>ammoOf(p,id)>0),pool=lim.length&&Math.random()<.65?lim:own;
  if(pool.length)o.select=WLIST.indexOf(pool[Math.floor(Math.random()*pool.length)])}
 if(w.strike)o.aimTo={dir:dx<0?-1:1,aim:want,d:Math.hypot(dx,dy)};
 if(want>p.aim+.03)o.up=true;else if(want<p.aim-.03)o.down=true;
 if(B.wait>0)B.wait--;
 if(B.burst>0){B.burst--;o.fire=true;return o}
 if(p.charging){if(p.power<B.np)o.fire=true;return o}
 const aimed=Math.abs(want-p.aim)<.08&&Math.sign(dx)===p.dir;
 if(aimed&&goal===null&&B.wait<=0&&p.cd<=0){
  o.fire=true;B.wait=rnd(30,110);
  if(w.auto)B.burst=20;
  if(w.charge){const v=Math.sqrt(G*Math.max(20,dist))*(1-dy/300);B.np=Math.min(1,v/w.speed*rnd(.9,1.1))}
 }
 return o;
}

/* ---------- update ---------- */
function stepFx(){
 for(const p of parts){p.t--;if(!p.ring){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g}}parts=parts.filter(p=>p.t>0);
 if(flashT>0)flashT--;
 for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);
 for(const g of graves){if(!solid(g.x,g.y+4)&&g.y<WATER){g.vy=Math.min(g.vy+G,3);g.y+=g.vy}else g.vy=0}
 for(const p of players)if(p.flash>0&&isClient())p.flash--;
 shake*=.8;if(shake<.3)shake=0;
}
function readGuest(p){
 const pe=NET.room&&NET.room.peers().find(q=>q.peer===p.peer);
 if(!pe){if(p.lives>0){p.lives=0;p.alive=false}return}
 {const dc=pe.presence.dc;if(Array.isArray(dc)&&(dc[0]|0)>(p.dcSeen|0)){p.dcSeen=dc[0]|0;if(p.lives<=0)dropCrateAt(+dc[1]||0,p)}}
 if(p.cd>0)p.cd--;
 if(p.burst>0&&--p.burstT<=0){p.burst--;p.burstT=p.burstW.every;shootRay(p,p.burstW)}
 const u=SY.read(pe.presence,NET.matchId,p.i);if(!u||!Array.isArray(u.s))return;const s=u.s;
 if((s[13]|0)!==(p.life|0))return;   // still showing the life before my last respawn
 if(p.alive&&!(p.kami>0)){
  p.x=Math.max(0,Math.min(W-1,(+s[0]||0)/10));p.y=Math.max(-200,Math.min(H+20,(+s[1]||0)/10));p.vx=(+s[2]||0)/100;p.vy=(+s[3]||0)/100;
  p.dir=s[4]<0?-1:1;p.aim=Math.max(-1.5,Math.min(1.5,(s[5]|0)/100));p.grounded=!!s[6];
  const f=s[7]|0;p.chute=f&1;p.jet=f&2?1:0;p.rope=f&4?{x:s[8]|0,y:s[9]|0,len:20}:null;
  p.charging=s[10]>0;p.power=Math.max(0,(s[10]-1)/98);
  const wi=s[11]|0;if(WLIST[wi]&&hasW(p,WLIST[wi])&&!p.charging)p.wpn=WLIST[wi];
  const fd=s[12]|0;if(fd>(p.fdSeen|0)){p.hp-=Math.min(100,fd-(p.fdSeen|0));p.flash=6}p.fdSeen=Math.max(p.fdSeen|0,fd);
  if(p.y>WATER){splash(p.x);die(p,false);return}}
 // shots: the guest pressed fire at this spot with this aim and power
 const q=pe.presence.wf;
 if(Array.isArray(q))for(const e of q){if(!Array.isArray(e)||(e[0]|0)<=(p.fqSeen|0))continue;p.fqSeen=e[0]|0;
  if(!p.alive||p.kami>0)continue;const id=WLIST[e[1]|0];if(!id||!hasW(p,id))continue;
  const rm=projs.find(o=>o.owner===p&&o.w.remote&&!o.dead);if(rm&&!LOCALW(DEF[id])){boom(rm,rm.x,rm.y-3);continue}
  const keep={x:p.x,y:p.y,aim:p.aim,dir:p.dir,power:p.power};
  p.wpn=id;p.aim=Math.max(-1.5,Math.min(1.5,(e[2]|0)/1000));p.dir=e[3]<0?-1:1;p.power=Math.max(0,Math.min(1,(e[4]|0)/100));p.tx=+e[5]||0;p.ty=+e[6]||0;
  if(Math.abs((e[7]|0)/10-p.x)<30&&Math.abs((e[8]|0)/10-p.y)<30){p.x=(e[7]|0)/10;p.y=(e[8]|0)/10}
  const w=DEF[id];
  if(LOCALW(w)){const k=WLIST.indexOf(id);if(p.ammo[k]>0&&--p.ammo[k]===0)p.wpn='bazooka';if(w.teleport)p.reveal=45}
  else{p.cd=0;fire(p);p.x=keep.x;p.y=keep.y}}
}
function update(){
 tick++;matchT++;
 const fp=focusP();
 for(const p of players){if(p.ctrl==='net')readGuest(p);else control(p,readInput(p,fp))}
 players.forEach(p=>{if(p.ctrl!=='net'||p.kami>0)stepWorm(p)});
 projs.forEach(stepProj);projs=projs.filter(p=>!p.dead);
 crates.forEach(stepCrate);crates=crates.filter(c=>!c.gone);
 stepFx();
 if(NET.lowG>0){NET.lowG--;G=.05}else G=G0;
 if(armT>0&&--armT%10===0)projs.push({x:rnd(10,W-10),y:-10,vx:rnd(-.6,.6),vy:3,w:DEF.meteor,age:99,owner:armBy});
 for(const p of players){
  if(p.alive&&p.hp<=0)die(p,true);
  else if(!p.alive&&p.lives>0&&--p.respawn<=0)spawn(p);}
 if(--crateT<=0){spawnCrate();crateT=rnd(360,540)*4/Math.max(4,players.length)}
 if(--windT<=0){wind=Math.round(rnd(-1,1)*5)/5;windT=20*60}
 if(matchT===suddenAt())music.play('worms',4);
 if(matchT>suddenAt()&&tick%30===0&&WATER>H*.4)WATER--;
 const left=players.filter(p=>p.lives>0);
 if(new Set(left.map(p=>p.team)).size<=1){gameOver(left[0]);return}
 if(M.len&&matchT>=M.len*3600){gameOver(leader());return}
 if(tick%6===0)hud();
}

/* ---------- render ---------- */
const drawStr=(s,x,y,col)=>RA.gfx.text(ctx,s,x,y,col),drawNum=(n,x,y,col)=>RA.gfx.num(ctx,n,x,y,col);
// Worms-style comic words on big hits.
const WORDS=['POW!','BIFF!','BOOM!','WHAM!','KAPOW!','BLAM!','THUD!'];
function word(x,y){texts.push({x,y,s:WORDS[Math.floor(Math.random()*WORDS.length)],t:45,col:'#f8b800'})}
// 9x10 grub, two walk frames, drawn facing right and mirrored for left.
const GRUB=[[
 '...kkkk..','..klbbbk.','..klwwpk.','..kbwwpk.','..kbbbbk.','...kbbk..','..kbbbbk.','.kdbbbbk.','kdbbbdbk.','kkkkkkkk.'],[
 '...kkkk..','..klbbbk.','..klwwpk.','..kbwwpk.','..kbbbbk.','..kbbbk..','..kbbbbk.','..kbbbbdk','.kbdbbbbk','.kkkkkkkk']];
// PS1 worms: pre-rendered shaded bodies (RA.fx.model), 4 walk frames + a flying frame, cached per colour
const WSPR={};
// unlockable skins (achievements): body colour + shine
const SKIN={Golden:['#f0c040',40,.95],Zombie:['#7ca05c',6,.2],Chrome:['#c4ccd8',60,1]};
function lookOf(p){if(!p)return{};if(NET.mode==='online'){if(!p.peer)return{};const pe=NET.room&&NET.room.peers().find(q=>q.peer===p.peer);return RA.look.clean(pe&&pe.presence&&pe.presence.lk)}
 return p.ctrl&&p.ctrl!=='cpu'?RA.look('worms'):{}}
function wormSprite(col,f,flash,skin){const sk=SKIN[skin],key=col+f+(flash?1:0)+(sk?skin:'');if(WSPR[key])return WSPR[key];
 const body=flash?'#ffffff':sk?mix(sk[0],col,.15):mix('#f4a0b0',col,.38),balls=[],air=f===4,ph=f*Math.PI/2;
 for(let i=0;i<=9;i++){const t=i/9,st=t<.3?0:t>1?1:(t-.3)/.7,ss=st*st*(3-2*st);
  const x=air?3.5+4*t:2+9*t-(t>.55?(t-.55)*5:0),y=air?18-14*t:18.4-12.5*ss-(t<.6&&!air?Math.max(0,Math.sin(t*9+ph))*2.2:0);
  balls.push({x,y,z:0,r:2.1+2.5*t,col:body,spec:sk?sk[1]:12,gloss:sk?sk[2]:.55})}
 const hx=balls[9].x,hy=balls[9].y;
 balls.push({x:hx+1.8,y:hy-1.6,z:3.6,r:1.75,col:'#ffffff',spec:30,gloss:.9},{x:hx+3.2,y:hy-1.4,z:3.2,r:1.55,col:'#ffffff',spec:30,gloss:.9});
 balls.push({x:hx+2.5,y:hy-1.2,z:5.1,r:1,col:'#101010',gloss:.9},{x:hx+3.9,y:hy-1,z:4.6,r:.9,col:'#101010',gloss:.9});
 return WSPR[key]=RA.fx.model(18,21,balls,{amb:.28})}
const shade={};
function grubCols(c,flash){
 if(flash)return{k:'#000',b:'#fcfcfc',l:'#fcfcfc',d:'#fcfcfc',w:'#fcfcfc',p:'#fcfcfc'};
 return shade[c]||(shade[c]={k:'#000',b:c,l:mix(c,'#ffffff',.45),d:mix(c,'#000000',.45),w:'#fcfcfc',p:'#000'});
}
function drawWorm(u){
 const x=Math.round(u.x),y=Math.round(u.y),d=u.face||u.dir;
 const an=u.rope||u.hook;
 if(an){const dx=an.x-u.x,dy=an.y-(u.y-5),n=Math.max(1,Math.ceil(Math.hypot(dx,dy)));
  for(let i=0;i<=n;i++){ctx.fillStyle=(i>>1)&1?'#d82800':'#fcfcfc';ctx.fillRect(Math.round(u.x+dx*i/n),Math.round(u.y-5+dy*i/n),1,1)}
  ctx.fillStyle='#000';ctx.fillRect(Math.round(an.x)-1,Math.round(an.y)-1,3,3)}
 if(u.chute){ctx.drawImage(CHUTEM,x-7,y-30);ctx.strokeStyle='rgba(30,30,30,.8)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-6,y-24);ctx.lineTo(x,y-14);ctx.lineTo(x+6,y-24);ctx.stroke()}
 if(u.jet>0){ctx.fillStyle='#000';ctx.fillRect(x-d*4-1,y-8,3,6);ctx.fillStyle='#bcbcbc';ctx.fillRect(x-d*4,y-7,1,4)}
 if(u.hide>0&&!humans().includes(u))return;
 if(u.hide>0)ctx.globalAlpha=.35;
 if(u.inv>0&&(tick>>2)%2){ctx.globalAlpha=1;return drawLabel(u,x,y)}
 if(u.grounded!==false)RA.fx.shadow(ctx,x,y+1,5,.35);
 {const mv=Math.abs(u.x-(u._lx==null?u.x:u._lx))>.05;u._lx=u.x;if(mv)u._mv=8;else if(u._mv>0)u._mv--;
  const fr=u.grounded===false?4:u._mv>0?(Math.round(u.x/1.5)&3):((tick>>5)&1)*2,img=wormSprite(u.col,fr,u.flash>0&&(u.flash&2),lookOf(u).skin);
  ctx.save();ctx.translate(x,y+1);if(d<0)ctx.scale(-1,1);ctx.drawImage(img,-7,-21);
  // held weapon: a shaded tube along the aim
  {const a=-u.aim;ctx.translate(6,-9);ctx.rotate(a);const gr=ctx.createLinearGradient(0,-1.5,0,1.5);gr.addColorStop(0,'#c8ccd8');gr.addColorStop(.5,'#5c6070');gr.addColorStop(1,'#20222c');
   ctx.fillStyle=gr;ctx.fillRect(-1,-1,7,2.5);ctx.fillStyle='#101014';ctx.fillRect(6,-1,1,2.5)}
  ctx.restore()}
 ctx.globalAlpha=1;if(u.poison>0&&(tick>>3)&1){ctx.fillStyle='#a8f048';ctx.fillRect(x-1,y-14,1,1);ctx.fillRect(x+2,y-16,1,1)}
 drawLabel(u,x,y);
 const[cx,cy]=aimVec(u),ax=Math.round(u.x+cx*13),ay=Math.round(u.y-5+cy*13);
 ctx.fillStyle='#000';ctx.fillRect(ax-2,ay-1,5,3);ctx.fillRect(ax-1,ay-2,3,5);
 ctx.fillStyle=u.col;ctx.fillRect(ax-1,ay,3,1);ctx.fillRect(ax,ay-1,1,3);
 if(u.charging){
  for(let i=5;i<5+u.power*14;i++){ctx.fillStyle=i<12?'#f8b800':'#d82800';ctx.fillRect(Math.round(u.x+cx*i),Math.round(u.y-5+cy*i),1,1)}
  if(NET.mode!=='online'?u.ctrl!=='cpu':u.mine)preview(u);
 }
 const w=curW(u);
 if(w.target&&u.tx!=null&&u.ctrl!=='cpu'&&!u.peer&&!(usesMouse(u)&&mouse.on)&&!touchAim.on){const tx=Math.round(u.tx),ty=Math.round(u.ty);
  ctx.fillStyle=(tick>>3)&1?u.col:'#fcfcfc';for(let i=-3;i<=3;i++){ctx.fillRect(tx+i,ty+i,1,1);ctx.fillRect(tx+i,ty-i,1,1)}}
}
function drawLabel(u,x,y){
 drawNum(u.hp,x,y-27,u.col);
 if(u.mine){ctx.fillStyle='#fcfcfc';ctx.fillRect(x-2,y-32,5,1);ctx.fillRect(x-1,y-31,3,1);ctx.fillRect(x,y-30,1,1)}
}
// Dotted landing preview while charging (modern touch).
function preview(u){
 const w=curW(u);if(!w||!w.charge)return;
 const[cx,cy]=aimVec(u),sp=w.speed*Math.max(.15,u.power);
 let x=u.x+cx*5,y=u.y-5+cy*5,vx=cx*sp,vy=cy*sp;
 ctx.fillStyle=u.col;
 for(let i=0;i<150;i++){vy+=G;if(w.wind)vx+=wind*.006;x+=vx;y+=vy;
  if(solid(x,y)||y>WATER||x<0||x>=W)break;
  if(i%4===0){ctx.fillRect(Math.round(x),Math.round(y),1,1)}}
}
const CRATE_W=['kkkkkkkk','kLLLLLmk','kLmyymdk','kLmmymdk','kLmymmdk','kLmmmmdk','kLmymmdk','kkkkkkkk'];
const CRATE_P=['kkkkkkkk','kppppppk','kpwwwwpk','kppppwpk','kpppwwpk','kppppppk','kpppwppk','kkkkkkkk'];
const CRATE_H=['kkkkkkkk','kwwwwwwk','kwwrrwwk','kwrrrrwk','kwrrrrwk','kwwrrwwk','kgwwwwgk','kkkkkkkk'];
const CHUTE=['..kkkkk..','.kwrwrwk.','kwrwrwrwk','k.......k','.k.....k.','..k...k..'];
const CR_COLS={k:'#000',L:NES.dirtL,m:NES.dirt,d:NES.dirtD,y:'#fcfcfc',w:'#fcfcfc',r:'#d82800',g:'#bcbcbc'};
const WAVE='..LLL...';
// Projectiles as plain view data: kind 0 rocket, 1 grenade, 2 mega, 3 dynamite; f = fuse seconds shown.
const projView=q=>({x:q.x,y:q.y,k:q.w.spr|0,f:q.fuse!=null&&q.w.fuse&&q.w!==DEF.bomblet?Math.ceil(q.fuse/60):0,d:(q.dir||(q.vx<0?-1:1))<0?-1:1,a:Math.round(Math.atan2(q.vy||0,Math.abs(q.vx||0)+.001)*20),o:players.indexOf(q.owner)});
const PC={k:'#000',w:'#fcfcfc',g:'#00a800',y:'#f8b800',r:'#d82800',s:'#7c7c7c',l:'#bcbcbc',p:'#6844fc',o:'#e45c10'};
const SPR=[['kkkk','kwwk','kwwk','kkkk'],['.kk.','kggk','kggk','.kk.'],['kkk','kgk','kkk'],['..w.','.kk.','krrk','krrk','krrk','.kk.'],
 ['kk...','kyyk.','.kyyk','..kyk','...k.'],['..w..','.kyk.','kyyyk','kyyyk','.kkk.'],['kkk','ksk','kkk'],['.k.','kok','krk','.k.'],
 ['.kkkk..','kwwwwkk','kwwwwkw','kwwwwkk','.k..k..'],['.kk.','kllk','kppk','kppk','.kk.'],['.kr.','kkkk','.kk.'],
 ['.kk..kk.','kllkkllk','kllllllk','klkllklk','kllllllk','kllllllk','kkkkkkkk'],['.oo.','oyyo','oyyo','.oo.'],
 ['kk......','kwkkkkkk','.kwwkwwk','.kwwwkwk','.kwwwwwk','..k.k.k.'],['..kk..','.kllk.','kllllk','.kkyk.','..k...'],['.kk.','kwpk','kppk','kwpk','.kk.'],
 ['.kkk.','ksssk','ksssk','.kyk.'],['k.kkkk.','kkwwkkk','kkkkkkw','.k.k.k.'],['kkkkk','kwwwk','kwkwk','kkkkk']];
// walkers waddle: their leg row shifts every few frames
const WALKS=new Set([8,9,14,18]);
// Celtic cross grave (unlock)
const GRAVEC=RA.fx.model(10,13,[{x:5,y:3,r:1.6,col:'#a8a8b4'},{x:5,y:6,r:1.8,col:'#a0a0ac'},{x:5,y:9,r:1.7,col:'#98989f'},{x:5,y:11.3,r:1.8,col:'#8c8c94'},{x:2.3,y:5,r:1.5,col:'#a0a0ac'},{x:7.7,y:5,r:1.5,col:'#a0a0ac'},{x:5,y:5,r:2.6,z:-1,col:'#7c8c70',gloss:.1}]);
// gravestone: rounded grey stone with a cross
const GRAVEM=RA.fx.model(8,11,[{x:4,y:4,r:3.3,col:'#9c9ca8'},{x:4,y:7,r:3.4,col:'#94949c'},{x:4,y:9,r:3.3,col:'#8c8c94'},{x:4,y:3.4,r:.7,z:3.2,col:'#e8e8f0',gloss:0},{x:4,y:4.8,r:.7,z:3.2,col:'#e8e8f0',gloss:0},{x:2.9,y:4,r:.6,z:3.2,col:'#e8e8f0',gloss:0},{x:5.1,y:4,r:.6,z:3.2,col:'#e8e8f0',gloss:0}]);
const CHUTEM=RA.fx.model(15,8,[...Array.from({length:7},(_,i)=>({x:1.5+i*2,y:4.2-Math.sin(i/6*Math.PI)*2,r:2.4,col:i%2?'#f4f4f4':'#e03020',spec:10}))],{amb:.5});
const GRAVE=['.kkk.','kllwk','kwwwk','kllwk','kllsk','kllsk','kkkkk'];
// PS1 shots: shaded models for the round ones, crates as lit wooden boxes
const M3=RA.fx.model,cyl=(x0,x1,y,r,col,n)=>Array.from({length:n||6},(_,i)=>({x:x0+(x1-x0)*i/((n||6)-1),y,r,col}));
const PMOD={
 // rocket: grey body, red nose, fins
 0:M3(11,7,[...cyl(2,7,3.5,1.6,'#a8b0c0'),{x:8.6,y:3.5,r:1.6,col:'#e03020',spec:24},{x:1.4,y:1.6,r:1.1,col:'#d83020'},{x:1.4,y:5.4,r:1.1,col:'#d83020'}]),
 // grenade: green pineapple with a lever
 1:M3(7,8,[{x:3.5,y:4.6,r:2.9,col:'#4c8c2c',spec:16},{x:3.5,y:1.6,r:1.1,z:.5,col:'#b8bcc8'},{x:5,y:2.1,r:.7,z:1,col:'#d8dce8'}]),
 // cluster bomb: dark grey with yellow band
 2:M3(7,7,[{x:3.5,y:3.6,r:2.8,col:'#3c4048',spec:16},{x:3.5,y:3.6,r:1.4,z:2,col:'#f8c020'}]),
 // dynamite: red stick, white label, black fuse
 3:M3(6,11,[...cyl(3,3,3,1.9,'#d82818',1),{x:3,y:3.5,r:1.9,col:'#d82818'},{x:3,y:5,r:1.9,col:'#e0e0d8'},{x:3,y:6.5,r:1.9,col:'#d82818'},{x:3,y:8,r:1.9,col:'#d82818'},{x:3,y:1.2,r:.6,z:1,col:'#202020'}]),
 // banana bomb: curved yellow banana with brown tips
 4:M3(10,7,[{x:1.6,y:2,r:1,col:'#6c4818'},{x:2.6,y:3.4,r:1.6,col:'#f8d830'},{x:4,y:4.4,r:1.8,col:'#fce040'},{x:5.6,y:4.6,r:1.8,col:'#fce040'},{x:7.1,y:3.8,r:1.6,col:'#f8d830'},{x:8.3,y:2.4,r:1,col:'#6c4818'}]),
 // holy hand grenade: gold orb with a cross on top
 5:M3(9,11,[{x:4.5,y:6.5,r:3.6,col:'#f0c020',spec:30,gloss:1},{x:4.5,y:2.6,r:.8,z:1,col:'#f8e070'},{x:4.5,y:1.3,r:.8,z:1,col:'#f8e070'},{x:3.3,y:2,r:.8,z:1,col:'#f8e070'},{x:5.7,y:2,r:.8,z:1,col:'#f8e070'}]),
 // mortar shell / shards
 6:M3(5,5,[{x:2.5,y:2.5,r:2,col:'#6c6c74',spec:20}]),
 // petrol bomb: green bottle, burning rag
 7:M3(6,10,[{x:3,y:6.6,r:2.6,col:'#4c9c58',spec:30,gloss:.9},{x:3,y:3.6,r:1.1,col:'#3c8c48'},{x:3,y:2.3,r:1,col:'#3c8c48'},{x:3,y:1.1,r:1,z:1,col:'#f8a020',gloss:0}]),
 // sheep: woolly white body, black face and legs
 8:M3(12,10,[{x:2,y:8.6,r:.9,col:'#202020'},{x:7,y:8.6,r:.9,col:'#202020'},{x:3.2,y:5,r:2.8,col:'#f4f4ee'},{x:5.6,y:4.4,r:3,col:'#ffffff'},{x:4.3,y:3,r:2.2,col:'#f0f0ea'},{x:9.2,y:3.8,r:1.9,z:1,col:'#282828'},{x:9.6,y:3.2,r:.5,z:3,col:'#ffffff'}]),
 // old woman: grey bun, pink face, purple coat, handbag
 9:M3(9,13,[{x:4,y:9,r:3,col:'#7c4c9c'},{x:4,y:6,r:2.3,col:'#8c5cac'},{x:4.6,y:3.6,r:1.8,col:'#f4c0a0'},{x:3.6,y:1.8,r:1.5,col:'#c8c8d0'},{x:6.9,y:8.2,r:1.2,z:2,col:'#6c3c1c'}]),
 // mine: dark dome with a blinking light
 10:M3(8,6,[{x:4,y:4.4,r:3,col:'#3c2828',spec:20},{x:4,y:1.6,r:.9,z:1,col:'#ff3020',gloss:1}]),
 // concrete donkey: grey statue
 11:M3(14,13,[{x:4,y:6,r:3.2,col:'#a0a0a4'},{x:7.5,y:6,r:3.2,col:'#a8a8ac'},{x:11,y:3.6,r:2.2,col:'#b0b0b4'},{x:12.5,y:4.6,r:1.2,z:1,col:'#a0a0a4'},{x:10.4,y:1.2,r:.9,col:'#9c9ca0'},{x:3,y:10.6,r:1.2,col:'#8c8c90'},{x:8.6,y:10.6,r:1.2,col:'#8c8c90'}]),
 // meteor: molten rock
 12:M3(8,8,[{x:4,y:4,r:3.3,col:'#ff6818',spec:6,gloss:.8},{x:3,y:3,r:1.3,z:2,col:'#ffd040',gloss:0}]),
 // mad cow: brown and white, horns
 14:M3(13,10,[{x:2.4,y:8.6,r:.9,col:'#3c2c20'},{x:8,y:8.6,r:.9,col:'#3c2c20'},{x:3.5,y:5,r:2.8,col:'#f4f0e8'},{x:6.5,y:5,r:2.9,col:'#8c5428'},{x:10.3,y:3.6,r:2,z:1,col:'#f4f0e8'},{x:11.5,y:4.4,r:1,z:2,col:'#f8a0a0'},{x:9.6,y:1.4,r:.6,col:'#e8e0c0'}]),
 // homing pigeon: grey bird, white wing
 15:M3(10,7,[{x:4,y:4,r:2.5,col:'#8c94a0'},{x:7,y:3,r:1.7,z:.5,col:'#9ca4b0'},{x:8.8,y:3.2,r:.7,z:1,col:'#f8b040'},{x:3.6,y:3.2,r:1.6,z:2,col:'#ffffff'},{x:1.2,y:4.6,r:1,col:'#7c8490'}]),
 // ming vase: white porcelain, blue band
 16:M3(7,10,[{x:3.5,y:6.2,r:3,col:'#f0f0f8',spec:30,gloss:1},{x:3.5,y:6.2,r:1.6,z:2.2,col:'#2850c0'},{x:3.5,y:2.4,r:1.3,col:'#f0f0f8'},{x:3.5,y:1,r:1.5,col:'#2850c0'}]),
 // mole: brown, pink nose and claws
 17:M3(9,7,[{x:4,y:4,r:2.8,col:'#6c4c34'},{x:7,y:3.8,r:1.3,z:1,col:'#7c5c44'},{x:8.2,y:3.8,r:.7,z:2,col:'#f890a0'},{x:5.4,y:6,r:.8,z:2,col:'#f8c0c8'}]),
 // skunk: black, white stripe, big tail
 18:M3(12,9,[{x:2.4,y:3,r:2.4,col:'#202024'},{x:2.4,y:2.2,r:1.2,z:1.6,col:'#ffffff'},{x:5.6,y:5.4,r:2.6,col:'#26262a'},{x:5.6,y:4,r:1.2,z:2,col:'#ffffff'},{x:9.2,y:5.4,r:1.7,col:'#2a2a2e'},{x:10.4,y:5.6,r:.6,z:1.5,col:'#f890a0'},{x:4,y:8,r:.8,col:'#101010'},{x:7.4,y:8,r:.8,col:'#101010'}]),
 // mail strike letter: white envelope, red stamp
 19:M3(9,6,[...cyl(1.5,7.5,3,2.4,'#f4f0e4',5),{x:6.8,y:2.2,r:.9,z:2,col:'#d82820',gloss:0}])};
// walkers face their way and waddle, flying shots point along their path
const WALKER=new Set([8,9,14,17,18]),SPIN=new Set([0,6,15,19]);
const CRS={};
function crateSprite(kind){if(CRS[kind])return CRS[kind];const k=document.createElement('canvas');k.width=k.height=10;const g=k.getContext('2d');
 const base=kind==='h'?[236,236,236]:kind==='p'?[150,80,210]:[176,118,60];
 for(let y=0;y<10;y++)for(let x=0;x<10;x++){let l=1.05-y*.03-x*.025;if(y===0||x===0)l=1.35;if(y===9||x===9)l=.45;if(kind==='w'&&(y===3||y===6))l*=.7;
  if(kind==='w'&&(x===1||x===8)&&y>0&&y<9)l*=.8;const dth=(BAY[(y&3)*4+(x&3)]/16-.5)*14;g.fillStyle='rgb('+base.map(v=>Math.max(0,Math.min(255,v*l+dth))|0)+')';g.fillRect(x,y,1,1)}
 if(kind==='h'){g.fillStyle='#d82020';g.fillRect(4,2,2,6);g.fillRect(2,4,6,2)}
 if(kind==='p'){g.fillStyle='#fff';g.fillRect(3,2,4,1);g.fillRect(6,3,1,2);g.fillRect(4,5,2,1);g.fillRect(4,7,2,1)}
 if(kind==='w'){g.fillStyle='#f8d040';g.fillRect(4,4,2,2)}
 g.strokeStyle='rgba(0,0,0,.8)';g.strokeRect(.5,.5,9,9);return CRS[kind]=k}
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function drawProj(k,x,y,d,a){
 if(k===13){for(let i=0;i<3;i++){const fx=x+Math.sin(tick*.3+i*2+x)*1.2,fy=y-i*1.4-((tick+i*3)%6)*.3;RA.fx.light(ctx,fx,fy,3-i*.6,i?'#ff8020':'#ffe060',.5)}ctx.fillStyle='#fff0a0';ctx.fillRect(x,y-1,1,1);return}
 if(PMOD[k]){const m=PMOD[k],bob=WALKER.has(k)&&(tick>>3)&1?1:0;ctx.save();ctx.translate(x,y-bob);if(d<0)ctx.scale(-1,1);if(SPIN.has(k)&&a)ctx.rotate(a);
  ctx.drawImage(m,-(m.width>>1),-(m.height>>1));
  if(k===0){ctx.fillStyle=(tick&2)?'#ffd060':'#ff8020';ctx.fillRect(-(m.width>>1)-2,-1,2,2)}
  if(k===3||k===7){if(tick&2){ctx.fillStyle='#fff8c0';ctx.fillRect(0,-(m.height>>1)-1,1,1)}RA.fx.light(ctx,0,-(m.height>>1),2.5,'#ffa030',.5)}
  if(k===10&&(tick>>3)&1)RA.fx.light(ctx,0,-2,2.5,'#ff2010',.6);
  ctx.restore();return}
 if(k===13){const c=['#f8b800','#e45c10','#d82800'];ctx.fillStyle=c[(x+tick>>2)%3];ctx.fillRect(x,y-1-((x+tick>>1)&1),1,2);ctx.fillStyle=c[(x+tick>>1)%3];ctx.fillRect(x+((tick>>2)&1?1:-1),y,1,1);return}
 let sa=SPR[k]||SPR[0];
 if(WALKS.has(k)&&(tick>>3)&1){const l=sa[sa.length-1];sa=sa.slice(0,-1).concat(l.slice(-1)+l.slice(0,-1))}
 if(k===10&&(tick>>3)&1){blit(ctx,sa.map(r=>r.replace('r','k')),x-2,y-1,PC);return}
 blit(ctx,sa,x-(sa[0].length>>1),y-(sa.length>>1),PC);
}
// ----- camera, fog of war, spectating -----
let V={pts:[],vw:[],fog:false,spec:false,t:null},specIdx=-1,lastPts=[];
const humans=()=>NET.mode==='online'?players.filter(p=>p.mine):players.filter(p=>p.ctrl!=='cpu');
function computeView(){
 if(state==='menu'||!players.length)return{pts:[],vw:[],fog:false,spec:false,t:null};
 const mine=humans().filter(p=>p.lives>0);
 if(mine.length){const al=mine.filter(p=>p.alive);if(al.length)lastPts=al.map(p=>[p.x,p.y-5]);
  return{pts:lastPts,vw:al,fog:state==='play'&&M.fog>0,spec:false,t:null}}
 // You're out (or only CPUs play): watch a living worm.
 const alive=players.filter(p=>p.alive);
 let t=players[specIdx];if(!t||!t.alive)t=alive[0]||null;if(t)specIdx=t.i;
 return{pts:t?[[t.x,t.y-5]]:lastPts,vw:t?[t]:[],fog:state==='play'&&M.fog>0&&!!t,spec:state==='play',t}
}
function specStep(d){const alive=players.filter(p=>p.alive);if(!alive.length)return;
 const k=alive.findIndex(p=>p.i===specIdx);specIdx=alive[((k<0?0:k+d)%alive.length+alive.length)%alive.length].i;blip(520);V=computeView();hud()}
function seen(x,y){if(!V.fog)return true;for(const q of V.pts)if((x-q[0])**2+(y-q[1])**2<visR()*visR())return true;return false}
const showWorm=u=>!V.fog||V.vw.includes(u)||u.mine||u.reveal>0||seen(u.x,u.y-5);
function camStep(){
 V=computeView();
 let tx=cam.x,ty=cam.y,tz=cam.z;
 if(state==='menu'){tz=1;tx=(W-VW)/2+Math.sin(tick*.004)*(W-VW)/2;ty=H-VH-10}
 else{const ps=V.vw.length?V.vw.map(p=>[p.x,p.y-5]):V.pts;
  if(ps.length){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
   for(const q of ps){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
   tz=ps.length>1?Math.max(.5,Math.min(1,VW/(x1-x0+170),VH/(y1-y0+130))):1;
   let cx=(x0+x1)/2,cy=(y0+y1)/2-12;
   if(V.vw.length===1){const u=V.vw[0];cx+=u.dir*22; // look ahead where you face
    if(usesMouse(u)&&mouse.on&&!panelOn){cx+=(mouse.fx-.5)*VW/cam.z*.4;cy+=(mouse.fy-.5)*VH/cam.z*.4}
    else if(u.charging){const[ax,ay]=aimVec(u);cx+=ax*60*u.power;cy+=ay*40*u.power}
    const sh=!isClient()&&projs.find(q=>q.owner===u&&q.cam); // ride along with your shot
    if(sh){cx=(cx+sh.x)/2;cy=(cy+sh.y)/2}}
   tx=cx-VW/tz/2;ty=cy-VH/tz/2}}
 cam.z+=(tz-cam.z)*(cam.snap?1:.06);
 const vw=VW/cam.z,vh=VH/cam.z;
 const cx=v=>W<=vw?(W-vw)/2:Math.max(0,Math.min(W-vw,v)),cy=v=>H<=vh?(H-vh)/2:Math.max(0,Math.min(H-vh,v));
 const k=cam.snap?1:.12;cam.x=cx(cam.x+(cx(tx)-cam.x)*k);cam.y=cy(cam.y+(cy(ty)-cam.y)*k);cam.snap=false;
}
const fogC=document.createElement('canvas');fogC.width=VW;fogC.height=VH;const fCtx=fogC.getContext('2d');
const rowsCircle=RA.gfx.disc;
// Fog memory (survey: "a little better"): ground you have explored stays dimly visible, unexplored stays dark.
const MEMS=4,memC=document.createElement('canvas'),memX=memC.getContext('2d');
function memClear(){memC.width=Math.ceil(W/MEMS);memC.height=Math.ceil(H/MEMS);memX.clearRect(0,0,memC.width,memC.height)}
function drawFog(z,ox,oy){
 memX.fillStyle='#000';for(const q of V.pts){memX.beginPath();memX.arc(q[0]/MEMS,q[1]/MEMS,visR()/MEMS,0,7);memX.fill()}
 fCtx.globalCompositeOperation='source-over';fCtx.clearRect(0,0,VW,VH);
 fCtx.fillStyle='rgba(0,0,28,.88)';fCtx.fillRect(0,0,VW,VH);
 fCtx.globalCompositeOperation='destination-out';
 fCtx.globalAlpha=.5;fCtx.imageSmoothingEnabled=true;fCtx.drawImage(memC,-ox,-oy,memC.width*MEMS*z,memC.height*MEMS*z);fCtx.globalAlpha=1;fCtx.imageSmoothingEnabled=false;
 const R=Math.round(visR()*z);
 for(const q of V.pts){const x=q[0]*z-ox,y=q[1]*z-oy;
  fCtx.fillStyle='rgba(0,0,0,.45)';rowsCircle(fCtx,x,y,R+6);
  fCtx.fillStyle='#000';rowsCircle(fCtx,x,y,R-3)}
 ctx.drawImage(fogC,0,0);
}
function updMini(){const w=mm.width,h=mm.height,d=mmCtx.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=Math.floor((x+.5)*W/w),wy=Math.floor((y+.5)*H/h);
  if(terr[wy*W+wx]){const q=(y*w+x)*4,top=!solid(wx,wy-H/h);d.data[q]=top?96:120;d.data[q+1]=top?180:80;d.data[q+2]=top?60:48;d.data[q+3]=255}}
 mmCtx.putImageData(d,0,0)}
function drawMini(){
 if(mmDirty&&(tick%20===0||!mm.ok)){updMini();mmDirty=false;mm.ok=1}
 const x=VW-mm.width-4,y=document.body.classList.contains('touchplay')?Math.ceil(64*SCR.dpr/SCR.s):VH-mm.height-4,sx=mm.width/W,sy=mm.height/H;
 ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,mm.width+2,mm.height+2);
 ctx.fillStyle='#5c6c9c';ctx.fillRect(x,y,mm.width,mm.height);
 ctx.drawImage(mm,x,y);
 ctx.fillStyle=NES.water;const wy=Math.round(WATER*sy);ctx.fillRect(x,y+wy,mm.width,mm.height-wy);
 ctx.fillStyle='#f8b800';for(const c of crates)ctx.fillRect(x+Math.round(c.x*sx),y+Math.round(c.y*sy)-1,1,1);
 for(const u of players)if(u.alive&&(!V.fog||V.vw.includes(u)||u.mine||seen(u.x,u.y-5))){const me=V.vw.includes(u);
  ctx.fillStyle=me&&(tick>>4)&1?'#fcfcfc':u.col;ctx.fillRect(x+Math.round(u.x*sx)-1,y+Math.round(u.y*sy)-2,2,2)}
 ctx.fillStyle='#fcfcfc';const rx=x+Math.round(cam.x*sx),ry=y+Math.round(cam.y*sy),rw=Math.max(2,Math.round(VW/cam.z*sx)),rh=Math.max(2,Math.round(VH/cam.z*sy));
 ctx.fillRect(rx,ry,rw,1);ctx.fillRect(rx,ry+rh-1,rw,1);ctx.fillRect(rx,ry,1,rh);ctx.fillRect(rx+rw-1,ry,1,rh);
}
function render(){
 if(!terr)return;
 if(tDirty&&tD){tCtx.putImageData(tImg,0,0,tD[0],tD[1],Math.max(1,tD[2]-tD[0]),Math.max(1,tD[3]-tD[1]));tD=null}tDirty=false;
 const z=cam.z,ox=Math.round(cam.x*z),oy=Math.round(cam.y*z);
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 if(skyG)ctx.drawImage(skyG,0,0);else{ctx.fillStyle=NES.sky;ctx.fillRect(0,0,VW,VH)}
 RA.fx.light(ctx,VW*.72,VH*.5,Math.round(VH*.07),'#fff0c0',.5);
 for(const L of layers)ctx.drawImage(L.c,-Math.round(ox*L.f),-Math.round(oy*L.f));
 let sx=0,sy=0;if(shake>0){sx=Math.round(rnd(-shake,shake));sy=Math.round(rnd(-shake,shake))}
 ctx.setTransform(z,0,0,z,sx-ox,sy-oy);
 ctx.drawImage(tCan,0,0);
 for(const c of crates){const x=c.x-4,y=Math.round(c.y)-7;
  if(!c.landed)blit(ctx,CHUTE,x-1,y-7,CR_COLS);
  RA.fx.shadow(ctx,c.x,Math.round(c.y)+1,5,c.landed?.35:0);ctx.drawImage(crateSprite(c.party?'p':c.hp?'h':'w'),x-1,y-2);}
 for(const g of graves){RA.fx.shadow(ctx,Math.round(g.x),Math.round(g.y)+4,4,.3);if(g.c)ctx.drawImage(GRAVEC,Math.round(g.x)-5,Math.round(g.y)-8);else ctx.drawImage(GRAVEM,Math.round(g.x)-4,Math.round(g.y)-6)}
 for(const u of players)if(u.alive&&showWorm(u))drawWorm(u);
 for(const p of (isClient()?projs:projs.map(projView))){if(!seen(p.x,p.y))continue;const x=Math.round(p.x),y=Math.round(p.y);
  {const tr=p.o>=0&&lookOf(players[p.o]).trail;if(tr&&parts.length<400)parts.push({x:x+rnd(-1,1),y:y+rnd(-1,1),vx:0,vy:tr==='Fire'?-.2:0,t:tr==='Fire'?10:16,col:tr==='Fire'?(tick&2?'#f8b800':'#e04010'):'hsl('+((tick*12)%360)+',90%,60%)',g:0})}
  drawProj(p.k,x,y,p.d||1,(p.a|0)/20);
  if(p.f)drawNum(p.f,x,y-10,'#fcfcfc')}
 for(const p of parts){
  if(p.ring){const r=p.r,t=p.t;
   RA.fx.light(ctx,p.x,p.y,Math.round(r*1.8),'#ff9030',t/12);
   // fireball: white-hot core, orange body, red rim, shrinking as it burns out
   const f=t/9,R=Math.max(1,r*(.55+.5*f)),g=ctx.createRadialGradient(p.x-R*.2,p.y-R*.25,0,p.x,p.y,R);
   g.addColorStop(0,'rgba(255,255,230,'+Math.min(1,f*1.4)+')');g.addColorStop(.35,'rgba(255,200,60,'+Math.min(1,f*1.2)+')');g.addColorStop(.75,'rgba(232,80,20,'+f+')');g.addColorStop(1,'rgba(120,20,10,0)');
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,R,0,7);ctx.fill();}
  else if(p.smoke){const R=Math.max(1,p.s*(1.3-p.t/80)),a=Math.min(.55,p.t/60),g=ctx.createRadialGradient(p.x-R*.3,p.y-R*.3,0,p.x,p.y,R);g.addColorStop(0,'rgba(190,186,180,'+a+')');g.addColorStop(1,'rgba(70,66,64,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,R,0,7);ctx.fill()}
  else{ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),1,1)}}
 const x0=Math.max(0,Math.floor(cam.x)-4),x1=Math.min(W,Math.ceil(cam.x+VW/z)+4);
 {const yb=Math.max(H,cam.y+VH/z)+4,wg=ctx.createLinearGradient(0,WATER,0,WATER+40);wg.addColorStop(0,'rgba(40,120,200,.78)');wg.addColorStop(1,'rgba(8,24,72,.95)');
 ctx.fillStyle=wg;for(let x=x0;x<x1;x++){const wy=Math.round(WATER-1.5+1.5*Math.sin(x*.12+tick*.06));ctx.fillRect(x,wy,1,yb-wy)}
 for(let x=x0;x<x1;x++){const wy=Math.round(WATER-1.5+1.5*Math.sin(x*.12+tick*.06));ctx.fillStyle='rgba(200,240,255,.7)';ctx.fillRect(x,wy,1,1);
  if(((x+(tick>>2))%11)<4){ctx.fillStyle='rgba(160,220,255,.35)';ctx.fillRect(x,WATER+4+((x>>3)&3),1,1)}}}
 for(const t of texts)if(seen(t.x,t.y+12)){if(t.s!=null)drawStr(t.s,t.x,Math.round(t.y),t.col);else drawNum(t.n,t.x,Math.round(t.y),t.col)}
 ctx.setTransform(1,0,0,1,0,0);
 if(V.fog)drawFog(z,ox,oy);
 if(state!=='menu')drawMini();
 if(flashT>0){ctx.fillStyle='rgba(255,255,255,'+(.1*flashT)+')';ctx.fillRect(0,0,VW,VH)}
 // crosshair at the mouse
 const fp=state==='play'?focusP():null;
 if(fp&&fp.alive&&mouse.on&&usesMouse(fp)&&!panelOn&&!V.spec){const x=Math.round(mouse.fx*VW),y=Math.round(mouse.fy*VH),
  c=fp.charging?(fp.power>.6?'#d82800':'#f8b800'):fp.col;
  ctx.fillStyle='#000';ctx.fillRect(x-6,y-1,5,3);ctx.fillRect(x+2,y-1,5,3);ctx.fillRect(x-1,y-6,3,5);ctx.fillRect(x-1,y+2,3,5);
  ctx.fillStyle=c;ctx.fillRect(x-5,y,4,1);ctx.fillRect(x+2,y,4,1);ctx.fillRect(x,y-5,1,4);ctx.fillRect(x,y+2,1,4);
  ctx.fillStyle='#fcfcfc';ctx.fillRect(x,y,1,1);
  if(fp.charging){ctx.fillStyle='#000';ctx.fillRect(x-6,y+8,13,3);ctx.fillStyle=c;ctx.fillRect(x-5,y+9,Math.round(11*fp.power),1)}}
}
// Worms weapon panel: right-click, Tab, or tap the weapon name.
let panelOn=false,panelSig='';
function openPanel(on){const p=focusP();if(on&&(!p||!p.alive||state!=='play'))on=false;panelOn=on;$('wpanel').hidden=!on;panelSig='';
 if(on){renderPanel();mouse.down=false;blip(880)}}
function renderPanel(){const p=focusP();if(!p)return;const sig=p.wpn+(p.ammo||[]).join();if(sig===panelSig)return;panelSig=sig;
 $('wpanel').innerHTML='<h3>WEAPONS<small>'+(touchDev?'TAP TO PICK':'CLICK TO PICK · RIGHT-CLICK / TAB CLOSES')+'</small></h3>'+WLIST.map((id,k)=>{const a=ammoOf(p,id);
  return '<button data-w="'+k+'"'+(a===0?' disabled':'')+(p.wpn===id?' class="on"':'')+'>'+DEF[id].n.toUpperCase()+'<em>'+(a==null||a<0?'UNLIMITED':a===0?'EMPTY':'AMMO '+a)+'</em></button>'}).join('')}
$('wpanel').addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b||b.disabled)return;chooseW(+b.dataset.w);openPanel(false)});
$('wpanel').addEventListener('contextmenu',e=>{e.preventDefault();openPanel(false)});
$('wPrev').addEventListener('click',()=>pulse('prev'));$('wNext').addEventListener('click',()=>pulse('next'));
$('wNow').addEventListener('click',()=>openPanel(!panelOn));
// HUD buttons never keep keyboard focus, so Space always jumps.
for(const id of['wPrev','wNext','wNow'])$(id).addEventListener('mousedown',e=>e.preventDefault());
function nameOf(p){
 if(!p)return'?';
 if(NET.mode!=='online')return p.name||COLORS[p.i][0];
 if(!p.peer)return 'CPU '+(p.i+1);
 const pe=NET.room&&NET.room.peers().find(q=>q.peer===p.peer);
 if(!pe)return COLORS[p.i][0]+' (left)';
 return peerName(pe,p.i);
}
function peerName(pe,i){
 let n='';
 if(pe.presence&&typeof pe.presence.nm==='string')n=pe.presence.nm.replace(/[^\w .\-]/g,'').slice(0,12);
 if(!n&&pe.by){wantName(pe.by);n=(NET.names[pe.by]||'').split(' ')[0]}
 if(!n)n='P'+(i+1);
 return pe.sameTab?n+' (you)':n;
}
function wantName(by){
 if(!NET.user||NET.names[by]!==undefined)return;NET.names[by]='';
 NET.user.profiles([by]).then(ps=>{NET.names[by]=(ps&&ps[by]&&ps[by].name)||'';hud();renderRoom()}).catch(()=>{});
}
function hud(){
 $('players').innerHTML=state==='menu'?'':players.map(p=>{
  const w=curW(p),am=ammoOf(p,p.wpn),wt=w.n+(am>0?' ×'+am:'');
  return '<div class="pl'+(p.lives<=0?' out':'')+'"><span style="color:'+p.col+'">'+esc(nameOf(p))+' '+'♥'.repeat(Math.max(0,p.lives))+'</span>'+
  '<i><span style="width:'+(p.alive?Math.min(100,Math.max(0,p.hp)):0)+'%;background:'+p.col+'"></span></i><small>'+(p.alive?wt+(p.kills?' · '+p.kills+' KO':''):p.lives>0?'respawning…':'out')+'</small></div>'}).join('');
 const now=performance.now();feedView=feedView.filter(f=>f.until>now);
 $('feed').innerHTML=state!=='play'?'':feedView.map(f=>{const v=players[f.v],k=f.k>=0?players[f.k]:null;
  return '<span>'+(k?'<span style="color:'+k.col+'">'+esc(nameOf(k))+'</span> KO ':'')+'<span style="color:'+(v?v.col:'#fff')+'">'+esc(nameOf(v))+'</span>'+(k?'':' fell')+'</span>'}).join('');
 const sp=V.spec&&state==='play'&&V.t;$('spec').hidden=!sp;
 if(sp){const out=humans().length>0;$('specName').innerHTML=(out?'YOU\'RE OUT · ':'')+'WATCHING <span style="color:'+V.t.col+'">'+esc(nameOf(V.t)).toUpperCase()+'</span>'}
 $('pad').hidden=!padWanted||state!=='play'||!!V.spec;
 const fp=state==='play'?focusP():null,showW=!!(fp&&fp.alive&&!V.spec);
 $('wbar').hidden=!showW;
 if(showW){const a=ammoOf(fp,fp.wpn),nm=curW(fp).n.toUpperCase();
  if($('wName').textContent!==nm){$('wName').textContent=nm;const b=$('wbar');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
  $('wAmmo').textContent=(a==null||a<0?'UNLIMITED':'AMMO '+a)+(touchDev?' · TAP FOR LIST':' · E / WHEEL · RIGHT-CLICK LIST')}
 if(panelOn){if(showW)renderPanel();else openPanel(false)}
 document.body.classList.toggle('mouseaim',showW&&usesMouse(fp)&&!panelOn);
 if(state!=='play'){$('info').textContent=NET.mode==='online'&&NET.code?'Room '+NET.code:'';return}
 const s=isClient()?NET.sd:sdLeft();
 $('info').innerHTML=(NET.late?'<b>Joined mid-match, you play next round</b> · ':'')+(M.mode==='teams'?'<b>Teams</b> · ':'')+(s>=9999?'No rising water':s>0?'Water rises in <b>'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</b>':'<b style="color:var(--fire)">Water rising!</b>')+
  ' · Wind <b>'+(wind===0?'calm':(wind<0?'◀ ':'')+Math.abs(Math.round(wind*5))+(wind>0?' ▶':''))+'</b>';
}

/* ---------- sound + music (the engine plays them; these are Worms' own) ---------- */
RA.audio.add('holy',(AC,now,g)=>{g.gain.value=1;[523,659,784,1047].forEach((f,i)=>{const o=AC.createOscillator(),v=AC.createGain();o.type='triangle';o.frequency.value=f;
  v.gain.setValueAtTime(0,now);v.gain.linearRampToValueAtTime(.06,now+.15);v.gain.linearRampToValueAtTime(0,now+1.1);o.connect(v);v.connect(g);o.start(now+i*.05);o.stop(now+1.2)})});
const T=music.track;
// 0-2 match tracks, 3 = lobby, 4 = Sudden Death (water rising).
const TRACKS=[
  T('Worm Parade',150,['C','G','Am','F'],'k.h.s.h.k.k.s.h.',
   'e5 . g5 . c6 - b5 . g5 . e5 . g5 - - . d5 . g5 . b5 - a5 . g5 . d5 . g5 - - . c5 . e5 . a5 - g5 . e5 . c5 . e5 - a4 . f5 - e5 - d5 - c5 - d5 . e5 . d5 - - -'),
  T('Crater Funk',128,['Am','Am','Dm','E'],'k..hs.h.k.khs.hh',
   'a4 . c5 a4 . e5 . a4 d5 . c5 . b4 . a4 . a4 . c5 a4 . e5 . g5 . e5 . c5 . d5 - . d5 . f5 d5 . a5 . f5 g5 . f5 . e5 . d5 . e5 - - . g#5 - - . b5 - . a5 g#5 - e5 .'),
  T('Airdrop Rush',168,['Em','C','D','B'],'k.hhs.hhk.hhs.hk',
   'e5 . e5 g5 . e5 b5 . a5 . g5 . f#5 . g5 . e5 . e5 g5 . e5 c6 . b5 . g5 . e5 - - . d5 . f#5 a5 . f#5 d6 . c6 . a5 . f#5 . a5 . b5 - - . a5 - g5 . f#5 - d#5 . b4 - - .'),
  T('Grub Theme',120,['G','Em','C','D'],'k...h...s...h.h.',
   'd5 - g5 - - - b5 - a5 - g5 - d5 - - - e5 - g5 - - - b5 - a5 - g5 - e5 - - - c5 - e5 - g5 - c6 - b5 - a5 - g5 - e5 - f#5 - - - a5 - - - d6 - c6 - b5 - a5 -'),
  T('Sudden Death',176,['Dm','Bb','C','A'],'k.hsk.hsk.hsk.ss',
   'd5 d5 . d5 f5 . d5 . a5 . g5 f5 . e5 . d5 d5 d5 . d5 f5 . bb5 . a5 . f5 . d5 - - . c5 c5 . e5 g5 . c6 . bb5 . g5 . e5 . c5 . c#5 - e5 - a5 - c#6 - e6 - - . a5 - - .')];
/* ---------- online: rooms ---------- */
function netMsg(t){$('netMsg').textContent=t||'';$('netMsg').hidden=!t}
async function initNet(){
 const n=await RA.net.connect();
 if(!n){netOff();return}
 Object.assign(NET,{lobby:n.room,user:n.user,db:n.db,me:n.me});
 n.room.onPeers(renderRooms,()=>netOff());
 RA.player.room(n.room);
 loadStats();
}
function netOff(){
 netMsg(APP?'Networking failed to start. Restart the app.':'Online play is not available here. Open this page signed in to claude.ai; friends need it shared with them.');
 $('create').disabled=$('join').disabled=true;
}
function renderRooms(){
 if(!NET.lobby)return;
 const others=NET.lobby.peers().filter(pe=>!pe.sameTab&&pe.kind==='viewer');
 const open=others.filter(pe=>pe.presence&&pe.presence.open&&!pe.presence.open.gm&&typeof pe.presence.open.c==='string');
 const names=others.map((pe,i)=>esc(peerName(pe,i))+(pe.presence&&pe.presence._ip?' (LAN)':'')).slice(0,30);
 setH($('whoOnline'),esc(others.length?others.length+' other player'+(others.length>1?'s':'')+' online: '+names.join(', ').replace(/&amp;/g,'&'):'No other players online right now.'));
setH($('rooms'),open.length?open.map(pe=>{const o=pe.presence.open,c=String(o.c).replace(/[^A-Z0-9]/g,'').slice(0,5);
  return '<div class="room"><span>Room <b class="code">'+c+'</b> · '+Math.min(MAXP,o.n|0)+'/'+MAXP+' · '+(o.ph==='play'?'playing':'waiting')+(pe.presence._ip?' · LAN':'')+'</span><button data-room="'+c+'">JOIN</button></div>'}).join('')
  :'<p class="note">No open rooms right now. Create one and share the code.</p>');
}
$('rooms').addEventListener('click',e=>{const c=e.target.dataset&&e.target.dataset.room;if(c)enterRoom(c,false)});
const newCode=RA.net.newCode;
async function enterRoom(code,asHost){
 code=String(code).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);
 if(code.length<3){netMsg('Type the room code first.');return}
 if(!NET.lobby){netOff();return}
 netMsg('');audio();saveSetup();
 try{NET.room=await NET.lobby.join('gb-'+code.toLowerCase())}catch(e){netMsg('Could not join that room ('+(e&&e.code||'error')+'). Try again.');return}
 Object.assign(NET,{mode:'online',host:asHost,code,order:[],matchId:0,late:false,hostGone:0,lastI:-1});
 const pr={j:1,w:+$('ow').value,i:0,nm:nick(),lk:RA.look('worms')};RA.player.room(NET.room);
 NET.room.presence(pr).catch(()=>{});
 NET.room.onPeers(onRoomPeers,()=>{netMsg('Lost the room connection.');leaveRoom()});
 $('onHome').hidden=true;$('onRoom').hidden=false;$('rcode').textContent=code;
 renderRoom();
}
async function leaveRoom(){
 const r=NET.room;NET.room=null;if(r)RA.player.unroom(r);NET.mode='local';NET.host=false;NET.code='';
 try{NET.lobby&&NET.lobby.presence({open:null})}catch(e){}
 try{if(r)await r.leave()}catch(e){}
 $('onHome').hidden=false;$('onRoom').hidden=true;showMenu();
}
function hostPeer(){
 if(!NET.room)return null;
 const hs=NET.room.peers().filter(pe=>pe.presence&&pe.presence.host===1&&pe.presence.g);
 return hs.sort((a,b)=>a.peer<b.peer?-1:1)[0]||null;
}
// Host: who plays, in join order, host first, capped so CPUs + people <= 20.
function rosterPeers(){
 const ps=NET.room.peers().filter(pe=>pe.kind==='viewer'&&pe.presence&&pe.presence.j===1);
 for(const pe of ps)if(!NET.order.includes(pe.peer))NET.order.push(pe.peer);
 const me=ps.find(pe=>pe.sameTab);
 const list=NET.order.map(id=>ps.find(pe=>pe.peer===id)).filter(Boolean).filter(pe=>pe!==me);
 return(me?[me]:[]).concat(list).slice(0,MAXP);
}
function renderRoom(){
 if(NET.mode!=='online'||!NET.room||state!=='menu')return;
 let peers;
 if(NET.host)peers=rosterPeers().map(pe=>pe.peer);
 else{const h=hostPeer();peers=h&&Array.isArray(h.presence.g.r)?h.presence.g.r:[]}
 const all=NET.room.peers(),cpus=NET.host?+$('cpus').value:(hostPeer()?(hostPeer().presence.g.cpu|0):0);
setH($('roster'),peers.slice(0,MAXP).map((id,i)=>{const pe=all.find(q=>q.peer===id);
  return '<span style="color:'+COLORS[i][1]+'">'+esc(pe?peerName(pe,i):'P'+(i+1))+(i===0?' · host':'')+'</span>'}).join('')+
  (cpus?'<span class="note">+ '+Math.min(cpus,MAXP-peers.length)+' CPU</span>':''));
 for(const[id,v]of[['hostCtl',!NET.host],['msetO',!NET.host],['rwait',NET.host]])if($(id).hidden!==v)$(id).hidden=v;
 {const t=!NET.host&&!hostPeer()?'Looking for the host…':'Waiting for the host to start…';if($('rwait').textContent!==t)$('rwait').textContent=t}
}
function onRoomPeers(){
 if(NET.host){renderRoom();return}
 const h=hostPeer();
 if(!h){if(!NET.hostGone)NET.hostGone=performance.now();renderRoom();return}
 NET.hostGone=0;
 const g=h.presence.g;
 if(g.ph==='lobby'){if(state!=='menu'){players=[];showMenu()}renderRoom();return}
 applySnap(g);
}
$('create').addEventListener('click',()=>enterRoom(newCode(),true));
$('join').addEventListener('click',()=>enterRoom($('code').value,false));
$('code').addEventListener('keydown',e=>{if(e.key==='Enter')enterRoom($('code').value,false)});
$('leave').addEventListener('click',leaveRoom);
$('ow').addEventListener('change',()=>{saveSetup();if(NET.room)NET.room.presence({w:+$('ow').value}).catch(()=>{})});
$('nick').addEventListener('change',()=>{const n=nick();$('nick').value=n;try{localStorage.setItem('gb-nick',n)}catch(e){}
 if(NET.lobby)NET.lobby.presence({nm:n}).catch(()=>{});if(NET.room)NET.room.presence({nm:n}).catch(()=>{})});
$('cpus').addEventListener('change',renderRoom);
$('hstart').addEventListener('click',()=>{
 const r=rosterPeers(),cpus=Math.min(+$('cpus').value,MAXP-r.length);
 if(r.length+cpus<2){netMsg('Need at least 2 worms: wait for a friend or add a CPU.');return}
 netMsg('');
 NET.mroster=r.map(pe=>pe.peer).concat(Array(cpus).fill(''));
 const list=NET.mroster.map((peer,i)=>{const pe=r[i];
  if(!peer)return{ctrl:'cpu',peer:'',weapon:DEFAULTS[i%4]};
  const wi=pe.sameTab?+$('ow').value:Math.max(0,Math.min(3,pe.presence.w|0));
  return{ctrl:pe.sameTab?'me':'net',peer,weapon:DEFAULTS[wi],mine:pe.sameTab}});
 NET.matchId=(Math.random()*1e9)|0;NET.seed=(Math.random()*1e9)|0;NET.saved=false;
 startMatch(list,NET.seed);
});

/* host -> everyone: the match as compact arrays (fits the 4 KiB presence limit) */
function snapshot(){
 const g={ph:state==='over'?'over':'play',id:NET.matchId,seed:NET.seed,n:players.length,el:(matchT/60)|0,
  wd:Math.round(wind*5),wt:WATER,sd:sdLeft(),cf:[M.mode,M.fog,M.drops],wl:NET.wl||'',win:NET.winner,r:NET.mroster,
  p:players.map(p=>[Math.round(p.x*2),Math.round(p.y*2),Math.max(0,p.hp|0),p.lives,p.dir,Math.round(p.aim*100),p.alive?1:0,p.charging?Math.round(p.power*98)+1:0,
   WLIST.indexOf(p.wpn),(p.ammo||[]).map(a=>a<0?'i':Math.min(9,a)).join(''),p.kami>0?1:0,p.kills,p.inv>0?1:0,p.grounded?1:0,p.reveal>0?1:0,
   (p.rope||p.hook)?Math.round((p.rope||p.hook).x):-1,(p.rope||p.hook)?Math.round((p.rope||p.hook).y):-1,(p.chute?1:0)|(p.jet>0?2:0),p.life|0,p.hide>0?1:0,p.poison>0?1:0]),hx:SY.pack(),lg:NET.lowG|0,
  c:crates.map(c=>[c.x,Math.round(c.y),c.party?2:c.hp?1:0,c.landed?1:0]),f:NET.feed,
  x:NET.xlog,pr:projs.slice(0,30).map(q=>{const v=projView(q);return[Math.round(v.x),Math.round(v.y),v.k,v.f,v.d,v.a,v.o]})};
 while(JSON.stringify(g).length>3800&&g.pr.length)g.pr.pop();
 return g;
}
function broadcast(now){
 if(!NET.host||!NET.room)return;
 const inGame=state==='play'||state==='over';
 if(now-NET.lastB<(inGame?50:300))return;NET.lastB=now;
 const g=inGame?snapshot():{ph:'lobby',r:rosterPeers().map(pe=>pe.peer),cpu:+$('cpus').value};
 NET.room.presence({host:1,g}).catch(()=>{});
 if(now-NET.lastL>1500&&NET.lobby){NET.lastL=now;
  NET.lobby.presence({open:{c:NET.code,n:inGame?players.filter(p=>p.peer).length:rosterPeers().length,ph:inGame?'play':'lobby'}}).catch(()=>{})}
}
/* everyone else: rebuild the view from the host's snapshot */
function applySnap(g){
 if(!g||!Array.isArray(g.p)||!Array.isArray(g.r))return;
 const n=Math.max(2,Math.min(MAXP,g.p.length));
 if(g.id!==NET.matchId){
  NET.matchId=g.id;NET.xs=0;NET.fseen=0;NET.saved=false;NET.late=(g.el|0)>2;SY.reset();NET.fq=[];NET.fqs=0;NET.fd=0;
  setSize(n);genTerrain(g.seed|0);memClear();projs=[];crates=[];parts=[];texts=[];feedView=[];graves=[];
  players=g.p.slice(0,n).map((a,i)=>({i,col:COLORS[i][1],hp:100,alive:true,lives:3,peer:'',wpn:'bazooka',ammo:startAmmo(),dir:1,aim:.5,x:0,y:0,vx:0,vy:0,kills:0,flash:0,prev:{},cd:0,power:0,burst:0,coy:0,jb:0,lastJ:-99,inv:0}));
  state='play';showGame();
  if(Array.isArray(g.f))for(const e of g.f)NET.fseen=Math.max(NET.fseen,e[2]|0);
 }
 SY.unpack(g.hx);
 const all=NET.room.peers();
 g.p.slice(0,n).forEach((a,i)=>{const p=players[i];if(!p||!Array.isArray(a))return;
  const hp=a[2]|0,alive=!!a[6];
  if(p.alive&&alive&&hp<p.hp){texts.push({x:a[0]/2,y:a[1]/2-17,n:p.hp-hp,t:50,col:p.col});p.flash=6}
  if(p.alive&&!alive&&p.y<WATER)graves.push({x:p.x,y:p.y-4,vy:-1.5,col:p.col,c:lookOf(p).grave==='Celtic'});
  const peer=typeof g.r[i]==='string'?g.r[i]:'',pe=all.find(q=>q.peer===peer);
  const mine=!!(pe&&pe.sameTab),life=a[18]|0,ammo=typeof a[9]==='string'?[...a[9]].slice(0,WLIST.length).map(c=>c==='i'?-1:(+c||0)):p.ammo;
  Object.assign(p,{hp,lives:a[3]|0,alive,ammo,kills:a[11]|0,inv:a[12]?1:0,reveal:a[14]?1:0,hide:a[19]?1:0,poison:a[20]?1:0,peer,mine,ctrl:mine?'me':'net'});
  if(mine&&alive&&!a[10]&&p.life===life&&p.synced){if(!hasW(p,p.wpn))p.wpn='bazooka';return}   // my own worm runs here: keep my position, aim and weapon
  const fresh=!p.synced||p.life!==life||!!a[10];p.life=life;p.synced=1;p.kamiS=!!a[10];
  p.nx=a[0]/2;p.ny=a[1]/2;if(fresh||mine){p.x=p.nx;p.y=p.ny;p.vx=0;p.vy=0}
  Object.assign(p,{dir:a[4]<0?-1:1,aim:a[5]/100,charging:a[7]>0,power:Math.max(0,(a[7]-1)/98),
   wpn:WLIST[a[8]]||'bazooka',grounded:a[13]!==0,rope:a[15]>=0&&a[16]!=null?{x:a[15],y:a[16]}:null,hook:null,chute:(a[17]|0)&1,jet:(a[17]|0)&2?1:0})});
 projs=(g.pr||[]).map(a=>({x:a[0],y:a[1],k:a[2]|0,f:a[3]|0,d:a[4]<0?-1:1,a:a[5]|0,o:a[6]==null?-1:a[6]|0}));
 crates=(g.c||[]).map(a=>({x:a[0],y:a[1],hp:a[2]===1,party:a[2]===2,landed:!!a[3]}));
 G=(g.lg|0)>0?.05:G0;
 wind=(g.wd|0)/5;WATER=Math.max(40,Math.min(H-2,g.wt|0));NET.sd=g.sd|0;
 if(Array.isArray(g.cf)){M.mode=g.cf[0];M.fog=g.cf[1]|0;M.drops=g.cf[2]|0;for(const p of players){p.team=M.mode==='teams'?p.i%2:p.i;if(M.mode==='teams')p.col=TEAMC[p.i%2]}}if(g.ph==='play'&&NET.sd===0)music.play('worms',4);
 for(const e of g.x||[])if(e[0]>NET.xs){NET.xs=e[0];if(e[3]<0){addGirder(e[1],e[2]);continue}carve(e[1],e[2],Math.min(48,e[3]));debris(e[1],e[2],e[3]);sfx('boom',e[3])}
 for(const e of g.f||[])if((e[2]|0)>NET.fseen){NET.fseen=e[2]|0;feedView.push({k:e[0]|0,v:e[1]|0,until:performance.now()+5000})}
 if(g.ph==='over'&&state!=='over'){
  state='over';NET.winner=g.win|0;const wp=players[NET.winner];
  RA.autoBack({still:()=>state==='over',label:n=>{$('overNote').textContent='Back to the room in '+n+'…'}});
  $('winner').textContent=g.wl||(wp?nameOf(wp).toUpperCase()+' WINS':'DRAW');
  renderRanks();$('over').hidden=false;$('again').hidden=true;$('overNote').hidden=false;$('pad').hidden=true;
  saveStats();
 }
 hud();
}

/* ---------- save: your own Worms save file (RA.save keeps it on this device and, signed in, in your claude.ai space) ---------- */
const WL=WLIST;
// older saves were {matches,wins,kills,weapon} in data/users/<you>/grub
const SAVE=RA.save('worms',{doc:'grub',migrate:d=>d.stats||d.matches==null?d:{stats:{played:d.matches|0,wins:d.wins|0,kills:d.kills|0},weapon:d.weapon}});
function loadStats(){const apply=()=>{const w=SAVE.data.weapon;if(w!=null&&!(saved&&saved.ow!=null))$('ow').value=w;showRecord()};apply();SAVE.ready.then(apply)}
function showRecord(){const s=SAVE.stats;$('record').textContent=s.played?'Your save: '+(s.wins|0)+' wins · '+(s.played|0)+' matches · '+(s.kills|0)+' KOs':''}
const ACH=RA.achievements('worms',[
 {id:'first',name:'Fresh Grub',desc:'Finish your first match',test:s=>s.played>=1,unlock:['title:Grub','grave:Celtic']},
 {id:'win1',name:'Last Worm Standing',desc:'Win a match',test:s=>s.wins>=1,unlock:['title:Survivor','skin:Golden']},
 {id:'ko3',name:'Hat Trick',desc:'3 KOs in one match',test:(s,m)=>m.kills>=3,unlock:['title:Hat Trick','trail:Fire']},
 {id:'ko25',name:'Grave Digger',desc:'25 KOs in total',test:s=>s.kills>=25,unlock:['title:Grave Digger','skin:Zombie']},
 {id:'win10',name:'Worm Lord',desc:'Win 10 matches',test:s=>s.wins>=10,unlock:['title:Worm Lord','skin:Chrome']},
 {id:'play50',name:'Veteran',desc:'Play 50 matches',test:s=>s.played>=50,unlock:['title:Veteran','trail:Rainbow']}]);
function saveStats(){
 if(NET.saved||NET.late)return;NET.saved=true;
 const me=players.find(p=>p.mine)||(NET.mode!=='online'&&players.find(p=>p.ctrl!=='cpu'));if(!me)return;
 SAVE.set({weapon:+$('ow').value});const wp=players[NET.winner],m={won:!!wp&&(wp===me||(M.mode==='teams'&&wp.team===me.team)),kills:me.kills|0};SAVE.record(m);ACH.check(m);showRecord()}

/* ---------- match settings (host picks) ---------- */
for(const pre of['L','O'])$('mset'+pre).innerHTML=MSET.map(([k,t,o])=>'<label>'+t+' <select data-k="'+k+'" id="m'+pre+k+'">'+
 o.map(([v,l])=>'<option value="'+v+'"'+(String(CFG[k])===String(v)?' selected':'')+'>'+l+'</option>').join('')+'</select></label>').join('');
for(const[k]of MSET)for(const pre of['L','O'])$('m'+pre+k).addEventListener('change',e=>{const v=e.target.value;CFG[k]=isNaN(+v)?v:+v;
 for(const q of['L','O'])$('m'+q+k).value=v;try{localStorage.setItem('ra-worms-mset',JSON.stringify(CFG))}catch(_){}});
/* ---------- weapon presets 1-3 (survey: host sets the allowed weapons per match) ---------- */
const PRE=RA.presets('worms',{}),UTIL=['rope','jetpack','parachute','teleport','girder'];
const PDEF={1:{name:'Classic',w:WLIST.filter(id=>!['armageddon','nuke','scales','donkey'].includes(id))},
 2:{name:'Boom Party',w:['bazooka','homing','mortar','grenade','cluster','banana','holy','petrol','sheep','oldwoman','dynamite','mine','airstrike','napalm','donkey','sheepl','madcow','pigeon','mole','vase','mailstrike','minestrike','sheepstrike','armageddon','rope','jetpack','parachute']},
 3:{name:'Close Combat',w:['shotgun','handgun','uzi','minigun','punch','bat','prod','kamikaze','longbow','flamer','torch','grenade','dynamite',...UTIL]}};
function wPreset(n){const v=PRE.get(n)||{},d=PDEF[n];return{name:v.name||d.name,w:Array.isArray(v.w)?v.w.filter(id=>DEF[id]):d.w}}
function presetLabels(){for(const q of['L','O'])for(const o of $('m'+q+'wset').options)if(+o.value)o.textContent=o.value+'. '+wPreset(+o.value).name}
const wpre=document.createElement('div');wpre.className='wpre';wpre.hidden=true;root.appendChild(wpre);
let preSlot=1;
function renderPre(){const P=wPreset(preSlot);
 wpre.innerHTML='<div class="wpreBox"><h2>WEAPON PRESETS</h2><div class="row">'+[1,2,3].map(n=>'<button type="button" data-slot="'+n+'"'+(n===preSlot?' class="on"':'')+'>'+n+'. '+esc(wPreset(n).name)+'</button>').join('')+'</div>'+
 '<label>Name <input id="preName" maxlength="16" value="'+esc(P.name)+'"></label><div class="wgrid">'+
 WLIST.map(id=>'<label><input type="checkbox" data-id="'+id+'"'+(P.w.includes(id)||id==='bazooka'?' checked':'')+(id==='bazooka'?' disabled':'')+'>'+DEF[id].n+'</label>').join('')+
 '</div><div class="row"><button type="button" id="preAll">ALL</button><button type="button" id="preNone">NONE</button><button type="button" id="preReset">RESET</button><button type="button" class="go" id="preDone">DONE</button></div></div>'}
function savePre(){const w=[...wpre.querySelectorAll('input[data-id]')].filter(c=>c.checked).map(c=>c.dataset.id);PRE.set(preSlot,{name:($('preName').value||'').trim().slice(0,16)||PDEF[preSlot].name,w});presetLabels()}
wpre.addEventListener('change',savePre);
wpre.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.slot){preSlot=+b.dataset.slot;renderPre();return}
 if(b.id==='preAll'||b.id==='preNone'){wpre.querySelectorAll('input[data-id]').forEach(c=>{if(!c.disabled)c.checked=b.id==='preAll'});savePre()}
 if(b.id==='preReset'){PRE.set(preSlot,{});renderPre();presetLabels()}
 if(b.id==='preDone'){savePre();wpre.hidden=true}});
for(const q of['L','O']){const b=document.createElement('button');b.type='button';b.textContent='EDIT PRESETS';b.className='wpEdit';
 b.addEventListener('click',()=>{preSlot=CFG.wset||1;renderPre();wpre.hidden=false});$('mset'+q).appendChild(b)}
presetLabels();

/* ---------- spectator crates: worms that are out click the map to airdrop a crate (one per 25 s) ---------- */
const DROPCD=25*60;let dropReady=0;
function dropCrateAt(x,by){if(state!=='play'||!M.drops)return;
 const k=by?by.i:-1;NET.dt=NET.dt||{};if((NET.dt[k]|0)>matchT)return;NET.dt[k]=matchT+DROPCD;
 const n=crates.length;spawnCrate(true);const c=crates[n];if(c)c.x=Math.round(Math.max(12,Math.min(W-12,x)))}
function spectatorClick(){
 if(state!=='play'||!M.drops||!mouse.on)return false;
 const me=NET.mode==='online'?players.find(p=>p.mine):humans().find(p=>p.ctrl==='mk');
 if(!me||me.lives>0)return false;
 const now=performance.now();if(now<dropReady)return true;dropReady=now+DROPCD/60*1000;
 const[x]=toWorld(mouse);
 if(isClient()){NET.dc=[(NET.dc?NET.dc[0]:0)+1,Math.round(x)]}else dropCrateAt(x,me);
 return true}

/* ---------- menu ---------- */
function setTab(online){$('tabLocal').classList.toggle('on',!online);$('tabOnline').classList.toggle('on',online);
 $('setup').hidden=online;$('online').hidden=!online;if(online)renderRooms()}
$('tabLocal').addEventListener('click',()=>setTab(false));
$('tabOnline').addEventListener('click',()=>setTab(true));
$('start').addEventListener('click',()=>{audio();newLocalGame()});
$('again').addEventListener('click',()=>{
 projs=[];crates=[];
 if(NET.mode==='online'&&NET.host){players=[];showMenu();renderRoom();return}
 players=[];setSize(2);genTerrain((Math.random()*1e9)|0);showMenu()});

/* ---------- loop: the engine calls step() 60 times a second and frame() once per screen refresh ---------- */
cv.width=VW;cv.height=VH;
setSize(2);genTerrain((Math.random()*1e9)|0);
let specPad={};
$('specPrev').addEventListener('click',()=>specStep(-1));
$('specNext').addEventListener('click',()=>specStep(1));
addEventListener('keydown',e=>{if(RA.menu.open||state!=='play'||!V.spec||e.target.tagName==='INPUT')return;
 const d={ArrowLeft:-1,KeyA:-1,KeyQ:-1,ArrowRight:1,KeyD:1,KeyE:1}[e.code];if(d){e.preventDefault();specStep(d)}});
function step(){
 if(isClient()){tick++;stepFx();
  for(const p of players){if(p.mine){if(state==='play'&&p.alive&&!p.kamiS){control(p,readInput(p,p));stepWorm(p)}}
   else if(p.nx!=null)SY.follow(p,p.nx,p.ny)}}else if(state==='play')update();else tick++;
 camStep()}
function frame(now){
 if(isClient()&&NET.room){const p=players.find(q=>q.mine);
  if(p&&state==='play')SY.upload(NET.room,now,[Math.round(p.x*10),Math.round(p.y*10),Math.round((p.vx||0)*100),Math.round((p.vy||0)*100),p.dir,Math.round(p.aim*100),p.grounded?1:0,
   (p.chute?1:0)|(p.jet>0?2:0)|(p.rope?4:0),p.rope?Math.round(p.rope.x):0,p.rope?Math.round(p.rope.y):0,p.charging?Math.round(p.power*98)+1:0,WLIST.indexOf(p.wpn),NET.fd|0,p.life|0],NET.matchId,{wf:NET.fq,dc:NET.dc});
  if(NET.hostGone&&now-NET.hostGone>4000){NET.hostGone=0;netMsg('The host left the room.');leaveRoom()}}
 if(isClient()&&state==='play'&&tick%6===0)hud();
 if(V.spec&&state==='play'){const g=readPad(0),pg=specPad;if(g.left&&!pg.left)specStep(-1);if(g.right&&!pg.right)specStep(1);specPad=g}
 broadcast(now);
 render();
}
initNet();
$('toMenu').addEventListener('click',()=>{if(NET.room)leaveRoom();RA.menu.show()});

RA.register({id:'worms',name:'WORMS',kind:'Artillery',players:'2-20 players',ready:true,el:root,
 desc:'Real-time artillery brawl. Everyone moves at once. Grab airdrops, last worm standing wins.',
 icon:['...kkkk...','..kppppk..','..kpwkpk..','..kppppk..','...kppk...','...kppk...','..kpppk...','.kppppk...','kpppppkk..','kkkkkkkk..'],
 music:TRACKS,
 enter(){music.play('worms',state==='menu'?3:0);SCR.fit()},
 step,frame,onKey,
 onEsc(){if(panelOn){openPanel(false);return true}},
 onQuit(){if(NET.mode==='online'){leaveRoom();return}
  players=[];projs=[];crates=[];setSize(2);genTerrain((Math.random()*1e9)|0);showMenu()}});
window.__gb={wormSprite,PMOD,GRAVEM,CHUTEM,solid:(x,y)=>solid(x,y),get projs(){return projs},explodeAt:(x,y)=>explode(x,y,20,25,null),get cam(){return cam},get VW(){return VW},get VH(){return VH},get state(){return state},get players(){return players},get crates(){return crates},fireW:(p)=>fire(p),partyCrate:(p,i)=>{PARTY[i][1](p)},PARTYN:()=>PARTY.length,WLIST,spawnCrate,get M(){return M},get theme(){return THEME.n},update,newLocalGame,snapshot,applySnap,NET,
 terrSum:()=>{let s=0;for(let i=0;i<terr.length;i++)if(terr[i])s=(s+i*7)%1000003;return s}};
})();
