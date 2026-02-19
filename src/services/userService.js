import apiClient, { extractErrorMessage } from "./api.js";

const MY_PROFILE_ENDPOINT = "/users/me";

export async function getMyProfile() {
  try {
    const response = await apiClient.get(MY_PROFILE_ENDPOINT);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function updateMyProfile(payload) {
  try {
    const response = await apiClient.patch(MY_PROFILE_ENDPOINT, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
