import { createTask, updateTask, deleteTask, listStages, listBoardMembers } from "./api.js";
import { openModal, closeModal, escapeHtml, PRODUCTION_STATUS_LABELS, PRIORITY_LABELS } from "./ui.js";

// Abre o modal de criação/edição de tarefa.
// board: { id, name, type } — obrigatório
// task: registro existente (edição) ou null (criação)
// defaultStageId: usado apenas na criação
// onSaved: chamado após salvar/excluir com sucesso, para o chamador atualizar a tela
export async function openTaskModal({ board, task = null, defaultStageId = null, onSaved }) {
  const [stages, members] = await Promise.all([listStages(board.id), listBoardMembers(board.id)]);

  const customFields = task?.custom_fields ? Object.entries(task.custom_fields) : [];

  const modal = openModal(`
    <h2>${task ? "Editar tarefa" : "Nova tarefa"}</h2>
    <form id="task-form">
      <div class="field">
        <label>Título</label>
        <input type="text" id="tf-title" required value="${escapeHtml(task?.title || "")}" />
      </div>
      <div class="field">
        <label>Descrição</label>
        <textarea id="tf-description" rows="3">${escapeHtml(task?.description || "")}</textarea>
      </div>
      <div class="field">
        <label>Etapa (pipeline)</label>
        <select id="tf-stage">
          ${stages.map((s) => `<option value="${s.id}" ${s.id === (task?.stage_id || defaultStageId) ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Prazo (deadline)</label>
        <input type="date" id="tf-deadline" value="${task?.deadline || ""}" />
      </div>
      <div class="field">
        <label>Status de produção</label>
        <select id="tf-production-status">
          ${Object.entries(PRODUCTION_STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${task?.production_status === k ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Prioridade</label>
        <select id="tf-priority">
          ${Object.entries(PRIORITY_LABELS).map(([k, v]) => `<option value="${k}" ${(task?.priority || "media") === k ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Responsável</label>
        <select id="tf-assignee">
          <option value="">— Ninguém —</option>
          ${members.map((m) => `<option value="${m.profiles.id}" ${task?.assignee_id === m.profiles.id ? "selected" : ""}>${escapeHtml(m.profiles.full_name || m.profiles.email)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Campos personalizados</label>
        <div class="custom-fields-list" id="cf-list">
          ${customFields.map(([k, v], i) => customFieldRowHtml(i, k, v)).join("")}
        </div>
        <button type="button" class="add-card-btn" id="cf-add">+ Adicionar campo (ex: Código do rótulo)</button>
      </div>
      <div class="modal-actions">
        <div class="left">
          ${task ? `<button type="button" class="btn btn-danger btn-sm" id="tf-delete">Excluir</button>` : ""}
        </div>
        <div class="right">
          <button type="button" class="btn btn-ghost" id="tf-cancel">Cancelar</button>
          <button type="submit" class="btn" id="tf-save">Salvar</button>
        </div>
      </div>
    </form>
  `);

  let cfCounter = customFields.length;

  function customFieldRowHtml(i, key = "", value = "") {
    return `<div class="custom-field-row" data-idx="${i}">
      <input type="text" class="cf-key" placeholder="Nome do campo" value="${escapeHtml(key)}" />
      <input type="text" class="cf-value" placeholder="Valor" value="${escapeHtml(value)}" />
      <button type="button" class="icon-btn cf-remove" title="Remover">✕</button>
    </div>`;
  }

  modal.querySelector("#cf-add").addEventListener("click", () => {
    const list = modal.querySelector("#cf-list");
    list.insertAdjacentHTML("beforeend", customFieldRowHtml(cfCounter++));
  });

  modal.querySelector("#cf-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("cf-remove")) {
      e.target.closest(".custom-field-row").remove();
    }
  });

  modal.querySelector("#tf-cancel").addEventListener("click", closeModal);

  if (task) {
    modal.querySelector("#tf-delete").addEventListener("click", async () => {
      if (!confirm("Excluir esta tarefa? Essa ação não pode ser desfeita.")) return;
      await deleteTask(task.id);
      closeModal();
      onSaved?.();
    });
  }

  modal.querySelector("#task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveBtn = modal.querySelector("#tf-save");
    saveBtn.disabled = true;
    try {
      const custom_fields = {};
      modal.querySelectorAll(".custom-field-row").forEach((row) => {
        const key = row.querySelector(".cf-key").value.trim();
        const value = row.querySelector(".cf-value").value.trim();
        if (key) custom_fields[key] = value;
      });

      const fields = {
        title: modal.querySelector("#tf-title").value.trim(),
        description: modal.querySelector("#tf-description").value.trim() || null,
        stage_id: modal.querySelector("#tf-stage").value,
        deadline: modal.querySelector("#tf-deadline").value || null,
        production_status: modal.querySelector("#tf-production-status").value,
        priority: modal.querySelector("#tf-priority").value,
        assignee_id: modal.querySelector("#tf-assignee").value || null,
        custom_fields,
      };

      if (task) {
        await updateTask(task.id, fields);
      } else {
        const { stage_id, ...rest } = fields;
        await createTask(board.id, stage_id, rest);
      }
      closeModal();
      onSaved?.();
    } catch (err) {
      alert(err.message || "Erro ao salvar tarefa.");
    } finally {
      saveBtn.disabled = false;
    }
  });
}
