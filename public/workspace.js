import {
  defaults,
  validateData,
  nfc,
  STORAGE_KEY,
  LEGACY_KEY,
  SECTIONS,
} from "./model.js";

const clone = (x) =>
  x === null || typeof x !== "object"
    ? x
    : Array.isArray(x)
      ? x.map(clone)
      : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, clone(v)]));
export const WORKSPACE_KEY = "cv-atelier:workspace:v1";
export const LIMITS = { cvs: 30, automatic: 20, saved: 40 };
export class ConflictError extends Error {
  constructor() {
    super(
      "Danh sách CV đã thay đổi ở tab khác. Hãy sao lưu bản đang sửa và nạp bản mới.",
    );
    this.name = "ConflictError";
  }
}
export const uid = () =>
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
const time = () => new Date().toISOString();
const text = (v, max = 120) => {
  if (typeof v !== "string" || v.length > max)
    throw Error("Tên hoặc thông tin hồ sơ quá dài.");
  return nfc(v).trim();
};
const id = (v) => {
  if (typeof v !== "string" || !/^[\w-]{1,100}$/.test(v))
    throw Error("Mã hồ sơ / phiên bản không hợp lệ.");
  return v;
};
const date = (v) => {
  if (
    typeof v !== "string" ||
    !/^\d{4}-\d\d-\d\dT/.test(v) ||
    !Number.isFinite(Date.parse(v))
  )
    throw Error("Thời gian lưu không hợp lệ.");
  return new Date(v).toISOString();
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const activeCV = (ws) => ws.cvs.find((cv) => cv.id === ws.activeId);
const cvById = (ws, key) => {
  const cv = ws.cvs.find((cv) => cv.id === key);
  if (!cv) throw Error("Không tìm thấy hồ sơ.");
  return cv;
};

export function validateWorkspace(raw) {
  if (
    !raw ||
    raw.schemaVersion !== 1 ||
    !Array.isArray(raw.cvs) ||
    !raw.cvs.length ||
    raw.cvs.length > LIMITS.cvs
  )
    throw Error("Danh sách CV không hợp lệ hoặc vượt 30 hồ sơ.");
  const cvs = raw.cvs.map((cv) => {
    if (
      !cv ||
      !Array.isArray(cv.snapshots) ||
      cv.snapshots.length > LIMITS.automatic + LIMITS.saved
    )
      throw Error("Lịch sử hồ sơ không hợp lệ.");
    const snapshots = cv.snapshots.map((s) => {
      if (!s || typeof s !== "object") throw Error("Mốc lưu không hợp lệ.");
      if (
        ![
          "initial",
          "auto",
          "manual",
          "restore",
          "import",
          "reset",
          "metadata",
        ].includes(s.kind)
      )
        throw Error("Loại phiên bản không hợp lệ.");
      return {
        id: id(s.id),
        name: text(s.name),
        kind: s.kind,
        createdAt: date(s.createdAt),
        school: text(s.school, 200),
        data: validateData(s.data),
      };
    });
    if (new Set(snapshots.map((s) => s.id)).size !== snapshots.length)
      throw Error("Mã phiên bản bị trùng.");
    if (
      snapshots.filter((s) => s.kind === "auto").length > LIMITS.automatic ||
      snapshots.filter((s) => s.kind !== "auto").length > LIMITS.saved
    )
      throw Error("Lịch sử vượt giới hạn lưu.");
    const name = text(cv.name);
    if (!name) throw Error("Hãy đặt tên hồ sơ.");
    return {
      id: id(cv.id),
      name,
      school: text(cv.school, 200),
      createdAt: date(cv.createdAt),
      updatedAt: date(cv.updatedAt),
      archivedAt: cv.archivedAt ? date(cv.archivedAt) : null,
      lastAutoAt: cv.lastAutoAt ? date(cv.lastAutoAt) : null,
      data: validateData(cv.data),
      snapshots,
    };
  });
  if (new Set(cvs.map((cv) => cv.id)).size !== cvs.length)
    throw Error("Mã hồ sơ bị trùng.");
  const activeId = id(raw.activeId);
  if (!cvs.some((cv) => cv.id === activeId && !cv.archivedAt))
    throw Error("Hồ sơ đang mở không hợp lệ.");
  return {
    schemaVersion: 1,
    revision: typeof raw.revision === "string" ? text(raw.revision, 100) : "",
    activeId,
    cvs,
  };
}
function snapshot(cv, name, kind, now = time()) {
  if (
    kind !== "auto" &&
    cv.snapshots.filter((s) => s.kind !== "auto").length >= LIMITS.saved
  )
    throw Error(
      "Đã có 40 mốc lưu được giữ. Hãy sao lưu và xóa mốc không cần trước khi tạo thêm.",
    );
  cv.snapshots.push({
    id: uid(),
    name: text(String(name ?? "Phiên bản").slice(0, 120)) || "Phiên bản",
    kind,
    createdAt: now,
    school: cv.school,
    data: clone(cv.data),
  });
  while (
    cv.snapshots.filter((s) => s.kind === "auto").length > LIMITS.automatic
  ) {
    const i = cv.snapshots.findIndex((s) => s.kind === "auto");
    cv.snapshots.splice(i, 1);
  }
}
function makeCV(
  data,
  { name = "Hồ sơ ứng tuyển", school = "", now = time() } = {},
) {
  const cv = {
    id: uid(),
    name: text(name) || "Hồ sơ ứng tuyển",
    school: text(school, 200),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    lastAutoAt: null,
    data: validateData(data),
    snapshots: [],
  };
  snapshot(cv, "Hồ sơ ban đầu", "initial", now);
  return cv;
}
export function createWorkspace(
  data = defaults,
  { now = time(), name = "Hồ sơ ứng tuyển" } = {},
) {
  const cv = makeCV(data, { name, now });
  return { schemaVersion: 1, revision: "", activeId: cv.id, cvs: [cv] };
}

// One atomic localStorage record, with images deduplicated across CVs and history.
export function packWorkspace(value) {
  const clean = validateWorkspace(value),
    assets = Object.create(null),
    refs = new Map();
  const packData = (data) => {
    const d = clone(data),
      photo = d.profile.photo;
    if (photo) {
      if (!refs.has(photo)) {
        const key = "photo-" + refs.size;
        refs.set(photo, key);
        assets[key] = photo;
      }
      d.profile.photo = "";
      d.profile.photoAsset = refs.get(photo);
    }
    return d;
  };
  return {
    ...clean,
    cvs: clean.cvs.map((cv) => ({
      ...cv,
      data: packData(cv.data),
      snapshots: cv.snapshots.map((s) => ({ ...s, data: packData(s.data) })),
    })),
    assets,
  };
}
export function unpackWorkspace(raw) {
  if (!raw || !Array.isArray(raw.cvs))
    throw Error("Không đọc được danh sách CV.");
  const unpack = (data) => {
    const d = clone(data);
    if (d.profile?.photoAsset) {
      const ref = d.profile.photoAsset;
      if (
        typeof ref !== "string" ||
        !raw.assets ||
        !Object.hasOwn(raw.assets, ref) ||
        typeof raw.assets[ref] !== "string"
      )
        throw Error("Thiếu ảnh trong bản sao lưu.");
      d.profile.photo = raw.assets[ref];
      delete d.profile.photoAsset;
    }
    return d;
  };
  return validateWorkspace({
    ...raw,
    cvs: raw.cvs.map((cv) => ({
      ...cv,
      data: unpack(cv.data),
      snapshots: Array.isArray(cv.snapshots)
        ? cv.snapshots.map((s) => ({ ...s, data: unpack(s.data) }))
        : null,
    })),
  });
}
export function loadWorkspace(storage) {
  let token = null;
  try {
    token = storage.getItem(WORKSPACE_KEY);
    if (token !== null)
      return {
        workspace: unpackWorkspace(JSON.parse(token)),
        token,
        migrated: false,
        error: null,
      };
    const old = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_KEY);
    const workspace = createWorkspace(
      old === null ? defaults : validateData(JSON.parse(old)),
      { name: old === null ? "CV đầu tiên" : "CV chuyển từ phiên bản trước" },
    );
    return { workspace, token: null, migrated: old !== null, error: null };
  } catch (error) {
    return {
      workspace: createWorkspace(),
      token,
      migrated: false,
      error: error.message || "Không đọc được dữ liệu.",
    };
  }
}
export function commitWorkspace(storage, value, expectedToken) {
  if (storage.getItem(WORKSPACE_KEY) !== expectedToken)
    throw new ConflictError();
  const workspace = validateWorkspace(value);
  workspace.revision = uid();
  const token = JSON.stringify(packWorkspace(workspace));
  try {
    storage.setItem(WORKSPACE_KEY, token);
  } catch (e) {
    throw Error(
      "Chưa lưu được danh sách CV: " +
        (e.message || "Bộ nhớ đã đầy hoặc bị chặn.") +
        " Hãy tải Sao lưu tất cả.",
    );
  }
  return { workspace, token };
}
export function saveActive(
  ws,
  data,
  { now = time(), reason = "auto", forceAuto = false } = {},
) {
  const next = clone(ws),
    cv = activeCV(next),
    clean = validateData(data);
  if (!same(cv.data, clean)) {
    if (reason !== "auto")
      snapshot(
        cv,
        "Trước " +
          ({
            import: "nhập dữ liệu",
            reset: "đặt lại mẫu",
            restore: "khôi phục",
          }[reason] || "thay đổi"),
        reason,
        now,
      );
    else if (
      forceAuto ||
      !cv.lastAutoAt ||
      Date.parse(now) - Date.parse(cv.lastAutoAt) >= 60000
    ) {
      snapshot(
        cv,
        "Trước lần sửa · " + new Date(now).toLocaleString("vi-VN"),
        "auto",
        now,
      );
      cv.lastAutoAt = now;
    }
    cv.data = clean;
    cv.updatedAt = now;
  }
  return next;
}
export function addCV(
  ws,
  { sourceId = null, name, school = "", position, now = time() } = {},
) {
  if (ws.cvs.length >= LIMITS.cvs)
    throw Error(
      "Tối đa 30 hồ sơ, gồm cả hồ sơ lưu trữ. Hãy sao lưu trước khi chuyển sang bộ hồ sơ khác.",
    );
  const next = clone(ws),
    source = sourceId ? cvById(ws, sourceId).data : defaults,
    data = clone(source);
  if (position !== undefined) data.profile.role = text(position, 6000);
  const cv = makeCV(data, { name, school, now });
  next.cvs.push(cv);
  next.activeId = cv.id;
  return next;
}
export function selectCV(ws, key) {
  const next = clone(ws),
    cv = cvById(next, key);
  if (cv.archivedAt) throw Error("Hãy khôi phục hồ sơ lưu trữ trước khi mở.");
  next.activeId = key;
  return next;
}
export function editCV(ws, key, { name, school, position, now = time() }) {
  const next = clone(ws),
    cv = cvById(next, key),
    newName = text(name),
    newSchool = text(school, 200),
    newRole = text(position, 6000);
  if (!newName) throw Error("Hãy đặt tên hồ sơ.");
  if (cv.school !== newSchool || cv.data.profile.role !== newRole)
    snapshot(cv, "Trước đổi đích ứng tuyển", "metadata", now);
  cv.name = newName;
  cv.school = newSchool;
  cv.data.profile.role = newRole;
  cv.updatedAt = now;
  return next;
}
export function addSnapshot(ws, key, name, { now = time() } = {}) {
  const next = clone(ws),
    cv = cvById(next, key);
  snapshot(cv, name, "manual", now);
  return next;
}
export function restoreSnapshot(ws, key, snapshotId, { now = time() } = {}) {
  const next = clone(ws),
    cv = cvById(next, key),
    s = cv.snapshots.find((s) => s.id === snapshotId);
  if (!s) throw Error("Không tìm thấy phiên bản.");
  if (cv.archivedAt) throw Error("Hãy khôi phục hồ sơ lưu trữ trước.");
  snapshot(cv, "Trước khôi phục · " + s.name, "restore", now);
  cv.data = clone(s.data);
  cv.school = s.school;
  cv.updatedAt = now;
  return next;
}
export function removeSnapshot(ws, key, snapshotId) {
  const next = clone(ws),
    cv = cvById(next, key);
  if (!cv.snapshots.some((s) => s.id === snapshotId))
    throw Error("Không tìm thấy phiên bản.");
  cv.snapshots = cv.snapshots.filter((s) => s.id !== snapshotId);
  return next;
}
export function archiveCV(ws, key, { now = time() } = {}) {
  const next = clone(ws),
    cv = cvById(next, key),
    remaining = next.cvs.filter((v) => v.id !== key && !v.archivedAt);
  if (!remaining.length)
    throw Error(
      "Cần giữ ít nhất một CV đang dùng. Hãy tạo hoặc khôi phục CV khác trước.",
    );
  cv.archivedAt = now;
  if (next.activeId === key) next.activeId = remaining[0].id;
  return next;
}
export function recoverCV(ws, key) {
  const next = clone(ws),
    cv = cvById(next, key);
  cv.archivedAt = null;
  next.activeId = key;
  return next;
}
export function exportBackup(ws, { scope = "all", now = time() } = {}) {
  const clean = validateWorkspace(ws);
  if (scope === "cv") clean.cvs = [activeCV(clean)];
  return {
    format: "cv-atelier-backup",
    formatVersion: 1,
    scope,
    exportedAt: now,
    workspace: packWorkspace(clean),
  };
}
export function parseBackup(raw) {
  if (raw?.format === "cv-atelier-backup") {
    if (raw.formatVersion !== 1)
      throw Error("Định dạng sao lưu chưa được hỗ trợ.");
    return unpackWorkspace(raw.workspace);
  }
  return createWorkspace(validateData(raw), { name: "CV nhập từ JSON" });
}
export function mergeBackup(ws, raw) {
  const imported = parseBackup(raw);
  if (ws.cvs.length + imported.cvs.length > LIMITS.cvs)
    throw Error(
      "Nhập bản sao lưu sẽ vượt giới hạn 30 hồ sơ. Chưa có dữ liệu nào bị thay đổi.",
    );
  const next = clone(ws),
    map = new Map();
  for (const cv of imported.cvs) {
    const oldId = cv.id;
    cv.id = uid();
    map.set(oldId, cv.id);
    cv.name = (cv.name.slice(0, 105) + " (nhập)").slice(0, 120);
    cv.snapshots = cv.snapshots.map((s) => ({ ...s, id: uid() }));
    next.cvs.push(cv);
  }
  next.activeId = map.get(imported.activeId);
  return validateWorkspace(next);
}

