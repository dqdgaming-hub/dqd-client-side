import { Navigate, useLocation } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const location = useLocation()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return children
}