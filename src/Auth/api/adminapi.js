// // adminApi.js
// import { API_BASE_URL } from '../../api/config';

// const DEVICE_STORAGE_KEY = "dqd_device_id";

// /* Authentication storage */

// function getToken() {
//   return localStorage.getItem("access_token");
// }

// function getRole() {
//   return localStorage.getItem("user_role");
// }

// function getDeviceId() {
//   return localStorage.getItem(DEVICE_STORAGE_KEY);
// }

// function saveDeviceId(deviceId) {
//   if (deviceId) {
//     localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
//   }
// }

// function clearDeviceId() {
//   localStorage.removeItem(DEVICE_STORAGE_KEY);
// }

// function clearAuth() {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("user_role");
//   clearDeviceId();
// }

// /* Query builder */

// function buildQuery(params = {}) {
//   const cleanParams = Object.entries(params).reduce(
//     (result, [key, value]) => {
//       if (value !== undefined && value !== null && value !== "") {
//         result[key] = value;
//       }

//       return result;
//     },
//     {},
//   );

//   const query = new URLSearchParams(cleanParams).toString();
//   return query ? `?${query}` : "";
// }

// /* Error extraction — surfaces real DRF validation errors instead of
//    a generic "Request failed" message, e.g. "price: This field is required." */

// function extractErrorMessage(body, status) {
//   if (!body) return `Request failed with status ${status}.`;
//   if (typeof body === "string") return body;
//   if (body.detail) return body.detail;
//   if (body.message) return body.message;

//   if (typeof body === "object") {
//     const parts = Object.entries(body).map(([field, errors]) => {
//       const text = Array.isArray(errors) ? errors.join(" ") : String(errors);
//       return field === "non_field_errors" ? text : `${field}: ${text}`;
//     });
//     if (parts.length) return parts.join(" | ");
//   }

//   return `Request failed with status ${status}.`;
// }

// /* Base request */

// async function request(path, options = {}) {
//   const token = getToken();
//   const deviceId = getDeviceId();

//   const headers = {
//     ...(options.body ? { "Content-Type": "application/json" } : {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...(deviceId ? { "X-Device-ID": deviceId } : {}),
//     ...(options.headers || {}),
//   };

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers,
//   });

//   const contentType = response.headers.get("content-type") || "";
//   const isJson = contentType.includes("application/json");

//   const body = isJson
//     ? await response.json().catch(() => null)
//     : await response.text().catch(() => null);

//   if (response.status === 401) {
//     clearAuth();
//     window.location.replace("/sign-in");
//     return null;
//   }

//   /*
//    * Do not automatically sign out on every 403 response. A 403 can simply
//    * mean that the authenticated user lacks permission for one operation.
//    */
//   if (!response.ok) {
//     const error = new Error(extractErrorMessage(body, response.status));
//     error.status = response.status;
//     error.body = body;
//     throw error;
//   }

//   return response.status === 204 ? null : body;
// }

// /* Multipart request — for endpoints that accept file uploads (FormData).
//    Does NOT set Content-Type manually so the browser can attach the
//    correct multipart boundary. Reuses the same error-shape as request(). */

// async function requestMultipart(path, { method = "POST", formData } = {}) {
//   const token = getToken();
//   const deviceId = getDeviceId();

//   const headers = {
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...(deviceId ? { "X-Device-ID": deviceId } : {}),
//   };

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     method,
//     headers,
//     body: formData,
//   });

//   const contentType = response.headers.get("content-type") || "";
//   const isJson = contentType.includes("application/json");

//   const body = isJson
//     ? await response.json().catch(() => null)
//     : await response.text().catch(() => null);

//   if (response.status === 401) {
//     clearAuth();
//     window.location.replace("/sign-in");
//     return null;
//   }

//   if (!response.ok) {
//     const error = new Error(extractErrorMessage(body, response.status));
//     error.status = response.status;
//     error.body = body;
//     throw error;
//   }

//   return response.status === 204 ? null : body;
// }

// /* Dashboard */

