import { getMyComplaints } from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "./mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

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
    errorEl.textContent = message;
  }
}

function setStats(complaints) {
  const total = complaints.length;
  const pending = complaints.filter((item) =>
    ["pending", "assigned", "in_progress"].includes(String(item.status).toLowerCase())
  ).length;
  const resolved = complaints.filter(
    (item) => String(item.status).toLowerCase() === "resolved"
  ).length;
  const escalated = complaints.filter(
    (item) => String(item.status).toLowerCase() === "escalated"
  ).length;

  const totalEl = document.getElementById("totalComplaintsCount");
  const pendingEl = document.getElementById("pendingComplaintsCount");
  const resolvedEl = document.getElementById("resolvedComplaintsCount");
  const escalatedEl = document.getElementById("escalatedComplaintsCount");

  if (totalEl) totalEl.textContent = String(total);
  if (pendingEl) pendingEl.textContent = String(pending);
  if (resolvedEl) resolvedEl.textContent = String(resolved);
  if (escalatedEl) escalatedEl.textContent = String(escalated);
}

function renderRecentComplaints(complaints) {
  const tableBody = document.getElementById("recentComplaintsTableBody");
  if (!tableBody) {
    return;
  }

  if (!complaints.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No complaints found yet.</td>
      </tr>
    `;
    return;
  }

  const rows = complaints
    .slice(0, 6)
    .map((complaint) => {
      const statusClass = getStatusClass(complaint.status);
      const departmentText = complaint.department_name
        ? complaint.department_name
        : complaint.department_id
        ? complaint.department_id.slice(0, 8)
        : "Unassigned";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title}</td>
          <td class="status ${statusClass}">${complaint.status}</td>
          <td>${departmentText}</td>
          <td>${formatDate(complaint.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;
}

async function loadDashboardData() {
  setError("");
  try {
    const complaints = await getMyComplaints();
    setStats(complaints);
    renderRecentComplaints(complaints);
  } catch (error) {
    setError(error.message);
  }
}

if (isAllowed) {
  initStudentMobileNav();

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("student");
  });

  loadDashboardData();
}
