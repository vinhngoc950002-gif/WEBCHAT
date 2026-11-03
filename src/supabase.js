import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const onlineEnabled = Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.startsWith('YOUR_'));
export const supabase = onlineEnabled ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }, realtime: { worker: typeof Worker !== 'undefined', heartbeatIntervalMs: 15000 } }) : null;

// Check before registration so an unconfirmed placeholder account is never created.
export async function ensureUsernameSignupReady(){
 if(!supabase)throw new Error('Chưa kết nối được máy chủ tài khoản.');
 const response=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('Không kiểm tra được máy chủ tài khoản. Vui lòng thử lại.');
 const settings=await response.json();
 if(settings.disable_signup)throw new Error('Hệ thống đang tạm ngừng tạo tài khoản mới.');
 if(!settings.mailer_autoconfirm)throw new Error('Chế độ đăng ký bằng tên đang chờ quản trị viên hoàn tất thiết lập.');
}

