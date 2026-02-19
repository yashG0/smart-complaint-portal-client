import { getAuthUser } from "../../services/authService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["department"] });

if (isAllowed) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userLabel = document.getElementById("departmentUserLabel");

  const authUser = getAuthUser();
  if (authUser?.email && userLabel) {
    userLabel.textContent = `Signed in as ${authUser.email}`;
  }

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("department");
  });
}
