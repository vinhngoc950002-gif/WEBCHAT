import {useEffect,useState} from 'react';
export function readNpcData(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:fallback;}catch{return fallback;}}
export function transitionNpcInvitations(requests,action){
 if(action.type==='request')return requests.some(item=>item.name===action.name)?requests:[...requests,{id:action.id,name:action.name,status:'pending'}];
 if(action.type==='accept')return requests.map(item=>item.id===action.id&&item.status==='pending'?{...item,status:'accepted'}:item);
 if(action.type==='decline')return requests.filter(item=>item.id!==action.id||item.status!=='pending');
 return requests;
}
const KEY='avatar-npc-invitations-v2';
function load(){return readNpcData(KEY,[]);}
export function useNpcInvitations(){
 const [requests,setRequests]=useState(load);
 useEffect(()=>{const refresh=()=>setRequests(load());window.addEventListener('avatar-npc-friends',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('avatar-npc-friends',refresh);window.removeEventListener('storage',refresh);};},[]);
 function update(transform){const next=transform(load());setRequests(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}window.dispatchEvent(new Event('avatar-npc-friends'));}
 function request(name){update(prev=>transitionNpcInvitations(prev,{type:'request',id:crypto.randomUUID(),name}));}
 function accept(id){update(prev=>transitionNpcInvitations(prev,{type:'accept',id}));}
 function decline(id){update(prev=>transitionNpcInvitations(prev,{type:'decline',id}));}
 return {requests,request,accept,decline};
}
export function useNpcFriend(name){const {requests,request}=useNpcInvitations();const link=requests.find(item=>item.name===name);return {isFriend:link?.status==='accepted',isPending:link?.status==='pending',addFriend:()=>request(name)};}
