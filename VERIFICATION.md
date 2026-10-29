# Verification — CV Atelier v1.4.0

## Kiểm tra tự động

`npm run check`, `npm test`, `npm run build`; **57 tests đạt** (39 nền từ bản trước, 17 quản lý/recovery và 1 kiểm tra parity A4/Web nhiều trang).

### Nhiều CV và dữ liệu

- Migration JSON/key v1/v2 thành collection, giữ tên có dấu NFC, ảnh, đơn vị dự án, trạng thái xác nhận và bản lưu cũ nguyên byte.
- Bản collection hỏng không bị fallback sang dữ liệu cũ hoặc tự ghi đè; lỗi load có token bản gốc để phục hồi có kiểm soát.
- Tạo/nhân bản/sửa/chuyển CV: deep copy nội dung, thiết kế, mảng và history; sửa bản sao không đổi CV nguồn hoặc mốc cũ.
- Đổi nhãn/trường/vị trí có mốc trước thay đổi. Tự lưu mốc trước sửa, throttle một phút; không tạo mốc từ lần lưu không đổi nội dung.
- Dọn chỉ mốc auto cũ, giữ mốc có tên. Trần 40 mốc được giữ chặn khôi phục khi chưa đủ chỗ bảo toàn hiện trạng; đầu vào ban đầu không bị thay.
- Khôi phục toàn bộ nội dung/thiết kế/đơn vị của snapshot, có mốc trước khôi phục và không đổi CV khác. Xóa mốc không đổi dữ liệu CV hiện tại.
- Lưu trữ/khôi phục hồ sơ giữ dữ liệu và lịch sử; không lưu trữ CV cuối đang dùng.
- Ảnh gom tài nguyên: một ảnh dùng chung ở nhiều CV/mốc chỉ ghi base64 một lần; unpack round-trip đầy đủ.
- Backup một/tất cả CV có lịch sử; import remap IDs, thêm bản sao, giữ nguyên hồ sơ hiện có. JSON v1/v2 cũ nhập được.
- Backup dữ liệu đang sửa chưa lưu giữ cả hiện trạng trước đó, kể cả đang trong khoảng throttle tự lưu; không thay đổi collection live.
- Lỗi quota/storage và commit từ token cũ không thay byte đang lưu, không sửa object caller. Validation chặn trùng ID, tham chiếu ảnh nguy hiểm/thiếu, template/giá trị sai và vượt trần; model strips trường ngoài schema.
- So sánh trường nội dung, trường ứng tuyển, ảnh, xác nhận, mẫu/màu/font/mật độ và thứ tự; ID kỹ thuật của record không tạo thay đổi giả.

### A4, Web, PDF và nội dung

- Cả bốn template mặc định một trang, có hình học khác nhau; giữ trường nội dung và cắt tròn/crop như bản trước.
- Nội dung dài, từ dài và cực trị lề/font/giãn dòng không đặt chữ/hình ngoài A4; giữ đủ nhiệm vụ đánh số. Hai cột Academic và metadata/detail Modern 1 phân trang độc lập đúng cách.
- Với mọi template và dữ liệu nhiều trang, A4 editable sau bỏ thuộc tính editor khớp SVG Landing static; SVG trong CV HTML và Landing HTML giống hệt nhau. Ẩn/sắp xếp, crop ảnh và thông tin đều xuất từ cùng layout.
- Web HTML có font inline, không script/editor hoặc hero cũ; đúng số trang. Kết quả và vai trò dự án hiện đúng, không có placeholder liên hệ/học vấn trống.
- Giữ tests Unicode NFC, lưu/khôi phục, prototype pollution, xác nhận nội dung sau sửa, ảnh đen trắng, embed PNG/PDF A4 và subset font.

## PDF thực tế

Chạy engine production cùng vendor/font trong source; bộ PDF QA đã được tạo lại:

