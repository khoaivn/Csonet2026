# Điều khiển riêng bằng iPhone

Link cố định: https://khoaivn.github.io/Csonet2026/remote.html

Chỉ tài khoản Google **dung.phamtrung@phenikaa-uni.edu.vn** được đọc và điều khiển phòng. Việc kiểm tra tài khoản nằm trong Firebase Realtime Database Rules, không chỉ ở giao diện. Người khác vẫn có thể mở trang đăng nhập hoặc trang slide công khai, nhưng không được đọc phòng, gửi lệnh, Laser/Pen hoặc thay trạng thái phiên.

## Cấu hình Firebase một lần

1. Mở project **slides** trong Firebase Console.
2. Vào **Security → Authentication → Get started**. Trong **Sign-in method**, bật **Google**, chọn support email của bạn rồi Save.
3. Vào **Authentication → Settings → Authorized domains**, thêm `khoaivn.github.io` (chỉ tên miền, không có `https://` hay `/Csonet2026`).
4. Vào **Settings → Project settings → General → Your apps**. Nếu chưa có app Web, chọn icon **</>**, đặt tên app (ví dụ `slides-remote`), đăng ký app; không cần Firebase Hosting. Sao chép `firebaseConfig` trong phần SDK setup.
5. Điền các giá trị cấu hình Web vào `firebase-config.js`. `apiKey` của Firebase Web là cấu hình công khai, không phải private key. Không đưa service account hay private key vào website.
6. Trong **Realtime Database → Rules**, thay nội dung bằng toàn bộ `firebase.rules.json` mới và nhấn **Publish**. File này dành cho database riêng của slide; nếu dùng chung với ứng dụng khác, cần hợp nhất Rules cẩn thận.
7. Đẩy tất cả file thay đổi và file mới (bao gồm `firebase-config.js`, `remote-auth.js`) lên GitHub. Tải lại trang trên hai thiết bị sau khi GitHub Pages cập nhật.

**Chỉ cập nhật giao diện mà chưa Publish Rules thì quyền Firebase cũ vẫn còn mở.** Chỉ Publish Rules mới mà chưa cập nhật website thì remote cũ sẽ bị từ chối truy cập. Nên cập nhật cả hai trong cùng lần triển khai.

## Sử dụng

- Máy tính: mở trang slide và đăng nhập Google bằng đúng tài khoản trên. Trình duyệt nhớ đăng nhập; khi mở lại trang, remote tự kết nối, không cần nút Bật điều khiển.
- iPhone: mở link cố định bằng Safari, đăng nhập cùng tài khoản. Có thể lưu dấu trang hoặc thêm vào Màn hình chính. Nếu chưa mở trang slide trên máy tính, điện thoại sẽ chờ.
- Slide và ghi chú chia hai phần. Dọc: trên/dưới. Ngang: cạnh nhau.
- Icon bàn tay: vuốt trái để tiếp, vuốt phải để lùi trên phần slide. Laser/Pen: chạm và kéo trên slide, đồng bộ lên máy tính. Chọn lại bàn tay để vuốt chuyển trang. Nút xóa trên điện thoại xóa nét tạo từ điện thoại trên slide hiện tại.
- Nút Đăng xuất ngắt kết nối thiết bị. Trang slide công khai vẫn hoạt động bình thường khi chưa đăng nhập.
- Máy tính phải giữ trang slide mở, có Internet và không ngủ. Phiên có hiệu lực 4 giờ. Mở phiên mới sẽ thay thế phiên cũ, iPhone vẫn dùng cùng link.

## Kiểm tra quyền sau triển khai

1. Đăng nhập đúng tài khoản trên máy tính và iPhone: chuyển slide, thử Laser/Pen.
2. Mở link remote trong cửa sổ riêng tư: phải yêu cầu đăng nhập và không điều khiển được.
3. Đăng nhập một tài khoản Google khác: phải báo không có quyền.
4. Đọc trực tiếp URL phòng Firebase khi không có token đăng nhập: phải bị Permission denied, kể cả biết mã phòng.

## Nếu không đăng nhập hoặc kết nối được

- `auth/unauthorized-domain`: thêm `khoaivn.github.io` vào Authorized domains.
- `auth/operation-not-allowed`: bật Google trong Sign-in method.
- `auth/popup-blocked`: mở link bằng Safari, cho phép cửa sổ đăng nhập và nhấn lại nút Đăng nhập Google. Không cần tắt bảo vệ theo dõi của Safari.
- `auth/invalid-api-key` hoặc thiếu cấu hình: kiểm tra `firebase-config.js` dùng cấu hình của project `slides-35d62`.
- Đã đăng nhập nhưng Permission denied: kiểm tra đã Publish đúng Rules cho **Realtime Database**, tài khoản đúng email và email đã xác minh; không dùng Firestore Rules.

Firebase chỉ nhận trạng thái phòng, lệnh và tọa độ Laser/Pen. Slide và ghi chú tải từ GitHub Pages. Nét vẽ giữ trong phiên hiện tại; tải lại điện thoại có thể làm mất nét khi vẽ lại. Phòng hết hạn không tự xóa; có thể dọn dữ liệu cũ trong Firebase Console. Theo dõi Usage theo gói Firebase của project.

Tài liệu chính thức: https://firebase.google.com/docs/auth/web/google-signin và https://firebase.google.com/docs/database/security/rules-conditions

## Điện thoại chờ dù trang slide đã mở

Trang slide và iPhone đều phải đăng nhập tài khoản chủ sở hữu. Trên máy tính, nhấn icon điện thoại và kiểm tra trạng thái: nếu có Firebase từ chối ghi phòng, phiên chưa được tạo; kiểm tra Rules đã Publish. Nếu điện thoại báo Firebase từ chối đọc phòng, kiểm tra quyền của tài khoản và Rules. Chỉ thông báo đang chờ khi đọc được database nhưng chưa có phiên hoặc phiên hết hạn.
