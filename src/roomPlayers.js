import {WORLD_LIMIT} from './plazaNavigation.js';

export function playerAppearance(id){let hash=0;for(const char of id)hash=(Math.imul(hash,31)+char.charCodeAt(0))>>>0;return hash%5;}
export function playerSpawn(id){let hash=0;for(const char of id)hash=(Math.imul(hash,33)+char.charCodeAt(0))>>>0;return {x:(hash%7-3)*1.5,z:10+Math.floor(hash/7)%4*1.2};}
export function validatePlayer(packet,roomId){
 if(!packet||packet.roomId!==roomId||typeof packet.id!=='string'||!packet.id||typeof packet.connection!=='string'||!packet.connection)return null;
 if(!Number.isFinite(packet.seq)||packet.seq<0||!Number.isFinite(packet.x)||!Number.isFinite(packet.z)||!Number.isFinite(packet.yaw))return null;
 if(Math.abs(packet.x)>WORLD_LIMIT||Math.abs(packet.z)>WORLD_LIMIT)return null;
 return {id:packet.id,roomId,connection:packet.connection,seq:packet.seq,name:String(packet.name||'Người chơi').slice(0,24),x:packet.x,z:packet.z,yaw:packet.yaw,seated:packet.seated===true,moving:packet.moving===true,waveId:typeof packet.waveId==='string'?packet.waveId.slice(0,80):'',waveAge:Number.isFinite(packet.waveAge)?Math.max(0,Math.min(3200,packet.waveAge)):3200};
}

// Presence + broadcast discovery. A heartbeat fills roster gaps while Presence
// reconciles; accounts are counted once even if they have multiple connections.
export function connectRoomPlayers({client,roomId,userId,name,initialState,onJoin=()=>{},onUpdate=()=>{},onLeave=()=>{},onStatus=()=>{},onCount=()=>{}}){
 const connection=crypto.randomUUID();
 let current={...initialState},currentName=name,seq=0,ready=false,closed=false,lastPresence=0,lastSent=0,dirty=true,tracking=false;
 const peers=new Map(),lastSeen=new Map(),departed=new Set();
 const channel=client.channel(`plaza-v1:${roomId}`,{config:{presence:{key:userId},broadcast:{self:false,ack:true}}});
 const packet=()=>({...current,name:currentName,id:userId,roomId,connection,seq:++seq});
 const count=()=>onCount(ready?peers.size+1:null);
 function remove(id){if(!peers.has(id))return;peers.delete(id);lastSeen.delete(id);onLeave(id);count();}
 function clear(){for(const id of [...peers.keys()])remove(id);count();}
 function send(event,payload){if(!ready||closed)return;channel.send({type:'broadcast',event,payload}).catch(()=>{if(!closed)onStatus('RETRYING');});}
 function receive(raw){
  const state=validatePlayer(raw,roomId);if(!state||state.id===userId||departed.has(state.connection))return;
  const old=peers.get(state.id);lastSeen.set(state.id,Date.now());
  if(old&&old.connection===state.connection&&old.seq>=state.seq)return;
  peers.set(state.id,state);
  try{if(!old)onJoin(state);else onUpdate(state);}catch(error){peers.delete(state.id);lastSeen.delete(state.id);onStatus('PLAYER_ERROR');console.error('Could not render remote player',error);}
  count();
 }
 async function track(){
  if(!ready||closed||tracking)return;tracking=true;lastPresence=Date.now();
  try{const result=await channel.track(packet());if(!closed){onStatus(result==='ok'?'SYNCED':'RETRYING');count();}}
  catch{if(!closed)onStatus('RETRYING');}finally{tracking=false;}
 }
 function sync(){
  if(closed)return;const roster=channel.presenceState(),present=new Set();
  for(const [id,entries] of Object.entries(roster)){
   if(id===userId)continue;const candidates=entries.map(entry=>validatePlayer(entry,roomId)).filter(entry=>entry?.id===id);if(!candidates.length)continue;
   present.add(id);const old=peers.get(id);receive(candidates.find(entry=>entry.connection===old?.connection)||candidates[candidates.length-1]);
  }
  // Avoid deleting a player whose hello arrived before its Presence sync.
  for(const id of [...peers.keys()])if(!present.has(id)&&Date.now()-(lastSeen.get(id)||0)>4500)remove(id);
  count();
 }
 channel.on('presence',{event:'sync'},sync)
 .on('presence',{event:'leave'},({key,leftPresences})=>{
  const remaining=channel.presenceState()[key];if(remaining?.length){sync();return;}
  const peer=peers.get(key);if(peer&&leftPresences?.some(entry=>entry.connection===peer.connection)){remove(key);}
 })
 .on('broadcast',{event:'player-state'},({payload})=>{if(!closed)receive(payload);})
 .on('broadcast',{event:'player-hello'},({payload})=>{if(closed||!validatePlayer(payload,roomId))return;receive(payload);send('player-state',packet());})
 .on('broadcast',{event:'player-leave'},({payload})=>{if(payload?.roomId!==roomId||typeof payload.connection!=='string')return;const peer=peers.get(payload.id);if(peer?.connection===payload.connection){departed.add(peer.connection);remove(payload.id);}})
 .subscribe(status=>{
  if(closed)return;ready=status==='SUBSCRIBED';onStatus(status);
  if(ready){count();dirty=true;track();send('player-hello',packet());}
  else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){clear();}
 });
 const timer=setInterval(()=>{
  if(!ready||closed)return;const now=Date.now();
  if(dirty||now-lastSent>1000){send('player-state',packet());dirty=false;lastSent=now;}
  if(now-lastPresence>3000)track();
  for(const id of [...peers.keys()])if(now-(lastSeen.get(id)||0)>10000)remove(id);
 },100);
 const visibility=()=>{if(globalThis.document?.visibilityState==='visible'&&ready){track();send('player-hello',packet());}};
 globalThis.document?.addEventListener('visibilitychange',visibility);
 return {
  publish(state,nextName=currentName){const next={...current,...state};if(JSON.stringify(next)!==JSON.stringify(current)||nextName!==currentName){current=next;currentName=nextName;dirty=true;}},
  close(){if(closed)return;send('player-leave',{id:userId,connection,roomId});closed=true;clearInterval(timer);globalThis.document?.removeEventListener('visibilitychange',visibility);ready=false;client.removeChannel(channel);peers.clear();lastSeen.clear();departed.clear();},channel
 };
}

