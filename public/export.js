import { escapeHtml as esc } from "./model.js";
import { renderSVG } from "./document.js";
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
export function buildHTML(
  data,
  layout,
  { fonts, landing = "", landingCSS = "", mode = "cv" } = {},
) {
  const sheets = layout.pages
    .map(
      (_, i) =>
        `<article class="sheet">${renderSVG(layout, i, { editable: false })}</article>`,
    )
    .join("");
  const clean = landing
    .replace(/\s(?:data-edit|data-group|tabindex|role|aria-label)="[^"]*"/g, "")
    .replace(/<div class="portrait-empty">[\s\S]*?<\/div>/g, "");
  const style = `${fontCSS(fonts, true)}\n${mode === "landing" ? landingCSS : ""}\n:root{--serif:'Atelier Serif',serif;--sans:'Atelier Sans',sans-serif}*{box-sizing:border-box}html{background:#e9ece9}body{margin:0;font-family:'Atelier Sans',sans-serif;color:#182c35}header.export-bar{max-width:794px;margin:24px auto 16px;display:flex;justify-content:space-between;font-size:12px}.sheet{width:210mm;height:297mm;background:#fff;margin:0 auto 24px;box-shadow:0 3px 20px #0001}.cv-page{display:block;width:100%;height:100%;stroke:none;stroke-width:0}.cv-page text{stroke:none;stroke-width:0}.print-only{display:${mode === "cv" ? "block" : "none"}}.landing-export{background:#f7f5ef}.landing-export h1{letter-spacing:0!important;font-synthesis:none}.landing-export [data-edit]{cursor:default}.landing-export .hero-actions .btn{display:none}.landing-export .portrait-empty{display:none}@media(max-width:820px){.sheet{width:100%;height:auto;aspect-ratio:210/297}header.export-bar{padding:0 16px}}@page{size:A4;margin:0}@media print{html,body{background:white!important;margin:0!important;padding:0!important}body>*:not(.print-only){display:none!important}.print-only{display:block!important}.sheet{width:210mm;height:297mm;margin:0!important;box-shadow:none;break-after:page;break-inside:avoid}.sheet:last-child{break-after:auto}.cv-page{width:100%;height:100%}}`;
  return (
    "<!doctype html>\n" +
    `<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(data.profile.name)} - CV</title><style>${style}</style></head><body data-theme="${data.design.theme}" data-font="${data.design.font}"><header class="export-bar"><span>${esc(data.profile.name)}</span><span>Hồ sơ ứng tuyển</span></header>${mode === "landing" ? `<main class="landing-export">${clean}</main>` : ""}<main class="print-only">${sheets}</main></body></html>`
  );
}
