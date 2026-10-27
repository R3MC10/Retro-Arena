// A beginner for seat 0 in any game: the game's own brain (window.__xx.bot) through the keyboard, but reacting
// DELAY steps late and missing DROP of the button presses. Prints seat 0's place. CPU=0|1|2 sets the CPU level.
// node novice.js <gameId> <players> [delay=10] [drop=.3] [maxSteps=30000] [mode=0] [settingsJSON]
const {browser,openGame,startLocal,arg}=require('./lib');
(async()=>{const id=arg(0),n=+arg(1,4),delay=+arg(2,10),drop=+arg(3,.3),max=+arg(4,30000),mode=+arg(5,0),settings=JSON.parse(arg(6,'{}'));
 const b=await browser();const{pg,errs,P}=await openGame(b,id);await startLocal(pg,P,{n,mode,settings});await pg.waitForTimeout(300);
 const r=await pg.evaluate(([P,delay,drop,max,brain])=>{const G=RA.menu.current,H=Object.values(window).find(v=>v&&v.K&&v.bot&&v.K.root===G.el)||window.__mj;
  const KEY={tap:'Space',left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',fire:'Space',alt:'KeyE',b3:'KeyQ',b4:'ShiftLeft'};let hold=new Set();const q=[];const miss={};
  RA.input.keys=map=>{const o={};for(const k in map)if(hold.has(k))o[map[k]]=true;return o};
  const over=()=>!document.getElementById(P+'Over').hidden;let n=0;
  for(;n<max;n++){const cpu=H.K&&H.K.cpu,b=H.boards&&H.boards[0],bc=b&&b.cpu;if(brain>=0){if(H.K)H.K.cpu=brain;else b.cpu=[{react:14,noise:60,drop:0},{react:7,noise:18,drop:.3},{react:3,noise:3,drop:.8}][brain]}q.push(H.bot(0)||{});if(H.K)H.K.cpu=cpu;else if(b)b.cpu=bc;const o=q.length>delay?q.shift():{};hold=new Set();
   for(const k in o){if(!o[k]||!KEY[k])continue;if(k==='fire'||k==='alt'||k==='b3'){if(miss[k]==null)miss[k]=Math.random()<drop;if(miss[k])continue}hold.add(KEY[k])}
   for(const k of['fire','alt','b3'])if(!o[k])miss[k]=null;G.step();if(over())break}
  const rk=document.getElementById(P+'Ranks').innerText.split('\n').filter(x=>x.trim());const names=rk.filter((x,i)=>i%3===1);
  const ti=rk.indexOf('Tester');return{steps:n,over:over(),win:document.getElementById(P+'Win').textContent,place:names.indexOf('Tester')+1,of:names.length,me:rk[ti+1],best:rk[2],x:window.__db?__db.heroes.map(h=>h.deaths+'d'+(h.dl||[]).join(',')):0}},[P,delay,drop,max,process.env.BRAIN==null?-1:+process.env.BRAIN]);
 console.log(id,JSON.stringify(r),errs.slice(0,2).join(' | ')||'');await b.close()})();
