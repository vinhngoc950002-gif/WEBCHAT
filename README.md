# Kết Bạn Bốn Phương — Kết Nối Mọi Người

Website mẫu có sảnh **64 phòng cộng đồng**, bản đồ đẳng trục 2.5D bằng Phaser 3, nhân vật tự di chuyển bằng WASD / phím mũi tên / chạm bản đồ / joystick, biểu cảm và bong bóng thoại, giao diện chat bằng React.

> **Phạm vi Alpha 0.1:** nhân vật khác trong bản đồ là NPC mẫu. Chat ở chế độ demo chỉ nằm trên máy hiện tại. Sau khi cấu hình Supabase, các tài khoản có thể gửi/nhận tin nhắn online trong phòng (và Presence đếm kết nối); đã có đồng bộ người chơi cùng phòng qua Supabase Realtime (xem mục Đồng bộ người chơi ở cuối tài liệu).

## 1. Mở trong VS Code trên Windows

Cài **Node.js** (khuyên dùng bản LTS mới; Node 22.12+), VS Code. Giải nén ZIP và vào VS Code > File > Open Folder, chọn thư mục `chat-avatar-vietnam-alpha-0.1`.

Mở Terminal > New Terminal trong VS Code và chạy:

```powershell
npm install
npm run dev
```

Mở địa chỉ được Vite hiển thị, thông thường **http://localhost:5173**. Không cần Supabase để thử bản đồ, thao tác nhân vật, biểu cảm và chat demo.

## 2. Kết nối Supabase để chat thật

1. Tạo project trong https://supabase.com/dashboard.
2. Vào **SQL Editor**, mở `supabase/001_chat_schema.sql`, dán và chạy toàn bộ SQL.
3. Vào **Project Settings > API Keys** (hoặc Connect tùy giao diện), lấy **Project URL** và **publishable key** / **anon key**.
4. Tại thư mục dự án, sao chép `.env.example` thành `.env`, sửa hai giá trị:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

5. Trong Supabase > Authentication > Providers, bật Email. Để thử nhiều tài khoản nhanh, có thể xác nhận email bình thường rồi đăng nhập ở các cửa sổ trình duyệt khác nhau. **Không tắt xác nhận email trên môi trường công khai nếu chưa hiểu tác động.**
6. Dừng và chạy lại `npm run dev`. Đăng ký/đăng nhập trên website. Mở hai trình duyệt với hai tài khoản và vào cùng phòng để thử chat.

**Quan trọng:** Chỉ dùng publishable/anon key ở phía trình duyệt. **Tuyệt đối không đưa `service_role` hoặc secret API key vào `.env` có tiền tố `VITE_`**. Bảng chat đã bật RLS; người dùng chỉ được gửi với `user_id` trùng tài khoản đăng nhập.

## 3. Thử tính năng

- Sảnh chọn phòng: thử ô tìm kiếm hoặc chọn “Toàn quốc”.
- Bản đồ: nhấn nơi muốn đi, hoặc dùng **W A S D**, phím **mũi tên**. Trên Android/iPhone có bộ nút điều khiển ảo.
- Biểu cảm: bấm 👋 ❤️ 😂 ... (bong bóng thoại xuất hiện trên đầu nhân vật).
- Chat: soạn nội dung và nhấn nút gửi. **Demo chỉ hiển thị trong phiên này**; khi Supabase hoạt động và đã đăng nhập, tin nhắn mới lưu DB và truyền qua realtime.
- Nút “Đăng nhập / Thiết lập” ở góc trên: thay tên nhân vật và truy cập đăng nhập.

## 4. Build lên Vercel

```powershell
npm run build
```

Đẩy mã lên GitHub và import repo tại https://vercel.com. Framework: **Vite**, build command: `npm run build`, output directory: `dist`. Trong Vercel > Settings > Environment Variables đặt hai biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (chỉ publishable / anon). Redeploy sau khi thay biến. Thêm domain Vercel vào phần cấu hình Auth URL của Supabase nếu dùng email redirect.

