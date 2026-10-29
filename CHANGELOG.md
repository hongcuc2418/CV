# Changelog

## v1.3.0 — Professional Templates

- Thiết kế lại mặc định Academic Executive: đầu trang xanh mực/sắc đồng, hai cột, tiêu đề serif và liên hệ cột phụ.
- Thêm Modern Professional một cột và Classic ATS văn bản đen trắng, không ảnh.
- Thư viện mẫu có thumbnail nội dung thực tế; chọn/hoàn tác mẫu giữ nguyên dữ liệu và các tùy chỉnh.
- Mỗi mẫu dùng chung mô hình A4/PDF/HTML, phân trang khi nội dung dài. Classic giữ thứ tự đọc một cột; Academic sắp xếp trong từng cột.
- Chế độ đen trắng cho cả preview A4 và bản xuất, gồm chuyển sắc xám ảnh PDF; giữ ảnh gốc trong dữ liệu.
- Giữ schema/key v2, tự bổ sung trường template/monochrome cho backup cũ; không reset hồ sơ.
- Kiểm tra nhiều mẫu, tương thích dữ liệu, PDF A4 và nội dung dài; lưu lựa chọn mẫu/đen trắng ngay sau thao tác.

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