| Mẫu | Mặc định | 24 nhiệm vụ dài |
| --- | --- | --- |
| Modern 1 · Thanh lịch | 1 trang | 3 trang |
| Academic Executive | 1 trang | 3 trang |
| Modern Professional | 1 trang | 2 trang |
| Classic ATS | 1 trang | 2 trang |

Trích xuất text ở từng PDF thấy đúng `Nông Thị Hồng Cúc` và đủ nhiệm vụ 1–24. PDF đúng 595.276 × 841.89 pt. Poppler render Modern 1 mặc định và trang cuối hồ sơ dài để kiểm tra dấu/đường kẻ/phân trang/footer; engine hình học mẫu được giữ từ v1.3.1, thêm kiểm tra parity web. Có PDF ảnh PNG tổng hợp màu đỏ để kiểm tra cắt tròn/icon; không phải ảnh người dùng.

Các file QA không nằm trong ZIP. `npm test` tái tạo ở thư mục tạm, hoặc dùng `CV_QA_DIR`.

## Giao diện trình duyệt

- Tải v1.4.0 từ dữ liệu v1.3.1: xuất hiện CV chuyển từ phiên bản trước, giữ Modern 1 và nội dung; không xóa key cũ.
- Nhân bản VLU theo trường/vị trí, đặt tên mốc; sửa tóm tắt VLU, chuyển CV nguồn thấy bản gốc nguyên vẹn, chuyển lại giữ tóm tắt riêng.
- So sánh với mốc có tên cho đúng một trường Tóm tắt khác nhau; khôi phục tạo mốc trước khôi phục, trả đúng nội dung; tải lại vẫn giữ CV/lịch sử.
- Thêm bản NTT độc lập, lưu trữ rồi khôi phục; danh sách đang dùng và bộ đếm cập nhật 3 → 2 → 3.
- Mở tab thứ hai, tab đầu tạo CV: tab hai báo thay đổi và chặn ghi, nạp bản mới thấy đủ ba CV.
- Lần lượt chọn Modern 1/Academic/Modern/Classic: hình học DOM text/line/rect/circle/image/path giữa A4 và Landing bằng nhau, mỗi mẫu một trang trong dữ liệu thử, không có `.hero` cũ.
- Mobile iframe 390 px: clientWidth/scrollWidth đều 390. Dialog quản lý rộng 372 px, scrollWidth 355; nội dung cuộn được. Landing trong app rộng 351 px với tỷ lệ A4; HTML xuất tự chứa tài nguyên rộng 390 × 551.56 px, SVG cùng chiều cao. Tablet 768 px hiển thị Studio.
- Bản web HTML từ production exporter đã mở được qua QA route. Fixture/hồ sơ thử không được đóng gói thành dữ liệu mặc định; route QA bị gỡ trước build/ZIP.

## Giới hạn xác minh

- Không thử lại file picker native sau khi quyền chọn tệp đã bị từ chối ở phiên trước. Nhập backup/ảnh và vòng round-trip được kiểm tra bằng mã; thao tác chọn JSON/ảnh trên máy thật cần Boss kiểm tra sau deploy.
- Công cụ browser trước đây không trả tệp download dù Blob sẵn sàng; không khẳng định đã kiểm tra tải tệp cuối trên mọi browser. Engine PDF/HTML được kiểm tra bằng file thật/cấu trúc và mở HTML QA như trên.
- Chưa có bàn phím Telex/VNI hệ điều hành; giữ handling composition và NFC đã có, không khẳng định mọi OS/bộ gõ.
- Lưu cục bộ phụ thuộc quota của trình duyệt; không phải database/đồng bộ hoặc khóa phân tán. Trước nâng cấp/chuyển domain/máy cần backup. Mốc auto giữ 20 gần nhất và không phải lịch sử từng phím gõ; mốc được giữ tối đa 40/CV.
- Chưa chạy production URL của Boss; source-only, Boss tự push/deploy Vercel. Classic ATS không phải chứng nhận tương thích mọi hệ thống ATS.
