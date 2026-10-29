# CV Atelier — v1.3.0

Bản nâng cấp **Professional Templates** từ ZIP `CV-Atelier_v1.2.0(1).zip` Boss cung cấp. Giữ toàn bộ luồng Studio, nội dung, backup và xuất từ v1.2.0. Boss tự push GitHub và deploy Vercel.

## 1. Chức năng đã xây dựng

### Thư viện mẫu CV v1.3.0

| Mẫu | Thiết kế | Phù hợp |
| --- | --- | --- |
| Academic Executive — mặc định | Đầu trang xanh mực, sắc đồng, tiêu đề serif, hai cột | Hồ sơ ứng tuyển trong trường đại học |
| Modern Professional | Một cột, tên nổi bật, nhịp mục rõ và hàng kinh nghiệm có nền nhẹ | Làm nổi bật kinh nghiệm, dự án và đóng góp |
| Classic ATS | Một cột văn bản, đen trắng, không ảnh/mảng nền | Ưu tiên thứ tự đọc và trích xuất chữ |

- Mở **Mẫu CV chuyên nghiệp** bên trái hoặc tên mẫu phía trên trang giấy. Thẻ xem trước dùng chính nội dung hồ sơ hiện tại.
- Đổi mẫu giữ nguyên nội dung, xác nhận, ảnh, vị trí crop, lề/font/mật độ; có thể hoàn tác/làm lại. Lựa chọn được lưu ngay, có báo lỗi nếu trình duyệt không cho lưu.
- **Bản đen trắng** áp dụng cho CV A4, PDF, CV HTML và phần A4 khi in Landing HTML; chữ, nền, đường nét và ảnh A4 chuyển sắc xám. Không thay ảnh gốc trong hồ sơ/backup. Landing page trên màn hình vẫn giữ thiết kế riêng.
- Academic đặt liên hệ, đơn vị dự án, học vấn, kỹ năng và chứng chỉ ở cột phụ; tóm tắt, kinh nghiệm, dự án và mục tiêu ở cột chính. Thứ tự kéo thả áp dụng **trong từng cột**; đổi sang mẫu một cột sẽ dùng thứ tự toàn bộ danh sách.
- Classic ATS luôn đen trắng và không hiển thị ảnh; ảnh cùng lựa chọn màu/hiển thị vẫn được giữ để dùng khi chuyển sang mẫu khác. Không bảo đảm mọi hệ thống ATS đều đọc giống nhau; cần rà nội dung trích xuất trước khi gửi.
- JSON v1/v2 cũ vẫn nhập được. Hồ sơ v2 chưa có trường mẫu sẽ được bổ sung `academic`, không đặt lại nội dung hoặc các thông số đã chỉnh.

### CV Studio A4

- Trang giấy A4 ở giữa; cấu trúc mục bên trái; bảng chỉnh sửa bên phải.
- Bấm nội dung trên trang giấy để mở đúng trường. Ô nhập không bị dựng lại khi đang gõ tiếng Việt.
- Chuyển **CV A4 / Landing page**, sử dụng cùng dữ liệu.
- Zoom vừa chiều rộng / vừa trang / 60–150%. Zoom chỉ thay cách xem, không thay kích thước PDF.
- Sắp xếp mục bằng kéo thả hoặc nút lên/xuống; ẩn/hiện giữ nguyên dữ liệu. Trên điện thoại dùng **Kiểu dáng & bố cục → Thứ tự & hiển thị các mục A4**.
- Điều chỉnh lề 10–24 mm, cỡ chữ 9–13 pt, giãn dòng 1.2–1.8, khoảng cách mục; preset Gọn / Cân bằng / Thoáng.
- 3 bảng màu; 2 kiểu tiêu đề, dùng font tiếng Việt đóng gói sẵn.
- Ảnh JPEG/PNG/WebP, tối đa 8 MB và 40 megapixel; tối ưu tại thiết bị, căn ngang/dọc, zoom 1–2.5 lần, tùy chọn bỏ ảnh.
- Số trang, header tiếp trang, footer; giữ các gạch đầu dòng ngắn cùng trang khi đủ chỗ; nội dung dài tự chuyển trang, không cắt mất dữ liệu. Khi vượt 60 trang, dừng dựng/xuất và yêu cầu rút gọn, vẫn giữ dữ liệu để chỉnh.

