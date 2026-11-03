// Stable internal identifier, owned by this app; users never need a mailbox.
// Do not change this domain after accounts are created.
export const USERNAME_AUTH_DOMAIN='webchat-one-psi.vercel.app';
export function normalizeUsername(value){return value.trim().toLowerCase();}
export function usernameToIdentity(value,{allowLegacyEmail=false}={}){
 const username=normalizeUsername(value);
 if(allowLegacyEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username))return username;
 if(!/^[a-z0-9_]{3,24}$/.test(username))throw new Error('Tên đăng nhập gồm 3–24 ký tự: chữ không dấu a–z, số hoặc dấu gạch dưới (_).');
 return `player.${username}@${USERNAME_AUTH_DOMAIN}`;
}
export function accountErrorMessage(error){
 if(error.code==='user_already_exists'||error.message==='User already registered')return 'Tên đăng nhập đã được sử dụng. Hãy chọn tên khác.';
 if(error.code==='invalid_credentials'||error.message==='Invalid login credentials')return 'Tên đăng nhập hoặc mật khẩu chưa đúng.';
 if(error.code==='email_not_confirmed'||error.message==='Email not confirmed')return 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.';
 if(error.code==='over_request_rate_limit'||error.status===429)return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
 return error.message||'Chưa kết nối được máy chủ. Vui lòng thử lại.';
}