## 5. Giới hạn và lộ trình

- 64 phòng là **63 tên tỉnh/thành Việt Nam trước sắp xếp năm 2025 + 1 phòng Toàn quốc**, không phải thông tin hành chính hiện hành.
- 2.5D được vẽ bằng hình khối trong Phaser; không có sprite bản quyền hay ảnh lấy từ game Avatar Online.
- Không có AI NPC, âm thanh, vật phẩm, chống spam hoàn chỉnh, hệ thống bạn bè, hay quản trị/moderation ở Alpha 0.1.
- Trước khi mở website công khai: bổ sung rate limiting, báo cáo vi phạm, chặn người dùng, quản trị, chính sách nội dung, lọc spam và bảo vệ người chưa thành niên.
- **Alpha 0.2**: máy chủ WebSocket (ví dụ Colyseus / Node.js) xác thực session Supabase, gửi state nhân vật ~5-10Hz, nội suy chuyển động, chia bản đồ thành các kênh và chống gian lận. Supabase Realtime vẫn có thể giữ vai trò chat và Presence.

## Cấu trúc

```
src/
  App.jsx        # Sảnh, xác thực, phòng và chat
  Game.jsx       # Three.js: quảng trường 3D, di chuyển, biểu cảm
  rooms.js       # 64 phòng cộng đồng
  supabase.js    # Client Supabase có kiểm tra chế độ demo
  style.css      # UI desktop/mobile
supabase/
  001_chat_schema.sql
.env.example
```

## Quảng trường mở rộng, kết bạn và tin nhắn riêng

- Sân quảng trường 72 × 72 đơn vị, phạm vi đi bộ từ -34 đến 34; camera đi theo nhân vật.
- Chạy `supabase/001_chat_schema.sql`, rồi `supabase/002_friends_private_messages.sql` trong Supabase SQL Editor.
- Hai tài khoản đăng nhập và vào cùng phòng. Trong phần “Bạn bè & tin nhắn riêng” dưới bản đồ, chọn “Kết bạn”; tài khoản kia chọn “Chấp nhận”.
- Chọn “Nhắn riêng” trong danh sách bạn bè. Hội thoại được lưu trong Supabase và cập nhật qua Realtime; vẫn nhắn được khi bạn bè ở phòng khác hoặc ngoại tuyến.
- Chỉ hai người tham gia được đọc hội thoại; gửi tin yêu cầu quan hệ bạn bè đã được chấp nhận. Tên hiển thị được lưu tại thời điểm gửi lời mời.
- Danh sách người trong phòng là tài khoản thật đang kết nối; nhân vật trên bản đồ vẫn là nhân vật mẫu, chưa đồng bộ vị trí.
- Kiểm tra bằng hai trình duyệt / cửa sổ ẩn danh với hai tài khoản; tài khoản thứ ba không được đọc hoặc gửi vào hội thoại của hai tài khoản này.

## Địa danh theo phòng

Mỗi phòng có một mô hình địa danh riêng ở giữa quảng trường, bảng tên và mô tả dưới bản đồ. Ví dụ: Tháp Rùa, Cầu Rồng, tượng đài Chiến thắng Điện Biên Phủ, Tháp Bà Pô Nagar, Ngọ Môn. Đây là các mô hình thu nhỏ cách điệu dựng bằng Three.js, chưa phải bản sao chi tiết ngoài đời. Danh sách và nguồn tham khảo: `docs/LANDMARKS.md`. Dữ liệu: `src/landmarks.js`; bộ dựng: `src/createLandmark.js`.



## Ghế đá, sân rộng và vật liệu

