/* Retro Arena engine: everything the games share.
   A game calls RA.register({...}) and gets crisp full-window scaling, input (keys, mouse aim, touch pad,
   gamepads), sound effects, chiptune music, the HUD buttons, online rooms and a slot in the multicart menu.
   How to add a game: games/README.md. */
(()=>{
const $=id=>document.getElementById(id);
const RA=window.RA={};
// Shown as the watermark in the top-left corner. Bump it with every publish of the live game.
RA.VERSION='v78';

/* ---------- helpers ---------- */
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
RA.util={$,hex,
 rnd:(a,b)=>a+Math.random()*(b-a),
 hash:(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return (h^(h>>>16))>>>0},
 // seeded random, so every online player builds the same level from the same seed
 mulberry:a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},
 mix:(h,t,a)=>{const c=hex(h),d=hex(t);return'#'+c.map((v,i)=>Math.round(v+(d[i]-v)*a).toString(16).padStart(2,'0')).join('')},
 esc:s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
 touchDev:matchMedia('(pointer:coarse)').matches,
 buzz(){try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}};

/* ---------- 8-bit drawing ---------- */
const NES={sky:'#5c94fc',cloud:'#fcfcfc',cloudS:'#a4e4fc',far:'#a4e4fc',hill:'#b8f8b8',hillD:'#58d854',
 grass:'#b8f818',grassM:'#00a800',grassD:'#005800',dirt:'#ac7c00',dirtD:'#503000',dirtL:'#fca044',water:'#0058f8',waterL:'#3cbcfc',
 black:'#000',white:'#fcfcfc',red:'#d82800',gold:'#f8b800',gray:'#7c7c7c',light:'#bcbcbc'};
// art = rows of letters, cols = {letter: colour}; '.' is see-through
function blit(c,art,x,y,cols){for(let r=0;r<art.length;r++)for(let i=0;i<art[r].length;i++){const ch=art[r][i];if(ch!=='.'&&cols[ch]){c.fillStyle=cols[ch];c.fillRect(x+i,y+r,1,1)}}}
function disc(c,cx,cy,r){for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy));c.fillRect(Math.round(cx-w),Math.round(cy+dy),2*w+1,1)}}
const FONT={0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111',
 A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',
 J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',
 S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','+':'000010111010000','-':'000000111000000','!':'010010010000010'};
// PS1-style HUD text: chunky bold face, black outline, lit-to-shaded gradient; centred on x, y = top. Falls back to the 3x5 font if canvas text fails.
const lite=(h,a)=>{try{return RA.util.mix(h,'#ffffff',a)}catch(e){return h}},dark=(h,a)=>{try{return RA.util.mix(h,'#000000',a)}catch(e){return h}};
function text(c,str,x,y,col){const s=String(str).toUpperCase();
 try{c.save();c.font='8px "Russo One","Arial Black",Impact,sans-serif';c.textAlign='center';c.textBaseline='top';
  const g=c.createLinearGradient(0,y-1,0,y+7);g.addColorStop(0,lite(col,.55));g.addColorStop(.5,col);g.addColorStop(1,dark(col,.35));
  c.lineJoin='round';c.lineWidth=2;c.strokeStyle='#000';c.strokeText(s,x+.5,y-1.5);c.fillStyle=g;c.fillText(s,x+.5,y-1.5);c.restore();return}catch(e){try{c.restore()}catch(_){}}
 text3(c,s,x,y,col)}
// 3x5 pixel font with a drop shadow, centred on x
function text3(c,str,x,y,col){
 const s=String(str).toUpperCase(),ox=Math.round(x-(s.length*4-1)/2);
 for(const pass of[1,0]){let px=ox;c.fillStyle=pass?'#000':col;
  for(const ch of s){const g=FONT[ch];if(g)for(let i=0;i<15;i++)if(g[i]==='1')c.fillRect(px+i%3+pass,y+(i/3|0)+pass,1,1);px+=4}}
}
RA.gfx={NES,blit,disc,
 circle(c,cx,cy,r,col){c.fillStyle=col;disc(c,cx,cy,r)},
 text,num:(c,n,x,y,col)=>text(c,String(Math.max(0,n|0)),x,y,col)};

/* ---------- PS1-era 2.5D effects: dithered gradients, coloured light, sprite scale + spin, textured perspective floors ---------- */
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
RA.fx={
 // smooth-looking gradient with the ordered dither the PS1 used to hide colour banding
 gradient(c,x,y,w,h,top,bottom,steps){steps=steps||16;const A=hex(top),B=hex(bottom);
  for(let r=0;r<h;r++){const t=r/Math.max(1,h-1)*steps,lo=Math.floor(t),f=t-lo;
   for(let cx=0;cx<4&&cx<w;cx++){const k=BAYER[(r&3)*4+cx]/16,s=Math.min(steps,lo+(f>k?1:0))/steps;
    c.fillStyle='rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*s)).join(',')+')';for(let xx=x+cx;xx<x+w;xx+=4)c.fillRect(xx,y+r,1,1)}}},
 // the same gradient baked once into a canvas (use for big skies)
 gradientCanvas(w,h,top,bottom,steps){const k=document.createElement('canvas');k.width=Math.max(1,w);k.height=Math.max(1,h);RA.fx.gradient(k.getContext('2d'),0,0,w,h,top,bottom,steps);return k},
 // additive coloured light (explosions, magic, lamps); stepped rings, like a PS1 light sprite
 light(c,x,y,r,col,a){const prev=c.globalCompositeOperation;c.globalCompositeOperation='lighter';c.fillStyle=col;
  for(let i=4;i>=1;i--){c.globalAlpha=(a==null?.5:a)*(.25+.18*(4-i));disc(c,x,y,Math.round(r*i/4))}c.globalAlpha=1;c.globalCompositeOperation=prev},
 // PS1 "pre-rendered" sprite: a little scene of shaded spheres (x,y,z,r,col[,spec]) ray-cast into a w*h canvas,
 // lit from the top left with a specular glint, a dark rim and ordered dither. Build once, cache, blit every frame.
 // RA.fx.Q: models render Q x finer; the canvas remembers _q so drawImage/sprite still place it at its logical size
 model(w,h,balls,o){o=o||{};const Q=o.q||RA.fx.Q||1;if(Q>1){balls=balls.map(b=>Object.assign({},b,{x:b.x*Q,y:b.y*Q,z:(b.z||0)*Q,r:b.r*Q}));w*=Q;h*=Q}
  const k=document.createElement('canvas');k.width=w;k.height=h;if(Q>1)k._q=Q;const g=k.getContext('2d'),im=g.createImageData(w,h),d=im.data;
  const L=[-.52,-.62,.58],ln=Math.hypot(...L),Lx=L[0]/ln,Ly=L[1]/ln,Lz=L[2]/ln,C=balls.map(b=>hex(b.col));
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){const X=px+.5,Y=py+.5;let best=-1e9,bi=-1,nx=0,ny=0,nz=0;
   for(let i=0;i<balls.length;i++){const b=balls[i],dx=X-b.x,dy=Y-b.y,q=b.r*b.r-dx*dx-dy*dy;if(q<0)continue;const z=(b.z||0)+Math.sqrt(q);
    if(z>best){best=z;bi=i;nx=dx/b.r;ny=dy/b.r;nz=Math.sqrt(q)/b.r}}
   if(bi<0){if(Q>1){let cov=0,ci=-1;for(let i=0;i<balls.length;i++){const b=balls[i],e=b.r-Math.hypot(X-b.x,Y-b.y)+1;if(e>cov){cov=e;ci=i}}
     if(ci>=0&&cov>0){const c=C[ci],q=(py*w+px)*4,sh=(o.amb==null?.38:o.amb)*.8;for(let j=0;j<3;j++)d[q+j]=c[j]*sh;d[q+3]=Math.round(Math.min(1,cov)*255)}}continue}
   const b=balls[bi],c=C[bi],dif=Math.max(0,nx*Lx+ny*Ly+nz*Lz),hz=nz+Lz,hn=Math.hypot(nx+Lx,ny+Ly,hz),sp=Math.pow(Math.max(0,hz/hn),b.spec||18)*(b.gloss==null?.7:b.gloss);
   // smooth (hi-res) models: soft rim falloff and no dither; low-res keeps the hard rim + ordered dither
   let sh=(o.amb==null?.38:o.amb)+.8*dif;if(Q>1)sh*=.62+.38*Math.min(1,nz/.32);else if(nz<.32)sh*=.55;const di=Q>1?0:(BAYER[(py&3)*4+(px&3)]/16-.5)*10,q=(py*w+px)*4;
   for(let j=0;j<3;j++)d[q+j]=Math.max(0,Math.min(255,c[j]*sh+sp*255+di));d[q+3]=255}
  g.putImageData(im,0,0);return k},
 // soft round shadow under anything standing on the ground
 shadow(c,x,y,w,a){c.fillStyle='rgba(0,0,0,'+(a==null?.4:a)+')';const h=Math.max(1,Math.round(w/4));for(let dy=-h;dy<=h;dy++){const ww=Math.round(w*Math.sqrt(1-(dy/(h+.5))**2));c.fillRect(Math.round(x-ww),Math.round(y+dy),ww*2,1)}},
 // a sprite scaled and spun about its centre, crisp pixels
 sprite(c,img,x,y,scale,angle,alpha){c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));if(angle)c.rotate(angle);if(alpha!=null)c.globalAlpha=alpha;
  const q=img._q||1,w=img.width/q*(scale||1),h=img.height/q*(scale||1);c.drawImage(img,-w/2,-h/2,w,h);c.restore()},
 // textured perspective floor (Mode 7 / PS1 floor): tex = canvas, view {x, z, angle, height, horizon}; draws rows from horizon down
 floor(c,tex,v,x0,y0,w,h){const hor=v.horizon,ca=Math.cos(v.angle||0),sa=Math.sin(v.angle||0),tw=tex.width,th=tex.height;
  const d=floorData(tex);
  if(!floorBuf||floorBuf.width!==w||floorBuf.height!==h-hor){floorBuf=c.createImageData(Math.max(1,w),Math.max(1,h-hor))}
  const out=floorBuf.data;
  for(let r=0;r<h-hor;r++){const dist=(v.height||40)*(v.fov||120)/(r+1),fog=Math.min(1,r/((h-hor)*.6)+.15);
   const lx=-sa*dist,ly=ca*dist,rx=ca*dist*w/(v.fov||120)/2,ry=sa*dist*w/(v.fov||120)/2;
   for(let i=0;i<w;i++){const f=(i/w-.5)*2,u=((Math.floor(v.x+lx+rx*f)%tw)+tw)%tw,t=((Math.floor(v.z+ly+ry*f)%th)+th)%th,q=(t*tw+u)*4,o=(r*w+i)*4;
    const k=fog*.9;out[o]=d[q]*k;out[o+1]=d[q+1]*k;out[o+2]=d[q+2]*k;out[o+3]=255}}
  if(!floorC)floorC=document.createElement('canvas');if(floorC.width!==floorBuf.width||floorC.height!==floorBuf.height){floorC.width=floorBuf.width;floorC.height=floorBuf.height}
  floorC.getContext('2d').putImageData(floorBuf,0,0);const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=true;c.drawImage(floorC,x0,y0+hor);c.imageSmoothingEnabled=sm}};
