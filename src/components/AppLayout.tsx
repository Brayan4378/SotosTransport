import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../../imagenes/logo.png'
import {
  cerrarSesion,
  esAdministrador,
  obtenerUsuarioActivo,
  USERS_UPDATED_EVENT,
} from '../lib/session'

const enlaces = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/destinos', label: 'Destinos' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/reservas', label: 'Reservar' },
  { to: '/operaciones', label: 'Operaciones' },
  { to: '/usuarios', label: 'Usuarios' },
  { to: '/contacto', label: 'Contacto' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuarioActivo, setUsuarioActivo] = useState(obtenerUsuarioActivo())

  useEffect(() => {
    const sincronizarSesion = () => {
      setUsuarioActivo(obtenerUsuarioActivo())
    }

    window.addEventListener('storage', sincronizarSesion)
    window.addEventListener(USERS_UPDATED_EVENT, sincronizarSesion)

    return () => {
      window.removeEventListener('storage', sincronizarSesion)
      window.removeEventListener(USERS_UPDATED_EVENT, sincronizarSesion)
    }
  }, [])

  const nombreUsuario = useMemo(() => usuarioActivo?.usuario ?? 'Cuenta Soto', [usuarioActivo])
  const rolUsuario = useMemo(
    () => (esAdministrador(usuarioActivo) ? 'Administrador' : 'Cliente'),
    [usuarioActivo]
  )
  const enlacesVisibles = useMemo(
    () => enlaces.filter((enlace) => (enlace.to === '/usuarios' ? esAdministrador(usuarioActivo) : true)),
    [usuarioActivo]
  )

  const manejarCerrarSesion = () => {
    cerrarSesion()
    setMenuAbierto(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <NavLink to="/inicio" className="brand">
          <img src={logo} alt="Soto's Transport" className="brand-logo" />
          <div>
            <strong>Soto&apos;s Transport</strong>
            <span>Rutas terrestres desde Armenia</span>
          </div>
        </NavLink>

        <nav className="topnav">
          {enlacesVisibles.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-menu">
          <button
            type="button"
            className="user-trigger"
            onClick={() => setMenuAbierto((valorActual) => !valorActual)}
          >
            {nombreUsuario}
          </button>

          {menuAbierto ? (
            <div className="user-dropdown">
              <p className="user-label">Sesion activa</p>
              <strong>{usuarioActivo?.usuario ?? 'Usuario'}</strong>
              <span>{rolUsuario}</span>
              <span>{usuarioActivo?.email ?? 'Sin correo'}</span>
              <button type="button" className="secondary-button" onClick={manejarCerrarSesion}>
                Cerrar sesion
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <Outlet />
    </div>
  )
}
