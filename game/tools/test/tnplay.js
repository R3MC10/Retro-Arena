// Simulated players for seat 0 against CPUs, at full speed:
//   skilled = plays with the game's own CPU brain (window.__xx.bot) through the keyboard
//   lazy    = wanders left/right and mashes the main button (what a new player does in the first minute)
// node players.js <gameId> <players> <skilled|lazy> [maxSteps=20000] [reportExpr] [mode=0] [settingsJSON]
const {browser,openGame,startLocal,arg}=require('./lib');
(async()=>{const id=arg(0),n=+arg(1,8),style=arg(2,'skilled'),max=+arg(3,20000),expr=arg(4,'0'),mode=+arg(5,0),settings=JSON.parse(arg(6,'{}'));
 const b=await browser();const{pg,errs,P}=await openGame(b,id);await startLocal(pg,P,{n,mode,settings});await pg.waitForTimeout(300);
 const r=await pg.evaluate(([P,style,max,expr])=>{window.__tn.lv=+style;const G=RA.menu.current,H=Object.values(window).find(v=>v&&v.K&&v.bot&&v.K.root===G.el),K=H.K;
  const KEY={left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',fire:'Space',alt:'KeyE',b3:'KeyQ',b4:'ShiftLeft'};let hold=new Set();
  RA.input.keys=map=>{const o={};for(const k in map)if(hold.has(k))o[map[k]]=true;return o};
  const over=()=>!document.getElementById(P+'Over').hidden;let n=0,dir='KeyD';
  for(;n<max;n++){hold=new Set();if(true){const o=H.bot(0)||{};for(const k in o)if(o[k]&&KEY[k])hold.add(KEY[k])}
   else{if(n%120===0)dir=Math.random()<.5?'KeyA':'KeyD';if(n%200<150)hold.add(dir);if((n>>3)&1)hold.add('Space')}
   G.step();if(over())break}
  return{steps:n,over:over(),win:document.getElementById(P+'Win').textContent,ranks:document.getElementById(P+'Ranks').innerText.split('\n').slice(0,6).join(' | '),me:eval(expr)}},[P,style,max,expr]);
 console.log(style,JSON.stringify(r),errs.slice(0,3).join(' | ')||'NO ERRORS');await b.close()})();
