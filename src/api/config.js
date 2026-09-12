// ============================================================
// config.js – single source of truth for the API base URL.
// All other api files import from here instead of reading
// import.meta.env directly.
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Root origin (no /api suffix) — for absolute media/image URLs
// the backend returns as relative paths (e.g. image.url).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')