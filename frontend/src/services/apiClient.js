import axios from "axios";
import { loadSession } from "./session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

/** The one Axios instance for the backend. Attaches the JWT to every request. */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let handleUnauthorized = () => {};

/** Called by AuthProvider so an expired or rejected token logs the user out. */
export function setUnauthorizedHandler(handler) {
  handleUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  const session = loadSession();
  if (session) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from login itself means bad credentials, not an expired session
    if (error.response?.status === 401 && error.config?.headers?.Authorization) handleUnauthorized();
    return Promise.reject(error);
  }
);

/** Turns an Axios error into a sentence the user can act on. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error.code === "ECONNABORTED") return "The request took too long. Please try again.";
  if (!error.response) return "Can't reach the server. Check your connection and try again.";
  return error.response.data?.message || fallback;
}

/** Machine-readable error code from the backend's ErrorResponse, e.g. CERTIFICATE_FETCH_FAILED. */
export function getErrorCode(error) {
  return error.response?.data?.code;
}

export default apiClient;
