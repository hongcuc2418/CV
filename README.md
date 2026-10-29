# CV Atelier — v1.4.0

**Multiple CVs & Recovery**: quản lý nhiều bản ứng tuyển độc lập, lịch sử có tên, so sánh và khôi phục. Bản này cũng sửa Landing page dùng đúng mẫu và hình học A4, thay giao diện hero cũ. Nâng cấp từ ZIP `CV-Atelier_v1.3.1(1).zip` Boss cung cấp. Boss tự push GitHub và deploy Vercel.

## 1. Chức năng

### Nhiều hồ sơ ứng tuyển

- Nút **CV của tôi** trên thanh đầu; danh sách chọn nhanh **Đang chỉnh sửa** ngay phía trên trang giấy.
- **Tạo CV**: bắt đầu từ nội dung mẫu. **Nhân bản**: sao chép nội dung/thiết kế của hồ sơ đang chọn sang một CV có ID độc lập; lịch sử của bản sao bắt đầu từ thời điểm nhân bản.
- Đặt tên hồ sơ, trường/đơn vị và vị trí ứng tuyển. Trường là nhãn quản lý; vị trí được cập nhật ở đầu CV. App không tự thêm đơn vị ứng tuyển vào kinh nghiệm/dự án.
- Tìm theo tên, trường hoặc vị trí. Sửa nội dung, ảnh, màu, mẫu, thứ tự mục của một CV không thay CV khác.
- **Lưu trữ** để ẩn CV khỏi danh sách đang dùng; chọn **Đã lưu trữ → Khôi phục & mở CV** để dùng lại, giữ nội dung và lịch sử. Cần giữ ít nhất một hồ sơ đang dùng.
- Đổi CV sẽ làm mới ngăn hoàn tác trong phiên để tránh áp dụng lịch sử gõ của CV trước; lịch sử phiên bản đã lưu vẫn giữ riêng theo CV.

### Lịch sử và khôi phục

- Tự lưu nội dung sau khi ngừng nhập 500 ms. App giữ hiện trạng trước lần thay đổi đầu tiên, sau đó tối đa một mốc tự động mỗi phút khi tiếp tục sửa.
- Giữ **20 mốc tự động gần nhất** và tối đa **40 mốc được giữ** mỗi CV, gồm ban đầu, mốc đặt tên và mốc an toàn trước đổi đích ứng tuyển/khôi phục/đặt lại.
- **Lưu phiên bản** để đặt tên một mốc quan trọng, ví dụ “Đã rà soát trước khi gửi VLU”. Mốc có tên không bị dọn theo giới hạn tự lưu.
- **So sánh** bản hiện tại với lịch sử hoặc giữa hai CV. Chỉ hiển thị trường khác nhau: nội dung, nhiệm vụ/kết quả, dự án, xác nhận, đơn vị ứng tuyển, ảnh/crop, mẫu/màu/font/lề và thứ tự mục.
- Bản A và B chỉ là hai phía đối chiếu. So sánh không tự thay dữ liệu. Ô quá dài hiện 14.000 ký tự đầu có ghi chú; dữ liệu đầy đủ vẫn giữ trong hồ sơ/backup.
- **Khôi phục** có màn xác nhận và tự giữ hiện trạng thành một mốc trước khi áp dụng. Không đổi các CV khác.
- Có thể xóa mốc không cần sau xác nhận. Xóa mốc không thay CV hiện tại; mốc đã xóa chỉ lấy lại được từ backup đã tải. Khi đủ 40 mốc được giữ, app từ chối tạo thêm/khôi phục nếu chưa có chỗ giữ mốc an toàn.

### A4 và Landing page đã thống nhất

- **CV A4**, **Landing page**, **CV HTML**, **Landing HTML** và PDF dùng cùng mô hình tọa độ/ngắt dòng/phân trang.
- Landing page hiển thị trang CV co theo chiều rộng thiết bị; không còn hero/ảnh vòm và trình tự nội dung riêng của bản cũ. Tỷ lệ A4 được giữ; cỡ hiển thị có thể khác zoom của Studio, bố cục không đổi.
- Đổi mẫu/màu/ảnh, đen trắng, sắp xếp hoặc ẩn mục sẽ áp dụng cho cả hai chế độ và bản xuất.
- Bốn mẫu: **Modern 1 · Thanh lịch**, **Academic Executive**, **Modern Professional**, **Classic ATS**. Modern 1 là mặc định hồ sơ mới. Hồ sơ cũ giữ mẫu đã chọn.
- Academic phân cột cố định, thứ tự mục áp dụng trong từng cột. Các mẫu còn lại dùng thứ tự toàn bộ danh sách.
- Classic ATS luôn đen trắng, không ảnh; giữ ảnh gốc và lựa chọn màu để dùng khi đổi mẫu. Không bảo đảm mọi hệ thống ATS đọc giống nhau.
- Lề 10–24 mm, cỡ chữ 9–13 pt, giãn dòng 1.2–1.8, zoom xem, mật độ, căn/crop ảnh; nội dung dài tự chuyển trang. Trên 60 trang hoặc phần đầu quá dài sẽ yêu cầu chỉnh nội dung, không xóa dữ liệu.

