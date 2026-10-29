# Verification — CV Atelier v1.3.0

## Tự động

`npm run check`, `npm test`, `npm run build` đã chạy đạt. **35 tests** gồm 23 kiểm tra nền và 12 kiểm tra template mới.

- Migration v1, backup schema v2 cũ thiếu template/monochrome; giữ nội dung, dấu NFC, công ty/đơn vị dự án, ảnh và các thông số thiết kế đã chỉnh.
- Đổi qua cả ba mẫu rồi quay lại không thay nội dung/xác nhận/crop/font/lề; chặn template không hợp lệ.
- Lưu/quota/storage lỗi, dữ liệu hỏng, prototype pollution, HTML escaping; xác nhận nội dung, sắp xếp/ẩn giữ dữ liệu.
- Ba mẫu tạo hình học khác nhau từ cùng dữ liệu. Mặc định một trang A4 cho cả ba mẫu.
- Nội dung dài, từ dài, lề/cỡ chữ/giãn dòng cực trị không đặt chữ/hình ra ngoài A4; giữ đủ nhiệm vụ đánh số.
- Cột phụ Academic phân trang độc lập, giữ đủ 70 kỹ năng cùng nội dung cột chính.
- Classic không có token ảnh/mảng nền và giữ trình tự đọc một cột.
- Chế độ đen trắng dùng các màu RGB xám cho toàn bộ chữ/nét/nền; phép đổi pixel ảnh giữ alpha và dùng cùng trọng số với SVG. SVG có filter ảnh; PDF nhúng ảnh đã chuyển xám ở trình duyệt, không ghi đè ảnh gốc.
- Clip IDs thumbnail tách biệt; thumbnail và HTML xuất không có điểm chỉnh sửa.
- HTML của cả ba mẫu tự chứa font/đủ trang, không script/editor; giữ kiểm tra landing/kết quả/vai trò và escape từ bản trước.
- PDF thật nhúng font/ảnh PNG, đúng A4; cùng số trang và hình học với preview.

## File PDF thực tế

Chạy engine production bằng Node với đúng vendor/font bytes trong source. Đã tạo file cho cả ba mẫu:

| Mẫu | Dữ liệu mặc định | Bộ dữ liệu dài 24 nhiệm vụ |
| --- | --- | --- |
| Academic Executive | 1 trang | 3 trang |
| Modern Professional | 1 trang | 2 trang |
| Classic ATS | 1 trang | 2 trang |

Trích xuất chữ kiểm tra tên `Nông Thị Hồng Cúc` và đủ nhiệm vụ 1–24 ở mỗi mẫu. Poppler render PNG, kiểm tra trực quan trang đầu cả ba mẫu và trang cuối của bộ dữ liệu dài: không cắt chữ/footer, phân trang rõ, dấu tiếng Việt đúng. Kích thước 595.276 × 841.89 pt. Hai PDF QA từ tests nền cũng được tạo lại.

Các file QA không nằm trong ZIP. Có thể tái tạo bằng `npm test`; đặt biến `CV_QA_DIR` nếu muốn chọn thư mục xuất kiểm tra.

## Giao diện v1.3.0

- Mở thư viện có ba thẻ xem trước đúng nội dung hiện tại và chỉ báo mẫu đang chọn.
- Chuyển Academic/Modern/Classic; tên và nội dung form được giữ. Classic không hiển thị ảnh, tùy chọn đen trắng bị khóa vì luôn áp dụng.
- Đổi mẫu, bật đen trắng, tải lại sau trạng thái đã lưu: lựa chọn được giữ. Đổi mẫu/đen trắng được ghi ngay, không chờ debounce của ô nhập.
- Hoàn tác từ Academic về Modern và làm lại trở về Academic hoạt động; bố cục cập nhật.
- Desktop hiển thị đúng thiết kế mới. Mobile iframe 390 px: clientWidth/scrollWidth đều 390; thư viện xếp thẻ dọc, dialog nằm trong khung, cuộn xem hết được. Tablet 768 px hiển thị Studio.
- Đã đưa dữ liệu QA về Academic có màu, không đổi thông tin cá nhân. Fixture responsive được gỡ trước đóng gói.

## Giới hạn

- Các kiểm tra file picker/download native và Telex/VNI hệ điều hành từ bản trước chưa được xác minh lại: browser không trả file download ở lần trước dù Blob sẵn sàng; quyền chọn tệp đã bị từ chối nên không lặp lại. Bộ validate/backup/migration/ảnh/PDF được kiểm tra bằng mã. Boss kiểm tra chọn ảnh/JSON và tải file trên trình duyệt của mình sau deploy.
- Ảnh đen trắng: đã kiểm tra phép đổi pixel và filter SVG; chưa kiểm tra end-to-end ảnh tải từ native picker trong browser. Không tuyên bố đã kiểm thử trên mọi thiết bị/OS.
- Giữ xử lý IME composition và Unicode NFC từ v1.2.0; không có bàn phím Telex/VNI hệ điều hành để xác minh mọi bộ gõ.
- Classic ATS ưu tiên cấu trúc văn bản, không phải chứng nhận tương thích mọi ATS.
- Không kiểm tra production URL của Boss: chỉ bàn giao source để tự push/deploy. Không có backend/đồng bộ đa thiết bị.
- Ký tự ngoài bộ font có thể cần thay; app cảnh báo trước khi xuất. Nội dung đầu hồ sơ quá dài hoặc CV trên 60 trang sẽ được yêu cầu rút gọn, không xóa dữ liệu.
