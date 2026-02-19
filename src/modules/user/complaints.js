import { getMyComplaints } from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "./mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

const complaintsErrorMessageEl = document.getElementById("complaintsErrorMessage");
const complaintsTableBody = document.getElementById("complaintsTableBody");

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

function setListError(message) {
  if (complaintsErrorMessageEl) {
    complaintsErrorMessageEl.textContent = message;
  }
}

function renderComplaintsTable(complaints) {
  if (!complaintsTableBody) {
    return;
  }

  if (!complaints.length) {
    complaintsTableBody.innerHTML = `
      <tr>
        <td colspan="5">No complaints found yet.</td>
      </tr>
    `;
    return;
  }

  complaintsTableBody.innerHTML = complaints
    .map((complaint) => {
      const departmentText = complaint.department_name
        ? complaint.department_name
        : complaint.department_id
        ? complaint.department_id.slice(0, 8)
        : "Unassigned";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title}</td>
          <td class="status ${getStatusClass(complaint.status)}">${complaint.status}</td>
          <td>${departmentText}</td>
          <td>${formatDate(complaint.created_at)}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadComplaints() {
  setListError("");
  try {
    const complaints = await getMyComplaints();
    renderComplaintsTable(complaints);
  } catch (error) {
    setListError(error.message);
  }
}

if (isAllowed) {
  initStudentMobileNav();

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("student");
  });
  loadComplaints();
}
