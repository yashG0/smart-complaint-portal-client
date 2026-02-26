import { getAuthUser } from "../../services/authService.js";
import { getAllComplaints, getDepartments } from "../../services/adminService.js";
import { getComplaintHistory } from "../../services/complaintService.js";
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

function setHistoryError(message) {
  const errorEl = document.getElementById("adminHistoryError");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toReadableAction(action) {
  const normalized = String(action ?? "").trim();
  if (!normalized) {
    return "Updated";
  }
  return normalized.replaceAll("_", " ");
}

function renderHistory(entries) {
  const timelineEl = document.getElementById("adminHistoryTimeline");
  if (!timelineEl) {
    return;
  }

  if (!entries.length) {
    timelineEl.innerHTML = `
      <li class="timeline-item">
        <p>No history entries found for this complaint.</p>
      </li>
    `;
    return;
  }

  timelineEl.innerHTML = entries
    .map(
      (entry) => `
      <li class="timeline-item">
        <p><strong>${toReadableAction(entry.action)}</strong></p>
        <small>${formatDateTime(entry.timestamp)}</small>
      </li>
    `
    )
    .join("");
}

async function loadHistory(complaintId) {
  const titleEl = document.getElementById("adminHistoryTitle");
  const chipEl = document.getElementById("adminHistoryChip");
  const timelineEl = document.getElementById("adminHistoryTimeline");

  setHistoryError("");
  if (!timelineEl) {
    return;
  }

  timelineEl.innerHTML = `
    <li class="timeline-item">
      <p>Loading history...</p>
    </li>
  `;

  try {
    const complaint = allComplaints.find((item) => item.id === complaintId);
    if (titleEl) {
      titleEl.textContent = complaint
        ? `Complaint History: ${complaint.title}`
        : "Complaint History";
    }
    if (chipEl) {
      chipEl.textContent = complaint ? `#${complaint.id.slice(0, 6)}` : "Complaint";
    }

    const entries = await getComplaintHistory(complaintId);
    renderHistory(entries);
  } catch (error) {
    setHistoryError(error.message);
    renderHistory([]);
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
            <button
              type="button"
              class="btn-secondary small-btn complaint-history-btn"
              data-complaint-id="${complaint.id}"
            >
              View History
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;

  tableBody.querySelectorAll(".complaint-history-btn").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => {
      const id = buttonEl.dataset.complaintId;
      if (id) {
        loadHistory(id);
      }
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