// function getDashboard() {
//   return request("/auth/admin/dashboard/");
// }

// /* Navbar */

// function getNavbarProfile() {
//   return request("/auth/navbar-profile/");
// }

// /* Bookings */

// function getBookings(params = {}) {
//   return request(`/auth/admin/bookings/${buildQuery(params)}`);
// }

// function updateBookingStatus(bookingId, data) {
//   return request(`/auth/admin/bookings/${bookingId}/`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }



// /* Users */

// function getUsers(params = {}) {
//   return request(`/auth/admin/users/${buildQuery(params)}`);
// }

// function updateUserStatus(userId, isActive) {
//   return request(`/auth/admin/users/${userId}/`, {
//     method: "PATCH",
//     body: JSON.stringify({ is_active: isActive }),
//   });
// }

// /* Games
//    NOTE: createGame / updateGame take a FormData object (not a plain
//    object) because gaming items support an image upload. They use
//    requestMultipart so the browser sets the correct multipart boundary
//    instead of being JSON.stringify'd (which silently mangles FormData
//    and files). */

// function getGames(params = {}) {
//   return request(`/auth/admin/games/${buildQuery(params)}`);
// }

// function createGame(formData) {
//   return requestMultipart("/auth/admin/games/", {
//     method: "POST",
//     formData,
//   });
// }

// function updateGame(gameId, formData) {
//   return requestMultipart(`/auth/admin/games/${gameId}/`, {
//     method: "PUT",
//     formData,
//   });
// }

// function deleteGame(gameId) {
//   return request(`/auth/admin/games/${gameId}/`, { method: "DELETE" });
// }

// /* Categories
//    NOTE: createCategory / updateCategory take a FormData object (not a
//    plain object) because categories support an image upload. They use
//    requestMultipart so the browser sets the correct multipart boundary
//    instead of being JSON.stringify'd (which silently mangles FormData
//    and files). */

// function getCategories(params = {}) {
//   return request(`/auth/admin/categories/${buildQuery(params)}`);
// }

// function createCategory(formData) {
//   return requestMultipart("/auth/admin/categories/", {
//     method: "POST",
//     formData,
//   });
// }

// function updateCategory(categoryId, formData) {
//   return requestMultipart(`/auth/admin/categories/${categoryId}/`, {
//     method: "PUT",
//     formData,
//   });
// }

// function deleteCategory(categoryId) {
//   return request(`/auth/admin/categories/${categoryId}/`, { method: "DELETE" });
// }

// /* Combo packs */

// function getComboPacks(params = {}) {
//   return request(`/auth/admin/combo-packs/${buildQuery(params)}`);
// }

// function createComboPack(formData) {
//   return requestMultipart("/auth/admin/combo-packs/", {
//     method: "POST",
//     formData,
//   });
// }
 
// function updateComboPack(comboPackId, formData) {
//   return requestMultipart(`/auth/admin/combo-packs/${comboPackId}/`, {
//     method: "PUT",
//     formData,
//   });
// }

// function deleteComboPack(comboPackId) {
//   return request(`/auth/admin/combo-packs/${comboPackId}/`, { method: "DELETE" });
// }

// /* Events */

// function getEvents(params = {}) {
//   return request(`/auth/admin/events/${buildQuery(params)}`);
// }

// function createEvent(formData) {
//   return requestMultipart("/auth/admin/events/", {
//     method: "POST",
//     formData,
//   });
// }

// function updateEvent(eventId, formData) {
//   return requestMultipart(`/auth/admin/events/${eventId}/`, {
//     method: "PUT",
//     formData,
//   });
// }

// function deleteEvent(eventId) {
//   return request(`/auth/admin/events/${eventId}/`, {
//     method: "DELETE",
//   });
// }

// /* Reports */

// function getReports(params = {}) {
//   return request(`/auth/admin/reports/${buildQuery(params)}`);
// }

// /* Authentication */

// async function logout() {
//   const refreshToken = localStorage.getItem("refresh_token");

