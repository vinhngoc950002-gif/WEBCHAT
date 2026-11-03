import assert from 'node:assert/strict';
import {connectRoomPlayers} from '../src/roomPlayers.js';
// Deliberately suppress all Presence snapshots to exercise fallback discovery.
const rooms=new Map();
function client(){return {channel(topic){const handlers=new Map();const c={topic,on(type,filter,callback){handlers.set(type+':'+filter.event,callback);return c;},subscribe(callback){queueMicrotask(()=>{if(!rooms.has(topic))rooms.set(topic,new Set());rooms.get(topic).add(c);callback('SUBSCRIBED');});return c;},presenceState(){return {};},async track(){return 'ok';},async send({event,payload}){for(const peer of rooms.get(topic)||[])if(peer!==c)queueMicrotask(()=>peer.handlers.get('broadcast:'+event)?.({payload}));return 'ok';},handlers};return c;},async removeChannel(c){rooms.get(c.topic)?.delete(c);}};}
const seenA=new Map(),seenB=new Map(),countsA=[],countsB=[];
function connect(userId,seen,counts,roomId='same'){return connectRoomPlayers({client:client(),roomId,userId,name:userId,initialState:{x:0,z:10,yaw:0,moving:false,seated:false,waveId:'',waveAge:3200},onJoin:p=>seen.set(p.id,p),onUpdate:p=>seen.set(p.id,p),onLeave:id=>seen.delete(id),onCount:n=>counts.push(n)});}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const a=connect('user-a',seenA,countsA);await delay(20);const b=connect('user-b',seenB,countsB);const other=connect('user-c',new Map(),[],'other');
try{await delay(250);assert.equal(seenA.size,1);assert.equal(seenB.size,1);assert.equal(countsA.at(-1),2);assert.equal(countsB.at(-1),2);a.publish({x:12,z:20,moving:true});await delay(250);assert.equal(seenB.get('user-a').x,12);b.close();await delay(50);assert.equal(seenA.size,0);assert.equal(countsA.at(-1),1);console.log('PASS: hello recovers missing Presence; matching counts; isolated rooms; explicit leave updates count.');}finally{a.close();b.close();other.close();}
