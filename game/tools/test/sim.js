// Fast simulation: steps the match as fast as possible until the results screen, all seats CPU unless humans>0.
// Prints steps, winner, the top of the results, frame times, snapshot size, and an optional expression.
// node sim.js <gameId> [mode=0] [players=8] [maxSteps=20000] [humans=0] [screenshot.png] [expr]
const {browser,openGame,startLocal,arg}=require('./lib');
(async()=>{const id=arg(0),mode=+arg(1,0),n=+arg(2,8),max=+arg(3,20000),hum=+arg(4,0),shot=arg(5,''),expr=arg(6,'0');
 const b=await browser();const{pg,errs,P}=await openGame(b,id);await startLocal(pg,P,{n,humans:hum,mode});await pg.waitForTimeout(300);
 const r=await pg.evaluate(([P,max,expr])=>{const G=RA.menu.current,over=()=>!document.getElementById(P+'Over').hidden,ft=[];let n=0;
  for(;n<max;n++){G.step();if(n%300===0){const t=performance.now();G.frame(t);ft.push(+(performance.now()-t).toFixed(1))}if(over())break}
  let snap=0;try{const v=Object.values(window).find(v=>v&&v.K&&v.K.snapshot&&v.K.root===G.el);if(v)snap=JSON.stringify(v.K.snapshot()).length}catch(e){}
  return{steps:n,over:over(),win:document.getElementById(P+'Win').textContent,ranks:document.getElementById(P+'Ranks').innerText.split('\n').slice(0,9).join(' | '),frameMs:ft.slice(0,12).join(','),snapBytes:snap,extra:eval(expr)}},[P,max,expr]);
 console.log(JSON.stringify(r));if(shot)await pg.screenshot({path:shot});console.log(errs.length?errs.slice(0,8).join('\n'):'NO ERRORS');await b.close()})();
