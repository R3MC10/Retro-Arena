// Reproducible balance/novice probes and visual QA; uses the standard harness.
const {browser,openGame,startLocal}=require('./lib'),fs=require('fs');
fs.mkdirSync('out/goal',{recursive:true});
(async()=>{const b=await browser();try{
 if(['balance','novice','skilled','lazy'].includes(process.argv[2])){
 const novice=process.argv[2]!=='balance',style=process.argv[2],results=[];
 for(const n of novice?[8]:[8,20]){const {pg,P,errs}=await openGame(b,'goal-3');await startLocal(pg,P,{n,humans:novice?1:0,cpu:0});
 const rows=await pg.evaluate(([P,novice,style])=>{const H=__goal,K=H.K,G=RA.menu.current,out=[];let hold=new Set();RA.input.keys=map=>{const o={};for(const k in map)if(hold.has(k))o[map[k]]=true;return o};const keys={left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',fire:'Space',alt:'KeyE',b3:'KeyQ'};
 for(let run=0;run<10;run++){const seed=19300+run,save=Math.random;Math.random=()=>seed/1e9;K.startLocal();Math.random=save;if(style==='skilled')K.cpu=1;let j=0,queue=[],drop={},r=RA.util.mulberry(seed+123),peak=0;
 for(;j<26000&&K.state!=='over';j++){hold=new Set();if(novice){const old=K.cpu;K.cpu=1;let cmd=H.bot(0);K.cpu=old;
 // Brain describes world directions; local Blue is mirrored by the game.
 const p=H.pl.find(p=>p.i===0),w=H.worlds[p.w];if(w.teams.indexOf(p.team)===1)cmd={...cmd,left:cmd.right,right:cmd.left};queue.push(cmd);cmd=queue.length>(style==='novice'?8:0)?queue.shift():{};if(style==='lazy')cmd={fire:j%90<50};
 for(const k in cmd){if(!cmd[k]){drop[k]=false;continue}if(['fire','alt','b3'].includes(k)){if(drop[k]==null||drop[k]===false)drop[k]=r()<(style==='novice'?.3:0)?'miss':'hit';if(drop[k]==='miss')continue}if(keys[k])hold.add(keys[k])}}
 G.step();if(j%60===0)peak=Math.max(peak,JSON.stringify(K.snapshot()).length)}out.push({seed,steps:j,over:K.state==='over',winner:K.winner,score:H.scores.slice(),peak,goals:H.pl.find(p=>p.i===0).goals})}return out},[P,novice,style]);results.push({n,errs,rows});console.log(JSON.stringify({n,rows,errs}));await pg.close()}
 fs.writeFileSync('out/goal/'+style+'.json',JSON.stringify(results,null,2));
 }else if(process.argv[2]==='visual'){
 for(const [width,height,dpr]of[[1280,720,1],[2560,1440,1],[1536,864,1.25]])for(const mode of[0,1,2]){
 process.env.VW=width;process.env.VH=height;process.env.DPR=dpr;const{pg,P,errs}=await openGame(b,'goal-3');await startLocal(pg,P,{n:20,humans:1,mode,cpu:0});
 await pg.evaluate(()=>{const H=__goal,G=RA.menu.current;RA.input.keys=map=>{const o={},cmd=H.bot(0);for(const k in map){if(cmd[map[k]])o[map[k]]=true}return o};for(let j=0;j<900;j++)G.step();G.frame(performance.now())});await pg.screenshot({path:`out/goal/m${mode}-${width}.png`});console.log('SHOT',mode,width,errs);await pg.close()}
 }else throw Error('Use balance | novice | visual');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
