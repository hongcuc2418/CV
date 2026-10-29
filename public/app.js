import { TEMPLATES, templateFor, selectTemplate } from "./templates.js";
import {
  VERSION,
  STORAGE_KEY,
  LEGACY_KEY,
  SECTIONS,
  defaults,
  clone,
  escapeHtml as esc,
  nfc,
  setPath,
  validateData,
  moveSection,
  review,
  TARGETS,
  isDraft,
} from "./model.js";
import { loadData, saveData } from "./storage.js";
import {
  PAGE,
  PALETTES,
  fontMetrics,
  createLayout,
  renderSVG,
  createPDF,
} from "./document.js";
import { FONT_FILES, bytesBase64, buildHTML } from "./export.js";
import { renderLandingView } from "./landing.js";
const $ = (s) => document.querySelector(s);
let lastSaveError = "";
let store;
try {
  store = window.localStorage;
} catch {
  store = {
    getItem() {
      throw Error("Trình duyệt không cho truy cập bộ nhớ.");
    },
    setItem() {
      throw Error("Trình duyệt không cho lưu dữ liệu.");
    },
  };
}
const loaded = loadData(store);
let data = loaded.data,
  blockedSave = Boolean(loaded.error),
  group = "profile",
  mode = "studio",
  history = [],
  future = [],
  env = null,
  layout = null,
  saveTimer,
  renderTimer,
  toastTimer,
  lastEdit = "",
  lastEditTime = 0,
  dragKey = "",
  blobURL = "",
  busy = false,
  dirty = false;
const composing = new WeakSet();
const GROUPS = {
  profile: "Thông tin cá nhân",
  experience: "Kinh nghiệm làm việc",
  projects: "Dự án & đơn vị",
  education: "Học vấn & chứng chỉ",
  skills: "Kỹ năng & công cụ",
  content: "Định hướng & rà soát",
  design: "Kiểu dáng & bố cục",
};
const sectionGroup = (key) =>
  ({
    summary: "profile",
    goal: "profile",
    experiences: "experience",
    projects: "projects",
    institutions: "projects",
    education: "education",
    certificates: "education",
    skills: "skills",
    expertise: "skills",
    tools: "skills",
    languages: "skills",
  })[key] || "profile";
