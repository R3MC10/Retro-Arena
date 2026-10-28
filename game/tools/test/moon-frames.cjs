const {spawnSync}=require('child_process');
const input=`(n)=>{const H=__moon;if(n===0){H.setShape(0);H.balls.forEach((b,i)=>{b.x=190+(i%4)*18;b.y=20+Math.floor(i/4)*20;b.dead=0;b.vx=b.vy=0});H.players.forEach(p=>p.cd=999);H.players[0].cd=0;Object.assign(H.balls[0],{x:90,y:55,dead:0,owner:0});Object.assign(H.balls[4],{x:140,y:55,dead:0,owner:0});H.players[0].a=0}if(n===85){Object.assign(H.balls[0],{x:3,y:3,vx:0,vy:0,dead:0,owner:0})}return new Set(n<40?['Space']:[])}`;
const grab=`n=>[0,12,24,39,40,48,60,80,85,87,89,91,93,96,105,205].includes(n)?'tick '+n:''`;
const r=spawnSync(process.execPath,['frames.js','lunar-ball','4','moon-motion',input,grab,'210','0,0,1,1'],{stdio:'inherit'});process.exitCode=r.status;
