import { escapeHtml as esc } from "./model.js";
import { renderDocumentPages } from "./landing.js";
export const FONT_FILES = {
  regular: "AtelierSans-Regular.ttf",
  bold: "AtelierSans-Bold.ttf",
  serif: "AtelierSerif-Regular.ttf",
};
export function fontCSS(fonts, inline = false) {
  return Object.entries(FONT_FILES)
    .map(
      ([key, file]) =>
        `@font-face{font-family:'${key === "serif" ? "Atelier Serif" : "Atelier Sans"}';src:url('${inline ? "data:font/ttf;base64," + fonts[key] : "./fonts/" + file}') format('truetype');font-weight:${key === "bold" ? 700 : 400};font-style:normal;font-display:block;}`,
    )
    .join("\n");
}
export function bytesBase64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 16384)
    s += String.fromCharCode(...bytes.subarray(i, i + 16384));
  return btoa(s);
}
export function buildHTML(data, layout, { fonts, mode = "cv" } = {}) {
  const sheets = renderDocumentPages(layout, {
    editable: false,
    idPrefix: "export",
  });
  const style = `${fontCSS(fonts, true)}
 *{box-sizing:border-box}html{background:#e9ece9}body{margin:0;font-family:'Atelier Sans',sans-serif;color:#182c35}header.export-bar{max-width:794px;margin:24px auto 16px;display:flex;justify-content:space-between;gap:16px;font-size:12px}.document-pages{display:block}.sheet{width:210mm;height:297mm;background:#fff;margin:0 auto 24px;box-shadow:0 3px 20px #0001}.cv-page{display:block;width:100%;height:100%;stroke:none;stroke-width:0}.cv-page text{stroke:none;stroke-width:0}@media(max-width:820px){.sheet{width:100%;height:auto;aspect-ratio:210/297}header.export-bar{padding:0 16px}}@page{size:A4;margin:0}@media print{html,body{background:white!important;margin:0!important;padding:0!important}header.export-bar{display:none!important}.sheet{width:210mm;height:297mm;margin:0!important;box-shadow:none;break-after:page;break-inside:avoid}.sheet:last-child{break-after:auto}.cv-page{width:100%;height:100%}}`;
  return (
    "<!doctype html>\n" +
    `<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(data.profile.name)} - CV</title><style>${style}</style></head><body data-theme="${data.design.theme}" data-font="${data.design.font}" data-template="${layout.template}"><header class="export-bar"><span>${esc(data.profile.name)}</span><span>${mode === "landing" ? "Hồ sơ ứng tuyển" : "CV A4"} · ${layout.pages.length} trang</span></header><main class="document-pages">${sheets}</main></body></html>`
  );
}
