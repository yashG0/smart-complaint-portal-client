import {
  getComplaintHistory,
  getMyComplaints
} from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "./mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

const complaintsErrorMessageEl = document.getElementById("complaintsErrorMessage");
const complaintsTableBody = document.getElementById("complaintsTableBody");
const historyTitleEl = document.getElementById("historyTitle");
const historyChipEl = document.getElementById("historyComplaintChip");
const historyTimelineEl = document.getElementById("complaintHistoryTimeline");
const historyErrorMessageEl = document.getElementById("complaintHistoryErrorMessage");

let complaintsCache = [];

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

function setHistoryError(message) {
  if (historyErrorMessageEl) {
    historyErrorMessageEl.textContent = message;
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
  if (!historyTimelineEl) {
    return;
  }

  if (!entries.length) {
    historyTimelineEl.innerHTML = `
      <li class="timeline-item">
        <p>No history entries found for this complaint.</p>
      </li>
    `;
    return;
  }

  historyTimelineEl.innerHTML = entries
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
  setHistoryError("");
  if (!historyTimelineEl) {
    return;
  }

  historyTimelineEl.innerHTML = `
    <li class="timeline-item">
      <p>Loading history...</p>
    </li>
  `;

  try {
    const complaint = complaintsCache.find((item) => item.id === complaintId);
    if (historyTitleEl) {
      historyTitleEl.textContent = complaint
        ? `Complaint History: ${complaint.title}`
        : "Complaint History";
    }
    if (historyChipEl) {
      historyChipEl.textContent = complaint ? `#${complaint.id.slice(0, 6)}` : "Complaint";
    }

    const entries = await getComplaintHistory(complaintId);
    renderHistory(entries);
  } catch (error) {
    setHistoryError(error.message);
    renderHistory([]);
  }
}

function renderComplaintsTable(complaints) {
  if (!complaintsTableBody) {
    return;
  }

  if (!complaints.length) {
    complaintsTableBody.innerHTML = `
      <tr>
        <td colspan="6">No complaints found yet.</td>
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

  complaintsTableBody.querySelectorAll(".complaint-history-btn").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => {
      const complaintId = buttonEl.dataset.complaintId;
      if (complaintId) {
        loadHistory(complaintId);
      }
    });
  });
}

async function loadComplaints() {
  setListError("");
  try {
    const complaints = await getMyComplaints();
    complaintsCache = complaints;
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
