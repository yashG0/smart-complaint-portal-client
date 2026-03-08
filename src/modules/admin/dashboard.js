import { getAuthUser } from "../../services/authService.js";
import { getAllComplaints, getDepartments, getComplaintStats } from "../../services/adminService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { runWithButtonLoading } from "./ui.js";
import { showToast } from "../../utils/toast.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

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

function getStatusClass(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "resolved") {
    return "resolved";
  }
  if (normalized === "escalated") {
    return "escalated";
  }
  return "pending";
}

function setError(message) {
  const errorEl = document.getElementById("dashboardErrorMessage");
  if (errorEl) {
    errorEl.textContent = "";
  }
  if (message) {
    showToast(message, "error");
  }
}

function setStats(stats) {
  const elements = {
    totalCount: document.getElementById("totalCount"),
    pendingCount: document.getElementById("pendingCount"),
    inProgressCount: document.getElementById("inProgressCount"),
    resolvedCount: document.getElementById("resolvedCount"),
    escalatedCount: document.getElementById("escalatedCount")
  };

  if (elements.totalCount) elements.totalCount.textContent = String(stats.total);
  if (elements.pendingCount) elements.pendingCount.textContent = String(stats.pending);
  if (elements.inProgressCount) elements.inProgressCount.textContent = String(stats.inProgress);
  if (elements.resolvedCount) elements.resolvedCount.textContent = String(stats.resolved);
  if (elements.escalatedCount) elements.escalatedCount.textContent = String(stats.escalated);
}

function renderRecentComplaints(complaints) {
  const tableBody = document.getElementById("recentComplaintsTableBody");
  if (!tableBody) {
    return;
  }

  if (!complaints.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No complaints found.</td>
      </tr>
    `;
    return;
  }

  const rows = complaints
    .slice(0, 10)
    .map((complaint) => {
      const statusClass = getStatusClass(complaint.status);
      const departmentText = complaint.department_name || "Unassigned";
      const userEmail = complaint.user_id ? complaint.user_id.slice(0, 8) + "..." : "Unknown";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title.substring(0, 30)}${complaint.title.length > 30 ? "..." : ""}</td>
          <td>${userEmail}</td>
          <td>${departmentText}</td>
          <td class="status ${statusClass}">${complaint.status}</td>
          <td>${formatDate(complaint.created_at)}</td>
          <td>
            <a href="./all-complaints.html?id=${complaint.id}" style="color: #38bdf8; font-size:12px;">View</a>
          </td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;
}

async function loadDashboardData(showSuccessToast = false) {
  setError("");
  try {
    const complaints = await getAllComplaints();
    const stats = await getComplaintStats(complaints);
    setStats(stats);
    renderRecentComplaints(complaints);
    if (showSuccessToast) {
      showToast("Dashboard refreshed.", "success", 2200);
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
  const userLabel = document.getElementById("adminUserLabel");
  const refreshBtn = document.getElementById("refreshBtn");

  const authUser = getAuthUser();
  if (authUser?.email && userLabel) {
    userLabel.textContent = `Signed in as ${authUser.email}`;
  }

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("admin");
  });

  refreshBtn?.addEventListener("click", () => {
    runWithButtonLoading({
      buttonEl: refreshBtn,
      loadingLabel: "Refreshing...",
      minDurationMs: 500,
      task: () => loadDashboardData(true),
    });
  });

  loadDashboardData();
}
