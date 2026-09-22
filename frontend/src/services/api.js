import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Fetches the ranked comfort scores from the backend.
// Pass the Auth0 access token so the backend can verify the request.

export async function fetchComfortScores(accessToken) {
  const response = await axios.get(`${API_BASE_URL}/comfort-scores`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  return response.data;
}

export async function fetchCacheStatus() {
  const response = await axios.get(`${API_BASE_URL}/cache-status`);
  return response.data;
}
