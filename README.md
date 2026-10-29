# CV Atelier — v1.0.0

Landing page CV và trình chỉnh sửa dành cho Nông Thị Hồng Cúc. Thiết kế editorial: nền giấy, màu navy, điểm nhấn đồng; có thêm xanh rừng và đỏ rượu. Giao diện đáp ứng desktop/điện thoại. Không cần tài khoản hay database.

## 1. Chức năng

- Trang CV gồm giới thiệu, ảnh đại diện, kinh nghiệm, đơn vị dự án, học vấn, lĩnh vực quan tâm, chứng chỉ, mục tiêu và liên hệ.
- Nhấn **Chỉnh sửa**, hoặc bấm vào từng nội dung trên trang để sửa nhanh. Thay đổi hiển thị ngay.
- Thêm/xóa các mục kinh nghiệm, học vấn; sửa từng trường và danh sách nhiệm vụ, chứng chỉ, đơn vị dự án.
- Tải ảnh JPEG/PNG/WebP (tối đa 8 MB), tự tối ưu ảnh và điều chỉnh vị trí dọc.
- Tự lưu trên trình duyệt, hoàn tác, sao lưu JSON, khôi phục JSON có kiểm tra định dạng, đặt lại mẫu.
- Chọn bảng màu, kiểu chữ và ẩn/hiện các phần.
- **Xuất PDF** mở hộp thoại in của trình duyệt với bố cục A4 riêng, chữ thật, có thể chọn/copy. Nội dung mặc định được thiết kế cho một trang; nội dung dài tự chạy sang trang tiếp theo.
- **Tải trang CV** xuất một tệp HTML độc lập, chứa nội dung, ảnh và CSS; không có trình chỉnh sửa hoặc JavaScript. Dùng để chia sẻ/xuất bản hồ sơ đã chỉnh.
- Footer: © 2026 HuyVo. All rights reserved · v1.0.0.

## 2. Dữ liệu và giới hạn quan trọng

Nội dung đã xác nhận: họ tên; 8 tháng kinh nghiệm phần mềm HRM; làm tại ASC từ 12/12/2022 đến nay; tham gia dự án VLU, NTT, DNTU, NDUN, HNIVC, HDIU, TLU, IUH. Vị trí ứng tuyển tạm định hướng là Chuyên viên Phòng Đào tạo.

Các nhiệm vụ tại ASC, giới thiệu và mục tiêu là lời viết gợi ý cần người ứng tuyển xác nhận. Chưa có số điện thoại, email, địa chỉ, học vấn, chứng chỉ và chức danh thực tế; không tự điền thông tin giả. **Giữ ghi chú bản nháp cho đến khi nội dung đã được xác nhận.** Có thể tắt ghi chú trong tab Thiết kế sau khi đã rà soát.

Dữ liệu lưu ở localStorage trên **trình duyệt + tên miền hiện tại**. Đây không phải database. Mở trên máy khác/trình duyệt khác/tên miền khác sẽ thấy mẫu ban đầu, trừ khi khôi phục bản JSON hoặc triển khai tệp HTML đã xuất. Dữ liệu có thể mất khi xóa dữ liệu trình duyệt, dùng cửa sổ ẩn danh hoặc hết quota. Luôn tải bản sao lưu trước khi thay máy/xóa cache.

**Sửa CV trên website KHÔNG tự push GitHub và KHÔNG tự cập nhật nội dung cho người truy cập khác.** Mỗi người có bản chỉnh sửa riêng trong trình duyệt của họ. Để xuất bản nội dung đã sửa cho mọi người: làm theo mục 7. Không có đăng nhập, backend, đồng bộ đa thiết bị hoặc cơ chế quản trị nội dung chung trong v1.0.0.

Hồ sơ mẫu được đóng gói trong source. Người xem mã nguồn có thể thấy nội dung đã xuất bản. Không thêm thông tin không muốn công khai vào bản triển khai công khai.

## 3. Công nghệ và yêu cầu

HTML/CSS, JavaScript ES Modules, Node.js **22 hoặc 24 LTS** cho công cụ build/dev/test. Không có dependency runtime, không tải font hay thư viện bên ngoài, không cần API key. `package-lock.json` được đi kèm.

Không dùng Supabase/database ở bản này vì mục tiêu là chỉnh sửa cá nhân và xuất bản tĩnh. Không cần `.env`, secret, callback hoặc migration. Nếu cần quản trị hồ sơ chung/đồng bộ đa máy, có thể mở rộng Supabase Auth, database có RLS và Storage trong phiên bản sau.

