const LOCAL_API = "http://127.0.0.1:8000/api";
const PROD_API = "https://smart-complaint-portal-server-1.onrender.com/api";

export const API_CONFIG = {
  baseURL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? LOCAL_API
      : PROD_API,

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
      admin: ["/auth/admin/register"]
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
  const { hostname, pathname } = window.location;
  const path = pathname || "/";

  // Known app roots for both local and deployed routes.
  const rootMarkers = ["/pages/", "/assets/", "/src/", "/index.html", "/register.html"];
  for (const marker of rootMarkers) {
    const markerIndex = path.indexOf(marker);
    if (markerIndex > 0) {
      return path.slice(0, markerIndex);
    }
  }

  // If current path already ends with a folder (e.g. /repo-name/), use it.
  if (path.endsWith("/") && path !== "/") {
    return path.slice(0, -1);
  }

  const segments = path.split("/").filter(Boolean);

  // GitHub Pages repo host fallback: /<repo-name>
  if (hostname.endsWith(".github.io") && segments.length > 0) {
    return `/${segments[0]}`;
  }

  // Local nested host fallback (e.g. /frontend without trailing slash)
  if ((hostname === "localhost" || hostname === "127.0.0.1") && segments.length === 1) {
    if (!segments[0].includes(".")) {
      return `/${segments[0]}`;
    }
  }

  return "";
}

function withAppBasePath(path) {
  const basePath = getAppBasePath();
  return `${basePath}${path}`;
}
