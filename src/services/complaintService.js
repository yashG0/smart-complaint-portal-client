import apiClient, { extractErrorMessage } from "./api.js";

const COMPLAINT_LIST_ENDPOINTS = ["/complaints/my", "/complaints"];
const CREATE_COMPLAINT_ENDPOINTS = ["/complaints", "/complaints/create"];
const COMPLAINT_BY_ID_ENDPOINT = (complaintId) => `/complaints/${complaintId}`;

function shouldTryNextEndpoint(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405;
}

async function getFromFirstAvailableEndpoint(endpoints) {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      return await apiClient.get(endpoint);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextEndpoint(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No complaint API endpoint was available.");
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

  throw lastError ?? new Error("No complaint API endpoint was available.");
}

export async function getMyComplaints() {
  try {
    const response = await getFromFirstAvailableEndpoint(COMPLAINT_LIST_ENDPOINTS);
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function createComplaint(payload) {
  try {
    const response = await postToFirstAvailableEndpoint(
      CREATE_COMPLAINT_ENDPOINTS,
      payload
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getComplaintById(complaintId) {
  try {
    const response = await apiClient.get(COMPLAINT_BY_ID_ENDPOINT(complaintId));
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