let floorBuf=null,floorC=null;const floorCache=new WeakMap();
// RA.fx.floor7: the same Mode 7 floor about 10x faster (steps the texture along each row, reads packed 32-bit texels).
// tex must be a square power-of-two canvas; it wraps. view {x,z,angle,height,fov,horizon}: forward = (-sin a, cos a), right = (cos a, sin a).
// The horizon may sit above the view (negative) for steep cameras such as a football broadcast. No fog: draw your own haze on top.
// Sprites on the floor at world (x,z): f = -(x-v.x)*sin a + (z-v.z)*cos a (depth), s = fov/f, screen x = x0+w/2 + ((x-v.x)*cos a + (z-v.z)*sin a)*s,
// screen y = y0+horizon + height*s, an object h tall reaches up h*s pixels.
const f7={buf:null,cv:null,tex:new WeakMap()};
// Mipmaps: far rows read a texture shrunk by 2, 4, 8... (each texel the average of four), so distant ground stays calm
// instead of breaking up into flickering pixel noise. v.mip=false turns it off.
function f7mips(tex){const S=tex.width,L=[new Uint32Array(tex.getContext('2d').getImageData(0,0,S,S).data.buffer)];
 for(let s=S>>1;s>=16;s>>=1){const P=L[L.length-1],ps=s<<1,o=new Uint32Array(s*s);
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){const a=P[(2*y)*ps+2*x],b=P[(2*y)*ps+2*x+1],c=P[(2*y+1)*ps+2*x],d=P[(2*y+1)*ps+2*x+1];
   const ch=k=>((((a>>>k)&255)+((b>>>k)&255)+((c>>>k)&255)+((d>>>k)&255))>>2)<<k;o[y*s+x]=(ch(0)|ch(8)|ch(16)|(255<<24))>>>0}
  L.push(o)}return L}
RA.fx.floor7=(c,tex,v,x0,y0,w,h)=>{let T=f7.tex.get(tex);const S=tex.width,sh0=Math.log2(S)|0;
 if(!T){T=f7mips(tex);f7.tex.set(tex,T)}
 const hor=Math.round(v.horizon),r0=Math.max(0,-hor),rows=h-hor-r0;if(rows<=0||w<=0)return;
 if(!f7.cv)f7.cv=document.createElement('canvas');if(!f7.buf||f7.buf.width!==w||f7.buf.height!==rows){f7.cv.width=w;f7.cv.height=rows;f7.buf=f7.cv.getContext('2d').createImageData(w,rows)}
 const out=new Uint32Array(f7.buf.data.buffer),a=v.angle||0,ca=Math.cos(a),sa=Math.sin(a),H=v.height||40,F=v.fov||120,mip=v.mip!==false;let o=0;
 for(let r=r0;r<r0+rows;r++){const d=H*F/(r+1),rx=ca*d*w/F/2,rz=sa*d*w/F/2;let u=v.x-sa*d-rx,t=v.z+ca*d-rz;const du=2*rx/w,dt=2*rz/w;
  // texels covered by one screen pixel: across the row, and down to the next row
  const step=Math.max(Math.hypot(du,dt),H*F/(r+1)-H*F/(r+2));let L=0;if(mip)while(L<T.length-1&&step>(1.5*(1<<L)))L++;
  const TL=T[L],sh=sh0-L,M=(S>>L)-1,k=1/(1<<L);u*=k;t*=k;const du2=du*k,dt2=dt*k;
  for(let i=0;i<w;i++){out[o++]=TL[(((t|0)&M)<<sh)|((u|0)&M)];u+=du2;t+=dt2}}
 f7.cv.getContext('2d').putImageData(f7.buf,0,0);c.drawImage(f7.cv,x0,y0+hor+r0)};

function floorData(tex){let d=floorCache.get(tex);if(!d){d=tex.getContext('2d').getImageData(0,0,tex.width,tex.height).data;floorCache.set(tex,d)}return d}

/* ---------- screen: whole-number pixel scale, the view widens or narrows to fill any window ---------- */
// models made at Q x resolution draw at their logical size wherever a game calls drawImage(img,x,y)
{const P=CanvasRenderingContext2D.prototype,dI=P.drawImage;P.drawImage=function(img,a,b,c,d,e,f,g,h){const q=img&&img._q;
 if(!q)return arguments.length===3?dI.call(this,img,a,b):arguments.length===5?dI.call(this,img,a,b,c,d):dI.call(this,img,a,b,c,d,e,f,g,h);
 if(arguments.length===3)return dI.call(this,img,a,b,img.width/q,img.height/q);if(arguments.length===5)return dI.call(this,img,a,b,c,d);
 return dI.call(this,img,a*q,b*q,c*q,d*q,e,f,g,h)}}
RA.fx.Q=3;
RA.lw=img=>img._q?img.width/img._q:img.width;RA.lh=img=>img._q?img.height/img._q:img.height;
// hi-res context: every transform the game sets is multiplied by k, so logical coordinates stay the same
function hiCtx(cv,k){const c=cv.getContext('2d');if(!c._st){c._st=c.setTransform.bind(c);c._k=1;
  c.setTransform=function(a,b,cc,d,e,f){if(typeof a==='object'&&a)return c._st(a);return c._st(a*c._k,b*c._k,cc*c._k,d*c._k,e*c._k,f*c._k)};
  c.resetTransform=function(){c._st(c._k,0,0,c._k,0,0)}}
 c._k=k;c._st(k,0,0,k,0,0);c.imageSmoothingEnabled=false}
RA.screen=o=>{
 // o.baseH / o.minW: the view the game wants (may change between rounds, then call fit()).
 // o.whole: true = never scale past what fits (board games), default rounds to the nearest scale (scrolling games).
 const st={w:0,h:0,s:1,dpr:1,fit};
 function fit(){
  const sc=o.el,dpr=window.devicePixelRatio||1,baseH=o.baseH||216,minW=o.minW||320;
  if(!sc||sc.clientWidth<20||sc.clientHeight<20)return;
  const w=sc.clientWidth*dpr,h=sc.clientHeight*dpr,s=Math.max(1,(o.whole?Math.floor:Math.round)(Math.min(h/baseH,w/minW)));
  const nw=Math.max(160,Math.ceil(w/s)),nh=Math.max(120,Math.ceil(h/s));
  st.s=s;st.dpr=dpr;o.canvas.style.width=(nw*s/dpr)+'px';o.canvas.style.height=(nh*s/dpr)+'px';
  // o.res: render k x sharper than the game's logical pixels (text, shapes, models get the detail; game code is unchanged)
  // ...but only by a factor that divides the screen scale: the browser then enlarges the canvas by a whole number and every
  // game pixel stays an even square (k=3 on an 8x screen gave 2.67x - uneven pixels and unreadable text on big monitors)
  let k=(o.res||1)>1?Math.min(s,6):1;while(k>1&&s%k)k--;
  if(nw===st.w&&nh===st.h&&k===st.k)return;
  st.w=nw;st.h=nh;st.k=k;o.canvas.width=nw*k;o.canvas.height=nh*k;hiCtx(o.canvas,k);if(o.onResize)o.onResize(nw,nh);
 }
 try{new ResizeObserver(()=>fit()).observe(o.el)}catch(e){}
 addEventListener('resize',fit);
 return st;
};

/* ---------- sound effects ---------- */
let AC=null,noise=null,lastBoom=0;const SFX={};
// Sound options (main menu): master / music / effects volume 0-100 + mute, saved per device
const VOL={master:80,music:70,sfx:90,mute:false};try{Object.assign(VOL,JSON.parse(localStorage.getItem('ra-sound')||'{}'))}catch(e){}
let BUS=null;   // {master,music,sfx} gain nodes, everything plays through these
function buses(){if(!BUS&&AC){const m=AC.createGain(),mu=AC.createGain(),fx=AC.createGain();mu.connect(m);fx.connect(m);m.connect(AC.destination);BUS={master:m,music:mu,sfx:fx};applyVol()}return BUS}
function applyVol(){if(!BUS)return;BUS.master.gain.value=VOL.mute?0:VOL.master/100;BUS.music.gain.value=VOL.music/100;BUS.sfx.gain.value=VOL.sfx/100}
const fxOut=()=>buses()?BUS.sfx:AC.destination;
function ensure(){
 if(AC){music.wake();return AC}
 try{AC=new(window.AudioContext||window.webkitAudioContext)();
  noise=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=noise.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2)}catch(e){AC=null}
 music.wake();return AC;
}
// built in: boom (arg = blast size), shot, pick, sel; games add their own with RA.audio.add(name, fn)
function sfx(t,r){if(!AC)return;try{const now=AC.currentTime,g=AC.createGain();g.connect(fxOut());
 if(SFX[t]){SFX[t](AC,now,g,r);return}
 if(t==='boom'){if(now-lastBoom<.05)return;lastBoom=now;const big=(r|0)>=20,s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=noise;f.type='lowpass';f.frequency.value=big?420:700;
  s.connect(f);f.connect(g);g.gain.value=big?.6:.45;s.start();
  if(big){const o=AC.createOscillator(),v=AC.createGain();o.frequency.setValueAtTime(110,now);o.frequency.exponentialRampToValueAtTime(30,now+.35);v.gain.setValueAtTime(.5,now);v.gain.exponentialRampToValueAtTime(.001,now+.4);o.connect(v);v.connect(fxOut());o.start();o.stop(now+.42)}}
 else if(t==='sel'){const o=AC.createOscillator();o.type='square';o.frequency.value=740;g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.06);o.connect(g);o.start();o.stop(now+.07)}
 else{const o=AC.createOscillator(),hi=t==='pick';o.type='square';o.frequency.setValueAtTime(hi?500:900,now);o.frequency.exponentialRampToValueAtTime(hi?1200:180,now+.1);
  g.gain.setValueAtTime(.08,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);o.connect(g);o.start();o.stop(now+.13)}}catch(e){}}
