import { requireAuth, getMyProfile, signOut } from "./auth.js";
import { initRouter } from "./router.js";
import { initials } from "./ui.js";

const session = await requireAuth();
if (session) {
  const profile = await getMyProfile();

  document.getElementById("user-name").textContent = profile.full_name || profile.email;
  document.getElementById("user-avatar").textContent = initials(profile.full_name || profile.email);
  if (profile.role === "admin") {
    document.getElementById("team-nav-link").style.display = "flex";
  }

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut();
    window.location.href = "./index.html";
  });

  document.querySelectorAll(".nav-link[data-route]").forEach((link) => {
    link.addEventListener("click", () => {
      window.location.hash = link.dataset.route;
    });
  });

  initRouter({ profile });
}
