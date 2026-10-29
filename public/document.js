import { escapeHtml as esc, SECTIONS, isDraft, nfc } from "./model.js";
export const PAGE = { width: 595.276, height: 841.89 };
export const PALETTES = {
  navy: {
    ink: "#182c35",
    accent: "#9c7a4f",
    muted: "#667278",
    soft: "#f3f3ed",
  },
  forest: {
    ink: "#234438",
    accent: "#9a7a4e",
    muted: "#64716b",
    soft: "#eef3ed",
  },
  burgundy: {
    ink: "#522d3b",
    accent: "#a07d57",
    muted: "#79686e",
    soft: "#f5eff0",
  },
};
export function fontMetrics(fontkit, fontBytes) {
  const fonts = Object.fromEntries(
    Object.entries(fontBytes).map(([k, v]) => [k, fontkit.create(v)]),
  );
  const cache = new Map();
  return {
    width(text, size, key) {
      const k = key + "|" + size + "|" + text;
      if (cache.has(k)) return cache.get(k);
      const f = fonts[key],
        w =
          (f.glyphsForString(text).reduce((s, g) => s + g.advanceWidth, 0) *
            size) /
          f.unitsPerEm;
      cache.set(k, w);
      return w;
    },
    supports(text, key) {
      return [...text].every(
        (c) => c === "\n" || fonts[key].hasGlyphForCodePoint(c.codePointAt(0)),
      );
    },
  };
}
export function wrapText(text, width, size, font, metrics) {
  if (width <= 0) throw Error("Vùng nội dung quá nhỏ.");
  const lines = [];
  for (const paragraph of nfc(text).split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const joined = line ? line + " " + word : word;
      if (metrics.width(joined, size, font) <= width) {
        line = joined;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      if (metrics.width(word, size, font) <= width) {
        line = word;
        continue;
      }
      const chars =
        typeof Intl.Segmenter === "function"
          ? [
              ...new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(
                word,
              ),
            ].map((x) => x.segment)
          : [...word];
      for (const c of chars) {
        if (line && metrics.width(line + c, size, font) > width) {
          lines.push(line);
          line = "";
        }
        line += c;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}
export function createLayout(data, metrics) {
  const { profile: p, design: d } = data,
    c = PALETTES[d.theme],
    m = (d.margin * 72) / 25.4,
    w = PAGE.width - 2 * m,
    bottom = PAGE.height - m - 15,
    fs = d.fontSize,
    lh = fs * d.lineHeight,
    titleFont = d.font === "editorial" ? "serif" : "regular";
  const pages = [],
    warnings = [];
  let page,
    y,
    activeSection = "";
  const newPage = (continuation = false) => {
    if (pages.length >= 60)
      throw Error("CV vượt quá 60 trang. Hãy rút gọn trước khi xuất.");
    page = { items: [] };
    pages.push(page);
    y = m;
    if (pages.length > 1) {
      addText(
        p.name || "Hồ sơ ứng tuyển",
        m,
        y + 7,
        8,
        "bold",
        c.muted,
        "profile.name",
      );
      y += 23;
      if (continuation && activeSection) {
        addText(
          SECTIONS[activeSection] + " · tiếp theo",
          m,
          y + 8,
          9,
          "bold",
          c.accent,
        );
        y += 22;
      }
    }
  };
  function addText(
    text,
    x,
    baseline,
    size = fs,
    font = "regular",
    color = c.ink,
    path = "",
    tab = "profile",
  ) {
    page.items.push({
      type: "text",
      text: nfc(text),
      x,
      y: baseline,
      size,
      font,
      color,
      path,
      tab,
    });
    if (
      !metrics.supports(text, font) &&
      !warnings.includes(
        "Một số ký tự chưa có trong font; hãy kiểm tra trước khi gửi.",
      )
    )
      warnings.push(
        "Một số ký tự chưa có trong font; hãy kiểm tra trước khi gửi.",
      );
  }
  function ensure(h, continuation = true) {
    if (y + h > bottom) newPage(continuation);
  }
  function paragraph(
    text,
    {
      size = fs,
      font = "regular",
      color = c.ink,
      indent = 0,
      path = "",
      tab = "profile",
      after = 4,
      bullet = false,
    } = {},
  ) {
    if (!String(text).trim()) return;
    const lineH = size * d.lineHeight,
      lines = wrapText(
        text,
        w - indent - (bullet ? 11 : 0),
        size,
        font,
        metrics,
      );
    const fullHeight = lines.length * lineH + after;
    if (bullet && fullHeight < bottom - m - 50) ensure(fullHeight);
    else ensure(Math.min(2, lines.length) * lineH);
    for (let i = 0; i < lines.length; i++) {
      ensure(lineH);
      if (bullet && i === 0)
        addText("•", m + indent, y + size * 0.96, size, font, c.accent);
      addText(
        lines[i],
        m + indent + (bullet ? 11 : 0),
        y + size * 0.96,
        size,
        font,
        color,
        path,
        tab,
      );
      y += lineH;
    }
    y += after;
  }
  function heading(key) {
    ensure(d.sectionGap + 26 + lh * 2, false);
    activeSection = key;
    y += d.sectionGap;
    addText(
      SECTIONS[key].toLocaleUpperCase("vi"),
      m,
      y + 10,
      10,
      "bold",
      c.ink,
      "",
      key === "experiences" ? "experience" : key,
    );
    page.items.push({
      type: "line",
      x: m,
      y: y + 18,
      x2: m + w,
      y2: y + 18,
      color: c.accent,
      width: 0.55,
    });
    y += 26;
  }
  function itemHeader(name, period, path, tab) {
    ensure(lh * 3);
    const timeW = metrics.width(period || "", 8.2, "regular");
    if (timeW > w * 0.42) {
      paragraph(name, { size: fs + 1, font: "bold", path, tab, after: 1 });
      paragraph(period, {
        size: 8.2,
        color: c.muted,
        path: path.replace(/\.[^.]+$/, ".period"),
        tab,
        after: 3,
      });
      return;
    }
    const nameW = w - (period ? timeW + 12 : 0);
    const names = wrapText(name || "", nameW, fs + 1, "bold", metrics);
    for (let i = 0; i < names.length; i++) {
      ensure(lh);
      addText(names[i], m, y + fs + 1, fs + 1, "bold", c.ink, path, tab);
      if (i === 0 && period)
        addText(
          period,
          m + w - timeW,
          y + fs,
          8.2,
          "regular",
          c.muted,
          path.replace(/\.[^.]+$/, ".period"),
          tab,
        );
      y += lh;
    }
    y += 3;
  }
  newPage();
  const photoW = d.photoVisible ? 67 : 0,
    photoH = d.photoVisible ? 85 : 0,
    nameSize = 25,
    nameWidth = w - (photoW ? photoW + 18 : 0);
  const nameLines = wrapText(
    p.name || "Họ và tên",
    nameWidth,
    nameSize,
    titleFont,
    metrics,
  );
  for (const line of nameLines) {
    ensure(nameSize * 1.25);
    addText(line, m, y + nameSize, nameSize, titleFont, c.ink, "profile.name");
    y += nameSize * 1.25;
  }
  y += 7;
  for (const line of wrapText(
    p.role.toLocaleUpperCase("vi"),
    nameWidth,
    10,
    "bold",
    metrics,
  )) {
    addText(line, m, y + 10, 10, "bold", c.accent, "profile.role");
    y += 15;
  }
  if (d.photoVisible)
    page.items.push({
      type: "image",
      x: PAGE.width - m - photoW,
      y: m,
      width: photoW,
      height: photoH,
      src: p.photo,
      xPosition: p.photoX,
      yPosition: p.photoY,
      zoom: d.photoZoom,
      sourceWidth: p.photoWidth,
      sourceHeight: p.photoHeight,
    });
  y = Math.max(y, m + photoH) + 12;
  const contacts = [p.phone, p.email, p.address]
    .filter(Boolean)
    .join("   ·   ");
  if (contacts)
    paragraph(contacts, {
      size: 8.2,
      color: c.muted,
      path: "profile.email",
      after: 9,
    });
  page.items.push({
    type: "line",
    x: m,
    y,
    x2: m + w,
    y2: y,
    color: c.accent,
    width: 1,
  });
  y += 8;
  for (const key of d.sectionOrder) {
    if (d.hiddenSections.includes(key)) continue;
    if (key === "summary" && p.summary.trim()) {
      heading(key);
      paragraph(p.summary, { path: "profile.summary" });
    }
    if (key === "goal" && p.goal.trim()) {
      heading(key);
      paragraph(p.goal, { path: "profile.goal" });
    }
    if (
      key === "experiences" &&
      data.experiences.some(
        (e) =>
          e.company ||
          e.role ||
          e.description ||
          e.bullets.length ||
          e.results.length,
      )
    ) {
      heading(key);
      data.experiences.forEach((e, i) => {
        if (
          !(
            e.company ||
            e.role ||
            e.description ||
            e.bullets.length ||
            e.results.length
          )
        )
          return;
        itemHeader(
          e.company,
          e.period,
          `experiences.${i}.company`,
          "experience",
        );
        paragraph(e.role, {
          font: "bold",
          size: fs - 0.3,
          path: `experiences.${i}.role`,
          tab: "experience",
          after: 3,
        });
        paragraph(e.description, {
          size: fs - 0.3,
          color: c.muted,
          path: `experiences.${i}.description`,
          tab: "experience",
        });
        e.bullets.forEach((b) =>
          paragraph(b, {
            bullet: true,
            path: `experiences.${i}.bullets`,
            tab: "experience",
            after: 3,
          }),
        );
        if (e.results.length) {
          paragraph("Kết quả / đóng góp", {
            font: "bold",
            size: fs - 0.3,
            after: 3,
            path: `experiences.${i}.results`,
            tab: "experience",
          });
          e.results.forEach((b) =>
            paragraph(b, {
              bullet: true,
              path: `experiences.${i}.results`,
              tab: "experience",
              after: 3,
            }),
          );
        }
        y += 5;
      });
    }
    if (
      key === "projects" &&
      data.projects.some((e) => e.name || e.scope || e.contributions.length)
    ) {
      heading(key);
      data.projects.forEach((e, i) => {
        if (!(e.name || e.role || e.scope || e.contributions.length)) return;
        itemHeader(e.name, e.period, `projects.${i}.name`, "projects");
        paragraph(e.role, {
          font: "bold",
          path: `projects.${i}.role`,
          tab: "projects",
        });
        paragraph(e.scope, {
          color: c.muted,
          path: `projects.${i}.scope`,
          tab: "projects",
        });
        e.contributions.forEach((b) =>
          paragraph(b, {
            bullet: true,
            path: `projects.${i}.contributions`,
            tab: "projects",
          }),
        );
        y += 5;
      });
    }
    if (
      key === "education" &&
      data.education.some((e) => e.school || e.major || e.period || e.detail)
    ) {
      heading(key);
      data.education.forEach((e, i) => {
        if (!(e.school || e.major || e.detail)) return;
        itemHeader(e.school, e.period, `education.${i}.school`, "education");
        paragraph(e.major, {
          font: "bold",
          path: `education.${i}.major`,
          tab: "education",
        });
        paragraph(e.detail, {
          color: c.muted,
          path: `education.${i}.detail`,
          tab: "education",
        });
      });
    }
    if (
      [
        "institutions",
        "skills",
        "certificates",
        "expertise",
        "tools",
        "languages",
      ].includes(key) &&
      data[key].some((s) => s.trim())
    ) {
      heading(key);
      if (key === "institutions")
        paragraph(data[key].join("  ·  "), { path: key, tab: "projects" });
      else
        data[key]
          .filter((s) => s.trim())
          .forEach((s) =>
            paragraph(s, {
              bullet: true,
              path: key,
              tab: key === "certificates" ? "education" : "skills",
              after: 3,
            }),
          );
    }
  }
  if (pages.length > 1)
    warnings.push(
      `CV hiện có ${pages.length} trang. Có thể rút gọn nội dung hoặc điều chỉnh mật độ nếu cần.`,
    );
  for (let i = 0; i < pages.length; i++) {
    page = pages[i];
    const footY = PAGE.height - m;
    page.items.push({
      type: "line",
      x: m,
      y: footY - 10,
      x2: PAGE.width - m,
      y2: footY - 10,
      color: "#d4d9d6",
      width: 0.4,
    });
    const footer = isDraft(data)
      ? "Bản nháp · Nội dung nhiệm vụ cần xác nhận"
      : p.name;
    addText(
      wrapText(footer, w - 45, 7, "regular", metrics)[0] || "",
      m,
      footY,
      7,
      "regular",
      c.muted,
    );
    const label = `${i + 1} / ${pages.length}`,
      tw = metrics.width(label, 7, "regular");
    addText(label, PAGE.width - m - tw, footY, 7, "regular", c.muted);
  }
  return { width: PAGE.width, height: PAGE.height, pages, warnings, colors: c };
}
export function imageFit(box, iw, ih) {
  const scale = Math.max(box.width / iw, box.height / ih) * box.zoom;
  const width = iw * scale,
    height = ih * scale;
  return {
    x: box.x + ((box.width - width) * box.xPosition) / 100,
    y: box.y + ((box.height - height) * box.yPosition) / 100,
    width,
    height,
  };
}
export function renderSVG(layout, index, { editable = true } = {}) {
  const page = layout.pages[index];
  return `<svg class="cv-page" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="CV trang ${index + 1}" style="font-kerning:none;font-variant-ligatures:none"><rect width="100%" height="100%" fill="white"/>${page.items
    .map((t, i) => {
      if (t.type === "text")
        return `<text x="${t.x}" y="${t.y}" font-size="${t.size}" font-family="${t.font === "serif" ? "Atelier Serif" : "Atelier Sans"}" font-weight="${t.font === "bold" ? 700 : 400}" fill="${t.color}" ${editable && t.path ? `data-edit="${esc(t.path)}" data-group="${esc(t.tab)}" tabindex="0" role="button" aria-label="Sửa ${esc(t.text)}"` : ""}>${esc(t.text)}</text>`;
      if (t.type === "line")
        return `<line x1="${t.x}" y1="${t.y}" x2="${t.x2}" y2="${t.y2}" stroke="${t.color}" stroke-width="${t.width}"/>`;
      if (t.src) {
        const fit = imageFit(
          t,
          t.sourceWidth || t.width,
          t.sourceHeight || t.height,
        );
        return `<defs><clipPath id="photo-${index}-${i}"><rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}"/></clipPath></defs><image href="${esc(t.src)}" x="${fit.x}" y="${fit.y}" width="${fit.width}" height="${fit.height}" clip-path="url(#photo-${index}-${i})" ${editable ? 'data-edit="profile.photo" data-group="profile"' : ""}/>`;
      }
      return `<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" fill="${layout.colors.soft}" stroke="${layout.colors.accent}" stroke-width=".6" ${editable ? 'data-edit="profile.photo" data-group="profile" tabindex="0" role="button" aria-label="Thêm ảnh đại diện"' : ""}/>`;
    })
    .join("")}</svg>`;
}
export async function createPDF(data, { PDFLib, fontkit, fontBytes }) {
  const doc = await PDFLib.PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(data.profile.name + " - " + data.profile.role);
  doc.setAuthor(data.profile.name);
  doc.setCreator("CV Atelier v1.2.0");
  const embedded = {};
  for (const [key, bytes] of Object.entries(fontBytes))
    embedded[key] = await doc.embedFont(bytes, {
      subset: true,
      features: { liga: false, kern: false, clig: false },
    });
  const layout = createLayout(data, fontMetrics(fontkit, fontBytes));
  const rgb = (hex) =>
    PDFLib.rgb(
      ...hex
        .replace("#", "")
        .match(/../g)
        .map((x) => parseInt(x, 16) / 255),
    );
  let image;
  for (const p of layout.pages) {
    const page = doc.addPage([layout.width, layout.height]);
    for (const t of p.items) {
      if (t.type === "text") {
        page.drawText(t.text, {
          x: t.x,
          y: layout.height - t.y,
          size: t.size,
          font: embedded[t.font],
          color: rgb(t.color),
        });
      } else if (t.type === "line") {
        page.drawLine({
          start: { x: t.x, y: layout.height - t.y },
          end: { x: t.x2, y: layout.height - t.y2 },
          thickness: t.width,
          color: rgb(t.color),
        });
      } else if (t.src) {
        if (!image) {
          const bytes = Uint8Array.from(atob(t.src.split(",")[1]), (c) =>
            c.charCodeAt(0),
          );
          image = t.src.startsWith("data:image/png")
            ? await doc.embedPng(bytes)
            : t.src.startsWith("data:image/jpeg")
              ? await doc.embedJpg(bytes)
              : null;
          if (!image)
            throw Error(
              "Vui lòng tải lại ảnh để chuyển thành JPEG trước khi xuất PDF.",
            );
        }
        const f = imageFit(t, image.width, image.height);
        page.pushOperators(
          PDFLib.pushGraphicsState(),
          PDFLib.rectangle(
            t.x,
            layout.height - t.y - t.height,
            t.width,
            t.height,
          ),
          PDFLib.clip(),
          PDFLib.endPath(),
        );
        page.drawImage(image, {
          x: f.x,
          y: layout.height - f.y - f.height,
          width: f.width,
          height: f.height,
        });
        page.pushOperators(PDFLib.popGraphicsState());
      } else
        page.drawRectangle({
          x: t.x,
          y: layout.height - t.y - t.height,
          width: t.width,
          height: t.height,
          color: rgb(layout.colors.soft),
          borderColor: rgb(layout.colors.accent),
          borderWidth: 0.6,
        });
    }
  }
  return { bytes: await doc.save(), layout };
}
