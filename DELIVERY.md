# Bàn giao v1.3.1

- Nền: bản mới nhất `CV-Atelier_v1.3.0.zip` đã bàn giao; đọc lại bản hiện hành trước khi sửa.
- Phạm vi: thêm Modern 1 · Thanh lịch theo bố cục Boss chọn tại https://www.topcv.vn/mau-cv-tieng-viet/modern_1_v2; ảnh tròn, tên/vị trí, liên hệ hai cột, hàng kinh nghiệm/học vấn/dự án hai phần. Giữ ba mẫu trước.
- Hồ sơ mới chọn Modern 1; hồ sơ cũ được giữ. Boss vào Mẫu CV chuyên nghiệp → Modern 1 · Thanh lịch để áp dụng lên hồ sơ đã lưu. Nếu cần kiểu chữ như mặc định mới, chọn kiểu tiêu đề Hiện đại · Không chân.
- Giữ nội dung, schema/key v2, ảnh gốc và crop. Sao lưu JSON trước nâng cấp. Rollback về v1.3.0 cần đổi sang một trong ba mẫu cũ vì bản cũ không nhận enum modern1.
- 39 tests; check/build và QA PDF/UI theo VERIFICATION.md.
- ZIP source có README local/GitHub/Vercel, CHANGELOG, ROADMAP, VERIFICATION, lockfile, font/vendor và giấy phép. Không đóng gói QA, dist, cache, node_modules, .git, secret hay ảnh cá nhân.
- Boss tự push/deploy; không cập nhật tài khoản/project hosting. App vẫn lưu local theo domain, không backend/đồng bộ.
- Tiếp theo đề xuất v1.4.0: nhiều hồ sơ và lịch sử snapshot, chưa triển khai. Gửi ZIP này khi muốn nâng cấp tiếp.
