import {WORLD_LIMIT} from './plazaNavigation.js';
import {normalizeAvatarGender} from './avatarProfile.js';

export function playerAppearance(id){let hash=0;for(const char of id)hash=(Math.imul(hash,31)+char.charCodeAt(0))>>>0;return hash%5;}
export function playerSpawn(id){let hash=0;for(const char of id)hash=(Math.imul(hash,33)+char.charCodeAt(0))>>>0;return {x:(hash%7-3)*1.5,z:10+Math.floor(hash/7)%4*1.2};}
export function validatePlayer(packet,roomId){
 if(!packet||packet.roomId!==roomId||typeof packet.id!=='string'||!packet.id||typeof packet.connection!=='string'||!packet.connection)return null;
 if(!Number.isFinite(packet.seq)||packet.seq<0||!Number.isFinite(packet.x)||!Number.isFinite(packet.z)||!Number.isFinite(packet.yaw))return null;
 if(Math.abs(packet.x)>WORLD_LIMIT||Math.abs(packet.z)>WORLD_LIMIT)return null;
 return {id:packet.id,roomId,connection:packet.connection,seq:packet.seq,name:String(packet.name||'Người chơi').slice(0,24),gender:normalizeAvatarGender(packet.gender),x:packet.x,z:packet.z,yaw:packet.yaw,seated:packet.seated===true,moving:packet.moving===true,waveId:typeof packet.waveId==='string'?packet.waveId.slice(0,80):'',waveAge:Number.isFinite(packet.waveAge)?Math.max(0,Math.min(3200,packet.waveAge)):3200};
}

