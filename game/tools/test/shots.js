// Screenshots at chosen steps while seat 0 plays with the game's own CPU brain (window.__xx.bot): good for checking
// how a level / track / mode looks in real play. Writes out/<name>-<step>.png
// node shots.js <gameId> <players> <name> <steps e.g. 300,900> [mode=0] [settingsJSON] [humans=1]
const {browser,openGame,startLocal,arg}=require('./lib');const fs=require('fs');
(async()=>{const id=arg(0),n=+arg(1,4),name=arg(2,id),steps=arg(3,'300').split(',').map(Number),mode=+arg(4,0),settings=JSON.parse(arg(5,'{}')),humans=+arg(6,1);
 fs.mkdirSync('out',{recursive:true});const b=await browser();const{pg,errs,P}=await openGame(b,id);await startLocal(pg,P,{n,mode,settings,humans});await pg.waitForTimeout(300);
 if(process.env.SETUP)await pg.evaluate(process.env.SETUP);let at=0;for(const s of steps){await pg.evaluate(([P,k])=>{const G=RA.menu.current,H=Object.values(window).find(v=>v&&v.K&&v.bot&&v.K.root===G.el)||window.__mj;
   const KEY={tap:'Space',left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',fire:'Space',alt:'KeyE',b3:'KeyQ',b4:'ShiftLeft'};let hold=new Set();
   RA.input.keys=map=>{const o={};for(const c in map)if(hold.has(c))o[map[c]]=true;return o};
   for(let j=0;j<k;j++){hold=new Set();const o=H.bot(0)||{};for(const c in o)if(o[c]&&KEY[c])hold.add(KEY[c]);G.step()}G.frame(performance.now())},[P,s-at]);at=s;
  await pg.screenshot({path:'out/'+name+'-'+s+'.png'})}
 console.log('shots done',errs.slice(0,5).join(' | ')||'NO ERRORS');await b.close()})();