function blip(f){ensure();if(!AC)return;try{const now=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;
 g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.08);o.connect(g);g.connect(fxOut());o.start();o.stop(now+.09)}catch(e){}}
RA.audio={ensure,sfx,blip,vol:VOL,setVol(k,v){VOL[k]=v;applyVol();try{localStorage.setItem('ra-sound',JSON.stringify(VOL))}catch(e){}},add:(name,fn)=>{SFX[name]=fn},get ctx(){return AC},get noise(){return noise}};

/* ---------- music: every game has its own set of tracks, played on a PS1-style synth (warm pads, filtered leads, reverb) ---------- */
// A track: 4 bars of 16th steps. mel = pulse lead ("-" holds, "." rests), ch = one chord per bar (drives bass + arpeggio),
// dr = drum loop (k kick, s snare, h hat). Make one with RA.music.track(name, bpm, chords, drums, melody).
// set innerHTML only when it changed (rewriting it every presence tick closes open dropdowns on Windows)
const setH=RA.util.setH=(el,h)=>{if(el&&el._h!==h){el._h=h;el.innerHTML=h}};
// after an online match everyone returns to the room by themselves: the host's button counts down and fires
RA.autoBack=o=>{clearInterval(RA._ab);let n=o.secs||8;const t=()=>{if(!o.still()){clearInterval(RA._ab);return}o.label&&o.label(n);if(n--<=0){clearInterval(RA._ab);o.go&&o.go()}};t();RA._ab=setInterval(t,1000)};
const music=RA.music=(()=>{
 const NOTE={c:0,'c#':1,db:1,d:2,'d#':3,eb:3,e:4,f:5,'f#':6,gb:6,g:7,'g#':8,ab:8,a:9,'a#':10,bb:10,b:11};
 const midi=m=>440*Math.pow(2,(m-69)/12);
 const hz=t=>{const m=/^([a-g][#b]?)(\d)$/.exec(t);return m?midi(NOTE[m[1]]+12*(+m[2]+1)):0};
 const chordOf=c=>{const m=/^([A-G][#b]?)(m?)$/.exec(c),r=NOTE[m[1].toLowerCase()];return[r,r+(m[2]?3:4),r+7]};
 const track=(n,bpm,ch,dr,mel)=>({n,bpm,ch,dr,mel:mel.trim().split(/\s+/)});
 const SETS={
  menu:[track('Memory Card',84,['Am','F','C','G'],'k.....h.s.....h.',
   'e5 - - - - - d5 - c5 - - - - - - - a4 - - - c5 - - - f5 - - - e5 - - - g5 - - - - - e5 - d5 - - - c5 - - - d5 - - - - - - - b4 - - - - - - -')]};
 let on=true;try{on=localStorage.getItem('ra-music')!=='off'}catch(e){}
 let cur=null,set='',idx=0,step=0,next=0,timer=0,gain=null,pulseW=null;
 let lpf=null;
 // voice: detuned oscillators -> envelope -> optional lowpass -> bus. a = attack, rel = release (s)
 function voice(f,t,d,types,v,{a=.01,rel=.12,cut=0,det=7,vib=0}={}){const g=AC.createGain();let out=g;
  if(cut){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=cut;lp.Q.value=.7;g.connect(lp);out=lp}
  out.connect(gain);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-rel*.5));g.gain.linearRampToValueAtTime(0,t+d+rel);
  types.forEach((ty,i)=>{const o=AC.createOscillator();o.type=ty;o.frequency.value=f;o.detune.value=(i-(types.length-1)/2)*det;
   if(vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5;lg.gain.value=vib;l.connect(lg);lg.connect(o.detune);l.start(t+.15);l.stop(t+d+rel+.05)}
   o.connect(g);o.start(t);o.stop(t+d+rel+.05)})}
 function tone(f,t,d,type,v){
  if(type==='pulse')return voice(f,t,d,['sawtooth','sawtooth'],v*.8,{a:.02,rel:.18,cut:2200,det:9,vib:9});   // lead
  if(type==='triangle')return voice(f,t,d,['triangle','sine'],v,{a:.01,rel:.08,det:0});                    // bass
  return voice(f,t,d*3,['sine'],v*1.3,{a:.005,rel:.35,det:0})}                                              // e-piano arp
 function pad(c,t,d){for(const n of c)voice(midi(n+48),t,d,['sawtooth','sawtooth'],.018,{a:.5,rel:.8,cut:900,det:14})}
 function drum(k,t){
  if(k==='k'){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);
   g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(gain);o.start(t);o.stop(t+.15);return}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),hh=k==='h';s.buffer=noise;f.type=hh?'highpass':'bandpass';f.frequency.value=hh?8000:1800;
  if(!hh){const o=AC.createOscillator(),og=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(120,t+.08);og.gain.setValueAtTime(.18,t);og.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(og);og.connect(gain);o.start(t);o.stop(t+.12)}
  g.gain.setValueAtTime(hh?.05:.26,t);g.gain.exponentialRampToValueAtTime(.001,t+(hh?.04:.12));s.connect(f);f.connect(g);g.connect(gain);s.start(t);s.stop(t+.15)}
 function sched(){if(!cur||!AC)return;const sp=60/cur.bpm/4;
  if(next<AC.currentTime-.1)next=AC.currentTime+.02; // tab was asleep: skip ahead instead of a burst of notes
  while(next<AC.currentTime+.15){const t=next,L=cur.mel.length,i=step%L,tok=cur.mel[i];
   if(tok!=='.'&&tok!=='-'){let d=1;while(cur.mel[(i+d)%L]==='-'&&d<16)d++;tone(hz(tok),t,d*sp,'pulse',.07)}
   const c=chordOf(cur.ch[Math.floor(i/16)%cur.ch.length]),b=i%16;
   if(b===0)pad(c,t,sp*16);
   if(b%4===0||b===6||b===14)tone(midi(c[0]+36+(b===6?12:0)),t,sp*(b%4?1.5:3),'triangle',.2);
   if(b%2===0)tone(midi(c[(b>>1)%3]+72),t,sp*.5,'arp',.02);
   const dk=cur.dr[step%cur.dr.length];if(dk!=='.')drum(dk,t);
   step++;next+=sp}}
 function start(){if(!AC||!on||!set||!SETS[set])return;const list=SETS[set];cur=list[idx%list.length];step=0;next=AC.currentTime+.05;
  if(!gain){gain=AC.createGain();gain.gain.value=.5;const dest=buses()?BUS.music:AC.destination;gain.connect(dest);
   // small hall: generated impulse response + a soft echo, the PS1 "SPU reverb" feel
   try{const len=AC.sampleRate*2.2|0,ir=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
    const cv=AC.createConvolver(),wet=AC.createGain();cv.buffer=ir;wet.gain.value=.32;gain.connect(cv);cv.connect(wet);wet.connect(dest);
    const dl=AC.createDelay(1),fb=AC.createGain(),dw=AC.createGain();dl.delayTime.value=60/112*.75;fb.gain.value=.28;dw.gain.value=.16;gain.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(dw);dw.connect(dest)}catch(e){}
   const n=16,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*.25);pulseW=AC.createPeriodicWave(re,im)}
  clearInterval(timer);timer=setInterval(sched,25);sched()}
 function stop(){clearInterval(timer);timer=0;cur=null}
 function label(){document.querySelectorAll('.ra-mus').forEach(m=>{m.classList.toggle('off',!on);m.textContent=on?'♪':'♪ OFF'});const c=$('cartMus');if(c)c.textContent=on?'♪ MUSIC ON':'♪ MUSIC OFF'}
 function show(){label();toast(on?'♪ '+(cur?cur.n.toUpperCase():'MUSIC ON'):'♪ MUSIC OFF')}
 const save=()=>{try{localStorage.setItem('ra-music',on?'on':'off')}catch(e){}};
 return{track,label,get on(){return on},
  add(id,tracks){SETS[id]=tracks},
  play(s,i){if(s===set&&i===idx&&(cur||!on))return;set=s;idx=i;stop();start()},
  next(){if(!set)return;if(!on){on=true;save()}ensure();idx=(idx+1)%SETS[set].length;stop();start();show()},
  toggle(){on=!on;save();if(on){ensure();stop();start()}else stop();show()},
  wake(){if(on&&!cur)start()}};
})();

/* ---------- HUD bits ---------- */
function toast(t){const el=$('toast');if(!el)return;el.textContent=t;el.hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';
 clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true},1600)}
// MENU button in a match: tap once to arm ("QUIT?"), again within 2 s to leave (Esc does the same).
let quitT=0;
const quitBtn=()=>cur&&cur.el?cur.el.querySelector('.ra-quit'):null;
const hud=RA.hud={
 disarm(){clearTimeout(quitT);document.querySelectorAll('.ra-quit').forEach(b=>{b.textContent='MENU';b.classList.remove('go')})},
 arm(){hud.disarm();const b=quitBtn();if(!b)return;b.textContent='QUIT?';b.classList.add('go');quitT=setTimeout(hud.disarm,2000)},
 quitPressed(){const b=quitBtn();if(b&&b.textContent!=='QUIT?'){hud.arm();return}hud.disarm();dpOff();for(const k in touchK)touchK[k]=false;if(cur&&cur.onQuit)cur.onQuit()}};
RA.ui={toast};

/* ---------- input ---------- */
// Keys: a game's onKey(e) says which keys it uses; those are held until read at least once, so quick taps never get lost.
const held=new Set(),relQ=new Set(),touchK={},pulseT={};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(!cartOn&&cur&&cur.onKey&&cur.onKey(e)){held.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>relQ.add(e.code));
addEventListener('blur',()=>{held.clear();for(const k in touchK)touchK[k]=false;dpOff()});
const mouse={on:false,down:false,rel:false,fx:.5,fy:.5};      // cursor as a fraction of the game screen
const touchAim={on:false,id:null,fx:.5,fy:.5};                  // finger on the game screen
function pad(n){let gp=null;try{gp=navigator.getGamepads()[n]}catch(e){}
 if(!gp)return{};const a=gp.axes,b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
 return{left:a[0]<-.4||b(14),right:a[0]>.4||b(15),up:a[1]<-.4||b(12),down:a[1]>.4||b(13),a:b(0),b:b(1),x:b(2),y:b(3),lb:b(4),rb:b(5),lt:b(6),rt:b(7),back:b(8),start:b(9),
  ax:a[0]||0,ay:a[1]||0,rx:a[2]||0,ry:a[3]||0}}