### Nội dung và xuất

- Tóm tắt/mục tiêu; kinh nghiệm tách công ty, vai trò, thời gian, nhiệm vụ và kết quả; dự án tách đơn vị, vai trò, phạm vi và đóng góp. Học vấn, chứng chỉ và các nhóm kỹ năng.
- Gợi ý bằng quy tắc cho nhóm vị trí đào tạo/học vụ/hệ thống, không gọi AI/API. Phải rà soát nội dung thực tế; xác nhận từng kinh nghiệm/dự án. Sửa mục đã xác nhận sẽ bỏ xác nhận cũ.
- PDF chữ thật, font tiếng Việt nhúng; cùng crop/phân trang với A4. HTML chỉ xem, tự chứa font và ảnh, không có editor hoặc script; in A4 được.
- Tên tệp xuất có tên hồ sơ/đơn vị/tên ứng viên để dễ phân biệt các bản ứng tuyển.
- Không tự công khai nội dung chỉnh sửa cho người khác. Muốn trang chỉ xem, xuất Landing HTML, đổi tên `index.html` và deploy ở repo riêng.

## 2. Sao lưu, nhập và nâng cấp

### Cách sao lưu

- **Sao lưu JSON** ở bảng chỉnh sửa: xuất CV đang mở kèm nhãn ứng tuyển, thiết kế và lịch sử.
- **CV của tôi → Sao lưu tất cả**: toàn bộ hồ sơ, lịch sử, hồ sơ lưu trữ và lựa chọn đang mở. Có thể tạo backup từ bộ nhớ khi lưu trình duyệt bị lỗi.
- Ảnh được gom vào bảng tài nguyên trong JSON để không lặp base64 trong từng phiên bản. Ảnh gốc không bị thay khi bật đen trắng.
- Backup dùng `format: cv-atelier-backup`, `formatVersion: 1`, `scope: cv/all`, `workspace`. Không sửa/xóa bảng `assets` thủ công vì các phiên bản có thể cùng tham chiếu ảnh.

### Cách nhập

1. Chọn **Nhập bản sao lưu** trong quản lý CV, hoặc **Khôi phục** ở bảng chỉnh sửa.
2. Chọn JSON, tối đa 32 MB. App nhận backup v1.4 và JSON CV v1/v2 cũ.
3. Xem số hồ sơ trong màn xác nhận rồi bấm **Nhập & mở bản sao**.
4. Hồ sơ được thêm thành các bản sao với ID mới, có hậu tố “(nhập)”, giữ lịch sử nếu tệp có. CV hiện có không bị ghi đè. Đổi tên bản nhập nếu cần.

Trần mô hình là **30 CV gồm cả lưu trữ**; số có thể lưu thực tế phụ thuộc dung lượng trình duyệt và số ảnh/lịch sử. Nhập vượt trần, JSON lỗi hoặc lưu hết dung lượng sẽ báo lỗi, không ghi đè dữ liệu cũ. Không tự dọn ảnh/mốc được giữ để ép lưu.

### Nâng cấp từ v1.3.1 hoặc cũ hơn

1. Mở app cũ, tải Sao lưu JSON; giữ ZIP/commit cũ.
2. Cập nhật source và deploy trên cùng domain.
3. Lần đầu, app chuyển CV v1/v2 sang danh sách có tên **CV chuyển từ phiên bản trước**, giữ nội dung, ảnh và mẫu.
4. Kiểm tra CV rồi tải **Sao lưu tất cả** của bản mới.

Dữ liệu nhiều CV dùng key `cv-atelier:workspace:v1`, model collection schema 1; mỗi CV bên trong vẫn dùng schema 2. Key `cv-atelier:v2` / `cv-atelier:v1` cũ được giữ nguyên và không cập nhật ngược sau nâng cấp.

Nếu bản lưu mới hỏng, app không tự thay bằng mẫu hoặc fallback về bản cũ. Có nút tải bản lưu gốc, nhập JSON hoặc chủ động dùng mẫu mới. Trước ghi đè bản hỏng theo lựa chọn của người dùng, app cố giữ nguyên bản gốc ở key phục hồi; nếu không bảo toàn được thì từ chối ghi đè.

