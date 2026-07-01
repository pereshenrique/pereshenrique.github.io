import {
  listClients,
  listBoards,
  createClientWithBoard,
  createBoard,
  archiveClient,
  archiveBoard,
  listBoardMembers,
  addBoardMember,
  removeBoardMember,
  listProfiles,
} from "./api.js";
import { openModal, closeModal, escapeHtml, BOARD_TYPE_LABELS } from "./ui.js";
import { getMyProfile } from "./auth.js";

export async function render(container) {
  const [clients, boards, me] = await Promise.all([listClients(), listBoards(), getMyProfile()]);
  const isAdmin = me.role === "admin";

  const boardsByClient = new Map();
  const generalBoards = [];
  boards.forEach((b) => {
    if (b.client_id) {
      if (!boardsByClient.has(b.client_id)) boardsByClient.set(b.client_id, []);
      boardsByClient.get(b.client_id).push(b);
    } else {
      generalBoards.push(b);
    }
  });

  container.innerHTML = `
    <div class="board-header">
      <h2 style="margin:0; font-size:16px;">Clientes</h2>
      ${isAdmin ? `<button class="btn btn-sm" id="new-client-btn">+ Novo cliente</button>` : ""}
    </div>
    <div class="grid-cards" id="clients-grid" style="margin-bottom:32px;"></div>

    <div class="board-header">
      <h2 style="margin:0; font-size:16px;">Administrativo &amp; projetos gerais</h2>
      ${isAdmin ? `<button class="btn btn-sm" id="new-board-btn">+ Novo quadro</button>` : ""}
    </div>
    <div class="grid-cards" id="general-grid"></div>
  `;

  const clientsGrid = container.querySelector("#clients-grid");
  if (!clients.length) {
    clientsGrid.innerHTML = `<div class="empty-state">Nenhum cliente cadastrado ainda.</div>`;
  } else {
    clientsGrid.innerHTML = clients
      .map((c) => {
        const cBoards = boardsByClient.get(c.id) || [];
        return `
        <div class="entity-card">
          <h3><span class="client-dot" style="background:${c.color}"></span>${escapeHtml(c.name)}</h3>
          <div class="sub">${cBoards.length} quadro(s)</div>
          ${cBoards.map((b) => boardLineHtml(b)).join("")}
          <div class="row-actions">
            ${isAdmin ? `<button class="btn btn-ghost btn-sm add-parallel-btn" data-client-id="${c.id}" data-client-name="${escapeHtml(c.name)}">+ Projeto paralelo</button>` : ""}
            ${isAdmin ? `<button class="btn btn-ghost btn-sm archive-client-btn" data-client-id="${c.id}">Arquivar</button>` : ""}
          </div>
        </div>`;
      })
      .join("");
  }

  const generalGrid = container.querySelector("#general-grid");
  if (!generalBoards.length) {
    generalGrid.innerHTML = `<div class="empty-state">Nenhum quadro administrativo criado ainda.</div>`;
  } else {
    generalGrid.innerHTML = generalBoards
      .map(
        (b) => `
        <div class="entity-card">
          <h3>${escapeHtml(b.name)}</h3>
          <div class="sub">${BOARD_TYPE_LABELS[b.type] || b.type}</div>
          <div class="row-actions">
            <a class="btn btn-sm" href="#/board/${b.id}">Abrir</a>
            ${isAdmin ? `<button class="btn btn-ghost btn-sm manage-access-btn" data-board-id="${b.id}" data-board-name="${escapeHtml(b.name)}">Acesso</button>` : ""}
            ${isAdmin ? `<button class="btn btn-ghost btn-sm archive-board-btn" data-board-id="${b.id}">Arquivar</button>` : ""}
          </div>
        </div>`
      )
      .join("");
  }

  function boardLineHtml(b) {
    return `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-top:1px solid var(--border); font-size:13px;">
      <span>${escapeHtml(b.name)} <span class="small">(${BOARD_TYPE_LABELS[b.type] || b.type})</span></span>
      <span style="display:flex; gap:6px;">
        <a class="btn btn-ghost btn-sm" href="#/board/${b.id}" style="padding:4px 10px;">Abrir</a>
        ${isAdmin ? `<button class="btn btn-ghost btn-sm manage-access-btn" data-board-id="${b.id}" data-board-name="${escapeHtml(b.name)}" style="padding:4px 10px;">Acesso</button>` : ""}
      </span>
    </div>`;
  }

  if (isAdmin) {
    container.querySelector("#new-client-btn")?.addEventListener("click", () => openNewClientModal(() => render(container)));
    container.querySelector("#new-board-btn")?.addEventListener("click", () => openNewBoardModal(null, () => render(container)));

    container.querySelectorAll(".add-parallel-btn").forEach((btn) =>
      btn.addEventListener("click", () =>
        openNewBoardModal({ id: btn.dataset.clientId, name: btn.dataset.clientName }, () => render(container))
      )
    );

    container.querySelectorAll(".archive-client-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Arquivar este cliente? Os quadros associados deixarão de aparecer na lista.")) return;
        await archiveClient(btn.dataset.clientId);
        render(container);
      })
    );

    container.querySelectorAll(".archive-board-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Arquivar este quadro?")) return;
        await archiveBoard(btn.dataset.boardId);
        render(container);
      })
    );

    container.querySelectorAll(".manage-access-btn").forEach((btn) =>
      btn.addEventListener("click", () => openAccessModal(btn.dataset.boardId, btn.dataset.boardName))
    );
  }
}

