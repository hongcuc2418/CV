# Roadmap

Boss chọn gộp phạm vi v1.0.1 + v1.1.0 + v1.2.0, bàn giao chung dưới **v1.2.0**. Không có ba gói triển khai riêng.

| Phiên bản | Mục tiêu | Chức năng chính | Công việc kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc và thứ tự |
| --- | --- | --- | --- | --- | --- |
| v1.0.0 | Nền ban đầu | Landing, editor cơ bản, local save, JSON | HTML/CSS/ES Modules, schema 1 | Source nền đã có; giới hạn QA cũ ghi trong changelog | Được dùng làm nền nâng cấp |
| v1.0.1 — gộp vào v1.2.0 | Hoàn thiện độ tin cậy | PDF trực tiếp, HTML, lưu/backup/migration/ảnh và nội dung dài | Font local, Unicode NFC, validation, storage error handling | Kiểm tra tự động và PDF thực tế đạt; giới hạn browser trong VERIFICATION.md | Hoàn thành trong gói v1.2.0 |
| v1.1.0 — gộp vào v1.2.0 | CV Studio A4 | Zoom/số trang, sắp xếp/ẩn mục, lề/font/giãn dòng, crop ảnh, cảnh báo nhiều trang | Shared layout engine, SVG preview/PDF cùng tọa độ; schema 2 | Kiểm tra phân trang/mất chữ/bounds; desktop/mobile quan sát được | Hoàn thành trong gói v1.2.0 |
| v1.2.0 | Nội dung chuyên nghiệp | Tóm tắt, nhiệm vụ/kết quả, dự án/vai trò, nhóm kỹ năng, gợi ý vị trí, xác nhận | Model/editor mở rộng, migrate v1, gợi ý bằng quy tắc | Dữ liệu tách công ty/dự án; xác nhận bỏ khi sửa; backup round-trip | Hoàn thành source; người dùng tự push/deploy |
| v1.3.0 — đề xuất | Nhiều mẫu CV chuyên nghiệp | Academic Executive, Modern Professional, Classic ATS; xem trước đen trắng; đổi mẫu giữ dữ liệu | Template registry dùng chung model/layout; kiểm tra thứ tự đọc PDF | Đổi mẫu không mất nội dung; không hứa mọi ATS tương thích | Boss chọn phiên bản sau, chưa triển khai |
| v1.4.0 — đề xuất | Nhiều hồ sơ và lịch sử | Nhân bản theo vị trí/trường, snapshot, khôi phục, so sánh thay đổi | Kho local nhiều hồ sơ; migration, quản lý ảnh/dung lượng | Các hồ sơ độc lập, backup/restore từng hoặc toàn bộ | Sau luồng đơn hồ sơ ổn định |
| v1.5.0 — đề xuất | Xuất bản và đồng bộ | Đăng nhập chủ hồ sơ, draft/published, link chỉ xem, nhiều thiết bị | Backend/Auth/Storage, kiểm tra quyền server, backup/revision | Khách không sửa/đọc draft, chủ hồ sơ đồng bộ được | Cần chọn kết nối; chưa có trong bản này |
