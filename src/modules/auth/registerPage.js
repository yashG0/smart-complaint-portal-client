import { register } from "../../services/authService.js";
import { getDashboardPath } from "../../config/apiConfig.js";
import { redirectLoggedInUserToDashboard } from "../../utils/authGuard.js";

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
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

redirectLoggedInUserToDashboard();

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
      role
    });
    window.location.replace(getDashboardPath(session.user.role));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingState(false);
  }
});
