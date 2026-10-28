const cp=require('child_process'),fs=require('fs');process.chdir(__dirname);process.env.RA_URL=process.env.RA_URL||'http://localhost:8778/index.html';const which=process.argv[2];
const run=(file,args,env={})=>{const r=cp.spawnSync(process.execPath,[file,...args.map(String)],{env:{...process.env,...env},encoding:'utf8',timeout:180000});const log=[file,...args].join(' ')+'\n'+r.stdout+r.stderr;console.log(log);fs.appendFileSync('out/snout-tests.log',log+'\n');if(r.status!==0||/PAGEERR|CONSOLE |"over":false/.test(log))process.exitCode=1;};
if(which==='novice')for(let j=0;j<6;j++)run('novice.js',['big-nose',4,10,.3,20000],{CPU:'0'});
if(which==='skilled')for(let j=0;j<3;j++)run('novice.js',['big-nose',4,0,0,20000],{CPU:'1'});
if(which==='shots')for(const [w,h,dpr]of [[1280,720,1],[2560,1440,1],[1536,864,1.25]])for(const world of [0,1,2])run('shots.js',['big-nose',20,`snout-w${world}-${w}`,'300,900,2200,4000,5200',0,JSON.stringify({world}),1],{VW:String(w),VH:String(h),DPR:String(dpr)});
if(which==='pass')run('pass.js',['big-nose']);

if(which==='sim')for(const m of [0,1,2])for(const n of [8,20])run('sim.js',['big-nose',m,n,20000,0,`out/snout-sim-${m}-${n}.png`,'JSON.stringify(__snout.people.map(c=>({i:c.i,lv:c.lv,score:c.score,fin:c.fin,deaths:c.deaths,damage:c.damage})))']);
