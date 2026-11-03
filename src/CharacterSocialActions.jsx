import {useNpcFriend} from './npcSocial.js';
export default function CharacterSocialActions({name,onMessage}){
 const {isFriend,isPending,addFriend}=useNpcFriend(name);
 return <div className="profile-social-actions"><div className="profile-social-buttons"><button disabled={isFriend||isPending} onClick={addFriend}>{isFriend?'✓ Đã kết bạn':isPending?'Đã gửi lời mời':'＋ Kết Bạn'}</button><button className="profile-mailbox-button" aria-label={`Mở hộp thư với ${name.replace(' · Mẫu','')}`} title="Mở hộp thư riêng" onClick={()=>onMessage(name)}><span aria-hidden="true">✉</span> Hộp Thư</button></div><small>Nhân vật mẫu: kết bạn và tin nhắn chỉ lưu trên máy này.</small></div>;
}

