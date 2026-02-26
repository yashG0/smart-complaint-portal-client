import apiClient, { extractErrorMessage } from "./api.js";

const ALL_COMPLAINTS_ENDPOINTS = ["/complaints"];
const ASSIGN_COMPLAINT_ENDPOINTS = (complaintId) => `/complaints/${complaintId}/assign`;
const COMPLAINT_STATUS_ENDPOINT = (complaintId) => `/complaints/${complaintId}/status`;
const DEPARTMENT_LIST_ENDPOINTS = ["/departments"];

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

  throw lastError ?? new Error("No API endpoint was available.");
}

export async function getAllComplaints() {
  try {
    const response = await getFromFirstAvailableEndpoint(ALL_COMPLAINTS_ENDPOINTS);
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getDepartments() {
  try {
    const response = await getFromFirstAvailableEndpoint(DEPARTMENT_LIST_ENDPOINTS);
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function assignComplaintToDepartment(complaintId, departmentId) {
  try {
    const response = await apiClient.patch(ASSIGN_COMPLAINT_ENDPOINTS(complaintId), {
      department_id: departmentId
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function updateComplaintStatusAsAdmin(complaintId, status) {
  try {
    const response = await apiClient.patch(COMPLAINT_STATUS_ENDPOINT(complaintId), {
      status
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getComplaintStats(complaints) {
  return {
    total: complaints.length,
    pending: complaints.filter(c => ["pending"].includes(String(c.status).toLowerCase())).length,
    assigned: complaints.filter(c => ["assigned"].includes(String(c.status).toLowerCase())).length,
    inProgress: complaints.filter(c => ["in_progress"].includes(String(c.status).toLowerCase())).length,
    resolved: complaints.filter(c => ["resolved"].includes(String(c.status).toLowerCase())).length,
    escalated: complaints.filter(c => ["escalated"].includes(String(c.status).toLowerCase())).length
  };
}
