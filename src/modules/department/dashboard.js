import { getAuthUser } from "../../services/authService.js";
import {
  getMyComplaints,
  updateComplaintStatus
} from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "../user/mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["department"] });
const allowedStatuses = ["assigned", "in_progress", "resolved", "escalated"];
let pendingUpdates = new Map();
let assignedQueue = [];

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

function formatStatusLabel(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "in_progress") {
    return "In Progress";
  }
  if (normalized === "resolved") {
    return "Resolved";
  }
  if (normalized === "escalated") {
    return "Escalated";
  }
  return "Assigned";
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
          <td>
            <select class="department-status-select" data-complaint-id="${complaint.id}">
              ${allowedStatuses
                .map(
                  (status) => `
                    <option value="${status}" ${
                      String(complaint.status).toLowerCase() === status ? "selected" : ""
                    }>
                      ${formatStatusLabel(status)}
                    </option>
                  `
                )
                .join("")}
            </select>
          </td>
          <td class="status ${statusClass}">${formatStatusLabel(complaint.status)}</td>
          <td>${formatDate(complaint.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  tableBody.querySelectorAll(".department-status-select").forEach((selectEl) => {
    selectEl.addEventListener("change", (event) => {
      const complaintId = event.target.dataset.complaintId;
      const nextStatus = String(event.target.value).toLowerCase();
      const complaint = complaints.find((item) => item.id === complaintId);
      const currentStatus = String(complaint?.status ?? "").toLowerCase();

      if (!complaintId) {
        return;
      }

      if (nextStatus === currentStatus) {
        pendingUpdates.delete(complaintId);
      } else {
        pendingUpdates.set(complaintId, nextStatus);
      }

      updateQueueButtonState();
    });
  });
}

async function loadDepartmentDashboard() {
  setError("");
  try {
    const complaints = await getMyComplaints();
    assignedQueue = complaints.filter(
      (item) => String(item.status).toLowerCase() === "assigned"
    );
    pendingUpdates = new Map();
    setStats(complaints);
    renderComplaints(assignedQueue);
    updateQueueButtonState();
  } catch (error) {
    setError(error.message);
  }
}

function updateQueueButtonState() {
  const updateQueueBtn = document.getElementById("updateQueueBtn");
  if (!updateQueueBtn) {
    return;
  }

  if (pendingUpdates.size === 0) {
    updateQueueBtn.textContent = "Update Queue";
    updateQueueBtn.disabled = false;
    return;
  }

  updateQueueBtn.textContent = `Update Queue (${pendingUpdates.size})`;
  updateQueueBtn.disabled = false;
}

async function applyQueueUpdates() {
  const updateQueueBtn = document.getElementById("updateQueueBtn");

  if (pendingUpdates.size === 0) {
    loadDepartmentDashboard();
    return;
  }

  if (updateQueueBtn) {
    updateQueueBtn.disabled = true;
    updateQueueBtn.textContent = "Updating...";
  }

  setError("");
  try {
    const operations = Array.from(pendingUpdates.entries()).map(
      ([complaintId, status]) => updateComplaintStatus(complaintId, status)
    );
    await Promise.all(operations);
    await loadDepartmentDashboard();
  } catch (error) {
    setError(error.message);
    updateQueueButtonState();
  }
}

if (isAllowed) {
  initStudentMobileNav();

  const logoutBtn = document.getElementById("logoutBtn");
  const userLabel = document.getElementById("departmentUserLabel");
  const updateQueueBtn = document.getElementById("updateQueueBtn");
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
    applyQueueUpdates();
  });

  loadDepartmentDashboard();
}
