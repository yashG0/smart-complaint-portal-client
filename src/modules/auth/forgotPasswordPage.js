import {
  requestPasswordResetCode,
  resetPasswordWithCode
} from "../../services/authService.js";
import { getLoginPath } from "../../config/apiConfig.js";
import { redirectLoggedInUserToDashboard } from "../../utils/authGuard.js";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const resetBtn = document.getElementById("resetBtn");
const errorMessageEl = document.getElementById("errorMessage");
const role = document.body.dataset.role ?? "student";
const DEFAULT_TOAST_DURATION_MS = 15000;
const SUCCESS_REDIRECT_DELAY_MS = 5000;

function showToast(message, variant = "info", durationMs = DEFAULT_TOAST_DURATION_MS) {
  const stack = document.getElementById("toastStack") ?? createToastStack();
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  stack.append(toast);

  window.setTimeout(() => {
    toast.remove();
    if (!stack.children.length) {
      stack.remove();
    }
  }, durationMs);
}

function createToastStack() {
  const stack = document.createElement("div");
  stack.id = "toastStack";
  stack.className = "toast-stack";
  document.body.append(stack);
  return stack;
}

function clearToasts() {
  const stack = document.getElementById("toastStack");
  if (!stack) {
    return;
  }
  stack.remove();
}

function setError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.className = "error-text status-text status-error";
  }
  if (message) {
    clearToasts();
    showToast(message, "error");
  }
}

function setSuccess(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.className = "error-text status-text status-success";
  }
  if (message) {
    clearToasts();
    showToast(message, "success");
  }
}

function setInfo(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.className = "error-text status-text status-info";
  }
}

redirectLoggedInUserToDashboard({
  expectedRole: role,
  logoutOnRoleMismatch: true
});

sendCodeBtn?.addEventListener("click", async () => {
  if (errorMessageEl) {
    errorMessageEl.textContent = "";
    errorMessageEl.className = "error-text status-text";
  }
  const email = emailInput?.value.trim() ?? "";
  if (!email) {
    setError("Enter your registered email first.");
    return;
  }

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "Sending OTP...";
  setInfo("Sending OTP to your registered email...");

  try {
    await requestPasswordResetCode({ email, role });
    setSuccess("If the account exists, OTP has been sent to the registered email.");
  } catch (error) {
    setError(error.message);
  } finally {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = "Send OTP Code";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (errorMessageEl) {
    errorMessageEl.textContent = "";
    errorMessageEl.className = "error-text status-text";
  }

  const email = emailInput?.value.trim() ?? "";
  const code = codeInput?.value.trim() ?? "";
  const newPassword = newPasswordInput?.value ?? "";
  const confirmPassword = confirmPasswordInput?.value ?? "";

  if (!email || !code || !newPassword || !confirmPassword) {
    setError("All fields are required.");
    return;
  }

  if (newPassword.length < 6) {
    setError("New password must be at least 6 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  resetBtn.disabled = true;
  resetBtn.textContent = "Resetting...";
  setInfo("Updating your password...");

  try {
    await resetPasswordWithCode({ email, code, newPassword, role });
    setSuccess("Password reset successful. Redirecting to login...");
    setTimeout(() => {
      window.location.replace(getLoginPath(role));
    }, SUCCESS_REDIRECT_DELAY_MS);
  } catch (error) {
    setError(error.message);
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = "Reset Password";
  }
});
