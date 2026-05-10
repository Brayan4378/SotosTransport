import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { haySesionActiva } from '../lib/session'

export default function ProtectedRoute() {
  const location = useLocation()

  if (!haySesionActiva()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
