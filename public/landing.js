import { renderSVG } from "./document.js";
// Landing is a responsive view of the exact A4 pages, never a separate template.
export function renderDocumentPages(
  layout,
  { editable = false, idPrefix = "web", pageClass = "sheet" } = {},
) {
  if (!layout?.pages?.length)
    throw Error("Cần dựng bố cục A4 trước khi xem trang web.");
  return layout.pages
    .map(
      (_, i) =>
        `<article class="${pageClass}" aria-label="CV trang ${i + 1}" data-page="${i + 1}">${renderSVG(layout, i, { editable, idPrefix })}</article>`,
    )
    .join("");
}
export function renderLandingView(
  data,
  { layout, staticMode = false, idPrefix = "landing" } = {},
) {
  return `<div class="landing-sheets" data-template="${layout?.template || ""}">${renderDocumentPages(layout, { editable: !staticMode, idPrefix })}</div>`;
}
