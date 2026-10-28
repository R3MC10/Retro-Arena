// Reproducible balance sample. RA_URL=... node chip-balance.cjs war|novice [label]
const {browser,openGame,startLocal}=require('./lib'),fs=require('fs');
(async()=>{const kind=process.argv[2]||'war',label=process.argv[3]||'final',b=await browser(),rows=[];
try{const {pg,P,errs}=await openGame(b,'chip-n-dale');
for(const n of kind==='war'?[8,20]:[4])for(let run=0;run<(kind==='war'?10:6);run++){
 const seed=1009+run*7919;
 await startLocal(pg,P,{n,humans:kind==='war'?0:1,mode:kind==='war'?1:2,cpu:0});
 const row=await pg.evaluate(({seed,kind})=>{
  const H=__chip,K=H.K,G=RA.menu.current;K.seed=seed;K.tick=0;H.resetZone(0);
  let rng=seed;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
  const queue=[],miss={},key={KeyA:'left',KeyD:'right',KeyW:'up',Space:'fire',KeyE:'alt'};let hold={};
  if(kind==='novice')RA.input.keys=map=>{const out={};for(const k in key)if(map[k]&&hold[key[k]])out[map[k]]=true;return out};
  let steps=0;for(;steps<12000&&K.state!=='over';steps++){
   if(kind==='novice'){queue.push(H.bot(0));const o=queue.length>10?queue.shift():{};hold={...o};for(const k of ['fire','alt']){if(o[k]){if(miss[k]==null)miss[k]=random()<.3;if(miss[k])hold[k]=false}else miss[k]=null}}
   G.step();
  }
  const scores=H.people.map(c=>c.score),rank=H.people.slice().sort((a,b)=>b.score-a.score||b.rescues-a.rescues||a.i-b.i);
  const snap=K.snapshot();return{seed,steps,over:K.state==='over',win:K.winner,points:snap.pt,scores,place:rank.findIndex(c=>c.i===0)+1};
 },{seed,kind});row.n=n;rows.push(row);console.log(JSON.stringify(row));
 }
 const summary=kind==='war'?[8,20].map(n=>({n,red:rows.filter(r=>r.n===n&&r.win?.team===0).length,blue:rows.filter(r=>r.n===n&&r.win?.team===1).length,draw:rows.filter(r=>r.n===n&&!r.win).length})):{wins:rows.filter(r=>r.place===1).length,average:rows.reduce((a,r)=>a+r.place,0)/rows.length};
 console.log(JSON.stringify({summary,errs}));fs.mkdirSync('out/chip',{recursive:true});fs.writeFileSync(`out/chip/${kind}-${label}.json`,JSON.stringify({rows,summary,errs},null,2));
 if(errs.length||rows.some(r=>!r.over))process.exitCode=1;
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
