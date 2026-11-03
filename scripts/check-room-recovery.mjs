import assert from 'node:assert/strict';
import {connectRoomPlayers} from '../src/roomPlayers.js';
import {accountAvatarGender,normalizeAvatarGender} from '../src/avatarProfile.js';
import {createAnimeAvatar} from '../src/animeAvatar.js';
import * as THREE from 'three';
const rooms=new Map(),made=[];
function client(){return {channel(topic){const handlers=new Map();const channel={on(type,filter,callback){handlers.set(type+':'+filter.event,callback);return channel;},subscribe(callback){channel.status=callback;queueMicrotask(()=>{if(!rooms.has(topic))rooms.set(topic,new Set());rooms.get(topic).add(channel);callback('SUBSCRIBED');});return channel;},presenceState(){const roster={};for(const peer of rooms.get(topic)||[]){if(peer.metadata)(roster[peer.metadata.id]??=[]).push(peer.metadata);}return roster;},async track(data){channel.trackCount++;channel.metadata=data;return 'ok';},trackCount:0,async send({event,payload}){for(const peer of rooms.get(topic)||[])if(peer!==channel)queueMicrotask(()=>peer.handlers.get('broadcast:'+event)?.({payload}));return 'ok';},topic,handlers};made.push(channel);return channel;},async removeChannel(channel){rooms.get(channel.topic)?.delete(channel);}};}
const seen=[new Map(),new Map()],departures=[0,0],counts=[[],[]],links=[];const delay=ms=>new Promise(r=>setTimeout(r,ms));
function connect(id,gender,index){return connectRoomPlayers({client:client(),roomId:'test',userId:id,name:id,initialState:{x:0,z:10,yaw:0,moving:false,seated:false,waveId:'',waveAge:3200,gender},onJoin:p=>seen[index].set(p.id,p),onUpdate:p=>seen[index].set(p.id,p),onLeave:id=>{departures[index]++;seen[index].delete(id);},onCount:n=>counts[index].push(n)});}
try{
 links.push(connect('a','male',0),connect('b','female',1));await delay(350);assert.equal(seen[0].get('b').gender,'female');assert.equal(seen[1].get('a').gender,'male');
 const original=links[0].channel;original.status('CLOSED');await delay(1800);assert.notEqual(links[0].channel,original);assert.equal(seen[0].size,1);assert.equal(seen[1].size,1);assert.equal(departures[0],0);assert.equal(departures[1],0);assert.equal(counts[0].at(-1),2);assert.equal(counts[1].at(-1),2);
 assert(made.every(channel=>channel.trackCount===1),'Presence must track once per channel, not periodically');
 for(const gender of ['male','female']){assert.equal(accountAvatarGender(JSON.parse(JSON.stringify({avatar_gender:gender}))),gender);for(let index=0;index<5;index++){const rig=createAnimeAvatar(index,gender);assert.equal(rig.gender,gender);rig.legs.forEach(leg=>leg.rotation.x=-Math.PI/2);rig.calves.forEach(calf=>calf.rotation.x=Math.PI/2);rig.group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(rig.group);assert(Number.isFinite(bounds.max.y));assert.equal(rig.forearms.length,2);const gs=new Set(),ms=new Set();rig.group.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());rig.ramp.dispose();}}
 assert.equal(accountAvatarGender({}), 'male');assert.equal(normalizeAvatarGender('<script>'),'male');
 console.log('PASS: CLOSED channel rebuilt without removing avatars; counts restored; one presence track per connection; gender synchronized, restored from metadata and rendered for both rigs.');
}finally{links.forEach(link=>link.close());}
