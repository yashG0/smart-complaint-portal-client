import apiClient, { extractErrorMessage } from "./api.js";
import {
  API_CONFIG,
  getLoginEndpoints,
  getRegisterEndpoints,
  normalizeRole
} from "../config/apiConfig.js";

const AUTH_TOKEN_KEY = "scp_access_token";
const AUTH_USER_KEY = "scp_auth_user";
const MOCK_USERS_KEY = "scp_mock_users";

function getMockUsers() {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function createOfflineSession({ email, role, name }) {
  const normalizedRole = normalizeRole(role) ?? "student";
  const now = Date.now();

  return {
    accessToken: `offline-token-${now}`,
    user: {
      id: `offline-${now}`,
      name: name ?? email.split("@")[0],
      email,
      role: normalizedRole
    }
  };
}

function isNetworkUnavailable(error) {
  return !error?.response;
}

function tryOfflineLogin({ email, password, role }) {
  if (!API_CONFIG.enableOfflineAuthFallback) {
    return null;
  }

  const normalizedRole = normalizeRole(role) ?? "student";
  const users = getMockUsers();
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    throw new Error("Backend is offline. Use a registered local account first.");
  }

  return createOfflineSession({
    email: user.email,
    role: user.role ?? normalizedRole,
    name: user.name
  });
}

function registerOfflineUser({ name, email, password, role }) {
  if (!API_CONFIG.enableOfflineAuthFallback) {
    return null;
  }

  const normalizedRole = normalizeRole(role) ?? "student";
  const users = getMockUsers();
  const existingUser = users.find((item) => item.email === email);
  if (existingUser) {
    throw new Error("This email is already registered in offline mode.");
  }

  users.push({
    name,
    email,
    password,
    role: normalizedRole
  });
  saveMockUsers(users);

  return createOfflineSession({ name, email, role: normalizedRole });
}

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
      password
    });
    const session = normalizeLoginResponse(response.data, normalizedRole, email);
    saveAuthSession(session);
    return session;
  } catch (error) {
    if (isNetworkUnavailable(error)) {
      const offlineSession = tryOfflineLogin({ email, password, role });
      if (offlineSession) {
        saveAuthSession(offlineSession);
        return offlineSession;
      }
    }
    throw new Error(extractErrorMessage(error));
  }
}

export async function register({
  name,
  email,
  password,
  role = "student"
}) {
  try {
    const normalizedRole = normalizeRole(role);
    const endpoints = getRegisterEndpoints(normalizedRole);
    const response = await postToFirstAvailableEndpoint(endpoints, {
      name,
      email,
      password
    });

    try {
      const rawData = response.data ?? {};
      const session = normalizeLoginResponse(rawData, normalizedRole, email);
      saveAuthSession(session);
      return session;
    } catch {
      return await login({ email, password, role: normalizedRole });
    }
  } catch (error) {
    if (isNetworkUnavailable(error)) {
      const offlineSession = registerOfflineUser({ name, email, password, role });
      if (offlineSession) {
        saveAuthSession(offlineSession);
        return offlineSession;
      }
    }
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