// which device the player touched last ('kb' or 'pad'): legends show the matching buttons
let lastDev='kb';const devFns=[];const setDev=d=>{if(d!==lastDev){lastDev=d;devFns.forEach(f=>{try{f(d)}catch(e){}})}};
addEventListener('keydown',()=>setDev('kb'),true);addEventListener('mousedown',()=>setDev('kb'),true);
/* On-screen control legend, PS1 style button glyphs, swaps between keyboard and gamepad as the player switches.
   RA.legend(gameRootEl, {kb:[['A D','walk'],['LMB','fire']], pad:[['LS','move'],['A','jump']]}) ; tokens split by spaces become glyphs. */
const GLY={A:'gA',B:'gB',X:'gX',Y:'gY',LB:'gS',RB:'gS',LT:'gS',RT:'gS',LS:'gT',RS:'gT',DP:'gT',START:'gS',BACK:'gS'};
const glyph=(t,pad)=>{const e=RA.util.esc(t);return pad&&GLY[t]?'<span class="gl '+GLY[t]+'">'+(t==='DP'?'✚':e)+'</span>':'<kbd>'+e+'</kbd>'};
RA.legend=(root,L)=>{const scr=root.querySelector('.screen')||root;let el=scr.querySelector('.ra-legend');
 if(!el){el=document.createElement('div');el.className='ra-legend';scr.appendChild(el)}
 const draw=d=>{const pad=d==='pad',rows=(pad?L.pad:L.kb)||[];el.innerHTML=rows.map(r=>'<span>'+r[0].split(' ').map(t=>glyph(t,pad)).join('')+'<em>'+RA.util.esc(r[1])+'</em></span>').join('')};
 // shows for 10 s when a match starts or the player switches device, then fades so it never hides the game
 let ft=0,was=false;const wake=()=>{el.classList.remove('fade');clearTimeout(ft);ft=setTimeout(()=>el.classList.add('fade'),10000)};
 devFns.push(d=>{draw(d);wake()});draw(lastDev);wake();
 setInterval(()=>{const on=document.body.classList.contains('playing')&&!root.hidden;if(on&&!was)wake();was=on},500);
 return{el,show:v=>{el.hidden=!v},wake}};
// Touch buttons: any element with data-k="name" becomes a held button touchK[name].
function bindButtons(root){root.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();ensure();RA.util.buzz();touchK[k]=true;b.classList.add('down');try{b.setPointerCapture(e.pointerId)}catch(_){}};
 const off=()=>{touchK[k]=false;b.classList.remove('down')};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);
 b.addEventListener('contextmenu',e=>e.preventDefault())})}
// D-pad (class "dpad" with <i class="dU|dD|dL|dR">): one touch zone, direction from where the thumb is, so sliding changes direction (8-way).
const DIRS=['up','down','left','right'],pads=[];
function dpOff(){for(const p of pads)p.off()}
function bindDpad(dpad){
 const DPI={up:dpad.querySelector('.dU'),down:dpad.querySelector('.dD'),left:dpad.querySelector('.dL'),right:dpad.querySelector('.dR')};let id=null;
 const off=()=>{id=null;for(const d of DIRS){touchK[d]=false;if(DPI[d])DPI[d].classList.remove('on')}};pads.push({off});
 const set=(x,y)=>{const r=dpad.getBoundingClientRect();x-=r.left+r.width/2;y-=r.top+r.height/2;
  const ax=Math.abs(x),ay=Math.abs(y),dz=r.width*.12,was=DIRS.map(d=>touchK[d]).join();
  touchK.left=x<-dz&&ax>ay*.41;touchK.right=x>dz&&ax>ay*.41;touchK.up=y<-dz&&ay>ax*.41;touchK.down=y>dz&&ay>ax*.41;
  for(const d of DIRS)if(DPI[d])DPI[d].classList.toggle('on',!!touchK[d]);
  if(DIRS.map(d=>touchK[d]).join()!==was&&DIRS.some(d=>touchK[d]))RA.util.buzz()};
 dpad.addEventListener('pointerdown',e=>{e.preventDefault();ensure();if(id!==null)return;id=e.pointerId;try{dpad.setPointerCapture(e.pointerId)}catch(_){}set(e.clientX,e.clientY)});
 dpad.addEventListener('pointermove',e=>{if(e.pointerId===id)set(e.clientX,e.clientY)});
 for(const t of['pointerup','pointercancel','lostpointercapture'])dpad.addEventListener(t,e=>{if(e.pointerId===id)off()});
 dpad.addEventListener('contextmenu',e=>e.preventDefault());
}
// Mouse + touch on the game canvas. hooks: active() (game wants pointer input now), touchActive(), click(e) / touch(e) (return false to swallow),
// right(), wheel(dy). Left mouse = mouse.down, a finger = touchK.fire plus touchAim.
function attachPointer(cv,h){
 const at=(o,e)=>{const r=cv.getBoundingClientRect();o.fx=(e.clientX-r.left)/r.width;o.fy=(e.clientY-r.top)/r.height};
 cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){at(mouse,e);mouse.on=true}else if(e.pointerId===touchAim.id)at(touchAim,e)});
 cv.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'){if(!h.active())return;e.preventDefault();at(mouse,e);mouse.on=true;ensure();
   if(e.button===0){if(h.click&&h.click(e)===false)return;mouse.down=true;mouse.rel=false;try{cv.setPointerCapture(e.pointerId)}catch(_){}}
   else if(e.button===2&&h.right)h.right();return}
  if(!(h.touchActive||h.active)()||touchAim.id!==null)return;
  if(h.touch&&h.touch(e)===false)return;
  e.preventDefault();ensure();touchAim.id=e.pointerId;touchAim.on=true;at(touchAim,e);touchK.fire=true;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 for(const t of['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(t,e=>{
  if(e.pointerType==='mouse'){mouse.rel=true;return}
  if(e.pointerId!==touchAim.id)return;touchAim.id=null;touchK.fire=false;
  setTimeout(()=>{if(touchAim.id===null)touchAim.on=false},40)});
 cv.addEventListener('wheel',e=>{if(!h.active()||!h.wheel)return;e.preventDefault();h.wheel(e.deltaY)},{passive:false});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
}
RA.input={held,touchK,mouse,touchAim,pad,attachPointer,dpOff,
 keys(map){const o={};for(const code in map)if(held.has(code))o[map[code]]=true;return o},
 // a short virtual button press (weapon bar, mouse wheel...), long enough for online play to see it
 pulse(k,ms){pulseT[k]=performance.now()+(ms||120)},
 pulses(){const n=performance.now(),o={};for(const k in pulseT)if(pulseT[k]>n)o[k]=true;return o},
 endFrame(){for(const c of relQ)held.delete(c);relQ.clear();if(mouse.rel){mouse.down=false;mouse.rel=false}}};

/* ---------- online rooms (claude.ai live rooms, or the desktop app's LAN rooms) ---------- */
RA.net={
 connect(){return RA.net._c||(RA.net._c=RA.net._connect())},
 async _connect(){
  if(!window.claude||!window.claude.use)return null;
  let room=null,user=null,db=null,me=null;
  try{[room,user,db]=await Promise.all([claude.use('room'),claude.use('user'),claude.use('db')])}catch(e){}
  if(!room)return null;
  if(user){try{me=await user.id()}catch(e){}}
  return{room,user,db,me};
 },
 newCode:()=>Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join(''),
 cleanCode:c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)};

/* ---------- save files: every player has their own save for every game ----------
   const S=RA.save('jewels');  S.data is the save (plain object, ready to use at once from this device),
   S.set({opt:1}) changes it, S.record({won:true,kills:3,bestScore:1200}) adds one finished match to S.data.stats
   (played and wins count up, best* keys keep the highest, other numbers add up), S.onChange(fn) hears updates.
   Signed in to claude.ai the save also lives in your private space (data/users/<you>/save-<game>), so it follows
   you to other devices; the newer copy wins. o.doc names an older doc to keep using, o.migrate(d) upgrades its shape. */
const SAVES={};
async function saveDoc(name){
 if(!window.claude||!window.claude.use)return null;
 try{const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return null;
  const me=await user.id();return me?db.doc('data/users/'+me+'/'+name):null}catch(e){return null}}
RA.save=(id,o)=>SAVES[id]||(SAVES[id]=(()=>{
 o=o||{};const key='ra-save-'+id,fix=d=>(o.migrate?o.migrate(d||{}):d)||{},fns=[];
 let local={};try{local=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){}
 const S={id,data:fix(local),online:false,ref:null,
  onChange(fn){fns.push(fn)},
  set(patch){Object.assign(S.data,patch,{at:Date.now()});try{localStorage.setItem(key,JSON.stringify(S.data))}catch(e){}
   fns.forEach(f=>{try{f(S.data)}catch(e){}});
   clearTimeout(S._t);S._t=setTimeout(()=>{if(S.ref)S.ref.set(S.data).catch(()=>{})},400)},
  record(r){const s=Object.assign({},S.data.stats);s.played=(s.played|0)+1;if(r.won)s.wins=(s.wins|0)+1;
   for(const k in r){const v=r[k];if(k==='won'||typeof v!=='number'||!isFinite(v))continue;
    s[k]=/^best/.test(k)?Math.max(s[k]||0,v):(s[k]||0)+v}
   S.set({stats:s})},
  get stats(){return S.data.stats||{}}};
 S.ready=saveDoc(o.doc||'save-'+id).then(async ref=>{if(!ref)return S;S.ref=ref;S.online=true;
  try{const snap=await ref.get(),remote=snap.exists?fix(snap.data()):null;
   if(remote&&(remote.at||0)>=(S.data.at||0)){for(const k in S.data)delete S.data[k];Object.assign(S.data,remote);
    try{localStorage.setItem(key,JSON.stringify(S.data))}catch(e){}}
   else if(S.data.at)await ref.set(S.data)}catch(e){}
  fns.forEach(f=>{try{f(S.data)}catch(e){}});return S});
 return S})());

