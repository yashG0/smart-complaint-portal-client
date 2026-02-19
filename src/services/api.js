import { API_CONFIG } from "../config/apiConfig.js";

const AUTH_TOKEN_KEY = "scp_access_token";

function buildHeaders(customHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders
  };

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(method, url, payload, config = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  const fullUrl = `${API_CONFIG.baseURL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: buildHeaders(config.headers),
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal
    });

    let data = null;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const error = new Error(data?.detail ?? data?.message ?? "Request failed");
      error.response = { status: response.status, data };
      throw error;
    }

    return { data };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const apiClient = {
  get(url, config) {
    return request("GET", url, null, config);
  },
  post(url, payload, config) {
    return request("POST", url, payload, config);
  }
};

export function extractErrorMessage(error) {
  if (error?.response?.data?.detail) {
    return String(error.response.data.detail);
  }

  if (error?.response?.data?.message) {
    return String(error.response.data.message);
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default apiClient;