// A CLOSED channel is terminal in the SDK, even when its socket is healthy.
// Rebuild it with bounded backoff; keep avatars while reconnecting.
export function connectRoomPlayers({client,roomId,userId,name,initialState,onJoin=()=>{},onUpdate=()=>{},onLeave=()=>{},onStatus=()=>{},onCount=()=>{}}){
 let channel=null,connection='',generation=0,current={...initialState},currentName=name,seq=0,ready=false,closed=false;
 let lastSent=0,dirty=true,tracking=false,reconnectTimer=null,retries=0,connectedAt=0;
 const peers=new Map(),lastSeen=new Map(),departed=new Map();
 const packet=()=>({...current,name:currentName,id:userId,roomId,connection,seq:++seq});
 const count=()=>onCount(ready?peers.size+1:null);
 function remove(id){if(!peers.has(id))return;peers.delete(id);lastSeen.delete(id);onLeave(id);count();}
 function receive(raw){
  const state=validatePlayer(raw,roomId);if(!state||state.id===userId||departed.has(state.connection))return;
  const old=peers.get(state.id);lastSeen.set(state.id,Date.now());
  if(old&&old.connection===state.connection&&old.seq>=state.seq)return;
  peers.set(state.id,state);
  try{if(!old)onJoin(state);else onUpdate(state);}catch(error){peers.delete(state.id);lastSeen.delete(state.id);onStatus('PLAYER_ERROR');console.error('Could not render remote player',error);}
  count();
 }
 function scheduleReconnect(delay){
  if(closed||reconnectTimer)return;
  onStatus('RETRYING');count();
  reconnectTimer=setTimeout(()=>{reconnectTimer=null;if(!closed)openChannel();},delay??Math.min(15000,1000*2**Math.min(retries++,4)));
 }
 function send(event,payload){
  if(!ready||closed||!channel)return;const active=channel;
  Promise.resolve(active.send({type:'broadcast',event,payload})).then(result=>{if(!closed&&active===channel&&result!=='ok'){onStatus('RETRYING');if(active.state==='closed'||active.state==='errored')scheduleReconnect();}}).catch(()=>{if(!closed&&active===channel)scheduleReconnect();});
 }
 async function track(){
  if(!ready||closed||tracking||!channel)return;const active=channel;tracking=true;
  try{const result=await active.track(packet());if(!closed&&active===channel){onStatus(result==='ok'?'SYNCED':'RETRYING');if(result!=='ok')scheduleReconnect();count();}}
  catch{if(!closed&&active===channel)scheduleReconnect();}finally{if(active===channel)tracking=false;}
 }
 function presentIds(){return new Set(Object.entries(channel?.presenceState()||{}).filter(([,entries])=>entries.length>0).map(([id])=>id));}
 function prune(){
  if(!ready)return;const present=presentIds(),now=Date.now();
  // Presence membership itself is evidence of liveness. Browser background
  // throttling must not turn an idle but connected player invisible.
  for(const id of [...peers.keys()])if(!present.has(id)&&now-(lastSeen.get(id)||0)>45000)remove(id);
  for(const [id,time]of departed)if(now-time>60000)departed.delete(id);
 }
 function sync(){
  if(closed||!ready)return;
  for(const [id,entries]of Object.entries(channel.presenceState())){if(id===userId)continue;const candidates=entries.map(entry=>validatePlayer(entry,roomId)).filter(entry=>entry?.id===id);if(!candidates.length)continue;const old=peers.get(id);receive(candidates.find(entry=>entry.connection===old?.connection)||candidates[candidates.length-1]);}
  prune();count();
 }
 async function openChannel(){
  if(closed)return;const thisGeneration=++generation,old=channel;channel=null;ready=false;tracking=false;count();
  if(old){try{await client.removeChannel(old);}catch{}}
  if(closed||thisGeneration!==generation)return;
  connection=crypto.randomUUID();const active=client.channel(`plaza-v1:${roomId}`,{config:{presence:{key:userId},broadcast:{self:false,ack:false}}});channel=active;
  const currentChannel=()=>!closed&&thisGeneration===generation&&active===channel;
  active.on('presence',{event:'sync'},()=>{if(currentChannel())sync();})
   .on('presence',{event:'leave'},()=>{if(currentChannel())prune();})
   .on('broadcast',{event:'player-state'},({payload})=>{if(currentChannel())receive(payload);})
   .on('broadcast',{event:'player-hello'},({payload})=>{if(!currentChannel()||!validatePlayer(payload,roomId))return;receive(payload);send('player-state',packet());})
   .on('broadcast',{event:'player-leave'},({payload})=>{if(!currentChannel()||payload?.roomId!==roomId||typeof payload.connection!=='string')return;const peer=peers.get(payload.id);if(peer?.connection===payload.connection){departed.set(peer.connection,Date.now());remove(payload.id);}})
   .subscribe(status=>{
    if(!currentChannel())return;
    if(status==='SUBSCRIBED'){ready=true;connectedAt=Date.now();if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}dirty=true;lastSent=0;onStatus(status);count();track();send('player-hello',packet());}
    else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){ready=false;onStatus(status);count();scheduleReconnect(status==='CLOSED'?undefined:3000);}
   });
 }
 openChannel();
 const timer=setInterval(()=>{
  if(!ready||closed)return;const now=Date.now();if(now-connectedAt>30000)retries=0;
  if((dirty&&now-lastSent>=150)||now-lastSent>2000){send('player-state',packet());dirty=false;lastSent=now;}
  prune();
 },100);
 const visibility=()=>{if(globalThis.document?.visibilityState==='visible'){if(ready){send('player-hello',packet());}else scheduleReconnect(0);}};
 const online=()=>{if(!ready)scheduleReconnect(0);else{send('player-hello',packet());}};
 globalThis.document?.addEventListener('visibilitychange',visibility);globalThis.window?.addEventListener('online',online);
 return {
  publish(state,nextName=currentName){const next={...current,...state};if(JSON.stringify(next)!==JSON.stringify(current)||nextName!==currentName){current=next;currentName=nextName;dirty=true;}},
  close(){if(closed)return;send('player-leave',{id:userId,connection,roomId});closed=true;++generation;clearInterval(timer);if(reconnectTimer)clearTimeout(reconnectTimer);globalThis.document?.removeEventListener('visibilitychange',visibility);globalThis.window?.removeEventListener('online',online);ready=false;if(channel)client.removeChannel(channel);channel=null;peers.clear();lastSeen.clear();departed.clear();},
  get channel(){return channel;}
 };
}


