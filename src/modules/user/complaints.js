import {
  createComplaint,
  getDepartments,
  getMyComplaints
} from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

const createComplaintForm = document.getElementById("createComplaintForm");
const complaintTitleInput = document.getElementById("complaintTitle");
const complaintDescriptionInput = document.getElementById("complaintDescription");
const complaintDepartmentSelect = document.getElementById("complaintDepartment");
const createComplaintMessageEl = document.getElementById("createComplaintMessage");
const createComplaintErrorEl = document.getElementById("createComplaintError");
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

function setCreateError(message) {
  if (createComplaintErrorEl) {
    createComplaintErrorEl.textContent = message;
  }
}

function setCreateMessage(message) {
  if (createComplaintMessageEl) {
    createComplaintMessageEl.textContent = message;
  }
}

function setListError(message) {
  if (complaintsErrorMessageEl) {
    complaintsErrorMessageEl.textContent = message;
  }
}

function setSubmitLoading(isLoading) {
  const submitBtn = createComplaintForm?.querySelector('button[type="submit"]');
  if (!submitBtn) {
    return;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Submitting..." : "Submit Complaint";
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

function renderDepartmentOptions(departments) {
  if (!complaintDepartmentSelect) {
    return;
  }

  const options = [
    '<option value="">Select department</option>',
    ...departments.map(
      (department) =>
        `<option value="${department.id}">${department.name}</option>`
    )
  ];
  complaintDepartmentSelect.innerHTML = options.join("");
}

async function loadDepartments() {
  try {
    const departments = await getDepartments();
    renderDepartmentOptions(departments);
  } catch (error) {
    setCreateError(error.message);
  }
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
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("student");
  });

  createComplaintForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreateMessage("");

    const title = complaintTitleInput?.value.trim() ?? "";
    const description = complaintDescriptionInput?.value.trim() ?? "";
    const departmentId = complaintDepartmentSelect?.value ?? "";

    if (!title || !description) {
      setCreateError("Title and description are required.");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = { title, description };
      if (departmentId) {
        payload.department_id = departmentId;
      }
      await createComplaint(payload);
      setCreateMessage("Complaint submitted successfully.");
      createComplaintForm.reset();
      await loadDepartments();
      await loadComplaints();
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  });

  loadDepartments();
  loadComplaints();
}
