import { getBoard, listStages, listTasksForBoard, createStage, renameStage, deleteStage, moveTask } from "./api.js";
import { openTaskModal } from "./taskModal.js";
import { escapeHtml, deadlineBadge, statusBadge, priorityBadge, initials, BOARD_TYPE_LABELS } from "./ui.js";

export async function render(container, params) {
  const boardId = params[1];
  const board = await getBoard(boardId);
  await renderBoard(container, board);
}

async function renderBoard(container, board) {
  const [stages, tasks] = await Promise.all([listStages(board.id), listTasksForBoard(board.id)]);

  container.innerHTML = `
    <div class="board-header">
      <div>
        <h2 style="margin:0;">${escapeHtml(board.name)}</h2>
        <div class="small">${BOARD_TYPE_LABELS[board.type] || board.type}${board.clients ? " · " + escapeHtml(board.clients.name) : ""}</div>
      </div>
      <a href="#/workspace" class="btn btn-ghost btn-sm">← Voltar</a>
    </div>
    <div class="kanban" id="kanban"></div>
  `;

  const kanban = container.querySelector("#kanban");
  kanban.innerHTML =
    stages.map((stage) => stageColumnHtml(stage, tasks.filter((t) => t.stage_id === stage.id))).join("") +
    `<div class="add-col-wrap">
      <button class="add-col-btn" id="add-stage-btn">+ Adicionar coluna</button>
    </div>`;

  wireColumnEvents(container, board, stages, tasks);
}

function stageColumnHtml(stage, stageTasks) {
  return `
    <div class="kanban-col" data-stage-id="${stage.id}">
      <div class="kanban-col-header">
        <div class="stage-name">
          <span class="stage-dot" style="background:${stage.color}"></span>
          <span class="stage-title-text" data-stage-id="${stage.id}">${escapeHtml(stage.name)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="kanban-count">${stageTasks.length}</span>
          <button class="icon-btn stage-delete-btn" data-stage-id="${stage.id}" title="Excluir coluna">✕</button>
        </div>
      </div>
      <div class="kanban-cards" data-stage-id="${stage.id}">
        ${stageTasks.map(cardHtml).join("")}
      </div>
      <button class="add-card-btn" data-stage-id="${stage.id}">+ Adicionar tarefa</button>
    </div>
  `;
}

function cardHtml(task) {
  return `
    <div class="card" draggable="true" data-task-id="${task.id}">
      <div class="card-title">${escapeHtml(task.title)}</div>
      <div class="card-meta">
        ${statusBadge(task.production_status)}
        ${priorityBadge(task.priority)}
        ${deadlineBadge(task.deadline)}
      </div>
      ${task.profiles ? `<div class="card-assignee"><span class="avatar" style="width:18px;height:18px;font-size:9px;">${initials(task.profiles.full_name)}</span>${escapeHtml(task.profiles.full_name)}</div>` : ""}
    </div>
  `;
}

function wireColumnEvents(container, board, stages, tasks) {
  const refresh = () => renderBoard(container, board);

  // Renomear etapa (clique no título)
  container.querySelectorAll(".stage-title-text").forEach((el) => {
    el.addEventListener("click", async () => {
      const newName = prompt("Novo nome da etapa:", el.textContent);
      if (newName && newName.trim()) {
        await renameStage(el.dataset.stageId, newName.trim());
        refresh();
      }
    });
  });

  // Excluir etapa
  container.querySelectorAll(".stage-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const stageTasks = tasks.filter((t) => t.stage_id === btn.dataset.stageId);
      const msg = stageTasks.length
        ? `Esta coluna tem ${stageTasks.length} tarefa(s), que também serão excluídas. Continuar?`
        : "Excluir esta coluna?";
      if (!confirm(msg)) return;
      await deleteStage(btn.dataset.stageId);
      refresh();
    });
  });

  // Adicionar coluna
  const addStageBtn = container.querySelector("#add-stage-btn");
  if (addStageBtn) {
    addStageBtn.addEventListener("click", async () => {
      const name = prompt("Nome da nova coluna:");
      if (name && name.trim()) {
        await createStage(board.id, name.trim());
        refresh();
      }
    });
  }

  // Adicionar tarefa
  container.querySelectorAll(".add-card-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await openTaskModal({ board, defaultStageId: btn.dataset.stageId, onSaved: refresh });
    });
  });

  // Abrir tarefa
  container.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      const task = tasks.find((t) => t.id === card.dataset.taskId);
      await openTaskModal({ board, task, onSaved: refresh });
    });
  });

  // Drag and drop
  let draggedId = null;
  container.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedId = card.dataset.taskId;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });

  container.querySelectorAll(".kanban-col").forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      if (!draggedId) return;
      const stageId = col.dataset.stageId;
      const targetTasks = tasks.filter((t) => t.stage_id === stageId && t.id !== draggedId);
      const position = targetTasks.length ? Math.max(...targetTasks.map((t) => t.position)) + 1 : 0;
      await moveTask(draggedId, stageId, position);
      draggedId = null;
      refresh();
    });
  });
}