### Nội dung chuyên nghiệp

- Tóm tắt chuyên môn và mục tiêu nghề nghiệp.
- Kinh nghiệm tách **công ty / chức danh / thời gian / phạm vi / nhiệm vụ / kết quả**.
- Dự án tách **tên đơn vị / vai trò / thời gian / nghiệp vụ-phân hệ / đóng góp**.
- Học vấn, chứng chỉ; kỹ năng chuyên môn, công cụ, ngoại ngữ và lĩnh vực quan tâm riêng biệt.
- Gợi ý định hướng Phòng Đào tạo / học vụ khoa-viện / quản trị hệ thống đào tạo. Không gọi AI, không cần API key. Gợi ý hồ sơ mẫu Hồng Cúc phải được rà lại trước khi áp dụng cho người khác.
- Checklist thiếu thông tin, xác nhận nội dung từng kinh nghiệm/dự án. Sửa nội dung sẽ bỏ xác nhận cũ của mục đó.
- Nếu còn nội dung chưa xác nhận, CV vẫn có ghi chú bản nháp kể cả khi đã tắt tùy chọn bản nháp thủ công.

### Xuất và dữ liệu

- **PDF tải trực tiếp**, không phụ thuộc hộp thoại in. PDF dùng chữ thật, font nhúng, có thể chọn/copy/tìm kiếm; cùng tọa độ, wrap dòng, crop ảnh và số trang với preview A4.
- **CV HTML** tự chứa font và ảnh, chỉ xem, mở offline được; in A4 được.
- **Landing HTML** tự chứa tài nguyên, không có editor/script; kèm CV A4 khi in.
- **In bằng trình duyệt** vẫn có như phương án bổ sung.
- Tự lưu local, Ctrl/Cmd+S, hoàn tác/làm lại, sao lưu và khôi phục JSON.
- Nâng cấp dữ liệu và JSON schema v1 sang v2; giữ key v1 gốc. Cảnh báo khi không đọc/lưu được hoặc tab khác thay đổi dữ liệu.

## 2. Nội dung mẫu và thông tin cần xác nhận

Đã biết: Nông Thị Hồng Cúc; ASC từ 12/12/2022 đến nay; 8 tháng phần mềm HRM; tham gia dự án VLU, NTT, DNTU, NDUN, HNIVC, HDIU, TLU, IUH.

Chức danh, nhiệm vụ, kết quả, giới thiệu và mục tiêu cần ứng viên rà soát. Chưa tự tạo số liệu, thành tích, trường học, chứng chỉ hoặc thông tin liên hệ. **ASC là đơn vị công tác; tám trường là đơn vị dự án, không phải tám nơi từng làm việc.** Không tự coi kinh nghiệm phần mềm là trực tiếp phụ trách toàn bộ nghiệp vụ Phòng Đào tạo.

Mục học vấn/chứng chỉ/kỹ năng còn trống được bỏ khỏi CV A4 và PDF. Landing page ở chế độ editor có thể hiện chỗ bổ sung; bản HTML xuất loại chỗ trống để không gửi placeholder cho nhà tuyển dụng.

## 3. Công nghệ và cấu trúc

HTML/CSS, JavaScript ES Modules, Node.js 22 hoặc 24 LTS cho dev/build/test. Runtime dùng pdf-lib 1.17.1, fontkit 1.1.1 và DejaVu fonts được đóng gói trong source. Không tải thư viện/font từ CDN, không cần API key, database, Docker hoặc VPS. Xem `THIRD_PARTY.md` và các giấy phép đi kèm.