## 4. Chạy local

1. Giải nén ZIP và mở terminal trong thư mục `CV-Atelier_v1.0.0` (thư mục có `package.json`).
2. Cài Node.js 22 hoặc 24 LTS nếu chưa có.
3. Chạy:

```bash
npm ci
npm run dev
```

4. Mở `http://localhost:3000`. Kết quả mong đợi: trang CV có nút Chỉnh sửa và Xuất PDF.
5. Dừng bằng `Ctrl+C`.

Không mở `index.html` bằng `file://` vì ES Modules và tính năng tải CSS cần HTTP. Dev server chỉ phục vụ local, không phải backend sản xuất.

## 5. Kiểm tra và build

```bash
npm run check
npm test
npm run build
```

- `check`: kiểm tra cú pháp JavaScript.
- `test`: kiểm tra round-trip backup, ảnh và dữ liệu không hợp lệ, giới hạn nhập, prototype pollution, escape HTML, liên hệ an toàn và trường chỉnh sửa lồng nhau.
- `build`: tạo `dist/` từ `public/`. Không sửa trực tiếp `dist/` vì build sẽ tạo lại.

Để xem sản phẩm, kiểm tra sửa tên, thêm kinh nghiệm/học vấn, ảnh, màu, F5 giữ dữ liệu, xuất/nhập JSON và PDF. Trước phát hành, rà lại nội dung thực tế của ứng viên.

## 6. Cách xuất PDF

1. Sửa và kiểm tra hồ sơ.
2. Chọn **Xuất PDF**.
3. Trong hộp thoại in Chrome/Edge, chọn **Save as PDF / Lưu dưới dạng PDF**.
4. Khổ giấy A4, scale 100% hoặc mặc định; tắt Headers and footers / Đầu trang và chân trang của trình duyệt. Bật Background graphics / Đồ họa nền để giữ màu.
5. Kiểm tra preview và lưu.

Bản PDF là layout CV độc lập, không phải ảnh chụp màn hình landing page. Khi thêm quá nhiều nội dung, tài liệu có thể dài hơn một trang. App không ép co chữ đến mức khó đọc hoặc cắt mất nội dung để giữ một trang. Nếu mở hộp thoại in khi bảng sửa đang mở, PDF vẫn chỉ chứa CV.

## 7. Xuất bản nội dung đã chỉnh

### A. Giữ cả trình chỉnh sửa và cập nhật mẫu chung

1. Trong app, chỉnh nội dung và tải **Sao lưu** JSON.
2. Mở JSON, sao chép object dữ liệu vào `defaults` trong `public/model.js` (giữ các hàm và hằng số khác). Có thể gửi JSON và ZIP mới nhất để được cập nhật source.
3. Chạy check/test/build rồi commit và push.
4. Khách mới sẽ thấy mẫu mới sau deploy. Trình duyệt đã có dữ liệu local vẫn ưu tiên bản local; muốn xem mẫu mới, sao lưu rồi vào Thiết kế → Đặt lại mẫu ban đầu.

### B. Xuất bản hồ sơ tĩnh chỉ xem

1. Trong bảng chỉnh sửa, chọn **Tải trang CV**.
2. Đổi tên HTML tải về thành `index.html`.
3. Tạo một repo riêng chỉ chứa file đó để deploy. Không ghi đè app editor nếu muốn giữ nó. File HTML này đã nhúng ảnh và CSS; không có JavaScript, không có nút sửa. Người nhận mở HTML để xem được offline.
4. Khi deploy repo HTML độc lập trên Vercel, chọn Framework Preset **Other**, không build, Output Directory để mặc định theo cấu trúc root.

## 8. Push GitHub

### Repository mới

Tạo repository `cv-atelier` trong tài khoản của Boss. Có thể chọn Private để giữ source riêng. Nếu dùng các lệnh dưới đây, tạo repo trống, không thêm README trên GitHub trước.

Chạy trong thư mục source:

```bash
git init
git branch -M main
git add .
git commit -m "feat: release CV Atelier v1.0.0"
git remote add origin https://github.com/YOUR_OWNER/cv-atelier.git
git push -u origin main
```

