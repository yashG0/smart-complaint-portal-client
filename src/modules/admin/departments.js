import { getAuthUser } from "../../services/authService.js";
import { getDepartments } from "../../services/adminService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { getPageSlice, renderPagination, runWithButtonLoading } from "./ui.js";
import { showToast } from "../../utils/toast.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

let allDepartments = [];
let currentPage = 1;
const PAGE_SIZE = 12;

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
    errorEl.textContent = "";
  }
  if (message) {
    showToast(message, "error");
  }
}

function renderDepartments() {
  const tableBody = document.getElementById("departmentsTableBody");
  const countEl = document.getElementById("deptCount");
  const paginationEl = document.getElementById("departmentsPagination");

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
    if (paginationEl) {
      paginationEl.innerHTML = "";
    }
    return;
  }

  if (countEl) countEl.textContent = String(allDepartments.length);
  const pageSlice = getPageSlice(allDepartments, currentPage, PAGE_SIZE);
  currentPage = pageSlice.currentPage;

  const rows = pageSlice.pageItems
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
  renderPagination({
    container: paginationEl,
    totalItems: pageSlice.totalItems,
    totalPages: pageSlice.totalPages,
    currentPage: pageSlice.currentPage,
    label: "departments",
    onPageChange: (nextPage) => {
      currentPage = nextPage;
      renderDepartments();
    },
  });
}

async function loadDepartments(showSuccessToast = false) {
  setError("");
  try {
    allDepartments = await getDepartments();
    renderDepartments();
    if (showSuccessToast) {
      showToast("Departments refreshed.", "success", 2200);
    }
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
    runWithButtonLoading({
      buttonEl: refreshBtn,
      loadingLabel: "Refreshing...",
      minDurationMs: 500,
      task: () => loadDepartments(true),
    });
  });

  loadDepartments();
}
