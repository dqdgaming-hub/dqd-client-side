// ============================================================
// axiosInstance.js
// Thin axios wrapper used by non-auth API calls (e.g. dashboard).
// Base URL now comes from config.js — single source of truth.
// ============================================================

import axios from "axios";
import { API_BASE_URL, API_ORIGIN } from "./config";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Silent refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        window.location.href = "/sign-in";
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh,
        });
        localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  },
);

// kept for backward compat — derived from the same source as everything else now
export const API_URL = API_ORIGIN;

export default axiosInstance;