const status = (text, error = false) => {
  $("#saveStatus").textContent = text;
  $("#saveStatus").dataset.error = String(error);
};
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => ($("#toast").hidden = true), 5500);
}
function checkpoint(path = "action") {
  const now = Date.now();
  if (path === "action" || path !== lastEdit || now - lastEditTime > 900) {
    history.push(clone(data));
    if (history.length > 24) history.shift();
  }
  lastEdit = path;
  lastEditTime = now;
  future = [];
  updateHistory();
}
function updateHistory() {
  $("#undo").disabled = !history.length;
  $("#redo").disabled = !future.length;
}
function persist() {
  clearTimeout(saveTimer);
  if (blockedSave) {
    status("Chưa lưu · cần xử lý thông báo", true);
    return false;
  }
  try {
    saveData(store, data);
    dirty = false;
    lastSaveError = "";
    status("Đã lưu trên trình duyệt");
    return true;
  } catch (error) {
    dirty = true;
    status("Chưa lưu · hãy sao lưu", true);
    $("#saveStatus").title = error.message;
    if (lastSaveError !== error.message)
      toast(error.message + " Hãy sửa nội dung hoặc tải bản sao lưu.");
    lastSaveError = error.message;
    return false;
  }
}
function queue() {
  dirty = true;
  status(
    blockedSave ? "Chưa lưu · cần xử lý thông báo" : "Đang lưu…",
    blockedSave,
  );
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 500);
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 90);
}
function change(fn, { form = false } = {}) {
  checkpoint();
  fn();
  queue();
  render();
  if (form) renderForm();
}
function field(
  label,
  path,
  value,
  {
    area = false,
    list = false,
    rows = 3,
    type = "text",
    help = "",
    min,
    max,
    step,
  } = {},
) {
  const id = "f-" + path.replaceAll(".", "-"),
    range = type === "range";
  return `<label class="form-field" for="${id}"><span>${label}${range ? ` <output>${esc(value)}</output>` : ""}</span>${area ? `<textarea id="${id}" data-path="${path}" ${list ? 'data-list="1"' : ""} rows="${rows}" maxlength="6000" spellcheck="false">${esc(Array.isArray(value) ? value.join("\n") : value)}</textarea>` : `<input id="${id}" data-path="${path}" type="${type}" value="${esc(value)}" ${min !== undefined ? `min="${min}" max="${max}" step="${step || 1}"` : 'maxlength="6000"'} ${range ? "" : 'autocomplete="off" spellcheck="false"'}>`}${help ? `<small>${help}</small>` : ""}</label>`;
}
function check(label, path, value) {
  return `<label class="check-field"><input type="checkbox" data-path="${path}" ${value ? "checked" : ""}><span>${label}</span></label>`;
}
function openGroup(next, path) {
  if (!Object.hasOwn(GROUPS, next)) next = "profile";
  group = next;
  renderForm();
  renderRail();
  document.body.classList.add("properties-open");
  requestAnimationFrame(() => {
    if (!path) return;
    const e = document.getElementById("f-" + path.replaceAll(".", "-"));
    if (e) {
      e.focus();
      e.scrollIntoView({ block: "center" });
    }
  });
}
function renderRail() {
  const hidden = data.design.hiddenSections;
  $("#sectionList").innerHTML = data.design.sectionOrder
    .map(
      (key, i) =>
        `<div class="section-row ${sectionGroup(key) === group ? "active" : ""} ${hidden.includes(key) ? "is-hidden" : ""}" draggable="true" data-section="${key}"><span class="grip" aria-hidden="true">⠿</span><button class="section-name" data-open="${sectionGroup(key)}">${SECTIONS[key]}</button><div class="section-arrows"><button data-action="move" data-key="${key}" data-delta="-1" aria-label="Đưa ${SECTIONS[key]} lên" ${i === 0 ? "disabled" : ""}>↑</button><button data-action="move" data-key="${key}" data-delta="1" aria-label="Đưa ${SECTIONS[key]} xuống" ${i === data.design.sectionOrder.length - 1 ? "disabled" : ""}>↓</button></div><button class="visibility" data-action="visibility" data-key="${key}" aria-label="${hidden.includes(key) ? "Hiện" : "Ẩn"} ${SECTIONS[key]}" aria-pressed="${!hidden.includes(key)}">${hidden.includes(key) ? "○" : "◉"}</button></div>`,
    )
    .join("");
  $("#reviewCount").textContent = review(data).length || "✓";
}
function renderForm() {
  const p = data.profile,
    d = data.design;
  $("#formTitle").textContent = GROUPS[group];
  $("#groupSelect").value = group;
  if (group === "profile")
    $("#form").innerHTML =
      `<p class="form-help">Bấm vào nội dung trên trang A4 để chỉnh nhanh. Thay đổi hiển thị ngay và được lưu trên trình duyệt.</p>${field("Họ và tên", "profile.name", p.name)}${field("Vị trí ứng tuyển", "profile.role", p.role)}${field("Tóm tắt chuyên môn", "profile.summary", p.summary, { area: true, rows: 5, help: "Ưu tiên 3–5 dòng, kinh nghiệm liên quan và giá trị phù hợp vị trí." })}${field("Điện thoại", "profile.phone", p.phone, { type: "tel" })}${field("Email", "profile.email", p.email, { type: "email" })}${field("Địa chỉ", "profile.address", p.address)}<hr class="form-divider"><h3 class="form-title">Ảnh đại diện</h3>${p.photo ? `<img class="photo-mini" src="${esc(p.photo)}" alt="Ảnh đại diện">` : ""}<div class="upload-actions"><button class="small-button" data-action="upload">${p.photo ? "Thay ảnh" : "Tải ảnh lên"}</button>${p.photo ? '<button class="small-button" data-action="removePhoto">Xóa ảnh</button>' : ""}</div><p class="form-help">JPEG, PNG, WebP · tối đa 8 MB. Ảnh được xử lý trên thiết bị, không gửi đến máy chủ.</p>${check("Hiển thị ảnh / khung ảnh trên CV", "design.photoVisible", d.photoVisible)}${p.photo ? `${field("Căn ngang (%)", "profile.photoX", p.photoX, { type: "range", min: 0, max: 100 })}${field("Căn dọc (%)", "profile.photoY", p.photoY, { type: "range", min: 0, max: 100 })}${field("Phóng ảnh", "design.photoZoom", d.photoZoom, { type: "range", min: 1, max: 2.5, step: 0.05 })}` : ""}<hr class="form-divider">${field("Mục tiêu nghề nghiệp", "profile.goal", p.goal, { area: true, rows: 4 })}${field("Nhãn trên landing page", "profile.eyebrow", p.eyebrow)}${field("Thông điệp cá nhân", "profile.tagline", p.tagline, { area: true, rows: 2 })}`;
  if (group === "experience")
    $("#form").innerHTML =
      `<p class="form-help">Chỉ liệt kê công ty / đơn vị từng công tác. Các trường đã tham gia dự án được trình bày riêng ở mục Dự án.</p>${data.experiences.map((e, i) => `<article class="form-card"><div class="form-card-head"><b>KINH NGHIỆM ${i + 1}</b><button class="delete" data-action="removeExperience" data-index="${i}">Xóa mục</button></div>${field("Công ty / đơn vị công tác", `experiences.${i}.company`, e.company)}${field("Chức danh / mảng công việc", `experiences.${i}.role`, e.role)}${field("Thời gian", `experiences.${i}.period`, e.period)}${field("Phạm vi công việc", `experiences.${i}.description`, e.description, { area: true, rows: 2 })}${field("Nhiệm vụ", `experiences.${i}.bullets`, e.bullets, { area: true, list: true, rows: 5, help: "Mỗi dòng một ý. Chỉ mô tả công việc thực tế." })}${field("Kết quả / đóng góp", `experiences.${i}.results`, e.results, { area: true, list: true, rows: 3, help: "Để trống khi chưa có dữ liệu; không tự tạo số liệu thành tích." })}${check("Tôi đã rà soát và xác nhận nội dung mục này", `experiences.${i}.confirmed`, e.confirmed)}</article>`).join("")}<button class="add-item" data-action="addExperience">+ Thêm kinh nghiệm</button>`;
  if (group === "projects")
    $("#form").innerHTML =
      `<p class="form-help">VLU, NTT… là đơn vị dự án, không phải nơi đã làm việc. Có thể giữ danh sách ngắn hoặc bổ sung dự án tiêu biểu với vai trò rõ ràng.</p>${field("Các đơn vị đã tham gia dự án", "institutions", data.institutions, { area: true, list: true, rows: 5, help: "Mỗi dòng một đơn vị; giữ tên viết tắt nếu chưa xác nhận tên đầy đủ." })}${data.projects.map((e, i) => `<article class="form-card"><div class="form-card-head"><b>DỰ ÁN ${i + 1}</b><button class="delete" data-action="removeProject" data-index="${i}">Xóa mục</button></div>${field("Tên dự án / cơ sở giáo dục", `projects.${i}.name`, e.name)}${field("Vai trò tham gia", `projects.${i}.role`, e.role)}${field("Thời gian", `projects.${i}.period`, e.period)}${field("Nghiệp vụ / phân hệ / phạm vi", `projects.${i}.scope`, e.scope, { area: true, rows: 3 })}${field("Đóng góp cụ thể", `projects.${i}.contributions`, e.contributions, { area: true, list: true, rows: 4 })}${check("Tôi đã xác nhận thông tin dự án", `projects.${i}.confirmed`, e.confirmed)}</article>`).join("")}<button class="add-item" data-action="addProject">+ Thêm dự án tiêu biểu</button>`;
  if (group === "education")
    $("#form").innerHTML =
      `<p class="form-help">Chỉ điền học vấn và chứng chỉ có thật. Mục trống không xuất hiện trên bản CV xuất ra.</p>${data.education.map((e, i) => `<article class="form-card"><div class="form-card-head"><b>HỌC VẤN ${i + 1}</b><button class="delete" data-action="removeEducation" data-index="${i}">Xóa mục</button></div>${field("Trường / cơ sở đào tạo", `education.${i}.school`, e.school)}${field("Chuyên ngành / bằng cấp", `education.${i}.major`, e.major)}${field("Thời gian học", `education.${i}.period`, e.period)}${field("Thông tin bổ sung", `education.${i}.detail`, e.detail, { area: true, rows: 3 })}</article>`).join("")}<button class="add-item" data-action="addEducation">+ Thêm học vấn</button>${field("Chứng chỉ & đào tạo", "certificates", data.certificates, { area: true, list: true, rows: 4, help: "Mỗi dòng một chứng chỉ thực tế." })}`;
  if (group === "skills")
    $("#form").innerHTML =
      `<p class="form-help">Phân biệt điều quan tâm với năng lực đã có. Không dùng phần trăm hoặc tự gán mức thành thạo.</p>${field("Kỹ năng chuyên môn", "expertise", data.expertise, { area: true, list: true, rows: 4, help: "Ví dụ: nghiệp vụ/phân hệ đã có kinh nghiệm thực tế." })}${field("Công cụ sử dụng", "tools", data.tools, { area: true, list: true, rows: 3 })}${field("Ngoại ngữ", "languages", data.languages, { area: true, list: true, rows: 3, help: "Ghi trình độ/chứng chỉ khi có căn cứ." })}${field("Lĩnh vực quan tâm / định hướng", "skills", data.skills, { area: true, list: true, rows: 4 })}`;
  if (group === "content") {
    const target = TARGETS[data.target],
      issues = review(data);
    $("#form").innerHTML =
      `<p class="form-help">Gợi ý hỗ trợ cách trình bày, không xác nhận năng lực thay ứng viên. Nội dung mẫu cần điều chỉnh theo công việc thực tế.</p><label class="form-field"><span>Vị trí định hướng</span><select id="targetSelect">${Object.entries(
        TARGETS,
      )
        .map(
          ([key, v]) =>
            `<option value="${key}" ${key === data.target ? "selected" : ""}>${v.label}</option>`,
        )
        .join(
          "",
        )}</select></label><div class="keyword-list">${target.keywords.map((x) => `<span>${x}</span>`).join("")}</div><button class="small-button" data-action="applyRole">Dùng vị trí ứng tuyển này</button><h3 class="form-title">Gợi ý tóm tắt</h3><div class="suggestion"><p>${esc(target.summary)}</p><button class="small-button" data-action="applySummary">Dùng bản gợi ý · có thể hoàn tác</button></div><p class="form-note">Các gợi ý hiện dựa trên hồ sơ mẫu của Hồng Cúc: ASC từ 12/2022, phần mềm HRM 8 tháng. Chỉ áp dụng khi thông tin này đúng với hồ sơ đang chỉnh.</p><h3 class="form-title">Rà soát trước khi ứng tuyển</h3>${issues.length ? issues.map((e) => `<button class="review-item" data-review-path="${e.path}" data-open="${e.tab}">${esc(e.text)}</button>`).join("") : '<p class="review-good">Các trường cơ bản đã đủ. Hãy kiểm tra lại nội dung và bản PDF trước khi gửi.</p>'}<hr class="form-divider">${check("Hiển thị ghi chú bản nháp", "design.draft", data.design.draft)}<p class="form-help">Ghi chú bản nháp vẫn xuất hiện nếu còn kinh nghiệm hoặc dự án chưa xác nhận. Đánh dấu xác nhận ngay trong từng mục sau khi rà soát.</p>`;
  }
  if (group === "design")
    $("#form").innerHTML =
      `<p class="form-help">Thống nhất phong cách cho trang A4 và PDF. Thay đổi bố cục giữ nguyên nội dung hồ sơ.</p><button class="design-template-button" data-open-templates><span>Mẫu đang dùng</span><b>${templateFor(data).name} ↗</b></button><h3 class="form-title">Bảng màu</h3><div class="swatches">${Object.entries(
        PALETTES,
      )
        .map(
          ([key, c]) =>
            `<button data-action="theme" data-key="${key}" aria-pressed="${d.theme === key}"><span class="swatch" style="background:${c.ink}"></span>${{ navy: "Xanh navy", forest: "Xanh rừng", burgundy: "Đỏ rượu" }[key]}</button>`,
        )
        .join(
          "",
        )}</div><label class="form-field"><span>Kiểu chữ tiêu đề</span><select data-path="design.font"><option value="editorial" ${d.font === "editorial" ? "selected" : ""}>Thanh lịch · Có chân</option><option value="modern" ${d.font === "modern" ? "selected" : ""}>Hiện đại · Không chân</option></select></label><h3 class="form-title">Mật độ nội dung</h3><div class="density"><button data-action="density" data-key="compact">Gọn</button><button data-action="density" data-key="balanced">Cân bằng</button><button data-action="density" data-key="airy">Thoáng</button></div>${field("Lề trang (mm)", "design.margin", d.margin, { type: "range", min: 10, max: 24 })}${field("Cỡ chữ thân bài (pt)", "design.fontSize", d.fontSize, { type: "range", min: 9, max: 13, step: 0.25 })}${field("Giãn dòng", "design.lineHeight", d.lineHeight, { type: "range", min: 1.2, max: 1.8, step: 0.05 })}${field("Khoảng cách mục (pt)", "design.sectionGap", d.sectionGap, { type: "range", min: 6, max: 22 })}${templateFor(data).id === "classic" ? '<p class="form-note">Classic ATS không hiển thị ảnh. Tùy chọn ảnh của bạn được giữ cho các mẫu khác.</p>' : check("Hiện ảnh / khung ảnh", "design.photoVisible", d.photoVisible)}<p class="form-note">Nội dung dài được chuyển sang trang tiếp theo, không ép thu nhỏ chữ hoặc cắt dữ liệu để giữ một trang.</p><div class="mobile-order"><h3 class="form-title">Thứ tự & hiển thị các mục A4</h3>${data.design.sectionOrder.map((key, i) => `<div class="section-row"><span class="section-name">${SECTIONS[key]}</span><button class="small-button" data-action="move" data-key="${key}" data-delta="-1" aria-label="Đưa ${SECTIONS[key]} lên" ${i === 0 ? "disabled" : ""}>↑</button><button class="small-button" data-action="move" data-key="${key}" data-delta="1" aria-label="Đưa ${SECTIONS[key]} xuống" ${i === data.design.sectionOrder.length - 1 ? "disabled" : ""}>↓</button><button class="visibility" data-action="visibility" data-key="${key}" aria-label="Đổi hiển thị ${SECTIONS[key]}">${data.design.hiddenSections.includes(key) ? "○" : "◉"}</button></div>`).join("")}</div><button class="danger-button" data-action="reset">Đặt lại mẫu ban đầu</button>`;
}
function zoomFactor() {
  const sel = $("#zoom").value,
    area = $("#canvasScroll");
  const baseW = (PAGE.width * 96) / 72,
    baseH = (PAGE.height * 96) / 72;
  if (sel === "fit")
    return Math.min(1.4, Math.max(0.2, (area.clientWidth - 56) / baseW));
  if (sel === "page")
    return Math.min(
      1.2,
      Math.max(
        0.2,
        Math.min(
          (area.clientWidth - 56) / baseW,
          (area.clientHeight - 62) / baseH,
        ),
      ),
    );
  return Number(sel);
}
function paintPages() {
  if (!layout) return;
  const scale = zoomFactor(),
    w = ((PAGE.width * 96) / 72) * scale,
    h = ((PAGE.height * 96) / 72) * scale;
  $("#pages").innerHTML = layout.pages
    .map(
      (_, i) =>
        `<article class="page-wrap" style="width:${w}px;height:${h}px">${renderSVG(layout, i)}<span class="page-label">TRANG ${i + 1} / ${layout.pages.length}</span></article>`,
    )
    .join("");
  $("#printOutput").innerHTML = layout.pages
    .map(
      (_, i) =>
        `<article class="print-page">${renderSVG(layout, i, { editable: false })}</article>`,
    )
    .join("");
}
function openTemplates() {
  if (!env) {
    toast("Chờ font và trang CV tải xong trước khi chọn mẫu.");
    return;
  }
  $("#templateGallery").innerHTML = Object.values(TEMPLATES)
    .map((t) => {
      let preview = "";
      try {
        const example = clone(data);
        selectTemplate(example, t.id);
        const l = createLayout(example, env.metrics);
        preview = renderSVG(l, 0, {
          editable: false,
          idPrefix: "thumb-" + t.id,
        });
      } catch {
        preview =
          '<div class="template-preview-error">Cần rút gọn nội dung để xem trước.</div>';
      }
      return `<button class="template-card ${templateFor(data).id === t.id ? "selected" : ""}" data-select-template="${t.id}" aria-pressed="${templateFor(data).id === t.id}"><span class="template-thumb" aria-hidden="true">${preview}<span class="template-badge">${t.badge}</span></span><span class="template-card-copy"><span class="template-card-title">${t.name}<span class="template-selection">${templateFor(data).id === t.id ? "✓" : "↗"}</span></span><span class="template-card-label">${t.label}</span><span class="template-card-description">${t.description}</span></span></button>`;
    })
    .join("");
  $("#templateDialog").showModal();
}
function render() {
  document.body.dataset.theme = data.design.theme;
  document.body.dataset.font = data.design.font;
  document.title = (data.profile.name || "Hồ sơ") + " · CV Atelier";
  renderRail();
  const template = templateFor(data);
  $("#templateName").textContent = template.name;
  $("#grayscaleToggle").checked =
    data.design.monochrome || template.id === "classic";
  $("#grayscaleToggle").disabled = template.id === "classic";
  $("#laneNote").textContent =
    template.id === "academic"
      ? "Bố cục hai cột · Thứ tự mục được áp dụng trong từng cột."
      : template.id === "classic"
        ? "Bố cục một cột · Không ảnh, ưu tiên văn bản và thứ tự đọc."
        : "Bố cục một cột · Thứ tự mục áp dụng từ trên xuống.";
  if (!env) return;
  try {
    layout = createLayout(data, env.metrics);
    paintPages();
    $("#pageCount").textContent = `${layout.pages.length} trang · 210 × 297 mm`;
    $("#layoutWarnings").classList.remove("error");
    $("#layoutWarnings").textContent = layout.warnings.join(" ");
    if (mode === "landing") paintLanding();
  } catch (error) {
    layout = null;
    $("#layoutWarnings").classList.add("error");
    $("#layoutWarnings").textContent = error.message;
    $("#pages").innerHTML =
      '<div class="loading-card">Chưa thể dựng CV. Hãy rút gọn hoặc điều chỉnh nội dung.</div>';
    $("#pageCount").textContent = "Cần điều chỉnh nội dung";
    $("#printOutput").innerHTML = "";
  }
}
function paintLanding() {
  $("#landing").innerHTML = renderLandingView(data);
}
function setMode(next) {
  mode = next;
  $("#studioMode").setAttribute("aria-pressed", String(next === "studio"));
  $("#landingMode").setAttribute("aria-pressed", String(next === "landing"));
  $("#pages").hidden = next !== "studio";
  $("#landing").hidden = next !== "landing";
  $(".zoom-controls").hidden = next === "landing";
  $("#canvasLabel").textContent =
    next === "studio" ? "BẢN THIẾT KẾ A4" : "LANDING PAGE";
  if (next === "landing") paintLanding();
  else paintPages();
}
function slug() {
  return (data.profile.name || "ho-so")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
function readyDownload(name, content, type) {
  if (blobURL) URL.revokeObjectURL(blobURL);
  blobURL = URL.createObjectURL(new Blob([content], { type }));
  $("#readyLink").href = blobURL;
  $("#readyLink").download = name;
  $("#downloadInfo").textContent =
    name + " · Bấm Tải tệp xuống để lưu vào thiết bị.";
  $("#downloadDialog").showModal();
}
function backup() {
  readyDownload(
    "CV-Atelier-" + slug() + "-v1.3.0.json",
    JSON.stringify(validateData(data), null, 2),
    "application/json;charset=utf-8",
  );
}
async function preparePhoto(profile) {
  if (!profile.photo) return;
  const response = await fetch(profile.photo);
  const blob = await response.blob();
  const image = await createImageBitmap(blob, {
    imageOrientation: "from-image",
  });
  if (image.width * image.height > 40000000) {
    image.close();
    throw Error("Ảnh vượt quá 40 megapixel.");
  }
  const ratio = Math.min(1, 1200 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  profile.photo = canvas.toDataURL("image/jpeg", 0.9);
  profile.photoWidth = canvas.width;
  profile.photoHeight = canvas.height;
}
async function exportFile(kind) {
  if (busy) return;
  if (!env || !layout) {
    toast("Chờ bố cục và font tải xong hoặc xử lý cảnh báo trước khi xuất.");
    return;
  }
  busy = true;
  const buttons = [...$("#exportDialog").querySelectorAll(".export-option")];
  buttons.forEach((b) => (b.disabled = true));
  try {
    const snapshot = validateData(clone(data));
    if (
      snapshot.profile.photo &&
      (snapshot.profile.photo.startsWith("data:image/webp") ||
        !snapshot.profile.photoWidth)
    ) {
      await preparePhoto(snapshot.profile);
    }
    if (kind === "pdf") {
      status("Đang tạo PDF…");
      const result = await createPDF(snapshot, {
        PDFLib: window.PDFLib,
        fontkit: window.fontkit,
        fontBytes: env.fontBytes,
      });
      readyDownload("CV-" + slug() + ".pdf", result.bytes, "application/pdf");
    } else {
      const docLayout = createLayout(snapshot, env.metrics);
      const fonts = Object.fromEntries(
        Object.entries(env.fontBytes).map(([k, v]) => [k, bytesBase64(v)]),
      );
      const html = buildHTML(snapshot, docLayout, {
        fonts,
        landing: renderLandingView(snapshot, { staticMode: true }),
        landingCSS: env.landingCSS,
        mode: kind === "landing" ? "landing" : "cv",
      });
      readyDownload(
        (kind === "landing" ? "Landing-" : "CV-") + slug() + ".html",
        html,
        "text/html;charset=utf-8",
      );
    }
    status(
      blockedSave
        ? "Chưa lưu · dữ liệu cũ được giữ"
        : dirty
          ? "Có thay đổi chưa lưu"
          : "Đã lưu trên trình duyệt",
      blockedSave || dirty,
    );
  } catch (error) {
    toast("Không xuất được: " + error.message);
    status(dirty ? "Có thay đổi chưa lưu" : "Sẵn sàng", dirty);
  } finally {
    busy = false;
    buttons.forEach((b) => (b.disabled = false));
  }
}
function syncLegacyVisibility(key, visible) {
  const map = {
    education: "showEducation",
    institutions: "showInstitutions",
    skills: "showSkills",
    certificates: "showCertificates",
    goal: "showGoal",
  };
  if (map[key]) data.design[map[key]] = visible;
}
function updateInput(el) {
  const path = el.dataset.path;
  if (!path || composing.has(el)) return;
  const value =
    el.type === "checkbox"
      ? el.checked
      : el.type === "range"
        ? Number(el.value)
        : el.dataset.list
          ? el.value
              .split("\n")
              .map((s) => nfc(s.trim()))
              .filter(Boolean)
          : nfc(el.value);
  checkpoint(path);
  setPath(data, path, value);
  const match = path.match(/^(experiences|projects)\.(\d+)\./);
  if (match && !path.endsWith(".confirmed")) {
    const confirm = $("#form").querySelector(
      `[data-path="${match[1]}.${match[2]}.confirmed"]`,
    );
    if (confirm) confirm.checked = false;
  }
  if (el.type === "range")
    el.closest("label").querySelector("output").textContent = value;
  queue();
}
$("#form").addEventListener("compositionstart", (e) => composing.add(e.target));
$("#form").addEventListener("compositionend", (e) => {
  composing.delete(e.target);
  updateInput(e.target);
});
$("#form").addEventListener("input", (e) => {
  if (!e.isComposing) updateInput(e.target);
});
$("#form").addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT" && e.target.dataset.path)
    updateInput(e.target);
  if (e.target.id === "targetSelect")
    change(() => (data.target = e.target.value), { form: true });
});
document.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-select-template]");
  if (choice) {
    change(() => selectTemplate(data, choice.dataset.selectTemplate), {
      form: true,
    });
    persist();
    $("#templateDialog").close();
    toast(
      "Đã áp dụng " +
        templateFor(data).name +
        ". Nội dung hồ sơ được giữ nguyên.",
    );
    return;
  }
  if (e.target.closest("[data-open-templates]")) {
    openTemplates();
    return;
  }
  const open = e.target.closest("[data-open]");
  if (open) {
    openGroup(open.dataset.open, open.dataset.reviewPath);
    return;
  }
  const edit = e.target.closest("[data-edit]");
  if (edit) {
    openGroup(edit.dataset.group || "profile", edit.dataset.edit);
    return;
  }
  const action = e.target.closest("[data-action]");
  if (!action) return;
  const a = action.dataset.action,
    i = Number(action.dataset.index),
    key = action.dataset.key;
  if (a === "upload") {
    $("#photoFile").click();
    return;
  }
  if (a === "reset") {
    $("#resetDialog").showModal();
    return;
  }
  if (a.startsWith("add")) {
    const map = {
      addExperience: ["experiences", 20],
      addEducation: ["education", 15],
      addProject: ["projects", 20],
    };
    if (map[a] && data[map[a][0]].length >= map[a][1]) {
      toast("Đã đạt giới hạn số mục.");
      return;
    }
  }
  change(
    () => {
      if (a === "move") moveSection(data, key, Number(action.dataset.delta));
      if (a === "visibility") {
        const hidden = data.design.hiddenSections,
          index = hidden.indexOf(key);
        index < 0 ? hidden.push(key) : hidden.splice(index, 1);
        syncLegacyVisibility(key, index >= 0);
      }
      if (a === "theme") data.design.theme = key;
      if (a === "density")
        Object.assign(
          data.design,
          {
            compact: { fontSize: 9.5, lineHeight: 1.3, sectionGap: 7 },
            balanced: { fontSize: 10, lineHeight: 1.45, sectionGap: 10 },
            airy: { fontSize: 11, lineHeight: 1.6, sectionGap: 15 },
          }[key],
        );
      const id = () =>
        globalThis.crypto?.randomUUID?.() ||
        "item-" +
          Date.now().toString(36) +
          "-" +
          Math.random().toString(36).slice(2, 11);
      if (a === "addExperience")
        data.experiences.push({
          id: id(),
          company: "",
          role: "",
          period: "",
          description: "",
          bullets: [],
          results: [],
          confirmed: false,
        });
      if (a === "removeExperience") data.experiences.splice(i, 1);
      if (a === "addEducation")
        data.education.push({
          id: id(),
          school: "",
          major: "",
          period: "",
          detail: "",
        });
      if (a === "removeEducation") data.education.splice(i, 1);
      if (a === "addProject")
        data.projects.push({
          id: id(),
          name: "",
          role: "",
          period: "",
          scope: "",
          contributions: [],
          confirmed: false,
        });
      if (a === "removeProject") data.projects.splice(i, 1);
      if (a === "removePhoto") {
        data.profile.photo = "";
        data.profile.photoWidth = 0;
        data.profile.photoHeight = 0;
      }
      if (a === "applyRole") data.profile.role = TARGETS[data.target].label;
      if (a === "applySummary")
        data.profile.summary = TARGETS[data.target].summary;
    },
    {
      form:
        [
          "theme",
          "density",
          "addExperience",
          "removeExperience",
          "addEducation",
          "removeEducation",
          "addProject",
          "removeProject",
          "removePhoto",
        ].includes(a) ||
        (group === "design" && ["move", "visibility"].includes(a)),
    },
  );
  if (a === "move")
    requestAnimationFrame(() =>
      (window.innerWidth <= 1000 ? $("#form .mobile-order") : $("#sectionList"))
        ?.querySelector(
          `[data-action="move"][data-key="${key}"][data-delta="${action.dataset.delta}"]`,
        )
        ?.focus(),
    );
  if (a === "applySummary")
    toast("Đã áp dụng gợi ý. Hãy xác nhận đúng kinh nghiệm; có thể hoàn tác.");
});
$("#sectionList").addEventListener("dragstart", (e) => {
  const row = e.target.closest("[data-section]");
  if (!row) return;
  dragKey = row.dataset.section;
  row.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragKey);
});
$("#sectionList").addEventListener("dragover", (e) => {
  const row = e.target.closest("[data-section]");
  if (row) {
    e.preventDefault();
    row.classList.add("drop-target");
  }
});
$("#sectionList").addEventListener("dragleave", (e) =>
  e.target.closest("[data-section]")?.classList.remove("drop-target"),
);
$("#sectionList").addEventListener("drop", (e) => {
  e.preventDefault();
  const to = e.target.closest("[data-section]")?.dataset.section;
  if (!to || !dragKey || to === dragKey) return;
  change(() => {
    const order = data.design.sectionOrder,
      fromIndex = order.indexOf(dragKey),
      toIndex = order.indexOf(to);
    if (fromIndex < 0 || toIndex < 0) return;
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, dragKey);
  });
  dragKey = "";
});
$("#sectionList").addEventListener("dragend", () => {
  dragKey = "";
  renderRail();
});
$("#groupSelect").onchange = (e) => openGroup(e.target.value);
$("#profileNav").onclick = () => openGroup("profile");
$("#templateOpen").onclick = openTemplates;
$("#templateNav").onclick = openTemplates;
$("#closeTemplate").onclick = () => $("#templateDialog").close();
$("#grayscaleToggle").onchange = (e) => {
  change(() => (data.design.monochrome = e.target.checked));
  persist();
};
$("#designNav").onclick = () => openGroup("design");
$("#reviewNav").onclick = () => openGroup("content");
$("#mobileEdit").onclick = () => openGroup(group);
$("#closeProperties").onclick = () =>
  document.body.classList.remove("properties-open");
