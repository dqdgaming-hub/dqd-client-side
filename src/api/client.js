// ============================================================
// client.js  –  Axios instance with JWT + social auth support
// ============================================================

import axios from 'axios'
import { API_BASE_URL } from './config'

// ── 1. Base instance ─────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// ── 2. Token helpers ─────────────────────────────────────────
// IMPORTANT: keys are "access_token" / "refresh_token"
// axiosInstance (legacy) must also use these same keys.

const TOKEN_KEY   = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const tokenStorage = {
  getAccess  : ()     => localStorage.getItem(TOKEN_KEY),
  getRefresh : ()     => localStorage.getItem(REFRESH_KEY),
  set        : (a, r) => {
    localStorage.setItem(TOKEN_KEY,   a)
    localStorage.setItem(REFRESH_KEY, r)
  },
  clear      : ()     => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ── 3. Request interceptor ────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    if (config._skipAuth) return config
    const token = tokenStorage.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── 4. Response interceptor – silent token refresh ────────────

let _isRefreshing = false
let _pendingQueue = []

const processQueue = (error, token = null) => {
  _pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  _pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/token/refresh/')
    ) {
      return Promise.reject(error)
    }

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _pendingQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
        .catch((e) => Promise.reject(e))
    }

    original._retry = true
    _isRefreshing   = true

    const refresh = tokenStorage.getRefresh()
    if (!refresh) {
      tokenStorage.clear()
      window.location.href = '/sign-in'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh },
        { _skipAuth: true },
      )
      tokenStorage.set(data.access, data.refresh ?? refresh)
      apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
      processQueue(null, data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStorage.clear()
      window.location.href = '/sign-in'
      return Promise.reject(refreshError)
    } finally {
      _isRefreshing = false
    }
  },
)

// ── 5. Auth API helpers ───────────────────────────────────────

export const authApi = {

  register: async (payload) => {
    const { data } = await apiClient.post('/auth/register/', payload, { _skipAuth: true })
    tokenStorage.set(data.access, data.refresh)
    apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
    return data
  },

  login: async (email, password) => {
  const { data } = await apiClient.post(
    "/auth/login/",
    { email, password },
    { _skipAuth: true }
  );

  tokenStorage.set(data.access, data.refresh);

  localStorage.setItem(
    "user_role",
    data.user.role
  );

  apiClient.defaults.headers.common.Authorization =
    `Bearer ${data.access}`;

  return data;
},

  logout: async () => {
  const refresh = tokenStorage.getRefresh();

  try {
    if (refresh) {
      await apiClient.post(
        "/auth/logout/",
        { refresh },
        { _skipAuth: true }
      );
    }
  } catch (e) {
    console.error(e);
  }

  localStorage.clear();
  sessionStorage.clear();

  delete apiClient.defaults.headers.common.Authorization;

  window.location.replace("/sign-in");
},

  refreshToken: () =>
    apiClient.post(
      '/auth/token/refresh/',
      { refresh: tokenStorage.getRefresh() },
      { _skipAuth: true },
    ),

  verifyToken: (token) =>
    apiClient.post('/auth/token/verify/', { token }, { _skipAuth: true }),

  changePassword: (old_password, new_password) =>
    apiClient.post('/auth/password/change/', { old_password, new_password }),

  requestPasswordReset: (email) =>
    apiClient.post('/auth/password/reset/', { email }, { _skipAuth: true }),

  confirmPasswordReset: (uid, token, new_password) =>
    apiClient.post(
      '/auth/password/reset/confirm/',
      { uid, token, new_password },
      { _skipAuth: true },
    ),

  // ── Google OAuth ──────────────────────────────────────────
  googleLogin: async (id_token) => {
    const { data } = await apiClient.post(
      '/auth/social/google/',
      { id_token },
      { _skipAuth: true },
    )
    tokenStorage.set(data.access, data.refresh)
    apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
    return data
  },

  facebookLogin: async (access_token) => {
    const { data } = await apiClient.post(
      '/auth/social/facebook/',
      { access_token },
      { _skipAuth: true },
    )
    tokenStorage.set(data.access, data.refresh)
    apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
    return data
  },

  getProfile    : ()     => apiClient.get('/auth/profile/'),
  updateProfile : (data) => apiClient.patch('/auth/profile/', data),

  verifyEmail: (uid, token) =>
    apiClient.post('/auth/email/verify/', { uid, token }, { _skipAuth: true }),

  resendVerification: (email) =>
    apiClient.post('/auth/email/resend/', { email }, { _skipAuth: true }),
}

export default apiClient


// ==============================
// TERMS & CONDITIONS
// ==============================

export const getTerms = async () => {
    const response = await apiClient.get("/auth/terms/");
    return response.data;
};

export const register = async (data) => {
    const response = await apiClient.post("/auth/register/", data);
    return response.data;
};