Khi tab khác cập nhật, app dừng ghi và hiển thị **Sao lưu tất cả bản đang có / Nạp bản đã lưu**. Bản sao lưu giữ các chỉnh sửa đang có trong phiên hiện tại. Cơ chế kiểm tra phiên bản trước ghi giúp phát hiện ghi từ dữ liệu cũ; đây là lưu trữ cục bộ, không phải hệ thống cộng tác hay khóa phân tán.

**Quay lại v1.3.1:** dùng deployment/commit cũ và backup JSON cũ trước nâng cấp. Bản cũ chỉ thấy key v1/v2 ở thời điểm nâng cấp, không thấy các chỉnh sửa/nhiều CV/lịch sử trong collection mới. Backup v1.4 phải nhập bằng v1.4; giữ tệp đó để dùng lại khi nâng cấp trở lại. Không xóa dữ liệu trình duyệt để rollback.

Local storage tách theo trình duyệt/domain. Chế độ ẩn danh, xóa dữ liệu web hoặc đổi máy có thể mất hồ sơ; JSON dùng để chuyển máy. Chưa có đăng nhập, database hay đồng bộ cloud trong v1.4.0.

## 3. Dữ liệu mẫu

Nông Thị Hồng Cúc; ASC từ 12/12/2022 đến nay; 8 tháng làm phần mềm HRM; đơn vị dự án VLU, NTT, DNTU, NDUN, HNIVC, HDIU, TLU, IUH. ASC là đơn vị công tác, tám trường là đơn vị dự án. Không tự coi đó là tám nơi từng làm việc.

Chức danh/nhiệm vụ, giới thiệu và mục tiêu cần ứng viên xác nhận. Không tạo số liệu, thành tích, học vấn/chứng chỉ hoặc liên hệ chưa được cung cấp. Ảnh để trống. Mục trống được bỏ khỏi CV. Nếu còn kinh nghiệm/dự án chưa xác nhận, ghi chú bản nháp được giữ kể cả đã tắt tùy chọn bản nháp thủ công.

## 4. Công nghệ và chạy local

HTML/CSS và JavaScript ES Modules; Node.js 22 trở lên cho dev/build/tests. Giữ vendor pdf-lib 1.17.1, fontkit 1.1.1 và DejaVu fonts từ bản trước, không cần CDN/API key/backend. Xem `THIRD_PARTY.md` và giấy phép tài nguyên.

Giải nén, mở terminal trong thư mục `CV-Atelier_v1.4.0` có `package.json`:

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`, dừng bằng Ctrl+C. Không mở source qua `file://` vì module/font cần HTTP.

```bash
npm run check
npm test
npm run build
```

Build sao chép `public/` sang `dist/`. Không sửa `dist/`. Tests PDF ghi file QA vào thư mục tạm; đặt `CV_QA_DIR` để chọn nơi kiểm tra. Không có biến môi trường cần cấu hình cho app; không cần `.env`, Docker hoặc Supabase.

| Thành phần | Vai trò |
| --- | --- |
| `public/model.js`, `legacy-model.js` | CV schema 2, Unicode NFC, nội dung/xác nhận và migration v1 |
| `public/workspace.js` | Nhiều CV, phiên bản, assets, backup, so sánh, kiểm tra trước lưu |
| `public/portfolio-ui.js` | Danh sách CV, đặt tên, so sánh, khôi phục và lưu trữ |
| `public/app.js` | Editor, IME, thao tác và tích hợp collection |
| `public/document.js`, `modern-one.js`, `templates.js` | Mẫu/hình học chung SVG và PDF |
| `public/landing.js`, `export.js` | Landing và HTML cùng trang SVG A4 |
| `public/photo-grayscale.js` | Ảnh đen trắng khi xuất, giữ ảnh gốc |
| `public/storage.js` | Utility đọc/ghi đơn CV cũ phục vụ tương thích/tests; app mới dùng workspace |
| `public/fonts`, `vendor` | Font/runtime local và giấy phép |
| `scripts`, `tests` | Server/build/check và regression tests |

## 5. Cách dùng nhanh

1. Rà thông tin cá nhân, nhiệm vụ/kết quả; xác nhận nội dung có thật.
2. Vào **CV của tôi → Nhân bản**, đặt tên/trường/vị trí cho mỗi bản ứng tuyển.
3. Chọn CV trên thanh **Đang chỉnh sửa**; chỉnh nội dung/mẫu/ảnh theo từng bản.
4. Bấm **Lưu phiên bản** khi hoàn tất một lần rà soát hoặc trước khi gửi.
5. Dùng **So sánh** và **Khôi phục** trong lịch sử nếu cần. Muốn ẩn CV đã dùng, chọn Lưu trữ.
6. Chuyển **CV A4 / Landing page** để xem cùng mẫu; Landing tự co theo màn hình.
7. **Xuất hồ sơ → Tải PDF A4 / CV HTML / Landing page → Tải tệp xuống**.
8. Tải Sao lưu tất cả định kỳ và trước thay domain/thiết bị.

