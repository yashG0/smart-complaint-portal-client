import apiClient, { extractErrorMessage } from "./api.js";
import {
  getLoginEndpoints,
  getRegisterEndpoints,
  normalizeRole
} from "../config/apiConfig.js";

const AUTH_TOKEN_KEY = "scp_access_token";
const AUTH_USER_KEY = "scp_auth_user";

function normalizeLoginResponse(rawData, fallbackRole, fallbackEmail) {
  const accessToken =
    rawData?.access_token ??
    rawData?.token ??
    rawData?.accessToken ??
    rawData?.data?.access_token ??
    null;

  if (!accessToken) {
    throw new Error("Login response did not include an access token.");
  }

  const user = rawData?.user ?? rawData?.data?.user ?? {};
  const role = normalizeRole(user?.role ?? rawData?.role ?? fallbackRole);
  const email = user?.email ?? rawData?.email ?? fallbackEmail;

  return {
    accessToken,
    user: {
      ...user,
      role,
      email
    }
  };
}

function saveAuthSession(session) {
  localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

function shouldTryNextEndpoint(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405;
}

async function postToFirstAvailableEndpoint(endpoints, payload) {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      return await apiClient.post(endpoint, payload);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextEndpoint(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No API endpoint was available.");
}

export async function login({ email, password, role }) {
  try {
    const normalizedRole = normalizeRole(role);
    const endpoints = getLoginEndpoints(normalizedRole);
    const response = await postToFirstAvailableEndpoint(endpoints, {
      email,
      password,
      role: normalizedRole
    });
    const session = normalizeLoginResponse(response.data, normalizedRole, email);
    saveAuthSession(session);
    return session;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function register({
  name,
  email,
  password,
  role = "student",
  organizationName = "",
  departmentDescription = "",
  organizationCode = "",
  departmentCode = "",
  contactEmail = "",
  contactPhone = ""
}) {
  try {
    const normalizedRole = normalizeRole(role);
    const endpoints = getRegisterEndpoints(normalizedRole);
    const payload = {
      name,
      email,
      password
    };

    if (normalizedRole === "department") {
      payload.organization_name = organizationName;
      payload.department_description = departmentDescription;
      payload.organization_code = organizationCode || null;
      payload.department_code = departmentCode || null;
      payload.contact_email = contactEmail || null;
      payload.contact_phone = contactPhone || null;
    }

    const response = await postToFirstAvailableEndpoint(endpoints, payload);

    try {
      const rawData = response.data ?? {};
      const session = normalizeLoginResponse(rawData, normalizedRole, email);
      saveAuthSession(session);
      return session;
    } catch {
      return await login({ email, password, role: normalizedRole });
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
