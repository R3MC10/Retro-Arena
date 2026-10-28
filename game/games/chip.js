/* CHIP & CHUM. Original: tiny heroes in oversized rooms, shared crates carried overhead,
   straight throws, crate shields and the joyful risk of throwing a friend to a ledge.
   20-player twist: limited reusable crates; rescue ghosts together, or capture stunned rivals.
   First 10 seconds: D to the glowing crate, E lifts, E throws, W/Space jumps; S shields.
   Why fun: coordinate a boss volley, rescue a fallen friend, steal a crate before a rival.
   Art source: tools/art/chip/art.js. One-way platforms use the snout/atoll feet + coyote model. */
(()=>{
const X=RA.pix,P=X.PAL,ART=/* ART_BEGIN */{"idle":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...","..kkkTTWWTTkkk....","...kk112223kk.....","..kkT122223Tkk....","..kkk122223kkk....","...kkTTTTTkkk.....","...kkTkkkTkk......","..kkkkkkkkkkk.....","...kkkk.kkkk......"],"run":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...","..kkkTTWWTTkkk....","...kk112223kk.....","..kkT122223Tkk....","..kkk122223kkk....","...kkTTTTTkkk.....","..kkTTkkkkTTkk....",".kkkkkk..kkkkkk...","..kkkk....kkkk...."],"run2":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...","..kkkTTWWTTkkk....","...kk112223kk.....","..kkT122223Tkk....","..kkk122223kkk....","...kkTTTTTkkk.....","....kkTTkkk.......","....kkkkkk........",".....kkkk........."],"jump":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...",".kkkkTTWWTTkkk....","kkTk112223kTkk....","kkkk122223kkkk....",".kkkk12223kkk.....","..kkTTkkTTkk......","..kkkkkkkkkk......","...kkkkkkkk.......",".................."],"carry":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...",".kkkkTTWWTTkkk....","kkTk112223kTkk....","kkTk122223kTkk....","kkkk122223kkkk....",".kkkkTTTTTkkk.....","...kkTkkkTkk......","..kkkkkkkkkkk.....","...kkkk.kkkk......"],"throw":["...kkk....kkk.....","..kkkkk..kkkkk....",".kkTTSkkkkTTSkk...",".kkTTNNkkNTTNkk...","..kkTNNNNNNTkk....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...","..kkkTTWWTTkkkk...","...kk112223kkkkk..","...kk122223TTTTkk.","...kk122223kkkkk..","...kkTTTTTkkkkk...","...kkTkkkTkk......","..kkkkkkkkkkk.....","...kkkk.kkkk......"],"hide":["..................","..................","..................","..................","..................","..................","...kkkkkkkkkk.....","..kkNWkNNWkNkk....",".kkTTWkTTWkTTkk...",".kkTTTTkkTTTTkk...","..kkkTTWWTTkkk....","...kk112223kk.....","..kk12222223kk....","..kkTTTTTTTTkk....","..kkkkkkkkkkkk....","...kkkkkkkkkk....."],"stunned":["..................","..................","..................","..................","..................","..................","....kkk...kkk.....","...kkkkk.kkkkkk...","..kkTXTkkkTXTkkk..",".kkTTTTkkTTTTTTkk.",".kkTTTTTTTTTTTTkk.","..kkkTTWWTTTTkkk..","..kk12222223kkk...",".kkTTTTTTTTTTkk...",".kkkkkkkkkkkkkk...","..kkkkkkkkkkkk...."],"ghost":[".....kkkkkk.......","....kkkkkkkk......","...kkCCCCCCkk.....","..kkCCWkCWkCkk....","..kkCCWkCWkCkk....","..kkCCCCCCCCkk....","..kkCCCCCCCCkk....","..kkCCkCCkCCkk....","...kkkkkkkkkk.....","....kk.kk.kk......"],"crate":["kkkkkkkkkkkk","kYYYYYYYYYNk","kYNkkkkkYNNk","kYNkYYNkYNNk","kYNkYNYkYNNk","kYNkNYYkYNNk","kYNkkkkkYNNk","kYYYYYYYYNNk","kNNNNNNNNNNk","kkkkkkkkkkkk"],"apple":["....eL....","...kLek...","..kRRRrk..",".kRWRRrrk.","kRWRRRrrrk","kRRRRRrrrk",".kRRRrrrk.","..kkkkkk.."],"acorn":["...kk...","..kNk...",".kNNNNk.","kNNNNNNk","kTTTTTTk",".kTTTTk.","..kkkk.."],"bug":["..k....k....","..kGkkGk....",".kGGGGGGk...","kGRkGGRkGk..","kGGGGGGGGk..",".kkGkkGkk...","kGk....kGk.."],"mouse":["..kk..kk....",".kGGkkGGk...","..kGGGGGkk..",".kGWkGGGGGk.","kGGGGGGGGGk.",".kkkkGkkGk..","...kGk.kGk.."],"dog":["...kk....kk.....","..kGGk..kGGk....",".kGGGGkkGGGGk...","kGRRkGGkRRGGGk..","kGkkGGGGkkGGGk..","kGGGkkkkGGGGGk..",".kGGWWWWGGGGk...","..kkGGGGGGkk....","...kGGkkGGk.....","..kkkk..kkkk...."],"cat":["kGk..........kGk","kGGk........kGGk","kGGGkkkkkkkkGGGk","kGGGGGGGGGGGGGGk","kGGRRkGGkRRGGGGk","kGGkkGGGGkkGGGGk","kGGGGGkkGGGGGGGk",".kGGGWWWWGGGGGk.","..kGGGGGGGGGGk..","...kkGGGGGGkk...","..kGGk....kGGk..",".kkkkk....kkkkk."],"fork":["kGkGkGkGk","kGkGkGkGk","kGGGGGGGk",".kGGGGGk.","...kGk...","...kGk...","...kGk...","...kGk...","...kGk...","...kkk..."],"book":["kkkkkkkkkkkk","k1222222223k","k1WWWWWWW23k","k12WWWWW223k","k1222222223k","kkkkkkkkkkkk","kWWWWWWWWWGk","kkkkkkkkkkkk"],"tree":["..........eeeee.........",".......eeeLLLLLeee......",".....eeLLLYLLLLLLLee....","...eeLLLLLLLLLLeLLLLe...","..eLLLYLLLLLLLLLLLLLLe..",".eLLLLLLLLLLeLLLLLLLLLe.","eLLLLLeLLLLLLLLLLLYLLLLe","eLLYLLLLLLLYLLLLLLLLLLLe","eLLLLLLLLLLLLLLLLLeLLLLe",".eeLLLLLLLeLLLLLLLLLLee.","...eeeeLLLLeLLLLLeeee...",".......eeNNNeeee........","........kNTNk...........","........kNTNk...........",".......kNNTNNk..........",".......kNTNNNk..........","......kNNTNNNNk.........",".....kkNNNNNNNkk........"],"bench":["kkkkkkkkkkkkkkkkkkkkkkkk","kTTTTTTTTTTTTTTTTTTTTTTk","kNNNNNNNNNNNNNNNNNNNNNNk","kTTTTTTTTTTTTTTTTTTTTTTk","kNNNNNNNNNNNNNNNNNNNNNNk",".kkk................kkk.",".kGk................kGk.","kkkkkkkkkkkkkkkkkkkkkkkk","kTTTTTTTTTTTTTTTTTTTTTTk",".kkkkkkkkkkkkkkkkkkkkkk.","..kGk..............kGk..","..kkk..............kkk.."],"flower":["..R.R...","..RYR...","...N....",".L.N.L..","..LNL...","...N...."],"gear":["....gggg....","...gGWWGg...",".ggGGGGGGgg.","gGGGkkkkGGGg","gGWkGGGGkWGg","gGWkGkkGkWGg","gGWkGkkGkWGg","gGWkGGGGkWGg","gGGGkkkkGGGg",".ggGGGGGGgg.","...gGWWGg...","....gggg...."]}/* ART_END */,SCR=X.screen(),LEN=960,CD=180;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),r=Math.round,team=i=>i%2;
let K,people=[],crates=[],enemies=[],nuts=[],effects=[],zone=0,zt=0,theme=0,points=[0,0],bossHP=0,bossMax=0,burst=[],ended=false,event='LIFT A CRATE - HELP YOUR FRIENDS',eventT=0,restarts=0;
const mine=c=>K.isClient()?c.i===K.myIdx:K.seats[c.i].ctrl!=='net';
const hash=n=>{let x=Math.imul(n+K.seed,1597334677);return ((x^(x>>>16))>>>0)/4294967296};
// War's cages are mirrored around x=480; its shelves must be too.
const plats=()=>K.mode===1?[[110,200,126],[285,385,105],[455,505,125],[575,675,105],[760,850,126]]:[[110,200,126],[285,385,105],[455,550,125],[630,730,103],[790,885,125]];
const warSpawn=i=>team(i)?LEN-(130+Math.floor(i/2)%5*12):130+Math.floor(i/2)%5*12;
const sound=(s,i=-1)=>{if(!K.demo&&(i<0||mine(people[i])&&!people[i].cpu))RA.audio.sfx('chip-'+s)};
function announce(s){event=s;eventT=K.tick;K.fx('event',s)}
function puff(x,y,col=P.Y){for(let j=0;j<6;j++)effects.push([x,y,(j-2.5)*.45,-1.6-(j%2),25,col]);}
function resetZone(z){zone=z;zt=K.tick;theme=(K.S.zones==='rnd'?K.seed%3:+K.S.zones);if(K.mode===0)theme=(theme+Math.min(z,2))%3;
 const nc=Math.min(14,Math.max(6,Math.ceil(people.length*.65)));crates=Array.from({length:nc},(_,i)=>({x:r(70+i*820/(nc-1)),y:154,vx:0,vy:0,held:-1,fly:0,by:-1,apple:i%4===3?1:0,wait:0}));
 const count=K.mode===0&&z<3?({few:4,normal:7,many:10}[K.S.enemies]||7):0;
 enemies=Array.from({length:count},(_,i)=>({x:235+i*88,y:154,hp:1,stun:0,type:i%3}));
 nuts=Array.from({length:28},(_,i)=>[r(40+i*32+(hash(i+371)-.5)*14),(i+(K.seed%4))%4===0?115:145,0]);
 bossMax=K.mode===0&&z===3?Math.max(12,people.length*2):0;bossHP=bossMax;burst=[];
 for(const c of people){c.x=K.mode===1?warSpawn(c.i):35+(c.i%10)*24;c.face=K.mode===1&&team(c.i)?-1:1;c.y=154;c.hp=3;c.ghost=0;c.stun=0;c.inv=150;c.held=-1;c.carried=-1;c.cage=0;c.vx=c.vy=0;c.cam=c.x;c.warp++;c.revive=0;}
}
function start(seats,md,S){ended=false;points=[0,0];effects=[];restarts=0;eventT=0;event='E LIFT / THROW - W JUMP - S SHIELD';people=seats.map((s,i)=>({i,name:s.name,col:md===1?(i%2?P.B:P.R):s.col,cpu:s.ctrl==='cpu',x:40,y:154,vx:0,vy:0,face:1,hp:3,score:0,rescues:0,hits:0,deaths:0,ghost:0,stun:0,inv:0,held:-1,carried:-1,cage:0,revive:0,seq:0,seen:0,action:0,pose:0,duck:false,jump:false,coyote:6,cd:0,cam:40,warp:0,ack:0,log:[]}));resetZone(0)}
function move(c,k){if(ended||K.tick<CD)return;for(const t of ['cd','pose'])if(c[t])c[t]--;
 const jump=!!(k.up||k.fire);if(c.ghost||c.carried>=0||c.cage){c.vx=0;return}c.duck=!!k.down&&c.held>=0;
 const d=(k.right?1:0)-(k.left?1:0),speed=c.cpu?(K.mode===2?[1.8,1.9,2.05][K.cpu]:[1.12,1.65,1.95][K.cpu]):2.05;
 if(d&&!c.stun)c.face=d;const target=c.stun||c.duck?0:d*speed;c.vx+=(target-c.vx)*.28;
 if(jump&&!c.jump&&c.coyote&&!c.stun&&!c.duck){c.vy=-5.1;c.coyote=0;sound('jump',c.i)}c.jump=jump;
 const old=c.y;c.vy+=.27;c.x=clamp(c.x+c.vx,9,LEN-9);c.y+=c.vy;let gy=154;
 for(const [a,b,y]of plats())if(c.x>a-3&&c.x<b+3&&old<=y+1&&c.y>=y&&c.vy>=0)gy=Math.min(gy,y);
 if(c.y>=gy&&old<=gy+9&&c.vy>=0){c.y=gy;c.vy=0;c.coyote=7}else c.coyote=Math.max(0,c.coyote-1);
 if(k.alt&&!c.lastAlt&&!c.cd&&!c.stun){c.seq++;c.action=k.up?1:0;c.cd=18;c.pose=10;if(K.isClient())sound(c.held===-1?'lift':'throw',c.i)}c.lastAlt=!!k.alt;c.cam+=(c.x-c.cam)*.22;
}
function drop(c){if(c.held>=0){const q=crates[c.held];if(q){q.held=-1;q.x=c.x;q.y=c.y-16;q.vx=0;q.vy=-1;q.fly=0}c.held=-1}if(c.held<=-2){const o=people[-c.held-2];if(o){o.carried=-1;o.x=c.x+12*c.face;o.y=c.y-20;o.vy=-1;o.warp++}c.held=-1}}
function revive(c,by){c.ghost=0;c.hp=2;c.inv=180;c.stun=0;c.revive=0;c.warp++;if(by){by.rescues++;by.score+=3}puff(c.x,c.y-8,P.C);sound('revive');announce('FRIEND REVIVED!')}
function hit(c,by,why){if(c.inv||c.ghost||c.cage)return;if(c.duck&&c.held>=0){puff(c.x,c.y-12);sound('bonk');return}drop(c);c.inv=80;c.stun=65;c.deaths+=0;
 if(K.mode===0){c.hp--;if(!c.hp){c.ghost=1;c.deaths++;c.log.push([K.tick,why,r(c.x),zone]);announce('GHOST DOWN - STAND NEAR TO REVIVE')}}else{c.stun=150;if(K.mode===2&&c.score){const lost=Math.min(3,c.score);c.score-=lost;for(let j=0;j<lost;j++){const n=[clamp(c.x+(j-1)*13,15,945),145,K.tick+45];if(nuts.length<40)nuts.push(n);else{const k=nuts.findIndex((n,i)=>i>=28&&n[2]>K.tick);if(k>=0)nuts[k]=n}}}}
 if(by>=0&&people[by])people[by].hits++;puff(c.x,c.y-9,P.R);sound('bonk');}
function action(c){c.pose=10;if(c.ghost||c.carried>=0||c.cage||c.stun)return;
 if(c.held>=0){const q=crates[c.held];q.held=-1;q.by=c.i;q.x=c.x+c.face*12;q.y=c.y-15;q.vx=c.action?c.face*1.2:c.face*4.8;q.vy=c.action?-5.8:-.4;q.fly=90;c.held=-1;sound('throw',c.i);return}
 if(c.held<=-2){const o=people[-c.held-2];o.carried=-1;o.x=c.x+c.face*12;o.y=c.y-22;o.vx=c.face*4;o.vy=c.action?-7.2:-4.8;o.stun=0;o.inv=60;o.warp++;c.held=-1;sound('throw',c.i);return}
 // Reviving outranks lifting; CPUs never lift healthy allies or take a crate next to a human.
 const friend=people.find(o=>o!==c&&o.carried<0&&!o.ghost&&!o.cage&&Math.abs(o.x-c.x)<15&&Math.abs(o.y-c.y)<15&&((K.mode===1&&team(o.i)!==team(c.i)&&o.stun)||(K.S.friendly==='on'&&!c.cpu&&c.action===1&&(K.mode!==1||team(o.i)===team(c.i)))));
 if(friend){friend.carried=c.i;friend.warp++;c.held=-friend.i-2;sound('lift',c.i);return}
 let best=-1,dist=22;crates.forEach((q,i)=>{const d=Math.abs(c.x-q.x);if(q.held<0&&!q.wait&&!q.fly&&d<dist&&Math.abs(q.y-c.y)<24){if(c.cpu&&people.some(h=>!h.cpu&&h!==c&&Math.abs(h.x-q.x)<25&&h.held===-1))return;best=i;dist=d}});
 if(best>=0){crates[best].held=c.i;c.held=best;sound('lift',c.i)}
}
function order(){return people.slice().sort((a,b)=>K.mode===1?points[team(b.i)]-points[team(a.i)]||b.score-a.score:b.score-a.score||b.rescues-a.rescues||a.i-b.i)}
function finish(win){if(ended)return;ended=true;K.end(win)}
function shared(){
 // Alternate priority so neither red nor a low seat always claims a contested pickup first.
 const turn=K.mode===1?Array.from({length:people.length},(_,j)=>people[(j+K.tick+K.seed)%people.length]):people;
 for(const c of turn){if(c.inv)c.inv--;if(c.stun)c.stun--;if(c.seq!==c.seen){c.seen=c.seq;action(c)}
 if(c.carried>=0){const o=people[c.carried];c.x=o.x;c.y=o.y-24;c.vx=c.vy=0;if(K.mode===1&&team(c.i)!==team(o.i)&&Math.abs(o.x-(team(o.i)?910:50))<26){drop(o);c.cage=420;c.stun=0;c.x=team(o.i)?920:40;c.y=154;c.warp++;points[team(o.i)]++;o.score+=5;announce('CAPTURE! RESCUE AT THE ENEMY CAGE')}}
 if(c.cage){if(!--c.cage){c.x=warSpawn(c.i);c.inv=120;c.warp++}else{const ally=people.find(o=>o!==c&&!o.cage&&!o.ghost&&team(o.i)===team(c.i)&&Math.abs(o.x-c.x)<22);if(ally){c.cage=0;c.inv=120;c.warp++;ally.rescues++;ally.score+=3;announce('CAGE BREAK!')}}}
 if(c.ghost){const near=people.filter(o=>o!==c&&!o.ghost&&!o.cage&&o.carried<0&&Math.abs(o.x-c.x)<20&&Math.abs(o.y-c.y)<22);if(near.length)c.revive++;else c.revive=0;if(c.revive>=120)revive(c,near[0]);if(c.cpu&&K.tick%480===c.i*13%480)revive(c,null);continue}
 if(K.mode===2&&!c.cage)for(const n of nuts)if(n[2]<=K.tick&&Math.abs(c.x-n[0])<10&&Math.abs(c.y-7-n[1])<18){c.score++;n[2]=K.tick+480;puff(n[0],n[1],P.Y);sound('pick',c.i)}
 }
 for(const q of crates){if(q.held>=0){const c=people[q.held];q.x=c.x;q.y=c.y-(c.duck?2:19);continue}if(q.wait){if(!--q.wait){q.x=r(70+crates.indexOf(q)*820/(crates.length-1));q.y=154;q.vx=q.vy=q.fly=0}continue}
 const old=q.y;q.x+=q.vx;q.y+=q.vy;q.vy+=.21;if(q.fly)q.fly--;
 if(q.x<8||q.x>952){q.vx*=-.5;q.x=clamp(q.x,8,952)}let gy=154;for(const[a,b,y]of plats())if(q.x>a&&q.x<b&&old<=y&&q.y>=y&&q.vy>0)gy=Math.min(gy,y);
 if(q.y>=gy){q.y=gy;q.vy=0;q.vx*=.72;if(Math.abs(q.vx)<.5){q.vx=0;q.fly=0}}
 if(!q.fly)continue;
 let spent=false;for(const e of enemies)if(e.hp&&Math.abs(e.x-q.x)<15&&Math.abs(e.y-8-q.y+5)<17){e.hp=0;people[q.by].score+=2;spent=true;puff(e.x,e.y-7);sound('bonk');break}
 if(K.mode===0&&zone===3&&bossHP>0&&Math.abs(q.x-855)<29&&q.y>105&&q.y<155){burst.push([K.tick,q.by]);burst=burst.filter(a=>K.tick-a[0]<100);const need=Math.min(3,Math.max(1,Math.ceil(people.length/8)));if(new Set(burst.map(a=>a[1])).size>=need){bossHP=Math.max(0,bossHP-need);for(const a of burst)people[a[1]].score+=2;burst=[];announce('VOLLEY! ARMOUR CRACKED');sound('boss');puff(855,130,P.R)}else announce('ARMOUR - THROW TOGETHER!');spent=true}
 if(K.mode!==0)for(const c of people)if(c.i!==q.by&&(K.mode===2||team(c.i)!==team(q.by))&&!c.ghost&&Math.abs(c.x-q.x)<11&&Math.abs(c.y-9-q.y+5)<14){hit(c,q.by,'crate');spent=true;break}
 if(spent){q.fly=0;q.vx=q.vy=0;q.wait=100;puff(q.x,q.y)}
 }
 for(let j=0;j<enemies.length;j++){const e=enemies[j];if(!e.hp)continue;e.x+=Math.sin((K.tick+j*67)/100)*.45;for(const c of people)if(Math.abs(c.x-e.x)<13&&Math.abs(c.y-e.y)<15)hit(c,-1,['bug','mouse','dog'][e.type])}
 if(K.mode===0){if(zone<3){const alive=enemies.filter(e=>e.hp).length;if(!alive&&K.tick-zt>=2400){resetZone(zone+1);K.track(theme);announce(zone===3?'MECHA GUARDIAN - COMBINE YOUR THROWS':'ZONE CLEAR - STAY TOGETHER')}}else{if(bossHP<=0){finish({coop:true,name:'RESCUED!'});return}const phase=(K.tick-zt)%210;if(phase===145){announce('JUMP! GUARDIAN SHOCKWAVE');for(const c of people)if(c.x>680&&c.y>145)hit(c,-1,'shockwave')}}
 const humans=people.filter(c=>!c.cpu);if((humans.length?humans:people).every(c=>c.ghost)){restarts++;resetZone(zone);announce('TEAM DOWN - ZONE RESTARTED')}
 if(K.tick>=10980)finish({coop:false,name:'RESCUE TIME UP'});
 }else if(K.tick>=9180){if(K.mode===1)finish(points[0]===points[1]?null:{team:points[1]>points[0]?1:0,name:points[1]>points[0]?'BLUE':'RED'});else finish({i:order()[0].i})}
}
function step(){K.takeover();if(ended)return;for(const c of people){c.cpu=K.seats[c.i].ctrl==='cpu';if(mine(c))move(c,K.inp(c.i));else{if(c.pose)c.pose--;const u=K.remote(c.i);if(u&&u.a?.length===9&&u.a.every(Number.isFinite)){const a=u.a;if(a[8]===c.warp&&!c.ghost&&c.carried<0&&!c.cage){c.x=clamp(a[0],9,951);c.y=clamp(a[1],-50,154);c.vx=clamp(a[2],-5,5);c.vy=clamp(a[3],-8,8);c.face=a[4]<0?-1:1;c.duck=!!a[7]}c.seq=a[5];c.action=a[6]}}}if(K.tick>=CD)shared();if(K.NET.ev.length>6)K.NET.ev.splice(0,K.NET.ev.length-6);for(const e of effects){e[0]+=e[2];e[1]+=e[3];e[3]+=.12;e[4]--}effects=effects.filter(e=>e[4]>0).slice(-80)}
function local(i){move(people[i],K.inp(i))}
function bot(i){const c=people[i];if(!c||c.ghost||c.cage||K.tick<CD)return{};let target=c.x,act=false,up=false;
 const friend=people.filter(o=>o!==c&&((o.ghost)||(K.mode===1&&o.cage&&team(o.i)===team(i)))).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0];
 if(friend){target=friend.x;if(Math.abs(target-c.x)<15)return{};}
 else if(c.held<=-2){if(K.mode===1&&team(-c.held-2)!==team(i))target=team(i)?910:50;else{act=true;up=true}}
 else if(c.held>=0){let victim;if(K.mode===0)victim=zone===3?{x:855,y:154}:enemies.filter(e=>e.hp).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0];else victim=people.filter(o=>o.i!==i&&!o.cage&&!o.inv&&!o.stun&&(K.mode===2||team(o.i)!==team(i))).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0];
 if(victim){target=victim.x-c.face*65;const d=victim.x-c.x;c.face=d<0?-1:1;target=victim.x-Math.sign(d)*65;act=Math.abs(d)<150&&Math.abs(c.y-victim.y)<18;}else target=K.mode===1?LEN/2:500;
 }else{if(K.mode===1){const v=people.find(o=>team(o.i)!==team(i)&&o.stun&&!o.cage&&o.carried<0&&Math.abs(o.x-c.x)<80);if(v){target=v.x;act=Math.abs(v.x-c.x)<15}else target=LEN/2}
 // Easy hunters spend fewer turns seeking fights; combat speed and action rate stay unchanged.
 let qs=crates.map((q,j)=>({q,j})).filter(({q})=>q.held<0&&!q.fly&&!q.wait&&(!c.cpu||!people.some(h=>!h.cpu&&h!==c&&Math.abs(h.x-q.x)<25&&h.held===-1))).sort((a,b)=>Math.abs(a.q.x-c.x)-Math.abs(b.q.x-c.x));
 if(!act&&qs.length&&(K.mode!==2||(c.cpu?(K.cpu===0?(i+Math.floor(K.tick/150))%12===0:(i+Math.floor(K.tick/150))%3===0):people.some(o=>o.score>c.score+35&&Math.abs(o.x-c.x)<45)))){target=qs[0].q.x;act=Math.abs(target-c.x)<20&&Math.abs(qs[0].q.y-c.y)<23}else if(K.mode===2){const n=nuts.filter(n=>n[2]<=K.tick).sort((a,b)=>Math.abs(a[0]-c.x)-Math.abs(b[0]-c.x))[0];if(n)target=n[0]}}
 // Separate reaction and action rates make Easy meaningfully slower and less aggressive.
 const period=c.cpu?[110,40,24][K.cpu]:24;
 // Seeded personal reactions vary matches instead of giving every red/blue pair the same head start.
 const phase=K.mode===1?Math.floor(hash(i+911)*period):i*11;
 act=act&&(K.tick+phase)%period<2;
 up=up||!friend&&((K.mode===2&&(K.tick+i*17)%180<2)||(K.mode===0&&zone===3&&(K.tick-zt)%210>125&&(K.tick-zt)%210<145));
 if(K.mode===2&&nuts.some(n=>n[2]<=K.tick&&n[1]<130&&Math.abs(n[0]-c.x)<15)&&c.coyote&&!c.jump)up=true;
 if(c.y<145&&!friend){if(c.route==null){const p=plats().find(p=>c.x>=p[0]-4&&c.x<=p[1]+4);if(p)c.route=Math.abs(c.x-p[0])<Math.abs(c.x-p[1])?p[0]-14:p[1]+14}if(c.route!=null)target=c.route}else c.route=null;
 return{left:target<c.x-5,right:target>c.x+5,up,fire:up,alt:act};}
