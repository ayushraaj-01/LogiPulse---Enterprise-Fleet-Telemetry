import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("logipulse_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/track")) {
        localStorage.removeItem("logipulse_token");
        localStorage.removeItem("logipulse_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
