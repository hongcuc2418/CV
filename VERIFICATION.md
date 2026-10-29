# Verification — CV Atelier v1.2.0

## Kiểm tra tự động

`npm run check`, `npm test`, `npm run build`.

23 kiểm tra tự động chạy đạt. Bộ kiểm tra bao gồm:

- Nhập backup v1 thành schema v2; tên Unicode tổ hợp được chuẩn hóa NFC; giữ công ty, đơn vị dự án, ảnh và bản lưu v1 gốc.
- Backup/restore schema v2 giữ kết quả, dự án/vai trò, kỹ năng, crop ảnh và thiết kế.
- Báo lỗi dữ liệu hỏng/quota/storage bị chặn; không tự ghi đè bản lưu lỗi.
- Chặn trường nguy hiểm/prototype pollution, escape HTML, kiểm tra liên hệ, thứ tự section và giá trị thiết kế.
- Xác nhận nội dung theo mục, sửa công việc tự bỏ trạng thái xác nhận cũ; sắp xếp/ẩn không xóa nội dung.
- Font bao phủ tên và dấu tiếng Việt; wrap từ dài; các mật độ/lề lớn vẫn không đặt chữ ra khỏi trang.
- Dữ liệu dài phân trang và giữ đủ nhiệm vụ.
- PDF thật một trang và nhiều trang; đúng A4, nhúng font và ảnh PNG; crop dùng phép tính chung, chữ không raster hóa.
- HTML chứa font inline, không script/editor/đường dẫn font bên ngoài, đúng số trang A4; escape nội dung; landing giữ kết quả và vai trò dự án, bỏ placeholder trống ở bản static.

## Kiểm tra PDF thực tế

Engine production `public/document.js` đã được chạy trực tiếp bằng Node với đúng vendor/font bytes đi kèm source:

- Hồ sơ mẫu: 1 trang A4, 595.276 × 841.89 pt.
- Bộ dữ liệu dài: 3 trang; trích xuất đủ 30 nhiệm vụ đánh số, không mất chữ.
- Đã dùng Poppler render các trang PNG và kiểm tra trực quan: dấu tiếng Việt, căn chỉnh, giãn dòng, phân trang và footer.
- Text extraction kiểm tra đúng `Nông Thị Hồng Cúc`; không có PDF JavaScript, font được nhúng subset.
- Kiểm tra bounds cho các mật độ cỡ chữ 9/13 pt, lề 24 mm, giãn dòng 1.8 và danh sách dài.

Các file QA sinh tự động không nằm trong ZIP source; có thể tái tạo bằng `npm test`.

## Kiểm tra giao diện trình duyệt

- Studio và landing page tải được; font mới hiển thị tên có dấu đúng.
- Nhập tên bằng chuỗi Unicode decomposed, nội dung chuẩn hóa và preview hiển thị đúng.
- Đã quan sát form nhập không bị dựng lại theo từng input; mã xử lý composition tách riêng, không chặn bộ gõ đang hoạt động.
- Đổi preset/màu, số trang cập nhật; thêm dự án, sửa vai trò; tách kết quả công việc; chọn định hướng; áp dụng vị trí và hoàn tác.
- Sắp xếp mục bằng nút; thêm mục đã được sửa tương thích môi trường local HTTP khi không có crypto.randomUUID.
- Mở export và tạo PDF trong browser đến trạng thái tệp Blob sẵn sàng với tên file thật.
- Mobile iframe 390 px: body clientWidth và scrollWidth đều 390, không tràn ngang; mở/đóng bảng chỉnh sửa. Tablet iframe 768 px hiển thị Studio.
- Đưa dữ liệu QA về mẫu ban đầu; fixture trang QA không nằm trong gói.

## Giới hạn xác minh còn lại

- Browser tự động kiểm tra không trả file download dù liên kết Blob đã sẵn sàng; chưa xác nhận thao tác tải cuối cùng trong môi trường đó. Engine PDF đã được kiểm tra độc lập với file thật như trên; HTML đã kiểm tra cấu trúc bằng mã.
- Không lặp lại thao tác nhập file qua browser khi quyền chọn tệp đã bị từ chối ở phiên trước. Bộ xác thực/migration/backup round-trip và ảnh trong PDF được kiểm tra bằng mã; thao tác chọn ảnh/JSON native cần Boss kiểm tra trên máy khi deploy.
- Không có bàn phím Telex/VNI hệ điều hành trong môi trường browser này; đã kiểm tra Unicode NFC và triển khai composition handling, chưa khẳng định kiểm thử mọi bộ gõ/OS.
- Chưa kiểm tra production URL của Boss; lần này chỉ bàn giao source để Boss tự push/deploy.
- Layout bảo đảm giữ nội dung thông dụng tiếng Việt và ngắt dòng theo font đóng gói. Ký tự hiếm không có trong font sẽ có cảnh báo, cần rà trước khi gửi hồ sơ.
