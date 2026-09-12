import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {

  const token =
    localStorage.getItem("access_token");

  const role =
    localStorage.getItem("user_role");

  if (!token) {
    return (
      <Navigate
        to="/sign-in"
        replace
      />
    );
  }

  if (role !== "admin") {
    return (
      <Navigate
        to="/user/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}