- 14 ghế đá quanh sân và các lối dạo. Chọn một ghế trên bản đồ hoặc bấm “Ngồi ghế gần nhất” / phím E: nhân vật tự tìm đường, tránh vật cản rồi ngồi.
- Bấm “Đứng dậy”, phím E hoặc WASD / mũi tên để đứng lên. Chọn vị trí khác trên sân cũng sẽ đứng và đi tới đó. Các phím tương tác không kích hoạt khi đang nhập chat.
- Sân 72 × 72 đơn vị, rộng gấp đôi mỗi cạnh so với phiên bản trước. Thêm viền đá, bồn hoa, hàng cây và đèn dạo.
- Vật liệu vân granite / lát sân / cỏ được tạo tại máy, có bump map và độ nhám. Ánh sáng môi trường, tone mapping ACES, bóng đổ và bóng tiếp xúc giúp cảnh có chiều sâu hơn. Mô hình nhân vật và địa danh vẫn cách điệu, chưa phải ảnh chụp hay mô hình quét thực tế.
- Tư thế ngồi hiện chạy cục bộ, cùng giới hạn chưa đồng bộ nhân vật nhiều người chơi của bản Alpha này.

## Vẫy tay và đánh nhau hoạt hình

- Bấm “Vẫy tay” trên bản đồ hoặc biểu cảm 👋 để nhân vật giơ và lắc tay. Có thể vẫy khi đang ngồi.
- Nhấn nhân vật mẫu trên bản đồ hoặc chọn tên trong danh sách ở góc phải, rồi bấm “Đánh nhau”. Vòng sáng đánh dấu mục tiêu. Nhân vật tự tìm đường đến, xoay về đối phương và trao đổi ba đòn với phản ứng trúng đòn cùng hiệu ứng tia sáng.
- Phím di chuyển, chọn vị trí / ghế mới hoặc đổi mục tiêu sẽ hủy giao đấu. Khi đang giao đấu không thể bấm liên tục để chồng nhiều lượt.
- Tương tác hiện là hoạt ảnh cục bộ với bốn nhân vật mẫu; chưa phải chiến đấu trực tuyến giữa các tài khoản. Không thay đổi dữ liệu bạn bè hoặc chat.

## Lời mời kết bạn và danh sách online

- Icon Bạn bè trên thanh đầu trang dùng được cả ở sảnh và trong phòng. Badge đỏ hiển thị số lời mời đến. Người nhận mở icon để chấp nhận hoặc từ chối; người gửi chỉ trở thành bạn sau khi được chấp nhận.
- Danh sách online sử dụng Supabase Presence chung `avatar-global-online`, hiển thị người chơi đang ở sảnh hay phòng nào. Online nghĩa là tài khoản đang mở ứng dụng và có kết nối Realtime, không phải trạng thái của NPC. Mất kết nối cần một khoảng thời gian để Presence phát hiện.
- Mục “Người chơi đang online” cho phép gửi lời mời đến tài khoản thật từ sảnh; trong phòng vẫn dùng được danh sách người chơi hiện có.
- Yêu cầu đã chạy `supabase/002_friends_private_messages.sql`. Không cần bảng dữ liệu mới cho phiên bản này. Kiểm thử bằng hai tài khoản trên hai trình duyệt: gửi → badge bên nhận → chấp nhận → bên gửi hiện đã kết bạn; thử từ chối để xác nhận có thể gửi lại. Mở/đóng ứng dụng bên kia để kiểm tra online/offline. Các thay đổi được nhận qua Realtime, có tải lại dự phòng mỗi 15 giây để đồng bộ thao tác từ chối/xóa.
- NPC trên bản đồ chỉ mô phỏng cục bộ. Nút Kết Bạn tạo lời mời chờ, không tự chấp nhận. Icon Bạn bè có mục “Thử phía nhận · NPC” với quyết định mẫu để kiểm tra giao diện. Dữ liệu NPC cũ tự kết bạn ngay không được coi là lời mời đã chấp nhận trong luồng mới.

## Tài khoản bằng tên đăng nhập

