# Roadmap

| Phiên bản | Mục tiêu | Chức năng chính | Công việc kỹ thuật và dữ liệu | Điều kiện hoàn thành | Phụ thuộc và thứ tự |
| --- | --- | --- | --- | --- | --- |
| v1.0.0 | Hoàn thành — chỉnh sửa và xuất CV cá nhân | Landing page; sửa từng trường; ảnh; màu/font; ẩn mục; local save; undo; JSON; HTML; PDF A4 | HTML/CSS/ES Modules; schemaVersion 1; localStorage; cấu hình Vercel; kiểm tra dữ liệu và build | Sửa/xem/lưu/khôi phục/xuất hoạt động; kiểm tra QA ghi trong VERIFICATION.md | Source hoàn thành; trạng thái push/deploy ghi riêng trong DELIVERY.md |
| v1.1.0 | Đề xuất — CV linh hoạt hơn | Nhiều mẫu A4; sắp xếp mục; nhân bản hồ sơ theo vị trí; kiểm tra thông tin còn thiếu | Cấu trúc nhiều hồ sơ; tương thích backup v1; quản lý template | Đổi mẫu không mất nội dung, mỗi hồ sơ lưu riêng và xuất đúng | Boss chọn triển khai sau v1.0.0 |
| v1.2.0 | Đề xuất — quản trị nội dung chung | Đăng nhập quản trị; hồ sơ xuất bản riêng; đồng bộ nhiều thiết bị; link hồ sơ chỉ xem | Đề xuất Supabase Auth/Postgres/Storage; RLS; migration; phân biệt draft/published | Chỉ chủ hồ sơ được sửa, khách xem nội dung xuất bản, đồng bộ kiểm chứng | Boss chọn kiến trúc và cung cấp kết nối; sau v1.1.0 hoặc ưu tiên riêng |
