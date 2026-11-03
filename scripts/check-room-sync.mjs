import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {connectRoomPlayers,validatePlayer,playerSpawn} from '../src/roomPlayers.js';
const config=Object.fromEntries(fs.readFileSync('.env.local','utf8').trim().split(/\r?\n/).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
const clients=[],connections=[];const room='qa-plaza-'+Date.now(),idA=crypto.randomUUID(),idB=crypto.randomUUID(),idC=crypto.randomUUID(),seenA=new Map(),seenB=new Map(),seenC=new Map();
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(test,label){const start=Date.now();while(Date.now()-start<18000){if(test())return;await delay(100);}throw Error('Timed out: '+label);}
function connect(id,roomId,seen){const client=createClient(config.VITE_SUPABASE_URL,config.VITE_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});clients.push(client);const connection=connectRoomPlayers({client,roomId,userId:id,name:'QA '+id.slice(0,4),initialState:{...playerSpawn(id),yaw:0,seated:false,moving:false,waveId:'',waveAge:3200},onJoin:state=>seen.set(state.id,state),onUpdate:state=>seen.set(state.id,state),onLeave:id=>seen.delete(id)});connections.push(connection);return connection;}
try{
 const a=connect(idA,room,seenA);await delay(400);const b=connect(idB,room,seenB);const c=connect(idC,room+'-other',seenC);
 await until(()=>seenA.has(idB)&&seenB.has(idA),'mutual presence and late join snapshot');assert(!seenA.has(idA));assert(!seenB.has(idB));
 a.publish({x:5,z:12,yaw:1.2,moving:true,seated:false,waveId:'wave-1',waveAge:20});
 await until(()=>seenB.get(idA)?.x===5&&seenB.get(idA)?.waveId==='wave-1','broadcast movement and wave');
 a.publish({x:8,z:7,yaw:Math.PI,moving:false,seated:true,waveId:'wave-1',waveAge:3200});
 await until(()=>seenB.get(idA)?.seated===true,'seated pose');assert.equal(seenC.size,0);assert(!seenA.has(idC));
 assert.equal(validatePlayer({...seenB.get(idA),x:Infinity},room),null);assert.equal(validatePlayer({...seenB.get(idA),roomId:'wrong'},room),null);
 a.close();await until(()=>!seenB.has(idA),'departure removes remote avatar');
 console.log('PASS LIVE: two independent connections see each other; late join snapshot; movement, wave and seated pose; room isolation; departure; invalid packets rejected.');
}catch(error){console.error(error.message);process.exitCode=1;}finally{for(const connection of connections)connection.close();for(const client of clients)client.realtime.disconnect();}
