import {
  createComplaint,
  getDepartments
} from "../../services/complaintService.js";
import { requireAuth, logoutAndRedirect } from "../../utils/authGuard.js";
import { initStudentMobileNav } from "./mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

const createComplaintForm = document.getElementById("createComplaintForm");
const complaintTitleInput = document.getElementById("complaintTitle");
const complaintDescriptionInput = document.getElementById("complaintDescription");
const complaintDepartmentSelect = document.getElementById("complaintDepartment");
const createComplaintMessageEl = document.getElementById("createComplaintMessage");
const createComplaintErrorEl = document.getElementById("createComplaintError");

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

function setSubmitLoading(isLoading) {
  const submitBtn = createComplaintForm?.querySelector('button[type="submit"]');
  if (!submitBtn) {
    return;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Submitting..." : "Submit Complaint";
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

if (isAllowed) {
  initStudentMobileNav();

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
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  });

  loadDepartments();
}
