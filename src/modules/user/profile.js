import { logoutAndRedirect, requireAuth } from "../../utils/authGuard.js";
import { getMyProfile, updateMyProfile } from "../../services/userService.js";
import { initStudentMobileNav } from "./mobileNav.js";

const isAllowed = requireAuth({ allowedRoles: ["student"] });

const profileForm = document.getElementById("profileForm");
const profileNameInput = document.getElementById("profileName");
const profileEmailInput = document.getElementById("profileEmail");
const profileRoleInput = document.getElementById("profileRole");
const profileCreatedAtInput = document.getElementById("profileCreatedAt");
const profileSuccessMessageEl = document.getElementById("profileSuccessMessage");
const profileErrorMessageEl = document.getElementById("profileErrorMessage");

function setSuccessMessage(message) {
  if (profileSuccessMessageEl) {
    profileSuccessMessageEl.textContent = message;
  }
}

function setErrorMessage(message) {
  if (profileErrorMessageEl) {
    profileErrorMessageEl.textContent = message;
  }
}

function setSubmitLoading(isLoading) {
  const submitBtn = profileForm?.querySelector('button[type="submit"]');
  if (!submitBtn) {
    return;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Saving..." : "Save Profile";
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

function fillProfile(profile) {
  if (profileNameInput) profileNameInput.value = profile.name ?? "";
  if (profileEmailInput) profileEmailInput.value = profile.email ?? "";
  if (profileRoleInput) profileRoleInput.value = profile.role ?? "";
  if (profileCreatedAtInput) {
    profileCreatedAtInput.value = formatDateTime(profile.created_at);
  }
}

async function loadProfile() {
  setErrorMessage("");
  try {
    const profile = await getMyProfile();
    fillProfile(profile);
  } catch (error) {
    setErrorMessage(error.message);
  }
}

if (isAllowed) {
  initStudentMobileNav();

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndRedirect("student");
  });

  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const name = profileNameInput?.value.trim() ?? "";
    if (!name) {
      setErrorMessage("Name is required.");
      return;
    }

    setSubmitLoading(true);
    try {
      const updatedProfile = await updateMyProfile({ name });
      fillProfile(updatedProfile);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitLoading(false);
    }
  });

  loadProfile();
}
