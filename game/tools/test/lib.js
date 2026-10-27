// Shared helpers for the Retro Arena test scripts (Playwright + Chromium).
// Serve the game first:  cd game && python3 -m http.server 8765
const {chromium}=require('playwright');
const URL=process.env.RA_URL||'http://localhost:8765/index.html';
async function browser(){return chromium.launch()}
// open the page, sign in a nickname, open game <id> on its lobby
async function openGame(b,id,{name='Tester',ctx=null}={}){// VW / VH / DPR env vars test big monitors and Windows display scaling
 const pg=await(ctx||b).newPage({viewport:{width:+process.env.VW||1280,height:+process.env.VH||720},deviceScaleFactor:+process.env.DPR||1});const errs=[];
 pg.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());if(m.type()==='warning'&&/clashes/.test(m.text()))errs.push('WARN '+m.text())});
 // Tetris and Tiny Tracks both publish __tt; retain Tetris before Tiny Tracks replaces it.
 if(id==='tetris')await pg.addInitScript(()=>{let tt;Object.defineProperty(window,'__tt',{configurable:true,enumerable:true,get:()=>tt,set:v=>{tt=v;if(v.K.root.querySelector('#tetStart'))window.__testTetris=v}})});
 await pg.goto(URL);await pg.waitForTimeout(600);await pg.evaluate(n=>RA.player.set(n),name);
 await pg.evaluate(id=>{for(const b of document.querySelectorAll('#games button')){b.click();if(RA.menu.current&&RA.menu.current.id===id)return;RA.menu.show()}},id);
 await pg.waitForTimeout(1200);return{pg,errs,P:({tanks:'bc',jewels:'mj'})[id]||id.slice(0,3)}}
// start a local match: n seats, the first `humans` on keyboards (mk, k3, k2, k4), the rest CPU; settings {key: value}
// CPU level: env CPU=0|1|2 (default: the lobby default)
async function startLocal(pg,P,{n=4,humans=1,mode=0,settings={},cpu=process.env.CPU}={}){await pg.evaluate(([P,n,humans,mode,settings,cpu])=>{
  for(const k in settings){const s=document.getElementById(P+'s_'+k);if(s){s.value=String(settings[k]);s.dispatchEvent(new Event('change'))}}
  document.getElementById(P+'TabLocal').click();document.getElementById(P+'N').textContent=String(n);
  for(let i=0;i<20;i++){const c=document.getElementById(P+'c'+i);if(c)c.value=i<humans?['mk','k3','k2','k4'][i]:'cpu'}
  if(cpu!=null){const c=document.getElementById(P+'Cpu');if(c)c.value=String(cpu)}
  const m=document.querySelector('#'+P+'Modes [data-m="'+mode+'"]');if(m)m.click();const lm=document.getElementById(P+'Lmode');if(lm){lm.selectedIndex=mode;lm.dispatchEvent(new Event('change'))}document.getElementById(P+'Start').click();document.activeElement&&document.activeElement.blur()},[P,n,humans,mode,settings,cpu])}
const arg=(i,d)=>process.argv[2+i]!==undefined?process.argv[2+i]:d;
module.exports={browser,openGame,startLocal,arg,URL};
