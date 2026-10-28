/* Original: the colour sequel replaces full lines with triples and fixed FLASH targets.
   20-player twist: independent wells, chain junk, three scored races or red/blue teamwork.
   First 10 seconds: match three symbols, aim at blinking targets; A/D, E/Space turn, W drop.
   Why fun: build a match underneath another colour, then watch falling cells chain together.
   Hand-painted cell art: tools/art/tet2/art.js. No smooth canvas effects. */
(()=>{
const X=RA.pix,SCR=X.screen(),W=8,H=16,ENC='0123456789abcdef',COL=['#10172c','#ff687c','#56c9ff','#ffe06a','#8be697','#8993ad'];
const ART={square:['kkkkkkk','k12222k','k2kkk2k','k2k2k2k','k2kkk2k','k33333k','kkkkkkk'],cross:['kkkkkkk','k12222k','k22k22k','k2kkk2k','k22k22k','k33333k','kkkkkkk'],bars:['kkkkkkk','k12222k','k2k2k2k','k2k2k2k','k2k2k2k','k33333k','kkkkkkk'],diamond:['kkkkkkk','k12222k','k22k22k','k2k2k2k','k22k22k','k33333k','kkkkkkk'],junk:['kkkkkkk','kgggggk','kgKgKgk','kggKggk','kgKgKgk','kGGGGGk','kkkkkkk']};
const sprites=[null,...['square','cross','bars','diamond'].map((s,i)=>X.recolor(ART[s],COL[i+1])),X.sprite(ART.junk)];
const SH=[[[0,0]],[[0,0],[1,0]],[[0,0],[1,0],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[1,0],[1,1],[2,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[0,1],[0,2],[1,2]]];
let K,boards=[],round=1,roundAt=0,pause=0,rotN=0;
const mine=i=>!K.isClient()?K.seats[i].ctrl!=='net':i===K.myIdx;
const color=n=>n>5?n-5:n,flash=n=>n>=6;
function shape(p){let a=SH[p.s].map(([x,y],i)=>[x,y,p.c[i]]);for(let r=0;r<p.r;r++)a=a.map(([x,y,c])=>[-y,x,c]);const mx=Math.min(...a.map(a=>a[0])),my=Math.min(...a.map(a=>a[1]));return a.map(([x,y,c])=>[x-mx+p.x,y-my+p.y,c])}
function hit(b,p){return shape(p).some(([x,y])=>x<0||x>=W||y>=H||(y>=0&&b.well[y*W+x]))}
function piece(b){const s=Math.floor(b.rr()*SH.length);return{s,c:SH[s].map(()=>1+Math.floor(b.rr()*4)),r:0,x:3,y:0}}
function spawn(b){b.cur=b.next;b.next=piece(b);b.serial++;b.grav=0;b.lock=0;if(hit(b,b.cur)){b.out=true;b.outAt=K.tick;b.cur=null}}
function layout(){const rr=RA.util.mulberry(K.seed+round*991),a=Array(W*H).fill(0),height=Math.min(11,2+(+K.S.level));for(let x=0;x<W;x++){const y=H-1-Math.floor(rr()*height);a[y*W+x]=6+Math.floor(rr()*4)}return a}
function reset(b,a){b.well=a.slice();b.out=!!b.left;b.outAt=b.out?K.tick:0;b.done=0;b.st='fall';b.timer=0;b.chain=0;b.pend=0;b.cur=null;b.prev={};b.serial=0;b.plSerial=-1;b.dir=0;b.das=0;b.grav=0;b.lock=0;b.cleared=0;b.next=piece(b);b.inSeen=b.attack;b.next.x=3;spawn(b)}
function start(seats){round=1;roundAt=0;pause=0;rotN=0;boards=seats.map((s,i)=>({i,name:s.name,col:s.col,cpu:s.ctrl==='cpu',rr:RA.util.mulberry(K.seed+37+i*177),points:0,total:0,score:0,maxChain:0,attack:0,seen:0,received:0,ack:0,left:false,pops:[]}));const a=layout();boards.forEach(b=>reset(b,a))}
function matches(a){const found=new Set();for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=color(a[y*W+x]);if(!c||c===5)continue;for(const[dx,dy]of[[1,0],[0,1]]){let n=1;while(x+dx*n<W&&y+dy*n<H&&color(a[(y+dy*n)*W+x+dx*n])===c)n++;if(n>=3)for(let j=0;j<n;j++)found.add((y+dy*j)*W+x+dx*j)}}return found}
function fall(a){let moved=false;for(let y=H-2;y>=0;y--)for(let x=0;x<W;x++){const i=y*W+x;if(a[i]&&!flash(a[i])&&!a[i+W]){a[i+W]=a[i];a[i]=0;moved=true}}return moved}
const left=b=>b.well.filter(flash).length;
function sound(b,n){if(!b.cpu&&mine(b.i)&&!K.demo)RA.audio.sfx(n)}
function resolve(b){const set=matches(b.well);if(set.size){const junk=new Set();for(const i of set)for(const dx of[-1,1])if(i%W+dx>=0&&i%W+dx<W&&b.well[i+dx]===5)junk.add(i+dx);
 const f=[...set].filter(i=>flash(b.well[i])).length;b.cleared+=f;b.total+=f;b.chain++;b.maxChain=Math.max(b.maxChain,b.chain);b.score+=set.size*30*b.chain+f*150;b.attack+=K.S.junk==='on'?Math.min(6,f+Math.max(0,b.chain-1)):0;
 b.pops=[...set,...junk];b.st='pop';b.timer=15;sound(b,'pick');return}
 if(!left(b)){if(K.mode===1||K.mode===2){b.score+=1000;const a=layout();b.well=a;b.st='fall';spawn(b);return}b.done=K.tick||1;b.cur=null;return}
 if(b.pend){let n=Math.min(6,b.pend);b.pend-=n;const xs=Array.from({length:W},(_,i)=>i).sort(()=>b.rr()-.5);for(let j=0;j<n;j++){const x=xs[j];if(b.well[x]){b.out=true;b.outAt=K.tick;return}b.well[x]=5}b.st='settle';return}
 b.chain=0;b.st='fall';spawn(b)}
function move(b,dx,dy,dr){const p={...b.cur,x:b.cur.x+dx,y:b.cur.y+dy,r:(b.cur.r+dr+4)%4};for(const kick of dr?[0,-1,1,-2,2]:[0]){const q={...p,x:p.x+kick};if(!hit(b,q)){b.cur=q;return true}}return false}
function play(b,k){if(b.out||b.done||pause||K.tick-roundAt<150)return;
 if(b.st==='pop'){if(--b.timer<=0){for(const i of b.pops)b.well[i]=0;b.pops=[];b.st='settle'}return}
 if(b.st==='settle'){if(K.tick%4===0&&!fall(b.well))resolve(b);return}
 const edge=n=>k[n]&&!b.prev[n];if(edge('fire')||edge('alt')){move(b,0,0,1);sound(b,'sel')}if(edge('b3'))move(b,0,0,-1);
 const d=(k.right?1:0)-(k.left?1:0);if(d!==b.dir){b.dir=d;b.das=0;if(d)move(b,d,0,0)}else if(d&&++b.das>10&&b.das%4===0)move(b,d,0,0);
 if(edge('up')){while(move(b,0,1,0));lock(b)}else{const speed=Math.max(2,[48,34,22][+K.S.speed]-Math.floor((K.tick-roundAt)/900)*(K.mode===1?3:1));if(++b.grav>=(k.down?2:speed)){b.grav=0;move(b,0,1,0)}if(hit(b,{...b.cur,y:b.cur.y+1})){if(++b.lock>=24)lock(b)}else b.lock=0}b.prev={...k}}
function lock(b){for(const[x,y,c]of shape(b.cur))if(y>=0)b.well[y*W+x]=c;b.cur=null;b.st='settle';b.chain=0;sound(b,'shot')}
function roundOrder(){return boards.slice().sort((a,b)=>(a.out-b.out)||(K.mode===1&&a.out&&b.out?b.outAt-a.outAt:0)||(a.done&&b.done?a.done-b.done:a.done?-1:b.done?1:0)||left(a)-left(b)||b.total-a.total||b.score-a.score||b.outAt-a.outAt)}
function order(){return roundOrder().sort((a,b)=>b.points-a.points)}
function finishRound(){const o=roundOrder();o.forEach((b,j)=>b.points+=boards.length-j);if(round===3){const win=order()[0];K.end({i:win.i});return}pause=120}
function teamProgress(t){return boards.filter(b=>b.i%2===t).reduce((s,b)=>s+b.cleared,0)}
function hostStep(){if(K.state!=='play')return;if(pause){if(!--pause){round++;roundAt=K.tick;const a=layout();boards.forEach(b=>reset(b,a))}return}
 for(const b of boards){const s=K.seats[b.i];if(s.ctrl==='net'){if(!K.R.peer(s.peer)){b.left=true;b.out=true;b.outAt=K.tick;continue}if(!b.left){const d=K.remote(b.i);if(d&&d[0]===round)read(b,d)}}else play(b,K.inp(b.i));
 const delta=Math.max(0,b.attack-b.seen);b.seen=b.attack;if(delta&&K.S.junk==='on'){const targets=boards.filter(t=>t!==b&&!t.out&&!t.done&&(K.mode!==2||t.i%2!==b.i%2));if(targets.length){const t=targets[Math.floor(b.rr()*targets.length)];t.received+=Math.min(6,delta)}}
 if(mine(b.i)){b.pend+=Math.max(0,b.received-b.ack);b.ack=b.received}}
 const live=boards.filter(b=>!b.out),time=K.tick-roundAt;
 if(K.mode===0){if(boards.every(b=>b.done||b.out)||time>=3300)finishRound()}
 else if(K.mode===1){if((boards.length>1&&live.length<=1)||!live.length||time>=10800){const o=order().filter(b=>!b.out);K.end({i:(o[0]||order()[0]).i})}}
 else {const t0=boards.filter(b=>b.i%2===0),t1=boards.filter(b=>b.i%2===1),done=t=>t.length&&t.reduce((s,b)=>s+b.cleared,0)>=t.length*8;const redLive=t0.some(b=>!b.out),blueLive=t1.some(b=>!b.out);if(done(t0)||done(t1)||(!redLive&&t0.length)||(!blueLive&&t1.length)||time>=10800){const rate=t=>{const list=boards.filter(b=>b.i%2===t);return list.length?list.reduce((s,b)=>s+b.cleared,0)/list.length:0};const a=rate(0),b=rate(1),winner=!redLive&&blueLive?1:!blueLive&&redLive?0:a===b?-1:a>b?0:1;K.end(winner<0?null:{team:winner,name:winner===0?'Red team':'Blue team'})}}
}
// Cumulative counters make junk delivery and uploads idempotent. Two rotating full wells keep 20 seats below 3KB.
function pack(b,full=true){return[round,full?b.well.map(n=>ENC[n]).join(''):'',b.cur?[b.cur.s,b.cur.r,b.cur.x,b.cur.y,b.cur.c.join('')]:0,b.next?[b.next.s,b.next.c.join('')]:0,b.out?1:0,b.done,b.cleared,b.total,b.score,b.points,b.chain,b.attack,b.received,b.ack,b.cpu?1:0]}
function read(b,d){if(d[1]&&d[1].length===W*H)b.well=[...d[1]].map(c=>ENC.indexOf(c));b.cur=d[2]?{s:d[2][0],r:d[2][1],x:d[2][2],y:d[2][3],c:[...d[2][4]].map(Number)}:null;b.next=d[3]?{s:d[3][0],c:[...d[3][1]].map(Number),x:3,y:0,r:0}:null;if(!b.out&&d[4])b.outAt=K.tick;b.out=!!d[4];b.done=d[5];b.cleared=d[6];b.total=d[7];b.score=d[8];b.points=d[9];b.chain=d[10];b.attack=d[11];b.cpu=!!d[14]}
function snap(){const first=rotN;rotN=(rotN+2)%boards.length;return{br:round,bt:roundAt,bp:pause,bb:K.state==='over'?[]:boards.map((b,i)=>pack(b,(i-first+boards.length)%boards.length<2))}}
function apply(g){if(g.br!==round){round=g.br;const a=layout();boards.forEach(b=>reset(b,a))}roundAt=g.bt;pause=g.bp;g.bb.forEach((d,i)=>{const b=boards[i];if(i===K.myIdx){b.points=d[9];b.received=d[12];b.pend+=Math.max(0,b.received-b.ack);b.ack=b.received;return}read(b,d)})}
function plan(b){let best=null;for(let r=0;r<4;r++)for(let x=0;x<W;x++){let p={...b.cur,x,y:0,r};if(hit(b,p))continue;while(!hit(b,{...p,y:p.y+1}))p.y++;const a=b.well.slice();for(const[x,y,c]of shape(p))a[y*W+x]=c;
 let value=0,chain=0;for(let q=0;q<12;q++){const m=matches(a);if(!m.size)break;chain++;for(const i of m){value+=flash(a[i])?40:5;a[i]=0}for(let j=0;j<H&&fall(a);j++);}
 let heights=0,holes=0;for(let cx=0;cx<W;cx++){let top=false;for(let y=0;y<H;y++){if(a[y*W+cx]){top=true;heights+=H-y}else if(top)holes++}}
 for(const[px,py,c]of shape(p)){const n=a[(py+1)*W+px];if(n&&color(n)===c)value+=3;for(const dx of[-1,1])if(px+dx>=0&&px+dx<W&&color(a[py*W+px+dx])===c)value+=2}
 value+=chain*8+p.y*.5-heights*.38-holes*.7+b.rr()*(K.cpu===0?12:K.cpu===1?2:.1);if(!best||value>best.value)best={value,x,r}}return best}
function bot(i){const b=boards[i];if(!b||b.out||b.done||!b.cur||b.st!=='fall')return{};if(b.plSerial!==b.serial){b.plSerial=b.serial;b.pl=plan(b);b.wait=[240+Math.floor(b.rr()*160),28,8][K.cpu]}if(--b.wait>0||!b.pl)return{};if(K.tick%4)return{};if(b.cur.r!==b.pl.r)return{fire:true};if(b.cur.x<b.pl.x)return{right:true};if(b.cur.x>b.pl.x)return{left:true};return{up:true}}
function cell(g,n,x,y,size){if(!n)return;const c=color(n);g.drawImage(sprites[c],x,y,size,size);if(flash(n)&&((K.tick>>4)&1)){g.fillStyle='#fff';g.fillRect(x,y,size,1);g.fillRect(x,y,1,size)}}
const text=(g,s,x,y,c='#dae6ff')=>X.text(g,String(s),x,y,{col:c});
function well(g,b,x,y,size,main){g.fillStyle=b.out?'#482b40':K.mode===2?(b.i%2?'#427ac9':'#c95167'):b.col;g.fillRect(x-1,y-1,W*size+2,H*size+2);g.fillStyle='#0b1022';g.fillRect(x,y,W*size,H*size);for(let i=0;i<W*H;i++){if(b.st==='pop'&&b.pops.includes(i)&&((K.tick>>1)&1))continue;cell(g,b.well[i],x+i%W*size,y+Math.floor(i/W)*size,size)}
 if(b.cur&&!b.out&&!b.done){if(main){let p={...b.cur};while(!hit(b,{...p,y:p.y+1}))p.y++;g.globalAlpha=.24;for(const[cx,cy,c]of shape(p))if(cy>=0)cell(g,c,x+cx*size,y+cy*size,size);g.globalAlpha=1}for(const[cx,cy,c]of shape(b.cur))if(cy>=0)cell(g,c,x+cx*size,y+cy*size,size)}
 if(main)text(g,(b.out?'X':b.done?'OK':left(b))+'',x,y+H*size+3,b.out?'#ff687c':'#fff');if(main){text(g,b.name.slice(0,9).toUpperCase(),x,y-10,b.col);const hx=x+W*size+6;text(g,'NEXT',hx,y);if(b.next)for(const[cx,cy,c]of shape({...b.next,x:0,y:0,r:0}))cell(g,c,hx+cx*7,y+12+cy*7,7);text(g,'FLASH',hx,y+40);text(g,left(b),hx,y+50);text(g,'CHAIN '+b.chain,hx,y+64);text(g,'JUNK '+b.pend,hx,y+78,'#ff687c');text(g,'PTS '+b.points,hx,y+92);if(b.done)text(g,'CLEAR!',hx,y+108,'#ffe06a');g.fillStyle='#ff687c';g.fillRect(x-5,y+H*size-Math.min(H*size,b.pend*4),2,Math.min(H*size,b.pend*4))}}
function render(ctx,vw,vh){const g=SCR.size(vw,vh),ww=SCR.w||Math.round(vw/3),hh=SCR.h||180;g.fillStyle='#121a32';g.fillRect(0,0,ww,hh);for(let y=16;y<hh-9;y+=8){g.fillStyle=y%16?'#17213c':'#1a2642';g.fillRect(0,y,ww,1)}if(!boards.length){SCR.present(ctx,vw,vh);return}
 text(g,['FLASH RACE  ROUND '+round+'/3','JUNK BATTLE','TEAM FLASH'][K.mode],38,4,'#ffe06a');text(g,Math.max(0,Math.ceil(((K.mode===0?3300:10800)-(K.tick-roundAt))/60))+'S',ww-30,4);
 const focus=K.demo?[]:K.focus(),mains=focus.slice(0,2),mainW=mains.length>1?109:139;let startX=8;
 mains.forEach((i,j)=>well(g,boards[i],startX+j*mainW,29,7,true));const rest=boards.filter(b=>!mains.includes(b.i)),rx=mains.length?startX+mains.length*mainW:8,avail=ww-rx-6;
 if(rest.length){let best={size:0};for(let cols=1;cols<=rest.length;cols++){const rows=Math.ceil(rest.length/cols),size=Math.floor(Math.min((avail/cols-6)/W,(140/rows-12)/H));if(size>best.size)best={size,cols,rows}}const size=Math.max(1,best.size);rest.forEach((b,j)=>{const x=rx+(j%best.cols)*(W*size+6),y=29+Math.floor(j/best.cols)*(H*size+12);text(g,(order().indexOf(b)+1)+'',x,y-9,b.col);well(g,b,x,y,size,false)})}
 if(K.tick-roundAt<150||pause){g.fillStyle='#091023';g.fillRect(30,67,ww-60,41);text(g,pause?'ROUND COMPLETE':'MATCH 3 IDENTICAL SYMBOLS',40,73,'#ffe06a');text(g,pause?'NEXT WELL IN '+Math.ceil(pause/60):'CLEAR ALL BLINKING FLASH BLOCKS',40,85);text(g,'A/D MOVE  SPACE TURN  W DROP',40,97)}
 else text(g,K.mode===2?'RED '+teamProgress(0)+'/'+(boards.filter(b=>b.i%2===0).length*8)+'  BLUE '+teamProgress(1)+'/'+(boards.filter(b=>b.i%2===1).length*8):'MATCH 3  >  FLASH  >  CHAIN JUNK',8,hh-17,'#9aadd0');SCR.present(ctx,vw,vh)}
const T=RA.music.track;
K=RA.kit({id:'tetris-2',prefix:'te2',name:'TETRONIX 2',baseH:180,kind:'Colour chain puzzle',players:'1-20 players',demo:6,localFirst:true,
 desc:'Match three marked colours, clear blinking FLASH targets and chain loose blocks into junk attacks across 20 wells.',blurb:'Match 3 of a colour in a row or column. Clear every blinking FLASH block. Loose cells fall and chain!',howto:'A/D move; S soft drop; W hard drop; E or Space rotate; Q reverse. Touch: arrows move/drop, TURN rotates. Pad: D-pad, Up drop, A/B turn, X reverse.',fireLabel:'TURN',
 icon:['..........','..rr..bb..','..rr..bb..','..........','.yy..gg...','.yy..gg...','..........','..wwwww...','..w...w...','..wwwww...'],
 music:[T('Flash Foundry',132,['Am','F','Dm','E'],'k.h.s.h.','a4 c5 e5 b4 a4 . g4 e4 f4 a4 c5 e5 d5 c5 b4 .'),T('Prism Relay',148,['C','Am','F','G'],'k.hhs.h.','c5 e5 g5 e5 a5 g5 e5 c5 f5 a5 g5 e5 d5 g4 b4 d5'),T('Junk Reactor',164,['Dm','Bb','Gm','A'],'k.hhshh.','d5 a4 f5 e5 d5 . a5 g5 f5 d5 bb4 d5 e5 a4 c#5 e5')],
 modes:[['FLASH RACE','Three rounds; points by place. Same FLASH layout for everyone.'],['JUNK BATTLE','Top out and you are out. Last well standing; 3 minute limit.'],['TEAM FLASH','Red vs blue: 8 FLASH per teammate. Cleared wells refill so you can help the team.']],
 settings:[['speed','Speed',[[1,'Normal'],[0,'Slow'],[2,'Fast']]],['level','Level',Array.from({length:10},(_,i)=>[i+1,''+(i+1)])],['junk','Junk',[['on','On'],['off','Off']]]],
 kb:[['A D','move'],['S','soft drop'],['W','hard drop'],['E SPACE','turn'],['Q','reverse']],pad:[['DPAD','move / drop'],['A B','turn'],['X','reverse']],
 ach:[{id:'first',name:'Flash Apprentice',desc:'Finish a match',test:s=>s.played>=1},{id:'win',name:'Prism Champion',desc:'Win a match',test:(s,m)=>m.won},{id:'chain',name:'Chain Reaction',desc:'Make a three chain',test:(s,m)=>m.chain>=3}],
 start,step:hostStep,local:i=>play(boards[i],K.inp(i)),upload:i=>pack(boards[i]),snap,apply,follow:()=>{},render,bot,alive:i=>!!boards[i]&&!boards[i].out,teamOf:i=>i%2,
 ranks:()=>order().sort((a,b)=>K.winner&&K.winner.team!=null?((b.i%2===K.winner.team)-(a.i%2===K.winner.team)):K.winner&&K.winner.i===a.i?-1:K.winner&&K.winner.i===b.i?1:0).map(b=>[b.name,K.mode===2?(b.i%2?'#56a0ff':'#ff687c'):b.col,b.points+' pts / '+b.total+' FLASH / '+left(b)+' left']),
 result:(i,w)=>({won:!!w&&(w.i===i||w.team===i%2),bestScore:boards[i].score,flash:boards[i].total,chain:boards[i].maxChain})});
K.root.querySelector('#te2Info').style.display='none';
window.__te2={K,get boards(){return boards},bot,plan,matches,fall,play,resolve,shape,hit,pack,read,reset,layout,get round(){return round},get pause(){return pause},teamProgress};
})();