const pack=c=>[r(c.x),r(c.y),r(c.vx*10),r(c.vy*10),c.face,c.hp,c.score,c.rescues,c.ghost,c.stun,c.inv,c.held,c.carried,c.cage,c.revive,c.pose,c.cpu?1:0,c.warp,c.duck?1:0];
function snap(){return{pp:people.map(pack),qq:crates.map(q=>[r(q.x),r(q.y),r(q.vx*10),r(q.vy*10),q.held,q.fly,q.by,q.apple,q.wait]),ee:enemies.map(e=>[r(e.x),e.hp,e.type]),nn:K.mode===2?nuts.map(n=>[n[0],n[1],Math.max(0,n[2]-K.tick)].map(v=>r(v).toString(36).padStart(2,'0')).join('')).join(''):'',zz:zone,zt,th:theme,bh:bossHP,bm:bossMax,pt:points}}
function apply(g){zone=g.zz;zt=g.zt;theme=g.th;bossHP=g.bh;bossMax=g.bm;points=g.pt;crates=g.qq.map(a=>({x:a[0],y:a[1],vx:a[2]/10,vy:a[3]/10,held:a[4],fly:a[5],by:a[6],apple:a[7],wait:a[8]}));enemies=g.ee.map(a=>({x:a[0],y:154,hp:a[1],type:a[2]}));nuts=(g.nn.match(/.{6}/g)||[]).map(a=>[parseInt(a.slice(0,2),36),parseInt(a.slice(2,4),36),K.tick+parseInt(a.slice(4,6),36)]);
 g.pp.forEach((a,i)=>{const c=people[i];if(!c)return;const forced=a[17]!==c.warp;if(mine(c)&&a[9]>c.stun)sound('bonk',i);if(!mine(c)||forced||a[8]||a[12]>=0||a[13]){c.x=a[0];c.y=a[1];c.vx=a[2]/10;c.vy=a[3]/10;c.face=a[4];c.pose=a[15]}[c.hp,c.score,c.rescues,c.ghost,c.stun,c.inv,c.held,c.carried,c.cage,c.revive]=a.slice(5,15);c.cpu=!!a[16];c.warp=a[17];if(!mine(c))c.duck=!!a[18];c.cam+=(c.x-c.cam)*.4})}
