// Reference-inspired Modern 1. All coordinates are shared by SVG, HTML and PDF.
import { SECTIONS, isDraft, nfc } from "./model.js";

export const CONTACT_ICONS = {
  phone:
    "M2 1 L5 1 L6 4 L4.5 5.5 C5.5 7.5 6.5 8.5 8.5 9.5 L10 8 L13 9 L13 12 C13 14 9 13 6 10 C3 7 0 3 2 1 Z",
  email: "M1 2 L13 2 L13 11 L1 11 Z M1 2 L7 7 L13 2",
  address:
    "M7 13 C5 10 2 7 2 5 A5 5 0 1 1 12 5 C12 7 9 10 7 13 Z M8.8 5 A1.8 1.8 0 1 1 5.2 5 A1.8 1.8 0 1 1 8.8 5 Z",
};

export function createModernOneLayout(
  data,
  metrics,
  { PAGE, wrapText, colors: c },
) {
  const { profile: p, design: d } = data;
  const m = (d.margin * 72) / 25.4,
    width = PAGE.width - 2 * m,
    bottom = PAGE.height - m - 22;
  const fs = d.fontSize,
    lh = d.lineHeight,
    pages = [],
    warnings = [];
  const rule = d.monochrome ? "#bbbbbb" : "#c9c5c5";
  const text = (
    page,
    value,
    x,
    y,
    size = fs,
    font = "regular",
    color = c.ink,
    path = "",
    tab = "profile",
  ) => {
    const s = nfc(value);
    page.items.push({
      type: "text",
      text: s,
      x,
      y,
      size,
      font,
      color,
      path,
      tab,
    });
    if (
      !metrics.supports(s, font) &&
      !warnings.some((x) => x.startsWith("Một số ký tự"))
    )
      warnings.push(
        "Một số ký tự chưa có trong font; hãy kiểm tra trước khi gửi.",
      );
  };
  const line = (page, x, y, x2, color = rule, thickness = 0.6) =>
    page.items.push({ type: "line", x, y, x2, y2: y, color, width: thickness });
  const first = { items: [] };
  pages.push(first);
  const diameter = 124,
    hasPhoto = d.photoVisible,
    photoY = m - 13;
  const titleX = hasPhoto ? m + diameter + 13 : m,
    titleWidth = PAGE.width - m - titleX;
  const nameSize = 19,
    roleSize = 9,
    name = p.name || "Họ và tên";
  const together =
    metrics.width(name, nameSize, "bold") +
      metrics.width(p.role, roleSize, "bold") +
      14 <=
    titleWidth;
  let titleY = m + 43;
  const nameLines = wrapText(name, titleWidth, nameSize, "bold", metrics);
  for (const s of nameLines) {
    text(first, s, titleX, titleY, nameSize, "bold", c.accent, "profile.name");
    titleY += 25;
  }
  if (together && nameLines.length === 1) {
    if (p.role)
      text(
        first,
        p.role,
        PAGE.width - m - metrics.width(p.role, roleSize, "bold"),
        titleY - 25,
        roleSize,
        "bold",
        c.accent,
        "profile.role",
      );
    titleY -= 12;
  } else {
    for (const s of wrapText(p.role, titleWidth, roleSize, "bold", metrics)) {
      if (s)
        text(
          first,
          s,
          titleX,
          titleY - 9,
          roleSize,
          "bold",
          c.accent,
          "profile.role",
        );
      titleY += 13;
    }
    titleY -= 3;
  }
  const ruleY = titleY;
  line(first, titleX, ruleY, PAGE.width - m, c.accent, 1.5);
  let contactY = ruleY + 10;
  const contacts = ["phone", "email", "address"].filter((k) => p[k].trim());
  const cellWidth = (titleWidth - 14) / 2;
  for (let i = 0; i < contacts.length; i += 2) {
    let rowHeight = 0;
    for (let j = 0; j < 2; j++) {
      const key = contacts[i + j];
      if (!key) continue;
      const x = titleX + j * (cellWidth + 14),
        lines = wrapText(p[key], cellWidth - 15, 8, "regular", metrics);
      first.items.push({
        type: "icon",
        name: key,
        x,
        y: contactY,
        width: 10,
        height: 10,
        color: c.ink,
      });
      lines.forEach((s, k) =>
        text(
          first,
          s,
          x + 15,
          contactY + 8 + k * 11,
          8,
          "regular",
          c.ink,
          "profile." + key,
        ),
      );
      rowHeight = Math.max(rowHeight, lines.length * 11 + 5);
    }
    contactY += rowHeight;
  }
  const bodyStart = Math.max(
    hasPhoto ? photoY + diameter + 22 : m + 48,
    contactY + 17,
  );
  if (bodyStart > PAGE.height * 0.53)
    throw Error(
      "Tên, vị trí hoặc liên hệ ở đầu CV quá dài. Hãy rút gọn để bố cục rõ ràng.",
    );
  if (hasPhoto)
    first.items.push({
      type: "image",
      shape: "circle",
      inset: 3,
      x: m,
      y: photoY,
      width: diameter,
      height: diameter,
      src: p.photo,
      sourceWidth: p.photoWidth,
      sourceHeight: p.photoHeight,
      xPosition: p.photoX,
      yPosition: p.photoY,
      zoom: d.photoZoom,
      monochrome: !!d.monochrome,
      fill: "#ffffff",
      border: c.accent,
      borderWidth: 1.4,
    });

  const start = (index) => (index === 0 ? bodyStart : m + 51);
  function page(index, section = "") {
    while (pages.length <= index) {
      if (pages.length >= 60)
        throw Error("CV vượt quá 60 trang. Hãy rút gọn trước khi xuất.");
      const next = { items: [] };
      pages.push(next);
      const label = wrapText(name, width - 70, 8, "bold", metrics)[0] || "";
      text(next, label, m, m + 5, 8, "bold", c.muted);
      line(next, m, m + 15, PAGE.width - m, c.accent, 0.6);
      if (section)
        text(
          next,
          SECTIONS[section] + " · tiếp theo",
          m,
          m + 36,
          8,
          "bold",
          c.accent,
        );
    }
    return pages[index];
  }
  function ensure(cursor, height, section = "") {
    if (cursor.y + height > bottom) {
      cursor.page++;
      cursor.y = start(cursor.page);
      page(cursor.page, section);
    }
  }
  function paint(blocks, x, w, initial, section) {
    const cur = { ...initial };
    for (const b of blocks) {
      if (!String(b.value ?? "").trim()) continue;
      const size = b.size ?? fs,
        font = b.font ?? "regular",
        indent = b.bullet ? 10 : 0,
        lineH = size * lh;
      const lines = wrapText(b.value, w - indent, size, font, metrics),
        after = b.after ?? 3,
        total = lines.length * lineH;
      const capacity = bottom - start(1) - 15;
      ensure(
        cur,
        b.bullet && total + after <= capacity
          ? total + after
          : Math.min(2, lines.length) * lineH,
        section,
      );
      for (let i = 0; i < lines.length; i++) {
        ensure(cur, lineH, section);
        if (b.bullet && i === 0)
          text(
            page(cur.page, section),
            "•",
            x,
            cur.y + size * 0.96,
            size,
            "regular",
            c.ink,
          );
        text(
          page(cur.page, section),
          lines[i],
          x + indent,
          cur.y + size * 0.96,
          size,
          font,
          b.color ?? c.ink,
          b.path ?? "",
          b.tab ?? "profile",
        );
        cur.y += lineH;
      }
      cur.y += after;
    }
    return cur;
  }
  const later = (a, b) =>
    a.page > b.page || (a.page === b.page && a.y >= b.y) ? a : b;
  let cursor = { page: 0, y: bodyStart };
  function heading(key) {
    const size = 10.5,
      font = d.font === "editorial" ? "serif" : "bold",
      lines = wrapText(SECTIONS[key], width, size, font, metrics);
    ensure(cursor, d.sectionGap + lines.length * 14 + 10 + fs * lh * 2);
    cursor.y += d.sectionGap;
    for (const s of lines) {
      text(page(cursor.page), s, m, cursor.y + size, size, font, c.accent);
      cursor.y += 14;
    }
    line(page(cursor.page), m, cursor.y + 2, PAGE.width - m);
    cursor.y += 11;
  }
  function row(left, right, key) {
    // Metadata and detail start together, then the following row waits for both.
    const leftWidth = width * 0.285,
      gap = 17,
      rightX = m + leftWidth + gap,
      rightWidth = width - leftWidth - gap;
    ensure(cursor, fs * lh * 3, key);
    const a = paint(left, m, leftWidth, cursor, key),
      b = paint(right, rightX, rightWidth, cursor, key);
    cursor = { ...later(a, b) };
    cursor.y += 8;
  }
  const block = (value, path, tab = "profile", options = {}) => ({
    value,
    path,
    tab,
    ...options,
  });
  for (const key of d.sectionOrder) {
    if (d.hiddenSections.includes(key)) continue;
    if (key === "summary" || key === "goal") {
      if (!p[key].trim()) continue;
      heading(key);
      cursor = paint([block(p[key], "profile." + key)], m, width, cursor, key);
    } else if (key === "experiences") {
      const values = data.experiences.filter((e) =>
        [
          e.company,
          e.role,
          e.period,
          e.description,
          ...e.bullets,
          ...e.results,
        ].some((v) => v.trim()),
      );
      if (!values.length) continue;
      heading(key);
      data.experiences.forEach((e, i) => {
        if (!values.includes(e)) return;
        const path = "experiences." + i,
          tab = "experience";
        row(
          [
            block(e.role, path + ".role", tab, {
              font: "bold",
              color: c.accent,
              size: fs - 0.3,
            }),
            block(e.period, path + ".period", tab, {
              size: fs - 0.6,
              after: 4,
            }),
          ],
          [
            block(e.company, path + ".company", tab, {
              font: "bold",
              size: fs + 0.2,
              after: 5,
            }),
            block(e.description, path + ".description", tab, {
              color: c.muted,
              size: fs - 0.25,
              after: 4,
            }),
            ...e.bullets.map((v) =>
              block(v, path + ".bullets", tab, { bullet: true }),
            ),
            ...(e.results.length
              ? [
                  block("Kết quả / đóng góp", path + ".results", tab, {
                    font: "bold",
                  }),
                  ...e.results.map((v) =>
                    block(v, path + ".results", tab, { bullet: true }),
                  ),
                ]
              : []),
          ],
          key,
        );
      });
    } else if (key === "projects") {
      const values = data.projects.filter((e) =>
        [e.name, e.role, e.period, e.scope, ...e.contributions].some((v) =>
          v.trim(),
        ),
      );
      if (!values.length) continue;
      heading(key);
      data.projects.forEach((e, i) => {
        if (!values.includes(e)) return;
        const path = "projects." + i,
          tab = "projects";
        row(
          [
            block(e.role, path + ".role", tab, {
              font: "bold",
              color: c.accent,
            }),
            block(e.period, path + ".period", tab, { size: fs - 0.6 }),
          ],
          [
            block(e.name, path + ".name", tab, { font: "bold" }),
            block(e.scope, path + ".scope", tab, { color: c.muted }),
            ...e.contributions.map((v) =>
              block(v, path + ".contributions", tab, { bullet: true }),
            ),
          ],
          key,
        );
      });
    } else if (key === "education") {
      const values = data.education.filter((e) =>
        [e.school, e.major, e.period, e.detail].some((v) => v.trim()),
      );
      if (!values.length) continue;
      heading(key);
      data.education.forEach((e, i) => {
        if (!values.includes(e)) return;
        const path = "education." + i,
          tab = "education";
        row(
          [
            block(e.major, path + ".major", tab, { color: c.accent }),
            block(e.period, path + ".period", tab, { size: fs - 0.6 }),
          ],
          [
            block(e.school, path + ".school", tab, { font: "bold" }),
            block(e.detail, path + ".detail", tab),
          ],
          key,
        );
      });
    } else if (Array.isArray(data[key]) && data[key].some((v) => v.trim())) {
      heading(key);
      const tab =
        key === "institutions"
          ? "projects"
          : key === "certificates"
            ? "education"
            : "skills";
      const blocks =
        key === "institutions"
          ? [block(data[key].filter((v) => v.trim()).join(" · "), key, tab)]
          : data[key].map((v) => block(v, key, tab, { bullet: true }));
      cursor = paint(blocks, m, width, cursor, key);
    }
  }
  for (let i = 0; i < pages.length; i++) {
    const footY = PAGE.height - m;
    line(pages[i], m, footY - 10, PAGE.width - m, rule, 0.4);
    const footer = isDraft(data)
      ? "Bản nháp · Nội dung nhiệm vụ cần xác nhận"
      : p.name;
    text(
      pages[i],
      wrapText(footer, width - 45, 6.7, "regular", metrics)[0] || "",
      m,
      footY,
      6.7,
      "regular",
      c.muted,
    );
    const label = `${i + 1} / ${pages.length}`;
    text(
      pages[i],
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
    template: "modern1",
    monochrome: !!d.monochrome,
  };
}
