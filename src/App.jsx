import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageLoader from './Loader/PageLoader'
import LoaderErrorBoundary from './Loader/LoaderErrorBoundary'
import useNetworkStatus from './hooks/useNetworkStatus'
import PrivateRoute from './Auth/User/Privateroute'
import AdminRoute from './Auth/Admin/AdminRoute'
import './App.css'

// Kept eager: needed for first paint / always visible on every page
import Home from './components/home/Home'
import Footer from './components/Footer'
import HappyHourAllocation from './Auth/Admin/HappyHourAllocation'

// Public / Auth (lazy — no reason to ship these on the very first bundle)
const Games = lazy(() => import('./pages/Games'))
const InfiniteMenu = lazy(() => import('./pages/InfiniteMenu'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Enquiry = lazy(() => import('./pages/Enquiry'))
const Combo = lazy(() => import('./pages/Combo'))
const Events = lazy(() => import('./pages/Events'))
const AuthForm = lazy(() => import('./Auth/AuthForm'))
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword'))
const ProfileSettings = lazy(() => import('./Auth/ProfileSettings'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Contactus  = lazy(() => import('./pages/Contactus'))

// User
const UserDashboard = lazy(() => import('./Auth/User/UserDashboard'))
const UserProfileSettings = lazy(() => import('./Auth/User/UserProfileSettings'))
const GameItems = lazy(() => import('./Auth/User/Games/pages/GameItems'))
const GameDetails = lazy(() => import('./Auth/User/Games/pages/GameDetails'))
const CreateBooking = lazy(() => import('./Auth/User/Games/pages/CreateBooking'))
const UserBookings = lazy(() => import('./Auth/User/Bookings/user/Bookings'))
const BookingDetails = lazy(() => import('./Auth/User/Games/pages/BookingDetails'))
const BookingHistory = lazy(() => import('./Auth/User/Games/pages/BookingHistory'))
const MyBookings = lazy(() => import('./Auth/User/Games/pages/MyBookings'))
const Streaming = lazy(() => import('./Auth/User/Streaming/Streaming'))
const UserEvents = lazy(() => import('./Auth/User/Events/Events'))
const UserEventsMyBookings = lazy(() => import('./Auth/User/Events/MyBookings'))
const LoyaltySlotRedeemer = lazy(() => import('./Auth/User/Loyalty/LoyaltySlotRedeemer'))

const UserComboPacks = lazy(() => import('./Auth/User/Combos/ComboPacks'))
const MyComboBookings = lazy(() => import('./Auth/User/Combos/MyComboBookings'))
const UpcomingComboBookings = lazy(() => import('./Auth/User/Combos/UpcomingComboBookings'))
const PreviousComboBookings = lazy(() => import('./Auth/User/Combos/PreviousComboBookings'))

// Admin Core
const AdminDashboard = lazy(() => import('./Auth/Admin/AdminDashboard'))
const AdminCategories = lazy(() => import('./Auth/Admin/Categories'))
const AddCategory = lazy(() => import('./Auth/Admin/AddCategory'))
const AdminGames = lazy(() => import('./Auth/Admin/Games'))
const AddGame = lazy(() => import('./Auth/Admin/AddGame'))
const AdminComboPacks = lazy(() => import('./Auth/Admin/ComboPacks'))
const AddComboPack = lazy(() => import('./Auth/Admin/AddComboPack'))
const AdminEvents = lazy(() => import('./Auth/Admin/Events'))
const AddEvent = lazy(() => import('./Auth/Admin/AddEvent'))
const Users = lazy(() => import('./Auth/Admin/Users'))
const UserDetail = lazy(() => import('./Auth/Admin/UserDetail'))

// Admin Event Bookings
const EventBookings = lazy(() => import('./Auth/Admin/EventBookings'))
const AddEventBooking = lazy(() => import('./Auth/Admin/AddEventBooking'))
const EventBookingDetail = lazy(() => import('./Auth/Admin/EventBookingDetail'))
const VerifyEventQR = lazy(() => import('./Auth/Admin/VerifyEventQR'))

// Admin Bookings
const Bookings = lazy(() => import('./Auth/Admin/Bookings'))
const AddBooking = lazy(() => import('./Auth/Admin/AddBooking'))
const BookingDetail = lazy(() => import('./Auth/Admin/BookingDetail'))
const VerifyBookingQR = lazy(() => import('./Auth/Admin/VerifyBookingQR'))

// Admin Happy Hour
const HappyHourDashboard = lazy(() => import('./Auth/Admin/HappyHourDashboard'))
const HappyHourSlots = lazy(() => import('./Auth/Admin/HappyHourSlots'))
const AddHappyHourSlot = lazy(() => import('./Auth/Admin/AddHappyHourSlot'))
const HappyHourBookings = lazy(() => import('./Auth/Admin/HappyHourBookings'))
const AssignHappyHourGame = lazy(() => import('./Auth/Admin/AssignHappyHourGame'))
const VerifyHappyHour = lazy(() => import('./Auth/Admin/VerifyHappyHour'))

// Admin Spinner
const SpinnerRewards = lazy(() => import('./Auth/Admin/SpinnerRewards'))
const AddSpinnerReward = lazy(() => import('./Auth/Admin/AddSpinnerReward'))
const SpinnerSpins = lazy(() => import('./Auth/Admin/SpinnerSpins'))

// Admin Loyalty
const LoyaltyUsers = lazy(() => import('./Auth/Admin/LoyaltyUsers'))
const UserLoyaltyHistory = lazy(() => import('./Auth/Admin/UserLoyaltyHistory'))
const AdjustLoyalty = lazy(() => import('./Auth/Admin/AdjustLoyalty'))

// Admin Accounting
const AccountingDashboard = lazy(() => import('./Auth/Admin/AccountingDashboard'))
const RevenueChart = lazy(() => import('./Auth/Admin/RevenueChart'))
const AccountingBookings = lazy(() => import('./Auth/Admin/AccountingBookings'))
const ProfitLoss = lazy(() => import('./Auth/Admin/ProfitLoss'))
const AccountingReport = lazy(() => import('./Auth/Admin/AccountingReport'))

// Fallback for unknown/broken links — redirects straight to Home
const NotFoundRedirect = () => <Navigate to="/" replace />

const PublicPage = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">{children}</main>
    <Footer />
  </>
)

function App() {
  // Detects both "browser offline" and "backend unreachable / erroring".
  // Point this at a lightweight health-check endpoint on your Django backend,
  // e.g. GET /health/ returning {"status": "ok"}.
  const { isOffline } = useNetworkStatus({
    pingUrl: `${import.meta.env.VITE_API_BASE_URL}/health/`,
    pingInterval: 15000,
    pingTimeout: 5000,
  })

  return (
    <BrowserRouter>
      {/*
        LoaderErrorBoundary should catch chunk-load failures from lazy()
        (e.g. a stale deployment / offline network mid-navigation) and
        render a retry/fallback UI instead of a blank screen. If it currently
        just shows an error message, consider adding a "Go home" button
        inside it that does `window.location.assign('/')` as a hard fallback.
      */}
      <LoaderErrorBoundary>
        <Suspense fallback={<PageLoader isOffline={isOffline} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<PublicPage><Games /></PublicPage>} />
            <Route path="/streaming" element={<PublicPage><InfiniteMenu /></PublicPage>} />
            <Route path="/aboutus" element={<PublicPage><AboutUs /></PublicPage>} />
            <Route path="/enquiries" element={<PublicPage><Enquiry /></PublicPage>} />
            <Route path="/combo-packs" element={<PublicPage><Combo /></PublicPage>} />
            <Route path="/events" element={<PublicPage><Events /></PublicPage>} />
            <Route path="/privacy-policy" element={<PublicPage><PrivacyPolicy /></PublicPage>} />
            <Route path="/contact-us" element={<PublicPage><Contactus  /></PublicPage>} />

            <Route path="/sign-in" element={<AuthForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile-settings" element={<UserProfileSettings />} />

            <Route path="/user/game-items" element={<PrivateRoute><GameItems /></PrivateRoute>} />
            <Route path="/user/games/:id" element={<PrivateRoute><GameDetails /></PrivateRoute>} />
            <Route path="/user/games/:id/book" element={<PrivateRoute><CreateBooking /></PrivateRoute>} />
            <Route path="/user/new-bookings" element={<PrivateRoute><UserBookings /></PrivateRoute>} />
            <Route path="/user/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
            <Route path="/user/booking-history" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
            <Route path="/user/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
            <Route path="/user/streamings" element={<PrivateRoute><Streaming /></PrivateRoute>} />
            <Route path="/user/events" element={<PrivateRoute><UserEvents /></PrivateRoute>} />
            <Route path="/user/my-event-bookings" element={<PrivateRoute><UserEventsMyBookings /></PrivateRoute>} />
            <Route path="/user/claim-points" element={<PrivateRoute><LoyaltySlotRedeemer /></PrivateRoute>} />

            <Route path="/user/combo" element={<PrivateRoute><UserComboPacks /></PrivateRoute>} />
            <Route path="/user/combo-bookings" element={<PrivateRoute><MyComboBookings /></PrivateRoute>} />
            <Route path="/user/combo-bookings/upcoming" element={<PrivateRoute><UpcomingComboBookings /></PrivateRoute>} />
            <Route path="/user/combo-bookings/previous" element={<PrivateRoute><PreviousComboBookings /></PrivateRoute>} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/categories/add" element={<AddCategory />} />
              <Route path="/admin/games" element={<AdminGames />} />
              <Route path="/admin/games/add" element={<AddGame />} />
              <Route path="/admin/combo-packs" element={<AdminComboPacks />} />
              <Route path="/admin/combo-packs/add" element={<AddComboPack />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/add" element={<AddEvent />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />

              <Route path="/admin/event-bookings" element={<EventBookings />} />
              <Route path="/admin/event-bookings/add" element={<AddEventBooking />} />
              <Route path="/admin/event-bookings/:id" element={<EventBookingDetail />} />
              <Route path="/admin/event-bookings/verify-qr" element={<VerifyEventQR />} />

              <Route path="/admin/bookings" element={<Bookings />} />
              <Route path="/admin/bookings/add" element={<AddBooking />} />
              <Route path="/admin/bookings/:id" element={<BookingDetail />} />
              <Route path="/admin/bookings/verify" element={<VerifyBookingQR />} />

              <Route path="/admin/happy-hour" element={<HappyHourDashboard />} />
              <Route path="/admin/happy-hour-slots" element={<HappyHourSlots />} />
              <Route path="/admin/happy-hour-slots/add" element={<AddHappyHourSlot />} />
              <Route path="/admin/spinner-rewards" element={<SpinnerRewards />} />
              <Route path="/admin/spinner-rewards/add" element={<AddSpinnerReward />} />
              <Route path="/admin/happy-hour-bookings" element={<HappyHourBookings />} />
              <Route path="/admin/spinner-spins" element={<SpinnerSpins />} />
              <Route path="/admin/happy-hour-slot/:id/assign-game" element={<AssignHappyHourGame />} />
              <Route path="/admin/verify-happy-hour" element={<VerifyHappyHour />} />

              <Route path="/admin/loyalty" element={<LoyaltyUsers />} />
              <Route path="/admin/loyalty/:id" element={<UserLoyaltyHistory />} />
              <Route path="/admin/loyalty/:id/adjust" element={<AdjustLoyalty />} />

              <Route path="/admin/accounting" element={<AccountingDashboard />} />
              <Route path="/admin/accounting/chart" element={<RevenueChart />} />
              <Route path="/admin/accounting/bookings" element={<AccountingBookings />} />
              <Route path="/admin/accounting/profit-loss" element={<ProfitLoss />} />
              <Route path="/admin/accounting/report" element={<AccountingReport />} />

              <Route path="/edit-profile" element={<ProfileSettings />} />

              <Route path="/admin/happy-hour-slot-allocating" element={<HappyHourAllocation />} />

            </Route>

            {/* Catch-all: any unknown or broken link falls back to Home */}
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </Suspense>
      </LoaderErrorBoundary>
    </BrowserRouter>
  )
}

export default App