//   try {
//     if (refreshToken) {
//       await request("/auth/logout/", {
//         method: "POST",
//         body: JSON.stringify({ refresh: refreshToken }),
//       });
//     }
//   } catch {
//     // Local authentication must still be cleared.
//   } finally {
//     clearAuth();
//     window.location.replace("/sign-in");
//   }
// }




// function getAdminUsers(params = {}) {
//   return request(
//     `/auth/admin/users/${buildQuery(params)}`
//   );
// }

// function getAdminUserDetails(userId) {
//   return request(
//     `/auth/admin/users/${userId}/`
//   );
// }

// function updateAdminUserStatus(
//   userId,
//   isActive
// ) {
//   return request(
//     `/auth/admin/users/${userId}/status/`,
//     {
//       method: "PATCH",
//       body: JSON.stringify({
//         is_active: isActive,
//       }),
//     }
//   );
// }

// function deleteAdminUser(userId) {
//   return request(
//     `/auth/admin/users/${userId}/delete/`,
//     {
//       method: "DELETE",
//     }
//   );
// }




// function getEventBookings(params = {}) {
//   return request(
//     `/auth/admin/event-bookings/${buildQuery(params)}`
//   );
// }

// function getEventBookingDetails(id) {
//   return request(
//     `/auth/admin/event-bookings/${id}/`
//   );
// }

// function createEventBooking(data) {
//   return request(
//     "/auth/admin/event-bookings/",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }

// function approveEventBooking(id) {
//   return request(
//     `/auth/admin/event-bookings/${id}/approve/`,
//     {
//       method: "POST",
//     }
//   );
// }

// function rejectEventBooking(id) {
//   return request(
//     `/auth/admin/event-bookings/${id}/reject/`,
//     {
//       method: "POST",
//     }
//   );
// }

// function verifyEventQR(qrToken) {
//   return request(
//     "/auth/admin/event-bookings/verify-qr/",
//     {
//       method: "POST",
//       body: JSON.stringify({
//         qr_token: qrToken,
//       }),
//     }
//   );
// }






// // ======================================================
// // BOOKINGS
// // ======================================================

// function getgameBookings() {
//   return request(
//     "/auth/admin/game-bookings/"
//   );
// }

// function getGameBookings() {
//   return request(
//     "/auth/admin/bookings/game-items/"
//   );
// }

// function getComboBookings() {
//   return request(
//     "/auth/admin/bookings/combo-packs/"
//   );
// }

// function getBooking(id) {
//   return request(
//     `/auth/admin/bookings/${id}/`
//   );
// }

// function createBooking(data) {
//   return request(
//     "/auth/admin/game-bookings/",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }

// function approveBooking(id) {
//   return request(
//     `/auth/admin/bookings/${id}/approve/`,
//     {
//       method: "POST",
//     }
//   );
// }

// function rejectBooking(id) {
//   return request(
//     `/auth/admin/bookings/${id}/reject/`,
//     {
//       method: "POST",
//     }
//   );
// }

// function verifyBookingQR(qr_token) {
//   return request(
//     "/auth/admin/bookings/verify-qr/",
//     {
//       method: "POST",
//       body: JSON.stringify({
//         qr_token,
//       }),
//     }
//   );
// }






// function getGamingItems() {
//   return request(
//     "/auth/admin/games/"
//   );
// }


// function getCombos() {
//   return request(
//     "/auth/admin/combo-packs/"
//   );
// }






// function getHappyHourSlots() {
//   return request(
//     "/auth/admin/happy-hour-slots/"
//   );
// }

// function createHappyHourSlot(data) {
//   return request(
//     "/auth/admin/happy-hour-slots/",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }

// function getSpinnerRewards() {
//   return request(
//     "/auth/admin/spinner-rewards/"
//   );
// }

// function createSpinnerReward(data) {
//   return request(
//     "/auth/admin/spinner-rewards/",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }

// function getHappyHourBookings() {
//   return request(
//     "/auth/admin/happy-hour-bookings/"
//   );
// }

// function getSpinnerSpins() {
//   return request(
//     "/auth/admin/spinner-spins/"
//   );
// }

