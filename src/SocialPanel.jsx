import {useEffect,useRef,useState} from 'react';
import {supabase} from './supabase.js';

export default function SocialPanel({session,roomId,nickname,onLogin,people=[]}) {
 const uid=session?.user?.id;
 const [links,setLinks]=useState([]),[peer,setPeer]=useState(null);
 const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const end=useRef(null);
 const [viewedPerson,setViewedPerson]=useState(null);
 useEffect(()=>{setViewedPerson(null);},[roomId]);

 useEffect(()=>{
  if(!uid||!supabase)return;
  let alive=true,version=0;
  async function load(){const request=++version;const {data,error}=await supabase.from('friendships').select('*').order('created_at',{ascending:false});if(alive&&request===version){if(error)setError('Chưa tải được bạn bè. Hãy chạy 002_friends_private_messages.sql trong Supabase.');else setLinks(data||[]);}}
  window.addEventListener('avatar-friendships-changed',load);const poll=setInterval(load,15000);
  const channel=supabase.channel(`friendships-${uid}`).on('postgres_changes',{event:'*',schema:'public',table:'friendships'},load).subscribe(status=>{if(status==='SUBSCRIBED')load();});
  load();
  return()=>{alive=false;clearInterval(poll);window.removeEventListener('avatar-friendships-changed',load);supabase.removeChannel(channel);};
 },[uid]);
 const peerId=peer?.id;
 useEffect(()=>{
  setMessages([]);setDraft('');
  if(!uid||!peerId)return;
  let alive=true,version=0;
  async function load(){const request=++version;const {data,error}=await supabase.from('private_messages').select('*').or(`and(sender_id.eq.${uid},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${uid})`).order('created_at',{ascending:false}).limit(100);if(alive&&version===request){if(error)setError(error.message);else setMessages((data||[]).reverse());}}
  const channel=supabase.channel(`private-${uid}-${peerId}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'private_messages'},load).subscribe(status=>{if(status==='SUBSCRIBED')load();});
  load();return()=>{alive=false;supabase.removeChannel(channel);};
 },[uid,peerId]);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages]);
 async function perform(task){setBusy(true);setError('');try{const result=await task();if(result.error)throw result.error;if(result.data)setLinks(prev=>[...prev.filter(x=>x.id!==result.data.id),result.data]);window.dispatchEvent(new Event('avatar-friendships-changed'));}catch(e){setError(e.message);}finally{setBusy(false);}}
 const other=link=>({id:link.requester_id===uid?link.recipient_id:link.requester_id,name:link.requester_id===uid?link.recipient_name:link.requester_name});
 async function send(e){e.preventDefault();const content=draft.trim();if(!content||busy)return;await perform(async()=>{const result=await supabase.from('private_messages').insert({sender_id:uid,recipient_id:peerId,content}).select().single();if(!result.error){setDraft('');setMessages(prev=>prev.some(m=>m.id===result.data.id)?prev:[...prev,result.data]);}return {error:result.error};});}
 if(!uid)return <section className="social-panel"><h3>Bạn bè & tin nhắn riêng</h3><p>Đăng nhập để kết bạn với người trong phòng và nhắn tin riêng.</p><button className="button secondary" onClick={onLogin}>Đăng nhập</button></section>;
 return <section className="social-panel"><h3>Bạn bè & tin nhắn riêng</h3>{error&&<p role="alert" className="auth-error">{error}</p>}{viewedPerson&&<div className="player-info-card"><div className="profile-title"><strong>Thông tin · {viewedPerson.name}</strong><button aria-label="Đóng thông tin người chơi" onClick={()=>setViewedPerson(null)}>×</button></div><dl><div><dt>Trạng thái</dt><dd>{people.some(person=>person.id===viewedPerson.id)?'Đang trong phòng':'Đã rời phòng'}</dd></div><div><dt>Quan hệ</dt><dd>{links.some(link=>other(link).id===viewedPerson.id&&link.status==='accepted')?'Đã là bạn bè':links.some(link=>other(link).id===viewedPerson.id)?'Đã gửi lời mời':'Chưa kết bạn'}</dd></div></dl><div className="real-profile-buttons"><button className="button secondary compact" disabled={busy||links.some(link=>other(link).id===viewedPerson.id)} onClick={()=>perform(()=>supabase.from('friendships').insert({requester_id:uid,recipient_id:viewedPerson.id,requester_name:nickname,recipient_name:viewedPerson.name.slice(0,24)}).select().single())}>{links.some(link=>other(link).id===viewedPerson.id&&link.status==='accepted')?'Đã kết bạn':links.some(link=>other(link).id===viewedPerson.id)?'Đã gửi lời mời':'Kết Bạn'}</button><button className="button secondary compact" disabled={!links.some(link=>other(link).id===viewedPerson.id&&link.status==='accepted')} title="Nhắn tin riêng sau khi đã kết bạn" onClick={()=>setPeer(viewedPerson)}>Nhắn Tin</button></div></div>}<div className="social-columns"><div><h4>Người khác trong phòng ({people.length})</h4>{people.length===0&&<p>Chưa có người khác. Mời bạn vào cùng phòng để kết bạn.</p>}{people.map(person=>{const link=links.find(l=>other(l).id===person.id);return <div className="social-person" key={person.id}><button className="person-info-link" onClick={()=>setViewedPerson(person)} title="Xem thông tin người chơi">{person.name}</button>{link?<small>{link.status==='accepted'?'Đã là bạn':'Đã gửi lời mời'}</small>:<button disabled={busy} onClick={()=>perform(()=>supabase.from('friendships').insert({requester_id:uid,recipient_id:person.id,requester_name:nickname,recipient_name:person.name.slice(0,24)}).select().single())}>Kết bạn</button>}</div>;})}<h4>Lời mời kết bạn</h4>{!links.some(l=>l.status==='pending')&&<p>Chưa có lời mời.</p>}{links.filter(l=>l.status==='pending').map(l=><div className="social-person" key={l.id}><button className="person-info-link" onClick={()=>setViewedPerson(other(l))} title="Xem thông tin người chơi">{other(l).name}</button>{l.recipient_id===uid?<><button disabled={busy} onClick={()=>perform(()=>supabase.rpc('accept_friendship',{friendship_id:l.id}).single())}>Chấp nhận</button><button disabled={busy} onClick={()=>perform(async()=>{const r=await supabase.from('friendships').delete().eq('id',l.id);if(!r.error)setLinks(prev=>prev.filter(x=>x.id!==l.id));return r;})}>Từ chối</button></>:<small>Đã gửi lời mời</small>}</div>)}</div><div><h4>Bạn bè ({links.filter(l=>l.status==='accepted').length})</h4>{links.filter(l=>l.status==='accepted').map(l=><div className="social-person" key={l.id}><button className="person-info-link" onClick={()=>setViewedPerson(other(l))} title="Xem thông tin người chơi">{other(l).name}</button><button onClick={()=>setPeer(other(l))}>Nhắn riêng</button></div>)}{!peer&&<p>Chọn một người bạn để mở hội thoại riêng.</p>}{peer&&<div className="private-chat"><div className="social-person"><strong>Nhắn riêng · {peer.name}</strong><button onClick={()=>setPeer(null)} aria-label="Đóng tin nhắn riêng">×</button></div><div className="private-history" aria-live="polite">{messages.length===0&&<p>Hãy gửi lời chào đầu tiên!</p>}{messages.map(m=><div className={`private-message ${m.sender_id===uid?'mine':''}`} key={m.id}><small>{m.sender_id===uid?'Bạn':peer.name}</small><p>{m.content}</p></div>)}<div ref={end}/></div><form className="chat-input" onSubmit={send}><input aria-label="Tin nhắn riêng" maxLength={1000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Nhập tin nhắn riêng..."/><button className="send-btn" disabled={busy||!draft.trim()} type="submit">Gửi</button></form></div>}</div></div></section>;
}


