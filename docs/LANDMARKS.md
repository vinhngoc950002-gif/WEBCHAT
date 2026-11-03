# Mô hình địa danh trong quảng trường

Mỗi tên phòng trong `src/rooms.js` ánh xạ đến một mục trong `src/landmarks.js`. Dữ liệu này chứa tên địa danh, họ mô hình và biến thể; `src/createLandmark.js` dựng mô hình bằng Three.js. Không tải tài nguyên từ bên ngoài lúc chơi.

Đây là mô hình thu nhỏ cách điệu, dùng những khối hình học cơ bản để gợi hình công trình / tượng / cảnh quan thật. Chưa phải bản sao kiến trúc hoặc chân dung chính xác. Các địa danh cùng họ kiến trúc dùng chung bộ dựng; có thể thay bằng GLB được cấp phép ở các phiên bản sau. Phòng Toàn quốc dùng biểu tượng sen sáng tạo.

Giữ nguyên tên 63 địa phương lịch sử trước năm 2025 theo thiết kế phòng hiện có; không thay đổi mã phòng hay dữ liệu chat.

## Vị trí và tương tác

Mô hình nằm ở tâm sân, có bệ và bảng tên. Đổi phòng sẽ hủy cảnh cũ, giải phóng hình học / vật liệu / texture và dựng cảnh cho phòng mới. Nhân vật bắt đầu ngoài khu vực mô hình; vùng va chạm bảo vệ tâm sân. Dùng chuột kéo để xoay, lăn chuột để thu phóng.

## Tham khảo địa danh

Các nguồn đối chiếu chọn lọc, không phải tài liệu đo đạc để dựng mô hình:

- Tháp Chăm, Pô Nagar, Tháp Nhạn và Mỹ Sơn: https://vietnam.travel/things-to-do/vietnams-cham-legacy/
- Pô Nagar: https://csdl.vietnamtourism.gov.vn/dest/?item=510
- Huế / Ngọ Môn và quần thể cố đô: https://hue.gov.vn/en-us/Home/Tourism/Details/tb/Hue-Citadel-689365
- Thác Bản Giốc: https://vietnam.travel/things-to-do/ban-gioc-waterfall-majestic-beauty-northern-border/
- Cầu đi bộ Ninh Kiều: https://canthotourism.vn/vi/caudibo
- Ninh Kiều: https://vietnam.travel/things-to-do/can-tho-glimpse-river-and-garden/
- Tháp Hòa Phong, chùa Dâu (hiện còn ba tầng): https://giacngo.vn/chua-dau-ngoi-chua-phat-giao-co-nhat-viet-nam-post4755.html

## Danh mục