- Đăng ký bằng tên đăng nhập (3–24 chữ a–z, số, dấu `_`), mật khẩu và tên nhân vật. Tên đăng nhập không phân biệt hoa/thường.
- Supabase vẫn quản lý mật khẩu và phiên đăng nhập; ứng dụng ánh xạ tên sang định danh nội bộ `player.<username>@webchat-one-psi.vercel.app`. Người dùng không phải sở hữu hộp thư này. Không đổi miền định danh sau khi đã tạo tài khoản. Không lưu mật khẩu tại localStorage hay bảng dữ liệu riêng.
- Trong Supabase Auth, bật Email provider và **tắt Confirm email**, rồi Save. Frontend kiểm tra `/auth/v1/settings` trước đăng ký để không tạo tài khoản chờ xác nhận ngoài ý muốn.
- Tài khoản email cũ vẫn đăng nhập được bằng email cũ; không tự chuyển đổi chúng thành tài khoản tên đăng nhập. Form mới không yêu cầu email khi đăng ký.



## Đồng bộ người chơi cùng phòng

- `src/roomPlayers.js` dùng Presence cho danh sách và ảnh chụp trạng thái ban đầu, Broadcast cho vị trí/hướng di chuyển khoảng 10 lần/giây khi có thay đổi. Mỗi phòng có kênh riêng theo mã phòng; không cần thêm bảng hoặc chạy SQL mới cho vị trí.
- Nhân vật thật được tạo khi tài khoản khác vào phòng và được gỡ khi rời phòng; bỏ qua chính tài khoản hiện tại, kể cả nếu mở nhiều tab. Avatar khác nhau theo ID, có tên hiển thị và vị trí xuất phát theo tài khoản.
- Đồng bộ di chuyển, hướng quay, ngồi/đứng và vẫy cả hai tay. Client nội suy chuyển động giữa các bản tin. Danh sách nhỏ trên bản đồ và nhấn chọn nhân vật dùng ID để tránh nhầm người có tên giống nhau.
- Đây là đồng bộ client qua kênh Realtime công khai, không phải máy chủ vật lý có chống gian lận. Chan Nhau giữa người chơi chưa được bật; hoạt ảnh đánh NPC cũ không được áp dụng giả lên tài khoản thật.
- Kiểm tra kết nối thực tế: có `.env.local` chứa hai biến Supabase rồi chạy `node scripts/check-room-sync.mjs`. Bài kiểm tra mở hai kết nối độc lập cùng một phòng kiểm thử tạm, kiểm tra thấy nhau, vào sau, vị trí, vẫy tay, tư thế ngồi, rời phòng và cách ly phòng. Không tạo tài khoản hoặc ghi dữ liệu lâu dài.
- Kiểm tra giao diện bằng hai trình duyệt / cửa sổ ẩn danh, đăng nhập hai tài khoản khác nhau vào cùng mã phòng; di chuyển ở một cửa sổ và quan sát cửa sổ kia. Cả hai phải tải lại bản triển khai mới.

### Khôi phục danh sách người chơi và số đếm

Kênh plaza bổ sung handshake `player-hello`, heartbeat và bản tin rời phòng. Khi ảnh chụp Presence cập nhật chậm, hai client vẫn trao đổi trạng thái trực tiếp trong đúng kênh phòng. Tiêu đề phòng và bảng nhân vật sử dụng cùng callback số người từ transport, thay vì đếm từ kênh chat riêng. Số đếm là số tài khoản duy nhất, bao gồm bản thân; khi mất kết nối thì hiển thị trạng thái đang kết nối thay vì khẳng định đã đồng bộ.

`node scripts/check-room-discovery.mjs` kiểm tra trường hợp cố tình không cung cấp Presence snapshot, tìm nhau qua hello, chuyển động, cách ly phòng và cập nhật số lượng sau khi rời. Đây vẫn là cơ chế đồng bộ client, không phải máy chủ xác thực vị trí/chống giả mạo.