Ảnh JPEG/PNG/WebP dưới 8 MB và 40 megapixel, tối ưu tại thiết bị. HEIC cần chuyển trước. Ký tự hiếm ngoài font có cảnh báo; kiểm tra PDF trước khi gửi. In trình duyệt: A4, scale 100%, tắt header/footer và dùng lề theo CSS. PDF trực tiếp không cần cài đặt hộp thoại in.

## 6. Push GitHub

Repo mới, tạo repository trống trước; chạy trong thư mục source:

```bash
git init
git branch -M main
git add .
git commit -m "feat: release CV Atelier v1.4.0"
git remote add origin https://github.com/YOUR_OWNER/YOUR_REPO.git
git push -u origin main
```

Repo có source: clone/fetch trước khi chép bản mới; giữ thay đổi riêng của Boss.

```bash
git clone https://github.com/YOUR_OWNER/YOUR_REPO.git
cd YOUR_REPO
git fetch origin
git status
```

Chép source v1.4.0 vào đúng thư mục dự án, rồi:

```bash
npm ci
npm run check
npm test
npm run build
git add .
git commit -m "feat: upgrade CV Atelier to v1.4.0"
git pull --rebase origin main
git push origin main
```

Nếu conflict: sửa, kiểm tra, `git add` và `git rebase --continue`. Không force push để giải quyết `fetch first`. Không commit `.env`, token, node_modules hoặc dữ liệu cá nhân. Backup JSON giữ ngoài repo công khai.

## 7. Deploy Vercel

Boss tự deploy; không cần biến môi trường/database.

| Thiết lập | Giá trị |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Thư mục có `package.json`; `.` nếu source ở gốc repo |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.x hoặc 24.x |
| Production Branch | `main` hoặc branch Boss đã cấu hình |
| Environment Variables | Không cần |

Import repo GitHub vào project Vercel, kiểm tra bảng cấu hình, Deploy và chờ Ready. Với project có sẵn, giữ Root/Build/Output đúng và push Production Branch. Những lần sau Git Integration kết nối sẽ deploy theo push.

Sau deploy: kiểm tra v1.4.0, CV cũ được chuyển đúng; nhân bản/chỉnh một CV/chuyển lại CV gốc; tải lại giữ dữ liệu; thử phiên bản/so sánh/khôi phục; Landing khớp A4 ở bốn mẫu; xuất PDF/HTML, chọn ảnh và nhập backup trên máy Boss.

Muốn xuất bản hồ sơ chỉ xem: xuất Landing HTML, đổi tên `index.html`, deploy ở repo riêng; file tự chứa font/ảnh, không cần build. Nội dung editor không tự push hoặc cập nhật cho người khác. Đồng bộ/đăng nhập thuộc v1.5.0 đề xuất.

## 8. Xử lý lỗi

| Hiện tượng | Cách xử lý |
| --- | --- |
| Landing còn ảnh vòm/hero cũ | Kiểm tra deployment v1.4.0 và đã push đủ `landing.js`, `export.js`, CSS; tải lại app, không xóa dữ liệu hồ sơ |
| Không thấy CV đã chỉnh | Kiểm tra CV đang chọn, domain/trình duyệt; nhập Sao lưu nếu đã đổi máy |
| Hết dung lượng / không lưu | Tải Sao lưu tất cả ngay; lỗi không tự xóa hồ sơ hoặc ghi đè bản đã lưu |
| Có thay đổi ở tab khác | Sao lưu phiên đang sửa rồi Nạp bản đã lưu; không tiếp tục ghi đè từ tab cũ |
| Nhập JSON lỗi | Dùng backup v1.4 hoặc JSON v1/v2 đúng định dạng; tối đa 32 MB và không vượt 30 CV sau nhập |
| Đủ mốc được giữ | Tải backup rồi xóa mốc không cần; app cần chỗ lưu hiện trạng trước khôi phục |
| File chưa tải | Sau tạo file, bấm Tải tệp xuống và kiểm tra Downloads |
| PDF nhiều trang | Rút gọn hoặc chỉnh lề/mật độ; zoom xem không làm PDF ngắn hơn |
| Còn ghi chú bản nháp | Rà soát/xác nhận kinh nghiệm và dự án, rồi tắt ghi chú thủ công nếu phù hợp |
| Không đổi được cột Academic | Mẫu phân cột cố định; sắp xếp trong cột hoặc chọn mẫu một cột |

Giới hạn QA thực tế: `VERIFICATION.md`. Kế hoạch tiếp: `ROADMAP.md`. Khi muốn nâng cấp, gửi ZIP mới nhất và JSON backup nếu cần giữ nội dung cá nhân.
