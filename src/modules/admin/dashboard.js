import { getAuthUser } from "../../services/authService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

if (isAllowed) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userLabel = document.getElementById("adminUserLabel");

  const authUser = getAuthUser();
  if (authUser?.email && userLabel) {
    userLabel.textContent = `Signed in as ${authUser.email}`;
  }

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("admin");
  });
}
