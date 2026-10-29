# Kiểm tra v1.0.0

## Đã chạy thành công

- Kiểm tra cú pháp `public/app.js`, `public/model.js`.
- 6 kiểm tra tự động bằng Node test runner: backup round trip; schema/ảnh không hợp lệ; giới hạn danh sách và boolean; chặn prototype pollution; escape nội dung và liên hệ an toàn; sửa trường lồng nhau.
- Build ra `dist/`, không dependency runtime.
- Trên trình duyệt: trang CV hiển thị; sửa vị trí ứng tuyển; thêm kinh nghiệm và sửa tên; cập nhật học vấn; đổi màu; ẩn mục chứng chỉ; đóng bảng sửa và reload vẫn giữ thông tin; đặt lại qua dialog; tải JSON có tệp thật.
- Quan sát desktop, mobile iframe 390px (vùng nội dung 375px sau scrollbar), tablet iframe 768px. Nội dung mobile không tràn ngang: `scrollWidth === clientWidth === 375`.
- Đã đưa dữ liệu kiểm tra về mẫu ban đầu. Các trang fixture QA không nằm trong source bàn giao.

## Giới hạn xác minh

- Browser kiểm tra không cấp quyền nhập file; không thử cách khác để vượt giới hạn. Luồng chọn tệp chưa được xác minh end-to-end, bộ xác thực JSON đã được unit test.
- Bấm Xuất PDF không mở được hộp thoại in trong browser kiểm tra. App có CSS A4 và DOM CV riêng nhưng chưa có tệp PDF thực tế được xuất để kiểm tra số trang/render tại môi trường này. Cần kiểm tra Print Preview trên Chrome/Edge desktop trước khi ứng tuyển.
- Xuất HTML đã được triển khai (nhúng CSS, nội dung, ảnh; bỏ script và editor; giữ layout print). Browser kiểm tra không trả tệp HTML tải xuống dù handler chạy; chưa xác minh download end-to-end. Nếu Chrome/Edge hỏi về tải tệp HTML, chỉ lưu khi đây là tệp do chính Boss chủ động xuất.
- Tải ảnh và điều chỉnh vị trí ảnh đã có mã xử lý; chưa xác minh upload ảnh trên browser vì giới hạn cấp quyền nhập file.
- Chưa push GitHub, chưa deploy Vercel, chưa có kiểm tra production. Xem DELIVERY.md.
