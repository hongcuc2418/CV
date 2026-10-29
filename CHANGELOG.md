# Changelog

## v1.2.0 — CV Studio, Reliable Export & Professional Content

Bản phát hành gộp các phạm vi roadmap v1.0.1, v1.1.0 và v1.2.0 trong một lần nâng cấp.

- Thêm Studio A4: preview vector, zoom, số trang, ngắt dòng/phân trang theo font metrics; kéo thả/nút sắp xếp, ẩn mục, chỉnh lề/cỡ chữ/giãn dòng/khoảng cách.
- Tải PDF trực tiếp bằng cùng mô hình tọa độ với preview; nhúng font tiếng Việt; hỗ trợ nhiều trang và crop ảnh.
- Xuất CV HTML và Landing HTML tự chứa font/ảnh, không script/editor; giữ bố cục A4 khi in.
- Thay font đóng gói sẵn, chuẩn hóa Unicode NFC; xử lý compositionstart/compositionend và không dựng lại trường đang nhập. Sửa tracking khiến dấu tách khỏi chữ.
- Thêm nhiệm vụ và kết quả riêng, dự án/vai trò/phạm vi/đóng góp, kỹ năng chuyên môn/công cụ/ngoại ngữ, gợi ý theo ba nhóm vị trí và checklist thông tin.
- Xác nhận từng kinh nghiệm/dự án; sửa nội dung tự bỏ xác nhận cũ; giữ ghi chú bản nháp nếu chưa xác nhận.
- Schema v2, migration v1, giữ key v1 gốc; lưu có trạng thái thật; xử lý bản lưu lỗi, quota, tab khác cập nhật; undo/redo; ảnh tối ưu tại thiết bị.
- Giữ cấu hình Vercel, không thêm backend hoặc yêu cầu secret. Boss tự push/deploy.

## v1.0.0

- Landing page CV, editor trường cơ bản, màu/font, ảnh, localStorage và JSON backup.
- Có mã in/HTML nhưng chưa xác minh đầy đủ đầu ra trong browser kiểm tra. Bản v1.2.0 bổ sung engine PDF trực tiếp và kiểm tra PDF thực tế.
