import { getAuthUser } from "../../services/authService.js";
import { getDepartments } from "../../services/adminService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

let allDepartments = [];

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function setError(message) {
  const errorEl = document.getElementById("errorMessage");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function renderDepartments() {
  const tableBody = document.getElementById("departmentsTableBody");
  const countEl = document.getElementById("deptCount");

  if (!tableBody) {
    return;
  }

  if (!allDepartments.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">No departments registered yet.</td>
      </tr>
    `;
    if (countEl) countEl.textContent = "0";
    return;
  }

  if (countEl) countEl.textContent = String(allDepartments.length);

  const rows = allDepartments
    .map((dept) => {
      return `
        <tr>
          <td>${dept.name}</td>
          <td>${dept.organization_name}</td>
          <td>${dept.department_code || "-"}</td>
          <td>${dept.contact_email || "-"}</td>
          <td>${dept.contact_phone || "-"}</td>
          <td>${formatDate(dept.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;
}

async function loadDepartments() {
  setError("");
  try {
    allDepartments = await getDepartments();
    renderDepartments();
  } catch (error) {
    setError(error.message);
  }
}

function initMobileNav() {
  const sidebar = document.querySelector(".admin-sidebar");
  const toggleBtn = document.getElementById("mobileNavToggle");
  const backdrop = document.getElementById("mobileNavBackdrop");
  const navLinks = sidebar?.querySelectorAll(".sidebar-nav a") ?? [];

  if (!sidebar || !toggleBtn) {
    return;
  }

  function setOpenState(isOpen) {
    sidebar.classList.toggle("open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("open");
    setOpenState(!isOpen);
  });

  backdrop?.addEventListener("click", () => {
    setOpenState(false);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setOpenState(false);
    });
  });
}

if (isAllowed) {
  initMobileNav();

  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("admin");
  });

  refreshBtn?.addEventListener("click", () => {
    loadDepartments();
  });

  loadDepartments();
}