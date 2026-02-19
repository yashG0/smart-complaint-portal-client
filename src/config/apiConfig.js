export const API_CONFIG = {
  baseURL: "http://127.0.0.1:8000/api",
  timeoutMs: 10000,
  enableOfflineAuthFallback: false,
  endpoints: {
    loginByRole: {
      student: ["/auth/student/login", "/auth/user/login", "/auth/login"],
      department: ["/auth/department/login"],
      admin: ["/auth/admin/login"]
    },
    registerByRole: {
      student: ["/auth/student/register", "/auth/user/register", "/auth/register"],
      department: ["/auth/department/register", "/auth/register"],
      admin: ["/auth/admin/register", "/auth/register"]
    }
  }
};

export const DASHBOARD_PATH_BY_ROLE = {
  student: "/pages/user/dashboard.html",
  user: "/pages/user/dashboard.html",
  department: "/pages/department/dashboard.html",
  admin: "/pages/admin/dashboard.html"
};

export const LOGIN_PATH_BY_ROLE = {
  student: "/pages/user/login.html",
  user: "/pages/user/login.html",
  department: "/pages/department/login.html",
  admin: "/pages/admin/login.html"
};

export const ROLE_ALIAS_MAP = {
  user: "student",
  student: "student",
  department: "department",
  admin: "admin"
};

export function normalizeRole(role) {
  if (!role) {
    return null;
  }

  const normalized = String(role).trim().toLowerCase();
  return ROLE_ALIAS_MAP[normalized] ?? normalized;
}

export function getLoginEndpoints(role) {
  const normalizedRole = normalizeRole(role) ?? "student";
  return API_CONFIG.endpoints.loginByRole[normalizedRole] ?? ["/auth/login"];
}

export function getRegisterEndpoints(role) {
  const normalizedRole = normalizeRole(role) ?? "student";
  return API_CONFIG.endpoints.registerByRole[normalizedRole] ?? ["/auth/register"];
}

export function getDashboardPath(role) {
  const path = DASHBOARD_PATH_BY_ROLE[normalizeRole(role)] ?? "/index.html";
  return withAppBasePath(path);
}

export function getLoginPath(role) {
  const path = LOGIN_PATH_BY_ROLE[normalizeRole(role)] ?? "/index.html";
  return withAppBasePath(path);
}

export function getHomePath() {
  return withAppBasePath("/index.html");
}

function getAppBasePath() {
  const pathname = window.location.pathname ?? "";
  // Works for both:
  // - http://127.0.0.1:5500/... (frontend as web root)
  // - http://127.0.0.1:5500/frontend/... (project root as web root)
  return pathname.startsWith("/frontend/") ? "/frontend" : "";
}

function withAppBasePath(path) {
  const basePath = getAppBasePath();
  return `${basePath}${path}`;
}
