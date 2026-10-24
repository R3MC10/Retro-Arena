/* RA.pix: real pixel art for Retro Arena games.
   A game draws into a low-resolution screen (RA.pix.screen) and presents it scaled up with hard pixel edges, so every
   sprite, every letter and every effect sits on the same pixel grid, like a console frame buffer.
   Sprites are drawn by hand as rows of palette letters (RA.pix.sprite). Rider / team colours use the letters 1 2 3
   (light, mid, dark) and are swapped per player with RA.pix.recolor. RA.pix.rot rotates a sprite RotSprite style
   (Scale2x three times, rotate, sample back down), so tilted sprites keep clean pixel edges.
   Text uses a 5x7 bitmap font: RA.pix.text(g, 'HELLO', x, y, {col, shadow, scale, align}). */
(()=>{
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
// the house palette: dark outline, greys, warm and cool ramps, skin, dirt, grass, water
const PAL={k:'#100c18',K:'#2c2638',g:'#5c566c',G:'#9a94a8',w:'#e8e4dc',W:'#ffffff',
 r:'#b8202c',R:'#f05050',d:'#6c1424',o:'#e06818',O:'#ffa040',y:'#f0c020',Y:'#fff07c',
 n:'#7c4a24',N:'#b07038',m:'#462818',s:'#f0b888',S:'#c07850',
 b:'#2058c0',B:'#60a0ff',u:'#142870',c:'#30c8e0',C:'#a0f0ff',v:'#6838a8',V:'#b080f0',
 l:'#38a038',L:'#88dc48',e:'#1c5c30',t:'#c49058',T:'#e8c088',D:'#8c5c34',M:'#5a3a20',p:'#f070c0',P:'#ffb0e0'};
// three shades of any colour for the 1 2 3 letters
function shades(col){const c=hex(col),f=(k,a)=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,k>0?v+(255-v)*k:v*(1+k)))).toString(16).padStart(2,'0')).join('');return{1:f(.38),2:col,3:f(-.42)}}
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c};
// rows of letters -> canvas; '.' and ' ' are see-through; extra = {letter: colour}
function sprite(rows,extra){const w=Math.max(...rows.map(r=>r.length)),h=rows.length,c=mk(w,h),g=c.getContext('2d'),P=Object.assign({},PAL,extra||{});
 for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const ch=rows[y][x];if(ch==='.'||ch===' ')continue;const col=P[ch];if(!col)continue;g.fillStyle=col;g.fillRect(x,y,1,1)}return c}
const RC=new Map();
function recolor(rows,col,extra,key){const k=(key||rows.join('|'))+col;if(RC.has(k))return RC.get(k);const s=sprite(rows,Object.assign(shades(col),extra||{}));RC.set(k,s);return s}
function flipX(c){const o=mk(c.width,c.height),g=o.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return o}
// RotSprite-style rotation about the centre (or pivot px, py)
function px32(c){return new Uint32Array(c.getContext('2d').getImageData(0,0,c.width,c.height).data.buffer)}
function scale2x(src,w,h){const o=new Uint32Array(w*h*4),W2=w*2,at=(x,y)=>src[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const P=at(x,y),A=at(x,y-1),B=at(x+1,y),C=at(x-1,y),D=at(x,y+1);let e0=P,e1=P,e2=P,e3=P;
  if(C===A&&C!==D&&A!==B)e0=A;if(A===B&&A!==C&&B!==D)e1=B;if(D===C&&D!==B&&C!==A)e2=C;if(B===D&&B!==A&&D!==C)e3=D;
  const i=(y*2)*W2+x*2;o[i]=e0;o[i+1]=e1;o[i+W2]=e2;o[i+W2+1]=e3}return o}
const ROT=new WeakMap();
function rot(c,ang,pad){ang=Math.round(ang/(Math.PI/36))*(Math.PI/36);let m=ROT.get(c);if(!m){m=new Map();ROT.set(c,m)}const key=ang.toFixed(3);if(m.has(key))return m.get(key);
 if(Math.abs(ang)<1e-6){m.set(key,c);return c}
 pad=pad==null?Math.ceil(Math.max(c.width,c.height)*.3):pad;const w=c.width,h=c.height,W=w+pad*2,H=h+pad*2;
 let big=px32(c),bw=w,bh=h;for(let k=0;k<3;k++){big=scale2x(big,bw,bh);bw*=2;bh*=2}
 const out=mk(W,H),og=out.getContext('2d'),im=og.createImageData(W,H),o32=new Uint32Array(im.data.buffer),ca=Math.cos(-ang),sa=Math.sin(-ang),cx=w/2,cy=h/2;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x+.5-pad-cx,dy=y+.5-pad-cy,sx=(dx*ca-dy*sa+cx)*8,sy=(dx*sa+dy*ca+cy)*8;
  const ix=Math.floor(sx),iy=Math.floor(sy);if(ix<0||iy<0||ix>=bw||iy>=bh)continue;o32[y*W+x]=big[iy*bw+ix]}
 og.putImageData(im,0,0);out.pad=pad;m.set(key,out);return out}
