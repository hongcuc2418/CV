import { grayscalePixels } from "../public/photo-grayscale.js";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { defaults, clone, validateData } from "../public/model.js";
import {
  TEMPLATES,
  templateFor,
  selectTemplate,
  laneFor,
} from "../public/templates.js";
import {
  createLayout,
  fontMetrics,
  createPDF,
  renderSVG,
  PAGE,
} from "../public/document.js";
import { FONT_FILES, buildHTML } from "../public/export.js";
vm.runInThisContext(
  await readFile(
    new URL("../public/vendor/pdf-lib.min.js", import.meta.url),
    "utf8",
  ),
);
vm.runInThisContext(
  await readFile(
    new URL("../public/vendor/fontkit.umd.min.js", import.meta.url),
    "utf8",
  ),
);
const fontBytes = {};
for (const [k, f] of Object.entries(FONT_FILES))
  fontBytes[k] = new Uint8Array(
    await readFile(new URL("../public/fonts/" + f, import.meta.url)),
  );
const metrics = fontMetrics(globalThis.fontkit, fontBytes),
  opts = { PDFLib: globalThis.PDFLib, fontkit: globalThis.fontkit, fontBytes };
const allText = (l) =>
  l.pages
    .flatMap((p) => p.items.filter((t) => t.type === "text").map((t) => t.text))
    .join(" ");
function bounds(l) {
  for (const p of l.pages)
    for (const t of p.items) {
      assert.ok(Number.isFinite(t.x) && Number.isFinite(t.y));
      if (t.type === "text") {
        assert.ok(t.x >= 0 && t.y > 0 && t.y < PAGE.height, t.text);
        assert.ok(
          t.x + metrics.width(t.text, t.size, t.font) <= PAGE.width + 0.1,
          t.text,
        );
      }
      if (["rect", "image"].includes(t.type)) {
        assert.ok(t.width >= 0 && t.height >= 0);
        assert.ok(
          t.x >= 0 &&
            t.y >= 0 &&
            t.x + t.width <= PAGE.width + 0.1 &&
            t.y + t.height <= PAGE.height + 0.1,
          JSON.stringify(t),
        );
      }
    }
}
test("old schema 2 backups gain default template without changing content or custom typography", () => {
  const old = clone(defaults);
  delete old.design.template;
  delete old.design.monochrome;
  old.design.margin = 19;
  old.profile.name = "Nông Thị Hồng Cúc".normalize("NFD");
  const upgraded = validateData(old);
  assert.equal(upgraded.design.template, "academic");
  assert.equal(upgraded.design.monochrome, false);
  assert.equal(upgraded.design.margin, 19);
  assert.equal(upgraded.profile.name, "Nông Thị Hồng Cúc");
  assert.deepEqual(upgraded.experiences, old.experiences);
});
test("switching every template and back preserves all personal and professional content", () => {
  const d = clone(defaults),
    before = clone(d);
  for (const id of Object.keys(TEMPLATES)) {
    selectTemplate(d, id);
    assert.equal(templateFor(d).id, id);
    assert.deepEqual(d.profile, before.profile);
    assert.deepEqual(d.experiences, before.experiences);
    assert.deepEqual(d.institutions, before.institutions);
    assert.equal(d.design.margin, before.design.margin);
  }
  selectTemplate(d, "academic");
  assert.deepEqual(d, before);
  assert.throws(() => selectTemplate(d, "unknown"));
});
test("invalid template and monochrome values are rejected", () => {
  const d = clone(defaults);
  d.design.template = "__proto__";
  assert.throws(() => validateData(d));
  d.design.template = "academic";
  d.design.monochrome = "yes";
  assert.throws(() => validateData(d));
});
test("three templates produce distinct geometry with same data, default remains one page", () => {
  const signatures = [];
  for (const id of Object.keys(TEMPLATES)) {
    const d = clone(defaults);
    selectTemplate(d, id);
    const l = createLayout(d, metrics);
    bounds(l);
    assert.equal(l.pages.length, 1, id);
    assert.ok(allText(l).includes("Nông Thị Hồng Cúc"));
    assert.ok(allText(l).includes("ASC"));
    assert.ok(allText(l).includes("HNIVC"));
    signatures.push(
      JSON.stringify(l.pages[0].items.map((t) => [t.type, t.x, t.y])),
    );
  }
  assert.equal(new Set(signatures).size, 3);
});
test("monochrome applies to every drawn colour and PDF-bound shape", () => {
  for (const id of Object.keys(TEMPLATES)) {
    const d = clone(defaults);
    d.design.template = id;
    d.design.monochrome = true;
    const l = createLayout(d, metrics);
    for (const p of l.pages)
      for (const t of p.items)
        for (const k of ["fill", "color", "border"])
          if (t[k]) {
            const h = t[k].replace("#", "");
            assert.equal(h.slice(0, 2), h.slice(2, 4));
            assert.equal(h.slice(2, 4), h.slice(4, 6));
          }
  }
});
test("Classic ATS omits photos, keeps sequential section reading order and body text", () => {
  const d = clone(defaults);
  d.design.template = "classic";
  const l = createLayout(d, metrics),
    t = allText(l);
  assert.ok(
    l.pages.every(
      (p) => !p.items.some((x) => x.type === "image" || x.type === "rect"),
    ),
  );
  assert.ok(
    t.indexOf("TÓM TẮT CHUYÊN MÔN") < t.indexOf("KINH NGHIỆM LÀM VIỆC"),
  );
  assert.ok(t.indexOf("ASC") < t.indexOf("Phần mềm HRM"));
  assert.equal(laneFor(d, "institutions"), "main");
  assert.equal(laneFor(defaults, "institutions"), "side");
});
test("gallery clip paths have distinct IDs and no editing controls", () => {
  const d = clone(defaults);
  d.profile.photo = "data:image/png;base64,YWJj";
  const l = createLayout(d, metrics);
  const a = renderSVG(l, 0, { editable: false, idPrefix: "thumb-a" }),
    b = renderSVG(l, 0, { editable: false, idPrefix: "thumb-b" });
  assert.ok(a.includes("photo-thumb-a-"));
  assert.ok(b.includes("photo-thumb-b-"));
  assert.ok(!a.includes("data-edit="));
});
test("all templates retain long content within page bounds at typography extremes", () => {
  for (const id of Object.keys(TEMPLATES)) {
    const d = clone(defaults);
    d.design.template = id;
    d.design.fontSize = 13;
    d.design.lineHeight = 1.8;
    d.design.margin = 24;
    d.experiences[0].bullets = Array.from(
      { length: 30 },
      (_, i) =>
        `Nhiệm vụ ${i + 1}: ` +
        "Hỗ trợ dữ liệu và nghiệp vụ đào tạo tại cơ sở giáo dục. ".repeat(3),
    );
    const l = createLayout(d, metrics);
    assert.ok(l.pages.length > 1);
    bounds(l);
    const t = allText(l);
    for (let i = 1; i <= 30; i++)
      assert.ok(t.includes(`Nhiệm vụ ${i}:`), id + " " + i);
  }
});
test("real PDF output for every template: default and long, A4 and matching page count", async () => {
  const output =
    process.env.CV_QA_DIR || path.join(tmpdir(), "cv-atelier-v130-qa");
  await mkdir(output, { recursive: true });
  for (const id of Object.keys(TEMPLATES)) {
    for (const long of [false, true]) {
      const d = clone(defaults);
      d.design.template = id;
      if (long)
        d.experiences[0].bullets = Array.from(
          { length: 24 },
          (_, i) =>
            `Nhiệm vụ ${i + 1}: ` +
            "Phối hợp dữ liệu đào tạo và hướng dẫn người dùng. ".repeat(3),
        );
      const result = await createPDF(d, opts);
      await writeFile(
        path.join(output, `${id}-${long ? "long" : "default"}.pdf`),
        result.bytes,
      );
      const doc = await globalThis.PDFLib.PDFDocument.load(result.bytes);
      assert.equal(doc.getPageCount(), result.layout.pages.length);
      assert.ok(Math.abs(doc.getPage(0).getSize().width - PAGE.width) < 0.01);
    }
  }
});

