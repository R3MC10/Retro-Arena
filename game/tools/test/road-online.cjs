const cp=require('child_process'),fs=require('fs');process.chdir(__dirname);process.env.RA_URL='http://localhost:8766/index.html';const script=`
 const seat=await G.evaluate(()=>__road.K.myIdx);if(seat<0)throw Error('Guest has no seat');
 await G.waitForTimeout(1800);await G.keyboard.down('KeyW');await G.keyboard.down('KeyD');await G.waitForTimeout(220);await G.keyboard.up('KeyD');
 const right=await G.evaluate(()=>__road.cars[__road.K.myIdx].x);
 await G.keyboard.down('KeyA');await G.waitForTimeout(400);await G.keyboard.up('KeyA');
 const left=await G.evaluate(()=>__road.cars[__road.K.myIdx].x);if(left>=right-5)throw Error('Guest left/right movement failed');
 await H.evaluate(()=>{const c=__road.cars[0];c.x=0;c.d+=30;__road.crash(c,'STAGED HOST HIT')});await H.waitForTimeout(250);
 if(await G.evaluate(()=>__road.cars[0].spin<=0))throw Error('Host pose missing on guest');
 console.log('HOST_TO_GUEST',await G.evaluate(()=>({hostSpin:__road.cars[0].spin,hostX:__road.cars[0].x})));
 await G.evaluate(()=>__road.crash(__road.cars[__road.K.myIdx],'STAGED GUEST HIT'));await G.waitForTimeout(250);
 if(await H.evaluate(i=>__road.cars[i].spin<=0,seat))throw Error('Guest pose missing on host');
 console.log('GUEST_TO_HOST',await H.evaluate(i=>({spin:__road.cars[i].spin,x:__road.cars[i].x}),seat));
 console.log('GUEST_MOVEMENT',{seat,right,left});
 console.log('ACTIVE_SNAPSHOT',await H.evaluate(()=>JSON.stringify(__road.K.snapshot()).length));await G.screenshot({path:'out/road-online-active-guest.png'});await H.screenshot({path:'out/road-online-active-host.png'});await G.evaluate(()=>__road.K.R.leave());await H.waitForTimeout(1200);
 console.log('TAKEOVER',await H.evaluate(i=>({seat:i,ctrl:__road.K.seats[i].ctrl,d:__road.cars[i].d}),seat));
 if(await H.evaluate(i=>__road.K.seats[i].ctrl!=='cpu',seat))throw Error('No CPU takeover');`;
const r=cp.spawnSync(process.execPath,['online.js','road-fighter','0',process.argv[2]||'3','({tick:__road.K.tick,bytes:JSON.stringify(__road.K.snapshot()).length,seats:__road.K.seats.map(s=>s.ctrl)})','({myIdx:__road.K.myIdx})',script],{encoding:'utf8',timeout:90000});console.log(r.stdout,r.stderr);if(r.status!==0)process.exitCode=1;fs.appendFileSync('out/road-tests.log','ONLINE\n'+r.stdout+r.stderr+'\n');