$("#studioMode").onclick = () => setMode("studio");
$("#landingMode").onclick = () => setMode("landing");
$("#zoom").onchange = paintPages;
function zoomStep(delta) {
  const values = [0.6, 0.8, 1, 1.25, 1.5],
    current = zoomFactor();
  $("#zoom").value = String(
    delta > 0
      ? values.find((n) => n > current + 0.01) || 1.5
      : [...values].reverse().find((n) => n < current - 0.01) || 0.6,
  );
  paintPages();
}
$("#zoomOut").onclick = () => zoomStep(-1);
$("#zoomIn").onclick = () => zoomStep(1);
new ResizeObserver(() => paintPages()).observe($("#canvasScroll"));
$("#undo").onclick = () => {
  if (!history.length) return;
  future.push(clone(data));
  data = history.pop();
  lastEdit = "";
  queue();
  render();
  renderForm();
  updateHistory();
};
$("#redo").onclick = () => {
  if (!future.length) return;
  history.push(clone(data));
  data = future.pop();
  lastEdit = "";
  queue();
  render();
  renderForm();
  updateHistory();
};
$("#backup").onclick = backup;
$("#restore").onclick = () => $("#jsonFile").click();
$("#jsonFile").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 3 * 1024 * 1024) throw Error("Tệp JSON tối đa 3 MB.");
    const incoming = validateData(JSON.parse(await file.text()));
    await preparePhoto(incoming.profile);
    if (blockedSave) {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) store.setItem(STORAGE_KEY + ":before-import:" + Date.now(), raw);
    }
    checkpoint();
    data = incoming;
    blockedSave = false;
    $("#recoveryBanner").hidden = true;
    queue();
    render();
    renderForm();
    toast("Đã khôi phục hồ sơ. Có thể hoàn tác.");
  } catch (error) {
    toast("Không nhập được tệp: " + error.message);
  } finally {
    e.target.value = "";
  }
};
$("#photoFile").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw Error("Chỉ hỗ trợ JPEG, PNG, WebP.");
    if (file.size > 8 * 1024 * 1024) throw Error("Ảnh tối đa 8 MB.");
    const raw = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(Error("Không đọc được ảnh."));
      r.readAsDataURL(file);
    });
    const profile = { ...data.profile, photo: raw };
    await preparePhoto(profile);
    change(
      () => {
        Object.assign(data.profile, {
          photo: profile.photo,
          photoWidth: profile.photoWidth,
          photoHeight: profile.photoHeight,
          photoX: 50,
          photoY: 50,
        });
        data.design.photoZoom = 1;
      },
      { form: true },
    );
    toast("Đã cập nhật ảnh đại diện.");
  } catch (error) {
    toast(error.message);
  } finally {
    e.target.value = "";
  }
};
$("#exportOpen").onclick = () => {
  clearTimeout(renderTimer);
  render();
  if (!env || !layout) {
    toast("Chờ bố cục và font sẵn sàng trước khi xuất.");
    return;
  }
  persist();
  paintLanding();
  const issues = review(data);
  $("#exportReview").textContent =
    (isDraft(data) ? "Hồ sơ đang có nội dung chờ xác nhận. " : "") +
    (issues.length
      ? `Còn ${issues.length} mục cần rà soát. Bạn vẫn có thể xuất bản nháp.`
      : "Hãy kiểm tra thông tin lần cuối trước khi gửi.");
  $("#exportDialog").showModal();
};
$("#closeExport").onclick = () => $("#exportDialog").close();
$("#downloadPdf").onclick = () => exportFile("pdf");
$("#downloadCvHtml").onclick = () => exportFile("cv");
$("#downloadLanding").onclick = () => exportFile("landing");
$("#closeDownload").onclick = () => $("#downloadDialog").close();
$("#print").onclick = () => {
  if (!layout) return;
  $("#exportDialog").close();
  window.print();
};
$("#cancelReset").onclick = () => $("#resetDialog").close();
$("#confirmReset").onclick = () => {
  change(() => (data = clone(defaults)), { form: true });
  $("#resetDialog").close();
  toast("Đã đặt lại mẫu. Có thể hoàn tác trong phiên.");
};
document.addEventListener("keydown", (e) => {
  if (e.isComposing || composing.has(e.target)) return;
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-edit]")) {
    e.preventDefault();
    openGroup(e.target.dataset.group || "profile", e.target.dataset.edit);
  }
  if (e.key === "Escape") document.body.classList.remove("properties-open");
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (persist()) toast("Đã lưu trên trình duyệt.");
    else toast("Chưa lưu được. Hãy tải bản sao lưu.");
  }
});
window.addEventListener("pagehide", () => {
  if (dirty) persist();
});
window.addEventListener("beforeunload", (e) => {
  if (dirty && !persist()) {
    e.preventDefault();
    e.returnValue = "";
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    blockedSave = true;
    const banner = $("#recoveryBanner");
    banner.hidden = false;
    banner.innerHTML =
      'Hồ sơ đã thay đổi ở tab khác. Sao lưu phần đang chỉnh trước khi nạp bản mới. <button id="backupConflict">Sao lưu bản đang chỉnh</button><button id="loadConflict">Nạp bản đã lưu</button>';
    $("#backupConflict").onclick = backup;
    $("#loadConflict").onclick = () => {
      const fresh = loadData(store);
      if (fresh.error) {
        toast(fresh.error);
        return;
      }
      checkpoint();
      data = fresh.data;
      blockedSave = false;
      dirty = false;
      banner.hidden = true;
      status("Đã nạp bản lưu mới");
      render();
      renderForm();
    };
  }
});
if (loaded.error) {
  const banner = $("#recoveryBanner");
  banner.hidden = false;
  banner.innerHTML =
    'Không đọc được bản lưu. Dữ liệu cũ chưa bị ghi đè. Có thể khôi phục JSON hoặc dùng mẫu mới. <button id="downloadRaw">Tải bản lưu gốc</button><button id="useDefault">Dùng mẫu mới</button>';
  $("#downloadRaw").onclick = () => {
    try {
      readyDownload(
        "CV-Atelier-recovery.txt",
        store.getItem(STORAGE_KEY) || store.getItem(LEGACY_KEY) || "",
        "text/plain;charset=utf-8",
      );
    } catch {
      toast("Trình duyệt không cho đọc bộ nhớ.");
    }
  };
  $("#useDefault").onclick = () => {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) store.setItem(STORAGE_KEY + ":recovery:" + Date.now(), raw);
      blockedSave = false;
      dirty = true;
      if (persist()) banner.hidden = true;
      else toast("Không lưu được. Có thể dùng Sao lưu để giữ dữ liệu.");
    } catch {
      toast("Chưa bảo toàn được bản cũ. Hãy tải bản lưu gốc trước.");
    }
  };
  status("Chưa lưu · dữ liệu cũ được giữ", true);
} else
  status(
    loaded.migrated
      ? "Đã đọc hồ sơ v1 · đang nâng cấp"
      : "Đã lưu trên trình duyệt",
  );
