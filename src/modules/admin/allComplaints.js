import { getAuthUser } from "../../services/authService.js";
import { getAllComplaints, getDepartments } from "../../services/adminService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["admin"] });

let allComplaints = [];
let departments = [];

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
  const errorEl = document.getElementById("errorMessage");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function renderComplaints(complaints) {
  const tableBody = document.getElementById("complaintsTableBody");
  const countEl = document.getElementById("complaintCount");

  if (!tableBody) {
    return;
  }

  if (!complaints.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No complaints found.</td>
      </tr>
    `;
    if (countEl) countEl.textContent = "0 Total";
    return;
  }

  if (countEl) countEl.textContent = `${complaints.length} Total`;

  const rows = complaints
    .map((complaint) => {
      const statusClass = getStatusClass(complaint.status);
      const departmentText = complaint.department_name || "Unassigned";
      const userEmail = complaint.user_id ? complaint.user_id.slice(0, 10) : "Unknown";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title.substring(0, 40)}${complaint.title.length > 40 ? "..." : ""}</td>
          <td>${userEmail}</td>
          <td>${departmentText}</td>
          <td class="status ${statusClass}">${complaint.status}</td>
          <td>${formatDate(complaint.created_at)}</td>
          <td>
            <button class="view-btn" data-complaint-id="${complaint.id}" style="background: none; border: none; color: #38bdf8; cursor: pointer; font-size: 12px; text-decoration: underline;">
              View
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;

  // Attach view button listeners
  tableBody.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.complaintId;
      // In a real app, show a modal or navigate to detail page
      alert(`View complaint: ${id}`);
    });
  });
}

function filterComplaints() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() ?? "";
  const statusFilter = document.getElementById("statusFilter")?.value ?? "";

  let filtered = allComplaints;

  if (searchTerm) {
    filtered = filtered.filter((c) =>
      c.title.toLowerCase().includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((c) =>
      String(c.status).toLowerCase() === statusFilter.toLowerCase()
    );
  }

  renderComplaints(filtered);
}

async function loadComplaints() {
  setError("");
  try {
    allComplaints = await getAllComplaints();
    departments = await getDepartments();
    renderComplaints(allComplaints);
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
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  const authUser = getAuthUser();
  if (authUser?.email && userLabel) {
    userLabel.textContent = `Signed in as ${authUser.email}`;
  }

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("admin");
  });

  refreshBtn?.addEventListener("click", () => {
    loadComplaints();
  });

  searchInput?.addEventListener("input", filterComplaints);
  statusFilter?.addEventListener("change", filterComplaints);

  loadComplaints();
}