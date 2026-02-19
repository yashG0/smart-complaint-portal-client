import axios from "/node_modules/axios/dist/esm/axios.js";
import { API_CONFIG } from "../config/apiConfig.js";

const AUTH_TOKEN_KEY = "scp_access_token";

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeoutMs,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
