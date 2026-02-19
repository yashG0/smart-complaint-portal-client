import { getAuthUser } from "../../services/authService.js";
import { getAllComplaints } from "../../services/adminService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

let allComplaints = [];

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

function renderEscalations() {
  const tableBody = document.getElementById("escalationsTableBody");
  const countEl = document.getElementById("escalationCount");

  if (!tableBody) {
    return;
  }

  const escalated = allComplaints.filter(c => String(c.status).toLowerCase() === "escalated");

  if (!escalated.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">No escalated complaints. Everything is under control!</td>
      </tr>
    `;
    if (countEl) countEl.textContent = "0 Critical";
    return;
  }

  if (countEl) countEl.textContent = `${escalated.length} Critical`;

  const rows = escalated
    .map((complaint) => {
      const departmentText = complaint.department_name || "Unassigned";
      const userEmail = complaint.user_id ? complaint.user_id.slice(0, 12) : "Unknown";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title.substring(0, 40)}${complaint.title.length > 40 ? "..." : ""}</td>
          <td>${departmentText}</td>
          <td>${userEmail}</td>
          <td>${formatDate(complaint.updated_at)}</td>
          <td><span class="status escalated">ESCALATED</span></td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;
}

async function loadEscalations() {
  setError("");
  try {
    allComplaints = await getAllComplaints();
    renderEscalations();
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
    loadEscalations();
  });

  loadEscalations();
}