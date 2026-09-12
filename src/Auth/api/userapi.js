import axiosInstance from "../../api/axiosInstance";


export const getUserDashboard = async () => {
  const response = await axiosInstance.get("/auth/user/dashboard/");
  return response.data;
};
 
/* Navbar profile for both admin and user navbars */
export const getNavbarProfile = async () => {
  const response = await axiosInstance.get("/auth/navbar-profile/");
  return response.data;
};


export const postUserSpin = async () => {
  const response = await axiosInstance.post("/auth/user/spin/");
  return response.data;
};





/* -----------------------------
   Games
------------------------------*/

export const getGameCategories = async () => {
  const response = await axiosInstance.get(
    "/auth/user/game-categories/"
  );

  return response.data;
};

export const getGames = async (params = {}) => {
  const response = await axiosInstance.get(
    "/auth/user/games/",
    {
      params,
    }
  );

  return response.data;
};

export const getGameDetails = async (id) => {
  const response = await axiosInstance.get(
    `/auth/user/games/${id}/`
  );

  return response.data;
};

/* -----------------------------
   Booking
------------------------------*/

export const createBooking = async (data) => {
  const response = await axiosInstance.post(
    "/auth/user/bookings/create/",
    data
  );

  return response.data;
};

export const getBookings = async () => {
  const response = await axiosInstance.get(
    "/auth/user/bookings/"
  );

  return response.data;
};

export const getBookingDetails = async (id) => {
  const response = await axiosInstance.get(
    `/auth/user/bookings/${id}/`
  );

  return response.data;
};

export const getBookingHistory = async () => {
  const response = await axiosInstance.get(
    "/auth/user/bookings/history/"
  );

  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await axiosInstance.put(
    `/auth/user/bookings/${id}/cancel/`
  );

  return response.data;
};


export const getAvailableSlots = async (id, date) => {

    const response = await axiosInstance.get(
        `/auth/user/games/${id}/available-slots/`,
        {
            params: {
                date,
            },
        }
    );

    return response.data;

};







export const getUserBookingsWallet = async () => {
  const response = await axiosInstance.get("/auth/user/ticket-bookings/");
  return response.data;
};

export const cancelUserBooking = async (bookingId, reason = "") => {
  const response = await axiosInstance.post(`/auth/user/ticket-bookings/${bookingId}/cancel/`, {
    reason,
  });
  return response.data;
};



export const redeemLoyaltySlot = async (payload) => {
  const response = await axiosInstance.post(
    "/auth/user/loyalty/redeem-slot/",
    payload
  );
  return response.data;
};

export const getGameItemsForBooking = async () => {
  const response = await axiosInstance.get("/auth/user/gaming-items/");
  return response.data;
};



export const getUserLoyalty = async () => {
    const response = await axiosInstance.get(
        "/auth/user/loyalty-points/"
    );

    return response.data;
};


export const getAvailableGameSlots = async (itemId, date) => {

    const response = await axiosInstance.get(

        `/auth/user/gaming-items/${itemId}/available-slots/?date=${date}`

    );

    return response.data;

};









// ================================
// Exclusive Events
// ================================

export const getUpcomingEvents = async () => {
  const response = await axiosInstance.get(
    "/auth/user/events/"
  );

  return response.data;
};

export const bookEvent = async (eventId) => {
  const response = await axiosInstance.post(
    `/auth/user/events/${eventId}/book/`
  );

  return response.data;
};

// ================================
// Event Bookings
// ================================

export const getEventBookings = async () => {
  const response = await axiosInstance.get(
    "/auth/user/event-bookings/"
  );

  return response.data;
};

export const getUpcomingEventBookings = async () => {
  const response = await axiosInstance.get(
    "/auth/user/event-bookings/upcoming/"
  );

  return response.data;
};

export const getPreviousEventBookings = async () => {
  const response = await axiosInstance.get(
    "/auth/user/event-bookings/previous/"
  );

  return response.data;
};

export const cancelEventBooking = async (bookingId) => {
  const response = await axiosInstance.post(
    `/auth/user/event-bookings/${bookingId}/cancel/`
  );

  return response.data;
};







// ======================================
// Combo Packs
// ======================================

export const getComboPacks = async () => {
  const response = await axiosInstance.get("/auth/user/combo-packs/");
  return response.data;
};

export const getComboPackDetails = async (id) => {
  const response = await axiosInstance.get(`/auth/user/combo-packs/${id}/`);
  return response.data;
};

export const bookComboPack = async (payload) => {
  const response = await axiosInstance.post("/auth/user/combo-packs/book/", payload);
  return response.data;
};

export const getComboBookings = async () => {
  const response = await axiosInstance.get("/auth/user/combo-bookings/");
  return response.data;
};

export const getUpcomingComboBookings = async () => {
  const response = await axiosInstance.get("/auth/user/combo-bookings/upcoming/");
  return response.data;
};

export const getPreviousComboBookings = async () => {
  const response = await axiosInstance.get("/auth/user/combo-bookings/previous/");
  return response.data;
};

export const cancelComboBooking = async (bookingId) => {
  const response = await axiosInstance.post(`/auth/user/combo-bookings/${bookingId}/cancel/`);
  return response.data;
};

 
export const getUpcomingHappyHour = async () => {
  const response = await axiosInstance.get(
    "/auth/user/happy-hour/"
  );

  return response.data;
};
