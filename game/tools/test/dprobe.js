// Super Dash Bros level probe: node dprobe.js <level> [players=6] [steps=9000] [humans=0]   (CPU=0|1|2)
const {browser,openGame,startLocal,arg}=require('./lib');
(async()=>{const li=+arg(0,0),n=+arg(1,6),max=+arg(2,9000),hum=+arg(3,0);const b=await browser();const{pg,errs,P}=await openGame(b,'dash');await startLocal(pg,P,{n,humans:hum,settings:{level:li}});await pg.waitForTimeout(300);
 const r=await pg.evaluate(([max])=>{const G=RA.menu.current,D=window.__db,over=()=>!document.getElementById(RA.menu.current.el.id||'x')&&false;let n=0;const stall={};
  for(;n<max;n++){G.step();if(n%120===0)for(const h of D.heroes){const k=h.i;if(h.fin)continue;const s=stall[k]||(stall[k]={x:h.x,t:0,max:0,at:0});if(Math.abs(h.x-s.x)<8){s.t+=120;if(s.t>s.max){s.max=s.t;s.at=Math.round(h.x)}}else{s.t=0;s.x=h.x}}
   if(D.heroes.every(h=>h.fin))break}
  return{state:D.K.state,tk:D.K.tick,dl:D.heroes.map(h=>(h.dl||[]).join(' ')),st:D.heroes.filter(h=>!h.fin).map(h=>({x:Math.round(h.x),y:Math.round(h.y),gr:h.gr,lift:h.lift,vx:h.vx.toFixed(2),big:h.big,stun:h.stun,o:JSON.stringify(D.bot(h.i))})),lv:D.lv.name,W:D.lv.W*16,steps:n,res:D.heroes.map(h=>h.fin?'F'+(h.ft/60).toFixed(1)+'d'+h.deaths:'x'+Math.round(h.x)+'d'+h.deaths),stall:Object.values(stall).map(s=>s.max>=600?s.at+'('+s.max/60+'s)':'').filter(Boolean)}},[max]);
 await pg.screenshot({path:'out/dprobe.png'});console.log(JSON.stringify(r),errs.slice(0,2).join('|'));await b.close()})();
