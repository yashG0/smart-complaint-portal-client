import { getAuthUser, isAuthenticated, logout } from "../services/authService.js";
import {
  getDashboardPath,
  getHomePath,
  getLoginPath
} from "../config/apiConfig.js";

export function requireAuth({ allowedRoles = [] } = {}) {
  if (!isAuthenticated()) {
    window.location.replace(getHomePath());
    return false;
  }

  const currentUser = getAuthUser();
  const currentRole = currentUser?.role;

  if (
    allowedRoles.length > 0 &&
    (!currentRole || !allowedRoles.includes(currentRole))
  ) {
    if (currentRole) {
      window.location.replace(getDashboardPath(currentRole));
    } else {
      logout();
      window.location.replace(getHomePath());
    }
    return false;
  }

  return true;
}

export function redirectLoggedInUserToDashboard({
  expectedRole = null,
  logoutOnRoleMismatch = false
} = {}) {
  if (!isAuthenticated()) {
    return;
  }

  const currentRole = getAuthUser()?.role;
  if (!currentRole) {
    logout();
    return;
  }

  if (expectedRole && currentRole !== expectedRole) {
    if (logoutOnRoleMismatch) {
      logout();
    }
    return;
  }

  window.location.replace(getDashboardPath(currentRole));
}

export function logoutAndRedirect(role) {
  logout();
  window.location.replace(getLoginPath(role));
}
