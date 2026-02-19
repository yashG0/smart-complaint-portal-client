import { login } from "../../services/authService.js";
import { getDashboardPath } from "../../config/apiConfig.js";
import { redirectLoggedInUserToDashboard } from "../../utils/authGuard.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessageEl = document.getElementById("errorMessage");
const role = document.body.dataset.role;

function setError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
  }
}

function setLoadingState(isLoading) {
  const submitBtn = loginForm?.querySelector('button[type="submit"]');
  if (!submitBtn) {
    return;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Signing in..." : "Sign In";
}

redirectLoggedInUserToDashboard({
  expectedRole: role,
  logoutOnRoleMismatch: true
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");

  if (!role) {
    setError("Missing role configuration for this login page.");
    return;
  }

  setLoadingState(true);

  try {
    const session = await login({
      email: emailInput.value.trim(),
      password: passwordInput.value,
      role
    });

    window.location.replace(getDashboardPath(session.user.role));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingState(false);
  }
});
