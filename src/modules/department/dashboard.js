import { getAuthUser } from "../../services/authService.js";
import { getMyComplaints } from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["department"] });

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
  const errorEl = document.getElementById("departmentErrorMessage");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function setStats(complaints) {
  const assigned = complaints.filter(
    (item) => String(item.status).toLowerCase() === "assigned"
  ).length;
  const inProgress = complaints.filter(
    (item) => String(item.status).toLowerCase() === "in_progress"
  ).length;
  const resolved = complaints.filter(
    (item) => String(item.status).toLowerCase() === "resolved"
  ).length;
  const escalated = complaints.filter(
    (item) => String(item.status).toLowerCase() === "escalated"
  ).length;

  const assignedEl = document.getElementById("assignedCount");
  const inProgressEl = document.getElementById("inProgressCount");
  const resolvedEl = document.getElementById("resolvedCount");
  const escalatedEl = document.getElementById("escalatedCount");

  if (assignedEl) assignedEl.textContent = String(assigned);
  if (inProgressEl) inProgressEl.textContent = String(inProgress);
  if (resolvedEl) resolvedEl.textContent = String(resolved);
  if (escalatedEl) escalatedEl.textContent = String(escalated);
}

function renderComplaints(complaints) {
  const tableBody = document.getElementById("departmentComplaintTableBody");
  if (!tableBody) {
    return;
  }

  if (!complaints.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No assigned complaints found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = complaints
    .slice(0, 12)
    .map((complaint) => {
      const statusClass = getStatusClass(complaint.status);
      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title}</td>
          <td>-</td>
          <td class="status ${statusClass}">${complaint.status}</td>
          <td>${formatDate(complaint.created_at)}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadDepartmentDashboard() {
  setError("");
  try {
    const complaints = await getMyComplaints();
    setStats(complaints);
    renderComplaints(complaints);
  } catch (error) {
    setError(error.message);
  }
}

if (isAllowed) {
  const logoutBtn = document.getElementById("logoutBtn");
  const userLabel = document.getElementById("departmentUserLabel");
  const updateQueueBtn = document.querySelector(".department-btn");
  const departmentChip = document.querySelector(".department-chip");

  const authUser = getAuthUser();
  if (authUser?.email) {
    if (userLabel) {
      userLabel.textContent = `Signed in as ${authUser.email}`;
    }
    if (departmentChip) {
      departmentChip.textContent = authUser.name ?? "Department";
    }
  }

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("department");
  });

  updateQueueBtn?.addEventListener("click", () => {
    loadDepartmentDashboard();
  });

  loadDepartmentDashboard();
}
