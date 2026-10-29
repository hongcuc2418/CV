# Changelog

## v1.4.0 — Multiple CVs & Recovery

- Quản lý nhiều CV độc lập: tạo/nhân bản, tên hồ sơ, trường/vị trí, chọn nhanh, tìm, lưu trữ và khôi phục.
- Lịch sử riêng cho từng CV: tự lưu mốc, đặt tên phiên bản, so sánh nội dung/thiết kế giữa CV hoặc lịch sử, giữ hiện trạng trước khôi phục/đặt lại/đổi vị trí.
- Collection schema 1 chứa CV schema 2; tự chuyển dữ liệu v1/v2, giữ key gốc. Lưu một record có kiểm tra phiên bản trước ghi; báo lỗi quota/tab khác, không tự ghi đè bản hỏng.
- Backup một/toàn bộ CV có lịch sử và ảnh gom tài nguyên; nhập thành bản sao ID mới, nhận JSON cũ, không ghi đè CV hiện tại.
- Sửa Landing page: cùng SVG/hình học với A4 cho cả bốn mẫu, sắp xếp/ẩn/crop/đen trắng/phân trang. HTML web và CV HTML cùng trang A4, không còn hero cũ.
- Tên tệp xuất phân biệt theo tên hồ sơ/đơn vị/ứng viên; dialog xuất ghi rõ CV đang dùng.
- UI quản lý/so sánh cho desktop/mobile. Chi tiết kiểm tra và giới hạn trong VERIFICATION.md.

## v1.3.1 — Modern 1 Layout

- Thêm Modern 1 · Thanh lịch, bố cục tham khảo liên kết Boss chọn: ảnh tròn bên trái, tên/vị trí cùng hàng khi đủ chỗ, liên hệ hai cột, tiêu đề mục đỏ trầm và đường kẻ mảnh.
- Kinh nghiệm, học vấn và dự án có phần chức danh/chuyên ngành/thời gian bên trái, công ty/nội dung bên phải; hàng sau đợi cả hai phần kết thúc, nội dung dài tự phân trang.
- Ảnh tròn có viền trắng và màu, cắt cùng hình học trong SVG/PDF; icon liên hệ dạng vector. Giữ căn ảnh, zoom và chế độ đen trắng.
- Hồ sơ mới dùng mẫu Modern 1 và font tiêu đề modern. Hồ sơ/backup cũ giữ mẫu đã lưu; schema/key v2 không đổi; v1.3.0 không nhận template mới nên cần đổi mẫu trước rollback.
- Thư viện bốn mẫu, responsive 4/2/1 cột theo khung màn hình. Thêm kiểm tra hàng dài, liên hệ, ảnh tròn, PDF thật và dữ liệu giữ nguyên.

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