/* ---------- achievements + unlockables (every game, from the surveys) ----------
   const A=RA.achievements('worms',[{id:'ko10',name:'Grave Digger',desc:'10 KOs in total',test:s=>s.kills>=10,unlock:'hat:crown'}, ...]);
   test(stats, match) gets the save's running stats and the match you just recorded; call A.check(match) after SAVE.record(match).
   New ones pop a gold toast; earned ids live in the save (data.ach {id:time}), their rewards in data.unlocks {key:true}.
   A.has(id), A.unlocked(key), A.list() -> [{...def, got}] for a trophy screen. */
const achQ=[];let achT=0;
function achToast(t){achQ.push(t);if(achT)return;(function next(){const m=achQ.shift();if(!m){achT=0;return}
 toast(m);const el=$('toast');if(el)el.classList.add('ach');achT=setTimeout(()=>{if(el)el.classList.remove('ach');next()},2600)})()}
const ACHS={};
RA.achievements=(id,defs)=>ACHS[id]||(ACHS[id]=(()=>{const S=RA.save(id);
 const A={id,defs,
  has:k=>!!(S.data.ach||{})[k],
  unlocked:k=>!!(S.data.unlocks||{})[k],
  list:()=>defs.map(d=>Object.assign({},d,{got:(S.data.ach||{})[d.id]||0})),
  count:()=>defs.filter(d=>A.has(d.id)).length,
  check(match){const s=S.stats,ach=Object.assign({},S.data.ach),un=Object.assign({},S.data.unlocks),got=[];
   for(const d of defs){if(ach[d.id])continue;let ok=false;try{ok=!!d.test(s,match||{})}catch(e){}
    if(ok){ach[d.id]=Date.now();for(const u of [].concat(d.unlock||[]))un[u]=true;got.push(d)}}
   if(got.length){S.set({ach,unlocks:un});got.forEach(d=>{RA.audio.sfx&&RA.audio.sfx('pick');achToast('★ '+d.name.toUpperCase()+(d.unlock?' · UNLOCKED '+[].concat(d.unlock).map(u=>String(u).split(':').pop().toUpperCase()).join(' + '):''))})}
   return got}};
 return A})());
// cosmetics the player equips from unlocks: RA.look('worms') -> {skin:'Golden',trail:'Fire',...}; RA.look.set(game,slot,val)
RA.look=id=>Object.assign({},RA.save(id).data.look);
RA.look.set=(id,slot,v)=>{const l=RA.look(id);if(v)l[slot]=v;else delete l[slot];RA.save(id).set({look:l})};
RA.look.clean=o=>{const r={};if(o&&typeof o==='object')for(const k of Object.keys(o).slice(0,8))if(typeof o[k]==='string')r[k.slice(0,8)]=o[k].replace(/[^\w ]/g,'').slice(0,16);return r};

/* ---------- host match presets: 3 named slots per game in the host's save (surveys: "host picks") ----------
   const P=RA.presets('worms',defaults); P.get(n) -> settings of slot n (1-3, falls back to defaults),
   P.set(n,obj) saves a slot, P.last / P.use(n) remember which slot the host played last. */
RA.presets=(id,defaults)=>{const S=RA.save(id);
 const all=()=>Object.assign({},S.data.presets);
 return{get:n=>Object.assign({},defaults,all()[n]),
  set(n,obj){const p=all();p[n]=Object.assign({},obj);S.set({presets:p})},
  get last(){return S.data.preset||1},use(n){S.set({preset:n})}}};

/* ---------- lag-free online play: every player runs their own character here, the host referees ----------
   const S=RA.sync({owns:key=>bool, onHit:(key,kind,value,fromKey)=>{...}});
   key = the seat index of a player / board / tank.  owns(key) is true for what THIS device simulates
   (on the host: itself + CPUs, on a guest: only its own seat).
   Guest each frame:   S.upload(room, now, state, matchId)  -> sends my own seat's state (+ hits I caused) in presence.
   Host each step:     const u=S.read(peerPresence, matchId); u.s = that guest's latest state, u.hits handled for you.
   Anyone:             S.hit(key, kind, value, fromKey) -> applied here if we own the target, otherwise routed to its owner.
   Host snapshot:      g.hx=S.pack();   guest on snapshot: S.unpack(g.hx)  (hits for my seat arrive in onHit).
   Remote things:      S.follow(obj, tx, ty) glides obj.x/.y toward the latest network position every frame.
   S.reset() at every new match. */
RA.sync=o=>{const S={out:[],os:0,inbox:{},seen:{},inSeen:{},lastT:0,lastK:'',
 reset(){S.out=[];S.os=0;S.inbox={};S.seen={};S.inSeen={}},
 hit(key,k,v,from){key|=0;
  if(o.owns(key)){o.onHit(key,k,v,from);return}
  if(o.host()){const q=S.inbox[key]=S.inbox[key]||{s:0,l:[]};q.l.push([++q.s,k,v,from|0]);if(q.l.length>16)q.l.shift()}
  else{S.out.push([++S.os,key,k,v]);if(S.out.length>16)S.out.shift()}},
 upload(room,now,state,mid,extra){if(!room)return;const pr=Object.assign({sy:{m:mid|0,s:state,o:S.out}},extra);
  const k=JSON.stringify(pr);if(k===S.lastK&&now-S.lastT<500)return;if(now-S.lastT<33)return;
  S.lastK=k;S.lastT=now;room.presence(pr).catch(()=>{})},
 read(pr,mid,fromKey){const y=pr&&pr.sy;if(!y||(y.m|0)!==(mid|0))return null;
  if(Array.isArray(y.o)){const seen=S.seen[fromKey]|0;let top=seen;
   for(const e of y.o){if(!Array.isArray(e)||(e[0]|0)<=seen)continue;top=Math.max(top,e[0]|0);if((e[1]|0)!==(fromKey|0))S.hit(e[1]|0,String(e[2]),e[3],fromKey)}
   S.seen[fromKey]=top}
  return{s:y.s}},
 pack(){const x={};for(const k in S.inbox)if(S.inbox[k].l.length)x[k]=S.inbox[k].l;return x},
 unpack(x){if(!x)return;for(const k in x){if(!o.owns(+k)||!Array.isArray(x[k]))continue;
  for(const e of x[k]){if(!Array.isArray(e)||(e[0]|0)<=(S.inSeen[k]|0))continue;S.inSeen[k]=e[0]|0;o.onHit(+k,String(e[1]),e[2],e[3]|0)}}},
 follow(ob,tx,ty,snap){const dx=tx-ob.x,dy=ty-ob.y;if(Math.abs(dx)+Math.abs(dy)>(snap||40)){ob.x=tx;ob.y=ty}else{ob.x+=dx*.35;ob.y+=dy*.35}}};
 return S};

/* ---------- online rooms kit: lobby list, create / join by code, roster, host sync ----------
   const R=RA.rooms({game:'jewels', el:panelElement, colors:[[name,hex]...], max:20, minPlayers:2, note:'...',
                     onStart(list), onState(g), onLeave()})
   The host runs the game and calls R.broadcast(now, g) every frame (g = the game's snapshot, <= ~3.5 KB of JSON);
   everyone else gets it in onState(g) and sends its buttons with R.send({...}). The host reads them with R.input(peer).
   onStart(list) on the host: list = [{peer, me, cpu}] in seat order (host first, then join order, then CPUs). */
