import {
  escapeHtml as esc,
  safeContact,
  clone,
  isDraft,
  SECTIONS,
} from "./model.js";
const lines = (s) => esc(s).replace(/\n/g, "<br>");
const editAttrs = (path, group = "profile") =>
  `data-edit="${path}" data-group="${group}" tabindex="0" role="button" aria-label="Chỉnh sửa nội dung"`;
const icon = () => '<span aria-hidden="true">↗</span>';
function contact(type, text) {
  const url = safeContact(type, text);
  const labels = {
    phone: "Bổ sung số điện thoại",
    email: "Bổ sung email",
    address: "Bổ sung địa chỉ",
  };
  const body = `<span>${esc(text || labels[type])}</span>`;
  return url
    ? `<a class="contact-link" href="${esc(url)}">${body}</a>`
    : `<div class="contact-link" ${editAttrs("profile." + type)}>${body}</div>`;
}
export function renderLanding(data) {
  const p = data.profile,
    d = data.design;
  const education = data.education.filter(
    (e) => e.school || e.major || e.period || e.detail,
  );
  const markup = `<section class="hero"><div class="hero-copy"><span class="eyebrow" ${editAttrs("profile.eyebrow")}>${esc(p.eyebrow)}</span><h1 ${editAttrs("profile.name")}>${esc(p.name || "Tên của bạn")}</h1><div class="role-line" ${editAttrs("profile.role")}>${esc(p.role || "Vị trí ứng tuyển")}</div><p class="hero-summary" ${editAttrs("profile.summary")}>${lines(p.summary)}</p><div class="hero-actions"><a class="btn btn-dark" href="#experience">Khám phá kinh nghiệm ${icon("arrow")}</a><a class="link-arrow" href="#contact">Kết nối ${icon("external")}</a></div></div><div class="portrait-area"><div class="portrait-frame" ${editAttrs("profile.photo")}>${p.photo ? `<img src="${esc(p.photo)}" alt="Ảnh đại diện ${esc(p.name)}" style="object-position:${p.photoX}% ${p.photoY}%">` : `<div class="portrait-empty"><span class="plus">${icon("plus")}</span><span>THÊM ẢNH ĐẠI DIỆN</span></div>`}</div><div class="portrait-border"></div><span class="portrait-caption">HỒ SƠ CÁ NHÂN / 2026</span><p class="portrait-note" ${editAttrs("profile.tagline")}>${esc(p.tagline)}</p></div></section>
${d.showInstitutions && data.institutions.length ? `<section class="institutions" aria-label="Các đơn vị đã tham gia dự án"><div class="institutions-label">CÁC ĐƠN VỊ ĐÃ<br>THAM GIA DỰ ÁN</div><div class="institution-list" ${editAttrs("institutions", "experience")}>${data.institutions.map((n) => `<span>${esc(n)}</span>`).join("")}</div></section>` : ""}
<section id="experience" class="section"><div class="section-heading"><div><span class="eyebrow">01 / HÀNH TRÌNH CHUYÊN MÔN</span><h2>Kinh nghiệm làm việc</h2></div><p>Kinh nghiệm phần mềm hướng đến công tác đào tạo trong môi trường giáo dục.</p></div><div class="experience-list">${data.experiences.length ? data.experiences.map((e, i) => `<article class="experience-row"><span class="experience-number">${String(i + 1).padStart(2, "0")}</span><div class="experience-meta"><h3 ${editAttrs(`experiences.${i}.company`, "experience")}>${esc(e.company || "Đơn vị công tác")}</h3><p ${editAttrs(`experiences.${i}.period`, "experience")}>${esc(e.period)}</p></div><div class="experience-content"><h3 ${editAttrs(`experiences.${i}.role`, "experience")}>${esc(e.role)}</h3>${e.description ? `<p ${editAttrs(`experiences.${i}.description`, "experience")}>${lines(e.description)}</p>` : ""}<ul>${e.bullets.map((b, j) => `<li ${editAttrs(`experiences.${i}.bullets`, "experience")}>${esc(b)}</li>`).join("")}</ul>${e.results?.length ? `<h3 ${editAttrs(`experiences.${i}.results`, "experience")}>Kết quả / đóng góp</h3><ul>${e.results.map((b) => `<li ${editAttrs(`experiences.${i}.results`, "experience")}>${esc(b)}</li>`).join("")}</ul>` : ""}</div></article>`).join("") : `<p class="empty-field" ${editAttrs("experiences", "experience")}>Thêm kinh nghiệm làm việc của bạn.</p>`}</div>${d.draft ? `<p class="draft-note">${icon("info")} Mô tả nhiệm vụ là nội dung gợi ý, cần xác nhận trước khi ứng tuyển.</p>` : ""}</section>
${d.showEducation || d.showSkills || d.showCertificates ? `<section id="profile" class="profile-section"><div class="section profile-grid">${d.showEducation ? `<div><span class="eyebrow">02 / NỀN TẢNG</span><h2>Học vấn</h2>${education.length ? education.map((e) => `<article class="profile-item" ${editAttrs("education", "education")}><h3>${esc(e.school || "Tên trường")}</h3><p>${esc(e.major)}${e.period ? ` · ${esc(e.period)}` : ""}</p>${e.detail ? `<p>${lines(e.detail)}</p>` : ""}</article>`).join("") : `<div class="empty-field" ${editAttrs("education", "education")}>Bổ sung trường, chuyên ngành và thời gian học.</div>`}</div>` : ""}<div>${d.showSkills ? `<span class="eyebrow">03 / ĐỊNH HƯỚNG</span><h2>Lĩnh vực quan tâm</h2><div class="skill-list" ${editAttrs("skills", "education")}>${data.skills.map((s) => `<span class="skill">${esc(s)}</span>`).join("") || '<span class="empty-field">Thêm lĩnh vực quan tâm.</span>'}</div>` : ""}${d.showCertificates ? `<h3 class="certificate-heading">Chứng chỉ & đào tạo</h3>${data.certificates.length ? `<ul class="certificate-list" ${editAttrs("certificates", "education")}>${data.certificates.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : `<p class="empty-field" ${editAttrs("certificates", "education")}>Bổ sung chứng chỉ nếu có.</p>`}` : ""}</div></div></section>` : ""}
${d.showGoal && p.goal ? `<section class="goal-section"><div class="quote-mark">“</div><h2 ${editAttrs("profile.goal")}>${esc(p.goal)}</h2><span class="eyebrow">MỤC TIÊU NGHỀ NGHIỆP</span></section>` : ""}
<section id="contact" class="contact-section"><div class="contact-inner"><div><span class="eyebrow">SẴN SÀNG CHO HÀNH TRÌNH MỚI</span><h2>Cùng tạo nên<br>giá trị cho giáo dục.</h2><p class="contact-name" ${editAttrs("profile.name")}>${esc(p.name)}</p></div><div class="contact-details">${contact("email", p.email)}${contact("phone", p.phone)}${contact("address", p.address)}</div></div></section>`;
  return markup;
}

export function renderLandingView(data, { staticMode = false } = {}) {
  const d = clone(data),
    hidden = d.design.hiddenSections;
  d.design.draft = isDraft(data);
  for (const [flag, key] of Object.entries({
    showInstitutions: "institutions",
    showEducation: "education",
    showSkills: "skills",
    showCertificates: "certificates",
    showGoal: "goal",
  }))
    d.design[flag] = !hidden.includes(key);
  if (staticMode) {
    d.design.showEducation &&= d.education.some(
      (e) => e.school || e.major || e.period || e.detail,
    );
    d.design.showSkills &&= d.skills.length > 0;
    d.design.showCertificates &&= d.certificates.length > 0;
    d.experiences = d.experiences.filter(
      (e) =>
        e.company ||
        e.role ||
        e.description ||
        e.bullets.length ||
        e.results.length,
    );
  }
  let html = renderLanding(d);
  if (hidden.includes("experiences"))
    html = html.replace(/<section id="experience"[\s\S]*?<\/section>/, "");
  if (hidden.includes("summary"))
    html = html.replace(/<p class="hero-summary"[\s\S]*?<\/p>/, "");
  if (!d.design.photoVisible)
    html = html.replace(
      /<div class="portrait-area">[\s\S]*?<\/section>/,
      "</section>",
    );
  let extra = "";
  const projects = d.projects.filter(
    (e) => e.name || e.role || e.scope || e.contributions.length,
  );
  if (!hidden.includes("projects") && projects.length)
    extra += `<section class="section"><div class="section-heading"><h2>Dự án & vai trò</h2></div>${projects.map((e, i) => `<article class="profile-item" data-edit="projects.${i}.name" data-group="projects"><h3>${esc(e.name)}</h3><p>${esc([e.period, e.role].filter(Boolean).join(" · "))}</p><p>${esc(e.scope)}</p><ul>${e.contributions.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`).join("")}</section>`;
  for (const key of ["expertise", "tools", "languages"])
    if (!hidden.includes(key) && d[key].length)
      extra += `<section class="section"><div class="section-heading"><h2>${SECTIONS[key]}</h2></div><div class="skill-list" data-edit="${key}" data-group="skills">${d[key].map((s) => `<span class="skill">${esc(s)}</span>`).join("")}</div></section>`;
  html = html.replace('<section id="contact"', extra + '<section id="contact"');
  if (staticMode) {
    html = html.replace(
      /<div class="contact-link"[^>]*><span>Bổ sung (?:email|số điện thoại|địa chỉ)<\/span><\/div>/g,
      "",
    );
    html = html.replace(
      /<(div|p|span)[^>]*class="[^"]*empty-field[^"]*"[^>]*>[\s\S]*?<\/\1>/g,
      "",
    );
  }
  return html;
}
