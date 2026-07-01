import { listAllVisibleTasks } from "./api.js";
import { openTaskModal } from "./taskModal.js";
import {
  escapeHtml,
  deadlineBadge,
  statusBadge,
  priorityBadge,
  PRODUCTION_STATUS_LABELS,
  BOARD_TYPE_LABELS,
} from "./ui.js";

export async function render(container) {
  const tasks = await listAllVisibleTasks();
  const state = { client: "all", boardType: "all", status: "all", onlyOverdue: false };

  container.innerHTML = `
    <div class="toolbar">
      <select id="f-client"><option value="all">Todos os clientes</option></select>
      <select id="f-type">
        <option value="all">Todos os tipos</option>
        ${Object.entries(BOARD_TYPE_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
      </select>
      <select id="f-status">
        <option value="all">Todos os status</option>
        ${Object.entries(PRODUCTION_STATUS_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
      </select>
      <label style="display:flex; align-items:center; gap:6px; color: var(--muted); font-size:13px;">
        <input type="checkbox" id="f-overdue" /> Somente atrasadas
      </label>
    </div>
    <div id="table-wrap"></div>
  `;

  const clientSelect = container.querySelector("#f-client");
  const clientsSeen = new Map();
  tasks.forEach((t) => {
    const c = t.boards?.clients;
    if (c && !clientsSeen.has(c.id)) clientsSeen.set(c.id, c.name);
  });
  [...clientsSeen.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([id, name]) => {
      clientSelect.insertAdjacentHTML("beforeend", `<option value="${id}">${escapeHtml(name)}</option>`);
    });

  function applyFilters() {
    return tasks.filter((t) => {
      if (state.client !== "all" && t.boards?.clients?.id !== state.client) return false;
      if (state.boardType !== "all" && t.boards?.type !== state.boardType) return false;
      if (state.status !== "all" && t.production_status !== state.status) return false;
      if (state.onlyOverdue) {
        if (!t.deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(t.deadline + "T00:00:00") >= today) return false;
      }
      return true;
    });
  }

  function renderTable() {
    const filtered = applyFilters();
    const wrap = container.querySelector("#table-wrap");
    if (!filtered.length) {
      wrap.innerHTML = `<div class="empty-state">Nenhuma tarefa encontrada com esses filtros.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Cliente / Quadro</th>
            <th>Etapa</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Prazo</th>
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (t) => `
            <tr class="task-row" data-id="${t.id}" data-board-id="${t.board_id}">
              <td>${escapeHtml(t.title)}</td>
              <td>
                ${t.boards?.clients ? `<span class="client-dot" style="background:${t.boards.clients.color}"></span>${escapeHtml(t.boards.clients.name)}` : escapeHtml(t.boards?.name || "")}
                <div class="small">${BOARD_TYPE_LABELS[t.boards?.type] || ""}</div>
              </td>
              <td>${escapeHtml(t.stages?.name || "")}</td>
              <td>${statusBadge(t.production_status)}</td>
              <td>${priorityBadge(t.priority)}</td>
              <td>${deadlineBadge(t.deadline)}</td>
              <td>${escapeHtml(t.profiles?.full_name || "—")}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll(".task-row").forEach((row) => {
      row.addEventListener("click", async () => {
        const task = tasks.find((t) => t.id === row.dataset.id);
        await openTaskModal({
          board: { id: task.board_id, name: task.boards?.name, type: task.boards?.type },
          task,
          onSaved: () => render(container),
        });
      });
    });
  }

  container.querySelector("#f-client").addEventListener("change", (e) => {
    state.client = e.target.value;
    renderTable();
  });
  container.querySelector("#f-type").addEventListener("change", (e) => {
    state.boardType = e.target.value;
    renderTable();
  });
  container.querySelector("#f-status").addEventListener("change", (e) => {
    state.status = e.target.value;
    renderTable();
  });
  container.querySelector("#f-overdue").addEventListener("change", (e) => {
    state.onlyOverdue = e.target.checked;
    renderTable();
  });

  renderTable();
}