RA.rooms=o=>{
 const max=o.max||20,el=o.el,q=s=>el.querySelector('[data-r="'+s+'"]');
 el.innerHTML='<p class="msg" data-r="msg" hidden></p>'+
  '<div class="list" data-r="home"><div class="row"><button class="go" data-r="create">CREATE ROOM</button><input data-r="code" maxlength="5" placeholder="CODE" aria-label="Room code" autocomplete="off"><button class="go" data-r="join">JOIN</button></div>'+
  '<p class="note online" data-r="who"></p><div class="list" data-r="rooms"></div><p class="note">'+(o.note||'')+'</p></div>'+
  '<div class="list" data-r="inroom" hidden><div class="row between"><div class="row"><span class="lbl">ROOM</span><span class="code" data-r="rcode"></span></div><button data-r="leave">LEAVE</button></div>'+
  '<div class="roster" data-r="roster"></div><div class="row" data-r="hostctl"><label>CPU players <select data-r="cpus"></select></label><label>CPU level <select data-r="lvl"><option value="0" selected>Easy</option><option value="1">Normal</option><option value="2">Hard</option></select></label><button class="go" data-r="start">START</button></div>'+
  '<label class="spec"><input type="checkbox" data-r="spec"> SPECTATE (watch, don&#39;t play)</label><p class="note" data-r="wait">Waiting for the host to start…</p>'+(o.controls?'<div class="ctlCard"><b>CONTROLS</b><p>'+o.controls+'</p></div>':'')+'</div>';
 q('cpus').innerHTML=Array.from({length:max},(_,i)=>'<option>'+i+'</option>').join('');q('cpus').value=String(o.cpus==null?1:o.cpus);
 const R={lobby:null,room:null,user:null,me:null,code:'',host:false,order:[],names:{},hostGone:0,lastB:0,lastL:0,lastSend:'',lastSendT:0,
  get online(){return!!R.room},cpuLevel:()=>+q('lvl').value};
 const msg=t=>{q('msg').textContent=t||'';q('msg').hidden=!t};R.msg=msg;
 const off=()=>{msg('Online play is not available here. Open this page signed in to claude.ai; friends need it shared with them.');q('create').disabled=q('join').disabled=true};
 function wantName(by){if(!R.user||R.names[by]!==undefined)return;R.names[by]='';
  R.user.profiles([by]).then(ps=>{R.names[by]=(ps&&ps[by]&&ps[by].name)||'';renderRoster();if(o.onNames)o.onNames()}).catch(()=>{})}
 R.name=(pe,i)=>{let n='';if(pe&&pe.presence&&typeof pe.presence.nm==='string')n=pe.presence.nm.replace(/[^\w .\-]/g,'').slice(0,12);
  if(!n&&pe&&pe.by){wantName(pe.by);n=(R.names[pe.by]||'').split(' ')[0]}
  if(!n)n='P'+(i+1);return n};
 R.peer=id=>R.room?R.room.peers().find(pe=>pe.peer===id)||null:null;
 R.look=id=>{const pe=R.peer(id);return RA.look.clean(pe&&pe.presence&&pe.presence.lk)};
 R.input=id=>{const pe=R.peer(id);return pe?pe.presence:null};
 R.hostPeer=()=>{if(!R.room)return null;const hs=R.room.peers().filter(pe=>pe.presence&&pe.presence.host===1&&pe.presence.g);return hs.sort((a,b)=>a.peer<b.peer?-1:1)[0]||null};
 R.watchers=()=>R.room?R.room.peers().filter(pe=>pe.presence&&pe.presence.j===1&&pe.presence.sp):[];
 R.roster=()=>{const ps=R.room.peers().filter(pe=>pe.kind==='viewer'&&pe.presence&&pe.presence.j===1&&!pe.presence.sp);
  for(const pe of ps)if(!R.order.includes(pe.peer))R.order.push(pe.peer);
  const me=ps.find(pe=>pe.sameTab),list=R.order.map(id=>ps.find(pe=>pe.peer===id)).filter(pe=>pe&&pe!==me);
  return(me?[me]:[]).concat(list).slice(0,max)};
 function renderRooms(){if(!R.lobby)return;
  const others=R.lobby.peers().filter(pe=>!pe.sameTab&&pe.kind==='viewer');
  const open=others.filter(pe=>pe.presence&&pe.presence.open&&pe.presence.open.gm===o.game&&typeof pe.presence.open.c==='string');
  setH(q('who'),RA.util.esc(others.length?others.length+' other player'+(others.length>1?'s':'')+' online: '+others.slice(0,30).map((pe,i)=>R.name(pe,i)).join(', '):'No other players online right now.'));
  setH(q('rooms'),open.length?open.map(pe=>{const x=pe.presence.open,c=String(x.c).replace(/[^A-Z0-9]/g,'').slice(0,5);
   return'<div class="room"><span>Room <b class="code">'+c+'</b> · '+Math.min(max,x.n|0)+'/'+max+' · '+(x.ph==='play'?'playing':'waiting')+'</span><button data-room="'+c+'">JOIN</button></div>'}).join('')
   :'<p class="note">No open rooms right now. Create one and share the code.</p>')}
 function renderRoster(){if(!R.room)return;let ids;const g=R.host?null:(R.hostPeer()||{presence:{}}).presence.g;
  if(R.host)ids=R.roster().map(pe=>pe.peer);else ids=g&&Array.isArray(g.r)?g.r:[];
  const cpus=R.host?+q('cpus').value:(g?g.cpu|0:0),all=R.room.peers();
  setH(q('roster'),ids.slice(0,max).map((id,i)=>{const pe=all.find(p=>p.peer===id),c=o.colors&&o.colors[i]?o.colors[i][1]:'#fcfcfc';
   return'<span style="color:'+c+'">'+RA.util.esc(R.name(pe,i))+(pe&&pe.sameTab?' (you)':'')+(i===0?' · host':'')+'</span>'}).join('')+
   (cpus?'<span class="note">+ '+Math.min(cpus,max-ids.length)+' CPU</span>':'')+
   (R.watchers().length?'<span class="note">👁 watching: '+R.watchers().map((pe,i)=>RA.util.esc(R.name(pe,i))).join(', ')+'</span>':''));
  if(q('hostctl').hidden!==!R.host)q('hostctl').hidden=!R.host;if(q('wait').hidden!==R.host)q('wait').hidden=R.host;
  {const t=!R.host&&!R.hostPeer()?'Looking for the host…':'Waiting for the host to start…';if(q('wait').textContent!==t)q('wait').textContent=t}}
 R.render=renderRoster;
 function changed(){if(!R.room)return;
  if(!R.host){const h=R.hostPeer();if(!h){if(!R.hostGone)R.hostGone=performance.now()}else R.hostGone=0;
   renderRoster();if(h&&o.onState)o.onState(h.presence.g);return}
  renderRoster();if(o.onPeers)o.onPeers()}
 R.init=async()=>{const n=await RA.net.connect();if(!n){off();return}
  R.lobby=RA.player.room(n.room);R.user=n.user;R.me=n.me;R.db=n.db;n.room.onPeers(renderRooms,()=>off());renderRooms()};
 R.enter=async(code,host)=>{code=RA.net.cleanCode(code);if(code.length<3){msg('Type the room code first.');return}
  if(!R.lobby){off();return}msg('');RA.audio.ensure();
  try{R.room=await R.lobby.join(o.game+'-'+code.toLowerCase())}catch(e){msg('Could not join that room ('+(e&&e.code||'error')+'). Try again.');return}
  Object.assign(R,{host,code,order:[],hostGone:0,lastSend:''});
  R.room.presence({j:1,sp:R.spec?1:null,nm:PLAYER.name||undefined,lk:RA.look(o.game)}).catch(()=>{});RA.player.room(R.room);
  R.room.onPeers(changed,()=>{msg('Lost the room connection.');R.leave()});
  q('home').hidden=true;q('inroom').hidden=false;q('rcode').textContent=code;renderRoster();if(o.onEnter)o.onEnter()};
 R.leave=async()=>{const r=R.room;R.room=null;if(r)RA.player.unroom(r);R.host=false;R.code='';
  try{R.lobby&&R.lobby.presence({open:null})}catch(e){}try{if(r)await r.leave()}catch(e){}
  q('home').hidden=false;q('inroom').hidden=true;if(o.onLeave)o.onLeave()};
 // host: share the game state (g) with the room and keep the room listed in the lobby
 R.broadcast=(now,g,inGame)=>{if(!R.host||!R.room)return;if(now-R.lastB<(inGame?50:300))return;R.lastB=now;
  const ids=R.roster().map(pe=>pe.peer);
  R.room.presence({host:1,g:g||{ph:'lobby',r:ids,cpu:+q('cpus').value}}).catch(()=>{});
  if(now-R.lastL>1500&&R.lobby){R.lastL=now;R.lobby.presence({open:{gm:o.game,c:R.code,n:ids.length,ph:inGame?'play':'lobby'}}).catch(()=>{})}};
 // everyone else: send my buttons (only when they change, at most every 50 ms unless urgent)
 R.send=(patch,now)=>{if(!R.room||R.host)return;const k=JSON.stringify(patch);if(k===R.lastSend)return;
  now=now||performance.now();if(now-R.lastSendT<40&&patch.i===undefined)return;R.lastSend=k;R.lastSendT=now;R.room.presence(patch).catch(()=>{})};
 // call once a frame: notices a host that vanished
 R.tick=now=>{if(R.room&&!R.host&&R.hostGone&&now-R.hostGone>4000){R.hostGone=0;msg('The host left the room.');R.leave()}};
 q('create').addEventListener('click',()=>R.enter(RA.net.newCode(),true));
 q('join').addEventListener('click',()=>R.enter(q('code').value,false));
 q('code').addEventListener('keydown',e=>{if(e.key==='Enter')R.enter(q('code').value,false)});
 q('rooms').addEventListener('click',e=>{const c=e.target.dataset&&e.target.dataset.room;if(c)R.enter(c,false)});
 q('leave').addEventListener('click',()=>R.leave());
 q('spec').addEventListener('change',e=>{R.spec=e.target.checked;if(R.room)R.room.presence({sp:R.spec?1:null}).catch(()=>{});renderRoster()});
 q('cpus').addEventListener('change',renderRoster);
 q('start').addEventListener('click',()=>{const r=R.roster(),cpus=Math.min(+q('cpus').value,max-r.length);
  if(r.length+cpus<(o.minPlayers||2)){msg('Need at least '+(o.minPlayers||2)+' players: wait for a friend or add a CPU.');return}
  msg('');o.onStart(r.map(pe=>({peer:pe.peer,me:pe.sameTab,cpu:false})).concat(Array.from({length:cpus},()=>({peer:'',me:false,cpu:true}))))});
 return R};

/* ---------- game loop: fixed 60 steps a second, one frame per screen refresh ---------- */
let last=performance.now(),acc=0;
function loop(now){acc+=Math.min(100,now-last);last=now;
 if(!cartOn&&cur){while(acc>=1000/60){if(cur.step)cur.step();acc-=1000/60}if(cur.frame)cur.frame(now)}else acc=0;
 RA.input.endFrame();
 requestAnimationFrame(loop)}

/* ---------- your nickname: picked in the main menu, used by every game, room and the chat ----------
   RA.player.name ('' until picked), RA.player.set(n), RA.player.onChange(fn). Kept on this device and,
   signed in, in your private 'profile' save so it follows you. Rooms show it through presence {nm}. */
const cleanNick=n=>String(n||'').replace(/[^\w .\-]/g,'').replace(/\s+/g,' ').trim().slice(0,12);
const PLAYER=RA.player=(()=>{const fns=[];let name='';
 try{name=cleanNick(localStorage.getItem('ra-nick')||localStorage.getItem('gb-nick')||'')}catch(e){}
 const P={get name(){return name},clean:cleanNick,onChange(f){fns.push(f)},
  set(n,quiet){n=cleanNick(n);if(!n||n===name)return name;name=n;try{localStorage.setItem('ra-nick',n);localStorage.setItem('gb-nick',n)}catch(e){}
   if(!quiet)RA.save('profile').set({name:n});fns.forEach(f=>{try{f(n)}catch(e){}});return n}};
 const S=RA.save('profile');if(!name&&S.data.name)name=cleanNick(S.data.name);
 S.ready.then(()=>{if(S.data.name&&S.data.name!==name)P.set(S.data.name,true);else if(name&&!S.data.name)S.set({name})});
 // tell every room we are in (lobby + game rooms) the new name
 P.onChange(n=>{for(const r of NICKROOMS)try{r.presence({nm:n}).catch(()=>{})}catch(e){}});
 return P})();
const NICKROOMS=new Set();
RA.player.room=r=>{if(r){NICKROOMS.add(r);if(PLAYER.name)r.presence({nm:PLAYER.name}).catch(()=>{})}return r};
RA.player.unroom=r=>NICKROOMS.delete(r);
// local seat labels: first human seat = your nickname, then P2.., CPU seats CPU n
RA.player.seats=ctrls=>{let h=0,c=0;return ctrls.map(k=>k==='cpu'?'CPU '+(++c):(h++?'P'+(h):(PLAYER.name||'P1')))};

/* ---------- side chat: one text chat for everyone on Retro Arena, open in the menu and in every game ----------
   C / the CHAT button opens it (Esc or ✕ closes). Messages go out on the shared lobby room's 'chat' topic,
   tagged with the game you are in; nothing is stored, so you see what was said while you were here. */
