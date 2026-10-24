// Smoke test: lobby + a local match with seat 0 holding keys; screenshots into ./out
// node smoke.js <gameId> [seconds=6] [players=4] [mode=0] [keys=Space]
const {browser,openGame,startLocal,arg}=require('./lib');const fs=require('fs');
(async()=>{const id=arg(0),secs=+arg(1,6),n=+arg(2,4),mode=+arg(3,0),keys=arg(4,'Space').split(',');fs.mkdirSync('out',{recursive:true});
 const b=await browser();const{pg,errs,P}=await openGame(b,id);await pg.screenshot({path:'out/'+id+'-lobby.png'});
 await startLocal(pg,P,{n,mode});for(const k of keys)await pg.keyboard.down(k);
 for(let s=0;s<3;s++){await pg.waitForTimeout(secs*1000/3);await pg.screenshot({path:'out/'+id+'-play'+s+'.png'})}
 console.log(errs.length?errs.slice(0,10).join('\n'):'NO ERRORS');await b.close()})();
