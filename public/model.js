import {
  defaults as legacyDefaults,
  validateData as validateLegacy,
} from "./legacy-model.js";
export const VERSION = "1.4.0";
export const STORAGE_KEY = "cv-atelier:v2";
export const LEGACY_KEY = "cv-atelier:v1";
export const SECTIONS = {
  summary: "Tóm tắt chuyên môn",
  experiences: "Kinh nghiệm làm việc",
  projects: "Dự án & vai trò",
  institutions: "Đơn vị dự án",
  education: "Học vấn",
  expertise: "Kỹ năng chuyên môn",
  tools: "Công cụ",
  languages: "Ngoại ngữ",
  skills: "Lĩnh vực quan tâm",
  certificates: "Chứng chỉ",
  goal: "Mục tiêu nghề nghiệp",
};
export const clone = (x) => JSON.parse(JSON.stringify(x));
export const nfc = (s) => String(s ?? "").normalize("NFC");
export const escapeHtml = (s) =>
  nfc(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export { safeContact } from "./legacy-model.js";
const designBase = {
  template: "academic",
  monochrome: false,
  margin: 14,
  fontSize: 10,
  lineHeight: 1.45,
  sectionGap: 10,
  photoVisible: true,
  photoZoom: 1,
  sectionOrder: Object.keys(SECTIONS),
  hiddenSections: [],
};
export function migrateLegacy(raw) {
  const v = validateLegacy(raw);
  return {
    ...v,
    schemaVersion: 2,
    profile: { ...v.profile, photoX: 50, photoWidth: 0, photoHeight: 0 },
    experiences: v.experiences.map((e, i) => ({
      ...e,
      id: `experience-${i + 1}`,
      results: [],
      confirmed: false,
    })),
    education: v.education.map((e, i) => ({ ...e, id: `education-${i + 1}` })),
    projects: [],
    expertise: [],
    tools: [],
    languages: [],
    target: "training",
    design: {
      ...v.design,
      ...clone(designBase),
      hiddenSections: [
        ...(!v.design.showEducation ? ["education"] : []),
        ...(!v.design.showInstitutions ? ["institutions"] : []),
        ...(!v.design.showSkills ? ["skills"] : []),
        ...(!v.design.showCertificates ? ["certificates"] : []),
        ...(!v.design.showGoal ? ["goal"] : []),
      ],
    },
  };
}
export const defaults = migrateLegacy(legacyDefaults);
// Keep migration behavior stable; only newly created profiles use the new style.
defaults.design.template = "modern1";
defaults.design.font = "modern";
const str = (v, max = 6000) => {
  if (typeof v !== "string" || v.length > max)
    throw Error("Văn bản không hợp lệ hoặc vượt giới hạn " + max + " ký tự.");
  return nfc(v)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
};
const list = (v, max = 3000) => {
  if (!Array.isArray(v) || v.length > max)
    throw Error("Danh sách vượt giới hạn " + max + " mục.");
  return v.map((x) => str(x));
};
const num = (v, min, max) => {
  if (!Number.isFinite(v) || v < min || v > max)
    throw Error("Giá trị thiết kế nằm ngoài phạm vi.");
  return v;
};
const bool = (v) => {
  if (typeof v !== "boolean") throw Error("Tùy chọn không hợp lệ.");
  return v;
};
function records(raw, key, max, fields, extra = () => ({})) {
  if (!Array.isArray(raw[key]) || raw[key].length > max)
    throw Error("Danh sách " + key + " không hợp lệ.");
  return raw[key].map((e, i) => {
    const o = { id: str(e.id || `${key}-${i + 1}`, 100) };
    for (const k of fields) o[k] = str(e[k]);
    return { ...o, ...extra(e) };
  });
}
export function validateData(raw) {
  if (raw?.schemaVersion === 1) return validateData(migrateLegacy(raw));
  if (raw?.schemaVersion !== 2)
    throw Error("Chỉ nhận bản sao lưu CV Atelier schema 1 hoặc 2.");
  const p = raw.profile,
    d = raw.design;
  if (!p || !d) throw Error("Tệp thiếu thông tin hồ sơ.");
  const profile = {};
  for (const k of [
    "name",
    "role",
    "eyebrow",
    "tagline",
    "summary",
    "goal",
    "phone",
    "email",
    "address",
  ])
    profile[k] = str(p[k]);
  profile.photo = str(p.photo, 2000000);
  if (
    profile.photo &&
    !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(profile.photo)
  )
    throw Error("Ảnh phải là JPEG, PNG hoặc WebP.");
  profile.photoY = num(p.photoY, 0, 100);
  profile.photoX = num(p.photoX, 0, 100);
  profile.photoWidth = num(p.photoWidth ?? 0, 0, 20000);
  profile.photoHeight = num(p.photoHeight ?? 0, 0, 20000);
  if (
    !["navy", "forest", "burgundy"].includes(d.theme) ||
    !["editorial", "modern"].includes(d.font)
  )
    throw Error("Màu hoặc font không hợp lệ.");
  if (
    d.template !== undefined &&
    !["modern1", "academic", "modern", "classic"].includes(d.template)
  )
    throw Error("Mẫu CV không hợp lệ.");
  const design = {
    template: d.template ?? "academic",
    monochrome: d.monochrome === undefined ? false : bool(d.monochrome),
    theme: d.theme,
    font: d.font,
    margin: num(d.margin, 10, 24),
    fontSize: num(d.fontSize, 9, 13),
    lineHeight: num(d.lineHeight, 1.2, 1.8),
    sectionGap: num(d.sectionGap, 6, 22),
    photoZoom: num(d.photoZoom, 1, 2.5),
    photoVisible: bool(d.photoVisible),
    draft: bool(d.draft),
  };
  for (const k of [
    "showInstitutions",
    "showEducation",
    "showSkills",
    "showCertificates",
    "showGoal",
  ])
    design[k] = bool(d[k]);
  design.sectionOrder = list(d.sectionOrder, Object.keys(SECTIONS).length);
  if (
    new Set(design.sectionOrder).size !== Object.keys(SECTIONS).length ||
    Object.keys(SECTIONS).some((k) => !design.sectionOrder.includes(k))
  )
    throw Error("Thứ tự mục không hợp lệ.");
  design.hiddenSections = list(d.hiddenSections, 12);
  if (design.hiddenSections.some((k) => !Object.hasOwn(SECTIONS, k)))
    throw Error("Mục ẩn không hợp lệ.");
  const result = {
    schemaVersion: 2,
    profile,
    design,
    target: raw.target,
    experiences: records(
      raw,
      "experiences",
      20,
      ["company", "role", "period", "description"],
      (e) => ({
        bullets: list(e.bullets),
        results: list(e.results),
        confirmed: bool(e.confirmed),
      }),
    ),
    education: records(raw, "education", 15, [
      "school",
      "major",
      "period",
      "detail",
    ]),
    projects: records(
      raw,
      "projects",
      20,
      ["name", "role", "period", "scope"],
      (e) => ({
        contributions: list(e.contributions),
        confirmed: bool(e.confirmed),
      }),
    ),
  };
  for (const k of [
    "institutions",
    "skills",
    "certificates",
    "expertise",
    "tools",
    "languages",
  ])
    result[k] = list(raw[k]);
  if (!["training", "academic", "systems"].includes(result.target))
    throw Error("Vị trí định hướng không hợp lệ.");
  return result;
}
export function setPath(obj, path, value) {
  const parts = path.split(".");
  if (parts.some((p) => ["__proto__", "constructor", "prototype"].includes(p)))
    throw Error("Trường không hợp lệ.");
  let t = obj;
  for (const k of parts.slice(0, -1)) {
    if (!Object.hasOwn(t, k)) throw Error("Trường không tồn tại.");
    t = t[k];
  }
  const k = parts.at(-1);
  if (!Object.hasOwn(t, k)) throw Error("Trường không tồn tại.");
  t[k] = typeof value === "string" ? nfc(value) : value;
  if (
    ["experiences", "projects"].includes(parts[0]) &&
    parts.length === 3 &&
    parts[2] !== "confirmed"
  )
    obj[parts[0]][Number(parts[1])].confirmed = false;
}
export function moveSection(data, key, delta) {
  const a = data.design.sectionOrder,
    i = a.indexOf(key),
    j = i + delta;
  if (i < 0 || j < 0 || j >= a.length) return false;
  [a[i], a[j]] = [a[j], a[i]];
  return true;
}
export const isDraft = (d) =>
  d.design.draft ||
  d.experiences.some(
    (e) =>
      !e.confirmed &&
      (e.company ||
        e.role ||
        e.description ||
        e.bullets.length ||
        e.results.length),
  ) ||
  d.projects.some(
    (e) =>
      !e.confirmed && (e.name || e.role || e.scope || e.contributions.length),
  );
export function review(data) {
  const issues = [];
  const add = (text, path, tab) => issues.push({ text, path, tab });
  if (!data.profile.name.trim())
    add("Bổ sung họ tên.", "profile.name", "profile");
  if (!data.profile.role.trim())
    add("Chọn vị trí ứng tuyển.", "profile.role", "profile");
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.profile.email))
    add("Bổ sung email hợp lệ.", "profile.email", "profile");
  if (!data.profile.phone.trim())
    add("Bổ sung số điện thoại.", "profile.phone", "profile");
  if (!data.education.some((e) => e.school && e.major))
    add("Bổ sung trường và chuyên ngành.", "education.0.school", "education");
  data.experiences.forEach((e, i) => {
    if (!e.confirmed)
      add(
        `Xác nhận nội dung kinh nghiệm ${e.company || i + 1}.`,
        `experiences.${i}.company`,
        "experience",
      );
    if (!e.role.trim())
      add(
        "Bổ sung chức danh / mảng công việc.",
        `experiences.${i}.role`,
        "experience",
      );
  });
  data.projects.forEach((e, i) => {
    if (!e.confirmed)
      add(
        `Xác nhận dự án ${e.name || i + 1}.`,
        `projects.${i}.name`,
        "projects",
      );
  });
  if (data.profile.summary.length > 700)
    add("Tóm tắt khá dài; cân nhắc rút gọn.", "profile.summary", "profile");
  return issues;
}
export const TARGETS = {
  training: {
    label: "Chuyên viên Phòng Đào tạo",
    keywords: [
      "Quản lý dữ liệu đào tạo",
      "Phối hợp nghiệp vụ",
      "Hỗ trợ người học",
    ],
    summary:
      "Có kinh nghiệm tham gia các dự án phần mềm cho cơ sở giáo dục tại ASC từ tháng 12/2022. Mong muốn vận dụng kinh nghiệm công nghệ và phối hợp nghiệp vụ để hỗ trợ công tác đào tạo tại trường đại học.",
  },
  academic: {
    label: "Chuyên viên học vụ khoa / viện",
    keywords: [
      "Hỗ trợ học vụ",
      "Tiếp nhận yêu cầu",
      "Phối hợp phòng chức năng",
    ],
    summary:
      "Có kinh nghiệm làm việc với các dự án phần mềm trong môi trường giáo dục tại ASC từ tháng 12/2022. Định hướng phát triển trong công tác học vụ, hỗ trợ người học và phối hợp giữa khoa, viện với các phòng chức năng.",
  },
  systems: {
    label: "Chuyên viên quản trị hệ thống đào tạo",
    keywords: ["Vận hành phần mềm", "Dữ liệu hệ thống", "Hướng dẫn sử dụng"],
    summary:
      "Có kinh nghiệm tham gia các dự án phần mềm cho cơ sở giáo dục tại ASC từ tháng 12/2022 và 8 tháng làm việc với phần mềm HRM. Mong muốn phát triển chuyên môn trong quản trị, hỗ trợ vận hành hệ thống phục vụ đào tạo.",
  },
};