| File / thư mục | Vai trò |
| --- | --- |
| `public/model.js` | Schema v2, Unicode NFC, migration, kiểm tra dữ liệu, xác nhận và gợi ý nội dung |
| `public/legacy-model.js` | Schema/default v1 để nâng cấp dữ liệu cũ |
| `public/templates.js` | Danh mục ba mẫu, chọn mẫu và phân cột |
| `public/photo-grayscale.js` | Chuyển ảnh sang xám khi xuất PDF mà không đổi ảnh gốc |
| `public/document.js` | Font metrics, ngắt dòng, phân trang, tọa độ chung cho SVG A4 và PDF |
| `public/app.js` | Studio, form, IME composition, lịch sử, ảnh và thao tác người dùng |
| `public/landing.js`, `landing.css` | Landing page từ bản trước được giữ và mở rộng |
| `public/storage.js` | Đọc/lưu dữ liệu; không tự ghi đè bản lỗi khi đọc |
| `public/export.js` | HTML tự chứa font/ảnh và bố cục in |
| `public/fonts`, `public/vendor` | Tài nguyên runtime và giấy phép |
| `scripts/` | Dev server, kiểm tra cú pháp, build |
| `tests/` | Migration, lưu/khôi phục, Unicode, phân trang, PDF và HTML |

## 4. Chạy local và build

1. Giải nén ZIP, mở terminal trong thư mục `CV-Atelier_v1.3.0` có `package.json`.
2. Cài Node.js 22 hoặc 24 LTS.
3. Chạy:

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`. Dừng bằng Ctrl+C. Không mở source `index.html` trực tiếp bằng `file://` vì ES Modules và font cần HTTP.

Kiểm tra/build:

```bash
npm run check
npm test
npm run build
```

Build tạo `dist/` từ `public/`. Không sửa `dist/` vì lần build sau sẽ tạo lại. `npm ci` không cần cài dependency runtime từ mạng; tài nguyên đã nằm trong source. Tests PDF ghi file kiểm tra vào thư mục tạm hệ thống, không đóng vào source.

## 5. Cách sử dụng

1. Điền tên, vị trí, liên hệ, học vấn; sửa nhiệm vụ theo thực tế.
2. Vào Kinh nghiệm: bổ sung kết quả nếu có căn cứ; xác nhận từng mục sau rà soát.
3. Vào Dự án: bổ sung vai trò, phạm vi và đóng góp cho dự án tiêu biểu nếu cần.
4. Chọn mẫu CV, sau đó dùng Kiểu dáng để chỉnh màu, font, lề, mật độ và ảnh. Kéo mục hoặc dùng mũi tên để sắp xếp **CV A4**. Landing page giữ trình tự giới thiệu phù hợp trang web.
5. Dùng Rà soát nội dung để kiểm tra trường còn thiếu; gợi ý chỉ thay nội dung sau khi bấm áp dụng, có thể hoàn tác.
6. Chọn **Xuất hồ sơ → Tải PDF A4 / Tải CV HTML / Tải landing page → Tải tệp xuống**. Bước cuối là liên kết tải thật để trình duyệt xử lý yêu cầu tải do người dùng chủ động bấm.
7. Dùng Sao lưu JSON trước khi chuyển thiết bị hoặc xóa dữ liệu trình duyệt.

Ảnh HEIC cần đổi sang JPEG/PNG/WebP trước. Nếu PDF cảnh báo ký tự chưa có trong font, kiểm tra và thay các ký hiệu/emoji hiếm; bộ font tập trung vào tiếng Việt và chữ thông dụng.

Khi in bằng trình duyệt: chọn A4, lề None/mặc định theo CSS, scale 100%, tắt header/footer của trình duyệt. PDF tải trực tiếp không cần thiết lập này.

## 6. Dữ liệu, nâng cấp và khôi phục

