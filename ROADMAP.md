# Roadmap

Bản hiện tại **v1.3.1**, nâng cấp từ source v1.3.0. Phạm vi Reliability, Studio và Professional Content của các bản trước được giữ.

| Phiên bản | Mục tiêu | Chức năng chính | Công việc kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc và thứ tự |
| --- | --- | --- | --- | --- | --- |
| v1.0.0 | Nền ban đầu | Landing, editor cơ bản, local save, JSON | HTML/CSS/ES Modules, schema 1 | Source nền đã có; giới hạn QA cũ ghi trong changelog | Được dùng làm nền nâng cấp |
| v1.0.1 — gộp vào v1.2.0 | Hoàn thiện độ tin cậy | PDF trực tiếp, HTML, lưu/backup/migration/ảnh và nội dung dài | Font local, Unicode NFC, validation, storage error handling | Kiểm tra tự động và PDF thực tế đạt; giới hạn browser trong VERIFICATION.md | Hoàn thành trong gói v1.2.0 |
| v1.1.0 — gộp vào v1.2.0 | CV Studio A4 | Zoom/số trang, sắp xếp/ẩn mục, lề/font/giãn dòng, crop ảnh, cảnh báo nhiều trang | Shared layout engine, SVG preview/PDF cùng tọa độ; schema 2 | Kiểm tra phân trang/mất chữ/bounds; desktop/mobile quan sát được | Hoàn thành trong gói v1.2.0 |
| v1.2.0 | Nội dung chuyên nghiệp | Tóm tắt, nhiệm vụ/kết quả, dự án/vai trò, nhóm kỹ năng, gợi ý vị trí, xác nhận | Model/editor mở rộng, migrate v1, gợi ý bằng quy tắc | Dữ liệu tách công ty/dự án; xác nhận bỏ khi sửa; backup round-trip | Hoàn thành source; người dùng tự push/deploy |
| v1.3.0 | Nhiều mẫu CV chuyên nghiệp | Academic Executive, Modern Professional, Classic ATS; xem trước đen trắng; đổi mẫu giữ dữ liệu | Template registry dùng chung model/layout; kiểm tra thứ tự đọc PDF | Đổi mẫu không mất nội dung; không hứa mọi ATS tương thích | Hoàn thành source trong gói v1.3.0; Boss tự push/deploy |
| v1.3.1 | Layout theo mẫu Boss chọn | Modern 1 ảnh tròn, liên hệ hai cột, kinh nghiệm theo hàng; PDF/HTML theo layout | Renderer riêng tạo token vector chung; schema 2 bổ sung enum modern1, không đổi dữ liệu cũ | Mặc định 1 trang; hàng dài không đè nhau; ảnh tròn SVG/PDF; 39 tests đạt | Hoàn thành source, Boss tự push/deploy |
| v1.4.0 — đề xuất | Nhiều hồ sơ và lịch sử | Nhân bản theo vị trí/trường, snapshot, khôi phục, so sánh thay đổi | Kho local nhiều hồ sơ; migration, quản lý ảnh/dung lượng | Các hồ sơ độc lập, backup/restore từng hoặc toàn bộ | Sau luồng đơn hồ sơ ổn định |
| v1.5.0 — đề xuất | Xuất bản và đồng bộ | Đăng nhập chủ hồ sơ, draft/published, link chỉ xem, nhiều thiết bị | Backend/Auth/Storage, kiểm tra quyền server, backup/revision | Khách không sửa/đọc draft, chủ hồ sơ đồng bộ được | Cần chọn kết nối; chưa có trong bản này |

## Đề xuất tiếp theo: v1.4.0

Quản lý nhiều CV theo trường/vị trí: nhân bản hồ sơ, đặt tên phiên bản, snapshot trước khi sửa, khôi phục và so sánh thay đổi. Dữ liệu từng hồ sơ độc lập, có backup từng hồ sơ/toàn bộ và migration giữ CV hiện tại. Chưa triển khai; chờ Boss chọn.