renderForm();
renderRail();
updateHistory();
async function initialize() {
  try {
    if (!window.fontkit || !window.PDFLib)
      throw Error("Thư viện PDF chưa tải xong. Hãy tải lại trang.");
    const fontBytes = {};
    for (const [key, file] of Object.entries(FONT_FILES)) {
      const response = await fetch("./fonts/" + file);
      if (!response.ok) throw Error("Không tải được font tiếng Việt.");
      fontBytes[key] = new Uint8Array(await response.arrayBuffer());
    }
    const cssResponse = await fetch("./landing.css");
    if (!cssResponse.ok) throw Error("Không tải được giao diện landing page.");
    await document.fonts.ready;
    env = {
      fontBytes,
      metrics: fontMetrics(window.fontkit, fontBytes),
      landingCSS: await cssResponse.text(),
    };
    if (
      data.profile.photo &&
      (!data.profile.photoWidth ||
        data.profile.photo.startsWith("data:image/webp"))
    ) {
      await preparePhoto(data.profile);
      dirty = true;
    }
    render();
    if ((loaded.migrated || dirty) && !blockedSave) {
      dirty = true;
      persist();
    }
    if (loaded.migrated)
      toast("Đã nâng cấp hồ sơ v1; dữ liệu v1 gốc vẫn được giữ nguyên.");
  } catch (error) {
    $("#pages").innerHTML =
      `<div class="loading-card">${esc(error.message)}<br><button class="small-button" onclick="location.reload()">Tải lại trang</button></div>`;
    status("Chưa tải đủ tài nguyên", true);
    toast(error.message);
  }
}
initialize();
