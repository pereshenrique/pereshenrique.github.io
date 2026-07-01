// Router simples baseado em hash — sem dependências externas.

const routes = [
  { pattern: /^#\/dashboard$/, title: "Visão Geral", load: () => import("./dashboard.js") },
  { pattern: /^#\/workspace$/, title: "Clientes & Quadros", load: () => import("./workspace.js") },
  { pattern: /^#\/board\/([^/]+)$/, title: "Quadro", load: () => import("./board.js") },
  { pattern: /^#\/team$/, title: "Equipe & Permissões", load: () => import("./team.js") },
];

export function initRouter(context) {
  window.addEventListener("hashchange", () => renderRoute(context));
  renderRoute(context);
}

async function renderRoute(context) {
  const hash = window.location.hash || "#/dashboard";
  const match = routes.find((r) => r.pattern.test(hash));
  const viewRoot = document.getElementById("view-root");
  const pageTitle = document.getElementById("page-title");

  if (!match) {
    window.location.hash = "#/dashboard";
    return;
  }

  if (match.title === "Equipe & Permissões" && context.profile.role !== "admin") {
    viewRoot.innerHTML = `<div class="empty-state">Você não tem permissão para acessar esta página.</div>`;
    pageTitle.textContent = "Acesso restrito";
    return;
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const route = link.dataset.route;
    link.classList.toggle("active", route && hash.startsWith(route));
  });

  pageTitle.textContent = match.title;
  viewRoot.innerHTML = `<div class="empty-state">Carregando…</div>`;

  const params = match.pattern.exec(hash);
  try {
    const mod = await match.load();
    await mod.render(viewRoot, params, context);
  } catch (err) {
    console.error(err);
    viewRoot.innerHTML = `<div class="empty-state">Erro ao carregar: ${err.message || err}</div>`;
  }
}
