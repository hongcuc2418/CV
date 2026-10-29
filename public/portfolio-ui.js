import { escapeHtml as esc } from "./model.js";
import {
  activeCV,
  addCV,
  editCV,
  selectCV,
  addSnapshot,
  restoreSnapshot,
  removeSnapshot,
  archiveCV,
  recoverCV,
  parseBackup,
  diffCVs,
} from "./workspace.js";
const date = (v) =>
  new Date(v).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const kinds = {
  initial: "Ban đầu",
  auto: "Tự lưu",
  manual: "Đặt tên",
  restore: "Khôi phục",
  import: "Nhập",
  reset: "Đặt lại",
  metadata: "Đổi đích ứng tuyển",
};

export function createPortfolioUI({
  getWorkspace,
  ensureSaved,
  onCommit,
  onImport,
  onBackupAll,
  onImportRequest,
  notify,
}) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
 <dialog id="cvManager" class="cv-manager"><div class="dialog-heading"><div><span class="panel-eyebrow">MỖI CƠ HỘI · MỘT HỒ SƠ RIÊNG</span><h2>CV của tôi</h2></div><button class="tool" data-cv-close="cvManager" aria-label="Đóng quản lý CV">×</button></div>
 <div class="cv-manager-tools"><input id="cvSearch" aria-label="Tìm hồ sơ" placeholder="Tìm theo tên, trường, vị trí…" maxlength="150"><select id="cvFilter" aria-label="Lọc hồ sơ"><option value="active">Đang dùng</option><option value="archived">Đã lưu trữ</option></select><button class="primary" data-cv-action="new">+ Tạo CV</button></div>
 <div class="cv-manager-body"><nav id="cvList" aria-label="Danh sách hồ sơ"></nav><section id="cvDetails" aria-label="Chi tiết và lịch sử"></section></div>
 <footer class="cv-manager-footer"><p>Tối đa 30 CV · 20 mốc tự lưu (tối đa 1 mốc/phút) và 40 mốc được giữ / CV. Dữ liệu lưu trên trình duyệt này.</p><div><button data-cv-action="backupAll">Sao lưu tất cả</button><button data-cv-action="import">Nhập bản sao lưu</button></div></footer></dialog>
 <dialog id="cvMeta" class="cv-meta"><form id="cvMetaForm"><div class="dialog-heading"><h2 id="cvMetaTitle"></h2><button type="button" class="tool" data-cv-close="cvMeta" aria-label="Đóng thông tin hồ sơ">×</button></div>
 <label class="form-field"><span>Tên hồ sơ / bản ứng tuyển</span><input id="cvMetaName" required maxlength="120" autocomplete="off"></label>
 <label class="form-field"><span>Trường / đơn vị ứng tuyển</span><input id="cvMetaSchool" maxlength="200" autocomplete="off"><small>Chỉ để phân biệt hồ sơ, không tự thêm vào kinh nghiệm.</small></label>
 <label class="form-field"><span>Vị trí ứng tuyển</span><input id="cvMetaPosition" maxlength="6000" autocomplete="off"><small>Được dùng làm vị trí ở đầu CV này.</small></label><p id="cvMetaHelp" class="form-help"></p><div class="dialog-buttons"><button type="button" data-cv-close="cvMeta">Để sau</button><button id="cvMetaSubmit" class="primary" type="submit">Lưu</button></div></form></dialog>
 <dialog id="cvSnapshot"><form id="cvSnapshotForm"><h2>Đặt tên phiên bản</h2><p class="dialog-copy">Lưu nguyên nội dung, thiết kế và đích ứng tuyển hiện tại để so sánh hoặc khôi phục sau.</p><label class="form-field"><span>Tên phiên bản</span><input id="cvSnapshotName" required maxlength="120" autocomplete="off" placeholder="Ví dụ: Đã rà soát trước khi gửi VLU"></label><div class="dialog-buttons"><button type="button" data-cv-close="cvSnapshot">Hủy</button><button class="primary" type="submit">Lưu phiên bản</button></div></form></dialog>
 <dialog id="cvCompare" class="cv-compare"><div class="dialog-heading"><div><span class="panel-eyebrow">ĐỐI CHIẾU NỘI DUNG & THIẾT KẾ</span><h2>So sánh phiên bản</h2></div><button class="tool" data-cv-close="cvCompare" aria-label="Đóng so sánh">×</button></div><div class="compare-pickers"><fieldset><legend>Bản A</legend><select id="cvCompareA" aria-label="Hồ sơ bản A"></select><select id="cvVersionA" aria-label="Phiên bản A"></select></fieldset><fieldset><legend>Bản B</legend><select id="cvCompareB" aria-label="Hồ sơ bản B"></select><select id="cvVersionB" aria-label="Phiên bản B"></select></fieldset></div><p id="cvDiffSummary" role="status"></p><div id="cvDiff"></div></dialog>
 <dialog id="cvConfirm"><h2 id="cvConfirmTitle"></h2><p id="cvConfirmCopy" class="dialog-copy"></p><div class="dialog-buttons"><button data-cv-close="cvConfirm">Hủy</button><button id="cvConfirmGo" class="primary">Xác nhận</button></div></dialog>`,
  );
  const $ = (s) => document.querySelector(s);
  let focusId = null,
    metaMode = "new",
    metaSource = null,
    pendingConfirm = null,
    busy = false;
  const chosen = () =>
    getWorkspace().cvs.find((cv) => cv.id === focusId) ||
    activeCV(getWorkspace());
  async function run(
    factory,
    { message = "Đã cập nhật hồ sơ.", activate = false } = {},
  ) {
    if (busy || !ensureSaved()) return false;
    busy = true;
    try {
      const next = factory(getWorkspace());
      if (!(await onCommit(next))) return false;
      if (activate) {
        focusId = next.activeId;
        $("#cvFilter").value = "active";
      }
      render();
      notify(message);
      return true;
    } catch (e) {
      notify(e.message);
      return false;
    } finally {
      busy = false;
    }
  }
  function renderStrip() {
    const ws = getWorkspace(),
      current = activeCV(ws),
      select = $("#cvSwitcher");
    $("#cvCount").textContent = ws.cvs.filter((cv) => !cv.archivedAt).length;
    select.innerHTML = ws.cvs
      .filter((cv) => !cv.archivedAt)
      .map(
        (cv) =>
          `<option value="${cv.id}">${esc(cv.name)}${cv.school ? " · " + esc(cv.school) : ""}</option>`,
      )
      .join("");
    select.value = ws.activeId;
    $("#cvTarget").textContent =
      [current.school, current.data.profile.role].filter(Boolean).join(" · ") ||
      "Chưa thêm đích ứng tuyển";
  }
  function renderList() {
    const ws = getWorkspace(),
      q = $("#cvSearch").value.toLocaleLowerCase("vi").trim(),
      archived = $("#cvFilter").value === "archived";
    const cvs = ws.cvs.filter(
      (cv) =>
        Boolean(cv.archivedAt) === archived &&
        [cv.name, cv.school, cv.data.profile.role]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(q),
    );
    $("#cvList").innerHTML = cvs.length
      ? cvs
          .map(
            (cv) =>
              `<button class="cv-card ${chosen().id === cv.id ? "selected" : ""}" data-cv-focus="${cv.id}" aria-pressed="${chosen().id === cv.id}"><span class="cv-card-kicker">${cv.id === ws.activeId ? "ĐANG CHỈNH SỬA" : cv.archivedAt ? "ĐÃ LƯU TRỮ" : "HỒ SƠ ỨNG TUYỂN"}</span><b>${esc(cv.name)}</b><span>${esc(cv.school || "Chưa ghi đơn vị")}</span><small>${esc(cv.data.profile.role || "Chưa ghi vị trí")}</small><time>${date(cv.updatedAt)}</time></button>`,
          )
          .join("")
      : '<p class="cv-empty">Không có hồ sơ phù hợp.</p>';
  }
  function render() {
    renderStrip();
    renderList();
    const cv = chosen(),
      ws = getWorkspace();
    if (Boolean(cv.archivedAt) !== ($("#cvFilter").value === "archived")) {
      $("#cvDetails").innerHTML =
        '<div class="cv-empty">Chưa có hồ sơ trong danh sách này. Hồ sơ được lưu trữ vẫn giữ nội dung và lịch sử để khôi phục sau.</div>';
      return;
    }
    $("#cvDetails").innerHTML =
      `<div class="cv-detail-head"><span class="panel-eyebrow">${cv.archivedAt ? "HỒ SƠ ĐÃ LƯU TRỮ" : "HỒ SƠ ĐỘC LẬP"}</span><h3>${esc(cv.name)}</h3><p>${esc([cv.school, cv.data.profile.role].filter(Boolean).join(" · ") || "Bổ sung đích ứng tuyển để dễ phân biệt.")}</p></div><div class="cv-detail-actions">${cv.archivedAt ? '<button class="primary" data-cv-action="recover">Khôi phục & mở CV</button>' : `<button class="primary" data-cv-action="open">Mở CV này</button><button data-cv-action="duplicate">Nhân bản</button><button data-cv-action="edit">Đổi tên / vị trí</button><button data-cv-action="snapshot">Lưu phiên bản</button><button data-cv-action="archive" ${ws.cvs.filter((c) => !c.archivedAt).length < 2 ? "disabled" : ""}>Lưu trữ</button>`}<button data-cv-action="compare">So sánh CV</button></div><div class="cv-history-title"><div><h3>Lịch sử phiên bản</h3><p>Các mốc thuộc riêng hồ sơ này. Khôi phục không ảnh hưởng CV khác.</p></div><span>${cv.snapshots.length} mốc</span></div><div class="cv-snapshots">${
        [...cv.snapshots]
          .reverse()
          .map(
            (s) =>
              `<article class="cv-snapshot-row"><div><span class="cv-kind">${kinds[s.kind]}</span><b>${esc(s.name)}</b><small>${date(s.createdAt)}</small></div><div><button data-cv-history="compare" data-snapshot-id="${s.id}">So sánh</button>${!cv.archivedAt ? `<button data-cv-history="restore" data-snapshot-id="${s.id}">Khôi phục</button>` : ""}<button class="cv-subtle" data-cv-history="remove" data-snapshot-id="${s.id}" aria-label="Xóa mốc ${esc(s.name)}">×</button></div></article>`,
          )
          .join("") ||
        '<p class="cv-empty">Chưa có mốc lưu. Hãy lưu phiên bản sau khi rà soát.</p>'
      }</div>`;
  }
  function openMeta(mode) {
    metaMode = mode;
    const cv = chosen();
    metaSource = cv.id;
    $("#cvMetaTitle").textContent = {
      new: "Tạo CV từ mẫu",
      duplicate: "Nhân bản hồ sơ",
      edit: "Đặt tên & đích ứng tuyển",
    }[mode];
    $("#cvMetaName").value =
      mode === "new"
        ? "CV ứng tuyển mới"
        : mode === "duplicate"
          ? cv.name.slice(0, 110) + " · Bản sao"
          : cv.name;
    $("#cvMetaSchool").value = mode === "new" ? "" : cv.school;
    $("#cvMetaPosition").value =
      mode === "new" ? "Chuyên viên Phòng Đào tạo" : cv.data.profile.role;
    $("#cvMetaHelp").textContent =
      mode === "new"
        ? "Tạo hồ sơ từ dữ liệu mẫu ban đầu. Dùng Nhân bản nếu muốn giữ nội dung đã chỉnh."
        : mode === "duplicate"
          ? "Tạo CV độc lập, giữ nội dung và thiết kế. Hồ sơ nguồn không thay đổi. Lịch sử mới bắt đầu từ bản sao này."
          : "Tên hồ sơ dùng trong danh sách. Khi đổi trường/vị trí, app giữ một mốc trước thay đổi.";
    $("#cvMetaSubmit").textContent =
      mode === "edit" ? "Lưu thông tin" : "Tạo & mở CV";
    $("#cvMeta").showModal();
    $("#cvMetaName").focus();
  }
  function confirm(title, copy, action, label = "Xác nhận") {
    $("#cvConfirmTitle").textContent = title;
    $("#cvConfirmCopy").textContent = copy;
    $("#cvConfirmGo").textContent = label;
    pendingConfirm = action;
    $("#cvConfirm").showModal();
  }
  function versions(side, selected = "current") {
    const cv = getWorkspace().cvs.find(
      (cv) => cv.id === $("#cvCompare" + side).value,
    );
    $("#cvVersion" + side).innerHTML =
      '<option value="current">Bản hiện tại</option>' +
      [...cv.snapshots]
        .reverse()
        .map(
          (s) =>
            `<option value="${s.id}">${esc(s.name)} · ${date(s.createdAt)}</option>`,
        )
        .join("");
    $("#cvVersion" + side).value = cv.snapshots.some((s) => s.id === selected)
      ? selected
      : "current";
  }
  function compareEntry(side) {
    const cv = getWorkspace().cvs.find(
        (cv) => cv.id === $("#cvCompare" + side).value,
      ),
      version = $("#cvVersion" + side).value;
    return version === "current"
      ? cv
      : cv.snapshots.find((s) => s.id === version);
  }
  const display = (v) =>
    v.length > 14000
      ? v.slice(0, 14000) +
        "\n… Chỉ hiển thị 14.000 ký tự đầu; dữ liệu gốc vẫn đầy đủ trong sao lưu."
      : v || "—";
  function renderDiff() {
    const diffs = diffCVs(compareEntry("A"), compareEntry("B"));
    $("#cvDiffSummary").textContent = diffs.length
      ? `${diffs.length} trường khác nhau. Đọc từ Bản A sang Bản B; bảng chỉ hiển thị khác biệt.`
      : "Hai bản có cùng nội dung và thiết kế.";
    $("#cvDiff").innerHTML = diffs.length
      ? `<table class="cv-diff-table"><thead><tr><th>Thông tin</th><th>Bản A</th><th>Bản B</th></tr></thead><tbody>${diffs.map((d) => `<tr><th>${esc(d.label)}</th>${[d.before, d.after].map((v) => `<td>${d.photo ? (v ? `<img class="diff-photo" src="${esc(v)}" alt="Ảnh của phiên bản"><span>Có ảnh</span>` : "Không có ảnh") : `<pre>${esc(display(v))}</pre>`}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      : '<div class="cv-no-diff">Không có thay đổi cần đối chiếu.</div>';
  }
  function openCompare(snapshotId = null) {
    if (!ensureSaved()) return;
    const ws = getWorkspace(),
      cv = chosen(),
      other = ws.cvs.find((c) => c.id !== cv.id && !c.archivedAt);
    for (const side of ["A", "B"])
      $("#cvCompare" + side).innerHTML = ws.cvs
        .map(
          (c) =>
            `<option value="${c.id}">${esc(c.name)}${c.archivedAt ? " · lưu trữ" : ""}</option>`,
        )
        .join("");
    $("#cvCompareA").value = cv.id;
    $("#cvCompareB").value = snapshotId ? cv.id : other?.id || cv.id;
    versions("A");
    versions("B", snapshotId || "current");
    renderDiff();
    $("#cvCompare").showModal();
  }
  async function open() {
    ensureSaved();
    focusId = getWorkspace().activeId;
    $("#cvFilter").value = "active";
    $("#cvSearch").value = "";
    render();
    $("#cvManager").showModal();
  }
  document.addEventListener("click", async (e) => {
    const close = e.target.closest("[data-cv-close]");
    if (close) {
      $("#" + close.dataset.cvClose).close();
      return;
    }
    const focus = e.target.closest("[data-cv-focus]");
    if (focus) {
      focusId = focus.dataset.cvFocus;
      render();
      return;
    }
    const h = e.target.closest("[data-cv-history]");
    if (h) {
      const cv = chosen(),
        s = cv.snapshots.find((s) => s.id === h.dataset.snapshotId);
      if (!s) return;
      if (h.dataset.cvHistory === "compare") openCompare(s.id);
      if (h.dataset.cvHistory === "restore")
        confirm(
          "Khôi phục phiên bản?",
          `Áp dụng “${s.name}” vào “${cv.name}”. App lưu một mốc hiện trạng trước khôi phục; các CV khác giữ nguyên.`,
          () =>
            run((ws) => restoreSnapshot(ws, cv.id, s.id), {
              message: "Đã khôi phục phiên bản. Mốc trước khôi phục được giữ.",
            }),
          "Khôi phục CV này",
        );
      if (h.dataset.cvHistory === "remove")
        confirm(
          "Xóa mốc lịch sử?",
          `Xóa mốc “${s.name}”. Nội dung CV hiện tại không đổi. Mốc bị xóa chỉ khôi phục được từ tệp sao lưu đã tải.`,
          () =>
            run((ws) => removeSnapshot(ws, cv.id, s.id), {
              message: "Đã xóa mốc lịch sử.",
            }),
          "Xóa mốc",
        );
      return;
    }
    const a = e.target.closest("[data-cv-action]")?.dataset.cvAction;
    if (!a) return;
    if (a === "new" || a === "duplicate" || a === "edit") {
      if (ensureSaved()) openMeta(a);
    }
    if (a === "open") {
      if (
        await run((ws) => selectCV(ws, chosen().id), {
          message: "Đã mở hồ sơ.",
          activate: true,
        })
      )
        $("#cvManager").close();
    }
    if (a === "snapshot") {
      if (ensureSaved()) {
        $("#cvSnapshotName").value =
          "Bản rà soát · " + new Date().toLocaleDateString("vi-VN");
        $("#cvSnapshot").showModal();
      }
    }
    if (a === "compare") openCompare();
    if (a === "archive")
      await run((ws) => archiveCV(ws, chosen().id), {
        message:
          "Đã lưu trữ hồ sơ. Có thể khôi phục trong danh sách Đã lưu trữ.",
        activate: true,
      });
    if (a === "recover")
      await run((ws) => recoverCV(ws, chosen().id), {
        message: "Đã khôi phục hồ sơ lưu trữ.",
        activate: true,
      });
    if (a === "backupAll") onBackupAll();
    if (a === "import") onImportRequest();
  });
  $("#cvSearch").oninput = renderList;
  $("#cvFilter").onchange = () => {
    const archived = $("#cvFilter").value === "archived";
    focusId =
      getWorkspace().cvs.find((cv) => Boolean(cv.archivedAt) === archived)
        ?.id || getWorkspace().activeId;
    render();
  };
  $("#cvMetaForm").onsubmit = async (e) => {
    e.preventDefault();
    const fields = {
      name: $("#cvMetaName").value,
      school: $("#cvMetaSchool").value,
      position: $("#cvMetaPosition").value,
    };
    const ok = await run(
      (ws) =>
        metaMode === "edit"
          ? editCV(ws, metaSource, fields)
          : addCV(ws, {
              ...fields,
              sourceId: metaMode === "duplicate" ? metaSource : null,
            }),
      {
        message:
          metaMode === "edit"
            ? "Đã cập nhật đích ứng tuyển."
            : "Đã tạo hồ sơ độc lập.",
        activate: metaMode !== "edit",
      },
    );
    if (ok) $("#cvMeta").close();
  };
  $("#cvSnapshotForm").onsubmit = async (e) => {
    e.preventDefault();
    if (
      await run(
        (ws) => addSnapshot(ws, chosen().id, $("#cvSnapshotName").value),
        { message: "Đã lưu phiên bản có tên." },
      )
    )
      $("#cvSnapshot").close();
  };
  $("#cvConfirmGo").onclick = async () => {
    if (busy || !pendingConfirm) return;
    $("#cvConfirmGo").disabled = true;
    try {
      if (await pendingConfirm()) $("#cvConfirm").close();
    } catch (e) {
      notify(e.message);
    } finally {
      $("#cvConfirmGo").disabled = false;
    }
  };
  for (const side of ["A", "B"]) {
    $("#cvCompare" + side).onchange = () => {
      versions(side);
      renderDiff();
    };
    $("#cvVersion" + side).onchange = renderDiff;
  }
  $("#cvSwitcher").onchange = async (e) => {
    const next = e.target.value;
    await run((ws) => selectCV(ws, next), {
      message: "Đã chuyển CV. Các hồ sơ khác giữ nguyên.",
      activate: true,
    });
    renderStrip();
  };
  return {
    open,
    render,
    renderStrip,
    previewImport(raw) {
      const incoming = parseBackup(raw);
      confirm(
        "Nhập bản sao lưu?",
        `Tệp có ${incoming.cvs.length} hồ sơ, gồm ${incoming.cvs.filter((c) => c.archivedAt).length} hồ sơ lưu trữ. Các hồ sơ được thêm thành bản sao độc lập, kèm lịch sử; không ghi đè CV hiện có.`,
        async () => {
          if (busy) return false;
          busy = true;
          try {
            if (await onImport(raw)) {
              focusId = getWorkspace().activeId;
              render();
              notify("Đã nhập bản sao lưu thành các hồ sơ độc lập.");
              return true;
            }
            return false;
          } finally {
            busy = false;
          }
        },
        "Nhập & mở bản sao",
      );
    },
  };
}