Thay `YOUR_OWNER` bằng owner thực tế. Đăng nhập GitHub bằng Git Credential Manager/GitHub CLI khi được yêu cầu. Không đưa token vào code, URL remote hoặc ZIP.

### Repository đã có source

```bash
git clone https://github.com/YOUR_OWNER/cv-atelier.git
cd cv-atelier
git fetch origin
git status
```

Sao chép source cần cập nhật vào repo clone, giữ các thay đổi hiện có. Đọc README/cấu trúc repo trước khi tích hợp. Sau đó:

```bash
git add .
git commit -m "feat: update CV Atelier v1.0.0"
git pull --rebase origin main
git push origin main
```

Nếu có conflict, sửa và kiểm tra rồi `git rebase --continue`. Không dùng force push để xử lý lỗi `fetch first`. Nếu repository nhiều dự án, đặt app vào thư mục riêng và dùng thư mục đó làm Root Directory trên Vercel.

## 9. Deploy Vercel qua GitHub

Vercel là đích Boss chọn. Đây là ứng dụng tĩnh nên không cần server function, database, Docker hay VPS. Không cần bật dịch vụ trả phí để làm theo hướng dẫn này; tài khoản và hạn mức hosting phụ thuộc gói đang dùng, hãy kiểm tra dashboard của nhà cung cấp trước khi mở rộng sử dụng.

1. Đăng nhập Vercel, chọn **Add New → Project**.
2. Kết nối GitHub và cấp quyền cho đúng repository `cv-atelier`.
3. Import repo, chọn branch `main`.
4. Cấu hình:

| Thiết lập | Giá trị |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `.` nếu source ở gốc; nếu nằm trong thư mục con thì chọn thư mục có `package.json` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js | 22.x hoặc 24.x |
| Environment Variables | Không có |

5. Chọn Deploy và đợi trạng thái Ready.
6. Mở URL thật do Vercel cấp, kiểm tra CV, bảng sửa và xuất PDF.
7. Các lần sau push `main` sẽ tự deploy nếu Git Integration đang kết nối và Production Branch là `main`.
8. Kiểm tra mục Deployments/Git trong Project Settings nếu push không tạo deployment.

`vercel.json` trong source đã khai báo build, output và một số header. Không có khóa Vercel trong project. Kết nối GitHub và Vercel do chủ tài khoản cấp quyền; ZIP không tự tạo repo hoặc tự đăng nhập hosting.

## 10. Nâng cấp và quay lại

- Sao lưu JSON trước khi nâng cấp. Giữ ZIP/source hoặc commit đang chạy.
- Thay source mới, chạy test/build, deploy qua GitHub.
- Nếu lỗi, dùng deployment trước trong Vercel hoặc revert commit Git rồi push. Không reset dữ liệu người dùng trong khi rollback.
- v1.0.0 dùng `schemaVersion:1`; bản sau thay schema phải có migration tương thích, không yêu cầu xóa dữ liệu.
- Nếu đổi domain, tải JSON từ domain cũ rồi khôi phục trên domain mới.

## 11. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Trang trắng khi mở tệp HTML source | Dùng `npm run dev`, không mở trực tiếp source `file://` |
| Vercel 404 | Root phải là thư mục có `package.json`, build đúng, output `dist` |
| Dữ liệu chưa đổi trên máy khác | Đây là dữ liệu local; dùng khôi phục JSON hoặc xuất bản lại như mục 7 |
| Không lưu được | Trình duyệt chặn storage hoặc hết quota; tải Sao lưu, thử cửa sổ thường |
| Ảnh không tải | Chọn JPEG/PNG/WebP, dưới 8 MB và 40 megapixel |
| PDF mất màu | Bật Background graphics trong hộp thoại in |
| PDF nhiều trang | Rút gọn nội dung; kiểm tra A4 và scale, app không cắt dữ liệu |
| Import JSON bị từ chối | Chỉ dùng tệp Sao lưu CV Atelier schemaVersion 1, dưới 3 MB |
| Push bị từ chối | Kiểm tra quyền repo, fetch/pull và xử lý conflict; không force push |
| Không thấy mẫu mới sau deploy | Sao lưu local rồi Đặt lại mẫu để nạp defaults mới |

Khi cần nâng cấp, gửi **ZIP mới nhất + JSON sao lưu** (nếu muốn giữ nội dung cá nhân) và yêu cầu “Xây dựng phiên bản tiếp theo”. Xem `ROADMAP.md`.