const CHAT={open:false,unread:0,room:null,log:[],last:0};
function chatEl(){return $('chat')}
function chatRender(m){const box=$('chatLog');if(!box)return;const row=document.createElement('div');row.className='cm'+(m.me?' me':'')+(m.sys?' sys':'');
 if(m.g){const t=document.createElement('span');t.className='cg';t.textContent=m.g;row.appendChild(t)}
 if(!m.sys){const n=document.createElement('b');n.textContent=m.n+':';row.appendChild(n)}
 const tx=document.createElement('span');tx.textContent=' '+m.t;row.appendChild(tx);
 const stick=box.scrollTop+box.clientHeight>=box.scrollHeight-24;box.appendChild(row);
 while(box.children.length>120)box.removeChild(box.firstChild);if(stick||m.me)box.scrollTop=box.scrollHeight}
function chatBadge(){const b=$('chatBtn');if(!b)return;b.textContent='CHAT'+(CHAT.unread?' ('+CHAT.unread+')':'');b.classList.toggle('new',CHAT.unread>0)}
function chatShow(on){CHAT.open=on;const el=chatEl();if(!el)return;el.hidden=!on;document.body.classList.toggle('chatting',on);held.clear();
 if(on){CHAT.unread=0;chatBadge();chatConnect();setTimeout(()=>{try{$('chatIn').focus({preventScroll:true})}catch(e){}},30)}
 else try{$('chatIn').blur()}catch(e){}}
async function chatConnect(){if(CHAT.room||CHAT.trying)return;CHAT.trying=1;
 const n=await RA.net.connect();CHAT.trying=0;
 if(!n||!n.room){if(!CHAT.warned){CHAT.warned=1;chatRender({sys:1,t:'Chat works when this page is opened signed in to claude.ai.'})}return}
 CHAT.room=RA.player.room(n.room);
 n.room.on('chat',m=>{const d=m.data||{};const t=String(d.t||'').slice(0,160).replace(/[\u0000-\u001f]/g,' ');if(!t.trim())return;
  chatRender({n:cleanNick(d.n)||'Player',t,g:String(d.g||'').replace(/[^\w .\-]/g,'').slice(0,16).toUpperCase(),me:m.sameTab});
  if(!m.sameTab&&!CHAT.open){CHAT.unread++;chatBadge()}},()=>{CHAT.room=null});
 chatRender({sys:1,t:'Connected. Say hi! Be nice, everyone here can read it.'})}
function chatSend(){const i=$('chatIn');if(!i)return;const t=i.value.trim().slice(0,160);if(!t)return;
 if(!PLAYER.name){chatRender({sys:1,t:'Pick a nickname in the main menu first.'});return}
 const now=performance.now();if(now-CHAT.last<700)return;CHAT.last=now;
 if(!CHAT.room){chatRender({sys:1,t:'Not connected, message not sent.'});chatConnect();return}
 i.value='';const g=!cartOn&&cur?cur.name:'MENU';
 CHAT.room.emit('chat',{n:PLAYER.name,t,g}).catch(e=>chatRender({sys:1,t:e&&e.code==='not_permitted'?'You can read the chat but not post in it here.':'Message not sent ('+(e&&e.code||'error')+').'}))}
function chatInit(){
 const btn=$('chatBtn'),el=chatEl();if(!btn||!el)return;
 btn.addEventListener('click',()=>chatShow(!CHAT.open));btn.addEventListener('mousedown',e=>e.preventDefault());
 $('chatX').addEventListener('click',()=>chatShow(false));
 $('chatForm').addEventListener('submit',e=>{e.preventDefault();chatSend()});
 $('chatIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();chatShow(false)}});
 $('chatIn').addEventListener('keyup',e=>e.stopPropagation());
 addEventListener('keydown',e=>{if(e.code==='KeyC'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();chatShow(!CHAT.open)}},true);
 chatConnect()}
RA.chat={show:chatShow,get open(){return CHAT.open}};

/* ---------- menu player card: nickname, title, achievements, who is online ---------- */
function cardInit(){const i=$('nickIn');if(!i)return;
 i.value=PLAYER.name;
 const commit=()=>{const n=PLAYER.set(i.value);i.value=n||PLAYER.name;card()};
 $('nickForm').addEventListener('submit',e=>{e.preventDefault();commit();i.blur();blip(990);toast('HELLO, '+PLAYER.name.toUpperCase())});
 i.addEventListener('blur',commit);i.addEventListener('keydown',e=>e.stopPropagation());
 PLAYER.onChange(n=>{if(document.activeElement!==i)i.value=n;card()});
 RA.net.connect().then(n=>{if(!n||!n.room)return;RA.player.room(n.room);n.room.onPeers(()=>{try{CHAT.peers=n.room.peers().filter(p=>p.kind!=='agent').length}catch(e){}card()})});
 card()}
function card(){const el=$('pstats');if(!el)return;let a=0,t=0,pl=0;
 for(const g of GAMES){const ac=ACHS[g.id];if(ac){a+=ac.count();t+=ac.defs.length}if(g.ready)pl+=RA.save(g.id).stats.played|0}
 $('pcard').classList.toggle('need',!PLAYER.name);
 const ti=RA.save('profile').data.title;
 setH(el,'<button type="button" class="achBtn" id="achBtn">★ '+a+'/'+t+' ACHIEVEMENTS</button><span>'+pl+' MATCHES</span>'+(CHAT.peers?'<span class="on">● '+CHAT.peers+' ONLINE</span>':'')+(ti?'<span class="ttl">“'+RA.util.esc(ti)+'”</span>':''))}
// Achievements & unlocks screen: every game's list, what you have, what it unlocked; pick a title to wear
function achOpen(){let m=$('achModal');if(!m){m=document.createElement('div');m.id='achModal';m.className='achModal';document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m||e.target.id==='achX'){m.hidden=true;return}const lb=e.target.closest('[data-look]');if(lb){const[g,k,v]=lb.dataset.look.split('|');RA.look.set(g,k,v);blip(880);achOpen();return}const b=e.target.closest('[data-title]');
   if(b){const v=b.dataset.title;RA.save('profile').set({title:RA.save('profile').data.title===v?'':v});blip(880);achOpen();card()}})}
 const cur=RA.save('profile').data.title||'';let titles=[];
 const sec=GAMES.filter(g=>ACHS[g.id]).map(g=>{const A=ACHS[g.id],L=A.list(),lock={},lk=RA.look(g.id);
  return '<section><h3>'+RA.util.esc(g.name)+' <small>'+A.count()+'/'+L.length+'</small></h3><ul>'+L.map(d=>{const us=[].concat(d.unlock||[]).map(String),un=us.join(' '),nm=us.map(u=>u.split(':').pop()).join(' + ');
   for(const u of us){const[k,v]=u.split(':');if(!d.got)continue;if(k==='title')titles.push(v);else (lock[k]=lock[k]||[]).push(v)}
   return '<li class="'+(d.got?'got':'')+'"><span class="st">'+(d.got?'★':'☆')+'</span><span><b>'+RA.util.esc(d.name)+'</b><i>'+RA.util.esc(d.desc||'')+'</i></span><em>'+(un?(d.got?'UNLOCKED: ':'REWARD: ')+RA.util.esc(nm):'')+(d.got?'<br>'+new Date(d.got).toLocaleDateString():'')+'</em></li>'}).join('')+'</ul>'+(Object.keys(lock).length?'<div class="achLocker"><b>EQUIP</b>'+Object.keys(lock).map(k=>'<span><i>'+RA.util.esc(k.toUpperCase())+'</i>'+['',...lock[k]].map(v=>'<button type="button" data-look="'+g.id+'|'+k+'|'+RA.util.esc(v)+'"'+((lk[k]||'')===v?' class="on"':'')+'>'+(v?RA.util.esc(v):'Default')+'</button>').join('')+'</span>').join('')+'</div>':'')+'</section>'}).join('');
 m.innerHTML='<div class="achBox"><div class="achHead"><h2>ACHIEVEMENTS & UNLOCKS</h2><button id="achX">✕</button></div>'+
  '<div class="achTitles"><b>YOUR TITLE</b> '+(titles.length?titles.map(t=>'<button type="button" data-title="'+RA.util.esc(t)+'"'+(t===cur?' class="on"':'')+'>'+RA.util.esc(t)+'</button>').join(''):'<span>Unlock titles by earning achievements.</span>')+'</div>'+sec+'</div>';
 m.hidden=false}
document.addEventListener('click',e=>{if(e.target&&e.target.id==='achBtn')achOpen()});

/* ---------- custom dropdowns: every <select> gets a RELOADED-style picker. The native popup on Windows closes or freezes
   whenever the page touches the DOM, so the real <select> stays hidden as the source of truth and fires 'change' as before. ---------- */
const RSEL=new Set();let rsOpen=null;
function rsClose(){if(rsOpen){rsOpen.list.remove();rsOpen.btn.classList.remove('open');rsOpen=null}}
function rsEnhance(sel){if(sel._rs||sel.multiple||sel.closest('.noRs'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='rsel';sel._rs=btn;sel.classList.add('rsHid');sel.after(btn);RSEL.add(sel);
 btn.addEventListener('mousedown',e=>e.preventDefault());
 btn.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(rsOpen&&rsOpen.sel===sel){if(performance.now()-rsOpen.t>250)rsClose();return}rsClose();if(sel.disabled)return;
  const list=document.createElement('div');list.className='rsList';
  list.innerHTML=[...sel.options].map((o,i)=>'<div class="rsOpt'+(i===sel.selectedIndex?' on':'')+(o.disabled?' dis':'')+'" data-i="'+i+'">'+RA.util.esc(o.textContent)+'</div>').join('');
  document.body.appendChild(list);const r=btn.getBoundingClientRect();list.style.minWidth=r.width+'px';
  const below=innerHeight-r.bottom;list.style.left=Math.min(r.left,innerWidth-list.offsetWidth-6)+'px';
  if(below<list.offsetHeight+8&&r.top>below){list.style.bottom=(innerHeight-r.top+2)+'px'}else list.style.top=(r.bottom+2)+'px';
  list.addEventListener('mousedown',e=>e.preventDefault());
  list.addEventListener('click',e=>{e.stopPropagation();const o=e.target.closest('.rsOpt');if(!o||o.classList.contains('dis'))return;
   const i=+o.dataset.i;rsClose();if(sel.selectedIndex!==i){sel.selectedIndex=i;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))}rsSync()});
  rsOpen={sel,btn,list,t:performance.now()};btn.classList.add('open');try{RA.audio.ensure&&blip(700)}catch(_){}});
 rsSync()}