function upload(i){const c=people[i];return{a:[r(c.x),r(c.y),c.vx,c.vy,c.face,c.seq,c.action,c.duck?1:0,c.warp]}}
function onFx(k,a){if(k==='event'){event=a[0];eventT=K.tick;sound(event.includes('REVIVED')?'revive':event.includes('CRACKED')?'boss':'bonk')}}
function blit(g,n,x,y,col=P.Y,flip=false,scale=1){const s=X.recolor(ART[n],col);g.save();g.translate(r(x),r(y));if(flip)g.scale(-1,1);g.drawImage(s,-(s.width>>1)*scale,-s.height*scale,s.width*scale,s.height*scale);g.restore()}
function view(g,c,vx,vy,w,h){g.save();g.beginPath();g.rect(vx,vy,w,h);g.clip();const cam=clamp(c.cam-w*.4,0,LEN-w),sy=vy+h-163,sx=x=>vx+x-cam,txt=(s,x,y,col=P.W,align='left')=>X.text(g,s,r(x),r(y),{col,align});
 g.fillStyle=['#5ca0a0','#503d56','#28364e'][theme];g.fillRect(vx,vy,w,h);
 // Oversized real objects, parallax silhouettes, and brick/wood/steel surfaces establish scale.
 for(let j=0;j<12;j++){const x=r(vx+j*100-cam*.3);if(theme===0){blit(g,'tree',x+15,sy+154,P.L,false,4);blit(g,'bench',x+70,sy+154,P.N,false,2)}else if(theme===1){g.fillStyle='#8d6972';g.fillRect(x,sy+36,84,82);g.fillStyle='#b29190';g.fillRect(x+3,sy+39,78,3);blit(g,'fork',x+35,sy+137,P.G,false,5)}else{g.fillStyle='#1b263c';g.fillRect(x,sy+35,75,119);g.fillStyle='#416179';for(let y=45;y<120;y+=19)g.fillRect(x+8,sy+y,55,7)}}
 for(const[a,b,y]of plats()){const x=sx(a);g.fillStyle=P.k;g.fillRect(r(x),sy+y,b-a,7);g.fillStyle=[P.L,P.T,P.G][theme];g.fillRect(r(x),sy+y,b-a,3);for(let t=a;t<b;t+=15){g.fillStyle=[P.e,P.N,P.g][theme];g.fillRect(r(sx(t)),sy+y+4,1,3)}}
 g.fillStyle=[P.m,'#653d41',P.K][theme];g.fillRect(vx,sy+154,w,25);g.fillStyle=[P.L,P.T,P.G][theme];g.fillRect(vx,sy+154,w,3);for(let x=Math.floor(cam/16)*16;x<cam+w;x+=16){g.fillStyle=[P.n,P.S,P.g][theme];g.fillRect(r(sx(x)),sy+162,13,1);g.fillRect(r(sx(x))+7,sy+169,1,6)}
 if(theme===0)for(let j=0;j<20;j++)blit(g,'flower',sx(20+j*51),sy+154,P.R);if(theme===2)for(let j=0;j<6;j++)blit(g,'gear',sx(60+j*180),sy+95,P.G,false,3);
 for(let j=0;j<4;j++)blit(g,theme===1?'book':theme===2?'fork':'acorn',sx(180+j*230),sy+154,[P.R,P.B,P.Y,P.L][j],false,theme===0?2:3);
 if(K.mode===1)for(const [x,col]of [[40,P.R],[920,P.B]]){g.fillStyle=P.k;g.fillRect(r(sx(x-22)),sy+112,44,42);g.fillStyle=col;for(let j=-20;j<=20;j+=8)g.fillRect(r(sx(x+j)),sy+114,2,38);g.fillRect(r(sx(x-22)),sy+111,44,3)}
 if(K.mode===2)for(const n of nuts)if(n[2]<=K.tick)blit(g,'acorn',sx(n[0]),sy+n[1]+Math.round(Math.sin(K.tick/15+n[0])*2));
 for(const e of enemies)if(e.hp)blit(g,['bug','mouse','dog'][e.type],sx(e.x),sy+e.y,P.G,K.tick%40<20);
 if(zone===3&&K.mode===0&&bossHP>0){const warning=(K.tick-zt)%210>110;blit(g,theme===1?'dog':'cat',sx(855),sy+154,P.G,false,3);if(warning){g.fillStyle=P.R;g.fillRect(r(sx(690)),sy+152,240,2)}txt('VOLLEY '+Math.min(3,Math.max(1,Math.ceil(people.length/8))),sx(855),sy+100,P.Y,'center');}
 const labels=[];const visible=people.filter(o=>Math.abs(o.x-c.cam)<w+50).sort((a,b)=>(a===c?1:b===c?-1:a.y-b.y));
 for(const o of visible){const x=sx(o.x),y=sy+o.y;if(o.inv&&K.tick%8<3&&!o.ghost)continue;const pose=o.ghost?'ghost':o.stun?'stunned':o.duck?'hide':o.pose?'throw':o.held!==-1?'carry':Math.abs(o.vy)>.5?'jump':Math.abs(o.vx)>.3?((Math.floor(K.tick/6)%2)?'run':'run2'):'idle';
 blit(g,pose,x,y+1-(o.ghost?Math.round(Math.sin(K.tick/15)*2):0),o.col,o.face<0);if(!o.cpu&&o!==c&&Math.abs(o.x-c.x)>22){const name=o.name.slice(0,7),hw=name.length*3,ly=o.y-25;const blocked=people.some(a=>a!==o&&Math.abs(a.x-o.x)<hw+8&&a.y>=ly&&a.y-14<=ly+7)||labels.some(a=>Math.abs(a[0]-o.x)<hw+a[2]+3&&Math.abs(a[1]-ly)<9);if(!blocked){txt(name,x,y-25,P.W,'center');labels.push([o.x,ly,hw])}}if(o===c){g.fillStyle=P.W;g.fillRect(r(x)-2,r(y)-21,5,2);g.fillRect(r(x)-1,r(y)-19,3,1)}if(o.ghost){g.fillStyle=P.C;g.fillRect(r(x)-7,r(y)+2,r(o.revive/120*14),2)}}
 for(const q of crates)if(!q.wait)blit(g,q.apple?'apple':'crate',sx(q.x),sy+q.y,P.Y);
 for(const e of effects){g.fillStyle=e[5];g.fillRect(r(sx(e[0])),r(sy+e[1]),2,2)}
 g.fillStyle=P.k;g.fillRect(vx,vy,w,34);txt(c.ghost?'GHOST - WAIT FOR RESCUE':'HP '+('♥'.repeat(c.hp))+'  '+(K.mode===2?'NUTS ':'PTS ')+c.score,vx+4,vy+14,c.ghost?P.C:P.Y);
 txt(Math.max(0,Math.ceil(((K.mode===0?10980:9180)-K.tick)/60))+'S',vx+w-4,vy+14,P.W,'right');
 if(K.mode===0){txt((zone===3?'GUARDIAN '+bossHP+'/'+bossMax:['PARK','KITCHEN','FACTORY'][theme]+' '+(zone+1)+'/3')+' DOWN '+people.filter(o=>o.ghost).length,vx+4,vy+25,P.C);g.fillStyle=P.g;g.fillRect(vx+w-64,vy+27,60,3);g.fillStyle=P.L;g.fillRect(vx+w-64,vy+27,r(60*(zone===3?1-bossHP/bossMax:Math.min(1,(K.tick-zt)/2400))),3)}
 else txt(K.mode===1?'RED '+points[0]+' - '+points[1]+' BLUE':'ACORN HUNT - MOST NUTS WINS',vx+4,vy+25,P.C);
 if(K.mode===0)people.forEach((o,j)=>{g.fillStyle=o.ghost?P.C:o.col;g.fillRect(vx+5+j*5,vy+33,3,o.ghost?1:2)});
 if(K.tick<600&&!K.demo){g.fillStyle=P.k;g.fillRect(vx+6,vy+39,w-12,24);txt(K.tick<CD?'CHIP & CHUM - '+['RESCUE RUN','CRATE WAR','ACORN HUNT'][K.mode]:'E LIFT / THROW  W/SPACE JUMP',vx+w/2,vy+41,P.Y,'center');txt(K.mode===0?'CLEAR 3 ZONES + BOSS. REVIVE GHOSTS':K.mode===1?'CARRY STUNNED RIVALS TO YOUR CAGE':'COLLECT NUTS. CRATES KNOCK THEM LOOSE',vx+w/2,vy+51,P.W,'center')}
 else if(K.tick-eventT<180){g.fillStyle=P.k;g.fillRect(vx,vy+h-16,w,12);txt(event,vx+w/2,vy+h-14,P.Y,'center')}
 if(c.held!==-1&&K.tick>=600)txt(c.duck?'SHIELDED':'E THROW / W+E FRIEND / UP',vx+w/2,vy+38,P.Y,'center');if(K.demo)txt('CHIP & CHUM',vx+w/2,vy+38,P.Y,'center');g.restore()}
