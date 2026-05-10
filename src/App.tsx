import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { haySesionActiva } from './lib/session'
import ContactPage from './pages/ContactPage'
import DestinationsPage from './pages/DestinationsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OperationsPage from './pages/OperationsPage'
import ReservationsPage from './pages/ReservationsPage'
import RegisterPage from './pages/RegisterPage'
import SchedulesPage from './pages/SchedulesPage'
import UsersPage from './pages/UsersPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={haySesionActiva() ? <Navigate to="/inicio" replace /> : <LoginPage />} />
      <Route
        path="/registro"
        element={haySesionActiva() ? <Navigate to="/inicio" replace /> : <RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/destinos" element={<DestinationsPage />} />
          <Route path="/horarios" element={<SchedulesPage />} />
          <Route path="/reservas" element={<ReservationsPage />} />
          <Route path="/operaciones" element={<OperationsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
