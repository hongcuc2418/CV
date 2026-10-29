import { grayscalePhoto } from "./photo-grayscale.js";
import { templateFor } from "./templates.js";
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
export function paletteFor(data) {
  const base = PALETTES[data.design.theme] || PALETTES.navy;
  if (data.design.monochrome || data.design.template === "classic")
    return {
      ink: "#222222",
      accent: "#555555",
      muted: "#666666",
      soft: "#f0f0f0",
      paper: "#ffffff",
      header: "#222222",
      light: "#ffffff",
      gold: "#d6d6d6",
    };
  return {
    ...base,
    paper: "#fbfaf6",
    header: base.ink,
    light: "#fbf9f1",
    gold: "#d8bd8d",
  };
}
export function createLayout(data, metrics) {
  const { profile: p, design: d } = data,
    template = templateFor(data),
    c = paletteFor(data),
    id = template.id;
  const m = (d.margin * 72) / 25.4,
    fullW = PAGE.width - 2 * m,
    bottom = PAGE.height - m - 22,
    fs = d.fontSize,
    titleFont = d.font === "editorial" ? "serif" : "regular";
  const pages = [],
    warnings = [],
    sideWidth = Math.min(147, fullW * 0.3),
    gap = 28;
  const headingFont = id === "classic" ? "bold" : titleFont;
  let bodyStart = 0;
  function rect(page, x, y, width, height, fill, border = "", borderWidth = 0) {
    page.items.push({
      type: "rect",
      x,
      y,
      width,
      height,
      fill,
      border,
      borderWidth,
    });
  }
  function line(page, x, y, x2, y2, color = c.accent, width = 0.6) {
    page.items.push({ type: "line", x, y, x2, y2, color, width });
  }
  function text(
    page,
    value,
    x,
    y,
    size = fs,
    font = "regular",
    color = c.ink,
    path = "",
    tab = "profile",
  ) {
    const valueNFC = nfc(value);
    page.items.push({
      type: "text",
      text: valueNFC,
      x,
      y,
      size,
      font,
      color,
      path,
      tab,
    });
    if (
      !metrics.supports(valueNFC, font) &&
      !warnings.some((x) => x.startsWith("Một số ký tự"))
    )
      warnings.push(
        "Một số ký tự chưa có trong font; hãy kiểm tra trước khi gửi.",
      );
  }
  function photo(page, y) {
    if (!d.photoVisible || id === "classic") return;
    page.items.push({
      type: "image",
      monochrome: !!d.monochrome,
      x: PAGE.width - m - 67,
      y,
      width: 67,
      height: 85,
      src: p.photo,
      xPosition: p.photoX,
      yPosition: p.photoY,
      zoom: d.photoZoom,
      sourceWidth: p.photoWidth,
      sourceHeight: p.photoHeight,
      fill: id === "academic" ? c.paper : c.soft,
      border: id === "academic" ? c.gold : c.accent,
    });
  }
  function headerFirst(page) {
    const hasPhoto = d.photoVisible && id !== "classic",
      nameWidth = fullW - (hasPhoto ? 90 : 0),
      nameSize = id === "modern" ? 28 : id === "academic" ? 26 : 24;
    const eyebrowLines =
      id === "academic" && p.eyebrow
        ? wrapText(
            p.eyebrow.toLocaleUpperCase("vi"),
            nameWidth,
            7.2,
            "regular",
            metrics,
          )
        : [];
    if (eyebrowLines.length > 3)
      throw Error("Nhãn đầu hồ sơ quá dài. Hãy rút gọn để bố cục rõ ràng.");
    let y =
      m +
      (id === "academic" ? 16 + Math.max(0, eyebrowLines.length - 1) * 10 : 10);
    const nameLines = wrapText(
      p.name || "Họ và tên",
      nameWidth,
      nameSize,
      id === "modern" ? "bold" : titleFont,
      metrics,
    );
    const roleLines = wrapText(
      p.role.toLocaleUpperCase("vi"),
      nameWidth,
      9.2,
      "bold",
      metrics,
    );
    const contentHeight =
      nameLines.length * nameSize * 1.25 + roleLines.length * 14 + 14;
    const contactText = [p.phone, p.email, p.address]
      .filter(Boolean)
      .join("   ·   ");
    const contactLines =
      id !== "academic" && contactText
        ? wrapText(contactText, fullW, 8.3, "regular", metrics)
        : [];
    const headEnd =
      Math.max(y + contentHeight, m + (hasPhoto ? 96 : 35)) +
      contactLines.length * 12 +
      12;
    if (headEnd > PAGE.height * 0.53)
      throw Error(
        "Tên, vị trí hoặc liên hệ ở đầu CV quá dài. Hãy rút gọn để bố cục rõ ràng.",
      );
    if (id === "academic") {
      const darkBottom = Math.max(145, headEnd + 9);
      rect(page, 0, 0, PAGE.width, darkBottom, c.header);
      rect(page, 0, 0, 8, darkBottom, c.gold);
      eyebrowLines.forEach((s, i) =>
        text(
          page,
          s,
          m,
          m - 10 + i * 10,
          7.2,
          "regular",
          c.gold,
          "profile.eyebrow",
        ),
      );
      for (const s of nameLines) {
        text(
          page,
          s,
          m,
          y + nameSize * 0.96,
          nameSize,
          titleFont,
          c.light,
          "profile.name",
        );
        y += nameSize * 1.25;
      }
      y += 9;
      for (const s of roleLines) {
        text(page, s, m, y + 9.2, 9.2, "bold", c.gold, "profile.role");
        y += 14;
      }
      line(
        page,
        m,
        darkBottom - 15,
        PAGE.width - m,
        darkBottom - 15,
        c.gold,
        0.65,
      );
      photo(page, m - 9);
      bodyStart = darkBottom + 23;
    } else if (id === "modern") {
      const modernBottom = headEnd + 9;
      rect(page, 0, 0, PAGE.width, modernBottom, c.soft);
      rect(page, m - 15, m - 5, 3, modernBottom - m - 14, c.accent);
      for (const s of nameLines) {
        text(
          page,
          s,
          m,
          y + nameSize * 0.96,
          nameSize,
          "bold",
          c.ink,
          "profile.name",
        );
        y += nameSize * 1.25;
      }
      y += 7;
      for (const s of roleLines) {
        text(page, s, m, y + 9.2, 9.2, "bold", c.accent, "profile.role");
        y += 14;
      }
      y = Math.max(y, m + (hasPhoto ? 90 : 0)) + 8;
      for (const s of contactLines) {
        text(page, s, m, y + 8.3, 8.3, "regular", c.muted, "profile.email");
        y += 12;
      }
      photo(page, m);
      line(
        page,
        m,
        modernBottom,
        Math.min(m + 65, PAGE.width - m),
        modernBottom,
        c.accent,
        2,
      );
      bodyStart = modernBottom + 19;
    } else {
      for (const s of nameLines) {
        text(
          page,
          s,
          m,
          y + nameSize * 0.96,
          nameSize,
          titleFont,
          c.ink,
          "profile.name",
        );
        y += nameSize * 1.25;
      }
      y += 5;
      for (const s of roleLines) {
        text(page, s, m, y + 9.2, 9.2, "bold", c.ink, "profile.role");
        y += 14;
      }
      y += 9;
      for (const s of contactLines) {
        text(page, s, m, y + 8.3, 8.3, "regular", c.ink, "profile.email");
        y += 12;
      }
      line(page, m, y + 7, PAGE.width - m, y + 7, c.ink, 0.8);
      bodyStart = y + 19;
    }
  }
  function decorateBody(page, index) {
    if (id === "academic") {
      const start = index === 0 ? bodyStart : m + 34;
      rect(
        page,
        m - 11,
        start - 8,
        sideWidth + 22,
        bottom - start + 12,
        c.soft,
      );
      line(
        page,
        m + sideWidth + 14,
        start - 8,
        m + sideWidth + 14,
        bottom + 4,
        c.accent,
        0.35,
      );
    }
  }
  function getPage(index) {
    while (pages.length <= index) {
      if (pages.length >= 60)
        throw Error("CV vượt quá 60 trang. Hãy rút gọn trước khi xuất.");
      const page = { items: [] };
      const i = pages.length;
      pages.push(page);
      if (i === 0) headerFirst(page);
      else {
        if (id === "academic") rect(page, 0, 0, PAGE.width, 6, c.header);
        const name =
          wrapText(
            p.name || "Hồ sơ ứng tuyển",
            fullW - 90,
            8,
            "bold",
            metrics,
          )[0] || "";
        text(page, name, m, m + 5, 8, "bold", c.muted, "profile.name");
        line(
          page,
          m,
          m + 16,
          PAGE.width - m,
          m + 16,
          id === "classic" ? c.ink : c.accent,
          0.45,
        );
      }
      decorateBody(page, i);
    }
    return pages[index];
  }
  getPage(0);
  function flow({ side = false } = {}) {
    const x = side
      ? m + 1
      : id === "academic"
        ? m + sideWidth + gap
        : id === "modern"
          ? m + 19
          : m;
    const width = side ? sideWidth - 2 : PAGE.width - m - x;
    const baseSize = side ? Math.max(8, fs - 0.9) : fs;
    let index = 0,
      y = bodyStart,
      active = "",
      ordinal = 0;
    const page = () => getPage(index);
    const start = () => (index === 0 ? bodyStart : m + 34);
    function next(continued = true) {
      index++;
      getPage(index);
      y = start();
      if (continued && active) {
        const label = SECTIONS[active] + " · tiếp theo";
        const lines = wrapText(label, width, side ? 7.7 : 8.5, "bold", metrics);
        for (const s of lines) {
          text(page(), s, x, y + 8, side ? 7.7 : 8.5, "bold", c.accent);
          y += 12;
        }
        y += 5;
      }
    }
    function ensure(height, continued = true) {
      if (y + height > bottom) next(continued);
    }
    function paragraph(
      value,
      {
        size = baseSize,
        font = "regular",
        color = c.ink,
        path = "",
        tab = "profile",
        after = 4,
        bullet = false,
      } = {},
    ) {
      if (!String(value).trim()) return;
      const lineH = size * d.lineHeight,
        indent = bullet ? 10 : 0,
        lines = wrapText(value, width - indent, size, font, metrics),
        total = lines.length * lineH + after;
      const maxPage = bottom - (m + 34) - 40;
      ensure(
        bullet && total < maxPage ? total : Math.min(lines.length, 2) * lineH,
      );
      for (let i = 0; i < lines.length; i++) {
        ensure(lineH);
        if (bullet && i === 0)
          text(page(), "•", x, y + size * 0.96, size, "regular", c.accent);
        text(
          page(),
          lines[i],
          x + indent,
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
      const s = side ? 8.3 : id === "classic" ? 10.4 : 12.5,
        f = side || id === "classic" ? "bold" : headingFont;
      const label =
        side || id === "classic"
          ? SECTIONS[key].toLocaleUpperCase("vi")
          : SECTIONS[key];
      const lines = wrapText(label, width, s, f, metrics),
        space = d.sectionGap + (side ? 2 : 3),
        h = lines.length * (s + 3) + 10;
      ensure(space + h + baseSize * d.lineHeight * 2, false);
      active = key;
      y += space;
      ordinal++;
      if (id === "modern" && !side) {
        rect(page(), m, y + 1, 11, 11, c.ink);
        text(
          page(),
          String(ordinal).padStart(2, "0"),
          m + 1.3,
          y + 8.7,
          5.8,
          "bold",
          c.light,
        );
      }
      for (const l of lines) {
        text(page(), l, x, y + s, s, f, id === "classic" ? c.ink : c.ink);
        y += s + 3;
      }
      line(
        page(),
        x,
        y + 2,
        x + (side ? width : id === "modern" ? 40 : width),
        y + 2,
        c.accent,
        side ? 0.55 : 0.65,
      );
      y += 11;
    }
    function itemHeader(name, period, path, tab) {
      const size = side ? baseSize + 0.2 : fs + 0.5;
      ensure(baseSize * d.lineHeight * 3);
      if (!String(name).trim()) {
        paragraph(period, {
          size: 7.6,
          color: c.muted,
          path: path.replace(/\.[^.]+$/, ".period"),
          tab,
          after: 4,
        });
        return;
      }
      const tw = metrics.width(period || "", 7.6, "regular");
      if (side || tw > width * 0.36) {
        paragraph(name, { size, font: "bold", path, tab, after: 2 });
        paragraph(period, {
          size: 7.6,
          color: c.muted,
          path: path.replace(/\.[^.]+$/, ".period"),
          tab,
          after: 4,
        });
        return;
      }
      const lines = wrapText(
        name || "",
        width - (period ? tw + 10 : 0),
        size,
        "bold",
        metrics,
      );
      for (let i = 0; i < lines.length; i++) {
        ensure(size * d.lineHeight + 4);
        if (id === "modern")
          rect(
            page(),
            x - 4,
            y - 2,
            width + 8,
            size * d.lineHeight + 5,
            c.soft,
          );
        text(
          page(),
          lines[i],
          x,
          y + size * 0.96,
          size,
          "bold",
          c.ink,
          path,
          tab,
        );
        if (i === 0 && period)
          text(
            page(),
            period,
            x + width - tw,
            y + size * 0.95,
            7.6,
            "regular",
            c.muted,
            path.replace(/\.[^.]+$/, ".period"),
            tab,
          );
        y += size * d.lineHeight;
      }
      y += 4;
    }
    function section(key) {
      if (key === "summary" || key === "goal") {
        const value = p[key];
        if (!value.trim()) return;
        heading(key);
        paragraph(value, { path: "profile." + key });
        return;
      }
      if (key === "experiences") {
        if (
          !data.experiences.some(
            (e) =>
              e.company ||
              e.role ||
              e.period ||
              e.description ||
              e.bullets.length ||
              e.results.length,
          )
        )
          return;
        heading(key);
        data.experiences.forEach((e, i) => {
          if (
            !(
              e.company ||
              e.role ||
              e.period ||
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
            size: baseSize - 0.25,
            path: `experiences.${i}.role`,
            tab: "experience",
            after: 3,
          });
          paragraph(e.description, {
            size: baseSize - 0.25,
            color: c.muted,
            path: `experiences.${i}.description`,
            tab: "experience",
            after: 5,
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
              size: baseSize - 0.2,
              font: "bold",
              path: `experiences.${i}.results`,
              tab: "experience",
              after: 3,
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
          y += 6;
        });
        return;
      }
      if (key === "projects") {
        if (
          !data.projects.some(
            (e) =>
              e.name || e.role || e.period || e.scope || e.contributions.length,
          )
        )
          return;
        heading(key);
        data.projects.forEach((e, i) => {
          if (
            !(e.name || e.role || e.period || e.scope || e.contributions.length)
          )
            return;
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
        return;
      }
      if (key === "education") {
        if (
          !data.education.some(
            (e) => e.school || e.major || e.period || e.detail,
          )
        )
          return;
        heading(key);
        data.education.forEach((e, i) => {
          if (!(e.school || e.major || e.period || e.detail)) return;
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
          y += 3;
        });
        return;
      }
      if (!Array.isArray(data[key]) || !data[key].some((s) => s.trim())) return;
      heading(key);
      if (key === "institutions")
        paragraph(data[key].filter((s) => s.trim()).join("  ·  "), {
          path: key,
          tab: "projects",
        });
      else
        data[key]
          .filter((s) => s.trim())
          .forEach((s) =>
            paragraph(s, {
              bullet: true,
              path: key,
              tab: key === "certificates" ? "education" : "skills",
              after: 4,
            }),
          );
    }
    return {
      paragraph,
      section,
      contact() {
        const contacts = [
          ["phone", p.phone],
          ["email", p.email],
          ["address", p.address],
        ].filter(([, v]) => v.trim());
        if (!contacts.length) return;
        ensure(35, false);
        text(page(), "LIÊN HỆ", x, y + 8.3, 8.3, "bold", c.ink);
        y += 15;
        line(page(), x, y, x + width, y, c.accent, 0.55);
        y += 9;
        for (const [key, value] of contacts)
          paragraph(value, {
            size: baseSize - 0.3,
            path: "profile." + key,
            after: 7,
          });
        y += 3;
      },
      tagline() {
        if (!p.tagline.trim()) return;
        paragraph(p.tagline, {
          size: 10.5,
          font: titleFont,
          color: c.ink,
          path: "profile.tagline",
          after: 14,
        });
      },
    };
  }
  if (id === "academic") {
    const side = flow({ side: true });
    side.tagline();
    side.contact();
    for (const key of d.sectionOrder)
      if (
        !d.hiddenSections.includes(key) &&
        template.sideSections.includes(key)
      )
        side.section(key);
  }
  const main = flow();
  for (const key of d.sectionOrder)
    if (!d.hiddenSections.includes(key) && !template.sideSections.includes(key))
      main.section(key);
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i],
      footY = PAGE.height - m;
    line(
      page,
      m,
      footY - 10,
      PAGE.width - m,
      footY - 10,
      id === "classic" || d.monochrome ? "#aaaaaa" : "#cbd1cc",
      0.4,
    );
    const footer = isDraft(data)
      ? "Bản nháp · Nội dung nhiệm vụ cần xác nhận"
      : p.name;
    text(
      page,
      wrapText(footer, fullW - 45, 6.7, "regular", metrics)[0] || "",
      m,
      footY,
      6.7,
      "regular",
      c.muted,
    );
    const label = `${i + 1} / ${pages.length}`;
    text(
      page,
      label,
      PAGE.width - m - metrics.width(label, 7, "regular"),
      footY,
      7,
      "regular",
      c.muted,
    );
  }
  if (pages.length > 1)
    warnings.push(
      `CV hiện có ${pages.length} trang. Có thể rút gọn nội dung hoặc điều chỉnh mật độ nếu cần.`,
    );
  return {
    width: PAGE.width,
    height: PAGE.height,
    pages,
    warnings,
    colors: c,
    template: id,
    monochrome: d.monochrome || id === "classic",
  };
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
export function renderSVG(
  layout,
  index,
  { editable = true, idPrefix = "cv" } = {},
) {
  const page = layout.pages[index];
  return `<svg class="cv-page" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="CV trang ${index + 1}" style="font-kerning:none;font-variant-ligatures:none"><rect width="100%" height="100%" fill="white"/>${page.items
    .map((t, i) => {
      if (t.type === "text")
        return `<text x="${t.x}" y="${t.y}" font-size="${t.size}" font-family="${t.font === "serif" ? "Atelier Serif" : "Atelier Sans"}" font-weight="${t.font === "bold" ? 700 : 400}" fill="${t.color}" ${editable && t.path ? `data-edit="${esc(t.path)}" data-group="${esc(t.tab)}" tabindex="0" role="button" aria-label="Sửa ${esc(t.text)}"` : ""}>${esc(t.text)}</text>`;
      if (t.type === "rect")
        return `<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" fill="${t.fill || "none"}" ${t.border ? `stroke="${t.border}" stroke-width="${t.borderWidth || 0.5}"` : ""}/>`;
      if (t.type === "line")
        return `<line x1="${t.x}" y1="${t.y}" x2="${t.x2}" y2="${t.y2}" stroke="${t.color}" stroke-width="${t.width}"/>`;
      if (t.src) {
        const fit = imageFit(
          t,
          t.sourceWidth || t.width,
          t.sourceHeight || t.height,
        );
        return `<defs>${t.monochrome ? `<filter id="gray-${idPrefix}-${index}-${i}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0"/></filter>` : ""}<clipPath id="photo-${idPrefix}-${index}-${i}"><rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}"/></clipPath></defs><image href="${esc(t.src)}" x="${fit.x}" y="${fit.y}" width="${fit.width}" height="${fit.height}" clip-path="url(#photo-${idPrefix}-${index}-${i})" ${t.monochrome ? `filter="url(#gray-${idPrefix}-${index}-${i})"` : ""} ${editable ? 'data-edit="profile.photo" data-group="profile"' : ""}/>`;
      }
      return `<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" fill="${t.fill || layout.colors.soft}" stroke="${t.border || layout.colors.accent}" stroke-width=".6" ${editable ? 'data-edit="profile.photo" data-group="profile" tabindex="0" role="button" aria-label="Thêm ảnh đại diện"' : ""}/>`;
    })
    .join("")}</svg>`;
}
export async function createPDF(data, { PDFLib, fontkit, fontBytes }) {
  const doc = await PDFLib.PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(data.profile.name + " - " + data.profile.role);
  doc.setAuthor(data.profile.name);
  doc.setCreator("CV Atelier v1.3.0");
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
  const photoSource =
    data.design.monochrome &&
    data.design.photoVisible &&
    data.design.template !== "classic" &&
    data.profile.photo
      ? await grayscalePhoto(data.profile.photo)
      : data.profile.photo;
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
      } else if (t.type === "rect") {
        page.drawRectangle({
          x: t.x,
          y: layout.height - t.y - t.height,
          width: t.width,
          height: t.height,
          ...(t.fill ? { color: rgb(t.fill) } : {}),
          ...(t.border
            ? { borderColor: rgb(t.border), borderWidth: t.borderWidth || 0.5 }
            : {}),
        });
      } else if (t.src) {
        if (!image) {
          const bytes = Uint8Array.from(atob(photoSource.split(",")[1]), (c) =>
            c.charCodeAt(0),
          );
          image = photoSource.startsWith("data:image/png")
            ? await doc.embedPng(bytes)
            : photoSource.startsWith("data:image/jpeg")
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
          color: rgb(t.fill || layout.colors.soft),
          borderColor: rgb(t.border || layout.colors.accent),
          borderWidth: 0.6,
        });
    }
  }
  return { bytes: await doc.save(), layout };
}