// function assignHappyHourGame(
//   slotId,
//   data
// ) {
//   return request(
//     `/auth/admin/happy-hour-slots/${slotId}/assign-game/`,
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }

// function verifyHappyHour(data) {
//   return request(
//     "/auth/admin/verify-happy-hour/",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }






// function getLoyaltyUsers() {
//   return request(
//     "/auth/admin/loyalty/users/"
//   );
// }

// function getUserLoyaltyHistory(userId) {
//   return request(
//     `/auth/admin/loyalty/users/${userId}/history/`
//   );
// }

// function adjustUserLoyalty(userId, data) {
//   return request(
//     `/auth/admin/loyalty/users/${userId}/adjust/`,
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//     }
//   );
// }









// // ==========================================================
// // ACCOUNTING
// // ==========================================================

// function getAccountingDashboard(params = {}) {
//   return request(
//     `/auth/admin/accounting/dashboard/${buildQuery(params)}`
//   );
// }

// function getRevenueChart(params = {}) {
//   return request(
//     `/auth/admin/accounting/revenue-chart/${buildQuery(params)}`
//   );
// }

// function getAccountingBookings(params = {}) {
//   return request(
//     `/auth/admin/accounting/bookings/${buildQuery(params)}`
//   );
// }

// function getProfitLoss(params = {}) {
//   return request(
//     `/auth/admin/accounting/profit-loss/${buildQuery(params)}`
//   );
// }

// async function exportAccountingPDF(params = {}) {

//     const token = getToken();

//     const deviceId = getDeviceId();

//     const response = await fetch(
//         `${API_BASE_URL}/auth/admin/accounting/export/pdf/${buildQuery(params)}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 ...(deviceId
//                     ? { "X-Device-ID": deviceId }
//                     : {}),
//             },
//         }
//     );

//     if (!response.ok) {
//         throw new Error("Failed to download PDF");
//     }

//     return await response.blob();
// }

// async function exportAccountingExcel(params = {}) {

//     const token = getToken();

//     const deviceId = getDeviceId();

//     const response = await fetch(
//         `${API_BASE_URL}/auth/admin/accounting/export/excel/${buildQuery(params)}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 ...(deviceId
//                     ? { "X-Device-ID": deviceId }
//                     : {}),
//             },
//         }
//     );

//     if (!response.ok) {
//         throw new Error("Failed to download Excel");
//     }

//     return await response.blob();
// }

// function syncAccountingGoogleSheet() {
//   return request(
//     "/auth/admin/accounting/google-sheet/",
//     {
//       method: "POST",
//     }
//   );
// }













// // edit profile
// function getProfile() {
//     return request(
//         "/auth/profile/"
//     );
// }

// function updateProfile(formData) {
//   return requestMultipart("/auth/profile/", {
//     method: "PATCH",
//     formData,
//   });
// }






// function changePassword(data) {

//     return request(
//         "/auth/profile/change-password/",
//         {
//             method: "POST",
//             body: JSON.stringify(data),
//         }
//     );

// }


// export const adminApi = {
//   getToken,
//   getRole,
//   getDeviceId,
//   saveDeviceId,
//   clearDeviceId,
//   clearAuth,
//   logout,

//   getNavbarProfile,
//   getDashboard,

//   getBookings,
//   updateBookingStatus,

//   getUsers,
//   updateUserStatus,

//   getCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,

//   getGames,
//   createGame,
//   updateGame,
//   deleteGame,

//   getComboPacks,
//   createComboPack,
//   updateComboPack,
//   deleteComboPack,

//   getEvents,
//   createEvent,
//   updateEvent,
//   deleteEvent,

//   getReports,

// getAdminUsers,
// getAdminUserDetails,
// updateAdminUserStatus,
// deleteAdminUser,


// getEventBookings,
// getEventBookingDetails,
// createEventBooking,
// approveEventBooking,
// rejectEventBooking,
// verifyEventQR,



//   getBookings,
//   getGameBookings,
//   getgameBookings,
//   getComboBookings,

