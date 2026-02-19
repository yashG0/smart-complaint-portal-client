import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

if (isAllowed) {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("student");
  });
}