function render(ctx,W,H){const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,W,H);if(people.length){let fs=K.demo?[0]:K.focus();if(!fs.length)fs=[0];fs=fs.slice(0,4);const w=SCR.w,h=SCR.h-(K.demo?0:9);const rect=fs.length===1?[[0,0,w,h]]:fs.length===2?[[0,0,w,h>>1],[0,h>>1,w,h-(h>>1)]]:[[0,0,w>>1,h>>1],[w>>1,0,w-(w>>1),h>>1],[0,h>>1,w>>1,h-(h>>1)],[w>>1,h>>1,w-(w>>1),h-(h>>1)]];fs.forEach((i,j)=>view(g,people[i],...rect[j]))}SCR.present(ctx,W,H)}
for(const [name,notes]of [['lift',[330,440]],['throw',[700,350]],['bonk',[130,70]],['jump',[220,440]],['pick',[880,1100]],['revive',[523,659,784,1046]],['boss',[100,200,80]]])RA.audio.add('chip-'+name,(ac,t,g)=>{g.gain.value=.09;notes.forEach((f,j)=>{const o=ac.createOscillator(),v=ac.createGain();o.type='square';o.frequency.value=f;v.gain.setValueAtTime(.5,t+j*.05);v.gain.exponentialRampToValueAtTime(.001,t+j*.05+.09);o.connect(v);v.connect(g);o.start(t+j*.05);o.stop(t+j*.05+.1)})});
const T=RA.music.track;
K=RA.kit({id:'chip-n-dale',name:'CHIP & CHUM',kind:'Co-op platformer',baseH:180,demo:6,localFirst:true,
 desc:'Carry crates, throw friends and rescue your crew through a giant household.',blurb:'Tiny heroes, giant rooms. E lifts and throws shared crates. Rescue Run: clear 3 zones then crack the guardian with simultaneous throws. Stand on a ghost for 2 seconds to revive.',
 howto:'A/D move; W/Space jump; E lift/throw; W+E lift a friend / throw up; S shields under a crate. Gamepad A jump, B lift. Touch: JUMP + LIFT. Crate War: carry stunned rivals to your coloured cage. Acorn Hunt: most nuts wins.',fireLabel:'JUMP',
 kb:[['A D','move'],['W SPACE','jump'],['E','lift / throw'],['W E','throw up'],['S','shield']],pad:[['LS','move'],['A','jump'],['B','lift / throw']],
 icon:['.n......n.','nnn....nnn','.nnnnnnnn.','.nwkwwkwn.','.nwwwwwwn.','..nnkknn..','..rrrrrr..','.orrrrrro.','..nnnnnn..','.kk....kk.'],
 music:[T('Pocket Park Patrol',144,['C','Am','F','G'],'k.hsk.hsk.hsk.hs','c5 e5 g5 a5 g5 e5 d5 g5 f5 a5 c6 a5 g5 e5 d5 c5'),T('Kitchen Capers',156,['Dm','G','C','A'],'ksh.k.hsksh.k.hs','d5 f5 a5 f5 g5 b5 d6 b5 c6 g5 e5 g5 a5 e5 c#5 e5'),T('Clockwork Whiskers',162,['Em','C','Am','B'],'k.hsksh.k.hsksh.','e5 g5 b5 e6 d6 b5 g5 e5 c6 g5 e5 c5 a4 c5 b4 d#5')],
 modes:[['RESCUE RUN','Co-op: 3 short zones + guardian. Revive ghosts; combine boss throws.'],['CRATE WAR','Red vs blue: stun rivals, carry them to your cage. 150 seconds.'],['ACORN HUNT','Collect nuts. Crate hits knock nuts loose. Most nuts after 150 seconds wins.']],
 settings:[['zones','Zones',[['rnd','Random'],[0,'Park'],[1,'Kitchen'],[2,'Factory']]],['friendly','Friendly throws',[['on','On'],['off','Off']]],['enemies','Enemy amount',[['few','Few'],['normal','Normal'],['many','Many']],'normal']],
 start,step,local,upload,snap,apply,onFx,bot,render,teamOf:team,
 ranks:()=>order().map(c=>[c.name,c.col,(K.mode===1?points[team(c.i)]+' captures - ':'')+c.score+' pts / '+c.rescues+' rescues']),
 result:(i,w)=>({won:!!w&&(w.coop||w.i===i||w.team===team(i)),bestScore:people[i].score,kills:people[i].hits,rescues:people[i].rescues}),
 ach:[{id:'first',name:'Pocket Pal',desc:'Complete a match',test:s=>s.played>=1,unlock:'title:Pocket Pal'},{id:'win',name:'Crate Captain',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Crate Captain'},{id:'rescue',name:'Helping Paw',desc:'Revive or free a friend',test:(s,m)=>m.rescues>0,unlock:'title:Helping Paw'}]});
const lift=document.createElement('button');lift.className='a';lift.dataset.k='alt';lift.textContent='LIFT';K.root.querySelector('.ab').appendChild(lift);lift.addEventListener('pointerdown',e=>{RA.input.touchK.alt=true;lift.setPointerCapture(e.pointerId);e.preventDefault()});for(const ev of ['pointerup','pointercancel','lostpointercapture'])lift.addEventListener(ev,()=>RA.input.touchK.alt=false);
// Kit touchIn exposes fire only; fold the dedicated action into the seat's input without engine changes.
const inp=K.inp;K.inp=i=>{const k=inp(i);if((K.seats[i]?.ctrl==='touch'||K.seats[i]?.ctrl==='me')&&RA.input.touchK.alt)k.alt=true;return k};
window.__chip={K,bot,get people(){return people},get crates(){return crates},get enemies(){return enemies},get nuts(){return nuts},get zone(){return zone},get bossHP(){return bossHP},get restarts(){return restarts},hit,revive,action,resetZone,move,plats};
})();
