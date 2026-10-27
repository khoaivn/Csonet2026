# Điều khiển slide bằng iPhone qua Internet

Website tiếp tục chạy trên GitHub Pages. Firebase Realtime Database truyền số slide và lệnh chuyển trang giữa máy tính và iPhone; không cần cùng Wi-Fi. Chưa cấu hình Firebase thì slide vẫn hoạt động bình thường, nhưng Remote chưa kết nối được.

## Cấu hình lần đầu

1. Mở https://console.firebase.google.com/ và tạo project. Không cần bật Google Analytics.
2. Trong project, chọn **Build → Realtime Database → Create Database**. Chọn vị trí phù hợp (ví dụ Singapore nếu có), rồi chọn **Locked mode**.
3. Mở tab **Rules** của Realtime Database. Với database mới dành riêng cho slide này, thay nội dung bằng toàn bộ file `firebase.rules.json` trong repository, rồi nhấn **Publish**. Không chọn Rules cho phép đọc/ghi toàn bộ database. Nếu database đã dùng cho ứng dụng khác, cần hợp nhất Rules thay vì ghi đè.
4. Mở tab **Data**, sao chép Database URL. Ví dụ: `https://TEN-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app` (URL thực tế có thể kết thúc bằng `firebaseio.com`). Không cần service account, khóa bí mật hay Firebase Authentication.
5. Đẩy các file mới và các thay đổi lên GitHub. Giữ `remote.html`, `remote.js`, `remote.css` cạnh `index.html`, `script.js`, `styles.css`.

## Khi thuyết trình

1. Trên máy tính, mở website slide; rê chuột xuống góc trái dưới và chọn icon **điện thoại**.
2. Dán Database URL → **Tạo phòng**. URL được nhớ trên trình duyệt máy tính để dùng lần sau.
3. Nhấn **Sao chép liên kết**, gửi cho iPhone bằng ứng dụng bạn thường dùng và mở bằng Safari.
4. Dùng **← / →**, chọn slide trong danh sách, hoặc đọc ghi chú trên iPhone. Chuyển slide bằng bàn phím trên máy tính cũng cập nhật về iPhone.
5. Đóng hộp thoại trên máy tính để tiếp tục trình chiếu. Khi kết thúc, mở lại icon điện thoại → **Đóng phòng**.

## Phạm vi và kết nối

- Cả hai thiết bị cần Internet. Máy tính phải giữ trang trình chiếu mở, hoạt động và không vào chế độ ngủ. Khi iPhone trở lại Safari sau khi khóa màn hình, trang sẽ thử kết nối lại.
- Đồng bộ bằng REST mỗi giây; thao tác có thể mất khoảng 1–2 giây hoặc lâu hơn tùy đường truyền. Giao diện chỉ nhận lệnh tiếp theo sau khi máy tính xác nhận để tránh mất thứ tự.
- Phòng dùng liên kết ngẫu nhiên 128 bit. Ai có liên kết đều có thể điều khiển; không đăng liên kết lên nơi công khai. Danh sách phòng không thể được đọc qua Rules đã cung cấp.
- Phòng hết quyền truy cập sau 4 giờ. Đóng phòng sẽ xóa dữ liệu phòng. Phòng hết hạn không tự xóa khỏi database; có thể xóa dữ liệu cũ thủ công trong Firebase Console.
- Chỉ số slide, thời hạn, lệnh và dấu thời gian được gửi lên Firebase; ghi chú được tải từ website slide.
- Không gửi laser/pen từ điện thoại. Các công cụ hiện tại vẫn dùng trên máy tính.
- Firebase áp dụng hạn mức theo gói của project. Xem Usage trong Console nếu sử dụng thường xuyên.

## Nếu không kết nối được

- `Không có quyền truy cập`: kiểm tra đã Publish đúng Rules trong **Realtime Database**, không phải Firestore; phòng cũng có thể hết hạn.
- `Database URL chưa đúng`: sao chép URL ở tab Data, không phải đường dẫn Firebase Console.
- `Máy tính mất kết nối`: đưa tab slide ra trước, kiểm tra mạng và tắt chế độ ngủ trên máy tính; tạo phòng mới nếu vừa tải lại trang máy tính.

Tham khảo chính thức: https://firebase.google.com/docs/reference/rest/database/ và https://firebase.google.com/docs/database/security

## Database của bản trình chiếu này

`https://slides-35d62-default-rtdb.asia-southeast1.firebasedatabase.app` đã được điền sẵn làm giá trị mặc định trong `remote.js`. Vẫn cần Publish Rules trước khi tạo phòng.
