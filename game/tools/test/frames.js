// Animation contact sheet: steps the match by hand, feeds seat 0 the keys your input function returns,
// and grabs a crop of the screen when your grab function says so. Writes out/<name>.png (assembled with Chromium).
// node frames.js <gameId> <players> <name> "<input js: (n, G) => Set of key codes>" "<grab js: (n, G) => label or ''>" [maxSteps=3000] [crop=x,y,w,h as fractions]
const {browser,openGame,startLocal,arg}=require('./lib');const fs=require('fs');
(async()=>{const id=arg(0),n=+arg(1,2),name=arg(2,'frames'),inp=arg(3,'()=>new Set(["Space"])'),grab=arg(4,'(n)=>n%30===0?"t"+n:""'),max=+arg(5,3000),crop=arg(6,'0.1,0.2,0.5,0.6').split(',').map(Number);
 fs.mkdirSync('out/'+name,{recursive:true});const b=await browser();const{pg,errs,P}=await openGame(b,id);await startLocal(pg,P,{n,settings:JSON.parse(process.env.SET||'{}')});await pg.waitForTimeout(300);
 const shots=await pg.evaluate(([inp,grab,max,crop])=>{const G=RA.menu.current,cv=G.el.querySelector('canvas'),fi=eval(inp),fg=eval(grab);let hold=new Set();
  RA.input.keys=map=>{const o={};for(const k in map)if(hold.has(k))o[map[k]]=true;return o};const out=[];
  for(let n=0;n<max&&out.length<24;n++){hold=fi(n,G)||new Set();G.step();const l=fg(n,G);if(l){G.frame(performance.now());const W=cv.width,H=cv.height,c=document.createElement('canvas');c.width=W*crop[2];c.height=H*crop[3];
   const g=c.getContext('2d');g.drawImage(cv,W*crop[0],H*crop[1],c.width,c.height,0,0,c.width,c.height);g.fillStyle='#fff';g.font='16px sans-serif';g.fillText(l,6,18);out.push(c.toDataURL())}}return out},[inp,grab,max,crop]);
 shots.forEach((d,i)=>fs.writeFileSync('out/'+name+'/'+String(i).padStart(2,'0')+'.png',Buffer.from(d.split(',')[1],'base64')));
 const sheet=await b.newPage({viewport:{width:1280,height:Math.max(1,Math.ceil(shots.length/4))*180}});
 await sheet.setContent('<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(4,320px)">'+shots.map(d=>'<img style="width:320px;height:180px;object-fit:contain" src="'+d+'">').join(''));
 await sheet.locator('img').evaluateAll(a=>Promise.all(a.map(i=>i.decode())));await sheet.screenshot({path:'out/'+name+'.png'});
 console.log(shots.length+' frames -> out/'+name+'.png',errs.join('|')||'NO ERRORS');await b.close()})();