function openNewClientModal(onDone) {
  const modal = openModal(`
    <h2>Novo cliente</h2>
    <form id="new-client-form">
      <div class="field">
        <label>Nome do cliente</label>
        <input type="text" id="nc-name" required />
      </div>
      <div class="field">
        <label>Cor (identificação visual)</label>
        <input type="color" id="nc-color" value="#F7C948" />
      </div>
      <p class="small">Um quadro de conteúdo com o pipeline padrão (Briefing → Publicado) será criado automaticamente.</p>
      <div class="modal-actions">
        <div class="right">
          <button type="button" class="btn btn-ghost" id="nc-cancel">Cancelar</button>
          <button type="submit" class="btn">Criar</button>
        </div>
      </div>
    </form>
  `);
  modal.querySelector("#nc-cancel").addEventListener("click", closeModal);
  modal.querySelector("#new-client-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await createClientWithBoard({
        name: modal.querySelector("#nc-name").value.trim(),
        color: modal.querySelector("#nc-color").value,
      });
      closeModal();
      onDone();
    } catch (err) {
      alert(err.message || "Erro ao criar cliente.");
    }
  });
}

function openNewBoardModal(client, onDone) {
  const modal = openModal(`
    <h2>${client ? `Novo projeto paralelo — ${escapeHtml(client.name)}` : "Novo quadro administrativo"}</h2>
    <form id="new-board-form">
      <div class="field">
        <label>Nome do quadro</label>
        <input type="text" id="nb-name" required placeholder="${client ? "Ex: Criação de Rótulos" : "Ex: Financeiro / Administrativo"}" />
      </div>
      ${
        client
          ? `<input type="hidden" id="nb-type" value="custom" /><input type="hidden" id="nb-client-id" value="${client.id}" />`
          : `<div class="field">
              <label>Tipo</label>
              <select id="nb-type">
                <option value="admin">Administrativo</option>
                <option value="custom">Projeto paralelo</option>
              </select>
            </div>`
      }
      <div class="modal-actions">
        <div class="right">
          <button type="button" class="btn btn-ghost" id="nb-cancel">Cancelar</button>
          <button type="submit" class="btn">Criar</button>
        </div>
      </div>
    </form>
  `);
  modal.querySelector("#nb-cancel").addEventListener("click", closeModal);
  modal.querySelector("#new-board-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await createBoard({
        name: modal.querySelector("#nb-name").value.trim(),
        type: modal.querySelector("#nb-type").value,
        client_id: client ? client.id : null,
      });
      closeModal();
      onDone();
    } catch (err) {
      alert(err.message || "Erro ao criar quadro.");
    }
  });
}

async function openAccessModal(boardId, boardName) {
  const [profiles, members] = await Promise.all([listProfiles(), listBoardMembers(boardId)]);
  const memberIds = new Set(members.map((m) => m.user_id));

  const modal = openModal(`
    <h2>Acesso — ${escapeHtml(boardName)}</h2>
    <p class="small">Marque quem, além dos administradores, pode ver e editar este quadro.</p>
    <div class="checkbox-list" id="access-list">
      ${profiles
        .map(
          (p) => `
        <label class="checkbox-row">
          <input type="checkbox" data-user-id="${p.id}" ${memberIds.has(p.id) ? "checked" : ""} ${p.role === "admin" ? "disabled" : ""} />
          ${escapeHtml(p.full_name || p.email)} ${p.role === "admin" ? '<span class="small">(admin — acesso total)</span>' : ""}
        </label>`
        )
        .join("")}
    </div>
    <div class="modal-actions">
      <div class="right">
        <button type="button" class="btn" id="access-close">Concluído</button>
      </div>
    </div>
  `);

  modal.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", async () => {
      const userId = cb.dataset.userId;
      try {
        if (cb.checked) await addBoardMember(boardId, userId);
        else await removeBoardMember(boardId, userId);
      } catch (err) {
        alert(err.message || "Erro ao atualizar acesso.");
        cb.checked = !cb.checked;
      }
    });
  });

  modal.querySelector("#access-close").addEventListener("click", closeModal);
}