- Bản này lưu **riêng trong trình duyệt + tên miền hiện tại**, không phải database hoặc đồng bộ nhiều máy.
- Giữ schema 2 và key v2 trong v1.3.0; thêm `design.template` và `design.monochrome` có giá trị mặc định khi đọc dữ liệu cũ. Backup v1.3.0 vẫn giữ tất cả trường cũ.
- Key v1: `cv-atelier:v1`; key mới: `cv-atelier:v2`. Lần đầu mở bản mới, nếu chưa có v2 thì đọc và nâng cấp v1, giữ nguyên key v1. JSON backup v1 nhập được.
- Dữ liệu lỗi không bị tự động ghi đè bằng mẫu. Thông báo phục hồi cho tải bản lưu gốc / khôi phục JSON / chủ động dùng mẫu mới.
- Hết quota hoặc bị chặn storage: trạng thái lưu báo lỗi; giữ bản đang sửa trong bộ nhớ và cho tải sao lưu. Không tự xóa bản cũ để lấy dung lượng.
- Khi tab khác cập nhật hồ sơ, dừng ghi đè và yêu cầu sao lưu bản đang chỉnh hoặc nạp bản đã lưu.
- Xóa dữ liệu trình duyệt có thể mất hồ sơ. Chế độ ẩn danh, trình duyệt khác hoặc tên miền mới không chia sẻ localStorage; dùng JSON để chuyển dữ liệu.
- Hoàn tác/làm lại chỉ trong phiên đang mở, không phải lịch sử snapshot lâu dài. Lịch sử nhiều hồ sơ thuộc roadmap sau.

**Trước nâng cấp:** mở bản cũ → Sao lưu JSON → giữ ZIP/commit cũ → cập nhật source → deploy cùng domain → mở bản mới → kiểm tra dữ liệu. Nếu đổi domain, khôi phục JSON. Không cần reset hoặc xóa cache dữ liệu ứng viên.

**Quay lại v1.2.0:** dùng deployment/commit v1.2.0 và giữ JSON v1.3.0. Bản v1.2.0 có thể bỏ trường mẫu mới khi lưu; giữ backup để khôi phục lựa chọn nếu nâng cấp lại.

**Quay lại v1:** dùng deployment/commit cũ. Key v1 vẫn được giữ, nhưng các chỉnh sửa chỉ có trong schema v2 không tự chuyển ngược thành v1; giữ backup v2 để dùng lại khi quay về v1.3.0. Không xóa key v2 để rollback.

Giữ nguyên `schemaVersion` và các trường không sửa khi chỉnh JSON thủ công. Khi cần hỗ trợ, gửi ZIP mới nhất và JSON backup mong muốn giữ.

## 7. Xuất bản nội dung đã chỉnh

Sửa trong editor **không tự push GitHub hoặc cập nhật nội dung cho người khác**. Mỗi trình duyệt có bản local riêng. Chưa có đăng nhập quản trị hay database trong v1.3.0.

- Muốn công khai bản chỉ xem: xuất Landing HTML, đổi tên thành `index.html`, deploy trên **repo riêng**; file đã chứa font và ảnh, không cần build. Không ghi đè app Studio nếu muốn giữ công cụ chỉnh sửa.
- Muốn đổi mẫu mặc định của app: sao lưu JSON v2, dùng dữ liệu đó làm `defaults` trong `public/model.js` (giữ các hàm và hằng số), rồi check/test/build/push. Nên gửi JSON + ZIP để được cập nhật đúng source khi chưa quen sửa mã.
- Trình duyệt đã có hồ sơ local tiếp tục ưu tiên bản local. Chỉ chọn Đặt lại mẫu khi đã sao lưu và chủ động muốn thay hồ sơ đang có.
- Đăng nhập và đồng bộ nội dung xuất bản là hạng mục tương lai; không đưa token GitHub/Vercel vào frontend để giả lập quản trị.

## 8. Push GitHub

### Repository mới

Tạo repo trống trên tài khoản của Boss; sau đó chạy trong thư mục source:

```bash
git init
git branch -M main
git add .
git commit -m "feat: release CV Atelier v1.3.0"
git remote add origin https://github.com/YOUR_OWNER/YOUR_REPO.git
git push -u origin main
```

Thay owner/repo bằng đích thực tế. Không đưa PAT, secret hoặc `.env` thật vào ZIP/Git.

### Repository đã có source

