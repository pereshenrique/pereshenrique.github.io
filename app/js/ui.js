// Utilitários compartilhados entre as telas (modal, labels, formatação).

export const PRODUCTION_STATUS_LABELS = {
  nao_iniciado: "Não iniciado",
  em_producao: "Em produção",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  publicado: "Publicado",
};

export const PRIORITY_LABELS = { baixa: "Baixa", media: "Média", alta: "Alta" };

export const BOARD_TYPE_LABELS = { content: "Conteúdo", admin: "Administrativo", custom: "Projeto paralelo" };

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

export function deadlineBadge(dateStr) {
  if (!dateStr) return `<span class="badge badge-deadline-ok">Sem prazo</span>`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((d - today) / 86400000);
  const label = formatDate(dateStr);
  if (diffDays < 0) return `<span class="badge badge-deadline-overdue">Atrasado · ${label}</span>`;
  if (diffDays <= 2) return `<span class="badge badge-deadline-soon">${label}</span>`;
  return `<span class="badge badge-deadline-ok">${label}</span>`;
}

export function statusBadge(status) {
  return `<span class="badge badge-status-${status}">${PRODUCTION_STATUS_LABELS[status] || status}</span>`;
}

export function priorityBadge(priority) {
  return `<span class="badge badge-priority-${priority}">${PRIORITY_LABELS[priority] || priority}</span>`;
}

// ---------------------------------------------------------------------
// Modal genérico
// ---------------------------------------------------------------------
export function openModal(innerHtml) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-backdrop" id="modal-backdrop"><div class="modal">${innerHtml}</div></div>`;
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
  return root.querySelector(".modal");
}

export function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
}

export function toast(msg, isError = false) {
  // fallback simples enquanto não há um componente de toast dedicado
  if (isError) console.error(msg);
  alert(msg);
}
