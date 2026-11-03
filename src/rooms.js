import {getLandmark} from './landmarks.js';
// 63 tên tỉnh/thành trước sắp xếp năm 2025, giữ làm tên phòng cộng đồng.
// Phòng thứ 64 là "Toàn quốc"; không phải tuyên bố danh sách hành chính hiện hành.
const locations = [
  'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu','Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước','Bình Thuận','Cà Mau','Cần Thơ','Cao Bằng','Đà Nẵng','Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp','Gia Lai','Hà Giang','Hà Nam','Hà Nội','Hà Tĩnh','Hải Dương','Hải Phòng','Hậu Giang','Hòa Bình','Hưng Yên','Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','TP. Hồ Chí Minh','Trà Vinh','Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'
];
export const rooms = ['Toàn quốc', ...locations].map((name, index) => ({ id: `room-${String(index + 1).padStart(2, '0')}`, name, icon: index === 0 ? '🌏' : ['🏙️','🌿','🌸','🏖️','🏡','🌊'][index % 6], landmark: getLandmark(name), tagline: getLandmark(name).name }));

// Display priority is separate from the canonical room IDs and default room.
const priorityNames = ['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Long An','Bình Dương','Đồng Nai'];
export const displayRooms = [
  ...priorityNames.map(name => rooms.find(room => room.name === name)),
  ...rooms.filter(room => !priorityNames.includes(room.name))
];