/* ---------- 5x7 bitmap font ---------- */
const GL={"A":".###.#...##...#######...##...##...#","B":"####.#...##...#####.#...##...#####.","C":".###.#...##....#....#....#...#.###.","D":"####.#...##...##...##...##...#####.","E":"######....#....####.#....#....#####","F":"######....#....####.#....#....#....","G":".###.#...##....#.####...##...#.####","H":"#...##...##...#######...##...##...#","I":".###...#....#....#....#....#...###.","J":"..###...#....#....#.#..#.#..#..##..","K":"#...##..#.#.#..##...#.#..#..#.#...#","L":"#....#....#....#....#....#....#####","M":"#...###.###.#.##.#.##...##...##...#","N":"#...###..##.#.##..###...##...##...#","O":".###.#...##...##...##...##...#.###.","P":"####.#...##...#####.#....#....#....","Q":".###.#...##...##...##.#.##..#..##.#","R":"####.#...##...#####.#.#..#..#.#...#","S":".###.#...##.....###.....##...#.###.","T":"#####..#....#....#....#....#....#..","U":"#...##...##...##...##...##...#.###.","V":"#...##...##...##...##...#.#.#...#..","W":"#...##...##...##.#.##.#.###.###...#","X":"#...##...#.#.#...#...#.#.#...##...#","Y":"#...##...#.#.#...#....#....#....#..","Z":"#####....#...#...#...#...#....#####","0":".###.#...##..###.#.###..##...#.###.","1":"..#...##....#....#....#....#...###.","2":".###.#...#....#..##..#...#....#####","3":"#####...#...#.....#.....##...#.###.","4":"...#...##..#.#.#..#.#####...#....#.","5":"######....####.....#....##...#.###.","6":"..##..#...#....####.#...##...#.###.","7":"#####....#...#...#...#....#....#...","8":".###.#...##...#.###.#...##...#.###.","9":".###.#...##...#.####....#...#..##..",".":"..........................##...##..",",":".....................##....#...#...","!":"..#....#....#....#....#.........#..","?":".###.#...#....#..##...#.........#..",":":"......##...##........##...##.......","-":"................###................","+":".......#....#..#####..#....#.......","/":"....#...#....#...#...#....#...#....","'":"..#....#...#.......................","%":"##..###.#....#...#...#....#.###..##","(":"...#...#...#....#....#.....#.....#.",")":".#.....#.....#....#....#...#...#...","<":"...#...#...#...#.....#.....#.....#.",">":".#.....#.....#.....#...#...#...#...","#":".#.#..#.#.#####.#.#.#####.#.#..#.#.","*":".....#.#.#.###.#####.###.#.#.#.....","♥":"......#.#.##########.###...#.......","▲":".......#...###.#####...............","▼":"..........#####.###...#............","x":"..........#...#.#.#...#...#.#.#...#","=":"..........#####.....#####..........","_":"..............................#####","@":".###.#...##.####.#.##.####.....###.","\"":".#.#..#.#.........................."};
const GLC=new Map();
function glyph(ch){if(GLC.has(ch))return GLC.get(ch);const s=GL[ch]||GL[ch.toUpperCase()];if(!s){GLC.set(ch,null);return null}const c=mk(5,7),g=c.getContext('2d');g.fillStyle='#fff';
 for(let i=0;i<35;i++)if(s[i]==='#')g.fillRect(i%5,(i/5)|0,1,1);GLC.set(ch,c);return c}
const TINT=new Map();
function tinted(ch,col){const k=ch+col;if(TINT.has(k))return TINT.get(k);const gl=glyph(ch);if(!gl){TINT.set(k,null);return null}const c=mk(5,7),g=c.getContext('2d');g.drawImage(gl,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,5,7);TINT.set(k,c);return c}
const tw=(s,sc)=>s.length?(String(s).length*6-1)*(sc||1):0;
// o: {col, shadow (colour or false), scale, align: 'left'|'center'|'right', outline (colour)}
function text(g,s,x,y,o){o=o||{};s=String(s).toUpperCase();const sc=o.scale||1,col=o.col||'#ffffff',w=tw(s,sc);let x0=Math.round(o.align==='center'?x-w/2:o.align==='right'?x-w:x);y=Math.round(y);
 const draw=(c,dx,dy)=>{let cx=x0+dx;for(const ch of s){const gl=ch===' '?null:tinted(ch,c);if(gl)g.drawImage(gl,cx,y+dy,5*sc,7*sc);cx+=6*sc}};
 if(o.outline){for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])draw(o.outline,dx*sc,dy*sc)}
 else if(o.shadow!==false)draw(o.shadow||'#100c18',sc,sc);draw(col,0,0);return w}
/* ---------- the low-resolution screen ---------- */
function screen(){const s={cv:mk(1,1),g:null,w:0,h:0,
 size(w,h){w=Math.max(16,Math.round(w));h=Math.max(16,Math.round(h));if(w!==s.w||h!==s.h){s.cv.width=s.w=w;s.cv.height=s.h=h;s.g=s.cv.getContext('2d');s.g.imageSmoothingEnabled=false}return s.g},
 // copy to the kit's canvas (logical W x H) with hard pixel edges
 present(ctx,W,H){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(s.cv,0,0,W,H);ctx.restore()}};return s}
// ordered dither between two colours: k = 0..1 coverage of b over a
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const dither=(x,y,k)=>k*16>BAY[(y&3)*4+(x&3)]+.5;
RA.pix={PAL,hex,shades,sprite,recolor,flipX,rot,text,tw,screen,mk,dither,glyph};
})();