//   getBooking,
//   createBooking,

//   approveBooking,
//   rejectBooking,

//   verifyBookingQR,
// getGamingItems,
// getCombos,


//   getHappyHourSlots,
//   createHappyHourSlot,
//   getSpinnerRewards,
//   createSpinnerReward,
//   getHappyHourBookings,
//   getSpinnerSpins,
//   assignHappyHourGame,
//   verifyHappyHour,



//    getLoyaltyUsers,
//   getUserLoyaltyHistory,
//   adjustUserLoyalty,



// getAccountingDashboard,
// getRevenueChart,
// getAccountingBookings,
// getProfitLoss,
// exportAccountingPDF,
// exportAccountingExcel,
// syncAccountingGoogleSheet,


// getProfile,
// updateProfile,
// changePassword,

// };









// adminApi.js
import { API_BASE_URL } from '../../api/config';

const DEVICE_STORAGE_KEY = "dqd_device_id";

/* ── Auth storage ─────────────────────────────────────────────────────────── */

function getToken()               { return localStorage.getItem("access_token"); }
function getRole()                { return localStorage.getItem("user_role"); }
function getDeviceId()            { return localStorage.getItem(DEVICE_STORAGE_KEY); }
function saveDeviceId(deviceId)   { if (deviceId) localStorage.setItem(DEVICE_STORAGE_KEY, deviceId); }
function clearDeviceId()          { localStorage.removeItem(DEVICE_STORAGE_KEY); }

function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  clearDeviceId();
}

/* ── Query builder ────────────────────────────────────────────────────────── */

function buildQuery(params = {}) {
  const clean = Object.entries(params).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== "") acc[k] = v;
    return acc;
  }, {});
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

/* ── Error extraction ─────────────────────────────────────────────────────── */

function extractErrorMessage(body, status) {
  if (!body) return `Request failed with status ${status}.`;
  if (typeof body === "string") return body;
  if (body.detail)  return body.detail;
  if (body.message) return body.message;
  if (typeof body === "object") {
    const parts = Object.entries(body).map(([field, errors]) => {
      const text = Array.isArray(errors) ? errors.join(" ") : String(errors);
      return field === "non_field_errors" ? text : `${field}: ${text}`;
    });
    if (parts.length) return parts.join(" | ");
  }
  return `Request failed with status ${status}.`;
}

/* ── Base request (JSON) ──────────────────────────────────────────────────── */

async function request(path, options = {}) {
  const token    = getToken();
  const deviceId = getDeviceId();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token    ? { Authorization: `Bearer ${token}` }  : {}),
    ...(deviceId ? { "X-Device-ID": deviceId }           : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  const contentType = response.headers.get("content-type") || "";
  const isJson      = contentType.includes("application/json");
  const body        = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (response.status === 401) {
    clearAuth();
    window.location.replace("/sign-in");
    return null;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(body, response.status));
    error.status = response.status;
    error.body   = body;          // ← body lives here, NOT on .response.data
    throw error;
  }

  return response.status === 204 ? null : body;
}

/* ── Multipart request (FormData / file uploads) ──────────────────────────── */
/* Does NOT set Content-Type so the browser can attach the correct boundary.  */

async function requestMultipart(path, { method = "POST", formData } = {}) {
  const token    = getToken();
  const deviceId = getDeviceId();

  const headers = {
    ...(token    ? { Authorization: `Bearer ${token}` } : {}),
    ...(deviceId ? { "X-Device-ID": deviceId }          : {}),
    // ← NO Content-Type here — browser sets multipart/form-data + boundary
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson      = contentType.includes("application/json");
  const body        = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (response.status === 401) {
    clearAuth();
    window.location.replace("/sign-in");
    return null;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(body, response.status));
    error.status = response.status;
    error.body   = body;
    throw error;
  }

  return response.status === 204 ? null : body;
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */

function getDashboard()     { return request("/auth/admin/dashboard/"); }
function getNavbarProfile() { return request("/auth/navbar-profile/"); }

/* ── Bookings ─────────────────────────────────────────────────────────────── */

function getBookings(params = {})             { return request(`/auth/admin/bookings/${buildQuery(params)}`); }
function updateBookingStatus(bookingId, data) { return request(`/auth/admin/bookings/${bookingId}/`, { method: "PATCH", body: JSON.stringify(data) }); }

/* ── Users ────────────────────────────────────────────────────────────────── */

function getUsers(params = {})              { return request(`/auth/admin/users/${buildQuery(params)}`); }
function updateUserStatus(userId, isActive) { return request(`/auth/admin/users/${userId}/`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) }); }