const PROFILE_LABELS = {
  name: "Họ và tên",
  role: "Vị trí ứng tuyển",
  summary: "Tóm tắt chuyên môn",
  goal: "Mục tiêu nghề nghiệp",
  phone: "Điện thoại",
  email: "Email",
  address: "Địa chỉ",
  eyebrow: "Nhãn hồ sơ",
  tagline: "Thông điệp",
  photo: "Ảnh đại diện",
  photoX: "Căn ảnh ngang",
  photoY: "Căn ảnh dọc",
  photoWidth: "Chiều rộng ảnh",
  photoHeight: "Chiều cao ảnh",
};
const DESIGN_LABELS = {
  template: "Mẫu CV",
  monochrome: "Đen trắng",
  theme: "Màu",
  font: "Font tiêu đề",
  margin: "Lề",
  fontSize: "Cỡ chữ",
  lineHeight: "Giãn dòng",
  sectionGap: "Khoảng cách mục",
  photoZoom: "Zoom ảnh",
  photoVisible: "Hiện ảnh",
  draft: "Ghi chú bản nháp",
  sectionOrder: "Thứ tự mục",
  hiddenSections: "Mục ẩn",
};
const RECORD_LABELS = {
  company: "Công ty",
  role: "Vai trò / chức danh",
  period: "Thời gian",
  description: "Phạm vi",
  bullets: "Nhiệm vụ",
  results: "Kết quả",
  confirmed: "Xác nhận",
  name: "Tên dự án",
  scope: "Phạm vi dự án",
  contributions: "Đóng góp",
  school: "Trường học",
  major: "Chuyên ngành",
  detail: "Thông tin bổ sung",
};
export function diffCVs(a, b) {
  const flat = (entry) => {
    const d = validateData(entry.data),
      rows = new Map();
    rows.set("school", {
      label: "Đơn vị / trường ứng tuyển",
      value: entry.school || "",
    });
    for (const [k, label] of Object.entries(PROFILE_LABELS))
      rows.set("profile." + k, { label, value: d.profile[k] ?? "" });
    for (const [k, label] of Object.entries(DESIGN_LABELS))
      rows.set("design." + k, { label, value: d.design[k] });
    rows.set("target", { label: "Định hướng gợi ý", value: d.target });
    for (const k of ["experiences", "projects", "education"])
      d[k].forEach((e, i) => {
        for (const [field, value] of Object.entries(e))
          if (field !== "id")
            rows.set(k + "." + i + "." + field, {
              label:
                SECTIONS[k] +
                " " +
                (i + 1) +
                " · " +
                (RECORD_LABELS[field] || field),
              value,
            });
      });
    for (const k of [
      "institutions",
      "expertise",
      "tools",
      "languages",
      "skills",
      "certificates",
    ])
      rows.set(k, { label: SECTIONS[k], value: d[k] });
    return rows;
  };
  const x = flat(a),
    y = flat(b),
    keys = new Set([...x.keys(), ...y.keys()]);
  const display = (v) =>
    typeof v === "boolean"
      ? v
        ? "Có"
        : "Không"
      : Array.isArray(v)
        ? v.join("\n")
        : String(v ?? "");
  return [...keys]
    .filter((k) => !same(x.get(k)?.value ?? "", y.get(k)?.value ?? ""))
    .map((k) => ({
      path: k,
      label: x.get(k)?.label || y.get(k)?.label,
      before: display(x.get(k)?.value),
      after: display(y.get(k)?.value),
      photo: k === "profile.photo",
    }));
}
