import test from "node:test";
import assert from "node:assert/strict";
import { defaults as v1 } from "../public/legacy-model.js";
import {
  defaults,
  clone,
  validateData,
  moveSection,
  review,
  isDraft,
  STORAGE_KEY,
  LEGACY_KEY,
} from "../public/model.js";
import { loadData, saveData } from "../public/storage.js";
const storage = () => {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
};
test("legacy migration preserves Vietnamese, employers, photos and original key", () => {
  const s = storage(),
    old = clone(v1);
  old.profile.name = old.profile.name.normalize("NFD");
  old.profile.photo = "data:image/png;base64,YWJj";
  const raw = JSON.stringify(old);
  s.setItem(LEGACY_KEY, raw);
  const result = loadData(s);
  assert.equal(result.data.profile.name, "Nông Thị Hồng Cúc");
  assert.equal(result.data.schemaVersion, 2);
  assert.equal(result.data.experiences[0].company, "ASC");
  assert.equal(result.data.institutions.length, 8);
  assert.equal(result.data.experiences[0].confirmed, false);
  saveData(s, result.data);
  assert.equal(s.getItem(LEGACY_KEY), raw);
  assert.equal(JSON.parse(s.getItem(STORAGE_KEY)).schemaVersion, 2);
});
test("corrupt current data is detected and not silently replaced by a legacy backup", () => {
  const s = storage();
  s.setItem(STORAGE_KEY, "{broken");
  s.setItem(LEGACY_KEY, JSON.stringify(v1));
  const result = loadData(s);
  assert.ok(result.error);
  assert.equal(s.getItem(STORAGE_KEY), "{broken");
});
test("quota and blocked storage errors propagate, never claiming success", () => {
  assert.throws(() =>
    saveData(
      {
        setItem() {
          throw Error("QuotaExceededError");
        },
      },
      defaults,
    ),
  );
  const result = loadData({
    getItem() {
      throw Error("SecurityError");
    },
  });
  assert.equal(result.error, "SecurityError");
});
test("schema 2 backup round trip includes confirmed results, projects, skills, crop and layout", () => {
  const d = clone(defaults);
  d.experiences[0].results = ["Kết quả do ứng viên cung cấp"];
  d.experiences[0].confirmed = true;
  d.projects = [
    {
      id: "p1",
      name: "VLU",
      role: "Vai trò thực tế",
      period: "2024",
      scope: "Phạm vi đã xác nhận",
      contributions: ["Đóng góp thực tế"],
      confirmed: true,
    },
  ];
  d.profile.photoX = 33;
  d.design.photoZoom = 1.3;
  d.design.hiddenSections = ["goal"];
  d.expertise = ["Nghiệp vụ thực tế"];
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(d))), d);
});
test("Unicode decomposed text normalizes on all professional fields", () => {
  const d = clone(defaults);
  d.experiences[0].results = ["Đào tạo".normalize("NFD")];
  assert.equal(validateData(d).experiences[0].results[0], "Đào tạo");
});
test("invalid ordering, duplicate sections and out-of-range typography rejected", () => {
  const d = clone(defaults);
  d.design.sectionOrder.fill("summary");
  assert.throws(() => validateData(d));
  const e = clone(defaults);
  e.design.fontSize = 0;
  assert.throws(() => validateData(e));
});
test("reordering and hiding retain section content", () => {
  const d = clone(defaults),
    summary = d.profile.summary;
  assert.equal(moveSection(d, "summary", 1), true);
  d.design.hiddenSections.push("summary");
  assert.equal(d.profile.summary, summary);
  assert.equal(moveSection(d, d.design.sectionOrder[0], -1), false);
});
test("unconfirmed experience keeps draft indicator even when manual draft disabled", () => {
  const d = clone(defaults);
  d.design.draft = false;
  assert.equal(isDraft(d), true);
  d.experiences.forEach((e) => (e.confirmed = true));
  assert.equal(isDraft(d), false);
  assert.ok(review(d).some((e) => e.path === "profile.email"));
});
test("editing confirmed work invalidates its confirmation", async () => {
  const { setPath } = await import("../public/model.js");
  const d = clone(defaults);
  d.experiences[0].confirmed = true;
  setPath(d, "experiences.0.results", ["Nội dung mới"]);
  assert.equal(d.experiences[0].confirmed, false);
  setPath(d, "experiences.0.confirmed", true);
  assert.equal(d.experiences[0].confirmed, true);
});
test("landing keeps results and project roles, omits empty placeholders in static export", async () => {
  const { renderLandingView } = await import("../public/landing.js");
  const d = clone(defaults);
  d.experiences[0].results = ["Đóng góp đã xác nhận"];
  d.projects = [
    {
      id: "p1",
      name: "Dự án mẫu",
      role: "Vai trò thực tế",
      period: "",
      scope: "Nghiệp vụ xác nhận",
      contributions: [],
      confirmed: true,
    },
  ];
  const html = renderLandingView(d, { staticMode: true });
  assert.ok(html.includes("Đóng góp đã xác nhận"));
  assert.ok(html.includes("Vai trò thực tế"));
  assert.ok(!html.includes("Bổ sung email"));
  assert.ok(!html.includes("Bổ sung trường"));
  assert.equal(d.design.showEducation, true);
});