/* ── Games ────────────────────────────────────────────────────────────────── */

function getGames(params = {})          { return request(`/auth/admin/games/${buildQuery(params)}`); }
function createGame(formData)           { return requestMultipart("/auth/admin/games/", { method: "POST", formData }); }
function updateGame(gameId, formData)   { return requestMultipart(`/auth/admin/games/${gameId}/`, { method: "PUT", formData }); }
function deleteGame(gameId)             { return request(`/auth/admin/games/${gameId}/`, { method: "DELETE" }); }

/* ── Categories ───────────────────────────────────────────────────────────── */

function getCategories(params = {})              { return request(`/auth/admin/categories/${buildQuery(params)}`); }
function createCategory(formData)                { return requestMultipart("/auth/admin/categories/", { method: "POST", formData }); }
function updateCategory(categoryId, formData)    { return requestMultipart(`/auth/admin/categories/${categoryId}/`, { method: "PUT", formData }); }
function deleteCategory(categoryId)              { return request(`/auth/admin/categories/${categoryId}/`, { method: "DELETE" }); }

/* ── Combo packs ──────────────────────────────────────────────────────────── */

function getComboPacks(params = {})              { return request(`/auth/admin/combo-packs/${buildQuery(params)}`); }
function createComboPack(formData)               { return requestMultipart("/auth/admin/combo-packs/", { method: "POST", formData }); }
function updateComboPack(comboPackId, formData)  { return requestMultipart(`/auth/admin/combo-packs/${comboPackId}/`, { method: "PUT", formData }); }
function deleteComboPack(comboPackId)            { return request(`/auth/admin/combo-packs/${comboPackId}/`, { method: "DELETE" }); }

/* ── Events ───────────────────────────────────────────────────────────────── */

function getEvents(params = {})          { return request(`/auth/admin/events/${buildQuery(params)}`); }
function createEvent(formData)           { return requestMultipart("/auth/admin/events/", { method: "POST", formData }); }
function updateEvent(eventId, formData)  { return requestMultipart(`/auth/admin/events/${eventId}/`, { method: "PUT", formData }); }
function deleteEvent(eventId)            { return request(`/auth/admin/events/${eventId}/`, { method: "DELETE" }); }

/* ── Reports ──────────────────────────────────────────────────────────────── */

function getReports(params = {}) { return request(`/auth/admin/reports/${buildQuery(params)}`); }

/* ── Admin users ──────────────────────────────────────────────────────────── */

function getAdminUsers(params = {})             { return request(`/auth/admin/users/${buildQuery(params)}`); }
function getAdminUserDetails(userId)            { return request(`/auth/admin/users/${userId}/`); }
function updateAdminUserStatus(userId, isActive){ return request(`/auth/admin/users/${userId}/status/`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) }); }
function deleteAdminUser(userId)                { return request(`/auth/admin/users/${userId}/delete/`, { method: "DELETE" }); }

/* ── Event bookings ───────────────────────────────────────────────────────── */

function getEventBookings(params = {})  { return request(`/auth/admin/event-bookings/${buildQuery(params)}`); }
function getEventBookingDetails(id)     { return request(`/auth/admin/event-bookings/${id}/`); }
function createEventBooking(data)       { return request("/auth/admin/event-bookings/", { method: "POST", body: JSON.stringify(data) }); }
function approveEventBooking(id)        { return request(`/auth/admin/event-bookings/${id}/approve/`, { method: "POST" }); }
function rejectEventBooking(id)         { return request(`/auth/admin/event-bookings/${id}/reject/`, { method: "POST" }); }
function verifyEventQR(qrToken)         { return request("/auth/admin/event-bookings/verify-qr/", { method: "POST", body: JSON.stringify({ qr_token: qrToken }) }); }

