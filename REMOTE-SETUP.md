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
- Chỉ số slide, thời hạn, lệnh, tọa độ Laser/Pen và dấu thời gian được gửi lên Firebase; nội dung slide và ghi chú được tải từ website.
- Màn hình điện thoại có hai phần: slide và ghi chú. Để dọc: slide ở trên; xoay ngang: slide và ghi chú nằm cạnh nhau.
- Chọn biểu tượng bàn tay để vuốt trái/phải trên slide. Chọn Laser hoặc Pen để chạm và kéo trực tiếp trên slide; nét vẽ và laser đồng bộ lên máy tính. Chọn lại bàn tay để chuyển bằng vuốt.
- Nút xóa trên điện thoại xóa nét vẽ tạo từ điện thoại ở slide hiện tại. Nét vẽ giữ trong phiên điều khiển hiện tại; tải lại điện thoại có thể làm mất nét khi vẽ lại.
- Sau khi cập nhật tính năng Laser/Pen, phải Publish lại file `firebase.rules.json` mới. Các phòng cũ nên đóng và tạo lại.
- Firebase áp dụng hạn mức theo gói của project. Xem Usage trong Console nếu sử dụng thường xuyên.

## Nếu không kết nối được

- `Không có quyền truy cập`: kiểm tra đã Publish đúng Rules trong **Realtime Database**, không phải Firestore; phòng cũng có thể hết hạn.
- `Database URL chưa đúng`: sao chép URL ở tab Data, không phải đường dẫn Firebase Console.
- `Máy tính mất kết nối`: đưa tab slide ra trước, kiểm tra mạng và tắt chế độ ngủ trên máy tính; tạo phòng mới nếu vừa tải lại trang máy tính.

Tham khảo chính thức: https://firebase.google.com/docs/reference/rest/database/ và https://firebase.google.com/docs/database/security

## Database của bản trình chiếu này

`https://slides-35d62-default-rtdb.asia-southeast1.firebasedatabase.app` đã được điền sẵn làm giá trị mặc định trong `remote.js`. Vẫn cần Publish Rules trước khi tạo phòng.

Laser/Pen sử dụng kết nối EventSource tới Firebase để nhận cập nhật liên tục. Bản xem trước là chính trang slide, nên cần đẩy đầy đủ các file thay đổi cùng lúc.

## Liên kết cố định cho một người dùng

Mở `https://khoaivn.github.io/Csonet2026/remote.html` trên iPhone và lưu dấu trang hoặc thêm vào Màn hình chính. Khi máy tính chưa bật điều khiển, điện thoại chờ; khi bật, điện thoại tự kết nối. Tắt rồi bật lại hoặc tạo phiên mới vẫn dùng cùng liên kết. Cần đẩy toàn bộ file cập nhật và Publish lại `firebase.rules.json`.

Trên máy tính, chọn icon điện thoại → **Bật điều khiển**; cuối buổi chọn **Tắt điều khiển**. Một phiên kéo dài 4 giờ. Khi mở phiên mới trên máy tính khác, phiên máy tính cũ tự dừng để tránh điều khiển chồng nhau. Link cũ có mã phòng trong phần `#room` chỉ dùng cho phòng cũ; hãy lưu link cố định ở trên.

Liên kết cố định không yêu cầu đăng nhập; bất kỳ ai có liên kết đều có thể điều khiển khi máy tính bật tính năng này.

## Tự kết nối khi mở slide

Không cần nhấn Bật điều khiển: mở trang slide trên máy tính là tự tạo phiên Firebase. iPhone chỉ cần mở `https://khoaivn.github.io/Csonet2026/remote.html`. Nếu chưa mở slide trên máy tính, điện thoại sẽ chờ. Bản xem trước trên iPhone không tạo phiên hoặc giành quyền máy tính.

Nếu kết nối lỗi, trang máy tính hiện hộp thoại để kiểm tra Database URL và thử **Kết nối lại**. Cần giữ trang slide máy tính mở, có mạng và không ngủ. Nút **Ngắt kết nối** có thể dừng phiên thủ công. Chức năng đăng nhập riêng tư chưa được cấu hình; người có liên kết vẫn có thể điều khiển phiên đang hoạt động.
