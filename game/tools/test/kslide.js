const {browser,openGame,startLocal}=require('./lib');
(async()=>{const b=await browser();const{pg,errs,P}=await openGame(b,'kick');await startLocal(pg,P,{n:4,humans:1,mode:0});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const G=RA.menu.current,H=Object.values(window).find(v=>v&&v.K&&v.bot&&v.K.root===G.el);let hold=new Set();
  RA.input.keys=map=>{const o={};for(const c in map)if(hold.has(c))o[map[c]]=true;return o};const log=[];
  const pl=()=>H.pl||H.players||null;
  for(let n=0;n<3000;n++){hold=new Set();if(n%150===100)hold.add('KeyQ');G.step();
   const P=window.__pk||H;const list=(P.pl||[]);const lying=list.filter(p=>p.st&&p.st!=='').map(p=>p.n+':'+p.st+':'+p.stT);if(n%25===0&&lying.length)log.push(n+' '+lying.join(' '))}
  return{keys:Object.keys(H),log:log.slice(0,40)}});
 console.log(JSON.stringify(r.keys));for(const l of r.log)console.log(l);console.log(errs.slice(0,3).join('|')||'NO ERRORS');await b.close()})();