/* ── Game bookings ────────────────────────────────────────────────────────── */

function getgameBookings()   { return request("/auth/admin/game-bookings/"); }
function getGameBookings()   { return request("/auth/admin/bookings/game-items/"); }
function getComboBookings()  { return request("/auth/admin/bookings/combo-packs/"); }
function getBooking(id)      { return request(`/auth/admin/bookings/${id}/`); }
function createBooking(data) { return request("/auth/admin/game-bookings/", { method: "POST", body: JSON.stringify(data) }); }
function approveBooking(id)  { return request(`/auth/admin/bookings/${id}/approve/`, { method: "POST" }); }
function rejectBooking(id)   { return request(`/auth/admin/bookings/${id}/reject/`, { method: "POST" }); }
function verifyBookingQR(qr_token) { return request("/auth/admin/bookings/verify-qr/", { method: "POST", body: JSON.stringify({ qr_token }) }); }

function getGamingItems() { return request("/auth/admin/games/"); }
function getCombos()      { return request("/auth/admin/combo-packs/"); }

/* ── Happy hour & spinner ─────────────────────────────────────────────────── */

function getHappyHourSlots()             { return request("/auth/admin/happy-hour-slots/"); }
function createHappyHourSlot(data)       { return request("/auth/admin/happy-hour-slots/", { method: "POST", body: JSON.stringify(data) }); }
function getSpinnerRewards()             { return request("/auth/admin/spinner-rewards/"); }
function createSpinnerReward(data)       { return request("/auth/admin/spinner-rewards/", { method: "POST", body: JSON.stringify(data) }); }
function getHappyHourBookings()          { return request("/auth/admin/happy-hour-bookings/"); }
function getSpinnerSpins()               { return request("/auth/admin/spinner-spins/"); }
function assignHappyHourGame(slotId, data) { return request(`/auth/admin/happy-hour-slots/${slotId}/assign-game/`, { method: "POST", body: JSON.stringify(data) }); }
function verifyHappyHour(data)           { return request("/auth/admin/verify-happy-hour/", { method: "POST", body: JSON.stringify(data) }); }

/* ── Loyalty ──────────────────────────────────────────────────────────────── */

function getLoyaltyUsers()                    { return request("/auth/admin/loyalty/users/"); }
function getUserLoyaltyHistory(userId)        { return request(`/auth/admin/loyalty/users/${userId}/history/`); }
function adjustUserLoyalty(userId, data)      { return request(`/auth/admin/loyalty/users/${userId}/adjust/`, { method: "POST", body: JSON.stringify(data) }); }

/* ── Accounting ───────────────────────────────────────────────────────────── */

function getAccountingDashboard(params = {})  { return request(`/auth/admin/accounting/dashboard/${buildQuery(params)}`); }
function getRevenueChart(params = {})         { return request(`/auth/admin/accounting/revenue-chart/${buildQuery(params)}`); }
function getAccountingBookings(params = {})   { return request(`/auth/admin/accounting/bookings/${buildQuery(params)}`); }
function getProfitLoss(params = {})           { return request(`/auth/admin/accounting/profit-loss/${buildQuery(params)}`); }
function syncAccountingGoogleSheet()          { return request("/auth/admin/accounting/google-sheet/", { method: "POST" }); }

async function exportAccountingPDF(params = {}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/admin/accounting/export/pdf/${buildQuery(params)}`,
    { headers: { Authorization: `Bearer ${getToken()}`, ...(getDeviceId() ? { "X-Device-ID": getDeviceId() } : {}) } }
  );
  if (!response.ok) throw new Error("Failed to download PDF");
  return response.blob();
}

async function exportAccountingExcel(params = {}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/admin/accounting/export/excel/${buildQuery(params)}`,
    { headers: { Authorization: `Bearer ${getToken()}`, ...(getDeviceId() ? { "X-Device-ID": getDeviceId() } : {}) } }
  );
  if (!response.ok) throw new Error("Failed to download Excel");
  return response.blob();
}

