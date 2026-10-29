import test from "node:test";
import assert from "node:assert/strict";
import { defaults, clone, STORAGE_KEY, LEGACY_KEY } from "../public/model.js";
import { defaults as legacy } from "../public/legacy-model.js";
import {
  WORKSPACE_KEY,
  LIMITS,
  activeCV,
  createWorkspace,
  validateWorkspace,
  packWorkspace,
  unpackWorkspace,
  loadWorkspace,
  commitWorkspace,
  saveActive,
  addCV,
  selectCV,
  editCV,
  addSnapshot,
  restoreSnapshot,
  removeSnapshot,
  archiveCV,
  recoverCV,
  exportBackup,
  parseBackup,
  mergeBackup,
  diffCVs,
} from "../public/workspace.js";
const stamp = (i) => new Date(Date.UTC(2026, 9, 29, 8, i)).toISOString();
const memory = () => {
  const map = new Map();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
};
const make = () => createWorkspace(defaults, { name: "CV gốc", now: stamp(0) });

test("migration retains v2 data, creates independent collection, and preserves old bytes", () => {
  const s = memory(),
    old = clone(defaults);
  old.profile.name = old.profile.name.normalize("NFD");
  s.setItem(STORAGE_KEY, JSON.stringify(old));
  const result = loadWorkspace(s);
  assert.equal(result.migrated, true);
  assert.equal(result.error, null);
  assert.equal(
    activeCV(result.workspace).data.profile.name,
    "Nông Thị Hồng Cúc",
  );
  const bytes = s.getItem(STORAGE_KEY);
  commitWorkspace(s, result.workspace, result.token);
  assert.equal(s.getItem(STORAGE_KEY), bytes);
  assert.ok(s.getItem(WORKSPACE_KEY));
});
test("legacy v1 migration preserves original storage, all institutions, avatar and confirmation rules", () => {
  const s = memory();
  s.setItem(LEGACY_KEY, JSON.stringify(legacy));
  const r = loadWorkspace(s);
  assert.equal(r.error, null);
  assert.equal(r.migrated, true);
  assert.deepEqual(
    activeCV(r.workspace).data.institutions,
    legacy.institutions,
  );
  assert.equal(activeCV(r.workspace).data.experiences[0].confirmed, false);
  assert.ok(s.getItem(LEGACY_KEY));
});
test("corrupt workspace never falls back to stale legacy or overwrites the corrupt record", () => {
  const s = memory();
  s.setItem(WORKSPACE_KEY, "{bad");
  s.setItem(STORAGE_KEY, JSON.stringify(defaults));
  const r = loadWorkspace(s);
  assert.ok(r.error);
  assert.equal(r.token, "{bad");
  assert.equal(s.getItem(WORKSPACE_KEY), "{bad");
});
test("create, duplicate, switch and edit one CV leave every other CV and snapshot unchanged", () => {
  let ws = make();
  const original = clone(ws.cvs[0]);
  ws = addCV(ws, {
    sourceId: ws.activeId,
    name: "VLU · Đào tạo",
    school: "VLU",
    position: "Chuyên viên học vụ",
    now: stamp(1),
  });
  assert.equal(ws.cvs.length, 2);
  const b = activeCV(ws);
  assert.notEqual(b.id, original.id);
  assert.equal(b.data.profile.role, "Chuyên viên học vụ");
  assert.deepEqual(ws.cvs[0], original);
  const changed = clone(b.data);
  changed.profile.summary = "Tóm tắt riêng cho VLU";
  changed.design.template = "classic";
  ws = saveActive(ws, changed, { now: stamp(2) });
  assert.deepEqual(ws.cvs[0], original);
  assert.equal(
    activeCV(selectCV(ws, original.id)).data.profile.summary,
    original.data.profile.summary,
  );
  activeCV(ws).data.institutions.push("Kiểm tra bản sao");
  assert.deepEqual(ws.cvs[0], original);
});
test("metadata changes checkpoint only that CV and update its displayed position", () => {
  let ws = make(),
    a = ws.activeId;
  ws = addCV(ws, { name: "NTT", school: "NTT", now: stamp(1) });
  const before = clone(activeCV(ws));
  ws = editCV(ws, a, {
    name: "CV VLU",
    school: "VLU",
    position: "Chuyên viên Phòng Đào tạo",
    now: stamp(2),
  });
  assert.deepEqual(activeCV(ws), before);
  assert.equal(ws.cvs[0].school, "VLU");
  assert.equal(ws.cvs[0].snapshots.at(-1).kind, "metadata");
});
test("autosaves retain preceding state, throttle to one checkpoint per minute and do not add no-op snapshots", () => {
  let ws = make();
  const d = clone(activeCV(ws).data);
  d.profile.name = "Bản 1";
  ws = saveActive(ws, d, { now: stamp(1) });
  assert.equal(activeCV(ws).snapshots.length, 2);
  d.profile.name = "Bản 2";
  ws = saveActive(ws, d, {
    now: new Date(Date.parse(stamp(1)) + 3000).toISOString(),
  });
  assert.equal(activeCV(ws).snapshots.length, 2);
  d.profile.name = "Bản 3";
  ws = saveActive(ws, d, { now: stamp(3) });
  assert.equal(activeCV(ws).snapshots.length, 3);
  assert.equal(activeCV(ws).snapshots.at(-1).data.profile.name, "Bản 2");
  ws = saveActive(ws, d, { now: stamp(6) });
  assert.equal(activeCV(ws).snapshots.length, 3);
});
test("automatic retention keeps named checkpoints and only drops oldest automatic points", () => {
  let ws = make();
  ws = addSnapshot(ws, ws.activeId, "Bản đã xác nhận", { now: stamp(0) });
  const saved = clone(activeCV(ws).snapshots[1]);
  for (let i = 1; i <= 26; i++) {
    const d = clone(activeCV(ws).data);
    d.profile.name = "Lần " + i;
    ws = saveActive(ws, d, { now: stamp(i * 2) });
  }
  assert.equal(
    activeCV(ws).snapshots.filter((s) => s.kind === "auto").length,
    LIMITS.automatic,
  );
  assert.deepEqual(
    activeCV(ws).snapshots.find((s) => s.id === saved.id),
    saved,
  );
});
test("restoring a snapshot recovers full layout, content and school, checkpoints current state and isolates other CVs", () => {
  let ws = make(),
    a = ws.activeId;
  ws = editCV(ws, a, {
    name: "VLU",
    school: "VLU",
    position: "Chuyên viên đào tạo",
    now: stamp(1),
  });
  ws = addSnapshot(ws, a, "Bản nộp VLU", { now: stamp(2) });
  const snapshot = clone(activeCV(ws).snapshots.at(-1));
  ws = addCV(ws, {
    sourceId: a,
    name: "NTT",
    school: "NTT",
    position: "Học vụ",
    now: stamp(3),
  });
  const b = clone(activeCV(ws));
  ws = selectCV(ws, a);
  const d = clone(activeCV(ws).data);
  d.profile.summary = "Nội dung mới";
  d.design.margin = 22;
  ws = saveActive(ws, d, { now: stamp(4) });
  const before = clone(activeCV(ws).data);
  ws = restoreSnapshot(ws, a, snapshot.id, { now: stamp(5) });
  assert.deepEqual(activeCV(ws).data, snapshot.data);
  assert.equal(activeCV(ws).school, "VLU");
  assert.deepEqual(activeCV(ws).snapshots.at(-1).data, before);
  assert.deepEqual(
    ws.cvs.find((cv) => cv.id === b.id),
    b,
  );
  const current = clone(activeCV(ws).data);
  ws = removeSnapshot(ws, a, snapshot.id);
  assert.deepEqual(activeCV(ws).data, current);
});
test("archiving is reversible, retains data/history and refuses to archive the final live CV", () => {
  let ws = make(),
    a = ws.activeId;
  assert.throws(() => archiveCV(ws, a));
  ws = addCV(ws, { name: "CV thứ hai", now: stamp(1) });
  const before = clone(ws.cvs[0]);
  ws = archiveCV(ws, a, { now: stamp(2) });
  assert.ok(ws.cvs[0].archivedAt);
  assert.throws(() => selectCV(ws, a));
  ws = recoverCV(ws, a);
  assert.equal(ws.activeId, a);
  assert.deepEqual(ws.cvs[0].data, before.data);
  assert.deepEqual(ws.cvs[0].snapshots, before.snapshots);
});
test("packed workspace deduplicates shared photos across clones and snapshots and round-trips exactly", () => {
  let ws = make();
  activeCV(ws).data.profile.photo = "data:image/png;base64,YWJj";
  ws = addSnapshot(ws, ws.activeId, "Có ảnh");
  ws = addCV(ws, { sourceId: ws.activeId, name: "Bản sao" });
  const packed = packWorkspace(ws);
  assert.equal(Object.keys(packed.assets).length, 1);
  assert.equal(
    (JSON.stringify(packed).match(/data:image\/png;base64,YWJj/g) || []).length,
    1,
  );
  assert.deepEqual(unpackWorkspace(packed), validateWorkspace(ws));
});
test("single-CV and all-CV backup preserve histories; importing remaps IDs and cannot overwrite originals", () => {
  let ws = make();
  ws = addCV(ws, { sourceId: ws.activeId, name: "VLU", school: "VLU" });
  ws = addSnapshot(ws, ws.activeId, "Đã rà soát");
  const original = clone(ws);
  const one = exportBackup(ws, { scope: "cv" });
  assert.equal(parseBackup(one).cvs.length, 1);
  assert.equal(parseBackup(one).cvs[0].snapshots.length, 2);
  const backup = exportBackup(ws);
  assert.deepEqual(
    parseBackup(JSON.parse(JSON.stringify(backup))),
    validateWorkspace(ws),
  );
  const imported = mergeBackup(ws, backup);
  assert.equal(imported.cvs.length, 4);
  assert.deepEqual(imported.cvs.slice(0, 2), original.cvs);
  assert.notEqual(imported.activeId, ws.activeId);
  assert.equal(new Set(imported.cvs.map((c) => c.id)).size, 4);
  assert.equal(activeCV(imported).school, "VLU");
  assert.deepEqual(activeCV(imported).data, activeCV(ws).data);
  assert.equal(activeCV(imported).snapshots.length, 2);
});
test("v1 and v2 raw JSON imports create a new CV and preserve the existing collection", () => {
  const ws = make();
  for (const raw of [legacy, defaults]) {
    const imported = mergeBackup(ws, raw);
    assert.equal(imported.cvs.length, 2);
    assert.deepEqual(imported.cvs[0], ws.cvs[0]);
    assert.equal(activeCV(imported).data.profile.name, "Nông Thị Hồng Cúc");
  }
});
test("quota and stale-tab commits leave stored bytes intact and do not mutate caller workspace", () => {
  const s = memory(),
    ws = make(),
    first = commitWorkspace(s, ws, null),
    before = s.getItem(WORKSPACE_KEY);
  const changed = addCV(first.workspace, { name: "Thử lưu" });
  assert.throws(() => commitWorkspace(s, changed, null), /tab khác/);
  assert.equal(s.getItem(WORKSPACE_KEY), before);
  const broken = {
    getItem: s.getItem,
    setItem() {
      throw Error("QuotaExceeded");
    },
  };
  assert.throws(
    () => commitWorkspace(broken, changed, first.token),
    /Sao lưu tất cả/,
  );
  assert.equal(s.getItem(WORKSPACE_KEY), before);
  assert.equal(ws.revision, "");
});
test("validation rejects duplicate IDs, missing active CV, malicious asset refs and limits without changing input", () => {
  const ws = make();
  const invalid = clone(ws);
  invalid.cvs.push(clone(invalid.cvs[0]));
  assert.throws(() => validateWorkspace(invalid));
  assert.throws(() => validateWorkspace({ ...ws, activeId: "missing" }));
  const packed = packWorkspace(ws);
  packed.cvs[0].data.profile.photoAsset = "__proto__";
  assert.throws(() => unpackWorkspace(packed));
  const bad = packWorkspace(ws);
  bad.cvs[0].data.profile.photoAsset = "x";
  bad.assets.x = "javascript:alert(1)";
  assert.throws(() => unpackWorkspace(bad));
  assert.equal({}.polluted, undefined);
  const many = clone(ws);
  many.cvs = Array.from({ length: 31 }, (_, i) => ({
    ...clone(ws.cvs[0]),
    id: "cv-" + i,
  }));
  many.activeId = "cv-0";
  assert.throws(() => validateWorkspace(many));
});
test("saved history limit refuses destructive restore until space is freed, without changing the original", () => {
  let ws = make();
  for (let i = 1; i < LIMITS.saved; i++)
    ws = addSnapshot(ws, ws.activeId, "Mốc " + i);
  const original = clone(ws);
  assert.throws(() => addSnapshot(ws, ws.activeId, "Quá giới hạn"));
  assert.throws(() =>
    restoreSnapshot(ws, ws.activeId, activeCV(ws).snapshots[0].id),
  );
  assert.deepEqual(ws, original);
});
test("comparison covers school, content, confirmations, layout, section ordering and photo while ignoring record IDs", () => {
  const a = activeCV(make()),
    b = clone(a);
  b.school = "VLU";
  b.data.profile.summary = "Tóm tắt riêng";
  b.data.design.template = "classic";
  b.data.design.sectionOrder.reverse();
  b.data.experiences[0].confirmed = true;
  b.data.profile.photo = "data:image/png;base64,YWJj";
  b.data.experiences[0].id = "other-id";
  const diff = diffCVs(a, b),
    paths = diff.map((r) => r.path);
  for (const p of [
    "school",
    "profile.summary",
    "design.template",
    "design.sectionOrder",
    "experiences.0.confirmed",
    "profile.photo",
  ])
    assert.ok(paths.includes(p), p);
  assert.ok(!paths.some((p) => p.endsWith(".id")));
  assert.deepEqual(diffCVs(a, clone(a)), []);
});

test("backup of an unsaved draft retains the immediately preceding stored state even inside the auto interval", () => {
  let ws = make(),
    d = clone(activeCV(ws).data);
  d.profile.summary = "Nội dung đã lưu";
  ws = saveActive(ws, d, { now: stamp(1) });
  const original = clone(ws);
  d.profile.summary = "Bản đang sửa chưa lưu";
  const draft = saveActive(ws, d, {
    now: new Date(Date.parse(stamp(1)) + 2000).toISOString(),
    forceAuto: true,
  });
  const restored = parseBackup(exportBackup(draft));
  assert.equal(activeCV(restored).data.profile.summary, d.profile.summary);
  assert.equal(
    activeCV(restored).snapshots.at(-1).data.profile.summary,
    "Nội dung đã lưu",
  );
  assert.deepEqual(ws, original);
});
