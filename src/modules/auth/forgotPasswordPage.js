import {
  requestPasswordResetCode,
  resetPasswordWithCode
} from "../../services/authService.js";
import { getLoginPath } from "../../config/apiConfig.js";
import { redirectLoggedInUserToDashboard } from "../../utils/authGuard.js";
import { showToast } from "../../utils/toast.js";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const resetBtn = document.getElementById("resetBtn");
const role = document.body.dataset.role ?? "student";
const SUCCESS_REDIRECT_DELAY_MS = 5000;

function setButtonLoading(buttonEl, isLoading, loadingLabel = "Loading...") {
  if (!buttonEl) {
    return;
  }

  if (isLoading) {
    if (!buttonEl.dataset.defaultLabel) {
      buttonEl.dataset.defaultLabel = buttonEl.textContent ?? "";
    }
    if (!buttonEl.dataset.defaultMinWidth) {
      buttonEl.dataset.defaultMinWidth = buttonEl.style.minWidth || "";
    }
    buttonEl.style.minWidth = `${Math.ceil(buttonEl.getBoundingClientRect().width)}px`;
    buttonEl.textContent = loadingLabel;
    buttonEl.disabled = true;
    buttonEl.setAttribute("aria-busy", "true");
    buttonEl.classList.add("is-loading");
    return;
  }

  buttonEl.textContent = buttonEl.dataset.defaultLabel || buttonEl.textContent;
  buttonEl.disabled = false;
  buttonEl.setAttribute("aria-busy", "false");
  buttonEl.style.minWidth = buttonEl.dataset.defaultMinWidth || "";
  buttonEl.classList.remove("is-loading");
}

function setError(message) {
  if (message) {
    showToast(message, "error");
  }
}

function setSuccess(message) {
  if (message) {
    showToast(message, "success");
  }
}

function setInfo(message) {
  showToast(message, "info");
}

function createDelayedInfoToast(message, delayMs = 350) {
  let shown = false;
  const timerId = window.setTimeout(() => {
    shown = true;
    setInfo(message);
  }, delayMs);

  return () => {
    window.clearTimeout(timerId);
    return shown;
  };
}

redirectLoggedInUserToDashboard({
  expectedRole: role,
  logoutOnRoleMismatch: true
});

sendCodeBtn?.addEventListener("click", async () => {
  const email = emailInput?.value.trim() ?? "";
  if (!email) {
    setError("Enter your registered email first.");
    return;
  }

  setButtonLoading(sendCodeBtn, true, "Sending OTP...");
  const clearPendingInfo = createDelayedInfoToast("Sending OTP to your registered email...");

  try {
    await requestPasswordResetCode({ email, role });
    clearPendingInfo();
    setSuccess("If the account exists, OTP has been sent to the registered email.");
  } catch (error) {
    clearPendingInfo();
    setError(error.message);
  } finally {
    setButtonLoading(sendCodeBtn, false);
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

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

  setButtonLoading(resetBtn, true, "Resetting...");
  const clearPendingInfo = createDelayedInfoToast("Updating your password...");

  try {
    await resetPasswordWithCode({ email, code, newPassword, role });
    clearPendingInfo();
    setSuccess("Password reset successful. Redirecting to login...");
    setTimeout(() => {
      window.location.replace(getLoginPath(role));
    }, SUCCESS_REDIRECT_DELAY_MS);
  } catch (error) {
    clearPendingInfo();
    setError(error.message);
  } finally {
    setButtonLoading(resetBtn, false);
  }
});
