import {WORLD_LIMIT} from './plazaNavigation.js';

export function playerAppearance(id){let hash=0;for(const char of id)hash=(Math.imul(hash,31)+char.charCodeAt(0))>>>0;return hash%5;}
export function playerSpawn(id){let hash=0;for(const char of id)hash=(Math.imul(hash,33)+char.charCodeAt(0))>>>0;return {x:(hash%7-3)*.8,z:9+Math.floor(hash/7)%4*.8};}
export function validatePlayer(packet,roomId){
 if(!packet||packet.roomId!==roomId||typeof packet.id!=='string'||!packet.id||typeof packet.connection!=='string'||!packet.connection)return null;
 if(!Number.isFinite(packet.seq)||packet.seq<0||!Number.isFinite(packet.x)||!Number.isFinite(packet.z)||!Number.isFinite(packet.yaw))return null;
 if(Math.abs(packet.x)>WORLD_LIMIT||Math.abs(packet.z)>WORLD_LIMIT)return null;
 return {id:packet.id,roomId,connection:packet.connection,seq:packet.seq,name:String(packet.name||'Người chơi').slice(0,24),x:packet.x,z:packet.z,yaw:packet.yaw,seated:packet.seated===true,moving:packet.moving===true,waveId:typeof packet.waveId==='string'?packet.waveId.slice(0,80):'',waveAge:Number.isFinite(packet.waveAge)?Math.max(0,Math.min(3200,packet.waveAge)):3200};
}

// Presence supplies the roster + a complete snapshot for late joins/reconnects;
// Broadcast supplies 10 Hz motion without writing every step to the database.
export function connectRoomPlayers({client,roomId,userId,name,initialState,onJoin=()=>{},onUpdate=()=>{},onLeave=()=>{},onStatus=()=>{}}){
 const connection=crypto.randomUUID();let current={...initialState},currentName=name,seq=0,ready=false,closed=false,lastPresence=0,lastSent=0,dirty=true;
 const peers=new Map();
 const channel=client.channel(`plaza-v1:${roomId}`,{config:{presence:{key:userId},broadcast:{self:false,ack:false}}});
 const packet=()=>({...current,name:currentName,id:userId,roomId,connection,seq:++seq});
 function receive(raw){const state=validatePlayer(raw,roomId);if(!state||state.id===userId)return;const old=peers.get(state.id);if(old&&old.connection===state.connection&&old.seq>=state.seq)return;peers.set(state.id,state);if(!old)onJoin(state);else onUpdate(state);}
 function sync(){if(closed)return;const roster=channel.presenceState(),present=new Set();
  for(const [id,entries] of Object.entries(roster)){if(id===userId)continue;const candidates=entries.map(entry=>validatePlayer(entry,roomId)).filter(entry=>entry?.id===id);if(!candidates.length)continue;present.add(id);const old=peers.get(id);const state=candidates.find(entry=>entry.connection===old?.connection)||candidates[candidates.length-1];receive(state);}
  for(const id of peers.keys())if(!present.has(id)){peers.delete(id);onLeave(id);}
 }
 channel.on('presence',{event:'sync'},sync).on('broadcast',{event:'player-state'},({payload})=>{
  if(closed)return;const member=channel.presenceState()[payload?.id]?.some(entry=>entry.connection===payload.connection);if(member)receive(payload);
 }).subscribe(async status=>{if(closed)return;ready=status==='SUBSCRIBED';onStatus(status);if(ready){await channel.track(packet());lastPresence=Date.now();dirty=true;}else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){for(const id of peers.keys())onLeave(id);peers.clear();}});
 const timer=setInterval(()=>{if(!ready||closed)return;const now=Date.now();if(dirty||now-lastSent>1200){channel.send({type:'broadcast',event:'player-state',payload:packet()});dirty=false;lastSent=now;}if(now-lastPresence>1500){lastPresence=now;channel.track(packet());}},100);
 return {publish(state,nextName=currentName){const next={...current,...state};if(JSON.stringify(next)!==JSON.stringify(current)||nextName!==currentName){current=next;currentName=nextName;dirty=true;}},close(){if(closed)return;closed=true;clearInterval(timer);ready=false;client.removeChannel(channel);peers.clear();},channel};
}
