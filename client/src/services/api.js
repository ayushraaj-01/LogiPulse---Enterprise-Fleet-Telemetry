import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050";

// Remove trailing slash if present
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("logipulse_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      const isPublicPage =
        currentPath.includes("/login") ||
        currentPath.includes("/track");

      if (!isPublicPage) {
        localStorage.removeItem("logipulse_token");
        localStorage.removeItem("logipulse_user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;