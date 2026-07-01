import { listProfiles, updateProfileRole } from "./api.js";
import { getSession } from "./auth.js";
import { escapeHtml } from "./ui.js";

export async function render(container) {
  const [profiles, session] = await Promise.all([listProfiles(), getSession()]);
  const myId = session.user.id;

  container.innerHTML = `
    <p class="small" style="margin-bottom:16px; max-width:640px;">
      Administradores têm acesso total a todos os clientes e quadros. Membros só enxergam os
      quadros aos quais foram adicionados — gerencie isso pelo botão <strong>Acesso</strong> em
      "Clientes &amp; Quadros".
    </p>
    <table class="data-table">
      <thead>
        <tr><th>Nome</th><th>E-mail</th><th>Papel</th><th></th></tr>
      </thead>
      <tbody id="team-tbody"></tbody>
    </table>
  `;

  const tbody = container.querySelector("#team-tbody");
  tbody.innerHTML = profiles
    .map(
      (p) => `
    <tr>
      <td>${escapeHtml(p.full_name || "—")}</td>
      <td>${escapeHtml(p.email)}</td>
      <td>
        <select class="role-select" data-user-id="${p.id}" ${p.id === myId ? "disabled" : ""}>
          <option value="member" ${p.role === "member" ? "selected" : ""}>Membro</option>
          <option value="admin" ${p.role === "admin" ? "selected" : ""}>Administrador</option>
        </select>
      </td>
      <td>${p.id === myId ? '<span class="small">Você</span>' : ""}</td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", async () => {
      const newRole = select.value;
      const label = newRole === "admin" ? "administrador" : "membro";
      if (!confirm(`Definir este usuário como ${label}?`)) {
        select.value = select.value === "admin" ? "member" : "admin";
        return;
      }
      try {
        await updateProfileRole(select.dataset.userId, newRole);
      } catch (err) {
        alert(err.message || "Erro ao atualizar papel.");
      }
    });
  });
}
