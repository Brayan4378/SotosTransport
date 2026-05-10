import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../lib/session'

export default function LoginPage() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState<'mensaje-positivo' | 'mensaje-negativo' | ''>('')

  const manejarLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const usuario = correo.trim().toLowerCase()
    const clave = password
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(usuario)

    if (!usuario || !clave) {
      setMensaje('Completa correo y contrasena.')
      setTipoMensaje('mensaje-negativo')
      return
    }

    if (!emailValido) {
      setMensaje('El correo electronico no tiene un formato valido.')
      setTipoMensaje('mensaje-negativo')
      return
    }

    if (clave.length < 8 || clave.length > 24) {
      setMensaje('La contrasena debe tener entre 8 y 24 caracteres.')
      setTipoMensaje('mensaje-negativo')
      return
    }

    const usuarioEncontrado = iniciarSesion(usuario, clave)

    if (!usuarioEncontrado) {
      setMensaje('Correo o contrasena incorrectos.')
      setTipoMensaje('mensaje-negativo')
      return
    }

    setMensaje(`Bienvenido ${usuarioEncontrado.usuario}.`)
    setTipoMensaje('mensaje-positivo')

    setTimeout(() => {
      navigate('/inicio', { replace: true })
    }, 1200)
  }

  return (
    <main className="login-container">
      <div className="login-box">
        <h1>Iniciar sesion</h1>
        <form id="FormularioLogin" onSubmit={manejarLogin}>
          <div className="campo">
            <label htmlFor="usuario">Correo electronico</label>
            <input
              id="usuario"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="Ingresa tu correo"
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
            />
          </div>

          <button type="submit">Iniciar sesion</button>
        </form>

        <button id="btnRegistrar" type="button" onClick={() => navigate('/registro')}>
          Registrarse
        </button>

        <p id="mensaje" className={tipoMensaje}>
          {mensaje}
        </p>
      </div>
    </main>
  )
}
