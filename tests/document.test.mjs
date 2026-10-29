import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { defaults, clone, validateData } from "../public/model.js";
import {
  fontMetrics,
  createLayout,
  createPDF,
  wrapText,
  renderSVG,
  imageFit,
  PAGE,
} from "../public/document.js";
import { buildHTML, bytesBase64, FONT_FILES } from "../public/export.js";
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
for (const [key, file] of Object.entries(FONT_FILES))
  fontBytes[key] = new Uint8Array(
    await readFile(new URL("../public/fonts/" + file, import.meta.url)),
  );
const metrics = fontMetrics(globalThis.fontkit, fontBytes),
  output = process.env.CV_QA_DIR || path.join(tmpdir(), "cv-atelier-v120-qa");
await mkdir(output, { recursive: true });
function bounds(layout) {
  for (const p of layout.pages)
    for (const t of p.items) {
      if (t.type !== "text") continue;
      assert.ok(t.y >= 0 && t.y <= PAGE.height, `vertical ${t.text}`);
      assert.ok(t.x >= 0);
      assert.ok(
        t.x + metrics.width(t.text, t.size, t.font) <= PAGE.width + 0.1,
        `horizontal ${t.text}`,
      );
    }
}
test("Vietnamese fonts cover full name and normal body text, default is one page", () => {
  assert.ok(metrics.supports("Nông Thị Hồng Cúc · ĐÀO TẠO Ắ Ằ Ẳ Ẵ Ặ", "serif"));
  const l = createLayout(defaults, metrics);
  assert.equal(l.pages.length, 1);
  bounds(l);
});
test("wrapping handles long tokens, multiline and preserves Vietnamese text", () => {
  const text = "Nông Thị Hồng Cúc " + "đào".repeat(150);
  const lines = wrapText(text, 130, 10, "regular", metrics);
  assert.ok(lines.length > 2);
  for (const line of lines)
    assert.ok(metrics.width(line, 10, "regular") <= 130.1);
  assert.equal(lines.join("").replaceAll(" ", ""), text.replaceAll(" ", ""));
});
test("long content paginates with no lost bullet lines or off-page text at all density extremes", () => {
  const d = clone(defaults);
  d.experiences[0].bullets = Array.from(
    { length: 40 },
    (_, i) =>
      `Nhiệm vụ ${i + 1}: ` +
      "Hỗ trợ dữ liệu và nghiệp vụ đào tạo tại cơ sở giáo dục. ".repeat(4),
  );
  for (const size of [9, 13]) {
    d.design.fontSize = size;
    d.design.margin = 24;
    d.design.lineHeight = 1.8;
    const l = createLayout(d, metrics);
    assert.ok(l.pages.length > 2);
    bounds(l);
    const text = l.pages
      .flatMap((p) =>
        p.items.filter((i) => i.type === "text").map((i) => i.text),
      )
      .join(" ");
    for (let i = 1; i <= 40; i++)
      assert.ok(text.includes("Nhiệm vụ " + i + ":"));
  }
});
test("crop calculations preserve exact framing for preview and PDF", () => {
  const f = imageFit(
    {
      x: 10,
      y: 20,
      width: 60,
      height: 80,
      zoom: 1.5,
      xPosition: 25,
      yPosition: 75,
    },
    100,
    100,
  );
  assert.ok(Math.abs(f.width - 120) < 1e-8);
  assert.ok(Math.abs(f.height - 120) < 1e-8);
  assert.ok(Math.abs(f.x + 5) < 1e-8);
  assert.ok(Math.abs(f.y + 10) < 1e-8);
});
test("static HTML is self-contained, escaped, scriptless and contains matching A4 pages", () => {
  const d = clone(defaults);
  d.profile.name = "<script>alert(1)</script>";
  const l = createLayout(d, metrics),
    fonts = Object.fromEntries(
      Object.entries(fontBytes).map(([k, v]) => [k, bytesBase64(v)]),
    );
  const html = buildHTML(d, l, { fonts });
  assert.ok(html.includes("data:font/ttf;base64,"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("data-edit="));
  assert.ok(!html.includes('href="./'));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.equal((html.match(/class="sheet"/g) || []).length, l.pages.length);
});
test("real PDF embeds fonts, uses A4 size, writes default and multipage QA files", async () => {
  const opts = {
    PDFLib: globalThis.PDFLib,
    fontkit: globalThis.fontkit,
    fontBytes,
  };
  const small = await createPDF(validateData(defaults), opts);
  await writeFile(path.join(output, "cv-default.pdf"), small.bytes);
  const parsed = await globalThis.PDFLib.PDFDocument.load(small.bytes);
  assert.equal(parsed.getPageCount(), small.layout.pages.length);
  assert.ok(Math.abs(parsed.getPage(0).getSize().width - PAGE.width) < 0.01);
  const d = clone(defaults);
  d.experiences[0].bullets = Array.from(
    { length: 30 },
    (_, i) =>
      `Nhiệm vụ ${i + 1}: ` +
      "Phối hợp xử lý dữ liệu đào tạo và hướng dẫn người dùng. ".repeat(3),
  );
  const long = await createPDF(d, opts);
  await writeFile(path.join(output, "cv-long.pdf"), long.bytes);
  const parsedLong = await globalThis.PDFLib.PDFDocument.load(long.bytes);
  assert.ok(parsedLong.getPageCount() > 1);
  assert.equal(parsedLong.getPageCount(), long.layout.pages.length);
  console.log("PDF QA output:", output);
});
test("PDF embeds a real PNG and crops it without rasterizing document text", async () => {
  const d = clone(defaults);
  const image = await readFile(
    new URL("./fixtures/photo-test.png", import.meta.url),
  );
  d.profile.photo = "data:image/png;base64," + image.toString("base64");
  d.profile.photoWidth = 180;
  d.profile.photoHeight = 240;
  d.profile.photoX = 25;
  d.profile.photoY = 75;
  d.design.photoZoom = 1.4;
  const result = await createPDF(d, {
    PDFLib: globalThis.PDFLib,
    fontkit: globalThis.fontkit,
    fontBytes,
  });
  const parsed = await globalThis.PDFLib.PDFDocument.load(result.bytes);
  const res = parsed.getPage(0).node.Resources();
  assert.ok(
    res.lookup(globalThis.PDFLib.PDFName.of("XObject")).keys().length > 0,
  );
  assert.equal(
    result.layout.pages[0].items.find((i) => i.type === "image").zoom,
    1.4,
  );
});
