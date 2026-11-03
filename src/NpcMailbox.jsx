import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {readNpcData,useNpcFriend} from './npcSocial.js';
export default function NpcMailbox({name,onClose}){
 const key=`avatar-npc-messages-v1:${name}`;
 const {isFriend,isPending,addFriend}=useNpcFriend(name);
 const [messages,setMessages]=useState(()=>readNpcData(key,[])),[draft,setDraft]=useState('');
 const end=useRef(null),input=useRef(null);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages]);
 useEffect(()=>{input.current?.focus();},[isFriend]);
 useEffect(()=>{const onKey=event=>{if(event.key==='Escape'){event.stopPropagation();onClose();}};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);},[onClose]);
 function send(event){event.preventDefault();const content=draft.trim();if(!content||!isFriend)return;const next=[...messages.slice(-49),{id:crypto.randomUUID(),text:content}];setMessages(next);setDraft('');try{localStorage.setItem(key,JSON.stringify(next));}catch{}}
 return createPortal(<section className="npc-mailbox" role="dialog" aria-label={`Hộp thư với ${name.replace(' · Mẫu','')}`}><div className="mailbox-header"><span>✉</span><div><strong>Hộp Thư · {name.replace(' · Mẫu','')}</strong><small>Tin nhắn riêng · Nhân vật mẫu</small></div><button aria-label="Đóng hộp thư" onClick={onClose}>×</button></div><div className="mailbox-history" aria-live="polite">{messages.length===0?<p className="mailbox-empty">Chưa có tin nhắn. Gửi lời chào cho {name.replace(' · Mẫu','')} nhé!</p>:messages.map(message=><p className="mailbox-message" key={message.id}><small>Bạn</small>{message.text}</p>)}<div ref={end}/></div>{!isFriend&&<div className="mailbox-friend-prompt"><span>Chấp nhận lời mời trong mục thử phía nhận ở icon Bạn bè để thử chat NPC.</span><button disabled={isPending} onClick={addFriend}>{isPending?'Đã gửi lời mời':'＋ Kết Bạn'}</button></div>}<form className="mailbox-compose" onSubmit={send}><input ref={input} aria-label="Tin nhắn riêng trong hộp thư" maxLength={300} disabled={!isFriend} value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Nhập tin nhắn riêng..."/><button type="submit" disabled={!isFriend||!draft.trim()}>Gửi</button></form><small className="mailbox-demo-note">Hội thoại mẫu, chỉ lưu trên thiết bị này.</small></section>,document.body);
}