- Toàn quốc: Biểu tượng sen Việt Nam
- An Giang: Miếu Bà Chúa Xứ Núi Sam
- Bà Rịa - Vũng Tàu: Tượng Chúa Kitô Vua
- Bắc Giang: Chùa Vĩnh Nghiêm
- Bắc Kạn: Hồ Ba Bể
- Bạc Liêu: Biểu tượng đàn kìm
- Bắc Ninh: Tháp Hòa Phong – Chùa Dâu
- Bến Tre: Tượng đài Đồng Khởi
- Bình Định: Tượng đài Quang Trung
- Bình Dương: Tượng Phật nằm chùa Hội Khánh
- Bình Phước: Tượng đài Chiến thắng Đồng Xoài
- Bình Thuận: Tháp Pô Sah Inư
- Cà Mau: Cột cờ Hà Nội tại Mũi Cà Mau
- Cần Thơ: Cầu đi bộ Ninh Kiều
- Cao Bằng: Thác Bản Giốc
- Đà Nẵng: Cầu Rồng
- Đắk Lắk: Tượng đài Chiến thắng Buôn Ma Thuột
- Đắk Nông: Thác Dray Sáp
- Điện Biên: Tượng đài Chiến thắng Điện Biên Phủ
- Đồng Nai: Văn miếu Trấn Biên
- Đồng Tháp: Nhà cổ Huỳnh Thủy Lê
- Gia Lai: Tượng đài Bác Hồ – Đại Đoàn Kết
- Hà Giang: Cột cờ Lũng Cú
- Hà Nam: Chùa Tam Chúc
- Hà Nội: Tháp Rùa
- Hà Tĩnh: Tượng đài Ngã ba Đồng Lộc
- Hải Dương: Văn miếu Mao Điền
- Hải Phòng: Nhà hát lớn Hải Phòng
- Hậu Giang: Tượng đài Chiến thắng Chương Thiện
- Hòa Bình: Tượng đài Bác Hồ tại thủy điện Hòa Bình
- Hưng Yên: Chùa Chuông
- Khánh Hòa: Tháp Bà Pô Nagar
- Kiên Giang: Dinh Cậu
- Kon Tum: Nhà rông Kon Klor
- Lai Châu: Đỉnh Pu Ta Leng
- Lâm Đồng: Hoa dã quỳ – Quảng trường Lâm Viên
- Lạng Sơn: Ải Chi Lăng
- Lào Cai: Đỉnh Fansipan
- Long An: Tượng đài Long An trung dũng kiên cường
- Nam Định: Tháp Phổ Minh
- Nghệ An: Tượng đài Bác Hồ – Quảng trường Hồ Chí Minh
- Ninh Bình: Chùa Bái Đính
- Ninh Thuận: Tháp Pô Klong Garai
- Phú Thọ: Đền Hùng
- Phú Yên: Tháp Nhạn
- Quảng Bình: Quảng Bình Quan
- Quảng Nam: Chùa Cầu Hội An
- Quảng Ngãi: Tượng đài Khởi nghĩa Ba Tơ
- Quảng Ninh: Vịnh Hạ Long
- Quảng Trị: Thành cổ Quảng Trị
- Sóc Trăng: Chùa Dơi
- Sơn La: Tượng đài Bác Hồ – Quảng trường Tây Bắc
- Tây Ninh: Tòa Thánh Tây Ninh
- Thái Bình: Chùa Keo
- Thái Nguyên: Đài tưởng niệm TNXP Đại đội 915
- Thanh Hóa: Thành Nhà Hồ
- Thừa Thiên Huế: Ngọ Môn – Đại Nội Huế
- Tiền Giang: Chùa Vĩnh Tràng
- TP. Hồ Chí Minh: Chợ Bến Thành
- Trà Vinh: Chùa Âng
- Tuyên Quang: Đình Tân Trào
- Vĩnh Long: Văn Thánh miếu Vĩnh Long
- Vĩnh Phúc: Tháp Bình Sơn
- Yên Bái: Ruộng bậc thang Mù Cang Chải

## Long An: mô hình riêng theo ảnh

Thay bộ dựng `victory` chung bằng `src/longAnMonument.js`: hai cụm tượng, tượng người với áo và nếp vải ở trước, khối rồng có mào / vảy / phù điêu phía sau, nền bậc đỏ nâu và vật liệu đá sáng. Bỏ cờ và cụm ba người của mẫu cũ; bỏ bệ tròn phụ cho riêng Long An. Đây là mô hình dựng tay theo ảnh, không phải bản scan hay bản sao có độ chính xác đo đạc.

Nguồn ảnh đối chiếu (không đưa ảnh báo chí vào tài nguyên game):
- Báo Quân đội nhân dân, 05/04/2023: https://www.qdnd.vn/xa-hoi/tin-tuc/dang-huong-tuong-dai-long-an-trung-dung-kien-cuong-toan-dan-danh-giac-724026
- Thông tấn xã Việt Nam / Vietnam News, ảnh góc chéo: https://image.vietnamnews.vn/uploadvnnews/Article/2024/9/29/376556_ttxvn-du-lich-long-an-1802.jpg.png