function rsSync(){for(const sel of RSEL){const b=sel._rs;if(!sel.isConnected){b.remove();RSEL.delete(sel);continue}
 const o=sel.options[sel.selectedIndex],t=o?o.textContent:'';if(b.textContent!==t)b.textContent=t;if(b.disabled!==sel.disabled)b.disabled=sel.disabled;
 const h=sel.hidden||sel.style.display==='none';if(b.hidden!==h)b.hidden=h;if(b.title!==(sel.title||''))b.title=sel.title||''}
 if(rsOpen&&!rsOpen.btn.isConnected)rsClose()}
addEventListener('click',e=>{if(rsOpen&&(e.target===rsOpen.sel||rsOpen.btn.contains(e.target)||rsOpen.list.contains(e.target)))return;rsClose()});addEventListener('keydown',e=>{if(e.key==='Escape'&&rsOpen){rsClose();e.stopPropagation()}},true);
addEventListener('resize',rsClose);
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.tagName==='SELECT')rsEnhance(n);else n.querySelectorAll&&n.querySelectorAll('select').forEach(rsEnhance)}})
 .observe(document.documentElement,{childList:true,subtree:true});
document.querySelectorAll('select').forEach(rsEnhance);setInterval(rsSync,120);
RA.util.rsSync=rsSync;

/* ---------- multicart menu ---------- */
const GAMES=[];let sel=0,cartOn=true,cur=null,soonT=0,padPrev={};
const IC={k:'#000',w:'#fcfcfc',r:'#d82800',y:'#f8b800',g:'#00b800',d:'#005800',s:'#7c7c7c',p:'#f878f8',c:'#3cbcfc',o:'#e45c10',b:'#0058f8',n:'#ac7c00'};
// meta: {id, name, kind, players, desc, icon (10 rows of 10 letters, colours IC), ready, el (from RA.mount), enter(), leave(), step(), frame(now),
//        onKey(e), onEsc(), onQuit(), music: [tracks]}
RA.register=g=>{GAMES.push(g);if(g.music)music.add(g.id,g.music);return g};
// RA.mount(html): adds the game's page (hidden until picked) and wires its touch pad, ♪ (.ra-mus) and MENU (.ra-quit) buttons.
// Pass the returned element as el in RA.register so the menu shows and hides it.
RA.mount=html=>{const el=document.createElement('div');el.className='wrap';el.hidden=true;el.innerHTML=html;$('stage').appendChild(el);
 bindButtons(el);el.querySelectorAll('.dpad').forEach(bindDpad);
 el.querySelectorAll('.ra-mus').forEach(b=>{b.addEventListener('click',()=>music.toggle());b.addEventListener('mousedown',e=>e.preventDefault())});
 el.querySelectorAll('.ra-quit').forEach(b=>{b.addEventListener('click',hud.quitPressed);b.addEventListener('mousedown',e=>e.preventDefault())});
 return el};
RA.icons=IC;
function drawIcon(c,i){const x=c.getContext('2d');x.clearRect(0,0,10,10);blit(x,GAMES[i].icon||[],0,0,IC)}
function blurb(soon){const g=GAMES[sel];
 $('blurb').innerHTML='<canvas width="10" height="10" aria-hidden="true"></canvas><div><div class="tags"><span class="chip2'+(g.ready?'':' soonC')+'">'+(g.ready?'READY':'SOON')+'</span><span class="chip2">'+g.kind.toUpperCase()+'</span><span class="chip2">'+g.players.toUpperCase()+'</span></div><span'+(soon?' class="soonMsg"':'')+'>'+(soon?'Coming soon. This cartridge is still being made.':g.desc)+'</span>'+(g.ready?saveLine(g):'')+'</div>';
 drawIcon($('blurb').querySelector('canvas'),sel)}
const title=S=>{const a=S.data.ach||{},u=S.data.unlocks||{},ach=ACHS[S.id];if(!ach)return '';let best='',bt=0;
 for(const d of ach.defs)if(a[d.id]>bt&&d.unlock&&/^title:/.test(d.unlock)&&u[d.unlock]){bt=a[d.id];best=d.unlock.slice(6)}return best?'"'+best.toUpperCase()+'"':''};
function saveLine(g){const S=RA.save(g.id),s=S.stats;
 if(!S._menu){S._menu=1;S.onChange(()=>{if(cartOn&&GAMES[sel]===g)blurb(false);card()})}
 return '<span class="saveln">SAVE · '+(s.played?(s.played|0)+' played · '+(s.wins|0)+' wins'+(s.bestScore?' · best '+s.bestScore:''):'empty, play a match to start it')+(ACHS[g.id]?' · ★ '+ACHS[g.id].count()+'/'+ACHS[g.id].defs.length:'')+(title(S)?' · '+title(S):'')+(S.online?' · synced':'')+'</span>'}
function pick(i,sound){const n=GAMES.length;i=((i%n)+n)%n;if(i!==sel&&sound)blip(660);sel=i;
 GAMES.forEach((_,j)=>$('g'+j).classList.toggle('sel',j===sel));blurb(false)}
function launch(i){pick(i,false);const g=GAMES[sel];
 if(!g.ready){blip(150);blurb(true);clearTimeout(soonT);soonT=setTimeout(()=>blurb(false),1800);return}
 if(!PLAYER.name){blip(150);$('pcard').classList.add('need','shake');setTimeout(()=>$('pcard').classList.remove('shake'),500);try{$('nickIn').focus()}catch(e){}return}
 blip(990);showCart(false)}
function showCart(on){
 if(on&&cur&&!cartOn){if(cur.leave)cur.leave();if(cur.el)cur.el.hidden=true}
 cartOn=on;$('cart').hidden=!on;$('cartMus').hidden=!on;held.clear();document.body.classList.toggle('incart',on);
 if(on){music.play('menu',0);try{$('g'+sel).focus({preventScroll:true})}catch(e){}}
 else{cur=GAMES[sel];if(cur.el)cur.el.hidden=false;if(cur.enter)cur.enter()}}
RA.menu={show:()=>showCart(true),get open(){return cartOn},get current(){return cur}};
RA.boot=()=>{
 bindButtons(document);
 {const w=document.createElement('div');w.className='raVer';w.setAttribute('aria-hidden','true');w.textContent='RETRO ARENA '+RA.VERSION;document.body.appendChild(w)}
 $('cartSub').textContent=GAMES.length+' IN 1 · UP TO 20 PLAYERS';
 $('games').innerHTML=GAMES.map((g,i)=>'<li><button id="g'+i+'"'+(g.ready?'':' class="soon"')+'><span class="cur">►</span><canvas width="10" height="10" data-ic="'+i+'" aria-hidden="true"></canvas><span class="no">'+String(i+1).padStart(2,'0')+'.</span><span class="nm">'+g.name+'</span>'+(g.ready?'':'<span class="tag">SOON</span>')+'</button></li>').join('');
 document.querySelectorAll('#games canvas').forEach(c=>drawIcon(c,+c.dataset.ic));
 $('games').addEventListener('click',e=>{const b=e.target.closest('button');if(b)launch(+b.id.slice(1))});
 $('games').addEventListener('pointerover',e=>{const b=e.target.closest('button');if(b&&e.pointerType==='mouse')pick(+b.id.slice(1),true)});
 {const box=$('sound');if(box){const V=RA.audio.vol;
 const paint=()=>{box.querySelectorAll('input[data-v]').forEach(i=>{i.value=V[i.dataset.v];i.nextElementSibling.textContent=V[i.dataset.v]});
  $('sndMute').textContent=V.mute?'UNMUTE':'MUTE ALL';$('sndMute').classList.toggle('on',V.mute);$('sndMus').textContent=music.on?'MUSIC ON':'MUSIC OFF'};
 box.querySelectorAll('input[data-v]').forEach(i=>i.addEventListener('input',()=>{ensure();RA.audio.setVol(i.dataset.v,+i.value);paint()}));
 box.querySelectorAll('input[data-v]').forEach(i=>i.addEventListener('change',()=>{if(i.dataset.v!=='music')blip(660)}));
 $('sndMute').addEventListener('click',()=>{ensure();RA.audio.setVol('mute',!V.mute);paint()});
 $('sndMus').addEventListener('click',()=>{music.toggle();setTimeout(paint,0)});
 $('sndTest').addEventListener('click',()=>{ensure();sfx('boom',1)});paint()}}
const cm=$('cartMus');if(cm){cm.addEventListener('click',()=>music.toggle());cm.addEventListener('mousedown',e=>e.preventDefault())}
 music.label();pick(0,false);showCart(true);requestAnimationFrame(loop);cardInit();chatInit();
 (function padLoop(){if(cartOn){const p=pad(0),pr=padPrev;
   if(p.up&&!pr.up)pick(sel-1,true);if(p.down&&!pr.down)pick(sel+1,true);
   if((p.a&&!pr.a)||(p.b&&!pr.b)||(p.start&&!pr.start))launch(sel);padPrev=p}
  else{const p=pad(0),pr=padPrev;  // in a game: Start = Esc (menu), Back = chat
   if(p.start&&!pr.start)dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
   if(p.back&&!pr.back){try{chatShow(true)}catch(e){}}padPrev=p}
  {const p=pad(0);if(Object.keys(p).some(k=>p[k]===true)||Math.hypot(p.ax||0,p.ay||0,p.rx||0,p.ry||0)>.5)setDev('pad')}
  requestAnimationFrame(padLoop)})();
};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;
 if(cartOn){if(e.repeat&&!/Arrow|Key[WASD]/.test(e.code))return;
  const cols=getComputedStyle($('games')).gridTemplateColumns.split(' ').length;
  const mv={ArrowUp:-cols,KeyW:-cols,ArrowDown:cols,KeyS:cols,ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1}[e.code];
  if(mv){e.preventDefault();pick(sel+mv,true);$('g'+sel).focus({preventScroll:true});return}
  if(e.code==='Enter'||e.code==='Space'||e.code==='KeyE'){e.preventDefault();launch(sel);return}}
 if(e.repeat)return;
 // M music on/off, N next track, Esc: the game first (close a panel...), otherwise the MENU / QUIT? button
 if(e.code==='KeyM'){music.toggle();return}
 if(e.code==='KeyN'){music.next();return}
 if(e.code==='Escape'&&!cartOn&&cur&&document.body.classList.contains('playing')){e.preventDefault();if(cur.onEsc&&cur.onEsc())return;hud.quitPressed()}});
})();
