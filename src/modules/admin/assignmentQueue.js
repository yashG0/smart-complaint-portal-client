import { getAuthUser } from "../../services/authService.js";
import { getAllComplaints, getDepartments, assignComplaintToDepartment } from "../../services/adminService.js";
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

function setError(message) {
  const errorEl = document.getElementById("errorMessage");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function setSuccess(message) {
  const successEl = document.getElementById("successMessage");
  if (successEl) {
    successEl.textContent = message;
    setTimeout(() => {
      successEl.textContent = "";
    }, 4000);
  }
}

function renderQueue() {
  const tableBody = document.getElementById("queueTableBody");
  const countEl = document.getElementById("queueCount");

  if (!tableBody) {
    return;
  }

  const unassigned = allComplaints.filter(c => !c.department_id || String(c.status).toLowerCase() === "pending");

  if (!unassigned.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">No unassigned complaints. All complaints have been assigned!</td>
      </tr>
    `;
    if (countEl) countEl.textContent = "0 Pending";
    return;
  }

  if (countEl) countEl.textContent = `${unassigned.length} Pending`;

  const rows = unassigned
    .map((complaint) => {
      const deptOptions = departments
        .map((d) => `<option value="${d.id}">${d.name}</option>`)
        .join("");

      const userEmail = complaint.user_id ? complaint.user_id.slice(0, 12) : "Unknown";

      return `
        <tr>
          <td>#${complaint.id.slice(0, 6)}</td>
          <td>${complaint.title.substring(0, 30)}${complaint.title.length > 30 ? "..." : ""}</td>
          <td>${complaint.description.substring(0, 25)}${complaint.description.length > 25 ? "..." : ""}</td>
          <td>${userEmail}</td>
          <td>
            <select class="assign-select" data-complaint-id="${complaint.id}" style="padding: 8px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 13px;">
              <option value="">Select department...</option>
              ${deptOptions}
            </select>
          </td>
          <td>${formatDate(complaint.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  tableBody.innerHTML = rows;

  // Attach assign listeners
  tableBody.querySelectorAll(".assign-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const complaintId = e.target.dataset.complaintId;
      const deptId = e.target.value;

      if (!deptId) {
        return;
      }

      try {
        setError("");
        await assignComplaintToDepartment(complaintId, deptId);
        setSuccess("Complaint assigned successfully!");
        setTimeout(() => {
          loadQueue();
        }, 1000);
      } catch (error) {
        setError(error.message);
        e.target.value = "";
      }
    });
  });
}

async function loadQueue() {
  setError("");
  try {
    allComplaints = await getAllComplaints();
    departments = await getDepartments();
    renderQueue();
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
  const refreshBtn = document.getElementById("refreshBtn");

  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("admin");
  });

  refreshBtn?.addEventListener("click", () => {
    loadQueue();
  });

  loadQueue();
}