import { register } from "../../services/authService.js";
import { getDashboardPath } from "../../config/apiConfig.js";
import { redirectLoggedInUserToDashboard } from "../../utils/authGuard.js";

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const organizationNameInput = document.getElementById("organizationName");
const departmentDescriptionInput = document.getElementById("departmentDescription");
const organizationCodeInput = document.getElementById("organizationCode");
const departmentCodeInput = document.getElementById("departmentCode");
const contactEmailInput = document.getElementById("contactEmail");
const contactPhoneInput = document.getElementById("contactPhone");
const errorMessageEl = document.getElementById("errorMessage");
const role = document.body.dataset.role ?? "student";

function setError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
  }
}

function setLoadingState(isLoading) {
  const submitBtn = registerForm?.querySelector('button[type="submit"]');
  if (!submitBtn) {
    return;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Creating account..." : "Create Account";
}

redirectLoggedInUserToDashboard({
  expectedRole: role,
  logoutOnRoleMismatch: true
});

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");

  const name = nameInput?.value.trim() ?? "";
  const email = emailInput?.value.trim() ?? "";
  const password = passwordInput?.value ?? "";
  const confirmPassword = confirmPasswordInput?.value ?? "";

  if (!name || !email || !password) {
    setError("All fields are required.");
    return;
  }

  const organizationName = organizationNameInput?.value.trim() ?? "";
  if (role === "department" && !organizationName) {
    setError("Organization name is required for department account.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoadingState(true);

  try {
    const session = await register({
      name,
      email,
      password,
      role,
      organizationName,
      departmentDescription: departmentDescriptionInput?.value.trim() ?? "",
      organizationCode: organizationCodeInput?.value.trim() ?? "",
      departmentCode: departmentCodeInput?.value.trim() ?? "",
      contactEmail: contactEmailInput?.value.trim() ?? "",
      contactPhone: contactPhoneInput?.value.trim() ?? ""
    });
    window.location.replace(getDashboardPath(session.user.role));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingState(false);
  }
});
