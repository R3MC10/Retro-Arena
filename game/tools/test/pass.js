// Test-pass probe for RA.kit games: every mode at 8 and 20 seats (end, winner, peak snapshot, frame time, deaths),
// then online host + guest: guest moves, host sees it, host moves, guest sees it, guest leaves -> out on the host.
// node pass.js <id> [sim|online|all]   (serve game/ on 8765; PLAYWRIGHT_BROWSERS_PATH=out/browsers)
const {browser,openGame,startLocal}=require('./lib'),fs=require('fs');
const HOOK={'chip-n-dale':'__chip','adventure-island':'__atoll','big-nose':'__snout','lunar-ball':'__moon','circus-charlie':'__circus','rad-racer':'__rad','f-1-race':'__f1',karts:'__tk',excite:'__eb',tiny:'__tt',icepeak:'__ip',dash:'__db',jungle:'__jf',kick:'__pk',tennis:'__tn',track:'__tf',skyaces:'__sa',surv:'__ns',
 worms:'__wm',tanks:'__bc',blast:'__bm',pacman:'__pm',galaxian:'__gx',duckhunt:'__dh',arkanoid:'__ak',tetris:'__testTetris',drmario:'__dm',jewels:'__mj',snake:'__sn'};
const id=process.argv[2],what=process.argv[3]||'all',out='out/pass/'+id;fs.mkdirSync(out,{recursive:true});
// the per-seat list: the hook's first array whose items carry a seat index
const seatsJs=`(()=>{const H=window[HK];for(const k of Object.keys(H)){let v;try{v=H[k]}catch(e){continue}if(Array.isArray(v)&&v.length&&typeof v[0]==='object'&&v[0]&&('i' in v[0]||'seat' in v[0]||'idx' in v[0]))return v}return[]})()`;
async function sims(){const b=await browser();const res=[];try{
 for(const n of [8,20]){let modes=1;for(let m=0;m<modes;m++){const{pg,P,errs}=await openGame(b,id);
  modes=await pg.evaluate(P=>document.querySelectorAll('#'+P+'Modes [data-m]').length||1,P);
  await startLocal(pg,P,{n,humans:0,mode:m});await pg.waitForTimeout(300);
  const r=await pg.evaluate(([P,HK,seatsJs])=>{const H=window[HK],K=H.K,G=RA.menu.current,seats=()=>eval(seatsJs);let peak=0,ft=[],j=0;
   const over=()=>!document.getElementById(P+'Over').hidden;
   for(;j<60000&&!over();j++){G.step();if(j%60===0){const s=JSON.stringify(K.snapshot()).length;if(s>peak)peak=s}if(j%300===0){const t=performance.now();G.frame(t);ft.push(performance.now()-t)}}
   ft.sort((a,b)=>a-b);return{steps:j,min:+(j/3600).toFixed(1),over:over(),win:document.getElementById(P+'Win').textContent,
    first:(document.getElementById(P+'Ranks').innerText.split('\n').slice(0,3).join(' ')),peak,ftMed:+ft[ft.length>>1].toFixed(1),ftMax:+ft[ft.length-1].toFixed(1)}},[P,HOOK[id],seatsJs]);
  r.n=n;r.mode=m;r.errs=errs.slice(0,5);res.push(r);console.log(JSON.stringify(r));await pg.close()}}
 }finally{await b.close()}fs.writeFileSync(out+'/sims.json',JSON.stringify(res,null,1))}
async function online(){const b=await browser();try{const ctx=await b.newContext();await ctx.addInitScript(fs.readFileSync(__dirname+'/fakenet.js','utf8'));
 const h=await openGame(b,id,{ctx,name:'Host'}),g=await openGame(b,id,{ctx,name:'Guest'}),H=h.pg,G=g.pg,P=h.P;
 await H.evaluate(P=>document.querySelector('#'+P+'Online [data-r="create"]').click(),P);await H.waitForTimeout(1500);
 const code=await H.evaluate(P=>document.querySelector('#'+P+'Online [data-r="rcode"]').textContent,P);
 await G.evaluate(([P,c])=>{document.querySelector('#'+P+'Online [data-r="code"]').value=c;document.querySelector('#'+P+'Online [data-r="join"]').click()},[P,code]);await G.waitForTimeout(2500);
 await H.evaluate(P=>{const c=document.querySelector('#'+P+'Online [data-r="cpus"]');c.value='1';c.dispatchEvent(new Event('change'));document.querySelector('#'+P+'Online [data-r="start"]').click()},P);await G.waitForTimeout(4500);
 const read=pg=>pg.evaluate(([HK,seatsJs])=>{const K=window[HK].K;return{idx:K.myIdx,state:K.state,ctrl:K.seats.map(x=>x.ctrl),s:eval(seatsJs).map(o=>({x:Math.round(o.x??o.d??o.cx??0),y:Math.round(o.y??o.z??o.cy??0),alive:o.alive,out:o.out,dead:o.dead}))}},[HOOK[id],seatsJs]);
 const hold=async pg=>{await pg.bringToFront();await pg.evaluate(()=>document.activeElement&&document.activeElement.blur());for(const k of ['KeyD','KeyW','Space'])await pg.keyboard.down(k);await pg.waitForTimeout(1200);for(const k of ['KeyD','KeyW','Space'])await pg.keyboard.up(k);await pg.waitForTimeout(600)};
 const r={b:{h:await read(H),g:await read(G)}};await hold(G);r.ga={h:await read(H),g:await read(G)};await hold(H);r.ha={h:await read(H),g:await read(G)};
 await G.screenshot({path:out+'/guest.png'});await H.screenshot({path:out+'/host.png'});
 await G.evaluate(HK=>window[HK].K.R.leave(),HOOK[id]);await H.waitForTimeout(2500);r.leave=await read(H);await H.waitForTimeout(2500);r.leave2=await read(H);
 const gi=r.b.g.idx,p=(x,i)=>x.s[i]?x.s[i].x+','+x.s[i].y:'-';
 console.log(JSON.stringify({guestIdx:gi,guest:p(r.b.g,gi)+' -> '+p(r.ga.g,gi),hostSeesGuest:p(r.ga.h,gi),host:p(r.b.h,0)+' -> '+p(r.ha.h,0),guestSeesHost:p(r.ha.g,0),
  leaverOnHost:r.leave.s[gi],leaverCtrl:r.leave.ctrl[gi],leaverLater:p(r.leave2,gi),errs:[...h.errs,...g.errs].slice(0,6)}));fs.writeFileSync(out+'/online.json',JSON.stringify(r,null,1))}finally{await b.close()}}
(async()=>{if(what!=='online')await sims();if(what!=='sim')await online()})().catch(e=>{console.log('FAIL',e.stack);process.exit(1)});
