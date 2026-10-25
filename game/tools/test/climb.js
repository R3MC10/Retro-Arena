// Worms climb test: flat floor, a wall of height h in front of worm 0; each move sequence tries to get on top.
// node climb.js
const {browser,openGame,startLocal}=require('./lib');
(async()=>{const b=await browser();const{pg,errs,P}=await openGame(b,'worms');await startLocal(pg,P,{n:2,humans:1,settings:{turns:'all',worms:1,time:30}});await pg.waitForTimeout(300);
 const r=await pg.evaluate(()=>{const G=RA.menu.current,M=__wm.mask,Wd=__wm.W,WH=360;let hold=new Set();RA.input.keys=map=>{const o={};for(const k in map)if(hold.has(k))o[map[k]]=true;return o};
  const seqs={awayDouble:n=>n<2?['KeyE']:n>=7&&n<9?['KeyE']:[],walk:n=>['KeyD'],jump:n=>n<2?['KeyE','KeyD']:['KeyD'],flip:n=>n<2?['ShiftLeft']:[],double:n=>n<2?['KeyE','KeyD']:n>=7&&n<9?['KeyE']:['KeyD']};
  const out={};
  for(const name in seqs){out[name]=0;for(let h=2;h<=70;h+=2){
    // rebuild: floor at y=300, wall from x=300 to 340 of height h; the worm at x=290 facing right (left of the wall for the back-flip)
    for(let y=0;y<WH;y++)for(let x=0;x<Wd;x++)M[y*Wd+x]=y>=300||(x>=300&&x<Wd-40&&y>=300-h)?1:0;
    const w=__wm.worms[0];const fl=name==='flip'||name==='awayDouble';w.x=fl?350+0:288;w.y=300;w.gr=true;w.vx=w.vy=0;w.face=fl?-1:1;w.hurt=0;w.rope=null;w.dead=false;w.hp=100;w.acted=false;w.prev={};
    if(fl){/*wall behind*/for(let y=0;y<WH;y++)for(let x=0;x<Wd;x++)M[y*Wd+x]=y>=300||(x>=10&&x<290&&y>=300-h)?1:0;w.x=300;w.face=1}
    for(const o of __wm.worms)if(o!==w){o.x=Wd-20;o.y=300}
    for(let n=0;n<160;n++){hold=new Set(seqs[name](n));__wm.K.tick;G.step()}
    const on=w.y<=300-h+1&&w.gr;if(on)out[name]=h;else break}}
  return out});
 console.log(JSON.stringify(r),errs.slice(0,2).join('|'));await b.close()})();
