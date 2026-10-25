// tennis rally probe: node tnprobe.js <players> <steps> [mode] [humans] [cpu]
const {browser,openGame,startLocal,arg}=require('./lib');
(async()=>{const n=+arg(0,2),max=+arg(1,20000),mode=+arg(2,0),hum=+arg(3,0);
 const b=await browser();const{pg,errs,P}=await openGame(b,'tennis');await startLocal(pg,P,{n,humans:hum,mode});await pg.waitForTimeout(300);
 const r=await pg.evaluate(([P,max])=>{const G=RA.menu.current,T=window.__tn,over=()=>!document.getElementById(P+'Over').hidden;const st={};let n=0;const pts=[],calls={},hitsBy={};
  for(;n<max;n++){G.step();for(const c of T.courts){const s=st[c.k]||(st[c.k]={sq:c.ball.sq,hits:0,t0:T.K.tick,call:c.callT});
    if(c.ball.sq!==s.sq){s.sq=c.ball.sq;if(!c.ball.held){s.hits++;const k=c.ball.by;hitsBy[k]=(hitsBy[k]||0)+1}}
    if(c.callT!==s.call){s.call=c.callT;const cl=c.call.split('  ')[0].replace(/GAME .*/,'GAME');calls[cl]=(calls[cl]||0)+1;if(!/GAME/.test(c.call)){pts.push([s.hits,T.K.tick-s.t0])}s.hits=0;s.t0=T.K.tick}}
   if(over())break}
  const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):0;
  return{steps:n,over:over(),win:document.getElementById(P+'Win').textContent,ranks:document.getElementById(P+'Ranks').innerText.split('\n').slice(0,6).join(' | '),points:pts.length,avgShots:avg(pts.map(p=>p[0])),avgTicks:avg(pts.map(p=>p[1])),calls,hitsBy,
   hist:pts.slice(0,40).map(p=>p[0]).join(',')}},[P,max]);
 console.log(JSON.stringify(r));console.log(errs.length?errs.slice(0,8).join('\n'):'NO ERRORS');await b.close()})();