test("photo luminance conversion desaturates RGB, retains alpha and matches SVG weights", () => {
  const pixels = new Uint8ClampedArray([
    255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255,
  ]);
  grayscalePixels(pixels);
  assert.deepEqual(
    [...pixels],
    [54, 54, 54, 255, 182, 182, 182, 128, 18, 18, 18, 255],
  );
  const d = clone(defaults);
  d.design.monochrome = true;
  d.profile.photo = "data:image/png;base64,YWJj";
  const svg = renderSVG(createLayout(d, metrics), 0);
  assert.ok(svg.includes("feColorMatrix"));
  assert.ok(svg.includes('filter="url(#gray-'));
});

test("all templates export matching static HTML pages with inline fonts and no editor", () => {
  const fonts = Object.fromEntries(
    Object.entries(fontBytes).map(([k, v]) => [
      k,
      Buffer.from(v).toString("base64"),
    ]),
  );
  for (const id of Object.keys(TEMPLATES)) {
    const d = clone(defaults);
    d.design.template = id;
    const layout = createLayout(d, metrics);
    const html = buildHTML(d, layout, { fonts });
    assert.equal(
      (html.match(/class="sheet"/g) || []).length,
      layout.pages.length,
    );
    assert.ok(html.includes("Nông Thị Hồng Cúc"));
    assert.ok(html.includes("data:font/ttf;base64,"));
    assert.ok(!html.includes("data-edit=") && !html.includes("<script"));
    if (id === "academic") assert.ok(html.includes('fill="#182c35"'));
  }
});

test("Academic sidebar paginates independently without dropping main content or skills", () => {
  const d = clone(defaults);
  d.expertise = Array.from(
    { length: 70 },
    (_, i) =>
      `Năng lực ${i + 1}: Hỗ trợ dữ liệu và quy trình đào tạo tại cơ sở giáo dục.`,
  );
  const layout = createLayout(d, metrics);
  bounds(layout);
  assert.ok(layout.pages.length > 1);
  const t = allText(layout);
  for (let i = 1; i <= 70; i++) assert.ok(t.includes(`Năng lực ${i}:`));
  assert.ok(t.includes("ASC") && t.includes("Phần mềm HRM"));
});