Clone hoặc mở checkout đúng repo trước khi chép source mới. Giữ công việc riêng của Boss và tích hợp thay đổi, không dùng force push.

```bash
git clone https://github.com/YOUR_OWNER/YOUR_REPO.git
cd YOUR_REPO
git fetch origin
git status
```

Chép các file v1.3.0 vào đúng thư mục dự án, rồi:

```bash
npm ci
npm run check
npm test
npm run build
git add .
git commit -m "feat: upgrade CV Atelier to v1.3.0"
git pull --rebase origin main
git push origin main
```

Nếu có conflict: sửa, kiểm tra, `git add` các file đã giải quyết, `git rebase --continue`. Không bỏ qua kiểm tra khi gặp `fetch first`.

## 9. Deploy Vercel

Boss tự deploy theo lựa chọn hiện tại. Không cần biến môi trường, API key, database hoặc callback ở bản này.

| Thiết lập | Giá trị |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Thư mục có `package.json`; `.` nếu source ở gốc repo |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.x hoặc 24.x |
| Production Branch | `main`, hoặc branch Boss cấu hình cho project |
| Environment Variables | Không cần |

Lần đầu: Vercel → Add New Project → import repo GitHub → cấu hình như bảng → Deploy → kiểm tra Ready và URL thật. Nếu đã có project, giữ Root/Build/Output đúng, rồi push lên Production Branch hoặc tạo deployment từ nhánh đó trong Deployments. `vercel.json` đã đi kèm.

Kiểm tra sau deploy: font tải được; tên có dấu hiển thị đúng; sửa và F5 giữ dữ liệu; xuất PDF; tải HTML; thử nhập backup và ảnh trên máy của Boss. Các lần sau push branch sản xuất sẽ kích hoạt deploy nếu Git Integration đang kết nối.

Không có database/migration SQL; không thêm Supabase hoặc dịch vụ trả phí chỉ để deploy bản này. Nếu sau này cần tài khoản và đồng bộ, thiết kế thêm backend theo roadmap.

## 10. Xử lý lỗi

| Hiện tượng | Cách xử lý |
| --- | --- |
| Chưa tải được font/PDF | Kiểm tra `public/fonts`, `public/vendor` đã push đủ; build và Root Directory đúng; không mở source bằng file:// |
| Không thấy mẫu mới | Kiểm tra version v1.3.0, vào Mẫu CV chuyên nghiệp; deploy đủ `templates.js` và `photo-grayscale.js` |
| Không chuyển được mục sang cột khác | Academic có phân cột cố định; đổi thứ tự trong cột hoặc chọn mẫu một cột |
| Font cũ vẫn xuất hiện | Kiểm tra version v1.3.0 trên giao diện, deployment mới và tải lại trang; không xóa dữ liệu hồ sơ |
| Dấu Unicode tổ hợp | App chuẩn hóa NFC khi nhận, lưu và xuất; chờ hoàn tất bộ gõ trước khi chuyển trường |
| PDF nhiều trang | Rút gọn nội dung hoặc chỉnh lề/mật độ; zoom không làm PDF ngắn đi |
| File chưa tải | Sau khi tạo tệp, bấm liên kết Tải tệp xuống; kiểm tra mục Downloads của trình duyệt |
| Không đọc được ảnh | Chọn JPEG/PNG/WebP đúng định dạng, dưới 8 MB và 40 megapixel |
| Không lưu được | Đọc trạng thái lỗi, tải Sao lưu; dùng cửa sổ thường và kiểm tra storage của website |
| Không thấy thay đổi trên thiết bị khác | Dữ liệu local; nhập JSON hoặc xuất bản lại HTML |
| Chưa bỏ được ghi chú bản nháp | Rà soát và xác nhận từng mục kinh nghiệm/dự án, sau đó tắt ghi chú thủ công nếu phù hợp |
| Muốn quay lại | Dùng deployment/commit trước, giữ cả JSON v2 và dữ liệu local hiện có |

Chi tiết kiểm tra và giới hạn: `VERIFICATION.md`. Roadmap tiếp theo: `ROADMAP.md`.
