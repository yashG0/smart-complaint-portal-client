import { getAuthUser } from "../../services/authService.js";
import { getMyComplaints } from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "../user/mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["department"] });

const PAGE_META = {
  assigned: {
    label: "Assigned Complaints",
    empty: "No assigned complaints found."
  },
  in_progress: {
    label: "In Progress Complaints",
    empty: "No complaints are currently in progress."
  },
  resolved: {
    label: "Resolved Complaints",
    empty: "No resolved complaints found yet."
  }
};

function normalizeStatus(status) {
  return String(status ?? "").trim().toLowerCase();
}

function isStatusMatch(status, pageStatus) {
  const normalized = normalizeStatus(status);
  if (pageStatus === "in_progress") {
    return normalized === "in_progress" || normalized === "in progress";
  }
  return normalized === pageStatus;
}

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
  const normalized = normalizeStatus(status);
  if (normalized === "resolved") {
    return "resolved";
  }
  if (normalized === "escalated") {
    return "escalated";
  }
  return "pending";
}

function setError(message) {
  const errorEl = document.getElementById("departmentComplaintPageError");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function setMeta({ count, label, deptName }) {
  const titleEl = document.getElementById("departmentPageTitle");
  const tableTitleEl = document.getElementById("departmentTableTitle");
  const countEl = document.getElementById("departmentPageCount");
  const userLabelEl = document.getElementById("departmentUserLabel");
  const chipEl = document.getElementById("departmentChip");

  if (titleEl) titleEl.textContent = label;
  if (tableTitleEl) tableTitleEl.textContent = label;
  if (countEl) countEl.textContent = String(count);
  if (userLabelEl) {
    userLabelEl.textContent = `Signed in as ${deptName}`;
  }
  if (chipEl) {
    chipEl.textContent = deptName;
  }
}

function renderComplaints(complaints, emptyText) {
  const tableBody = document.getElementById("departmentComplaintTableBody");
  if (!tableBody) {
    return;
  }

  if (!complaints.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">${emptyText}</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = complaints
    .map((complaint) => `
      <tr>
        <td>#${complaint.id.slice(0, 6)}</td>
        <td>${complaint.title}</td>
        <td class="status ${getStatusClass(complaint.status)}">${complaint.status}</td>
        <td>${complaint.department_name ?? "Department"}</td>
        <td>${formatDate(complaint.created_at)}</td>
      </tr>
    `)
    .join("");
}

async function loadPage(pageStatus) {
  setError("");
  const meta = PAGE_META[pageStatus] ?? PAGE_META.assigned;

  try {
    const authUser = getAuthUser();
    const deptName = authUser?.name || authUser?.email || "Department";

    const complaints = await getMyComplaints();
    const filtered = complaints
      .filter((item) => isStatusMatch(item.status, pageStatus))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setMeta({ count: filtered.length, label: meta.label, deptName });
    renderComplaints(filtered, meta.empty);
  } catch (error) {
    setError(error.message);
  }
}

if (isAllowed) {
  initStudentMobileNav();

  const pageStatus = document.body.dataset.complaintPage || "assigned";

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("department");
  });

  const refreshBtn = document.getElementById("departmentRefreshBtn");
  refreshBtn?.addEventListener("click", () => loadPage(pageStatus));

  loadPage(pageStatus);
}