/* ── Authentication ───────────────────────────────────────────────────────── */

async function logout() {
  const refreshToken = localStorage.getItem("refresh_token");
  try {
    if (refreshToken) {
      await request("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh: refreshToken }) });
    }
  } catch {
    // Local auth must still be cleared even if the server call fails.
  } finally {
    clearAuth();
    window.location.replace("/sign-in");
  }
}

/* ── Profile ──────────────────────────────────────────────────────────────── */
/*
 * getProfile  → request() returns the parsed body directly (no .data wrapper)
 * updateProfile → uses requestMultipart with PATCH so the browser sets the
 *                 correct multipart/form-data boundary automatically.
 *                 Never pass Content-Type manually — it breaks file uploads.
 */

function getProfile() {
  return request("/auth/profile/");
}

function updateProfile(formData) {
  return requestMultipart("/auth/profile/", {
    method: "PATCH",
    formData,
  });
}

function changePassword(data) {
  return request("/auth/profile/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}




/* ── Happy Hour Allocation Management ─────────────────────────────────────── */

function fetchHappyHourAllocations(params = {}) {
  return request(
    `/auth/admin/happy-hour-allocations/${buildQuery(params)}`
  );
}

function fetchHappyHourAllocationDetails(allocationId) {
  return request(
    `/auth/admin/happy-hour-allocations/${allocationId}/`
  );
}

function addHappyHourAllocation(data) {
  return request(
    "/auth/admin/happy-hour-allocations/",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

function editHappyHourAllocation(allocationId, data) {
  return request(
    `/auth/admin/happy-hour-allocations/${allocationId}/`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

function updateHappyHourAllocation(allocationId, data) {
  return request(
    `/auth/admin/happy-hour-allocations/${allocationId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

function removeHappyHourAllocation(allocationId) {
  return request(
    `/auth/admin/happy-hour-allocations/${allocationId}/`,
    {
      method: "DELETE",
    }
  );
}


/* ── Exports ──────────────────────────────────────────────────────────────── */

export const adminApi = {
  getToken, getRole, getDeviceId, saveDeviceId, clearDeviceId, clearAuth, logout,

  getNavbarProfile,
  getDashboard,

  getBookings, updateBookingStatus,
  getUsers, updateUserStatus,

  getCategories, createCategory, updateCategory, deleteCategory,
  getGames,      createGame,     updateGame,     deleteGame,
  getComboPacks, createComboPack,updateComboPack,deleteComboPack,
  getEvents,     createEvent,    updateEvent,    deleteEvent,

  getReports,

  getAdminUsers, getAdminUserDetails, updateAdminUserStatus, deleteAdminUser,

  getEventBookings, getEventBookingDetails, createEventBooking,
  approveEventBooking, rejectEventBooking, verifyEventQR,

  getBookings, getGameBookings, getgameBookings, getComboBookings,
  getBooking, createBooking, approveBooking, rejectBooking, verifyBookingQR,
  getGamingItems, getCombos,

  getHappyHourSlots, createHappyHourSlot,
  getSpinnerRewards, createSpinnerReward,
  getHappyHourBookings, getSpinnerSpins,
  assignHappyHourGame, verifyHappyHour,

  getLoyaltyUsers, getUserLoyaltyHistory, adjustUserLoyalty,

  getAccountingDashboard, getRevenueChart, getAccountingBookings, getProfitLoss,
  exportAccountingPDF, exportAccountingExcel, syncAccountingGoogleSheet,

  getProfile,
  updateProfile,
  changePassword,




  // ── Happy Hour Allocation ──
  fetchHappyHourAllocations,
  fetchHappyHourAllocationDetails,
  addHappyHourAllocation,
  editHappyHourAllocation,
  updateHappyHourAllocation,
  removeHappyHourAllocation,
};



