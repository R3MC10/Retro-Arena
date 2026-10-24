// Online test with two tabs on a fake room network (fakenet.js, BroadcastChannel): host creates a room, guest joins,
// host starts with CPUs; the guest runs an optional script (has G = guest page, H = host page). Screenshots into ./out
// node online.js <gameId> [mode=0] [cpus=3] [hostExpr] [guestExpr] [guestScript]
const {browser,openGame,arg}=require('./lib');const fs=require('fs');
(async()=>{const id=arg(0),md=arg(1,'0'),cpus=arg(2,'3'),hx=arg(3,'0'),gx=arg(4,'0'),gs=arg(5,'');fs.mkdirSync('out',{recursive:true});
 const b=await browser();const ctx=await b.newContext();await ctx.addInitScript(fs.readFileSync(__dirname+'/fakenet.js','utf8'));
 const h=await openGame(b,id,{name:'Host',ctx}),g=await openGame(b,id,{name:'Guest',ctx}),H=h.pg,G=g.pg,P=h.P;
 await H.evaluate(([P,md])=>{const m=document.querySelector('#'+P+'Modes [data-m="'+md+'"]');if(m)m.click();document.querySelector('#'+P+'Online [data-r="create"]').click()},[P,md]);await H.waitForTimeout(1500);
 const code=await H.evaluate(P=>document.querySelector('#'+P+'Online [data-r="rcode"]').textContent,P);
 await G.evaluate(([P,c])=>{document.querySelector('#'+P+'Online [data-r="code"]').value=c;document.querySelector('#'+P+'Online [data-r="join"]').click()},[P,code]);await G.waitForTimeout(2500);
 await H.evaluate(([P,c])=>{const s=document.querySelector('#'+P+'Online [data-r="cpus"]');s.value=c;s.dispatchEvent(new Event('change'));document.querySelector('#'+P+'Online [data-r="start"]').click()},[P,cpus]);
 await G.waitForTimeout(2500);await G.bringToFront();await G.evaluate(()=>document.activeElement&&document.activeElement.blur());
 if(gs)await eval('(async()=>{'+gs+'})()');else{await G.keyboard.down('Space');await G.waitForTimeout(8000)}
 await G.screenshot({path:'out/'+id+'-guest.png'});await H.screenshot({path:'out/'+id+'-host.png'});
 console.log('HOST',await H.evaluate(hx));console.log('GUEST',await G.evaluate(gx));const e=[...h.errs,...g.errs];console.log(e.length?e.slice(0,10).join('\n'):'NO ERRORS');await b.close()})();
